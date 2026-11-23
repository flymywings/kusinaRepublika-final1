// verifies the exported master (wav) against the script and the targets; prints JSON for QA.md
// usage: WHISPER_MODEL=<model.bin> node verify.mjs <take-dir> [outDir=take-dir] > qa-data.json
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const DIR=path.resolve(process.argv[2]??'.'),OUT=path.resolve(process.argv[3]??DIR);
const SR=44100,NH=Math.round(.005*SR),H=NH/SR,THR=-48;
const ff=(a,input)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats',...a],{input,maxBuffer:1e9});if(r.status)throw Error(String(r.stderr));return r;};
const f32=b=>new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)),RAW=['-f','f32le','-ar',String(SR),'-ac','1'],bytes=x=>Buffer.from(x.buffer,x.byteOffset,x.byteLength);
const load=f=>f32(ff(['-v','error','-i',f,...RAW,'pipe:1']).stdout);
const env=(x,h=H)=>{const n=Math.round(h*SR),o=[];for(let i=0;i+n<=x.length;i+=n){let s=0;for(let j=0;j<n;j++)s+=x[i+j]*x[i+j];o.push(10*Math.log10(s/n+1e-12));}return o;};
const sum=x=>{const r0=String(ff([...RAW,'-i','pipe:0','-af','ebur128=peak=true','-f','null','-'],bytes(x)).stderr),r=r0.slice(r0.lastIndexOf('Summary:'));const g=re=>+r.match(re)[1];return {I:g(/I:\s+(-?[\d.]+) LUFS/),LRA:g(/LRA:\s+([\d.]+) LU/),TP:g(/Peak:\s+(-?[\d.]+) dBFS/)};};
const lufs=x=>{const p=new Float32Array(x.length+SR/2);p.set(x,SR/4);const r=[...String(ff([...RAW,'-i','pipe:0','-af','ebur128','-f','null','-'],bytes(p)).stderr).matchAll(/ I:\s+(-?[\d.]+) LUFS/g)].at(-1);return r?+r[1]:null;};
const act=x=>{const e=env(x),mx=e.reduce((a,b)=>Math.max(a,b),-99),k=f32(ff([...RAW,'-i','pipe:0','-af','highshelf=f=1681:g=4:t=q:w=0.7071,highpass=f=38:poles=2:t=q:w=0.5',...RAW,'pipe:1'],bytes(x)).stdout);let t=0,c=0;for(let i=0;i<e.length;i++)if(e[i]>mx-30)for(let j=0;j<NH;j++){t+=k[i*NH+j]**2;c++;}return -0.691+10*Math.log10(t/c+1e-12);};
const tok=fs.readFileSync(path.resolve(DIR,'..','SCRIPT-D-final.txt'),'utf8').replace(/\[[^\]]*\]/g,'').split(/\s+/).filter(Boolean);
const wavF=`${OUT}/johnny-take-02-edit.wav`,mp3F=`${OUT}/johnny-take-02-edit.mp3`,map=JSON.parse(fs.readFileSync(`${OUT}/edit-map.json`)),wj=JSON.parse(fs.readFileSync(`${OUT}/words.json`));
const x=load(wavF),E=env(x),dur=x.length/SR,res={};
res.duration=dur;res.mp3Duration=+String(spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',mp3F]).stdout).trim();
res.format=String(spawnSync('ffprobe',['-v','error','-show_entries','stream=codec_name,sample_rate,channels,bits_per_raw_sample','-of','csv=p=0',wavF]).stdout).trim();
res.loud=sum(x);
// short-term range of loudness is LRA above; momentary extremes per sentence below
// ---- audible gaps on the master
const aud=[];{let i=0;while(i<E.length){if(E[i]>THR){let j=i;while(j<E.length&&E[j]>THR)j++;aud.push([i*H,j*H]);i=j}else i++}}
const gaps=[];for(let k=1;k<aud.length;k++)gaps.push([aud[k-1][1],aud[k][0],aud[k][0]-aud[k-1][1]]);
res.leadIn=aud[0][0];res.lastAudible=aud.at(-1)[1];res.tailAfterLast=dur-aud.at(-1)[1];
res.pauses=map.pauses.map(p=>{const g=gaps.reduce((b,c)=>Math.abs(c[0]-p.from)<Math.abs(b[0]-p.from)?c:b);return {after:p.after,set:p.set,measured:+g[2].toFixed(3),from:+g[0].toFixed(3),to:+g[1].toFixed(3)};});
// ---- transcript of the master
const work=fs.mkdtempSync(path.join(os.tmpdir(),'jt02v-'));fs.copyFileSync(process.env.WHISPER_MODEL,work+'/model.bin');
ff(['-v','error','-y','-i',wavF,'-ar','16000','-ac','1','-af','apad=pad_dur=0.8',work+'/m.wav']);
const r=spawnSync('ffmpeg',['-v','error','-i','m.wav','-af','whisper=model=model.bin:language=en:use_gpu=false:queue=90:max_len=1:format=json:destination=m.jsonl','-f','null','-'],{cwd:work});if(r.status)throw Error(String(r.stderr));
const MW=fs.readFileSync(work+'/m.jsonl','utf8').split(/\r?\n/).filter(s=>s.includes('"start"')).map(s=>{const m=s.match(/"start":(\d+),"end":(\d+),"text":"(.*)"\s*\}/);return m[3].trim();});
const norm=s=>s.toLowerCase().replace(/[^a-z']/g,'').replace(/^blonde$/,'blond');
res.transcript=MW.join(' ');res.transcriptCount=MW.length;
res.mismatch=[];for(let i=0;i<Math.max(MW.length,tok.length);i++)if(norm(MW[i]??'')!==norm(tok[i]??''))res.mismatch.push([i,MW[i],tok[i]]);
// ---- words.json integrity
const W=wj.words;res.words={count:W.length,exact:W.every((w,i)=>w.word===tok[i]),monotonic:W.every((w,i)=>w.end>w.start&&(i===0||w.start>=W[i-1].end-1e-6)),dur:wj.duration};
res.words.minDur=Math.min(...W.map(w=>w.end-w.start));res.words.maxDur=Math.max(...W.map(w=>w.end-w.start));
res.words.longest=W.map((w,i)=>[w.word,+(w.end-w.start).toFixed(3),w.start]).sort((a,b)=>b[1]-a[1]).slice(0,5);
// every word carries audio: peak 5ms-RMS inside the word must be well above the floor; level of each word vs its line
const wl=W.map(w=>{const s=x.slice(Math.round(w.start*SR),Math.round(w.end*SR)),e=env(s);return Math.max(...e);});
res.words.weakest=W.map((w,i)=>[w.word,+wl[i].toFixed(1),w.start]).sort((a,b)=>a[1]-b[1]).slice(0,6);
// no word stretched across a pause: no word span contains a >=0.15 s gap
res.words.acrossGap=W.filter(w=>gaps.some(g=>g[2]>=.15&&g[0]>w.start+.01&&g[1]<w.end-.01)).map(w=>w.word);
// ---- per sentence rows
const SENT=[[0,13],[14,27],[28,37],[38,52],[53,62],[63,69],[70,83],[84,96],[97,106],[107,119],[120,131],[132,142],[143,153],[154,165],[166,179]];
res.sent=SENT.map(([a,z])=>{const s=W[a].start,e=W[z].end,ps=map.pieces.filter(p=>p.text.split(' ').length&&tok.indexOf(p.text.split(' ')[0],0)>=0&&p.outAudible[0]>=s-.02&&p.outAudible[1]<=e+.02);
 const ig=gaps.filter(g=>g[0]>=s&&g[1]<=e&&g[2]>=.09).reduce((t,g)=>t+g[2],0);
 const before=ps.length?map.pauses.findIndex(p=>Math.abs(p.to-s)<.03):-1;
 return {words:`${tok[a]}..${tok[z]}`,n:z-a+1,start:s,end:e,rates:[...new Set(ps.map(p=>p.rate))],wps:+((z-a+1)/(e-s-ig)).toFixed(2),wpsSpan:+((z-a+1)/(e-s)).toFixed(2),gapBefore:a===0?+s.toFixed(3):(res.pauses.find(p=>Math.abs(p.to-s)<.03)?.measured??null),lufs:+lufs(x.slice(Math.round((s-.05)*SR),Math.round((e+.05)*SR))).toFixed(1)};});
// per-piece wps and lufs (rate table)
res.pieceRows=map.pieces.map(p=>{const w=p.text.split(' ').length;const s=p.outAudible[0],e=p.outAudible[1];const ig=gaps.filter(g=>g[0]>=s&&g[1]<=e&&g[2]>=.09).reduce((t,g)=>t+g[2],0);return {piece:p.piece,text:p.text.slice(0,34),rate:p.rate,wps:+(w/(e-s-ig)).toFixed(2),lufs:+lufs(x.slice(Math.round((s-.03)*SR),Math.round((e+.03)*SR))).toFixed(1),active:+act(x.slice(Math.round((s-.03)*SR),Math.round((e+.03)*SR))).toFixed(1)};});
// POUNDING / stays levels (word-level K-weighted-free RMS over word and over neighbours)
const rms=(a,b)=>{const s=x.slice(Math.round(a*SR),Math.round(b*SR));let t=0;for(const v of s)t+=v*v;return 10*Math.log10(t/s.length+1e-12);};
const pw=W[119],hw=W.slice(107,119);res.pounding={activeWord:act(x.slice(Math.round(pw.start*SR),Math.round(pw.end*SR))),activeLine13:act(x.slice(Math.round(W[115].start*SR),Math.round(W[119].end*SR))),activeStays:act(x.slice(Math.round(W[178].start*SR),Math.round(W[179].end*SR))),activeNeighbour:act(x.slice(Math.round(W[166].start*SR),Math.round(W[177].end*SR))),word:rms(pw.start,pw.end),lineBefore:rms(W[107].start,W[114].end),line13:rms(W[115].start,W[119].end),lufsWord:lufs(x.slice(Math.round(pw.start*SR),Math.round(pw.end*SR))),stays:lufs(x.slice(Math.round(W[178].start*SR),Math.round(W[179].end*SR))),neighbours:lufs(x.slice(Math.round(W[166].start*SR),Math.round(W[177].end*SR)))};
// momentary loudness trace extremes (400 ms blocks inside speech) per piece to spot buried lines
// ---- joins: the piece edges must sit in silence; report level and largest step around each join
res.joins=[];for(const p of map.pieces){for(const t of [p.outRange[0],p.outRange[1]]){const a=Math.round(t*SR);const s=x.slice(Math.max(0,a-44),Math.min(x.length,a+44));let m=0,st=0;for(let i=0;i<s.length;i++){m=Math.max(m,Math.abs(s[i]));if(i)st=Math.max(st,Math.abs(s[i]-s[i-1]));}res.joins.push({piece:p.piece,t:+t.toFixed(3),peakDb:+(20*Math.log10(m+1e-9)).toFixed(1),stepDb:+(20*Math.log10(st+1e-9)).toFixed(1)});}}
const SE=env(load(`${DIR}/raw/${map.base}.mp3`));res.cutLevels=map.pieces.map(p=>{const lv=t=>{const i=Math.round(t/H);return Math.max(...SE.slice(Math.max(0,i-1),i+2));};return {piece:p.piece,startDb:+lv(p.srcRange[0]).toFixed(1),endDb:+lv(p.srcRange[1]).toFixed(1)};});
// ---- pitch (median f0 of voiced frames) source vs master, per piece
const src=load(`${DIR}/raw/${map.base}.mp3`);
const f0=(s,rate=1)=>{const n=Math.round(.04*SR),hop=Math.round(.02*SR),out=[];const mx=Math.max(...env(s));for(let i=0;i+n<s.length;i+=hop){const fr=s.slice(i,i+n);let e=0;for(const v of fr)e+=v*v;if(10*Math.log10(e/n+1e-12)<mx-20)continue;const lo=Math.round(SR/400),hi=Math.round(SR/70),cs=[];let best=0;for(let l=lo;l<=hi;l++){let c=0,e2=0;for(let j=0;j+l<n;j++){c+=fr[j]*fr[j+l];e2+=fr[j+l]*fr[j+l]}const v=c/Math.sqrt(e*e2+1e-18);cs.push(v);if(v>best)best=v;}let bl=0;for(let q=1;q<cs.length-1;q++)if(cs[q]>=.9*best&&cs[q]>=cs[q-1]&&cs[q]>=cs[q+1]){bl=lo+q;break;}
if(best>.7)out.push(SR/bl);}out.sort((a,b)=>a-b);return {f0:out[out.length>>1]??null,n:out.length};};
// pitch: frame-by-frame f0 on time-warped matching frames (output time u -> source time u*rate inside each piece); median cents difference.
// rate=1 pieces act as the control (same audio, so the estimator's own noise shows up there).
const f0at=(s,t)=>{const n=Math.round(.04*SR),i=Math.round(t*SR);if(i<0||i+n>s.length)return null;const fr=s.slice(i,i+n);let e=0;for(const v of fr)e+=v*v;if(10*Math.log10(e/n+1e-12)<-45)return null;const lo=Math.round(SR/300),hi=Math.round(SR/75),cs=[];let best=0;for(let l=lo;l<=hi;l++){let c=0,e2=0;for(let j=0;j+l<n;j++){c+=fr[j]*fr[j+l];e2+=fr[j+l]*fr[j+l]}const v=c/Math.sqrt(e*e2+1e-18);cs.push(v);if(v>best)best=v;}if(best<.8)return null;for(let q=1;q<cs.length-1;q++)if(cs[q]>=.95*best&&cs[q]>=cs[q-1]&&cs[q]>=cs[q+1])return SR/(lo+q);return null;};
res.pitch=map.pieces.map(p=>{const d=[];for(let u=.03;u<p.outRange[1]-p.outRange[0]-.06;u+=.01){const fo=f0at(x,p.outRange[0]+u),fs_=f0at(src,p.srcRange[0]+u*p.rate);if(fo&&fs_){const c=1200*Math.log2(fo/fs_);if(Math.abs(c)<300)d.push(c);}}d.sort((a,b)=>a-b);const md=d.length?d[d.length>>1]:null;return {piece:p.piece,rate:p.rate,frames:d.length,medianCents:md===null?null:+md.toFixed(1),p10:d.length?+d[Math.floor(d.length*.1)].toFixed(0):null,p90:d.length?+d[Math.floor(d.length*.9)].toFixed(0):null};});
// stray artifacts in pauses: loudest 5 ms frame in the interior of every set pause (edges excluded: they carry the word decays)
res.pauseInterior=map.pauses.map(p=>{const a=Math.round((p.from+.1)/H),b=Math.round((p.to-.06)/H);return {after:p.after,measured:p.measured,maxDb:b>a?+Math.max(...E.slice(a,b)).toFixed(1):null};});
// ---- mp3 vs wav loudness / peak
const m=load(mp3F);res.mp3=sum(m);
fs.rmSync(work,{recursive:true,force:true});
console.log(JSON.stringify(res,null,1));
