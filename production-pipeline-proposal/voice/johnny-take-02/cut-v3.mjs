// johnny-take-02 edit: take A is the base, cuts only inside silence, per-phrase atempo, set pauses, level match, limiter.
// usage: WHISPER_MODEL=<path to model.bin> node cut.mjs <take-dir> [outDir]   (refuses to overwrite existing outputs)
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const DIR=path.resolve(process.argv[2]??'.'),OUT=path.resolve(process.argv[3]??DIR);
const SCRIPT=path.resolve(DIR,'..','SCRIPT-D-final.txt'),MODEL=process.env.WHISPER_MODEL;
if(!MODEL||!fs.existsSync(MODEL))throw Error('set WHISPER_MODEL to the whisper model.bin');
const OUTS={wav:`${OUT}/johnny-take-02-edit-v3.wav`,mp3:`${OUT}/johnny-take-02-edit-v3.mp3`,map:`${OUT}/edit-map-v3.json`,words:`${OUT}/words-v3.json`};
for(const f of Object.values(OUTS))if(fs.existsSync(f))throw Error('refusing to overwrite '+f);
const SR=44100,NH=Math.round(.005*SR),H=NH/SR,THR=-48,TARGET=-16;
const ff=(a,input)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats',...a],{input,maxBuffer:1e9});if(r.status)throw Error(String(r.stderr));return r;};
const f32=b=>new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)),RAW=['-f','f32le','-ar',String(SR),'-ac','1'];
const bytes=x=>Buffer.from(x.buffer,x.byteOffset,x.byteLength);
const load=f=>f32(ff(['-v','error','-i',f,...RAW,'pipe:1']).stdout);
const tempo=(y,r)=>r===1?y:f32(ff(['-v','error',...RAW,'-i','pipe:0','-af','atempo='+r.toFixed(6),...RAW,'pipe:1'],bytes(y)).stdout);
const env=x=>{const n=Math.round(H*SR),o=[];for(let i=0;i+n<=x.length;i+=n){let s=0;for(let j=0;j<n;j++)s+=x[i+j]*x[i+j];o.push(10*Math.log10(s/n+1e-12));}return o;};
const integ=x=>{const m=[...String(ff([...RAW,'-i','pipe:0','-af','ebur128','-f','null','-'],bytes(x)).stderr).matchAll(/ I:\s+(-?[\d.]+) LUFS/g)].at(-1);return m?+m[1]:-70;};
// level proxy: K-weighted mean square over the speech frames (within 30 dB of the loudest frame); a gated ebur128 misreads 1-2 s pieces
const lufsOf=x=>{const e=env(x),mx=e.reduce((a,b)=>Math.max(a,b),-99),k=f32(ff([...RAW,'-i','pipe:0','-af','highshelf=f=1681:g=4:t=q:w=0.7071,highpass=f=38:poles=2:t=q:w=0.5',...RAW,'pipe:1'],bytes(x)).stdout),n=Math.round(H*SR);let s=0,c=0;
 for(let i=0;i<e.length;i++)if(e[i]>mx-30)for(let j=0;j<n;j++){s+=k[i*n+j]**2;c++;}return -0.691+10*Math.log10(s/c+1e-12);};
const db=g=>10**(g/20),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
// ---------- whisper (16 kHz mono, 0.8 s pad; relative model/destination, run with the work folder as cwd)
const work=fs.mkdtempSync(path.join(os.tmpdir(),'jt02-'));fs.copyFileSync(MODEL,work+'/model.bin');
function whisper(input,tag){const w16=`${work}/${tag}.wav`;ff(['-v','error','-y','-i',input,'-ar','16000','-ac','1','-af','apad=pad_dur=0.8',w16]);
 const r=spawnSync('ffmpeg',['-v','error','-i',`${tag}.wav`,'-af',`whisper=model=model.bin:language=en:use_gpu=false:queue=90:max_len=1:format=json:destination=${tag}.jsonl`,'-f','null','-'],{cwd:work});if(r.status)throw Error(String(r.stderr));
 return fs.readFileSync(`${work}/${tag}.jsonl`,'utf8').split(/\r?\n/).filter(s=>s.includes('"start"')).map(s=>{const m=s.match(/"start":(\d+),"end":(\d+),"text":"(.*)"\s*\}/);return {s:m[1]/1000,e:m[2]/1000,t:m[3].trim()};});}
