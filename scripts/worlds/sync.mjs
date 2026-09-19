/** Chapter status has one source: packages/mario-mix-worlds/content/catalog.json. */
import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import{readOptional,writeAtomic}from'../lib/safe-path.mjs';
import{plan as kitPlan}from'../../packages/mario-mix-worlds/scripts/build.mjs';
export const ROOT=path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url)))),RECORD='docs/chapters-r20/generated-files.json';
export const hash=b=>createHash('sha256').update(b).digest('hex');const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
export function projectSnapshot(catalog,worlds){
 return {schemaVersion:1,revision:catalog.revision,updatedAt:catalog.updatedAt,guideHref:'/notes/mario-mix/docs/terra-stages/',starterHref:'/downloads/source/MarioMix_Worlds_W02_Starter.zip',instructionsHref:'/packages/mario-mix-worlds/START_HERE.md',source:'packages/mario-mix-worlds/content/catalog.json',levels:catalog.levels.map(l=>{const w=worlds.find(w=>w.level===l.id);return {id:l.id,title:l.title,characters:l.characters,status:l.status,summary:l.summary,playHref:l.playHref,introHref:l.introHref,templateStatus:l.template.status,templateHref:w?`/downloads/maps/MarioMix_Map_${l.id}_W02.zip`:null,missing:l.missing,owner:l.owner,issueUrl:l.issueUrl,areaCount:w?.coverage.areas??0,sectionViews:w?.coverage.sectionViews??0,previews:w?w.rooms.map(r=>({title:`${l.id} / ${r.roomId} · ${r.setting}`,src:`/assets/chapters/maps/${l.id}-${r.roomId}.svg`,width:r.map.width})):[]};})};
}
export function initializeProject(input){
 const p=JSON.parse(JSON.stringify(input));
 p.summary='不同作品的角色接力闯过经典关卡。查看每关有哪些角色、哪些可以试玩，以及下一步的开发计划。';
 p.intro='前三期已开放试玩：从魂斗罗与洛克人，到忍者、坦克，再到泰拉瑞亚。奥日城堡关正在开发。关卡进度与基础地图模板在下方分别列出。';
 p.highlights=['1-1 至 1-3 可试玩，1-4 奥日开发中。','八世界 32 关均有参考底图，按世界下载并独立管理。','水下、条件循环和正式角色仍需机制开发与原版核验。'];
 const d=p.docs.find(d=>d.id==='terra-stages');if(!d)throw Error('缺少关卡接口资料页');
 d.kind='level-atlas';d.title='关卡与地图模板（实验）';d.summary='按世界查看 32 关底图，下载模板，选择角色与机制开发任务。';
 d.sections=[{title:'选择地图与运行',paragraphs:['完整 W02 开发包包含参考数据、逐关 ZIP、地图册及配套 M06 运行时。先用地图册选择区域，缩放查看地形与机制缺口。'],code:'npm run check\nnpm test\nnpm run atlas'},{title:'创建独立方案',paragraphs:['地图册地址为 http://127.0.0.1:4196/atlas/index.html。运行 npm run dev 可打开 http://127.0.0.1:4195/play.html?dev=1，在试验场显示开发草稿。','世界 2–8 使用分区地形检查，不自动串成整关。--room 可选择具体分段；水下区域等待游泳驱动，不套用平台物理。'],code:'npm run new -- --base 8-4 --room area-1-section-0-before --id my-stage --title "我的关卡" --apply\nnpm run dev'},{title:'本版范围',paragraphs:['32 关共 63 个参考区域；4-4、7-4、8-4 另保留 33 份 before / stretch / after 路线片段及条件记录。地形转录与原版保真核验是不同状态。','敌人、顶砖奖励、弹簧、平衡台、循环升降台、游泳、城堡机关与跨区流程仍有待实现部分，详见各模板 coverage.json。','原三期试玩与 M06 源码未改，真实泰拉角色的完整跨地图迁移仍待完成；1-4 奥日仍开发中。没有新增原版人物、BGM、音效或字体。']}];
 d.sources=[{label:'完整开发与贡献说明',href:'/packages/mario-mix-worlds/START_HERE.md'},{label:'地图坐标与来源核验',href:'/packages/mario-mix-worlds/docs/MAP_CONTRACT.md'},{label:'后续工作清单',href:'/packages/mario-mix-worlds/docs/ROADMAP.md'},{label:'第三期当前源码',href:'/notes/mario-mix/docs/terra-source/'}];
 if(!p.links.some(l=>l.href==='/notes/mario-mix/docs/terra-stages/'))p.links.push({label:'关卡与地图模板',href:'/notes/mario-mix/docs/terra-stages/'});
 if(!p.updates.some(u=>u.id==='all-worlds-r21'))p.updates.push({id:'all-worlds-r21',kind:'content',date:'2026-09-19',revision:21,title:'补齐世界 2–8 的参考地图模板',summary:'新增 28 关参考底图，地图册覆盖 32 关、63 个区域及 33 个循环分段；水下与循环流程仍待驱动接入。',status:'local-review'});
 p.updatedAt=p.updatedAt<'2026-09-19'?'2026-09-19':p.updatedAt;return p;
}
export async function planWorldSite(root,{reader=p=>readOptional(root,p),kitRoot=path.join(root,'packages/mario-mix-worlds'),initialize=false}={}){
 const{out,worlds,catalog}=kitPlan(kitRoot),files=new Map();
 const b=await reader('content/development/projects/mario-mix.json');if(!b)throw Error('缺少混合马里奥项目配置');let p=JSON.parse(b);if(initialize)p=initializeProject(p);p.chapterPlan=projectSnapshot(catalog,worlds);
 files.set('content/development/projects/mario-mix.json',json(p));
 for(const w of worlds){files.set(`downloads/maps/MarioMix_Map_${w.level}_W02.zip`,out.get(`generated/downloads/MarioMix_Map_${w.level}_W02.zip`));for(const r of w.rooms)files.set(`assets/chapters/maps/${w.level}-${r.roomId}.svg`,out.get(`generated/levels/${w.level}/${r.roomId}.svg`));}
 for(let i=1;i<=8;i++)files.set(`downloads/maps/MarioMix_World_${i}_W02.zip`,out.get(`generated/downloads/MarioMix_World_${i}_W02.zip`));
 return{files,catalog,worlds};
}
export async function sync(root=ROOT,{check=false}={}){
 const {files}=await planWorldSite(root),previous=JSON.parse(readOptional(root,RECORD)||'{"files":{}}'),changes=[];
 for(const[p,b]of files){const old=readOptional(root,p);if(old?.equals(b))continue;if(p!=='content/development/projects/mario-mix.json'&&old&&hash(old)!==previous.files[p])throw Error('地图生成文件有编辑，先合并：'+p);changes.push([p,b,old]);}
 const record=json({schemaVersion:1,files:{...previous.files,...Object.fromEntries([...files].filter(([p])=>!p.startsWith('content/development/')).map(([p,b])=>[p,hash(b)]))}});if(!readOptional(root,RECORD)?.equals(record))changes.push([RECORD,record,readOptional(root,RECORD)]);
 if(check&&changes.length)throw Error('关卡状态或模板未同步，请运行 npm run worlds:sync');
 if(!check){for(const[p,,old]of changes){const now=readOptional(root,p);if((now===null)!==(old===null)||(now&&!now.equals(old)))throw Error('检查后文件改变');}for(const[p,b]of changes)writeAtomic(root,p,b);}
 return{changed:changes.length,levels:32,templates:32};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(await sync(ROOT,{check:process.argv.includes('--check')}));}catch(e){console.error(e.message);process.exitCode=1;}
