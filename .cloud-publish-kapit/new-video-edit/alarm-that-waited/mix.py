from pathlib import Path
import json
import subprocess as sp
import sys

import numpy as np

ROOT = Path(__file__).resolve().parent
PROOF = ROOT / "proof"
TIMING = json.loads((ROOT / "timing.json").read_text())
STORY = json.loads((ROOT / "story.json").read_text())
RATE = 48000
FPS = TIMING["fps"]
RNG = np.random.default_rng(504)
LINES = {
    "hook": "A thief robbed a jeweler with a cube of ice.",
    "clue": "All he found was a puddle under the display.",
    "wedge": "The thief had wedged ice above the plate to hold it down.",
    "take": "He took the diamond and walked out.",
    "payoff": "The ice rang the bell for him.",
}


def clock(seconds):
    return np.arange(round(seconds * RATE)) / RATE


def attack(t, seconds=.009):
    return np.minimum(t / seconds, 1)


def tone(seconds, partials):
    t = clock(seconds)
    return attack(t, .003) * sum(gain * np.sin(2*np.pi*hz*t) * np.exp(-decay*t)
                                 for hz, gain, decay in partials)


def noise(seconds, stride=5, decay=12):
    t = clock(seconds)
    white = RNG.standard_normal(len(t))
    smooth = np.convolve(white, np.ones(stride)/stride, mode="same")
    return smooth * attack(t) * np.exp(-t*decay)


def score(sample_count):
    """Original plucked cue with a busier rhythm during the chase."""
    track=np.zeros((sample_count,2),dtype=np.float32)
    beat=60/112
    progressions={
        50:[62,69,65,72,69,65,64,57],
        53:[65,69,72,77,74,72,69,65],
        48:[60,67,63,70,67,63,62,55],
        45:[57,64,60,67,64,60,59,52],
    }

    def add(second,midi,level,pan,bass=False):
        start=round(second*RATE)
        hz=440*2**((midi-69)/12)
        partials=[(hz,1,8),(hz*2,.29,17),(hz*3,.14,24)] if bass else [
            (hz,1,11),(hz*2,.42,21),(hz*3,.19,33),(hz*4,.07,39)]
        sound=tone(.44,partials)*level
        count=min(len(sound),sample_count-start)
        if count>0:
            track[start:start+count] += sound[:count,None]*np.array([1-pan,1+pan])

    stop=STORY["plateRelease"]/FPS
    for bar,root in enumerate([50,50,53,53,48,48,45,45,50,50,53,53]):
        start=bar*beat*4
        if start>=stop:
            break
        chase=STORY["entrance"]/FPS <= start < STORY["flashback"]/FPS
        for step,note in enumerate(progressions[root]):
            if chase or step not in (3,7):
                add(start+step*beat/2,note,.077 if chase else .061,(-1)**step*.24)
        add(start,root-12,.105,-.11,True)
        add(start+2*beat,root-5,.082,.09,True)
    track*=np.clip((stop-clock(sample_count/RATE))/.38,0,1)[:,None]
    for midi,pan in [(50,-.16),(57,.18),(62,0)]:
        add((STORY["bellHit"]+11)/FPS,midi,.037,pan)
    return track


def voice(key, duration):
    speech = f"flite=voice=slt:text='{LINES[key]}'"
    raw = sp.check_output(["ffmpeg","-v","error","-f","lavfi","-i",speech,
        "-f","f32le","-ar",str(RATE),"-ac","1","pipe:1"])
    pcm = np.frombuffer(raw, dtype="<f4")
    active = np.flatnonzero(np.abs(pcm) > .012)
    pcm = pcm[max(0, active[0]-480):active[-1]+960].copy()
    tempo = len(pcm) / RATE / duration
    raw = sp.check_output(["ffmpeg","-v","error","-f","f32le","-ar",str(RATE),"-ac","1","-i","pipe:0",
        "-af",f"atempo={tempo:.6f},highpass=f=80","-f","f32le","pipe:1"], input=pcm.tobytes())
    pcm = np.frombuffer(raw,dtype="<f4")
    return pcm * (.58 / max(.01,np.max(np.abs(pcm))))


