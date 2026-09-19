import {buildCampaign} from './campaign-build.mjs';
import {orderedTerrain} from './map-appearance.mjs';
import {enemySprite,enemyLabels,promoteEnemies} from './map-appearance.mjs';
import {classicSprite} from './classic-art.mjs';
import {placeObject,batchObjects,connectPortal,connectionProblems,cleanupStarts} from './editor-objects.mjs';
import {background,drawTile,drawObject,drawScenery,preloadArt,drawReference} from './editor-art.mjs';
import {offlineFile} from './editor-offline.mjs';
import {developerPack,projectPack,filesForPack} from './editor-runtime.mjs';
import {zipFiles} from './editor-zip.mjs';
import {play} from './editor-play.mjs';
import {displayRoom,roomLabel} from './room-selection.mjs';
import {blank,fromTemplate,parseProject,clone,uid,materials,resizeComponent,paint,bucket,lineCells,History,resize,runtimeMap,problems,intersects,moveSelection,deleteSelection,linked} from './editor-model.mjs';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d'),vp=$('viewport');
const KEY='xiaoq-map-workshop-v1',locks=new Set();
let history=new History(blank()),ri=0,tool='brush',material='ground',objectKind='coin',selected=new Set(),clipboard=null,gesture=null,space=false,camera={x:0,y:0},dirty=false,saveTimer,loadEpoch=0;
const room=()=>history.doc.rooms[ri],layer=()=>$('layer').value,items=()=>layer()==='decoration'?room().decorations:layer()==='objects'?room().map.objects:room().map.geometry;
const z=()=>Number($('zoom').value),lockKey=()=>room().roomId+':'+layer(),locked=()=>locks.has(lockKey());
const compound=()=>layer()!=='objects'&&['tree','shroom','pipe'].includes(material);
const componentBox=(a,b)=>material==='pipe'?{x:a.x*16,y:Math.min(a.y,b.y)*16,w:32,h:Math.max(32,(Math.abs(a.y-b.y)+1)*16)}:{x:Math.min(a.x,b.x)*16,y:a.y*16,w:Math.max(32,(Math.abs(a.x-b.x)+1)*16),h:16};
const say=t=>{$('message').textContent=t;if(/请选择|人物外观|区域已切换/.test(t)){let note=$('skin-feedback');if(!note){note=document.createElement('p');note.id='skin-feedback';note.className='small';note.setAttribute('role','status');$('skin-file').after(note);}note.textContent=t;}};
const run=fn=>{try{fn();}catch(e){say(e.message);}};
function options(node,list){node.replaceChildren(...list.map(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;return o;}));}
function buttons(id,list,current,action){$(id).replaceChildren(...list.map(([v,t])=>{const b=document.createElement('button');b.type='button';b.textContent=t;if(id==='materials'){const names={cloud:'src|Scenery|Cloud1||',tree:'src|Solid|TreeTop||left',shroom:'src|Solid|ShroomTop||left',coral:'src|Solid|Coral||',bridge:'src|Solid|BridgeBase||',cannon:'src|Solid|Cannon||top',castle:'src|Solid|CastleBlock||',spring:'src|Solid|Springboard||middle',platform:'src|Solid|Platform||',decoration:'bush1',ground:'ground',brick:'brick',block:'question0',stone:'stone',pipe:'pipe_top',coin:'coin0',walker:'goomba',spawn:'small_idle',arrival:'small_idle',portal:'pipe_top',exit:'flag'};const spriteName=names[v]||enemySprite(v);if(spriteName){const thumb=document.createElement('canvas');thumb.width=32;thumb.height=32;thumb.setAttribute('aria-hidden','true');const g=thumb.getContext('2d'),im=classicSprite(spriteName);g.imageSmoothingEnabled=false;if(v==='spring')drawTile(g,{material:'spring',x:8,y:3,w:16,h:29},{setting:'Overworld'});else g.drawImage(im,Math.floor((32-im.width)/2),32-im.height);b.append(thumb);}}b.setAttribute('aria-pressed',String(v===current));b.onclick=()=>{action(v);palette();};return b;}));}
function palette(){
 buttons('tools',[['brush','画笔 B'],['erase','橡皮 E'],['rect','矩形 R'],['fill','填充 F'],['select','框选 V'],['pick','吸管 I'],['pan','平移']],tool,v=>{cancelGesture();tool=v;});
 buttons('materials',layer()==='objects'?[['spawn','出生点'],['coin','金币'],['exit','出口'],['hazard','危险区'],...Object.entries(enemyLabels),['portal','管道入口'],['arrival','管道落地点']]:Object.entries(materials),layer()==='objects'?objectKind:material,v=>{if(layer()==='objects')objectKind=v;else material=v;});
 let hint=$('placement-hint');if(!hint){hint=document.createElement('p');hint.id='placement-hint';$('materials').after(hint);}hint.textContent=compound()?(material==='pipe'?'完整管道：纵向拖动设置高度；管口固定两格。放置后可在右侧修改尺寸。':'整体平台：横向拖动设置宽度；支撑自动接地，可在右侧设置整体高度。'):'';
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
 const component=chosen.length===1&&['tree','shroom','pipe'].includes(chosen[0].material)?chosen[0]:null;$('component-size').hidden=!component;if(component){$('component-width').value=component.w;$('component-width').disabled=component.material==='pipe';$('component-height').value=component.material==='pipe'?component.h:component.stemHeight==null?0:component.h+component.stemHeight;}
 $('selection-info').textContent=chosen.length?chosen.length+' 个元素 · '+chosen.map(q=>q.kind||q.material||q.collision).join('、'):'尚未选中';
 $('x').value=chosen.length?Math.min(...chosen.map(q=>q.x)):'';$('y').value=chosen.length?Math.min(...chosen.map(q=>q.y)):'';
 $('issues').replaceChildren(...(problems(r).length?problems(r):['基础位置检查通过；不代表游戏已通关']).map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
 $('markers').replaceChildren(...r.markers.filter(q=>!q.kind?.startsWith('decorative')&&!(r.enemiesEditable&&enemySprite(q.kind))).map(q=>{const p=document.createElement('p');p.textContent=(q.kind||'标记')+' · ('+q.x+', '+q.y+') '+(q.source?.contents?'奖励：'+JSON.stringify(q.source.contents):'')+(q.source?.transport?' 连接：'+JSON.stringify(q.source.transport):'')+'（参考机制，未接入行为）';return p;}));
 refreshConnections();palette();render();
}
const colors={ground:'#99704d',brick:'#ba6849',stone:'#8d99ae',block:'#e5ae38',platform:'#cba964',decoration:'#477862'};
function render(){
 const w=vp.clientWidth,h=vp.clientHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=false;
 const r=room(),m=r.map,scale=z(),artRoom={...r,renderBounds:{x:camera.x,y:camera.y,w:w/z(),h:h/z()}},effect=$('view').value!=='structure';ctx.save();ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);
 if(effect){background(ctx,r,m.width,m.height);drawScenery(ctx,artRoom);}else{ctx.fillStyle='#16161c';ctx.fillRect(0,0,m.width,m.height);}
 if(effect)for(const q of r.markers)if(/^(lava|water)-/.test(q.kind))drawReference(ctx,q,artRoom);
 const visible=q=>q.x+q.w>=camera.x&&q.x<=camera.x+w/scale&&q.y+q.h>=camera.y&&q.y<=camera.y+h/scale;
 for(const [kind,a] of [['decoration',r.decorations],['geometry',orderedTerrain(r,m.geometry)],['objects',m.objects]])for(const q of a){
  if(!visible(q))continue;const mat=q.material||(q.collision==='oneway'?'platform':'ground');
  ctx.fillStyle=kind==='objects'?({spawn:'#50d5bd',coin:'#ffdb50',exit:'#7fe580',hazard:'#fa5260',portal:'#ac88ff',walker:'#bf664b'}[q.kind]||'#f7f3e7'):effect?colors[mat]||colors.ground:q.motion?'#dbad55':q.collision==='oneway'?'#77bcae':'#e8e0cb';
  if(effect){if(kind==='objects')drawObject(ctx,{...q,skin:r.enemySkins?.[q.id],source:r.markers?.find(m=>m.id===q.id)?.source},0,r);else drawTile(ctx,q,artRoom);}else ctx.fillRect(q.x,q.y,q.w,q.h);
  if(selected.has(q.id)&&kind===layer()){ctx.strokeStyle='#ffef89';ctx.lineWidth=2/scale;ctx.strokeRect(q.x,q.y,q.w,q.h);}
 }
 if($('reference').checked||$('view').value==='secrets')for(const q of r.markers){
  if(effect&&/^(lava|water)-/.test(q.kind))continue;
  if(r.enemiesEditable&&enemySprite(q.kind))continue;if(drawReference(ctx,q,artRoom))continue;const hidden=q.kind==='hidden-block'||q.source?.hidden;if(hidden&&$('view').value!=='secrets')continue;
  if($('view').value==='effect')continue;
  if(q.x<camera.x-30||q.x>camera.x+w/scale||q.y<camera.y-30||q.y>camera.y+h/scale||q.kind?.startsWith('decorative'))continue;
  ctx.strokeStyle='#ff7399';ctx.lineWidth=1/scale;ctx.setLineDash(hidden?[3,2]:[]);ctx.strokeRect(q.x,q.y,16,16);ctx.setLineDash([]);
  ctx.fillStyle='#1b1026';ctx.font='9px sans-serif';ctx.fillText(hidden?'隐':q.kind?.startsWith('enemy')?(enemyLabels[q.kind]||q.kind.slice(6)):q.kind==='block-contents'?'?':'◇',q.x+2,q.y+12);
 }
 if($('view').value==='secrets'){
  ctx.font='10px sans-serif';
  const placed=[];const label=(text,x,y,color='#fff19c')=>{const width=ctx.measureText(text).width+8;x=Math.max(camera.x+2,Math.min(x,camera.x+w/scale-width-2));while(placed.some(b=>x<b.x+b.w&&x+width>b.x&&y-12<b.y+15&&y>b.y))y-=18;placed.push({x,y:y-12,w:width});ctx.fillStyle='#171324ee';ctx.fillRect(x,y-12,width,15);ctx.fillStyle=color;ctx.fillText(text,x+4,y);};
  for(const q of r.markers){if(q.x+16<camera.x||q.x>camera.x+w/scale||(!/hidden|contents|pipe|transport|finish/.test(q.kind)&&!q.source?.contents))continue;ctx.strokeStyle='#ffcf62';ctx.lineWidth=2/scale;ctx.setLineDash([4,3]);ctx.strokeRect(q.x,q.y,16,16);ctx.setLineDash([]);const content=q.source?.contents,labels={coin:'金币',power:'成长道具',mushroom:'成长道具',life:'加命蘑菇',star:'无敌星',multi:'多枚金币'};label((/hidden/.test(q.kind)?'隐藏奖励：':'奖励：')+(content?(labels[String(content).toLowerCase()]||JSON.stringify(content)):q.kind),q.x,q.y-5);}
  for(const o of m.objects.filter(o=>o.kind==='portal'&&visible(o))){const target=history.doc.rooms.find(r=>r.roomId===o.targetRoom),arrival=target?.map.objects.find(q=>q.id===o.targetSpawn);ctx.strokeStyle='#bd9aff';ctx.lineWidth=2/scale;ctx.strokeRect(o.x,o.y,o.w,o.h);label('管道 → '+(target?.map.title||o.targetRoom)+' / '+o.targetSpawn,o.x,o.y-20,'#cfb7ff');if(target===r&&arrival){ctx.setLineDash([6,3]);ctx.beginPath();ctx.moveTo(o.x+o.w/2,o.y);ctx.lineTo(arrival.x+arrival.w/2,arrival.y);ctx.stroke();ctx.setLineDash([]);label('落点',arrival.x,arrival.y-4,'#cfb7ff');}}
  for(const o of m.objects.filter(o=>(o.kind==='spawn'||o.kind==='exit')&&visible(o)))label(o.kind==='exit'?'终点':'起点 / 落点',o.x,o.y-8,'#9effd0');
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
  else placeObject(room(),objectKind,c.x*16,c.y*16);
 }else paint(room(),{x:c.x*16,y:c.y*16,w:16,h:16},material,{erase:tool==='erase',layer:layer()});
}
function cancelGesture(){if(!gesture)return;if(gesture.before)history.doc=gesture.before;gesture=null;refresh();}
canvas.onpointerdown=e=>run(()=>{
 if(e.button>1||gesture)return;e.preventDefault();vp.focus();canvas.setPointerCapture(e.pointerId);
 const p=point(e),c=cell(p);if(tool==='pan'||space||e.button===1){gesture={pointerId:e.pointerId,pan:true,start:{x:e.clientX,y:e.clientY},camera:{...camera}};return;}
 if(tool==='pick'){const q=[...items()].reverse().find(q=>intersects(q,{...p,w:1,h:1}));if(q){if(layer()==='objects')objectKind=q.kind;else material=q.material||(q.collision==='oneway'?'platform':'ground');palette();}return;}
 if(locked())throw Error('当前图层已锁定');
 if(tool==='fill'){if(compound())throw Error('完整组件请拖动放置，不使用填充');if(layer()==='objects')throw Error('对象层不支持填充');transaction(()=>bucket(room(),c.x,c.y,material,{layer:layer()}));return;}
 gesture={pointerId:e.pointerId,before:clone(history.doc),start:c,last:c,box:null,compound:compound()&&['brush','rect'].includes(tool)};
 if(tool==='select'&&items().some(q=>selected.has(q.id)&&intersects(q,{...p,w:1,h:1})))gesture.move=true;
 try{if(gesture.compound)gesture.box=componentBox(c,c);else if(['brush','erase'].includes(tool))stroke(c);else gesture.box=box(c,c);}catch(err){cancelGesture();throw err;}render();
});
canvas.onpointermove=e=>run(()=>{
 const p=point(e),c=cell(p);if(!gesture){say('位置：'+c.x+', '+c.y+' 格 · '+Math.round(p.x)+', '+Math.round(p.y)+' 像素');return;}if(e.pointerId!==gesture.pointerId)return;
 if(gesture.pan){camera.x=Math.max(0,Math.min(room().map.width-32,gesture.camera.x-(e.clientX-gesture.start.x)/z()));camera.y=Math.max(0,Math.min(room().map.height-32,gesture.camera.y-(e.clientY-gesture.start.y)/z()));render();return;}
 try{if(gesture.compound){gesture.box=componentBox(gesture.start,c);}else if(gesture.move){gesture.last=c;gesture.box=box(c,c);}else if(['brush','erase'].includes(tool)){for(const t of lineCells(gesture.last,c))stroke(t);gesture.last=c;}else gesture.box=box(gesture.start,c);}catch(err){cancelGesture();throw err;}render();
});
canvas.onpointerup=e=>run(()=>{
 if(!gesture||e.pointerId!==gesture.pointerId)return;if(gesture.pan){gesture=null;return;}
 const g=gesture;gesture=null;
 try{
  if(g.move){moveSelection(room(),layer(),selected,(g.last.x-g.start.x)*16,(g.last.y-g.start.y)*16);if(history.commit(g.before))changed();else refresh();return;}
  if(tool==='select'){selected=new Set(items().filter(q=>intersects(q,g.box)).map(q=>q.id));refresh();return;}
  if(g.compound){if(g.box.x+g.box.w>room().map.width||g.box.y+g.box.h>room().map.height)throw Error('组件超出地图，请留出完整宽高');paint(room(),g.box,material,{layer:layer()});selected=new Set(items().filter(q=>q.material===material&&intersects(q,g.box)).map(q=>q.id));}
  else if(tool==='rect'){if(layer()==='objects')batchObjects(room(),objectKind,g.box,Number($('spacing').value)||2);else paint(room(),g.box,material,{layer:layer()});}
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
function replace(d){history=new History(d);const loaded=history.doc;restoreAppearance().then(()=>{if(history.doc===loaded){for(const r of loaded.rooms)promoteEnemies(r);render();}});ri=selectedRoom(d);selected.clear();locks.clear();camera={x:0,y:0};preloadArt(d.rooms).then(render).catch(e=>say(e.message));changed();}
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
$('component-size').onsubmit=e=>{e.preventDefault();run(()=>transaction(()=>{const q=items().find(q=>selected.has(q.id));if(!q)throw Error('先选中一个组件');resizeComponent(room(),q,Number($('component-width').value),Number($('component-height').value));}));};
$('position').onsubmit=e=>{e.preventDefault();run(()=>{const a=items().filter(q=>selected.has(q.id));if(!a.length)throw Error('请先框选元素');move(Number($('x').value)-Math.min(...a.map(q=>q.x)),Number($('y').value)-Math.min(...a.map(q=>q.y)));});};
$('copy').onclick=()=>{const picked=items().filter(q=>selected.has(q.id));clipboard={layer:layer(),items:clone(picked),markers:layer()==='geometry'?clone(room().markers.filter(m=>picked.some(q=>linked(m,q.id)))):[]};say('已复制 '+clipboard.items.length+' 个元素，粘贴到当前视图左上角。');};
$('paste').onclick=()=>run(()=>{
 if(!clipboard?.items.length)throw Error('请先框选并复制');if(clipboard.layer!==layer())throw Error('请切换到复制时的图层再粘贴');
 if(layer()==='objects'&&clipboard.items.some(o=>['spawn','exit','portal'].includes(o.kind)))throw Error('起点、终点和管道请单独放置，避免复制失效连接');
 const a=clone(clipboard.items),markers=clone(clipboard.markers),dx=Math.ceil(camera.x/16)*16+16-Math.min(...a.map(q=>q.x)),dy=Math.ceil(camera.y/16)*16+16-Math.min(...a.map(q=>q.y));
 transaction(()=>{for(const q of a){const old=q.id;q.id=uid();for(const m of markers){if(linked(m,old))m.id=q.id+m.id.slice(old.length);}}items().push(...a);room().markers.push(...markers);moveSelection(room(),layer(),new Set(a.map(q=>q.id)),dx,dy);});selected=new Set(a.map(q=>q.id));refresh();
});
$('delete').onclick=()=>run(()=>transaction(()=>deleteSelection(room(),layer(),selected)));
$('map-export').onclick=async()=>{try{const p=await getPack();download('map.json',p.maps[0]);say('区域数据已导出，完整接入请使用开发包。');}catch(e){say(e.message);}};
$('help').onclick=()=>$('help-dialog').showModal();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
let templateLevels=[];
function updateTemplateInfo(){const l=templateLevels.find(q=>q.id===$('base').value);$('template-info').textContent=l?`${l.id} · ${l.areas} 个区域${l.underwaterAreas?' · 含水下区域':''}。创建后可切换区域继续编辑。`:'';}
function updateTemplateLevels(preferred){const levels=templateLevels.filter(l=>l.id.split('-')[0]===$('base-world').value);options($('base'),levels.map(l=>[l.id,l.id==='1-1'?'1-1 · 现有实机底图':l.id]));if(levels.some(l=>l.id===preferred))$('base').value=preferred;updateTemplateInfo();}
$('base-world').onchange=()=>updateTemplateLevels();$('base').onchange=updateTemplateInfo;
$('template').onclick=async()=>{const button=$('template');button.disabled=true;try{const res=await fetch('../generated/atlas-index.json');if(!res.ok)throw Error('地图目录加载失败');const d=await res.json();templateLevels=d.levels;options($('base-world'),[...new Set(d.levels.map(l=>l.id.split('-')[0]))].map(w=>[w,'世界 '+w]));const preferred=history.doc.reference?.level||'1-1';$('base-world').value=preferred.split('-')[0];updateTemplateLevels(preferred);$('template-dialog').showModal();}catch(e){say(e.message);}finally{button.disabled=false;}};
$('load-template').onclick=async()=>{const id=$('base').value;if(!/^[1-8]-[1-4]$/.test(id))return;const n=++loadEpoch;$('load-template').disabled=true;try{const res=await fetch(id==='1-1'?'./classic-1-1.json':'../generated/levels/'+id+'/template.json');if(!res.ok)throw Error('底图读取失败');const d=fromTemplate(await res.json());if(n!==loadEpoch)return;if(confirm('将创建底图副本并替换本机草稿，请确认已导出需要保留的工程。')&&safeSwitch()){replace(d);$('template-dialog').close();say('底图副本已创建。参考层保留原记录；可编辑地形与对象。');}}catch(e){say(e.message);}finally{$('load-template').disabled=false;}};
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
$('play').onclick=async()=>{try{const p=await getProjectPack();const onWarp=async(target,carry,session)=>{try{const d=fromTemplate(await(await fetch('../generated/levels/'+target+'/template.json')).json()),character=await(await fetch('./runtime/character.json')).json();await session.load(projectPack(d,d.rooms[0].roomId,character),d.rooms,{initialState:carry,onWarp});}catch(e){say('跳关加载失败：'+e.message);}};await play(p,clone(history.doc.rooms),{},{onWarp});}catch(e){say(e.message);}};
$('pack-export').onclick=async()=>{try{const pack=await getProjectPack(),bytes=zipFiles(filesForPack(pack)),url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'})),a=document.createElement('a');a.href=url;a.download='map-development.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);say('开发数据包已导出，内含接入说明。请另存工程文件作为完整备份。');}catch(e){say(e.message);}};

async function getProjectPack(){cancelGesture();await restoreAppearance();const res=await fetch('./runtime/character.json');if(!res.ok)throw Error('角色加载失败');return projectPack(history.doc,room().roomId,await res.json(),'map-'+history.doc.id.slice(-12));}
function refreshConnections(){
 const portal=items().find(o=>selected.has(o.id)&&o.kind==='portal');
 options($('target'),history.doc.rooms.flatMap(r=>r.map.objects.filter(o=>o.kind==='spawn').map(o=>[JSON.stringify([r.roomId,o.id]),r.roomId+' / '+(o.id.startsWith('arrival-')?'落地点':'起点')+' ('+o.x+', '+o.y+')'])));
 if(portal?.targetRoom)$('target').value=JSON.stringify([portal.targetRoom,portal.targetSpawn]);
 $('connect').disabled=!portal;
 $('connection-status').textContent=portal?'选中管道：'+portal.id:'框选一个管道后设置目标；每个落地点显示坐标。';
 const errors=connectionProblems(history.doc);if(errors.length)$('connection-status').textContent+=' '+errors.length+' 个连接待配置';
}
$('connect').onclick=()=>run(()=>{const p=items().find(o=>selected.has(o.id)&&o.kind==='portal');if(!p)throw Error('请先框选管道');const [r,s]=JSON.parse($('target').value);transaction(()=>connectPortal(history.doc,room().roomId,p.id,r,s));});
let offlineUrl=null;
$('play-download').onclick=async()=>{const button=$('play-download'),dialog=$('download-dialog'),status=$('download-status'),progress=$('download-progress'),link=$('download-ready');button.disabled=true;button.textContent='正在准备…';status.textContent='正在准备地图与声音…';progress.value=0;link.hidden=true;if(offlineUrl){URL.revokeObjectURL(offlineUrl);offlineUrl=null;}if(!dialog.open)dialog.showModal();try{const pack=await getProjectPack(),html=await offlineFile(pack,clone(history.doc.rooms),undefined,undefined,(done,total)=>{progress.value=Math.round(done/total*100);status.textContent='正在打包地图、画面与声音… '+progress.value+'%';});offlineUrl=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));link.href=offlineUrl;link.download=(pack.stages[0].title||'my-map').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').slice(0,80)+'-play.html';link.hidden=false;progress.value=100;status.textContent='离线文件已准备好（'+(new Blob([html]).size/1024/1024).toFixed(1)+' MB），点击下方按钮保存。';if(!dialog.open)dialog.showModal();say('离线试玩文件已准备好，请点击保存链接。');}catch(e){status.textContent='未能生成离线文件：'+e.message;say(status.textContent);if(!dialog.open)dialog.showModal();}finally{button.disabled=false;button.textContent='下载离线试玩';}};
$('download-ready').onclick=()=>{$('download-status').textContent='已请求浏览器保存。若没有出现下载，请再点一次，并检查浏览器下载列表。';};
window.addEventListener('pagehide',()=>{if(offlineUrl)URL.revokeObjectURL(offlineUrl);});

$('add-room').onclick=()=>run(()=>{cancelGesture();history.change(d=>{const r=blank('新区域',1280,480).rooms[0];r.roomId='room-'+uid().slice(-8);d.rooms.push(r);});ri=history.doc.rooms.length-1;camera={x:0,y:0};selected.clear();changed();});

preloadArt(history.doc.rooms).then(render).catch(e=>say(e.message));
$('art-upload').onclick=()=>$('art-file').click();
$('art-file').onchange=async()=>{const f=$('art-file').files[0];$('art-file').value='';if(!f)return;const roomId=room().roomId,key=material,projectId=history.doc.id;try{if(f.type!=='image/png'||f.size>500*1024)throw Error('请选择不超过 500 KB 的 PNG');const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(f);});await preloadArt([{art:{[key]:src}}]);if(history.doc.id!==projectId||room().roomId!==roomId)throw Error('区域已切换，请重新导入');transaction(()=>{room().art??={};room().art[key]=src;});say('已替换当前区域的 '+materials[key]+' 素材，工程与离线试玩都会保留。');}catch(e){say(e.message);}};

