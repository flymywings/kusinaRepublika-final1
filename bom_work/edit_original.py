import sys,io,pathlib
sys.path.insert(0,str(pathlib.Path(__file__).parent/'pdfdeps'))
import pymupdf as fitz
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from decimal import Decimal
R=pathlib.Path(__file__).parent
src=fitz.open(R/'original.pdf');doc=fitz.open(R/'original.pdf')
pdfmetrics.registerFont(TTFont('TNR','C:/Windows/Fonts/times.ttf'))
pdfmetrics.registerFont(TTFont('TNRB','C:/Windows/Fonts/timesbd.ttf'))
BLUE=(.08,.32,.77);PALE=(.79,.85,.95);W,H=596,842
mem=io.BytesIO();c=canvas.Canvas(mem,pagesize=(W,H))
def txt(s,x,y,size=11,bold=False,color=(0,0,0)):
 c.setFont('TNRB' if bold else 'TNR',size);c.setFillColorRGB(*color);c.drawString(x,H-y-size,s)
def wrap(s,width,size=11,bold=False):
 name='TNRB' if bold else 'TNR';lines=[]
 for para in str(s).split('\n'):
  words=para.split();line=''
  for word in words:
   trial=(line+' '+word).strip()
   if pdfmetrics.stringWidth(trial,name,size)>width and line:lines.append(line);line=word
   else:line=trial
  lines.append(line)
 return lines
def box(x,y,w,h,s='',fill=None,size=11,bold=False,color=(0,0,0),align='center'):
 if fill:c.setFillColorRGB(*fill);c.rect(x,H-y-h,w,h,fill=1,stroke=0)
 c.setLineWidth(.45);c.setStrokeColorRGB(.2,.2,.2);c.rect(x,H-y-h,w,h,fill=0,stroke=1)
 lines=wrap(s,w-12,size,bold);top=y+(h-len(lines)*size*1.16)/2
 for i,t in enumerate(lines):
  xx=x+6 if align=='left' else x+(w-pdfmetrics.stringWidth(t,'TNRB' if bold else 'TNR',size))/2
  txt(t,xx,top+i*size*1.16,size,bold,color)
def money(x):return f'\u20b1{Decimal(str(x)):,.2f}'
def band(title,y):box(72,y,452,28,title,PALE,11,True);return y+28
def mainhead(y):
 for x,w,t in [(72,218,'COSTING DESCRIPTION'),(290,88,'PRICE PER UNIT'),(378,50,'QTY.'),(428,96,'TOTAL')]:box(x,y,w,48,t,BLUE,11,True,(1,1,1))
 return y+48
def mainrow(t,p,q,y,h=37):
 for x,w,s in [(72,218,t),(290,88,money(p)),(378,50,str(q)),(428,96,money(Decimal(str(p))*q))]:box(x,y,w,h,s,size=11)
 return y+h
def crop(page,y1,y2):
 p=src[page].get_pixmap(matrix=fitz.Matrix(1.5,1.5),clip=fitz.Rect(391,y1,523,y2),alpha=False)
 return p.tobytes('png')
def pic(data,x,y,w,h):
 c.drawImage(ImageReader(io.BytesIO(data)),x,H-y-h,width=w,height=h,preserveAspectRatio=True,anchor='c',mask='auto')
def refhead(title,y=80):
 box(72,y,452,30,title,BLUE,12,True,(1,1,1));y+=30
 for x,w,t in [(72,146,'Particular'),(218,41,'Qty.'),(259,70,'Price'),(329,66,'Total'),(395,129,'Reference')]:box(x,y,w,34,t,PALE,11,True)
 return y+34
def refrow(t,p,q,y,h,img=None):
 for x,w,s in [(72,146,t),(218,41,str(q)),(259,70,money(p)),(329,66,money(Decimal(str(p))*q))]:box(x,y,w,h,s,size=10.5)
 box(395,y,129,h,'' if img else 'Picture pending approval',size=9)
 if img:pic(img,399,y+5,121,h-10)
 return y+h
