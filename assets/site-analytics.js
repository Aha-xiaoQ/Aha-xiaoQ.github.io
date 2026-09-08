/* Privacy-first aggregate traffic metrics; never run on previews or embedded pages. */
(() => {
  if (location.hostname !== 'aha-xiaoq.github.io' || location.protocol !== 'https:' || window.self !== window.top) return;
  if (document.querySelector('script[data-cf-beacon]')) return;
  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  // Public site token, not an account/API credential. Keep Cloudflare SPA tracking enabled.
  beacon.setAttribute('data-cf-beacon', JSON.stringify({token: 'ec50601bb94346a1b765e79a14a574fa'}));
  document.head.appendChild(beacon);
})();
