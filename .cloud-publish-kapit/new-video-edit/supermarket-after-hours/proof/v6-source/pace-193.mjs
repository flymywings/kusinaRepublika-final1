import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const proofDir = path.join(root, 'proof');
const rate = 48000;
const thresholdDb = -35;
const minQuietSeconds = .15;
const guardSamples = 480; // retain 10 ms unwarped at each speech edge
const sourceWavPath = path.join(publicDir, 'voice.wav');
const sourceWav = fs.readFileSync(sourceWavPath);
let dataOffset = 12, sourceDataOffset = -1, sourceDataBytes = 0;
while (dataOffset + 8 <= sourceWav.length) {
  const tag = sourceWav.toString('ascii', dataOffset, dataOffset + 4);
  const size = sourceWav.readUInt32LE(dataOffset + 4);
  if (tag === 'data') { sourceDataOffset = dataOffset + 8; sourceDataBytes = size; break; }
  dataOffset += 8 + size + (size & 1);
}
if (sourceDataOffset < 0 || sourceDataBytes % 2) throw new Error('Could not locate mono PCM data chunk');
const sourceSamples = sourceDataBytes / 2;
const sourcePcm = sourceWav.subarray(sourceDataOffset, sourceDataOffset + sourceDataBytes);
const sourceAudioSeconds = sourceSamples / rate;
const sourceExportSeconds = 53;
const tailSeconds = sourceExportSeconds - sourceAudioSeconds;
const targetAudioSeconds = 145 * 60 / 193;
const targetSamples = Math.round(targetAudioSeconds * rate);
const captions = JSON.parse(fs.readFileSync(path.join(root, 'captions.json'), 'utf8'));
const timing = JSON.parse(fs.readFileSync(path.join(root, 'timing.json'), 'utf8'));
const wordCount = captions.length;
const baselineWpm = wordCount * 60 / sourceAudioSeconds;
if (wordCount !== 145) throw new Error(`Expected 145 caption words, found ${wordCount}`);
if (Math.abs(baselineWpm - 166) > .5) throw new Error(`Expected baseline near 166 WPM, found ${baselineWpm}`);

function ffmpeg(args, input) {
  const result = spawnSync('ffmpeg', args, {input, maxBuffer: 32 * 1024 * 1024});
  if (result.error) throw result.error;
  return result;
}

const silenceRun = ffmpeg([
  '-hide_banner', '-nostats', '-i', sourceWavPath,
  '-af', `silencedetect=noise=${thresholdDb}dB:d=${minQuietSeconds}`,
  '-f', 'null', '-'
]);
if (silenceRun.status !== 0) throw new Error(silenceRun.stderr.toString());
const silenceLog = silenceRun.stderr.toString();
const quiet = [];
let openQuiet = null;
for (const line of silenceLog.split(/\r?\n/)) {
  const start = line.match(/silence_start:\s*([\d.]+)/);
  const end = line.match(/silence_end:\s*([\d.]+)/);
  if (start) openQuiet = Math.round(Number(start[1]) * rate);
  if (end && openQuiet !== null) {
    const stop = Math.min(sourceSamples, Math.round(Number(end[1]) * rate));
    if (stop > openQuiet) quiet.push([openQuiet, stop]);
    openQuiet = null;
  }
}
if (openQuiet !== null) quiet.push([openQuiet, sourceSamples]);
const quietSamples = quiet.reduce((n, [a, b]) => n + b - a, 0);
if (quiet.length !== 26) throw new Error(`Expected 26 quiet intervals, found ${quiet.length}`);
const expectedQuietSamples = Math.round(10.536292 * rate);
if (Math.abs(quietSamples - expectedQuietSamples) > 2) {
  throw new Error(`Quiet detector mismatch: ${quietSamples / rate}s, expected about 10.536292s`);
}

const spans = [];
let cursor = 0;
for (const [start, end] of quiet) {
  if (start > cursor) spans.push([cursor, start]);
  cursor = end;
}
if (cursor < sourceSamples) spans.push([cursor, sourceSamples]);

