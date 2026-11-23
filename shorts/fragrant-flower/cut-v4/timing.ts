// Frame times for the hook build. The narration is never stretched or trimmed.
import captions from './captions.json';
export const FPS=30,TOTAL=216;
export interface Caption {from:number;to:number;word:string}
export const CAPTIONS:Caption[]=captions;
