#!/usr/bin/env node
import path from 'node:path';import vm from 'node:vm';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {readOptional,writeAtomic,safe} from '../lib/safe-path.mjs';import {equalText,matchesTextHash} from '../lib/text-records.mjs';
import {makeIndex,searchMarkup,validateIndex} from '../../assets/experience/model.mjs';
import {validateCatalog,validateProject} from '../../assets/journal/model.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url)),RECORD='docs/experience-r18/generated-files.json';
const hash=b=>createHash('sha256').update(b).digest('hex');
export async function planExperience(root,{reader=p=>readOptional(root,p)}={}){
 const get=async p=>{safe(root,p);const b=await reader(p);if(!b)throw Error('缺少搜索构建输入：'+p);return b.toString('utf8');};
 const catalog=validateCatalog(JSON.parse(await get('content/development/catalog.json'))),projects=[];
 for(const row of catalog.projects){const p=validateProject(JSON.parse(await get(row.file)));if(p.id!==row.id)throw Error('项目ID不一致');projects.push(p);}
 const context={};vm.runInNewContext(await get('content/site-data.js'),context,{timeout:1000});
 const index=makeIndex({site:context.SITE_DATA,projects});
 if(await reader('assets/launch/journey.js')){index.entries.push({id:'guide:visitor-help',type:'guide',href:'/play-guide/',title:'试玩帮助',summary:'第一次体验、声音播放、输入设备、加载问题与反馈方式。',tags:['试玩','声音','手机','手柄','帮助']});index.entries.sort((a,b)=>a.id.localeCompare(b.id));validateIndex(index);}
 const {nativePage}=await import('../journal/build.mjs');
 let page=nativePage(await get('notes/index.html'),searchMarkup(),{title:'搜索',intro:'查找游戏、工具、项目与开发资料。',eyebrow:'FIND SOMETHING GOOD'},'search/index.html');
 page=page.replace('data-page="notes"','data-page="search"').replace(/data-journal-page="[^"]*"/,'data-search-page="r18"').replace('data-journal-slot','data-site-search-root').replace(/(data-nav-key="notes")\s+aria-current="page"/g,'$1');
 const files=new Map([['content/search-index.json',Buffer.from(JSON.stringify(index,null,2)+'\n')],['search/index.html',Buffer.from(page)]]);
 return {files,entries:index.entries.length};
}
export async function build(root=ROOT,{check=false}={}){
 const {files,entries}=await planExperience(root);const prior=JSON.parse(readOptional(root,RECORD)||'{"files":{}}');const changes=[];
 for(const [p,b]of files){const before=readOptional(root,p);if(before&&prior.files[p]&&!matchesTextHash(before,prior.files[p]))throw Error('搜索生成文件被编辑，请先合并：'+p);if(equalText(before,b))continue;if(before&&!prior.files[p])throw Error('同名文件未被登记，停止覆盖：'+p);changes.push({p,b,before});}
 const record=Buffer.from(JSON.stringify({schemaVersion:1,files:Object.fromEntries([...files].map(([p,b])=>[p,hash(b)]))},null,2)+'\n');if(!equalText(readOptional(root,RECORD),record))changes.push({p:RECORD,b:record,before:readOptional(root,RECORD)});
 if(check&&changes.length)throw Error('搜索索引或页面落后，请运行 npm run experience:build。');
 if(!check)for(const c of changes){if((readOptional(root,c.p)===null)!==(c.before===null)||c.before&&!readOptional(root,c.p)?.equals(c.before))throw Error('构建期间文件发生变化：'+c.p);writeAtomic(root,c.p,c.b);}
 return {changed:changes.length,entries,files:files.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build(ROOT,{check:process.argv.includes('--check')}).then(x=>console.log(x)).catch(e=>{console.error(e.message);process.exitCode=1;});
