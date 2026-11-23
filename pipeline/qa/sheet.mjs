import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { checkedRun, cli, mediaBounds, newOutput, number, probe, required, videoStream } from './common.mjs';

await cli(async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: 'string' },
      fps: { type: 'string', default: '1' },
      from: { type: 'string', default: '0' },
      to: { type: 'string' },
      cols: { type: 'string', default: '10' },
    },
  });
  if (positionals.length !== 1) throw new Error('Usage: sheet.mjs <video> --out <file.jpg> [--fps 1] [--from s] [--to s] [--cols 10]');
  const input = resolve(positionals[0]);
  const fps = number(values.fps, '--fps', { min: Number.MIN_VALUE });
  const from = number(values.from, '--from', { min: 0 });
  const to = values.to === undefined ? undefined : number(values.to, '--to', { min: 0 });
  const requestedCols = number(values.cols, '--cols', { min: 1, integer: true });

  await newOutput(required(values.out, '--out'), 'jpg', async (output) => {
    const info = await probe(input);
    const video = videoStream(info);
    if (!video) throw new Error('No video stream');
    const bounds = mediaBounds(info, video);
    const start = Math.max(from, bounds.start);
    const end = Math.min(to ?? bounds.end, bounds.end);
    if (end <= start) throw new Error('The requested range contains no video');
    // A bucket contributes at most one frame. The label retains the selected frame PTS.
    const lastBucket = Math.max(0, Math.ceil((end - from) * fps) - 1);
    const intervalCount = Math.max(1, lastBucket - Math.floor((start - from) * fps) + 1);
    const columns = Math.min(requestedCols, intervalCount);
    // Keep room for all sample buckets, including on variable-frame-rate inputs.
    const rows = Math.ceil(intervalCount / columns);
    const width = columns * 200 + 8;
    const height = rows * 392 + 8;
    if (width > 30_000 || height > 30_000 || width * height > 75_000_000) {
      throw new Error('Contact sheet is too large. Reduce --fps or select a shorter range.');
    }
    const bucket = (time) => `min(${lastBucket},floor((${time}-${from})*${fps}+1e-8))`;
    const filter = [
      `select='gte(t,${start})*lt(t,${end})*(isnan(prev_selected_t)+gt(${bucket('t')},${bucket('prev_selected_t')}))'`,
      'scale=192:344:force_original_aspect_ratio=decrease:force_divisible_by=2:reset_sar=1',
      'pad=192:384:(ow-iw)/2:(344-ih)/2:color=0x101820',
      "drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':fontcolor=white:fontsize=20:x=(w-tw)/2:y=344+(40-th)/2:text='%{pts\\:hms}'",
      `tile=${columns}x${rows}:padding=8:margin=8:color=0x26323d`,
    ].join(',');
    await checkedRun('ffmpeg', [
      '-nostdin', '-hide_banner', '-loglevel', 'error', '-xerror', '-n', '-i', input,
      '-map', `0:${video.index}`, '-vf', filter, '-fps_mode', 'passthrough',
      '-frames:v', '1', '-q:v', '2', '-update', '1', output,
    ]);
  });
});
