import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {DOCUMENTS} from '../../assets/journal/documents-data.mjs';
import {withDocuments,readingLink,documentURL} from '../../assets/journal/documents.mjs';
import {documentData,OUTPUT} from '../../scripts/journal/documents.mjs';
import {planPages} from '../../scripts/journal/build.mjs';
import {publicProject} from '../../assets/release/public-content.mjs';
import {renderMarkdown} from '../../assets/journal/markdown.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url));
const project=id=>JSON.parse(read(`content/development/projects/${id}.json`));

test('curated document data matches sources and detects stale edits',()=>{
 assert.deepEqual(documentData(root),read(OUTPUT));
 const d=DOCUMENTS.find(d=>d.id==='worlds-start');
 assert.notDeepEqual(documentData(root,{reader:p=>p===d.source?Buffer.concat([read(p),Buffer.from('\nNew instructions\n')]):read(p)}),read(OUTPUT));
});
test('registry rejects traversal, duplicate routes, missing parents and cycles',()=>{
 const config=JSON.parse(read('config/documents.json'));
 const check=mutate=>{const c=structuredClone(config);mutate(c.documents);assert.throws(()=>documentData(root,{reader:p=>p==='config/documents.json'?Buffer.from(JSON.stringify(c)):read(p)}));};
 check(d=>d[0].source='packages/../private.md');
 check(d=>d[0].id='terra-source');
 check(d=>d[0].parent='not-a-guide');
 check(d=>{d[0].parent=d[1].id;d[1].parent=d[0].id;});
 check(d=>d.push({...d[0]}));
});
test('reading URLs stay under project routes and preserve fragments',()=>{
 assert.equal(readingLink('/packages/mario-mix-worlds/START_HERE.md'),'/notes/mario-mix/docs/worlds-start/');
 assert.equal(readingLink('docs/MAP_CONTRACT.md#scope','packages/mario-mix-worlds/START_HERE.md'),'/notes/mario-mix/docs/worlds-map-contract/#scope');
 assert.equal(readingLink('#scope'),'#scope');
 assert.equal(readingLink('javascript:alert(1)'),'');
 assert.equal(readingLink('//evil.test/path'),'');
 assert.equal(readingLink('https://example.test/'), 'https://example.test/');
 assert.match(readingLink('RELEASE_REVIEW.json','packages/mario-mix-terra/docs/KNOWN_LIMITS.md'),/^https:\/\/github.com\//);
});
test('both source and public projections keep complete guides, downloads and historical boundaries',()=>{
 for(const p of [withDocuments(project('mario-mix')),publicProject(project('mario-mix'))]){
  assert.equal(p.docs.find(d=>d.id==='terra-stages').sources[0].href,'/notes/mario-mix/docs/worlds-start/');
  assert.equal(p.chapterPlan.instructionsHref,'/notes/mario-mix/docs/worlds-start/');
  assert.equal(p.currentRelease.sourceHref,project('mario-mix').currentRelease.sourceHref);
  assert.equal(p.docs.find(d=>d.id==='terra-publish').versioned,true);
  assert.deepEqual(withDocuments(p),p);
 }
});
test('every registered reading page has the native shell, one title and closed document links',async()=>{
 const {pages}=await planPages(root);
 for(const d of DOCUMENTS){
  const url=documentURL(d),html=pages.get(url.slice(1)+'index.html')?.toString();
  assert.ok(html, url);assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,url);
  assert.match(html,/data-journal-slot/);assert.match(html,/j-subnav/);assert.match(html,/返回项目资料/);
  const body=renderMarkdown(d.markdown,{resolveLink:href=>readingLink(href,d.source)});
  for(const [,href]of body.matchAll(/href="([^"]+)"/g)){
   assert.ok(!/^\/(?:packages|assets)\/.*\.(?:md|txt)(?:[?#]|$)/.test(href),`${d.id}: ${href}`);
   if(href.startsWith('/notes/'))assert.ok(pages.has(href.split(/[?#]/)[0].slice(1)+'index.html'),`${d.id}: ${href}`);
  }
 }
 const parent=pages.get('notes/mario-mix/docs/terra-stages/index.html').toString();
 assert.match(parent,/href="\/notes\/mario-mix\/docs\/worlds-start\/"/);
 assert.doesNotMatch(parent,/href="[^"]+\.md"/);
});
