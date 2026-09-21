/* 0.4.0 input / feel repair. No map, progression, or asset replacements.
 * Input events are latched until a 60 Hz simulation tick, not sampled away.
 * All helpers remain inside the original game's closure; only tests export debug state.
 */
const R04_FEEL = Object.freeze({
 version:'0.4.0', speed:2.1, groundAccel:.8, groundBrake:1.05,
 airAccel:.5, airBrake:.35, crouchSpeed:.85, jumpSpeed:5.6,
 gravity:.28, fallCap:5.0, jumpCut:3.4, jumpBuffer:8, coyote:6,
 climbSpeed:1.35, descendSpeed:1.4, wallJumpX:2.65, wallJumpY:5.35,
 wallCommit:4, wallRegrab:10, mantleHeight:5, commandBuffer:8,
 slashFrames:14, slashCooldown:18, tankSpeed:1.4,
 turnAssist:3.5, iceFrames:20
});
let r04TickInput=null,r04Previous={},r04Pending={},r04Serial=0;
const r04KeyOrder=new Map(),r04TouchOrder=new Map();
let r04DirOrder={left:0,right:0,up:0,down:0},r04PadHeld={},r04SampleHeld={},r04PadOrder={};
const R04_KEY={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyK:'jump',KeyZ:'jump',KeyJ:'run',KeyX:'run',ShiftLeft:'run',ShiftRight:'run',KeyL:'special',KeyE:'cycle'};
const R04_DIR_NAMES=['right','down','left','up'];
const r04Playing=()=>r12IsHero()&&['playing','dying','flag'].includes(mode);
function r04Queue(a){r04Pending[a]=true;if(R04_DIR_NAMES.includes(a))r04DirOrder[a]=++r04Serial;}
function r04Clear(){r04Pending={};r04Previous={};r04SampleHeld={};r04PadHeld={};r04PadOrder={};r04KeyOrder.clear();r04TouchOrder.clear();r04DirOrder={left:0,right:0,up:0,down:0};r04TickInput=null;}
function r04ClearCommands(){r04Pending={};if(ninja){ninja.buffer=0;ninja.command=null;}if(r12)r12.tank.fireBuffer=0;}
// Capture relay controls before legacy handlers. Global/menu commands retain their handlers.
window.addEventListener('keydown',e=>{
 const a=R04_KEY[e.code];if(!a||!r04Playing())return;
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target?.isContentEditable)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(!keys.has(e.code)){keys.add(e.code);r04KeyOrder.set(e.code,++r04Serial);if(mode==='playing'&&!r12?.transition)r04Queue(a);else if(R04_DIR_NAMES.includes(a))r04DirOrder[a]=r04Serial;}
 audioInit();
},true);
window.addEventListener('keyup',e=>{
 if(!R04_KEY[e.code])return;keys.delete(e.code);r04KeyOrder.delete(e.code);
 if(r12IsHero()&&mode!=='menu'){e.preventDefault();e.stopImmediatePropagation();}
},true);
window.addEventListener('blur',()=>{r04Clear();keys.clear();touch.clear();},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden){r04Clear();keys.clear();touch.clear();}},true);
function r04RefreshTouch(){for(const b of document.querySelectorAll('[data-action]'))b.classList.toggle('pressed',[...touch.values()].includes(b.dataset.action));}
function r04TouchSet(id,a){const prev=touch.get(id);if(prev===a)return;if(a){touch.set(id,a);r04TouchOrder.set(id,++r04Serial);if(mode==='playing'&&!r12?.transition)r04Queue(a);}else{touch.delete(id);r04TouchOrder.delete(id);}r04RefreshTouch();}
document.addEventListener('pointerdown',e=>{
 const b=e.target.closest?.('[data-action]');if(!b||!r04Playing())return;
 e.preventDefault();e.stopImmediatePropagation();audioInit();r04TouchSet(e.pointerId,b.dataset.action);b.setPointerCapture(e.pointerId);
},true);
document.addEventListener('pointermove',e=>{
 if(!r04TouchOrder.has(e.pointerId)||!r12IsHero())return;
 const b=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-action]');
 e.preventDefault();e.stopImmediatePropagation();
 // Maintain capture while a finger briefly leaves a button, but never a stuck direction.
 const oldOrder=r04TouchOrder.get(e.pointerId);r04TouchSet(e.pointerId,b?.dataset.action||null);if(!b)r04TouchOrder.set(e.pointerId,oldOrder);
},true);
for(const event of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(event,e=>{
 if(!r04TouchOrder.has(e.pointerId))return;r04TouchSet(e.pointerId,null);r04TouchOrder.delete(e.pointerId);
},true);
function r04RawInput(){
 const t={left:false,right:false,up:false,down:false,jump:false,run:false,special:false,cycle:false};
 if(virtualInput){Object.assign(t,virtualInput);return t;}
 for(const c of keys){const a=R04_KEY[c];if(a)t[a]=true;}
 for(const a of touch.values())t[a]=true;
 try{const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected!==false&&p);if(pad){
  const ph={};const pressed=i=>!!pad.buttons[i]?.pressed;
  for(const [a,axis,sign,button] of [['left',0,-1,14],['right',0,1,15],['up',1,-1,12],['down',1,1,13]])ph[a]=pressed(button)||(pad.axes[axis]||0)*sign>(r04PadHeld[a]?.25:.4);
  ph.jump=pressed(0)&&!padActionConsumed;ph.run=pressed(1)||pressed(2);ph.special=pressed(3);ph.cycle=pressed(4);
  for(const [a,v] of Object.entries(ph)){if(v&&!r04PadHeld[a]){r04Queue(a);if(R04_DIR_NAMES.includes(a))r04PadOrder[a]=r04DirOrder[a];}if(!v)delete r04PadOrder[a];t[a]||=v;}r04PadHeld=ph;
 }}catch{}
 return t;
}
function r04Sample(){
 const t=r04RawInput();for(const a of R04_DIR_NAMES)if(t[a]&&!r04SampleHeld[a]&&!r04Pending[a])r04DirOrder[a]=++r04Serial;
 if(!virtualInput)for(const a of R04_DIR_NAMES){const ranks=[r04PadOrder[a]||0];for(const [code,v] of r04KeyOrder)if(keys.has(code)&&R04_KEY[code]===a)ranks.push(v);for(const [id,v] of r04TouchOrder)if(touch.get(id)===a)ranks.push(v);r04DirOrder[a]=Math.max(...ranks);}
 for(const a of ['jump','run','special','cycle','down','up'])t[a+'Pressed']=!!r04Pending[a]||!!(t[a]&&!r04Previous[a]);
 t.moveDir=t.moveDir??R04_DIR_NAMES.reduce((best,a,i)=>t[a]&&(best===null||r04DirOrder[a]>r04DirOrder[R04_DIR_NAMES[best]])?i:best,null);
 t.horizontal=t.left&&t.right?(r04DirOrder.left>r04DirOrder.right?-1:1):t.left?-1:t.right?1:0;
 r04SampleHeld={...t};r04Pending={};return t;
}
const r04LegacyInput=getInput;
getInput=function(){return r12IsHero()?(r04TickInput||r04RawInput()):r04LegacyInput();};
const r04PrevStart=startGame;
startGame=function(){r04Clear();return r04PrevStart();};
const r04PrevChars=showCharacters;
showCharacters=function(){r04Clear();return r04PrevChars();};
const r04PrevPause=togglePause;
togglePause=function(){const before=mode;r04PrevPause();if(r12IsHero()&&before!==mode){r04Clear();r04ClearCommands();}};
const r04PrevLoad=r12Load;
r12Load=function(area,preserve=false,spawn=null,keepGeometry=false){
 const heldKeys=new Set(keys),heldTouches=new Map(touch),prior=r04TickInput||r04RawInput();
 r04PrevLoad(area,preserve,spawn,keepGeometry);
 // Area changes preserve held movement; menu/start/focus changes deliberately do not.
 for(const k of heldKeys)keys.add(k);for(const [id,a] of heldTouches)touch.set(id,a);
 r04Pending={};r04Previous={...prior};r04RefreshTouch();
 if(ninja){ninja.command=null;ninja.kickCommit=0;ninja.wall=0;ninja.buffer=0;ninja.coyote=0;}
 if(r12){r12.tank.fireBuffer=0;r12.tank.glide=0;r12.tank.turnAssist=0;r12.r04Area=area;}
};
// Deterministic, swept movement with exact surface contact, including stationary grounding.
const r04OldNinjaMove=ninjaMove;
ninjaMove=function(dx,dy){
 if(!r12||hero!=='ryu')return r04OldNinjaMove(dx,dy);
 const p=player,eps=.001;const chunks=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3));
 p.grounded=false;
 for(let i=0;i<chunks;i++){
  const sx=dx/chunks,sy=dy/chunks;
  if(sx){p.x+=sx;const walls=solids(p);if(walls.length){p.x=sx>0?Math.min(p.x,...walls.map(t=>t.x*T-p.w)):Math.max(p.x,...walls.map(t=>(t.x+1)*T));p.vx=0;dx=0;}}
  if(sy){p.y+=sy;let hits=solids(p);
   // A tiny head-corner correction, not passage through a ceiling.
   if(sy<0&&hits.length===1){const b=hits[0],left=p.x+p.w-b.x*T,right=(b.x+1)*T-p.x;const shift=left>0&&left<=2.5?-left:right>0&&right<=2.5?right:0;
    if(shift&&!solids({...p,x:p.x+shift}).length){p.x+=shift;hits=[];}}
   if(hits.length){if(sy>0){p.y=Math.min(p.y,...hits.map(t=>t.y*T-p.h));p.grounded=true;}else{p.y=Math.max(p.y,...hits.map(t=>(t.y+1)*T));const candidate=hits.filter(t=>t.content||t.type==='question').sort((a,b)=>Math.abs(a.x*T+8-(p.x+p.w/2))-Math.abs(b.x*T+8-(p.x+p.w/2)))[0];if(candidate)ninjaBump(candidate);}p.vy=0;dy=0;}
  }
 }
 if(p.vy>=0&&!p.grounded){const foot={x:p.x+eps,y:p.y+p.h,w:p.w-2*eps,h:.4};if(solids(foot).length){p.grounded=true;p.vy=0;}}
};
function r04Mantle(side){
 const p=player,bottom=p.y+p.h;
 const face=solids({x:side>0?p.x+p.w:p.x-1,y:p.y,w:1,h:p.h+1});
 for(const tile of face){const top=tile.y*T,raise=bottom-top;if(raise<-.01||raise>R04_FEEL.mantleHeight)continue;
  const x=p.x+side*2,y=top-p.h;
  if(solids({x:p.x,y,w:p.w,h:p.h}).length||solids({x,y,w:p.w,h:p.h}).length)continue;
  let safe=true;for(let k=1;k<=2;k++)if(solids({x:p.x+side*k,y,w:p.w,h:p.h}).length){safe=false;break;}
  if(!safe)continue;p.x=x;p.y=y;p.vx=0;p.vy=0;p.grounded=true;ninja.wall=0;r12Event('mantle',{side});return true;
 }return false;
}
ninjaSwing=function(){const n=ninja;if(n.cool||n.hit)return false;n.attack=R04_FEEL.slashFrames;n.cool=R04_FEEL.slashCooldown;n.attackId++;n.hitIds.clear();ninjaSound('slash');r12Event('sword');return true;};
r12NinjaPlayer=function(input){
 const p=player,n=ninja,c=R04_FEEL,d=input.horizontal??((input.right?1:0)-(input.left?1:0));
 for(const k of ['invuln','star'])if(p[k]>0)p[k]--;
 for(const k of ['cool','attack','wallLock','kickCommit'])if(n[k]>0)n[k]--;
 if(input.cyclePressed){n.weapon=n.unlocked[(n.unlocked.indexOf(n.weapon)+1)%n.unlocked.length];r12Message(R12_WEAPONS[n.weapon].label,65);}
 if(input.jumpPressed)n.buffer=c.jumpBuffer;else if(n.buffer)n.buffer--;
 if(p.grounded)n.coyote=c.coyote;else if(n.coyote)n.coyote--;
 if(input.specialPressed||(input.up&&input.runPressed))n.command={kind:'special',ttl:c.commandBuffer};
 else if(input.runPressed)n.command={kind:'slash',ttl:c.commandBuffer};
 else if(n.command&&--n.command.ttl<=0)n.command=null;
 const wantCrouch=input.down&&p.grounded&&!input.jumpPressed&&!n.wall,desired=wantCrouch?16:26;
 if(desired<p.h||!solids({x:p.x,y:p.y+p.h-desired,w:p.w,h:desired}).length){p.y+=p.h-desired;p.h=desired;}p.crouch=p.h===16;
 // At the marked cliff only: DOWN from the outermost 4 px catches the ledge.
 // No activation on a free fall, no activation without DOWN, and no map mutation.
 if(!n.hit&&r12.area==='underground'&&p.grounded&&input.down&&!input.jumpPressed){
  const side=p.x>=1270&&p.x<=1280?-1:p.x>=1328&&p.x<=1338?1:0;
  if(side){const x=side<0?1280:1316,y=186;if(!solids({x,y,w:p.w,h:26}).length){p.x=x;p.y=y;p.h=26;p.crouch=false;p.grounded=false;p.vx=p.vy=0;n.wall=side;n.coyote=0;n.descentGrip=true;r12Event('cliff-edge-catch',{side});}}
 }
 if(!input.down||input.jumpPressed)n.descentGrip=false;
 const previousBottom=p.y+p.h;
 if(n.hit){n.hit--;n.wall=0;p.vy=Math.min(c.fallCap,p.vy+c.gravity);ninjaMove(p.vx,p.vy);p.vx*=.94;}
 else{
  if(d)p.facing=d;
  const oldWall=n.wall,l=ninjaTouchWall(-1),r=ninjaTouchWall(1);let wall=0;
  if(!p.grounded){
   // Do not magnetically arrest an ordinary upward jump against a wall.
   const catchAllowed=p.vy>=0||input.up||input.down||oldWall;
   if(catchAllowed){if(r&&(d>0||oldWall===1||input.up||input.down))wall=1;else if(l&&(d<0||oldWall===-1||input.up||input.down))wall=-1;}
   if(oldWall&&d===-oldWall&&!n.descentGrip&&!n.buffer&&!input.runPressed&&!input.specialPressed&&!input.run&&!input.special){wall=0;n.wallFrom=oldWall;n.wallLock=c.wallRegrab;}
   if(n.wallLock&&wall===n.wallFrom)wall=0;
  }
  n.wall=wall;if(wall&&!oldWall)r12Event('wall-grab',{side:wall});
  let jumped=false;
  if(n.buffer&&(n.wall||n.coyote)){
   if(n.wall){const side=n.wall;p.vx=-side*c.wallJumpX;p.vy=-c.wallJumpY;p.facing=-side;n.wallFrom=side;n.wallLock=c.wallRegrab;n.kickCommit=c.wallCommit;n.wall=0;ninjaSound('wall');r12Event('wall-jump',{side});}
   else{p.vy=-c.jumpSpeed;ninjaSound('jump');r12Event('jump');}
   p.grounded=false;n.coyote=0;n.buffer=0;jumped=true;
  }
  if(n.wall){p.facing=n.wall;p.vx=0;p.vy=input.up?-c.climbSpeed:input.down?c.descendSpeed:0;
   if(!(input.up&&r04Mantle(n.wall))){const oldY=p.y;ninjaMove(0,p.vy);n.climbTravel=(n.climbTravel||0)+Math.abs(p.y-oldY);if(input.up)r04Mantle(n.wall);if(n.wall&&!ninjaTouchWall(n.wall)){n.wall=0;p.vy=Math.min(0,p.vy);}}
  }else{
   if(!n.kickCommit){const speed=p.crouch?c.crouchSpeed:c.speed;const accel=d?(p.grounded?c.groundAccel:c.airAccel):(p.grounded?c.groundBrake:c.airBrake);p.vx=approach(p.vx,d*speed,accel);}
   if(!jumped&&!input.jump&&p.vy<-c.jumpCut)p.vy=-c.jumpCut;
   p.vy=Math.min(c.fallCap,p.vy+c.gravity);ninjaMove(p.vx,p.vy);
  }
  for(const lift of r12.lifts)if(p.vy>=0&&p.x+p.w>lift.x&&p.x<lift.x+lift.w&&previousBottom<=lift.y-lift.vy+2&&p.y+p.h>=lift.y&&p.y<lift.y){p.y=lift.y-p.h;p.vy=0;p.grounded=true;r12.discovered.add('lift');}
  if(n.command&&!n.cool){const kind=n.command.kind;n.command=null;if(kind==='slash')ninjaSwing();else ninjaThrow();}
 }
 n.jumpHeld=!!input.jump;n.attackHeld=!!input.run;n.specialHeld=!!input.special;n.cycleHeld=!!input.cycle;
 p.anim+=Math.abs(p.vx);p.x=clamp(p.x,16,r12.def.width-p.w-16);p.y=Math.max(-24,p.y);
 if(r03TryDescent(input))return;if(p.y>(n.descentActive?430:H+24)){r12Event('pit');die();return;}
 // Body damage is resolved AFTER active sword/projectile hits in r12Combat.
 r12CommonPlayer(input);
};
// Exact axis clipping removes fractional stand-off from walls. No contact damage.
function r04TankBoxes(b,who){
 let boxes;
 if(r12.area==='defense')boxes=[...r03Challenge.blocks.filter(b=>!b.dead),r03Challenge.base];
 else boxes=solids(b).filter(t=>t.type!=='ground').flatMap(t=>r03TileParts(t)).concat(r08LiftBoxes());
 const bodies=ninja.foes.filter(e=>e!==who&&!e.dead&&!e.spawn);if(who!==player)bodies.push(player);
 return boxes.concat(bodies);
}
r12TankMove=function(b,dir,speed){
 if(!Number.isFinite(speed)||speed<=0)return false;
 const [dx,dy]=R12_DIR[dir],initial={x:b.x,y:b.y},limit=r12.area==='defense'?{l:24,r:232,t:24,b:232}:{l:16,r:r12.def.width-16,t:48,b:208};
 let move=speed;
 move=Math.min(move,dx>0?limit.r-b.x-b.w:dx<0?b.x-limit.l:dy>0?limit.b-b.y-b.h:b.y-limit.t);
 const swept={x:b.x+(dx<0?-speed:0),y:b.y+(dy<0?-speed:0),w:b.w+(dx?speed:0),h:b.h+(dy?speed:0)};
 for(const o of r04TankBoxes(swept,b)){
  if(!o)continue;
  const cross=dx?b.y<o.y+o.h-.001&&b.y+b.h>o.y+.001:b.x<o.x+o.w-.001&&b.x+b.w>o.x+.001;if(!cross)continue;
  const dist=dx>0?o.x-b.x-b.w:dx<0?b.x-o.x-o.w:dy>0?o.y-b.y-b.h:b.y-o.y-o.h;
  if(dist>=-.001)move=Math.min(move,Math.max(0,dist));
  else if(overlap(b,o)){
   const q={...b,x:b.x+dx*speed,y:b.y+dy*speed};
   const area=z=>Math.max(0,Math.min(z.x+z.w,o.x+o.w)-Math.max(z.x,o.x))*Math.max(0,Math.min(z.y+z.h,o.y+o.h)-Math.max(z.y,o.y));
   if(area(q)>area(b)+.001)move=0;
  }
 }
 move=Math.max(0,move);b.x+=dx*move;b.y+=dy*move;return Math.abs(b.x-initial.x)+Math.abs(b.y-initial.y)>.0001;
};
function r04TurnAssist(dir){
 const p=player,axis=dir%2===0?'y':'x',origin=p[axis];
 const offset=r12.area==='defense'?0:2,cell=Math.floor((origin-offset)/8);
 const targets=[cell*8+offset,(cell+1)*8+offset].sort((a,b)=>Math.abs(a-origin)-Math.abs(b-origin));
 for(const target of targets){const delta=target-origin;if(Math.abs(delta)<.001||Math.abs(delta)>3.5)continue;
  const [dx,dy]=R12_DIR[dir],q={...p,[axis]:target},forward={...q,x:q.x+dx*R04_FEEL.tankSpeed,y:q.y+dy*R04_FEEL.tankSpeed};
  const bodies=ninja.foes.filter(e=>!e.dead&&!e.spawn);
  if(r12TankCollides(q)||r12TankCollides(forward)||bodies.some(e=>overlap(q,e)||overlap(forward,e)))continue;
  let safe=true;for(let k=1;k<=4;k++)if(r12TankCollides({...p,[axis]:origin+delta*k/4}))safe=false;
  if(!safe)continue;p[axis]=target;r12Event('tank-corner-align',{axis,delta});return true;
 }return false;
}
r12TankPlayer=function(input){
 const p=player,t=r12.tank,c=R04_FEEL;for(const k of ['shield','freeze','cool','turnAssist'])if(t[k]>0)t[k]--;if(p.invuln)p.invuln--;
 const dir=input.moveDir??null,onIce=r03Terrain.some(s=>s.kind==='ice'&&overlap(p,s)),ox=p.x,oy=p.y;
 if(input.runPressed||input.jumpPressed)t.fireBuffer=c.commandBuffer;else if(t.fireBuffer)t.fireBuffer--;
 if(dir!==null){if(dir%2!==t.dir%2)t.turnAssist=18;t.dir=dir;p.dir=dir;t.glide=onIce?c.iceFrames:0;t.glideDir=dir;
  const moved=r12TankMove(p,dir,c.tankSpeed);if(!moved&&r04TurnAssist(dir)){r12TankMove(p,dir,c.tankSpeed);t.turnAssist=0;}
 }else if(onIce&&t.glide>0){t.glide--;if(!r12TankMove(p,t.glideDir,c.tankSpeed*t.glide/c.iceFrames))t.glide=0;}else t.glide=0;
 p.vx=p.x-ox;p.vy=p.y-oy;if(Math.abs(p.vx)+Math.abs(p.vy)>.001)t.track++;
 if((input.run||input.jump||t.fireBuffer)&&!t.cool){const count=ninja.projectiles.length;r12TankShot(p);if(ninja.projectiles.length>count)t.fireBuffer=0;}
 p.grounded=true;p.facing=t.dir===2?-1:1;r12CommonPlayer(input);
};
// Shared simultaneous projectile stepping prevents opposite fast shots tunnelling.
function r04Projectiles(defense=false){
 const n=ninja,p=player,c=r03Challenge;
 for(const s of n.projectiles){s.age=(s.age||0)+1;s.life--;
  if(s.kind==='windmill'&&s.age>30){const a=Math.atan2(p.y+p.h/2-s.y,p.x+p.w/2-s.x);s.vx=approach(s.vx,Math.cos(a)*3.8,.28);s.vy=approach(s.vy,Math.sin(a)*3.8,.28);if(overlap(s,p))s.life=0;}
 }
 const steps=Math.max(1,Math.ceil(Math.max(0,...n.projectiles.map(s=>Math.max(Math.abs(s.vx||0),Math.abs(s.vy||0))))/1.5));
 for(let k=0;k<steps;k++){
  for(const s of n.projectiles)if(s.life>0){s.x+=s.vx/steps;s.y+=s.vy/steps;}
  if(hero==='tank')for(const a of n.projectiles)if(a.friendly&&a.life>0)for(const b of n.projectiles)if(!b.friendly&&b.life>0&&overlap(a,b)){a.life=b.life=0;ninjaDust(a.x,a.y);r12Event('shell-cancel');if(typeof r06Sound==='function')r06Sound('cancel');}
  for(const s of n.projectiles){if(s.life<=0)continue;
   if(defense){const wall=c.blocks.find(w=>!w.dead&&overlap(s,w));if(wall){r07DefenseImpact(wall,s);s.life=0;continue;}
    if(overlap(s,c.base)){s.life=0;if(c.won)continue;c.failed=true;mode='gameover';stopMusic();if(typeof r06Sound==='function'){r06Sound('death');r06Sound('gameover',{delay:.65});}showOverlay('BASE LOST','基地失守','炮弹击中了鹰徽。坦克车体接触不造成伤害。','重试基地挑战 →');r12Event('base-destroyed',{friendly:s.friendly});return;}
   }else{if(hero==='tank'&&r08LiftBoxes().some(l=>overlap(s,l))){s.life=0;r06Sound('steel');ninjaDust(s.x,s.y);r12Event('lift-shell-hit');continue;}const hit=solids(s).find(t=>hero!=='tank'||t.type!=='ground');if(hit){if(hero==='tank'){r12.r03Impact=s;r12Break(hit,'cannon');}else if(s.friendly&&hit.content)ninjaBump(hit);if(s.kind!=='windmill'){s.life=0;ninjaDust(s.x,s.y);continue;}}}
   if(s.friendly){for(const e of n.foes)if(!e.dead&&!e.spawn&&overlap(s,e)&&!s.hit?.has(e.id)){s.hit?.add(e.id);r12DamageEnemy(e,s.kind==='flame'?2:1);if(s.kind!=='windmill'&&s.kind!=='flame')s.life=0;break;}
    for(const l of n.lanterns)if(!l.dead&&overlap(s,l)){l.dead=true;n.drops.push({...l,w:12,h:12,vy:-1.5});if(s.kind!=='windmill')s.life=0;}
   }else if(mode==='playing'&&overlap(s,p)){hero==='tank'?r12TankHurt(s):ninjaHurt(s);s.life=0;}
   if(defense?(s.x<24||s.x>232||s.y<24||s.y>232):(s.y<(hero==='tank'?24:-48)||s.y>(hero==='tank'?240:370)))s.life=0;
  }
 }
 n.projectiles=n.projectiles.filter(s=>s.life>0&&(defense||(s.x>camera-(hero==='tank'?12:160)&&s.x<camera+W+(hero==='tank'?12:160))));
}
r12Combat=function(){
 const n=ninja,p=player;
 if(hero==='ryu'&&n.attack>=3&&n.attack<=12){
  const boxes=r07SwordBoxes();const box=boxes[0],hits=b=>boxes.some(q=>overlap(q,b));
  for(const e of n.foes)if(!e.dead&&hits(e)&&!n.hitIds.has('e'+e.id)){n.hitIds.add('e'+e.id);r12DamageEnemy(e);}
  for(const l of n.lanterns)if(!l.dead&&hits(l)){l.dead=true;n.drops.push({...l,w:12,h:12,vy:-2});ninjaDust(l.x,l.y);}
  for(const t of [...new Set(boxes.flatMap(q=>solids(q)))])if(!n.hitIds.has('t'+tileKey(t.x,t.y))){n.hitIds.add('t'+tileKey(t.x,t.y));r12Break(t);}
  for(const s of n.projectiles)if(!s.friendly&&hits(s)){s.life=0;r12Event('parry');}
 }
 r04Projectiles(false);
 if(hero==='ryu'){
  if(n.spin>0){const box={x:p.x-16,y:p.y-9,w:44,h:44};for(const e of n.foes)if(!e.dead&&overlap(box,e)&&!n.spinHit.has(e.id)){n.spinHit.add(e.id);r12DamageEnemy(e,2);}}
  for(const e of n.foes)if(mode==='playing'&&!e.dead&&!e.spawn&&overlap(p,e)){if(p.star)r12Kill(e);else ninjaHurt(e);break;}
  for(const it of n.drops){if(it.emerge>0){it.emerge--;it.y=it.targetY+it.emerge*.5;it.vy=0;continue;}it.vy=Math.min(3,(it.vy||0)+.15);it.y+=it.vy;for(const t of solids(it))if(it.vy>0){it.y=t.y*T-it.h;it.vy=0;}}
 }
 for(const f of n.fx){f.x+=f.vx;f.y+=f.vy;f.vy+=.055;f.life--;}n.fx=n.fx.filter(f=>f.life>0);for(const t of tiles.values())if(t.bump)t.bump--;updateParticles();
};
const r04OldCommon=r12CommonPlayer;
r12CommonPlayer=function(input){
 const prevCamera=camera,prevY=r12.camY,area=r12.area;
 r04OldCommon(input);if(r12.area!==area||r12.area==='defense')return;
 const p=player;let desired=prevCamera;
 if(p.x-prevCamera>139)desired=p.x-139;else if(p.x-prevCamera<83)desired=p.x-83;
 camera=clamp(desired,0,Math.max(0,r12.def.width-W));
 // Preserve original area-descent camera target, avoid a one-frame vertical snap.
 const targetY=r12.camY;r12.camY=Math.abs(targetY-prevY)<.12?targetY:prevY+(targetY-prevY)*.25;
};
// Defense uses the same controller, collision solver and projectile ordering as the main map.
r03DefenseTick=function(input){
 const c=r03Challenge,t=r12.tank;c.clock++;frame++;r12.ticks++;if(r12.messageTime)r12.messageTime--;if(r12.shake>0)r12.shake--;
 if(c.failed)return;
 if(c.won){r12TankPlayer(input);r04Projectiles(true);r07DefenseExit(input);updateParticles();return;}
 if(c.spawned<c.total&&ninja.foes.filter(e=>!e.dead).length<2&&c.spawnClock--<=0){const x=[24,124,220][c.spawned%3],spawn={x,y:24,w:12,h:12};
  if(!overlap(spawn,player)&&!ninja.foes.some(e=>!e.dead&&overlap(spawn,e))){ninja.foes.push({kind:'tank',tankKind:'basic',bonus:c.spawned===1,bonusSpent:false,id:700+c.spawned,x,y:24,w:12,h:12,dir:1,t:0,cool:100,hp:1,maxHp:1,dead:false,spawn:50,turn:0});c.spawned++;c.spawnClock=150;}}
 r12TankPlayer(input);
 for(const d of ninja.drops)if(!d.gone&&!d.emerge&&overlap(player,d)){r12Give(d.type);d.gone=true;}ninja.drops=ninja.drops.filter(d=>!d.gone);
 if(!t.freeze)for(const e of ninja.foes){if(e.dead)continue;if(e.spawn){e.spawn--;continue;}e.t++;if(e.cool)e.cool--;if(e.flash)e.flash--;
  if(e.t%70===1)e.dir=e.y>190?(e.x<114?0:e.x>138?2:1):e.t%210<140?1:((e.id%2)?0:2);
  if(!r12TankMove(e,e.dir,.55)&&e.t%40===0)e.dir=(e.dir+1)%4;
  if(!e.cool){r12TankShot(e,false);e.cool=100;}}
 r04Projectiles(true);c.kills=ninja.foes.filter(e=>e.dead).length;updateParticles(); // Live arena debris/floating scores must age even while enemies are frozen.
 for(const f of ninja.fx){f.x+=f.vx;f.y+=f.vy;f.life--;}ninja.fx=ninja.fx.filter(f=>f.life>0);
 if(mode==='playing'&&c.spawned===c.total&&c.kills===c.total&&!c.failed)r03WinChallenge('tank');
};
// One input snapshot per physics step; all layers see the same edges.
const r04PreviousFixed=fixedUpdate;
fixedUpdate=function(){
 if(!r12IsHero()||!r12)return r04PreviousFixed();
 if(r12.area==='defense')pollMixPad();
 r04TickInput=r04Sample();
 if(mode!=='playing'||r12.transition){r04TickInput.jumpPressed=false;r04TickInput.runPressed=false;r04TickInput.specialPressed=false;r04TickInput.cyclePressed=false;}
 const seen={...r04TickInput};try{r04PreviousFixed();}finally{r04Previous=seen;r04TickInput=null;}
};
// Keep familiar controls; J remains one slash per press. L no longer loses sub-frame taps.
heroHelp.ryu='手感修订 0.4 · ←→ / AD 移动；空格 / K / Z 跳跃（轻点低跳、按住高跳）；J 挥刀（短缓冲，不是按住自动连砍）；L 忍术；E 切换。贴墙 ↑↓，跳跃蹬墙；低矮处 ↓+方向挪动。';
heroHelp.tank='手感修订 0.4 · 方向键 / WASD 四向移动；最后按下的方向优先。J / 空格开炮，可按住连射。转弯处小幅对齐，不穿墙。碰敌车只阻挡；河流挡车不挡弹。';
const r04OldSelect=selectHero;
selectHero=function(id){const out=r04OldSelect(id);if(mode==='menu')r04Clear();if(r04Up)r04Up.hidden=!r12IsHero();if(r04Pad)r04Pad.classList.toggle('r04-relay',r12IsHero());if(hero==='ryu'&&$('jumpLabel'))$('jumpLabel').textContent='轻点低跳 / 按住高跳';return out;};
// A real four-way touch pad, not an UP button separated from its other directions.
const r04Pad=document.querySelector('.touchbar > .pad'),r04Up=document.querySelector('#ninjaTouch [data-action="up"]');
if(r04Pad&&r04Up){r04Pad.prepend(r04Up);r04Pad.classList.add('r04-dpad');}
const r04Style=document.createElement('style');r04Style.textContent=`
.r04-dpad{display:grid!important;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(2,44px);gap:5px!important;align-content:center}
.r04-dpad:not(.r04-relay){grid-template-rows:44px}.r04-dpad:not(.r04-relay) .touchkey{grid-row:1!important}
.r04-dpad [data-action="up"]{grid-column:2;grid-row:1}.r04-dpad [data-action="left"]{grid-column:1;grid-row:2}.r04-dpad [data-action="down"]{grid-column:2;grid-row:2}.r04-dpad [data-action="right"]{grid-column:3;grid-row:2}
.r04-dpad .touchkey{width:44px;height:44px;min-width:44px;padding:0;font-size:18px}.touchkey{touch-action:none;user-select:none;-webkit-user-select:none}
@media(max-height:540px) and (orientation:landscape){.r04-dpad{position:fixed;left:12px;bottom:14px;z-index:40}.touchbar>.actionpad{position:fixed;right:12px;bottom:14px;z-index:40}#ninjaTouch{left:auto;right:12px;top:auto;bottom:76px;flex-direction:row}}
`;document.head.appendChild(r04Style);
if(window.__relayTest){
 __relayTest.feel=()=>({config:R04_FEEL,command:ninja?.command,buffer:ninja?.buffer,coyote:ninja?.coyote,kickCommit:ninja?.kickCommit,wallLock:ninja?.wallLock,input:r04TickInput||r04RawInput(),camera:{x:camera,y:r12?.camY},pending:{...r04Pending}});
 __relayTest.nativeFrames=function(n=1){for(let i=0;i<n;i++)fixedUpdate();draw();return this.state();};
}

