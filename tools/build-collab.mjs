import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const model=require('../dev/model.js');
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function outputs(root=ROOT) {
  const p=model.assertProject(JSON.parse(await readFile(path.join(root,'collab/project.json'),'utf8')));
  const js='/* GENERATED from collab/project.json. Run npm run collab:build; do not edit. */\n'+
    'globalThis.MM_PROJECT = '+JSON.stringify(p,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';\n';
  const escape=s=>String(s).replace(/\|/g,'\\|').replace(/[\r\n]/g,' ');
  const md='# 任务摘要（自动生成）\n\n唯一状态源为 `collab/project.json`；修改后运行 `npm run collab:build`。网页本地草稿不等于已提交状态。\n\n'+
    `协作包：${p.release} · 更新：${p.updatedAt} · ${p.deliveryStatus}\n\n`+
    '| ID | 事项 | 状态 | 优先级 | 负责人 | 前置事项 |\n|---|---|---|---|---|---|\n'+
    p.tasks.map(t=>`| ${t.id} | ${escape(t.title)} | ${model.STATUSES[t.status]} | ${t.priority} | ${escape(t.owner)||'待认领'} | ${t.dependsOn.join(', ')||'—'} |`).join('\n')+'\n';
  return {'dev/project-data.js':js,'collab/TASKS.md':md};
}
export async function build(check=false,root=ROOT) {
  const result=await outputs(root),changed=[];
  for(const [file,content] of Object.entries(result)) {
    const actual=await readFile(path.join(root,file),'utf8').catch(()=>null);
    if(actual!==content){changed.push(file);if(!check)await writeFile(path.join(root,file),content);}
  }
  if(check&&changed.length)throw Error('生成文件已过期：'+changed.join(', ')+'。请运行 npm run collab:build 并一并提交。');
  return changed;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{console.log('生成文件：',(await build(process.argv.includes('--check'))).join(', ')||'已同步');}
  catch(e){console.error(e.message);process.exitCode=1;}
}
