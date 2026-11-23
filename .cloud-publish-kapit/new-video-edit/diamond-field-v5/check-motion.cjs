// Camera-only subject-plane projection, in reference-size720x1280 pixels.
// This is a source diagnostic, not the reference study's optical-flow fit.
const fs=require('fs'),path=require('path'),esbuild=require('esbuild'),T=require('three');
require.extensions['.ts']=(m,f)=>m._compile(esbuild.transformSync(fs.readFileSync(f,'utf8'),{loader:'ts',format:'cjs'}).code,f);
function measure(folder,a,b,center=[0,1.35,-.7]){
 const {viewAt}=require(path.resolve(__dirname,folder,'story.ts'));let samples=[];
 const project=f=>{const v=viewAt(f*1.25),cam=new T.PerspectiveCamera(v.fov,720/1280,.035,180);cam.position.set(...v.position);cam.lookAt(...v.look);cam.updateMatrixWorld();return[-.6,0,.6].flatMap(x=>[-.4,0,.4].map(y=>{const p=new T.Vector3(center[0]+x,center[1]+y,center[2]).project(cam);return[p.x*360,p.y*640]}));};
 for(let f=a+1;f<=b;f++){const p=project(f-1),q=project(f);samples.push(p.reduce((s,v,i)=>s+Math.hypot(q[i][0]-v[0],q[i][1]-v[1]),0)/p.length)}
 return{frames:[a,b],mean:+(samples.reduce((s,n)=>s+n,0)/samples.length).toFixed(2),peak:+Math.max(...samples).toFixed(2)};
}
for(const folder of ['../diamond-field-v4','.'])console.log(folder,JSON.stringify({firstTwoSeconds:measure(folder,0,60),diamondReframe:measure(folder,62,89)}));
for(const [name,a,b,center]of[['pickup',180,207,[-.2,1,.5]],['ruby',212,237,[1,1,-.55]],['approval',315,339,[.1,1.45,0]],['clue',479,506,[.1,.3,.5]],['dig',536,563,[.1,-.1,.5]],['plant',655,674,[0,.4,.5]]])console.log(name,JSON.stringify(measure('.',a,b,center)));
