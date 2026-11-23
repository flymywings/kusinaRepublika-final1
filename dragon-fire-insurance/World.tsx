import React,{useMemo} from 'react';
import * as THREE from 'three';
import {ctex,cobble,stone,planks,beam,roof,facade,grass,rep} from './lib/paint';
import {NOINK} from './lib/ink';
import {stateAt,bucketLipAt,ease,lerp,point,CUES,TABLE_TOP,type V3} from './story';

function Box({p,s,c='#ceb88f',map,rot=[0,0,0]}:{p:V3;s:V3;c?:string;map?:THREE.Texture;rot?:V3}){
 return <mesh position={p} rotation={rot} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={map?'#ffffff':c} map={map} roughness={.9}/></mesh>;
}
function Cylinder({p,r,h,c='#78583d',r2,rot=[0,0,0],metal=false}:{p:V3;r:number;h:number;c?:string;r2?:number;rot?:V3;metal?:boolean}){
 return <mesh position={p} rotation={rot} castShadow receiveShadow><cylinderGeometry args={[r,r2??r,h,20]}/><meshStandardMaterial color={c} roughness={metal?.38:.9} metalness={metal?.55:0}/></mesh>;
}
function Lettering({text,width=.7,height=.3,bg='#e9d6a3',color='#382630',size=70}:{text:string;width?:number;height?:number;bg?:string;color?:string;size?:number}){
 const texture=useMemo(()=>ctex('sign-'+text+bg,768,384,g=>{g.fillStyle=bg;g.fillRect(0,0,768,384);g.strokeStyle='#5f3e30';g.lineWidth=20;g.strokeRect(12,12,744,360);g.fillStyle=color;g.font=`900 ${size}px Georgia`;g.textAlign='center';g.textBaseline='middle';text.split('\n').forEach((line,i,all)=>g.fillText(line,384,192+(i-(all.length-1)/2)*size*1.05));}),[text,bg,color,size]);
 return <mesh><planeGeometry args={[width,height]}/><meshLambertMaterial map={texture} side={THREE.DoubleSide}/></mesh>;
}
function House({p,w=3,h=3,d=3,color='#dec79c',roofColor='#a85a49',label,turn=0}:{p:V3;w?:number;h?:number;d?:number;color?:string;roofColor?:string;label?:string;turn?:number}){
 const maps=useMemo(()=>({front:facade('dragon-house-'+color,w,h,{wall:color,shutter:'#466e6b',door:true,timber:true}),side:facade('dragon-side-'+color,d,h,{wall:color,shutter:'#675b7d',timber:true}),roof:rep(roof(roofColor),1,1),wood:beam()}),[color,w,h,d,roofColor]);
 const roofAngle=Math.atan2(w*.36,w*.56),slant=Math.hypot(w*.56,w*.36);
 const gable=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,h,d/2,w/2,h,d/2,0,h+w*.35,d/2,-w/2,h,-d/2,0,h+w*.35,-d/2,w/2,h,-d/2],3));g.computeVertexNormals();return g},[w,h,d]);
 return <group position={p} rotation-y={turn}>
  <Box p={[0,h/2,0]} s={[w,h,d]} c={color} map={maps.side}/>
  <mesh position={[0,h/2,d/2+.013]}><planeGeometry args={[w,h]}/><meshStandardMaterial map={maps.front} roughness={.95}/></mesh>
  <Box p={[0,.12,0]} s={[w+.16,.24,d+.16]} c="#9b8d7e" map={stone()}/>
  {[-1,1].map(s=><group key={s}>
   <Box p={[s*w*.48,h/2,d*.51]} s={[.10,h,.12]} c="#62452f" map={maps.wood}/>
   <Box p={[s*w*.28,h+w*.17,0]} s={[slant,.12,d+.40]} c={roofColor} map={maps.roof} rot={[0,0,-s*roofAngle]}/>
  </group>)}
  <Box p={[0,h*.52,d*.51]} s={[w,.11,.13]} c="#6f4b36" map={maps.wood}/>
  <mesh geometry={gable} receiveShadow castShadow><meshStandardMaterial color={color} roughness={.9}/></mesh>
  <Box p={[0,h+w*.16,d*.51]} s={[.12,w*.34,.12]} c="#6a4c38" map={maps.wood}/>
  <Box p={[w*.29,h+.55,-d*.2]} s={[.38,1.4,.4]} c="#a68572" map={stone()}/>
  <Box p={[w*.29,h+1.27,-d*.2]} s={[.51,.15,.53]} c="#c5a998"/>
  <Box p={[0,.07,d*.6]} s={[.8,.14,.38]} c="#a49b89"/>
  {label&&<group position={[0,h*.59,d*.51+.03]}><Lettering text={label} width={w*.55} height={.42} size={70}/></group>}
  {[-.33,.33].map((x,i)=><group key={i} position={[x*w,h*.78,d*.52]}>
   <Box p={[0,0,0]} s={[.6,.7,.07]} c="#443d53"/>
   <Box p={[0,0,.05]} s={[.47,.56,.015]} c="#e8c979"/>
   <Box p={[0,0,.07]} s={[.04,.59,.02]} c="#685441"/>
   <Box p={[0,0,.07]} s={[.5,.045,.02]} c="#685441"/>
  </group>)}
 </group>;
}
function Tree({p,size=1}:{p:V3;size?:number}){
 return <group position={p} scale={size}><Cylinder p={[0,1.1,0]} r={.11} h={2.2}/>{[[0,2.7,0],[-.45,2.4,.12],[.5,2.5,.08]].map((v,i)=><mesh key={i} position={v as V3} castShadow><icosahedronGeometry args={[.9,1]}/><meshStandardMaterial color={['#7b9f61','#688b5a','#8aa56d'][i]} roughness={1}/></mesh>)}</group>;
}
function Barrel({p,scale=1}:{p:V3;scale?:number}){
 return <group position={p} scale={scale}>
  <Cylinder p={[0,.4,0]} r={.28} r2={.30} h={.8}/>
  {[-.25,.25].map((y,i)=><mesh key={i} position={[0,.4+y,0]} rotation-x={Math.PI/2}><torusGeometry args={[.292,.024,6,20]}/><meshStandardMaterial color="#544c4b" roughness={.7}/></mesh>)}
  <Cylinder p={[0,.81,0]} r={.27} h={.025} c="#b38956"/>
 </group>;
}
export function Bucket({p,tilt=0}:{p:V3;tilt?:number}){
 return <group position={p} rotation-z={tilt}><group position={[0,-.225,0]}>
  <mesh position={[0,-.18,0]} castShadow receiveShadow><cylinderGeometry args={[.22,.17,.38,16,1,true]}/><meshStandardMaterial color="#8d9c9e" metalness={.55} roughness={.42} side={THREE.DoubleSide}/></mesh>
  <Cylinder p={[0,-.36,0]} r={.17} h={.03} c="#697b80" metal/>
  <mesh position={[0,-.01,0]} rotation-x={Math.PI/2}><torusGeometry args={[.22,.018,7,24]}/><meshStandardMaterial color="#d1d6ce" metalness={.7} roughness={.3}/></mesh>
  <mesh position={[0,.025,0]}><torusGeometry args={[.21,.015,7,24,Math.PI]}/><meshStandardMaterial color="#53676f" metalness={.5}/></mesh>
  <Cylinder p={[0,-.04,0]} r={.19} h={.01} c="#91ced9"/>
 </group></group>;
}
function Gold({p,large=false,remaining=1}:{p:V3;large?:boolean;remaining?:number}){
 return <group position={p}>{Array.from({length:Math.max(1,Math.round((large?48:35)*remaining))},(_,i)=>{
  const ring=i%6,row=Math.floor(i/6),a=ring/6*Math.PI*2,r=(large?.23:.18)*(1-row*.065);
  return <Cylinder key={i} p={[Math.cos(a)*r,row*.065,Math.sin(a)*r]} r={large?.095:.078} h={.045} c={i%3?'#e9bc42':'#ffdf80'} metal/>;
 })}</group>;
}
function Barrow({p}:{p:V3}){
 return <group position={p}>
  <Box p={[0,.64,0]} s={[.82,.12,.56]} c="#8d6444" map={planks()}/>
  {[-1,1].map(s=><group key={s}><Box p={[0,.78,s*.30]} s={[.91,.29,.075]} c="#b18451"/><Box p={[-.55,.67,s*.23]} s={[.65,.065,.065]} c="#674b35"/><Box p={[-.22,.32,s*.20]} s={[.06,.6,.06]} c="#71583f" rot={[0,0,-.17]}/></group>)}
  <mesh position={[.43,.27,0]} castShadow><torusGeometry args={[.22,.047,7,20]}/><meshStandardMaterial color="#493e3e"/></mesh>
  <Cylinder p={[.43,.27,0]} r={.034} h={.6} rot={[Math.PI/2,0,0]} c="#66584f"/>
  <Gold p={[0,.78,0]} large/>
 </group>;
}
function TradeDesk(){
 return <group>
  <Box p={[.05,TABLE_TOP-.065,1.13]} s={[1.8,.13,.82]} c="#b3885a" map={planks()}/>
  {[-.66,.66].flatMap(x=>[-1,1].map(z=><Box key={x+','+z} p={[x,.5,1.13+z*.29]} s={[.12,1,.12]} c="#6b4b39" map={beam()}/>))}
  <Box p={[.05,.17,1.13]} s={[1.55,.08,.55]} c="#8e6742" map={planks()}/>
 </group>;
}
function Policy({frame}:{frame:number}){
 const s=stateAt(frame),reading=frame>=548&&frame<641;
 const texture=useMemo(()=>ctex('dragon-policy-v1',768,1024,g=>{
  g.fillStyle='#f5e9c7';g.fillRect(0,0,768,1024);g.strokeStyle='#a58a64';g.lineWidth=12;g.strokeRect(25,25,718,974);
  g.textAlign='center';g.fillStyle='#372734';g.font='900 94px Georgia';g.fillText('FIRE',384,148);g.fillText('COVER',384,249);
  g.font='bold 38px Georgia';g.fillText('ONE COIN · FULL REPLACEMENT',384,335);
  g.font='900 95px Georgia';g.fillText('ANY FIRE',384,550);
  g.strokeStyle='#b6a181';g.lineWidth=6;for(let y=640;y<850;y+=52){g.beginPath();g.moveTo(100,y);g.lineTo(650,y);g.stroke();}
  g.fillStyle='#9e4b43';g.beginPath();g.arc(590,892,64,0,7);g.fill();g.fillStyle='#e9c47a';g.font='bold 54px Georgia';g.fillText('D',590,909);
 }),[]);
 return <group position={s.policyPos} rotation={[-Math.PI/2*(1-s.policyUpright),0,0]}>
  <mesh castShadow receiveShadow><planeGeometry args={[.59,.79]}/><meshLambertMaterial map={texture} side={THREE.DoubleSide}/></mesh>
  <group position={[0,.095,.008]} rotation-x={-Math.PI*ease(frame,548,568)}><mesh position={[0,-.215,0]} castShadow receiveShadow><planeGeometry args={[.585,.43]}/><meshLambertMaterial color="#f5e9c7" side={THREE.DoubleSide}/></mesh></group>
 </group>;
}
function CandleFlame({frame,p,size=1}:{frame:number;p:V3;size?:number}){
 const k=1+Math.sin(frame*.72)*.05;
 return <group position={p} scale={[size*k,size/k,size]}>
  <mesh onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[.047,12,10]}/><meshBasicMaterial color="#ffbd63"/></mesh>
  <mesh position={[0,.033,0]} scale={[.5,1.6,.5]} onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[.036,10,8]}/><meshBasicMaterial color="#ffe1a0"/></mesh>
  <pointLight intensity={.20*size} distance={1.7} color="#ffc27a"/>
 </group>;
}
function CakeScene({frame}:{frame:number}){
 const s=stateAt(frame),wet=s.splash;
 return <group>
  <Box p={[-.1,TABLE_TOP-.055,0]} s={[1.35,.11,.90]} c="#b68c60" map={planks()}/>
  {[-1,1].flatMap(x=>[-1,1].map(z=><Box key={x+','+z} p={[-.1+x*.49,.5,z*.31]} s={[.10,1,.10]} c="#77543a" map={beam()}/>))}
  <Cylinder p={[-.1,TABLE_TOP+.025,0]} r={.43} h={.04} c="#e9e2cc"/>
  <Cylinder p={s.cakePos} r={.33} h={.26-.07*wet} c="#d5a277"/>
  <Cylinder p={[-.1,TABLE_TOP+.30-.08*wet,0]} r={.34} h={.06} c={wet?'#b4d1d1':'#fff1dd'}/>
  {Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2;return <mesh key={i} position={[-.1+Math.cos(a)*.27,TABLE_TOP+.32-.08*wet,Math.sin(a)*.27]} castShadow><sphereGeometry args={[.043,8,6]}/><meshStandardMaterial color={wet?'#c88b91':'#d89197'}/></mesh>})}
  <Cylinder p={[-.1,TABLE_TOP+.43-.08*wet,0]} r={.023} h={.22} c="#819ec2"/>
  {s.candle&&<CandleFlame frame={frame} p={[-.1,TABLE_TOP+.58,0]}/>}
  {wet>0&&<mesh position={[-.1,TABLE_TOP+.06,.05]} rotation-x={-Math.PI/2} scale={[1+.4*wet,.8,1]}><circleGeometry args={[.43,32]}/><meshStandardMaterial color="#8ebfcb" transparent opacity={.6} roughness={.2}/></mesh>}
 </group>;
}
function WaterThrow({frame}:{frame:number}){
 const s=stateAt(frame),time=(frame-1001)/30;
 if(time<0||time>1.5)return null;
 const target:V3=[-.1,1.34,0];
 return <group>{Array.from({length:28},(_,i)=>{
  const emission=1001+i*.21,origin=bucketLipAt(emission);
  const t=Math.max(0,Math.min(1,(frame-emission)/16));if(t<=0||t>=1)return null;
  const p=point(origin,target,t);p[1]+=Math.sin(t*Math.PI)*(.32+(i%4)*.035);p[2]+=(i%7-3)*.018;
  return <mesh key={i} position={p} scale={[.025,.045,.025]} onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[1,7,6]}/><meshBasicMaterial color={i%2?'#b2e0e8':'#86bfcf'} transparent opacity={.8}/></mesh>;
 })}{frame>=CUES.splash&&frame<CUES.splash+23&&Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,t=(frame-CUES.splash)/23,r=t*.7;return <mesh key={'s'+i} position={[-.1+Math.cos(a)*r,1.36+Math.sin(t*Math.PI)*.3,Math.sin(a)*r]} scale={[.03,.08*(1-t),.025]} onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[1,6,5]}/><meshBasicMaterial color="#b7dce2" transparent opacity={1-t}/></mesh>})}</group>;
}

