"""Runs reference-study/measure.py's own measure() on a trimmed hook file, unchanged.
measure.py runs the whole reference set when imported, so only its two functions (run, measure) are taken from the source.
Trace files are written to the output folder (the working directory), never to reference-study."""
import ast, json, sys
from pathlib import Path
src = Path(r'C:/Users/Win 10/Downloads/new video edit/reference-study/measure.py').read_text()
ns = {}
exec("from pathlib import Path\nfrom statistics import median\nimport json, math, re, subprocess\n", ns)
for node in ast.parse(src).body:
    if isinstance(node, ast.FunctionDef) and node.name in ('run', 'measure'):
        exec(compile(ast.Module([node], []), 'measure.py', 'exec'), ns)
out = Path(sys.argv[2]).resolve()
ns['root'] = out
row = ns['measure']((1, Path(sys.argv[1]).resolve()))
(out / 'hook-measure.json').write_text(json.dumps(row, indent=2))
print(json.dumps(row, indent=2))
