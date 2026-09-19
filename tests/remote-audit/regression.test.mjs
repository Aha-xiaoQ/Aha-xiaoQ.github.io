import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {localLink} from '../../tools/local-link.mjs';
import {auditFiles} from '../../scripts/publication/audit.mjs';
import {publicProject} from '../../assets/release/public-content.mjs';
import {inside,buildCandidate,gitBlob} from '../../packages/mario-mix/scripts/core.mjs';
import {mainSection,headerMutation} from '../../assets/ui/site-refinement.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const origin='https://aha-xiaoq.github.io';
const html='<html lang="zh-CN"><head><title>页面</title></head><body><main id="main"><h1>作品</h1></main></body></html>';
const audit=s=>auditFiles(new Map([['index.html',Buffer.from(s)]]),{origin});
function temp(t){const r=fs.mkdtempSync(path.join(os.tmpdir(),'workshop-audit-'));t.after(()=>fs.rmSync(r,{recursive:true,force:true}));return r;}
for(const from of ['README.md','README.en.md','docs/guide.md'])test('Markdown directory links work: '+from,async t=>{const r=temp(t);fs.mkdirSync(path.join(r,'assets'));const l=await localLink(r,from,from.startsWith('docs/')?'../assets/':'assets/');assert.equal(l.exists,true);assert.equal(l.directory,true);});
test('HTML directory links still require an index',async t=>{const r=temp(t);fs.mkdirSync(path.join(r,'assets'));const l=await localLink(r,'index.html','assets/');assert.equal(l.exists,false);assert.equal(l.path,'assets/index.html');});
test('HTML directory index is checked',async t=>{const r=temp(t);fs.mkdirSync(path.join(r,'guide'));fs.writeFileSync(path.join(r,'guide/index.html'),html);assert.equal((await localLink(r,'index.html','guide/')).exists,true);});
for(const raw of ['../outside','%2e%2e/outside','/../outside'])test('link boundary remains enforced: '+raw,async t=>{const r=temp(t);await assert.rejects(localLink(r,'README.md',raw),/escapes/);});
test('bad percent escape is a diagnostic, not a crash',async t=>assert.rejects(localLink(temp(t),'README.md','%ZZ'),/malformed/));
test('protocol-relative external links are not local files',async t=>assert.equal(await localLink(temp(t),'README.md','//github.com/a/b'),null));
test('repository document symlink cannot escape root',async t=>{const r=temp(t),outside=temp(t);fs.symlinkSync(outside,path.join(r,'linked'),'dir');await assert.rejects(localLink(r,'README.md','linked/'),/symlink/);});
test('noscript alternative does not duplicate the active landmark',()=>assert.equal(audit(html.replace('</body>','<noscript><main id="fallback"><h1>无脚本入口</h1></main></noscript></body>')).errors.length,0));
test('duplicate active landmarks are still rejected',()=>assert.ok(audit(html.replace('</body>','<main id="other"><h1>第二标题</h1></main></body>')).errors.some(e=>e.problem==='non-unique-main')));
test('noscript links still participate in resource validation',()=>assert.ok(audit(html.replace('</body>','<noscript><a href="missing.html">备用入口</a></noscript></body>')).errors.some(e=>e.problem==='missing-resource')));
test('current public project has a single W02 atlas, preserving original source',()=>{const p=JSON.parse(fs.readFileSync(path.join(root,'content/development/projects/mario-mix.json')));const copy=JSON.stringify(p),v=publicProject(p);assert.ok(p.levelPlan);assert.ok(!v.levelPlan);assert.equal(v.chapterPlan.levels.length,32);assert.equal(JSON.stringify(p),copy);assert.ok(v.currentRelease.sourceHref.includes('M07'));});
for(const raw of ['dangling','dangling/file.txt'])test('old game build refuses dangling symlink: '+raw,t=>{const r=temp(t);fs.symlinkSync(path.join(r,'missing'),path.join(r,'dangling'),'dir');assert.throws(()=>inside(r,raw),/Symlink/);});
test('old game build permits a genuinely new regular destination',t=>{const r=temp(t);assert.equal(inside(r,'new/file'),path.join(r,'new/file'));});
test('first game candidate builds against latest entry without changing game files',()=>{const paths=['games/mario-mix/play.html','games/mario-mix/classic-mix.js'];const before=paths.map(p=>fs.readFileSync(path.join(root,p)));const built=buildCandidate();assert.equal(built.meta.baselineCommit,'ce0326fde926baae513b76e547962ff40a9afe52');paths.forEach((p,i)=>assert.deepEqual(fs.readFileSync(path.join(root,p)),before[i]));});
test('all three font-only re-pins match current entries',()=>{const lock=JSON.parse(fs.readFileSync(path.join(root,'packages/mario-mix/baseline.json')));for(const row of lock.entries)assert.equal(gitBlob(fs.readFileSync(path.join(root,row.path),'utf8').replace(/\r\n/g,'\n')),row.blob);assert.equal(lock.previousEntryBaseline.entries.length,3);assert.ok(lock.previousEntryBaseline.entries.every(e=>e.otherBytesUnchanged));});
for(const [p,key] of [['/method/','tools'],['/guestbook/','about'],['/play-guide/','games'],['/search/','none'],['/games/mario-mix-3/','games'],['/notes/mario-mix/docs/terra-stages/','notes']])test('navigation section '+p,()=>assert.equal(mainSection(p),key==='none'?null:key));
test('removed headers are included in observer cleanup',()=>{const header={nodeType:1,matches:()=>true,querySelector:()=>null};assert.ok(headerMutation([{target:{closest:()=>null},addedNodes:[],removedNodes:[header]}]));});
test('unrelated text mutation does not trigger header remount',()=>assert.equal(headerMutation([{target:{closest:()=>null},addedNodes:[{nodeType:3}],removedNodes:[]}]),false));
for(const p of ['tools/quina-optics/index.html','tools/quina-optics/assembly.html'])test('interactive tool keeps canvas in a main landmark: '+p,()=>{const s=fs.readFileSync(path.join(root,p),'utf8');assert.equal((s.match(/<main\b/g)||[]).length,1);assert.ok(s.includes('<main id="stage"'));assert.ok(s.includes('<canvas id="view"'));assert.ok(!s.includes('拆开转轴 ↗'));});

