# Independent production review

Reviewed 2026-11-15. Read-only implementation review; only this report was written. Evidence: actual renders `stills-{0,48,72,440,535,575,810,890,1020}.png`, inspected before BUILD/story; then BUILD.md, Film.tsx, Cast.tsx, World.tsx, story.ts, captions.json, alignment notes, and the two requested local reference sheets. No continuous playback or listening claim. Findings describe the source at review time; later edits need fresh renders.

## Blind visual read

- f0: close policy reading FIRE COVER / ANY FIRE, suspended stamp, long green arm and wing entering from right, tiny human hand at left. Policy closeup is a plausible opening, but alone does not establish a dragon.
- f48/f72: smiling dragon stamps/raises stamp beside much smaller baker. Arms cross as two long green ribbons; coin is visible on lower arm. Dragon head is separated from body by a visible gap. f48 stamp base disappears into tabletop.
- f440: serious baker at extreme left, dragon mostly beyond right edge, policy resting centrally on desk. Looks like a paused transaction; neither the demand nor dragon's hesitation is readable.
- f535: dragon open-mouthed beside largely empty desk, coin held at right. No visible savings loss or claimant in this image.
- f575: legible ANY FIRE closeup, right edge of FULL REPLACEMENT cropped. Effective evidence insert.
- f810: supported cake and lit candle, pleasant clear closeup; child not visible.
- f890: very wide square, tiny cake left and clipped dragon with bucket right. Child is largely hidden beneath table. Much of frame is empty paving.
- f1020: cake is wet and small splash is around candle; bucket side enters from right, mouth points away from cake, no visible connecting stream. Child remains hidden by tabletop.

First unambiguous **visible physical failure among supplied stills: f48**, stamp penetrates table. Earliest source-proven failure: **f0**, parked bucket intersects ground. f0 cropping itself is an intentional insert, not sufficient evidence of a framing failure. First decisive dramatic framing failure among supplied stills: **f440**, where claim/hesitation needs both faces.

## Creative impact — revise before presenting as finished

| Priority | Exact evidence/source | Narrow fix |
|---|---|---|
| P1 | f440; `story.ts:58`, `story.ts:25-26`, `World.tsx:92-93`: claim camera crops both performers; contract remains flat on desk until f548. Customer has no policy-presenting or insistence pose. | Reframe f398-454 around both faces and contract; lift/extend policy in baker's hand, hold dragon's hesitation, then change baker's pose before payment. Keep current wider payment reveal. |
| P1 | f535; `story.ts:48`, `World.tsx:155-156`: `goldRemaining` falls but is never consumed. Barrow already contains gold before payment; savings pile stays fixed. | Drive visible savings coin count/height with `goldRemaining`; establish full pile before departure and depleted pile after. Do not depend on shocked mouth alone to explain the loss. |
| P1 | f890/f1020; `story.ts:46`, `Cast.tsx:88`, `World.tsx:106`: child eyes are approximately y=.95 below tabletop y=1.05. Child lighting and final annoyance cannot read. | Put child beside the table with face outside its silhouette; raise on a visible step or lower table if the candle must be reached. Add a visible wick-lighting tool/action before f798. |
| P2 | f890; `story.ts:67`: route shot puts charge at right edge with tiny target left and large empty foreground; `Cast.tsx` never reads `pose.lean`. | Widen/shift only enough to contain dragon and target, reduce empty paving, apply run lean and hold a clear arrival. Keep established leftward route and cake position. |
| P2 | f48/f72/f535; `Cast.tsx:33-35`: projected world hands force arms across torso into long ribbons. Endpoints remain attached by construction, but anatomy/silhouette reads poorly. | Swap the visual shoulder assignment where necessary, use a bent elbow on the same side as the hand, and shorten reach through prop staging. Recheck f24/48/72/535 plus intermediate camera positions. |