// ---------- script tokens (display words exactly as in the script)
const tok=fs.readFileSync(SCRIPT,'utf8').replace(/\[[^\]]*\]/g,'').split(/\s+/).filter(Boolean);
if(tok.length!==180)throw Error('script token count '+tok.length);
// ---------- piece plan: [first word, last word, group, section, set pause after (s)]
const PLAN=[[0,6,0,'hook',.30],[7,13,1,'hook',.50],[14,27,2,'setup',.24],[28,37,3,'setup',.24],[38,52,4,'setup',.24],[53,62,5,'setup',.35],[63,69,6,'setup',.24],[70,83,7,'setup',.24],
 [84,86,8,'setup',.14],[87,87,8,'setup',.14],[88,96,8,'setup',1.30],[97,106,9,'reveal',.26],[107,114,10,'reveal',.20],[115,118,11,'pounding',.135],[119,119,11,'pounding',.40],[120,131,12,'reveal',.45],
 [132,142,13,'late',.26],[143,146,14,'late',.30],[147,153,14,'late',.45],[154,165,15,'late',.24],[166,177,16,'late',.63],[178,179,17,'late',0]];
const GOFF={13:-3,14:.5,21:-1}; // level offsets (LU): "and stays" stays soft; POUNDING is judged separately by word
const BASE='a',src=load(`${DIR}/raw/${BASE}.mp3`),E=env(src);
const W=whisper(`${DIR}/raw/${BASE}.mp3`,'src');if(W.length!==180)throw Error('whisper word count '+W.length);
// ---------- silence gaps in the base take, mapped (in order) to the planned cut boundaries
const gaps=[];{let i=0;while(i<E.length){if(E[i]<THR){let j=i;while(j<E.length&&E[j]<THR)j++;if((j-i)*H>=.09&&i>0&&j<E.length-5)gaps.push([i*H,j*H]);i=j;}else i++;}}
const bs=PLAN.slice(0,-1).map(p=>p[1]);
const cost=(b,g)=>{const t=(W[b].e+W[b+1].s)/2;return t<g[0]?g[0]-t:t>g[1]?t-g[1]:0;};
const n=bs.length,m=gaps.length,D=Array.from({length:n+1},()=>Array(m+1).fill(1e9)),P=Array.from({length:n+1},()=>Array(m+1).fill(0));
for(let j=0;j<=m;j++)D[0][j]=0;
for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){const a=D[i-1][j-1]+cost(bs[i-1],gaps[j-1]),b=D[i][j-1];if(a<=b){D[i][j]=a;P[i][j]=1}else{D[i][j]=b;P[i][j]=0}}
const asg=[];for(let i=n,j=m;i>0;){if(P[i][j]){asg[i-1]=j-1;i--;j--}else j--;}
for(let k=0;k<n;k++)if(cost(bs[k],gaps[asg[k]])>(bs[k]===118?.09:.05))throw Error('boundary '+bs[k]+' not inside a silence');
const first=E.findIndex(v=>v>THR)*H,last=(E.length-[...E].reverse().findIndex(v=>v>THR))*H;
const used=new Set(asg),inner=gaps.filter((g,i)=>!used.has(i));
const pieces=PLAN.map(([a,z,grp,sec,T],k)=>{
 const on=k?gaps[asg[k-1]][1]:first,off=k<n?gaps[asg[k]][0]:last;
 const ig=inner.filter(g=>g[0]>on&&g[1]<off).reduce((s,g)=>s+g[1]-g[0],0);
 // pre-roll back to quiet (keeps breaths / onset ramps), tail forward to quiet (keeps the decay)
 let p=Math.round(on/H)-1;while(p>0&&E[p]>-72&&(on/H-p)*H<(k?.35:.05))p--;const pre=Math.max(.03,on-p*H-.005);
 let q=Math.round(off/H);while(q<E.length-1&&E[q]>-72&&(q-off/H)*H<(k<n?.25:.4))q++;const post=Math.max(.03,q*H-off+.01);
 return {k,a,z,grp,sec,T,on,off,nat:(z-a+1)/(off-on-ig),rs:Math.max(0,on-pre),re:Math.min(src.length/SR,off+post),words:z-a+1};});
