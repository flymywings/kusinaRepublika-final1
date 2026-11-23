"""Private local reference study. Never publish the reference transcripts."""
import json, os, re, subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

workspace=Path(__file__).resolve().parents[2]
out=Path(__file__).parent
downloads=workspace.parent
model=(Path(os.environ['TEMP'])/'shore-ggml-tiny.en-q5_1.bin').as_posix().replace(':',r'\:')
videos=[('01',downloads/'How a Mirror Rigged a Horse Race.mp4'),('02',downloads/"Why Perfect Railroads Don't Work.mp4"),('03',downloads/'Why Sailors Carried Storm Oil.mp4')]
videos += [(p.name[:2],p) for p in sorted((workspace/'reference-study').glob('*.mp4'))]
def run(item):
    number,video=item
    target=out/f'{number}.jsonl'
    if not target.exists() or not target.stat().st_size:
        destination=target.relative_to(workspace).as_posix()
        filters=f"whisper=model='{model}':language=en:use_gpu=false:queue=180:format=json:destination='{destination}'"
        with (out/f'{number}.log').open('w') as log:
            subprocess.run(['ffmpeg','-hide_banner','-nostats','-loglevel','warning','-i',str(video),'-map','0:a:0','-af',filters,'-f','null','NUL'],cwd=workspace,stderr=log,stdout=subprocess.DEVNULL,check=True)
    rows=[]
    for line in target.read_text().splitlines():
        if not line.strip():continue
        try:rows.append(json.loads(line))
        except json.JSONDecodeError:
            match=re.fullmatch(r'\{"start":(\d+),"end":(\d+),"text":"(.*)"\}',line)
            if not match:raise
            rows.append({'start':int(match[1]),'end':int(match[2]),'text':match[3].replace(r'\"','"')})
    transcript=' '.join(r['text'].strip() for r in rows)
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(video)]))
    result={'id':number,'file':str(video),'duration':duration,'approx_words':len(transcript.split()),'transcript':transcript}
    print(f'{number} transcribed: {len(transcript.split())} approximate words',flush=True)
    return result
results=[]
with ThreadPoolExecutor(max_workers=2) as pool:
    for future in as_completed([pool.submit(run,v) for v in videos]):results.append(future.result())
(out/'index.json').write_text(json.dumps(sorted(results,key=lambda x:x['id']),indent=2))
print(f'Complete: {len(results)} local transcripts. Recognition requires checking; not authoritative quotations.',flush=True)
