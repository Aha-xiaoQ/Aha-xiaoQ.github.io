#!/usr/bin/env node
/** Derive public tasks from the actual engineering backlog; no remote operations. */
import path from 'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import {readOptional,writeAtomic}from'../lib/safe-path.mjs';
import {matchesTextHash,normalizeText}from'../lib/text-records.mjs';
import {validateCatalog,validateProject,validateState,localPath}from'../../assets/journal/model.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const RECORD='docs/content-r15/generated-tasks.json';
const hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=o=>Buffer.from(JSON.stringify(o,null,2)+'\n');
const parse=(b,p)=>{if(!b)throw Error('缺少文件：'+p);try{return JSON.parse(b);}catch{throw Error('JSON 格式错误：'+p);}};
const STATUS={planned:'planned',ready:'ready','in-progress':'active',blocked:'blocked','local-verified':'review',reviewed:'done',released:'done'};
export function projectTasks(data,p,sourceHash){
 if(data.schemaVersion!==2||!Array.isArray(data.tasks)||!Number.isInteger(data.revision)||data.revision<1)throw Error('工程任务格式或修订号无效');
 const tasks=data.tasks.map(t=>{
  if(!Object.hasOwn(STATUS,t.status)||!['public','maintenance'].includes(t.audience)||typeof t.summary!=='string'||!t.summary.trim())throw Error('任务缺少明确公开范围或摘要：'+t.id);
  if(['local-verified','reviewed','released'].includes(t.status)&&!t.evidence)throw Error('已验证任务缺少证据：'+t.id);
  return {id:t.id,title:t.title,summary:t.summary,area:t.area,status:STATUS[t.status],priority:t.priority,acceptance:[...t.acceptance],dependsOn:[...t.dependsOn],owner:t.owner||'',evidence:t.evidence?`${t.status==='local-verified'?'本地验证；实机验收另记。 ':''}${t.evidence}`:'',notes:'',issueUrl:t.issue||'',audience:t.audience,origin:{path:p.state.generatedFrom,id:t.id,status:t.status}};
 });
 const rank={ready:0,active:1,blocked:2,review:3,planned:4,done:5},priority={P0:0,P1:1,P2:2};
 tasks.sort((a,b)=>rank[a.status]-rank[b.status]||priority[a.priority]-priority[b.priority]||a.id.localeCompare(b.id,'en'));
 return validateState({schemaVersion:1,projectId:p.id,revision:data.revision,updatedAt:data.updatedAt,generated:{tool:'public-tasks-v1',source:p.state.generatedFrom,sha256:sourceHash,version:data.version},tasks},p.id);
}
export function planTasks(root=ROOT,{reader=p=>readOptional(root,p),initial=false}={}){
 const get=p=>{if(!localPath(p))throw Error('不安全的内容路径');return reader(p);};
 const catalog=validateCatalog(parse(get('content/development/catalog.json'),'catalog'));
 const old=reader(RECORD)?parse(reader(RECORD),RECORD):{schemaVersion:1,files:{}};const pages=new Map();
 for(const row of catalog.projects){const p=validateProject(parse(get(row.file),row.file));if(!p.state.generatedFrom)continue;
  if(p.state.adapter!=='project-v1'||!/^packages\/[a-z0-9-]+\/docs\/TASKS\.json$/.test(p.state.generatedFrom))throw Error('任务来源未登记为工程文件');
  const source=get(p.state.generatedFrom),state=projectTasks(parse(source,p.state.generatedFrom),p,hash(Buffer.from(normalizeText(source))));
  const next=bytes(state),before=get(p.state.path);
  if(!initial&&before&&(!old.files[p.state.path]||!matchesTextHash(before,old.files[p.state.path])))throw Error('生成任务含手工修改，请合并到工程 TASKS.json：'+p.state.path);
  if(!initial&&!before&&old.files[p.state.path])throw Error('生成任务文件缺失：'+p.state.path);
  pages.set(p.state.path,next);
 }
 for(const p of Object.keys(old.files))if(!pages.has(p))throw Error('任务生成范围变化，请先归档旧记录：'+p);
 pages.set(RECORD,bytes({schemaVersion:1,files:Object.fromEntries([...pages].map(([p,b])=>[p,hash(b)]))}));return pages;
}
export function sync(root=ROOT,{check=false}={}){
 const pages=planTasks(root),changes=[...pages].filter(([p,b])=>normalizeText(readOptional(root,p)||'')!==normalizeText(b));
 if(check&&changes.length)throw Error('公开任务与工程记录不同步：npm run content:sync');
 for(const [p,b]of check?[]:changes)writeAtomic(root,p,b);
 return {changed:changes.length,generated:pages.size-1};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(sync(ROOT,{check:process.argv.includes('--check')}));}catch(e){console.error(e.message);process.exitCode=1;}
