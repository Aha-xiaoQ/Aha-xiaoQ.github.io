/* R05: native-pixel Eye encounter. No code here changes episode-two physics.
 * Source NPC sheets are embedded and build-time Git-blob verified.
 * Classic behavior order is restored; steering/timing remain explicit adaptation.
 */
const R05Arena = Object.freeze({width:3072,height:540,floor:496,viewW:960,viewH:540,grant:96});
let r05EntryChoice=0, r05Builder=null;
const r05NativeViewportLabel=document.querySelector(".screen-top span:last-child")?.textContent||"256 × 240 · 60 HZ";
const r05Pointer={active:false,x:0,y:0,sx:0,sy:0,down:false,right:false,pressed:false,rightPressed:false};
const r05Css=document.createElement('style');
r05Css.textContent=`
body.r05-arena .app{max-width:1450px}
body.r05-arena .layout{grid-template-columns:minmax(0,1fr)220px}
body.r05-arena .screen-shell{width:100%;max-width:100%}
#stage.r05-arena{width:100%!important;height:auto!important;aspect-ratio:16/9!important;background:#102147!important}
#stage.r05-arena #game{display:block;width:100%!important;height:auto!important;max-width:none!important;image-rendering:pixelated;touch-action:none}
#stage.r05-arena:fullscreen{height:100%!important;aspect-ratio:auto!important}
#stage.r05-arena:fullscreen #game{width:100%!important;height:100%!important;object-fit:contain}
#stage.r05-arena .overlay-box{max-width:580px;font-size:15px}
#trioStageChooser .r05-pending{opacity:.55;flex-basis:100%;font-size:10px;text-align:left;padding:3px 1px;color:#d2d9dc}
#r05AudioOptions{font-size:11px;line-height:1.65;margin-top:10px;color:#a6b3c0}
#r05AudioOptions summary{cursor:pointer;color:#dae2e7}
#r05AudioOptions input{max-width:100%;font-size:10px}
#r05AudioOptions button{font:inherit;margin:4px 2px;padding:4px 8px;background:#203044;color:#e3edf4;border:1px solid #637081;border-radius:4px}
@media(max-width:850px){body.r05-arena .layout{grid-template-columns:1fr}body.r05-arena .panel{display:none}}
`;
document.head.appendChild(r05Css);
function r05Viewport(on){
 document.body.classList.toggle('r05-arena',on);$('stage').classList.toggle('r05-arena',on);
 if(on){if(renderScale!==-5){renderScale=-5;canvas.width=1920;canvas.height=1080;}ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;}
 else if(renderScale===-5){renderScale=-1;setRenderScale(1);const vl=document.querySelector('.screen-top span:last-child');if(vl)vl.textContent=r05NativeViewportLabel;}
}
function r05Terrain(){
 const q=[{id:'arena-floor',type:'floor',x:0,y:496,w:3072,h:96,solid:true}];
 const add=(id,x,y,w)=>q.push({id,type:'wood-platform',x,y,w,h:6,oneWay:true});
 add('wood-low',128,432,1024);add('wood-mid',256,368,864);
 add('wood-high',448,304,496);add('wood-far-low',1376,432,816);
 add('wood-far-mid',1488,368,592);add('wood-far-high',1584,304,336);
 // Far gaps deliberately remain editable. They do not force pre-boss construction.
 return q;
}
function r05Persist(){
 if(!state?.r05Arena||!mainState||!r05Builder)return;
 mainState.r05ArenaSave=r05Builder.save();mainState.wood=r05Builder.wood;
 mainState.r05Attempts=state.attempts;
}
function enterTerraSecret(restart=false,direct=false){
 if(!state||state.stage!==0)return false;
 if(restart){if(!state.r05Arena||!mainState)return false;r05Persist();direct=state.direct;}
 else {mainState=state;}
 const base=mainState;
 if(!base.r05SupplyGranted){base.r05SupplyGranted=true;base.wood+=R05Arena.grant;}
 const terrain=r05Terrain();
 r05Builder=new R05Building.PlatformBuilder({terrain,wood:base.wood,tile:16,height:6,reach:128,bounds:{x:0,y:64,w:R05Arena.width,h:448},repeatTicks:3});
 if(base.r05ArenaSave){r05Builder.restore({...base.r05ArenaSave,wood:base.wood});}
 const oldAttempts=base.r05Attempts||0;
 const s=newState();state=s;
 Object.assign(s,{r05Arena:true,secret:true,direct,phase:base.hiddenWon?'cleared':'preparation',attempts:oldAttempts,
  maxHp:base.maxHp,hp:base.maxHp,wood:r05Builder.wood,built:[...r05Builder.platforms.values()],
  level:{width:R05Arena.width,surfaces:terrain,movers:[],reward:{x:-10000,y:-10000,w:16,h:16,used:true},coins:[],clouds:[],flag:{x:3072},castle:{x:3072}},
  pipe:{id:'arena-exit',x:40,y:464,w:32,h:32,solid:true},trees:[],foes:[],servants:[],eye:null,
  cam:0,camY:0,tool:0,toolCooldown:0,target:{x:176,y:496},targetReason:null,aimRepeat:0,buildHeld:false,buildMode:'auto',buildGroundRow:496,buildDir:1,lastBuild:null,
  checkpoint:{x:154,y:454},interactLock:24,healTicks:0,healLeft:3,bossClear:!!base.hiddenWon,
  score:base.score,coins:base.coins,lives:base.lives,retries:base.retries,sourceSoundsComplete:false,
  notice:base.hiddenWon?'眼怪已击败；奖励不会重复发放。':restart?'平台、材料已保留。重新准备后，靠近眼球按 L 召唤。':'安全准备：先搭平台；靠近地面眼球按 L 召唤。木平台材料 +96（本局仅一次）。',noticeTime:540});
 Object.assign(s.p,{x:154,y:454,w:20,h:42,vx:0,vy:0,grounded:true,support:'arena-floor',invuln:0,coyote:6,buffer:0,jumpHeld:0,aim:0});
 r05CancelPointer();
 mode='playing';room='surface';resetGameAudio();clearInput();hideOverlay();r05Viewport(true);canvas.focus({preventScroll:true});
 evt('r05-arena-enter',{restart,direct,phase:s.phase,wood:s.wood});trioUI();return true;
}
function exitSecret(){
 if(!state?.r05Arena)return r04ExitSecret();
 r05Persist();const s=state,base=mainState,won=s.bossClear;
 r05Pointer.down=false;r05Pointer.right=false;r05Viewport(false);r05Builder=null;
 if(s.direct){s.direct=false;}
 state=base;mainState=null;state.interactLock=90;state.hp=Math.max(1,Math.min(state.maxHp,s.hp||state.maxHp));
 Object.assign(state.p,{x:1108,y:176,vx:0,vy:0,invuln:120,grounded:true,support:'tree-9'});
 state.checkpoint={x:1100,y:176};mode='playing';resetGameAudio();clearInput();hideOverlay();canvas.focus({preventScroll:true});
 note(won?'已带回隐藏奖励与剩余材料。':'安全返回 1-3；再次进入会保留战斗平台。');evt('r05-arena-exit',{won,wood:state.wood});trioUI();return true;
}
function r05Summon(){
 const s=state;if(!s?.r05Arena||s.phase!=='preparation')return false;
 s.eye=R05Eye.createEye({x:s.p.x+s.p.w/2+420,y:138});Object.assign(s.eye,{kind:'eyeBoss',id:1000,flash:0,lastMelee:-1});
 s.foes=[s.eye];s.phase='battle';s.attempts++;mainState.r05Attempts=s.attempts;s.healTicks=0;
 s.notice='克苏鲁之眼苏醒了！';s.noticeTime=180;evt('eye-summon',{attempt:s.attempts});return true;
}
function r05Text(text,x,y,size=14,color='#eef2ff',align='left'){
 ctx.save();ctx.font=`${size>=16?'600':'500'} ${size}px "Microsoft YaHei","Noto Sans CJK SC",sans-serif`;ctx.textAlign=align;ctx.textBaseline='top';ctx.lineWidth=3;ctx.strokeStyle='#091126';ctx.strokeText(text,Math.round(x),Math.round(y));ctx.fillStyle=color;ctx.fillText(text,Math.round(x),Math.round(y));ctx.restore();
}
function r05Hurt(amount,sourceX){
 const s=state,p=s.p;if(p.invuln||s.phase!=='battle'||mode!=='playing')return false;
 s.hp=Math.max(0,s.hp-amount);p.invuln=60;p.hurtLock=12;p.vx=(p.x+p.w/2<sourceX?-1:1)*4.1;p.vy=-3.3;p.grounded=false;p.support=null;
 terraSound('hurt',{volume:.7});s.numbers.push({text:'−'+amount,x:p.x,y:p.y-12,life:60,color:'#ffa39c'});evt('arena-hurt',{amount,hp:s.hp});
 if(!s.hp){s.phase='defeated';s.projectiles=[];s.servants=[];s.foes=[];s.retries++;mainState.retries=s.retries;r05Persist();clearInput();mode='respawn';
  showOverlay('EYE / RETRY','平台还在，再来一次','已建平台和剩余材料保留。<br>重试回到准备状态，不会立即开战。','回准备场 →','ENTER / A 重试 · C / SELECT 选人');evt('arena-defeat');}
 return true;
}
function r05HitEye(raw,kind){
 const s=state,e=s.eye;if(!e||e.dead||s.phase!=='battle')return;
 const r=R05Eye.damageEye(e,raw);e.flash=6;
 s.numbers.push({text:String(r.dealt),x:e.x+(s.attackId%3-1)*14,y:e.y-54,life:42,color:'#e6f990'});terraSound('hit',{volume:.32});evt('eye-hit',{dealt:r.dealt,hp:e.hp,mode:e.mode,kind});
 if(r.killed){
  s.phase='cleared';s.bossClear=true;s.projectiles=[];s.servants=[];s.foes=[];
  if(!mainState.hiddenWon){mainState.hiddenWon=true;mainState.maxHp+=40;mainState.score+=3000;s.maxHp=mainState.maxHp;s.hp=Math.min(s.maxHp,s.hp+80);s.score+=3000;r05Builder.wood+=12;s.wood=r05Builder.wood;}
  r05Persist();s.notice='克苏鲁之眼已击败！生命上限 +40，木平台 +12。靠近入口按 L 返回。';s.noticeTime=1800;evt('eye-victory',{maxHp:s.maxHp,wood:s.wood});
 }
}
// R06: resolve the input first, then snapshot ONE immutable direction per swing.
// Pointer hover is a preview only. Keyboard J is never aimed by an idle mouse.
function r05Aim(v){
 const p=state.p;let dx,dy,source='keyboard';
 if(r05Pointer.down||r05Pointer.pressed){
  r05SyncPointer();dx=r05Pointer.x-(p.x+p.w/2);dy=r05Pointer.y-(p.y+22);source='mouse';
 }else if(Math.hypot(v.aimX||0,v.aimY||0)>.2){dx=v.aimX;dy=v.aimY;source='stick';}
 else {dx=v.x?Math.sign(v.x):(v.y?0:p.facing);dy=v.y||0;}
 if(Math.hypot(dx,dy)<.001){dx=p.facing;dy=0;}
 const facing=Math.abs(dx)>.001?Math.sign(dx):p.facing;
 return {angle:Math.atan2(dy,Math.abs(dx)),facing,source};
}
function r05Attack(v){
 const s=state,p=s.p;if(p.cooldown>0)return;
 const aim=r05Aim(v);
 p.attack=18;p.cooldown=19;p.facing=aim.facing;p.attackFacing=aim.facing;p.aim=aim.angle;
 p.attackSource=aim.source;s.attackId++;terraSound('swing',{volume:.7});
 const a=p.aim,dir=p.attackFacing;
 s.projectiles.push({x:p.x+p.w/2+dir*22,y:p.y+22,vx:Math.cos(a)*10*dir,vy:Math.sin(a)*10,age:0,life:125,hits:[],attackId:s.attackId});
 evt('arena-swing',{attack:s.attackId,angle:a,facing:dir,source:aim.source});
}
function r05Combat(v){
 const s=state,p=s.p;
 if((v.action||r05Pointer.down||r05Pointer.pressed)&&s.tool===0&&p.cooldown===0)r05Attack(v);
 if(p.attack>0){p.attack--;const reach=72,px=p.x+p.w/2,py=p.y+22,dir=p.attackFacing,ux=Math.cos(p.aim)*dir,uy=Math.sin(p.aim);
  if(p.attack>=6&&p.attack<=14){const e=s.eye;if(e&&!e.dead&&e.lastMelee!==s.attackId){
   const dx=e.x-px,dy=e.y-py;
   if(Math.hypot(dx,dy)<reach+44&&dx*ux+dy*uy>-32&&Math.abs(-dx*uy+dy*ux)<80){e.lastMelee=s.attackId;r05HitEye(85,'sword');}}
   for(const m of s.servants)if(!m.dead&&Math.hypot(m.x-px,m.y-py)<reach&&((m.x-px)*ux+(m.y-py)*uy>-15)){m.dead=true;evt('servant-killed',{kind:'sword'});}
  }
 }
 const e=s.eye;
 for(const b of s.projectiles){b.age++;b.life--;b.x+=b.vx;b.y+=b.vy;
  if(b.y>R05Arena.floor||b.x<-160||b.x>R05Arena.width+160){b.life=0;continue;}
  if(e&&!e.dead&&s.phase==='battle'&&!b.hits.includes('boss')&&Math.abs(b.x-e.x)<58&&Math.abs(b.y-e.y)<56){b.hits.push('boss');r05HitEye(85,'beam');}
  for(const m of s.servants)if(!m.dead&&Math.hypot(m.x-b.x,m.y-b.y)<24){m.dead=true;evt('servant-killed',{kind:'beam'});}
 }
 s.projectiles=s.projectiles.filter(b=>b.life>0);
}
function r05SyncPointer(){
 if(!state?.r05Arena)return;
 // The mouse stays at a screen pixel as the camera follows the player.
 r05Pointer.x=r05Pointer.sx+state.cam;r05Pointer.y=r05Pointer.sy;
}
function r05CancelPointer(){
 r05Pointer.active=false;r05Pointer.down=false;r05Pointer.right=false;
 r05Pointer.pressed=false;r05Pointer.rightPressed=false;
}
function r05SelectTool(tool){
 if(!state?.r05Arena||mode!=='playing')return;
 const s=state;s.tool=tool;s.p.attack=0;s.p.cooldown=0;s.p.aim=0;
 s.buildMode='auto';s.buildDir=s.p.facing;s.buildHeld=false;s.aimRepeat=0;s.toolCooldown=0;
 r05Builder.releaseAim();r05Builder.cursor=null;r05Builder.cooldown=0;r05CancelPointer();
 note(['泰拉刃：J 按朝向攻击；鼠标左键瞄准。每一刀方向锁定。',
 '木平台：自动贴齐脚下台面；J 同层延伸。L＋方向微调并保留，按 2 恢复自动。',
 '斧头：J 回收自建平台。L＋方向微调，或鼠标右键精确回收。'][tool]);
 evt('arena-tool',{tool});
}
function r05AutoBuildCursor(reset=false){
 const s=state,p=s.p,b=r05Builder;
 if(reset||!b.cursor){
  b.fixedRow=s.buildGroundRow;s.buildDir=p.facing;
  b.aimAt(Math.floor((p.x+p.w/2)/16)*16+p.facing*16,b.fixedRow);
  // Search the FIRST connected edge, not a sequence of skipped mid-air cells.
  // Including the cell under the player's feet makes a late edge press forgiving.
  const center=Math.floor((p.x+p.w/2)/16)*16;
  if(s.tool===2){
   const own=[...b.platforms.values()].filter(q=>Math.abs(q.y-s.buildGroundRow)<=16&&(q.x+8-p.x-p.w/2)*p.facing>=-16&&Math.hypot(q.x+8-p.x-p.w/2,q.y-p.y-p.h/2)<=b.reach).sort((a,c)=>Math.hypot(a.x+8-p.x-p.w/2,a.y-p.y-p.h/2)-Math.hypot(c.x+8-p.x-p.w/2,c.y-p.y-p.h/2));
   if(own.length)b.aimAt(own[0].x,own[0].y);
   return;
  }
  for(let i=0;i<=8;i++){
   const x=center+p.facing*i*16;
   if(!b.reasonAt(x,b.fixedRow,p)){b.aimAt(x,b.fixedRow);break;}
  }
 }
}
function r05Build(v){
 const s=state,p=s.p,b=r05Builder;
 const mouse=!!(r05Pointer.down||r05Pointer.pressed||r05Pointer.right||r05Pointer.rightPressed);
 const active=!!(v.action||mouse),edge=active&&!s.buildHeld;
 if(s.tool===0){s.buildHeld=false;return;}
 // Deliberate keyboard/pad action wins over an old hover location.
 if(v.action&&!mouse)r05Pointer.active=false;
 const pointer=mouse||(r05Pointer.active&&!v.action&&!v.auxiliary);
 if(v.auxiliary||v.auxEdge){
  s.buildMode='manual';
  if(v.auxEdge){r05Pointer.active=false;s.aimRepeat=0;r05AutoBuildCursor(!b.cursor);s.buildMode='manual';}
  if(!b.cursor)r05AutoBuildCursor(true);
  if((v.x||v.y)&&s.aimRepeat<=0){b.nudge(v.x,v.y);s.aimRepeat=9;}else if(s.aimRepeat>0)s.aimRepeat--;
  b.fixedRow=b.cursor.y;
 }else if(pointer){
  r05SyncPointer();b.aimAt(r05Pointer.x,Math.round(r05Pointer.y/16)*16);
  // A mouse preview is not a remembered keyboard row.
  s.pointerPreview=true;
 }else{
  const reset=s.pointerPreview||(s.buildMode==='auto'&&(!active||edge||!b.cursor||
   (p.grounded&&b.fixedRow!==s.buildGroundRow)||b.reasonAt(b.cursor.x,b.cursor.y,p)==='occupied'||(v.x&&Math.sign(v.x)!==s.buildDir)));
  if(s.buildMode==='auto')r05AutoBuildCursor(reset);
  else if(s.pointerPreview&&s.manualCursor)b.aimAt(s.manualCursor.x,s.manualCursor.y);
  s.pointerPreview=false;
 }
 if(!b.cursor)r05AutoBuildCursor(true);
 b.cursor.x=clamp(b.cursor.x,0,3056);b.cursor.y=clamp(b.cursor.y,64,496);
 if(s.tool===1){
  const result=b.tick({pressed:active,edge,player:p,dx:p.facing,dy:0,advance:!pointer&&!v.auxiliary});
  if(result.ok){s.totalPlaced++;s.lastBuild={x:result.platform.x,y:result.platform.y,tick:s.ticks};
   terraSound('build',{volume:.5});evt('arena-build',{x:result.platform.x,y:result.platform.y,wood:b.wood,mode:pointer?'mouse':s.buildMode});}
 }else{
  if(s.toolCooldown>0)s.toolCooldown--;
  if(active&&s.toolCooldown===0){const result=b.remove(b.cursor.x,b.cursor.y,p);s.toolCooldown=9;p.attack=18;p.attackFacing=p.facing;p.aim=0;
   if(result.ok){s.totalMined++;terraSound('break',{volume:.5});evt('arena-remove',{id:result.removed,wood:b.wood});}}
 }
 if(s.buildMode==='manual'&&!pointer)s.manualCursor={...b.cursor};
 s.target={...b.cursor};s.targetReason=s.tool===1?b.reasonAt(b.cursor.x,b.cursor.y,p):b.platforms.has(b.cursor.x+','+b.cursor.y)?null:'original-terrain-protected';
 s.wood=b.wood;s.built=[...b.platforms.values()];s.buildHeld=active;
}
function r05Physics(v){
 const s=state,p=s.p;
 for(const k of ['invuln','hurtLock','cooldown','drop'])if(p[k]>0)p[k]--;
 const support=s.level.surfaces.concat(s.built).find(q=>q.id===p.support);
 if(R05Building.shouldDropThrough(support,{down:v.y>0,jumpEdge:v.jumpEdge})){
  p.drop=18;p.dropRow=support.y;p.y+=2;p.vy=1;p.grounded=false;p.support=null;p.coyote=0;p.buffer=0;
 }else if(v.jumpEdge)p.buffer=7;
 if(p.buffer>0)p.buffer--;
 p.coyote=p.grounded?6:Math.max(0,p.coyote-1);
 if(p.buffer>0&&p.coyote>0&&p.drop===0){p.vy=-7.3;p.grounded=false;p.support=null;p.coyote=0;p.buffer=0;p.jumpHeld=0;evt('arena-jump');}
 if(!p.hurtLock){const move=s.tool!==0&&v.auxiliary?0:v.x;const target=move*4.3;p.vx=approach(p.vx,target,move?.38:.5);if(move&&!v.auxiliary&&!p.attack)p.facing=Math.sign(move);}
 p.x=clamp(p.x+p.vx,8,R05Arena.width-p.w-8);p.walk+=Math.abs(p.vx)*.8;
 if(p.vy<0&&v.jump&&p.jumpHeld<16){p.vy+=.23;p.jumpHeld++;}else{if(p.vy< -3.4&&!v.jump)p.vy=-3.4;p.vy+=.43;}
 p.vy=Math.min(10,p.vy);
 const feet=p.y+p.h;p.y+=p.vy;p.grounded=false;p.support=null;
 if(p.vy>=0){const surfaces=s.level.surfaces.concat(s.built).filter(q=>!q.oneWay||p.drop===0||q.y>p.dropRow+8).sort((a,b)=>a.y-b.y);
  for(const q of surfaces){if(p.x+p.w>q.x+1&&p.x<q.x+q.w-1&&feet<=q.y+.7&&p.y+p.h>=q.y){p.y=q.y-p.h;p.vy=0;p.grounded=true;p.support=q.id;break;}}
 }
 if(p.y>570){Object.assign(p,{x:154,y:454,vx:0,vy:0,grounded:true,support:'arena-floor'});if(s.phase==='battle')r05Hurt(20,100);}
 if(p.grounded){const surface=s.level.surfaces.concat(s.built).find(q=>q.id===p.support);if(surface)s.buildGroundRow=surface.y;}
 s.cam=approach(s.cam,clamp(p.x+p.w/2-380,0,R05Arena.width-960),Math.max(1,Math.abs(p.vx)+2));r05SyncPointer();
}
function r05ArenaStep(v){
 const s=state;if(!s||mode!=='playing')return;
 s.ticks++;frame++;if(s.noticeTime)s.noticeTime--;if(s.interactLock)s.interactLock--;if(s.healTicks>0)s.healTicks--;
 if(v.toolEdge)r05SelectTool((s.tool+1)%3);
 // The same existing auxiliary slot serves the clearly identified item and exit.
 if(v.auxEdge&&!s.interactLock){const center=s.p.x+s.p.w/2,feet=s.p.y+s.p.h;
  if(v.y>0&&s.tool===0){exitSecret();return;}
  if(Math.abs(center-56)<52&&feet>445&&s.tool===0){exitSecret();return;}
  if(Math.abs(center-176)<66&&feet>442&&s.tool===0&&s.phase==='preparation'){r05Summon();}
 }
 r05Physics(v);r05Build(v);r05Combat(v);
 if(s.phase==='battle'&&s.eye){
  const e=s.eye;if(e.flash>0)e.flash--;
  const events=R05Eye.tickEye(e,{x:s.p.x+s.p.w/2,y:s.p.y+s.p.h/2},{playerAlive:s.hp>0});
  for(const item of events){evt('eye-'+item.type,{...item,type:'eye-'+item.type});if(item.type==='spawn-servant'){s.servants.push({id:'servant-'+s.ticks,x:item.x,y:item.y,vx:item.vx,vy:item.vy,age:0,dead:false});}}
  if(Math.abs(s.p.x+s.p.w/2-e.x)<48+s.p.w/2&&Math.abs(s.p.y+s.p.h/2-e.y)<45+s.p.h/2)r05Hurt(e.phase===1?15:23,e.x);
  for(const m of s.servants){if(m.dead)continue;m.age++;const dx=s.p.x+s.p.w/2-m.x,dy=s.p.y+s.p.h/2-m.y,len=Math.max(1,Math.hypot(dx,dy));m.vx=approach(m.vx,dx/len*3.5,.07);m.vy=approach(m.vy,dy/len*3.5,.07);m.x+=m.vx;m.y+=m.vy;
   if(Math.abs(dx)<20&&Math.abs(dy)<29){if(r05Hurt(12,m.x))m.dead=true;}}
  s.servants=s.servants.filter(m=>!m.dead&&m.age<2000);
 }
 r05Pointer.pressed=false;r05Pointer.rightPressed=false;
 s.numbers=s.numbers.filter(n=>--n.life>0);for(const n of s.numbers)n.y-=.35;
}
function step(v){if(state?.r05Arena){r05ArenaStep(v);return;}r04MainStep(v);}
function r05DrawWood(q,cam){
 const x=Math.round(q.x-cam),y=q.y;if(x>960||x+q.w<0)return;
 // Pixel reconstruction from the inherited vanilla Wood Platform inventory pixels;
 // this is not presented as an extracted Tiles_19 atlas.
 ctx.fillStyle='#2c211b';ctx.fillRect(x,y,q.w,6);ctx.fillStyle='#ad8153';ctx.fillRect(x,y,q.w,2);
 ctx.fillStyle='#705137';ctx.fillRect(x,y+2,q.w,3);ctx.fillStyle='#4c3627';ctx.fillRect(x,y+5,q.w,1);
 for(let a=0;a<q.w;a+=16){ctx.fillStyle='#3d2c20';ctx.fillRect(x+a+15,y,1,5);ctx.fillStyle='#d1a36c';ctx.fillRect(x+a+2,y,9,1);ctx.fillStyle='#32281f';ctx.fillRect(x+a+3,y+3,1,1);}
}
let r05SkyCache=null;
function r05Background(s){
 // A restrained, explicitly labelled reference reconstruction, no random monsters.
 // Native forest texture can be selected locally; absent texture is never called original.
 if(r05LocalBackground){const im=r05LocalBackground;ctx.fillStyle='#111e3b';ctx.fillRect(0,0,960,540);const sc=480/im.height,w=im.width*sc;for(let x=-(s.cam*.13)%w;x<960;x+=w)ctx.drawImage(im,x,36,w,480);return;}
 if(!r05SkyCache){const c=document.createElement('canvas');c.width=960;c.height=540;const g=c.getContext('2d');
  const grad=g.createLinearGradient(0,0,0,500);grad.addColorStop(0,'#0b132c');grad.addColorStop(.55,'#182950');grad.addColorStop(1,'#34405d');g.fillStyle=grad;g.fillRect(0,0,960,540);
  // The spare sky keeps targets readable until the checked forest background is embedded.
  for(let i=0;i<74;i++){const x=(i*151+31)%960,y=52+(i*i*19)%252;g.fillStyle=i%4?'#7588a9':'#c0c8c8';g.fillRect(x,y,i%4?1:2,1);}
  g.fillStyle='#b3b6b0';g.beginPath();g.arc(785,123,24,0,Math.PI*2);g.fill();g.fillStyle='#8c98a5';g.fillRect(776,106,7,5);g.fillRect(792,123,6,4);g.fillRect(774,132,9,3);
  r05SkyCache=c;
 }
 ctx.drawImage(r05SkyCache,0,0);
 // Contour-only horizon. A placeholder fallback, not an alleged vanilla forest sprite.
 const bands=[{y:349,p:.035,c:'#1b2a46',h:37},{y:402,p:.09,c:'#15253d',h:22}];
 for(const b of bands){ctx.beginPath();ctx.moveTo(0,540);for(let x=0;x<=976;x+=16){const xx=x+s.cam*b.p;const y=b.y+Math.sin(xx*.008)*b.h+Math.sin(xx*.019+1)*b.h*.4;ctx.lineTo(x,Math.round(y/2)*2);}ctx.lineTo(960,540);ctx.closePath();ctx.fillStyle=b.c;ctx.fill();}
}
function r05DrawEye(e,cam){
 if(!e||e.dead)return;let frameIndex=Math.floor(e.tick/8)%3;
 if(e.phase===2||(e.mode==='transform'&&e.age>=e.profile.transformTicks/2))frameIndex+=3;
 ctx.save();ctx.translate(Math.round(e.x-cam),Math.round(e.y));ctx.rotate(e.angle-Math.PI/2);
 if(e.flash>0&&e.flash%2)ctx.globalAlpha=.7;
 sheet(ctx,'eyeOriginal',[0,frameIndex*166,110,166],-55,-111,110,166);ctx.restore();
}
function r05DrawServant(m,c){ctx.save();ctx.translate(Math.round(m.x-c),Math.round(m.y));ctx.rotate(Math.atan2(m.vy,m.vx)-Math.PI/2);sheet(ctx,'servantOriginal',[0,(Math.floor(m.age/7)%2)*32,20,32],-10,-18,20,32);ctx.restore();}
function r05RenderArena(){
 const s=state,p=s.p,c=s.cam;r05Viewport(true);ctx.clearRect(0,0,960,540);r05Background(s);
 // Arena supports and marker posts are behind one-way surfaces and actors.
 ctx.fillStyle='#2a2a35';for(const x of [0,3060])ctx.fillRect(Math.round(x-c),414,12,84);
 for(const q of s.level.surfaces){if(!q.oneWay)continue;const x=q.x-c;
  ctx.fillStyle='#302832';for(let a=0;a<q.w;a+=192)ctx.fillRect(Math.round(x+a+8),q.y+6,4,496-q.y-6);
  r05DrawWood(q,c);
 }
 for(const q of s.built)r05DrawWood(q,c);
 // Original small Mario pipe is used as the deliberately mixed-game branch entrance.
 ctx.save();ctx.translate(Math.round(40-c),464);sprite('pipe_top',0,0);sprite('pipe_body',0,16);ctx.restore();
 if(s.phase==='preparation'){sheet(ctx,'suspiciousEye',[0,0,30,20],161-c,468+Math.sin(s.ticks*.055)*2,30,20);r05Text('L / Y 召唤',176-c,442,12,'#f5d6a7','center');}
 for(const m of s.servants)r05DrawServant(m,c);r05DrawEye(s.eye,c);
 for(const b of s.projectiles)drawWave(b.x-c,b.y,Math.atan2(b.vy,b.vx),88,b.age,Math.min(1,b.life/12));
 if(p.attack>4&&p.attack<17&&s.tool===0)drawWave(p.x+p.w/2-c,p.y+24,p.attackFacing<0?Math.PI-p.aim:p.aim,84,18-p.attack,.6);
 if(!(p.invuln&&Math.floor(s.ticks/4)%2)){
  ctx.save();ctx.translate(Math.round(p.x+p.w/2-c),Math.round(p.y+p.h));ctx.scale(4/3,4/3);
  person(ctx,0,0,p.attack?p.attackFacing:p.facing,p.grounded&&Math.abs(p.vx)>.1?p.walk:0,!p.grounded,p.attack,s.tool);ctx.restore();
 }
 // Ground masks the Eye when it travels underground, without changing its trajectory.
 ctx.fillStyle='#4a3936';ctx.fillRect(0,496,960,44);ctx.fillStyle='#877554';ctx.fillRect(0,496,960,2);ctx.fillStyle='#3e3733';ctx.fillRect(0,498,960,3);
 for(let x=-(Math.floor(c)%32);x<960;x+=32){ctx.fillStyle='#59423a';ctx.fillRect(x+3,506,17,3);ctx.fillStyle='#302b2b';ctx.fillRect(x+16,518,9,2);}
 if(s.tool!==0&&mode==='playing'&&r05Builder?.cursor){const t=r05Builder.cursor;
  ctx.save();if(vOrFalse(prev.auxiliary)||r05Pointer.active){ctx.strokeStyle='#9eacc729';ctx.lineWidth=.5;for(let x=Math.floor((p.x-128)/16)*16;x<p.x+144;x+=16){ctx.beginPath();ctx.moveTo(x-c,Math.max(72,p.y-112));ctx.lineTo(x-c,Math.min(496,p.y+154));ctx.stroke();}for(let y=Math.floor((p.y-112)/16)*16;y<Math.min(496,p.y+154);y+=16){ctx.beginPath();ctx.moveTo(p.x-c-128,y);ctx.lineTo(p.x-c+144,y);ctx.stroke();}}
  const reason=s.tool===1?r05Builder.reasonAt(t.x,t.y,p):r05Builder.platforms.has(t.x+','+t.y)?null:'original-terrain-protected';
  if(!reason&&s.tool===1){ctx.globalAlpha=.6;r05DrawWood({x:t.x,y:t.y,w:16},c);ctx.globalAlpha=1;}
  ctx.strokeStyle=reason?'#ef9681':'#d1ef9a';ctx.lineWidth=1;ctx.strokeRect(Math.round(t.x-c)+.5,t.y+.5,15,15);
  const text=({'reach':'超出距离','support':'需与台面同层相连','occupied':'已有地形，沿台面走到边缘','player':'避开角色','inventory':'材料不足','original-terrain-protected':'只回收自建平台','bounds':'超出区域'})[reason]||((r05Pointer.active||r05Pointer.down)?'左键放置':'J / B 同层放置');
  r05Text(s.tool===2&&!reason?'J 回收':text,t.x-c+8,t.y-22,11,reason?'#fac3b4':'#e8ffc6','center');ctx.restore();
 }
 if(s.tool===0&&mode==='playing'){
  const aim=p.attack?{angle:p.aim,facing:p.attackFacing}:r05Aim(prev||{}),ux=Math.cos(aim.angle)*aim.facing,uy=Math.sin(aim.angle);
  const ax=p.x+p.w/2-c+ux*49,ay=p.y+22+uy*49;
  ctx.save();ctx.strokeStyle=p.attack?'#c2eabe':'#96b9b080';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ax-ux*7,ay-uy*7);ctx.lineTo(ax+ux*3,ay+uy*3);
  ctx.moveTo(ax-uy*3,ay+ux*3);ctx.lineTo(ax+ux*3,ay+uy*3);ctx.lineTo(ax+uy*3,ay-ux*3);ctx.stroke();ctx.restore();
 }
 for(const n of s.numbers){ctx.save();ctx.globalAlpha=Math.min(1,n.life/12);r05Text(n.text,n.x-c,n.y,16,n.color,'center');ctx.restore();}
 r05HUD(s);trioUI();
}
const vOrFalse=x=>!!x;
function r05HUD(s){
 ctx.fillStyle='#0a102ce8';ctx.fillRect(0,0,960,64);ctx.fillStyle='#556d8355';ctx.fillRect(0,63,960,1);
 r05Text('泰拉瑞亚  /  克苏鲁之眼  R06',18,10,18,'#f4ebd7');
 r05Text(s.phase==='preparation'?'准备场 · 不会自动开战':s.phase==='battle'?'普通模式行为重建 · 两阶段':s.phase==='cleared'?'挑战完成':'重试保留平台',18,37,12,'#aabbce');
 const icons=['sword','wood','axe'];
 for(let i=0;i<3;i++){const x=430+i*58;ctx.fillStyle=i===s.tool?'#4a5746':'#1b2943';ctx.fillRect(x,6,51,50);ctx.strokeStyle=i===s.tool?'#e4d9a5':'#576276';ctx.strokeRect(x+.5,6.5,50,49);
  const im=photos[icons[i]],sc=Math.min(30/im.width,31/im.height);ctx.drawImage(im,0,0,im.width,im.height,Math.round(x+26-im.width*sc/2),10,im.width*sc,im.height*sc);r05Text(String(i+1),x+5,9,10,'#b6c4d5');if(i===1)r05Text(String(s.wood),x+44,39,11,'#fcf2d9','right');}
 r05Text('E / LB 换工具',624,36,11,'#becdde');r05Text('生命 '+s.hp+' / '+s.maxHp,937,10,15,'#f5cecc','right');
 for(let i=0;i<10;i++){ctx.globalAlpha=s.hp>(s.maxHp/10)*i?1:.23;const im=photos.heart;ctx.drawImage(im,0,0,im.width,im.height,757+i*18,36,15,13);}ctx.globalAlpha=1;
 ctx.fillStyle='#0a122bed';ctx.fillRect(0,518,960,22);
 r05Text('← → 移动   空格跳   ↓＋跳下穿   J 使用   L＋方向瞄格   2 归位',14,522,11,'#d3dee8');
 r05Text('P 暂停   R 重试   持剑 ↓＋L 退出',944,522,11,'#d3dee8','right');
 if(s.phase==='battle'&&s.eye&&!s.eye.dead){const e=s.eye;ctx.fillStyle='#111123e8';ctx.fillRect(270,82,420,42);ctx.strokeStyle='#777482';ctx.strokeRect(270.5,82.5,419,41);r05Text('克苏鲁之眼',284,86,13,'#f1d6c6');r05Text(e.hp+' / '+e.maxHp,677,87,11,'#d9dce6','right');ctx.fillStyle='#492529';ctx.fillRect(282,108,396,6);ctx.fillStyle='#bb5757';ctx.fillRect(282,108,396*e.hp/e.maxHp,6);
  if(e.mode==='transform')r05Text('旋转变形 · 仍可攻击',480,132,13,'#f5d3b8','center');
 }else if(s.noticeTime){ctx.fillStyle='#0c162bc9';ctx.fillRect(136,81,688,48);r05Text(s.notice,480,91,12,s.phase==='cleared'?'#ccebad':'#dce4ea','center');r05Text('平台存档仅属于本局；R 重试保留，重新开局重置。',480,110,10,'#9baab8','center');}
 r05Text(r05LocalBackground?'本地导入背景':'背景原图待补 · 参考布局底色',947,500,9,'#aeacb1','right');
}
function render(){if(state?.r05Arena){r05RenderArena();return;}r05Viewport(false);r04MainRender();}
function r05UI(){
 const s=state;
 if(!isTrio())return;
 if(!s){$('stateLabel').textContent='选择试玩入口';$('livesLabel').textContent='♥ 200';$('distanceLabel').textContent='WORLD 1-3 / EYE';$('progressFill').style.width='0%';$('bestLabel').textContent='R06';$('relayMessage').textContent='E / LB 切换 1-3 主线与眼怪准备场；Enter / A 开始。';}
 $('audioBadge').textContent=extraAudioReady?'SFX 5 / 5':'SFX 待解码';
 $('audioStatus').textContent=r05LocalMusic?'本地导入音乐只在眼怪战播放；动作音效沿用上一版。':'原版 BGM 与完整音效待补；当前只保留五项继承动作音。';
 if(s?.r05Arena){
  const vl=document.querySelector('.screen-top span:last-child');if(vl)vl.textContent='960 × 540 · 60 HZ';$('heroStatus').textContent='熔岩套 · '+tools[s.tool]+' | 木平台 '+s.wood+' | 自建 '+s.built.length;
  $('stateLabel').textContent=mode==='paused'?'已暂停':s.phase==='preparation'?'眼怪准备场':s.phase==='battle'?'克苏鲁之眼':s.phase==='cleared'?'隐藏挑战完成':'重试保留平台';
  $('distanceLabel').textContent='EYE / CLASSIC';$('progressFill').style.width=s.eye?((1-s.eye.hp/s.eye.maxHp)*100)+'%':'0%';
  $('actionLabel').textContent='J 按朝向；鼠标左键瞄准';$('jumpLabel').textContent='空格跳；↓＋跳穿木平台';$('moveLabel').textContent='左右移动；建造时不锁走位';$('downLabel').textContent='E 换工具 · L 瞄格保留 · 2 归位';
  $('heroHelp').textContent='原图六帧眼怪、仆从和可疑眼球已内嵌。先准备平台再召唤；R 回准备场并保留平台。原版森林背景、吼声和 BGM 尚未内嵌，场景音效沿用历史素材。';
  $('relayMessage').textContent=s.noticeTime?s.notice:'R06：木台贴齐脚下台面；L＋方向微调后落点保留，按 2 恢复自动。J 按朝向出剑，鼠标左键按光标出剑。';
 }
 $('r05AudioOptions').hidden=mode==='menu';
}
let r05LocalMusic=null,r05LocalMusicUrl=null,r05LocalBackground=null;
const r05AudioOptions=document.createElement('details');r05AudioOptions.id='r05AudioOptions';r05AudioOptions.hidden=true;
r05AudioOptions.innerHTML='<summary>声音／背景原图导入（可选）</summary><p>本版不拿马里奥曲冒充泰拉原声。可读取你本地的 Boss 1 音频与森林背景图；文件只在浏览器里使用，不上传。</p><label>音乐 <input id="r05MusicFile" type="file" accept="audio/*"></label><br><label>背景 <input id="r05BackgroundFile" type="file" accept="image/png,image/jpeg,image/webp"></label><br><button id="r05ClearMusic" type="button">清除导入</button><span id="r05ImportStatus">原版 BGM／背景未内嵌</span>';
const r05Panel=document.querySelector('.panel');if(r05Panel)r05Panel.append(r05AudioOptions);else document.body.append(r05AudioOptions);
$('r05MusicFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(r05LocalMusic)r05LocalMusic.pause();if(r05LocalMusicUrl)URL.revokeObjectURL(r05LocalMusicUrl);r05LocalMusicUrl=URL.createObjectURL(f);r05LocalMusic=new Audio(r05LocalMusicUrl);r05LocalMusic.loop=true;r05LocalMusic.volume=Number($('musicVolume')?.value||48)/100;r05LocalMusic.addEventListener('error',()=>{$('r05ImportStatus').textContent='该音频无法解码';});$('r05ImportStatus').textContent='已选择：'+f.name;audioSync();});
$('r05BackgroundFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{r05LocalBackground=im;URL.revokeObjectURL(u);$('r05ImportStatus').textContent='已载入本地背景';render();};im.onerror=()=>{URL.revokeObjectURL(u);$('r05ImportStatus').textContent='该图片无法解码';};im.src=u;});
$('r05ClearMusic').addEventListener('click',()=>{r05StopLocal();r05LocalMusic=null;r05LocalBackground=null;if(r05LocalMusicUrl)URL.revokeObjectURL(r05LocalMusicUrl);r05LocalMusicUrl=null;$('r05ImportStatus').textContent='原版 BGM／背景未内嵌';});
$('musicVolume')?.addEventListener('input',e=>{if(r05LocalMusic)r05LocalMusic.volume=Number(e.target.value)/100;});
function r05StopLocal(){if(r05LocalMusic)r05LocalMusic.pause();}
function r05SyncLocal(){
 if(!r05LocalMusic)return;
 const playing=isTrio()&&state?.r05Arena&&state.phase==='battle'&&mode==='playing'&&soundOn&&!document.hidden;
 if(playing){if(r05LocalMusic.paused)r05LocalMusic.play().catch(()=>{});}else r05LocalMusic.pause();
}
function r05ClearPointer(){r05Pointer.down=false;r05Pointer.right=false;}
function r05PointerPosition(e){
 const r=canvas.getBoundingClientRect(),sc=Math.min(r.width/960,r.height/540);
 if(!sc)return false;
 const x=(e.clientX-r.left-(r.width-960*sc)/2)/sc,y=(e.clientY-r.top-(r.height-540*sc)/2)/sc;
 r05Pointer.sx=x;r05Pointer.sy=y;r05SyncPointer();
 return x>=0&&x<960&&y>=64&&y<518;
}
// Called by the existing capture handler before it stops propagation.
function r051Keyboard(code){
 if(!state?.r05Arena)return;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','KeyJ','KeyX','ShiftLeft','ShiftRight','KeyL','Space','KeyK','KeyZ'].includes(code)){
  r05Pointer.active=false;
 }
}
canvas.addEventListener('pointermove',e=>{if(!state?.r05Arena||!isTrio()||mode!=='playing')return;
 r05Pointer.active=r05PointerPosition(e);
});
canvas.addEventListener('pointerdown',e=>{if(!state?.r05Arena||!isTrio()||mode!=='playing'||![0,2].includes(e.button))return;
 if(!r05PointerPosition(e))return;e.preventDefault();
 if(e.button===2){r05SelectTool(2);r05PointerPosition(e);r05Pointer.right=true;r05Pointer.rightPressed=true;}
 else {r05Pointer.down=true;r05Pointer.pressed=true;}
 r05Pointer.active=true;canvas.setPointerCapture?.(e.pointerId);audioInit();loadExtraAudio();
});
window.addEventListener('pointerup',r05ClearPointer);
canvas.addEventListener('pointerleave',()=>{if(!r05Pointer.down&&!r05Pointer.right)r05Pointer.active=false;});
canvas.addEventListener('pointercancel',r05CancelPointer);
canvas.addEventListener('contextmenu',e=>{if(state?.r05Arena)e.preventDefault();});window.addEventListener('blur',r05CancelPointer);
window.addEventListener('keydown',e=>{if(typeof r06RewardsOpen!=='undefined'&&r06RewardsOpen)return;if(!isTrio()||!state?.r05Arena||mode!=='playing'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 if(['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();r05SelectTool(Number(e.code.slice(-1))-1);trioUI();}
},true);

const R06_ASSET_DATA={"starfury":"@@E04:uri:a128@@","cloudBottle":"@@E04:uri:a129@@","platinumHead":"@@E04:uri:a130@@","platinumBody":"@@E04:uri:a131@@","platinumLegs":"@@E04:uri:a132@@","star":"@@E04:uri:a133@@","zenith":"@@E04:uri:a134@@","lastPrism":"@@E04:uri:a135@@","torch":"@@E04:uri:a136@@","slimeMount":"@@E04:uri:a137@@","slimySaddle":"@@E04:uri:a138@@","campfireItem":"@@E04:uri:a139@@","campfirePlaced":"@@E04:uri:a140@@","torchPlaced":"@@E04:uri:a141@@","sdmg":"@@E04:uri:a142@@","terraprisma":"@@E04:uri:a143@@","ufo":"@@E04:uri:a144@@","skinHead":"@@E04:uri:a145@@","eyeWhite":"@@E04:uri:a146@@","eyeIris":"@@E04:uri:a147@@","hair":"@@E04:uri:a148@@","demonEye":"@@E04:uri:a149@@","zombie":"@@E04:uri:a150@@","caveBat":"@@E04:uri:a151@@","chestItem":"@@E04:uri:a152@@","skinBody":"@@E04:uri:a153@@","solarBody":"@@E04:uri:a154@@","vortexBody":"@@E04:uri:a155@@","nebulaBody":"@@E04:uri:a156@@","vortexHead":"@@E04:uri:a157@@","nebulaHead":"@@E04:uri:a158@@","stardustHead":"@@E04:uri:a159@@","solarHead":"@@E04:uri:a160@@","stardustBody":"@@E04:uri:a161@@","vortexLegs":"@@E04:uri:a162@@","solarLegs":"@@E04:uri:a163@@","nebulaLegs":"@@E04:uri:a164@@","stardustLegs":"@@E04:uri:a165@@","t12TreeTop":"@@E04:uri:a166@@","t12ForestTop":"@@E04:uri:a167@@","t12Guardian":"@@E04:uri:a168@@","t12Moon":"@@E04:uri:a169@@","t12Dirt":"@@E04:uri:a170@@","terraBlade":"@@E04:uri:a112@@","t12TerraBeam":"@@E04:uri:a114@@","stormbow":"@@E04:uri:a171@@","pickaxe":"@@E04:uri:a172@@"};
/* R06. Sandbox-Trio-only upgrade. Original episode-two game stays delegated.
 * Reference baseline: Terraria 1.4.x sprites; expert Eye behaviour is a reconstruction,
 * not a claim of frame-exact engine emulation. Graduation rewards are this crossover's rules.
 */
const R06_VERSION='R08 · 四层贯通 / 落地换装 / 史莱姆';
const R06_RAW='https://raw.githubusercontent.com/sullerandras/terraria-hd-textures/93960b7c8226c57a10dc2474d73d4b604b401c40/source-pngs/';
const r06Images={},r06AssetStatus={};
// R06_ASSET_DATA is generated by build.py: checked embedded originals take priority.
const R06_IMAGE_PATHS={"chestItem":"Item_48.png","skinBody":"Player_0_3.png","skinHead":"Player_0_0.png","eyeWhite":"Player_0_1.png","eyeIris":"Player_0_2.png","hair":"Player_Hair_1.png","demonEye":"NPC_2.png","zombie":"NPC_3.png","caveBat":"NPC_49.png","starfury":"Item_65.png","cloudBottle":"Item_53.png","star":"Projectile_9.png","platinumHead":"Armor_Head_50.png","platinumBody":"Armor/Armor_31.png","platinumLegs":"Armor_Legs_30.png","solarHead":"Armor_Head_171.png","solarBody":"Armor/Armor_177.png","solarLegs":"Armor_Legs_112.png","vortexHead":"Armor_Head_169.png","vortexBody":"Armor/Armor_175.png","vortexLegs":"Armor_Legs_110.png","nebulaHead":"Armor_Head_170.png","nebulaBody":"Armor/Armor_176.png","nebulaLegs":"Armor_Legs_111.png","stardustHead":"Armor_Head_189.png","stardustBody":"Armor/Armor_190.png","stardustLegs":"Armor_Legs_130.png","zenith":"Item_4956.png","sdmg":"Item_1553.png","lastPrism":"Item_3541.png","terraprisma":"Item_5005.png","kaleidoscope":"Item_4914.png","ufo":"Mount_UFO.png","ufoKey":"Item_2769.png","torch":"Item_8.png","treeTop":"Tree_Tops_0.png","treeTrunk":"Tiles_5.png","treeBranch":"Tree_Branches_0.png","platform":"Tiles_19.png","moon":"Moon_0.png","forestFar":"Background_4.png","forestNear":"Background_5.png","forestHills":"Background_3.png","slimeMount":"Mount_Slime.png","slimySaddle":"Item_2430.png","campfireItem":"Item_966.png","campfirePlaced":"Campfire_Placed_0.png","torchPlaced":"Torch_Placed.png","campfireTiles":"Tiles_215.png","torchTiles":"Tiles_4.png","t12TreeTop":"Tree_Tops_4.png","t12ForestTop":"Tree_Tops_0.png","t12Guardian":"Projectile_623.png","t12Moon":"Moon_0.png","t12Dirt":"Tiles_0.png","terraBlade":"Item_757.png","t12TerraBeam":"Projectile_132.png","stormbow":"Item_3029.png","pickaxe":"Item_3509.png"};
/* R08 original media cache. Data is pinned to the existing R07 commits.
   Nothing is downloaded until an existing asset is requested or the player uses
   the explicit cache button. User imports override, and never get overwritten by,
   the remote soundtrack. Storage failure is non-fatal (private browsing/file://). */
const R08_VERSION='R08 · 操作修复 / 原图原曲缓存';
const R08_CACHE_PREFIX='r08-93960b7-f8c17b3:';
let r08DBPromise=null,r08CacheError='',r08CacheBusy=false,r08CacheProgress='';
let r08CacheHits=0,r08CacheWrites=0,r08ImageRevision=0;
const r08CacheInFlight=new Map(),r08LiveRoars=new Set();
function r08DB(){
 if(r08DBPromise)return r08DBPromise;
 r08DBPromise=new Promise(resolve=>{
  let request,finished=false;
  const done=db=>{if(finished){if(db)db.close();return;}finished=true;clearTimeout(timer);resolve(db);};
  const timer=setTimeout(()=>{r08CacheError='浏览器未开放持久缓存，仍可直接试玩';done(null);},1500);
  try{request=indexedDB.open('MarioMix-Terraria-Media',1);
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('media'))request.result.createObjectStore('media');};
   request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();done(db);};
   request.onerror=()=>{r08CacheError='持久缓存不可用：'+(request.error?.name||'storage error');done(null);};
   request.onblocked=()=>{r08CacheError='缓存被另一个游戏标签占用';done(null);};
  }catch(err){r08CacheError='此打开方式不支持持久缓存；联网/本地导入仍可用';done(null);}
 });return r08DBPromise;
}
async function r08ReadCache(key){
 const db=await r08DB();if(!db)return null;
 return new Promise(resolve=>{try{const tx=db.transaction('media','readonly'),r=tx.objectStore('media').get(R08_CACHE_PREFIX+key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null);tx.onabort=()=>resolve(null);}catch{resolve(null);}});
}
async function r08WriteCache(key,value){
 const db=await r08DB();if(!db)return false;
 return new Promise(resolve=>{try{const tx=db.transaction('media','readwrite');tx.objectStore('media').put(value,R08_CACHE_PREFIX+key);tx.oncomplete=()=>{r08CacheWrites++;resolve(true);};tx.onabort=tx.onerror=()=>{r08CacheError='缓存未保存：存储空间不足或浏览器拒绝';resolve(false);};}catch{resolve(false);}});
}
async function r08DeleteCache(key){const db=await r08DB();if(!db)return;try{db.transaction('media','readwrite').objectStore('media').delete(R08_CACHE_PREFIX+key);}catch{}}
async function r08RememberImage(key,im){
 try{const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;cv.getContext('2d').drawImage(im,0,0);const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/png'));if(blob&&blob.size<4*1024*1024)return await r08WriteCache('image:'+key,{blob,kind:'original-image',savedAt:Date.now()});}catch{}return false;
}
async function r08CacheAudio(key,url){
 const t=r06Music[key];if(!t||t.local||t.cached||!/^https:\/\//.test(url))return false;
 const id='audio:'+key;if(r08CacheInFlight.has(id))return r08CacheInFlight.get(id);
 const job=(async()=>{const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),22000);
  try{const res=await fetch(url,{mode:'cors',credentials:'omit',signal:abort.signal});if(!res.ok)throw new Error('HTTP '+res.status);
   const declared=Number(res.headers.get('content-length')||0);if(declared>40*1024*1024)throw new Error('音频过大');
   const blob=await res.blob();if(blob.size<64||blob.size>40*1024*1024)throw new Error('音频大小异常');
   // Reject HTML error pages and arbitrary files, even if their extension is .ogg.
   const head=new Uint8Array(await blob.slice(0,12).arrayBuffer());const magic=String.fromCharCode(...head.slice(0,4));
   if(!['OggS','RIFF','fLaC'].includes(magic)&&String.fromCharCode(...head.slice(0,3))!=='ID3'&&!(head[0]===255&&(head[1]&224)===224)&&magic!=='\x00\x00\x00\x18')throw new Error('返回的不是有效音频文件');
   const ok=await r08WriteCache('audio:original:'+key,{blob,source:url,kind:'pinned-original',savedAt:Date.now()});if(ok&&!t.local)t.cached=true;return ok;
  }catch(err){t.cacheFailure=err.name==='AbortError'?'缓存超时':String(err.message||err);return false;}finally{clearTimeout(timer);}
 })();r08CacheInFlight.set(id,job);try{return await job;}finally{r08CacheInFlight.delete(id);}
}
async function r08RestoreMusic(key){
 const t=r06Music[key],generation=t.generation;
 const user=await r08ReadCache('audio:user:'+key),stored=user||await r08ReadCache('audio:original:'+key);
 if(t.generation!==generation||t.local){t.restorePending=false;return;}
 if(stored?.blob instanceof Blob){const url=URL.createObjectURL(stored.blob);t.audio.pause();t.generation++;t.audio.src=url;t.cacheURL=url;t.local=!!user;t.cached=true;t.state='not-loaded';t.busy=false;t.nextTry=0;t.audio.load();r08CacheHits++;}
 t.restorePending=false;r06SyncMusic();
}
function r08StopRoars(){for(const a of r08LiveRoars)a.pause();r08LiveRoars.clear();}

const r06AssetJobs=[];
for(const [key,path] of Object.entries(R06_IMAGE_PATHS))r06AssetJobs.push(r07LoadImage(key,path));
const R06_KITS=Object.freeze([
 {id:'melee',name:'战士',armor:'solar',armorName:'日耀耀斑套装',weapon:'zenith',weaponName:'天顶剑',defense:78,mana:200,color:'#eda974',desc:'多剑沿弧线出击并回收；日耀护盾减伤',sub:'天顶剑 · 日耀套 · 宇宙车钥匙',damage:190},
 {id:'ranger',name:'射手',armor:'vortex',armorName:'星旋套装',weapon:'sdmg',weaponName:'太空海豚机枪',defense:62,mana:200,color:'#84dfcc',desc:'高速连射；叶绿弹自动寻敌，消耗实弹',sub:'太空海豚机枪 · 叶绿弹 · 星旋套 · UFO',damage:85},
 {id:'mage',name:'法师',armor:'nebula',armorName:'星云套装',weapon:'lastPrism',weaponName:'终极棱镜',defense:46,mana:300,color:'#e6a1ed',desc:'六束光逐渐聚焦；真实耗蓝与魔力补给',sub:'终极棱镜 · 星云套 · 魔力花 · UFO',damage:100},
 {id:'summoner',name:'召唤师',armor:'stardust',armorName:'星尘套装',weapon:'terraprisma',weaponName:'泰拉棱镜 / 万花筒',defense:38,mana:200,color:'#e4d39c',desc:'六把棱镜自动迎敌；万花筒鞭标记目标',sub:'泰拉棱镜 · 万花筒 · 星尘套 · UFO',damage:90}
]);
const r06Kit=s=>R06_KITS.find(k=>k.id===s?.kit)||null;
const r06Weapon=s=>s?.t13WeaponOverride?(s.t13Weapon||'starfury'):(r06Kit(s)?.weapon||(s?.t13Weapon||'starfury'));
const r06Armor=s=>r06Kit(s)?.armor||'platinum';
const r06Defense=s=>(r06Kit(s)?.defense||20)+(s.t13Accessories?.shackle?1:0);
function r06Init(s,base=null){
 for(const [k,v] of Object.entries({kit:null,cloudJump:false,mountOwned:false,mounted:false,mana:200,maxMana:200,ammo:0,manaPotions:0,healPotions:3,healCooldown:0,manaSickness:0,prismCharge:0,shield:3,shieldTicks:0,boostTicks:0,prismNoMana:0,starCooldown:0,r06Natural:0}))s[k]=base&&base[k]!==undefined?base[k]:v;
 s.r06=true;s.r06FX=[];s.r06Drops=[];s.minions=[];s.r06Chats=[];s.p.cloudAvailable=!!s.cloudJump;s.p.jumpHeld=0;
 s.notice='星怒 + 铂金套开局；问号砖给云朵瓶。J 使用武器，E 换平台 / 斧头。';s.noticeTime=260;
 if(s.kit==='summoner')r06CreateMinions(s);
}
const r06OldNewState=newState;
newState=function(){const s=r06OldNewState();r06Init(s);return s;};
function r06CopyLoadout(from,to){if(!from||!to)return;for(const k of ['kit','cloudJump','mountOwned','mounted','mana','maxMana','ammo','manaPotions','healPotions','healCooldown','manaSickness','shield','shieldTicks','boostTicks'])to[k]=from[k];to.p.cloudAvailable=!!to.cloudJump;}
const r06OldEnter=enterTerraSecret;
enterTerraSecret=function(restart=false,direct=false){const ok=r06OldEnter(restart,direct);if(!ok)return ok;const s=state,base=mainState;r06Init(s,base);s.mounted=false;s.camY=-100;
 // A question block also exists in the practice entrance. No accessory is silently granted.
 s.arenaReward={id:'arena-cloud-question',type:'reward',x:192,y:360,w:16,h:16,solid:true,used:!!base.cloudJump,bump:0};
 s.level.surfaces.push(s.arenaReward);
 s.notice=s.phase==='cleared'?'已击败克眼；可检查装备，持武器 ↓＋L 返回。':'先准备：顶部已加贯通木台与火把。顶一下入口问号砖拿云朵瓶，再按 L 召唤。';s.noticeTime=520;
 if(base.rewardPending&&!base.kit)s.rewardPending=true;
 r06SyncKitTools();r06UpdateUI();return ok;};
const r06OldPersist=r05Persist;
r05Persist=function(){r06OldPersist();if(state?.r05Arena&&mainState){r06CopyLoadout(state,mainState);mainState.rewardPending=!!state.rewardPending;}};
const r06OldExit=exitSecret;
exitSecret=function(){if(state?.rewardPending&&!state.kit){r06OpenRewards();return false;}if(state?.r05Arena)r05Persist();r06CloseRewards();const ok=r06OldExit();if(state&&!state.r05Arena){state.mounted=false;state.minions=[];if(state.kit==='summoner')r06CreateMinions(state);}r06SyncKitTools();return ok;};
const r06OldTerrain=r05Terrain;
r05Terrain=function(){const q=r06OldTerrain();q.push({id:'wood-sky-full',type:'wood-platform',x:0,y:240,w:3072,h:6,oneWay:true});return q;};
function r06Chat(text,color='#b575e3'){const s=state;if(!s)return;s.r06Chats.push({text,color,life:480});if(s.r06Chats.length>4)s.r06Chats.shift();evt('system-message',{text});}
const r06OldSummon=r05Summon;
r05Summon=function(){if(!state?.r05Arena||state.phase!=='preparation')return false;const ok=r06OldSummon();if(!ok)return false;const e=state.eye;
 e.hp=e.maxHp=3640;e.profile={...e.profile,maxHp:3640,phase1Speed:7.2,phase2Speed:9.5,hoverTicks:420,servantEvery:85,hoverSpeed:5.1,hoverAcceleration:.075,phase2HoverTicks:135,transformTicks:180,chargeTicks:30,recoverTicks:36};
 e.expert=true;e.fastChain=0;e.fastIndex=0;e.trail=[];state.r06Natural=0;r06Chat('克苏鲁之眼已苏醒！');r06Roar();return ok;};
function r06NaturalArrival(){if(state?.r05Arena&&state.phase==='preparation'&&!state.r06Natural){state.r06Natural=1200;r06Chat('你感到有个邪恶的东西在看着你...');note('自然来袭预警已触发；仍可按 L 立即召唤。');}}
// Expert reconstruction: transform at 65%, normal triples then accelerating predictive dashes.
function r06EyeStep(e,p){
 const ev=[];e.tick++;e.age++;const ratio=e.hp/e.maxHp;
 e.trail.push({x:e.x,y:e.y,angle:e.angle});if(e.trail.length>14)e.trail.shift();
 const moveTo=(mode)=>{e.mode=mode;e.age=0;ev.push({type:'state',mode,phase:e.phase});};
 const aim=(speed,predict=0)=>{const dx=p.x+p.w/2+p.vx*predict-e.x,dy=p.y+p.h/2+p.vy*predict-e.y,d=Math.hypot(dx,dy)||1;e.vx=dx/d*speed;e.vy=dy/d*speed;e.angle=Math.atan2(dy,dx);};
 const charge=(fast=false)=>{aim(fast?(ratio<.04?21:ratio<.12?19:16):e.phase===1?7.2:9.5,fast?12:0);moveTo(fast?'fastDash':'charge');ev.push({type:fast?'fast-dash':'charge',number:fast?e.fastIndex+1:e.cycleCharges+1,phase:e.phase});if(e.phase===2)r06Roar(fast?1.25:1);};
 if(e.phase===1&&ratio<.65&&e.mode!=='transform'){moveTo('transform');e.spin=0;ev.push({type:'transform-start'});}
 if(e.mode==='transform'){
  e.vx*=.965;e.vy*=.965;e.spin=clamp(e.spin+(e.age<90?.005:-.005),0,.4);e.angle+=e.spin;
  if(e.age%30===0&&e.age<=150){const a=e.age*.81;ev.push({type:'spawn-servant',x:e.x+Math.cos(a)*38,y:e.y+Math.sin(a)*38,vx:Math.cos(a)*5,vy:Math.sin(a)*5});}
  if(e.age>=180){e.phase=2;e.cycleCharges=0;moveTo('hover');ev.push({type:'transform-end',phase:2});r06Roar();}
 }else if(e.mode==='hover'){
  const dx=p.x+p.w/2-e.x,dy=p.y-190-e.y,d=Math.hypot(dx,dy)||1;
  e.vx=approach(e.vx,dx/d*(e.phase===2?6.2:5.1),.1);e.vy=approach(e.vy,dy/d*(e.phase===2?6.2:5.1),.08);
  e.angle+=Math.atan2(Math.sin(Math.atan2(p.y+21-e.y,dx)-e.angle),Math.cos(Math.atan2(p.y+21-e.y,dx)-e.angle))*.12;
  if(e.phase===1&&e.age%85===0&&e.age<=340){const a=Math.atan2(p.y+21-e.y,dx);ev.push({type:'spawn-servant',x:e.x+Math.cos(a)*70,y:e.y+Math.sin(a)*70,vx:Math.cos(a)*5,vy:Math.sin(a)*5});}
  if(e.phase===2&&ratio<.12){e.fastIndex=0;e.fastChain=ratio<.04?8:6;moveTo('fastWind');}
  else if(e.age>=(e.phase===1?420:135))charge();
 }else if(e.mode==='charge'){
  if(e.age>=30)moveTo('recover');
 }else if(e.mode==='recover'){
  e.vx*=.94;e.vy*=.94;
  if(e.age>=36){e.cycleCharges++;
   if(e.cycleCharges<3)charge();else{e.cycleCharges=0;if(e.phase===2){e.fastIndex=0;e.fastChain=ratio<.12?6:3;moveTo('fastWind');}else moveTo('hover');}}
 }else if(e.mode==='fastWind'){
  // Reposition, then a straight dash. It must NOT steer continuously into the player.
  e.vx*=.87;e.vy*=.87;
  const delay=ratio<.04?4:ratio<.12?9:18;
  const targetAngle=Math.atan2(p.y+21-e.y,p.x+p.w/2-e.x);e.angle+=Math.atan2(Math.sin(targetAngle-e.angle),Math.cos(targetAngle-e.angle))*.3;
  if(e.age>=delay)charge(true);
 }else if(e.mode==='fastDash'){
  if(e.age>=(ratio<.12?16:22)){e.fastIndex++;if(e.fastIndex<e.fastChain)moveTo('fastWind');else if(ratio<.04){e.fastIndex=0;moveTo('fastWind');}else if(ratio<.12){e.fastIndex=0;e.fastChain=6;moveTo('fastWind');}else moveTo('hover');}
 }
 e.x+=e.vx;e.y+=e.vy;return ev;
}
function r06Target(s,range=Infinity){const p=s.p;
 if(s.r05Arena&&s.phase==='battle'&&s.eye&&!s.eye.dead)return {id:'boss',x:s.eye.x,y:s.eye.y,vx:s.eye.vx,vy:s.eye.vy,w:92,h:90,obj:s.eye};
 const fs=(s.r05Arena?s.servants:s.foes).filter(e=>!e.dead&&(s.r05Arena||e.active));let best=null,dist=range;
 for(const f of fs){const x=s.r05Arena?f.x:f.x+f.w/2,y=s.r05Arena?f.y:f.y+f.h/2,d=Math.hypot(x-p.x-p.w/2,y-p.y-p.h/2);if(d<dist){dist=d;best={id:f.id,x,y,vx:f.vx||0,vy:f.vy||0,w:f.w||20,h:f.h||32,obj:f};}}
 return best;
}
r05Aim=function(v={}){const s=state,p=s.p,target=r06Target(s,s.r05Arena?Infinity:W*1.2);let dx,dy,source;
 if(target){dx=target.x-p.x-p.w/2;dy=target.y-p.y-p.h/2;source=target.id==='boss'?'boss-lock':'enemy-lock';}
 else if(r05Pointer.down||r05Pointer.pressed){r05SyncPointer();dx=r05Pointer.x-p.x-p.w/2;dy=r05Pointer.y-p.y-p.h/2;source='pointer';}
 else{dx=v.x||p.facing;dy=v.y||0;source='facing';}
 const facing=Math.abs(dx)>.01?Math.sign(dx):p.facing;return {angle:Math.atan2(dy,Math.abs(dx)),facing,source,target};};
function r06Arm(s,v){const a=r05Aim(v),p=s.p;p.facing=a.facing;p.attackFacing=a.facing;p.aim=a.angle;p.attackSource=a.source;return a;}
function r06Shoot(s,b){s.projectiles.push({age:0,life:100,hits:[],trail:[],...b});}
function r06Attack(v={}){
 const s=state,p=s.p;if(p.cooldown>0)return;const aim=r06Arm(s,v),target=aim.target,scale=s.r05Arena?1:.6,x=p.x+p.w/2,y=p.y+p.h/2;
 const tx=target?target.x:x+aim.facing*220*scale,ty=target?target.y:y+Math.sin(aim.angle)*100*scale;
 p.attack=18;s.attackId++;terraSound('swing',{volume:.45});
 if(!s.kit){
  p.cooldown=22;
  if(!s.starCooldown){const sx=tx+((s.attackId%2)?-130:130)*scale,sy=Math.min(y,ty)-430*scale;
   // Starfury aims at a point. Stars remain ballistic after release, unlike homing bullets.
   const lead=target?12:0,dx=tx+(target?.vx||0)*lead-sx,dy=ty+(target?.vy||0)*lead-sy,d=Math.hypot(dx,dy)||1;
   r06Shoot(s,{type:'star',x:sx,y:sy,vx:dx/d*25*scale,vy:dy/d*25*scale,damage:44,life:90,angle:0,pierce:2,passY:ty,attackId:s.attackId});s.starCooldown=22;}
 }else if(s.kit==='melee'){
  p.cooldown=18;
  for(let i=0;i<3;i++)r06Shoot(s,{type:'zenith',x,y,ox:x,oy:y,tx,ty,side:i-1,life:36,attackId:s.attackId,damage:190,skin:['zenith','starfury','sword'][i]});
 }else if(s.kit==='ranger'){
  p.cooldown=5;
  const a=Math.atan2(ty-y,tx-x)+(Math.sin(s.attackId*6.7)*.026),speed=18*scale;
  r06Shoot(s,{type:'bullet',x:x+Math.cos(a)*24*scale,y:y+Math.sin(a)*24*scale,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,speed,life:100,damage:95});
 }else if(s.kit==='summoner'){p.cooldown=28;s.whipAge=0;s.whipId=s.attackId;}
 evt('r06-attack',{weapon:r06Weapon(s),source:aim.source,facing:aim.facing});
}
function r06DamageTarget(t,damage,kind){const s=state;if(!t||t.obj.dead)return;
 if(t.id==='boss'){r05HitEye(damage,kind);return;}
 if(s.r05Arena){t.obj.dead=true;evt('servant-killed',{kind});if(s.hp<s.maxHp){s.hp=Math.min(s.maxHp,s.hp+5);}}
 else hitEnemy(t.obj,damage,t.x<s.p.x?-1:1,kind==='melee'?'blade':'beam');
}
function r06AllTargets(s){const list=[];if(s.r05Arena){if(s.eye&&!s.eye.dead&&s.phase==='battle')list.push({id:'boss',x:s.eye.x,y:s.eye.y,w:92,h:90,obj:s.eye});for(const f of s.servants)if(!f.dead)list.push({id:f.id,x:f.x,y:f.y,w:20,h:32,obj:f});}
 else for(const f of s.foes)if(!f.dead&&f.active)list.push({id:f.id,x:f.x+f.w/2,y:f.y+f.h/2,w:f.w,h:f.h,obj:f});return list;}
function r06CreateMinions(s){s.minions=Array.from({length:6},(_,i)=>({x:s.p.x+s.p.w/2+(i-3)*12,y:s.p.y-40,angle:0,id:i,trail:[]}));}
function r06TickCombat(v){
 const s=state,p=s.p,sc=t10Scale(s);if(s.starCooldown>0)s.starCooldown--;if(s.manaSickness>0)s.manaSickness--;if(s.healCooldown>0)s.healCooldown--;if(s.boostTicks>0)s.boostTicks--;
 if(s.kit==='melee'&&s.shield<3&&++s.shieldTicks>=300){s.shield++;s.shieldTicks=0;}
 const pressed=s.tool===0&&(v.action||r05Pointer.down||r05Pointer.pressed);
 if(s.tool===0&&(!p.attack||s.kit==='ranger'||s.kit==='mage'))r06Arm(s,v); // Tracks boss even while moving away.
 if(pressed&&!p.cooldown&&s.kit!=='mage')r06Attack(v);
 const targets=r06AllTargets(s),px=p.x+p.w/2,py=p.y+p.h/2;
 if(s.tool===0&&!s.kit)t10HitArc(s,targets);
 if(s.kit==='mage'&&pressed){
  if(s.mana<12&&s.manaPotions>0){s.manaPotions--;s.mana=Math.min(s.maxMana,s.mana+200);s.manaSickness=300;evt('mana-potion');}
  if(s.mana>=6){s.t17PrismFade=1;s.prismCharge=Math.min(180,s.prismCharge+1);r06Arm(s,v);p.attack=10;p.cooldown=0;
   if(s.ticks%10===0)s.mana=Math.max(0,s.mana-(s.prismCharge>120?12:6));
   if(s.ticks%8===0){const ux=Math.cos(p.aim)*p.attackFacing,uy=Math.sin(p.aim);for(const t of targets){const origin=t10PrismOrigin(s),dx=t.x-origin.x,dy=t.y-origin.y,along=dx*ux+dy*uy,cross=Math.abs(-dx*uy+dy*ux);if(along>0&&along<1200*sc&&cross<t.w/2+12*sc){r06DamageTarget(t,Math.round((35+s.prismCharge*.75)*(s.manaSickness?.75:1)),'last-prism');}}}
  }else{s.t17PrismFade=Math.max(0,(s.t17PrismFade??1)-.055);if(s.t17PrismFade===0)s.prismCharge=0;if(s.ticks%120===0)note('魔力不足；松开攻击恢复魔力。');}
 }else {s.prismCharge=0;if(s.ticks%5===0)s.mana=Math.min(s.maxMana,s.mana+1);}
 for(const b of s.projectiles){
  b.oldX=b.x;b.oldY=b.y;b.age++;b.life--;b.trail.push({x:b.x,y:b.y});if(b.trail.length>10)b.trail.shift();
  if(b.type==='zenith'){const u=b.age/36,w=Math.sin(Math.PI*u),a=u*Math.PI*2,dx=b.tx-b.ox,dy=b.ty-b.oy,d=Math.hypot(dx,dy)||1;
   b.x=b.ox+dx*w-dy/d*Math.sin(a)*55*sc+b.side*18*sc*Math.sin(a);b.y=b.oy+dy*w+dx/d*Math.sin(a)*55*sc;b.angle=a*2;
  }else{
   if(b.type==='bullet'){const target=t17HomingTarget(s,b.x,b.y,300*sc,true);if(target){const d=Math.hypot(target.x-b.x,target.y-b.y)||1;b.vx=approach(b.vx,(target.x-b.x)/d*b.speed,.65*sc);b.vy=approach(b.vy,(target.y-b.y)/d*b.speed,.65*sc);}}
   b.x+=b.vx;b.y+=b.vy;b.angle=(b.angle||0)+.2;
  }
  for(const t of targets){if(t.obj.dead||b.hits.includes(t.id))continue;const box={x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h};
   if(segmentHits({x:b.oldX,y:b.oldY},b,box,(b.type==='zenith'?18:b.t17Wave?26:9)*sc)){b.hits.push(t.id);r06DamageTarget(t,b.damage,b.type);if(b.type==='bullet'||(b.type==='star'&&b.hits.length>=2)||(b.type==='terraBlade'&&b.hits.length>=3)){b.life=0;break;}}}
  if(b.type==='terraBlade'||b.type==='star'&&b.y>b.passY){const ground=s.r05Arena?s.level.surfaces.filter(q=>q.solid):solids().filter(q=>q.solid);if(ground.some(q=>b.x>=q.x&&b.x<q.x+q.w&&b.y>=q.y&&b.y<q.y+q.h))b.life=0;}
  if(b.y>(s.r05Arena?2600:320)||b.x<-500||b.x>s.level.width+500)b.life=0;
 }
 s.projectiles=s.projectiles.filter(b=>b.life>0);
 if(s.kit==='summoner'){
  if(!s.minions.length)r06CreateMinions(s);const target=r06Target(s,1200*sc);
  for(const m of s.minions){m.trail.push({x:m.x,y:m.y});if(m.trail.length>9)m.trail.shift();const cycle=(s.ticks+m.id*11)%66;let tx,ty;
   if(target){const attack=cycle<22,phase=(s.ticks+m.id*14)/28;tx=target.x+(attack?0:Math.cos(phase)*95*sc);ty=target.y+(attack?0:Math.sin(phase)*72*sc);if(cycle===12&&Math.hypot(m.x-target.x,m.y-target.y)<80*sc+target.w){r06DamageTarget(target,90+(target.obj.tagUntil>s.ticks?20:0),'terraprisma');}}
   else {tx=px+(m.id-2.5)*24*sc;ty=p.y-(42+(m.id%2)*12)*sc;}
   const dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy)||1,speed=Math.min(d,18*sc);m.x+=dx/d*speed;m.y+=dy/d*speed;m.angle=Math.atan2(dy,dx)+Math.PI/4;
  }
  if(s.whipAge!==undefined&&s.whipAge<28){s.whipAge++;t17WhipHit(s,targets);}
 }
}
r05Attack=r06Attack;
r05Combat=function(v){if(state.p.attack>0)state.p.attack--;r06TickCombat(v);};
updateCombat=function(v){r06TickCombat(v);};
function r06CollectCloud(s){if(s.cloudJump)return;s.cloudJump=true;s.p.cloudAvailable=true;if(s.r05Arena&&mainState)mainState.cloudJump=true;r06Chat('获得云朵瓶：在空中再次按跳跃，可二段跳。','#aabaff');s.score+=1000;evt('cloud-bottle-collected');terraSound('build',{volume:.6});}
updateDrops=function(ss){const s=state,p=s.p;for(const d of s.drops){if(d.done)continue;d.age++;if(d.age<24)d.y-=.55;else{const bottom=d.y+d.h;d.vy=Math.min(5,d.vy+.22);d.y+=d.vy;for(const q of ss)if(d.x+d.w>q.x&&d.x<q.x+q.w&&bottom<=q.y+1&&d.y+d.h>=q.y&&d.vy>=0){d.y=q.y-d.h;d.vy=0;break;}}
 if(d.age>10&&near(p,d)){d.done=true;r06CollectCloud(s);}}};
