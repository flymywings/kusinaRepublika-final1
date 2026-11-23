// Camera-follow audit: bundles cut-v6/timeline.ts and prints, per shot, camera path length, fov change and % of frames with no camera motion.
// Edit `bounds` ([first frame, end frame, id]) for a new film. Shots under ~0.3 path or over ~20% still frames need a follow target. usage: node pipeline/camera-audit.mjs
import {createRequire} from 'node:module';import path from 'node:path';import fs from 'node:fs';import os from 'node:os';import {pathToFileURL,fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(root+'/package.json'),esbuild=require('esbuild');
const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'aud-')),'a.mjs');
await esbuild.build({entryPoints:[root+'/shorts/fragrant-flower/cut-v6/timeline.ts'],bundle:true,platform:'node',format:'esm',outfile:out,loader:{'.json':'json'},logLevel:'error'});
const m=await import(pathToFileURL(out).href);
const shots=JSON.parse(fs.readFileSync(root+'/production-pipeline-proposal/film-shots.json','utf8'));
const bounds=[[0,66,'1A'],[66,149,'1B'],[149,203,'2A'],[203,286,'2B'],[286,341,'2D'],[341,449,'3A'],[449,498,'3C'],[498,546,'3D'],[546,612,'3E'],[612,696,'4A'],[696,785,'4C'],[785,834,'4E'],[834,871,'5A'],[871,912,'5B'],[912,960,'5C'],[960,1010,'5D'],[1010,1057,'5E'],[1057,1103,'5F'],[1103,1155,'6A'],[1155,1216,'6B'],[1216,1329,'6C'],[1329,1435,'7A'],[1435,1482,'7C'],[1482,1590,'7D'],[1590,1646,'7F']];
const rows=[];
for(const [a,b,id] of bounds){let path3=0,fovd=0,still=0,prev=null,maxv=0;const n=b-a;let last=null;
 for(let f=a;f<b;f++){const s=m.layersAt(f).at(-1).shot;const e=s.eye,v=s.fov;if(prev){const d=Math.hypot(e[0]-prev.e[0],e[1]-prev.e[1],e[2]-prev.e[2])+Math.abs(s.look[0]-prev.l[0])*.2+Math.abs(s.look[1]-prev.l[1])*.2;path3+=d;fovd+=Math.abs(v-prev.v);if(d<.0006&&Math.abs(v-prev.v)<.02)still++;maxv=Math.max(maxv,d);}prev={e,v,l:s.look};}
 // last 12 frames speed
 rows.push({id,n,path:+path3.toFixed(3),fov:+fovd.toFixed(1),stillFrames:still,pct:Math.round(100*still/n)});}
console.table(rows);
fs.rmSync(path.dirname(out),{recursive:true,force:true});
