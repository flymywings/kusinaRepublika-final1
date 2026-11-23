# Hook B review brief (Astra, high reasoning)

You are the independent reviewer of a 5-6 second animated hook, the opening of a YouTube Short. The goal is a hook that holds a viewer like the reference channel's openings do, in this project's own restrained style. The user wants a 10/10 hook. Be concrete, skeptical and evidence-based. You review only. Do not edit source or renders.

## What to read (workspace: C:\Users\Win 10\Downloads\new video edit)
1. `production-pipeline-proposal/SCENE-CARDS.md`, these parts:
   - the user's Short rules table
   - "Other rules for every card"
   - card 1
   - shot 2A
   - proof targets
2. `production-pipeline-proposal/HOOK-LOOP.md`, for the loop and the user's decisions.
3. The work under review, in `shorts/fragrant-flower/out/hook-v4/`:
   - the moving proof `hook-B*.mp4` (newest), if there is one
   - `stills/`
   - `REPORT.md` and `STILLS.md`
   - earlier `review-r*.md` files, so you don't repeat fixed points
4. References:
   - `script-formula.md`, section "Visual hook priority"
   - `upstream/references/STYLE_BIBLE.md`
   - `reference-study/frame-audit/summary.json` (hookEdits, hookWarm, first edit times)
   - at most four images from `reference-study/hook-study-agent/` and `reference-study/hook-study-lead/`
5. The narration: `production-pipeline-proposal/voice/johnny-take-02/johnny-take-02-edit-v3.mp3` with `words-v3-corrected.json`. Words and audio are locked.

## What to check
1. **Cold read first.** Before reading the card, look at the proof or stills as a stranger would. What is happening? Who feels what? What question do you have after about 4 s? The target answers are "she seemed scared of him" and "why would she come back?"
2. **The user's rules,** on every shot and still:
   - shot length 1.5-2.0 s, with each change on a word
   - captions of 1-2 words at 70 % height, never over a face
   - faces never cut by the frame and never in the bottom 30 %
   - every moving prop in a visible hand
   - nobody frozen and the camera always drifting
   - light that follows the time of day
   - 15-40 props per shot, made-up words only
3. **The card's hook gates.** Includes frame 0 equal to the planned rewind landing state, and phone-size readability at 360 px wide.
4. **The metrics.** If a moving proof exists, run or check `reference-study/measure.py`'s measurement on 0-4.96 s against the proof targets: brightness, contrast, saturation and camera motion. Say which numbers you measured yourself.
5. **Craft against the references:**
   - frame 0 already in action
   - the key noun landing with one continuous move or focus pull
   - the time jump reading
   - sound accents on the action
   - expression and acting legibility
   - mirror legibility
   - composition for a vertical phone screen
   - the restraint rules: no symbols, sprites, flashes or gag faces
6. **Score the hook from 0 to 10** against the reference openings, with the three biggest things keeping it from 10. This is your opinion. Label it as such.

## Output
Write `shorts/fragrant-flower/out/hook-v4/review-r<n>.md`, where n is the next free number. Include:
- the cold read
- findings ranked blocker, major or minor, each with:
  - a frame number or time
  - evidence: what you saw or measured
  - the rule, gate or reference it breaks
  - one concrete fix a builder can apply
- gate and rule pass/fail tables
- the score and its reasons

Keep it under 150 lines.

End your reply with: `REVIEW r<n>: blockers <n>, majors <n>, minors <n>, score <x>/10`.
