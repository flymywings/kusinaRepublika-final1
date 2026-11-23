import {Pen,blobPts,headBlob,mul,thickAngle} from '../../../../pipeline/kit/v1/look/toon';

export type Role='rintaro'|'kaoruko';
export type Mood='neutral'|'worried'|'flustered'|'soft';
export const HEIGHTS={rintaro:190,kaoruko:148} as const;
export const PALETTES={
 rintaro:{skin:'#f5dac0',hair:'#d9bf89',coat:'#303137',shirt:'#f5f2e9',lower:'#292b31',shoe:'#25272d',metal:'#bfc5cd',button:'#ccb065',iris:'#514b40'},
 kaoruko:{skin:'#f9e3d3',hair:'#34303e',hairShade:'#24222e',coat:'#b97d8e',shirt:'#f5f0ed',lower:'#b97d8e',shoe:'#62443c',metal:'#b6b8bc',button:'#534651',iris:'#6288ad'}
} as const;
type P=[number,number];
const INK='#2c1d2b',LIGHT=-2.1;
const heads={
 rintaro:blobPts(0,0,headBlob(63,118,0),72),
 kaoruko:blobPts(0,0,headBlob(71,118,0),72)
};
function shape(g:CanvasRenderingContext2D,c:string,path:()=>void,w=.012){g.beginPath();path();g.closePath();g.fillStyle=c;g.fill();if(w){g.strokeStyle=INK;g.lineWidth=w;g.stroke();}}
function line(g:CanvasRenderingContext2D,c:string,w:number,pts:P[]){g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1))g.lineTo(...p);g.strokeStyle=c;g.lineWidth=w;g.stroke();}
function curve(g:CanvasRenderingContext2D,c:string,w:number,a:P,b:P,d:P){g.beginPath();g.moveTo(...a);g.quadraticCurveTo(...b,...d);g.strokeStyle=c;g.lineWidth=w;g.stroke();}
function dot(g:CanvasRenderingContext2D,c:string,x:number,y:number,rx:number,ry=rx,w=0){shape(g,c,()=>g.ellipse(x,y,rx,ry,0,0,Math.PI*2),w);}

function drawNeck(g:CanvasRenderingContext2D,skin:string,jawY:number,role:Role){
 const girl=role==='kaoruko';
 const jawWidth=girl?.052:.060;
 const collarWidth=girl?.064:.058;
 const collarY=girl?1.072:1.392;
 const dipY=girl?1.006:1.343;
 shape(g,mul(skin,[.98,.92,.87]),()=>{
  g.moveTo(-jawWidth,jawY+.047);
  g.bezierCurveTo(-jawWidth*.68,jawY+.012,-jawWidth*.57,collarY+.015,-collarWidth,collarY);
  g.quadraticCurveTo(-collarWidth*.31,dipY,0,dipY);
  g.quadraticCurveTo(collarWidth*.31,dipY,collarWidth,collarY);
  g.bezierCurveTo(jawWidth*.57,collarY+.015,jawWidth*.68,jawY+.012,jawWidth,jawY+.047);
 },.005);
}

