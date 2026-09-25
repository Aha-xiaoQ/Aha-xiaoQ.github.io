/** Resource-only integration: page layout, images, and native destinations stay intact. */
import {fileURLToPath} from 'node:url';
import {readOptional} from '../lib/safe-path.mjs';
import {versionResources,mapMarkup,hash} from './assets.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function wirePlatform(input,{root=ROOT,reader=p=>readOptional(root,p),map=null}={}){
  // Standalone games and original experiment artifacts never receive site scripts.
  if(!/\bsrc=["'][^"']*assets\/site-i18n\.js(?:\?[^"']*)?["']/.test(input))return input;
  let s=input.replace(/<script\b[^>]*data-platform-(?:messages|identity|importmap)[^>]*>[\s\S]*?<\/script>\s*/g,'').replace(/<link\b[^>]*data-platform-typography[^>]*>\s*/g,'');
  const script=/<script\b[^>]*\bsrc=["'][^"']*assets\/site-i18n\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/g;
  if([...s.matchAll(script)].length!==1)throw Error('Expected exactly one locale owner');
  if(!/<head\b[^>]*>/.test(s)||!s.includes('</head>'))throw Error('Website entry lacks a head');
  const saved=map||JSON.parse(reader('assets/platform/import-map.json')||'{"imports":{}}');
  if(!saved.imports||typeof saved.imports!=='object'||Array.isArray(saved.imports))throw Error('Invalid platform import map');
  s=s.replace(/(<head\b[^>]*>)\s*/,(_,head)=>head+'\n'+mapMarkup(saved)+'\n');
  s=s.replace(/\s*<\/head>/,'\n<link rel="stylesheet" data-platform-typography href="/assets/platform/typography.css">\n</head>');
  s=s.replace(script,m=>'<script data-platform-identity src="/assets/platform/config.js"></script>\n<script data-platform-messages src="/assets/i18n/messages.js"></script>\n'+m);
  s=s.replace(/<script\b([^>]*)>/g,(tag,attrs)=>{
    if(!/\btype=["']module["']/.test(attrs))return tag;
    return tag.replace(/(\bsrc=["'])([^"']+)(["'])/,(all,a,url,z)=>{
      const rel=url.replace(/^(?:\.\.\/)+/,'').replace(/^\//,'').split(/[?#]/)[0];
      if(!/^assets\/[^\\]+\.(?:mjs|js)$/.test(rel)||rel.split('/').includes('..'))return all;
      const bytes=reader(rel);if(!bytes)throw Error('Missing module entry: '+rel);
      const parsed=new URL('/'+rel+(url.includes('?')?'?'+url.split('?')[1]:''),'https://entry.invalid');parsed.searchParams.set('v',hash(bytes));
      return a+parsed.pathname+parsed.search+parsed.hash+z;
    });
  });
  return versionResources(s,reader);
}
