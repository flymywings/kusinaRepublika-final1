const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),esbuild=require('esbuild');
require.extensions['.ts']=(m,p)=>m._compile(esbuild.transformSync(fs.readFileSync(p,'utf8'),{loader:'ts',format:'cjs'}).code,p);
const s=require('./story.ts'),pace=require('./pace-r2.ts'),stage=require('./staging.ts'),map=require('./public/pace-map-r2.json'),caps=require('./captions-v8.json');
const pcm=p=>{const b=fs.readFileSync(path.join(__dirname,p));for(let o=12;o+8<=b.length;){const n=b.readUInt32LE(o+4);if(b.toString('ascii',o,o+4)==='data')return b.subarray(o+8,o+8+n);o+=8+n+(n&1);}throw Error('Missing PCM');};
const original=pcm('public/voice-r2-source.wav'),voice=pcm('public/voice-r2.wav');
let quiet=0;for(const a of map.segments.filter(x=>x.kind==='quiet')){assert.equal(a.targetEndSample-a.targetStartSample,a.sourceEndSample-a.sourceStartSample);assert(original.subarray(a.sourceStartSample*2,a.sourceEndSample*2).equals(voice.subarray(a.targetStartSample*2,a.targetEndSample*2)));quiet++;}assert.equal(quiet,20);
const words=fs.readFileSync(path.join(__dirname,'approved/NARRATION-r2.txt'),'utf8').trim().split(/\s+/);assert.deepEqual(caps.map(x=>x.word),words.map(w=>w==='forty-five-year-old'?'45-year-old':w));assert.equal(caps.at(-1).end,s.TOTAL);const wpm=words.length*60/(voice.length/2/48000);assert(Math.abs(wpm-193)<.2);
const overlap=(a,b)=>a.lo.every((v,i)=>a.hi[i]>b.lo[i]+.001&&v<b.hi[i]-.001);
const box=(p,size)=>({lo:p.map((v,i)=>v-size[i]/2),hi:p.map((v,i)=>v+size[i]/2)});
const bounds=pts=>({lo:[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),hi:[0,1,2].map(i=>Math.max(...pts.map(p=>p[i])))});
function shapes(p,v){
 const root=p.position,feet=p.feet,plane=Math.max(root[2],...feet.map(q=>q[2]))+.035,D=v.eye[2]-plane,k=D/(v.eye[2]-root[2]),scale=p.scale;
 const local=(x,y)=>[v.eye[0]+(root[0]+x*scale-v.eye[0])*k,v.eye[1]+(root[1]+y*scale-v.eye[1])*k,plane];
 const body=(x,y)=>{const a=-p.tilt;return[Math.cos(a)*x-Math.sin(a)*(y-.72),.72+Math.sin(a)*x+Math.cos(a)*(y-.72)-.5*(p.crouch??0)+p.stride*.012*Math.cos(p.step*2)];};
 const project=q=>{const t=D/(v.eye[2]-q[2]);return[v.eye[0]+(q[0]-v.eye[0])*t,v.eye[1]+(q[1]-v.eye[1])*t,plane];};
 const torso=[-.24,.24].flatMap(x=>[.66,1.33].map(y=>local(...body(x,y))));
 const hc=body(0,1.59),angle=-p.tilt+(p.headTilt??0),head=[p.role==='tayama'?-.43:-.33,.34].flatMap(x=>[p.role==='tayama'?-.48:-.31,.38].map(y=>local(hc[0]+x*Math.cos(angle)-y*Math.sin(angle),hc[1]+x*Math.sin(angle)+y*Math.cos(angle))));
 const items=[['torso',bounds(torso)],['head/hair',bounds(head)]];
 for(const side of [-1,1]){const sole=project(feet[side>0?1:0]),hip=local(...body(side*.109,.74)),ankle=[sole[0],sole[1]+(p.role==='tayama'?.10:.055)*scale*k,plane],knee=[(hip[0]+sole[0])*.5+side*.035*scale*k,(hip[1]+sole[1])*.52,plane];items.push(['leg',bounds([hip,knee,ankle].flatMap(q=>[-.025,.025].map(r=>[q[0]+r*scale*k,q[1],plane])))]);items.push(['shoe/boot',bounds([-.05,.08].flatMap(x=>[0,p.role==='tayama'?.18:.035].map(y=>[sole[0]+x*scale*k,sole[1]+y*scale*k,plane])))]);}
 for(const [i,h] of [p.hand,p.otherHand].entries())if(h){const q=project(h),a=local(...body(i?-.15:.15,1.22));items.push(['arm',bounds([a,q].flatMap(r=>[[-.06,-.07],[.06,.03]].map(([x,y])=>[r[0]+x*scale*k,r[1]+y*scale*k,r[2]])))]);}
 if(p.role==='sasaki'&&(p.crouch??0)<.1){const q=project(p.otherHand);items.push(['briefcase',bounds([-.152,.152].flatMap(x=>[-.412,-.063].map(y=>[q[0]+x*scale*k,q[1]+y*scale*k,plane])))]);}
 // Give the actual draw plane a narrow thickness for a meaningful slab intersection test.
 items.forEach(([,b])=>{b.lo[2]-=.003;b.hi[2]+=.003;});return{items,plane};
}
let checked=0,minDoorGap=Infinity,minCameraDistance=Infinity,lowestSole=1;const failures=[];
for(let f=0;f<1590;f+=.5){
 const st=s.stateAt(f),v=s.viewAt(f);const solids=[];
 if(f>=252&&f<517){
  solids.push(['checkout',box(stage.CHECKOUT.position.map((n,i)=>i===1?.49:n),stage.CHECKOUT.size)]);
  for(const side of [-1,1])solids.push(['entrance panel',box([stage.ENTRY.x+side*(stage.ENTRY.closedOffset+stage.ENTRY.travel*stage.doorOpenness(f)),1.5,stage.ENTRY.z],[1.16,2.64,.08])]);
  for(const side of [-1,1]){const x=stage.ENTRY.x+side*(stage.ENTRY.closedOffset+stage.ENTRY.travel*stage.doorOpenness(f));solids.push(['door handle',box([x+side*stage.ENTRY.handleOffset,1.38,stage.ENTRY.z+.07],[.028,.45,.04])]);}
  for(const [x,w] of [[-3.9,4],[3.15,5.4]])solids.push(['front glazing',box([x,1.5,.04],[w,2.55,.06])]);
 }
 if(st.service)solids.push(['trolley',box([stage.TROLLEY[0],.40,stage.TROLLEY[2]],[.45,.80,.40])],['service wall',box([9.2,1.6,-8.75],[6.4,3.2,.16])],['store sidewall',box([6,1.82,-4.5],[.18,3.64,9.2])]);
 if(st.office)solids.push(['office desktop',box([20.02,.82,-.55],[2.25,.10,1.25])]);
 const near=box(v.eye,[.22,.22,.22]);for(const [name,b] of solids)assert(!overlap(near,b),`Camera near-plane clearance fails for ${name} at ${f}`);
 for(const role of ['sasaki','tayama','yamada','staff']){
  if(!st['show'+role[0].toUpperCase()+role.slice(1)])continue;
  const p=st[role],shape=shapes(p,v);minCameraDistance=Math.min(minCameraDistance,v.eye[2]-shape.plane);assert(v.eye[2]-shape.plane>.15,`Camera crosses ${role} at ${f}`);
  for(const [name,b] of shape.items)for(const [solid,a] of solids){checked++;if(overlap(b,a)&&failures.length<20)failures.push({f,role,name,solid,bounds:b});}
  for(const foot of p.feet)assert(foot[1]>=s.floorAt(foot)-.004,`Foot below support at ${f}`);
  if(role==='sasaki'&&f>=252&&f<=356){for(const foot of p.feet){const ndc=(foot[1]-v.eye[1])/((v.eye[2]-foot[2])*Math.tan(v.fov*Math.PI/360));lowestSole=Math.min(lowestSole,ndc);assert(ndc>-.96,`Cropped walking foot ${f}`);}}
  if(role==='sasaki'&&f>=252&&f<374&&Math.abs(shape.plane-stage.ENTRY.z)<.12){const gap=stage.doorClearWidth(f);minDoorGap=Math.min(minDoorGap,gap);assert(gap>1.0,`Door not clear for full silhouette at ${f}`);}
 }
}
assert.deepEqual(failures,[],'Conservative displayed silhouette/prop bounds intersect solid scenery');
// Reproduce the reported V5 failures with its original staging values.
const legacyDoorGap=.02;assert(legacyDoorGap<.8);const legacyCounter=box([-1.8,.49,-2.85],[2.18,.98,.86]);assert(overlap(box([-.7,.8,-3.165],[.8,.7,.01]),legacyCounter));
for(const [source,role,minimumWidth] of [[0,'sasaki',.70],[751,'tayama',1.2],[1085,'tayama',.75]]){const v=s.viewAt(source),p=s.stateAt(source)[role],field=2*(v.eye[2]-p.position[2])*Math.tan(v.fov*Math.PI/360)*1080/1920;assert(.56*p.scale/field>minimumWidth,`Insufficient detail scale ${source}`);}
const inside=(point,v,margin=.90)=>{const d=v.eye[2]-point[2],h=d*Math.tan(v.fov*Math.PI/360);return Math.abs((point[0]-v.eye[0])/(h*1080/1920))<margin&&Math.abs((point[1]-v.eye[1])/h)<margin;};
for(const f of [660,666,672]){const v=s.viewAt(f),flame=[s.SERVICE.lighter[0],s.SERVICE.lighter[1]+.075,s.SERVICE.lighter[2]];assert(inside(flame,v),'Flame out of detail frame');assert(flame[1]-.025>s.stateAt(f).sasaki.hand[1]+.030,'Hand obscures flame');}
{const f=751,p=s.stateAt(f).tayama,v=s.viewAt(f),a=-p.tilt,b=a+(p.headTilt??0),hc=[-Math.sin(a)*(.87),.72+Math.cos(a)*.87-.5*p.crouch];for(const x of [-.335,-.265])for(const y of [-.19,.09]){const q=[p.position[0]+p.scale*(hc[0]+x*Math.cos(b)-y*Math.sin(b)),p.position[1]+p.scale*(hc[1]+x*Math.sin(b)+y*Math.cos(b)),p.position[2]];assert(inside(q,v),'Ear hardware cropped in detail frame');}}
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,p))).digest('hex');assert.equal(sha('proof/Tayama - Identity Revision.png'),'7d235635a1a314a198720f973ce20803603827e6260bfed362f9fe079440570f');
for(let f=446;f<=456;f+=.5){const v=s.viewAt(f),p=s.stateAt(f).staff;assert(s.stateAt(f).showStaff);for(const x of [-.15,0,.15])for(const y of [1.36,1.50]){const q=[p.position[0]+x,p.position[1]+y,p.position[2]];assert(inside(q,v),'Coworker face outside framing');const k=(v.eye[2]-s.REVEAL_SCREEN.position[2])/(v.eye[2]-q[2]);const projectedX=v.eye[0]+(q[0]-v.eye[0])*k;assert(Math.abs(projectedX-s.REVEAL_SCREEN.position[0])>s.REVEAL_SCREEN.size[0]/2+.01,'Display obscures coworker features');}}
let maxOutputCameraStep=0,maxOutputFovStep=0,previous;
for(let f=252;f<517;f+=.5){const v=s.viewAt(f),d=v.eye[2]-s.REVEAL_SCREEN.position[2],half=d*Math.tan(v.fov*Math.PI/360)*1080/1920;assert(Math.abs(s.REVEAL_SCREEN.position[0]-v.eye[0])-s.REVEAL_SCREEN.size[0]/2>half*1.05,'Display stand enters register camera corridor');}
for(let out=0;out<s.TOTAL;out++){const f=pace.sourceFrameAt(out),v=s.viewAt(Math.min(1589,f));assert(Number.isFinite(f));if(previous){assert(f>=previous.f);if(!s.BRIDGES.some(b=>previous.f<b&&f>=b)){const step=Math.hypot(...v.eye.map((n,i)=>n-previous.v.eye[i])),lens=Math.abs(v.fov-previous.v.fov);maxOutputCameraStep=Math.max(maxOutputCameraStep,step);maxOutputFovStep=Math.max(maxOutputFovStep,lens);assert(step<.45,`Mapped camera jump ${out}: ${step}`);assert(lens<3,`Mapped lens jump ${out}: ${lens}`);}}previous={f,v};}
for(let i=0;i<caps.length;i++){assert(caps[i].end>caps[i].start);if(i)assert(caps[i].start>=caps[i-1].end);}
const result={frames:s.TOTAL,voiceWpm:wpm,preservedPauses:quiet,quietPcmIdentity:true,captionWords:words.length,conservativeSolidComparisons:checked,minDoorGap,minCameraDistance,lowestWalkingSoleNdc:lowestSole,maxOutputCameraStep,maxOutputFovStep,detailFramingChecks:true,coworkerFeaturesClearOfDisplay:true,scope:'Conservative body/hair/arm/leg/shoe/briefcase bounds at compensated draw depth, listed scenery/near-plane clearance, actual mapped-frame continuity, focus targets, pace and pause checks. Rendering and human audiovisual review remain separate.'};
fs.writeFileSync(path.join(__dirname,'proof/v8-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));

