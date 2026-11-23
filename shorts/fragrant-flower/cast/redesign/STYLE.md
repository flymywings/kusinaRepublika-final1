# Cast redesign study, 2026-11-22

Status: **B chosen 2026-11-22**. Production rig: `../b/rig.ts`. The restraint pass there supersedes the blush, shine and glossy-eye notes below: no hatching, gag faces or large catchlights.

- Approved source: `production-pipeline-proposal/recovered/cloud-v8/` (hashes match its approval record).
- Runnable V8 copy: `../v8/CharacterArt.tsx` (only the import path differs).
- Candidates: `rig.ts`, style `rick` (A) and `ours` (B).
- Evidence: `../../out/style-r4/` (sheet, in-world board, 4.2 s clips with the real take).
- `../superseded-v8-rebuild/` predates the recovered file. Do not use it.

## Sources

Read in full: `upstream/SKILL.md`, `upstream/references/STYLE_BIBLE.md`, all eight files in `upstream/references/reports/`,
`cartoon-short-merged/SKILL.md`, `script-formula.md`, `next-build-blueprint.md`, `docs/creative-orchestration.md`,
`toon.ts`, `shade.ts`, `cardshade.ts`.

Read in part: bridge `Bridge.tsx` and `lights.ts`, headers of `ink.ts`, `grade.ts`, `lensblur.ts`, `paint.ts`,
Supermarket `Film`, `World`, `Cast`, `story`, `sound-v8`.

Not yet read: bridge `world.ts`, `build.ts`, `cast.ts`, `story.ts`, the audio templates, the kit engine, most other
project folders' source. Read the relevant one before using that subsystem.

## Audit: the skill was copied and mostly not connected

The seven look files in Supermarket's `lib/` are byte-identical to the original templates.

| Skill system | Supermarket V8 | Fragrant Flower drafts | This study |
|---|---|---|---|
| Two-tone world shading (`twoTone`) | 0 calls, 26 MeshStandardMaterial uses | cloud café used MeshStandardMaterial | used |
| Measured light presets (`LIGHTS`) | not used | no sign of it | used, shade lifted for interior |
| Torso gradient (`gradFill`) | 0 calls | 0 calls in the V8 cast | used |
| Ink, lens blur, grade | used, with custom bloom and grade values | no visible sign in the exports | used, original order and bloom values |
| Head line about 5% of width with 3:1 taper | used | Rintaro 5.5 with little taper, Kaoruko 11.5, so the two do not match | same rule for both |
| Legs about 0.055 of head width | not measured | about 0.10 | 0.058 |
| 3.5 head-heights for an adult | not measured | about 4.3 for Rintaro | 3.5 |
| Readable brows | yes | hidden on attentive Kaoruko | always drawn |

## Fundamentals kept in A and B

Bean head (wider than tall, chin taper, slight asymmetry), plum thick-thin ink, features 26u apart, lidded deadpan
default, single-stroke legs, dot hands, bean torso with gradient, large readable acting, painted inked 3D world.

## What makes B ours

1. **The eyes open into colour.** Everyone lives in ink eyes. Iris colour appears only when a character truly sees
   someone. It is rare on purpose, so it can mark the emotional turn of every Short.
2. **Anime silhouette.** Hair breaks the bean and identifies the character in black.
3. **Cel hair with coloured line.** One shadow step, one shine shape, ink in the hair's own dark.
4. **Blush that builds** from the cheeks, where the reference floods the whole head.

## Deliberate departures

| Skill rule | Departure | Reason |
|---|---|---|
| No captions | Single-word captions | Later user preference and merged skill |
| Profile and rear drawings | Frontal only | Later user rule |
| No neck | B keeps a tapered neck | User asked for it in V8 |
| No blush, no catchlights | B uses both, only at emotional beats | Signature |
| White or cream skins | V8 skin colours | User restored them |
| Outdoor day shade 0.30 | 0.56 indoors | `lighting.md` measures interior shade near half of lit |
| Grade amount 1.0 | 0.42 | `grade.md` 5C says lower it after the lighting lands |

## Limits of the test

- School uniforms only, to compare fairly with V8. Café wardrobe is still open.
- V8 has four moods, so its "Hurt" is `worried` and its reaction in the clip is `soft`.
- The set is a style-test corner, not the pilot set. No Foley, music or finished acting.