Reference comparison: camera-language 01-02 keeps the irreversible object event readable as camera discovers the next context. Ref14 keeps contract, opponent and decision in a shared negotiation before evidence inserts. Current policy insert works; f440 removes precisely the faces that would sell the reversal. Reference matching is a staging/acting issue, separate from material polish.

## Physical integrity — failed, concrete local repairs

| Priority | First frame / source | Defect and narrow fix |
|---|---|---|
| P1 | f48 visible; `story.ts:19`, `World.tsx:158` | Stamp hand y=1.21 at contact; base bottom=1.21-.26=.95 versus policy y=1.062. Penetration ~.11. Solve hand minimum from policy height + stamp bottom offset (~1.322), then lift. Inspect f40-56 at full resolution. |
| P1 | f0 source; `story.ts:47`, `World.tsx:51-57` | Ground bucket uses top/handle pivot y=.02, but bottom is pivot-.375, sinking to -.355. Set parked pivot so base touches ground (~.365 with current ground surface -.01), preserving held pivot semantics. |
| P1 | f987 source; f1020 visible; `World.tsx:52`, `story.ts:38/48`, `World.tsx:120` | `rotation-z=-tilt` points bucket opening +x, away from cake at -x; water spawns from unrelated fixed position. Reverse tilt for leftward pour; derive water origin from transformed bucket lip. Use the same lip transform for hand/bucket/pour evidence, then inspect f987/1001/1007/1017/1020. |
| P2 | f48 visible; `Cast.tsx:25/41`, `story.ts:13` | Head bottom near logical y358, torso top near392: visible air gap. Draw a short neck behind head/body or move top of body up while preserving face silhouette. |
| P2 | f456 source; `story.ts:44-45`, `World.tsx:69` | Baker jumps from x=-.78 to barrow-relative x=1.75 when claim f456 starts. Grip target y=.77,z=barrow+.12 differs from handle y=.67,z=barrow+.23. Interpolate an approach to barrow, bind hand to actual handle endpoint, then move baker/barrow together. Needs rendered moving proof. |

Cake/table support is visible at f810 and f1020. No unsupported-cake claim. Projected hand endpoints deliberately preserve screen attachment to world props; the failure is exaggerated arm shape and some prop contact positions, not arbitrary hand drift.

## Captions and timing limits

All nine sampled caption words match their actual source intervals: A/insurance/coin/policy./gold/the/candle./square./against. White captions stay in the intended lower-middle strip. f810 overlays plate edge but leaves candle/flame clear. No sampled caption is clipped. Exact spoken alignment has NOT been established by this visual review or source recognition notes.

Source splash f1017 precedes actual `buckets.` caption onset f1024 by 7 frames (0.233 s); CUES.buckets=1025 differs from captions by one frame. This is consistent with the intended anticipatory splash, but gag timing still requires normal-speed viewing/listening. ANY FIRE is exposed f548-603; camera cuts to reaction f604 before `fire.` begins at f616. Keep enough evidence/reaction overlap to preserve comprehension, and verify by playback rather than changing narration timing.

## Next proof required

After narrow repairs, inspect actual hook f0-110; claim/decision/payment/evidence f398-641; ending f764-1046. Sample first/last and contact frames in addition to normal-speed playback/listening. Keep creative verdict and physical verdict separate. Current still/source evidence does not support marking the film ready.

## Latest candidate — exported excerpt sheets, 2026-11-15

Historical findings above are not a current defect checklist. Reviewed all three exported overview sheets and seven requested contact/detail sheets, then current source. Scope: hook 0–179, claim 398–642, ending 764–1046. These are sampled frames from actual exports; no continuous playback/listening claim.

**Creative verdict: provisional 6/10; clearer, still one critical break.** Hook now immediately establishes dragon/customer, stamp action and coin; claim preserves both faces and shows contract presentation, barrow departure, ANY FIRE reveal and reaction. Child/candle action and final water consequence now read. Quiet policy/reaction holds are purposeful; no camera creep requested.

