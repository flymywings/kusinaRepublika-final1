# Inventory, 2026-11-22

Labels used below:
- **Verified**: I opened, measured or ran it today.
- **Recorded**: found in project notes or the old-chat excerpt, not reproduced.
- **Observed**: my reading of sampled frames or signal plots.

Paths are relative to `C:\Users\Win 10\Downloads\new video edit`.

## 1. Fragrant Flower baseline

| Item | State | Evidence |
|---|---|---|
| Approved narration, 123 words | Verified local | `fragrant-flower/approved/NARRATION.txt`, SHA-256 `536a58c2…de38` matches `script-approval.json` |
| Darian take | Verified, rescued from Temp | `production-pipeline-proposal/recovered/ElevenLabs_2026-11-21T05_54_13_…mp3`, SHA-256 `1c3991df1f507666db837fe5d41a41fe7041ed174c4eaeafb3d5975561975f86` |
| Take timing | Verified | 41.600 s, 177.4 WPM with pauses, about 210 WPM without the 6.45 s of detected quiet. -24.0 LUFS, -3.8 dBFS peak |
| Take wording | Verified by machine transcript, not by ear | Matches the script apart from spelling and the recognizer mishearing "Kaoruko" |
| Cast sheets v1 and v2 | Verified local, superseded | `fragrant-flower/proof/`. v2 rerenders byte-identical (`b94e0bd7…abfec`) |
| V8 cast (tapered necks) | Verified local in `production-pipeline-proposal/recovered/cloud-v8/` | `proof/Fragrant_Flower_Character_Sheet_v8.png`, `approved/CharacterArt-v8.tsx.txt`, `approved/character-approval.json` |
| Skin tones | Recorded as restored | Local v2 palette is `#f5dac0` and `#f9e3d3`. Cannot confirm it equals V8 without the V8 source |
| `NARRATION-Darian.txt` (tagged) | Cloud only | `fragrant-flower/approved/` |
| Draft 1 | Verified local in `production-pipeline-proposal/recovered/drafts/`: 42.517 s, 540x960, 24 fps | `proof/Fragrant_Flower_First_Draft.mp4`, SHA-256 `130a487bf9ac7df15846512c51dbc8eafbc63636d69baba15749902c0c24e60e`. ChatGPT Library `libfile_dd4d8cc972e881919b072dfbb6527bff` |
| Draft 2 | Verified local in the same folder: same format, identical audio to Draft 1 | `proof/Fragrant_Flower_Draft_2.mp4`, SHA-256 `d2f2d457d04a3b4a39887f6ab120e05b7fe94bf28fff594b92327b97507dbbf9`. ChatGPT Library `libfile_fcee9e3f9e8c8191a54a127a05b31daa` |
| Film source | Cloud only | `Cafe.tsx`, `index.tsx`, `story.ts`, `render-film.mjs`, V8-era `CharacterArt.tsx` and `render-sheet.mjs` |
| Updated notes | Cloud only | Later edits to `BRIEF.md` and `CHARACTER-NOTES.md` |

Cloud root: `/workspace/scratch/c5717709f38c/kapit-designbuild/new-video-edit/fragrant-flower/`.
Old chat id: `6aff8551-d920-83ec-99a2-cd7824bc80b0`.

The GitHub remote has only `main` at `8aca887` (2026-11-20), so none of the cloud work was pushed.

The old-chat details come from a `read_thread` result saved in
`C:\Users\Win 10\.codex\sessions\2026\11\22\rollout-2026-11-22T12-39-16-01a2018d-214e-7371-a0c5-c09ce16b9d04.jsonl`.
It holds messages, commands and hashes for the last five turns only. It has no file contents or images.

Search coverage: user media folders, Codex, T3 and the profile locations where previews land, plus C: by filename.
The D: searches timed out and are not exhaustive.

## 2. Reusable material

