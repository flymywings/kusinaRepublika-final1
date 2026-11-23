import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { audioStream, checkedRun, cli, newOutput, number, probe, rate, required, run, videoStream } from './common.mjs';

const MIN_BLACK = 0.03; // one frame
const MIN_FREEZE = 0.5;
const MIN_QUIET = 0.5;
const QUIET_DBFS = -30;
const EPSILON = 0.000001;
const DECIMAL = '(-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)';

function allowedRange(value) {
  const match = new RegExp(`^${DECIMAL}-${DECIMAL}$`).exec(value);
  if (!match) throw new Error(`Invalid allowance "${value}". Use start-end in seconds.`);
  const start = number(match[1], 'allowance start', { min: 0 });
  const end = number(match[2], 'allowance end', { min: 0 });
  if (end <= start) throw new Error(`Invalid allowance "${value}". End must follow start.`);
  return [start, end];
}

function spanTracker(patterns) {
  const [startPattern, endPattern] = patterns.map((pattern) => new RegExp(pattern + DECIMAL));
  const spans = [];
  let start = null;
  return {
    read(line) {
      const started = startPattern.exec(line);
      if (started) start = Number(started[1]);
      const ended = endPattern.exec(line);
      if (ended && start !== null) {
        spans.push([start, Number(ended[1])]);
        start = null;
      }
    },
    finish(end, minimum, allowances = []) {
      if (start !== null && end !== null) spans.push([start, end]);
      return spans.filter(([a, b]) => b - a >= minimum - EPSILON).map(([start, end]) => {
        let covered = start;
        for (const [a, b] of allowances) {
          if (a > covered + EPSILON) break;
          covered = Math.max(covered, b);
        }
        return { start, end, duration: Number((end - start).toFixed(6)), allowed: covered >= end - EPSILON };
      });
    },
  };
}