- **P1, f835–863 and early charge:** actual ending/charge sheets show only forge facade during recognition, followed by empty-square samples before dragon appears. The recognition→decision→charge chain is absent. Fix root cause below before camera adjustment.
- **P2, f489–552:** barrow departure and vacated source position read, but gold remains small and muted; it looks closer to an ordinary cart than a ruinous payout. `goldRemaining` still does not change the static savings pile (`World.tsx:162`). Increase visible gold above cart rim or show a clear depletion; preserve the current departure route.

**Physical verdict: materially improved, blocked by one route defect.** Stamp contact/return, connected neck, larger child separation, less crossed reach and leftward lip-origin pour are visibly improved in sampled sheets. No renewed claim of the old failures.

- **P1, source f764 onward; rendered f835 onward:** `story.ts:18` starts dragon at [2.9,0,-6.4], inside forge bounds x1.9–5.7 / z-7.1–-3.9 (`World.tsx:140`). Bucket is also inside. Dragon exits through facade. Move starting root and parked bucket into visible square with building clearance, then aim recognition camera (`story.ts:90`) at that actual face. Verify f835/838/848/864/876/890 plus arrival.

Reference 01 still has stronger large-object impact; current opening is clear but modest. Reference14's shared contract interaction is now substantially better matched; visible insistence remains restrained. Caption words remain readable in the sheets; speech alignment/listening is unverified here. No full-film clearance.

### Targeted repair stills — supersede route/gold observations above

Inspected newly rendered `stills-838.png`, `stills-864.png`, `stills-890.png`, `stills-510.png`; old overview sheets are not current evidence.

- f838: actual recognition face is large, unobstructed and clearly alarmed; neck connected, held bucket visible at lower edge. Empty-facade recognition failure is repaired in this sampled frame.
- f864/f890: dragon is visible in square with cake/child established to left; route is intelligible and no forge-wall passage is visible. f864 right wing/tail clipping does not hide face, bucket or direction of travel. No new material defect identified in these targeted route stills.
- f510: bright gold stacks protrude clearly above cart, creating a substantially stronger payout image. Customer/cart relationship and dragon reaction remain readable. This repairs the weak gold-visibility finding in this sample; savings depletion still needs the new before/after export evidence.

Provisional creative assessment rises to **7/10 for these excerpt repairs**, conditional on regenerated export continuity. Physical route finding is repaired in supplied stills; no continuous passage, foot-contact, listening or complete-film clearance claimed. Await regenerated excerpt sheets rather than reuse historical exports.

### Final excerpt verdict — regenerated exports

Reviewed regenerated actual-export `DragonEnding-overview.jpg` (5 samples/second across global f764–1046), `charge-feet.jpg` (every 4 frames across f839–931) and `gold-departure.jpg` (every 4 frames across f454–550). This supersedes the historical empty-recognition/hidden-charge and weak-gold findings for this candidate.

**Creative: provisional 7/10.** The ending now presents child lighting, alarmed recognition, visible route, arrival, leftward pour, wet cake and reaction in a coherent sequence. Gold is conspicuous above cart rim, departure crosses the foreground, and the vacated position makes loss readable. No further critical excerpt revision identified. The staging is clear and serviceable; this rating is not a prediction of audience response.

**Physical: no remaining material blocker observed in these sampled export frames.** Dragon remains visible after recognition; no forge penetration appears; bucket travels with hand, feet alternate coherently in samples, and water/cake consequence has a consistent direction. Sampling cannot establish continuous foot planting or exclude every intermediate collision.

These three sheets were inspected visually; no new normal-speed playback/listening was performed. Unchanged hook/contract were not reopened in this final pass. Full-film continuity, audio delivery, speech alignment and overall pacing remain outside this bounded verdict. Candidate excerpts are ready for the planned user review; the full-film user gate remains in place.
