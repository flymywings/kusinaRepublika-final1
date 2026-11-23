import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import crypto from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url)),proof=path.join(root,'proof');
const specs=[{id:'DragonHook',offset:0,grid:'6x5'},{id:'DragonClaim',offset:398,grid:'7x6'},{id:'DragonEnding',offset:764,grid:'8x6'}];
function run(program,args){const r=spawnSync(program,args,{encoding:'utf8',maxBuffer:5e6});if(r.status!==0)throw Error(r.stderr);return r;}
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const results=[];
for(const s of specs){
 const file=path.join(proof,s.id+'-proof.mp4');
 const meta=JSON.parse(run('ffprobe',['-v','error','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels:format=duration','-of','json',file]).stdout);
 run('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-']);
 const checks=run('ffmpeg',['-hide_banner','-i',file,'-vf','blackdetect=d=0.08:pix_th=.06,freezedetect=n=-55dB:d=0.4','-af','ebur128=peak=true','-f','null','-']).stderr;
 const summary=checks.slice(checks.lastIndexOf('Summary:'));
 const result={...s,file,sha256:hash(file),metadata:meta,decode:'pass',blackOrFrozen:checks.split(/\r?\n/).filter(l=>/black_start|freeze_start|freeze_end/.test(l)),loudness:summary,listeningReview:false};
 run('ffmpeg',['-v','error','-y','-i',file,'-vf',`fps=5,scale=180:320,tile=${s.grid}`,'-frames:v','1',path.join(proof,s.id+'-overview.jpg')]);
 results.push(result);
}
for(const s of [
 {id:'DragonHook',a:40,b:58,step:1,name:'stamp-contact',grid:'7x3'},
 {id:'DragonHook',a:72,b:126,step:3,name:'coin-and-stamp-return',grid:'7x3'},
 {id:'DragonClaim',a:0,b:56,step:3,name:'claim-contact',grid:'7x3'},
 {id:'DragonClaim',a:56,b:154,step:4,name:'gold-departure',grid:'7x4'},
 {id:'DragonClaim',a:150,b:210,step:3,name:'policy-reveal',grid:'7x3'},
 {id:'DragonEnding',a:75,b:170,step:4,name:'charge-feet',grid:'7x4'},
 {id:'DragonEnding',a:235,b:282,step:2,name:'bucket-and-splash',grid:'6x4'},
]){
 const filter=`select=between(n\\,${s.a}\\,${s.b})*not(mod(n-${s.a}\\,${s.step})),scale=180:320,tile=${s.grid}`.replaceAll('\\\\','\\');
 run('ffmpeg',['-v','error','-y','-i',path.join(proof,s.id+'-proof.mp4'),'-vf',filter,'-frames:v','1',path.join(proof,s.name+'.jpg')]);
}
const sourceFiles=fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isFile()&&/\.(tsx?|json|mjs|cjs|txt|md)$/.test(e.name)).map(e=>path.join(root,e.name));
sourceFiles.push(...fs.readdirSync(path.join(root,'lib')).map(f=>path.join(root,'lib',f)),...['voice.wav','mix.wav','music.wav','sfx.wav'].map(f=>path.join(root,'public',f)),path.join(root,'../package-lock.json'));
fs.writeFileSync(path.join(proof,'candidate-hashes.json'),JSON.stringify(sourceFiles.map(file=>({file,sha256:hash(file)})),null,2));
fs.writeFileSync(path.join(proof,'export-checks.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({id:r.id,duration:r.metadata.format.duration,video:r.metadata.streams.find(s=>s.codec_type==='video'),flags:r.blackOrFrozen})),null,2));
