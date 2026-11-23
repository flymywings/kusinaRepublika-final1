import React from 'react';
import {Card,type PersonProps} from './Cast';
import {Pen,blobPts,headBlob,mul,thickAngle} from './lib/toon';
import {floorAt} from './story';

type P=[number,number];type V=[number,number,number];
type Role='sasaki'|'yamada'|'tayama'|'staff';
const INK='#2c1d2b',HAIR='#77414f';
export const SHARED_FACE={seed:45,width:.280,height:.264,eyeSpacing:62} as const;
export const IDENTITIES={
 sasaki:{seed:39,width:.280,height:.264,skin:'#f6ddc6',hair:'#2d323d',coat:'#6c8199',shade:'#43566e'},
 yamada:{...SHARED_FACE,skin:'#f9e3d2',hair:HAIR,coat:'#e0e3b7',shade:'#a6ad80'},
 tayama:{...SHARED_FACE,skin:'#f9e3d2',hair:HAIR,coat:'#343342',shade:'#20212d'},
 staff:{seed:31,width:.284,height:.266,skin:'#f3d9c4',hair:'#99918b',coat:'#e0e3b7',shade:'#a6ad80'},
} as const;
const outlineCache=new Map<number,P[]>();
function head(seed:number){let p=outlineCache.get(seed);if(!p){p=blobPts(0,0,headBlob(seed,118,0),72);outlineCache.set(seed,p)}return p;}
function shape(g:CanvasRenderingContext2D,fill:string|CanvasGradient,path:()=>void,w=.014){g.beginPath();path();g.closePath();g.fillStyle=fill;g.fill();if(w){g.strokeStyle=INK;g.lineWidth=w;g.stroke()}}
function line(g:CanvasRenderingContext2D,c:string,w:number,p:P[]){g.beginPath();g.moveTo(...p[0]);p.slice(1).forEach(q=>g.lineTo(...q));g.strokeStyle=c;g.lineWidth=w;g.stroke()}
function dot(g:CanvasRenderingContext2D,p:P,rx:number,ry:number,c:string,w=0){shape(g,c,()=>g.ellipse(...p,rx,ry,0,0,Math.PI*2),w)}
function curve(g:CanvasRenderingContext2D,c:string,w:number,a:P,b:P,d:P){g.beginPath();g.moveTo(...a);g.quadraticCurveTo(...b,...d);g.strokeStyle=c;g.lineWidth=w;g.stroke()}
function gradient(g:CanvasRenderingContext2D,a:string,b:string){const v=g.createLinearGradient(-.24,0,.24,0);v.addColorStop(0,a);v.addColorStop(.55,a);v.addColorStop(1,b);return v;}

// One simple facial language for every role; costume and hair carry identity.
function face(p:Pen,pose:PersonProps,gaze:number){
 if(pose.facePerformance){performanceFace(p,pose,gaze);return;}
 const mood=pose.expression??'neutral',soft=pose.softness??0;
 const happy=['soft','amused','proud'].includes(mood),shock=['flustered','alert','worried'].includes(mood),tease=mood==='teasing';
 const blink=((pose.frame??30)+19)%109<3||(pose.role==='tayama'&&(pose.frame??0)>=1078&&(pose.frame??0)<1082);
 for(const q of [-1,1]){
  const x=q*31,y=5;
  if(blink)p.stroke([[x-16,y],[x+16,y]],7,INK);
  else if(happy)p.arc(x,y+7,17,11,205,335,7,INK);
  else if(shock){p.ell(x,y+1,23,23,'#fffaf3',5);p.dot(x+gaze,y+1,6,INK);}
  else{p.ell(x+gaze*.3,y+5,15,11,INK,0,0,180);p.stroke([[x-19,y],[x+18,y]],8,INK);}
  const by=shock?-51:tease?-40+q*7*(1-soft):mood==='disappointed'?-36+q*2:-40+(mood==='tired'?4:0);
  p.poly([[x-19,by+1],[x-17,by-5],[x+17,by-2+q*2],[x+18,by+2+q*2]],INK,0);
  if(pose.role==='sasaki'&&mood==='tired')p.stroke([[x-15,25],[x+11,27]],2.5,'#ba978c');
 }
 if(happy){p.ell(0,45,22,10,'#602d36',5,0,180);p.stroke([[-16,47],[16,47]],4.5,'#fff8ed');}
 else if(shock)p.stroke([[-13,49],[12,46]],6,INK);
 else if(mood==='disappointed')p.stroke([[-12,49],[0,46],[12,49]],5,INK);
 else if(mood==='touched'&&soft<.42)p.stroke([[-10,46],[10,46]],5,INK);
 else if(mood==='touched')p.arc(1,43,15,3+soft*4,12,160,5,INK);
 else if(mood==='focused'&&(pose.talk??0)>.55)p.ell(1,47,9,3+(pose.talk??0)*4,INK,0);
 else if(mood==='tired'||mood==='focused')p.stroke([[-12,47],[13,47]],6,INK);
 else if(tease)p.stroke([[-13,47],[4,48],[15,42+soft*3]],6,INK);
 else p.arc(1,41,19,9,12,160,6,INK);
}

