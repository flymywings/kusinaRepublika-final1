# Hook B feedback loop (authorized by the user, 2026-11-23)

User: "you can let astra on high check your work and have a feedback loop based on the metrics that we set and the rules that we just recently set and everything, prioritize a 10/10 hook, 1 A 2 A 3 A, and yes fix 1-6."

## The loop
1. **Sonnet 5.5 builds (high effort).** It applies the fixes and renders stills. If its own rule check passes, it renders the moving hook (frames 0-200, with sound), measures it and writes `out/hook-v4/REPORT.md`.
2. **Astra (gpt-6.2-astra, high reasoning) reviews.** A fresh review each round, written to `out/hook-v4/review-r<n>.md`, using `HOOK-REVIEW-BRIEF.md`.
3. **Sonnet applies the findings.** All blockers and majors, plus any minors that are cheap and safe. Then it renders and measures again.
4. **Stop when:** Astra reports no blocker or major finding, every gate in `SCENE-CARDS.md` passes, and Astra's cold-viewer read gives both hook answers. The loop is capped at 3 Astra rounds. If the cap is reached, Opus brings the remaining issue to the user with evidence.
5. **Opus checks the final hook once**, then sends the user the video. The user rates it. The goal is 10/10 in the user's rating.

Applying review findings without asking the user is allowed for this hook loop only. Changes of direction (story, script, voice, cast design, the three decisions) still go to the user.

## Decisions (user, 2026-11-23)
1. **Shot changes:** moves, focus pulls and matched dissolves on words. Hard cuts only where those don't fit.
2. **Signs:** all text is invented words.
3. **Ending:** the hook framing again, with both faces in one picture.

## Fix list for round 1 (user: "yes fix 1-6")
1. **Mirror:** make it read as a mirror. Show the blurred back of her head in the glass, a bit of the reflected cafe, a clear bevelled frame, faint spots and a sheen.
2. **His face:** the lidded "Guarded" face, not the worried brows.
3. **Composition:** stack them vertically and come closer.
   - Her face in the middle of the frame, his reflection above and larger.
   - The camera a little low.
   - No empty floor or table legs.
4. **Light:** day one in late-afternoon gold across her and the wall, with the cool grade lighter.
5. **Shot 1C:** raise the camera so the coins, the box and her fingers read.
6. **Shot 2A:** start closer and make the pull back a proper one. Hands in pockets, and a street full of props.
