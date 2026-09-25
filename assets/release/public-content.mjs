import {isPublicUpdate} from '../journal/update-audience.mjs?v=dev-r44-55de28a9c31270b5';
import {withDocuments} from '../journal/documents.mjs?v=dev-r44-55de28a9c31270b5';
/** Public-site projection. Source tasks and engineering records remain unchanged. */
export const PUBLIC_EDITION='R24';
export const CLUTTER=/布局测试|测试夹具|外围文本夹具|假数据|占位页面|lorem ipsum|我已为你|按你的要求|用户要求|用户曾反馈|不虚构|没有伪造|本轮|下一轮|更新包不会|#\s*[AB]：/i;
export const isPublicMode=()=>Boolean(globalThis.SITE_RELEASE?.publicMode);
const clone=x=>JSON.parse(JSON.stringify(x));
export function publicProject(input){
 const p=withDocuments(input);p.publicSite=true;delete p.archivedState;
 // W02 is the current atlas. K01 remains available in source/history, not a
 // second public registry with stale counts and private engineering paths.
 if(p.chapterPlan)delete p.levelPlan;
 p.state={adapter:'project-v1',path:`content/development/states/${p.id}-public.json`};
 // Only current guides and an explicitly labelled version archive are published.
 p.docs=p.docs.filter(d=>!d.archived||d.id==='terra-history');
 for(const d of p.docs){
  d.sources=(d.sources||[]).filter(l=>!/^\/(?:docs|packages)\//.test(l.href));
  if(d.id==='terra-source'){
   d.summary=`开发源码 ${p.currentRelease.version}。下载、运行与参与开发。`;
   d.sections=d.sections.map(s=>s.title==='已知限制'?{...s,paragraphs:[
    `这是 ${p.currentRelease.version} 开发候选，和已发布试玩分别维护；完整设备与自然通关验收尚未完成。`,
    '地图工具 W02 使用独立的 M06 运行时，完整角色尚不能直接用于任意地图。第四期试玩与源码另有入口。',
    '源码包保留贡献指南、模块说明、测试和版本记录。'
   ]}:s);
  }
  if(d.id==='terra-stages')for(const s of d.sections)s.paragraphs=s.paragraphs.map(t=>t.startsWith('原三期试玩与 M06 源码未改')?`已发布的三期试玩独立维护。W02 内置 M06；当前开发源码为 ${p.currentRelease.version}。完整角色跨地图接入仍在完善；第四期资料单独维护。`:t);
  if(p.id==='pixel-workshop'&&d.id==='architecture')d.sections=d.sections.filter(s=>s.title!=='维护不是权限系统');
 }
 // Historical work logs are retained in the repository, not presented as releases.
 p.updates=p.updates.filter(u=>isPublicUpdate(u,p)).map(u=>({...u,public:true}));
 for(const u of p.updates)if(u.public&&u.id===p.currentRelease?.updateId){u.title=`开发源码 ${p.currentRelease.version}`;u.summary='角色选择、操作说明、设置与 HUD 已整理。此源码为开发候选，和已发布试玩分别维护。';}
 if(p.chapterPlan){p.stage=p.publicStage||p.stage;delete p.chapterPlan.source;}

 return p;
}
export function publicState(state){
 const s=clone(state),hidden=new Map(s.tasks.filter(t=>t.audience==='maintenance').map(t=>[t.id,t.status]));
 s.tasks=s.tasks.filter(t=>!hidden.has(t.id)).map(t=>{
  const {notes,evidence,origin,...rest}=t;
  return {...rest,status:t.status!=='done'&&t.dependsOn.some(x=>hidden.has(x)&&hidden.get(x)!=='done')?'blocked':t.status,dependsOn:t.dependsOn.filter(x=>!hidden.has(x)),evidence:t.status==='done'?'验收依据随源码记录保存。':''};
 });
 delete s.sourceRevision;delete s.source;delete s.generated;
 const repairs={
 'SITE-004':{summary:'完成网站验收后，记录实际提交号、部署结果与线上地址。'},
 'SITE-006':{summary:'维护可重复运行的回归检查，并在完整网站中扩大覆盖。'},
 'M04-PUBLISH':{title:'当前开发源码的实机验收与发布'},
 'M03-MAP14':{title:'核验 1-4 参考底图与机关规格',summary:'W02 已提供 1-4 参考底图。接下来对照原作独立核验地形、机关位置与通关条件；奥日关卡仍在开发。'}
 };
 for(const t of s.tasks)if(repairs[t.id])Object.assign(t,repairs[t.id]);return s;
}
export function publicSiteData(input){
 const s=clone(input);
 for(const key of ['items','tools','notes'])if(Array.isArray(s[key]))s[key]=s[key].filter(x=>x.visibility==='public'||(key==='tools'&&!x.visibility));
 const playable=(s.items||[]).filter(x=>x.primaryType==='game'&&x.localUrl&&x.lifecycleStatus!=='archived').sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))||String(a.id).localeCompare(String(b.id)));
 if(s.profile?.now&&playable.length){const x=playable[0];s.profile.now={label:'最近作品',title:x.title,summary:x.summary,updatedAt:x.updatedAt,items:[]};}
 if(s.profile?.copy?.worksIntro?.text)s.profile.copy.worksIntro.text='浏览作品，查看源码与开发记录。';
 return s;
}
export function publicCatalog(catalog,ids){const c=clone(catalog);c.projects=c.projects.filter(p=>ids.has(p.id));c.aliases=c.aliases.filter(a=>ids.has(a.projectId)&&a.view!=='manage');return c;}
