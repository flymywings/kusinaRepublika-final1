// A lived-in family patisserie in late afternoon.
// Walnut, plaster, worn boards, linen. Colour comes from the window light, the food stays small and muted.
// Coordinates: the door and street window are at +z, side windows (the sun) at +x, the kitchen wall at -z.
import React,{useMemo} from 'react';
import * as THREE from 'three';
import {NOINK} from '../../../pipeline/kit/v1/look/ink';
import {twoTone} from '../../../pipeline/kit/v1/look/shade';
import {ctex,rep,planksHD,rng} from '../../../pipeline/kit/v1/look/paint';

export type V3=[number,number,number];
export const SET={
 seat:[.8,-.22,-2.45] as V3,stand:[.8,0,-.45] as V3,table:{x:.8,z:-1.68,top:.75},
 caseAt:[-1.5,0,-1.5] as V3,behindCase:[-1.5,0,-2.08] as V3,door:{x:-1.2,z:3.2,w:1.05,h:2.25},
};
export const noInk=(o:THREE.Object3D)=>o.layers.set(NOINK);

const G={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,24),wedge:new THREE.CylinderGeometry(1,1,1,3),ball:new THREE.SphereGeometry(1,12,9)};
const mats=new Map<string,THREE.Material>();
function mat(color:string,map?:THREE.Texture){
 const key=color+(map?.uuid??'');
 if(!mats.has(key))mats.set(key,twoTone(new THREE.MeshLambertMaterial({color,map:map??null})));
 return mats.get(key)!;
}
type R=[number,number,number];
function Box({p,s,c='#ffffff',map,cast=true,r}:{p:V3;s:V3;c?:string;map?:THREE.Texture;cast?:boolean;r?:R}){return <mesh geometry={G.box} material={mat(c,map)} position={p} scale={s} rotation={r} castShadow={cast} receiveShadow/>;}
function Cyl({p,r,h,c,rot}:{p:V3;r:number;h:number;c:string;rot?:R}){return <mesh geometry={G.cyl} material={mat(c)} position={p} scale={[r,h,r]} rotation={rot} castShadow receiveShadow/>;}
function Ball({p,s,c,rot}:{p:V3;s:V3;c:string;rot?:R}){return <mesh geometry={G.ball} material={mat(c)} position={p} scale={s} rotation={rot} castShadow receiveShadow/>;}

