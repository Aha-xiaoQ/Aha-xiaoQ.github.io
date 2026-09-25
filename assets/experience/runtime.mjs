/** Progressive site tools: search is loaded only on the search page. No analytics or persistent query history. */
import {mountNavigation,disposeNavigation,headerMutation} from '../ui/site-refinement.mjs?v=site-r23';
import {searchState,stateURL,validateIndex,search,searchMarkup,resultsMarkup} from './model.mjs?v=experience-r18';
const rootURL=new URL('../../',import.meta.url),indexURL=new URL('content/search-index.json?v=experience-r18',rootURL);
let indexPromise,current=null,queryTimer=0,generation=0;
const attached=new WeakMap();
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
 const focusOwner=document.activeElement;
 out.setAttribute('aria-busy','true');if(!out.querySelector('.q-search-results'))out.innerHTML='<p class="q-search-note" role="status">正在读取作品与资料…</p>';
 try{
  const data=await loadIndex();if(ticket!==generation||!host.isConnected||current!==host)return;
  const result=search(data,{...state,translate:value=>globalThis.SITE_I18N?.translate(value,'en')||value});
  state.page=result.page;updateURL(state);
  // Respect a visitor who moved focus elsewhere while the index was loading.
  const keepFocus=focus&&document.activeElement===focusOwner;
  out.innerHTML=resultsMarkup(result);globalThis.SITE_I18N?.apply(out);
  if(keepFocus){const n=out.querySelector('.q-search-count');n.tabIndex=-1;n.focus({preventScroll:true});n.scrollIntoView({block:'nearest',behavior:'auto'});}
 }
 catch{if(ticket!==generation||!host.isConnected||current!==host)return;out.innerHTML='<div class="q-search-error" role="alert"><h2>搜索暂时不可用</h2><p>请重试，或从下方栏目继续浏览。</p><button type="button" class="button button--quiet" data-search-retry>重试搜索</button></div>';globalThis.SITE_I18N?.apply(out);}
 finally{if(ticket===generation&&host.isConnected)out.setAttribute('aria-busy','false');}
}
export function mount(scope=document){
 refreshHeader(scope);const host=scope.querySelector('[data-site-search-root]');
 if(!host){generation++;current=null;clearTimeout(queryTimer);return;}
 const state=searchState(location.href);
 const previous=host._searchState,binding=attached.get(host);
 // Both the module entry and native router may hydrate the same search surface.
 // A second mount must not reset an in-progress input or cancel its debounce.
 if(current===host&&binding?.form===host.querySelector('[data-global-search]')&&previous&&
    state.q===previous.q.trim()&&state.type===previous.type&&state.page===previous.page)return;
 clearTimeout(queryTimer);current=host;
 if(!host.querySelector('[data-global-search]'))host.innerHTML=searchMarkup();
 const form=host.querySelector('[data-global-search]');
 // Preserve text entered into the static form before its module became ready.
 if(!binding&&form.elements.q.value!==form.elements.q.defaultValue){
  state.q=form.elements.q.value.slice(0,160);state.page=1;updateURL(state);
 }else form.elements.q.value=state.q;
 form.querySelectorAll('[name=type]').forEach(r=>{r.checked=r.value===state.type;});host._searchState=state;
 let owned=attached.get(host);
 if(!owned||owned.form!==form){
  owned?.controller.abort();
  owned={form,controller:new AbortController(),composing:false};attached.set(host,owned);
  const {signal}=owned.controller;
  const alive=()=>host.isConnected&&current===host&&host.querySelector('[data-global-search]')===form;
  const run=({reset=true,focus=false}={})=>{
   if(!alive()||owned.composing)return;
   clearTimeout(queryTimer);const s=host._searchState;s.q=form.elements.q.value.slice(0,160);
   s.type=form.querySelector('[name=type]:checked')?.value||'all';if(reset)s.page=1;
   updateURL(s);void showResults(host,s,{focus});
  };
  const schedule=()=>{if(!alive())return;clearTimeout(queryTimer);queryTimer=setTimeout(()=>run(),180);};
  form.addEventListener('submit',e=>{if(!alive())return;e.preventDefault();if(!owned.composing&&!e.isComposing)run({focus:true});},{signal});
  form.addEventListener('input',e=>{if(alive()&&e.target.name==='q'&&!e.isComposing&&!owned.composing)schedule();},{signal});
  form.addEventListener('compositionstart',()=>{if(!alive())return;owned.composing=true;clearTimeout(queryTimer);},{signal});
  form.addEventListener('compositionend',()=>{if(!alive())return;owned.composing=false;schedule();},{signal});
  form.addEventListener('change',e=>{if(alive()&&e.target.name==='type')run();},{signal});
  host.addEventListener('click',e=>{
   if(!alive())return;const b=e.target?.closest?.('button');if(!b)return;
   if(b.hasAttribute('data-search-retry'))run({reset:false});
   if(b.hasAttribute('data-search-reset')){form.elements.q.value='';form.querySelector('[value=all]').checked=true;run();form.elements.q.focus();}
   if(b.hasAttribute('data-search-page')){host._searchState.page=Number(b.dataset.searchPage);run({reset:false,focus:true});}
  },{signal});
 }
 owned.composing=false;
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
