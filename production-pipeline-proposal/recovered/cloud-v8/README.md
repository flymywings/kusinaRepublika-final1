# Fragrant Flower V8 cast

Rintaro and Kaoruko's approved school-uniform character designs, 21 November 2026.

The exact image is at `fragrant-flower/proof/Fragrant_Flower_Character_Sheet_v8.png`.
The approval record contains the SHA-256 hashes for the image and frozen drawing source.
`fragrant-flower/CharacterArt.tsx` is an exact, runnable copy of that source.
The two official character images are included as drawing references for the cast sheet.

To render the sheet, extract the ZIP and run these commands from its root.

```sh
npm ci
node fragrant-flower/render-sheet.mjs
```

The renderer uses Remotion's default browser when there is no configured Chrome path.
Set `CHROME_PATH` to a compatible Chrome executable if needed.
The render command writes to the same PNG path as the included approved image.
Run it in a separate extracted copy if you want to preserve those original PNG bytes.
