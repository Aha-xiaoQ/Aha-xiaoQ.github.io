#!/usr/bin/env node
/** Local task planning, no network calls, no auto-claiming or fabricated Issues. */
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {safe,readOptional,entryStat,writeAtomic} from './lib/safe-path.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export function validateTasks(data,root=ROOT){
 if(data.schemaVersion!==2||!Array.isArray(data.tasks))throw Error('Unknown task schema');
 const items=new Map(),states=new Set(['planned','ready','in-progress','blocked','local-verified','reviewed','released']);
 for(const t of data.tasks){
  if(!/^M\d{2}-[A-Z][A-Z0-9-]*$/.test(t.id)||items.has(t.id))throw Error('Duplicate/invalid task ID');items.set(t.id,t);
  if(!states.has(t.status)||typeof t.title!=='string'||!t.title.trim()||!['small','medium','large'].includes(t.difficulty))throw Error('Invalid task');
  if(!Array.isArray(t.scope)||!t.scope.length||!Array.isArray(t.acceptance)||!t.acceptance.length||t.acceptance.some(x=>typeof x!=='string'||!x.trim()))throw Error('Task requires scope/acceptance');
  for(const p of t.scope)if(!entryStat(safe(root,p.replace(/\/$/,''))))throw Error('Task scope missing: '+p);
  if(['local-verified','reviewed','released'].includes(t.status)&&(!t.evidence||!readOptional(root,t.evidence)))throw Error('Completed task needs existing evidence');
  if(!Array.isArray(t.dependsOn)||!(t.owner===null||typeof t.owner==='string'))throw Error('Missing collaboration fields');
  for(const k of ['issue','pullRequest'])if(t[k]!==null&&!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(issues|pull)\/\d+$/.test(t[k]||''))throw Error('Issue/PR link must be real GitHub URL or null');
 }
 const visited=new Set(),active=new Set();function visit(id){if(active.has(id))throw Error('Task dependency cycle');if(visited.has(id))return;const t=items.get(id);if(!t)throw Error('Unknown task dependency');active.add(id);for(const d of t.dependsOn)visit(d);active.delete(id);visited.add(id);}for(const id of items.keys())visit(id);
 return data;
}
export function taskPlan(data,id){const t=data.tasks.find(x=>x.id===id);if(!t)throw Error('Unknown task ID');return `# ${t.id} · ${t.title}\n\n当前：${t.status}；认领：${t.owner||'尚未认领'}。本命令不会认领任务或创建 Issue。\n\n## 修改范围\n${t.scope.map(p=>'- '+p).join('\n')}\n\n## 验收条件\n${t.acceptance.map(p=>'- [ ] '+p).join('\n')}\n\n## PR 必填\n修改类型：等价迁移 / 有意修复 / 新功能 / 文档\n测试命令与结果：\n候选 SHA：\n未验证项：\n依赖：${t.dependsOn.join(', ')||'无'}\n`;} 
export function loadTasks(root=ROOT){return validateTasks(JSON.parse(readOptional(root,'docs/TASKS.json')),root);}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const d=loadTasks(),args=process.argv.slice(2);if(args[0]==='--task'){if(!args[1]||args.length>2)throw Error('Usage: --task M02-LABELS');console.log(taskPlan(d,args[1]));}else if(args[0]==='--handoff'){const edition=JSON.parse(readOptional(ROOT,'release.json')).edition;const text=`# ${edition} 交接摘要\n\n第三期唯一底稿：baseline.json。前两期、城堡关和线上稳定版不改。\n先读 docs/HANDOFF_${edition}.md、architecture/modules.json、docs/TASKS.json 和 docs/TEST_REPORT_${edition}.md。\n\n${d.tasks.map(t=>`- ${t.id} [${t.status}] ${t.title}`).join('\n')}\n\n尚未推送的本地文件需附上最新源码包。此摘要不等于自动获得用户本地修改。\n`;writeAtomic(ROOT,'.local/HANDOFF_CURRENT.md',Buffer.from(text));console.log(text);}else if(!args.length){console.log(d.tasks.map(t=>`${t.id.padEnd(16)} ${t.status.padEnd(16)} ${t.title}`).join('\n'));}else throw Error('Unknown arguments');}catch(e){console.error(e.message);process.exitCode=1;}
}
