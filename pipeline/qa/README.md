# QA tools

Node 24, ffmpeg and ffprobe. All three refuse to overwrite an existing output.

```
node pipeline/qa/sheet.mjs <video> --out <file.jpg> [--fps 1] [--from s] [--to s] [--cols 10]
node pipeline/qa/media.mjs <video> --out <qa.json> [--width 1440 --height 2560 --fps 30 --frames N --lufs -15 --peak -1.5] [--allow-quiet a-b] [--allow-freeze a-b]
node pipeline/qa/compare.mjs --spec <json> --out <mp4>
```

`media.mjs` fails without `--frames`. It checks decode, size, fps, frames, duration, loudness, peak, black, frozen and quiet spans.
A pass says nothing about acting, pacing or the mix. Those need a human watch with sound.

In `compare.mjs`, the baseline is the left panel and the candidate the right. Paths are relative to the spec.

Started by GPT-6.2 Sol and finished by Opus on 2026-11-22. Opus owns this folder from that point.
