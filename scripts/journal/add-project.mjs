#!/usr/bin/env node
/** Explicit local scaffold. New entries stay draft until a maintainer reviews them. */
import {readFile,writeFile,mkdir}from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
import{validId,CATEGORY_LABELS,validateCatalog,validateProject,validateState}from'../../assets/journal/model.mjs';
import{safe,read,ROOT}from'./build.mjs';
export async function addProject(root,{id,title,category='other'}){
 if(!validId(id))throw Error('项目 ID 无效或与保留路由冲突。');if(typeof title!=='string'||!title.trim()||title.length>48||!Object.hasOwn(CATEGORY_LABELS,category))throw Error('请提供简短标题与有效类型。');
 const catalogPath='content/development/catalog.json',before=await read(root,catalogPath),catalog=validateCatalog(JSON.parse(before));if(catalog.projects.some(x=>x.id===id))throw Error('项目已经登记。');
 const file=`content/development/projects/${id}.json`,statePath=`content/development/states/${id}.json`;
 if(await read(root,file)||await read(root,statePath))throw Error('同名配置或状态文件已经存在。');
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const p=validateProject({schemaVersion:1,id,title,category,visibility:'draft',stage:'待补充',updatedAt:day,summary:'请填写面向观众的项目介绍。',intro:'请说明项目是什么、目前可以体验什么，以及现阶段的范围。',highlights:[],links:[],docs:[],updates:[],participation:{mode:'preparing',summary:'请先确定参与范围与联系渠道。'},state:{adapter:'project-v1',path:statePath}});
 const state=validateState({schemaVersion:1,projectId:id,revision:1,updatedAt:day,tasks:[]},id);catalog.projects.push({id,file});validateCatalog(catalog);
 if(!(await read(root,catalogPath)).equals(before))throw Error('索引在检查后发生变化，未写入。');
 const entries=[[statePath,state],[file,p],[catalogPath,catalog]];
 for(const [rel,data]of entries){const dst=await safe(root,rel);await mkdir(path.dirname(dst),{recursive:true});await writeFile(dst,JSON.stringify(data,null,2)+'\n',rel===catalogPath?{}:{flag:'wx'});}
 return {id,visibility:'draft',file,state:statePath};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),o={};for(let i=0;i<args.length;i++){if(!['--id','--title','--category'].includes(args[i])||!args[i+1])throw Error('Usage: --id my-project --title "项目名" --category game|web|tool|experiment|other');o[args[i].slice(2)]=args[++i];}
 addProject(ROOT,o).then(r=>console.log('仅创建本地草稿，未公开：',r)).catch(e=>{console.error(e.message);process.exitCode=1;});
}
