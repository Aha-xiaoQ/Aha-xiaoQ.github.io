import {validateDocumentation} from '../platform/contracts.mjs';
import {validateChapterPlan} from '../chapters/view.mjs?v=worlds-r21';
/** R04 data boundary. No DOM, network, browser storage or project-name branches. */
export const REVISION='journal-r04';
export const VIEWS=['overview','tasks','docs','updates','contribute','manage'];
export const RESERVED=new Set(['updates','contribute','archive','index','projects','manage']);
export const STATUS_LABELS={planned:'计划中',ready:'待处理',active:'进行中',review:'待验收',blocked:'待确认',done:'已完成'};
export const CATEGORY_LABELS={game:'游戏',web:'网站',tool:'工具',experiment:'实验',other:'其他'};
export const PUBLIC_TASK_STATUS=Object.keys(STATUS_LABELS);
export const MAX_BYTES=2*1024*1024;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validId(id){return typeof id==='string'&&/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)&&id.length<=60&&!RESERVED.has(id)&&!/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(id);}
export function localPath(p){return typeof p==='string'&&p.length<240&&!/[\\\x00-\x20?#:%]/.test(p)&&!p.startsWith('/')&&p.split('/').every(x=>x&&x!=='.'&&x!=='..'&&!x.startsWith('.'));}
export function safeLink(s){
 if(typeof s!=='string'||!s||/[\x00-\x20\\]/.test(s))return '';
 if(s.startsWith('/')&&!s.startsWith('//')&&!s.split(/[?#]/)[0].split('/').some(p=>p==='..'||p==='.')&&!/%(?:2e|2f|5c)/i.test(s))return s;
 try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}
}
function text(s,label,max=300){if(typeof s!=='string'||!s.trim()||s.length>max)throw Error(label+' 必须是 1–'+max+' 字符的文字。');}
function date(s,label){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(label+' 日期无效。');}
function array(a,label){if(!Array.isArray(a))throw Error(label+' 必须是数组。');}
export function validateCatalog(c){
 if(c?.schemaVersion!==1)throw Error('项目索引版本不受支持。');array(c.projects,'projects');array(c.aliases,'aliases');
 const ids=new Set();for(const x of c.projects){if(!validId(x.id)||ids.has(x.id))throw Error('无效或重复的项目 ID：'+x.id);ids.add(x.id);if(x.file!==`content/development/projects/${x.id}.json`)throw Error('项目配置路径必须与 ID 对应。');}
 const aliases=new Set();for(const a of c.aliases){if(!/^\/dev\/(?:[a-z0-9/-]+|guide\.html|index\.html|mario-mix\/index\.html)?$/.test(a.from)||aliases.has(a.from)||!ids.has(a.projectId)||!VIEWS.includes(a.view)||(a.doc&&(!validId(a.doc)||a.view!=='docs')))throw Error('旧入口无效：'+a.from);aliases.add(a.from);}
 return c;
}
export function validateProject(p){
 validateChapterPlan(p?.chapterPlan);
 if(p?.schemaVersion!==1||!validId(p.id))throw Error('项目版本或 ID 无效。');text(p.title,'title',48);text(p.summary,'summary',160);text(p.intro,'intro',360);text(p.stage,'stage',32);if(p.publicStage!==undefined)text(p.publicStage,'publicStage',48);
 if(!own(CATEGORY_LABELS,p.category)||!['public','draft','archived'].includes(p.visibility))throw Error('项目类型或可见性无效。');date(p.updatedAt,'updatedAt');
 array(p.links,'links');for(const l of p.links){text(l.label,'链接标题',32);if(!safeLink(l.href))throw Error('不安全链接：'+l.href);}
 array(p.highlights,'highlights');if(p.highlights.length>3)throw Error('概览最多三个重点。');p.highlights.forEach(x=>text(x,'highlight',160));
 array(p.docs,'docs');const docIds=new Set();for(const d of p.docs){if(!validId(d.id)||docIds.has(d.id))throw Error('文档 ID 无效或重复。');docIds.add(d.id);if(d.archived!==undefined&&typeof d.archived!=='boolean')throw Error('archived must be boolean');if(d.action){text(d.action.label,'主要动作',32);if(!safeLink(d.action.href))throw Error('主要动作URL无效');}text(d.title,'文档标题',48);text(d.summary,'文档介绍',160);array(d.sections,'文档章节');for(const s of d.sections){text(s.title,'章节标题',64);array(s.paragraphs,'章节正文');s.paragraphs.forEach(x=>text(x,'正文',2000));if(s.code!=null)text(s.code,'代码示例',3000);}if(d.sources){array(d.sources,'sources');for(const l of d.sources)if(!safeLink(l.href))throw Error('文档来源 URL 无效。');}}
 array(p.updates,'updates');const updateIds=new Set();for(const u of p.updates){if(!validId(u.id)||updateIds.has(u.id))throw Error('更新 ID 无效或重复。');updateIds.add(u.id);date(u.date,'更新日期');if(u.revision!==undefined&&(!Number.isSafeInteger(u.revision)||u.revision<1))throw Error('更新修订号无效');text(u.title,'更新标题',64);text(u.summary,'更新说明',400);if(!['released','local-review','planned'].includes(u.status))throw Error('更新必须明确已发布 / 本地待验收 / 计划。');}
 const revisions=p.updates.filter(u=>u.revision!==undefined).map(u=>u.revision);if(new Set(revisions).size!==revisions.length)throw Error('更新修订号重复');
 if(p.currentRelease){const r=p.currentRelease;if(!validId(r.documentId)||!/^\d+\.\d+\.\d+$/.test(r.version)||!['local-review','released','planned'].includes(r.status)||(r.documentationRevision!==undefined&&(!Number.isSafeInteger(r.documentationRevision)||r.documentationRevision<1))||!safeLink(r.sourceHref)||!safeLink(r.manifestHref))throw Error('当前版本字段无效');const u=p.updates.find(u=>u.id===r.updateId);if(!u||u.status!==r.status)throw Error('当前版本与更新记录不一致');const d=p.docs.find(d=>d.id===r.documentId);if(!d||!d.action||d.action.href!==r.sourceHref)throw Error('当前源码下载不一致');}
 if(p.archivedState&&(!['legacy-a','legacy-b'].includes(p.archivedState.adapter)||!localPath(p.archivedState.path)||!['native','clarity'].includes(p.archivedState.runtime)))throw Error('历史状态来源无效');
 if(!p.participation||!['open','preparing','closed'].includes(p.participation.mode))throw Error('参与状态无效。');text(p.participation.summary,'参与说明',300);
 if(!p.state||!['legacy-a','legacy-b','project-v1'].includes(p.state.adapter)||!localPath(p.state.path))throw Error('任务数据源无效。');
 if(p.participation.issueUrl&&!safeLink(p.participation.issueUrl))throw Error('参与链接无效。');
 if(p.state.adapter!=='project-v1'&&!['native','clarity'].includes(p.state.runtime))throw Error('旧记录必须指定已检测的运行布局。');
 validateDocumentation(p);return p;
}
export function validateState(s,projectId){
 if(s?.schemaVersion!==1||s.projectId!==projectId||!Number.isInteger(s.revision)||s.revision<1)throw Error('状态版本、项目归属或修订号不匹配。');date(s.updatedAt,'状态日期');array(s.tasks,'tasks');
 const ids=new Set();for(const t of s.tasks){if(typeof t.id!=='string'||!/^[A-Z][A-Z0-9-]{1,48}$/.test(t.id)||ids.has(t.id))throw Error('任务编号重复或无效。');ids.add(t.id);text(t.title,'任务标题',100);text(t.summary,'任务说明',600);text(t.area,'任务分组',48);if(!PUBLIC_TASK_STATUS.includes(t.status))throw Error('任务状态无效。');if(!['P0','P1','P2'].includes(t.priority))throw Error('任务优先级无效。');array(t.acceptance,'验收条件');t.acceptance.forEach(x=>text(x,'验收条件',400));array(t.dependsOn,'依赖');if(t.status==='done'&&!(typeof t.evidence==='string'&&t.evidence.trim()))throw Error('完成任务必须提供验收依据。');}
 for(const t of s.tasks)for(const dep of t.dependsOn)if(!ids.has(dep)||dep===t.id)throw Error('任务依赖不存在或引用自身：'+dep);
 const map=new Map(s.tasks.map(t=>[t.id,t]));const visiting=new Set(),done=new Set();const visit=id=>{if(visiting.has(id))throw Error('任务存在循环依赖。');if(done.has(id))return;visiting.add(id);map.get(id).dependsOn.forEach(visit);visiting.delete(id);done.add(id);};ids.forEach(visit);return s;
}
export function normalizeState(raw,p){
 if(p.state.adapter==='project-v1'){validateState(raw,p.id);return {...raw,sourceRevision:String(raw.revision)};}
 if(raw?.schemaVersion!==1||!Array.isArray(raw.tasks))throw Error('旧任务数据格式不完整。');
 const isA=p.state.adapter==='legacy-a';const mapStatus=s=>({doing:'active',in_progress:'active',verify:'review'})[s]||s;
 const tasks=raw.tasks.map(t=>({id:String(t.id),title:String(t.title||''),summary:String(t.summary||t.description||''),area:String(t.area||t.module||'其他'),status:mapStatus(t.status),priority:t.priority||'P1',acceptance:Array.isArray(t.acceptance)?t.acceptance:[String(t.acceptance||'由维护者补充验收条件。')],dependsOn:[...(t.dependsOn||[])],owner:String(t.owner||''),evidence:String(t.evidence||''),notes:String(t.notes||''),issueUrl:safeLink(t.issueUrl||''),audience:/^(COL|OPS|DOC)-/.test(t.id)?'maintenance':'public'}));
 if(tasks.some(t=>!PUBLIC_TASK_STATUS.includes(t.status)))throw Error('旧记录含未知任务状态；停止显示完成统计。');
 const ids=new Set(tasks.map(t=>t.id));if(ids.size!==tasks.length)throw Error('旧记录存在重复任务编号。');
 return {schemaVersion:1,projectId:p.id,revision:isA?1:raw.revision,sourceRevision:String(raw.release||'')+' / '+String(raw.updatedAt||''),updatedAt:raw.updatedAt,tasks,legacy:true};
}
export function visibleTasks(s){return s.tasks.filter(t=>t.audience!=='maintenance');}
export function filterTasks(tasks,{q='',status='',page=1,size=6,translate=value=>value}={}){
 if(typeof translate!=='function')throw Error('Invalid search translator');
 const needle=String(q).trim().toLowerCase();const items=tasks.filter(t=>(!status||t.status===status)&&(!needle||[t.id,t.title,t.summary,t.area,...[t.title,t.summary,t.area].map(translate)].join(' ').toLowerCase().includes(needle)));
 size=Number.isFinite(Number(size))?Math.max(1,Math.min(50,Math.floor(Number(size)))):6;
 const pages=Math.max(1,Math.ceil(items.length/size)),current=Math.min(pages,Math.max(1,Number.isFinite(Number(page))?Math.floor(Number(page)):1));return {items:items.slice((current-1)*size,current*size),count:items.length,page:current,pages};
}
export function projectURL(id,view='overview',doc=''){return '/notes/'+id+'/'+(view==='overview'?'':view+'/')+(doc?doc+'/':'');}
export function route(pathname,catalog){
 if(globalThis.SITE_RELEASE?.publicMode&&/\/manage(?:\/|$)/.test(pathname))return {view:'not-found'};
 let path;try{path=decodeURI(pathname);}catch{return {view:'not-found'};}if(path.includes('..')||path.includes('\\'))return {view:'not-found'};
 path=path.replace(/index\.html$/,'');if(!path.endsWith('/')&&!path.endsWith('.html'))path+='/';
 const legacyGuide=path.match(/^\/notes\/([a-z0-9-]+)\/guide\.html$/);if(legacyGuide&&catalog.projects.some(p=>p.id===legacyGuide[1]))return {projectId:legacyGuide[1],view:'contribute',canonical:projectURL(legacyGuide[1],'contribute')};
 const alias=catalog.aliases.find(a=>a.from===pathname||a.from===path);if(alias)return {projectId:alias.projectId,view:alias.view,doc:alias.doc||'',canonical:projectURL(alias.projectId,alias.view,alias.doc)};
 if(path==='/notes/')return {view:'index'};if(path==='/notes/updates/')return {view:'updates'};if(path==='/notes/contribute/')return {view:'contribute'};
 const match=path.match(/^\/notes\/([a-z0-9-]+)\/(?:([a-z-]+)\/)?(?:([a-z0-9-]+)\/)?$/);
 if(!match)return {view:'not-found'};let [,id,view='overview',doc='']=match;
 if(!validId(id)||!VIEWS.includes(view)||(doc&&view!=='docs'))return {view:'not-found'};
 return {projectId:id,view,doc};
}
export function canClaim(task,state,project){return project.participation.mode==='open'&&task.status==='ready'&&!task.owner&&task.dependsOn.every(id=>state.tasks.find(t=>t.id===id)?.status==='done');}
export function mergeDraft(base,incoming,projectId){
 validateState(base,projectId);validateState(incoming,projectId);if(incoming.revision!==base.revision)throw Error('草稿基线不同，请先合并，未覆盖共享记录。');return structuredClone(incoming);
}

/** R15: explicit release identity. Unknown/legacy projects keep their original stage. */
export function projectStage(p){if(typeof p.publicStage==='string'&&p.publicStage.trim())return p.publicStage;if(p.publicSite===true)return p.stage;return p.currentRelease?`开发版 ${p.currentRelease.version} · ${{'local-review':'待验收',released:'已发布',planned:'计划中'}[p.currentRelease.status]}`:p.stage;}
export function updateOrder(a,b){
 const cmp=(x,y)=>x<y?-1:x>y?1:0;
 return cmp(b.date,a.date)||(Number.isSafeInteger(b.revision)?b.revision:0)-(Number.isSafeInteger(a.revision)?a.revision:0)||cmp(a.project.id,b.project.id)||cmp(a.id,b.id);
}
export function legacyProject(p){return p.archivedState?{...p,state:p.archivedState}:p.state.adapter!=='project-v1'?p:null;}

/** Keep internal content/template updates out of the public release timeline. */
export function releaseUpdates(p){return p.updates.filter(u=>!['content','level-atlas'].includes(u.kind));}
