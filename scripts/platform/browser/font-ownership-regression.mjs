/** Real Chromium/CDP regression for the Windows report's DOM shapes.
 * Uses generated geometric test glyphs (not production WenKai font artwork),
 * the actual shipped organization/typography styles, and original Text nodes.
 */
import {readOptional} from '../../lib/safe-path.mjs';
import {stylesheet} from '../font-support.mjs';
import {geometricFont} from './font-fixture.mjs';
import {evaluate} from './cdp.mjs';
import {auditRenderedFonts} from './rendered-fonts.mjs';
import {auditFontFaces} from './font-faces.mjs';

export function ownershipDocuments(organization,typography){
 const body=`<main id="app"><section class="journal">
 <h1>字体检查 Font review</h1>
 <div class="q-lab-placeholder"><span class="q-lab-kicker">BILIBILI · VIDEO WORK</span><h2>琵琶鹈鹕中秋节目</h2></div>
 <div class="q-lab-placeholder"><span class="q-lab-kicker">ONE PROMPT · ONE RIDE</span></div>
 <p id="prose">当前状态：<code id="inline-code">packages/demo.js 中文</code>正文可读</p>
 <p id="mixed">说明 <strong id="child">嵌套标题 ABC</strong><code>NODE_CODE</code> 结束。</p>
 <span style="display:contents" id="contents">透明容器文字</span>
 <details id="closed"><summary>目录</summary><p id="closed-prose">折叠文字仍需检查<code>CODE</code>。</p>
 <details id="nested" open="open"><summary>嵌套目录</summary><a id="nested-link" href="#prose">打开阅读</a></details></details>
 <details id="was-open" open="open"><summary>已展开内容</summary><p>标题与正文</p></details>
 <div hidden><p style="font-family:serif">未显示状态</p></div>
 <div style="content-visibility:hidden"><p style="font-family:serif">未显示布局</p></div>
 <div aria-hidden="true" class="q-lab-visual"><strong>VIDEO</strong></div>
 </section><div id="main"><a class="pw-action" href="#prose"><span class="q-action-label">查看仓库</span><span class="q-action-meta">GitHub</span></a></div>
 <label for="editable">输入保留</label><input id="editable" value="user text"><textarea>code editor 用户输入</textarea></main>`;
 const extra=[...'琵琶鹈鹕'].map(c=>c.codePointAt(0));
 const chars=[...new Set([...body.replace(/<[^>]+>/g,''),...Array.from({length:95},(_,i)=>String.fromCharCode(i+32))].map(c=>c.codePointAt(0)))];
 const primaryPoints=chars.filter(n=>n>=32&&!extra.includes(n));
 const primary=geometricFont(primaryPoints,{family:'QOriginalTextFixture'}).toString('base64');
 const secondary=geometricFont(extra,{family:'QExtraTextFixture'}).toString('base64');
 const primaryCSS=[400,500,600,700].map(w=>`@font-face{font-family:"LXGW WenKai";font-style:normal;font-weight:${w};src:url(data:font/woff;base64,${primary}) format("woff")}`).join('\n');
 const records=[{variant:'regular',weight:'400',sha256:'a'.repeat(64),points:extra},{variant:'bold',weight:'500 700',sha256:'b'.repeat(64),points:extra}];
 const supplement=stylesheet(records).replace(/url\("[^"\n]+"\) format\("woff2"\)/g,`url("data:font/woff;base64,${secondary}") format("woff")`);
 // This is the existing icon selector identified in workshop-components.css.
 // The font layer must correct metadata without changing decorative art.
 const legacyAction='#main .pw-action span{font-family:Arial,sans-serif}#app .pw-action .q-action-label{font:inherit}';
 const priorOrganization=organization.replace('font-family:inherit;font-size:.7rem;font-weight:400;line-height:1.8;','font:.7rem/1.8 system-ui,sans-serif;');
 const priorTypography=typography.replace(/#app \.pw-action \.q-action-meta\s*\{\s*font-family:\s*inherit;\s*\}/,'');
 const namedBody=body.replace('id="was-open" open="open"','id="was-open" name="exclusive" open="open"').replace('id="closed"','id="closed" name="exclusive"');
 const wrap=(fonts,org,type,markup=body,override='')=>'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Font ownership regression</title><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; font-src data:"><style>'+fonts+'\n'+legacyAction+'\n'+org+'\n'+type+'\nbody{margin:12px}.q-lab-placeholder{min-height:0!important;padding:8px!important}h1,h2,p,a,summary,span{font-weight:400}input,textarea{max-width:90%}'+override+'</style></head><body>'+markup+'</body></html>';
 const documents={
  fixed:wrap(primaryCSS+supplement,organization,typography),
  previousLabelRules:wrap(primaryCSS+supplement,priorOrganization,priorTypography),
  wrongProseFont:wrap(primaryCSS+supplement,organization,typography,body,'#prose{font-family:serif}'),
  wrongNestedFont:wrap(primaryCSS+supplement,organization,typography,body,'#child{font-family:serif}'),
  wrongClosedFont:wrap(primaryCSS+supplement,organization,typography,body,'#closed-prose{font-family:serif}'),
  namedDisclosures:wrap(primaryCSS+supplement,organization,typography,namedBody),
  wrongNamedFont:wrap(primaryCSS+supplement,organization,typography,namedBody,'#closed-prose{font-family:serif}'),
  missingPrimary:wrap(supplement,organization,typography),
  missingSupplement:wrap(primaryCSS,organization,typography)
 };
 return {documents,record:{schemaVersion:1,family:'LXGW WenKai Local',faces:records},primaryPoints,extra};
}
const preserve=()=>{
 const nodes=[...document.querySelectorAll('#app *')],texts=[];
 const w=document.createTreeWalker(document.querySelector('#app'),NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())texts.push(n);
 const input=document.querySelector('#editable');input.focus();input.setSelectionRange(2,5);
 globalThis.__qOwnershipSaved={nodes,texts,textValues:texts.map(n=>n.textContent),open:[...document.querySelectorAll('details')].map(d=>d.getAttribute('open')),names:[...document.querySelectorAll('details')].map(d=>d.getAttribute('name')),input};
 return true;
};
const restored=()=>{
 const s=globalThis.__qOwnershipSaved,details=[...document.querySelectorAll('details')];
 const result=s.nodes.every(n=>n.isConnected)&&s.texts.every((n,i)=>n.isConnected&&n.textContent===s.textValues[i])&&
 details.every((d,i)=>d.getAttribute('open')===s.open[i]&&d.getAttribute('name')===s.names[i])&&
 s.input.value==='user text'&&s.input.selectionStart===2&&s.input.selectionEnd===5&&document.activeElement===s.input&&
 !Object.hasOwn(globalThis,'__xiaoqFontAuditNodesR50')&&!Object.hasOwn(globalThis,'__xiaoqFontAuditDisclosuresR50');
 delete globalThis.__qOwnershipSaved;return result;
};
export async function fontOwnershipRegression(root,{browser,widths=[1440,390,320]}={}){
 const data=ownershipDocuments(readOptional(root,'assets/journal/organization.css').toString(),readOptional(root,'assets/platform/typography.css').toString());
 const report={scope:'Real CDP Text-node ownership, disclosure states, live label CSS and mixed font stack; geometric test glyphs, not production WenKai visual acceptance',cases:[],errors:[]};
 const load=async(html,width=1440)=>{
  await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600},browser.sessionId);
  const {frameTree}=await browser.cdp.send('Page.getFrameTree',{},browser.sessionId);
  await browser.cdp.send('Page.setDocumentContent',{frameId:frameTree.frame.id,html},browser.sessionId);
 };
 const add=(name,result)=>{const row={name,...result};report.cases.push(row);if(!row.passed)report.errors.push(row);};
 for(const [name,html]of Object.entries(data.documents))for(const lang of ['zh-CN','en'])for(const width of widths){
  await load(html,width);await evaluate(browser,'document.documentElement.lang='+JSON.stringify(lang)+';true');
  await evaluate(browser,'('+preserve.toString()+')()');
  const r=await auditRenderedFonts(browser),stateRestored=await evaluate(browser,'('+restored.toString()+')()');
  const expected=['fixed','namedDisclosures'].includes(name);
  let matched=r.ok===expected&&stateRestored;
  if(expected)matched&&=r.states.length>=2&&r.textRuns>r.checked;
  if(name.includes('Closed')||name==='wrongNamedFont')matched&&=r.errors.some(e=>e.selector?.includes('p:')&&e.phase!=='initial');
  if(name==='wrongProseFont')matched&&=r.errors.some(e=>e.text.startsWith('当前状态：'));
  if(name==='wrongNestedFont')matched&&=r.errors.some(e=>e.tag==='strong');
  if(name==='previousLabelRules')matched&&=r.errors.some(e=>e.text==='BILIBILI · VIDEO WORK')&&r.errors.some(e=>e.text==='GitHub');
  add(name,{language:lang,width,expectedOK:expected,observedOK:r.ok,passed:!!matched,stateRestored,elements:r.elements,textRuns:r.textRuns,states:r.states,errors:r.errors});
 }
 for(const name of ['fixed','missingPrimary','missingSupplement']){
  await load(data.documents[name]);const results=await auditFontFaces(browser,data.record,{primaryPoints:data.primaryPoints});
  add('mixed-stack-'+name,{passed:results.length===4&&results.every(r=>r.passed===(name==='fixed')),weights:results});
 }
 // A protocol error must stay a blocker and still restore the disclosure state.
 await load(data.documents.fixed);await evaluate(browser,'('+preserve.toString()+')()');
 const broken={...browser,cdp:{send:(method,...args)=>method==='CSS.getPlatformFontsForNode'?Promise.reject(Error('Injected text inspection failure')):browser.cdp.send(method,...args)}};
 const failed=await auditRenderedFonts(broken),stateRestored=await evaluate(browser,'('+restored.toString()+')()');
 add('protocol-error-restores-state',{passed:!failed.ok&&stateRestored&&failed.errors.some(e=>e.problems.includes('font-node-inspection-failed')),stateRestored});
 report.ok=report.errors.length===0;return report;
}
