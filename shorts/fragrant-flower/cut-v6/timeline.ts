// The whole film as one function of the frame number: the hook, chunk A (cards 2-4), the rewind and reveal, chunk B (cards 6-7), then the loop.
import {hookLayersAt,ease,type Layer} from './story';
import {chunkALayersAt,CHUNK_A_RANGE} from './chunkA';
import {chunkBLayersAt,CHUNK_B_RANGE} from './chunkB';
import {revealLayersAt,fxAt as revealFx,REVEAL_RANGE} from './reveal';
export type {Layer};
/** Perfect loop: over the last LOOP_N frames the ending dissolves back into hook frame 0 (her stare, the same state the film starts on),
 *  under the same tape-rewind look as the 5A rewind. The very last frame IS hook frame 0, so the film restarts with no visible seam. */
const LAST=CHUNK_B_RANGE[1]-1,LOOP_N=14,LOOP_0=LAST-LOOP_N;
function baseLayersAt(f:number):Layer[]{
 if(f>=REVEAL_RANGE[0]&&f<REVEAL_RANGE[1])return revealLayersAt(f);
 if(f>=CHUNK_B_RANGE[0]&&f<CHUNK_B_RANGE[1])return chunkBLayersAt(f);
 if(f>=CHUNK_A_RANGE[0]&&f<CHUNK_A_RANGE[1])return chunkALayersAt(f);
 return hookLayersAt(Math.min(f,149));
}
export function layersAt(f:number):Layer[]{
 if(f>=LAST)return hookLayersAt(0);
 if(f<LOOP_0)return baseLayersAt(f);
 const q=ease(f,LOOP_0,LAST-1);
 return [...baseLayersAt(f),...hookLayersAt(0).map(l=>({...l,opacity:q}))];
}
export function fxAt(f:number){
 if(f<LOOP_0||f>=LAST)return revealFx(f);
 const hash=(n:number)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
 const r=f-LOOP_0,tape=Math.min(1,r/4)*(1-ease(f,LAST-4,LAST));
 return {tape,tearY:hash(r)*.9+.03,tearW:(hash(r+9)>.45?.035+.05*hash(r+3):0)*tape,jit:(hash(r+5)-.5)*8*tape};
}
