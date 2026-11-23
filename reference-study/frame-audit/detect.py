import json
from pathlib import Path
import numpy as np

OUT = Path(__file__).resolve().parent
def detect(z):
    a=z["tiny"].reshape(len(z["time"]),-1).astype(np.float32)
    n=len(a)
    diff=np.r_[0,np.abs(a[1:]-a[:-1]).mean(axis=1)]
    raw=np.zeros(n)
    typ=np.zeros(n,np.int8)
    span=np.zeros(n,np.int8)
    for f in range(6,n-6):
        near=np.r_[diff[f-6:f-1],diff[f+2:f+7]]
        baseline=np.median(near)
        score=diff[f]/max(1.3,baseline)
        if diff[f] >= 9 and score>=2.35:
            raw[f]=diff[f]*(.8+.2*min(score/4,1))
            typ[f]=1
            span[f]=1
    # Look for several frames that are close to an ordered blend of two stable views.
    for width in (4,5,6,7,8,9,10,12):
        s=np.arange(4,n-width-4)
        e=s+width
        before=a[s]
        after=a[e]
        vec=after-before
        energy=(vec*vec).mean(axis=1)
        distance=np.sqrt(energy)
        err=[]; mix=[]
        for frac in (.25,.50,.75):
            p=s+round(width*frac)
            sample=a[p]-before
            alpha=(sample*vec).mean(axis=1)/np.maximum(energy,1)
            mix.append(alpha)
            err.append(np.sqrt(((sample-alpha[:,None]*vec)**2).mean(axis=1))/np.maximum(distance,1))
        local=(diff[s-3]+diff[s-2]+diff[s-1]+diff[e+1]+diff[e+2]+diff[e+3])/6
        inside=np.vstack([diff[s+j] for j in range(1,width+1)])
        m1,m2,m3=mix
        resid=np.mean(err,axis=0)
        middle=s+width//2
        strength=distance*(1-resid)*.46
        accept=(distance>19)&(resid<.265)&(m1>.08)&(m1<.59)&(m2>.26)&(m2<.75)&(m3>.47)&(m3<.94)&((m2-m1)>.09)&((m3-m2)>.09)&(inside.mean(axis=0)>np.maximum(2.2,local*1.20))&(inside.max(axis=0)<inside.sum(axis=0)*.40)&(strength>raw[middle])
        raw[middle[accept]]=strength[accept]
        typ[middle[accept]]=2
        span[middle[accept]]=width
    accepted=[]
    for f in np.argsort(raw)[::-1]:
        if raw[f]<7.3: break
        if all(abs(f-k)>max(6,(int(span[f])+int(span[k]))//2) for k in accepted):
            accepted.append(int(f))
    return [[f,int(typ[f]),int(span[f]),round(float(raw[f]),1)] for f in sorted(accepted)]

for p in sorted(OUT.glob("*-metrics.npz")):
    z=np.load(p)
    result=detect(z)
    (OUT/f"{p.name[:2]}-candidates.json").write_text(json.dumps(result))
    t=z["time"]
    print(p.name[:2],len(result), " ".join(f"{t[f]:.2f}{'d' if k==2 else 'c'}" for f,k,_,_ in result),flush=True)
