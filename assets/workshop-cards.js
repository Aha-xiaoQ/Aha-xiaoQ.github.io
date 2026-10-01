/* WORKSHOP-R08. Pure, shared collection renderer. No router and no project-specific branches. */
(function(root){
  'use strict';
  const M=root.SITE_MEDIA;if(!M)throw Error('workshop-media.js 必须先加载');
  const A=root.SITE_ACTIONS;if(!A)throw Error('site-actions.js 必须先加载');
  const e=M.esc,ordinal=i=>String(i+1).padStart(2,'0');
  function href(p,base=''){M.safeURL(p);if(/^https:\/\//i.test(p)||p.startsWith('/'))return p;return base+(p.endsWith('/')?p+'index.html':p);}
  const external=p=>/^https:\/\//i.test(p)?' target="_blank" rel="noopener noreferrer"':'';
  function registry(options){return options.manifest||root.SITE_PRESENTATION||{schemaVersion:1,entries:{}};}
  function media(item,type,index,options){return M.resolve(item,{type,manifest:registry(options)});}
  const tags=(item,excluded=[])=>`<div class="pw-tags">${(item.tags||[]).filter(t=>!excluded.includes(t)).map(t=>`<span>${e(t)}</span>`).join('')}</div>`;
  function projectCard(item,index=0,options={}){
    const b=options.base||'',m=media(item,'project',index,options),url=href(item.detailUrl,b);
    return `<article class="pw-work-card${m.tone==='paper'?' pw-work-card--paper':''}" role="listitem" data-content-id="${e(item.id)}"><div class="pw-work-top"><span class="pw-kicker">${e(m.categoryLabel||item.tags?.[0]||'项目')}</span><span class="pw-ordinal" aria-hidden="true">${ordinal(index)}</span></div>${M.render(m,{base:b,index})}<div class="pw-work-copy"><h2>${e(item.title)}</h2><p>${e(item.summary)}</p></div><div class="pw-work-bottom">${tags(item)}${A.link(/^https:/.test(url)?'查看仓库':'查看作品',url,{className:'pw-action',variant:'card',newTab:/^https:/.test(url),ariaLabel:'查看 '+item.title,meta:/^https:/.test(url)?'GitHub':''})}</div></article>`;
  }
  function gameCard(item,index=0,options={}){
    const b=options.base||'',m=media(item,'game',index,options),categories=(options.taxonomy?.gameCategories||[]).filter(c=>(item.categories||[]).includes(c.id));
    const proof=(options.data?.evidence||[]).find(x=>(item.evidenceIds||[]).includes(x.id));
    return `<article class="media-row pw-game-card" role="listitem" data-content-id="${e(item.id)}" data-categories="${e((item.categories||[]).join(' '))}"><div class="pw-cover-slot">${M.render(m,{base:b,index})}<span class="pw-cover-number" aria-hidden="true">${ordinal(index)}</span></div><div class="media-row__body"><div class="media-row__kicker"><span class="status">浏览器游戏</span>${categories[0]?`<span class="game-category">${e(categories[0].label)}</span>`:''}</div><h2>${e(item.title)}</h2><p>${e(item.summary)}</p>${tags(item,[...categories.map(x=>x.label),'浏览器游戏'])}<div class="actions">${A.link('开始试玩',href(item.localUrl,b),{className:'button',variant:'primary',ariaLabel:'试玩 '+item.title})}${A.link('游戏介绍',href(item.detailUrl,b),{className:'button button--quiet',variant:'secondary',ariaLabel:'游戏介绍：'+item.title})}${item.videoUrl?A.link('观看视频',href(item.videoUrl,b),{className:'button button--quiet',variant:'secondary',newTab:true,meta:'',ariaLabel:'观看 '+item.title+' 视频'}):A.videoPending(item)}${item.downloadUrl?A.link('下载游戏',href(item.downloadUrl,b),{className:'button button--quiet',variant:'secondary',download:true,meta:'',ariaLabel:'下载 '+item.title}):''}</div>${proof?.accessNote?`<p class="pw-access-note">${e(proof.accessNote)}</p>`:''}</div></article>`;
  }
  function toolCard(item,index=0,options={}){
    const b=options.base||'',m=media(item,'tool',index,options);
    return `<article class="pw-tool-card" role="listitem" data-content-id="${e(item.id)}"><div class="pw-tool-copy"><span class="pw-kicker">${e(item.status||'工具')}</span><h2>${e(item.title)}</h2><p>${e(item.summary)}</p><div class="actions">${item.url?`${A.link(item.linkLabel||'打开工具',href(item.url,b),{className:'button',variant:'primary',ariaLabel:'打开 '+item.title})}`:''}${item.videoUrl?`${A.link('观看视频',href(item.videoUrl,b),{className:'button button--quiet',variant:'secondary',newTab:true,meta:''})}`:''}</div></div>${item.videoSlot===true?A.videoPanel(item,{cover:m.src?href(m.src,b):'',eager:index===0}):M.render(m,{base:b,index})}</article>`;
  }
  function renderCollection(page,data,taxonomy={},options={}){
    const b=options.base||'',o={...options,data,taxonomy},sort=(items)=>[...items].sort((a,c)=>(c.updatedAt||'').localeCompare(a.updatedAt||'')||a.id.localeCompare(c.id));
    const all=data.items||[];let title,kicker,cards,filter='';
    if(page==='projects'){
      const items=sort(all.filter(x=>x.primaryType==='project'&&x.visibility==='public'&&x.lifecycleStatus!=='archived'));title='想法，动手实现。';kicker='SELECTED WORK / 项目记录';
      cards=`<div class="entry-grid pw-work-grid" role="list" aria-label="项目作品">${items.map((x,i)=>projectCard(x,i,o)).join('')||'<p class="pw-empty">新作品正在准备中。</p>'}</div>`;
    }else if(page==='games'){
      const items=sort(all.filter(x=>x.primaryType==='game'&&x.visibility==='public'&&x.lifecycleStatus!=='archived'));title='选择一款，开始冒险。';kicker='GAME SHELF / 游戏架';
      // Offer filters only when they actually narrow the visible collection.
      const cats=(taxonomy.gameCategories||[]).filter(c=>{const count=items.filter(x=>(x.categories||[]).includes(c.id)).length;return count>0&&count<items.length;});
      filter=(cats.length?`<div class="filter-bar" data-workshop-filter aria-label="按玩法筛选"><button type="button" data-filter="all" aria-pressed="true">全部游戏 <span class="filter-count">${items.length}</span></button>${cats.map(c=>`<button type="button" data-filter="${e(c.id)}" aria-pressed="false">${e(c.label)} <span class="filter-count">${items.filter(x=>(x.categories||[]).includes(c.id)).length}</span></button>`).join('')}</div>`:'')+`<p class="filter-summary" data-filter-summary aria-live="polite">显示全部 ${items.length} 款游戏</p>`;
      cards=`<div class="media-list pw-game-grid" id="game-list" role="list" aria-label="游戏作品">${items.map((x,i)=>gameCard(x,i,o)).join('')||'<p class="pw-empty">新游戏正在准备中。</p>'}</div>`;
    }else if(page==='tools'){
      title='动手试试，看看原理。';kicker='TOOLS / 工具与实验';cards=`<div class="pw-tools-list" role="list" aria-label="工具与实验">${(data.tools||[]).filter(x=>x.visibility!=='draft'&&x.visibility!=='private').map((x,i)=>toolCard(x,i,o)).join('')||'<p class="pw-empty">新工具正在准备中。</p>'}</div>`;
    }else throw Error('不支持的集合页面：'+page);
    return `<main id="main" tabindex="-1" data-workshop-render="r08"><section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div></div>${filter}${cards}</div></section></main>`;
  }
  root.SITE_WORKSHOP=Object.freeze({version:'workshop-r08',projectCard,gameCard,toolCard,renderCollection});
})(globalThis);
