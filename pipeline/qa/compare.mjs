// node compare.mjs --spec <json> --out <mp4>
// spec: {candidate:{file,label}, baseline:{file,label}, audio:'candidate'|'baseline',
//        segments:[{candidate:[start,end], baseline:[start,end]}]}
// A short baseline segment holds its last frame and pads silence. Nothing is stretched.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { checkedRun, cli, newOutput, required } from './common.mjs';

await cli(async () => {
  const { values } = parseArgs({ options: { spec: { type: 'string' }, out: { type: 'string' } } });
  const specFile = resolve(required(values.spec, '--spec'));
  const spec = JSON.parse(readFileSync(specFile, 'utf8'));
  if (!['candidate', 'baseline'].includes(spec.audio)) throw new Error('audio must be candidate or baseline');
  if (!spec.segments?.length) throw new Error('segments are required');
  return newOutput(required(values.out, '--out'), 'mp4', async (output) => {
    const parts = [];
    const font = "fontfile='C\\:/Windows/Fonts/arialbd.ttf'";
    for (const [input, side] of ['candidate', 'baseline'].entries()) {
      const label = String(spec[side].label).replace(/[^\w .()-]/g, '');
      spec.segments.forEach((segment, i) => {
        const [from, to] = segment[side];
        const length = segment.candidate[1] - segment.candidate[0];
        if (!(to > from) || !(length > 0) || to - from > length + 0.05) throw new Error(`bad ${side} segment ${i}`);
        // Resample before trimming, so a one-frame hold from a 24 fps baseline still contains a frame.
        parts.push(`[${input}:v]fps=30,trim=${from}:${to},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${length},trim=duration=${length},setpts=PTS-STARTPTS,`
          + 'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1'
          + `[v${input}_${i}]`);
        if (side === spec.audio) {
          const held = to - from < 0.1;
          parts.push(`[${input}:a]atrim=${from}:${to},asetpts=PTS-STARTPTS,${held ? 'volume=0,' : ''}aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=${length}[a${i}]`);
        }
      });
      const all = spec.segments.map((_, i) => `[v${input}_${i}]`).join('');
      parts.push(`${all}concat=n=${spec.segments.length}:v=1:a=0,drawtext=${font}:text='${label}':fontsize=34:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=12:x=(w-tw)/2:y=28[panel${input}]`);
    }
    parts.push('[panel1][panel0]hstack=2,format=yuv420p[v]');
    parts.push(`${spec.segments.map((_, i) => `[a${i}]`).join('')}concat=n=${spec.segments.length}:v=0:a=1[a]`);
    await checkedRun('ffmpeg', [
      '-nostdin', '-hide_banner', '-loglevel', 'error', '-n',
      '-i', resolve(dirname(specFile), spec.candidate.file),
      '-i', resolve(dirname(specFile), spec.baseline.file),
      '-filter_complex', parts.join(';'),
      '-map', '[v]', '-map', '[a]', '-r', '30', '-c:v', 'libx264', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output,
    ]);
  });
});
