import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const words=fs.readFileSync(path.join(root,'NARRATION.txt'),'utf8').trim().split(/\s+/);
const raw=fs.readFileSync(path.join(root,'proof/voice-words.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const normalize=s=>s.toLowerCase().replace(/[’']/g,'').replace(/[^a-z]/g,'');
const expanded=raw.flatMap(r=>normalize(r.text)==='anyfire'?[{...r,text:'Any',end:r.start+450},{...r,text:'fire.',start:r.start+450}]:[r]);
if(expanded.length!==words.length)throw Error(`Recognition ${expanded.length}, approved ${words.length}`);
const corrections=[];
for(let i=0;i<words.length;i++)if(normalize(words[i])!==normalize(expanded[i].text)){
 if(words[i]==='in.'&&normalize(expanded[i].text)==='inn')corrections.push({index:i,recognized:expanded[i].text,approved:words[i]});
 else throw Error(`Unresolved recognition mismatch ${i}: ${words[i]} / ${expanded[i].text}`);
}
const voice=path.join(root,'public/voice.wav');
const result=spawnSync('ffmpeg',['-hide_banner','-i',voice,'-af','silencedetect=noise=-38dB:d=0.24','-f','null','-'],{encoding:'utf8'});
const starts=[...result.stderr.matchAll(/silence_start:\s*([\d.]+)/g)].map(m=>+m[1]);
const ends=[...result.stderr.matchAll(/silence_end:\s*([\d.]+)/g)].map(m=>+m[1]);
const gaps=starts.map((s,i)=>[s,ends[i]]);
const counts=[10,7,4,10,8,5,3,5,5,2,11,7,7,6,6];
if(gaps.length!==counts.length-1)throw Error('Expected fourteen sentence gaps');
const frames=[];let cursor=0;
for(let group=0;group<counts.length;group++){
 const a=group?gaps[group-1][1]:0,b=group<gaps.length?gaps[group][0]:34.72;
 const row=expanded.slice(cursor,cursor+counts[group]);
 const rawA=row[0].start/1000,rawB=Math.min(row.at(-1).end/1000,b);
 for(const r of row){const t=a+(r.start/1000-rawA)/Math.max(.1,rawB-rawA)*(b-a);frames.push(Math.max(0,Math.min(1044,Math.round(t*30)-1)));}
 cursor+=counts[group];
}
frames[0]=0;
for(let i=frames.length-2;i>=0;i--)frames[i]=Math.min(frames[i],frames[i+1]-2);
const captions=words.map((word,i)=>({word,start:frames[i],end:i+1<words.length?frames[i+1]:1047}));
fs.writeFileSync(path.join(root,'captions.json'),JSON.stringify(captions,null,2));
fs.writeFileSync(path.join(root,'proof/alignment-notes.json'),JSON.stringify({recognition:'Local FFmpeg whisper.cpp tiny.en max_len=1',corrections,alignment:'Fifteen approved spoken clauses anchored to fourteen measured gaps; token timing fitted within each speech interval.',anyFire:'Merged recognition expanded within measured 20.547–21.163s speech interval.',lastWord:'Recognition end overshoot clamped before actual sound tail.',silenceGaps:gaps,coverage:'Recognition/transcript and waveform checks; no listening review.'},null,2));
console.log(`${captions.length} approved caption words; ${corrections.length} recognition correction; ${gaps.length} speech gaps checked.`);
