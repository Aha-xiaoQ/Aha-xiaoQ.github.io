/* Public shell update guard. No credentials or draft text are stored. */
(() => {
  const current = document.querySelector('meta[name="site-build"]')?.content;
  if (!current || window.SITE_FRESHNESS) return;
  const key = 'q-site-auto-update';
  const marker = '_site_v';
  let touched = false, pending = '', checking = false, lastCheck = 0, banner;
  const english = () => document.documentElement.lang.startsWith('en');
  const inputSelector = 'input,textarea,select,[contenteditable]:not([contenteditable="false"])';
  document.addEventListener('input', e => { if (e.target.closest?.(inputSelector)) touched = true; }, true);
  document.addEventListener('change', e => { if (e.target.closest?.(inputSelector)) touched = true; }, true);
  // Be conservative around guestbook editors and embedded interactive surfaces.
  const unsafe = () => touched || Boolean(document.querySelector('dialog[open],iframe')) ||
    [...document.querySelectorAll('textarea,input:not([type=hidden]):not([type=button]):not([type=submit]),[contenteditable]:not([contenteditable="false"])')]
      .some(el => el.tagName === 'INPUT' && ['checkbox','radio','color','range'].includes(el.type)
        ? el.checked || el.value !== el.defaultValue : Boolean((el.value ?? el.textContent)?.trim()));
  const target = version => { const u = new URL(location.href); u.searchParams.set(marker, version); return u; };
  const attempted = version => {
    if (new URL(location.href).searchParams.get(marker) === version) return true;
    try { return sessionStorage.getItem(key) === version; } catch { return false; }
  };
  const reload = version => {
    try { sessionStorage.setItem(key, version); } catch { /* URL also breaks loops. */ }
    location.replace(target(version).href);
  };
  const show = () => {
    if (banner) banner.remove();
    banner = document.createElement('aside');
    banner.id = 'site-update-notice';
    banner.setAttribute('role', 'status');
    // System UI is deliberate: the notice must remain readable if webfonts fail.
    banner.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:640px;margin:auto;z-index:10000;padding:14px 18px;background:#f7f5ed;color:#22352d;border:1px solid #718277;box-shadow:0 4px 20px #0003;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font:16px/1.5 system-ui,sans-serif';
    const text = document.createElement('span'); text.style.flex = '1 1 220px';
    text.textContent = english() ? 'A new version is available. Save your work before updating.' : '网站已更新，请先保存正在编辑的内容。';
    const update = document.createElement('button');
    update.type = 'button'; update.textContent = english() ? 'Update' : '更新页面';
    update.style.cssText = 'background:#345e50;color:white;border:0;border-radius:5px;padding:9px 14px;cursor:pointer;font:inherit';
    update.onclick = () => {
      if (unsafe() && !confirm(english() ? 'Updating may discard unsaved content. Continue?' : '更新可能丢失未保存内容，确认继续？')) return;
      reload(pending);
    };
    const later = document.createElement('button');later.type = 'button';later.textContent = english() ? 'Later' : '稍后';
    later.style.cssText = 'background:transparent;color:inherit;border:1px solid #718277;border-radius:5px;padding:8px 12px;cursor:pointer;font:inherit';
    later.onclick = () => banner.remove();
    banner.append(text, update, later);document.body.append(banner);
  };
  async function check(initial = false) {
    if (checking || (!initial && Date.now() - lastCheck < 30000)) return;
    checking = true;lastCheck = Date.now();
    const controller = new AbortController();const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const url = new URL('/site-version.json', location.origin);url.searchParams.set('check', String(Date.now()));
      const response = await fetch(url, {cache:'no-store', credentials:'omit', signal:controller.signal});
      if (!response.ok) return;
      const {version} = await response.json();
      if (typeof version !== 'string' || !/^[a-f0-9]{20}$/.test(version)) return;
      if (version === current) {
        // Remove only our own query parameter after successful activation.
        const u = new URL(location.href);
        if (u.searchParams.get(marker) === current) {u.searchParams.delete(marker);history.replaceState(history.state, '', u.href);}
        return;
      }
      pending = version;
      if (initial && !unsafe() && !attempted(version)) reload(version);
      else show();
    } catch { /* Offline, timeout, malformed response: leave the page usable. */ }
    finally { clearTimeout(timer);checking = false; }
  }
  window.SITE_FRESHNESS = {check: () => check(false)};
  const start = () => check(true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});else start();
  window.addEventListener('pageshow', e => {if(e.persisted) check(false);});
  document.addEventListener('visibilitychange', () => {if(document.visibilityState === 'visible') check(false);});
  document.addEventListener('click', e => {if(e.target.closest?.('a[href]')) check(false);}, true);
  setInterval(() => {if(document.visibilityState === 'visible') check(false);}, 60000);
})();
