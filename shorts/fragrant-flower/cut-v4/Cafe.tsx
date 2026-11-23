// A lived-in family patisserie in late afternoon.
// Walnut, plaster, worn boards, linen. Colour comes from the window light, the food stays small and muted.
// Coordinates: the door and street window are at +z, side windows (the sun) at +x, the kitchen wall at -z.
import React,{useMemo} from 'react';
import * as THREE from 'three';
import {NOINK} from '../../../pipeline/kit/v1/look/ink';
import {twoTone} from '../../../pipeline/kit/v1/look/shade';
import {ctex,rep,planksHD,rng} from '../../../pipeline/kit/v1/look/paint';

import {SET,MIRROR,type V3} from './consts';
export {SET,MIRROR};export type {V3};
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
   // Invented words only (decision 2, option A). None of these is a real word or a real shop.
   menu:ctex('cafe-menu-v4',512,640,g=>{
    g.fillStyle='#3a3b37';g.fillRect(0,0,512,640);g.fillStyle='#c9c3b4';g.textAlign='center';g.font='italic 46px Georgia,serif';g.fillText('Tovel',256,92);g.font='30px Georgia,serif';
    ['Brolane','Vorlin','Pamquet','Trumel','Zefrin'].forEach((s,i)=>{g.fillText(s,256,190+i*84);g.fillRect(150,208+i*84,212,2);});
   }),
   sign:ctex('cafe-sign-v4',1024,200,g=>{g.fillStyle='#3d302b';g.fillRect(0,0,1024,200);g.fillStyle='#c8b28c';g.textAlign='center';g.font='78px Georgia,serif';g.fillText('Wennavi Corsel',512,128);}),
   board:ctex('street-board-v4',512,640,g=>{
    g.fillStyle='#2f3331';g.fillRect(0,0,512,640);g.fillStyle='#d6d0c2';g.textAlign='center';g.font='italic 54px Georgia,serif';g.fillText('Oskarel',256,110);g.font='34px Georgia,serif';
    ['Pimbrey','Dallowt','Kesperin'].forEach((s,i)=>{g.fillText(s,256,230+i*100);g.fillRect(120,252+i*100,272,2);});
   }),
   hang:ctex('street-hang-v4',512,200,g=>{g.fillStyle='#5b4a3a';g.fillRect(0,0,512,200);g.fillStyle='#d9cdb2';g.textAlign='center';g.font='64px Georgia,serif';g.fillText('Fumbrel',256,128);}),
   shopA:ctex('street-shop-a-v4',768,200,g=>{g.fillStyle='#3b4540';g.fillRect(0,0,768,200);g.fillStyle='#d5cdb8';g.textAlign='center';g.font='70px Georgia,serif';g.fillText('Tarvonel Hosk',384,125);}),
   shopB:ctex('street-shop-b-v4',768,200,g=>{g.fillStyle='#5a4448';g.fillRect(0,0,768,200);g.fillStyle='#e0d3c0';g.textAlign='center';g.font='70px Georgia,serif';g.fillText('Quillby Nerrow',384,125);}),
   // What the mirror holds behind his reflected card: the shop in front of her booth, cooler and darker than the room.
   reflect:ctex('mirror-reflect-v7',640,690,(g,r)=>{
    // Glass is 1.30 m wide x 1.40 m high: x .23-1.53, y .87-2.27. Her reflection sits at the left, his face right of centre.
    const k=g.createLinearGradient(0,0,0,690);k.addColorStop(0,'#6b7d86');k.addColorStop(1,'#3d4852');g.fillStyle=k;g.fillRect(0,0,640,690);
    g.filter='blur(2px)';
    // a flat, shallow lit window panel low on the left: her reflected hair and shoulder are silhouetted against it
    g.fillStyle='rgba(224,234,238,.96)';g.fillRect(0,400,300,290);g.fillStyle='rgba(120,138,148,.55)';g.fillRect(148,400,5,290);
    // the shop's menu card from the wall behind the camera, written backwards: it can only be a reflection
    g.fillStyle='#2f3633';g.fillRect(36,40,236,300);g.strokeStyle='#8c7350';g.lineWidth=6;g.strokeRect(36,40,236,300);
    g.save();g.translate(272,0);g.scale(-1,1);g.fillStyle='#d6d0c2';g.textAlign='center';
    g.font='italic 52px Georgia,serif';g.fillText('Tovel',118,112);g.font='30px Georgia,serif';
    ['Brolane','Vorlin','Pamquet','Trumel'].forEach((t,i)=>{g.fillText(t,118,176+i*40);g.fillRect(40,184+i*40,156,2);});
    g.restore();
    // a close, shallow display case with its cakes, right
    g.fillStyle='#46382f';g.fillRect(470,590,170,100);g.fillStyle='#6e5744';g.fillRect(464,578,182,14);
    for(let i=0;i<4;i++){g.fillStyle=['#b69c76','#74544a','#c3a784','#9a7459'][i];g.fillRect(480+i*37,548,28,30);}
    // the back of her booth, across the bottom
    g.fillStyle='#4a3428';g.fillRect(0,646,640,44);g.fillStyle='#5b4132';g.fillRect(0,638,640,10);
    g.filter='none';
    // age spots, crowded toward the edges
    for(let i=0;i<260&&i<120;i++){const x=r()*640,y=r()*690,e=Math.min(x,640-x,y,690-y)/120;if(r()>Math.max(.06,1-e))continue;const d=1.5+r()*5;g.fillStyle=r()>.5?'rgba(30,38,44,.36)':'rgba(224,236,242,.22)';g.beginPath();g.arc(x,y,d,0,7);g.fill();}
    // edge falloff
    for(const [x0,y0,x1,y1] of [[0,0,46,0],[640,0,594,0],[0,0,0,56],[0,690,0,640]]){const e=g.createLinearGradient(x0,y0,x1,y1);e.addColorStop(0,'rgba(20,26,32,.5)');e.addColorStop(1,'rgba(20,26,32,0)');g.fillStyle=e;g.fillRect(0,0,640,690);}
    // a faint diagonal sheen across his shoulder (below his face, lower right), not across the face
    g.save();g.beginPath();g.rect(300,520,340,170);g.clip();
    const sh=g.createLinearGradient(300,690,640,520);sh.addColorStop(.3,'rgba(255,255,255,0)');sh.addColorStop(.5,'rgba(255,255,255,.2)');sh.addColorStop(.7,'rgba(255,255,255,0)');g.fillStyle=sh;g.fillRect(300,520,340,170);g.restore();
   }),
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

