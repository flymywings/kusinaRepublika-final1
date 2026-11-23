# What we learned from Ricks Clips, ItsTimeForTACOS and Mr Miro

Sources: `reference-study/` (20 Ricks Clips Shorts, measured), `script-formula.md` and the three audit notes (TACOS and the diamond V2 comparison), and the 15 MiroMotions transcripts in `.t3/scratch/2026-11-23-https-www-youtube-com-miromotions-2f5c9f4b/transcripts/`. Summaries are in my own words. Miro's numbers come from small samples he chose himself, so treat them as patterns to test, not laws.

Nothing in SCENE-CARDS.md, the hook or the narration has been changed. Section 5 lists the proposed changes for you to approve.

## 1. Ricks Clips: the format
- A title that is a few words and opens a question ("How a Mirror Rigged a Horse Race"). Topic is a real thing with a hidden reason.
- Simple characters, always the same, readable in half a second. The same calm narrator every time.
- Detailed worlds around simple characters. A twist ending that reuses an earlier action or object.
- Measured: contrast 95-145, brightness 79-154, saturation 20-28 (muted), motion 33-70 %, hard cuts rare.
- His own growth: first Short was flat and simple, the 29th had a full 3D world. Our benchmark is his recent work, not his first.

## 2. TACOS: story structure and acting
- Hook is a concrete contradiction with stakes. A specific question stays open.
- Order: hook, setting, escalation (2-3 linked actions), clue or reversal, mechanism, short payoff or callback. Stop at the payoff.
- Each beat answers, complicates or transforms the viewer's question.
- Acting: want, then visible test, then the other person's response. Never start action and reaction on the same frame. Do not hold a finished pose.
- Warm opening, cooler light at the reveal. The big close-up has to earn its place.
- Check: can a muted viewer name the character's want and risk?

## 3. Mr Miro: how to work and what wins
Process:
1. **Measure, don't opine.** Have the tools measure the reference channel (moves per minute, shot length, caption height, contrast), then build to those numbers. We already do this.
2. **Mistakes become rules.** Every flaw gets written into the rules file once, so it never comes back.
3. **Plan, then look-dev stills, then render.** Stop after each step so a fix is cheap.
4. **Cuts and moves land on words, not timestamps.** If the voice changes, the edit follows.
5. **Never blend audio between clips.** Mix the master to -14 LUFS. Put sound effects on the exact words.
6. **Token budget:** don't read whole folders, test small (about 40 % size), don't re-render frames that didn't change.

What wins (his data, 25 videos):
- **Premise decides, editing doesn't.** Winners and losers had the same cut rate (about 11/min) and shot length (about 3 s). The most-viewed one had the fewest cuts.
- **Gives the viewer something they'd want today.** "Redo your past" premises lost every time.
- **A noun people compare themselves on** (wealth, IQ, looks, time left) beats an abstract one.
- **Open on the thing already happening, ask the question later.** Opening on the title question in second one lost. Only 1 of 15 hits asked it in the first 5 s.
- **End by handing the question back to the viewer.**
- **Same idea is fine, same video is invisible.** Choose your own world, voice and angle. Mute test: hide the name; would someone still know it's yours?
- **A world can be a series.** One channel won with one world (surviving a zombie outbreak in different places) and made part 2 and part 3.
- A new channel's low numbers don't prove the idea was bad.

## 4. Where all three agree
| Lesson | Ricks | TACOS | Miro | Our status |
|---|---|---|---|---|
| Open on action already underway, question later | yes | yes | yes | Hook B does this |
| Premise or hidden reason carries the Short | yes | yes | yes | Mirror: he reads her face the way everyone reads his |
| Repeatable simple cast, one voice, own world | yes | yes | yes | Cast B, Johnny Kid, the cafe |
| Measure references, build to numbers | yes | - | yes | `measure.py`, in range |
| Twist reuses an earlier object or action | yes | yes | - | Fork tick becomes her heartbeat |
| Editing speed is not the point | - | yes | yes | Shots 1.5-2 s, no extra cuts |
| Own look, not a copy | - | - | yes | Muted 3D cafe, ink and lens look |

## 5. Proposed changes
User, 2026-11-23: "do 1, 2, 3, 4, not 5 rn". Items 1-4 are now in SCENE-CARDS.md (card 5, card 7, proof targets). Item 2 is done in picture only, with no new narration. The -14 LUFS gate was already there. Item 5 is parked.

1. **Risk check on the rewind.** Miro's data says "redo your past" premises lost. Our rewind to frame 0 is a reading device (he re-sees her face), not a do-over. Proposed: in the cards, make the rewind show what he *now understands*, not what he could change. Cards 5-6 only, hook untouched.
2. **Ending hands the question back.** Proposed: the last line or image leaves one question for the viewer (for example "what do you do when you see a face and decide?"). Needs a narration check with you, since the audio is locked.
3. **Title test.** Write 3 title options with a concrete noun and "you" before cards 2-7 are built (for example "Why She Looked Scared of Him"). The title is free to change and decides more than the edit.
4. **Loudness.** Master to -14 LUFS, sound accents on the word frames. Add it as a gate in the proof targets.
5. **Mute test gate.** Add: a muted, name-hidden still of the hook is recognisably ours.
6. **Series option.** The cafe and cast B can host more Shorts. Pick the next two stories to fit this world so each new Short reuses the kit.
7. **Cost rules from Miro:** test at 40 % size, re-render only changed frames, and never read whole folders. Fold these into `PRODUCTION-PLAYBOOK.md` if you want it.

## 6. Still open from before
Rate hook-B-r3, decide on the final patch (second coin, startle, orange table), listen to narration v3, and the cold-viewer hook test.
