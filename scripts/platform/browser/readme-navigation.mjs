/** Test README entry intent before any test code switches the page language. */
import assert from 'node:assert/strict';
import {evaluate, until} from './cdp.mjs';

export function entryCases(entries, origin) {
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) throw Error('README browser checks require the local artifact server');
  const cases = [];
  for (const entry of entries) {
    for (const pathname of ['/', '/notes/']) {
      const matches = entry.links.filter(link => new URL(link.href).pathname === pathname);
      if (matches.length !== 1) throw Error(entry.file + ': missing or ambiguous browser entry ' + pathname);
      const u = new URL(matches[0].href);
      if (u.searchParams.getAll('lang').length !== 1 || u.searchParams.get('lang') !== entry.locale) {
        throw Error(entry.file + ': wrong browser entry language');
      }
      cases.push({file:entry.file, language:entry.locale, sourceURL:u.href,
        url:origin + u.pathname + u.search + u.hash, pathname});
    }
  }
  if (cases.length !== 4) throw Error('Both README languages must be checked');
  return cases;
}

export async function auditReadmeNavigation(browser, entries, origin) {
  const results = [];
  const ready = url => 'location.href===' + JSON.stringify(url) +
    " && document.readyState==='complete' && globalThis.SITE_I18N?.version==='platform-r45' && !!globalThis.SITE_ROUTER";
  for (const item of entryCases(entries, origin)) {
    try {
      const opposite = item.language === 'zh' ? 'en' : 'zh';
      const seed = origin + '/?lang=' + opposite;
      await browser.cdp.send('Page.navigate', {url:seed}, browser.sessionId);
      await until(browser, ready(seed));
      await evaluate(browser, `localStorage.setItem('xiaoq-site-language',${JSON.stringify(opposite)});true`);
      await browser.cdp.send('Page.navigate', {url:item.url}, browser.sessionId);
      await until(browser, ready(item.url));
      const state = await evaluate(browser, `({locale:SITE_I18N.language, lang:document.documentElement.lang,
        selected:[...document.querySelectorAll('[data-site-language][aria-pressed="true"]')].map(x=>x.dataset.siteLanguage),
        saved:localStorage.getItem('xiaoq-site-language')})`);
      assert.deepEqual(state, {locale:item.language, lang:item.language === 'zh' ? 'zh-CN' : 'en', selected:[item.language], saved:item.language});
      await evaluate(browser, 'globalThis.__readmeReloadSentinel=true;true');
      await browser.cdp.send('Page.reload', {}, browser.sessionId);
      await until(browser, 'globalThis.__readmeReloadSentinel!==true && (' + ready(item.url) + ')');
      assert.equal(await evaluate(browser, 'SITE_I18N.language'), item.language);
      const next = origin + (item.pathname === '/' ? '/notes/' : '/') + '?q=readme-route';
      await evaluate(browser, 'SITE_ROUTER.navigate(new URL(' + JSON.stringify(next) + ')).then(()=>true)');
      await until(browser, ready(next));
      assert.equal(await evaluate(browser, 'SITE_I18N.language'), item.language);
      await evaluate(browser, 'history.back();true');
      await until(browser, ready(item.url));
      assert.equal(await evaluate(browser, 'SITE_I18N.language'), item.language);
      await evaluate(browser, 'history.forward();true');
      await until(browser, ready(next));
      assert.equal(await evaluate(browser, 'SITE_I18N.language'), item.language);
      results.push({...item, passed:true});
    } catch (error) { results.push({...item, passed:false, detail:error.message}); }
  }
  return results;
}
