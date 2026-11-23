// node sound.mjs <output.wav> [--lufs -15]
// The take is cut only inside silence and placed sample for sample. Never retimed.
// Everything else is generated here, apart from the CC0 footsteps (BigSoundBank 0514).
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../..'),out=path.resolve(process.argv[2]??'');
if(!process.argv[2]){console.error('usage: sound.mjs <output.wav>');process.exit(2);}
if(fs.existsSync(out)){console.error('refusing to overwrite '+out);process.exit(3);}
const map=JSON.parse(fs.readFileSync(path.join(here,'edit-map.json'),'utf8'));
const SR=48000,N=Math.round(map.duration*SR),TARGET=-15,CEIL=10**(-2.2/20);

function ff(args,input){
 const r=spawnSync('ffmpeg',['-hide_banner','-nostats',...args],{input,maxBuffer:128*1024*1024});
 if(r.status!==0)throw new Error(r.stderr.toString());
 return r;
}
function decode(file){const b=ff(['-loglevel','error','-i',file,'-map','0:a:0','-ac','1','-ar',String(SR),'-f','f32le','pipe:1']).stdout;return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.length));}

const take=path.resolve(here,map.take);
if(createHash('sha256').update(fs.readFileSync(take)).digest('hex')!==map.sha256)throw new Error('take hash changed');
const src=decode(take),voice=new Float32Array(N),FADE=Math.round(.006*SR);
let worst=0;
for(const s of map.segments){
 const a=Math.round(s.from*SR),b=Math.min(src.length,Math.round(s.to*SR)),at=Math.round(s.at*SR);
 for(let i=a;i<b&&at+i-a<N;i++)voice[at+i-a]=src[i]*Math.min(1,(i-a)/FADE,(b-i)/FADE);
 // the joins must sit in silence
 for(const [x,y] of [[a,a+FADE],[b-FADE,b]])for(let i=Math.max(0,x);i<y;i++)if(s.from>0)worst=Math.max(worst,Math.abs(src[i]));
}
if(worst>.02)throw new Error('a cut lands on speech, peak '+worst.toFixed(3));

let seed=20261122;
const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1;};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const smooth=(t,a,b)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
function band(n,lo,hi){
 const out=new Float32Array(n),kl=1-Math.exp(-2*Math.PI*lo/SR),kh=1-Math.exp(-2*Math.PI*hi/SR);let l=0,h=0;
 for(let i=0;i<n;i++){const x=rand();h+=kh*(x-h);l+=kl*(h-l);out[i]=h-l;}
 return out;
}
const len=s=>Math.round(s*SR);
const make=(seconds,fn)=>Float32Array.from({length:len(seconds)},(_,i)=>fn(i/SR,i));

// practicals
const clink=(()=>{const n=band(len(.6),2500,9000);return make(.6,(t,i)=>{
 let v=n[i]*Math.exp(-t*140)*.9;
 for(const [f,a,d] of [[2210,.32,11],[3570,.22,15],[5430,.12,22],[7120,.05,30]])v+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);
 for(const [at,k] of [[.085,.4],[.14,.18]])if(t>at){const s=t-at;v+=k*(.3*Math.sin(2*Math.PI*2470*s)+.15*Math.sin(2*Math.PI*3990*s))*Math.exp(-s*26);}
 return v*Math.min(1,t/.001);});})();
const scrape=(()=>{const a=band(len(.36),260,1500),b=band(len(.36),1400,4000);let p=0;return make(.36,(t,i)=>{
 p+=(105+45*t/.36)/SR;const stick=Math.pow(Math.max(0,Math.sin(2*Math.PI*p)),3);
 return (a[i]*(.5+1.5*stick)+b[i]*stick*.4)*Math.sin(Math.PI*clamp(t/.36))**.6;});})();
const bell=make(1.5,t=>{let v=0;
 for(const [at,k] of [[0,1],[.115,.55],[.27,.34],[.46,.15]]){if(t<at)continue;const s=t-at;
  for(const [f,a,d] of [[1568,.22,3.4],[2093,.12,4.2],[3729,.1,7],[5210,.05,10]])v+=k*a*Math.sin(2*Math.PI*f*s)*Math.exp(-s*d)*Math.min(1,s/.002);}
 return v;});
