"""Voice-led score and timed Foley, using the cartoon kit's local synth voices."""
import ast
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

root = Path(__file__).parent.resolve()
rate = 48000
duration = 888 / 30
count = round(rate * duration)
rng = np.random.default_rng(1872)
kit = root.parent / 'cartoon-short-kit/cartoon-short-kit/example/soldier/audio.py'
tree = ast.parse(kit.read_text(encoding='utf-8'))
synth = {'np': np, 'SR': rate, 'N': count, 'DUR': duration, 'rng': rng}
definitions = ast.Module(body=[node for node in tree.body if isinstance(node, ast.FunctionDef)], type_ignores=[])
exec(compile(definitions, str(kit), 'exec'), synth)

pcm = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(root / 'narration-darian-1.07x.mp3'), '-ar', str(rate), '-ac', '1', '-f', 'f32le', '-'])
source = np.frombuffer(pcm, np.float32)
voice = np.zeros(count, dtype=np.float32)
voice[:min(len(source), count)] = source[:count]
music = np.zeros(count, dtype=np.float32)
effects = np.zeros((count, 2), dtype=np.float32)
cues = []
clock = np.arange(count) / rate


def put(destination, signal, at, gain=1):
    start = round(at * rate)
    end = min(count, start + len(signal))
    if 0 <= start < end:
        destination[start:end] += signal[:end - start] * gain


def effect(frame, label, signal, gain, pan=0):
    unit = signal / max(1e-8, np.max(np.abs(signal)))
    stereo = np.stack([unit * np.sqrt((1 - pan) / 2), unit * np.sqrt((1 + pan) / 2)], axis=1)
    put(effects, stereo, frame / 30, gain * np.max(np.abs(voice)))
    cues.append({'frame': frame, 'cue': label})


