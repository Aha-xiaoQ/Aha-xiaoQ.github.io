// Local artifact checks only: isolated temporary browser, no production requests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launch,evaluate,until} from '../platform/browser/cdp.mjs';
import {serve} from '../platform/browser/server.mjs';
import {safe,writeAtomic} from '../lib/safe-path.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serve(safe(root,'.local/publish'));
const browser=await launch();
const reports=[],writes=[];
const expression=`(() => {const p=document.querySelector('[data-stats-owner-controls]'),b=p?.querySelector('button'),r=b?.getBoundingClientRect();return {state:SITE_ANALYTICS.getState(),saved:localStorage.getItem('xiaoq-stats-owner-excluded'),count:document.querySelectorAll('[data-stats-owner-controls]').length,pressed:b?.getAttribute('aria-pressed'),text:p?.textContent,buttonFits:r?.width<=innerWidth&&r?.left>=0&&r?.right<=innerWidth};})()`;
const loaded=async()=>until(browser,`window.SITE_ANALYTICS && document.querySelector('[data-stats-owner-controls]') && document.readyState==='complete'`);
const navigate=async route=>{await browser.cdp.send('Page.navigate',{url:server.origin+route},browser.sessionId);await until(browser,`location.href===${JSON.stringify(server.origin+route)}`);await loaded();};
const click=async()=>{
 const previous=await evaluate(browser,'performance.timeOrigin');
 await evaluate(browser,`document.querySelector('[data-stats-owner-toggle]').click()`);
 await until(browser,`performance.timeOrigin!==${previous} && !!window.SITE_ANALYTICS && document.readyState==='complete' && !!document.querySelector('[data-stats-owner-controls]')`);
};
try{
 await browser.cdp.send('Network.setBlockedURLs',{urls:['https://*']},browser.sessionId);
 browser.cdp.on('Network.requestWillBeSent',event=>{if(!['GET','HEAD'].includes(event.request.method))writes.push({method:event.request.method,url:event.request.url});});
 for(const language of ['zh','en'])for(const width of [320,1440]){
  await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false},browser.sessionId);
  await navigate('/?stats=off&lang='+language);
  await until(browser,`window.SITE_I18N?.language==='${language}'`);
  let result=await evaluate(browser,expression);assert.equal(result.saved,null);assert.equal(result.count,1);assert.equal(result.pressed,'false');assert.equal(result.state.qaExcluded,true);assert.equal(result.buttonFits,true);
  if(language==='en')assert.doesNotMatch(result.text,/[\u3400-\u9fff]/u);
  await click();result=await evaluate(browser,expression);assert.equal(result.saved,'1');assert.equal(result.pressed,'true');assert.equal(result.state.qaExcluded,true);
  await evaluate(browser,`document.querySelector('[data-nav-key=about]').click()`);
  await until(browser,`location.pathname.startsWith('/about/') && document.querySelector('[data-stats-owner-controls]')`);
  result=await evaluate(browser,expression);assert.equal(result.count,1);assert.equal(result.saved,'1');assert.equal(result.state.ownerExcluded,true);assert.equal(result.state.qaExcluded,true);
  if(language==='en')assert.doesNotMatch(result.text,/[\u3400-\u9fff]/u);
  await click();result=await evaluate(browser,expression);assert.equal(result.saved,null);assert.equal(result.pressed,'false');assert.equal(result.state.qaExcluded,true);
  reports.push({language,width,persistence:true,undo:true,qaPreserved:true,routeRemount:true,buttonFits:true});
 }
 await browser.cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:`for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{get(){throw new DOMException('Blocked','SecurityError');}});`},browser.sessionId);
 await navigate('/?stats=off&lang=en');
 await evaluate(browser,`document.querySelector('[data-stats-owner-toggle]').click()`);
 const blocked=await evaluate(browser,`({state:SITE_ANALYTICS.getState(),text:document.querySelector('[data-stats-owner-controls]').textContent,link:document.querySelector('[data-stats-off-link]').href})`);
 assert.equal(blocked.state.ownerExcluded,true);assert.equal(blocked.state.persistent,false);assert.equal(blocked.state.qaExcluded,true);assert.match(blocked.text,/Storage unavailable/);assert.doesNotMatch(blocked.text,/[\u3400-\u9fff]/u);assert.equal(new URL(blocked.link).searchParams.get('stats'),'off');
 assert.deepEqual(writes,[]);
 const report={ok:true,browser:browser.browser,cases:reports,blockedStorage:true,networkWrites:writes,productionAccess:false,pushed:false,deployed:false};
 fs.mkdirSync(safe(root,'.local/analytics'),{recursive:true});writeAtomic(root,'.local/analytics/browser.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await server.close();}
