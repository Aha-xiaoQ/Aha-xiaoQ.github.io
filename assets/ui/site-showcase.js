/* R25. Pure About view. Original theme, navigation and profile data stay authoritative. */
(function (root) {
  'use strict';
  const version = 'showcase-r25';
  if (root.SITE_SHOWCASE?.version === version) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const translations = Object.freeze({
    '认识小Q':'MEET XIAOQ','你好，我是':'Hello, I’m','小Q的工作台':'XiaoQ’s workbench',
    '看作品':'See projects','玩游戏':'Play games','试工具':'Try tools','打个招呼':'SAY HELLO',
    '路过，留个脚印。':'Leave a little note.',
    '想聊作品、分享点子，或只是说声你好，都欢迎。':'Talk about a project, share an idea, or just say hello.',
    '去留言墙':'Visit the guestbook','也可以在这里找到我':'You can also find me here',
    '代码与项目':'Code & projects','视频与制作记录':'Videos & making-of','直接联系':'Get in touch',
    '其他联系渠道':'More ways to connect'
  });
  // Extend the existing dictionary in place; do not replace its identity.
  if (root.SITE_EN && !Object.isFrozen(root.SITE_EN)) Object.assign(root.SITE_EN, translations);
  function local(value, base = '../') {
    if (typeof value !== 'string' || !value || /[\\\x00-\x20<>"'`]/.test(value) || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) throw Error('About paths must stay on this site');
    return value.startsWith('/') || value.startsWith('#') ? value : base + value;
  }
  function icon(kind) {
    const d = kind === 'code' ? '<path d="m7 6-4 4 4 4m6-8 4 4-4 4m-2-10-2 16"/>'
      : kind === 'video' ? '<rect x="2" y="4" width="16" height="12"/><path d="m8 7 5 3-5 3z"/>'
      : '<rect x="2" y="4" width="16" height="12"/><path d="m2 5 8 6 8-6"/>';
    return `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6">${d}</svg>`;
  }
  function contact(link) {
    const A = root.SITE_ACTIONS;
    if (!A) throw Error('The shared action helper must load before rendering');
    const info = A.inspect(link.url), host = info.kind === 'external' ? new URL(link.url).hostname : '';
    const kind = /(^|\.)github\.com$/.test(host) ? 'code' : /(^|\.)bilibili\.com$/.test(host) ? 'video' : 'mail';
    const detail = kind === 'code' ? '代码与项目' : kind === 'video' ? '视频与制作记录' : info.kind === 'email' ? '直接联系' : '其他联系渠道';
    // Keep the original current-tab/email behavior; decorative icons never stand alone.
    return `<a ${A.attributes(link.url,{className:'q-contact-route'})}>${icon(kind)}<span class="q-contact-name">${esc(link.label)}</span><span class="q-contact-detail">${detail}</span></a>`;
  }
  function aboutMain(profile = {}, base = '../', support = {}) {
    const A = root.SITE_ACTIONS;
    if (!A) throw Error('Missing shared actions');
    const name = profile.displayName || '在下_小Q', statement = profile.publicStatement || '做项目，也做工具，偶尔做点游戏。';
    const avatar = support.avatar || {src:'assets/identity/xiaoq-avatar-p63a.svg?v=dd5b8227f5b3e07a8da6',alt:'小Q的像素头像'};
    const src = local(avatar.src,base), guestbook = local(support.guestbookHref || '/guestbook/',base);
    const routes = [['看作品','projects/'],['玩游戏','games/'],['试工具','tools/']].map(([label,p])=>A.link(label,local(p+'index.html',base),{className:'button button--quiet',variant:'secondary',meta:''})).join('');
    const links = (profile.links || []).map(contact).join('');
    // Extra sections are trusted source markup, validated and preserved by the build tool.
    return `<main id="main" tabindex="-1">${support.beforeHtml || ''}<section class="section q-about" data-about-view="${version}" aria-labelledby="q-about-name"><div class="shell q-about-layout">
      <figure class="q-identity-card"><div class="q-identity-top"><span>小Q的工作台</span><b aria-hidden="true">Q.</b></div><img src="${esc(src)}" alt="${esc(avatar.alt)}" width="320" height="320" loading="eager" decoding="async"><figcaption><span>${esc(name)}</span><small lang="en">PIXEL WORKSHOP</small></figcaption></figure>
      <div class="q-about-copy"><p class="eyebrow">认识小Q</p><p class="q-about-hello">你好，我是</p><h2 id="q-about-name"><span>${esc(name)}</span><b aria-hidden="true">.</b></h2><p class="q-about-statement">${esc(statement)}</p><div class="actions q-about-paths">${routes}</div></div>
      <section class="q-about-connect" aria-labelledby="q-connect-title"><header><p class="eyebrow">打个招呼</p><h2 id="q-connect-title">路过，留个脚印。</h2></header><div class="q-connect-grid">
        <a ${A.attributes(guestbook,{className:'q-note-card',ariaLabel:'去留言墙'})} data-guestbook-link><p>想聊作品、分享点子，或只是说声你好，都欢迎。</p><span class="q-note-stamp" aria-hidden="true">Q</span><strong>去留言墙</strong></a>
        ${links?`<div class="q-contact-book"><p>也可以在这里找到我</p><div>${links}</div></div>`:''}
      </div></section></div></section>${support.afterHtml || ''}</main>`;
  }
  root.SITE_SHOWCASE = Object.freeze({version, aboutMain, local, translations});
})(globalThis);
