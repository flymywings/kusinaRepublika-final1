# Hook B round 2: stills and rule check (2026-11-23)

Answers `review-r1.md` (6/10: 1 blocker, 4 majors, 2 minors). Contact sheet: `stills/contact-sheet.png`. Stills are 720x1280, captions on, in `stills/`: f0, f26, f54, f72, f75, f76, **f103, f108, f112, f114** (the box handoff, with 360-px copies `f0103_360w.png` ... `f0114_360w.png`), f123, f148, f149, f152, f160, f175, f185. Round-1 material is in `r1-archive/`.
Rule numbers come from `rules.json` and `node cut-v4/rules.mjs <frames>` (`... box` for the box handoff); hands and lettering are my reading of the stills.

## Result: rules 69 passed of 69 checked

60 per-still checks (12 stills x 5), 6 film-level checks and 3 box-handoff checks.

| Check | Result |
|---|---|
| Shots 1.5-2 s, each starting on its word | PASS: 54, 45 and 50 frames (1.80, 1.50, 1.67 s); starts on frame 0, "face" f54, "buy" f99 |
| Captions white, bold, 70 % height, 1-2 words, clear of faces | PASS on all 200 frames |
| Camera always drifting | PASS: smallest per-frame move 0.160 % of the distance to the focus point; no two consecutive frames identical (framemd5) |
| Nobody frozen | PASS: breath, blinks every 0.5-2.3 s, fork tremble. No camera sway any more |
| Light follows the time of day | PASS: evening wall R/B 1.29-1.43, luminance 104-115; morning wall R/B 1.15-1.21, luminance 128-134 (cooler, neutral, brighter). See issue 5 |
| Test still of every shot before motion | PASS: 1A f26, 1B f76, 1C f123, 2A f175 |
| Box handoff, clear of the caption band | PASS: the box's bottom edge is at most 66.3 % down the frame on f99-148 (all 50 frames of 1C); the caption band starts at 67.3 % |
| Box handoff, fingertips on the rear lip | PASS: from the first push (f102) to f148 the cast B dot hand is 7.6-12.5 px (720 wide) from the lip point and its own radius is 12.9-14.5 px, so it overlaps the lip on every frame |
| Box handoff, readable at 360 px | PASS: `f0103_360w.png`, `f0108_360w.png`, `f0112_360w.png`, `f0114_360w.png` show the two coins, the white box, its slice and both sleeves reaching it. The dot hand itself is only about 6 px wide there (issue 1) |

## Per still

| Still | Faces inside frame, above 70 % | Caption clear of faces, 1-2 words | Dot hand on each moving prop | Props 15-40 (projected) | Invented text only |
|---|---|---|---|---|---|
| f0 STARE | PASS: her x 21-62 %, bottom 54 %; his reflection x 35-80 %, bottom 41 % | PASS: no caption | PASS: cast B dot hand holding the fork, trembling, against the booth wall | PASS: 33 | PASS: none visible |
| f26 1A middle | PASS: her x 19-62 %, bottom 56 %; his reflection x 34-81 %, bottom 42 % | PASS: "terrified" (1) | PASS: same dot hand and fork | PASS: 32 | PASS: none visible |
| f54 1B start, "face" | PASS: her x 15-62 %, bottom 58 %; his reflection x 32-84 %, bottom 42 % | PASS: "face..." (1) | PASS: same, steadier | PASS: 27 | PASS: none visible |
| f72 "then" | PASS: her x 11-63 %, bottom 61 %; his reflection x 30-85 %, bottom 43 % | PASS: "then" (1) | PASS: same (dissolve starts) | PASS: 28 | PASS: none visible |
| f76 1B middle | PASS: her x 10-63 %, bottom 61 %; his reflection x 30-86 %, bottom 43 % | PASS: "then" (1) | PASS: morning layer: hands resting; fading evening fork in its dot hand | PASS: 28 | PASS: none visible |
| f103 box push | PASS: her x 17-61 %, bottom 52 %; his reflection x 32-81 %, bottom 34 % | PASS: "to buy" (2) | PASS: dot on the rear-right lip of the box; second coin just down | PASS: 20 | PASS: none visible |
| f108 box push | PASS: her x 18-60 %, bottom 50 %; his reflection x 33-80 %, bottom 33 % | PASS: "to buy" (2) | PASS: dot on the lip, box mid-slide | PASS: 25 | PASS: none visible |
| f112 box stop, "cake" | PASS: her x 18-60 %, bottom 49 %; his reflection x 33-80 %, bottom 32 % | PASS: "him cake." (2) | PASS: dot on the lip, box stopped | PASS: 25 | PASS: none visible |
| f114 | PASS: her x 18-60 %, bottom 49 %; his reflection x 33-80 %, bottom 31 % | PASS: "him cake." (2) | PASS: dot on the lip, hold through the pause | PASS: 25 | PASS: none visible |
| f123 1C middle | PASS: her x 18-60 %, bottom 49 %; his reflection x 33-81 %, bottom 31 % | PASS: no caption | PASS: dot on the lip, other hand resting | PASS: 25 | PASS: none visible |
| f149 2A start, "is" | PASS: his real face x 32-82 %, bottom 30 % | PASS: "is" (1) | PASS: no moving prop | PASS: 18 | PASS: "Wennavi Corsel" sign, bunting, small sign "Fumbrel" |
| f175 2A middle | PASS: his real face x 34-62 %, bottom 32 % | PASS: "blond," (1) | PASS: no moving prop (right hand rising to the strap) | PASS: 35 | PASS: "Wennavi Corsel", "Fumbrel", board "Oskarel / Pimbrey / Dallowt / Kesperin" |

