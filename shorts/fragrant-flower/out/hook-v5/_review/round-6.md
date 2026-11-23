# Hook v5 · Round 6 review

**All six categories meet the 8/10 target on the supplied frames. The exact stop at f0149 remains unverified.**

- **Characters 8/10.** The brow lift, small gasp and recoil sell fear at f0026–f0040. Lowered lids, a chin tuck and the open-eyed smile sell the change of intent at f0092–f0112. Both beats use the restrained cast-B expressions.
- **Motion 8/10.** The recoil changes the silhouette, the return glide advances past foreground props, and Rintaro blinks at f0142 and reopens his eyes at f0149. The final push slows between samples.
- **Light 8/10.** Warm café surfaces frame the cooler opening face. f0074 shows the intended dark single-image dip, f0084 opens onto brighter daylight, and the street storefront has a readable diagonal sun patch.
- **World 8/10.** Counterware, plants, shelves and storefront fixtures give the muted 3D sets depth. The shots stay populated and the mirror is absent.
- **Camera 8/10.** The opening push, wider return glide and matched face dissolve give the beats distinct framing. The return jaw clearance and final crop both improved from round 5.
- **Captions 9/10.** Bold white groups of one or two words sit near 70% height, with enough outline to read over the counter. f0136 has no name caption and f0142 has “Rintaro.” The specified f0137 onset falls between samples.

Motion is judged only from differences between sampled stills at 30 fps. Intervening frames and audio timing are unverified.

## Round 5 camera checks

1. **Pass · Cake and jaw clearance.** The slice and box both clear her jaw at f0092, f0099, f0106 and f0112. The f0099 and f0106 overlaps in round 5 are gone. f0092 starts the dip, f0099 and f0106 carry the low, slightly boxward gaze, and f0112 lifts the chin and opens the eyes into the broader smile.
2. **Pass · Chest-up endpoint and sampled slowdown. Fail · Per-frame rest verification.** f0149 keeps the full head and hair inside the frame and drops both hands, the jacket hem and legs below the edge. Earring span grows from roughly 710 to 770 to 825 px at f0136, f0142 and f0149, or about 10 then 8 px per frame on average. The samples show deceleration. The gap after f0142 leaves the final per-frame taper to rest unverified.

## Regressions and LOOP fail rules

- **Face hold passes on the samples.** Her brows, eyes and smile hold their f0124 positions at f0128 and f0132 through the intended face-to-face dissolve. Her image is too faint by f0136 to judge small movements. f0137 is unsampled.
- **Frame edges pass.** The fork tip, visible shaft and her face are inside the screen edges at f0026, f0030 and f0040. Her hair still obscures the grip. All sampled faces are whole and above the bottom 30%. Rintaro’s chin is at roughly y=1151 at f0142 and y=1263 at f0149, both above y=1344. Every sampled caption clears the faces.
- **Unheld active fork flag, deferred.** The hand-to-handle connection is obscured by hair at f0026, f0030, f0040 and f0050.
- **Unheld active box flag, deferred.** A visible grip on the featured cake box is missing or ambiguous at f0084, f0092, f0099, f0106, f0112, f0120, f0124, f0128 and f0132. The slice sits on the box. The active coin is visible at her raised hand at f0084 and f0092 and at the counter at f0099. Later coins rest on the counter.
- **Plainly set dressing.** The opening plated cakes and crockery at f0000–f0074, the café serviceware and displays visible from f0084 through the dissolve, and the storefront fixtures and goods from f0128–f0149 are dressing.
- No sampled frame has an empty background or a visible limb passing through a body. The two unheld-prop flags above account for the sampled LOOP failures.

## Deferred issues outside the scores

- **6 px dot hands.** Still hurts the box grip and slide.
- **Rig mouth cap.** Still limits the gasp at f0026–f0050. The brow lift and recoil carry it.
- **Foreground plate and cake clutter.** Still competes with the opening jaw silhouette at f0026–f0040.
- **Walk-in animation.** Still weakens the return beat. She is already at the counter at f0084.
- **Fork hold partly covered by hair.** Still obscures the contact point at f0026–f0050.

## Fixes

1. **Camera · f0149 (4.97 s).** The f0142–f0149 sample interval hides the last scale and position changes. Pass when consecutive frames through f0149 show the scale and framing deltas easing to a stop, with the full head and chin clearance preserved.