const CAKES=[['#d8b98b','#eee3d2'],['#62443a','#8a6450'],['#cfa27c','#e6d5c0'],['#9a6a4d','#d9c2a5'],['#d6c29b','#b98f86']];
function Slice({p,i=0,s=1,turn=0}:{p:V3;i?:number;s?:number;turn?:number}){
 const [body,cream]=CAKES[i%CAKES.length];
 return <group position={p} scale={s} rotation-y={turn}>
  <mesh geometry={G.wedge} material={mat(body)} position={[0,.036,0]} scale={[.075,.072,.075]} castShadow receiveShadow/>
  <mesh geometry={G.wedge} material={mat(cream)} position={[0,.08,0]} scale={[.077,.018,.077]} castShadow receiveShadow/>
  {i%3===0&&<Ball p={[0,.105,.01]} s={[.019,.021,.019]} c="#8e3a3c"/>}
 </group>;
}
function Stack({p,n,cake,i=0}:{p:V3;n:number;cake?:boolean;i?:number}){
 return <group position={p}>
  {Array.from({length:n},(_,k)=><Cyl key={k} p={[((k*7)%3-1)*.004,.008+k*.018,((k*5)%3-1)*.004]} r={.104} h={.014} c={k%4===1?'#b9b4a8':'#e2ddd2'}/>)}
  {cake?<Slice p={[0,n*.018,0]} i={i} turn={i*.7}/>:<Ball p={[.02,n*.018+.004,.01]} s={[.016,.006,.014]} c="#a9825e"/>}
 </group>;
}
export function Fork({p,r=[0,0,0]}:{p:V3;r?:R}){
 return <group position={p} rotation={r}>
  <Box p={[0,0,0]} s={[.016,.16,.008]} c="#9ea3a6"/><Box p={[0,.09,0]} s={[.046,.03,.008]} c="#9ea3a6"/>
  {[-.017,0,.017].map(x=><Box key={x} p={[x,.125,0]} s={[.008,.05,.008]} c="#9ea3a6"/>)}
 </group>;
}
function Plant({p,seed,h=.9}:{p:V3;seed:number;h?:number}){
 const leaves=useMemo(()=>{const r=rng(seed);return Array.from({length:30},(_,i)=>{const a=i*2.399,y=.34+r()*h,d=.07+r()*.17;return{p:[Math.cos(a)*d,y,Math.sin(a)*d] as V3,rot:[r()*1.2-.6,a,r()*1.4-.7] as R,c:['#55624a','#66745a','#48533f'][i%3]};});},[seed,h]);
 return <group position={p}>
  <Cyl p={[0,.17,0]} r={.17} h={.34} c="#8b6a58"/><Cyl p={[0,.34+h*.3,0]} r={.015} h={h*.6} c="#554a3c"/>
  {leaves.map((l,i)=><Ball key={i} p={l.p} s={[.1,.018,.05]} rot={l.rot} c={l.c}/>)}
 </group>;
}
function Chair({p,turn=0}:{p:V3;turn?:number}){
 return <group position={p} rotation-y={turn}>
  <Cyl p={[0,.46,0]} r={.2} h={.035} c="#58402f"/>
  {[[-.14,-.14],[.14,-.14],[-.14,.14],[.14,.14]].map(([x,z],i)=><Cyl key={i} p={[x,.225,z]} r={.016} h={.45} c="#4a3529"/>)}
  <mesh position={[0,.64,-.17]} material={mat('#4a3529')} castShadow><torusGeometry args={[.17,.017,8,20,Math.PI]}/></mesh>
  {[-.17,.17].map(x=><Cyl key={x} p={[x,.56,-.17]} r={.017} h={.17} c="#4a3529"/>)}
 </group>;
}

function useTextures(){
 return useMemo(()=>{
  const street=(key:string,seed:number)=>ctex(key,1024,512,g=>{
   const r=rng(seed),k=g.createLinearGradient(0,0,0,512);k.addColorStop(0,'#c5d2d8');k.addColorStop(1,'#efe6d7');g.fillStyle=k;g.fillRect(0,0,1024,512);
   for(let x=-20;x<1040;){
    const w=90+r()*120,y=90+r()*120;
    g.fillStyle=['#b3aaa0','#c2b6a6','#a3a4a3','#b8a596'][Math.floor(r()*4)];g.fillRect(x,y,w-6,512-y);
    g.fillStyle='rgba(84,88,96,.36)';for(let yy=y+22;yy<400;yy+=62)for(let xx=x+14;xx<x+w-28;xx+=38)g.fillRect(xx,yy,22,36);
    x+=w;
   }
   for(let i=0;i<70;i++){g.fillStyle=`rgba(${100+r()*30|0},${120+r()*20|0},96,.5)`;g.beginPath();g.arc(r()*1024,300+r()*130,14+r()*30,0,7);g.fill();}
   g.fillStyle='#b5aca2';g.fillRect(0,440,1024,72);
  });
  return{
   floor:rep(planksHD(),3.2,3.2),
   plaster:ctex('cafe-plaster',1024,1024,(g,r)=>{
    g.fillStyle='#cdbfad';g.fillRect(0,0,1024,1024);
    for(let i=0;i<120;i++){const x=r()*1024,y=r()*1024,d=50+r()*130,k=g.createRadialGradient(x,y,0,x,y,d),t=r()>.5?'236,226,210':'150,130,112';k.addColorStop(0,`rgba(${t},.12)`);k.addColorStop(1,`rgba(${t},0)`);g.fillStyle=k;g.fillRect(x-d,y-d,2*d,2*d);}
    const k=g.createLinearGradient(0,600,0,1024);k.addColorStop(0,'rgba(95,72,60,0)');k.addColorStop(1,'rgba(95,72,60,.2)');g.fillStyle=k;g.fillRect(0,600,1024,424);
   }),
   panel:ctex('cafe-panels',1024,256,(g,r)=>{
    g.fillStyle='#63493b';g.fillRect(0,0,1024,256);
    for(let x=0;x<1024;x+=128){g.fillStyle=r()>.5?'#684d3e':'#5d4437';g.fillRect(x+3,0,122,256);g.strokeStyle='rgba(38,24,20,.5)';g.lineWidth=3;g.strokeRect(x+18,24,92,208);g.fillStyle='rgba(230,200,170,.12)';g.fillRect(x+21,27,86,2);}
   }),
   menu:ctex('cafe-menu',512,640,g=>{
    g.fillStyle='#3a3b37';g.fillRect(0,0,512,640);g.fillStyle='#c9c3b4';g.textAlign='center';g.font='italic 46px Georgia,serif';g.fillText('Today',256,92);g.font='30px Georgia,serif';
    ['Shortcake','Mont Blanc','Chocolat','Apple tart','Pudding'].forEach((s,i)=>{g.fillText(s,256,190+i*84);g.fillRect(150,208+i*84,212,2);});
   }),
   sign:ctex('cafe-sign',1024,200,g=>{g.fillStyle='#3d302b';g.fillRect(0,0,1024,200);g.fillStyle='#c8b28c';g.textAlign='center';g.font='78px Georgia,serif';g.fillText('Patisserie Tsumugi',512,128);}),
   streetA:street('street-front',41),streetB:street('street-side-view',87),
   paving:rep(ctex('cafe-paving',512,512,(g,r)=>{g.fillStyle='#8f8880';g.fillRect(0,0,512,512);for(let y=0;y<512;y+=128)for(let x=0;x<512;x+=128){g.fillStyle=r()>.5?'#a49c93':'#9c958c';g.fillRect(x+3,y+3,122,122);}}),5,3),
  };
 },[]);
}

