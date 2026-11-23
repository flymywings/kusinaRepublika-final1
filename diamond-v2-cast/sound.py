"""Original cue score using the supplied kit's synths; supplied voice timing stays intact."""
import ast, json, subprocess, wave
from pathlib import Path
import numpy as np

root=Path(__file__).parent.resolve(); project=root.parent
SR=48000; DUR=981/30; N=round(DUR*SR)
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
beat=60/105; notes=[62,65,69,67,65,62,61,57]
for i in range(int(DUR/beat)+1):
 t=i*beat
 if t>29.2: continue
 investigating=19.44<=t<25.86
 bass=[50,46,43,45][(i//8)%4]
 place(music,pluck(namespace['midi'](bass),.55,.30),t,.60)
 if not investigating:
  place(music,pluck(namespace['midi'](notes[i%8]),.32,.56),t+beat*.5,.24)
  if i%4==0:place(music,brass([namespace['midi'](bass+12),namespace['midi'](bass+19)],.55),t,.035)
 else:
  if i%2==0:place(music,pluck(namespace['midi'](bass+12),.8,.25),t,.12)
effect(scrape(.55),1.8,'fingers scrape disturbed soil',.19,-.15)
effect(thunk(175,.18),2.65,'stone settles into earth',.16,-.1)
for i,t in enumerate(np.arange(4.7,8.3,.49)):effect(thunk(125+i%2*25,.17),float(t),'boots on dry trail',.10,(-1)**i*.25)
effect(ting()*.8,9.70,'diamond lifts into hand',.29,-.15)
effect(ting(),10.87,'ruby discovery',.24,.23)
effect(scrape(.17),13.10,'notebook and hand lens',.13,-.25)
effect(thunk(240,.15),14.65,'confident inspection accent',.14)
effect(whoosh(.26),15.65,'transaction-room handoff',.10)
effect(scrape(.25),16.45,'payment paper and cloth',.18,.12)
effect(thunk(105,.23),17.8,'money bag received',.30,-.25)
effect(thunk(170,.15),20.15,'investigator stops',.14)
effect(scrape(.30),21.15,'kneeling on grit',.13,-.25)
effect(pluck(659,.45,.45),22.45,'first evidence accent',.17)
effect(pluck(523,.50,.42),24.15,'comparison resolves',.17,.2)
effect(whoosh(.25),25.85,'London flashback',.10)
effect(ting(),27.50,'stones purchased across counter',.22)
effect(scrape(.18),28.25,'merchant parcel and pouch',.16,-.15)
effect(pluck(146.83,.8,.4),29.24,'score withdraws for reversal',.15)
effect(whoosh(.5),30.55,'soft transition carries the reversal pause',.11,.1)
effect(thunk(83,.32)+pluck(164.81,.32,.4),31.86,'dry investors payoff',.24)
t=np.arange(N)/SR
wind=namespace['lp_fast'](rng.normal(0,1,N).astype(np.float32),420)*.0015*(.75+.25*np.sin(t*.7))
field_mask=((t<15.72)|((t>=19.6)&(t<25.86))|((t>=29.2)&(t<30.87))).astype(np.float32)
fx+=np.stack([wind,wind*.94],axis=1)*field_mask[:,None]
active=voice[np.abs(voice)>.012]; voice_rms=float(np.sqrt(np.mean(active**2)))
music*=voice_rms*.17/(float(np.sqrt(np.mean(music**2)))+1e-8)
blocks=np.pad(voice,(0,(-N)%480)).reshape(-1,480)
level=np.sqrt(np.mean(blocks**2,axis=1)); gate=np.clip(level/(voice_rms*.5+1e-8),0,1)
duck=np.interp(np.arange(N),np.arange(len(gate))*480,1-.40*gate).astype(np.float32)
music*=duck
music*=np.minimum(1,np.maximum(0,(29.3-t)/.18))
tail=np.sin(2*np.pi*73.4*t)*.0007*(t>=29.2)
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
