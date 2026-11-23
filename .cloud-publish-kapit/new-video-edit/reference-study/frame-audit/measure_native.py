import json
import os
import subprocess as sp
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
SOURCES = json.loads((ROOT / "script-analysis/index.json").read_text(encoding="utf-8"))[:20]
W, H = 96, 170
LUMA = np.array([.2126, .7152, .0722], dtype=np.float32)
FONT = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 12)

def read(source):
    path = source["file"]
    info = sp.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "frame=best_effort_timestamp_time", "-of", "csv=p=0", path], text=True)
    times = np.array([float(line.split(",")[0]) for line in info.splitlines() if line and line.split(",")[0] != "N/A"])
    data = sp.check_output(["ffmpeg", "-v", "error", "-nostdin", "-threads", "2", "-filter_threads", "1",
        "-i", path, "-map", "0:v:0", "-vf", f"scale={W}:{H}:flags=area,format=rgb24",
        "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"])
    frames = np.frombuffer(data, np.uint8).reshape(-1,H,W,3)
    assert len(times) == len(frames), (path, len(times), len(frames))
    return times-times[0], frames

def sheet(frames, times, indexes, path, cols=12, w=82, label=None):
    h = round(w * H / W)
    block = h + 23
    canvas = Image.new("RGB", (cols * (w+4), ((len(indexes)+cols-1)//cols)*block), "#17191e")
    draw = ImageDraw.Draw(canvas)
    for i, n in enumerate(indexes):
        x,y = i%cols*(w+4), i//cols*block
        canvas.paste(Image.fromarray(frames[n]).resize((w,h), Image.Resampling.LANCZOS), (x,y))
        draw.text((x+3,y+h+2), label(n) if label else f"{times[n]:05.2f}", font=FONT, fill="white")
    canvas.save(path, quality=88, optimize=True)

def features(frames):
    luma = []
    contrast = []
    color = []
    sat = []
    warmth = []
    tiny = []
    quant = []
    for chunk in np.array_split(frames, max(1,len(frames)//48)):
        y = chunk.astype(np.float32) @ LUMA
        luma.extend(y.mean(axis=(1,2)))
        bounds = np.quantile(y.reshape(len(y),-1), [.1,.9], axis=1)
        contrast.extend(bounds[1]-bounds[0])
        color.extend(chunk.mean(axis=(1,2)))
        maxrgb = chunk.max(axis=3).astype(np.float32)
        minrgb = chunk.min(axis=3)
        sat.extend(((maxrgb-minrgb)/np.maximum(maxrgb,1)).mean(axis=(1,2))*100)
        warmth.extend((chunk[...,0].astype(np.float32)-chunk[...,2]).mean(axis=(1,2)))
        tiny.extend(np.array([np.asarray(Image.fromarray(frame).resize((16,28), Image.Resampling.BOX)) for frame in chunk]))
        reduced = (chunk[:,:, :,0]//32)*64 + (chunk[:,:,:,1]//32)*8 + chunk[:,:,:,2]//32
        # Encode with uint16 to retain all 512 RGB bins.
        reduced = (chunk[...,0].astype(np.uint16)//32)*64 + (chunk[...,1]//32)*8 + chunk[...,2]//32
        quant.extend(np.stack([np.bincount(row.ravel(), minlength=512) for row in reduced]))
    return dict(luma=np.array(luma), contrast=np.array(contrast), color=np.array(color), sat=np.array(sat),
                warmth=np.array(warmth), tiny=np.array(tiny), quant=np.array(quant,dtype=np.uint16))

def first_pass(source):
    ident=source["id"]
    times, frames=read(source)
    values=features(frames)
    np.savez_compressed(OUT/f"{ident}-metrics.npz",time=times,**values)
    indexes=np.unique(np.searchsorted(times,np.arange(0,times[-1],.5)).clip(max=len(times)-1))
    sheet(frames,times,indexes,OUT/f"{ident}-timeline.jpg")
    print(ident, len(times), round(float(times[-1]),3), flush=True)

if __name__=="__main__":
    with ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(first_pass,SOURCES))
