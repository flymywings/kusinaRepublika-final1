import {Pen,blobPts,headBlob,mul,thickAngle} from '../supermarket-after-hours/lib/toon';

export type Role='rintaro'|'kaoruko';
export type Mood='neutral'|'worried'|'flustered'|'soft';
export const HEIGHTS={rintaro:190,kaoruko:148} as const;
export const PALETTES={
 rintaro:{skin:'#f5dac0',hair:'#d9bf89',hairShade:'#b69b6a',coat:'#303137',shirt:'#f5f2e9',lower:'#292b31',shoe:'#25272d',metal:'#bfc5cd',button:'#ccb065',iris:'#514b40'},
 kaoruko:{skin:'#f9e3d3',hair:'#34303e',hairShade:'#24222e',coat:'#b97d8e',shirt:'#f5f0ed',lower:'#b97d8e',shoe:'#62443c',metal:'#b6b8bc',button:'#534651',iris:'#6288ad'}
} as const;
type P=[number,number];
const INK='#2c1d2b',LIGHT=-2.1;
const heads={rintaro:blobPts(0,0,headBlob(63,118,0),72),kaoruko:blobPts(0,0,headBlob(71,118,0),72)};
function shape(g:CanvasRenderingContext2D,c:string,path:()=>void,w=.012){g.beginPath();path();g.closePath();g.fillStyle=c;g.fill();if(w){g.strokeStyle=INK;g.lineWidth=w;g.stroke();}}
function line(g:CanvasRenderingContext2D,c:string,w:number,pts:P[]){g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1))g.lineTo(...p);g.strokeStyle=c;g.lineWidth=w;g.stroke();}
function curve(g:CanvasRenderingContext2D,c:string,w:number,a:P,b:P,d:P){g.beginPath();g.moveTo(...a);g.quadraticCurveTo(...b,...d);g.strokeStyle=c;g.lineWidth=w;g.stroke();}
function dot(g:CanvasRenderingContext2D,c:string,x:number,y:number,rx:number,ry=rx,w=0){shape(g,c,()=>g.ellipse(x,y,rx,ry,0,0,Math.PI*2),w);}

// Coordinates follow the approved bean-head cast, including its sparse lidded/shock eyes.
function face(p:Pen,role:Role,mood:Mood,frame:number){
 const shock=mood==='worried'||mood==='flustered',happy=mood==='soft',blink=((frame+19)%109+109)%109<3;
 for(const q of [-1,1]){
  const x=q*31,y=5;
  if(blink)p.stroke([[x-16,y],[x+16,y]],7,INK);
  else if(happy)p.arc(x,y+7,17,11,205,335,7,INK);
  else if(shock){p.ell(x,y+1,23,23,'#fffaf3',5);if(role==='kaoruko')p.dot(x,y+1,9,PALETTES.kaoruko.iris);p.dot(x,y+1,role==='kaoruko'?4.5:6,INK);}
  else if(role==='kaoruko'){p.ell(x,y+3,17,13,'#fffaf3',4);p.dot(x,y+4,6.5,PALETTES.kaoruko.iris);p.dot(x,y+4,3.5,INK);p.stroke([[x-17,y-5],[x+17,y-5]],4,INK);}
  else{p.ell(x,y+5,15,11,INK,0,0,180);p.stroke([[x-19,y],[x+18,y]],8,INK);}
  const by=shock?-51:-40,tilt=mood==='worried'?q*7:0;
  p.poly([[x-19,by+1+tilt],[x-17,by-5+tilt],[x+17,by-2-tilt],[x+18,by+2-tilt]],INK,0);
 }
 if(happy){p.arc(0,41,20,10,12,168,6,INK);}
 else if(mood==='flustered')p.stroke([[-13,49],[12,46]],6,INK);
 else if(mood==='worried')p.stroke([[-12,49],[0,46],[12,49]],5,INK);
 else if(role==='kaoruko')p.arc(0,43,15,5,12,168,5,INK);
 else p.stroke([[-12,47],[13,47]],6,INK);
}

