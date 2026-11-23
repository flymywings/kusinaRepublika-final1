export type Point3=[number,number,number];
export const CHECKOUT={position:[-2.45,0,-2.85] as Point3,size:[2.18,.98,.86] as Point3};
export const CUSTOMER_POSITION:Point3=[-.70,.026,-1.95];
export const ENTRY={x:-.70,z:.02,panelWidth:1.10,closedOffset:.56,travel:1.19,handleOffset:.31,open:[246,260],close:[517,541]};
export const TROLLEY:Point3=[6.85,0,-4.80];
const ramp=(f:number,a:number,b:number)=>{const t=Math.max(0,Math.min(1,(f-a)/(b-a)));return t*t*t*(t*(t*6-15)+10)};
export const doorOpenness=(f:number)=>ramp(f,...ENTRY.open as [number,number])*(1-ramp(f,...ENTRY.close as [number,number]));
export const doorClearWidth=(f:number)=>2*(ENTRY.closedOffset+ENTRY.travel*doorOpenness(f))-ENTRY.panelWidth;
