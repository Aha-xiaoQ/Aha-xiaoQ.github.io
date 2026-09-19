/** World 1 geometry transcriptions. One source unit = 2 CSS/game pixels.
 * Only JSON data is accepted. Objects not implemented by the M06 preview remain
 * visible, typed annotations; they are never disguised as functioning enemies.
 */
const clone=x=>JSON.parse(JSON.stringify(x));
const kinds=new Set(['Floor','Brick','Block','Stone','Pipe','PipeHorizontal','PipeVertical','Tree','Platform','PlatformGenerator','Ceiling','Goomba','Koopa','Coin','Water','CastleBlock','StartInsideCastle','EndOutsideCastle','EndInsideCastle','WarpWorld','Fill']);
export function compileReference(reference){
 if(!reference||!/^[1-8]-[1-4]$/.test(reference.id)||reference.sourceUnitsPerTile!==8||reference.floorY!==208||!Array.isArray(reference.rooms))throw Error('Unsupported reference version');
 const result={id:reference.id,source:clone(reference.source),entryRoom:reference.entryRoom,rooms:[],limitations:['底图按公开复刻项目坐标转录，原版逐格与机关时序尚待复核。','测试角色为几何样例；原角色、武器、坐骑与原版音频未自动接入。']};
 for(const r of reference.rooms){
  if(!/^[a-z]+$/.test(r.id)||!Number.isFinite(r.width)||r.width<128||r.width>16384||!Array.isArray(r.ops)||r.ops.length>3000)throw Error('Invalid source room');
  const m={id:`atlas-${reference.id}-${r.id}`,room:r.id,title:r.title,theme:r.theme,width:r.width*2,height:240,tileSize:16,geometry:[],objects:[],annotations:[],coverage:[],limits:[],links:clone(r.links)};
  const ids=new Set();
  function geom(id,x,y,w=8,h=8,type='Stone',collision='solid',motion){
   const q={id,x:x*2,y:208-y*2,w:w*2,h:h===Infinity?240-(208-y*2):h*2,collision};
   if(motion)q.motion=motion;
   if(q.y<0||q.y+q.h>240||q.x<0||q.x+q.w>m.width||![q.x,q.y,q.w,q.h].every(Number.isFinite)||q.w<=0||q.h<=0)throw Error(`${m.id} bounds: ${id}`);
   if(ids.has(id))throw Error('Duplicate ID: '+id);ids.add(id);
   m.geometry.push({...q,type});
  }
  function note(id,kind,x,y,w=8,h=8,params={},state='待接入'){
   m.annotations.push({id,kind,x:x*2,y:208-y*2,w:w*2,h:h*2,state,parameters:clone(params)});
  }
  function limit(text){if(!m.limits.includes(text))m.limits.push(text);}
  function obj(id,kind,x,y,w,h,extra={}){m.objects.push({id,kind,x:x*2,y:208-y*2,w:w*2,h:h*2,...extra});}
  function expand(o,id){
   if(!o||!kinds.has(o.kind))throw Error('Unknown map operation: '+o?.kind);
   const x=o.x??0,y=o.y??0,w=o.width??8,h=o.height??8;
   if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw Error('Invalid coordinate: '+id);
   if(o.kind==='Fill'){
    const nx=o.nx??1,ny=o.ny??1;
    if(!Number.isInteger(nx)||!Number.isInteger(ny)||nx<1||ny<1||nx*ny>2048||o.thing==='Fill')throw Error('Invalid Fill count');
    for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)expand({...o,kind:o.thing,x:x+i*(o.dx??8),y:y+j*(o.dy??8)},`${id}-${i}-${j}`);return;
   }
   switch(o.kind){
    case 'Floor':geom(id,x,y,w,Infinity,'Floor');break;
    case 'Ceiling':geom(id,x,88,w,8,'Brick');break;
    case 'Brick':case 'Block':case 'Stone':case 'CastleBlock':
     if(o.hidden){note(id,'HiddenBlock',x,y,w,h,o);limit('隐藏砖只作定位标记，尚未实现顶出行为。');}
     else geom(id,x,y,w,h,o.kind);
     if(o.contents){note(id+'-item','Contents',x,y,w,h,{contents:o.contents});limit('问号砖和奖励内容为配置标记，未自动实现原版奖励。');}
     if(o.fireballs){note(id+'-fire','Firebar',x,y,8,8,o);limit('火焰棒记录中心、数量与旋转方向，旋转伤害待接入。');}
     break;
    case 'Pipe':geom(id,x,y+(o.height??16),16,o.height??16,'Pipe');if(o.transport!=null)note(id+'-link','PipeRoute',x,y+(o.height??16),16,8,{transport:o.transport},'测试传送入口');if(o.piranha){note(id+'-plant','Piranha',x+4,y+(o.height??16)+12,8,12,o);limit('食人花暂为标记。');}break;
    case 'PipeHorizontal':geom(id,x,y,o.width??16,16,'PipeHorizontal');note(id+'-link','PipeRoute',x,y,o.width??16,16,{transport:o.transport},'测试传送入口');break;
    case 'PipeVertical':geom(id,x,y,16,h,'Pipe');break;
    case 'Tree':geom(id,x,y,o.width??24,8,'Tree','oneway');note(id+'-trunk','TreeTrunk',x+8,y-8,Math.max(1,(o.width??24)-16),Math.max(1,y+8),o,'装饰定位');break;
    case 'Platform':{
      if(o.nocollidechar){note(id,'Platform',x,y,o.width??24,4,o,'仅定位（源声明不与角色碰撞）');break;}
      let motion;
      if(o.sliding)motion={axis:'x',min:o.begin*2,max:o.end*2,speed:.6};
      else if(o.floating)motion={axis:'y',min:208-o.end*2,max:208-o.begin*2,speed:.6};
      geom(id,x,y,o.width??24,4,'Platform','oneway',motion);
      if(motion)limit('往返平台保留范围，速度使用测试值，未认证原版时序。');break;}
    case 'PlatformGenerator':{
      const levels=(o.direction??1)>0?[0,48]:[8,56];
      levels.forEach((v,i)=>geom(id+'-'+i,x,v,o.width??16,4,'Platform','oneway'));
      note(id+'-mechanism','PlatformGenerator',x,88,o.width??16,88,o);limit('循环升降台保留两台初始坐标；循环再生机制待接入。');break;}
    case 'Goomba':case 'Koopa':note(id,o.kind,x,y,8,o.kind==='Koopa'?12:8,o);limit('敌人保留类型、位置与参数，测试中不自动替换成其他敌人。');break;
    case 'Coin':obj(id,'coin',x,y,5,7);note(id,'Coin',x,y,5,7,o,'可收集');break;
    case 'Water':obj(id,'hazard',x,y,w,Math.max(4,16+y));note(id,'Lava',x,y,w,8,o,'矩形危险区');break;
    case 'StartInsideCastle':
      geom(id+'-step-0',x,y+48,24,Infinity,'Stone');geom(id+'-step-1',x+24,y+40,8,Infinity,'Stone');geom(id+'-step-2',x+32,y+32,8,Infinity,'Stone');if(w>40)geom(id+'-floor',x+40,y+24,w-40,Infinity,'Floor');break;
    case 'EndOutsideCastle':geom(id+'-base',x,y+8,8,8,'Stone');note(id+'-flag','Flagpole',x+3,y+80,2,80,o);note(id+'-castle','Castle',x+(o.large?24:32),40,40,40,o);obj(id+'-exit','exit',x-8,y+88,8,88);limit('终点使用测试完成区；拉旗与进城演出待接入。');break;
    case 'EndInsideCastle':
      geom(id+'-ceiling',x,y+88,256,8,'Stone');obj(id+'-lava','hazard',x,y,104,16);
      geom(id+'-bridge',x,y+24,104,4,'Bridge');geom(id+'-floor',x+104,y,152,Infinity,'Floor');geom(id+'-post',x+104,y+32,24,32,'Stone');geom(id+'-top',x+112,y+80,16,24,'Stone');
      note(id+'-boss','Bowser',x+69,y+42,16,18,o);note(id+'-axe','Axe',x+104,y+40,8,8,o);note(id+'-chain','Chain',x+96,y+32,8,8,o);note(id+'-npc','NPC',x+200,13,8,13,o);obj(id+'-exit','exit',x+180,64,8,64);limit('桥、Boss、斧头与NPC位置已记录，Boss战和断桥演出待实现。');break;
    case 'WarpWorld':o.warps.forEach((to,i)=>{geom(id+'-pipe-'+i,x+8+i*32,24,16,24,'Pipe');note(id+'-warp-'+i,'Warp',x+8+i*32,40,16,16,{target:to+'-1'});});limit('跳关管道仅保留布局；其他世界模板未就绪，不连接假地图。');break;
   }
  }
  r.ops.forEach((o,i)=>{const before=[m.geometry.length,m.objects.length,m.annotations.length];expand(o,'ref-'+String(i+1).padStart(3,'0'));m.coverage.push({op:i+1,kind:o.kind,geometry:m.geometry.length-before[0],objects:m.objects.length-before[1],annotations:m.annotations.length-before[2]});});
  const spawn=(id,s)=>m.objects.push({id,kind:'spawn',x:s.x*2,y:208-s.floorY*2-24,w:12,h:24});spawn('start',r.spawn);(r.extraSpawns||[]).forEach(s=>spawn(s.id,s));
  r.links.forEach((l,i)=>obj('portal-'+i,'portal',l.x,l.y+l.height,l.width,l.height,{targetRoom:l.target,targetSpawn:l.spawn}));
  // Preserve source positions; no automatic flattening, gap filling, or reachable-map claim.
  result.rooms.push(m);
 }
 return result;
}
export function compileAll(data){if(data?.schemaVersion!==1||!Array.isArray(data.maps)||new Set(data.maps.map(x=>x.id)).size!==data.maps.length)throw Error('Invalid reference collection');return data.maps.map(compileReference);}
export function makeExtensions(compiled){
 const characters=[{id:'atlas-runner',title:'地图测试 · 单跳',driver:'platform-v1',capabilities:['jump','attack','platform-drop'],motion:{speed:2.4,acceleration:.22,gravity:.3,jumpSpeed:6.2,maxFall:6,width:12,height:24,maxHealth:3},appearance:{body:'#f7f5ed',accent:'#ed263d',shape:'runner'},audio:null,note:'几何测试角色；不代表马里奥或其他原角色的手感与素材。'}, {id:'atlas-scout',title:'地图测试 · 二段跳',driver:'platform-v1',capabilities:['jump','double-jump','attack','platform-drop'],motion:{speed:2.4,acceleration:.22,gravity:.3,jumpSpeed:6.2,maxFall:6,width:12,height:24,maxHealth:3},appearance:{body:'#bdd8d4',accent:'#ed263d',shape:'scout'},audio:null,note:'二段跳仅用于探索底图；不是正式角色适配结果。'}];
 const pack={schemaVersion:1,maps:[],characters,stages:[],audio:[{id:'atlas-silent',music:null,events:{jump:null,attack:null,pickup:null,hurt:null,death:null,checkpoint:null,complete:null,portal:null},note:'无新增原版音频；事件槽供审核后的资源接入。'}]};
 for(const c of compiled){
  for(const r of c.rooms)pack.maps.push({id:r.id,title:c.id+' · '+r.title,width:r.width,height:r.height,tileSize:16,provenance:{kind:'transcribed',source:'FullScreenMario / umaim/Mario @ '+c.source.commit.slice(0,12),review:'pending',note:'公开复刻坐标转录；原版逐格/机关时序复验待完成。敌人与机关标记详见模板 data/generated。'},geometry:r.geometry.map(({type,...g})=>g),objects:clone(r.objects)});
  pack.stages.push({id:'atlas-'+c.id,title:c.id+' · 参考底图（开发）',driver:'platform-v1',status:'draft',entryRoom:c.entryRoom,entrySpawn:'start',rooms:Object.fromEntries(c.rooms.map(r=>[r.room,r.id])),characters:characters.map(x=>x.id),requiredCapabilities:['jump'],overlays:{},audio:'atlas-silent',note:'底图与正式玩法分开：可检验地形/房间连接，敌人/奖励/机关以模板说明为准。'});
 }
 return pack;
}
export function tiledMap(room){
 let id=1;const group=(name,objects)=>({id:id++,type:'objectgroup',name,visible:true,opacity:1,draworder:'topdown',objects:objects.map(o=>({id:id++,name:o.id,type:o.type||o.kind||'solid',x:o.x,y:o.y,width:o.w,height:o.h,rotation:0,visible:true,properties:[{name:'sourceId',type:'string',value:o.id},{name:'collision',type:'string',value:o.collision||'marker'}]}))});
 const layers=[group('collision',room.geometry),group('gameplay',room.objects),group('reference-markers',room.annotations)];
 return{type:'map',version:'1.10',orientation:'orthogonal',renderorder:'right-down',infinite:false,width:Math.ceil(room.width/16),height:15,tilewidth:16,tileheight:16,tilesets:[],layers,nextobjectid:id+1,nextlayerid:id+2,properties:[{name:'scope',type:'string',value:'Object-layer export for editing/reference. Tiled reimport is not implemented.'}]};
}
