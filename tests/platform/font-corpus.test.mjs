import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {javascriptText,jsonText,decodeEntities} from '../../scripts/platform/font-source-text.mjs';
import {collectCorpus,decodeText,htmlText,buildFontSupport,checkFontSupport,RECORD,sha} from '../../scripts/platform/font-support.mjs';
import {planContent,validateMessages} from '../../scripts/platform/content.mjs';
import {fixture} from './helpers/font-fixture.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const runtime=fs.readFileSync(path.join(root,'assets/site-i18n.js'),'utf8');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'content/locales/en.json'),'utf8'));
const oldTitle='混合马里奥Ⅳ · 索尼克 × 奥日', title='混合马里奥 IV · 索尼克 × 奥日';
const oldMap=`globalThis.SITE_EN=Object.freeze({${JSON.stringify(oldTitle)}:'Mario Mix IV · Sonic × Ori'});`;
const has=(s,n)=>s.includes(String.fromCodePoint(n));

// The old collector expanded source-notation even inside a regular expression.
test('actual locale runtime reproduces both false range endpoints under the old raw scan',()=>{
  for(const n of [0x3400,0x9fff])assert.ok(has(decodeText(runtime),n));
  const text=javascriptText(runtime,{file:'assets/site-i18n.js'});
  for(const n of [0x3400,0x9fff])assert.equal(has(text,n),false);
  assert.ok(text.includes('语言'));assert.ok(text.includes('中文'));
});
for(const source of [String.raw`const r=/[\u3400-\u9fff]/u;`, 'const r=/[㐀-鿿]/u;',
  String.raw`const r=/["'\u3400-\u9fff]/u;`,String.raw`const r=/\/\*[\u3400-\u9fff]/u;`]) {
  test('RegExp syntax cannot supply display glyphs: '+source,()=>{
    assert.equal(javascriptText(source),'');
  });
}
test('comments, identifiers and directives do not create phantom Unicode display text',()=>{
  const text=javascriptText(String.raw`// \u3400
/* 鿿 and Ⅳ */ const 㐀 = 1; const label='琵琶';`);
  assert.equal(text,'琵琶');
});
test('division and RegExp literals are distinguished by real JavaScript syntax',()=>{
  const text=javascriptText(String.raw`const x=12/3/2; if(x) /[\u3400-\u9fff]/u.test('文字'); const y='琵琶';`);
  assert.ok(text.includes('文字'));assert.ok(text.includes('琵琶'));assert.equal(has(text,0x3400),false);
});
test('regexp after a statement block and a string after division remain distinct',()=>{
  const text=javascriptText(String.raw`if (true) {} /[\u3400-\u9fff]/u.test('文字'); const x=12/3; const text='鹈鹕';`);
  assert.ok(text.includes('鹈鹕'));assert.equal(has(text,0x9fff),false);
});
test('literal RegExp constructor arguments are pattern syntax rather than UI copy',()=>{
  assert.equal(javascriptText(String.raw`const a=new RegExp('[\u3400-\u9fff]','u'); const b=RegExp('㐀鿿');`),'');
});
for(const n of [0x2163,0x3400,0x9fff]) {
  test('a real literal display string is never globally ignored: U+'+n.toString(16),()=>{
    const char=String.fromCodePoint(n);
    assert.ok(has(javascriptText('element.textContent='+JSON.stringify(char)+';'),n));
    assert.ok(has(jsonText(JSON.stringify({title:char})),n));
    assert.ok(has(htmlText('<h1>'+char+'</h1>'),n));
  });
}
test('ordinary JavaScript escapes are cooked once and surrogate pairs are preserved',()=>{
  assert.equal(javascriptText(String.raw`const s='\u7435\u7436\u{20bb7}\uD842\uDFB7';`),'琵琶𠮷𠮷');
});
test('escaped backslash text never becomes a Chinese glyph on a second decoding pass',()=>{
  assert.equal(javascriptText(String.raw`const s='\\u3400';`),String.raw`\u3400`);
  assert.equal(jsonText(JSON.stringify(String.raw`\u3400`)),String.raw`\u3400`);
  assert.equal(htmlText('<p>\\u3400</p>').trim(),String.raw`\u3400`);
});
test('nested interpolations, real literal branches and cooked template segments are retained',()=>{
  const text=javascriptText('const s=`琵${ok ? "鹈" : `鹕${count}`}琶`;');
  for(const char of '琵琶鹈鹕')assert.ok(text.includes(char));
});
test('String.raw preserves source notation while ordinary templates produce actual glyphs',()=>{
  assert.equal(javascriptText(String.raw`const s=String.raw\`\u3400\`;`.replaceAll('\\`','`')),String.raw`\u3400`);
  assert.equal(javascriptText('const s=`\\u3400`;'),'㐀');
});
test('HTML entities in dynamically inserted strings are actual display glyphs',()=>{
  assert.ok(has(javascriptText('el.innerHTML="<p>&#8547;</p>";'),0x2163));
  assert.ok(has(htmlText('<input placeholder="&#x3400;"><h1>&#x9fff;</h1>'),0x3400));
  assert.ok(has(jsonText('{"title":"&#8547;"}'),0x2163));
});
test('ordinary JSON map keys remain covered because applications may display them',()=>{
  const text=jsonText('{"㐀":"琵琶","list":["鹈",{"label":"鹕"}]}');
  for(const char of '㐀琵琶鹈鹕')assert.ok(text.includes(char));
});
test('legacy SITE_EN lookup keys are not rendered, but their translated values are checked',()=>{
  assert.equal(has(javascriptText(oldMap),0x2163),false);
  assert.ok(has(javascriptText('globalThis.SITE_EN=Object.freeze({old:"Ⅳ"});'),0x2163));
});
test('generated English lookup aliases and keyed Chinese outputs have different roles',()=>{
  const source='globalThis.SITE_LOCALE_MESSAGES=Object.freeze({en:{"Ⅳ":"IV"}});'+
    'globalThis.SITE_LOCALE_KEYS=Object.freeze({message:{zh:"Ⅳ",en:"IV"}});';
  assert.ok(has(javascriptText(source),0x2163));
  assert.equal(has(javascriptText(source.split('globalThis.SITE_LOCALE_KEYS')[0]),0x2163),false);
});
test('arbitrary objects, computed keys and unrelated SITE_EN properties remain conservative',()=>{
  for(const source of ['const x={"Ⅳ":"IV"};','other.SITE_EN={"Ⅳ":"IV"};',
    'globalThis.SITE_EN={["Ⅳ"]:"IV"};'])assert.ok(has(javascriptText(source),0x2163));
});
test('bracket notation for the exact known locale owner retains dictionary semantics',()=>{
  assert.equal(has(javascriptText('globalThis["SITE_EN"]={"Ⅳ":"IV"};'),0x2163),false);
});
test('invalid JavaScript and malformed JSON fail with their file name, never an empty corpus',()=>{
  assert.throws(()=>javascriptText('const s="unterminated',{file:'assets/bad.mjs'}),/assets\/bad.mjs/);
  assert.throws(()=>jsonText('{"title":',{file:'content/bad.json'}),/content\/bad.json/);
});
test('static inspection does not execute side effects or call getters',()=>{
  const source='throw Error("do not execute"); Object.defineProperty(globalThis,"danger",{get(){throw Error("getter");}});';
  assert.ok(javascriptText(source).includes('do not execute'));
  assert.equal(globalThis.danger,undefined);
});
test('the current numbered Chinese titles use canonical Latin IV without deleting message IDs',()=>{
  validateMessages(catalog);
  assert.equal(catalog.messages.find(r=>r.id==='message-0068').source,title);
  assert.equal(catalog.messages.find(r=>r.id==='message-0387').source,title);
  assert.equal(catalog.messages.find(r=>r.id==='message-0387').text,'Mario Mix IV · Sonic × Ori');
});
test('real content compiler emits the canonical Chinese title for both stable message IDs',()=>{
  const p=planContent(root),ctx=vm.createContext({});
  vm.runInContext(p.files.get('assets/i18n/messages.js').toString(),ctx);
  for(const id of ['message-0068','message-0387'])assert.equal(ctx.SITE_LOCALE_KEYS[id].zh,title);
  assert.equal(ctx.SITE_LOCALE_MESSAGES.en[title],'Mario Mix IV · Sonic × Ori');
  assert.equal(has(javascriptText(p.files.get('assets/i18n/messages.js').toString()),0x2163),false);
});
test('actual locale runtime still translates the old title via the immutable legacy alias',()=>{
  const document={readyState:'loading',body:null,documentElement:{},addEventListener(){}};
  const ctx=vm.createContext({document,URL,location:{href:'https://aha-xiaoq.github.io/?lang=en'},
    localStorage:{getItem(){return 'en';},setItem(){}}});
  vm.runInContext(oldMap,ctx);
  const oldKeys=Object.keys(ctx.SITE_EN);
  vm.runInContext(planContent(root).files.get('assets/i18n/messages.js').toString(),ctx);
  vm.runInContext(runtime,ctx);
  assert.equal(ctx.SITE_I18N.translate(oldTitle,'en'),'Mario Mix IV · Sonic × Ori');
  assert.equal(ctx.SITE_I18N.message('message-0387',{},'zh'),title);
  assert.deepEqual(Object.keys(ctx.SITE_EN),oldKeys);assert.ok(Object.isFrozen(ctx.SITE_EN));
});
function wire(f,source) {
  f.write('assets/example.mjs',source);
  f.write('notes/example/index.html','<script src="/assets/site-i18n.js"></script><h1>A</h1>');
  for(const p of f.primary)p.coverage=new Set(Array.from({length:95},(_,i)=>i+32));
  return {provider:f.provider,primary:f.primary,pin:f.pin,fetcher:f.fetcher};
}
test('font build and font check use the real collector, not an injected clean corpus',async t=>{
  const f=fixture(t),o=wire(f,String.raw`const r=/[\u3400-\u9fff]/u; const label='琵琶鹈鹕';`);
  const collected=collectCorpus(f.root);
  for(const n of [0x3400,0x9fff])assert.equal(collected.points.includes(n),false);
  const result=await buildFontSupport(f.root,o);assert.equal(result.missingAfterRepair,0);
  assert.equal(checkFontSupport(f.root,o).ok,true);
  const before=sha(fs.readFileSync(path.join(f.root,RECORD)));
  const again=await buildFontSupport(f.root,{...o,fetcher:async()=>{throw Error('offline');}});
  assert.equal(again.changed,0);assert.equal(again.downloaded,0);
  assert.equal(sha(fs.readFileSync(path.join(f.root,RECORD))),before);
});
for(const n of [0x2163,0x3400,0x9fff]) {
  test('visible unsupported glyph still blocks a real collection/build: U+'+n.toString(16),async t=>{
    const f=fixture(t),char=String.fromCodePoint(n),o=wire(f,'const label='+JSON.stringify(char)+';');
    await assert.rejects(buildFontSupport(f.root,o),error=>error.message.includes('U+'+n.toString(16).toUpperCase())&&error.message.includes('assets/example.mjs'));
    assert.equal(fs.existsSync(path.join(f.root,RECORD)),false);
  });
}
test('an actual missing glyph on a generated page remains blocked even if a legacy dictionary translates it',async t=>{
  const f=fixture(t),o=wire(f,oldMap);
  f.write('notes/example/index.html','<script src="/assets/site-i18n.js"></script><h1>Ⅳ</h1>');
  await assert.rejects(buildFontSupport(f.root,o),/U\+2163.*notes\/example\/index.html/);
});
test('malformed source during a refresh preserves all previous generated font bytes',async t=>{
  const f=fixture(t),o=wire(f,'const label="琵琶";');await buildFontSupport(f.root,o);
  const before=sha(fs.readFileSync(path.join(f.root,RECORD)));
  f.write('assets/example.mjs','const text="unterminated');
  await assert.rejects(buildFontSupport(f.root,o),/Cannot parse/);
  assert.equal(sha(fs.readFileSync(path.join(f.root,RECORD))),before);
});
