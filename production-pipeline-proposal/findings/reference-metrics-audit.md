# Pilot v3 against the reference metrics (2026-11-23)

Asked by the user: "do you use all the reference metrics when making scenes?"
Answer: no. The reports were read, but `pipeline/qa` checks only technical delivery and has no reference gate.
Nothing below is approved or fixed.

Method: `reference-study/measure.py`'s own function on pilot v3. It reproduced all five compared saved values for reference 04 exactly.

| Measure | 20 references (min / median / max) | Pilot v3 | Result |
|---|---|---|---|
| Hard-change events per minute, 0.28 threshold | 0 / 0 / 4.5 | 34.4 | outside |
| Frames with camera motion, % | 33.3 / 49.8 / 69.5 | 20.2 (tracking coverage 70.9, so approximate) | outside |
| Saturation, median | 19.6 / 27.7 / 37.6 | 11.7 | outside |
| Contrast, high minus low luma | 95 / 115.5 / 145 | 172 | outside |
| Brightness, median | 78.6 / 116.7 / 154.3 | 117.6 | pass |
| Loudness range, LU | bible 2.4, six checked references 1.7-2.3 | 2.9 | slightly wide |
| Close-up blur, cInf | 12-14, hook and inserts 15-16 | 8-12, hook 10 | mostly low |
| Wide blur, cInf | 0 | 5 on the apology two-shot (a medium-wide) | check |
| Push, % per frame | hold 0.15-0.35, punch words 0.6 | 0.12-0.30, no punch pushes | punches missing |
| Roll on emphasis | 4-5 degrees, sparingly | none found in story.ts | missing |

Conflict between documents: the bridge motion report says "hard cuts on big jumps" from one video.
The style bible and the 20-video frame audit (median 2 hard cuts per video, maximum 10) say cuts are rare and masked by moves or short dissolves.
The 20-video measurement wins for scene planning.

Proposed process, pending the user:
1. Every scene card names its targets: transition in and out, shot size, blur, focus, push, roll, light, sound, caption.
2. Each metric is a gate, a guide, or a written exception with a reason.
3. The same measurement runs on the low-res proof before the user sees it.
4. Metrics do not prove story or acting. The user's eye and ear still decide.

Proposed exceptions: rewind silence and grey tape, flush only at the turn, restrained palette at the low end of the range,
frontal-only characters.