$('clean-starts').onclick=()=>run(()=>{let count=0;transaction(()=>{count=cleanupStarts(history.doc);});say('已清理 '+count+' 个重复起点，保留管道和检查点使用的落地点，可撤销。');});

$('focus-mode').onclick=()=>{document.body.classList.toggle('focus-mode');$('focus-mode').textContent=document.body.classList.contains('focus-mode')?'显示属性':'专注编辑';render();};
$('home-view').onclick=()=>{const p=room().map.objects.find(o=>o.kind==='spawn');camera={x:Math.max(0,(p?.x||0)-32),y:0};render();};

$('skin-upload').onclick=()=>$('skin-file').click();
$('skin-reset').onclick=()=>run(()=>transaction(()=>{delete room().playerSkin;}));
$('skin-file').onchange=async()=>{const f=$('skin-file').files[0];$('skin-file').value='';if(!f)return;const original=room(),project=history.doc.id;try{if(f.type!=='image/png'||f.size>50000)throw Error('请选择 16×16 PNG，50 KB 内');const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f);});const im=new Image();im.src=data;await im.decode();if(im.width!==16||im.height!==16)throw Error('人物外观需为 16×16 像素，不会拉伸图片');await preloadArt([{playerSkin:data}]);if(history.doc.id!==project||room()!==original)throw Error('区域已切换，请重试');transaction(()=>{room().playerSkin=data;});say('已替换人物外观，操作能力保持马里奥基础试玩。');}catch(e){say(e.message);}};

