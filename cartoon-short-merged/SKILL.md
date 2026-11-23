---
name: cartoon-short-merged
description: Create and refine original narrated cartoon shorts using this project's Remotion and Three.js scenes, the cloned bridge style study, and the cartoon audio kit's shot planning and acting tools. Use for another short in this project's style or a revision of its existing video.
---

# Cartoon shorts for this project

Make original vertical stories with flat cartoon cards in a painted 3D world. Give each beat one clear focal point and a visible cause and effect. Use the existing project as the working implementation.

## Project sources

Paths are relative to this skill folder.

- [Cloned production skill](../upstream/SKILL.md) supplies the full look and render workflow.
- [Original style bible](../upstream/references/STYLE_BIBLE.md), the original contact sheets in `../upstream/references/sheets/`, and the [measured reports](../upstream/references/reports/) supply the style benchmark. The later motion report corrects the early style bible's ease-out interpretation. Use symmetric glides as the default.
- [Approved script formula](../script-formula.md) supplies the story structure, opening checks, and performance criteria.
- [Bridge source](../upstream/templates/bridge/) supplies camera, world, paint, toon cards, lighting, ink, lens blur, and grade.
- [Coastal worked example](../tsunami-rebuild/) supplies geometry, timing, captions, audio tools, and a render entry. Its V8 baseline belongs to that story.
- [Diamond-field worked example](../diamond-field/BUILD.md) and [review lessons](../diamond-field/REVIEW.md) demonstrate a different story with six original cast designs, three sets, kit motion/synth integration, fixed prop sizes, and narrated evidence comparison. Use the requested story's own build brief, transcript, and recording as the current source of truth.
- The supplementary [new skill](../../SKILL.md) and [extracted kit](../cartoon-short-kit/cartoon-short-kit/README.md) supply additional techniques. Inspect the kit's `engine/motion.js`, `engine/roman.js`, `example/soldier/story.js`, and worked example when adapting acting or shot structure.
- [Next-build blueprint](../next-build-blueprint.md) records current defects, repair evidence, and the conditions for promoting practices into a future template.

The kit archive in this session lacks the vendored dependencies and `mix.py` described in its Markdown. Check resources before invoking its setup or renderer. Port a tested behavior into the existing implementation when useful. A runtime migration requires its own concrete task.

For a new build, study the complete cloned skill, its design Markdown, reference frames and sheets, and the TypeScript modules that implement the chosen look. Before each revision, cross-reference the affected guidance and actual source functions with a matching reference sequence. Record which sources informed the change; never claim an unviewed frame or unread file was studied. Current user decisions and this merged skill resolve inherited conflicts, including captions, output size, audio treatment, and the moving sunset.

## 20-video measurement benchmark

Use the [complete per-video table](../reference-study/frame-audit/summary.csv) for all 20 local reference videos, IDs 01–20. The [frame-indexed edit log](../reference-study/frame-audit/summary.json) maps IDs to source files and retained edit frames. The [full study archive](../reference-study/frame-audit/reference-study-20.zip) contains one contact sheet per video and the frame, edit, candidate, and camera-motion CSVs. Use the [contact sheets](../reference-study/frame-audit/contact-sheets/) to find relevant beats, then inspect the actual motion around the chosen timestamps. The [script study](../reference-study/script-analysis/index.json) and [lighting study](../reference-study/emphasis-light-audit/notes.md) support comparisons by story beat.

The study covers 33,120 frames at 30 fps. It retained 303 edit boundaries from 461 candidates, including 57 hard cuts and 246 blends. Per-video medians were 15.77 edits/min, 2.93 s/shot, 9.54 shot-size changes/min, 6 estimated locations, 114.2/255 mean frame luma, 128.7/255 luma P90−P10, 45.49% saturation, and 73.82% eligible camera-motion coverage. The median script pace was 3.68 words/sec.

For each new short or major creative rebuild, use the full table to establish the range. Multiply the per-minute medians by runtime in minutes for a pacing check. Pick one matching reference interval for each proof and record its video ID and exact frame or timestamp range. Compare subject size, apparent camera direction, onset and settle, and cut or blend length. Compare local brightness and color on the focal subject and its surroundings. Use the range for context and the chosen interval for shot decisions. Explain deliberate departures in the proof notes.

Retained boundaries can miss similar-looking cuts and blends. Shot-size and location counts are estimates. Camera directions describe apparent screen motion, with coverage reported per video. Whole-frame color averages include scenery, so use local contrast to judge emphasis. The frame study measured picture. Establish audio timing by listening to the matching reference and consulting the Bridge cue sheet.

