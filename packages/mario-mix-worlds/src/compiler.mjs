import {compileRemaining} from './remaining-compiler.mjs';
/** First-world geometry adapter. Data only; does not execute third-party scripts.
 * Reference units: 8 units/tile, positive y upward. Host: 16px/tile, y downward.
 * Markers preserve mechanics the preview driver cannot implement. Not a full SMB engine.
 */
export const FLOOR=208, HEIGHT=240, SCALE=2;
const clone=x=>JSON.parse(JSON.stringify(x));
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const fail=m=>{throw new Error(m);};
const num=(x,min=0,max=32768)=>Number.isFinite(x)&&x>=min&&x<=max;
export function compileWorld(reference,level){
 if(reference?.schemaVersion!==1||!Array.isArray(reference.maps))fail('Unsupported map reference');
 if(!/^1-[1-4]$/.test(level))return compileRemaining(reference,level);
 const input=reference.maps.find(m=>m.name===level);if(!input)fail('Missing reference: '+level);
 const rooms=[],notes=[],emissions=[];const entrances=new Map();let serial=0;
 const addNote=(roomId,record,kind)=>notes.push({roomId,sourceRecord:record,kind});
 const unit=v=>v*SCALE;
 input.areas.forEach((area,index)=>{
  if(!num(area.widthUnits,128,16384)||!Array.isArray(area.creation)||area.creation.length>2000)fail('Invalid area');
  const roomId='area-'+index,map={id:`classic-${level}-${roomId}`,title:`${level} · ${['地表','地下','奖励房','出口'][index]||roomId}`,tileSize:16,width:unit(area.widthUnits),height:HEIGHT,provenance:{kind:'transcribed',source:reference.source.url,review:'pending',note:'第一世界社区参考坐标转录。基础几何用于开发预览；机关、敌人行为与原版逐格保真尚待验收。'},geometry:[],objects:[]},markers=[];
  function marker(q,key,kind){markers.push({id:key,kind,source:clone(q),x:unit(q.x||0),y:FLOOR-unit(q.y||0)});addNote(roomId,key,kind);}
  function rect(q,key,kind,w=8,h=8,top=q.y||0,collision='solid'){
   const x=unit(q.x||0),y=FLOOR-unit(top);w=unit(w);h=h===Infinity?HEIGHT-y:unit(h);
   if(![x,y,w,h].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||x+w>map.width||y+h>HEIGHT)fail(`Invalid geometry ${level}/${key}: ${x},${y},${w},${h}`);
   const g={id:key,x,y,w,h,collision};map.geometry.push(g);emissions.push({room:roomId,id:key,type:kind,source:clone(q)});return g;
  }
  function portal(q,key,top,dir){
   if(!own(q,'transport'))return;
   if(typeof q.transport==='object'){marker(q,key+'-warp','world-transport');return;}
   const loc=input.locations[q.transport];if(!loc)fail('Unresolved reference location '+q.transport);
   const x=dir==='horizontal'?Math.max(0,unit(q.x||0)-18):unit(q.x||0);
   const y=dir==='horizontal'?Math.max(0,FLOOR-unit(q.y||0)):Math.max(0,FLOOR-unit(top)-18);
   // Interaction regions are host adapters, not reference collision geometry.
   map.objects.push({id:key+'-portal',kind:'portal',x,y,w:dir==='horizontal'?22:32,h:dir==='horizontal'?Math.min(32,HEIGHT-y):24,targetRoom:'area-'+(loc.area||0),targetSpawn:'location-'+q.transport});
  }
  function thing(q,key){
   const k=q.thing;
   if(!['Brick','Block','Stone','CastleBlock','PipeHorizontal','PipeVertical','Platform','Coin','Goomba','Koopa','ScrollEnabler','ScrollBlocker','CastleBridge','CastleAxe','Bowser','CastleChain','Toad','Peach'].includes(k))fail('Unsupported reference thing '+k);
   if(['Brick','Block','Stone','CastleBlock'].includes(k)){
    if(q.hidden){marker(q,key,'hidden-block');return;}
    rect(q,key,k,q.width??8,q.height??8);
    if(q.contents)marker(q,key+'-contents','block-contents');
    if(q.fireballs)marker(q,key+'-firebar','rotating-firebar');
   }else if(k==='PipeVertical'||k==='PipeHorizontal'){
    const w=q.width??(k==='PipeVertical'?16:19.5),h=q.height??(k==='PipeVertical'?8:16);
    rect(q,key,k,w,h);portal(q,key,q.y||0,k==='PipeHorizontal'?'horizontal':'vertical');
    if(own(q,'entrance'))entrances.set(q.entrance,{room:roomId,x:unit(q.x||0)+8,y:FLOOR-unit(q.y||0)-24});
   }else if(k==='Platform'){
    // A reference marked nocollidechar is scenery, not an actor platform.
    if(q.nocollidechar){marker(q,key,'noncolliding-platform');return;}
    const g=rect(q,key,k,q.width??24,4,q.y||0,'oneway');
    if(q.sliding||q.floating){const axis=q.sliding?'x':'y';const min=axis==='x'?unit(q.begin):FLOOR-unit(q.end),max=axis==='x'?unit(q.end):FLOOR-unit(q.begin);g.motion={axis,min,max,speed:.75};marker(q,key+'-timing','platform-timing');}
   }else if(k==='Coin')map.objects.push({id:key,kind:'coin',x:unit(q.x),y:FLOOR-unit(q.y),w:10,h:14});
   else if(k==='Goomba'||k==='Koopa'){
    // Preserve exact spawn and attributes; no generic walker masquerading as a turtle.
    marker(q,key,'enemy-'+k.toLowerCase());
   }else if(k==='CastleBridge')rect(q,key,k,q.width??104,16,q.y||0,'solid');
   else marker(q,key,k==='CastleAxe'?'bridge-axe-finish':'marker-'+k);
  }
  function expand(q,key){
   if(!q||typeof q!=='object'||Array.isArray(q))fail('Invalid placement record');
   for(const k of ['x','y','width','height'])if(own(q,k)&&!num(q[k],k==='y'?-4:0))fail('Invalid reference coordinate '+k);
   if(q.thing&&!q.macro)return thing(q,key);
   const x=q.x||0,y=q.y||0;
   switch(q.macro){
    case 'Fill':{
     const nx=q.xnum??1,ny=q.ynum??1,dx=q.xwidth??8,dy=q.yheight??8;
     if(!Number.isInteger(nx)||!Number.isInteger(ny)||nx<1||ny<1||nx*ny>5000||!num(dx,1)||!num(dy,1))fail('Invalid Fill');
     const t={...q};for(const k of ['macro','xnum','ynum','xwidth','yheight'])delete t[k];
     for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++)thing({...t,x:x+ix*dx,y:y+iy*dy},`${key}-${ix}-${iy}`);break;
    }
    case 'Floor':rect(q,key,'Floor',q.width??8,Infinity,y);break;
    case 'Ceiling':rect(q,key,'Ceiling',q.width??8,8,88);break;
    case 'Pipe':{
     const h=q.height??8;thing({...q,macro:undefined,thing:'PipeVertical',y:y+h,width:16,height:h},key);
     if(q.piranha)marker({...q,y:y+h},key+'-piranha','enemy-piranha');break;
    }
    case 'Tree':rect(q,key,'TreeTop',q.width??24,8,y,'solid');marker(q,key+'-trunk','decorative-trunk');break;
    case 'StartInsideCastle':{
     for(const[a,b,w]of [[0,48,24],[24,40,8],[32,32,8]])rect({...q,x:x+a},key+'-'+a,'Stone',w,Infinity,y+b);
     if((q.width??40)>40)rect({...q,x:x+40},key+'-floor','Floor',q.width-40,Infinity,y+24);break;
    }
    case 'EndOutsideCastle':{
     rect(q,key+'-base','Stone',8,8,y+8);map.objects.push({id:key+'-exit',kind:'exit',x:unit(x),y:Math.max(24,FLOOR-unit(y+84)),w:16,h:unit(84)});marker(q,key,'flagpole-finish');break;
    }
    case 'Water':{
     const top=FLOOR-unit(y);map.objects.push({id:key,kind:'hazard',x:unit(x),y:top,w:unit(q.width??8),h:HEIGHT-top});marker(q,key+'-visual','lava-art');break;
    }
    case 'EndInsideCastle':{
     thing({thing:'Stone',x,y:y+88,width:256},key+'-roof');expand({macro:'Water',x,y,width:104},key+'-lava');
     thing({thing:'CastleBridge',x,y:y+24,width:104},key+'-bridge');
     thing({thing:'Bowser',x:x+69,y:y+42},key+'-boss');
     thing({thing:'CastleAxe',x:x+104,y:y+40},key+'-axe');
     expand({macro:'Floor',x:x+104,y,width:152},key+'-floor');
     thing({thing:'Stone',x:x+104,y:y+32,width:24,height:32},key+'-step');
     thing({thing:'Stone',x:x+112,y:y+80,width:16,height:24},key+'-ceiling');
     // The lab completion marker is in the NPC room, NOT an implemented bridge/boss sequence.
     map.objects.push({id:key+'-exit',kind:'exit',x:unit(x+180),y:FLOOR-32,w:24,h:32});marker(q,key+'-finish','castle-finish');break;
    }
    case 'WarpWorld':for(let i=0;i<q.warps.length;i++)expand({macro:'Pipe',x:x+8+i*32,height:24,transport:{map:q.warps[i]+'-1'}},key+'-'+i);break;
    case 'PlatformGenerator':marker(q,key,'platform-generator');break;
    case 'CastleSmall':marker(q,key,'decorative-castle');break;
    default:fail('Unsupported reference macro '+q.macro);
   }
  }
  area.creation.forEach((q,i)=>expand(q,`r${String(i).padStart(3,'0')}`));
  rooms.push({roomId,setting:area.setting,map,markers});
 });
 // Input location IDs keep original room relations; host spawn size is explicit.
 for(let n=0;n<input.locations.length;n++){
  const loc=input.locations[n],r=rooms[loc.area||0];if(!r)fail('Missing location area');
  const e=entrances.get(n);let x=e?.x??32,y=e?.y??(loc.entry==='Castle'?88:184);
  if(x+12>r.map.width||y<0||y+24>HEIGHT)fail('Spawn out of bounds');
  r.map.objects.push({id:'location-'+n,kind:'spawn',x,y,w:12,h:24});
 }
 // Every room is independently inspectable even if no top-level location enters it.
 for(const r of rooms)if(!r.map.objects.some(o=>o.kind==='spawn'))r.map.objects.push({id:'room-start',kind:'spawn',x:32,y:184,w:12,h:24});
 const stage={id:'template-'+level,title:level+' · 底图预览（实验）',driver:'platform-v1',status:'draft',entryRoom:'area-0',entrySpawn:'location-0',rooms:Object.fromEntries(rooms.map(r=>[r.roomId,r.map.id])),characters:['lab-runner','lab-scout'],requiredCapabilities:['jump'],overlays:{},audio:'map-kit-silent',note:'社区参考底图与实验驱动。没有接入正式角色、道具箱、完整敌人和机关；不是正式关卡或奥日版本。'};
 return {schemaVersion:1,level,stage,maps:rooms.map(r=>r.map),rooms,coverage:{placementRecords:input.areas.reduce((n,a)=>n+a.creation.length,0),areas:rooms.length,geometry:rooms.reduce((n,r)=>n+r.map.geometry.length,0),objects:rooms.reduce((n,r)=>n+r.map.objects.length,0),pending:[...new Set(notes.map(n=>n.kind))].sort(),details:notes,geometryReview:'reference-transcribed-pending-original-review',playability:'developer-preview-only'},source:clone(reference.source)};
}
export function previewAudio(){return {id:'map-kit-silent',music:null,events:{jump:null,attack:null,pickup:null,hurt:null,death:null,checkpoint:null,complete:null,portal:null},note:'地图核验默认静音；接入授权明确的音频后再设置事件键。'};}
export function extensionFiles(world){
 const stages=world.inspectionStages||[world.stage], ids=new Set(stages.flatMap(s=>Object.values(s.rooms)));
 return new Map([...world.maps.filter(m=>ids.has(m.id)).map(m=>[`content/extensions/maps/${m.id}/map.json`,m]),...stages.map(s=>[`content/extensions/stages/${s.id}/stage.json`,s])]);
}
