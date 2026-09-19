/** Opt-in clipboard and image recovery. No click interception or network telemetry. */
export function shareURL(raw) {
  const u = new URL(raw);
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) throw Error('Invalid public URL');
  u.search = ''; // Share a work, not personal tracking or an incidental search query.
  u.hash = '';
  return u.href;
}
const attached = new WeakSet();
export function mount(root = document) {
  root.querySelectorAll('[data-copy-page]').forEach(button => {
    if (attached.has(button)) return; attached.add(button);
    const scope = button.closest('.q-launch-links');
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      const status = scope.querySelector('[data-page-copy-status]');
      const href = location.href; let value;
      try {value = shareURL(href);} catch {status.textContent = '请从浏览器地址栏复制页面地址。'; return;}
      button.disabled = true;
      try {
        if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
        await navigator.clipboard.writeText(value);
        if (button.isConnected && location.href === href) {status.textContent = '链接已复制'; scope.querySelector('[data-copy-fallback]')?.remove();}
      } catch {
        if (!button.isConnected || location.href !== href) return;
        let input = scope.querySelector('[data-copy-fallback]');
        if (!input) {input = document.createElement('input'); input.readOnly = true; input.dataset.copyFallback = ''; input.setAttribute('aria-label','本页链接，按 Ctrl+C 或长按复制'); scope.append(input);}
        input.value = value; input.focus(); input.select(); status.textContent = '链接已选中，可手动复制。';
      } finally {button.disabled = false;}
    });
  });
  root.querySelectorAll('[data-work-preview]').forEach(img => {
    if (attached.has(img)) return; attached.add(img);
    const failed = () => {const fallback = img.parentElement?.querySelector('[data-preview-fallback]'); if (fallback) {img.hidden = true; fallback.hidden = false;}};
    img.addEventListener('error',failed); if (img.complete && img.naturalWidth === 0) failed();
  });
}
if (globalThis.document) {
  const start = () => {
    mount();
    let scheduled = false;
    const observer = new MutationObserver(records => {
      if (scheduled || !records.some(r => [...r.addedNodes].some(n => n.nodeType === 1))) return;
      scheduled = true; requestAnimationFrame(() => {scheduled = false; mount();});
    });
    observer.observe(document.querySelector('#app') || document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}
