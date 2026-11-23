from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from statistics import median
import json
import math
import re
import subprocess

root = Path(__file__).resolve().parent
inputs = [root.parent.parent / (name + '.mp4') for name in (
    "Why Perfect Railroads Don't Work", "Why Sailors Carried Storm Oil",
    "How a Mirror Rigged a Horse Race")]
inputs += sorted(root.glob("[0-9][0-9]-*.mp4"))
inputs += [root.parent / 'tsunami-outlined-motion.mp4']

def run(*args):
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout

def measure(item):
    index, path = item
    duration = float(run('ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)))
    trace = f'motion-{index:02}.trf'
    command = ['ffmpeg','-nostdin','-v','error','-threads','1','-filter_threads','1','-i',str(path),'-map','0:v:0','-an','-vf']
    run(*command, f'fps=10,scale=160:284,vidstabdetect=accuracy=8:mincontrast=.12:fileformat=ascii:result={trace}','-f','null','NUL')
    raw = run(*command, "select='gt(scene,0.28)',metadata=print:file=-",'-f','null','NUL')
    peaks = [float(t) for t in re.findall(r'pts_time:([\d.]+)',raw)]
    cuts = []
    for second in peaks:
        if not cuts or second-cuts[-1] >= .25:
            cuts.append(second)
    color = run(*command,'fps=2,scale=160:284,signalstats,metadata=print:file=-','-f','null','NUL')
    stat = lambda key: [float(x) for x in re.findall(r'lavfi.signalstats.'+key+r'=([\d.]+)',color)]
    values = []
    for line in (root/trace).read_text().splitlines():
        if not line.startswith('Frame '):
            continue
        second = (int(line.split()[1])-1)/10
        if second == 0 or any(abs(second-t)<.22 for t in cuts):
            continue
        blocks = [tuple(map(float,m)) for m in re.findall(r'LM (-?\d+) (-?\d+) (\d+) (\d+) \d+ ([\d.]+) ([\d.]+)',line)]
        blocks = [b for b in blocks if b[4]>=.12 and b[5]<=12]
        if len(blocks)<6 or max(b[3] for b in blocks)-min(b[3] for b in blocks)<65:
            continue
        dx,dy = (median(b[k] for b in blocks) for k in (0,1))
        x0,y0 = (median(b[k] for b in blocks) for k in (2,3))
        scale = median(((x-x0)*(u-dx)+(y-y0)*(v-dy))/((x-x0)**2+(y-y0)**2) for u,v,x,y,*_ in blocks if (x-x0)**2+(y-y0)**2>100)
        err = median(math.hypot(u-dx-scale*(x-x0),v-dy-scale*(y-y0)) for u,v,x,y,*_ in blocks)
        speed = math.hypot(dx,dy)+abs(scale)*75
        values.append(speed if err<=max(1.1,speed*.45) else 0)
    lo,hi = stat('YLOW'),stat('YHIGH')
    return dict(id=index,file=path.name,seconds=round(duration,2),peaks=cuts,eventsPerMinute=round(len(cuts)*60/duration,1),motion=round(100*sum(v>=1 for v in values)/len(values),1) if values else None,coverage=round(100*len(values)/(duration*10),1),luma=round(median(stat('YAVG')),1),contrast=round(median(b-a for a,b in zip(lo,hi)),1),chroma=round(median(stat('SATAVG')),1))

with ThreadPoolExecutor(max_workers=3) as pool:
    rows=list(pool.map(measure, enumerate(inputs,1)))
(root/'measurements.json').write_text(json.dumps(rows,indent=2))
for key in ('seconds','eventsPerMinute','motion','coverage','luma','contrast','chroma'):
    vals=[r[key] for r in rows[:-1] if r[key] is not None]
    print(key, 'reference min/median/max', min(vals), median(vals), max(vals), 'draft',rows[-1][key])
print('draft peaks',rows[-1]['peaks'])
