# Production blueprint for stronger cartoon-short drafts

Status: ready for use as a working production blueprint for new drafts. The user wants stronger, more consistent drafts across different stories. This does not certify a defect-free video or a fully packaged software template. The coastal investigation below is a worked example; its unresolved water defects do not block an unrelated story.

## Reusable drafting scope

For narration, use the user-approved [script formula](script-formula.md): concrete hook, early setting, escalating commitment, understandable clue, mechanism reveal, and a payoff tied to the opening. Validate comprehension before recording or building.

Carry forward the visual style and references, narration-led shot planning, clear visual cause and effect, varied purposeful camera moves, expressive acting, readable captions, sound hierarchy, focused ownership, and review of the joined footage. Replace the topic, script, cast, setting, props, and explanatory mechanism for each story.

Before building, specify the hook image, what each beat must communicate, its focal subject, camera and light, acting, sound, and the handoff to the next beat. Before delivering a draft, check object identity, unintended size changes, grounding and prop contact, plausible entrances/exits, transitions, captions, and audio against that story's actual risks. The missed swimming-fish scale change is a general size-consistency lesson; its water-clearance formula is specific to this short.

Use kit helpers when they solve a demonstrated need. Neither integrating every helper nor completing a separate trial story is required before using this blueprint. Judge consistency by successive rendered drafts and record defects that escaped review, rather than assigning an unproven quality guarantee.

The [diamond-field draft review](diamond-field/REVIEW.md) is the next worked example: lock marks and handoffs before delegation, check drawn prop layering as well as 3D coordinates, keep vertical cards out of steep overhead framing, and make the final reaction readable. Its full draft uses the kit's motion and synth helpers within the existing renderer.

## Coastal worked example: starting point and repairs

Improve the existing coastal short while keeping the look, camera work, and textures the user already likes. V8 received the user's 8.5/10 rating and has unresolved fish and rock pop-ins. Preserve it as a comparison and recovery point, not as proof that continuity passed. The `v8-clean` filename refers to the caption/reaction-mark revision; it is not a defect-free certification.

The reusable drafting scope above governs future stories. The sequence below documents how it was applied to this coastal cut. Story-specific settings and repair tasks do not become requirements for every new short.

Recommended approach: stabilize the current Remotion implementation, then adapt a small, demonstrated improvement from the new kit. A wholesale renderer replacement would reopen working lighting, captions, audio, and geometry. Merely combining Markdown would leave the visual defects unresolved.

## Source authority and evidence

1. Current user decisions govern the result.
2. [Merged skill](cartoon-short-merged/SKILL.md) resolves inherited conflicts.
3. [Original skill](upstream/SKILL.md), its design reports, all 20 reference sheets, full reference footage where available, and [bridge TypeScript](upstream/templates/bridge/) supply the visual standard and implementation examples.
4. [Active project](tsunami-rebuild/) supplies current behavior. Its older blueprint and benchmark still mention V5; use the V8 baseline specified here for this pass.
5. [Extracted kit](cartoon-short-kit/cartoon-short-kit/README.md) supplies supplementary implementation candidates. Its `engine/motion.js`, `roman.js`, `paint.js`, and soldier example are available; their presence does not mean they are integrated. The supplied archive lacks the described `mix.py` and vendored dependencies.

For the first planning pass, index the complete source set and identify which material governs each task. Preserve short file/function/frame citations so subsequent tasks read the relevant material without repeating the entire study. Explain why a reference beat works: what attracts attention, what change remains readable, and how the next move preserves orientation. Numerical resemblance alone is insufficient.

Evidence inspected while drafting: `story.ts` defines 756 frames at 30 fps, dive marker 153 and surface marker 414. The original V8 `index.tsx` blended separate underwater and surface canvases around frames 149–157 and 375–394; the surface camera marker was later, at 414. Fish representations and duplicated shoreline-rock definitions were initial investigation sites. The investigation update below records what was subsequently established; the original V8 export remains the comparison baseline.

