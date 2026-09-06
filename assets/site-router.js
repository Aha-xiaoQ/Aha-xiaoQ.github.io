/* Xiao Q site router: keep the public site in one document while preserving
   real URLs, history, deep links, and the existing route renderers. */
(() => {
  const app = document.querySelector("#app");
  if (!app) return;

  // The router is intentionally installed at the end of every HTML entry.
  // It owns internal links before the browser can start a document request.
  // The HTML files remain valid deep-link fallbacks, but normal navigation is
  // always handled in this document.
  const routeInfo = (pathname) => {
    const path = pathname.replace(/\\/g, "/").replace(/\/+/g, "/");
    if (path === "/" || path.endsWith("/index.html") && path.split("/").filter(Boolean).length === 1) return { kind: "home", page: "home", title: "在下_小Q" };
    const detail = path.match(/\/(?:games)\/([^/]+)\/(?:index\.html)?$/);
    if (detail) {
      const itemSlug = detail[1];
      const item = globalThis.SITE_DATA?.items?.find((entry) => entry.primaryType === "game" && entry.slug === itemSlug);
      if (!item) return null;
      return { kind: "content", page: "detail", itemSlug, title: `${item.title} · 在下_小Q` };
    }
    const section = path.match(/\/(games|projects|tools|notes|about|method)\/(?:index\.html)?$/);
    if (!section) return null;
    const page = section[1] === "method" ? "tools" : section[1];
    const titles = { games: "游戏 · 在下_小Q", projects: "项目 · 在下_小Q", tools: "工具 · 在下_小Q", notes: "笔记 · 在下_小Q", about: "关于 · 在下_小Q" };
    return { kind: "content", page, title: titles[page] };
  };
  const baseForPath = (pathname) => {
    const segments = pathname.split("/").filter(Boolean);
    const depth = Math.max(0, segments.length - 1);
    return "../".repeat(depth);
  };
  // Resolve from the loaded router, not the current route or stale literals.
  const routerURL = new URL(document.currentScript.src, location.href);
  const assetHref = (name) => {
    const url = new URL(name, routerURL);
    url.search = routerURL.search;
    return url.href;
  };
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
  const waitForLink = (link) => {
    if (hasLoadedSheet(link)) return Promise.resolve(link);
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        link.removeEventListener("load", loaded);
        link.removeEventListener("error", failed);
        if (error) reject(error); else resolve(link);
      };
      const loaded = () => finish();
      const failed = () => finish(new Error("Stylesheet unavailable"));
      const timer = window.setTimeout(failed, 10000);
      link.addEventListener("load", loaded, { once: true });
      link.addEventListener("error", failed, { once: true });
      if (hasLoadedSheet(link)) loaded();
    });
  };
  const normalizeStylesheetLinks = () => document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]').forEach((link) => {
    const raw = link.getAttribute("href");
    if (raw && !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(raw)) link.href = new URL(raw, document.baseURI).href;
  });
  const styleFor = (kind) => {
    const path = stylePath[kind];
    const existing = [...document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]')].find((link) => {
      try { return new URL(link.href, location.href).pathname === path; } catch { return false; }
    });
    if (existing) {
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
    globalThis.SITE_GUESTBOOK_UNMOUNT?.();
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
  };
  const focusMain = () => {
    window.requestAnimationFrame(() => {
      const main = app.querySelector("#main");
      if (main instanceof HTMLElement) main.focus({ preventScroll: true });
    });
  };
  let navigating = false;
  let navigationSequence = 0;
  const navigate = async (url, { historyMode = "push", force = false } = {}) => {
    const info = routeInfo(url.pathname);
    if (!info || (navigating && !force)) return false;
    const navigationId = ++navigationSequence;
    if (force) {
      navigating = false;
      app.classList.remove("q-route-new", "q-route-new--in");
    }
    if (!force && url.pathname === location.pathname && !url.hash) return false;
    navigating = true;
    const commit = () => {
      applyStyles(info.kind);
      if (historyMode === "replace") window.history.replaceState({}, "", url.href);
      if (historyMode === "push") window.history.pushState({}, "", url.href);
      renderRoute(info);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      focusMain();
    };
    // Keep the current route visible while the destination stylesheet warms.
    // Only commit once the new DOM has its real layout rules, so an avatar can
    // never flash at its unstyled intrinsic size for one frame.
    try {
      await styleFor(info.kind);
    } catch {
      if (navigationId !== navigationSequence) return false;
      navigating = false;
      // Keep the old styled screen until normal document navigation takes over.
      window.location.assign(url.href);
      return false;
    }
    if (navigationId !== navigationSequence) return false;
    if (typeof document.startViewTransition === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const transition = document.startViewTransition(commit);
      transition.finished.then(() => {
        if (navigationId === navigationSequence) navigating = false;
      }, () => {
        if (navigationId === navigationSequence) navigating = false;
      });
      return true;
    }
    commit();
    app.classList.add("q-route-new");
    requestAnimationFrame(() => {
      if (navigationId !== navigationSequence) return;
      app.classList.add("q-route-new--in");
      window.setTimeout(() => {
        if (navigationId !== navigationSequence) return;
        app.classList.remove("q-route-new", "q-route-new--in");
        navigating = false;
      }, 240);
    });
    return true;
  };

  injectMotionStyle();
  normalizeStylesheetLinks();
  warmHomeAssets();
  const initial = routeInfo(location.pathname);
  if (initial) prepareStyles().then(() => {
    const current = routeInfo(location.pathname);
    if (current) applyStyles(current.kind);
  }).catch(() => {
    // Keep the server-rendered page and its active stylesheet on warmup failure.
  });
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target?.closest?.("a[href]");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !routeInfo(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return;
    event.preventDefault();
    void navigate(url);
  }, true);
  window.addEventListener("popstate", () => { void navigate(new URL(location.href), { historyMode: "none", force: true }); });
})();
