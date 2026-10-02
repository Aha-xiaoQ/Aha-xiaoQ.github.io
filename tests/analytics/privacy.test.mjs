import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../../assets/site-analytics.js', import.meta.url), 'utf8');
const ownerKey = 'xiaoq-stats-owner-excluded', activityKey = 'xiaoq-stats-last-pageview';
function setup({ host = 'aha-xiaoq.github.io', protocol = 'https:', search = '', embedded = false, broken = false, localBroken = broken, sessionBroken = broken, disabled = false, local = new Map(), session = new Map(), ready = 'complete', footer = false } = {}) {
  const events = new Map(), sent = [], beacons = []; let now = 1000000000, reloads = 0;
  const listen = (name, fn) => { if (!events.has(name)) events.set(name, []); events.get(name).push(fn); };
  const emit = (name, event = {}) => { for (const fn of events.get(name) || []) fn(event); };
  const location = { hostname: host, protocol, pathname: '/', search, get href() { return protocol + '//' + host + this.pathname + this.search; }, reload: () => reloads++ };
  const window = { __XIAOQ_ANALYTICS_DISABLED__: disabled, addEventListener: listen };
  window.self = window; window.top = embedded ? {} : window;
  const storage = (data, blocked) => ({ getItem(k) { if (blocked) throw Error('Blocked'); return data.get(k) || null; }, setItem(k, v) { if (blocked) throw Error('Blocked'); data.set(k, v); }, removeItem(k) { if (blocked) throw Error('Blocked'); data.delete(k); } });
  const localStorage = storage(local, localBroken), sessionStorage = storage(session, sessionBroken);
  function element(tag) {
    const node = { tag, children: [], attrs: {}, listeners: {}, setAttribute(k, v) { this.attrs[k] = v; }, append(...items) { this.children.push(...items); }, appendChild(item) { this.children.push(item); }, addEventListener(k, fn) { this.listeners[k] = fn; }, querySelector(selector) { const key = selector.slice(1, -1); for (const child of this.children) { if (key in child.attrs) return child; const found = child.querySelector(selector); if (found) return found; } return null; } }; return node;
  }
  const footerNode = footer ? element('footer') : null;
  const document = { readyState: ready, querySelector: selector => selector === '.site-footer, footer' ? footerNode : null, addEventListener: listen, createElement: element, head: { appendChild: x => beacons.push(x) } };
  const context = { window, location, localStorage, sessionStorage, URLSearchParams, URL, Date: { now: () => now }, fetch: (url, options) => { sent.push({ url, ...options, body: JSON.parse(options.body) }); return Promise.resolve(); }, document };
  vm.runInNewContext(source, context);
  return { sent, beacons, local, session, context, footerNode, api: window.SITE_ANALYTICS, emit, get reloads() { return reloads; }, navigate: (path, query = '') => { location.pathname = path; location.search = query; emit('xiaoq:pageview'); }, tick: ms => now += ms, rerun: () => vm.runInNewContext(source, context) };
}
test('production PV sends only path and activity-window start, without URL details or credentials', () => {
  const t = setup({ search: '?secret=never-send#fragment' }); assert.equal(t.sent.length, 1);
  assert.deepEqual(t.sent[0].body, { path: '/', visitStart: true });
  assert.equal(t.sent[0].credentials, 'omit'); assert.equal(t.sent[0].referrerPolicy, 'no-referrer'); assert.equal(t.sent[0].keepalive, true);
  assert.equal(t.local.size, 0); assert.equal(t.session.size, 1);
});
test('duplicate initialization, DOM readiness and repeated route events cannot duplicate one page', () => {
  const t = setup({ ready: 'loading', footer: true }); assert.equal(t.sent.length, 0);
  t.rerun(); t.emit('DOMContentLoaded'); t.emit('DOMContentLoaded'); t.emit('xiaoq:pageview'); t.rerun();
  assert.equal(t.sent.length, 1); assert.equal(t.beacons.length, 1); assert.equal(t.footerNode.children.length, 1);
});
test('same-path language/hash/view events and index.html aliases do not count; returning to a page does', () => {
  const t = setup(); t.navigate('/index.html'); assert.equal(t.sent.length, 1);
  t.navigate('/about/'); t.navigate('/about/', '?lang=en#heading'); t.navigate('/about/index.html');
  assert.equal(t.sent.length, 2); assert.equal(t.sent[1].body.visitStart, false);
  t.navigate('/'); assert.equal(t.sent.length, 3);
});
test('normal new tab starts a window; reload in the same tab keeps the recent window', () => {
  const first = setup(), reload = setup({ session: first.session }), newTab = setup({ local: first.local });
  assert.equal(first.sent[0].body.visitStart, true); assert.equal(reload.sent[0].body.visitStart, false); assert.equal(newTab.sent[0].body.visitStart, true);
});
test('30-minute threshold uses counted pages; duplicate route events do not extend activity', () => {
  const t = setup(); t.tick(29 * 60 * 1000); t.navigate('/about/'); assert.equal(t.sent.at(-1).body.visitStart, false);
  t.tick(29 * 60 * 1000); t.navigate('/about/', '?lang=en'); t.tick(60 * 1000); t.navigate('/games/');
  assert.equal(t.sent.at(-1).body.visitStart, true);
});
test('owner opt-out is absent by default and persists only after an explicit choice; undo removes it', () => {
  const t = setup(); assert.equal(t.api.getState().ownerExcluded, false); assert.equal(t.local.size, 0);
  const result = t.api.setOwnerExcluded(true); assert.equal(result.persistent, true); assert.equal(t.local.get(ownerKey), '1');
  t.navigate('/about/'); assert.equal(t.sent.length, 1); assert.equal(t.reloads, 0);
  const next = setup({ local: t.local }); assert.equal(next.sent.length, 0); assert.equal(next.beacons.length, 0);
  next.api.setOwnerExcluded(false); assert.equal(t.local.has(ownerKey), false);
  const restored = setup({ local: t.local }); assert.equal(restored.sent.length, 1); assert.equal(restored.beacons.length, 1);
});
test('visible owner button alone saves and reloads; remounting or viewing instructions does not save', () => {
  const t = setup({ footer: true }); const button = t.footerNode.querySelector('[data-stats-owner-toggle]');
  assert.equal(button.attrs['aria-pressed'], 'false'); assert.equal(t.local.size, 0); assert.equal(t.reloads, 0);
  t.navigate('/about/'); assert.equal(t.footerNode.children.length, 1); button.listeners.click();
  assert.equal(t.local.get(ownerKey), '1'); assert.equal(button.attrs['aria-pressed'], 'true'); assert.equal(t.reloads, 1);
  button.listeners.click(); assert.equal(t.local.has(ownerKey), false); assert.equal(t.reloads, 2);
});
test('stats=off retains QA exclusion across routes and reloads and suppresses both initial loaders', () => {
  const t = setup({ search: '?stats=off' }); t.navigate('/about/'); t.rerun();
  assert.equal(t.sent.length, 0); assert.equal(t.beacons.length, 0);
  const reload = setup({ session: t.session }); assert.equal(reload.sent.length, 0); assert.equal(reload.beacons.length, 0);
});
test('stats=on only clears QA exclusion and cannot override the owner or global setting', () => {
  const local = new Map([[ownerKey, '1']]), session = new Map([['xiaoq-stats-disabled', '1']]);
  const t = setup({ search: '?stats=on', local, session }); assert.equal(t.sent.length, 0); assert.equal(t.beacons.length, 0); assert.equal(session.has('xiaoq-stats-disabled'), false);
  const off = setup({ search: '?stats=off' }); off.api.setOwnerExcluded(true); off.api.setOwnerExcluded(false); off.navigate('/about/'); assert.equal(off.sent.length, 0);
  off.navigate('/games/', '?stats=on'); assert.equal(off.sent.length, 1);
  assert.equal(setup({ disabled: true, search: '?stats=on' }).sent.length, 0);
});
test('blocked local storage yields an honest page-only setting and fallback link, without reload', () => {
  const t = setup({ localBroken: true, footer: true, search: '?lang=en#anchor' });
  t.footerNode.querySelector('[data-stats-owner-toggle]').listeners.click();
  assert.equal(t.api.getState().ownerExcluded, true); assert.equal(t.api.getState().persistent, false); assert.equal(t.reloads, 0); assert.equal(t.local.size, 0);
  assert.match(t.footerNode.querySelector('[data-stats-owner-status]').textContent, /仅暂停当前页面/);
  const url = new URL(t.footerNode.querySelector('[data-stats-off-link]').href); assert.equal(url.searchParams.get('stats'), 'off'); assert.equal(url.searchParams.get('lang'), 'en'); assert.equal(url.hash, '#anchor');
  t.navigate('/about/'); assert.equal(t.sent.length, 1); t.api.setOwnerExcluded(false); t.navigate('/games/'); assert.equal(t.sent.length, 2);
});
test('blocked session storage leaves visit coverage unknown; explicit QA exclusion works in memory', () => {
  const t = setup({ sessionBroken: true }); assert.equal(t.sent[0].body.visitStart, null); t.navigate('/about/'); assert.equal(t.sent[1].body.visitStart, null);
  const off = setup({ broken: true, search: '?stats=off' }); off.navigate('/about/'); assert.equal(off.sent.length, 0); assert.equal(off.beacons.length, 0);
});
test('throwing storage getters fail safely and keep the owner choice in memory', () => {
  const t = setup({ footer: true }); Object.defineProperty(t.context, 'localStorage', { get() { throw Error('Denied'); } });
  t.api.setOwnerExcluded(true); t.navigate('/about/'); assert.equal(t.api.getState().persistent, false); assert.equal(t.sent.length, 1);
  t.emit('storage', { key: ownerKey }); assert.equal(t.sent.length, 1);
});
test('other tabs reflect owner preference changes without forced reload or fabricated page views', () => {
  const t = setup(), other = setup({ local: t.local }); other.api.setOwnerExcluded(true);
  t.emit('storage', { key: ownerKey, storageArea: t.context.localStorage }); t.navigate('/about/'); assert.equal(t.sent.length, 1); assert.equal(t.reloads, 0);
  other.api.setOwnerExcluded(false); t.emit('storage', { key: ownerKey, storageArea: t.context.localStorage }); assert.equal(t.sent.length, 1);
  t.navigate('/games/'); assert.equal(t.sent.length, 2);
});
test('owner toggle never modifies QA or activity storage or admits an invalid value', () => {
  const t = setup({ search: '?stats=off' }); const before = Array.from(t.session); t.api.setOwnerExcluded(true); t.api.setOwnerExcluded(false);
  assert.deepEqual(Array.from(t.session), before); assert.equal(t.session.has(activityKey), false); assert.throws(() => t.api.setOwnerExcluded('true'), /boolean/);
});
test('global disable, nonproduction and embedded pages never send or load the beacon', () => {
  for (const options of [{ disabled: true }, { host: '127.0.0.1', protocol: 'http:' }, { embedded: true }]) { const t = setup(options); assert.equal(t.sent.length, 0); assert.equal(t.beacons.length, 0); }
});
test('router signal exists only at successful render commit, not saveView', () => {
  const router = fs.readFileSync(new URL('../../assets/site-router.js', import.meta.url), 'utf8');
  assert.equal((router.match(/new CustomEvent\('xiaoq:pageview'\)/g) || []).length, 1);
  assert.match(router, /renderRoute\(info\);restoreView\(url,targetView,navigationId\);window.dispatchEvent\(new CustomEvent\('xiaoq:pageview'\)\)/);
});
