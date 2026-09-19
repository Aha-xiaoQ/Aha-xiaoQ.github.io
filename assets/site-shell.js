(() => {
  const guestbookModuleURL = new URL('./guestbook.js?v=dd5b8227f5b3e07a8da6', document.currentScript.src).href;
  const A=globalThis.SITE_ACTIONS;
  const data = globalThis.SITE_DATA;
  const taxonomy = globalThis.SITE_TAXONOMY;
  const gameCategories = Array.isArray(taxonomy?.gameCategories) ? taxonomy.gameCategories : [];
  const gameCategoryById = new Map(gameCategories.map((category) => [category.id, category]));
  const body = document.body;
  let base = body.dataset.base || "";
  let page = body.dataset.page;
  let itemSlug = body.dataset.itemSlug || "";
  const initialRoot = document.querySelector("#app");
  let activeRoot = initialRoot;
  if (!data || !taxonomy || !initialRoot) return;
  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  // Local file previews must never depend on a browser treating a directory as
  // its index document. Keep protocol URLs intact; make every internal route
  // an explicit HTML document instead.
  const href = (path = "") => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(path)) return path;
    const documentPath = path === "" ? "index.html" : (path.endsWith("/") ? `${path}index.html` : path);
    return `${base}${documentPath}`;
  };
  const sortByDate = (list, key) => [...list].sort((a,b) => (b[key] || "").localeCompare(a[key] || "") || a.id.localeCompare(b.id));
  const navItems = [["", "首页", "home"], ["projects/", "项目", "projects"], ["games/", "游戏", "games"], ["tools/", "工具", "tools"], ["notes/", "开发", "notes"], ["about/", "关于", "about"]];
  const navLink = ([path, label, key]) => `<a href="${href(path)}" data-nav-key="${key}"${page === key || (page === "journal" && key === "notes") || (page === "detail" && key === "games") ? ' aria-current="page"' : ""}>${label}</a>`;
  const registeredLogo = globalThis.SITE_ASSETS?.brand?.logo;
  const siteLogo = registeredLogo?.src || "assets/q-logo-pixel-framed.svg?v=dd5b8227f5b3e07a8da6";
  const siteLogoAlt = registeredLogo?.alt || "Q 标识";
  const header = () => `<a class="skip" href="#main">跳到主要内容</a><header class="site-header"><div class="shell bar"><a class="brand" href="${href("")}" aria-label="返回首页"><img src="${href(siteLogo)}" alt="${esc(siteLogoAlt)}" width="42" height="42" decoding="async">${esc(data.profile.displayName)}</a><nav class="site-nav" aria-label="主导航" style="flex-wrap:wrap">${navItems.map(navLink).join("")}</nav><a class="q-search-launch" data-site-search href="/search/" aria-label="搜索全站">搜索</a></div></header>`;
  const footerIcon = (label) => {
    const paths = {
      GitHub: '<path d="M6 12.8c-3 1-3-1.5-4.2-1.8M10.2 14v-2.5c.1-.8-.2-1.5-.7-2 2.4-.3 4.9-1.2 4.9-5.3A4.1 4.1 0 0 0 13.3 1.4 3.8 3.8 0 0 0 13.2-1 4 4 0 0 0 10.4.1a9.7 9.7 0 0 0-4.8 0A4 4 0 0 0 2.8-1a3.8 3.8 0 0 0-.1 2.4 4.1 4.1 0 0 0-1.1 2.8c0 4.1 2.5 5 4.9 5.3-.5.5-.8 1.2-.7 2V14" />',
      Bilibili: '<path d="M3 4.7h10v7.2H3zM5.3 2.4l1.4 1.4m2.6-1.4L8 3.8M6 7.6h.1m3.8 0h.1M5.7 10c1.4.8 3.2.8 4.6 0" />',
      邮箱: '<path d="M2.2 4.1h11.6v7.8H2.2zM2.7 4.7 8 8.6l5.3-3.9" />'
    };
    return `<svg class="q-footer-icon" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${paths[label] || ""}</svg>`;
  };
  const contact = (link) => `<a ${A.attributes(link.url,{className:'q-footer-link',variant:'quiet',ariaLabel:link.kind==='email'?'发邮件给在下_小Q':'打开在下_小Q的 '+link.label})}>${footerIcon(link.label)}<span class="q-action-label">${A.esc(link.label)}</span></a>`;
  const footer = () => `<footer class="site-footer"><div class="shell footer-inner"><span>在下_小Q</span><span class="footer-links">${data.profile.links.map(contact).join("")}</span></div></footer>`;
  const head = (eyebrow, title, lede, home = false) => `<section class="page-head${home ? " page-head--home" : ""}"><div class="shell page-head__body"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ""}</div></section>`;
  const empty = (title) => `<article class="entry entry--empty"><h3>${esc(title)}</h3></article>`;
  const itemCategories = (item) => (item.categories || []).map((id) => gameCategoryById.get(id)).filter(Boolean);
  const tags = (item) => { const categories = itemCategories(item); return `<div class="meta" aria-label="补充标签">${item.tags.filter((tag) => !categories.some((category) => category.label === tag)).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</div>`; };
  const localEvidence = (item) => data.evidence.find((entry) => item.evidenceIds.includes(entry.id));
  const gameDownload = item => item.downloadUrl ? A.link('下载游戏',href(item.downloadUrl),{className:'button button--quiet',variant:'quiet',download:true}) : "";
  // WORKSHOP-R07: one pure renderer is used for both static and dynamic lists.
  const feature = (item, index = 0) => globalThis.SITE_WORKSHOP.projectCard(item, index, {base});
  const collection = name => globalThis.SITE_WORKSHOP.renderCollection(name, data, taxonomy, {base});
  const renderHome = () => { const featured = data.items.filter((item) => item.visibility === "public" && item.featuredRank).sort((a,b) => a.featuredRank-b.featuredRank).slice(0,3); const nowText = data.profile.now?.title || data.profile.now?.summary || "最近在整理新的作品。"; return `${head("CURRENT INDEX", data.profile.displayName, data.profile.oneLine || "项目、工具、游戏与制作记录。", true)}<main id="main" tabindex="-1"><section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">现在</p><h2>当前重点</h2></div></div><div class="now-panel"><strong>NOW</strong><p>${esc(nowText)}</p></div></div></section><section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">ENTRANCES</p><h2>从项目开始</h2></div></div><div class="entry-grid"><a class="entry" href="${href("projects/")}"><p class="entry__kind">重点入口</p><h3>项目</h3><p>看看做过的项目和制作过程。</p><span class="entry__link">浏览项目</span></a><a class="entry" href="${href("games/")}"><p class="entry__kind">可玩实验</p><h3>游戏</h3><p>打开游戏，亲自玩一玩。</p><span class="entry__link">浏览游戏</span></a><a class="entry" href="${href("tools/")}"><p class="entry__kind">实用工具</p><h3>工具</h3><p>发现一些实用的小工具。</p><span class="entry__link">浏览工具</span></a></div></div></section>${featured.length ? `<section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">FEATURED</p><h2>精选入口</h2></div></div><div class="entry-grid">${featured.map(feature).join("")}</div></div></section>` : ""}</main>`; };
  const renderProjects = () => head("PROJECT INDEX", "项目", "从想法到作品，记录每一次动手实践。") + collection('projects');
  const renderGames = () => head("GAME SHELF", "游戏", "从经典关卡到跨界角色，选择一款开始冒险。") + collection('games');
  const renderTools = () => head("TOOLS", "工具", "实用小工具与可亲手操作的实验。") + collection('tools');
  const renderNotes = () => { const notes = sortByDate(data.notes.filter((note) => note.visibility === "public"), "publishedAt"); return `${head("NOTES", "笔记", "学习、折腾和动手过程中的随手记录。")}<main id="main" tabindex="-1"><section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">时间</p><h2>笔记本</h2></div></div><div class="entry-grid">${notes.length ? notes.slice(0,20).map((note) => `<article class="entry"><p class="entry__kind">${esc(note.publishedAt)} / ${esc(note.type)}</p><h3>${esc(note.title)}</h3><p>${esc(note.summary)}</p></article>`).join("") : empty("暂无笔记")}</div></div></section></main>`; };
  const renderAbout = () => head("ABOUT", "关于", data.profile.publicStatement || "做项目，也做工具，偶尔做点游戏。") + globalThis.SITE_SHOWCASE.aboutMain(data.profile, base, globalThis.SITE_ABOUT_SUPPORT || {});
  const renderDetail = () => {
    const item = data.items.find(entry => entry.slug === itemSlug && entry.visibility === 'public' && entry.lifecycleStatus !== 'archived');
    if (!item) return head('ARCHIVED', '该游戏已下架', '请到游戏页查看当前作品。') + '<main id="main" tabindex="-1"><div class="shell"><a class="button" href="/games/">查看游戏</a></div></main>';
    const proof = (data.evidence || []).find(entry => (item.evidenceIds || []).includes(entry.id));
    return head('GAME',item.title,item.summary) + globalThis.SITE_JOURNEY.gameMain(item, proof);
  };
  const renderVisitorHelp = () => head('GET STARTED','试玩帮助','体验作品、查看源码，遇到问题也有去处。') + '<main id="main" tabindex="-1"><div class="shell">'+globalThis.SITE_JOURNEY.helpPage()+'</div></main>';
  const renderNotFound = () => head('NOT FOUND','页面未找到','这个地址没有对应的公开页面。') + '<main id="main" tabindex="-1"><div class="shell">'+globalThis.SITE_JOURNEY.notFound()+'</div></main>';
  // JOURNAL-R04: data-driven content, shared header/head/footer stay authoritative.
  const renderJournal = () => {
    const meta=globalThis.SITE_JOURNAL?.describe(location.pathname)||{title:'开发',intro:'看看作品如何从想法变成现实，也欢迎一起动手。',eyebrow:'IN THE MAKING'};
    return head(meta.eyebrow,meta.title,meta.intro)+'<main id="main" tabindex="-1"><div class="shell" data-journal-slot></div></main>';
  };
  const renderSearch = () => head("FIND SOMETHING GOOD","搜索","查找游戏、工具、项目与开发资料。")+'<main id="main" tabindex="-1"><div class="shell" data-site-search-root></div></main>';
  const renderers = { visitorHelp:renderVisitorHelp, notFound:renderNotFound, search:renderSearch, journal:renderJournal, home: renderHome, projects: renderProjects, games: renderGames, tools: renderTools, notes: renderNotes, about: renderAbout, detail: renderDetail };
  const bindFilters = () => { const buttons = [...activeRoot.querySelectorAll("[data-filter]")]; const rows = [...activeRoot.querySelectorAll("#game-list .media-row")]; const summary = activeRoot.querySelector("[data-filter-summary]"); if (!buttons.length || !rows.length) return; const apply = (filter) => { let shown = 0; buttons.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.filter === filter))); rows.forEach((row) => { const matches = filter === "all" || row.dataset.categories.split(" ").includes(filter); row.hidden = !matches; if (matches) shown += 1; }); if (summary) { const button = buttons.find((item) => item.dataset.filter === filter); const label = gameCategoryById.get(filter)?.label || "全部游戏"; summary.textContent = filter === "all" ? `显示全部 ${shown} 款游戏` : `${label} · ${shown} 款`; } }; buttons.forEach((button) => button.addEventListener("click", () => apply(button.dataset.filter))); apply(buttons.find((button) => button.getAttribute("aria-pressed") === "true")?.dataset.filter || "all"); };
  const renderShell = ({ targetRoot = activeRoot, nextPage = page, nextBase = base, nextItemSlug = itemSlug } = {}) => { activeRoot = targetRoot; page = nextPage; base = nextBase; itemSlug = nextItemSlug; body.dataset.page = page === "journal" ? "notes" : page; body.dataset.itemSlug = itemSlug; const prerendered = activeRoot.dataset.prerendered === "true"; activeRoot.removeAttribute("data-prerendered"); if (!prerendered) activeRoot.innerHTML = header() + (renderers[page] || renderHome)() + footer(); bindFilters(); globalThis.SITE_MEDIA_RUNTIME?.mount(activeRoot); import(guestbookModuleURL).then(module => module.mount(targetRoot, body.dataset.page)).catch(() => {}); };
  globalThis.SITE_SHELL_RENDER = renderShell;
  if (body.dataset.page) renderShell();
})();
