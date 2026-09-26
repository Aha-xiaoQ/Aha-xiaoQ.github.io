/** Build same-origin missing-glyph faces from a pinned upstream tree.
 * Font bytes are fetched on the maintainer's machine, never included in update ZIPs.
 * Existing Regular/Medium subsets and every covered glyph remain unchanged.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {safe,readOptional,writeAtomic} from '../lib/safe-path.mjs';
import {fontCodepoints} from './font-cmap.mjs';
import {decodeEntities,javascriptText,jsonText} from './font-source-text.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const RECORD='docs/platform/generated-fonts.json';
export const PROVIDER='docs/platform/font-provider.json';
export const CSS='assets/platform/font-support.css';
export const FAMILY='LXGW WenKai Local';
export const LICENSE_SOURCE='assets/fonts/LXGWWenKai-OFL.txt';
export const LICENSE_OUTPUT='assets/platform/font-support/OFL.txt';
export const LICENSE_FORMAT='utf8-lf-ascii-line-tails-v1';
export const PIN=Object.freeze({version:'1.7.0',tree:'fa186a397da7d358de9a977406af96e4a205278d',regular:'f74e32d4c310d69e5284b448e517302529a93ed5',bold:'075d9fc7b3428dccb0bd9ff99aa63256e9bf66f3'});
export const PRIMARY=Object.freeze([
 {file:'assets/fonts/LXGWWenKai-Regular-site.woff2',variant:'regular',weight:'400'},
 {file:'assets/fonts/LXGWWenKai-Medium-site.woff2',variant:'bold',weight:'500 700'}
]);
const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const blob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
/** Format only the generated copy. Preserve source bytes, wording, indentation,
 * paragraph boundaries and notices. Never apply this operation to font binaries.
 */
export function normalizeFontLicense(bytes){
 if(!Buffer.isBuffer(bytes))throw Error('Missing existing WenKai OFL notice');
 let text;try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}catch{throw Error('Invalid UTF-8 in WenKai OFL notice');}
 if(!text.includes('SIL OPEN FONT LICENSE')||text.includes('\0'))throw Error('Missing or invalid WenKai OFL notice');
 return Buffer.from(text.replace(/\r\n?/g,'\n').replace(/[ \t]+(?=\n|$)/g,'').replace(/\n*$/,'\n'),'utf8');
}
function licenseState(root){
 const source=readOptional(root,LICENSE_SOURCE),bytes=normalizeFontLicense(source);
 return {bytes,record:{source:LICENSE_SOURCE,sourceSha256:sha(source),sourceBytes:source.length,
  output:LICENSE_OUTPUT,sha256:sha(bytes),bytes:bytes.length,format:LICENSE_FORMAT}};
}

