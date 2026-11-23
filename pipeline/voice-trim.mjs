// Trim words out of an existing narration take, with matching word timings. No new voice is generated.
// usage: node pipeline/voice-trim.mjs --wav <in.wav> --words <words.json> --cut "3:literally" --cut "12:You see," --tag v4 [--out <dir>] [--fade-ms 15] [--search-ms 45]
//   --cut "<line>:<words as written in the words file>"  (repeat for several cuts; the words must be consecutive in that line)
// Writes <name>-<tag>.wav (24-bit), <name>-<tag>.mp3, words-<tag>.json (same format, times shifted) and trim-<tag>-report.json next to the input
// unless --out is given. Refuses to overwrite. Each cut point is moved to the quietest 2 ms frame within the search window, then to the nearest zero
// crossing, and the two sides are joined with a short linear crossfade. The report lists every cut with its time, the energy at the join and the
// largest sample step around it, so a human can listen at exactly those timestamps.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';

const {values:o}=parseArgs({options:{wav:{type:'string'},words:{type:'string'},cut:{type:'string',multiple:true},tag:{type:'string'},out:{type:'string'},'fade-ms':{type:'string',default:'15'},'search-ms':{type:'string',default:'45'}}});
if(!o.wav||!o.words||!o.cut?.length||!o.tag){console.error('usage: voice-trim.mjs --wav in.wav --words words.json --cut "3:literally" [--cut ...] --tag v4');process.exit(2);}
const SR=44100,FADE=Math.round(+o['fade-ms']*SR/1000),SEARCH=Math.round(+o['search-ms']*SR/1000),WIN=Math.round(.002*SR);
const ff=(a,input)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats',...a],{input,maxBuffer:1<<30});if(r.status)throw Error(String(r.stderr));return r;};
const RAW=['-f','f32le','-ar',String(SR),'-ac','1'];
const f32=b=>new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.length));
const x=f32(ff(['-v','error','-i',path.resolve(o.wav),...RAW,'pipe:1']).stdout);
const src=JSON.parse(fs.readFileSync(path.resolve(o.words),'utf8'));
const dir=path.resolve(o.out??path.dirname(path.resolve(o.wav))),base=path.basename(o.wav).replace(/-v\d+(\.wav)$/,'$1').replace(/\.wav$/,'').replace(/-edit.*$/,'-edit');
const OUT={wav:`${dir}/${base}-${o.tag}.wav`,mp3:`${dir}/${base}-${o.tag}.mp3`,words:`${dir}/words-${o.tag}.json`,report:`${dir}/trim-${o.tag}-report.json`};
for(const f of Object.values(OUT))if(fs.existsSync(f))throw Error('refusing to overwrite '+f);

