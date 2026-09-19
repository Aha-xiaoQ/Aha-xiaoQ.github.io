#!/usr/bin/env node
import {planShowcase} from '../showcase/build.mjs';
/** Creates a separate website artifact. Never copies the repository wholesale. */
import fs from 'node:fs';import path from 'node:path';import{randomUUID}from'node:crypto';import{fileURLToPath}from'node:url';
import{safe,exactRead,walk,sha,json,parseDataJS,scriptData,privatePath}from'./paths.mjs';
import{checkSourceArchive}from'./identity.mjs';
import{planTasks}from'../public-content/sync.mjs';
import{checkSyntax}from'./syntax.mjs';
import{publicRuntime}from'./runtime.mjs';
import{auditFiles,htmlReferences,resolveRef,jsonRefs,cssReferences,jsReferences,scriptRegistry}from'./audit.mjs';
import{publicProject,publicState,publicSiteData,publicCatalog}from'../../assets/release/public-content.mjs';
import{validateProject,validateCatalog,normalizeState}from'../../assets/journal/model.mjs';
import{planPages}from'../journal/build.mjs';import{planCollections}from'../workshop/build.mjs';import{planExperience}from'../experience/build.mjs';import{planLaunch}from'../launch/build.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const OUTPUT='.local/publish', RECORD='.local/release-r24/artifact.json';
const getJSON=(get,p)=>{const b=get(p);if(!b)throw Error('缺少发布输入：'+p);return JSON.parse(b);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function publicHTML(s,p,origin,data,cacheToken){
 if(/(?:^|\/)play\.html$/.test(p))return s;
 const canonical=origin+'/'+p.replace(/index\.html$/,'');
 s=s.replace(/<script\b[^>]*data-public-release[^>]*>[\s\S]*?<\/script>\s*/gi,'');
 s=s.replace(/<head\b[^>]*>/i,m=>m+'\n<script data-public-release src="/assets/release/public-mode.js?v=release-r24"></script>');
 s=s.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 if(p!=='404.html')s=s.replace('</head>',`<link rel="canonical" href="${esc(canonical)}">\n</head>`);
 // HTML never promotes an unapproved candidate to the stable play URL.
 if(p==='index.html'&&data.profile?.now){const n=data.profile.now;s=s.replace(/<section\b[^>]*class=["']now-signal["'][^>]*>[\s\S]*?<\/section>/,`<section class="now-signal" aria-labelledby="now-title"><strong class="now-signal__label" id="now-title">${esc(n.label)}</strong><span class="now-signal__title">${esc(n.title)}</span><time datetime="${esc(n.updatedAt)}">${esc(n.updatedAt)}</time></section>`);}
 // Cache parameters are consistent between direct pages and route-loaded modules.
 return s.replace(/\b(src|href)=(['"])([^'"]+)\2/g,(m,k,q,u)=>{
  const r=resolveRef(p,u,origin);if(!r?.path||!/^(?:assets|content)\/.+\.(?:mjs|js|css)$/.test(r.path))return m;
  const v=new URL(u,origin+'/'+p);v.searchParams.set('v',cacheToken);return k+'='+q+v.pathname+v.search+v.hash+q;
 });
}
function cacheSource(p,b,cacheToken='release-r24'){if(!/^assets\//.test(p)||!/(?:css|mjs|js)$/.test(p))return b;let s=b.toString();
 s=s.replace(/((?:(?:https?:)?\/\/)?[a-z0-9_./:-]+\.(?:mjs|js|css))\?v=[a-z0-9._-]+/gi,(all,spec)=>/^(?:https?:)?\/\//.test(spec)?all:spec+'?v='+cacheToken);
 s=s.replace(/^\s*\/\/[#@]\s*sourceMappingURL=[^\n]*$/gm,'').replace(/\/\*[#@]\s*sourceMappingURL=[\s\S]*?\*\//g,'');
 return Buffer.from(s);
}
function redirectPage(title,target){return Buffer.from(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · 在下_小Q</title><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${esc(target)}"><link rel="stylesheet" href="/assets/site-shell.css?v=release-r24"></head><body><main id="main"><h1>资料已更新</h1><p>请从当前开发资料继续阅读。</p><a href="${esc(target)}">查看当前资料</a></main></body></html>`);}
export async function planPublication(root=ROOT){
 const observed=new Map(),errors=[],warnings=[],files=new Map(),overlay=new Map(),directories=new Map();
 const get=p=>{if(observed.has(p))return observed.get(p);const b=exactRead(root,p);observed.set(p,b);return b;};
 const read=p=>overlay.has(p)?overlay.get(p):get(p);
 for(const dir of ['scripts/publication','scripts/journal','scripts/workshop','scripts/experience','scripts/launch','scripts/lib','scripts/public-content','scripts/showcase'])for(const p of walk(root,dir))get(p);
 const cfg=getJSON(get,'config/publication.json');if(cfg.schemaVersion!==1||cfg.output!==OUTPUT||cfg.edition!=='R24'||!Array.isArray(cfg.entrypoints)||!Array.isArray(cfg.extraPublicFiles))throw Error('发布配置不匹配。');
 const origin=new URL(cfg.origin).origin;if(!origin.startsWith('https://')||cfg.origin!==origin)throw Error('origin 需要不带路径的 HTTPS 地址。');
 const release=getJSON(get,cfg.candidatePath+'/release.json');if(release.version!==cfg.gameVersion)throw Error('当前游戏源码版本不符；请核对发布配置。');
 const mapPackage=getJSON(get,cfg.mapPath+'/package.json');if(mapPackage.version!==cfg.mapVersion)throw Error('地图工具版本不符。');
 const sourceSite=parseDataJS(get('content/site-data.js').toString()),site=publicSiteData(sourceSite);overlay.set('content/site-data.js',scriptData(site));
 const c=getJSON(get,'content/development/catalog.json'),originalProjects=[],projects=[];const taskPages=planTasks(root,{reader:get});let sourceFilesVerified=0;
 for(const row of c.projects){const p=validateProject(getJSON(get,row.file));if(p.id!==row.id)throw Error('项目索引与数据不符');if(p.visibility==='draft')continue;
  originalProjects.push(p);const projected=publicProject(p),state=publicState(normalizeState(JSON.parse(taskPages.get(p.state.path)||get(p.state.path)),p));validateProject(projected);projects.push(projected);
  overlay.set(row.file,json(projected));overlay.set(projected.state.path,json(state));
 }
 const catalog=publicCatalog(c,new Set(projects.map(p=>p.id)));catalog.title='开发';validateCatalog(catalog);overlay.set('content/development/catalog.json',json(catalog));
 for(const [p,b]of overlay)files.set(p,b);
 for(const p of projects){if(p.currentRelease){const r=p.currentRelease,manifestPath=r.manifestHref.slice(1),sourcePath=r.sourceHref.slice(1),m=getJSON(get,manifestPath),zip=get(sourcePath);
   if(r.version!==release.version||m.version!==release.version||!zip||sha(zip)!==m.sha256||zip.length!==m.bytes)errors.push({file:sourcePath,problem:'current-source-identity-mismatch'});
   if(zip){files.set(sourcePath,zip);const identity=checkSourceArchive({root,get,archive:zip,prefix:'MarioMix_Terraria_'+release.edition+'/',source:cfg.candidatePath,skip:['SOURCE_SHA256SUMS.txt']});errors.push(...identity.errors);sourceFilesVerified+=identity.verified;}files.set(manifestPath,json(m));
  }}
 const mapMeta=getJSON(get,'downloads/source/MarioMix_Worlds_W02_Starter.json'),mapZip=get('downloads/source/MarioMix_Worlds_W02_Starter.zip');
 if(!mapZip||sha(mapZip)!==mapMeta.sha256||(mapMeta.bytes!==undefined&&mapZip.length!==mapMeta.bytes))errors.push({file:'downloads/source/MarioMix_Worlds_W02_Starter.zip',problem:'map-source-identity-mismatch'});
 if(mapZip){files.set('downloads/source/MarioMix_Worlds_W02_Starter.zip',mapZip);const identity=checkSourceArchive({root,get,archive:mapZip,prefix:'MarioMix_Worlds_W02/',source:cfg.mapPath,skip:['runtime/','STARTER_METADATA.json','SOURCE_SHA256SUMS.txt'],runtimeHash:mapMeta.gameSourceHash});errors.push(...identity.errors);sourceFilesVerified+=identity.verified;}
 files.set('downloads/source/MarioMix_Worlds_W02_Starter.json',json(mapMeta));
 // These pure planners use the projected reader and never overwrite source pages.
 const jp=await planPages(root,{reader:read,publicMode:true});for(const [p,b]of jp.pages){files.set(p,b);overlay.set(p,b);}
 const wp=await planCollections(root,{reader:read});for(const [p,b]of wp.pages){files.set(p,b);overlay.set(p,b);}
 const ep=await planExperience(root,{reader:read});for(const [p,b]of ep.files){files.set(p,b);overlay.set(p,b);}
 const lp=await planLaunch(root,{reader:read});for(const [p,b]of lp.files){files.set(p,b);overlay.set(p,b);}for(const p of lp.missingDetails)errors.push({file:p,problem:'missing-public-game-detail'});
 if(read('content/about-view.json')){const sp=await planShowcase(root,{reader:read});for(const [p,b]of sp.files){files.set(p,b);overlay.set(p,b);}}
 else if(read('about/index.html')?.toString().includes('data-about-view='))throw Error('Missing About source: run the R25 migration before publishing');
 // Keep old public guide URLs as useful redirects, never publish management pages.
 for(const p of originalProjects)for(const d of p.docs){if(!projects.find(x=>x.id===p.id).docs.some(x=>x.id===d.id))files.set(`notes/${p.id}/docs/${d.id}/index.html`,redirectPage(d.title,`/notes/${p.id}/docs/`));}
 for(const p of cfg.entrypoints){if(files.has(p))continue;const b=read(p);if(b)files.set(p,b);else errors.push({file:p,problem:'missing-entrypoint'});}
 const fileTree=rel=>{const paths=walk(root,rel);directories.set(rel,paths);return paths;};
 // Assets contain dynamically selected backgrounds and character media. Keep
 // runtime assets, never build logs/test fixtures, rather than guess they are dead.
 for(const p of fileTree('assets'))if(!privatePath(p)){const b=get(p);if(b)files.set(p,cacheSource(p,publicRuntime(p,b)));}
 for(const p of fileTree('content'))if(/\.js$/.test(p)&&!files.has(p)&&!privatePath(p)){const b=get(p);files.set(p,b);}
 for(const p of ['LICENSE','RIGHTS.md','CNAME']){const b=get(p);if(b)files.set(p,b);}if(!files.has('RIGHTS.md'))errors.push({file:'RIGHTS.md',problem:'missing-rights-statement'});
 // The atlas is a public tool; ship only its actual reading dependencies.
 const mapCatalog=getJSON(get,cfg.mapPath+'/content/catalog.json');
 for(const chapter of projects.find(p=>p.id==='mario-mix').chapterPlan.levels){const current=mapCatalog.levels.find(l=>l.id===chapter.id);if(!current)throw Error('关卡目录缺少 '+chapter.id);for(const field of ['title','characters','status','summary','owner','issueUrl','playHref','introHref'])if(JSON.stringify(chapter[field])!==JSON.stringify(current[field]))errors.push({file:'content/development/projects/mario-mix.json',problem:'chapter-state-not-synchronized',chapter:chapter.id,field});}
 const atlasIndex=getJSON(get,cfg.mapPath+'/generated/atlas-index.json');
 files.set(cfg.mapPath+'/generated/atlas-index.json',json(atlasIndex));
 for(const p of fileTree(cfg.mapPath+'/atlas')){let b=get(p);if(p.endsWith('atlas.mjs')){const old="const source=p=>new URL('../'+p,import.meta.url).href;";const next="const source=p=>p.startsWith('generated/downloads/')?new URL('/downloads/maps/'+p.split('/').pop(),import.meta.url).href:new URL('../'+p,import.meta.url).href;";if(!b.toString().includes(old))throw Error('地图册下载适配需要核对，未修改未知代码。');b=Buffer.from(b.toString().replace(old,next));}if(p.endsWith('/index.html'))b=Buffer.from(b.toString().replaceAll('../START_HERE.md','/notes/mario-mix/').replaceAll('../docs/MAP_CONTRACT.md','/notes/mario-mix/docs/terra-stages/'));files.set(p,b);}
 for(const l of atlasIndex.levels){for(const rel of [l.source,...l.rooms.flatMap(r=>[r.svg,r.tiled])]){const p=cfg.mapPath+'/'+rel,b=get(p);if(b)files.set(p,b);else errors.push({file:p,problem:'missing-atlas-resource'});}const name=path.posix.basename(l.download),p='downloads/maps/'+name,b=get(p);if(b)files.set(p,b);else errors.push({file:p,problem:'missing-map-download'});}
 // Never copy loose game-source trees or tests. Stable game folders are runtime
 // distributions: include referenced files plus their adjacent runtime media.
 const gameDirs=new Set((site.items||[]).filter(x=>x.primaryType==='game'&&x.localUrl).map(x=>path.posix.dirname(x.localUrl.replace(/^\//,''))));
 for(const dir of gameDirs)for(const p of fileTree(dir))if(!privatePath(p)&&!/(?:README|CHANGELOG|HANDOFF)[^/]*\.(?:md|txt)$/.test(p)){const b=get(p);if(!files.has(p))files.set(p,b);}
 for(const p of cfg.extraPublicFiles){if(privatePath(p)||/^packages\//.test(p)||/^docs\//.test(p))throw Error('extraPublicFiles 不得包含内部工程：'+p);const b=get(p);if(!b)errors.push({file:p,problem:'missing-explicit-resource'});else files.set(p,b);}
 files.set('assets/release/public-mode.js',Buffer.from(`globalThis.SITE_RELEASE=Object.freeze({edition:"R24",publicMode:true,gameSourceVersion:${JSON.stringify(release.version)},mapVersion:${JSON.stringify(mapPackage.version)}});\n`));
 files.set('.nojekyll',Buffer.alloc(0));
 const registryRefs=jsonRefs(site);
 // Follow navigable public assets/downloads so no important existing work is lost.
 const allowed=p=>!privatePath(p)&&!/^docs\//.test(p)&&(!/^packages\//.test(p)||files.has(p));
 let rounds=0,seen=new Set();
 while(rounds++<100){let added=0;
  for(const [p,b]of [...files]){if(seen.has(p))continue;seen.add(p);let refs=[];if(/\.html$/.test(p))refs=htmlReferences(b.toString());else if(/\.css$/.test(p))refs=cssReferences(b.toString());else if(/\.(?:mjs|js)$/.test(p))refs=[...jsReferences(b.toString()),...scriptRegistry(b.toString())];else if(/^content\/.+\.json$/.test(p))refs=jsonRefs(JSON.parse(b));
   if(p==='index.html')refs.push(...registryRefs);
   for(const r of refs){const ref=resolveRef(p,r.raw,origin);if(!ref?.path||files.has(ref.path))continue;if(!allowed(ref.path)){errors.push({file:p,problem:'internal-public-link',target:ref.path});continue;}const bytes=read(ref.path);if(bytes){files.set(ref.path,bytes);added++;}}
  }if(!added)break;
 }
 const cacheToken='release-r24-'+sha(Buffer.concat([...files].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([p,b])=>Buffer.from(p+sha(b))))).slice(0,12);
 for(const [p,b]of files){if(/\.html$/.test(p))files.set(p,Buffer.from(publicHTML(b.toString(),p,origin,site,cacheToken)));else files.set(p,cacheSource(p,publicRuntime(p,b),cacheToken));}
 const pages=[...files.keys()].filter(p=>p.endsWith('.html')&&p!=='404.html'&&!/play\.html$/.test(p)&&!/http-equiv="refresh"/.test(files.get(p).toString())).sort();
 files.set('sitemap.xml',Buffer.from('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>'+esc(origin+'/'+p.replace(/index\.html$/,''))+'</loc></url>').join('')+'</urlset>\n'));
 files.set('robots.txt',Buffer.from('User-agent: *\nAllow: /\nDisallow: /dev/manage/\nDisallow: /.local/\nDisallow: /tests/\nSitemap: '+origin+'/sitemap.xml\n'));
 const contentVersion=sha(Buffer.concat([...files].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([p,b])=>Buffer.from(p+sha(b))))).slice(0,20);
 files.set('site-version.json',json({version:'r24-'+contentVersion}));
 const syntax=checkSyntax(files);errors.push(...syntax.errors);const report=auditFiles(files,{origin,errors,registryRefs});report.cacheToken=cacheToken;report.syntaxFiles=syntax.files;report.sourceFilesVerified=sourceFilesVerified;report.warnings.push(...warnings);report.version={website:'R24',gameSource:release.version,maps:mapPackage.version,stableGamesReplaced:false};report.sourceScope='R23 source workspace; public projection is separate';
 report.sourceFingerprint=sha(json(Object.fromEntries([...observed].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([p,b])=>[p,b?sha(b):null]))));
 return {root,files,report,observed,directories,cfg};
}
function verifyObserved(plan){for(const [p,b]of plan.observed){const now=exactRead(plan.root,p);if((now?sha(now):null)!==(b?sha(b):null))throw Error('检查后源文件变化：'+p);}for(const [dir,list]of plan.directories)if(JSON.stringify(walk(plan.root,dir))!==JSON.stringify(list))throw Error('检查后目录变化：'+dir);}
export function commitPublication(plan){
 if(plan.report.errors.length)throw Error('发布目录未生成：'+plan.report.errors.length+' 项阻断问题。');verifyObserved(plan);
 const out=safe(plan.root,OUTPUT),control=safe(plan.root,RECORD);const old=fs.existsSync(control)?JSON.parse(fs.readFileSync(control)):null;
 if(fs.existsSync(out)){if(!old?.files)throw Error('同名发布目录没有生成记录，拒绝覆盖。');const present=walk(plan.root,OUTPUT).map(p=>p.slice(OUTPUT.length+1));if(present.length!==Object.keys(old.files).length||present.some(p=>!old.files[p]||sha(exactRead(plan.root,OUTPUT+'/'+p))!==old.files[p]))throw Error('发布目录有手工修改或额外文件，拒绝覆盖。');}
 if(old?.fingerprint===plan.report.fingerprint&&old?.sourceFingerprint===plan.report.sourceFingerprint&&fs.existsSync(out))return {files:plan.files.size,fingerprint:plan.report.fingerprint,output:OUTPUT,unchanged:true};
 const tempRel='.local/publish-tmp-'+randomUUID(),temp=safe(plan.root,tempRel);fs.mkdirSync(temp,{recursive:true});
 let movedOld=null;
 try{for(const [p,b]of plan.files){const f=safe(temp,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,b,{flag:'wx'});}verifyObserved(plan);
  if(fs.existsSync(out)){movedOld=safe(plan.root,'.local/publish-previous-'+randomUUID());fs.renameSync(out,movedOld);}fs.renameSync(temp,out);
  fs.mkdirSync(path.dirname(control),{recursive:true});fs.writeFileSync(control,json({schemaVersion:1,edition:'R24',fingerprint:plan.report.fingerprint,sourceFingerprint:plan.report.sourceFingerprint,files:plan.report.hashes}));
  if(movedOld)fs.rmSync(movedOld,{recursive:true});return {files:plan.files.size,fingerprint:plan.report.fingerprint,output:OUTPUT};
 }catch(e){if(movedOld&&fs.existsSync(movedOld)){if(fs.existsSync(out))fs.rmSync(out,{recursive:true});fs.renameSync(movedOld,out);}throw e;}finally{if(fs.existsSync(temp))fs.rmSync(temp,{recursive:true});}
}
export async function checkPublication(root=ROOT){const p=await planPublication(root);if(p.report.errors.length)return p.report;const b=exactRead(root,RECORD);if(!b){p.report.errors.push({file:OUTPUT,problem:'artifact-not-built'});return p.report;}const rec=JSON.parse(b);if(rec.fingerprint!==p.report.fingerprint||rec.sourceFingerprint!==p.report.sourceFingerprint)p.report.errors.push({file:OUTPUT,problem:'artifact-outdated'});
 const current=walk(root,OUTPUT).map(s=>s.slice(OUTPUT.length+1));for(const file of current)if(!rec.files[file])p.report.errors.push({file,problem:'unexpected-published-file'});for(const [f,h]of Object.entries(rec.files)){const b=exactRead(root,OUTPUT+'/'+f);if(!b||sha(b)!==h)p.report.errors.push({file:f,problem:'artifact-bytes-changed'});}return p.report;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2);if(args.some(x=>!['--prepare','--check','--plan','--report'].includes(x))||args.filter(x=>x!=='--report').length!==1)throw Error('用法：--plan | --prepare | --check，可加 --report 保存本地报告');
  let r;if(args.includes('--check'))r=await checkPublication();else{const p=await planPublication();r=p.report;if(args.includes('--prepare')&&!r.errors.length)commitPublication(p);}
  if(args.includes('--report')){const f=safe(ROOT,'.local/release-r24/report.json');fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,json(r));}
  console.log(JSON.stringify({...r,hashes:undefined},null,2));if(r.errors.length)process.exitCode=1;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
