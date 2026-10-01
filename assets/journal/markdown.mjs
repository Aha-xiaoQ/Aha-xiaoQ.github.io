/** A deliberately small, HTML-free Markdown renderer for curated documents. */
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function safeLink(value) {
  if (typeof value !== 'string' || !value || /[\s\\\u0000-\u001f\u007f<>"']/.test(value)) return null;
  if (value.startsWith('#')) return value;
  if (value.startsWith('/') && !value.startsWith('//')) {
    try {
      const path = decodeURIComponent(value.split(/[?#]/)[0]);
      if (/[\\\u0000-\u001f\u007f]/.test(path) || path.startsWith('//') || path.split('/').some(x => x === '.' || x === '..')) return null;
      return value;
    } catch { return null; }
  }
  if (/^https?:\/\//i.test(value)) {
    try { const url = new URL(value); return url.hostname && !url.username && !url.password ? value : null; } catch { return null; }
  }
  return null;
}

export function renderMarkdown(text, {resolveLink, headingOffset = 0, omitFirstHeading = false} = {}) {
  const offset = Number.isInteger(headingOffset) ? Math.max(0, headingOffset) : 0;
  const usedIds = new Set();
  function href(raw) {
    // A resolver may translate relative source paths, never revive unsafe schemes.
    if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return null;
    if (raw.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(raw)) return null;
    let value = raw;
    if (resolveLink) {
      try { value = resolveLink(raw); } catch { return null; }
    }
    return safeLink(value);
  }
  function inline(source, depth = 0, allowLinks = true) {
    if (depth > 24) return escape(source);
    let out = '', i = 0;
    while (i < source.length) {
      if (source[i] === '\\' && /[\\`*_{}\[\]()#+.!|>-]/.test(source[i+1] || '')) { out += escape(source[i+1]); i += 2; continue; }
      const ticks = source.slice(i).match(/^`+/);
      if (ticks) {
        const end = source.indexOf(ticks[0], i + ticks[0].length);
        if (end >= 0) { out += `<code>${escape(source.slice(i+ticks[0].length,end))}</code>`; i=end+ticks[0].length; continue; }
      }
      if (source[i] === '[' && allowLinks) {
        const middle=source.indexOf('](',i+1);
        if (middle >= 0) {
          let end=middle+2, nesting=1;
          for (;end<source.length;end++) { if(source[end]==='(')nesting++; if(source[end]===')' && --nesting===0)break; }
          if (end<source.length) {
            const label=inline(source.slice(i+1,middle),depth+1,false), target=href(source.slice(middle+2,end));
            out += target ? `<a href="${escape(target)}">${label}</a>` : label;
            i=end+1; continue;
          }
        }
      }
      const marker = source.startsWith('**',i) ? '**' : source.startsWith('__',i) ? '__' : /[*_]/.test(source[i]) ? source[i] : null;
      if (marker && !(marker.includes('_') && /[\p{L}\p{N}]/u.test(source[i-1] || ''))) {
        const end=source.indexOf(marker,i+marker.length);
        if(end>i+marker.length) {const tag=marker.length===2?'strong':'em';out+=`<${tag}>${inline(source.slice(i+marker.length,end),depth+1,allowLinks)}</${tag}>`;i=end+marker.length;continue;}
      }
      out += escape(source[i++]);
    }
    return out;
  }
  function headingId(source) {
    const plain=source.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/<[^>]*>/g,'').replace(/[`*_]/g,'').toLowerCase();
    const base=plain.replace(/[^\p{L}\p{M}\p{N}\s_-]/gu,'').replace(/\s/g,'-');
    let id=base, n=0; while(usedIds.has(id)) id=`${base}-${++n}`; usedIds.add(id); return id;
  }
  const listItem = line => line.match(/^( *)([-+*]|\d+[.)]) +(.*)$/);
  function cells(line) {
    let s=line.trim(); if(s.startsWith('|'))s=s.slice(1); if(s.endsWith('|')&&!s.endsWith('\\|'))s=s.slice(0,-1);
    const result=[];let cell='',ticks=0;
    for(let i=0;i<s.length;i++) {
      if(s[i]==='\\'&&i+1<s.length){cell+=s[i]+s[++i];continue;}
      if(s[i]==='`'){let n=1;while(s[i+n]==='`')n++;if(!ticks)ticks=n;else if(ticks===n)ticks=0;cell+='`'.repeat(n);i+=n-1;continue;}
      if(s[i]==='|'&&!ticks){result.push(cell.trim());cell='';}else cell+=s[i];
    }
    result.push(cell.trim());return result;
  }
  const divider = line => /^ {0,3}(?:\*\s*){3,}$|^ {0,3}(?:-\s*){3,}$|^ {0,3}(?:_\s*){3,}$/.test(line);
  const tableRule = line => cells(line).every(x=>/^:?-{3,}:?$/.test(x));
  function blocks(lines, depth=0) {
    if(depth>24)return `<pre>${escape(lines.join('\n'))}</pre>`;
    let out='',i=0;
    const firstContent = lines.findIndex(line => line.trim());
    const heading = (original, title) => {
      const id = escape(headingId(title));
      if (omitFirstHeading && depth === 0 && i === firstContent && original === 1) return `<span id="${id}"></span>`;
      const level = Math.min(6, original + offset);
      return `<h${level} id="${id}" tabindex="-1">${inline(title)}</h${level}>`;
    };
    while(i<lines.length) {
      const line=lines[i];if(!line.trim()){i++;continue;}
      const fence=line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if(fence){const content=[];i++;const closing=new RegExp('^ {0,3}'+fence[1][0]+'{'+fence[1].length+',}\\s*$');while(i<lines.length&&!closing.test(lines[i]))content.push(lines[i++]);if(i<lines.length)i++;
        out+=`<div data-code-example><pre tabindex="0" aria-label="可复制的命令"><code>${escape(content.join('\n'))}</code></pre><button class="button button--quiet" type="button" data-copy-code>复制命令</button><p class="j-small" role="status" data-copy-status></p></div>`;continue;}
      const h=line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*$/);
      if(h){const title=h[2].replace(/\s+#+\s*$/,'');out+=heading(h[1].length,title);i++;continue;}
      if(i+1<lines.length && /^ {0,3}(=+|-+)\s*$/.test(lines[i+1])&&!listItem(line)){const level=lines[i+1].trim()[0]==='='?1:2;out+=heading(level,line.trim());i+=2;continue;}
      if(divider(line)){out+='<hr>';i++;continue;}
      if(/^ {0,3}>/.test(line)){const quote=[];while(i<lines.length&&/^ {0,3}>/.test(lines[i]))quote.push(lines[i++].replace(/^ {0,3}> ?/,''));out+=`<blockquote>${blocks(quote,depth+1)}</blockquote>`;continue;}
      const first=listItem(line);
      if(first){const indent=first[1].length,ordered=/\d/.test(first[2]),tag=ordered?'ol':'ul';out+=`<${tag}${ordered&&parseInt(first[2],10)!==1?` start="${parseInt(first[2],10)}"`:''}>`;
        while(i<lines.length){const item=listItem(lines[i]);if(!item||item[1].length!==indent||/\d/.test(item[2])!==ordered)break;const body=[item[3]],offset=indent+item[2].length+1;i++;
          while(i<lines.length){const next=listItem(lines[i]);if(next&&next[1].length<=indent)break;if(!lines[i].trim()){if(i+1<lines.length&&lines[i+1].match(/^ */)[0].length>indent){body.push('');i++;continue;}break;}if(lines[i].match(/^ */)[0].length<=indent)break;body.push(lines[i].slice(Math.min(offset,lines[i].match(/^ */)[0].length)));i++;}
          out+=`<li>${blocks(body,depth+1)}</li>`;
        }out+=`</${tag}>`;continue;}
      if(i+1<lines.length && line.includes('|') && tableRule(lines[i+1])){const headers=cells(line),rules=cells(lines[i+1]);if(headers.length===rules.length){out+='<div class="j-table-scroll"><table><thead><tr>'+headers.map(x=>`<th>${inline(x)}</th>`).join('')+'</tr></thead><tbody>';i+=2;while(i<lines.length&&lines[i].trim()&&lines[i].includes('|')){const row=cells(lines[i++]);out+='<tr>'+headers.map((_,n)=>`<td>${inline(row[n]||'')}</td>`).join('')+'</tr>';}out+='</tbody></table></div>';continue;}}
      const paragraph=[line.trim()];i++;
      while(i<lines.length&&lines[i].trim()&&!/^ {0,3}(?:#{1,6}\s|>|`{3,}|~{3,})/.test(lines[i])&&!divider(lines[i])&&!listItem(lines[i])&&!(i+1<lines.length&&tableRule(lines[i+1])&&lines[i].includes('|')))paragraph.push(lines[i++].trim());
      out+=`<p>${inline(paragraph.join('\n'))}</p>`;
    }
    return out;
  }
  return blocks(String(text).replace(/\r\n?/g,'\n').split('\n'));
}
