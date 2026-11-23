# Character adaptation notes

## V8 performance and caption lessons

Preserve simple ink eyes while changing emotions. A continuous camera does not hide a categorical expression swap. Stage recognition before the camera transfers attention; let defensive surprise recover through a blink, settling lids/brows, smaller mouth and coordinated hand/shoulder release. Interpolate drawing geometry rather than dissolving two faces. Never blend white and plum eye fills: intermediate mauve ovals look like a different design. Keep the white aperture and familiar ink lid/pupil. Derive speaking activity from the actual voiced phrase, and close the mouth through preserved quiet intervals instead of running an unrelated oscillator.

Caption display is a separate pass from approved narration fidelity: numerical words display as digits (this script: `45-year-old`), while narration text and timing remain unchanged. Keep the final image fully visible; the closing camera pullback supplies the ending without a picture fade. Sound needs audible practical and emotional emphasis as well as low environment beds. Check audible balance through whole-film user feedback; stem counts and signal levels alone do not establish listening quality.

Status: Tayama Identity Candidate 2 approved by the user on2026-11-18 ("yes it does thasts great"). The user subsequently accepted the full V8 film at8/10, ready to upload. Preserve this identity and the accepted V8 execution as the current baseline. Character approval/source hashes remain in `approved/character-approval.json` and `approved/ReferenceCast-Identity-Candidate-2.tsx.txt`; full-film acceptance is in `approved/v8-acceptance.json`.

## Reference authority

The three user-supplied images are preserved in `references/tayama-user/`:

- `01-manga-colour.png`: Yamada/Tayama hair contrast, Yamada's double black clips, Tayama's low tie, long front strands, exposed ear and hardware.
- `02-fullbody.png`: primary complete outfit for this short — open cropped black leather jacket, pale grey-blue fitted one-piece dress, black belt with gold buckle, dark sheer tights, pale ankle boots, black choker with small gold buckle.
- `03-hair-hardware.png`: selected jewellery authority — upper-ear gold cuff and two long straight hanging gold pieces at the lobe; also clarifies the low tie, fringe, long front strands and choker. This image shows a different top/jacket arrangement; do not combine its T-shirt neckline with the full-body dress to invent a hybrid outfit.

Rick's Clips supplies the cartoon construction: rounded irregular heads, simple eyes/brows/mouths, restrained ink limbs and flat 2D drawings. It does not replace the source character's identity. The existing 3D environment supplies spatial depth. Keep all production character views frontal.

## Tayama's recognition anchors

| Feature | Preserve | Failure to avoid |
|---|---|---|
| Hair | Muted burgundy/plum; low fringe over brows; long tapered front strands below the jaw toward the collar; short tied-back nape/fanned tail | Generic symmetrical bob; high fringe exposing all brows; circular side bun; enclosing hair hood |
| Exposed ear | Tucked-back hair allows the ear hardware to read | Both ears hidden by identical side panels |
| Hardware | Gold upper-ear cuff and two slender hanging gold bars from reference 03, visible beside the front lock | Two symmetrical silver dots; small loops substituted for the hanging bars; combining the industrial-bar/hoop variant from reference 01 with every piece in reference 03 |
| Jacket | Black/dark navy leather, open, cropped at the waist; notched lapels, a few snaps and zipper accents; visible sleeves | Long dark bean shape continuing behind the hips; a generic cardigan; bare stick arms with no jacket sleeve cue |
| Dress | One pale grey-blue fitted dress, cinched waist, modest hip contour and straighter narrow hem | A flared A-line skirt or separately invented shirt/skirt |
| Belt/choker | Black straps with readable gold rectangular buckles; choker visually separated from the chin outline | Tiny indistinct square dots; choker fused with the face outline |
| Legs/shoes | Dark brown-grey tights; compact pale ankle boots | Bare skin-coloured sticks, huge white blocks, crossed boot polygons |
| Face/attitude | Shared simple facial construction with Yamada; restrained half-lidded look/smirk and relaxed smoking-hand pose | New semi-realistic face style; cutting the fringe upward to expose expressive eyebrows |

Use the full-body image as the outfit authority and the closer images for construction details. Preserve the relationships between features, not merely their presence: ear exposure, fringe height, strand length, jacket hem versus belt, and fitted dress silhouette are central to recognition.

## Review method for future iterations

1. Read the short identity card above and inspect the relevant reference crop before editing. Reuse the shared face/body foundation; change the minimum identity-specific shapes.
2. Compare the actual production drawing directly with the character source and separately with the cartoon style reference. Passing a style comparison does not establish identity fidelity.
3. Inspect the silhouette without labels, then hair/ear/choker at close range, then the full outfit and a phone-size view. Check which defining feature disappears at small size.
4. Review the same drawing in the real 3D lighting. Avoid a separate polished approval illustration that the production cannot reproduce.
5. Fix material silhouette/configuration errors before tiny decorative lines. A checklist saying "fringe, jacket, piercings present" is insufficient.
6. After user approval, record the accepted asset/version, a source snapshot/hash and the invariants to preserve. Until then, record observed changes and open findings, not an approval or invented quality score.
7. Use targeted character-sheet/placement renders during design revision. Resume movement tests and full-film work only after the cast approval gate. Keep briefs as reference pointers plus a compact change list; exact model cost remains unknown unless measured.

## Current candidate implementation

