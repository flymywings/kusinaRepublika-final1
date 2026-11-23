"""Original cue score using the supplied kit's synths; supplied voice timing stays intact."""
import ast, json, subprocess, wave
from pathlib import Path
import numpy as np

root=Path(__file__).parent.resolve(); project=root.parent
SR=48000; DUR=952/30; N=round(DUR*SR)
kit=project/'cartoon-short-kit/cartoon-short-kit/example/soldier/audio.py'
tree=ast.parse(kit.read_text())
namespace={'np':np,'subprocess':subprocess,'wave':wave,'SR':SR,'DUR':DUR,'N':N,'rng':np.random.default_rng(1872),'midi':lambda m:440*2**((m-69)/12)}
exec(compile(ast.Module(body=[node for node in tree.body if isinstance(node,ast.FunctionDef)],type_ignores=[]),str(kit),'exec'),namespace)
pluck,brass,thunk,ting,scrape,whoosh=[namespace[k] for k in ['pluck','brass','thunk','ting','scrape','whoosh']]
rng=np.random.default_rng(1872)
voice_raw=subprocess.run(['ffmpeg','-v','error','-i',str(root/'public/narration.mp3'),'-ar',str(SR),'-ac','1','-f','f32le','-'],capture_output=True,check=True).stdout
raw=np.frombuffer(voice_raw,np.float32); voice=np.zeros(N,np.float32); voice[:min(N,len(raw))]=raw[:N]
music=np.zeros(N,np.float32); fx=np.zeros((N,2),np.float32); cues=[]
def place(buf,signal,start,gain=1):
 i=round(start*SR); j=min(N,i+len(signal))
 if i>=0 and j>i:buf[i:j]+=signal[:j-i]*gain
def effect(signal,t,label,peak=.24,pan=0):
 signal=signal/(np.max(np.abs(signal))+1e-8)*peak*max(.25,float(np.max(np.abs(voice))))
 stereo=np.stack([signal*np.sqrt((1-pan)/2),signal*np.sqrt((1+pan)/2)],axis=1)
 place(fx,stereo,t);cues.append({'time':t,'cue':label,'relative_voice_peak':peak})
beat=60/112; notes=[62,65,69,67,65,62,61,57]
for i in range(int(DUR/beat)+1):
 t=i*beat
 if t>30.6: continue
 investigating=18.48<=t<24.64
 bass=[50,46,43,45][(i//8)%4]
 place(music,pluck(namespace['midi'](bass),.55,.30),t,.60)
 if not investigating:
  place(music,pluck(namespace['midi'](notes[i%8]),.32,.56),t+beat*.5,.24)
  if i%4==0:place(music,brass([namespace['midi'](bass+12),namespace['midi'](bass+19)],.55),t,.035)
 else:
  if i%2==0:place(music,pluck(namespace['midi'](bass+12),.8,.25),t,.12)
# Every accent belongs to a visible action or phrase; no generic opening hit.
effect(scrape(.22),.28,'sleeve and reach',.13,-.18)
effect(thunk(108,.16),1.12,'weight of the claim payment',.28,-.12)
effect(ting()*.75,3.97,'real stone catches light',.20,.10)
effect(whoosh(.22),4.63,'Colorado setting transition',.05)
effect(scrape(.16),7.70,'fingers examine rough stone',.14,-.18)
effect(ting()*.75,9.15,'ruby pickup',.24,.25)
effect(scrape(.21),11.42,'expert opens notebook',.17,-.1)
effect(thunk(325,.08),12.30,'hand lens settles',.14)
effect(pluck(659,.22,.4),13.13,'expert approval',.20)
effect(whoosh(.22),14.16,'payment transition',.06)
effect(scrape(.27),14.88,'claim paper and payment',.24,.1)
effect(thunk(110,.20),15.96,'payment received',.34,-.2)
for i,t0 in enumerate([17.08,17.45,17.83,18.18]):effect(thunk(120+i%2*24,.13),t0,'sellers leave with money',.13,-.22)
effect(whoosh(.23),18.47,'investigation transition',.07)
effect(scrape(.22),19.77,'investigator examines surface',.16,-.15)
effect(pluck(493.88,.26,.4),21.07,'disturbed soil clue',.19)
for t0 in [22.45,22.95,23.40]:effect(scrape(.30)+thunk(145,.30)*.22,t0,'soil lifted from test pit',.25,-.1)
effect(pluck(146.83,.55,.4),23.72,'empty deeper soil',.18)
effect(whoosh(.28),24.65,'earlier London transition',.07)
effect(scrape(.19),25.26,'merchant parcel opens',.20)
effect(thunk(210,.12),25.86,'money crosses counter',.21,.15)
effect(ting()*.6,26.28,'purchased stones in pouch',.23,-.1)
effect(whoosh(.19),27.17,'match pouch into planting',.06)
effect(scrape(.15),27.49,'fingers press stone into soil',.22,-.1)
effect(thunk(140,.11),27.76,'planted stone seats',.17)
effect(whoosh(.18),28.01,'return to exposed claim',.05)
effect(pluck(220,.26,.42),31.10,'ironic payoff first note',.20)
effect(pluck(164.81,.22,.4),31.34,'ironic payoff settles',.13)
effect(pluck(523,.20,.4),1.70,'first private glance',.06,-.2)
effect(pluck(523,.20,.4),16.35,'recognition of secured payment',.06,-.2)
t=np.arange(N)/SR
wind=namespace['lp_fast'](rng.normal(0,1,N).astype(np.float32),420)*.0015*(.75+.25*np.sin(t*.7))
field_mask=(((t>=4.5667)&(t<14.1667))|((t>=18.4667)&(t<24.6667))|((t>=27)&(t<29.6667))).astype(np.float32)
fx+=np.stack([wind,wind*.94],axis=1)*field_mask[:,None]
active=voice[np.abs(voice)>.012]; voice_rms=float(np.sqrt(np.mean(active**2)))
music*=voice_rms*.23/(float(np.sqrt(np.mean(music**2)))+1e-8)
blocks=np.pad(voice,(0,(-N)%480)).reshape(-1,480)
level=np.sqrt(np.mean(blocks**2,axis=1)); gate=np.clip(level/(voice_rms*.5+1e-8),0,1)
duck=np.interp(np.arange(N),np.arange(len(gate))*480,1-.40*gate).astype(np.float32)
music*=duck
music*=np.where((t>=22.32)&(t<24.64),.35,1)
music*=np.interp(t,[0,17.98,18.23,18.48,18.80,DUR],[1,1,.22,.35,.70,.70])
music*=np.minimum(1,np.maximum(0,(31.55-t)/.28))
tail=np.sin(2*np.pi*73.4*t)*.0004*(t>=28.0)
music+=tail
fade=np.minimum(1,t/.04)*np.minimum(1,(DUR-t)/.035)
bed=np.stack([music*.97,music],axis=1)+fx
mixed=(np.stack([voice,voice],axis=1)+bed)*fade[:,None]
gain=min(1,.94/(np.max(np.abs(mixed))+1e-8));mixed*=gain
def write(name,data):
 with wave.open(str(root/name),'wb') as out:
  out.setnchannels(1 if data.ndim==1 else data.shape[1]);out.setsampwidth(2);out.setframerate(SR);out.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
write('music.wav',music);write('effects.wav',fx);write('mix.wav',mixed)
(root/'sound-cues.json').write_text(json.dumps(cues,indent=2))
print(f'{len(cues)} cues; {DUR:.3f}s stereo mix; voice timing unchanged; peak {20*np.log10(np.max(np.abs(mixed))):.2f} dBFS')
