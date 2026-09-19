#!/usr/bin/env node
import {withDocuments} from '../../assets/journal/documents.mjs';
/** Generate native direct-load pages from registered projects. No frontend router generation. */
import vm from 'node:vm';
import {wireHTML} from '../workshop/build.mjs';
import {unlink} from 'node:fs/promises';
import path from 'node:path';import {fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import {validateCatalog,validateProject,normalizeState,VIEWS,projectURL}from'../../assets/journal/model.mjs';
import {render,metadata}from'../../assets/journal/render.mjs?v=worlds-r21';
export const sha=x=>createHash('sha256').update(x).digest('hex');
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
import {normalizeText,equalText,matchesTextHash} from '../lib/text-records.mjs';
const utf=normalizeText;
import {safe as guardPath,readOptional,writeAtomic} from '../lib/safe-path.mjs';
export async function safe(root,rel){return guardPath(root,rel);}
export async function read(root,rel){return readOptional(root,rel);}
export function cacheHtml(s){return s.replace(/(\b(?:src|href)=["'][^"']*assets\/(?:site-shell|site-router)\.js)(?:\?[^"']*)?(["'])/g,'$1?v=workshop-r08$2').replace(/<link\b[^>]*href=["'][^"']*assets\/(?:site-dev\.css|site-development\.css)[^"']*["'][^>]*>\s*/g,'');}
export function nativePage(template,body,meta,file){
 const get=(r,name)=>{const m=template.match(r);if(!m)throw Error('原站模板缺少 '+name);return m[0];};
 const absolute=s=>s.replace(/\b(src|href)=("|')([^"']+)\2/g,(all,k,q,u)=>{if(/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(u))return all;const url=new URL(u,'https://template.invalid/notes/index.html');return k+'='+q+url.pathname+url.search+url.hash+q;});
 const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let head=cacheHtml(absolute(get(/<head\b[^>]*>[\s\S]*?<\/head>/i,'head')));
 head=head.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+e(meta.title)+' · 在下_小Q</title>');
 head=head.replace(/<meta\b[^>]*(?:name=["'](?:description|robots)["']|property=["']og:[^"']*["']|name=["']twitter:[^"']*["'])[^>]*>/gi,'').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 head=head.replace(/<link\b[^>]*(?:data-journal-css|data-workshop-css)[^>]*>/g,'');
 head=head.replace(/\s*<\/head>/i,'</head>');
 head=head.replace('</head>',`<meta name="description" content="${e(meta.intro)}">\n${file.includes('/manage/')?'<meta name="robots" content="noindex">':''}<link rel="stylesheet" data-workshop-css href="/assets/workshop-components.css?v=workshop-r08"><link rel="stylesheet" data-journal-css href="/assets/journal/journal.css?v=docs-r26">\n</head>`);
 let header=absolute(get(/<header\b[^>]*>[\s\S]*?<\/header>/i,'header'));
 header=header.replace(/<a\b[^>]*data-nav-key=["']dev["'][^>]*>[\s\S]*?<\/a>/g,'').replace(/\saria-current=["']page["']/g,'').replace(/(<a\b[^>]*data-nav-key=["']notes["'][^>]*>)[\s\S]*?(<\/a>)/g,'$1开发$2').replace(/(data-nav-key=["']notes["'])/,'$1 aria-current="page"');
 header=header.replace(/<nav\b([^>]*)>/g,(tag,attrs)=>{if(/\bstyle=/.test(attrs))return tag;return '<nav'+attrs+' style="flex-wrap:wrap">';});
 const footer=absolute(get(/<footer\b[^>]*>[\s\S]*?<\/footer>/i,'footer'));
 const tail=template.slice(template.lastIndexOf('</footer>')+9);const scripts=cacheHtml(absolute([...tail.matchAll(/<script\b[^>]*src=["'][^"']*["'][^>]*>\s*<\/script>/g)].map(m=>m[0]).join('\n')));
 if(!scripts.includes('site-shell.js')||!scripts.includes('site-router.js'))throw Error('原页面缺少主站渲染器或路由。');
 head=head.replace(/(?:\r?\n[ \t]*){2,}/g,'\n');
 return wireHTML(`<!doctype html>\n<html lang="zh-CN">\n${head}\n<body data-page="notes" data-base="${'../'.repeat(file.split('/').length-1)}" data-journal-page="r06">\n<div id="app" data-prerendered="true"><a class="skip" href="#main">跳到主要内容</a>${header}<section class="page-head"><div class="shell page-head__body"><p class="eyebrow">${e(meta.eyebrow)}</p><h1>${e(meta.title)}</h1><p class="lede">${e(meta.intro)}</p></div></section><main id="main" tabindex="-1"><div class="shell" data-journal-slot>${body}</div></main>${footer}</div>\n${scripts}\n</body></html>\n`);
}
export async function planPages(root,{reader=rel=>read(root,rel),template=null,notes=null,publicMode=false}={}){
 const get=async p=>{const b=await reader(p);if(b===null)throw Error('缺少文件：'+p);return utf(b);};
 if(notes===null){const source=await reader('content/site-data.js');notes=[];if(source){const context={};vm.runInNewContext(utf(source),context,{timeout:1000});notes=context.SITE_DATA?.notes||[];if(!Array.isArray(notes))throw Error('原站笔记格式不是数组，停止而不丢弃记录。');}}
 const catalog=validateCatalog(JSON.parse(await get('content/development/catalog.json'))),projects=[];
 for(const item of catalog.projects){const p=withDocuments(validateProject(JSON.parse(await get(item.file))));if(item.id!==p.id)throw Error('索引项目 ID 不一致。');projects.push(p);}
 if(new Set(projects.map(p=>p.state.path)).size!==projects.length)throw Error('两个项目不能共用同一状态源。');
 const publicProjects=projects.filter(p=>p.visibility!=='draft'),states={},errors={};
 for(const p of publicProjects){states[p.id]=normalizeState(JSON.parse(await get(p.state.path)),p);}
 template??=await get('notes/index.html');const context={catalog,projects:publicProjects,states,errors,notes,publicMode},pages=new Map();
 function put(r,file){pages.set(file,Buffer.from(nativePage(template,render(r,context),metadata(r,publicProjects,catalog),file)));}
 put({view:'index'},'notes/index.html');put({view:'updates'},'notes/updates/index.html');put({view:'contribute'},'notes/contribute/index.html');
 for(const p of publicProjects){for(const view of VIEWS.filter(v=>!publicMode||v!=='manage'))put({projectId:p.id,view},projectURL(p.id,view).slice(1)+'index.html');for(const d of p.docs)put({projectId:p.id,view:'docs',doc:d.id},projectURL(p.id,'docs',d.id).slice(1)+'index.html');}
 return {pages,catalog,projects};
}
export async function build(root=ROOT,{check=false,notes=null}={}){
 const {pages}=await planPages(root,{notes});const previous=JSON.parse(utf(await read(root,'docs/development/generated-pages.json')||'{"files":{}}'));const changes=[],remove=[];
 for(const [p,b]of pages){const old=await read(root,p);if(equalText(old,b))continue;if(old&&(!previous.files[p]||!matchesTextHash(old,previous.files[p])))throw Error('生成页含本地编辑，停止覆盖：'+p);changes.push([p,b]);}
 for(const [p,h]of Object.entries(previous.files))if(!pages.has(p)){const b=await read(root,p);if(b){if(!matchesTextHash(b,h))throw Error('待撤回页面有本地编辑：'+p);remove.push(p);}}
 const record=Buffer.from(JSON.stringify({schemaVersion:1,files:Object.fromEntries([...pages].map(([p,b])=>[p,sha(b)]))},null,2)+'\n');
 const prior=await read(root,'docs/development/generated-pages.json');if(!equalText(prior,record))changes.push(['docs/development/generated-pages.json',record]);
 if(check&& (changes.length||remove.length))throw Error('生成页面落后于数据。运行 npm run journal:build。');
 if(!check){for(const [p,b]of changes){writeAtomic(root,p,b);}for(const p of remove)await unlink(await safe(root,p));}
 return {changed:changes.length,removed:remove.length,pages:pages.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build(ROOT,{check:process.argv.includes('--check')}).then(r=>console.log(r)).catch(e=>{console.error(e.message);process.exitCode=1;});
