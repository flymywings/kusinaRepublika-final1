import json
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image,ImageDraw
from measure_native import OUT,SOURCES,read,sheet,FONT

def render(source):
    ident=source["id"]
    times,frames=read(source)
    candidates=json.loads((OUT/f"{ident}-candidates.json").read_text())
    edges=[0]+[item[0] for item in candidates]+[len(frames)]
    mid=[(a+b)//2 for a,b in zip(edges,edges[1:])]
    labels={f:f"{i:02} {times[f]:05.2f}" for i,f in enumerate(mid)}
    sheet(frames,times,mid,OUT/f"{ident}-shot-review.jpg",cols=14,w=78,label=labels.get)
    w,h=48,85
    canvas=Image.new("RGB",(12*(3*w+5),((len(candidates)+11)//12)*(h+17)),"#181a20")
    draw=ImageDraw.Draw(canvas)
    for i,(f,k,d,_) in enumerate(candidates):
        x,y=i%12*(3*w+5),i//12*(h+17)
        for j,frame in enumerate([max(0,f-max(3,d//2+1)),f,min(len(frames)-1,f+max(3,d//2+1))]):
            canvas.paste(Image.fromarray(frames[frame]).resize((w,h)),(x+j*w,y))
        draw.text((x,y+h),f"{i+1:02} {times[f]:05.2f} {k}",font=FONT,fill="white")
    canvas.save(OUT/f"{ident}-cut-review.jpg",quality=88)
    print(ident,flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:
    list(pool.map(render,SOURCES))