// ---------- rates (pitch preserved: atempo)
const grpNat={};for(const p of pieces){const g=grpNat[p.grp]??={w:0,t:0};g.w+=p.words;g.t+=p.words/p.nat;}
for(const p of pieces){const nat=grpNat[p.grp].w/grpNat[p.grp].t;p.gnat=nat;
 const lo=p.sec==="reveal"?3.3:3.5,hi=p.sec==="reveal"?3.7:4.2,mid=p.sec==="reveal"?3.5:3.7; // keep natural pacing inside the band, move only the outliers
 p.rate=+clamp(p.sec==="pounding"?(nat>3.4?3.3/nat:1):p.sec==="late"?(p.nat>4.3?4.3/p.nat:1):nat<lo?mid/nat:nat>hi?hi/nat:1,.88,1.25).toFixed(4);
 if(p.sec==='hook'&&nat*p.rate>4.2)p.rate=+(4.2/nat).toFixed(4);
 p.rate={0:1.147,2:1.25,4:1.08,6:1.18,7:1.0728}[p.k]??1;}
// ---------- processed pieces at unit gain
for(const p of pieces){let y=src.slice(Math.round(p.rs*SR),Math.round(p.re*SR));y=tempo(y,p.rate);
 const f=Math.round(.008*SR);for(let i=0;i<f&&i<y.length;i++){const w=.5-.5*Math.cos(Math.PI*i/f);y[i]*=w;y[y.length-1-i]*=w;}
 if(p.k===14){ // soften only the P burst of POUNDING
  let at=0,top=0;for(let i=0;i<Math.min(y.length,.22*SR);i++)if(Math.abs(y[i])>top){top=Math.abs(y[i]);at=i;}
  const w=.018*SR;for(let i=Math.max(0,Math.round(at-3*w));i<Math.min(y.length,at+3*w);i++)y[i]*=10**(-8*Math.exp(-.5*((i-at)/w)**2)/20);}
 p.y=y;p.e0=env(y);}
for(const p of pieces)p.lufs0=lufsOf(p.y);
// ---------- render: onsets/offsets measured at the threshold in the final-level domain
const edges=(p,gdb)=>{const th=THR-gdb,e=p.e0;const a=e.findIndex(v=>v>th),b=e.length-1-[...e].reverse().findIndex(v=>v>th);return [a*H,(b+1)*H];};
function render(gdb){const pl=[];let len=0;
 for(const p of pieces){const [a,b]=edges(p,gdb[p.k]);const start=p.k===0?.06-a:pl[p.k-1].offOut+pieces[p.k-1].T-a;pl.push({start,onOut:start+a,offOut:start+b});len=Math.max(len,Math.round((start+p.y.length/SR)*SR));}
 const all=new Float32Array(len+Math.round(.05*SR));
 for(const p of pieces){const o=Math.round(pl[p.k].start*SR),g=db(gdb[p.k]);for(let i=0;i<p.y.length;i++)all[o+i]+=p.y[i]*g;}
 return {all,pl};}
const master=pre=>f32(ff([...RAW,'-i','pipe:0','-af','aresample=176400,alimiter=limit=0.78:attack=3:release=60:level=false:latency=1,aresample='+SR,...RAW,'pipe:1'],bytes(pre)).stdout);
// ---------- calibrate group gains on the rendered master, then global level
const gg={};for(const p of pieces)gg[p.k]=TARGET+(GOFF[p.k]??0)-p.lufs0;
let R,fin;const keys=Object.keys(gg),norm=keys.filter(g=>!(g in GOFF));
for(let it=0;it<4;it++){
 R=render(pieces.map(p=>gg[p.k]));fin=master(R.all);
 const I=integ(fin),meas={};
 for(const g of keys){const a=R.pl[g].onOut-.05,b=R.pl[g].offOut+.05;meas[g]=lufsOf(fin.slice(Math.max(0,Math.round(a*SR)),Math.round(b*SR)));}
 console.error(`pass ${it}: integrated ${I.toFixed(2)}  group LUFS ${Math.min(...norm.map(g=>meas[g])).toFixed(1)}..${Math.max(...norm.map(g=>meas[g])).toFixed(1)}`);
 if(it===3)break;
 const mean=norm.reduce((s,g)=>s+meas[g],0)/norm.length,dI=TARGET-I;
 for(const g of keys)gg[g]+=(mean+(GOFF[g]??0)-meas[g])*.9+dI*.9;}