selectHero(hero);

/* 0.5.0 Foundation repair.
 * One shared block-reward/FX contract, explicit sprite facing contracts, and
 * session boundaries. Canonical 1-2 tile coordinates are not redesigned.
 */
const R05_VERSION='0.5.0';
const R05_IDS=['tank-p1','tank-p2','tank-p3','barbarian-slash','barbarian-impact','ryu-atlas05'];
const r05Ready=Promise.all(R05_IDS.map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{R12_SPRITES[id]=im;resolve();};im.onerror=()=>reject(Error('Missing 0.5 asset: '+id));im.src=R12_EMBEDDED_IMAGES['relay12/assets/'+id+'.png'];})));
window.__mixReady=Promise.all([window.__mixReady,r05Ready]);
let r05FxDrawn=0,r05TankSprite='player-tank',r05Session=0,r05ClimbFrame=4,r05BossFrame='walk';

// ---- Shared 1-2 question blocks, item emergence, native coin/debris animation ----
function r05Debris(t,small=false){
 const y=t.y*T,x=t.x*T;for(let i=0;i<(small?2:4);i++)particles.push({kind:'debris',x:x+(i%2)*8,y:y+Math.floor(i/2)*8,vx:i%2?1.35:-1.35,vy:i<2?-3.2:-1.8,life:48,under:hero==='ryu'&&room==='under'});
}
function r05DrawParticles(){r05FxDrawn=0;for(const p of particles){if(p.x<camera-32||p.x>camera+W+32)continue;
 r05FxDrawn++;const x=Math.round(p.x-camera),y=Math.round(p.y);
 if(p.kind==='coin')drawCoin(x,y,frame,true);
 else if(p.kind==='debris')sprite('debris',x,y,Math.floor(p.life/5)%2===0,Math.floor(p.life/7)%2===0,p.under?'under':'normal');
 else rect(x,y,2,2,p.color||'#ffe39a');
}}
function r05SpawnItem(t,type){
 const d={x:t.x*T+2,y:t.y*T+2,targetY:t.y*T-14,w:12,h:12,vy:0,type,id:++r05Session+10000,emerge:32,blockX:t.x,blockY:t.y,anchored:hero==='tank'};
 // Coin-block geometry is unchanged. A ceiling/boundary cannot hide a tank reward.
 if(hero==='tank'&&r12TankCollides({...d,y:d.targetY})){
  for(const [dx,dy] of [[0,16],[-16,0],[16,0]]){const q={...d,x:d.x+dx,y:t.y*T+2+dy};if(!r12TankCollides(q)){d.x=q.x;d.y=q.y;d.targetY=q.y;d.emerge=0;break;}}
 }
 ninja.drops.push(d);sfx('appear');r12Event('item-emerge',{item:type,tx:t.x,ty:t.y});
}
ninjaBump=function(t){
 if(!t||t.used||t.bump>0||!(t.content||t.type==='question'))return false;
 const item=t.content||'coin';t.bump=12;
 if(item==='multi'){
  if(!t.r05MultiStarted){t.count=10;t.r05MultiStarted=true;}t.count--;getCoin(t.x*T,t.y*T,true);
  if(t.count>0){r12Event('block-reward',{tx:t.x,ty:t.y,item:'coin',remaining:t.count});return true;}
 }else if(item==='coin')getCoin(t.x*T,t.y*T,true);
 else r05SpawnItem(t,item==='power'?(hero==='tank'?(t.x<20?'star':t.x<100?'helmet':'timer'):t.x<50?'shuriken':t.x<120?'windmill':'flame'):item);
 t.used=true;t.content=null;r12Event('block-reward',{tx:t.x,ty:t.y,item});return true;
};
const r05Break=r12Break;
r12Break=function(t,by='sword'){
 if(!t)return false;
 if(t.routeExtension||t.protected)return false;
 const old=t.parts??15,exists=tiles.has(tileKey(t.x,t.y));
 const ok=r05Break(t,by);
 if(exists&&(!tiles.has(tileKey(t.x,t.y))||(t.parts??15)!==old)){
  r05Debris(t,tiles.has(tileKey(t.x,t.y)));sfx('break');
 }
 return ok;
};
const r05Give=r12Give;
r12Give=function(type){r05Give(type);if(hero==='tank'&&['star','power'].includes(type)){r12.rankFlash=32;r12Event('tank-form',{rank:r12.tank.power,sprite:r12.tank.power?'tank-p'+r12.tank.power:'player-tank'});}};

