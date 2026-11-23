import React from 'react';
import {AbsoluteFill, Audio, Composition, interpolate, registerRoot, staticFile, useCurrentFrame} from 'remotion';

const keys = [0, 4, 9, 14, 18, 22, 26];
const sample = (time, values) => interpolate(time, keys, values, {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
function Shore() {
  const time = useCurrentFrame() / 30;
  const cameraX = sample(time, [345, 540, 710, 570, 350, 240, 350]);
  const cameraY = sample(time, [380, 520, 595, 505, 390, 275, 365]);
  const width = sample(time, [660, 540, 510, 510, 510, 480, 920]);
  const shore = sample(time, [420, 515, 420, 420, 550, 550, 550]);
  const rise = sample(time, [0, 0, 31, 31, 31, 31, 31]);
  const walk = sample(time, [0, 0, 0, 0, 0, 95, 195]);
  const wave = sample(time, [900, 900, 785, 625, 510, 500, 500]);
  return <AbsoluteFill style={{background: '#eee9dc'}}>
    <Audio src={staticFile('narration.mp3')} />
    <svg width="100%" height="100%" viewBox={`${cameraX-width/2} ${cameraY-width*8/9} ${width} ${width*16/9}`}>
      <defs>
        <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <rect width="9" height="9" fill="#c8c3b8"/><path d="M0 0V9" stroke="#77736d" strokeWidth="1"/>
        </pattern>
        <linearGradient id="water" x2="0" y2="1"><stop stopColor="#f5f2e9"/><stop offset="1" stopColor="#a9aba9"/></linearGradient>
      </defs>
      <path d={`M${shore} ${shore < 500 ? 400 : 440} Q${wave} 465 ${wave+105} 395 H1600 V1100 H${shore}Z`} fill="url(#water)" stroke="#789eb2" strokeWidth="4"/>
      <path d="M-500 330 H-50 Q65 150 160 245 Q300 345 420 400 Q560 469 655 565 L710 610 L680 1100 H-500Z" fill="url(#hatch)" stroke="#292825" strokeWidth="4"/>
      <path d={`M710 ${610-rise} Q860 ${660-rise} 1600 ${670-rise} V1100 H680Z`} fill="url(#hatch)" stroke="#292825" strokeWidth="4"/>
      <path d="M-60 331 Q55 170 158 259 Q300 360 420 411 Q550 466 651 579" fill="none" stroke="#514e49" strokeWidth="2"/>
      {time > 18 && <path d="M352 369 Q248 326 149 238" fill="none" stroke="#789eb2" strokeWidth="3" strokeDasharray="8 7"/>}
      <g transform={`translate(${350-walk} ${371-walk*.66})`} stroke="#262523" strokeWidth="3" fill="none" strokeLinecap="round">
        <circle cy="-26" r="5" fill="#f3eee2"/>
        <path d={`M0 -21 L2 -10 L${Math.sin(time*12)*5} 0 M2 -10 L${-Math.sin(time*12)*5} 0 M0 -18 L-7 -12`}/>
      </g>
    </svg>
  </AbsoluteFill>;
}
registerRoot(() => <Composition id="ShoreTest" component={Shore} width={540} height={960} fps={30} durationInFrames={780}/>);
