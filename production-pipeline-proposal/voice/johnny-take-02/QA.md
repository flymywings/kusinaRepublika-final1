# johnny-take-02 edit: QA

Files: `johnny-take-02-edit.wav` (24-bit, 44.1 kHz mono), `johnny-take-02-edit.mp3`, `edit-map.json`, `words.json`, `cut.mjs` (build), `verify.mjs` (measures the exported master; every number below comes from it, run on the finished wav).
Rebuild: `WHISPER_MODEL=<model.bin> node cut.mjs <johnny-take-02 dir> [outDir]`. It refuses to overwrite any existing output. `raw/a.mp3` and `raw/b.mp3` were only read (sha256 still 6ae8566e… / 29361bb6…).

## Take choice

**Base: take A for every piece. No phrase was taken from B.**

- Whisper transcribed both takes identically: 180 of 180 words matched the script (the only difference is spelling, "blonde" for "blond").
- A and B are very close in pacing and level. The one clear difference is "He has no idea what to do when someone looks at it": B is about 4.5 LU quieter than A (−24.4 vs −19.9 K-weighted). B's "and stays" is also 1.2 LU lower than A's.
- Both takes deliver "and her heart was POUNDING" about 7 dB under the clause before it (A −27.2, B −26.6). That is a quiet delivery, not a different one, so B offers no fix. I raised it in the edit instead (+17 dB piece gain, see the listening list).
- I found no wrong or garbled word, artifact or click in A. The pauses are clean: the loudest frame inside the interior of any set pause is below −100 dBFS and only word decays sit at the edges. No click or breath was removed, so nothing is logged for removal.
- Not verifiable without listening: acting, intonation, mouth noise inside words, and whether any word is garbled in a way Whisper tolerates.

## Per sentence

Rate is atempo (pitch preserved), one value per piece. Words/s counts words over audible speech time, excluding silences of 0.09 s or more inside the sentence. Gap before is the measured pause between audible speech (audible means a 5 ms RMS frame above −48 dBFS). LUFS is ebur128 on the sentence slice of the master.

| # | Sentence | Take | Rate | Words/s | Gap before (s) | LUFS |
|---|---|---|---|---|---|---|
| 1 | This girl looked terrified of his face... then came back to buy him cake. | A | 1.147 / 1.00 | 3.79 | 0.060 (lead-in) | −16.4 |
| 2 | Rintaro is tall, blond, pierced… run from him. | A | 1.25 (cap) | 3.21 | 0.241 | −16.1 |
| 3 | Which isn't great when your family owns a cake shop. | A | 1.00 | 4.19 | 0.236 | −16.0 |
| 4 | So when he spots a girl… can't help staring. | A | 1.00 | 3.67 | 0.241 | −16.2 |
| 5 | She locks eyes with him and bolts out the door. | A | 0.88 (floor) | 3.99 | 0.241 | −16.3 |
| 6 | He's sure he's traumatized her for life. | A | 1.216 | 3.60 | 0.346 | −16.0 |
| 7 | But the next day she's back… a slice. | A | 1.073 | 3.61 | 0.241 | −16.1 |
| 8 | So he asks, "Wait, didn't you run… scared of me?" | A | 0.925 | 4.17 | 0.241 | −16.5 |
| 9 | You see, from HER side, that look was never fear. | A | 1.00 | 3.33 | **1.293** | −16.2 |
| 10 | No guy had ever stared at her before, and her heart was POUNDING. | A | 0.934 / 0.88 | 3.40 | 0.256 | −15.3 |
| 11 | He'd only just noticed her, but she'd noticed him long before that. | A | 1.00 | 3.35 | 0.401 | −15.9 |
| 12 | He read her face the exact same way EVERYONE reads his. | A | 1.00 | 3.25 | 0.451 | −16.3 |
| 13 | Then she tells him, "I've never once thought you were scary." | A | 0.884 / 1.00 | 3.81 | 0.256 | −16.1 |
| 14 | He's used to people taking one look at his face and running. | A | 0.957 | 4.26 | 0.456 | −16.0 |
| 15 | He has no idea what to do when someone looks at it... and stays. | A | 0.925 / 1.00 | 3.91 | 0.241 | −16.2 |

