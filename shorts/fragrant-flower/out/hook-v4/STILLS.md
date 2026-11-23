# Hook B stills, test pass 1 (2026-11-23)

Contact sheet: `stills/contact-sheet.png` (11 frames, 360 px each). Stills are 720x1280, captions on, in `stills/`:
f0, f26 (1A middle), f54, f72, f76 (1B middle), f114, f123 (1C middle), f149, f175 (2A middle), plus f75 (mid dissolve) and f148 (last hook frame) as extras that are not scored. `f0000_360w.png` and `f0054_360w.png` are the 360-px copies.
Nothing has been rendered as motion and there is no sound yet. Source is in `../../cut-v4/`. Rule numbers come from `rules.json`, computed from the same story data the render uses (`node cut-v4/rules.mjs <frames>`). The hand and lettering columns are my reading of the stills.

## Result: rules 50 passed of 51 checked, 11 open issues

## Word times

`production-pipeline-proposal/voice/johnny-take-02/words-v3-corrected.json`. **This is not forced alignment**: no Whisper model is installed on this machine (the filter exists, the model file does not). I re-read the hook words (0-5.3 s) from the v3 master with a 5 ms energy envelope and spectrograms, taking plosive bursts and fricative onsets as word starts. Phrase edges (0.06, 2.100, 2.400, 4.058, 4.558) are exact. **Words after 5.3 s are copied unchanged from v3 and are not yet checked.**

Words that moved more than 2 frames:

| Word | v3 | corrected | move |
|---|---|---|---|
| terrified | 1.080 s (f32) | 0.865 s (f26) | -6.5 frames. The stressed "ter" bursts at 0.87 s; v3 had put the word on the second syllable |
| cake | 3.803 s (f114) | 3.720 s (f112) | -2.5 frames. The k burst is at 3.72 s; v3 had the vowel |
| his | 1.631 s | 1.700 s | +2.1 frames. Uncertain by about 3 frames: "of his" is one 0.18 s reduced stretch |

Moved but within 2 frames: girl +0.4, of +1.2, back +0.4, to -0.4, him +0.2. Unchanged: looked, face (f54), then, came, buy (f99), is (f149).
**Shot starts in card 1 did not move:** 1A f0, 1B f54, 1C f99, handoff f149. Two staging cues inside the shots did: the wide eyes and 0.6 % punch now land on f26 (card said f32), and the box stops on f112 (card said f114).

## Rules check per still

| Still | Faces inside frame, above 70 % | Caption clear of faces (words) | Hand on each moving prop | Props 15-40 | Invented text only |
|---|---|---|---|---|---|
| f0 STARE | PASS: her 0.16-0.48 x, bottom 41 %; his reflection 0.55-0.88 x, bottom 33 % | PASS: no caption | PASS: fork in her right hand, trembling, dot visible left of her head | PASS: 39 | PASS: none visible |
| f26 1A middle | PASS: her 0.15-0.47 x, bottom 41 %; his reflection 0.55-0.90 x, bottom 32 % | PASS: "terrified" (1) | PASS: fork in hand, tremble | PASS: 38 | PASS: mirror, no lettering |
| f54 1B start, "face" | PASS: her 0.11-0.47 x, bottom 40 %; his reflection 0.56-0.93 x, bottom 31 % | PASS: "face..." (1) | PASS: fork in hand, steadier | PASS: 35 | PASS: none visible |
| f72 "then" | PASS: her 0.08-0.47 x, bottom 39 %; his reflection 0.56-0.96 x, bottom 30 % | PASS: "then" (1) | PASS: fork in hand (dissolve starts) | PASS: 31 | PASS: none visible |
| f76 1B middle | PASS: her 0.08-0.47 x, bottom 39 %; his reflection 0.56-0.96 x, bottom 29 % | PASS: "then" (1) | PASS: fork fading with the evening layer, morning hands resting | PASS: 18 | PASS: none visible |
| f114 | PASS: her 0.16-0.47 x, bottom 41 %; his reflection 0.55-0.89 x, bottom 33 % | PASS: "him cake." (2) | PASS: left hand on the box rear edge; right hand lifted off the second coin | PASS: 25 | PASS: none visible |
| f123 1C middle | PASS: her 0.16-0.48 x, bottom 41 %; his reflection 0.55-0.88 x, bottom 33 % | PASS: no caption | PASS: left hand still on the box; right hand returning | PASS: 26 | PASS: none visible |
| f149 2A start, "is" | PASS: his real face 0.55-0.88 x, bottom 33 % | PASS: "is" (1) | PASS: no moving prop | PASS: 29 | PASS: "Wennavi Corsel" (sign, cut by the top edge), no other text |
| f175 2A middle | PASS: his real face 0.37-0.61 x, bottom 44 % | PASS: "pierced," (1) | PASS: no moving prop (hand rising to the strap) | PASS: 30 | PASS: "Wennavi Corsel", "Oskarel" board with "Pimbrey / Dallowt / Kesperin" |

