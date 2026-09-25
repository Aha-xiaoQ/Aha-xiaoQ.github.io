/* One locale owner for native entries, SPA routes, and deferred content. */
(() => {
  'use strict';
  if (globalThis.SITE_I18N?.version === 'platform-r45') return;
  const document = globalThis.document;
  if (!document) return;
  const storageKey = 'xiaoq-site-language';
  const supported = new Set(['zh', 'en']);
  const textRecords = new WeakMap();
  const attributeRecords = new WeakMap();
  const languageRecords = new WeakMap();
  const pendingRoots = new Set();
  const protectedText = 'script,style,noscript,textarea,input,code,pre,svg,math';
  const protectedAttributes = 'script,style,noscript';
  const attributes = ['aria-label', 'aria-description', 'alt', 'title', 'placeholder'];
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const sourceWords = globalThis.SITE_EN || Object.create(null);
  const additions = Object.create(null);
  let observer, scheduled = false, applying = false, language, disposed = false;
  let saved = null;
  try { saved = localStorage.getItem(storageKey); } catch { /* Optional storage. */ }
  const fromURL = () => {
    const value = new URL(location.href).searchParams.get('lang');
    return supported.has(value) ? value : null;
  };
  language = fromURL() || (saved === 'en' ? 'en' : 'zh');
  function remember() { try { localStorage.setItem(storageKey, language); } catch { /* URL retains the explicit choice. */ } }
  if (fromURL()) remember();

  function exact(value) {
    if (own(additions, value)) return additions[value];
    return own(sourceWords, value) ? sourceWords[value] : undefined;
  }
  function english(value, depth = 0) {
    const match = exact(value);
    if (match !== undefined) return match;
    if (depth > 5) return value;
    const next = text => english(text, depth + 1);
    for (const [suffix, replacement] of [
      [' · 在下_小Q的作品网站', ' · Projects by Aha_xiaoQ'], [' · 在下_小Q', ' · Aha_xiaoQ'],
      [' 游戏画面', ' game screenshot'], ['游戏预览', ' game preview'], ['（在新标签页打开）', ' (opens in a new tab)'],
      [' ↗', ' ↗'], [' →', ' →'],
    ]) if (value.endsWith(suffix)) return next(value.slice(0, -suffix.length)) + replacement;
    let m;
    if ((m = value.match(/^找到 (\d+) 项 · 第 (\d+) \/ (\d+) 页$/))) return `${m[1]} ${m[1] === '1' ? 'result' : 'results'} · Page ${m[2]} / ${m[3]}`;
    if ((m = value.match(/^显示 (\d+) 个项目(?: · 第 (\d+) \/ (\d+) 页)?$/))) return `${m[1]} ${m[1] === '1' ? 'project' : 'projects'}${m[2] ? ` · Page ${m[2]} / ${m[3]}` : ''}`;
    if ((m = value.match(/^(\d+) (?:项记录|个项目) · 第 (\d+) \/ (\d+) 页$/))) return `${m[1]} entries · Page ${m[2]} / ${m[3]}`;
    if ((m = value.match(/^显示全部 (\d+) 款游戏$/))) return `Showing all ${m[1]} games`;
    if ((m = value.match(/^(.+) · (\d+) 款$/))) return `${next(m[1])} · ${m[2]} games`;
    if ((m = value.match(/^(相关参考|历史版本与过程资料) · (\d+)$/))) return `${next(m[1])} · ${m[2]}`;
    if ((m = value.match(/^查看项目[：:]\s*(.+)$/))) return `View project: ${next(m[1])}`;
    // Only localize complete action labels, not the first word of an untranslated article.
    if ((m = value.match(/^(查看|打开) (.+)$/))) {
      const subject = next(m[2]);
      if (!/[\u3400-\u9fff]/u.test(subject)) return `${m[1] === '查看' ? 'View' : 'Open'} ${subject}`;
      return value;
    }
    if ((m = value.match(/^共享记录更新于 (\d{4}-\d{2}-\d{2}) · 非 GitHub 实时看板$/))) return `Shared records updated ${m[1]} · Not a live GitHub board`;
    if ((m = value.match(/^世界 (\d{1,2})$/))) return `World ${m[1]}`;
    if ((m = value.match(/^开发源码 ([0-9]+(?:\.[0-9]+)+)$/))) return `Development source ${m[1]}`;
    if ((m = value.match(/^观看 (.+) 视频$/))) {
      const subject = next(m[1]);
      if (!/[\u3400-\u9fff]/u.test(subject)) return `Watch ${subject} video`;
    }
    if ((m = value.match(/^(.+)：视频待发布$/))) {
      const subject = next(m[1]);
      if (!/[\u3400-\u9fff]/u.test(subject)) return `${subject}: video coming soon`;
    }
    if ((m = value.match(/^下载源码（(.+)）$/))) return `Download source (${m[1]})`;
    if ((m = value.match(/^开发版 ([0-9.]+) · (.+)$/))) return `Development ${m[1]} · ${next(m[2])}`;
    if ((m = value.match(/^记录日期：\s*(\d{4}-\d{2}-\d{2})$/))) return `Updated: ${m[1]}`;
    if ((m = value.match(/^收录日期：(.+) · 原始文件：(\d+) 字节$/))) return `Recorded: ${m[1]} · Original file: ${m[2]} bytes`;
    if ((m = value.match(/^(\d{4})\.(\d{2})\.(\d{2})(?:周|星期)([一二三四五六日天])$/))) {
      const date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      if (date.getUTCFullYear() === +m[1] && date.getUTCMonth() === +m[2] - 1 && date.getUTCDate() === +m[3]) {
        return new Intl.DateTimeFormat('en-GB', {year:'numeric', month:'short', day:'numeric', weekday:'short', timeZone:'UTC'}).format(date);
      }
    }
    if (value.includes(' · ')) return value.split(' · ').map(next).join(' · ');
    return value;
  }
  function translate(value, lang = language) {
    if (lang !== 'en' || typeof value !== 'string') return value;
    const text = value.trim();
    if (!text) return value;
    const offset = value.indexOf(text);
    return value.slice(0, offset) + english(text) + value.slice(offset + text.length);
  }
  // New modules can use stable message IDs; legacy source-string lookup remains compatible.
  function message(id, values = {}, lang = language) {
    const catalogs = globalThis.SITE_LOCALE_KEYS || {};
    if (!own(catalogs, id) || !supported.has(lang) || !values || typeof values !== 'object' || Array.isArray(values)) throw Error('Invalid localized message: ' + id);
    return catalogs[id][lang].replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (_, name) => {
      if (!own(values, name) || !['string', 'number'].includes(typeof values[name]) || typeof values[name] === 'number' && !Number.isFinite(values[name])) throw Error('Missing message value: ' + name);
      return String(values[name]);
    });
  }
  function protectedNode(element, text = false) {
    if (!element) return true;
    if (element.closest(text ? protectedText : protectedAttributes)) return true;
    if (element.closest('[data-i18n-skip],.guestbook-editor')) return true;
    const translateRule = element.closest('[translate]');
    if (translateRule?.getAttribute('translate')?.toLowerCase() === 'no') return true;
    const editor = element.closest('[contenteditable]');
    return !!editor && editor.getAttribute('contenteditable')?.toLowerCase() !== 'false';
  }
  function localize(node, key, current, write) {
    const store = key === 'text' ? textRecords : attributeRecords;
    let records = store.get(node);
    if (!records) { records = new Map(); store.set(node, records); }
    let record = records.get(key);
    if (!record || (current !== record.rendered && current !== record.source)) record = {source:current};
    const rendered = translate(record.source);
    records.set(key, {...record, rendered});
    if (rendered !== current) write(rendered);
    if (key === 'text') sourceLanguage(node, rendered);
  }
  function sourceLanguage(node, rendered) {
    const element = node.parentElement;
    if (!element || element.closest('[translate="no"],code,pre,svg,math,[data-i18n-skip]')) return;
    // Mark only untranslated leaf copy. Never change a mixed paragraph's language
    // merely because one nested project name is Chinese.
    const eligible = element.childElementCount === 0 && /[\u3400-\u9fff]/u.test(rendered);
    if (language === 'en' && eligible) {
      if (!languageRecords.has(element) && !element.hasAttribute('lang')) {
        languageRecords.set(element, {lang:null});
        element.setAttribute('lang', 'zh-CN'); element.dataset.originalLanguage = '';
      }
    } else if (languageRecords.has(element)) {
      // Restore only the marker owned by this locale runtime.
      if (element.hasAttribute('data-original-language')) {
        element.removeAttribute('lang'); element.removeAttribute('data-original-language');
      }
      languageRecords.delete(element);
    }
  }
  function elementAttributes(element) {
    if (protectedNode(element)) return;
    for (const key of attributes) if (element.hasAttribute(key)) {
      localize(element, key, element.getAttribute(key), value => element.setAttribute(key, value));
    }
  }
  function subtree(root) {
    if (!root || root.isConnected === false) return;
    if (root.nodeType === 3) {
      if (!protectedNode(root.parentElement, true)) localize(root, 'text', root.nodeValue, value => { root.nodeValue = value; });
      return;
    }
    if (root.nodeType === 1) elementAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === 3) return protectedNode(node.parentElement, true) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        // Do not walk animation SVG trees, scripts, or original code. Their outer
        // accessible label may still be translated when not explicitly protected.
        if (node.matches(protectedText) || protectedNode(node, true)) {
          elementAttributes(node); return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === 3) localize(node, 'text', node.nodeValue, value => { node.nodeValue = value; });
      else elementAttributes(node);
    }
  }
  function controls() {
    document.querySelectorAll('.topbar,.site-header .bar').forEach(header => {
      let group = header.querySelector('.site-language');
      if (!group) {
        group = document.createElement('div'); group.className = 'site-language'; group.dataset.i18nSkip = '';
        group.setAttribute('role', 'group');
        for (const [lang, label] of [['zh','中文'],['en','EN']]) {
          const button = document.createElement('button'); button.type = 'button'; button.dataset.siteLanguage = lang;
          button.textContent = label; button.lang = lang === 'zh' ? 'zh-CN' : 'en';
          group.append(button);
        }
        header.append(group);
      }
      group.setAttribute('aria-label', language === 'en' ? 'Language' : '语言');
      group.querySelectorAll('[data-site-language]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.siteLanguage === language));
        button.setAttribute('aria-label', button.dataset.siteLanguage === 'en' ? 'English' : '中文');
      });
    });
  }
  function notices(root = document) {
    const links = root.matches?.('a[href]') ? [root] : root.querySelectorAll?.('a[href]') || [];
    for (const link of links) {
      let url; try { url = new URL(link.href, location.href); } catch { continue; }
      const ownApp = url.origin === location.origin && (/\/games\/[^/]+\/play(?:\.html)?$/.test(url.pathname) || /\/tools\/quina-optics\/(?:index\.html)?$/.test(url.pathname));
      const reading = url.hostname === 'github.com' && /^\/Aha-xiaoQ\/q-workflow-hub(?:\/|$)/.test(url.pathname);
      if ((!ownApp && !reading) || link.querySelector('img')) continue;
      let note = link.querySelector('.language-note');
      if (!note) { note = document.createElement('small'); note.className = 'language-note'; note.dataset.i18nSkip = ''; link.append(note); }
      const label = ownApp ? 'Chinese interface' : 'Chinese content';
      if (note.textContent !== label) note.textContent = label;
      note.hidden = language !== 'en';
    }
  }
  function metadata() {
    localize(document, 'title', document.title, value => { document.title = value; });
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').forEach(node => {
      localize(node, 'content', node.content, value => { node.content = value; });
    });
    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.content = language === 'en' ? 'en_US' : 'zh_CN';
  }
  function sourceNotes() {
    document.querySelectorAll('[data-source-language-note]').forEach(note => {
      note.hidden = !(language === 'en' && note.closest('.journal')?.querySelector('[data-original-language]'));
    });
  }
  function observe() {
    observer?.observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:attributes});
  }
  function apply(root = document.body) {
    if (!document.body || applying || disposed) return;
    applying = true; observer?.disconnect();
    try {
      document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
      controls(); subtree(root); metadata(); notices(root);
      sourceNotes();
    } finally { applying = false; observe(); }
  }
  function enqueue(records) {
    if (disposed) return;
    for (const record of records) {
      if (record.type === 'attributes') pendingRoots.add(record.target);
      else if (record.type === 'characterData') pendingRoots.add(record.target);
      else for (const node of record.addedNodes) if (node.nodeType === 1 || node.nodeType === 3) pendingRoots.add(node);
    }
    if (scheduled || !pendingRoots.size) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (disposed || applying) return;
      const roots = [...pendingRoots].filter(node => node.isConnected); pendingRoots.clear();
      if (!roots.length) return;
      applying = true; observer?.disconnect();
      try {
        const top = roots.filter(node => !roots.some(other => other !== node && other.contains?.(node)));
        for (const node of top) {
          if (node.nodeType === 1 && (node.matches('.topbar,.site-header') || node.querySelector('.topbar,.site-header'))) controls();
          if (node === document.head || document.head.contains(node)) metadata(); else { subtree(node); notices(node); }
        }
        sourceNotes();
      } finally { applying = false; observe(); }
    });
  }
  function notify() { document.dispatchEvent(new CustomEvent('site-language-change', {detail:{language}})); }
  function setLanguage(lang, {updateURL = true, persist = true, announce = true} = {}) {
    if (!supported.has(lang) || disposed) return;
    const changed = language !== lang; language = lang;
    if (persist) remember();
    if (updateURL) {
      const url = new URL(location.href); url.searchParams.set('lang', lang);
      history.replaceState(history.state, '', url);
    }
    apply(); if (changed && announce) notify();
  }
  function route(info = {}) {
    const requested = fromURL(); const changed = !!requested && requested !== language;
    if (requested) { language = requested; remember(); }
    const descriptions = {
      home:'做项目，也做工具，偶尔做点游戏。', projects:'从想法到作品，记录每一次动手实践。',
      games:'从经典关卡到跨界角色，选择一款开始冒险。', tools:'实用小工具与可亲手操作的实验。',
      notes:'项目进展、开发源码、地图模板与参与方式。', dev:'项目进展与开发资料，了解当前计划和参与方式。',
      about:'在下_小Q。做项目，也做工具，偶尔做点游戏。', journal:'项目进展、开发源码、地图模板与参与方式。',
      visitorHelp:'试玩作品、查看操作说明与反馈问题。', search:'查找游戏、工具、项目与开发资料。',
      notFound:'此地址没有对应的公开页面，可返回首页、查找作品或查看开发资料。',
    };
    const intro = info.page === 'journal' ? globalThis.SITE_JOURNAL?.describe(info.journalPath || location.pathname)?.intro : '';
    const description = intro || descriptions[info.page] || globalThis.SITE_DATA?.items?.find(item => item.slug === info.itemSlug)?.summary || '项目、游戏、工具与制作记录。';
    const pageURL = new URL(location.href); pageURL.search = ''; pageURL.hash = '';
    const title = info.title || document.title;
    if (info.title) { attributeRecords.delete(document); document.title = info.title; }
    for (const [kind,key,value] of [
      ['name','description',description], ['property','og:title',title], ['property','og:description',description],
      ['name','twitter:title',title], ['name','twitter:description',description], ['property','og:url',pageURL.href],
    ]) {
      let node = document.querySelector(`meta[${kind}="${key}"]`);
      if (!node) { node = document.createElement('meta'); node.setAttribute(kind,key); document.head.append(node); }
      attributeRecords.delete(node); node.content = value;
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = pageURL.href;
    apply(); if (changed) notify();
  }
  function register(messages) {
    if (!messages || typeof messages !== 'object' || Array.isArray(messages)) throw Error('Invalid locale messages');
    for (const [key,value] of Object.entries(messages)) {
      if (!key || typeof value !== 'string' || !value.trim() || ['__proto__','constructor','prototype'].includes(key)) throw Error('Invalid locale message');
    }
    Object.assign(additions, messages); apply();
  }
  function click(event) {
    const button = event.target?.closest?.('button[data-site-language]');
    if (button?.closest('.site-language')) setLanguage(button.dataset.siteLanguage);
  }
  function popstate() { const requested = fromURL(); if (requested) setLanguage(requested, {updateURL:false}); }
  function storage(event) { if (event.key === storageKey && supported.has(event.newValue) && !fromURL()) setLanguage(event.newValue, {updateURL:false,persist:false}); }
  function pageshow(event) {
    if (!event.persisted) return;
    let preferred=fromURL();
    if (!preferred) { try { const value=localStorage.getItem(storageKey); if(supported.has(value))preferred=value; } catch {} }
    if(preferred)setLanguage(preferred,{updateURL:false,persist:false});else apply();
  }
  const start = () => {
    if (disposed) return;
    const description = document.querySelector('meta[name="description"]')?.content || document.title;
    for (const [property,value] of [['og:title',document.title],['og:description',description],['og:locale','zh_CN']]) {
      if (document.querySelector(`meta[property="${property}"]`)) continue;
      const meta=document.createElement('meta'); meta.setAttribute('property',property); meta.content=value; document.head.append(meta);
    }
    for (const [name,value] of [['twitter:title',document.title],['twitter:description',description]]) {
      if (document.querySelector(`meta[name="${name}"]`)) continue;
      const meta=document.createElement('meta'); meta.name=name; meta.content=value; document.head.append(meta);
    }
    observer = new MutationObserver(enqueue);
    register(globalThis.SITE_LOCALE_MESSAGES?.en || {});
    document.addEventListener('click', click);
    window.addEventListener('popstate', popstate);
    window.addEventListener('storage', storage); window.addEventListener('pageshow', pageshow);
    apply();
  };
  function dispose() {
    disposed = true; observer?.disconnect(); pendingRoots.clear();
    document.removeEventListener('DOMContentLoaded', start);
    document.removeEventListener('click', click); window.removeEventListener('popstate', popstate); window.removeEventListener('storage', storage); window.removeEventListener('pageshow', pageshow);
  }
  globalThis.SITE_I18N = Object.freeze({version:'platform-r45', get language() {return language;}, translate, message, setLanguage, apply, route, register, dispose});
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
