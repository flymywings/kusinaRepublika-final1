import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';import {openBrowser,renderStill,renderMedia,selectComposition} from '@remotion/renderer';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'proof');
const mode=process.argv[2]??'stills',requested=process.argv[3];
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions={gl:'angle'};
const full=mode==='final';const inputProps={captions:mode!=='bare',pixelRatio:full?4/3:.5};
const serveUrl=await bundle({entryPoint:path.join(root,'index.tsx'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions});
try{
 const common={serveUrl,inputProps,browserExecutable,chromiumOptions,puppeteerInstance:browser};
 if(mode==='stills'||mode==='bare'||mode==='review'){
  const comp=await selectComposition({...common,id:'DragonInsurance'});
  for(const frame of (requested??'0,48,140,410,490,535,575,620,810,890,1008,1020,1040').split(',').map(Number)){
   await renderStill({...common,composition:comp,frame,scale:.5,imageFormat:'png',output:path.join(out,`${mode}-${frame}.png`),timeoutInMilliseconds:180000});console.log(`STILL ${frame}`);
  }
 }
 if(mode!=='stills'&&mode!=='bare'){
  const ids=requested?[requested]:full?['DragonInsurance']:['DragonHook','DragonClaim','DragonEnding'];
  for(const id of ids){
   const composition=await selectComposition({...common,id});let last=-1;
   await renderMedia({...common,composition,outputLocation:path.join(out,`${id}-${full?'final':'proof'}.mp4`),scale:full?4/3:.5,codec:'h264',crf:full?16:20,audioCodec:'aac',concurrency:2,timeoutInMilliseconds:300000,onProgress:({renderedFrames})=>{const n=Math.floor(renderedFrames/30);if(n!==last){last=n;console.log(`${id} ${renderedFrames}/${composition.durationInFrames}`)}}});
   console.log(`DONE ${id}`);
  }
 }
}finally{await browser.close({silent:true})}
