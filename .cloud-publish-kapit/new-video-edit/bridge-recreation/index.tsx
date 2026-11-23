import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {BridgeShort, BRIDGE_FRAMES} from './Bridge';
registerRoot(() => <Composition id="BridgeRecreation" component={BridgeShort}
  durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920}/>);
