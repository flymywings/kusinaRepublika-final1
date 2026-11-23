import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
const root=path.dirname(fileURLToPath(import.meta.url)),proof=path.join(root,'proof');fs.mkdirSync(proof,{recursive:true});
const windowsBrowser='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browserExecutable=process.env.CHROME_PATH||(process.platform==='win32'&&fs.existsSync(windowsBrowser)?windowsBrowser:undefined);
const chromiumOptions={gl:'angle'};
const serveUrl=await bundle({entryPoint:path.join(root,'CharacterSheet.tsx'),publicDir:path.join(root,'references')});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions});
try{const common={serveUrl,browserExecutable,chromiumOptions,puppeteerInstance:browser,timeoutInMilliseconds:180000};
 const composition=await selectComposition({...common,id:'FragrantCharacterSheet'});
 const output=path.join(proof,'Fragrant_Flower_Character_Sheet_v8.png');
 await renderStill({...common,composition,frame:0,imageFormat:'png',output,scale:1});console.log(output);
}finally{await browser.close({silent:true});}
