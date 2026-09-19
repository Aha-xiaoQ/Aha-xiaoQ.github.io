#!/usr/bin/env node
/** Discover local data-only contributions. A file in a stage folder is not auto-run JS. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {safe,readOptional,writeAtomic} from './lib/safe-path.mjs';
import {createStageCatalog} from '../src/content/stage-catalog.mjs';
import {createLevel13} from '../src/content/level-13.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
const specs={maps:'map.json',characters:'character.json',stages:'stage.json',audio:'audio.json'};
const sha=x=>createHash('sha256').update(x).digest('hex');
export function loadExtensionPack(root=ROOT){
  const pack={schemaVersion:1},files=[];
  for(const [type,name]of Object.entries(specs)){
    const dir=`content/extensions/${type}`;pack[type]=[];
    const entries=fs.readdirSync(safe(root,dir),{withFileTypes:true});if(entries.length>256)throw Error('Too many extension folders');
    for(const e of entries.sort((a,b)=>a.name.localeCompare(b.name,'en'))){
      const p=dir+'/'+e.name;safe(root,p);if(!e.isDirectory())throw Error('Extension root accepts folders only: '+p);
      const rel=p+'/'+name,b=readOptional(root,rel);if(!b||b.length>1024*1024)throw Error('Missing/oversized manifest: '+rel);
      const value=JSON.parse(b.toString('utf8'));if(value.id!==e.name)throw Error('Folder ID mismatch: '+rel);pack[type].push(value);files.push(rel);
    }
  }
  createStageCatalog(pack);
  const sealed=JSON.parse(readOptional(root,'content/contracts/sealed-legacy.json'));
  for(const [rel,expected] of Object.entries(sealed.files)) {
    const b=readOptional(root,rel);
    if(!b||sha(JSON.stringify(JSON.parse(b)))!==expected)throw Error('Sealed legacy descriptor changed: '+rel);
  }
  const audioManifest=JSON.parse(readOptional(root,'content/audio-manifest.json'));
  const audioKeys=new Set(audioManifest.map(x=>x.key));
  for(const a of pack.audio)for(const key of [a.music,...Object.values(a.events)])
    if(key!==null&&!audioKeys.has(key))throw Error('Unknown game audio key: '+key);
  files.push('content/contracts/sealed-legacy.json','content/audio-manifest.json');

  const snapshot=JSON.parse(readOptional(root,'content/maps/base-1-3/reference.json'));
  const manifest=JSON.parse(readOptional(root,'content/maps/base-1-3/manifest.json'));
  if(sha(JSON.stringify(snapshot))!==manifest.referenceSha256||JSON.stringify(createLevel13().compile())!==JSON.stringify(snapshot))throw Error('1-3 base map drift: do not overwrite the reference to silence this check');
  files.push('content/maps/base-1-3/reference.json','content/maps/base-1-3/manifest.json');
  return {pack,files};
}
export function scaffold(root,{kind='stage',id,title,apply=false}){
  if(!['stage','character'].includes(kind)||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id||'')||id.length>48||!title?.trim()||title.length>100)throw Error('Valid --kind, --id and --title required');
  const {pack}=loadExtensionPack(root);const entries=[];const clone=x=>JSON.parse(JSON.stringify(x));
  if(kind==='character'){
    if(pack.characters.some(x=>x.id===id))throw Error('Character already exists');
    const c=clone(pack.characters.find(x=>x.id==='lab-runner'));c.id=id;c.title=title;c.note='新贡献：当前使用原型移动器与几何预览，替换正式能力/素材前需另行验收。';entries.push([`content/extensions/characters/${id}/character.json`,c]);
  }else{
    if(pack.stages.some(x=>x.id===id))throw Error('Stage already exists');
    const s=clone(pack.stages.find(x=>x.id==='lab-platforms'));s.id=id;s.title=title;s.status='draft';s.note='新关卡草稿：自动生成的是接入试验地图，不是标题所指原版地图。请核验底图、机关、敌人、授权和通关路线。';
    for(const [r,mid] of Object.entries(s.rooms)){const m=clone(pack.maps.find(x=>x.id===mid));m.id=id+'-'+r;m.title=title+' / '+r;s.rooms[r]=m.id;entries.push([`content/extensions/maps/${m.id}/map.json`,m]);}
    entries.push([`content/extensions/stages/${id}/stage.json`,s]);
  }
  for(const [rel]of entries)if(readOptional(root,rel))throw Error('Will not overwrite: '+rel);
  const check=clone(pack);for(const [p,x]of entries){const type=p.split('/')[2];check[type].push(x);}createStageCatalog(check);
  if(apply){for(const [rel]of entries)if(readOptional(root,rel))throw Error('Concurrent creation');for(const [rel,x]of entries)writeAtomic(root,rel,Buffer.from(JSON.stringify(x,null,2)+'\n'));}
  return {mode:apply?'created':'dry-run',files:entries.map(x=>x[0]),next:'Complete data, add the character ID to the stage allow-list, then npm run stage:check and npm run dev. Drafts require the launcher checkbox.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
  if(args.includes('--new'))console.log(JSON.stringify(scaffold(ROOT,{kind:args.includes('--kind')?value('--kind'):'stage',id:value('--id'),title:value('--title'),apply:args.includes('--apply')}),null,2));
  else {const {pack}=loadExtensionPack();console.log(JSON.stringify({maps:pack.maps.length,stages:pack.stages.length,characters:pack.characters.length,pairs:pack.stages.map(s=>({stage:s.id,status:s.status,driver:s.driver,characters:s.characters})),note:'schema validation is not natural-play or rights approval'},null,2));}
 }catch(e){console.error(e.message);process.exitCode=1;}
}
