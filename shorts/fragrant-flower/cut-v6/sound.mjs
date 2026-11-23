// node sound.mjs   ->  public/hook-sound.wav (+ hook-sound.cues.json)
// Card 1 sound column. The v3 master voice is placed sample for sample (only resampled 44.1 -> 48 kHz) at gain 1.0.
// Every effect is generated here, one reusable buffer per kind, and mixed 5-10 dB under the voice level.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const voiceWav=path.resolve(here,'../../../production-pipeline-proposal/voice/johnny-take-02/johnny-take-02-edit-v3.wav');
const out=path.join(here,'public/hook-sound.wav'),cues=path.join(here,'public/hook-sound.cues.json');
for(const f of [out,cues])if(fs.existsSync(f))throw Error('refusing to overwrite '+f);
fs.mkdirSync(path.join(here,'public'),{recursive:true});
const SR=48000,FPS=30,SECONDS=150/FPS,N=Math.round(SECONDS*SR);
const r=spawnSync('ffmpeg',['-v','error','-i',voiceWav,'-t',String(SECONDS),'-ar',String(SR),'-ac','1','-f','f32le','pipe:1'],{maxBuffer:1<<28});
if(r.status)throw Error(String(r.stderr));
const v=new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset,r.stdout.byteOffset+r.stdout.length));
const voice=new Float32Array(N);voice.set(v.subarray(0,N));
const rms=(x,a=0,b=x.length)=>{let s=0;for(let i=a;i<b;i++)s+=x[i]*x[i];return Math.sqrt(s/Math.max(1,b-a));};
const db=x=>20*Math.log10(x+1e-12),lin=d=>10**(d/20);
// the voice's own level over its speech frames (frames within 25 dB of the loudest 100 ms)
const win=Math.round(.1*SR),levels=[];for(let i=0;i+win<=N;i+=win)levels.push(rms(voice,i,i+win));
const top=Math.max(...levels),speech=levels.filter(l=>db(l)>db(top)-25),VOICE=Math.sqrt(speech.reduce((a,l)=>a+l*l,0)/speech.length);
console.log('voice speech rms dBFS',db(VOICE).toFixed(1));
let seed=20261123;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1;};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lp=(x,f)=>{const k=1-Math.exp(-2*Math.PI*f/SR);let y=0;return Float32Array.from(x,v=>(y+=k*(v-y)));};
const hp=(x,f)=>{const l=lp(x,f);return Float32Array.from(x,(v,i)=>v-l[i]);};
const make=(sec,fn)=>Float32Array.from({length:Math.round(sec*SR)},(_,i)=>fn(i/SR,i));
/** scale a buffer so its rms over its first `over` seconds sits `under` dB below the voice */
const level=(b,under,over)=>{const n=Math.min(b.length,Math.round(over*SR)),g=VOICE*lin(-under)/(rms(b,0,n)||1);return Float32Array.from(b,x=>x*g);};

// --- reusable buffers
const noise=make(1.2,()=>rnd());
const fork=(()=>{const n=hp(noise,2500);return make(.12,(t,i)=>{let s=n[i]*Math.exp(-t*420)*.9;for(const [f,a,d] of [[3150,.5,90],[4720,.28,130],[6100,.12,170]])s+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return s*Math.min(1,t/.0006);});})();
const clink=make(.5,(t,i)=>{let s=noise[i]*Math.exp(-t*180)*.5;for(const [f,a,d] of [[2210,.5,22],[3570,.35,30],[5430,.18,45]])s+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return s*Math.min(1,t/.0008);});
const tap=(()=>{const n=lp(noise,900);return make(.25,(t,i)=>(n[i]*.8+Math.sin(2*Math.PI*(150-60*t)*t)*.9)*Math.exp(-t*38)*Math.min(1,t/.002));})();
const bell=make(1.2,(t)=>{let s=0;for(const [f,a,d] of [[2340,.5,5.5],[3510,.3,7.5],[5930,.14,11]])s+=a*Math.sin(2*Math.PI*f*t)*Math.exp(-t*d);return s*Math.min(1,t/.002);});
const piano=make(1.8,(t)=>{let s=0;for(const [m,a,d] of [[1,.6,1.8],[2,.28,2.6],[3,.12,3.4],[4,.05,4.5]])s+=a*Math.sin(2*Math.PI*196*m*t)*Math.exp(-t*d);return s*Math.min(1,t/.015)*(1-.2*Math.sin(2*Math.PI*5*t)*Math.exp(-t*2));});
const FORK=level(fork,7,.06),CLINK=level(clink,8,.2),TAP=level(tap,8,.15),BELL=level(bell,9,.5),PIANO=level(piano,8,1.2);

