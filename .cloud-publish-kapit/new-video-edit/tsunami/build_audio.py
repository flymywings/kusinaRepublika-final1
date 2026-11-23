"""Build tsunami cues with the upstream bridge synthesizers."""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "upstream" / "templates" / "audio"))
import numpy as np
import music
import sfx_gen as sfx
from dsp import ns, rng, place, pan, write_wav

music.N = ns(26)
band = music.Band()
for start in (0, 18):
    music.melody(band, "fife", music.theme(start, bars=range(1, 5)), .32, fn="fife")
    music.oompah(band, start, music.CHB[1], vel=.28)
score, _ = music.render(band, ref=-25)
write_wav(str(root / "public" / "tsunami-score.wav"), score)
fx = np.zeros((2, music.N))
r = rng(72)
place(fx, sfx.water_bed(26, r, close=.55), 0, .14)
place(fx, sfx.whoosh(3.2, r, f_lo=65, f_hi=430), 8, .40)
place(fx, sfx.whoosh(3.5, r, f_lo=210, f_hi=920), 13.8, .24)
for index in range(12):
    place(fx, pan(sfx.stroll_step(r), -.12), 19.2 + .49 * index, .20)
write_wav(str(root / "public" / "tsunami-effects.wav"), fx)
