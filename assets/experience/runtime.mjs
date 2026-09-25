/** Progressive site tools: search is loaded only on the search page. No analytics or persistent query history. */
import {mountNavigation,disposeNavigation,headerMutation} from '../ui/site-refinement.mjs?v=site-r23';
import {searchState,stateURL,validateIndex,search,searchMarkup,resultsMarkup} from './model.mjs?v=experience-r18';
const rootURL=new URL('../../',import.meta.url),indexURL=new URL('content/search-index.json?v=experience-r18',rootURL);
let indexPromise,current=null,queryTimer=0,generation=0;
const attached=new WeakSet();
export async function loadIndex(){
 if(!indexPromise)indexPromise=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const res=await fetch(indexURL,{credentials:'omit',cache:'no-cache',signal:controller.signal});if(!res.ok)throw Error('Search index unavailable');if(Number(res.headers.get('content-length'))>1024*1024)throw Error('Search index too large');const s=await res.text();if(new TextEncoder().encode(s).length>1024*1024)throw Error('Search index too large');return validateIndex(JSON.parse(s));}finally{clearTimeout(timer);}})().catch(e=>{indexPromise=null;throw e;});return indexPromise;
}
function updateURL(state){history.replaceState(history.state,'',stateURL(location.href,state));}
export function refreshHeader(scope=document){
 const en=document.documentElement.lang.startsWith('en');
 scope.querySelectorAll('.site-header .bar,.topbar').forEach(header=>{
  let tools=header.querySelector('.q-header-tools');if(!tools){tools=document.createElement('div');tools.className='q-header-tools';header.append(tools);}
  let a=header.querySelector('[data-site-search]');if(!a){a=document.createElement('a');a.href=new URL('search/',rootURL).href;a.dataset.siteSearch='';a.className='q-search-launch';}
  a.dataset.i18nSkip='';if(a.textContent!==(en?'Search':'搜索'))a.textContent=en?'Search':'搜索';a.setAttribute('aria-label',en?'Search the site':'搜索全站');
  if(a.parentElement!==tools)tools.prepend(a);const language=header.querySelector('.site-language');if(language&&language.parentElement!==tools)tools.append(language);
 });
 mountNavigation(scope);
}
async function showResults(host,state,{focus=false}={}){
 const ticket=++generation,out=host.querySelector('[data-search-output]');if(!out)return;
 out.setAttribute('aria-busy','true');if(!out.querySelector('.q-search-results'))out.innerHTML='<p class="q-search-note" role="status">正在读取作品与资料…</p>';
 try{const data=await loadIndex();if(ticket!==generation||!host.isConnected||current!==host)return;const result=search(data,{...state,translate:value=>globalThis.SITE_I18N?.translate(value,'en')||value});state.page=result.page;updateURL(state);out.innerHTML=resultsMarkup(result);if(focus){const n=out.querySelector('.q-search-count');n.tabIndex=-1;n.focus({preventScroll:true});n.scrollIntoView({block:'nearest',behavior:'auto'});}}
 catch{if(ticket!==generation||!host.isConnected||current!==host)return;out.innerHTML='<div class="q-search-error" role="alert"><h2>搜索暂时不可用</h2><p>请重试，或从下方栏目继续浏览。</p><button type="button" class="button button--quiet" data-search-retry>重试搜索</button></div>';}
 finally{if(ticket===generation&&host.isConnected)out.setAttribute('aria-busy','false');}
}
export function mount(scope=document){
 clearTimeout(queryTimer);refreshHeader(scope);const host=scope.querySelector('[data-site-search-root]');current=host;
 if(!host){generation++;clearTimeout(queryTimer);return;}
 if(!host.querySelector('[data-global-search]'))host.innerHTML=searchMarkup();
 const state=searchState(location.href),form=host.querySelector('form');form.elements.q.value=state.q;form.querySelectorAll('[name=type]').forEach(r=>{r.checked=r.value===state.type;});
 host._searchState=state;
 if(!attached.has(host)){
  attached.add(host);
  const run=({reset=true,focus=false}={})=>{clearTimeout(queryTimer);const s=host._searchState;s.q=form.elements.q.value.slice(0,160);s.type=form.querySelector('[name=type]:checked')?.value||'all';if(reset)s.page=1;updateURL(s);void showResults(host,s,{focus});};
  form.addEventListener('submit',e=>{e.preventDefault();run({focus:true});});
  form.addEventListener('input',e=>{if(e.target.name==='q'&&!e.isComposing){clearTimeout(queryTimer);queryTimer=setTimeout(()=>run(),180);}});
  form.addEventListener('compositionstart',()=>clearTimeout(queryTimer));
  form.addEventListener('compositionend',()=>run());form.addEventListener('change',e=>{if(e.target.name==='type')run();});
  host.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-search-retry'))run({reset:false});if(b.hasAttribute('data-search-reset')){form.elements.q.value='';form.querySelector('[value=all]').checked=true;run();form.elements.q.focus();}if(b.hasAttribute('data-search-page')){host._searchState.page=Number(b.dataset.searchPage);run({reset:false,focus:true});}});
 }
 void showResults(host,state);
}
export function dispose(){generation++;current=null;clearTimeout(queryTimer);disposeNavigation();}
if(globalThis.document){
 globalThis.SITE_EXPERIENCE={mount,dispose,refreshHeader,searchMarkup};
 document.addEventListener('site-language-change',()=>refreshHeader());
 document.addEventListener('keydown',e=>{if(e.defaultPrevented||e.isComposing||e.key!=='/'||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||e.target.closest?.('input,textarea,select,[contenteditable],dialog[open]')||document.querySelector('dialog[open]'))return;const input=document.querySelector('[data-global-search] input');if(input){e.preventDefault();input.focus();return;}const a=document.querySelector('[data-site-search]');if(a){e.preventDefault();a.click();}});
 // The site's language controls can be appended just after a route render.
 let scheduled=false;const observer=new MutationObserver(records=>{if(scheduled||!headerMutation(records))return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refreshHeader();});});
 const start=()=>{observer.observe(document.querySelector('#app')||document.body,{childList:true,subtree:true});mount();};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.addEventListener('pageshow',e=>{if(e.persisted)mount();});
}
