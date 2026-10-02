// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Aha_xiaoQ and the respective contributors
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {planContent} from '../../scripts/platform/content.mjs';
import {render,metadata} from '../../assets/journal/render.mjs';
import {withDocuments} from '../../assets/journal/documents.mjs';
import {normalizeState} from '../../assets/journal/model.mjs';
import {publicProject,publicState} from '../../assets/release/public-content.mjs';
import {renderMarkdown} from '../../assets/journal/markdown.mjs';
import {decodeAttribute} from '../../scripts/lib/html-resources.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),read=p=>fs.readFileSync(root+p,'utf8');
const catalog=JSON.parse(read('content/development/catalog.json'));
const projects=catalog.projects.map(x=>withDocuments(JSON.parse(read(x.file))));
const states=Object.fromEntries(projects.map(p=>[p.id,normalizeState(JSON.parse(read(p.state.path)),p)]));
const context={catalog,projects,states,publicMode:true};
function locale(){
 const c=vm.createContext({URL,location:{href:'https://aha-xiaoq.github.io/notes/?lang=en'},document:{readyState:'loading',documentElement:{},addEventListener(){}}});
 vm.runInContext(read('assets/site-i18n-data.js'),c);
 vm.runInContext(planContent(root).files.get('assets/i18n/messages.js').toString(),c);
 vm.runInContext(read('assets/site-i18n.js'),c);c.SITE_I18N.register(c.SITE_LOCALE_MESSAGES.en);return c.SITE_I18N;
}
function prose(html){
 return [...html.replace(/<(?:pre|svg)\b[^>]*>[\s\S]*?<\/(?:pre|svg)>/gi,'').replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi,'<code></code>').matchAll(/>([^<>]+)</g)].map(m=>decodeAttribute(m[1]).trim()).filter(Boolean);
}
const api=locale();
for(const route of [{view:'overview',projectId:'mario-mix'},{view:'tasks',projectId:'pixel-workshop'}])test('actual public projection has complete English navigation/task copy: '+route.projectId+'/'+route.view,()=>{
 const projected={...context,projects:projects.map(publicProject),states:Object.fromEntries(Object.entries(states).map(([id,s])=>[id,publicState(s)]))};
 assert.deepEqual(prose(render(route,projected)).filter(s=>/[\u3400-\u9fff]/.test(api.translate(s,'en'))),[]);
});
for(const p of [null,...projects])test('actual contribution page is bilingual: '+(p?.id||'all'),()=>{
 const route={view:'contribute',...(p?{projectId:p.id}:{})},html=render(route,context);
 const strings=[...prose(html),metadata(route,projects,catalog).title,metadata(route,projects,catalog).intro];
 assert.deepEqual(strings.filter(s=>/[\u3400-\u9fff]/.test(api.translate(s,'en'))),[]);
 for(const s of strings)assert.equal(api.translate(s,'zh'),s);
 assert.match(html,/data-locale-href-en="https:\/\/github.com\/Aha-xiaoQ\/Aha-xiaoQ.github.io\/blob\/main\/CONTRIBUTING.en.md"/);
 assert.match(html,/data-locale-href-zh="https:\/\/github.com\/Aha-xiaoQ\/Aha-xiaoQ.github.io\/blob\/main\/docs\/collab\/GETTING_STARTED.md"/);
});
for(const id of ['contributing','start','content','architecture','add-project','publishing','writing'])test('website guide text has complete English coverage: '+id,()=>{
 const route={view:'docs',projectId:'pixel-workshop',doc:id},html=render(route,context);
 assert.deepEqual(prose(html).filter(s=>/[\u3400-\u9fff]/.test(api.translate(s,'en'))),[]);
});
for(const id of ['episode-one-contributing','terra-contributing'])test('game contribution instructions retain scope and have an English edition: '+id,()=>{
 const html=render({view:'docs',projectId:'mario-mix',doc:id},context);
 assert.deepEqual(prose(html).filter(s=>/[\u3400-\u9fff]/.test(api.translate(s,'en'))),[]);
 assert.match(html,/game:build|npm run pack/);
});
test('English README and index use corresponding contribution, setup and OSS editions',()=>{
 assert.match(read('README.en.md'),/\(CONTRIBUTING.en.md\)/);
 for(const name of ['README','REPRODUCIBILITY','MAINTAINER_AND_CI'])assert.ok(read('README.en.md').includes('docs/oss/'+name+'.en.md'));
 for(const name of ['CONTRIBUTING','docs/collab/GETTING_STARTED','docs/oss/README','docs/oss/PROVENANCE','docs/oss/REPRODUCIBILITY','docs/oss/MAINTAINER_AND_CI','docs/oss/VALIDATION']){
  const source=read(name+'.md'),english=read(name+'.en.md');assert.ok(source.includes(name.split('/').at(-1)+'.en.md'));assert.ok(english.includes(name.split('/').at(-1)+'.md'));
  const html=renderMarkdown(english);
  for(const [,raw]of html.matchAll(/href="([^"]+)"/g)){
   const href=decodeAttribute(raw);if(/^[a-z]+:/i.test(href)||href.startsWith('#'))continue;
   const local=new URL(href,new URL(name+'.en.md','file://'+root));assert.ok(fs.statSync(fileURLToPath(local)).isFile(),name+': '+href);
  }
 }
});
test('English audit keeps baseline, exclusions, unknown settings and historical CI qualifiers',()=>{
 const s=read('docs/oss/README.en.md')+read('docs/oss/PROVENANCE.en.md')+read('docs/oss/REPRODUCIBILITY.en.md');
 for(const term of ['NOASSERTION','inventory-only','HUD_GLYPHS','CC BY-NC','null','not a standardized performance benchmark','40441','ff9bd59b4ab3dbd7ac0af37bc2661c707a73b6111d941325e5db4d64cd40907c'])assert.ok(s.includes(term),term);
 const ci=read('docs/oss/MAINTAINER_AND_CI.en.md');assert.match(ci,/12e4afacbe4e24e1514bc80f5054e5c61bb7acae/);assert.match(ci,/70fe435adbc21306f6276bda0d759f371d079701/);assert.match(ci,/cannot inherit these results/);
 assert.doesNotMatch(read('docs/oss/MAINTAINER_AND_CI.md'),/本次修改只在本地/);
});