## What must be visible in the next cut

- **Opening:** a coherent inhabited island, curved shoreline, boat touching water, supported landing and stairs, fishing activity, and one clear focal subject. Background detail reinforces depth and daily use.
- **Fault:** the audience can identify which side moves and how it disturbs the water, without arrows or narration explaining the image for them. Keep the comparison layer visible, the fault clear of the landing, and the underwater volume translucent blue.
- **Retreat and resurfacing:** the same shoreline, rocks, water level, boat, and fish behavior remain consistent through the camera journey. Receding water reveals existing terrain and stranded fish; nothing materializes just because a scene changes.
- **Recognition:** task, interruption, reaction, then escape. Show the first person noticing before directing attention to the next person. Hands, gear, feet, expressions, and body direction support the action.
- **Escape and ending:** a readable connected uphill route, varied but coherent perspectives, a smooth afternoon change near 14 seconds, and a sunset visibly seated on the horizon. Keep the final line and sound tail purposeful.

Existing single-word white captions retain their fixed area, bold dark outline, small settling pop, and extra hold where speech permits. Keep arrows stable. Keep the approved narration treatment and voice-led mix as the starting point.

## Build sequence and proof

### 1. Establish the actual defects

Watch the full V8 export once at normal speed, then inspect suspicious ranges frame by frame. Log each distinct issue here using: timestamp/frame range, observed behavior, object, likely source location, verified cause or unresolved question, and proof clip. Keep user-reported defects marked unverified until located. Do not ask the user to find timestamps that can be found in the supplied file.

Concentrate on complete dive, fault, retreat, resurfacing, reaction, and ending moves. Give each problem enough surrounding footage to distinguish natural exposure or occlusion from a pop-in. Inspect the underwater/surface overlap separately and in the composite.

### 2. Repair continuity at the responsible layer

Trace each problem before choosing a patch. Check object position, geometry, visibility, material/depth behavior, scene blending, and camera relation as evidence requires. If both scenes describe the same object, reconcile identity, position, scale, and lifecycle. Share data only where duplication is demonstrated to cause drift; do not introduce a general scene-management framework.

Fish must have believable routes, clear the entire seabed silhouette including tails, stay within a water volume when swimming, and become visible through exposure or movement. Stranded fish remain seated on revealed sand. Rocks and permanent props retain their identity across views. Persistent scenery cannot be repaired by simply fading it into existence.

Proof: muted motion at normal speed with captions and arrows hidden, followed by frame stepping at the failed point. Accept when the observed defect is gone and nearby objects and transitions remain consistent.

### 3. Demonstrate one kit improvement

Choose one reaction/recognition beat as the integration trial. Inspect the actual pose and motion helper APIs and adapt only the useful anticipation, expression, or settle behavior into our existing cast. Compare the same beat before and after. Accessories stay attached; feet stay grounded; the reaction must read at phone size.

Keep a kit change only when it visibly improves the beat and preserves the existing look. Then apply the proven technique to other relevant beats. Camera, paint, and post-processing helpers remain candidates until a specific gap justifies them; compatibility must be checked before copying code.

### 4. Refine emphasis and sound

For each beat, name one focal subject and the exact change the viewer must notice. Coordinate framing, light, expression, depth of field, movement, and one principal sound accent around it. Use nearby environmental activity and layered scenery to make the island inhabited without competing with the action.

Preserve warm setup, cooler mechanism/warning, smooth afternoon, and horizon sunset where they fit this story. Bloom enhances bright sources; face and mechanism clarity determine depth of field. Check horizon, reflection, and shadow agreement during motion.

Lock affected picture timing before rebuilding sound cues. Maintain narration clarity, expressive event accents, and continuous ambience through short pauses. Check actual playback when available and report separately from measured audio checks. Align captions again only if timing changed.

### 5. Review the joined result and export