Hand count of visible props at **f149**, flags and jars counted one by one: wall lantern, three bunting flags, window box with flowers, window frame, two shelf jars, a third jar, interior menu board, interior wall frame, interior plant, notice board, planter with its plant, step crate, bucket, scooter wheel (bottom right), awning edge. That is 19. Projected count by the checker: 20.

## Astra's findings, row by row

| Finding | What I did | Result |
|---|---|---|
| Blocker, 99-114: box handoff | Removed the cake stand with its second slice and the near foreground slice. Box rests from f72, slides f102-112 along a short path at the back of the table, stops on "cake" (f112). The fingertips (the cast B dot) sit on its rear-right lip from the first push through f148, away from the slice. The camera rise starts at f91, so the box is out of the 70 % caption band from f98 | Fixed, see the three box checks. The box still sits under the caption band while it rests (f72-97, bottom edge up to 72 %), which is before the handoff |
| Major, 0-54: lids, mirror, startle | Her eyes are open from frame 0 (no half lids), aimed up and right toward his reflection, and widen through "terrified" (f26) and hold. The fork stays in its dot hand beside the clear booth wall at the left of the tower. Reflected hair is a darker, bluer silhouette against a big lit window painted behind it; his reflected apron is lighter. The glass now also holds a ceiling beam, the shop door behind the camera, the reflected booth back, a case with cakes, edge falloff and silvering | Improved; issue 2 |
| Major, 0-148: sway | Removed. 1A/1B is one push toward his face with a punch on "terrified" and on "face". 1C is one rise and settle onto her hands and the box with a steady push toward them, and one punch toward his reflection on "Rintaro". Camera motion measures 40.8 % | Fixed |
| Major, 0 and 99-123: hands | The overlay hands are gone from the code. Only the approved dot hands remain (plus a coin and the earring glint drawn on the card). Legibility comes from where the box sits, its pale silhouette against the dark table and the raised camera | Done; issue 1 |
| Major, 72-99: time of day | The morning is lit from a front window on the left with a neutral, brighter preset: pale diagonal bands, no gold on the wall after f78 | Done; issue 5 |
| Minor, 32-54: ticks | Fork tick added at f42 (same buffer, short decay, over before "of his" at f49). Ticks at f0, 11, 21, 32, 42; the hum stays under "his face" | Done |
| Minor, 170-185: earring | The 4-frame highlight and a quiet tick (45 % of a fork tick) now start at f185, the corrected "pierced". The old f170 cue is gone | Done |

## Word times

Unchanged from round 1 (`words-v3-corrected.json`, `tools/words.mjs`). Words after 7.5 s are still an automatic Whisper-plus-onset reading with 15 unverified midpoints.

## Open issues

1. **The dot hands are small and dark** (about 6 px wide at 360 px). The box contact reads through the sleeves that reach it and the box silhouette, not through the hand. If the reviewer wants the hand seen, it needs a different fix (a hand of the approved style but larger, which is a cast change).
2. **The mirror's lit window and lamp can still read as a room.** Her reflected head is mostly hidden behind her real head; only a darker rim shows around it. The cold-viewer read ("a mirror, not a third person") has not been tested.
3. **Contrast measures 144.5, the very top of the 95-145 range.** It took two changes (dimming the mirror's windows, lifting the black point) to get there; brightness 109.7 and saturation 22.5 are comfortably inside.
4. **Camera motion 40.8 % comes from bursts** (the two punches, the 1C rise, the closing punch), not from the baseline drift (about 0.16-0.2 % per frame, below the tracker's threshold).
5. **The evening gold is subtle** (wall R/B 1.29-1.43). It is distinct from the morning, but not a strong gold.
6. **The resting box sits in the caption band for f72-97.** Captions "then", "came", "back" and "to buy" are drawn over it. The handoff itself is clear.
7. **Words after 7.5 s are unverified**, and the next cut on "intimidating" falls at f209, which makes 2A 60 frames.
8. **The 2A pull-back is a 14-frame move** that completes at f163 (Astra accepts this). The earring glint is a 4-frame white dot.
9. **Coins are small** at the back of the table; readable at 360 px, but only just.
10. **The prop checker has no occlusion test.** My hand count for f149 is 19 against its 20.
11. **Rewind gate untested** (needs the full film; frame 0 renders byte-identically twice).
12. **The hook cold-viewer test is still not run.** At frame 0 the picture change to frame 1 is small (mean 1.5 of 255).
