/** Tiled object-layer export. Not an import/roundtrip editor. */
export function toTiled(room){let next=1;
 const prop=(name,value)=>({name,type:typeof value==='boolean'?'bool':typeof value==='number'?'float':'string',value});
 const layer=(id,name,items)=>({id,name,type:'objectgroup',visible:true,opacity:1,x:0,y:0,draworder:'index',objects:items.map(q=>({id:next++,name:q.id,type:q.kind||q.collision||'marker',x:q.x,y:q.y,width:q.w||0,height:q.h||0,rotation:0,visible:true,...(!q.w?{point:true}:{}),properties:[prop('sourceJson',JSON.stringify(q))]}))});
 const layers=[layer(1,'collision',room.map.geometry),layer(2,'objects',room.map.objects),layer(3,'pending-mechanics',room.markers)];
 return{type:'map',version:'1.10',orientation:'orthogonal',renderorder:'right-down',width:Math.ceil(room.map.width/16),height:Math.ceil(room.map.height/16),tilewidth:16,tileheight:16,infinite:false,nextlayerid:4,nextobjectid:next,tilesets:[],layers,properties:[prop('room',room.roomId),prop('underwater',!!room.underwater),prop('inspectionOnly',true),prop('referenceReview','pending')]};
}
