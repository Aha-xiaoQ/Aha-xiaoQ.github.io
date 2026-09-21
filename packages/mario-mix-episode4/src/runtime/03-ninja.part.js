/* Mario Mix / Ninja Episode - playable alpha 0.1.
 * Injected inside classic-mix.js's existing closure by build.py.
 * Original sprites drawn here and original procedural music, not ripped Ninja Gaiden assets.
 * Existing Mario/Bill/Mega Man assets and their rights notices remain unchanged.
 */
const NINJA_CONFIG = Object.freeze({version:'0.1.0',hp:16,spirit:12,speed:2.05,jump:-5.05,gravity:.26,fallCap:4.2,climb:1.05,wallJumpX:2.65,wallJumpY:-4.9,invulnerability:90,hitLock:13,wallLock:9});
const NINJA_ROOMS = [
 {name:'城外 · 试刀',title:'THE FIRST WALL',width:672,goal:632,spawn:[32,182],ground:[[0,42]],walls:[[10,2,6],[22,2,9],[32,2,7]],ledges:[[16,8,3],[28,6,3]],coins:[[8,10],[9,8],[10,5],[11,5],[17,7],[18,7],[22,3],[23,3],[28,5],[29,5],[32,4],[33,4]],lanterns:[[112,150,'spirit'],[432,80,'health']],foes:[['walker',278,182],['walker',554,182]],blocks:[[5,9,'coin'],[18,5,'power']],signs:[[48,165,'J: SLASH'],[134,126,'UP: CLIMB'],[280,80,'K: KICK OFF']]},
 {name:'管道 · 鹰渡',title:'PIPES IN THE MOONLIGHT',width:768,goal:728,spawn:[32,182],ground:[[0,14],[19,26],[32,48]],walls:[[8,2,7],[20,2,8],[34,2,6],[42,2,8]],ledges:[[14,7,2],[17,6,2],[26,7,2],[29,5,2]],coins:[[8,5],[9,5],[14,6],[15,6],[17,5],[18,5],[20,4],[21,4],[26,6],[27,6],[29,4],[30,4],[34,6],[35,6]],lanterns:[[68,145,'health'],[388,110,'spirit'],[612,134,'health']],foes:[['hawk',268,88],['thrower',390,182],['hawk',485,88],['walker',610,182]],blocks:[[5,8,'power']],signs:[[37,106,'CHECKPOINT'],[172,164,'WATCH THE SKY']]},
 {name:'城门 · 守关',title:'THE LAST GATE',width:736,goal:694,spawn:[32,182],ground:[[0,46]],walls:[[8,2,5],[18,2,7]],ledges:[[12,8,2],[24,8,3]],coins:[[8,7],[9,7],[12,7],[13,7],[18,5],[19,5],[24,7],[25,7]],lanterns:[[80,144,'health'],[340,104,'spirit']],foes:[['walker',224,182],['guardian',484,168]],blocks:[[5,9,'power']],signs:[[44,106,'CHECKPOINT'],[332,144,'DEFEAT THE GUARD']]}
];
let ninja=null,ninjaSavedRoom=0,ninjaHitLock=0,ninjaAudioContext=null;
heroNames.ryu='隼龙';
heroHelp.ryu='忍者篇 · 三段独立区域。← → 移动，空格 / K 跳跃，贴墙后 ↑ ↓ 攀爬，跳跃蹬墙；J / X 挥刀，↑ + J 或 L 投手里剑。16 格血量，区域门自动存检查点。';
const ninjaLegacyInput=getInput;
getInput=function(){const v=ninjaLegacyInput();if(hero==='ryu'){
 const raw=virtualInput;
 v.up=!!(raw?.up||keys.has('ArrowUp')||keys.has('KeyW')||[...touch.values()].includes('up'));
 v.jump=!!(raw?.jump||keys.has('Space')||keys.has('KeyK')||keys.has('KeyZ')||[...touch.values()].includes('jump'));
 v.special=!!(raw?.special||keys.has('KeyL')||[...touch.values()].includes('special'));
 try{const p=[...(navigator.getGamepads?.()||[])].find(Boolean);if(p){v.up||=p.axes[1]<-.4||p.buttons[12]?.pressed;v.jump||=!!p.buttons[0]?.pressed;v.special||=!!p.buttons[3]?.pressed;}}catch{}
 }return v;};