function r06DoubleJump(s,v,arena){const p=s.p;if(p.grounded)p.cloudAvailable=!!s.cloudJump;
 if(!s.mounted&&v.jumpEdge&&!p.grounded&&p.coyote===0&&p.cloudAvailable&&s.cloudJump&&p.drop===0){p.vy=arena?-6.6:-6.3;p.buffer=0;p.jumpHeld=0;p.cloudAvailable=false;s.r06FX.push({type:'cloud',x:p.x+p.w/2,y:p.y+p.h,age:0});evt('double-jump');return true;}return false;}
const r06OldPhysics=r05Physics;
r05Physics=function(v){const s=state,p=s.p;const oldX=p.x,oldY=p.y,oldFeet=p.y+p.h;
 if(s.mounted){for(const k of ['invuln','hurtLock','cooldown','drop'])if(p[k]>0)p[k]--;
  p.vx=approach(p.vx,v.x*7,.38);p.vy=approach(p.vy,(v.jump?-1:v.y)*5,.36);p.x=clamp(p.x+p.vx,8,3044);p.y=clamp(p.y+p.vy,-190,454);p.grounded=false;p.support=null;if(v.x&&!p.attack)p.facing=Math.sign(v.x);p.walk+=Math.abs(p.vx)*.8;
 }else {const dbl=r06DoubleJump(s,v,true);r06OldPhysics(dbl?{...v,jumpEdge:false,jump:true}:v);}
 // A single jump hits the underside of the practice question block; the reward emerges above it.
 const q=s.arenaReward;
 if(q&&p.x+p.w>q.x&&p.x<q.x+q.w&&p.vy<0&&oldY>=q.y+q.h&&p.y<=q.y+q.h){
  p.y=q.y+q.h;p.vy=0;
  if(!q.used){q.used=true;q.bump=12;s.r06Drops.push({x:q.x,y:q.y-28,w:20,h:26,age:0,vy:-2});evt('arena-question-bump');}
 }else if(q&&near(p,q)){
  if(oldX+p.w<=q.x){p.x=q.x-p.w;p.vx=0;}else if(oldX>=q.x+q.w){p.x=q.x+q.w;p.vx=0;}
 }

 if(q?.bump)q.bump--;
 for(const d of s.r06Drops){d.age++;const bottom=d.y+d.h;d.vy=Math.min(5,d.vy+.25);d.y+=d.vy;
  for(const t of s.level.surfaces.concat(s.built))if(d.x+d.w>t.x&&d.x<t.x+t.w&&bottom<=t.y+1&&d.y+d.h>=t.y&&d.vy>=0){d.y=t.y-d.h;d.vy=0;break;}
  if(d.age>12&&near(p,d)){d.done=true;r06CollectCloud(s);}}
 s.r06Drops=s.r06Drops.filter(d=>!d.done);
 const vw=R06_VIEW.w;s.cam=approach(s.cam,clamp(p.x+p.w/2-vw*.44,0,3072-vw),Math.abs(p.vx)+4);
 const wanted=clamp(p.y+p.h/2-R06_VIEW.h*.59,-240,-82);s.camY=approach(s.camY||-100,wanted,3);r05SyncPointer();
};
const r06OldHurt=r05Hurt;
r05Hurt=function(amount,x){const s=state;let n=Math.max(1,Math.round(amount-r06Defense(s)*.75));if(s.kit==='melee'&&s.shield>0&&!s.p.invuln){n=Math.max(1,Math.round(n*.7));s.shield--;s.shieldTicks=0;}return r06OldHurt(n,x);};
const r06OldHitEye=r05HitEye;
r05HitEye=function(d,kind){const s=state,before=!!s?.bossClear;r06OldHitEye(d,kind);if(s?.bossClear&&!before){s.rewardPending=!s.kit;mainState.rewardPending=s.rewardPending;s.hp=s.maxHp;r06Chat('克苏鲁之眼已被打败！');r06OpenRewards();}};
r05ArenaStep=function(v){const s=state;if(!s||mode!=='playing'||r06RewardsOpen)return;s.ticks++;frame++;if(s.noticeTime)s.noticeTime--;if(s.interactLock)s.interactLock--;if(s.healTicks>0)s.healTicks--;
 if(v.toolEdge)r05SelectTool((s.tool+1)%3);
 if(v.auxEdge&&!s.interactLock&&s.tool===0){if(v.y>0){exitSecret();return;}if(s.phase==='preparation')r05Summon();else if(s.phase==='cleared'){exitSecret();return;}}
 if(s.r06Natural>0&&!--s.r06Natural)r05Summon();
 r05Physics(v);r05Build(v);r05Combat(v);
 if(s.phase==='battle'&&s.eye&&!s.eye.dead){const e=s.eye;if(e.flash)e.flash--;const events=r06EyeStep(e,s.p);
  for(const it of events){evt('eye-'+it.type,{...it,type:'eye-'+it.type});if(it.type==='spawn-servant')s.servants.push({id:'servant-'+s.ticks+'-'+s.servants.length,x:it.x,y:it.y,vx:it.vx,vy:it.vy,age:0,dead:false});}
  if(Math.abs(s.p.x+s.p.w/2-e.x)<46+s.p.w/2&&Math.abs(s.p.y+s.p.h/2-e.y)<45+s.p.h/2)r05Hurt(e.phase===1?30:e.mode==='fastDash'?40:36,e.x);
  for(const m of s.servants){if(m.dead)continue;m.age++;const dx=s.p.x+s.p.w/2-m.x,dy=s.p.y+s.p.h/2-m.y,d=Math.hypot(dx,dy)||1;m.vx=approach(m.vx,dx/d*4.2,.1);m.vy=approach(m.vy,dy/d*4.2,.1);m.x+=m.vx;m.y+=m.vy;if(Math.abs(dx)<20&&Math.abs(dy)<29&&r05Hurt(18,m.x))m.dead=true;}
  s.servants=s.servants.filter(m=>!m.dead&&m.age<2000);
 }
 r06TickFX(s);r05Pointer.pressed=false;r05Pointer.rightPressed=false;s.numbers=s.numbers.filter(n=>--n.life>0);for(const n of s.numbers)n.y-=.35;
};
function r06TickFX(s){for(const f of s.r06FX)f.age++;s.r06FX=s.r06FX.filter(f=>f.age<32);for(const m of s.r06Chats)m.life--;s.r06Chats=s.r06Chats.filter(m=>m.life>0);}
function r06SyncKitTools(){tools[0]=r06Kit(state)?.weaponName||'星怒';}
const r06OldSelect=r05SelectTool;
r05SelectTool=function(tool){r06OldSelect(tool);r06SyncKitTools();if(state)note(tool===0?tools[0]+'：克眼存活时自动追踪；J 使用。':tool===1?'木平台：在台面边缘按住 J 快速延伸，L＋方向微调。':'斧头：J 砍树或回收自己搭的平台。');};
function r06Heal(){const s=state;if(!s||mode!=='playing'||r06RewardsOpen)return;if(s.healCooldown||s.healPotions<=0){note(s.healCooldown?'药水冷却 '+Math.ceil(s.healCooldown/60)+' 秒':'治疗药水已用完');return;}if(s.hp>=s.maxHp)return;s.hp=Math.min(s.maxHp,s.hp+100);s.healPotions--;s.healCooldown=3600;evt('heal',{hp:s.hp,remaining:s.healPotions});}
function r06ToggleMount(){const s=state;if(!s||mode!=='playing'||r06RewardsOpen)return;if(!s.mountOwned){note('开局没有坐骑；击败克眼并选择职业套装后解锁。');return;}s.mounted=!s.mounted;s.p.vx*=.65;s.p.vy=0;s.p.grounded=false;s.p.support=null;s.p.attack=0;evt('mount',{mounted:s.mounted});note(s.mounted?'UFO：方向飞行，空格上升，F 下骑。':'已下坐骑');}

