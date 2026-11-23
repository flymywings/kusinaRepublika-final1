/** Distance-driven frontal gait. Routes must be pure and retain their function identity. */
export type GaitPoint = [number, number, number];
export type GroundRoute = (frame: number) => GaitPoint;
export interface GroundedGait {
 feet: [GaitPoint, GaitPoint];
 /** Continuous two-step cycle count, derived from travelled distance. */
 phase: number;
 /** Swing progress per foot; zero while that foot is planted. */
 swing: [number, number];
 contacts: [boolean, boolean];
}
type Sample = {frame: number; distance: number; point: GaitPoint};
type Event = {begin: number; end: number; from: number; to: number; planted: GaitPoint};
type RouteTable = {samples:Sample[]; length:number};
type Plan = RouteTable & {spacing: number; initial: [GaitPoint,GaitPoint]; events: [Event[],Event[]]};
type CachedRoute = {table:RouteTable; plans:Map<number,Plan>};
const cache = new WeakMap<GroundRoute, Map<string,CachedRoute>>();
const clamp = (x:number) => Math.max(0,Math.min(1,x));
const smooth = (x:number) => {const t=clamp(x);return t*t*(3-2*t);};
const lerp = (a:number,b:number,t:number) => a+(b-a)*t;

function locate(samples:Sample[],value:number,key:'frame'|'distance') {
 let lo=0,hi=samples.length-1;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(samples[mid][key]<=value)lo=mid;else hi=mid;}
 const a=samples[lo],b=samples[hi],width=b[key]-a[key];
 return {a,b,t:width>0?clamp((value-a[key])/width):0};
}
function routePoint(samples:Sample[],distance:number):GaitPoint {
 if(distance<=0)return [...samples[0].point];
 if(distance>=samples[samples.length-1].distance)return [...samples[samples.length-1].point];
 const {a,b,t}=locate(samples,distance,'distance');
 return a.point.map((v,i)=>lerp(v,b.point[i],t)) as GaitPoint;
}
function sole(samples:Sample[],distance:number,side:number,scale:number):GaitPoint {
 const p=routePoint(samples,distance);return [p[0]+side*.13*scale,p[1]+.002,p[2]];
}
function sampleRoute(start:number,end:number,route:GroundRoute):RouteTable {
 const samples:Sample[]=[],count=Math.max(1,Math.ceil((end-start)*4));
 let length=0;
 for(let i=0;i<=count;i++){
  const frame=lerp(start,end,i/count),point=route(frame);
  if(point.length!==3||!point.every(Number.isFinite))throw new Error('Ground route must return finite XYZ coordinates');
  if(i){const prev=samples[i-1].point;length+=Math.hypot(point[0]-prev[0],point[2]-prev[2]);}
  samples.push({frame,distance:length,point:[...point]});
 }
 return {samples,length:length<1e-8?0:length};
}
function makePlan({samples,length}:RouteTable,scale:number):Plan {
 const initial:[GaitPoint,GaitPoint]=[sole(samples,0,-1,scale),sole(samples,0,1,scale)];
 const events:[Event[],Event[]]=[[],[]];
 if(length<1e-8)return {samples,length:0,spacing:1,initial,events};
 // Fit nominal .52m steps to the route; short routes/endpoints necessarily shorten them.
 let steps=Math.max(1,Math.round(length/(.52*scale)));
 if(length/steps>.56*scale)steps++;
 const step=length/steps,settle=Math.min(.08*scale,length*.10),travel=length-settle,spacing=travel/(steps+1);
 for(let j=1;j<=steps+1;j++){
  const foot=(j-1)%2,side=foot===0?-1:1,to=Math.min(length,j*step);
  const prior=events[foot].at(-1),from=prior?.to??0;
  // Each foot swings for 37.5% of its two-step cycle, with double-support gaps.
  // Land the final step just before the root stops, preserving a short settling interval.
  events[foot].push({begin:(j-.75)*spacing,end:j===steps+1?travel:j*spacing,from,to,planted:sole(samples,to,side,scale)});
 }
 // The final two landings share the destination: no end-of-route reset or teleport.
 return {samples,length,spacing,initial,events};
}

export function groundedGait(frame:number,start:number,end:number,route:GroundRoute,scale=1):GroundedGait {
 if(![frame,start,end,scale].every(Number.isFinite)||end<start||scale<=0)throw new Error('Invalid grounded gait range or scale');
 let routes=cache.get(route);if(!routes){routes=new Map();cache.set(route,routes);}
 const key=`${start}:${end}`;
 let cached=routes.get(key);if(!cached){cached={table:sampleRoute(start,end,route),plans:new Map()};routes.set(key,cached);}
 let plan=cached.plans.get(scale);if(!plan){plan=makePlan(cached.table,scale);cached.plans.set(scale,plan);}
 const {samples,length,spacing,initial,events}=plan;
 const distance=frame<=start?0:frame>=end?length:(()=>{const {a,b,t}=locate(samples,frame,'frame');return lerp(a.distance,b.distance,t);})();
 const feet=initial.map(p=>[...p]) as [GaitPoint,GaitPoint];
 const swing:[number,number]=[0,0],contacts:[boolean,boolean]=[true,true];
 for(let foot=0;foot<2;foot++){
  for(const event of events[foot]){
   if(distance>=event.end){feet[foot]=[...event.planted];continue;}
   if(distance<=event.begin)break;
   const u=clamp((distance-event.begin)/(event.end-event.begin));
   feet[foot]=sole(samples,lerp(event.from,event.to,smooth(u)),foot===0?-1:1,scale);
   feet[foot][1]+=Math.min(.08,.08*scale)*Math.sin(Math.PI*u);
   swing[foot]=u;contacts[foot]=false;break;
  }
 }
 return {feet,phase:length?distance/(2*spacing):0,swing,contacts};
}
