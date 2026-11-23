// Captions from a words file. Rules (the user's Short rules): 1-2 words, shown from the word's start frame, held until the next caption starts
// (or the line ends), at least 3 frames. A function word pairs with the next word of the same line ("of his", "to buy", "him cake.").
// usage: node pipeline/captions-from-words.mjs <words.json> <out.json> [fps]
import fs from 'node:fs';
const [,,wf,out,fpsArg]=process.argv;
if(!wf||!out){console.error('usage: captions-from-words.mjs words.json out.json [fps]');process.exit(2);}
if(fs.existsSync(out))throw Error('refusing to overwrite '+out);
const FPS=+(fpsArg??30),W=JSON.parse(fs.readFileSync(wf,'utf8')).words;
const FW=new Set(['a','an','of','to','so','and','the','in','on','at','he','she','her','his','him','i\'ve','you','was','for','but','is','it','that','your','from','when','no','had','ever','how','can','who','be','as','by','my','me','we','up']);
const norm=s=>s.toLowerCase().replace(/[^a-z']/g,'');
const groups=[];
for(let i=0;i<W.length;i++){
 const w=W[i],n=W[i+1];
 // pair a short function word with the next word of the same line
 if(n&&n.line===w.line&&FW.has(norm(w.word))&&w.word.length<=4){groups.push([w,n]);i++;}
 else groups.push([w]);
}
// (not in the approved hook, lines 1-2) a lone word that would show for under 5 frames joins the one-word caption before it in the same line
for(let k=groups.length-1;k>0;k--){const g=groups[k],p=groups[k-1];if(g.length===1&&p.length===1&&g[0].line>2&&p[0].line===g[0].line&&Math.round((g[0].end-g[0].start)*FPS)<5){p.push(g[0]);groups.splice(k,1);}}
const caps=groups.map((g,k)=>{
 const first=g[0],last=g.at(-1),next=groups[k+1];
 const from=Math.round(first.start*FPS);
 let to=next&&next[0].line===last.line?Math.round(next[0].start*FPS):Math.round(last.end*FPS);
 if(to-from<3)to=from+3;
 return {from,to,word:g.map(x=>x.word).join(' ')};
});
fs.writeFileSync(out,JSON.stringify(caps,null,1)+'\n');
console.log(caps.length,'captions, longest',Math.max(...caps.map(c=>c.word.split(' ').length)),'words');