## Intake and story

Use the supplied topic, script, and voice. For an existing short, continue from the latest accepted cut and requested changes.

When ideas are requested, offer ten original ideas with a hook, payoff, two or three visual beats, and a documented-history/disputed-account/folklore label. Verify historical claims before proposing them as fact. Apply this to future U.S. and Canadian history topics as well.

For a new script, research several distinct ideas before selecting the strongest visual explanation. Check topics visible in the conversation for repeats; state when earlier ideas are unavailable. Verify the central fact with reliable sources, preferably original research, museums, universities, or government archives, and cross-check where possible. Preserve uncertainty and distinguish history from disputed accounts or folklore.

Use the reference study's story structure: an immediate concrete paradox, surprising statement, or question; a quick setting; escalating actions; a mechanism revealed through a clear clue or everyday comparison; and a short ironic payoff or callback. For a 20–30 second short, use two or three escalating beats. Keep wording original, conversational, and easy to animate. Humor comes from supported facts and consequences. The bridge's “Luckily / Unluckily” pair and the reference's “You see” transition are optional examples, not mandatory lines.

Before delivering a script, check these points:
- Each middle beat changes the situation: someone commits money, makes a decision, risks something, or discovers a clue. Show the concrete consequence that makes the payoff matter.
- If the hook already reveals the trick, use later lines to explain how it worked or was exposed. Give each sentence new information.
- Keep investigator titles and names only when they help the listener understand the story. Express technical clues in everyday language. Use a familiar prop across setup and consequence when it fits.
- Calculate estimated speech time as word count divided by the intended words per second, then allow for actual pauses. The reference study measures about 3.7 words/second: 66 words is about 18 seconds before pauses; 75–85 words is about 20–23 seconds. Follow an explicit word cap when supplied; flag a conflict with the requested runtime instead of inventing a duration. Final recording duration determines picture timing.

Deliver the idea in one sentence, the clean voiceover without scene directions, its word count, a pace-based duration estimate, and linked supporting sources. Carry accepted review lessons into this section when they apply to future scripts; keep story-specific facts in that story's script file.

## Audio and timing

For new voiceovers, preserve the supplied recording and time the picture to its words. Use local word alignment where available, check it against the final transcript, and inspect phrase boundaries.

The existing Darian cut uses intentional phrase trims and tempo changes in [mix.ps1](../tsunami-rebuild/mix.ps1). Its captions follow those transforms. Preserve the approved recording treatment when revising that cut, or rebuild the alignment if its timing changes.

The current project uses cue-specific levels and voice-led ducking. Retain that approach for its revisions and use it as the default for new shorts. The new skill's 50% gated-RMS rule is an alternate mix specification that needs an explicit choice before use. A level ratio alone does not establish speech clarity.

Use the [bridge audio tools and cue sheet](../upstream/templates/audio/) and local `build_sound.py`/`mix.ps1` to generate reproducible stems and mixes. Place accents on actions, lower ambience around important cues, and carry ambience through narration pauses. Rebuild affected cues after picture timing changes. Check loudness, peaks, and the fastest speech passage. State whether audio review used actual playback or waveform/level checks.

## Shot plan before source edits

For each shot, record its frame range, spoken words, focal subject, setting, light, camera move, expression/action, secondary detail, and sound cue. Mark the reveal and the settle. Use a compact plan appropriate to the change.

Frame zero must already show the hook. Place word-linked reactions zero to three frames before their spoken cue when readable. Keep story, camera, lighting, actors, and effects deterministic functions of the frame; avoid wall-clock motion and unseeded randomness. Carry the plan into the existing `story.ts` shot, camera, transition, and focus controls, checking the actual implementation before changing them.

Use the audio kit's useful progression of close hook, wider reveal, character interaction, key-object insert, reaction, and payoff where it fits the story. Let the viewer read the important change before the camera leaves it.

For this user's style, warm light can establish the hook and cooler blue can emphasize a mechanism or warning. Lighting follows the story. The coastal cut specifically moves smoothly into afternoon around 14 seconds and ends at sunset after the escape. Judge the sun against the visible horizon and align the water reflection with it.

## Hook and reveal gate

For a new short or a major change to its hook, reveal, or creative direction, build only two low-cost moving proofs first. Reuse existing assets when they can demonstrate the action. Script approval or a general go-ahead before these proofs authorizes proof work. **Start full production only after the user has seen and explicitly approved both current proofs.** For a targeted revision outside this scope, review the affected range and its cut handles.