`ReferenceCast.tsx` draws the sheet and 3D character cards through the same `drawCastArt` function. The identity revision changes the hair layering so the low fringe can naturally cover the brows, exposes one hardware-bearing ear, adds long front locks and a nape tie, replaces the flared skirt with a fitted single dress, crops the jacket correctly, and makes the two gold buckles distinct. Yamada retains the same underlying face and hair palette and gains the paired black hair clips visible in the supplied colour art.

Focused comparison corrected two additional drawing artifacts: a second crown contour looked like a headband, and an angular nape fan looked like spiky hair. Use one smooth crown outline, rounded fringe clumps and a compact tied bundle with short loose ends. An independent reference comparison also caught the earring variant mismatch; reference 03's long hanging bars now control jewellery rather than the smaller loops/industrial bar in reference 01. Record this as a deliberate reference selection, not proof that all source images show identical jewellery.

The original film export and approved narration remain preserved. The lead may now integrate the accepted design under the existing production authorisation; the narration, voice speed and pauses remain locked.

Versioned review snapshots for this pass: `proof/Tayama - Identity Candidate 2.png`, `proof/Character Cast - Identity Candidate 2.png`, and `proof/Character Cast - In World - Identity Candidate 2.png`. Use these exact images when discussing approval; unversioned render previews may change during later work.

## Integration rules after approval

- `ReferenceCast` owns the flat briefcase and Tayama cigarette. `World.StoryProps` disables their former 3D duplicates when `flatCastAccessories` is enabled, and retains the lighter, receipt, smoke and Sasaki cigarette.
- A lone world hand target must be assigned by its projected screen side. A front-facing card viewed from the opposite side of the world can reverse left/right projection; do not always route the only target into the left shoulder.
- Alternate walking phases by side index, not by adding `side * PI` for sides -1/+1 (those phases are identical).
- Lighting contact uses the actual approved flat cigarette length/angle, character scale, camera projection and 3D flame position. Changing any of these reopens that contact check.
- Performance may change tilt, head angle, crouch, stride and prop targets. Do not redesign the approved hair, clothing, hardware or face to solve a motion issue. Check the static approval image still reproduces exactly after integration changes.

## Emotional performance and close-up clarity — 2026-11-18

The first v4 reaction pass failed internally: moving toward a full-body listener did not make her emotional change legible. Arrive closer before the response, let the cigarette hand lower, briefly still the mouth, then give the introduction a small gesture toward herself and a modest smile. Preserve the approved simple facial language. Sasaki's defensive cigarette gesture settles into an explanation; the cigarette leaves his mouth so it does not conceal the speaking expression.

Identity Candidate 2 was freshly reproduced byte-for-byte during this revision: SHA256 `7D235635A1A314A198720F973CE20803603827E6260BFED362F9FE079440570F`. New mood/pose handling does not change the approved static drawing.

The original 608×672 card canvas becomes visibly soft in 2K face close-ups. Final rendering now draws the same paths at 2432×2688, preserving design and coordinates while improving edges, ear hardware, buckles and jacket marks. Small internal previews retain their economical card resolution. Check the actual final-resolution close-up rather than assuming a 2K video makes its source artwork sharp.

## Grounding and moving-camera lessons — V5

Phase alternation alone did not create a readable walk in V4. The character renderer ignored world-space feet, so shoes moved with the torso. Drive stance and swing from distance travelled, keep stance anchors fixed, draw soles at the projected world targets, and place each contact shadow on its actual supporting surface. Keep body weight transfer restrained. A numerical continuity check cannot replace inspecting the rendered walk.

A lateral route with frontal artwork produced crossed-leg silhouettes. Restaging the approach as a forward walk resolved that specific mismatch without adding side poses. Keep both feet inside the frame during the readable walking interval, and focus on the walker rather than the distant cashier. Recheck the actual 2K image: a small preview concealed the earlier soft focus and cropped foot.

Parallel frontal cards with projected foot targets need projection compensation and a plane in front of both feet. Otherwise, floor geometry can clip a foot even when its target is above the floor. Preserve body appearance while compensating the card plane, then revalidate hand/prop contact and the approved static identity render. For reveals, one connected camera curve may still reverse direction and feel dizzying; inspect travel direction, attention transfer and the settle separately.

## V6 staging and emphasis lessons

Actor-centre clearance is insufficient: check the actual compensated draw depth and conservative torso, hair, arms, legs, shoes and briefcase bounds against scenery throughout the route. Open the entrance before the first body/prop edge arrives. Leave a complete silhouette corridor beside the checkout, and keep the office torso behind the desktop. A service trolley that clears the torso can still intersect the case. These checks supplement rendered review rather than proving physical credibility by themselves.

An opened sliding-door handle can block a close-up even when the camera never crosses a wall. Move it outside the sight line and inspect the final framing. A lighter's flame must clear the hand silhouette; reproject the cigarette tip after changing flame height, and give the hand pair enough lateral separation from the nape hair. Tight inserts need the intended object visible, not merely a large generic head-width metric.

Hiding a cashier replacement behind a display did not establish a readable reveal. After the display continued to obscure the coworker, the sequence was restaged: hold Yamada's remembered smile, dissolve into a clear coworker face in the same framing, hold that discovery, then pan toward Sasaki's response. A short memory-to-present dissolve fits the approved preference for connected motion and avoids an unexplained character pop. The foreground sign remains environmental detail, not a mandatory trick.

Speech retiming produces fractional source frames. Interpolators must clamp beyond the final key of each section; otherwise, a half-frame before a scene boundary can jump back to the first segment. Test fractional endpoints and actual mapped frames. Preserve the accepted static appearance hash after performance and projection changes; the V6 fresh identity render still matches exactly.