/** A wall with openings along its local x. Each opening: [from, to, sill, head]. */
function Wall({holes,from,to,h=3.3,map}:{holes:[number,number,number,number][];from:number;to:number;h?:number;map:THREE.Texture}){
 const parts:React.ReactNode[]=[];let x=from;
 const add=(a:number,b:number,y0:number,y1:number)=>{if(b-a>.001&&y1-y0>.001)parts.push(<Box key={parts.length} p={[(a+b)/2,(y0+y1)/2,0]} s={[b-a,y1-y0,.14]} map={map}/>);};
 for(const [a,b,s,e] of holes){add(x,a,0,h);add(a,b,0,s);add(a,b,e,h);x=b;}
 add(x,to,0,h);
 return <>{parts}</>;
}
function Window({a,b,s,e}:{a:number;b:number;s:number;e:number}){
 const c='#4f3a30',w=b-a,x=(a+b)/2,y=(s+e)/2;
 return <group>
  <Box p={[a+.03,y,0]} s={[.06,e-s,.18]} c={c}/><Box p={[b-.03,y,0]} s={[.06,e-s,.18]} c={c}/>
  <Box p={[x,e-.03,0]} s={[w,.06,.18]} c={c}/><Box p={[x,s+.02,0]} s={[w+.1,.05,.24]} c={c}/>
  <Box p={[x,y,0]} s={[.035,e-s,.07]} c={c}/><Box p={[x,e-.5,0]} s={[w,.035,.07]} c={c}/>
 </group>;
}