const rms=(a,b)=>{let s=0;for(let i=Math.max(0,a);i<Math.min(x.length,b);i++)s+=x[i]*x[i];return Math.sqrt(s/Math.max(1,b-a));};
const dbf=v=>20*Math.log10(v+1e-9);
/** quietest 2 ms frame within the window around sample c, then the nearest zero crossing (sign change) to its centre */
function snap(c){
 let best=c,bv=1e9;
 for(let i=c-SEARCH;i<=c+SEARCH;i+=Math.round(WIN/2)){const v=rms(i-WIN/2,i+WIN/2);if(v<bv-1e-9){bv=v;best=i;}}
 let z=best;for(let d=0;d<Math.round(.004*SR);d++){for(const s of [best-d,best+d])if(s>0&&s<x.length-1&&(x[s-1]<=0)!==(x[s]<=0)){z=s;d=1e9;break;}}
 return z;
}
// ---- locate each cut: [start of the first cut word, start of the word after the last cut word]
const W=src.words,cuts=[];
for(const spec of o.cut){
 const k=spec.indexOf(':'),line=+spec.slice(0,k),text=spec.slice(k+1).trim().split(/\s+/);
 const idx=W.map((w,i)=>i).filter(i=>W[i].line===line);
 let first=-1;for(const i of idx){if(text.every((t,j)=>W[i+j]&&W[i+j].line===line&&W[i+j].word===t)){first=i;break;}}
 if(first<0)throw Error('cut not found: '+spec);
 const last=first+text.length-1,next=W[last+1];
 if(!next)throw Error('nothing follows the cut: '+spec);
 const tA=W[first].start,tB=next.start;
 cuts.push({spec,line,first,last,tA,tB,a:snap(Math.round(tA*SR)),b:snap(Math.round(tB*SR))});
}
cuts.sort((p,q)=>p.a-q.a);
for(let i=1;i<cuts.length;i++)if(cuts[i].a<=cuts[i-1].b)throw Error('cuts overlap');
// ---- build the output: keep [prev.b, cur.a), crossfade each join over FADE samples (the right side starts FADE samples early on the left side's tail)
const parts=[];let pos=0;
for(const c of cuts){parts.push([pos,c.a]);pos=c.b;}parts.push([pos,x.length]);
let outLen=parts.reduce((s,[a,b])=>s+b-a,0)-FADE*cuts.length;
const y=new Float32Array(outLen);let w=0;const joins=[];
parts.forEach(([a,b],pi)=>{
 const seg=x.subarray(a,b);
 if(pi===0){y.set(seg,w);w+=seg.length;return;}
 // overlap: the first FADE samples of seg mix with the last FADE samples already in y
 const o0=w-FADE;
 for(let i=0;i<FADE;i++){const t=(i+.5)/FADE;y[o0+i]=y[o0+i]*(1-t)+seg[i]*t;}
 y.set(seg.subarray(FADE),w);joins.push(o0);w+=seg.length-FADE;
});
// ---- report numbers at each join
const report=cuts.map((c,i)=>{
 const j=joins[i],removed=(c.b-c.a+FADE)/SR;
 let step=0,base=0;for(let s=j-FADE;s<j+2*FADE;s++)step=Math.max(step,Math.abs(y[s]-y[s-1]));
 for(let s=j-4000;s<j-FADE;s++)base=Math.max(base,Math.abs(y[s]-y[s-1]));
 return {cut:c.spec,removedWords:W.slice(c.first,c.last+1).map(v=>v.word).join(' '),inputCutFrom:+(c.a/SR).toFixed(4),inputCutTo:+(c.b/SR).toFixed(4),removedSeconds:+removed.toFixed(4),
  snapMovedMs:[+((c.a/SR-c.tA)*1000).toFixed(1),+((c.b/SR-c.tB)*1000).toFixed(1)],outputJoinAt:+(j/SR).toFixed(4),listenFrom:+(Math.max(0,j/SR-.6)).toFixed(2),listenTo:+(j/SR+.6).toFixed(2),
  rmsAtJoinDb:+dbf(rms(j-FADE,j+FADE)).toFixed(1),rmsBeforeDb:+dbf(rms(j-FADE-600,j-FADE)).toFixed(1),maxSampleStepAtJoin:+step.toFixed(4),maxSampleStepNearby:+base.toFixed(4),
  clickRisk:step>Math.max(.05,base*2.5)?'CHECK: step at the join is much larger than the signal nearby':'ok'};
});
// ---- shift the words: a word starting at or after a cut's end moves earlier by everything removed before it
const shiftAt=t=>{let s=0;for(const c of cuts){const sec=(c.b-c.a+FADE)/SR;if(t>=c.tB-1e-9)s+=sec;}return s;};
const dropped=new Set();for(const c of cuts)for(let i=c.first;i<=c.last;i++)dropped.add(i);
const words=W.filter((_,i)=>!dropped.has(i)).map(v=>({...v,start:+(v.start-shiftAt(v.start)).toFixed(3),end:+(v.end-shiftAt(v.end-1e-6)).toFixed(3)}));
const lines=src.lines.map(l=>{
 const mine=words.filter(v=>v.line===l.line);
 const text=mine.map(v=>v.word).join(' ');
 return {...l,text:l.text.includes('"')?text:text,start:mine.length?mine[0].start:+(l.start-shiftAt(l.start)).toFixed(3),end:mine.length?mine.at(-1).end:+(l.end-shiftAt(l.end-1e-6)).toFixed(3)};
});
const marks={};for(const [k,v] of Object.entries(src.marks))marks[k]=+(v-shiftAt(v)).toFixed(3);
// a mark that sat on a removed word moves to the word that now starts the line
for(const c of cuts){const nxt=W[c.last+1];for(const [k,v] of Object.entries(src.marks))if(v>=c.tA-1e-6&&v<c.tB-1e-6)marks[k]=+(nxt.start-shiftAt(nxt.start)).toFixed(3);}
const dur=+(y.length/SR).toFixed(3);
const outJson={...src,duration:dur,words,lines,marks,trim:{from:path.basename(o.words),cuts:report.map(r=>({cut:r.cut,removedWords:r.removedWords,removedSeconds:r.removedSeconds,outputJoinAt:r.outputJoinAt})),note:'all times after each cut are shifted earlier by the removed seconds; marks that sat on a removed word now sit on the next word'}};
// ---- write
const bytes=Buffer.from(y.buffer,y.byteOffset,y.byteLength);
ff(['-v','error','-n',...RAW,'-i','pipe:0','-c:a','pcm_s24le',OUT.wav],bytes);
ff(['-v','error','-n','-i',OUT.wav,'-c:a','libmp3lame','-q:a','1',OUT.mp3]);
fs.writeFileSync(OUT.words,JSON.stringify(outJson,null,1));
fs.writeFileSync(OUT.report,JSON.stringify({input:{wav:path.basename(o.wav),words:path.basename(o.words),durationSeconds:+(x.length/SR).toFixed(3)},output:{wav:path.basename(OUT.wav),durationSeconds:dur,words:words.length},fadeMs:+o['fade-ms'],searchMs:+o['search-ms'],joins:report},null,1));
console.log(JSON.stringify({durationBefore:+(x.length/SR).toFixed(3),durationAfter:dur,words:words.length,joins:report},null,1));
