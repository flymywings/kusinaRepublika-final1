const fs=require('fs'),assert=require('assert/strict'),esbuild=require('esbuild');
require.extensions['.ts']=(mod,file)=>mod._compile(esbuild.transformSync(fs.readFileSync(file,'utf8'),{loader:'ts',format:'cjs',target:'node20'}).code,file);
const {viewAt,stateAt,STORY_TOTAL:TOTAL,BRIDGES,REVEAL_SCREEN}=require('./story.ts');
assert(Array.isArray(BRIDGES),'Documented place/time bridges required');
let maxStep=0,maxFov=0;
for(const end of [104,169,251,516,1589])for(const delta of [.25,.5,.75]){
 const a=viewAt(end),b=viewAt(end+delta);assert.deepEqual(b.eye,a.eye,`Fractional endpoint reset at ${end+delta}`);assert.equal(b.fov,a.fov,`Fractional lens reset at ${end+delta}`);
}
for(let f=1;f<TOTAL;f++){
 const a=viewAt(f-1),b=viewAt(f),step=Math.hypot(...b.eye.map((n,i)=>n-a.eye[i]));
 if(!BRIDGES.includes(f)){assert(step<.34,`Camera reset at ${f}: ${step}`);assert(Math.abs(b.fov-a.fov)<1.2,`Lens reset at ${f}`);maxStep=Math.max(maxStep,step);maxFov=Math.max(maxFov,Math.abs(b.fov-a.fov));}
 assert.equal(b.eye[0],b.look[0]);assert.equal(b.eye[1],b.look[1]);
 for(const p of [b.eye,b.look,b.focus])assert(p.every(Number.isFinite),`Invalid camera at ${f}`);
}
// A stable-camera time dissolve gives the coworker a clear face reveal before the reaction move.
assert(BRIDGES.includes(432));assert(stateAt(431).showYamada);assert(stateAt(432).showStaff);
for(let f=432;f<=456;f+=.25)assert(viewAt(f).eye.every((n,i)=>Math.abs(n-viewAt(432).eye[i])<1e-10),'Reveal dissolve should hold its framing');
// V8 lets recognition finish before arriving at the cashier at402; only then does discovery transfer to his reaction.
for(let f=403;f<=516;f++)assert(viewAt(f).eye[0]>=viewAt(f-1).eye[0]-1e-8,'Reveal camera reverses');
for(const f of [1020,1080,1140,1240,1390,1450,1550])assert(stateAt(f).showTayama,'Emotional passage loses Tayama');
assert(!stateAt(1430).memory,'Ending should stay with received kindness, not cut to register');
const world=fs.readFileSync(require('path').join(__dirname,'World.tsx'),'utf8');
const paving=[...world.matchAll(/<Box p=\{\[([^\]]+)\]\} s=\{\[([^\]]+)\]\} map=\{maps.pavement\}/g)].map(m=>({p:m[1].split(',').map(Number),s:m[2].split(',').map(Number)}));
assert.equal(paving.length,4,'Ground slabs not found');
const roadMatch=world.match(/<Box p=\{\[([^\]]+)\]\} s=\{\[([^\]]+)\]\} c="#3d4c5d"/);
assert(roadMatch);const road={p:roadMatch[1].split(',').map(Number),s:roadMatch[2].split(',').map(Number)};
for(const slab of paving){
 assert(Math.abs(slab.p[1]+slab.s[1]/2)<1e-8,'Paving ground height changed');
 const overlap=axis=>Math.min(slab.p[axis]+slab.s[axis]/2,road.p[axis]+road.s[axis]/2)-Math.max(slab.p[axis]-slab.s[axis]/2,road.p[axis]-road.s[axis]/2);
 assert(overlap(0)<=1e-8||overlap(2)<=1e-8,'Coplanar asphalt/pavement overlap');
}
console.log(JSON.stringify({frames:TOTAL,bridges:BRIDGES,maxCameraStep:maxStep,maxFovStep:maxFov,identitySwitch:'stable-framing memory-to-present dissolve',reveal:'coworker face held before one-direction reaction move',scope:'camera/state integrity; creative motion review required'},null,2));
