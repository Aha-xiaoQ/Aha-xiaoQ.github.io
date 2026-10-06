#!/usr/bin/env node
/** VIDEO-R1. Derive public video status from the two canonical videoUrl fields.
 * Never guesses a BV ID or treats a populated link as playback verification.
 */
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {readOptional,writeAtomic} from '../lib/safe-path.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const PROJECT='content/development/projects/mario-mix.json';
export const TARGETS=Object.freeze([
 {key:'episode4',collection:'items',id:'game-mario-mix-4',label:'第四期 · 索尼克 × 奥日',en:'Episode 4: Sonic × Ori',href:'/games/mario-mix-4/'},
 {key:'workshop',collection:'tools',id:'mario-map-workshop',label:'马里奥地图工坊',en:'Mario Map Workshop',href:'/packages/mario-mix-worlds/atlas/editor.html'}
]);
export function videoURL(value){
 if(value===undefined||value===null||value==='')return null;
 if(typeof value!=='string'||!/^https:\/\/www\.bilibili\.com\/video\/BV1[A-Za-z0-9]{9}\/$/.test(value))throw Error('视频链接必须是规范的 Bilibili BV 地址');
 return value;
}
export function rows(data){
 return TARGETS.map(t=>{
  const matches=data[t.collection]?.filter(x=>x.id===t.id);
  if(matches?.length!==1||matches[0].videoSlot!==true)throw Error('视频目标缺失、重复或未登记展示位置：'+t.id);
  return {...t,url:videoURL(matches[0].videoUrl)};
 });
}
export function projectVideos(project,items){
 const p=structuredClone(project);
 const labels=new Set(TARGETS.map(t=>t.label+' · 视频'));
 p.links=p.links.filter(l=>!labels.has(l.label));
 for(const t of items)if(t.url)p.links.push({label:t.label+' · 视频',href:t.url});
 const status='视频：'+items.map(t=>t.label+' '+(t.url?'可观看视频':'视频待发布')).join('；')+'。';
 p.highlights=p.highlights.filter(x=>!x.startsWith('视频：'));p.highlights.push(status);
 const d=p.docs.find(d=>d.id==='episode-4');if(!d)throw Error('第四期资料页未登记');
 const title='视频入口';d.sections=d.sections.filter(x=>x.title!==title);
 d.sections.push({title,paragraphs:items.map(t=>t.label+'：'+(t.url?'从下方链接观看视频。':'视频待发布。'))});
 d.sources=d.sources.filter(l=>!labels.has(l.label));for(const t of items)if(t.url)d.sources.push({label:t.label+' · 视频',href:t.url});
 return p;
}
export function plan(root=ROOT){
 const get=p=>{const b=readOptional(root,p);if(!b)throw Error('缺少视频状态来源：'+p);return b.toString('utf8');};
 const c={};new vm.Script(get('content/site-data.js')).runInNewContext(c,{timeout:1000});
 const items=rows(c.SITE_DATA),out=new Map();
 // README provides stable navigation; current video links belong to project pages.
 const p=projectVideos(JSON.parse(get(PROJECT)),items);out.set(PROJECT,Buffer.from(JSON.stringify(p,null,2)+'\n'));
 return out;
}
export function sync(root=ROOT,{check=false}={}){
 const out=plan(root),changes=[...out].filter(([p,b])=>!readOptional(root,p)?.equals(b));
 if(check&&changes.length)throw Error('视频文档或状态未同步：npm run video:sync');
 for(const[p,b]of check?[]:changes)writeAtomic(root,p,b);
 return {changed:changes.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.slice(2).some(x=>x!=='--check'))throw Error('未知参数');console.log(sync(ROOT,{check:process.argv.includes('--check')}));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
