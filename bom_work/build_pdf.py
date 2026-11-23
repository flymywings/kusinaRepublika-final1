import struct, pathlib
from decimal import Decimal
ROOT=pathlib.Path(__file__).parent
class Font:
 def __init__(self,path):
  self.data=pathlib.Path(path).read_bytes();d=self.data
  self.tables={}
  for i in range(struct.unpack_from('>H',d,4)[0]):
   tag,_,off,size=struct.unpack_from('>4sIII',d,12+16*i);self.tables[tag.decode()]=(off,size)
  off=self.tables['head'][0];self.units=struct.unpack_from('>H',d,off+18)[0]
  self.bbox=struct.unpack_from('>hhhh',d,off+36)
  off=self.tables['hhea'][0];self.asc,self.desc=struct.unpack_from('>hh',d,off+4);n=struct.unpack_from('>H',d,off+34)[0]
  self.widths=[struct.unpack_from('>H',d,self.tables['hmtx'][0]+4*i)[0] for i in range(n)]
  base=self.tables['cmap'][0];self.map={}
  for i in range(struct.unpack_from('>H',d,base+2)[0]):
   p,e,o=struct.unpack_from('>HHI',d,base+4+8*i);off=base+o
   if p==3 and e==1 and struct.unpack_from('>H',d,off)[0]==4:break
  count=struct.unpack_from('>H',d,off+6)[0]//2;end=off+14;start=end+2*count+2;delta=start+2*count;ran=delta+2*count
  for i in range(count):
   a=struct.unpack_from('>H',d,start+2*i)[0];b=struct.unpack_from('>H',d,end+2*i)[0];de=struct.unpack_from('>h',d,delta+2*i)[0];ro=struct.unpack_from('>H',d,ran+2*i)[0]
   for c in range(a,min(b+1,65535)):
    g=struct.unpack_from('>H',d,ran+2*i+ro+2*(c-a))[0] if ro else c
    self.map[c]=((g+de)&65535) if g else 0
 def width(self,s,size):return sum(self.widths[min(self.map.get(ord(c),0),len(self.widths)-1)]/self.units*size for c in s)
 def encode(self,s):return ''.join(f'{self.map.get(ord(c),0):04X}' for c in s)
font=Font('C:/Windows/Fonts/arial.ttf')
objects=[]
def obj(b):
 objects.append(b.encode() if isinstance(b,str) else b);return len(objects)
def stream(b,extra=''):return obj(f'<< /Length {len(b)} {extra} >>\nstream\n'.encode()+b+b'\nendstream')
ff=stream(font.data,'/Length1 '+str(len(font.data)))
scale=lambda n:round(n*1000/font.units)
desc=obj(f'<< /Type /FontDescriptor /FontName /Arial /Flags 32 /FontBBox [{" ".join(str(scale(x)) for x in font.bbox)}] /ItalicAngle 0 /Ascent {scale(font.asc)} /Descent {scale(font.desc)} /CapHeight 700 /StemV 80 /FontFile2 {ff} 0 R >>')
w=' '.join(str(scale(x)) for x in font.widths)
cid=obj(f'<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Arial /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor {desc} 0 R /DW 500 /W [0 [{w}]] /CIDToGIDMap /Identity >>')
rev={g:c for c,g in font.map.items() if g};parts=['/CIDInit /ProcSet findresource begin','12 dict begin','begincmap','/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def','/CMapName /ArialUnicode def','/CMapType 2 def','1 begincodespacerange','<0000> <FFFF>','endcodespacerange']
items=list(rev.items())
for i in range(0,len(items),100):
 batch=items[i:i+100];parts += [f'{len(batch)} beginbfchar']+[f'<{g:04X}> <{c:04X}>' for g,c in batch]+['endbfchar']
parts+=['endcmap','CMapName currentdict /CMap defineresource pop','end','end'];unicode=stream('\n'.join(parts).encode())
fontid=obj(f'<< /Type /Font /Subtype /Type0 /BaseFont /Arial /Encoding /Identity-H /DescendantFonts [{cid} 0 R] /ToUnicode {unicode} 0 R >>')
pagesid=obj('');pages=[];commands=[];imageids={}
for key,size in [('a',1024),('b',1000),('c',800)]:
 data=(ROOT/f'package_{key}.jpg').read_bytes()
 imageids[key]=stream(data,f'/Type /XObject /Subtype /Image /Width {size} /Height {size} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode')
def text(s,x,y,size=10,color='0.12 0.16 0.22'):
 commands.append(f'BT /F1 {size} Tf {color} rg 1 0 0 1 {x:.2f} {y:.2f} Tm <{font.encode(s)}> Tj ET')
def line(y):commands.append(f'0.82 0.85 0.88 RG 0.4 w 45 {y} m 550 {y} l S')
def rect(y,h,color):commands.append(f'{color} rg 45 {y} 505 {h} re f')
def page(number):
 text('NEXT  |  CCS DAY 2026',45,801,10);text('IV. Bill of Materials',45,775,20);text('Revised costing • Approved package references included',45,756,9)
 text('COSTING DESCRIPTION',52,724,9);text('UNIT PRICE',345,724,9);text('QTY.',429,724,9);text('TOTAL',491,724,9);line(714)
 text(f'Page {number} of 3',480,26,8)
