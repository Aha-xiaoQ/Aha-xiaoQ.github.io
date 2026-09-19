#!/usr/bin/env node
/** Checks current public copy only. Archived evidence and contributor attribution are not rewritten. */
import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import{readOptional}from'../lib/safe-path.mjs';import{ROOT,sync}from'./sync.mjs';
import{validateCatalog,validateProject,normalizeState,visibleTasks}from'../../assets/journal/model.mjs';
import{render,metadata,updateRows}from'../../assets/journal/render.mjs';
export const phrases=['用户曾反馈','用户手中最新版','用户要求','用户上传','按你的要求','我已为你','我已经替你','不虚构','不假报','没有把读取失败','本轮先把','下轮交给助手'];
export function copyIssues(text){return phrases.filter(p=>String(text).includes(p));}
const sha=b=>createHash('sha256').update(b).digest('hex');
export function check(root=ROOT){
 sync(root,{check:true});const get=p=>{const b=readOptional(root,p);if(!b)throw Error('Missing '+p);return b;};
 const catalog=validateCatalog(JSON.parse(get('content/development/catalog.json'))),projects=catalog.projects.map(x=>validateProject(JSON.parse(get(x.file))));let checked=0;const versions={};
 for(const p of projects.filter(x=>x.visibility==='public')){
  const state=normalizeState(JSON.parse(get(p.state.path)),p),pieces=[p.title,p.summary,p.intro,...p.highlights,p.participation.summary];
  for(const d of p.docs.filter(x=>!x.archived))pieces.push(d.title,d.summary,...d.sections.flatMap(s=>[s.title,...s.paragraphs]));
  for(const t of visibleTasks(state))pieces.push(t.title,t.summary,...t.acceptance);
  const errors=copyIssues(pieces.join('\n'));if(errors.length)throw Error('公开内容需人工编辑：'+p.id+' / '+errors.join(', '));
  for(const view of ['overview','tasks','docs','contribute']){
   const html=render({projectId:p.id,view},{projects,catalog,states:{[p.id]:state}});
   if(copyIssues(html).length)throw Error('公开渲染仍含交接口吻：'+p.id+'/'+view);checked++;
  }
  if(p.currentRelease){versions[p.id]=p.currentRelease.version;const r=p.currentRelease,meta=JSON.parse(get(r.manifestHref.slice(1))),zip=get(r.sourceHref.slice(1)),sourceRelease=p.state.generatedFrom?JSON.parse(get(path.posix.join(path.posix.dirname(path.posix.dirname(p.state.generatedFrom)), 'release.json'))):null;
   if(meta.version!==r.version||meta.status!==r.status||meta.documentationRevision!==r.documentationRevision||meta.sha256!==sha(zip)||meta.bytes!==zip.length||(sourceRelease&&(sourceRelease.version!==r.version||sourceRelease.documentationRevision!==r.documentationRevision||!r.sourceHref.endsWith('/'+sourceRelease.sourceArchive))))throw Error('当前版本、源码包与网页不一致');
   const u=p.updates.find(u=>u.id===r.updateId);if(!u)throw Error('当前版本缺少对应更新记录'); // Project/map updates may be newer than the current game release.
  }
 }
 const prefix='packages/mario-mix-terra/';
 for(const p of ['README.md','START_HERE.md','CONTRIBUTING.md','docs/GOVERNANCE.md','docs/KNOWN_LIMITS.md','docs/stages/ADD_LEVEL.md','docs/stages/ADD_CHARACTER.md','docs/stages/READINESS.md','docs/stages/CONTRACT.md','docs/ARCHITECTURE.md','docs/PUBLISH.md','docs/UI_CONTRACT.md']){const text=get(prefix+p).toString();if(copyIssues(text).length)throw Error('当前开发指南需要编辑：'+p);checked++;}
 for(const p of ['START_HERE.md','docs/stages/ADD_LEVEL.md','docs/stages/ADD_CHARACTER.md'])if(!get(prefix+p).toString().includes('http://127.0.0.1:4193/play.html?dev=1'))throw Error('实验教程缺少完整入口：'+p);
 return {publicViewsAndDocs:checked,versions,check:'pass',scope:'当前项目与开发指南；不含历史、维护记录及所有旧站页面',deployed:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(check());}catch(e){console.error(e.message);process.exitCode=1;}
