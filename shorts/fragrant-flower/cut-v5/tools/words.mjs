// node words.mjs   (run with cwd = this folder, which holds model.bin)
// Method of voice/johnny-take-02/cut-v3.mjs: the ffmpeg whisper filter (model=model.bin, max_len=1, json) on the v3 master, 16 kHz mono, 0.8 s pad.
// Whisper's own word starts are rough (it often stamps word ends), so each start is then snapped to the nearest real energy onset
// in the 10 ms envelope of the master. Hook words (0-7.0 s) were also checked by hand on spectrograms and use those values.
// Phrase edges (first word of each line, last word end) and the marks words stay exactly as in words-v3.json.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const voice=path.resolve(here,'../../../../production-pipeline-proposal/voice/johnny-take-02');
const v3=JSON.parse(fs.readFileSync(path.join(voice,'words-v3.json'),'utf8'));
const wav=path.join(voice,'johnny-take-02-edit-v3.wav');
if(!fs.existsSync(path.join(here,'mst.jsonl'))){
 const ff=a=>{const r=spawnSync('ffmpeg',['-hide_banner','-v','error','-y',...a],{cwd:here});if(r.status)throw Error(String(r.stderr));};
 ff(['-i',wav,'-ar','16000','-ac','1','-af','apad=pad_dur=0.8','mst.wav']);
 ff(['-i','mst.wav','-af','whisper=model=model.bin:language=en:use_gpu=false:queue=90:max_len=1:format=json:destination=mst.jsonl','-f','null','-']);
}
const W=fs.readFileSync(path.join(here,'mst.jsonl'),'utf8').split(/\r?\n/).filter(s=>s.includes('"start"')).map(s=>{const m=s.match(/"start":(\d+),"end":(\d+),"text":"(.*)"/);return {s:m[1]/1000,t:m[3]};});
if(W.length!==180||v3.words.length!==180)throw Error('word count '+W.length);
// 10 ms envelope of the master
const SR=44100,N=Math.round(.01*SR);
const r=spawnSync('ffmpeg',['-v','error','-i',wav,'-f','f32le','-ar',String(SR),'-ac','1','pipe:1'],{maxBuffer:1<<30});
const x=new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset,r.stdout.byteOffset+r.stdout.length));
const E=[];for(let i=0;i+N<=x.length;i+=N){let s=0;for(let j=0;j<N;j++)s+=x[i+j]**2;E.push(10*Math.log10(s/N+1e-12));}
const at=t=>E[Math.max(0,Math.min(E.length-1,Math.round(t*100)))];
/** onset near t: the frame where the envelope starts a rise of >= 9 dB over the next 60 ms, out of a quiet frame (below the following peak - 9 dB) */
function onset(t,lo,hi){
 let best=null;
 for(let i=Math.round(lo*100);i<=Math.round(hi*100);i++){
  const pre=Math.max(...[-2,-1,0].map(k=>E[i+k]??-120)),peak=Math.max(...[1,2,3,4,5,6].map(k=>E[i+k]??-120));
  const rise=peak-pre;
  if(rise>=9&&pre<peak-9){const sc=rise-Math.abs(i/100-t)*60;if(!best||sc>best.sc)best={t:(i+.5)/100,sc,rise};}
 }
 return best;
}
// hand-checked hook values (spectrograms + envelope), seconds
const HAND={came:[2.68],girl:[.325],looked:[.742],terrified:[.865],of:[1.62],his:[1.7],'face...':[1.797],back:[2.947],to:[3.158],buy:[3.308],him:[3.628],'cake.':[3.72]};
const HAND_AT={15:4.961,16:5.185,17:5.66,18:6.16,19:6.67,20:6.78,21:6.95}; // tall, blond, pierced, and, so, intimidating
const locked=new Set(Object.values(v3.marks??{}).map(v=>+v));
const out=[],moved=[];
const lineFirst=new Set(),lineLast=new Set();
v3.words.forEach((w,i)=>{if(i===0||v3.words[i-1].line!==w.line)lineFirst.add(i);if(i===v3.words.length-1||v3.words[i+1].line!==w.line)lineLast.add(i);});
let hooked=new Set();
v3.words.forEach((w,i)=>{
 let start=w.start,status='v3-kept';
 if(lineFirst.has(i)||locked.has(w.start)){status='locked-phrase-edge-or-mark';}
 else if(w.start<1.9&&HAND[w.word]&&!hooked.has(w.word)){hooked.add(w.word);start=HAND[w.word][0];status='hand-checked';}
 else if(w.start<4&&HAND[w.word]&&!hooked.has(w.word)){hooked.add(w.word);start=HAND[w.word][0];status='hand-checked';}
 else if(HAND_AT[i]!==undefined){start=HAND_AT[i];status='hand-checked';}
 else{
  const wh=W[i].s,o=onset(wh,wh-.12,wh+.12);
  if(o){start=o.t;status='whisper+onset';}
  else if(Math.abs(wh-w.start)<.08){start=w.start;status='v3-agrees-with-whisper';}
  else{start=(wh+w.start)/2;status='fallback-midpoint(unverified)';}
 }
 out.push({word:w.word,start:+start.toFixed(3),end:w.end,line:w.line,status,v3:w.start,whisper:W[i].s});
});
// monotone inside a line, ends follow the next start, line ends exact
for(let i=0;i<out.length;i++){
 if(i&&out[i].line===out[i-1].line&&out[i].start<out[i-1].start+.05)out[i].start=+(out[i-1].start+.05).toFixed(3);
}
for(let i=0;i<out.length;i++){if(!lineLast.has(i))out[i].end=out[i+1].start;else out[i].end=v3.words[i].end;}
out.forEach((w,i)=>{const d=(w.start-w.v3)*30;if(Math.abs(d)>2)moved.push({i,word:w.word,v3:w.v3,corrected:w.start,frames:+d.toFixed(1),status:w.status});});
const counts={};for(const w of out)counts[w.status]=(counts[w.status]||0)+1;
const res={duration:v3.duration,
 method:'ffmpeg whisper filter (model.bin, max_len=1, json) on the v3 master as in cut-v3.mjs; each whisper start snapped to the nearest >=9 dB energy onset within 120 ms. Hook words (0-7.0 s) are hand-checked on spectrograms. Phrase edges and marks are exactly v3. Words with status fallback-midpoint(unverified) disagree with whisper by more than 80 ms and found no onset.',
 status_counts:counts,moved_over_2_frames:moved,words:out.map(({v3:a,whisper:b,...w})=>({...w,v3_start:a,whisper_start:b})),lines:v3.lines,marks:v3.marks};
fs.writeFileSync(path.join(voice,'words-v3-corrected.json'),JSON.stringify(res,null,1)+'\n');
console.log(counts,'moved>2f:',moved.length);
console.log(moved.slice(0,60).map(m=>`${m.word} ${m.v3}->${m.corrected} (${m.frames}f ${m.status})`).join('\n'));
