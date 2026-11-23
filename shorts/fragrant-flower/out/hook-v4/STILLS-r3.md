# Hook B round 3: stills and rule check (2026-11-23)

Answers `review-r2.md` (7/10: 1 blocker, 2 majors). Contact sheet: `stills/contact-sheet.png`. Stills are 720x1280, captions on, in `stills/`: f0, f26, f54, f72, f74, f76, f78, the coin handoff f98-104, the box f108, f112, f114, f123, f148, f149, f175, f185 and the 2B opening f209, f212, f215. 360-px copies: `f0000_360w.png`, `f0054_360w.png`, `f0072_360w.png` to `f0078_360w.png`, `f0098_360w.png` to `f0104_360w.png`, `f0112_360w.png`, `f0114_360w.png`, `f0209_360w.png`. Earlier rounds are in `r1-archive/` and `r2-archive/`.
Numbers come from `rules.json` and `node cut-v4/rules.mjs <frames>` (`... box` and `... drift` modes); hands and lettering are my reading of the stills.

## Result: rules 71 passed of 71 checked

60 per-still checks (12 stills x 5), 6 film-level checks, 3 box-handoff checks and 2 coin-transfer checks.

| Check | Result |
|---|---|
| Shots 1.5-2 s, each starting on its word | PASS: 1A 54, 1B 45, 1C 50 frames; 2A f149-208 is 60 frames (2.00 s) and the cut to 2B lands on "intimidating" at f209 (6.95 s, 208.5 rounded) |
| Captions white, bold, 70 %, 1-2 words, clear of faces | PASS on all 216 frames |
| Camera always drifting | PASS: smallest per-frame move 0.160 % of the distance to the focus point; no two consecutive frames identical (framemd5) |
| Nobody frozen | PASS: breath, blinks, fork tremble; in 2B he walks |
| Light follows the time of day | PASS: see the time-jump table below |
| Test still of every shot | PASS: 1A f26, 1B f76, 1C f123, 2A f175, 2B f209 |
| Box handoff: clear of the caption band | PASS: bottom edge at most 66.3 % down the frame on f99-148 (band starts at 67.3 %), all 50 frames |
| Box handoff: fingertips on the rear lip | PASS: from f102 to f148 the dot is 7.6-12.5 px from the lip point with a radius of 12.9-14.5 px (it overlaps the lip every frame) |
| Box handoff: readable at 360 px | PASS: `f0103_360w.png`, `f0112_360w.png`, `f0114_360w.png`: coins, white box and slice, sleeves. The dot hand stays small by decision |
| Coin transfer at f99 | PASS: the dot carries coin 1 down and sits on its near-left rim on f99; the resting coin is at the projected spot the carried coin glided to (f98), with no jump (`f0098_360w.png` to `f0100_360w.png`) |
| Coin transfer at f103 | PASS: same for coin 2 (`f0102_360w.png`, `f0103_360w.png`, `f0104_360w.png`). On f102 the carried coin is already behind the table's rear edge, so for one frame only the dot shows |

## Per still

| Still | Faces inside frame, above 70 % | Caption clear of faces, 1-2 words | Dot hand on each moving prop | Props 15-40 (projected) | Invented text only |
|---|---|---|---|---|---|
| f0 STARE | PASS: her x 21-62 %, bottom 54 %; his reflection x 35-80 %, bottom 41 % | PASS: no caption | PASS: cast B dot hand on the fork, trembling | PASS: 35 | PASS: mirror-written "Tovel / Brolane / Vorlin / Pamquet / Trumel" (invented, reversed in the glass) |
| f26 1A middle | PASS: her x 19-62 %, bottom 56 %; his reflection x 34-81 %, bottom 42 % | PASS: "terrified" (1) | PASS: same dot hand and fork | PASS: 33 | PASS: same, reversed |
| f54 1B start, "face" | PASS: her x 15-62 %, bottom 58 %; his reflection x 32-84 %, bottom 42 % | PASS: "face..." (1) | PASS: same, steadier | PASS: 27 | PASS: same, reversed |
| f72 "then" | PASS: her x 11-63 %, bottom 61 %; his reflection x 30-85 %, bottom 43 % | PASS: "then" (1) | PASS: same (dissolve starts) | PASS: 28 | PASS: same, reversed |
| f76 1B middle | PASS: her x 10-63 %, bottom 61 %; his reflection x 30-86 %, bottom 43 % | PASS: "then" (1) | PASS: morning layer: coin hand carrying the coin; fading evening fork in its dot hand | PASS: 28 | PASS: same, reversed |
| f99 coin 1 released, "buy" | PASS: her x 15-61 %, bottom 55 %; his reflection x 32-82 %, bottom 36 % | PASS: "to buy" (2) | PASS: dot overlaps the near-left rim of coin 1 on the table; coin 2 in the dot hand | PASS: 18 | PASS: same, reversed |
| f103 coin 2 released, box push | PASS: her x 17-61 %, bottom 52 %; his reflection x 32-81 %, bottom 34 % | PASS: "to buy" (2) | PASS: dot overlaps coin 2; other dot on the box rear-right lip | PASS: 21 | PASS: same, reversed |
| f114 | PASS: her x 18-60 %, bottom 49 %; his reflection x 33-80 %, bottom 31 % | PASS: "him cake." (2) | PASS: dot on the lip, hold through the pause | PASS: 27 | PASS: same, reversed |
| f123 1C middle | PASS: her x 18-60 %, bottom 49 %; his reflection x 33-81 %, bottom 31 % | PASS: no caption | PASS: dot on the lip, other hand resting | PASS: 26 | PASS: same, reversed |
| f149 2A start, "is" | PASS: his real face x 32-82 %, bottom 30 % | PASS: "is" (1) | PASS: no moving prop | PASS: 18 | PASS: "Wennavi Corsel" sign, bunting, "Fumbrel" |
| f175 2A middle | PASS: his real face x 34-62 %, bottom 32 % | PASS: "blond," (1) | PASS: no moving prop (right hand rising to the strap) | PASS: 35 | PASS: "Wennavi Corsel", "Fumbrel", "Oskarel / Pimbrey / Dallowt / Kesperin" |
| f209 2B opening, "intimidating" | PASS: his real face x 33-82 %, bottom 39 % | PASS: "intimidating" (1) | PASS: no moving prop (hands in pockets, walking) | PASS: 15 | PASS: "Oskarel" board (cropped), "Tovel" menu inside the shop |