document.querySelectorAll('.project-menu button').forEach(b=>b.addEventListener('click',()=>b.closest('details').removeAttribute('open')));
$('mobile-palette').onclick=()=>{document.body.classList.toggle('palette-open');$('mobile-palette').textContent=document.body.classList.contains('palette-open')?'收起素材与工具 ▴':'素材与工具 ▾';render();};

async function restoreAppearance(){
 const doc=history.doc,level=doc.reference?.level;if(!/^[1-8]-[1-4]$/.test(level)||doc.rooms.every(r=>r.semantics?.length))return;
 try{const res=await fetch('../generated/levels/'+level+'/template.json');if(!res.ok)throw Error('底图材质读取失败');const canonical=await res.json();if(history.doc!==doc)return;
 for(const r of doc.rooms){const base=canonical.rooms.find(b=>b.roomId===r.roomId);if(!base)continue;const ids=new Set(r.map.geometry.map(q=>q.id));r.semantics??=[];const known=new Set(r.semantics.map(q=>q.id));r.semantics.push(...(base.semantics||[]).filter(q=>ids.has(q.id)&&!known.has(q.id)));}render();
 }catch(e){say('旧草稿材质未恢复：'+e.message);}
}
await restoreAppearance();
for(const r of history.doc.rooms)promoteEnemies(r);render();

