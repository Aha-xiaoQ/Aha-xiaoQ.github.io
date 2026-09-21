/** Deterministic, self-contained source archive. No dist, workspace, fonts or credentials. */
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
import {read,manifest,ROOT,sha}from'./build.mjs';import{zip}from'./lib/zip.mjs';import{safe,writeAtomic}from'./lib/safe-path.mjs';
export const NAME='MarioMix_Episode4_R43_Source';
const excluded=new Set(['.git','.local','dist','node_modules','coverage','test-results']);
export function sourceEntries(root=ROOT){
 const entries=[];
 function scan(rel=''){const dir=rel?path.join(root,rel):root;
  for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:1)){
   if(excluded.has(e.name))continue;const p=rel?rel+'/'+e.name:e.name;
   const st=fs.lstatSync(path.join(root,p));if(st.isSymbolicLink()||(!st.isFile()&&!st.isDirectory())||st.isFile()&&st.nlink>1)throw Error('不允许链接或特殊文件：'+p);
   if(st.isDirectory())scan(p);else{safe(root,p);if(/\.(?:ttf|otf|woff2?|exe|dll|pem|key|zip)$/i.test(p)||/(^|\/)(?:\.env(?:\.|$)|credentials|hosts\.yml)/i.test(p))throw Error('不应进入源码包的文件：'+p);entries.push([p,read(root,p)]);}
  }
 }
 scan();return entries.sort(([a],[b])=>a<b?-1:a>b?1:0);
}
export function pack(root=ROOT){
 const entries=sourceEntries(root),m=manifest(root),sourceHash=sha(Buffer.from(entries.map(([p,b])=>p+' '+sha(b)).join('\n')));
 const bytes=zip(entries.map(([p,b])=>[NAME+'/'+p,b]));
 const metadata={schemaVersion:1,edition:m.edition,version:'0.1.0',gameVersion:m.gameVersion,file:NAME+'.zip',bytes:bytes.length,sha256:sha(bytes),entries:entries.length,sourceHash,baseline:m.baseline,scope:'Organized source of the released R43 game; no new gameplay, framework migration or device certification.'};
 return {bytes,metadata};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
 const args=process.argv.slice(2);if(args.some(a=>a!=='--repository'))throw Error('用法：npm run pack [-- --repository]');
 const result=pack();const repo=path.resolve(ROOT,'../..');let dir,root;
 if(args.includes('--repository')){if(path.basename(ROOT.replace(/[\\/]$/,''))!=='mario-mix-episode4'||!fs.existsSync(path.join(repo,'content/development/projects/mario-mix.json')))throw Error('不是完整网站仓库，使用 npm run pack');root=repo;dir='downloads/source';}
 else{root=ROOT;dir='.local';}
 writeAtomic(root,dir+'/'+NAME+'.zip',result.bytes);writeAtomic(root,dir+'/'+NAME+'.json',Buffer.from(JSON.stringify(result.metadata,null,2)+'\n'));console.log('已生成 '+dir+'/'+NAME+'.zip\n'+result.metadata.sha256);
}catch(e){console.error(e.message);process.exitCode=1;}
