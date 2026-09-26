/** Regression for R48's visitor-copy publication failure, using the real renderer and audit. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {CLUTTER} from '../../assets/release/public-content.mjs';
import {auditFiles} from '../../scripts/publication/audit.mjs';
import {verifyLabPublicCopy,verifyLabAssets} from '../../scripts/platform/lab-assets.mjs';
import {loadExperiments} from '../../scripts/platform/experiments.mjs';
import {validateMessages} from '../../scripts/platform/content.mjs';
import {experimentGallery,experimentDetail} from '../../assets/journal/public-layout.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url));
const records=()=>loadExperiments(root).entries;
// Resolve the renderer's current versioned module identity, not a second unversioned copy.
const dataImport=read('assets/journal/public-layout.mjs').toString().match(/import \{EXPERIMENTS\} from '([^']+)'/);
assert.ok(dataImport,'The renderer must declare its generated experiment data');
const {EXPERIMENTS}=await import(new URL(dataImport[1],new URL('../../assets/journal/public-layout.mjs',import.meta.url)));
const oldCopy='本页提供确认版 HTML、1080p60 成片和本轮上传的完整制作工程。';
const origin='https://aha-xiaoq.github.io';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const page=(title,body)=>Buffer.from('<!doctype html><html lang="zh-CN"><head><title>'+escape(title)+'</title></head><body><main id="main"><h1>'+escape(title)+'</h1>'+body+'</main></body></html>');
function localArtifact(){
 const files=new Map([['notes/lab/index.html',page('实验室',experimentGallery())]]);
 for(const e of records()){
  files.set('notes/lab/docs/'+e.id+'/index.html',page(e.title,experimentDetail(e.id)));
  if(e.artifact)files.set(e.artifact.href.slice(1),read(e.artifact.href.slice(1)));
  for(const r of e.resources||[])files.set(r.href.slice(1),read(r.href.slice(1)));
 }
 // The player poster is an actual transitive dependency, not a placeholder fixture.
 files.set('experiments/releases/mid-autumn-special/poster.jpg',read('experiments/releases/mid-autumn-special/poster.jpg'));
 return files;
}
function translator(){
 const document={readyState:'loading',documentElement:{},addEventListener(){}};
 const ctx=vm.createContext({URL,document,location:{href:origin+'/notes/lab/?lang=en'},SITE_EN:Object.freeze({})});
 vm.runInContext(read('assets/site-i18n.js').toString(),ctx);
 ctx.SITE_I18N.register(validateMessages(JSON.parse(read('content/locales/en.json'))));
 return ctx.SITE_I18N;
}
test('R48 exact old record fails early with the source file and field',()=>{
 const input=structuredClone(records());input.find(e=>e.id==='pipa-pelican').verification=oldCopy;
 assert.throws(()=>verifyLabPublicCopy(input,CLUTTER),/content\/experiments\/pipa-pelican\.json \[verification\]: internal-public-copy \(本轮\)/);
});
test('real renderer and publication auditor reproduce the exact R48 error',()=>{
 const e=EXPERIMENTS.find(e=>e.id==='pipa-pelican');assert.ok(e);
 const before=e.verification;
 try{e.verification=oldCopy;const result=auditFiles(localArtifact(),{origin});
  assert.deepEqual(result.errors,[{file:'notes/lab/docs/pipa-pelican/index.html',problem:'internal-public-copy',match:'本轮'}]);
 }finally{e.verification=before;}
});
test('current real gallery, registered details, original HTML and release files pass publication audit',()=>{
 const result=auditFiles(localArtifact(),{origin});
 assert.deepEqual(result.errors,[]);assert.deepEqual(result.warnings,[]);
 assert.ok(result.localReferences>10);assert.equal(result.archives,records().flatMap(e=>e.resources||[]).filter(r=>r.role==='source').length);
});
test('early visitor-copy gate accepts all current records without changing them',()=>{
 const input=records(),before=JSON.stringify(input),state=CLUTTER.lastIndex;
 const report=verifyLabPublicCopy(input,CLUTTER);
 assert.equal(report.records,input.length);assert.ok(report.checkedFields>=30);
 assert.equal(JSON.stringify(input),before);assert.equal(CLUTTER.lastIndex,state);
});
for(const field of ['title','subtitle','medium','format','spotlight','previewDescription','kicker','controlsSummary','provenance','verification']){
 test('source copy gate covers visible field: '+field,()=>{
  const e=structuredClone(records()[0]);e[field]='本轮新增的内部说明';
  assert.throws(()=>verifyLabPublicCopy([e],CLUTTER),new RegExp('\\['+field+'\\].*internal-public-copy'));
 });
}
for(const field of ['title','description'])test('observation '+field+' cannot carry internal handoff copy',()=>{
 const e=structuredClone(records().find(e=>e.artifact));e.features=[{title:'动作',description:'踩踏'}];e.features[0][field]='按你的要求调整';
 assert.throws(()=>verifyLabPublicCopy([e],CLUTTER),/features\[0\]/);
});
test('download action labels are audited, not just the page description',()=>{
 const e=structuredClone(records().find(e=>e.kind==='video'));e.resources[0].label='本轮文件';
 assert.throws(()=>verifyLabPublicCopy([e],CLUTTER),/resources\[0\]\.label/);
});
test('draft copy stays private while publicly reachable archived copy is checked',()=>{
 const e={...records()[0],verification:oldCopy,visibility:'draft'};
 assert.deepEqual(verifyLabPublicCopy([e],CLUTTER),{records:0,checkedFields:0});
 assert.throws(()=>verifyLabPublicCopy([{...e,visibility:'archived'}],CLUTTER),/internal-public-copy/);
});
test('raw original prompts are not edited or reinterpreted as authored visitor prose',()=>{
 const e=structuredClone(records().find(e=>e.artifact));e.prompt='按你的要求，生成动画';const before=JSON.stringify(e);
 verifyLabPublicCopy([e],CLUTTER);assert.equal(JSON.stringify(e),before);
});
test('caller cannot omit a policy and silently disable the source gate',()=>{
 assert.throws(()=>verifyLabPublicCopy(records()),/Invalid lab copy policy/);
 assert.throws(()=>verifyLabPublicCopy(null,CLUTTER),/Invalid lab copy policy/);
});
test('stateful policy flags cannot hide repeated violations or mutate shared state',()=>{
 const rule=/本轮/gi;rule.lastIndex=99;const e={...records()[0],verification:oldCopy};
 for(let i=0;i<2;i++)assert.throws(()=>verifyLabPublicCopy([e],rule),/internal-public-copy/);
 assert.equal(rule.lastIndex,99);
});
test('source check calls the copy gate with the same publication policy before reading release media',()=>{
 const s=read('scripts/platform/check.mjs').toString();
 assert.match(s,/import \{CLUTTER\} from '\.\.\/\.\.\/assets\/release\/public-content\.mjs'/);
 assert.match(s,/verifyLabPublicCopy\(experiments.entries,CLUTTER\)/);
 assert.ok(s.indexOf('const releaseCopy=')<s.indexOf('const releaseAssets='));
 assert.match(s,/checkReadmeLinks\(root\)/);assert.match(s,/content\(root,\{check:true\}\)/);
});
for(const id of ['pipa-pelican','mid-autumn-special'])test(id+': visitor metadata has corresponding English and exact Chinese recovery',()=>{
 const api=translator(),e=records().find(e=>e.id===id);
 for(const field of ['title','subtitle','provenance','verification']){
  const zh=e[field],en=api.translate(zh,'en');assert.doesNotMatch(en,/[\u3400-\u9fff]/u,field);
  assert.doesNotMatch(en,/for this update|user-approved|supplied for this|this round/i,field);
  assert.equal(api.translate(zh,'zh'),zh);
 }
 assert.doesNotMatch(e.provenance+e.verification+e.subtitle,/本轮|本次|用户确认/);
});
test('copy repair does not weaken missing-resource or duplicate-heading publication checks',()=>{
 let files=localArtifact();files.delete('experiments/releases/mid-autumn-special/final.mp4');
 assert.ok(auditFiles(files,{origin}).errors.some(e=>e.problem==='missing-resource'&&e.target.endsWith('/final.mp4')));
 files=localArtifact();const key='notes/lab/docs/pipa-pelican/index.html';files.set(key,Buffer.from(files.get(key).toString().replace('</main>','<h1>Duplicate</h1></main>')));
 assert.ok(auditFiles(files,{origin}).errors.some(e=>e.problem==='non-unique-h1'));
});
test('final file hashes and original SVG identity remain bound to actual bytes',()=>{
 assert.equal(verifyLabAssets(root,records()).files,records().reduce((n,e)=>n+(e.resources||[]).length,0));
 const e=records().find(e=>e.id==='pelican-bicycle');assert.equal(createHash('sha256').update(read(e.artifact.href.slice(1))).digest('hex'),e.artifact.sha256);
});
