import {sourceType,markerParts,elevatorPlatforms,flagRestY} from './map-appearance.mjs';
// Editor-only Mario contact adaptation; host platform driver stays unchanged.
/** Small playable contract driver, NOT a migration of Terraria combat or inventory.
 * Shared host/audio/input/render ports; maps and character profiles are injected.
 * Supports rooms, checkpoints, one-time coins/rewards, walkers, hazards and exit.
 */
export function createPlatformStage({plan,motor,emit,visualRooms=[],initialState=null,manualDeath=false,autoContinue=false,allowWarp=true}) {
  const copy=x=>JSON.parse(JSON.stringify(x));
  let roomId=plan.stage.entryRoom,p=null,tick=0,health=plan.character.motion.maxHealth,lives=3,coins=0,score=0,timeLeft=400,timerTicks=0,invulnerable=0,cooldown=0,attackAge=0,portalLock=0,disposed=false,prev={},completed=false,finish=null,transition=null,shrink=0,growth=0,fireGrowth=0,dying=0,cam=0,roomSerial=0,deathSpot=null,warpTarget=null;
  let checkpoint={roomId,spawnId:plan.stage.entrySpawn};const roomStates=new Map();
  const character=plan.character;
  let stompChain=0;
  function chainReward(r,e,index,values){const points=values[index];if(points===undefined){lives++;emit('sound',{event:'life'});}else score+=points;r.effects.push({kind:'score-pop',text:points===undefined?'1UP':String(points),x:e.x,y:e.y-8,w:24,h:8,vx:0,vy:-.4,flat:true,life:48,age:0});}

  function geometryFor(id){const room=visualRooms.find(r=>r.roomId===id);let result=[];
   for(const g of copy(plan.rooms[id].geometry)){const original=room?.map.geometry.find(q=>q.id===g.id)||g,type=room?sourceType(room,original):null;
    if(['Brick','Block'].includes(type)&&g.w%16===0&&g.h%16===0){for(let y=g.y;y<g.y+g.h;y+=16)for(let x=g.x;x<g.x+g.w;x+=16)result.push({...g,x,y,w:16,h:16,sourceId:g.id,id:g.w===16&&g.h===16?g.id:g.id+'@'+x+','+y,material:type==='Brick'?'brick':'block'});}else result.push({...g,material:original.material||(type==='Springboard'?'spring':type==='Pipe'?'pipe':type==='PipeHorizontal'?'pipe-side':g.material),...(type==='CastleBridge'?{h:Math.min(16,g.h)}:{})});
   }
   for(const m of room?.markers||[])if(m.kind==='hidden-block'&&!result.some(q=>q.x===m.x&&q.y===m.y&&q.w===16))result.push({id:m.id,sourceId:m.id,x:m.x,y:m.y,w:16,h:16,collision:'solid',material:'block',hidden:true});
   for(const m of room?.markers||[])if(m.kind==='platform-generator')result.push(...elevatorPlatforms(m,plan.rooms[id].height));
   return result.map(q=>({...q,dir:1,dx:0,dy:0}));
  }
  function stateFor(id){if(!roomStates.has(id))roomStates.set(id,{geometry:geometryFor(id),effects:[],shots:[],vines:[],items:[],taken:new Set(),hiddenMarkers:(visualRooms.find(r=>r.roomId===id)?.markers||[]).filter(m=>m.kind==='platform-generator').map(m=>m.id),enemies:plan.rooms[id].objects.filter(q=>q.kind==='walker').map(q=>{const room=visualRooms.find(r=>r.roomId===id),marker=room?.markers?.find(m=>m.id===q.id),type=room?.enemySkins?.[q.id]||marker?.kind||'walker';const pipe=/piranha/i.test(type)?geometryFor(id).filter(g=>{const original=room?.map.geometry.find(a=>a.id===(g.sourceId||g.id))||g;return (g.material==='pipe'||sourceType(room||{},original)==='Pipe')&&q.x+q.w>g.x&&q.x<g.x+g.w&&Math.abs(q.y-g.y)<80;}).sort((a,b)=>Math.abs(a.y-q.y)-Math.abs(b.y-q.y))[0]:null;return {...q,...(pipe?{x:pipe.x+(pipe.w-q.w)/2,y:pipe.y,clipTop:pipe.y}:{}),type,source:marker?.source,vx:-.5,vy:0,hp:/bowser/i.test(type)?5:2,homeX:pipe?pipe.x+(pipe.w-q.w)/2:q.x,homeY:pipe?pipe.y-q.h:q.y,dead:false};})});return roomStates.get(id);}
  const contactBox=e=>e.clipTop==null?e:{...e,h:Math.max(0,Math.min(e.h,e.clipTop-e.y))};
  const touches=(a,e)=>{const b=contactBox(e);return b.h>0&&motor.overlap(a,b);};
  function enter(id,spawn){const o=plan.rooms[id].objects.find(q=>q.kind==='spawn'&&q.id===spawn);if(!o)throw Error('Spawn missing');roomId=id;roomSerial++;stompChain=0;stateFor(id);const form=p?{power:p.power,star:p.star}:null;p=motor.create(character,o);if(form){Object.assign(p,form);if(p.power){p.y-=14;p.h=28;}}portalLock=24;prev={};cam=Math.max(0,Math.min(Math.max(0,plan.rooms[id].width-256),p.x-100));emit('room',{roomId});}
  function collectCoin(){coins++;score+=200;emit('sound',{event:'pickup'});if(coins>=100){coins-=100;lives++;emit('sound',{event:'life'});}}
  function respawn(terrain=false){if(dying||completed)return;deathSpot={roomId,x:p.x,y:p.y,power:p.power||0,terrain};lives--;dying=1;p.dying=true;p.vx=0;p.vy=-5.1;emit('sound',{event:'death'});}
  function killEnemy(r,e,flat=false){if(e.dead)return;if(/^(enemy-|marker-)?lakitu$/i.test(e.type)&&!r.lakituStopped)r.lakituRespawn={ticks:960,enemy:copy(e)};e.dead=true;r.effects.push({...e,kind:'enemy-death',clipTop:undefined,flat:flat&&/goomba|walker/i.test(e.type),vx:flat?0:(e.vx||.8),vy:flat?0:-3,life:flat?24:80,age:0});}
  function hurt(){if(invulnerable||p.star||completed||dying)return;if(p.power){p.power=0;p.y+=p.h-14;p.h=14;invulnerable=120;shrink=24;emit('sound',{event:'hurt'});return;}health--;invulnerable=60;if(health<=0)respawn();else emit('sound',{event:'hurt'});}
  enter(roomId,plan.stage.entrySpawn);
  if(initialState){lives=Math.max(1,initialState.lives||3);coins=initialState.coins||0;score=initialState.score||0;p.power=Math.max(0,Math.min(2,initialState.power||0));if(p.power){p.y-=14;p.h=28;}}
  function bump(r,id){
    const q=r.geometry.find(g=>g.id===id),room=visualRooms.find(r=>r.roomId===roomId);if(!q||!room)return;
    const type=sourceType(room,room.map.geometry.find(g=>g.id===(q.sourceId||id))||q);if(!['Brick','Block'].includes(type))return;
    if(q.bump)return;
    if(q.used){emit('sound',{event:'bump'});return;}
    const marker=room.markers?.find(m=>m.x===q.x&&m.y===q.y&&/contents|hidden/.test(m.kind));
    const semantic=room.semantics?.find(m=>m.id===(q.sourceId||id))?.source;
    let content=marker?.source?.contents??semantic?.contents??(type==='Block'?'coin':null);
    if(Array.isArray(content))content=content[0];content=String(content||'').toLowerCase();
    q.hidden=false;q.bump=12;
    for(const e of r.enemies)if(!e.dead&&e.x+e.w>q.x&&e.x<q.x+q.w&&Math.abs(e.y+e.h-q.y)<5)killEnemy(r,e);
    for(const item of r.items)if(!item.dead&&!item.emerge&&item.x+item.w>q.x&&item.x<q.x+q.w&&Math.abs(item.y+item.h-q.y)<5){item.vy=-3;item.vx=(p.x<item.x?1:-1)*.8;}
    if(content==='vine'){
      q.used=true;const portal=plan.rooms[roomId].objects.find(o=>o.id.endsWith('-vine-portal')&&Math.abs(o.x-q.x)<2);
      if(portal)r.vines.push({x:q.x+1,y:q.y,w:14,h:0,bottom:q.y,portal});emit('sound',{event:'appear'});return;
    }
    if(content){
      if(content==='multi'||(type==='Brick'&&content==='coin')){q.remaining??=10;q.remaining--;q.used=q.remaining===0;}else q.used=true;
      if(/coin|multi/.test(content)){collectCoin();r.effects.push({kind:'coin-pop',x:q.x+3,y:q.y-14,w:10,h:14,vx:0,vy:-2.8,life:34,age:0});}
      else {const kind=/life|1up/.test(content)?'life':/star/.test(content)?'star':p.power?'flower':'mushroom';r.items.push({kind,x:q.x+1,y:q.y+1,w:14,h:14,vy:0,vx:kind==='flower'?0:.75,emerge:32,targetY:q.y-14,blockTop:q.y,age:0});emit('sound',{event:'appear'});}
    }else if(p.power){r.geometry=r.geometry.filter(g=>g.id!==id);for(let i=0;i<4;i++)r.effects.push({kind:'brick-debris',x:q.x+(i%2)*8,y:q.y+Math.floor(i/2)*8,w:8,h:8,sx:(i%2)*8,sy:Math.floor(i/2)*8,vx:i%2?1.4:-1.4,vy:i<2?-3.8:-2.5,life:40,age:0});score+=50;emit('sound',{event:'break'});}else emit('sound',{event:'bump'});
  }
  function step(raw={}){
    if(disposed||completed)return;
    if(shrink||growth||fireGrowth){tick++;if(shrink)shrink--;if(growth)growth--;if(fireGrowth)fireGrowth--;return;}
    if(transition){tick++;const q=transition;q.age++;
      if(q.phase==='enter'){if(q.side)p.x+=.7;else p.y+=.8;
        if(q.age>=(q.side?40:56)){if(q.targetWorld){warpTarget=q.targetWorld;completed=true;transition=null;return;}enter(q.targetRoom,q.targetSpawn);const r=stateFor(roomId),pipe=r.geometry.filter(g=>g.material==='pipe'&&p.x+p.w/2>=g.x&&p.x+p.w/2<=g.x+g.w&&Math.abs(p.y+p.h-g.y)<80).sort((a,b)=>Math.abs(p.y+p.h-a.y)-Math.abs(p.y+p.h-b.y))[0];
          if(pipe){for(const e of r.enemies)if(/piranha/i.test(e.type)&&e.clipTop===pipe.y&&e.x+e.w>pipe.x&&e.x<pipe.x+pipe.w){e.age=0;e.y=e.clipTop;}p.x=pipe.x+(pipe.w-p.w)/2;p.y=pipe.y+2;p.vx=p.vy=0;p.crouch=false;p.grounded=true;transition={phase:'exit',age:0,clipTop:pipe.y,targetY:pipe.y-p.h};emit('sound',{event:'portal'});}else{transition=null;p.grounded=false;}}
      }else{if(q.age<=12)return;p.y=Math.max(q.targetY,p.y-.5);if(p.y===q.targetY){transition=null;p.grounded=true;portalLock=30;}}return;
    }
    if(dying){tick++;dying++;if(dying>24){p.y+=p.vy;p.vy+=.22;}if(dying>=105){if(autoContinue){continueFromCurrent();return;}if(manualDeath&&lives>0)return;dying=0;if(lives<=0){completed=true;emit('sound',{event:'gameover'});emit('complete',{result:'failed',coins,score});}else{roomStates.clear();timeLeft=400;timerTicks=0;p=null;enter(checkpoint.roomId,checkpoint.spawnId);health=character.motion.maxHealth;invulnerable=90;}}return;}
    if(finish?.castle){tick++;finish.age++;const r=stateFor(roomId);if(finish.phase==='bridge'){
      {const bridge=r.geometry.find(g=>g.id===finish.bridgeId);if(bridge){bridge.w=Math.max(0,bridge.w-4);if(!bridge.w)r.geometry=r.geometry.filter(g=>g!==bridge);}}
      if(!r.geometry.some(g=>g.id===finish.bridgeId)){finish.phase='boss-fall';finish.age=0;emit('sound',{event:'bowser_fall'});}
    }else if(finish.phase==='boss-fall'){for(const e of r.enemies)if(/bowser/i.test(e.type)){e.vy+=.22;e.y+=e.vy;}if(finish.age>80){r.enemies=r.enemies.filter(e=>!/bowser/i.test(e.type));finish.phase='walk';emit('sound',{event:'world_clear'});}}
    else if(finish.phase==='walk'){motor.step(p,{x:1},character,{solids:r.geometry,width:plan.rooms[roomId].width});cam=Math.max(cam,Math.min(Math.max(0,plan.rooms[roomId].width-256),p.x-100));if(p.x>=finish.target){p.vx=0;finish.phase='reunion';finish.age=0;}}
    else if(finish.phase==='reunion'){if(finish.age>=180)finish.phase='score';}
    else if(timeLeft>0){const n=Math.min(4,timeLeft);timeLeft-=n;score+=50*n;}else{completed=true;emit('complete',{result:'cleared',coins,score});}return;}
    if(finish){tick++;finish.age++;if(finish.phase==='slide'){p.y=Math.min(finish.floor-p.h,p.y+1.5);finish.flagY=Math.min(finish.floor-16,finish.flagY+1.8);if(p.y>=finish.floor-p.h&&finish.flagY>=finish.floor-16){finish.phase='walk';p.x=finish.poleX+4;p.vy=-1.8;p.grounded=false;emit('sound',{event:'complete'});}}else if(finish.phase==='walk'){p.jumpBuffer=0;motor.step(p,{x:1},character,{solids:stateFor(roomId).geometry,width:plan.rooms[roomId].width});if(p.x>=finish.x+96){finish.phase='score';p.vx=0;}}else if(timeLeft>0){const n=Math.min(4,timeLeft);timeLeft-=n;score+=n*50;}else{completed=true;emit('complete',{result:'cleared',coins,score});}return;}
    tick++;if(++timerTicks>=24){timerTicks=0;timeLeft--;if(timeLeft===100)emit('sound',{event:'hurry'});if(timeLeft<=0){respawn();timeLeft=400;return;}}if(invulnerable)invulnerable--;if(cooldown)cooldown--;if(attackAge)attackAge--;if(portalLock)portalLock--;
    const v={x:Math.max(-1,Math.min(1,Number(raw.x)||0)),down:!!raw.down,jump:!!raw.jump,run:!!raw.run,jumpPressed:!!raw.jump&&!prev.jump,attackPressed:(!!raw.attack&&!prev.attack)||(!!raw.run&&!prev.run),interactPressed:!!raw.interact&&!prev.interact};prev={...raw};
    const r=stateFor(roomId),map=plan.rooms[roomId],before=roomSerial,oldBottom=p.y+p.h;
    for(const vine of r.vines){vine.y=Math.max(0,vine.y-1);vine.h=vine.bottom-vine.y;}
    const vine=r.vines.find(a=>p.x+p.w>a.x&&p.x<a.x+a.w&&p.y+p.h>a.y&&p.y<a.bottom);
    if(p.onVine&&(!vine||v.jump||v.x)){p.onVine=false;if(v.jump){p.vy=-4;p.grounded=false;}}
    if(vine&&(raw.up||p.onVine)&&!v.jump&&!v.x){p.onVine=true;p.x=vine.x+7-p.w/2;p.vx=p.vy=0;p.grounded=false;p.y+=raw.up?-1.5:v.down?1.5:0;
      if(p.y<=0){enter(vine.portal.targetRoom,vine.portal.targetSpawn);p.onVine=false;emit('sound',{event:'portal'});}return;}
    for(const q of r.geometry){if(/Sky/.test(visualRooms.find(v=>v.roomId===roomId)?.setting||'')&&visualRooms.find(v=>v.roomId===roomId)?.semantics?.some(s=>s.id===q.id&&s.source?.transport===true)){if(p.support===q.id)q.riding=true;if(q.riding){q.x+=1.2;q.dx=1.2;q.dy=0;continue;}}q.dx=q.dy=0;if(q.liftSpeed){q.y+=q.liftSpeed;q.dy=q.liftSpeed;if(q.y>map.height||q.y+q.h<0){q.y=q.liftSpeed>0?-q.h:map.height;q.dy=0;if(p.support===q.id){p.support=null;p.grounded=false;}}}else if(q.motion){const {axis,min,max,speed}=q.motion,old=q[axis];q[axis]=Math.max(min,Math.min(max,old+speed*q.dir));if(q[axis]>=max||q[axis]<=min)q.dir*=-1;q[axis=== 'x'?'dx':'dy']=q[axis]-old;}}
    for(const marker of visualRooms.find(q=>q.roomId===roomId)?.markers||[]){
      if(marker.kind!=='coupled-scale'||marker.source?.macro!=='Scale')continue;
      const left=r.geometry.find(g=>g.id===marker.id+'-left'),right=r.geometry.find(g=>g.id===marker.id+'-right');
      if(!left||!right)continue;
      if(left.scaleBroken){for(const g of [left,right]){g.fallSpeed=Math.min(4.25,(g.fallSpeed||0)+.125);g.dy=g.fallSpeed;g.y+=g.dy;}continue;}
      const weight=p.grounded?(p.support===left.id?1:p.support===right.id?-1:0):0;
      let speed=left.scaleSpeed||0;
      speed=weight?Math.max(-1.5,Math.min(1.5,speed+weight*.04)):Math.sign(speed)*Math.max(0,Math.abs(speed)-.04);
      left.scaleSpeed=speed;
      const delta=Math.max(marker.y-left.y,Math.min(right.y-marker.y,speed));
      left.dy=delta;right.dy=-delta;left.y+=delta;right.y-=delta;
      if(weight&&(left.y<=marker.y||right.y<=marker.y)){left.scaleBroken=right.scaleBroken=true;left.fallSpeed=right.fallSpeed=0;}
    }
    // Also acquire a resting rider before ordinary jump handling. This covers
    // resumed/saved contact states whose support id has not been reconstructed.
    if(!p.springId&&p.grounded&&p.vy>=0){const spring=r.geometry.find(q=>q.material==='spring'&&!q.springAge&&p.x+p.w>q.x&&p.x<q.x+q.w&&Math.abs(p.y+p.h-q.y)<=1);
      if(spring){spring.springAge=1;spring.launchVx=p.vx;spring.restY??=spring.y;spring.restH??=spring.h;p.springId=spring.id;}
    }
    if(p.springId)p.vx=0;
    for(const event of motor.step(p,p.springId?{...v,x:0,jump:false,jumpPressed:false}:v,character,{solids:r.geometry,width:map.width,swimming:/Underwater/.test(visualRooms.find(q=>q.roomId===roomId)?.setting||'')}))emit('sound',{event:event==='jump'&&p.power?'jump_super':event});
    for(const q of r.geometry)if(q.material==='spring'){
      q.restY??=q.y;q.restH??=q.h;
      if(!q.springAge&&p.grounded&&p.support===q.id){q.springAge=1;p.springId=q.id;q.launchVx=p.vx;p.vx=0;}
      if(q.springAge){
        const age=q.springAge++;if(age>=8&&v.jump)q.boost=true;const depth=Math.min(q.restH-8,12)*(age<=6?age/6:Math.max(0,(12-age)/6));
        q.y=q.restY+depth;q.h=q.restH-depth;
        if(p.springId===q.id){
          if(p.x+p.w<=q.x||p.x>=q.x+q.w){p.springId=null;}
          else{p.y=q.y-p.h;p.vy=0;p.jumpBuffer=0;p.grounded=true;p.support=q.id;
            if(age>=12){p.springId=null;p.grounded=false;p.support=null;p.vx=v.x?Math.sign(v.x)*Math.max(Math.abs(q.launchVx||0),1.5):0;p.vy=q.boost?-9:-6;p.jumpG=.22;p.fallG=.32;p.airCap=v.run?2.5:1.5;emit('sound',{event:p.power?'jump_super':'jump'});}
          }
        }
        if(age>=12){q.springAge=0;q.boost=false;q.y=q.restY;q.h=q.restH;}
      }
    }
    if(p.x<cam){p.x=cam;if(p.vx<0)p.vx=0;}
    if(p.grounded)stompChain=0;
    if(p.headHit)bump(r,p.headHit);
    const visual=visualRooms.find(q=>q.roomId===roomId);
    if(allowWarp&&!portalLock&&(v.down||raw.interact))for(const m of visual?.markers||[]){
      if(!['world-transport','source-transport-not-simulated'].includes(m.kind)||!/^([1-8])-1$/.test(m.source?.transport?.map||''))continue;
      if(p.grounded&&Math.abs(p.y+p.h-m.y)<=4&&p.x+p.w>m.x+4&&p.x<m.x+28){p.x=m.x+(32-p.w)/2;p.vx=p.vy=0;transition={phase:'enter',age:0,clipTop:m.y,targetWorld:m.source.transport.map};emit('sound',{event:'portal'});return;}
    }
    r.sectionPassed??=new Set();
    for(const m of visual?.markers||[])if(m.kind==='conditional-sectionpass'&&motor.overlap(p,{x:m.x,y:m.y,w:2*(m.source?.width||8),h:2*(m.source?.height||8)})){
      const section=[...(visual.assembly||[])].reverse().find(a=>a.x*2<=m.x);if(section)r.sectionPassed.add(section.section);
    }
    // Multi-section mazes decide at the exit, never inside a route sensor.
    const deciders=(visual?.markers||[]).filter(m=>m.kind==='conditional-sectiondecider'&&m.source.pass-m.source.fail>1);
    r.sectionDecided??=new Set();
    for(const m of deciders){
      if(r.sectionDecided.has(m.id)||p.x<m.x||p.x>m.x+16)continue;
      const start=visual.assembly?.find(a=>a.section===m.source.fail);
      if(!start)continue;
      const required=visual.assembly.filter(a=>a.section>=m.source.fail&&a.section<m.source.pass)
        .filter(a=>(visual.markers||[]).some(q=>q.kind==='conditional-sectionpass'&&q.x>=a.x*2&&q.x<(visual.assembly.find(b=>b.x>a.x)?.x*2||map.width)));
      if(required.every(a=>r.sectionPassed.has(a.section))){r.sectionDecided.add(m.id);continue;}
      const x=start.x*2+4,screenX=p.x-cam;
      const landing=r.geometry.filter(g=>!g.hidden&&g.y>=48&&x+p.w>g.x&&x<g.x+g.w)
        .sort((a,b)=>Math.abs(a.y-(p.y+p.h))-Math.abs(b.y-(p.y+p.h)))
        .find(g=>!r.geometry.some(q=>!q.hidden&&q.collision==='solid'&&motor.overlap({x,y:g.y-p.h,w:p.w,h:p.h},q)));
      if(landing){for(const prior of deciders)if(prior.x<=start.x*2)r.sectionDecided.add(prior.id);for(const a of required)r.sectionPassed.delete(a.section);p.x=x;p.y=landing.y-p.h;p.vy=0;p.grounded=true;p.support=landing.id;p.springId=null;cam=Math.max(0,x-screenX);return;}
    }
    // Compiled castle sections retain pass/fail sensors. A failed corridor
    // must loop before its closing wall, even when camera backtracking is off.
    for(const m of visual?.markers||[]){
      if(m.kind!=='conditional-sectionfail'||!visual.assembly?.length||deciders.length)continue;
      const section=[...visual.assembly].reverse().find(a=>a.x*2<=m.x);
      if(!section||r.sectionPassed.has(section.section))continue;
      const next=visual.assembly.find(a=>a.x>section.x),end=next?next.x*2:map.width;
      // The route sensor records a choice; it is not a teleport trigger.
      r.sectionFailed??=new Set();
      if(motor.overlap(p,{x:m.x,y:m.y,w:2*(m.source?.width||8),h:2*(m.source?.height||8)}))r.sectionFailed.add(section.section);
      if(!r.sectionFailed.has(section.section)||p.x>=end)continue;
      const wall=r.geometry.filter(g=>!g.hidden&&g.collision==='solid'&&g.x>m.x+2*(m.source?.width||8)&&g.x<end&&g.y<p.y+p.h&&g.y+g.h>p.y).sort((a,b)=>a.x-b.x)[0];
      const retryAt=wall?wall.x-p.w-2:end-2;
      if(p.x<retryAt)continue;
      const x=section.x*2+4,screenX=p.x-cam;
      const landing=r.geometry.filter(g=>!g.hidden&&g.y>=48&&x+p.w>g.x&&x<g.x+g.w)
        .sort((a,b)=>b.y-a.y).find(g=>!r.geometry.some(q=>!q.hidden&&q.collision==='solid'&&motor.overlap({x,y:g.y-p.h,w:p.w,h:p.h},q)));
      if(landing){
        const free=!r.geometry.some(g=>!g.hidden&&g.collision==='solid'&&motor.overlap({x,y:p.y,w:p.w,h:p.h},g));
        p.x=x;if(!free){p.y=landing.y-p.h;p.vy=0;p.grounded=true;p.support=landing.id;}else {p.grounded=false;p.support=null;}
        p.springId=null;r.sectionFailed.delete(section.section);cam=Math.max(0,x-screenX);return;
      }
    }
    for(const m of visual?.markers||[]){
      if(m.kind==='rotating-firebar'&&markerParts({...visual,tick},m).some(b=>motor.overlap(p,b))){hurt();if(dying)return;}
      if(/lava/.test(m.kind)&&motor.overlap(p,{x:m.x,y:m.y,w:2*(m.source?.width||8),h:Math.max(1,map.height-m.y)})){respawn(true);return;}
      if(['bridge-axe-finish','marker-CastleAxe'].includes(m.kind)&&motor.overlap(p,{x:m.x,y:m.y,w:16,h:16})){
        const bridge=r.geometry.filter(g=>sourceType(visual,visual.map.geometry.find(a=>a.id===g.id)||g)==='CastleBridge'&&g.x<=m.x).sort((a,b)=>b.x-a.x)[0];
        if(bridge){r.hiddenMarkers.push(m.id,...visual.markers.filter(a=>a.kind==='marker-CastleChain').map(a=>a.id));const npc=visual.markers.find(a=>a.kind==='castle-finish');finish={castle:true,phase:'bridge',age:0,bridgeId:bridge.id,target:(npc?.x??bridge.x)+360};p.vx=p.vy=0;emit('sound',{event:'break'});return;}
      }
    }

    for(const q of r.geometry)if(q.bump)q.bump--;for(const e of r.effects){e.age++;e.life--;e.x+=e.vx;e.y+=e.vy;if(e.kind!=='bubble'&&!e.flat)e.vy+=e.kind==='coin-pop'?.14:.22;}r.effects=r.effects.filter(e=>e.life>0);
    if(p.swimming&&tick%48===0&&p.y>24)r.effects.push({kind:'bubble',x:p.x+(p.facing>0?p.w:0),y:p.y+4,w:4,h:4,vx:0,vy:-.6,life:Math.max(1,Math.floor((p.y-20)/.6)),age:0});
    if(p.star)p.star--;
    for(const item of r.items){
      if(item.dead)continue;
      if(item.emerge){item.emerge--;item.y=Math.max(item.targetY,item.y-.5);continue;}
      item.age++;const bottom=item.y+item.h,top=item.y;
      item.x+=item.vx;
      for(const q of r.geometry)if(!q.hidden&&q.collision==='solid'&&motor.overlap(item,q)){item.x=item.vx>0?q.x-item.w:q.x+q.w;item.vx*=-1;break;}
      item.vy=Math.min(4.25,item.vy+.22);item.y+=item.vy;
      for(const q of [...r.geometry].sort((a,b)=>a.y-b.y))if(!q.hidden&&item.x+item.w>q.x&&item.x<q.x+q.w&&bottom<=q.y+1&&item.y+item.h>=q.y&&item.vy>=0){item.y=q.y-item.h;item.vy=item.kind==='star'?-3.9:0;break;}
      if(item.vy<0)for(const q of r.geometry)if(!q.hidden&&q.collision==='solid'&&item.x+item.w>q.x&&item.x<q.x+q.w&&top>=q.y+q.h&&item.y<q.y+q.h){item.y=q.y+q.h;item.vy=.5;break;}
      if(motor.overlap(p,item)){item.dead=true;if(item.kind==='life')lives++;else if(item.kind==='star')p.star=600;else {if(!p.power){p.y-=14;p.h=28;growth=24;}else if(item.kind==='flower'&&p.power===1){fireGrowth=24;}p.power=item.kind==='flower'&&p.power>0?2:Math.max(1,p.power);}emit('sound',{event:item.kind==='life'?'life':'powerup'});}
      if(item.y>map.height+32||item.age>1800)item.dead=true;
    }
    if(growth||fireGrowth)return;
    if(p.y>map.height+40){const back=map.objects.find(o=>o.id==='sky-return');if(back){enter(back.targetRoom,back.targetSpawn);p.vy=1;emit('sound',{event:'portal'});}else respawn(true);return;}
    if(v.attackPressed&&p.power===2&&!cooldown&&r.shots.length<2){r.shots.push({kind:'fireball',x:p.x+(p.facing>0?p.w:-4),y:p.y+10,w:5,h:5,vx:p.facing*3.4,vy:1.2,age:0});cooldown=12;emit('sound',{event:'fire'});}
    for(const shot of r.shots){shot.age++;const oldY=shot.y;shot.x+=shot.vx;shot.vy=Math.min(4,shot.vy+.2);shot.y+=shot.vy;for(const q of r.geometry)if(!q.hidden&&motor.overlap(shot,q)){if(oldY+shot.h<=q.y+1){shot.y=q.y-shot.h;shot.vy=-3;}else {shot.dead=true;break;}}if(shot.dead){r.effects.push({kind:'fire-impact',x:shot.x-3,y:shot.y-3,w:12,h:12,vx:0,vy:0,life:6,age:0});continue;}for(const e of r.enemies)if(!e.dead&&touches(shot,e)){shot.dead=true;if(!/beetle|bowser/i.test(e.type)){killEnemy(r,e);score+=100;}else if(/bowser/i.test(e.type)){e.hp=(e.hp??5)-1;if(e.hp<=0)killEnemy(r,e);}break;}if(shot.age>160||shot.y>map.height)shot.dead=true;}r.shots=r.shots.filter(s=>!s.dead);
    if(v.attackPressed&&!cooldown&&character.capabilities.includes('attack')){attackAge=9;cooldown=18;emit('sound',{event:'attack'});const box={x:p.facing>0?p.x+p.w:p.x-28,y:p.y-2,w:28,h:p.h+4};for(const e of r.enemies)if(!e.dead&&motor.overlap(box,e)){e.hp--;if(e.hp<=0){killEnemy(r,e);score+=100;}}}
    if((visual?.markers||[]).some(m=>m.kind==='spawn-zone-LakituStop'&&p.x+p.w>=m.x)){r.lakituStopped=true;r.lakituRespawn=null;}
    if(r.lakituRespawn&&!r.lakituStopped){
      const pending=r.lakituRespawn;
      if(--pending.ticks<=0){
        if(!r.enemies.some(e=>!e.dead&&/^(enemy-|marker-)?lakitu$/i.test(e.type))){
          const e=pending.enemy,x=Math.min(map.width-e.w,cam+264);
          r.enemies.push({...e,x,y:e.homeY,homeX:x,vx:0,vy:0,age:0,hp:2,dead:false,safe:0});
        }
        r.lakituRespawn=null;
      }
    }
    const contactPlayer={...p},descending=p.vy>=0;
    const spawned=[];
    const spawn=(type,x,y,vx=0,vy=0)=>spawned.push({id:'runtime-'+tick+'-'+spawned.length,kind:'walker',type,x,y,w:16,h:16,vx,vy,homeX:x,homeY:y,age:0,dead:false});
    // Both imported Cannon geometry and hand-placed cannon material fire.
    r.cannonClocks??=new Map();
    for(const g of r.geometry){
      const original=visual?.map.geometry.find(q=>q.id===(g.sourceId||g.id))||g;
      if(g.hidden||!(g.material==='cannon'||sourceType(visual||{map},original)==='Cannon'))continue;
      if(g.x+g.w<cam||g.x>cam+256)continue;
      const distance=p.x+p.w/2-(g.x+g.w/2);
      if(Math.abs(distance)<32)continue;
      const clock=(r.cannonClocks.get(g.id)||0)+1;r.cannonClocks.set(g.id,clock);
      if(clock%150!==60||r.enemies.filter(e=>!e.dead&&e.type==='bulletbill').length+spawned.filter(e=>e.type==='bulletbill').length>=3)continue;
      const direction=Math.sign(distance);
      spawn('bulletbill',direction<0?g.x-16:g.x+g.w,g.y,direction*2,0);
      spawned.at(-1).source={cannonId:g.id};emit('sound',{event:'cannon'});
    }
    // Source CheepsStart/CheepsStop detectors activate the full-height bridge zone.
    const triggers=(visualRooms.find(q=>q.roomId===roomId)?.markers||[]).filter(m=>/spawn-zone-Cheeps(Start|Stop)/.test(m.kind)&&m.x<=p.x+p.w).sort((a,b)=>a.x-b.x);
    const active=triggers.length>0&&triggers.at(-1).kind.endsWith('Start');
    r.fishClock=active?(r.fishClock||0)+1:0;
    if(active&&r.fishClock%21===0&&r.enemies.filter(e=>e.flying).length<20){
      r.fishSeed=((r.fishSeed??12345)*1664525+1013904223)>>>0;const position=r.fishSeed/4294967296;
      const x=cam+position*240;
      spawn('cheepcheep',x,map.height, (position<.5?1:-1)*(.2+position*2.6),-2.8);Object.assign(spawned.at(-1),{flying:true,falling:false,source:{red:true}});
    }
    for(const e of r.enemies){
      if(e.dead)continue;
      if(/^(enemy-|marker-)?bowser$/i.test(e.type)&&e.x-p.x<1024){
        e.fireClock=(e.fireClock||0)+1;e.frame=e.fireClock%180>=40&&e.fireClock%180<=65?'firing':'';
        if(e.fireClock%180===60){const direction=p.x<e.x?-1:1;spawn('bowserfire',e.x+(direction<0?-24:e.w),e.y+8,direction*1.5,0);Object.assign(spawned.at(-1),{w:24,h:8});emit('sound',{event:'bowser_fire'});}
      }
      if(e.x>p.x+320&&!/bowserfire/i.test(e.type))continue;e.age=(e.age||0)+1;
      const type=e.type.replace(/^(enemy-|marker-)/,'').toLowerCase(),direction=p.x<e.x?-1:1,oldY=e.y,bottom=e.y+e.h;
      if(e.shell){
        if(Math.abs(e.vx)>1){e.shellAge=0;e.frame='';}
        else{
          e.shellAge=(e.shellAge||0)+1;e.frame=e.shellAge>=480?'peeking':'';
          if(e.shellAge>=600){
            const height=e.walkHeight||(/beetle/i.test(type)?17:24),body={...e,y:e.y+e.h-height,h:height};
            if(!r.geometry.some(g=>!g.hidden&&g.collision==='solid'&&motor.overlap(body,g))){
              e.y=body.y;e.h=height;e.shell=false;e.shellAge=0;e.frame='';e.hits=0;e.vx=direction*.5;
            }
          }
        }
      }
      if(type==='lakitu'){
        if(r.lakituStopped){e.x+=2.5;if(e.x>cam+280)e.dead=true;continue;}
        const target=p.x+(Math.abs(p.vx)>1.5?64:Math.sin(e.age*.022)*100);e.vx=Math.max(-2,Math.min(2,(target-e.x)*.035));e.x+=e.vx;
        e.frame=e.age%140<21?'hiding':'out';if(e.age%140===21)spawn('spinyegg',e.x,e.y,0,-4.2);
      }else if(type==='piranha'){
        let phase=e.age%180;
        const near=Math.abs(p.x+p.w/2-e.homeX-e.w/2)<28;
        // Proximity suppresses the next emergence, never interrupts an active cycle.
        if(near&&phase<=60){e.age=0;phase=0;}
        const depth=phase<60?e.h:phase<90?e.h*(90-phase)/30:phase<150?0:e.h*(phase-150)/30;
        e.y=e.homeY+depth;
      }else if(type==='bulletbill'){e.vx=e.vx<0?-2:2;e.x+=e.vx;}
      else if(type==='blooper'){const phase=e.age%120;e.vy=phase<45?-1.3:phase<75?.1:.7;e.y+=e.vy;e.x+=phase<45?direction*.65:0;}
      else if(type==='cheepcheep'){if(e.flying){e.x+=e.vx;e.y+=e.vy;if(e.y<56)e.falling=true;if(e.falling)e.vy+=.48/7;}else{e.x-=.7;e.y=e.homeY+Math.sin(e.age/45)*12;}}
      else if(type==='podoboo'){e.vy+=.14;e.y+=e.vy;if(e.y>=e.homeY){e.y=e.homeY;e.vy=-5;}}
      else {
        if(type==='hammerbro') {e.vx=Math.sin(e.age/22)*.65;e.facing=direction;if(e.age%140===0)e.vy=-4.2;if(e.age%120>=35&&e.age%120<84&&e.age%7===0){spawn('hammer',e.x,e.y-8,direction*1.43,-2.8);e.frame='throwing';}else e.frame='';}
        if(type==='bowser'){e.vx=direction*.4;if(e.age%150===0)e.vy=-4;}
        if(type==='bowserfire'){e.x+=e.vx;}
        else {
          const oldX=e.x;e.x+=e.vx;
          if(type!=='hammer')for(const q of r.geometry)if(q.collision==='solid'&&motor.overlap(e,q)&&bottom>q.y+1){e.x=oldX;e.vx*=-1;break;}
          if((e.source?.smart||e.source?.red)&&!e.shell&&e.grounded&&e.vx){
            // Probe the leading foot, not the sprite's outer edge. Adjacent top
            // pieces count as continuous support; unrevealed blocks do not.
            const supports=r.geometry.filter(q=>!q.hidden&&Math.abs(q.y-bottom)<1.01),probe=e.x+e.w/2+Math.sign(e.vx)*Math.min(4,e.w/4);
            if(!supports.some(q=>probe>=q.x&&probe<q.x+q.w)){e.x=oldX;e.vx*=-1;}
          }
          e.vy=Math.min(5,e.vy+(type==='hammer'||type==='hammerbro'?.12:.3));e.y+=e.vy;e.grounded=false;
          if(type!=='hammer')for(const q of r.geometry)if(e.x+e.w>q.x&&e.x<q.x+q.w&&bottom<=q.y+1&&e.y+e.h>=q.y&&e.vy>=0){e.y=q.y-e.h;e.vy=0;e.grounded=true;if(type==='spinyegg'){e.type='spiny';e.vx=direction*.5;}else if(e.source?.jumping)e.vy=-3;break;}
        }
      }
      if(e.y>map.height+40||e.x<p.x-512||(type==='bulletbill'&&(e.x+e.w<cam-32||e.x>cam+288)))e.dead=true;
      if(!e.dead&&touches(contactPlayer,e)){
        if(p.star){killEnemy(r,e);score+=100;continue;}
        if(e.safe){e.safe--;continue;}
        if(descending&&oldBottom<=oldY+7&&!/piranha|podoboo|spiny|bowser|hammer$/.test(type)){
          let contactSound='stomp';
          if(type==='koopa'||type==='beetle'){if(!e.shell){e.walkHeight=e.h;e.shellAge=0;e.shell=true;e.y+=e.h-16;e.h=16;e.vx=0;e.source={...e.source,jumping:false};}else if(Math.abs(e.vx)>1){e.vx=0;e.shellAge=0;e.frame='';}else{e.vx=(p.x<e.x?1:-1)*3.2;e.safe=12;contactSound='kick';}}else killEnemy(r,e,true);
          p.y=Math.min(p.y,e.y-p.h);p.vy=-4.1333333;p.jumpG=.125;p.fallG=.4375;p.grounded=false;chainReward(r,e,stompChain++,[100,200,400,500,800,1000,2000,4000,5000,8000]);emit('sound',{event:contactSound});continue;
        }if(e.shell&&Math.abs(e.vx)<1){e.vx=(p.x<e.x?1:-1)*3.2;e.safe=14;emit('sound',{event:'kick'});continue;}hurt();if(roomSerial!==before||completed||dying)return;
      }else if(e.safe)e.safe--;
    }
    // Resolve each contact once, after both actors have moved. Projectiles and
    // scripted airborne actors do not participate in ground crowd separation.
    const groundBody=e=>/^(walker|goomba|koopa|beetle|spiny)$/.test(e.type.replace(/^(enemy-|marker-)/,'').toLowerCase());
    for(let i=0;i<r.enemies.length;i++)for(let j=i+1;j<r.enemies.length;j++){
      const a=r.enemies[i],b=r.enemies[j];if(a.dead||b.dead||!a.age||!b.age||!groundBody(a)||!groundBody(b)||!motor.overlap(a,b))continue;
      const movingA=a.shell&&Math.abs(a.vx)>1,movingB=b.shell&&Math.abs(b.vx)>1;
      if(movingA||movingB){
        if(a.shell&&b.shell&&movingA&&movingB){const vx=a.vx;a.vx=b.vx;b.vx=vx;a.x+=a.vx;b.x+=b.vx;}
        else{const shell=movingA?a:b,victim=movingA?b:a;killEnemy(r,victim);shell.hits=(shell.hits||0)+1;chainReward(r,victim,shell.hits-1,[500,800,1000,2000,4000,5000,8000]);}
        emit('sound',{event:'kick'});continue;
      }
      const left=a.x+a.w/2<=b.x+b.w/2?a:b,right=left===a?b:a,overlap=left.x+left.w-right.x;
      if(left.shell&&right.shell)continue;
      if(left.shell){right.x+=overlap;right.vx=Math.abs(right.vx||.5);}
      else if(right.shell){left.x-=overlap;left.vx=-Math.abs(left.vx||.5);}
      else{left.x-=overlap/2;right.x+=overlap/2;left.vx=-Math.abs(left.vx||.5);right.vx=Math.abs(right.vx||.5);}
    }
    r.enemies.push(...spawned);r.enemies=r.enemies.filter(e=>!e.dead);
    for(const o of map.objects){if(o.id.endsWith('-vine-portal')||o.id==='sky-return')continue;if(!motor.overlap(p,o)&&(o.kind!=='portal'||!motor.overlap({...p,x:p.x-2,w:p.w+4,h:p.h+2},o)))continue;
      if(o.kind==='coin'&&!r.taken.has(o.id)){r.taken.add(o.id);collectCoin();}
      if(o.kind==='hazard'){hurt();if(roomSerial!==before||completed||dying)return;}
      if(o.kind==='checkpoint'&&!r.taken.has(o.id)){r.taken.add(o.id);checkpoint={roomId,spawnId:o.targetSpawn};emit('sound',{event:'checkpoint'});}
      if(o.kind==='portal'&&!portalLock){const side=r.geometry.find(g=>g.material==='pipe-side'&&Math.abs(g.x-o.x)<32&&Math.abs(g.y-o.y)<32)||(o.h>o.w&&r.geometry.some(g=>g.material==='pipe'&&g.x>=o.x&&g.x<=o.x+32&&g.y<o.y-32)?{x:o.x,y:o.y,w:o.w,h:o.h}:null);if(raw.interact||(side&&v.x>0)||(!side&&v.down)){
        const pipe=side||r.geometry.find(g=>g.material==='pipe'&&o.x<g.x+g.w&&o.x+o.w>g.x&&Math.abs(o.y-g.y)<32);
        if(pipe){const mouthOverlap=p.x+p.w>pipe.x+4&&p.x<pipe.x+pipe.w-4,aligned=side?Math.abs(p.x+p.w-pipe.x)<=6&&p.y+p.h>pipe.y+4&&p.y<pipe.y+pipe.h-4:p.grounded&&Math.abs(p.y+p.h-pipe.y)<=4&&mouthOverlap;if(!aligned)continue;p.vx=p.vy=0;if(!side)p.x=pipe.x+(pipe.w-p.w)/2;transition={phase:'enter',age:0,side:!!side,clipTop:side?null:pipe.y,clipRight:side?pipe.x:null,targetRoom:o.targetRoom,targetSpawn:o.targetSpawn};emit('sound',{event:'portal'});}else{enter(o.targetRoom,o.targetSpawn);emit('sound',{event:'portal'});}return;
      }}
      if(o.kind==='exit'&&visual?.markers?.some(m=>m.kind==='castle-finish')){const npc=visual.markers.find(m=>m.kind==='castle-finish');finish={castle:true,phase:'walk',age:0,target:Math.min(map.width-p.w,npc.x+360)};emit('sound',{event:'world_clear'});return;}
      if(o.kind==='exit'){const ground=r.geometry.filter(q=>p.x+p.w>=q.x&&p.x<=q.x+q.w&&q.y>=p.y+p.h).sort((a,b)=>a.y-b.y)[0];const marker=visual?.markers?.find(m=>m.kind==='flagpole-finish'&&Math.abs(m.x-o.x)<32),poleX=marker?marker.x+8:o.x+o.w/2;const base=r.geometry.filter(g=>g.x<=poleX&&g.x+g.w>=poleX&&g.y>=p.y+p.h).sort((a,b)=>a.y-b.y)[0];finish={phase:'slide',age:0,x:o.x,poleX,flagY:marker?flagRestY(marker):o.y,floor:base?.y||ground?.y||map.height-32};score+=p.y<62?5000:p.y<100?2000:p.y<140?800:p.y<176?400:100;p.x=poleX-p.w;p.facing=1;p.crouch=false;p.vx=p.vy=0;emit('sound',{event:'flag'});return;}
    }
    cam=Math.max(cam,Math.max(0,Math.min(Math.max(0,map.width-256),p.x-100)));
  }
  function continueFromCurrent(){
    if((!completed&&!dying)||!p)return false;
    let spot=deathSpot||{roomId,x:p.x,y:p.y,power:0};
    if(spot.terrain){
      const map=plan.rooms[spot.roomId],r=stateFor(spot.roomId),h=spot.power?28:14,w=p.w;
      const hazards=[...map.objects.filter(o=>o.kind==='hazard'),...(visualRooms.find(q=>q.roomId===spot.roomId)?.markers||[]).filter(m=>/lava/.test(m.kind)).map(m=>({x:m.x,y:m.y,w:2*(m.source?.width||8),h:Math.max(1,map.height-m.y)}))];
      const candidates=[];
      // Land must connect down to the bottom of the room. The top face of a
      // castle ceiling is solid too, but is outside the playable corridor.
      const land=r.geometry.filter(g=>!g.hidden&&!g.motion&&!g.liftSpeed&&g.collision==='solid');
      const grounded=new Set(land.filter(g=>g.y+g.h>=map.height).map(g=>g.id));
      for(let changed=true;changed;){changed=false;for(const g of land)if(!grounded.has(g.id)&&land.some(b=>grounded.has(b.id)&&Math.abs(g.y+g.h-b.y)<1&&g.x<b.x+b.w&&g.x+g.w>b.x)){grounded.add(g.id);changed=true;}}
      for(const g of r.geometry){
        const visual=visualRooms.find(q=>q.roomId===spot.roomId),original=visual?.map.geometry.find(q=>q.id===(g.sourceId||g.id))||g;
        const platform=g.collision==='oneway'||['TreeTop','ShroomTop','Platform'].includes(sourceType(visual||{map},original))||['tree','shroom','platform'].includes(g.material);
        if(g.hidden||g.scaleBroken||(!grounded.has(g.id)&&!platform)||/pipe/.test(g.material||'')||g.w<w+4||g.y-h<48||g.y>=map.height)continue;
        const left=Math.max(0,g.x+2),right=Math.min(map.width-w,g.x+g.w-w-2);
        for(let x=left;x<=right;x+=2){
          const body={x,y:g.y-h,w,h};
          if(hazards.some(q=>motor.overlap({...body,y:body.y-1,h:h+2},q))||r.geometry.some(q=>q!==g&&!q.hidden&&q.collision==='solid'&&motor.overlap(body,q)))continue;
          candidates.push({...spot,x,y:body.y,distance:Math.hypot(x-spot.x,body.y-spot.y)});
        }
      }
      candidates.sort((a,b)=>a.distance-b.distance);
      if(!candidates.length)return false;
      spot=candidates[0];
    }
    roomId=spot.roomId||roomId;completed=false;dying=0;finish=null;transition=null;shrink=0;growth=0;fireGrowth=0;health=character.motion.maxHealth;lives=Math.max(1,lives);timeLeft=400;timerTicks=0;invulnerable=90;portalLock=30;prev={};deathSpot=null;
    p.dying=false;p.x=spot.x;p.y=spot.y;p.vx=0;p.vy=0;p.power=Math.max(0,Math.min(2,spot.power||0));p.h=p.power?28:14;p.grounded=false;p.crouch=false;p.star=0;cam=Math.max(0,Math.min(Math.max(0,plan.rooms[roomId].width-256),p.x-100));
    emit('sound',{event:'continue'});return true;
  }
  function view(){const map=plan.rooms[roomId],r=stateFor(roomId);return{warpTarget,roomId,title:plan.stage.title,character:copy(character),p:{...p,shrink,growth,fireGrowth,invulnerable,climbing:!!p.onVine||finish?.phase==='slide',piping:!!transition},transition:transition?{...transition}:null,width:map.width,height:map.height,geometry:copy(r.geometry),objects:map.objects.filter(o=>!r.taken.has(o.id)&&o.kind!=='walker').map(copy),vines:copy(r.vines),items:[...r.items.filter(i=>!i.dead),...r.shots,...r.effects].map(copy),enemies:r.enemies.filter(e=>!e.dead).map(copy),hiddenMarkers:[...r.hiddenMarkers],tick,health,lives,coins,score,timeLeft,cam,invulnerable,attackAge,completed,checkpoint:{...checkpoint},disposed,finish:finish?{...finish}:null};}
  return Object.freeze({step,view,continueFromCurrent,dispose(){disposed=true;roomStates.clear();},pause(){prev={};},resume(){prev={};}});
}
