# Independent final review — Diamond V2

**Verdict: PASS — the sole required location-label correction is verified.**

## Method and blind causal read

I first inspected the integrated review MP4 through a full-story 1 fps contact sheet, then 4 fps temporal samples for 0–2 s, 14–18.5 s, and 22.3–28 s. I had not read the script or plan before forming this account. I subsequently inspected 7–14 s at 2 fps and the entire newest 3 s merged-pit-final clip at 4 fps. This is temporal frame inspection, not normal-speed video playback or listening. It cannot certify perceptual motion smoothness, audio intelligibility, or frame-by-frame contact throughout.

My initial plain account: two men sold a supposed diamond mine. Investors believed them because valuable stones were visibly available on the surface and an expert approved the site. They paid the sellers, who departed. Investigators found stones only in disturbed surface soil; deeper digging produced an empty layer. An earlier purchase and planting reveal explained how real stones supported a fake mine. The final joke identifies the gullible investors as the valuable resource the sellers actually mined.

## Required correction

1. **P2 — planting retains the London location label, 27.17–28.00 s, frames 815–839.** The label `LONDON · EARLIER` remains over the recognizable Colorado field while the seller plants the stone. This contradicts the established field geography. Evidence: `end.png`, last row, planting images; `index.tsx:69` renders the same string for all flashback frames and `story.ts` keeps flashback true until frame 840. Minimal fix: keep `LONDON · EARLIER` in the shop, use `EARLIER` (or `COLORADO · EARLIER`) during the planting. Verify a rendered frame in each location. No new scene is necessary.

## Passing observations

- Hook: an action already underway resolves into hand-to-stone contact, lift, eye attention and a tighter view within two seconds. The desert surface, scattered gems, and other men establish a site context; the caption sentence says mine. It does not read as an ordinary jewelry-counter sale.
- Persuasion: surface pickup, inspection through the expert's glass, and pleased approval are legible in sequence. Paperwork and the substantial money sack make the office scene a transaction motivated by that approval. The sack moves from investor side toward sellers; sellers then leave while buyers remain. The recurring costumes preserve identities.
- Investigation: the newest merged-pit-final clip replaces the oversized spoil with a modest ridge pile. Stones visibly leave with surface dirt, the hole develops depth and strata, and the lower floor is empty during Nothing. No visible gem in the deeper floor undercuts the test. The older full rough's large pile should not be used as the final authority for this range.
- Reveal: the flashback is explicitly signaled, purchased gems lead into the hand placing a gem at the claim, and the return to the empty excavation supports the fraud explanation. Aside from the location label above, the transitions are causally clear.
- Faces, hands, gem identity, feet and shadows are coherent in sampled frames; no sampled material contact failure calls for a production change. Caption contrast and lower-middle placement remain readable and do not cover the evidence stone. The last investor reaction supports the ending.

## Reference/spec comparison

After the blind read I read the V2 plan, script-formula.md, the local20 transcript index and current motion.md guidance. Actual imagery inspected: Horse Race's 0–5 s temporal sheet, Scratch Cards' 0–5 s temporal sheet, and the complete lottery reference sheet (upstream short06_sheet.jpg; sheet numbering does not equal the transcript-index IDs). These provide concrete comparisons beyond Storm Oil/Railroads: first-action prop focus, camera reframing toward physical evidence, expressive belief/reaction changes, readable counter transactions, and later reinterpretation of the original object.

The V2 pickup occupies the opening with a trackable object and preserves the later mechanism; its expert-to-payment progression and surface/deeper-soil contrast follow the approved connected-action formula. Painted mesas, wood grain, room props, long contact shadows, plum cast outlines, and crisp foreground evidence deliver the intended flat-cast/3D-world style. Reference imagery sometimes uses richer dressing and larger expression changes; that is not itself a demonstrated defect or reason to expand this approved build. Source camera keys use smooth interpolation, consistent with the current symmetric-glide guidance, but this review does not assert measured equality to reference motion.

## Audio limitation

The integrated review audio decodes through the full 31.73 s container. FFmpeg volumedetect measured a peak of -1.4 dBFS, with no sample peak clipping indicated. I did not listen, so this measurement is not a voice/mix approval. Lead should retain its own playback and mix checks before final delivery.

Evidence files in this folder: full.png, hook.png, inspect.png, pay.png, end.png, pit-final.png. The earlier dense-01/dense-02 exploratory sheets used a selection/fps combination that repeats gaps; they are not review evidence.

## Narrow correction verification

Inspected proof/flashback-fix/london.jpg and colorado.jpg after the fix. The shop reads LONDON · EARLIER; the field planting reads COLORADO · EARLIER. This closes the sole P2 finding above. No further production correction is requested by this review. The original temporal-frame and audio limitations remain unchanged; final export integrity remains the lead’s check.