Targets that were not met or are only borderline:
- Sentence 2 (the Rintaro list) is read at 2.6 words/s in the take. The 1.25 cap leaves it at 3.21, short of the 3.7 goal. I did not push past the cap.
- Sentence 3 (4.19) and sentence 8 (4.17) sit at the top of the setup band I allowed (4.2). The reveal sentences 9–11 (3.33, 3.40, 3.35) are inside 3.3–3.7, sentence 9 only just.
- "And her heart was POUNDING" runs at 0.88, about 3.1 words/s.
- From "He read her face": sentences 12–15 are at or below 4.3 words/s, so none needed more than a slight slow-down ("Then she tells him,", "He's used to people…" and "He has no idea…" were slowed to 4.27, 4.26 and 4.28).

## Set pauses (measured on the wav)

| After | Target | Measured |
|---|---|---|
| "face..." (hook) | ~0.30 | 0.301 |
| ordinary sentence ends (cake., him., shop., staring., life., slice., running.) | 0.20–0.28 | 0.236–0.241 |
| "asks," / "Wait," | 0.28 (shortened from 0.4) | 0.281 / 0.281 |
| "bolts out the door." | ~0.35 | 0.346 |
| "scared of me?" (rewind) | 1.30 ± 0.03 | **1.293** |
| "fear." / "before," / "his." / "him," | 0.26 / 0.20 / 0.26 / 0.30 | 0.256 / 0.200 / 0.256 / 0.301 |
| "POUNDING." | ~0.40 | 0.401 |
| "that." (before "He read her face") | ~0.45 | 0.451 |
| "scary." (before "He's used to people") | ~0.45 | 0.456 |
| "it..." (before "and stays") | 0.63 ± 0.05 | 0.626 |
| lead-in before first word | ≤ 0.1 | 0.060 |

Natural gaps inside sentences were left alone and shrink with the phrase rate: 0.06–0.23 s in the master, the longest being 0.231 s after "noticed her," and 0.19 s after "cake,". The end is 0.084 s after the last audible frame (57.680 s); the decay falls from −34 to −62 dBFS over about 50 ms and then fades to silence by the end of the file.

## Transcript of the finished master (Whisper, 16 kHz)

> This girl looked terrified of his face. Then came back to buy him cake. Rintaro is tall, blonde, pierced, and so intimidating that strangers literally run from him. Which isn't great when your family owns a cake shop. So when he spots a girl demolishing a mountain of cake, he can't help staring. She locks eyes with him and bolts out the door. He's sure he's traumatized her for life. But the next day she's back, apologizing and insisting on buying him a slice. So he asks, "Wait, didn't you run because you were scared of me?" You see, from her side, that look was never fear. No guy had ever stared at her before and her heart was pounding. He'd only just noticed her, but she'd noticed him long before that. He read her face the exact same way everyone reads his. Then she tells him, "I've never once thought you were scary." He's used to people taking one look at his face and running. He has no idea what to do when someone looks at it. And stays.