pluck, thunk, ting, scrape, whoosh, snap = [synth[key] for key in ('pluck', 'thunk', 'ting', 'scrape', 'whoosh', 'snap')]
note = lambda semitone: 440 * 2 ** ((semitone - 69) / 12)
progression = [(48, 64, 67, 72), (50, 65, 69, 74), (45, 60, 64, 69), (43, 62, 65, 71)]
beat = 60 / 116
for i in range(57):
    at = i * beat
    chord = progression[(i // 4) % len(progression)]
    put(music, pluck(note(chord[0]), .43, .26), at, .64 if i % 2 == 0 else .39)
    if not 17.8 < at < 23.8:
        put(music, pluck(note(chord[1 + i % 3]), .28, .48), at + .20, .30)
        if 10.8 < at < 16.6:
            put(music, pluck(note(chord[1 + (i + 1) % 3]), .18, .41), at + .36, .14)

coin = ting()[:round(rate * .22)] * np.linspace(1, 0, round(rate * .22))


def guard_call(pitch, seconds):
    """Brief wordless vocal texture, placed behind Darian and the footsteps."""
    t = np.arange(round(rate * seconds)) / rate
    u = t / seconds
    frequency = pitch * (1 + .13 * np.sin(np.pi * u) - .22 * u)
    phase = np.cumsum(frequency) * (2 * np.pi / rate)
    vowel = np.zeros_like(t)
    for harmonic in range(1, 14):
        band = harmonic * pitch
        strength = np.exp(-((band - 740) / 310) ** 2) + .38 * np.exp(-((band - 1330) / 350) ** 2) + .2
        vowel += np.sin(harmonic * phase) * (strength / harmonic ** .83)
    envelope = np.minimum(1, u / .14) * np.minimum(1, (1 - u) / .31) ** 1.7
    return (vowel * envelope + rng.standard_normal(len(t)) * envelope * .034).astype(np.float32)


effect(24, 'Gold pouch lands', thunk(170, .17), .22, -.24)
effect(25, 'Gold inside pouch', coin, .17, -.25)
effect(44, 'Tap on paper', thunk(365, .09), .12, .1)
effect(130, 'Tax coin changes hands', scrape(.12), .07, -.25)
effect(143, 'Tax coin drops in marked pouch', coin, .19, -.23)
effect(168, 'Mayor takes the pouch', scrape(.17), .105, -.15)
effect(239, 'Bird arrives at statue', whoosh(.18), .10, .22)
effect(253, 'First peck', thunk(615, .075), .22, .22)
effect(311, 'Mayor adds coins', coin, .20, -.14)
effect(316, 'Second coin settles', coin, .11, -.12)
for start, end, gain, offset in [(363, 450, .15, 0), (366, 454, .10, -.12)]:
    for frame in range(start, end, 5):
        distance = np.interp(frame, [363, 386, 417, 449], [.80, 1, .81, .17])
        pan = -.27 + .58 * (frame - 363) / 90 + offset
        effect(frame, 'Guard foot contacts cobbles', thunk(116 + 17 * (frame % 3), .13), gain * distance, pan)
for frame in (357, 387, 414, 479, 492, 507):
    effect(frame, 'Wing beat', whoosh(.14), .084, .16)
effect(411, 'Guard calls down the market street', guard_call(157, .28), .17, .28)
effect(423, 'Second guard calls offscreen', guard_call(183, .23), .14, .39)
effect(433, 'Witness steps on shop tiles', thunk(244, .11), .085, -.08)
effect(448, 'Witness stops at the doorway', thunk(218, .12), .095, -.08)
effect(517, 'Bird lands on statue', thunk(470, .085), .12, .17)
effect(532, 'Painted wood cracks', snap()[:round(rate * .20)], .30, .12)
effect(557, 'Chip lands on cobbles', thunk(380, .14), .20, .21)
effect(562, 'Small chip bounce', thunk(470, .085), .08, .21)
effect(603, 'Carpenter turns chip', scrape(.17), .075, .17)
effect(821, 'Gold returned', coin, .14, .1)
effect(833, 'Chain on stone', coin + np.pad(thunk(370, .10), (0, len(coin) - round(rate * .10))) * .2, .16, -.2)
effect(867, 'Bird in the nest', pluck(note(76), .23, .54), .09, .02)

noise = synth['lp_fast'](rng.normal(0, 1, count).astype(np.float32), 740)
air = noise * .0045 * (.8 + .2 * np.sin(clock * .9))
effects += np.stack([air, np.roll(air, 123) * .94], axis=1)
active = voice[np.abs(voice) > .012]
voice_rms = np.sqrt(np.mean(active ** 2))
music *= voice_rms * .25 / max(1e-8, np.sqrt(np.mean(music ** 2)))
block = 480
level = np.sqrt(np.mean(voice.reshape(-1, block) ** 2, axis=1))
duck = 1 - .38 * np.minimum(1, level / (voice_rms * .52))
music *= np.interp(np.arange(count), np.arange(len(duck)) * block, duck)
music *= np.interp(clock, [0, 17.6, 18.0, 20.0, 20.55, 22.15, 25.4, 26.2, 29.3, duration], [1, 1, .56, .55, .22, .29, .49, .80, .72, 0])
mix = np.stack([voice + music * .97, voice + music], axis=1) + effects
mix *= np.minimum(1, (duration - clock) / .035)[:, None]
mix *= min(1, .91 / np.max(np.abs(mix)))

with wave.open(str(root / 'proof/mix-raw.wav'), 'wb') as output:
    output.setnchannels(2)
    output.setsampwidth(2)
    output.setframerate(rate)
    output.writeframes((mix * 32767).astype('<i2').tobytes())

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(root / 'proof/mix-raw.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=5', '-ar', str(rate), str(root / 'proof/mix.wav')], check=True)
(root / 'proof/sound-cues.json').write_text(json.dumps(sorted(cues, key=lambda cue: cue['frame']), indent=2), encoding='utf-8')
print(f'{len(cues)} timed cues, {duration:.2f}s stereo. Voice timing preserved.')
