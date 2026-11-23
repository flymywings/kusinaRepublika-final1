import {CAPTIONS} from './captions';

// Preserve spoken-word alignment while displaying the year as one number.
export const DISPLAY_CAPTIONS: [number,number,string][] = CAPTIONS.flatMap((cue,i) => {
 const previous=CAPTIONS[i-1],next=CAPTIONS[i+1];
 if(cue[2]==='eighteen' && next?.[2]==='seventy-two.') {
  return [[cue[0],next[1],'1872.'] as [number,number,string]];
 }
 if(cue[2]==='seventy-two.' && previous?.[2]==='eighteen') return [];
 return [cue];
});
