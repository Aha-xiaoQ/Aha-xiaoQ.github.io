#!/usr/bin/env node
/** A read-only, project-aware handoff. Does not mistake local delivery for deployment. */
import{readFile}from'node:fs/promises';import{fileURLToPath}from'node:url';import path from'node:path';import{validateCatalog,validateProject,normalizeState,STATUS_LABELS}from'../../assets/journal/model.mjs';import{ROOT,read}from'./build.mjs';
export async function handoff(root=ROOT,id=''){
 const c=validateCatalog(JSON.parse(await read(root,'content/development/catalog.json'))),projects=[];
 for(const entry of c.projects){const p=validateProject(JSON.parse(await read(root,entry.file)));if(!id||p.id===id)projects.push(p);}
 if(!projects.length)throw Error('项目尚未登记：'+id);
 let output='# R04 开发日志续接\n\n先读 docs/development/START_HERE.md、HANDOFF_R04.md 和 STATE_SOURCES.json。开发日志是多项目栏目，不是混合马里奥专页。保持六项导航、共享主题与原生转场。\n\n本地交付不等于线上已发布；先比较当前仓库和用户最新文件，再修改。修改后提供源码、记录、真实测试和增量包，由用户审核并推送。\n';
 for(const p of projects){const state=normalizeState(JSON.parse(await read(root,p.state.path)),p);output+='\n## '+p.title+' / '+p.id+'\n\n状态源：'+p.state.path+'\n项目阶段：'+p.stage+'\n记录日期：'+state.updatedAt+'\n待处理（仅摘要，完整列表见源文件）：\n';const todo=state.tasks.filter(t=>t.status!=='done').slice(0,5);output+=todo.map(t=>'- '+t.id+' ['+STATUS_LABELS[t.status]+'] '+t.title).join('\n')||'暂无待处理记录；不是完整性验收证明。';output+='\n';}
 return output;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const a=process.argv.slice(2);if(a.length&&!(a.length===2&&a[0]==='--project'))throw Error('Usage: npm run journal:handoff -- [--project ID]');handoff(ROOT,a[1]||'').then(console.log).catch(e=>{console.error(e.message);process.exitCode=1;});
}
