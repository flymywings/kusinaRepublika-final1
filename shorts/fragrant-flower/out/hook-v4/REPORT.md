# Hook B round 3: render, measurement and gates (2026-11-23)

Video: `hook-B-r3.mp4` (720x1280, 30 fps, 216 frames = 7.2 s, H.264 and AAC) and `hook-B-r3-360w.mp4` (360x640). Frames 0-148 are card 1, 149-208 are 2A (60 frames, 2.00 s), 209-215 are the opening state of 2B after the cut on "intimidating".
Sound: `../../cut-v4/public/hook-sound.wav` (now 7.2 s) and `hook-sound.cues.json`, built by `cut-v4/sound.mjs`. Stills, rule check and the answer to each row of `review-r2.md`: `STILLS-r3.md`. Earlier rounds: `r1-archive/`, `r2-archive/`.
Not run: the hook cold-viewer test.

## Gates: 7 passed of 8

| Gate | Result | Evidence |
|---|---|---|
| Voice untouched, "This" on frame 2 | **PASS** | The v3 master is placed sample for sample at gain 1.0 (resampled only); `sound.mjs` turns down only the added sound if the sum would clip (2.5 dB). The AAC render aligns with the master at lag 0, correlation 0.9744 over 7.2 s. "This" starts at 0.062 s (frame 2) |
| Frame 0: motion by frame 1, both faces readable at 360 px, his reads as a reflection | **PASS, read untested** | Frame 0 to 1 difference: mean 1.4 of 255. `stills/f0000_360w.png`: her face aimed up at him, his lidded face in a walnut frame with a bevel, sheen, spots, a **mirror-written "Tovel" menu card** and her reflected hair against a lit panel. A cold viewer has not been shown it |
| His reflected face sharp and readable by f54 | **PASS** | Edge density of his face area 4.39 at f0, 6.63 at f54 (+51 %); focus lands on him by f54; the rack is unchanged |
| Coins and box readable at f114, each placed by a visible hand | **PASS, hand small** | Both coin releases (f99, f103) have the dot on the coin's rim and the resting coin at the same projected spot; the box clears the caption band on all 50 frames and the dot sits on its rear lip from f102 to f148 (`STILLS-r3.md`). The dot is about 6 px wide at 360 px by decision |
| Shots: 1A 1.80 s, 1B 1.50 s, 1C 1.66 s, each starting on its word | **PASS** | 54, 45 and 50 frames; starts on frame 0, "face" f54, "buy" f99. 2A is 60 frames and the cut falls on "intimidating" at f209 |
| User's rules on every still and in motion | **PASS** | 71 of 71, `STILLS-r3.md`. Faces and captions were checked on all 216 frames |
| Rewind: frame 896 equals frame 0 | **NOT TESTED** | Needs the full film. Precondition holds: frame 0 is the `STARE` state and two caption-free renders of it are byte-identical (same SHA-256) |
| Measure, 0-4.96 s | **PASS** | Table below |

## Measurement, 0-4.96 s

`cut-v4/tools/measure_hook.py` runs `reference-study/measure.py`'s own `measure()` on the first 4.96 s, as in `reference-metrics-audit.md`.

| Measure | Target | Result | |
|---|---|---|---|
| Frames with camera motion | 33 % or more (full-film guide 33-70 %) | **44.9 %** (coverage 98.7 %) | pass, inside the guide |
| Brightness, median luma | 78.6-154.3 | **108.3** | pass |
| Contrast, high minus low luma | 95-145 (goal 140 or lower) | **137.0** | pass, under the goal |
| Saturation, median | 19.6-28 | **21.4** | pass |
| Hard changes at the 0.28 threshold | report only | **0** | |

The amber evening raised contrast to 152.5 on the first render. Two changes brought it down, both in the look and not in the story: the amber mood was softened (lit 1.95/1.40/.85 to 1.75/1.32/.90, shadows lifted), then the grade's black point was lifted to .13-.14 and its highlight capped at .94. The measurements are in `attempt-contrast/` (152.5, 146.0, 136.5; the last render of the final cut measures 137.0). Round 2 measured contrast 144.5, saturation 22.5, motion 40.8 %.

## Sound (card 1 sound column, 7.2 s)

Unchanged from round 2, all generated in `sound.mjs`: fork ticks at f0, 11, 21, 32, 42 (one buffer, 7 dB under the voice speech level), the case hum under "his face", the piano note on f72, the bell on f80, coin clinks on f99 and f103, the box tap on f112, a quiet earring tick on f185, street air from f140, and room tone. Mix peak -1.49 dBFS, integrated -15.9 LUFS, loudness range 1.2 LU. No new cue was added for 2B.

## Built from

`cut-v4/`: `Cafe.tsx`, `story.ts` (exports `STARE`, `stare(k)`), `Film.tsx` (camera roll added), `consts.ts`, `timing.ts` (216 frames), `captions.mjs` (adds "and so" and "intimidating"), `rules.ts` + `rules.mjs`, `sound.mjs`, `tools/`.
Render: `node pipeline/render.mjs shorts/fragrant-flower/cut-v4/Film.tsx HookB video out/hook-v4/hook-B-r3.mp4 --scale 0.6666666666666666 --props '{"ppm":1300,"audio":"hook-sound.wav"}' --public shorts/fragrant-flower/cut-v4/public` (about 47 s).
