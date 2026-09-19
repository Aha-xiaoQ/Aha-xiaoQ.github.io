export const flagRestY=marker=>marker.y-168;
import {sourceKey,sourcePixels,sourceGroups} from './source-art.mjs';
export const enemyTypes={beetleshell:'BeetleShell',shell:'Shell',hammer:'Hammer',spinyegg:'SpinyEgg',bowserfire:'BowserFire',goomba:'Goomba',koopa:'Koopa',piranha:'Piranha',bowser:'Bowser',beetle:'Beetle',cheepcheep:'CheepCheep',blooper:'Blooper',lakitu:'Lakitu',hammerbro:'HammerBro',podoboo:'Podoboo',spiny:'Spiny',bulletbill:'BulletBill'};
export const enemyLabels={'enemy-goomba':'栗宝宝','enemy-koopa':'乌龟','enemy-piranha':'食人花','enemy-bowser':'库巴','enemy-beetle':'钢盔龟','enemy-cheepcheep':'飞鱼','enemy-blooper':'鱿鱿','enemy-lakitu':'朱盖木','enemy-hammerbro':'锤子兄弟','enemy-podoboo':'火焰泡泡'};
export function enemySprite(kind,setting='',source={}){const type=enemyTypes[kind?.replace('enemy-','').replace('marker-','').toLowerCase()]||(kind==='walker'?'Goomba':null);return type?sourceKey('Character',type,[setting,source.smart?'smart':'',source.jumping||source.floating?'jumping':'',source.red?'red':'',source.frame||''].join(' ').trim()):null;}
const materialTypes={cloud:'Cloud1',ground:'Floor',brick:'Brick',block:'Block',stone:'Stone',platform:'Platform',pipe:'Pipe','pipe-side':'PipeHorizontal',tree:'TreeTop',shroom:'ShroomTop',bridge:'BridgeBase',coral:'Coral',cannon:'Cannon',castle:'CastleBlock',spring:'Springboard',decoration:'Bush1'};
export function sourceType(room,q){const s=room.semantics?.find(s=>s.id===(q.sourceId||q.id)),kind=s?.kind||s?.type;if(q.material)return materialTypes[q.material]||null;return ({Ceiling:'Brick',ScalePlatform:'Platform',PipeVertical:'Pipe'})[kind]||kind||(q.collision==='oneway'?'Platform':q.y>=room.map.height-32?'Floor':null);}
export function materialFor(room,q){const kind=sourceType(room,q);return Object.keys(materialTypes).find(k=>materialTypes[k]===kind)||null;}
const part=(group,type,setting,p,x,y,w,h)=>({name:sourceKey(group,type,setting,p),x,y,w,h});
// Join only authored brush strips; reference macro objects keep their identity.
export function platformSpan(room,q){
 if(!['tree','shroom'].includes(q.material))return q;
 let x=q.x,end=q.x+q.w,changed=true;
 while(changed){changed=false;for(const a of room.map.geometry){if(a.material!==q.material||a.y!==q.y||a.h!==q.h||a.motion)continue;if(a.x<=end&&a.x+a.w>=x){const l=Math.min(x,a.x),r=Math.max(end,a.x+a.w);if(l!==x||r!==end){x=l;end=r;changed=true;}}}}
 return {...q,x,w:end-x};
}
export function terrainParts(room,q){
 const type=sourceType(room,q),s=room.setting||'',{x,y,w,h}=q;
 if(type==='Cloud1')return [part('Scenery','Cloud1',s,'',x,y,w,h)];
 if(type==='CastleBridge')return [part('Solid',type,s,'',x,y,w,Math.min(16,h))];
 if(type==='Platform')return [part('Solid',type,s,'',x,y,w,Math.min(8,h))];
 if(!type||!sourceGroups.Solid.includes(type))return [];
 if(type==='TreeTop'||type==='ShroomTop'){
  const span=platformSpan(room,q),parts=[];
  for(let xx=x;xx<x+w;xx+=16){const piece=xx===span.x?'left':xx+16>=span.x+span.w?'right':'middle';parts.push(part('Solid',type,s,piece,xx,y,Math.min(16,x+w-xx),Math.min(16,h)));}return parts;
 }
 if(type==='Pipe')return [part('Solid',type,s,'middle',x,y,w,h),part('Solid',type,s,'top',x,y,w,Math.min(16,h))];
 if(type==='Cannon')return [part('Solid',type,s,'middle',x,y,w,h),part('Solid',type,s,'top',x,y,w,Math.min(32,h))];
 if(type==='Springboard')return [part('Solid',type,s,'middle',x,y,w,h),part('Solid',type,s,'top',x,y,w,4),part('Solid',type,s,'bottom',x,y+h-4,w,4)];
 return [part('Solid',type,s,'',x,y,w,h)];
}
export function markerParts(room,o){
 const setting=room.setting||'',q=o.source||{},parts=[],add=(g,t,p,x,y,w,h)=>{const name=sourceKey(g,t,setting,p),d=sourcePixels(name);parts.push({name,x,y,w:w??d.w,h:h??d.h});};
 const enemy=enemySprite(o.kind==='marker-Bowser'?'enemy-bowser':o.kind,setting,q);
 if(enemy){const d=sourcePixels(enemy);parts.push({name:enemy,x:o.x+(o.kind==='enemy-piranha'?8:0),y:o.y-(o.kind==='enemy-piranha'?d.h:0),w:d.w,h:d.h});return parts;}
 if(o.kind==='decorative-trunk'){
  const original=room.map.geometry.find(g=>g.id===o.id.replace(/-trunk$/,''));if(!original)return [];const base=platformSpan(room,original);if(original.x!==base.x)return [];
  const shroom=q.macro==='Shroom',w=shroom?16:Math.max(8,base.w-32),x=base.x+(base.w-w)/2,y=base.y+base.h;
  const center=base.x+base.w/2,bottom=room.map.geometry.filter(g=>g.y>=y&&g.x<=center&&g.x+g.w>center&&!['TreeTop','ShroomTop'].includes(sourceType(room,g))).reduce((n,g)=>Math.min(n,g.y),room.map.height);
  add('Scenery',shroom?'ShroomTrunk':'TreeTrunk',shroom?'middle':'',x,y,w,Math.max(0,Math.min(bottom-y,base.stemHeight??Infinity)));
 }else if(['water-volume','lava-volume','lava-art'].includes(o.kind)){
  const s=/lava/.test(o.kind)?'Castle':setting,name=sourceKey('Scenery','Water',s,'top'),d=sourcePixels(name),y=o.y;
  parts.push({name,x:o.x,y,w:2*(q.width||8),h:d.h},{name:sourceKey('Scenery','Water',s,'middle'),x:o.x,y:y+d.h,w:2*(q.width||8),h:Math.max(0,room.map.height-y-d.h)});
 }else if(o.kind==='rotating-firebar'){const angle=((q.speed??1)<0?-.25:.25)*Math.PI+Math.floor((room.tick||0)/Math.max(1,Math.round(7/Math.abs(q.speed||1))))*.07*Math.PI*((q.speed??1)<0?-1:1)*(q.direction||-1);for(let n=0;n<(q.fireballs||6);n++)add('Character','CastleFireball','',o.x+4+Math.cos(angle)*n*8,o.y+4+Math.sin(angle)*n*8);}
 else if(o.kind==='bridge-axe-finish'||o.kind==='marker-CastleAxe')add('Solid','CastleAxe','',o.x,o.y);
 else if(o.kind==='marker-CastleChain')add('Solid','CastleChain','',o.x,o.y);
 else if(o.kind==='castle-finish')add('Scenery',q.npc||'Toad','',o.x+400,182);
 else if(o.kind==='marker-Toad'||o.kind==='marker-Peach')add('Scenery',q.thing,'',o.x,o.y);
 else if(o.kind==='platform-generator'){for(const lift of elevatorPlatforms(o,room.map.height))add('Solid','Platform','',lift.x,lift.y,lift.w,lift.h);}
 else if(o.kind==='noncolliding-platform'){add('Solid','Platform','',o.x,Math.min(room.map.height-16,o.y),2*(q.width||24),8);}
 else if(o.kind==='coupled-scale'&&q.macro==='Scale'){const geometry=room.playGeometry||room.map.geometry,l=geometry.find(g=>g.id===o.id+'-left'),r=geometry.find(g=>g.id===o.id+'-right');if(l?.scaleBroken)return [];const left=l?l.x+l.w/2:o.x,right=r?r.x+r.w/2:o.x+2*(q.between??40);add('Scenery','String','',left,o.y,2,Math.max(0,(l?.y??o.y+2*(q.dropLeft??24))-o.y));add('Scenery','String','',right,o.y,2,Math.max(0,(r?.y??o.y+2*(q.dropRight??24))-o.y));add('Scenery','String','',left,o.y,right-left,2);}
 else if(o.kind==='flagpole-finish'){add('Scenery','FlagPole','',o.x+7,o.y-168,2,152);add('Scenery','FlagTop','',o.x+4,o.y-176);add('Scenery','Flag','',o.x-8,room.finish?.flagY??flagRestY(o));}
 return parts.filter(p=>p.w>0&&p.h>0);
}
export function referenceEnemies(room){return (room.markers||[]).flatMap(o=>{if(!enemySprite(o.kind==='marker-Bowser'?'enemy-bowser':o.kind,room.setting,o.source))return [];const q=markerParts(room,o)[0];return q?[{id:o.id,kind:'walker',x:q.x,y:q.y,w:q.w,h:q.h}]:[];});}

