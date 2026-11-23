// v2 (2026-11-23): cached filters (fast), new effects (whoosh slam thud rustle scrape riser chime bellshake step), and a composed music bed (no noise beds).
// Build a film's sound from the untouched voice master and a cue list. The voice is placed sample for sample at gain 1.0; every effect is generated here
// (one reusable buffer per kind) and sits 7-10 dB under the voice's own speech level; beds sit 15 dB under. Then the sum is lifted to the target loudness
// with a true-peak limiter, so the voice is only ever scaled by that one master gain.
// usage: node pipeline/sound-build.mjs --voice <voice.wav> --cues <cues.json> --out <master.wav> [--fps 30] [--seconds 54.867] [--lufs -14]
// cues.json: {"cues":[{"frame":871,"kind":"clunk","gain":1,"reverse":false}],"beds":[{"kind":"room","from":0,"to":1646}]}
// kinds: fork clink tap bell piano whir clunk heart cloth chair | beds: room hum air
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';
const {values:o}=parseArgs({options:{voice:{type:'string'},cues:{type:'string'},out:{type:'string'},fps:{type:'string',default:'30'},seconds:{type:'string'},lufs:{type:'string',default:'-14'}}});
if(!o.voice||!o.cues||!o.out){console.error('usage: sound-build.mjs --voice v.wav --cues cues.json --out master.wav');process.exit(2);}
if(fs.existsSync(o.out))throw Error('refusing to overwrite '+o.out);
const SR=48000,FPS=+o.fps,CUES=JSON.parse(fs.readFileSync(o.cues,'utf8'));
const ff=(a,input)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats',...a],{input,maxBuffer:1<<30});if(r.status)throw Error(String(r.stderr));return r;};
const RAW=['-f','f32le','-ar',String(SR),'-ac','1'];
const v=new Float32Array((()=>{const b=ff(['-v','error','-i',o.voice,...RAW,'pipe:1']).stdout;return b.buffer.slice(b.byteOffset,b.byteOffset+b.length);})());
const SECONDS=o.seconds?+o.seconds:v.length/SR,N=Math.round(SECONDS*SR);
const voice=new Float32Array(N);voice.set(v.subarray(0,N));
const rms=(x,a=0,b=x.length)=>{let s=0;for(let i=a;i<b;i++)s+=x[i]*x[i];return Math.sqrt(s/Math.max(1,b-a));};
const db=x=>20*Math.log10(x+1e-12),lin=d=>10**(d/20),clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const win=Math.round(.1*SR),levels=[];for(let i=0;i+win<=N;i+=win)levels.push(rms(voice,i,i+win));
const top=Math.max(...levels),speech=levels.filter(l=>db(l)>db(top)-25),VOICE=Math.sqrt(speech.reduce((a,l)=>a+l*l,0)/speech.length);
let seed=20261123;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1;};
const lp=(x,f)=>{const k=1-Math.exp(-2*Math.PI*f/SR);let y=0;return Float32Array.from(x,v=>(y+=k*(v-y)));};
const hp=(x,f)=>{const l=lp(x,f);return Float32Array.from(x,(v,i)=>v-l[i]);};
const make=(sec,fn)=>Float32Array.from({length:Math.round(sec*SR)},(_,i)=>fn(i/SR,i));
const level=(b,under,over)=>{const n=Math.min(b.length,Math.round(over*SR)),g=VOICE*lin(-under)/(rms(b,0,n)||1);return Float32Array.from(b,x=>x*g);};
const noise=make(1.4,()=>rnd());
const LPN=new Map();const lpn=f=>{if(!LPN.has(f))LPN.set(f,lp(noise,f));return LPN.get(f);};
const B={};
B.fork=level((()=>{const n=hp(noise,2500);return make(.12,(t,i)=>{let s=n[i]*Math.exp(-t*420)*.9;for(const [f,a,d] of [[3150,.5,90],[4720,.28,130],[6100,.12,170]])s+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return s*Math.min(1,t/.0006);});})(),7,.06);
B.clink=level(make(.5,(t,i)=>{let s=noise[i]*Math.exp(-t*180)*.5;for(const [f,a,d] of [[2210,.5,22],[3570,.35,30],[5430,.18,45]])s+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return s*Math.min(1,t/.0008);}),8,.2);
B.tap=level((()=>{const n=lp(noise,900);return make(.25,(t,i)=>(n[i]*.8+Math.sin(2*Math.PI*(150-60*t)*t)*.9)*Math.exp(-t*38)*Math.min(1,t/.002));})(),8,.15);
B.bell=level(make(1.2,(t)=>{let s=0;for(const [f,a,d] of [[2340,.5,5.5],[3510,.3,7.5],[5930,.14,11]])s+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return s*Math.min(1,t/.002);}),9,.5);
B.piano=level(make(1.8,(t)=>{let s=0;for(const [m,a,d] of [[1,.6,1.8],[2,.28,2.6],[3,.12,3.4],[4,.05,4.5]])s+=a*Math.sin(2*Math.PI*196*m*t)*Math.exp(-t*d);return s*Math.min(1,t/.015)*(1-.2*Math.sin(2*Math.PI*5*t)*Math.exp(-t*2));}),8,1.2);
// tape whir: a tone whose pitch climbs then falls over the clip, with a bit of noise, faded at both ends
B.whir=level((()=>{const D=1.23;let ph=0;const nz=lp(hp(noise,300),2500);return make(D,(t,i)=>{const u=t/D,f=260+1700*Math.sin(Math.PI*u)**2;ph+=2*Math.PI*f/SR;return (Math.sin(ph)*.6+Math.sin(ph*2.01)*.2+nz[i%nz.length]*.5)*Math.sin(Math.PI*u)**.6;});})(),9,1.2);
B.clunk=level(make(.4,(t,i)=>{const n=lpn(420)[i]??0;return (Math.sin(2*Math.PI*(95-45*t)*t)*1.0+n*.5)*Math.exp(-t*16)*Math.min(1,t/.002);}),6,.2);
B.heart=level(make(.5,(t)=>{const thump=(t0,a)=>t>=t0?a*Math.sin(2*Math.PI*58*(t-t0))*Math.exp(-(t-t0)*22)*Math.min(1,(t-t0)/.004):0;return thump(0,1)+thump(.17,.75);}),6,.3);
B.cloth=level((()=>{const n=lp(hp(noise,700),3200);return make(.3,(t,i)=>n[i]*Math.sin(Math.PI*clamp(t/.3))**2);})(),11,.3);
B.chair=level(make(.3,(t,i)=>{const n=lpn(1100)[i]??0;return (n*.9+Math.sin(2*Math.PI*(120-50*t)*t))*Math.exp(-t*20)*Math.min(1,t/.002);}),9,.2);
const bellBuf=(D,amp)=>make(D,(t)=>{let q=0;for(const [f,a,d] of [[2340,.5,5.5],[3510,.3,7.5],[5930,.14,11]])q+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return q*amp*Math.min(1,t/.002);});
B.whoosh=level((()=>{let y=0,z=0;const D=.6;return make(D,(t,i)=>{const u=t/D,fc=260+2400*Math.sin(Math.PI*u)**1.5,k=1-Math.exp(-2*Math.PI*fc/SR);y+=k*(noise[i%noise.length]-y);z+=k*(y-z);return (y-z)*Math.sin(Math.PI*u)**2;});})(),11,.6);
B.slam=level(make(.5,(t,i)=>{const n=lpn(900)[i]??0;return (Math.sin(2*Math.PI*(75-30*t)*t)*1.0+n*.9*Math.exp(-t*30)+Math.sin(2*Math.PI*190*t)*.3*Math.exp(-t*50))*Math.exp(-t*11)*Math.min(1,t/.002);}),5,.3);
B.thud=level(make(.3,(t)=>Math.sin(2*Math.PI*(95-40*t)*t)*Math.exp(-t*22)*Math.min(1,t/.003)),10,.25);
B.step=level(make(.2,(t,i)=>((lpn(600)[i]??0)*.7+Math.sin(2*Math.PI*(120-50*t)*t))*Math.exp(-t*34)*Math.min(1,t/.002)),9,.15);
B.rustle=level((()=>{const n=lp(hp(noise,2200),7000),bursts=[[0,.1],[.09,.12],[.2,.08],[.28,.14],[.4,.1]];return make(.55,(t,i)=>{let e=0;for(const [a,d] of bursts)if(t>=a&&t<a+d)e=Math.max(e,Math.sin(Math.PI*(t-a)/d));return n[i%n.length]*e;});})(),12,.5);
B.scrape=level((()=>{const n=lp(hp(noise,350),2200);return make(.4,(t,i)=>n[i%n.length]*Math.sin(Math.PI*clamp(t/.4))**1.5*(1+.4*Math.sin(2*Math.PI*38*t)));})(),11,.4);
B.riser=level((()=>{const n=lp(hp(noise,500),4000);let ph=0;return make(1.4,(t,i)=>{const u=t/1.4;ph+=2*Math.PI*(180+520*u)/SR;return (n[i%n.length]*.5+Math.sin(ph)*.5)*u*u*(1-clamp((u-.92)/.08));});})(),14,1.4);
B.chime=level(make(2.6,(t)=>{let q=0;for(const [f,a,d] of [[1318,.5,1.6],[1976,.3,2.2],[2637,.16,3.2]])q+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return q*Math.min(1,t/.004);}),12,1.2);
B.bellshake=level((()=>{const out=new Float32Array(Math.round(1.4*SR));[[0,1],[.06,.8],[.13,.9],[.2,.6],[.29,.5],[.4,.35],[.52,.2]].forEach(([at,a])=>{const b=bellBuf(1,a),o=Math.round(at*SR);for(let i=0;i<b.length&&o+i<out.length;i++)out[o+i]+=b[i];});return out;})(),9,.6);
// music: a gentle piano arpeggio over soft pads, one chord per bar at 72 bpm. Gain keys come from cues.json music.keys [[frame,gain],...].
function music(){
 const BPM=72,eighth=60/BPM/2,bar=eighth*8,hz=m=>440*2**((m-69)/12);
 const chords=[[48,52,55,59],[45,52,55,60],[41,48,52,57],[43,50,52,59]]; // Cmaj7 Am7 Fmaj7 G6
 const pat=[0,1,2,3,2,1,2,1];
 const out=new Float32Array(N);
 const note=(t0,m,a,len=1.7)=>{const f=hz(m),o=Math.round(t0*SR);for(let i=0;i<Math.round(len*SR)&&o+i<N;i++){const t=i/SR;let q=0;for(const [h,w,d] of [[1,.6,1.6],[2,.26,2.4],[3,.1,3.2],[4,.04,4.4]])q+=w*Math.sin(2*Math.PI*f*h*t)*Math.exp(-t*d);out[o+i]+=q*a*Math.min(1,t/.012);}};
 const pad=(t0,ms,a,len)=>{const o=Math.round(t0*SR),n=Math.round(len*SR);for(let i=0;i<n&&o+i<N;i++){const t=i/SR,e=Math.min(1,t/.9)*Math.min(1,(len-t)/.9);let q=0;for(const m of ms)q+=Math.sin(2*Math.PI*hz(m)*t)+.3*Math.sin(2*Math.PI*hz(m)*2.003*t);out[o+i]+=q*e*a;}};
 for(let b=0;b*bar<SECONDS+bar;b++){
  const c=chords[b%4],t0=b*bar;
  pad(t0,[c[0]-12,c[2]],.05,bar+.6);
  for(let k=0;k<8;k++){const m=c[pat[k]]+12+(pat[k]===3?0:0),v=(k===0?1:k%2?.55:.75)*(.9+.1*Math.sin(b*2.1+k));note(t0+k*eighth+.01*Math.sin(b*7+k),m,.5*v);}
 }
 return out;
}
const mix=new Float32Array(N),events=[];
for(const c of CUES.cues){
 const b=B[c.kind];if(!b)throw Error('unknown cue kind '+c.kind);
 const buf=c.reverse?Float32Array.from(b).reverse():b,o0=Math.round(c.frame/FPS*SR),g=c.gain??1;
 for(let i=0;i<buf.length&&o0+i<N;i++)mix[o0+i]+=buf[i]*g;
 events.push({frame:c.frame,kind:c.kind+(c.reverse?' (reversed)':'')});
}
const room=level(lp(hp(make(SECONDS,()=>rnd()),90),1400),15,SECONDS),hum=level(make(SECONDS,(t)=>Math.sin(2*Math.PI*100*t)+.45*Math.sin(2*Math.PI*200*t)+.15*Math.sin(2*Math.PI*300*t)),15,SECONDS),air=level(lp(hp(make(SECONDS,()=>rnd()),400),3200),16,SECONDS);
const bed={room,hum,air};
const extMusic=()=>{const b=ff(['-v','error','-ss',String(CUES.music.start??0),'-t',String(SECONDS),'-i',CUES.music.file,...RAW,'pipe:1']).stdout,x=new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)),out=new Float32Array(N);out.set(x.subarray(0,N));const fi=Math.round(1.5*SR);for(let i=0;i<fi&&i<N;i++)out[i]*=i/fi;return out;};
if(CUES.music){const m=level(CUES.music.file?extMusic():music(),CUES.music.under??21,SECONDS),K=CUES.music.keys,g=f=>{if(f<=K[0][0])return K[0][1];for(let q=1;q<K.length;q++)if(f<=K[q][0]){const [a,va]=K[q-1],[b2,vb]=K[q],x=clamp((f-a)/(b2-a));return va+(vb-va)*x*x*(3-2*x);}return K.at(-1)[1];};for(let i=0;i<N;i++)mix[i]+=m[i]*g(i/SR*FPS);}
for(const b of CUES.beds??[]){
 const arr=bed[b.kind];if(!arr)throw Error('unknown bed '+b.kind);
 const a=Math.round(b.from/FPS*SR),z=Math.min(N,Math.round(b.to/FPS*SR)),fi=Math.round((b.fadeIn??6)/FPS*SR),fo=Math.round((b.fadeOut??6)/FPS*SR);
 for(let i=a;i<z;i++){const e=Math.min(clamp((i-a)/Math.max(1,fi)),clamp((z-i)/Math.max(1,fo)));mix[i]+=arr[i]*(b.gain??1)*e*(b.kind==='room'?(.7+.3*Math.sin(i/SR*1.7)):1);}
}
const pre=new Float32Array(N);for(let i=0;i<N;i++)pre[i]=voice[i]+mix[i];
// master: lift to the target loudness, true-peak limit at -1 dB
const bytes=Buffer.from(pre.buffer,pre.byteOffset,pre.byteLength);
const meas=String(ff([...RAW,'-i','pipe:0','-af','ebur128','-f','null','-'],bytes).stderr),I=[...meas.matchAll(/ I:\s+(-?[\d.]+) LUFS/g)].at(-1);
const gainDb=+o.lufs-(I?+I[1]:-23);
ff(['-v','error','-n',...RAW,'-i','pipe:0','-af',`volume=${gainDb.toFixed(2)}dB,alimiter=limit=0.79:attack=2:release=40:level=disabled`,'-ar','48000','-ac','1','-c:a','pcm_s16le',o.out],bytes);
const fin=String(ff(['-i',o.out,'-af','ebur128=peak=true','-f','null','-'],undefined).stderr),FI=[...fin.matchAll(/ I:\s+(-?[\d.]+) LUFS/g)].at(-1),TP=[...fin.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].at(-1);
fs.writeFileSync(o.out.replace(/\.wav$/,'.cues.json'),JSON.stringify({sampleRate:SR,fps:FPS,seconds:+SECONDS.toFixed(3),voiceSpeechRmsDbfs:+db(VOICE).toFixed(1),masterGainDb:+gainDb.toFixed(2),integratedLufs:FI?+FI[1]:null,truePeakDbfs:TP?+TP[1]:null,events,beds:CUES.beds},null,1));
console.log('wrote',o.out,'integrated',FI?FI[1]:'?','LUFS, peak',TP?TP[1]:'?','dBFS, master gain',gainDb.toFixed(2),'dB');
