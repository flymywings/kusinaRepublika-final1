import timing from './timing.json';
export type V3=[number,number,number];
export type P2=[number,number];
export const FPS=30,TOTAL=timing.frames;
export const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10)};
export const ease=(f:number,a:number,b:number)=>smooth((f-a)/(b-a));
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const point=(a:V3,b:V3,t:number):V3=>a.map((v,i)=>mix(v,b[i],t)) as V3;
export const AT={identity:105,office:170,approach:252,smile:343,missing:432,reach:517,invite:590,light:671,clothes:691,piercings:738,tease:775,fluster:850,explain:902,soften:1070,colleague:1139,name:1214,relief:1283,kindness:1363,memory:1410,return:1451,end:1523};
export type Character='sasaki'|'yamada'|'tayama'|'staff';
export type Mood='neutral'|'proud'|'alert'|'worried'|'amused'|'focused'|'tired'|'flustered'|'soft'|'teasing';
export interface Pose {role:Character;view:'front';position:V3;yaw:number;expression:Mood;hand?:V3;otherHand?:V3;tilt:number;headTilt?:number;crouch?:number;step:number;stride:number;scale:number;frame:number;softness:number;look?:-1|1;gaze?:V3;talk?:number;feet?:[V3,V3];}
export const COUNTER:V3=[-1.8,0,-1.45];
export const SERVICE={sasaki:[8.05,0,-5.9] as V3,tayama:[9.45,0,-6.4] as V3,lighter:[8.83,1.36,-6.08] as V3};
export const faceYaw=(from:V3,to:V3)=>Math.atan2(to[0]-from[0],to[2]-from[2]);
function cigaretteLightingHand(f:number,root:V3):V3{
 const eye=viewAt(f).eye,scale=.91,yaw=Math.atan2(eye[0]-root[0],eye[2]-root[2]),sin=Math.sin(yaw),cos=Math.cos(yaw),distance=Math.hypot(eye[0]-root[0],eye[2]-root[2]);
 const flame:V3=[SERVICE.lighter[0],SERVICE.lighter[1]+.029,SERVICE.lighter[2]];
 const dx=flame[0]-root[0],dz=flame[2]-root[2],projection=distance/(distance-sin*dx-cos*dz);
 // Project the actual approved flat cigarette tip onto the 3D flame, preserving its length and tilt.
 const localX=(cos*dx-sin*dz)*projection/scale+.155,localY=((flame[1]-eye[1])*projection+eye[1]-root[1])/scale-.031;
 const plane:V3=[root[0]+cos*localX*scale,root[1]+localY*scale,root[2]-sin*localX*scale],t=(flame[2]-eye[2])/(plane[2]-eye[2]);
 return[eye[0]+(plane[0]-eye[0])*t,eye[1]+(plane[1]-eye[1])*t,flame[2]];
}
function walkingFeet(f:number,start:number,end:number,from:V3,to:V3,yaw:number):[V3,V3]{
 const route=(n:number)=>point(from,to,ease(n,start,end));
 const footYaw=faceYaw(from,to);
 return [-1,1].map(side=>{const phase=(f-start)/24+(side>0?.5:0),cycle=Math.floor(phase),t=phase-cycle,offset=side>0?.5:0;
  const a=route(start+(cycle+.29-offset)*24),b=route(start+(cycle+1.29-offset)*24);
  const swing=t<.58?0:smooth((t-.58)/.42),p=point(a,b,swing);return[p[0]+Math.cos(footYaw)*side*.136,.11*Math.sin(Math.PI*swing),p[2]-Math.sin(footYaw)*side*.136] as V3;
 }) as [V3,V3];
}
export function stateAt(f:number){
 const service=f<AT.identity||f>=AT.invite&&!(f>=AT.memory&&f<AT.return),memory=f>=AT.identity&&f<AT.office||f>=AT.smile&&f<AT.missing||f>=AT.memory&&f<AT.return;
 const office=f>=AT.office&&f<AT.approach;
 let sp:V3=service?[...SERVICE.sasaki]:office?[20,0,-1.0]:[-1.35,0,-.40];
 let tp:V3=[...SERVICE.tayama];
 let hand:V3|undefined,otherHand:V3|undefined,tilt=.035,stride=0,step=0,mood:Mood='tired';
 let gaze:V3=service?tp:[-2.15,1.55,-2.55],yaw=service?faceYaw(sp,tp):Math.PI;
 if(office){yaw=.18;hand=[20.18,.88,-.6];otherHand=[19.8,.92,-.65];tilt=.11;}
 if(f>=AT.approach&&f<AT.smile){const t=ease(f,252,335);sp=point([2.5,0,4.2],[1.6,0,.8],t);yaw=faceYaw(sp,[1.3,0,-1]);stride=.65*Math.sin(Math.PI*t);step=(f-252)*.22;}
 if(f>=AT.smile&&f<AT.missing){mood='soft';hand=[-1.65,1.02,-.94];tilt=-.015;}
 if(f>=AT.missing&&f<AT.reach){mood='worried';gaze=[-2.0,1.6,-2.5];tilt=.07;}
 if(f>=AT.reach&&f<AT.invite){sp=[6.8,0,1.05];yaw=1.1;hand=point([6.94,.87,1.20],[7.03,1.28,1.22],ease(f,526,563));gaze=[7.03,1.28,1.22];}
 if(f>=AT.invite&&f<640){const t=ease(f,590,638);sp=point([7.55,0,-4.1],SERVICE.sasaki,t);yaw=faceYaw(sp,tp);gaze=tp;stride=.45*Math.sin(Math.PI*t);step=(f-590)*.23;}
 if(service){
  const sharing=ease(f,638,657)*(1-ease(f,675,691));
  hand=point([sp[0]+.22,.90,sp[2]+.12],SERVICE.lighter,sharing);
  if(f<AT.identity){mood='soft';hand=[sp[0]+.35,1.13,sp[2]+.08];tilt=-.02;}
  if(f>=AT.tease&&f<AT.explain){mood='flustered';const recoil=Math.sin(Math.PI*ease(f,837,888));tilt=.08*recoil;hand=point(hand,[sp[0]+.31,1.34,sp[2]+.08],ease(f,838,861));}
  if(f>=AT.explain&&f<AT.soften){mood='focused';hand=point([sp[0]+.31,1.34,sp[2]+.08],[sp[0]+.16,1.22,sp[2]+.03],ease(f,902,937));const gesture=ease(f,967,997)*(1-ease(f,1030,1066));hand=point(hand,[sp[0]+.38,1.12,sp[2]+.15],gesture);tilt=-.01;}
  if(f>=AT.soften){mood=f>=AT.relief?'soft':'neutral';tilt=mix(.025,-.02,ease(f,1283,1350));hand=[sp[0]+.29,.93,sp[2]+.17];}
 }
 const soften=ease(f,1050,1100);
 otherHand??=[sp[0]-.22,.87,sp[2]+.08];
 const feet=f>=252&&f<343?walkingFeet(f,252,335,[2.5,0,4.2],[1.6,0,.8],yaw):f>=590&&f<638?walkingFeet(f,590,638,[7.55,0,-4.1],SERVICE.sasaki,yaw):undefined;
 const sasaki:Pose={role:'sasaki',view:'front',position:sp,yaw,expression:mood,hand,otherHand,tilt,crouch:office?.28:0,stride,step,scale:1,frame:f,softness:ease(f,1283,1360),gaze,feet,headTilt:f>=838&&f<902?-.045*Math.sin(Math.PI*ease(f,838,902)):0};
 const tyaw=faceYaw(tp,sp);
 const lightReach=ease(f,635,657)*(1-ease(f,675,691));
 const lower=ease(f,1056,1114);
 const tayamaHand=point(point([tp[0]-.22,1.22,tp[2]+.13],[tp[0]-.25,1.02,tp[2]+.18],lower),cigaretteLightingHand(f,tp),lightReach);
 const teaseGesture=ease(f,777,801)*(1-ease(f,824,848));
 const tayama:Pose={role:'tayama',view:'front',position:tp,yaw:tyaw-.055*teaseGesture,expression:'teasing',hand:tayamaHand,otherHand:point([tp[0]+.30,.75,tp[2]+.03],[tp[0]-.02,1.17,tp[2]+.25],teaseGesture),tilt:-.025-.05*lightReach+.035*lower,headTilt:mix(-.045,.025,soften),stride:0,step:0,scale:.91,frame:f,softness:soften,gaze:[sp[0],1.55-.15*ease(f,1055,1079)*(1-ease(f,1093,1120)),sp[2]]};
 const yamada:Pose={role:'yamada',view:'front',position:[-2.15,0,-2.52],yaw:.13,expression:f<170?'neutral':'soft',hand:[-1.91,1.03,-1.85],otherHand:[-2.27,1.02,-1.85],tilt:.025,headTilt:-.025,stride:0,step:0,scale:.91,frame:f,softness:f<170?.1:.9,gaze:[-1.35,1.55,-.15]};
 const staff:Pose={...yamada,role:'staff',expression:'neutral'};
 return{sasaki,tayama,yamada,staff,service,memory,office,showSasaki:!memory&&!(f>=432&&f<476)&&!(f>=252&&f<296)&&!(f>=590&&f<648),showTayama:service,showYamada:memory,showStaff:f>=AT.missing&&f<AT.reach,lighterVisible:service&&f>=648&&f<691,flame:f>=660&&f<674,lightReach,receiptVisible:memory&&f>=AT.smile&&f<AT.missing,shopping:!office&&f>=AT.missing};
}
export interface View {eye:V3;look:V3;focus:V3;fov:number;blur:number;id:string;}
type Key={a:number;b:number;id:string;eye:V3;look:V3;toEye?:V3;toLook?:V3;fov?:number;blur?:number};
export const SHOTS:Key[]=[
 {a:0,b:62,id:'confiding',eye:[10.2,1.88,-2.25],look:[8.1,1.42,-5.88],toEye:[10,1.85,-2.45],fov:32,blur:12},
 {a:62,b:105,id:'listener-identity',eye:[8.48,1.68,-3.35],look:[9.45,1.35,-6.35],fov:27,blur:13},
 {a:105,b:170,id:'same-face',eye:[-3.12,1.68,.53],look:[-2.15,1.35,-2.52],toEye:[-3.10,1.68,.48],fov:27,blur:12},
 {a:170,b:252,id:'office',eye:[22.1,2.25,3.4],look:[20.0,1.05,-1.0],toEye:[21.8,2.0,3.15],fov:39,blur:9},
 {a:252,b:296,id:'storefront',eye:[.5,1.6,8.4],look:[.5,1.6,-.2],toEye:[.5,1.6,8.0],fov:48,blur:3},
 {a:296,b:343,id:'arrival-front',eye:[1.9,1.25,-2.6],look:[1.9,1.25,2.0],toEye:[1.9,1.25,-2.4],fov:40,blur:7},
 {a:343,b:432,id:'checkout-warmth',eye:[-2.15,1.30,1.65],look:[-2.15,1.30,-2.52],toEye:[-2.15,1.30,1.5],fov:37,blur:11},
 {a:432,b:476,id:'wrong-register',eye:[-1.05,1.67,1.05],look:[-2.15,1.30,-2.52],toEye:[-1.00,1.69,1.0],fov:34,blur:10},
 {a:476,b:517,id:'disappointed',eye:[-3.35,1.89,-2.10],look:[-1.35,1.40,-.40],fov:33,blur:12},
 {a:517,b:590,id:'interrupted-reach',eye:[8.6,1.65,3.8],look:[6.92,1.2,1.05],toEye:[8.4,1.7,3.45],fov:36,blur:10},
 {a:590,b:648,id:'invitation',eye:[9.45,1.25,-2.1],look:[9.45,1.25,-6.4],toEye:[9.45,1.25,-2.3],fov:37,blur:9},
 {a:648,b:691,id:'shared-light',eye:[9.55,1.65,-3.28],look:[8.91,1.37,-6.10],toEye:[9.45,1.61,-3.45],fov:31,blur:13},
 {a:691,b:738,id:'off-duty',eye:[11.4,1.38,-2.65],look:[9.45,1.04,-6.35],toEye:[11.1,1.66,-2.9],toLook:[9.45,1.27,-6.35],fov:35,blur:10},
 {a:738,b:775,id:'piercing-detail',eye:[8.4,1.67,-3.50],look:[9.45,1.43,-6.35],fov:25,blur:13},
 {a:775,b:838,id:'teasing-look',eye:[8.48,1.68,-3.35],look:[9.45,1.35,-6.35],toEye:[8.5,1.68,-3.40],fov:27,blur:12},
 {a:838,b:902,id:'fluster',eye:[11.7,1.86,-4.4],look:[8.05,1.45,-5.9],fov:31,blur:12},
 {a:902,b:1000,id:'explanation',eye:[11.3,1.87,-3.3],look:[8.12,1.38,-5.9],toEye:[11.1,1.82,-3.5],fov:33,blur:11},
 {a:1000,b:1070,id:'sincere-two-shot',eye:[7.5,1.86,-1.6],look:[8.75,1.32,-6.15],toEye:[7.3,1.87,-1.9],fov:50,blur:9},
 {a:1070,b:1139,id:'received-kindness',eye:[8.5,1.68,-3.4],look:[9.45,1.34,-6.35],fov:26,blur:13},
 {a:1139,b:1214,id:'coworker-assumption',eye:[11.6,1.94,-1.15],look:[8.8,1.38,-6.18],toEye:[11.2,1.92,-1.38],fov:44,blur:9},
 {a:1214,b:1283,id:'tayama-name',eye:[8.35,1.73,-2.7],look:[9.45,1.35,-6.35],fov:32,blur:11},
 {a:1283,b:1363,id:'relief',eye:[11.4,1.82,-3.4],look:[8.1,1.39,-5.9],toEye:[11.2,1.82,-3.5],fov:33,blur:11},
 {a:1363,b:1410,id:'quiet-response',eye:[8.35,1.74,-3.30],look:[9.45,1.43,-6.35],fov:28,blur:12},
 {a:1410,b:1451,id:'smile-memory',eye:[-.8,1.73,.18],look:[-2.15,1.43,-2.52],fov:32,blur:12},
 {a:1451,b:1590,id:'kindness-returned',eye:[11.4,2.12,-1.05],look:[8.8,1.28,-6.14],toEye:[12.4,2.65,.20],toLook:[8.8,1.22,-5.9],fov:42,blur:6},
].map(k=>{
 // A flat, frontal POV: straight camera travel retains depth without exposing side/back drawings.
 const front=(eye:V3,look:V3):V3=>[look[0],look[1],look[2]+Math.sign(eye[2]-look[2])*Math.hypot(eye[0]-look[0],eye[2]-look[2])];
 const look=k.look as V3,toLook=(k.toLook??k.look) as V3;
 return{...k,eye:front(k.eye as V3,look),toEye:front((k.toEye??k.eye) as V3,toLook)} as Key;
});
export function viewAt(f:number):View{const k=SHOTS.find(s=>f>=s.a&&f<s.b)??SHOTS.at(-1)!;const t=ease(f,k.a+5,k.b-5),eye=point(k.eye,k.toEye??k.eye,t),look=point(k.look,k.toLook??k.look,t);return{eye,look,focus:look,fov:k.fov??40,blur:k.blur??8,id:k.id};}
