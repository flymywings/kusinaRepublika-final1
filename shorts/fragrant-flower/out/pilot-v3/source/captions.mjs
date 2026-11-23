// node captions.mjs [--check]
// Builds captions.json from the take: measured phrase ends, and no word shown for under 5 frames.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),read=f=>JSON.parse(fs.readFileSync(path.join(here,f),'utf8'));
const map=read('edit-map.json'),words=read('words.json'),SR=16000,FPS=30,MIN=5;
const r=spawnSync('ffmpeg',['-v','error','-i',path.resolve(here,map.take),'-ac','1','-ar',String(SR),'-f','f32le','pipe:1'],{maxBuffer:32*1024*1024});
if(r.status!==0)throw new Error(String(r.stderr));
const pcm=new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset,r.stdout.byteOffset+r.stdout.length));

function lastSound(a,b){
 let last=a,heard=false;
 for(let i=Math.round(a*SR);i+160<=Math.min(pcm.length,Math.round(b*SR));i+=160){
  let s=0;for(let k=i;k<i+160;k++)s+=pcm[k]*pcm[k];
  if(Math.sqrt(s/160)>.003){
   // After a pause, sound belongs to the next phrase, even if it starts before that word's stamp.
   if(heard&&i/SR-last>=.15)break;
   heard=true;last=(i+160)/SR;
  }
 }
 return last;
}
const frames=c=>Math.ceil(c.end*FPS-1e-6)-Math.ceil(c.start*FPS-1e-6);
const out=[];
for(const seg of map.segments){
 const list=[];
 words.forEach(([at,word],i)=>{
  if(at<seg.from||at>=seg.to)return;
  const next=Math.min(words[i+1]?.[0]??seg.to,seg.to),stop=/[.]$/.test(word);
  // The recognizer can stamp the next phrase early, so a phrase stops at its last sound.
  const end=stop?Math.min(next,lastSound(at,Math.min(next,at+.8))+.07):next;
  list.push({start:seg.at+at-seg.from,end:seg.at+end-seg.from,word,stop});
 });
 for(let i=0;i<list.length;i++){
  while(frames(list[i])<MIN&&!list[i].stop&&i+1<list.length){
   const n=list.splice(i+1,1)[0];Object.assign(list[i],{end:n.end,stop:n.stop,word:`${list[i].word} ${n.word}`});
  }
 }
 for(let i=0;i<list.length;i++)if(frames(list[i])<MIN){
  if(!i||list[i-1].stop)throw new Error('cannot display '+list[i].word);
  Object.assign(list[i-1],{end:list[i].end,stop:list[i].stop,word:`${list[i-1].word} ${list[i].word}`});
  list.splice(i--,1);
 }
 for(const c of list)out.push({start:+c.start.toFixed(4),end:+c.end.toFixed(4),word:c.word,frames:frames(c)});
}
const want=words.filter(([at])=>map.segments.some(s=>at>=s.from&&at<s.to)).map(w=>w[1]).join(' ');
if(out.map(c=>c.word).join(' ')!==want)throw new Error('caption words differ from the kept narration');

const text=JSON.stringify(out,null,1)+'\n',file=path.join(here,'captions.json');
if(process.argv.includes('--check')){
 if(fs.readFileSync(file,'utf8')!==text)throw new Error('captions.json is stale');
 console.log(`captions ok: ${want.split(' ').length} words, shortest ${Math.min(...out.map(c=>c.frames))} frames`);
}else{
 fs.writeFileSync(file,text);
 console.log(out.map(c=>`${c.word} ${c.frames}f`).join(' | '));
}
