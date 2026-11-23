import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';import {openBrowser,renderStill,renderMedia,selectComposition} from '@remotion/renderer';
const root=path.dirname(fileURLToPath(import.meta.url)),proof=path.join(root,'proof');fs.mkdirSync(proof,{recursive:true});
const mode=process.argv[2]??'stills',values=process.argv[3];
const full=mode==='final'||mode==='inspect',ratio=full?4/3:mode==='draft'?1:.5;
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe',chromiumOptions={gl:'angle'};
const inputProps={captions:mode!=='bare',pixelRatio:ratio,audio:mode!=='bare'&&mode!=='motion'};
const serveUrl=await bundle({entryPoint:path.join(root,'index.tsx'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions});
try{
 const common={serveUrl,inputProps,browserExecutable,chromiumOptions,puppeteerInstance:browser};
 const composition=await selectComposition({...common,id:'SupermarketAfterHours'});
 if(['stills','bare','inspect'].includes(mode))for(const frame of (values??'0,110,210,300,380,470,550,615,665,750,865,950,1090,1240,1330,1480').split(',').map(Number)){
  await renderStill({...common,composition,frame,scale:ratio,imageFormat:'png',output:path.join(proof,`v6-${mode}-${frame}.png`),timeoutInMilliseconds:240000});console.log('STILL '+frame);
 }else{
  const ranges=values?values.split(','):[`0-${composition.durationInFrames-1}`];
  for(const range of ranges){const [a,b]=range.split('-').map(Number);let last=-1;const outputLocation=path.join(proof,mode==='clips'||mode==='motion'?`v6-clip-${range}.mp4`:full?'After Hours - v6 - 2K.mp4':'After Hours - v6 - Draft.mp4');
   await renderMedia({...common,composition,frameRange:[a,b],scale:ratio,codec:'h264',crf:full?17:20,audioCodec:'aac',outputLocation,concurrency:2,timeoutInMilliseconds:300000,onProgress:({renderedFrames})=>{const n=Math.floor(renderedFrames/60);if(n!==last){last=n;console.log(`${range}: ${renderedFrames}/${b-a+1}`)}}});console.log('DONE '+outputLocation);
  }
 }
}finally{await browser.close({silent:true})}
