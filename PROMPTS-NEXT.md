# Prompts for the next steps (paste each one into a fresh chat in this folder)

Run them in order. Each prompt stands alone, so no chat needs the old history. Wait for each one to finish before starting the next.

---

## 1. Add the loop to the existing skill (Sonnet, medium)

```
Write cartoon-short-merged\LOOP.md, at most 60 lines. It is an add-on to the project's existing skill, cartoon-short-merged\SKILL.md, which stays the one skill for building. Do not modify SKILL.md, upstream\, or anything in C:\Users\Win 10\.agents\skills\.

Read only these:
- cartoon-short-merged\SKILL.md (skim it, so LOOP.md doesn't repeat it)
- C:\Users\Win 10\.claude\projects\C--Users-Win-10-Downloads-new-video-edit\memory\short-rules.md (my Short rules; where they conflict with the skill, my rules win, so captions ARE used)
- production-pipeline-proposal\REFERENCE-LESSONS.md, sections 3 and 4 only

Put in four parts, without repeating the skill:
1. Story: open on the action already happening and ask the question later; one subject per shot; the twist reuses an earlier object; stop at the payoff.
2. Shots: my Short rules, plus "use the space". Each line of narration gets a new angle or a real move through the set, not a small drift in one place.
3. Loop:
   - Study a reference at 30 fps and record the numbers.
   - Approve the look with stills before anything moves.
   - Render the film at half resolution and only 20 critic frames at full resolution.
   - A fresh critic scores characters, motion, light, world, camera and captions from 1 to 10. It fails any frame with a cut-off face, a caption over a face, an unheld prop, an empty background or a limb through a body.
   - Fix the weakest category first. Stop when every score is 8 or higher.
   - If a score doesn't move for 3 rounds, change the approach, not the numbers.
   - Feedback is numbered, with a timestamp and the frame as proof.
4. Roles and cost:
   - Sonnet builds.
   - Codex Sol critiques and measures.
   - Opus only directs on paper.
   - Test small, re-render only changed frames, never read whole folders.
   - Log decisions in _log/DECISIONS.md and keep HANDOFF.md current.

No other files. Show me LOOP.md and stop.
```

## 2. Trim the narration (Sonnet, medium)

```
Trim the Fragrant Flower narration by editing the existing take only. Do not generate any new voice.
Input: production-pipeline-proposal\voice\johnny-take-02\johnny-take-02-edit-v3.mp3 and words-v3-corrected.json (fall back to words-v3.json). Do not modify either file.
- Cut "literally" from line 3.
- Cut "You see," from line 12.
- Use clean cuts at zero crossings with 10-20 ms crossfades, and keep natural breath gaps.
Write johnny-take-02-edit-v4.mp3 and words-v4.json (same format, all times shifted) in the same folder. Report the new duration, check each cut point's waveform for clicks or clipped words, and give the timestamps of each cut so I can listen. Then stop.
```

## 3. Hook shot list on paper (Opus, fresh chat, keep it short)

```
Use the skill cartoon-short-merged\SKILL.md with its add-on cartoon-short-merged\LOOP.md. Write a new hook shot list for Fragrant Flower, on paper only, with no code and no renders.
Read only:
- cartoon-short-merged\LOOP.md
- production-pipeline-proposal\voice\johnny-take-02\words-v4.json, lines 1-3
- the "1. Hook" section of production-pipeline-proposal\SCENE-CARDS.md, to see what was tried
I rated the last build, hook-B-r3, 6/10: too much going on, no emphasis, and static. I want one clear subject per line and real use of the cafe's space.
Plan:
- "This girl looked terrified of his face..." Her face alone, big, with the fork trembling. One push in that lands on "terrified".
- "then came back to buy him cake." One big move through the cafe to the next day: she sets the cake in front of him, seen from a low angle at the table.
- The mirror: [KEEP IT / TAKE IT OUT, my choice] in the hook. If it comes out, save it for the reveal and the ending.
Write production-pipeline-proposal\HOOK-SHOTLIST.md with one line per shot: word, frames, subject, camera position and move through the space, light, sound. Keep it under 30 lines. Then stop.
```

## 4. Build the hook (Sonnet, high)

```
Use the skill cartoon-short-merged\SKILL.md with its add-on cartoon-short-merged\LOOP.md. Build the hook from production-pipeline-proposal\HOOK-SHOTLIST.md.
Narration: production-pipeline-proposal\voice\johnny-take-02\johnny-take-02-edit-v4.mp3 with words-v4.json.
Copy source from shorts\fragrant-flower\cut-v4\ into a new shorts\fragrant-flower\cut-v5\. Do not modify cut-v4, pilot, cast or sets.
Steps:
1. First, stills of every shot at 720x1280. Stop and show me.
2. When I say go: render the hook with sound at half resolution to shorts\fragrant-flower\out\hook-v5\, plus 20 critic frames at full resolution in out\hook-v5\critic\. Mix to -14 LUFS.
Do not run reviews yourself. Stop after each step.
```

## 5. Critic (Codex, gpt-6.2-sol, medium effort)

```
You are a strict critic who has not seen this work being made. Review only; do not edit anything.
Read:
- cartoon-short-merged\LOOP.md (the loop and fail rules)
- production-pipeline-proposal\HOOK-SHOTLIST.md
- the frames in shorts\fragrant-flower\out\hook-v5\critic\
- reference frames in reference-study\hook-study-lead\ (at most 4)
Score characters, motion, light, world, camera and captions from 1 to 10, each with a reason. List every failed frame.
Write a numbered fix list, weakest category first. Each fix gets a frame number, what is wrong, and a check that must pass.
Write shorts\fragrant-flower\out\hook-v5\_review\round-<n>.md, under 60 lines.
```

## 6. Fix round (Sonnet, medium; repeat steps 5 and 6)

```
Apply shorts\fragrant-flower\out\hook-v5\_review\round-<n>.md in cut-v5, weakest category first. Re-render only the changed frames and the 20 critic frames. Then stop.
```

Stop the loop when every score is 8 or higher, or after 3 rounds with no change. Then watch it yourself and rate it.
