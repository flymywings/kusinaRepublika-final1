import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const [V]=process.argv.slice(2),SR=44100,n=t=>Math.round(t*SR);
const ff=(a,input)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats',...a],{input,maxBuffer:256e6});if(r.status)throw Error(String(r.stderr));return r;};
const f32=b=>new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)),raw=['-f','f32le','-ar',String(SR),'-ac','1'];
const load=f=>f32(ff(['-v','error','-i',f,...raw,'pipe:1']).stdout);
const sil=f=>[...String(ff(['-i',f,'-af','silencedetect=n=-45dB:d=0.14','-f','null','-']).stderr).matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map(m=>[+m[1]-+m[2],+m[1]]);
const F=`${V}/raw/full.mp3`,x=load(F),p=load(`${V}/raw/patch-b-chosen.mp3`),gaps=sil(F);
// [until, speed, gain dB]
const plan=[[3.2,1,-.8],[6.7,1.1,1.5],[9.8,1.22,-1.5],[13.1,1.15,0],[19,1.22,-1.1],[21.7,1,2.2],[23.9,1,1.3],[25.3,1,3.1],[28.4,1.12,.1],[30.2,1,1.5],[33.2,1,-1.25],[34.5,1.12,-1.3],[38,1.25,-1.3],[39.8,1,2.7],[41.6,1,1.5],[45,1,2.9],[47,1,.7],[48.6,1,1],[50.8,1,.7],[53.9,.88,.7],[57.5,1,2.7],[59,1,4.7]];
const at=t=>plan.find(v=>t<v[0])??plan.at(-1),M=.015;
const seg=[];let s=0;for(const [a,z] of gaps){if(a>s+.02)seg.push([s,a]);s=z;}if(s<x.length/SR-.02)seg.push([s,x.length/SR]);
const amp=d=>10**(d/20),out=[],map=[];let len=0,last=null,lastEnd=0;
const push=y=>{out.push(y);len+=y.length;};
const TRIM=[[3.35,.25],[6.867,.25],[9.95,.25],[13.242,.25],[19.212,.25],[21.99,.25],[25.652,.35],[26.958,.25],[28.682,.25]];
const speech=(src,a,z,rate,db,file)=>{
 let y=src.slice(n(a),n(z));
 if(rate!==1)y=f32(ff(['-v','error',...raw,'-i','pipe:0','-af','atempo='+rate,...raw,'pipe:1'],Buffer.from(y.buffer)).stdout);
 const E=132;for(let i=0;i<y.length;i++)y[i]*=amp(db)*Math.min(1,i/E,(y.length-1-i)/E);
 map.push({file,src:[+a.toFixed(3),+z.toFixed(3)],out:[+(len/SR).toFixed(3),+((len+y.length)/SR).toFixed(3)],rate,db});push(y);};
const pause=(src,a,z,from,to,total)=>{
 const orig=src.slice(n(a),n(z)),want=total?n(total):orig.length;let g=orig;
 if(want<orig.length){g=new Float32Array(want);const c=want>>1,R=orig.length-want,K=Math.min(220,c);for(let i=0;i<want;i++){const j=i<c?i:i+R;g[i]=orig[j]*Math.min(1,i<c?(c-i)/K:(i-c)/K);}}
 const y=new Float32Array(Math.max(g.length,want)),h=g.length>>1,E=220;
 for(let i=0;i<g.length;i++){const j=i<h?i:i+y.length-g.length;let k=amp(from+(to-from)*i/g.length);if(y.length>g.length){if(i<h)k*=Math.min(1,(h-i)/E);else k*=Math.min(1,(i-h)/E);}y[j]=g[i]*k;}
 push(y);};
let done=false,lead=p.findIndex(v=>Math.abs(v)>10**(-45/20))/SR;
for(const [A,Z] of seg){
 const a=Math.max(0,A-M),z=Math.min(x.length/SR,Z+M),[,r,db]=at((A+Z)/2);
 if(A>30.5&&A<33.1){
  if(done)continue;done=true;
  pause(x,lastEnd,a,last,db,1.3-lead-M);
  speech(p,0,2.075+M,1,db,'patch-b-chosen');
  pause(p,2.075+M,2.364762-M,db,-1.3,.43);
  last=-1.3;lastEnd=null;continue;}
 if(last!==null&&lastEnd!==null)pause(x,lastEnd,a,last,db,A>57.5?.65-2*M:((t=>t?t[1]-2*M:0)(TRIM.find(([t])=>Math.abs(a-t)<.03))));
 else if(last===null&&a>0)pause(x,0,a,db,db);
 speech(x,a,z,r,db,'full');last=db;lastEnd=z;}
if(lastEnd<x.length/SR)pause(x,lastEnd,x.length/SR,last,last);
const all=new Float32Array(len);let o=0;for(const y of out){all.set(y,o);o+=y.length;}
const i=+[...String(ff([...raw,'-i','pipe:0','-af','ebur128','-f','null','-'],Buffer.from(all.buffer)).stderr).matchAll(/ I:\s+(-?[\d.]+) LUFS/g)].at(-1)[1];
ff(['-v','error','-n',...raw,'-i','pipe:0','-af',`volume=${(-16-i).toFixed(2)}dB,aresample=176400,alimiter=limit=0.8:attack=3:release=60:level=false:latency=1,aresample=${SR}`,'-c:a','pcm_s24le',`${V}/johnny-take-01-edit-v2.wav`],Buffer.from(all.buffer));
ff(['-v','error','-n','-i',`${V}/johnny-take-01-edit-v2.wav`,'-c:a','libmp3lame','-q:a','1',`${V}/johnny-take-01-edit-v2.mp3`]);
fs.writeFileSync(`${V}/edit-map-v2.json`,JSON.stringify({before:x.length/SR,after:len/SR,rewindPause:1.3,staysPause:.65,speech:map},null,1));
console.table(map.map(m=>({src:m.src.join('-'),out:m.out.join('-'),rate:m.rate,db:m.db,file:m.file})));
