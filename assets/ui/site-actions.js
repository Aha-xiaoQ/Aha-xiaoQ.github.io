/* R17. Shared, pure action markup for static builds and browser renderers.
 * No DOM mutation, listeners, navigation interception, or runtime dependencies. */
(function(root){
 'use strict';
 const version='site-actions-video-r1';
 if(root.SITE_ACTIONS?.version===version)return;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function label(value){return String(value??'').trim().replace(/^[←↖]\s*/u,'').replace(/\s*[→↗↓↘]\s*$/u,'').trim();}
 function inspect(href){
  if(typeof href!=='string'||!href||/[\u0000-\u0020\\<>"'`]/u.test(href)||href.startsWith('//'))throw Error('Invalid action URL');
  if(/^[a-z][a-z\d+.-]*:/i.test(href)){
   if(/^mailto:[^?\s]+@[^?\s]+(?:\?.*)?$/i.test(href))return {kind:'email',domain:''};
   const u=new URL(href);if(u.protocol!=='https:'||!u.hostname||u.username||u.password)throw Error('Unsupported action URL');
   const names={'github.com':'GitHub','www.github.com':'GitHub','www.bilibili.com':'Bilibili','space.bilibili.com':'Bilibili','bilibili.com':'Bilibili'};
   return {kind:'external',domain:names[u.hostname]||u.hostname.replace(/^www\./,'')};
  }
  return {kind:href.startsWith('#')?'anchor':'internal',domain:''};
 }
 function attributes(href,{className='',variant='',newTab=false,download=false,ariaLabel='',title=''}={}){
  const info=inspect(href),isDownload=download&&info.kind==='internal',blank=newTab&&info.kind==='external';
  if(download&&!isDownload)throw Error('Downloads must use a same-site path');
  const kind=isDownload?'download':info.kind;
  let result=`class="${esc(className)}" href="${esc(href)}" data-action-kind="${kind}"`;
  if(variant){if(!['primary','secondary','quiet','text','card'].includes(variant))throw Error('Unknown action variant');result+=` data-action-variant="${variant}"`;}
  if(blank)result+=' target="_blank" rel="noopener noreferrer"';
  if(isDownload)result+=' download';
  if(ariaLabel)result+=` aria-label="${esc(label(ariaLabel)+(blank?'（在新标签页打开）':''))}"`;
  const hint=title||(blank?'在新标签页打开':'');if(hint)result+=` title="${esc(hint)}"`;
  return result;
 }
 function link(text,href,options={}){
  const name=label(text);if(!name)throw Error('An action needs a descriptive label');
  const info=inspect(href),blank=!!options.newTab&&info.kind==='external';
  let meta=options.meta;
  if(meta===undefined)meta=options.download?'ZIP':blank?'新标签页':'';
  return `<a ${attributes(href,options)}><span class="q-action-label">${esc(name)}</span>${meta?`<span class="q-action-meta"${options.download?' lang="en"':''}>${esc(meta)}</span>`:''}${blank&&meta!=='新标签页'&&!options.ariaLabel?'<span class="q-action-sr">（在新标签页打开）</span>':''}</a>`;
 }
 function videoPanel(item,{cover='',eager=false}={}){
  if(item.videoSlot!==true)return '';
  let url='';
  if(item.videoUrl){
   const u=new URL(item.videoUrl);
   if(u.protocol!=='https:'||u.hostname!=='www.bilibili.com'||u.username||u.password||u.port||!/^\/video\/BV1[A-Za-z0-9]{9}\/$/.test(u.pathname)||u.search||u.hash)throw Error('Invalid video panel URL');
   url=u.href;
  }
  if(cover)inspect(cover);
  const title=url?'观看视频':'视频待发布',state=url?'available':'pending';
  const image=cover?`<img class="q-video-cover" src="${esc(cover)}" alt="" width="1600" height="900" loading="${eager?'eager':'lazy'}" decoding="async">`:'';
  const icon=url?'<path d="M9 5v14l11-7z"/>':'<path d="M4 9h16v11H4zM4 4h16v5H4zM8 4l3 5M14 4l3 5"/>';
  const inside=`${image}<span class="q-video-shade" aria-hidden="true"></span><span class="q-video-copy"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${icon}</svg><strong>${title}</strong><span>${url?'Bilibili · 新标签页打开':'制作视频准备中'}</span></span>`;
  const attrs=`data-video-slot="${esc(item.id||item.slug||'video')}" data-video-state="${state}"`;
  return url?`<a ${attributes(url,{className:'q-video-panel',variant:'card',newTab:true,ariaLabel:'观看 '+item.title+' 视频'})} ${attrs}>${inside}</a>`:`<div class="q-video-panel q-video-panel--pending" ${attrs} role="group" aria-label="${esc(item.title)}：视频待发布">${inside}</div>`;
 }
 function videoPending(item){return item.videoSlot===true&&!item.videoUrl?'<span class="q-video-pending-label">视频待发布</span>':'';}
 root.SITE_ACTIONS=Object.freeze({version,esc,label,inspect,attributes,link,videoPanel,videoPending});
})(globalThis);
