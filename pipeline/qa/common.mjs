import { spawn } from 'node:child_process';
import { link, lstat, mkdtemp, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export function run(program, args, { cwd, onLog } = {}) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(program, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let stdout = '';
    let stderr = '';
    let pending = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk) => {
      stderr = (stderr + chunk).slice(-16_384);
      if (!onLog) return;
      const lines = (pending + chunk).split('\n');
      pending = lines.pop();
      for (const line of lines) onLog(line);
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (pending) onLog(pending);
      resolveResult({ code, signal, stdout, stderr });
    });
  });
}

export async function checkedRun(program, args, options) {
  const result = await run(program, args, options);
  if (result.code !== 0) {
    throw new Error(`${program} failed (${result.signal ?? result.code})\n${result.stderr.trim()}`);
  }
  return result.stdout;
}

export async function probe(file) {
  return JSON.parse(await checkedRun('ffprobe', [
    '-v', 'error', '-show_streams', '-show_format', '-of', 'json', file,
  ]));
}

export const videoStream = (info) =>
  info.streams.find((stream) => stream.codec_type === 'video' && !stream.disposition?.attached_pic);

export const audioStream = (info) => info.streams.find((stream) => stream.codec_type === 'audio');

export function rate(value) {
  const [numerator, denominator = 1] = String(value).split('/').map(Number);
  const result = numerator / denominator;
  return Number.isFinite(result) && result > 0 ? result : null;
}

export function mediaBounds(info, stream) {
  const origin = Number(info.format.start_time ?? 0);
  const start = Number(stream.start_time ?? origin) - origin;
  const end = Number(stream.duration) > 0 ? start + Number(stream.duration) : Number(info.format.duration);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error('Could not determine the stream duration');
  }
  return { start, end };
}

export function number(value, flag, { min = -Infinity, integer = false } = {}) {
  const result = value === undefined || String(value).trim() === '' ? NaN : Number(value);
  if (!Number.isFinite(result) || result < min || (integer && !Number.isSafeInteger(result))) {
    throw new Error(`Invalid ${flag}: ${value}`);
  }
  return result;
}

export function required(value, flag) {
  if (!value?.trim()) throw new Error(`Missing ${flag}`);
  return value;
}

export async function newOutput(path, extension, produce) {
  const output = resolve(path);
  const exists = await lstat(output).then(() => true, (error) => {
    if (error.code === 'ENOENT') return false;
    throw error;
  });
  const overwriteError = () => new Error(`Refusing to overwrite existing output: ${output}`);
  if (exists) throw overwriteError();

  const directory = await mkdtemp(join(dirname(output), '.qa-'));
  const staged = join(directory, `output.${extension}`);
  try {
    const result = await produce(staged, directory);
    // Publish the finished file with an exclusive, atomic link on the same filesystem.
    await link(staged, output).catch((error) => {
      if (error.code === 'EEXIST') throw overwriteError();
      throw error;
    });
    return result;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function cli(main) {
  try {
    process.exitCode = (await main()) ?? 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
