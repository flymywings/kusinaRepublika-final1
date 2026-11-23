import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {planksHD} from '../upstream/templates/bridge/paint';
import {NOINK} from './ink';

const length = 1.54;
const sections = 40;
function section(x: number, v: number, inner: boolean) {
  const end = Math.pow(Math.abs(x),3);
  const flare = .055+.40*Math.pow(Math.max(0,1-x*x),.72);
  const y = -.325+.58*end;
  return new THREE.Vector3(length*x, y+(.48-.19*end)*Math.abs(v)**1.5+(inner ? .065*(1-Math.abs(v)) : 0),
    flare*v*(inner ? .87 : 1));
}

function shell(inner: boolean) {
  const points: number[] = [], uv: number[] = [], indices: number[] = [];
  const sides = 16;
  for(let i=0;i<=sections;i++) for(let j=0;j<=sides;j++){
    const p=section(i/sections*2-1,j/sides*2-1,inner);
    points.push(p.x,p.y,p.z);
    uv.push(i/sections,j/sides);
    if(i===sections || j===sides) continue;
    const a=i*(sides+1)+j, b=a+sides+1;
    indices.push(a,b,a+1,a+1,b,b+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function strip(points: THREE.Vector3[], radius: number) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,radius,7,false);
}
const longitudinal = (v:number, inner:boolean) => Array.from({length:sections+1},(_,i)=>section(i/sections*2-1,v,inner));

export function Bangka({height, grounded, frame, seaLevel, contactFoam=true}: {
  height:number; grounded:number; frame:number; seaLevel:number; contactFoam?:boolean;
}) {
  const parts=useMemo(()=>{
    const outer=shell(false), inner=shell(true);
    const rim=[-1,1].map(side=>strip(longitudinal(side,false),.037));
    const paint=[-.83,.83].map(side=>strip(longitudinal(side,false),.017));
    const ribs=[-.64,-.37,0,.37,.64].map(x=>strip(Array.from({length:17},(_,i)=>{
      const p=section(x,i/8-1,true); p.y+=.026; return p;
    }),.023));
    const foam = [-1,1].flatMap(side=>[0,1,2,3].map(offset=>strip(Array.from({length:11},(_,i)=>{
      const x = i/10*(offset%2===0 ? 1.15 : .75)+(offset%2===0 ? -1.37 : .43);
      return new THREE.Vector3(x,0,side*(offset<2 ? .44+.10*Math.cos(x*2) : .86+.075*Math.sin(x*2.8)));
    }),.012)));
    return {outer,inner,rim,paint,ribs,foam};
  },[]);
  useEffect(()=>()=>[parts.outer,parts.inner,...parts.rim,...parts.paint,...parts.ribs,...parts.foam].forEach(g=>g.dispose()),[parts]);
  const bob = (1-grounded)*Math.sin(frame*.13);
  return <group position={[-.55,0,4.75]} rotation-y={-.56}>
    <group position-y={height+.035*bob} rotation-z={.04*bob-.07*grounded}>
      <mesh castShadow geometry={parts.outer}><meshStandardMaterial side={THREE.DoubleSide} color="#c56444" emissive="#602816" emissiveIntensity={.34} map={planksHD()}/></mesh>
      <mesh geometry={parts.inner}><meshStandardMaterial side={THREE.DoubleSide} color="#e1b579" emissive="#6d471f" emissiveIntensity={.32} map={planksHD()}/></mesh>
      {parts.rim.map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial color="#5c3020"/></mesh>)}
      {parts.paint.map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial color="#e6bc66"/></mesh>)}
      {parts.ribs.map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial color="#805839"/></mesh>)}
      {[-.69,.63].map(x=><group key={x} position={[x,.09,0]}>
        <mesh castShadow><boxGeometry args={[.16,.068,1.74]}/><meshStandardMaterial color="#d3a664" map={planksHD()}/></mesh>
        {[-.83,.83].map(z=><mesh key={z} position={[0,-.133,z]} rotation-x={z>0 ? -.13 : .13} castShadow>
          <cylinderGeometry args={[.033,.046,.274,8]}/>
          <meshStandardMaterial color="#ab7947" map={planksHD()}/>
        </mesh>)}
        {[-.8,-.37,.37,.8].flatMap(z=>[-.045,0,.045].map(offset=>
          <mesh key={z+','+offset} position={[x*.01+offset,0,z]} rotation-y={Math.PI/2}>
            <torusGeometry args={[.083,.009,6,15]}/><meshStandardMaterial color="#7c542c"/>
          </mesh>))}
      </group>)}
      <mesh position={[.03,.025,0]}><boxGeometry args={[.31,.048,.68]}/><meshStandardMaterial color="#ceab78" map={planksHD()}/></mesh>
      {[-.83,.83].map(z=><mesh key={z} position={[0,-.185,z]} rotation-z={Math.PI/2} castShadow>
        <capsuleGeometry args={[.061,2.19,5,12]}/><meshStandardMaterial color="#d4ac68" map={planksHD()}/>
      </mesh>)}
    </group>
    {contactFoam && grounded<.98 && parts.foam.map((g,i)=><mesh key={i} geometry={g}
      position={[Math.sin(frame*.08+i)*.05,seaLevel+.036+i*.001,0]} renderOrder={4} onUpdate={mesh=>mesh.layers.set(NOINK)}>
      <meshBasicMaterial color="#dbfaf0" transparent opacity={(1-grounded)*(.54+.21*Math.sin(frame*.12+i))} depthWrite={false}/>
    </mesh>)}
  </group>;
}



