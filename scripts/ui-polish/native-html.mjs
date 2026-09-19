/** R17 build-time migration of known outer-page link decorations.
 * No content-wide arrow replacement; code, styles and scripts stay byte-for-byte.
 * Real href/target/download attributes are retained. No click forwarding. */
export function polishPromoSource(source){
 return source
  .replaceAll('<b aria-hidden="true">↗</b>','')
  .replaceAll('<i aria-hidden="true">→</i>','')
  .replaceAll('<strong>项目 </strong>','<strong>项目</strong>');
}
function append(attrs,name,value){return attrs+` ${name}="${value}"`;}
export function polishStaticLinks(input){
 const protectedBlocks=[];
 const protectedHTML=input.replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,block=>{const i=protectedBlocks.push(block)-1;return `\u0000PROTECTED_R17_${i}\u0000`;});
 const out=protectedHTML.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi,(whole,attrs,body)=>{
  if(/\bdata-action-kind=/.test(attrs)||/\u0000PROTECTED_R17_/.test(body))return whole;
  const h=attrs.match(/\bhref\s*=\s*(["'])([\s\S]*?)\1/i);if(!h)return whole;
  const url=h[2],cls=attrs.match(/\bclass\s*=\s*(["'])(.*?)\1/i)?.[2]||'';
  const download=/\sdownload(?:\s|=|$)/i.test(attrs),external=/^https:\/\//i.test(url);
  const kind=download?'download':external?'external':/^mailto:/i.test(url)?'email':url.startsWith('#')?'anchor':'internal';
  let next=body.replace(/<(span|i|b)\b[^>]*aria-hidden=["']true["'][^>]*>\s*[↗→↓←↖]\s*<\/\1>/g,'');
  next=next.replace(/^\s*[←↖]\s*/,'').replace(/\s*[↗→↓]\s*(?=(?:\s*<\/[^>]+>)*\s*$)/g,'');
  const eligible=/(?:^|\s)(?:button|entry__link|contact-link|q-footer-link)(?:\s|$)/.test(cls);
  if(next===body&&!eligible)return whole;
  attrs=append(attrs,'data-action-kind',kind);
  if(eligible){const variant=/(?:^|\s)button(?:\s|$)/.test(cls)?(/button--quiet/.test(cls)?'secondary':'primary'):'quiet';attrs=append(attrs,'data-action-variant',variant);}
  if(download&&!/\bq-action-meta\b/.test(next))next+=' <span class="q-action-meta" lang="en">ZIP</span>';
  if(/\btarget=["']_blank["']/i.test(attrs)){
   const r=attrs.match(/\brel=(["'])(.*?)\1/i);const tokens=new Set((r?.[2]||'').split(/\s+/).filter(Boolean));tokens.add('noopener');tokens.add('noreferrer');
   const value='rel="'+[...tokens].join(' ')+'"';attrs=r?attrs.replace(r[0],value):attrs+' '+value;
  }
  if(/\btarget=["']_blank["']/i.test(attrs)&&!/<(?:img|svg)\b/i.test(next)&&!/q-action-meta/.test(next)){
   next+=' <span class="q-action-meta">新标签页</span>';
   if(!/\btitle=/.test(attrs))attrs=append(attrs,'title','在新标签页打开');
  }
  return `<a${attrs}>${next}</a>`;
 });
 return out.replace(/\u0000PROTECTED_R17_(\d+)\u0000/g,(_,i)=>protectedBlocks[+i]);
}
