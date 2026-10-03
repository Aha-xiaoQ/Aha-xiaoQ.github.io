/* Aggregate page counts only. No visitor ID, cookies, referrer or complete URL. */
(() => {
  if (window.self !== window.top || window.__XIAOQ_ANALYTICS_STARTED__) return;
  window.__XIAOQ_ANALYTICS_STARTED__ = true;
  const production = location.hostname === 'aha-xiaoq.github.io' && location.protocol === 'https:';
  const endpoint = 'https://xiaoq-guestbook.hfutqdm.chatgpt.site/api/traffic';
  const exclusionKey = 'xiaoq-stats-disabled', activityKey = 'xiaoq-stats-last-pageview';
  const ownerKey = 'xiaoq-stats-owner-excluded';
  let excluded = false, lastPath = null, ownerChoice = null, persistent = true;
  function ownerExcluded() {
    if (ownerChoice !== null) return ownerChoice;
    try { return localStorage.getItem(ownerKey) === '1'; } catch { persistent = false; return false; }
  }
  function qaExcluded() {
    const flag = new URLSearchParams(location.search).get('stats');
    if (flag === 'off') { excluded = true; try { sessionStorage.setItem(exclusionKey, '1'); } catch {} }
    else if (flag === 'on') { excluded = false; try { sessionStorage.removeItem(exclusionKey); } catch {} }
    try { if (sessionStorage.getItem(exclusionKey) === '1') excluded = true; } catch {}
    return excluded;
  }
  function disabled() {
    // Always process QA flags, even when the persistent owner preference is active.
    const qa = qaExcluded(), owner = ownerExcluded();
    return qa || owner || window.__XIAOQ_ANALYTICS_DISABLED__ === true;
  }
  function state() {
    const owner = ownerExcluded();
    return { ownerExcluded: owner, persistent, scope: persistent ? 'browser' : 'page', qaExcluded: qaExcluded(), production };
  }
  function setOwnerExcluded(value) {
    if (typeof value !== 'boolean') throw new TypeError('Expected a boolean owner preference');
    ownerChoice = value;
    try {
      if (value) localStorage.setItem(ownerKey, '1'); else localStorage.removeItem(ownerKey);
      persistent = true;
    } catch { persistent = false; }
    return state();
  }
  window.SITE_ANALYTICS = Object.freeze({ version: 'owner-opt-out-2', getState: state, setOwnerExcluded });
  function pageview() {
    if (!production || disabled()) return;
    const path = location.pathname.split(/[?#]/, 1)[0].replace(/\/index\.html$/, '/');
    if (path === lastPath) return;
    lastPath = path;
    let visitStart = null; const now = Date.now();
    try { const previous = Number(sessionStorage.getItem(activityKey)); visitStart = !previous || now - previous >= 30 * 60 * 1000; sessionStorage.setItem(activityKey, String(now)); } catch {}
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, visitStart }), credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true }).catch(() => {});
  }
  window.addEventListener('xiaoq:pageview', pageview);
  window.addEventListener('storage', event => {
    if (event.key !== ownerKey && event.key !== null) return;
    try { if (event.storageArea !== localStorage) return; } catch { return; }
    ownerChoice = null; persistent = true;
    // Other tabs keep their current page; the next PV reads the preference. Beacon changes need a reload.
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pageview, { once: true }); else pageview();
  // Keep the previous provider independent; both opt-outs suppress its initial loader.
  if (!production || disabled() || document.querySelector('script[data-cf-beacon]')) return;
  const beacon = document.createElement('script'); beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: 'ec50601bb94346a1b765e79a14a574fa' }));
  document.head.appendChild(beacon);
})();
