import {roomTestPack} from '../src/room-test.mjs';
import{createStageCatalog}from'../vendor/m06/stage-catalog.mjs';import{createPlatformMotor}from'../vendor/m06/platform-motor.mjs';import{createPlatformStage}from'../vendor/m06/platform-stage.mjs';import{createStageSession}from'../vendor/m06/stage-session.mjs';import{createLifetime}from'../vendor/m06/lifetime.mjs';import{drawMap}from'../src/map-view.mjs';
export async function mountWorkbench({root=document,load=async p=>{const r=await fetch(p);if(!r.ok)throw Error('模板加载失败：'+r.status);return r.json();}}={}){
 const $=id=>root.querySelector('#'+id),canvas=$('map'),ctx=canvas.getContext('2d'),life=createLifetime({scheduleInterval:setInterval,cancelInterval:clearInterval});let pack,compiled;
 try{[pack,compiled]=await Promise.all([load('data/generated/extensions.json'),load('data/generated/world-1.json')]);}catch(e){$('status').textContent='模板暂时无法加载。请通过 npm run dev 启动后重试。';throw e;}
 const maps=compiled.maps,keys=new Set();let session=null,mode='inspect',frame=0,last=0,acc=0,disposed=false;
 const option=(id,text)=>{const o=root.createElement('option');o.value=id;o.textContent=text;return o;};
 maps.forEach(c=>$('chapter').append(option(c.id,c.id+' · '+c.rooms[0].title)));pack.characters.forEach(c=>$('character').append(option(c.id,c.title)));
 function chapter(){return maps.find(c=>c.id===$('chapter').value);}function room(){const st=session?.view().scene;return chapter().rooms.find(r=>r.room===(st?.roomId||$('room').value));}
 function fillRooms(){keys.clear();session?.stop();session=null;mode='inspect';$('room').replaceChildren(...chapter().rooms.map(r=>option(r.room,r.title)));$('room').value=chapter().entryRoom;$('position').value=0;sync();}
 function sync(){const r=room();$('position').max=Math.max(0,r.width-512);$('position').disabled=mode==='play';$('pause').disabled=mode!=='play';$('dataLink').href=`data/generated/${chapter().id}.json`;$('tiledLink').href=`tiled/${chapter().id}-${r.room}.tmj`;
  $('counts').textContent=`${chapter().rooms.length} 个房间 · 当前房间 ${r.geometry.length} 个碰撞区域 / ${r.annotations.length} 个定位标记`;
  $('limits').replaceChildren(...[...new Set([...r.limits,compiled.maps[0].limitations[1]])].map(t=>{const n=root.createElement('li');n.textContent=t;return n;}));
  $('objects').replaceChildren(...r.annotations.map(o=>{const tr=root.createElement('tr');[o.id,o.kind,`${o.x}, ${o.y}`,o.state].forEach(t=>{const td=root.createElement('td');td.textContent=t;tr.append(td);});return tr;}));
  $('status').textContent=mode==='inspect'?'底图浏览 · 拖动滑块查看完整路线，虚线对象未作为正式机关运行。':'角色测试 · 点画布后操作。';draw();}
 function draw(){if(disposed)return;const v=session?.view(),r=room(),s=v?.scene,offset=mode==='play'&&s?Math.max(0,Math.min(r.width-512,s.p.x-180)):Number($('position').value)||0;ctx.setTransform(2,0,0,2,0,0);drawMap(ctx,r,s,{offset,width:512,markers:$('markers').checked});
  if(mode==='play'&&s){$('status').textContent=`${r.title} · 生命 ${s.lives} · 金币 ${s.coins} · ${v.status==='paused'?'已暂停':v.status==='complete'?'测试结束（非原版通关认证）':'角色测试中'}`;$('pause').textContent=v.status==='paused'?'继续':'暂停';}}
 function pause(){keys.clear();if(session?.view().status==='paused')session.resume();else session?.pause();draw();}
 function start(){keys.clear();session?.stop();const p=roomTestPack(pack,'atlas-'+chapter().id,$('room').value);const catalog=createStageCatalog(p),motor=createPlatformMotor();session=createStageSession({catalog,drivers:{'platform-v1':o=>createPlatformStage({...o,motor})},makeLifetime:()=>createLifetime({scheduleInterval:setInterval,cancelInterval:clearInterval}),onEvent:e=>{if(e.type==='room')queueMicrotask(sync);}});session.start('atlas-'+chapter().id,$('character').value,{allowDraft:true});mode='play';sync();canvas.focus();}
 life.listen($('chapter'),'change',fillRooms);life.listen($('room'),'change',()=>{session?.stop();session=null;mode='inspect';keys.clear();$('position').value=0;sync();});life.listen($('start'),'click',start);life.listen($('pause'),'click',pause);life.listen($('inspect'),'click',()=>{session?.stop();session=null;mode='inspect';keys.clear();sync();});life.listen($('position'),'input',draw);life.listen($('markers'),'change',draw);
 const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',KeyK:'jump',ArrowUp:'jump',ArrowDown:'down',KeyS:'down',KeyE:'interact',KeyJ:'attack'};
 life.listen(canvas,'keydown',e=>{if(e.code==='KeyP'){e.preventDefault();if(!e.repeat)pause();return;}const k=mapping[e.code];if(k){e.preventDefault();keys.add(k);}});life.listen(canvas,'keyup',e=>{const k=mapping[e.code];if(k){e.preventDefault();keys.delete(k);}});
 life.listen(canvas,'blur',()=>keys.clear());
 life.listen(window,'blur',()=>{keys.clear();session?.pause();draw();});life.listen(root,'visibilitychange',()=>{if(root.hidden){keys.clear();session?.pause();}});
 for(const b of root.querySelectorAll('[data-input]')){life.listen(b,'pointerdown',e=>{e.preventDefault();keys.add(b.dataset.input);b.setPointerCapture(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])life.listen(b,event,()=>keys.delete(b.dataset.input));}
 function tick(t){if(disposed)return;acc+=Math.min(.1,Math.max(0,(t-last)/1000));last=t;let n=0;while(acc>=1/60&&n++<5){acc-=1/60;if(mode==='play')session?.step({x:(keys.has('right')?1:0)-(keys.has('left')?1:0),jump:keys.has('jump'),down:keys.has('down'),interact:keys.has('interact'),attack:keys.has('attack')});}if(n>=5)acc=0;if(mode==='play')draw();frame=requestAnimationFrame(tick);}
 fillRooms();frame=requestAnimationFrame(tick);
 const api={dispose(){disposed=true;keys.clear();cancelAnimationFrame(frame);session?.stop();life.dispose();},snapshot(){return{mode,...session?.view()};},start};life.listen(window,'pagehide',e=>{keys.clear();session?.pause();if(!e.persisted)api.dispose();});return api;
}
if(typeof document!=='undefined'&&document.querySelector('#map'))mountWorkbench().then(x=>{globalThis.LEVEL_WORKBENCH=x;}).catch(()=>{});