Owner proof clears a change for merging. Review the exact merged clips with handles on both sides before final export. Include one normal-speed full review for pacing, persistent scenery, captions, and sound. Any later change reopens the affected checks.

Compare relevant sequences from the broader reference set, using both measurable properties and perceptual purpose. A still cannot clear a movement defect. Black/freeze detection cannot clear object continuity. Do not claim all 20 full videos were frame-stepped when only sheets or selected sequences were inspected.

Export through the existing 1440×2560, 30 fps workflow after the joined result passes. Decode the exported file; inspect the critical transitions again and check audio, duration, dimensions, captions, final word, and sound tail. Report remaining defects explicitly.

## Ownership and delegation

The lead owns this blueprint, shared timing/geometry contracts, camera/light/captions/audio integration, and final assembly. For a small isolated repair, the lead can implement it directly.

When work is genuinely independent, use bounded owners in source copies from the same baseline:

- **Water/continuity owner:** `Underwater.tsx`, `WaterBoat.tsx`, and `shore.ts` only as required by verified causes. Coordinates shared water and terrain behavior with the lead.
- **Acting/world owner:** choose either cast files (`CoastActor.tsx`, `VillageExtras.tsx`) or `CoastSet.tsx` for the assigned task. Do not assign both broad areas without need. Contract changes return to the lead.
- **Independent motion reviewer:** checks the joined footage for pop-ins, contact, plausible reveals, attention, and handoffs. First views receive neutral labels and no explanation of intended success; reference comparison follows. Reports first bad frame and concrete evidence, not a general score.

Start with only the roles the actual defects require. Never spawn agents merely to fill a roster. Separate copies prevent simultaneous file edits; shared contract review and joined renders prevent incompatible results.

## Token and time discipline

### Early proof gates after the V4 camera/head failure

Keep technical correctness, rendered visual continuity, and reference comparison as separate conclusions. Constant model scale does not prove a stable drawn silhouette; a smooth curve does not prove appropriate camera travel. Inspect the actual drawing function and final-speed motion when those mechanisms change.

Before spreading a new direction through a short, review a small complete action with its incoming/outgoing transitions. Inspect every frame around changed drawing states, then compare relevant reference actions for easing, distance, settling, and acting restraint. The reviewer first describes observed events before receiving the intended answer. Recheck the exact joined version after later changes; a component or sandbox pass clears only that version. Use the existing reference study and a reused bounded reviewer to keep the process economical.

V5 evidence is linked in `diamond-field-v5/REVIEW.md`. These are production review practices, not a newly packaged story template.

- The user's latest preference is to avoid unnecessary credit use. Reuse accepted assets, cached reference findings, and existing evidence. For a focused revision, default to lead implementation with one reviewer reused for the opening and complete preview; add roles only when the task actually needs independent parallel work.
- Prove a small moving sequence first, then extend the demonstrated direction. Use inexpensive preview renders and targeted replacement clips before a final 2K render. Do not repeat the whole reference study or generate new assets for a timing or staging change when the existing material answers it.

- Maintain this one blueprint and its short defect log. Link the merged skill and evidence instead of copying them into every task.
- Give each delegated task a focused brief without full chat history: goal, owned paths, dependencies/contracts, relevant source citations, known defect, and acceptance clip. Attach only the relevant frames or footage.
- Request compact findings: issue, file/function, first bad frame, proposed or applied change, evidence, remaining uncertainty. Aim for about 150–250 words; evidence takes precedence over the limit.
- Reuse an owner for follow-up on the same subsystem. Use a fresh reviewer for the integrated result. Avoid duplicate investigations of already established facts.
- Read exact file ranges and return filtered results. Batch independent searches. Do not dump whole files or repeated reports when a citation answers the question.
- Render affected low-resolution motion first. Reuse existing reference analysis, add missing evidence, then render one full candidate after the joined clips pass. Broaden review when a shared change warrants it.
- Stop an accepted task unless new evidence reveals a regression. Do not add kit features or architecture merely because they are available.
- Compression applies to repeated context and routine reports. Preserve constraints, unresolved facts, and verification evidence. Make no numerical token-savings claim without usage measurements.

