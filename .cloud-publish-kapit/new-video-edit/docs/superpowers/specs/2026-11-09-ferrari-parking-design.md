# Design Specification: The Two-Cent Ferrari Garage

**Date:** 2026-11-09  
**Story Premise:** A billionaire borrows one dollar using his Ferrari as collateral to get two weeks of ultra-secure Manhattan parking for two cents.  
**Runtime:** 26.80s audio duration | 830 frames @ 30 fps (includes 26-frame ending settle)  
**Aspect Ratio:** 9:16 Vertical (1080x1920 or 1440x2560)  

---

## 1. Intent, Goals & Constraints

### Why
Deliver an original, high-retention short adhering to the Ricks Clips stickman aesthetic and the approved 6-beat narrative formula. The hook must hit within the first 2 seconds, and the comedic reversal must land with visual clarity.

### Goals
- **Immediate Hook (0–2s):** Frame 0 begins with an action already underway (sliding keys and a \$1 bill), establishing the contradiction before second 2.
- **Classic 2.5D Style:** Flat 2D vector cartoon cards (`toon.ts` rig) staged in low-poly 3D Three.js environments with custom directional lighting and plum ink outlines (`#241726`).
- **Deterministic Remotion Pipeline:** All camera moves, character states, and lighting transitions are deterministic functions of `useCurrentFrame()`.
- **Audio & Captions:** High-contrast, single-word white text at fixed lower-third with dark stroke and subtle pop animation, synced to `narration-1.1x.mp3`.

### Non-Goals & Anti-Goals
- **No Complex Hyper-Realistic Physics:** Car movement and elevator mechanisms should use stylized procedural ease curves (`glide`, `smoothstep`), not heavy physics simulation.
- **No Visual Clutter:** Keep 3D environments readable at mobile phone scale; avoid excessive background geometry that competes with focal props.
- **Anti-Goal:** Prematurely revealing the parking motive before the ending line.

---

## 2. Technical Architecture & Component Tree

```text
<Composition id="FerrariParking" width={1080} height={1920} fps={30} durationInFrames={830}>
  ├── <Audio src="narration-1.1x.mp3" />
  ├── <ThreeCanvas>
  │     ├── <CameraRig frame={frame} />
  │     ├── <LightingRig frame={frame} />
  │     ├── <BankSet /> (Lobby pillars, teller marble desk, glass doors)
  │     ├── <VaultSet /> (Subterranean steel door, hydraulic lift, gold stacks)
  │     ├── <FerrariModel frame={frame} /> (Stylized low-poly red sports car)
  │     ├── <Characters>
  │     │     ├── <BillionaireActor frame={frame} /> (Sunglasses, tailored jacket)
  │     │     ├── <BankerActor frame={frame} /> (Spectacles, suit, bewildered expressions)
  │     │     └── <GuardActors frame={frame} /> (Uniformed bank guards)
  │     └── <FxContactShadows />
  ├── <WordCaptions frame={frame} /> (Single-word pop captions)
  └── <SoundEffects frame={frame} /> (Key slide, elevator clank, penny clink)
```

---

## 3. Shot List & Beat Timing (830 Frames @ 30 fps)

| Beat | Audio Cue | Target Frames | Framing & Camera | Action & Props | Lighting & Palette |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Beat 1: The Hook** | *"A billionaire borrowed ONE dollar... and handed the bank the keys to his Ferrari."* | `0 – 120` (0.0s – 4.0s) | Close-up table height, 3/4 angle. Glides 24 frames outward to wide lobby view. | **Frame 0:** Billionaire's hand slides gold Ferrari key fob + \$1 bill across marble desk. Wide view reveals red Ferrari parked inside the gleaming lobby. | Warm morning sunlight through bank windows; golden floor speculars. |
| **Beat 2: The Vault Escort** | *"He walked into a Manhattan bank, requested a one-dollar loan, and watched guards drive his half-million-dollar supercar into their underground vault."* | `120 – 360` (4.0s – 12.0s) | Track-down shot along elevator shaft into underground vault. | Two bank guards salute; one carefully drives Ferrari onto yellow-striped hydraulic lift. Heavy security gate descends with mechanical lock. | Warm lobby transitions to deep industrial steel blue with yellow safety accents. |
| **Beat 3: The Return & Interest** | *"Two weeks later, he returned, paid back the dollar, and gave the teller two cents in interest."* | `360 – 510` (12.0s – 17.0s) | Reframe to teller counter. Quick 6-frame motion-blur card: *"2 WEEKS LATER"*. | Billionaire steps back up to counter, tosses \$1 bill + drops two shiny copper pennies onto wood counter (`clink-clink`). | Return to warm bank interior lighting. |
| **Beat 4: The Banker's Question** | *"The banker asked why a wealthy man needed a one-dollar loan."* | `510 – 620` (17.0s – 20.7s) | Medium close-up on Banker over Billionaire's shoulder. | Banker pushes spectacles up nose with finger, eyebrows furrowed in deadpan confusion. Holding the two pennies. | Soft interior rim light on banker. |
| **Beat 5: The Payoff & Escape** | *"The billionaire smiled: where else in Manhattan... can you park a Ferrari for two weeks... for two cents?"* | `620 – 830` (20.7s – 27.6s) | Tight push-in on Billionaire's smirk, then hard cut to Manhattan street exterior. | Billionaire lowers sunglasses, smiles. Exterior shot: Ferrari speeds past skyscrapers into distance; banker stands on sidewalk holding two pennies. | Sunset golden hour on Manhattan buildings; car tail lights flare. |

---

## 4. Hook and Reveal Proof Gates
Per production rules, full video assembly is gated behind two low-cost motion proofs:
1. **Proof 1 (The Hook, Frames 0–120):** Must verify Frame 0 readability of the keys, the \$1 bill, and the red Ferrari in the lobby with sound.
2. **Proof 2 (The Reveal / Payoff, Frames 620–830):** Must verify the Billionaire's smirk, the street transition, and the sound tail.