// ---------- write outputs
const preI=integ(R.all),preMax=R.all.reduce((m,v)=>Math.max(m,Math.abs(v)),0),tot=fin.length/SR,pk=fin.reduce((m,v)=>Math.max(m,Math.abs(v)),0);
ff(['-v','error','-n',...RAW,'-i','pipe:0','-c:a','pcm_s24le',OUTS.wav],bytes(fin));
ff(['-v','error','-n','-i',OUTS.wav,'-c:a','libmp3lame','-q:a','1',OUTS.mp3]);
const pauses=pieces.slice(0,-1).map(p=>({after:tok[p.z],set:p.T,measured:+(R.pl[p.k+1].onOut-R.pl[p.k].offOut).toFixed(3),from:+R.pl[p.k].offOut.toFixed(3),to:+R.pl[p.k+1].onOut.toFixed(3)}));
fs.writeFileSync(OUTS.map,JSON.stringify({base:BASE,sources:{a:'raw/a.mp3 (base, used for every piece)',b:'raw/b.mp3 (not used: no patch needed)'},duration:+tot.toFixed(3),integratedBeforeLimiter:+preI.toFixed(2),peakBeforeLimiterDb:+(20*Math.log10(preMax)).toFixed(2),limiterCeilingDb:-2.16,sampleRate:SR,audibleThresholdDb:THR,
 note:'audible edge = first/last 5 ms RMS frame above -48 dBFS; pieces are cut inside silence (< -72 dBFS) and mixed with 8 ms fades; gain_db is the per-piece gain before the limiter',
 pieces:pieces.map(p=>({piece:p.k,text:tok.slice(p.a,p.z+1).join(' '),take:BASE,srcRange:[+p.rs.toFixed(3),+p.re.toFixed(3)],srcAudible:[+p.on.toFixed(3),+p.off.toFixed(3)],
  outRange:[+R.pl[p.k].start.toFixed(3),+(R.pl[p.k].start+p.y.length/SR).toFixed(3)],outAudible:[+R.pl[p.k].onOut.toFixed(3),+R.pl[p.k].offOut.toFixed(3)],rate:p.rate,gain_db:+gg[p.k].toFixed(2),natWordsPerSec:+p.gnat.toFixed(2),group:p.grp,section:p.sec})),
 pauses,inner_gaps_kept:inner.map(g=>[+g[0].toFixed(3),+g[1].toFixed(3)])},null,1));
