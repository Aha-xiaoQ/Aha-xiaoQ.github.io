/** Inspect the original Text nodes, not their parent's combined descendant fonts.
 * CSS.getPlatformFontsForNode accepts Text nodes. No text, font style, or font
 * resource is injected. Native disclosures are tested closed AND open, then
 * restored; not-yet-rendered disclosure content is not a missing-font result.
 */
import {evaluate} from './cdp.mjs';

export function renderedFontNodes({phase='initial',disclosureIndex=null}={}){
 const key='__xiaoqFontAuditNodesR50';
 if(Object.hasOwn(globalThis,key))throw Error('Font audit was not cleaned up');
 const state=globalThis.__xiaoqFontAuditDisclosuresR50;
 const root=disclosureIndex===null?(document.querySelector('#app')||document.body):state?.nodes[disclosureIndex];
 if(!root?.isConnected)throw Error('Page has no connected font-audit content root');
 const selector=e=>{const parts=[];while(e&&e!==document.documentElement){let n=1;for(let p=e.previousElementSibling;p;p=p.previousElementSibling)if(p.localName===e.localName)n++;parts.unshift(e.localName+':nth-of-type('+n+')');e=e.parentElement;}return 'html>'+parts.join('>');};
 const meaningful=s=>/[\p{L}\p{M}\p{N}\p{P}\p{S}]/u.test(s);
 const visible=e=>{
  const s=getComputedStyle(e);
  if(s.display==='none'||s.visibility==='hidden'||s.visibility==='collapse')return false;
  // In Chromium closed details may have nonempty layout rects. The content
  // slot is still not painted. Only the first direct summary remains visible.
  for(let p=e;p;p=p.parentElement){
   if(p.localName==='details'&&!p.open){
    const summary=[...p.children].find(n=>n.localName==='summary');
    if(!summary||!(summary===e||summary.contains(e)))return false;
   }
   const a=getComputedStyle(p);
   if(a.display==='none'||a.contentVisibility==='hidden')return false;
  }
  if(s.display!=='contents'&&typeof e.checkVisibility==='function'&&
     !e.checkVisibility({visibilityProperty:true,contentVisibilityAuto:true}))return false;
  return true;
 };
 const rows=[],nodes=[];
 const candidates='h1,h2,h3,h4,h5,h6,p,a,button,label,li,dt,dd,th,td,summary,figcaption,span,strong,em,time';
 for(const e of [...(root.matches(candidates)?[root]:[]),...root.querySelectorAll(candidates)]){
  if(e.closest('pre,code,kbd,samp,textarea,script,style,svg,[contenteditable],[aria-hidden="true"]')||!visible(e))continue;
  const runs=[...e.childNodes].filter(n=>{
   if(n.nodeType!==Node.TEXT_NODE||!meaningful(n.textContent))return false;
   const range=document.createRange();range.selectNodeContents(n);
   return [...range.getClientRects()].some(r=>r.width>0&&r.height>0);
  });
  if(!runs.length||!/[\p{L}\p{N}]/u.test(runs.map(n=>n.textContent).join('')))continue;
  const style=getComputedStyle(e),text=runs.map(n=>n.textContent).join('').replace(/\s+/g,' ').trim();
  nodes.push({element:e,runs});
  rows.push({index:nodes.length-1,phase,selector:selector(e),tag:e.localName,text:text.slice(0,160),
   fontFamily:style.fontFamily,weight:style.fontWeight,style:style.fontStyle,size:style.fontSize,
   symbols:[...text].filter(c=>/\p{S}/u.test(c)).length,
   runs:runs.map(n=>({text:n.textContent.slice(0,160),symbols:[...n.textContent].filter(c=>/\p{S}/u.test(c)).length}))});
  if(rows.length>10000)throw Error('Too many UI font elements; audit refused to truncate');
 }
 globalThis[key]=nodes;
 return rows;
}

