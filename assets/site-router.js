/* Xiao Q site router: keep the public site in one document while preserving
   real URLs, history, deep links, and the existing route renderers. */
(() => {
  if (globalThis.SITE_ROUTER?.version === "site-r46") return;
  const app = document.querySelector("#app");
  if (!app) return;

  // The router is intentionally installed at the end of every HTML entry.
  // It owns internal links before the browser can start a document request.
  // The HTML files remain valid deep-link fallbacks, but normal navigation is
  // always handled in this document.
  // JOURNAL-R04: generic project content routes, one native transition owner.
  const routeInfo = (pathname) => {
    const path = pathname.replace(/\\/g, "/").replace(/\/+/g, "/");
    if (path === "/" || path.endsWith("/index.html") && path.split("/").filter(Boolean).length === 1) return { kind: "home", page: "home", title: "在下_小Q" };
    if (/^\/(?:notes|dev)(?:\/|$)/.test(path)) return {kind:"content",page:"journal",journalPath:path,title:"开发 · 在下_小Q"};
    if (/^\/play-guide\/(?:index\.html)?$/.test(path)) return {kind:'content',page:'visitorHelp',title:'试玩帮助 · 在下_小Q'};
    if (path === '/404.html') return {kind:'content',page:'notFound',title:'页面未找到 · 在下_小Q'};
    if (/^\/search\/(?:index\.html)?$/.test(path)) return {kind:"content",page:"search",title:"搜索 · 在下_小Q"};
    const detail = path.match(/^\/(?:games)\/([^/]+)\/(?:index\.html)?$/);
    if (detail) {
      const itemSlug = detail[1];
      const item = globalThis.SITE_DATA?.items?.find((entry) => entry.primaryType === "game" && entry.slug === itemSlug);
      if (!item) return null;
      return { kind: "content", page: "detail", itemSlug, title: `${item.title} · 在下_小Q` };
    }
    const section = path.match(/^\/(games|projects|tools|notes|about|method)\/(?:index\.html)?$/);
    if (!section) return null;
    const page = section[1] === "method" ? "tools" : section[1];
    const titles = { games: "游戏 · 在下_小Q", projects: "项目 · 在下_小Q", tools: "工具 · 在下_小Q", notes: "笔记 · 在下_小Q", about: "关于 · 在下_小Q" };
    return { kind: "content", page, title: titles[page] };
  };
  const baseForPath = (pathname) => {
    const segments = pathname.split("/").filter(Boolean);
    const depth = Math.max(0, segments.length - (pathname.endsWith("/") ? 0 : 1));
    return "../".repeat(depth);
  };
  // Resolve from the loaded router, not the current route or stale literals.
  const routerURL = new URL(document.currentScript.src, location.href);
  const assetHref = (name) => {
    const url = new URL(name, routerURL);
    url.search = routerURL.search;
    return url.href;
  };
  let experienceModule;
  const prepareExperience=async info=>{if(info.page!=="search")return;experienceModule ||= import(new URL("experience/runtime.mjs?v=site-r23",routerURL).href).catch(e=>{experienceModule=null;throw e;});await experienceModule;};
  let journalModule, journalWarmup;
  const journalStyle = () => {
    let link=document.querySelector('[data-journal-css]');
    if(link)link=renewStylesheet(link);
    if(link?.sheet)return Promise.resolve();
    if(!link){link=document.createElement('link');link.rel='stylesheet';link.href=new URL('journal/journal.css?v=dev-r44-279054bb1330294e',routerURL).href;link.dataset.journalCss='';document.head.append(link);}
    return waitForLink(link);
  };
  const importJournal=()=>journalModule ||= import(new URL('journal/runtime.mjs?v=dev-r44-279054bb1330294e',routerURL).href).catch(error=>{journalModule=null;throw error;});
  const prepareJournal = async info => {
    if(info.page!=='journal')return;
    await Promise.all([journalStyle(),importJournal().then(()=>globalThis.SITE_JOURNAL.prepare(info))]);
    if(info.journalError)throw Error('Project data unavailable');
  };
  const warmJournal=()=>{
    const connection=navigator.connection;
    if(document.hidden||connection?.saveData||/^(?:slow-)?2g$/.test(connection?.effectiveType||''))return;
    journalWarmup ||= prepareJournal({page:'journal',journalPath:'/notes/'}).catch(()=>{journalWarmup=null;});
  };
  const syncJournalNavigation = () => {
    const en=document.documentElement.lang.startsWith("en"),inside=/^\/(notes|dev)(\/|$)/.test(location.pathname);
    app.querySelectorAll('.site-header nav,.topbar>nav').forEach(nav=>{
      nav.style.flexWrap='wrap';
      nav.querySelectorAll('[data-nav-key="dev"]').forEach(a=>a.remove());
      nav.querySelectorAll('[data-nav-key="notes"]').forEach(a=>{
        a.dataset.i18nSkip='';a.href='/notes/';const label=en?'Dev':'开发';if(a.textContent!==label)a.textContent=label;
        if(inside){nav.querySelectorAll('[aria-current="page"]').forEach(n=>n.removeAttribute('aria-current'));a.setAttribute('aria-current','page');}else a.removeAttribute('aria-current');
      });
    });
  };
  const syncJournalMetadata = info => {
    if(info?.page!=="journal"||!globalThis.SITE_JOURNAL)return;
    const meta=globalThis.SITE_JOURNAL.describe(location.pathname),title=meta.title+' · 在下_小Q';document.title=title;
    for(const [kind,key,value]of [['name','description',meta.intro],['property','og:title',title],['property','og:description',meta.intro],['name','twitter:title',title],['name','twitter:description',meta.intro]]){
      let n=document.querySelector('meta['+kind+'="'+key+'"]');if(!n){n=document.createElement('meta');n.setAttribute(kind,key);document.head.append(n);}n.content=value;
    }
    let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=location.origin+location.pathname;
  };
  document.addEventListener('site-language-change',()=>{syncJournalNavigation();syncJournalMetadata(routeInfo(location.pathname));});
  const warmHomeAssets = () => {
    const add = (as, name, type = "", crossOrigin = false) => {
      const href = assetHref(name);
      const exists = [...document.querySelectorAll(`link[rel="preload"][as="${as}"]`)].some((link) => link.href === href);
      if (exists) return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = as;
      if (type) link.type = type;
      if (crossOrigin) link.crossOrigin = "anonymous";
      link.href = href;
      document.head.insertBefore(link, document.querySelector('link[href*="site-i18n.css"]'));
    };
    add("style", "promo.css");
    // Font preloads already exist in every HTML entry with the CSS URLs.
    add("image", "identity/xiaoq-avatar-p63a.svg");
    add("image", "backgrounds/bg-home-pixel-game-r3.webp", "image/webp");
  };
  const styleLinks = new Map();
  const stylesheetLoads = new WeakMap(), failedStylesheets = new WeakSet();
  const stylePath = { home: "/assets/promo.css", content: "/assets/site-shell.css" };
  const hasLoadedSheet = (link) => {
    if (link.sheet) return true;
    // Some Chromium surfaces expose the loaded CSS through document.styleSheets
    // while link.sheet stays null (especially for a stylesheet that is
    // temporarily disabled with media="not all"). Treat that as ready too;
    // otherwise every warm route switch falls through to the timeout below.
    const href = link.href;
    return Boolean(href && [...document.styleSheets].some((sheet) => sheet.href === href));
  };
  // A failed link will not fetch again merely because another listener was added.
  // Replace only failed resources on retry; loaded sheets and the current view stay intact.
  const renewStylesheet = link => {
    if (!failedStylesheets.has(link) || hasLoadedSheet(link)) return link;
    const next = link.cloneNode(false);
    link.replaceWith(next);
    return next;
  };
  const waitForLink = (link) => {
    if (hasLoadedSheet(link)) return Promise.resolve(link);
    if (stylesheetLoads.has(link)) return stylesheetLoads.get(link);
    const pending = new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        link.removeEventListener("load", loaded);
        link.removeEventListener("error", failed);
        if (error) { failedStylesheets.add(link); reject(error); } else { failedStylesheets.delete(link); resolve(link); }
      };
      const loaded = () => finish();
      const failed = () => finish(new Error("Stylesheet unavailable"));
      const timer = window.setTimeout(failed, 10000);
      link.addEventListener("load", loaded, { once: true });
      link.addEventListener("error", failed, { once: true });
      if (hasLoadedSheet(link)) loaded();
    }).then(value => { stylesheetLoads.delete(link); return value; }, error => { stylesheetLoads.delete(link); throw error; });
    stylesheetLoads.set(link, pending);
    return pending;
  };
  const normalizeStylesheetLinks = () => document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]').forEach((link) => {
    const raw = link.getAttribute("href");
    if (raw && !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(raw)) link.href = new URL(raw, document.baseURI).href;
  });
  const styleFor = (kind) => {
    const path = stylePath[kind];
    let existing = [...document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]')].find((link) => {
      try { const url = new URL(link.href, location.href); return url.origin === routerURL.origin && url.pathname === path; } catch { return false; }
    });
    if (existing) {
      existing = renewStylesheet(existing);
      const wasPreload = existing.rel === "preload";
      if (wasPreload) existing.rel = "stylesheet";
      if (wasPreload) existing.media = "not all";
      styleLinks.set(kind, existing);
      // Loaded sheets return immediately; pending sheets must really load.
      return waitForLink(existing);
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = assetHref(kind === "home" ? "promo.css" : "site-shell.css");
    link.media = "not all";
    document.head.insertBefore(link, document.querySelector('link[href*="site-i18n.css"]'));
    styleLinks.set(kind, link);
    return waitForLink(link);
  };
  const prepareStyles = async () => {
    await Promise.all([styleFor("home"), styleFor("content")]);
  };
  const applyStyles = (kind) => {
    for (const [key, link] of styleLinks) {
      link.disabled = false;
      link.media = key === kind ? "all" : "not all";
    }
  };
  const injectMotionStyle = () => {
    if (document.querySelector("#q-router-style")) return;
    const style = document.createElement("style");
    style.id = "q-router-style";
    // Keep the old screen visible while the new route is prepared, then let
    // the two already-rendered layers crossfade. This is the same visual
    // contract as a real app shell: no blank frame and no loading placeholder.
    style.textContent = `::view-transition-old(root){animation:q-vt-out 240ms cubic-bezier(.22,.61,.36,1) both}::view-transition-new(root){animation:q-vt-in 280ms cubic-bezier(.22,.61,.36,1) both}::view-transition-old(q-header),::view-transition-new(q-header){animation-duration:220ms}::view-transition-old(q-footer),::view-transition-new(q-footer){animation-duration:220ms}.topbar,.site-header{view-transition-name:q-header}.footer,.site-footer{view-transition-name:q-footer}@keyframes q-vt-out{to{opacity:0;transform:translateX(-14px)}}@keyframes q-vt-in{from{opacity:0;transform:translateX(14px)}}#q-route-old{position:fixed;z-index:99;inset:0;overflow:hidden;pointer-events:none;background-color:var(--ink,#111315);background-repeat:no-repeat;background-position:0 0,61% center;background-size:auto,cover;opacity:1;transform:translateX(0);transition:opacity 190ms ease,transform 220ms cubic-bezier(.22,.61,.36,1)}#q-route-old.q-route-old--out{opacity:0;transform:translateX(-10px)}#app.q-route-new{opacity:.96;transform:translateX(10px);transition:opacity 190ms ease,transform 220ms cubic-bezier(.22,.61,.36,1)}#app.q-route-new.q-route-new--in{opacity:1;transform:translateX(0)}@media(prefers-reduced-motion:reduce){#q-route-old,#q-route-old.q-route-old--out,#app.q-route-new,#app.q-route-new.q-route-new--in,::view-transition-old(root),::view-transition-new(root){opacity:1;transform:none;animation:none;transition:none}}`;
    document.head.append(style);
  };
  const renderRoute = (info) => {
    globalThis.SITE_EXPERIENCE?.dispose();
    globalThis.SITE_GUESTBOOK_UNMOUNT?.();
    globalThis.SITE_JOURNAL?.unmount();
    document.body.dataset.routeKind = info.kind;
    document.body.dataset.page = info.page;
    document.body.dataset.itemSlug = info.itemSlug || "";
    if (info.kind === "home") {
      globalThis.SITE_PROMO_RENDER?.(app);
    } else {
      globalThis.SITE_SHELL_RENDER?.({ targetRoot: app, nextPage: info.page, nextBase: baseForPath(location.pathname), nextItemSlug: info.itemSlug || "" });
    }
    document.title = info.title;
    globalThis.SITE_I18N?.route(info);
    if(info.page==='journal')globalThis.SITE_JOURNAL?.mount(app,info);
    syncJournalNavigation();syncJournalMetadata(info);
    if(info.page==='search'){
      const summary='查找游戏、工具、项目与开发资料。';
      for(const [attr,key,value]of [['name','description',summary],['property','og:title',info.title],['property','og:description',summary],['name','twitter:title',info.title],['name','twitter:description',summary]]){
        let meta=document.querySelector('meta['+attr+'="'+key+'"]');if(!meta){meta=document.createElement('meta');meta.setAttribute(attr,key);document.head.append(meta);}meta.content=value;
      }
    }
    globalThis.SITE_EXPERIENCE?.mount(app);
  };
  // R18: history entries own scroll and content focus; no query text is stored separately.
  let renderedPath=location.pathname,renderedSearch=location.search,scrollTick=0,viewSuspended=false;
  const plainState=()=>history.state&&typeof history.state==='object'?history.state:{};
  const contentFocus=()=>{
    const el=document.activeElement,main=app.querySelector('#main');if(!main?.contains(el)||el===main)return null;
    if(el.id)return {id:el.id};const a=el.closest('a[href]');
    if(a){const href=a.getAttribute('href'),links=[...main.querySelectorAll('a[href]')].filter(x=>x.getAttribute('href')===href);return {href,index:links.indexOf(a)};}return null;
  };
  const saveView=()=>{if(viewSuspended||renderedPath!==location.pathname)return;renderedSearch=location.search;const state=plainState();history.replaceState({...state,qView:{x:scrollX,y:scrollY,focus:contentFocus()||state.qView?.focus||null}},'',location.href);};
  window.addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=requestAnimationFrame(()=>{scrollTick=0;saveView();});},{passive:true});
  document.addEventListener('focusin',()=>{if(app.querySelector('#main')?.contains(document.activeElement))saveView();});
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  let navigating=false,navigationSequence=0,activeTransition;
  const showFailure=(url,options)=>{
    let box=app.querySelector(':scope > .q-resource-error');if(!box){box=document.createElement('section');box.className='q-resource-error';box.setAttribute('role','alert');app.prepend(box);}
    box.replaceChildren();const p=document.createElement('p');p.textContent='页面暂时无法打开。已有内容仍可阅读。';const b=document.createElement('button');b.type='button';b.className='button button--quiet';b.textContent='重试加载';b.onclick=()=>navigate(new URL(url),{...options,force:true});const a=document.createElement('a');a.className='button button--quiet';a.textContent='直接打开页面';a.href=String(url);a.dataset.routerIgnore='';box.append(p,b,a);
  };
  const restoreView=(url,view,id)=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(id!==navigationSequence)return;
    viewSuspended=false;
    let target=null;if(url.hash)try{target=document.getElementById(decodeURIComponent(url.hash.slice(1)));}catch{}
    if(target){if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});return;}
    const main=app.querySelector('#main');let focus=null;
    if(view?.focus?.id){const el=document.getElementById(view.focus.id);if(main?.contains(el))focus=el;}
    else if(view?.focus?.href)focus=[...(main?.querySelectorAll('a[href]')||[])].filter(a=>a.getAttribute('href')===view.focus.href)[view.focus.index||0];
    (focus||main)?.focus({preventScroll:true});window.scrollTo({top:view?.y||0,left:view?.x||0,behavior:'instant'});saveView();
  }));
  const navigate=async(url,{historyMode="push",force=false,preserveView=false}={})=>{
    try { url=new URL(url,location.href); } catch { return false; }
    if(url.origin!==location.origin || !['push','replace','none'].includes(historyMode))return false;
    const info=routeInfo(url.pathname);if(!info)return false;
    // History through in-document headings must not remount forms or stop a preview.
    if(historyMode==='none'&&!preserveView&&!navigating&&renderedPath===url.pathname&&renderedSearch===url.search){
      restoreView(url,plainState().qView,navigationSequence);return true;
    }
    if(!force&&url.pathname===location.pathname&&url.search===location.search&&!url.hash)return false;
    if(historyMode!=="none"||preserveView)saveView();
    const targetView=(historyMode==='none'||preserveView)?plainState().qView:null;
    if(historyMode==='none')viewSuspended=true;
    const navigationId=++navigationSequence;navigating=true;activeTransition?.skipTransition?.();app.classList.remove('q-route-new','q-route-new--in');
    const commit=()=>{
      if(navigationId!==navigationSequence)return;
      applyStyles(info.kind);
      if(historyMode==='push')history.pushState({qView:{x:0,y:0,focus:null}},'',url.href);
      else if(historyMode==='replace')history.replaceState({...plainState(),qView:{x:0,y:0,focus:null}},'',url.href);
      renderedPath=location.pathname;renderedSearch=location.search;renderRoute(info);restoreView(url,targetView,navigationId);
    };
    try{
      const renderer=info.kind==='home'?globalThis.SITE_PROMO_RENDER:globalThis.SITE_SHELL_RENDER;
      if(typeof renderer!=='function')throw Error('Page renderer unavailable');
      await Promise.all([styleFor(info.kind),prepareJournal(info),prepareExperience(info)]);
      if(info.canonical){url=new URL(url.href);url.pathname=info.canonical;}
    }
    catch{if(navigationId!==navigationSequence)return false;navigating=false;showFailure(url,{historyMode,preserveView});return false;}
    if(navigationId!==navigationSequence)return false;
    if(typeof document.startViewTransition==='function'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const transition=document.startViewTransition(commit);activeTransition=transition;
      transition.finished.finally(()=>{if(navigationId===navigationSequence)navigating=false;}).catch(()=>{});return true;
    }
    commit();app.classList.add('q-route-new');requestAnimationFrame(()=>{if(navigationId!==navigationSequence)return;app.classList.add('q-route-new--in');setTimeout(()=>{if(navigationId!==navigationSequence)return;app.classList.remove('q-route-new','q-route-new--in');navigating=false;},240);});return true;
  };
  globalThis.SITE_ROUTER={version:"site-r46",navigate};

  injectMotionStyle();
  normalizeStylesheetLinks();
  // No content-page prefetch of the homepage artwork; its normal entry still loads it.
  if(document.body.dataset.page==='home')warmHomeAssets();
  syncJournalNavigation();
  const initial = routeInfo(location.pathname), initialSequence = navigationSequence;
  // Destination styles are requested when their route is used.
  if (initial) Promise.all([styleFor(initial.kind),prepareJournal(initial),prepareExperience(initial)]).then(() => {
    if(navigationSequence!==initialSequence)return;
    const current = routeInfo(location.pathname);
    if (current) applyStyles(current.kind);
    // Do not overwrite a newer navigation that completed while initial resources loaded.
    if(initial.page==='journal' && current?.journalPath===initial.journalPath){
      if(initial.canonical){const url=new URL(location.href);url.pathname=initial.canonical;history.replaceState(history.state,'',url);}
      // Keep the already visible native shell; hydrate only the journal slot.
      globalThis.SITE_JOURNAL?.mount(app,initial);
      syncJournalMetadata(initial);
      if(location.hash)requestAnimationFrame(()=>{try{document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();}catch{}});
    }
    globalThis.SITE_EXPERIENCE?.mount(app);
    if(history.state?.qView)restoreView(new URL(location.href),history.state.qView,navigationSequence);
    syncJournalNavigation();
  }).catch(() => {
    // Keep the meaningful server-rendered fallback; report failure, not a fake empty state.
    if(navigationSequence===initialSequence&&initial?.page==='journal'){
      showFailure(new URL(location.href),{historyMode:'none',preserveView:true});
    }
  });
  // Intent preloading precedes a click, but never downloads an article or an animation.
  const journalIntent=event=>{const a=event.target?.closest?.('a[href]');if(!a||a.hasAttribute('download')||a.hasAttribute('data-router-ignore'))return;const u=new URL(a.href,location.href);if(u.origin===location.origin&&/^\/(?:notes|dev)(?:\/|$)/.test(u.pathname))warmJournal();};
  document.addEventListener('pointerover',journalIntent,{passive:true});
  document.addEventListener('focusin',journalIntent);
  if(initial?.page!=='journal'){
    const idle=()=>{if('requestIdleCallback' in window)requestIdleCallback(warmJournal,{timeout:2000});else setTimeout(warmJournal,1000);};
    if(document.readyState==='complete')idle();else window.addEventListener('load',idle,{once:true});
  }
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target?.closest?.("a[href]");
    if (!link || link.hasAttribute("data-router-ignore") || link.hasAttribute("download") || (link.target && link.target.toLowerCase()!=="_self") || link.relList.contains("external")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !routeInfo(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) { saveView(); return; }
    saveView();
    event.preventDefault();
    void navigate(url);
  }, true);
  window.addEventListener('pagehide',saveView);
  window.addEventListener("popstate", () => { void navigate(new URL(location.href), { historyMode: "none", force: true }); });
})();
