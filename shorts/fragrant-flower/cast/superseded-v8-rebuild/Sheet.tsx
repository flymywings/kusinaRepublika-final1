import React,{useLayoutEffect,useRef} from 'react';
import {Composition,registerRoot} from 'remotion';
import {drawCharacter,RIG,type Pose,type Role} from './art';

// Drawn by the same function the film uses.
const W=2400,H=2420;
function Sheet(){
 const ref=useRef<HTMLCanvasElement>(null);
 useLayoutEffect(()=>{
  const g=ref.current!.getContext('2d')!;
  const text=(s:string,x:number,y:number,size=22,color='#2c2530',weight=600,align:CanvasTextAlign='left')=>{g.textAlign=align;g.fillStyle=color;g.font=`${weight} ${size}px Arial,sans-serif`;g.fillText(s,x,y);};
  const card=(x:number,y:number,w:number,h:number)=>{g.fillStyle='#fffdf6';g.beginPath();g.roundRect(x,y,w,h,18);g.fill();};
  const fig=(p:Pose,x:number,y:number,s:number)=>{g.save();g.translate(x,y);g.scale(s,-s);drawCharacter(g,p);g.restore();};
  g.fillStyle='#f2eddf';g.fillRect(0,0,W,H);
  text('FRAGRANT FLOWER  /  V8 CAST REBUILD',90,84,36,'#2c2530',700);
  text('Rebuilt from v2 code and Draft 1. This is not the recovered V8 file. One approval covers both the identity and the new acting states.',90,126,22,'#6d7075',500);
  const full:[string,Pose][]=[
   ['RINTARO  /  school',{role:'rintaro',outfit:'school'}],
   ['RINTARO  /  cafe',{role:'rintaro',outfit:'cafe'}],
   ['KAORUKO  /  cafe',{role:'kaoruko',outfit:'cafe'}],
   ['KAORUKO  /  school',{role:'kaoruko',outfit:'school',face:{eyes:'happy',mouth:'smile'},prop:'satchel'}],
  ];
  full.forEach(([label,p],i)=>{const x=90+i*563;card(x,160,532,960);text(label,x+26,206,24,'#2c2530',700);fig(p,x+266,1080,430);});
  const rows:[string,Role,[string,Partial<Pose>][]][]=[
   ['RINTARO','rintaro',[
    ['Guarded',{}],
    ['Flustered',{face:{eyes:'round',mouth:'slant'}}],
    ['Worried',{face:{eyes:'round',mouth:'worried',tilt:7}}],
    ['Small smile',{face:{eyes:'happy',mouth:'smile'}}],
    ['NEW: apology stops',{bow:.55,face:{eyes:'round',mouth:'o',look:[.5,-.5]}}],
    ['NEW: released',{face:{eyes:'soft',mouth:'flat',brow:-3,tilt:-5,blush:.35}}],
    ['NEW: how he sees himself',{menace:1}],
   ]],
   ['KAORUKO','kaoruko',[
    ['Attentive',{}],
    ['Warm',{face:{eyes:'happy',mouth:'smile'}}],
    ['Startled',{face:{eyes:'round',mouth:'slant'}}],
    ['NEW: caught',{face:{eyes:'round',mouth:'full',cheeks:1,cream:true}}],
    ['NEW: mortified',{face:{eyes:'round',mouth:'full',cheeks:1,blush:1,cream:true,sweat:true}}],
    ['NEW: bow',{bow:1,face:{eyes:'closed',mouth:'worried',blush:.7}}],
    ['NEW: sincere',{face:{eyes:'almond',mouth:'smile',blush:.25}}],
   ]],
  ];
  rows.forEach(([name,role,cells],j)=>{
   const y=1160+j*605;text(name,90,y+28,25,'#2c2530',700);
   cells.forEach(([label,p],i)=>{
    const x=90+i*319,cw=302,s=468;card(x,y+48,cw,525);
    g.save();g.beginPath();g.rect(x+4,y+52,cw-8,455);g.clip();
    const pose={role,...p} as Pose;
    fig(pose,x+cw/2,y+48+175+(RIG[role].hc-(p.bow?.12*p.bow:0))*s,s);
    g.restore();
    text(label,x+cw/2,y+548,21,label.startsWith('NEW')?'#a0455d':'#2c2530',700,'center');
   });
  });
 },[]);
 return <canvas ref={ref} width={W} height={H} style={{width:'100%',height:'100%'}}/>;
}
registerRoot(()=><Composition id="Sheet" component={Sheet} width={W} height={H} fps={30} durationInFrames={1}/>);