def done():c.showPage()
prizes=[('Talent Show Special Awards',679,6),('n8n Workshop Prizes',679,5),('Noche Buena Package A\nRoyal Spaghetti Bundle',135,3),('Noche Buena Package B\nWhite King Spaghetti Bundle',132,3),('Noche Buena Package C\nDel Monte Weekend Merienda Combo (500 g + 400 g)',87,4)]
consol=[('Pancit Canton Pack - Chili Mansi',88,2),('Pancit Canton Pack - Calamansi',88,2),('Pancit Canton Pack - Hot Chili',88,2),('C2 Tea Apple Pack',87.75,6)]
design=[('A4 Bond Paper - Hard Copy',285,1),('Usher Sashes',300,6),('Lei',284,1)]
materials=[('Masking Tape',106,1),('Double Sided Tape',139,1),('Safety Pins',75,1),('Blue Ribbon',33,1),('Event Tarpaulin - Lysee Prints',500,3),('Stickers - Momo Prints, Naic',75,10),('Ball Smile',100,1),('Foam Board - Black',187,2),('Certificate Holder',57,3)]
talent=[('Yellow Ribbon (5 cm, 25 yards)\nSpeaker pole wrap',88,2),('Royal Blue Satin (1 yard)',48,2),('Star Cutouts (6x6: 2 pcs; 3x3: 3 pcs)\nGlitter/stars only',50,3),('Red Satin (1 yard)',48,2),('Foam Board (A4, 5 mm)',23,9),('Gold Fringes (1 m x 2 m)',29,4)]
total=sum(Decimal(str(p))*q for rows in [prizes,consol,design,materials,talent,[('',1000,1)]] for _,p,q in rows);assert total==Decimal('17130.50')
# Original page 1: keep the full NEXT letterhead and original section title.
y=mainhead(190);y=band('GAMES & ACTIVITIES PRIZES',y)
for t,p,q in prizes:y=mainrow(t,p,q,y,47)
y=band('CONSOLATION PRIZES',y)
for t,p,q in consol:y=mainrow(t,p,q,y,38)
done()
y=mainhead(80);y=band('DESIGN',y)
for t,p,q in design:y=mainrow(t,p,q,y)
y=band('MATERIALS',y)
for t,p,q in materials:y=mainrow(t,p,q,y)
done()
y=mainhead(80);y=band('TALENT SHOW MATERIALS',y)
for t,p,q in talent:y=mainrow(t,p,q,y,58)
box(72,y,356,32,'TALENT SHOW MATERIALS SUBTOTAL:',PALE,11,True);box(428,y,96,32,money(841),PALE,11,True)
txt('Maintenance fee and grand total are continued on the next page.',90,y+52,11)
done()
y=mainhead(80);y=band('MAINTENANCE FEE',y);y=mainrow('PPFM Overtime Fee',1000,1,y,48)
box(72,y,356,40,'GRAND TOTAL:',BLUE,12,True,(1,1,1));box(428,y,96,40,money(total),BLUE,12,True,(1,1,1));y+=63
txt('Source: CCS Funds',72,y,12);y+=28;txt('Note:',72,y,12,True);y+=22
notes=[f'The total cost of all currently priced costing items is {money(total)}, including the {money(1000)} PPFM overtime fee but excluding the lights-and-sounds system, whose cost remains subject to confirmation.',
 'The lights-and-sounds system and PPFM overtime fee are shared CCS Day expenses and must be charged only once across the NEXT and CCS-SG budgets. The final total will be adjusted after confirming the remaining cost and allocation of shared expenses.',
 'The original Talent Show Special Awards and n8n Workshop Prizes allocations are retained. The new packages and consolation prizes are additional. Certificate Holder and Blue Ribbon use the updated quantities and prices.',
 'Trophies and giant checks appear in the original References section only and are excluded from the costing total.']
for paragraph in notes:
 for t in wrap(paragraph,452,11):txt(t,72,y,11);y+=14
 y+=10
y+=7;txt('Prepared by:',72,y,12,True);y+=33
for name,role in [('Michael C. Baterna','Treasurer'),('Sean Marik O. Collado','Auditor')]:
 txt(name,72,y,12,True);y+=18;txt(role+', Network of Enthusiasts eXploring Technology',72,y,11);y+=37
