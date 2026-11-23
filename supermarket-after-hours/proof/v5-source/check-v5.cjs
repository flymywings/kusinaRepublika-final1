const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),esbuild=require('esbuild');
require.extensions['.ts']=(m,p)=>m._compile(esbuild.transformSync(fs.readFileSync(p,'utf8'),{loader:'ts',format:'cjs'}).code,p);
const root=__dirname,s=require('./story.ts'),pace=require('./pace.ts'),map=require('./public/pace-map.json'),caps=require('./captions-175.json');
const canonical=fs.readFileSync(path.join(root,'NARRATION.txt'),'utf8').trim().split(/\s+/);
assert.deepEqual(caps.map(c=>c.word),canonical);assert.equal(caps.at(-1).end,s.TOTAL);
for(let i=0;i<caps.length;i++){assert(caps[i].end>caps[i].start);if(i)assert(caps[i].start>=caps[i-1].end);}
function pcm(file){const b=fs.readFileSync(file);for(let p=12;p+8<=b.length;){const n=b.readUInt32LE(p+4);if(b.toString('ascii',p,p+4)==='data')return b.subarray(p+8,p+8+n);p+=8+n+(n&1);}throw Error('No WAV data');}
const original=pcm(path.join(root,'public/voice.wav')),retimed=pcm(path.join(root,'public/voice-175.wav'));
let quiet=0;
for(const seg of map.segments.filter(x=>x.kind==='quiet')){
 assert.equal(seg.sourceEndSample-seg.sourceStartSample,seg.targetEndSample-seg.targetStartSample);
 assert(original.subarray(seg.sourceStartSample*2,seg.sourceEndSample*2).equals(retimed.subarray(seg.targetStartSample*2,seg.targetEndSample*2)),'Quiet PCM altered');quiet++;
}
const wpm=canonical.length*60/(retimed.length/2/map.sampleRate);assert(Math.abs(wpm-175)<.2);assert.equal(quiet,26);
let lowestFoot=1,maxReach=0;
for(let out=0;out<s.TOTAL;out++){
 const f=Math.min(1589,pace.sourceFrameAt(out)),v=s.viewAt(f),a=s.stateAt(f);
 for(const role of ['sasaki','tayama','yamada','staff'])for(const foot of a[role].feet){
  assert(foot[1]>=s.floorAt(foot)-.004,'Sole below support surface');
  const reach=Math.hypot(foot[0]-a[role].position[0],foot[2]-a[role].position[2]);maxReach=Math.max(maxReach,reach);assert(reach<.75,'Foot too far from hips');
 }
 if(f>=252&&f<=356){
  assert(a.sasaki.feet[0][0]<a.sasaki.feet[1][0],'Arrival legs cross');
  assert(Math.abs(v.focus[2]-a.sasaki.position[2])<.02,'Walker out of focus');
  for(const foot of a.sasaki.feet){const y=(foot[1]-v.eye[1])/((v.eye[2]-foot[2])*Math.tan(v.fov*Math.PI/360));lowestFoot=Math.min(lowestFoot,y);assert(y>-.96,'Walking sole cropped');}
 }
}
const approval=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'proof/Tayama - Identity Revision.png'))).digest('hex');
assert.equal(approval,'7d235635a1a314a198720f973ce20803603827e6260bfed362f9fe079440570f');
const result={frames:s.TOTAL,voiceWpm:wpm,preservedQuietIntervals:quiet,quietSampleIdentity:true,captionWords:canonical.length,lowestWalkingFootNDC:lowestFoot,maxFootReach:maxReach,walkingFeetInFrame:true,focusTracksWalker:true,approvedStaticDesignUnchanged:true,scope:'Mapped-time numerical and source-PCM checks. Actual footage and listening are separate.'};
fs.writeFileSync(path.join(root,'proof/v5-mapped-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
