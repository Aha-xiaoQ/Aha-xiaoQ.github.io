import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {fontPageMatches,fontReadinessProblems,waitForFontPage} from '../../scripts/platform/browser/font-page-ready.mjs';
import {fontSelectionProblems,renderedFontNodes,disclosureState} from '../../scripts/platform/browser/rendered-fonts.mjs';
import {ownershipDocuments} from '../../scripts/platform/browser/font-ownership-regression.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const expected='http://127.0.0.1:4173/games/mario-mix-3/index.html?lang=zh';
const ready={url:expected,readyState:'interactive',localeReady:true,language:'zh',app:true,main:true,heading:true,journal:false,resourceFailure:false,pendingStyles:[]};
const organization=fs.readFileSync(root+'assets/journal/organization.css','utf8'),typography=fs.readFileSync(root+'assets/platform/typography.css','utf8');

test('experiment kicker inherits the actual site family without changing size, weight, or spacing',()=>{
 const block=organization.match(/\.journal \.q-lab-kicker\{([^}]+)\}/)?.[1];assert.ok(block);
 for(const declaration of ['font-family:inherit','font-size:.7rem','font-weight:400','line-height:1.8','letter-spacing:.3em'])assert.ok(block.includes(declaration),declaration);
 assert.doesNotMatch(block,/system-ui|Arial|sans-serif|!important/);
});
test('only action metadata receives inherited typeface; code retains monospace',()=>{
 assert.match(typography,/#app \.pw-action \.q-action-meta\s*\{\s*font-family:\s*inherit;\s*\}/);
 assert.match(typography,/:is\(pre,code,kbd,samp\).*ui-monospace/);
 assert.doesNotMatch(typography,/\*\s*\{[^}]*font-family|font-family:[^;]*!important/);
});
test('decorative lab artwork retains its independent original typography',()=>{
 assert.match(organization,/\.q-lab-visual strong\{font:900 clamp\(3rem,7vw,6rem\)\/1 system-ui,sans-serif/);
});
for(const actual of [expected,'http://127.0.0.1:4173/games/mario-mix-3/?lang=zh','http://127.0.0.1:4173/games/mario-mix-3/?lang=zh&v=fresh#part'])test('font readiness recognizes this same document: '+actual,()=>assert.equal(fontPageMatches(actual,expected),true));
for(const actual of ['http://127.0.0.1:4174/games/mario-mix-3/','https://outside.example/games/mario-mix-3/','http://127.0.0.1:4173/games/mario-mix-4/','http://127.0.0.1:4173/Games/mario-mix-3/','about:blank','not a URL'])test('font readiness rejects wrong document: '+actual,()=>assert.equal(fontPageMatches(actual,expected),false));
test('font readiness need not wait for unrelated images after DOM and local styles are ready',()=>assert.deepEqual(fontReadinessProblems(ready,expected),[]));
for(const [key,value,problem]of [
 ['readyState','loading','document-not-parsed'],['language','en','locale-not-ready'],['localeReady',false,'locale-not-ready'],
 ['main',false,'content-not-ready'],['heading',false,'content-not-ready'],
 ['pendingStyles',['/assets/platform/font-support.css'],'styles-not-ready'],['pendingStyles',null,'styles-not-ready'],
 ['resourceFailure',true,'page-resource-failure']
])test('font readiness still blocks '+key,()=>assert.ok(fontReadinessProblems({...ready,[key]:value},expected).includes(problem)));
test('semantic standalone content does not require the router #app wrapper',()=>assert.deepEqual(fontReadinessProblems({...ready,app:false},expected),[]));
test('development pages require the live journal mount',()=>{
 const u='http://127.0.0.1:4173/notes/lab/?lang=zh',state={...ready,url:u};assert.ok(fontReadinessProblems(state,u).includes('journal-not-ready'));assert.deepEqual(fontReadinessProblems({...state,journal:true},u),[]);
});
test('missing readiness evidence cannot pass',()=>assert.ok(fontReadinessProblems(null,expected).length>=5));
test('the readiness waiter returns the inspected state, not synthetic completion',async()=>{
 const browser={cdp:{send:async()=>({result:{value:ready}})},sessionId:'unit'};assert.deepEqual(await waitForFontPage(browser,expected),ready);
});
test('the readiness waiter reports real observed URL and missing local styles',async()=>{
 const state={...ready,resourceFailure:true,pendingStyles:['/assets/missing.css']};const browser={cdp:{send:async()=>({result:{value:state}})}};
 await assert.rejects(waitForFontPage(browser,expected),e=>e.message.includes('/assets/missing.css')&&e.message.includes(expected)&&e.message.includes('page-resource-failure'));
});
test('invalid readiness timeouts do not start a wait',async()=>{for(const timeout of [0,-1,Infinity,60001])await assert.rejects(waitForFontPage({},expected,{timeout}),/Invalid/);});
test('plain-text fallback remains an error even when another run uses the custom font',()=>{
 const row={fontFamily:'"LXGW WenKai",serif',symbols:0};assert.ok(fontSelectionProblems(row,[{familyName:'LXGW WenKai',isCustomFont:true,glyphCount:5},{familyName:'Arial',isCustomFont:false,glyphCount:2}]).includes('primary-or-supplement-fell-back'));
});
test('multiple OS symbol fonts share one actual symbol budget',()=>{
 const row={fontFamily:'"LXGW WenKai",serif',symbols:1},f=[{familyName:'One Symbol',isCustomFont:false,glyphCount:1},{familyName:'Two Emoji',isCustomFont:false,glyphCount:1}];assert.ok(fontSelectionProblems(row,f).length);
});
test('font collector and disclosure routines serialize without importing browser globals',()=>{
 for(const f of [renderedFontNodes,disclosureState])assert.equal(typeof new Function('return ('+f.toString()+')')(),'function');
});
test('regression documents cover real label styles, inline code, nested and named disclosures, and missing files',()=>{
 const d=ownershipDocuments(organization,typography);assert.equal(Object.keys(d.documents).length,9);
 for(const text of ['BILIBILI · VIDEO WORK','ONE PROMPT · ONE RIDE','GitHub','id="inline-code"','id="closed"','display:contents'])assert.ok(d.documents.fixed.includes(text),text);
 assert.match(d.documents.namedDisclosures,/name="exclusive"/);assert.ok(d.primaryPoints.length>95);assert.equal(d.extra.length,4);
 assert.match(d.documents.previousLabelRules,/font:\.7rem\/1.8 system-ui,sans-serif/);
});
test('ownership regression is required before full source-page font checks',()=>{
 const source=fs.readFileSync(root+'scripts/platform/font-regression.mjs','utf8');assert.match(source,/await fontOwnershipRegression\(root,\{browser,widths\}\)/);assert.match(source,/report\.ownership\?\.ok===true/);
 const c=JSON.parse(fs.readFileSync(root+'config/site-platform.json'));assert.ok(c.pipelines.verify.find(s=>s.id==='font-source-pages').after.includes('font-render-regression'));
});