const fontName=/^lxgwwenkai-(regular|bold)-subset-\d+\.woff2$/;
export const generatedFont=p=>/^assets\/platform\/font-support\/[a-f0-9]{64}\.woff2$/.test(p);
const cp=n=>({character:String.fromCodePoint(n),unicode:'U+'+n.toString(16).toUpperCase()});
export function needsTypeface(n){return /^[\p{L}\p{M}\p{N}\p{P}]$/u.test(String.fromCodePoint(n))&&!/^[\p{Default_Ignorable_Code_Point}]$/u.test(String.fromCodePoint(n));}
export function decodeText(s){return s.replace(/\\u(d[89ab][0-9a-f]{2})\\u(d[c-f][0-9a-f]{2})/gi,(_,hi,lo)=>String.fromCodePoint(0x10000+((parseInt(hi,16)-0xd800)<<10)+parseInt(lo,16)-0xdc00)).replace(/\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|&#x([0-9a-f]+);?|&#(\d+);?/gi,(raw,a,b,c,d)=>{const n=parseInt(a||b||c||d,d?10:16);return n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):'';}).replace(/&(?:nbsp|amp|lt|gt|quot|apos);/g,x=>({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[x]));}
export function htmlText(source){
 // This conservatively includes hidden/collapsed authored prose and accessibility
 // labels, but excludes script/style bodies and editable values. Not an HTML parser.
 let s=source.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,' ');
 const a=[...s.matchAll(/\b(?:placeholder|aria-label|title|alt)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m=>m[1]??m[2]);
 return decodeEntities(s.replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g,' ')+'\n'+a.join('\n'));
}
export function collectCorpus(root=ROOT){
 const rows=[],locations=new Map(),symbols=new Set();
 const exclude=new Set(['.git','.local','node_modules','font-support','fonts','data-old']);
 function walk(rel){const dir=safe(root,rel);if(!fs.existsSync(dir))return;for(const name of fs.readdirSync(dir).sort()){
  if(name.startsWith('.')||exclude.has(name))continue;
  const p=rel+'/'+name,st=fs.lstatSync(safe(root,p));if(st.isSymbolicLink())throw Error('Linked font corpus path: '+p);
  if(st.isDirectory()){walk(p);continue;}
  if(!st.isFile())continue;
  const isContent=p.startsWith('content/')&&/\.(?:json|js|mjs)$/.test(p),isRuntime=p.startsWith('assets/')&&/\.(?:js|mjs)$/.test(p),isPage=/\.html$/.test(p);
  if(!isContent&&!isRuntime&&!isPage)continue;
  // Large standalone original works and media are not authored site-shell copy.
  if(st.size>8*1024*1024)continue;
  const b=readOptional(root,p),s=b.toString('utf8');if(isPage&&!/assets\/site-i18n\.js/.test(s))continue;
  rows.push({file:p,text:isPage?htmlText(s):p.endsWith('.json')?jsonText(s,{file:p}):javascriptText(s,{file:p})});
 }}
 for(const rel of ['content','assets','notes','projects','games','tools','about','search','play-guide','method','guestbook'])walk(rel);
 for(const rel of ['index.html','404.html']){const b=readOptional(root,rel);if(b)rows.push({file:rel,text:htmlText(b.toString())});}
 if(!rows.length)throw Error('No real site text was found for font coverage');
 for(const row of rows)for(const char of new Set(row.text)){
  const n=char.codePointAt(0);if(needsTypeface(n)){if(!locations.has(n))locations.set(n,[]);if(locations.get(n).length<3)locations.get(n).push(row.file);}
  else if(!/[\s\p{C}]/u.test(char))symbols.add(n);
 }
 const points=[...locations.keys()].sort((a,b)=>a-b),fingerprint=sha(Buffer.from(points.join(',')));
 return {points,locations,symbols:[...symbols].sort((a,b)=>a-b),files:rows.map(x=>x.file),fingerprint};
}
export function unicodeRanges(value){
 if(typeof value!=='string'||value.length>20000)throw Error('Invalid unicode-range');
 return value.split(',').map(part=>{
  const m=part.trim().match(/^U\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?$/i);if(!m||m[2]&&m[1].includes('?'))throw Error('Invalid unicode-range');
  const a=parseInt(m[1].replace(/\?/g,'0'),16),b=parseInt(m[2]||m[1].replace(/\?/g,'f'),16);
  if(a>b||b>0x10ffff)throw Error('unicode-range outside Unicode');return[a,b];
 });
}
export function parseFaces(css,variant){
 if(typeof css!=='string'||!['regular','bold'].includes(variant))throw Error('Invalid font stylesheet');
 const out=[],seen=new Set();
 for(const m of css.matchAll(/@font-face\s*\{([^}]+)\}/gi)){
  const src=m[1].match(/src\s*:\s*url\(\s*(['"]?)(\.\/files\/([^)'"\s]+))\1\s*\)\s*format\(\s*['"]woff2['"]\s*\)/i);
  const range=m[1].match(/unicode-range\s*:\s*([^;}]+)/i);
  if(!src||!range||!fontName.test(src[3])||!src[3].startsWith('lxgwwenkai-'+variant+'-'))throw Error('Unexpected pinned font-face data');
  if(seen.has(src[3]))throw Error('Duplicate font-face filename');seen.add(src[3]);out.push({name:src[3],ranges:unicodeRanges(range[1])});
 }
 if(!out.length)throw Error('Pinned stylesheet has no font faces');return out;
}
export function validateTree(value,pin=PIN.tree){
 if(value?.truncated||value?.sha!==pin||!Array.isArray(value.tree)||value.tree.length>3000)throw Error('Invalid upstream font tree');
 const seen=new Set(),records=[];
 for(const e of value.tree){if(e.type!=='blob'||!['100644','100755'].includes(e.mode)||!/^[a-zA-Z0-9._-]+$/.test(e.path)||! /^[a-f0-9]{40}$/.test(e.sha)||seen.has(e.path))throw Error('Unsafe upstream font tree entry');seen.add(e.path);records.push(e);}
 records.sort((a,b)=>Buffer.compare(Buffer.from(a.path),Buffer.from(b.path)));
 const data=Buffer.concat(records.map(e=>Buffer.concat([Buffer.from(e.mode+' '+e.path+'\0'),Buffer.from(e.sha,'hex')])));
 const actual=createHash('sha1').update('tree '+data.length+'\0').update(data).digest('hex');if(actual!==pin)throw Error('Upstream font tree identity mismatch');
 return new Map(records.filter(e=>fontName.test(e.path)).map(e=>[e.path,e]));
}
export function validateProvider(provider,pin=PIN){
 if(provider?.version!==pin.version)throw Error('Wrong font provider version');
 const tree=validateTree(provider.tree,pin.tree);
 const faces={};for(const v of ['regular','bold']){const s=provider.css?.[v];if(typeof s!=='string'||blob(Buffer.from(s))!==pin[v])throw Error('Pinned '+v+' stylesheet identity mismatch');faces[v]=parseFaces(s,v);for(const f of faces[v])if(!tree.has(f.name))throw Error('Font stylesheet references an unregistered file');}
 return {tree,faces};
}
const hosts=new Set(['api.github.com','raw.githubusercontent.com','cdnjs.cloudflare.com','cdn.jsdelivr.net']);
export async function fetchBytes(url,{max=4*1024*1024,fetcher=fetch}={}){
 const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||!hosts.has(u.hostname))throw Error('Unapproved font host');
 const response=await fetcher(u.href,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'XiaoQ-Font-Builder','Accept':'application/vnd.github+json'}});
 if(!response.ok)throw Error('Font source HTTP '+response.status);
 const declared=Number(response.headers.get('content-length'));if(declared>max)throw Error('Font download too large');
 const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>max)throw Error('Font download too large');chunks.push(Buffer.from(chunk));}return Buffer.concat(chunks);
}
async function fromSources(urls,identity,{fetcher=fetch,max=4*1024*1024}={}){
 const errors=[];for(const u of urls)try{let b=await fetchBytes(u,{max,fetcher});if(u.includes('/git/blobs/')){const j=JSON.parse(b);if(j.encoding!=='base64'||j.sha!==identity)throw Error('Invalid Git font blob response');b=Buffer.from(j.content.replace(/\s/g,''),'base64');}
  if(identity&&blob(b)!==identity)throw Error('Font source identity mismatch');return b;
 }catch(e){errors.push(new URL(u).hostname+': '+e.message);}
 throw Error('Cannot obtain pinned font asset. Existing site files were not overwritten. '+errors.join(' | '));
}
const base='https://cdnjs.cloudflare.com/ajax/libs/lxgw-wenkai-webfont/'+PIN.version+'/';
async function loadProvider(root,{fetcher=fetch}={}){
 const previous=readOptional(root,PROVIDER);if(previous){const data=JSON.parse(previous);validateProvider(data);return data;}
 console.log('Preparing pinned WenKai font catalogue (first run only)...');
 const tree=JSON.parse(await fetchBytes('https://api.github.com/repos/cdnjs/cdnjs/git/trees/'+PIN.tree,{fetcher}));validateTree(tree);
 const css={};for(const v of ['regular','bold'])css[v]=(await fromSources([base+'lxgwwenkai-'+v+'.css','https://raw.githubusercontent.com/cdnjs/cdnjs/master/ajax/libs/lxgw-wenkai-webfont/'+PIN.version+'/lxgwwenkai-'+v+'.css','https://api.github.com/repos/cdnjs/cdnjs/git/blobs/'+PIN[v]],PIN[v],{fetcher})).toString('utf8');
 const data={schemaVersion:1,version:PIN.version,tree,css};validateProvider(data);return data;
}
export function planGlyphs(points,primaries,faces){
 return primaries.map(p=>{const missing=points.filter(n=>!p.coverage.has(n)),selected=new Map(),unsupported=[];
  for(const n of missing){const face=faces[p.variant].find(f=>f.ranges.some(([a,b])=>n>=a&&n<=b));if(!face){unsupported.push(n);continue;}if(!selected.has(face.name))selected.set(face.name,[]);selected.get(face.name).push(n);}
  return {...p,missing,selected,unsupported};
 });
}
export function stylesheet(rows){return '/* Generated from actual site text; preserve existing covered WenKai glyphs. */\n'+rows.flatMap(r=>[FAMILY,'LXGW WenKai'].map(family=>`@font-face {\n  font-family: "${family}";\n  src: url("./font-support/${r.sha256}.woff2") format("woff2");\n  font-style: normal;\n  font-weight: ${r.weight};\n  font-display: swap;\n  unicode-range: ${r.points.map(n=>'U+'+n.toString(16).toUpperCase()).join(', ')};\n}\n`)).join('');}
function primaries(root){return PRIMARY.map(p=>{const b=readOptional(root,p.file);if(!b)throw Error('Missing existing site font: '+p.file);return {...p,coverage:fontCodepoints(b),sha256:sha(b)};});}
function readRecord(root){const b=readOptional(root,RECORD);if(!b)return null;const r=JSON.parse(b);if(r.schemaVersion!==1||!Array.isArray(r.faces)||!r.files||Array.isArray(r.files)||r.family!==FAMILY)throw Error('Invalid generated font record');const seen=new Set();for(const f of r.faces){if(!generatedFont(f.file)||!['regular','bold'].includes(f.variant)||!['400','500 700'].includes(f.weight)||!Array.isArray(f.points)||f.points.some(n=>!Number.isInteger(n)||n<0||n>0x10ffff)||seen.has(f.name+'@'+f.weight))throw Error('Invalid generated font face');seen.add(f.name+'@'+f.weight);}return r;}
function verifyOwned(root,r){if(!r)return;for(const [p,id]of Object.entries(r.files)){
 if(!generatedFont(p)&&![CSS,PROVIDER,'assets/platform/font-support/OFL.txt'].includes(p))throw Error('Unsafe generated font ownership');
 const b=readOptional(root,p);if(!b||sha(b)!==id.sha256||b.length!==id.bytes)throw Error('Generated font file changed: '+p);
 }}