// ---- Audio: usable offline first; optional upstream downloads never gate playback ----
// These loops are authored adaptations, NOT claimed to be original game recordings.
// 0.8: removed tank melodic loop at its second historical definition.
NINJA_TUNES.r05_boss={step:.13,loop:true,notes:[52,0,52,55,59,0,59,62,51,0,51,54,58,0,58,61,52,59,64,62,59,55,52,0,54,61,66,64,61,58,54,0]};
const r05RemoteLoader=r03LoadSourceAudio;
let r05LocalLoading=null;
r03LoadSourceAudio=function(){
 if(!audio)return Promise.resolve([]);if(r05LocalLoading)return r05LocalLoading;
 const ac=audio;r03OriginalAudioStatus='loading';
 r05LocalLoading=Promise.all(Object.entries(R03_EMBEDDED_AUDIO).map(async([key,data])=>{
  try{const buf=await ac.decodeAudioData(Uint8Array.from(atob(data),c=>c.charCodeAt(0)).buffer);bank.set(key,{buffer:buf,gain:.6});r03SourceAudioKeys.add(key);return key;}catch(e){return null;}
 })).then(v=>{r03OriginalAudioStatus='partial';return v;});return r05LocalLoading;
};
// No silent tank branch. Same BGM lifecycle for main route and defense.
desiredMusic=function(){if(!r12IsHero())return r12OldDesired();if(mode!=='playing'||!r12||r12.target==='handoff'||r03IsSecret()&&r03Challenge?.won)return null;
 if(hero==='tank')return 'tank_theme';return r12.area==='bar'?(r03SourceAudioKeys.has('r03_boss_theme')?'r03_boss_theme':'r05_boss'):'ryu_theme';};
