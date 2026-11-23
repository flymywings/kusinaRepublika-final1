// The whole film as one function of the frame number: the hook, chunk A (cards 2-4), the rewind and reveal, chunk B (cards 6-7).
import {hookLayersAt,type Layer} from './story';
import {chunkALayersAt,CHUNK_A_RANGE} from './chunkA';
import {chunkBLayersAt,CHUNK_B_RANGE} from './chunkB';
import {revealLayersAt,fxAt as revealFx,REVEAL_RANGE} from './reveal';
export type {Layer};
export function layersAt(f:number):Layer[]{
 if(f>=REVEAL_RANGE[0]&&f<REVEAL_RANGE[1])return revealLayersAt(f);
 if(f>=CHUNK_B_RANGE[0]&&f<CHUNK_B_RANGE[1])return chunkBLayersAt(f);
 if(f>=CHUNK_A_RANGE[0]&&f<CHUNK_A_RANGE[1])return chunkALayersAt(f);
 return hookLayersAt(Math.min(f,149)); // cards 6-7 are not built yet: they show the last hook frame
}
export const fxAt=revealFx;
