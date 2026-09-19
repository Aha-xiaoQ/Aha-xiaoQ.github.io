/** Read-only index with bounded cache and race protection. No backend or analytics. */
import {displayRoom,roomLabel} from './room-selection.mjs';
const $=id=>document.getElementById(id),form=$('filters');
let index=null,epoch=0,current=null,cache=new Map();
const validId=x=>/^[1-8]-[1-4]$/.test(x),safeFile=x=>typeof x==='string'&&/^generated\/[a-zA-Z0-9_./-]+$/.test(x)&&!x.split('/').includes('..');
const source=p=>new URL('../'+p,import.meta.url).href;
const names={'Overworld':'地表','Underworld':'地下','Underwater':'水下','Castle':'城堡','Sky':'天空'};
const labels={'underwater-physics':'游泳与水流','conditional-section-runtime':'条件路线与循环','coupled-scale':'联动平衡台','falling-platform':'下落平台','springboard':'弹簧','platform-generator':'循环升降台','platform-timing':'运动平台时序','rotating-firebar':'旋转火焰棒','bridge-axe-finish':'断桥与斧头','castle-finish':'城堡结算','flagpole-finish':'旗杆结算','block-contents':'顶砖与奖励','hidden-block':'隐藏砖块','source-transport-not-simulated':'房间连接','vine-transition':'藤蔓转场','cannon-fire':'炮台射击','water-volume':'水域','lava-volume':'熔岩','source-attribute-review':'源数据字段核验','missing-source-transport':'出口目标核验','source-ceiling-width-review':'天花板宽度核验','ride-platform':'搭乘平台'};
function opts(node,rows,value){node.replaceChildren(...rows.map(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;return o;}));if(rows.some(([v])=>v===value))node.value=value;}
function remember(){try{const u=new URL(location.href);u.searchParams.set('level',$('level').value);u.searchParams.set('room',$('room').value);history.replaceState(null,'',u);}catch{}}
function worlds(value){opts($('world'),Array.from({length:8},(_,i)=>[String(i+1),'世界 '+(i+1)]),value);levels();}
function levels(value){const a=index.levels.filter(l=>l.id.startsWith($('world').value+'-'));opts($('level'),a.map(l=>[l.id,l.id]),value);rooms();}
function rooms(value){const l=index.levels.find(l=>l.id===$('level').value);opts($('room'),l.rooms.map(r=>[r.id,roomLabel(l.id,r)]),displayRoom(l.id,l.rooms,value));show();}
async function loadTemplate(l){if(cache.has(l.id))return cache.get(l.id);if(!safeFile(l.source))throw Error('目录路径无效');const res=await fetch(source(l.source));if(!res.ok)throw Error('地图数据读取失败');const data=await res.json();if(data.level!==l.id||!Array.isArray(data.rooms))throw Error('地图格式无效');cache.set(l.id,data);if(cache.size>5)cache.delete(cache.keys().next().value);return data;}
async function show(){
 const n=++epoch,l=index.levels.find(l=>l.id===$('level').value),r=l.rooms.find(r=>r.id===$('room').value);
 if(!r||![r.svg,r.tiled,l.download].every(safeFile)){error('地图路径无效');return;}
 current={l,r};$('status').textContent='正在读取 '+l.id+'…';$('retry').hidden=true;
 $('map-title').textContent=r.title;$('setting').textContent=(names[r.setting.split(' ')[0]]||r.setting)+' / '+r.setting;
 $('scope').textContent=r.underwater?'水下参考区域：地形和对象已整理，游泳与水流驱动尚未接入。此区域只作地图检查。':r.origin.part!=='base'?'循环城堡分段：坐标相对于本段起点。伸展段为一份基准片段，不代表原版路线长度或条件循环已实现。':l.id.startsWith('1-')?'第一世界沿用既有实验接入。地形、机关与完整角色分别验收。':'独立分区地形检查；房间连接、角色与机关仍需接入，不是整关通关版本。';
 $('download').href=source(l.download);$('tiled').href=source(r.tiled);$('map').hidden=false;$('map').src=source(r.svg);$('map').alt=r.title+' · '+r.setting+' 参考地图';zoom();$('map-scroll').scrollLeft=0;
 const roomArg=l.id.startsWith('1-')?'':` --room ${r.id}`;
 $('command').textContent=r.underwater?'此区域尚未接入游泳驱动。请先下载地图 JSON 或 Tiled 对象层，完成环境能力后再注册运行场景。':`npm run new -- --base ${l.id}${roomArg} --id my-stage --title "我的关卡" --apply`;
 try{const d=await loadTemplate(l);if(n!==epoch)return;const kinds=[...new Set(d.coverage.details.filter(x=>x.roomId===r.id).map(x=>x.kind))].filter(x=>!x.startsWith('decorative'));
  $('pending').replaceChildren(...kinds.map(k=>{const li=document.createElement('li');li.textContent=labels[k]||(k.startsWith('enemy-')?'敌人行为 · '+k.slice(6):k);return li;}));
  $('status').textContent=`${l.id} · ${l.areas} 个参考区域${l.sectionViews?' · '+l.sectionViews+' 个循环分段':''} · 原版核验待完成`;remember();
 }catch(e){if(n===epoch)error(e.message);}
}
function zoom(){if(!current)return;const z=Number($('zoom').value);$('map').width=Math.round(current.r.width*z);$('map').height=Math.round(current.r.height*z);}
function error(message){$('status').textContent=message+'。可以重试，或查看下载包中的说明。';$('retry').hidden=false;}
async function start(){try{const res=await fetch(source('generated/atlas-index.json'));if(!res.ok)throw Error('目录读取失败');index=await res.json();if(!Array.isArray(index.levels)||index.levels.length!==32||index.levels.some(l=>!validId(l.id)))throw Error('目录格式不匹配');const q=new URL(location.href).searchParams,l=validId(q.get('level'))?q.get('level'):'1-1';worlds(l[0]);levels(l);rooms(q.get('room'));}catch(e){error(e.message);}}
form.addEventListener('submit',e=>e.preventDefault());$('world').addEventListener('change',()=>levels());$('level').addEventListener('change',()=>rooms());$('room').addEventListener('change',show);$('zoom').addEventListener('change',zoom);$('reset').addEventListener('click',()=>{$('zoom').value='1';zoom();$('map-scroll').scrollLeft=0;});$('retry').addEventListener('click',()=>index?show():start());$('map').addEventListener('error',()=>error('地图图像暂时无法显示'));start();