mapped.add('KeyL');
function ninjaEvent(type,data={}){if(!ninja)return;ninja.events.push({type,frame,...data});if(ninja.events.length>180)ninja.events.shift();}
function ninjaDust(x,y,color='#a5d1df',count=5){if(!ninja)return;for(let i=0;i<count;i++)ninja.fx.push({x,y,vx:(i%3-1)*.7,vy:-.4-i*.16,life:20,color});}
function ninjaEnemy(kind,x,y,id){return{kind,x,y,ox:x,oy:y,w:kind==='guardian'?24:kind==='hawk'?18:13,h:kind==='guardian'?40:kind==='hawk'?12:26,hp:kind==='guardian'?12:kind==='walker'?2:kind==='thrower'?3:1,maxHp:kind==='guardian'?12:kind==='walker'?2:kind==='thrower'?3:1,vx:0,vy:0,dir:-1,t:0,phase:0,flash:0,dead:false,id,attack:0,cool:0,seen:false};}
function ninjaLoadRoom(index,preserve=false){
 const old=ninja,def=NINJA_ROOMS[index];
 ninja={room:index,hp:preserve?Math.min(NINJA_CONFIG.hp,(old?.hp||16)+4):NINJA_CONFIG.hp,spirit:preserve?Math.max(6,old?.spirit||12):NINJA_CONFIG.spirit,wall:0,wallLock:0,wallFrom:0,jumpHeld:false,attackHeld:false,specialHeld:false,attack:0,cool:0,attackId:0,hitIds:new Set(),hit:0,coyote:0,buffer:0,arrowLock:false,stageIntro:100,transition:0,transitionTo:null,gateOpen:index!==2,arena:false,bossDefeated:false,foes:def.foes.map((q,i)=>ninjaEnemy(...q,i)),projectiles:[],drops:[],lanterns:def.lanterns.map((q,i)=>({x:q[0],y:q[1],w:12,h:18,type:q[2],id:i,dead:false})),fx:[],events:old?.events||[],ticks:0,clearTick:0};
 tiles=new Map();for(const [a,b] of def.ground)for(let x=a;x<b;x++)for(let y=13;y<15;y++)put(tiles,x,y,'ground');
 pipes=[];for(const [x,w,h] of def.walls){for(let xx=x;xx<x+w;xx++)for(let y=13-h;y<13;y++)put(tiles,xx,y,'pipe');pipes.push({x:x*T,y:(13-h)*T,w:w*T,h});}
 for(const [x,y,w] of def.ledges)for(let xx=x;xx<x+w;xx++)put(tiles,xx,y,'brick');
 for(const [x,y,c] of def.blocks)put(tiles,x,y,'question',c);
 looseCoins=def.coins.map(([x,y])=>({x:x*T+4,y:y*T,w:8,h:12}));
 enemies=[];items=[];shots=[];particles=[];floaters=[];mixShots=[];enemyShots=[];billBase=null;
 player=createPlayer(...def.spawn);Object.assign(player,{h:26,w:12,invuln:48,power:0,vx:0,vy:0,grounded:false});
 camera=0;room='surface';mode='playing';freeze=0;timeLeft=300;timerTicks=0;ninjaSavedRoom=index;checkpoint=index;maxProgress=index/3*FLAG_X;
 keys.clear();touch.clear();jumpHeldPrev=false;runHeldPrev=false;hideOverlay();ninjaEvent('room-enter',{room:index});updateHeroUI();
}
const ninjaLegacyReset=resetLife;
resetLife=function(){if(hero!=='ryu'){ninja=null;ninjaHitLock=0;return ninjaLegacyReset();}resetGameAudio();ninjaLoadRoom(ninjaSavedRoom);ninjaMakeAudio();audioSync();};
const ninjaLegacyStart=startGame;
startGame=function(){if(hero==='ryu'){ninjaSavedRoom=0;ninja=null;}return ninjaLegacyStart();};
const ninjaLegacyUI=updateHeroUI;
updateHeroUI=function(){if(hero!=='ryu')return ninjaLegacyUI();$('stage').style.setProperty('--scene-background','#111d35');const n=$('heroStatus');if(n)n.textContent='隼龙 · '+(ninja?NINJA_ROOMS[ninja.room].name+' · HP '+ninja.hp+'/16 · 忍术 '+ninja.spirit:'忍者篇 / 16 格血量');};
const ninjaLegacySelect=selectHero;
selectHero=function(id){ninjaLegacySelect(id);if(hero==='ryu'){$('actionLabel').textContent='挥刀 / ↑ + J 忍术';$('downLabel').textContent='↑ ↓ 攀墙 / L 忍术';}if($('ninjaTouch'))$('ninjaTouch').hidden=hero!=='ryu';};
const ninjaLegacyCharacters=showCharacters;
showCharacters=function(){ninjaLegacyCharacters();$('overlayLabel').textContent='EPISODE 02 / NINJA CROSSOVER';$('overlayTitle').innerHTML='选择角色';};
function ninjaTouchWall(side){return solids({x:side<0?player.x-1:player.x+player.w,y:player.y+3,w:1,h:player.h-6}).some(t=>!t.hidden);}
function ninjaMove(dx,dy){const p=player;p.x+=dx;for(const t of solids(p)){if(dx>0)p.x=Math.min(p.x,t.x*T-p.w);else if(dx<0)p.x=Math.max(p.x,(t.x+1)*T);p.vx=0;}
 p.grounded=false;p.y+=dy;for(const t of solids(p)){if(dy>0){p.y=Math.min(p.y,t.y*T-p.h);p.grounded=true;}else if(dy<0){p.y=Math.max(p.y,(t.y+1)*T);if(t.content)ninjaBump(t);}p.vy=0;}
}
function ninjaBump(t){if(t.used||!t.content)return;const type=t.content;t.used=true;t.content=null;t.bump=10;if(type==='coin')getCoin(t.x*T,t.y*T,true);else{ninja.spirit=Math.min(24,ninja.spirit+5);ninja.hp=Math.min(16,ninja.hp+2);ninjaSound('pickup');ninjaDust(t.x*T+8,t.y*T-8,'#f5cf79',8);ninjaEvent('supply-block');}}
function ninjaSwing(){if(ninja.cool||ninja.hit||ninja.wall)return;ninja.attack=12;ninja.cool=20;ninja.attackId++;ninja.hitIds.clear();ninjaSound('slash');ninjaEvent('sword');}
function ninjaThrow(){if(ninja.cool||ninja.hit)return;if(ninja.spirit<3){ninjaSound('empty');return;}ninja.spirit-=3;ninja.cool=23;ninja.projectiles.push({friendly:true,x:player.x+6,y:player.y+12,w:8,h:8,vx:player.facing*3.6,vy:0,life:100});ninjaSound('throw');ninjaEvent('shuriken');}
function ninjaHurt(source){if(!ninja||mode!=='playing'||player.invuln||player.star)return;
 const dir=(source?.x??player.x+player.facing*12)+((source?.w||0)/2)<player.x+6?1:-1;
 ninja.hp=Math.max(0,ninja.hp-2);ninja.wall=0;ninja.attack=0;ninja.hit=NINJA_CONFIG.hitLock;player.invuln=NINJA_CONFIG.invulnerability;player.vx=dir*2.15;player.vy=-3.25;player.grounded=false;ninjaDust(player.x+6,player.y+13,'#f9b278',8);ninjaSound('hurt');ninjaEvent('hurt',{hp:ninja.hp,dir});if(!ninja.hp)die();
}
const ninjaLegacyDamage=damage;
damage=function(source){if(hero==='ryu')return ninjaHurt(source);const hp=mixHp,was=mode;ninjaLegacyDamage();if(hero==='megaman'&&mode==='playing'&&mixHp<hp&&was==='playing'){const near=source||enemies.find(e=>e.active&&!e.dead&&overlap(player,{x:e.x-12,y:e.y-8,w:e.w+24,h:e.h+16}));player.vx=((near?.x??player.x+player.facing*20)<player.x?1:-1)*1.65;player.vy=-1.9;ninjaHitLock=18;mixCharge=0;mixHeld=false;for(const v of [...voices])if(v.key==='mega_charge_start')stopVoice(v);}};
const ninjaLegacyPlayer=updatePlayer;
updatePlayer=function(input){if(hero==='megaman'&&ninjaHitLock){ninjaHitLock--;if(player.invuln)player.invuln--;player.vy=Math.min(4.25,player.vy+.32);moveBody(player,player.vx,player.vy);player.vx*=.9;if(player.y>H+40)die();return;}if(hero!=='ryu')return ninjaLegacyPlayer(input);ninjaUpdatePlayer(input);};
function ninjaUpdatePlayer(input){
 const p=player,n=ninja,d=(input.right?1:0)-(input.left?1:0),def=NINJA_ROOMS[n.room];
 if(p.invuln)p.invuln--;if(n.cool)n.cool--;if(n.attack)n.attack--;if(n.wallLock)n.wallLock--;
 if(input.jump&&!n.jumpHeld)n.buffer=6;else if(n.buffer)n.buffer--;n.jumpHeld=!!input.jump;
 if(p.grounded)n.coyote=5;else if(n.coyote)n.coyote--;
 if(n.hit){n.hit--;n.wall=0;p.vy=Math.min(NINJA_CONFIG.fallCap,p.vy+NINJA_CONFIG.gravity);ninjaMove(p.vx,p.vy);p.vx*=.94;}
 else{
  if(d)p.facing=d;
  const l=ninjaTouchWall(-1),r=ninjaTouchWall(1);let wall=!p.grounded?(r&&(d>0||n.wall===1)?1:l&&(d<0||n.wall===-1)?-1:0):0;
  if(n.wallLock&&wall===n.wallFrom)wall=0;
  if(n.wall&&d===-n.wall&&!input.jump&&!input.up)wall=0;
  if(wall&&!n.wall)ninjaEvent('wall-grab',{side:wall});n.wall=wall;
  if(n.buffer&&(n.wall||n.coyote)){
   if(n.wall){const from=n.wall;p.vx=-from*NINJA_CONFIG.wallJumpX;p.vy=NINJA_CONFIG.wallJumpY;p.facing=-from;n.wallFrom=from;n.wallLock=NINJA_CONFIG.wallLock;n.wall=0;ninjaSound('wall');ninjaEvent('wall-jump',{from});ninjaDust(p.x+6,p.y+22);}
   else{p.vy=NINJA_CONFIG.jump;ninjaSound('jump');ninjaEvent('jump');}p.grounded=false;n.coyote=0;n.buffer=0;
  }
  if(n.wall){p.vx=0;p.vy=input.up?-NINJA_CONFIG.climb:input.down?1.4:0;ninjaMove(0,p.vy);if(input.up&&!ninjaTouchWall(n.wall)){
    // A small collision-checked mantle over the lip avoids an invisible edge trap.
    const step={x:p.x+n.wall*5,y:p.y-3,w:p.w,h:p.h};if(!solids(step).length){p.x=step.x;p.y=step.y;p.vy=-1.2;}n.wall=0;
   }}
  else{if(!n.wallLock)p.vx=approach(p.vx,d*NINJA_CONFIG.speed,p.grounded?.38:.24);p.vy=Math.min(NINJA_CONFIG.fallCap,p.vy+(p.vy<0&&!input.jump?.44:NINJA_CONFIG.gravity));ninjaMove(p.vx,p.vy);}
  if(input.special&&!n.specialHeld||input.up&&input.run&&!n.attackHeld)ninjaThrow();else if(input.run&&!n.attackHeld)ninjaSwing();
 }
 n.attackHeld=!!input.run;n.specialHeld=!!input.special;p.anim+=Math.abs(p.vx);
 p.x=clamp(p.x,n.arena&&!n.bossDefeated?398:1,n.room===2&&!n.bossDefeated?633-p.w:def.width-p.w-1);
 camera=clamp(p.x-110,0,def.width-W);if(n.arena&&!n.bossDefeated)camera=384;
 maxProgress=(n.room+(p.x/def.width))/3*FLAG_X;
 if(p.y>H+16){ninjaEvent('pit');die();return;}
 for(let i=looseCoins.length-1;i>=0;i--)if(overlap(p,looseCoins[i])){const c=looseCoins[i];getCoin(c.x,c.y);looseCoins.splice(i,1);}
 for(const e of n.foes){if(e.dead)continue;const danger=e.kind==='guardian'&&e.attack>0?{x:e.dir<0?e.x-19:e.x+e.w,y:e.y+10,w:19,h:24}:e;if(overlap(p,danger)||overlap(p,e)){ninjaHurt(e);break;}}
 for(let i=n.drops.length-1;i>=0;i--){const it=n.drops[i];if(overlap(p,it)){if(it.type==='health')n.hp=Math.min(16,n.hp+6);else n.spirit=Math.min(24,n.spirit+6);ninjaSound('pickup');ninjaEvent('pickup',{item:it.type});n.drops.splice(i,1);}}
 if(n.room===2&&p.x>398&&!n.arena&&!n.bossDefeated){n.arena=true;camera=384;ninjaEvent('arena-lock');n.stageIntro=55;}
 if(p.x+p.w>=def.goal&&p.grounded){if(n.room<2){n.transition=40;n.transitionTo=n.room+1;ninjaSound('gate');ninjaEvent('gate');}else if(n.bossDefeated)ninjaBeginFlag();}
}
function ninjaHit(e,damage=1){if(e.dead)return;const n=ninja;
 if(e.kind==='guardian'&&e.phase<50){ninjaSound('block');ninjaDust(e.x+e.w/2,e.y+15,'#80d7ff',4);return;}
 e.hp-=damage;e.flash=8;ninjaSound('hit');ninjaDust(e.x+e.w/2,e.y+e.h/2,'#f7d488',6);ninjaEvent('enemy-hit',{kind:e.kind,hp:e.hp});
 if(e.hp<=0){e.dead=true;addScore(e.kind==='guardian'?2500:200,e.x,e.y);ninjaDust(e.x+e.w/2,e.y+12,'#f8d59a',16);if(e.kind==='guardian'){n.bossDefeated=true;n.gateOpen=true;n.arena=false;n.projectiles=n.projectiles.filter(s=>s.friendly);n.stageIntro=90;ninjaSound('gate');ninjaEvent('boss-defeated');}else if(e.kind==='thrower')n.drops.push({type:'spirit',x:e.x,y:e.y,w:12,h:12,vy:-2});}
}
function ninjaUpdateEntities(){
 const n=ninja,p=player;n.ticks++;
 if(n.stageIntro)n.stageIntro--;
 if(n.attack>=3&&n.attack<=10){const box={x:p.facing>0?p.x+p.w-2:p.x-23,y:p.y+5,w:25,h:20};for(const e of n.foes)if(!e.dead&&overlap(box,e)&&!n.hitIds.has('e'+e.id)){n.hitIds.add('e'+e.id);ninjaHit(e);}
  for(const l of n.lanterns)if(!l.dead&&overlap(box,l)){l.dead=true;n.drops.push({type:l.type,x:l.x,y:l.y,w:12,h:12,vy:-1.8});ninjaDust(l.x+6,l.y+8,'#fac775',6);ninjaSound('pickup');}
  for(const t of solids(box))if(t.content)ninjaBump(t);
  for(const s of n.projectiles)if(!s.friendly&&overlap(box,s)){s.life=0;ninjaDust(s.x,s.y);ninjaEvent('parry');}
 }
 for(const e of n.foes){if(e.dead||e.x>camera+W+8||e.x+e.w<camera-24)continue;e.seen=true;if(e.kind!=='guardian'||n.arena)e.t++;if(e.flash)e.flash--;if(e.cool)e.cool--;
  if(e.kind==='walker'){e.dir=p.x<e.x?-1:1;const dx=e.dir*.55,probe={x:e.x+dx,y:e.y,w:e.w,h:e.h};if(!solids(probe).length&&solids({x:e.x+dx+e.w/2,y:e.y+e.h,w:1,h:2}).length)e.x+=dx;e.attack=Math.abs(e.x-p.x)<38&&e.t%90>65?1:0;}
  else if(e.kind==='hawk'){
   if(!e.phase){e.y=e.oy+Math.sin(e.t*.06)*5;if(Math.abs(p.x-e.x)<125&&e.t>32){e.phase=1;e.cool=30;ninjaEvent('hawk-warning');}}
   else if(e.phase===1&&!e.cool){e.phase=2;const a=Math.atan2(p.y+8-e.y,p.x-e.x);e.vx=Math.cos(a)*1.7;e.vy=Math.sin(a)*1.7;e.cool=75;}
   else if(e.phase===2){e.x+=e.vx;e.y+=e.vy;if(!e.cool||e.y>200||e.y<50){e.phase=3;e.cool=100;}}
   else if(e.phase===3){e.x=approach(e.x,e.ox,1.25);e.y=approach(e.y,e.oy,1.25);if(!e.cool){e.phase=0;e.t=0;}}
  }
  else if(e.kind==='thrower'){e.dir=p.x<e.x?-1:1;if(e.t%140===90){n.projectiles.push({friendly:false,x:e.x+5,y:e.y+8,w:6,h:6,vx:e.dir*1.45,vy:0,life:160});ninjaSound('throw');}}
  else if(e.kind==='guardian'&&n.arena){e.dir=p.x<e.x?-1:1;e.phase=e.t%170;e.attack=e.phase>=50&&e.phase<76?1:0;
   if(e.attack){const nx=clamp(e.x+e.dir*1.35,409,605);if(!solids({x:nx,y:e.y,w:e.w,h:e.h}).length)e.x=nx;}
   if(e.phase===98){for(const vy of [-.5,.45])n.projectiles.push({friendly:false,x:e.x+e.w/2,y:e.y+12,w:6,h:6,vx:e.dir*1.5,vy,life:140});}
  }
 }
 for(const s of n.projectiles){s.x+=s.vx;s.y+=s.vy;s.life--;if(solids(s).length){s.life=0;ninjaDust(s.x,s.y);}if(s.life>0){if(s.friendly){for(const e of n.foes)if(!e.dead&&overlap(s,e)){ninjaHit(e,2);s.life=0;break;}for(const l of n.lanterns)if(!l.dead&&overlap(s,l)){l.dead=true;s.life=0;n.drops.push({type:l.type,x:l.x,y:l.y,w:12,h:12,vy:-1.5});}}else if(overlap(s,p)){ninjaHurt(s);s.life=0;}}}
 n.projectiles=n.projectiles.filter(s=>s.life>0&&s.x>camera-40&&s.x<camera+W+40);
 for(const it of n.drops){it.vy=Math.min(3,(it.vy||0)+.15);it.y+=it.vy;for(const t of solids(it)){if(it.vy>0){it.y=t.y*T-it.h;it.vy=0;}}}
 for(const f of n.fx){f.x+=f.vx;f.y+=f.vy;f.vy+=.055;f.life--;}n.fx=n.fx.filter(f=>f.life>0);
 for(const t of tiles.values())if(t.bump)t.bump--;
 updateParticles();
}
function ninjaBeginFlag(){const n=ninja;if(mode!=='playing')return;mode='flag';n.clearTick=0;n.wall=0;n.attack=0;player.invuln=0;player.vx=0;player.vy=0;flagPhase=0;flagY=48;clearPlayed=false;n.projectiles=[];stopEffects();stopMusic();ninjaSound('flag');ninjaEvent('flag');addScore(1000);}
function ninjaAdvanceFlag(){const n=ninja;n.clearTick++;player.x=NINJA_ROOMS[n.room].goal-9;
 if(n.clearTick<62){player.y=approach(player.y,178,1.4);flagY=Math.min(182,48+n.clearTick*2.3);}
 else{flagPhase=1;player.y=182;if(n.clearTick===62){oneShot('clear');clearPlayed=true;}}
 if(n.clearTick>90&&n.clearTick%6===0&&timeLeft>0){const count=Math.min(8,timeLeft);timeLeft-=count;addScore(count*10);}
 if(n.clearTick>290){mode='win';showOverlay('NINJA CHAPTER COMPLETE','任务完成','三段区域已通关 · 得分 '+score+'<br>墙壁，终于不只是障碍了。','再跑一次 →','ENTER / SPACE TO REPLAY');ninjaEvent('win');}
}
const ninjaLegacyFixed=fixedUpdate;
fixedUpdate=function(){if(hero!=='ryu')return ninjaLegacyFixed();pollMixPad();if(!ninja)return;
 if(mode==='menu'||mode==='paused'||mode==='win'||mode==='gameover'||mode==='respawn'){audioSync();return;}frame++;
 if(mode==='dying'){deathTick++;if(deathTick===1)ninjaEvent('death');if(deathTick>16){player.y+=player.vy;player.vy+=.2;}
  if(deathTick>=90){if(lives>0){resetLife();}else{mode='gameover';showOverlay('THE WALL CAN WAIT','再来一次','本次得分 '+score+' · 检查点 '+(ninjaSavedRoom+1)+'<br>新一轮将从城外开始。','重新开始 →','ENTER / SPACE');}}audioSync();return;}
 if(mode==='flag'){ninjaAdvanceFlag();audioSync();return;}
 if(ninja.transition){ninja.transition--;if(ninja.transition===20){const target=ninja.transitionTo;ninjaLoadRoom(target,true);ninja.transition=19;ninja.transitionTo=null;}audioSync();return;}
 ninjaUpdatePlayer(getInput());if(mode==='playing'&&!ninja.transition){ninjaUpdateEntities();timerTicks++;if(timerTicks>=60){timerTicks=0;if(--timeLeft<=0)die();}}audioSync();
};
const ninjaLegacyDie=die;die=function(){if(hero!=='ryu')return ninjaLegacyDie();if(mode!=='playing')return;ninja.wall=0;ninja.attack=0;mode='dying';deathTick=0;player.vy=-3.8;player.vx=0;lives--;stopMusic();stopEffects();ninjaSound('death');};
/* A small native pixel-sprite rig, drawn on the same 256x240 canvas as the base game. */
function ninjaFigure(g,x,y,face,pose,t=0,palette=null){const c=palette||{dark:'#18334e',blue:'#3967ad',light:'#85bfdc',skin:'#f7cf99',scarf:'#c85355',ink:'#091422'};g.save();g.translate(Math.round(x+6),Math.round(y+26));g.scale(face<0?-1:1,1);const b=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 const crouch=pose==='wall',hurt=pose==='hurt',run=pose==='run',slash=pose==='slash',air=pose==='air',win=pose==='win';const k=run?Math.floor(t/5)%4:0,bob=run&&k%2?1:0;
 g.translate(0,bob);b(-5,-25,10,8,c.ink);b(-4,-26,8,7,c.blue);b(-5,-22,11,3,c.dark);b(0,-23,6,2,c.skin);b(3,-23,1,1,'#fff7de');b(-5,-18,11,10,c.dark);b(-3,-18,7,8,c.blue);b(-3,-17,2,6,c.light);b(-5,-9,12,3,c.scarf);b(-5,-25,8,2,c.scarf);
 const wave=Math.floor(t/5)%3;b(-10,-24+wave,6,2,c.scarf);b(-14,-23+wave,5,2,c.scarf);
 // Katana sheath crossing the back.
 if(!slash){b(-7,-20,2,14,c.ink);b(-7,-26,2,6,c.skin);b(-8,-21,4,1,c.light);}
 if(crouch){const q=Math.floor(t/7)%2;b(3,-19,4,4,c.blue);b(5,-26+q*2,3,8,c.blue);b(6,-28+q*2,3,3,c.skin);b(-6,-9-q*2,4,6,c.blue);b(-7,-4-q*2,5,3,c.dark);b(2,-10+q*2,5,4,c.light);b(5,-7+q*2,3,5,c.blue);b(5,-3+q*2,5,3,c.dark);}
 else if(air||hurt){b(-7,-17,3,7,c.blue);b(5,-18,3,6,c.blue);b(5,-13,3,2,c.skin);b(-4,-7,4,6,c.blue);b(-7,-3,7,3,c.dark);b(2,-7,4,3,c.light);b(4,-6,5,3,c.blue);b(7,-4,3,3,c.dark);}
 else {b(-4,-6,4,5+(k===1?0:2),c.blue);b(2,-6,4,5+(k===3?0:2),c.blue);b(-6+(k===1?2:0),-1,6,2,c.dark);b(1+(k===3?2:0),-1,7,2,c.dark);b(-6,-17,3,7,c.blue);b(-6,-11,3,2,c.skin);b(5,-17,3,7,c.blue);b(5,-11,3,2,c.skin);}
 if(slash){b(3,-19,8,4,c.blue);b(9,-19,4,3,c.skin);b(12,-22,2,8,c.skin);b(14,-19,21,2,'#eaf7e8');b(19,-21,15,1,c.light);b(32,-20,4,1,'#fff');b(4,-7,6,6,c.blue);b(7,-1,5,2,c.dark);}
 if(win){b(5,-20,3,7,c.blue);b(7,-25,3,6,c.skin);b(9,-35,2,13,'#eaf7e8');b(7,-25,6,2,c.skin);}
 g.restore();}
