"""Align the supplied transcript to local recognition anchors; never edit the voice."""
import json, re, difflib
from pathlib import Path
root = Path(__file__).parent
tokens = (root/'NARRATION.txt').read_text(encoding='utf-8-sig').split()
raw = [json.loads(line) for line in (root/'words-long.json').read_text().splitlines() if line.strip()]
norm = lambda text: re.sub(r"[^a-z0-9']", '', text.lower().replace('’', "'"))
aligned = [None] * len(tokens)
changes = []
for tag, a, b, x, y in difflib.SequenceMatcher(None, [norm(t) for t in tokens], [norm(t['text']) for t in raw], autojunk=False).get_opcodes():
    if tag == 'equal':
        for i, j in zip(range(a,b), range(x,y)):
            aligned[i] = [raw[j]['start'], raw[j]['end']]
    elif a < b:
        lo = raw[x]['start'] if x < len(raw) else raw[-1]['end']
        hi = raw[y-1]['end'] if y > x else (raw[x]['start'] if x < len(raw) else 31713)
        if hi <= lo:
            lo = raw[x-1]['end'] if x else 0
            hi = raw[x]['start'] if x < len(raw) else 31713
        hi = max(lo + 45*(b-a), hi)
        weights = [max(2,len(norm(t))) for t in tokens[a:b]]; total=sum(weights); cursor=lo
        for i,w in zip(range(a,b),weights):
            end = cursor + (hi-lo)*w/total; aligned[i]=[cursor,end]; cursor=end
        changes.append({'provided':tokens[a:b], 'recognition':[r['text'] for r in raw[x:y]], 'interval_ms':[lo,hi]})
assert all(v is not None for v in aligned)
starts = [round(t[0]*.03) for t in aligned]
for i in range(len(starts)-2,-1,-1): starts[i]=min(starts[i],starts[i+1]-5)
starts[0]=0
assert min(starts)>=0 and all(b-a>=5 for a,b in zip(starts,starts[1:]))
captions = [[a,starts[i+1] if i+1<len(starts) else 952,tokens[i]] for i,a in enumerate(starts)]
(root/'captions.ts').write_text('export const CAPTIONS: [number,number,string][] = '+json.dumps(captions,ensure_ascii=False)+';\n',encoding='utf-8')
(root/'words.json').write_text(json.dumps([{'text':t,'start_ms':round(a[0]),'end_ms':min(31713,round(a[1])),'caption_frames':c[:2]} for t,a,c in zip(tokens,aligned,captions)],indent=2,ensure_ascii=False),encoding='utf-8')
(root/'proof/alignment-corrections.json').write_text(json.dumps(changes,indent=2,ensure_ascii=False),encoding='utf-8')
print(f'{len(tokens)} caption words; exact provided text; minimum hold {min(b-a for a,b,_ in captions)} frames; {len(changes)} recognition corrections')
