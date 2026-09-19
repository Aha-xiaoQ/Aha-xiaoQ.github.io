/** Assemble an isolated candidate using the existing M06 host. Never alters its source. */
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath,pathToFileURL}from'node:url';
import{labelPreview}from'../src/preview-labels.mjs';
import{ROOT,plan,json}from'./build.mjs';import{safe,readOptional,writeAtomic,entryStat}from'./lib/safe-path.mjs';import{extensionFiles,previewAudio}from'../src/compiler.mjs';
export function locateGame(root=ROOT,provided){
 const list=provided?[path.resolve(provided)]:[path.join(root,'runtime/mario-mix-terra'),path.resolve(root,'../mario-mix-terra')];
 for(const p of list){if(entryStat(p)){safe(p,'package.json');if(readOptional(p,'build.config.json')&&readOptional(p,'src/content/stage-catalog.mjs'))return p;}}
 throw Error('找不到 M06 运行时。使用完整 Starter，或在命令后添加 --game "M06源码目录"。');
}
function sourceFiles(root,rel=''){
 const out=[];for(const e of fs.readdirSync(rel?safe(root,rel):path.dirname(safe(root,'package.json')),{withFileTypes:true})){
  if(['.git','node_modules','dist','.local','SOURCE_SHA256SUMS.txt'].includes(e.name))continue;
  const p=rel?rel+'/'+e.name:e.name;safe(root,p);
  if(e.isSymbolicLink())throw Error('Source symlink rejected');if(e.isDirectory())out.push(...sourceFiles(root,p));else if(e.isFile()){if(/\.(ttf|otf|woff2?|eot)$/i.test(p))throw Error('Font files are not part of this package');out.push([p,readOptional(root,p)]);}
 }return out.sort(([a],[b])=>a.localeCompare(b,'en'));
}
export {sourceFiles};
export function adaptations(root=ROOT){
 const dir=safe(root,'content/adaptations'),out=[];
 if(!entryStat(dir))return out;
 const names=fs.readdirSync(dir);if(names.length>128)throw Error('Too many adaptations');
 for(const name of names.sort()){if(name==='.gitkeep')continue;if(!/^[a-z][a-z0-9-]{1,48}\.json$/.test(name))throw Error('Unsupported adaptation filename');const b=readOptional(root,'content/adaptations/'+name);if(b.length>100000)throw Error('Oversized adaptation');const x=JSON.parse(b);if(x.id+'.json'!==name||!/^[1-8]-[1-4]$/.test(x.base)||typeof x.title!=='string'||!x.title.trim()||x.title.length>72||!Array.isArray(x.characters)||!x.characters.length||x.characters.some(c=>!['lab-runner','lab-scout'].includes(c))||typeof x.overlays!=='object'||x.overlays===null)throw Error('Invalid adaptation');for(const key of Object.keys(x))if(!['id','base','title','characters','overlays','note','room'].includes(key))throw Error('Unknown adaptation field');out.push(x);}
 return out;
}
export async function prepare(root=ROOT,{gameRoot}={}){
 const game=locateGame(root,gameRoot),{worlds}=plan(root);
 const base=path.dirname(safe(root,'.local/.probe'));fs.mkdirSync(base,{recursive:true});safe(root,'.local/.probe');
 const staging=fs.mkdtempSync(path.join(base,'world-preview-'));
 try{
  for(const[p,b]of sourceFiles(game))writeAtomic(staging,p,p==='src/ui/stage-view.mjs'||p==='src/bridges/stages.bridge.js'?Buffer.from(labelPreview(p,b.toString('utf8'))):b);
  for(const w of worlds)for(const[p,x]of extensionFiles(w)){if(readOptional(staging,p))throw Error('Template ID conflicts with game content: '+p);writeAtomic(staging,p,json(x));}
  writeAtomic(staging,'content/extensions/audio/map-kit-silent/audio.json',json(previewAudio()));
  for(const a of adaptations(root)){const w=worlds.find(w=>w.level===a.base);const selected=a.room?w.inspectionStages?.find(s=>s.entryRoom===a.room):w.stage;if(!selected)throw Error('该模板尚无兼容的分区驱动');const s={...selected,id:a.id,title:a.title,status:'draft',characters:a.characters,overlays:a.overlays,note:a.note||'开发适配草稿：使用参考底图与实验角色。'};const p=`content/extensions/stages/${s.id}/stage.json`;if(readOptional(staging,p))throw Error('Duplicate adaptation stage');writeAtomic(staging,p,json(s));}
  const {build}=await import(pathToFileURL(path.join(staging,'scripts/build.mjs')).href),report=build(staging);
  if(!report.referenceMatchesUpload)throw Error('Runtime baseline differs; review the source before enabling templates');
  return{root:staging,gameRoot:game,report};
 }catch(error){fs.rmSync(staging,{recursive:true,force:true});throw error;}
}
export function createAdaptation(root,{base,id,title,room,apply=false}){
 if(!/^[1-8]-[1-4]$/.test(base||'')||! /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id||'')||id.length<2||id.length>48||!title?.trim()||title.length>72)throw Error('需要 --base 1-1至8-4、英文小写--id、--title');
 const ref=plan(root).worlds.find(w=>w.level===base);if(!ref?.stage)throw Error('Template unavailable');if(room&&!ref.inspectionStages?.some(s=>s.entryRoom===room))throw Error('该分区不支持平台驱动：水下区域需独立驱动；第一世界沿用完整关卡方案');
 const file=`content/adaptations/${id}.json`;if(readOptional(root,file))throw Error('该适配方案已存在，不覆盖');
 const value={id,base,title,...(room?{room}:{}),characters:['lab-runner','lab-scout'],overlays:{},note:'参考底图上的角色适配草稿。正式角色、机关和自然通关需单独实现与验收。'};
 if(apply)writeAtomic(root,file,json(value));return{mode:apply?'created':'check-only',file,value,next:'编辑这份适配 JSON，然后重新运行 npm run dev。底图保留，额外路线写入 overlays。'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2),value=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:undefined;};
  if(args.includes('--new'))console.log(createAdaptation(ROOT,{base:value('--base'),id:value('--id'),title:value('--title'),room:value('--room'),apply:args.includes('--apply')}));
  else{const made=await prepare(ROOT,{gameRoot:value('--game')});console.log(JSON.stringify({...made,report:made.report},null,2));
   if(args.includes('--serve')){const {createServer}=await import(pathToFileURL(path.join(made.root,'scripts/serve.mjs')).href);const port=value('--port')?Number(value('--port')):4195;if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid port');const server=createServer(made.root);server.on('error',e=>{console.error(e.message);process.exitCode=1;});server.listen(port,'127.0.0.1',()=>console.log(`地图试验场：http://127.0.0.1:${port}/play.html?dev=1\n打开“开发工具 · 关卡试验场”，勾选“显示开发草稿”。Ctrl+C 停止。`));}
  }
 }catch(e){console.error(e.message);process.exitCode=1;}
}
