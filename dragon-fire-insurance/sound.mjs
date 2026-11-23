import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url)),rate=48000,seconds=1047/30,n=Math.round(rate*seconds);
const music=new Float32Array(n),effects=new Float32Array(n);
let seed=8123;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1};
function add(track,time,duration,fn,gain=1){const start=Math.round(time*rate);for(let j=0;j<duration*rate&&start+j<n;j++){if(start+j>=0)track[start+j]+=fn(j/rate)*gain;}}
function pluck(track,time,freq,duration=.7,gain=.025){add(track,time,duration,t=>(Math.sin(2*Math.PI*freq*t)+.28*Math.sin(2*Math.PI*freq*2*t)+.09*Math.sin(2*Math.PI*freq*3*t))*Math.exp(-t*7)*Math.min(1,t/.008),gain);}
function hit(frame,freq,gain=.07,duration=.18){add(effects,frame/30,duration,t=>(Math.sin(2*Math.PI*freq*t)+.4*Math.sin(2*Math.PI*freq*2.7*t))*Math.exp(-t*20)*Math.min(1,t/.003),gain);}
const tones=[196,246.94,293.66,246.94,174.61,220,261.63,220];
for(let beat=0;beat*.34<seconds;beat++){
 const time=beat*.34;if(time>19.7&&time<21.2||time>33.6)continue;
 const tension=time>21.2&&time<30.5;
 pluck(music,time,tones[beat%8]*(tension?.89:1),.65,tension?.025:.022);
 if(beat%4===0)pluck(music,time,tones[beat%8]/2,1.1,.018);
 if(beat%2===1)add(music,time,.055,t=>random()*Math.exp(-t*80)*Math.min(1,t/.002),.006);
}
hit(48,140,.085);hit(64,1460,.045);hit(401,490,.025);hit(476,1020,.04);hit(548,380,.025);hit(616,92,.045,.5);
add(effects,145/30,.28,t=>random()*Math.exp(-t*9)*.025);
add(effects,404/30,.3,t=>random()*Math.exp(-t*8)*.016);
add(effects,492/30,1.8,t=>Math.sin(2*Math.PI*(210+12*Math.sin(t*17))*t)*.008+random()*.003);
hit(798,770,.027,.08);hit(838,130,.05,.3);
for(let f=849;f<928;f+=10)hit(f,70+(f%3)*20,.07,.12);
add(effects,987/30,.6,t=>{const noise=random();return noise*.025*Math.sin(Math.PI*t/.6)});
add(effects,1017/30,.62,t=>random()*(.1*Math.exp(-t*7)+.025*Math.exp(-t*3))*Math.min(1,t/.012));
pluck(effects,34.3,330,.3,.018);pluck(effects,34.53,220,.25,.012);
function wav(file,a){const b=Buffer.alloc(44+a.length*2);b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(a.length*2,40);for(let i=0;i<a.length;i++)b.writeInt16LE(Math.round(Math.max(-.99,Math.min(.99,a[i]))*32767),44+i*2);fs.writeFileSync(file,b);}
wav(path.join(root,'public/music.wav'),music);wav(path.join(root,'public/sfx.wav'),effects);
function run(args){const r=spawnSync('ffmpeg',args,{encoding:'utf8',maxBuffer:4e6});if(r.status!==0)throw Error(r.stderr);return r;}
const filter='[0:a]asplit=2[voice][side];[1:a]volume=2.4[music];[music][side]sidechaincompress=threshold=0.014:ratio=4:attack=15:release=180[bed];[voice][bed][2:a]amix=inputs=3:normalize=0,apad,atrim=duration=34.9[raw]';
const temp=path.join(root,'proof/mix-unmastered.wav');
run(['-v','error','-y','-i',path.join(root,'public/voice.wav'),'-i',path.join(root,'public/music.wav'),'-i',path.join(root,'public/sfx.wav'),'-filter_complex',filter,'-map','[raw]','-ar',String(rate),'-c:a','pcm_s24le',temp]);
const measured=run(['-hide_banner','-i',temp,'-af','ebur128=peak=true','-f','null','-']).stderr;
const tail=measured.slice(measured.lastIndexOf('Summary:')),lufs=Number(tail.match(/I:\s*([-\d.]+)/)?.[1]),peak=Number(tail.match(/Peak:\s*([-\d.]+)/)?.[1]);
if(!Number.isFinite(lufs)||!Number.isFinite(peak))throw Error('Unable to measure mix');
const gain=Math.min(-17-lufs,-1.5-peak);
run(['-v','error','-y','-i',temp,'-af',`volume=${gain.toFixed(3)}dB`,'-ar',String(rate),'-c:a','pcm_s24le',path.join(root,'public/mix.wav')]);
fs.writeFileSync(path.join(root,'proof/audio-notes.json'),JSON.stringify({voice:'Accepted V5, unretimed',sourceLufs:lufs,sourcePeak:peak,masterGainDb:gain,expectedLufs:lufs+gain,expectedPeak:peak+gain,seed,music:'Original plucked motif; dropout at realization, withdrawal before splash',ducking:'Voice-led sidechain on music only',review:'Measured signal checks; listening pending'},null,2));
console.log(JSON.stringify({mix:'public/mix.wav',duration:seconds,gainDb:gain,expectedLufs:lufs+gain,expectedPeak:peak+gain}));