/** The small one-slice box with a window, and the two coins. Both rest on the table; a visible hand sets them down or pushes them. */
export interface CafeProps {door:number;bell:number;meal:boolean;box?:boolean;fork?:{p:V3;r:R};slice?:{p:V3;turn:number};coins?:V3[]}
export function Cafe({door,bell,meal,box,fork,slice,coins}:CafeProps){
 const t=useTextures();
 const M=useMemo(()=>({
  streetA:new THREE.MeshBasicMaterial({map:t.streetA,color:new THREE.Color(1.5,1.43,1.3)}),
  streetB:new THREE.MeshBasicMaterial({map:t.streetB,color:new THREE.Color(1.5,1.43,1.3)}),
  glass:new THREE.MeshBasicMaterial({color:'#cfd8d6',transparent:true,opacity:.09,depthWrite:false,side:THREE.DoubleSide}),
  linen:new THREE.MeshBasicMaterial({color:'#e9dfcf',transparent:true,opacity:.36,depthWrite:false,side:THREE.DoubleSide}),
  lamp:new THREE.MeshBasicMaterial({color:new THREE.Color(1.7,1.3,.85)}),
  caseLight:new THREE.MeshBasicMaterial({color:new THREE.Color(1.15,.95,.7)}),
    menu:twoTone(new THREE.MeshLambertMaterial({map:t.menu})),sign:twoTone(new THREE.MeshLambertMaterial({map:t.sign})),
  board:twoTone(new THREE.MeshLambertMaterial({map:t.board})),hang:twoTone(new THREE.MeshLambertMaterial({map:t.hang})),
  shopA:twoTone(new THREE.MeshLambertMaterial({map:t.shopA})),shopB:twoTone(new THREE.MeshLambertMaterial({map:t.shopB})),
  reflect:new THREE.MeshBasicMaterial({map:t.reflect}),
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
  <mesh position={[2.85,2.3,-3.11]} material={M.menu} receiveShadow><planeGeometry args={[.64,.8]}/></mesh>
  {[2.515,3.185].map(x=><Box key={x} p={[x,2.3,-3.1]} s={[.04,.86,.05]} c="#4a352c"/>)}
  {[[3.0,2.05,.4,.3]].map(([x,y,w,h],i)=><group key={i}><Box p={[x,y,-3.11]} s={[w,h,.04]} c="#55403a"/><Box p={[x,y,-3.085]} s={[w-.08,h-.08,.02]} c={i?'#a99f8e':'#8f9a94'}/></group>)}
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
  {[.3,.73,1.16,1.6].map(x=><Box key={x} p={[x,.66,-3]} s={[.41,.4,.12]} c="#6d4a40"/>)}
  <Box p={[T.x,T.top-.025,-.98]} s={[1.14,.05,2.1]} c="#7a5844"/><Box p={[T.x,T.top-.07,-.98]} s={[1.1,.04,2.06]} c="#5d4234"/>
  {[[-.5,-1.95],[.5,-1.95],[-.5,.05],[.5,.05]].map(([x,z],i)=><Box key={i} p={[T.x+x,.35,z]} s={[.06,.7,.06]} c="#4a352c"/>)}
  {meal&&<group>
   {/* The wall of her evidence. Its top sits just under her eyes from his first camera. */}
   <Stack p={[.8,T.top,-1.73]} n={7} cake i={4}/><Stack p={[.97,T.top,-1.71]} n={6} cake i={1}/>
   <Stack p={[1.13,T.top,-1.78]} n={6}/>
   <Stack p={[1.08,T.top,-1.5]} n={4} cake i={4}/><Stack p={[.78,T.top,-1.38]} n={3}/><Stack p={[.93,T.top,-1.3]} n={2} cake i={1}/>
   
   <Cyl p={[1.2,T.top+.05,-1.3]} r={.045} h={.1} c="#b7aea2"/>
  </group>}
  {/* Things that live on the table whatever the hour */}
  <Cyl p={[.34,T.top+.004,-1.93]} r={.065} h={.008} c="#d8d1c3"/><Cyl p={[.34,T.top+.034,-1.93]} r={.037} h={.052} c="#e4ded2"/>
  <Cyl p={[1.27,T.top+.03,-1.95]} r={.034} h={.06} c="#8c8a84"/><Ball p={[1.27,T.top+.07,-1.95]} s={[.02,.014,.02]} c="#6a625a"/>
  <Box p={[.33,T.top+.04,-1.55]} s={[.08,.08,.025]} c="#a3a4a1"/><Box p={[.33,T.top+.052,-1.56]} s={[.06,.06,.012]} c="#ede7db"/>
  <Box p={[1.26,T.top+.06,-1.52]} s={[.1,.12,.012]} c="#3a3b37" r={[-.25,0,0]}/>
  <Cyl p={[.38,T.top+.025,-1.74]} r={.014} h={.05} c="#d6d3cb"/><Cyl p={[.42,T.top+.025,-1.74]} r={.014} h={.05} c="#58524a"/>
  <Cyl p={[1.2,T.top+.004,-.35]} r={.07} h={.008} c="#d8d1c3"/><Cyl p={[1.2,T.top+.034,-.35]} r={.04} h={.052} c="#e4ded2"/>
  <Box p={[.42,T.top+.006,-.3]} s={[.2,.012,.14]} c="#ede7db" r={[0,.25,0]}/><Box p={[.46,T.top+.016,-.78]} s={[.02,.01,.19]} c="#9ea3a6"/><Box p={[.5,T.top+.016,-.78]} s={[.02,.01,.17]} c="#9ea3a6"/>
  {!meal&&<group><Cyl p={[1.16,T.top+.08,-1.8]} r={.035} h={.16} c="#8d857a"/><Ball p={[1.16,T.top+.2,-1.8]} s={[.06,.05,.06]} c="#b9a39a"/></group>}
  {box&&<group><Box p={[T.x-.12,T.top+.07,-1.5]} s={[.3,.14,.22]} c="#c9b79e"/><Box p={[T.x-.12,T.top+.145,-1.5]} s={[.012,.008,.22]} c="#8b5b50"/></group>}
  {fork&&<Fork p={fork.p} r={fork.r}/>}
  {slice&&<group position={slice.p} rotation-y={slice.turn}>
   <Box p={[0,.026,0]} s={[.2,.052,.125]} c="#d8c6a6"/><Box p={[0,.056,0]} s={[.206,.012,.131]} c="#e6d6ba"/>
   <mesh position={[0,.0625,0]} rotation-x={-Math.PI/2} material={mat('#ece3d0')} onUpdate={noInk}><planeGeometry args={[.13,.08]}/></mesh>
   <Slice p={[0,.063,0]} i={2} turn={.3} s={.75}/>
   <Box p={[0,.0635,0]} s={[.008,.003,.131]} c="#8b5b50"/>
  </group>}
  {(coins??[]).map((c,i)=><Cyl key={i} p={c} r={.032} h={.006} c={i%2?'#9b9a97':'#a58b55'}/>)}

  {/* A second table, so the room continues past the frame */}
  <Cyl p={[2.35,.72,.9]} r={.36} h={.04} c="#7a5844"/><Cyl p={[2.35,.36,.9]} r={.035} h={.7} c="#4a352c"/>
  <Chair p={[2.35,0,1.4]} turn={Math.PI}/><Chair p={[2.35,0,.4]}/><Cyl p={[2.3,.78,.86]} r={.04} h={.08} c="#b7aea2"/>
  <Plant p={[2.75,0,-2.7]} seed={7} h={1.25}/><Plant p={[-2.75,0,2.7]} seed={13} h={.9}/><Plant p={[-.35,0,-2.85]} seed={19} h={.55}/>

  {[[-1.5,-1.3],[1,-1.3]].map(([x,z])=><group key={x}>
   <Cyl p={[x,2.98,z]} r={.008} h={.64} c="#3f3430"/>
   <mesh position={[x,2.64,z]} material={mat('#75624a')}><coneGeometry args={[.15,.14,20]}/></mesh>
   <mesh geometry={G.ball} material={M.lamp} position={[x,2.57,z]} scale={.05} onUpdate={noInk}/>
  </group>)}

  {/* The mirror: walnut frame, bevelled edge, cool dark glass */}
  <group>
   <mesh position={[MIRROR.x,MIRROR.y,MIRROR.z]} material={M.reflect} onUpdate={noInk}><planeGeometry args={[MIRROR.w,MIRROR.h]}/></mesh>
   {[-1,1].map(q=><Box key={'bt'+q} p={[MIRROR.x,MIRROR.y+q*(MIRROR.h/2-.025),MIRROR.z+.006]} s={[MIRROR.w,.05,.012]} c="#c4d2d4" cast={false}/>)}
   {[-1,1].map(q=><Box key={'bs'+q} p={[MIRROR.x+q*(MIRROR.w/2-.025),MIRROR.y,MIRROR.z+.006]} s={[.05,MIRROR.h,.012]} c="#b6c6c8" cast={false}/>)}
   {[-1,1].map(q=><Box key={'be'+q} p={[MIRROR.x,MIRROR.y+q*(MIRROR.h/2-.052),MIRROR.z+.012]} s={[MIRROR.w-.1,.006,.008]} c="#f1f6f4" cast={false}/>)}
   {[-1,1].map(q=><Box key={'bf'+q} p={[MIRROR.x+q*(MIRROR.w/2-.052),MIRROR.y,MIRROR.z+.012]} s={[.006,MIRROR.h-.1,.008]} c="#f1f6f4" cast={false}/>)}
   {[-1,1].map(q=><Box key={'ft'+q} p={[MIRROR.x,MIRROR.y+q*(MIRROR.h/2+.045),MIRROR.z+.006]} s={[MIRROR.w+.18,.09,.05]} c="#4a3224"/>)}
   {[-1,1].map(q=><Box key={'fs'+q} p={[MIRROR.x+q*(MIRROR.w/2+.045),MIRROR.y,MIRROR.z+.006]} s={[.09,MIRROR.h,.05]} c="#4a3224"/>)}
   {[-1,1].map(q=><Box key={'it'+q} p={[MIRROR.x,MIRROR.y+q*(MIRROR.h/2+.004),MIRROR.z+.034]} s={[MIRROR.w+.02,.022,.012]} c="#7b5a42"/>)}
   {[-1,1].map(q=><Box key={'is'+q} p={[MIRROR.x+q*(MIRROR.w/2+.004),MIRROR.y,MIRROR.z+.034]} s={[.022,MIRROR.h,.012]} c="#7b5a42"/>)}
   {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b],i)=><Ball key={'rs'+i} p={[MIRROR.x+a*(MIRROR.w/2+.045),MIRROR.y+b*(MIRROR.h/2+.045),MIRROR.z+.04]} s={[.032,.032,.012]} c="#6a4a36"/>)}
  </group>
  {/* A wall clock, a small shelf of jars and a bud vase */}
  <Cyl p={[1.95,2.0,-3.07]} r={.12} h={.04} c="#e6dfd0" rot={[Math.PI/2,0,0]}/><Box p={[1.95,2.03,-3.045]} s={[.012,.08,.01]} c="#2c2623"/><Box p={[1.98,2.0,-3.045]} s={[.06,.012,.01]} c="#2c2623"/>
  <Cyl p={[.5,T.top+.06,-1.3]} r={.025} h={.12} c="#8fa097"/><Ball p={[.5,T.top+.15,-1.3]} s={[.05,.05,.05]} c="#9a5d58"/><Ball p={[.53,T.top+.17,-1.3]} s={[.04,.04,.04]} c="#c4a65e"/>
  <Box p={[1.8,1.3,-3.09]} s={[.22,.28,.04]} c="#55403a"/><Box p={[1.8,1.3,-3.065]} s={[.16,.22,.02]} c="#a99f8e"/>
    {/* table top, near the lens */}
  <Cyl p={[.5,T.top+.006,-.85]} r={.1} h={.012} c="#e2dccf"/><Box p={[.52,T.top+.02,-.85]} s={[.1,.02,.1]} c="#a9906c"/>
  <Cyl p={[1.13,T.top+.004,-.72]} r={.085} h={.008} c="#d8d1c3"/><Cyl p={[1.13,T.top+.034,-.72]} r={.045} h={.056} c="#e8e2d6"/>
  <Cyl p={[1.05,T.top+.006,-1.05]} r={.09} h={.012} c="#e2dccf"/><Box p={[1.0,T.top+.016,-1.05]} s={[.02,.008,.14]} c="#9ea3a6" r={[0,.5,0]}/>
  <Box p={[1.78,1.8,-3.09]} s={[.24,.32,.04]} c="#4a3224"/><Box p={[1.78,1.8,-3.065]} s={[.18,.26,.02]} c="#b4a88f"/>
  <Box p={[1.72,1.55,-3.02]} s={[.3,.03,.12]} c="#5a4234"/><Cyl p={[1.66,1.6,-3.02]} r={.03} h={.07} c="#e0dacd"/><Cyl p={[1.78,1.6,-3.02]} r={.03} h={.07} c="#a9a79a"/>
  <Cyl p={[1.16,T.top+.06,-1.72]} r={.06} h={.12} c="#a4a8a4"/><Ball p={[1.16,T.top+.14,-1.72]} s={[.04,.03,.04]} c="#7a7a76"/><Box p={[1.2,T.top+.1,-1.72]} s={[.1,.02,.02]} c="#a4a8a4"/>
  <Cyl p={[.27,T.top+.05,-1.82]} r={.04} h={.1} c="#9a8a6a"/><Box p={[.27,T.top+.012,-1.62]} s={[.14,.024,.1]} c="#b3b0a4"/>
  {/* Wall sconce, a coat hook rail and a calendar board near the booth */}
  <group>
   <Box p={[1.9,1.6,-3.08]} s={[.05,.2,.03]} c="#4a352c"/><Cyl p={[1.9,1.49,-3.0]} r={.01} h={.14} c="#3f3430" rot={[Math.PI/2,0,0]}/>
   <mesh position={[1.9,1.66,-2.94]} material={mat('#75624a')}><coneGeometry args={[.07,.11,14]}/></mesh>
   <mesh geometry={G.ball} material={M.lamp} position={[1.9,1.6,-2.94]} scale={.04} onUpdate={noInk}/>
   <Box p={[2.7,1.62,-3.08]} s={[.7,.04,.04]} c="#5a4234"/>
   {[2.45,2.7,2.95].map(x=><Cyl key={x} p={[x,1.58,-3.0]} r={.012} h={.07} c="#7d684c" rot={[Math.PI/2,0,0]}/>)}
   <Box p={[2.7,1.22,-3.0]} s={[.2,.7,.05]} c="#5f6d6a"/><Box p={[2.96,1.3,-3.0]} s={[.14,.5,.05]} c="#8d857a"/>
  </group>
  <Cyl p={[1.62,.14,-1.85]} r={.12} h={.28} c="#9a8460"/><Cyl p={[1.62,.285,-1.85]} r={.13} h={.02} c="#7c6a4c"/><Box p={[1.62,.34,-1.85]} s={[.12,.1,.02]} c="#c9bfa8" r={[.3,.4,0]}/>
  <Cyl p={[1.84,.3,-2.4]} r={.055} h={.6} c="#4f5650"/><Cyl p={[1.84,.64,-2.4]} r={.01} h={.14} c="#2f2a28"/>
  {/* a worn rug under the table, her bag and a pair of shoes under the bench */}
  <Box p={[.8,.004,-1.7]} s={[2.1,.008,1.5]} c="#6e5a52" cast={false}/><Box p={[.8,.0095,-1.7]} s={[1.9,.004,1.3]} c="#80675a" cast={false}/><Box p={[.8,.0115,-1.7]} s={[1.5,.003,.9]} c="#5f4d4a" cast={false}/>
  <Box p={[.3,.12,-1.2]} s={[.34,.24,.12]} c="#75523f"/><Box p={[.3,.26,-1.2]} s={[.3,.04,.1]} c="#8a6350"/>
  <Box p={[1.1,.03,-1.1]} s={[.09,.055,.22]} c="#5a4640"/><Box p={[1.24,.03,-1.12]} s={[.09,.055,.22]} c="#5a4640" r={[0,.2,0]}/>

  {/* Street dressing: neighbours, awnings, bikes, signs. All lettering is invented. */}
  <group>
   <mesh position={[0,3.5,-9]} material={M.streetB} onUpdate={noInk}><planeGeometry args={[34,14]}/></mesh>
   <Box p={[0,6,-5.2]} s={[30,12,.4]} map={t.plaster} c="#a99f90" cast={false}/>
   {[0,1,2,3].map(r=>[-10,-7,-4,-1,2,5,8,11].map(k=><group key={r+'b'+k}><Box p={[k,3.4+r*2.1,-4.95]} s={[1,1.3,.06]} c="#4a5254" cast={false}/><Box p={[k,2.7+r*2.1,-4.9]} s={[1.25,.07,.14]} c="#5a4a3c" cast={false}/></group>))}
   <Box p={[-4.2,5.2,3.3]} s={[2.2,.35,.1]} c="#34413d"/>
   <group position={[3.4,0,7.4]}><Cyl p={[0,.35,0]} r={.34} h={.7} c="#7a6a56"/><Cyl p={[0,.74,0]} r={.38} h={.04} c="#5d5042"/><Box p={[.2,.82,-.1]} s={[.1,.14,.1]} c="#a8a79f"/></group>
   <group position={[-3.0,0,7.8]}><Box p={[0,.28,0]} s={[.5,.56,.3]} c="#6f4f3f"/><Box p={[0,.62,0]} s={[.54,.1,.34]} c="#8b6a52"/></group>
   <Cyl p={[2.6,1.1,6.9]} r={.03} h={2.2} c="#3a3f41"/><Box p={[2.6,2.0,6.9]} s={[.5,.3,.04]} c="#3b4540"/>
   <Cyl p={[-3.4,.3,6.5]} r={.2} h={.6} c="#6b5a4a"/><Plant p={[-3.4,.4,6.5]} seed={43} h={.55}/>
   {[.15,1.85].map(x=><Cyl key={"bl"+x} p={[x,.36,5.6]} r={.07} h={.72} c="#4d5551"/>)}
   <group position={[1.95,0,5.2]} rotation-y={1.2}>{[-.42,.42].map(dx=><mesh key={dx} position={[dx,.33,0]} material={mat("#2c2b2a")} castShadow><torusGeometry args={[.33,.018,6,22]}/></mesh>)}<Box p={[0,.5,0]} s={[.84,.025,.025]} c="#8b6a50"/><Box p={[-.12,.42,0]} s={[.025,.34,.025]} c="#8b6a50" r={[0,0,.35]}/><Box p={[.4,.82,0]} s={[.04,.03,.4]} c="#2c2b2a"/></group>
   <Box p={[-.35,.3,5.4]} s={[.7,.6,.4]} c="#6f5a47"/><Box p={[-.35,.64,5.4]} s={[.74,.08,.44]} c="#8b6a52"/>
   {/* flower stand, mailbox, street sign, milk crates, scooter */}
   <group position={[2.15,0,4.7]}><Box p={[0,.3,0]} s={[.6,.04,.35]} c="#5a4234"/><Box p={[0,.6,0]} s={[.5,.04,.3]} c="#5a4234"/>{[-.2,.2].map(x=><Box key={x} p={[x,.3,-.15]} s={[.03,.6,.03]} c="#4a352c"/>)}{[-.18,0,.18].map((x,i)=><Cyl key={x} p={[x,.68,0]} r={.07} h={.12} c={["#8d6e55","#7d8878","#a08a70"][i]}/>)}<Plant p={[-.15,.34,0]} seed={61} h={.3}/></group>
   <group position={[-.65,0,4.8]}><Cyl p={[0,.55,0]} r={.04} h={1.1} c="#34383a"/><Box p={[0,1.15,0]} s={[.34,.3,.22]} c="#7a5a50"/><Box p={[0,1.31,0]} s={[.36,.04,.24]} c="#5d4238"/></group>
   <Cyl p={[2.4,1.0,6.0]} r={.03} h={2.0} c="#3a3f41"/><Box p={[2.4,1.9,6.0]} s={[.55,.22,.03]} c="#3b4a52"/><mesh position={[2.4,1.9,6.02]}><planeGeometry args={[.5,.18]}/><meshBasicMaterial map={t.hang}/></mesh>
   {[0,1,2].map(i=><Box key={'mc'+i} p={[-.9+i*.02,.15+i*.3,5.6]} s={[.4,.28,.3]} c={["#8a6a52","#6d5a48","#7d6650"][i]}/>)}
   <group position={[1.7,0,5.9]} rotation-y={-.6}><Box p={[0,.35,0]} s={[.9,.12,.2]} c="#6a7a76"/><Box p={[.35,.7,0]} s={[.04,.55,.3]} c="#3a3f41"/>{[-.38,.38].map(x=><mesh key={x} position={[x,.2,0]} material={mat("#2c2b2a")}><torusGeometry args={[.19,.04,6,16]}/></mesh>)}</group>
   {/* things on the shop front: lantern, hanging basket, notice board, drainpipe */}
   <Box p={[.12,2.1,3.36]} s={[.05,.2,.05]} c="#3f3430"/><Box p={[.12,2.28,3.42]} s={[.16,.02,.16]} c="#3f3430"/><mesh geometry={G.ball} material={M.lamp} position={[.12,2.1,3.44]} scale={.07} onUpdate={noInk}/>
   <Box p={[1.95,2.4,3.5]} s={[.03,.03,.3]} c="#3f3430"/><Cyl p={[1.95,2.22,3.62]} r={.13} h={.1} c="#8d6e55"/><Plant p={[1.95,2.12,3.62]} seed={71} h={.25}/>
   <Box p={[.55,1.0,3.36]} s={[.34,.46,.03]} c="#4a352c"/><Box p={[.55,1.0,3.38]} s={[.28,.4,.02]} c="#c9bfa8"/>
   <Cyl p={[2.75,1.6,3.38]} r={.04} h={3.2} c="#4f5650"/>
   <Plant p={[.05,0,4.9]} seed={83} h={.5}/><Plant p={[1.95,0,4.95]} seed={89} h={.45}/>
   <Cyl p={[1.55,.09,4.5]} r={.11} h={.18} c="#8a6a52"/><Cyl p={[1.55,.2,4.5]} r={.12} h={.02} c="#6d5442"/>
   <Box p={[.3,.1,4.35]} s={[.3,.2,.2]} c="#7a6a56"/>
   {/* shop-front dressing for the close street frame: window box, milk churn, bunting, small sign, bucket */}
   <Box p={[1.1,.72,3.48]} s={[.95,.16,.2]} c="#5a4234"/>{[-.35,-.17,0,.17,.35].map((x,i)=><Ball key={'wb'+i} p={[1.1+x,.84+(i%2)*.03,3.48]} s={[.09,.07,.09]} c={['#9a5d58','#c4a65e','#7d8878','#a8827a','#8f6d54'][i]}/>)}
   <Cyl p={[1.78,.32,4.55]} r={.15} h={.64} c="#9a9d9c"/><Cyl p={[1.78,.66,4.55]} r={.1} h={.06} c="#7d8081"/>
   {Array.from({length:9},(_,i)=><Box key={'bu'+i} p={[-.2+i*.34,2.35-Math.sin(i/8*Math.PI)*.14,3.5]} s={[.13,.17,.01]} c={['#8b6a52','#6f7d72','#a89a80','#7a5d58'][i%4]} r={[0,0,(i%2?.1:-.1)]}/>)}
   <mesh position={[1.95,1.2,3.4]}><planeGeometry args={[.3,.14]}/><meshBasicMaterial map={t.hang}/></mesh>
   <Cyl p={[-.1,.12,4.55]} r={.1} h={.24} c="#5d6a70"/><Box p={[-.06,.34,4.55]} s={[.02,.3,.02]} c="#8d6e55" r={[0,0,.2]}/>
   {/* more of the shop front for the 2B medium shot: two hanging baskets, a second board, a bike by the wall */}
   {[.55,1.45].map(x=><group key={'hb'+x}><Box p={[x,2.45,3.5]} s={[.03,.03,.3]} c="#3f3430"/><Cyl p={[x,2.26,3.62]} r={.12} h={.1} c="#8d6e55"/><Plant p={[x,2.17,3.62]} seed={Math.round(x*100)} h={.22}/></group>)}
   <group position={[.35,0,4.05]} rotation-y={.3}><mesh position={[0,.42,0]} rotation-x={-.12} material={M.board}><planeGeometry args={[.46,.6]}/></mesh><Box p={[-.25,.3,-.1]} s={[.03,.6,.03]} c="#4a352c" r={[.18,0,0]}/><Box p={[.25,.3,-.1]} s={[.03,.6,.03]} c="#4a352c" r={[.18,0,0]}/></group>
   <group position={[1.6,0,3.9]} rotation-y={.2}>{[-.42,.42].map(dx=><mesh key={dx} position={[dx,.33,0]} material={mat("#2c2b2a")} castShadow><torusGeometry args={[.33,.018,6,22]}/></mesh>)}<Box p={[0,.5,0]} s={[.84,.025,.025]} c="#6a7a76"/><Box p={[-.12,.42,0]} s={[.025,.34,.025]} c="#6a7a76" r={[0,0,.35]}/><Box p={[.4,.82,0]} s={[.04,.03,.4]} c="#2c2b2a"/></group>
   <Cyl p={[4.2,.36,6.2]} r={.3} h={.04} c="#7a5844"/><Cyl p={[4.2,.18,6.2]} r={.03} h={.36} c="#3a3f41"/>{[-.4,.4].map(d=><Box key={d} p={[4.2+d,.2,6.2]} s={[.3,.4,.3]} c="#58402f"/>)}
   {([[-6.1,4.7,'#a79b8b'],[6.1,5.3,'#a3a095']] as [number,number,string][]).map(([x,h,c],i)=><group key={i}>
    <Box p={[x,h/2,3.2]} s={[5.8,h,.3]} map={t.plaster} c={c}/>
    {[0,1,2].map(r=>[-1.7,0,1.7].map(k=><group key={r+'-'+k}><Box p={[x+k,1.9+r*1.3,3.38]} s={[.62,.9,.06]} c="#454b4c"/><Box p={[x+k,1.45+r*1.3,3.44]} s={[.78,.05,.1]} c="#4f3b30"/></group>))}
    <Box p={[x,.95,3.38]} s={[1.5,1.9,.06]} c="#3c4642"/>
    <mesh position={[x+(i?-.1:.1),2.25,3.44]} material={i?M.shopB:M.shopA}><planeGeometry args={[1.9,.5]}/></mesh>
   </group>)}
   {/* awning over the cafe window and one on each neighbour */}
   {([[1.4,2.65,2.6,'#6d7a62','#d8d0bf'],[-6.1,2.45,3.4,'#7a5d58','#d9cdbc'],[6.1,2.45,3.4,'#5e6f72','#d8d3c4']] as [number,number,number,string,string][]).map(([x,y,w,a,b],i)=><group key={'aw'+i} position={[x,y,3.62]} rotation-x={.32}>
    {Array.from({length:Math.round(w/.2)},(_,k)=><Box key={k} p={[-w/2+.1+k*.2,0,0]} s={[.2,.03,.9]} c={k%2?a:b}/>)}
    <Box p={[0,-.04,.46]} s={[w,.08,.015]} c={a}/>
   </group>)}
   {/* sign boards and hanging sign */}
   <group position={[2.05,0,4.3]} rotation-y={-.25}><mesh position={[0,.45,0]} rotation-x={-.12} material={M.board}><planeGeometry args={[.5,.64]}/></mesh><Box p={[-.27,.32,-.1]} s={[.03,.64,.03]} c="#4a352c" r={[.18,0,0]}/><Box p={[.27,.32,-.1]} s={[.03,.64,.03]} c="#4a352c" r={[.18,0,0]}/></group>
   <group position={[-1.2,2.6,3.7]}><Box p={[0,.15,-.2]} s={[.03,.03,.5]} c="#3f3430"/><mesh position={[0,0,.08]} material={M.hang}><planeGeometry args={[.5,.2]}/></mesh><mesh position={[0,0,.082]} rotation-y={Math.PI} material={M.hang}><planeGeometry args={[.5,.2]}/></mesh></group>
   {/* bikes against the neighbour wall */}
   {([[-.7,3.95,.35],[-1.15,3.9,.1]] as [number,number,number][]).map(([x,z,r],i)=><group key={'bk'+i} position={[x,0,z]} rotation-y={r}>
    {[-.42,.42].map(dx=><mesh key={dx} position={[dx,.33,0]} material={mat('#2c2b2a')} castShadow><torusGeometry args={[.33,.018,6,22]}/></mesh>)}
    <Box p={[0,.5,0]} s={[.84,.025,.025]} c={i?'#6a7a76':'#8b6a50'}/><Box p={[-.12,.42,0]} s={[.025,.34,.025]} c={i?'#6a7a76':'#8b6a50'} r={[0,0,.35]}/>
    <Box p={[-.38,.78,0]} s={[.2,.03,.04]} c="#2c2b2a"/><Box p={[.4,.82,0]} s={[.04,.03,.4]} c="#2c2b2a"/><Box p={[.4,.62,0]} s={[.025,.42,.025]} c="#4a4a48"/>
   </group>)}
   {/* lamp post, bench, bin, bollards */}
   <Cyl p={[2.6,1.3,5.6]} r={.04} h={2.6} c="#34383a"/><mesh position={[2.6,2.72,5.6]} material={mat('#8a7a58')}><coneGeometry args={[.2,.2,10]}/></mesh><mesh geometry={G.ball} material={M.lamp} position={[2.6,2.55,5.6]} scale={.09} onUpdate={noInk}/>
   <Box p={[-.4,.45,5.3]} s={[1.4,.05,.45]} c="#6b563f"/><Box p={[-.4,.75,5.1]} s={[1.4,.4,.04]} c="#6b563f"/>{[-1.0,1.0].map(d=><Box key={d} p={[-.4+d*.6,.22,5.3]} s={[.05,.44,.4]} c="#34383a"/>)}
   <Cyl p={[2.4,.38,4.1]} r={.2} h={.76} c="#4a5250"/><Cyl p={[2.4,.78,4.1]} r={.22} h={.04} c="#363d3b"/>
   {[-.3,2.0].map(x=><Cyl key={x} p={[x,.36,6.4]} r={.07} h={.72} c="#4d5551"/>)}
   <Plant p={[-3.05,0,3.75]} seed={31} h={.5}/><Plant p={[3.1,0,4.2]} seed={37} h={.6}/>
  </group>

  {/* Street face of the shop */}
  <mesh position={[1.4,2.86,3.3]} material={M.sign} receiveShadow><planeGeometry args={[2.3,.45]}/></mesh>
  <Plant p={[-2.15,0,3.65]} seed={23} h={.6}/><Plant p={[2.95,0,3.7]} seed={29} h={.7}/><Plant p={[.2,0,3.7]} seed={47} h={.55}/><Plant p={[2.5,0,3.75]} seed={53} h={.5}/>
  <Box p={[1.4,.62,3.3]} s={[2.7,.1,.1]} c="#4a352c"/>
 </group>;
}
