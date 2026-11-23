import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root,'proof');
fs.mkdirSync(out,{recursive:true});
const mode = process.argv[2] ?? 'clips';
const requested = process.argv[3]?.toLowerCase();
const browserExecutable = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions = {gl:'angle'};
const serveUrl = await bundle({entryPoint:path.join(root,'index.tsx')});
const browser = await openBrowser('chrome',{browserExecutable,chromiumOptions});
try {
  const ids=requested==='revision' ? ['RevisionHook','RevisionPayoff']
    : requested==='actioncut' ? ['ActionCut'] : requested==='full' ? ['Full'] : ['Hook','Reveal'];
  for (const id of ids) {
    if (requested && requested!=='revision' && id.toLowerCase()!==requested) continue;
    const common = {serveUrl,browserExecutable,chromiumOptions,puppeteerInstance:browser};
    const composition = await selectComposition({...common,id});
    const prefix = id.toLowerCase();
    if (mode === 'stills') {
      const frames = id === 'ActionCut' ? [5,16,29,38,114,182,226,277,295,310,356,448,458,477,493,556,633,674]
        : id === 'Full' ? [15,110,200,224,280,315,351,396,433,484,500,565,615,634,670]
        : id === 'Hook' ? [0,19,33,64] : [27,65,108,155,179,231,241,255,263];
      for (const frame of frames) await renderStill({...common,composition,frame,scale:.4,
        imageFormat:'jpeg',output:path.join(out,`${prefix}-${frame}.jpg`)});
    } else {
      const opening=mode==='opening' && id==='Full';
      const fullSize=mode!=='preview' && (id==='Full'||id==='ActionCut');
      await renderMedia({...common,composition,scale:fullSize?1:.4,codec:'h264',crf:18,muted:true,
        frameRange:opening?[0,2]:undefined,
        concurrency:fullSize?4:3,outputLocation:path.join(out,`${prefix}-${opening?'opening':'picture'}.mp4`)});
    }
    console.log(`${id} ${mode} complete`);
  }
} finally {
  await browser.close({silent:true});
}
