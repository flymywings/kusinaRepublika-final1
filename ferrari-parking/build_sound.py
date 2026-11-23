import sys
from pathlib import Path

folder = Path(__file__).resolve().parent
sys.path.insert(0, str(folder.parent / ".audio-deps"))

import numpy as np
from scipy.io import wavfile

SR = 44100
duration = 27.6  # 830 frames @ 30 fps
n_samples = int(SR * duration)
audio = np.zeros((n_samples, 2), dtype=np.float32)

def place_cue(frame, signal_left, signal_right, gain=1.0):
    start_sample = int((frame / 30.0) * SR)
    sig_len = len(signal_left)
    end_sample = min(n_samples, start_sample + sig_len)
    actual_len = end_sample - start_sample
    if actual_len > 0:
        audio[start_sample:end_sample, 0] += signal_left[:actual_len] * gain
        audio[start_sample:end_sample, 1] += signal_right[:actual_len] * gain

# 1. Subtle Bank Room Tone / Air Ambience
np.random.seed(42)
room_noise = np.random.normal(0, 0.008, n_samples)
# Smooth rolling average for low air rumble
kernel = np.ones(50) / 50.0
room_bed = np.convolve(room_noise, kernel, mode='same')
audio[:, 0] += room_bed
audio[:, 1] += room_bed

# 2. Frame 10: Key Fob Slide & Brass Clink (t = 0.33s)
clink_len = int(SR * 0.25)
t_c = np.linspace(0, 0.25, clink_len, endpoint=False)
# High resonant metallic harmonics: 2800Hz, 4200Hz, 5600Hz
key_clink = (np.sin(2 * np.pi * 2800 * t_c) * 0.6 +
             np.sin(2 * np.pi * 4200 * t_c) * 0.3 +
             np.sin(2 * np.pi * 5600 * t_c) * 0.2) * np.exp(-t_c * 35)
place_cue(10, key_clink * 0.9, key_clink * 0.7, gain=0.45)

# 3. Frame 155: Car Engine Soft Purr (t = 5.16s)
eng_len = int(SR * 1.8)
t_e = np.linspace(0, 1.8, eng_len, endpoint=False)
v8_rumble = (np.sin(2 * np.pi * 48 * t_e) +
             0.5 * np.sin(2 * np.pi * 96 * t_e) +
             0.25 * np.random.normal(0, 1, eng_len)) * np.exp(-t_e * 1.5)
place_cue(155, v8_rumble * 0.6, v8_rumble * 0.9, gain=0.35)

# 4. Frame 195: Heavy Hydraulic Vault Elevator Hum & Whirr (t = 6.5s)
lift_len = int(SR * 4.5)
t_l = np.linspace(0, 4.5, lift_len, endpoint=False)
hydraulic = (np.sin(2 * np.pi * 60 * t_l) * 0.5 +
             np.sin(2 * np.pi * 120 * t_l) * 0.3 +
             np.sin(2 * np.pi * 320 * t_l) * 0.15) * (1 - np.exp(-t_l * 4)) * np.exp(-np.maximum(0, t_l - 3.8) * 6)
place_cue(195, hydraulic, hydraulic, gain=0.38)

# 5. Frame 360: Vault Gate Locking Heavy Metallic Thud (t = 12.0s)
thud_len = int(SR * 0.5)
t_t = np.linspace(0, 0.5, thud_len, endpoint=False)
gate_thud = (np.sin(2 * np.pi * 75 * t_t) * 0.8 +
             np.sin(2 * np.pi * 880 * t_t) * 0.3) * np.exp(-t_t * 16)
place_cue(360, gate_thud * 0.8, gate_thud * 0.95, gain=0.5)

# 6. Frames 475 & 498: Two crisp copper pennies dropping on counter (t = 15.8s, 16.6s)
p_len = int(SR * 0.3)
t_p = np.linspace(0, 0.3, p_len, endpoint=False)
penny1 = (np.sin(2 * np.pi * 3850 * t_p) * 0.7 + np.sin(2 * np.pi * 5900 * t_p) * 0.3) * np.exp(-t_p * 22)
penny2 = (np.sin(2 * np.pi * 4200 * t_p) * 0.7 + np.sin(2 * np.pi * 6300 * t_p) * 0.3) * np.exp(-t_p * 25)
place_cue(475, penny1 * 0.85, penny1, gain=0.45)
place_cue(498, penny2 * 0.85, penny2, gain=0.42)

# 7. Frame 705: Ferrari Roaring Down Avenue into distance (t = 23.5s)
roar_len = int(SR * 3.8)
t_r = np.linspace(0, 3.8, roar_len, endpoint=False)
pitch_sweep = np.linspace(70, 240, roar_len)
exhaust = (np.sin(2 * np.pi * pitch_sweep * t_r) * 0.6 +
           np.sin(4 * np.pi * pitch_sweep * t_r) * 0.3 +
           np.random.normal(0, 0.2, roar_len)) * np.exp(-t_r * 0.5)
place_cue(705, exhaust * 0.9, exhaust, gain=0.55)

# Normalize and convert to 16-bit PCM
peak = np.max(np.abs(audio))
if peak > 0.95:
    audio = (audio / peak) * 0.95
audio_int16 = (audio * 32767).astype(np.int16)

out_file = str(folder / "sfx.wav")
wavfile.write(out_file, SR, audio_int16)
print(f"Generated clean sfx: {out_file} (duration: {duration}s)")
