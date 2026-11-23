import React,{useEffect,useRef} from 'react';
import {Composition,registerRoot,delayRender,continueRender,staticFile} from 'remotion';
import {drawCharacter,HEIGHTS,PALETTES,type Role,type Mood} from './CharacterArt';

const W=2400,H=2050,PAPER='#f2eddf',CARD='#fffdf6',INK='#2c2530',MUTED='#6d7075',RULE='#d7d0c5',ACCENT='#8d6471';
function Sheet(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const handle=delayRender('Loading official character references'),ctx=ref.current!.getContext('2d')!;
  let cancelled=false;
  const load=(name:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Missing reference '+name));im.src=staticFile('official/'+name);});
  Promise.all([load('rintaro-school.png'),load('kaoruko-school.png')]).then(([r,k])=>{if(cancelled)return;
   ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);ctx.textBaseline='alphabetic';
   const text=(s:string,x:number,y:number,size=20,color=INK,weight=500)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px Arial,sans-serif`;ctx.fillText(s,x,y);};
   const card=(x:number,y:number,w:number,h:number)=>{ctx.fillStyle=CARD;ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.fill();};
   const figure=(role:Role,mood:Mood,x:number,baseline:number,scale:number)=>{ctx.save();ctx.translate(x,baseline);ctx.scale(scale,-scale);drawCharacter(ctx,{role,mood,frame:30,outfit:'school'});ctx.restore();};
   text('THE FRAGRANT FLOWER BLOOMS WITH DIGNITY',90,78,33,INK,700);
   text('CHARACTER IDENTITY  /  FRONTAL 2D FILM DESIGNS',90,119,20,MUTED);
   ctx.textAlign='right';text('DESIGN APPROVAL',2310,78,19,ACCENT,700);text('OFFICIAL COLOUR REFERENCES INCLUDED',2310,117,16,MUTED);ctx.textAlign='left';
   ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(90,145);ctx.lineTo(2310,145);ctx.stroke();
   const cols=[90,655,1220,1785],cw=525,top=180,ch=1040,ground=1100;
   cols.forEach(x=>card(x,top,cw,ch));
   text('RINTARO',cols[0]+28,228,25,INK,700);text('OFFICIAL ANIME REFERENCE',cols[0]+28,260,15,MUTED);
   text('RINTARO',cols[1]+28,228,25,INK,700);text('OUR PRODUCTION DRAWING',cols[1]+28,260,15,ACCENT,700);
   text('KAORUKO',cols[2]+28,228,25,INK,700);text('OUR PRODUCTION DRAWING',cols[2]+28,260,15,ACCENT,700);
   text('KAORUKO',cols[3]+28,228,25,INK,700);text('OFFICIAL ANIME REFERENCE',cols[3]+28,260,15,MUTED);
   ctx.strokeStyle=RULE;ctx.lineWidth=1;cols.forEach(x=>{ctx.beginPath();ctx.moveTo(x+25,ground+10);ctx.lineTo(x+cw-25,ground+10);ctx.stroke();});
   // Both adaptations share one ground and one scale, preserving the official190:148 height relationship.
   figure('rintaro','neutral',cols[1]+cw/2,ground,400);figure('kaoruko','soft',cols[2]+cw/2,ground,400);
   ctx.drawImage(r,cols[0]+(cw-275)/2,ground-790,275,790);
   ctx.drawImage(k,cols[3]+(cw-275)/2,ground-790,275,790);
   const notes=[['Swept-back blond spikes','Silver ear hardware · dark uniform'],['190 cm  /  GUARDED, GENTLE','Open collar · white shirt · gold buttons'],['148 cm  /  OPEN, SINCERE','Long waves · headband · cool blue eyes'],['Rose-pink sailor uniform','White collar · dark ribbon · satchel']];
   notes.forEach((lines,i)=>{text(lines[0],cols[i]+28,1152,19,INK,700);text(lines[1],cols[i]+28,1183,16,MUTED);});
   text('SIMPLE FACES, READABLE EMOTION',90,1283,24,INK,700);
   text('Same production drawing functions throughout. All poses remain frontal.',90,1318,18,MUTED);
   const moods:Mood[]=['neutral','flustered','soft'],roles:Role[]=['rintaro','kaoruko'];
   roles.forEach((role,j)=>moods.forEach((mood,i)=>{
    const x=90+j*1130+i*367,cy=1350,cw2=342;
    card(x,cy,cw2,380);
    ctx.save();ctx.beginPath();ctx.rect(x+8,cy+8,cw2-16,300);ctx.clip();
    const height=HEIGHTS[role]/100,headCenter=height-(role==='rintaro'?.27:.23);
    figure(role,mood,x+cw2/2,cy+155+headCenter*480,480);ctx.restore();
    ctx.textAlign='center';text((role==='rintaro'?['GUARDED','FLUSTERED','SMALL SMILE']:['ATTENTIVE','EMBARRASSED','WARM'])[i],x+cw2/2,cy+346,17,INK,700);ctx.textAlign='left';
   }));
   card(90,1770,2220,186);
   text('IDENTITY & COLOUR LOCK',120,1814,19,INK,700);
   const swatches:[string,string][]=[['Blond hair','#d4bc86'],['Silver hardware','#bcc1c7'],['Long dark hair','#37313e'],['Rose uniform','#b66f84'],['White collar','#f0ece8'],['Brown satchel','#6f4440']];
   swatches.forEach(([name,color],i)=>{const x=120+i*361;ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,1841,44,44,8);ctx.fill();text(name,x+58,1871,17,MUTED);});
   text('School outfits establish identity. Bakery/cafe wardrobe will be checked separately against episode footage.',120,1928,17,MUTED);
   text('Sources: official anime character profiles and episode 1 artwork.  /  Character approval pending.',90,2010,17,MUTED);
  }).then(()=>continueRender(handle)).catch(e=>{console.error(e);continueRender(handle);});
  return()=>{cancelled=true;};
 },[]);
 return <canvas ref={ref} width={W} height={H} style={{width:'100%',height:'100%'}}/>;
}
registerRoot(()=> <Composition id="FragrantCharacterSheet" component={Sheet} width={W} height={H} fps={30} durationInFrames={1}/>);
