# Diamond V5 restraint implementation plan

> Execute inline with superpowers:executing-plans. Use one reused independent reviewer at the opening and joined-preview gates.

**Goal:** Correct V4's drawn-head discontinuity and excessive camera/acting emphasis while preserving the approved story, assets, timing, and warm-to-cool arc.

**Architecture:** Isolated same-depth `diamond-field-v5` source copy, sharing existing dependencies. The existing camera-language audit and later motion report govern framing and motion. Lead owns source/audio integration; reviewer owns evidence only.

**Tech stack:** Existing Three.js, Remotion, Python/FFmpeg audio and QA.

**Spec:** The user's approved seven-step build list in this conversation; `cartoon-short-merged/SKILL.md`, `reference-study/camera-language-audit/notes.md`, and `upstream/references/reports/motion.md`.

## Constraints

- Preserve supplied narration, wording, 1.25x pitch-preserving speed, 25.4 seconds, 762 output frames at30fps, white single-word captions and numerical1872.
- No new paid assets, new narration, runtime migration, or broad reference restudy. Preserve V4.
- Measure motion in final output frames; typical symmetric glides around23frames are a starting benchmark, not a rule that overrides travel distance or action readability.
- Separate technical, visual-continuity, and reference-comparison conclusions. No generic pass may imply reference equivalence.

## Review focus

Head/hat silhouette through drawing state changes; excessive perspective/size changes during action; contact and ownership through handoffs; persistent props/terrain during transitions; legibility of evidence, captions, and the emotional ending.

## Tasks

- [x] 1. Pin head-geometry regression with the real drawing function; prove it fails on V4. Prepare restrained opening camera/acting in V5. Render0–5s at small size, compare relevant actual reference sequences and dense head-change frames, get independent review before expanding.
- [x] 2. Apply accepted restraint to remaining camera/acting. Keep original subject hierarchy, use small pushes during readable actions, eliminate repeated zoom/backtrack patterns, and retain purposeful close-ups. Check transitions, contacts, and drawn geometry as each affected range is prepared.
- [x] 3. Align existing audio cue times with any retimed contacts and reduce decorative camera whooshes. Preserve voice and measured clarity. Render joined small preview; reviewer first describes observed events before seeing intended success. Review reference behaviour separately.
- [x] 4. Freeze accepted source/audio. Render one2K export. Decode entire file, measure frames/audio, inspect actual export action/turn/transition frames, record limits and deliver MP4.

## Ledger

2026-11-06: Plan approved through the conversation's build list and “go ahead.” No Git repository is present; same-depth source copy provides isolation. V4 preserved. Opening stage in progress.

Opening evidence: the actual drawing-function regression fails on V4 at output28,0.933s (direction changes the outline), and V5 passes all762 frames. Independent reviewer examined every output frame24–98 and reported stable head/hat/body and readable action, then compared six actual horse reference sheets. Root's separate projection diagnostic still found the first reveal too strong; it was lengthened and reduced before expansion. The joined preview must recheck that final version.

Task2: continuous drawing-view changes removed; approval/head tilt and open-mouth smiles reduced; camera travel restrained across the film. Pickup-to-ruby coverage and the ruby lift now align with the spoken ruby cue. Three coverage changes use four-frame outgoing-image dissolves beneath unchanged crisp captions. New source tests pass for view-state continuity and actual head outlines; existing geometry/prop checks pass. These results do not establish visual reference equivalence.

Task3 in progress: decorative whooshes/glance plucks reduced; retimed ruby accent and rebuilt pitch-preserving mix. Full small preview rendering before review/export.

Task3 complete: joined preview reviewed with separate continuity, readability, and qualitative reference conclusions. No blocking issue reported in inspected ranges. Lead identified shop hand obscuration and corrected only that conditional geometry; reviewer then examined consecutive frames592–647 and cleared the affected range. All other reviewed footage remains unchanged. Final export stage started from frozen local source, audio, and transition images.

Task4 complete:1440×2560,30fps,762frames,25.4seconds. Complete decode exits0; measured−16.7LUFS/−1.4dB true peak. Configured QA detects no black/white, frozen, silent, or unplanned difference-spike intervals. Actual export key frames inspected; source/audio/plate hashes match. Evidence and limits in diamond-field-v5/REVIEW.md. Output ready for user review.
