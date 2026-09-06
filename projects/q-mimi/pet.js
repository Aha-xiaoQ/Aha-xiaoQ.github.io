(() => {
  'use strict';
  const sprite = document.getElementById('pet-sprite');
  const select = document.getElementById('pet-action');
  const pause = document.getElementById('pet-pause');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const actions = { idle: [0, 6, 260], waving: [3, 4, 220], jumping: [4, 5, 180], right: [1, 8, 110], left: [2, 8, 110], look: [9, 16, 220] };
  let frame = 0;
  let playing = !reduce.matches;
  let timer;
  function draw() {
    const [row] = actions[select.value];
    sprite.style.backgroundPosition = `${-(frame % 8) * 192}px ${-(row + Math.floor(frame / 8)) * 208}px`;
  }
  function schedule() {
    window.clearTimeout(timer);
    const sourceLabel = playing ? '暂停' : '播放';
    const label = globalThis.SITE_I18N?.translate(sourceLabel) || sourceLabel;
    if (pause.textContent !== label) pause.textContent = sourceLabel;
    if (!playing || document.hidden) return;
    timer = window.setTimeout(() => { frame = (frame + 1) % actions[select.value][1]; draw(); schedule(); }, actions[select.value][2]);
  }
  select.addEventListener('change', () => { frame = 0; draw(); schedule(); });
  pause.addEventListener('click', () => { playing = !playing; schedule(); });
  reduce.addEventListener('change', () => { if (reduce.matches) { playing = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  document.getElementById('pet-controls').hidden = false;
  draw(); schedule();
})();