Film-level checks (from the story data, not pixels):

| Check | Result |
|---|---|
| Shots 1.5-2 s, each starting on its word | PASS: 1A f0-53 = 1.80 s, 1B f54-98 = 1.50 s, 1C f99-148 = 1.67 s; starts on first frame, "face", "buy" |
| Captions white, bold, 70 % height, 1-2 words | PASS: 16 captions, none over 2 words, all at 70 % |
| Camera always drifting | PASS: smallest per-frame move over frames 0-198 is 0.164 % of the distance to the focus point, no stationary frame |
| Nobody frozen | PASS by construction: her blinks at f9, f40, f66, f76, f118, his at f30, f64-69, f124 (longest gap 55 frames = 1.8 s), both breathe, the fork trembles. Not yet proven on motion frames |
| Light follows the time of day | **NOT PASSED**, see issue 8 |
| Test still of every shot before motion | PASS: 1A, 1B, 1C and 2A each have one |

## Open issues

1. **Word times are an energy-envelope reading, not alignment**, and only the hook is covered (table above). "of his" is uncertain by about 3 frames.
2. **Two card cues moved with the words:** the "terrified" widening and punch (f32 -> f26) and the box stop (f114 -> f112). Sound ticks at f0, 11, 21, 32 are untouched.
3. **Framing differs from the card.** Two heads side by side in a 9:16 frame cannot also be a close-up with a 0.3 % push for 54 frames. The camera starts about 5 m back, so her head is 27-34 % of the width, not a close-up. The baseline push is 0.19 % per frame (0.6 % punches as written) so the two heads still fit at the peak: her left edge 6 % from the frame, his right edge 1.8 %. That is tight.
4. **His reflected head is not "bigger than hers".** At the scale that fits the glass it is about the same width as hers (reflection scale 1.0).
5. **Captions:** "him cake." is one two-word caption because "him" is only 3 frames long after correction. "looked" is 4 frames. "of his", "to buy", "tall, blond," and "and so" are two-word groups. Two words where the second is not short ("him cake.") bends the rule.
6. **Hands and coins read weakly.** The rig's hands are small dots. Her fork hand is visible at 360 px but tiny. At f114 the box and its slice read, but the two coins are thin dashes at the table's near edge, because the table is seen almost edge-on. The hook gate "coins and box readable at f114" is **not met for the coins**. The table also hides most of her arms.
7. **The mirror proof is weak.** The rig draws an earring on both of his ears, so the "earring on the swapped side" cannot show. Only the swept hair tells that the reflection is flipped. The reflection is a flat card on the glass in front of a painted backdrop (cooler, darker, softened until f54), as the card allows.
8. **Light is under-told.** The evening shots show low gold sun streaks on the wall but the room is dim and violet. The morning is brighter and warmer, yet its shadows stay violet and the floor is the only strongly warm area. Day versus next morning reads on the dissolve; "late-afternoon gold" does not read strongly. I did not spend a repair pass on it.
9. **Shot 2A is thin:** his hands hang by his sides (not in pockets); the pull-back is small because his full height already fits at f149; the sign text is cut by the top edge at f149; the earring glint on "pierced" is a 4-frame white dot, which may count as a flash under the art rules. Bollards and the A-frame board are the street's only foreground.
10. **The plate tower is 11 plates tall (card: nine)** so the top plate and slice hide her mouth from the camera.
11. **Prop counts are a projected manifest with no occlusion test.** f0 shows 38 of 40, which includes each plate stack and each cake slice as its own prop. I did not count the visible set by eye, so the true count may be lower.

## Changes that were not render blockers

None needed a fix to render. The Remotion bundle builds cleanly; each still takes about 1.3 s at 720x1280.

## Files written

- `shorts/fragrant-flower/cut-v4/`: `Cafe.tsx` (copy of the set with mirror, invented-word signs and menu, tabletop props, street dressing), `story.ts` (card 1 and shot 2A; exports `STARE` / `stare(k)`, the frame-0 state, as the shared reusable state), `Film.tsx`, `consts.ts`, `timing.ts`, `captions.mjs` + `captions.json`, `rules.ts` + `rules.mjs`.
- `shorts/fragrant-flower/out/hook-v4/`: `stills/`, `rules.json`, this file.
- `production-pipeline-proposal/voice/johnny-take-02/words-v3-corrected.json`.

Render command used: `node pipeline/render.mjs shorts/fragrant-flower/cut-v4/Film.tsx HookB stills <out dir> --frames <list> --scale 0.6666667 --props '{"ppm":1300}'`. Add `"captions":false` to the props for the frame-896 match.