## Completion conditions

The build is ready for user review when all located fish/rock pop-ins are resolved in the joined export; the fault and retreat read clearly; fish, feet, gear, landing, and rocks maintain contact and continuity; the island feels inhabited with a clear focal hierarchy; camera/light handoffs remain coherent; captions are readable; and sound supports the action without masking speech.

If a defect remains, the delivery states its timestamp and impact. A score is the user's judgment. Successful rendering or a longer instruction file does not establish improvement.

## Investigation update: 2026-11-05

Confirmed in original V8:

- Stranded fish were created at full size on frames 413 and 423. They had no preceding representation at those locations. The candidate keeps the same fish present in both views and lets water occlusion reveal them.
- The surface had 22 shoreline rocks; the underwater view had only four. Both now render the same `ShoreRocks` component and transforms. This removes a verified representation mismatch; it does not prove that every user-reported rock pop was caused by that mismatch.
- At frame 375 the lens was about 6.3 cm above water while the old underwater overlay remained at full strength. The shader still supplied about 78% water-blue in upward directions. The candidate derives the blend from actual camera clearance rather than independently chosen frame offsets.
- The earlier handoff exposed foreground-water clipping: at frame 370 the visible water intersection was about 6 cm from the lens, inside the surface camera's 20 cm near plane. Both views now use a 1.5 cm near plane.
- A full-render comparison caught a depth-of-field regression: geometry used the new near plane while the lens had initialized from the old value. Initial and rendered camera settings now agree. Independent source review also caught two added rocks suspended over the deeper pre-fault shelf; those placements moved to ground shared by both views, retaining all 22 rocks.
- The second fish's projected body was nearly head-on during the reveal, giving an upright reading. Its pose now shows a clearer side silhouette without changing its terrain contact.

Reproducible checks live in `.diagnostics/v8-continuity/check-continuity.cjs`. Each relevant check failed before its repair. Seven checks now cover persistent fish across 756 frames, matching rock transforms, camera/water agreement across 756 frames, reveal-pose projection, near-water visibility, lens/camera agreement, and raycast support for visible pre-fault shoreline rocks. Render proofs, source hashes, and before-source copies are in that same diagnostics folder. Passing these checks supplements, rather than replaces, visual review of the exact exported candidate.

Reusable practices demonstrated by this investigation: preserve object identity across views, let physical exposure control reveals, derive transition state from shared scene data, and check near-plane geometry during close camera moves. Keep story-specific fish positions, island layout, and sunset timing as this video's settings.

Readiness: the production blueprint can be used for the next story now. The coastal cut still has its own repair list: the rapid dive around frames 174–176, low underwater contrast, strong resurfacing boundary, and the subsequently confirmed shrinking swimming fish. Keep those issues attached to this cut. A future packaged project template can be extracted if useful; it is not a prerequisite for producing the next draft.

### Export verification

[Continuity review cut](tsunami-rebuild/when-the-shore-gets-wider-v8-continuity.mp4): 1440×2560, 30 fps, 756 frames, 25.2 seconds, with the existing approved mix. All seven regression checks pass. The complete file decodes successfully. Detection found no black spans of at least 0.08 seconds, frozen spans of at least 0.4 seconds, or silent spans of at least 0.25 seconds at the configured thresholds. Export loudness is about −18.2 LUFS and true peak about −3.0 dBFS. Reviewed source hashes match the exported candidate's source.

Visual evidence: 51 samples from the actual muxed export, denser transition samples from short proofs, and independent source and image reviews. No normal-speed playback or fresh listening review is claimed. The independent final frame review found no definite new regression, but retained the low underwater contrast, faint arrow around frame 240, and strong water boundary around frames 375–390 as readability concerns. Keep these explicit for the next visual-direction pass.
