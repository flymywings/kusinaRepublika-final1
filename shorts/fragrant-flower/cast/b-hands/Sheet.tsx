import React,{useLayoutEffect,useRef} from 'react';
import {Composition,registerRoot} from 'remotion';
import {drawCast,type Pose,type P} from './rig';
// Hand style test: rest, fork grip, box carry; four hand styles. Her, cafe outfit.
const W=1760,H=1400,CELL=420;
const chest:[P,P]=[[-70,-700],[70,-700]];
const POSES:[string,Partial<Pose>][]=[
 ['At rest, hands at the chest',{face:{brow:[-1,-.6],mouth:.3},hands:chest,elbows:[[-250,-700],[250,-700]]}],
 ['Holding the fork',{face:{wide:.8,brow:[-1.6,-.8],mouth:0,full:1},hands:chest,prop:'fork',propAt:[70,-700]}],
 ['Carrying the box',{face:{brow:[-1,-.4],mouth:.4},hands:[[-166,-580],[166,-580]],elbows:[[-300,-600],[300,-600]],prop:'box',propAt:[0,-560]}],
];
const STYLES:[string,Pose['handStyle']][]=[['dot (approved)','dot'],['big dot','big'],['dot + thumb + fingertip','thumb'],['skin mitten','mitt']];
function Sheet(){
 const ref=useRef<HTMLCanvasElement>(null);
 useLayoutEffect(()=>{
  const g=ref.current!.getContext('2d')!;
  g.fillStyle='#d8d0c5';g.fillRect(0,0,W,H);
  const text=(s:string,x:number,y:number,size:number)=>{g.fillStyle='#332b31';g.textAlign='center';g.font='600 '+size+'px Arial,sans-serif';g.fillText(s,x,y);};
  POSES.forEach(([pl,pose],j)=>STYLES.forEach(([sl,hs],i)=>{
   const x=20+i*(CELL+10),y=60+j*(CELL+50),k=1.15;
   g.fillStyle='#eee8df';g.fillRect(x,y,CELL,CELL);
   g.save();g.beginPath();g.rect(x,y,CELL,CELL);g.clip();
   g.translate(x+CELL/2,y+CELL/2+700*k-40);g.scale(k,k);
   drawCast(g,{role:'kaoruko',outfit:'cafe',...pose,handStyle:hs} as Pose);
   g.restore();
   if(j===0)text(sl,x+CELL/2,40,26);
   text(pl,x+CELL/2,y+CELL+30,22);
  }));
 },[]);
 return <canvas ref={ref} width={W} height={H} style={{width:'100%',height:'100%'}}/>;
}
registerRoot(()=><Composition id="Sheet" component={Sheet} width={W} height={H} fps={30} durationInFrames={1}/>);
