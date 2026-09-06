/* Non-blocking first-paint marker. The HTML is intentionally visible before
   this script runs; resource readiness is telemetry, never a screen gate. */
(() => {
  const root = document.documentElement;
  window.__qTransitionStatus = {
    nativeCrossDocument: false,
    router: true,
    initialPaint: "non-blocking",
  };
  const markReady = () => {
    root.classList.add("q-assets-ready", "q-page-ready");
    window.__qTransitionStatus.readyAt = Date.now();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markReady, { once: true });
  } else {
    window.requestAnimationFrame(markReady);
  }
})();
