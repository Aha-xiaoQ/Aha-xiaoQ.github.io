import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fontPageState,fontReadinessProblems,waitForFontPage} from '../../scripts/platform/browser/font-page-ready.mjs';
import {standaloneMain} from '../../scripts/platform/browser/font-readiness-regression.mjs';
const url='http://127.0.0.1:5873/projects/q-mimi/index.html?lang=zh';
// Exact observed state from the user's failed FIX1 run, not a success sentinel.
const observed={url,readyState:'complete',title:'Q咪 · 在下_小Q',localeReady:true,language:'zh',app:false,main:true,heading:true,journal:false,resourceFailure:false,pendingStyles:[]};
test('the exact Q Mimi diagnostic was caused only by the obsolete wrapper requirement',()=>{
 assert.equal(!observed.app||!observed.main||!observed.heading,true);
 assert.deepEqual(fontReadinessProblems(observed,url),[]);
});
for(const app of [true,false,undefined])test('router wrapper is not a semantic readiness condition: '+app,()=>assert.deepEqual(fontReadinessProblems({...observed,app},url),[]));
for(const [field,value,problem]of [
 ['main',false,'content-not-ready'],['heading',false,'content-not-ready'],['localeReady',false,'locale-not-ready'],
 ['language','en','locale-not-ready'],['readyState','loading','document-not-parsed'],
 ['pendingStyles',['/assets/not-ready.css'],'styles-not-ready'],['resourceFailure',true,'page-resource-failure'],['url','http://127.0.0.1:5873/other/','wrong-document']
])test('standalone pages still block '+problem+' / '+field,()=>assert.ok(fontReadinessProblems({...observed,[field]:value},url).includes(problem)));
test('standalone documents under notes still require the journal to mount',()=>{
 const expected='http://127.0.0.1:5873/notes/example/?lang=zh';
 assert.ok(fontReadinessProblems({...observed,url:expected},expected).includes('journal-not-ready'));
 assert.deepEqual(fontReadinessProblems({...observed,url:expected,journal:true},expected),[]);
});
test('the real waiter accepts the observed standalone state without manipulating DOM',async()=>{
 const expressions=[];const browser={cdp:{send:async(method,params)=>{assert.equal(method,'Runtime.evaluate');expressions.push(params.expression);return{result:{value:observed}};}}};
 assert.deepEqual(await waitForFontPage(browser,url),observed);assert.equal(expressions.length,1);
 assert.equal(expressions[0],'('+fontPageState.toString()+')()');
});
test('waiter does not pass before content arrives on a standalone page',async()=>{
 let calls=0;const browser={cdp:{send:async()=>({result:{value:++calls===1?{...observed,main:false}:observed}})}};
 assert.deepEqual(await waitForFontPage(browser,url,{timeout:1000}),observed);assert.equal(calls,2);
});
test('readiness source contains no Q Mimi URL exception or DOM insertion',()=>{
 const s=fs.readFileSync(new URL('../../scripts/platform/browser/font-page-ready.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(s,/q-mimi|createElement|appendChild|innerHTML\s*=|\.remove\(/);
});
test('the independent main extractor preserves markup rather than generating replacement prose',()=>{
 const main='<main id="main"><h1>你好，我是 Q咪。</h1><p>正文 <code>test</code></p></main>';
 assert.equal(standaloneMain('<html><body>'+main+'</body></html>'),main);
});
for(const value of [null,'<main></main>','<main><h1>X</h1>','<main><h1>X</h1></main><main></main>','<main><h1>X</h1><script>0</script></main>'])test('invalid independent fixture source fails closed: '+value,()=>assert.throws(()=>standaloneMain(value)));
test('browser readiness regression is mandatory and cannot silently succeed on its absence',()=>{
 const s=fs.readFileSync(new URL('../../scripts/platform/font-regression.mjs',import.meta.url),'utf8');
 assert.match(s,/await fontReadinessRegression\(root,\{browser,widths\}\)/);
 assert.match(s,/report\.readiness\?\.ok===true/);
 const source=fs.readFileSync(new URL('../../scripts/platform/font-pages.mjs',import.meta.url),'utf8');
 assert.match(source,/const pages=given\|\|sourceFontPages\(root\)/);
 assert.doesNotMatch(source,/q-mimi/);
 assert.match(source,/report\.cases\.length===pages\.length\*widths\.length\*2/);
});
