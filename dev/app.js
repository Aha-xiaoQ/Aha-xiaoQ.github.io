/* New collaboration UI only. All project text is inserted with textContent. */
globalThis.SITE_DEV_CREATE = function(root) {
  'use strict';
  const $=id=>root.querySelector('[id="'+id+'"]'), M=globalThis.MM_COLLAB;
  const STORAGE_KEY='xiaoq.mario-mix.collab.draft.v1';
  let source, project, selectedId='', status='all', toastTimer, staleDraft=null, storageAvailable=true;
  function el(tag,text,className='') {const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
  function notify(message) {$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
  function fatal(message) {$('fatal').textContent=message;$('fatal').hidden=false;}
  function hasDraft(){return M.fingerprint(source)!==M.fingerprint(project);}
  function setDraftBanner() {
    const dirty=hasDraft();$('draft-banner').hidden=!(dirty||staleDraft);
    $('draft-label').textContent=staleDraft?'检测到旧版草稿，未自动合并':'你正在查看本地草稿';
    $('draft-description').textContent=staleDraft?'仓库状态已变化。可先导出旧草稿，再恢复仓库记录逐项核对；不要直接覆盖新版。':
      (storageAvailable?'仅当前浏览器可见；导出 project.json，校验并由维护者提交后才成为共享状态。':'浏览器未允许持久保存；当前改动只在此页内，请立即导出，以免关闭页面后丢失。');
  }
  function persist() {
    staleDraft=null;
    try {
      if(hasDraft()) localStorage.setItem(STORAGE_KEY,JSON.stringify({sourceFingerprint:M.fingerprint(source),project}));
      else localStorage.removeItem(STORAGE_KEY);
      storageAvailable=true;
    }catch{storageAvailable=false;}
    setDraftBanner();
  }
  function restore() {
    try {
      const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;
      const draft=JSON.parse(raw);
      if(!draft || M.validate(draft.project).length) {notify('已有草稿格式无效，未载入。');return;}
      if(draft.sourceFingerprint!==M.fingerprint(source)) {staleDraft=draft.project;return;}
      project=draft.project;
    }catch{storageAvailable=false;}
  }
  function download(data,name) {
    const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  async function copy(text) {
    try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(text);notify('已复制。提交或发布仍由维护者手动完成。');}
    catch{if($('task-dialog').open)$('task-dialog').close();$('copy-fallback').hidden=false;$('copy-text').value=text;$('copy-text').focus();$('copy-text').select();$('copy-fallback').scrollIntoView({block:'center'});notify('请在已选中的文本中按 Ctrl+C / Command+C。');}
  }
  function renderMeta() {
    const c=M.counts(project);$('count-total').textContent=project.tasks.length;
    $('count-ready').textContent=c.ready;$('count-review').textContent=c.review;$('count-done').textContent=c.done;
    $('release-label').textContent=project.release;$('record-date').textContent='记录于 '+project.updatedAt;
    $('delivery-status').textContent=project.deliveryStatus;
    const t=project.tasks.find(t=>t.id===project.nextTask);
    $('resume-title').textContent=t.title;$('resume-summary').textContent=t.summary;
    $('repo-link').href='https://github.com/'+project.repository;
    setDraftBanner();
  }
  function renderEpisodes() {
    $('episodes').replaceChildren(...project.episodes.map((e,i)=>{
      const card=el('article',undefined,'episode'),num=el('span',String(i+1).padStart(2,'0'),'episode-number'),body=el('div');
      body.append(el('h3',e.title),el('p',e.subtitle));
      const links=el('div',undefined,'episode-links');
      const play=el('a','试玩现有版本 →','text-link');play.href=new URL(e.path,globalThis.SITE_DEVELOPMENT.rootURL).href;
      const detail=el('a','版本介绍 ↗','text-link');detail.href=new URL(e.detailPath,globalThis.SITE_DEVELOPMENT.rootURL).href;
      links.append(play,detail);body.append(links,el('p',e.sourceNote,'episode-note'));card.append(num,body);return card;
    }));
  }
  function renderAreas() {
    const prior=$('area').value;
    const all=el('option','所有模块');all.value='all';$('area').replaceChildren(all);
    for(const area of [...new Set(project.tasks.map(t=>t.area))]){const o=el('option',area);o.value=area;$('area').append(o);}
    if([...$('area').options].some(o=>o.value===prior))$('area').value=prior;
  }
  function renderFilters() {
    const c=M.counts(project);
    $('status-filters').replaceChildren(...[['all','全部',project.tasks.length],...Object.entries(M.STATUSES).map(([k,v])=>[k,v,c[k]])].map(([key,label,count])=>{
      const b=el('button');b.type='button';b.dataset.filter=key;b.setAttribute('aria-pressed',String(status===key));
      b.append(el('span',label),el('small',count));b.addEventListener('click',()=>{status=key;renderFilters();renderTasks();});return b;
    }));
  }
  function renderTasks() {
    const tasks=M.filterTasks(project,{status,area:$('area').value,query:$('search').value});
    $('results-count').textContent=`显示 ${tasks.length} / ${project.tasks.length} 条协作事项 · 状态为 ${hasDraft()?'本地草稿':'仓库记录'}`;
    $('task-grid').replaceChildren(...tasks.map(t=>{
      const card=el('article',undefined,'task-card');card.dataset.task=t.id;
      const top=el('div',undefined,'task-top');top.append(el('span',t.id,'task-id'),el('span',t.priority,'task-priority'));
      const tags=el('div',undefined,'task-tags');tags.append(el('span',M.STATUSES[t.status],'task-state '+t.status),el('span',t.area,'task-area'));
      const footer=el('div',undefined,'task-bottom');footer.append(el('span',t.owner?'负责人 · '+t.owner:'等待认领'));
      const button=el('button','查看任务 →','task-open');button.type='button';button.setAttribute('aria-label',`查看 ${t.id} ${t.title}`);button.addEventListener('click',()=>openTask(t.id));footer.append(button);
      card.append(top,el('h3',t.title),el('p',t.summary,'summary'),tags,footer);return card;
    }));
    if(!tasks.length)$('task-grid').append(el('p','没有匹配的任务。可以清空搜索或切换筛选条件。','empty-state'));
    root.dispatchEvent(new CustomEvent('mm-tasks-change'));
  }
  function renderMilestones() {
    const labels={local:'本地完成，待发布',planned:'规划中',review:'待验收',done:'已完成'};
    $('milestones').replaceChildren(...project.milestones.map(m=>{
      const card=el('article',undefined,'milestone'),top=el('div');top.append(el('span',m.id,'milestone-id'),el('span',labels[m.status],'small'));
      card.append(top,el('h3',m.title),el('p',m.description));return card;
    }));
  }
  function refresh(){renderMeta();renderFilters();renderTasks();root.dispatchEvent(new CustomEvent('mm-record-change'));}
  function openTask(id) {
    const t=project.tasks.find(t=>t.id===id);selectedId=id;
    $('dialog-id').textContent=`${id} / ${t.priority} / ${M.STATUSES[t.status]}`;
    $('dialog-title').textContent=t.title;$('dialog-summary').textContent=t.summary;
    $('dialog-acceptance').replaceChildren(...t.acceptance.map(s=>el('li',s)));
    $('dialog-paths').replaceChildren(...t.paths.map(s=>el('code',s)));
    $('dialog-deps').textContent='前置事项：'+(t.dependsOn.map(dep=>{const d=project.tasks.find(x=>x.id===dep);return `${dep}（${M.STATUSES[d.status]}）`;}).join('、')||'无');
    $('dialog-evidence').textContent=t.evidence||'尚无验收依据。未验证不等于已经修复。';
    const url=new URL('https://github.com/'+project.repository+'/issues/new');
    url.searchParams.set('template','task.yml');url.searchParams.set('title',`[${t.id}] ${t.title}`);url.searchParams.set('task_id',t.id);
    $('task-issue').href=t.issueUrl||url.href;$('task-issue').textContent=t.issueUrl?'查看已有 GitHub Issue ↗':'在 GitHub 打开任务表单 ↗';
    $('edit-status').value=t.status;$('edit-owner').value=t.owner;$('edit-evidence').value=t.evidence;$('edit-notes').value=t.notes;$('edit-issue').value=t.issueUrl;
    $('edit-error').textContent='';$('edit-details').open=false;
    if(!$('task-dialog').open)$('task-dialog').showModal();
  }
  try {
    if(!M)throw Error('状态模型未加载。请确认更新包文件完整。');
    source=M.clone(M.assertProject(globalThis.MM_PROJECT));project=M.clone(source);restore();
    renderAreas();
    for(const [key,label]of Object.entries(M.STATUSES)){const o=el('option',label);o.value=key;$('edit-status').append(o);}
    refresh();renderEpisodes();renderMilestones();
    $('search').addEventListener('input',renderTasks);$('area').addEventListener('change',renderTasks);
    $('copy-handoff-top').addEventListener('click',()=>copy(M.resumeText(project)));
    $('copy-handoff-bottom').addEventListener('click',()=>copy(M.resumeText(project)));
    $('close-dialog').addEventListener('click',()=>$('task-dialog').close());
    $('copy-task').addEventListener('click',()=>copy(M.taskBrief(project,selectedId)));
    $('task-dialog').addEventListener('click',e=>{if(e.target===$('task-dialog')){const r=$('task-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('task-dialog').close();}});
    $('task-form').addEventListener('submit',e=>{
      e.preventDefault();
      try{
        if(staleDraft)throw Error('请先导出或清除旧版草稿，再编辑当前记录。');
        project=M.editTask(project,selectedId,{status:$('edit-status').value,owner:$('edit-owner').value.trim(),evidence:$('edit-evidence').value.trim(),notes:$('edit-notes').value.trim(),issueUrl:$('edit-issue').value.trim()});
        persist();refresh();$('task-dialog').close();notify(storageAvailable?'已保存为本地草稿，尚未提交到仓库。':'当前改动仅在内存中，请立即导出。');
      }catch(err){$('edit-error').textContent=err.message;}
    });
    $('set-next-task').addEventListener('click',()=>{
      if(staleDraft){$('edit-error').textContent='请先处理旧版草稿。';return;}
      project.nextTask=selectedId;persist();refresh();notify('已在本地草稿设置下次续接任务；表单中其他未保存字段不受影响。');
    });
    $('export-draft').addEventListener('click',()=>download(staleDraft||project,staleDraft?'project.stale.local.json':'project.json'));
    $('discard-draft').addEventListener('click',()=>{
      if(!confirm('恢复仓库记录会丢弃当前浏览器的状态草稿。尚未导出的修改将丢失。继续？'))return;
      project=M.clone(source);staleDraft=null;persist();renderAreas();refresh();renderEpisodes();renderMilestones();notify('已恢复当前页面携带的仓库记录；未更改远端。');
    });
    $('import-draft').addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      try{
        if(file.size>2*1024*1024)throw Error('状态文件不能超过 2 MB。');
        const p=M.assertProject(JSON.parse(await file.text()));
        if(p.repository!==source.repository||p.baseCommit!==source.baseCommit||p.release!==source.release)throw Error('导入文件的仓库、基线或协作版本与本页不同。请先在本地核对，不自动覆盖。');
        if(JSON.stringify(p.tasks.map(t=>t.id).sort())!==JSON.stringify(source.tasks.map(t=>t.id).sort()))throw Error('任务集合已变化，请通过源码编辑并重新构建，不在网页中自动合并。');
        if((hasDraft()||staleDraft)&&!confirm('导入将替换当前本地草稿。继续前请确认已经导出需要保留的内容。'))return;
        project=p;persist();renderAreas();refresh();renderEpisodes();renderMilestones();notify('已导入本地草稿。仓库和 GitHub 均未修改。');
      }catch(err){notify('导入失败：'+err.message);}finally{e.target.value='';}
    });
  } catch(err){fatal('开发中心加载失败：'+err.message+' 可以先阅读参与指南和文本任务摘要。');}
  return {snapshot(){return {project:M.clone(project),isDraft:hasDraft(),stale:!!staleDraft};},search(query){status='all';$('search').value=String(query);$('area').value='all';refresh();},pause(){clearTimeout(toastTimer);$('toast').hidden=true;},resume(){}};
};
