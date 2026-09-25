import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {validateMessages,planContent} from '../../scripts/platform/content.mjs';
import {validateDocumentation} from '../../assets/platform/contracts.mjs';
import {checkReadmeLinks} from '../../scripts/platform/readme-links.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(root+p,'utf8');
const website=JSON.parse(read('content/development/projects/pixel-workshop.json'));
const catalog=JSON.parse(read('content/locales/en.json'));
const dictionary=validateMessages(catalog);
function api(){
 const context=vm.createContext({URL,location:{href:'https://aha-xiaoq.github.io/notes/?lang=en'},document:{readyState:'loading',documentElement:{},addEventListener(){}},SITE_EN:Object.freeze({})});
 vm.runInContext(planContent(root).files.get('assets/i18n/messages.js').toString(),context);
 vm.runInContext(read('assets/site-i18n.js'),context);context.SITE_I18N.register(context.SITE_LOCALE_MESSAGES.en);return context.SITE_I18N;
}
test('website documentation groups and all six stable routes still validate',()=>{
 validateDocumentation(website);for(const id of ['start','content','architecture','add-project','publishing','writing'])assert.ok(website.docs.some(d=>d.id===id),id);
 assert.deepEqual(website.startDocuments,['start','content','publishing']);
});
test('the two READMEs retain explicit opposing locale choices',()=>{
 const results=checkReadmeLinks(root);assert.deepEqual(results.map(x=>x.locale),['zh','en']);
 assert.ok(results.every(x=>x.links.length>=16));
});
for(const [file,locale] of [['README.md','zh'],['README.en.md','en']]){
 test(file+' preserves third/fourth guides, archive, workshop and videos',()=>{
  const s=read(file);for(const path of ['terra-source/','episode-4-source/'])assert.ok(s.includes(path+'?lang='+locale));
  assert.ok(s.includes('downloads/source/MarioMix_Episode4_R43_Source.zip)'));
  assert.ok(s.includes('/packages/mario-mix-worlds/atlas/editor.html)'));
  assert.equal(s.split('<!-- XIAOQ:VIDEOS:START -->').length-1,1);assert.equal(s.split('<!-- XIAOQ:VIDEOS:END -->').length-1,1);
 });
 test(file+' presents one canonical build-and-verify command without a duplicate maintenance section',()=>{
  const s=read(file);assert.equal((s.match(/^npm run platform:verify$/gm)||[]).length,1);
  assert.doesNotMatch(s,/npm run journal:build\nnpm run site:build\nnpm run check\nnpm test/);
  assert.doesNotMatch(s,/^## (?:网站维护|Website maintenance)$/m);
  assert.match(s,/platform:build/);assert.match(s,/platform\/README(?:\.en)?\.md/);
 });
}
test('English maintenance links no longer return readers to the Chinese-only index',()=>{
 assert.match(read('README.en.md'),/\(docs\/README\.en\.md\)/);
 assert.match(read('docs/README.en.md'),/\(platform\/README\.en\.md\)/);
 assert.match(read('docs/README.md'),/\[English\]\(README\.en\.md\)/);
 assert.match(read('docs/README.en.md'),/\[简体中文\]\(README\.md\)/);
});
for(const [file,locale] of [['docs/README.md','zh'],['docs/README.en.md','en']])test(file+' pins all website guide links to its stated language',()=>{
 const s=read(file),urls=[...s.matchAll(/\]\((https:\/\/aha-xiaoq\.github\.io\/[^)]+)\)/g)].map(x=>new URL(x[1]));
 assert.ok(urls.length>=6);assert.ok(urls.every(u=>u.searchParams.getAll('lang').length===1&&u.searchParams.get('lang')===locale));
});
test('each public guide has distinct section headings and a dedicated purpose',()=>{
 for(const guide of website.docs){const titles=guide.sections.map(x=>x.title);assert.equal(new Set(titles).size,titles.length,guide.id);assert.ok(guide.summary);}
});
test('preview commands and submission validation are distinguished',()=>{
 const content=website.docs.find(x=>x.id==='content'),publish=website.docs.find(x=>x.id==='publishing'),add=website.docs.find(x=>x.id==='add-project');
 assert.ok(content.sections.some(x=>x.code==='npm run platform:build\nnpm run dev'));
 assert.ok(add.sections.some(x=>x.code==='npm run platform:verify'));
 assert.ok(publish.sections.some(x=>x.code?.includes('platform:verify')));
 assert.ok(publish.sections.some(x=>x.code?.includes('platform:pack -- --base')));
});
test('all current website guide titles, summaries, and paragraphs have reversible translations',()=>{
 const a=api(),texts=website.docs.flatMap(d=>[d.title,d.summary,...d.sections.flatMap(section=>[section.title,...section.paragraphs])]);
 assert.ok(texts.length>10);
 for(const text of texts){assert.doesNotMatch(a.translate(text,'en'),/[\u3400-\u9fff]/u,text);assert.equal(a.translate(text,'zh'),text);}
});
test('existing 404 wording stays translated and not excluded',()=>{
 assert.equal(dictionary['作品名称或关键词'],'Project name or keywords');
 assert.equal(api().translate('作品名称或关键词','en'),'Project name or keywords');
});
test('a newly authored public paragraph cannot silently lack its translation',()=>{
 const missing=structuredClone(catalog),source=website.docs.find(d=>d.id==='publishing').sections[0].paragraphs[0];const row=missing.messages.find(x=>x.source===source);assert.ok(row);missing.messages=missing.messages.filter(x=>x.source!==source);
 assert.equal(Object.hasOwn(validateMessages(missing),row.source),false);
 assert.equal(Object.hasOwn(dictionary,row.source),true);
});
test('publication instructions preserve verification and remote-conflict boundaries',()=>{
 const text=JSON.stringify(website.docs.find(x=>x.id==='publishing'));
 assert.match(text,/不跳过失败步骤/);assert.match(text,/远端新提交会停止/);assert.match(text,/Pages/);
});
test('draft settings and historical reports are not declared accepted by documentation cleanup',()=>{
 const all=JSON.stringify(website);assert.match(all,/推理强度使用 null/);
 assert.match(read('docs/README.en.md'),/earlier test results do not certify the current version/);
});
test('current bilingual maintenance guides explain lifecycle and test scope',()=>{
 for(const file of ['docs/platform/README.md','docs/platform/README.en.md']){const s=read(file);assert.match(s,/site-router\.js/);assert.match(s,/HTTP/);assert.match(s,/platform:verify/);}
});
