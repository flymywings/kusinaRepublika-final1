import timing from './timing.json';
import pacedTiming from './timing-175.json';
import {groundedGait} from './gait';
export type V3=[number,number,number];
export type P2=[number,number];
export const FPS=30,TOTAL=pacedTiming.frames,STORY_TOTAL=timing.frames;
export const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10)};
export const ease=(f:number,a:number,b:number)=>smooth((f-a)/(b-a));
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const point=(a:V3,b:V3,t:number):V3=>a.map((v,i)=>mix(v,b[i],t)) as V3;
export const AT={identity:105,office:170,approach:252,smile:343,missing:432,reach:517,invite:590,light:671,clothes:691,piercings:738,tease:775,fluster:850,explain:902,soften:1070,colleague:1139,name:1214,relief:1283,kindness:1363,memory:1410,return:1451,end:1523};
export type Character='sasaki'|'yamada'|'tayama'|'staff';
export type Mood='neutral'|'proud'|'alert'|'worried'|'amused'|'focused'|'tired'|'flustered'|'soft'|'teasing'|'disappointed'|'touched';
export interface Pose {role:Character;view:'front';position:V3;yaw:number;expression:Mood;hand?:V3;otherHand?:V3;tilt:number;headTilt?:number;crouch?:number;step:number;stride:number;scale:number;frame:number;softness:number;look?:-1|1;gaze?:V3;talk?:number;feet?:[V3,V3];}
export const COUNTER:V3=[-1.8,0,-2.85];
const CASHIER:V3=[-2.15,.026,-3.92],CUSTOMER:V3=[-.70,.026,-3.2],OUTSIDE:V3=[7.35,0,-2.5];
export const SERVICE={sasaki:[8.20,0,-5.9] as V3,tayama:[9.30,0,-6.4] as V3,lighter:[8.83,1.36,-6.08] as V3};
export const faceYaw=(from:V3,to:V3)=>Math.atan2(to[0]-from[0],to[2]-from[2]);

// Place/time bridges only. Register discovery and the entire conversation are connected takes.
export const BRIDGES=[105,170,252,517];
export const BRIDGE_FRAMES=14;
export const SHOTS=[{a:0,b:105,id:'confiding-reveal'},{a:105,b:170,id:'same-face-memory'},{a:170,b:252,id:'exhausting-shift'},{a:252,b:517,id:'arrival-and-discovery'},{a:517,b:STORY_TOTAL,id:'kindness-exchanged'}];
export const REVEAL_SCREEN={position:[-1.55,1.20,-1.20] as V3,size:[.24,.75,.04] as V3};
export interface View {eye:V3;look:V3;focus:V3;fov:number;blur:number;id:string;}
type CameraKey=[number,number,number,number,number,number]; // frame, x, y, z, fov, background blur
const OPEN:CameraKey[]=[[0,8.20,1.35,-3.25,34,10],[36,8.18,1.35,-3.1,36,10],[79,9.38,1.34,-3.15,34,11],[104,9.30,1.34,-3.20,33,11]];
const MEMORY:CameraKey[]=[[105,-2.15,1.31,-.65,30,10],[169,-2.15,1.31,-.82,30,10]];
const OFFICE:CameraKey[]=[[170,20,1.26,4.7,43,5],[251,20,1.20,2.8,40,8]];
const STORE:CameraKey[]=[
 [252,-.7,1.10,4.0,60,2],[288,-.7,.96,2.1,60,3],[326,-.7,.96,.60,60,3],
 [356,-.70,.96,-.30,56,4],[374,-1.70,1.28,-.30,40,7],[390,-2.15,1.31,-.30,36,9],[398,-2.15,1.31,-.30,36,9],
 [432,-1.35,1.30,-.30,54,5],[468,-.95,1.22,-.20,72,3],[516,-.95,1.19,-.15,74,3],
];
const CONVERSATION:CameraKey[]=[
 [517,7.35,1.30,1.1,38,7],[559,7.35,1.29,.96,37,8],[596,8.85,1.28,-.10,46,6],
 [636,8.75,1.28,-1.0,46,7],[668,8.83,1.35,-3.15,30,11],
 [707,9.30,1.12,-2.55,38,9],[751,9.30,1.45,-3.75,29,12],[805,9.30,1.34,-3.50,33,11],
 [870,8.20,1.32,-3.00,35,10],[940,8.10,1.31,-3.12,35,10],
 [1005,8.65,1.29,-1.45,49,6],[1085,9.30,1.38,-3.85,32,11],
 [1245,9.30,1.37,-3.90,32,11],[1321,8.17,1.34,-3.25,35,10],
 [1400,9.30,1.36,-3.70,33,11],[1465,9.30,1.36,-3.75,33,11],[1530,8.75,1.28,-.80,46,5],[1589,8.83,1.45,3.10,49,2],
];

