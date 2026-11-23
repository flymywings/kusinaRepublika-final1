# Fragrant Flower pilot v2, QA report (2026-11-22)

`Fragrant_Flower_Pilot_v2.mp4`, SHA-256 `08a14264d7bdc1e3661f7b730ee5dcf5560a7daaaf9a2af8ebc171f72d3b57f2`.
Awaiting the user's rating. It needs 9 or higher before the direction is extended to the full Short.

## Automatic (`qa.json`, all pass)

- 1440x2560, 30 fps, 732 decoded frames, 24.4 s, full decode.
- -14.98 LUFS, -2.11 dBTP. No black or frozen spans. One quiet span, 20.12–20.69, is the designed withdrawal.
- Machine transcript of the export returns the nine pilot lines in order.
- 123 of 123 word timings match the approved script.
- Every cut in the take lands in silence (worst sample 0.0001). Speech is not stretched.

## Reviewed by eye

1 fps and 2 fps sheets, dense sheets of the flight, rewind, reveal and turn, and full-size key frames.

Fixed during review:

| Time | Defect | Fix |
|---|---|---|
| 0:03, 0:14 | A cherry in front of her mouth read as an open mouth | Different slice |
| 0:00 | The hook had no one to loom over | Her blurred back in the foreground |
| 0:12.9–0:13.8 | The rewind froze for 0.9 s | The second really runs backward, then replays |
| 0:10–0:12 | His half-bow barely lowered him | Deeper bow |
| 0:15–0:16 | Mortified read as annoyed | Lids, brows and mouth slope away from the nose |
| 0:19 | A dust mote sat on her eye on the key line | Dust removed |

## Not verified

- Normal-speed playback and listening: mix, music, whether the hold lands. The user's watch decides.
- Type check (no TypeScript installed). The code bundles and renders.
- Automated contact, silhouette and cue-to-action checks from the proposal are not built yet.
  Contacts were judged on sampled frames.

## Known weaknesses

- The front-on run at 0:01 and 0:04.2 reads through the door, hair and exit more than through the feet.
- The plate stacks merge into a mass at phone size in the cool shots.
- He does not reach her eye level during the bow. He gets there in the offer.
- Episode wording for "never found him scary" and the full café wardrobe remain unconfirmed.
- The pilot jumps from the hook to the flight by design. It is not the full narration.

## Editable source

- Cast: `../../cast/b/rig.ts`, sheet `../../cast/b/Sheet.tsx`
- Set: `../../sets/Cafe.tsx`
- Film: `../../pilot/{Film.tsx,story.ts,timing.ts,edit-map.json,words.json,sound.mjs}`
- Look kit: `../../../../pipeline/kit/v1/look/` (identical to the original skill's templates)

From the workspace root:

```
node shorts/fragrant-flower/pilot/sound.mjs shorts/fragrant-flower/public/audio/<new-name>.wav
node pipeline/render.mjs shorts/fragrant-flower/pilot/Film.tsx Pilot video <new-output>.mp4 --public shorts/fragrant-flower/public --scale 1.3333333333333333 --props '{"audio":"audio/pilot-r1.wav","ppm":1800}'
node pipeline/qa/media.mjs <new-output>.mp4 --out <new-qa>.json --frames 732 --allow-quiet 19.5-21.6
```

## Autonomy (provisional)

The pilot attempts 18 of the 20 work units (no script or fact-finding stage).
Two needed the user: the cast (V8 file rescue, expression correction) and the environment (direction correction).
**16/18 = 89%**, below the 90–95% target and over the pilot's limit of one intervention.
Planned choices (style, wardrobe, go-ahead) are not counted.
