const fs=require('node:fs'),assert=require('node:assert/strict'),esbuild=require('esbuild');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(esbuild.transformSync(fs.readFileSync(f,'utf8'),{loader:ext==='.tsx'?'tsx':'ts',format:'cjs',target:'node20'}).code,f);
const folder=process.argv[2]||'.';
const {drawPerson}=require(require('node:path').resolve(__dirname,folder,'draw.ts'));
const {castAt}=require(require('node:path').resolve(__dirname,folder,'acting.ts'));
const {shotAt}=require(require('node:path').resolve(__dirname,folder,'contract.ts'));
function outline(pose){
 let pts;const pen=new Proxy({}, {get:(o,k)=>k==='shadedFill'?(p)=>{pts=p}:k==='clip'?(p,run)=>run():()=>{},set:()=>true});
 drawPerson(pen,pose);assert.ok(pts?.length,'head outline captured');
 const mean=[0,1].map(a=>pts.reduce((s,p)=>s+p[a],0)/pts.length);
 return pts.map(p=>p.map((n,a)=>n-mean[a]));
}
const baseline=new Map();
for(let out=0;out<762;out++){
 const f=out*1.25;for(const pose of castAt(f,shotAt(f).beat)){
  const shape=outline(pose);if(!baseline.has(pose.id))baseline.set(pose.id,shape);
  const old=baseline.get(pose.id);assert.equal(shape.length,old.length);
  const delta=Math.max(...shape.map((p,i)=>Math.hypot(p[0]-old[i][0],p[1]-old[i][1])));
  assert.ok(delta<.001,`${pose.id}: drawn head changes at output${out} (${(out/30).toFixed(3)}s), maximum shape delta${delta.toFixed(2)} drawing units`);
 }
}
console.log('PASS: actual drawn head outline remains stable for every character across762 output frames. Pose rotation is checked visually.');
