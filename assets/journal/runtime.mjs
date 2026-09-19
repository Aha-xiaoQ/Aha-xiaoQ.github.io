/** Content lifecycle only. Browser history and transition ownership stay in site-router.js. */
import {validateCatalog,validateProject,normalizeState,route,MAX_BYTES,visibleTasks,projectURL,legacyProject} from './model.mjs?v=workshop-r21';
import {render,metadata,renderProjectCards,selectProjects,taskResults} from './render.mjs?v=site-r23';
const siteRoot=new URL('../../',import.meta.url), configURL=new URL('content/development/catalog.json',siteRoot);
let catalogPromise, snapshot, current, activeLegacy;
const states=new Map(), errors=new Map(), nodes=new Map(), filters=new Map(), loads=new Map();
async function getJSON(url){
 url=new URL(url,siteRoot);if(url.origin!==siteRoot.origin)throw Error('项目数据只能从本站读取。');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const r=await fetch(url,{cache:'no-cache',credentials:'omit',signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status+'：'+url.pathname);const text=await r.text();if(new TextEncoder().encode(text).length>MAX_BYTES)throw Error('项目数据过大，未读取。');return JSON.parse(text);}finally{clearTimeout(timer);}
}
async function loadCatalog(){
 if(!catalogPromise)catalogPromise=(async()=>{const catalog=validateCatalog(await getJSON(configURL));const projects=await Promise.all(catalog.projects.map(async row=>{const p=validateProject(await getJSON(row.file));if(row.id!==p.id)throw Error('项目索引与文件 ID 不匹配。');return p;}));if(new Set(projects.map(p=>p.state.path)).size!==projects.length)throw Error('项目状态源重复，停止以防串用。');snapshot={catalog,projects};return snapshot;})().catch(e=>{catalogPromise=null;throw e;});return catalogPromise;
}
function loadScript(path){
 const u=new URL(path,siteRoot);if(u.origin!==siteRoot.origin)throw Error('脚本来源必须是本站。');if(loads.has(u.href))return loads.get(u.href);
 const p=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=u.href;const timer=setTimeout(()=>end(Error('旧记录工具加载超时')),12000);function end(e){clearTimeout(timer);s.onload=s.onerror=null;if(e){s.remove();loads.delete(u.href);reject(e);}else resolve();}s.onload=()=>end();s.onerror=()=>end(Error('旧记录工具未能加载'));document.head.append(s);});loads.set(u.href,p);return p;
}
async function legacyStyle(){
 const href=new URL('assets/site-development.css',siteRoot).href;
 let node=[...document.querySelectorAll('link[rel="stylesheet"]')].find(n=>n.href===href);
 if(node?.sheet)return;
 await new Promise((resolve,reject)=>{const fresh=!node;if(fresh){node=document.createElement('link');node.rel='stylesheet';node.href=href;}
 const timer=setTimeout(()=>done(Error('原记录样式加载超时')),12000);function done(error){clearTimeout(timer);node.onload=node.onerror=null;if(error)reject(error);else resolve();}node.onload=()=>done();node.onerror=()=>done(Error('原记录样式加载失败'));if(fresh)document.head.append(node);else if(node.sheet)done();});
}
async function prepareLegacy(p,r){
 if(p.state.runtime==='native'){
  if(!globalThis.SITE_DEV_PAGE)await loadScript('assets/site-dev-route.js');await globalThis.SITE_DEV_PAGE.prepare();return {kind:'native',api:globalThis.SITE_DEV_PAGE};
 }
 await legacyStyle();
 const mod=await import(new URL('../site-development.mjs',import.meta.url));await mod.prepare({view:new URL(location.href).searchParams.get('workspace')==='tasks'?'tasks':'manage'});return {kind:'clarity',api:mod};
}
const legacyByProject=new Map();
export async function prepare(info){
 let data;
 try{data=await loadCatalog();delete info.journalError;}catch(error){info.journalError=error.message;info.title='记录暂时无法读取 · 在下_小Q';return;}
 const r=route(info.journalPath||location.pathname,data.catalog),p=data.projects.find(p=>p.id===r.projectId&&p.visibility!=='draft');
 info.journalRoute=r;const meta=metadata(r,data.projects,data.catalog);info.title=meta.title+' · 在下_小Q';if(r.canonical)info.canonical=r.canonical;
 if(p&&['tasks','manage'].includes(r.view)){
  if(!states.has(p.id))try{states.set(p.id,normalizeState(await getJSON(p.state.path),p));errors.delete(p.id);}catch(e){errors.set(p.id,e.message);}
  if(r.view==='manage'&&legacyProject(p)&&!legacyByProject.has(p.id))try{legacyByProject.set(p.id,await prepareLegacy(legacyProject(p),r));}catch(e){errors.set('legacy:'+p.id,e.message);}
 }
}
export function describe(pathname=location.pathname){
 if(!snapshot)return {title:'开发',intro:'项目记录暂时无法加载，请检查连接后重试。',eyebrow:'DEV LOG'};
 return metadata(route(pathname,snapshot.catalog),snapshot.projects,snapshot.catalog);
}
const translations={'查看项目':'View project','全部更新':'All updates','参与方式':'How to contribute','返回项目资料':'Back to project guides','选择项目':'Choose a project','交接与管理':'Handoff and management','下载与运行':'Download and run','阅读指南':'Read guide','浏览资料':'Browse guides','查看任务':'View tasks','新标签页':'New tab','复制命令':'Copy commands','已复制。':'Copied.','剪贴板不可用，请选择并复制上方命令。':'Clipboard unavailable. Select and copy the commands above.','开发':'Dev','正在打磨的作品':'In the making','最近有什么变化':'Recent changes','探索这个项目':'Explore this project','一起参与 ↗':'Contribute ↗','关于这个作品':'About this project','从这里继续':'Explore further','从项目开始':'Explore projects','近期记录':'Recent entries','近期更新':'Recent updates','全部':'All','归档':'Archived','游戏':'Games','网站':'Website','实验':'Experiments','查看项目进展 →':'View project progress →','查看全部更新 →':'All updates →','了解参与方式 →':'How to contribute →','概览':'Overview','任务':'Tasks','资料':'Guides','更新':'Updates','参与':'Contribute','交接与管理 →':'Handoff and management →','搜索项目':'Search projects','搜索任务':'Search tasks','全部状态':'All statuses','上一页':'Previous','下一页':'Next','返回开发':'Back to Dev'};
const labelOriginals=new WeakMap();
function syncLanguage(){
 const english=document.documentElement.lang.startsWith('en');
 if(current){
  // The site's dictionary is frozen; use the existing language choice, never mutate it.
  current.dataset.i18nSkip='';
  const walker=document.createTreeWalker(current,NodeFilter.SHOW_TEXT);
  for(let n=walker.nextNode();n;n=walker.nextNode()){
   if(n.parentElement.closest('script,style,input,textarea,code,pre,[data-legacy-host]'))continue;
   let source=labelOriginals.get(n);if(!source&&Object.hasOwn(translations,n.nodeValue.trim())){source=n.nodeValue.trim();labelOriginals.set(n,source);}
   if(source){const next=english?translations[source]:source;if(n.nodeValue!==next)n.nodeValue=next;}
  }
  const n=current.querySelector('[data-english-note]');if(n)n.hidden=!english;
 }
 globalThis.SITE_I18N?.apply();
}
export function syncNavigation(app=document){
 const en=document.documentElement.lang.startsWith('en');const inNotes=/^\/(notes|dev)(\/|$)/.test(location.pathname);
 app.querySelectorAll('.site-header nav,.topbar>nav').forEach(nav=>{
  nav.style.flexWrap='wrap';
  nav.querySelectorAll('[data-nav-key="dev"]').forEach(n=>n.remove());
  nav.querySelectorAll('[data-nav-key="notes"]').forEach(a=>{a.dataset.i18nSkip='';a.href=new URL('notes/',siteRoot);const value=en?'Dev':'开发';if(a.textContent!==value)a.textContent=value;if(inNotes){nav.querySelectorAll('[aria-current="page"]').forEach(n=>n.removeAttribute('aria-current'));a.setAttribute('aria-current','page');}else a.removeAttribute('aria-current');});
 });
}
function filterState(id){if(!filters.has(id))filters.set(id,{q:'',status:'',page:1,size:6});return filters.get(id);}
function updateTasks(node,p,{reset=false,focus=false}={}){
 const f=filterState(p.id),state=states.get(p.id);if(!state)return;if(reset)f.page=1;
 node.querySelector('[data-task-results]').innerHTML=taskResults(p,state,f);
 const url=new URL(location.href);for(const k of ['q','status','page']){const value=f[k];if(value&&!(k==='page'&&value===1))url.searchParams.set(k,String(value));else url.searchParams.delete(k);}history.replaceState(history.state,'',url);
 if(focus){const summary=node.querySelector('.j-result-summary');summary.tabIndex=-1;summary.focus({preventScroll:true});summary.scrollIntoView({block:'nearest'});}syncLanguage();
}
function exportState(p){const state=states.get(p.id);if(!state)return;const url=URL.createObjectURL(new Blob([JSON.stringify(Object.fromEntries(Object.entries(state).filter(([key])=>key!=='sourceRevision')),null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=p.id+'-state.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
// Each snippet owns one async copy request. Detached pages never receive late UI writes.
const copyRequests=new WeakMap();
export async function copyCode(button,{clipboard=globalThis.navigator?.clipboard,selectionDocument=document}={}){
 const block=button.closest('[data-code-example]'),code=block?.querySelector('code'),status=block?.querySelector('[data-copy-status]');
 if(!code||!status)return false;
 const ticket={};copyRequests.set(block,ticket);let copied=false;
 try{if(!clipboard?.writeText)throw Error('Clipboard unavailable');await clipboard.writeText(code.textContent);copied=true;}catch{}
 if(copyRequests.get(block)!==ticket||!block.isConnected)return false;
 status.textContent=copied?'已复制。':'剪贴板不可用，请选择并复制上方命令。';
 if(!copied){const selection=selectionDocument.getSelection();const range=selectionDocument.createRange();range.selectNodeContents(code);selection?.removeAllRanges();selection?.addRange(range);block.querySelector('pre')?.focus({preventScroll:true});}
 return copied;
}
function bind(node,r,p){
 const catalogFilter={q:'',category:'all',page:1};node._catalogFilter=catalogFilter;
 const catalogURL=()=>{const u=new URL(location.href);for(const k of ['q','category','page']){const v=catalogFilter[k];if(v&&v!=='all'&&!(k==='page'&&v===1))u.searchParams.set(k,String(v));else u.searchParams.delete(k);}history.replaceState(history.state,'',u);};
 const refreshProjects=()=>{
  const selected=selectProjects(snapshot.projects,catalogFilter);catalogFilter.page=selected.current;
  node.querySelector('[data-project-results]').innerHTML=renderProjectCards(snapshot.projects,catalogFilter);
  const status=node.querySelector('[data-project-result-status]');
  if(status)status.textContent=`显示 ${selected.count} 个项目`+(selected.pages>1?` · 第 ${selected.current} / ${selected.pages} 页`:'');
  const clear=node.querySelector('[data-clear-project-filters]');if(clear)clear.hidden=!catalogFilter.q.trim()&&catalogFilter.category==='all';
  catalogURL();
 };
 node._refreshProjects=refreshProjects;
 const onSearch=e=>{
  if(e.isComposing)return;
  if(e.target.matches('[data-project-search]')){catalogFilter.q=e.target.value.slice(0,100);catalogFilter.page=1;refreshProjects();}
  if(p&&e.target.matches('[data-task-search]')){filterState(p.id).q=e.target.value;updateTasks(node,p,{reset:true});}
 };
 node.addEventListener('input',onSearch);
 node.addEventListener('compositionend',onSearch);
 node.addEventListener('change',e=>{if(p&&e.target.matches('[data-task-status]')){filterState(p.id).status=e.target.value;updateTasks(node,p,{reset:true});}});
 node.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-copy-code')){void copyCode(t);return;}
  if(t.hasAttribute('data-reload')){void retry(appFor(node),{journalPath:location.pathname});return;}
  if(t.hasAttribute('data-category')||t.hasAttribute('data-reset-projects')||t.hasAttribute('data-clear-project-filters')){catalogFilter.category=t.dataset.category||'all';catalogFilter.page=1;if(t.hasAttribute('data-reset-projects')||t.hasAttribute('data-clear-project-filters')){catalogFilter.q='';node.querySelector('[data-project-search]').value='';}node.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===catalogFilter.category)));refreshProjects();}
  if(t.hasAttribute('data-clear-project-filters')||t.hasAttribute('data-reset-projects'))node.querySelector('[data-project-search]')?.focus({preventScroll:true});
  if(t.hasAttribute('data-project-page')){catalogFilter.page=Number(t.dataset.projectPage);refreshProjects();const first=node.querySelector('[data-project-results] a');first?.focus({preventScroll:true});}
  if(p&&t.hasAttribute('data-task-page')){filterState(p.id).page=Number(t.dataset.taskPage);updateTasks(node,p,{focus:true});}
  if(p&&t.hasAttribute('data-reset-tasks')){filters.set(p.id,{q:'',status:'',page:1,size:6});node.querySelector('[data-task-search]').value='';node.querySelector('[data-task-status]').value='';updateTasks(node,p);}
  if(p&&t.hasAttribute('data-export-state'))exportState(p);
 });
}
export function mount(app,info={}){
 const host=app.querySelector('[data-journal-slot]');if(!host)return;
 if(!snapshot||info.journalError){showRetry(host,app,info);return;}
 const r=info.journalRoute||route(location.pathname,snapshot.catalog),p=snapshot.projects.find(p=>p.id===r.projectId&&p.visibility!=='draft'),key=[r.projectId||'all',r.view,r.doc||''].join('/');
 let node=nodes.get(key);if(node?.querySelector('.j-error')&&p&&!errors.has(p.id)){nodes.delete(key);node=null;}
 if(!node){const box=document.createElement('div');box.innerHTML=render(r,{...snapshot,states:Object.fromEntries(states),errors:Object.fromEntries(errors),notes:globalThis.SITE_DATA?.notes||[]});node=box.firstElementChild;bind(node,r,p);nodes.set(key,node);}
 host.replaceChildren(node);current=node;
 if(r.view==='index'&&!r.projectId){const q=new URL(location.href).searchParams,f=node._catalogFilter;Object.assign(f,{q:(q.get('q')||'').slice(0,100),category:q.get('category')||'all',page:Math.max(1,Math.floor(Number(q.get('page')))||1)});if(!['all','archived',...snapshot.projects.map(x=>x.category)].includes(f.category))f.category='all';node.querySelector('[data-project-search]').value=f.q;node.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===f.category)));node._refreshProjects();}
 if(p&&r.view==='tasks'&&states.has(p.id)){
  const f=filterState(p.id),q=new URL(location.href).searchParams;
  Object.assign(f,{q:q.get('q')||'',status:q.get('status')||'',page:Number(q.get('page'))||1});
  node.querySelector('[data-task-search]').value=f.q;node.querySelector('[data-task-status]').value=f.status;node.querySelector('[data-task-results]').innerHTML=taskResults(p,states.get(p.id),f);
 }
 if(p&&r.view==='manage'&&legacyProject(p)){
  const slot=node.querySelector('[data-legacy-host]'),l=legacyByProject.get(p.id);
  if(!l){slot.textContent='历史记录工具暂时无法加载。请刷新重试；本地草稿仍保留。';}
  else{if(l.kind==='native'){slot.innerHTML='<div data-dev-slot></div>';l.api.mount(slot,{page:'dev'});}else l.api.mount(slot,{view:new URL(location.href).searchParams.get('workspace')==='tasks'?'tasks':'manage'});activeLegacy=l;}
 }
 syncNavigation(app);syncLanguage();
}