By-eye count of props at f209 (2B): two hanging baskets, four bunting flags, window box, notice board, lantern at the left edge, the shop's menu board, a wall frame inside, the wall clock, the A-frame board, the bike wheel and the planter. That is 15 and borderline; the checker also gives 15.

## Astra's findings, row by row

| Finding | What I did | Result |
|---|---|---|
| Blocker: the glass reads as a man in another room | (a) The mirror is wider (1.30 m, glass x .23-1.53) and her reflected back-of-head card is shifted 42 cm to the left of her real head, so a dark hair arc and a shoulder sit against a lit panel at the lower left, clear of her real hair and of his apron. Her reflection leans in step with her startle recoil at f18-44 (opposite sign, since a flipped card turns a lean the other way). (b) A menu card hangs in the glass with the shop's invented words **written backwards**: "Tovel / Brolane / Vorlin / Pamquet / Trumel". (c) The hanging lamp, ceiling beam and shop door are gone; what is left is shallow: a flat lit panel, the menu card, a close case with cakes and the booth back. (d) Thin light bevel strip with a bright edge line along the walnut frame, age spots crowded toward the edges, edge falloff, and a faint diagonal sheen across his shoulder only | Improved; issue 1. Not tested on a viewer |
| Major: coins | See the two coin-transfer checks. Coins now land at the back of the table, just under the rear edge, so the dot stays in view | Fixed |
| Major: the time jump | 1A: broad low amber side-light from the right (sun from the side windows) across her cheek, the plates and the booth back. Through the f72-78 dissolve: neutral daylight from a front window on the left, from the other side (sun moved from the right-hand windows to a front window on the left), and **she is in her school clothes** after the dissolve (same seat and pose). Contrast was re-tuned afterwards | Done |
| Contrast | 137.0 (see `REPORT.md`) | Under 140 |
| Render length | Frames 0-215, 2B opening state at f209-215 | Done |

## Time jump evidence

| Sample | Evening (f0, f54) | Morning (f78, f114) |
|---|---|---|
| Tabletop colour, fixed region, R/B | 4.32 / 4.36 (amber: 164,85,38 and 170,89,39) | 1.34 / 1.30 (neutral: 115,85,86 and 117,88,90) |
| Her clothes | blouse and cream sleeves | school coat (pink), same seat |
| Sun | from the right-hand side windows, low (the same side as before) | from a front window on the left, high; the shadow direction was changed by moving the sun, I did not measure it |

A muted, caption-covered playback has not been shown to a viewer.

## Open issues

1. **The mirror read is not tested.** At 360 px the reversed menu card, the frame, the sheen and the dark hair arc at the lower left are there; at f0 the hair arc is small. A viewer may still need a moment.
2. **The evening light is strong orange** on the table (R/B 4.3, chroma 21.4 overall). It makes the time jump obvious, but it is warmer than the restraint rule's muted palette suggests.
3. **Contrast was held down by the grade:** black point lifted to .13-.14 and the highlight capped at .94, so the picture is flatter than before. Contrast 137.0 passes 95-145 and the soft 140 goal; brightness 108.3, saturation 21.4.
4. **Camera motion 44.9 % comes from bursts**, not from the baseline drift of about 0.16-0.24 %.
5. **The dot hands stay small** by decision (about 6 px at 360 px). The sleeves lead the eye.
6. **The resting box sits in the caption band for f72-97**, before the handoff.
7. **2B is only an opening state:** seven frames, a short walk cycle, two placeholder blurred backs, and 1.7 degrees of the 4 degree roll by f215. The backs and the walk need building.
8. **The dissolve blends her cafe blouse into the school coat** over six frames (f74-78); mid-dissolve both are visible.
9. **Words after 7.5 s are unverified** (15 midpoints).
10. **Prop counts have no occlusion test;** f90 and f209 sit at exactly 15.
11. **Rewind gate untested** (frame 0 renders byte-identically twice).
12. **Hook cold-viewer test still not run.** The frame 0 to 1 change is small (mean 1.4 of 255).