// Interpolate one set of ink paths; never dissolve two faces over each other.
function performanceFace(p:Pen,pose:PersonProps,gaze:number){
 const a=pose.facePerformance!,g=p.g,smile=Math.max(0,a.smile),open=a.openness*(1-a.blink)*(1-smile),shut=Math.max(smile,a.blink);
 const lerp=(x:number,y:number,t:number)=>x+(y-x)*t;
 for(const q of [-1,1]){
  const x=q*31,y=lerp(5,12,smile),w=lerp(18,23,open),height=lerp(10,23,open)*(1-shut);
  const upper=lerp(y-height*4/3*Math.max(0,(open-.5)*2),y-19,smile),lower=lerp(y+height*4/3,y-19,smile);
  g.beginPath();g.moveTo(x-w,y);g.bezierCurveTo(x-w,upper,x+w,upper,x+w,y);g.bezierCurveTo(x+w,lower,x-w,lower,x-w,y);g.closePath();g.fillStyle='#fffaf3';g.fill();
  g.save();g.clip();
  // The large ink iris fills a resting lid; only the alarmed eye exposes a white aperture.
  p.ell(x+gaze*lerp(.3,1,open),y+1,lerp(22,6,open),lerp(28,6,open),INK,0);
  g.restore();
  g.beginPath();g.moveTo(x-w,y);g.bezierCurveTo(x-w,upper,x+w,upper,x+w,y);g.bezierCurveTo(x+w,lower,x-w,lower,x-w,y);g.closePath();g.strokeStyle=INK;g.lineWidth=lerp(7,5,open);g.stroke();
  const by=lerp(-36,-51,a.brow);p.poly([[x-19,by+1],[x-17,by-5],[x+17,by-2+q*2],[x+18,by+2+q*2]],INK,0);
  if(a.fatigue>0){g.save();g.globalAlpha=a.fatigue;p.stroke([[x-15,25],[x+11,27]],2.5,'#ba978c');g.restore();}
 }
 const width=lerp(13,22,smile),cornerY=lerp(47,45,smile),bend=a.smile*10,opening=a.mouth*10+smile*6;
 g.beginPath();g.moveTo(-width,cornerY);g.quadraticCurveTo(0,cornerY+bend-opening,width,cornerY);g.quadraticCurveTo(0,cornerY+bend+opening,-width,cornerY);g.closePath();g.fillStyle='#602d36';g.fill();g.strokeStyle=INK;g.lineWidth=5;g.stroke();
 if(smile>.5){g.save();g.globalAlpha=(smile-.5)*2;p.stroke([[-16,47],[16,47]],4.5,'#fff8ed');g.restore();}
}

