import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const [mode = 'stills', values = '0,29,50,132,200,256,310,380,411,440,503,532,554,609,627,673,740,765,812,870'] = process.argv.slice(2);
const output = path.join(root, 'proof');
fs.mkdirSync(output, { recursive: true });
const browserExecutable = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions = { gl: 'angle' };
const inputProps = { captions: mode !== 'bare' && mode !== 'review' };
const serveUrl = await bundle({ entryPoint: path.join(root, 'index.tsx'), publicDir: path.join(root, 'public') });
const browser = await openBrowser('chrome', { browserExecutable, chromiumOptions });
try {
  const browserProps = { serveUrl, inputProps, browserExecutable, chromiumOptions, puppeteerInstance: browser };
  const composition = await selectComposition({ ...browserProps, id: 'MayorWoodpecker' });
  const common = { ...browserProps, composition, timeoutInMilliseconds: 180000 };
  if (mode === 'stills' || mode === 'bare') {
    for (const frame of values.split(',').map(Number)) {
      await renderStill({ ...common, frame, output: path.join(output, `${mode}-${frame}.jpg`), imageFormat: 'jpeg', jpegQuality: 90, scale: .4 });
      console.log(`still ${frame}`);
    }
  } else {
    const final = mode === 'final';
    for (const value of (final ? ['0-887'] : values.split(','))) {
      const [start, end] = value.split('-').map(Number);
      const target = path.join(output, final ? 'picture.mp4' : `clip-${value}.mp4`);
      let last = -1;
      await renderMedia({ ...common, frameRange: [start, end], outputLocation: target, scale: final ? 4 / 3 : .4, codec: 'h264',
        crf: final ? 16 : 20, muted: true, concurrency: final ? 2 : 3, onProgress: ({ renderedFrames }) => {
          const checkpoint = Math.floor(renderedFrames / (final ? 60 : 30));
          if (checkpoint > last) { last = checkpoint; console.log(`${value}: ${renderedFrames}/${end - start + 1}`); }
        } });
      console.log(target);
    }
  }
} finally {
  await browser.close({ silent: true });
}
