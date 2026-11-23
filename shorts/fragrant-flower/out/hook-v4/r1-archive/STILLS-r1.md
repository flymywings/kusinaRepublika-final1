# Hook B round 1: stills and rule check (2026-11-23)

Contact sheet: `stills/contact-sheet.png` (13 frames). Stills are 720x1280, captions on, in `stills/`: f0, f26 (1A middle), f54, f72, f76 (1B middle), f114, f123 (1C middle), f149, f175 (2A middle), plus unscored f75, f148, f152, f160. 360-px copies: `f0000_360w.png`, `f0054_360w.png`, `f0114_360w.png`. The round-0 stills are kept in `stills-r0/`.
Rule numbers come from `rules.json`, computed from the story data the render uses (`node cut-v4/rules.mjs <frames>`); hands and lettering are my reading of the stills.

## Result: rules 51 passed of 51 checked

45 per-still checks (9 scored stills x 5) and 6 film-level checks. The film-level ones:

| Check | Result |
|---|---|
| Shots 1.5-2 s, each starting on its word | PASS: 1A f0-53 = 1.80 s, 1B f54-98 = 1.50 s, 1C f99-148 = 1.67 s. Starts: first frame, "face" (53.9), "buy" (99.2) |
| Captions white, bold, 70 % height, 1-2 words | PASS: 16 captions, none over 2 words, none over a face on any of the 200 frames |
| Camera always drifting | PASS: smallest per-frame move is 0.205 % of the distance to the focus point (0.15 % needed). No two consecutive frames are identical (framemd5 on the render) |
| Nobody frozen | PASS: breath on both, blinks every 0.5-2.3 s, fork tremble, 5 cm hand-held sway |
| Light follows the time of day | PASS: evening average R/B 1.69 (gold) against morning 1.33 (neutral); the morning is brighter than before. See issue 5 |
| Test still of every shot before motion | PASS: 1A, 1B, 1C, 2A each have one |

## Per still

| Still | Faces inside frame, above 70 % | Caption clear of faces, 1-2 words | Hand on each moving prop | Props 15-40 | Invented text only |
|---|---|---|---|---|---|
| f0 STARE | PASS: her x 21-62 %, bottom 55 %; his reflection x 35-80 %, bottom 39 % | PASS: no caption | PASS: big fist on the fork, trembling, left of the tower | PASS: 34 | PASS: none visible |
| f26 1A middle | PASS: her x 20-63 %, bottom 55 %; his reflection x 35-83 %, bottom 38 % | PASS: "terrified" (1) | PASS: same fist and fork | PASS: 33 | PASS: none visible |
| f54 1B start, "face" | PASS: her x 13-61 %, bottom 57 %; his reflection x 31-82 %, bottom 38 % | PASS: "face..." (1) | PASS: same, steadier | PASS: 28 | PASS: none visible |
| f72 "then" | PASS: her x 13-64 %, bottom 60 %; his reflection x 32-86 %, bottom 40 % | PASS: "then" (1) | PASS: same (dissolve starts) | PASS: 29 | PASS: none visible |
| f76 1B middle | PASS: her x 15-67 %, bottom 61 %; his reflection x 34-89 %, bottom 40 % | PASS: "then" (1) | PASS: morning layer: hands resting; fading evening fork still in its fist | PASS: 28 | PASS: none visible |
| f114 | PASS: her x 15-57 %, bottom 55 %; his reflection x 31-78 %, bottom 35 % | PASS: "him cake." (2) | PASS: the hand that set the coins down is lifting away, the other hand is on the box rear edge and slid it | PASS: 21 | PASS: none visible |
| f123 1C middle | PASS: her x 19-61 %, bottom 54 %; his reflection x 34-81 %, bottom 33 % | PASS: no caption | PASS: right hand still on the box, left hand returning | PASS: 25 | PASS: none visible |
| f149 2A start, "is" | PASS: his real face x 31-78 %, bottom 34 % | PASS: "is" (1) | PASS: no moving prop | PASS: 17 | PASS: "Wennavi Corsel" sign, awning |
| f175 2A middle | PASS: his real face x 37-64 %, bottom 31 % | PASS: "blond," (1) | PASS: no moving prop (right hand rising to the strap) | PASS: 28 | PASS: "Wennavi Corsel", "Oskarel / Pimbrey / Dallowt / Kesperin" board |

## The six fixes