async function inspect(input, info, video, audio, fps) {
  const black = spanTracker(['lavfi\\.black_start=', 'lavfi\\.black_end=']);
  const frozen = spanTracker(['freeze_start: ', 'freeze_end: ']);
  const quiet = spanTracker(['silence_start: ', 'silence_end: ']);
  let timeBase = rate(video?.time_base);
  let previous = null;
  let peak = null;
  let lufs = null;
  const picture = { frames: 0, start: null, end: null, offCadenceIntervals: 0 };
  const sound = { start: null, end: null };

  function onLog(line) {
    black.read(line);
    frozen.read(line);
    quiet.read(line);
    if (line.includes('Parsed_showinfo')) {
      const config = /config in time_base: (\d+\/\d+)/.exec(line);
      if (config) timeBase = rate(config[1]);
      const frame = /\bn:\s*\d+\s+pts:\s*(-?\d+)\s+pts_time:\S+\s+duration:\s*(\d+)/.exec(line);
      if (frame && timeBase) {
        const pts = Number(frame[1]);
        const duration = Number(frame[2]) * timeBase || 1 / (rate(video.avg_frame_rate) ?? fps);
        picture.frames += 1;
        picture.start ??= pts * timeBase;
        picture.end = pts * timeBase + duration;
        const delta = (pts - previous) * timeBase;
        if (previous !== null && (delta <= 0 || Math.abs(delta - 1 / fps) > timeBase + EPSILON)) {
          picture.offCadenceIntervals += 1;
        }
        previous = pts;
      }
    }
    if (line.includes('Parsed_ashowinfo')) {
      const frame = /pts_time:(\S+).*\brate:(\d+)\s+nb_samples:(\d+)/.exec(line);
      if (frame && Number.isFinite(Number(frame[1]))) {
        const start = Number(frame[1]);
        sound.start ??= start;
        sound.end = start + Number(frame[3]) / Number(frame[2]);
      }
    }
    const measurement = /"input_(i|tp)"\s*:\s*"([^"]+)"/.exec(line);
    if (measurement) {
      const value = Number(measurement[2]);
      const measured = Number.isFinite(value) ? value : null;
      if (measurement[1] === 'i') lufs = measured;
      else peak = measured;
    }
  }

  const args = ['-nostdin', '-hide_banner', '-nostats', '-xerror', '-i', input];
  if (video) {
    args.push('-map', `0:${video.index}`, '-filter:v:0', [
      'showinfo=checksum=0',
      'blackdetect=d=0',
      'metadata=mode=print:key=lavfi.black_start',
      'metadata=mode=print:key=lavfi.black_end',
      'freezedetect=n=0.001:d=0',
    ].join(','), '-fps_mode', 'passthrough');
  }
  if (audio) {
    args.push('-map', `0:${audio.index}`, '-filter:a:0', [
      'ashowinfo',
      `silencedetect=n=${QUIET_DBFS}dB:d=${MIN_QUIET}`,
      'loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json',
    ].join(','));
  }
  for (const stream of info.streams) {
    if (stream === video || stream === audio) continue;
    if (stream.codec_type === 'audio' || (stream.codec_type === 'video' && !stream.disposition?.attached_pic)) {
      args.push('-map', `0:${stream.index}`);
    }
  }
  args.push('-f', 'null', '-');
  const result = video || audio ? await run('ffmpeg', args, { onLog }) : null;
  if (video) {
    // Filter threads interleave their log lines, so frames and cadence come from ffprobe instead.
    const listed = JSON.parse(await checkedRun('ffprobe', ['-v', 'error', '-select_streams', String(video.index),
      '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'json', input]));
    const times = listed.frames.map((frame) => Number(frame.best_effort_timestamp_time));
    picture.frames = times.length;
    picture.start = times[0] ?? null;
    picture.end = times.length ? times.at(-1) + 1 / fps : null;
    picture.offCadenceIntervals = times.slice(1).filter((time, i) => Math.abs(time - times[i] - 1 / fps) > 0.0011).length;
  }
  return { result, picture, sound, black, frozen, quiet, peak, lufs };
}

await cli(async () => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: 'string' },
      width: { type: 'string', default: '1440' },
      height: { type: 'string', default: '2560' },
      fps: { type: 'string', default: '30' },
      frames: { type: 'string' },
      lufs: { type: 'string', default: '-15' },
      peak: { type: 'string', default: '-1.5' },
      'allow-quiet': { type: 'string', multiple: true, default: [] },
      'allow-freeze': { type: 'string', multiple: true, default: [] },
    },
  });
  if (positionals.length !== 1) throw new Error('Usage: media.mjs <video> --out <qa.json> [--width 1440 --height 2560 --fps 30 --frames N --lufs -15 --peak -1.5]');
  const input = resolve(positionals[0]);
  const expected = {
    width: number(values.width, '--width', { min: 1, integer: true }),
    height: number(values.height, '--height', { min: 1, integer: true }),
    fps: number(values.fps.includes('/') ? rate(values.fps) ?? undefined : values.fps, '--fps', { min: Number.MIN_VALUE }),
    frames: values.frames === undefined ? null : number(values.frames, '--frames', { min: 1, integer: true }),
    lufs: number(values.lufs, '--lufs'),
    peak: number(values.peak, '--peak'),
  };
  const quietAllowances = values['allow-quiet'].map(allowedRange).sort(([a], [b]) => a - b);
  const freezeAllowances = values['allow-freeze'].map(allowedRange).sort(([a], [b]) => a - b);

  return newOutput(required(values.out, '--out'), 'json', async (output) => {
    const checks = {};
    const check = (name, passed, details = {}) => { checks[name] = { passed, ...details }; };
    let info;
    try {
      info = await probe(input);
      check('probe', true);
    } catch (error) {
      check('probe', false, { error: error.message });
    }

    if (info) {
      const video = videoStream(info);
      const audio = audioStream(info);
      const averageFps = rate(video?.avg_frame_rate);
      const headerFrames = Number(video?.nb_frames) || null;
      const targetFrames = expected.frames ?? headerFrames;
      check('videoPresence', Boolean(video));
      check('dimensions', video?.width === expected.width && video?.height === expected.height, {
        actual: video ? { width: video.width, height: video.height } : null,
        expected: { width: expected.width, height: expected.height },
      });

      let scan;
      try {
        scan = await inspect(input, info, video, audio, expected.fps);
        check('decode', scan.result?.code === 0, scan.result?.code === 0 ? {} : {
          error: scan.result?.stderr.trim() || 'No decodable audio or video stream',
        });
      } catch (error) {
        check('decode', false, { error: error.message });
      }
      const picture = scan?.picture;
      const sound = scan?.sound;
      const frames = picture?.frames ?? 0;
      const audioPresent = sound?.start != null;
      const decodePassed = checks.decode.passed;
      check('audioPresence', audioPresent, { streamFound: Boolean(audio) });
      check('fps', decodePassed && frames > 0 && averageFps !== null
        && Math.abs(averageFps - expected.fps) < 0.0005 && picture.offCadenceIntervals === 0, {
        expected: expected.fps, reported: averageFps, offCadenceIntervals: picture?.offCadenceIntervals ?? null,
      });
      check('lockedFrameCount', expected.frames !== null, { note: 'Pass --frames. A file cannot vouch for its own length.' });
      check('frameCount', decodePassed && frames > 0 && (targetFrames === null || frames === targetFrames), {
        decoded: frames, expected: targetFrames, container: headerFrames,
      });
      const videoDuration = frames > 0 ? picture.end - picture.start : null;
      const audioDuration = audioPresent ? sound.end - sound.start : null;
      const tolerance = 1 / (averageFps ?? expected.fps) + EPSILON;
      const avDelta = audioPresent && frames > 0 ? Math.max(
        Math.abs(picture.start - sound.start),
        Math.abs(picture.end - sound.end),
        Math.abs(videoDuration - audioDuration),
      ) : null;
      check('durationAgreement', decodePassed && avDelta !== null && avDelta <= tolerance, {
        videoSeconds: videoDuration, audioSeconds: audioDuration, videoStart: picture?.start ?? null,
        audioStart: sound?.start ?? null, maxDifferenceSeconds: avDelta, toleranceSeconds: tolerance,
      });
      const lufs = scan?.lufs ?? null;
      const peak = scan?.peak ?? null;
      check('integratedLoudness', decodePassed && lufs !== null && Math.abs(lufs - expected.lufs) <= 1 + EPSILON, {
        actualLufs: lufs, targetLufs: expected.lufs, toleranceLu: 1,
      });
      check('truePeak', decodePassed && peak !== null && peak <= expected.peak + EPSILON, {
        actualDbtp: peak, maximumDbtp: expected.peak,
      });
      const black = scan?.black.finish(picture.end, MIN_BLACK) ?? [];
      const frozen = scan?.frozen.finish(picture.end, MIN_FREEZE, freezeAllowances) ?? [];
      const quiet = scan?.quiet.finish(sound.end, MIN_QUIET, quietAllowances) ?? [];
      check('blackSpans', decodePassed && frames > 0 && black.length === 0, {
        minimumSeconds: MIN_BLACK, spans: black,
      });
      check('frozenSpans', decodePassed && frames > 0 && frozen.every((span) => span.allowed), {
        minimumSeconds: MIN_FREEZE, allowances: freezeAllowances, spans: frozen,
      });
      check('quietSpans', decodePassed && audioPresent && quiet.every((span) => span.allowed), {
        thresholdDbfs: QUIET_DBFS, minimumSeconds: MIN_QUIET, allowances: quietAllowances, spans: quiet,
      });
    }

    const failedChecks = Object.keys(checks).filter((name) => !checks[name].passed);
    const passed = failedChecks.length === 0;
    await writeFile(output, `${JSON.stringify({
      input, passed, failedChecks, expected, checks,
      scope: 'Decoded frames and audio signal only. Review playback at normal speed with sound for timing and mix.',
    }, null, 2)}\n`);
    if (!passed) console.error(`Failed media checks: ${failedChecks.join(', ')}`);
    return passed ? 0 : 1;
  });
});
