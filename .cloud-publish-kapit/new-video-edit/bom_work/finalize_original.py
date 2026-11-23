from pathlib import Path
R=Path(__file__).parent
prefix=(R/'edit_original.py').read_text(encoding='utf-8').split('prizes=')[0]
exec(compile(prefix,'original_pdf_helpers','exec'))
from PIL import Image
for f in R.glob('ref_*.img'):
 im=Image.open(f).convert('RGB');im.save(f.with_suffix('.png'))
prizes=[('Noche Buena Package A\nRoyal Spaghetti Bundle',135,3),('Noche Buena Package B\nWhite King Spaghetti Bundle',132,3),('Noche Buena Package C\nDel Monte Weekend Merienda Combo (500 g + 400 g)',87,4)]
consol=[('Pancit Canton Pack - Chili Mansi',88,2),('Pancit Canton Pack - Calamansi',88,2),('Pancit Canton Pack - Hot Chili',88,2),('C2 Tea Apple Pack',87.75,6)]
materials=[('Blue Ribbon',33,1),('Event Tarpaulin - Lysee Prints',500,3),('Stickers - Momo Prints, Naic',75,10),('Ball Smile',100,1),('Foam Board - Black',187,2),('Certificate Holder',57,3)]
total=sum(Decimal(str(p))*q for rows in [prizes,consol,materials,[('',1000,1)]] for _,p,q in rows)
assert total==Decimal('6131.50')
y=mainhead(190);y=band('GAMES & ACTIVITIES PRIZES',y)
for t,p,q in prizes:y=mainrow(t,p,q,y,55)
y=band('CONSOLATION PRIZES',y)
for t,p,q in consol:y=mainrow(t,p,q,y,43)
done()
y=mainhead(80);y=band('MATERIALS',y)
for t,p,q in materials:y=mainrow(t,p,q,y,37)
y=band('MAINTENANCE FEE',y);y=mainrow('PPFM Overtime Fee',1000,1,y,37)
box(72,y,356,40,'GRAND TOTAL:',BLUE,12,True,(1,1,1));box(428,y,96,40,money(total),BLUE,12,True,(1,1,1));y+=59
txt('Source: CCS Funds',72,y,12);y+=27;txt('Note:',72,y,12,True);y+=20
notes=[f'The total of currently priced costing items is {money(total)}, including the {money(1000)} PPFM overtime fee. Lights and sounds remain excluded because the cost is unconfirmed.',
 'Shared CCS Day expenses must be charged only once across the NEXT and CCS-SG budgets. The final total is subject to confirmation of the remaining shared cost allocation.',
 'Giant checks remain in References only and are excluded from the costing total.']
for paragraph in notes:
 for t in wrap(paragraph,452,11):txt(t,72,y,11);y+=14
 y+=7
txt('Prepared by:',72,y+2,12,True);y+=30
for name,role in [('Michael C. Baterna','Treasurer'),('Sean Marik O. Collado','Auditor')]:
 txt(name,72,y,12,True);y+=17;txt(role+', Network of Enthusiasts eXploring Technology',72,y,11);y+=29
assert y<787,y
done()
txt('A. References',90,80,12,True);y=refhead('NOCHE BUENA PACKAGES',110)
for i,(t,p,q) in enumerate(prizes):y=refrow(t,p,q,y,190,(R/f'package_{"abc"[i]}.jpg').read_bytes())
done()
y=refhead('CONSOLATION PRIZES')
for (t,p,q),name in zip(consol,['chilimansi','calamansi','hotchili','c2']):y=refrow(t,p,q,y,150,(R/f'ref_{name}.png').read_bytes())
done()
y=refhead('MATERIALS')
for (t,p,q),img in zip(materials[:3],[(R/'ref_ribbon.png').read_bytes(),crop(9,327,459),crop(9,461,572)]):y=refrow(t,p,q,y,185,img)
done()
y=refhead('MATERIALS (CONTINUED)')
for (t,p,q),name in zip(materials[3:],['ball','blackboard','holder']):y=refrow(t,p,q,y,145,(R/f'ref_{name}.png').read_bytes())
y=band('OTHER REFERENCES - EXCLUDED FROM COSTING',y)
y=refrow('Giant Check',393,3,y,115,crop(8,199,315))
done();done();c.save();overlay=fitz.open(stream=mem.getvalue(),filetype='pdf')
# Keep the original letterhead and supplier page; remove pages emptied by deletions.
doc=fitz.open()
for i in [0,1,5,6,9,9,12]:doc.insert_pdf(src,from_page=i,to_page=i)
for i in range(6):
 p=doc[i];p.add_redact_annot(fitz.Rect(65,180 if i==0 else 70,535,785),fill=(1,1,1));p.apply_redactions();p.show_pdf_page(p.rect,overlay,i)
p=doc[6]
for r in p.search_for('\u20b129,268.00'):p.add_redact_annot(r+(-3,-2,3,2),fill=BLUE)
p.apply_redactions();p.insert_font(fontname='TNRB',fontfile='C:/Windows/Fonts/timesbd.ttf');p.insert_text((420,169),money(total),fontname='TNRB',fontsize=12,color=(1,1,1))
for i,p in enumerate(doc):
 p.add_redact_annot(fitz.Rect(230,787,365,816),fill=(1,1,1));p.apply_redactions();p.insert_textbox(fitz.Rect(230,793,365,813),f'Page {i+1} of {len(doc)}',fontname='tiro',fontsize=9,align=1)
out=R/'NEXT_Bill_of_Materials_Edited.pdf';doc.save(out,garbage=4,deflate=True)
alltext='\n'.join(p.get_text() for p in doc)
for removed in ['Talent Show Special Awards','n8n Workshop Prizes','Usher Sashes','Bond Paper','Masking Tape','Double Sided Tape','Safety Pins','Yellow Ribbon','Royal Blue Satin','Star Cutouts','Red Satin','Foam Board (A4','Gold Fringes','Trophies','679.00','17,130.50','29,268.00']:
 assert removed not in alltext,removed
for kept in ['Royal Spaghetti Bundle','White King Spaghetti Bundle','Del Monte','Chili Mansi','Calamansi','Hot Chili','C2 Tea Apple Pack','Blue Ribbon','Certificate Holder','Giant Check','6,131.50']:assert kept in alltext,kept
thumb=Image.new('RGB',(3*300,3*440),'white')
from PIL import ImageDraw
d=ImageDraw.Draw(thumb)
for i,p in enumerate(doc):
 pix=p.get_pixmap(matrix=fitz.Matrix(.5,.5));im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples);thumb.paste(im,(i%3*300,i//3*440+15));d.text((i%3*300,i//3*440),str(i+1),fill='black')
thumb.save(R/'final_contact.png');print('Verified',len(doc),'pages; total',total)