def finish():
 content=stream('\n'.join(commands).encode());pages.append(obj(f'<< /Type /Page /Parent {pagesid} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 {fontid} 0 R >> /XObject << /Ima {imageids["a"]} 0 R /Imb {imageids["b"]} 0 R /Imc {imageids["c"]} 0 R >> >> /Contents {content} 0 R >>'));commands.clear()
def money(x):return f'₱{Decimal(str(x)):,.2f}'
def section(title,y):rect(y-6,22,'0.90 0.94 0.97');text(title,52,y+1,10);return y-28
def row(name,p,q,y):
 text(name,52,y,9);s=money(p);text(s,405-font.width(s,9),y,9);text(str(q),438,y,9);s=money(Decimal(str(p))*q);text(s,543-font.width(s,9),y,9);line(y-10);return y-26
groups=[('PRIZES',[
 ('Talent Show Special Awards (existing allocation)',679,6),('n8n Workshop Prizes (existing allocation)',679,5),('Package A - Royal Spaghetti Bundle',135,3),('Package B - White King Spaghetti Bundle',132,3),('Package C - Del Monte Weekend Merienda Combo',87,4)]),('CONSOLATION PRIZES',[
 ('Pancit Canton Pack - Chili Mansi',88,2),('Pancit Canton Pack - Calamansi',88,2),('Pancit Canton Pack - Hot Chili',88,2),('C2 Tea Apple Pack',87.75,6)]),('DESIGN',[
 ('A4 Bond Paper - Hard Copy',285,1),('Usher Sashes',300,6),('Lei',284,1)]),('MATERIALS',[
 ('Ball Smile',100,1),('Foam Board - Black',187,2),('Certificate Holder',57,3),('Blue Ribbon',33,1),('Masking Tape',106,1),('Double Sided Tape',139,1),('Safety Pins',75,1),('Event Tarpaulin - Lysee Prints',500,3),('Stickers - Momo Prints, Naic',75,10)]),('TALENT SHOW MATERIALS',[
 ('Yellow Ribbon (5 cm, 25 yards) - speaker poles',88,2),('Royal Blue Satin (1 yard)',48,2),('Star Cutouts (6x6: 2 pcs; 3x3: 3 pcs)',50,3),('Red Satin (1 yard)',48,2),('Foam Board (A4, 5 mm)',23,9),('Gold Fringes (1 m x 2 m)',29,4)]),('MAINTENANCE FEE',[('PPFM Overtime Fee',1000,1)])]
page(1);y=687
for title,rows in groups[:3]:
 y=section(title,y)
 for name,p,q in rows:y=row(name,p,q,y)
y=section('MATERIALS',y)
for name,p,q in groups[3][1][:4]:y=row(name,p,q,y)
finish();page(2);y=687
for title,rows in [('MATERIALS (CONTINUED)',groups[3][1][4:])]+groups[4:]:
 y=section(title,y)
 for name,p,q in rows:y=row(name,p,q,y)
total=sum(Decimal(str(p))*q for _,rows in groups for _,p,q in rows)
y-=3;rect(y-8,29,'0.12 0.22 0.32');text('GRAND TOTAL',52,y+1,11,'1 1 1');s=money(total);text(s,543-font.width(s,12),y+1,12,'1 1 1');y-=34
notes=['Source: CCS Funds','New listed prizes: ₱2,203.50. Updated/new materials: ₱678.00.',
 'New prize entries are additional; existing ₱679 prize allocations are retained.',
 'Certificate Holder replaces the earlier 21 x ₱47 Certificates/Holder entry.',
 'Blue Ribbon replaces the earlier 1 x ₱75 entry. Other original costing rows remain.',
 'Lights and sounds excluded: cost unconfirmed. Shared CCS Day costs must be',
 'charged only once across NEXT and CCS-SG budgets.',
 'Reference-only items excluded from this total: Champion trophies (2 x ₱300),',
 '1st Runner Up trophies (2 x ₱250), 2nd Runner Up trophies (2 x ₱180),',
 'and Giant Checks (3 x ₱393). Approved package pictures are on page 3.']
for s in notes:text(s,45,y,8);y-=12
y-=8;text('Prepared by:',45,y,9);y-=17
for s in ['Michael C. Baterna - Treasurer','Sean Marik O. Collado - Auditor','Network of Enthusiasts eXploring Technology']:text(s,45,y,8);y-=13

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
objects[pagesid-1]=f'<< /Type /Pages /Count 3 /Kids [{" ".join(f"{p} 0 R" for p in pages)}] >>'.encode();catalog=obj(f'<< /Type /Catalog /Pages {pagesid} 0 R >>')
out=bytearray(b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n');offsets=[0]
for i,b in enumerate(objects,1):offsets.append(len(out));out+=f'{i} 0 obj\n'.encode()+b+b'\nendobj\n'
xref=len(out);out+=f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode()
for n in offsets[1:]:out+=f'{n:010d} 00000 n \n'.encode()
out+=f'trailer\n<< /Size {len(objects)+1} /Root {catalog} 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
(ROOT/'NEXT_Bill_of_Materials_Updated.pdf').write_bytes(out)
assert total==Decimal('17130.50'),total
print('Total:',total,'Pages:',len(pages),'Bytes:',len(out),'Last text y:',y)