export function promoteEnemies(room){if(room.enemiesEditable)return;room.enemySkins??={};const ids=new Set(room.map.objects.map(q=>q.id));for(const q of referenceEnemies(room)){if(ids.has(q.id)||q.x<0||q.y<0||q.x+q.w>room.map.width||q.y+q.h>room.map.height)continue;room.map.objects.push(q);room.enemySkins[q.id]=room.markers.find(m=>m.id===q.id).kind;}room.enemiesEditable=true;}

// Stable depth: small adjoining pipe mouths sit behind the tall upright pipe.
export function orderedTerrain(room,geometry=room.map?.geometry||[]){return [...geometry].sort((a,b)=>{const ap=/^Pipe/.test(sourceType(room,a)||''),bp=/^Pipe/.test(sourceType(room,b)||'');return Number(ap)-Number(bp)||(ap&&bp?a.h-b.h:0);});}
// Composite scenery uses the same native pieces and coordinates as reference macros.
export function castleParts(room){
 const parts=[],setting=room.setting||'';
 const add=(type,x,y)=>{const name=sourceKey('Scenery',type,setting),d=sourcePixels(name);parts.push({name,x,y,w:d.w,h:d.h});};
 const small=(x,f)=>{for(const dx of [0,16,48,64]){add('BrickHalf',x+dx,f-8);for(const dy of [24,40])add('BrickPlain',x+dx,f-dy);}for(let i=0;i<5;i++)add(i===0||i===4?'CastleRailing':'CastleRailingFilled',x+16*i,f-48);for(let i=1;i<4;i++)add('CastleRailing',x+16*i,f-80);add('CastleTop',x+16,f-72);add('CastleTop',x+40,f-72);add('CastleDoor',x+32,f-40);};
 const large=(x,f,walls=2)=>{small(x+32,f-96);for(let i=0;i<2;i++)add('CastleWall',x+i*16,f-96);for(let i=0;i<3;i++){add('CastleDoor',x+32+i*32,f-40);for(let j=0;j<2;j++){add('BrickPlain',x+32+i*32,f-56-j*16);add('BrickHalf',x+32+i*32,f-80-j*8);}}for(let i=0;i<2;i++){for(let j=0;j<3;j++)add('BrickPlain',x+48+i*32,f-16-j*16);add('CastleDoor',x+48+i*32,f-88);}for(let i=0;i<5;i++)add('CastleRailingFilled',x+32+i*16,f-96);for(let i=0;i<walls;i++)add('CastleWall',x+112+i*16,f-96);};
 for(const m of room.markers||[]){const q=m.source||{};if(q.macro==='CastleSmall')small(m.x,m.y);else if(q.macro==='CastleLarge')large(m.x,m.y,q.walls??2);else if(m.kind==='flagpole-finish'){const x=m.x+2*(q.castleDistance||(q.large?24:32));if(q.large)large(x,m.y,q.walls||8);else small(x,m.y);}}
 if(room.map?.id?.startsWith('classic-1-1-live-0')&&!room.markers?.some(m=>m.kind==='flagpole-finish')){const e=room.map.objects.find(o=>o.kind==='exit');if(e)small(e.x+64,e.y+e.h);}
 return parts;
}

export function elevatorPlatforms(marker,height=240){const q=marker.source||{},direction=q.direction||1;return (direction>0?[0,48]:[8,56]).map((level,i)=>({id:marker.id+'-lift-'+i,x:marker.x,y:height-32-level*2,w:2*(q.width||16),h:8,material:'platform',collision:'oneway',liftSpeed:direction*.84}));}