done()
# Original reference images are retained in the original blue table style.
txt('A. References',90,80,12,True);y=refhead('GAMES & ACTIVITIES PRIZES',110)
for t,p,q,img in [('HACKNEXT & Talent Show Champion Trophies (Acrylic)',300,2,crop(5,595,774)),('HACKNEXT & Talent Show 1st Runner Up Trophies (Acrylic)',250,2,crop(6,82,247)),('HACKNEXT & Talent Show 2nd Runner Up Trophies (Acrylic)',180,2,crop(6,254,419)),('Giant Check',393,3,crop(8,199,315))]:y=refrow(t,p,q,y,142,img)
done()
y=refhead('NOCHE BUENA PACKAGES')
for i,(t,p,q) in enumerate(prizes[2:]):y=refrow(t,p,q,y,195,(R/f'package_{"abc"[i]}.jpg').read_bytes())
txt('Approved product pictures. Prices and quantities follow the supplied receipt.',72,y+14,10)
done()
y=refhead('GAMES & ACTIVITIES PRIZES')
for t,p,q,img in [(prizes[0][0],679,6,crop(6,427,594)),(prizes[1][0],679,5,crop(6,597,770))]:y=refrow(t,p,q,y,135,img)
y=band('CONSOLATION PRIZES',y)
for t,p,q in consol:y=refrow(t,p,q,y,74)
done()
y=refhead('DESIGN')
for (t,p,q),img in zip(design,[crop(7,185,332),crop(7,520,675),crop(8,78,196)]):y=refrow(t,p,q,y,185,img)
done()
y=refhead('MATERIALS')
for (t,p,q),img in zip(materials[:6],[crop(8,373,515),crop(9,83,202),crop(8,517,698),crop(9,205,324),crop(9,327,459),crop(9,461,572)]):y=refrow(t,p,q,y,99,img)
done()
y=refhead('MATERIALS (CONTINUED)')
for t,p,q in materials[6:]:y=refrow(t,p,q,y,160)
txt('New material reference pictures await approval.',72,y+20,11)
done()
# Pages 11 and 12 keep all original talent-show references.
done();done();done();c.save();overlay=fitz.open(stream=mem.getvalue(),filetype='pdf')
for i in range(10):
 p=doc[i];p.add_redact_annot(fitz.Rect(65,180 if i==0 else 70,535,785),fill=(1,1,1));p.apply_redactions();p.show_pdf_page(p.rect,overlay,i)
# Flatten the original talent reference bodies to retain their exact appearance,
# removing the old hidden duplicate costing layers present in the supplied PDF.
for i in [10,11]:
 p=doc[i];rect=fitz.Rect(65,70,535,785);img=src[i].get_pixmap(matrix=fitz.Matrix(2,2),clip=rect,alpha=False).tobytes('png');p.add_redact_annot(rect,fill=(1,1,1));p.apply_redactions();p.insert_image(rect,stream=img)
# Original supplier page, invoice and original page numbering remain in place.
p=doc[12]
for r in p.search_for('\u20b129,268.00'):p.add_redact_annot(r+(-3,-2,3,2),fill=BLUE)
p.apply_redactions();p.insert_font(fontname='TNRB',fontfile='C:/Windows/Fonts/timesbd.ttf');p.insert_text((420,169),money(total),fontname='TNRB',fontsize=12,color=(1,1,1))
out=R/'NEXT_Bill_of_Materials_Edited.pdf';doc.save(out,garbage=4,deflate=True)
for i in [0,3,5,9,12]:doc[i].get_pixmap(matrix=fitz.Matrix(1,1)).save(R/f'edited_page_{i+1}.png')
alltext='\n'.join(p.get_text() for p in doc)
assert len(doc)==13
for removed in ['Jollibee','Bottled Water','Judges\u2019 Buzzers','Golden Buzzer','Champion Cash Prize']:assert removed not in alltext,removed
assert '\u20b117,130.50' in alltext
print(out);print('Verified 13 original pages, requested removals, and total',total)
