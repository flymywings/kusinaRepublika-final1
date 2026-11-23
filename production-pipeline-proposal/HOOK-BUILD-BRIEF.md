# Hook B build brief (Sonnet, high effort, at the user's request)

Approved by the user on 2026-11-23: "sure B", then "run it on sonnet high". Revised the same day for the user's Short rules ("wait i want this"). Build only the hook, show test stills first, then stop.

## Read first
1. `production-pipeline-proposal/SCENE-CARDS.md`, these parts only:
   - "The user's Short rules", the table
   - "Other rules for every card"
   - card 1
   - shot 2A of card 2
   - "Sonnet build, after approval"
   - decision 2, defaulted to A: invented words on the sign and menu
2. `production-pipeline-proposal/voice/johnny-take-02/words-v3.json` and `johnny-take-02-edit-v3.mp3`. This is the locked narration, 56.225 s.
3. Existing source to copy from:
   - `shorts/fragrant-flower/pilot/` (`story.ts`, `Film.tsx`, `timing.ts`, `captions.mjs`, `sound.mjs`)
   - `shorts/fragrant-flower/sets/Cafe.tsx`
   - `shorts/fragrant-flower/cast/b/rig.ts`

## Hard rules
- **Never modify:**
  - `shorts/fragrant-flower/pilot/`, `cast/`, `sets/` and `out/` folders that already exist
  - any file in `production-pipeline-proposal/voice/`
  - approved files
- **New work goes only in:**
  - `shorts/fragrant-flower/cut-v4/` (source)
  - `shorts/fragrant-flower/out/hook-v4/` (renders and reports)
  - `production-pipeline-proposal/voice/johnny-take-02/words-v3-corrected.json`
- **Rig:** import `cast/b/rig.ts` as it is. It already has the approved chin line. Copy the set into `cut-v4/` before adding the mirror, the props and the invented-word text.
- **Limits:** no subagents, commits, publishing or high-res export. Do not change the narration audio or its timing.
- **Art direction:** no symbols, sprites, flashes, gag faces or candy colors. Muted, grounded and restrained.
- **The user's rules, checked on every still:**
  - shots of 1.5-2 s, each starting on its word
  - captions of 1-2 words, white, bold, at 70 % height, never over a face
  - faces never cut by the frame and never in the bottom 30 %
  - every moving prop held by a visible hand
  - nobody frozen and the camera always drifting
  - light that follows the time of day
  - 15-40 props per shot, signs with made-up words only
  - a test still of every shot before any moving render
- **Repairs:** fix only problems that stop a render. Allow at most two focused passes on any one problem. List everything else.

## Steps
1. **Word times.** Correct the word start times with forced alignment or a careful listen, and save them as `words-v3-corrected.json`. Keep phrase edges exact.
   - Report every word that moves by more than 2 frames.
   - Move any shot start in card 1 that shifts with its word.
2. **Build card 1 (shots 1A, 1B, 1C), the handoff on "is" and shot 2A:**
   - **STARE state:** frame 0 is mid-reaction. Her lids are half up, the fork is raised and trembling, she is breathing, and the camera is already pushing. Export it as a named state so cards 3, 4 and 5 and the ending can reuse it exactly.
   - **The mirror:** an old bevelled mirror in a walnut frame behind her booth. His reflection is a mirrored copy of his card behind the glass plane, with his earring on the swapped side. His whole head stays inside the mirror and the frame. The glass is slightly colder and darker.
   - **Captions:** move to 70 % height and allow 1-2 words.
3. **Test stills** at 720x1280, captions on, saved to `out/hook-v4/stills/`:
   - the middle frame of 1A, 1B, 1C and 2A
   - frames 0, 54, 72, 114 and 149
   - one contact sheet of them all
   - a 360-px-wide copy of frame 0 and frame 54
   Under each still, record the rules check: faces inside the frame and above 70 %, caption clear of faces, a visible hand on each moving prop, a prop count of 15-40, invented text only.
4. **Stop.** Write `out/hook-v4/STILLS.md` with that check and any problems, and end your reply. Do not render motion until Opus and the user have checked the stills. You will be told to continue in this thread.
5. **Only when told:**
   - Render frames 0-200 with sound to `out/hook-v4/hook-B.mp4`, plus a 360-px copy.
   - Sound follows the card 1 sound column: fork ticks at f0, 11, 21 and 32 from one reusable buffer, mixed 5-10 dB under the v3 master voice, which stays unchanged.
   - Measure 0-4.96 s with `reference-study/measure.py`'s measurement function, the same method as `production-pipeline-proposal/findings/reference-metrics-audit.md`.
   - Write `out/hook-v4/REPORT.md` with each hook gate marked pass or fail, with evidence.

## Final line of your reply
`HOOK-B stills <path to contact sheet>, rules <n passed>/<n checked>, open issues <count>`
