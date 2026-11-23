# Hook B round 1: render, measurement and gates (2026-11-23)

Video: `hook-B-r1.mp4` (720x1280, 30 fps, 200 frames = 6.667 s, H.264 and AAC), plus `hook-B-r1-360w.mp4` (360x640). Frames 0-148 are card 1, 149-199 are the start of 2A.
Sound: `../../cut-v4/public/hook-sound.wav` and `hook-sound.cues.json`, built by `cut-v4/sound.mjs`. Stills, rule check and the six fixes: `STILLS-r1.md`.
Not run: the hook cold-viewer test ("what happened?", "what do you want to know?"). That is for the user or an unbriefed viewer.

## Gates: 7 passed of 8

| Gate | Result | Evidence |
|---|---|---|
| Voice untouched, "This" on frame 2 | **PASS** | The v3 master is placed sample for sample at gain 1.0 (only resampled 44.1 -> 48 kHz); `sound.mjs` never scales it and turns down only the added sound if the sum would clip (it did, by 2.5 dB). In the AAC render the best alignment against the master is lag 0 samples, correlation 0.973 (it includes the added sound and AAC). "This" starts at 0.062 s in the master (frame 1.9) |
| Frame 0: motion by frame 1, both faces readable at 360 px, his reads as a reflection | **PASS** | Frame 0 to 1 difference: mean 5.3 of 255. `stills/f0000_360w.png` shows her face and his face in a bevelled walnut-framed mirror with a window, lamp and sheen. A cold viewer has not tested the "reflection, not a third person" read |
| His reflected face sharp and readable by f54 | **PASS** | Edge density of his face area: 4.85 at f0, 7.40 at f54 (+53 %). Blur on the card is 0 from f54 and the focus is on him (`stills/f0054_360w.png`) |
| Coins and box readable at f114, each placed by a visible hand | **PASS** | `stills/f0114_360w.png`: two coins down at the left of the box, the box with its window and slice, a large hand on each. Coins land on f99 and f103; the box stops on f112 (the corrected "cake") |
| Shots: 1A 1.80 s, 1B 1.50 s, 1C 1.66 s, each starting on its word | **PASS** | 54, 45 and 50 frames (1C 1.67 s, inside the 4-frame tolerance). Starts: first frame, "face" f54, "buy" f99 |
| User's rules on every still and in motion | **PASS** | 51 of 51, `STILLS-r1.md`. Faces were computed on all 200 frames |
| Rewind: frame 896 equals frame 0 as lossless stills | **NOT TESTED** | It needs the full film. The precondition holds: frame 0 is the exported `STARE` state and two renders of it with captions off are byte-identical (same SHA-256) |
| Measure, 0-4.96 s | **PASS** | Table below |

## Measurement, 0-4.96 s

`cut-v4/tools/measure_hook.py` runs `reference-study/measure.py`'s own `measure()` (taken from its source; its trace files go to `measure/`, not to reference-study) on the first 4.96 s of the render, as in `reference-metrics-audit.md`.

| Measure | Target | Result | |
|---|---|---|---|
| Frames with camera motion | 33 % or more (guide for the full film 33-70 %) | **91.8 %** (tracking coverage 98.7 %) | pass; above the guide, see issue 8 of `STILLS-r1.md` |
| Brightness, median luma | 78.6-154.3 | **107.3** | pass |
| Contrast, high minus low luma | 95-145 | **135.0** | pass |
| Saturation, median | 19.6-28 | **22.6** | pass |
| Hard changes at the 0.28 threshold | report only | **0** (shot changes are a focus pull, a camera move and a 6-frame dissolve) | |

Attempts: the first render measured motion 20.4 % and saturation 15.2, both outside. One focused fix raised the grade saturation and added a 5 cm hand-held sway: motion 91.8 %, saturation 22.1. A second change brightened the morning (a neutral bright tone preset): saturation 22.6, luma 107.3, contrast 135. Earlier measurements are in `measure/attempt0-*` and `measure/attempt1-*`.

## Sound (card 1 sound column)

All sound is generated in `sound.mjs`; each kind comes from one reusable buffer.

| Frame | Cue |
|---|---|
| 0, 11, 21, 32 | fork tick, the same buffer four times, 7 dB under the voice's speech level |
| 46 | case hum comes in under "his face", stays low afterwards |
| 72 | low felt-piano note ("then") |
| 80 | door bell, offscreen ("came") |
| 99, 103 | coin clinks ("buy") |
| 112 | box tap ("cake", the corrected time) |
| 140 | street air starts rising |
| 0-200 | room tone from frame 0 |

Ticks and effects are 7-9 dB under the voice speech level, beds 15-16 dB under each; the added sound as a whole is about 6 dB under the voice during speech. Mix peak -1.45 dBFS, integrated -15.8 LUFS (the full proof's -14 LUFS target is not a hook gate and needs a gain decision that would change the voice level), loudness range 1.0 LU. The ticks stop at f32; the card says they stop on "face" (f54).

## What the render is built from

`cut-v4/`: `Cafe.tsx`, `story.ts` (exports `STARE` and `stare(k)`), `Film.tsx`, `consts.ts`, `timing.ts`, `captions.mjs` + `captions.json`, `rules.ts` + `rules.mjs`, `sound.mjs`, `tools/words.mjs` + `tools/model.bin` + `tools/measure_hook.py`.
Render command: `node pipeline/render.mjs shorts/fragrant-flower/cut-v4/Film.tsx HookB video out/hook-v4/hook-B-r1.mp4 --scale 0.6666666666666666 --props '{"ppm":1300,"audio":"hook-sound.wav"}' --public shorts/fragrant-flower/cut-v4/public` (47 s on this machine). Scale 0.6666667 fails (non-integer height), so use the exact fraction.