def build(name):
    full_edit = name in ("full","actioncut","casecut")
    frames = STORY["frames"] if full_edit else TIMING[f"{name}Frames"]
    t = clock(frames / FPS)
    audio = np.zeros((len(t),2),dtype=np.float32)

    def place(frame, signal, gain=1, pan=0):
        start = round(frame/FPS*RATE)
        end = min(len(audio), start+len(signal))
        if end>start:
            audio[start:end] += signal[:end-start,None]*np.array([1-pan,1+pan])*gain

    room = (.004*np.sin(t*2*np.pi*76) + .0017*np.sin(t*2*np.pi*116.6) +
            .008*np.convolve(RNG.standard_normal(len(t)),np.ones(30)/30,mode="same"))
    place(0,room)
    cloth = noise(.29, 13, 7)
    rub = noise(.17, 5, 15)
    if full_edit:
        raw = sp.check_output(["ffmpeg","-v","error","-i",str(ROOT/"narration.mp3"),"-af",
            f"atrim=start={STORY['trim']}:end={STORY['voiceEnd']},asetpts=PTS-STARTPTS,"
            f"atempo={STORY['tempo']},highpass=f=72,acompressor=threshold=.10:ratio=2.7:attack=8:release=80",
            "-f","f32le","-ar",str(RATE),"-ac","1","pipe:1"])
        narration = np.frombuffer(raw,dtype="<f4").copy()
        narration *= .64/max(.01,np.max(np.abs(narration)))
        cues = STORY
        if name!="casecut":
            for frame,note in [(0,147),(46,175),(cues["setup"],131),(cues["demoLift"],156),
                               (cues["entrance"],110),(cues["guardClose"],117),(cues["guardPuddle"],98),
                               (cues["flashback"],131),(cues["escape"],110),(cues["melt"],98)]:
                place(frame,tone(1.6,[(note,.21,2.1),(note*2,.045,4),(note*3,.018,7)]),.16,-.12)
        lift_start=26 if name=="casecut" else TIMING["hookLiftStart"]
        for frame,gain,pan in [(6,.10,-.22),(lift_start,.11,-.13),(51,.13,-.37),
                               (cues["demoLift"]+12,.09,-.21),(cues["guardPlate"],.13,.05),
                               (cues["diamondLift"],.14,-.16),(cues["thiefLeaves"],.14,-.39)]:
            place(frame,cloth if frame in (6,51,cues["guardPlate"],cues["thiefLeaves"]) else rub,gain,pan)
        boot = tone(.15,[(83,.45,25),(162,.16,33)])+noise(.15,6,23)*.32
        for offset,gain,pan in [(7,.14,.55),(14,.17,.40),(22,.16,-.36),(29,.16,.31),
                                (36,.14,-.24),(46,.19,.19),(57,.15,.10),(65,.21,.06)]:
            place(cues["entranceRing"]+offset,boot,gain,pan)
        if name in ("actioncut","casecut"):
            latch = tone(.12,[(335,.31,24),(970,.28,48)]) + noise(.12,4,27)*.40
            place(cues["entranceRing"]-5,latch,.19,.48)
            place(cues["entranceRing"]+6,noise(.28,7,8),.16,.43)
            place(cues["demoRelease"]+1,tone(.13,[(185,.28,23),(714,.24,44)]),.17,-.19)
        if name=="casecut":
            place(8,tone(.10,[(570,.41,30),(1460,.24,49)])+noise(.10,5,24)*.23,.21,-.23)
            place(19,tone(.12,[(285,.31,23),(688,.16,39)]),.13,-.21)
            place(cues["flashback"]+14,noise(.22,7,12),.17,-.34)
        place(cues["guardClose"]+16,rub,.14,.05)
        place(cues["guardPuddle"]+3,noise(.25,17,8),.09,.03)
        place(cues["iceContact"],tone(.14,[(670,.48,29),(1370,.38,44)]),.24,.21)
        drip = clock(.20)
        droplet = np.sin(2*np.pi*(610*drip+1700*drip**2))*attack(drip,.003)*np.exp(-31*drip)
        place(cues["finalDrip"]-18,droplet,.11,.16)
        place(cues["plateRelease"],droplet,.24,.18)
        bell = tone(1.95,[(715,.24,2.1),(1367,.52,2.7),(1880,.17,3.9),(2587,.19,6),(3520,.09,7)])
        for frame,gain in [(cues["demoRing"],.19),(cues["entranceRing"],.30),(cues["bellHit"],.41)]:
            place(frame,bell,gain,.27)
        place(cues["plateRelease"],noise(.12,2,55),.23,.06)
        place(cues["plateRelease"]+2,tone(.19,[(230,.45,22),(1130,.39,48),(2240,.15,35)]),.27,.06)
        # Smooth the voice envelope before ducking the room and effects.
        voice_track=np.zeros(len(t),dtype=np.float32)
        voice_track[:len(narration)] = narration
        block=RATE//120
        levels=np.max(np.abs(voice_track.reshape(-1,block)),axis=1)
        envelope=np.convolve(np.minimum(1,levels/.12),np.ones(11)/11,mode="same")
        speech_activity=np.repeat(envelope,block)[:,None]
        audio *= 1-.28*speech_activity
        if name=="casecut":
            audio += 1.25*score(len(t))*(1-.47*speech_activity)
        audio += voice_track[:,None]
    elif name=="hook":
        place(1,voice("hook",2.16))
        place(3,cloth,.15,-.28)
        place(TIMING["hookLiftStart"],rub,.13,-.14)
        place(47,noise(.21, 15, 8),.13,-.39)
    else:
        place(1,voice("clue",1.98))
        place(72,voice("wedge",2.85))
        place(159,voice("take",1.82))
        place(TIMING["payoffStarts"],voice("payoff",1.82))
        for frame,note in [(2,148),(27,166),(52,175),(75,148),(105,132),(144,139),(175,111)]:
            place(frame,tone(.67,[(note,.14,5),(note*2,.031,8),(note*3,.01,10)]),.13,-.12)
        for frame,gain,pan in [(2,.12,.38),(9,.13,.22),(TIMING["guardBrakes"],.21,.06),(25,.08,-.27)]:
            step = tone(.14,[(81,.44,30),(155,.17,37)]) + noise(.14,7,25)*.26
            place(frame,step,gain,pan)
        place(TIMING["guardBrakes"],rub,.09,.08)
        place(TIMING["guardNoticesPlate"],cloth,.11,.04)
        place(TIMING["guardNoticesPuddle"]+3,noise(.24,16,7),.09,.02)
        place(80,cloth,.12,.35)
        place(TIMING["iceContacts"],tone(.14,[(670,.48,29),(1370,.38,44)]),.19,.18)
        place(153,rub,.14,-.12)
        place(191,cloth,.14,-.43)
        drop = clock(.20)
        ripple = np.sin(2*np.pi*(610*drop+1700*drop**2))*attack(drop,.003)*np.exp(-31*drop)
        place(209,ripple,.095,.18)
        place(TIMING["finalDrip"]+7,ripple,.24,.18)
        place(TIMING["plateReleases"],noise(.12,2,55),.20,.05)
        place(TIMING["plateReleases"]+2,tone(.19,[(230,.45,22),(1130,.39,48),(2240,.15,35)]),.25,.05)
        bell = tone(1.95,[(715,.24,2.1),(1367,.52,2.7),(1880,.17,3.9),(2587,.19,6),(3520,.09,7)])
        place(TIMING["bellSounds"],bell,.38,.28)
        place(TIMING["bellSounds"]+3,bell,.055,-.36)
    audio *= np.clip((len(t)-np.arange(len(t)))/900,0,1)[:,None]
    picture=PROOF/f"{'actioncut' if name=='casecut' else name}-picture.mp4"
    output = {
        "full": ROOT/"The Alarm That Waited.mp4",
        "actioncut": ROOT/"The Alarm That Waited - Action Cut.mp4",
        "casecut": ROOT/"The Alarm That Waited - Hallway Cut.mp4",
    }.get(name, PROOF/f"{name}.mp4")
    video_args = ["-c:v","copy"]
    if name == "casecut":
        curve = "0/0 .12/.085 .25/.295 .50/.61 .74/.86 1/1"
        video_args = ["-vf",f"curves=all='{curve}'","-c:v","libx264",
                      "-preset","fast","-crf","17","-pix_fmt","yuv420p"]
    sp.run(["ffmpeg","-y","-v","error","-i",str(picture),"-f","f32le","-ar",str(RATE),"-ac","2","-i","pipe:0",
            "-map","0:v:0","-map","1:a:0",*video_args,"-c:a","aac","-b:a","160k","-movflags","+faststart",
            str(output)],input=audio.tobytes(),check=True)


for clip in sys.argv[1:] or ("hook","reveal"):
    build(clip)
