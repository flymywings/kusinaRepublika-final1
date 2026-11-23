# LOOP: add-on to SKILL.md

SKILL.md stays the one skill for building. This file adds the story rules, shot rules, review loop and roles. Where my Short rules conflict with SKILL.md, my rules win (captions ARE used).

## 1. Story
- Open on the action already happening. Ask the question later.
- One subject per shot.
- The twist reuses an earlier object or action.
- Stop at the payoff. Do not explain it.
- Hand the question back to the viewer at the end.

## 2. Shots
My Short rules, every shot:
- Shots last 1.5-2 s. Every cut lands on a word.
- Shot changes are moves, focus pulls or matched dissolves on words. Hard cuts only where those do not fit.
- Captions: 1-2 words, white, bold, at 70% height, never over a face.
- Faces are never cut by the frame and never sit in the bottom 30%. No extreme close-ups that crop a face.
- Every prop is held by a visible hand.
- Nobody is frozen. The camera always drifts a little.
- Light follows the story (day, golden hour, night). Night is darker than day.
- 15-40 props per shot. No empty sky. Signs use made-up words only.
- A test still of every shot comes before any render.

Use the space: each line of narration gets a new angle or a real move through the set, not a small drift in one place.

Shot line fields (one line per shot): start-end s, vo_line (word for word from the script), subject, camera position and move, light, sound. Check every vo_line against the transcript before shooting.

Pacing check against the reference study (20 videos, medians): about 15.8 edits/min, 2.93 s per shot, 3.65 s to the first edit. Our rule of 1.5-2 s shots is the fast end. Mark any stretch that is more than 3 changes in 5 s.

## 3. Loop
1. Study a reference at 30 fps. Record the numbers (shot length, moves per minute, subject size, caption height, contrast).
2. Approve the look with stills before anything moves.
3. Render the film at half resolution. Render only 20 critic frames at full resolution.
4. A fresh critic, who did not see the build, scores 1-10: characters, motion, light, world, camera, captions. Each score gets a reason.
5. The critic fails any frame with a cut-off face, a caption over a face, an unheld prop, an empty background or a limb through a body.
6. Feedback is numbered. Each item has a timestamp, the frame as proof, and a check that must pass.
7. Fix the weakest category first. Re-render only changed frames and the 20 critic frames.
8. Stop when every score is 8 or higher.
9. A score that does not move for 3 rounds means: change the approach, not the numbers.
10. After the stop, I watch it myself and rate it.

## 4. Roles and cost
- Sonnet builds.
- Codex Sol critiques and measures.
- Opus only directs on paper (shot lists, decisions). No code, no renders.
- Test small. Re-render only changed frames. Never read whole folders.
- Log every decision in `_log/DECISIONS.md`. Keep `HANDOFF.md` current.
- Stop after each step and show me.
- Critic: Codex gpt-6.2-sol at xhigh effort. Always show me the critic frames as contact sheets in chat.

## 5. Lessons from hook v5 (apply to every later cut)
- Acting is exaggerated with brows (inner up, outer low), mouth, eye darts, chin tuck, recoil and shrinking shoulders. Never gag faces. The cast B rig caps the open mouth.
- A face is held unchanged for the whole dissolve. Nothing moves on it while it fades.
- Check edge clearance of held props (fork) and prop-versus-face overlap (cake versus chin) with rules.mjs before rendering.
- Time jumps are a quick dip (one picture at a time), not a crossfade of two scales. Fade into a character matches the face's place and size.
- A pullback eases to rest by the last frame. No speed peak at the end of a clip.
- Small hands (dots) cannot show a push or a grip. Say so before promising it.
