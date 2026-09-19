import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PACKAGE,read} from './core.mjs';
export function renderWorkItems(data){
 if(data.schemaVersion!==1||!Array.isArray(data.tasks))throw new Error('Invalid work item schema');
 const seen=new Set(),labels={ready:'可讨论认领',maintainer:'维护者操作',blocked:'等待前置验收',doing:'进行中',done:'已完成（见证据）'};
 let out='# 首批可认领任务\n\n这些是本地任务说明，尚未创建为 GitHub Issue，也未自动分配给任何人。源是 WORK_ITEMS.json；旧游戏任务保留原处。\n';
 for(const t of data.tasks){
  if(!/^MM-DEV-\d{3}$/.test(t.id)||seen.has(t.id)||!labels[t.status])throw new Error('Invalid/duplicate work item: '+t.id);
  seen.add(t.id);for(const k of ['title','priority','paths','acceptance','boundary'])if(typeof t[k]!=='string'||!t[k].trim())throw new Error('Missing work item field: '+k);
  if(t.status==='done'&&(!t.evidence||!String(t.evidence).trim()))throw new Error('Completed task needs evidence');
  out+=`\n## ${t.id} · ${t.title}\n\n优先级 ${t.priority}；状态 ${labels[t.status]}；负责人：${t.owner||'未认领'}。\n范围：\`${t.paths}\`。\n验收：${t.acceptance}\n边界：${t.boundary}\n证据：${t.evidence||'尚未记录'}\n`;
 }return out;
}
export function buildWorkItems(pkg=PACKAGE,{check=false}={}){
 const text=renderWorkItems(JSON.parse(read(pkg,'docs/WORK_ITEMS.json'))),file=path.join(pkg,'docs/WORK_ITEMS.md');
 if(check){if(read(pkg,'docs/WORK_ITEMS.md')!==text)throw new Error('WORK_ITEMS.md stale. Run npm --prefix packages/mario-mix run docs:build');}
 else fs.writeFileSync(file,text);
 return text;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{buildWorkItems(PACKAGE,{check:process.argv.includes('--check')});console.log('Work-item documentation synchronized');}catch(e){console.error(e.message);process.exitCode=1;}}
