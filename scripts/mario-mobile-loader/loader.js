/* Versioned, verified gzip-part loader. No dependency on the game runtime. */
(() => {
  'use strict';
  const config = __LOADER_CONFIG__;
  const status = document.getElementById('status');
  const detail = document.getElementById('detail');
  const progress = document.getElementById('progress');
  const retry = document.getElementById('retry');
  const total = config.parts.reduce((sum, part) => sum + part.bytes, 0);
  const cacheName = 'mario-mix-' + config.version + '-' + config.htmlSha256.slice(0, 16);
  const mb = bytes => (bytes / 1048576).toFixed(1) + ' MB';
  let running = false;

  async function valid(bytes, part) {
    if (bytes.byteLength !== part.bytes) return false;
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('') === part.sha256;
  }

  async function run() {
    if (running) return;
    running = true;
    retry.hidden = true;
    progress.hidden = false;
    progress.max = total;
    progress.value = 0;
    status.textContent = '正在加载游戏…';
    detail.textContent = '首次需要下载 ' + mb(total) + '；已保存的内容会直接复用。';
    const controller = new AbortController();
    const received = config.parts.map(() => 0);
    let ended = false;
    let cache = null;
    function update(index, bytes) {
      if (ended) return;
      received[index] = bytes;
      const count = received.reduce((sum, n) => sum + n, 0);
      progress.value = count;
      status.textContent = '正在加载游戏 · ' + Math.floor(count / total * 100) + '%';
      detail.textContent = mb(count) + ' / ' + mb(total);
    }
    async function remove(key) {
      if (cache) try { await cache.delete(key); } catch (_) { /* Storage is optional. */ }
    }
    async function fetchPart(url, part, index) {
      const request = new AbortController();
      let timer;
      let timedOut = false;
      const cancel = () => request.abort();
      const resetTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(() => { timedOut = true; request.abort(); }, config.timeoutMs);
      };
      controller.signal.addEventListener('abort', cancel, {once: true});
      if (controller.signal.aborted) request.abort();
      resetTimer();
      try {
        const response = await fetch(url, {signal: request.signal, cache: 'no-store', credentials: 'omit'});
        if (!response.ok) throw new Error('下载失败（' + response.status + '）');
        if (!response.body) throw new Error('浏览器无法读取下载内容');
        const reader = response.body.getReader();
        const pieces = [];
        let size = 0;
        while (true) {
          const {value, done} = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > part.bytes) { await reader.cancel(); throw new Error('下载内容不完整，请重试'); }
          pieces.push(value);
          update(index, size);
          resetTimer();
        }
        clearTimeout(timer);
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const piece of pieces) { bytes.set(piece, offset); offset += piece.byteLength; }
        if (!await valid(bytes, part)) throw new Error('下载内容校验失败，请重试');
        return bytes;
      } catch (error) {
        if (timedOut) throw new Error('下载暂时没有响应，请检查网络后重试');
        throw error;
      } finally {
        clearTimeout(timer);
        controller.signal.removeEventListener('abort', cancel);
      }
    }
    async function loadPart(part, index) {
      const primary = new URL(part.url, location.href).href;
      const key = new URL(primary);
      key.searchParams.set('mario_sha256', part.sha256);
      if (cache) {
        try {
          const saved = await cache.match(key.href);
          if (saved) {
            const bytes = await saved.arrayBuffer();
            if (await valid(bytes, part)) { update(index, bytes.byteLength); return bytes; }
            await remove(key.href);
          }
        } catch (_) { /* Cache read or quota failure must not block normal loading. */ }
      }
      const urls = [primary];
      if (part.fallback) {
        const fallback = new URL(part.fallback, location.href);
        if (fallback.origin === location.origin && fallback.href !== primary) urls.push(fallback.href);
      }
      let lastError;
      for (const url of urls) {
        if (controller.signal.aborted) throw new Error('下载已中止');
        try {
          update(index, 0);
          const bytes = await fetchPart(url, part, index);
          if (cache) try { await cache.put(key.href, new Response(bytes, {headers: {'Content-Type': 'application/octet-stream'}})); } catch (_) { /* Quota/private mode: continue. */ }
          return bytes;
        } catch (error) { lastError = error; }
      }
      throw lastError;
    }
    let jobs = [];
    try {
      if (!('DecompressionStream' in window) || !crypto.subtle) throw new Error('请用新版浏览器在线打开游戏，或下载离线版');
      try { cache = await caches.open(cacheName); } catch (_) { /* Optional on restricted browsers. */ }
      jobs = config.parts.map((part, index) => loadPart(part, index).catch(error => { controller.abort(); throw error; }));
      const parts = await Promise.all(jobs);
      status.textContent = '下载完成，正在准备游戏…';
      detail.textContent = '正在解压素材，请稍候。';
      let html;
      try {
        const bytes = await new Response(new Blob(parts).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
        if (!await valid(bytes, {bytes: config.htmlBytes, sha256: config.htmlSha256})) throw new Error('HTML integrity mismatch');
        html = new TextDecoder('utf-8', {fatal: true}).decode(bytes);
      } catch (error) {
        // All individual hashes match: a malformed archive should never be installed.
        if (cache) try { await caches.delete(cacheName); } catch (_) {}
        throw new Error('游戏包无法解压，请重试或下载离线版');
      }
      ended = true;
      document.open();
      document.write(html);
      document.close();
    } catch (error) {
      ended = true;
      controller.abort();
      await Promise.allSettled(jobs);
      status.textContent = '游戏加载未完成';
      detail.textContent = (error?.name === 'TypeError' ? '网络连接中断，请检查网络后重试。' : error?.message || '请检查网络后重试。') + ' 已保存的完整内容无需重新下载。';
      retry.hidden = false;
    } finally {
      running = false;
    }
  }
  retry.addEventListener('click', run);
  run();
})();
