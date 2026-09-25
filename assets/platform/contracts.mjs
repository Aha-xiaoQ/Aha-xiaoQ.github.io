/** Portable contracts: no DOM, storage, network, filesystem, or project-specific branches. */
export const SCHEMA_VERSION = 1;
export function identifier(value) {
  return typeof value === 'string' && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) && value.length <= 64 && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(value);
}
export function localFile(value) {
  return typeof value === 'string' && value.length < 240 && !/[\\\x00-\x20%:#?]/.test(value) && !value.startsWith('/') && value.split('/').every(part => part && !part.startsWith('.') && !/[. ]$/.test(part) && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}
export function assertText(value, name, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw Error(`Invalid ${name}`);
}
export function validateExperiment(input) {
  if (!input || input.schemaVersion !== 1 || (!identifier(input.id)||input.id.length>60||['updates','contribute','archive','index','projects','manage'].includes(input.id))) throw Error('Invalid experiment identity');
  for (const [key,max] of [['title',48],['subtitle',160],['prompt',24000],['model',160],['provenance',2000],['verification',2000]]) assertText(input[key],key,max);
  if (input.visibility !== undefined && !['public','draft','archived'].includes(input.visibility)) throw Error('Invalid experiment visibility');
  if (input.reasoningEffort !== null && (typeof input.reasoningEffort !== 'string' || !input.reasoningEffort.trim() || input.reasoningEffort.length > 128)) throw Error('Unknown reasoning effort must be null');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.createdAt) || !Number.isFinite(Date.parse(input.createdAt)) || new Date(input.createdAt).toISOString().slice(0,10) !== input.createdAt) throw Error('Invalid experiment date');
  for(const key of ['medium','format','spotlight','previewDescription','kicker','controlsSummary'])if(input[key]!==undefined)assertText(input[key],key,key==='medium'?24:500);
  if(input.promptLanguage!==undefined&&!/^[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(input.promptLanguage))throw Error('Invalid prompt language');
  const a = input.artifact;
  if (!a || !/^\/experiments\/[a-z0-9][a-z0-9/-]*\.html$/.test(a.href) || !localFile(a.href.slice(1)) || !Number.isSafeInteger(a.bytes) || a.bytes < 1 || a.bytes > 64*1024*1024 || !/^[a-f0-9]{64}$/.test(a.sha256)) throw Error('Invalid experiment artifact');
  if(a.selfContained!==undefined&&typeof a.selfContained!=='boolean')throw Error('Invalid artifact dependency declaration');
  if (a.downloadName !== undefined && !/^[a-zA-Z0-9_-]+\.html$/.test(a.downloadName)) throw Error('Unsafe download filename');
  if (!Array.isArray(input.features) || input.features.length > 12) throw Error('Invalid observation list');
  for (const feature of input.features) { assertText(feature.title,'feature title',100); assertText(feature.description,'feature description',1000); }
  return input;
}
export function validateExperimentCatalog(catalog) {
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.entries) || catalog.entries.length > 200) throw Error('Invalid experiment catalog');
  const seen = new Set();
  for (const row of catalog.entries) {
    if (!identifier(row.id) || row.file !== `content/experiments/${row.id}.json` || seen.has(row.id)) throw Error('Duplicate or unsafe experiment entry');
    seen.add(row.id);
  }
  return catalog;
}
export function validateDocumentation(project) {
  if (project.startDocuments !== undefined) {
    if (!Array.isArray(project.startDocuments) || new Set(project.startDocuments).size !== project.startDocuments.length || project.startDocuments.some(id => !project.docs.some(doc => doc.id === id))) throw Error('Invalid start documents');
  }
  if (project.documentationGroups !== undefined) {
    if (!Array.isArray(project.documentationGroups) || project.documentationGroups.length > 12) throw Error('Invalid document groups');
    const grouped = new Set();
    for (const group of project.documentationGroups) {
      assertText(group.label,'document group label',80); assertText(group.title,'document group title',100);
      if (!Array.isArray(group.documents) || !group.documents.length) throw Error('Empty document group');
      for (const id of group.documents) {
        if (!project.docs.some(doc => doc.id === id) || grouped.has(id)) throw Error('Unknown or duplicate grouped document: '+id);
        grouped.add(id);
      }
    }
  }
  return project;
}
export function withExperimentDocuments(input, entries) {
  if (input.layout !== 'experiments') return input;
  const visible = entries.filter(row => row.visibility !== 'draft');
  const p = {...input, docs:input.docs.filter(doc=>doc.kind === 'lab-guide' || visible.some(e=>e.id === doc.id)).map(doc=>({...doc}))};
  for (const e of entries.filter(row => row.visibility !== 'draft')) {
    const existing=p.docs.find(doc=>doc.id === e.id);
    if (existing) { existing.archived=e.visibility === 'archived'; continue; }
    p.docs.push({id:e.id,title:e.title,summary:e.subtitle,sections:[],sources:[],archived:e.visibility === 'archived',action:{label:'下载原始 HTML',href:e.artifact.href}});
  }
  return p;
}
