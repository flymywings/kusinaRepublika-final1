# The Two-Cent Ferrari Garage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete 27.6s (830 frames @ 30 fps) vertical animated short in Remotion + Three.js following the 2D-on-3D stickman style of Ricks Clips, matching the 20-video reference benchmark.

**Architecture:** A deterministic Remotion composition with `@remotion/three` driving a 3D scene (bank lobby, hydraulic vault, Manhattan exterior, and low-poly Ferrari) populated with procedural 2D canvas character cards (`toon.ts` rig) with custom GLSL card shading (`cardShade`), synchronized with `narration-1.1x.mp3` and single-word pop captions.

**Tech Stack:** React 19, Remotion 4.0, Three.js 0.187, `@react-three/fiber` 9.8, `@remotion/three`, Python (scipy/numpy for sound synthesis).

**Spec:** [`docs/superpowers/specs/2026-11-09-ferrari-parking-design.md`](file:///c:/Users/Win%2010/Downloads/new%20video%20edit/docs/superpowers/specs/2026-11-09-ferrari-parking-design.md)

## Global Constraints
- Target Duration: 830 frames @ 30 fps ($\approx 27.6$s).
- Resolution: 1080 x 1920 (9:16 vertical).
- Character Rig: Canvas 2D cards at $600 \times 1000$ unit coordinates, plum ink outlines (`#241726`), ground contact blobs (`fxContact`).
- Pacing & Reference Metrics: ~2.95 words/sec, ~2.8s median shot duration, symmetric 24-frame glides.
- Audio: Single voiceover (`narration-1.1x.mp3`) with procedural foley accents and single-word white pop captions with dark outline.
- Gate Check: Full production gated behind Hook Proof (frames 0–120) and Reveal Proof (frames 620–830).

## Review Focus
1. **Frame 0 Readability:** The \$1 bill and gold Ferrari keys must be clearly visible and legible on mobile screen at Frame 0 without waiting for narration.
2. **Prop Grounding:** Ferrari wheels and character boots must stay anchored to ground level with contact shadow blobs; zero floating or z-fighting.
3. **Lighting Consistency:** Transition smoothly from warm bank interior (ambient 0.8, sun 1.4) $\rightarrow$ cool industrial blue in vault $\rightarrow$ warm sunset exterior.
4. **Caption Timing & Settling:** Captions must pop in 1–2 frames before spoken word and hold until next word without clipping outside the 9:16 safe zone.
5. **Deterministic Frame Loop:** No `Math.random()` or wall-clock `Date.now()` without deterministic seeds; render must be frame-accurate.

---

### Task 1: Word Alignment & Captions Timeline Generator

**Files:**
- Create: `ferrari-parking/align_words.py`
- Create: `ferrari-parking/captions.ts`
- Input: `ferrari-parking/narration-1.1x.mp3`

**Interfaces:**
- Consumes: `narration-1.1x.mp3`
- Produces: `export const CAPTIONS: Array<{word: string, start: number, end: number}>` in `captions.ts`

- [ ] **Step 1: Write `align_words.py`** to extract word timestamps from audio or transcribe via Whisper/ffmpeg energy windows to map all 79 words to exact 30fps frames (0 to 804).
- [ ] **Step 2: Run alignment script**
  Run: `python ferrari-parking/align_words.py`
  Expected: Generates `ferrari-parking/captions.ts` with exact frame markers.
- [ ] **Step 3: Verify caption boundaries**
  Ensure first word "A" starts at frame 0–3, and final word "cents?" ends by frame 804.

---

### Task 2: 2D Cartoon Character Cards (`BillionaireActor`, `BankerActor`, `GuardActor`)

**Files:**
- Create: `ferrari-parking/FerrariActors.tsx`
- Consumes: `upstream/templates/bridge/toon.ts`, `upstream/templates/bridge/cardshade.ts`
- Produces: `export const BillionaireCard: React.FC<{frame: number}>`, `export const BankerCard: React.FC<{frame: number}>`, `export const GuardCard: React.FC<{frame: number}>`

- [ ] **Step 1: Implement `BillionaireCard`**
  - Adult build, dark tailored charcoal jacket (`#1e293b`), crisp white collar, dark sunglasses (`#0f172a`), slick black hair.
  - Action states:
    - *State 1 (Frames 0–120):* Hand extended sliding keys across desk.
    - *State 2 (Frames 360–510):* Tossing \$1 bill and dropping two copper pennies.
    - *State 3 (Frames 620–830):* Tilting head, deadpan smirk, lowering sunglasses.
- [ ] **Step 2: Implement `BankerCard`**
  - Stout/adult build, formal dark green vest (`#14532d`) with brass buttons, gold tie, round wire spectacles.
  - Action states:
    - *State 1 (Frames 0–120):* Reaching forward to accept keys with wide eyes.
    - *State 2 (Frames 510–620):* Eyebrows raised, scratching head, holding 2 pennies in palm.
- [ ] **Step 3: Implement `GuardCard`**
  - Navy blue security uniform (`#1e3a8a`), peaked security cap, stiff posture, standing guard by vault lift.
- [ ] **Step 4: Verify Card Rendering**
  Render a single test frame to canvas to confirm plum ink lines (`#241726`), superellipse head shape, and transparent alpha background.

---

### Task 3: 3D Sets & Props (`BankSet`, `VaultSet`, `FerrariModel`)

**Files:**
- Create: `ferrari-parking/BankSet.tsx`
- Create: `ferrari-parking/VaultSet.tsx`
- Create: `ferrari-parking/FerrariModel.tsx`
- Consumes: Three.js materials, `cardshade.ts`, `toon.ts`

- [ ] **Step 1: Implement `BankSet.tsx`**
  - Polished checkerboard or beige marble floor with subtle specular reflection.
  - 4 grand fluted columns, mahogany teller counter with brass wicket/partition, glass front doors showing city sunlight.
- [ ] **Step 2: Implement `VaultSet.tsx`**
  - Subterranean concrete & steel vault walls with riveted iron beams.
  - Hydraulic scissor elevator platform with black-and-yellow hazard stripes on perimeter.
  - Heavy circular vault door and steel shelves loaded with gold bullion bars.
- [ ] **Step 3: Implement `FerrariModel.tsx`**
  - Low-poly aerodynamic sports car: Rosso Corsa red lacquer body (`#dc2626`), tinted black curved windshield, wide rear spoiler, twin tail lights, five-spoke wheels with yellow center caps.
  - Contact shadow plane with soft radial blur blob underneath chassis.
  - Props: Golden key fob with horse emblem, crisp green \$1 bill, two shiny copper pennies.
- [ ] **Step 4: Verify 3D Model Coordinates**
  Ensure car sits precisely at $y=0$ (ground) without clipping, and scales proportionately to the character cards (~1.8m height comparison).

---

### Task 4: Camera & Lighting Direction Engine (`story.ts`)

**Files:**
- Create: `ferrari-parking/story.ts`
- Create: `ferrari-parking/Lighting.tsx`
- Consumes: `upstream/templates/bridge/story.ts` (glide functions)

- [ ] **Step 1: Define Camera Coordinates per Beat**
  - *Beat 1 (0–120):* Start close-up $[0.5, 1.1, 2.2] \rightarrow$ Glide outward to $[0, 1.8, 5.5]$ looking at $[0, 0.8, 0]$.
  - *Beat 2 (120–360):* Follow car moving onto elevator, camera cranes down alongside elevator shaft $[0, -2.5, 6.0]$ into vault.
  - *Beat 3 (360–510):* Cut back to teller counter, medium profile view $[1.2, 1.2, 3.0]$.
  - *Beat 4 (510–620):* Over-the-shoulder medium shot on Banker $[0.4, 1.3, 2.0]$.
  - *Beat 5 (620–830):* Close-up on Billionaire $[0, 1.3, 1.8]$, then quick whip/cut to wide street exterior $[0, 1.5, 7.0]$.
- [ ] **Step 2: Implement `Lighting.tsx`**
  - Directional Sun light with warm golden tone (`#fff7ed`, intensity 1.4) during Beats 1, 3, 4.
  - Shift to cool fluorescent industrial blue (`#38bdf8`, intensity 1.0) with ambient cool fill during Beat 2 (vault).
  - Shift to deep orange/golden sunset (`#fb923c`) during Beat 5 exterior.
- [ ] **Step 3: Verify camera glides**
  Verify smooth symmetric ease without jarring acceleration spikes.

---

### Task 5: Sound Effects & Mix Pipeline (`build_sound.py`)

**Files:**
- Create: `ferrari-parking/build_sound.py`
- Input: `ferrari-parking/narration-1.1x.mp3`
- Produces: `ferrari-parking/sfx.wav`, `ferrari-parking/mixed_audio.wav`

- [ ] **Step 1: Write `build_sound.py`** to synthesize exact foley cues:
  - *Frame 0:* Key fob slide & soft metallic clink.
  - *Frame 135:* Car engine purr & tire chirp onto metal.
  - *Frame 220:* Heavy hydraulic lift groan & metallic latch clamp.
  - *Frame 380:* Crisp penny drop (`clink-clink`) on mahogany counter.
  - *Frame 720:* Supercar acceleration roar into distance.
- [ ] **Step 2: Run sound generator**
  Run: `python ferrari-parking/build_sound.py`
  Expected: Generates mixed audio track with ducked voiceover and balanced SFX stems.

---

### Task 6: Hook Proof (Frames 0–120 Gate)

**Files:**
- Create: `ferrari-parking/HookProof.tsx`
- Create: `ferrari-parking/Root.tsx`

- [ ] **Step 1: Assemble Hook Composition** (Frames 0–120 @ 30 fps, 4.0s).
- [ ] **Step 2: Render Hook Proof Video**
  Run: `npx remotion render ferrari-parking/Root.tsx HookProof ferrari-parking/hook-proof.mp4`
- [ ] **Step 3: Inspect Hook Proof**
  Verify: Frame 0 displays keys, \$1 bill, and car; voice starts immediately; camera glides smoothly.

---

### Task 7: Full Video Assembly & Reveal Proof (Frames 0–830)

**Files:**
- Create: `ferrari-parking/FerrariParkingVideo.tsx`
- Update: `ferrari-parking/Root.tsx`

- [ ] **Step 1: Assemble all 5 beats** in `FerrariParkingVideo.tsx` with `<ThreeCanvas>`, `<WordCaptions>`, `<Lighting>`, and synchronized audio.
- [ ] **Step 2: Render Reveal Proof (Frames 620–830)**
  Verify comedic timing of the punchline, banker reaction, and car drive-off.
- [ ] **Step 3: Render Full 1080x1920 MP4 Video**
  Run: `npx remotion render ferrari-parking/Root.tsx FerrariParking ferrari-parking/ferrari-parking-final.mp4`
- [ ] **Step 4: Final Quality Check**
  Verify dimensions ($1080 \times 1920$), 30 fps, audio sync, single-word captions, zero pop-ins or z-fighting.
