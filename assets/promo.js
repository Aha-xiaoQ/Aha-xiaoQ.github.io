(() => {
  const data = globalThis.SITE_DATA;
  const assets = globalThis.SITE_ASSETS;
  const root = document.querySelector("#app");
  if (!data || !assets || !root) return;

  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const profile = data.profile;
  const links = profile.links || [];
  const external = (label) => links.find((link) => link.label === label);
  const clockText = () => new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const dateText = () => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).format(new Date()).replaceAll('/', '.');
  const nixieTime = (value) => [...value].map((character) => {
    if (character === ':') return '<span class="nixie-separator" aria-hidden="true"><i></i><i></i></span>';
    const cathodes = '0123456789'.split('').map((digit, index) => `<i class="nixie-cathode" style="--depth:${index}">${digit}</i>`).join('');
    return `<span class="nixie-tube" aria-hidden="true"><span class="nixie-mesh"></span><span class="nixie-cathodes">${cathodes}</span><b>${character}</b><span class="nixie-pins"><i></i><i></i><i></i><i></i><i></i></span></span>`;
  }).join('');
  const icon = (name) => {
    const paths = {
      GitHub: '<path d="M6 12.8c-3 1-3-1.5-4.2-1.8M10.2 14v-2.5c.1-.8-.2-1.5-.7-2 2.4-.3 4.9-1.2 4.9-5.3A4.1 4.1 0 0 0 13.3 1.4 3.8 3.8 0 0 0 13.2-1 4 4 0 0 0 10.4.1a9.7 9.7 0 0 0-4.8 0A4 4 0 0 0 2.8-1a3.8 3.8 0 0 0-.1 2.4 4.1 4.1 0 0 0-1.1 2.8c0 4.1 2.5 5 4.9 5.3-.5.5-.8 1.2-.7 2V14" />',
      Bilibili: '<path d="M3 4.7h10v7.2H3zM5.3 2.4l1.4 1.4m2.6-1.4L8 3.8M6 7.6h.1m3.8 0h.1M5.7 10c1.4.8 3.2.8 4.6 0" />',
      邮箱: '<path d="M2.2 4.1h11.6v7.8H2.2zM2.7 4.7 8 8.6l5.3-3.9" />'
    };
    return `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
  };
  const contactLink = (label) => {
    const link = external(label);
    if (!link) return "";
    const isMail = link.kind === "email";
    return `<a class="contact-link" href="${esc(link.url)}" aria-label="${isMail ? "发邮件给在下_小Q" : "打开在下_小Q的 " + label}">${icon(label)}<span>${esc(label)}</span></a>`;
  };
  const currentNav = () => {
    const match = location.pathname.replace(/\\/g, "/").match(/\/(games|projects|tools|method|notes|about)(?:\/|$)/);
    if (!match) return "home";
    return match[1] === "method" ? "tools" : match[1];
  };
  const nowBlock = () => {
    const now = profile.now;
    if (!now) return "";
    return `<section class="now-signal" aria-labelledby="now-title"><strong class="now-signal__label" id="now-title">${esc(now.label)}</strong><span class="now-signal__title">${esc(now.title || now.summary)}</span><time datetime="${esc(now.updatedAt)}">${esc(now.updatedAt)}</time></section>`;
  };
  const navLink = (path, label, key) => `<a href="${path}" data-nav-key="${key}"${currentNav() === key ? ' aria-current="page"' : ""}>${label}</a>`;

  let clockTimer = 0;
  let lastClockValue = "";
  const renderHome = (targetRoot = root) => {
    window.clearInterval(clockTimer);
    clockTimer = 0;
    lastClockValue = "";
    const prerendered = targetRoot.dataset.prerendered === "true";
    targetRoot.removeAttribute("data-prerendered");
    if (!prerendered) targetRoot.innerHTML = `
    <a class="skip-link" href="#paths">跳到入口</a>
    <div class="studio" id="top">
      <header class="topbar shell">
        <a class="brand" href="#top" aria-label="返回首页">
          <img src="${esc(assets.brand.logo.src)}" alt="${esc(assets.brand.logo.alt)}" width="42" height="42" decoding="sync">
          <span>${esc(profile.displayName)}<small>PIXEL WORKSHOP</small></span>
        </a>
        <nav aria-label="主导航">
          ${navLink("index.html", "首页", "home")}
          ${navLink("projects/index.html", "项目", "projects")}
          ${navLink("games/index.html", "游戏", "games")}
          ${navLink("tools/index.html", "工具", "tools")}
          ${navLink("notes/index.html", "笔记", "notes")}
          ${navLink("about/index.html", "关于", "about")}
        </nav>
      </header>

      <main class="shell stage" id="main" tabindex="-1">
        <aside class="corner-clock" aria-label="日期、时间和历史上的今天">
          <div class="clock-meta"><b data-date>${dateText()}</b></div>
          <time data-clock>${clockText()}</time>
        </aside>
        <section class="identity" aria-labelledby="site-name">
          <figure class="identity__visual">
            <div class="identity__portrait-frame">
              <img class="identity__portrait" src="${esc(assets.brand.avatar.webSrc)}" alt="${esc(assets.brand.avatar.alt)}" width="256" height="256" decoding="sync" fetchpriority="high">
            </div>
            <figcaption class="eyebrow">小Q的工作台</figcaption>
          </figure>
          <div class="identity__copy">
            <h1 id="site-name">在下_<em>小Q</em></h1>
            <p>${esc(profile.publicStatement)}</p>
          </div>
          <a class="primary-path" href="projects/index.html"><span>重点入口</span><strong>项目 <b aria-hidden="true">↗</b></strong></a>
          ${nowBlock()}
        </section>

        <figure class="pixel-scene">
          <img src="assets/backgrounds/bg-home-pixel-game-r3.webp?v=eba6ccded968930cbdc1" alt="像素工作室窗外的月夜与城市" width="600" height="340">
          <figcaption><span>小Q的像素世界</span><span>创造 · 探索</span></figcaption>
        </figure>
        <section class="paths" id="paths" aria-labelledby="paths-title">
          <p class="paths__label" id="paths-title">往里逛逛</p>
          <div class="paths__stack">
            <a class="path path--games" href="games/index.html"><span>01</span><strong>游戏</strong><i aria-hidden="true">→</i></a>
            <a class="path path--tools" href="tools/index.html"><span>02</span><strong>工具</strong><i aria-hidden="true">→</i></a>
            <a class="path path--notes" href="notes/index.html"><span>03</span><strong>笔记</strong><i aria-hidden="true">→</i></a>
            <a class="path path--about" href="about/index.html"><span>04</span><strong>关于我</strong><i aria-hidden="true">→</i></a>
          </div>
        </section>
      </main>

      <footer class="footer">
        <div class="shell footer-inner">
        <p>欢迎来逛。</p>
        <div class="contact" aria-label="联系在下_小Q">
          ${contactLink("GitHub")}
          ${contactLink("Bilibili")}
          ${contactLink("邮箱")}
        </div>
        </div>
      </footer>
    </div>`;
    const clock = targetRoot.querySelector('[data-clock]');
    const date = targetRoot.querySelector('[data-date]');
    const renderClock = () => {
      const value = clockText();
      if (clock && value !== lastClockValue) {
        const minuteChanged = lastClockValue && lastClockValue !== value;
        clock.innerHTML = nixieTime(value);
        clock.setAttribute('aria-label', value);
        if (minuteChanged) {
          const clockShell = clock.closest('.corner-clock');
          clockShell?.classList.remove('clock--pulse');
          void clock.offsetWidth;
          clockShell?.classList.add('clock--pulse');
          window.setTimeout(() => clockShell?.classList.remove('clock--pulse'), 760);
        }
      }
      lastClockValue = value;
      if (date) {
        const currentDate = dateText();
        if (date.textContent !== currentDate) date.textContent = currentDate;
      }
    };
    renderClock();
    clockTimer = window.setInterval(() => {
      if (!clock?.isConnected) {
        window.clearInterval(clockTimer);
        clockTimer = 0;
        return;
      }
      renderClock();
    }, 30000);
  };
  globalThis.SITE_PROMO_RENDER = renderHome;
  if (!document.body.dataset.page || document.body.dataset.page === "home") renderHome();
})();
