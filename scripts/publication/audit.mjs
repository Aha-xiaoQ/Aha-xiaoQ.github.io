import {htmlTitleCount} from './html-titles.mjs';
/** Checks the exact files selected for a public artifact; no network or writes. */
import path from 'node:path';
import {sha,privatePath} from './paths.mjs';
import {inspectZip} from './archives.mjs';
import {CLUTTER} from '../../assets/release/public-content.mjs';
export const attrRE=/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
export const decode=s=>String(s).replace(/&(?:amp|quot|apos|lt|gt|#39|#x([0-9a-f]+)|#(\d+));/gi,(m,x,d)=>x?String.fromCodePoint(parseInt(x,16)):d?String.fromCodePoint(+d):({'&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&lt;':'<','&gt;':'>'}[m]||m));
export function attrs(s){const a={};for(const m of s.matchAll(attrRE))a[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]??'');return a;}
// This exception is only for the reviewed Q Mimi install action, not arbitrary
// custom protocols or remote image hosts. The nested asset remains auditable.
const PET_IMAGE='https://aha-xiaoq.github.io/projects/q-mimi/spritesheet.webp';
function petInstallImage(raw){
 try{
  if(/[\\\u0000-\u001f]/.test(raw)||/%(?![0-9a-f]{2})/i.test(raw))return null;
  const u=new URL(raw),allowed=new Set(['name','description','imageUrl','spriteVersionNumber']),seen=new Set();
  if(u.protocol!=='codex:'||u.hostname!=='pets'||u.pathname!=='/install'||u.username||u.password||u.port||u.hash)return null;
  for(const [key,value]of u.searchParams){if(!allowed.has(key)||seen.has(key)||/[\u0000-\u001f]/.test(value))return null;seen.add(key);}
  if(!u.searchParams.get('name')?.trim()||u.searchParams.get('spriteVersionNumber')!=='2')return null;
  return u.searchParams.get('imageUrl')===PET_IMAGE?PET_IMAGE:null;
 }catch{return null;}
}
export function resolveRef(from,raw,origin){
 if(!raw||/^(?:data:|blob:|mailto:|tel:|about:)/i.test(raw))return null;
 if(/[\\\u0000-\u001f]/.test(raw)||/%(?:2e|2f|5c|00)/i.test(raw.split(/[?#]/,1)[0]))return {error:'unsafe-url',raw};
 try{const u=new URL(decode(raw),origin+'/'+from);if(u.protocol==='codex:')return petInstallImage(decode(raw))?{external:u.href,petInstall:true}:{error:'unsafe-pet-install',raw};if(!['http:','https:'].includes(u.protocol))return {error:'unsafe-scheme',raw};if(u.username||u.password)return {error:'url-credentials',raw};if(/(?:^|\.)(?:invalid|example\.(?:com|org|net)|localhost)$/.test(u.hostname)||u.hostname==='127.0.0.1'||u.hostname==='0.0.0.0')return {error:'placeholder-or-local-url',raw};if(u.origin!==origin)return {external:u.href};let p=decodeURIComponent(u.pathname).slice(1);if(/%(?:2e|2f|5c|00)/i.test(p))return {error:'unsafe-url',raw};if(!p||p.endsWith('/'))p+='index.html';return {path:p,fragment:decodeURIComponent(u.hash.slice(1)),raw};}catch{return {error:'invalid-url',raw};}
}
export function htmlReferences(text){const refs=[];const cleaned=text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,m=>m.replace(/>[\s\S]*<\/script>/,'></script>')).replace(/<!--([\s\S]*?)-->/g,'');
 for(const m of cleaned.matchAll(/<(a|img|script|link|source|video|audio|iframe|object|input|form)\b([^>]*)>/gi)){
  const a=attrs(m[2]),tag=m[1].toLowerCase();for(const k of ['href','src','poster','data','action'])if(a[k]&&!['form'].includes(tag))refs.push({raw:a[k],tag,key:k,attrs:a});
  const petImage=tag==='a'&&a.href?petInstallImage(a.href):null;
  if(petImage)refs.push({raw:petImage,tag:'img',key:'pet-install-image'});
  if(a.srcset&&!a.srcset.trim().startsWith('data:'))for(const v of a.srcset.split(','))refs.push({raw:v.trim().split(/\s+/)[0],tag,key:'srcset',attrs:a});
 }
 for(const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi))refs.push(...cssReferences(m[1]));
 for(const m of text.matchAll(/\bstyle=(?:"([^"]*)"|'([^']*)')/gi))refs.push(...cssReferences(m[1]||m[2]));
 return refs;
}
export function cssReferences(s){return [...s.matchAll(/url\(\s*['"]?([^'"()]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/gi)].map(m=>({raw:(m[1]||m[2]).trim(),tag:'css',key:'resource'}));}
export function jsReferences(s){const out=[];
 for(const m of s.matchAll(/\b(?:import|export)\s+(?:[^;\n]*?\bfrom\s*)?['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)|\bnew\s+URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g)){const raw=m[1]||m[2]||m[3];if(/^(?:\.|\/|https?:)/.test(raw))out.push({raw,tag:'js',key:'module'});}
 // Absolute runtime fetch/asset literals have an unambiguous base.
 for(const m of s.matchAll(/['"](\/(?:assets|content|downloads)\/[^'"$`\s]+\.(?:json|mjs|js|css|png|jpe?g|webp|svg|woff2?)(?:\?[^'"\s]*)?)['"]/g))out.push({raw:m[1],tag:'js',key:'absolute-runtime'});
 return out;
}
const strip=s=>decode(s.replace(/<!--([\s\S]*?)-->/g,'').replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ');
export function jsonRefs(value){const out=[];function scan(v,key=''){if(typeof v==='string'&&/(?:src|href|url|cover|file|source|svg|tiled|download|preview|path)$/i.test(key)&&!v.includes('${')&&/^(?:https?:\/\/|\/?(?:assets|content|downloads|games|projects|tools|notes|packages)\/)/.test(v))out.push({raw:/^https?:/.test(v)?v:'/'+v.replace(/^\//,''),tag:'registry',key});else if(Array.isArray(v))v.forEach(x=>scan(x,key));else if(v&&typeof v==='object')for(const [k,x]of Object.entries(v))scan(x,k);}scan(value);return out;}
export function scriptRegistry(s){
 const match=s.trim().match(/^(?:(?:globalThis|window)\.)?(?:SITE_DATA|SITE_ASSETS|SITE_MANIFEST|SITE_PRESENTATION)\s*=\s*([\s\S]+?);?\s*$/);
 if(!match)return [];try{return jsonRefs(JSON.parse(match[1].replace(/;\s*$/,'')));}catch{return [];}
}

function integrityProblem(p,b){
 if(/^version https:\/\/git-lfs.github.com\/spec\/v1/m.test(b.subarray(0,160).toString()))return 'git-lfs-pointer';
 if(!b.length&&!/^(?:\.nojekyll|CNAME)$/.test(p))return 'empty-resource';
 if(/\.png$/i.test(p)&&!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'invalid-png';
 if(/\.jpe?g$/i.test(p)&&!(b[0]===255&&b[1]===216))return 'invalid-jpeg';
 if(/\.webp$/i.test(p)&&!(b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP'))return 'invalid-webp';
 if(/\.svg$/i.test(p)&&!/<svg\b/i.test(b.toString()))return 'invalid-svg';
 if(/\.zip$/i.test(p)&&!['PK\u0003\u0004','PK\u0005\u0006'].includes(b.subarray(0,4).toString('latin1')))return 'invalid-zip';
 return null;
}
export function auditFiles(files,{origin,errors:initial=[],registryRefs=[]}={}){
 const errors=[...initial],warnings=[],external=new Set(),ids=new Map(),stats={pages:0,files:files.size,localReferences:0,externalURLs:0,bytes:0,archives:0,archiveEntries:0};
 for(const [p,b] of files){stats.bytes+=b.length;const fail=integrityProblem(p,b);if(fail)errors.push({file:p,problem:fail});if(/\.zip$/i.test(p)&&!fail){try{const info=inspectZip(b);stats.archives++;stats.archiveEntries+=info.entries;}catch(e){errors.push({file:p,problem:'invalid-zip-contents',detail:e.message});}}if(privatePath(p))errors.push({file:p,problem:'internal-file-in-artifact'});
  if(/\.html$/i.test(p)){
   stats.pages++;const s=b.toString(),clean=s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<!--([\s\S]*?)-->/g,'');
   const active=clean.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,'');
   const all=[...active.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>decode(m[1]??m[2]));
   ids.set(p,new Set([...clean.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>decode(m[1]??m[2]))));
   if(new Set(all).size!==all.length)errors.push({file:p,problem:'duplicate-id'});
   if(!/(?:^|\/)play\.html$/.test(p)){
    for(const tag of ['main','h1'])if((active.match(new RegExp('<'+tag+'(?:\\s|>)','gi'))||[]).length!==1)errors.push({file:p,problem:'non-unique-'+tag});
    if(htmlTitleCount(s)!==1)errors.push({file:p,problem:'non-unique-title'});
    if(!/<html\b[^>]*\blang\s*=/.test(clean))errors.push({file:p,problem:'missing-language'});
    const body=clean.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1]||clean;const m=strip(body).match(CLUTTER);if(m)errors.push({file:p,problem:'internal-public-copy',match:m[0]});
    for(const m of clean.matchAll(/<img\b([^>]*)>/gi)){const a=attrs(m[1]);if(!Object.hasOwn(a,'alt'))errors.push({file:p,problem:'image-missing-alt',target:a.src});if(!a.width||!a.height)warnings.push({file:p,problem:'image-dimensions-review',target:a.src});}
    for(const m of clean.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){const a=attrs(m[1]);if(a.href&&(!strip(m[2])&&!a['aria-label']&&!/<img\b[^>]*\balt=['"][^'"]+/.test(m[2])))errors.push({file:p,problem:'unnamed-link',target:a.href});if(a.target==='_blank'&&!/noopener/.test(a.rel||''))warnings.push({file:p,problem:'external-link-rel-review',target:a.href});}
   }
  }
 }
 const resolve=(p,r)=>{
  const ref=resolveRef(p,r.raw,origin);if(!ref)return;if(ref.petInstall&&(r.tag!=='a'||r.key!=='href')){errors.push({file:p,problem:'unsafe-scheme',target:r.raw});return;}if(ref.external){external.add(ref.external);if(ref.external.startsWith('http:')&&['img','script','link','source','video','audio','iframe','object','css','js'].includes(r.tag))errors.push({file:p,problem:'mixed-content-resource',target:r.raw});return;}if(ref.error){errors.push({file:p,problem:ref.error,target:r.raw});return;}
  stats.localReferences++;const b=files.get(ref.path);if(!b){errors.push({file:p,problem:'missing-resource',target:ref.path});return;}
  if(ref.fragment&&/\.html$/i.test(ref.path)&&!ids.get(ref.path)?.has(ref.fragment))errors.push({file:p,problem:'missing-anchor',target:ref.path+'#'+ref.fragment});
 };
 for(const [p,b]of files){const s=b.toString();let refs=[];if(/\.html$/i.test(p))refs=htmlReferences(s);else if(/\.css$/i.test(p))refs=cssReferences(s);else if(/\.(?:js|mjs)$/i.test(p))refs=[...jsReferences(s),...scriptRegistry(s)];else if(/^content\/.+\.json$/.test(p)){try{refs=jsonRefs(JSON.parse(s));}catch{errors.push({file:p,problem:'invalid-json'});}}
  if(/^content\/development\/.+\.json$/.test(p)){try{
 const checkCopy=(v,k='')=>{if(['code','sources','source','href','url','path'].includes(k))return;if(typeof v==='string'){const m=v.match(CLUTTER);if(m)errors.push({file:p,problem:'internal-public-copy',match:m[0]});}else if(Array.isArray(v))v.forEach(x=>checkCopy(x,k));else if(v&&typeof v==='object')for(const [key,x]of Object.entries(v))checkCopy(x,key);};checkCopy(JSON.parse(s));
 }catch{}}
 for(const r of refs)resolve(p,r);
 }
 for(const r of registryRefs)resolve(r.from||'index.html',r);
 const unique=a=>[...new Map(a.map(x=>[JSON.stringify(x),x])).values()];stats.externalURLs=external.size;
 const hashes=Object.fromEntries([...files].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([p,b])=>[p,sha(b)]));
 return {schemaVersion:1,edition:'R24',...stats,fingerprint:sha(Buffer.from(JSON.stringify(hashes))),hashes,errors:unique(errors),warnings:unique(warnings),externalURLs:[...external].sort(),scope:'selected public artifact; HTML/CSS/ESM and declared registries; dynamic runtime and remote URLs need separate tests',networkVerified:false,approved:false};
}