export interface CafeProps {door:number;bell:number;meal:boolean;box?:boolean;fork?:{p:V3;r:R}}
export function Cafe({door,bell,meal,box,fork}:CafeProps){
 const t=useTextures();
 const M=useMemo(()=>({
  streetA:new THREE.MeshBasicMaterial({map:t.streetA,color:new THREE.Color(1.5,1.43,1.3)}),
  streetB:new THREE.MeshBasicMaterial({map:t.streetB,color:new THREE.Color(1.5,1.43,1.3)}),
  glass:new THREE.MeshBasicMaterial({color:'#cfd8d6',transparent:true,opacity:.09,depthWrite:false,side:THREE.DoubleSide}),
  linen:new THREE.MeshBasicMaterial({color:'#e9dfcf',transparent:true,opacity:.36,depthWrite:false,side:THREE.DoubleSide}),
  lamp:new THREE.MeshBasicMaterial({color:new THREE.Color(1.7,1.3,.85)}),
  caseLight:new THREE.MeshBasicMaterial({color:new THREE.Color(1.15,.95,.7)}),
    menu:twoTone(new THREE.MeshLambertMaterial({map:t.menu})),sign:twoTone(new THREE.MeshLambertMaterial({map:t.sign})),
 }),[t]);
 const d=SET.door,T=SET.table,frontWin:[number,number,number,number]=[.1,2.7,.78,2.55];
 const side:[number,number,number,number][]=[[-2.75,-1.2,.68,2.85],[-.85,1,.68,2.85],[1.35,2.85,.68,2.85]];

 return <group>
  <mesh position={[0,0,0]} rotation-x={-Math.PI/2} material={mat('#716a67',t.floor)} receiveShadow><planeGeometry args={[6.4,6.4]}/></mesh>
  <mesh position={[0,-.004,6.4]} rotation-x={-Math.PI/2} material={mat('#ffffff',t.paving)} receiveShadow><planeGeometry args={[14,6.4]}/></mesh>
  <mesh position={[0,3.3,0]} rotation-x={Math.PI/2} material={mat('#9b8a7c')}><planeGeometry args={[6.4,6.4]}/></mesh>

  <group position={[0,0,-3.2]}><Wall holes={[]} from={-3.2} to={3.2} map={t.plaster}/></group>
  <group position={[-3.2,0,0]} rotation-y={Math.PI/2}><Wall holes={[]} from={-3.2} to={3.2} map={t.plaster}/></group>
  <group position={[3.2,0,0]} rotation-y={-Math.PI/2}>
   <Wall holes={side} from={-3.2} to={3.2} map={t.plaster}/>
   {side.map(([a,b,s,e],i)=><Window key={i} a={a} b={b} s={s} e={e}/>)}
   {side.map(([a,b,s,e],i)=><mesh key={'l'+i} position={[a+.2,(s+e)/2+.1,.14]} material={M.linen} onUpdate={noInk}><planeGeometry args={[.36,e-s]}/></mesh>)}
  </group>
  <group position={[0,0,3.2]}>
   <Wall holes={[[d.x-d.w/2,d.x+d.w/2,0,d.h],frontWin]} from={-3.2} to={3.2} map={t.plaster}/>
   <Window a={frontWin[0]} b={frontWin[1]} s={frontWin[2]} e={frontWin[3]}/>
   {[-1,1].map(q=><Box key={q} p={[d.x+q*(d.w/2+.035),d.h/2,0]} s={[.07,d.h,.2]} c="#4a352c"/>)}
   <Box p={[d.x,d.h+.035,0]} s={[d.w+.14,.07,.2]} c="#4a352c"/>
  </group>

  <group position={[d.x-d.w/2,0,d.z]} rotation-y={-door*1.65}>
   {[.035,d.w-.035].map(x=><Box key={x} p={[x,1.11,0]} s={[.07,2.2,.05]} c="#46544e"/>)}
   {[.06,.8,2.17].map(y=><Box key={y} p={[d.w/2,y,0]} s={[d.w,y===.06?.16:.08,.05]} c="#46544e"/>)}
   <Box p={[d.w/2,.43,0]} s={[d.w-.1,.66,.03]} c="#3d4a45"/>
   <Cyl p={[d.w-.13,1,.06]} r={.016} h={.2} c="#8c7350"/>
   <mesh position={[d.w/2,1.48,0]} material={M.glass} onUpdate={noInk}><planeGeometry args={[d.w-.14,1.3]}/></mesh>
  </group>
  <group position={[d.x+.2,d.h-.02,d.z-.17]} rotation-z={bell}>
   <Cyl p={[0,-.04,0]} r={.006} h={.09} c="#5d4c3a"/>
   <mesh position={[0,-.12,0]} material={mat('#8c7350')} castShadow><coneGeometry args={[.06,.1,16]}/></mesh>
  </group>

  <mesh position={[0,1.7,9.6]} rotation-y={Math.PI} material={M.streetA} onUpdate={noInk}><planeGeometry args={[18,7]}/></mesh>
  <mesh position={[6.6,1.7,0]} rotation-y={-Math.PI/2} material={M.streetB} onUpdate={noInk}><planeGeometry args={[18,7]}/></mesh>

  {/* Kitchen wall */}
  <Box p={[0,.46,-3.105]} s={[6.3,.92,.05]} map={t.panel}/><Box p={[0,.94,-3.08]} s={[6.3,.05,.1]} c="#4a352c"/>
  <mesh position={[2.1,1.75,-3.11]} material={M.menu} receiveShadow><planeGeometry args={[.64,.8]}/></mesh>
  {[1.765,2.435].map(x=><Box key={x} p={[x,1.75,-3.1]} s={[.04,.86,.05]} c="#4a352c"/>)}
  {[[.55,1.92,.36,.28],[1.15,2.12,.3,.4]].map(([x,y,w,h],i)=><group key={i}><Box p={[x,y,-3.11]} s={[w,h,.04]} c="#55403a"/><Box p={[x,y,-3.085]} s={[w-.08,h-.08,.02]} c={i?'#a99f8e':'#8f9a94'}/></group>)}
  {[1.45,1.9,2.35].map((y,j)=><group key={y}>
   <Box p={[-1.55,y,-2.97]} s={[2.1,.04,.28]} c="#5a4234"/>
   {[-2.4,-2.1,-1.85,-1.55,-1.22,-.95,-.7].map((x,i)=>{
    const k=(i+j*2)%5;
    return k===0?<Box key={i} p={[x,y+.14,-2.97]} s={[.17,.24,.12]} c="#a88f72"/>
     :k===1?<group key={i}><Cyl p={[x,y+.11,-2.97]} r={.05} h={.18} c="#6b5a4a"/><Cyl p={[x,y+.23,-2.97]} r={.02} h={.07} c="#4c4038"/></group>
     :k===2?<group key={i}>{[0,1,2].map(n=><Cyl key={n} p={[x,y+.035+n*.03,-2.97]} r={.08} h={.022} c="#c6beb1"/>)}</group>
     :k===3?<Ball key={i} p={[x,y+.07,-2.97]} s={[.14,.07,.08]} c="#9a6a45"/>
     :<Box key={i} p={[x,y+.08,-2.97]} s={[.2,.12,.16]} c="#8d857a"/>;
   })}
  </group>)}

  {/* Display case */}
  <group position={SET.caseAt}>
   <Box p={[0,.34,0]} s={[1.46,.68,.58]} c="#5a4234" map={t.panel}/>
   <Box p={[0,.7,0]} s={[1.52,.04,.64]} c="#3f2f28"/>
   {[-.73,.73].map(x=><Box key={x} p={[x,.92,.28]} s={[.03,.42,.03]} c="#7d684c"/>)}
   {[-.28,.28].map(z=><Box key={z} p={[0,1.125,z]} s={[1.5,.03,.04]} c="#7d684c"/>)}
   <Box p={[0,.92,-.04]} s={[1.4,.018,.3]} c="#8d857a"/>
   <mesh geometry={G.box} material={M.caseLight} position={[0,1.1,.22]} scale={[1.36,.012,.02]} onUpdate={noInk}/>
   {[-.56,-.4,-.24,-.08,.08,.24,.4,.56].map((x,i)=><group key={x}><Slice p={[x,.722,.15]} i={i} turn={.25}/><Slice p={[x,.93,-.04]} i={i+2} turn={-.2} s={.9}/><Box p={[x,.745,.255]} s={[.07,.04,.008]} c="#cfc7b8"/></group>)}
   <mesh position={[0,.92,.3]} material={M.glass} onUpdate={noInk}><planeGeometry args={[1.45,.4]}/></mesh>
  </group>

  {/* Her booth */}
  <Box p={[.95,.24,-2.75]} s={[1.75,.48,.5]} c="#5b4034"/><Box p={[.95,.5,-2.7]} s={[1.7,.1,.48]} c="#6d4a40"/>
  {[.3,.73,1.16,1.6].map(x=><Box key={x} p={[x,.82,-3]} s={[.41,.52,.12]} c="#6d4a40"/>)}
  <Box p={[T.x,T.top-.025,T.z]} s={[1.02,.05,.7]} c="#7a5844"/>
  {[[-.43,-.28],[.43,-.28],[-.43,.28],[.43,.28]].map(([x,z],i)=><Box key={i} p={[T.x+x,.35,T.z+z]} s={[.055,.7,.055]} c="#4a352c"/>)}
  {meal&&<group>
   {/* The wall of her evidence. Its top sits just under her eyes from his first camera. */}
   <Stack p={[.8,T.top,-1.73]} n={9} cake i={4}/><Stack p={[.63,T.top,-1.75]} n={10} cake i={2}/><Stack p={[.97,T.top,-1.7]} n={9} cake i={1}/>
   <Stack p={[.43,T.top,-1.7]} n={7} cake i={3}/><Stack p={[1.19,T.top,-1.78]} n={11}/>
   <Stack p={[.5,T.top,-1.47]} n={5}/><Stack p={[1.15,T.top,-1.5]} n={4} cake i={4}/><Stack p={[.71,T.top,-1.44]} n={2}/><Stack p={[.93,T.top,-1.42]} n={1} cake i={1}/>
   <Cyl p={[1.24,T.top+.05,-1.62]} r={.045} h={.1} c="#b7aea2"/>
  </group>}
  {!meal&&<group><Cyl p={[1.16,T.top+.08,-1.8]} r={.035} h={.16} c="#8d857a"/><Ball p={[1.16,T.top+.2,-1.8]} s={[.06,.05,.06]} c="#b9a39a"/></group>}
  {box&&<group><Box p={[T.x-.12,T.top+.07,-1.5]} s={[.3,.14,.22]} c="#c9b79e"/><Box p={[T.x-.12,T.top+.145,-1.5]} s={[.012,.008,.22]} c="#8b5b50"/></group>}
  {fork&&<Fork p={fork.p} r={fork.r}/>}

  {/* A second table, so the room continues past the frame */}
  <Cyl p={[2.35,.72,.9]} r={.36} h={.04} c="#7a5844"/><Cyl p={[2.35,.36,.9]} r={.035} h={.7} c="#4a352c"/>
  <Chair p={[2.35,0,1.4]} turn={Math.PI}/><Chair p={[2.35,0,.4]}/><Cyl p={[2.3,.78,.86]} r={.04} h={.08} c="#b7aea2"/>
  <Plant p={[2.75,0,-2.7]} seed={7} h={1.25}/><Plant p={[-2.75,0,2.7]} seed={13} h={.9}/><Plant p={[-.35,0,-2.85]} seed={19} h={.55}/>

  {[[-1.5,-1.3],[1,-1.3]].map(([x,z])=><group key={x}>
   <Cyl p={[x,2.98,z]} r={.008} h={.64} c="#3f3430"/>
   <mesh position={[x,2.64,z]} material={mat('#75624a')}><coneGeometry args={[.15,.14,20]}/></mesh>
   <mesh geometry={G.ball} material={M.lamp} position={[x,2.57,z]} scale={.05} onUpdate={noInk}/>
  </group>)}

  {/* Street face of the shop */}
  <mesh position={[1.4,2.86,3.3]} material={M.sign} receiveShadow><planeGeometry args={[2.3,.45]}/></mesh>
  <Plant p={[-2.15,0,3.65]} seed={23} h={.6}/><Plant p={[2.95,0,3.7]} seed={29} h={.7}/>
  <Box p={[1.4,.62,3.3]} s={[2.7,.1,.1]} c="#4a352c"/>
 </group>;
}
