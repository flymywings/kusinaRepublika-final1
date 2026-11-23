import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import {FPS,TOTAL} from './story';
registerRoot(()=> <Composition id="SupermarketAfterHours" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL} defaultProps={{captions:true,pixelRatio:.5,audio:true}}/>);
