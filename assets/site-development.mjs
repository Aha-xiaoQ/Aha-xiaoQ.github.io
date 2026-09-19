/** R03: a small overview with real native-router subpages. No second router/theme.
 * State still belongs to the installed R01 model. Hidden source sections keep their
 * existing IDs/listeners; only the current page group is exposed to the visitor.
 */
const rootURL = new URL('../', import.meta.url);
const configuration = {"variant":"A","scripts":["model.js","project-data.js","app.js"]};
const canonical = new URL('dev/workspace.html', rootURL);
const nodes = new Map();
const scripts = new Map();
let loading, runtime, currentView = null, taskPage = 1, guidePromise;
const PAGE_SIZE = 8;
const routes = {
  main: ['dev/index.html', '项目概览'],
  tasks: ['dev/tasks/index.html', '任务看板'],
  docs: ['dev/docs/index.html', '开发文档'],
  architecture: ['dev/docs/architecture/index.html', '结构与模块'],
  reference: ['dev/docs/reference/index.html', '前辈参考'],
  updates: ['dev/updates/index.html', '更新记录'],
  guide: ['dev/contribute/index.html', '参与指南'],
  manage: ['dev/manage/index.html', '交接与同步'],
};
const navigationLabels = {main:'概览',tasks:'任务',docs:'文档',updates:'更新',guide:'参与'};
const legacy = {overview:'main',board:'tasks',tasks:'tasks',structure:'architecture',start:'docs','docs-title':'docs','episodes-title':'docs','roadmap-title':'updates',journal:'updates',reference:'reference',handoff:'manage'};
const href = file => new URL(file, rootURL).href;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function make(tag, text, cls) { const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n; }
function link(text, file, cls='text-link') {const n=make('a',text,cls);n.href=href(file);return n;}
function byId(root,id) {return root.querySelector('[id="'+id+'"]');}
function resolvedView(info={}) {
  const view=routes[info.view]?info.view:'main';
  let id='';try{id=decodeURIComponent(location.hash.slice(1));}catch{}
  return view==='main'&&legacy[id]?legacy[id]:view;
}
function loadScript(url) {
  if (url.origin !== rootURL.origin) throw new Error('Development scripts must be same-origin.');
  if (!scripts.has(url.href)) scripts.set(url.href,new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=url.href;s.async=false;
    s.onload=()=>resolve();s.onerror=()=>{s.remove();scripts.delete(url.href);reject(Error('无法加载：'+url.pathname));};document.head.append(s);
  }));
  return scripts.get(url.href);
}
function absoluteLinks(root,sourceURL) {
  root.querySelectorAll('[href],[src]').forEach(n=>{for(const key of ['href','src']){
    const raw=n.getAttribute(key);if(!raw||/^(?:mailto:|tel:|data:|blob:)/i.test(raw))continue;
    if(raw.startsWith('#')) {const group=legacy[raw.slice(1)];if(group)n.setAttribute(key,href(routes[group][0]));continue;}
    const url=new URL(raw,sourceURL);
    const group=url.origin===rootURL.origin&&/^\/dev(?:\/mario-mix)?\/(?:index\.html)?$/.test(url.pathname)?legacy[url.hash.slice(1)]:null;
    n.setAttribute(key,group?href(routes[group][0]):url.href);
  }});
}
async function readPage(url) {
  const r=await fetch(url,{cache:'no-cache',credentials:'same-origin'});
  if(!r.ok)throw Error('开发记录加载失败：HTTP '+r.status);
  return new DOMParser().parseFromString(await r.text(),'text/html');
}
function addSection(root,view,markup,cls='') {
  const node=make('section',undefined,'section r03-page '+cls);node.dataset.r03View=view;node.innerHTML=markup;root.append(node);return node;
}
function setGroup(node,view) {if(node){node.dataset.r03View=view;node.hidden=true;}return node;}
function heading(kicker,title,description) {return `<div class="section-head r03-section-head"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2><p class="r03-description">${description}</p></div></div>`;}
function docBase() {return configuration.variant==='A'?'docs/collab/':'docs/mario-mix/';}
function docName(a,b){return docBase()+(configuration.variant==='A'?a:b);}
function catalogueItem(number,title,description,file) {
  return `<a class="entry r03-link-card" href="${esc(href(file))}"><span class="r03-card-index">${number}</span><h3>${title}</h3><p>${description}</p><span class="entry__link">查看内容 <span aria-hidden="true">→</span></span></a>`;
}
function installStructure(root) {
  // Preserve all legacy state nodes. Details become separate views, not another shell.
  for(const child of [...root.children]) {
    if(child.tagName==='DIALOG'||child.id==='toast'||child.id==='fatal'||child.id==='copy-fallback')continue;
    setGroup(child,'_internal');
  }
  if(configuration.variant==='A') {
    setGroup(byId(root,'board'),'tasks');
    setGroup(byId(root,'episodes-title')?.closest('section'),'docs');
    setGroup(byId(root,'roadmap-title')?.closest('section'),'updates');
    setGroup(byId(root,'handoff'),'manage');
    const banner=byId(root,'draft-banner');if(banner){delete banner.dataset.r03View;banner.classList.add('r03-local-notice');root.prepend(banner);}
    const controls=make('div',undefined,'actions');
    for(const id of ['export-draft','discard-draft']) {const n=byId(root,id);if(n)controls.append(n);}
    const importLabel=byId(root,'import-draft')?.closest('label');if(importLabel)controls.append(importLabel);
    byId(root,'handoff')?.prepend(controls);
    const boardTitle=byId(root,'board-title');if(boardTitle)boardTitle.textContent='任务看板';
  } else {
    for(const [id,view]of Object.entries({tasks:'tasks',structure:'architecture',start:'docs',journal:'updates',reference:'reference',handoff:'manage'}))setGroup(byId(root,id),view);
    // Retain a global warning for stale/unsaved data, but put controls on their own page.
    const warning=byId(root,'draft-alert');if(warning){delete warning.dataset.r03View;warning.classList.add('r03-local-notice');}
  }
  // Long original context is still readable in the maintenance page.
  const originalOverview=byId(root,'overview');
  if(originalOverview){
    delete originalOverview.dataset.r03View;originalOverview.hidden=false;
    const archive=make('details',undefined,'r03-context-detail');archive.dataset.r03View='manage';archive.hidden=true;
    archive.append(make('summary','展开完整项目背景、下一步与基线记录'));
    archive.append(originalOverview);root.append(archive);
  }
  const originalDocs=byId(root,'docs-title')?.closest('section');
  if(originalDocs){delete originalDocs.dataset.r03View;originalDocs.hidden=false;const reading=make('details',undefined,'r03-context-detail');reading.dataset.r03View='docs';reading.hidden=true;reading.append(make('summary','更多规范与历史文档'));reading.append(originalDocs);root.append(reading);}
  const head=make('div',undefined,'r03-navigation');
  head.innerHTML=`<div class="r03-breadcrumb" aria-label="当前位置"><a href="${esc(href('dev/index.html'))}">混合马里奥</a><span aria-hidden="true">/</span><span data-r03-current>项目概览</span></div><div class="r03-subnav" role="navigation" aria-label="项目内导航">${['main','tasks','docs','updates','guide'].map(v=>`<a href="${esc(href(routes[v][0]))}" data-r03-link="${v}" aria-label="${routes[v][1]}">${navigationLabels[v]}</a>`).join('')}</div>`;
  root.prepend(head);
  const home=addSection(root,'main','', 'r03-overview');home.id='r03-overview';
  const docs=addSection(root,'docs',heading('READ / 从这里开始','开发文档','先跑起来，再按改动范围阅读。完整规范保留在对应文档中。')+`<div class="r03-card-grid">${catalogueItem('01','本地启动','启动命令、常见问题与原有游戏路径。',docName('GETTING_STARTED.md','START_HERE.md'))}${catalogueItem('02','结构与模块','区分已经存在的代码与后续拆分计划。',routes.architecture[0])}${catalogueItem('03','前辈参考','阅读 SMBC 的参考范围、结论与许可边界。',routes.reference[0])}</div><div class="r03-reading-links">${link('贡献规范','CONTRIBUTING.md').outerHTML}${link('玩法验收',docName('GAMEPLAY_SPEC.md','GAMEPLAY_SPEC.md')).outerHTML}${link('页面规范','docs/site/INFORMATION_ARCHITECTURE_R03.md').outerHTML}${link('发布与回退',docName('RELEASE_WORKFLOW.md','RELEASE.md')).outerHTML}</div>`);
  // Put the catalogue before the already-working startup/episode sections.
  const firstDocs=[...root.children].find(n=>n!==docs&&n.dataset.r03View==='docs');if(firstDocs)root.insertBefore(docs,firstDocs);
  if(configuration.variant==='A') {
    addSection(root,'architecture',heading('ARCHITECTURE / 现状与计划','结构与模块','本页是定位入口，不意味着游戏引擎已经重构完成。')+`<div class="r03-card-grid">${catalogueItem('01','现有源码','三期分别保留自己的运行入口，先核对基线。',docName('ARCHITECTURE.md','ARCHITECTURE.md'))}${catalogueItem('02','输入与角色','共同接入方式，保留每个角色的独立手感。',routes.tasks[0]+'?q=输入')}${catalogueItem('03','音频与场景','先定义验收场景，再逐项整理生命周期。',routes.tasks[0]+'?q=音频')}</div>`);
    addSection(root,'reference',heading('REFERENCE / 有依据地参考','前辈参考','记录阅读了什么、可以借鉴什么，以及尚未核验的部分。')+`<article class="entry"><h3>Super Mario Bros. Crossover</h3><p>重点关注角色边界、武器与动画、音频调度及关卡数据。参考记录不等于已经移植代码或取得素材授权。</p><div class="actions">${link('阅读参考记录',docName('REFERENCES.md','references/SMBC.md'),'button button--quiet').outerHTML}${link('查看许可边界',docName('ASSETS.md','LICENSING.md'),'text-link').outerHTML}</div></article>`);
  }
  const revision=addSection(root,'updates',heading('JOURNAL / 保留来龙去脉','更新记录','界面修订与项目任务分开记录，不把页面改版算作游戏进度。')+`<article class="r03-release-note"><span class="tag">R03 · 页面结构</span><h3>先看重点，再看细节。</h3><p>项目概览、任务看板、文档、更新与参与指南拆为独立地址；交接工具移至维护页。原有任务状态与历史记录保留。</p><div class="r03-reading-links">${link('本轮交接','docs/site/HANDOFF_R03.md').outerHTML}${link('本轮验证','docs/site/TEST_REPORT_R03.md').outerHTML}${link('上一轮整合记录','docs/site/HANDOFF_R02.md').outerHTML}</div></article>`);
  const oldUpdates=[...root.children].find(n=>n!==revision&&n.dataset.r03View==='updates');if(oldUpdates)root.insertBefore(revision,oldUpdates);
  const participate=addSection(root,'guide',heading('CONTRIBUTE / 找到适合你的方式','一起把细节做好','不必读完整个项目。先选一件能说明、能验证的小事。')+`<div class="r03-card-grid">${catalogueItem('01','试玩与反馈','描述版本、角色和操作步骤，帮助复现问题。','games/index.html')}${catalogueItem('02','认领一个任务','先看前置事项和验收标准，再讨论实现。',routes.tasks[0])}${catalogueItem('03','代码、文档与素材','提交小范围 PR；素材必须说明来源与许可。','CONTRIBUTING.md')}</div><div class="r03-flow" aria-label="贡献流程"><span>查看任务</span><b aria-hidden="true">→</b><span>确认范围</span><b aria-hidden="true">→</b><span>修改与自测</span><b aria-hidden="true">→</b><span>提交 PR</span></div><details class="r03-guide-detail"><summary>展开完整操作说明</summary><div id="r03-guide-content"></div></details>`);
  const manage=addSection(root,'manage',heading('MAINTAIN / 面向维护者','交接与同步','此处操作只影响浏览器草稿。导出、核对并提交之后，记录才会共享。')+`<div class="r03-manage-meta" id="r03-manage-meta"></div>`);
  const oldManage=[...root.children].find(n=>n!==manage&&n.dataset.r03View==='manage');if(oldManage)root.insertBefore(manage,oldManage);
  const pagination=make('div',undefined,'r03-pagination');pagination.id='r03-pagination';pagination.setAttribute('aria-label','任务分页');
  const list=byId(root,configuration.variant==='A'?'task-grid':'task-list');list?.after(pagination);
  const foot=make('div',undefined,'r03-page-end');foot.innerHTML=`<span>记录有依据，修改可追溯。</span><div>${link('GitHub','https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io').outerHTML}${link('交接与同步',routes.manage[0]).outerHTML}</div>`;root.append(foot);
  root.addEventListener('mm-record-change',()=>{updateOverview(root);paginate(root);});
  root.addEventListener('mm-tasks-change',()=>{taskPage=1;paginate(root);});
  return participate;
}
function snapshot() {return runtime?.snapshot?.() || {};}
function updateOverview(root) {
  const data=snapshot(), p=data.project;if(!p)return;
  const tasks=p.tasks||[],isA=configuration.variant==='A';
  const labels=isA?globalThis.MM_COLLAB.STATUSES:globalThis.CollabModel.statuses;
  const next=isA?tasks.find(t=>t.id===p.nextTask):tasks.find(t=>t.status==='active')||tasks.find(t=>t.status==='verify')||tasks.find(t=>t.status==='todo'&&t.priority==='P0');
  const review=tasks.filter(t=>t.status===(isA?'review':'verify')).length,done=tasks.filter(t=>t.status==='done').length;
  const focus=isA?p.summary:p.currentFocus,local=data.isDraft;
  const date=p.updatedAt||'未记录';
  const home=byId(root,'r03-overview');
  home.innerHTML=`<div class="r03-overview-top"><div class="r03-project-copy"><p class="eyebrow">MARIO MIX / 一起完善这段冒险</p><h2>混合马里奥</h2><p class="r03-lead">经典关卡，多种角色。<br>从一个反馈开始，把玩法与细节慢慢做好。</p><div class="actions">${link('查看任务',routes.tasks[0],'button').outerHTML}${link('第一次参与',routes.guide[0],'button button--quiet').outerHTML}</div><div class="r03-record-stamp"><span>${data.stale?'检测到旧草稿':local?'本地草稿':'共享快照'}</span><span>记录更新 ${esc(date)}</span></div></div><article class="entry r03-focus"><div class="r03-focus-top"><span class="eyebrow">当前重点</span><span class="tag">${esc(next?labels[next.status]:'待确认')}</span></div><h3>${esc(next?.title||'核对当前项目记录')}</h3><p>${esc(next?.summary||focus)}</p><a class="entry__link" href="${esc(href(routes.tasks[0]+(next?'?q='+encodeURIComponent(next.id):'')))}">${esc(next?.id||'任务看板')} · 查看验收条件 <span aria-hidden="true">→</span></a></article></div><div class="r03-stats" aria-label="协作任务数量，不是游戏完成度"><div><strong>${tasks.length}</strong><span>已记录任务</span></div><div><strong>${review}</strong><span>待验收</span></div><div><strong>${done}</strong><span>已完成事项</span></div><p>状态以记录为准<br>不代表整体游戏完成度</p></div><div class="r03-section-label"><h3>按你关心的内容进入</h3><p>不用在一张长页面里找答案。</p></div><div class="r03-card-grid">${catalogueItem('01','任务看板','正在处理什么、谁来做、怎样算完成。',routes.tasks[0])}${catalogueItem('02','开发文档','本地启动、模块位置和贡献规范。',routes.docs[0])}${catalogueItem('03','更新记录','每轮改动、设计决定与验证边界。',routes.updates[0])}</div><div class="r03-invitation"><div><h3>先玩一遍，再提出一个好建议。</h3><p>三期现有试玩与开发入口都在；不要求你一开始就写代码。</p></div>${link('查看现有游戏','games/index.html','button button--quiet').outerHTML}</div>`;
  const meta=byId(root,'r03-manage-meta');
  if(meta)meta.innerHTML=`<span class="tag">${local?'本地草稿':'共享快照'}</span><p>源文件：<code>${isA?'collab/project.json':'docs/mario-mix/project-state.json'}</code></p><p>记录版本：${esc(p.release)} · ${esc(date)}</p><p>源码基线：<code>${esc(isA?p.baseCommit:p.baseline?.commit)}</code></p>`;
}
function paginate(root) {
  const list=byId(root,configuration.variant==='A'?'task-grid':'task-list'),control=byId(root,'r03-pagination');if(!list||!control)return;
  const items=[...list.children].filter(n=>n.matches('.task,.task-card'));const pages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));taskPage=Math.min(Math.max(taskPage,1),pages);
  items.forEach((item,index)=>{item.hidden=index<(taskPage-1)*PAGE_SIZE||index>=taskPage*PAGE_SIZE;});
  control.replaceChildren();control.hidden=items.length===0;if(!items.length)return;
  const label=make('span',`第 ${taskPage} / ${pages} 页 · 每页最多 ${PAGE_SIZE} 项`,'r03-page-count');label.setAttribute('aria-live','polite');control.append(label);
  const buttons=make('div',undefined,'r03-page-buttons');
  for(const [text,delta]of [['上一页',-1],['下一页',1]]){const b=make('button',text,'button button--quiet');b.type='button';b.disabled=(delta<0&&taskPage===1)||(delta>0&&taskPage===pages);b.onclick=()=>{taskPage+=delta;paginate(root);list.scrollIntoView({block:'start',behavior:'auto'});const desired=control.querySelector(delta<0?'button':'button:last-child');const focusTarget=desired&&!desired.disabled?desired:control.querySelector('button:not(:disabled)');focusTarget?.focus({preventScroll:true});};buttons.append(b);}
  control.append(buttons);
}
async function prepareMain() {
  if(nodes.has('main'))return;
  if(!loading)loading=(async()=>{
    const source=await readPage(canonical),content=source.querySelector('[data-dev-component="main"]'),manifest=source.querySelector('#mm-runtime');
    if(!content||!(manifest instanceof HTMLTemplateElement))throw Error('R03 工作区来源缺失，请核对更新包是否完整应用。');
    const listed=[...manifest.content.querySelectorAll('script[src]')];
    if(listed.map(s=>new URL(s.getAttribute('src'),canonical).pathname.split('/').pop()).join('|')!==configuration.scripts.join('|'))throw Error('运行文件清单不匹配。');
    const root=document.importNode(content,true);absoluteLinks(root,canonical);installStructure(root);
    for(const s of listed){const url=new URL(s.getAttribute('src'),canonical);if(url.pathname.endsWith('/'+configuration.scripts[1]))url.searchParams.set('record',String(Date.now()));await loadScript(url);}
    if(typeof globalThis.SITE_DEV_CREATE!=='function')throw Error('开发记录接口缺失。');
    runtime=globalThis.SITE_DEV_CREATE(root);nodes.set('main',root);updateOverview(root);paginate(root);
  })().catch(error=>{loading=undefined;throw error;});return loading;
}
async function prepareGuide() {
  await prepareMain();if(guidePromise)return guidePromise;
  guidePromise=(async()=>{const url=new URL('dev/guide-source.html',rootURL),source=await readPage(url),content=source.querySelector('[data-dev-component="guide"]');if(!content)throw Error('参与指南来源缺失。');const node=document.importNode(content,true);node.classList.remove('mm-dev');node.querySelector('.dev-subnav')?.remove();absoluteLinks(node,url);byId(nodes.get('main'),'r03-guide-content').append(node);})().catch(error=>{guidePromise=undefined;throw error;});return guidePromise;
}
export async function prepare(info={}) {await prepareMain();if(resolvedView(info)==='guide')await prepareGuide();}
export function unmount() {runtime?.pause?.();for(const node of nodes.values()){node.querySelectorAll('dialog[open]').forEach(d=>d.close());if(node.isConnected)node.remove();}currentView=null;}
export function mount(host,info={}) {
  const node=nodes.get('main');if(!host||!node)throw Error('Development content must be prepared before mount.');
  currentView=resolvedView(info);
  for(const group of node.querySelectorAll(':scope > [data-r03-view]'))group.hidden=group.dataset.r03View!==currentView;
  node.querySelector('[data-r03-current]').textContent=routes[currentView][1];
  for(const a of node.querySelectorAll('[data-r03-link]')){const selected=a.dataset.r03Link===(['architecture','reference'].includes(currentView)?'docs':currentView);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  if(host.firstElementChild!==node)host.replaceChildren(node);
  const query=new URL(location.href).searchParams.get('q');if(currentView==='tasks'&&query!==null)runtime?.search?.(query);
  runtime?.resume?.();updateOverview(node);paginate(node);
}
export const api={rootURL,prepare,mount,unmount,get currentView(){return currentView;}};
globalThis.SITE_DEVELOPMENT=api;
