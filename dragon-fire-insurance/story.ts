import captionData from './captions.json';
export const FPS=30;
export const TOTAL=1047;
export const CAPTIONS=captionData;
export type V3=[number,number,number];
export type P2=[number,number];
export const TABLE_TOP=1.05;
export const CUES={stamp:48,coin:64,bucketDismiss:145,ember:342,claim:401,pay:476,goldGone:546,anyFire:616,candle:798,notice:838,charge:848,arrive:927,throw:987,splash:1017,buckets:1025};
export const smooth=(v:number)=>{const x=Math.max(0,Math.min(1,v));return x*x*x*(x*(x*6-15)+10)};
export const ease=(f:number,a:number,b:number)=>smooth((f-a)/(b-a));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const point=(a:V3,b:V3,t:number):V3=>a.map((n,i)=>lerp(n,b[i],t)) as V3;
export const dragonHeadOutline=():P2[]=>Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2;return[500+Math.cos(a)*118*(1-.09*Math.sin(a)),246+Math.sin(a)*112]});
export type Performer={kind:'dragon'|'baker'|'child'|'smith'|'innkeeper';pos:V3;scale:number;right:V3;left:V3;feet?:[V3,V3];mood:string;gaze:V3;walk:number;lean:number;blink:number;stamp?:boolean};
const blink=(f:number,offset=0)=>{const n=(Math.floor(f)+offset)%113;return n<4?[.5,1,1,.5][n]:0};
export function stateAt(f:number){
 const ending=f>=764,claim=f>=398&&f<641;
 let pos:V3=ending?point([2.9,0,-2.1],[1.35,0,.15],ease(f,CUES.charge,CUES.arrive)):[1.05,0,-.45];
 let right:V3=[.23,1.60-.275*Math.sin(Math.PI*ease(f,24,72)),1.14];
 let left:V3=[1.60,1.43,.75];
 let mood='smug',gaze:V3=[-.7,1.4,.8];
 if(f>=72&&f<=110){right=f<94?point([.23,1.6,1.14],[.58,1.31,1.14],ease(f,72,94)):point([.58,1.31,1.14],[.55,1.4,.12],ease(f,94,110));left=point(left,[1.4,2.05,.25],ease(f,72,101));gaze=left;}
 if(f>110&&f<180){right=point([.55,1.4,.12],[1.04,2.27,-.02],ease(f,110,146));left=point([1.4,2.05,.25],[1.45,1.12,.25],ease(f,110,126));mood=f>=146?'determined':'smug';gaze=[-.65,1.5,.45];}
 if(claim){
  const recoil=Math.sin(Math.PI*ease(f,420,470));pos=[1.05+recoil*.12,0,-.45];
  right=point([.40,1.38,1.1],[.80,1.38,.1],ease(f,440,480));left=[1.48,1.38,.25];
  mood=f<453?'doubt':f<548?'pain':f<612?'inspect':'panic';gaze=f<548?[-.6,1.3,.9]:[.35,1.28,1.12];
 }
 if(f>=548&&f<641){right=[.02,1.40,1.20];left=[.61,1.40,1.20];}
 if(f>=641&&f<764){
  pos=f<703?[1.2,0,-.35]:f<738?[2.7,0,-1.0]:[1.4,0,-.45];
  right=f<703?[.3,1.7,.1]:f<738?[2.15,2.1,-.4]:[1.8,.8,.25];left=[pos[0]-.4,1.35,pos[2]+.35];
  mood=f>=738?'sleep':'panic';gaze=[0,1.1,0];
 }
 const bucketHeld=ending&&f>=CUES.notice;
 if(ending){
  mood=f<CUES.notice?'tired':f<CUES.arrive?'panic':f<CUES.splash?'determined':'relief';gaze=[-.1,1.4,0];
  const lift=ease(f,960,986),pour=ease(f,987,1007);
  right=[pos[0]-.48-.2*pour,1.02+.68*lift,pos[2]+.42];left=[pos[0]+.35,1.4,pos[2]+.1];
 }
 const run=ending&&f>=CUES.charge&&f<CUES.arrive;
 const dragon:Performer={kind:'dragon',pos,scale:1,right,left,mood,gaze,walk:run?(f-CUES.charge)/11:0,lean:run?-11:0,blink:blink(f,41),stamp:f<110};
 const leave=ease(f,495,552);
 const barrowPos:V3=point([1.90,0,1.15],[-1.8,0,2.45],leave);
 const approach=ease(f,454,493),q=1-approach;
 const customerPos:V3=claim&&f>=454?(f<493?[-.65*q*q+2*q*approach*.15+approach*approach*.95,0,.45*q*q+2*q*approach*2.1+approach*approach*1.45]:[barrowPos[0]-.95,0,barrowPos[2]+.3]):[-.65,0,.45];
 const presentation=claim?ease(f,398,416)*(1-ease(f,437,454)):0;
 const policyPos:V3=f>=548&&f<641?[.32,1.40,1.20]:point([.1,TABLE_TOP+.012,1.13],[-.15,1.4,1.13],presentation);
 const policyUpright=f>=548&&f<641?1:presentation;
 const paperHand:V3=[policyPos[0]-.295,policyPos[1],policyPos[2]+.014];
 const barrowHand:V3=[barrowPos[0]-.75,.67,barrowPos[2]+.23];
 const baker:Performer={kind:'baker',pos:customerPos,scale:1,right:claim&&f>=454?point(paperHand,barrowHand,approach):paperHand,left:[customerPos[0]-.3,1.0,customerPos[2]+.15],mood:claim?'firm':'hopeful',gaze:pos,walk:claim&&f>=454&&f<552?(f-454)/13:0,lean:0,blink:blink(f,72)};
 const reach=ease(f,774,795)*(1-ease(f,800,815));
 const child:Performer={kind:'child',pos:[-1.05,0,.10],scale:1,right:point([-.80,1.0,.12],[-.16,1.60,.04],reach),left:[-1.28,.9,.12],mood:f<CUES.splash?'happy':'annoyed',gaze:f<CUES.splash?[-.1,1.25,0]:pos,walk:0,lean:0,blink:blink(f,16)};
 const bucketPos:V3=bucketHeld?right:ending?[2.42,.6,-1.68]:[2.0,.6,.35];
 return{dragon,baker,child,bucketHeld,bucketPos,bucketTilt:ending?ease(f,987,1007)*1.65:0,barrowPos,policyPos,policyUpright,stampPos:(f<94?right:[.58,1.31,1.14]) as V3,showCoin:f<126,goldRemaining:1-.68*leave,cakePos:[-.1,TABLE_TOP+.16,0] as V3,candle:f>=CUES.candle&&f<CUES.splash,splash:ease(f,CUES.splash,CUES.splash+10),ending,claim,night:f>=738&&f<764};
}
export function bucketLipAt(f:number):V3{const s=stateAt(f),a=s.bucketTilt,x=-.22,y=-.235;return[s.bucketPos[0]+x*Math.cos(a)-y*Math.sin(a),s.bucketPos[1]+x*Math.sin(a)+y*Math.cos(a),s.bucketPos[2]];}
export function performerFeetAt(f:number,who:'dragon'|'baker'|'child'):[V3,V3]{
 const pose=stateAt(f)[who],begin=who==='dragon'?CUES.charge:454,end=who==='dragon'?CUES.arrive:552;
 const period=who==='dragon'?11:13,width=who==='dragon'?.23:who==='child'?.09:.11;
 return [-1,1].map((side,i):V3=>{
  const neutral:V3=[pose.pos[0]+side*width,0,pose.pos[2]+.09];
  if(who==='child'||f<begin||f>=end+7)return neutral;
  const phase=(Math.min(f,end)-begin)/period+i*.5,cycle=Math.floor(phase),u=phase-cycle;
  const contact=begin+(cycle-i*.5)*period;
  const rootA=stateAt(contact)[who].pos,rootB=stateAt(contact+period)[who].pos;
  const a:V3=[rootA[0]+side*width,0,rootA[2]+.09],b:V3=[rootB[0]+side*width,0,rootB[2]+.09];
  const swing=Math.max(0,(u-.5)*2),p=u<.5?a:point(a,b,smooth(swing));
  p[1]=u<.5?0:Math.sin(swing*Math.PI)*(who==='dragon'?.13:.08);
  return f>=end?point(p,neutral,ease(f,end,end+7)):p;
 }) as [V3,V3];
}
export type Camera={eye:V3;look:V3;fov:number;blur:number};
const K=(eye:V3,look:V3,fov=40,blur=10):Camera=>({eye,look,fov,blur});
export function cameraAt(f:number):Camera{
 let a:Camera,b:Camera,t:number;
 if(f<110){a=K([1.4,2.55,6.4],[.45,1.65,.50],39,11);b=K([1.8,2.7,8.4],[.55,1.55,.2],42,8);t=ease(f,8,65);}
 else if(f<180){a=K([2.0,2.65,5.7],[1.04,2.35,-.2],34,12);b=K([1.95,2.65,5.5],[1.04,2.35,-.2],34,12);t=ease(f,110,180);}
 else if(f<322){a=K([6.5,4.3,10],[0,1.4,-2.7],47,3);b=K([4.8,3.6,9],[.4,1.5,-2.7],46,4);t=ease(f,180,300);}
 else if(f<398){a=K([3.8,2.0,4.0],[3.1,1.1,-3],36,10);b=K([4.3,1.5,2.3],[4.1,.5,-2.8],38,10);t=ease(f,332,375);}
 else if(f<455){a=K([.6,2.35,7.5],[.35,1.55,.5],43,10);b=K([.55,2.3,7.3],[.35,1.55,.5],43,10);t=ease(f,398,455);}
 else if(f<548){a=K([3.0,2.5,8.0],[1.0,1.2,1.0],44,7);b=K([.2,2.4,8.6],[-.2,1.3,.8],45,5);t=ease(f,480,540);}
 else if(f<604){a=K([.32,1.82,3.7],[.32,1.40,1.2],34,14);b=K([.32,1.8,3.6],[.32,1.40,1.2],34,14);t=ease(f,550,598);}
 else if(f<641){a=K([2.1,2.85,5.2],[1.12,2.48,-.35],29,13);b=K([2.1,2.85,5.1],[1.12,2.48,-.35],29,13);t=ease(f,604,641);}
 else if(f<703){a=K([2.2,2.5,6.8],[.5,1.5,-1],42,9);b=K([2.1,2.4,6.6],[.5,1.5,-1],42,9);t=ease(f,641,703);}
 else if(f<738){a=K([4.1,2.6,5.6],[2.5,1.55,-1.5],40,9);b=a;t=0;}
 else if(f<764){a=K([2.6,2.2,5.6],[1.4,1.45,-.3],41,10);b=a;t=0;}
 else if(f<835){a=K([-.30,1.95,4.6],[-.55,1.4,0],42,12);b=K([-.20,2.0,4.8],[-.50,1.4,0],42,12);t=ease(f,780,826);}
 else if(f<864){const face=stateAt(f).dragon.pos;a=K([3.8,2.8,4.0],[face[0],2.45,face[2]+.15],33,12);b=a;t=0;}
 else if(f<948){a=K([3.4,3.4,10.6],[.65,1.55,-1.3],46,4);b=K([2.8,3.2,9.8],[.5,1.55,-.7],45,4);t=ease(f,867,931);}
 else if(f<990){a=K([.65,2.65,7.6],[.2,1.65,.15],44,10);b=a;t=0;}
 else{a=K([.55,2.5,7.1],[.4,1.6,0],44,10);b=K([.55,2.6,7.5],[.4,1.6,0],44,8);t=ease(f,1014,1044);}
 return{eye:point(a.eye,b.eye,t),look:point(a.look,b.look,t),fov:lerp(a.fov,b.fov,t),blur:lerp(a.blur,b.blur,t)};
}
