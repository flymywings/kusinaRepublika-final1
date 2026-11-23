import cv2,json
from PIL import Image,ImageDraw
from pathlib import Path
out=Path('reference-study/camera-language-audit')
idx=json.load(open('reference-study/script-analysis/index.json'))
seq=[('05',idx[4]['file'],0,3),('11',idx[10]['file'],0,3),('01',idx[0]['file'],0,3),('v2open','diamond-field-v2/they-mined-investors-v2.mp4',0,5),('v2inspect','diamond-field-v2/they-mined-investors-v2.mp4',10.6,14.2),('horseoverview',idx[0]['file'],15,30)]
for name,path,start,end in seq:
 cap=cv2.VideoCapture(path)
 if name=='horseoverview':
  times=list(range(15,30)); groups=[times]
 else:
  times=[start+i/30 for i in range(round((end-start)*30))];groups=[times[i:i+30] for i in range(0,len(times),30)]
 for j,ts in enumerate(groups):
  sheet=Image.new('RGB',(1200,230*((len(ts)+9)//10)), '#202020'); d=ImageDraw.Draw(sheet)
  for n,t in enumerate(ts):
   cap.set(0 if False else cv2.CAP_PROP_POS_MSEC,t*1000);ok,fr=cap.read()
   if not ok:continue
   im=Image.fromarray(cv2.cvtColor(fr,cv2.COLOR_BGR2RGB));im.thumbnail((120,210))
   x=n%10*120;y=n//10*230;sheet.paste(im,(x,y));d.text((x,y+210),f'{t:.3f}',fill='white')
  sheet.save(out/f'{name}-{j}.jpg')
 cap.release()
