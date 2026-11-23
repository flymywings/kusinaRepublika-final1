import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia,renderStill} from '@remotion/renderer';
const [mode='stills',values='0,100,190,285,320,435,520,625,700,750,820,900,960',entry='diamond-field-v2/index.tsx',out='diamond-field-v2/proof',comp='DiamondShort']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe',chromiumOptions={gl:'angle'};
const inputProps={captions:mode!=='bare'};
const serveUrl=await bundle({entryPoint:path.resolve(entry),publicDir:path.resolve(path.dirname(entry),'public')});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions});
try{
 const composition=await selectComposition({serveUrl,id:comp,browserExecutable,chromiumOptions,puppeteerInstance:browser,inputProps});
 const common={composition,serveUrl,inputProps,browserExecutable,chromiumOptions,puppeteerInstance:browser,timeoutInMilliseconds:180000};
 if(mode==='stills')for(const frame of values.split(',').map(Number)){
  await renderStill({...common,frame,output:path.resolve(out,`frame-${frame}.jpg`),imageFormat:'jpeg',jpegQuality:92,scale:.4});console.log(`still ${frame}`);
 }else for(const value of values.split(',')){
  const range=value.split('-').map(Number),scale=mode==='final'?4/3:.4;
  let last=-1;await renderMedia({...common,frameRange:range,outputLocation:path.resolve(out,mode==='final'?'picture.mp4':values.includes(',')?`clip-${value}.mp4`:'preview.mp4'),scale,codec:'h264',crf:mode==='final'?16:18,muted:true,concurrency:2,onProgress:({renderedFrames})=>{const step=Math.floor(renderedFrames/90);if(step>last){last=step;console.log(`${value}: ${renderedFrames} frames`);}}});
 }
}finally{await browser.close({silent:true});}
