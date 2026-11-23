const fs=require('fs'),assert=require('assert/strict'),esbuild=require('esbuild');
require.extensions['.ts']=(mod,file)=>mod._compile(esbuild.transformSync(fs.readFileSync(file,'utf8'),{loader:'ts',format:'cjs',target:'node20'}).code,file);
const {viewAt,stateAt,STORY_TOTAL:TOTAL,BRIDGES,REVEAL_SCREEN}=require('./story.ts');
assert(Array.isArray(BRIDGES),'Documented place/time bridges required');
let maxStep=0,maxFov=0;
for(let f=1;f<TOTAL;f++){
 const a=viewAt(f-1),b=viewAt(f),step=Math.hypot(...b.eye.map((n,i)=>n-a.eye[i]));
 if(!BRIDGES.includes(f)){assert(step<.34,`Camera reset at ${f}: ${step}`);assert(Math.abs(b.fov-a.fov)<1.2,`Lens reset at ${f}`);maxStep=Math.max(maxStep,step);maxFov=Math.max(maxFov,Math.abs(b.fov-a.fov));}
 assert.equal(b.eye[0],b.look[0]);assert.equal(b.eye[1],b.look[1]);
 for(const p of [b.eye,b.look,b.focus])assert(p.every(Number.isFinite),`Invalid camera at ${f}`);
}
// The memory-to-present identity switch must be fully hidden by the physical foreground sign.
const at=432,v=viewAt(at),cashier=stateAt(at).staff;
const [maskX,maskY,maskZ]=REVEAL_SCREEN.position,[maskW,maskH]=REVEAL_SCREEN.size;
for(const x of [-.35,.35])for(const y of [0,1.9]){
 const k=(v.eye[2]-maskZ)/(v.eye[2]-cashier.position[2]);
 const px=v.eye[0]+(cashier.position[0]+x-v.eye[0])*k,py=v.eye[1]+(cashier.position[1]+y-v.eye[1])*k;
 assert(Math.abs(px-maskX)<maskW/2&&Math.abs(py-maskY)<maskH/2,'Cashier swaps outside foreground concealment');
}
for(let f=399;f<=516;f++)assert(viewAt(f).eye[0]>=viewAt(f-1).eye[0]-1e-8,'Reveal camera reverses');
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
console.log(JSON.stringify({frames:TOTAL,bridges:BRIDGES,maxCameraStep:maxStep,maxFovStep:maxFov,identitySwitch:'fully behind foreground sign',reveal:'no horizontal reversal',scope:'camera/state integrity; creative motion review required'},null,2));
