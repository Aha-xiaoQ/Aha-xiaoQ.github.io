/** Versioned editor documents. Reference records remain intact; no executable imports. */
export const TILE=16, MAX_CELLS=262144;
export const materials={ground:'地面',brick:'砖纹块',block:'金色块',platform:'单向平台',stone:'石块',decoration:'装饰'};
export const clone=x=>JSON.parse(JSON.stringify(x));
export const uid=()=> 'e-'+globalThis.crypto.randomUUID();
export function blank(title='我的关卡',width=1280,height=480){
 return {format:'xiaoq-map-project',version:1,id:uid(),title,rooms:[{roomId:'main',setting:'Overworld',map:{id:'custom-main',title,width,height,tileSize:16,geometry:[],objects:[{id:'start',kind:'spawn',x:32,y:32,w:12,h:24}],provenance:{kind:'original',source:'Map workshop',review:'pending',note:'用户编辑的地图草稿。'}},markers:[],decorations:[]}],reference:null};
}
export function fromTemplate(t){
 if(!Array.isArray(t.rooms)||!t.rooms.length)throw Error('没有可编辑区域');
 const d={format:'xiaoq-map-project',version:1,id:uid(),title:t.level+' · 我的地图',rooms:clone(t.rooms),reference:clone(t)};
 for(const r of d.rooms)r.decorations??=[];
 return validate(d);
}
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
export function validate(d){
 if(!d||d.format!=='xiaoq-map-project'||d.version!==1)throw Error('请选择地图工坊导出的工程文件（版本 1）');
 if(typeof d.id!=='string'||d.id.length>100||typeof d.title!=='string'||!d.title.trim()||d.title.length>100)throw Error('工程名称或标识无效');
 if(!Array.isArray(d.rooms)||!d.rooms.length||d.rooms.length>128)throw Error('区域数量无效');
 const roomIds=new Set();
 for(const r of d.rooms){
  if(typeof r.roomId!=='string'||roomIds.has(r.roomId))throw Error('区域标识重复或缺失');roomIds.add(r.roomId);
  const m=r.map;if(!m||!integer(m.width,256,32768)||!integer(m.height,120,4096)||Math.ceil(m.width/16)*Math.ceil(m.height/16)>MAX_CELLS)throw Error('地图尺寸超出范围');
  if(m.tileSize!==16)throw Error('目前仅支持 16 像素地块');
  const ids=new Set();
  for(const key of ['geometry','objects']){
   if(!Array.isArray(m[key])||m[key].length>20000)throw Error('地图元素过多或无效');
   for(const q of m[key]){
    if(typeof q.id!=='string'||ids.has(q.id))throw Error('元素标识重复');ids.add(q.id);
    if(!['x','y','w','h'].every(k=>Number.isFinite(q[k]))||q.w<=0||q.h<=0||Math.abs(q.x)>100000||Math.abs(q.y)>100000||q.w>100000||q.h>100000)throw Error('元素坐标无效');
    if(q.motion&&(!['x','y'].includes(q.motion.axis)||!['min','max','speed'].every(k=>Number.isFinite(q.motion[k]))||q.motion.max<=q.motion.min||q.motion.speed<=0))throw Error('运动平台参数无效');
   }
  }
  for(const key of ['markers','decorations']){if(!Array.isArray(r[key])||r[key].length>20000)throw Error('参考标记或装饰无效');for(const q of r[key]){if(!Number.isFinite(q.x)||!Number.isFinite(q.y))throw Error('标记坐标无效');if(key==='decorations'&&(!Number.isFinite(q.w)||!Number.isFinite(q.h)||q.w<=0||q.h<=0))throw Error('装饰尺寸无效');}}
 }
 return d;
}
export function parseProject(text){if(text.length>12*1024*1024)throw Error('工程文件超过 12 MB');const d=JSON.parse(text,(k,v)=>{if(['__proto__','prototype','constructor'].includes(k))throw Error('不安全的字段');return v;});return validate(d);}
export const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
// Subtract paint area from old rectangles, preserving fine coordinates and metadata.
export function subtract(q,b){
 if(!intersects(q,b))return [q];
 const x=Math.max(q.x,b.x),y=Math.max(q.y,b.y),r=Math.min(q.x+q.w,b.x+b.w),bottom=Math.min(q.y+q.h,b.y+b.h);
 return [{x:q.x,y:q.y,w:q.w,h:y-q.y},{x:q.x,y:bottom,w:q.w,h:q.y+q.h-bottom},{x:q.x,y,w:x-q.x,h:bottom-y},{x:r,y,w:q.x+q.w-r,h:bottom-y}].filter(v=>v.w>0&&v.h>0).map(v=>({...q,...v,id:uid()}));
}
export function paint(room,rect,material,{erase=false,layer='geometry'}={}){
 const m=room.map,b={x:Math.max(0,rect.x),y:Math.max(0,rect.y),w:Math.min(rect.x+rect.w,m.width)-Math.max(0,rect.x),h:Math.min(rect.y+rect.h,m.height)-Math.max(0,rect.y)};
 if(b.w<=0||b.h<=0)return;
 if(!Object.hasOwn(materials,material))throw Error('未知地块');
 const a=layer==='decoration'?room.decorations:m.geometry;
 if(a.some(q=>q.motion&&intersects(q,b)))throw Error('这里有运动平台，请使用对象选择工具调整，避免破坏运动范围');
 if(layer==='geometry'&&a.some(q=>intersects(q,b)&&room.markers.some(m=>linked(m,q.id))))throw Error('这里有参考奖励或机关，请在选中元素中移动或删除整块，保留关联');
 const next=a.flatMap(q=>subtract(q,b));
 if(!erase)next.push({...b,id:uid(),material,...(layer==='geometry'?{collision:material==='platform'?'oneway':'solid'}:{})});
 if(next.length>20000)throw Error('元素过多，请缩小编辑范围');
 if(layer==='decoration')room.decorations=next;else m.geometry=next;
}
export function lineCells(a,b){const out=[],dx=Math.abs(b.x-a.x),dy=Math.abs(b.y-a.y),sx=a.x<b.x?1:-1,sy=a.y<b.y?1:-1;let x=a.x,y=a.y,e=dx-dy;for(let n=0;n<8192;n++){out.push({x,y});if(x===b.x&&y===b.y)break;const e2=2*e;if(e2>-dy){e-=dy;x+=sx;}if(e2<dx){e+=dx;y+=sy;}}return out;}
export function bucket(room,cx,cy,material,options={}){
 const m=room.map,w=Math.ceil(m.width/16),h=Math.ceil(m.height/16);if(cx<0||cy<0||cx>=w||cy>=h)return;
 const a=options.layer==='decoration'?room.decorations:m.geometry,grid=new Array(w*h).fill('');
 for(const q of a){const token=q.motion?'@motion':q.material||(q.collision==='oneway'?'platform':'ground');for(let y=Math.max(0,Math.floor(q.y/16));y<Math.min(h,Math.ceil((q.y+q.h)/16));y++)for(let x=Math.max(0,Math.floor(q.x/16));x<Math.min(w,Math.ceil((q.x+q.w)/16));x++)grid[y*w+x]=token;}
 const target=grid[cy*w+cx];if(target==='@motion')throw Error('运动平台不可用填充修改');if(target===material)return;
 const seen=new Uint8Array(w*h),queue=[cy*w+cx];seen[queue[0]]=1;
 for(let i=0;i<queue.length;i++){const p=queue[i],x=p%w,y=Math.floor(p/w);for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1])if(n>=0&&!seen[n]&&grid[n]===target){seen[n]=1;queue.push(n);}}
 // Merge contiguous runs, avoiding one object per filled tile.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(seen[y*w+x]){const start=x;while(x+1<w&&seen[y*w+x+1])x++;paint(room,{x:start*16,y:y*16,w:(x-start+1)*16,h:16},material,options);}
}
export class History{
 constructor(doc){this.doc=validate(clone(doc));this.undoStack=[];this.redoStack=[];}
 commit(before){validate(this.doc);if(JSON.stringify(before)===JSON.stringify(this.doc))return false;this.undoStack.push(before);if(this.undoStack.length>60)this.undoStack.shift();this.redoStack=[];return true;}
 change(fn){const before=clone(this.doc);try{fn(this.doc);return this.commit(before);}catch(e){this.doc=before;throw e;}}
 undo(){if(!this.undoStack.length)return false;this.redoStack.push(this.doc);this.doc=this.undoStack.pop();return true;}
 redo(){if(!this.redoStack.length)return false;this.undoStack.push(this.doc);this.doc=this.redoStack.pop();return true;}
}
export function resize(room,width,height){
 if(!integer(width,256,32768)||!integer(height,128,4096)||width%16||height%16||width/16*height/16>MAX_CELLS)throw Error('尺寸须为 16 的倍数，宽 256–32768、高 128–4096，最多 262144 格');
 const outside=[...room.map.geometry,...room.map.objects,...room.decorations].filter(q=>q.x<0||q.y<0||q.x+q.w>width||q.y+q.h>height);
 if(outside.length)throw Error('有 '+outside.length+' 个元素超出新范围，请先移动或删除；没有裁剪任何内容');
 room.map.width=width;room.map.height=height;
}
export function runtimeMap(room){
 const m=clone(room.map);m.provenance={kind:'original',source:'Map workshop; reference information is retained in the editor project',review:'pending',note:'用户地图草稿，需在实验运行时验收；不能替代原版核验。'};
 m.geometry=m.geometry.map(({material,...q})=>q);
 return m;
}
export function problems(room){
 const m=room.map,out=[];if(!m.objects.some(o=>o.kind==='spawn'))out.push('缺少出生点');
 for(const q of [...m.geometry,...m.objects])if(q.x<0||q.y<0||q.x+q.w>m.width||q.y+q.h>m.height)out.push(q.id+' 超出地图');
 for(const o of m.objects.filter(q=>q.kind==='spawn'))if(m.geometry.some(g=>g.collision==='solid'&&intersects(o,g)))out.push('出生点 '+o.id+' 与实心地形重叠');
 if(room.underwater)out.push('此区域需要游泳驱动');
 return out;
}
export function moveSelection(room,layer,ids,dx,dy){
 if(!Number.isFinite(dx)||!Number.isFinite(dy))throw Error('位置必须为数字');
 const a=layer==='decoration'?room.decorations:layer==='objects'?room.map.objects:room.map.geometry;
 for(const q of a.filter(q=>ids.has(q.id))){
  if(q.x+dx<0||q.y+dy<0||q.x+dx+q.w>room.map.width||q.y+dy+q.h>room.map.height)throw Error('移动超出地图范围');
  if(q.motion){const shift=q.motion.axis==='x'?dx:dy,limit=q.motion.axis==='x'?room.map.width:room.map.height;if(q.motion.min+shift<0||q.motion.max+shift+(q.motion.axis==='x'?q.w:q.h)>limit)throw Error('运动范围超出地图');q.motion.min+=shift;q.motion.max+=shift;}
  q.x+=dx;q.y+=dy;
  if(layer==='geometry')for(const marker of room.markers.filter(m=>linked(m,q.id))){marker.x+=dx;marker.y+=dy;}
 }
}
export function deleteSelection(room,layer,ids){
 if(layer==='decoration')room.decorations=room.decorations.filter(q=>!ids.has(q.id));
 else if(layer==='objects')room.map.objects=room.map.objects.filter(q=>!ids.has(q.id));
 else {room.map.geometry=room.map.geometry.filter(q=>!ids.has(q.id));room.markers=room.markers.filter(q=>![...ids].some(id=>linked(q,id)));}
}
export const linked=(marker,id)=>typeof marker.id==='string'&&(marker.id===id||marker.id.startsWith(id+'-'))&&!marker.kind?.startsWith('decorative');
