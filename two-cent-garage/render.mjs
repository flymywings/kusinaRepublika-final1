import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.join(root, '..');
const [mode = 'stills', values = '0,30,60,120,150,160,250,330,380,400,470,530,545,600,650,690,730,760,820'] = process.argv.slice(2);
const output = path.join(root, 'proof');
fs.mkdirSync(output, { recursive: true });

const browserExecutable = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions = { gl: 'angle' };
const inputProps = { captions: mode !== 'bare' };
const serveUrl = await bundle({ entryPoint: path.join(root, 'index.tsx'), publicDir: path.join(project, 'public') });
const browser = await openBrowser('chrome', { browserExecutable, chromiumOptions });

try {
  const browserProps = { serveUrl, inputProps, browserExecutable, chromiumOptions, puppeteerInstance: browser };

  if (mode === 'stills' || mode === 'bare') {
    const composition = await selectComposition({ ...browserProps, id: 'TwoCentGarage' });
    for (const frame of values.split(',').map(Number)) {
      await renderStill({
        ...browserProps, composition, frame, scale: 0.4, imageFormat: 'jpeg', jpegQuality: 92,
        output: path.join(output, `${mode}-${frame}.jpg`), timeoutInMilliseconds: 180000,
      });
      console.log(`still ${frame}`);
    }
  } else {
    const id = mode === 'hook' ? 'TwoCentHook' : mode === 'reveal' ? 'TwoCentReveal' : 'TwoCentGarage';
    const composition = await selectComposition({ ...browserProps, id });
    const range = mode === 'final' ? [0, composition.durationInFrames - 1] : values.split('-').map(Number);
    const target = path.join(output, `${mode}.mp4`);
    let last = -1;
    await renderMedia({
      ...browserProps, composition, frameRange: range, outputLocation: target,
      scale: mode === 'final' ? 4 / 3 : 0.5, codec: 'h264', crf: mode === 'final' ? 16 : 20,
      audioCodec: 'aac', concurrency: mode === 'final' ? 3 : 3, timeoutInMilliseconds: 300000,
      onProgress: ({ renderedFrames }) => {
        const checkpoint = Math.floor(renderedFrames / 30);
        if (checkpoint > last) { last = checkpoint; console.log(`${renderedFrames}/${range[1] - range[0] + 1}`); }
      },
    });
    console.log(target);
  }
} finally {
  await browser.close({ silent: true });
}
