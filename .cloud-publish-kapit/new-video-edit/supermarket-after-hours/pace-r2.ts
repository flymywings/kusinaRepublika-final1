import map from './public/pace-map-r2.json';
import storyMap from './public/story-map-r2.json';
const rate=map.sampleRate,fps=map.fps;
export const VOduration=map.outputAudioDuration,exportDuration=map.exportDuration;
function storyAtRecording(x:number){
 const a=storyMap.anchors;if(x<=a[0][0])return a[0][1];if(x>=a[a.length-1][0])return a[a.length-1][1];
 const i=a.findIndex((p,n)=>n<a.length-1&&x>=p[0]&&x<=a[n+1][0]),p=a[i],q=a[i+1],h=q[0]-p[0],t=(x-p[0])/h;
 const slope=(n:number)=>(a[n+1][1]-a[n][1])/(a[n+1][0]-a[n][0]);
 const tangent=(n:number)=>{if(n===0||n===a.length-1)return 0;const l=slope(n-1),r=slope(n);if(l*r<=0)return 0;const hl=a[n][0]-a[n-1][0],hr=a[n+1][0]-a[n][0],w1=2*hr+hl,w2=hr+2*hl;return(w1+w2)/(w1/l+w2/r);};
 return(2*t*t*t-3*t*t+1)*p[1]+(t*t*t-2*t*t+t)*h*tangent(i)+(-2*t*t*t+3*t*t)*q[1]+(t*t*t-t*t)*h*tangent(i+1);
}
function interpolate(x:number,from:0|1,to:0|1){
 if(from===0)return storyAtRecording(x);
 const a=storyMap.anchors;if(x<=a[0][1])return a[0][0];if(x>=a[a.length-1][1])return a[a.length-1][0];
 let lo=a[0][0],hi=a[a.length-1][0];for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(storyAtRecording(mid)<x)lo=mid;else hi=mid;}return(lo+hi)/2;
}
export function recordingFrameAt(outputFrame:number){const sample=outputFrame/fps*rate;if(sample>=map.outputAudioSamples)return(map.originalAudioSamples+sample-map.outputAudioSamples)/rate*fps;const s=map.segments.find(p=>sample>=p.targetStartSample&&sample<=p.targetEndSample)??map.segments[map.segments.length-1];return(s.sourceStartSample+(s.sourceEndSample-s.sourceStartSample)*(sample-s.targetStartSample)/(s.targetEndSample-s.targetStartSample))/rate*fps;}
function outputRecordingFrameAt(recordingFrame:number){const sample=recordingFrame/fps*rate;if(sample>=map.originalAudioSamples)return(map.outputAudioSamples+sample-map.originalAudioSamples)/rate*fps;const s=map.segments.find(p=>sample>=p.sourceStartSample&&sample<=p.sourceEndSample)??map.segments[map.segments.length-1];return(s.targetStartSample+(s.targetEndSample-s.targetStartSample)*(sample-s.sourceStartSample)/(s.sourceEndSample-s.sourceStartSample))/rate*fps;}
export const sourceFrameAt=(outputFrame:number)=>interpolate(recordingFrameAt(outputFrame),0,1);
export const outputFrameAt=(storyFrame:number)=>outputRecordingFrameAt(interpolate(storyFrame,1,0));