// --- Four real loadouts; a modal freezes the room until one selection is committed. ---
let r06RewardsOpen=false;
const r06RewardBox=document.createElement('div');r06RewardBox.id='r06Rewards';r06RewardBox.hidden=true;r06RewardBox.setAttribute('role','dialog');r06RewardBox.setAttribute('aria-modal','true');r06RewardBox.setAttribute('aria-labelledby','r06RewardTitle');
r06RewardBox.innerHTML='<section><small>HIDDEN CHALLENGE COMPLETE</small><h2 id="r06RewardTitle">克苏鲁之眼已被打败！</h2><p>选择一套职业毕业装备 · 本次选择会带回 1-3</p><div id="r06RewardCards"></div><footer>四选一，不随机替你选。每套含 UFO 坐骑；这是混合关卡奖励，不是原版克眼掉落表。<br>原图尚在加载时可继续选择，装备效果不受影响。按数字 1—4 或点击卡片确认。</footer></section>';
document.body.appendChild(r06RewardBox);
const r06CSS=document.createElement('style');r06CSS.textContent=`
#r06Rewards[hidden]{display:none!important}#r06Rewards{position:fixed;inset:0;z-index:10000;background:#020818db;display:flex;align-items:center;justify-content:center;padding:24px;font-family:inherit;color:#e8e8e2}
#r06Rewards section{background:#111e31;border:1px solid #5b697c;box-shadow:0 25px 100px #000b;padding:28px;width:min(1020px,94vw);max-height:92vh;overflow:auto;border-radius:12px;text-align:center}
#r06Rewards small{letter-spacing:.2em;color:#b8bd8a;font-size:11px}#r06Rewards h2{margin:12px 0 8px;font-size:28px}#r06Rewards p{color:#aebbcd;margin:8px 0 25px}#r06RewardCards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
#r06RewardCards button{font:inherit;border:1px solid var(--kit);background:#18273b;color:#edf0f1;border-radius:8px;padding:18px 12px;cursor:pointer;text-align:left;min-height:260px;transition:transform .16s,background .16s}#r06RewardCards button:hover,#r06RewardCards button:focus{background:#273e53;transform:translateY(-4px);outline:2px solid var(--kit)}
#r06RewardCards .kit-key{font-size:10px;color:#92a3b6}#r06RewardCards h3{margin:10px 0;color:var(--kit);font-size:24px}#r06RewardCards canvas{image-rendering:pixelated;width:100%;height:74px;margin:8px 0}#r06RewardCards b{font-size:13px;display:block;min-height:36px}#r06RewardCards span{font-size:11px;line-height:1.8;color:#bfcbd8;display:block;margin-top:10px}#r06Rewards footer{font-size:11px;line-height:1.9;color:#95a6ba;margin-top:22px}
#r06SceneActions[hidden],#r06Media[hidden]{display:none!important}#r06SceneActions{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}#r06SceneActions button{font:inherit;font-size:11px;padding:6px 10px;border:1px solid #5d738a;border-radius:5px;background:#23374a;color:#e1e7ed;cursor:pointer}#r06Media{font:inherit;font-size:11px;line-height:1.65;color:#a9b7c8;margin-top:10px}#r06Media input{font-size:10px;max-width:100%}#r06Media label{display:block;margin:6px 0}#r06Media select{background:#1c3044;color:#e7edf2;border:1px solid #6c7c8e;font:inherit;padding:3px}
@media(max-width:750px){#r06RewardCards{grid-template-columns:repeat(2,1fr)}#r06Rewards section{padding:18px}#r06RewardCards button{min-height:210px}#r06Rewards h2{font-size:22px}}
`;
document.head.appendChild(r06CSS);
for(const [i,k] of R06_KITS.entries()){const b=document.createElement('button');b.type='button';b.dataset.kit=k.id;b.style.setProperty('--kit',k.color);b.innerHTML=`<div class="kit-key">${i+1} / SELECT CLASS</div><h3>${k.name}</h3><canvas width="200" height="74" aria-label="${k.armorName}"></canvas><b>${k.weaponName}</b><span>${k.armorName}<br>防御 ${k.defense} · UFO 无限飞行<br>${k.desc}</span>`;b.addEventListener('click',()=>r06ChooseKit(k.id));$('r06RewardCards').appendChild(b);}
function r06OpenRewards(){if(!state||state.kit||!state.bossClear)return false;r06RewardsOpen=true;r06RewardBox.hidden=false;clearInput();r05CancelPointer();r06DrawRewardCards();r06RewardBox.querySelector('button')?.focus({preventScroll:true});r06SyncMusic();return true;}
function r06CloseRewards(){r06RewardsOpen=false;r06RewardBox.hidden=true;}
function r06ChooseKit(id){const s=state,k=R06_KITS.find(k=>k.id===id);if(!s||!k||!s.bossClear||s.kit||!s.rewardPending)return false;
 s.kit=k.id;s.rewardPending=false;s.mountOwned=true;s.mounted=false;s.maxMana=k.mana;s.mana=k.mana;s.ammo=k.id==='ranger'?9999:0;s.manaPotions=k.id==='mage'?100:0;s.healPotions=Math.max(s.healPotions,10);s.hp=s.maxHp;s.shield=3;s.shieldTicks=0;s.tool=0;s.p.attack=0;s.p.cooldown=0;s.projectiles=[];s.minions=[];
 if(k.id==='summoner')r06CreateMinions(s);if(mainState){r06CopyLoadout(s,mainState);mainState.rewardPending=false;mainState.hiddenWon=true;}
 r06CloseRewards();clearInput();r06SyncKitTools();r06Chat('已获得'+k.armorName+'、'+k.weaponName+'和宇宙车钥匙。','#dfd99b');note(k.name+'套装已装备。J 使用，F 骑乘 UFO；持武器 ↓＋L 带回 1-3。');evt('graduation-chosen',{kit:id,weapon:k.weapon,armor:k.armor,mount:'ufo'});canvas.focus({preventScroll:true});r06UpdateUI();render();return true;
}
function r06DrawRewardCards(){r06RewardBox.querySelectorAll('[data-kit]').forEach(b=>{const k=R06_KITS.find(k=>k.id===b.dataset.kit),cv=b.querySelector('canvas'),g=cv.getContext('2d');g.clearRect(0,0,200,74);g.imageSmoothingEnabled=false;
 r06DrawBody(g,40,66,1,0,false,0,0,1,k.armor,k.weapon,1);r06Icon(g,k.weapon,116,34,46);r06Icon(g,'ufoKey',168,35,30);});}
