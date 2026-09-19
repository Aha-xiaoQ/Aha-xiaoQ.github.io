import {assembleArea} from './section-assembly.mjs';
/** Worlds 2–8: data-only geometry/section transcription adapter.
 * Never evaluates reference JavaScript. Section parts retain local coordinates;
 * underwater / coupled mechanics remain explicit contracts, not fake platform gameplay.
 */
const copy=x=>JSON.parse(JSON.stringify(x));
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const fail=m=>{throw Error(m);};
const FLOOR=208,HEIGHT=240;
const defaults={Coin:[5,7],Koopa:[8,12],Beetle:[8,8.5],HammerBro:[8,12],Blooper:[8,12],CheepCheep:[8,8],Coral:[8,8],Platform:[24,4],PipeVertical:[16,8],PipeHorizontal:[19.5,16],Springboard:[8,14.5],Cannon:[8,8],Stone:[8,8],Brick:[8,8],Block:[8,8],CastleBlock:[8,8],Goomba:[8,8],Bowser:[16,16],Podoboo:[8,8],Lakitu:[8,12]};
const scenery=new Set(['CastleWall','PlantSmall','PlantLarge','Cloud1','Cloud2','Cloud3','Fence','DecorativeBack','DecorativeDot','CustomText']);
const enemies=new Set(['Koopa','Goomba','Beetle','HammerBro','Blooper','CheepCheep','Podoboo','Lakitu','Bowser','Piranha']);
const stage=(level,r,i)=>({id:i===0?`template-${level}`:`inspect-${level}-${r.roomId}`,title:`${level} · ${r.label}（地形检查）`,driver:'platform-v1',status:'draft',entryRoom:r.roomId,entrySpawn:'inspection-start',rooms:{[r.roomId]:r.map.id},characters:['lab-runner','lab-scout'],requiredCapabilities:['jump'],overlays:{},audio:'map-kit-silent',note:'分区几何检查，不是整关通关。原房间连接、条件循环与未实现机制保留在模板 topology / coverage；静态机关只用于检查位置。'});
function countRecords(input){let n=0;for(const a of input.areas){n+=a.creation.length;for(const s of a.sections||[])for(const p of ['before','stretch','after'])n+=s[p]?.creation?.length||0;}return n;}
export function compileRemaining(reference,level){
 if(reference?.schemaVersion!==1||!Array.isArray(reference.maps)||! /^[2-8]-[1-4]$/.test(level))fail('Template unavailable: '+level);
 const input=reference.maps.find(x=>x.name===level);if(!input)fail('Template unavailable: '+level);
 if(!Array.isArray(input.areas)||!Array.isArray(input.locations)||input.areas.length>32)fail('Invalid source areas');
 const views=[],rooms=[],details=[],topology={locations:copy(input.locations),areas:[],links:[],issues:[]};
 input.areas.forEach((a,ai)=>{
  if(!Array.isArray(a.creation)||a.creation.length>4000)fail('Invalid creation');
  const assembled=a.sections?.length?assembleArea(a):null;
  views.push({area:a,areaIndex:ai,records:assembled?.records||a.creation,roomId:`area-${ai}`,label:`区域 ${ai+1}`+(assembled?' · 完整展开（通过路线）':''),origin:{area:ai,part:'base'},assembly:assembled?.segments,width:a.widthUnits});
  topology.areas.push({area:ai,setting:a.setting,underwater:!!a.underwater,exit:a.exit??null,sections:copy(a.sections||[])});
  for(const [si,s]of (a.sections||[]).entries())for(const p of ['before','stretch','after'])if(s[p]){
   if(!Array.isArray(s[p].creation)||s[p].creation.length>4000)fail('Invalid section part');
   views.push({area:a,areaIndex:ai,records:s[p].creation,roomId:`area-${ai}-section-${si}-${p}`,label:`区域 ${ai+1} / 段 ${si+1} / ${p}`,origin:{area:ai,section:si,part:p},width:s[p].width});
  }
 });
 for(const v of views){
  const geometry=[],objects=[],markers=[],semantics=[];let extent=Math.max(128,v.width||0)*2,emitted=0;
  function mark(q,key,kind){const m={id:key,kind,source:copy(q),sourcePath:{...v.origin,record:key.split('-')[0]},x:2*(q.x||0),y:FLOOR-2*(q.y||0)};markers.push(m);details.push({roomId:v.roomId,sourceRecord:key,kind});}
  function rectangle(q,key,kind,w=8,h=8,top=q.y||0,collision='solid'){
   let x=2*(q.x||0),y=FLOOR-2*top,ww=2*w,hh=h===Infinity?HEIGHT-y:2*h;
   if(![x,y,ww,hh].every(Number.isFinite)||x<0||ww<=0||hh<=0||x+ww>32768)fail(`Invalid geometry ${level}/${v.roomId}/${key}`);
   // NES 4-4 upper corridor has no gap at the before/stretch seam.
   if(level==='4-4'&&kind==='Stone'&&y===96&&ww===272&&hh===64&&((v.origin.part==='base'&&x===704)||(v.origin.section===0&&v.origin.part==='before'&&x===448)))ww+=80;
   extent=Math.max(extent,x+ww);
   const unclipped={x,y,w:ww,h:hh};
   if(y<0||y+hh>HEIGHT){mark(q,key+'-clip','viewport-clipping');hh=Math.min(HEIGHT,y+hh)-Math.max(0,y);y=Math.max(0,y);}
   if(hh<=0)return null;
   const g={id:key,x,y,w:ww,h:hh,collision};geometry.push(g);semantics.push({id:key,kind,source:copy(q),referenceRect:unclipped});return g;
  }
  function connection(q,key){
   if(own(q,'transport')){topology.links.push({from:{...v.origin,record:key},kind:typeof q.transport==='object'?'world':'location',target:copy(q.transport)});if(typeof q.transport==='number'&&!input.locations[q.transport])fail('Invalid location target '+q.transport);mark(q,key+'-transport','source-transport-not-simulated');}
   if(Array.isArray(q.contents)&&q.contents[0]==='Vine'){topology.links.push({from:{...v.origin,record:key},kind:'vine',target:copy(q.contents[1]||{})});mark(q,key+'-vine','vine-transition');}
  }
  function thing(q,key){
   const k=q.thing,def=defaults[k]||[8,8];
   connection(q,key);
   if(enemies.has(k)){mark(q,key,'enemy-'+k.toLowerCase());return;}
   if(scenery.has(k)){mark(q,key,'decorative-'+k);return;}
   if(['Brick','Block','Stone','CastleBlock','Cannon','Coral'].includes(k)){
    if(q.hidden){mark(q,key,'hidden-block');return;}
    rectangle(q,key,k,q.width??def[0],q.height==='Infinity'?Infinity:q.height??def[1]);
    if(q.contents)mark(q,key+'-contents','block-contents');
    if(q.fireballs)mark(q,key+'-fire','rotating-firebar');
    if(k==='Cannon')mark(q,key+'-fire','cannon-fire');return;
   }
   if(k==='PipeVertical'||k==='PipeHorizontal'){
    rectangle(q,key,k,q.width??def[0],q.height==='Infinity'?Infinity:q.height??def[1]);
    if(k==='PipeHorizontal'&&!own(q,'transport')){topology.issues.push({roomId:v.roomId,sourceRecord:key,kind:'horizontal-pipe-without-transport'});mark(q,key+'-target','missing-source-transport');}return;
   }
   if(k==='Platform'){
    if(q.nocollidechar){mark(q,key,'noncolliding-platform');return;}
    const g=rectangle(q,key,k,q.width??24,q.height??4,q.y||0,'oneway');
    if(q.falling||q.transport||q.inScale)mark(q,key+'-motion',q.falling?'falling-platform':q.inScale?'coupled-scale':'ride-platform');
    else if(q.sliding||q.floating){
     const axis=q.sliding?'x':'y',min=axis==='x'?2*q.begin:FLOOR-2*q.end,max=axis==='x'?2*q.end:FLOOR-2*q.begin;
     if(g&&Number.isFinite(min)&&Number.isFinite(max)&&min>=0&&max>min&&g[axis]>=min&&g[axis]<=max&&(axis==='x'||max+g.h<=HEIGHT)){
      g.motion={axis,min,max,speed:.75};if(axis==='x')extent=Math.max(extent,max+g.w);
     }else mark(q,key+'-range','source-platform-range-review');
     mark(q,key+'-timing','platform-timing');
    }return;
   }
   if(k==='Coin'){
    const o={id:key,kind:'coin',x:2*(q.x||0),y:FLOOR-2*(q.y||0),w:10,h:14};
    if(o.x>=0&&o.y>=0&&o.y+o.h<=HEIGHT){objects.push(o);extent=Math.max(extent,o.x+o.w);}else mark(q,key,'coin-outside-viewport');return;
   }
   if(k==='Springboard'){rectangle(q,key,k,q.width??8,q.height??14.5);mark(q,key+'-spring','springboard');return;}
   if(['ScrollBlocker','ScrollEnabler','CastleAxe','CastleChain','Toad','Peach'].includes(k)){mark(q,key,'marker-'+k);return;}
   fail('Unsupported reference thing '+k);
  }
  function expand(q,key){
   if(++emitted>25000||!q||typeof q!=='object'||Array.isArray(q))fail('Invalid/excessive placements');
   for(const k of ['x','y','width','height'])if(own(q,k)&&!(k==='height'&&q[k]==='Infinity')&&(!Number.isFinite(q[k])||Math.abs(q[k])>16384))fail('Invalid coordinate '+k);
   for(const k of ['Piranha','yum','Yheight'])if(own(q,k)){mark(q,key+'-attribute-'+k.toLowerCase(),'source-attribute-review');topology.issues.push({roomId:v.roomId,sourceRecord:key,kind:'source-attribute-review',field:k});}
   if(q.thing&&!q.macro)return thing(q,key);
   const x=q.x||0,y=q.y||0;
   switch(q.macro){
    case 'Fill':{
     const def=defaults[q.thing]||[8,8],nx=q.xnum??1,ny=q.ynum??1,dx=q.xwidth??def[0],dy=q.yheight??def[1];
     if(!Number.isSafeInteger(nx)||!Number.isSafeInteger(ny)||nx<1||ny<1||nx*ny>5000||!Number.isFinite(dx)||!Number.isFinite(dy)||!dx||!dy)fail('Invalid Fill');
     const t={...q};for(const k of ['macro','xnum','ynum','xwidth','yheight'])delete t[k];
     for(let ix=0;ix<nx;ix++)for(let iy=0;iy<ny;iy++)thing({...t,x:x+ix*dx,y:y+iy*dy},`${key}-${ix}-${iy}`);break;
    }
    case 'Floor':rectangle(q,key,'Floor',q.width??8,Infinity);break;
    case 'Ceiling':{
     const w=q.width??8;const n=Math.max(1,Math.floor(w/8)); // upstream Fill treats zero count as one
     if(w%8!==0)mark(q,key+'-width','source-ceiling-width-review');
     rectangle(q,key,'Ceiling',n*8,8,88);break;
    }
    case 'Pipe':{
     const inf=q.height==='Infinity',h=q.height??8;
     thing({...q,macro:undefined,thing:'PipeVertical',y:inf?y:y+h,width:16,height:inf?'Infinity':h},key);
     if(q.piranha)mark({...q,y:inf?y:y+h},key+'-plant','enemy-piranha');break;
    }
    case 'Tree':case 'Shroom':rectangle(q,key,q.macro+'Top',q.width??24,8);mark(q,key+'-trunk','decorative-trunk');break;
    case 'Bridge':{
     let w=Math.max(q.width??0,16),xx=x;
     if(q.begin){w-=8;rectangle({...q,x:xx},key+'-left','Stone',8,Infinity);xx+=8;}
     if(q.end){w-=8;rectangle({...q,x:xx+w},key+'-right','Stone',8,Infinity);}
     if(w>0)rectangle({...q,x:xx},key+'-base','BridgeBase',w,4);
     break;
    }
    case 'Scale':{
     const between=q.between??40,dl=q.dropLeft??24,dr=q.dropRight??24,wl=q.widthLeft??24,wr=q.widthRight??24;
     rectangle({x:x-wl/2,y:y-dl},key+'-left','ScalePlatform',wl,4,y-dl,'oneway');
     rectangle({x:x+between-wr/2,y:y-dr},key+'-right','ScalePlatform',wr,4,y-dr,'oneway');
     mark(q,key,'coupled-scale');break;
    }
    case 'StartInsideCastle':
     for(const[a,b,w]of [[0,48,24],[24,40,8],[32,32,8]])rectangle({x:x+a},key+'-'+a,'Stone',w,Infinity,y+b);
     if((q.width??40)>40)rectangle({x:x+40},key+'-floor','Floor',q.width-40,Infinity,y+24);break;
    case 'EndOutsideCastle':rectangle(q,key+'-base','Stone',8,8,y+8);mark(q,key,'flagpole-finish');connection(q,key);break;
    case 'Water':mark(q,key,/(?:Castle)/.test(v.area.setting)?'lava-volume':'water-volume');extent=Math.max(extent,2*(x+(q.width??8)));break;
    case 'EndInsideCastle':{
     rectangle({x,y:y+88},key+'-roof','Stone',256,8);
     rectangle({x,y:y+24},key+'-bridge','CastleBridge',104,8);
     rectangle({x:x+104},key+'-floor','Floor',152,Infinity,y);
     rectangle({x:x+104},key+'-step','Stone',24,32,y+32);
     rectangle({x:x+112},key+'-ceiling','Stone',16,24,y+80);
     mark({thing:'Bowser',x:x+69,y:y+42,...(q.throwing?{throwing:true}:{})},key+'-boss','enemy-bowser');
     mark({macro:'Water',x,y,width:104},key+'-lava','lava-volume');
     mark({thing:'CastleChain',x:x+96,y:y+32},key+'-chain','marker-CastleChain');
     mark({thing:'CastleAxe',x:x+104,y:y+40},key+'-axe','bridge-axe-finish');
     mark(q,key,'castle-finish');connection(q,key);break;
    }
    case 'WarpWorld':{
     if(!Array.isArray(q.warps)||q.warps.length>3)fail('Invalid warp');
     q.warps.forEach((w,i)=>expand({macro:'Pipe',x:x+8+i*32+(q.warps.length===1?32:0),height:24,transport:{map:w+'-1'}},key+'-'+i));break;
    }
    case 'PlatformGenerator':
     mark(q,key,'platform-generator');break;
    case 'CastleSmall':case 'CastleLarge':case 'Pattern':mark(q,key,'decorative-'+q.macro);break;
    case 'Section':case 'SectionPass':case 'SectionFail':case 'SectionDecider':mark(q,key,'conditional-'+q.macro.toLowerCase());topology.links.push({from:{...v.origin,record:key},kind:q.macro,target:copy(q)});break;
    case 'CheepsStart':case 'CheepsStop':case 'BulletBillsStart':case 'BulletBillsStop':case 'LakituStop':mark(q,key,'spawn-zone-'+q.macro);break;
    default:fail('Unsupported reference macro '+q.macro);
   }
  }
  v.records.forEach((q,i)=>expand(q,`r${String(i).padStart(3,'0')}`));
  const width=Math.min(32768,Math.ceil(extent/16)*16),underwater=!!v.area.underwater||/Underwater/.test(v.area.setting);
  if(underwater)mark({x:0,y:88},'environment','underwater-physics');
  if(v.area.sections?.length)mark({x:0,y:88},'section-mode','conditional-section-runtime');
  // Debug spawn is deliberately separate from source entrance information.
  let spawn=null;
  for(let x=24;x<Math.min(width-12,256)&&!spawn;x+=8){
   const floors=geometry.filter(g=>x+12>g.x&&x<g.x+g.w&&g.y>=24).sort((a,b)=>b.y-a.y);
   for(const g of floors){const candidate={id:'inspection-start',kind:'spawn',x,y:g.y-24,w:12,h:24};if(!geometry.some(h=>candidate.x<h.x+h.w&&candidate.x+12>h.x&&candidate.y<h.y+h.h&&candidate.y+24>h.y)){spawn=candidate;break;}}
  }
  if(!spawn)spawn={id:'inspection-start',kind:'spawn',x:24,y:24,w:12,h:24};
  objects.push(spawn);
  const map={id:`classic-${level}-${v.roomId}`,title:`${level} · ${v.label}`,tileSize:16,width,height:HEIGHT,provenance:{kind:'transcribed',source:reference.source.url,review:'pending',note:'固定社区版本的参考转录。分段以局部坐标保存；不代表原作保真验收或完整可玩关卡。'},geometry,objects};
  rooms.push({roomId:v.roomId,label:v.label,...(v.assembly?{assembly:v.assembly}:{}),setting:v.area.setting,origin:v.origin,declaredWidth:v.width??null,underwater,inspectionOnly:true,previewSupported:!underwater,map,markers,semantics,sourceRecordCount:v.records.length});
 }
 const previewRooms=rooms.filter(r=>r.previewSupported),inspectionStages=previewRooms.map((r,i)=>stage(level,r,i));
 return {schemaVersion:2,level,stage:inspectionStages[0]||null,inspectionStages,maps:rooms.map(r=>r.map),rooms,topology,coverage:{placementRecords:countRecords(input),areas:input.areas.length,sectionViews:rooms.length-input.areas.length,views:rooms.length,geometry:rooms.reduce((n,r)=>n+r.map.geometry.length,0),objects:rooms.reduce((n,r)=>n+r.map.objects.length,0),pending:[...new Set(details.map(d=>d.kind))].sort(),details,geometryReview:'reference-transcribed-pending-original-review',playability:'partition-inspection-not-level-completion',underwaterAreas:input.areas.filter(a=>a.underwater||/Underwater/.test(a.setting)).length,sourceIssues:topology.issues.length},source:copy(reference.source)};
}
