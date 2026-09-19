import fs from 'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import{compileAll,makeExtensions,tiledMap}from'../src/reference.mjs';import{validateCampaign}from'../src/campaign.mjs';import{mapSVG}from'../src/map-view.mjs';import{createStageCatalog}from'../vendor/m06/stage-catalog.mjs';import{safe,readOptional,writeAtomic,entryStat}from'./lib/safe-path.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const hash=b=>createHash('sha256').update(b).digest('hex');
export function outputs(root=ROOT){const source=JSON.parse(readOptional(root,'data/reference/world-1.json')),campaign=validateCampaign(JSON.parse(readOptional(root,'data/campaign.json')));const compiled=compileAll(source),pack=makeExtensions(compiled);createStageCatalog(pack);
 const forkDir=safe(root,'content/forks');if(entryStat(forkDir)){for(const name of fs.readdirSync(forkDir)){if(!/^[a-z][a-z0-9-]{2,28}\.json$/.test(name))throw Error('草稿目录仅接受已命名JSON');createStageCatalog(JSON.parse(readOptional(root,'content/forks/'+name)));}}const out=new Map(),add=(p,x)=>out.set(p,Buffer.from(typeof x==='string'?x:JSON.stringify(x,null,2)+'\n'));
 add('data/generated/world-1.json',{schemaVersion:1,maps:compiled});add('data/generated/extensions.json',pack);
 for(const c of compiled){add(`data/generated/${c.id}.json`,{schemaVersion:1,maps:pack.maps.filter(r=>c.rooms.some(s=>s.id===r.id)),characters:pack.characters,stages:pack.stages.filter(s=>s.id==='atlas-'+c.id),audio:pack.audio});for(const r of c.rooms){add(`previews/${c.id}-${r.room}.svg`,mapSVG(r));add(`tiled/${c.id}-${r.room}.tmj`,tiledMap(r));}}
 add('docs/PROGRESS.md','# 关卡登记（自动生成）\n\n来源：data/campaign.json。制作状态、底图核验和角色接入分别记录。\n\n|关卡|角色|制作状态|模板|原版复核|下一步|\n|---|---|---|---|---|---|\n'+campaign.chapters.map(c=>`|${c.id}|${c.characters.join(' / ')||'待定'}|${c.production}|${c.template.status}|${c.template.originalReview}|${c.next}|`).join('\n')+'\n');
 add('data/generated/coverage.json',{scope:'reference-geometry-not-original-game-certification',chapters:compiled.map(c=>({id:c.id,rooms:c.rooms.length,ops:c.rooms.reduce((a,r)=>a+r.coverage.length,0),geometry:c.rooms.reduce((a,r)=>a+r.geometry.length,0),annotations:c.rooms.reduce((a,r)=>a+r.annotations.length,0),limits:[...new Set(c.rooms.flatMap(r=>r.limits))]})),registry:campaign.chapters.length});
 return out;}
/** Preflight every output before writing; do not partially rebuild on a late conflict. */
export function build(root=ROOT,{check=false}={}) {
 const out=outputs(root),record='data/generated-manifest.json';
 const oldRecord=readOptional(root,record),prev=JSON.parse(oldRecord||'{"files":{}}');
 const changes=[],remove=[];
 for(const [p,b] of out){
  const before=readOptional(root,p);
  if(before&&!before.equals(b)&&(!prev.files[p]||hash(before)!==prev.files[p]))throw Error('生成内容已有手改或缺少登记：'+p);
  if(!before||!before.equals(b))changes.push({p,b,before});
 }
 for(const [p,h] of Object.entries(prev.files)) if(!out.has(p)){
  if(!/^(?:data\/generated\/|previews\/|tiled\/|docs\/PROGRESS\.md$)/.test(p))throw Error('生成清单越界：'+p);
  const before=readOptional(root,p);if(before){if(hash(before)!==h)throw Error('过期生成内容已有手改：'+p);remove.push({p,b:null,before});}
 }
 const manifest=Buffer.from(JSON.stringify({schemaVersion:1,files:Object.fromEntries([...out].map(([p,b])=>[p,hash(b)]))},null,2)+'\n');
 const recordChanged=!oldRecord||!oldRecord.equals(manifest);
 if(check&&(changes.length||remove.length||recordChanged))throw Error('生成内容不同步：运行 npm run build');
 if(!check){
  const writes=[...changes,...remove,...(recordChanged?[{p:record,b:manifest,before:oldRecord}]:[])];
  const same=(a,b)=>(a===null)===(b===null)&&(!a||a.equals(b));
  for(const c of writes)if(!same(readOptional(root,c.p),c.before))throw Error('构建期间出现新编辑：'+c.p);
  const done=[];
  try{for(const c of writes){if(!same(readOptional(root,c.p),c.before))throw Error('写入前出现新编辑：'+c.p);if(c.b)writeAtomic(root,c.p,c.b);else fs.unlinkSync(safe(root,c.p));done.push(c);}}
  catch(e){for(const c of done.reverse())if(same(readOptional(root,c.p),c.b)){if(c.before)writeAtomic(root,c.p,c.before);else fs.unlinkSync(safe(root,c.p));}throw e;}
 }
 return {files:out.size,changed:changes.length,removed:remove.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(build(ROOT,{check:process.argv.includes('--check')}));}catch(e){console.error(e.message);process.exitCode=1;}
