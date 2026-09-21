#!/usr/bin/env node
/** Version shared assets on native entry templates that no page generator owns. */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readOptional,writeAtomic} from '../lib/safe-path.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const ENTRIES=Object.freeze(['index.html','games/pixel-pipe-adventure/index.html','games/voxel-frontier/index.html']);
export const ASSETS=Object.freeze(['content/site-data.js','assets/site-brand-tokens.css','assets/workshop-cards.js','assets/ui/site-actions.js','assets/ui/site-actions.css','assets/launch/journey.js','assets/journal/model.mjs']);
export function versionEntry(text,root=ROOT){
 return text.replace(/(\b(?:src|href)=["'])([^"']+)(["'])/g,(all,a,url,z)=>{
  if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url))return all;
  const p=url.replace(/^(?:\.\.\/)+/,'').replace(/^\//,'').split(/[?#]/)[0];
  if(!ASSETS.includes(p))return all;
  const bytes=readOptional(root,p);if(!bytes)throw Error('缺少版本资源：'+p);
  return a+url.split(/[?#]/)[0]+'?v='+createHash('sha256').update(bytes).digest('hex').slice(0,16)+z;
 });
}
export function sync(root=ROOT,{check=false}={}){
 const changes=[];
 for(const p of ENTRIES){const old=readOptional(root,p);if(!old)throw Error('缺少原生页面入口：'+p);const next=Buffer.from(versionEntry(old.toString(),root));if(!old.equals(next))changes.push({p,old,next});}
 if(check&&changes.length)throw Error('首页或旧入口资源版本未更新：npm run video:cache');
 for(const c of changes)if(!readOptional(root,c.p)?.equals(c.old))throw Error('入口在版本检查期间改变');
 if(!check)for(const c of changes)writeAtomic(root,c.p,c.next);
 return{changed:changes.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{if(process.argv.slice(2).some(x=>x!=='--check'))throw Error('未知参数');console.log(sync(ROOT,{check:process.argv.includes('--check')}));}catch(e){console.error(e.message);process.exitCode=1;}
