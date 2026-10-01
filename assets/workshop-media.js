/* WORKSHOP-R07. Pure asset contract + renderer, shared by build and browser.
 * No DOM, network, mutable content state, or project-name branches. */
(function (root) {
  'use strict';
  const VERSION = 'workshop-r08';
  const presets = Object.freeze({
    'character-paper': ['image', 'sprite'], 'character-night': ['image', 'sprite'],
    poster: ['image'], interface: ['image'], blueprint: ['diagram'], 'pixel-window': ['image']
  });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function assert(ok, message) { if (!ok) throw new Error(message); }
  function record(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function keys(value, allowed, label) { assert(record(value), label + ' 必须是对象'); for (const k of Object.keys(value)) assert(allowed.includes(k), label + ' 未知字段：' + k); }
  function localPath(input) {
    assert(typeof input === 'string' && input.length > 0 && input.length <= 2048, '路径必须是非空字符串');
    assert(!/[\x00-\x20\\<>"'`]/.test(input), '路径包含不安全字符');
    let decoded = input; for (let n=0; n<3; n++) { try { const v=decodeURIComponent(decoded); if(v===decoded)break; decoded=v; } catch { throw Error('路径编码错误'); } }
    assert(!/[\x00-\x20\\<>"'`]/.test(decoded), '不安全的路径编码');
    assert(!decoded.startsWith('//') && !/^[a-z][a-z\d+.-]*:/i.test(decoded), '必须使用本站路径');
    const name = decoded.split(/[?#]/)[0].replace(/^\//, '').replace(/\/$/, '');
    assert(name && !name.split('/').some(p=>!p || p==='.' || p==='..' || p==='.git' || p.startsWith('.env')), '不安全的路径段');
    return input;
  }
  function safeURL(input, {asset=false}={}) {
    assert(typeof input === 'string', 'URL 必须是字符串');
    if (/^https:\/\//i.test(input)) {
      const u = new URL(input); assert(u.hostname && !u.username && !u.password, '拒绝带凭证 URL');
      assert(!/[\x00-\x20\\<>"'`]/.test(input), 'URL 包含不安全字符');
      if(asset) assert(/\.(?:png|jpe?g|webp|gif|svg|avif)$/i.test(u.pathname), '仅允许图片文件');
      return input;
    }
    localPath(input);
    if(asset) assert(/\.(?:png|jpe?g|webp|gif|svg|avif)$/i.test(input.split(/[?#]/)[0]), '仅允许图片文件');
    return input;
  }
  function validateEntry(entry) {
    keys(entry, ['kind','preset','src','alt','fit','position','rendering','tone','sprite','categoryLabel'], '素材');
    assert(Object.hasOwn(presets, entry.preset), '未知背景预设');
    assert(presets[entry.preset].includes(entry.kind), '背景预设与素材类型不兼容');
    assert(entry.categoryLabel===undefined || (typeof entry.categoryLabel==='string' && entry.categoryLabel.trim().length>0 && [...entry.categoryLabel].length<=24), 'categoryLabel 必须是 1–24 字的分类文字');
    assert(entry.alt===undefined || typeof entry.alt==='string', 'alt 必须是文字');
    assert(entry.tone===undefined || ['dark','paper'].includes(entry.tone), 'tone 只能是 dark 或 paper');
    assert(entry.fit===undefined || ['contain','cover'].includes(entry.fit), '非法 fit');
    assert(entry.fit!=='cover' || entry.preset==='pixel-window', '海报、界面与角色不可裁切');
    assert(entry.rendering===undefined || ['auto','pixelated'].includes(entry.rendering), '非法 rendering');
    if(entry.position!==undefined) {
      const m=typeof entry.position==='string' && entry.position.match(/^(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%$/);
      assert(m && +m[1]<=100 && +m[2]<=100, 'position 必须是两个 0–100% 百分比');
    }
    if(entry.kind==='diagram') { assert(entry.src===undefined && entry.sprite===undefined, 'diagram 不能附带图像源'); }
    else safeURL(entry.src,{asset:true});
    if(entry.kind==='sprite') {
      keys(entry.sprite, ['width','height','columns','rows','frames','durationMs'], '精灵');
      const s=entry.sprite;
      for(const k of ['width','height','columns','rows','frames','durationMs'])assert(Number.isInteger(s[k]) && s[k]>0, '精灵参数必须为正整数：'+k);
      assert(s.width<=2048 && s.height<=2048 && s.columns<=64 && s.rows<=64, '精灵尺寸超限');
      assert(s.frames<=s.columns && s.durationMs>=100 && s.durationMs<=60000, '只支持第一行连续帧，且时长为 100–60000ms');
    } else assert(entry.sprite===undefined, '只有 sprite 使用精灵配置');
    return entry;
  }
  function validateManifest(manifest) {
    keys(manifest, ['schemaVersion','entries'], '表现配置');
    assert(manifest.schemaVersion===1 && record(manifest.entries), '不支持的表现配置版本');
    for(const [id,entry] of Object.entries(manifest.entries)) {
      assert(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id) && !['constructor','prototype'].includes(id), '非法内容 ID：'+id);
      validateEntry(entry);
    }
    return manifest;
  }
  function resolve(item, {type='project',manifest={schemaVersion:1,entries:{}}}={}) {
    if(Object.hasOwn(manifest.entries,item.id))return validateEntry(manifest.entries[item.id]);
    const src = type==='tool' ? item.preview : item.cover;
    if(src) return validateEntry({kind:'image',preset:type==='tool'?'interface':'poster',src,alt:type==='tool'?(item.previewAlt||''): '',fit:'contain',rendering:'auto'});
    return {kind:'diagram',preset:'blueprint',tone:'dark',alt:''};
  }
  function assetHref(src, base='') { safeURL(src,{asset:true}); return /^https:\/\//i.test(src)||src.startsWith('/') ? src : base+src; }
  function render(entry, {base='',index=0}={}) {
    validateEntry(entry);
    const preset=entry.preset, fit=entry.fit||'contain', pixel=entry.rendering==='pixelated';
    const attrs=`class="pw-media pw-media--${preset}" data-media-kind="${entry.kind}" data-media-preset="${preset}"`;
    const loading=index<2?'eager':'lazy';
    const fallback='<span class="pw-media-fallback" hidden>预览暂不可用<span>作品介绍与入口仍可使用</span></span>';
    if(entry.kind==='diagram') return `<div ${attrs}><div class="pw-media-diagram" aria-hidden="true"><span>01<br><b>IDEA</b></span><i>→</i><span>02<br><b>BUILD</b></span><i>→</i><span>03<br><b>REFINE</b></span></div></div>`;
    const src=esc(assetHref(entry.src,base));
    if(entry.kind==='sprite') {
      const s=entry.sprite;
      const style=`--pw-frame-w:${s.width}px;--pw-frame-h:${s.height}px;--pw-sheet-w:${s.width*s.columns}px;--pw-sheet-h:${s.height*s.rows}px;--pw-strip-end:-${s.frames/s.columns*100}%;--pw-columns:${s.columns};--pw-rows:${s.rows};--pw-frame-ratio:${s.width}/${s.height};--pw-frames:${s.frames};--pw-duration:${s.durationMs}ms`;
      return `<div ${attrs} style="${style}"><span class="pw-sprite-viewport"><img class="pw-sprite-sheet" src="${src}" alt="${esc(entry.alt||'')}" width="${s.width*s.columns}" height="${s.height*s.rows}" loading="${loading}" decoding="async"${pixel?' style="image-rendering:pixelated"':''}></span>${fallback}</div>`;
    }
    // width/height declare slot geometry, not alleged original image dimensions.
    return `<div ${attrs}><img class="pw-media-image" src="${src}" alt="${esc(entry.alt||'')}" width="1600" height="900" loading="${loading}" decoding="async" style="object-fit:${fit};object-position:${entry.position||'50% 50%'};image-rendering:${pixel?'pixelated':'auto'}">${fallback}</div>`;
  }
  root.SITE_MEDIA=Object.freeze({VERSION,presets,esc,localPath,safeURL,validateEntry,validateManifest,resolve,render,assetHref});
})(globalThis);
