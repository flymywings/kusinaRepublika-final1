from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json,re,subprocess
from statistics import median
root=Path(__file__).resolve().parent
rows=json.loads((root/'measurements.json').read_text())
def scan(row):
    name=row['file']
    path=(root.parent.parent if row['id']<=3 else root.parent if row['id']==21 else root)/name
    raw=subprocess.check_output(['ffmpeg','-nostdin','-v','error','-threads','1','-filter_threads','1','-i',str(path),'-map','0:v:0','-an','-vf',"select='gt(scene,0.10)',metadata=print:file=-",'-f','null','NUL'],text=True)
    events=[(float(t),float(s)) for t,s in re.findall(r'pts_time:([\d.]+)\s+lavfi.scene_score=([\d.]+)',raw)]
    for threshold in (.12,.20):
        peaks=[]
        for t,s in events:
            if s>threshold and (not peaks or t-peaks[-1]>=.25):
                peaks.append(t)
        row[f'events{int(threshold*100)}']=round(len(peaks)*60/row['seconds'],1)
with ThreadPoolExecutor(max_workers=4) as pool: list(pool.map(scan,rows))
(root/'measurements.json').write_text(json.dumps(rows,indent=2))
for k in ('events12','events20'):
    print(k,median([r[k] for r in rows[:-1]]),rows[-1][k])