audioSync=function(){if(!r12IsHero())return r12OldSync();if(!audio)return;
 if(mode==='paused'||document.hidden||!soundOn){stopMusic(true);return;}
 ninjaMakeAudio();const key=desiredMusic();if(key)playMusic(key);else stopMusic(false);
};
const r05AudioPanel=updateAudioPanel;
updateAudioPanel=function(){r05AudioPanel();if(r12IsHero()){
 const n=$('audioBadge');if(n)n.textContent=soundOn?'BGM + FX':'MUTED';
 if($('audioStatus'))$('audioStatus').textContent='离线可发声：新增角色配乐为自制改编；坦克开炮及既有马里奥音效为来源录音。';
}};

// ---- Explicit sprite facing, all four player upgrade bodies, actual boss attack pose ----
r12DrawTank=function(g,x,y,dir,enemy=false,t=0,armored=false){
 const rank=enemy?0:Math.max(0,Math.min(3,r12?.tank?.power||0));
 const id=enemy?(armored?'enemy-armor':'enemy-basic'):rank?'tank-p'+rank:'player-tank',im=R12_SPRITES[id];
 if(!im)return; if(!enemy)r05TankSprite=id;
 g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x+6),Math.round(y+6));g.rotate((dir+1)*Math.PI/2);g.drawImage(im,-8,-8,16,16);
 // Only track pixels animate; body shape is the source rank-specific frame.
 if(Math.floor(t/5)%2){g.fillStyle=enemy?'#888888':'#8c7130';for(let y=-5;y<7;y+=4){g.fillRect(-7,y,2,1);g.fillRect(5,y+2,2,1);}}
 if(!enemy&&r12?.rankFlash>0){g.strokeStyle='#fff2ab';g.lineWidth=1;g.strokeRect(-9,-9,18,18);}g.restore();
};
r12DrawRyu=function(g,x,y,face,pose,t=0){
 const im=R12_SPRITES['ryu-atlas05']||R12_SPRITES.ryu;if(!im)return;let i=0;
 if(pose==='run')i=1+Math.floor(t/6)%3;
 else if(pose==='wall')i=4+Math.floor((ninja?.climbTravel||0)/8)%2;
 else if(pose==='air')i=6+Math.floor(t/6)%4;
 else if(pose==='crouch')i=24;
 else if(pose==='hurt')i=6;
 else if(pose==='slash')i=ninja?.attack>10?10:ninja?.attack>6?11:13;
 else if(pose==='crouchSlash')i=ninja?.attack>10?25:ninja?.attack>6?26:28;
 else if(pose==='throw')i=22;else if(pose==='win')i=20;
 if(pose==='wall')r05ClimbFrame=i;
 const cw=[11,13,22,26,28].includes(i)?52:26,sx=(i%10)*26+(i===5?-3:0);
 g.save();g.translate(Math.round(x+6),Math.round(y));if(face<0)g.scale(-1,1);g.imageSmoothingEnabled=false;
 g.drawImage(im,sx,Math.floor(i/10)*36,cw,36,-13,-34,cw,36);g.restore();
};
function r05BossBox(e){return {x:e.dir>0?e.x+e.w-4:e.x-25,y:e.y+9,w:29,h:28};}
const r05DrawEnemy=r12DrawEnemy;
r12DrawEnemy=function(e){
 if(e.kind!=='barbarian'){if(e.kind==='hawk'&&e.vx)e.dir=e.vx>0?1:-1;return r05DrawEnemy(e);}
 if(e.dead)return;
 const strike=e.phase==='slash',im=R12_SPRITES[strike?(e.clock>=5&&e.clock<=14?'barbarian-impact':'barbarian-slash'):e.phase==='windup'?'barbarian-slash':'barbarian-walk'];r05BossFrame=strike?'slash':e.phase;
 if(!im)return;ctx.save();ctx.translate(Math.round(e.x-camera+13),Math.round(e.y+e.h));if(e.dir<0)ctx.scale(-1,1);
 if(e.flash&&frame%4<2)ctx.globalAlpha=.55;
 // During windup the source walking arm is raised via an explicit axe cue; full source slash frame on attack.
 ctx.drawImage(im,-28,-64,64,64);
 if(e.phase==='windup'){rect(14,-57,3,27,'#b68958');rect(8,-58,14,8,'#f0c180');rect(10,-57,11,3,'#fff1c5');text('!',21,-65,'#ffd06d',1.2,true);}
 ctx.restore();
 if(strike&&e.clock>=5&&e.clock<=14){const h=r05BossBox(e);ctx.save();ctx.globalAlpha=.5;polygon(e.dir>0?[[h.x-camera,h.y],[h.x-camera+h.w,h.y+7],[h.x-camera+h.w,h.y+24],[h.x-camera,h.y+28]]:[[h.x-camera+h.w,h.y],[h.x-camera,h.y+7],[h.x-camera,h.y+24],[h.x-camera+h.w,h.y+28]],'#ffcc83');ctx.restore();}
};
const r05Enemies=r12NinjaEnemies;
r12NinjaEnemies=function(){
 if(r12.area!=='bar')return r05Enemies();const e=ninja.foes.find(e=>e.kind==='barbarian');if(!e||e.dead)return;
 e.t++;e.clock++;if(e.hitLock)e.hitLock--;if(e.flash)e.flash--;
 const change=(phase)=>{e.phase=phase;e.clock=0;r12Event('boss-phase',{phase,dir:e.dir});};
 if(e.phase==='walk'){
  e.dir=player.x+player.w/2<e.x+e.w/2?-1:1;
  if(Math.abs(player.x-e.x)>48)r12Body(e,e.dir*.6,0);
  if(e.clock>=72){e.swings=0;change('windup');}
 }else if(e.phase==='windup'&&e.clock>=36){change('slash');ninjaSound('slash');}
 else if(e.phase==='slash'){
  if(e.clock>=5&&e.clock<=14&&overlap(r05BossBox(e),player))ninjaHurt(e);
  if(e.clock>=24){e.swings++;change(e.swings<2?'windup':'recover');}
 }else if(e.phase==='recover'&&e.clock>=54)change('walk');
};

