// node rules.mjs 0,54,114   -> JSON of the computed rules per frame (faces, caption, prop count)
import {createRequire} from 'node:module';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),require=createRequire(path.resolve(here,'../../../package.json'));
const esbuild=require('esbuild');
const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'rules-')),'rules.mjs');
await esbuild.build({entryPoints:[path.join(here,'rules.ts')],bundle:true,platform:'node',format:'esm',outfile:out,loader:{'.json':'json'},logLevel:'error'});
const m=await import(pathToFileURL(out).href);
const frames=(process.argv[2]??'0').split(',').map(Number);
if(process.argv[3]==='box'){console.log(JSON.stringify(frames.map(m.boxCheck),null,1));}else if(process.argv[3]==='drift'){const v=frames.map(f=>[f,m.drift(f)]);const low=v.filter(x=>x[1]<.15);console.log('min drift %',Math.min(...v.map(x=>x[1])).toFixed(3),'frames under 0.15:',low.map(x=>x[0]+':'+x[1].toFixed(3)).join(' ')||'none');}else console.log(JSON.stringify(frames.map(m.check),null,1));
fs.rmSync(path.dirname(out),{recursive:true,force:true});
