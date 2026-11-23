// The whole film as one function of the frame number: the hook (cut-v5 look), the rewind and reveal, and (not built yet) the other cards.
import {hookLayersAt,type Layer} from './story';
import {revealLayersAt,fxAt as revealFx,REVEAL_RANGE} from './reveal';
export type {Layer};
export function layersAt(f:number):Layer[]{
 if(f>=REVEAL_RANGE[0]&&f<REVEAL_RANGE[1])return revealLayersAt(f);
 return hookLayersAt(Math.min(f,149)); // cards 2-4 and 6-7 are not built yet: they show the last hook frame
}
export const fxAt=revealFx;
