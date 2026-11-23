import React,{useMemo} from 'react';
import * as THREE from 'three';
import {ctex,rep} from './lib/paint';
import {NOINK} from './lib/ink';
import {Shelf,FridgeBank,Checkout,Crates,VendingMachine,Sign} from './StoreProps';
import {stateAt,viewAt,ease,point,COUNTER,REVEAL_SCREEN,type V3} from './story';
import {doorOpenness,TROLLEY,ENTRY} from './staging';

const geo=new THREE.BoxGeometry(1,1,1);
const cache=new Map<string,THREE.Material>();
function material(c:string,metal=false){const k=c+metal;let m=cache.get(k);if(!m){m=new THREE.MeshStandardMaterial({color:c,roughness:metal?.43:.85,metalness:metal?.48:0});cache.set(k,m)}return m;}
function Box({p,s,c='#c5c3b6',map,rot=[0,0,0],emissive=false}:{p:V3;s:V3;c?:string;map?:THREE.Texture;rot?:V3;emissive?:boolean}){
 const m=useMemo(()=>emissive?new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(1.7)}):map?new THREE.MeshStandardMaterial({map,roughness:.9,color:'#ffffff'}):material(c),[c,map,emissive]);
 return <mesh position={p} rotation={rot} scale={s} geometry={geo} material={m} castShadow={!emissive} receiveShadow onUpdate={emissive?o=>o.layers.set(NOINK):undefined}/>;
}
function Pipe({p,r=.025,h=1,c='#818c91',rot=[0,0,0]}:{p:V3;r?:number;h?:number;c?:string;rot?:V3}){return <mesh position={p} rotation={rot} castShadow><cylinderGeometry args={[r,r,h,10]}/><meshStandardMaterial color={c} roughness={.55} metalness={.35}/></mesh>}
function TextSign({p,text,w=1,h=.3,turn=0,bg='#f1e7ce',color='#303a42'}:{p:V3;text:string;w?:number;h?:number;turn?:number;bg?:string;color?:string}){return <group position={p} rotation-y={turn}><Sign text={text} width={w} height={h} bg={bg} color={color}/></group>}
function Glazing({p,w,h}:{p:V3;w:number;h:number}){
 const m=useMemo(()=>new THREE.MeshPhysicalMaterial({color:'#9cbabc',roughness:.12,metalness:.08,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide}),[]);
 return <group position={p}><mesh material={m}><planeGeometry args={[w,h]}/></mesh>{[-1,1].map(s=><Box key={s} p={[s*w/2,0,0]} s={[.055,h+.08,.075]} c="#59666b"/>)}{[-1,1].map(s=><Box key={'h'+s} p={[0,s*h/2,0]} s={[w+.06,.055,.075]} c="#59666b"/>)}<mesh position={[-w*.25,.06,.018]} rotation-z={-.12} onUpdate={o=>o.layers.set(NOINK)}><planeGeometry args={[.045,h*.78]}/><meshBasicMaterial color="#e2eef0" transparent opacity={.13} depthWrite={false}/></mesh></group>;
}
function Office(){
 return <group position={[20,0,0]}>
  <Box p={[0,-.05,-1]} s={[9,.15,7]} c="#737d88"/>
  <Box p={[0,3.45,-1]} s={[9,.12,7]} c="#78858c"/>
  <Box p={[0,1.7,-3.5]} s={[9,3.4,.12]} c="#687482"/>
  {[-2.5,0,2.5].map((x,i)=><group key={i}><Box p={[x,1.9,-3.41]} s={[2.2,2.0,.08]} c="#192b46"/>{Array.from({length:12},(_,n)=><Box key={n} p={[x-1+(n%4)*.55,1.3+Math.floor(n/4)*.5,-3.35]} s={[.22,.12,.015]} c={n%3?'#3f5369':'#bbaa74'}/>)}<Box p={[x,1.9,-3.27]} s={[.05,2.08,.05]} c="#a8b5b7"/></group>)}
  <Box p={[.02,.82,-.55]} s={[2.25,.10,1.25]} c="#b7b5a9"/>{[-.9,.9].map(x=><Box key={x} p={[x,.39,-.55]} s={[.065,.78,.75]} c="#626c75"/>)}
  <Box p={[.85,1.10,-1.0]} s={[.82,.52,.06]} c="#26333c"/><Box p={[.85,1.11,-.959]} s={[.73,.42,.015]} c="#adc1be"/>
  <TextSign p={[.85,1.10,-.942]} text={'MONTHLY REPORT'} w={.65} h={.13} bg="#adc1be" color="#4f6870"/>
  <Box p={[.85,.96,-1.0]} s={[.1,.22,.08]} c="#485b63"/><Box p={[.15,.887,-.55]} s={[.62,.028,.23]} c="#48545d"/>
  {[0,1,2].map(i=><Box key={i} p={[-.72,.9+i*.016,-.50+i*.04]} s={[.40,.014,.48]} c={i%2?'#d3d2c3':'#e9e5d4'} rot={[0,-.08+i*.04,0]}/>)}
  <Pipe p={[.95,.99,-.72]} r={.074} h={.22} c="#d5d8d0"/>
  <Box p={[-1.5,.60,-1.25]} s={[.55,1.0,.12]} c="#3a4654"/>
  <pointLight position={[.1,2.5,-.5]} color="#d3e9f0" intensity={6} distance={8} decay={2}/>
  <Box p={[0,3,-1.3]} s={[2.6,.04,.16]} c="#d5e3dd" emissive/>
 </group>;
}
export function World({frame}:{frame:number}){
 const maps=useMemo(()=>{
  const tile=ctex('after-hours-tile',512,512,g=>{g.fillStyle='#babeb4';g.fillRect(0,0,512,512);g.strokeStyle='#929e99';g.lineWidth=3;for(let i=0;i<=512;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i,512);g.moveTo(0,i);g.lineTo(512,i);g.stroke()}for(let i=0;i<900;i++){const x=(i*73)%512,y=(i*137)%512;g.fillStyle=i%2?'#c5c8bd':'#aeb6ae';g.fillRect(x,y,2,1)}});
  const pavement=ctex('after-hours-paving',512,512,g=>{g.fillStyle='#65717b';g.fillRect(0,0,512,512);g.strokeStyle='#414e5d';g.lineWidth=5;for(let r=0;r<8;r++)for(let c=0;c<5;c++){const x=c*128-(r%2)*64,y=r*64;g.strokeRect(x,y,126,62)}for(let i=0;i<800;i++){g.fillStyle=i%3?'#6c7882':'#52616d';g.fillRect((i*71)%512,(i*109)%512,2,1)}});
  const wall=ctex('after-hours-concrete',512,512,g=>{g.fillStyle='#89979b';g.fillRect(0,0,512,512);for(let i=0;i<1900;i++){g.globalAlpha=.13;g.fillStyle=i%3?'#c5c7b9':'#495d69';g.fillRect((i*83)%512,(i*131)%512,5+(i%9),2+(i%7))}g.globalAlpha=1;g.strokeStyle='#6a7e83';g.lineWidth=3;g.strokeRect(0,0,512,512);for(let y=30;y<512;y+=200)for(let x=30;x<512;x+=200){g.fillStyle='#61747b';g.beginPath();g.arc(x,y,3,0,7);g.fill()}});
  return{tile:rep(tile,5,5),pavement:rep(pavement,12,16),wall:rep(wall,4,2)};
 },[]);
 const door=doorOpenness(frame);
 return <group>
  {/* Pavement slabs stop exactly at the road rectangle; both surfaces stay at y=0. */}
  <Box p={[2,-.10,-7]} s={[42,.20,24]} map={maps.pavement}/>
  <Box p={[2,-.10,13]} s={[42,.20,4]} map={maps.pavement}/>
  <Box p={[-15.5,-.10,8]} s={[7,.20,6]} map={maps.pavement}/>
  <Box p={[18.5,-.10,8]} s={[9,.20,6]} map={maps.pavement}/>
  <Box p={[1,-.025,8]} s={[26,.05,6]} c="#3d4c5d"/>
  {[-8,-3,2,7,12].map(x=><Box key={'road'+x} p={[x,.006,8]} s={[2.3,.012,.09]} c="#a2aaa3"/>)}
  <Box p={[0,-.005,-4.45]} s={[11.9,.06,8.9]} map={maps.tile}/>
  {/* Flush curb wear and short drain grates sit at the far shoulders, outside the entrance path. */}
  {[-9.2,10.8].map((x,i)=><group key={'shoulder'+i}>
   <Box p={[x,.001,4.76]} s={[2.5,.002,.045]} c="#77817f"/>
   {[-.16,-.08,0,.08,.16].map((dx,j)=><Box key={j} p={[x+dx,.006,4.88]} s={[.018,.012,.24]} c="#34434b"/>)}
  </group>)}
  <Box p={[0,1.82,-9]} s={[12.2,3.64,.18]} map={maps.wall}/>
  <Box p={[0,3.55,-4.5]} s={[12.2,.12,9.15]} c="#b4bfb5"/>
  <Box p={[-6,1.82,-4.5]} s={[.18,3.64,9.2]} map={maps.wall}/>
  <Box p={[6,1.82,-4.5]} s={[.18,3.64,9.2]} map={maps.wall}/>
  <Box p={[0,3.3,.03]} s={[12.2,.68,.30]} c="#cfdfcd"/>
  <Box p={[0,3.65,.03]} s={[12.3,.12,.48]} c="#9e4c5a"/>
  <TextSign p={[-.7,3.27,.20]} text={'SUPER S'} w={3.1} h={.45} bg="#cfdfcd" color="#9b3e50"/>
  <Box p={[0,2.89,.03]} s={[12.1,.11,.22]} c="#c48177"/>
  <><Glazing p={[-3.90,1.5,.04]} w={4.00} h={2.55}/>
  <Glazing p={[3.15,1.5,.04]} w={5.40} h={2.55}/>
  {[-1,1].map(s=><group key={s} position={[ENTRY.x+s*(ENTRY.closedOffset+door*ENTRY.travel),1.5,ENTRY.z]}><Glazing p={[0,0,0]} w={ENTRY.panelWidth} h={2.55}/><Box p={[s*ENTRY.handleOffset,-.12,.07]} s={[.028,.45,.04]} c="#cad6cc"/></group>)}</>
  <TextSign p={[-.7,2.73,.12]} text={'WELCOME'} w={1.25} h={.18} bg="#e2e7c8" color="#4e786f"/>
  <TextSign p={[-4.85,1.04,.11]} text={'OPEN 24H'} w={.74} h={.24} bg="#b95665" color="#f9ead2"/>
  <TextSign p={[3.30,.95,.11]} text={'FRESH DAILY'} w={.95} h={.36} bg="#cfb76f" color="#3b4b50"/>
  <Checkout position={COUNTER}/>
  <group position={REVEAL_SCREEN.position}>
   <Box p={[0,-.60,0]} s={[.022,1.2,.025]} c="#58666a"/>
   <Box p={[0,-1.15,0]} s={[.33,.045,.24]} c="#48585f"/>
   <Box p={[0,0,0]} s={REVEAL_SCREEN.size} c="#c5cdb4"/>
   <TextSign p={[0,.20,.024]} text="DAILY" w={.22} h={.10} bg="#c5cdb4" color="#456157"/>
   <TextSign p={[0,.06,.024]} text="DEALS" w={.22} h={.10} bg="#c5cdb4" color="#456157"/>
   {[-.10,-.17,-.24].map((y,i)=><Box key={i} p={[0,y,.024]} s={[i===1?.12:.16,.023,.004]} c="#849887"/>)}
  </group>
  <Shelf position={[-4.3,0,-4.4]} length={2.3}/><Shelf position={[-1.5,0,-5.2]} length={2.6}/><Shelf position={[1.7,0,-5.2]} length={2.6}/>
  <Shelf position={[-4.3,0,-6.3]} length={2.3}/><Shelf position={[-1.5,0,-7.0]} length={2.6}/><Shelf position={[1.7,0,-7.0]} length={2.6}/>
  <FridgeBank position={[3.5,0,-8.4]} width={3.8}/>
  <TextSign p={[-4.2,2.20,-6.25]} text={'DAILY GOODS'} w={1.8} h={.28} bg="#6d9d90" color="#f2ebd2"/>
  <TextSign p={[.1,2.35,-7]} text={'SNACKS  /  DRINKS'} w={2.1} h={.26} bg="#caaf70" color="#384950"/>
  {[-3.5,0,3.5].map(x=><group key={x}><Box p={[x,3.16,-4.0]} s={[2.55,.055,.22]} c="#d7e4da" emissive/><pointLight position={[x,2.9,-3.8]} color="#d8ebde" intensity={12} distance={8} decay={2}/></group>)}
  {[-5.8,5.8].map(x=><Box key={x} p={[x,1.5,.12]} s={[.16,3,.22]} c="#b1bfb8"/>)}
  <Box p={[-.7,-.016,1.1]} s={[3.0,.04,1.5]} c="#414f59"/>
  <Box p={[5.35,.10,1.4]} s={[.16,.20,3.0]} c="#9ca6a1"/>
  <Crates position={[-5.1,0,-.65]}/>
  <Box p={[9.2,1.6,-8.75]} s={[6.4,3.2,.16]} map={maps.wall}/>
  <Box p={[7.25,1.22,-8.64]} s={[1.25,2.44,.10]} c="#566b74"/>
  <Box p={[7.25,1.23,-8.56]} s={[1.08,2.23,.025]} c="#6c8087"/>
  <Box p={[7.72,1.14,-8.49]} s={[.03,.26,.045]} c="#b5c3bd"/>
  <TextSign p={[7.25,1.75,-8.48]} text={'STAFF ONLY'} w={.8} h={.22} bg="#b8c9be" color="#3b545a"/>
  <Box p={[8.8,2.77,-8.6]} s={[1.3,.18,.27]} c="#485760"/><Box p={[8.8,2.68,-8.44]} s={[1.11,.065,.15]} c="#efc88e" emissive/>
  <pointLight position={[8.8,2.55,-7.95]} color="#ffd09a" intensity={18} distance={8} decay={2}/>
  <Crates position={[6.75,0,-7.8]}/>
  <VendingMachine position={[11.45,0,-7.9]} yaw={-.12}/>
  <TextSign p={[6.13,1.55,-5.3]} text={'SERVICE AREA'} w={.95} h={.27} turn={Math.PI/2} bg="#b2c4bb"/>
  {/* Small service-door wear and push plate; kept on the door face, clear of the actor lane. */}
  <Box p={[7.70,1.04,-8.518]} s={[.12,.31,.018]} c="#b9c0b8"/>
  <Box p={[7.70,1.12,-8.505]} s={[.065,.026,.008]} c="#56666c"/>
  <Box p={[7.25,.16,-8.51]} s={[.38,.035,.012]} c="#53636a"/>
  {/* Compact delivery trolley parked at the service area's left edge. */}
  <group position={TROLLEY}>
   <Box p={[0,.12,0]} s={[.40,.055,.35]} c="#5b6d72"/>
   {[-.17,.17].map(x=><group key={'trolley'+x}><Pipe p={[x,.44,0]} r={.016} h={.64} c="#8d9b98"/><Box p={[x,.055,-.10]} s={[.105,.105,.045]} c="#38454b"/></group>)}
   <Box p={[0,.36,-.01]} s={[.28,.40,.27]} c="#b69c73"/>
   <Box p={[0,.66,-.01]} s={[.28,.20,.25]} c="#c6ae83"/>
  </group>
  {[0,1,2].map(i=><group key={i}><Pipe p={[6.16,1.58,-6.4+i*.16]} h={3.05} r={.028}/><Box p={[6.19,1.48,-6.8+i*.45]} s={[.09,.4,.3]} c="#586f78"/></group>)}
  <Box p={[6.55,.48,-7.00]} s={[.75,.96,.66]} c="#a4b1ac"/>
  {Array.from({length:10},(_,i)=><Box key={i} p={[6.55,.15+i*.065,-6.655]} s={[.60,.012,.015]} c="#556c77"/>)}
  <Pipe p={[10.27,.46,-6.70]} r={.08} h={.92} c="#576570"/>
  <mesh position={[10.27,.95,-6.70]}><cylinderGeometry args={[.18,.14,.07,20]}/><meshStandardMaterial color="#b5bdb3" roughness={.4} metalness={.65}/></mesh>
  <mesh position={[10.27,.99,-6.70]}><cylinderGeometry args={[.12,.12,.012,20]}/><meshStandardMaterial color="#34414a"/></mesh>
  {[0,1,2,3].map(i=><Box key={'a'+i} p={[10.22+(i%2)*.04,.998,-6.72+Math.floor(i/2)*.05]} s={[.023,.014,.035]} c="#b5aa96"/>)}
  {[0,1,2,3,4].map(i=><group key={'fence'+i}><Pipe p={[12.55,1.25,-8.6+i*2]} h={2.5} r={.025}/>{Array.from({length:12},(_,n)=><Pipe key={n} p={[12.55,.15+n*.19,-7.6+i*2]} h={2.0} r={.005} rot={[Math.PI/2,0,0]} c="#73878d"/>)}</group>)}
  {Array.from({length:12},(_,i)=><Box key={'drain'+i} p={[7+i*.4,.016,-8.28]} s={[.32,.015,.09]} c="#334855"/>)}
  <Box p={[8.0,.018,-7.7]} s={[1.6,.018,.05]} c="#41535f"/>
  <Box p={[8.75,.019,-7.4]} s={[.03,.02,.64]} c="#41535f" rot={[0,.4,0]}/>
  {[[-8,-16],[17,-16],[-4,14],[7,14]].map(([x,z],i)=><group key={'city'+x}><Box p={[x,5,z]} s={[6,10,6]} c={i%2?'#40546b':'#485c72'}/>{Array.from({length:18},(_,n)=><Box key={n} p={[x-2+(n%3)*1.6,1.6+Math.floor(n/3)*1.5,z+(z>0?-3.04:3.04)]} s={[.65,.65,.025]} c={n%3?'#70857e':'#d6bf83'} emissive={n%3===0}/> )}</group>)}
  <Office/>
 </group>;
}
function Bag({position,yaw}:{position:V3;yaw:number}){return <group position={position} rotation-y={yaw}><Box p={[0,-.23,0]} s={[.38,.42,.12]} c="#313442"/><Box p={[0,-.21,.065]} s={[.32,.32,.015]} c="#3c414c"/>{[-1,1].map(s=><Box key={s} p={[s*.07,.015,0]} s={[.018,.08,.035]} c="#252a32"/>)}<Box p={[0,.048,0]} s={[.16,.015,.04]} c="#252a32"/><Box p={[.1,-.14,.08]} s={[.035,.045,.015]} c="#aaafa9"/></group>}
function Cigarette({p,yaw,lit=true}:{p:V3;yaw:number;lit?:boolean}){return <group position={p} rotation-y={yaw}><mesh position={[0,0,.085]} rotation-x={Math.PI/2} onUpdate={o=>o.layers.set(NOINK)}><cylinderGeometry args={[.009,.009,.12,10]}/><meshBasicMaterial color="#f0e6d5"/></mesh><mesh position={[0,0,.012]} rotation-x={Math.PI/2} onUpdate={o=>o.layers.set(NOINK)}><cylinderGeometry args={[.009,.009,.026,10]}/><meshBasicMaterial color="#bd8b58"/></mesh><mesh position={[0,0,.148]} rotation-x={Math.PI/2} onUpdate={o=>o.layers.set(NOINK)}><cylinderGeometry args={[.0095,.0095,.008,10]}/><meshBasicMaterial color={lit?'#de8757':'#b5b4ab'}/></mesh></group>}
function Smoke({frame,p}:{frame:number;p:V3}){const texture=useMemo(()=>ctex('soft-smoke',64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(207,218,218,.5)');r.addColorStop(1,'rgba(207,218,218,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}),[]);return <group>{Array.from({length:9},(_,i)=>{const age=((frame+i*8)%77)/77;return <sprite key={i} position={[p[0]+Math.sin(age*5+i)*age*.06,p[1]+age*.53,p[2]+age*.12]} scale={[.04+age*.18,.07+age*.20,1]} onUpdate={o=>o.layers.set(NOINK)}><spriteMaterial map={texture} transparent opacity={(1-age)*.20} depthWrite={false}/></sprite>})}</group>}
export function StoryProps({frame,flatCastAccessories=false}:{frame:number;flatCastAccessories?:boolean}){
 const s=stateAt(frame),p=s.sasaki.position,yaw=s.sasaki.yaw;
 const hand=s.sasaki.hand??[p[0]+.18,.88,p[2]+.10] as V3;
 const bag=s.sasaki.otherHand??[p[0]-.22,.87,p[2]+.08] as V3;
 const lean=-s.sasaki.tilt,headAngle=lean+(s.sasaki.headTilt??0),view=viewAt(frame),cardYaw=Math.atan2(view.eye[0]-p[0],view.eye[2]-p[2]);
 const mx=-Math.sin(lean)*.87+Math.sin(headAngle)*.103,my=.72+Math.cos(lean)*.87-Math.cos(headAngle)*.103;
 const mouth:V3=flatCastAccessories?[p[0]+mx,p[1]+my-.50*(s.sasaki.crouch??0)+(s.sasaki.stride??0)*.012*Math.cos((s.sasaki.step??0)*2),p[2]+.015]:[p[0],1.46,p[2]+.05];
 const cigarette=frame<590?hand:point(mouth,hand,ease(frame,795,819));
 return <group>
  {!flatCastAccessories&&!s.office&&s.showSasaki&&<Bag position={bag} yaw={0}/>}
  {(frame>=517||frame<105)&&!s.memory&&s.showSasaki&&<><Cigarette p={cigarette} yaw={Math.PI/2}/>{frame>=675&&<Smoke frame={frame} p={cigarette}/>}</>}
  {s.showTayama&&<>{!flatCastAccessories&&<Cigarette p={s.tayama.hand!} yaw={-1.55} lit={frame<105||frame>=671}/ >}{(frame<105||frame>=671)&&<Smoke frame={frame+28} p={s.tayama.hand!}/>}</>}
  {s.lighterVisible&&<group position={hand}><Box p={[0,.012,0]} s={[.035,.07,.018]} c="#b79d70"/><Box p={[0,.046,0]} s={[.037,.006,.020]} c="#d0d2c1"/>{s.flame&&<><mesh position={[0,.075,0]} scale={[.012,.025,.012]} onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[1,8,8]}/><meshBasicMaterial color="#ffcc86"/></mesh><pointLight position={[0,.075,0]} color="#ffbd7a" intensity={.35} distance={.65}/></>}</group>}
  {s.receiptVisible&&<group position={s.yamada.hand} rotation-x={-Math.PI*.38}><Box p={[0,0,0]} s={[.09,.18,.005]} c="#e6e9da"/>{Array.from({length:6},(_,i)=><Box key={i} p={[0,-.055+i*.02,.004]} s={[i%2?.05:.065,.004,.002]} c="#687e7c"/>)}</group>}
 </group>;
}
