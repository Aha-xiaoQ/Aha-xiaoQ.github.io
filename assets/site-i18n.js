/* Translate visitor-facing nodes without replacing controls or user input. */
(() => {
  'use strict';
  const words = globalThis.SITE_EN || {};
  const storageKey = 'xiaoq-site-language';
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Storage is optional. */ }
  const requested = new URL(location.href).searchParams.get('lang');
  let language = ['zh', 'en'].includes(requested) ? requested : (saved === 'en' ? 'en' : 'zh');
  if (['zh', 'en'].includes(requested)) {
    try { localStorage.setItem(storageKey, language); } catch { /* Explicit links still work without storage. */ }
  }
  const originals = new WeakMap();
  const excluded = 'script,style,noscript,textarea,input,code,pre,[contenteditable],.guestbook-editor,[data-i18n-skip]';
  const attributes = ['aria-label', 'alt', 'title', 'placeholder'];
  let observer;
  function english(value) {
    if (Object.hasOwn(words, value)) return words[value];
    if (value.endsWith(' ↗')) return english(value.slice(0, -2)) + ' ↗';
    if (value.endsWith(' 游戏画面')) return english(value.slice(0, -5)) + ' game screenshot';
    if (value.endsWith(' · 在下_小Q的作品网站')) return english(value.slice(0, -' · 在下_小Q的作品网站'.length)) + ' · Projects by Aha_xiaoQ';
    if (value.endsWith(' · 在下_小Q')) return english(value.slice(0, -8)) + ' · Aha_xiaoQ';
    let m = value.match(/^显示全部 (\d+) 款游戏$/);
    if (m) return `Showing all ${m[1]} games`;
    m = value.match(/^(.+) · (\d+) 款$/);
    if (m) return `${english(m[1])} · ${m[2]} games`;
    m = value.match(/^(\d{4})\.(\d{2})\.(\d{2})(?:周|星期)([一二三四五六日天])$/);
    if (m) return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }).format(new Date(+m[1], +m[2] - 1, +m[3]));
    return value;
  }
  function translate(value, lang = language) {
    if (lang !== 'en' || typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    return value.slice(0, value.indexOf(trimmed)) + english(trimmed) + value.slice(value.indexOf(trimmed) + trimmed.length);
  }
  function localize(node, key, current, write) {
    let state = originals.get(node);
    if (!state) { state = new Map(); originals.set(node, state); }
    let record = state.get(key);
    if (!record || (current !== record.rendered && current !== record.source)) record = { source: current };
    const next = translate(record.source);
    record.rendered = next; state.set(key, record);
    if (next !== current) write(next);
  }
  function controls() {
    document.querySelectorAll('.topbar,.site-header .bar').forEach(header => {
      if (header.querySelector('.site-language')) return;
      const group = document.createElement('div');
      group.className = 'site-language'; group.dataset.i18nSkip = '';
      group.setAttribute('role', 'group');
      for (const [lang, label] of [['zh', '中文'], ['en', 'EN']]) {
        const button = document.createElement('button');
        button.type = 'button'; button.dataset.siteLanguage = lang; button.textContent = label;
        button.lang = lang === 'zh' ? 'zh-CN' : 'en';
        button.addEventListener('click', () => setLanguage(lang));
        group.append(button);
      }
      header.append(group);
    });
    document.querySelectorAll('.site-language').forEach(group => {
      group.setAttribute('aria-label', language === 'en' ? 'Language' : '语言');
      group.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.siteLanguage === language));
        button.setAttribute('aria-label', button.dataset.siteLanguage === 'en' ? 'English' : '中文');
      });
    });
  }
  function notices() {
    document.querySelectorAll('a[href]').forEach(link => {
      let path;
      try { path = new URL(link.href, location.href).pathname; } catch { return; }
      const internalApp = /\/games\/[^/]+\/play(?:\.html)?$/.test(path) || /\/tools\/quina-optics\/(?:index\.html)?$/.test(path);
      const chineseReading = /github\.com\/Aha-xiaoQ\/q-workflow-hub/.test(link.href);
      if (!internalApp && !chineseReading) return;
      if (link.querySelector('img')) return;
      let note = link.querySelector('.language-note');
      if (!note) { note = document.createElement('small'); note.className = 'language-note'; note.dataset.i18nSkip = ''; link.append(note); }
      note.textContent = internalApp ? 'Chinese interface' : 'Chinese content';
      note.hidden = language !== 'en';
    });
  }
  function apply() {
    if (!globalThis.document?.body) return;
    observer?.disconnect();
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    controls();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement?.closest(excluded)) continue;
      localize(node, 'text', node.nodeValue, value => { node.nodeValue = value; });
    }
    document.querySelectorAll('[aria-label],[alt],[title],[placeholder]').forEach(node => {
      if (node.closest(excluded)) return;
      for (const key of attributes) if (node.hasAttribute(key)) localize(node, key, node.getAttribute(key), value => node.setAttribute(key, value));
    });
    localize(document, 'title', document.title, value => { document.title = value; });
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').forEach(node => localize(node, 'content', node.content, value => { node.content = value; }));
    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.content = language === 'en' ? 'en_US' : 'zh_CN';
    notices();
    observer?.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
  }
  function setLanguage(lang) {
    if (!['zh', 'en'].includes(lang)) return;
    language = lang;
    try { localStorage.setItem(storageKey, lang); } catch { /* The current page still switches. */ }
    // A manual choice supersedes a language specified by a shared link.
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) { url.searchParams.set('lang', lang); history.replaceState(history.state, '', url); }
    apply();
    document.dispatchEvent(new CustomEvent('site-language-change', { detail: { language } }));
  }
  function route(info) {
    const descriptions = {
      home: '做项目，也做工具，偶尔做点游戏。',
      projects: '从想法到作品，记录每一次动手实践。',
      games: '从经典关卡到跨界角色，选择一款开始冒险。',
      tools: '实用小工具与可亲手操作的实验。',
      notes: '学习、折腾和动手过程中的随手记录。',
      about: '在下_小Q。做项目，也做工具，偶尔做点游戏。',
    };
    const description = descriptions[info.page] || globalThis.SITE_DATA?.items?.find(item => item.slug === info.itemSlug)?.summary || '请到游戏页查看当前作品。';
    for (const [kind, key, value] of [
      ['name', 'description', description], ['property', 'og:title', info.title],
      ['property', 'og:description', description], ['name', 'twitter:title', info.title],
      ['name', 'twitter:description', description], ['property', 'og:url', location.href],
    ]) {
      let meta = document.querySelector(`meta[${kind}="${key}"]`);
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute(kind, key); document.head.append(meta); }
      originals.delete(meta); meta.content = value;
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = location.href.split('?')[0].split('#')[0];
    apply();
  }
  globalThis.SITE_I18N = Object.freeze({ get language() { return language; }, translate, setLanguage, apply, route });
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  const start = () => {
    // Give every outer page its own browser/share metadata, including pet detail.
    const description = document.querySelector('meta[name="description"]')?.content || document.title;
    for (const [kind, key, value] of [
      ['property', 'og:title', document.title], ['property', 'og:description', description],
      ['name', 'twitter:title', document.title], ['name', 'twitter:description', description],
      ['property', 'og:locale', 'zh_CN'],
    ]) {
      if (document.querySelector(`meta[${kind}="${key}"]`)) continue;
      const meta = document.createElement('meta'); meta.setAttribute(kind, key); meta.content = value; document.head.append(meta);
    }
    observer = new MutationObserver(apply); apply();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
