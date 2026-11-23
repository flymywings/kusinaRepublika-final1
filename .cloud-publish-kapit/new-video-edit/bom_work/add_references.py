from pathlib import Path
p=Path(__file__).with_name('build_pdf.py')
s=p.read_text(encoding='utf-8')
s=s.replace("pagesid=obj('');pages=[];commands=[]", """pagesid=obj('');pages=[];commands=[];imageids={}
for key,size in [('a',1024),('b',1000),('c',800)]:
 data=(ROOT/f'package_{key}.jpg').read_bytes()
 imageids[key]=stream(data,f'/Type /XObject /Subtype /Image /Width {size} /Height {size} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode')""")
s=s.replace('Reference pictures pending approval','Approved package references included').replace("of 2',480", "of 3',480")
s=s.replace('Noche Buena Package A','Package A - Royal Spaghetti Bundle').replace('Noche Buena Package B','Package B - White King Spaghetti Bundle').replace('Noche Buena Package C','Package C - Del Monte Weekend Merienda Combo')
s=s.replace('New reference pictures await approval.','Approved package pictures are on page 3.')
s=s.replace('/Font << /F1 {fontid} 0 R >> >> /Contents', '/Font << /F1 {fontid} 0 R >> /XObject << /Ima {imageids["a"]} 0 R /Imb {imageids["b"]} 0 R /Imc {imageids["c"]} 0 R >> >> /Contents')
insert="""
finish()
text('NEXT  |  CCS DAY 2026',45,801,10);text('A. Approved Prize References',45,775,20)
text('Noche Buena Packages A, B and C - approved product pictures',45,754,9)
refs=[('a','Package A - Royal Spaghetti Bundle',135,3,
 'Royal spaghetti pasta and sauce bundle.', 'Image shows Sweet and Pinoy Celebration variants.',
 'shopee.ph/ROYAL-RICH-THICK-PINOY-CELEBRATION-SPAGHETTI-PACK-1.6KG-i.164833797.41226216292'),
 ('b','Package B - White King Fiesta Spaghetti Bundle',132,3,
 'White King Fiesta Sweet Style Spaghettipid Bundle.', 'Spaghetti and sauce with Parmesan cheese.',
 'zbga.shopsuki.ph/products/white-king-fiesta-sweet-style-spaghettipid-bundle-party-size'),
 ('c','Package C - Del Monte Weekend Merienda Combo',87,4,
 'Sweet Style Spaghetti Sauce 500 g + Spaghetti 400 g.', 'Receipt: DM VP WKNDMR SWT500GR+400.',
 'shopsuki.ph/products/del-monte-weekend-merienda-combo-spaghetti-sauce-sweet-500g-spaghetti-400g')]
import textwrap
for i,(key,title,price,qty,description,detail,url) in enumerate(refs):
 top=718-i*204
 rect(top-9,25,'0.90 0.94 0.97');text(title,52,top,11)
 commands.append(f'q 155 0 0 155 49 {top-173} cm /Im{key} Do Q')
 text(f'{money(price)} each | {qty} bundles | Total {money(price*qty)}',220,top-33,10)
 text(description,220,top-56,8);text(detail,220,top-72,8)
 text('Picture source:',220,top-96,8)
 for j,t in enumerate(textwrap.wrap(url,65)):text(t,220,top-109-j*11,7)
 line(top-185)
text('Prices and quantities follow the supplied receipt figures.',45,71,9)
text('Other proposed reference pictures remain pending approval.',45,56,9)
text('Page 3 of 3',480,26,8);finish()
"""
s=s.replace("finish();objects[pagesid-1]=",insert+"objects[pagesid-1]=").replace('/Type /Pages /Count 2','/Type /Pages /Count 3')
p.write_text(s,encoding='utf-8')
