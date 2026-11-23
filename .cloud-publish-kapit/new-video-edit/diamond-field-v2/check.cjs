const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),esbuild=require('esbuild');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(esbuild.transformSync(fs.readFileSync(file,'utf8'),{loader:ext==='.tsx'?'tsx':'ts',format:'cjs',target:'node20'}).code,file);
const {SHOTS,FRAMES,INTERACTIVE_GEMS,SECONDARY_GEMS,PATCHES,fieldHeight,shotAt}=require('./contract.ts');
const {viewAt,directionAt}=require('./story.ts'),{castAt,handAnchors,GEM_SIZE}=require('./acting.ts'),{CAPTIONS}=require('./captions.ts');
let failures=0;function check(name,run){try{run();console.log('PASS '+name)}catch(e){failures++;console.log('FAIL '+name+': '+e.message)}}
check('Shots cover every frame without gaps or overlaps',()=>{assert.equal(SHOTS[0].a,0);assert.equal(SHOTS.at(-1).b,FRAMES);for(let i=1;i<SHOTS.length;i++)assert.equal(SHOTS[i].a,SHOTS[i-1].b)});
check('Place changes are protected by their transition cue',()=>{for(let i=1;i<SHOTS.length;i++)if(SHOTS[i].scene!==SHOTS[i-1].scene)assert.ok(directionAt(SHOTS[i].a).flash>.5)});
check('Camera remains finite with a valid focus distance',()=>{for(let f=0;f<FRAMES;f++){const v=viewAt(f);assert.ok([...v.position,...v.look,v.fov,v.blur].every(Number.isFinite),'frame '+f);assert.ok(Math.hypot(...v.position.map((n,i)=>n-v.focus[i]))>.15,'frame '+f);assert.ok(v.fov>=35&&v.fov<=60)}});
check('Every caption preserves provided wording and readable hold',()=>{assert.deepEqual(CAPTIONS.map(c=>c[2]),fs.readFileSync(path.join(__dirname,'NARRATION.txt'),'utf8').trim().split(/\s+/));for(const[a,b]of CAPTIONS)assert.ok(b-a>=5);for(let i=1;i<CAPTIONS.length;i++)assert.equal(CAPTIONS[i][0],CAPTIONS[i-1][1]);assert.equal(CAPTIONS.at(-1)[1],FRAMES)});
check('Model sizes are stable across every visible character frame',()=>{const sizes=new Map();for(let f=0;f<FRAMES;f++){for(const p of castAt(f,shotAt(f).beat)){assert.ok(p.pos.every(Number.isFinite));if(sizes.has(p.id))assert.equal(p.scale,sizes.get(p.id),'shrinking '+p.id+' frame '+f);else sizes.set(p.id,p.scale)}}assert.equal(sizes.size,6);assert.equal(GEM_SIZE.diamond,INTERACTIVE_GEMS.main.size);assert.equal(GEM_SIZE.ruby,INTERACTIVE_GEMS.ruby.size)});
check('Secondary gems stay inside the disturbed patches',()=>{for(const g of SECONDARY_GEMS)assert.ok(PATCHES.some(p=>Math.hypot(g.x-p.x,g.z-p.z)<p.r));assert.ok(!PATCHES.some(p=>Math.hypot(.62-p.x,.4-p.z)<p.r))});
check('Key handoffs meet their physical prop anchors',()=>{for(const[f,id,hand,item]of[[0,'investorA','right','diamond'],[20,'investorA','right','diamond'],[39,'investorA','right','diamond'],[136,'investorA','right','diamond'],[137,'investorA','right','diamond'],[250,'investorA','right','diamond'],[300,'investorB','left','ruby'],[375,'engineer','right','diamond'],[400,'engineer','right','diamond'],[490,'arnold','right','bag'],[530,'arnold','right','bag'],[825,'arnold','right','diamond']]){const p=castAt(f,shotAt(f).beat).find(p=>p.id===id),h=handAnchors(f)[item];assert.ok(p&&p[hand]);assert.ok(Math.hypot(...p[hand].map((v,i)=>v-h[i]))<.005,`${id} frame ${f}`)}});
check('Travel and staging roots remain on their scene ground',()=>{for(let f=0;f<FRAMES;f+=3){const shot=shotAt(f);for(const p of castAt(f,shot.beat)){const y=shot.scene==='field'?fieldHeight(p.pos[0],p.pos[2]):0;assert.ok(Math.abs(p.pos[1]-y)<.002,`${p.id} f${f}`)}}});
check('Narrated interactive props stay inside the portrait frame',()=>{
 const THREE=require('three');
 for(const [a,b,item] of [[0,137,'diamond'],[212,276,'diamond'],[340,425,'diamond'],[285,320,'ruby'],[430,502,'bag'],[740,815,'diamond'],[815,834,'diamond']]){
  for(let f=a;f<b;f++){
   const v=viewAt(f),cam=new THREE.PerspectiveCamera(v.fov,1080/1920,.035,180);cam.position.set(...v.position);cam.lookAt(...v.look);cam.updateMatrixWorld();
   const p=new THREE.Vector3(...handAnchors(f)[item]).project(cam),x=(p.x+1)/2,y=(1-p.y)/2;
   assert.ok(x>.035&&x<.965&&y>.05&&y<.93,`${item} outside frame at ${f}: ${x.toFixed(2)},${y.toFixed(2)}`);
  }
 }
});
check('Camera and lens initialization share near/far constants',()=>{const s=fs.readFileSync(path.join(__dirname,'index.tsx'),'utf8');assert.ok(s.includes('near:CAMERA_NEAR,far:CAMERA_FAR'));assert.ok(s.includes('perspective.near=CAMERA_NEAR;perspective.far=CAMERA_FAR'))});
process.exitCode=failures?1:0;
