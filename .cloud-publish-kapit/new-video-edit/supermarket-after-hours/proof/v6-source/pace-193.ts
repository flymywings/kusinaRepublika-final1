import map from './public/pace-map-193.json';

const segments = map.segments;
const rate = map.sampleRate;
const fps = map.fps;
const sourceSamples = map.originalAudioSamples;
const outputSamples = map.outputAudioSamples;
export const VOduration = map.outputAudioDuration;
export const exportDuration = map.exportDuration;
export function sourceFrameAt(outputFrame: number): number {
  const sample = outputFrame / fps * rate;
  if (sample >= outputSamples) return (sourceSamples + sample - outputSamples) / rate * fps;
  const s = segments.find((x: any) => sample >= x.targetStartSample && sample <= x.targetEndSample) ?? segments[segments.length - 1];
  const r = s.targetEndSample === s.targetStartSample ? 0 : (sample - s.targetStartSample) / (s.targetEndSample - s.targetStartSample);
  return (s.sourceStartSample + r * (s.sourceEndSample - s.sourceStartSample)) / rate * fps;
}
export function outputFrameAt(sourceFrame: number): number {
  const sample = sourceFrame / fps * rate;
  if (sample >= sourceSamples) return (outputSamples + sample - sourceSamples) / rate * fps;
  const s = segments.find((x: any) => sample >= x.sourceStartSample && sample <= x.sourceEndSample) ?? segments[segments.length - 1];
  const r = s.sourceEndSample === s.sourceStartSample ? 0 : (sample - s.sourceStartSample) / (s.sourceEndSample - s.sourceStartSample);
  return (s.targetStartSample + r * (s.targetEndSample - s.targetStartSample)) / rate * fps;
}