export async function buildFontSupport(root=ROOT,{fetcher=fetch,provider:injected=null,corpus:given=null,primary:givenPrimary=null,pin=PIN}={}){
 const corpus=given||collectCorpus(root),original=givenPrimary||primaries(root),old=readRecord(root);verifyOwned(root,old);
 const provider=injected||await loadProvider(root,{fetcher}),{tree,faces}=validateProvider(provider,pin);
 const plans=planGlyphs(corpus.points,original,faces),unsupported=plans.flatMap(p=>p.unsupported.map(n=>({...cp(n),weight:p.weight,sources:corpus.locations.get(n)||[]})));
 if(unsupported.length)throw Error('字体不支持以下文字，已阻止发布：'+JSON.stringify(unsupported.slice(0,20)));
 const prepared=new Map([[PROVIDER,json(provider)]]),rows=[];let downloaded=0;
 const oldByBlob=new Map((old?.faces||[]).map(r=>[r.blob,r]));
 for(const file of Object.keys(old?.files||{}))if(generatedFont(file)){const bytes=readOptional(root,file);oldByBlob.set(blob(bytes),{file});}
 for(const p of plans)for(const [name,points]of p.selected){
  const identity=tree.get(name).sha,found=oldByBlob.get(identity);let bytes=found?readOptional(root,found.file):null;
  if(!bytes){console.log('Preparing font glyphs:',name,points.map(n=>String.fromCodePoint(n)).join(''));
   bytes=await fromSources([base+'files/'+name,'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@'+PIN.version+'/files/'+name,'https://api.github.com/repos/cdnjs/cdnjs/git/blobs/'+identity],identity,{fetcher});downloaded++;
  }
  if(blob(bytes)!==identity||bytes.subarray(0,4).toString()!=='wOF2')throw Error('Downloaded font identity/signature mismatch: '+name);
  const coverage=fontCodepoints(bytes),missing=points.filter(n=>!coverage.has(n));if(missing.length)throw Error('Font declares but does not contain glyphs: '+JSON.stringify(missing.map(cp)));
  const hash=sha(bytes),file='assets/platform/font-support/'+hash+'.woff2';prepared.set(file,bytes);rows.push({file,sha256:hash,blob:identity,name,weight:p.weight,variant:p.variant,points});
 }
 rows.sort((a,b)=>a.variant.localeCompare(b.variant)||a.name.localeCompare(b.name));
 prepared.set(CSS,Buffer.from(stylesheet(rows)));
 const license=licenseState(root);
 prepared.set(LICENSE_OUTPUT,license.bytes);
 const files={...old?.files};for(const [p,b]of prepared)files[p]={sha256:sha(b),bytes:b.length};
 const record={schemaVersion:1,family:FAMILY,providerVersion:PIN.version,corpus:corpus.fingerprint,license:license.record,primary:original.map(p=>({file:p.file,sha256:p.sha256,weight:p.weight})),faces:rows,files};
 // Keep every previously owned content-addressed file registered. Never delete a
 // manually edited file or pretend one network failure was a successful repair.
 prepared.set(RECORD,json(record));const changes=[];
 for(const [p,next]of prepared){const before=readOptional(root,p);if(before?.equals(next))continue;if(before&&!old?.files?.[p]&&p!==RECORD)throw Error('Unregistered generated font collision: '+p);changes.push({p,before,next});}
 for(const c of changes){const now=readOptional(root,c.p);if(c.before? !now?.equals(c.before):now!==null)throw Error('Font output changed during preflight');}
 const done=[];try{for(const c of changes){writeAtomic(root,c.p,c.next);done.push(c);}}catch(e){for(const c of done.reverse()){if(c.before)writeAtomic(root,c.p,c.before);else fs.unlinkSync(safe(root,c.p));}throw e;}
 return {changed:changes.length,downloaded,characters:corpus.points.length,supplementalFaces:rows.length,missingAfterRepair:0};
}
export function checkFontSupport(root=ROOT,{corpus:given=null,primary:givenPrimary=null,pin=PIN}={}){
 const corpus=given||collectCorpus(root),original=givenPrimary||primaries(root),r=readRecord(root);if(!r)throw Error('Font support has not been generated; run platform:build first');verifyOwned(root,r);
 const provider=JSON.parse(readOptional(root,PROVIDER)),{tree,faces}=validateProvider(provider,pin);
 const plans=planGlyphs(corpus.points,original,faces),errors=[],details=[];
 const license=licenseState(root);
 if(!readOptional(root,LICENSE_OUTPUT)?.equals(license.bytes))errors.push({problem:'stale-font-license',file:LICENSE_OUTPUT});
 if(!r.license||Object.entries(license.record).some(([key,value])=>r.license[key]!==value))errors.push({problem:'stale-font-license-provenance',file:RECORD});

 const expectedRows=[];
 for(const plan of plans){const coverage=new Set(plan.coverage),sources=[];
  for(const [name,points]of plan.selected){const row=r.faces.find(x=>x.name===name&&x.weight===plan.weight);if(!row){errors.push({problem:'missing-font-face',name,weight:plan.weight});continue;}
   const data=readOptional(root,row.file);if(!data||blob(data)!==tree.get(name).sha||!generatedFont(row.file)||row.file!=='assets/platform/font-support/'+sha(data)+'.woff2'||row.sha256!==sha(data)||row.blob!==tree.get(name).sha)throw Error('Font reference identity mismatch: '+name);
   const actual=fontCodepoints(data);for(const n of points)if(actual.has(n)&&row.points.includes(n))coverage.add(n);
   expectedRows.push({...row,points});sources.push(row.file);
  }
  const missing=corpus.points.filter(n=>!coverage.has(n));for(const n of missing)errors.push({problem:'missing-glyph',...cp(n),weight:plan.weight,sources:corpus.locations.get(n)||[]});
  details.push({file:plan.file,weight:plan.weight,primaryCodepoints:plan.coverage.size,missingPrimary:plan.missing.map(cp),supplementFiles:sources,missingAfterRepair:missing.map(cp)});
 }
 expectedRows.sort((a,b)=>a.variant.localeCompare(b.variant)||a.name.localeCompare(b.name));
 if(stylesheet(expectedRows)!==readOptional(root,CSS).toString())errors.push({problem:'stale-font-css'});
 return {schemaVersion:2,scope:'Conservative authored/runtime and generated site-shell text; local font bytes and declared active ranges; symbols tracked separately',files:corpus.files.length,characters:corpus.points.length,fonts:details,systemSymbols:corpus.symbols.map(cp),errors,ok:errors.length===0,remoteFontLoadingVerified:false};
}

/** Coverage used by real DOM auditing, including entities decoded by the browser. */
export function effectiveCoverage(root=ROOT,{primary:givenPrimary=null}={}){
 const r=readRecord(root);if(!r)throw Error('Missing generated font record');verifyOwned(root,r);
 return (givenPrimary||primaries(root)).map(p=>{const coverage=new Set(p.coverage);
  for(const face of r.faces.filter(f=>f.variant===p.variant)){const real=fontCodepoints(readOptional(root,face.file));for(const n of face.points)if(real.has(n))coverage.add(n);}
  return {weight:p.weight,coverage};
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);if(args.length){console.error('Usage: node scripts/platform/font-support.mjs');process.exitCode=2;}
 else buildFontSupport().then(r=>console.log(r)).catch(e=>{console.error(e.message);process.exitCode=1;});
}
