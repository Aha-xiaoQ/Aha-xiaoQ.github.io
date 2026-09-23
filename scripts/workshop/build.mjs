#!/usr/bin/env node
/** WORKSHOP-R08. Shared static list builder. Reads content; never copies assets or deploys. */
import {wireExperience} from '../experience/wire.mjs';
import {polishStaticLinks} from '../ui-polish/native-html.mjs';
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
import {fileURLToPath}from'node:url';import{createHash}from'node:crypto';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const hash=b=>createHash('sha256').update(b).digest('hex');
const RECORD='docs/design-r07/generated-pages.json';
const PAGES={projects:'projects/index.html',games:'games/index.html',tools:'tools/index.html'};
export {safe} from '../lib/safe-path.mjs';
import {safe, readOptional, writeAtomic} from '../lib/safe-path.mjs';
import {normalizeText,equalText,matchesTextHash} from '../lib/text-records.mjs';
export function read(root,rel){return readOptional(root,rel);}
const utf=normalizeText;
export function versionAssets(html){
 return html.replace(/(\b(?:src|href)=["'])([^"']+)(["'])/g,(all,lead,url,quote)=>{
  if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url))return all;
  const normalized=url.replace(/^(?:\.\.\/)+/,'').replace(/^\//,'');
  const rel=normalized.split(/[?#]/)[0];
  if(!['content/site-data.js','assets/site-brand-tokens.css','assets/workshop-cards.js','assets/ui/site-actions.js','assets/ui/site-actions.css','assets/launch/journey.js','assets/journal/model.mjs','assets/site-router.js','assets/journal/journal.css'].includes(rel))return all;
  const bytes=read(ROOT,rel);if(!bytes)return all;
  const base=url.split(/[?#]/)[0];
  return lead+base+'?v='+hash(bytes).slice(0,16)+quote;
 });
}
export function wireHTML(input){
 let html=polishStaticLinks(input).replace(/<noscript\b[^>]*data-workshop-noscript[^>]*>[\s\S]*?<\/noscript>\s*/g,'');
 const footerPaths={GitHub:'<path d="M6 12.8c-3 1-3-1.5-4.2-1.8M10.2 14v-2.5c.1-.8-.2-1.5-.7-2 2.4-.3 4.9-1.2 4.9-5.3A4.1 4.1 0 0 0 13.3 1.4 3.8 3.8 0 0 0 13.2-1 4 4 0 0 0 10.4.1a9.7 9.7 0 0 0-4.8 0A4 4 0 0 0 2.8-1a3.8 3.8 0 0 0-.1 2.4 4.1 4.1 0 0 0-1.1 2.8c0 4.1 2.5 5 4.9 5.3-.5.5-.8 1.2-.7 2V14" />',Bilibili:'<path d="M3 4.7h10v7.2H3zM5.3 2.4l1.4 1.4m2.6-1.4L8 3.8M6 7.6h.1m3.8 0h.1M5.7 10c1.4.8 3.2.8 4.6 0" />',邮箱:'<path d="M2.2 4.1h11.6v7.8H2.2zM2.7 4.7 8 8.6l5.3-3.9" />'};
 const addFooterIcons=(source)=>source.replace(
  /(<span class="footer-links">)([\s\S]*?)(<\/span>)/g,
  (all,start,body,end)=>{
   const links=body.replace(
    /<a\b([^>]*)>(GitHub|Bilibili|邮箱)(?: ↗)?<\/a>/g,
    (link,attrs,label)=>`<a${attrs}><svg class="q-footer-icon" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${footerPaths[label]}</svg><span class="q-action-label">${label}</span></a>`
   );
   return start+links+end;
  }
 );
 html=addFooterIcons(html);
 html=html.replace(/<link\b[^>]*(?:data-media-css|data-workshop-css|data-site-actions-css)[^>]*>\s*/g,'');
 if(!/<\/head>/i.test(html))throw Error('页面缺少 head');
 html=html.replace(/\s*<\/head>/i,'\n<link rel="stylesheet" data-workshop-css href="/assets/workshop-components.css?v=workshop-r08">\n<link rel="stylesheet" data-media-css href="/assets/workshop-media.css?v=workshop-r08">\n<link rel="stylesheet" data-site-actions-css href="/assets/ui/site-actions.css?v=align-r27">\n</head>');
 html=html.replace(/<script\b[^>]*\bsrc=["'][^"']*(?:assets\/workshop-(?:cards|media|media-runtime)\.js|content\/presentation\.js)(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/g,'');
 html=html.replace(/<script\b[^>]*\bsrc=["'][^"']*assets\/ui\/site-actions\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/g,'');
 const first=html.match(/<script\b[^>]*\bsrc=["'][^"']*assets\/(?:promo|site-shell)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/);
 if(first)html=html.replace(first[0],'<script src="/assets/ui/site-actions.js?v=workshop-r17"></script>\n'+first[0]);
 const match=/<script\b[^>]*\bsrc=["'][^"']*assets\/site-shell\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/g;
 const tags=[...html.matchAll(match)];if(tags.length!==1)throw Error('页面必须恰有一个主站 shell 脚本');
 const scripts=['/assets/workshop-media.js','/content/presentation.js','/assets/workshop-cards.js','/assets/workshop-media-runtime.js'].map(s=>`<script src="${s}?v=${s.includes("workshop-cards")?"workshop-r17":"workshop-r08"}"></script>`).join('\n');
 const old=tags[0][0],next=old.replace(/(assets\/site-shell\.js)(?:\?[^"']*)?/, '$1?v=workshop-r17');
 html=html.replace(old,scripts+'\n'+next);
 if(/data-page=["'](?:projects|games|tools)["']/.test(html))html=html.replace('</head>','<noscript data-workshop-noscript><style>[data-workshop-filter]{display:none}</style></noscript>\n</head>');
 html=html.replace(/(assets\/site-router\.js)(?:\?[^"']*)?/g,'$1?v=workshop-r17');
 html=html.replace(/(assets\/promo\.js)(?:\?[^"']*)?/g,'$1?v=workshop-r17');
 return versionAssets(wireExperience(html));
}
/** Reject misplaced content before a generated page or search index can omit it. */
export function validateRegistry(data){
 if(!data||!Array.isArray(data.items)||!Array.isArray(data.tools))throw Error('site-data.js 缺少 items/tools 数组');
 const ids=new Set();
 for(const item of [...data.items,...data.tools]){
  if(typeof item.id!=='string'||ids.has(item.id))throw Error('内容 ID 缺少或重复');
  ids.add(item.id);
 }
 if((data.profile?.now?.items||[]).some(item=>item?.primaryType||item?.evidenceIds))throw Error('作品必须登记在顶层 items，不能放入 profile.now.items');
 const evidenceIds=new Set();
 for(const evidence of data.evidence||[]){
  if(typeof evidence.id!=='string'||evidenceIds.has(evidence.id))throw Error('证据 ID 缺少或重复');
  evidenceIds.add(evidence.id);
  if(evidence.sourceItemId&&!ids.has(evidence.sourceItemId))throw Error('证据指向未登记的作品：'+evidence.sourceItemId);
 }
 for(const item of [...data.items,...data.tools])for(const id of item.evidenceIds||[])if(!evidenceIds.has(id))throw Error('作品引用未登记的证据：'+id);
 return data;
}
export async function load(root,{reader=p=>read(root,p)}={}){
 const get=async p=>{const b=await reader(p);if(b===null||b===undefined)throw Error('缺少必要文件：'+p);return utf(b);};
 const context=vm.createContext({URL});
 for(const p of ['assets/ui/site-actions.js','assets/workshop-media.js','content/site-data.js','assets/workshop-cards.js'])new vm.Script(await get(p),{filename:p}).runInContext(context,{timeout:1000});
 const taxonomy=await reader('content/taxonomy.js');if(taxonomy)new vm.Script(utf(taxonomy)).runInContext(context,{timeout:1000});
 const manifest=JSON.parse(await get('content/presentation.json'));context.SITE_MEDIA.validateManifest(manifest);
 validateRegistry(context.SITE_DATA);
 return {context,manifest,get};
}
export async function planCollections(root,{reader=p=>read(root,p)}={}){
 const {context,manifest,get}=await load(root,{reader});const pages=new Map();
 for(const [page,file]of Object.entries(PAGES)){
  let html=await get(file);
  if(!new RegExp(`data-page=["']${page}["']`).test(html))throw Error('集合模板身份不符：'+file);
  if((html.match(/<main\b/gi)||[]).length!==1||(html.match(/<\/main>/gi)||[]).length!==1)throw Error('集合模板 main 边界不唯一：'+file);
  const body=context.SITE_WORKSHOP.renderCollection(page,context.SITE_DATA,context.SITE_TAXONOMY||{},{base:'../',manifest});
  html=html.replace(/<main\b[\s\S]*?<\/main>/i,body).replace(/data-prerendered=["'](?:false|true)["']/,'data-prerendered="true"');
  html=wireHTML(html);
  if(!html.includes('data-workshop-noscript'))html=html.replace('</head>','<noscript data-workshop-noscript><style>[data-workshop-filter]{display:none}</style></noscript>\n</head>');
  pages.set(file,Buffer.from(html));
 }
 const safeJSON=JSON.stringify(manifest,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 pages.set('content/presentation.js',Buffer.from('// Generated by npm run site:build; edit presentation.json instead.\n'+`globalThis.SITE_PRESENTATION = ${safeJSON};\n`));
 return{pages,manifest};
}
export async function build(root=ROOT,{check=false}={}){
 const previous=JSON.parse(utf(read(root,RECORD)||'{"files":{}}'));
 const {pages}=await planCollections(root);const changes=[];
 for(const [p,b]of pages){const old=read(root,p);if(old&&previous.files[p]&&!matchesTextHash(old,previous.files[p]))throw Error('生成文件有手工修改，请先合并：'+p);if(equalText(old,b))continue;if(old&&(!previous.files[p]||!matchesTextHash(old,previous.files[p])))throw Error('生成文件有手工修改，请先合并：'+p);changes.push({path:p,before:old,after:b});}
 const record=Buffer.from(JSON.stringify({schemaVersion:1,version:'workshop-r08',files:Object.fromEntries([...pages].map(([p,b])=>[p,hash(b)]))},null,2)+'\n');
 if(!equalText(read(root,RECORD),record))changes.push({path:RECORD,before:read(root,RECORD),after:record});
 if(check&&changes.length)throw Error('作品页或素材配置未构建：npm run site:build');
 if(!check){
  for(const c of changes){const b=read(root,c.path);if((b?hash(b):null)!==(c.before?hash(c.before):null))throw Error('构建检查后文件改变：'+c.path);}
  const written=[];try{for(const c of changes){writeAtomic(root,c.path,c.after);written.push(c);}}
  catch(error){for(const c of written.reverse()){if(c.before)writeAtomic(root,c.path,c.before);else fs.rmSync(safe(root,c.path));}throw error;}
 }
 return{changed:changes.length,pages:3};
}
export async function audit(root=ROOT){
 const {context,manifest}=await load(root);const refs=new Map();
 for(const [type,items] of [['project',context.SITE_DATA.items.filter(x=>x.primaryType==='project')],['game',context.SITE_DATA.items.filter(x=>x.primaryType==='game')],['tool',context.SITE_DATA.tools]]){
  for(const item of items){const m=context.SITE_MEDIA.resolve(item,{type,manifest});if(m.src)refs.set(m.src,{id:item.id,src:m.src,preset:m.preset});}
 }
 const result=[];for(const r of refs.values()){
  if(/^https:\/\//.test(r.src)){result.push({...r,status:'external-not-fetched'});continue;}
  const rel=r.src.split(/[?#]/)[0].replace(/^\//,'');const b=read(root,rel);result.push({...r,status:b?'present':'missing',bytes:b?.length??0,review:b&&b.length>600*1024?'large-preview-review':'none'});
 }
 return{files:result,missing:result.filter(x=>x.status==='missing').length,boundary:'Local existence/size only; not licensing or visual inspection'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2);if(args.some(x=>!['--check','--audit'].includes(x)))throw Error('未知参数');const result=args.includes('--audit')?await audit(ROOT):await build(ROOT,{check:args.includes('--check')});console.log(JSON.stringify(result,null,2));if(result.missing)process.exitCode=1;}
 catch(error){console.error(error.message);process.exitCode=1;}
}
