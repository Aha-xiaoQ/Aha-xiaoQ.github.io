#!/usr/bin/env node
/** Browser gate on the actual generated artifact, never on a synthetic pass page.
 * External services/fonts are deliberately unavailable in this fallback scenario.
 * Original game and animation scripts are not executed. */
import {checkReadmeLinks} from './readme-links.mjs';
import {auditReadmeNavigation} from './browser/readme-navigation.mjs';
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
import {safe,readOptional,writeAtomic}from'../lib/safe-path.mjs';
import {launch,evaluate,until}from'./browser/cdp.mjs';import {serve,discover}from'./browser/server.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
export async function auditBrowser(root=ROOT,{launcher=launch,widths=[1440,390,320],pages:requested=null,save=true}={}){
 const config=JSON.parse(readOptional(root,'config/publication.json')),artifact=safe(root,config.output);
 if(!fs.statSync(artifact).isDirectory())throw Error('Build the publication artifact first');
 const pages=requested||discover(artifact);if(!pages.length)throw Error('No website pages selected; browser verification cannot be empty');
 const report={schemaVersion:1,scope:'generated public HTML with shared site locale runtime; original embedded works excluded',remoteResources:'intentionally blocked by local CSP',remoteAvailabilityVerified:false,startedAt:new Date().toISOString(),pages:pages.length,cases:[],errors:[],warnings:[],approved:false};
 let server,browser,currentPage='',runtimeErrors=[],requests=new Map();
 try{
  server=await serve(artifact);browser=await launcher();report.browser=browser.browser;
  browser.cdp.on('Runtime.exceptionThrown',(event,session)=>{if(session===browser.sessionId)runtimeErrors.push(event.exceptionDetails?.exception?.description||event.exceptionDetails?.text||'Runtime exception');});
  browser.cdp.on('Network.requestWillBeSent',(event,session)=>{if(session===browser.sessionId)requests.set(event.requestId,event.request.url);});
  browser.cdp.on('Network.responseReceived',(event,session)=>{if(session===browser.sessionId&&event.response.url.startsWith(server.origin)&&!event.response.url.includes('/favicon.ico')&&event.response.status>=400)runtimeErrors.push('HTTP '+event.response.status+' '+new URL(event.response.url).pathname);});
  for(const page of pages){
   currentPage=page;runtimeErrors=[];requests=new Map();
   try{
    const u=server.origin+'/'+page.replace(/index\.html$/,'')+'?lang=zh';
    await browser.cdp.send('Page.navigate',{url:u},browser.sessionId);
    await until(browser,'location.href==='+JSON.stringify(u)+" && document.readyState==='complete' && globalThis.SITE_I18N?.version==='platform-r45'");
    if(page.startsWith('notes/'))await until(browser,"!!globalThis.SITE_JOURNAL && !!document.querySelector('[data-journal-slot] .journal')");
    await evaluate(browser,"Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3000))]).then(()=>true)");await delay(150);
    for(const language of ['zh','en']){
     await evaluate(browser,'SITE_I18N.setLanguage('+JSON.stringify(language)+')');await delay(60);
     for(const width of widths){
      await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600},browser.sessionId);await delay(40);
      const state=await evaluate(browser,`(()=>{const app=document.querySelector('#app');const visible=e=>!!(e.getClientRects().length && getComputedStyle(e).visibility!=='hidden');return {lang:document.documentElement.lang,title:document.title,main:document.querySelectorAll('main').length,h1:document.querySelectorAll('h1').length,header:document.querySelectorAll('.site-header,.topbar').length,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)>innerWidth+2,localeButtons:document.querySelectorAll('[data-site-language]').length,resourceFailure:!!document.querySelector('.q-resource-error,.j-error,.q-search-error'),placeholders:[...document.querySelectorAll('input[placeholder]')].filter(e=>visible(e)&&!e.closest('[translate="no"],[data-i18n-skip],.guestbook-editor')).map(e=>e.placeholder),unknownChinese:[...(app||document.body).querySelectorAll('[data-original-language]')].filter(visible).map(e=>e.textContent.trim()).slice(0,8)};})()`);
      const problems=[];if(state.lang!==(language==='en'?'en':'zh-CN'))problems.push('wrong-language');if(!state.title.trim())problems.push('missing-title');if(state.main!==1||state.h1!==1)problems.push('invalid-landmarks');if(state.localeButtons!==2)problems.push('locale-controls');if(state.resourceFailure)problems.push('resource-failure');if(state.overflow)problems.push('horizontal-overflow');if(language==='en'&&state.placeholders.some(s=>/[\u3400-\u9fff]/.test(s)))problems.push('untranslated-placeholder');
      const result={page,language,width,problems};report.cases.push(result);for(const problem of problems)report.errors.push({page,language,width,problem,...(problem==='untranslated-placeholder'?{samples:state.placeholders.filter(s=>/[\u3400-\u9fff]/.test(s)).slice(0,5)}:{})});
      if(language==='en'&&width===1440&&state.unknownChinese.length)report.warnings.push({page,problem:'original-language-copy',samples:state.unknownChinese});
     }
    }
    for(const error of new Set(runtimeErrors))report.errors.push({page,problem:'browser-runtime-or-local-resource',detail:error});
   }catch(error){report.errors.push({page,problem:'browser-page-failed',detail:error.message});}
  }
  report.readmeEntries=await auditReadmeNavigation(browser,checkReadmeLinks(root),server.origin);
  for(const entry of report.readmeEntries)if(!entry.passed)report.errors.push({page:entry.pathname,problem:'readme-entry-language',readme:entry.file,language:entry.language,detail:entry.detail});
  // Check a real router transition and a query preserved by the language owner.
  const checkPath='/notes/?lang=en&q=site';await browser.cdp.send('Page.navigate',{url:server.origin+checkPath},browser.sessionId);await until(browser,"!!globalThis.SITE_ROUTER && !!globalThis.SITE_JOURNAL && globalThis.SITE_I18N?.language==='en'");
  await evaluate(browser,"SITE_ROUTER.navigate(new URL('/notes/pixel-workshop/docs/?lang=zh',location.href))");await until(browser,"location.pathname==='/notes/pixel-workshop/docs/' && SITE_I18N.language==='zh'");
  await evaluate(browser,"history.back();true");await until(browser,"location.pathname==='/notes/' && SITE_I18N.language==='en' && new URL(location.href).searchParams.get('q')==='site'");report.routerHistory='passed';
 }catch(error){report.errors.push({page:currentPage||null,problem:'browser-gate-failed',detail:error.message});}
 finally{try{await browser?.close();}finally{await server?.close();}}
 report.finishedAt=new Date().toISOString();report.ok=report.cases.length===pages.length*widths.length*2&&report.errors.length===0&&report.routerHistory==='passed'&&report.readmeEntries?.length===4&&report.readmeEntries.every(x=>x.passed);
 if(save)writeAtomic(root,'.local/platform/browser-report.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==2){console.error('Usage: npm run platform:browser');process.exitCode=2;}
 else auditBrowser().then(report=>{console.log(JSON.stringify({...report,cases:report.cases.length},null,2));if(!report.ok)process.exitCode=1;}).catch(error=>{console.error(error.message);process.exitCode=1;});
}
