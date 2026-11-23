# Scene-card brief (for a fresh Opus thread)

The user is frustrated that this is taking too long. Work fast and keep the chat short. The narration v3 has their picks applied and gets its final listen while you write. Small timing changes remap by line, so do not wait for it. Job: write the scene cards, show them to the user, stop.
No build, render, subagent or video-source edit in this job.

## The user's standing rules, in their words
- "Check with me before a major change in direction, before replacing approved material, and before publishing."
- "Preserve the approved designs, script, narration, and existing cuts as the comparison baseline. Put your new script and cut in separate files."
- "before you auto align from astra's review i want to have a say aswell": never apply review or QA findings automatically, bugs included.
- "yes you can assign as much sonnet agents as you need but we're overspending with opus making everything"
- "we don't want to keep regenning"
- "With me retaining final creative and publishing approval."
- "Leave Fable out for now." The one Astra review is used.

Agreed split ("sure", 2026-11-23): Opus writes cards and does one check of the proof. One Sonnet agent at medium effort builds
and applies the fixes the user picks. A script measures. The user approves cards, fixes, proof and export.
Up to two focused passes on a stubborn issue, then bring the decision back with evidence.

## Read first (small set)
1. `production-pipeline-proposal/CHECKPOINT.json`
2. `production-pipeline-proposal/voice/SCRIPT-D-final.txt` and `SCRIPT-D-checks.md`
3. `production-pipeline-proposal/voice/johnny-take-02/{words-v3.json,edit-map-v3.json}` (master: `johnny-take-02-edit-v3.mp3`)
4. `production-pipeline-proposal/findings/reference-metrics-audit.md`
5. `upstream/references/STYLE_BIBLE.md`, `script-formula.md`, and the Look targets section of `upstream/SKILL.md`
6. `shorts/fragrant-flower/cast/redesign/STYLE.md`
7. `shorts/fragrant-flower/out/pilot-v3/revision.jpg` (one image). Open source only where a card depends on what exists.

Where documents conflict: the user's words, then the 20-video measurements, then the bridge reports (one video).

## Direction already agreed with the user
- Pilot v3 was rated 7.5. The goal is 10/10 in the user's rating.
- Cast B. Restraint: no cheesy faces, symbols or candy sets. Frontal-only flat characters in the 3D cafe. Flush only at the turn.
- Open on her eyes. The rewind lands on that exact first frame.
- Rewind: cold, grey, reversed picture, reverse sound effect, subtle tape overlay (this overrules the old "no tape symbols" comment in story.ts). 1.3 s.
- Introduce Rick's blur, emphasis and depth of field, "not exactly". Their own style eventually.

## Opus proposals to carry into the cards for approval
- Idea: he does to her what everyone does to him, looks at a face and decides what it means.
- Blur is his tunnel vision: misreading melts everything but her eyes, the truth opens the focus. Cool is his reading, warm is the truth.
- The turn is her pounding heart, acted, with no heart symbol. "Noticed him long before" gets a short earlier glimpse of him from her table.
- The ending returns to the hook framing, and he stays.
- Reversal sound: freeze, accelerating tape whir with reversed bell, chair and clink, clunk on the first frame.

## Faults the user named in v3, to design out
- She clips through the door: she waits back, the leaf opens fully, then she enters.
- Sliding, no footsteps: real step cycle with weight, a sound on each contact.
- Goofy run out: no front-on run. She turns, one blurred hair-streak whip, the door left swinging.

## Each card, in plain language the user can skim
Line and exact times from words-v3.json. Who wants what and what changes. First and last image. Transition in and out
(moves, masked whips, short dissolves; hard cuts rare). Shot size, camera move, push, roll. Focus and blur. Light and color.
Acting. Sound cues. Caption. Reuse or new work. Pass/fail targets and any written exception.

Word times inside phrases are estimates (about +/-0.1 s). Phrase edges, the rewind and the POUNDING start are exact. Put the caption and on-word timing correction in the Sonnet build's first step (the user picked it).

Aim for about seven cards with a few shots each, not a card per sentence. Deliver `production-pipeline-proposal/SCENE-CARDS.md`, a short summary table in chat, and at most three decisions, each with your recommendation, so one reply from the user can approve the build. Do not re-measure references or re-open settled script and voice choices. Then stop.
