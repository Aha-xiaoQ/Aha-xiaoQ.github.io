/** Testing a room is an explicit temporary session, not a change to the base map.
 * Keep its reachable graph; the production entrance is not a return room.
 */
export function roomTestPack(pack,stageId,roomId){
 const next=structuredClone(pack),stage=next.stages.find(s=>s.id===stageId);
 if(!stage||!Object.hasOwn(stage.rooms,roomId))throw Error('Unknown room');
 const visited=new Set(),queue=[roomId];
 while(queue.length){const id=queue.shift();if(visited.has(id))continue;visited.add(id);const map=next.maps.find(m=>m.id===stage.rooms[id]);if(!map)throw Error('Missing map');for(const o of map.objects)if(o.kind==='portal')queue.push(o.targetRoom);}
 stage.entryRoom=roomId;stage.entrySpawn='start';stage.rooms=Object.fromEntries(Object.entries(stage.rooms).filter(([id])=>visited.has(id)));
 stage.note='单房间开发会话；不改变原始底图和正式入口。';return next;
}