const r06SceneActions=document.createElement('div');r06SceneActions.id='r06SceneActions';r06SceneActions.hidden=true;r06SceneActions.innerHTML='<button type="button" id="r06Summon">L · 召唤克眼</button><button type="button" id="r06Natural">自然来袭预警</button><button type="button" id="r06Retry">R · 保留平台重试</button><button type="button" id="r06Return">带回 1-3</button><button type="button" id="r06Mount">F · 坐骑</button><button type="button" id="r06Heal">H · 治疗</button>';
(r05Panel||document.body).appendChild(r06SceneActions);
$('r06Summon').onclick=()=>{r05Summon();canvas.focus({preventScroll:true});};$('r06Natural').onclick=()=>{r06NaturalArrival();canvas.focus({preventScroll:true});};$('r06Retry').onclick=()=>{if(state?.r05Arena&&!r06RewardsOpen){enterTerraSecret(true);canvas.focus({preventScroll:true});}};$('r06Return').onclick=()=>{exitSecret();canvas.focus({preventScroll:true});};$('r06Mount').onclick=r06ToggleMount;$('r06Heal').onclick=r06Heal;

// Original music is streamed from the pinned repository, not a synthesized substitute.
const R06_MUSIC_ROOT='https://raw.githubusercontent.com/ObscuriaLithium/maestro-terraria/f8c17b366a4e0f978e52208f28a2fef4205acad1/assets/terraria/sounds/';
const r06Music={day:{file:'overworld_day.ogg',label:'Overworld Day'},night:{file:'overworld_night.ogg',label:'Overworld Night'},boss:{file:'boss_1.ogg',label:'Boss 1'}};
let r06MusicKey=null,r06MusicUnlocked=false,r06MusicVolume=.35,r06RoarAudio=null,r06MediaEnabled=true;
const r06Media=document.createElement('details');r06Media.id='r06Media';r06Media.hidden=true;r06Media.innerHTML='<summary>原版音乐 / 素材状态</summary><div id="r06MusicStatus">原曲联网读取；开始游戏后启用声音。</div><p>地表白天、夜间准备、Boss 战分别切曲，只播放一条。网络不可用时保留静音，不用合成曲冒充原声。</p><label>本地音频槽位 <select id="r06MusicSlot"><option value="day">地表 / Overworld Day</option><option value="night">夜晚 / Overworld Night</option><option value="boss">克眼 / Boss 1</option><option value="roar">原版吼声</option></select><input id="r06MusicImport" type="file" accept="audio/*"></label><button type="button" id="r06RetryMedia">重试加载原图 / 原曲</button><div id="r06AssetReport"></div>';
(r05Panel||document.body).appendChild(r06Media);r05AudioOptions.hidden=true;
r07SetupMusic();
$('r06MusicImport').addEventListener('change',r08ImportMedia);
$('r06RetryMedia').onclick=()=>{
 for(const [key,path] of Object.entries(R06_IMAGE_PATHS))if(r06AssetStatus[key].state==='unavailable'){
  const im=new Image();r06AssetStatus[key].state='loading';
  im.onload=()=>{r06Images[key]=im;r06AssetStatus[key].state='ready';r06AssetStatus[key].size=[im.width,im.height];r06UpdateUI();if(r06RewardsOpen)r06DrawRewardCards();};
  im.onerror=()=>{r06AssetStatus[key].state='unavailable';};im.src=R06_RAW+path;
 }
 for(const t of Object.values(r06Music))if(!t.local&&t.state==='network-unavailable'){t.audio.load();t.state='not-loaded';t.nextTry=0;t.busy=false;}
 r06MusicUnlocked=true;r06SyncMusic();
};
function r06Roar(rate=1){if(!r06RoarAudio||!soundOn)return;const a=r06RoarAudio.cloneNode();a.volume=.35;a.playbackRate=rate;a.play().catch(()=>{});}
function r06StopMusic(){for(const t of Object.values(r06Music)){t.audio.pause();}r06MusicKey=null;}
function r06SyncMusic(){const playable=isTrio()&&state&&['playing','flag'].includes(mode)&&soundOn&&!document.hidden&&r06MusicUnlocked;
 const key=playable?(state.r05Arena?(state.phase==='battle'?'boss':'night'):'day'):null;
 for(const [k,t] of Object.entries(r06Music)){if(k!==key&&!t.audio.paused)t.audio.pause();}
 const changed=r06MusicKey!==key;r06MusicKey=key;if(!key)return;const t=r06Music[key];if(changed&&t.state!=='network-unavailable')t.nextTry=0;t.audio.volume=r06MusicVolume;
 if(t.audio.paused&&!t.busy&&performance.now()>t.nextTry){t.busy=true;t.state='loading';t.nextTry=performance.now()+3000;t.audio.play().then(()=>{t.busy=false;t.state='playing';}).catch(()=>{t.busy=false;if(t.state!=='network-unavailable')t.state='waiting-user-or-network';});}
}
function r06KeyboardAudio(){r06MusicUnlocked=true;for(const t of Object.values(r06Music))if(t.state!=='network-unavailable')t.nextTry=0;}
const r06OldAudioSync=audioSync;
audioSync=function(){r06OldAudioSync.apply(this,arguments);r06SyncMusic();};
$('musicVolume')?.addEventListener('input',e=>{r06MusicVolume=Math.max(0,Math.min(1,Number(e.target.value)/100));r06SyncMusic();});
for(const ev of ['pointerdown','keydown'])window.addEventListener(ev,()=>{if(isTrio()){r06MusicUnlocked=true;for(const t of Object.values(r06Music))if(t.state!=='network-unavailable')t.nextTry=0;r06SyncMusic();}},{capture:true});
document.addEventListener('visibilitychange',r06SyncMusic);

// --- Rendering: native sprite frames, a wider camera, torch pools, and distinct weapons. ---
const R06_VIEW=Object.freeze({w:1280,h:720});
r05Viewport=function(on){document.body.classList.toggle('r05-arena',on);$('stage').classList.toggle('r05-arena',on);if(on){if(renderScale!==-6){renderScale=-6;canvas.width=1920;canvas.height=1080;}ctx.setTransform(1.5,0,0,1.5,0,0);ctx.imageSmoothingEnabled=false;}
 else if(renderScale<0){renderScale=-1;setRenderScale(1);const vl=document.querySelector('.screen-top span:last-child');if(vl)vl.textContent=r05NativeViewportLabel;}};
