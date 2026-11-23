# V5 restraint and continuity review

V4 remains unchanged. V5 preserves the supplied narration, current wording, 1.25x pitch-preserving pace, 25.4-second duration, white single-word captions, numerical1872, and warm-to-cool reveal. Existing assets, renderer, and audio synthesis are reused.

## Changes and source authority

The later `upstream/references/reports/motion.md` governs easing, correcting the older ease-out interpretation. `reference-study/camera-language-audit/notes.md` and actual horse opening/midpoint sequences informed the hold/action/reveal rhythm. Existing bridge camera, ink, lens, shading, and grade infrastructure remains in use.

- Head identity now uses one seed-based outline independent of gaze or drawing view. Unmotivated front/profile/rear swaps during continuous scenes were removed. The actual drawing-function regression fails on V4 at output28,0.933s; V5 passes all762 output frames.
- Opening holds the payment and restrained private glance, then uses one longer reveal. Field establishing, payment, and shop coverage stay steadier. Pickups, approval/relief, clue, excavation, and planting have smaller motivated moves. Coverage changes at output170,209,256 have four-frame outgoing-image dissolves beneath crisp live captions.
- Nod amplitude, head tilts, and open-mouth smiles are reduced. Ruby coverage/lift moves earlier to align with the narrated ruby cue. Decorative transition whooshes and glance plucks are quieter; the ruby accent was retimed.
- A later contact review found the shop's oversized hand obscuring the gem. Its size and position were corrected and the affected range rerendered before final export.

## Technical evidence

`check.cjs` passes11 checks, including continuous drawing-view states and physical prop framing/contact. `check-head.cjs` separately checks the real drawing function's outline geometry for all762 frames. These do not establish that every rendered pose is visually convincing.

`check-motion.cjs` projects a fixed subject-plane grid through the actual final-speed cameras at720×1280. This is not the reference study's optical-flow method. Initial two-second mean movement falls from9.62 to0.33pixels/frame on that office grid. Selected V5 move peaks are17.49pickup,15.04ruby,14.98approval,24.90clue,10.89dig,25.38plant. The larger opening reveal peaks at26.11. These diagnostics informed corrections; they do not certify an exact reference match.

The joined432×768 preview has762frames at30fps,25.400seconds, AAC48kHz stereo,−16.7LUFS and−1.4dB true peak. Per-frame QA reports no black/white frames, frozen spans of12frames, silence at its configured threshold, or unplanned frame-difference spikes. Artifacts: `proof/preview/qa/`, `proof/qa-shots.json`.

## Visual and reference review

Independent opening review examined every output frame24–98 and actual reference sheets. Joined review separately examined every frame24–70, all three coverage-transition windows, and sampled longer action sequences at5fps. The lead inspected the joined overview, dense opening and selected pickup, approval, payment, shop and planting frames. Evidence: `proof/reviewer-opening/`, `proof/reviewer-full/`, and `proof/preview/`.

The reviewer reported stable heads/hats/bodies in the inspected frames, readable ownership/action and a qualitative improvement toward the reference's held-action/motivated-reveal behaviour. This is not numerical camera equivalence or audience testing. Reviews use extracted sequential frames; no continuous playback or fresh listening review is claimed.

The targeted shop correction cleared consecutive output frames592–647. The reviewer confirmed visible gem, clear leftward transfer, and contact at the recipient's extended hand. Evidence: `proof/shop-contact/` and `proof/reviewer-full/shop-contact-all.jpg`. This clearance applies to that range; the rest retains the prior joined-preview review.

## Final export verification

`they-mined-investors-v5.mp4` is37,699,633bytes:1440×2560,30fps,762frames,25.400seconds, with AAC stereo48kHz. Full-file FFmpeg decode with `-xerror` exits0. Measured loudness is−16.7LUFS, true peak−1.4dB. No black/white frames, frozen spans of12frames, silence of at least0.25seconds at−45dB, or unplanned frame-difference spikes were detected at the configured thresholds.

Actual muxed-export frames were extracted around the original head issue, all three coverage dissolves, year, pickups, approval, payment, clue, corrected shop hand/gem, planting, and ending. The lead inspected the original risk interval's key states, corrected shop contact, and final face/gem framing at full resolution, supplementing the dense preview reviews. Export artifacts: `proof/final/qa/`, `proof/final/decode.log`, `proof/final/frames/`.

Local source, selected audio, and transition-image hashes still match the frozen candidate. Manifests: `proof/source-hashes.json`, `proof/audio-hashes.json`, `proof/transition-hashes.json`. A final small joined preview with the corrected shop range is `proof/preview/review-final.mp4`.

Ready for the user's viewing and judgment. Technical measurements and the bounded frame reviews above do not certify exact reference equivalence or establish audience retention. No fresh listening pass is claimed.
