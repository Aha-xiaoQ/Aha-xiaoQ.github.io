#!/usr/bin/env node
/** Generate cache aliases from the current source graph. No source files are rewritten. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {safe,readOptional,writeAtomic} from '../lib/safe-path.mjs';
import {importMap} from './assets.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const OUTPUT='assets/platform/import-map.json';
export function sourceModules(root){
  const out=new Map();
  function visit(rel){const abs=safe(root,rel),stat=fs.lstatSync(abs);if(stat.isSymbolicLink())throw Error('Linked asset path');if(stat.isDirectory()){for(const name of fs.readdirSync(abs).sort())visit(rel+'/'+name);}else if(stat.isFile()&&/\.(?:js|mjs)$/.test(rel))out.set(rel,readOptional(root,rel));}
  visit('assets');return out;
}
export function build(root=ROOT,{check=false}={}){
  const data=Buffer.from(JSON.stringify(importMap(sourceModules(root)),null,2)+'\n'),old=readOptional(root,OUTPUT);
  if(check&&!old?.equals(data))throw Error('Module cache map is stale: npm run journal:build');
  if(!check&&!old?.equals(data))writeAtomic(root,OUTPUT,data);
  return {changed:old?.equals(data)?0:1,aliases:Object.keys(JSON.parse(data).imports).length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{if(process.argv.slice(2).some(x=>x!=='--check'))throw Error('Unsupported option');console.log(build(ROOT,{check:process.argv.includes('--check')}));}catch(error){console.error(error.message);process.exitCode=1;}
