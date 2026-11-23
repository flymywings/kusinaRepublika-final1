import React from 'react';
import { interpolate } from 'remotion';
import { CAPTIONS } from './captions';

export function WordCaptions({ frame }: { frame: number }) {
  // Find current active word cue
  const activeCue = CAPTIONS.find(([start, end]) => frame >= start && frame < end);

  if (!activeCue) return null;

  const [start, , word] = activeCue;
  const age = frame - start;

  // Small settling pop on onset: 1.18 -> 1.0 over 3 frames
  const scale = interpolate(age, [0, 3], [1.18, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '22%',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <span
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 900,
          fontSize: '76px',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transform: `scale(${scale})`,
          textShadow: `
            -4px -4px 0 #09090b,
             4px -4px 0 #09090b,
            -4px  4px 0 #09090b,
             4px  4px 0 #09090b,
             0px  6px 16px rgba(0,0,0,0.9)
          `,
        }}
      >
        {word}
      </span>
    </div>
  );
}
