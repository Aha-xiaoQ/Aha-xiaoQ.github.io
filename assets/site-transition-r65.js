/* Content is visible without JavaScript. Motion is an optional, finite layer;
   the router alone owns page transitions. Never gate first paint on assets. */
(() => {
  const root = document.documentElement;
  window.__qTransitionStatus = {
    nativeCrossDocument: false,
    router: true,
    initialPaint: "non-blocking",
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 720px)");
  const active = new Set();
  let observer, seen = new WeakSet(), mountedPath = "";
  const heroSelector = [
    ".identity__visual", ".identity__copy h1", ".identity__copy > p",
    ".identity .primary-path", ".page-head .eyebrow", ".page-head h1", ".page-head .lede",
  ].join(",");
  const revealSelector = [
    ".pixel-scene", ".paths__label", ".paths .path", ".now-signal",
    ".q-lab-card", ".pw-work-card", ".pw-game-card", ".pw-tool-card",
    ".j-project-card", ".q-video-poster", ".q-experiment-facts",
    ".section-head", ".q-identity-card",
  ].join(",");
  const canMove = () => !reduced.matches && !document.hidden && typeof Element.prototype.animate === "function";
  const stop = () => {
    observer?.disconnect();
    observer = undefined;
    for (const animation of active) animation.cancel();
    active.clear();
  };
  const reveal = (element, index = 0, hero = false) => {
    if (!canMove() || !element.isConnected) return;
    // Titles fade in place; cards settle once without scale or overshoot.
    const distance = compact.matches ? 4 : 6;
    const frames = hero ? [{ opacity: .8 }, { opacity: 1 }] : [
      { opacity: .72, translate: `0 ${distance}px` },
      { opacity: 1, translate: "0 0" },
    ];
    const animation = element.animate(frames, {
      duration: 240,
      delay: hero ? 0 : Math.min(index, 2) * 20,
      easing: "cubic-bezier(.2,.65,.3,1)",
      fill: "backwards",
    });
    active.add(animation);
    animation.finished.then(() => active.delete(animation), () => active.delete(animation));
  };
  const mount = ({ entry = true } = {}) => {
    const app = document.getElementById("app");
    if (!app) return;
    if (mountedPath !== location.pathname) {
      stop();
      seen = new WeakSet();
      mountedPath = location.pathname;
    }
    observer?.disconnect();
    if (!canMove()) { stop(); return; }
    const inView = element => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.top < innerHeight - 16 && box.bottom > 0;
    };
    let heroIndex = 0, cardIndex = 0;
    for (const element of app.querySelectorAll(heroSelector)) {
      if (seen.has(element)) continue;
      seen.add(element);
      if (entry && scrollY < 96 && !location.hash && inView(element)) reveal(element, heroIndex++, true);
    }
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(entries => {
        let index = 0;
        for (const item of entries) {
          if (!item.isIntersecting || seen.has(item.target)) continue;
          seen.add(item.target);
          observer?.unobserve(item.target);
          // Jumping to a heading or restoring history should reveal no passing content.
          if (item.boundingClientRect.top > 0) reveal(item.target, index++);
        }
      }, { threshold: .08, rootMargin: "0px 0px -16px 0px" });
    }
    for (const element of app.querySelectorAll(revealSelector)) {
      if (seen.has(element)) continue;
      if (inView(element)) {
        seen.add(element);
        if (entry && !location.hash) reveal(element, cardIndex++);
      } else if (element.getBoundingClientRect().top >= innerHeight - 16) {
        observer?.observe(element);
      } else {
        seen.add(element);
      }
    }
  };
  window.SITE_MOTION = { mount, stop };
  reduced.addEventListener("change", () => { stop(); mount({ entry: false }); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else mount({ entry: false });
  });
  // A keyboard user never has to chase a moving focus target.
  document.addEventListener("focusin", event => {
    for (const animation of active) {
      if (animation.effect?.target?.contains(event.target)) {
        animation.cancel(); active.delete(animation);
      }
    }
  });
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", event => { if (event.persisted) mount({ entry: false }); });
  const markReady = () => {
    root.classList.add("q-assets-ready", "q-page-ready");
    window.__qTransitionStatus.readyAt = Date.now();
    mount();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markReady, { once: true });
  } else {
    window.requestAnimationFrame(markReady);
  }
})();
