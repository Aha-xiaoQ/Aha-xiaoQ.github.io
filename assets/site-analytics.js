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
    ensureControls();
    return state();
  }
  window.SITE_ANALYTICS = Object.freeze({ version: 'owner-opt-out-1', getState: state, setOwnerExcluded });
  function ensureControls() {
    const footer = document.querySelector('.site-footer, footer');
    if (!footer) return;
    let panel = footer.querySelector('[data-stats-owner-controls]');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'shell stats-owner-controls';
      panel.setAttribute('data-stats-owner-controls', '');
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'button button--quiet';
      button.setAttribute('data-stats-owner-toggle', '');
      button.textContent = '本浏览器本人访问不计入';
      button.addEventListener('click', () => {
        const next = setOwnerExcluded(!ownerExcluded());
        // Reload only after this deliberate click: a loaded independent beacon cannot be unloaded.
        if (next.persistent) location.reload();
      });
      const status = document.createElement('p');
      status.setAttribute('data-stats-owner-status', '');
      status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
      const details = document.createElement('details'), summary = document.createElement('summary');
      summary.textContent = '访问统计说明';
      const info = document.createElement('p');
      info.textContent = '默认计入访问；仅在主动开启后保存本浏览器的排除设置。保存成功后刷新生效，不能撤回已记录的访问。PV 是页面访问次数，visits 是标签页内的 30 分钟活动窗口，均不能确认真人或独立人数。';
      const fallback = document.createElement('a');
      fallback.setAttribute('data-stats-off-link', '');
      fallback.textContent = '用不计入链接重新打开';
      details.append(summary, info, fallback); panel.append(button, status, details); footer.appendChild(panel);
    }
    const current = state();
    panel.querySelector('[data-stats-owner-toggle]').setAttribute('aria-pressed', String(current.ownerExcluded));
    let status = current.ownerExcluded ? '已开启：本浏览器本人访问不计入。再次点击可恢复计入。' : '未开启：本人排除设置关闭。';
    if (!current.persistent) status = current.ownerExcluded ? '存储不可用：仅暂停当前页面的聚合统计，不能保存。已载入的独立统计需用不计入链接重新打开。' : '存储不可用：设置无法保存；可用不计入链接重新打开。';
    const statusNode = panel.querySelector('[data-stats-owner-status]');
    statusNode.textContent = status;
    for (const note of [
      current.qaExcluded ? ' 当前标签页已使用 stats=off 排除；关闭本人设置不会取消此排除。' : '',
      window.__XIAOQ_ANALYTICS_DISABLED__ === true ? ' 当前页面已禁用统计。' : '',
    ]) {
      if (!note) continue;
      const span = document.createElement('span'); span.textContent = note; statusNode.append(span);
    }
    const url = new URL(location.href); url.searchParams.set('stats', 'off');
    panel.querySelector('[data-stats-off-link]').href = url.href;
    window.SITE_I18N?.apply(panel);
  }
  function pageview() {
    ensureControls();
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
    ownerChoice = null; persistent = true; ensureControls();
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
