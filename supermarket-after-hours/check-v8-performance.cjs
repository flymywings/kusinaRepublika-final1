const fs=require('fs'),assert=require('assert/strict'),esbuild=require('esbuild');
require.extensions['.ts']=(m,p)=>m._compile(esbuild.transformSync(fs.readFileSync(p,'utf8'),{loader:'ts',format:'cjs'}).code,p);
const p=require('./performance.ts'),pace=require('./pace-r2.ts'),s=require('./story.ts'),c=require('./caption-display.ts');
assert.equal(c.displayCaptionWord('forty-five-year-old'),'45-year-old');
assert.equal(c.displayCaptionWord('twenty-one,'),'21,');
assert.equal(c.displayCaptionWord('someone'),'someone');
const at=f=>p.sasakiFaceAt(pace.sourceFrameAt(f));
assert(at(255).smile<.2);assert(at(278).smile>.95);
assert(at(628).openness>.8);assert(at(661).openness>.25);assert(at(661).openness<.85);
let maxStep=0;for(const [a,b] of [[245,320],[620,720]])for(let f=a;f<b;f++){const x=at(f),y=at(f+1);for(const key of ['openness','smile','brow']){assert(Number.isFinite(x[key]));maxStep=Math.max(maxStep,Math.abs(y[key]-x[key]));}}
assert(maxStep<.13,`Facial state jumps: ${maxStep}`);
assert(s.viewAt(pace.sourceFrameAt(278)).eye[0]>-.76,'Camera leaves before recognition settles');
assert(s.viewAt(390).eye[2]<0,'Register camera remains outside storefront');
const envelope=require('./public/voice-mouth-v8.json');assert.equal(envelope.frames.length,1139);
for(const q of require('./public/pace-map-r2.json').segments.filter(x=>x.kind==='quiet'))for(let f=Math.ceil(q.targetStartSample/1600);f<Math.floor(q.targetEndSample/1600);f++)assert.equal(envelope.frames[f],0,`Mouth activity during preserved pause ${f}`);
const film=fs.readFileSync(__dirname+'/Film.tsx','utf8');assert(!film.includes('TOTAL-10'),'Ending still has old dark fade');
console.log(JSON.stringify({numericCaptions:true,facialMaximumStep:maxStep,recognitionBeforeCamera:true,mouthQuietDuringPauses:true,endingFadeRemoved:true}));
