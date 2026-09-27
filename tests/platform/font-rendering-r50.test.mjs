import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {faceWeights,stylesheet,CSS} from '../../scripts/platform/font-support.mjs';
import {hash} from '../../scripts/platform/assets.mjs';
import {wirePlatform} from '../../scripts/platform/wire.mjs';
import {fontEntryState,finalizeFonts} from '../../scripts/platform/font-finalize.mjs';
import {fontSelectionProblems} from '../../scripts/platform/browser/rendered-fonts.mjs';
import {geometricFont} from '../../scripts/platform/browser/font-fixture.mjs';
import {fontCodepoints} from '../../scripts/platform/font-cmap.mjs';
import {regressionDocuments} from '../../scripts/platform/font-regression.mjs';
import {readFailureDetails,failureSummary} from '../../scripts/platform/failure-summary.mjs';
import {validateConfig} from '../../scripts/platform/model.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const rows=[{weight:'400',sha256:'a'.repeat(64),points:[0x7435,0x7436]},{weight:'500 700',sha256:'b'.repeat(64),points:[0x7435,0x7436]}];
const base='<html><head><script src="/assets/site-i18n.js"></script></head><body><main id="app"><h1>原标题</h1></main></body></html>';
const assets=new Map(['assets/site-i18n.js','assets/site-i18n-data.js','assets/i18n/messages.js','assets/platform/config.js','assets/platform/typography.css','assets/platform/font-support.css'].map(p=>[p,Buffer.from(p)]));
const wire=s=>wirePlatform(s,{reader:p=>assets.get(p),map:{imports:{}}});
function fixture(t){const d=fs.mkdtempSync(path.join(os.tmpdir(),'q-font-r50-'));t.after(()=>fs.rmSync(d,{recursive:true,force:true}));fs.mkdirSync(path.join(d,'assets/platform'),{recursive:true});fs.writeFileSync(path.join(d,CSS),'/* complete font resource */\n');return d;}
function fontLink(root){return '<link rel="stylesheet" data-platform-font-support href="/'+CSS+'?v='+hash(fs.readFileSync(path.join(root,CSS)))+'">';}
function putPage(root,links){fs.writeFileSync(path.join(root,'index.html'),'<html><head>'+links+'<link rel="stylesheet" data-platform-typography href="/assets/platform/typography.css"></head><body>原有标题</body></html>');}
const selection={fontFamily:'"LXGW WenKai Local", "LXGW WenKai", serif',symbols:0};
const custom={familyName:'WenKai',isCustomFont:true,glyphCount:8};

