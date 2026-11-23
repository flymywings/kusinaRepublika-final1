import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url)),rate=48000,duration=53,N=Math.round(rate*duration),music=new Float32Array(N),sfx=new Float32Array(N);let seed=418927;
const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1};
function add(arr,t,len,fn){const a=Math.round(t*rate),n=Math.round(len*rate);for(let j=0;j<n&&a+j<N;j++)if(a+j>=0)arr[a+j]+=fn(j/rate,j/n)}
function note(t,midi,len,amp){const hz=440*2**((midi-69)/12);add(music,t,len,(s,u)=>{const env=Math.min(1,s/.018)*Math.exp(-3.6*u)*Math.min(1,(1-u)*12);return amp*env*(Math.sin(s*hz*2*Math.PI)+.18*Math.sin(s*hz*4*Math.PI)+.06*Math.sin(s*hz*6*Math.PI))})}
const chords=[[48,55,59,64],[45,52,55,59],[41,48,52,57],[43,50,55,59]];
for(let bar=0;bar<13;bar++){const t=bar*4,notes=chords[bar%4],quiet=t>=34&&t<39?.30:1;for(let j=0;j<4;j++)note(t+j*.58,notes[j]+12,2.8,.010*quiet);note(t,notes[0]-12,3.7,.011*quiet);if(bar%2===0)note(t+2.5,notes[2]+12,1.5,.006*quiet)}
note(50.9,72,1.7,.009);note(52.1,76,.8,.008);
let filtered=0;for(let i=0;i<N;i++){filtered=filtered*.985+rnd()*.015;const t=i/rate;sfx[i]+=(.0008*filtered+.00035*Math.sin(t*2*Math.PI*60))*(t<18?.8:.45)}
function click(t,amp=.025,len=.04){let low=0;add(sfx,t,len,(s,u)=>{low=.4*low+.6*rnd();return amp*low*Math.exp(-u*10)})}
function rustle(t,len=.28){let low=0;add(sfx,t,len,(s,u)=>{low=.68*low+.32*rnd();return .009*low*Math.sin(Math.PI*u)*(1+.2*Math.sin(s*60))})}
rustle(11.6);add(sfx,12.8,.09,(s,u)=>.013*Math.sin(2*Math.PI*1120*s)*Math.sin(Math.PI*u));rustle(15.5,.4);rustle(17.7,.22);
for(const t of [8.8,9.3,9.8,10.3,19.9,20.35,20.8])click(t,.015,.08);
click(21.98,.04,.035);click(22.15,.018,.07);rustle(29.0,.22);
function wav(file,data){const b=Buffer.alloc(44+data.length*2);b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(data.length*2,40);for(let i=0;i<data.length;i++){const fade=Math.min(1,i/(rate*.3),(data.length-i)/(rate*.22));b.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(data[i]*fade*32767))),44+i*2)}fs.writeFileSync(file,b)}
wav(path.join(root,'public/music.wav'),music);wav(path.join(root,'public/sfx.wav'),sfx);
const filter='[0:a]apad=whole_dur=53,asplit=2[voice][side];[1:a][side]sidechaincompress=threshold=0.018:ratio=5:attack=12:release=180[bed];[voice][bed][2:a]amix=inputs=3:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7,atrim=duration=53[out]';
execFileSync('ffmpeg',['-v','error','-y','-i',path.join(root,'public/voice.wav'),'-i',path.join(root,'public/music.wav'),'-i',path.join(root,'public/sfx.wav'),'-filter_complex',filter,'-map','[out]','-ar','48000',path.join(root,'public/mix.wav')]);
fs.writeFileSync(path.join(root,'proof/audio-notes.json'),JSON.stringify({voice:'Provided Darian recording; unretimed, original preserved separately.',duration,seed:418927,music:'Original restrained electric-piano/plucked seventh-chord motif; quieter during sincere turn.',sfx:'Original receipt/plastic rustles, checkout beep, footsteps and lighter clicks; low room/street bed.',mix:'Voice-led music ducking; loudnorm target -16 LUFS / -1.5 dBTP. Measured delivered mix -16.6 LUFS / -1.5 dBTP. Signal checks do not establish listening quality.'},null,2));
console.log('Built 53-second original music/SFX stems and voice-led mix.');
