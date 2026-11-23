import base64
import io
import json
from pathlib import Path
from statistics import median
from PIL import Image

root=Path(__file__).resolve().parent
target=Path("C:/Users/Win 10/.codex/visualizations/2026/11/03/01a1a138-f055-7480-90df-1f5dc0af2e54/lupin-reference-frame-study.canvas.tsx")
rows=json.loads((root/"summary.json").read_text(encoding="utf-8"))
for row in rows:
    row["source"]=Path(row["source"]).name
    sheet=Image.open(root/"contact-sheets"/f"{row['id']}.jpg")
    sheet.thumbnail((980,2850))
    buffer=io.BytesIO()
    sheet.save(buffer,format="JPEG",quality=69,optimize=True)
    row["sheet"]="data:image/jpeg;base64,"+base64.b64encode(buffer.getvalue()).decode()
count=sum(row["frames"] for row in rows)
keypoints=[sum(row["edits"] for row in rows),sum(row["candidates"] for row in rows),round(median(row["editRate"] for row in rows),2),round(median(row["sizeRate"] for row in rows),2)]
head='''import {useCanvasState,useHostTheme} from 'cursor/canvas';
const rows = '''+json.dumps(rows,ensure_ascii=False,separators=(",",":"))+''';
const totals = '''+json.dumps([count,*keypoints])+''';
'''
body=r'''
const cols=['ID','s','Frames','Hard','Blend','Edits / min','Shot median s','0–2 s edits','Size Δ','Size Δ / min','Locations ≈','Y′','P90−P10','Sat %','Mean RGB','R−B 0–2 s','R−B last 5 s','Camera L/R/U/D/In/Out/CW/CCW','Fit %'];
const kinds={1:'C',2:'D'} as const;
export default function ReferenceFrameStudy(){
  const theme=useHostTheme();
  const [id,setId]=useCanvasState('ref-id','01');
  const [mode,setMode]=useCanvasState('ref-mode','edits');
  const row=rows.find(item=>item.id===id)??rows[0];
  const border='1px solid '+theme.stroke.secondary;
  return <main style={{padding:20,color:theme.text.primary,background:theme.bg.editor,fontFamily:'system-ui'}}>
    <h1 style={{fontSize:24,margin:'0 0 6px'}}>20 reference videos</h1>
    <div style={{color:theme.text.secondary,fontVariantNumeric:'tabular-nums',marginBottom:16}}>
      {totals[0].toLocaleString()} frames · {totals[1]} retained edits · {totals[2]} detector candidates · {totals[3]} median edits/min · {totals[4]} median size changes/min
    </div>
    <div style={{overflowX:'auto'}}>
      <table aria-label="Reference videos, edit counts, camera direction and pixel statistics" style={{borderCollapse:'collapse',width:'100%',fontSize:12,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>
        <thead><tr>{cols.map(label=><th key={label} scope="col" style={{borderBottom:border,padding:'7px 9px',textAlign:'right'}}>{label}</th>)}</tr></thead>
        <tbody>{rows.map(r=><tr key={r.id} style={{borderBottom:border,background:r.id===id?theme.bg.surface:undefined}}>
          <th scope="row" style={{padding:'4px 9px',textAlign:'right'}}><button title={r.source} onClick={()=>setId(r.id)} style={{border,borderRadius:4,padding:'3px 7px',background:theme.bg.editor,color:theme.accent.primary,fontWeight:700,cursor:'pointer'}}>{r.id}</button></th>
          {[r.seconds,r.frames,r.cut,r.dissolve,r.editRate,r.medianShot,r.hookEdits,r.sizeChanges,r.sizeRate,r.locations,r.y,r.contrast,r.saturation,r.rgb.join('/'),r.hookWarm,r.tailWarm,r.direction.join('/'),r.fit].map((v,i)=><td key={i} style={{padding:'4px 9px',textAlign:'right'}}>{v}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <div style={{color:theme.text.secondary,fontSize:12,marginTop:9,lineHeight:1.5}}>
      Y′ and P90−P10 in 8-bit units. HSV saturation as a pixel mean. Camera values count dominant image-motion runs ≥0.30 s. Fit % is eligible frame coverage. Location counts are visual estimates from 0.5 s samples. Size changes compare adjacent shot midpoints at retained boundaries.
    </div>
    <section style={{marginTop:24,borderTop:border,paddingTop:14}}>
      <h2 style={{fontSize:19,margin:'0 0 4px'}}>{row.id} · {row.source}</h2>
      <div style={{display:'flex',gap:12,margin:'8px 0'}}>
        <label>Video <select value={id} onChange={event=>setId(event.currentTarget.value)}>{rows.map(r=><option key={r.id} value={r.id}>{r.id}</option>)}</select></label>
        <label>View <select value={mode} onChange={event=>setMode(event.currentTarget.value)}><option value="edits">Edit frames</option><option value="sheet">Contact sheet</option></select></label>
      </div>
      <div style={{fontVariantNumeric:'tabular-nums',fontSize:12,marginBottom:12}}>RGB bins (%) · {row.palette.map(p=>p.slice(0,3).join('/')+' ('+p[3]+'%)').join(' · ')}</div>
      {mode==='sheet'? <img alt={'Contact sheet '+row.id} src={row.sheet} style={{display:'block',width:'100%',maxWidth:980,height:'auto'}} /> :
        <div>
          <div style={{color:theme.text.secondary,fontSize:12}}>Frame 0-based · timestamp s · C hard cut · D estimated blend span · sizes 0 wide, 1 medium, 2 close/detail</div>
          <ol style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(225px,1fr))',gap:'6px 20px',paddingLeft:28,fontFamily:'monospace',fontSize:12}}>
            {row.cuts.map(([f,s,k,a,b,pre,post])=><li key={f}>{f} · {s?.toFixed(3)} · {k===2?kinds[2]+' '+a+'–'+b:kinds[1]} · {pre}/{post}</li>)}
          </ol>
        </div>}
    </section>
    <p style={{color:theme.text.secondary,fontSize:12,lineHeight:1.5}}>Source range 0 to last decoded frame per file. Edit counts are reviewed detections and can omit low-change cuts or blends. Camera direction is inferred from coherent screen motion. Rendered footage does not expose camera tracks.</p>
  </main>;
}
'''
body=body.replace('theme.bg.surface','theme.bg.editor')
target.write_text(head+body,encoding="utf-8")
print(str(target),target.stat().st_size)
