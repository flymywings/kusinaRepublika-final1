import {sourceFrameAt,outputFrameAt} from './pace-r2';
import mouth from './public/voice-mouth-v8.json';
export interface FacialPerformance {openness:number;smile:number;brow:number;mouth:number;blink:number;fatigue:number;}
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{const t=clamp(x);return t*t*t*(t*(t*6-15)+10)};
type Key=[number,number,number,number]; // output frame, eye openness, smile, brow lift
const store:Key[]=[[223,.10,0,0],[252,.10,0,0],[259,.28,.22,.18],[274,0,1,.22],[349,0,1,.22],[374,.10,.08,.08],[403,.08,-.18,.04],[412,.08,-.18,.04]];
const outside:Key[]=[[538,1,0,1],[628,1,0,1],[638,.70,.10,.77],[651,.46,.14,.56],[672,.35,.08,.44],[716,.29,.12,.32],[766,.25,.14,.26],[824,.22,.14,.22],[927,.22,.14,.22],[953,0,1,.22],[1139,0,1,.22]];
function sample(keys:Key[],f:number){
 let i=keys.findIndex((k,n)=>n<keys.length-1&&f>=k[0]&&f<=keys[n+1][0]);
 if(i<0)i=f<keys[0][0]?0:keys.length-2;
 const a=keys[i],b=keys[i+1],t=smooth((f-a[0])/(b[0]-a[0]));
 return{openness:a[1]+(b[1]-a[1])*t,smile:a[2]+(b[2]-a[2])*t,brow:a[3]+(b[3]-a[3])*t};
}
export function sasakiFaceAt(f:number):FacialPerformance|undefined{
 if(!(f>=252&&f<517||f>=775))return undefined;
 const out=outputFrameAt(f),isStore=f<517,base=sample(isStore?store:outside,out);
 const blinkCenter=isStore?256:638;
 const blink=.82*Math.max(0,1-Math.abs(out-blinkCenter)/3.5);
 const speaking=!isStore&&out>=641&&out<766;
 const n=Math.min(mouth.frames.length-1,Math.max(0,Math.floor(out))),activity=mouth.frames[n];
 return{...base,mouth:speaking?activity*.52:0,blink,fatigue:isStore?1-smooth((out-252)/22):0};
}
// Actual output-frame anchors prevent new narration speed from compressing the acting beats.
export const recoveryStart=sourceFrameAt(628),recoveryEnd=sourceFrameAt(672);
