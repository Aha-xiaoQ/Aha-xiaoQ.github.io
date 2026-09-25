import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{fileURLToPath}from'node:url';import path from'node:path';import vm from'node:vm';
const root=fileURLToPath(new URL('../../',import.meta.url));const get=p=>readFile(path.join(root,p),'utf8');
test('uses the existing site router and shell',async()=>{const r=await get('assets/site-router.js'),s=await get('assets/site-shell.js');new vm.Script(r);new vm.Script(s);assert.ok(r.includes('JOURNAL-R04'));assert.ok(s.includes('JOURNAL-R04'));assert.equal((r.match(/document\.startViewTransition\(commit\)/g)||[]).length,1);assert.ok(!s.includes('["dev/",'));assert.ok(s.includes('["notes/", "开发", "notes"]'));});
test('transition definitions remain the original timing',async()=>{const r=await get('assets/site-router.js');assert.ok(r.includes('q-vt-out 240ms cubic-bezier(.22,.61,.36,1)'));assert.ok(r.includes('q-vt-in 280ms cubic-bezier(.22,.61,.36,1)'));assert.ok(r.includes('prefers-reduced-motion: reduce'));});
test('generic modules contain no project-specific name branches',async()=>{for(const f of ['model.mjs','render.mjs','runtime.mjs']){const code=await get('assets/journal/'+f);assert.ok(!code.includes("id==='mario-mix'"));assert.ok(!code.includes("id === 'mario-mix'"));assert.ok(!code.includes('pixel-workshop'));}});
test('local CSS does not redefine theme, shell, font or animation',async()=>{const css=await get('assets/journal/journal.css');assert.ok(!/:root|@font-face|@keyframes|view-transition|\bbody\s*\{/.test(css));const selectors=css.replace(/\/\*[\s\S]*?\*\//g,'').match(/(?:^|[{}])\s*([^{}]+)\{/g)||[];for(const x of selectors){const selector=x.replace(/^[{}]\s*/,'').replace(/\{$/,'').trim();if(!selector.startsWith('@'))assert.ok(selector.split(',').every(v=>v.trim().startsWith('.journal')),selector);}});
test('native generated entry keeps shared resources and one chrome',async()=>{const html=await get('notes/index.html');assert.equal((html.match(/<header\b/g)||[]).length,1);assert.equal((html.match(/<footer\b/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/data-nav-key=/g)||[]).length,6);assert.ok(html.includes('assets/site-shell.css'));assert.ok(html.includes('assets/site-router.js'));assert.ok(!html.includes('iframe'));});
test('new-project script is local and defaults to draft',async()=>{const source=await get('scripts/journal/add-project.mjs');assert.ok(source.includes("visibility:'draft'"));assert.ok(!/fetch\(|exec\(|spawn\(/.test(source));});
test('existing site language dictionary is not mutated',async()=>{
 // Exercise the real journal module. The shared owner now stores source text;
 // a particular private variable in the retired journal translator is not API.
 const keys=['document','location','SITE_EN','SITE_I18N','SITE_JOURNAL'],saved=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const dictionary=Object.freeze({'开发':'Dev','自定义词条':'Custom entry'}),before=JSON.stringify(dictionary),handlers=new Map(),calls=[];
 try{
  globalThis.location=new URL('https://aha-xiaoq.github.io/notes/');
  globalThis.SITE_EN=dictionary;
  globalThis.SITE_I18N=Object.freeze({apply:scope=>calls.push(scope)});
  globalThis.document={documentElement:{lang:'zh-CN'},querySelectorAll:()=>[],addEventListener:(name,handler)=>{if(!handlers.has(name))handlers.set(name,[]);handlers.get(name).push(handler);}};
  const journal=await import('../../assets/journal/runtime.mjs');
  const languageHandlers=handlers.get('site-language-change')||[];
  assert.equal(languageHandlers.length,1,'one journal listener must delegate language changes');
  for(const lang of ['en','zh-CN','en']){document.documentElement.lang=lang;languageHandlers[0]({detail:{language:lang==='en'?'en':'zh'}});}
  assert.equal(calls.length,3,'each event uses the shared locale owner exactly once');
  journal.afterLanguage();assert.equal(calls.length,4,'explicit refresh has the same owner');
  assert.strictEqual(globalThis.SITE_EN,dictionary);assert.ok(Object.isFrozen(dictionary));assert.equal(JSON.stringify(dictionary),before);
 }finally{for(const [key,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
test('handoff and project source mapping exist',async()=>{for(const p of ['docs/development/START_HERE.md','docs/development/HANDOFF_R04.md','docs/development/STATE_SOURCES.json','docs/development/R04_INSTALLATION.json'])assert.ok((await get(p)).length>50);});
