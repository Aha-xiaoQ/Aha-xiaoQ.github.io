import fs from 'node:fs';import path from 'node:path';import {fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import{readOptional,writeAtomic}from'./lib/safe-path.mjs';
import{compileWorld,extensionFiles,previewAudio}from'../src/compiler.mjs';import{validateCatalog,publicProjection}from'../src/catalog.mjs';import{mapSVG}from'../src/map-svg.mjs';import{zip}from'./lib/zip.mjs';import{loadReference}from'./reference.mjs';import{toTiled}from'../src/tiled.mjs';
export const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url))),hash=b=>createHash('sha256').update(b).digest('hex'),json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
export function plan(root=ROOT){
 const reference=loadReference(root),catalog=validateCatalog(JSON.parse(readOptional(root,'content/catalog.json'))),out=new Map(),worlds=[];
 for(const l of catalog.levels.filter(l=>l.template.status==='reference-draft')){
  const w=compileWorld(reference,l.id);worlds.push(w);const files=new Map();
  files.set('template.json',json(w));files.set('coverage.json',json(w.coverage));files.set('reference.json',json({...reference.source,map:reference.maps.find(m=>m.name===l.id)}));files.set('LICENSE-reference.txt',readOptional(root,'reference/LICENSE-MIT.txt'));files.set('NOTICE.md',readOptional(root,'NOTICE.md'));
  if(w.topology)files.set('topology.json',json(w.topology));
  files.set('README.md',Buffer.from(`# ${l.id} 参考地图模板 · W02\n\n${w.coverage.areas} 个原始区域，${w.rooms.length} 个查看视图。完整转录保存在 reference.json，地形、对象定位和机制缺口分别保存在 template.json / coverage.json。不是原版保真认证或已完成的同人关卡。\n\n## 使用\n下载完整 Worlds W02 Starter，运行 npm run atlas 查看地图册；npm run dev 打开 M06 试验场。小地图 ZIP 不包含运行时。\n\n${w.inspectionStages?'世界 2–8 导出为独立分区地形检查。水下区域只提供地图与环境声明，不使用平台物理冒充游泳。循环城堡保留 before/stretch/after 和原条件图，不拼接成伪造的直线通关图。':'第一世界沿用 W01 接入方式。'}\n\nTiled 为对象层导出，仅供编辑参考；编辑结果不会自动回写游戏。\n\n## 待实现 / 核验\n${w.coverage.pending.join('、')}。\n`));
  for(const[p,x]of extensionFiles(w))files.set('extension/'+p,json(x));
  files.set('extension/content/extensions/audio/map-kit-silent/audio.json',json(previewAudio()));
  for(const r of w.rooms){files.set(r.roomId+'.svg',Buffer.from(mapSVG(r)));files.set('tiled/'+r.roomId+'.tmj',json(toTiled(r)));}
  for(const[p,b]of files)out.set(`generated/levels/${l.id}/${p}`,b);
  out.set(`generated/downloads/MarioMix_Map_${l.id}_W02.zip`,zip([...files].map(([p,b])=>[`MarioMix_Map_${l.id}/`+p,b])));
 }
 for(let i=1;i<=8;i++){const ws=worlds.filter(w=>w.level.startsWith(i+'-')),entries=ws.flatMap(w=>[...out].filter(([p])=>p.startsWith(`generated/levels/${w.level}/`)).map(([p,b])=>[p.replace('generated/levels/',`world-${i}/`),b]));out.set(`generated/downloads/MarioMix_World_${i}_W02.zip`,zip(entries));}
 out.set('generated/catalog-public.json',json(publicProjection(catalog)));
 out.set('generated/coverage.json',json(worlds.map(w=>({level:w.level,...w.coverage}))));
 out.set('generated/atlas-index.json',json({schemaVersion:1,version:'0.2.0',revision:'W02',levels:worlds.map(w=>({id:w.level,areas:w.coverage.areas,views:w.rooms.length,sectionViews:w.coverage.sectionViews||0,underwaterAreas:w.coverage.underwaterAreas||0,download:`generated/downloads/MarioMix_Map_${w.level}_W02.zip`,source:`generated/levels/${w.level}/template.json`,rooms:w.rooms.map(r=>({id:r.roomId,title:r.map.title,setting:r.setting,width:r.map.width,height:r.map.height,underwater:!!r.underwater,origin:r.origin||{part:'base'},svg:`generated/levels/${w.level}/${r.roomId}.svg`,tiled:`generated/levels/${w.level}/tiled/${r.roomId}.tmj`}))}))}));
 // W01 downloads stay available as immutable historical outputs, but never as current links.
 for(const l of ['1-1','1-2','1-3','1-4']){const p=`generated/downloads/MarioMix_Map_${l}_W01.zip`,b=readOptional(root,p);if(b)out.set(p,b);}
 const manifest={schemaVersion:1,files:Object.fromEntries([...out].map(([p,b])=>[p,hash(b)]))};out.set('generated/manifest.json',json(manifest));return{out,worlds,catalog};
}
export function build(root=ROOT,{check=false}={}){
 const {out,worlds}=plan(root),prev=JSON.parse(readOptional(root,'generated/manifest.json')||'{"files":{}}'),changes=[];
 for(const p of Object.keys(prev.files))if(!p.startsWith('generated/')||p==='generated/manifest.json')throw Error('Invalid generation manifest');else if(!out.has(p))throw Error('Obsolete output requires explicit migration: '+p);
 for(const[p,b]of out){const old=readOptional(root,p);if(old?.equals(b))continue;if(old&&p!=='generated/manifest.json'&&(!prev.files[p]||hash(old)!==prev.files[p]))throw Error('Generated output edited: '+p);changes.push([p,b,old]);}
 if(check&&changes.length)throw Error('Template outputs stale; run npm run build');
 if(!check){for(const[p,,old]of changes){const now=readOptional(root,p);if((now===null)!==(old===null)||(now&&!now.equals(old)))throw Error('Concurrent modification');}for(const[p,b]of changes)writeAtomic(root,p,b);}
 return{levels:worlds.length,areas:worlds.reduce((n,w)=>n+w.coverage.areas,0),views:worlds.reduce((n,w)=>n+w.maps.length,0),files:out.size,changed:changes.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(build(ROOT,{check:process.argv.includes('--check')}));}catch(e){console.error(e.message);process.exitCode=1;}}
