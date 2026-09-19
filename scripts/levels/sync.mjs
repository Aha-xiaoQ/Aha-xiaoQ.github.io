#!/usr/bin/env node
/** Project overview is a generated projection, not a second task database. */
import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';import{readOptional,writeAtomic}from'../lib/safe-path.mjs';
import{validateCampaign}from'../../packages/mario-mix-levels/src/campaign.mjs';
import{validateProject}from'../../assets/journal/model.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));export const RECORD='docs/levels-r20/projection.json';export const PROJECT='content/development/projects/mario-mix.json';
const hash=b=>createHash('sha256').update(b).digest('hex'),bytes=o=>Buffer.from(JSON.stringify(o,null,2)+'\n');
export function projection(campaign,compiled){validateCampaign(campaign);for(const c of campaign.chapters)if(c.template.status==='transcribed'&&!compiled.maps.some(m=>m.id===c.id))throw Error('登记的模板缺少实际地图：'+c.id);return{schemaVersion:1,revision:campaign.revision,updatedAt:campaign.updatedAt,kitVersion:'K01',documentId:'terra-stages',sourceHref:'/downloads/source/MarioMix_Levels_K01_Source.zip',source:'packages/mario-mix-levels/data/campaign.json',chapters:campaign.chapters.map(c=>{const template=compiled.maps.find(m=>m.id===c.id),room=template?.rooms.find(r=>r.room===template.entryRoom);return{...c,preview:room?`/packages/mario-mix-levels/previews/${c.id}-${room.room}.svg`:null,previewWidth:room?.width||0,roomNames:template?.rooms.map(r=>r.title)||[]};})};}
export function planSync(root=ROOT,{reader=p=>readOptional(root,p),initial=false}={}){
 const parse=p=>{const b=reader(p);if(!b)throw Error('缺少 '+p);return JSON.parse(b);};const campaign=parse('packages/mario-mix-levels/data/campaign.json'),compiled=parse('packages/mario-mix-levels/data/generated/world-1.json'),p=parse(PROJECT),old=reader(RECORD)?parse(RECORD):null;
 if(!initial&&old&&hash(bytes(p.levelPlan))!==old.projectionSha256)throw Error('关卡投影有手工修改，请合并到 packages/mario-mix-levels/data/campaign.json');
 p.levelPlan=projection(campaign,compiled);validateProject(p);
 return new Map([[PROJECT,bytes(p)],[RECORD,bytes({schemaVersion:1,source:p.levelPlan.source,sourceSha256:hash(bytes(campaign)),projectionSha256:hash(bytes(p.levelPlan)),note:'只记录来源与投影一致性；制作完成与原版复验是独立状态。'})]]);
}
export function sync(root=ROOT,{check=false}={}){const out=planSync(root);let changed=0;for(const[p,b]of out){const old=readOptional(root,p);if(!old||!old.equals(b)){changed++;if(check)throw Error('关卡登记与网页不同步：npm run levels:sync');writeAtomic(root,p,b);}}return{changed};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(sync(ROOT,{check:process.argv.includes('--check')}));}catch(e){console.error(e.message);process.exitCode=1;}
