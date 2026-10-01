import {enemySprite} from './map-appearance.mjs';
import {spritePixels} from './classic-art.mjs';
import {uid,intersects} from './editor-model.mjs';
export function cleanupStarts(doc){
 let removed=0;
 for(const r of doc.rooms){
  const first=r.map.objects.find(o=>o.kind==='spawn')?.id;
  const referenced=new Set(doc.rooms.flatMap(room=>room.map.objects.filter(o=>o.kind==='portal'&&o.targetRoom===r.roomId).map(o=>o.targetSpawn)));
  for(const o of r.map.objects)if(o.kind==='checkpoint')referenced.add(o.targetSpawn);
  r.map.objects=r.map.objects.filter(o=>{const keep=o.kind!=='spawn'||o.id===first||referenced.has(o.id)||o.id.startsWith('arrival-');if(!keep)removed++;return keep;});
 }
 return removed;
}
export function placeObject(room,kind,x,y){
 const objects=room.map.objects, arrival=kind==='arrival',skin=kind.startsWith('enemy-')?kind:null;if(skin)kind='walker';
 const q={id:uid(),kind:arrival?'spawn':kind,x,y,w:kind==='spawn'||arrival?12:16,h:kind==='spawn'||arrival?24:16};
 if(skin){const d=spritePixels(enemySprite(skin,room.setting));q.w=d.w;q.h=d.h;q.y+=16-d.h;}
 if(arrival)q.id='arrival-'+q.id;
 if(q.x<0||q.y<0||q.x+q.w>room.map.width||q.y+q.h>room.map.height)return;
 if(kind==='spawn'||kind==='exit'){
  const old=objects.find(o=>o.kind===kind&&(kind!=='spawn'||!o.id.startsWith('arrival-')));
  if(old){old.x=x;old.y=y;return old;}
 }
 if(objects.some(o=>o.kind===q.kind&&o.x===x&&o.y===y))return;
 if(objects.length>=20000)throw Error('对象数量已达上限');
 objects.push(q);if(skin){room.enemySkins??={};room.enemySkins[q.id]=skin;}return q;
}
export function batchObjects(room,kind,rect,spacing=2){
 if(!['coin','walker'].includes(kind)&&!kind.startsWith('enemy-'))throw Error('批量放置仅用于金币和敌人');
 if(!Number.isInteger(spacing)||spacing<1||spacing>32)throw Error('间距应为 1–32 格');
 const count=Math.ceil(rect.w/(spacing*16))*Math.ceil(rect.h/(spacing*16));
 if(count>2000)throw Error('单次最多放置 2000 个，请缩小范围或增加间距');
 for(let y=rect.y;y<rect.y+rect.h;y+=spacing*16)for(let x=rect.x;x<rect.x+rect.w;x+=spacing*16)placeObject(room,kind,x,y);
}
export function connectPortal(doc,roomId,portalId,targetRoom,targetSpawn){
 const source=doc.rooms.find(r=>r.roomId===roomId)?.map.objects.find(o=>o.id===portalId&&o.kind==='portal');
 const target=doc.rooms.find(r=>r.roomId===targetRoom)?.map.objects.find(o=>o.id===targetSpawn&&o.kind==='spawn');
 if(!source||!target)throw Error('请选择一个管道和有效的落地点');
 Object.assign(source,{targetRoom,targetSpawn});
}
export function connectionProblems(doc){
 const errors=[];
 for(const r of doc.rooms)for(const p of r.map.objects.filter(o=>o.kind==='portal')){
  const target=doc.rooms.find(q=>q.roomId===p.targetRoom),spawn=target?.map.objects.find(o=>o.id===p.targetSpawn&&o.kind==='spawn');
  if(!spawn)errors.push(r.roomId+' 的管道 '+p.id+' 尚未连接有效落地点');
  else if(target.map.geometry.some(g=>g.collision==='solid'&&intersects(g,spawn)))errors.push('管道落地点 '+spawn.id+' 被地形挡住');
 }
 return errors;
}
