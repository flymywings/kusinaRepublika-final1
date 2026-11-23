# Fragrant Flower pilot v3, QA report (2026-11-22)

`Fragrant_Flower_Pilot_v3.mp4`, SHA-256 `8d42375ee99a93d404fdb1bb0ae7049309c962e33ec869c0b508ce1bcca86f8d`.
Answers the Astra review of v2 (`../../../../production-pipeline-proposal/findings/independent-review.md`).
Awaiting the user's rating. It needs 9 or higher before the direction is extended to all 15 lines.

## Checked automatically

- 1440x2560, 30 fps, 732 decoded frames, 24.4 s, full decode (`qa.json`).
- -14.95 LUFS, -2.11 dBTP. No black or frozen spans. The one quiet span (20.12-20.69) is designed.
- All four retained pieces of the take sit at 0 samples lag in the export (`evidence/sync.json`).
- Machine transcript of the export returns the nine pilot lines in order.
- The 66 caption words match the kept narration. Shortest display is 5 frames.
  This proves text and exposure. It does not prove every word onset to the frame.
- Approved inputs, both drafts, After Hours v8 and pilot v2 keep their hashes. The look kit still equals the original skill.

## Astra's findings

| # | Severity | Finding | Fix in v3 | Evidence |
|---|---|---|---|---|
| 1 | Major | Sleeves vanished in the bow | One continuous drawing order | `evidence/sleeves-focus.jpg` |
| 2 | Major | Sound cues without visible action | Shared `marks.json`, falling fork, startle rise. Three cues are labelled offscreen: hook fork, hook chair, replay bell | `evidence/cues.jpg`, `evidence/cues.json`. Visible motion within 1 frame |
| 3 | Major | Still renders could overwrite each other | Staged, exclusive publish | Two renders raced: one wrote, the other failed with EEXIST |
| 4 | Major | One-frame caption, caption lingering in pauses | Measured phrase ends, 5-frame minimum | `evidence/captions.jpg`: first and last frame of every caption |
| 5 | Minor | No planted foot in the run | Stance point fixed to the floor | `evidence/run.jpg` |
| 6 | Minor | Focus snapped | Interpolated across her exit | `evidence/sleeves-focus.jpg` |
| 7 | Minor | Case rail crossed his eyes | He sinks less | `contact-2fps.jpg`, 6.5-7.0 |
| 8 | Minor | Box sound 3 frames late | Same mark as first motion | `evidence/cues.json` |
| 9 | Minor | Partial sound output pair | Staged pair | An existing sidecar was refused and left intact |
| 10 | Minor | One cut skipped by the join check | Every edge checked | Worst join sample 0.0001 |
| 11 | Minor | Media QA passed visible defects | Frame count required, single black frames caught, separate frame evidence | A run without `--frames` fails |
| 12 | Minor | Comparison used the wrong final interval | Ends at 35.25 and holds | `comparison.mp4`, 732 frames |

## Astra's silent first watch

| What did not read | Change | Status |
|---|---|---|
| Relation of the rewind to the two-shot | Runs backward through un-bow, un-return, un-run, table | Changed, not independently retested |
| No visible exchange in the apology | She holds the box out, his hand starts for it and waits | Changed, not independently retested |
| Time and place at 20 s | The return to the hook's camera starts lighter and warms sooner | Changed, not independently retested |
| Who is in the hook's foreground | None | Open |
| No physical cause for the last smile | None, it depends on the narration | Open |

## Found while checking v3, fixed before export

- The dropped fork covered her eye.
- The startle lifted her mouth above the cake, spoiling the reveal.
- The rewind jumped on its first frames.
- "eating." stayed up into the next phrase.
- A stray cuff mark at the far edge of the box.

## Not verified

- Normal-speed playback and listening: mix, music, whether the pauses land.
- Type check (TypeScript is not installed). The code bundles and renders.
- Contact and silhouette checks are by eye on sampled and adjacent frames, not automated.
- The episode's wording behind "never found him scary". The wardrobe is user-approved but partly interpreted.

## Reproduce from the workspace root

    node shorts/fragrant-flower/pilot/captions.mjs --check
    node shorts/fragrant-flower/pilot/sound.mjs shorts/fragrant-flower/public/audio/<new>.wav
    node pipeline/render.mjs shorts/fragrant-flower/pilot/Film.tsx Pilot video <new>.mp4 --public shorts/fragrant-flower/public --scale 1.3333333333333333 --props '{"audio":"audio/pilot-r3.wav","ppm":1800}'
    node pipeline/qa/media.mjs <new>.mp4 --out <new>.json --frames 732 --allow-quiet 19.5-21.6

`source/` is a snapshot for diffing. The runnable files live in `cast/b`, `sets` and `pilot`.

## Autonomy (provisional)

Still 16 of 18 units without a user rescue: 89%, under the 90-95% target.
The planned review caught twelve defects that the first QA missed, so v2's "all pass" overstated quality.
