const fs=require('node:fs'),assert=require('node:assert/strict'),esbuild=require('esbuild');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(esbuild.transformSync(fs.readFileSync(f,'utf8'),{loader:ext==='.tsx'?'tsx':'ts',format:'cjs',target:'node20'}).code,f);
const S=require('./story.ts');
const {drawDragon}=require('./Cast.tsx');
let originalHead;
assert.equal(S.FPS,30);assert.equal(S.TOTAL,1047);
for(let f=0;f<S.TOTAL;f++){
 const c=S.cameraAt(f),s=S.stateAt(f);
 assert.ok([...c.eye,...c.look,c.fov,c.blur].every(Number.isFinite),'finite camera '+f);
 assert.ok(Math.hypot(...c.eye.map((n,i)=>n-c.look[i]))>.3,'focus clearance '+f);
 assert.ok(s.dragon.pos.every(Number.isFinite),'finite dragon '+f);
 if(f>=764){
  const [x,,z]=s.dragon.pos;
  assert.ok(!(x>1.4&&x<6.2&&z>-7.6&&z<-3.4),'dragon clears forge with body margin '+f);
  assert.ok(!(x>3.7&&x<5.3&&z>-3.5&&z<-1.9),'dragon clears shed '+f);
 }
 assert.ok(Math.abs(s.dragon.pos[1])<.001,'dragon root on ground '+f);
 assert.equal(s.dragon.scale,1,'dragon scale '+f);
 let drawnHead;const pen=new Proxy({rot:null},{get:(o,k)=>k==='shadedFill'?(pts)=>{drawnHead=pts}:k==='rot'?o.rot:()=>{},set:(o,k,v)=>{o[k]=v;return true}});
 drawDragon(pen,s.dragon,{right:[350,500],left:[650,550],gaze:[480,270]});
 assert.ok(drawnHead?.length===48,'actual drawn head captured');
 if(!originalHead)originalHead=drawnHead;assert.deepEqual(drawnHead,originalHead,'actual drawn head silhouette '+f);
 assert.ok(s.goldRemaining>=0&&s.goldRemaining<=1,'gold amount '+f);
 if(s.bucketHeld)assert.deepEqual(s.bucketPos,s.dragon.right,'bucket/hand agreement '+f);
 else assert.ok(s.bucketPos[1]-.6>=-.001,'bucket base above ground '+f);
 if(f<72)assert.ok(s.stampPos[1]-.26>=S.TABLE_TOP+.008,'stamp cannot penetrate policy '+f);
 else assert.ok(s.stampPos[1]-.26>=S.TABLE_TOP-.001,'stamp remains above table '+f);
 assert.equal(s.cakePos[1],S.TABLE_TOP+.16,'cake support '+f);
}
assert.ok(S.stateAt(560).goldRemaining<S.stateAt(0).goldRemaining*.6,'loss is substantial');
assert.ok(Math.abs((S.stateAt(48).dragon.right[1]-.26)-(S.TABLE_TOP+.012))<.004,'stamp lands on policy');
assert.ok(Math.abs(S.stateAt(100).stampPos[1]-.26-S.TABLE_TOP)<.001,'stamp parks on table');
assert.notDeepEqual(S.stateAt(535).barrowPos,S.stateAt(0).barrowPos,'gold barrow physically departs');
for(let f=455;f<552;f++)assert.ok(Math.hypot(...S.stateAt(f).baker.pos.map((v,i)=>v-S.stateAt(f-1).baker.pos[i]))<.18,'continuous claimant route '+f);
const pour=S.stateAt(1007),lip=S.bucketLipAt(1007),toward=[-.1-lip[0],1.34-lip[1]];
assert.ok(-Math.sin(pour.bucketTilt)*toward[0]+Math.cos(pour.bucketTilt)*toward[1]>0,'mouth pours toward cake');
assert.deepEqual(S.performerFeetAt(870,'dragon')[0],S.performerFeetAt(874,'dragon')[0],'running stance foot stays planted in world space');
assert.ok(1.75*(.975-.270)>S.TABLE_TOP+.1,'child eyes above tabletop');
assert.ok(S.CUES.notice>S.CUES.candle+5,'viewer sees flame before dragon response');
assert.ok(S.CUES.splash<S.CUES.buckets,'splash precedes punch word');
const words=fs.readFileSync(__dirname+'/NARRATION.txt','utf8').trim().split(/\s+/);
assert.equal(words.length,96);assert.deepEqual(S.CAPTIONS.map(c=>c.word),words);
for(let i=0;i<S.CAPTIONS.length;i++){const c=S.CAPTIONS[i];assert.ok(c.end>c.start);if(i)assert.equal(c.start,S.CAPTIONS[i-1].end);}
console.log('PASS: timeline, actual head outline, support, contacts, gold loss, cause/reaction timing, and all 96 caption words.');