| Material | Path | Status |
|---|---|---|
| Accepted film, rated 8/10 by the user | `supermarket-after-hours/proof/After Hours - v8 - 2K.mp4` | Verified hash, 1440x2560, 30 fps, 1139 frames, full decode |
| Renderer | `supermarket-after-hours/{index,Film}.tsx`, `render.mjs` | Verified. 90 frames at 540x960 with sound rendered in 10.4 s. SSIM Y 0.954 against the downscaled master (preview resolution differs) |
| Look stack | `supermarket-after-hours/lib/{toon,ink,grade,lensblur,paint,shade,cardshade}.ts` | Verified present and used |
| Cards, contact, gait | `supermarket-after-hours/{Cast,ReferenceCast}.tsx`, `gait.ts`, `staging.ts` | Reuse the mechanism, not the story coordinates |
| Continuous expressions | `supermarket-after-hours/performance.ts` | `check-v8-performance.cjs` passes |
| Physical, pace and camera checks | `supermarket-after-hours/check-v8.cjs` | Passes in a scratch copy |
| Retiming that keeps pauses | `supermarket-after-hours/pace-r2.ts`, `pace*.mjs` | Reuse |
| Sound | `supermarket-after-hours/sound-v8.mjs`, `public/sfx-source/`, `upstream/templates/audio/` | Reuse the beds and Foley, author cues per film |
| Transcription | ffmpeg's `whisper` filter, model at `%TEMP%\shore-ggml-tiny.en-q5_1.bin` | Verified, but the model sits in Temp |
| Audio analysis | `.audio-deps` with `C:\Python314\python.exe` | Verified import |
| References, 20 clips | `cloud-video-handoff/reference-videos/` | 20/20 hashes match, zip is intact |
| Reference metrics | `reference-study/frame-audit/summary.csv`, `script-analysis/index.json` | Read and summarized |
| Reference notes | `reference-study/{camera-language,emphasis-light,acting-impact}-audit/notes.md` | Read |
| Operating rules | `docs/creative-orchestration.md`, `script-formula.md`, `next-build-blueprint.md` | Read |
| Style bible and older templates | `upstream/references/STYLE_BIBLE.md`, `upstream/templates/bridge/` | Reference only |
| Second renderer | `cartoon-short-kit/` | Do not adopt. It bypasses Remotion |
| Official identity references | `fragrant-flower/references/official/` | Design study only, never film art |

Other film folders were inventoried by structure and entry points, not watched.

## 3. Known render and tooling problems

| # | Problem | Reproduce or locate | Fix |
|---|---|---|---|
| 1 | Sheet render overwrites the approved proof | `fragrant-flower/render-sheet.mjs`, fixed `output` | Require a new output path, refuse overwrite |
| 2 | Film render names are hardcoded to V8 | `supermarket-after-hours/render.mjs`. `final` overwrites the accepted master | Versioned output |
| 3 | Checks write into the approved evidence folder | `check-v6/v7/v8.cjs`, `check.cjs` call `writeFileSync` on `proof/` | Read-only checks with an output argument |
| 4 | Every bundle copies about 130 MB of public audio | `supermarket-after-hours/public/` | Copy current assets only |
| 5 | Bundles pile up | 245 `remotion-webpack-bundle-*` folders in Temp | Own and remove each run's bundle |
| 6 | Shared code is copy-pasted | `toon.ts` has 4 identical copies, `paint.ts` has 14 copies in 4 variants | One frozen, versioned kit |
| 7 | No type check | No root tsconfig, no TypeScript install | Add both |
| 8 | Undeclared dependencies | Checks require `esbuild`, scripts import `@remotion/bundler` and `renderer`, none in root `package.json` | Declare and pin |
| 9 | Machine-specific paths | Chrome path, Python alias (`python` is a Store stub in Git Bash) | One config file |
| 10 | Workspace is not a git repo | No root `.git` | Initialize after approval, media excluded |
| 11 | Three.js deprecations | Render log: `Clock`, `PCFSoftShadowMap` (silently falls back to PCF) | Pin now, migrate later |
| 12 | Voice sources live in Temp or Downloads | This take was in a preview folder | Ingest with a hash on arrival |

## 4. Reproducible commands today

From `supermarket-after-hours/`. These write into `proof/`, so run them in a copy until problems 1–3 are fixed.

```
node render.mjs stills 761,820        # preview stills
node render.mjs clips 761-850         # motion with sound
node render.mjs draft                 # full draft
node check-v8-performance.cjs         # read-only
node check-v8.cjs                     # writes proof/v8-checks.json
```

Do not run `node render.mjs final`. It replaces the accepted master.

## 5. Conflicts between older documents and the current brief

| Older rule | Current resolution |
|---|---|
| `creative-orchestration.md`: GPT-6.1 Sol leads, no Astra | Today's handoff wins: Opus leads, Astra gets one review |
| `script-formula.md`: use profile, rear and over-shoulder drawings | The later 2026-11-18 rule wins: frontal only |
| Style bible: no captions | Accepted V8 and the references use captions. Keep them |
| Style bible: hard cuts almost never | The later audit counts 57 cuts and 246 dissolves in 303 edits |
| Style bible: ease-out camera bursts | The later motion report corrected this to symmetric attack and release |
| 190–195 WPM benchmark | A starting point only. This take is 177.4 |
