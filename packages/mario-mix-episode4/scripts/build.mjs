/** Lossless compiler: restore the original inline tags and shared JavaScript scope. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {safe,readOptional,writeAtomic} from './lib/safe-path.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const sha=b=>createHash('sha256').update(b).digest('hex');
const token=/@@E04:(file|uri|base64):([A-Za-z0-9_./-]+)@@/g;
export function read(root,rel){const b=readOptional(root,rel);if(!b)throw Error('缺少源码文件：'+rel);return b;}
export function manifest(root=ROOT){
 const m=JSON.parse(read(root,'manifest.json'));
 if(m.schemaVersion!==1||m.entry!=='src/app/shell.template.html'||!Array.isArray(m.sources)||!Array.isArray(m.parts)||!m.assets||!m.baseline)throw Error('源码清单格式错误');
 const seen=new Set();
 for(const p of m.sources){if(!/^src\/[a-zA-Z0-9_./-]+\.(?:js|css|html|json)$/.test(p)||seen.has(p))throw Error('重复或非法源码路径');safe(root,p);seen.add(p);}
 if(!seen.has(m.entry)||m.parts.some(p=>!seen.has(p)))throw Error('入口或片段没有登记');
 for(const [id,a]of Object.entries(m.assets)){
  if(!/^a\d+$/.test(id)||!/^assets\/(?:audio|images)\/[a-zA-Z0-9_.-]+\.(?:mp3|wav|ogg|png|webp)$/.test(a.path)||!/^([a-f0-9]{64})$/.test(a.sha256)||!Number.isSafeInteger(a.bytes)||a.bytes<1)throw Error('非法素材登记：'+id);
  if(!['image/png','image/webp','audio/mpeg','audio/wav','audio/ogg'].includes(a.mime))throw Error('不允许的素材类型');safe(root,a.path);
 }
 if(!/^[a-f0-9]{64}$/.test(m.baseline.sha256)||!Number.isSafeInteger(m.baseline.bytes))throw Error('基线记录不完整');
 return m;
}
export function compile(root=ROOT){
 const m=manifest(root),allowed=new Set(m.sources),assetCache=new Map(),usedFiles=new Set(),usedAssets=new Set();
 const expand=(rel,stack=[])=>{
  if(!allowed.has(rel))throw Error('未登记的源码：'+rel);
  if(stack.includes(rel))throw Error('循环包含：'+rel);
  usedFiles.add(rel);
  const text=read(root,rel).toString('utf8');
  return text.replace(token,(_,kind,id)=>{
   if(kind==='file')return expand(id,[...stack,rel]);
   const a=m.assets[id];if(!a)throw Error('未登记的素材：'+id);usedAssets.add(id);
   if(!assetCache.has(id)){const b=read(root,a.path);if(b.length!==a.bytes||sha(b)!==a.sha256)throw Error('素材校验失败：'+a.path);assetCache.set(id,b.toString('base64'));}
   return (kind==='uri'?'data:'+a.mime+';base64,':'')+assetCache.get(id);
  });
 };
 const bytes=Buffer.from(expand(m.entry));
 if(bytes.includes(Buffer.from('@@E04:')))throw Error('还有未展开的模板标记');
 if(usedFiles.size!==allowed.size)throw Error('存在未使用的源码文件');
 if(usedAssets.size!==Object.keys(m.assets).length)throw Error('存在未使用的素材');
 return {bytes,manifest:m,sourceFiles:usedFiles.size,assets:usedAssets.size,sha256:sha(bytes)};
}
export function build(root=ROOT){
 const result=compile(root);writeAtomic(root,'dist/play.html',result.bytes);
 writeAtomic(root,'dist/build.json',Buffer.from(JSON.stringify({edition:result.manifest.edition,gameVersion:result.manifest.gameVersion,bytes:result.bytes.length,sha256:result.sha256,baselineMatch:result.sha256===result.manifest.baseline.sha256},null,2)+'\n'));
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('用法：npm run build');const r=build();console.log('构建完成：dist/play.html\nSHA256 '+r.sha256+'\n与 R43 发布基线一致：'+(r.sha256===r.manifest.baseline.sha256));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
