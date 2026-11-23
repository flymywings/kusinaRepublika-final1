# Blueprint for a story-driven coastal short

Shot brief for this short. The cloned skill and bridge source govern animation and review. V5 is the baseline. Use [benchmark.md](benchmark.md) to review the three revised sequences before a full render.

## What the reference set adds

This pass compares samples from all 20 cloned contact sheets with v5. The repo's measured reports supply frame-level timing, depth, colour, and acting guidance. The full *Storm Oil*, *Perfect Railroads*, and *Horse Race* clips supply closer sequence comparisons. Sheet numbers below refer to the clone's `references/sheets` filenames.

- **Keep an anchor through the change.** Sheets 01–03, 11, 14–15, and 17–20 show examples of a prop, character, or repeated shape connecting a close explanation to a larger setting. The jar pendulum and free-fall window offer clear visual anchors. Use matching rock layers through the slip and the shore rock through retreat. Judge the motion with the arrows hidden.
- **Give foreground and background a job.** The open street in 04, the dock in 05, the planted rows in 07, the harbour and canal in 12–13, and the arcade aisle in 16 show how repeated forms or a single route create depth. Use the landing, worn route, and stairs as one connected layout. A nearby post can pass the camera as the hill and village hold farther back.
- **Give reactions an object and a partner.** The shop and counter sequences in 06 and 08–09, the living room in 10, and the crew in 12 use a task, another person, or an interruption to motivate a pose change. Use the rope and a clear call to give both villagers a reason to move.
- **Separate the subject with light and depth.** The blue exteriors and warm pools of light in 05, 11, 16, and 20 give nearby faces and objects clear contrast. For the coastal daylight shot, keep the face, rope, and wet edge distinct while softening distant terrain. Use the lighting, depth, and grade reports to judge the result.

For camera timing, follow the bridge source and the later motion report's symmetric 18–40 frame glides. The report corrects the earlier ease-out description in the style bible. Start the next move after the audience can read the important change.

## Story before shot polish

Keep Darian's existing wording for this pass. Treat the bangka as the story's recurring prop and the fisher as the person who has to act. A calm boat gives the audience a normal state. The same boat stranded gives them a consequence they can see. The fisher's turn gives the warning an outcome. The short can get more engaging through staging even with the current script.

## Shot beats and camera jobs

| Beat | What the audience learns | What the camera and sound do |
| --- | --- | --- |
| Normal shore | The boat floats, and the village has a route uphill. | Begin with hull contact, a quiet lap and a clear glimpse of the person. Show the float working against the surface. |
| Beneath the water | The lift under the sea sets the water in motion. | Frame the two sides of the fault across the image. Let a fixed rock layer give the rising side a clear reference. Start the move toward shore after the slip reads. Use a brief, soft rumble under speech. |
| Trough arrives | Lower water exposes sand on a slope. | Hold the same shore rock in frame as foam clears it and wet sand appears. Then rise above water and carry the retreat through the transition. |
| Familiar boat, changed state | The retreat has left the bangka grounded. | Match the opening angle before pushing toward the settling hull. Leave a short pause with surf underneath so the contact can land. |
| Recognition and turn | People notice the retreat and decide to leave. | Show one villager working a rope, stopping and calling out. A second villager reacts to the call. Keep the fisher's turn into the rear follow continuous. |
| Uphill payoff | The fisher puts distance and height between them and the shore. | Keep the worn route from landing to stairs visible. Use the rising ground and shoreline together to show height gained. |

## Art direction that supports those beats

Build visible stair supports and seat the bottom tread on the actual slope. Use the opening and uphill cameras to verify that the porch, stairs and ground connect. Place foreground props by sight line so they create parallax without hiding the action.

Pick one consistent sun direction. Show the sun or a glint where it frames an important object. Try one soft shaft during the uphill move. Use emissive bloom for those sources and keep the face and ink crisp. Set focus on the float, eyes, or fault seam as required. Let foreground and background soften around that focus. Ease the blur down on the final wide.

## Small details in every shot

Plan foreground, middle distance, and background details for each camera. Check which ones survive at phone size and which actually move past one another during the shot.

- **Beach and bangka.** Group rocks, shells, rope ends, and fishing gear near the landing and tideline. A little crab can move beside a rock in the foreground. When the water retreats, the same rock and wet sand show how far the foam line moved.
- **Underwater.** Use translucent blue, a bright surface overhead, and restrained suspended sediment. Place seaweed and small rocks in the foreground, a few low-poly fish farther back, and larger rock shapes fading into blue haze. Give the seaweed a slow sway and the fish a short swim so the water feels inhabited before the slip. Keep the fault seam and the moving layers easy to track.
- **Uphill.** Give the lens stair supports, posts, stones, and palms at different distances. A low view should show what the stairs rest on and let the near posts move past faster than the village. Keep the fisher and uphill route readable.

Treat details as part of staging. Put them where the camera can reveal them or where they make a change easier to see. Use quieter movement and softer focus at the edges while the main action happens.

## Background villagers

Use the two existing villagers and the bridge's flat character cards. Give the rope worker a clear interruption and a visible call. Give the second villager a different starting task and a reaction to that call before both head uphill. Keep the lead fisher easy to recognize and keep posts out of the main sight lines. Check feet and contact shadows in motion.

## Source and ownership map

Each builder owns a separate set of local files. The cloned repo remains the reference.

- **Pipeline and story.** The clone's README maps the assets. Its SKILL and CONTEXT set production and review rules. STYLE_BIBLE and SCRIPT_example provide setup, reveal and payoff. Apply them to the existing Darian narration and the recurring bangka.
- **Water agent.** Owns `Underwater.tsx` and `WaterBoat.tsx`. Reuse the water masks and shade from bridge `paint.ts` and `shade.ts`. Coordinate the rock, foam, and rise timing with `story.ts`. Keep fish moving seaward and check the bangka's contact during the handoff.
- **World agent.** Owns `CoastSet.tsx`. Use bridge `build.ts`, `world.ts`, and `paint.ts` with the textures and depth reports. Connect existing huts to the landing via one uphill route. Reuse one foreground post and place it clear of feet and faces.
- **Acting agent.** Owns `CoastActor.tsx` and `VillageExtras.tsx`. Use bridge `cast.ts`, `toon.ts`, and `cardshade.ts` with the character and motion reports. Stage task, interruption, and escape. Align routes and prop contact with the world agent.
- **Lead.** Owns `story.ts` and `index.tsx`. Apply bridge `story.ts` for eased moves, focus, and foreground timing. Use `Bridge.tsx`, `lights.ts`, `shade.ts`, `ink.ts`, `lensblur.ts`, and `grade.ts` with the lighting, outlines, depth, and grade reports to keep subjects crisp against painted depth. Use the sandbox entry and repo render helpers as the preview workflow. Check local `shore-mix-cues.md` against the bridge audio cues after the picture timing is set.
- **Independent reviewer.** Owns the three pass conditions in [benchmark.md](benchmark.md). Receives unlabeled clips first and reports the first confusing timestamp. Legacy `FaultModel.tsx` and `ShallowsModel.tsx` are reference diagrams for the water agent. The active render uses the underwater set.

## Review gate

1. Set the shared rock, escape route, and narration cues. Build and render only the three benchmark ranges at preview resolution.
2. Review the clips muted at phone size. Compare with v5 and the reference sequences after the first read. Return failed beats to the owner with the first confusing timestamp.
3. Join the passing beats. Check the waterline handoff, boat grounding, and rear follow in motion. Check speech and ambience with sound, then render one 2K export.



