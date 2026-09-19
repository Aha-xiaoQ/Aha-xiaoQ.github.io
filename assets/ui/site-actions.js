/* R17. Shared, pure action markup for static builds and browser renderers.
 * No DOM mutation, listeners, navigation interception, or runtime dependencies. */
(function(root){
 'use strict';
 const version='site-actions-r17';
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
 root.SITE_ACTIONS=Object.freeze({version,esc,label,inspect,attributes,link});
})(globalThis);
