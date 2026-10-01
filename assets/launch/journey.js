/** Shared visitor-facing markup. Consumed by static builds and the native shell.
 * No fetch, event handlers, routing or project-name branches live in this module.
 */
(function (root) {
  'use strict';
  const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function linkURL(raw) {
    if (typeof raw !== 'string' || !raw || /[\\\x00-\x20]/.test(raw) || /%(?:2e|2f|5c)/i.test(raw)) return '';
    if (raw.startsWith('/') && !raw.startsWith('//') && !raw.split(/[?#]/)[0].split('/').some(x => x === '.' || x === '..')) return raw;
    try {const u = new URL(raw); return u.protocol === 'https:' && !u.username && !u.password ? u.href : '';} catch {return '';}
  }
  function action(label, href, primary = false, download = false) {
    const url = linkURL(href); if (!url) return '';
    return root.SITE_ACTIONS.link(label, url, {className: 'button' + (primary ? '' : ' button--quiet'), variant: primary ? 'primary' : 'secondary', download, meta: '', newTab: url.startsWith('https:')});
  }
  function local(raw) {return !raw ? '' : /^(?:https:|\/)/.test(raw) ? linkURL(raw) : linkURL('/' + raw);}
  function gameStart(item, proof = null) {
    const title = escape(item.title), play = local(item.localUrl), cover = local(item.cover);
    return `<section class="section"><div class="shell q-game-intro" data-game-journey>
      <div class="q-game-media">${item.videoSlot===true ? root.SITE_ACTIONS.videoPanel(item,{cover,eager:true}) : cover ? `<img src="${escape(cover)}" alt="${title}游戏预览" width="1600" height="900" loading="eager" decoding="async" data-work-preview>` : ''}<p data-preview-fallback ${cover ? 'hidden' : ''}>预览图暂时无法显示，仍可开始试玩。</p></div>
      <section class="q-launch-panel" aria-labelledby="q-play-heading"><p class="eyebrow">PLAY IN YOUR BROWSER</p><h2 id="q-play-heading">开始游玩</h2>
        <p>${escape(proof?.accessNote || '在浏览器中打开，按游戏内提示开始。')}</p>
        <div class="actions">${action('开始试玩', play, true)}${item.videoUrl ? action('观看演示', item.videoUrl) : root.SITE_ACTIONS.videoPending(item)}${item.downloadUrl ? action('下载游戏', local(item.downloadUrl), false, true) : ''}</div>
        <p class="q-launch-note">这里打开已发布的试玩页。开发源码与实验功能在“开发”栏目中单独说明。</p>
        <details class="q-launch-help"><summary>操作与常见问题</summary><p>按键说明、声音和暂停选项请查看游戏内菜单。浏览器未播放声音时，先与游戏页面交互，再检查音量；也可以先静音体验。</p><p>${item.downloadUrl ? '下载后解压，再打开其中的 index.html。' : ''}浏览器游戏与可下载文件的可用内容，以该版本说明为准。</p><a href="/play-guide/">查看试玩帮助</a></details>
        <div class="q-launch-links"><a href="/games/">全部游戏</a><button type="button" data-copy-page>复制本页链接</button><span role="status" data-page-copy-status></span></div>
      </section></div></section>`;
  }
  function gameMain(item, proof = null) {
    const rights = ['mario-classic', 'mario-mix', 'mario-mix-2', 'mario-mix-3'].includes(item.slug)
      ? '<p>采用经典角色、图像与音乐素材，相关权利归各自权利人所有；素材来源及代码许可说明见试玩页。</p><p>非官方同人作品 · 免费试玩 · 仅供娱乐。</p><p>字体：霞鹜文楷</p>'
      : item.slug === 'pipebound' ? '<p>重新绘制的像素画面与独立实现的横版玩法。项目不属于任天堂官方作品。</p><p>非官方同人作品 · 免费试玩 · 仅供娱乐。</p><p>字体：霞鹜文楷</p>' : '';
    const support = root.SITE_GAME_SUPPORT?.[item.slug];
    if (typeof support === 'string') return '<main id="main" tabindex="-1">' + gameStart(item, proof) + (support ? '<section class="section" data-game-support><div class="shell article">' + support + '</div></section>' : '') + '</main>';
    const contact = rights ? '<p>如相关权利人有异议，请<a href="mailto:hfutqdm@163.com?subject=%E6%B8%B8%E6%88%8F%E6%9D%83%E5%88%A9%E5%8F%8D%E9%A6%88">联系本站维护者</a>；我们将及时核查并移除相关内容或下架试玩。</p>' : '';
    return '<main id="main" tabindex="-1">' + gameStart(item, proof) + (rights ? '<section class="section"><div class="shell article"><h2>作品说明</h2>' + rights + contact + '</div></section>' : '') + '</main>';
  }
  function helpPage() {
    return `<article class="section q-visitor-reading" data-visitor-guide><p class="q-guide-intro">第一次来，从游戏列表选择一款作品，点击“开始试玩”即可。想看制作过程，再进入开发资料。</p>
      <div class="q-intent-grid"><section><span class="eyebrow">01 / PLAY</span><h2>先体验作品</h2><p>查看游戏封面和简介，选择一款开始。操作方式和支持的设备以游戏内说明为准。</p>${action('浏览游戏', '/games/', true)}</section><section><span class="eyebrow">02 / BUILD</span><h2>看看如何制作</h2><p>开发栏目提供源码、运行方法和可参与的任务。待验收的开发版与已发布的试玩版分开标注。</p>${action('查看开发资料','/notes/')}</section></div>
      <section><h2>声音没有播放</h2><p>先点击游戏的开始或声音按钮，再检查浏览器标签页和系统音量。音频仍未就绪时，可以先静音试玩；具体加载与重试方式见游戏内设置。</p></section>
      <section><h2>键盘、手柄与手机</h2><p>先让游戏获得焦点，再按当前显示的按键操作。手柄、触屏和改键支持因作品而异；手机上的操作支持请看各作品说明；没有触屏按钮时，请在电脑上体验。</p></section>
      <section><h2>页面或素材没有加载</h2><p>检查网络后重试。返回作品介绍页可以确认版本和下载入口。不要为恢复加载而先删除存档或重置全部浏览器数据。</p></section>
      <section><h2>反馈一个问题</h2><p>记录作品名称、版本、浏览器、输入设备与复现步骤。在相应项目的任务或参与页面提交反馈；避免附带密码、个人存档等敏感信息。</p><p><a href="/notes/">选择项目并反馈</a></p></section>
      <p class="q-guide-bottom"><a href="/">返回首页</a><a href="/search/">搜索作品与资料</a></p></article>`;
  }
  function notFound() {
    return `<section class="section q-recovery" data-recovery-page><p class="eyebrow">404 / NOT FOUND</p><h2>换个入口继续逛</h2><p>链接可能已更改，或地址输入有误。作品和开发资料仍可从下面找到。</p><div class="actions">${action('浏览游戏','/games/',true)}${action('返回首页','/')}</div><form role="search" action="/search/" method="get"><label for="q-recovery-query">搜索作品或资料</label><div class="q-search-line"><input id="q-recovery-query" type="search" name="q" maxlength="160" placeholder="作品名称或关键词"><button class="button button--quiet" type="submit">搜索</button></div></form><p><a href="/notes/">查看开发资料</a></p></section>`;
  }
  root.SITE_JOURNEY = Object.freeze({gameStart, gameMain, helpPage, notFound, linkURL});
})(globalThis);
