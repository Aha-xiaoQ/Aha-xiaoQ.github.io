/** Display defaults only. Never change stage entryRoom or reference topology. */
const mainRooms={'1-2':'area-1','2-2':'area-1','4-2':'area-1','7-2':'area-1'};
const id=r=>r.roomId??r.id;
export function displayRoom(level,rooms,requested){
 if(rooms.some(r=>id(r)===requested))return requested;
 const main=mainRooms[level];
 return rooms.some(r=>id(r)===main)?main:id(rooms[0]);
}
export function roomLabel(level,room){
 const key=id(room),label=room.title??room.map?.title??key;
 if(!mainRooms[level])return label;
 return label+(key===mainRooms[level]?' · 主地图':key==='area-0'?' · 入口转场':'');
}
