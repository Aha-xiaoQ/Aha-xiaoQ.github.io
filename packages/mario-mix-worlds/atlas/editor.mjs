import {developerPack,filesForPack} from './editor-runtime.mjs';
import {zipFiles} from './editor-zip.mjs';
import {play} from './editor-play.mjs';
import {displayRoom,roomLabel} from './room-selection.mjs';
import {blank,fromTemplate,parseProject,clone,uid,materials,paint,bucket,lineCells,History,resize,runtimeMap,problems,intersects,moveSelection,deleteSelection,linked} from './editor-model.mjs';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d'),vp=$('viewport');
const KEY='xiaoq-map-workshop-v1',locks=new Set();
let history=new History(blank()),ri=0,tool='brush',material='ground',objectKind='coin',selected=new Set(),clipboard=null,gesture=null,space=false,camera={x:0,y:0},dirty=false,saveTimer,loadEpoch=0;
const room=()=>history.doc.rooms[ri],layer=()=>$('layer').value,items=()=>layer()==='decoration'?room().decorations:layer()==='objects'?room().map.objects:room().map.geometry;
const z=()=>Number($('zoom').value),lockKey=()=>room().roomId+':'+layer(),locked=()=>locks.has(lockKey());
const say=t=>$('message').textContent=t;
const run=fn=>{try{fn();}catch(e){say(e.message);}};
function options(node,list){node.replaceChildren(...list.map(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;return o;}));}
function buttons(id,list,current,action){$(id).replaceChildren(...list.map(([v,t])=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.setAttribute('aria-pressed',String(v===current));b.onclick=()=>{action(v);palette();};return b;}));}
function palette(){
 buttons('tools',[['brush','画笔 B'],['erase','橡皮 E'],['rect','矩形 R'],['fill','填充 F'],['select','框选 V'],['pick','吸管 I'],['pan','平移']],tool,v=>{cancelGesture();tool=v;});
 buttons('materials',layer()==='objects'?[['spawn','出生点'],['coin','金币'],['exit','出口'],['hazard','危险区'],['walker','敌人']]:Object.entries(materials),layer()==='objects'?objectKind:material,v=>{if(layer()==='objects')objectKind=v;else material=v;});
 $('locked').checked=locked();
}
function save(){
 clearTimeout(saveTimer);
 try{localStorage.setItem(KEY,JSON.stringify(gesture?.before||history.doc));dirty=false;$('save-state').textContent='已保存到本机 · '+new Date().toLocaleTimeString();}
 catch{$('save-state').textContent='本机保存失败，请导出工程备份';dirty=true;}
}
function changed(){dirty=true;$('save-state').textContent='正在保存…';clearTimeout(saveTimer);saveTimer=setTimeout(save,450);refresh();}
function transaction(fn){cancelGesture();if(locked())throw Error('当前图层已锁定');if(history.change(fn))changed();}
function refresh(){
 $('title').value=history.doc.title;
 const r=room();options($('room'),history.doc.rooms.map((r,i)=>[String(i),roomLabel(history.doc.reference?.level,r)]));$('room').value=String(ri);
 $('width').value=Math.ceil(r.map.width/16);$('height').value=Math.ceil(r.map.height/16);
 $('undo').disabled=!history.undoStack.length;$('redo').disabled=!history.redoStack.length;
 selected=new Set([...selected].filter(id=>items().some(q=>q.id===id)));
 const chosen=items().filter(q=>selected.has(q.id));
 $('selection-info').textContent=chosen.length?chosen.length+' 个元素 · '+chosen.map(q=>q.kind||q.material||q.collision).join('、'):'尚未选中';
 $('x').value=chosen.length?Math.min(...chosen.map(q=>q.x)):'';$('y').value=chosen.length?Math.min(...chosen.map(q=>q.y)):'';
 $('issues').replaceChildren(...(problems(r).length?problems(r):['基础位置检查通过；不代表游戏已通关']).map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
 $('markers').replaceChildren(...r.markers.filter(q=>!q.kind?.startsWith('decorative')).map(q=>{const p=document.createElement('p');p.textContent=(q.kind||'标记')+' · ('+q.x+', '+q.y+') '+(q.source?.contents?'奖励：'+JSON.stringify(q.source.contents):'')+(q.source?.transport?' 连接：'+JSON.stringify(q.source.transport):'')+'（参考机制，未接入行为）';return p;}));
 palette();render();
}
const colors={ground:'#99704d',brick:'#ba6849',stone:'#8d99ae',block:'#e5ae38',platform:'#cba964',decoration:'#477862'};
function render(){
 const w=vp.clientWidth,h=vp.clientHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const r=room(),m=r.map,scale=z(),effect=$('view').value!=='structure';ctx.save();ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);
 ctx.fillStyle=effect?(r.setting?.includes('Under')?'#132c40':'#7eaabd'):'#16161c';ctx.fillRect(0,0,m.width,m.height);
 const visible=q=>q.x+q.w>=camera.x&&q.x<=camera.x+w/scale&&q.y+q.h>=camera.y&&q.y<=camera.y+h/scale;
 for(const [kind,a] of [['decoration',r.decorations],['geometry',m.geometry],['objects',m.objects]])for(const q of a){
  if(!visible(q))continue;const mat=q.material||(q.collision==='oneway'?'platform':'ground');
  ctx.fillStyle=kind==='objects'?({spawn:'#50d5bd',coin:'#ffdb50',exit:'#7fe580',hazard:'#fa5260',portal:'#ac88ff',walker:'#bf664b'}[q.kind]||'#f7f3e7'):effect?colors[mat]||colors.ground:q.motion?'#dbad55':q.collision==='oneway'?'#77bcae':'#e8e0cb';
  ctx.globalAlpha=kind==='decoration'?.65:1;ctx.fillRect(q.x,q.y,q.w,q.h);ctx.globalAlpha=1;
  if(effect&&kind==='geometry'){
   ctx.fillStyle=mat==='ground'?'#77a65d':'#ffffff40';ctx.fillRect(q.x,q.y,q.w,Math.min(3,q.h));
   ctx.strokeStyle='#0003';ctx.lineWidth=.6;const left=Math.max(q.x,Math.floor(camera.x/16)*16),right=Math.min(q.x+q.w,camera.x+w/scale);
   for(let x=left;x<right;x+=16){ctx.beginPath();ctx.moveTo(x,q.y);ctx.lineTo(x,q.y+q.h);ctx.stroke();}
   for(let y=Math.max(q.y,Math.floor(camera.y/16)*16);y<Math.min(q.y+q.h,camera.y+h/scale);y+=16){ctx.beginPath();ctx.moveTo(q.x,y);ctx.lineTo(q.x+q.w,y);ctx.stroke();}
  }
  if(kind==='objects'){ctx.fillStyle='#10202a';ctx.font='9px sans-serif';ctx.fillText({spawn:'起',coin:'●',exit:'终',hazard:'!',walker:'敌',portal:'门'}[q.kind]||'?',q.x+1,q.y+Math.min(q.h-1,12));}
  if(selected.has(q.id)&&kind===layer()){ctx.strokeStyle='#ffef89';ctx.lineWidth=2/scale;ctx.strokeRect(q.x,q.y,q.w,q.h);}
 }
 if($('reference').checked)for(const q of r.markers){
  const hidden=q.kind==='hidden-block'||q.source?.hidden;if(hidden&&$('view').value!=='secrets')continue;
  if(q.x<camera.x-30||q.x>camera.x+w/scale||q.y<camera.y-30||q.y>camera.y+h/scale||q.kind?.startsWith('decorative'))continue;
  ctx.strokeStyle='#ff7399';ctx.lineWidth=1/scale;ctx.setLineDash(hidden?[3,2]:[]);ctx.strokeRect(q.x,q.y,16,16);ctx.setLineDash([]);
  ctx.fillStyle='#1b1026';ctx.font='9px sans-serif';ctx.fillText(hidden?'隐':q.kind?.startsWith('enemy')?'敌':q.kind==='block-contents'?'?':'◇',q.x+2,q.y+12);
 }
 if($('grid').checked&&scale>=1){ctx.strokeStyle='#0002';ctx.lineWidth=.5/scale;ctx.beginPath();for(let x=Math.max(0,Math.floor(camera.x/16)*16);x<Math.min(m.width,camera.x+w/scale);x+=16){ctx.moveTo(x,Math.max(0,camera.y));ctx.lineTo(x,Math.min(m.height,camera.y+h/scale));}for(let y=Math.max(0,Math.floor(camera.y/16)*16);y<Math.min(m.height,camera.y+h/scale);y+=16){ctx.moveTo(Math.max(0,camera.x),y);ctx.lineTo(Math.min(m.width,camera.x+w/scale),y);}ctx.stroke();}
 if(gesture?.box){ctx.strokeStyle='#fff';ctx.fillStyle='#fff2';const b=gesture.box;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeRect(b.x,b.y,b.w,b.h);}
 ctx.strokeStyle='#f7f3e7';ctx.lineWidth=1/scale;ctx.strokeRect(0,0,m.width,m.height);ctx.restore();
}
function point(e){const b=canvas.getBoundingClientRect();return {x:(e.clientX-b.left)/z()+camera.x,y:(e.clientY-b.top)/z()+camera.y};}
const cell=p=>({x:Math.floor(p.x/16),y:Math.floor(p.y/16)});
const box=(a,b)=>({x:Math.min(a.x,b.x)*16,y:Math.min(a.y,b.y)*16,w:(Math.abs(a.x-b.x)+1)*16,h:(Math.abs(a.y-b.y)+1)*16});
function stroke(c){
 if(layer()==='objects'){
  if(tool==='erase')room().map.objects=items().filter(q=>!intersects(q,{x:c.x*16,y:c.y*16,w:16,h:16}));
  else if(!items().some(q=>q.x===c.x*16&&q.y===c.y*16&&q.kind===objectKind)){const q={id:uid(),kind:objectKind,x:c.x*16,y:c.y*16,w:objectKind==='spawn'?12:16,h:objectKind==='spawn'?24:16};if(q.x>=0&&q.y>=0&&q.x+q.w<=room().map.width&&q.y+q.h<=room().map.height)items().push(q);}
 }else paint(room(),{x:c.x*16,y:c.y*16,w:16,h:16},material,{erase:tool==='erase',layer:layer()});
}
function cancelGesture(){if(!gesture)return;if(gesture.before)history.doc=gesture.before;gesture=null;refresh();}
canvas.onpointerdown=e=>run(()=>{
 if(e.button>1||gesture)return;e.preventDefault();vp.focus();canvas.setPointerCapture(e.pointerId);
 const p=point(e),c=cell(p);if(tool==='pan'||space||e.button===1){gesture={pointerId:e.pointerId,pan:true,start:{x:e.clientX,y:e.clientY},camera:{...camera}};return;}
 if(tool==='pick'){const q=[...items()].reverse().find(q=>intersects(q,{...p,w:1,h:1}));if(q){if(layer()==='objects')objectKind=q.kind;else material=q.material||(q.collision==='oneway'?'platform':'ground');palette();}return;}
 if(locked())throw Error('当前图层已锁定');
 if(tool==='fill'){if(layer()==='objects')throw Error('对象层不支持填充');transaction(()=>bucket(room(),c.x,c.y,material,{layer:layer()}));return;}
 gesture={pointerId:e.pointerId,before:clone(history.doc),start:c,last:c,box:null};
 if(tool==='select'&&items().some(q=>selected.has(q.id)&&intersects(q,{...p,w:1,h:1})))gesture.move=true;
 try{if(['brush','erase'].includes(tool))stroke(c);else gesture.box=box(c,c);}catch(err){cancelGesture();throw err;}render();
});
canvas.onpointermove=e=>run(()=>{
 const p=point(e),c=cell(p);if(!gesture){say('位置：'+c.x+', '+c.y+' 格 · '+Math.round(p.x)+', '+Math.round(p.y)+' 像素');return;}if(e.pointerId!==gesture.pointerId)return;
 if(gesture.pan){camera.x=Math.max(0,Math.min(room().map.width-32,gesture.camera.x-(e.clientX-gesture.start.x)/z()));camera.y=Math.max(0,Math.min(room().map.height-32,gesture.camera.y-(e.clientY-gesture.start.y)/z()));render();return;}
 try{if(gesture.move){gesture.last=c;gesture.box=box(c,c);}else if(['brush','erase'].includes(tool)){for(const t of lineCells(gesture.last,c))stroke(t);gesture.last=c;}else gesture.box=box(gesture.start,c);}catch(err){cancelGesture();throw err;}render();
});
canvas.onpointerup=e=>run(()=>{
 if(!gesture||e.pointerId!==gesture.pointerId)return;if(gesture.pan){gesture=null;return;}
 const g=gesture;gesture=null;
 try{
  if(g.move){moveSelection(room(),layer(),selected,(g.last.x-g.start.x)*16,(g.last.y-g.start.y)*16);if(history.commit(g.before))changed();else refresh();return;}
  if(tool==='select'){selected=new Set(items().filter(q=>intersects(q,g.box)).map(q=>q.id));refresh();return;}
  if(tool==='rect'){if(layer()==='objects')throw Error('对象请用画笔逐个放置');paint(room(),g.box,material,{layer:layer()});}
  if(history.commit(g.before))changed();else refresh();
 }catch(e){history.doc=g.before;refresh();throw e;}
});
canvas.onpointercancel=e=>{if(gesture?.pointerId===e.pointerId)cancelGesture();};canvas.onlostpointercapture=e=>{if(gesture?.pointerId===e.pointerId)cancelGesture();};
canvas.oncontextmenu=e=>e.preventDefault();
vp.onwheel=e=>{e.preventDefault();camera.x=Math.max(0,Math.min(room().map.width-32,camera.x+(e.shiftKey?e.deltaY:e.deltaX)/z()));camera.y=Math.max(0,Math.min(room().map.height-32,camera.y+(e.shiftKey?0:e.deltaY)/z()));render();};
function move(dx,dy){transaction(()=>moveSelection(room(),layer(),selected,dx,dy));}
function download(name,data){const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
function safeSwitch(){cancelGesture();save();return !dirty||confirm('本机保存失败，切换会丢失当前改动。仍要继续吗？建议取消并先导出工程。');}
function selectedRoom(d){return d.rooms.findIndex(r=>r.roomId===displayRoom(d.reference?.level,d.rooms,d.activeRoomId));}
function replace(d){history=new History(d);ri=selectedRoom(d);selected.clear();locks.clear();camera={x:0,y:0};changed();}
$('new').onclick=()=>{if(confirm('新建会替换当前本机草稿。需要保留多个工程时，请先导出。')&&safeSwitch())replace(blank());};
$('open').onclick=()=>$('file').click();
$('file').onchange=async()=>{const f=$('file').files[0];$('file').value='';if(!f)return;try{if(f.size>12*1024*1024)throw Error('文件超过 12 MB');const d=parseProject(await f.text());if(confirm('打开工程会替换当前本机草稿，是否继续？')&&safeSwitch())replace(d);}catch(e){say(e.message);}};
$('export').onclick=()=>{cancelGesture();save();download('my-map.qmap.json',history.doc);say('工程已导出，可在其他电脑打开继续编辑。');};
$('save').onclick=save;
$('undo').onclick=()=>{cancelGesture();if(history.undo())changed();};
$('redo').onclick=()=>{cancelGesture();if(history.redo())changed();};
$('title').onchange=()=>run(()=>{const title=$('title').value.trim();cancelGesture();history.change(d=>{d.title=title;});changed();});
$('layer').onchange=()=>{cancelGesture();selected.clear();refresh();};
$('locked').onchange=()=>{cancelGesture();if($('locked').checked)locks.add(lockKey());else locks.delete(lockKey());};
$('room').onchange=()=>{const next=Number($('room').value);cancelGesture();ri=next;history.doc.activeRoomId=room().roomId;save();camera={x:0,y:0};selected.clear();refresh();};
for(const id of ['zoom','view','grid','reference'])$(id).onchange=render;
$('size').onsubmit=e=>{e.preventDefault();run(()=>{transaction(()=>resize(room(),Number($('width').value)*16,Number($('height').value)*16));});};
$('position').onsubmit=e=>{e.preventDefault();run(()=>{const a=items().filter(q=>selected.has(q.id));if(!a.length)throw Error('请先框选元素');move(Number($('x').value)-Math.min(...a.map(q=>q.x)),Number($('y').value)-Math.min(...a.map(q=>q.y)));});};
$('copy').onclick=()=>{const picked=items().filter(q=>selected.has(q.id));clipboard={layer:layer(),items:clone(picked),markers:layer()==='geometry'?clone(room().markers.filter(m=>picked.some(q=>linked(m,q.id)))):[]};say('已复制 '+clipboard.items.length+' 个元素，粘贴到当前视图左上角。');};
$('paste').onclick=()=>run(()=>{
 if(!clipboard?.items.length)throw Error('请先框选并复制');if(clipboard.layer!==layer())throw Error('请切换到复制时的图层再粘贴');
 const a=clone(clipboard.items),markers=clone(clipboard.markers),dx=Math.ceil(camera.x/16)*16+16-Math.min(...a.map(q=>q.x)),dy=Math.ceil(camera.y/16)*16+16-Math.min(...a.map(q=>q.y));
 transaction(()=>{for(const q of a){const old=q.id;q.id=uid();for(const m of markers){if(linked(m,old))m.id=q.id+m.id.slice(old.length);}}items().push(...a);room().markers.push(...markers);moveSelection(room(),layer(),new Set(a.map(q=>q.id)),dx,dy);});selected=new Set(a.map(q=>q.id));refresh();
});
$('delete').onclick=()=>run(()=>transaction(()=>deleteSelection(room(),layer(),selected)));
$('map-export').onclick=async()=>{try{const p=await getPack();download('map.json',p.maps[0]);say('区域数据已导出，完整接入请使用开发包。');}catch(e){say(e.message);}};
$('help').onclick=()=>$('help-dialog').showModal();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('template').onclick=async()=>{try{const res=await fetch('../generated/atlas-index.json');if(!res.ok)throw Error('地图目录加载失败');const d=await res.json();options($('base'),d.levels.map(l=>[l.id,l.id]));$('template-dialog').showModal();}catch(e){say(e.message);}};
$('load-template').onclick=async()=>{const id=$('base').value;if(!/^[1-8]-[1-4]$/.test(id))return;const n=++loadEpoch;$('load-template').disabled=true;try{const res=await fetch('../generated/levels/'+id+'/template.json');if(!res.ok)throw Error('底图读取失败');const d=fromTemplate(await res.json());if(n!==loadEpoch)return;if(confirm('将创建底图副本并替换本机草稿，请确认已导出需要保留的工程。')&&safeSwitch()){replace(d);$('template-dialog').close();say('底图副本已创建。参考层保留原记录；可编辑地形与对象。');}}catch(e){say(e.message);}finally{$('load-template').disabled=false;}};
document.addEventListener('keydown',e=>{
 if(e.target.closest('input,select,textarea,dialog'))return;
 if(e.code==='Space'){space=true;e.preventDefault();return;}
 if(e.key==='Escape'){cancelGesture();return;}
 const k=e.key.toLowerCase();
 if(e.ctrlKey||e.metaKey){const id=k==='z'?(e.shiftKey?'redo':'undo'):k==='y'?'redo':k==='c'?'copy':k==='v'?'paste':k==='s'?'export':null;if(id){e.preventDefault();$(id).click();}return;}
 if(k==='delete'||k==='backspace'){e.preventDefault();$('delete').click();return;}
 const arrows={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]};if(arrows[e.key]){e.preventDefault();run(()=>move(...arrows[e.key]));return;}
 const tools={b:'brush',e:'erase',r:'rect',f:'fill',v:'select',i:'pick'};if(tools[k]){cancelGesture();tool=tools[k];palette();}
});
document.addEventListener('keyup',e=>{if(e.code==='Space')space=false;});window.addEventListener('blur',()=>{space=false;cancelGesture();});
window.addEventListener('beforeunload',e=>{if(dirty){save();if(dirty){e.preventDefault();e.returnValue='';}}});
new ResizeObserver(render).observe(vp);
try{const saved=localStorage.getItem(KEY);if(saved){history=new History(parseProject(saved));ri=selectedRoom(history.doc);}}catch(e){say('未恢复本机草稿：'+e.message+'。原存储尚未覆盖，请先导出可用备份。');}
refresh();

async function getPack(){cancelGesture();const copy=clone(room()),namespace='map-'+history.doc.id.slice(-12)+'-'+ri;copy.map.title=history.doc.title+' / '+room().roomId;const res=await fetch('./runtime/character.json');if(!res.ok)throw Error('实验角色加载失败');return developerPack(copy,await res.json(),namespace);}
$('play').onclick=async()=>{try{play(await getPack());}catch(e){say(e.message);}};
$('pack-export').onclick=async()=>{try{const pack=await getPack(),bytes=zipFiles(filesForPack(pack)),url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'})),a=document.createElement('a');a.href=url;a.download='map-development.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);say('开发数据包已导出，内含接入说明。请另存工程文件作为完整备份。');}catch(e){say(e.message);}};