function ninjaDrawBackground(){const n=ninja,def=NINJA_ROOMS[n.room];rect(0,0,W,H,'#111d35');rect(0,108,W,100,'#1b2f49');
 const moonX=204-Math.floor(camera*.035);rect(moonX,49,23,20,'#dfe6cc');rect(moonX+3,46,17,26,'#dfe6cc');rect(moonX-1,51,13,16,'#abc7c8');
 for(let i=0;i<28;i++){const x=((i*73+17-Math.floor(camera*.06))%256+256)%256,y=44+(i*37)%73;rect(x,y,1,i%3?1:2,i%4?'#65899d':'#b5d2d6');}
 for(let i=-1;i<10;i++){const x=i*46-Math.floor(camera*.18)%46,y=117+((i+20)%3)*11;rect(x,y,30,91,'#243f55');polygon([[x-5,y],[x+15,y-16],[x+35,y]],'#2e5063');rect(x+7,y+10,4,5,'#477284');}
 for(let i=-1;i<7;i++){const x=i*73-Math.floor(camera*.34)%73;rect(x,163,56,45,'#19323f');rect(x+4,159,9,7,'#254653');rect(x+23,159,9,7,'#254653');rect(x+42,159,9,7,'#254653');}
 if(n.room===2){const x=655-camera;rect(x,132,61,76,'#374859');rect(x-4,127,70,7,'#718b8d');for(let i=0;i<5;i++)rect(x+i*14-2,120,8,9,'#7e9693');rect(x+18,166,23,42,'#091525');rect(x+10,145,6,10,'#efbd6b');rect(x+45,145,6,10,'#efbd6b');}
 for(const [x,y,s] of def.signs){if(x-camera>-180&&x-camera<W){rect(x-camera-3,y-3,s.length*4+6,12,'#112337');text(s,x-camera,y,'#bad1c9',.65);}}
}
function ninjaDrawTile(t){const x=t.x*T-camera,y=t.y*T-(t.bump?Math.sin(t.bump/10*Math.PI)*3:0);if(t.type==='pipe')return;
 if(t.type==='question'){rect(x,y,16,16,t.used?'#796554':'#e5ad58');rect(x+1,y+1,14,1,'#ffe09b');rect(x,y+15,16,1,'#443e38');rect(x+15,y,1,16,'#846039');if(!t.used)text('?',x+5,y+4,'#634032');else rect(x+3,y+3,2,2,'#b49b73');return;}
 if(t.type==='ground'){rect(x,y,16,16,'#584c49');rect(x,y,16,2,t.y===13?'#aac39e':'#786658');rect(x+1,y+3,14,1,'#756958');rect(x+7,y+5,1,9,'#3c3b3c');rect(x,y+10,7,1,'#303442');rect(x+8,y+7,8,1,'#343a42');}
 else{rect(x,y,16,16,'#785d55');rect(x,y,16,2,'#c6a67b');rect(x,y+8,16,1,'#352d37');rect(x+7,y+1,1,7,'#352d37');rect(x+2,y+9,1,7,'#352d37');rect(x+11,y+9,1,7,'#352d37');rect(x,y+15,16,1,'#392f36');}
}
function ninjaDrawPipe(p){const x=p.x-camera;rect(x+2,p.y+8,p.w-4,p.h*T-8,'#2d7177');rect(x+4,p.y+8,5,p.h*T-8,'#4c9f99');rect(x+p.w-7,p.y+8,4,p.h*T-8,'#174750');rect(x,p.y,p.w,9,'#245260');rect(x+1,p.y+1,p.w-2,6,'#5da6a0');rect(x+4,p.y+1,5,6,'#a6d2b7');rect(x,p.y+8,p.w,1,'#102e40');
 for(let y=p.y+18;y<208;y+=14){rect(x+7,y,4,2,'#88bfb0');rect(x+p.w-11,y+4,4,2,'#174750');}}
