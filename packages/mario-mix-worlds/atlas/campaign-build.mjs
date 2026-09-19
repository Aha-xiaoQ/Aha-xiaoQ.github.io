import {fromTemplate} from './editor-model.mjs';
import {projectPack} from './editor-runtime.mjs';
import {displayRoom} from './room-selection.mjs';
export async function buildCampaign(read=async path=>{const response=await fetch(new URL(path,import.meta.url));if(!response.ok)throw Error('无法读取 '+path);return response.json();},progress=()=>{}){
 const character=await read('./runtime/character.json'),levels=[];
 for(let world=1;world<=8;world++)for(let number=1;number<=4;number++){
  const id=world+'-'+number,template=await read(id==='1-1'?'./classic-1-1.json':'../generated/levels/'+id+'/template.json'),doc=fromTemplate(template);
  // 7-2 source omits the final horizontal pipe transport; campaign explicitly
  // connects that recorded mouth to the existing surface exit, leaving source intact.
  if(id==='7-2'){const water=doc.rooms.find(r=>r.roomId==='area-1'),surface=doc.rooms.find(r=>r.roomId==='area-2'),semantic=water.semantics.find(s=>s.kind==='PipeHorizontal'&&s.source.transport==null),mouth=water.map.geometry.find(g=>g.id===semantic?.id),spawn=surface.map.objects.find(o=>o.id==='arrival-location-2')||surface.map.objects.find(o=>o.kind==='spawn');if(mouth&&spawn)water.map.objects.push({id:'campaign-water-exit',kind:'portal',x:Math.max(0,mouth.x-12),y:mouth.y,w:16,h:mouth.h,targetRoom:surface.roomId,targetSpawn:spawn.id});}
  for(const room of doc.rooms){if(room.map.objects.some(o=>o.kind==='exit'))continue;for(const marker of room.markers||[]){if(marker.kind==='flagpole-finish')room.map.objects.push({id:marker.id+'-campaign-exit',kind:'exit',x:marker.x,y:Math.max(0,marker.y-160),w:16,h:160});else if(marker.kind==='castle-finish')room.map.objects.push({id:marker.id+'-campaign-exit',kind:'exit',x:Math.min(room.map.width-16,marker.x+400),y:marker.y-32,w:16,h:32});}}
  doc.title=id;const pack=projectPack(doc,displayRoom(id,doc.rooms),character,'campaign-'+id);if(!pack.maps.some(m=>m.objects.some(o=>o.kind==='exit')))throw Error(id+' 缺少可达终点');levels.push({id,pack,rooms:doc.rooms});progress(levels.length,32);
 }
 return levels;
}
