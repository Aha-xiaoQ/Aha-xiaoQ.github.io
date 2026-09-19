import {renderMarkdown} from './markdown.mjs?v=docs-r26';
import {readingLink,readingDocument} from './documents.mjs?v=docs-r26';
import {chapterSummary,chapterAtlas} from '../chapters/view.mjs?v=worlds-r21';
import {tocMarkup} from '../experience/model.mjs?v=experience-r18';
import {esc,safeLink,projectURL,STATUS_LABELS,CATEGORY_LABELS,filterTasks,visibleTasks,canClaim,projectStage,updateOrder,legacyProject} from './model.mjs?v=workshop-r21';
import '../ui/site-actions.js?v=workshop-r17';
const A=globalThis.SITE_ACTIONS;
const EMBLEMS=Object.freeze({game:['PLAY','controller'],web:['BUILD','web-studio'],tool:['TOOLS','workflow'],experiment:['LAB','experiment'],other:['CREATE','workflow']});
// R12: compact identifiers for the two existing categories; no banner slogans.
const COMPACT_ICONS=Object.freeze({game:'controller',web:'web-studio'});
export function projectEmblem(category){
 const icon=Object.hasOwn(COMPACT_ICONS,category)?COMPACT_ICONS[category]:null;
 if(icon)return `<div class="j-project-emblem j-project-emblem--compact" aria-hidden="true"><img class="j-compact-icon" src="/assets/journal/icons/${icon}.svg?v=workshop-r12" alt="" width="96" height="72" decoding="async"></div>`;
 const [word,art]=EMBLEMS[category]||EMBLEMS.other;
 return `<div class="j-project-emblem" aria-hidden="true"><span class="j-emblem-word">${word}</span><img class="j-emblem-art" src="/assets/illustrations/${art}.svg?v=workshop-r08" alt="" width="320" height="180" decoding="async"></div>`;
}
export const updateLabels={'released':'已发布','local-review':'待验收','planned':'计划'};
const link=(text,href,cls='j-link',options={})=>safeLink(href)?A.link(text,safeLink(href),{className:cls,variant:cls==='button'?'primary':cls.includes('button--quiet')?'secondary':cls==='j-card-action'?'card':cls==='j-title-link'?'text':'quiet',newTab:href.startsWith('https:'),download:href.startsWith('/')&&/\.zip(?:[?#]|$)/i.test(href),...options}):'';
const sectionHead=(k,title,desc='')=>`<div class="section-head"><div><p class="eyebrow">${esc(k)}</p><h2>${esc(title)}</h2></div>${desc?`<p>${esc(desc)}</p>`:''}</div>`;
export function metadata(r,projects,catalog){
 const p=projects.find(x=>x.id===r.projectId&&x.visibility!=='draft');
 if(r.projectId&&!p||r.view==='not-found')return {title:'未找到这条记录',intro:'项目可能尚未公开，或链接有误。已有作品与记录仍可从开发栏目找到。',eyebrow:'IN THE MAKING',notFound:true};
 if(!p){const title=r.view==='updates'?'近期更新':r.view==='contribute'?'一起参与':'开发';return {title,intro:r.view==='contribute'?'反馈、测试、设计与代码，选择熟悉的方式参与。':(r.view==='index'?'游戏、工具和网站的开发记录。查看进展、下载源码，或参与一项改进。':catalog.intro),eyebrow:'IN THE MAKING'};}
 const d=r.doc?p.docs.find(d=>d.id===r.doc):null;
 if(r.doc&&!d)return {title:'资料尚未收录',intro:'请返回项目资料页查看已有内容。',eyebrow:'IN THE MAKING',notFound:true};
 const viewNames={tasks:'任务与反馈',docs:'开发资料',updates:'更新记录',contribute:'反馈与贡献',manage:'交接与管理'};
 return {title:d?.title||(r.view==='overview'?p.title:viewNames[r.view]),intro:d?.summary||(r.view==='overview'?p.summary:`${p.title} · ${viewNames[r.view]}`),eyebrow:'IN THE MAKING / '+CATEGORY_LABELS[p.category]};
}
export function selectProjects(projects,{q='',category='all',page=1}={}){
 q=String(q).trim().slice(0,100);
 const matches=projects.filter(p=>p.visibility!=='draft'&&(category==='archived'?p.visibility==='archived':p.visibility!=='archived'&&(category==='all'||p.category===category))&&(!q||[p.title,p.summary].join(' ').toLowerCase().includes(q.toLowerCase())));
 const count=matches.length,pages=Math.max(1,Math.ceil(count/6)),current=Math.min(pages,Math.max(1,Math.floor(Number(page))||1));
 return {count,pages,current,items:matches.slice((current-1)*6,current*6)};
}
export function renderProjectCards(projects,filters={}){
 const {count,pages,current,items}=selectProjects(projects,filters);
 if(!count)return '<div class="entry j-empty"><h3>还没有符合条件的项目</h3><p>换一个关键词，或查看全部项目。</p><button class="button button--quiet" data-reset-projects>查看全部</button></div>';
 const cards=items.map((p,i)=>`<article class="entry j-project-card j-project-card--${(current-1)*6+i===0?'lead':'secondary'}" data-project-id="${esc(p.id)}" data-kind="${esc(p.category)}"><div class="j-card-top"><span class="j-category">${esc(CATEGORY_LABELS[p.category])}</span><span class="j-card-index" aria-hidden="true">${String((current-1)*6+i+1).padStart(2,'0')}</span></div>${projectEmblem(p.category)}<div class="j-card-copy"><span class="j-stage">${esc(p.visibility==='archived'?'已归档':projectStage(p))}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div><div class="j-card-bottom">${link('查看项目',projectURL(p.id),'j-card-action',{ariaLabel:'查看项目：'+p.title})}</div></article>`).join('');
 return cards+(pages>1?`<div class="j-pagination j-project-pagination" role="group" aria-label="项目分页"><button class="button button--quiet" data-project-page="${current-1}" ${current===1?'disabled':''}>上一页</button><span role="status">${count} 个项目 · 第 ${current} / ${pages} 页</span><button class="button button--quiet" data-project-page="${current+1}" ${current===pages?'disabled':''}>下一页</button></div>`:'');
}
export function updateRows(projects,{projectId,limit=100}={}){
 const rows=projects.filter(p=>p.visibility!=='draft'&&(!projectId||p.id===projectId)).flatMap(p=>p.updates.map(u=>({...u,project:p}))).sort(updateOrder).slice(0,limit);
 if(!rows.length)return '<p class="j-empty-text">还没有公开的更新记录。计划确认后会在这里说明。</p>';
 return '<ol class="j-update-list">'+rows.map(u=>`<li><time datetime="${u.date}">${esc(u.date)}</time><div><div class="j-meta"><span>${esc(u.project.title)}</span><span class="j-stage">${esc(updateLabels[u.status])}</span></div><h3>${link(u.title,projectURL(u.project.id,'updates'),'j-title-link')}</h3><p>${esc(u.summary)}</p></div></li>`).join('')+'</ol>';
}
function notesSection(notes){
 const list=notes.filter(n=>n.visibility==='public');if(!list.length)return '';
 return `<section class="section">${sectionHead('NOTES','制作笔记','保留动手过程中的发现与方法。')}<div class="j-notes-grid">${list.map(n=>`<article class="entry"><p class="j-meta">${esc(n.publishedAt||'')} ${esc(n.type||'')}</p><h3>${safeLink(n.url||n.localUrl||'')?link(n.title,n.url||n.localUrl,'j-title-link'):esc(n.title)}</h3><p>${esc(n.summary||'')}</p></article>`).join('')}</div></section>`;
}
function indexPage(projects,notes){
 const cats=[...new Set(projects.filter(p=>p.visibility==='public').map(p=>p.category))];
 return `<section class="section">${sectionHead('PROJECTS','项目进展')}<div class="j-toolbar"><div class="filter-bar j-project-filter" aria-label="项目类型"><button type="button" data-category="all" aria-pressed="true">全部</button>${cats.map(c=>`<button type="button" data-category="${c}" aria-pressed="false">${CATEGORY_LABELS[c]}</button>`).join('')}${projects.some(p=>p.visibility==='archived')?'<button type="button" data-category="archived" aria-pressed="false">归档</button>':''}</div><label class="j-search"><span class="j-search-label">搜索项目</span><input type="search" data-project-search placeholder="项目名称或关键词" maxlength="100" enterkeyhint="search"></label></div><div class="j-project-results-meta"><span role="status" aria-live="polite" aria-atomic="true" data-project-result-status>显示 ${selectProjects(projects).count} 个项目</span><button type="button" class="j-clear-filter" data-clear-project-filters hidden>清除筛选</button></div><div class="j-project-grid" data-project-results>${renderProjectCards(projects)}</div></section><section class="section">${sectionHead('02 / UPDATES','最近有什么变化','查看新功能、问题修复和开发进展。')}<div data-update-preview>${updateRows(projects,{limit:2})}</div><div class="j-section-footer">${link('全部更新','/notes/updates/')}</div></section>${notesSection(notes)}<section class="section"><div class="entry j-invite"><div><p class="eyebrow">MAKE SOMETHING TOGETHER</p><h2>一起改进作品</h2><p>发现一个问题，分享一次试玩，或把一处细节做得更好。从你擅长的事开始。</p></div>${link('参与方式','/notes/contribute/','button button--quiet')}</div></section>`;
}
function navigation(p,r){
 const names={overview:'概览',tasks:'任务',docs:'资料',updates:'更新',contribute:'参与'};
 const document=r.doc?p.docs.find(d=>d.id===r.doc):null;
 const tail=document?'<span aria-hidden="true">/</span>'+link('资料',projectURL(p.id,'docs'))+'<span aria-hidden="true">/</span><span aria-current="page">'+esc(document.title)+'</span>':r.view!=='overview'?'<span aria-hidden="true">/</span><span aria-current="page">'+esc(r.view==='manage'?'交接与管理':names[r.view])+'</span>':'';
 return `<div class="j-path"><div class="j-breadcrumb" role="navigation" aria-label="当前位置">${link('开发','/notes/')}<span>/</span>${r.view==='overview'?`<span aria-current="page">${esc(p.title)}</span>`:link(p.title,projectURL(p.id))}${tail}</div><div class="j-subnav" role="navigation" aria-label="项目内导航">${Object.entries(names).map(([v,label])=>`<a href="${projectURL(p.id,v)}"${r.view===v?' aria-current="page"':''}>${label}</a>`).join('')}</div></div>`;
}
function overview(p){
 return `<section class="section j-overview"><div class="j-overview-main"><p class="j-meta"><span class="j-category">${esc(CATEGORY_LABELS[p.category])}</span><span>${esc(p.visibility==='archived'?'已归档':projectStage(p))}</span></p><h2>关于这个作品</h2><p class="j-lead">${esc(p.intro)}</p><div class="actions">${p.links.slice(0,2).map((l,i)=>link(l.label,l.href,'button'+(i?' button--quiet':''))).join('')}</div></div><aside class="entry j-focus" aria-labelledby="j-focus-title"><p class="eyebrow">IN FOCUS</p><h2 id="j-focus-title">当前重点</h2><ol>${p.highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ol><p class="j-small">记录日期：<time datetime="${p.updatedAt}">${p.updatedAt}</time></p></aside></section>${chapterSummary(p.chapterPlan)}<section class="section">${sectionHead('EXPLORE','从这里继续')}<div class="j-shortcuts">${[['tasks','任务与反馈','找到值得改进的细节，或补充一次真实体验。'],['docs','开发资料','先把项目跑起来，再深入实现与设计。'],['contribute','一起参与',p.participation.summary]].map(([v,t,d])=>`<article class="entry j-destination"><a ${A.attributes(projectURL(p.id,v),{className:'j-destination-link',ariaLabel:t+'：'+p.title})}><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="j-destination-label">${v==='tasks'?'查看任务':v==='docs'?'浏览资料':'参与方式'}</span></a></article>`).join('')}</div></section><section class="section">${sectionHead('JOURNAL','最近的变化')} ${updateRows([p],{limit:1})}${p.links.length>2?'<div class="j-resources"><span>更多入口</span>'+p.links.slice(2).map(l=>link(l.label,l.href)).join('')+'</div>':''}</section>`;
}
export function taskResults(p,state,filters={}){
 const selected=filterTasks(visibleTasks(state),filters);
 const cards=selected.items.map(t=>{
   const deps=t.dependsOn.map(id=>{const x=state.tasks.find(x=>x.id===id);return id+' · '+(x?STATUS_LABELS[x.status]:'未登记');});
   let href=t.issueUrl||p.participation.issueUrl;if(href){const u=new URL(href);u.searchParams.set('title',`[${p.title}] ${t.id} ${t.title}`);u.searchParams.set('body',`关联项目：${p.title}\n关联任务：${t.id}\n\n我想讨论 / 认领的内容：\n\n复现步骤或方案：\n`);href=u.href;}
   return `<article class="entry j-task" data-task-id="${esc(t.id)}"><div class="j-meta"><span>${esc(t.id)}</span><span>${esc(t.area)}</span><span class="j-status" data-status="${esc(t.status)}">${esc(STATUS_LABELS[t.status])}</span></div><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p><details><summary>查看验收要求${t.dependsOn.length?'与前置事项':''}</summary><div class="j-detail"><h4>怎样算完成</h4><ul>${t.acceptance.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>${deps.length?`<p><strong>前置事项：</strong>${esc(deps.join('；'))}</p>`:''}${t.owner?`<p><strong>负责人：</strong>${esc(t.owner)}</p>`:''}${t.evidence?`<p><strong>记录中的依据：</strong>${esc(t.evidence)}</p>`:''}${t.notes?`<p><strong>补充说明：</strong>${esc(t.notes)}</p>`:''}${p.visibility!=='archived'&&p.participation.mode!=='closed'?'<div class="actions">'+link(canClaim(t,state,p)?'留言认领':'讨论这项任务',href,'button button--quiet')+'</div>':''}</div></details></article>`;
 }).join('');
 return `<p class="j-result-summary" role="status" aria-live="polite">${selected.count} 项记录 · 第 ${selected.page} / ${selected.pages} 页</p><div class="j-task-grid">${cards||'<div class="entry j-empty"><h3>没有找到相应记录</h3><p>请换一个关键词或状态。</p><button class="button button--quiet" data-reset-tasks>清除筛选</button></div>'}</div>${selected.count?`<div class="j-pagination"><button class="button button--quiet" data-task-page="${selected.page-1}" ${selected.page===1?'disabled':''}>上一页</button><span>每页最多 6 项</span><button class="button button--quiet" data-task-page="${selected.page+1}" ${selected.page===selected.pages?'disabled':''}>下一页</button></div>`:''}`;
}
function tasksPage(p,state,error){
 if(error||!state)return `<section class="section"><div class="entry j-error" role="alert"><h2>任务记录暂时无法读取</h2><p>任务列表暂时无法加载，请重试。</p><button class="button button--quiet" data-reload>重新加载</button></div></section>`;
 return `<section class="section"><p class="j-description">选择一项任务，查看验收要求后到仓库讨论。待验收表示仍需核对，不等于已发布。</p><p class="j-small">共享记录更新于 ${esc(state.updatedAt)} · 非 GitHub 实时看板${state.legacy?' · 维护性任务保留在交接页':''}</p><div class="j-toolbar j-task-controls"><label class="j-search"><span>搜索任务</span><input type="search" data-task-search placeholder="编号、问题或模块" maxlength="160"></label><label><span>状态</span><select data-task-status><option value="">全部状态</option>${Object.entries(STATUS_LABELS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label></div><div data-task-results>${taskResults(p,state)}</div></section>`;
}
function docsPage(p,r){
 if(r.doc){const d=p.docs.find(d=>d.id===r.doc);if(d.readingDocument){const body=readingDocument(p.id,d.id);const parent=p.docs.find(x=>x.id===d.parentDoc);return `<article class="section j-reading j-document"><p>${link('返回项目资料',projectURL(p.id,'docs'))}${parent?' · '+link(parent.title,projectURL(p.id,'docs',parent.id)):''}</p>${d.versioned?'<div class="entry j-notice"><strong>历史版本资料</strong><p>本文对应标题中标注的版本；当前源码和验收状态请查看项目资料。</p></div>':''}<div class="j-markdown">${renderMarkdown(body.markdown,{resolveLink:href=>readingLink(href,body.source),omitFirstHeading:true})}</div><p>${link('返回项目资料',projectURL(p.id,'docs'))}</p></article>`;}const action=p.currentRelease&&d.id===p.currentRelease.documentId?{label:`下载源码（${p.currentRelease.version}）`,href:p.currentRelease.sourceHref}:d.action;return `<article class="section j-reading"><p>${link('返回项目资料',projectURL(p.id,'docs'))}</p>${d.archived?`<div class="entry j-notice"><strong>历史资料，仅供追溯</strong><p>本文保留当时的版本与结论。请从项目资料页获取当前源码。</p></div>`:''}${action?`<div class="actions">${link(action.label,action.href,'button')}</div>`:''}${p.currentRelease&&d.id===p.currentRelease.documentId?`<p class="j-try-work">只想先玩一玩？${link('打开已发布试玩',p.links.find(l=>/^\/games\/[^/]+\/play\.html$/.test(l.href))?.href||'/games/')}。开发源码的验收状态见上方版本说明。</p>`:''}${d.kind==='level-atlas'?chapterAtlas(p.chapterPlan):''}${tocMarkup(d.sections)}${d.sections.map((s,i)=>`<section><h2 id="guide-section-${i+1}" tabindex="-1">${esc(s.title)}</h2>${s.paragraphs.map(x=>`<p>${esc(x)}</p>`).join('')}${s.code?`<div data-code-example><pre tabindex="0" aria-label="可复制的命令"><code>${esc(s.code)}</code></pre><button class="button button--quiet" type="button" data-copy-code>复制命令</button><p class="j-small" role="status" data-copy-status></p></div>`:''}</section>`).join('')}${d.sources?.length?'<section><h2>继续阅读</h2>'+d.sources.map(l=>link(l.label,l.href)).join('<br>')+'</section>':''}</article>`;}
 const current=p.docs.filter(d=>!d.archived&&!d.readingDocument),history=p.docs.filter(d=>d.archived&&!d.readingDocument);
 return `<section class="section">${sectionHead('DEVELOP','从当前版本开始','下载源码，运行项目，再选择一个明确的改动。')}<div class="j-shortcuts" data-current-docs>${current.map(d=>`<article class="entry j-destination"><a ${A.attributes(projectURL(p.id,'docs',d.id),{className:'j-destination-link',ariaLabel:d.title})}><h3>${esc(d.title)}</h3><p>${esc(d.summary)}</p><span class="j-destination-label">${d.action?'下载与运行':'阅读指南'}</span></a></article>`).join('')||'<p>资料正在整理。</p>'}</div>${history.length?`<details class="j-legacy-details" data-history-docs><summary>历史版本与过程资料（${history.length}）</summary><p>保留旧链接和决策依据，不作为当前开发入口。</p><ul>${history.map(d=>`<li>${link(d.title,projectURL(p.id,'docs',d.id))}</li>`).join('')}</ul></details>`:''}</section>`;
}

function contributePage(p){return `<section class="section j-reading"><h2>${p?'从一项小改动开始':'选择你熟悉的方式'}</h2><p>${esc(p?.participation.summary||'不必先掌握整个项目。先选择感兴趣的作品，把一次体验、一个问题或一条清楚的建议带回来。')}</p><div class="j-contribute-options"><article class="entry"><h3>体验与反馈</h3><p>说明版本、设备与复现步骤，让另一个人也能看到同样的问题。</p></article><article class="entry"><h3>文档与设计</h3><p>改进不清楚的说明，补充素材来源，或提出有依据的交互建议。</p></article><article class="entry"><h3>代码与测试</h3><p>先讨论较大的改动。一项 PR 尽量只解决一件事，并附验证方式。</p></article></div><section><h2>参与之前</h2><p>先阅读项目范围，在 Issue 中说明计划；认领情况以维护者确认的记录为准。</p><p>请保留素材来源与许可说明。AI 辅助内容也需要提交者理解、检查并对结果负责。</p>${p?'<div class="actions">'+link('查看任务',projectURL(p.id,'tasks'),'button')+link('前往仓库讨论',p.participation.issueUrl,'button button--quiet')+'</div>':link('选择项目','/notes/','button')}</section></section>`;}
function managePage(p,state){const old=legacyProject(p);return `<section class="section"><div class="entry j-notice"><h2>项目记录维护</h2><p>共享记录更新后需要校验、构建并提交。此页面是公开资料，不是权限后台。</p><p>当前状态：<code>${esc(p.state.path)}</code></p></div>${p.state.generatedFrom?`<div class="entry j-management"><h3>任务在源码中维护</h3><p>编辑 <code>${esc(p.state.generatedFrom)}</code> 后重新生成。网页 JSON 是只读快照；不要在生成文件中改状态。</p><pre><code>npm run content:sync
npm run journal:build
npm run content:check</code></pre><button class="button button--quiet" data-export-state>导出当前记录备查</button></div>`:''}${old?`<details class="j-legacy-details"><summary>历史任务与原草稿工具</summary><p>这些是升级前的记录，不会同步到当前任务列表。${link('查看历史任务源','/'+old.state.path)}</p><div data-legacy-host></div></details>`:!p.state.generatedFrom?'<div class="entry j-management"><h3>共享记录按文件维护</h3><p>下载当前记录，在本地修改并校验后提交。</p><button class="button button--quiet" data-export-state>下载当前项目 JSON</button></div>':''}<div class="j-resources">${link('内容维护与版本交接','/docs/content-r15/START_HERE.md')}</div></section>`;}

export function render(r,{projects,catalog,states={},errors={},notes=[],publicMode=Boolean(globalThis.SITE_RELEASE?.publicMode)}){
 if(publicMode && r.view==='manage')r={view:'not-found'};
 const p=projects.find(p=>p.id===r.projectId&&p.visibility!=='draft'),m=metadata(r,projects,catalog);let html='';
 if(m.notFound)html=`<section class="section"><div class="entry j-empty"><h2>没有可显示的记录</h2><p>${esc(m.intro)}</p>${link('返回开发','/notes/','button')}</div></section>`;
 else if(!p){html=r.view==='index'?indexPage(projects,notes):r.view==='updates'?`<section class="section">${sectionHead('JOURNAL','所有项目的更新','查看各项目的新功能、修复与计划。')}${updateRows(projects)}</section>`:contributePage();}
 else{html=navigation(p,r);if(p.visibility==='archived')html+='<p class="j-notice">此项目已归档。历史记录仍然保留，不再按活跃项目展示。</p>';
  if(r.view==='overview')html+=overview(p);else if(r.view==='tasks')html+=tasksPage(p,states[p.id],errors[p.id]);else if(r.view==='docs')html+=docsPage(p,r);else if(r.view==='updates')html+=`<section class="section">${sectionHead('JOURNAL','项目更新','版本改动与开发记录。')}${updateRows([p])}</section>`;else if(r.view==='contribute')html+=contributePage(p);else html+=managePage(p,states[p.id]);
  if(!publicMode&&r.view!=='manage')html+=`<div class="j-maintainer">${link('交接与管理',projectURL(p.id,'manage'))}</div>`;
 }
 return '<div class="journal" data-journal-view="'+esc(r.view)+'">'+html+'<p class="j-language-note" data-english-note hidden>Project records are currently written in Chinese.</p></div>';
}
