// node pipeline/render.mjs <entry.tsx> <composition> <still|stills|video> <output>
//   [--frames 10,40] [--range a-b] [--scale 1] [--props '{"draft":true}'] [--public dir]
// Never overwrites. Bundles into its own temp folder and removes it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';

const {values:o,positionals}=parseArgs({allowPositionals:true,options:{
 frames:{type:'string',default:'0'},range:{type:'string'},scale:{type:'string',default:'1'},props:{type:'string',default:'{}'},public:{type:'string'},concurrency:{type:'string',default:'3'},
}});
const [entry,id,mode,out]=positionals;
if(!out||!['still','stills','video'].includes(mode)){console.error('usage: render.mjs <entry> <composition> <still|stills|video> <output>');process.exit(2);}
const frames=o.frames.split(',').map(Number),output=path.resolve(out);
const targets=mode==='stills'?frames.map(f=>path.join(output,`f${String(f).padStart(4,'0')}.png`)):[output];
for(const t of targets)if(fs.existsSync(t)){console.error('refusing to overwrite '+t);process.exit(3);}
const browserExecutable=process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions={gl:'angle'};
const work=fs.mkdtempSync(path.join(os.tmpdir(),'ff-pipeline-'));
let browser;
try{
 const empty=path.join(work,'public');fs.mkdirSync(empty);
 const serveUrl=await bundle({entryPoint:path.resolve(entry),publicDir:o.public?path.resolve(o.public):empty,outDir:path.join(work,'bundle')});
 browser=await openBrowser('chrome',{browserExecutable,chromiumOptions});
 const inputProps=JSON.parse(o.props),common={serveUrl,inputProps,browserExecutable,chromiumOptions,puppeteerInstance:browser,timeoutInMilliseconds:240000,logLevel:'error'};
 const composition=await selectComposition({...common,id}),scale=Number(o.scale),started=Date.now();
 if(mode!=='video'){
  if(new Set(targets).size!==targets.length)throw new Error('duplicate frames');
  for(const f of frames)if(!Number.isInteger(f)||f<0||f>=composition.durationInFrames)throw new Error('frame out of range: '+f);
 }
 if(mode==='video'){
  fs.mkdirSync(path.dirname(output),{recursive:true});
  const frameRange=o.range?o.range.split('-').map(Number):null;let last=-1;
  await renderMedia({...common,composition,scale,frameRange,codec:'h264',audioCodec:'aac',audioBitrate:'256k',pixelFormat:'yuv420p',crf:scale>1?17:19,concurrency:Number(o.concurrency),outputLocation:output,overwrite:false,
   onProgress:({renderedFrames})=>{const n=Math.floor(renderedFrames/120);if(n!==last){last=n;console.log('frames',renderedFrames);}}});
 }else{
  const staged=targets.map((_,i)=>path.join(work,`still-${i}.png`));
  for(let i=0;i<targets.length;i++)await renderStill({...common,composition,scale,frame:frames[i],imageFormat:'png',output:staged[i],overwrite:false});
  // Publish only after the whole batch rendered. An existing file is never replaced.
  const done=[];
  try{for(let i=0;i<targets.length;i++){fs.mkdirSync(path.dirname(targets[i]),{recursive:true});fs.copyFileSync(staged[i],targets[i],fs.constants.COPYFILE_EXCL);done.push(targets[i]);}}
  catch(e){for(const f of done)fs.unlinkSync(f);throw e;}
 }
 console.log('done',output,`${((Date.now()-started)/1000).toFixed(1)}s`);
}finally{
 if(browser)await browser.close({silent:true});
 fs.rmSync(work,{recursive:true,force:true});
}