// ---------- words: whisper on the master; boundaries snapped to energy valleys / real gaps; clipped to each piece's audible edges
const MW=whisper(OUTS.wav,'mst');if(MW.length!==180)console.error('WARNING whisper word count on master',MW.length);
const Em=env(fin),sm=Em.map((v,i)=>{let s=0,c=0;for(let k=-2;k<=2;k++)if(Em[i+k]!==undefined){s+=10**(Em[i+k]/10);c++}return 10*Math.log10(s/c+1e-12)});
const words=[],lines=[];
// word boundaries inside one piece. Hard anchors: real silences (>=60 ms) inside the piece. Between anchors the words are laid out
// in proportion to a syllable/function-word weight, nudged toward whisper's (rough) starts when they agree, then snapped to energy valleys.
const FN={a:.35,of:.45,to:.45,the:.4,and:.55,he:.5,she:.55,her:.55,him:.6,his:.55,"i've":.7,you:.55,was:.6,at:.45,on:.45,for:.55,but:.6,so:.6,is:.45,do:.6,it:.5,in:.45,"he's":.7,"she's":.7,"he'd":.7,"she'd":.7,i:.4,me:.6,no:.7,one:.7};
const wgt=w=>{const k=w.toLowerCase().replace(/[^a-z']/g,'');let v=FN[k];if(v===undefined){const syl=Math.max(1,(k.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'').match(/[aeiouy]{1,2}/g)||[]).length);v=.55+.45*syl+.04*k.length;}return /^[^a-z]*[A-Z]{3,}/.test(w)?v*1.25:v;};
const sm25=Em.map((v,i)=>{let s=0,c=0;for(let k=-2;k<=2;k++)if(Em[i+k]!==undefined){s+=10**(Em[i+k]/10);c++}return 10*Math.log10(s/c+1e-12)});
function align(a,b,ws,words){
 const N=words.length;if(N===1)return {starts:[a],ends:[b]};
 const i0=Math.round(a/H),iz=Math.round(b/H),ig=[];
 {let i=i0;while(i<iz){if(Em[i]<THR){let j=i;while(j<iz&&Em[j]<THR)j++;if((j-i)*H>=.06&&i>i0+2&&j<iz-2)ig.push([i*H,j*H]);i=j}else i++}}
 // speech segments between gaps
 const segs=[];let c=a;for(const g of ig){segs.push([c,g[0]]);c=g[1]}segs.push([c,b]);
 const W=words.map(wgt),tot=W.reduce((s,v)=>s+v,0),sdur=segs.map(s=>s[1]-s[0]),stot=sdur.reduce((s,v)=>s+v,0);
 // assign contiguous word runs to segments: best match of weight share vs duration share
 const K=segs.length,pre=[0];for(const v of W)pre.push(pre.at(-1)+v);
 const best=Array.from({length:K+1},()=>Array(N+1).fill(1e9)),from=Array.from({length:K+1},()=>Array(N+1).fill(0));best[0][0]=0;
 for(let k=1;k<=K;k++)for(let n=k;n<=N-(K-k);n++)for(let m=k-1;m<n;m++){if(best[k-1][m]>=1e9)continue;const e=((pre[n]-pre[m])/tot-sdur[k-1]/stot)**2*100+best[k-1][m];if(e<best[k][n]){best[k][n]=e;from[k][n]=m}}
 const cut=[N];for(let k=K,n=N;k>0;k--){n=from[k][n];cut.unshift(n)}
 const starts=[],ends=[];
 for(let k=0;k<K;k++){const w0=cut[k],w1=cut[k+1],[s0,s1]=segs[k],sw=pre[w1]-pre[w0];
  const bt=[s0];for(let w=w0+1;w<w1;w++){const prop=s0+(s1-s0)*(pre[w]-pre[w0])/sw,wh=ws[w]?.s,tg=wh!==undefined&&Math.abs(wh-prop)<.12?prop+.5*(wh-prop):prop;
   // snap to the deepest valley within +-70 ms if clearly lower than at the target
   const ti=Math.round(tg/H);let bi=ti,bv=sm25[ti];for(let i=ti-8;i<=ti+8;i++)if(sm25[i]<bv-.01){bv=sm25[i];bi=i}
   const t=sm25[ti]-bv>=3?bi*H+H/2:tg;const lo=(bt.at(-1)??s0)+.05,hi=s1-.05*(w1-w);bt.push(Math.min(hi,Math.max(lo,t)));}
  bt.push(s1);
  for(let w=w0;w<w1;w++){starts[w]=bt[w-w0];ends[w]=bt[w-w0+1];}}
 return {starts,ends,anchors:ig.length};}
for(const p of pieces){
 const a=R.pl[p.k].onOut,b=R.pl[p.k].offOut,al=align(a,b,MW.slice(p.a,p.z+1),tok.slice(p.a,p.z+1));
 for(let w=0;w<=p.z-p.a;w++)words.push({word:tok[p.a+w],start:+al.starts[w].toFixed(3),end:+al.ends[w].toFixed(3),line:p.k+1});
 lines.push({line:p.k+1,text:tok.slice(p.a,p.z+1).join(' '),start:+a.toFixed(3),end:+b.toFixed(3)});}
const marks={rewindStart:words[96].end,rewindEnd:words[97].start,youSee:words[97].start,pounding:words[119].start,stays:words[179].start,andStays:words[178].start};
fs.writeFileSync(OUTS.words,JSON.stringify({duration:+tot.toFixed(3),words,lines,marks},null,1));
console.error('duration',tot.toFixed(2),'sample peak dBFS',(20*Math.log10(pk)).toFixed(2));
console.table(pieces.map(p=>({k:p.k,txt:tok.slice(p.a,p.z+1).join(' ').slice(0,28),nat:p.gnat.toFixed(2),rate:p.rate,gain:gg[p.k].toFixed(1),out:R.pl[p.k].onOut.toFixed(2)+'-'+R.pl[p.k].offOut.toFixed(2)})));
console.table(pauses);
fs.rmSync(work,{recursive:true,force:true});
