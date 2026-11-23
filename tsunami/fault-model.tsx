import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';

const depth = 2.1;
const bottom = -2.6;
const floor = -.95;
const strata = ['#965f49','#c28455','#e5ac6c','#b8784a'];

function Rock({right, lift}: {right: boolean; lift: number}) {
  const height = (floor-bottom)/strata.length;
  return <group position={[right ? 1.86 : -1.86,right ? lift : 0,0]}>
    {strata.map((color,index) =>
      <mesh key={color} position={[0,bottom+(index+.5)*height,0]}>
        <boxGeometry args={[3.72,height,depth]}/>
        <meshStandardMaterial color={color} roughness={1}/>
      </mesh>)}
  </group>;
}

export function FaultModel({lift, disturbance}: {lift: number; disturbance: number}) {
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const positions = [];
  const indices = [];
  const width = 3.72;
  const count = 60;
  for (let i=0; i<=count; i++) {
    const x = -width+2*width*i/count;
    const crest = .58*Math.exp(-Math.pow((x-disturbance)/.75,2));
    const trough = .30*Math.exp(-Math.pow((x-disturbance+.95)/.55,2));
    const y = .52 + lift*(crest-trough);
    positions.push(x,floor+(x>0 ? lift : 0),depth/2+.009, x,y,depth/2+.009, x,y,-depth/2);
    if(i<count) {
      const j=i*3;
      indices.push(j,j+3,j+1,j+1,j+3,j+4,j+1,j+4,j+2,j+2,j+4,j+5);
    }
  }
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return <>
    <Rock right={false} lift={lift}/>
    <Rock right lift={lift}/>
    <mesh geometry={geometry} frustumCulled={false}>
      <meshStandardMaterial color="#238bac" side={THREE.DoubleSide} roughness={.7}/>
    </mesh>
  </>;
}