r05SyncPointer=function(){if(!state?.r05Arena)return;r05Pointer.x=r05Pointer.sx+state.cam;r05Pointer.y=r05Pointer.sy+(state.camY||0);};
r05PointerPosition=function(e){const r=canvas.getBoundingClientRect(),sc=Math.min(r.width/R06_VIEW.w,r.height/R06_VIEW.h);if(!sc)return false;const x=(e.clientX-r.left-(r.width-R06_VIEW.w*sc)/2)/sc,y=(e.clientY-r.top-(r.height-R06_VIEW.h*sc)/2)/sc;r05Pointer.sx=x;r05Pointer.sy=y;r05SyncPointer();return x>=0&&x<R06_VIEW.w&&y>=80&&y<R06_VIEW.h-24;};
function r06Sprite(g,key,x,y,w,h,src=null){const im=r06Images[key]||photos[key];if(!im)return false;g.imageSmoothingEnabled=false;if(src)g.drawImage(im,...src,Math.round(x),Math.round(y),w,h);else g.drawImage(im,Math.round(x),Math.round(y),w||im.width,h||im.height);return true;}
function r06Icon(g,key,x,y,size){const im=r06Images[key]||photos[key];if(!im)return;const sc=Math.min(size/im.width,size/im.height);g.drawImage(im,Math.round(x-im.width*sc/2),Math.round(y-im.height*sc/2),im.width*sc,im.height*sc);}
function r06DrawBody(g,x,foot,facing,walk=0,air=false,attack=0,tool=0,opacity=1,armor='platinum',weapon='starfury',scale=.75){
 if(!ready)return;const n=air?5:walk?6+Math.floor(walk/5)%14:0,bob=[7,8,9,14,15,16].includes(n)?-2:0;
 // Until online equipment is decoded, retain the checked Platinum layers. The UI reports it.
 const layer=(suffix)=>r06Images[armor+suffix]?armor+suffix:'platinum'+suffix;
 g.save();g.translate(Math.round(x),Math.round(foot));g.scale(facing*scale,scale);g.globalAlpha*=opacity;
 r06Sprite(g,layer('Body'),-20,-54+bob,40,56,[320,0,40,56]);r06Sprite(g,layer('Legs'),-20,-54,40,56,[0,n*56,40,56]);r06Sprite(g,layer('Body'),-20,-54+bob,40,56,[0,0,40,56]);
 r06Sprite(g,layer('Head'),-20,-54,40,56,[0,n*56,40,56]);
 let arm=[80,0,40,56];if(attack){const f=(18-Math.min(18,attack))/18;arm=[f<.22?120:f<.5?160:f<.77?200:240,0,40,56];}else if(walk&&!air)arm=[[80,0,40,56],[200,56,40,56],[240,56,40,56],[240,0,40,56]][Math.floor(walk/8)%4];
 r06Sprite(g,layer('Body'),-20,-54+bob,40,56,arm);
 g.save();g.translate(6,-22+bob);const s=state;const a=s?.p.aim||0;
 if(tool===1){sheet(g,'wood',[0,0,24,14],0,-5,20,12);}else if(tool===2){g.rotate(attack?swingAngle(attack):.58);sheet(g,'axe',[0,0,34,30],-6,-29,31,28);}
 else if(weapon==='sdmg'||weapon==='lastPrism'){g.rotate(a);const im=r06Images[weapon];if(im){const sc=weapon==='sdmg'?.8:.75;g.drawImage(im,-12,-im.height*sc/2,im.width*sc,im.height*sc);}}
 else {g.rotate(attack?swingAngle(attack)+a:.58);const key=weapon==='terraprisma'?'kaleidoscope':weapon;r06Sprite(g,key,-7,-34,34,38);}
 g.restore();g.restore();
}
person=function(g,x,foot,facing,walk=0,air=false,attack=0,tool=0,opacity=1){r06DrawBody(g,x,foot,facing,walk,air,attack,tool,opacity,r06Armor(state),r06Weapon(state),.75);};
function r06DrawProjectiles(s,c){const sc=s.r05Arena?1:.6;ctx.save();for(const b of s.projectiles){
  for(let i=0;i<b.trail.length;i++){const t=b.trail[i];ctx.globalAlpha=(i+1)/b.trail.length*.35;ctx.fillStyle=b.type==='bullet'?'#8de04c':b.type==='zenith'?'#85d4f1':'#ffe9a2';ctx.fillRect(t.x-c-2*sc,t.y-2*sc,4*sc,4*sc);}
  ctx.globalAlpha=1;ctx.save();ctx.translate(b.x-c,b.y);ctx.rotate(b.type==='bullet'?Math.atan2(b.vy,b.vx):b.angle||0);
  if(b.type==='bullet'){ctx.fillStyle='#adf276';ctx.fillRect(-6*sc,-sc,12*sc,2*sc);}else if(b.type==='zenith'){const key=b.skin||'zenith';r06Sprite(ctx,key,-22*sc,-22*sc,44*sc,44*sc);}
  else if(!r06Sprite(ctx,'star',-11*sc,-11*sc,22*sc,22*sc)){// a star-light trail is an effect, never labelled an extracted asset
   ctx.fillStyle='#fff5c3';ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=(i%2?4:11)*sc;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();}
  ctx.restore();
 }
 if(s.kit==='mage'&&s.prismCharge>0){const p=s.p,x=p.x+p.w/2-c,y=p.y+p.h/2,a=(p.attackFacing<0?Math.PI-p.aim:p.aim),spread=(1-s.prismCharge/180)*.18,colors=['#ff6666','#ffaa5b','#fff67a','#81ed9f','#80d5ff','#c599ff'];ctx.globalCompositeOperation='lighter';
  for(let i=0;i<6;i++){const an=a+(i-2.5)*spread;ctx.strokeStyle=colors[i];ctx.globalAlpha=.75;ctx.lineWidth=(2+s.prismCharge/42)*sc;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*22*sc,y+Math.sin(a)*22*sc);ctx.lineTo(x+Math.cos(an)*1200*sc,y+Math.sin(an)*1200*sc);ctx.stroke();}
  if(s.prismCharge>150){ctx.strokeStyle='#fff';ctx.lineWidth=4*sc;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*1200*sc,y+Math.sin(a)*1200*sc);ctx.stroke();}ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 }
 for(const m of s.minions||[]){for(let i=0;i<m.trail.length;i++){const t=m.trail[i];ctx.globalAlpha=i/m.trail.length*.28;r06Sprite(ctx,'terraprisma',t.x-c-14*sc,t.y-14*sc,28*sc,28*sc);}ctx.globalAlpha=1;ctx.save();ctx.translate(m.x-c,m.y);ctx.rotate(m.angle+Math.PI/4);r06Sprite(ctx,'terraprisma',-17*sc,-17*sc,34*sc,34*sc);ctx.restore();}
 if(s.kit==='summoner'&&s.whipAge>=0&&s.whipAge<28){const p=s.p,t=r06Target(s,500*sc),a=t?Math.atan2(t.y-p.y-p.h/2,t.x-p.x-p.w/2):p.attackFacing<0?Math.PI:0,len=Math.sin(s.whipAge/28*Math.PI)*240*sc;ctx.lineWidth=2*sc;ctx.strokeStyle='#e9b2dc';ctx.beginPath();const x=p.x+p.w/2-c,y=p.y+p.h/2;ctx.moveTo(x,y);for(let i=1;i<14;i++){const u=i/13,curve=Math.sin(u*Math.PI)*Math.sin(s.whipAge/28*Math.PI*2)*28*sc;ctx.lineTo(x+Math.cos(a)*len*u-Math.sin(a)*curve,y+Math.sin(a)*len*u+Math.cos(a)*curve);}ctx.stroke();}
 for(const f of s.r06FX){if(f.type==='cloud'){ctx.globalAlpha=(1-f.age/32)*.8;for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#d6e7f8':'#fff';ctx.fillRect(f.x-c-12+i*5+(i-2)*f.age*.15,f.y+Math.sin(i)*3+f.age*.35,9*sc,4*sc);}}}ctx.restore();
}
function r06DrawMount(s,c){if(!s.mounted)return;const p=s.p,im=r06Images.ufo,sc=s.r05Arena?1:.65,x=p.x+p.w/2-c,y=p.y+p.h-1;
 if(im){const h=im.height/8,f=Math.floor(s.ticks/6)%4;r06Sprite(ctx,'ufo',x-39*sc,y-12*sc,78*sc,h*sc,[0,f*h,im.width,h]);}
 else{ctx.save();ctx.strokeStyle='#9adddf';ctx.strokeRect(x-24*sc,y,48*sc,6*sc);ctx.restore();} // outlined missing-image marker, not fabricated UFO art
}
function r06NightBackground(s){const w=R06_VIEW.w,h=R06_VIEW.h;const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#080d25');grad.addColorStop(.58,'#182444');grad.addColorStop(1,'#293747');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 for(let i=0;i<155;i++){const x=((i*197.33+21-s.cam*.015)%w+w)%w,y=38+(i*i*27.18)%340;ctx.globalAlpha=.42+.36*Math.sin(s.ticks*.018+i);ctx.fillStyle=i%7?'#afb3d5':'#e4e3e2';ctx.fillRect(Math.floor(x),Math.floor(y),i%13?1:2,i%13?1:2);}ctx.globalAlpha=1;
 const mi=r06Images.moon;if(mi){const mh=Math.min(mi.width,mi.height);r06Sprite(ctx,'moon',w*.77-s.cam*.009,106,48,48,[0,0,mi.width,mh]);}
 const layers=[['forestFar',.022,.47],['forestHills',.05,.56],['forestNear',.1,.62]];let native=false;
 for(const [key,par,position] of layers){const im=r06Images[key];if(!im)continue;native=true;const ih=im.height,iw=im.width,scale=Math.min(1,240/ih),tilew=iw*scale;ctx.save();ctx.globalAlpha=.24;for(let x=-(s.cam*par)%tilew-tilew;x<w;x+=tilew)ctx.drawImage(im,x,h*position,tilew,ih*scale);ctx.restore();}
 if(r05LocalBackground){const im=r05LocalBackground,scale=420/im.height,ww=im.width*scale;for(let x=-(s.cam*.08)%ww-ww;x<w;x+=ww)ctx.drawImage(im,x,230,ww,420);}
 if(!native&&!r05LocalBackground){ctx.fillStyle='#111c2b';ctx.fillRect(0,h*.8,w,h*.2);}
}
function r06Torch(x,y,ticks){const glow=ctx.createRadialGradient(x,y-16,2,x,y-16,100);glow.addColorStop(0,'#ffce7624');glow.addColorStop(.35,'#f8a85212');glow.addColorStop(1,'#ffc56b00');ctx.fillStyle=glow;ctx.fillRect(x-100,y-116,200,200);
 if(!r06Sprite(ctx,'torch',x-5,y-23,10,23)){ctx.fillStyle='#865630';ctx.fillRect(x-1,y-15,3,14);ctx.fillStyle='#ffb64d';ctx.fillRect(x-2,y-21,5,7);ctx.fillStyle='#fff1b5';ctx.fillRect(x,y-21+Math.sin(ticks*.2+x),2,5);}
}
r05DrawWood=function(q,cam){const x=Math.round(q.x-cam),y=q.y,w=q.w;if(x>R06_VIEW.w||x+w<0)return;const im=r06Images.platform;if(im){for(let dx=Math.max(0,Math.floor(-x/16)*16);dx<w&&x+dx<R06_VIEW.w;dx+=16)r06Sprite(ctx,'platform',x+dx,y,16,8,[18,0,16,8]);return;}
 ctx.fillStyle='#39261b';ctx.fillRect(x,y,w,6);ctx.fillStyle='#b88b58';ctx.fillRect(x,y,w,2);ctx.fillStyle='#7b5435';ctx.fillRect(x,y+2,w,3);for(let a=0;a<w;a+=16){ctx.fillStyle='#443024';ctx.fillRect(x+a+15,y,1,5);ctx.fillStyle='#d5a776';ctx.fillRect(x+a+2,y,8,1);}};
const r06OldTree=drawChopTree;
drawChopTree=function(t,c){if(!r06Images.treeTop||!r06Images.treeTrunk){r06OldTree(t,c);return;}const x=t.x-c;if(x<-70||x>W+70)return;ctx.save();ctx.translate(Math.round(x),t.y);if(t.hp<=0&&t.fall>=42){r06Sprite(ctx,'treeTrunk',-5,-5,10,5,[0,0,16,8]);ctx.restore();return;}
 if(t.shake)ctx.rotate(Math.sin(t.shake*1.7)*.05);if(t.fall){ctx.rotate(t.fallDir*(t.fall/42)**2*1.42);ctx.globalAlpha=Math.max(0,1-t.fall/53);}
 for(let y=-t.h+6;y<0;y+=10)r06Sprite(ctx,'treeTrunk',-5,y,10,10,[0,0,16,16]);const im=r06Images.treeTop,fw=im.width>=240?Math.floor(im.width/3):Math.min(80,im.width),fh=Math.min(80,im.height);r06Sprite(ctx,'treeTop',-27,-t.h-20,54,54*fh/fw,[0,0,fw,fh]);ctx.restore();};
function r06DrawArena(){const s=state,p=s.p,c=s.cam,yc=s.camY||-100;r05Viewport(true);ctx.clearRect(0,0,R06_VIEW.w,R06_VIEW.h);r06NightBackground(s);ctx.save();ctx.translate(0,-yc);
 for(const q of s.level.surfaces){if(!q.oneWay)continue;r05DrawWood(q,c);if(q.id==='wood-sky-full')for(let x=48;x<3072;x+=160)if(x-c>-110&&x-c<R06_VIEW.w+110)r06Torch(x-c,q.y,s.ticks);}
 for(const q of s.built)r05DrawWood(q,c);
 ctx.save();ctx.translate(Math.round(40-c),464);sprite('pipe_top',0,0);sprite('pipe_body',0,16);ctx.restore();
 const q=s.arenaReward;if(q)sprite(q.used?'block_used':'question'+[0,0,1,2,1,0][Math.floor(s.ticks/8)%6],q.x-c,q.y-(q.bump?Math.sin(q.bump/12*Math.PI)*4:0));
 if(s.phase==='preparation'){sheet(ctx,'suspiciousEye',[0,0,30,20],161-c,466+Math.sin(s.ticks*.055)*2,30,20);r05Text('L 召唤',176-c,452,12,'#d9c6ae','center');}
 for(const d of s.r06Drops)r06Sprite(ctx,'cloudBottle',d.x-c,d.y,d.w,d.h);
 if(s.eye&&!s.eye.dead&&['charge','fastDash'].includes(s.eye.mode)){const e=s.eye;for(let i=0;i<e.trail.length;i+=3){ctx.save();ctx.globalAlpha=i/e.trail.length*.2;const f={...e,...e.trail[i],flash:0};r05DrawEye(f,c);ctx.restore();}}
 for(const m of s.servants)r05DrawServant(m,c);r05DrawEye(s.eye,c);
 r06DrawProjectiles(s,c);r06DrawMount(s,c);
 if(!(p.invuln&&Math.floor(s.ticks/4)%2))r06DrawBody(ctx,p.x+p.w/2-c,p.y+p.h,p.attack?p.attackFacing:p.facing,p.grounded&&Math.abs(p.vx)>.1?p.walk:0,!p.grounded,p.attack,s.tool,1,r06Armor(s),r06Weapon(s),1);
 ctx.fillStyle='#493b35';ctx.fillRect(0,496,R06_VIEW.w,200);ctx.fillStyle='#637044';ctx.fillRect(0,496,R06_VIEW.w,3);ctx.fillStyle='#6c5543';for(let x=-(Math.floor(c)%32);x<R06_VIEW.w;x+=32){ctx.fillRect(x+3,509,16,3);ctx.fillRect(x+17,525,10,3);}ctx.fillStyle='#211f27';ctx.fillRect(0,565,R06_VIEW.w,200);
 if(s.tool!==0&&r05Builder?.cursor){const t=r05Builder.cursor,reason=s.tool===1?r05Builder.reasonAt(t.x,t.y,p):r05Builder.platforms.has(t.x+','+t.y)?null:'protected';ctx.strokeStyle=reason?'#ed927d':'#d8ef9e';ctx.lineWidth=1;ctx.strokeRect(t.x-c+.5,t.y+.5,15,15);if(!reason&&s.tool===1){ctx.globalAlpha=.5;r05DrawWood({x:t.x,y:t.y,w:16},c);ctx.globalAlpha=1;}}
 if(s.eye&&!s.eye.dead&&s.tool===0){const e=s.eye;ctx.strokeStyle='#cabb8180';ctx.lineWidth=1;for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.arc(e.x-c,e.y,59,a+.15,a+.43);ctx.stroke();}}
 for(const n of s.numbers){ctx.save();ctx.globalAlpha=Math.min(1,n.life/12);r05Text(n.text,n.x-c,n.y,16,n.color,'center');ctx.restore();}ctx.restore();r06HUD(s);trioUI();
}
function r06HUD(s){const w=R06_VIEW.w,h=R06_VIEW.h,k=r06Kit(s);ctx.fillStyle='#0a102ade';ctx.fillRect(0,0,w,74);r05Text('TERRARIA  /  WORLD 1-3',18,12,17,'#ebe4c9');r05Text('R06 · '+(s.phase==='battle'?'专家行为重建 · 自动追踪克眼':s.phase==='cleared'?'隐藏挑战完成':'先准备，再召唤'),18,40,12,'#b5c5d5');
 for(let i=0;i<3;i++){const x=404+i*57;ctx.fillStyle=i===s.tool?'#4e5649':'#192843';ctx.fillRect(x,8,49,49);ctx.strokeStyle=i===s.tool?'#ece0a2':'#5f6d8a';ctx.strokeRect(x+.5,8.5,48,48);r06Icon(ctx,i===0?r06Weapon(s):i===1?'wood':'axe',x+25,31,30);r05Text(String(i+1),x+4,10,10,'#c3cee0');if(i===1)r05Text(String(s.wood),x+44,43,10,'#fff4be','right');}
 r05Text(k?k.armorName:'铂金套 · 防御 20',605,13,13,k?.color||'#c6cedc');r05Text((s.cloudJump?'云朵瓶 ✓':'云朵瓶：问号砖')+'  ·  '+(s.mountOwned?(s.mounted?'UFO 骑乘中':'F 骑乘 UFO'):'无坐骑'),605,38,11,'#adbed0');
 r05Text('生命 '+s.hp+' / '+s.maxHp,w-20,9,14,'#f0cbc7','right');for(let i=0;i<10;i++){ctx.globalAlpha=s.hp>s.maxHp/10*i?1:.22;const im=photos.heart;if(im)ctx.drawImage(im,w-192+i*17,32,15,15);}ctx.globalAlpha=1;
 if(s.kit==='mage'){ctx.fillStyle='#244272';ctx.fillRect(w-190,55,170,4);ctx.fillStyle='#859ced';ctx.fillRect(w-190,55,170*s.mana/s.maxMana,4);r05Text('魔力 '+s.mana+' · 药水 '+s.manaPotions,w-202,52,10,'#aabdf1','right');}else if(s.kit==='ranger')r05Text('叶绿弹 '+s.ammo,w-20,54,10,'#b0dba1','right');
 ctx.fillStyle='#080f23e8';ctx.fillRect(0,h-27,w,27);r05Text('方向移动   空格跳 / 二段跳   ↓＋跳下穿   J 使用   1/2/3 工具   E 切换',16,h-21,11,'#b5c6d5');r05Text('H 治疗   F 坐骑   R 重试   持武器 ↓＋L 返回',w-17,h-21,11,'#b5c6d5','right');
 if(s.phase==='battle'&&s.eye&&!s.eye.dead){const e=s.eye,x=w/2-230,y=h-70;ctx.fillStyle='#10152be8';ctx.fillRect(x,y,460,31);ctx.strokeStyle='#6e5651';ctx.strokeRect(x+.5,y+.5,459,30);ctx.fillStyle='#42292f';ctx.fillRect(x+6,y+20,448,5);ctx.fillStyle=e.phase===2?'#d67768':'#b66866';ctx.fillRect(x+6,y+20,448*e.hp/e.maxHp,5);r05Text('克苏鲁之眼'+(e.mode==='transform'?' · 旋转变形':e.phase===2?' · 第二阶段':''),x+9,y+3,11,'#e6c6ad');r05Text(e.hp+' / '+e.maxHp,x+450,y+3,11,'#e6c6ad','right');}
 if(s.phase==='preparation'&&s.noticeTime){r05Text('先顶入口问号砖取得云朵瓶；顶部贯通平台可用二段跳登上。',w/2,94,14,'#cfdae2','center');r05Text('按 L 主动召唤 · 原版自然预警请按 T · 建造按 2 后按住 J',w/2,119,12,'#9eafc4','center');}
 if(s.phase==='cleared'&&s.kit)r05Text(k.name+'毕业装备已取得 · F 骑乘 · 持武器 ↓＋L 带回 1-3',w/2,101,15,'#e7d6ae','center');
 const messages=s.r06Chats.slice(-3);for(let i=0;i<messages.length;i++){const m=messages[i];ctx.save();ctx.globalAlpha=Math.min(1,m.life/80);r05Text(m.text,22,h-143+i*22,13,m.color);ctx.restore();}
 if(s.phase==='battle'&&s.eye&&!s.eye.dead){const e=s.eye,ex=e.x-s.cam,ey=e.y-(s.camY||0);if(ex<0||ex>w||ey<76||ey>h-30){const x=clamp(ex,24,w-24),y=clamp(ey,88,h-100);r05Text('◆ 克眼',x,y,12,'#e7aaaa',ex>w?'right':'left');}}
}
const r06OldEquipment=drawEquipment;
drawEquipment=function(s){r06OldEquipment(s);ctx.fillStyle='#273653';ctx.fillRect(10,38,17,17);r06Icon(ctx,r06Weapon(s),19,46,16);if(s.cloudJump)r06Icon(ctx,'cloudBottle',84,46,15);ctx.save();ctx.font='6px sans-serif';ctx.fillStyle='#edf4fa';ctx.fillText(s.kit?r06Kit(s).name:'铂金 / 星怒',8,65);if(s.mountOwned)ctx.fillText(s.mounted?'UFO 骑乘中':'F: UFO',8,74);ctx.restore();};
function r06UpdateUI(){if(!isTrio()){r06SceneActions.hidden=true;r06Media.hidden=true;return;}const s=state;r06SceneActions.hidden=!s||mode==='menu';r06Media.hidden=mode==='menu';r05AudioOptions.hidden=true;
 if(!s)return;const k=r06Kit(s),armor=r06Armor(s),missing=['Head','Body','Legs'].some(part=>!r06Images[armor+part]);
 $('heroStatus').textContent=(k?k.armorName:'铂金套')+' · '+(tools[s.tool]||'星怒')+' · 防御 '+r06Defense(s)+(missing?'（套装原图加载中，暂保留铂金外观）':'');
 $('bestLabel').textContent='R06';$('distanceLabel').textContent=s.r05Arena?'EYE / EXPERT':'WORLD 1-3';$('actionLabel').textContent='J 使用 · 自动追踪克眼';$('jumpLabel').textContent=s.cloudJump?'空格跳 / 二段跳；↓＋跳下穿':'空格跳；问号砖解锁二段跳';$('downLabel').textContent='1/2/3 工具 · F 坐骑 · H 治疗';$('relayMessage').textContent=s.noticeTime?s.notice:'R06：星怒 / 铂金套开局；克眼胜利四职业选一套。';
 $('heroHelp').textContent='J 自动瞄准当前 Boss；星怒召唤的星星落向锁定点。问号砖给云朵瓶。击败克眼后选择一套职业毕业装备和 UFO。F 骑乘，H 治疗。原图通过固定版本 GitHub 读取；开始装备与克眼已内嵌。';
 const count=Object.values(r06AssetStatus).filter(a=>a.state==='ready').length,failed=Object.values(r06AssetStatus).filter(a=>a.state==='unavailable').length;
 $('r06AssetReport').textContent='原图已加载 '+count+' / '+Object.keys(r06AssetStatus).length+(failed?'；'+failed+' 项网络不可用。':'')+' 吼声'+(r06RoarAudio?'已本地导入。':'尚未内嵌，可本地导入。');
 const m=r06MusicKey?r06Music[r06MusicKey]:null,label=m?m.label+' · '+({playing:'播放中',ready:'就绪',loading:'加载中','network-unavailable':'网络不可用','waiting-user-or-network':'等待网络或点击启用声音'}[m.state]||m.state):'未播放';$('r06MusicStatus').textContent='BGM：'+label;$('audioStatus').textContent='原曲分场景切换：'+label+'；联网素材 '+count+'/'+Object.keys(r06AssetStatus).length;$('audioBadge').textContent=m?.state==='playing'?'ORIGINAL BGM':'联网原曲';
 for(const id of ['r06Summon','r06Natural','r06Retry','r06Return'])$(id).hidden=!s.r05Arena;$('r06Summon').disabled=s.phase!=='preparation';$('r06Natural').disabled=s.phase!=='preparation'||!!s.r06Natural;$('r06Mount').disabled=!s.mountOwned;$('r06Mount').textContent=s.mounted?'F · 下坐骑':'F · 骑乘 UFO';
 const vl=document.querySelector('.screen-top span:last-child');if(s.r05Arena&&vl)vl.textContent='1280 × 720 · 60 HZ';
}
const r06OldMainStep=r04MainStep;
r04MainStep=function(v){if(r06RewardsOpen)return;const s=state;if(!s){r06OldMainStep(v);return;}const dbl=mode==='playing'&&r06DoubleJump(s,v,false);r06OldMainStep(dbl?{...v,jumpEdge:false,jump:true}:v);if(state===s&&mode==='playing')r06TickFX(s);};
render=function(){if(state?.r05Arena){r06DrawArena();return;}r05Viewport(false);r04MainRender();};
const r06OldMenu=showCharacters;
showCharacters=function(){r06CloseRewards();r06StopMusic();const r=r06OldMenu.apply(this,arguments);r06SceneActions.hidden=true;r06Media.hidden=true;return r;};
function r06DigitTool(n){if(!state||mode!=='playing')return;if(state.r05Arena){r05SelectTool(n);return;}state.tool=n;state.p.attack=0;state.p.cooldown=0;state.toolCooldown=0;state.target={x:Math.floor((state.p.x+8)/16)*16,y:Math.round((state.p.y+state.p.h)/16)*16};state.aiming=false;state.buildMode='auto';state.buildGroundRow=state.target.y;r06SyncKitTools();note(tools[n]);}
window.addEventListener('keydown',e=>{if(!isTrio()||e.target?.closest?.('input,textarea,select,[contenteditable="true"]')||e.ctrlKey||e.metaKey||e.altKey)return;
 if(r06RewardsOpen){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;const buttons=[...r06RewardBox.querySelectorAll('[data-kit]')],i=Math.max(0,buttons.indexOf(document.activeElement));if(/^Digit[1-4]$/.test(e.code))r06ChooseKit(R06_KITS[Number(e.code.slice(-1))-1].id);else if(e.code==='Enter'||e.code==='Space')buttons[i]?.click();else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab'].includes(e.code)){const direction=['ArrowLeft','ArrowUp'].includes(e.code)||(e.code==='Tab'&&e.shiftKey)?-1:1;buttons[(i+direction+buttons.length)%buttons.length]?.focus();}return;}
 if(!state||mode!=='playing'||e.repeat)return;
 if(['Digit1','Digit2','Digit3','KeyF','KeyH','KeyT'].includes(e.code)){e.preventDefault();if(e.code.startsWith('Digit'))r06DigitTool(Number(e.code.slice(-1))-1);if(e.code==='KeyF')r06ToggleMount();if(e.code==='KeyH')r06Heal();if(e.code==='KeyT')r06NaturalArrival();}
},true);

function trioUI(){r04TrioUI();r05UI();r06UpdateUI();}

/* R07: complete arena lanes, contact-based equipment drops, vanilla Slime mount.
 * Scope: Sandbox Trio / Terraria only. Episode-two objects and maps are not modified.
 * Mount reference: Terraria 1.4.0.5 Mount.cs ID 3; physics are converted to this engine.
 */
const R07_VERSION='R08 · 四层战场 / 落地换装 / 史莱姆坐骑';
const R07_ARENA=Object.freeze({width:3072,floor:496,rows:[304,208,112,16],torchStep:160,campfireStep:640});
const R07_SLIME=Object.freeze({runSpeed:4,acceleration:.18,jumpSpeed:8.25,jumpHold:12,verticalScale:2,gravity:.44,maxFall:10,stompDamage:40,frames:4,frameDelay:12});
const r07Clone=v=>JSON.parse(JSON.stringify(v));
const r07Slime=s=>!!(s?.mounted&&s.mountType==='slime');
const r07UFO=s=>!!(s?.mounted&&s.mountType==='ufo');
const r07Scale=s=>s.r05Arena?1:.75;
const r07MountName=s=>s?.mountType==='slime'?'史莱姆':'UFO';
const R07_COPY_FIELDS=['slimeOwned','ufoOwned','mountType','kitSupplies','r07LootSave'];
function r07Init(s,base=null){
 for(const [k,v] of Object.entries({slimeOwned:false,ufoOwned:false,mountType:null,kitSupplies:{},r07LootSave:null}))s[k]=base?.[k]!==undefined?r07Clone(base[k]):v;
 s.r07=true;s.mountOwned=!!(s.slimeOwned||s.ufoOwned);s.mounted=false;s.r07Loot=[];s.r07LootSpawned=false;s.lootCooldown=0;s.r07Regen=0;s.campfireBuff=false;s.r07CamY=0;
 s.p.slimeHold=0;s.p.slimeFrame=0;s.p.slimeTicks=0;s.p.slimeBounce=0;s.p.r07MountHeight=false;
 s.notice='星怒 / 铂金套开局；外部问号砖掉落粘鞍。碰到拾取，F 骑乘史莱姆。';s.noticeTime=380;
}
const r07NewStateBase=newState;
newState=function(){const s=r07NewStateBase();r07Init(s);return s;};
const r07CopyBase=r06CopyLoadout;
r06CopyLoadout=function(from,to){r07CopyBase(from,to);for(const k of R07_COPY_FIELDS)if(from[k]!==undefined)to[k]=r07Clone(from[k]);to.mountOwned=!!(to.slimeOwned||to.ufoOwned);};
r05Terrain=function(){return [{id:'arena-floor',type:'floor',x:0,y:R07_ARENA.floor,w:R07_ARENA.width,h:96,solid:true},...R07_ARENA.rows.map((y,i)=>({id:'r07-lane-'+i,type:'wood-platform',x:0,y,w:R07_ARENA.width,h:6,oneWay:true,permanent:true}))];};
const r07EnterBase=enterTerraSecret;
enterTerraSecret=function(restart=false,direct=false){
 if(!restart&&state?.mounted){state.mounted=false;r07SetMountHeight(state,false);}const ok=r07EnterBase(restart,direct);if(!ok)return ok;const s=state;r07Init(s,mainState);
 // This room is supplied in full. Construction and recovery cannot consume time or materials.
 s.built=[];s.tool=0;s.targetReason=null;if(r05Builder)r05Builder.platforms.clear();s.buildHeld=false;
 s.camY=-96;s.arenaReward.y=360;s.arenaReward.used=!!s.cloudJump;
 s.lamps=[];s.campfires=[];
 for(const [i,y] of R07_ARENA.rows.entries()){
  for(let x=48;x<R07_ARENA.width;x+=R07_ARENA.torchStep)s.lamps.push({x,y,phase:(x+i*13)%8});
  for(let x=368+(i%2)*160;x<R07_ARENA.width-48;x+=R07_ARENA.campfireStep)s.campfires.push({x,y,phase:(x+i*19)%8});
 }
 // One campfire near the entrance; no collision box or obstruction to running.
 s.campfires.push({x:112,y:496,phase:0});s.lamps=s.lamps.filter(t=>!s.campfires.some(f=>f.y===t.y&&Math.abs(f.x-t.x)<48));
 s.notice=s.bossClear?'克眼已击败：触碰地上的装备换套装，随时可换。':'四层木台均已贯通；无需搭建。空格逐层上跳，↓＋空格下穿；L 召唤克眼。';s.noticeTime=400;
 if(s.bossClear){if(mainState.r07LootSave){s.r07Loot=r07Clone(mainState.r07LootSave);s.r07LootSpawned=true;}else r07SpawnLoot(s);}
 r06UpdateUI();return true;
};
const r07PersistBase=r05Persist;
r05Persist=function(){if(state?.r05Arena){state.r07LootSave=state.r07LootSpawned?r07Clone(state.r07Loot):null;}r07PersistBase();};
// Leave empty-handed is allowed. The untouched equipment stays in the room.
exitSecret=function(){
 if(!state?.r05Arena)return r06OldExit();
 r05Persist();r06CloseRewards();state.rewardPending=false;
 const ok=r06OldExit();if(state&&!state.r05Arena){state.mounted=false;state.p.h=32;state.p.y=176;state.p.r07MountHeight=false;state.minions=[];if(state.kit==='summoner')r06CreateMinions(state);}
 r06SyncKitTools();r06SyncMusic();return ok;
};
r05Build=function(){if(state?.r05Arena){state.tool=0;state.buildHeld=false;state.targetReason=null;}};
const r07SelectBase=r05SelectTool;
r05SelectTool=function(tool){if(state?.r05Arena){state.tool=0;state.p.attack=0;state.buildHeld=false;r05CancelPointer();r06SyncKitTools();if(tool!==0)note('战场四层平台已铺满，不需要施工。J 攻击，↓＋空格下穿。');return;}r07SelectBase(tool);};
// Original R06 dialog is retired. Victory never pauses movement or auto-picks a class.
r06RewardBox.hidden=true;r06RewardBox.setAttribute('aria-hidden','true');
r06OpenRewards=function(){if(!state?.bossClear)return false;r07SpawnLoot(state);r06CloseRewards();return true;};
r06ChooseKit=function(){return false;};
function r07SpawnLoot(s){
 if(s.r07LootSpawned)return;s.r07LootSpawned=true;s.rewardPending=false;r06CloseRewards();
 const c=clamp(s.p.x+s.p.w/2,410,R07_ARENA.width-410);
 s.r07Loot=R06_KITS.map((k,i)=>({kit:k.id,x:c+(i-1.5)*184,y:Math.min(360,s.eye?.y??340),w:34,h:34,vy:-2-i*.25,age:0,grounded:false,blocked:false}));
 s.lootCooldown=50;r06Chat('四套装备已掉落到地面：触碰即换装，其他套装保留。','#e9d393');note('向下穿到地面，自由选择战士 / 射手 / 法师 / 召唤师；碰到就穿上。');evt('r07-loot-spawn',{classes:s.r07Loot.map(d=>d.kit)});
}
function r07BankKit(s){if(!s.kit)return;s.kitSupplies[s.kit]={ammo:s.ammo,mana:s.mana,manaPotions:s.manaPotions,shield:s.shield,shieldTicks:s.shieldTicks};}
function r07EquipDrop(s,d){
 const k=R06_KITS.find(k=>k.id===d.kit);if(!k||s.lootCooldown>0||d.blocked||d.age<45||!d.grounded||s.kit===k.id)return false;
 const old=s.kit;r07BankKit(s);const banked=s.kitSupplies[k.id];s.kit=k.id;s.ufoOwned=true;s.mountOwned=true;s.mountType='ufo';s.mounted=false;r07SetMountHeight(s,false);
 s.maxMana=k.mana;s.mana=banked?Math.min(k.mana,banked.mana):k.mana;s.ammo=banked?.ammo??(k.id==='ranger'?9999:0);s.manaPotions=banked?.manaPotions??(k.id==='mage'?100:0);
 s.shield=banked?.shield??3;s.shieldTicks=banked?.shieldTicks??0;if(!banked)s.healPotions=Math.max(s.healPotions,10);s.tool=0;s.p.attack=0;s.p.cooldown=0;s.projectiles=[];s.minions=[];s.prismCharge=0;s.whipAge=28;s.lootCooldown=24;
 // Swap back onto the same physical spot. It cannot be re-collected until stepped away.
 if(old){d.kit=old;d.age=45;d.blocked=true;d.vy=0;d.grounded=true;}else{s.r07Loot=s.r07Loot.filter(q=>q!==d);}
 if(k.id==='summoner')r06CreateMinions(s);r06SyncKitTools();r05Persist();
 r06Chat('已穿上'+k.armorName+'，装备'+k.weaponName+'。','#e5dcac');note('已换装：'+k.name+'。原套装放回地面，可走开再碰回去。F 骑乘；V 切换已拥有的坐骑。');evt('r07-contact-equip',{kit:k.id,previous:old});return true;
}
function r07LootStep(s){
 if(s.lootCooldown>0)s.lootCooldown--;
 for(const d of [...s.r07Loot]){
  d.age++;if(!d.grounded){d.vy=Math.min(8,d.vy+.24);d.y+=d.vy;if(d.y+d.h>=R07_ARENA.floor){d.y=R07_ARENA.floor-d.h;d.vy=0;d.grounded=true;}}
  const box={x:d.x-17,y:d.y,w:34,h:d.h};
  if(d.blocked&&Math.abs(s.p.x+s.p.w/2-d.x)>58)d.blocked=false;
  if(near(s.p,box))r07EquipDrop(s,d);
 }
}
function r07CollectSaddle(s){if(s.slimeOwned)return;s.slimeOwned=true;s.mountOwned=true;if(!s.ufoOwned)s.mountType='slime';s.score+=1000;
 r06Chat('获得粘鞍！F 骑乘史莱姆：长按跳跃连跳，下落踩敌反弹。','#91c7f4');note('史莱姆坐骑已解锁 · F 上下骑；长按空格连续跳。');evt('r07-slimy-saddle-collected');terraSound('build',{volume:.6});}
updateDrops=function(ss){const s=state,p=s.p;for(const d of s.drops){if(d.done)continue;d.kind='slimySaddle';d.w=22;d.h=17;d.age++;
 if(d.age<24)d.y-=.65;else{const foot=d.y+d.h;d.vy=Math.min(5,d.vy+.22);d.y+=d.vy;for(const q of ss)if(d.x+d.w>q.x&&d.x<q.x+q.w&&foot<=q.y+1&&d.y+d.h>=q.y&&d.vy>=0){d.y=q.y-d.h;d.vy=0;break;}}
 if(d.age>10&&near(p,d)){d.done=true;r07CollectSaddle(s);}}
};
function r07SetMountHeight(s,on){const p=s.p,base=s.r05Arena?42:32,boost=s.r05Arena?20:15,target=base+(on?boost:0);if(p.h!==target){p.y-=target-p.h;p.h=target;}p.r07MountHeight=on;}
r06ToggleMount=function(){const s=state;if(!s||mode!=='playing')return;
 if(!s.slimeOwned&&!s.ufoOwned){note('外部问号砖掉落粘鞍；触碰拾取后按 F 骑乘史莱姆。');return;}
 if(!s.mountType)s.mountType=s.slimeOwned?'slime':'ufo';if(!s.mounted&&s.mountType==='slime'){const targetH=s.r05Arena?62:47,candidate={...s.p,y:s.p.y+s.p.h-targetH,h:targetH},ss=s.r05Arena?s.level.surfaces:solids();if(ss.some(q=>q.solid&&near(candidate,q))){note('头顶空间不足，移动到开阔位置再骑乘。');return;}}s.mounted=!s.mounted;
 r07SetMountHeight(s,s.mounted&&s.mountType==='slime');s.p.slimeHold=0;s.p.slimeTicks=0;s.p.attack=0;
 // Mounting preserves falling/running momentum. Do not reset vy or invent hovering for slime.
 if(s.mountType==='ufo'){s.p.vy=0;s.p.grounded=false;s.p.support=null;}
 note(s.mounted?(s.mountType==='slime'?'史莱姆：长按空格连续高跳，下落踩敌弹起；F 下骑。':'UFO：方向飞行，空格上升；F 下骑。'):'已下坐骑');evt('r07-mount',{mounted:s.mounted,mount:s.mountType});
};
function r07CycleMount(){const s=state;if(!s||mode!=='playing'||!s.slimeOwned||!s.ufoOwned)return;const mounted=s.mounted;
 s.mounted=false;r07SetMountHeight(s,false);s.mountType=s.mountType==='slime'?'ufo':'slime';if(mounted)r06ToggleMount();else note('当前坐骑：'+r07MountName(s)+'；F 骑乘。');}
window.addEventListener('keydown',e=>{if(isTrio()&&state&&mode==='playing'&&!e.repeat&&e.code==='KeyV'&&!['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)){e.preventDefault();r07CycleMount();}},true);
function r07SlimePhysics(s,v,ss,arena){
 const p=s.p,sc=r07Scale(s);if(arena)for(const k of ['invuln','hurtLock','cooldown','drop'])if(p[k]>0)p[k]--;
 const support=ss.find(q=>q.id===p.support),oldFeet=p.y+p.h,oldY=p.y;
 if(p.slimeBounce>0)p.slimeBounce--;
 if(v.y>0&&v.jumpEdge&&support&&!support.solid){p.drop=18;p.dropRow=support.y;p.y+=2;p.vy=2*sc;p.grounded=false;p.support=null;p.slimeHold=0;p.coyote=0;}
 else if((v.jump||v.jumpEdge)&&p.grounded&&p.drop===0&&!p.hurtLock){p.vy=-R07_SLIME.jumpSpeed*2*sc;p.slimeHold=R07_SLIME.jumpHold;p.grounded=false;p.support=null;p.coyote=0;p.buffer=0;evt('r07-slime-jump');}
 else if(v.jumpEdge&&!p.grounded&&p.cloudAvailable&&s.cloudJump&&p.drop===0){p.vy=-R07_SLIME.jumpSpeed*2*sc;p.slimeHold=R07_SLIME.jumpHold;p.cloudAvailable=false;evt('r07-slime-cloud-jump');}
 const move=s.tool!==0&&v.auxiliary?0:v.x;
 if(!p.hurtLock){p.vx=approach(p.vx,move*R07_SLIME.runSpeed*sc,(move?R07_SLIME.acceleration:.18)*sc);if(move&&!p.attack)p.facing=Math.sign(move);}
 p.x=clamp(p.x+p.vx,arena?8:(s.tool===0?s.cam:0),s.level.width-p.w-(arena?8:0));
 for(const q of ss)if(q.solid&&near(p,q)){if(p.vx>0)p.x=q.x-p.w;else if(p.vx<0)p.x=q.x+q.w;p.vx=0;}
 if(v.jump&&p.slimeHold>0&&p.vy<0){p.vy=-R07_SLIME.jumpSpeed*2*sc;p.slimeHold--;}
 else {p.slimeHold=0;p.vy=Math.min(R07_SLIME.maxFall*2*sc,p.vy+R07_SLIME.gravity*2*sc);}
 p.y+=p.vy;p.grounded=false;p.support=null;let land=null;
 for(const q of ss){if(p.x+p.w<=q.x||p.x>=q.x+q.w)continue;if(p.drop&&!q.solid&&q.y<=p.dropRow+8)continue;
  if(p.vy>=0&&oldFeet<=q.y+1&&p.y+p.h>=q.y){if(!land||q.y<land.y)land=q;}
  else if(q.solid&&p.vy<0&&oldY>=q.y+q.h-1&&p.y<q.y+q.h){p.y=q.y+q.h;p.vy=0;p.slimeHold=0;if(q.type==='reward'&&!q.used){q.used=true;q.bump=12;if(arena){s.r06Drops.push({x:q.x,y:q.y-28,w:20,h:26,age:0,vy:-2});evt('arena-question-bump');}else{s.drops.push({x:q.x+1,y:q.y-2,w:22,h:17,vy:-1,age:0,done:false,kind:'slimySaddle'});evt('reward-bump');}sourceSound('bump');}}
 }
 if(land){p.y=land.y-p.h;p.vy=0;p.grounded=true;p.support=land.id;p.cloudAvailable=!!s.cloudJump;p.coyote=6;s.buildGroundRow=land.y;
  if(!arena&&p.x>700&&p.x>s.checkpoint.x+240&&land.type==='tree'&&p.x>land.x+4&&p.x<land.x+land.w-22)s.checkpoint={x:p.x,y:land.y-32};}
 p.walk+=Math.abs(p.vx)*.8;p.slimeTicks++;p.slimeFrame=p.grounded?(Math.abs(p.vx)>.1?Math.floor(p.slimeTicks/12)%4:0):1;p.slimeOldFeet=oldFeet;
 if(arena&&p.y>580){p.x=154;p.y=496-p.h;p.vy=0;p.grounded=true;p.support='arena-floor';}
}
function r07Stomp(s){
 if(!r07Slime(s)||s.p.slimeBounce>0||s.p.vy<=0)return false;const p=s.p,sc=r07Scale(s),feet=p.y+p.h,previous=p.slimeOldFeet??feet-p.vy;
 const targets=r06AllTargets(s);for(const t of targets){const top=t.y-t.h/2;if(previous<=top+8*sc&&feet>=top&&Math.abs(p.x+p.w/2-t.x)<p.w/2+t.w/2){
  r06DamageTarget(t,R07_SLIME.stompDamage,'slime-stomp');p.y=top-p.h;p.vy=-R07_SLIME.jumpSpeed*2*sc;p.slimeHold=0;p.slimeBounce=10;p.invuln=Math.max(p.invuln,6);p.grounded=false;p.support=null;evt('r07-slime-stomp',{target:t.id,damage:40});return true;}}
 return false;
}
const r07HurtBase=hurt;
hurt=function(e){if(r07Slime(state)&&r07Stomp(state))return;r07HurtBase(e);};
const r07EnemiesBase=updateEnemies;
updateEnemies=function(ss){r07Stomp(state);r07EnemiesBase(ss);};
const r07PhysicsBase=r05Physics;
r05Physics=function(v){const s=state;if(r07Slime(s)){
 r07SlimePhysics(s,v,s.level.surfaces.concat(s.built),true);
 // Cloud bottle remains an accessory from the arena's own question block.
 const q=s.arenaReward;for(const d of s.r06Drops){d.age++;const foot=d.y+d.h;d.vy=Math.min(5,d.vy+.25);d.y+=d.vy;for(const t of s.level.surfaces)if(d.x+d.w>t.x&&d.x<t.x+t.w&&foot<=t.y+1&&d.y+d.h>=t.y&&d.vy>=0){d.y=t.y-d.h;d.vy=0;break;}if(d.age>12&&near(s.p,d)){d.done=true;r06CollectCloud(s);}}s.r06Drops=s.r06Drops.filter(d=>!d.done);if(q?.bump)q.bump--;
 }else r07PhysicsBase(v);
 r07Stomp(s);const p=s.p;s.cam=approach(s.cam,clamp(p.x+p.w/2-R06_VIEW.w*.44,0,R07_ARENA.width-R06_VIEW.w),Math.abs(p.vx)+4);
 const target=clamp(p.y+p.h/2-R06_VIEW.h*.54,-540,-80);s.camY=approach(s.camY||-96,target,Math.max(3,Math.abs(p.vy)*.85));r05SyncPointer();
};
const r07ArenaStepBase=r05ArenaStep;
r05ArenaStep=function(v){if(!state||mode!=='playing')return;const s=state;
 r07ArenaStepBase({...v,toolEdge:false});if(state!==s||mode!=='playing')return;
 if(s.phase==='cleared')r07LootStep(s);
 const p=s.p;s.campfireBuff=s.campfires.some(f=>Math.abs(p.x+p.w/2-f.x)<400&&Math.abs(p.y+p.h/2-f.y)<240);
 if(s.campfireBuff&&s.hp<s.maxHp&&p.invuln===0){if(++s.r07Regen>=120){s.hp=Math.min(s.maxHp,s.hp+1);s.r07Regen=0;}}else s.r07Regen=0;
};
const r07MainStepBase=r04MainStep;
r04MainStep=function(v){const s=state;r07MainStepBase(v);if(state===s&&s&&!s.r05Arena){const want=Math.min(0,s.p.y-68);s.r07CamY=approach(s.r07CamY||0,want,Math.max(2,Math.abs(s.p.vy)));}};
const r07StartFlagBase=startFlag;
startFlag=function(){const s=state;if(s){s.mounted=false;r07SetMountHeight(s,false);s.r07CamY=0;}r07StartFlagBase();};
// Native 58x48 four-frame Slime sheet. The player sits above it; no rubber stretching.
const r07DrawMountBase=r06DrawMount;
r06DrawMount=function(s,c){if(!r07Slime(s)){r07DrawMountBase(s,c);return;}const p=s.p,sc=r07Scale(s),f=p.slimeFrame||0,im=r06Images.slimeMount;if(!im)return;
 const y=p.y+p.h;ctx.save();ctx.translate(Math.round(p.x+p.w/2-c),Math.round(y));ctx.scale(p.facing*sc,sc);ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,f*48,58,48,-29,-46,58,48);ctx.restore();};
const r07BodyBase=r06DrawBody;
r06DrawBody=function(g,x,foot,face,walk=0,air=false,attack=0,tool=0,opacity=1,armor='platinum',weapon='starfury',scale=.75){const s=state;if(r07Slime(s)){const f=s.p.slimeFrame||0;foot-=(20+[0,2,0,-2][f])*scale;walk=0;air=true;}r07BodyBase(g,x,foot,face,walk,air,attack,tool,opacity,armor,weapon,scale);};
// Placed furniture is cut from Tiles_4 / Tiles_215, NOT stretched inventory pictures.
function r07Furniture(kind,x,y,ticks,phase=0){
 const fire=kind==='campfire',im=r06Images[fire?'campfireTiles':'torchTiles'];
 const radius=fire?128:104,cx=x,cy=y-(fire?20:14);
 const glow=ctx.createRadialGradient(cx,cy,2,cx,cy,radius);glow.addColorStop(0,fire?'rgba(255,184,90,.18)':'rgba(255,200,128,.12)');glow.addColorStop(.55,'rgba(245,164,75,.045)');glow.addColorStop(1,'rgba(230,150,70,0)');ctx.fillStyle=glow;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);
 if(im){if(fire){const frame=Math.floor(ticks/8+phase)%8;for(let row=0;row<2;row++)for(let col=0;col<3;col++)ctx.drawImage(im,col*18,frame*36+row*18,16,16,Math.round(x-24+col*16),Math.round(y-32+row*16),16,16);}
  else {ctx.drawImage(im,0,0,20,20,Math.round(x-10),Math.round(y-20),20,20);}}
 else {const key=fire?'campfirePlaced':'torchPlaced',fallback=r06Images[key];if(fallback){const width=fire?48:20,height=fire?32:20;ctx.drawImage(fallback,Math.round(x-width/2),Math.round(y-height),width,height);}}
}
r06Torch=function(x,y,t){r07Furniture('torch',x,y,t);};
function r07DrawLoot(s,c){for(const d of s.r07Loot){const k=R06_KITS.find(k=>k.id===d.kit),x=d.x-c,bob=d.grounded?Math.sin((s.ticks+d.x)/21)*2:0;
 if(x<-100||x>R06_VIEW.w+100)continue;ctx.save();ctx.globalAlpha=d.blocked?.7:1;r06Icon(ctx,k.weapon,x,d.y+15+bob,33);
 const head=r06Images[k.armor+'Head'];if(head)ctx.drawImage(head,0,0,40,56,x-20,d.y-7+bob,40,56);
 r05Text(k.name,x,d.y-37,13,k.color,'center');r05Text(k.weaponName.split(' / ')[0],x,d.y-20,10,'#dedfd8','center');ctx.restore();}}
const r07ArenaDrawBase=r06DrawArena;
r06DrawArena=function(){const s=state,p=s.p,c=s.cam,yc=s.camY||-96;r05Viewport(true);ctx.clearRect(0,0,R06_VIEW.w,R06_VIEW.h);r06NightBackground(s);ctx.save();ctx.translate(0,-yc);
 // Terrain and light emitters precede actors; they cannot cover the player's feet.
 ctx.fillStyle='#443a35';ctx.fillRect(0,496,R06_VIEW.w,480);ctx.fillStyle='#52653d';ctx.fillRect(0,496,R06_VIEW.w,3);ctx.fillStyle='#695342';for(let x=-(Math.floor(c)%32);x<R06_VIEW.w;x+=32){ctx.fillRect(x+3,509,16,3);ctx.fillRect(x+17,525,10,3);}
 for(const q of s.level.surfaces)if(q.oneWay)r05DrawWood(q,c);
 for(const f of s.campfires)if(f.x-c>-130&&f.x-c<R06_VIEW.w+130)r07Furniture('campfire',f.x-c,f.y,s.ticks,f.phase);
 for(const t of s.lamps)if(t.x-c>-110&&t.x-c<R06_VIEW.w+110)r07Furniture('torch',t.x-c,t.y,s.ticks,t.phase);
 ctx.save();ctx.translate(Math.round(40-c),464);sprite('pipe_top',0,0);sprite('pipe_body',0,16);ctx.restore();
 const q=s.arenaReward;if(q)sprite(q.used?'block_used':'question'+[0,0,1,2,1,0][Math.floor(s.ticks/8)%6],q.x-c,q.y-(q.bump?Math.sin(q.bump/12*Math.PI)*4:0));
 for(const d of s.r06Drops)r06Sprite(ctx,'cloudBottle',d.x-c,d.y,d.w,d.h);
 if(s.phase==='preparation'){sheet(ctx,'suspiciousEye',[0,0,30,20],161-c,466+Math.sin(s.ticks*.055)*2,30,20);r05Text('L 召唤',176-c,449,12,'#d9c6ae','center');}
 if(s.eye&&!s.eye.dead&&['charge','fastDash'].includes(s.eye.mode))for(let i=0;i<s.eye.trail.length;i+=3){ctx.save();ctx.globalAlpha=i/s.eye.trail.length*.2;r05DrawEye({...s.eye,...s.eye.trail[i],flash:0},c);ctx.restore();}
 for(const m of s.servants)r05DrawServant(m,c);r05DrawEye(s.eye,c);r07DrawLoot(s,c);r06DrawProjectiles(s,c);r06DrawMount(s,c);
 if(!(p.invuln&&Math.floor(s.ticks/4)%2))r06DrawBody(ctx,p.x+p.w/2-c,p.y+p.h,p.attack?p.attackFacing:p.facing,p.grounded&&Math.abs(p.vx)>.1?p.walk:0,!p.grounded,p.attack,0,1,r06Armor(s),r06Weapon(s),1);
 for(const n of s.numbers){ctx.save();ctx.globalAlpha=Math.min(1,n.life/12);r05Text(n.text,n.x-c,n.y,16,n.color,'center');ctx.restore();}ctx.restore();r07HUD(s);trioUI();
};
function r07HUD(s){const w=R06_VIEW.w,h=R06_VIEW.h,k=r06Kit(s);ctx.fillStyle='#091126ed';ctx.fillRect(0,0,w,74);
 r05Text('TERRARIA  /  WORLD 1-3',18,12,17,'#ebe4c9');r05Text('R14 · 近身挖掘 / 火把 · '+(s.phase==='battle'?'自动锁定克眼':s.phase==='cleared'?'地面触碰换装':'无需搭建'),18,40,12,'#b5c5d5');
 ctx.fillStyle='#354348';ctx.fillRect(406,8,49,49);ctx.strokeStyle='#c8bc8e';ctx.strokeRect(406.5,8.5,48,48);r06Icon(ctx,r06Weapon(s),431,33,30);r05Text('J',410,11,10,'#d9e0e4');
 r05Text(k?k.armorName:'铂金套 · 防御 20',478,12,13,k?.color||'#c7d0dd');r05Text((s.cloudJump?'云朵瓶 ✓':'入口木箱：云朵瓶')+' · '+(s.mountOwned?(s.mounted?r07MountName(s)+'骑乘中':'F '+r07MountName(s)):'无坐骑'),478,38,11,'#b4c4d6');
 if(s.campfireBuff)r05Text('篝火：恢复加成',816,13,11,'#e3ad7c');
 r05Text('生命 '+s.hp+' / '+s.maxHp,w-20,9,14,'#f0cbc7','right');for(let i=0;i<10;i++){ctx.globalAlpha=s.hp>s.maxHp/10*i?1:.22;if(photos.heart)ctx.drawImage(photos.heart,w-192+i*17,32,15,15);}ctx.globalAlpha=1;
 if(s.kit==='mage')r05Text('魔力 '+s.mana+'/'+s.maxMana,w-20,55,10,'#aabbec','right');if(s.kit==='ranger')r05Text('叶绿弹 '+s.ammo,w-20,55,10,'#b6dbab','right');
 ctx.fillStyle='#080f23ee';ctx.fillRect(0,h-27,w,27);r05Text('方向移动   空格跳跃   ↓＋空格下穿   按住 J 攻击',16,h-21,11,'#becbd7');r05Text('拾取眼球开战   H 治疗   F 坐骑   V 换坐骑   R 重试   战后管道↓返回',w-17,h-21,11,'#becbd7','right');
 if(s.phase==='preparation'&&s.noticeTime){r05Text('先拿云朵瓶与风暴弓，再拾取最右侧眼球。',w/2,94,14,'#e0dfd0','center');r05Text('击败克眼后可挖矿；地下宝箱按 L / ↑ / 右键打开。',w/2,117,12,'#adbdcf','center');}
 if(s.phase==='cleared'&&(!s.t13World||s.p.y<620)){r05Text('四职业装备落在地面 · 碰到即穿上 · 可自由换回',w/2,96,14,'#e5d29f','center');if(k)r05Text('当前：'+k.name+' / '+k.weaponName,w/2,119,12,k.color,'center');}
 if(s.phase==='battle'&&s.eye&&!s.eye.dead){const e=s.eye,x=w/2-230,y=h-71;ctx.fillStyle='#10152be8';ctx.fillRect(x,y,460,31);ctx.strokeStyle='#866452';ctx.strokeRect(x+.5,y+.5,459,30);ctx.fillStyle='#42292f';ctx.fillRect(x+6,y+21,448,5);ctx.fillStyle=e.phase===2?'#d67768':'#b66866';ctx.fillRect(x+6,y+21,448*e.hp/e.maxHp,5);r05Text('克苏鲁之眼'+(e.mode==='transform'?' · 变形':e.phase===2?' · 第二阶段':''),x+9,y+3,11,'#e6c6ad');r05Text(e.hp+' / '+e.maxHp,x+450,y+3,11,'#e6c6ad','right');
  const ex=e.x-s.cam,ey=e.y-(s.camY||0);if(ex<0||ex>w||ey<76||ey>h-30)r05Text('◆ 克眼',clamp(ex,24,w-24),clamp(ey,88,h-100),12,'#e7aaaa',ex>w?'right':'left');}
 for(const [i,m] of s.r06Chats.slice(-3).entries()){ctx.save();ctx.globalAlpha=Math.min(1,m.life/80);r05Text(m.text,22,h-145+i*22,12,m.color);ctx.restore();}
}
const r07EquipmentBase=drawEquipment;
drawEquipment=function(s){r07EquipmentBase(s);if(s.slimeOwned){r06Icon(ctx,'slimySaddle',112,46,17);ctx.fillStyle='#21304ce8';ctx.fillRect(7,68,72,10);ctx.font='6px sans-serif';ctx.fillStyle='#c8e8f6';ctx.fillText(s.mounted?r07MountName(s)+'骑乘中':'F: '+r07MountName(s),8,75);}};
const r07UIBase=r06UpdateUI;
r06UpdateUI=function(){r07UIBase();if(!isTrio())return;$('bestLabel').textContent='R08';const s=state;
 if(!s){$('overlayText').textContent='R08：四层完整战场；胜利装备掉地，触碰换装。外部问号砖给原图史莱姆坐骑。饥荒、我的世界仍重构中。';return;}
 $('bestLabel').textContent='R08';$('jumpLabel').textContent=r07Slime(s)?'长按空格连跳 · 下落踩敌反弹':'空格跳跃 · ↓＋空格下穿';$('downLabel').textContent=s.r05Arena?'无需施工 · F 骑乘 · V 换坐骑':'1/2/3 工具 · F 坐骑 · H 治疗';
 $('heroHelp').textContent='R08：四层平台均贯通，间隔火把与篝火；克眼胜利后四套装备掉在地面，接触换装，换下的套装放回原位。外部问号砖给粘鞍，内场仍给云朵瓶。史莱姆长按跳跃连跳，下落踩敌弹起。音乐需联网读取，失败不会替换成别的曲。';
 $('r06Mount').disabled=!s.mountOwned;$('r06Mount').textContent=s.mounted?'F · 下坐骑':'F · 骑乘'+r07MountName(s);$('r06Retry').textContent='R · 重新挑战';
 $('moveLabel').textContent='左右移动；战场不用搭台';if(s.r05Arena)$('relayMessage').textContent=s.noticeTime?s.notice:'J 自动追踪 · 四层换位躲避 · 胜利后触碰地面装备';
 const failed=Object.values(r06AssetStatus).filter(a=>a.state==='unavailable').length;if(failed)$('r06AssetReport').textContent+=' 火把与篝火的摆放原图已内嵌；完整篝火动画图集需联网。';
};

const r07RetryBase=retry;
retry=function(){if(state&&!state.r05Arena){state.mounted=false;state.p.h=32;state.p.r07MountHeight=false;state.p.slimeHold=0;}return r07RetryBase.apply(this,arguments);};

// DOM handlers keep function values: rebind after overriding the R06 mount routine.
$('r06Mount').onclick=()=>{r06ToggleMount();canvas.focus({preventScroll:true});};
const r07PauseHelpBase=r04PauseHelp;
r04PauseHelp=function(){if(!isTrio())return r07PauseHelpBase();return state?.r05Arena?'四层贯通战场，无需施工。J 自动瞄准；空格跳跃，↓＋空格下穿；L 召唤；H 治疗；F 骑乘，V 换坐骑。胜利后触碰地面套装换装。':'星怒 / 铂金套。外部问号砖掉粘鞍，触碰拾取后 F 骑乘；长按空格连续高跳，下落踩敌反弹。E 切换主线工具，J 使用；管道按 ↓ / L 进入。';};

// Original resource routing. No replacement soundtrack and no unverified "playing" flag.
// Both network addresses refer to the same pinned source commit. Local import never falls back.
function r07MediaURLs(root,path){return [root+path,root.replace('https://raw.githubusercontent.com/','https://cdn.jsdelivr.net/gh/').replace(/\/([0-9a-f]{40})\//,'@$1/')+path];}
function r07SetupMusic(){
 for(const [key,t] of Object.entries(r06Music)){
  t.urls=r07MediaURLs(R06_MUSIC_ROOT,t.file);Object.assign(t,{sourceIndex:0,state:'not-loaded',busy:false,nextTry:0,generation:0,startedAt:0,failures:[],restorePending:true,cached:false});
  const a=new Audio();t.audio=a;a.loop=true;a.preload='none';a.src=t.urls[0];
  a.addEventListener('canplay',()=>{if(t.state!=='playing')t.state='ready';});
  a.addEventListener('playing',()=>{t.busy=false;t.state='playing';if(!t.local&&!t.cached)r08CacheAudio(key,a.currentSrc||a.src);});
  a.addEventListener('error',()=>{t.busy=false;
   if(t.cacheURL&&!t.local){URL.revokeObjectURL(t.cacheURL);t.cacheURL=null;t.cached=false;r08DeleteCache('audio:original:'+key);t.sourceIndex=0;a.src=t.urls[0];t.state='not-loaded';t.nextTry=0;t.generation++;if(r06MusicKey===key)r06SyncMusic();}
   else if(t.local){t.state='local-decode-error';t.nextTry=Infinity;}else r07NextMusicSource(key);
  });
  a.addEventListener('pause',()=>{if(t.state==='playing')t.state='ready';});
  r08RestoreMusic(key);
 }
}

function r07NextMusicSource(key){const t=r06Music[key];if(t.local||t.state==='network-unavailable')return;
 t.failures.push({src:t.audio.currentSrc||t.audio.src,code:t.audio.error?.code||0});t.audio.pause();t.generation++;t.busy=false;
 if(++t.sourceIndex<t.urls.length){t.audio.src=t.urls[t.sourceIndex];t.state='not-loaded';t.nextTry=0;t.startedAt=0;if(key===r06MusicKey)r06SyncMusic();}
 else{t.state='network-unavailable';t.nextTry=Infinity;}
}
async function r07LoadImage(key,path){
 const embedded=R06_ASSET_DATA[key];
 r06AssetStatus[key]={path,embedded:!!embedded,state:'loading',sourcesTried:0,origin:embedded?'embedded':'pending'};
 const cached=embedded?null:await r08ReadCache('image:'+key);
 const cacheURL=cached?.blob instanceof Blob?URL.createObjectURL(cached.blob):null;
 const urls=embedded?[embedded]:[...(cacheURL?[cacheURL]:[]),...r07MediaURLs(R06_RAW,path)];
 return new Promise(resolve=>{let index=0,done=false,timer;
  const attempt=()=>{const im=new Image(),i=index++,url=urls[i];r06AssetStatus[key].sourcesTried=index;
   if(/^https:/.test(url))im.crossOrigin='anonymous';
   const fail=()=>{clearTimeout(timer);if(done||i!==index-1)return;if(url===cacheURL){r08DeleteCache('image:'+key);URL.revokeObjectURL(cacheURL);}if(index<urls.length)attempt();else{done=true;r06AssetStatus[key].state='unavailable';r08ImageRevision++;resolve(false);}};
   im.onload=()=>{if(done||i!==index-1)return;if(!im.naturalWidth||!im.naturalHeight){fail();return;}clearTimeout(timer);done=true;r06Images[key]=im;Object.assign(r06AssetStatus[key],{state:'ready',size:[im.width,im.height],origin:embedded?'embedded':url===cacheURL?'cache':'network'});r08ImageRevision++;
    if(url===cacheURL){r08CacheHits++;URL.revokeObjectURL(cacheURL);}else if(!embedded)r08RememberImage(key,im);resolve(true);};
   im.onerror=fail;timer=setTimeout(fail,9000);im.src=url;
  };attempt();
 });
}

r06SyncMusic=function(){const enabled=isTrio()&&state&&['playing','flag'].includes(mode)&&soundOn&&!document.hidden&&r06MusicUnlocked;
 const key=enabled?(state.r05Arena?(state.phase==='battle'?'boss':'night'):'day'):null;
 for(const [k,t] of Object.entries(r06Music))if(k!==key){if(!t.audio.paused)t.audio.pause();if(t.busy){t.generation++;t.busy=false;}}
 const changed=r06MusicKey!==key;r06MusicKey=key;if(!key)return;const t=r06Music[key];t.audio.volume=r06MusicVolume;
 if(changed&&t.state!=='network-unavailable'){t.nextTry=0;}
 if(t.busy&&performance.now()-t.startedAt>11000&&!t.local){r07NextMusicSource(key);return;}
 if(t.restorePending||t.state==='network-unavailable'||t.state==='local-decode-error'||!t.audio.paused||t.busy||performance.now()<t.nextTry)return;
 t.busy=true;t.state='loading';t.startedAt=performance.now();t.nextTry=t.startedAt+2500;const generation=++t.generation;
 t.audio.play().then(()=>{if(t.generation!==generation)return;t.busy=false;if(r06MusicKey!==key)t.audio.pause();else if(!t.audio.paused)t.state='playing';}).catch(err=>{
  if(t.generation!==generation)return;t.busy=false;if(err.name==='NotAllowedError'){t.state='waiting-user-or-network';return;}
  if(err.name==='AbortError'){if(r06MusicKey!==key)t.state='ready';return;}
  if(t.local){t.state='local-decode-error';t.nextTry=Infinity;}else r07NextMusicSource(key);
 });
};
const r07RetryMediaBase=$('r06RetryMedia').onclick;
$('r06RetryMedia').onclick=()=>{
 for(const [key,path] of Object.entries(R06_IMAGE_PATHS))if(r06AssetStatus[key].state==='unavailable')r07LoadImage(key,path);
 for(const t of Object.values(r06Music))if(!t.local){t.audio.pause();t.sourceIndex=0;t.generation++;t.audio.src=t.urls[0];t.state='not-loaded';t.nextTry=0;t.busy=false;t.failures=[];}
 r06MusicUnlocked=true;r06SyncMusic();
};

// The crossover's musical jingles must not overlap the Terraria stream.
// Ordinary collision/coin effects stay as in R06; other episode-two characters are untouched.
const r07SourceSoundBase=sourceSound;
sourceSound=function(key,options={}){if(isTrio()&&['clear','flag','hurry','gameover'].includes(key))return 0;return r07SourceSoundBase(key,options);};

/* R08 input, renderer and persistent-media repairs. Does not change terrain,
   equipment stats, boss AI, or the legacy five-hero engine. */
const r08PauseBase=togglePause;
togglePause=function(){if(isTrio()){r05CancelPointer();clearInput();r08StopRoars();}return r08PauseBase.apply(this,arguments);};
const r08RetryBase=retry;retry=function(){if(isTrio()){r05CancelPointer();r08StopRoars();}return r08RetryBase.apply(this,arguments);};
const r08StopMusicBase=r06StopMusic;
r06StopMusic=function(){r08StopRoars();return r08StopMusicBase.apply(this,arguments);};
const r08AudioSyncBase=r06SyncMusic;
r06SyncMusic=function(){if(!soundOn||document.hidden||!isTrio()||!['playing','flag'].includes(mode))r08StopRoars();return r08AudioSyncBase.apply(this,arguments);};
window.addEventListener('visibilitychange',()=>{if(document.hidden){r05CancelPointer();r08StopRoars();}r06SyncMusic();});
window.addEventListener('blur',()=>{if(isTrio()){r05CancelPointer();r08StopRoars();}});
r06Roar=function(rate=1){if(!r06RoarAudio||!soundOn||!isTrio()||document.hidden||!['playing','flag'].includes(mode))return;const a=r06RoarAudio.cloneNode();a.volume=r06MusicVolume;a.playbackRate=rate;r08LiveRoars.add(a);a.onended=a.onerror=()=>r08LiveRoars.delete(a);a.play().catch(()=>r08LiveRoars.delete(a));};
// Synchronize with the visible slider immediately, not only after it is moved.
if($('musicVolume'))r06MusicVolume=clamp(Number($('musicVolume').value)/100,0,1);

// Pre-render identical light textures and stitched furniture frames once. Never
// flatten the whole stage: actors, flame animation and camera remain dynamic.
const r08GlowCache=new Map(),r08FireFrames=new Map();let r08FrameRevision=-1;
function r08Glow(fire){const key=fire?'fire':'torch';if(r08GlowCache.has(key))return r08GlowCache.get(key);const r=fire?128:104,cv=document.createElement('canvas');cv.width=cv.height=r*2;const g=cv.getContext('2d'),gl=g.createRadialGradient(r,r,2,r,r,r);gl.addColorStop(0,fire?'rgba(255,184,90,.18)':'rgba(255,200,128,.12)');gl.addColorStop(.55,'rgba(245,164,75,.045)');gl.addColorStop(1,'rgba(230,150,70,0)');g.fillStyle=gl;g.fillRect(0,0,r*2,r*2);r08GlowCache.set(key,cv);return cv;}
function r08FireFrame(fire,frame){if(r08FrameRevision!==r08ImageRevision){r08FireFrames.clear();r08FrameRevision=r08ImageRevision;}const key=(fire?'fire':'torch')+frame;if(r08FireFrames.has(key))return r08FireFrames.get(key);const im=r06Images[fire?'campfireTiles':'torchTiles'],fallback=r06Images[fire?'campfirePlaced':'torchPlaced'];if(!im&&!fallback)return null;const cv=document.createElement('canvas');cv.width=fire?48:20;cv.height=fire?32:20;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;if(im&&fire){for(let row=0;row<2;row++)for(let col=0;col<3;col++)g.drawImage(im,col*18,frame*36+row*18,16,16,col*16,row*16,16,16);}else if(im)g.drawImage(im,0,0,20,20,0,0,20,20);else g.drawImage(fallback,0,0,cv.width,cv.height);r08FireFrames.set(key,cv);return cv;}
r07Furniture=function(kind,x,y,ticks,phase=0){const fire=kind==='campfire',r=fire?128:104;ctx.drawImage(r08Glow(fire),x-r,y-(fire?20:14)-r);const frame=r08FireFrame(fire,fire?Math.floor(ticks/8+phase)%8:0);if(frame)ctx.drawImage(frame,Math.round(x-frame.width/2),Math.round(y-frame.height));};

// Preserve the visible native status panel, but make storage and decoding states
// explicit; an HTTP response is not evidence that a soundtrack has been decoded.
const r08CacheButton=document.createElement('button');r08CacheButton.type='button';r08CacheButton.id='r08CacheMedia';r08CacheButton.textContent='缓存原图 / 三首原曲';
const r08CacheStatus=document.createElement('div');r08CacheStatus.id='r08CacheStatus';r08CacheStatus.setAttribute('aria-live','polite');
r06Media.append(r08CacheButton,r08CacheStatus);
const r08MediaNote=r06Media.querySelector('p');if(r08MediaNote)r08MediaNote.textContent='三首 BGM 按场景单独播放。成功联网取得的原图与音频可缓存在此浏览器；本地导入优先。首次无网不会凭空补齐素材；缓存不可用不影响开局。';
async function r08CacheEverything(){if(r08CacheBusy)return;r08CacheBusy=true;r08CacheProgress='正在保存原图…';r08CacheButton.disabled=true;let ok=0;
 try{if(!await r08DB()){r08CacheProgress='浏览器未开放持久缓存；可继续联网试玩或导入音频。';return;}
  const jobs=[];for(const [key,path] of Object.entries(R06_IMAGE_PATHS)){const status=r06AssetStatus[key];if(!status.embedded&&status.state==='unavailable')jobs.push(r07LoadImage(key,path));else if(!status.embedded&&r06Images[key])jobs.push(r08RememberImage(key,r06Images[key]));}await Promise.all(jobs);
  for(const [key,t] of Object.entries(r06Music)){r08CacheProgress='正在保存 '+t.label+'…';r08UpdateMediaStatus();if(t.cached){ok++;continue;}if(t.local)continue;for(const url of t.urls){if(await r08CacheAudio(key,url)){ok++;break;}}}
  r08CacheProgress='音乐缓存 '+ok+' / 3；未成功的项目仍需联网或本地导入。';
 }finally{r08CacheBusy=false;r08CacheButton.disabled=false;r08UpdateMediaStatus();}}
r08CacheButton.addEventListener('click',r08CacheEverything);
function r08UpdateMediaStatus(){const a=Object.values(r06AssetStatus),local=a.filter(x=>x.embedded&&x.state==='ready').length,hit=a.filter(x=>x.origin==='cache'&&x.state==='ready').length,net=a.filter(x=>x.origin==='network'&&x.state==='ready').length,miss=a.filter(x=>x.state==='unavailable').length;
 r08CacheStatus.textContent=(r08CacheError?r08CacheError+'。':'')+(r08CacheProgress||'缓存属于当前浏览器与站点；更换浏览器或清理站点数据后需重新加载。')+' 原图：内嵌 '+local+' / 缓存 '+hit+' / 在线 '+net+(miss?' / 未取得 '+miss:'')+'。';
 const m=r06MusicKey?r06Music[r06MusicKey]:null;const names={playing:'播放中',ready:'已解码',loading:'加载中','not-loaded':'待解码','network-unavailable':'网络不可用','waiting-user-or-network':'等待点击启用声音','local-decode-error':'本地文件解码失败'};if(m){const origin=m.local?'本地导入':m.cacheURL?'浏览器缓存':'联网原曲';$('r06MusicStatus').textContent='BGM：'+m.label+' · '+origin+' · '+(m.restorePending?'检查本机缓存':names[m.state]||m.state);$('audioBadge').textContent=m.state==='playing'?(m.local?'本地音频':'ORIGINAL BGM'):'音频未播放';}}
async function r08ImportMedia(e){const f=e.target.files?.[0];if(!f)return;if(f.size>40*1024*1024){r08CacheProgress='音频超过 40 MB，本次未导入。';r08UpdateMediaStatus();return;}const key=$('r06MusicSlot').value,url=URL.createObjectURL(f);r08CacheProgress='正在检查本地音频…';
 if(key==='roar'){r08StopRoars();if(r06RoarAudio){r06RoarAudio.pause();URL.revokeObjectURL(r06RoarAudio.src);}const a=new Audio(url);r06RoarAudio=a;a.preload='auto';a.addEventListener('canplay',async()=>{if(r06RoarAudio!==a)return;const saved=await r08WriteCache('audio:user:roar',{blob:f,kind:'user-import',savedAt:Date.now()});r08CacheProgress=saved?'本地吼声已解码并保存。':'本地吼声已解码；此浏览器未保存缓存。';r08UpdateMediaStatus();},{once:true});a.addEventListener('error',()=>{if(r06RoarAudio===a){r06RoarAudio=null;URL.revokeObjectURL(url);r08CacheProgress='吼声文件不能解码，请换成浏览器支持的音频。';r08UpdateMediaStatus();}},{once:true});a.load();return;}
 const t=r06Music[key];t.generation++;t.restorePending=false;t.audio.pause();if(t.cacheURL)URL.revokeObjectURL(t.cacheURL);else if(t.local)URL.revokeObjectURL(t.audio.src);t.cacheURL=null;t.local=true;t.cached=false;t.audio.src=url;t.audio.preload='auto';t.state='loading';t.busy=false;t.nextTry=0;t.failures=[];const generation=t.generation;
 t.audio.addEventListener('canplay',async()=>{if(!t.local||t.audio.src!==url)return;const saved=await r08WriteCache('audio:user:'+key,{blob:f,kind:'user-import',savedAt:Date.now()});if(!t.local||t.audio.src!==url)return;t.cached=saved;r08CacheProgress=saved?'本地音乐已解码并保存，下次打开优先使用。':'本地音乐已解码；此浏览器未保存缓存。';r08UpdateMediaStatus();},{once:true});
 t.audio.addEventListener('error',()=>{if(t.audio.src===url){r08CacheProgress='本地音乐解码失败；没有保存无效文件。';r08UpdateMediaStatus();}},{once:true});r06MusicUnlocked=true;t.audio.load();r06SyncMusic();r08UpdateMediaStatus();}
(async()=>{const stored=await r08ReadCache('audio:user:roar');if(stored?.blob instanceof Blob&&!r06RoarAudio){r06RoarAudio=new Audio(URL.createObjectURL(stored.blob));r08CacheHits++;}})();
$('r06RetryMedia').onclick=()=>{for(const [key,path] of Object.entries(R06_IMAGE_PATHS))if(r06AssetStatus[key].state==='unavailable')r07LoadImage(key,path);for(const t of Object.values(r06Music))if(!t.local&&!t.cacheURL){t.audio.pause();t.sourceIndex=0;t.generation++;t.audio.src=t.urls[0];t.state='not-loaded';t.nextTry=0;t.busy=false;t.failures=[];}r06MusicUnlocked=true;r06SyncMusic();};
const r08UIBase=r06UpdateUI;
r06UpdateUI=function(){r08UIBase();if(!isTrio())return;$('bestLabel').textContent='R08';if(!state){$('overlayText').textContent='R08：泰拉瑞亚 1-3。四层贯通战场、星怒 / 铂金套开局、史莱姆坐骑、落地自由换装。修复重试与短按跳跃；新增本机原图 / 原曲缓存。';return;}
 $('heroHelp').textContent='R08：四层战场不需施工；J 自动瞄准克眼。击败后碰到地面套装即可换装。外部问号砖给粘鞍，内场给云朵瓶。F 骑乘，V 换坐骑，H 治疗。R 主线回检查点并保留装备；战场重新挑战。下方可查看音频 / 缓存状态。';
 r08UpdateMediaStatus();};
// Only throttle the ancillary DOM panel, never game ticks or canvas rendering.
let r08UILast=-Infinity,r08UISignature='',r08UIState=null,r08UIWrites=0;
function r08RefreshUI(){if(!isTrio()){r04TrioUI();r05UI();r06UpdateUI();return;}const s=state,key=[mode,s?.phase,s?.kit,s?.mounted,s?.mountType,s?.tool,s?.notice,s?.hp,s?.cloudJump,r06MusicKey,r06MusicKey&&r06Music[r06MusicKey].state,r08ImageRevision,r08CacheProgress].join('|'),now=performance.now();if(s===r08UIState&&key===r08UISignature&&now-r08UILast<100)return;r08UIState=s;r08UISignature=key;r08UILast=now;r08UIWrites++;r04TrioUI();r05UI();r06UpdateUI();}
trioUI=r08RefreshUI;

/* R10: installed INSIDE the existing game closure, after all R08 initialization.
 * The final build asserts a single extension and single runtime installation.
 * Native sprite pixels are layered here; mechanics are a browser adaptation. */
const T10_VERSION = 'R10.1 · TERRARIA 1-3';
let t10Installed = true, t10Helmet = true;
const t10TintCache = new Map();
const t10Ready = Promise.all(r06AssetJobs);
const t10Scale = s => s?.r05Arena ? 1 : .75;
function t10Tint(key, rgb) {
 const im=r06Images[key]||photos[key]; if(!im)return null;
 const cacheKey=key+':'+rgb.join(',')+':'+im.width+':'+im.height;
 if(t10TintCache.has(cacheKey))return t10TintCache.get(cacheKey);
 const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
 const g=c.getContext('2d');g.drawImage(im,0,0);const data=g.getImageData(0,0,c.width,c.height);
 for(let i=0;i<data.data.length;i+=4){for(let j=0;j<3;j++)data.data[i+j]=Math.round(data.data[i+j]*rgb[j]/255);}
 g.putImageData(data,0,0);t10TintCache.set(cacheKey,c);return c;
}
function t10Face(g,bob=0) {
 const parts=[['skinHead',[255,207,167]],['eyeWhite',null],['eyeIris',[44,83,111]],['hair',[151,99,52]]];
 for(const [key,color] of parts){const im=color?t10Tint(key,color):r06Images[key];if(im)g.drawImage(im,0,0,40,56,-20,-54+bob,40,56);}
}
// Every hand, hilt, muzzle and collision ray uses this one local pose.
const T10_ITEMS={
 starfury:{grip:[6,36],tip:[37,5],scale:1,style:'swing'},
 zenith:{grip:[7,48],tip:[49,6],scale:1,style:'swing'},
 axe:{grip:[4,26],tip:[27,5],scale:1,style:'swing'},
 kaleidoscope:{grip:[6,32],tip:[28,5],scale:1,style:'whip'},
 sdmg:{grip:[35,24],tip:[64,17],scale:.9,style:'gun'},
 lastPrism:{grip:[13,24],tip:[13,4],scale:1,style:'prism'}
};
function t10BodyFoot(s,foot,scale) {
 if(!s?.mounted)return foot;
 if(s.mountType==='slime')return foot-(28+[0,2,0,-2][s.p.slimeFrame||0])*scale;
 return foot-3*scale;
}
function t10Pose(s,attack=s?.p.attack||0,tool=s?.tool||0) {
 const p=s?.p||{facing:1,attackFacing:1,aim:0};
 const key=tool===2?'axe':tool===1?'wood':r06Weapon(s||{});
 const weapon=key==='terraprisma'?'kaleidoscope':key;
 const def=T10_ITEMS[weapon]||T10_ITEMS.starfury;
 const using=attack>0||weapon==='lastPrism'&&s?.prismCharge>0;
 const duration=p.t10SwingDuration||22;
 const u=clamp(1-attack/duration,0,1),e=u*u*(3-2*u);
 const aim=p.aim||0;
 let theta=using?-2.30+4.1*e:1.65, blade=theta-.30;
 if(def.style==='gun'||def.style==='prism'){theta=aim+.11;blade=aim;}
 if(def.style==='whip'&&using){theta=-1.8+3.4*clamp((s.whipAge||0)/28,0,1);blade=theta;}
 const shoulder={x:-7,y:-27},length=Math.hypot(18,8),hand={x:shoulder.x+Math.cos(theta)*length,y:shoulder.y+Math.sin(theta)*length};
 const rotation=def.style==='gun'?blade:def.style==='prism'?blade+Math.PI/2:blade+Math.PI/4;
 const grip=def.grip,tip=def.tip,dx=(tip[0]-grip[0])*def.scale,dy=(tip[1]-grip[1])*def.scale;
 const end={x:hand.x+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:hand.y+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
 return {weapon,def,using,shoulder,hand,end,theta,rotation,u,face:attack?p.attackFacing||p.facing:p.facing};
}
function t10WorldPose(s,attack=s.p.attack,tool=s.tool) {
 const local=t10Pose(s,attack,tool),sc=t10Scale(s),foot=t10BodyFoot(s,s.p.y+s.p.h,sc),cx=s.p.x+s.p.w/2;
 const convert=q=>({x:cx+q.x*local.face*sc,y:foot+q.y*sc});
 return {...local,hand:convert(local.hand),end:convert(local.end),shoulder:convert(local.shoulder),scale:sc,foot};
}
function t10NativeLayer(g,key,rect,x=-20,y=-54){const im=r06Images[key]||photos[key];if(im&&rect[0]+rect[2]<=im.width&&rect[1]+rect[3]<=im.height)g.drawImage(im,...rect,x,y,rect[2],rect[3]);}
r06DrawBody=function(g,x,foot,face,walk=0,air=false,attack=0,tool=0,opacity=1,armor='platinum',weapon='starfury',scale=.75){
 if(!ready)return;
 const s=state,slime=!!(s?.mounted&&s.mountType==='slime'),ufo=!!(s?.mounted&&s.mountType==='ufo');
 const n=slime||ufo?0:air?5:walk?6+Math.floor(walk/5)%14:0;
 const bob=slime||ufo?0:[7,8,9,14,15,16].includes(n)?-2:0;
 const part=k=>r06Images[armor+k]?armor+k:'platinum'+k;
 const pose=t10Pose(s,attack,tool);face=face||1;
 g.save();g.translate(Math.round(x),Math.round(t10BodyFoot(s,foot,scale)));g.scale(face*scale,scale);g.globalAlpha*=opacity;g.imageSmoothingEnabled=false;
 // Back arm, legs and torso, then skin/eyes/hair. NO reuse of the old head-only helmet renderer.
 const skin=t10Tint('skinBody',[255,207,167]);if(skin)g.drawImage(skin,320,0,40,56,-20,-54+bob,40,56);t10NativeLayer(g,part('Body'),[320,0,40,56],-20,-54+bob);
 t10NativeLayer(g,part('Legs'),[0,n*56,40,56]);
 t10NativeLayer(g,part('Body'),[0,0,40,56],-20,-54+bob);
 t10Face(g,bob);
 if(t10Helmet)t10NativeLayer(g,part('Head'),[0,0,40,56],-20,-54+bob);
 if(pose.using&&tool!==1){
  const im=r06Images[pose.weapon]||photos[pose.weapon];
  if(im){g.save();g.translate(pose.hand.x,pose.hand.y+bob);g.rotate(pose.rotation);g.drawImage(im,-pose.def.grip[0]*pose.def.scale,-pose.def.grip[1]*pose.def.scale,im.width*pose.def.scale,im.height*pose.def.scale);g.restore();}
 }
 if(tool===1&&attack)sheet(g,'wood',[0,0,24,14],6,-26,20,12);
 // Native forearm cel has shoulder (12,28), hand (30,36). Rotate the whole cel about its shoulder.
 if(pose.using){g.save();g.translate(pose.shoulder.x,pose.shoulder.y+bob);g.rotate(pose.theta-Math.atan2(8,18));if(skin)g.drawImage(skin,200,0,40,56,-12,-28,40,56);t10NativeLayer(g,part('Body'),[200,0,40,56],-12,-28);g.restore();}
 else {if(skin)g.drawImage(skin,80,0,40,56,-20,-54+bob,40,56);t10NativeLayer(g,part('Body'),[80,0,40,56],-20,-54+bob);}
 g.restore();
};
person=function(g,x,foot,face,walk=0,air=false,attack=0,tool=0,opacity=1){r06DrawBody(g,x,foot,face,walk,air,attack,tool,opacity,r06Armor(state||{}),r06Weapon(state||{}),.75);};

// Collecting a mount queues a physical mounting transition, not merely an unlock.
function t10RequestMount(s,type,reason='pickup') {
 if(!s||!['slime','ufo'].includes(type))return false;
 s.mountType=type;s.mountOwned=true;s[type==='slime'?'slimeOwned':'ufoOwned']=true;
 s.t10PendingMount={type,reason};return t10ApplyMount(s);
}
function t10ApplyMount(s) {
 const req=s?.t10PendingMount;if(!req)return false;const p=s.p,type=req.type;
 const target=type==='slime'?(s.r05Arena?62:47):(s.r05Arena?42:32);
 const candidate={...p,y:p.y+p.h-target,h:target},ss=s.r05Arena?s.level.surfaces:solids();
 if(ss.some(q=>q.solid&&near(candidate,q))){s.t10MountBlocked=true;return false;}
 const was=s.mounted;s.mountType=type;s.mounted=true;r07SetMountHeight(s,type==='slime');
 s.t10PendingMount=null;s.t10MountBlocked=false;p.slimeHold=0;p.slimeTicks=p.slimeTicks||0;
 if(!was){p.attack=0;if(type==='ufo'){p.vy=0;p.grounded=false;p.support=null;}}
 note(type==='slime'?'粘鞍已拾取 · 已自动骑乘史莱姆':'奖励已装备 · 已自动骑乘 UFO');
 evt('t10-auto-mounted',{mount:type,reason:req.reason});terraSound('mount');return true;
}
r07CollectSaddle=function(s){if(s.slimeOwned)return;s.score+=1000;t10RequestMount(s,'slime');evt('r07-slimy-saddle-collected',{autoMounted:s.mounted});r06Chat('获得粘鞍！自动骑乘史莱姆；长按空格连续跳跃。','#9bc9ff');terraSound('pickup');};
const t10EquipBase=r07EquipDrop;
r07EquipDrop=function(s,d){const ok=t10EquipBase(s,d);if(ok)t10RequestMount(s,'ufo','class-reward');return ok;};
const t10MainStepBase=r04MainStep;
r04MainStep=function(v){const s=state;if(s&&mode==='playing')t10ApplyMount(s);t10MainStepBase(v);if(state===s&&mode==='playing'){t10ApplyMount(s);t10TickParticles(s);}};
const t10ArenaStepBase=r05ArenaStep;
r05ArenaStep=function(v){const s=state;if(s&&mode==='playing')t10ApplyMount(s);t10ArenaStepBase(v);if(state===s&&mode==='playing'){t10ApplyMount(s);t10TickParticles(s);}};
const t10ToggleBase=r06ToggleMount;
r06ToggleMount=function(){if(state)state.t10PendingMount=null;return t10ToggleBase();};
$('r06Mount').onclick=()=>{r06ToggleMount();canvas.focus({preventScroll:true});};
const t10EnterBase=enterTerraSecret;
enterTerraSecret=function(restart=false,direct=false){const mounted=state?.mounted,type=state?.mountType;const ok=t10EnterBase(restart,direct);if(ok){state.t10Particles=[];state.t10Visual='native-face-hilt';if(mounted&&!restart)t10RequestMount(state,type,'pipe-transfer');}return ok;};
const t10ExitBase=exitSecret;
exitSecret=function(){const on=state?.mounted,type=state?.mountType;const ok=t10ExitBase();if(ok&&on)t10RequestMount(state,type,'return-main');return ok;};
const t10RetryBase=retry;
retry=function(){if(state){state.t10PendingMount=null;state.mounted=false;r07SetMountHeight(state,false);}t10RetryBase();};

// Draw the checked native four-frame mount without stretching or an airborne leg pose.
r06DrawMount=function(s,c){if(!s.mounted)return;const p=s.p,sc=t10Scale(s),cx=p.x+p.w/2-c,feet=p.y+p.h;
 if(s.mountType==='slime'){const im=r06Images.slimeMount,f=p.slimeFrame||0;if(im){ctx.save();ctx.translate(Math.round(cx),Math.round(feet));ctx.scale(p.facing*sc,sc);ctx.drawImage(im,0,f*48,58,48,-29,-46,58,48);ctx.restore();}}
 else{const im=r06Images.ufo;if(im){const h=im.height/8,f=Math.floor(s.ticks/6)%4;ctx.drawImage(im,0,f*h,im.width,h,Math.round(cx-39*sc),Math.round(feet-16*sc),78*sc,h*sc);}}
};

// Populate actual surfaces; no enemies are spawned inside gaps or allowed to die before activation.
function t10MakeFoe(kind,surface,x,i,skin='blue') {
 const size=kind==='zombie'?[18,32]:kind==='slime'?[22,18]:kind==='caveBat'?[20,14]:[26,20];
 const hp=kind==='zombie'?45:kind==='slime'?(skin==='green'?18:skin==='purple'?40:25):kind==='caveBat'?20:60;
 const flying=['demonEye','caveBat'].includes(kind),y=flying?Math.max(55,surface.y-65):surface.y-size[1];
 return {id:'t10-foe-'+i,kind,skin,x,y,w:size[0],h:size[1],hp,maxHp:hp,vx:0,vy:0,age:i*7,dir:-1,dead:0,flash:0,knock:0,active:false,grounded:!flying,flying,spawnX:x,spawnY:y,home:surface.id,jumpWait:20+i%5*9,hop:0,hitBy:-1};
}
function t10Populate(s){
 const original=s.foes;const cameo=[];for(const kind of ['goomba','koopa']){const e=original.find(e=>e.kind===kind);if(e)cameo.push({...e,id:'t10-cameo-'+kind,active:false});}
 const plats=s.level.surfaces.filter(q=>q.type==='tree'&&q.w>=48).sort((a,b)=>a.x-b.x);
 const foeKinds=['slime','slime','zombie','slime','demonEye','zombie','caveBat','slime','demonEye','slime','zombie','caveBat','slime','demonEye'];
 const chosen=plats.filter(q=>q.x>=256&&q.x<2080);
 const extra=[];for(let i=0;i<Math.min(foeKinds.length,chosen.length);i++){const q=chosen[i],x=q.x+Math.min(q.w-28,Math.max(12,q.w*.62));extra.push(t10MakeFoe(foeKinds[i],q,x,i,['blue','green','purple'][i%3]));}
 const end=s.level.surfaces.find(q=>q.id==='floor-end');if(end)extra.push(t10MakeFoe('zombie',end,2145,30),t10MakeFoe('slime',end,2310,31,'purple'));
 s.foes=[...cameo,...extra];s.t10Roster=true;s.t10Particles=[];s.t10Visual='native-face-hilt';
}
const t10NewBase=newState;
newState=function(){const s=t10NewBase();if(s.stage===0)t10Populate(s);return s;};
const t10OldEnemies=updateEnemies;
updateEnemies=function(ss){const s=state,p=s.p;
 const terra=s.foes.filter(e=>['slime','zombie','demonEye','caveBat'].includes(e.kind)),others=s.foes.filter(e=>!terra.includes(e));
 const all=s.foes;s.foes=others;t10OldEnemies(ss);s.foes=all;
 for(const e of terra){
  if(e.dead){if(e.dead<45){e.dead++;e.x+=e.vx;e.vy+=.22;e.y+=e.vy;}continue;}
  if(e.x>s.cam+W+48&&!e.active)continue;if(e.x<s.cam-90)continue;e.active=true;e.age++;if(e.flash)e.flash--;
  const knock=e.knock>0;if(knock){e.knock--;e.vx*=.92;}
  else if(e.flying){const targetX=p.x+p.w/2,targetY=p.y+p.h*.4,dx=targetX-e.x-e.w/2,dy=targetY-e.y-e.h/2,d=Math.hypot(dx,dy)||1;
   const speed=e.kind==='caveBat'?2.05:1.65;e.vx=approach(e.vx,dx/d*speed,e.kind==='caveBat'?.065:.038);e.vy=approach(e.vy,dy/d*speed+Math.sin((e.age+e.spawnX)/19)*.22,.035);e.dir=e.vx<0?-1:1;
  }else if(e.kind==='slime'){
   if(e.grounded){e.vx=0;if(--e.jumpWait<=0){e.hop++;e.dir=p.x<e.x?-1:1;const high=e.hop%3===0;e.vy=high?-5.9:-3.7;e.vx=e.dir*(high?1.65:1.05);e.grounded=false;e.jumpWait=high?52:34;}}
  }else{e.dir=p.x<e.x?-1:1;e.vx=e.dir*.7;if(e.grounded&&p.y+p.h<e.y-12&&Math.abs(p.x-e.x)<90&&e.age%55===0){e.vy=-5.4;e.grounded=false;}}
  if(e.flying){e.x+=e.vx;e.y+=e.vy;}else{
   const before=e.y+e.h;e.x+=e.vx;
   for(const q of ss)if(q.solid&&near(e,q)){if(e.vx>0)e.x=q.x-e.w;else if(e.vx<0)e.x=q.x+q.w;if(e.kind==='zombie'&&e.grounded){e.vy=-5.4;e.grounded=false;}e.vx=0;}
   e.vy=Math.min(7,e.vy+.28);e.y+=e.vy;e.grounded=false;let landing=null;
   for(const q of ss)if(e.x+e.w>q.x&&e.x<q.x+q.w&&before<=q.y+1&&e.y+e.h>=q.y&&e.vy>=0&&(!landing||q.y<landing.y))landing=q;
   if(landing){e.y=landing.y-e.h;e.vy=0;e.grounded=true;}
   if(e.y>290){e.dead=45;continue;}
  }
  if(near(p,e)){if(r07Slime(s)&&r07Stomp(s))continue;hurt(e);}
 }
};
let t10SlimeOriginal=null;const t10SlimeColors=new Map();
const t10SlimeJob=new Promise(resolve=>{const im=new Image();im.onload=()=>{t10SlimeOriginal=im;resolve();};im.onerror=()=>resolve();im.src=TRIO_ASSETS.slime;});
function t10SlimeImage(skin){if(!t10SlimeOriginal)return photos.slime;if(t10SlimeColors.has(skin))return t10SlimeColors.get(skin);
 const c=document.createElement('canvas');c.width=t10SlimeOriginal.width;c.height=t10SlimeOriginal.height;const g=c.getContext('2d');g.drawImage(t10SlimeOriginal,0,0);const data=g.getImageData(0,0,c.width,c.height),rgb=skin==='green'?[94,202,83]:skin==='purple'?[175,100,223]:[86,151,254];
 for(let i=0;i<data.data.length;i+=4){const v=Math.max(data.data[i],data.data[i+1],data.data[i+2])/255;for(let j=0;j<3;j++)data.data[i+j]=Math.round(rgb[j]*v);}g.putImageData(data,0,0);t10SlimeColors.set(skin,c);return c;
}
function t10DrawFoe(e,c){const sc=.75;let im,fw,fh,f=0;
 if(e.kind==='slime'){im=t10SlimeImage(e.skin);fw=32;fh=26;f=e.grounded?(Math.floor(e.age/12)%2):1;}
 else if(e.kind==='demonEye'){im=r06Images.demonEye;fw=38;fh=24;f=Math.floor(e.age/7)%2;}
 else if(e.kind==='zombie'){im=r06Images.zombie;fw=38;fh=48;f=e.grounded?Math.floor(e.age/8)%3:1;}
 else if(e.kind==='caveBat'){im=r06Images.caveBat;fw=44;fh=40;f=Math.floor(e.age/5)%4;}
 else return false;
 if(!im)return false;
 ctx.save();ctx.translate(Math.round(e.x+e.w/2-c),Math.round(e.y+e.h));ctx.scale(e.dir<0?sc:-sc,sc);ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,f*fh,fw,fh,-fw/2,-fh+2,fw,fh);ctx.restore();return true;
}

// Keep every trunk in the scenery layer; platform walking space is cut out of supports.
drawTerraTerrain=function(s){if(s.secret){drawTerraArenaTerrain(s);return;}const l=s.level,c=s.cam,visible=l.surfaces.filter(q=>q.x<c+W+40&&q.x+q.w>c-40);
 for(const q of visible.filter(q=>q.type==='tree')){
  const x=q.x+q.w/2-5,start=q.y+12;let end=H;
  for(const other of l.surfaces)if(other!==q&&other.y>q.y&&x+10>other.x&&x<other.x+other.w)end=Math.min(end,other.y-38);
  ctx.save();ctx.globalAlpha=.64;for(let y=start;y<end;y+=8)ctx.drawImage(tiles13.trunk,Math.round(x-c),Math.round(y),10,Math.min(8,end-y));ctx.restore();
 }
 for(const t of s.trees||[])drawChopTree(t,c);
 // All solid/top tiles are drawn after background tree stems, regardless of source order.
 for(const q of visible.slice().sort((a,b)=>a.y-b.y)){
  if(q.type==='tree'){for(let dx=0;dx<q.w;dx+=16)ctx.drawImage(tiles13[dx===0?'treeLeft':dx+16>=q.w?'treeRight':'treeMid'],Math.round(q.x-c+dx),Math.round(q.y));}
  else for(let x=q.x;x<q.x+q.w;x+=16)for(let y=q.y;y<q.y+q.h;y+=16)sprite(q.type==='floor'?'ground':'stone',x-c,y);
 }
};
const t10TreeBase=drawChopTree;
drawChopTree=function(t,c){const p=state?.p,nearPlayer=p&&Math.abs(p.x+p.w/2-t.x)<32&&p.y<t.y&&p.y+p.h>t.y-t.h-24;ctx.save();if(nearPlayer)ctx.globalAlpha*=.5;t10TreeBase(t,c);ctx.restore();};
function t10Burst(s,x,y,kind,n=6){if(!s.t10Particles)s.t10Particles=[];for(let i=0;i<n;i++)s.t10Particles.push({x,y,vx:(Math.sin(i*2.4+s.ticks)*1.6),vy:-1-Math.abs(Math.cos(i*1.7))*1.7,age:0,kind});}
function t10TickParticles(s){if(!s.t10Particles)return;for(const f of s.t10Particles){f.age++;f.x+=f.vx;f.y+=f.vy;f.vy+=.12;}s.t10Particles=s.t10Particles.filter(f=>f.age<28);}
const t10ChopBase=chopTree;
chopTree=function(){const s=state,old=s.wood,ok=t10ChopBase();if(ok){t10Burst(s,s.p.x+s.p.w/2+s.p.facing*15,s.p.y+16,'wood',s.wood>old?14:6);if(s.wood>old)terraSound('treeFell');}return ok;};
const t10HitBase=hitEnemy;
hitEnemy=function(e,d,dir,kind){const dead=!!e.dead;t10HitBase(e,d,dir,kind);if(!dead){t10Burst(state,e.x+e.w/2,e.y+e.h/2,e.kind==='slime'?'gel':'hit',6);if(e.dead)terraSound('npcDeath');}};

// Tool-specific use styles; one hilt transform drives both drawing and hit testing.
function t10Attack(v={}) {
 const s=state,p=s.p;if(p.cooldown>0)return;const aim=r06Arm(s,v),target=aim.target,sc=t10Scale(s);
 p.t10SwingDuration=s.kit==='summoner'?28:22;p.attack=p.t10SwingDuration;s.attackId++;
 const world=t10WorldPose(s),x=world.hand.x,y=world.hand.y,tx=target?target.x:x+aim.facing*220*sc,ty=target?target.y:y+Math.sin(aim.angle)*100*sc;
 p.t10PreviousBlade=null;
 if(!s.kit){p.cooldown=22;terraSound('swing',{volume:.72});if(!s.starCooldown){
  const sx=tx+((s.attackId%2)?-130:130)*sc,sy=Math.min(y,ty)-430*sc;
  const dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy)||1;
  r06Shoot(s,{type:'star',x:sx,y:sy,vx:dx/d*25*sc,vy:dy/d*25*sc,damage:44,life:100,angle:0,pierce:2,passY:ty,attackId:s.attackId});s.starCooldown=22;}}
 else if(s.kit==='melee'){p.cooldown=18;terraSound('swing',{volume:.55});for(let i=0;i<3;i++)r06Shoot(s,{type:'zenith',x,y,ox:x,oy:y,tx,ty,side:i-1,life:36,attackId:s.attackId,damage:190,skin:['zenith','starfury','sword'][i]});}
 else if(s.kit==='ranger'){p.cooldown=5;const start=world.end,a=Math.atan2(ty-start.y,tx-start.x),speed=18*sc;terraSound('gun',{volume:.38});r06Shoot(s,{type:'bullet',x:start.x,y:start.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,speed,life:110,damage:95});}
 else if(s.kit==='summoner'){p.cooldown=28;s.whipAge=0;s.whipId=s.attackId;terraSound('swing',{volume:.5});}
 evt('t10-weapon-use',{weapon:r06Weapon(s),source:aim.source,hand:world.hand,muzzle:world.end,rate:1});
}
r06Attack=t10Attack;r05Attack=t10Attack;
function t10HitArc(s,targets) {
 const p=s.p,pose=t10WorldPose(s),prev=p.t10PreviousBlade;
 if(p.attack>0&&pose.u>.12&&pose.u<.84){for(const t of targets){if(t.obj.r06Melee===s.attackId)continue;const box={x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h};
  if(segmentHits(pose.hand,pose.end,box,3*pose.scale)||prev&&segmentHits(prev.end,pose.end,box,4*pose.scale)){
   t.obj.r06Melee=s.attackId;r06DamageTarget(t,22,'starfury-blade');}
 }}p.t10PreviousBlade={hand:pose.hand,end:pose.end};
}
function t10PrismOrigin(s){return t10WorldPose(s,10,0).end;}
r06DrawProjectiles=function(s,c){const sc=t10Scale(s);ctx.save();ctx.imageSmoothingEnabled=false;
 for(const b of s.projectiles){
  for(let i=0;i<b.trail.length;i+=2){const t=b.trail[i];ctx.globalAlpha=(i+1)/b.trail.length*.32;ctx.fillStyle=b.type==='bullet'?'#88d95a':b.type==='zenith'?'#9cdeee':'#f2d774';ctx.fillRect(Math.round(t.x-c-sc),Math.round(t.y-sc),2*sc,2*sc);}
  ctx.globalAlpha=1;ctx.save();ctx.translate(Math.round(b.x-c),Math.round(b.y));
  if(b.type==='bullet'){ctx.rotate(Math.atan2(b.vy,b.vx));ctx.fillStyle='#78ba49';ctx.fillRect(-7*sc,-sc,10*sc,2*sc);ctx.fillStyle='#ddf5bc';ctx.fillRect(0,-sc,4*sc,2*sc);}
  else{const key=b.type==='zenith'?b.skin||'zenith':'star',im=r06Images[key]||photos[key];ctx.rotate((b.angle||0)+(b.type==='zenith'?Math.PI/4:0));if(im)ctx.drawImage(im,-im.width*sc/2,-im.height*sc/2,im.width*sc,im.height*sc);}
  ctx.restore();
 }
 const pose=t10WorldPose(s),p=s.p;
 if(s.kit==='mage'&&s.prismCharge>0){const origin=t10PrismOrigin(s),angle=p.attackFacing<0?Math.PI-p.aim:p.aim,charge=s.prismCharge/180,spread=(1-charge)*.18,colors=['#ee6262','#eeae64','#ece17d','#86d6a0','#7ccfe5','#bc8de0'];
  ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const an=angle+(i-2.5)*spread;ctx.strokeStyle=colors[i];ctx.globalAlpha=.75*(s.t17PrismFade??1);ctx.lineWidth=(1.5+charge*2.6)*sc;ctx.beginPath();ctx.moveTo(origin.x-c,origin.y);ctx.lineTo(origin.x-c+Math.cos(an)*1200*sc,origin.y+Math.sin(an)*1200*sc);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 }
 for(const m of s.minions||[]){const im=r06Images.terraprisma;if(!im)continue;for(let i=0;i<m.trail.length;i+=2){const t=m.trail[i];ctx.globalAlpha=i/m.trail.length*.2;ctx.drawImage(im,t.x-c-im.width*sc*.35,t.y-im.height*sc*.35,im.width*sc*.7,im.height*sc*.7);}ctx.globalAlpha=1;ctx.save();ctx.translate(m.x-c,m.y);ctx.rotate(m.angle+Math.PI/4);ctx.drawImage(im,-im.width*sc/2,-im.height*sc/2,im.width*sc,im.height*sc);ctx.restore();}
 if(s.kit==='summoner'&&s.whipAge>=0&&s.whipAge<28){const hand=pose.hand,a=p.attackFacing<0?Math.PI-p.aim:p.aim,len=Math.sin(s.whipAge/28*Math.PI)*240*sc;
  ctx.beginPath();ctx.strokeStyle='#dca0cf';ctx.lineWidth=2*sc;ctx.moveTo(hand.x-c,hand.y);for(let i=1;i<=14;i++){const u=i/14,bend=Math.sin(u*Math.PI)*Math.sin(s.whipAge/28*Math.PI*2)*25*sc;ctx.lineTo(hand.x-c+Math.cos(a)*len*u-Math.sin(a)*bend,hand.y+Math.sin(a)*len*u+Math.cos(a)*bend);}ctx.stroke();}
 for(const f of s.t10Particles||[]){ctx.globalAlpha=1-f.age/28;ctx.fillStyle=f.kind==='wood'?'#c18a50':f.kind==='gel'?'#6daafe':'#c97f78';ctx.fillRect(Math.round(f.x-c),Math.round(f.y),2*sc,2*sc);}ctx.globalAlpha=1;
 for(const f of s.r06FX||[]){if(f.type==='cloud'){ctx.globalAlpha=(1-f.age/32)*.8;ctx.fillStyle='#e1eaf5';for(let i=0;i<5;i++)ctx.fillRect(f.x-c-12+i*5+(i-2)*f.age*.15,f.y+Math.sin(i)*3+f.age*.35,8*sc,3*sc);}}
 ctx.restore();
};

// Original-audio event routing. Never alias a missing Terraria effect to Mario's bank.
const T10_SOUND_ROOT='https://raw.githubusercontent.com/FergusGriggs/Fegaria-Remastered/6adefebfe2e6a71aed05f289683474d88ce5d9f3/res/sounds/';
const T10_SOUND_FILES={death:'player_killed.wav',pickup:'grab.wav',coin:'coins.wav',gun:'gun_shot.wav',npcDeath:'npc_killed_0.wav',treeFell:'grass.wav',menu:'menu_open.wav',chat:'chat.wav',door:'door_opened.wav'};
const t10SoundStatus=Object.fromEntries(Object.keys(T10_SOUND_FILES).map(k=>[k,{state:'not-loaded',file:T10_SOUND_FILES[k],embedded:false}]));
const t10AudioHistory=[];let t10LoadingSounds=null,t10LoadEpoch=0;
async function t10LoadSounds(force=false){
 if(!audio)return;if(t10LoadingSounds&&!force)return t10LoadingSounds;
 const epoch=++t10LoadEpoch;
 t10LoadingSounds=Promise.all(Object.entries(T10_SOUND_FILES).map(async([key,file])=>{
  const st=t10SoundStatus[key];if(st.local||st.state==='ready')return;st.state='loading';
  const cached=await r08ReadCache('audio:t10:'+key);
  const candidates=[...(cached?.blob?[cached.blob]:[]),...r07MediaURLs(T10_SOUND_ROOT,file).reverse()];
  for(const source of candidates){try{
   let bytes;if(source instanceof Blob)bytes=await source.arrayBuffer();else{const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),6500);try{const response=await fetch(source,{signal:ctrl.signal});if(!response.ok)throw Error('HTTP '+response.status);bytes=await response.arrayBuffer();if(bytes.byteLength>4*1024*1024)throw Error('oversized');}finally{clearTimeout(timer);}}
   const buffer=await audio.decodeAudioData(bytes.slice(0));let peak=0;for(let ch=0;ch<buffer.numberOfChannels;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));}
   if(peak<1e-6)throw Error('silent data');if(st.local||epoch!==t10LoadEpoch)return;
   bank.set('trio13_'+key,{buffer,gain:Math.min(2,.72/peak)});Object.assign(st,{state:'ready',duration:buffer.duration,peak,origin:source instanceof Blob?'cache':'network'});
   if(!(source instanceof Blob))r08WriteCache('audio:t10:'+key,{blob:new Blob([bytes],{type:'audio/wav'}),kind:'original',savedAt:Date.now()});return;
  }catch(err){st.error=err.name||String(err);}}
  if(!st.local)st.state='unavailable';
 })).finally(()=>t10UpdateAudioStatus());return t10LoadingSounds;
}
const t10TerraBase=terraSound;
terraSound=function(key,options={}){
 const aliases={mount:'pickup',heal:'pickup',clear:'chat',flag:'chat',appear:'pickup',powerup:'pickup',bump:'break',pause:'menu',firework:'chat'};key=aliases[key]||key;
 if(!soundOn||!audio||document.hidden||mode==='paused'&&!options.ui)return 0;
 const entry=bank.get('trio13_'+key);t10AudioHistory.push({key,tick:state?.ticks||0,played:!!entry});if(t10AudioHistory.length>120)t10AudioHistory.shift();
 return entry?t10TerraBase(key,{...options,rate:1}):0;
};
sourceSound=function(key,options={}){if(isTrio()){if(['hurry','gameover','jump_small','jump_super'].includes(key))return 0;return terraSound(key,options);}return r07SourceSoundBase(key,options);};
const t10SoundOpen=openGame;
openGame=function(){t10SoundOpen();t10LoadSounds();r06MusicUnlocked=true;r06SyncMusic();};
const t10HurtArena=r05Hurt;
r05Hurt=function(amount,x){const before=state?.hp,ok=t10HurtArena(amount,x);if(before>0&&state?.hp===0)terraSound('death');return ok;};
const t10HitEye=r05HitEye;
r05HitEye=function(d,kind){const before=state?.bossClear;t10HitEye(d,kind);if(!before&&state?.bossClear){terraSound('npcDeath');terraSound('chat',{volume:.5});}};
const t10HealBase=r06Heal;
r06Heal=function(){const before=state?.hp;t10HealBase();if(state?.hp>before)terraSound('heal');};
$('r06Heal').onclick=()=>r06Heal();
const t10MusicSync=r06SyncMusic;
r06SyncMusic=function(){for(const t of Object.values(r06Music)){t.audio.playbackRate=1;t.audio.defaultPlaybackRate=1;t.audio.preservesPitch=true;}return t10MusicSync();};
// A failed IndexedDB open must not suppress a user's explicit audio unlock indefinitely.
setTimeout(()=>{for(const t of Object.values(r06Music))if(t.restorePending){t.restorePending=false;t.nextTry=0;}},2200);

const t10AudioButton=document.createElement('button');t10AudioButton.type='button';t10AudioButton.id='t10AudioEnable';t10AudioButton.textContent='启用 / 重试泰拉原声';
const t10SoundText=document.createElement('div');t10SoundText.id='t10SoundStatus';
r06Media.append(t10AudioButton,t10SoundText);
function t10UpdateAudioStatus(){
 const readyS=Object.values(t10SoundStatus).filter(s=>s.state==='ready'||s.local).length;
 const missing=Object.entries(t10SoundStatus).filter(([,s])=>s.state==='unavailable').map(([k])=>({death:'死亡',pickup:'拾取',coin:'金币',gun:'枪声',npcDeath:'敌人死亡',treeFell:'砍倒',menu:'菜单',chat:'提示',door:'开门'}[k]||k));
 t10SoundText.textContent='动作音：5 项内嵌；新增事件音 '+readyS+'/'+Object.keys(t10SoundStatus).length+' 已解码'+(missing.length?'。网络未取得：'+missing.join('、'):'')+'。原曲按 1.00× 播放，不做加速补偿。';
}
t10AudioButton.onclick=async()=>{audioInit();if(audio?.state==='suspended')await audio.resume();soundOn=true;r06MusicUnlocked=true;for(const t of Object.values(r06Music)){if(!t.local){t.sourceIndex=0;t.audio.src=t.urls[0];t.state='not-loaded';t.restorePending=false;}t.nextTry=0;t.busy=false;}await loadExtraAudio();t10LoadSounds(true);r06SyncMusic();t10UpdateAudioStatus();};
const t10Slot=$('r06MusicSlot');for(const [key,label] of Object.entries({death:'死亡',pickup:'拾取 / 骑乘',coin:'金币',gun:'枪声',npcDeath:'敌人死亡',treeFell:'砍倒树木',chat:'击败 / 结算提示'})){const o=document.createElement('option');o.value='sfx:'+key;o.textContent='音效 · '+label;t10Slot.appendChild(o);}
$('r06MusicImport').removeEventListener('change',r08ImportMedia);
$('r06MusicImport').addEventListener('change',async e=>{const key=t10Slot.value;if(!key.startsWith('sfx:'))return r08ImportMedia(e);const f=e.target.files?.[0];if(!f||f.size>4*1024*1024)return;audioInit();try{const buffer=await audio.decodeAudioData(await f.arrayBuffer()),k=key.slice(4);bank.set('trio13_'+k,{buffer,gain:1});Object.assign(t10SoundStatus[k],{state:'ready',local:true,duration:buffer.duration});t10UpdateAudioStatus();}catch{t10SoundText.textContent='导入的音效未能解码。';}});

// 1-3 now has exactly one playable identity. Previous episodes remain behind a separate button.
card.querySelector('strong').textContent='泰拉瑞亚';
const t10Small=card.querySelectorAll('small');if(t10Small[0])t10Small[0].textContent='WORLD 1-3 · 经典棕发角色';if(t10Small[1])t10Small[1].textContent='星怒 · 史莱姆 · 克苏鲁之眼';
stageChooser.querySelector('.trio-choice-title').innerHTML='泰拉瑞亚 · WORLD 1-3 <span>R10.1</span>';
stageChooser.querySelector('.r05-pending')?.remove();
const t10Style=document.createElement('style');t10Style.textContent=`
body.t10-terra-menu #heroPicker{display:block!important}body.t10-terra-menu #heroPicker [data-hero]:not([data-hero="sandboxTrio"]){display:none!important}
body.t10-terra-menu #heroPicker [data-hero="sandboxTrio"]{width:100%;min-height:65px!important;grid-template-columns:54px 1fr!important}
body.t10-terra-menu #heroPicker [data-hero="sandboxTrio"] strong{grid-row:auto!important;font-size:17px}
body.t10-terra-menu #heroPicker [data-hero="sandboxTrio"] canvas{width:40px!important;height:50px!important}
#t10Previous,#t10Helmet,#t10AudioEnable{font:inherit;font-size:11px;padding:6px 10px;border:1px solid #64777d;border-radius:5px;background:#20343d;color:#e3e9e4;margin:5px 6px 2px 0}
#t10Build{display:block;font:11px monospace;color:#d4e6be;padding:8px 0 2px}#t10SoundStatus{line-height:1.6;margin-top:8px}
`;
document.head.appendChild(t10Style);
const t10Previous=document.createElement('button');t10Previous.type='button';t10Previous.id='t10Previous';t10Previous.textContent='查看往期 1-1 / 1-2 角色';stageChooser.after(t10Previous);
t10Previous.onclick=()=>{document.body.classList.remove('t10-terra-menu');stageChooser.hidden=true;t10Previous.hidden=true;};
const t10HelmetButton=document.createElement('button');t10HelmetButton.type='button';t10HelmetButton.id='t10Helmet';t10HelmetButton.textContent='外观：显示经典棕发';r06SceneActions.appendChild(t10HelmetButton);
t10HelmetButton.onclick=()=>{t10Helmet=!t10Helmet;t10HelmetButton.textContent=t10Helmet?'外观：显示护甲头盔':'外观：显示经典棕发';render();};
const t10Build=document.createElement('span');t10Build.id='t10Build';t10Build.textContent='R10.1 · FACE / HILT / AUTO-MOUNT';document.querySelector('.screen-shell')?.appendChild(t10Build);
const t10UIBase=r06UpdateUI;
r06UpdateUI=function(){t10UIBase();if(!isTrio()){t10HelmetButton.hidden=true;return;}t10HelmetButton.hidden=false;$('bestLabel').textContent='R10.1';t10Previous.hidden=mode!=='menu';
 if(!state){$('overlayTitle').textContent='泰拉瑞亚 · 1-3';$('overlayText').textContent='本关只有泰拉瑞亚。星怒 / 铂金防御开局，原版玩家脸部和动作分层；拾取粘鞍后自动骑乘。';$('mainAction').textContent=r05EntryChoice?'进入克眼准备场 →':'开始泰拉瑞亚 1-3 →';}
 else{$('heroStatus').textContent='经典棕发 / '+(state.kit?r06Kit(state).armorName:'铂金护甲')+' · '+tools[state.tool]+' · 防御 '+r06Defense(state);$('heroHelp').textContent='J 使用当前武器；斧头按 3。外部问号砖掉粘鞍，拾取自动骑上史莱姆；低顶挡住时走到开阔处自动骑上。克眼胜利后碰到套装，自动换装并骑上 UFO。F 手动上下骑，V 切换已拥有坐骑。';$('relayMessage').textContent=state.t10MountBlocked?'已拾取坐骑：头顶空间不足，走出低顶后自动骑乘。':state.noticeTime?state.notice:'R10.1 · 仅泰拉瑞亚 1-3';}
 document.querySelector('header .offline').textContent='R10.1 · TERRARIA 1-3';
 const brand=document.querySelector('header .brand small');if(brand)brand.textContent='MARIO MIX / TERRARIA 1-3';
 const title=document.querySelector('.panel > h2');if(title)title.innerHTML='泰拉瑞亚，<br>闯进马里奥 1-3。';
 t10UpdateAudioStatus();
};
const t10MenuBase=showCharacters;
showCharacters=function(){t10MenuBase();document.body.classList.add('t10-terra-menu');selectHero(id);r06UpdateUI();};
// Wait only for the embedded character layers before making the default selection.
Promise.all([readyPromise,...r06AssetJobs.filter((_,i)=>false)]).then(()=>{if(mode==='menu'&&(!c23Campaign||c23Campaign.stage===13)){showCharacters();selectHero(id);portrait();render();}});
const t10Diagnostics={version:T10_VERSION,ready:Promise.all([t10Ready,t10SlimeJob]),pose:()=>state?t10WorldPose(state):null,roster:()=>state?.foes.map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,active:e.active,dead:e.dead})),audio:()=>({rate:Object.fromEntries(Object.entries(r06Music).map(([k,t])=>[k,t.audio.playbackRate])),status:t10SoundStatus,history:t10AudioHistory}),collect:()=>r07CollectSaddle(state),drawBody:(...args)=>r06DrawBody(...args),sound:terraSound,loadSounds:t10LoadSounds,requestMount:t10RequestMount,faceKeys:['skinHead','eyeWhite','eyeIris','hair'],mode:()=>mode};

