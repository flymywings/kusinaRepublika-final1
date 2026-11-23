import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const proof = path.join(root, 'proof');
fs.mkdirSync(proof, { recursive: true });
const requested = process.argv[2] ?? 'all';
const browserExecutable = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions = { gl: 'angle' };
const serveUrl = await bundle({ entryPoint: path.join(root, 'CastSheet.tsx'), publicDir: path.join(root, 'public') });
const browser = await openBrowser('chrome', { browserExecutable, chromiumOptions });
try {
  const common = { serveUrl, browserExecutable, chromiumOptions, puppeteerInstance: browser, timeoutInMilliseconds: 180000 };
  const jobs = requested === 'sheet' ? [['CastSheet', 'Character Cast - Approval.png']]
    : requested === 'placement' ? [['CastPlacement', 'Character Cast - In World.png']]
        : requested === 'identity' ? [['TayamaIdentity', 'Tayama - Identity Revision.png']]
          : [['CastSheet', 'Character Cast - Approval.png'], ['CastPlacement', 'Character Cast - In World.png'], ['TayamaIdentity', 'Tayama - Identity Revision.png']];
  for (const [id, name] of jobs) {
    const composition = await selectComposition({ ...common, id });
    const output = path.join(proof, name);
    await renderStill({ ...common, composition, frame: 0, scale: 1, imageFormat: 'png', output });
    console.log(`Saved ${output}`);
  }
} finally {
  await browser.close({ silent: true });
}