/** Front-facing production art in world metres, y-up, both soles at y=0.
 * School identity study only; cafe wardrobe needs its own verified costume data.
 * Cake pose exposes two hands at the same height; the scene supplies the cake.
 */
export function drawCharacter(g:CanvasRenderingContext2D,options:{role:Role;mood?:Mood;frame?:number;outfit?:'school';handPose?:'rest'|'cake'}){
 const {role,mood='neutral',frame=30,handPose='rest'}=options,d=PALETTES[role],girl=role==='kaoruko',cake=handPose==='cake';
 const hc=girl?1.25:1.63,hw=girl?.215:.235,hh=girl?.203:.221;
 const shoulder=girl?1.02:1.34,hip=girl?.68:.80;
 g.save();g.lineJoin='round';g.lineCap='round';
 // Kaoruko's waist-length-plus waves sit behind the body, rather than forming a bob.
 if(girl){
  shape(g,d.hair,()=>{g.moveTo(-.224,1.32);g.bezierCurveTo(-.31,1.18,-.25,1.06,-.302,.93);g.bezierCurveTo(-.38,.77,-.25,.75,-.31,.61);g.quadraticCurveTo(-.34,.53,-.255,.56);g.quadraticCurveTo(-.19,.52,-.16,.59);g.quadraticCurveTo(0,.49,.18,.56);g.quadraticCurveTo(.29,.50,.32,.58);g.quadraticCurveTo(.25,.55,.285,.70);g.bezierCurveTo(.37,.88,.265,.95,.285,1.08);g.quadraticCurveTo(.28,1.27,.224,1.34);g.quadraticCurveTo(0,1.48,-.224,1.32)},.012);
  for(const q of [-1,1])curve(g,'#514958',.007,[q*.20,1.28],[q*.32,.86],[q*.22,.60]);
 }
 if(!girl){
  shape(g,'#705346',()=>g.roundRect(-.256,.91,.105,.34,.018),.009);
  line(g,'#aa8970',.004,[[-.246,1.20],[-.246,.95],[-.174,.95]]);
 }
 // Light, narrow limbs carry the accepted silhouette; shoes have grounded flat soles.
 for(const q of [-1,1]){
  const x=q*(girl?.085:.105),ankle=q*(girl?.094:.125);
  curve(g,INK,girl?.045:.047,[x,hip],[x+q*.012,.36],[ankle,.067]);
  if(girl)curve(g,'#4e4249',.032,[x,.46],[x,.26],[ankle,.069]);
  shape(g,d.shoe,()=>{g.moveTo(ankle-.035,.076);g.quadraticCurveTo(ankle,.086,ankle+.035,.067);g.lineTo(ankle+.044,.019);g.lineTo(ankle-.049,.005);g.quadraticCurveTo(ankle-.065,.017,ankle-.035,.076)},.010);
  if(girl)line(g,'#947062',.006,[[ankle-.029,.050],[ankle+.029,.054]]);
 }
 // The bean body is costume-led: open stand collar versus broad sailor collar.
 if(!girl){
  shape(g,d.coat,()=>{g.moveTo(-.064,1.395);g.bezierCurveTo(-.18,1.37,-.215,1.25,-.213,1.01);g.quadraticCurveTo(-.23,.76,-.16,.75);g.lineTo(-.045,.82);g.lineTo(.045,.82);g.lineTo(.17,.75);g.quadraticCurveTo(.23,.78,.213,1.01);g.bezierCurveTo(.215,1.25,.18,1.37,.064,1.395)},.016);
  shape(g,d.shirt,()=>{g.moveTo(-.067,1.39);g.lineTo(.070,1.39);g.lineTo(.072,.78);g.lineTo(.004,.80);g.lineTo(-.067,.78)},.006);
  line(g,'#bfbcb5',.005,[[.008,1.31],[.012,.84]]);
  for(const q of [-1,1])shape(g,d.coat,()=>{g.moveTo(q*.035,1.39);g.lineTo(q*.070,1.425);g.lineTo(q*.111,1.389);g.lineTo(q*.090,1.31);g.lineTo(q*.074,.86);g.lineTo(q*.041,.83)},.008);
  for(const y of [1.302,1.18,1.055,.93,.815])dot(g,d.button,-.079,y,.010,.012,.002);
  line(g,'#181b23',.007,[[.112,1.17],[.185,1.17]]);
  curve(g,'#33272b',.033,[-.177,1.366],[-.219,1.19],[-.211,.983]);
  curve(g,'#85634c',.021,[-.177,1.366],[-.219,1.19],[-.211,.983]);
  line(g,'#b29a80',.003,[[-.178,1.343],[-.204,1.15],[-.205,1.025]]);
 }else{
  shape(g,d.coat,()=>{g.moveTo(-.061,1.077);g.bezierCurveTo(-.19,1.06,-.18,.91,-.168,.75);g.quadraticCurveTo(0,.67,.168,.75);g.bezierCurveTo(.18,.91,.19,1.06,.061,1.077)},.013);
  shape(g,d.lower,()=>{g.moveTo(-.135,.75);g.lineTo(.135,.75);g.lineTo(.231,.427);g.quadraticCurveTo(0,.36,-.231,.427)},.012);
  for(const x of [-.15,-.075,0,.075,.15])line(g,'#9e6678',.006,[[x*.65,.71],[x,.416]]);
  curve(g,'#654451',.009,[-.215,.445],[0,.39],[.215,.445]);
  shape(g,d.shirt,()=>{g.moveTo(-.074,1.09);g.lineTo(-.205,1.019);g.lineTo(0,.882);g.lineTo(.205,1.019);g.lineTo(.074,1.09);g.lineTo(0,.971)},.008);
  line(g,'#65606a',.005,[[-.183,1.014],[0,.902],[.183,1.014]]);
  for(const q of [-1,1])shape(g,'#38303b',()=>{g.moveTo(0,.886);g.quadraticCurveTo(q*.078,.899,q*.068,.846);g.quadraticCurveTo(q*.025,.843,0,.886)},.004);
  line(g,'#38303b',.012,[[0,.885],[-.020,.819]]);line(g,'#38303b',.012,[[0,.885],[.029,.829]]);
  for(const x of [-.118,.118])dot(g,d.button,x,.959,.007);
 }
 // Tiny neck join, always behind the head.
 shape(g,d.skin,()=>g.rect(-.050,hc-hh-.025,.10,.10),.005);
 for(const q of [-1,1]){
  const hand:P=cake?[q*.13,girl?.795:1.03]:girl?[q*.055,.644]:[q*.286,.845];
  const elbow:P=cake?[q*.245,girl?.84:1.045]:girl?[q*.18,.73]:[q*.27,1.065];
  curve(g,INK,girl?.034:.030,[q*(girl?.155:.174),shoulder],elbow,hand);
  if(girl)curve(g,d.coat,.021,[q*.155,shoulder],elbow,hand);
  dot(g,INK,hand[0],hand[1],.023);
 }
 // Her brown school satchel is held low; cake pose keeps the hands available.
 if(girl&&!cake){
  line(g,INK,.013,[[-.061,.627],[-.055,.656],[.055,.656],[.061,.627]]);
  shape(g,'#754e46',()=>g.roundRect(-.180,.415,.36,.212,.016),.011);
  shape(g,'#80594e',()=>g.roundRect(-.181,.531,.362,.098,.012),.008);
  for(const x of [-.119,.119])line(g,'#523c39',.018,[[x,.565],[x,.448]]);
  shape(g,'#b7b7bc',()=>g.rect(-.018,.514,.036,.029),.003);
 }
 // Exposed ears precede the shared bean head; jewellery is added after the crown.
 if(!girl)for(const q of [-1,1])dot(g,d.skin,q*.235,hc-.025,.030,.052,.007);
 g.save();g.translate(0,hc);g.scale(hw/118,-hh/118);
 const p=new Pen(g),points=heads[role];p.shadedFill(points,d.skin,mul(d.skin,[.96,.86,.84]),LIGHT,118);p.inkRing(points,11.5,thickAngle(LIGHT),.45,INK);face(p,role,mood,frame);g.restore();
 if(!girl){
  // Short swept-back spikes leave a broad forehead; no fringe across the eyebrows.
  shape(g,d.hair,()=>{g.moveTo(-.239,hc+.015);g.lineTo(-.265,1.77);g.lineTo(-.218,1.756);g.lineTo(-.279,1.813);g.lineTo(-.194,1.797);g.lineTo(-.226,1.857);g.lineTo(-.144,1.824);g.lineTo(-.154,1.884);g.lineTo(-.070,1.848);g.lineTo(-.025,1.894);g.lineTo(-.024,1.849);g.lineTo(.069,1.891);g.lineTo(.051,1.848);g.lineTo(.169,1.871);g.lineTo(.129,1.824);g.lineTo(.251,1.833);g.lineTo(.199,1.781);g.lineTo(.264,1.776);g.lineTo(.234,hc+.012);g.lineTo(.195,hc+.113);g.quadraticCurveTo(.06,hc+.17,-.065,hc+.152);g.quadraticCurveTo(-.18,hc+.148,-.204,hc+.085)},.010);
  for(const q of [-1,1])curve(g,d.hairShade,.006,[q*.194,1.752],[q*.128,1.827],[q*.054,1.855]);
  for(const q of [-1,1]){dot(g,d.metal,q*.245,hc-.047,.006,.006,.002);g.beginPath();g.ellipse(q*.246,hc-.071,.012,.018,0,0,Math.PI*2);g.strokeStyle=d.metal;g.lineWidth=.006;g.stroke();}
 }else{
  // A connected, overlapping fringe covers the forehead; small lower gaps separate soft tapered locks.
  shape(g,d.hair,()=>{
   g.moveTo(-.233,1.245);g.bezierCurveTo(-.268,1.405,-.142,1.474,0,1.474);g.bezierCurveTo(.145,1.474,.266,1.405,.233,1.245);
   g.quadraticCurveTo(.193,1.279,.170,1.355);g.quadraticCurveTo(.175,1.300,.195,1.267);
   g.quadraticCurveTo(.151,1.278,.132,1.323);g.quadraticCurveTo(.138,1.287,.153,1.264);
   g.quadraticCurveTo(.111,1.275,.095,1.312);g.quadraticCurveTo(.099,1.282,.112,1.265);
   g.quadraticCurveTo(.072,1.268,.055,1.323);g.quadraticCurveTo(.060,1.288,.078,1.266);
   g.quadraticCurveTo(.035,1.273,.015,1.316);g.quadraticCurveTo(.020,1.287,.036,1.269);
   g.quadraticCurveTo(-.006,1.276,-.020,1.321);g.quadraticCurveTo(-.011,1.291,-.005,1.270);
   g.quadraticCurveTo(-.040,1.272,-.057,1.316);g.quadraticCurveTo(-.057,1.290,-.044,1.267);
   g.quadraticCurveTo(-.080,1.282,-.096,1.328);g.quadraticCurveTo(-.090,1.290,-.084,1.273);
   g.quadraticCurveTo(-.120,1.275,-.137,1.333);g.quadraticCurveTo(-.141,1.295,-.132,1.277);
   g.quadraticCurveTo(-.183,1.282,-.182,1.342);g.quadraticCurveTo(-.195,1.300,-.233,1.245);
  },.009);
  curve(g,'#1f1d27',.011,[-.137,1.413],[0,1.478],[.137,1.413]);
  for(const [x,end] of [[-.145,1.310],[-.098,1.304],[-.047,1.300],[.008,1.306],[.059,1.299],[.112,1.311]])curve(g,'#4c4557',.003,[x*.72,1.425],[x-.010,1.355],[x+.011,end]);
  for(const q of [-1,1]){
   shape(g,d.hair,()=>{g.moveTo(q*.185,1.351);g.quadraticCurveTo(q*.27,1.195,q*.205,1.041);g.quadraticCurveTo(q*.165,.98,q*.147,1.012);g.quadraticCurveTo(q*.222,1.14,q*.167,1.30)},.007);
   curve(g,'#554c60',.005,[q*.204,1.32],[q*.231,1.16],[q*.166,1.033]);
  }
 }
 g.restore();
}
