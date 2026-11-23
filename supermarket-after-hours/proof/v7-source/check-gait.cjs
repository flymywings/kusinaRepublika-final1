const fs = require('fs');
const assert = require('assert/strict');
const esbuild = require('esbuild');
require.extensions['.ts'] = (mod, file) => mod._compile(esbuild.transformSync(fs.readFileSync(file, 'utf8'), {loader:'ts', format:'cjs', target:'node20'}).code, file);
const {groundedGait} = require('./gait.ts');
const smooth = t => { t=Math.max(0,Math.min(1,t)); return t*t*t*(t*(t*6-15)+10); };
const routes = [
  {name:'linear',start:10,end:190,route:f=>[0,0,4*Math.max(0,Math.min(1,(f-10)/180))]},
  {name:'curved eased',start:20,end:260,route:f=>{const t=smooth((f-20)/240);return [1.2*Math.sin(t*Math.PI/2),.025,4.2*t];}},
  {name:'turn and floor rise',start:0,end:240,route:f=>{const t=smooth(f/240);return [t<.5?3*t:1.5,.025*smooth(t),t<.5?0:3*(t-.5)];}},
  {name:'short scaled',start:5,end:85,scale:.91,route:f=>[.3*smooth((f-5)/80),.025,0]},
  {name:'stationary',start:5,end:85,route:()=>[2,.025,3]},
];
let maximumJump=0, maximumReach=0, stancePairs=0;
for(const {name,start,end,route,scale=1} of routes){
  let previous, contactFrames=[0,0], activeFrames=[0,0], bothAir=0;
  for(let f=start-10;f<=end+10;f++){
    const pose=groundedGait(f,start,end,route,scale), root=route(Math.max(start,Math.min(end,f)));
    assert.deepEqual(pose,groundedGait(f,start,end,route,scale),name+' determinism');
    assert(pose.feet.flat().every(Number.isFinite),name+' finite positions');
    assert(pose.swing.every(v=>v>=0&&v<=1),name+' swing range');
    if(!pose.contacts.some(Boolean)) bothAir++;
    for(let i=0;i<2;i++){
      const foot=pose.feet[i], reach=Math.hypot(foot[0]-root[0],foot[2]-root[2]);
      maximumReach=Math.max(maximumReach,reach);
      assert(reach<.75,name+' reach '+reach+' at '+f);
      assert(foot[1]>=-.000001&&foot[1]<=.107001,name+' lift bounds');
      if(f>=start&&f<=end){activeFrames[i]++;if(pose.contacts[i])contactFrames[i]++;}
      if(previous){
        const prior=previous.feet[i], jump=Math.hypot(...foot.map((v,k)=>v-prior[k]));
        maximumJump=Math.max(maximumJump,jump);
        assert(jump<.18,name+' frame jump '+jump+' at '+f);
        if(previous.contacts[i]&&pose.contacts[i]){
          assert.deepEqual(foot,prior,name+' planted foot slides at '+f);stancePairs++;
        }
      }
    }
    assert.equal(bothAir,0,name+' requires a supporting foot');
    previous=pose;
  }
  for(const f of [start-10,start,end,end+10]){
    const p=groundedGait(f,start,end,route,scale),r=route(f<=start?start:end);
    assert(p.contacts.every(Boolean),name+' endpoint support');
    p.feet.forEach((foot,i)=>{
      assert(Math.abs(foot[0]-(r[0]+(i===0?-1:1)*.13*scale))<1e-9,name+' endpoint x');
      assert(Math.abs(foot[1]-(r[1]+.002))<1e-9,name+' grounded sole');
      assert(Math.abs(foot[2]-r[2])<1e-9,name+' endpoint z');
    });
  }
  // Eased starts/stops add support time; each leg should retain a majority stance.
  for(let i=0;i<2;i++)assert(contactFrames[i]/activeFrames[i]>=.55,name+' stance duty');
}
assert(stancePairs>100,'Substantial planted-contact coverage required');
// Independent flat-ground check makes the .08m lift limit exact.
const flat=f=>[0,.025,5*smooth(f/300)];
for(let f=0;f<=300;f+=.25)for(const p of groundedGait(f,0,300,flat).feet)assert(p[1]-.027>=-1e-9&&p[1]-.027<=.08+1e-9,'Exact lift limit');
let routeCalls=0;
const counted=f=>{routeCalls++;return [f/50,.025,Math.sin(f/100)];};
const expected=groundedGait(37,0,100,counted), sampledCalls=routeCalls;
for(const f of [100,0,76,15,37])groundedGait(f,0,100,counted);
groundedGait(37,0,100,counted,.91);
assert.equal(routeCalls,sampledCalls,'Route arclength table must be cached across seeks and scales');
assert.deepEqual(groundedGait(37,0,100,counted),expected,'Seeking must not depend on evaluation order');
expected.feet[0][0]=999;
assert.notEqual(groundedGait(37,0,100,counted).feet[0][0],999,'Caller mutation must not alter cached stance anchors');
assert.throws(()=>groundedGait(0,10,0,counted),/Invalid/,'Reject reversed frame ranges');
console.log(JSON.stringify({routes:routes.length,maximumJump,maximumReach,stancePairs,status:'grounded gait checks passed',scope:'numerical contact/continuity checks, not motion review'},null,2));