export function Village({frame}:{frame:number}){
 const maps=useMemo(()=>({ground:rep(cobble(),12,12),grass:rep(grass(),10,10),stone:stone()}),[]);
 return <group>
  <Box p={[0,-.16,-6]} s={[44,.30,48]} c="#b9aa8b" map={maps.ground}/>
  <Box p={[0,-.19,-22]} s={[70,.24,30]} c="#8d9c6b" map={maps.grass}/>
  <House p={[-4.4,0,-4.2]} w={3.2} h={3.8} d={3.2} label="BAKERY"/>
  <House p={[3.8,0,-5.5]} w={3.8} h={3.2} d={3.2} color="#aebcc1" roofColor="#596c7e" label="FORGE"/>
  <House p={[-.8,0,-11]} w={5.3} h={5.5} d={4.3} color="#e5d1ac" roofColor="#875b55" label="THE COPPER INN"/>
  {[[-8,0,-11],[7.5,0,-12],[-5,0,-18],[5,0,-20]].map((p,i)=><House key={i} p={p as V3} w={2.7+i*.12} h={3.5+(i%2)*1.3} d={3} color={['#c4bca3','#d3b49f','#a8b6ae','#c5b8ce'][i]} roofColor={i%2?'#707889':'#ad775c'} turn={i%2?-.12:.14}/>)}
  {[[-8,0,0],[7,0,-1],[-10,0,-9],[10,0,-11],[-7,0,-23],[8,0,-26]].map((p,i)=><Tree key={i} p={p as V3} size={1+(i%2)*.3}/>)}
  {[-1,1].map(s=><group key={s} position={[s*7,0,-1]}><Cylinder p={[0,1.1,0]} r={.05} h={2.2} c="#544c50"/><Box p={[0,2.2,0]} s={[.3,.4,.3]} c="#d0b875"/><Box p={[0,2.43,0]} s={[.4,.08,.4]} c="#5d5456"/></group>)}
  <group position={[-4.2,0,-2.4]}><Barrel p={[0,0,0]}/><Barrel p={[.65,0,.15]} scale={.7}/><Box p={[.45,.45,-.4]} s={[.6,.9,.5]} c="#c3b49b"/></group>
  <group position={[4.1,0,-3.5]}><Box p={[0,.8,0]} s={[1.5,.15,.7]} c="#7f6a59"/><Box p={[0,.45,0]} s={[1,.8,.5]} c="#766354"/><Box p={[0,.96,0]} s={[.6,.16,.4]} c="#58626a"/></group>
  <Box p={[4.5,.43,-2.7]} s={[.9,.86,.85]} c={frame>=355&&frame<398?'#635046':'#b4956e'} map={planks()}/>
  <Box p={[4.5,.92,-2.7]} s={[1.03,.13,1.0]} c="#8b6650" rot={[0,0,.12]}/>
  {frame>=CUES.ember&&frame<371&&<CandleFlame frame={frame} p={point([3.9,1.12,-3.3],[4.4,.5,-2.8],ease(frame,342,362))} size={.55}/>}
  {frame>=358&&frame<398&&<CandleFlame frame={frame} p={[4.45,.85,-2.4]} size={2.2}/>}
  {[-1,1].map(s=><group key={'f'+s} position={[s*4.0,0,2.8]}><Cylinder p={[0,.42,0]} r={.25} h={.84} c="#b68a65"/><mesh position={[0,1.1,0]} castShadow><sphereGeometry args={[.5,9,8]}/><meshStandardMaterial color="#748c61"/></mesh></group>)}
  <group position={[0,0,-17]}><Cylinder p={[0,.45,0]} r={.9} h={.9} c="#a6a491"/><Cylinder p={[0,.93,0]} r={1.02} h={.12} c="#d7ceac"/>{[-1,1].map(s=><Box key={s} p={[s*.83,1.65,0]} s={[.13,1.5,.13]} c="#6e5240"/>)}<Box p={[0,2.38,0]} s={[2.0,.15,.3]} c="#6e5240"/></group>
  {[-1,1].map(s=><mesh key={'hill'+s} position={[s*24,2,-48]} scale={[20,8,12]} onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[1,20,12]}/><meshLambertMaterial color={s<0?'#8fa9af':'#9fb4b0'}/></mesh>)}
 </group>;
}
export function StoryProps({frame}:{frame:number}){
 const s=stateAt(frame);
 return <group>
  {!s.ending&&<>
   <TradeDesk/><Policy frame={frame}/>
   <Barrow p={s.barrowPos}/>
   <Box p={[2.15,.30,-.85]} s={[.75,.6,.6]} c="#77543b" map={planks()}/><Gold p={[2.15,.63,-.85]} remaining={s.goldRemaining}/>
   {s.showCoin&&<group position={[s.dragon.left[0],s.dragon.left[1]+.02,s.dragon.left[2]+.025]}><Cylinder p={[0,0,0]} r={.075} h={.025} c="#eac65c" rot={[Math.PI/2,0,0]} metal/></group>}
   <group position={s.stampPos}><Cylinder p={[0,-.08,0]} r={.052} h={.22} c="#6b3c45"/><Box p={[0,-.22,0]} s={[.19,.08,.15]} c="#7c5351"/></group>
  </>}
  {s.ending&&<CakeScene frame={frame}/>}
  <Bucket p={s.bucketPos} tilt={s.bucketTilt}/>
  {s.ending&&<WaterThrow frame={frame}/>}
 </group>;
}
