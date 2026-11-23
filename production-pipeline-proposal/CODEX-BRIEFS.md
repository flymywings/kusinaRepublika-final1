# Codex briefs

Not yet sent. Workspace: `C:\Users\Win 10\Downloads\new video edit`.
Read `production-pipeline-proposal/INVENTORY.md` first. Preserve all existing files.
Record findings in `production-pipeline-proposal/findings/` so Opus can continue without Codex.

## 1. Sol, immediately: recover the cloud baseline

Most urgent, because the only copy of the approved V8 cast is in a cloud scratch folder.
Codex desktop has already read this chat with `codex_app.read_thread`.

- Chat: `6aff8551-d920-83ec-99a2-cd7824bc80b0`
- Ask that chat to run the export below, then save the result unmodified in `production-pipeline-proposal/recovered/cloud/`.
- Verify Draft 1 `130a487bf9ac7df15846512c51dbc8eafbc63636d69baba15749902c0c24e60e` and Draft 2 `d2f2d457d04a3b4a39887f6ab120e05b7fe94bf28fff594b92327b97507dbbf9`.

Message for the old chat (the user can also paste it directly):

> Don't edit or re-render anything. Zip the entire folder /workspace/scratch/c5717709f38c/kapit-designbuild/new-video-edit/fragrant-flower, including gitignored files, public/, approved/ and every proof MP4 and PNG. Add a SHA256SUMS file and the output of `git status --short` and `git diff` to the zip, then give me the download.

Done when: the V8 sheet, V8 source, tagged narration, approval record, film source and both MP4s are local and hashed.

## 2. Sol, immediately after: baseline evidence (no source edits)

- Prove the V8 sheet rerenders pixel-identical on Windows. The cloud used `swangle`, this PC uses `angle`, so report any difference without "fixing" the art.
- For both drafts: probe, full decode, loudness, 1 fps sheet, 5 fps sheets of 0:00–0:03 and 0:23–0:37, word alignment to the recovered take.
- Log each visible defect with file, timecode and reproduction command.

Done when: `findings/baseline.md` links every sample. No creative judgements.

## 3. Sol, after pipeline approval: tooling (sole owner of `pipeline/cli.mjs` and `pipeline/qa/`)

In this order, stopping cleanly if access ends:
1. Render wrapper: versioned outputs, refuses overwrite, preview with audio, removes its own bundle (problems 1, 2, 4, 5).
2. Media QA and contact-sheet command that takes an output path (problem 3).
3. Synchronized, labelled side-by-side comparison with selectable audio.
4. Pinned dependencies, type check, path config (problems 7–9).
5. Word alignment with the Whisper model moved out of Temp and name corrections.

Opus owns the kit, cast, shots, sets and cues. Do not edit them.
Each step returns: changed files, exact command, result, open issues.

## 4. Astra, one review (Sol if Astra is unavailable)

Review the pilot if it exists at least 12 hours before access ends. Otherwise review `PROPOSAL.md`.

First, watch or sample the cut muted and say what happens, before reading the intent. Then report only concrete technical findings:
severity, file and line, timecode, reproduction steps, expected against actual, suggested owner.
Cover overwrite safety, timing drift, identity regression, contact, clipping, missing assets, audio sync, and checks that can pass a broken cut.
Do not edit. Write `findings/independent-review.md`.
