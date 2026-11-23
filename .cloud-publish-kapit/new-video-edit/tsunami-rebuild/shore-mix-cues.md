# Shore mix cue notes

This 26-second, 48 kHz, stereo mix uses Darian’s existing words and preserves the approximate sentence starts at 0.00, 3.30, 6.08, 11.18, 17.01, 19.36 and 23.39 seconds. The first five phrases use a pitch-preserving 1.2–8.8% slowdown to shorten the gaps while keeping their start times. The music and surf carry the pauses.

- 0–8 seconds. Fade the march in gently and duck it under speech. The surf sits about 13 dB below its source before speech ducking.
- 8–11.45 seconds. Lower the fault swell by another 3.5 dB.
- 13.55–17.55 seconds. Lower the retreat wash by another 4.5 dB.
- 19.03–26 seconds. Soften the footsteps by another 3.5 dB. Fade score and effects through the end.

The measured mix is −18.2 LUFS integrated, with 1.7 LU loudness range and −3.2 dBTP. Rebuild with `mix.ps1`.

The v6 mix uses `build_sound.py` for bridge-style synthesized cues and `mix.ps1` with the new effects stem. The water bed muffles on the dive and opens up at the surface. Separate cues mark the fault, retreat, bamboo contact, rope drop, and three runners. Voice-led ducking and a continuous bed carry the pauses.

V7 shortens the cut to 25.2 seconds and briefly lowers the surf around the fault, bamboo contact, dropped rope, and first steps. Rebuild the v7 effects with `build_sound.py`, then run `mix.ps1` with the v7 stem, `-CutLength 25.2`, and `-CueEmphasis`.