1. **Hook.** Render the first two seconds with sound. Extend through the first hook line if it runs longer. Start on a readable action and check when the focal prop, action, and contradiction register.
2. **Reveal.** Render from the lead-in through the moment the viewer can explain the mechanism or reversal. Include the settle. Check that the evidence reads without captions and survives the light change.
3. **Comparison.** Deliver both playable phone-size clips with sound and one compact reference-versus-draft timing note per clip. Name the reference ID and timestamps. Record actual draft times for the cut or blend, size change, camera move and settle, and key sound cues. Note the focal subject's light and color contrast and any deliberate difference. Label provisional narration or audio.
4. **Integrity and approval.** Watch each proof muted for action clarity, then listen with sound. Step across the cut handles and check eyes, hands, feet, prop persistence and contact, clipping, and occlusion. Revise only the affected clip and its handoffs after a failed check. Keep full production gated until both proofs pass user review. Reopen a proof if later changes alter its timing, readability, or sound. Run one joined phone-size review before final-resolution export.

## World, acting, and camera

Use the bridge's painted materials, near-black world ink, plum character outlines, scene-lit cards, contact shadows, and horizon-matched fog. Keep faces and important props readable through shade. Use depth of field on close and medium shots, then ease it down for a wide. Bloom belongs to bright sources such as the sun and glints.

Connect environments with routes and repeated forms at different depths. Use the full reference set for the overall look and choose relevant sequences for each direct comparison. Small details should reveal a change or establish how the place is used.

Adapt the new kit's arm poses, anticipation, blink timing, curved paths, and settling motion when they improve a specific beat. Test a new pose or accessory on a character sheet and a short motion clip. Keep breathing and secondary movement restrained so they support the action. Plant feet during travel and check detached props against hands and head positions.

Prefer symmetric 18–40 frame glides for reframing. Use curved camera paths for a purposeful move around a subject. Keep orientation and subject position continuous through a match. A place or time jump can use a short transition. Check the complete move at phone size and step through any confusing handoff.

Keep scenery persistent. Frame or occlude a prop naturally when it should leave view. For curved shores, all owners use the same boundary, terrain height, and retreat timing. Check a moving animal's entire silhouette against rendered terrain, including body and tail.

## Captions and annotations

The current user preference is white, bold, single-word captions at a fixed lower-middle position, with a dark outline and a small settling pop. Give short words a few additional frames where speech timing allows. Hold each cue until the next word and verify the transcript and overlap.

The latest accepted cut removes red emphasis words and the red reaction marks. Use acting to carry those reactions. New requests can change these preferences.

Arrows should explain motion that already reads without them. Give them stable orientation and a smooth path. Keep impact shake from making explanatory arrows jitter.

## Delegation and merge gates

When parallel work is warranted, make separate copies of the same accepted source for water/mechanism, world, and acting. Share heavy assets and dependencies. Assign ownership before editing and keep shared geometry and timing contracts identical.

Each owner renders the affected motion in their sandbox. For this project, source copies at the same directory depth preserve the existing relative imports. Merge only the owned files after their proof is reviewed.

The lead owns camera, light, captions, audio integration, and the shared contracts. An independent reviewer owns the joined-clip checks. Compare with the accepted baseline to catch regressions.

Review in this order.

1. Watch neutral, muted clips at phone size before reading the intended answer. Ask what moved, where the route goes, and what triggered the reaction. Check a mechanism once with arrows and captions hidden.
2. Compare the closest reference sequences. Check focal hierarchy, foot/prop contact, fish clearance, persistent scenery, and the relevant camera or lighting transition.
3. Merge and rerender those same ranges with handles on both sides. A sandbox pass clears a change for merge. A merged pass clears that version for export.
4. Send each failed range to its owner with the first confusing frame. Any later source change reopens the affected merged clip. Export the exact reviewed source and mix.

Keep the review proportional to the change. A caption-color adjustment needs targeted caption frames and output verification. Geometry or camera changes need the affected motion and its handoffs.

## Render and deliver

Use the current Remotion entry and available local browser. Render preview clips at a valid even resolution such as scale `.4`. Send a contact sheet with a brief shot description before a long render.

The project target is 1440×2560 at 30 fps. Its 1080×1920 composition renders at scale `1.3333333333333333`. Use H.264 around CRF 16 and explicitly mux the chosen mix using `-map 0:v:0 -map 1:a:0`.

Inspect the exported key actions and transitions. Decode the full file and check black/frozen spans, audio gaps, loudness, dimensions, and duration. Check the final word and sound tail against the chosen ending.

Deliver the MP4 by an absolute local link. Describe the important changes, the verification method, and any visible limitation.
