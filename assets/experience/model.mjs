/** Pure search contract. The index contains curated public summaries, never tasks or saved drafts. */
export const TYPES=Object.freeze({all:'全部',game:'游戏',project:'项目',tool:'工具',guide:'资料',note:'笔记'});
export const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function safeURL(value){
 if(typeof value!=='string'||!value||/[\\\x00-\x20]/.test(value)||/%(?:2e|2f|5c)/i.test(value))return '';
 if(value.startsWith('/')&&!value.startsWith('//')&&!value.split(/[?#]/)[0].split('/').some(x=>x==='.'||x==='..'))return value;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}
}
export function canonical(value){const s=safeURL(value);return s?s.replace(/\/index\.html(?=[?#]|$)/,'/'):'';}
export function searchState(url){const p=new URL(url,'https://site.invalid').searchParams;return {q:(p.get('q')||'').trim().slice(0,160),type:Object.hasOwn(TYPES,p.get('type'))?p.get('type'):'all',page:Math.max(1,Math.min(10000,Math.floor(Number(p.get('page')))||1))};}
export function stateURL(url,state){const u=new URL(url,'https://site.invalid');for(const k of ['q','type','page'])u.searchParams.delete(k);const q=String(state.q||'').trim().slice(0,160);if(q)u.searchParams.set('q',q);if(state.type&&state.type!=='all'&&Object.hasOwn(TYPES,state.type))u.searchParams.set('type',state.type);if(state.page>1)u.searchParams.set('page',String(Math.floor(state.page)));return u;}
export function validateIndex(data){
 if(data?.schemaVersion!==1||!Array.isArray(data.entries)||data.entries.length>5000)throw Error('Invalid search index');
 const seen=new Set();for(const e of data.entries){
  if(typeof e.id!=='string'||!e.id||seen.has(e.id)||!Object.hasOwn(TYPES,e.type)||e.type==='all'||!safeURL(e.href)||typeof e.title!=='string'||!e.title.trim()||e.title.length>200||typeof e.summary!=='string'||e.summary.length>1800||!Array.isArray(e.tags)||e.tags.some(t=>typeof t!=='string'||t.length>100))throw Error('Invalid search entry');seen.add(e.id);
 }return data;
}
export function makeIndex({site={},projects=[]}={}){
 const entries=[],urls=new Set();
 function add(e){e.href=canonical(e.href);if(!e.href||urls.has(e.href))return;urls.add(e.href);entries.push({...e,summary:String(e.summary||'').slice(0,1800),tags:(e.tags||[]).filter(t=>typeof t==='string').slice(0,20)});}
 for(const x of site.items||[]){if(x.visibility!=='public'||x.lifecycleStatus==='archived')continue;let href=x.detailUrl||x.localUrl;if(href&&!/^https:|^\//.test(href))href='/'+href;add({id:'work:'+x.id,type:x.primaryType==='game'?'game':'project',title:x.title,summary:x.summary,href,tags:x.tags});}
 for(const x of site.tools||[]){if(x.visibility&&x.visibility!=='public'||x.lifecycleStatus==='archived')continue;let href=x.url;if(href&&!/^https:|^\//.test(href))href='/'+href;add({id:'tool:'+x.id,type:'tool',title:x.title,summary:x.summary,href,tags:x.tags});}
 for(const p of projects){if(p.visibility!=='public')continue;add({id:'project:'+p.id,type:'project',title:p.title+' · 开发',summary:p.summary,href:'/notes/'+p.id+'/',tags:[p.category,'源码','开发']});
  for(const d of p.docs||[]){if(d.archived)continue;add({id:'guide:'+p.id+':'+d.id,type:'guide',title:d.title,summary:d.summary,href:'/notes/'+p.id+'/docs/'+d.id+'/',tags:[p.title,...(d.sections||[]).map(s=>s.title)]});}
 }
 for(const n of site.notes||[]){if(n.visibility!=='public'||!n.url)continue;const href=/^https:|^\//.test(n.url)?n.url:'/'+n.url;add({id:'note:'+(n.id||canonical(href)),type:'note',title:n.title,summary:n.summary,href,tags:n.tags});}
 entries.sort((a,b)=>a.id.localeCompare(b.id));return validateIndex({schemaVersion:1,entries});
}
export function search(data,{q='',type='all',page=1,size=8,translate=value=>value}={}){
 if(typeof translate!=='function')throw Error('Invalid search translator');
 validateIndex(data);const query=normalize(q).slice(0,160),terms=query.split(' ').filter(Boolean),n=Math.max(1,Math.min(24,Math.floor(size)||8));
 const scored=data.entries.filter(e=>type==='all'||!TYPES[type]||e.type===type).map(e=>{const title=normalize(e.title),tags=normalize(e.tags.join(' ')),body=normalize(e.summary),all=title+' '+tags+' '+body+' '+normalize([translate(e.title),translate(e.summary),...e.tags.map(translate)].join(' '));if(!terms.every(t=>all.includes(t)))return null;const score=!query?({game:50,project:40,tool:30,note:20,guide:10}[e.type]||0):(title===query||normalize(translate(e.title))===query?150:0)+(title.startsWith(query)?60:0)+(title.includes(query)?30:0)+terms.reduce((s,t)=>s+(title.includes(t)?15:tags.includes(t)?6:1),0);return {e,score};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.e.id.localeCompare(b.e.id));
 const count=scored.length,pages=Math.max(1,Math.ceil(count/n)),current=Math.max(1,Math.min(pages,Math.floor(page)||1));return {items:scored.slice((current-1)*n,current*n).map(x=>x.e),count,page:current,pages};
}
export function searchMarkup(){return `<section class="section q-search" data-search-surface><form role="search" action="/search/" method="get" data-global-search><label for="q-global-query">搜索作品与资料</label><div class="q-search-line"><input id="q-global-query" name="q" type="search" maxlength="160" placeholder="游戏、工具、源码或操作指南" autocomplete="off"><button class="button" type="submit">搜索</button></div><fieldset class="q-search-filters"><legend>内容类型</legend>${Object.entries(TYPES).map(([v,t])=>`<label><input type="radio" name="type" value="${v}" ${v==='all'?'checked':''}><span>${t}</span></label>`).join('')}</fieldset></form><div data-search-output aria-busy="false"><p class="q-search-note">输入作品名称或关键词，也可以按类型浏览。</p><noscript><p>搜索需要 JavaScript。也可以直接浏览下方栏目。</p></noscript></div><div class="q-search-fallback"><a href="/games/">浏览游戏</a><a href="/projects/">浏览项目</a><a href="/tools/">浏览工具</a><a href="/notes/">开发资料</a></div></section>`;}
export function resultsMarkup(result){return `<p class="q-search-count" role="status" aria-live="polite">找到 ${result.count} 项 · 第 ${result.page} / ${result.pages} 页</p><ul class="q-search-results">${result.items.map(e=>`<li><a href="${esc(e.href)}" class="q-search-result"><span class="q-result-type">${esc(TYPES[e.type])}</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p>${e.href.startsWith('https:')?'<span class="q-result-external">外部网站</span>':''}</a></li>`).join('')||'<li class="q-no-results"><h2>没有找到相关内容</h2><p>试试更短的关键词，或查看全部内容。</p><button type="button" class="button button--quiet" data-search-reset>清除筛选</button></li>'}</ul>${result.pages>1?`<div class="q-search-pagination"><button type="button" class="button button--quiet" data-search-page="${result.page-1}" ${result.page===1?'disabled':''}>上一页</button><span>${result.page} / ${result.pages}</span><button type="button" class="button button--quiet" data-search-page="${result.page+1}" ${result.page===result.pages?'disabled':''}>下一页</button></div>`:''}`;}
export function tocMarkup(sections){if(sections.length<3)return '';return `<nav class="q-reading-toc" aria-label="本文目录"><details><summary>本文目录</summary><ol>${sections.map((s,i)=>`<li><a href="#guide-section-${i+1}">${esc(s.title)}</a></li>`).join('')}</ol></details></nav>`;}