$('pan-left').onclick=()=>{camera.x=Math.max(0,camera.x-vp.clientWidth/z()*.7);render();};
$('pan-right').onclick=()=>{camera.x=Math.max(0,Math.min(room().map.width-vp.clientWidth/z(),camera.x+vp.clientWidth/z()*.7));render();};

$('campaign-download').onclick=async()=>{const button=$('campaign-download'),dialog=$('download-dialog'),status=$('download-status'),progress=$('download-progress'),link=$('download-ready');button.disabled=true;link.hidden=true;progress.value=0;dialog.showModal();try{const levels=await buildCampaign(undefined,(n,total)=>{status.textContent='准备关卡 '+n+' / '+total;progress.value=n/total*30;});const html=await offlineFile(levels[0].pack,levels[0].rooms,undefined,undefined,(n,total)=>{status.textContent='打包地图与音频…';progress.value=30+n/total*70;},{campaign:levels});if(offlineUrl)URL.revokeObjectURL(offlineUrl);offlineUrl=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));link.href=offlineUrl;link.download='xiaoq-mario-32-levels.html';link.hidden=false;progress.value=100;status.textContent='32 关连续闯关测试版已准备好，点击保存。';}catch(e){status.textContent='生成失败：'+e.message;}finally{button.disabled=false;}};

// Character behavior is stored with the project rooms and travels with offline exports.