function ninjaDrawEnemy(e){if(e.dead)return;const x=Math.round(e.x-camera),y=Math.round(e.y);ctx.save();if(e.flash&&e.flash%2)ctx.globalAlpha=.4;
 if(e.kind==='hawk'){const wing=e.phase===1?0:Math.floor(e.t/5)%3;rect(x+4,y+4,10,5,'#bf755d');rect(x+11,y+3,7,5,'#e2b985');rect(x+16,y+5,3,2,'#f7d574');rect(x+14,y+4,1,1,'#091828');polygon([[x+6,y+6],[x-4,y-5+wing*5],[x+10,y+2]],'#816375');polygon([[x+8,y+7],[x+18,y+13-wing*4],[x+15,y+4]],'#b08383');if(e.phase===1){text('!',x+7,y-12,'#ffdf9b');}}
 else if(e.kind==='guardian'){ctx.save();ctx.translate(x+12,y+40);ctx.scale(e.dir,1);rect(-11,-39,22,39,'#111a2a');rect(-8,-37,17,11,'#c68b60');rect(-10,-39,22,5,'#754753');rect(0,-33,8,2,'#f8d9aa');rect(-9,-25,20,17,'#914c50');rect(-7,-22,5,12,'#cf825f');rect(-10,-9,8,9,'#3c4663');rect(4,-9,8,9,'#3c4663');rect(8,-24,6,18,e.phase<50?'#86b1ae':'#b17763');if(e.attack){rect(12,-23,25,3,'#faf0cd');rect(20,-27,17,2,'#cfdbc8');}else rect(13,-33,3,20,'#c4d7d0');if(e.phase>=20&&e.phase<50)text('!',-2,-49,'#f8cc79');ctx.restore();}
 else{ninjaFigure(ctx,x,y,e.dir,e.attack?'slash':e.kind==='thrower'?'idle':'run',e.t,{dark:'#56374e',blue:e.kind==='thrower'?'#807298':'#a86865',light:'#d6a28d',skin:'#e9c392',scarf:'#5ca69b',ink:'#152136'});if(e.kind==='thrower'&&e.t%140>=65&&e.t%140<90)text('!',x+3,y-12,'#ffdf9b');}ctx.restore();}
