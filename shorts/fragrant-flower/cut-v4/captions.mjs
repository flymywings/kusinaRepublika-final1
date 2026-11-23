// node captions.mjs  ->  captions.json (frames, 30 fps) for the hook and the start of 2A, from words-v3-corrected.json.
// Rules (user's Short rules): 1-2 words, shown from the frame nearest the word start. A group of two words starts on its first word.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const src=JSON.parse(fs.readFileSync(path.resolve(here,'../../../production-pipeline-proposal/voice/johnny-take-02/words-v3-corrected.json'),'utf8'));
const FPS=30,W=src.words;
const groups=[['This'],['girl'],['looked'],['terrified'],['of','his'],['face...'],['then'],['came'],['back'],['to','buy'],['him','cake.'],['Rintaro'],['is'],['tall,'],['blond,'],['pierced,'],['and','so'],['intimidating']];
let i=0;const out=[];
for(const g of groups){
 const first=W[i],last=W[i+g.length-1];
 if(g.join(' ')!==W.slice(i,i+g.length).map(w=>w.word).join(' '))throw Error('words differ at '+i+': '+g.join(' '));
 const next=W[i+g.length];
 // a caption ends where the next word starts, or at the phrase end when a pause follows
 const end=next&&next.line===last.line?next.start:last.end;
 out.push({from:Math.round(first.start*FPS),to:Math.round(end*FPS),word:g.join(' ')});
 i+=g.length;
}
for(let k=0;k<out.length;k++)if(out[k].to-out[k].from<3)throw Error('caption too short: '+out[k].word);
fs.writeFileSync(path.join(here,'captions.json'),JSON.stringify(out,null,1)+'\n');
console.log(out.map(c=>`${c.word} f${c.from}-${c.to} (${c.to-c.from})`).join(' | '));