export function fontSelectionProblems(row,fonts){
 const issues=[];
 const families=String(row.fontFamily||'').split(',').map(s=>s.trim().replace(/^["']|["']$/g,''));
 if(!families.some(f=>f==='LXGW WenKai'||f==='LXGW WenKai Local'))issues.push('unexpected-ui-font-family');
 if(!Array.isArray(fonts)||!fonts.length||fonts.reduce((n,f)=>n+(f.glyphCount||0),0)===0)issues.push('no-rendered-font-evidence');
 let symbolGlyphs=0;
 for(const f of fonts||[])if(f.glyphCount>0&&!f.isCustomFont){
  if(/Emoji|Symbol/i.test(f.familyName||''))symbolGlyphs+=f.glyphCount;
  else issues.push('primary-or-supplement-fell-back');
 }
 if(symbolGlyphs>(row.symbols||0))issues.push('primary-or-supplement-fell-back');
 return [...new Set(issues)];
}

export function disclosureState(action,index=null){
 const key='__xiaoqFontAuditDisclosuresR50';
 if(action==='capture'){
  if(Object.hasOwn(globalThis,key))throw Error('Disclosure font audit was not cleaned up');
  const nodes=[...(document.querySelector('#app')||document.body).querySelectorAll('details')];
  globalThis[key]={nodes,open:nodes.map(d=>d.getAttribute('open')),x:scrollX,y:scrollY};
  return {count:nodes.length,named:nodes.some(d=>!!d.getAttribute('name'))};
 }
 const s=globalThis[key];if(!s)throw Error('Missing disclosure font snapshot');
 if(action==='open-all'){
  if(s.nodes.some(d=>!!d.getAttribute('name')))throw Error('Named disclosure groups must be checked individually');
  for(const d of s.nodes){if(!d.isConnected)throw Error('Disclosure changed during font audit');d.open=true;}
  return true;
 }
 if(action==='open-one'){
  const d=s.nodes[index];if(!d?.isConnected)throw Error('Disclosure changed during font audit');
  const ancestors=[];for(let p=d;p;p=p.parentElement)if(p.localName==='details')ancestors.unshift(p);
  for(const p of ancestors)p.open=true;
  return true;
 }
 if(action==='restore'){
  try{
   for(const d of s.nodes)d.removeAttribute('open');
   s.nodes.forEach((d,i)=>{if(s.open[i]!==null)d.setAttribute('open',s.open[i]);});
   scrollTo({left:s.x,top:s.y,behavior:'instant'});
   if(s.nodes.some((d,i)=>!d.isConnected||d.getAttribute('open')!==s.open[i]))throw Error('Disclosure state could not be restored');
   return true;
  }finally{delete globalThis[key];}
 }
 throw Error('Unknown disclosure font action');
}

async function settle(browser,timeout){
 const ready=await evaluate(browser,`(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return Promise.race([document.fonts.ready.then(()=>true),new Promise(r=>setTimeout(()=>r(false),${timeout}))]);})()`);
 if(!ready)throw Error('Visible page fonts did not settle before the audit timeout');
}

export async function auditRenderedFonts(browser,{timeout=8000,concurrency=8,disclosures=true}={}){
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>32||!Number.isFinite(timeout)||timeout<1||timeout>30000)throw Error('Invalid font audit limits');
 const key='__xiaoqFontAuditNodesR50',results=[],errors=[],states=[];
 let snapshot=false,elements=0,textRuns=0;
 async function inspect(phase,disclosureIndex=null){
  await settle(browser,timeout);
  await browser.cdp.send('DOM.getDocument',{depth:0},browser.sessionId);
  const rows=await evaluate(browser,'('+renderedFontNodes.toString()+')('+JSON.stringify({phase,disclosureIndex})+')');
  const startCount=results.length;elements+=rows.length;
  try{
   for(let start=0;start<rows.length;start+=concurrency)await Promise.all(rows.slice(start,start+concurrency).map(async row=>{
    const allFonts=new Map(),problems=new Set(),runs=[];
    for(let ri=0;ri<row.runs.length;ri++){
     let objectId;
     try{
      const value=await browser.cdp.send('Runtime.evaluate',{expression:`(()=>{const n=globalThis.${key}[${row.index}].runs[${ri}];if(!n.isConnected)throw Error('Original text node was detached');return n;})()`,returnByValue:false},browser.sessionId);
      objectId=value.result?.objectId;if(value.exceptionDetails||!objectId)throw Error('Original text node was detached');
      const {nodeId}=await browser.cdp.send('DOM.requestNode',{objectId},browser.sessionId);
      // Query the Text node itself: querying its element would include code,
      // nested buttons, emphasis, and other descendants with separate fonts.
      const {fonts}=await browser.cdp.send('CSS.getPlatformFontsForNode',{nodeId},browser.sessionId);
      const found=fontSelectionProblems({...row,symbols:row.runs[ri].symbols},fonts);
      for(const p of found)problems.add(p);
      for(const f of fonts||[]){const id=JSON.stringify([f.familyName,f.postScriptName,f.isCustomFont]);const previous=allFonts.get(id);if(previous)previous.glyphCount+=f.glyphCount;else allFonts.set(id,{...f});}
      runs.push({...row.runs[ri],fonts,problems:found});textRuns++;
     }catch(e){problems.add('font-node-inspection-failed');runs.push({...row.runs[ri],problems:['font-node-inspection-failed'],detail:e.message});}
     finally{if(objectId)try{await browser.cdp.send('Runtime.releaseObject',{objectId},browser.sessionId);}catch{}}
    }
    const result={...row,runs,fonts:[...allFonts.values()].map(f=>({family:f.familyName,custom:f.isCustomFont,glyphs:f.glyphCount})),problems:[...problems]};
    results.push(result);if(problems.size)errors.push(result);
   }));
  }finally{await evaluate(browser,`delete globalThis.${key};true`);}
  states.push({phase,disclosureIndex,elements:rows.length,checked:results.length-startCount});
 }
 try{
  await browser.cdp.send('DOM.enable',{},browser.sessionId);await browser.cdp.send('CSS.enable',{},browser.sessionId);
  const info=disclosures?await evaluate(browser,'('+disclosureState.toString()+')("capture")'):{count:0};snapshot=disclosures;
  await inspect('initial');
  if(!elements)throw Error('No existing visible UI text was audited');
  if(info.count){
   if(!info.named){await evaluate(browser,'('+disclosureState.toString()+')("open-all")');await inspect('disclosures-open');}
   else for(let i=0;i<info.count;i++){
    await evaluate(browser,'('+disclosureState.toString()+')("open-one",'+i+')');
    await inspect('disclosure-open-'+i,i);
   }
  }
 }catch(e){errors.push({problems:['font-audit-failed'],detail:e.message});}
 finally{
  try{await evaluate(browser,`delete globalThis.${key};true`);}catch{}
  if(snapshot)try{await evaluate(browser,'('+disclosureState.toString()+')("restore")');await settle(browser,timeout);}
   catch(e){errors.push({problems:['font-state-restore-failed'],detail:e.message});}
 }
 results.sort((a,b)=>a.phase.localeCompare(b.phase)||a.index-b.index);
 errors.sort((a,b)=>String(a.phase).localeCompare(String(b.phase))||(a.index||0)-(b.index||0));
 return {ok:elements>0&&results.length===elements&&errors.length===0,elements,checked:results.length,textRuns,
  states,weights:[...new Set(results.map(x=>x.weight))].sort(),samples:results.filter(x=>/^h[1-3]$/.test(x.tag)).slice(0,12),errors};
}