// ---- Spatially connected secret path, proper solid walls, physical return pipe ----
const R05_SHAFT={left:1280,right:1328,bottom:384,pipeX:1280,pipeY:352};
const r05Load=r12Load;
r12Load=function(area,preserve=false,spawn=null,keepGeometry=false){
 const prevArea=r12?.area,carryReward=r03Rewards.ninja;
 r05Load(area,preserve,spawn,keepGeometry);
 if(ninja){ninja.climbTravel=0;ninja.descentActive=false;}
 r12.pipeCooldown=24;r12.rankFlash=0;r12.spawnFrames=0;
 if(area==='underground'&&hero==='ryu'){
  for(let y=15;y<=19;y++)for(const x of [79,83]){put(tiles,x,y,'stone');at(x,y).routeExtension=true;}
 }
 if(area==='alley'){
  Object.assign(player,{x:24,y:174,vx:0,vy:0});r12.spawnFrames=12;
  r12Message('从竖井进入街巷 · 右侧门通向酒吧。',240);
 }
 if(area==='bar'){
  Object.assign(player,{x:26,y:182,vx:0,vy:0,invuln:120});
  r12.spawnFrames=18;r12Message('看斧手举斧 → 跳过连斩 → 收招时反击。',220);
 }
 if(area==='exit'&&hero==='ryu'&&prevArea&&prevArea!=='entrance'){
  // Stand precisely on the original outlet, not fall into its adjacent staircase.
  Object.assign(player,{x:17,y:150,vx:0,vy:0});r12.spawnFrames=26;r12.spawnFromY=176;r12.spawnToY=150;player.y=176;
 }
 if(hero==='ryu'&&carryReward&&!ninja.unlocked.includes('spin'))ninja.unlocked.push('spin');
 // Ambient projectiles, trail particles and queued commands must not leak across scenes.
 r04ClearCommands();r12Event('scene-ready',{area});
};
r03TryDescent=function(input){
 if(hero!=='ryu'||r12.area!=='underground')return false;
 const p=player,n=ninja,inside=p.x>=R05_SHAFT.left-.1&&p.x+p.w<=R05_SHAFT.right+.1;
 if(inside&&n.wall&&input.down&&p.y+p.h>208){if(!n.descentActive)r12Event('cliff-descent-arm');n.descentActive=true;}
 if(n.descentActive&&p.y+p.h<=208)n.descentActive=false;
 if(n.descentActive&&inside&&input.down&&p.grounded&&Math.abs(p.y+p.h-R05_SHAFT.pipeY)<1&&p.x+p.w/2<R05_SHAFT.pipeX+30&&!r12.pipeCooldown){r12Event('cliff-descent',{x:p.x,y:p.y});r12Travel('alley');return true;}
 return false;
};
const r05WinChallenge=r03WinChallenge;
r03WinChallenge=function(kind){r05WinChallenge(kind);if(kind==='ninja'&&r12?.area==='bar'){
 for(let x=13;x<=14;x++)for(let y=11;y<=12;y++)put(tiles,x,y,'pipe');
 r12.pipeCooldown=30;r12Message('旋风斩已获得',160);
}};
// Replace layered common/player transition interception with one explicit route handler.
r12CommonPlayer=function(input){
 const p=player,n=ninja;if(r12.area==='defense')return;
 for(let i=looseCoins.length-1;i>=0;i--)if(overlap(p,looseCoins[i])){getCoin(looseCoins[i].x,looseCoins[i].y);looseCoins.splice(i,1);}
 for(let i=n.drops.length-1;i>=0;i--){const d=n.drops[i];if(!d.emerge&&overlap(p,d)){r12Give(d.type);n.drops.splice(i,1);}}
 const area=r12.area;
 if(area==='underground'){
  const cp=p.x>1980?2:p.x>1440?1:0;
  if(cp>r12.checkpointTier){r12.checkpointTier=cp;r12Checkpoint={hero,area,x:cp===1?1458:1984,y:hero==='ryu'?180:140};r12Message('区域检查点已记录');r12Event('checkpoint',{tier:cp});}
  if(r12RelayActive&&hero==='ryu'&&!r12.handoff&&p.x>=1508&&p.y>130){r12SaveGeometry();r12.handoff=true;r12.transition=110;r12.target='handoff';r12Event('handoff-begin');stopMusic();return;}
  if(!r12.pipeCooldown)for(const pipe of pipes){
   const eligible=pipe.transport==='bonus'||hero==='tank'&&pipe.x===1792;
   const aligned=p.x+p.w/2>pipe.x+4&&p.x+p.w/2<pipe.x+28;
   const onTop=hero==='tank'?Math.abs(p.y+p.h-pipe.y)<3:Math.abs(p.y+p.h-pipe.y)<1.1&&p.grounded;
   if(eligible&&aligned&&onTop&&input.down){r12Travel(hero==='tank'?'defense':'bonus');return;}
  }
  if(p.x>2800)r12.discovered.add('warp');
  if(input.down&&!r12.pipeCooldown&&r12.def.warp)for(let i=0;i<3;i++){const x=(r12.def.warp.x+8+i*32)*2;
   if(p.x+p.w/2>x+4&&p.x+p.w/2<x+28&&Math.abs(p.y+p.h-176)<3){r12Travel('exit');return;}}
 }else if(area==='alley'){
  if(p.x+p.w>=472&&p.y+p.h>190){r12Travel('bar');return;}
 }else if(area==='bar'){
  if(r03Challenge?.won&&!r12.pipeCooldown&&p.grounded&&input.down&&p.x+p.w/2>212&&p.x+p.w/2<236&&Math.abs(p.y+p.h-176)<1.1){r12Travel('exit');return;}
 }
 const q=r12.def.sidePipe;
 if(q&&!r12.pipeCooldown&&input.right){const mouthX=q.x*2,mouthY=208-q.y*2;
  if(Math.abs(p.x+p.w-mouthX)<3&&p.y>=mouthY-2&&p.y+p.h<=mouthY+33){r12Travel(q.transport==='return'?'underground':q.transport,q.transport==='return'?[1796,hero==='ryu'?150:132]:null);return;}}
 if(area==='exit'&&p.x+p.w>=r12.def.flag){mode='flag';r12.clearTick=0;n.projectiles=[];stopMusic();oneShot('flag');r12Event('flag');}
 let target=camera;if(p.x-camera>139)target=p.x-139;else if(p.x-camera<83)target=p.x-83;
 camera=clamp(target,0,Math.max(0,r12.def.width-W));
 const ty=hero==='ryu'&&n.descentActive?clamp(p.y-138,0,192):hero==='ryu'?Math.min(0,p.y-53):0;
 r12.camY=Math.abs(ty-r12.camY)<.08?ty:r12.camY+(ty-r12.camY)*.17;
 maxProgress=area==='exit'?FLAG_X:area==='underground'?p.x/r12.def.width*FLAG_X:0;
};
// Save local arena state on voluntary pipe travel. A fresh run still starts from a clean map.
const r05SaveGeometry=r12SaveGeometry;
r12SaveGeometry=function(){r05SaveGeometry();if(r12)Object.assign(r12World[r12.area],{hero,foes:ninja.foes,drops:ninja.drops,lanterns:ninja.lanterns});};
const r05LoadState=r12Load;
r12Load=function(area,preserve=false,spawn=null,keepGeometry=false){
 const cached=r12World[area];r05LoadState(area,preserve,spawn,keepGeometry);
 if(cached?.hero===hero&&preserve&&!r03IsSecret()){ninja.foes=cached.foes;ninja.drops=cached.drops;ninja.lanterns=cached.lanterns;}
};

