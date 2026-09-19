/* New collaboration tooling only; see LICENSE.collab. Browser/Node shared model. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MM_COLLAB = Object.freeze(api);
})(globalThis, function () {
  'use strict';
  const STATUSES = Object.freeze({ready:'可认领',in_progress:'进行中',review:'待验收',blocked:'待前置事项',done:'已完成'});
  const PRIORITIES = ['P0','P1','P2'];
  const MAX_TASKS = 500;
  const cleanPath = p => typeof p === 'string' && p.length > 0 && p.length < 240 &&
    !p.startsWith('/') && !p.includes('\\') && !/[?#:\x00-\x1f]/.test(p) &&
    p.split('/').every(s => s !== '..' && s !== '.' && s !== '');
  const clone = value => JSON.parse(JSON.stringify(value));
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const isText = (s,max=4000) => typeof s === 'string' && s.length <= max;
  function validate(project) {
    const errors=[];
    if (!isObject(project)) return ['状态文件必须是 JSON 对象。'];
    if (project.schemaVersion !== 1) errors.push('不支持的 schemaVersion。');
    for (const key of ['project','release','updatedAt','repository','baseCommit','phase','deliveryStatus','summary','nextTask'])
      if (!isText(project[key], 1000) || !project[key]) errors.push(`${key} 必须是非空文本。`);
    if (!/^[\w.-]+\/[\w.-]+$/.test(project.repository || '')) errors.push('repository 必须是 owner/repo。');
    if (!/^[a-f0-9]{40}$/.test(project.baseCommit || '')) errors.push('baseCommit 必须是 40 位提交 SHA。');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(project.updatedAt || '') ||
      Number.isNaN(Date.parse(project.updatedAt + 'T00:00:00Z')) ||
      new Date(project.updatedAt + 'T00:00:00Z').toISOString().slice(0,10) !== project.updatedAt)
      errors.push('updatedAt 必须是有效的 YYYY-MM-DD 日期。');
    if (!Array.isArray(project.guardrails) || !project.guardrails.length || project.guardrails.some(s=>!isText(s,1000)))
      errors.push('guardrails 必须是文本数组。');
    if (!Array.isArray(project.episodes) || !project.episodes.length) errors.push('缺少游戏入口。');
    else {
      const ids = new Set();
      for (const episode of project.episodes) {
        if (!isObject(episode)) {errors.push('游戏入口格式错误。');continue;}
        if (!isText(episode.id,60) || ids.has(episode.id)) errors.push('游戏入口 id 缺失或重复。');
        ids.add(episode.id);
        for (const key of ['title','subtitle','sourceNote']) if (!isText(episode[key],1000)) errors.push(`游戏 ${episode.id} 的 ${key} 无效。`);
        if (!cleanPath(episode.path) || !cleanPath(episode.detailPath)) errors.push(`游戏 ${episode.id} 的路径不安全。`);
      }
    }
    if (!Array.isArray(project.milestones) || !project.milestones.length) errors.push('缺少里程碑。');
    else for (const m of project.milestones) {
      if (!isObject(m) || !['local','planned','review','done'].includes(m.status) ||
        ['id','title','description'].some(k=>!isText(m[k],1000))) errors.push('里程碑格式错误。');
    }
    if (!Array.isArray(project.tasks) || project.tasks.length < 1 || project.tasks.length > MAX_TASKS) return [...errors,'任务数量必须为 1 至 500。'];
    const ids = new Set(), byId = new Map();
    for (const task of project.tasks) {
      if (!isObject(task)) {errors.push('任务必须为对象。');continue;}
      const id=task.id;
      if (!/^[A-Z]+-\d{3}$/.test(id || '')) errors.push(`任务 id 无效：${id}`);
      if (ids.has(id)) errors.push(`任务 id 重复：${id}`);
      ids.add(id);byId.set(id,task);
      for (const field of ['title','area','status','priority','summary'])
        if (!isText(task[field],2000) || !task[field]) errors.push(`${id} 的 ${field} 必须是非空文本。`);
      for (const field of ['owner','evidence','notes','issueUrl'])
        if (!isText(task[field],field==='owner'?100:6000)) errors.push(`${id} 的 ${field} 无效。`);
      if (!Object.hasOwn(STATUSES,task.status)) errors.push(`${id} 状态无效。`);
      if (!PRIORITIES.includes(task.priority)) errors.push(`${id} 优先级无效。`);
      if (!Array.isArray(task.acceptance) || !task.acceptance.length || task.acceptance.some(s=>!isText(s,2000)||!s.trim())) errors.push(`${id} 缺少有效验收标准。`);
      if (!Array.isArray(task.paths) || !task.paths.length || task.paths.some(p=>!cleanPath(p))) errors.push(`${id} 文件路径无效。`);
      if (!Array.isArray(task.dependsOn) || task.dependsOn.some(s=>!isText(s,60)) || new Set(task.dependsOn).size !== task.dependsOn.length) errors.push(`${id} 前置事项无效。`);
      if (task.status === 'done' && (typeof task.evidence !== 'string' || !task.evidence.trim())) errors.push(`${id} 标为完成时必须填写验收依据。`);
      if (task.issueUrl) {
        try {
          const u=new URL(task.issueUrl);
          const prefix='/'+project.repository+'/issues/';
          if (u.protocol!=='https:' || u.host!=='github.com' || !u.pathname.startsWith(prefix) ||
            !/^\d+$/.test(u.pathname.slice(prefix.length)) || u.search || u.hash || u.username || u.password) throw Error();
        } catch {errors.push(`${id} 的 Issue 必须是本仓库的 GitHub issue 地址。`);}
      }
    }
    if (!ids.has(project.nextTask)) errors.push('nextTask 必须引用已有任务。');
    for (const task of byId.values()) for (const dep of Array.isArray(task.dependsOn)?task.dependsOn:[]) {
      if (!ids.has(dep)) errors.push(`${task.id} 引用了不存在的任务 ${dep}。`);
      if (dep===task.id) errors.push(`${task.id} 不能依赖自身。`);
      if (task.status==='done' && byId.get(dep)?.status!=='done') errors.push(`${task.id} 的前置事项 ${dep} 未完成。`);
    }
    const active=new Set(),visited=new Set();
    function visit(id) {
      if (active.has(id)) {errors.push('任务依赖存在环：'+id);return;}
      if (visited.has(id) || !byId.has(id)) return;
      active.add(id);
      for (const dep of Array.isArray(byId.get(id).dependsOn)?byId.get(id).dependsOn:[]) visit(dep);
      active.delete(id);visited.add(id);
    }
    for (const id of byId.keys()) visit(id);
    return [...new Set(errors)];
  }
  function assertProject(project) {
    const errors=validate(project);if(errors.length) throw new Error(errors.join('\n'));
    return project;
  }
  function counts(project) {
    const out=Object.fromEntries(Object.keys(STATUSES).map(s=>[s,0]));
    for(const t of project.tasks) out[t.status]++;
    return out;
  }
  function filterTasks(project, {status='all',area='all',query=''}={}) {
    const q=query.trim().toLocaleLowerCase();
    return project.tasks.filter(t=>(status==='all'||t.status===status)&&(area==='all'||t.area===area)&&
      (!q||[t.id,t.title,t.summary,t.owner,t.area,...t.paths].join(' ').toLocaleLowerCase().includes(q)));
  }
  function fingerprint(project) {
    // Detect stale drafts; not a cryptographic integrity check.
    const text=JSON.stringify(project);let hash=2166136261;
    for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16).padStart(8,'0');
  }
  function editTask(project,id,patch) {
    const allowed=['status','owner','notes','evidence','issueUrl'];
    for(const key of Object.keys(patch)) if(!allowed.includes(key)) throw Error('不允许在网页中修改字段：'+key);
    const next=clone(project),t=next.tasks.find(t=>t.id===id);
    if(!t)throw Error('任务不存在：'+id);
    for(const key of allowed)if(Object.hasOwn(patch,key))t[key]=patch[key];
    return assertProject(next);
  }
  function resumeText(project) {
    const next=project.tasks.find(t=>t.id===project.nextTask);
    return `继续维护 ${project.repository} 的混合马里奥项目。\n\n当前状态文件：collab/project.json\n协作包：${project.release}；记录日期：${project.updatedAt}\n记录的源代码基线：${project.baseCommit}\n交付状态：${project.deliveryStatus}\n\n请先读取 AGENTS.md、docs/collab/HANDOFF.md、collab/project.json 与 docs/collab/VALIDATION.md，然后读取 GitHub 当前 main，核对其是否已包含该包及是否存在更新。记录的 SHA 不是永远有效的最新版本。\n\n建议首先处理：${next?`${next.id} · ${next.title}（${STATUSES[next.status]}）`:'检查 nextTask 配置'}。完成后由维护者更新 nextTask。\n\n本轮边界：\n${project.guardrails.map(x=>'- '+x).join('\n')}\n\n每轮结束：更新任务数据、HANDOFF 和验证记录，运行 npm run collab:build / npm run check / npm test；交付有文件清单、基线哈希、冲突检查与回退说明的增量包。由我检查后手动推送，不要擅自推送、创建远端 Issue 或更改权限。`;
  }
  function taskBrief(project,id) {
    const t=project.tasks.find(t=>t.id===id);if(!t)throw Error('任务不存在。');
    return `${t.id} · ${t.title}\n状态：${STATUSES[t.status]} / ${t.priority}\n\n${t.summary}\n\n验收标准：\n${t.acceptance.map(s=>'- '+s).join('\n')}\n\n相关路径：\n${t.paths.join('\n')}\n\n前置事项：${t.dependsOn.join(', ')||'无'}\n\n来源：${project.repository} / ${project.release}\n这是仓库任务记录；尚未自动创建 GitHub Issue。`;
  }
  return {STATUSES,PRIORITIES,cleanPath,clone,validate,assertProject,counts,filterTasks,fingerprint,editTask,resumeText,taskBrief};
});
