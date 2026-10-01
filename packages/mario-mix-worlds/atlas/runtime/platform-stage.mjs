/** Small playable contract driver, NOT a migration of Terraria combat or inventory.
 * Shared host/audio/input/render ports; maps and character profiles are injected.
 * Supports rooms, checkpoints, one-time coins/rewards, walkers, hazards and exit.
 */
export function createPlatformStage({plan,motor,emit}) {
  const copy=x=>JSON.parse(JSON.stringify(x));
  let roomId=plan.stage.entryRoom,p=null,tick=0,health=plan.character.motion.maxHealth,lives=3,coins=0,score=0,invulnerable=0,cooldown=0,attackAge=0,portalLock=0,disposed=false,prev={},completed=false,cam=0,roomSerial=0;
  let checkpoint={roomId,spawnId:plan.stage.entrySpawn};const roomStates=new Map();
  const character=plan.character;
  function stateFor(id){if(!roomStates.has(id))roomStates.set(id,{geometry:copy(plan.rooms[id].geometry).map(q=>({...q,dir:1,dx:0,dy:0})),taken:new Set(),enemies:plan.rooms[id].objects.filter(q=>q.kind==='walker').map(q=>({...q,vx:-.5,vy:0,hp:2,homeX:q.x,dead:false}))});return roomStates.get(id);}
  function enter(id,spawn){const o=plan.rooms[id].objects.find(q=>q.kind==='spawn'&&q.id===spawn);if(!o)throw Error('Spawn missing');roomId=id;roomSerial++;stateFor(id);p=motor.create(character,o);portalLock=24;prev={};cam=0;emit('room',{roomId});}
  function respawn(){lives--;if(lives<=0){completed=true;emit('complete',{result:'failed',coins,score});return;}enter(checkpoint.roomId,checkpoint.spawnId);health=character.motion.maxHealth;invulnerable=90;emit('sound',{event:'death'});}
  function hurt(){if(invulnerable||completed)return;health--;invulnerable=60;emit('sound',{event:'hurt'});if(health<=0)respawn();}
  enter(roomId,plan.stage.entrySpawn);
  function step(raw={}){
    if(disposed||completed)return;tick++;if(invulnerable)invulnerable--;if(cooldown)cooldown--;if(attackAge)attackAge--;if(portalLock)portalLock--;
    const v={x:Math.max(-1,Math.min(1,Number(raw.x)||0)),down:!!raw.down,jumpPressed:!!raw.jump&&!prev.jump,attackPressed:!!raw.attack&&!prev.attack,interactPressed:!!raw.interact&&!prev.interact};prev={...raw};
    const r=stateFor(roomId),map=plan.rooms[roomId],before=roomSerial;
    for(const q of r.geometry){q.dx=q.dy=0;if(q.motion){const {axis,min,max,speed}=q.motion,old=q[axis];q[axis]=Math.max(min,Math.min(max,old+speed*q.dir));if(q[axis]>=max||q[axis]<=min)q.dir*=-1;q[axis=== 'x'?'dx':'dy']=q[axis]-old;}}
    for(const event of motor.step(p,v,character,{solids:r.geometry,width:map.width}))emit('sound',{event});
    if(p.y>map.height+40){respawn();return;}
    if(v.attackPressed&&!cooldown&&character.capabilities.includes('attack')){attackAge=9;cooldown=18;emit('sound',{event:'attack'});const box={x:p.facing>0?p.x+p.w:p.x-28,y:p.y-2,w:28,h:p.h+4};for(const e of r.enemies)if(!e.dead&&motor.overlap(box,e)){e.hp--;if(e.hp<=0){e.dead=true;score+=100;}}}
    for(const e of r.enemies){if(e.dead)continue;e.x+=e.vx;if(Math.abs(e.x-e.homeX)>48)e.vx*=-1;const bottom=e.y+e.h;e.vy=Math.min(5,e.vy+.3);e.y+=e.vy;for(const q of r.geometry)if(e.x+e.w>q.x&&e.x<q.x+q.w&&bottom<=q.y+1&&e.y+e.h>=q.y&&e.vy>=0){e.y=q.y-e.h;e.vy=0;break;}if(e.y>map.height+40)e.dead=true;if(!e.dead&&motor.overlap(p,e)){hurt();if(roomSerial!==before||completed)return;}}
    for(const o of map.objects){if(!motor.overlap(p,o))continue;
      if(o.kind==='coin'&&!r.taken.has(o.id)){r.taken.add(o.id);coins++;score+=10;emit('sound',{event:'pickup'});}
      if(o.kind==='hazard'){hurt();if(roomSerial!==before||completed)return;}
      if(o.kind==='checkpoint'&&!r.taken.has(o.id)){r.taken.add(o.id);checkpoint={roomId,spawnId:o.targetSpawn};emit('sound',{event:'checkpoint'});}
      if(o.kind==='portal'&&!portalLock&&v.interactPressed){enter(o.targetRoom,o.targetSpawn);emit('sound',{event:'portal'});return;}
      if(o.kind==='exit'){completed=true;emit('sound',{event:'complete'});emit('complete',{result:'cleared',coins,score});return;}
    }
    cam=Math.max(0,Math.min(map.width-256,p.x-100));
  }
  function view(){const map=plan.rooms[roomId],r=stateFor(roomId);return{roomId,title:plan.stage.title,character:copy(character),p:{...p},width:map.width,height:map.height,geometry:copy(r.geometry),objects:map.objects.filter(o=>!r.taken.has(o.id)&&o.kind!=='walker').map(copy),enemies:r.enemies.filter(e=>!e.dead).map(copy),tick,health,lives,coins,score,cam,invulnerable,attackAge,completed,checkpoint:{...checkpoint},disposed};}
  return Object.freeze({step,view,dispose(){disposed=true;roomStates.clear();},pause(){prev={};},resume(){prev={};}});
}
