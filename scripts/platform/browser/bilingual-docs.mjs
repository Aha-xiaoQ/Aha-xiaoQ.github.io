// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Aha_xiaoQ and the respective contributors
/** Real public-artifact navigation; no third-party requests or persistent browser profile. */
import {evaluate,until} from './cdp.mjs';
export async function auditBilingualNavigation(browser,origin){
 const report=[];
 const paths=['/notes/contribute/','/notes/lab/contribute/','/notes/mario-mix/contribute/','/notes/pixel-workshop/contribute/','/notes/mario-mix/','/notes/pixel-workshop/tasks/',...['start','content','architecture','add-project','publishing','writing','contributing'].map(id=>'/notes/pixel-workshop/docs/'+id+'/'),...['episode-one-contributing','terra-contributing'].map(id=>'/notes/mario-mix/docs/'+id+'/')];
 for(const path of paths){
  const row={path,passed:false};report.push(row);
  try{
   await browser.cdp.send('Page.navigate',{url:origin+path+'?lang=en&stats=off&review=bilingual'},browser.sessionId);
   await until(browser,"location.pathname==="+JSON.stringify(path)+" && SITE_I18N?.language==='en' && !!document.querySelector('[data-journal-slot] .journal')");
   const english=await evaluate(browser,`(()=>{const root=document.querySelector('[data-journal-slot]');return {untranslated:[...root.querySelectorAll('[data-original-language]')].filter(e=>e.getClientRects().length).map(e=>e.textContent),links:[...root.querySelectorAll('[data-locale-href-en]')].map(a=>a.getAttribute('href')),code:[...root.querySelectorAll('pre,code')].map(e=>e.textContent)};})()`);
   if(english.untranslated.length)throw Error('Untranslated contribution/website guide copy: '+english.untranslated.slice(0,3).join(' | '));
   if(path.endsWith('/contribute/')&&(!english.links.some(h=>h.endsWith('/CONTRIBUTING.en.md'))||!english.links.some(h=>h.endsWith('/GETTING_STARTED.en.md'))))throw Error('English contribution/setup link does not select its English source');
   await evaluate(browser,"document.querySelector('[data-site-language=zh]').click();true");
   await until(browser,"SITE_I18N.language==='zh' && document.documentElement.lang==='zh-CN'");
   const chinese=await evaluate(browser,`(()=>{const root=document.querySelector('[data-journal-slot]');return {text:root.textContent,links:[...root.querySelectorAll('[data-locale-href-zh]')].map(a=>a.getAttribute('href')),code:[...root.querySelectorAll('pre,code')].map(e=>e.textContent),query:location.search};})()`);
   if(!/[\u3400-\u9fff]/u.test(chinese.text))throw Error('Chinese source was not restored');
   if(JSON.stringify(chinese.code)!==JSON.stringify(english.code))throw Error('Language switch changed original commands/code');
   if(path.endsWith('/contribute/')&&(!chinese.links.some(h=>h.endsWith('/CONTRIBUTING.md'))||!chinese.links.some(h=>h.endsWith('/GETTING_STARTED.md'))))throw Error('Chinese contribution/setup link was not restored');
   if(!new URLSearchParams(chinese.query).has('stats')||!chinese.query.includes('review=bilingual'))throw Error('Language switch lost unrelated query parameters');
   await evaluate(browser,"document.querySelector('[data-site-language=en]').click();true");
   await until(browser,"SITE_I18N.language==='en'");
   const again=await evaluate(browser,"[...document.querySelectorAll('[data-locale-href-en]')].map(a=>a.getAttribute('href'))");
   if(JSON.stringify(again)!==JSON.stringify(english.links))throw Error('English source links were not restored');
   row.passed=true;row.englishGuideLinks=english.links.length;row.originalCodePreserved=true;
  }catch(error){row.detail=error.message;}
 }
 // Follow actual links through the native router and restore language with browser history.
 const row={path:'/notes/contribute/ → /notes/ → /notes/pixel-workshop/',passed:false};report.push(row);
 try{
  await browser.cdp.send('Page.navigate',{url:origin+'/notes/contribute/?lang=en&stats=off'},browser.sessionId);
  await until(browser,"location.pathname==='/notes/contribute/' && !!document.querySelector('[data-journal-slot] .journal') && SITE_I18N.language==='en'");
  await evaluate(browser,"document.querySelector('[data-journal-slot] a[href=\"/notes/\"]').click();true");
  await until(browser,"location.pathname==='/notes/' && SITE_I18N.language==='en'");
  await evaluate(browser,"document.querySelector('[data-journal-slot] a[href=\"/notes/pixel-workshop/\"]').click();true");
  await until(browser,"location.pathname==='/notes/pixel-workshop/' && SITE_I18N.language==='en'");
  await evaluate(browser,"history.back();true");await until(browser,"location.pathname==='/notes/' && SITE_I18N.language==='en'");
  row.passed=true;
 }catch(error){row.detail=error.message;}
 return report;
}