Compared word by word with the script, ignoring case and punctuation: **180 words, 0 mismatches** ("blonde" is Whisper's spelling of "blond"). Whisper rendered the last ellipsis as a full stop and capitalised "And"; that is punctuation, not wording.

## Every word is present

- Whisper heard all 180 words in script order on the master.
- `words.json` holds the 180 script tokens exactly as written (case and punctuation kept), in order, with start < end, no overlap, and no word span containing a silence of 0.15 s or more. Shortest word 0.05 s ("of"), longest 0.83 s ("apologizing"). The quietest word is "of" (peak −37.8 dBFS, 50 ms), then "it..." (−35.1) and "him." (−33.9); all are short and unstressed or sentence-final decays.
- Each of the 21 pieces starts and ends inside silence. Source cut points sit at −59 dBFS or lower (5 ms RMS, three frames around the cut) with 8 ms fades.

**Word timing accuracy (limit of what I could check):** sentence and phrase start/end times and all pauses are exact (energy-based, measured on the master). Boundaries *between words inside a phrase* are estimates. Whisper's own word times were inconsistent (they stretch into silence and disagreed between whole-file and per-phrase runs by about 0.2 s), so I placed them with a syllable-weighted layout between the real silences, nudged toward Whisper when it agreed within 0.12 s and snapped to a clearly deeper energy valley within 40 ms. Expect typical error around ±0.1 s and a few short words ("of", "it...", "him,") more than that. No forced aligner was available. If the animation locks tightly to individual words, check these by eye against the waveform first.

`marks`: rewindStart 29.335 (end of "me?"), rewindEnd = youSee 30.635, pounding 37.630 (start of "POUNDING."), stays 57.182 (start of "stays."); I also added `andStays` 56.902 (start of "and").

## Joins

42 piece edges checked in a ±1 ms window: loudest sample −76.1 dBFS, largest sample-to-sample step −82.9 dBFS, so there are no clicks or steps at joins. Pieces are only ever joined in silence; gain changes happen inside pauses.

## Pitch on changed phrases

"Piece" is the line number in `words.json`. Frame-by-frame f0 of the output against the matching moment in the source (output time × rate), median difference in cents, with 10th and 90th percentile:

| Piece | Rate | Median | p10 / p90 |
|---|---|---|---|
| 1 hook "This girl…face..." | 1.147 | 0 | −16 / 0 |
| 3 "Rintaro…" | 1.25 | 0 | −21 / 13 |
| 6 "She locks eyes…" | 0.88 | 0 | −14 / 6 |
| 8 "But the next day…" | 1.073 | 0 | −7 / 12 |
| 9 "So he asks," | 0.925 | 0 | −11 / 6 |
| 11 "didn't you run…" | 0.925 | 0 | −9 / 19 |
| 13 "No guy…before," | 0.934 | 0 | −20 / 7 |
| 14 "and her heart was POUNDING." | 0.88 | −12 | −29 / 0 |
| 17 "Then she tells him," | 0.884 | −5 | −26 / 5 |
| 19 "He's used to people…" | 0.957 | −3 | −31 / 0 |
| 20 "He has no idea…" | 0.925 | 0 | −14 / 12 |

Pitch is preserved (all within about ±12 cents at the median; unchanged pieces read 0, which is the estimator's own floor). Not measurable: "He's sure he's traumatized her for life." (rate 1.216, only 2 voiced frames found) and "Wait," (0 voiced frames).

## Duration, loudness, peak, range (exported wav)

| Measure | Result | Target | |
|---|---|---|---|
| Duration | **57.764 s** | 50–56 s | **outside by 1.8 s** (not squeezed) |
| Integrated | −16.1 LUFS (mp3 −16.1) | −16 ± 0.6 | pass |
| True peak | −2.1 dBTP (mp3 −1.8) | ≤ −1.5 | pass |
| Loudness range | **1.8 LU** | ideally 2–4 | slightly under |
| Phrase levels (K-weighted, per piece) | −15.5 to −15.8 LU for 19 of 21 pieces | within ~1.5 LU | pass |
| Sentence LUFS | −15.3 to −16.5 (spread 1.2) | within ~1.5 | pass |
| POUNDING (word, K-weighted) | −14.3 vs −15.5/−15.6 neighbours = **+1.3 LU** | up to +2 | pass |
| "and stays" (K-weighted) | −16.6 vs −15.6 neighbours = **−1.0 LU** (slice LUFS: −17.6 vs −15.7 = −1.9, short-clip bias) | ≤ 2 under | pass, borderline on the slice measure |

Why the duration is long: the take is slow (about 3 words/s overall) and I held the rate caps (0.88–1.25) and the pause values from the brief. Squeezing the pauses to their minimums would save about 0.5 s and more speed-up is capped, so I left both.

Why the loudness range is under 2: phrases are leveled to within 0.3 LU of each other on purpose. I did not widen the spread to raise it.

**Limiter load.** The source has about 19 dB between average level and peaks, so reaching −16 LUFS needs real peak limiting: 4–7 dB on most phrases and about 12 dB on the P of "POUNDING" (peak +9.9 dBFS before the limiter, ceiling −2.16). Integrated loudness before the limiter is −15.0, so the limiter costs 1.0 LU on average. This is the most likely place for audible grit.

## Not verified (no listening possible)

- Naturalness of atempo at 1.25× and 1.22×, breath and sibilance behaviour, and limiter transparency.
- Intonation and acting continuity between pieces cut from the same take.
- Whether the +17 dB on "and her heart was POUNDING" reads as emphasis or as a hiss/shout.
- Word-internal timing in `words.json` (see above).

## Worth your ear (4 timestamps)

1. **29.3–30.7 s**: "scared of me?" into the 1.293 s rewind gap and "You see". Check the decay of "me?" and that the silence is clean.
2. **36.6–38.4 s**: "and her heart was POUNDING." Boosted +17 dB, slowed to 0.88, with the heaviest limiting on the P. Listen for grit, hiss and whether the emphasis feels right.
3. **4.3–9.0 s**: "Rintaro is tall, blond, pierced…" sped up 1.25×, the largest speed-up, with the 0.1–0.14 s comma gaps. Check clarity and flutter.
4. **56.1–57.7 s**: "…looks at it… and stays." The 0.626 s pause, the soft last phrase (+11 dB gain, −1 LU) and the short natural decay at the very end.
