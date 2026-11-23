import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import {TOTAL,FPS} from './story';
const Hook=()=> <Film/>;
const Claim=()=> <Film from={398}/>;
const Ending=()=> <Film from={764}/>;
registerRoot(()=> <>
 <Composition id="DragonInsurance" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL}/>
 <Composition id="DragonHook" component={Hook} width={1080} height={1920} fps={FPS} durationInFrames={180}/>
 <Composition id="DragonClaim" component={Claim} width={1080} height={1920} fps={FPS} durationInFrames={245}/>
 <Composition id="DragonEnding" component={Ending} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL-764}/>
</>);