// Keep the native level drawing; added shaft is entirely below the canonical floor.
const r05MapDraw=r12DrawMap;
r12DrawMap=function(){r05MapDraw();if(hero==='ryu'&&r12.area==='underground'){
 const x=1280-camera;
 rect(x,240,48,88,'#080c18');for(const t of tiles.values())if(t.routeExtension)drawBlock(t);
 // Continuous dark wall below the original ledge. No secret label or bottom pipe.
 for(let y=240;y<320;y+=16){rect(x-2,y,2,16,'#40536c');rect(x+48,y,2,16,'#40536c');}
 }if(r12.area==='bar'&&r03Challenge?.won)r12DrawPipes();
};

// ---- Fresh-session reset precedes any menu rendering: no stale challenge or hero state ----
function r05ClearSession(){
 r04Clear();keys.clear();touch.clear();virtualInput=null;
 r12=null;ninja=null;r03Challenge=null;r03Rewards={ninja:false,tank:false};r03Terrain=[];
 r12World={};r12Checkpoint=null;r12RelayActive=false;
 enemyShots=[];mixShots=[];shots=[];particles=[];floaters=[];items=[];enemies=[];
 deathTick=0;flagY=48;freeze=0;stopMusic();stopEffects();r04RefreshTouch();
}
const r05Characters=showCharacters;
showCharacters=function(){r12RelayRequested=false;r05ClearSession();r05Characters();selectHero(hero);};
const r05Start=startGame;
startGame=function(){const requested=r12RelayRequested||(mode==='win'&&r12RelayActive);r05ClearSession();r12RelayRequested=requested;r05Session++;r05Start();prepareAudio().catch(()=>{});};
const r05Primary=handlePrimary;
handlePrimary=function(){if(mode==='gameover'&&r12IsHero()&&r03Challenge?.failed){lives=3;r03StartChallenge(r03Challenge.kind);return;}r05Primary();};
const r05UI=updateHeroUI;
updateHeroUI=function(){if(r12IsHero()&&(!r12||!ninja)){$('heroStatus').textContent=heroHelp[hero];return;}return r05UI();};
heroHelp.ryu='v0.5 · 先走原 1-2：问号奖励、金币、碎砖、升降台和奖励房恢复。贴墙 ↑↓，空格蹬墙；反向+跳跃也能蹬出。第一处悬崖按 ↓ 下行，落到井底管口后再按 ↓ 进入街巷。';
heroHelp.tank='v0.5 · 方向键 / WASD 四向移动；最近按下方向优先。J / 空格射击。吃星星后车体和炮管一起升级。问号砖只能领一次，变实心后仍挡弹，请从另一侧攻击后面的问号砖。';

