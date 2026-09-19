#!/usr/bin/env node
/** Narrow R17 release contract, not a general HTML/a11y audit. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readOptional,safe} from '../lib/safe-path.mjs';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function checkUI(root=ROOT){
 const read=p=>{const b=readOptional(root,p);if(!b)throw Error('Missing UI input: '+p);return b.toString('utf8');};
 const pages=new Set(['index.html',...Object.keys(JSON.parse(read('docs/development/generated-pages.json')).files),...Object.keys(JSON.parse(read('docs/design-r07/generated-pages.json')).files).filter(p=>p.endsWith('.html'))]);
 const issues=[];let links=0;
 for(const p of pages){
  const html=read(p);
  if(!/<main\b/.test(html))continue;
  if((html.match(/data-site-actions-css/g)||[]).length!==1)issues.push(p+': interaction stylesheet must occur once');
  if((html.match(/site-actions\.js\?/g)||[]).length!==1)issues.push(p+': interaction helper must occur once');
  const helper=html.indexOf('site-actions.js'),first=[html.indexOf('assets/promo.js'),html.indexOf('assets/site-shell.js')].filter(n=>n>=0);
  if(helper<0||first.some(n=>helper>n))issues.push(p+': helper must precede site renderers');
  const text=html.replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  for(const match of text.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
   links++;const [all,attrs,body]=match,label=body.replace(/<[^>]+>/g,'').trim();
   if(/<a\b/i.test(body))issues.push(p+': nested anchors');
   if(/^[←↖]|[↗→↓]\s*$/u.test(label))issues.push(p+': decorative navigation arrow: '+label);
   if(!/\bhref\s*=/.test(attrs))issues.push(p+': navigation anchor missing href');
   if(/\bdata-action-kind=/.test(attrs)&&/\btarget="_blank"/.test(attrs)&&!/(?:新标签页|noopener)/.test(all))issues.push(p+': missing external-link context');
  }
 }
 const required=['assets/ui/site-actions.js','assets/ui/site-actions.css'];for(const p of required)safe(root,p);
 if(issues.length)throw Error(issues.join('\n'));
 return{pages:pages.size,anchors:links,status:'passed',scope:'R17 link and load-order contract; not full browser, screen-reader, or performance certification'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkUI(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
