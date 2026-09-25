import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {README_LOCALES, readmeSiteURL, readmeLinks, assertReadmeLanguage, checkReadmeLinks} from '../../scripts/platform/readme-links.mjs';
import {readmeBlock, replaceReadme, sync, TARGETS, PROJECT} from '../../scripts/videos/sync.mjs';
import {assertSourceReadme} from '../helpers/source-readme.mjs';
import {entryCases} from '../../scripts/platform/browser/readme-navigation.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const runtime=read('assets/site-i18n.js');
const projectFixture={id:'mario-mix',currentRelease:{documentId:'terra-source'},docs:[{id:'terra-source'},{id:'episode-4-source',action:{href:'/downloads/source/MarioMix_Episode4_R43_Source.zip'}}]};

for(const [file,locale] of Object.entries(README_LOCALES)) {
 test(file+' has the right explicit language in all real website links',()=>{
  const pages=assertReadmeLanguage(read(file),file);assert.ok(pages.length>=10);
  for(const link of pages)assert.equal(new URL(link.href).searchParams.get('lang'),locale);
 });
 test(file+' retains the third/fourth source guides and unmodified source download',()=>{
  const required=assertSourceReadme(read(file),projectFixture,file);assert.equal(required.length,3);
  const zip=readmeLinks(read(file)).find(x=>x.href.endsWith('MarioMix_Episode4_R43_Source.zip'));assert.ok(zip);
 });
 test(file+' reversed website language is rejected',()=>{
  const bad=read(file).replace(/lang=(?:en|zh)/g,'lang='+(locale==='zh'?'en':'zh'));
  assert.throws(()=>assertReadmeLanguage(bad,file),/expected lang=/);
 });
 test(file+' unspecified website language is rejected',()=>{
  assert.throws(()=>assertReadmeLanguage(read(file).replace(/\?lang=(?:en|zh)/g,''),file),/expected lang=/);
 });
 test(file+' wrong language switch cannot pass as a correct website link',()=>{
  const bad=locale==='zh'?read(file).replace('[English](README.en.md)','[English](README.md)'):read(file).replace('[简体中文](README.md)','[简体中文](README.en.md)');
  assert.throws(()=>assertReadmeLanguage(bad,file),/language switch/);
 });
 test(file+' duplicate language parameters are rejected',()=>{
  assert.throws(()=>assertReadmeLanguage(read(file).replace('?lang='+locale,'?lang='+locale+'&lang='+locale),file),/expected lang=/);
 });
 test(file+' code and comments cannot supply a missing website entry',()=>{
  const text=read(file),home=readmeLinks(text).find(l=>new URL(l.href).pathname==='/'&&new URL(l.href).hostname==='aha-xiaoq.github.io');
  const markdown=`[${home.label}](${home.href})`;
  for(const hidden of ['<!-- '+markdown+' -->','`'+markdown+'`','\n```md\n'+markdown+'\n```\n']){
   assert.throws(()=>assertReadmeLanguage(text.replace(markdown,hidden),file),/visible \/ entry/);
  }
 });
 test(file+' video block regeneration keeps its website language and Bilibili URLs',()=>{
  const rows=TARGETS.map((t,i)=>({...t,url:i?'https://www.bilibili.com/video/BV1kLha63EyV/':'https://www.bilibili.com/video/BV1JBhh6iEXS/'}));
  const block=readmeBlock(rows,locale==='en'),once=replaceReadme(read(file),block);
  assert.equal(once,read(file));assert.equal(replaceReadme(once,block),once);assertReadmeLanguage(once,file);
  for(const r of rows)assert.ok(block.includes(']('+r.url+')'));
  assert.ok(block.includes('](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html)'));
 });
}
test('both README files retain identical page destinations apart from locale',()=>assert.equal(checkReadmeLinks(root).length,2));
test('same-origin page query and hash are preserved while locale is replaced once',()=>{
 const u=new URL(readmeSiteURL('https://aha-xiaoq.github.io/notes/?q=site&lang=en&lang=zh#start','zh'));
 assert.equal(u.searchParams.get('q'),'site');assert.deepEqual(u.searchParams.getAll('lang'),['zh']);assert.equal(u.hash,'#start');
});
for(const href of ['https://aha-xiaoq.github.io/downloads/source/a.zip','https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html','https://aha-xiaoq.github.io/experiments/pelican-bicycle.html','https://aha-xiaoq.github.io/games/example/play.html','https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io','https://www.bilibili.com/video/BV1g9bx6PEwL/']) {
 test('locale generation leaves independent/external destination unchanged: '+href,()=>{
  for(const lang of ['zh','en'])assert.equal(readmeSiteURL(href,lang),href);
 });
}
test('only supported README languages are accepted, without changing the runtime locale contract',()=>{
 for(const lang of ['zh-CN','EN','fr',null])assert.throws(()=>readmeSiteURL('https://aha-xiaoq.github.io/',lang));
});
test('native artifact regression uses real README URLs in both directions',()=>{
 const cases=entryCases(checkReadmeLinks(root),'http://127.0.0.1:4199');assert.equal(cases.length,4);
 for(const c of cases)assert.equal(new URL(c.url).searchParams.get('lang'),README_LOCALES[c.file]);
 assert.throws(()=>entryCases(checkReadmeLinks(root),'https://outside.test'));
});

