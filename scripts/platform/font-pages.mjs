#!/usr/bin/env node
/** Font acceptance on source-branch HTML (what branch-based Pages deploys).
 * Separately checked from the publication projection. Original works and code
 * editors are outside this site-UI font check and are not executed. */
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {readOptional,writeAtomic} from '../lib/safe-path.mjs';
import {collectCorpus,PRIMARY} from './font-support.mjs';
import {fontCodepoints} from './font-cmap.mjs';
import {fontEntryState} from './font-finalize.mjs';
import {launch,evaluate} from './browser/cdp.mjs';
import {serve} from './browser/server.mjs';
import {auditRenderedFonts} from './browser/rendered-fonts.mjs';
import {waitForFontPage} from './browser/font-page-ready.mjs';
import {auditFontFaces} from './browser/font-faces.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function sourceFontPages(root=ROOT){
 return collectCorpus(root).files.filter(p=>p.endsWith('.html')&&readOptional(root,p)?.includes(Buffer.from('data-platform-typography')));
}
export async function auditSourceFontPages(root=ROOT,{launcher=launch,serverFactory=serve,widths=[1440,390,320],pages:given=null,save=true}={}){
 const pages=given||sourceFontPages(root);if(!pages.length)throw Error('No source-branch font pages selected');
 const state=fontEntryState(root,{pages});if(state.stale.length)throw Error('Source page font URL is stale: '+state.stale.join(', '));
 const report={schemaVersion:1,scope:'Original UI Text nodes in source-branch HTML, closed/open disclosure states, and mixed primary/supplement character runs; no forced element font styles',pages:pages.length,cases:[],errors:[],approved:false};
 let browser,server;
 try{
  server=await serverFactory(root);browser=await launcher();report.browser=browser.browser;
  for(const page of pages){
   try{
    const url=server.origin+'/'+page+'?lang=zh';const navigation=await browser.cdp.send('Page.navigate',{url},browser.sessionId);
    if(navigation.errorText||navigation.isDownload)throw Error('Font page navigation failed: '+(navigation.errorText||'Unexpected download'));
    await waitForFontPage(browser,url);
    for(const language of ['zh','en']){
     await evaluate(browser,'SITE_I18N.setLanguage('+JSON.stringify(language)+');true');
     for(const width of widths){
      await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600},browser.sessionId);
      await evaluate(browser,'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))).then(()=>true)');
      const result=await auditRenderedFonts(browser);report.cases.push({page,language,width,...result});
      if(!result.ok)report.errors.push({page,language,width,problem:'source-page-font-rendering',details:result.errors});
     }
    }
   }catch(e){report.errors.push({page,problem:'source-font-page-failed',detail:e.message});}
  }
  // Bind the separate character probe to a known, verified site document, not
  // whichever page happened to be visited last (or a navigation error page).
  const probePage=pages.find(p=>p==='index.html')||pages[0],probeURL=server.origin+'/'+probePage+'?lang=zh';
  const probeNavigation=await browser.cdp.send('Page.navigate',{url:probeURL},browser.sessionId);
  if(probeNavigation.errorText||probeNavigation.isDownload)throw Error('Mixed font probe navigation failed: '+(probeNavigation.errorText||'Unexpected download'));
  await waitForFontPage(browser,probeURL);
  const primaryCoverage=PRIMARY.map(p=>fontCodepoints(readOptional(root,p.file)));
  const primaryPoints=collectCorpus(root).points.filter(n=>primaryCoverage.every(set=>set.has(n)));
  if(!primaryPoints.length)throw Error('No authored primary glyphs were included in the mixed-run audit');
  report.mixedFaces=await auditFontFaces(browser,JSON.parse(readOptional(root,'docs/platform/generated-fonts.json')),{primaryPoints});
  for(const face of report.mixedFaces)if(!face.passed)report.errors.push({page:'mixed-font-runs',problem:'primary-or-supplement-font-rendering',weight:face.weight,detail:face.error});
 }catch(e){report.errors.push({problem:'source-font-audit-failed',detail:e.message});}
 finally{try{await browser?.close();}finally{await server?.close();}}
 report.ok=report.cases.length===pages.length*widths.length*2&&report.cases.every(c=>c.ok)&&report.mixedFaces?.length===4&&report.mixedFaces.every(f=>f.passed)&&report.errors.length===0;
 report.finishedAt=new Date().toISOString();if(save)writeAtomic(root,'.local/platform/font-pages.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==2){console.error('Usage: node scripts/platform/font-pages.mjs');process.exitCode=2;}
 else auditSourceFontPages().then(r=>{console.log(JSON.stringify({...r,cases:r.cases.length,checkedElements:r.cases.reduce((n,c)=>n+c.checked,0)},null,2));if(!r.ok)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});
}