// Execute the actual localization script with a minimal document; no browser mock
// is used to claim rendering, just deterministic metadata after a soft navigation.
import vm from 'node:vm';
function metadataContext() {
  const metas=new Map();let canonical=null;
  const doc={body:null,readyState:'loading',documentElement:{lang:'zh-CN'},addEventListener(){},
    querySelector(selector){return selector==='link[rel="canonical"]'?canonical:metas.get(selector)||null;},
    createElement(tag){return {tag,setAttribute(k,v){this[k]=v;}};},
    head:{append(node){if(node.tag==='link')canonical=node;else metas.set(`meta[${node.name?'name':'property'}="${node.name||node.property}"]`,node);}}
  };
  const ctx=vm.createContext({document:doc,URL,location:new URL('https://aha-xiaoq.github.io/notes/mario-mix/?q=private-query&lang=en#section'),localStorage:{getItem(){return null;},setItem(){}}});
  vm.runInContext(fs.readFileSync(path.join(root,'assets/site-i18n.js'),'utf8'),ctx);
  return {ctx,metas,get canonical(){return canonical;}};
}
for(const [page,expected] of [['journal','项目进展'],['visitorHelp','试玩作品'],['search','查找游戏'],['notFound','此地址']])test('soft navigation has page-specific description: '+page,()=>{const m=metadataContext();m.ctx.SITE_I18N.route({page,title:'页面'});assert.ok(m.metas.get('meta[name="description"]').content.startsWith(expected));});
test('project description remains specific after soft navigation',()=>{const m=metadataContext();m.ctx.SITE_JOURNAL={describe:()=>({intro:'32 关地图模板与开发清单'})};m.ctx.SITE_I18N.route({page:'journal',title:'地图'});assert.equal(m.metas.get('meta[name="description"]').content,'32 关地图模板与开发清单');});
test('share and canonical URLs exclude search or preference parameters',()=>{const m=metadataContext();m.ctx.SITE_I18N.route({page:'journal',title:'开发'});assert.equal(m.canonical.href,'https://aha-xiaoq.github.io/notes/mario-mix/');assert.equal(m.metas.get('meta[property="og:url"]').content,m.canonical.href);});
test('CI validates public artifact without granting deploy permissions',()=>{const s=fs.readFileSync(path.join(root,'.github/workflows/collab-checks.yml'),'utf8');assert.ok(s.includes('npm run release:test'));assert.ok(s.includes('npm run release:check'));assert.ok(!/pages:\s*write|contents:\s*write|deploy-pages|pull_request_target/.test(s.replace(/#.*$/gm,'')));});
function collectionContext(){const c=vm.createContext({URL});for(const p of ['assets/ui/site-actions.js','assets/workshop-media.js','content/presentation.js','assets/workshop-cards.js','content/site-data.js','content/taxonomy.js'])vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),c);return c;}
test('single shared game category does not produce redundant filters',()=>{const c=collectionContext(),s=c.SITE_WORKSHOP.renderCollection('games',c.SITE_DATA,c.SITE_TAXONOMY);assert.ok(!s.includes('data-workshop-filter'));assert.ok(s.includes('data-filter-summary'));assert.equal((s.match(/role="listitem"/g)||[]).length,5);});
test('meaningful additional genre restores filtering automatically',()=>{const c=collectionContext(),data=JSON.parse(JSON.stringify(c.SITE_DATA));data.items.push({...data.items.find(x=>x.primaryType==='game'),id:'test-puzzle',slug:'test-puzzle',categories:['puzzle']});const s=c.SITE_WORKSHOP.renderCollection('games',data,{gameCategories:[{id:'side-scrolling',label:'横版闯关'},{id:'puzzle',label:'解谜'}]});assert.ok(s.includes('data-workshop-filter'));for(const x of ['all','side-scrolling','puzzle'])assert.ok(s.includes(`data-filter="${x}"`));});
test('hidden entries do not create public filters',()=>{const c=collectionContext(),data=JSON.parse(JSON.stringify(c.SITE_DATA));data.items.push({...data.items.find(x=>x.primaryType==='game'),id:'hidden-puzzle',visibility:'draft',categories:['puzzle']});assert.ok(!c.SITE_WORKSHOP.renderCollection('games',data,{gameCategories:[{id:'side-scrolling',label:'横版闯关'},{id:'puzzle',label:'解谜'}]}).includes('data-workshop-filter'));});