function appFor(node){return node.closest('#app')||document.querySelector('#app');}
const retryTickets=new WeakMap();
function showRetry(host,app,info){
 let box=host.querySelector(':scope > .q-resource-error');if(!box){box=document.createElement('div');box.className='q-resource-error';box.setAttribute('role','alert');host.prepend(box);}
 box.innerHTML='<p>记录暂时无法更新。已有内容仍可阅读。</p><button type="button" class="button button--quiet">重试加载</button>';
 box.querySelector('button').onclick=()=>retry(app,info);
}
export async function retry(app,info={}){
 if(!app)return;const ticket={},url=location.href;retryTickets.set(app,ticket);catalogPromise=null;
 const r=snapshot?route(info.journalPath||location.pathname,snapshot.catalog):null;
 if(r?.projectId){states.delete(r.projectId);errors.delete(r.projectId);}
 const next={journalPath:location.pathname};await prepare(next);
 if(retryTickets.get(app)!==ticket||location.href!==url||!app.isConnected)return;
 if(next.journalError){showRetry(app.querySelector('[data-journal-slot]'),app,next);return;}
 if(globalThis.SITE_ROUTER){await globalThis.SITE_ROUTER.navigate(new URL(location.href),{historyMode:'none',force:true,preserveView:true});}else mount(app,next);
}

export function unmount(){activeLegacy?.api.unmount();activeLegacy=null;if(current){current.remove();current=null;}}
export function afterLanguage(){syncNavigation();syncLanguage();}
if(globalThis.document){document.addEventListener('site-language-change',afterLanguage);}
globalThis.SITE_JOURNAL={prepare,mount,unmount,describe,syncNavigation,retry};