// Coordinates follow the approved bean-head cast, including its sparse lidded/shock eyes.
function face(p:Pen,role:Role,mood:Mood,frame:number){
 const shock=mood==='worried'||mood==='flustered',happy=mood==='soft',blink=((frame+19)%109+109)%109<3;
 const attentive=role==='kaoruko'&&mood==='neutral';
 for(const q of [-1,1]){
  const x=q*31,y=5;
  if(blink)p.stroke([[x-16,y],[x+16,y]],7,INK);
  else if(happy)p.arc(x,y+7,17,11,205,335,7,INK);
  else if(shock){p.ell(x,y+1,23,23,'#fffaf3',5);if(role==='kaoruko')p.dot(x,y+1,9,PALETTES.kaoruko.iris);p.dot(x,y+1,role==='kaoruko'?4.5:6,INK);}
  else if(role==='kaoruko'){
   const eyeY=y+11;
   const outer:P=[x+q*18,eyeY-2];
   const upper=()=>p.g.bezierCurveTo(x+q*14,eyeY-17,x-q*12,eyeY-20,x-q*18,eyeY);
   shape(p.g,'#fffaf3',()=>{
    p.g.moveTo(...outer);
    upper();
    p.g.quadraticCurveTo(x-q*20,eyeY+4,x-q*16,eyeY+7);
    p.g.bezierCurveTo(x-q*7,eyeY+18,x+q*16,eyeY+11,...outer);
   },3);
   p.g.beginPath();
   p.g.moveTo(...outer);
   upper();
   p.g.lineWidth=4.5;
   p.g.strokeStyle=INK;
   p.g.stroke();
   p.dot(x,eyeY-1,9,PALETTES.kaoruko.iris);
   p.dot(x,eyeY-1,4.6,INK);
   p.dot(x-2,eyeY-3,1.7,'#fffaf3');
  }
  else{p.ell(x,y+5,15,11,INK,0,0,180);p.stroke([[x-19,y],[x+18,y]],8,INK);}
  if(!attentive){
   const by=shock?-51:-40,tilt=mood==='worried'?q*7:0;
   p.poly([[x-19,by+1+tilt],[x-17,by-5+tilt],[x+17,by-2-tilt],[x+18,by+2-tilt]],INK,0);
  }
 }
 if(happy){p.arc(0,41,20,10,12,168,6,INK);}
 else if(mood==='flustered')p.stroke([[-13,49],[12,46]],6,INK);
 else if(mood==='worried')p.stroke([[-12,49],[0,46],[12,49]],5,INK);
 else if(role==='kaoruko')curve(p.g,INK,4.5,[-12,48],[0,55],[13,46]);
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
  drawNeck(g,d.skin,hc-hh,role);
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
  drawNeck(g,d.skin,hc-hh,role);
  line(g,'#65606a',.005,[[-.183,1.014],[0,.902],[.183,1.014]]);
  for(const q of [-1,1])shape(g,'#38303b',()=>{g.moveTo(0,.886);g.quadraticCurveTo(q*.078,.899,q*.068,.846);g.quadraticCurveTo(q*.025,.843,0,.886)},.004);
  line(g,'#38303b',.012,[[0,.885],[-.020,.819]]);line(g,'#38303b',.012,[[0,.885],[.029,.829]]);
  for(const x of [-.118,.118])dot(g,d.button,x,.959,.007);
 }
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
 const p=new Pen(g),points=heads[role];
 p.shadedFill(points,d.skin,mul(d.skin,[.96,.86,.84]),LIGHT,118);
 p.inkRing(points,girl?11.5:5.5,thickAngle(LIGHT),girl?.45:.26,INK);
 face(p,role,mood,frame);g.restore();
 if(!girl){
  // Short swept-back spikes leave a broad forehead; no fringe across the eyebrows.
  shape(g,d.hair,()=>{g.moveTo(-.239,hc+.015);g.lineTo(-.265,1.77);g.lineTo(-.218,1.756);g.lineTo(-.279,1.813);g.lineTo(-.194,1.797);g.lineTo(-.226,1.857);g.lineTo(-.144,1.824);g.lineTo(-.154,1.884);g.lineTo(-.070,1.848);g.lineTo(-.025,1.894);g.lineTo(-.024,1.849);g.lineTo(.069,1.891);g.lineTo(.051,1.848);g.lineTo(.169,1.871);g.lineTo(.129,1.824);g.lineTo(.251,1.833);g.lineTo(.199,1.781);g.lineTo(.264,1.776);g.lineTo(.234,hc+.012);g.lineTo(.195,hc+.113);g.quadraticCurveTo(.06,hc+.17,-.065,hc+.152);g.quadraticCurveTo(-.18,hc+.148,-.204,hc+.085)},.010);
  for(const q of [-1,1]){dot(g,d.metal,q*.245,hc-.047,.006,.006,.002);g.beginPath();g.ellipse(q*.246,hc-.071,.012,.018,0,0,Math.PI*2);g.strokeStyle=d.metal;g.lineWidth=.006;g.stroke();}
 }else{
  // The fringe parts just left of centre. The longer locks arc across the forehead to screen right.
  shape(g,d.hair,()=>{
   g.moveTo(-.233,1.245);g.bezierCurveTo(-.268,1.405,-.142,1.474,0,1.474);g.bezierCurveTo(.145,1.474,.266,1.405,.233,1.245);
   g.bezierCurveTo(.204,1.260,.171,1.293,.149,1.340);
   g.bezierCurveTo(.156,1.307,.176,1.285,.190,1.274);
   g.bezierCurveTo(.150,1.272,.112,1.305,.094,1.347);
   g.bezierCurveTo(.101,1.312,.124,1.285,.144,1.270);
   g.bezierCurveTo(.107,1.261,.066,1.291,.050,1.329);
   g.bezierCurveTo(.057,1.299,.076,1.274,.097,1.263);
   g.bezierCurveTo(.059,1.254,.016,1.284,-.002,1.326);
   g.bezierCurveTo(.005,1.294,.024,1.273,.043,1.264);
   g.bezierCurveTo(.004,1.262,-.041,1.296,-.054,1.356);
   g.bezierCurveTo(-.055,1.322,-.060,1.287,-.047,1.275);
   g.bezierCurveTo(-.078,1.272,-.091,1.296,-.087,1.327);
   g.bezierCurveTo(-.101,1.300,-.106,1.285,-.103,1.273);
   g.bezierCurveTo(-.131,1.275,-.145,1.295,-.133,1.329);
   g.bezierCurveTo(-.148,1.301,-.162,1.280,-.180,1.277);
   g.quadraticCurveTo(-.203,1.272,-.233,1.245);
  },.009);
  curve(g,'#1f1d27',.011,[-.137,1.413],[0,1.478],[.137,1.413]);
  curve(g,'#4c4557',.004,[-.081,1.425],[-.142,1.390],[-.164,1.313]);
  curve(g,'#4c4557',.003,[-.069,1.423],[-.096,1.394],[-.104,1.344]);
  curve(g,'#4c4557',.004,[-.040,1.432],[-.045,1.363],[-.004,1.311]);
  curve(g,'#4c4557',.004,[.003,1.433],[.011,1.345],[.054,1.305]);
  curve(g,'#4c4557',.003,[.051,1.428],[.062,1.360],[.104,1.315]);
  for(const q of [-1,1]){
   shape(g,d.hair,()=>{g.moveTo(q*.185,1.351);g.quadraticCurveTo(q*.27,1.195,q*.205,1.041);g.quadraticCurveTo(q*.165,.98,q*.147,1.012);g.quadraticCurveTo(q*.222,1.14,q*.167,1.30)},.007);
   curve(g,'#554c60',.005,[q*.204,1.32],[q*.231,1.16],[q*.166,1.033]);
  }
 }
 g.restore();
}
