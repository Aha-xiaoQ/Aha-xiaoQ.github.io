#!/usr/bin/env node
/** Register an existing original HTML as a draft. No generation, evaluation, or publication. */
import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';import fs from'node:fs';
import{readOptional,writeAtomic,safe}from'../lib/safe-path.mjs';
import{validateExperiment,validateExperimentCatalog,localFile}from'../../assets/platform/contracts.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const json=o=>Buffer.from(JSON.stringify(o,null,2)+'\n');
export function planExperiment(root,{id,title,subtitle,model,promptFile,artifact,reasoningEffort=null,createdAt=new Date().toISOString().slice(0,10)}={}){
 if(!localFile(promptFile)||!localFile(artifact)||!artifact.startsWith('experiments/')||!artifact.endsWith('.html'))throw Error('Use repository-relative prompt and HTML artifact paths');
 const prompt=readOptional(root,promptFile),bytes=readOptional(root,artifact),old=readOptional(root,'content/experiments/catalog.json');if(!prompt||!bytes||!old)throw Error('Required source file is missing');
 const row=validateExperiment({schemaVersion:1,id,title,subtitle,model,prompt:prompt.toString('utf8'),reasoningEffort,createdAt,visibility:'draft',promptLanguage:'zh-CN',artifact:{href:'/'+artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),selfContained:false},features:[],provenance:'原始输入与 HTML 产物保留。公开前补充来源和生成过程。',verification:'尚未记录验证结果。'});
 const registry=validateExperimentCatalog(JSON.parse(old));if(registry.entries.some(x=>x.id===id))throw Error('Experiment ID already exists');
 const record='content/experiments/'+id+'.json';if(readOptional(root,record))throw Error('Experiment file already exists');
 const next={...registry,entries:[...registry.entries,{id,file:record}]};validateExperimentCatalog(next);
 return [{path:record,old:null,next:json(row)},{path:'content/experiments/catalog.json',old,next:json(next)}];
}
export function add(root,options,{dryRun=false}={}){
 const changes=planExperiment(root,options);if(dryRun)return{draft:true,files:changes.map(x=>x.path),written:false};
 for(const c of changes){const b=readOptional(root,c.path);if(c.old?!b?.equals(c.old):b!==null)throw Error('Source changed before registration');}
 const done=[];try{for(const c of changes){writeAtomic(root,c.path,c.next);done.push(c);}}catch(error){for(const c of done.reverse()){if(!readOptional(root,c.path)?.equals(c.next))continue;if(c.old)writeAtomic(root,c.path,c.old);else fs.unlinkSync(safe(root,c.path));}throw error;}
 return{draft:true,files:changes.map(x=>x.path),written:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
 const options={},args=process.argv.slice(2);let dryRun=false;
 const keys={'--id':'id','--title':'title','--subtitle':'subtitle','--model':'model','--prompt-file':'promptFile','--artifact':'artifact','--reasoning-effort':'reasoningEffort'};
 for(let i=0;i<args.length;i++){if(args[i]==='--dry-run'){dryRun=true;continue;}const key=keys[args[i]];if(!key||options[key]!==undefined||!args[i+1]||args[i+1].startsWith('--'))throw Error('Usage: npm run experiment:add -- --id <id> --title <title> --subtitle <summary> --model <model> --prompt-file <path> --artifact experiments/<id>.html [--dry-run]');options[key]=args[++i];}
 console.log(add(ROOT,options,{dryRun}));
}catch(error){console.error(error.message);process.exitCode=1;}