const pieces = [];
let spanIndex = 0;
for (let i = 0; i <= quiet.length; i++) {
  if (spanIndex < spans.length) {
    const [start, end] = spans[spanIndex++];
    const guard = Math.min(guardSamples, Math.floor((end - start) / 4));
    if (guard) pieces.push({kind: 'speech', mode: 'guard', a: start, b: start + guard});
    const coreStart = start + guard;
    const coreEnd = Math.max(coreStart, end - guard);
    if (coreEnd > coreStart) pieces.push({kind: 'speech', mode: 'tempo', a: coreStart, b: coreEnd});
    if (guard && end - guard > start + guard) pieces.push({kind: 'speech', mode: 'guard', a: end - guard, b: end});
    else if (guard && end > coreStart && coreEnd === coreStart) pieces.push({kind: 'speech', mode: 'guard', a: coreStart, b: end});
  }
  if (i < quiet.length) pieces.push({kind: 'quiet', mode: 'copy', a: quiet[i][0], b: quiet[i][1]});
}
const guardCount = pieces.filter(p => p.mode === 'guard').reduce((n, p) => n + p.b - p.a, 0);
if (guardCount !== 24960) throw new Error(`Expected .52s edge guards, found ${guardCount / rate}s`);
const coreCount = pieces.filter(p => p.mode === 'tempo').reduce((n, p) => n + p.b - p.a, 0);
const targetCoreSamples = targetSamples - quietSamples - guardCount;
if (targetCoreSamples <= 0) throw new Error('Target duration is shorter than preserved quiet and edge guards');

function pcmChunk(a, b) { return sourcePcm.subarray(a * 2, b * 2); }
function processSpeech(tempo) {
  const out = [];
  for (const p of pieces) {
    if (p.mode === 'tempo') {
      const result = ffmpeg([
        '-hide_banner', '-loglevel', 'error', '-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', 'pipe:0',
        '-af', `atempo=${tempo.toFixed(10)}`,
        '-ar', String(rate), '-ac', '1', '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1'
      ], pcmChunk(p.a, p.b));
      if (result.status !== 0) throw new Error(result.stderr.toString());
      out.push(result.stdout);
    } else out.push(Buffer.from(pcmChunk(p.a, p.b)));
  }
  return out;
}

let tempo = coreCount / targetCoreSamples;
let renderedPieces;
for (let pass = 0; pass < 4; pass++) {
  renderedPieces = processSpeech(tempo);
  const actual = renderedPieces.reduce((n, b) => n + b.length / 2, 0);
  const err = targetSamples - actual;
  if (Math.abs(err) <= 24) break;
  const actualCore = actual - quietSamples - guardCount;
  tempo *= actualCore / targetCoreSamples;
}
const actualSamples = renderedPieces.reduce((n, b) => n + b.length / 2, 0);
if (Math.abs(actualSamples - targetSamples) >= rate / 30) {
  throw new Error(`Retimed audio is ${Math.abs(actualSamples - targetSamples)} samples from target (limit ${rate / 30})`);
}

const outputChunks = [];
let targetCursor = 0;
const mapSegments = [];
for (let i = 0; i < pieces.length; i++) {
  const p = pieces[i], bytes = renderedPieces[i], outCount = bytes.length / 2;
  mapSegments.push({
    sourceStartSample: p.a,
    sourceEndSample: p.b,
    targetStartSample: targetCursor,
    targetEndSample: targetCursor + outCount,
    kind: p.kind
  });
  outputChunks.push(bytes);
  targetCursor += outCount;
}
const outputPcm = Buffer.concat(outputChunks);
const outputAudioSamples = outputPcm.length / 2;
const outputAudioSeconds = outputAudioSamples / rate;
const exportSeconds = outputAudioSeconds + tailSeconds;
const fps = 30;
const outputFrames = Math.ceil(exportSeconds * fps - 1e-9);

function writeWav(file, pcm) {
  const wav = Buffer.alloc(44 + pcm.length);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(pcm.length, 40); pcm.copy(wav, 44);
  fs.writeFileSync(file, wav);
}
writeWav(path.join(publicDir, 'voice-193.wav'), outputPcm);