const mix=new Float32Array(N),events=[];
const at=(buf,frame,name,gain=1)=>{const o=Math.round(frame/FPS*SR);for(let i=0;i<buf.length&&o+i<N;i++)mix[o+i]+=buf[i]*gain;events.push({frame,time:+(frame/FPS).toFixed(3),name});};
for(const f of [0,11,21,32,42])at(FORK,f,'fork tick');                  // the same buffer every time; they become her heartbeat later
at(PIANO,72,'low felt-piano note, on "then"');
at(BELL,80,'door bell, offscreen, on "came"');
at(CLINK,99,'coin 1 clink, on "buy"');at(CLINK,103,'coin 2 clink',.8);
at(TAP,112,'box tap, on "cake"');

// --- beds. Room tone from frame 0, a case hum under "his face", street air rising from frame 140
const room=level(lp(hp(make(SECONDS,()=>rnd()),90),1400),15,SECONDS);
const hum=level(make(SECONDS,(t)=>Math.sin(2*Math.PI*100*t)+.45*Math.sin(2*Math.PI*200*t)+.15*Math.sin(2*Math.PI*300*t)),15,SECONDS);
const air=level(lp(hp(make(SECONDS,()=>rnd()),400),3200),16,SECONDS);
for(let i=0;i<N;i++){
 const t=i/SR,f=t*FPS;
 mix[i]+=room[i]*(.7+.3*Math.sin(t*1.7));
 mix[i]+=hum[i]*.55*clamp((f-46)/8)*(1-clamp((f-70)/6))+hum[i]*.2*clamp((f-86)/10);  // the case hum is there in the pause and then stays low
 mix[i]+=air[i]*.9*clamp((f-126)/14);
}
events.push({frame:46,time:+(46/FPS).toFixed(3),name:'case hum in (under "his face")'},{frame:126,time:+(126/FPS).toFixed(3),name:'street air starts rising (under the fade to Rintaro)'});
// the voice is never scaled: if the sum would clip, only the added sound is turned down
const fin=new Float32Array(N);let mg=1,peak=0;
for(let tries=0;tries<20;tries++){peak=0;for(let i=0;i<N;i++){fin[i]=voice[i]+mix[i]*mg;peak=Math.max(peak,Math.abs(fin[i]));}if(peak<=lin(-1.2))break;mg*=.93;}
const g=1;if(mg!==1)console.log('added sound turned down',db(mg).toFixed(2),'dB to keep the peak under -1.2 dBFS');
// 16-bit mono wav, like the master
const buf=Buffer.alloc(44+N*2);
buf.write('RIFF',0);buf.writeUInt32LE(36+N*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*2,40);
for(let i=0;i<N;i++){const s=Math.round(clamp(fin[i]*g,-1,1)*32767);buf.writeInt16LE(s,44+i*2);}
fs.writeFileSync(out,buf);
fs.writeFileSync(cues,JSON.stringify({sampleRate:SR,frames:150,voiceGainDb:0,addedSoundGainDb:+db(mg).toFixed(2),voiceSpeechRmsDbfs:+db(VOICE).toFixed(1),
 note:'ticks, clinks, tap, bell and piano are each 7-9 dB under the voice speech RMS; beds 10 dB under. Same fork buffer at every tick.',
 mixPeakDbfs:+db(Math.min(peak*g,1)).toFixed(2),events},null,1));
console.log('wrote',out,'peak dBFS',db(peak*g).toFixed(2));
