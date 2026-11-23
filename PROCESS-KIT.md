# PROCESS KIT: how we make a narrated 3D-cartoon Short (written 2026-11-24 from the Fragrant Flower film)

Fragrant Flower (54.9 s, vertical, 30 fps) was rated 8/10 by the user (r7) and accepted as the base for future shorts. This file is the portable version of how it was made: what is ours, the steps with copy-paste prompts, the rules, the tools and the lessons. Read this, then `HANDOFF.md` and `_log/DECISIONS.md` for the history.

## 1. What is ours (and what is not)

Ours, reusable for any new story:
- **Cast B**, a restrained flat frontal cartoon cast drawn on billboard "cards" in a painted 3D world (`shorts/fragrant-flower/cast/b`, rig in `cast/b-hands/rig.ts`). Acting comes only from brows, eyes, mouth, head tilt and recoil. No gag faces, sweat drops, hatching or googly eyes. Hands are the "big dot" (the user picked it).
- **The pipeline**: Remotion plus Three.js, every frame a pure function of the frame number; a word-anchored shot list; per-shot stills; half-size renders; one critic round per film; the user watches and rates.
- **Sound builder** (`pipeline/sound-build-v2.mjs`): voice untouched, generated effects, a music bed (own composition or a licensed file), mastered to about -14 LUFS.
- **Loop ending**: the last frame is the first frame, so the Short loops.

Not ours: the anime's characters, names and story (Fragrant Flower is a fan animation of *The Fragrant Flower Blooms With Dignity*), the music (Temporex "Numbers" came from the user; its licence was never checked), and the reference channels' designs. Learn their look, light and rhythm; never copy their characters.

For a new story, write new characters and sets. Keep cast B's style rules and the rig, not the faces.

## 2. What to copy to a new workload

Copy these, keep the folder layout, and run `npm install` at the project root:
- `pipeline/` (render.mjs, film-time.mjs, shot-times.mjs, captions-from-words.mjs, voice-trim.mjs, sound-build-v2.mjs, camera-audit.mjs, qa/)
- `shorts/fragrant-flower/cast/b` and `cast/b-hands` (the rig), `cut-v6/` (Film.tsx, Cafe.tsx as a set example, story.ts, chunkA.ts, chunkB.ts, reveal.ts, timeline.ts, rules.ts, rules.mjs, cues.json) as the worked example to copy and rename
- `production-pipeline-proposal/film-shots.json` and `FILM-SHOTLIST.md` as the shot-list format
- `cartoon-short-merged/SKILL.md` and `LOOP.md`, `HANDOFF.md`, `_log/DECISIONS.md`
- Do NOT edit `cast/b`, `cut-v4`, `cut-v5`, `pilot`. Copy first.

## 3. The process, step by step

Stop after each step and show the user. Where the user has granted auto-approval for routine creative calls (see memory `autonomy-next-short`), decide and log it; still stop for the final watch and rating, publishing, replacing approved material and new art direction.

### Step 0: Intake
Inputs: a voice-over `.wav`, its script `.txt`, and word timings (`words.json`). If there are no timings:
> Make word timings for my voice-over (audio: [voice.wav], script: [script.txt]) with a free local tool that gives word timestamps. Match every word to the script text and write words.json. Show me the first 10 words with their times so I can check them.

The voice is the master: never stretch it. Everything is timed to the words.

### Step 1: Story and hook
> Plan a [LENGTH]-second vertical Short about [TOPIC]. Open on the action already happening and ask the question later. One subject per shot. The twist reuses an earlier object or action. Stop at the payoff and hand the question back. Write 3 title options first (a few words, a concrete noun, "Why/How/The ... Who").

### Step 2: Word-anchored shot list, with staging risks
Every shot starts on a word and gets: frames, subject, camera move, light, sound, caption. Add a **risk line per shot before building** (RISK RULE, from the user): list what could go wrong in staging (clipping, floating props, reflections that read as nothing, a face cut by the frame, door and prop collisions, +z-looking cameras) and stage around it instead of fixing later.
> Write the shot list as film-shots.json anchored to words. For every shot add a staging risk and how you will avoid it. Show me the table, then wait.

Then `node pipeline/shot-times.mjs <film-shots.json> --write <FILM-SHOTLIST.md>` (never overwrites).

### Step 3: Look-dev
> Render one test still per scene in its light, plus the cast, at half size. Run the rules preflight on them. Show contact sheets and wait.

### Step 4: Build in chunks
Build 6-10 shots at a time (we used chunk A, chunk B and the reveal). After each chunk render stills at the key frames of every shot, view them as one contact sheet, and fix framing before any video. Never push through a problem and call it a fix: if a shot has a known risk, change the staging.

### Step 5: Sound
> Build the sound: keep the voice untouched, add effects on the exact words (whoosh on moves, bell/door, steps, thuds for props, a riser into reveals, a chime on the payoff), a music bed that is quiet and ducks to the voice, mastered to -14 LUFS, true peak about -1 dB. Only use music I have a licence for; if I give none, compose a simple original loop.

Command: `node pipeline/sound-build-v2.mjs --voice <wav> --cues cues.json --out <wav> --seconds <s> --lufs=-13.3`. Put `music.file` in cues.json to use a track. You cannot audition audio: check only loudness and peak, and tell the user so.

