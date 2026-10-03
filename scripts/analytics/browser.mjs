// Local artifact checks only: isolated temporary browser, no production requests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {launch,evaluate,until} from '../platform/browser/cdp.mjs';
import {serve} from '../platform/browser/server.mjs';
import {safe,writeAtomic} from '../lib/safe-path.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await serve(safe(root,'.local/publish'));
const browser=await launch();
const reports=[],writes=[];
const expression=`(() => {return {state:SITE_ANALYTICS.getState(),saved:localStorage.getItem('xiaoq-stats-owner-excluded'),controls:document.querySelectorAll('[data-stats-owner-controls],[data-stats-owner-toggle],[data-stats-off-link]').length,text:document.body.innerText};})()`;
const navigate=async route=>{
 await browser.cdp.send('Page.navigate',{url:server.origin+route},browser.sessionId);
 await until(browser,`location.href===${JSON.stringify(server.origin+route)} && !!window.SITE_ANALYTICS && document.readyState==='complete'`);
};
const absent=result=>{
 assert.equal(result.controls,0);
 assert.doesNotMatch(result.text,/本浏览器本人访问不计入|可主动排除本浏览器|访问统计与本人排除|Exclude my visits in this browser|Visit statistics and owner exclusion|The footer adds a reversible owner-exclusion/i);
 assert.equal(result.state.qaExcluded,true);
};
try{
 await browser.cdp.send('Network.setBlockedURLs',{urls:['https://*']},browser.sessionId);
 browser.cdp.on('Network.requestWillBeSent',event=>{if(!['GET','HEAD'].includes(event.request.method))writes.push({method:event.request.method,url:event.request.url});});
 for(const language of ['zh','en'])for(const width of [320,390,1440]){
  await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false},browser.sessionId);
  for(const route of ['/','/about/','/notes/updates/','/notes/pixel-workshop/updates/','/notes/pixel-workshop/docs/']){
   await navigate(route+'?stats=off&lang='+language);
   await until(browser,`window.SITE_I18N?.language==='${language}'`);
   const result=await evaluate(browser,expression);absent(result);assert.equal(result.saved,null);
   reports.push({language,width,route,publicControls:0,preferenceUnchanged:true,qaPreserved:true});
  }
 }
 await evaluate(browser,`localStorage.setItem('xiaoq-stats-owner-excluded','1')`);
 await navigate('/?stats=off&lang=en');let result=await evaluate(browser,expression);absent(result);assert.equal(result.saved,'1');assert.equal(result.state.ownerExcluded,true);
 await evaluate(browser,`document.querySelector('[data-nav-key=about]').click()`);
 await until(browser,`location.pathname.startsWith('/about/') && document.readyState==='complete'`);
 result=await evaluate(browser,expression);absent(result);assert.equal(result.saved,'1');assert.equal(result.state.ownerExcluded,true);
 await browser.cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:`for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{get(){throw new DOMException('Blocked','SecurityError');}});`},browser.sessionId);
 await navigate('/?stats=off&lang=en');
 const blocked=await evaluate(browser,`({state:SITE_ANALYTICS.getState(),controls:document.querySelectorAll('[data-stats-owner-controls],[data-stats-owner-toggle]').length})`);
 assert.equal(blocked.controls,0);assert.equal(blocked.state.persistent,false);assert.equal(blocked.state.qaExcluded,true);
 assert.deepEqual(writes,[]);
 const report={ok:true,browser:browser.browser,cases:reports,preservedExistingPreference:true,routeNavigation:true,blockedStorage:true,networkWrites:writes,productionAccess:false};
 fs.mkdirSync(safe(root,'.local/analytics'),{recursive:true});writeAtomic(root,'.local/analytics/browser.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await server.close();}