export function drawCastArt(g:CanvasRenderingContext2D,pose:PersonProps,contact:(v:V)=>P){
 const role=(pose.role in IDENTITIES?pose.role:'sasaki') as Role,d=IDENTITIES[role],work=role==='yamada'||role==='staff',woman=role==='yamada'||role==='tayama';
 const lean=-(pose.tilt??0),pivot=.72,lower=.50*(pose.crouch??0),bob=(pose.stride??0)*.012*Math.cos((pose.step??0)*2);
 const body=(x:number,y:number):P=>[Math.cos(lean)*x-Math.sin(lean)*(y-pivot),pivot+Math.sin(lean)*x+Math.cos(lean)*(y-pivot)-lower+bob];
 const bodySpace=()=>{g.translate(0,pivot-lower+bob);g.rotate(lean);g.translate(0,-pivot)};
 g.save();g.lineCap='round';g.lineJoin='round';
 // Fine ink limbs and restrained shoes preserve the reference's light silhouette.
 for(const q of [-1,1]){
  const hip=body(q*.109,.74),swing=(pose.stride??0)*Math.sin((pose.step??0)+(q>0?Math.PI:0)),lift=Math.max(0,swing)*.10;
  if(pose.feet){
   const sole=contact(pose.feet[q>0?1:0]),knee:P=[(hip[0]+sole[0])*.5+q*.035,(hip[1]+sole[1])*.52];
   const ankle:P=[sole[0],sole[1]+(role==='tayama'?.10:.055)];
   curve(g,role==='tayama'?'#65515d':INK,role==='tayama'?.045:.027,hip,knee,ankle);
   if(role==='tayama'){
    g.save();g.translate(sole[0]-q*.14,sole[1]-.0075);
    shape(g,'#d4e2e5',()=>{const x=q*.14;g.moveTo(x-q*.038,.18);g.lineTo(x+q*.038,.175);g.lineTo(x+q*.033,.050);g.quadraticCurveTo(x+q*.075,.030,x+q*.070,.012);g.lineTo(x-q*.035,.012);g.lineTo(x-q*.035,.050)},.009);g.restore();
   }else line(g,INK,.026,[[sole[0]-q*.03,sole[1]+.024],[sole[0]+q*.04,sole[1]+.013]]);
   continue;
  }
  curve(g,role==='tayama'?'#65515d':INK,role==='tayama'?.045:.027,hip,[q*.13-(role==='tayama'&&q>0?.018:0),.38+lift],[q*.14,.035+lift]);
  if(role==='tayama')shape(g,'#d4e2e5',()=>{const x=q*.14;g.moveTo(x-q*.038,.18+lift);g.lineTo(x+q*.038,.175+lift);g.lineTo(x+q*.033,.050+lift);g.quadraticCurveTo(x+q*.075,.030+lift,x+q*.070,.012+lift);g.lineTo(x-q*.035,.012+lift);g.lineTo(x-q*.035,.050+lift)},.009);
  else line(g,INK,.026,[[q*.14,.022+lift],[q*.19,.012+lift]]);
 }
 // Bean torso, with recognisable clothes drawn as a few clear flat shapes.
 g.save();bodySpace();
 const width=role==='sasaki'?.225:.218;
 if(role!=='tayama')shape(g,gradient(g,d.coat,d.shade),()=>{g.moveTo(-.07,1.32);g.bezierCurveTo(-.195,1.31,-width,1.16,-width,.88);g.bezierCurveTo(-width,.66,-.13,.66,0,.66);g.bezierCurveTo(.13,.66,width,.66,width,.88);g.bezierCurveTo(width,1.16,.195,1.31,.07,1.32)},.019);
 if(role==='sasaki'){
  shape(g,'#f5f1e6',()=>{g.moveTo(-.095,1.305);g.lineTo(.095,1.305);g.lineTo(.025,.91);g.lineTo(-.026,.91)},.008);
  shape(g,'#843f4c',()=>{g.moveTo(-.022,1.235);g.lineTo(.018,1.235);g.lineTo(.035,.97);g.lineTo(.005,.93);g.lineTo(-.028,.97)},.006);
  for(const q of [-1,1])line(g,'#3d526b',.010,[[q*.12,1.27],[q*.16,1.15],[q*.07,1.03],[q*.02,.91]]);
  line(g,'#465b73',.008,[[-.17,.85],[-.07,.85]]);dot(g,[.012,.82],.009,.009,'#354352');
 }else if(work){
  shape(g,'#b94d57',()=>{g.moveTo(-.13,1.17);g.quadraticCurveTo(0,1.13,.13,1.17);g.lineTo(.205,.41);g.quadraticCurveTo(0,.39,-.205,.41)},.012);
  for(const q of [-1,1])line(g,'#303139',.022,[[q*.116,1.17],[q*.120,1.305]]);
  line(g,'#333039',.019,[[-.177,.82],[.177,.82]]);
  for(const q of [-1,1])shape(g,'#ececc7',()=>{g.moveTo(q*.010,1.30);g.lineTo(q*.069,1.32);g.lineTo(q*.094,1.24);g.lineTo(q*.045,1.21)},.006);
  shape(g,'#e5eee7',()=>g.rect(.064,1.095,.076,.052),.005);line(g,'#638896',.007,[[.074,1.126],[.130,1.126]]);
  line(g,'#963b48',.006,[[-.115,.68],[.115,.68],[.105,.58],[-.105,.58]]);
 }else{
  // The full-body source is a single fitted dress, cinched at the waist, not a flared skirt.
  shape(g,gradient(g,'#d5e1e3','#b3c5cb'),()=>{g.moveTo(-.07,1.31);g.lineTo(.07,1.31);g.quadraticCurveTo(.18,1.21,.155,.81);g.bezierCurveTo(.16,.75,.218,.71,.215,.59);g.lineTo(.193,.48);g.quadraticCurveTo(0,.465,-.193,.48);g.lineTo(-.215,.59);g.bezierCurveTo(-.218,.71,-.16,.75,-.155,.81);g.quadraticCurveTo(-.18,1.21,-.07,1.31)},.012);
  for(const q of [-1,1]){
   shape(g,gradient(g,'#343544','#1f2331'),()=>{g.moveTo(q*.068,1.315);g.quadraticCurveTo(q*.223,1.32,q*.245,1.17);g.lineTo(q*.215,.85);g.lineTo(q*.13,.84);g.lineTo(q*.09,1.08)},.011);
   // Broad notched lapels, shoulder tabs and small metal snaps identify the leather jacket.
   shape(g,'#3e4051',()=>{g.moveTo(q*.075,1.30);g.lineTo(q*.175,1.255);g.lineTo(q*.135,1.185);g.lineTo(q*.163,1.16);g.lineTo(q*.095,1.06)},.006);
   line(g,'#7a7d89',.005,[[q*.11,1.30],[q*.20,1.285]]);
   dot(g,[q*.16,1.245],.006,.006,'#adb3b7');dot(g,[q*.145,1.17],.005,.005,'#a9b0b4');
   line(g,'#969ba5',.005,[[q*.123,1.04],[q*.144,.86]]);
  }
  curve(g,'#93aab1',.007,[-.07,1.23],[.01,1.18],[.09,1.23]);
  shape(g,'#aebfc5',()=>{g.moveTo(-.045,1.08);g.lineTo(.065,.87);g.lineTo(-.012,.92)},0);
  line(g,'#91a6ad',.006,[[-.11,.66],[-.025,.62],[.025,.59]]);
  line(g,'#292631',.032,[[-.165,.805],[.165,.805]]);
  shape(g,'#bca46a',()=>g.rect(-.032,.777,.09,.060),.007);shape(g,'#34313a',()=>g.rect(-.017,.790,.060,.034),0);
  // A tiny skin gap and black band, rather than a separate anatomical neck.
  shape(g,d.skin,()=>g.rect(-.073,1.25,.146,.085),0);line(g,'#262630',.023,[[-.073,1.284],[.073,1.284]]);
  shape(g,'#b8a16a',()=>g.rect(-.012,1.271,.029,.026),.004);shape(g,'#292733',()=>g.rect(-.004,1.278,.013,.012),0);
 }
 g.restore();
 // Arms use the side of their projected target, maintaining clean connected silhouettes.
 const targets=[pose.hand,pose.otherHand].filter(Boolean).map(v=>contact(v!)).sort((a,b)=>a[0]-b[0]);
 const screenHands:Partial<Record<-1|1,P>>=targets.length===1?{[targets[0][0]<0?-1:1]:targets[0]}:{[-1]:targets[0],[1]:targets[1]};
 for(const q of [-1,1]){
  const shoulder=body(q*.15,1.22),hand=screenHands[q as -1|1]??(role==='tayama'?body(q<0?-.33:.27,q<0?1.19:.90):body(q*.30,.86));
  const elbow:P=[(shoulder[0]+hand[0])*.5+q*.055,(shoulder[1]+hand[1])*.5-.065];
  curve(g,INK,role==='tayama'?.057:.027,shoulder,elbow,hand);
  if(role==='tayama'){curve(g,'#303340',.039,shoulder,elbow,hand);const cuff:P=[hand[0]*.94+elbow[0]*.06,hand[1]*.94+elbow[1]*.06];line(g,'#666775',.043,[cuff,hand]);}
  dot(g,hand,.025,.025,INK);
 }
 if(role==='tayama'){
  const hand=pose.hand?contact(pose.hand):body(-.33,1.19);
  line(g,'#f1e8da',.012,[[hand[0]-.015,hand[1]+.005],[hand[0]-.151,hand[1]+.030]]);
  line(g,'#b48d61',.012,[[hand[0]-.015,hand[1]+.005],[hand[0]-.041,hand[1]+.010]]);
  line(g,(pose.frame??30)>=671?'#c78458':'#8a817a',.012,[[hand[0]-.143,hand[1]+.028],[hand[0]-.155,hand[1]+.031]]);
 }
 if(role==='sasaki'&&(pose.crouch??0)<.1){
  const hand=pose.otherHand?contact(pose.otherHand):body(-.30,.86),[x,y]=hand;
  shape(g,'#303440',()=>g.rect(x-.145,y-.405,.29,.335),.013);
  line(g,'#56606b',.006,[[x-.115,y-.12],[x+.115,y-.12],[x+.115,y-.37],[x-.115,y-.37],[x-.115,y-.12]]);
  line(g,INK,.014,[[x-.047,y-.070],[x-.047,y-.018],[x+.047,y-.018],[x+.047,y-.070]]);
  shape(g,'#b2afa2',()=>g.rect(x-.015,y-.145,.03,.025),.003);
  dot(g,hand,.025,.025,INK);
 }
 // The same fixed head construction is used for Yamada and Tayama.
 const hc=body(0,1.59),hw=d.width,hh=d.height,points=head(d.seed);
 g.save();g.translate(...hc);g.rotate(lean+(pose.headTilt??0));
 if(woman&&role!=='tayama'){
  shape(g,d.hair,()=>{g.moveTo(-.273,.17);g.bezierCurveTo(-.325,-.10,-.306,-.31,-.24,-.34);g.lineTo(-.185,-.17);g.quadraticCurveTo(0,-.09,.185,-.17);g.lineTo(.24,-.34);g.bezierCurveTo(.306,-.31,.325,-.10,.273,.17);g.quadraticCurveTo(0,.36,-.273,.17)},.012);
 }
 if(role==='tayama'){
  // Low nape tie with a small fanned tail; the exposed ear is not hidden inside a bob.
  shape(g,d.hair,()=>{g.moveTo(-.24,-.09);g.bezierCurveTo(-.32,-.08,-.39,-.13,-.372,-.20);g.quadraticCurveTo(-.36,-.27,-.285,-.25);g.lineTo(-.235,-.19)},.010);
  shape(g,d.hair,()=>{g.moveTo(-.31,-.12);g.quadraticCurveTo(-.38,-.10,-.416,-.16);g.lineTo(-.357,-.15);g.quadraticCurveTo(-.39,-.18,-.405,-.22);g.lineTo(-.34,-.20)},.006);
  curve(g,'#a36a78',.005,[-.27,-.12],[-.345,-.12],[-.355,-.20]);
  line(g,'#29232f',.014,[[-.275,-.12],[-.26,-.20]]);
 }
 g.save();g.scale(hw/118,-hh/118);const pen=new Pen(g);pen.shadedFill(points,d.skin,mul(d.skin,[.96,.86,.84]),-2.1,118);pen.inkRing(points,11.5,thickAngle(-2.1),.45,INK);g.restore();
 const gaze=pose.gaze?Math.max(-5,Math.min(5,contact(pose.gaze)[0]*18)):0;
 if(role==='tayama'){g.save();g.scale(hw/118,-hh/118);face(new Pen(g),pose,gaze);g.restore();}
 g.save();g.beginPath();points.forEach(([x,y],i)=>{const p:P=[x*hw/118,-y*hh/118];if(i)g.lineTo(...p);else g.moveTo(...p)});g.closePath();g.clip();
 if(role==='sasaki'){
  shape(g,d.hair,()=>{g.moveTo(-.31,.035);g.lineTo(-.275,.23);g.quadraticCurveTo(-.06,.34,.25,.235);g.lineTo(.29,.02);g.lineTo(.19,.16);g.quadraticCurveTo(-.01,.09,-.31,.035)},0);
  for(const q of [-1,1])line(g,'#9aa0a4',.016,[[q*.255,.065],[q*.23,.16],[q*.185,.19]]);
  curve(g,'#646a73',.008,[-.19,.205],[-.02,.277],[.15,.235]);
 }else if(role==='tayama'){
  // Tayama's complete crown is painted outside this face clip below, avoiding a false headband seam.
 }else{
  shape(g,d.hair,()=>{g.moveTo(-.31,.025);g.lineTo(-.275,.25);g.quadraticCurveTo(0,.34,.29,.24);g.lineTo(.30,.065);g.bezierCurveTo(.13,.06,-.035,.155,-.13,.23);g.quadraticCurveTo(-.19,.09,-.31,.025)},0);
  if(role==='yamada')curve(g,'#b5757c',.009,[-.125,.242],[.035,.145],[.215,.095]);
 }
 g.restore();
 if(role==='tayama'){
  // One tucked/exposed ear; the selected detail image supplies the gold cuff and hanging bars.
  dot(g,[-.281,-.024],.031,.068,d.skin,.007);
  curve(g,'#b58a88',.004,[-.285,.017],[-.264,-.010],[-.282,-.052]);
  // Long tapered front locks fall past the jaw to the collar; avoid a shoulder-length bob.
  for(const q of [-1,1]){
   shape(g,d.hair,()=>{g.moveTo(q*.258,.12);g.bezierCurveTo(q*.287,-.05,q*.294,-.25,q*.232,-.455);g.quadraticCurveTo(q*.214,-.478,q*.196,-.440);g.bezierCurveTo(q*.250,-.24,q*.237,-.02,q*.220,.09)},.009);
   curve(g,'#a06575',.005,[q*.260,.025],[q*.274,-.20],[q*.219,-.410]);
  }
  // One smooth outer crown; the low clumped fringe covers brows but leaves the lidded eyes readable.
  shape(g,gradient(g,d.hair,'#5b3546'),()=>{g.moveTo(-.303,.070);g.bezierCurveTo(-.33,.235,-.185,.305,0,.305);g.bezierCurveTo(.185,.305,.33,.235,.303,.060);g.quadraticCurveTo(.26,.020,.23,.018);g.quadraticCurveTo(.19,-.010,.15,.013);g.quadraticCurveTo(.115,-.004,.08,.018);g.quadraticCurveTo(.05,-.002,.015,.020);g.quadraticCurveTo(-.03,-.006,-.065,.015);g.quadraticCurveTo(-.11,-.012,-.15,.018);g.quadraticCurveTo(-.20,0,-.235,.024);g.quadraticCurveTo(-.27,.035,-.303,.070)},.009);
  for(const x of [-.19,-.09,.02,.13,.22])curve(g,'#9e6373',.005,[x*.82,.25],[x,.14],[x*.94,.035]);
  curve(g,'#9b6070',.011,[-.21,.225],[-.015,.274],[.18,.233]);
  curve(g,'#c0a865',.009,[-.304,.050],[-.307,.085],[-.285,.074]);
  dot(g,[-.292,-.054],.006,.006,'#c5ad6e',.002);
  for(const [x,y,len] of [[-.292,-.073,.103],[-.311,-.078,.091]]){
   line(g,'#c8ad62',.006,[[x,-.057],[x,y]]);
   shape(g,'#baa05b',()=>g.rect(x-.004,y-len,.009,len),.002);
   line(g,'#e0c984',.002,[[x-.002,y-.009],[x-.002,y-len+.005]]);
  }
 }
 if(work){
  shape(g,'#bb505b',()=>{g.moveTo(-.32,.17);g.lineTo(-.245,.305);g.quadraticCurveTo(0,.37,.245,.305);g.lineTo(.32,.17);g.lineTo(.255,.185);g.quadraticCurveTo(0,.29,-.255,.185)},.011);
  curve(g,'#db8588',.008,[-.235,.288],[0,.345],[.235,.288]);
 }
 if(role==='yamada')for(const y of [.055,.080])line(g,'#28242f',.012,[[.157,y],[.230,y+.025]]);
 if(role!=='tayama'){g.save();g.scale(hw/118,-hh/118);face(new Pen(g),pose,gaze);g.restore();}g.restore();g.restore();
}

export function Person(pose:PersonProps){return <Card position={pose.position} scale={pose.scale??1} facing={0} feet={pose.feet} footGround={pose.feet?.map(floorAt) as [number,number]|undefined} shadow={pose.shadow} shadowDirection={pose.shadowDirection} paint={(g,_yaw,contact)=>drawCastArt(g,pose,contact)}/>;}
