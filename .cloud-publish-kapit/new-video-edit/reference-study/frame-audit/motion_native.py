import json
import re
import subprocess as sp
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from statistics import median
import numpy as np

from measure_native import OUT, SOURCES

def measure(source):
    ident=source["id"]
    trace=f"{ident}-native.trf"
    sp.run(["ffmpeg","-v","error","-nostdin","-threads","2","-filter_threads","1","-i",source["file"],
      "-map","0:v:0","-an","-vf",f"scale=192:342,vidstabdetect=shakiness=4:accuracy=7:mincontrast=.09:fileformat=ascii:result={trace}",
      "-f","null","NUL"],cwd=OUT,check=True)
    values=[]
    for line in (OUT/trace).read_text().splitlines():
        if not line.startswith("Frame "): continue
        blocks=[tuple(map(float,m)) for m in re.findall(r'LM (-?\d+) (-?\d+) (\d+) (\d+) \d+ ([\d.]+) ([\d.]+)',line)]
        blocks=[b for b in blocks if b[4]>=.095 and b[5]<=9]
        if len(blocks)<6 or np.ptp([b[2] for b in blocks])<80 or np.ptp([b[3] for b in blocks])<115:
            values.append([np.nan]*5)
            continue
        data=np.asarray(blocks)
        x,y=data[:,2]-96,data[:,3]-171
        u,v=data[:,0],data[:,1]
        design=np.stack([np.r_[np.ones(len(x)),np.zeros(len(x))],np.r_[np.zeros(len(x)),np.ones(len(x))],
          np.r_[x,y],np.r_[-y,x]],axis=1)
        target=np.r_[u,v]
        good=np.ones(len(x),dtype=bool)
        for _ in range(3):
            params=np.linalg.lstsq(design[np.tile(good,2)],target[np.tile(good,2)],rcond=None)[0]
            du,dv=np.split(target-design@params,2)
            err=np.hypot(du,dv)
            good=err<=max(1.20,2.25*np.median(err))
        if good.sum()<6 or np.median(err)>max(1.1,np.hypot(*params[:2])*.56): values.append([np.nan]*5)
        else: values.append([*params,good.sum()/len(good)])
    np.save(OUT/f"{ident}-motion.npy",np.array(values))
    print(ident,len(values),flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:
    list(pool.map(measure,SOURCES))
