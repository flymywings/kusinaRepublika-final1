"""Align the approved caption text to the local word recognizer's anchors."""
import difflib
import json
import re
from pathlib import Path

root = Path(__file__).parent
script = (root / 'script.md').read_text(encoding='utf-8')
words = script.split('## Narration\n', 1)[1].split('## Story direction', 1)[0].split()
anchors = [json.loads(line) for line in (root / 'proof/recognized-words.jsonl').read_text(encoding='utf-8').splitlines()]


def normalized(text):
    return re.sub(r"[^a-z0-9']", '', text.lower().replace('’', "'"))


starts = [None] * len(words)
matcher = difflib.SequenceMatcher(None, list(map(normalized, words)), [normalized(row['text']) for row in anchors], autojunk=False)
for tag, left, right, first, last in matcher.get_opcodes():
    if tag == 'equal':
        for index, source in zip(range(left, right), range(first, last)):
            starts[index] = round(anchors[source]['start'] * .03)
    elif right > left:
        start = anchors[first]['start'] if first < len(anchors) else anchors[-1]['end']
        end = anchors[last - 1]['end'] if last > first else start + 150 * (right - left)
        for index in range(left, right):
            starts[index] = round((start + (end - start) * (index - left) / (right - left)) * .03)

# Whisper pads the end of the last phrase to 30 s. Anchor it to the
# voiced region and the short closures in the actual 29.57 s recording.
assert [normalized(word) for word in words[-5:]] == ['the', 'woodpecker', 'kept', 'the', 'statue']
starts[-5:] = [842, 846, 865, 870, 874]
for index in range(len(starts) - 2, -1, -1):
    starts[index] = min(starts[index], starts[index + 1] - 5)
starts[0] = max(0, starts[0])
assert all(a < b for a, b in zip(starts, starts[1:])), starts
captions = [[start, end, word] for start, end, word in zip(starts, starts[1:] + [888], words)]
(root / 'captions.ts').write_text('export const CAPTIONS: [number, number, string][] = ' + json.dumps(captions, ensure_ascii=False) + ';\n', encoding='utf-8')
print(f'{len(words)} words. Key captions: ' + str([cue for cue in captions if cue[2] in {'pecked', 'guards.', 'chip', 'Wood.', 'sunset,', 'woodpecker', 'statue.'}]))