// ---- Finish has flag slide, score/time conversion, walk/drive to the castle ----
function r05FinishTick(){
 if(hero==='tank')return r09FinishTank();
 frame++;r12.ticks++;r12.clearTick++;const k=r12.clearTick;
 if(k===1){r12.flagBonus=Math.max(100,Math.round((208-player.y)/32)*500);addScore(r12.flagBonus,player.x,player.y);player.vx=player.vy=0;}
 if(k<62){flagY=Math.min(176,48+k*2.1);if(hero==='ryu'){player.x=r12.def.flag-12;player.y=approach(player.y,182,2);}}
 if(k===62)oneShot('clear');
 if(k>=64){player.x=Math.min(r12.def.castle+25,player.x+1.3);player.anim+=2;}
 if(k>=70&&timeLeft>0){const count=Math.min(5,timeLeft);timeLeft-=count;score+=count*50;if(k%8===0)sfx('coin');}
 camera=clamp(player.x-110,0,Math.max(0,r12.def.width-W));
 updateParticles();
 if(k>200&&timeLeft===0){
  if(r12RelayActive&&hero==='ryu'&&r03Rewards.ninja){mode='playing';timeLeft=200;r12.transition=100;r12.target='handoff';return;}
  mode='win';showOverlay('RESCUE RELAY / CHAPTER 02','1-2 突破成功','得分 '+score+' · 救援仍在继续。<br>“选人”会清空本次战场，开始全新的流程。','再玩一次 →');r12Event('win',{relay:r12RelayActive});
 }
 audioSync();
}
const r05Fixed=fixedUpdate;
fixedUpdate=function(){
 if(r12IsHero()&&r12){
  if(mode==='flag'){r05FinishTick();return;}
  if(mode==='playing'&&!r12.transition&&r12.spawnFrames>0){
   r12.spawnFrames--;frame++;if(r12.spawnFromY!==undefined)player.y=r12.spawnToY+(r12.spawnFromY-r12.spawnToY)*r12.spawnFrames/26;
   if(!r12.spawnFrames){player.vy=0;r04ClearCommands();}audioSync();return;
  }
 }
 const old=r12,before=frame;r05Fixed();
 if(r12&&r12IsHero()&&frame!==before){
  if(r12.pipeCooldown>0)r12.pipeCooldown--;if(r12.rankFlash>0)r12.rankFlash--;
  if(hero==='tank'&&mode==='playing'&&!r12.transition)for(const d of ninja.drops)if(d.emerge>0){d.emerge--;d.y=d.targetY+d.emerge*.5;}
 }
};
const r05Draw=r12Draw;
r12Draw=function(){r05Draw();if(!r12)return;updateAudioPanel();
 if(mode==='playing'&&r12.area==='bar'&&!r03Challenge?.won){const e=ninja.foes[0];if(e){text(e.phase==='windup'?'WINDUP':e.phase==='slash'?'SLASH':e.phase==='recover'?'OPEN':'WATCH',128,40,e.phase==='recover'?'#a4e3ad':'#ffbf83',.75,true);}}
};
// Existing observers captured old function references: refresh only the test exports.
if(window.__relayTest){
 __relayTest.give=type=>r12Give(type);__relayTest.draw=()=>r12Draw();__relayTest.travel=(...a)=>r12Travel(...a);
 __relayTest.foundation=()=>({version:R05_VERSION,session:r05Session,particles:particles.map(p=>({...p})),fxDrawn:r05FxDrawn,tankSprite:r05TankSprite,climbFrame:r05ClimbFrame,bossFrame:r05BossFrame,descent:ninja?.descentActive,spawnFrames:r12?.spawnFrames,pipeCooldown:r12?.pipeCooldown,camera:{x:camera,y:r12?.camY},mode,hero,challenge:!!r03Challenge});
 __relayTest.r05Audio=()=>({bgm:bgm?.key,hasTank:bank.has('tank_theme'),sample:bank.get('tank_theme')?.buffer.getChannelData(0).slice(0,100),context:audio?.state});
 __relayTest.auditSprite=(rank,dir=3)=>{const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');const p=r12.tank.power;r12.tank.power=rank;r12DrawTank(g,16,16,dir,false,0);r12.tank.power=p;return c.toDataURL();};
 __relayTest.auditEnemy=e=>{ctx.clearRect(0,0,W,H);r12DrawEnemy(e);return canvas.toDataURL();};
}
selectHero(hero);

// Native score/coin feedback remains visible alongside character-specific meters.
const r05Hud=r12DrawHud;
r12DrawHud=function(){r05Hud();if(r12.area==='defense')return;
 rect(0,228,W,12,'#09121c');text('SCORE '+String(score).padStart(6,'0'),6,230,'#f0dfb4',.62);text('COIN '+String(coins).padStart(2,'0'),157,230,'#f2c977',.62);
 const progress=r12.area==='exit'?1:r12.area==='underground'?player.x/3040:0;rect(6,239,244,1,'#29414d');rect(6,239,244*progress,1,hero==='tank'?'#d4a65b':'#80bfcc');
};
