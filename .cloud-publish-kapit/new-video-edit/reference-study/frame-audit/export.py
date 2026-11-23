import csv
import json
import math
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from itertools import groupby
from zipfile import ZipFile, ZIP_DEFLATED
import numpy as np
from measure_native import OUT, SOURCES, read, sheet

SHEETS=OUT/"contact-sheets"
SHEETS.mkdir(exist_ok=True)
MARKS=json.loads((OUT/"reviewed-boundaries.json").read_text(encoding="utf-8-sig"))
VISUAL=json.loads((OUT/"visual-coding.json").read_text(encoding="utf-8-sig"))
NAMES=["Left","Right","Up","Down","In","Out","CW","CCW"]
r=lambda a,n=2:round(float(a),n)

def motion(raw,candidates,t):
    adjusted=raw.copy()
    for f,k,w,_ in candidates:
        adjusted[max(0,f-2-w//2):f+3+w//2]=np.nan
    params=adjusted[:,:4]
    # Three source frames per sample at 30 fps. Count sustained dominant directions.
    chunks=[]; starts=[]
    for i in range(0,len(t)-2,3):
        block=params[i:i+3]
        if np.isfinite(block[:,0]).sum()<2:
            chunks.append(-1); starts.append(i); continue
        x,y,z,q=np.nanmean(block,axis=0)*3
        magnitude=np.array([abs(x)/.72,abs(y)/.72,abs(z)/.0038,abs(q)/.0065])
        j=int(magnitude.argmax())
        codes=[int(x>0),2+int(y>0),4+int(z>0),6+int(q>0)]
        chunks.append(codes[j] if magnitude[j]>=1 else -1)
        starts.append(i)
    events=[]
    p=0
    for label,group in groupby(chunks):
        count=len(list(group))
        if label>=0 and count>=3:
            a=starts[p]
            b=min(len(t)-1,starts[p]+3*count-1)
            events.append((a,b,label))
        p+=count
    return adjusted,events

def export(source):
    ident=source["id"]
    z=np.load(OUT/f"{ident}-metrics.npz")
    candidates=json.loads((OUT/f"{ident}-candidates.json").read_text())
    sizes=list(map(int,VISUAL[ident]["sizes"].split()))
    t=z["time"]
    n=len(t)
    assert len(candidates)+1==len(sizes), (ident,len(candidates),len(sizes))
    selected=[[*candidates[i-1],sizes[i-1],sizes[i]] for i in MARKS[ident]]
    if ident=="05":
        selected.append([24,2,4,0,1,0])  # Existing 30 fps reference review.
        selected.sort()
    raw=np.load(OUT/f"{ident}-motion.npy")
    assert len(raw)==n,(ident,len(raw),n)
    adjusted,events=motion(raw,candidates,t)
    directions=Counter(k for _,_,k in events)
    steps=np.diff(t)
    duration=float(t[-1]+np.median(steps))
    luma=z["luma"]; contrast=z["contrast"]; color=z["color"]; sat=z["sat"]; warmth=z["warmth"]
    avg=np.rint(np.mean(color,axis=0)).astype(int).tolist()
    hist=z["quant"].sum(axis=0)
    palette=[]
    for idx in hist.argsort()[-3:][::-1]:
        rgb=[int(idx//64)*32+16,int(idx%64//8)*32+16,int(idx%8)*32+16]
        palette.append([*rgb,r(hist[idx]*100/hist.sum())])
    def writer(name,header,records):
        with (OUT/name).open("w",newline="",encoding="utf-8") as f:
            w=csv.writer(f); w.writerow(header); w.writerows(records)
    writer(f"{ident}-frames.csv",["frame_0","s","luma_0_255","luma_p90_minus_p10","saturation_pct","red","green","blue","red_minus_blue","fit_dx_px_at_192w","fit_dy_px_at_342h","fit_scale_delta","fit_rotation_rad","fit_inlier_share"],
        ((i,r(t[i],6),r(luma[i]),r(contrast[i]),r(sat[i]),*(r(c) for c in color[i]),r(warmth[i]),
         *(r(v,6) if math.isfinite(v) else "" for v in adjusted[i])) for i in range(n)))
    cuts=[]
    for f,k,w,score,before,after in selected:
        cuts.append([f,r(t[f],6),k,max(0,f-w//2) if k==2 else f,min(n-1,f+(w+1)//2) if k==2 else f,before,after,score or None])
    writer(f"{ident}-edits.csv",["frame_0","s","type_1_cut_2_blend","start_frame_est","end_frame_est","size_before_0wide_1medium_2close","size_after_0wide_1medium_2close","candidate_score"],cuts)
    writer(f"{ident}-candidates.csv",["frame_0","s","type_1_cut_2_blend","width_frames_est","score","visually_retained_0_1"],
        ((f,r(t[f],6),k,w,score,int(i+1 in MARKS[ident])) for i,(f,k,w,score) in enumerate(candidates)))
    writer(f"{ident}-motion.csv",["start_frame_0","end_frame_0","start_s","end_s","direction_0L_1R_2U_3D_4In_5Out_6CW_7CCW"],
        ((a,b,r(t[a],6),r(t[b],6),k) for a,b,k in events))
    times,frames=read(source)
    marks={row[0]:row[2] for row in cuts}
    samples=np.searchsorted(times,np.arange(0,times[-1],.5)).clip(max=n-1)
    frames_to_show=sorted(set(samples.tolist())|marks.keys())
    def label(f):
        suffix=" C" if marks.get(f)==1 else " D" if marks.get(f)==2 else ""
        return f"{times[f]:05.2f}{suffix}"
    sheet(frames,times,frames_to_show,SHEETS/f"{ident}.jpg",cols=12,w=82,label=label)
    edges=[0]+[row[0] for row in cuts]+[n]
    row=dict(id=ident,source=source["file"],frames=n,fps=r(1/np.median(steps),3),seconds=r(duration,3),
             candidates=len(candidates),cut=sum(c[2]==1 for c in cuts),dissolve=sum(c[2]==2 for c in cuts),
             edits=len(cuts),editRate=r(len(cuts)*60/duration),medianShot=r(np.median(np.diff(edges))*np.median(steps),3),
             hookEdits=sum(c[1]<2 for c in cuts),sizeChanges=sum(c[5]!=c[6] for c in cuts),
             sizeRate=r(sum(c[5]!=c[6] for c in cuts)*60/duration),locations=VISUAL[ident]["locations"],
             y=r(np.mean(luma)),contrast=r(np.mean(contrast)),saturation=r(np.mean(sat)),
             rgb=avg,palette=palette,hookWarm=r(np.mean(warmth[t<2])),tailWarm=r(np.mean(warmth[t>=duration-5])),
             direction=[directions[j] for j in range(8)],fit=r(np.isfinite(adjusted[:,0]).mean()*100),cuts=cuts)
    print(ident,n,len(cuts),row["sizeChanges"],row["direction"],flush=True)
    return row

if __name__=="__main__":
    with ThreadPoolExecutor(max_workers=3) as pool:
        rows=list(pool.map(export,SOURCES))
    (OUT/"summary.json").write_text(json.dumps(rows,indent=2),encoding="utf-8")
    keys=["id","frames","fps","seconds","candidates","edits","cut","dissolve","editRate","medianShot","hookEdits","sizeChanges","sizeRate","locations","y","contrast","saturation","rgb","palette","hookWarm","tailWarm","direction","fit"]
    with (OUT/"summary.csv").open("w",newline="",encoding="utf-8") as f:
        writer=csv.writer(f); writer.writerow(keys)
        writer.writerows([row[k] for k in keys] for row in rows)
    with ZipFile(OUT/"reference-study-20.zip","w",ZIP_DEFLATED) as archive:
        for p in sorted(OUT.glob("*.csv")):
            archive.write(p, f"measurements/{p.name}")
        for p in sorted(SHEETS.glob("*.jpg")):
            archive.write(p, f"contact-sheets/{p.name}")
        archive.write(OUT/"summary.json","measurements/summary.json")
