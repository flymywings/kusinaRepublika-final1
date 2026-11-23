// Pure helper shared by pipeline/shot-times.mjs (node) and the story code (bundled by Remotion): resolve word-anchored shots to frames.
// resolveShots(film, wordsJson) -> shots with f0 (first frame), f1 (one past the last frame), n, sec. No file access here.
const norm=s=>s.toLowerCase().replace(/[^a-z0-9']/g,'');
export function startOf(W,a){
 if(a.edge==='end'){const l=W.lines.find(x=>x.line===a.line);if(!l)throw Error('no line '+a.line);return l.end;}
 const w=W.words.filter(x=>x.line===a.line&&norm(x.word)===norm(a.word))[(a.nth??1)-1];
 if(!w)throw Error('word not found: line '+a.line+' '+a.word);return w.start;
}
export function resolveShots(film,W){
 const fps=film.fps??30,fr=t=>Math.round(t*fps);
 const shots=film.shots.map(s=>({...s,t:startOf(W,s.at)}));
 shots.forEach((s,i)=>{s.f0=fr(s.t);s.f1=i<shots.length-1?fr(startOf(W,film.shots[i+1].at)):fr(W.duration);s.n=s.f1-s.f0;s.sec=s.n/fps;});
 return shots;
}
/** the frame a word starts on */
export const wordFrame=(W,line,word,nth=1,fps=30)=>Math.round(startOf(W,{line,word,nth})*fps);
