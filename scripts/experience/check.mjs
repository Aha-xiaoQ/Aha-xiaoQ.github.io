#!/usr/bin/env node
import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
import {readOptional} from '../lib/safe-path.mjs';import {build} from './build.mjs';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export async function check(root=ROOT){
 const generated=await build(root,{check:true});
 for(const file of ['assets/experience/model.mjs','assets/experience/runtime.mjs','assets/journal/runtime.mjs','assets/site-router.js','scripts/experience/build.mjs','scripts/experience/wire.mjs']){const r=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});if(r.status!==0)throw Error(file+' 语法错误：'+r.stderr);}
 const html=readOptional(root,'search/index.html').toString();
 if((html.match(/<h1\b/g)||[]).length!==1||(html.match(/<main\b/g)||[]).length!==1||(html.match(/data-nav-key=/g)||[]).length!==6)throw Error('搜索页面结构不一致');
 if(!html.includes('data-search-surface')||!html.includes('data-experience-module'))throw Error('缺少搜索页面入口');
 return {searchEntries:generated.entries,searchPage:'search/index.html',status:'local-structure-checked',releaseApproved:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))check().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
