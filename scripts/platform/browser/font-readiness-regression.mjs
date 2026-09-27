/** Regression for semantic pages that do not use the router's #app wrapper.
 * Reuses the current Q Mimi main markup, not a replacement production page.
 * DOM, selectors and Text-node font evidence are real Chromium; URL and locale
 * state are controlled fixture inputs. Geometric glyphs are not WenKai review.
 */
import {createHash} from 'node:crypto';
import {readOptional} from '../../lib/safe-path.mjs';
import {evaluate} from './cdp.mjs';
import {fontPageState,fontReadinessProblems} from './font-page-ready.mjs';
import {auditRenderedFonts} from './rendered-fonts.mjs';
import {geometricFont} from './font-fixture.mjs';

export function standaloneMain(source){
 if(typeof source!=='string')throw Error('Missing standalone page source');
 const starts=[...source.matchAll(/<main\b[^>]*>/gi)],ends=[...source.matchAll(/<\/main\s*>/gi)];
 if(starts.length!==1||ends.length!==1||ends[0].index<starts[0].index)throw Error('Standalone page needs one complete main');
 const main=source.slice(starts[0].index,ends[0].index+ends[0][0].length);
 if(!/<h1\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h1\s*>/i.test(main))throw Error('Standalone page heading is missing');
 if(/<script\b/i.test(main))throw Error('Review active code added inside the standalone regression main');
 return main;
}
export async function fontReadinessRegression(root,{browser,widths=[1440,390,320]}={}){
 if(!browser?.cdp)throw Error('A real browser is required for readiness regression');
 const source='projects/q-mimi/index.html',bytes=readOptional(root,source);
 if(!bytes)throw Error('Missing standalone page regression source: '+source);
 const main=standaloneMain(bytes.toString('utf8'));
 const mainSha256=createHash('sha256').update(main).digest('hex');
 const glyphs=[...new Set([...main].map(c=>c.codePointAt(0)).filter(n=>n>=32))];
 const font='data:font/woff;base64,'+geometricFont(glyphs,{family:'QStandaloneReadinessFixture'}).toString('base64');
 const faces=[400,500,600,700].map(w=>`@font-face{font-family:"LXGW WenKai";src:url("${font}") format("woff");font-weight:${w};font-style:normal;}`).join('\n');
 const typography=readOptional(root,'assets/platform/typography.css').toString('utf8');
 const report={scope:'Current standalone main markup in real Chromium DOM; controlled URL/locale inputs and geometric glyphs, not full-site HTTP or production WenKai visual acceptance',source,mainSha256,cases:[],errors:[]};
 const layouts={standalone:main,router:'<div id="app">'+main+'</div>',otherHost:'<div id="independent-root">'+main+'</div>'};
 const documentHTML=body=>'<!doctype html><html><head><meta charset="utf-8"><title>Standalone font readiness regression</title><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; font-src data:"><style>'+faces+'\n'+typography+'</style></head><body>'+body+'</body></html>';
 async function mount(body,language,width){
  await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600},browser.sessionId);
  const {frameTree}=await browser.cdp.send('Page.getFrameTree',{},browser.sessionId);
  await browser.cdp.send('Page.setDocumentContent',{frameId:frameTree.frame.id,html:documentHTML(body)},browser.sessionId);
  await evaluate(browser,'globalThis.SITE_I18N={language:'+JSON.stringify(language)+'};true');
  await evaluate(browser,'document.fonts.ready.then(()=>true)');
 }
 async function snapshot(language){
  const observed=await evaluate(browser,'('+fontPageState.toString()+')()');
  const expected='http://127.0.0.1:4173/projects/q-mimi/index.html?lang='+language;
  // about:blank fixtures cannot represent an HTTP navigation. Only URL is
  // supplied here; real DOM/locale/style booleans remain untouched.
  const input={...observed,url:expected};
  return {observed,expected,input,problems:fontReadinessProblems(input,expected)};
 }
 function record(row){report.cases.push(row);if(!row.passed)report.errors.push(row);}
 for(const [layout,body]of Object.entries(layouts))for(const language of ['zh','en'])for(const width of widths){
  await mount(body,language,width);
  const before=await evaluate(browser,'document.querySelector("main").outerHTML');
  const state=await snapshot(language);
  const glyphEvidence=layout==='standalone'?await auditRenderedFonts(browser):null;
  const unchanged=before===await evaluate(browser,'document.querySelector("main").outerHTML');
  const passed=state.problems.length===0&&state.observed.app===(layout==='router')&&unchanged&&(!glyphEvidence||(glyphEvidence.ok&&glyphEvidence.checked>0));
  record({name:layout,language,width,passed,observed:state.observed,problems:state.problems,previousHostRequirementPassed:state.input.app,unchanged,...(glyphEvidence?{glyphEvidence:{ok:glyphEvidence.ok,checked:glyphEvidence.checked,errors:glyphEvidence.errors}}:{})});
 }
 const negatives=[
  ['missing-main','document.querySelector("main").remove();true','content-not-ready'],
  ['missing-heading','document.querySelector("h1").remove();true','content-not-ready'],
  ['missing-locale','delete globalThis.SITE_I18N;true','locale-not-ready'],
  ['wrong-locale','SITE_I18N.language="en";true','locale-not-ready'],
  ['resource-error','document.body.insertAdjacentHTML("beforeend",\'<div class="q-resource-error">Resource error</div>\');true','page-resource-failure']
 ];
 for(const [name,mutation,problem]of negatives){
  await mount(main,'zh',1440);await evaluate(browser,mutation);
  const state=await snapshot('zh');record({name,passed:state.problems.includes(problem),problems:state.problems,observed:state.observed});
 }
 // Accepting standalone structure never exempts its typography from inspection.
 await mount(main,'zh',1440);await evaluate(browser,'document.querySelector("h1").style.fontFamily="Arial,sans-serif";true');
 const ready=await snapshot('zh'),badFont=await auditRenderedFonts(browser);
 record({name:'standalone-real-font-failure-still-blocked',passed:ready.problems.length===0&&!badFont.ok&&badFont.errors.some(e=>e.problems?.includes('unexpected-ui-font-family')),problems:ready.problems,fontErrors:badFont.errors});
 report.ok=report.cases.length===Object.keys(layouts).length*2*widths.length+negatives.length+1&&report.errors.length===0;
 return report;
}