// Final UI labels run after selectHero() as well as the throttled HUD. This prevents
// its inherited R06 intro from overwriting the new menu in the same event-loop turn.
card.innerHTML='<canvas width="64" height="80" aria-label="泰拉瑞亚经典棕发角色"></canvas><div class="t10-card-text"><strong>泰拉瑞亚</strong><small>WORLD 1-3 · 星怒 / 铂金防御</small><small>原版玩家分层 · 粘鞍拾取即骑乘</small></div>';
t10Style.textContent+='body.t10-terra-menu #heroPicker [data-hero="sandboxTrio"]{display:flex!important;gap:14px;padding:12px!important}body.t10-terra-menu #heroPicker [data-hero="sandboxTrio"] canvas{flex:0 0 44px;width:44px!important;height:55px!important;margin:0 4px!important}body.t10-terra-menu .t10-card-text{flex:1}body.t10-terra-menu .t10-card-text small{font-size:10px;line-height:1.7}';
portrait=function(){const g=card.querySelector('canvas').getContext('2d');g.clearRect(0,0,64,80);g.imageSmoothingEnabled=false;r06DrawBody(g,32,73,1,0,false,0,0,1,'platinum','starfury',1.5);};
function t10Labels(){if(!isTrio())return;
 const introduction='经典棕发角色、星怒与铂金防御。1-3 全程仅泰拉瑞亚；拾取粘鞍自动骑乘，克眼奖励接触即换装并骑上 UFO。';
 const p=document.querySelector('.panel > p.intro:first-of-type');if(p)p.textContent=introduction;
 if(mode==='menu'){$('overlayLabel').textContent='TERRARIA / WORLD 1-3';$('overlayTitle').textContent='泰拉瑞亚 · 1-3';$('overlayText').textContent=introduction;$('heroHelp').textContent='主线保留 1-3 的树冠、移动平台和终点。克眼准备场是可选隐藏挑战；本关不切换饥荒或我的世界。';$('heroStatus').textContent='默认：泰拉瑞亚 · WORLD 1-3';$('mainAction').textContent=r05EntryChoice?'进入克眼准备场 →':'开始泰拉瑞亚 1-3 →';}
 $('actionLabel').textContent=state?.tool===2?'砍伐 / 回收':'使用当前武器';$('jumpLabel').textContent='空格跳跃；↓＋空格下穿';$('fullButton').textContent='全屏';
}
const t10SelectBase=selectHero;
selectHero=function(v){const r=t10SelectBase(v);if(v===id){t10Labels();portrait();}return r;};
const t10LastUI=r06UpdateUI;
r06UpdateUI=function(){t10LastUI();t10Labels();};
Promise.all(r06AssetJobs.slice(0,7)).then(()=>{if(mode==='menu'&&isTrio()){portrait();t10Labels();}});
