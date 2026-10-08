import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../../',import.meta.url));
// Real shell/router with controlled network omission, history and DOM; no browser audit claim.
function fixture(root,{omitAssets=false,omitJourney=false,skipPromo=false,initialPage=null,initialPath="/"}={}){
 const nativeNavigations=[];const events={},body={dataset:{}},initial='<main id="main"><h1>STATIC HOME</h1><p>HOME_ONLY_MARKER</p></main>';
 function el(tag='div'){
  return {tagName:tag.toUpperCase(),dataset:{},style:{},media:'all',rel:'stylesheet',sheet:{},children:[],classList:{add(){},remove(){}},addEventListener(){},removeEventListener(){},append(...children){this.children.push(...children)},prepend(...children){this.children.unshift(...children)},replaceChildren(...children){this.children=[...children]},insertBefore(child){this.children.push(child)},setAttribute(k,v){this[k]=v;},removeAttribute(k){if(k==='data-prerendered')delete this.dataset.prerendered;else delete this[k]},getAttribute(k){return this[k]??null},querySelectorAll(){return[]},querySelector(){return null},focus(){},hasAttribute(){return false},cloneNode(){return {...this}},replaceWith(){},contains(){return false}};
 }
 if(initialPage)body.dataset.page=initialPage;
 const app=el();app.dataset.prerendered='true';app.innerHTML=initial;
 const main=el('main');app.querySelector=s=>s==='#main'?main:s===':scope > .q-resource-error'?app.children.find(x=>x.className==='q-resource-error')||null:null;
 const links=['promo.css','site-shell.css'].map(name=>Object.assign(el('link'),{href:'https://local.invalid/assets/'+name}));
 const styles=new Map();const document={body,hidden:true,readyState:'loading',currentScript:{src:''},documentElement:{lang:'zh-CN'},baseURI:'https://local.invalid/',styleSheets:[],activeElement:null,head:{append(x){if(x.id)styles.set('#'+x.id,x);},insertBefore(){}},querySelector(s){if(s==='#app')return app;if(styles.has(s))return styles.get(s);return null;},querySelectorAll(s){return s.startsWith('link[')?links:[];},getElementById(){return null;},createElement:el,addEventListener(t,f){(events[t]??=[]).push(f);}};
 const location={};const setLocation=u=>{const v=new URL(u,'https://local.invalid/');for(const k of ['href','origin','pathname','search','hash'])location[k]=v[k]};setLocation(initialPath);location.assign=u=>{nativeNavigations.push(String(u));setLocation(u)};
 const history={state:null,replaceState(state,_,u){this.state=state;if(u)setLocation(u);},pushState(state,_,u){this.state=state;setLocation(u)}};
 const c={document,location,history,URL,console,navigator:{},scrollX:0,scrollY:0,requestAnimationFrame(){return 1;},matchMedia(){return {matches:true}},CustomEvent:class{constructor(type){this.type=type}},setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},addEventListener(){},dispatchEvent(){},scrollTo(){}};c.window=c;
 const context=vm.createContext(c);
 const load=(p)=>{document.currentScript.src='https://local.invalid/'+p;let code=fs.readFileSync(path.join(root,p),'utf8');vm.runInContext(code,context,{filename:p});};
 for(const p of ['content/taxonomy.js','content/site-data.js',...(!omitAssets?['content/asset-manifest.js']:[]),'assets/ui/site-actions.js',...(!omitJourney?['assets/launch/journey.js']:[]),'content/game-support.js',...(!skipPromo?['assets/promo.js']:[]),'assets/site-shell.js','assets/site-router.js'])load(p);
 return {context,app,initial,links,body,nativeNavigations};
}

for(const [name,options] of [['healthy',{}],['missing optional homepage assets',{omitAssets:true}],['homepage script did not execute',{skipPromo:true}]]){
 test('home to game replaces static content: '+name,async()=>{
  const f=fixture(source,options);
  assert.equal(await f.context.SITE_ROUTER.navigate('/games/five-regions/'),true);
  assert.equal(f.context.location.pathname,'/games/five-regions/');
  assert.match(f.app.innerHTML,/data-game-journey/);
  assert.doesNotMatch(f.app.innerHTML,/HOME_ONLY_MARKER/);
  assert.match(f.app.innerHTML,/BV1cHH965ECn/);
  assert.equal(f.app.dataset.prerendered,undefined);
 });
}
test('a missing render dependency falls back to the static document instead of stranding the previous DOM',async()=>{
 const f=fixture(source,{omitJourney:true});const replacements=[];
 f.context.location.replace=url=>replacements.push(url);
 await f.context.SITE_ROUTER.navigate('/games/five-regions/');
 assert.deepEqual(replacements,['https://local.invalid/games/five-regions/']);
});

test('healthy homepage/detail/history destination round trip keeps the matching content',async()=>{const f=fixture(source);await f.context.SITE_ROUTER.navigate('/games/five-regions/');await f.context.SITE_ROUTER.navigate('/');assert.equal(f.context.location.pathname,'/');assert.match(f.app.innerHTML,/class="studio"/);await f.context.SITE_ROUTER.navigate('/games/five-regions/');assert.match(f.app.innerHTML,/data-game-journey/);});
test('initial document hydration preserves the server-rendered content',()=>{const f=fixture(source,{initialPage:'detail',initialPath:'/games/five-regions/'});assert.equal(f.app.innerHTML,f.initial);assert.equal(f.app.dataset.prerendered,undefined);});

test('tool guide navigation uses exactly the same main layout as a direct document visit',async()=>{const f=fixture(source);await f.context.SITE_ROUTER.navigate('/tools/mario-map-workshop-2-0/');const live=f.app.innerHTML.match(/<main\b[\s\S]*?<\/main>/)[0];const direct=fs.readFileSync(path.join(source,'tools/mario-map-workshop-2-0/index.html'),'utf8').match(/<main\b[\s\S]*?<\/main>/)[0];assert.equal(live,direct);});