const door=(()=>{const n=band(len(.3),70,700);return make(.3,(t,i)=>n[i]*1.6*Math.exp(-t*16)*Math.min(1,t/.003)+.2*Math.sin(2*Math.PI*86*t)*Math.exp(-t*20));})();
const cloth=seconds=>{const n=band(len(seconds),500,3800);return make(seconds,(t,i)=>n[i]*Math.sin(Math.PI*clamp(t/seconds))**2*(.7+.3*Math.sin(t*61)));};
const slide=(()=>{const n=band(len(.34),350,2400);return make(.34,(t,i)=>n[i]*Math.sin(Math.PI*clamp(t/.34)));})();
const swallow=make(.16,t=>Math.sin(2*Math.PI*(260*t-620*t*t))*Math.sin(Math.PI*clamp(t/.16))**2*.3);
const thud=make(1.1,t=>Math.sin(2*Math.PI*(62*t-9*t*t))*Math.exp(-t*3.2)*Math.min(1,t/.015)*.5);
const tick=make(.07,t=>(.3*Math.sin(2*Math.PI*1830*t)+.12*Math.sin(2*Math.PI*4100*t))*Math.exp(-t*70));
const steps=decode(path.join(root,'supermarket-after-hours/public/sfx-source/0514.mp3'));
const stepA=steps.slice(len(.38),len(.62)),stepB=steps.slice(len(1.08),len(1.32));

// felt piano
function note(midi,seconds=2){
 const f=440*2**((midi-69)/12);
 return make(seconds,t=>{let v=0;for(const [h,a] of [[1,1],[2,.2],[3,.07],[4.01,.02]])v+=a*Math.sin(2*Math.PI*f*h*t)*Math.exp(-t*(1.7+h*.7));
  return v*Math.min(1,t/.012)*Math.min(1,(seconds-t)/.1);});
}

const bus={bed:new Float32Array(N*2),fx:new Float32Array(N*2),music:new Float32Array(N*2)},events=[];
function put(name,clip,at,gain,pan=0,label){
 const s=Math.round(at*SR),l=Math.cos((pan+1)*Math.PI/4),r=Math.sin((pan+1)*Math.PI/4);
 for(let i=0;i<clip.length;i++){const j=s+i;if(j<0||j>=N)continue;const e=Math.min(1,i/48,(clip.length-i)/480);bus[name][2*j]+=clip[i]*gain*l*e;bus[name][2*j+1]+=clip[i]*gain*r*e;}
 if(label)events.push({at:+at.toFixed(3),label});
}
const reversed=x=>Float32Array.from(x).reverse();

// Beds: room, case hum, street. The room never disappears, except for the one withdrawal.
{
 const a=band(N,90,650),b=band(N,90,650),high=band(N,1600,5200),street=band(N,50,260),murA=band(N,220,900),murB=band(N,300,1100);
 for(let i=0;i<N;i++){
  const t=i/SR;
  const hush=1-.8*smooth(t,19.5,20.1)*(1-smooth(t,21.35,21.5));
  const outside=Math.max(smooth(t,.95,1.1)*(1-smooth(t,1.8,1.92)),smooth(t,4.15,4.3)*(1-smooth(t,5.4,5.52)),smooth(t,7.5,7.8)*(1-smooth(t,8.8,9))*.6,smooth(t,21.43,21.55)*(1-smooth(t,23.3,23.45)));
  const hum=.0032*Math.sin(2*Math.PI*118*t)+.0016*Math.sin(2*Math.PI*236*t);
  const m=smooth(t,21.5,21.8)*(1-smooth(t,22.9,23.4)),syl=Math.max(0,Math.sin(t*23)*Math.sin(t*7.3+1));
  bus.bed[2*i]=(a[i]*.12+high[i]*.007+hum+street[i]*.3*outside)*hush+murA[i]*.12*m*syl;
  bus.bed[2*i+1]=(b[i]*.12+high[i]*.006+hum+street[i]*.26*outside)*hush+murB[i]*.11*m*Math.max(0,Math.sin(t*19+2)*Math.sin(t*6.1));
 }
 for(const [at,pan] of [[2.85,-.6],[3.12,.5],[6.2,.4],[7.0,-.5],[8.95,.6],[9.4,-.3],[11.8,.5],[14.3,-.6],[16.6,.4],[17.9,-.4],[23.75,.5]])put('bed',tick,at,.11,pan);
}

// "The same three sounds." Identical buffers and spacing every time.
function same(at,gain,label){
 put('fx',clink,at,.42*gain,-.15,label+': fork');
 put('fx',scrape,at+.17,.4*gain,.1,label+': chair');
 put('fx',bell,at+.42,.38*gain,.25,label+': bell');
}
same(.72,1,'his version');
same(3.9,1,'the flight');
same(13.47,.9,'her side');
for(const at of [1.02,4.22])put('fx',door,at,.5,.2,'door');
for(const burst of [1,4.22]){let n=0;for(const z of [.42,.84,1.26,1.68,2.1,2.52,2.94,3.36]){const u=(z/4.6)**(1/1.4)*.88;put('fx',n%2?stepA:stepB,burst+u,.3*(1-n*.05),-.2+n*.07,n?undefined:'running steps');n++;}}

