// The approved take, cut only inside existing silence. Speech is never stretched or trimmed.
import map from './edit-map.json';
import words from './words.json';

export const FPS=30,DURATION=map.duration,TOTAL=Math.round(DURATION*FPS);
export const toPilot=(source:number)=>{const s=map.segments.find(s=>source>=s.from&&source<s.to);return s?s.at+source-s.from:undefined;};

export interface Caption {start:number;end:number;word:string}
export const CAPTIONS:Caption[]=(words as [number,string][]).flatMap(([at,word],i,all)=>{
 const start=toPilot(at);if(start===undefined)return [];
 const seg=map.segments.find(s=>at>=s.from&&at<s.to)!,next=all[i+1]?.[0]??at+.6;
 const limit=word.endsWith('.')?Math.min(next,at+.62):next;
 return [{start,end:seg.at+Math.min(limit,seg.to)-seg.from,word}];
});
