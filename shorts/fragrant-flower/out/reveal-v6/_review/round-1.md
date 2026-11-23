# Reveal v6 · Round 1

**Below target.** Camera, motion, characters and world each need another pass.

Reviewed 21 full-resolution stills from 5A–5F, f834–f1102 at 30 fps (8.97 s). Motion judgments come only from frame differences. Sound, exact word sync and motion between samples cannot be judged here. Reference stills 04-0.jpg and 10-2.jpg inform depth and caption placement.

## Scores

| Category | Score | Reason and threshold |
|---|---:|---|
| Characters | 7/10 | The crumb, fork and face preserve identity, the small smile softens the look and the flush stays a soft tint. Her forward stare and square posture leave the shy reaction ambiguous until the boy’s POV and flush. For 8, show an unmistakable glance away and return with a slight chin or shoulder tuck, and make the iris change visible on the payoff. |
| Motion | 6/10 | The rewind changes poses and the 5E hand travels toward the collar. In 5D the sampled case rail is pixel-identical across three frames while he blinks. The payoff samples show little readable fork or collar pulse independent of the roll. For 8, show gentle case-to-background parallax, a readable pulse and settle, and a pullback that visibly decelerates before the last frame. |
| Light | 8/10 | The cool replay warms through the reveal and the apron POV. Both faces keep readable values and the warm window light leaves the cheek tint distinct. |
| World | 7/10 | The cake case, shelf and table establish café depth. His nearly opaque reflection is larger than her face and reads like a second card looming behind her, especially before the glass border is visible. For 8, keep it subordinate at a plausible reflected scale, with the card contained by the pane and a visible glass cue through the fog clearing. |
| Camera | 6/10 | The landing and final foreground pass work. The 5B move widens and drops her in frame as the reflection arrives early, 5D reads as a straight-on counter shot, and the 5F roll clips the reflected head. For 8, make the 5B rise read in the foreground parallax, stage the 5D shoulder POV and keep both identifiable faces fully clear through the roll and pullback. |
| Captions | 9/10 | Sampled captions are bold white, legible and one or two words at about 70% height. They clear both faces. The rewind is clean and POUNDING. appears at the supplied f1057 onset. |

## Required checks

- **Landing — pass on the sampled proxy.** f0870 is instantly recognizable as hook f0000. On a four-pixel grid, 99.85% of 129,600 RGB positions match exactly. The visible differences are concentrated around the hands. The required exact f0871 comparison remains unverified because f0871 was outside the supplied sample.
- **Caption-free re-reading — partial.** f0870–f0888 read worried. In f0900–f0945 the same face softens into a small smile, but her forward gaze and unchanged posture read neutral before the soft flush at f1045–f1057. The visual sequence suggests shyness late.
- **Mirror — partial.** The softened reflection is already readily identifiable at f0900, inside 5B and 12 frames before f0912. The clear f0912–f0945 reflection is legible, but her hair hides part of his jaw and the image competes for the lead. It returns in sampled 5E/5F despite the shot-list header reserving the mirror for 5C/7F. It stays clear of captions.
- **Tape — pass on the samples.** f0840, f0852 and f0864 keep the face and gesture legible through the scanlines. The band across brow level at f0864 leaves both brows and eyes readable. The overlay clears by f0870.
- **Framing — fail on the reflected head.** f1080 crops its outer right ear and earring. f1066 and f1092 clip hair spikes and leave the ear nearly at the edge. All sampled facial features stay above y=1344 (bottom 30%). No caption crosses a face. The f1102 top-left patch is a facial-feature-free foreground blur.
- **Pacing — mark for playback.** The planned 5A and 5B durations are 1.23 s and 1.37 s against the 1.5–2 s Short rule. Four planned boundaries fall within f0871–f1010 (4.63 s) and again within f0912–f1057 (4.83 s). The supplied shot ranges were used for scoring.

## LOOP frame flags

- **Frame edge.** f1080 is the confirmed face/head crop. f1066 and f1092 fail full reflected-head clearance at the hair, with the ear outline at the margin.
- **Face occlusion within the frame.** Her crown masks part of his reflected lower jaw in f0900, f0912, f0925, f0945, f1012, f1030, f1045, f1057, f1066, f1080, f1092 and f1102. Eyes and mouth remain visible.
- **Unheld objects.** Literal prop flags in f0840, f0852, f0864, f0870, f0878, f0888, f0900, f0912, f0925, f0945, f0960, f0980, f1000, f1012, f1030, f1045, f1057, f1066, f1080, f1092 and f1102 are plainly set dressing. Plates, resting utensils, cups, display cakes, books, jars and plants sit on surfaces. The 5D cloth sits in his visible dot hand. No scored action prop appears unheld outside the deferred fork-read issue.
- **Other hard fails.** No sampled caption-over-face, empty background or clear limb-through-body frame.

Deferred and unscored — dot hands still weaken the collar grip, the capped mouth still reads as a small gasp, plate clutter still hides some arm acting, and hair still weakens the fork-hand connection.

## Fixes, weakest first

1. **f1066, f1080, f1092 (35.53–36.40 s).** The roll drives the reflected head into the right edge. Check every roll frame for clear head contours, faces fully above y=1344 and caption clearance. Keep the permitted top-left foreground patch soft.
2. **f0878–f0912 (29.27–30.40 s), f0960 (32.00 s).** The 5B move reads as widening and the 5D angle lacks her blurred shoulder. Check that the rise visibly clears the foreground before 5C and that 5D reads from her position, with the apron and cloth legible. Supply f0871 for an exact caption-free pixel match to hook f0000.
3. **f0960–f1000 (32.00–33.33 s), f1057–f1102 (35.23–36.73 s).** The case is pinned during the blink and most sampled pullback happens after f1092. Check for case-to-shelf parallax in 5D, a collar and fork pulse at f1057 relative to the set, and progressively smaller frame-to-frame travel as the pullback settles by f1102.
4. **f1012, f1030, f1045, f1057 (33.73–35.23 s).** Her expression stays front-facing and the eyes are still dark plum at the payoff. Check without captions that the glance away and return, chin or shoulder tuck, soft flush and visible iris change convey fluster on their own.
5. **f0900, f0912, f0945, f1012 (30.00–33.73 s).** The large reflection appears ahead of the reveal and her crown masks its jaw. Check that he is absent through f0911, clears into view wholly inside the glass in 5C with separation from her silhouette, and is absent from the 5E/5F pane per the shot list.