function sourceSampleAtOutput(sample) {
  if (sample >= outputAudioSamples) return sourceSamples + sample - outputAudioSamples;
  let s = mapSegments.find(x => sample >= x.targetStartSample && sample <= x.targetEndSample) ?? mapSegments.at(-1);
  const r = s.targetEndSample === s.targetStartSample ? 0 : (sample - s.targetStartSample) / (s.targetEndSample - s.targetStartSample);
  return s.sourceStartSample + r * (s.sourceEndSample - s.sourceStartSample);
}
function outputSampleAtSource(sample) {
  if (sample >= sourceSamples) return outputAudioSamples + sample - sourceSamples;
  let s = mapSegments.find(x => sample >= x.sourceStartSample && sample <= x.sourceEndSample) ?? mapSegments.at(-1);
  const r = s.sourceEndSample === s.sourceStartSample ? 0 : (sample - s.sourceStartSample) / (s.sourceEndSample - s.sourceStartSample);
  return s.targetStartSample + r * (s.targetEndSample - s.targetStartSample);
}
function outputFrameAt(sourceFrame) {
  return outputSampleAtSource(sourceFrame / fps * rate) / rate * fps;
}
function sourceFrameAt(outputFrame) {
  return sourceSampleAtOutput(outputFrame / fps * rate) / rate * fps;
}

const mappedCaptions = captions.map(item => ({
  word: item.word,
  start: Math.max(0, Math.round(outputFrameAt(item.start))),
  end: Math.max(0, Math.round(outputFrameAt(item.end)))
}));
if (mappedCaptions.map(x => x.word).join('\u0000') !== captions.map(x => x.word).join('\u0000')) throw new Error('Caption words changed');
for (let i = 1; i < mappedCaptions.length; i++) {
  if (mappedCaptions[i].start < mappedCaptions[i - 1].start) throw new Error('Caption mapping is not monotonic');
  if (mappedCaptions[i].end < mappedCaptions[i].start) throw new Error('Caption has negative duration');
}
mappedCaptions.at(-1).end = outputFrames;
fs.writeFileSync(path.join(root, 'captions-193.json'), JSON.stringify(mappedCaptions));

const mappedPhrases = timing.phrases.map(p => ({...p, start: Math.round(outputFrameAt(p.start)), end: Math.round(outputFrameAt(p.end))}));
fs.writeFileSync(path.join(root, 'timing-193.json'), JSON.stringify({
  fps, frames: outputFrames, duration: outputAudioSeconds, exportDuration: exportSeconds,
  phrases: mappedPhrases
}, null, 2));

const mapJson = {
  sampleRate: rate, fps, thresholdDb, minQuietSeconds,
  originalAudioSamples: sourceSamples, originalAudioDuration: sourceAudioSeconds,
  originalExportDuration: sourceExportSeconds, preservedTailDuration: tailSeconds,
  targetWpm: 193, baselineWpm, targetAudioDuration: targetAudioSeconds,
  outputAudioSamples, outputAudioDuration: outputAudioSeconds,
  exportDuration: exportSeconds, frames: outputFrames, tempo,
  quietSampleCount: quietSamples, quietDuration: quietSamples / rate,
  guardSampleCount: guardCount, guardDuration: guardCount / rate,
  quietIntervals: quiet.map(([a, b]) => ({sourceStartSample: a, sourceEndSample: b, duration: (b - a) / rate})),
  segments: mapSegments
};
fs.writeFileSync(path.join(publicDir, 'pace-map-193.json'), JSON.stringify(mapJson, null, 2));

const paceTs = `import map from './public/pace-map-193.json';\n\nconst segments = map.segments;\nconst rate = map.sampleRate;\nconst fps = map.fps;\nconst sourceSamples = map.originalAudioSamples;\nconst outputSamples = map.outputAudioSamples;\nexport const VOduration = map.outputAudioDuration;\nexport const exportDuration = map.exportDuration;\nexport function sourceFrameAt(outputFrame: number): number {\n  const sample = outputFrame / fps * rate;\n  if (sample >= outputSamples) return (sourceSamples + sample - outputSamples) / rate * fps;\n  const s = segments.find((x: any) => sample >= x.targetStartSample && sample <= x.targetEndSample) ?? segments[segments.length - 1];\n  const r = s.targetEndSample === s.targetStartSample ? 0 : (sample - s.targetStartSample) / (s.targetEndSample - s.targetStartSample);\n  return (s.sourceStartSample + r * (s.sourceEndSample - s.sourceStartSample)) / rate * fps;\n}\nexport function outputFrameAt(sourceFrame: number): number {\n  const sample = sourceFrame / fps * rate;\n  if (sample >= sourceSamples) return (outputSamples + sample - sourceSamples) / rate * fps;\n  const s = segments.find((x: any) => sample >= x.sourceStartSample && sample <= x.sourceEndSample) ?? segments[segments.length - 1];\n  const r = s.sourceEndSample === s.sourceStartSample ? 0 : (sample - s.sourceStartSample) / (s.sourceEndSample - s.sourceStartSample);\n  return (s.targetStartSample + r * (s.targetEndSample - s.targetStartSample)) / rate * fps;\n}\n`;
fs.writeFileSync(path.join(root, 'pace-193.ts'), paceTs);