// Shape-preserving cubic interpolation carries velocity through compatible keys; pauses occur at arrivals.
function curve(keys:CameraKey[],f:number,col:number){
 const i=Math.max(0,keys.findIndex((k,n)=>n<keys.length-1&&f>=k[0]&&f<=keys[n+1][0]));
 const a=keys[i],b=keys[Math.min(i+1,keys.length-1)],h=b[0]-a[0];if(!h)return a[col];
 const slope=(n:number)=>(keys[n+1][col]-keys[n][col])/(keys[n+1][0]-keys[n][0]);
 const tangent=(n:number)=>{if(n===0||n===keys.length-1)return 0;const l=slope(n-1),r=slope(n);if(l*r<=0)return 0;const hl=keys[n][0]-keys[n-1][0],hr=keys[n+1][0]-keys[n][0],w1=2*hr+hl,w2=hr+2*hl;return(w1+w2)/(w1/l+w2/r)};
 const t=Math.max(0,Math.min(1,(f-a[0])/h)),t2=t*t,t3=t2*t;
 return(2*t3-3*t2+1)*a[col]+(t3-2*t2+t)*h*tangent(i)+(-2*t3+3*t2)*b[col]+(t3-t2)*h*tangent(i+1);
}
export function viewAt(f:number):View{
 const section=SHOTS.find(s=>f>=s.a&&f<s.b)??SHOTS.at(-1)!;
 const keys=f<105?OPEN:f<170?MEMORY:f<252?OFFICE:f<517?STORE:CONVERSATION;
 const x=curve(keys,f,1),y=curve(keys,f,2),z=curve(keys,f,3),aim=f<105?-6.15:f<170?-3.92:f<252?-1:f<517?-3.92:mix(-2.5,-6.15,ease(f,570,604));
 const focusZ=f>=252&&f<356?arrival(f)[2]:f>=356&&f<390?mix(arrival(356)[2],CASHIER[2],ease(f,356,390)):f>=638&&f<691?mix(-6.15,-6.08,ease(f,638,660)):aim;
 return{eye:[x,y,z],look:[x,y,aim],focus:[x,y,focusZ],fov:curve(keys,f,4),blur:curve(keys,f,5),id:section.id};
}
export function memoryAmount(f:number){return f>=105&&f<170?1:f>=343&&f<444?ease(f,343,365)*(1-ease(f,402,444)):0;}
function cigaretteLightingHand(f:number,root:V3):V3{
 const eye=viewAt(f).eye,flame:V3=[SERVICE.lighter[0],SERVICE.lighter[1]+.029,SERVICE.lighter[2]],projection=(eye[2]-root[2])/(eye[2]-flame[2]);
 return[flame[0]+.155*.91/projection,flame[1]-.031*.91/projection,flame[2]];
}
function travel(f:number,a:number,b:number){const t=Math.max(0,Math.min(1,(f-a)/(b-a))),r=.15;return t<r?t*t/(2*r*(1-r)):t>1-r?1-(1-t)*(1-t)/(2*r*(1-r)):(t-r/2)/(1-r);}
export function floorAt(p:V3){return p[0]>-5.95&&p[0]<5.95&&p[2]<0&&p[2]>-8.9||p[0]>15.5&&p[0]<24.5&&p[2]>-4.5&&p[2]<2.5?.025:0;}
export function arrival(f:number):V3{const p=point([CUSTOMER[0],0,.4],CUSTOMER,travel(f,252,374));p[1]=floorAt(p)+.001;return p;}
export function serviceWalk(f:number):V3{return point(OUTSIDE,SERVICE.sasaki,travel(f,590,640));}
const standingFeet=(p:V3,s=1):[V3,V3]=>[[p[0]-.13*s,p[1]+.002,p[2]],[p[0]+.13*s,p[1]+.002,p[2]]];
export function stateAt(f:number){
 const service=f<105||f>=517,memory=f>=105&&f<170||f>=343&&f<432,office=f>=170&&f<252;
 let sp:V3=service?f<105?[...SERVICE.sasaki]:f<590?[...OUTSIDE]:serviceWalk(f):office?[20,.026,-1]:[...CUSTOMER];
 const tp:V3=[...SERVICE.tayama];let hand:V3|undefined,otherHand:V3|undefined,tilt=.055,stride=0,step=0,mood:Mood='tired',headTilt=0;
 let gaze:V3=service?tp:[CASHIER[0],1.5,CASHIER[2]],yaw=service?faceYaw(sp,tp):Math.PI;
 if(office){hand=[20.18,.88,-.6];otherHand=[19.8,.92,-.65];tilt=.14;headTilt=.025;}
 const walking=f>=252&&f<=374?groundedGait(f,252,374,arrival):f>=590&&f<=640?groundedGait(f,590,640,serviceWalk):undefined;
 if(f>=252&&f<=374){sp=arrival(f);stride=.7*Math.sin(Math.PI*travel(f,252,374));step=(walking?.phase??0)*Math.PI*2;tilt=mix(.065,.005,ease(f,290,374));}
 if(f>=343&&f<468){mood='soft';tilt=-.018;hand=[sp[0]-.20,1.02,sp[2]-.04];}
 if(f>=468&&f<517){mood='disappointed';tilt=mix(-.018,.10,ease(f,470,501));headTilt=.035*ease(f,474,504);hand=point([sp[0]-.20,1.02,sp[2]-.04],[sp[0]-.20,.85,sp[2]+.03],ease(f,472,503));}
 if(f>=517&&f<590){mood='tired';hand=point([sp[0]+.22,.88,sp[2]+.10],[sp[0]+.22,1.28,sp[2]+.10],ease(f,526,563));gaze=f<576?hand:tp;tilt=mix(.07,.015,ease(f,576,590));headTilt=-.035*ease(f,576,590);}
 if(f>=590&&f<640){stride=.55*Math.sin(Math.PI*travel(f,590,640));step=(walking?.phase??0)*Math.PI*2;}
 if(service){
  const sharing=ease(f,638,657)*(1-ease(f,675,697));
  hand??=point([sp[0]+.22,.90,sp[2]+.12],SERVICE.lighter,sharing);
  if(f<105){mood='soft';hand=[sp[0]+.35,1.13,sp[2]+.08];tilt=-.02;}
  if(f>=775&&f<902){mood='flustered';const recoil=Math.sin(Math.PI*ease(f,830,884));tilt=.09*recoil;headTilt=-.035*recoil;hand=point(hand,[sp[0]+.31,1.34,sp[2]+.08],ease(f,830,860));}
  if(f>=902&&f<1070){mood='focused';const settle=ease(f,918,989);hand=point([sp[0]+.31,1.34,sp[2]+.08],[sp[0]+.30,1.07,sp[2]+.08],settle);const honest=ease(f,970,1001)*(1-ease(f,1030,1060));hand=point(hand,[sp[0]+.37,1.15,sp[2]+.12],honest);tilt=mix(.055,-.012,settle);headTilt=-.018*settle;}
  if(f>=1070){mood=f>=1283?'soft':'neutral';tilt=mix(.012,-.025,ease(f,1280,1350));hand=[sp[0]+.29,.93,sp[2]+.17];headTilt=-.025*ease(f,1280,1340);}
 }
 otherHand??=[sp[0]-.22,.87-(f>=468&&f<517?.035*ease(f,470,501):f>=918?.045*ease(f,918,989):0),sp[2]+.08];
 const breathe=f>=697?.008*(.5+.5*Math.sin((f-697)*.048)):0;
 const sasaki:Pose={role:'sasaki',view:'front',position:sp,yaw,expression:mood,hand,otherHand,feet:walking?.feet??standingFeet(sp),tilt,crouch:office?.28:breathe+.035*ease(f,918,989)*(1-ease(f,1280,1350)),headTilt,stride,step,scale:1,frame:f,softness:ease(f,1283,1360),gaze,talk:f>=902&&f<1055?.5+.5*Math.sin(f*.31):0};
 const soften=ease(f,1046,1120),lower=ease(f,1056,1114),lightReach=ease(f,635,657)*(1-ease(f,675,697));
 const resting:V3=[tp[0]-.22,mix(1.22,.99,lower),tp[2]+.13];
 const tayamaHand=point(resting,cigaretteLightingHand(f,tp),lightReach),teaseGesture=ease(f,777,801)*(1-ease(f,824,848));
 const other=point([tp[0]+.30,.75,tp[2]+.03],[tp[0]+.06,1.17,tp[2]+.15],teaseGesture);
 const introduction=ease(f,1205,1222)*(1-ease(f,1241,1268));
 const tayama:Pose={role:'tayama',view:'front',position:tp,yaw:faceYaw(tp,sp),expression:f>=1070?'touched':'teasing',hand:tayamaHand,otherHand:point(point(other,[tp[0]+.24,.91,tp[2]+.07],soften),[tp[0]+.12,1.10,tp[2]+.09],introduction),tilt:mix(-.025,.015,soften)-.05*lightReach-.025*introduction,headTilt:mix(-.045,.035,soften)-.04*introduction-.014*ease(f,1380,1450),crouch:breathe*.7+.045*ease(f,1052,1084)*(1-ease(f,1105,1170))+.03*introduction,stride:0,step:0,scale:.91,frame:f,softness:soften*.4+.18*ease(f,1192,1245)+.42*ease(f,1250,1490),gaze:[sp[0],mix(1.55,1.30,ease(f,1055,1083)*(1-ease(f,1110,1165))),sp[2]]};
 const yamada:Pose={role:'yamada',view:'front',position:[...CASHIER],yaw:0,expression:f<170?'neutral':'soft',hand:[-1.91,1.03,-3.25],otherHand:[-2.27,1.02,-3.25],tilt:.025,headTilt:-.025,stride:0,step:0,scale:.91,frame:f,softness:f<170?.1:.9,gaze:[CUSTOMER[0],1.55,CUSTOMER[2]]};
 const scan=ease(f,448,462)*(1-ease(f,479,495));
 const staff:Pose={...yamada,role:'staff',expression:'neutral',tilt:.025+.018*scan,hand:[-1.91+.10*scan,1.03,-3.25],headTilt:.02*scan};
 tayama.feet=standingFeet(tp,.91);yamada.feet=standingFeet(CASHIER,.91);staff.feet=standingFeet(CASHIER,.91);
 return{sasaki,tayama,yamada,staff,service,memory,office,memoryAmount:memoryAmount(f),showSasaki:!(f>=105&&f<170),showTayama:service,showYamada:memory,showStaff:f>=432&&f<517,lighterVisible:service&&f>=638&&f<697,flame:f>=660&&f<674,lightReach,receiptVisible:f>=343&&f<432,shopping:!office&&f>=432};
}

