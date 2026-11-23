# Hook B round 2: render, measurement and gates (2026-11-23)

Video: `hook-B-r2.mp4` (720x1280, 30 fps, 200 frames = 6.667 s, H.264 and AAC) and `hook-B-r2-360w.mp4` (360x640). Frames 0-148 are card 1, 149-199 the start of 2A.
Sound: `../../cut-v4/public/hook-sound.wav` and `hook-sound.cues.json` (built by `cut-v4/sound.mjs`). Stills, rule check and the answers to each finding of `review-r1.md`: `STILLS-r2.md`. Round 1 is in `r1-archive/`.
Not run: the hook cold-viewer test.

## Gates: 7 passed of 8

| Gate | Result | Evidence |
|---|---|---|
| Voice untouched, "This" on frame 2 | **PASS** | The v3 master is placed sample for sample at gain 1.0 (resampled only); `sound.mjs` turns down only the added sound if the sum would clip (it did, by 2.5 dB). The AAC render aligns with the master at lag 0, correlation 0.9725. "This" starts at 0.062 s (frame 2) |
| Frame 0: motion by frame 1, both faces readable at 360 px, his reads as a reflection | **PASS, read untested** | Frame 0 to 1 difference: mean 1.5 of 255 (a 0.16 % push and the fork tremble; it was 5.3 with the sway). `stills/f0000_360w.png`: her face with her eyes aimed up at him, and his lidded face in a walnut frame with a bevel, window, lamp, door and sheen. Whether a cold viewer reads "reflection, not a third person" is not tested |
| His reflected face sharp and readable by f54 | **PASS** | Edge density of his face area 5.25 at f0, 7.52 at f54 (+43 %); focus lands on him by f54 |
| Coins and box readable at f114, each placed by a visible hand | **PASS, hand small** | `stills/f0103_360w.png` to `f0114_360w.png`: both coins down, the white box with its slice, both sleeves reaching it. The cast B dot hand sits on the box's rear-right lip from f102 to f148 (7.6-12.5 px away, its radius 12.9-14.5 px). The dot is about 6 px wide at 360 px, so the contact reads through the sleeves and the box |
| Shots: 1A 1.80 s, 1B 1.50 s, 1C 1.66 s, each starting on its word | **PASS** | 54, 45 and 50 frames; starts on frame 0, "face" f54, "buy" f99 |
| User's rules on every still and in motion | **PASS** | 69 of 69, `STILLS-r2.md`. Faces and captions were checked on all 200 frames |
| Rewind: frame 896 equals frame 0 | **NOT TESTED** | Needs the full film. Precondition holds: frame 0 is the `STARE` state and two caption-free renders of it are byte-identical (same SHA-256) |
| Measure, 0-4.96 s | **PASS** | Table below |

## Measurement, 0-4.96 s

`cut-v4/tools/measure_hook.py` runs `reference-study/measure.py`'s own `measure()` on the first 4.96 s, as in `reference-metrics-audit.md`.

| Measure | Target | Result | |
|---|---|---|---|
| Frames with camera motion | 33 % or more (full-film guide 33-70 %) | **40.8 %** (coverage 98.7 %) | pass, inside the guide |
| Brightness, median luma | 78.6-154.3 | **109.7** | pass |
| Contrast, high minus low luma | 95-145 | **144.5** | pass, at the top of the range |
| Saturation, median | 19.6-28 | **22.5** | pass |
| Hard changes at the 0.28 threshold | report only | **0** | |

Round 1 measured motion 91.8 %, contrast 135.0, saturation 22.6. Removing the sway dropped motion to 42.9 % (no tracking changes, only the punches and the 1C rise are counted), which passes without any added travel. The first round-2 render measured contrast 151.0, over the limit. Two changes brought it back: the mirror's lit windows were dimmed (147.0), then the black point was lifted in the grade (144.5). The three measurements are in `attempt-contrast/`.

## Sound (card 1 sound column)

All generated in `sound.mjs`, one reusable buffer per kind.

| Frame | Cue |
|---|---|
| 0, 11, 21, 32, **42** | fork tick, one buffer, 7 dB under the voice speech level; the tick at f42 is over before "of his" (f49) |
| 46 | case hum comes in under "his face" and stays low |
| 72 | low felt-piano note ("then") |
| 80 | door bell, offscreen ("came") |
| 99, 103 | coin clinks ("buy") |
| 112 | box tap ("cake", the corrected time) |
| **185** | **quiet earring tick** (45 % of a fork tick), with the earring highlight, on the corrected "pierced" |
| 140 | street air starts rising |
| 0-200 | room tone |

Effects 7-9 dB under the voice speech level, beds 15-16 dB under each; added sound about 6 dB under the voice in speech. Mix peak -1.45 dBFS, integrated -15.8 LUFS (the full proof's -14 LUFS is not a hook gate), loudness range 1.0 LU.

## Built from

`cut-v4/`: `Cafe.tsx`, `story.ts` (exports `STARE` and `stare(k)`), `Film.tsx`, `consts.ts`, `timing.ts`, `captions.mjs`, `rules.ts` + `rules.mjs` (`box` mode added), `sound.mjs`, `tools/` (`words.mjs`, `model.bin`, `measure_hook.py`).
Render: `node pipeline/render.mjs shorts/fragrant-flower/cut-v4/Film.tsx HookB video out/hook-v4/hook-B-r2.mp4 --scale 0.6666666666666666 --props '{"ppm":1300,"audio":"hook-sound.wav"}' --public shorts/fragrant-flower/cut-v4/public` (about 45 s).
