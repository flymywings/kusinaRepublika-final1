# Dragon Insurance Production Implementation Plan

> **For agentic workers:** Use executing-plans inline; one independent review of joined production excerpts. Steps track production evidence.

**Goal:** Produce reference-reviewed moving excerpts for the approved dragon insurance story, then complete the film after their user approval.

**Architecture:** Isolated Remotion/Three.js story with frozen renderer helpers, deterministic camera/character/prop contracts, 2D lit character cards, shared 3D props and a reproducible voice-led soundtrack.

**Tech Stack:** Existing local React, Remotion, Three.js, postprocessing, FFmpeg and Node; no new dependencies.

**Spec:** `dragon-fire-insurance/BUILD.md`.

## Global constraints

- Accepted V5 voice timing and wording preserved. 1080×1920 master, 30fps; final 1440×2560.
- No modifications to earlier projects or shared runtime sources.
- First outputs are actual moving production clips, not mockups. Full detailed production follows approval of current hook/reveal excerpts.
- Reference comparison must cause revisions where needed. Creative impact and physical integrity receive separate verdicts.

## Review focus

Stable actual drawn dragon silhouette; hands meet stamped policy and bucket; feet and cake stay supported; substantial gold loss; camera reveals relationships; sound and captions retained.

### Task 1: Frozen foundation and timing
- [x] Copy isolated rendering helpers and accepted voice; record hashes.
- [x] Derive caption/phrase anchors from accepted voice and checked transcript; preserve exact words.
- [x] Write and run a failing contract check before timeline implementation.

### Task 2: Critical story excerpts
- [x] Implement `story.ts`, `Cast.tsx`, `World.tsx`, `Film.tsx`, `index.tsx` and `render.mjs`.
- [x] Pass deterministic timeline/contact/identity tests; render and inspect key states.
- [x] Add voice-led original music and action cues; retain selective lens blur, separate ink and scene-lit characters.

### Task 3: Compare, revise, verify and deliver
- [x] Render hook, claim/realization and ending with context handles.
- [x] Independent review of actual excerpts, then fix material findings and re-render affected excerpts.
- [x] Decode actual files, inspect actual export frames, measure audio, freeze hashes and document coverage limits.
- [x] Prepare current excerpts and concrete reference comparison for user approval.
- [ ] Receive user approval of these excerpts, then continue the complete film.
