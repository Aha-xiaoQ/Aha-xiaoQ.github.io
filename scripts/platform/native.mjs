#!/usr/bin/env node
/** Resource wiring for source-owned, non-generated native entries only. */
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {readOptional,writeAtomic} from '../lib/safe-path.mjs';
import {validateConfig} from './model.mjs';import {wirePlatform} from './wire.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function build(root=ROOT,{check=false}={}){
 const config=validateConfig(JSON.parse(readOptional(root,'config/site-platform.json'))),changes=[];
 for(const p of config.nativeEntries){
  const old=readOptional(root,p);if(!old)throw Error('Missing native website entry: '+p);
  const next=Buffer.from(wirePlatform(old.toString(),{root}));
  if(!old.equals(next))changes.push({p,old,next});
 }
 if(check&&changes.length)throw Error('Native platform resources are stale: npm run platform:build');
 for(const c of changes)if(!readOptional(root,c.p)?.equals(c.old))throw Error('Native page changed during preparation');
 if(!check)for(const c of changes)writeAtomic(root,c.p,c.next);
 return{changed:changes.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{if(process.argv.slice(2).some(x=>x!=='--check'))throw Error('Unsupported option');console.log(build(ROOT,{check:process.argv.includes('--check')}));}catch(error){console.error(error.message);process.exitCode=1;}
