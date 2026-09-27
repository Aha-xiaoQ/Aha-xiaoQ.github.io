#!/usr/bin/env node
/** Real browser font selection with deliberately geometric fixture fonts.
 * This regression proves descriptor matching, not production WenKai appearance. */
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {readOptional,writeAtomic} from '../lib/safe-path.mjs';
import {stylesheet} from './font-support.mjs';
import {geometricFont} from './browser/font-fixture.mjs';
import {launch,evaluate} from './browser/cdp.mjs';
import {auditRenderedFonts} from './browser/rendered-fonts.mjs';
import {fontReadinessRegression} from './browser/font-readiness-regression.mjs';
import {fontOwnershipRegression} from './browser/font-ownership-regression.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function regressionDocuments(primaryCSS,typography){
 const primary=[...new Set([...Array.from({length:95},(_,i)=>i+32),...'中文原有标题正文按钮测试'.split('').map(c=>c.codePointAt(0))])],extra=[...'琵琶鹈鹕'].map(c=>c.codePointAt(0));
 const p='data:font/woff;base64,'+geometricFont(primary,{family:'QPrimaryFixture'}).toString('base64'),s='data:font/woff;base64,'+geometricFont(extra,{family:'QSupplementFixture'}).toString('base64');
 const base=[...primaryCSS.matchAll(/@font-face\s*\{[^}]*\}/g)].map(m=>m[0]).filter(css=>/font-family:\s*"LXGW WenKai";/.test(css));
 if(base.length!==4||![400,500,600,700].every(w=>base.some(css=>new RegExp('font-weight:\\s*'+w+';').test(css))))throw Error('Production primary font descriptors changed; review this regression');
 const main=base.map(css=>css.replace(/src:[^;]+;/,`src:url("${p}") format("woff");`)).join('\n');
 const rows=[{weight:'400',variant:'regular',sha256:'a'.repeat(64),points:extra},{weight:'500 700',variant:'bold',sha256:'b'.repeat(64),points:extra}];
 const current=stylesheet(rows).replace(/url\("[^"\n]+"\) format\("woff2"\)/g,`url("${s}") format("woff")`);
 const previous=rows.flatMap(r=>['LXGW WenKai Local','LXGW WenKai'].map(f=>`@font-face{font-family:"${f}";src:url("${s}") format("woff");font-weight:${r.weight};font-style:normal;unicode-range:U+7435,U+7436,U+9E48,U+9E55;}`)).join('\n');
 const body=['local','legacy'].flatMap(f=>[400,500,600,700].map(w=>`<section class="${f}" style="font-weight:${w}"><h2>原标题 AB12 琵琶鹈鹕</h2><p>中文正文 Original text 012345 琵琶鹈鹕</p><button>按钮 Start 琵琶</button></section>`)).join('');
 const doc=(fontCSS,extraCSS='')=>'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Font descriptor regression</title><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; font-src data:"><style>'+fontCSS+'\n'+typography+'\nbody{margin:12px}section{margin-bottom:12px}h2,p,button{font-weight:inherit;font-size:20px;line-height:1.4}.legacy{font-family:"LXGW WenKai",serif}'+extraCSS+'</style></head><body><main id="app">'+body+'</main></body></html>';
 return {old:doc(main+previous),fixed:doc(main+current),reverse:doc(current+main),missingPrimary:doc(current),missingSupplement:doc(main),wrongElementStyle:doc(main+current,'h2{font-family:serif!important}')};
}
export async function fontRegression(root=ROOT,{launcher=launch,save=true,widths=[1440,390,320]}={}){
 const docs=regressionDocuments(readOptional(root,'assets/site-brand-tokens.css').toString(),readOptional(root,'assets/platform/typography.css').toString());
 const report={schemaVersion:1,scope:'Real Chromium glyph selection using the production primary descriptors and current generator; geometric fixture glyphs, not a production font visual review',cases:[],errors:[]};let browser;
 try{
  browser=await launcher();report.browser=browser.browser;
  for(const [name,html]of Object.entries(docs))for(const width of widths){
   await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600},browser.sessionId);
   const {frameTree}=await browser.cdp.send('Page.getFrameTree',{},browser.sessionId);
   await browser.cdp.send('Page.setDocumentContent',{frameId:frameTree.frame.id,html},browser.sessionId);
   const result=await auditRenderedFonts(browser);
   // Old range matching is recorded, not a requirement to preserve a browser bug.
   // Missing resources and overriding the live element remain strict negatives.
   const expected=name==='old'?'diagnostic':['fixed','reverse'].includes(name);
   const passed=(expected==='diagnostic'||result.ok===expected)&&result.elements===24&&result.checked===24;
   const row={name,width,expected,passed,checkedElements:result.checked,observedOK:result.ok,samples:result.samples,errors:result.errors};report.cases.push(row);if(!passed)report.errors.push(row);
  }
  report.readiness=await fontReadinessRegression(root,{browser,widths});
  if(!report.readiness.ok)report.errors.push({problem:'font-readiness-regression-failed',details:report.readiness.errors});
  report.ownership=await fontOwnershipRegression(root,{browser,widths});
  if(!report.ownership.ok)report.errors.push({problem:'font-ownership-regression-failed',details:report.ownership.errors});
 }catch(e){report.errors.push({problem:'font-regression-failed',detail:e.message});}
 finally{await browser?.close();}
 report.ok=report.cases.length===Object.keys(docs).length*widths.length&&report.errors.length===0&&report.ownership?.ok===true&&report.readiness?.ok===true;report.finishedAt=new Date().toISOString();
 if(save)writeAtomic(root,'.local/platform/font-regression.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==2){console.error('Usage: node scripts/platform/font-regression.mjs');process.exitCode=2;}
 else fontRegression().then(r=>{console.log(JSON.stringify({...r,cases:r.cases.map(({errors,samples,...c})=>c)},null,2));if(!r.ok)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});
}
