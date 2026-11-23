# HANDOFF: Fragrant Flower (written 2026-11-23). Read this first in a fresh chat; read only the files it names.
PORTABLE PROCESS: see `PROCESS-KIT.md` (steps, prompts, rules, tools, lessons) before starting a new short.

Goal: a 54.9 s vertical cartoon short, at least 8/10 in every critic category, and a repeatable pipeline for at least 4 more shorts (probably with NEW cast and sets). Chat style: caveman (terse). Work in `C:\Users\Win 10\Downloads\new video edit`.

## State
| Part | Frames (30 fps) | Status |
|---|---|---|
| Narration v4 | all | done, user 8/10: `production-pipeline-proposal/voice/johnny-take-02/johnny-take-02-edit-v4.wav`, `words-v4.json` |
| Hook, card 1 | f0-148 | done, critic 8/8/8/8/8/9 (`out/hook-v5/_review/round-6.md`); NOT re-rendered with the big hands |
| Reveal 5A-5F (5B+5C merged) | f834-1102 | DONE: v7 fixes in, critic r3 8/7/8/8/8/9 (`shorts/fragrant-flower/out/reveal-v7/_review/round-3.md`), last tweak (entrance trace) not re-judged. Video `out/reveal-v7/reveal-v7d.mp4`, sound `film-sound-15.wav` |
| Chunk A: 2A-4E | f149-833 | BUILT (cut-v6/chunkA.ts), stills checked by Claude |
| Chunk B: 6A-7F | f1103-1645 | BUILT (cut-v6/chunkB.ts), stills checked by Claude |

Shot list (22 shots, 5B+5C merged, 5B starts on HER): `production-pipeline-proposal/film-shots.json` (source of truth, word-anchored) and generated `FILM-SHOTLIST.md`. Regenerate: `node pipeline/shot-times.mjs production-pipeline-proposal/film-shots.json --write <new.md>` (never overwrites). Merges were the user's idea; the reference median is 2.93 s per shot.

## Do next, in order
WHOLE FILM BUILT. User rated v1 7.5/10; round 2 of fixes done (DECISIONS last two entries). Latest video: shorts/fragrant-flower/out/film-v1/film-half-r7.mp4, sound film-sound-18.wav (Temporex Numbers) (build with pipeline/sound-build-v2.mjs, 7 s). Waiting for the USER to watch r3. RISK RULE: flag staging risks per shot BEFORE building and stage around them. Known gaps: 6B tongs/plate detail, 4A->4C box continuity, pacing windows f960-1155. No full-res render yet. NEXT SHORT: user allows Claude to approve routine creative calls itself.

## Rules (user's words win). Details in `cartoon-short-merged/LOOP.md` sections 2, 3, 5
- Always show the user the critic frames as contact sheets in chat (embed with absolute paths, forward slashes, angle brackets) plus the video link. After each critic round, LIST findings and let the user choose fixes.
- Critic = `delegate_task`, provider `codex`, model `gpt-6.2-sol`, `{"reasoningEffort":"xhigh"}`, one file per round in `out/<cut>/_review/`. Call `orchestrator_capabilities` once per thread first.
- Short rules: shots 1.5-2 s except deliberate merged moves; captions 1-2 words, white, bold, 70 % height, never over a face; faces never cut by the frame nor below 70 % height; camera always drifts and eases to rest at the end of a clip; hold a face unchanged through a dissolve; cut on words; time of day readable; 15-40 props.
- Art direction: restrained cast B, strong acting from brows/eyes/mouth/tilt/recoil only (no gag faces, sweat drops, hatching, googly eyes). Hands are the BIG dot (`cast/b-hands/rig.ts`; the user picked it). Do not edit `cast/b`, `cut-v4`, `cut-v5`, `pilot`.
- Mirror only in 5C (reveal) and 7F (ending). Frame 0 of the hook is the STARE state; 3C, 4E and 5B reuse it.

## Tools (all in `pipeline/`)
- `render.mjs <entry> <comp> still|stills|video <out> --frames a,b | --range a-b --scale 0.5 --props '{...}' --public <dir>` (never overwrites; entry `shorts/fragrant-flower/cut-v6/Film.tsx`, comp `HookB`, props `{"ppm":1300,"audio":"film-sound-14.wav"}`, public dir `cut-v6/public`).
- `cut-v6/rules.mjs <frames> [box|drift]`: preflight numbers (face boxes, caption overlap, prop count, box clearance, drift).
- `sound-build.mjs --voice <wav> --cues cut-v6/cues.json --out cut-v6/public/film-sound-14.wav --seconds 54.867 --lufs=-13.3` (note the `=`); gives about -14.4 LUFS, peak -0.8 (target -1: tune the limiter).
- `captions-from-words.mjs <words.json> <out.json>`, `voice-trim.mjs`, `shot-times.mjs`, `film-time.mjs` (shared by shot-times and the story code).

## Gotchas
- Windows is case-insensitive: `./film` resolves to `Film.tsx`; the timeline module is `timeline.ts`. Do not add a file whose name differs from an existing one only by case.
- Do not `rm -rf` a folder your shell is inside. The `ffmpeg` whisper filter needs a model: `shorts/fragrant-flower/cut-v4/tools/model.bin`.
- Rewind in the proof reverses the HOOK (`REWIND_SRC` in `reveal.ts`); for the full film set it to the end of 4E back to the start of 3C.
- Hands overlay math (coins, box lip) lives in `cut-v6/story.ts`; the box sits at x 1.05, camera in 1B at y 1.12 so it clears her chin.

## Files that matter
`cut-v6/`: `story.ts` (hook), `reveal.ts` (5A-5F), `timeline.ts`, `Film.tsx`, `Cafe.tsx`, `rules.ts`, `cues.json`, `captions.json`. `_log/DECISIONS.md` has every decision with dates. Memory notes are loaded automatically.

## Cost
This chat was very long. Start fresh, read only what this file names, look at one contact sheet per batch, render at half size, one critic round per film at the end.
