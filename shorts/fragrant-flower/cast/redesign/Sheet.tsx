import React,{useLayoutEffect,useRef} from 'react';
import {Composition,registerRoot} from 'remotion';
import {drawCast,metrics,STATES,type Style,type Role,type Pose} from './rig';
import {drawCharacter,type Mood} from '../v8/CharacterArt';

const W=2400,H=2440,ROLES:Role[]=['rintaro','kaoruko'];
const COLS:[null|Style,string,string][]=[[null,'V8','approved, untouched'],['rick','A','Rick’s fundamentals'],['ours','B','our own style']];
function Sheet(){
 const ref=useRef<HTMLCanvasElement>(null);
 useLayoutEffect(()=>{
  const g=ref.current!.getContext('2d')!;
  const text=(s:string,x:number,y:number,size=22,color='#2c2530',weight=700,align:CanvasTextAlign='left')=>{g.textAlign=align;g.fillStyle=color;g.font=`${weight} ${size}px Arial,sans-serif`;g.fillText(s,x,y);};
  const card=(x:number,y:number,w:number,h:number)=>{g.fillStyle='#fffdf6';g.beginPath();g.roundRect(x,y,w,h,18);g.fill();};
  const ours=(p:Pose,x:number,y:number,s:number)=>{g.save();g.translate(x,y);g.scale(s/1000,s/1000);drawCast(g,p);g.restore();};
  g.fillStyle='#eadfd0';g.fillRect(0,0,W,H);
  COLS.forEach(([style,tag,label],i)=>{
   const x=50+i*780;card(x,40,750,1010);
   text(tag,x+30,112,54);text(label,x+(tag.length>1?135:90),108,28,'#6d6270',500);
   ROLES.forEach((role,j)=>{
    const fx=x+(j?540:215),fy=1010;
    if(style)ours({style,role,satchel:role==='kaoruko'},fx,fy,422);
    else{g.save();g.translate(fx,fy);g.scale(422,-422);drawCharacter(g,{role,mood:role==='kaoruko'?'soft':'neutral',frame:30});g.restore();}
   });
  });
  const oldMood:Record<Role,(Mood|null)[]>={rintaro:['neutral','flustered','worried',null,'soft'],kaoruko:['neutral','flustered','worried',null,'soft']};
  ROLES.forEach((role,j)=>COLS.forEach(([style,tag],k)=>{
   const y=1085+(j*3+k)*222;text(tag,60,y+118,38);
   STATES[role].forEach(([label,face,tilt],i)=>{
    const x=160+i*448,w=430;card(x,y,w,212);
    g.save();g.beginPath();g.rect(x+4,y+4,w-8,204);g.clip();
    if(style){
     const m=metrics(style,role),s=322;
     ours({style,role,face,tilt},x+145,y+106-(m.hc/1000)*s,s);
    }else if(oldMood[role][i]){
     const hc=role==='kaoruko'?1.25:1.63,s=366;
     g.save();g.translate(x+145,y+106+hc*s);g.scale(s,-s);drawCharacter(g,{role,mood:oldMood[role][i]!,frame:30});g.restore();
    }else text('no such state',x+145,y+116,20,'#a0455d',600,'center');
    g.restore();
    const words=label.split(' '),lines=words.length>2?[words.slice(0,-2).join(' '),words.slice(-2).join(' ')]:[label];
    lines.forEach((l,n)=>text(l,x+350,y+110+n*26,19,'#5d5360',600,'center'));
   });
  }));
 },[]);
 return <canvas ref={ref} width={W} height={H} style={{width:'100%',height:'100%'}}/>;
}
registerRoot(()=><Composition id="Sheet" component={Sheet} width={W} height={H} fps={30} durationInFrames={1}/>);
