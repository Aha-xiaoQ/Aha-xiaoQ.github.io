/* Optional classic-game playlist. One audio owner survives SPA navigation.
   Nothing is fetched or played until the visitor presses Play. */
(() => {
  if (window.SITE_BGM) return;
  const assetBase = new URL('.', document.currentScript.src);
  const groups = {"mario":{"zh":"马里奥","en":"Mario"},"contra":{"zh":"魂斗罗","en":"Contra"},"megaman":{"zh":"洛克人","en":"Mega Man"},"sonic":{"zh":"索尼克 · 改编","en":"Sonic · ReMix"},"zelda":{"zh":"塞尔达 · 改编","en":"Zelda · ReMix"},"tetris":{"zh":"俄罗斯方块 · 改编","en":"Tetris · ReMix"}};
  const tracks = [
    {"id":"mario-overworld","zh":"马里奥 · 地上世界","en":"Mario · Overworld","game":"Super Mario Bros.","owner":"Nintendo","file":"classic-audio/overworld.mp3","gain":0.9236,"group":"mario"},
    {"id":"mario-underworld","zh":"马里奥 · 地下世界","en":"Mario · Underworld","game":"Super Mario Bros.","owner":"Nintendo","file":"classic-audio/underworld.mp3","gain":1.0,"group":"mario"},
    {"id":"mario-underwater","zh":"马里奥 · 水下世界","en":"Mario · Underwater","game":"Super Mario Bros.","owner":"Nintendo","file":"classic-audio/underwater.mp3","gain":0.7898,"group":"mario"},
    {"id":"mario-castle","zh":"马里奥 · 城堡","en":"Mario · Castle","game":"Super Mario Bros.","owner":"Nintendo","file":"classic-audio/castle.mp3","gain":0.7665,"group":"mario"},
    {"id":"mario-star","zh":"马里奥 · 无敌星","en":"Mario · Star","game":"Super Mario Bros.","owner":"Nintendo","file":"classic-audio/star.mp3","gain":0.7691,"group":"mario"},
    {"id":"contra-jungle","zh":"魂斗罗 · 丛林与机库","en":"Contra · Jungle / Hangar","game":"Contra","owner":"KONAMI","file":"character-audio/contra-jungle-nes.ogg","gain":0.514,"group":"contra"},
    {"id":"megaman-wily","zh":"洛克人 2 · 威利城堡","en":"Mega Man 2 · Wily Castle","game":"Mega Man 2","owner":"CAPCOM","file":"character-audio/mm2-wily-castle-nes.ogg","gain":0.352,"group":"megaman"},
    {"id":"sonic-green-hill","zh":"索尼克 · 绿丘（改编）","en":"Sonic · Green Hill (ReMix)","group":"sonic","game":"Sonic the Hedgehog","owner":"SEGA","asset":"music/ocremix/Sonic_the_Hedgehog_The_Sound_of_Speed_OC_ReMix.mp3","gain":0.25704,"remixTitle":"The Sound of Speed","remixer":"OceansAndrew, Scaredsim","composer":"Masato Nakamura","source":"https://ocremix.org/remix/OCR02219"},
    {"id":"sonic-chemical-plant","zh":"索尼克 · 化工厂（改编）","en":"Sonic · Chemical Plant (ReMix)","group":"sonic","game":"Sonic the Hedgehog 2","owner":"SEGA","asset":"music/ocremix/Sonic_the_Hedgehog_2_Chemical_Fusion_OC_ReMix.mp3","gain":0.30761,"remixTitle":"Chemical Fusion","remixer":"jnWake","composer":"Masato Nakamura","source":"https://ocremix.org/remix/OCR03563"},
    {"id":"zelda-lost-woods","zh":"塞尔达 · 迷失森林（改编）","en":"Zelda · Lost Woods (ReMix)","group":"zelda","game":"The Legend of Zelda: Ocarina of Time","owner":"Nintendo","asset":"music/ocremix/Legend_of_Zelda_Ocarina_of_Time_And_the_Woods_Shall_Dance_OC_ReMix.mp3","gain":0.492606,"remixTitle":"And the Woods Shall Dance","remixer":"theStyg","composer":"Koji Kondo","source":"https://ocremix.org/remix/OCR04191"},
    {"id":"zelda-song-of-storms","zh":"塞尔达 · 风暴之歌（改编）","en":"Zelda · Song of Storms (ReMix)","group":"zelda","game":"The Legend of Zelda: Ocarina of Time","owner":"Nintendo","asset":"music/ocremix/Legend_of_Zelda_Ocarina_of_Time_Storm_Force_Seven_OC_ReMix.mp3","gain":0.313329,"remixTitle":"Storm Force Seven","remixer":"Nostalvania","composer":"Koji Kondo","source":"https://ocremix.org/remix/OCR03201"},
    {"id":"zelda-gerudo-valley","zh":"塞尔达 · 格鲁德山谷（改编）","en":"Zelda · Gerudo Valley (ReMix)","group":"zelda","game":"The Legend of Zelda: Ocarina of Time","owner":"Nintendo","asset":"music/ocremix/Legend_of_Zelda_Ocarina_of_Time_Mamacitas_in_My_Valley_OC_ReMix.mp3","gain":0.314051,"remixTitle":"Mamacitas in My Valley","remixer":"Diggi Dis","composer":"Koji Kondo","source":"https://ocremix.org/remix/OCR01732"},
    {"id":"tetris-theme","zh":"俄罗斯方块 · 主题（改编）","en":"Tetris · Theme A (ReMix)","group":"tetris","game":"Tetris (Game Boy)","owner":"Nintendo","asset":"music/ocremix/Tetris_Gift_from_Moscow_OC_ReMix.mp3","gain":0.57544,"remixTitle":"Gift from Moscow","remixer":"MkVaff","composer":"Hirokazu Tanaka; traditional Korobeiniki melody","source":"https://ocremix.org/remix/OCR00826"}
  ];
  let audio = null, audioTrack = null, selected = 0, wanted = false, loading = false, error = false, ticket = 0, volume = .16;
  let envelopeTimer = null;
  let widget, toggle, settings, panel, slider, readout, notice, selector, previous, next;
  const compactMenu = matchMedia('(max-width: 720px)');
  try {
    const saved = localStorage.getItem('q-bgm-volume');
    if (saved !== null && Number.isFinite(Number(saved))) volume = Math.max(0, Math.min(1, Number(saved)));
    const savedTrack = tracks.findIndex(track => track.id === localStorage.getItem('q-bgm-track'));
    if (savedTrack >= 0) selected = savedTrack;
  } catch { /* Storage is optional; never block playback controls. */ }
  const english = () => document.documentElement.lang.startsWith('en');
  const words = () => english() ? {
    entry:'Music', controlPlay:'Play', controlPause:'Pause', title:'Classic games', play:'Play background music', pause:'Pause background music',
    settings:'Music settings', track:'Track', previous:'Previous track', next:'Next track', sources:'Track sources', volume:'Volume',
    fail:'Music could not play. Press Play to retry.', media:'Pause the video before starting music.',
  } : {
    entry:'音乐', controlPlay:'播放', controlPause:'暂停', title:'经典游戏', play:'开启背景音乐', pause:'暂停背景音乐',
    settings:'音乐设置', track:'曲目', previous:'上一首', next:'下一首', sources:'曲目来源', volume:'音量',
    fail:'音乐暂时无法播放，请点击播放重试。', media:'请先暂停视频，再开启背景音乐。',
  };
  const render = () => {
    if (!widget) return;
    const text = words(), track = tracks[selected], playing = !!audio && !audio.paused && !loading;
    widget.dataset.playing = String(playing);
    toggle.setAttribute('aria-pressed', String(wanted));
    toggle.setAttribute('aria-label', wanted ? text.pause : text.play);
    toggle.title = wanted ? text.pause : text.play;
    toggle.querySelector('[data-bgm-state]').textContent = loading ? '…' : wanted ? text.controlPause : text.controlPlay;
    settings.querySelector('[data-bgm-entry]').textContent = text.entry;
    settings.setAttribute('aria-label', text.settings); settings.title = text.settings;
    panel.setAttribute('aria-label', text.settings);
    panel.querySelector('[data-bgm-title]').textContent = text.title;
    panel.querySelector('label[for="q-bgm-track"]').textContent = text.track;
    panel.querySelector('[data-bgm-count]').textContent = `${selected + 1} / ${tracks.length}`;
    tracks.forEach((item, index) => { selector.options[index].textContent = english() ? item.en : item.zh; });
    [...selector.querySelectorAll('optgroup')].forEach(group => { group.label = groups[group.dataset.bgmGroup][english() ? 'en' : 'zh']; });
    selector.value = track.id; selector.title = english() ? track.en : track.zh;
    [previous, next].forEach((button, index) => { const name = index ? text.next : text.previous; button.setAttribute('aria-label', name); button.title = name; });
    panel.querySelector('[data-bgm-game]').textContent = `${track.game} · ${track.owner}`;
    const attribution = panel.querySelector('[data-bgm-attribution]');
    attribution.hidden = !track.remixer;
    if (track.remixer) {
      const artist = attribution.querySelector('[data-bgm-remixer]');
      artist.textContent = `${track.remixer} · ${track.remixTitle}`; artist.href = track.source;
    }
    panel.querySelector('[data-bgm-sources]').textContent = text.sources;
    panel.querySelector('label[for="q-bgm-volume"]').textContent = text.volume;
    slider.setAttribute('aria-label', text.volume); slider.value = String(Math.round(volume * 100));
    readout.textContent = Math.round(volume * 100) + '%';
    notice.textContent = error ? (error === 'media' ? text.media : text.fail) : '';
  };
  const closePanel = (restore = false) => {
    if (!panel) return;
    panel.hidden = true; settings.setAttribute('aria-expanded', 'false');
    if (restore) settings.focus({preventScroll:true});
  };
  const showError = reason => {
    wanted = false; loading = false; error = reason;
    audio?.pause(); render();
    panel.hidden = false; settings.setAttribute('aria-expanded', 'true');
  };
  const stop = () => { ++ticket; wanted = false; loading = false; audio?.pause(); render(); };
  const hasForegroundMedia = () => [...document.querySelectorAll('video,audio')].some(el => el !== audio && !el.paused && !el.ended && !el.muted && el.volume > 0);
  // Short playback envelopes soften the edges of archived recordings.
  const clearEnvelope = () => { clearInterval(envelopeTimer); envelopeTimer = null; };
  const applyVolume = () => {
    if (!audio) return;
    const fadeIn = Math.min(1, audio.currentTime / .12);
    const fadeOut = Number.isFinite(audio.duration) ? Math.max(0, Math.min(1, (audio.duration - audio.currentTime) / .2)) : 1;
    audio.volume = volume * tracks[selected].gain * Math.min(fadeIn, fadeOut);
  };
  const ensureAudio = () => {
    if (audio && audioTrack === selected && !audio.error) return audio;
    audio?.pause();
    const player = new Audio(); audio = player; audioTrack = selected;
    player.preload = 'none'; player.volume = 0;
    player.src = new URL(tracks[selected].asset || '../games/mario-mix/assets/' + tracks[selected].file, assetBase).href;
    player.addEventListener('playing', () => { if (player === audio) { loading = false; error = false; clearEnvelope(); applyVolume(); envelopeTimer = setInterval(applyVolume, 25); render(); } });
    player.addEventListener('pause', () => { if (player === audio) { clearEnvelope(); render(); } });
    player.addEventListener('error', () => { if (player === audio && wanted) showError('load'); });
    player.addEventListener('ended', () => { if (player === audio && wanted) { clearEnvelope(); selectTrack((selected + 1) % tracks.length); } });
    return player;
  };
  const start = async () => {
    if (document.hidden) return;
    if (hasForegroundMedia()) { showError('media'); return; }
    const current = ++ticket; wanted = true; loading = true; error = false; render();
    try {
      const player = ensureAudio(); await player.play();
      if (current !== ticket || !wanted || document.hidden) { if (player === audio && !wanted) player.pause(); return; }
      loading = false; render();
    } catch { if (current === ticket && wanted) showError('load'); }
  };
  const selectTrack = index => {
    if (index === selected) return;
    const resume = wanted;
    ++ticket; loading = false; error = false; clearEnvelope(); audio?.pause();
    audio = null; audioTrack = null; selected = index;
    try { localStorage.setItem('q-bgm-track', tracks[selected].id); } catch { /* Optional. */ }
    render(); if (resume) void start();
  };
  const place = () => {
    if (!widget) return;
    const header = document.querySelector('#app .topbar, #app .site-header .bar'); if (!header) return;
    const nav = [...header.children].find(el => el.tagName === 'NAV'), menu = header.querySelector('.q-menu-toggle');
    const target = compactMenu.matches ? header : header.querySelector('.q-header-tools'); if (!target) return;
    if (widget.parentElement !== target) { closePanel(); target.append(widget); }
    const hidden = compactMenu.matches && (!menu || !nav || nav.hidden);
    if (hidden && !widget.hidden) { if (widget.contains(document.activeElement)) menu?.focus({preventScroll:true}); closePanel(); }
    widget.hidden = hidden;
  };
  const mount = () => {
    if (widget || !document.getElementById('app')) return;
    widget = document.createElement('aside'); widget.className = 'q-bgm'; widget.dataset.i18nSkip = '';
    const arrow = direction => `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="${direction === 'previous' ? 'M5 4h2v12H5zm10 0v12L7 10z' : 'M13 4h2v12h-2zM5 4l8 6-8 6z'}"/></svg>`;
    widget.innerHTML = `<button class="q-bgm-settings" type="button" aria-expanded="false" aria-controls="q-bgm-panel"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h3l4-4v12l-4-4H3zM13 7v6m3-8v10"/></svg><span data-bgm-entry></span><span class="q-bgm-dot" aria-hidden="true"></span><svg class="q-bgm-chevron" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m2 4 4 4 4-4"/></svg></button><div class="q-bgm-panel" id="q-bgm-panel" role="group" hidden><div class="q-bgm-panel-head"><strong data-bgm-title></strong><a class="q-bgm-sources" href="/assets/music/game-bgm-credits.txt" target="_blank" rel="noopener" data-bgm-sources></a></div><div class="q-bgm-track-label"><label for="q-bgm-track"></label><span data-bgm-count></span></div><select id="q-bgm-track"></select><span class="q-bgm-track" lang="en" data-bgm-game></span><div class="q-bgm-attribution" data-bgm-attribution hidden><a data-bgm-remixer target="_blank" rel="noopener"></a><a href="https://ocremix.org" target="_blank" rel="noopener" lang="en">OverClocked ReMix</a></div><div class="q-bgm-controls"><button class="q-bgm-step" data-bgm-previous type="button">${arrow('previous')}</button><button class="q-bgm-toggle" type="button" aria-pressed="false"><span data-bgm-state></span></button><button class="q-bgm-step" data-bgm-next type="button">${arrow('next')}</button></div><div class="q-bgm-volume"><label for="q-bgm-volume"></label><output for="q-bgm-volume"></output></div><input type="range" id="q-bgm-volume" min="0" max="100" step="1"><p class="q-bgm-notice" role="status" aria-live="polite"></p></div>`;
    [toggle, settings, panel, slider, readout, notice, selector, previous, next] = ['.q-bgm-toggle','.q-bgm-settings','.q-bgm-panel','input','output','.q-bgm-notice','select','[data-bgm-previous]','[data-bgm-next]'].map(s => widget.querySelector(s));
    const optionGroups = new Map();
    tracks.forEach(track => {
      if (!optionGroups.has(track.group)) { const group = document.createElement('optgroup'); group.dataset.bgmGroup = track.group; selector.append(group); optionGroups.set(track.group, group); }
      const option = document.createElement('option'); option.value = track.id; optionGroups.get(track.group).append(option);
    });
    place();
    toggle.addEventListener('click', () => { if (wanted) stop(); else void start(); });
    selector.addEventListener('change', () => { const index = tracks.findIndex(track => track.id === selector.value); if (index >= 0) selectTrack(index); });
    previous.addEventListener('click', () => selectTrack((selected + tracks.length - 1) % tracks.length));
    next.addEventListener('click', () => selectTrack((selected + 1) % tracks.length));
    settings.addEventListener('click', () => {
      panel.hidden = !panel.hidden; settings.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) toggle.focus({preventScroll:true});
    });
    slider.addEventListener('input', () => {
      volume = Math.max(0, Math.min(1, Number(slider.value) / 100)); applyVolume();
      try { localStorage.setItem('q-bgm-volume', String(volume)); } catch { /* Optional. */ } render();
    });
    document.addEventListener('pointerdown', event => { if (!widget.contains(event.target)) closePanel(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); closePanel(widget.contains(document.activeElement)); } }, true);
    const observer = new MutationObserver(records => {
      if (records.some(r => (r.type === 'attributes' && r.target.tagName === 'NAV') || (r.type === 'childList' && !widget.contains(r.target)))) place();
    });
    observer.observe(document.getElementById('app'), {childList:true, subtree:true, attributes:true, attributeFilter:['hidden']});
    compactMenu.addEventListener('change', () => { closePanel(); place(); }); render();
  };
  document.addEventListener('site-language-change', () => { render(); place(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { ++ticket; loading = false; audio?.pause(); render(); } else if (wanted) void start(); });
  // Let a visitor's foreground video or interactive artwork own its soundtrack.
  document.addEventListener('play', event => { const el = event.target; if (el !== audio && el instanceof HTMLMediaElement && !el.muted && el.volume > 0) stop(); }, true);
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]'); if (!link) return;
    let url; try { url = new URL(link.href, location.href); } catch { return; }
    if (/(^|\.)(bilibili\.com|youtube\.com|youtu\.be)$/.test(url.hostname) || /\/play\.html$/.test(url.pathname) || /^\/experiments\/.+\.html$/.test(url.pathname)) stop();
  }, true);
  window.addEventListener('pagehide', stop);
  window.SITE_BGM = {stop, mount:place, get state() { return {enabled:wanted,playing:!!audio&&!audio.paused,loading,volume,trackId:tracks[selected].id,trackCount:tracks.length,currentTime:audio?.currentTime||0}; }};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
})();
