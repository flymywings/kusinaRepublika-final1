# Opus check of johnny-take-02 (2026-11-23). Findings only, nothing applied. The user picks.

Passes: 180 of 180 words by transcript, raw files untouched, pauses, rewind 1.293 s, -16.1 LUFS, -1.8 dBTP, phrase edges.
Loudness range 1.8 LU is inside the six checked references (1.7-2.3), so it is not a defect.

1. Pacing. Seven edits slow the voice (0.88-0.96), so the master is 57.8 s and 3.12 words/s. Cause: the Opus brief told Sonnet to
   slow anything over about 4.2-4.3 words/s measured without gaps, which is not how the reference 3.7 is measured.
   Proposed: no slow-downs, the "staring" line at about 1.08, "asks," and "Wait," gaps 0.14.
2. "and her heart was POUNDING": +17.2 dB, about 11 dB over its neighbour, and 12 dB of limiting on the P. Likely grit or thump.
   Proposed: tame the plosive, use far less gain, let the clause lead as a hush and the word land at no more than +1 LU.
3. Word timing inside phrases is an estimate (about +/-0.1 s). Good enough for scene cards, not for word captions or on-word hits.
   Proposed: correct key marks and caption words before the proof, during the Sonnet build.
