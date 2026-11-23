# Diamond hoax draft implementation plan

> For agentic workers: use the subagent-driven-development guidance. This plan implements the script, cast, sly performance direction, and three-agent ownership discussed with the user.

Goal: a complete 32.68-second narrated vertical draft about the 1872 diamond hoax, with flat original cartoon characters in a detailed painted 3D world. Preserve the supplied Darian recording. Follow ../cartoon-short-merged/SKILL.md and ../next-build-blueprint.md.

Architecture: one Remotion/Three canvas with shared camera and post settings. Separate Colorado, transaction-room, and London sets share the same scene contract. Place/time changes use short motivated flashes; camera movement stays continuous within a place. Reuse the cloned bridge's Pen, paint, shading, ink, and lens tools; use the new kit's anticipation, settling, blinks, and curved motion where they help.

Stack: existing installed React/Remotion/Three dependencies. Composition 1080×1920, 30 fps, 981 frames. Final export 1440×2560. No renderer migration or coastal-scene code changes.

## Visual direction and cast

Warm, enticing setup; cooler investigative reveal and payoff. Rough diamonds/rubies, recognizable worn clothing, planted feet, scene-lit cards, plum character ink, near-black world outlines, painted seams, restrained bloom, depth of field that protects the subject. Six designs: Arnold (tall/rust), Slack (shorter/olive), eager investor (stout/navy), cautious investor (slim/burgundy), Janin (notebook/lens), King (blue-gray field coat). London merchant is a hands/sleeves cameo. Original caricatures; no copied reference characters.

The hook reveals the fraud, so later beats explain its success and exposure. Show credible inspection, excited belief, and a clear disturbed-versus-untouched soil comparison. Keep dirt contact, attached hand props, consistent object size, and persistent gem identities explicit.

## Shot beats

- Frames 0–121: fingers plant a gem; widen to both men. The first image already communicates the paradox.
- 122–269: Colorado reveal and traveling inspection party, varied terrain depth and survey/camp details.
- 270–304: diamond discovery close-up; reach, pickup, then reaction.
- 305–331: ruby discovery with another face/angle.
- 332–404: collectors and engineer share the frame; follow hands and eyelines.
- 405–446: expert inspection and confident approval.
- 447–587: transaction-room money exchange; follow the scammers and payment.
- 588–661: return to the claim; King notices the ground.
- 662–775: macro-to-overhead comparison of disturbed patches with gems and intact ground without them.
- 776–875: London flashback; purchased stones and the recurring pouch.
- 876–915: close on the unproductive ground, a brief callback.
- 916–980: transaction-room payoff; gemstone versus payment, delighted scammers and deflated investors.

Bounds follow preliminary local word alignment and can be adjusted by the lead if a boundary is wrong. Provided transcript is authoritative over recognition mistakes and the older SCRIPT.md draft. Captions stay white, single-word, bold dark outline, lower-middle, with restrained pop. No red reaction text.

## Ownership and task order

- [ ] Lead: contract.ts, story.ts, captions.ts, index.tsx, render.mjs, alignment and soundtrack. Establish tests for shot coverage, fixed model sizes, contact coordinates, camera/lens agreement, and exact transcript order before relying on those interfaces.
- [ ] World owner: World.tsx, props.tsx, paint.ts in diamond-field-world. Read the full original skill, relevant design reports and bridge world/build/paint source. Inspect all reference sheets and relevant terrain/interior frames. Build detailed Colorado, transaction, and London sets. Export World({frame,beat}), Gem({kind,size}), MoneyBag({size}), and optional material helpers. Ground height and scene IDs come from contract.ts. Keep gems inside identified disturbed patches; do not animate object size to hide a placement problem. World owns stationary set props and secondary gems. Cast owns interactive main/ruby gems through their entire action.
- [ ] Cast owner: Cast.tsx, draw.ts, acting.ts in diamond-field-cast. Read bridge toon/cast/cardshade and character/motion reports, plus the new kit's roman.js and motion.js. Export Cast({frame,beat}) and CastSheet({frame}). Use contract.ts and shared Gem/MoneyBag interfaces; main/ruby gem ownership belongs here, without duplicate world copies. Test a cast sheet and short reach/reaction motion. Use specific poses, idle/blinks, looks between partners, and front/side/rear variants as needed.
- [ ] Independent reviewer: check this plan before production and the joined images/motion after integration. No production-file ownership. Report concrete failures with first bad frame and evidence, in at most 200 words unless detail is necessary.

Builders work in separate source copies at the same folder depth, share installed dependencies, and merge only owned files. The lead owns shared contracts. Nobody reverts another owner's edits. The same cast owner keeps all six designs consistent.

## Review and delivery

- [ ] Review hook, clue, payoff, and cast sheet before long rendering. Compare matching reference sequences for focal hierarchy and why the move works, not just numeric similarity.
- [ ] Render short affected clips, then review the same ranges after merging. Check object identity/size, hand and foot contact, framing/occlusion, persistent scenery, and place/time handoffs. No still-only clearance of movement defects.
- [ ] Time SFX and original music to the locked picture. Use quiet wind/cloth/boots, soil scrape, small gem clinks, paper/payment movement, reveal accents, and a dry payoff sting. Keep voice clear and ambience continuous. Measure audio; distinguish measurements from actual listening.
- [ ] Export and decode the whole file, check dimensions, duration, audio, black/freeze spans, and exported key frames. State remaining limitations. Deliver a complete draft; this pass does not require a perfect reusable software template.
