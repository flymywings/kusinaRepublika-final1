"""Synthesize the final coastal effects with the bridge sound tools."""
from pathlib import Path
import sys

import numpy as np

folder = Path(__file__).resolve().parent
sys.path.insert(0, str(folder.parent / "upstream" / "templates" / "audio"))
from dsp import bp, lp, ns, pan, place, rng, tt, write_wav
import sfx_gen as sfx

random = rng(218)
duration = 25.2
effects = np.zeros((2, ns(duration)))
time = tt(duration)
submerged = np.interp(time, [0, 5.45, 5.95, 12.85, 13.8, duration], [0, 0, 1, 1, 0, 0])
surf = sfx.water_bed(duration, random, close=.45)
surf_duck = np.ones_like(time)
for frame in (241, 440, 475, 527, 593):
    surf_duck -= .20 * np.exp(-((time - frame / 30) / .18) ** 2)
effects += .15 * (surf * (1 - submerged) + lp(surf, 410) * submerged * .68) * surf_duck


def cue(frame, signal, peak, stereo=0):
    signal = signal / max(float(np.max(np.abs(signal))), 1e-8)
    place(effects, pan(signal, stereo), frame / 30, peak)


cue(24, sfx.creak(.38, random, 45, 80, noise=.07), .22, .15)
cue(161, sfx.whoosh(.72, random, peak=.21, f_lo=170, f_hi=540, air=.02), .17)
cue(241, bp(sfx.wood_crack(random), 78, 440), .59)
cue(337, sfx.whoosh(3.1, random, peak=1.28, f_lo=170, f_hi=690, air=.03), .29, .15)
cue(440, bp(sfx.wood_crack(random), 135, 1350)[:ns(.22)], .38, .26)
cue(475, sfx.creak(.22, random, 56, 40, noise=.14), .27, -.26)

for start, count, step, gain, stereo in [
    (527, 9, 12, .21, -.28),
    (560, 9, 11, .18, -.36),
    (593, 14, 12, .31, -.08),
]:
    for index in range(count):
        scuff = bp(sfx.stroll_step(random, scuff=1.2), 120, 2200)
        cue(start + index * step, scuff, gain * (1 - .36 * index / count), stereo)

write_wav(str(folder / "shore-v7-effects.wav"), effects)
