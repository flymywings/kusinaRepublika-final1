// New surfaces use the bridge's cached Canvas2D paint and two-tone material path.
import * as THREE from 'three';
import {ctex, rep, planksHD, beamHD, rng} from '../upstream/templates/bridge/paint';
import {twoTone} from '../upstream/templates/bridge/shade';
export {rng};
const materials = new Map<string, THREE.MeshLambertMaterial>();
export function painted(key:string, color:string, map?:THREE.Texture) {
  if (!materials.has(key)) materials.set(key, twoTone(new THREE.MeshLambertMaterial({color,map:map??null,side:THREE.DoubleSide})));
  return materials.get(key)!;
}
export const solid = (color:string) => painted('diamond-solid-'+color,color);
export const wood = () => painted('diamond-wood','#fff3df',rep(planksHD(),1,.6));
export const timber = () => painted('diamond-timber','#d9b995',beamHD());
export const dirtMap = () => ctex('diamond-colorado-dirt-1872',1024,1024,(g,r)=>{
  g.fillStyle='#c5a582';g.fillRect(0,0,1024,1024);
  for(let i=0;i<12;i++) {const x=r()*1024,y=r()*1024,rad=100+r()*180,grad=g.createRadialGradient(x,y,0,x,y,rad);grad.addColorStop(0,i%2?'rgba(167,124,88,.055)':'rgba(244,219,172,.07)');grad.addColorStop(1,'rgba(200,170,130,0)');g.fillStyle=grad;g.fillRect(x-rad,y-rad,rad*2,rad*2);}
  for(let i=0;i<210;i++){const x=r()*1024,y=r()*1024;g.fillStyle=i%3?'#cdb18f':'#ac8a70';g.beginPath();g.ellipse(x,y,1+r()*2.8,1+r()*1.7,r()*3,0,7);g.fill();}
  // Sparse bedding cracks, no photographic grain.
  g.strokeStyle='rgba(130,101,79,.21)';g.lineWidth=1.4;
  for(let i=0;i<14;i++){let x=r()*1024,y=r()*1024;g.beginPath();g.moveTo(x,y);for(let j=0;j<3;j++){x+=12+r()*15;y+=(r()-.5)*20;g.lineTo(x,y);}g.stroke();}
});
export const dirt = () => painted('diamond-field-ground','#ffffff',rep(dirtMap(),14,14));
export const disturbed = (id:string) => painted('diamond-patch-'+id,'#ffffff',ctex('diamond-disturbed-'+id,512,512,(g,r)=>{
  g.fillStyle='#aa7f62';g.fillRect(0,0,512,512);
  for(let i=0;i<90;i++){g.fillStyle=i%3?'#b78d69':'#957057';g.beginPath();g.ellipse(r()*512,r()*512,2+r()*9,2+r()*5,r()*6,0,7);g.fill();}
  g.lineCap='round';g.strokeStyle='rgba(113,77,55,.40)';g.lineWidth=3;
  for(let i=0;i<15;i++){let x=r()*512,y=r()*512;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+24,y-12,x+55,y+8);g.stroke();}
}));
export const plaster = (london=false) => painted('diamond-plaster-'+london,'#ffffff',ctex('diamond-plaster-painted-'+london,1024,1024,(g,r)=>{
  g.fillStyle=london?'#c8a39b':'#b8c3a7';g.fillRect(0,0,1024,1024);
  for(let i=0;i<9;i++){const x=r()*1024,y=r()*1024,rad=150+r()*160,grad=g.createRadialGradient(x,y,0,x,y,rad);grad.addColorStop(0,i%2?'rgba(255,239,211,.045)':'rgba(99,76,75,.025)');grad.addColorStop(1,'rgba(180,155,135,0)');g.fillStyle=grad;g.fillRect(x-rad,y-rad,rad*2,rad*2);}
  g.strokeStyle='rgba(106,85,73,.23)';g.lineWidth=1.4;
  for(let i=0;i<5;i++){let x=r()*1024,y=r()*1024;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(r()-.5)*16;y+=12+r()*17;g.lineTo(x,y);}g.stroke();}
}));
export const canvas = () => painted('diamond-canvas','#ffffff',ctex('diamond-canvas-seams',512,512,(g)=>{
  g.fillStyle='#e9d8b3';g.fillRect(0,0,512,512);g.fillStyle='#d8c6a4';g.fillRect(0,0,28,512);g.fillRect(255,0,4,512);g.fillRect(0,480,512,4);
  g.strokeStyle='#b6a285';g.lineWidth=1.2;g.setLineDash([4,7]);for(const x of[22,265]){g.beginPath();g.moveTo(x,0);g.lineTo(x,512);g.stroke();}
}));
export const paper = (kind:'ledger'|'map'|'certificate'='ledger') => painted('diamond-paper-'+kind,'#ffffff',ctex('diamond-paper-lines-'+kind,1024,768,(g,r)=>{
  g.fillStyle='#e9dbb7';g.fillRect(0,0,1024,768);g.fillStyle='#d8c8a3';g.fillRect(0,0,1024,16);g.fillRect(0,752,1024,16);
  g.strokeStyle='#9f9784';g.lineWidth=2;
  if(kind==='map'){
    g.strokeStyle='#a28f73';g.lineWidth=3;for(let i=0;i<14;i++){g.beginPath();const y=i*58;g.moveTo(0,y);g.bezierCurveTo(280,y-90,640,y+90,1024,y-25);g.stroke();}
    g.strokeStyle='#718c98';g.lineWidth=12;g.beginPath();g.moveTo(180,0);g.bezierCurveTo(580,280,90,480,760,768);g.stroke();
    g.strokeStyle='#a9745c';g.lineWidth=3;g.strokeRect(340,210,370,330);g.fillStyle='#806a57';g.font='42px Georgia';g.fillText('1872',70,90);
  }else if(kind==='certificate'){
    g.strokeStyle='#9b825d';g.lineWidth=7;g.strokeRect(34,34,956,700);g.strokeRect(47,47,930,674);g.fillStyle='#675447';g.font='bold 57px Georgia';g.textAlign='center';g.fillText('MINING CLAIM',512,155);g.font='32px Georgia';g.fillText('COLORADO TERRITORY',512,220);
    for(let y=310;y<600;y+=48){g.beginPath();g.moveTo(120,y);g.lineTo(900,y);g.stroke();}g.fillStyle='#a75f50';g.beginPath();g.arc(820,630,42,0,7);g.fill();
  }else{
    for(let y=95;y<730;y+=45){g.beginPath();g.moveTo(35,y);g.lineTo(990,y);g.stroke();}
    g.strokeStyle='#b66f62';for(const x of[120,650,830]){g.beginPath();g.moveTo(x,35);g.lineTo(x,740);g.stroke();}
    g.fillStyle='#776455';g.font='italic 25px Georgia';for(let y=132;y<700;y+=45){g.fillText(['Account received','Draft — bank','Samples & sundries'][Math.floor(r()*3)],150,y);g.fillText(String(100+Math.floor(r()*900))+'.00',850,y);}
  }
}));