function boot(href,saved='zh',denied=false) {
 const storage=new Map([['xiaoq-site-language',saved]]),events=[],state={keep:'history-state'},headNodes=[];
 const doc={readyState:'loading',body:null,documentElement:{},title:'开发 · 在下_小Q',
  addEventListener(){},dispatchEvent(event){events.push(event);},
  querySelector(selector){return headNodes.find(n=>selector==='link[rel="canonical"]'&&n.rel==='canonical')||null;},
  createElement(){return {setAttribute(k,v){this[k]=v;}};},head:{append(node){headNodes.push(node);}}};
 const location={href};Object.defineProperty(location,'pathname',{get:()=>new URL(location.href).pathname});
 const history={state,replaceState(next,_,url){this.state=next;location.href=new URL(url,location.href).href;}};
 const localStorage={getItem(key){if(denied)throw Error('Denied');return storage.get(key)||null;},setItem(key,v){if(denied)throw Error('Denied');storage.set(key,v);}};
 const context=vm.createContext({URL,document:doc,location,history,localStorage,CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}}});
 vm.runInContext(runtime,context);return {api:context.SITE_I18N,doc,storage,location,history,state,events};
}
for(const [file,lang]of Object.entries(README_LOCALES))for(const saved of ['zh','en',null]){
 test(file+' entry overrides saved preference '+saved,()=>{
  const href=assertReadmeLanguage(read(file),file).find(x=>new URL(x.href).pathname==='/').href;
  const result=boot(href,saved);assert.equal(result.api.language,lang);assert.equal(result.doc.documentElement.lang,lang==='zh'?'zh-CN':'en');
  assert.equal(result.storage.get('xiaoq-site-language'),lang);
 });
}
for(const [file,lang]of Object.entries(README_LOCALES)) {
 test(file+' direct entry and reload work when storage is denied',()=>{
  const href=assertReadmeLanguage(read(file),file)[0].href;
  assert.equal(boot(href,lang==='zh'?'en':'zh',true).api.language,lang);
  assert.equal(boot(href,lang==='zh'?'en':'zh',true).api.language,lang);
 });
 test(file+' route without a locale keeps entry language, explicit opposite entry wins',()=>{
  const result=boot(assertReadmeLanguage(read(file),file)[0].href,lang==='zh'?'en':'zh');
  result.location.href='https://aha-xiaoq.github.io/notes/?q=keep#anchor';result.api.route({page:'notes'});
  assert.equal(result.api.language,lang);assert.equal(new URL(result.location.href).searchParams.get('q'),'keep');
  const opposite=lang==='zh'?'en':'zh';result.location.href='https://aha-xiaoq.github.io/notes/?q=keep&lang='+opposite+'#anchor';result.api.route({page:'notes'});
  assert.equal(result.api.language,opposite);assert.equal(new URL(result.location.href).hash,'#anchor');
  result.api.setLanguage(lang);assert.strictEqual(result.history.state,result.state);assert.equal(new URL(result.location.href).searchParams.get('q'),'keep');
 });
}
test('old neutral links reproduce the reported opposite-language outcomes',()=>{
 assert.equal(boot('https://aha-xiaoq.github.io/','en').api.language,'en');
 assert.equal(boot('https://aha-xiaoq.github.io/','zh').api.language,'zh');
});
test('real video sync cannot undo language links during initial or repeat generation',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'xiaoq-readme-sync-'));
 const put=(p,s)=>{fs.mkdirSync(path.dirname(path.join(dir,p)),{recursive:true});fs.writeFileSync(path.join(dir,p),s);};
 try {
  for(const file of Object.keys(README_LOCALES))put(file,read(file));
  const fixture={links:[],highlights:[],docs:[{id:'episode-4',sections:[],sources:[]}]};
  put(PROJECT,JSON.stringify(fixture,null,2)+'\n');
  const data={items:[{id:'game-mario-mix-4',videoSlot:true,videoUrl:'https://www.bilibili.com/video/BV1JBhh6iEXS/'}],tools:[{id:'mario-map-workshop',videoSlot:true,videoUrl:'https://www.bilibili.com/video/BV1kLha63EyV/'}]};
  put('content/site-data.js','globalThis.SITE_DATA='+JSON.stringify(data)+';');
  sync(dir);assert.equal(checkReadmeLinks(dir).length,2);
  for(const file of Object.keys(README_LOCALES))assert.equal(fs.readFileSync(path.join(dir,file),'utf8'),read(file));
  assert.deepEqual(sync(dir),{changed:0});assert.deepEqual(sync(dir,{check:true}),{changed:0});
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
