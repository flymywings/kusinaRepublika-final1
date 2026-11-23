# Coast clip benchmarks

Compare with the accepted baseline specified in [next-build-blueprint.md](../next-build-blueprint.md) at phone size. Show the reviewer neutral clip labels first. Play once at speed, muted, with arrows hidden. Record what they saw before showing the targets or reference clips. Frame-step the first confusing moment and return it to the owning agent. The original V5 checks below are historical ranges; choose current ranges from the active timeline.

Use the full 20-sheet set and measured reports for the overall style target. For each clip, use a few matching reference shots at the same scale for a close comparison. See the [shot brief](story-blueprint.md) for examples beyond the three uploaded videos.

1. **Fault and waterline.** Use two excerpts from one owner. Around 0:08, the reviewer can point to the slab that rose and trace the ripple toward shore. Around 0:12–0:14, they can point to the rock the foam clears before the camera rises. Compare with the rail and fixed sleepers in *Perfect Railroads* and the stream against the hull in *Storm Oil*. Check the dive and resurfacing at speed and frame by frame. Water patterns should stay stable across the boat silhouette, with no flashing, detached streaks, or abrupt switch to blue outlines.
2. **Village and slope.** Use the final wide with the existing landing, stairs and houses. The reviewer can trace a continuous uphill route and identify where the beach falls away. Compare with the connected street in *Horse Race* and the bridge opening's near cables and distant town.
3. **Character acting.** Use a short proof of the task, the alert and the start of the escape. The reviewer can say what each villager was doing and what made each turn. Compare with the cook and crew in *Storm Oil*. Check planted feet and the lead fisher's continuous rear follow once the beat is placed in the full cut.

Render one final cut once the three clips pass. Frame-step the grounding and camera handoffs. Check the full audio for clear narration and ambience through pauses.

## Opening regression check

Render frames 0 through 81 at 30 fps and 1080 × 1920. Review frames 15, 35 and 70 at phone size. Use short01_0060.jpg from the clone and the 8.2-second frame of the uploaded Storm Oil short for comparison.

- CoastSet.tsx owns the village, horizon, terrain, clouds and foreground scenery.
- WaterBoat.tsx owns the bangka, water surface, hull contact and foam.
- CoastActor.tsx owns the pose, card lighting and contact shadow.
- index.tsx owns the scene light, lens, framing, ink and render entry.

Check that the hull and outriggers meet the sea, the character is readable, and the foreground, village and distant land occupy distinct depths. Inspect for silhouettes that overlap awkwardly, including palms that appear to grow from roofs. Keep the soft cloud treatment.
