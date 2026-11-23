import React,{useMemo} from 'react';
import * as THREE from 'three';
import {solid,painted} from './paint';
import {twoTone} from '../upstream/templates/bridge/shade';
const gemMats = new Map<string,THREE.Material>();
function gemMaterial(kind:string){
  if(!gemMats.has(kind))gemMats.set(kind,twoTone(new THREE.MeshPhongMaterial({vertexColors:true,shininess:65,specular:kind==='ruby'?'#d894a3':'#efffff',flatShading:true})));
  return gemMats.get(kind)!;
}
/** Uncut, angular stones. Size is a fixed radius; origin is the centre. */
export function Gem({kind='diamond',size=.09}:{kind?:'diamond'|'ruby';size?:number}) {
 const geometry=useMemo(()=>{const geo=new THREE.IcosahedronGeometry(1,0);const colors:number[]=[];const palette=kind==='ruby'?['#ac354c','#e66373','#8e2946','#cd425b','#f18d95']:['#bad6d9','#eef8e5','#8faeb8','#cee7e2','#f8fff2'];for(let i=0;i<geo.attributes.position.count;i++){const c=new THREE.Color(palette[Math.floor(i/3)%palette.length]);colors.push(c.r,c.g,c.b);}geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return geo;},[kind]);
 return <group scale={size}><mesh geometry={geometry} material={gemMaterial(kind)} castShadow receiveShadow rotation={[.18,.28,.11]}/><mesh position={[-.23,.57,.42]} rotation={[.12,.2,-.25]}><planeGeometry args={[.24,.10]}/><meshBasicMaterial color={kind==='ruby'?'#ffd6d8':'#ffffff'} side={THREE.DoubleSide}/></mesh></group>;
}
/** Base is y=0; tie y=.43; top y=.57, all multiplied by size. */
export function MoneyBag({size=1}:{size?:number}) {
 return <group scale={size}><mesh position={[0,.23,0]} scale={[.22,.25,.18]} material={solid('#b79865')} castShadow receiveShadow><sphereGeometry args={[1,12,9]}/></mesh><mesh position={[0,.445,0]} material={solid('#c4a674')}><cylinderGeometry args={[.092,.07,.14,9]}/></mesh><mesh position={[0,.53,0]} material={solid('#d1b581')}><cylinderGeometry args={[.12,.065,.1,9]}/></mesh><mesh position={[0,.44,0]} rotation={[Math.PI/2,0,0]} material={solid('#645043')}><torusGeometry args={[.078,.018,5,12]}/></mesh>{[-1,1].map(s=><mesh key={s} position={[s*.075,.43,.067]} rotation={[.4,0,s*.6]} material={solid('#67513e')}><cylinderGeometry args={[.009,.009,.15,5]}/></mesh>)}<mesh position={[0,.235,.174]} rotation={[0,0,.08]} material={painted('diamond-bag-seam','#806948')}><boxGeometry args={[.009,.27,.008]}/></mesh></group>;
}
