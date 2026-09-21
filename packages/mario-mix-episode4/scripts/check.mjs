import path from 'node:path';import vm from 'node:vm';import {fileURLToPath} from 'node:url';
import {compile,ROOT} from './build.mjs';
export function check(root=ROOT,{baseline=false}={}){
 const r=compile(root),text=r.bytes.toString();let scripts=0,json=0;
 for(const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/type="application\/json"/.test(m[1])){JSON.parse(m[2]);json++;}
  else if(!/\bsrc=/.test(m[1])){new vm.Script(m[2],{filename:'compiled-script-'+scripts});scripts++;}
 }
 if(scripts!==2||json!==3)throw Error('原版脚本标签结构发生意外变化');
 if(baseline&&(r.sha256!==r.manifest.baseline.sha256||r.bytes.length!==r.manifest.baseline.bytes))throw Error('源码与固定 R43 基线不一致。若正在开发新玩法，请单独提交变更及验收，不修改旧基线记录冒充原版。');
 const ginso=JSON.parse(text.match(/<script id="ginso41-audio" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 if(ginso.duration!==48||ginso.title!=='Restoring the Light, Facing the Dark')throw Error('R43 音轨身份不一致');
 return {sourceFiles:r.sourceFiles,assets:r.assets,scriptTags:scripts,jsonTags:json,sha256:r.sha256,baselineMatch:r.sha256===r.manifest.baseline.sha256,ginsoSeconds:ginso.duration};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{if(process.argv.slice(2).some(a=>a!=='--baseline'))throw Error('未知参数');console.log(JSON.stringify(check(ROOT,{baseline:process.argv.includes('--baseline')}),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