put('fx',thud,.02,.42,0,'his imagined size');
put('fx',cloth(.5),2.05,.1,0,'shoulders fall');
put('fx',cloth(.8),5.8,.13,-.2,'he sinks');
put('fx',bell,7.58,.26,.25,'bell, next day');put('fx',door,7.52,.24,.2,'door');
put('fx',stepB,7.95,.14,.2);put('fx',stepA,8.25,.14,.12);put('fx',stepB,8.55,.14,.05);
put('fx',cloth(.35),9.25,.1,-.3,'inhale');
put('fx',cloth(.8),9.85,.12,-.3,'his bow begins');
put('fx',cloth(.3),10.5,.24,.3,'her faster bow');
put('fx',slide,10.62,.3,.2,'box');
put('fx',reversed(bell).slice(len(.72)),12.45,.42,.25,'rewind: the bell backwards');
put('fx',reversed(scrape),12.92,.3,.1,'rewind: the chair backwards');
put('fx',cloth(.3),15.35,.13,.2,'hands to face');
put('fx',swallow,16.02,.5,0,'swallow');
put('fx',slide,16.68,.2,0,'the offer');
put('fx',cloth(.45),20.85,.12,0,'shoulders release');

// music: uncertainty low and bare, the truth in a warm open voicing
const play=(at,notes,gain=.05,spread=.09,seconds=2.2,label)=>notes.forEach((m,i)=>put('music',note(m,seconds),at+i*spread,gain,(i%3-1)*.2,i?undefined:label));
play(.02,[45,52],.06,.02,1.8,'cold fifth');
play(1.9,[57,60],.04,.3);play(2.75,[52],.04);
play(3.5,[64],.035);play(5.55,[53,57,60],.04,.16,2,'he assumes');
play(7.55,[55,62],.035,.14);play(9,[53,57],.035,.2);
play(10.95,[57,64,67],.04,.12,1.7,'she is first');
play(14.12,[53,60,64,67],.055,.13,2.6,'the picture changes meaning');
play(15.2,[69,67],.035,.3);play(16.5,[55,62,66],.045,.14,2.4);
play(17.6,[71],.03);play(18.2,[52,59,62],.035,.16,1.5);
play(20.68,[76],.04,0,1.2,'one note as his eyes open');
play(21.5,[45,52],.035,.05,2);
play(23.4,[53,60,64,69],.065,.07,1.1,'same face, resolved');

const pre=new Float32Array(N*2),VG=2.55;
let env=0;
for(let i=0;i<N;i++){
 const v=voice[i]*VG;env=Math.max(Math.abs(v),env*Math.exp(-1/(.16*SR)));
 const duck=1-.32*clamp(env*3);
 const fade=Math.min(1,(N-i)/(.12*SR));
 for(let c=0;c<2;c++){const j=2*i+c;pre[j]=(v+bus.bed[j]*1.25*duck+bus.fx[j]*(1-.12*clamp(env*3))+bus.music[j]*1.3*duck)*fade;}
}
function limit(gain){
 const o=new Float32Array(pre.length),ahead=Math.round(.002*SR),need=new Float32Array(N).fill(1);
 for(let i=0;i<N;i++){const p=Math.max(Math.abs(pre[2*i]),Math.abs(pre[2*i+1]))*gain;if(p>CEIL)for(let j=Math.max(0,i-ahead);j<=i;j++)need[j]=Math.min(need[j],CEIL/p);}
 let g=1;const rel=Math.exp(-1/(.06*SR));
 for(let i=0;i<N;i++){g=Math.min(need[i],1-(1-g)*rel);o[2*i]=pre[2*i]*gain*g;o[2*i+1]=pre[2*i+1]*gain*g;}
 return o;
}
function lufs(x){
 const e=ff(['-f','f32le','-ar',String(SR),'-ac','2','-i','pipe:0','-af','ebur128','-f','null','-'],Buffer.from(x.buffer)).stderr.toString();
 return Number(e.slice(e.lastIndexOf('Summary:')).match(/I:\s+(-?[\d.]+)/)[1]);
}
let gain=1,mix=limit(gain),level=lufs(mix);
for(let i=0;i<4&&Math.abs(level-TARGET)>.15;i++){gain*=10**((TARGET-level)/20);mix=limit(gain);level=lufs(mix);}
fs.mkdirSync(path.dirname(out),{recursive:true});
ff(['-loglevel','error','-f','f32le','-ar',String(SR),'-ac','2','-i','pipe:0','-c:a','pcm_s24le','-n',out],Buffer.from(mix.buffer));
events.sort((a,b)=>a.at-b.at);
fs.writeFileSync(out.replace(/\.wav$/,'.cues.json'),JSON.stringify({duration:map.duration,lufs:level,worstJoinPeak:worst,inserted:map.insertedPauses,events},null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({out,lufs:level,gain:+gain.toFixed(3),worstJoinPeak:+worst.toFixed(4),cues:events.length}));
