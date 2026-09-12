import config from './guestbook-config.js?v=dd5b8227f5b3e07a8da6';
let widget;
let generation = 0;
let activeSection;
const styleLoads = new Map();
const styleURL = new URL('./guestbook.css?v=dd5b8227f5b3e07a8da6', import.meta.url).href;
const languageOptions = () => ({
  path: '/guestbook/',
  lang: globalThis.SITE_I18N?.language === 'en' ? 'en' : 'zh-CN',
  locale: globalThis.SITE_I18N?.language === 'en'
    ? { placeholder: 'Leave a note. It will appear here after review.', nick: 'Nickname (optional)' }
    : { placeholder: '写下你的留言，审核后会出现在这里。', nick: '昵称（可选）' },
});
// Update the existing widget so switching languages does not erase a draft.
document.addEventListener('site-language-change', () => widget?.update(languageOptions()));
function stylesheet(href) {
  if (styleLoads.has(href)) return styleLoads.get(href);
  const existing = [...document.querySelectorAll('link[rel="stylesheet"]')].find(link => link.href === href);
  if (existing?.sheet) return Promise.resolve();
  const pending = new Promise((resolve, reject) => {
    const link = existing || document.createElement('link');
    let settled = false;
    const timer = setTimeout(() => finish(new Error('style-timeout')), 12000);
    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer); link.onload = null; link.onerror = null;
      if (error) { link.remove(); styleLoads.delete(href); reject(error); } else resolve();
    }
    link.onload = () => finish(); link.onerror = () => finish(new Error('style-unavailable'));
    if (!existing) { link.rel = 'stylesheet'; link.href = href; document.head.append(link); }
  });
  styleLoads.set(href, pending);
  return pending;
}
export function unmount() {
  generation++;
  widget?.destroy(); widget = undefined;
  activeSection?.remove(); activeSection = undefined;
}
globalThis.SITE_GUESTBOOK_UNMOUNT = unmount;
export async function mount(root, page) {
  // A second shell callback must not destroy an existing or loading widget.
  if (page === 'about' && activeSection?.isConnected && root.contains(activeSection)) return;
  unmount();
  const current = ++generation;
  if (page !== 'about' || !config.enabled || !root.isConnected) return;
  const main = root.querySelector('main');
  if (!main || main.querySelector('#guestbook')) return;
  const section = document.createElement('section');
  section.id = 'guestbook'; section.className = 'section guestbook';
  section.setAttribute('aria-labelledby', 'guestbook-title');
  section.innerHTML = `<div class="shell"><header class="guestbook-heading"><h2 id="guestbook-title">留一张便签</h2><p>想说的话，就写在这里。可以匿名，也可以登录。</p></header><p class="guestbook-privacy">留言审核后公开。请勿填写私人联系方式或敏感信息。服务会处理 IP 地址用于防刷，不在留言中展示。</p><p role="status" class="guestbook-status">正在读取留言…</p><div class="guestbook-editor"></div></div>`;
  main.append(section);
  activeSection = section;
  const status = section.querySelector('[role="status"]');
  try {
    const server = new URL(config.serverURL);
    if (server.protocol !== 'https:') throw new Error('invalid-server');
    const [, , client] = await Promise.all([
      stylesheet('https://cdn.jsdelivr.net/npm/@waline/client@3.15.2/dist/waline.css'),
      stylesheet(styleURL),
      import('https://cdn.jsdelivr.net/npm/@waline/client@3.15.2/dist/waline.js'),
    ]);
    if (current !== generation || !section.isConnected) return;
    widget = client.init({
      el: section.querySelector('.guestbook-editor'), serverURL: server.href,
      ...languageOptions(), login: 'enable',
      meta: ['nick'], requiredMeta: [], wordLimit: [1, 500], pageSize: 12,
      imageUploader: false, search: false, emoji: false, highlighter: false,
      texRenderer: false, reaction: false, noRss: true,
      turnstileKey: config.turnstileKey || undefined,
    });
    status.textContent = '';
  } catch {
    if (current !== generation || !section.isConnected) return;
    status.textContent = '留言暂时无法加载，请稍后重试。';
    const retry = document.createElement('button');
    retry.type = 'button'; retry.className = 'button'; retry.textContent = '重新加载';
    retry.addEventListener('click', () => { section.remove(); mount(root, page); }, { once: true });
    status.append(' ', retry);
  }
}
