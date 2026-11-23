import React,{useLayoutEffect,useRef} from 'react';
import {Composition,registerRoot} from 'remotion';
import {drawCast,metrics,headDrop,type Pose,type P} from './rig';

const W=2200,H=1960;
const chest:[P,P]=[[-70,-700],[70,-700]];
export const JAW:[P,P]=[[-158,-1072],[158,-1072]];
const BOY:[string,Partial<Pose>][]=[
 ['Guarded',{}],
 ['Hurt',{face:{wide:-1,brow:[-2.4,.8],mouth:-.25,look:[-.5,.3]},hunch:.7,tilt:-.035}],
 ['Caught mid-apology',{face:{wide:.65,brow:[-1.6,0],parted:.35},bow:.4}],
 ['Seen',{face:{seen:1,brow:[-2,-.6],parted:.3,flush:.8}}],
 ['Lets himself smile',{face:{seen:.8,brow:[-1,-.4],mouth:.55,flush:.4},tilt:.03}],
];
const GIRL:[string,Partial<Pose>][]=[
 ['At ease',{}],
 ['Caught',{face:{wide:.8,brow:[-1.6,-.8],mouth:0,mouthShift:-2,full:1,crumb:true},hands:chest,prop:'fork',propAt:[70,-700]}],
 ['Mortified',{face:{wide:-1,look:[.7,.2],brow:[-2.2,.5],mouth:-.2,full:.7,flush:1,crumb:true},hands:JAW,elbows:[[-340,-640],[340,-640]],tilt:.05}],
 ['Apology',{face:{blink:1,brow:[-1.8,.2],mouth:-.1,flush:.5},bow:1,hands:[[-166,-580],[166,-580]],elbows:[[-300,-600],[300,-600]],prop:'box',propAt:[0,-560]}],
 ['Sees him',{face:{seen:1,brow:[-1,-.9],mouth:.45},tilt:.03}],
];
function Sheet(){
 const ref=useRef<HTMLCanvasElement>(null);
 useLayoutEffect(()=>{
  const g=ref.current!.getContext('2d')!;
  g.fillStyle='#d8d0c5';g.fillRect(0,0,W,H);
  const text=(s:string,x:number,y:number,size:number)=>{g.fillStyle='#332b31';g.textAlign='center';g.font=`600 ${size}px Arial,sans-serif`;g.fillText(s,x,y);};
  const fig=(p:Pose,x:number,y:number,s:number)=>{g.save();g.translate(x,y);g.scale(s/1000,s/1000);drawCast(g,p);g.restore();};
  ([['cafe','rintaro'],['cafe','kaoruko'],['school','rintaro'],['school','kaoruko']] as const).forEach(([outfit,role],i)=>{
   fig({role,outfit},310+i*525,900,400);text(`${role[0].toUpperCase()+role.slice(1)}, ${outfit==='cafe'?'café':'school'}`,310+i*525,950,24);
  });
  [BOY,GIRL].forEach((row,j)=>row.forEach(([label,p],i)=>{
   const x=24+i*434,y=990+j*480,role=j?'kaoruko':'rintaro' as const;
   g.fillStyle='#eee8df';g.fillRect(x,y,420,460);
   g.save();g.beginPath();g.rect(x,y,420,420);g.clip();
   const s=j?430:430,m=metrics(role);
   fig({role,...p} as Pose,x+210,y+170-((m.hc+headDrop(role,p.bow,p.hunch)*.6)/1000)*s,s);
   g.restore();text(label,x+210,y+446,23);
  }));
 },[]);
 return <canvas ref={ref} width={W} height={H} style={{width:'100%',height:'100%'}}/>;
}
registerRoot(()=><Composition id="Sheet" component={Sheet} width={W} height={H} fps={30} durationInFrames={1}/>);