| # | Fix | Result |
|---|---|---|
| 1 | Mirror | Done, one part weak. Glass shows a bright window, a lamp with a warm cone, part of the display case with cakes, chairs, silvering spots, a soft diagonal sheen, a light bevel and a walnut frame with corner rosettes. The mirrored back of her head is a flipped, blurred card at her mirrored place; it reads as a dark mass behind her and merges with his dark apron (issue 3) |
| 2 | His face | Done. Default lidded "Guarded" face, no worried brows |
| 3 | Composition | Done. Her face is at the middle (eyes about 45 % height, face box bottom 54-61 %). His reflected head sits above and behind her, about 1.1 times her width, top at 7 %, inside the glass on all 149 frames. The camera is at plate height. Bottom 30 % is the plate tower, table top, near plates and cups, no floor or legs |
| 4 | Light | Done. Evening sun band from the side windows across her and the wall; the morning is a neutral bright daylight preset |
| 5 | Shot 1C | Done. Camera raised to 1.72 m, table seen at about 27 degrees. Coins, box and both of her hands read at 360 px (`stills/f0114_360w.png`) |
| 6 | Shot 2A | Done, see issue 7. It starts on his face at the exact size and place of the reflected head, pulls back to full height, hands in pockets. Street: awning, bikes, bench, bins, bollards, flower stand, mailbox, planters, sign pole, lamp post, sign boards, shop signs, a tall building behind. No empty sky |

## Word times (tools/words.mjs, `words-v3-corrected.json`)

Method as in cut-v3.mjs: the ffmpeg `whisper` filter (`model=model.bin`, `max_len=1`, json, cwd = the model's folder) on the v3 master. The model was copied to `cut-v4/tools/model.bin`. Whisper's own starts are rough (it often stamps word ends), so each start was snapped to the nearest 9 dB energy onset. The hook words (0-7.0 s) are the hand-checked values from the spectrograms. Phrase edges and the marks words are exactly v3.
Status counts: 23 locked, 19 hand-checked, 101 whisper plus onset, 22 where v3 and whisper agree, **15 fallback midpoints that are unverified**. 67 words moved more than 2 frames.
Moves inside the hook and 2A (0-7.5 s):

| Word | v3 | corrected | move |
|---|---|---|---|
| terrified | 1.080 | 0.865 | -6.5 frames |
| his | 1.631 | 1.700 | +2.1 |
| cake | 3.803 | 3.720 | -2.5 |
| blond | 5.274 | 5.660 | +11.6 |
| pierced | 5.663 | 6.160 | +14.9 |
| and | 6.159 | 6.670 | +15.3 |
| so | 6.382 | 6.780 | +11.9 |
| intimidating | 6.670 | 6.950 | +8.4 |

Whisper confirmed the hand reading that v3 was badly off from "tall, blond, pierced". Card 2B must now start on "intimidating" at 6.95 s, not 6.67 s. The 2A shot (f149-199) now ends on "and" (6.67 s). Shot starts in card 1 did not move: f0, f54, f99, f149. Beyond 7.5 s, 11 words moved more than 6 frames (for example "strangers" +6.6, "run" +9.1, "and" -11.1, "stared" -11.9); none of that is checked by ear.

## Open issues

1. **Words after 7.5 s are an automatic reading** (15 of 180 are unverified midpoints). They need a listen before cards 3-7 are cut.
2. **Card 2B and later start times change**: "intimidating" is at 6.95 s, so 2B, 2C and 2D shift.
3. **Her mirrored back of head is not clearly hair.** It merges with his dark apron, so fix 1 is only partly met.
4. **"Fork hand in the bottom 30 %"** is not met. A hand low enough to be there is hidden behind the plates, so the fork hand sits at about 55 % beside the tower.
5. **Light is a tone preset, not the sun lamp.** The surface shading uses the mood colours, so the scene's sun colour and intensity barely change the picture. The evening still has violet shadows on the table.
6. **The big hands are drawn on top of cast B's own hand dots.** That is an addition to the approved rig (it is not changed, the overlay is drawn after it). It needs the user's call.
7. **2A pull-back is a 14-frame move** that completes at f163; the card says by "tall" (f156). A faster one would break the 25 px per frame limit. A 4-frame white dot glints on "pierced"; it may count as a flash.
8. **Sway:** the camera has a 5 cm hand-held sway. It was added because the baseline push of 0.22 % per frame measured as 20 % camera motion. Motion is now 91.8 %, which passes the hook gate (33 % or more) but is above the 33-70 % guide for the full proof, so the film may feel busy.
9. **Prop counts** come from a projected list with no occlusion test; the top is 35 at f2.
10. **Her free hand hovers in the air** before it takes the coin (f80-98) and can read as a wave.
11. **The rig draws two earrings on him,** so "earring on the swapped side" cannot show.
12. **Cold-viewer test not run.** The hook still needs its unbriefed watch.