function ninjaDraw(){if(!ninja){ninjaDrawMenu();return;}const n=ninja;ctx.imageSmoothingEnabled=false;ninjaDrawBackground();
 // Deliberately draw only the currently visible range, matching base-game pixel coordinates.
 for(const t of tiles.values())if(t.x*T>=camera-16&&t.x*T<camera+W)ninjaDrawTile(t);
 for(const p of pipes)if(p.x>=camera-40&&p.x<camera+W)ninjaDrawPipe(p);
 for(const c of looseCoins)drawCoin(c.x-camera,c.y);
 for(const l of n.lanterns)if(!l.dead){const x=l.x-camera;rect(x+5,l.y-7,1,7,'#9ea699');rect(x+1,l.y,10,3,'#4d474b');rect(x+2,l.y+3,8,10,'#daaa68');rect(x+4,l.y+4,4,8,Math.floor(frame/12)%2?'#f9e2a1':'#ebcb80');rect(x+1,l.y+13,10,3,'#4d474b');}
 for(const d of n.drops){rect(d.x-camera,d.y,12,12,'#1a3447');rect(d.x-camera+2,d.y+2,8,8,d.type==='health'?'#cf7668':'#8acbd0');text(d.type==='health'?'+':'S',d.x-camera+3,d.y+3,'#fff2cb',.7);}
 for(const e of n.foes)if(e.x>=camera-40&&e.x<camera+W+30)ninjaDrawEnemy(e);
 for(const s of n.projectiles){const x=s.x-camera+3,y=s.y+3;ctx.save();ctx.translate(x,y);ctx.rotate(frame*.5);rect(-5,-1,10,2,s.friendly?'#c6eff2':'#edb88e');rect(-1,-5,2,10,s.friendly?'#c6eff2':'#edb88e');rect(-1,-1,2,2,'#183448');ctx.restore();}
 const def=NINJA_ROOMS[n.room];if(n.room<2){const x=def.goal-camera;rect(x-4,163,3,45,'#639d94');rect(x+20,163,3,45,'#639d94');rect(x-8,160,35,5,'#acc4a1');polygon([[x+3,175],[x+13,181],[x+3,187]],'#e6ca81');}
 else{const x=def.goal-camera;rect(x,52,2,156,'#c9d8b6');rect(x-2,48,6,5,'#f4d68a');polygon([[x,mode==='flag'||mode==='win'?flagY:59],[x-17,(mode==='flag'||mode==='win'?flagY:59)+7],[x,(mode==='flag'||mode==='win'?flagY:59)+14]],n.bossDefeated?'#d97667':'#566b75');if(!n.bossDefeated){rect(633-camera,116,5,92,'#678f93');for(let y=122;y<208;y+=10)rect(629-camera,y,13,3,'#bd9d79');}}
 if(n.arena&&!n.bossDefeated){rect(395-camera,80,3,128,'#cd9d6e');for(let y=84;y<208;y+=12)rect(389-camera,y,14,2,'#97b8a9');}
 if(!player.invuln||Math.floor(frame/4)%2===0||mode==='dying')ninjaFigure(ctx,player.x-camera,player.y,player.facing,mode==='dying'||n.hit?'hurt':mode==='flag'&&n.clearTick>62||mode==='win'?'win':n.wall?'wall':n.attack?'slash':!player.grounded?'air':Math.abs(player.vx)>.2?'run':'idle',frame);
 if(n.attack>=3&&n.attack<=10){ctx.save();ctx.translate(player.x-camera+6,player.y+15);ctx.scale(player.facing,1);ctx.strokeStyle=n.attack%2?'#f7e4ad':'#acdfe1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(7,-1,23,-.65,1);ctx.stroke();ctx.restore();}
 for(const f of n.fx)rect(f.x-camera,f.y,f.life>10?2:1,2,f.color);
 for(const f of floaters)text(f.text,f.x-camera,f.y,'#f8deb4',.8,true);
 rect(0,0,W,37,'#0a1323');text('RYU',8,7,'#e8dfc1');for(let i=0;i<16;i++)rect(36+i*5,7,4,6,i<n.hp?'#cce1b7':'#2c3c50');text('SP '+String(n.spirit).padStart(2,'0'),125,7,'#8cd3d8');text('N-'+(n.room+1),205,7,'#e4bc7c');text(String(score).padStart(6,'0'),8,23,'#cfdbcb');text('LIFE '+lives,84,23,'#cfdbcb');text('TIME '+String(timeLeft).padStart(3,'0'),174,23,'#cfdbcb');
 if(n.arena&&!n.bossDefeated){const boss=n.foes.find(e=>e.kind==='guardian');text('GUARD',8,43,'#e1bb96',.7);for(let i=0;i<12;i++)rect(43+i*5,44,4,4,i<boss.hp?'#d99078':'#493f4a');}
 if(n.stageIntro>0){const title=n.bossDefeated?'THE GATE IS OPEN':n.arena?'WATCH. DODGE. STRIKE.':def.title;rect(10,218,236,16,'#112337');text(title,128,223,'#e9d5a5',.75,true);}
 if(n.transition){ctx.save();ctx.globalAlpha=1-Math.abs(n.transition-20)/20;rect(0,0,W,H,'#091525');ctx.restore();}
 updateUi();updateHeroUI();$('stateLabel').textContent=mode==='playing'?def.name:mode==='flag'?'忍者专属通关演出':mode==='win'?'忍者篇通关':mode==='paused'?'已暂停':mode==='dying'?'从本区检查点重试':'准备出发';$('distanceLabel').textContent='N-'+(n.room+1)+' / 3 · '+Math.round((n.room+player.x/def.width)/3*100)+'%';
}
function ninjaDrawMenu(){rect(0,0,W,H,'#111d35');for(let i=0;i<8;i++){rect(i*40,170-(i%3)*20,32,80,'#254353');}ninjaFigure(ctx,114,150,1,'win',0);}
const ninjaLegacyDraw=draw;draw=function(){if(hero==='ryu')return ninjaDraw();ninjaLegacyDraw();if(hero==='megaman'&&ninjaHitLock&&player&&mode==='playing'){ctx.save();ctx.globalAlpha=.25;rect(player.x-camera-5,player.y-3,22,player.h+4,'#9deaff');ctx.restore();}};
/* Original, deterministic 8-bit score. All routing uses the existing mixer, volume,
 * mute, pause, and audio log. No extra HTMLAudioElement or duplicate music engine. */
const NINJA_TUNES={
 ryu_theme:{step:.115,loop:true,notes:[64,0,67,71,76,71,67,0,62,0,66,69,74,69,66,0,60,0,64,67,72,67,64,0,59,62,66,71,69,66,62,0,64,67,71,76,79,76,71,67,62,66,69,74,78,74,69,66,60,64,67,72,76,72,67,64,59,62,66,71,74,71,66,62]},
 ryu_clear:{step:.16,notes:[64,67,71,76,0,74,71,67,69,71,76,0,79,78,76,0,83,0,0,0]},
 bill_clear:{step:.12,notes:[60,60,67,0,72,72,70,67,65,67,72,0,75,74,72,0,0,0,0,0]},
 mega_clear:{step:.13,notes:[72,76,79,84,83,79,76,72,74,77,81,86,84,0,79,0,84,0,0,0]},
 ryu_flag:{step:.075,notes:[52,59,64,67,71,76,0,0]},bill_flag:{step:.07,notes:[48,48,55,60,67,0]},mega_flag:{step:.06,notes:[72,76,79,84,88,0]}
};
function ninjaRenderTune(ac,score){const sr=ac.sampleRate,step=score.step,duration=score.notes.length*step,buf=ac.createBuffer(1,Math.ceil(duration*sr),sr),out=buf.getChannelData(0);for(let i=0;i<out.length;i++){const t=i/sr,k=Math.floor(t/step),u=t%step,note=score.notes[k];if(!note)continue;const f=440*Math.pow(2,(note-69)/12),env=Math.min(1,u/.006)*Math.max(0,1-u/(step*.96));const pulse=(t*f%1<.25?1:-1),bass=Math.asin(Math.sin(2*Math.PI*t*f/4))*2/Math.PI;const h=(t*f*1.5%1<.125?1:-1);out[i]=(.135*pulse+.065*bass+.035*h)*env;}return buf;}
function ninjaMakeAudio(){if(!audio)return;ninjaAudioContext=audio;for(const [key,tune] of Object.entries(NINJA_TUNES))if(!bank.has(key))bank.set(key,{buffer:ninjaRenderTune(audio,tune),gain:.65});}
const ninjaLegacyAudioInit=audioInit;audioInit=function(resume=true){const ac=ninjaLegacyAudioInit(resume);ninjaMakeAudio();return ac;};
function ninjaSound(name){if(!audio||!soundOn)return;const melody={jump:[67,76],wall:[76,83],slash:[45,37],throw:[88,79,72],hurt:[60,51,40],hit:[82,58],block:[95,91],pickup:[76,83,88],gate:[64,71,76],death:[64,60,55,48,40],empty:[43,43],flag:[64,71,76]};const key='ninja_'+name;if(!bank.has(key))bank.set(key,{buffer:ninjaRenderTune(audio,{notes:melody[name]||[76],step:name==='death'?.12:.045}),gain:.75});oneShot(key);}
const ninjaLegacyMusic=desiredMusic;desiredMusic=function(){return hero==='ryu'?(mode==='playing'?'ryu_theme':null):ninjaLegacyMusic();};
const ninjaLegacyOneShot=oneShot;oneShot=function(key,options={}){if(hero!=='mario'&&key==='clear')key=hero==='bill'?'bill_clear':hero==='megaman'?'mega_clear':'ryu_clear';if(hero!=='mario'&&key==='flag')key=hero==='bill'?'bill_flag':hero==='megaman'?'mega_flag':'ryu_flag';return ninjaLegacyOneShot(key,options);};
const ninjaLegacySync=audioSync;audioSync=function(){if(hero!=='ryu')return ninjaLegacySync();if(!audio)return;if(mode==='paused'||document.hidden||!soundOn){stopMusic(true);return;}if(mode==='playing')playMusic('ryu_theme');else stopMusic(false);};
const ninjaLegacyPanel=updateAudioPanel;updateAudioPanel=function(){ninjaLegacyPanel();const loaded=AUDIO_MANIFEST.filter(m=>bank.has(m.key)).length;$('audioBadge').textContent='AUDIO '+loaded+'/'+AUDIO_MANIFEST.length;if(hero==='ryu'&&audio)$('audioStatus').textContent='忍者篇使用本次创作的 8-bit 配乐与音效；不是原作音轨。';else if(loaded===AUDIO_MANIFEST.length)$('audioStatus').textContent='完整音频已就绪 · 新增角色专属通关曲';};
// A fourth character card; arrow/gamepad cycling is generalized by build.py.
const ninjaCard=document.createElement('button');ninjaCard.className='secondary';ninjaCard.dataset.hero='ryu';ninjaCard.setAttribute('aria-pressed','false');ninjaCard.innerHTML='<canvas width="64" height="80" aria-hidden="true"></canvas><strong>隼龙</strong><small>NEW · 忍者篇</small>';$('heroPicker').appendChild(ninjaCard);ninjaCard.addEventListener('click',()=>selectHero('ryu'));
const portrait=ninjaCard.querySelector('canvas').getContext('2d');portrait.imageSmoothingEnabled=false;portrait.scale(2,2);ninjaFigure(portrait,10,10,1,'win',0);
selectHero('ryu');$('overlayLabel').textContent='EPISODE 02 / NINJA CROSSOVER';$('overlayTitle').innerHTML='忍者来了';$('overlayText').textContent=heroHelp.ryu;
if((new URLSearchParams(location.search).has('test')||document.documentElement.dataset.test==='1'))window.__ninjaTest={
 config:NINJA_CONFIG,rooms:NINJA_ROOMS,
 state(){return ninja?{room:ninja.room,hp:ninja.hp,spirit:ninja.spirit,wall:ninja.wall,wallLock:ninja.wallLock,attack:ninja.attack,hit:ninja.hit,transition:ninja.transition,arena:ninja.arena,bossDefeated:ninja.bossDefeated,foes:ninja.foes.map(e=>({...e})),projectiles:ninja.projectiles.map(s=>({...s})),events:ninja.events.slice(),savedRoom:ninjaSavedRoom}:null;},
 place(x,y){Object.assign(player,{x,y,vx:0,vy:0,grounded:false,invuln:0});ninja.wall=0;ninja.hit=0;mode='playing';draw();},
 room(i){if(i<0||i>=NINJA_ROOMS.length)throw new RangeError('room');ninjaLoadRoom(i);draw();},
 hurt(x){ninjaHurt({x,y:player.y,w:12,h:20});draw();},clearFoes(){ninja.foes=[];},
 setEnemy(id,values){Object.assign(ninja.foes.find(e=>e.id===id),values);},
 clearAudio(){audioLog.length=0;},audio:()=>({context:audio?.state,bgm:bgm?.key,voices:[...voices].map(v=>v.key),log:audioLog.slice()}),
 flag(){ninja.bossDefeated=true;ninjaBeginFlag();},tunes:NINJA_TUNES,
};
