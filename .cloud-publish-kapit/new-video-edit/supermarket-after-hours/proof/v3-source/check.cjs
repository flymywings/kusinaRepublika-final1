const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),esbuild=require('esbuild');
const root=__dirname;
require.extensions['.ts']=(mod,file)=>mod._compile(esbuild.transformSync(fs.readFileSync(file,'utf8'),{loader:'ts',format:'cjs',target:'node20'}).code,file);
const {stateAt,viewAt,SHOTS,TOTAL}=require('./story.ts');
const captions=require('./captions.json');
const canonical=fs.readFileSync(path.join(root,'NARRATION.txt'),'utf8').trim().split(/\s+/);
assert.equal(captions.length,145);assert.deepEqual(captions.map(c=>c.word),canonical);
assert.equal(captions[0].start,0);assert.equal(captions.at(-1).end,TOTAL);
for(let i=0;i<captions.length;i++){const c=captions[i];assert(c.end>c.start);if(i)assert(c.start>=captions[i-1].end);}
assert.equal(SHOTS[0].a,0);assert.equal(SHOTS.at(-1).b,TOTAL);
for(let i=1;i<SHOTS.length;i++)assert.equal(SHOTS[i-1].b,SHOTS[i].a);
let maxReach=0;
for(let f=0;f<TOTAL;f++){
 const state=stateAt(f),v=viewAt(f);
 assert.equal(v.eye[0],v.look[0],`Non-frontal camera at ${f}`);assert.equal(v.eye[1],v.look[1],`Angled camera at ${f}`);
 if(['sincere-two-shot','coworker-assumption','kindness-returned'].includes(v.id))for(const role of ['sasaki','tayama']){
  const p=state[role],half=(Math.abs(p.position[2]-v.eye[2])-.15)*Math.tan(v.fov*Math.PI/360)*1080/1920;
  assert(Math.abs(p.position[0]-v.eye[0])+.30*p.scale+.05<half,`Frontal head too close to edge: ${role} ${f}`);
 }
 for(const p of [v.eye,v.look,v.focus])assert(p.every(Number.isFinite),`Camera ${f}`);
 assert(Math.hypot(...v.eye.map((n,i)=>n-v.look[i]))>.3);
 for(const role of ['sasaki','tayama','yamada','staff']){
  const p=state[role];assert.equal(p.view,'front',`Side/rear character at ${f}`);assert(p.position.every(Number.isFinite));
  for(const hand of [p.hand,p.otherHand].filter(Boolean)){
   assert(hand.every(Number.isFinite));
   const d=Math.hypot(hand[0]-p.position[0],hand[1]-1.18*p.scale,hand[2]-p.position[2]);maxReach=Math.max(maxReach,d);
   assert(d<.85,`${role} unreachable hand at ${f}: ${d}`);
  }
  if(p.feet)for(const foot of p.feet){assert(foot[1]>=0&&foot[1]<=.12);assert(Math.hypot(foot[0]-p.position[0],foot[2]-p.position[2])<.8);}
 }
}
for(const [start,end] of [[252,335],[590,638]])for(let f=start+1;f<end;f++)for(let side=0;side<2;side++){
 const phase=(f-start)/24+(side?.5:0),previous=(f-1-start)/24+(side?.5:0);
 if(phase%1<.58&&Math.floor(phase)===Math.floor(previous)){
  const a=stateAt(f).sasaki.feet[side],b=stateAt(f-1).sasaki.feet[side];assert(Math.hypot(...a.map((n,i)=>n-b[i]))<1e-8,'Stance foot slipped');
 }
}
for(const name of fs.readdirSync(root).filter(n=>/\.tsx?$/.test(n)))esbuild.transformSync(fs.readFileSync(path.join(root,name),'utf8'),{loader:name.endsWith('tsx')?'tsx':'ts',format:'esm'});
const sha=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public/voice-source.mp3'))).digest('hex');
assert.equal(sha,'2917bb2bc5935f2b40e665d552dad0edbd520979072e8821649639be7f80eae3');
const result={frames:TOTAL,words:captions.length,shots:SHOTS.length,characterViews:'front only across all frames',cameraViews:'flat frontal; straight travel',maxHandReachMeters:+maxReach.toFixed(3),voiceSourceSha256:sha,checks:'Caption wording/order; frontal-only cast and camera; coverage and finite coordinates; hand reach; planned stance-foot targets; root source syntax; unchanged source MP3. Rendered motion is reviewed separately; these do not establish creative or listening quality.'};
fs.writeFileSync(path.join(root,'proof/v3-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
