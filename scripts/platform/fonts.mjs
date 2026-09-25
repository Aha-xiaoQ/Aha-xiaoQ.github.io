#!/usr/bin/env node
/** Report actual local font cmap coverage separately from declared remote fallbacks. */
import path from 'node:path';import {fileURLToPath}from'node:url';import {createHash}from'node:crypto';
import {readOptional,writeAtomic}from'../lib/safe-path.mjs';import {fontCodepoints,missingCodepoints}from'./font-cmap.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const paths=['assets/fonts/LXGWWenKai-Regular-site.woff2','assets/fonts/LXGWWenKai-Medium-site.woff2'];
const skip=new Set(['code','href','url','path','file','source','sources','sha256','id','sourceHref','manifestHref','repository','issueUrl','deferredGuide']);
function prose(value,key=''){
 if(skip.has(key))return '';
 if(typeof value==='string')return value;
 if(Array.isArray(value))return value.map(x=>prose(x,key)).join('\n');
 if(value&&typeof value==='object')return Object.entries(value).map(([k,v])=>prose(v,k)).join('\n');return '';
}
export function reportFonts(root=ROOT,{reader=p=>readOptional(root,p)}={}){
 const get=p=>{const b=reader(p);if(!b)throw Error('Missing font coverage input: '+p);return b;};
 const catalog=JSON.parse(get('content/development/catalog.json'));
 const text=[prose(JSON.parse(get('content/locales/en.json'))),...catalog.projects.map(row=>prose(JSON.parse(get(row.file))))].join('\n');
 const declared=new Set([0x5c3c,0x9e48,0x9e55]);
 const fonts=paths.map(file=>{
  const bytes=get(file),coverage=fontCodepoints(bytes),missing=missingCodepoints(text,coverage);
  const cp=n=>({character:String.fromCodePoint(n),unicode:'U+'+n.toString(16).toUpperCase()});
  return {file,sha256:createHash('sha256').update(bytes).digest('hex'),glyphCodepoints:coverage.size,
   missingPrimary:missing.map(cp),declaredRemoteFallback:missing.filter(n=>declared.has(n)).map(cp),
   systemFallbackRequired:missing.filter(n=>!declared.has(n)).map(cp)};
 });
 return {schemaVersion:1,scope:'Local cmap coverage of registered project prose and added English messages; not a browser font-download test',fonts,remoteFontLoadingVerified:false};
}
export function writeReport(root=ROOT){const report=reportFonts(root);writeAtomic(root,'.local/platform/font-coverage.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));return report;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{if(process.argv.length>2)throw Error('Unsupported option');const r=writeReport();console.log(JSON.stringify({fonts:r.fonts.map(f=>({file:f.file,glyphCodepoints:f.glyphCodepoints,missingPrimary:f.missingPrimary.length,remoteFallback:f.declaredRemoteFallback.length,systemFallback:f.systemFallbackRequired.length})),report:'.local/platform/font-coverage.json',remoteFontLoadingVerified:false},null,2));}catch(e){console.error(e.message);process.exitCode=1;}
