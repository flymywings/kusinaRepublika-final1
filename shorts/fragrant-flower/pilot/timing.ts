// The approved take, cut only inside existing silence. Speech is never stretched or trimmed.
import map from './edit-map.json';
import captions from './captions.json';

export const FPS=30,DURATION=map.duration,TOTAL=Math.round(DURATION*FPS);

export interface Caption {start:number;end:number;word:string}
export const CAPTIONS:Caption[]=captions;
