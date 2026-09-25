/** Real runtime code in a small DOM harness. History, CSS delivery, network and
 * unrelated page renderers are controlled test doubles; this is NOT a site audit. */
import {readOptional} from '../../lib/safe-path.mjs';
import {createHash} from 'node:crypto';
import {fixtureIcon} from './fixture-icon.mjs';
export const INTERACTION_CASE_COUNT=20;
export const INTERACTION_SOURCES=Object.freeze(['assets/site-router.js','assets/experience/runtime.mjs','assets/experience/model.mjs']);
export function interactionFixture(root){
 const sources=Object.fromEntries(INTERACTION_SOURCES.map(p=>{const bytes=readOptional(root,p);if(!bytes)throw Error('Missing interaction source: '+p);return [p,bytes.toString('utf8')];}));
 const hashes=Object.fromEntries(Object.entries(sources).map(([p,s])=>[p,createHash('sha256').update(s).digest('hex')]));
 const runtime=sources['assets/experience/runtime.mjs'];
 if((runtime.match(/^import .+ from .+;$/gm)||[]).length!==2||(runtime.match(/import\.meta\.url/g)||[]).length!==1)throw Error('Review interaction fixture module wiring after import changes');
 const data=JSON.stringify({sources,hashes,icon:'data:image/vnd.microsoft.icon;base64,'+fixtureIcon().toString('base64')}).replace(/</g,'\\u003c');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Website interaction regression</title><link rel="icon" href="data:image/vnd.microsoft.icon;base64,'+fixtureIcon().toString('base64')+'"></head><body><main id="fixture"></main><script>globalThis.INTERACTION_INPUT='+data+';('+browserHarness.toString()+')();</script></body></html>';
}
function browserHarness(){
 const {sources,hashes,icon}=globalThis.INTERACTION_INPUT;
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const assert=(value,message)=>{if(!value)throw Error(message);};
 const equal=(actual,expected,message)=>assert(JSON.stringify(actual)===JSON.stringify(expected),(message||'Mismatch')+'; actual='+JSON.stringify(actual)+' expected='+JSON.stringify(expected));
 async function until(test){const start=Date.now();while(Date.now()-start<2500){if(test())return;await wait(10);}throw Error('Fixture condition timed out');}
 let frame;
 function page(at='/projects/'){
  frame?.remove();frame=document.createElement('iframe');frame.title='Isolated runtime test';frame.style.width='100%';frame.style.height='700px';document.querySelector('#fixture').replaceChildren(frame);
  const w=frame.contentWindow,d=w.document;
  d.open();d.write('<!doctype html><html lang="zh-CN"><head><base href="https://fixture.invalid/"><title>Fixture</title><link rel="icon" href="'+icon+'"></head><body data-page="projects"><div id="app"><main id="main" tabindex="-1"><input id="kept" value="unchanged"><h2 id="heading">Heading</h2></main></div></body></html>');d.close();
  // Each case has a fresh DOM realm, including its event listeners and timers.
  const f={w,d,location:new URL('https://fixture.invalid'+at),renders:0,mounts:0,unmounts:0,requests:[],localizations:0};
  let entries=[{href:f.location.href,state:{fixture:'preserved'}}],index=0;
  const set=(url,mode,state)=>{const next=new URL(url,f.location);if(next.origin!==f.location.origin)throw new w.DOMException('Cross-origin history','SecurityError');f.location.href=next.href;const entry={href:next.href,state:structuredClone(state)};if(mode==='push'){entries=entries.slice(0,index+1);entries.push(entry);index++;}else entries[index]=entry;};
  f.history={get state(){return structuredClone(entries[index].state);},scrollRestoration:'auto',replaceState(state,unused,url){set(url,'replace',state);},pushState(state,unused,url){set(url,'push',state);},back(){if(!index)return;index--;f.location.href=entries[index].href;w.dispatchEvent(new w.PopStateEvent('popstate',{state:entries[index].state}));}};
  const linkProto=w.HTMLLinkElement.prototype,href=Object.getOwnPropertyDescriptor(linkProto,'href'),sheet=Object.getOwnPropertyDescriptor(linkProto,'sheet');
  Object.defineProperty(linkProto,'href',{configurable:true,get(){return this.dataset.fixtureHref||href.get.call(this);},set(value){this.dataset.fixtureHref=new URL(value,f.location).href;/* Delivery is controlled below; no fixture network request. */}});
  Object.defineProperty(linkProto,'sheet',{configurable:true,get(){return this.dataset.fixtureReady==='yes'?sheet.get.call(this)||{}:null;}});
  // The actual browser stylesheet mechanics are tested by the artifact gate.
  // Here delivery events are deterministic, so races and recovery can be isolated.
  d.addEventListener('load',event=>{if(event.target instanceof w.HTMLLinkElement&&event.target.dataset.fixtureReady!=='yes')event.stopImmediatePropagation();},true);
  Object.defineProperty(d,'currentScript',{configurable:true,get:()=>({src:'https://fixture.invalid/assets/site-router.js?v=fixture'})});
  Object.defineProperty(d,'startViewTransition',{configurable:true,value:undefined});
  f.style=(pathname,ready=true)=>{const link=d.createElement('link');link.rel='stylesheet';link.href=pathname;link.dataset.fixtureReady=ready?'yes':'no';d.head.append(link);return link;};
  f.content=f.style('/assets/site-shell.css');f.home=f.style('/assets/promo.css');
  f.ready=link=>{link.dataset.fixtureReady='yes';link.dispatchEvent(new w.Event('load'));};
  f.fail=link=>link.dispatchEvent(new w.Event('error'));
  w.SITE_DATA={items:[{primaryType:'game',slug:'sample',title:'Sample'}]};
  w.SITE_I18N={route(){},apply(){f.localizations++;},translate:s=>s};
  w.SITE_EXPERIENCE={mount(){f.mounts++;},dispose(){f.unmounts++;}};
  f.render=page=>{f.renders++;d.body.dataset.page=page;d.querySelector('#app').innerHTML='<main id="main" tabindex="-1"><h2 id="heading">'+page+'</h2><input id="kept" value="fresh"></main>';};
  w.SITE_PROMO_RENDER=()=>f.render('home');w.SITE_SHELL_RENDER=({nextPage})=>f.render(nextPage);
  f.install=()=>w.Function('location','history','navigator',sources['assets/site-router.js'])(f.location,f.history,{connection:{saveData:true}});
  return f;
 }
 const indexData={schemaVersion:1,entries:[{id:'a',type:'guide',href:'/notes/lab/',title:'Pelican guide',summary:'Animation notes',tags:[]},{id:'b',type:'game',href:'/games/sample/',title:'Sample game',summary:'Browser game',tags:[]}]};
 async function searchPage(typedBeforeMount){
  const f=page('/search/?lang=en');const {w,d}=f;
  d.querySelector('#app').innerHTML='<header><a id="other" href="#other">Other control</a></header><main id="main"><div data-site-search-root></div></main>';
  const modelSource=sources['assets/experience/model.mjs'].replace(/^export /gm,'');
  f.model=w.Function(modelSource+'\nreturn {searchState,stateURL,validateIndex,search,searchMarkup,resultsMarkup};')();
  if(typedBeforeMount!==undefined){const host=d.querySelector('[data-site-search-root]');host.innerHTML=f.model.searchMarkup();host.querySelector('input[name=q]').value=typedBeforeMount;host.querySelector('input[name=q]').focus();}
  const source=sources['assets/experience/runtime.mjs'].replace(/^import .+ from .+;\n/gm,'').replace(/import\.meta\.url/g,JSON.stringify('https://fixture.invalid/assets/experience/runtime.mjs')).replace(/^export /gm,'');
  const fetch=(url,options)=>new Promise((resolve,reject)=>f.requests.push({url:String(url),options,resolve,reject}));
  // Only import plumbing is adapted; all runtime logic is the source under review.
  const names=['location','history','mountNavigation','disposeNavigation','headerMutation','fetch',...Object.keys(f.model)];
  f.api=w.Function(...names,source+'\nreturn {mount,dispose,loadIndex};')(f.location,f.history,()=>{},()=>{},()=>false,fetch,...Object.values(f.model));
  f.api.mount(d);f.host=d.querySelector('[data-site-search-root]');f.form=f.host.querySelector('form');f.input=f.form.elements.q;
  f.respond=(at=0,ok=true,data=indexData)=>{f.requests[at].resolve({ok,headers:{get:()=>null},text:async()=>JSON.stringify(data)});};
  f.inputEvent=(value,{composing=false}={})=>{f.input.value=value;f.input.dispatchEvent(new w.InputEvent('input',{bubbles:true,isComposing:composing}));};
  f.submit=()=>f.form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await wait(5);return f;
 }
 async function run(){
  const report={scope:'Production router and search code in isolated Chromium DOM; controlled history, renderers, CSS events and fetch',sourceHashes:hashes,cases:[],errors:[],approved:false};
  async function check(name,fn){try{await fn();report.cases.push({name,passed:true});}catch(e){report.cases.push({name,passed:false});report.errors.push({name,error:e.message});}finally{frame?.remove();frame=null;}}
  await check('nested paths cannot impersonate top-level collections or game details',async()=>{const f=page();f.install();await wait(20);for(const p of ['/unrelated/games/','/projects/tools/','/unrelated/games/sample/'])equal(await f.w.SITE_ROUTER.navigate(p),false,p);equal(f.renders,0);equal(f.location.pathname,'/projects/');});
  await check('foreign origins and invalid history modes cannot change page or history',async()=>{const f=page();f.install();await wait(20);equal(await f.w.SITE_ROUTER.navigate('https://foreign.invalid/games/'),false);equal(await f.w.SITE_ROUTER.navigate('/games/',{historyMode:'invalid'}),false);equal(f.renders,0);equal(f.location.pathname,'/projects/');});
  await check('missing renderer gives recovery without pretending the route was rendered',async()=>{const f=page();f.install();await wait(20);delete f.w.SITE_PROMO_RENDER;equal(await f.w.SITE_ROUTER.navigate('/'),false);equal(f.location.pathname,'/projects/');assert(f.d.querySelector('.q-resource-error'),'Missing recovery');});
  await check('a failed stylesheet is actually re-requested once on retry',async()=>{const f=page();f.home.dataset.fixtureReady='no';f.install();await wait(20);const first=f.w.SITE_ROUTER.navigate('/');f.fail(f.home);equal(await first,false);const retried=f.w.SITE_ROUTER.navigate('/');const current=[...f.d.querySelectorAll('link[rel=stylesheet]')].find(l=>l.href.endsWith('/assets/promo.css'));const replaced=current!==f.home;f.ready(current);equal(await retried,true);assert(replaced,'Retry only attached another listener to the failed link');equal([...f.d.querySelectorAll('link[rel=stylesheet]')].filter(l=>l.href.endsWith('/assets/promo.css')).length,1);});
  await check('loaded styles are reused on ordinary navigation',async()=>{const f=page();f.install();await wait(20);const before=f.d.querySelectorAll('link[rel=stylesheet]').length;equal(await f.w.SITE_ROUTER.navigate('/games/'),true);equal(f.d.querySelectorAll('link[rel=stylesheet]').length,before);equal(f.location.pathname,'/games/');});
  await check('hash history preserves the current DOM, input and preview lifetime',async()=>{const f=page();f.install();await wait(30);const main=f.d.querySelector('main'),input=f.d.querySelector('#kept');input.value='user text';f.history.pushState({qView:{x:0,y:0}},'',f.location.href+'#heading');f.history.back();await wait(80);assert(f.d.querySelector('main')===main,'Hash history remounted the page');equal(input.value,'user text');equal(f.unmounts,0);});
  await check('late initial hydration cannot remount the newer route',async()=>{const f=page();f.content.dataset.fixtureReady='no';f.install();equal(await f.w.SITE_ROUTER.navigate('/'),true);const mounts=f.mounts;f.ready(f.content);await wait(60);equal(f.location.pathname,'/');equal(f.mounts,mounts,'Late bootstrap mounted the new route again');});
  await check('rapid navigation commits only the latest requested page',async()=>{const f=page('/');f.d.body.dataset.page='home';f.content.dataset.fixtureReady='no';f.install();await wait(20);const a=f.w.SITE_ROUTER.navigate('/games/'),b=f.w.SITE_ROUTER.navigate('/about/');f.ready(f.content);equal(await a,false);equal(await b,true);equal(f.location.pathname,'/about/');equal(f.renders,1);});
  await check('duplicate script evaluation does not reinstall the router',async()=>{const f=page();f.install();await wait(20);const owner=f.w.SITE_ROUTER;f.install();assert(f.w.SITE_ROUTER===owner,'Router was installed twice');});
  await check('modified clicks, downloads and external links remain native',async()=>{const f=page();f.install();await wait(20);for(const props of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{button:1},{download:true},{external:true}]){const a=f.d.createElement('a');a.href='/games/';if(props.download)a.setAttribute('download','');if(props.external)a.rel='external';f.d.body.append(a);let intercepted;const observe=e=>{intercepted=e.defaultPrevented;e.preventDefault();};f.d.addEventListener('click',observe,{once:true});a.dispatchEvent(new f.w.MouseEvent('click',{bubbles:true,cancelable:true,...props}));equal(intercepted,false,JSON.stringify(props));a.remove();}equal(f.renders,0);});
  await check('typing into the static form before hydration is preserved',async()=>{const f=await searchPage('pelican typed early');equal(f.input.value,'pelican typed early');equal(f.location.searchParams.get('q'),'pelican typed early');f.respond();await wait(30);equal(f.input.value,'pelican typed early');});
  await check('duplicate search hydration preserves an uncommitted query',async()=>{const f=await searchPage();f.respond();await wait(20);f.inputEvent('pelican');f.api.mount(f.d);equal(f.input.value,'pelican');await wait(230);equal(f.location.searchParams.get('q'),'pelican');});
  await check('IME confirmation does not submit or rewrite the URL mid-composition',async()=>{const f=await searchPage();f.respond();await wait(20);f.input.dispatchEvent(new f.w.CompositionEvent('compositionstart',{bubbles:true}));f.inputEvent('拼音中',{composing:true});f.submit();equal(f.location.searchParams.get('q'),null,'Submit ran before composition finished');f.input.value='pelican';f.input.dispatchEvent(new f.w.CompositionEvent('compositionend',{bubbles:true}));f.inputEvent('pelican');await wait(230);equal(f.location.searchParams.get('q'),'pelican');});
  await check('events on disposed search forms cannot edit a later page URL',async()=>{const f=await searchPage();f.respond();await wait(20);f.api.dispose();f.history.pushState({},'','/about/?lang=en');f.host.remove();f.input.value='late-query';f.submit();await wait(20);equal(f.location.pathname,'/about/');equal(f.location.searchParams.get('q'),null);});
  await check('delayed search results do not steal focus after the visitor moved away',async()=>{const f=await searchPage();f.input.focus();f.input.value='pelican';f.submit();const other=f.d.querySelector('#other');other.focus();f.respond();await wait(40);assert(f.d.activeElement===other,'Async results moved keyboard focus away');});
  await check('outdated index completion does not replace a detached page',async()=>{const f=await searchPage();f.api.dispose();f.host.remove();f.history.pushState({},'','/about/');f.respond();await wait(30);equal(f.location.pathname,'/about/');equal(f.location.search,'');});
  await check('search retry requests the index again after a genuine failure',async()=>{const f=await searchPage();f.respond(0,false);await until(()=>f.host.querySelector('[data-search-retry]'));f.host.querySelector('[data-search-retry]').click();await until(()=>f.requests.length===2);f.respond(1);await until(()=>f.host.querySelector('.q-search-results'));equal(f.host.querySelector('[data-search-output]').getAttribute('aria-busy'),'false');});
  await check('a replaced form is rebound without duplicate or obsolete handlers',async()=>{const f=await searchPage();f.respond();await wait(20);const old=f.form;f.form.remove();f.api.mount(f.d);const form=f.host.querySelector('form');form.elements.q.value='pelican';form.dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await wait(30);equal(f.location.searchParams.get('q'),'pelican');old.elements.q.value='obsolete';old.dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));equal(f.location.searchParams.get('q'),'pelican');});
  await check('search shares an in-flight index and preserves unrelated URL state',async()=>{const f=await searchPage();f.history.replaceState({qView:{x:0,y:7}},'','/search/?lang=en&extra=kept#section');f.input.value='pelican';f.submit();f.input.value='game';f.submit();equal(f.requests.length,1);f.respond();await wait(40);equal(f.location.searchParams.get('lang'),'en');equal(f.location.searchParams.get('extra'),'kept');equal(f.location.hash,'#section');equal(f.history.state.qView.y,7);equal(f.location.searchParams.get('q'),'game');});
  await check('new search output is localized before announcing focus',async()=>{const f=await searchPage();f.localizations=0;f.input.focus();f.submit();f.respond();await wait(40);assert(f.localizations>0,'Search did not call the shared locale owner');});
  report.ok=report.errors.length===0;return report;
 }
 globalThis.SITE_INTERACTION_TESTS={run};
}