### Step 6: One critic round
A fresh critic that did not see the build scores 1-10 (characters, motion, light, world, camera, captions) from stills of the whole film, each score with a reason. Our critic: `delegate_task`, provider `codex`, model `gpt-6.2-sol`, options `{"reasoningEffort":"xhigh"}`, one review file in `out/<cut>/_review/`. Call `orchestrator_capabilities` once first. Show the critic frames to the user as contact sheets.

### Step 7: The user's notes loop
The user watches a half-size render and rates it. Every note has three parts: what is wrong, where (second or shot), what they want instead.
> [NUMBER] changes, only in [SHOT / SECONDS]. Change only that and what it touches. 1. [WHAT'S WRONG] at [WHERE]. I want [WHAT INSTEAD].
> Render only what changed, check stills first, show a contact sheet of the changed part.

Treat their timestamps as film seconds x 30 = frame. Reproduce a complaint from the exact frame before changing anything; if you cannot reproduce it, say so and ask for the timestamp.

### Step 8: Camera and loop pass
- Run `node pipeline/camera-audit.mjs`. Every shot's camera must follow something (a person, a hand, a gaze, a prop). Fix the shots with low path or many still frames.
- Loop: over the last about 14 frames dissolve back into frame 0, converge the face and the camera to frame 0's state, take anything that is not in frame 0 out of the scene (our reflection stepped back out of the mirror), and make the last frame identical to frame 0.

### Step 9: Final render
> Render the final at full size (scale 1), verify width, height, frame count, duration and audio, and compare the first and last frame (PSNR above about 40 dB after compression). Tell me honestly what still looks weak.

Full size takes about 5 minutes on this machine for 1646 frames.

### Step 10: Title and description
Match the reference channel: Title Case, 4-6 words, no question mark, "Why [subject] [odd fact]" or "The [noun] Who/That ...". Description: one plain line that repeats the question without the twist, a line naming the source and "fan animation, not affiliated", and 2 tags. Check licences (music, source material) before posting. Publishing is the user's decision.

## 4. Rules (the user's words win)

- Shots 1.5-2 s except deliberate merged moves; every cut on a word. Mark any stretch with more than 3 changes in 5 s.
- Captions: 1-2 words, white, bold, at 70 % height, never over a face.
- Faces are never cut by the frame and never in the bottom 30 %, with one approved exception (the 0.6 s chest zoom on "pounding").
- Every prop is held by a visible hand. Nobody frozen. The camera always follows something and eases to rest at the end of a clip.
- A face is held unchanged through a dissolve. Time jumps are a quick dip, not a crossfade of two scales.
- Light follows the story and the time of day must be readable. Never jump the light across a dissolve: bridge it (`mixSun` in `story.ts`).
- 15-40 props per shot, no empty sky, signs use made-up words.
- Mirrors: show the whole frame so it reads as a mirror, reflection text reversed, and use a mirror only where the story needs it.
- Never make a character walk backwards facing the camera; stride toward it and move the camera ahead.
- Exaggerate acting, but not loud: visually and in audio.

## 5. Tools and commands (Windows)

- Render: `node pipeline/render.mjs <entry.tsx> <Comp> still|stills|video <out> --frames a,b | --range a-b --scale 0.5 --props '{...}' --public <dir>` (never overwrites; use a new name each time).
- Preflight: `node shorts/fragrant-flower/cut-v6/rules.mjs <frames>`. Its maths assumes the camera looks along -z, so it is wrong for shots that look toward +z (doors); check those from stills.
- Camera audit: `node pipeline/camera-audit.mjs`.
- Sound: `pipeline/sound-build-v2.mjs` (about 7 s).
- Contact sheets: ffmpeg `hstack` of stills with equal widths; show them in chat with `![alt](C:/vp/name.png)` (forward slashes).

## 6. Gotchas

- No Python on this machine: write edits as small node scripts.
- No `bc`; foreground `sleep` is blocked: use an `until`/`for` loop that checks for the output file, or run in the background and wait.
- Windows is case-insensitive: do not add a file whose name differs from another only by case.
- Do not `rm -rf` a folder your shell is inside.
- Half-size renders show thin seam lines that do not exist at full size.
- Changing a shot's length changes the voice sync: the voice is locked, so borrow frames from a neighbour instead.

## 7. Lessons from this film (the reasons behind the rules)

- The first full cut scored 7.5: the notes were all staging (clipping, floating shelf, a teleporting dash, a reflection from nowhere, a weak ending). The fix is the risk line in Step 2, not more fix rounds.
- A mirror reads as a mirror only with the full frame visible and low blur; a person standing in a blurred room reads as "behind her".
- A foreground object that crosses a face (a case rail, a plank) is the most common "weird" frame: check every low-angle shot for rails and planks at eye height.
- A street shot lit gold next to a morning shot looks like a mistake; bridge the light.
- A static camera reads as dead. Give every shot a follow target.
- A perfect loop needs the last frame's scene, face and camera to match frame 0, not just a dissolve.
- Exact-frame reproduction beats guessing: render the user's timestamp before you change code.

## 8. Open items from this film

6B tongs/plate detail (the rig has no tongs prop), the 4A to 4C box continuity (two different box objects), pacing windows around f960-1155, and the Temporex licence.