test('supplement output uses the same four exact descriptors as the production primary faces',()=>{
 const s=stylesheet(rows),faces=[...s.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m=>m[1]);assert.equal(faces.length,8);
 for(const family of ['LXGW WenKai Local','LXGW WenKai'])for(const weight of [400,500,600,700])assert.equal(faces.filter(f=>f.includes('font-family: "'+family+'";')&&f.includes('font-weight: '+weight+';')).length,1);
 assert.doesNotMatch(s,/font-weight:\s*500\s+700/);assert.equal(s,stylesheet(rows));
});
test('weight expansion retains record compatibility and refuses unreviewed descriptors',()=>{
 assert.deepEqual(faceWeights('400'),[400]);assert.deepEqual(faceWeights('500 700'),[500,600,700]);for(const w of ['500','100 900',700,'normal',null])assert.throws(()=>faceWeights(w));
});
test('font emission never changes source identities, covered codepoints, or font binaries',()=>{
 const before=JSON.stringify(rows),s=stylesheet(rows);assert.equal(JSON.stringify(rows),before);assert.equal((s.match(/U\+7435, U\+7436/g)||[]).length,8);assert.ok(s.includes('./font-support/'+rows[1].sha256+'.woff2'));assert.doesNotMatch(s,/data:|https?:|U\+0-10FFFF/);
});
test('supplement cache URL is the actual content hash, once, before typography',()=>{
 const s=wire(base);assert.ok(s.includes('/'+CSS+'?v='+hash(assets.get(CSS))));assert.equal((s.match(/data-platform-font-support/g)||[]).length,1);assert.ok(s.indexOf('data-platform-font-support')<s.indexOf('data-platform-typography'));assert.ok(s.includes('<h1>原标题</h1>'));assert.equal(wire(s),s);
});
test('a glyph-only CSS change invalidates the nested font resource independently',()=>{
 const s=wire(base),original=assets.get(CSS);assets.set(CSS,Buffer.from('new glyph coverage'));try{const next=wire(s);assert.notEqual(next,s);assert.ok(next.includes('/'+CSS+'?v='+hash(assets.get(CSS))));const re=/data-platform-typography href="([^"]+)"/;assert.equal(next.match(re)[1],s.match(re)[1]);}finally{assets.set(CSS,original);}
});
test('missing font stylesheet is an error, not silent system-font fallback',()=>{
 const b=assets.get(CSS);assets.delete(CSS);try{assert.throws(()=>wire(base),/Missing shared platform asset/);}finally{assets.set(CSS,b);}
});
test('standalone original work does not receive platform typography wiring',()=>{const s='<html><head><title>原作</title></head><body>原作</body></html>';assert.equal(wire(s),s);});
test('typography retains its family rules but has no fixed nested font import',()=>{const s=fs.readFileSync(path.join(root,'assets/platform/typography.css'),'utf8');assert.doesNotMatch(s,/@import.*font-support/);assert.match(s,/--font-body: "LXGW WenKai Local", "LXGW WenKai"/);});
test('real HTML resource inspection accepts exactly one current active font link',t=>{const r=fixture(t);putPage(r,fontLink(r));const state=fontEntryState(r,{pages:['index.html']});assert.equal(state.entries,1);assert.deepEqual(state.stale,[]);});
for(const kind of ['missing','stale','duplicate','disabled','inactive-media','comment-only','inert-template'])test('font entry check rejects '+kind,t=>{
 const r=fixture(t),link=fontLink(r);putPage(r,({missing:'',stale:link.replace(/v=[a-f0-9]+/,'v=old'),duplicate:link+link,disabled:link.replace('<link','<link disabled'),'inactive-media':link.replace('<link','<link media="not all"'), 'comment-only':'<!--'+link+'-->', 'inert-template':'<template>'+link+'</template>'})[kind]);assert.deepEqual(fontEntryState(r,{pages:['index.html']}).stale,['index.html']);
});
test('font entry check never edits a stale generated page',t=>{const r=fixture(t);putPage(r,'');const before=fs.readFileSync(path.join(r,'index.html'));fontEntryState(r,{pages:['index.html']});assert.deepEqual(fs.readFileSync(path.join(r,'index.html')),before);});
test('font finalization is a no-op when existing builders already linked current fonts',async()=>{
 const calls=[];const result=await finalizeFonts('/unused',{build:async()=>({changed:0}),inspect:()=>({entries:5,stale:[]}),execute:async s=>{calls.push(s);return{code:0};}});assert.equal(result.rebuilt,false);assert.deepEqual(calls,[]);
});
test('font finalization rebuilds through both owning builders and verifies convergence',async()=>{
 const calls=[];let n=0;const result=await finalizeFonts('/unused',{build:async()=>({changed:n++?0:1}),inspect:()=>({entries:5,stale:n===1?['index.html']:[]}),execute:async s=>{calls.push(s.script);return{code:0};}});assert.deepEqual(calls,['journal:build','site:build']);assert.equal(result.rebuilt,true);assert.equal(n,2);
});
test('font finalization stops on first builder error',async()=>{const calls=[];await assert.rejects(finalizeFonts('/unused',{build:async()=>({changed:1}),inspect:()=>({entries:1,stale:['index.html']}),execute:async s=>{calls.push(s.script);return{code:1};}}),/journal:build/);assert.deepEqual(calls,['journal:build']);});
test('font finalization refuses unchanged stale links and continuing font mutations',async()=>{
 for(const scenario of ['stale','changing'])await assert.rejects(finalizeFonts('/unused',{build:async()=>({changed:scenario==='changing'?1:0}),inspect:()=>({entries:1,stale:scenario==='stale'?['index.html']:['old']}),execute:async()=>({code:0})}),/did not converge/);
});
test('empty source inspection cannot claim all page fonts are correct',async()=>{await assert.rejects(finalizeFonts('/unused',{build:async()=>({changed:0}),inspect:()=>({entries:0,stale:[]})}),/No actual/);});
test('actual element font selection accepts decoded custom primary and supplement faces',()=>assert.deepEqual(fontSelectionProblems(selection,[custom,{...custom,familyName:'Supplement'}]),[]));
test('custom supplement does not conceal loss of the original Chinese/Latin font',()=>assert.ok(fontSelectionProblems(selection,[custom,{familyName:'Microsoft YaHei',isCustomFont:false,glyphCount:6}]).includes('primary-or-supplement-fell-back')));
test('a node overriding the site font is diagnosed even if its replacement is another custom font',()=>assert.ok(fontSelectionProblems({...selection,fontFamily:'UnexpectedCustom'},[custom]).includes('unexpected-ui-font-family')));
test('uninspected or empty font results are blockers',()=>{for(const fonts of [[],null,[{...custom,glyphCount:0}]])assert.ok(fontSelectionProblems(selection,fonts).includes('no-rendered-font-evidence'));});
test('OS symbol fonts are bounded by actual symbols, never a generic CJK exemption',()=>{
 assert.deepEqual(fontSelectionProblems({...selection,symbols:1},[custom,{familyName:'Segoe UI Emoji',isCustomFont:false,glyphCount:1}]),[]);
 for(const f of [{familyName:'Segoe UI Emoji',isCustomFont:false,glyphCount:2},{familyName:'Noto Sans CJK SC',isCustomFont:false,glyphCount:1}])assert.ok(fontSelectionProblems({...selection,symbols:1},[custom,f]).length);
});
test('geometric fixture generator emits reproducible decodable cmap without reading any installed font',()=>{
 const b=geometricFont([65,0x4e2d,0x7435]);assert.equal(b.subarray(0,4).toString(),'wOFF');assert.deepEqual([...fontCodepoints(b)].sort((a,b)=>a-b),[65,0x4e2d,0x7435]);assert.deepEqual(b,geometricFont([65,0x4e2d,0x7435]));
});
test('browser regression includes both old failure and corrected exact-weight generation',()=>{
 const d=regressionDocuments(fs.readFileSync(path.join(root,'assets/site-brand-tokens.css'),'utf8'),fs.readFileSync(path.join(root,'assets/platform/typography.css'),'utf8'));
 assert.deepEqual(Object.keys(d),['old','fixed','reverse','missingPrimary','missingSupplement','wrongElementStyle']);assert.match(d.old,/font-weight:500 700/);for(const f of d.fixed.matchAll(/@font-face\s*\{[^}]+\}/g))if(/font-family:\s*"LXGW WenKai(?: Local)?";/.test(f[0]))assert.doesNotMatch(f[0],/font-weight:\s*500\s+700/);assert.match(d.fixed,/原标题 AB12 琵琶鹈鹕/);assert.equal((d.fixed.match(/<section /g)||[]).length,8);
});
test('required gates include original source tests, actual source fonts, and publication fonts',()=>{
 const c=validateConfig(JSON.parse(fs.readFileSync(path.join(root,'config/site-platform.json'))));const v=c.pipelines.verify;
 for(const id of ['source-tests','source-checks','font-coverage','font-render-regression','font-source-pages','browser-artifact'])assert.equal(v.filter(s=>s.id===id).length,1);
 const build=v.find(s=>s.id==='publication-build');assert.ok(build.after.includes('font-source-pages'));assert.ok(build.after.includes('font-render-regression'));
 assert.equal(c.pipelines.build.find(s=>s.id==='font-refresh').file,'scripts/platform/font-finalize.mjs');
 assert.match(fs.readFileSync(path.join(root,'scripts/platform/browser.mjs'),'utf8'),/actual-element-font-rendering/);
});

