import json

with open(r'c:\Users\Win 10\Downloads\new video edit\ferrari-parking\words.json', 'r') as f:
    words = json.load(f)

captions = []
fps = 30

for i, item in enumerate(words):
    w = item['w']
    s_f = int(round(item['s'] * fps))
    if i + 1 < len(words):
        next_s_f = int(round(words[i+1]['s'] * fps))
        # Hold word until next word begins or slight natural hold
        e_f = max(s_f + 4, next_s_f)
    else:
        e_f = s_f + int(round((item['e'] - item['s']) * fps)) + 6
    captions.append((s_f, e_f, w))

out_ts = """// Auto-generated caption cues from narration-1.1x.mp3
export interface CaptionCue {
  start: number;
  end: number;
  text: string;
}

export const CAPTIONS: ReadonlyArray<readonly [start: number, end: number, text: string]> = [
"""
for s, e, w in captions:
    clean_w = w.replace('"', '\\"')
    out_ts += f'  [{s}, {e}, "{clean_w}"],\n'
out_ts += '];\n'

with open(r'c:\Users\Win 10\Downloads\new video edit\ferrari-parking\captions.ts', 'w', encoding='utf-8') as f:
    f.write(out_ts)
print(f'Generated {len(captions)} caption cues in captions.ts')