// Focused validation: exact quiet PCM bytes, unchanged pause lengths, monotonic map and invertible boundaries.
for (const [a, b] of quiet) {
  const seg = mapSegments.find(s => s.kind === 'quiet' && s.sourceStartSample === a && s.sourceEndSample === b);
  if (!seg) throw new Error('Missing quiet mapping segment');
  if (!outputPcm.subarray(seg.targetStartSample * 2, seg.targetEndSample * 2).equals(pcmChunk(a, b))) throw new Error('Quiet PCM changed');
  if (seg.targetEndSample - seg.targetStartSample !== b - a) throw new Error('Pause duration changed');
}
for (let i = 0; i < pieces.length; i++) {
  if (pieces[i].mode !== 'guard') continue;
  const p = pieces[i], seg = mapSegments[i];
  if (!outputPcm.subarray(seg.targetStartSample * 2, seg.targetEndSample * 2).equals(pcmChunk(p.a, p.b))) throw new Error('Edge guard PCM changed');
}
for (let i = 0; i < mapSegments.length; i++) {
  const s = mapSegments[i], previous = mapSegments[i - 1];
  if (s.targetEndSample <= s.targetStartSample || s.sourceEndSample <= s.sourceStartSample) throw new Error('Nonpositive map segment');
  if (previous && (previous.sourceEndSample !== s.sourceStartSample || previous.targetEndSample !== s.targetStartSample)) throw new Error('Discontinuous map');
}
let prev = -Infinity, maxRoundTripFrames = 0;
for (let f = 0; f <= Math.ceil(sourceExportSeconds * fps); f++) {
  const o = outputFrameAt(f);
  if (o < prev - 1e-6) throw new Error('Source-to-output map is not monotonic');
  prev = o;
  maxRoundTripFrames = Math.max(maxRoundTripFrames, Math.abs(sourceFrameAt(o) - f));
}
if (maxRoundTripFrames > 1e-6) throw new Error(`Map round-trip error ${maxRoundTripFrames}`);

fs.mkdirSync(proofDir, {recursive: true});
fs.writeFileSync(path.join(proofDir, 'v6-pace-verification.json'), JSON.stringify({
  baseline: {words: wordCount, audioSeconds: sourceAudioSeconds, wpm: baselineWpm},
  output: {audioSeconds: outputAudioSeconds, exportSeconds, frames: outputFrames, wpm: wordCount * 60 / outputAudioSeconds, tempo, targetWpm: 193, targetAudioSeconds, errorSamples: outputAudioSamples - targetSamples, errorFrames: (outputAudioSamples / rate - targetAudioSeconds) * fps, method: 'pitch-preserving ffmpeg atempo on speech cores; original quiet and guards copied'},
  quiet: {intervals: quiet.length, durationSeconds: quietSamples / rate, exactPcmUnchanged: true, durationsUnchanged: true},
  edgeGuards: {samples: guardCount, durationSeconds: guardCount / rate, exactPcmPreserved: true},
  captions: {sameWords: true, count: mappedCaptions.length, finalEndFrame: mappedCaptions.at(-1).end},
  map: {segments: mapSegments.length, monotonic: true, maxRoundTripFrames}
}, null, 2));
console.log(JSON.stringify({baselineWpm, outputWpm: wordCount * 60 / outputAudioSeconds, quietSeconds: quietSamples / rate, guardSeconds: guardCount / rate, outputAudioSeconds, exportSeconds, frames: outputFrames, tempo}, null, 2));
