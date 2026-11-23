import React from 'react';
import { AbsoluteFill, Audio, Composition, getInputProps, registerRoot, staticFile } from 'remotion';
import { TwoCentFrame } from './Frame';
import { TOTAL } from './timeline';

const VOICE = 'two-cent-voice.mp3';

function Garage({ from = 0, captions = true }: { from?: number; captions?: boolean }) {
  return (
    <AbsoluteFill>
      <TwoCentFrame from={from} captions={captions} />
      <Audio src={staticFile(VOICE)} startFrom={from} />
    </AbsoluteFill>
  );
}

function Main() {
  const { captions = true } = getInputProps() as { captions?: boolean };
  return <Garage captions={captions} />;
}

function Hook() {
  const { captions = true } = getInputProps() as { captions?: boolean };
  return <Garage captions={captions} />;
}

function Reveal() {
  const { captions = true } = getInputProps() as { captions?: boolean };
  return <Garage from={683} captions={captions} />;
}

function Root() {
  return (
    <>
      <Composition id="TwoCentGarage" component={Main} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
      <Composition id="TwoCentHook" component={Hook} durationInFrames={155} fps={30} width={1080} height={1920} />
      <Composition id="TwoCentReveal" component={Reveal} durationInFrames={147} fps={30} width={1080} height={1920} />
    </>
  );
}

registerRoot(Root);
