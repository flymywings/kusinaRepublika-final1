# V4 review

## User feedback supersedes the visual clearance

The user identified excessive camera/acting emphasis and a head discontinuity around1–2seconds. Inspection of the actual export and source confirms that Arnold switches from front to side at source43 (output35,1.167seconds), then back at source78 (output63,2.100seconds). `draw.ts` changes the head width parameter from118 to105 and changes facial placement/nose drawing in a single frame. The constant `pose.scale` check does not test this drawn silhouette. The sequential-frame reviewer and lead missed this defect; the earlier clearance does not establish reference fidelity.

The hook camera completes consecutive reframes at0.853 and1.360seconds, holds briefly, then traverses to the buyer from2.053 to2.800seconds. Smooth interpolation alone does not make this amount of movement appropriate. The existing motion report and camera-language audit remain the direction authority: restrained action coverage, selective motivated reframes, symmetric glides, and subtle pushes while a subject acts. No production correction has been applied in this investigation.

The approved close-up test is extended across the complete 25.4-second story. The opening follows payment into the seller's private glance before revealing the genuine gem. Low pickups, examination beside the cheek, separate approval and relief, close payment, a detective portrait, and ground-level planting give camera moves distinct narrative destinations. The final portrait holds the buyer and real diamond together as his expression drops.

The golden setup gradually cools during suspicion. Blue shadows and midtones persist through the earlier purchase/planting and the ending, while skin and gems remain readable. Sound cues follow contacts and reactions; the reveal reduces the score and the ending uses two restrained ironic notes. The supplied narration and current wording are preserved at the approved1.25x pitch-preserving pace. Captions remain white, single-word, fixed-position; the year displays as1872.

## Preview evidence

- `node diamond-field-v4/check.cjs`: all10 checks pass, covering shot/caption continuity, finite camera settings, scale stability, grounded roots, prop contact, focal prop framing, and lens initialization.
- `proof/preview/qa/report.md`:432x768,30fps,762frames,25.400s; AAC stereo48kHz;−16.8LUFS,−1.4dB true peak. No detected silence, black/white frames, or frozen spans at the configured thresholds.
- Output307 is the intended expert approval expression/head change. Dense frames300–319 show its context; it is not an unexplained object appearing.
- Root inspected the overview and dense opening, decision, clue, purchase/planting, and ending sheets extracted from the muxed preview. The reused independent reviewer cleared the sampled motion frames, with evidence in `proof/reviewer/`.

These are sequential-frame and measured audio reviews. No fresh listening review, real-time playback review, or audience-retention result is claimed.

## Final export verification

`they-mined-investors-v4.mp4` is 43,536,428 bytes: 1440×2560, 30 fps, 762 frames, 25.400 seconds. Audio is AAC stereo at 48 kHz, approximately −16.7 LUFS with −1.4 dB true peak. The complete file decodes with FFmpeg `-xerror`, exit 0. Detection reports no black/white frames, no frozen spans of 12 frames, and no silence of at least 0.25 seconds at −45 dB. The same intended expression-change spike occurs at output307.

Full-resolution frames extracted from the actual muxed export were inspected for the seller's glance, the year, expert/gem/loupe alignment, planting, and final buyer/gem framing. Frozen source and mix hashes match after export. Verification artifacts are `proof/final/qa/report.md`, `proof/final/decode.log`, `proof/final/frames/`, `proof/source-hashes.json`, and `proof/audio-hashes.json`.
