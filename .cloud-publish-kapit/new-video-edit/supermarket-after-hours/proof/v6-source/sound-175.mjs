import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import esbuild from 'esbuild';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pub = path.join(root, 'public');
const proof = path.join(root, 'proof');
const rate = 48000, fps = 30, frames = 1511, sampleCount = frames * rate / fps;
const mapData = JSON.parse(fs.readFileSync(path.join(pub, 'pace-map.json'), 'utf8'));

// Reuse the same production timing helpers as the film without writing generated JS files.
require.extensions['.ts'] = (mod, file) => mod._compile(esbuild.transformSync(
  fs.readFileSync(file, 'utf8'), {loader: 'ts', format: 'cjs', target: 'node20'}
).code, file);
const {outputFrameAt} = require('./pace.ts');
const story = require('./story.ts');
const {groundedGait} = require('./gait.ts');

function run(command, args, input) {
  const r = spawnSync(command, args, {input, maxBuffer: 64 * 1024 * 1024});
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${command} failed: ${r.stderr.toString()}`);
  return r.stdout;
}
function decode(file, channels = 1) {
  return run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, '-map', '0:a:0', '-ar', String(rate), '-ac', String(channels), '-f', 'f32le', 'pipe:1']);
}
function floats(bytes) { return new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.length / 4)); }
function writeWav(file, data, channels = 1) {
  const pcm = Buffer.alloc(data.length * 2);
  for (let i = 0; i < data.length; i++) {
    const n = Math.max(-1, Math.min(0.999969, data[i]));
    pcm.writeInt16LE(Math.round(n * 32768), i * 2);
  }
  const b = Buffer.alloc(44 + pcm.length);
  b.write('RIFF', 0); b.writeUInt32LE(b.length - 8, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(channels, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * channels * 2, 28);
  b.writeUInt16LE(channels * 2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(pcm.length, 40); pcm.copy(b, 44);
  fs.writeFileSync(file, b);
}
function paceSeconds(sourceFrame) { return outputFrameAt(sourceFrame) / fps; }
function putMonoEvent(dest, clip, startSample, gain, pan = 0, fadeIn = .008, fadeOut = .045) {
  const left = Math.cos((pan + 1) * Math.PI / 4), right = Math.sin((pan + 1) * Math.PI / 4);
  const fadeInN = Math.max(1, Math.round(fadeIn * rate)), fadeOutN = Math.max(1, Math.round(fadeOut * rate));
  for (let i = 0; i < clip.length; i++) {
    const at = startSample + i;
    if (at < 0 || at >= sampleCount) continue;
    const envelope = Math.min(1, i / fadeInN, (clip.length - 1 - i) / fadeOutN);
    const v = clip[i] * gain * Math.max(0, envelope);
    dest[at * 2] += v * left;
    dest[at * 2 + 1] += v * right;
  }
}

const voiceBytes = decode(path.join(pub, 'voice-175.wav'));
const voice = floats(voiceBytes);
const musicSource = floats(decode(path.join(pub, 'music.wav')));
const targetSecs = sampleCount / rate;
const musicTempo = musicSource.length / rate / targetSecs;
const musicPcmBytes = run('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-f', 'f32le', '-ar', String(rate), '-ac', '1', '-i', 'pipe:0',
  '-af', `atempo=${musicTempo.toFixed(10)},apad=whole_len=${sampleCount},atrim=end_sample=${sampleCount}`,
  '-ar', String(rate), '-ac', '1', '-f', 'f32le', 'pipe:1'
], Buffer.from(musicSource.buffer, musicSource.byteOffset, musicSource.byteLength));
const musicRaw = floats(musicPcmBytes);
if (musicRaw.length !== sampleCount) throw new Error(`music-175 length ${musicRaw.length}; expected ${sampleCount}`);

// Music's pre-existing lull is made to land on the paced sincere response window.
const lullStart = paceSeconds(1050), lullEnd = paceSeconds(1165), fadeSeconds = .26, lullLevel = .68;
const music = new Float32Array(sampleCount);
for (let i = 0; i < sampleCount; i++) {
  const t = i / rate;
  let level = 1;
  if (t >= lullStart - fadeSeconds && t < lullStart) level = 1 - (1 - lullLevel) * ((t - (lullStart - fadeSeconds)) / fadeSeconds);
  else if (t >= lullStart && t <= lullEnd) level = lullLevel;
  else if (t > lullEnd && t < lullEnd + fadeSeconds) level = lullLevel + (1 - lullLevel) * ((t - lullEnd) / fadeSeconds);
  const endFade = Math.max(0, Math.min(1, (targetSecs - t) / .55));
  music[i] = musicRaw[i] * level * endFade;
}
writeWav(path.join(pub, 'music-175.wav'), music);

const sfx = new Float32Array(sampleCount * 2);
const footsteps = floats(decode(path.join(pub, 'sfx-source', '0514.mp3')));
const lighter = floats(decode(path.join(pub, 'sfx-source', '2131.mp3')));
const ambience = floats(decode(path.join(pub, 'sfx-source', '0578.mp3'), 1));
const stepClips = [[.38, .78], [1.08, 1.48]].map(([a, b]) => footsteps.slice(Math.round(a * rate), Math.round(b * rate)));

function collectLandings(start, end, route) {
  const events = [];
  let beforeF = start;
  let before = groundedGait(start, start, end, route);
  const increment = .25;
  for (let f = start + increment; f <= end + 1e-8; f += increment) {
    const now = groundedGait(Math.min(f, end), start, end, route);
    for (let foot = 0; foot < 2; foot++) {
      if (before.contacts[foot] || !now.contacts[foot]) continue;
      let lo = beforeF, hi = Math.min(f, end);
      for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2;
        if (groundedGait(mid, start, end, route).contacts[foot]) hi = mid;
        else lo = mid;
      }
      const contact = groundedGait(hi, start, end, route).feet[foot];
      events.push({sourceFrame: hi, contact, foot, start, end});
    }
    beforeF = Math.min(f, end); before = now;
  }
  return events;
}
const landings = [
  ...collectLandings(252, 374, story.arrival),
  ...collectLandings(590, 640, story.serviceWalk)
].sort((a, b) => a.sourceFrame - b.sourceFrame);
const footstepLog = [];
for (let i = 0; i < landings.length; i++) {
  const e = landings[i];
  const clip = stepClips[i % stepClips.length];
  const contactSeconds = paceSeconds(e.sourceFrame);
  const impactOffset = .055;
  // The impact sample in both isolated source clips lands at the actual contact instant.
  const interior = e.contact[2] < -.25;
  const pan = e.foot === 0 ? -.12 : .12;
  const gain = interior ? .073 : .060;
  putMonoEvent(sfx, clip, Math.round((contactSeconds - impactOffset) * rate), gain, pan, .009, .060);
  footstepLog.push({sourceFrame: +e.sourceFrame.toFixed(4), outputFrame: +outputFrameAt(e.sourceFrame).toFixed(4), foot: e.foot, contact: e.contact, surface: interior ? 'dry interior' : 'threshold/exterior', gain});
}

// Keep one short ignition strike centered on the observed lighter transient at 0.19s.
const lighterClipStart = .12, lighterClipEnd = .45, lighterImpactOffset = .19 - lighterClipStart;
const lighterClip = lighter.slice(Math.round(lighterClipStart * rate), Math.round(lighterClipEnd * rate));
const lighterFrame = 660, lighterSeconds = paceSeconds(lighterFrame);
putMonoEvent(sfx, lighterClip, Math.round((lighterSeconds - lighterImpactOffset) * rate), .052, .03, .004, .055);

// One centered mono fold-down avoids the source recording's left-heavy register image.
const ambienceStart = paceSeconds(252), ambienceEnd = paceSeconds(517);
const ambienceLength = Math.min(Math.round((ambienceEnd - ambienceStart) * rate), ambience.length);
const ambienceSourceOffset = Math.round(12 * rate);
const ambienceGain = .092;
for (let i = 0; i < ambienceLength; i++) {
  const src = ambienceSourceOffset + i;
  if (src >= ambience.length) break;
  const fade = Math.min(1, i / (rate * .45), (ambienceLength - 1 - i) / (rate * .55));
  const v = ambience[src] * ambienceGain * Math.max(0, fade);
  const at = Math.round(ambienceStart * rate) + i;
  if (at >= 0 && at < sampleCount) { sfx[at * 2] += v; sfx[at * 2 + 1] += v; }
}
const emotionalTurnFrames = [outputFrameAt(1050), outputFrameAt(1165)];
if (footstepLog.some(e => e.outputFrame >= emotionalTurnFrames[0] && e.outputFrame <= emotionalTurnFrames[1])) {
  throw new Error('A footstep entered the quiet emotional response window');
}
const lighterOutputFrame = outputFrameAt(lighterFrame);
if (lighterOutputFrame >= emotionalTurnFrames[0] && lighterOutputFrame <= emotionalTurnFrames[1]) {
  throw new Error('Lighter strike entered the quiet emotional response window');
}
const ambienceFrames = [ambienceStart * fps, ambienceEnd * fps];
if (ambienceFrames[0] < emotionalTurnFrames[1] && ambienceFrames[1] > emotionalTurnFrames[0]) {
  throw new Error('Supermarket ambience entered the quiet emotional response window');
}
writeWav(path.join(pub, 'sfx-175.wav'), sfx, 2);

const mix = new Float32Array(sampleCount * 2);
let preLimitPeak = 0;
for (let i = 0; i < sampleCount; i++) {
  const v = i < voice.length ? voice[i] : 0;
  mix[i * 2] = v + music[i] + sfx[i * 2];
  mix[i * 2 + 1] = v + music[i] + sfx[i * 2 + 1];
  preLimitPeak = Math.max(preLimitPeak, Math.abs(mix[i * 2]), Math.abs(mix[i * 2 + 1]));
}
if (preLimitPeak >= .999) throw new Error(`Final mix would clip at ${preLimitPeak}; adjust beds, never reduce voice gain`);
const mixPath = path.join(pub, 'mix-175.wav');
writeWav(mixPath, mix, 2);
const analysis = spawnSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'info', '-i', mixPath,
  '-af', 'loudnorm=I=-16.6:TP=-1.5:LRA=20:print_format=json', '-f', 'null', 'NUL'
], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
if (analysis.error) throw analysis.error;
if (analysis.status !== 0) throw new Error(`loudness analysis failed: ${analysis.stderr}`);
const measuredBlock = [...analysis.stderr.matchAll(/\{\s*"input_i"[\s\S]*?\}/g)].at(-1)?.[0];
if (!measuredBlock) throw new Error('Could not parse loudnorm first-pass measurements');
const measured = JSON.parse(measuredBlock);
const masterFilter = `loudnorm=I=-16.6:TP=-1.5:LRA=20:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=false:print_format=summary,aresample=${rate},apad=whole_len=${sampleCount * 2},atrim=end_sample=${sampleCount}`;
const masteredBytes = run('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-i', mixPath,
  '-af', masterFilter, '-ar', String(rate), '-ac', '2', '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1'
]);
if (masteredBytes.length !== sampleCount * 4) throw new Error(`Mastered mix has ${masteredBytes.length / 4} frames of samples, expected ${sampleCount}`);
const mastered = new Float32Array(masteredBytes.length / 2);
for (let i = 0; i < mastered.length; i++) mastered[i] = masteredBytes.readInt16LE(i * 2) / 32768;
writeWav(mixPath, mastered, 2);

const ebur = spawnSync('ffmpeg', ['-hide_banner', '-i', path.join(pub, 'mix-175.wav'), '-af', 'ebur128=peak=true', '-f', 'null', 'NUL'], {encoding: 'utf8'});
if (ebur.status !== 0) throw new Error(ebur.stderr);
const stats = ebur.stderr;
const lufs = [...stats.matchAll(/Integrated loudness:\s*I:\s*(-?[\d.]+) LUFS/g)].at(-1)?.[1] ?? null;
const truePeak = [...stats.matchAll(/True peak:\s*Peak:\s*(-?[\d.]+) dBFS/g)].at(-1)?.[1] ?? null;
let measuredPeak = 0;
for (const v of mastered) measuredPeak = Math.max(measuredPeak, Math.abs(v));
const rms = Math.sqrt(mastered.reduce((sum, v) => sum + v * v, 0) / mastered.length);
const note = {
  frames, sampleRate: rate, channels: 2, samplesPerChannel: sampleCount, duration: sampleCount / rate,
  voice: {file: 'public/voice-175.wav', gainDb: 0, paddedOnlyAtEnd: true, sourceVoiceGainUnchanged: true},
  music: {file: 'public/music-175.wav', source: 'public/music.wav', tempo: +musicTempo.toFixed(8), endFadeSeconds: .55,
    emotionalTurnSourceFrames: [1050, 1165], emotionalTurnOutputFrames: [+outputFrameAt(1050).toFixed(3), +outputFrameAt(1165).toFixed(3)], lullLevel: lullLevel},
  sfx: {file: 'public/sfx-175.wav', footsteps: footstepLog, lighter: {sourceFrame: lighterFrame, outputFrame: +lighterOutputFrame.toFixed(3), sourceWindowSeconds: [lighterClipStart, lighterClipEnd], impactOffsetSeconds: lighterImpactOffset},
    ambience: {source: '0578.mp3', sourceWindowSeconds: [12, 12 + ambienceLength / rate], outputSourceFrames: [252, 517], outputWindowSeconds: [+ambienceStart.toFixed(4), +ambienceEnd.toFixed(4)], centeredMono: true, gain: ambienceGain},
    licenses: [
      {file: 'public/sfx-source/0514.mp3', creator: 'Joseph Sardin', title: 'Footsteps, Shoe on Concrete', url: 'https://bigsoundbank.com/footsteps-shoe-on-concrete-s0514.html', license: 'CC0 / public-domain equivalent; attribution not required'},
      {file: 'public/sfx-source/2131.mp3', creator: 'Joseph Sardin', title: 'Cigarette, Ignition', url: 'https://bigsoundbank.com/cigarette-ignition-s2131.html', license: 'CC0 / public-domain equivalent; attribution not required'},
      {file: 'public/sfx-source/0578.mp3', creator: 'Joseph Sardin', title: 'Supermarket', url: 'https://bigsoundbank.com/supermarket-s0578.html', license: 'CC0 / public-domain equivalent; attribution not required'}
    ]},
  finalMix: {file: 'public/mix-175.wav', voiceGainConstant: true, voiceBusGainDb: 0, master: 'Two-pass FFmpeg loudnorm; I=-16.6 LUFS, TP=-1.5 dBTP, LRA target20; dynamic peak control applied only as needed.', premaster: {integratedLufs: Number(measured.input_i), truePeakDbfs: Number(measured.input_tp)}, integratedLufs: lufs === null ? null : Number(lufs), truePeakDbfs: truePeak === null ? null : Number(truePeak), samplePeakDbfs: +(20 * Math.log10(measuredPeak)).toFixed(3), rmsDbfs: +(20 * Math.log10(rms)).toFixed(3), preLimitPeak},
  verification: {actualDurationSeconds: sampleCount / rate, exactFrames: frames, sourceQuietPcmAndDurations: 'inherited unchanged from voice-175.wav', noSfxEventsDuringMappedSourceFrames: [1050, 1165], emotionalTurnOutputFrames: [+emotionalTurnFrames[0].toFixed(3), +emotionalTurnFrames[1].toFixed(3)], listening: 'Not verified by listening'}
};
fs.writeFileSync(path.join(proof, 'v5-audio-notes.json'), JSON.stringify(note, null, 2));
console.log(JSON.stringify({duration: note.duration, frames, tempo: musicTempo, integratedLufs: note.finalMix.integratedLufs, truePeakDbfs: note.finalMix.truePeakDbfs, samplePeakDbfs: note.finalMix.samplePeakDbfs, footfalls: footstepLog.length, lighterFrame: note.sfx.lighter.outputFrame, ambienceWindow: note.sfx.ambience.outputWindowSeconds}, null, 2));