for(const id of ['font-source-pages','font-render-regression'])test('current font failure details are surfaced for '+id,t=>{
 const r=fixture(t),start='2026-09-27T10:00:00Z',end='2026-09-27T10:05:00Z';
 fs.mkdirSync(path.join(r,'.local/platform'),{recursive:true});const name=id==='font-source-pages'?'font-pages.json':'font-regression.json';
 const report={ok:false,startedAt:start,finishedAt:end,phases:[{results:[{id,status:'failed'}]}]};
 const d={ok:false,finishedAt:'2026-09-27T10:04:00Z',errors:[{page:'notes/lab/index.html',language:'zh',width:390,problem:'source-page-font-rendering',details:[{tag:'h2',text:'原标题',weight:'700',fonts:[{family:'Kaiti',custom:false}]}]}]};
 fs.writeFileSync(path.join(r,'.local/platform',name),JSON.stringify(d));const details=readFailureDetails(r,report);assert.ok(details[id]);const lines=failureSummary(report,details).join('\n');for(const key of ['原标题','weight 700','Kaiti [system]','390px'])assert.ok(lines.includes(key),key);
 d.finishedAt='2026-09-26T10:04:00Z';fs.writeFileSync(path.join(r,'.local/platform',name),JSON.stringify(d));assert.equal(readFailureDetails(r,report)[id],undefined);
});

test('page regeneration cannot remove every font entry and call that convergence',async()=>{
 let round=0;await assert.rejects(finalizeFonts('/unused',{build:async()=>{round++;return{changed:0};},inspect:()=>round===1?{entries:1,stale:['index.html']}:{entries:0,stale:[]},execute:async()=>({code:0})}),/did not converge/);
});
