/* R11 — one installed runtime; native face/hand layers; physical chest/pipe route. */
const T11_VERSION='R11 · 泰拉瑞亚 1-3';
t10Helmet=true;
r05EntryChoice=0;stageChoice=0;
const t11Log=[];
function t11Event(type,data={}) { t11Log.push({type,tick:state?.ticks,...data});if(t11Log.length>300)t11Log.shift();evt(type,data); }

// Equal-size episode cards. No practice-room or sandbox-trio entry in the menu.
t10Style.textContent='';
card.innerHTML='<canvas width="64" height="80" aria-label="铂金套泰拉瑞亚主角"></canvas><strong>泰拉瑞亚</strong><small>关卡 1-3</small>';
const t11Style=document.createElement('style');t11Style.textContent=`
#trioStageChooser,#t10Previous,#t10Helmet,#r06Return,#r06Natural,#r05AudioOptions{display:none!important}
#heroPicker{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:5px!important}
#heroPicker[hidden]{display:none!important}
#heroPicker [data-hero],body.t10-terra-menu #heroPicker [data-hero]{display:block!important;grid-column:auto!important;width:auto!important;min-height:143px!important;padding:8px 3px!important;text-align:center!important}
#heroPicker [data-hero] canvas{display:block!important;width:48px!important;height:60px!important;margin:2px auto 8px!important;image-rendering:pixelated}
#heroPicker [data-hero] strong{display:block!important;margin:5px 0!important;font-size:12px!important;white-space:nowrap}
#heroPicker [data-hero] small{display:block!important;font-size:8px!important;line-height:1.5!important}
#overlay.choosing .overlay-box{padding:14px 9px!important;width:100%!important;box-sizing:border-box!important}
#overlay.choosing h2{font-size:25px!important;margin:7px 0!important}
#overlay.choosing #overlayText{display:block!important;min-height:0!important;font-size:11px!important;margin:8px auto!important}
#overlay.choosing .eyebrow{display:block!important}
#t10Build{display:block;font:11px monospace;color:#d4e6be;padding:7px 0 2px}
#t11ChestAction{font:inherit;font-size:11px;padding:6px 10px;border:1px solid #697a84;border-radius:5px;background:#243848;color:#e7e7db}
@media(max-width:690px){#heroPicker{grid-template-columns:repeat(3,minmax(0,1fr))!important}#heroPicker [data-hero]{min-height:64px!important;padding:3px 1px!important}#heroPicker [data-hero] canvas{width:24px!important;height:30px!important;margin:0 auto!important}#heroPicker [data-hero] strong{font-size:9px!important;margin:1px!important}#heroPicker [data-hero] small{display:none!important}#overlay.choosing .eyebrow,#overlay.choosing #overlayText{display:none!important}#overlay.choosing h2{font-size:15px!important;margin:2px!important}#overlay.choosing .overlay-box{padding:5px!important}}
`;document.head.append(t11Style);
function t11Labels(){
 document.body.classList.remove('t10-terra-menu');$('overlay').classList.remove('r04-choose');stageChooser.hidden=true;t10Previous.hidden=true;t10HelmetButton.hidden=true;
 if(!isTrio())return;
 $('bestLabel').textContent='R11';t10Build.textContent='R11 · 铂金套 / 自动骑乘 / 箱子与管道';
 document.querySelector('header .offline').textContent='TERRARIA · 1-3';
 if(mode==='menu'){$('overlayLabel').textContent='MARIO MIX / CHAPTER 03';$('overlayTitle').textContent='选择角色';$('overlayText').textContent='泰拉瑞亚 · 1-3｜星怒与铂金套，进入熟悉的树冠关卡。';$('mainAction').textContent='开始冒险 →';$('heroStatus').textContent='默认：泰拉瑞亚 · 星怒 / 铂金套';}
 else $('heroStatus').textContent=(state.kit?r06Kit(state).armorName:'铂金套（含头盔）')+' · '+tools[state.tool]+' · 防御 '+r06Defense(state);
 $('heroHelp').textContent='方向移动，空格跳跃，J 攻击。粘鞍拾取即骑乘；F 上下骑。站在主线管道口按↓进入隐藏。箱子附近按↑或右键开箱。L 召唤克眼；战斗期间不能返回，胜利后从入口管道按↓钻回。';
 $('downLabel').textContent='管道↓ · 拾取眼球开战 · F 坐骑';
 $('r06Return').hidden=true;$('r06Natural').hidden=true;
 if(state?.r05Arena)$('relayMessage').textContent=state.phase==='battle'?'克苏鲁之眼战斗中：返回管道已锁定。':state.phase==='cleared'?'装备接触即换装并骑上 UFO；回到入口管道口按↓返回。':'入口木箱装有云朵瓶；靠近按↑或右键打开。按 L 召唤克眼。';
 else if(state&&!state.noticeTime)$('relayMessage').textContent='1-3 全程泰拉瑞亚 · 问号砖粘鞍拾取即骑乘';
 t11ChestButton.hidden=!state?.r05Arena;
 t11ChestButton.disabled=!!state?.t11Chest?.opened||!t11NearChest(state);
}
const t11UIBase=r06UpdateUI;r06UpdateUI=function(){t11UIBase();t11Labels();};
const t11SelectBase=selectHero;selectHero=function(v){const ok=t11SelectBase(v);r05EntryChoice=0;stageChoice=0;t11Labels();if(v===id)portrait();return ok;};
chooseStage=function(){r05EntryChoice=0;stageChoice=0;stageChooser.hidden=true;};
const t11OpenBase=openGame;openGame=function(){r05EntryChoice=0;stageChoice=0;t10Helmet=true;t11OpenBase();if(state){state.notice='星怒 / 铂金套开局 · 粘鞍拾取即骑乘';state.noticeTime=160;}};
const t11MenuBase=showCharacters;showCharacters=function(){t11MenuBase();r05EntryChoice=0;t11Labels();portrait();};
portrait=function(){const g=card.querySelector('canvas').getContext('2d');g.clearRect(0,0,64,80);g.imageSmoothingEnabled=false;
 // Static full-body sprite, independent of a preceding mounted game state.
 const oldState=state;try{state=null;r06DrawBody(g,32,76,1,0,false,0,0,1,'platinum','starfury',1.45);}finally{state=oldState;}
};

// Continuous scenery: no arbitrary 38px gaps cut into supporting trunks.
drawTerraTerrain=function(s){if(s.secret){drawTerraArenaTerrain(s);return;}const c=s.cam,l=s.level;
 const visible=l.surfaces.filter(q=>q.x<c+W+80&&q.x+q.w>c-80);
 for(const q of visible)if(q.type==='tree'){
  const x=q.x+q.w/2-4,bottom=Math.max(320,H+(s.r07CamY||0)+32);ctx.save();ctx.globalAlpha=.62;
  for(let y=q.y+12;y<bottom;y+=8)ctx.drawImage(tiles13.trunk,0,0,8,8,Math.round(x-c),y,8,8);ctx.restore();
 }
 for(const t of s.trees||[])drawChopTree(t,c);
 for(const q of visible.slice().sort((a,b)=>a.y-b.y)){
  if(q.type==='tree')for(let dx=0;dx<q.w;dx+=16){const width=Math.min(16,q.w-dx),im=tiles13[dx===0?'treeLeft':dx+16>=q.w?'treeRight':'treeMid'];ctx.drawImage(im,0,0,width,16,Math.round(q.x+dx-c),q.y,width,16);}
  else for(let x=q.x;x<q.x+q.w;x+=16)for(let y=q.y;y<q.y+q.h;y+=16)sprite(q.type==='floor'?'ground':'stone',x-c,y);
 }
};
// Readability follows the entire helmet and mount, not merely the collider center.
function t11Camera(s){
 if(!s||s.t11Transition)return;
 if(s.r05Arena){const wanted=clamp(s.p.y+s.p.h/2-R06_VIEW.h*.54,-540,-80);s.camY=approach(s.camY??-96,wanted,Math.max(3,Math.abs(s.p.vy)));return;}
 const p=s.p,visualTop=t10BodyFoot(s,p.y+p.h,.75)-41;
 const wanted=Math.min(0,visualTop-83);
 s.r07CamY=approach(s.r07CamY||0,wanted,Math.max(4,Math.abs(p.vy)+1));
 // Stop the HUD from clipping a rising helmet during an abrupt bounce.
 if(visualTop-(s.r07CamY||0)<34)s.r07CamY=visualTop-34;
}
function t11DrawPipe(q,c=0){if(!q)return;const x=Math.round(q.x-c),y=q.y;
 ctx.save();ctx.translate(x,y);for(let dy=16;dy<q.h;dy+=16)sprite('pipe_body',0,dy);sprite('pipe_top',0,0);ctx.restore();
}
drawTerraPipe=function(s){t11DrawPipe(s.pipe,s.cam);};
// No floating text or tooltip gets painted on either pipe.

function t11NearMouth(s){const p=s.p,q=s.pipe;if(!q)return false;const feet=p.y+p.h;
 return Math.abs(p.x+p.w/2-(q.x+q.w/2))<=q.w*.42&&Math.abs(feet-q.y)<=8;
}
function t11PrepareRoom(s){
 s.arenaReward=null;s.r06Drops=[];
 s.pipe={id:'t11-exit-pipe',type:'pipe',x:40,y:464,w:32,h:32,solid:true};
 s.level.surfaces=s.level.surfaces.filter(q=>q.id!=='t11-exit-pipe').concat(s.pipe);
 s.t11Chest={x:236,y:468,w:32,h:28,opened:!!s.cloudJump,age:0};
 s.campfires=s.campfires.filter(f=>Math.abs(f.x-252)>48||f.y!==496);
 s.lamps=s.lamps.filter(f=>Math.abs(f.x-252)>32||f.y!==496);
 s.direct=false;s.notice='靠近木箱按↑打开，取得云朵瓶。L 召唤克眼。';s.noticeTime=240;
 t11Event('t11-room-ready',{chest:true,pipe:true});
}
const t11EnterBase=enterTerraSecret,t11ExitBase=exitSecret;
function t11BeginPipe(direction){const s=state;
 if(!s||mode!=='playing'||s.t11Transition||s.interactLock>0||!t11NearMouth(s))return false;
 if(direction==='out'&&(!s.r05Arena||s.phase!=='cleared'||!s.bossClear)){
  t11Event('t11-exit-locked',{phase:s.phase});return false;}
 if(direction==='in'&&s.r05Arena)return false;
 const wasMounted=s.mounted,mount=s.mountType; s.t10PendingMount=null;s.mounted=false;r07SetMountHeight(s,false);
 const p=s.p,q=s.pipe;p.x=q.x+(q.w-p.w)/2;p.y=q.y-p.h;p.vx=0;p.vy=0;p.attack=0;p.grounded=false;p.support=null;
 s.t11Transition={direction,phase:'sink',age:0,startY:p.y,endY:q.y,wasMounted,mount};
 clearInput();t11Event('t11-pipe-start',{direction,wasMounted});return true;
}
enterTerraSecret=function(restart=false){
 if(restart){if(!state?.r05Arena)return false;const ok=t11EnterBase(true,false);if(ok)t11PrepareRoom(state);return ok;}
 return t11BeginPipe('in');
};
exitSecret=function(){return t11BeginPipe('out');};
function t11TickPipe(){
 const s=state,t=s.t11Transition;if(!t)return false;
 s.ticks++;frame++;t.age++;const u=clamp(t.age/30,0,1);s.p.y=t.startY+(t.endY-t.startY)*(u*u*(3-2*u));s.p.vx=s.p.vy=0;
 if(t.age<30)return true;
 if(t.phase==='sink'){
  let ok=false;if(t.direction==='in'){ok=t11EnterBase(false,false);if(ok)t11PrepareRoom(state);}else ok=t11ExitBase();
  if(!ok){s.t11Transition=null;return true;}
  const next=state,q=next.pipe,p=next.p;next.t10PendingMount=null;next.mounted=false;r07SetMountHeight(next,false);
  p.x=q.x+(q.w-p.w)/2;p.y=q.y;p.vx=p.vy=0;p.attack=0;p.grounded=false;p.support=null;
  next.interactLock=90;next.t11Transition={direction:t.direction,phase:'rise',age:0,startY:q.y,endY:q.y-p.h,wasMounted:t.wasMounted,mount:t.mount};
  next.cam=next.r05Arena?0:clamp(p.x-110,0,next.level.width-W);if(!next.r05Arena)next.r07CamY=0;
 }else{
  const p=s.p,q=s.pipe;p.y=q.y-p.h;p.grounded=true;p.support=q.id;p.coyote=6;p.cloudAvailable=!!s.cloudJump;p.invuln=Math.max(90,p.invuln||0);s.t11Transition=null;s.interactLock=45;
  if(t.wasMounted)t10RequestMount(s,t.mount,'pipe-emerge');
  t11Camera(s);clearInput();t11Event('t11-pipe-complete',{direction:t.direction,area:s.r05Arena?'arena':'main',mounted:s.mounted});
 }
 return true;
}
terraInteractions=function(v){const s=state;for(const t of s.trees||[]){if(t.shake)t.shake--;if(t.fall&&t.fall<42)t.fall++;}
 if(s.interactLock)s.interactLock--;
 if(!s.secret&&v.y>.5&&!v.jump&&t11NearMouth(s))return t11BeginPipe('in');return false;
};

function t11NearChest(s){const q=s?.t11Chest,p=s?.p;if(!q||!p||s.t11Transition)return false;return Math.abs(p.x+p.w/2-q.x-q.w/2)<58&&Math.abs(p.y+p.h-(q.y+q.h))<44;}
function t11OpenChest(){const s=state,q=s?.t11Chest;if(!q||q.opened||mode!=='playing'||!t11NearChest(s))return false;
 q.opened=true;q.age=0;r06CollectCloud(s);terraSound('door');t11Event('t11-chest-opened',{reward:'cloudBottle'});r05Persist();return true;
}
const t11ChestButton=document.createElement('button');t11ChestButton.id='t11ChestAction';t11ChestButton.type='button';t11ChestButton.textContent='↑ · 打开木箱';t11ChestButton.onclick=()=>{t11OpenChest();canvas.focus({preventScroll:true});};r06SceneActions.append(t11ChestButton);
canvas.addEventListener('contextmenu',e=>{if(state?.r05Arena&&t11NearChest(state)){e.preventDefault();t11OpenChest();}});
canvas.addEventListener('pointerdown',e=>{if(e.button===2&&state?.r05Arena&&t11NearChest(state)){e.preventDefault();t11OpenChest();}},true);
function t11DrawChest(s,c){const q=s.t11Chest,im=r06Images.chestItem;if(!q||!im)return;const x=q.x-c;
 // Checked native Item_48 image; kept at 32x28, never upscaled into a fake atlas.
 if(!q.opened)ctx.drawImage(im,x,q.y,32,28);
 else{ctx.drawImage(im,0,10,32,18,x,q.y+10,32,18);ctx.drawImage(im,0,0,32,10,x,q.y-3,32,10);}
 if(q.opened&&q.age<90){const bottle=r06Images.cloudBottle;if(bottle){ctx.save();ctx.globalAlpha=Math.min(1,(90-q.age)/20);ctx.drawImage(bottle,q.x+6-c,q.y-26-Math.min(18,q.age*.4),20,26);ctx.restore();}}
}

// Closed mouth is solid in both ordinary and mounted movement. No walking through pipe walls.
const t11PhysicsBase=r05Physics;
r05Physics=function(v){const s=state,p=s.p,old={x:p.x,y:p.y,w:p.w,h:p.h};t11PhysicsBase(v);const q=s.pipe;if(!q||s.t11Transition)return;
 if(near(p,q)){
  if(old.y+old.h<=q.y+1&&p.vy>=0){p.y=q.y-p.h;p.vy=0;p.grounded=true;p.support=q.id;}
  else if(old.x+old.w<=q.x+1){p.x=q.x-p.w;p.vx=0;}
  else if(old.x>=q.x+q.w-1){p.x=q.x+q.w;p.vx=0;}
  else if(old.y>=q.y+q.h-1){p.y=q.y+q.h;p.vy=Math.max(0,p.vy);}
 }
};
const t11MainStepBase=r04MainStep;
r04MainStep=function(v){if(state?.t11Transition){if(mode==='playing')t11TickPipe();return;}const s=state;t11MainStepBase(v);if(state===s)t11Camera(s);};
const t11ArenaStepBase=r05ArenaStep;
r05ArenaStep=function(v){const s=state;if(!s||mode!=='playing')return;
 if(s.t11Transition){t11TickPipe();return;}
 if(v.y>.5&&!v.jump&&t11NearMouth(s)&&!s.interactLock){if(t11BeginPipe('out'))return;}
 if(v.y<-.5&&!v.jump)t11OpenChest();
 // Never pass the old unrestricted exit gesture to the inherited arena loop.
 const safe={...v,auxEdge:!!v.auxEdge&&s.phase==='preparation'&&v.y<=0};t11ArenaStepBase(safe);
 if(state===s){if(s.t11Chest?.opened)s.t11Chest.age++;t11Camera(s);}
};
// Guard direct DOM callbacks as well as keyboard routes.
$('r06Return').onclick=()=>false;
const t11SummonBase=r05Summon;r05Summon=function(){if(state?.t11Transition)return false;return t11SummonBase();};
$('r06Summon').onclick=()=>{r05Summon();canvas.focus({preventScroll:true});};

// During pipe motion only the part above the rim is visible, for player and weapon together.
const t11DrawBodyBase=r06DrawBody;
r06DrawBody=function(g,x,foot,...args){const s=state,clip=g===ctx&&!!s?.t11Transition;if(clip){g.save();g.beginPath();g.rect(-10000,-10000,20000,10000+s.pipe.y+1);g.clip();}
 t11DrawBodyBase(g,x,foot,...args);if(clip)g.restore();};

r06DrawArena=function(){const s=state,p=s.p,c=s.cam,yc=s.camY??-96;r05Viewport(true);ctx.clearRect(0,0,R06_VIEW.w,R06_VIEW.h);r06NightBackground(s);ctx.save();ctx.translate(0,-yc);
 ctx.fillStyle='#443a35';ctx.fillRect(0,496,R06_VIEW.w,640);ctx.fillStyle='#52653d';ctx.fillRect(0,496,R06_VIEW.w,3);
 ctx.fillStyle='#695342';for(let x=-(Math.floor(c)%32);x<R06_VIEW.w;x+=32){ctx.fillRect(x+3,509,16,3);ctx.fillRect(x+17,525,10,3);}
 for(const q of s.level.surfaces)if(q.oneWay)r05DrawWood(q,c);
 for(const f of s.campfires)if(f.x-c>-130&&f.x-c<R06_VIEW.w+130)r07Furniture('campfire',f.x-c,f.y,s.ticks,f.phase);
 for(const t of s.lamps)if(t.x-c>-110&&t.x-c<R06_VIEW.w+110)r07Furniture('torch',t.x-c,t.y,s.ticks,t.phase);
 t11DrawChest(s,c);t11DrawPipe(s.pipe,c);
 if(s.phase==='preparation'){sheet(ctx,'suspiciousEye',[0,0,30,20],161-c,466+Math.sin(s.ticks*.055)*2,30,20);}
 if(s.eye&&!s.eye.dead&&['charge','fastDash'].includes(s.eye.mode))for(let i=0;i<s.eye.trail.length;i+=3){ctx.save();ctx.globalAlpha=i/s.eye.trail.length*.2;r05DrawEye({...s.eye,...s.eye.trail[i],flash:0},c);ctx.restore();}
 for(const m of s.servants)r05DrawServant(m,c);r05DrawEye(s.eye,c);r07DrawLoot(s,c);r06DrawProjectiles(s,c);r06DrawMount(s,c);
 if(s.t11Transition||!(p.invuln&&Math.floor(s.ticks/4)%2))r06DrawBody(ctx,p.x+p.w/2-c,p.y+p.h,p.attack?p.attackFacing:p.facing,p.grounded&&Math.abs(p.vx)>.1?p.walk:0,!p.grounded,p.attack,0,1,r06Armor(s),r06Weapon(s),1);
 if(s.t11Transition)t11DrawPipe(s.pipe,c);
 for(const n of s.numbers){ctx.save();ctx.globalAlpha=Math.min(1,n.life/12);r05Text(n.text,n.x-c,n.y,16,n.color,'center');ctx.restore();}
 ctx.restore();r07HUD(s);trioUI();
};
r04PauseHelp=function(){return state?.r05Arena?'空格跳跃，↓＋空格下穿，J 攻击，L 召唤，H 治疗。靠近木箱按↑打开。战斗期间不能返回；胜利后站在入口管道口按↓钻回。':'星怒 / 铂金套。空格跳跃，J 攻击，1/2/3 切工具。外部问号砖的粘鞍拾取即骑乘。站在管道口按↓进入隐藏。';};
const t11Diagnostics={version:T11_VERSION,log:()=>t11Log,helmet:()=>t10Helmet,nearMouth:()=>state&&t11NearMouth(state),nearChest:()=>t11NearChest(state),chest:()=>state?.t11Chest,transition:()=>state?.t11Transition,openChest:t11OpenChest,
 layers:()=>['skinHead','eyeWhite','eyeIris','hair','skinBody','platinumHead'],ready:Promise.all(r06AssetJobs)};
Promise.all([readyPromise,...r06AssetJobs.slice(0,9)]).then(()=>{if(mode==='menu'&&(!c23Campaign||c23Campaign.stage===13)){selectHero(id);t11Labels();portrait();render();}});
// Asset jobs may settle after the first menu paint. Repaint the complete portrait once decoded.
Promise.all(r06AssetJobs).then(()=>{if(mode==='menu'&&isTrio()){portrait();t11Labels();}});
const t11LateLabels=t11Labels;
t11Labels=function(){t11LateLabels();document.body.classList.toggle('t11-terra',isTrio());if(!isTrio())return;
 if($('relayStart'))$('relayStart').hidden=true;
 const intro=document.querySelector('.panel > p.intro:first-of-type');if(intro)intro.textContent='星怒与铂金全套（含头盔）。1-3 全程泰拉瑞亚；粘鞍拾取即骑乘，隐藏战胜利后从原管道返回。';
 if(mode==='menu'){$('stateLabel').textContent='选择角色';$('distanceLabel').textContent='WORLD 1-3';$('relayMessage').textContent='默认泰拉瑞亚 · 点击开始进入 1-3 主线。隐藏战仅从关卡管道进入。';}
 $('moveLabel').textContent='方向移动';$('downLabel').parentElement.lastElementChild.innerHTML='<kbd>↓</kbd> <kbd>↑</kbd> <kbd>F</kbd>';
 const foot=document.querySelector('.source-note');if(foot&&foot.textContent.includes('不接力'))foot.textContent='混合马里奥 · 泰拉瑞亚 1-3';
};
t11Style.textContent+='body.t11-terra #relayStart{display:none!important}';
// The added hotbar/hearts occupied y=34..80, exactly where original 1-3 high platforms live.
// Keep only the classic 32px scoreboard on the canvas; equipment is shown in the side panel.
drawEquipment=function(){};
const t11ReadableCamera=t11Camera;
t11Camera=function(s){if(!s||s.r05Arena||s.t11Transition)return t11ReadableCamera(s);const p=s.p,top=t10BodyFoot(s,p.y+p.h,.75)-41,wanted=Math.min(0,top-43);s.r07CamY=approach(s.r07CamY||0,wanted,Math.max(4,Math.abs(p.vy)+1));if(top-s.r07CamY<34)s.r07CamY=top-34;};
const t11StateBase=newState;
newState=function(){const s=t11StateBase();if(!s.secret){
 // Optional harvest trees must fit above their support without intersecting the scoreboard.
 s.trees=s.trees.filter(t=>t.y>=80).map(t=>({...t,h:Math.min(t.h,t.y-58)}));
 }return s;};
const t11StatusLabels=t11Labels;
t11Labels=function(){t11StatusLabels();if(!isTrio()||!state)return;
 $('heroStatus').textContent=(state.kit?r06Kit(state).armorName:'铂金全套')+' · '+tools[state.tool]+' · 生命 '+state.hp+'/'+state.maxHp+' · 木材 '+state.wood;
};
// Thumbnail readiness depends only on embedded sprites, never on optional remote music/scenery.
Promise.all([readyPromise,...r06AssetJobs.filter((_,i)=>!!R06_ASSET_DATA[Object.keys(R06_IMAGE_PATHS)[i]])]).then(()=>{if(mode==='menu'&&isTrio()){portrait();t11Labels();}});

/* R12 — append once inside the existing Terraria closure, after R11, before dispatch.
   Mainline colliders and the four complete arena lanes remain unchanged. */
const T12_VERSION='R12 · 泰拉瑞亚 1-3';
const T12_ART_PROFILE=Object.freeze({guardianFrameHeight:92,guardianFrames:2,terrain:'native Terraria dirt pixels; browser-composed grass and night forest',armor:'native torso/head source crops plus complete 20-frame leg atlases'});
const t12Events=[];
function t12Event(type,data={}){t12Events.push({tick:state?.ticks,type,...data});if(t12Events.length>400)t12Events.shift();evt(type,data);}
const t12Style=document.createElement('style');
t12Style.textContent=`
#t11ChestAction,#r06Summon,#r06Natural{display:none!important}
#t12Toolbar[hidden]{display:none!important}
#t12Toolbar{display:flex;align-items:stretch;gap:7px;padding:9px 4px 5px;flex-wrap:wrap}
#t12Toolbar button{position:relative;display:flex;align-items:center;gap:7px;flex:1 1 95px;min-height:52px;padding:5px 9px;border:2px solid #66748c;border-radius:6px;background:#172942;color:#e1e7ed;font:12px inherit;cursor:pointer;text-align:left}
#t12Toolbar button[aria-pressed=true]{border-color:#f6d986;background:#38435c;box-shadow:inset 0 0 0 1px #b29e65}
#t12Toolbar button:disabled{opacity:.48;cursor:default}
#t12Toolbar canvas{width:34px;height:34px;image-rendering:pixelated;flex:none}
#t12Toolbar small{display:block;font-size:10px;color:#b9c8d7;margin-top:3px}
#t12Status{flex-basis:100%;font-size:11px;line-height:1.5;color:#bdcec4;padding:2px 4px}
#t12Toolbar kbd{position:absolute;right:5px;top:3px;font-size:9px;opacity:.7}
`;
document.head.append(t12Style);
const t12Toolbar=document.createElement('div');t12Toolbar.id='t12Toolbar';t12Toolbar.setAttribute('role','group');t12Toolbar.setAttribute('aria-label','泰拉瑞亚武器与工具');
t12Toolbar.innerHTML=[0,1,2].map((n)=>`<button type="button" data-t12-tool="${n}" aria-pressed="${n===0}"><canvas width="40" height="40"></canvas><span><b></b><small></small></span><kbd>${n+1}</kbd></button>`).join('')+'<div id="t12Status"></div>';
t10Build.before(t12Toolbar);
for(const b of t12Toolbar.querySelectorAll('button'))b.addEventListener('click',()=>{
 if(!state||mode!=='playing')return;const n=Number(b.dataset.t12Tool);if(state.r05Arena&&n!==0)return;
 r05CancelPointer();clearInput();r06DigitTool(n);t12UI();canvas.focus({preventScroll:true});render();
});
let t12BarKey='';
function t12UI(){
 const s=state;t12Toolbar.hidden=!isTrio()||!s||mode==='menu';if(!isTrio())return;
 $('bestLabel').textContent='R12';t10Build.textContent='R12 · 原式平台 / 自动宝箱 / 拾取召唤';document.querySelector('header .offline').textContent='TERRARIA · 1-3';
 $('r06Summon').hidden=true;t11ChestButton.hidden=true;
 if(!s){$('overlayText').textContent='泰拉瑞亚 · 1-3｜星怒与铂金套；隐藏宝箱自动弹出奖励，拾取最右侧可疑眼球开战。';return;}
 r06SyncKitTools();const key=[s.tool,s.wood,s.t12Blade,s.kit,s.r05Arena,s.hp,s.maxHp,r08ImageRevision,!!s.t12Stealth,s.shield,(s.t12Boosts||[]).map(b=>b.level).join(',')].join('|');
 if(key!==t12BarKey){t12BarKey=key;const keys=[r06Weapon(s),'wood','axe'],names=[tools[0],'木平台','铜斧'];
  t12Toolbar.querySelectorAll('button').forEach((b,n)=>{b.setAttribute('aria-pressed',String(n===s.tool));b.disabled=!!s.r05Arena&&n!==0;b.querySelector('b').textContent=names[n];b.querySelector('small').textContent=n===0?'J 使用 · E 切换':n===1?(s.r05Arena?'战场已铺好':s.wood+' 块 · J 放置'):(s.r05Arena?'战场无需砍伐':'J 砍树 / 回收');const g=b.querySelector('canvas').getContext('2d');g.clearRect(0,0,40,40);g.imageSmoothingEnabled=false;r06Icon(g,keys[n],20,20,34);});
 }
 const kit=s.kit,bonus=kit==='melee'?'日耀护盾 '+s.shield+'/3 · 双击左右冲刺':kit==='ranger'?'双击↓切换星旋隐身'+(s.t12Stealth?'（已启用）':''):kit==='mage'?'星云强化 '+(s.t12Boosts||[]).map((b,i)=>['伤害','生命','魔力'][i]+':'+b.level).join(' / '):kit==='summoner'?'星尘守卫 · 六把泰拉棱镜自动迎敌':'';
 $('t12Status').textContent='生命 '+s.hp+'/'+s.maxHp+' · '+(kit?r06Kit(s).armorName:'铂金全套')+' · '+(s.cloudJump?'云朵瓶：空中再按跳跃':'云朵瓶：隐藏宝箱')+(bonus?' · '+bonus:'');
 $('heroHelp').textContent='1/2/3 或点击下方栏切换武器、平台、斧头；E 循环，J 使用。管道口↓进入隐藏。宝箱自动弹出云朵瓶、泰拉刃、可疑眼球；前两件取完，再碰最右侧眼球即可开战。战后从原管道↓返回。';
 if(s.r05Arena){$('relayMessage').textContent=s.phase==='preparation'?'宝箱自动打开：先取左侧云朵瓶和中间泰拉刃，最后碰最右侧可疑眼球。':s.phase==='battle'?'克苏鲁之眼战斗中 · 管道已封锁；胜利后由原管道返回。':'四套职业装备接触即穿上并骑 UFO；原管道口↓返回。';}
}
const t12UIBase=r06UpdateUI;r06UpdateUI=function(){t12UIBase();t12UI();};
r06SyncKitTools=function(){tools[0]=r06Kit(state)?.weaponName||(state?.t12Blade?'泰拉刃':'星怒');};

// Restore the actual 1-3 silhouette: full cap tiles and broad tiled supports, not an 8px pole.
drawTerraTerrain=function(s){if(s.secret){drawTerraArenaTerrain(s);return;}const c=s.cam,vis=s.level.surfaces.filter(q=>q.x<c+W+90&&q.x+q.w>c-90),bottom=Math.max(336,H+(s.r07CamY||0)+48);
 for(const q of vis)if(q.type==='tree'){
  const left=q.x+16,width=q.w-32;if(width<=0)continue;
  for(let x=left;x<left+width;x+=8)for(let y=q.y+16;y<bottom;y+=8)ctx.drawImage(tiles13.trunk,0,0,Math.min(8,left+width-x),8,Math.round(x-c),y,Math.min(8,left+width-x),8);
 }
 // Trees are background decoration/harvestables. ALL platform faces are composited afterward.
 for(const t of s.trees||[])drawChopTree(t,c);
 for(const q of vis.slice().sort((a,b)=>a.y-b.y)){
  if(q.type==='tree')for(let dx=0;dx<q.w;dx+=16){const w=Math.min(16,q.w-dx),im=tiles13[dx===0?'treeLeft':dx+16>=q.w?'treeRight':'treeMid'];ctx.drawImage(im,0,0,w,16,Math.round(q.x+dx-c),q.y,w,16);}
  else for(let x=q.x;x<q.x+q.w;x+=16)for(let y=q.y;y<q.y+q.h;y+=16)sprite(q.type==='floor'?'ground':'stone',x-c,y);
 }
};
// Deterministic pixel scenery caches. Native sheets replace these fallbacks when present.
const t12TreeCache=new Map();
// Two original Terraria crown atlases, each with three native variants. No palette-swapped fake species.
function t12TreeImage(kind){
 const key=kind+'@'+r08ImageRevision;if(t12TreeCache.has(key))return t12TreeCache.get(key);
 const snowy=kind==='boreal',source=r06Images[snowy?'t12TreeTop':'t12ForestTop'];
 const cv=document.createElement('canvas');cv.width=96;cv.height=132;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 if(!source)return cv;
 const frame=kind==='forest2'?2:kind==='boreal'?1:0,sx=frame*82;
 // Extend the original trunk at the crown's bottom; no unrelated inventory-icon texture.
 for(let y=72;y<132;y+=8)g.drawImage(source,sx+34,70,14,8,42,y,14,Math.min(8,132-y));
 g.drawImage(source,sx,0,80,80,8,0,80,80);
 t12TreeCache.set(key,cv);return cv;
}
function t12DrawTree(g,t,c=0,scale=1){const im=r06Images['t12Tree_'+t.variant],x=t.x-c;
 const total=t.visualH||60,w=(im?im.width/Math.max(1,im.height):96/132)*total;
 g.save();g.translate(Math.round(x),Math.round(t.y));if(t.shake)g.rotate(Math.sin(t.shake*1.6)*.035);if(t.fall){g.rotate((t.fallDir||1)*Math.min(1.5,(t.fall/42)**2*1.5));g.globalAlpha=Math.max(0,1-t.fall/45);}
 if(t.hp<=0&&t.fall>=42){g.fillStyle='#795236';g.fillRect(-3,-4,6,4);g.restore();return;}
 const image=im||t12TreeImage(t.variant);g.drawImage(image,Math.round(-w*scale/2),Math.round(-total*scale),Math.round(w*scale),Math.round(total*scale));g.restore();
}
drawChopTree=function(t,c){if(t.x-c<-100||t.x-c>W+100)return;t12DrawTree(ctx,t,c);};
function t12Init(s,base=null){s.t12Blade=!!(base?.t12Blade??s.t12Blade);s.t12Boosts=[0,1,2].map(()=>({level:0,time:0}));s.t12BoostDrops=[];s.t12Stealth=false;s.t12Dash=0;s.t12Tap={x:0,y:0,left:-1000,right:-1000,down:-1000};s.t12Guardian={x:s.p.x-40,y:s.p.y-30,age:0,attack:0};s.t12Hits=0;s.t12RoomTicks=0;}
const t12NewBase=newState;newState=function(){const s=t12NewBase();t12Init(s);if(!s.secret){s.trees=(s.trees||[]).map((t,i)=>({...t,variant:['forest','boreal','forest2'][i%3],visualH:Math.max(28,Math.min(63,t.y-38)),h:Math.max(20,Math.min(40,t.y-55))}));}return s;};
const t12CopyBase=r06CopyLoadout;r06CopyLoadout=function(from,to){t12CopyBase(from,to);to.t12Blade=!!from.t12Blade;};

// Automatic chest opening, three independently collectible objects. Summon item is rightmost.
const t12PrepareBase=t11PrepareRoom;
t11PrepareRoom=function(s){t12PrepareBase(s);t12Init(s,mainState);s.t11Chest.opened=false;s.t11Chest.age=0;s.t12RoomTicks=0;
 s.t12Supplies=[{kind:'cloudBottle',label:'云朵瓶',tx:180,done:!!s.cloudJump},{kind:'terraBlade',label:'泰拉刃',tx:276,done:!!s.t12Blade},{kind:'suspiciousEye',label:'可疑眼球',tx:390,done:s.phase==='cleared'}].map((d,i)=>({...d,x:252,y:465,w:24,h:24,age:0,launched:false,grounded:false,index:i}));
 if(s.phase==='cleared'){s.t11Chest.opened=true;for(const d of s.t12Supplies)d.done=true;}
 s.notice='宝箱自动开启，先取云朵瓶和泰拉刃，最后拾取右侧可疑眼球。';s.noticeTime=230;s.r06Natural=0;};
function t12Open(){const s=state;if(!s?.r05Arena||s.t11Transition||mode!=='playing')return false;const q=s.t11Chest;if(!q||q.opened)return false;q.opened=true;q.age=0;for(const d of s.t12Supplies||[])d.launched=true;terraSound('door');t12Event('chest-interact-open',{items:(s.t12Supplies||[]).filter(d=>!d.done).map(d=>d.kind)});return true;}
t11OpenChest=t12Open;
const t12SummonBase=r05Summon;
r05Summon=function(){if(!state?.t12SummonGate)return false;return t12SummonBase();};
$('r06Summon').onclick=()=>false;r06NaturalArrival=function(){return false;};
function t12SuppliesStep(s){if(s.t11Transition||s.phase==='cleared')return;s.t12RoomTicks++;
 /* R17: supply chest requires the interact action. */
 if(!s.t11Chest.opened)return;
 for(const d of s.t12Supplies){if(d.done||!d.launched)continue;d.age++;const u=Math.min(1,d.age/24);d.x=252+(d.tx-252)*(u*u*(3-2*u));d.y=u<1?454-60*Math.sin(u*Math.PI):474;d.grounded=u===1;
  if(d.age<12)continue;const box={x:d.x-14,y:d.y-12,w:28,h:32};if(!near(s.p,box))continue;
  if(d.kind==='suspiciousEye'&&(!s.cloudJump||!s.t12Blade)){if(s.ticks%60===0)note('先拿左侧云朵瓶和中间泰拉刃，再碰可疑眼球。');continue;}
  d.done=true;terraSound('pickup');
  if(d.kind==='cloudBottle')r06CollectCloud(s);
  else if(d.kind==='terraBlade'){s.t12Blade=true;s.tool=0;s.p.attack=0;s.p.cooldown=0;s.starCooldown=0;r06SyncKitTools();r06Chat('获得泰拉刃！已替换星怒。','#b9f7bd');}
  else{s.t12SummonGate=true;const ok=r05Summon();s.t12SummonGate=false;if(!ok){d.done=false;continue;}}
  t12Event('chest-pickup',{kind:d.kind,phase:s.phase});r05Persist();
 }
}
function t12DrawChest(s,c){const q=s.t11Chest;if(!q)return;const placed=r06Images.t12Chest,icon=r06Images.chestItem;
 if(placed){const fy=q.opened?38:0;ctx.drawImage(placed,0,fy,32,32,Math.round(q.x-c),464,32,32);}else if(icon){if(!q.opened)ctx.drawImage(icon,q.x-c,q.y,32,28);else{ctx.drawImage(icon,0,10,32,18,q.x-c,q.y+10,32,18);ctx.drawImage(icon,0,0,32,10,q.x-c,q.y-3,32,10);}}
 for(const d of s.t12Supplies||[]){if(d.done||!d.launched)continue;const bob=d.grounded?Math.sin((s.ticks+d.index*9)*.055)*2:0,x=d.x-c,y=d.y+bob,im=r06Images[d.kind]||photos[d.kind];ctx.save();ctx.globalAlpha=.22;ctx.fillStyle=d.index===2?'#df8e9a':d.index===1?'#7cddad':'#b8d0f5';ctx.beginPath();ctx.ellipse(x,d.y+19,15,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;if(im){const sc=Math.min(28/im.width,28/im.height);ctx.drawImage(im,Math.round(x-im.width*sc/2),Math.round(y-im.height*sc/2),im.width*sc,im.height*sc);}if(Math.abs(s.p.x+s.p.w/2-d.x)<65)r05Text(d.label,x,y-30,11,'#ede9cf','center');ctx.restore();}
}

// The supply chest's Terra Blade uses a native weapon sprite, straight green beams and finite pierce.
T10_ITEMS.terraBlade={grip:[6,47],tip:[40,5],scale:1,style:'swing'};
const t12AttackBase=r06Attack;
r06Attack=function(v={}){const s=state;if(!s.t12Blade||s.kit)return t12AttackBase(v);const p=s.p;if(p.cooldown>0)return;const aim=r06Arm(s,v),sc=t10Scale(s);p.t10SwingDuration=20;p.attack=20;p.cooldown=20;p.t10PreviousBlade=null;s.attackId++;
 const pose=t10WorldPose(s),a=aim.facing<0?Math.PI-aim.angle:aim.angle,x=pose.hand.x+Math.cos(a)*13*sc,y=pose.hand.y+Math.sin(a)*13*sc;
 r06Shoot(s,{type:'terraBlade',x,y,vx:Math.cos(a)*12*sc,vy:Math.sin(a)*12*sc,damage:90,life:90,angle:a,pierce:3});terraSound('swing',{volume:.6});t12Event('terra-blade-use',{hand:pose.hand,angle:a});};
r05Attack=function(v){return r06Attack(v);};
const t12ArcBase=t10HitArc;t10HitArc=function(s,targets){if(!s.t12Blade||s.kit)return t12ArcBase(s,targets);const p=s.p,pose=t10WorldPose(s),previous=p.t10PreviousBlade;if(p.attack>0&&pose.u>.10&&pose.u<.85){for(const t of targets){if(t.obj.r06Melee===s.attackId)continue;const box={x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h};if(segmentHits(pose.hand,pose.end,box,4*pose.scale)||previous&&segmentHits(previous.end,pose.end,box,5*pose.scale)){t.obj.r06Melee=s.attackId;r06DamageTarget(t,85,'terra-blade-melee');}}}p.t10PreviousBlade={hand:pose.hand,end:pose.end};};

// Set mechanics are implemented in this browser engine; source art is never substituted by recoloured Platinum.
const t12DamageBase=r06DamageTarget;
r06DamageTarget=function(target,damage,kind){const s=state;if(!target||target.obj.dead)return;
 if(s.kit==='ranger'&&s.t12Stealth)damage=Math.round(damage*1.8);
 if(s.kit==='mage'&&s.t12Boosts)damage=Math.round(damage*(1+.15*s.t12Boosts[0].level));
 t12DamageBase(target,damage,kind);
 if(s.kit==='mage'&&kind!=='nebula-booster'&&++s.t12Hits%4===0&&s.t12BoostDrops.length<15){const k=Math.floor(s.t12Hits/4)%3;s.t12BoostDrops.push({kind:k,x:target.x,y:target.y,vx:Math.sin(s.ticks)*1.5,vy:-1,age:0});}
};
function t12ClassStep(s,v){if(!s.t12Tap)t12Init(s);const p=s.p,t=s.t12Tap,now=s.ticks;
 if(s.kit==='ranger'&&v.y>.5&&t.y<=.5&&!t11NearMouth(s)&&!v.jump){if(now-t.down<18){s.t12Stealth=!s.t12Stealth;t.down=-1000;t12Event('vortex-stealth',{enabled:s.t12Stealth});}else t.down=now;}
 if(s.kit==='melee'&&v.x&&Math.sign(v.x)!==Math.sign(t.x)){const k=v.x>0?'right':'left';if(now-t[k]<18&&s.shield>0&&!s.mounted){s.t12Dash=18;s.t12DashDir=Math.sign(v.x);t[k]=-1000;t12Event('solar-dash');}else t[k]=now;}
 t.x=v.x;t.y=v.y;if(s.kit==='ranger'&&s.t12Stealth&&!s.mounted&&p.grounded)p.vx*=.35;
 if(s.t12Dash>0){s.t12Dash--;p.vx=s.t12DashDir*12*t10Scale(s);p.invuln=Math.max(p.invuln,2);if(s.t12Dash===0)p.vx*=.3;for(const target of r06AllTargets(s))if(target.obj.t12DashHit!==now-s.t12Dash&&Math.hypot(target.x-p.x-p.w/2,target.y-p.y-p.h/2)<48*t10Scale(s)){target.obj.t12DashHit=now-s.t12Dash;r06DamageTarget(target,150,'solar-dash');s.shield=Math.max(0,s.shield-1);s.shieldTicks=0;s.t12Dash=0;t10Burst(s,target.x,target.y,'hit',16);break;}}
 if(s.kit==='mage'){
  for(const b of s.t12Boosts){if(b.time>0)b.time--;else b.level=0;}
  for(const d of s.t12BoostDrops){d.age++;const dx=p.x+p.w/2-d.x,dy=p.y+p.h/2-d.y,dist=Math.hypot(dx,dy);if(dist<190){d.vx=dx/Math.max(1,dist)*4;d.vy=dy/Math.max(1,dist)*4;}else d.vy=Math.min(d.vy+.02,1);d.x+=d.vx;d.y+=d.vy;
   if(dist<25){d.done=true;const b=s.t12Boosts[d.kind];b.level=Math.min(3,b.level+1);b.time=480;t12Event('nebula-boost',{kind:d.kind,level:b.level});}}
  s.t12BoostDrops=s.t12BoostDrops.filter(d=>!d.done&&d.age<600);
  if(now%20===0)s.hp=Math.min(s.maxHp,s.hp+s.t12Boosts[1].level);
  if(now%6===0)s.mana=Math.min(s.maxMana,s.mana+s.t12Boosts[2].level);
 }
 if(s.kit==='summoner'){
  const g=s.t12Guardian,target=r06Target(s,640*t10Scale(s));g.age++;g.attack=Math.max(0,g.attack-1);
  const sc=t10Scale(s),tx=target?target.x-38*sc:p.x-38*sc,ty=target?target.y-12*sc:t10BodyFoot(s,p.y+p.h,sc)-50*sc;g.facing=target?(target.x>g.x?1:-1):p.facing;
  g.x=approach(g.x,tx,6*t10Scale(s));g.y=approach(g.y,ty,5*t10Scale(s));
  if(target&&Math.hypot(g.x-target.x,g.y-target.y)<95*t10Scale(s)&&now%20===0){g.attack=12;r06DamageTarget(target,40,'stardust-guardian');t12Event('stardust-guardian-hit');}
 }
}
const t12MainBase=r04MainStep;r04MainStep=function(v){const s=state;t12MainBase(v);if(state===s&&s&&mode==='playing'&&!s.t11Transition)t12ClassStep(s,v);};
const t12ArenaBase=r05ArenaStep;r05ArenaStep=function(v){const s=state;if(!s)return;t12ArenaBase({...v,auxEdge:false});if(state!==s||mode!=='playing'||s.t11Transition)return;t12SuppliesStep(s);t12ClassStep(s,v);};
const t12PersistBase=r05Persist;r05Persist=function(){t12PersistBase();if(state?.r05Arena&&mainState)mainState.t12Blade=!!state.t12Blade;};
const t12EquipBase=r07EquipDrop;r07EquipDrop=function(s,d){const ok=t12EquipBase(s,d);if(ok){s.t12Stealth=false;s.t12Boosts=[0,1,2].map(()=>({level:0,time:0}));s.t12BoostDrops=[];s.t12Guardian={x:s.p.x-45,y:s.p.y,age:0,attack:0};t12Event('set-equipped',{kit:s.kit});}return ok;};

// Layered forest night and native tile-based ground. Geometry remains the supplied four-lane arena.
const t12SceneCache=new Map();
function t12Noise(x,y){let n=Math.imul(x+17,374761393)^Math.imul(y+53,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function t12GroundTile(){if(t12SceneCache.has('dirt'))return t12SceneCache.get('dirt');const cv=document.createElement('canvas');cv.width=cv.height=32;const g=cv.getContext('2d');g.fillStyle='#604533';g.fillRect(0,0,32,32);for(let y=0;y<32;y+=2)for(let x=0;x<32;x+=2){const n=t12Noise(x,y);g.fillStyle=n>.82?'#8b6550':n<.23?'#47332d':'#70513b';g.fillRect(x,y,2,2);}g.fillStyle='#3e302b';g.fillRect(3,7,6,2);g.fillRect(20,20,8,2);t12SceneCache.set('dirt',cv);return cv;}
function t12NightTree(kind,layer=0){
 const key='night-tree:'+kind+':'+layer+':'+r08ImageRevision;
 if(t12SceneCache.has(key))return t12SceneCache.get(key);
 const source=t12TreeImage(kind),cv=document.createElement('canvas');cv.width=source.width;cv.height=source.height;
 const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(source,0,0);
 g.globalCompositeOperation='source-atop';g.fillStyle=['rgba(13,29,47,.85)','rgba(19,38,49,.76)','rgba(23,49,50,.61)'][layer];g.fillRect(0,0,cv.width,cv.height);
 t12SceneCache.set(key,cv);return cv;
}
function t12Background(s){const w=R06_VIEW.w,h=R06_VIEW.h;ctx.fillStyle='#0e1830';ctx.fillRect(0,0,w,h);
 // Hard-edged pixel bands rather than a flat empty fill; stable parallax, no per-frame random flicker.
 for(let i=0;i<6;i++){ctx.fillStyle=['#0f1b35','#12213d','#162946','#1c334b','#253e50','#314a53'][i];ctx.fillRect(0,150+i*86,w,90);}
 for(let i=0;i<100;i++){const x=((i*197+29-s.cam*.018)%w+w)%w,y=25+(i*i*29)%365;ctx.globalAlpha=.4+.25*Math.sin(s.ticks*.01+i);ctx.fillStyle='#d4e0e4';ctx.fillRect(Math.round(x),y,i%17===0?2:1,1);}ctx.globalAlpha=1;
 const moon=r06Images.t12Moon;if(moon)ctx.drawImage(moon,0,0,moon.width,Math.min(moon.width,moon.height),970-s.cam*.015,75,48,48);else{ctx.fillStyle='#c4d8db';ctx.beginPath();ctx.arc(986-s.cam*.015,102,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#94afb9';ctx.fillRect(975-s.cam*.015,91,8,7);ctx.fillRect(992-s.cam*.015,111,6,5);}
 for(let layer=0;layer<3;layer++){const step=layer===0?104:layer===1?72:60,par=[.04,.10,.20][layer],baseY=390+layer*58-(s.camY+96)*.10,origin=Math.floor(s.cam*par/step)-2;ctx.save();ctx.globalAlpha=[.38,.50,.63][layer];for(let i=origin;i<origin+Math.ceil(w/step)+4;i++){const x=i*step-s.cam*par,height=105+t12Noise(i,layer)*145,im=t12NightTree(i%7===0?'boreal':i%3===0?'forest2':'forest',layer);ctx.drawImage(im,Math.round(x),Math.round(baseY-height),Math.round(height*.72),Math.round(height));}ctx.fillStyle=['#162738','#1b3040','#253a43'][layer];ctx.fillRect(0,Math.round(baseY)-2,w,h-baseY+2);ctx.restore();}

}
function t12DrawGround(s,c){const top=R07_ARENA.floor,tile=r06Images.t12Dirt;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#5d4232';ctx.fillRect(0,top,R06_VIEW.w,440);
 for(let x=Math.floor(c/32)*32;x<c+R06_VIEW.w+32;x+=32)for(let y=top;y<top+440;y+=32){
  const v=Math.floor(t12Noise(Math.floor(x/32),Math.floor(y/32))*3),sx=18+18*v;
  if(tile)ctx.drawImage(tile,sx,18,16,16,Math.round(x-c),y,32,32);
  else ctx.drawImage(t12GroundTile(),Math.round(x-c),y);
 }
 const shade=ctx.createLinearGradient(0,top,0,top+260);shade.addColorStop(0,'rgba(12,15,21,0)');shade.addColorStop(1,'rgba(12,15,21,.42)');ctx.fillStyle=shade;ctx.fillRect(0,top,R06_VIEW.w,440);
 ctx.fillStyle='#213b2b';ctx.fillRect(0,top,R06_VIEW.w,5);ctx.fillStyle='#54783c';ctx.fillRect(0,top,R06_VIEW.w,2);
 for(let x=Math.floor(c/8)*8;x<c+R06_VIEW.w+8;x+=8){const n=t12Noise(x,3);ctx.fillStyle=n>.5?'#6a8a48':'#365d31';ctx.fillRect(Math.round(x-c),top-2,5,3);if(n>.7){ctx.fillRect(Math.round(x-c+1),top-5,2,4);ctx.fillRect(Math.round(x-c+4),top-4,2,3);}}
 ctx.restore();
}

const t12DrawProjectilesBase=r06DrawProjectiles;
r06DrawProjectiles=function(s,c){const beams=s.projectiles.filter(b=>b.type==='terraBlade'),original=s.projectiles;s.projectiles=original.filter(b=>b.type!=='terraBlade');t12DrawProjectilesBase(s,c);s.projectiles=original;const sc=t10Scale(s);
 for(const b of beams){const im=r06Images.t12TerraBeam||photos.beam;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<b.trail.length;i+=2){const t=b.trail[i];ctx.globalAlpha=(i+1)/b.trail.length*.22;ctx.fillStyle='#73e987';ctx.fillRect(t.x-c-5*sc,t.y-3*sc,10*sc,6*sc);}ctx.globalAlpha=.95;ctx.translate(Math.round(b.x-c),Math.round(b.y));ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/4);if(im)ctx.drawImage(im,-im.width*sc/2,-im.height*sc/2,im.width*sc,im.height*sc);ctx.restore();}
 if(s.kit==='melee'){const p=s.p,cx=p.x+p.w/2-c,cy=t10BodyFoot(s,p.y+p.h,sc)-24*sc;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<s.shield;i++){const a=s.ticks*.027+i*Math.PI*2/3,x=cx+Math.cos(a)*23*sc,y=cy+Math.sin(a)*20*sc;ctx.fillStyle='#e5813a';ctx.fillRect(x-3*sc,y-4*sc,6*sc,8*sc);ctx.fillStyle='#ffe5a0';ctx.fillRect(x-sc,y-2*sc,2*sc,4*sc);}ctx.restore();}
 if(s.kit==='mage'){const cols=['#dc71d8','#df7997','#83a0ea'];for(const d of s.t12BoostDrops){ctx.save();ctx.translate(d.x-c,d.y);ctx.rotate(d.age*.045);ctx.fillStyle=cols[d.kind];ctx.fillRect(-5,-5,10,10);ctx.fillStyle='#fff2ff';ctx.fillRect(-2,-2,4,4);ctx.restore();}}
 if(s.kit==='summoner'&&s.t12Guardian){const g=s.t12Guardian,im=r06Images.t12Guardian;ctx.save();ctx.globalAlpha=.83;ctx.globalCompositeOperation='source-over';
 if(im){const fh=92,frame=Math.floor(g.age/9)%Math.max(1,Math.floor(im.height/fh));ctx.translate(Math.round(g.x-c),Math.round(g.y));ctx.scale((g.facing||s.p.facing)*sc,sc);ctx.drawImage(im,0,frame*fh,108,fh,-54,-46,108,fh);ctx.scale((g.facing||s.p.facing)/sc,1/sc);ctx.translate(-Math.round(g.x-c),-Math.round(g.y));}
 if(g.attack){ctx.strokeStyle='#bedbf6';ctx.lineWidth=4*sc;ctx.beginPath();ctx.arc(g.x-c+14*sc,g.y,24*sc,-1.5,1.2);ctx.stroke();}ctx.restore();}
};
const t12BodyBase=r06DrawBody;r06DrawBody=function(g,x,foot,...args){const fade=g===ctx&&state?.kit==='ranger'&&state.t12Stealth;g.save();if(fade)g.globalAlpha*=.26;t12BodyBase(g,x,foot,...args);g.restore();};

r06DrawArena=function(){const s=state,p=s.p,c=s.cam,yc=s.camY??-96;r05Viewport(true);ctx.clearRect(0,0,R06_VIEW.w,R06_VIEW.h);t12Background(s);ctx.save();ctx.translate(0,-yc);
 // Non-colliding forest trees behind the arena and behind platforms. The entry stays open.
 for(let x=690;x<R07_ARENA.width;x+=260)if(x-c>-120&&x-c<R06_VIEW.w+120)t12DrawTree(ctx,{x,y:496,variant:['forest','boreal','forest2'][Math.floor(x/260)%3],visualH:122+(x%3)*23,hp:3},c);
 t12DrawGround(s,c);
 for(const q of s.level.surfaces)if(q.oneWay)r05DrawWood(q,c);
 for(const f of s.campfires)if(f.x-c>-130&&f.x-c<R06_VIEW.w+130)r07Furniture('campfire',f.x-c,f.y,s.ticks,f.phase);
 for(const t of s.lamps)if(t.x-c>-110&&t.x-c<R06_VIEW.w+110)r07Furniture('torch',t.x-c,t.y,s.ticks,t.phase);
 t12DrawChest(s,c);t11DrawPipe(s.pipe,c);
 if(s.eye&&!s.eye.dead&&['charge','fastDash'].includes(s.eye.mode))for(let i=0;i<s.eye.trail.length;i+=3){ctx.save();ctx.globalAlpha=i/s.eye.trail.length*.18;r05DrawEye({...s.eye,...s.eye.trail[i],flash:0},c);ctx.restore();}
 for(const m of s.servants)r05DrawServant(m,c);r05DrawEye(s.eye,c);r07DrawLoot(s,c);r06DrawProjectiles(s,c);r06DrawMount(s,c);
 if(s.t11Transition||!(p.invuln&&Math.floor(s.ticks/4)%2))r06DrawBody(ctx,p.x+p.w/2-c,p.y+p.h,p.attack?p.attackFacing:p.facing,p.grounded&&Math.abs(p.vx)>.1?p.walk:0,!p.grounded,p.attack,0,1,r06Armor(s),r06Weapon(s),1);
 if(s.t11Transition)t11DrawPipe(s.pipe,c);
 for(const n of s.numbers){ctx.save();ctx.globalAlpha=Math.min(1,n.life/12);r05Text(n.text,n.x-c,n.y,16,n.color,'center');ctx.restore();}
 ctx.restore();r07HUD(s);trioUI();
};
r04PauseHelp=function(){return state?.r05Arena?'宝箱自动打开。先拿云朵瓶与泰拉刃，再碰最右侧可疑眼球开战。空格跳跃，↓＋空格下穿，J 攻击，H 治疗。胜利后到原管道按↓返回。':'空格跳跃，J 使用，1/2/3 或点击工具栏选武器 / 平台 / 斧头，E 循环。粘鞍拾取即骑乘；站在管道口↓进入隐藏。';};
const t12Diagnostics={version:T12_VERSION,artProfile:T12_ART_PROFILE,events:()=>t12Events,ready:Promise.all(r06AssetJobs),supplies:()=>state?.t12Supplies,weapon:()=>r06Weapon(state),layerOrder:()=>['background','platform-support','harvest-tree','platform-face','items','actor','pipe-rim-during-transition'],classState:()=>({kit:state?.kit,stealth:state?.t12Stealth,boosts:state?.t12Boosts,guardian:state?.t12Guardian}),init:()=>t12Init(state),attack:r06Attack,pose:()=>t10WorldPose(state),terrain:()=>state.level.surfaces.map(q=>({...q})),assetInfo:()=>Object.fromEntries(Object.entries(r06Images).map(([k,im])=>[k,{w:im.width,h:im.height,embedded:!!R06_ASSET_DATA[k]}])),renderAtlas(){const saved=state;const cv=document.createElement('canvas');cv.width=1000;cv.height=420;const g=cv.getContext('2d');g.fillStyle='#18283b';g.fillRect(0,0,1000,420);g.imageSmoothingEnabled=false;try{state=null;['solar','vortex','nebula','stardust'].forEach((armor,i)=>{g.fillStyle='#e4e8ef';g.font='16px sans-serif';g.fillText(armor,30+i*250,25);[0,1,2,3].forEach((j)=>{r06DrawBody(g,55+i*250+j*48,160,1,j===0?0:j*42,j===3,0,0,1,armor,'starfury',1.5);});r06DrawBody(g,125+i*250,370,-1,40,false,12,0,1,armor,'starfury',2.5);});}finally{state=saved;}return cv.toDataURL();}};
Promise.all([readyPromise,...r06AssetJobs.filter((_,i)=>!!R06_ASSET_DATA[Object.keys(R06_IMAGE_PATHS)[i]])]).then(()=>{if(mode==='menu'&&isTrio()){portrait();t12UI();}});

/* R13. The only entry is the existing 1-3 mainline. This module extends R12 in-place.
 * Terrain, loot and balancing are crossover rules; this is not Terraria's engine.
 * Simulation runs at the original 60 Hz. No networking is needed for the new mechanics.
 */
const T13 = Object.freeze({version:'R14',tile:16,cols:192,rows:128,top:496,bossHP:12000,axeDamage:3,axeKnockback:4.5,axePower:35,treeHP:450,bowDamage:38,arrowDamage:13,bowUse:19});
const t13Log=[];
function t13Event(type,data={}){t13Log.push({type,tick:state?.ticks,...data});if(t13Log.length>1000)t13Log.shift();evt(type,data);}
function t13Private(o,k,v){Object.defineProperty(o,k,{value:v,writable:true,configurable:true,enumerable:false});return v;}
function t13Init(s,from=null){
 s.t13=true;s.t13WeaponOverride=!!(from?.t13WeaponOverride??s.t13WeaponOverride);s.t13Weapon=from?.t13Weapon||s.t13Weapon||'starfury';
 s.t13Owned=[...new Set(from?.t13Owned||s.t13Owned||['starfury'])];
 s.t13Inventory={dirt:0,stone:0,copper:0,iron:0,gold:0,acorn:0,torch:60,arrows:0,...(from?.t13Inventory||s.t13Inventory||{})};
 s.t13Accessories={regen:false,boots:false,...(from?.t13Accessories||s.t13Accessories||{})};
 s.t13Arrows=[];s.t13Drops=s.t13Drops||[];s.t13Sparks=[];s.t13Use=0;s.t13ToolSwing=null;
 s.t13Regen=0;s.t13Recall=0;s.t13Recalling=false;s.t13LastInput={};s.t13MineCount=s.t13MineCount||0;s.t13ToolsUsed={};
 for(const t of s.trees||[]){t.t13Cut=0;t.t13CutRow=null;t.t13Gone=false;}
}
const t13NewBase=newState;
newState=function(){const s=t13NewBase();t13Init(s);return s;};
const t13CopyBase=r06CopyLoadout;
r06CopyLoadout=function(a,b){t13CopyBase(a,b);for(const k of ['t13Weapon','t13Owned','t13Inventory','t13Accessories','t13WeaponOverride'])if(a[k]!==undefined)b[k]=JSON.parse(JSON.stringify(a[k]));};
function t13Hash(x,y,seed=13){let n=Math.imul(x+seed*33,374761393)^Math.imul(y+seed*17,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function t13At(w,x,y){if(x<0||x>=w.cols||y>=w.rows)return 7;if(y<0)return 0;return w.cells[y*w.cols+x];}
function t13Cell(w,x,y){return t13At(w,Math.floor(x/16),Math.floor((y-T13.top)/16));}
function t13Set(w,x,y,n){if(x>=0&&x<w.cols&&y>=0&&y<w.rows){w.cells[y*w.cols+x]=n;w.revision++;}}
function t13Protected(w,x,y){return x<2||x>=w.cols-2||y>=w.rows-2||(x<48&&y<5);}
const T13_LOOT_NAMES={band:'再生手环',boots:'赫尔墨斯靴',heart:'生命水晶',terraBlade:'泰拉刃',starfury:'星怒',arrows:'神圣箭',torch:'火把',wood:'木材',mirror:'魔镜'};
function t13GenerateWorld(){
 const w={cols:T13.cols,rows:T13.rows,cells:new Uint8Array(T13.cols*T13.rows),revision:0,torches:[],fires:[],chests:[],cracks:{},mined:0};
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++)w.cells[y*w.cols+x]=y<7+Math.floor(t13Hash(x,0)*4)?1:2;
 // Connected, deterministic cavern chains. Entrance plateau and two bottom rows are protected.
 const carve=(cx,cy,rx,ry)=>{for(let y=Math.max(6,Math.floor(cy-ry));y<=Math.min(w.rows-3,cy+ry);y++)for(let x=Math.max(2,Math.floor(cx-rx));x<=Math.min(w.cols-3,cx+rx);x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<1)w.cells[y*w.cols+x]=0;};
 for(let level=0;level<5;level++)for(let x=20;x<187;x+=3){const y=19+level*21+Math.sin(x*.078+level*2.1)*5;carve(x,y,5,3.5+Math.sin(x*.13)**2*2);}
 for(let y=9;y<114;y+=3){carve(61+Math.sin(y*.067)*12,y,4,5);carve(138+Math.sin(y*.055)*14,y,3.5,5);}
 // Small ore veins are solid mineable cells, never decorative overlays.
 for(let i=0;i<170;i++){const cx=3+Math.floor(t13Hash(i,7)*186),cy=8+Math.floor(t13Hash(i,19)*115),ore=cy<35?3:cy<78?4:5;
  for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const x=cx+dx,y=cy+dy;if(!t13Protected(w,x,y)&&t13At(w,x,y)>0&&dx*dx/8+dy*dy/5<t13Hash(i+dx,cy+dy)+.8)w.cells[y*w.cols+x]=ore;}}
 const chestSpecs=[
  [58,12,'探矿补给',[{kind:'band',count:1},{kind:'torch',count:25},{kind:'wood',count:30}]],
  [31,22,'遗落的木箱',[{kind:'boots',count:1},{kind:'arrows',count:120}]],
  [95,35,'石室宝箱',[{kind:'heart',count:1},{kind:'torch',count:20}]],
  [151,47,'矿工储物箱',[{kind:'starfury',count:1},{kind:'arrows',count:160}]],
  [72,63,'水晶洞宝箱',[{kind:'heart',count:1},{kind:'band',count:1}]],
  [116,78,'深层储藏箱',[{kind:'boots',count:1},{kind:'wood',count:60}]],
  [42,99,'古老武器箱',[{kind:'terraBlade',count:1},{kind:'heart',count:1}]],
  [164,111,'深处的宝藏',[{kind:'heart',count:1},{kind:'arrows',count:200},{kind:'torch',count:30}]]
 ];
 for(const [cx,cy,name,items]of chestSpecs){carve(cx,cy-2,8,5);for(let x=cx-7;x<=cx+7;x++)w.cells[cy*w.cols+x]=2;
  const q={id:'deep-'+w.chests.length,name,x:cx*16-16,y:T13.top+cy*16-28,w:32,h:28,opened:false,items,empty:false};w.chests.push(q);w.torches.push({x:(cx-5)*16+8,y:T13.top+cy*16-16,wall:true,phase:cx%5});}
 // A readable shallow pocket below the first dig site; still requires using the pickaxe.
 carve(58,8,6,3);w.revision=1;return w;
}
function t13AttachWorld(s){if(!s.r05Arena)return;const saved=mainState?.t13SavedWorld;const w=saved||t13GenerateWorld();t13Private(s,'t13World',w);w.drops=w.drops||[];w.platforms=w.platforms||[];s.t13Drops=w.drops;s.built=w.platforms;if(mainState)t13Private(mainState,'t13SavedWorld',w);}
const t13RoomBase=t11PrepareRoom;
t11PrepareRoom=function(s){t13RoomBase(s);t13Init(s,mainState);t13AttachWorld(s);s.tool=0;
 if(!s.t13World.trees)s.t13World.trees=Array.from({length:9},(_,i)=>({id:'forest-'+i,x:690+i*260,y:496,variant:['forest','boreal','forest2'][i%3],visualH:122+i%3*23,h:122+i%3*23,hp:3,t13Cut:0,t13Gone:false}));s.trees=s.t13World.trees;
 for(const d of s.t12Supplies||[]){if(d.kind==='terraBlade'){d.kind='stormbow';d.label='代达罗斯风暴弓';d.done=s.t13Owned.includes('stormbow');}}
 s.t12Blade=s.t13Owned.includes('stormbow');s.notice='先取云朵瓶和风暴弓，最后拾取右侧眼球。战后可用铜镐挖掘下方洞穴。';s.noticeTime=360;t13Event('room-ready',{tiles:wCount(s.t13World),chests:s.t13World.chests.length});
};
function wCount(w){let n=0;for(const v of w.cells)if(v)n++;return n;}
const t13PersistBase=r05Persist;
r05Persist=function(){if(state?.r05Arena&&r05Builder)r05Builder.wood=state.wood;t13PersistBase();if(state?.r05Arena&&mainState){for(const k of ['t13Weapon','t13Owned','t13Inventory','t13Accessories','t13WeaponOverride'])if(state[k]!==undefined)mainState[k]=JSON.parse(JSON.stringify(state[k]));if(state.t13World)t13Private(mainState,'t13SavedWorld',state.t13World);}};
const t13SummonBase=r05Summon;
r05Summon=function(){const ok=t13SummonBase();if(ok&&state?.eye){const s=state;s.eye.hp=s.eye.maxHp=T13.bossHP;s.eye.profile.maxHp=T13.bossHP;s.t13BattleStart=s.ticks;t13Event('boss-start',{hp:T13.bossHP});}return ok;};
const t13HitEyeBase=r05HitEye;
r05HitEye=function(raw,kind){const s=state,was=s?.bossClear;t13HitEyeBase(raw,kind);if(s?.bossClear&&!was){s.t13BattleFrames=s.ticks-s.t13BattleStart;t13Event('boss-clear',{frames:s.t13BattleFrames,seconds:s.t13BattleFrames/60});}};
// Replace the R12 three-supply update, not a second competing chest handler.
t12SuppliesStep=function(s){if(s.t11Transition||s.phase==='cleared')return;s.t12RoomTicks++;/* R17: supply chest requires the interact action. */if(!s.t11Chest.opened)return;
 for(const d of s.t12Supplies||[]){if(d.done||!d.launched)continue;d.age++;const u=Math.min(1,d.age/24);d.x=252+(d.tx-252)*(u*u*(3-2*u));d.y=u<1?454-60*Math.sin(u*Math.PI):474;d.grounded=u===1;
  if(d.age<12||!near(s.p,{x:d.x-14,y:d.y-12,w:28,h:32}))continue;
  if(d.kind==='suspiciousEye'&&(!s.cloudJump||!s.t13Owned.includes('stormbow')))continue;
  d.done=true;terraSound('pickup');if(d.kind==='cloudBottle')r06CollectCloud(s);
  else if(d.kind==='stormbow'){s.t13Owned.push('stormbow');s.t13Weapon='stormbow';s.t12Blade=true;s.t13Inventory.arrows+=400;s.tool=0;s.p.attack=s.p.cooldown=0;r06Chat('代达罗斯风暴弓 / 神圣箭 ∞','#dbcbff');}
  else{s.t12SummonGate=true;const ok=r05Summon();s.t12SummonGate=false;if(!ok){d.done=false;continue;}}
  t13Event('supply-pickup',{kind:d.kind,phase:s.phase});r05Persist();
 }
};

// ---------- One transform for hands, item hilt, muzzle and melee hit volumes ----------
Object.assign(T10_ITEMS,{
 stormbow:{grip:[12,31],tip:[24,31],scale:.85,style:'bow'},
 pickaxe:{grip:[5,27],tip:[27,5],scale:1,style:'swing'},
 torchPlaced:{grip:[10,17],tip:[10,4],scale:1,style:'held'},
 campfireItem:{grip:[15,13],tip:[15,0],scale:1,style:'held'}
});
const t13PoseBase=t10Pose;
t10Pose=function(s,attack=s?.p.attack||0,tool=s?.tool||0){
 const p=s?.p||{facing:1,aim:0},key=tool===2?'axe':tool===3?'pickaxe':tool===4?'torchPlaced':tool===5?'campfireItem':tool===1?'wood':r06Weapon(s||{});
 if(!['stormbow','pickaxe','torchPlaced','campfireItem'].includes(key))return t13PoseBase(s,attack,tool);
 const def=T10_ITEMS[key],duration=p.t10SwingDuration||21,u=clamp(1-attack/duration,0,1),e=u*u*(3-2*u),using=attack>0||tool>=4;
 const theta=key==='stormbow'?(p.aim||0):tool>=4?-.75:using?-2.3+4.1*e:1.65,rotation=key==='stormbow'?(p.aim||0):tool>=4?0:theta-.30+Math.PI/4;
 const shoulder={x:-7,y:-27},len=Math.hypot(18,8),hand={x:shoulder.x+Math.cos(theta)*len,y:shoulder.y+Math.sin(theta)*len};
 const dx=(def.tip[0]-def.grip[0])*def.scale,dy=(def.tip[1]-def.grip[1])*def.scale,end={x:hand.x+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:hand.y+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
 return {weapon:key,def,using,shoulder,hand,end,theta,rotation,u,face:attack?p.attackFacing||p.facing:p.facing};
};
const t13DrawBodyBase=r06DrawBody;
r06DrawBody=function(g,x,foot,face,walk=0,air=false,attack=0,tool=0,opacity=1,armor='platinum',weapon='starfury',scale=.75){
 t13DrawBodyBase(g,x,foot,face,walk,air,attack,tool,opacity,armor,weapon,scale);
 if(weapon==='stormbow'&&tool===0&&attack>0){const pose=t10Pose(state,attack,0),pull=3+4*(attack/(state.p.t10SwingDuration||19));g.save();g.translate(x,t10BodyFoot(state,foot,scale));g.scale(face*scale,scale);g.translate(pose.hand.x,pose.hand.y);g.rotate(pose.rotation);g.strokeStyle='#e4dbdc';g.lineWidth=.75;g.beginPath();g.moveTo(2,-23);g.lineTo(-pull,0);g.lineTo(2,23);g.stroke();g.fillStyle='#dfb18e';g.fillRect(-pull-2,-2,4,4);g.restore();}
};
function t13Aim(s,v={}){
 const p=s.p,sc=t10Scale(s);let target;
 if(t13Pointer.down&&t13Pointer.active){target={x:t13Pointer.x,y:t13Pointer.y};}
 else target=r06Target(s,s.r05Arena?Infinity:W*1.4);
 if(!target)target={x:p.x+p.w/2+p.facing*260*sc,y:p.y+p.h/2+(v.y||0)*140*sc};
 const dx=target.x-p.x-p.w/2,dy=target.y-p.y-p.h/2;
 p.attackFacing=p.facing=Math.abs(dx)>.1?Math.sign(dx):p.facing;p.aim=Math.atan2(dy,Math.abs(dx));return target;
}
const t13DamageBase=r06DamageTarget;
r06DamageTarget=function(t,damage,kind){
 if(!t||t.obj.dead)return;
 const s=state,tool=kind==='copper-axe'||kind==='copper-pickaxe',knock=kind==='copper-axe'?T13.axeKnockback:kind==='copper-pickaxe'?2:2.25;
 if(tool&&s.r05Arena&&t.id!=='boss'){
  const e=t.obj;e.hp=(e.hp??20)-damage;e.flash=8;e.vx=s.p.attackFacing*knock;e.vy=-2;e.t13Knock=12;
  if(e.hp<=0){e.dead=true;s.kills++;terraSound('npcDeath');}number(String(damage),t.x,t.y-16,'#f2d483');t10Burst(s,t.x,t.y,'hit',4);
 }else{t13DamageBase(t,damage,kind);if((tool||kind==='holy-arrow')&&t.id!=='boss'){t.obj.knock=17;t.obj.vx=(s.p.attackFacing||s.p.facing)*knock*t10Scale(s);t.obj.vy=-2*t10Scale(s);}}
 if(tool)t13Event('tool-hit',{kind,target:t.id,damage,knockback:t.id==='boss'?0:knock,hp:t.obj.hp});
};
const t13AttackBase=r06Attack,t13ArcBase=t10HitArc;
r06Attack=function(v={}){
 const s=state,p=s.p;
 if(s.tool!==0)return;
 if(!s.kit&&s.t13Weapon==='stormbow'){
  if(p.cooldown>0)return;
  const target=t13Aim(s,v),sc=t10Scale(s);s.attackId++;p.t10SwingDuration=T13.bowUse;p.attack=T13.bowUse;p.cooldown=T13.bowUse;
  const n=s.attackId%3===0?2:3,skyY=Math.min(p.y,target.y)-440*sc;
  for(let i=0;i<n;i++){const sx=target.x+((i-(n-1)/2)*80+(t13Hash(s.attackId,i)-.5)*70)*sc,tx=target.x+(t13Hash(i,s.attackId)-.5)*34*sc,ty=target.y,dx=tx-sx,dy=ty-skyY,len=Math.hypot(dx,dy)||1;
   s.t13Arrows.push({x:sx,y:skyY,vx:dx/len*12.5*sc,vy:dy/len*12.5*sc,life:140,age:0,damage:T13.bowDamage+T13.arrowDamage,kind:'holy-arrow',trail:[],id:s.attackId+'-'+i});}
  terraSound('bow',{volume:.5});t13Event('stormbow-shot',{arrows:n,consumed:0,infinite:true,ammo:s.t13Inventory.arrows,target:{x:Math.round(target.x),y:Math.round(target.y)}});return;
 }
 // Retain the original starter and optional excavated Terra Blade, not both at once.
 const flag=s.t12Blade;s.t12Blade=s.t13Weapon==='terraBlade';try{return t13AttackBase(v);}finally{s.t12Blade=flag;}
};
r05Attack=r06Attack;
t10HitArc=function(s,targets){if(s.t13Weapon==='stormbow'&&!s.kit)return;const flag=s.t12Blade;s.t12Blade=s.t13Weapon==='terraBlade';try{return t13ArcBase(s,targets);}finally{s.t12Blade=flag;}};
function t13PhysicalSurfaces(s,box){
 if(!s.r05Arena)return solids();
 const a=s.level.surfaces.filter(q=>q.id!=='arena-floor').concat(s.built||[]),w=s.t13World;if(!w)return a;
 const minX=Math.max(0,Math.floor(box.x/16)-1),maxX=Math.min(w.cols-1,Math.floor((box.x+box.w)/16)+1),minY=Math.max(0,Math.floor((box.y-T13.top)/16)-1),maxY=Math.min(w.rows-1,Math.floor((box.y+box.h-T13.top)/16)+1);
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(t13At(w,x,y))a.push({x:x*16,y:T13.top+y*16,w:16,h:16,solid:true,id:'tile:'+x+':'+y});return a;
}
function t13ArrowStep(s){const sc=t10Scale(s),next=[],targets=r06AllTargets(s);
 for(const a of s.t13Arrows){if(--a.life<=0)continue;a.age++;const old={x:a.x,y:a.y};a.trail.push(old);if(a.trail.length>7)a.trail.shift();a.x+=a.vx;a.y+=a.vy;
  let hit=null,wall=false;const query={x:Math.min(old.x,a.x)-4,y:Math.min(old.y,a.y)-4,w:Math.abs(a.vx)+8,h:Math.abs(a.vy)+8};
  for(const q of t13PhysicalSurfaces(s,query))if(q.solid&&segmentHits(old,a,q,1*sc)){wall=true;break;}
  if(!wall)for(const t of targets){if(t.obj.dead)continue;const box={x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h};if(segmentHits(old,a,box,3*sc)){hit=t;r06DamageTarget(t,a.damage,a.kind);break;}}
  if(hit||wall){t10Burst(s,a.x,a.y,'hit',4);if(a.kind==='holy-arrow'){
    // Holy arrows call two stars; they descend independently and collide with roofs as well.
    for(let i=0;i<2;i++){const sx=a.x+(i?95:-95)*sc,sy=a.y-300*sc,dx=a.x-sx,dy=a.y-sy,d=Math.hypot(dx,dy);
     next.push({x:sx,y:sy,vx:dx/d*15*sc,vy:dy/d*15*sc,life:80,age:0,damage:Math.round(a.damage*.5),kind:'holy-star',trail:[],id:a.id+'s'+i});}
   }continue;}
  if(a.y>(s.r05Arena?T13.top+T13.rows*16+40:320)||a.x< -400||a.x>s.level.width+400)continue;next.push(a);
 }s.t13Arrows=next.slice(-240);
}
// ---------- Real inventory drops and tool impacts ----------
function t13Drop(s,kind,count,x,y,vx=0,vy=-2){s.t13Drops.push({kind,count,x,y,w:10,h:10,vx,vy,age:0,grounded:false});}
function t13Collect(s,kind,count){
 if(kind==='wood')s.wood+=count;else s.t13Inventory[kind]=(s.t13Inventory[kind]||0)+count;
 terraSound('pickup',{volume:.45});number('+'+count+' '+({wood:'木材',acorn:'橡实',chest:'木箱',dirt:'泥土',stone:'石块',copper:'铜矿',iron:'铁矿',gold:'金矿'}[kind]||kind),s.p.x+s.p.w/2,s.p.y-6,'#e8dcb2');t13Event('resource-pickup',{kind,count});
}
function t13DropStep(s){const p=s.p;for(const d of s.t13Drops){d.age++;const dx=p.x+p.w/2-(d.x+5),dy=p.y+p.h*.55-(d.y+5),dist=Math.hypot(dx,dy);
  if(d.age>18&&dist<45*t10Scale(s)){d.vx=approach(d.vx,dx/(dist||1)*4,.55);d.vy=approach(d.vy,dy/(dist||1)*4,.55);d.x+=d.vx;d.y+=d.vy;}
  else{d.vx*=.97;d.x+=d.vx;const old=d.y+10;d.vy=Math.min(6,d.vy+.22);d.y+=d.vy;for(const q of t13PhysicalSurfaces(s,d))if(d.x+10>q.x&&d.x<q.x+q.w&&old<=q.y+1&&d.y+10>=q.y&&d.vy>=0){d.y=q.y-10;d.vy=0;d.vx*=.8;d.grounded=true;break;}}
  if(d.age>18&&near(p,d)){d.done=true;t13Collect(s,d.kind,d.count);}
 }s.t13Drops=s.t13Drops.filter(d=>!d.done&&d.age<18000&&d.y<T13.top+T13.rows*16+50);if(s.t13World)s.t13World.drops=s.t13Drops;
}
const t13TreeDrawBase=drawChopTree;
drawChopTree=function(t,c){if(t.t13Gone)return;t13TreeDrawBase(t,c);};
function t13ToolTarget(s,v={}){const p=s.p,sc=t10Scale(s);if(t13Pointer.active&&(t13Pointer.down||t13Pointer.lastMove>performance.now()-8000))return{x:t13Pointer.x,y:t13Pointer.y,pointer:true};
 const down=(v.y||0)>.4,up=(v.y||0)<-.4;
 if(down&&s.tool===3&&s.t13World){const cy=Math.floor((p.y+p.h+6-T13.top)/16);for(let cx=Math.floor(p.x/16);cx<=Math.floor((p.x+p.w-.1)/16);cx++)if(t13At(s.t13World,cx,cy)>0)return{x:cx*16+8,y:T13.top+cy*16+8,pointer:false};}
 return {x:p.x+p.w/2+(down?0:p.facing*32*sc),y:down?p.y+p.h+8:up?p.y-12:p.y+p.h-15*sc,pointer:false};
}
chopTree=function(){const s=state,p=s.p,target=s.t13Target||t13ToolTarget(s),sc=t10Scale(s);
 const tree=(s.trees||[]).filter(t=>!t.t13Gone&&t.hp>0&&Math.abs(t.x-(p.x+p.w/2))<65*sc&&Math.abs(t.y-(p.y+p.h))<46*sc&&(t.x-p.x-p.w/2)*p.facing>=-8).sort((a,b)=>Math.abs(a.x-target.x)-Math.abs(b.x-target.x))[0];
 if(!tree)return false;
 tree.t13Cut=(tree.t13Cut||0)+T13.axePower;tree.shake=8;t10Burst(s,tree.x,tree.y-12,'wood',5);terraSound('break',{volume:.55});t13Event('tree-hit',{id:tree.id,progress:tree.t13Cut,required:T13.treeHP});
 if(tree.t13Cut>=T13.treeHP){tree.t13Gone=true;tree.hp=0;tree.fall=42;tree.rewarded=true;const n=Math.max(5,Math.round((tree.h||70)/12));
  for(let i=0;i<n;i++){t13Drop(s,'wood',2,tree.x-4,tree.y-10-i*10,(t13Hash(i,s.ticks)-.5)*3.5,-1.5);t10Burst(s,tree.x,tree.y-i*10,'wood',3);}
  t13Drop(s,'acorn',1,tree.x,tree.y-(tree.h||70),1,-2);terraSound('treeFell');t13Event('tree-felled-physical',{id:tree.id,wood:n*2,drops:n+1});}
 return true;
};
function t13Mine(s,target){
 if(!s.r05Arena){const at=(s.built||[]).findIndex(q=>target.x>=q.x&&target.x<q.x+q.w&&Math.abs(target.y-q.y)<16);if(at>=0){const q=s.built.splice(at,1)[0];t13Drop(s,'wood',1,q.x,q.y);s.totalMined++;terraSound('break');return true;}note('主线原平台保持不变；隐藏关战后可挖地下矿洞。');return false;}
 if(s.phase==='battle'){note('克眼战斗中不能挖掘；击败后开放地下探索。');return false;}
 const w=s.t13World,x=Math.floor(target.x/16),y=Math.floor((target.y-T13.top)/16),val=t13At(w,x,y);
 if(y<0||x<0||x>=w.cols||y>=w.rows)return false;
 if(t13Protected(w,x,y)){note('入口地基与世界边界保留；从场地右侧草地下挖。');return false;}
 if(!val)return false;
 if(y===0&&(s.trees||[]).some(t=>!t.t13Gone&&t.x>=x*16&&t.x<(x+1)*16)){note('先砍掉树，再挖树根下的土块。');return false;}
 // Do not mine a chest's support before looting it, avoiding an unreachable floating container.
 if(w.chests.some(c=>!c.empty&&Math.abs(c.y+c.h-(T13.top+y*16))<2&&x*16<c.x+c.w&&x*16+16>c.x)){note('先打开上方宝箱取走物品，再挖支撑。');return false;}
 const key=x+','+y,required=val===1?90:val===2?135:val===3?135:val===4?180:225;
 w.cracks[key]=(w.cracks[key]||0)+45;terraSound('break',{volume:.4});t10Burst(s,x*16+8,T13.top+y*16+8,'wood',4);
 if(w.cracks[key]>=required){for(const c of w.chests)if(c.empty&&!c.removed&&Math.abs(c.y+c.h-(T13.top+y*16))<2&&x*16<c.x+c.w&&x*16+16>c.x){c.removed=true;t13Drop(s,'chest',1,c.x+10,c.y+4);}
 delete w.cracks[key];t13Set(w,x,y,0);w.mined++;s.t13MineCount++;t13Drop(s,['','dirt','stone','copper','iron','gold'][val]||'stone',1,x*16+3,T13.top+y*16+3,(t13Hash(x,y)-.5)*1.4,-1.4);t13Event('tile-mined',{x,y,kind:val,total:w.mined});}
 return true;
}
function t13InReach(s,t){return Math.hypot(t.x-s.p.x-s.p.w/2,t.y-s.p.y-s.p.h/2)<=88*t10Scale(s);}
function t13ClearRay(s,t){if(!s.r05Arena)return true;const p=s.p,x=p.x+p.w/2,y=p.y+p.h/2,dx=t.x-x,dy=t.y-y,n=Math.ceil(Math.hypot(dx,dy)/5),tx=Math.floor(t.x/16),ty=Math.floor((t.y-T13.top)/16);
 for(let i=1;i<n;i++){const xx=x+dx*i/n,yy=y+dy*i/n,cx=Math.floor(xx/16),cy=Math.floor((yy-T13.top)/16);if(cx===tx&&cy===ty)break;if(cy>=0&&t13At(s.t13World,cx,cy))return false;}return true;}
function t13Place(s,target,type){
 if(s.r05Arena&&s.phase==='battle'){note('战斗期间保留原四层战台；战后可建设。');return false;}
 const baseY=s.r05Arena?T13.top:0,x=Math.floor(target.x/16)*16,y=baseY+Math.floor((target.y-baseY)/16)*16;
 const box={x,y,w:16,h:type===1?6:16};
 if(!t13InReach(s,{x:x+8,y:y+8})||near(s.p,box)||t13PhysicalSurfaces(s,box).some(q=>q.solid&&near(q,box)))return false;
 if(type===1){if(s.wood<=0||s.built.some(q=>q.x===x&&q.y===y))return false;s.wood--;s.built.push({...box,id:'t13-built-'+s.ticks,type:'built',oneWay:true});s.totalPlaced++;}
 else{if(!s.r05Arena){note('火把与篝火可在隐藏矿区放置。');return false;}const w=s.t13World;
  if(type===4){if(s.t13Inventory.torch<=0||w.torches.some(t=>Math.hypot(t.x-x-8,t.y-y-16)<10))return false;s.t13Inventory.torch--;w.torches.push({x:x+8,y:y+16,phase:s.ticks%8,wall:true});}
  else{if(s.wood<10||!t13Cell(w,x+8,y+18)){note('篝火需要 10 木材，并放在实地上。');return false;}s.wood-=10;w.fires.push({x:x+8,y:y+16,phase:s.ticks%8});}w.revision++;}
 terraSound('build',{volume:.6});t13Event('place',{type,x,y});return true;
}
function t13BeginTool(s,v){const p=s.p,tool=s.tool,sc=t10Scale(s),target=t13ToolTarget(s,v);s.t13Target=target;
 if(!t13InReach(s,target)){if(s.ticks%30===0)note('超出工具距离。');return;}
 if(tool===1||tool===4||tool===5){s.t13Use=10;p.attack=10;p.attackFacing=p.facing;t13Place(s,target,tool);return;}
 if(tool!==2&&tool!==3)return;
 if(target.pointer&&Math.abs(target.x-p.x-p.w/2)>2)p.facing=Math.sign(target.x-p.x-p.w/2);
 p.attackFacing=p.facing;p.aim=0;p.t10SwingDuration=tool===2?21:15;p.attack=p.t10SwingDuration;s.t13Use=p.attack;s.attackId++;
 s.t13ToolSwing={tool,id:s.attackId,hit:[],previous:null};s.t13ToolsUsed[tool]=(s.t13ToolsUsed[tool]||0)+1;terraSound('swing',{volume:.45});
 if(tool===2)chopTree();else if(t13ClearRay(s,target))t13Mine(s,target);
}
function t13ToolStep(s,v,use){if(s.t13Use>0)s.t13Use--;if(s.tool>0&&use&&!s.t13Use&&!s.p.hurtLock)t13BeginTool(s,v);
 const sw=s.t13ToolSwing;if(!sw||sw.tool!==s.tool||s.p.attack<=0){s.t13ToolSwing=null;return;}
 const pose=t10WorldPose(s),prev=sw.previous;if(pose.u>.08&&pose.u<.88){for(const t of r06AllTargets(s)){if(t.obj.dead||sw.hit.includes(t.id))continue;const box={x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h};
  if(segmentHits(pose.hand,pose.end,box,4*pose.scale)||prev&&segmentHits(prev.end,pose.end,box,5*pose.scale)){sw.hit.push(t.id);r06DamageTarget(t,sw.tool===2?T13.axeDamage:4,sw.tool===2?'copper-axe':'copper-pickaxe');}}}sw.previous={hand:pose.hand,end:pose.end};
}

// ---------- Underground-safe movement, camera and collision ----------
const t13OldPhysics=r05Physics;
r05Physics=function(v){const s=state,p=s.p;if(!s.t13World)return t13OldPhysics(v);
 for(const k of ['invuln','hurtLock','cooldown','drop'])if(p[k]>0)p[k]--;
 const slime=!!(s.mounted&&s.mountType==='slime'),ufo=!!(s.mounted&&s.mountType==='ufo');
 const support=s.level.surfaces.concat(s.built).find(q=>q.id===p.support);const wasGround=p.grounded;
 if(v.y>.5&&v.jumpEdge&&support?.oneWay){p.drop=18;p.dropRow=support.y;p.y+=2;p.vy=1;p.grounded=false;p.support=null;p.coyote=p.buffer=0;}
 else if(v.jumpEdge)p.buffer=7;else p.buffer=Math.max(0,(p.buffer||0)-1);
 p.coyote=p.grounded?6:Math.max(0,(p.coyote||0)-1);
 if(p.slimeBounce>0)p.slimeBounce--;
 if(p.grounded){p.cloudAvailable=!!s.cloudJump;p.jumpHeld=0;}
 const move=v.x||0,walkSpeed=(s.t13Accessories.boots&&Math.abs(p.vx)>3.9?6:4.3)*(s.t13Accessories.anklet?1.1:1);
 if(!p.hurtLock){p.vx=approach(p.vx,move*(ufo?7:slime?4:walkSpeed),move?(ufo?.28:slime?.2:.38):.5);if(move&&!p.attack)p.facing=Math.sign(move);}
 if(ufo){p.vy=approach(p.vy,(v.jump?-1:v.y||0)*5.4,.4);p.buffer=0;}
 else{
  const jump=slime?(v.jump||v.jumpEdge)&&p.grounded&&!p.drop:p.buffer&&p.coyote&&!p.drop;
  if(jump&&!p.hurtLock){p.vy=slime?-12.4:-7.3;p.grounded=false;p.support=null;p.coyote=p.buffer=0;p.jumpHeld=0;p.slimeHold=0;t13Event(slime?'slime-jump':'arena-jump');}
  else if(v.jumpEdge&&!wasGround&&!p.coyote&&p.cloudAvailable&&!slime&&!p.drop){p.cloudAvailable=false;p.vy=-7.3;p.jumpHeld=0;p.buffer=0;s.r06FX.push({type:'cloud',x:p.x+p.w/2,y:p.y+p.h,age:0});terraSound('jump');t13Event('cloud-jump');}
  if(slime){p.vy+=p.vy<0&&v.jump&&p.slimeHold<12?.14:.4;if(p.vy<0&&v.jump)p.slimeHold++;p.vy=Math.min(12,p.vy);}
  else{if(p.vy<0&&v.jump&&(p.jumpHeld||0)<16){p.vy+=.23;p.jumpHeld=(p.jumpHeld||0)+1;}else{if(p.vy< -3.4&&!v.jump)p.vy=-3.4;p.vy+=.43;}p.vy=Math.min(10,p.vy);}
 }
 const sweep={x:p.x-Math.abs(p.vx)-4,y:p.y-Math.abs(p.vy)-4,w:p.w+Math.abs(p.vx)*2+8,h:p.h+Math.abs(p.vy)*2+8},ss=t13PhysicalSurfaces(s,sweep);
 const oldX=p.x;p.x=clamp(p.x+p.vx,2*16,T13.cols*16-p.w-2*16);
 for(const q of ss)if(q.solid&&near(p,q)){if(oldX+p.w<=q.x+.5&&p.vx>0)p.x=q.x-p.w;else if(oldX>=q.x+q.w-.5&&p.vx<0)p.x=q.x+q.w;else continue;p.vx=0;}
 const oldY=p.y,feet=oldY+p.h;p.y+=p.vy;p.grounded=false;p.support=null;
 let land=null,ceiling=null;
 for(const q of ss){if(q.oneWay&&ufo&&v.y>.1)continue;if(p.x+p.w<=q.x+.15||p.x>=q.x+q.w-.15)continue;
  if(p.vy>=0&&feet<=q.y+.8&&p.y+p.h>=q.y&&(!q.oneWay||p.drop===0||q.y>(p.dropRow||0)+8)){if(!land||q.y<land.y)land=q;}
  else if(q.solid&&p.vy<0&&oldY>=q.y+q.h-.5&&p.y<q.y+q.h){if(!ceiling||q.y+q.h>ceiling.y+ceiling.h)ceiling=q;}}
 if(land){p.y=land.y-p.h;p.vy=0;p.grounded=true;p.support=land.id;p.cloudAvailable=!!s.cloudJump;p.buildGroundRow=land.y;}
 if(ceiling){p.y=ceiling.y+ceiling.h;p.vy=0;p.jumpHeld=99;p.slimeHold=99;}
 if(p.y< -900){p.y=-900;p.vy=Math.max(0,p.vy);}
 if(p.y>T13.top+T13.rows*16-p.h-30){p.y=T13.top+T13.rows*16-p.h-32;p.vy=0;}
 if(p.grounded)p.walk+=Math.abs(p.vx)*.8;
 if(slime){p.slimeTicks=(p.slimeTicks||0)+1;p.slimeFrame=p.grounded?(Math.floor(p.slimeTicks/10)%2):p.vy<0?2:3;p.slimeOldFeet=feet;r07Stomp(s);}
 s.cam=approach(s.cam,clamp(p.x+p.w/2-R06_VIEW.w*.44,0,T13.cols*16-R06_VIEW.w),Math.abs(p.vx)+4);
 r05SyncPointer();
};
const t13CameraBase=t11Camera;
t11Camera=function(s){if(!s?.r05Arena||!s.t13World)return t13CameraBase(s);if(s.t11Transition)return;const target=clamp(s.p.y+s.p.h/2-R06_VIEW.h*.54,-540,T13.top+T13.rows*16-R06_VIEW.h);s.camY=approach(s.camY??-96,target,Math.max(4,Math.abs(s.p.vy)+1));};
// The old arena construction callback silently reset the current tool every tick.
r05Build=function(){};
r05SelectTool=function(n){r06DigitTool(n);};
r06DigitTool=function(n){if(!state||mode!=='playing'||state.t11Transition)return;state.tool=clamp(Math.floor(n),0,5);state.p.attack=state.p.cooldown=0;state.t13Use=0;state.t13ToolSwing=null;state.toolCooldown=0;state.aiming=false;r06SyncKitTools();t13UI(true);};
r06SyncKitTools=function(){tools[0]=(!state?.t13WeaponOverride&&r06Kit(state)?.weaponName)||({'starfury':'星怒','stormbow':'代达罗斯风暴弓','terraBlade':'泰拉刃'}[state?.t13Weapon]||'星怒');tools[1]='木平台';tools[2]='铜斧';tools[3]='铜镐';tools[4]='火把';tools[5]='篝火';};
function t13CycleWeapon(){const s=state;if(!s||mode!=='playing')return;const options=s.kit?['class',...s.t13Owned]:s.t13Owned,current=s.kit&&!s.t13WeaponOverride?'class':s.t13Weapon,next=options[(options.indexOf(current)+1)%options.length];s.t13WeaponOverride=next!=='class'&&!!s.kit;if(next!=='class')s.t13Weapon=next;s.minions=[];s.prismCharge=0;s.whipAge=99;if(next==='class'&&s.kit==='summoner')r06CreateMinions(s);r06DigitTool(0);note('当前武器：'+tools[0]);}
const t13CombatBase=r06TickCombat;
r06TickCombat=function(v){const s=state;if(!s.t13WeaponOverride||!s.kit)return t13CombatBase(v);const kit=s.kit;s.kit=null;try{return t13CombatBase(v);}finally{s.kit=kit;}};
const t13EquipBase=r07EquipDrop;r07EquipDrop=function(s,d){const ok=t13EquipBase(s,d);if(ok){s.t13WeaponOverride=false;}return ok;};


// ---------- Input coordinates are derived from the real canvas viewport ----------
const t13Pointer={active:false,down:false,x:0,y:0,sx:0,sy:0,lastMove:0};
function t13SamplePointer(e){const r=canvas.getBoundingClientRect(),s=state;if(!r.width||!s)return;
 const w=s.r05Arena?R06_VIEW.w:W,h=s.r05Arena?R06_VIEW.h:H;
 t13Pointer.sx=(e.clientX-r.left)/r.width*w;t13Pointer.sy=(e.clientY-r.top)/r.height*h;
 t13Pointer.x=t13Pointer.sx+(s.cam||0);t13Pointer.y=t13Pointer.sy+(s.r05Arena?(s.camY??-96):(s.r07CamY||0));t13Pointer.active=true;t13Pointer.lastMove=performance.now();
}
canvas.addEventListener('pointermove',t13SamplePointer,true);
canvas.addEventListener('pointerdown',e=>{if(!isTrio()||!state)return;t13SamplePointer(e);if(e.button===2){e.preventDefault();e.stopImmediatePropagation();t13OpenNearby();return;}if(e.button===0)t13Pointer.down=true;},true);
canvas.addEventListener('contextmenu',e=>{if(isTrio())e.preventDefault();},true);
window.addEventListener('pointerup',()=>{t13Pointer.down=false;},true);
window.addEventListener('blur',()=>{t13Pointer.down=false;},true);
const t13ClearInputBase=clearInput;
clearInput=function(){t13ClearInputBase();t13Pointer.down=false;};
const t13PointerSyncBase=r05SyncPointer;
r05SyncPointer=function(){t13PointerSyncBase();if(state&&t13Pointer.active){t13Pointer.x=t13Pointer.sx+state.cam;t13Pointer.y=t13Pointer.sy+(state.r05Arena?(state.camY??-96):state.r07CamY||0);if(t13Pointer.down){r05Pointer.x=t13Pointer.x;r05Pointer.y=t13Pointer.y;}}};
window.addEventListener('keydown',e=>{if(!isTrio()||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 if(['Digit4','Digit5','Digit6','KeyQ','KeyB'].includes(e.code)){e.preventDefault();if(e.repeat)return;if(e.code.startsWith('Digit'))r06DigitTool(Number(e.code.slice(-1))-1);else if(e.code==='KeyQ')t13CycleWeapon();else t13Recall();}
},true);

// Mounted clearance uses the same dug tiles as movement, not the obsolete flat floor.
const t13ApplyMountBase=t10ApplyMount;
t10ApplyMount=function(s){if(s?.t13World&&s.t10PendingMount){const h=s.t10PendingMount.type==='slime'?62:42,candidate={...s.p,y:s.p.y+s.p.h-h,h};if(t13PhysicalSurfaces(s,candidate).some(q=>q.solid&&near(candidate,q))){s.t10MountBlocked=true;return false;}}return t13ApplyMountBase(s);};
const t13MountToggleBase=r06ToggleMount;
r06ToggleMount=function(){const s=state;if(s?.t13World&&!s.mounted&&s.mountType==='slime'){const candidate={...s.p,y:s.p.y+s.p.h-62,h:62};if(t13PhysicalSurfaces(s,candidate).some(q=>q.solid&&near(candidate,q))){note('头顶岩层太低，走到开阔处再骑乘。');return;}}return t13MountToggleBase();};
$('r06Mount').onclick=()=>{r06ToggleMount();canvas.focus({preventScroll:true});};

// ---------- Persistent physical chests, accessory effects and a safe way back up ----------
function t13ClosestChest(s){const p=s?.p;if(!p||!s.t13World)return null;return s.t13World.chests.find(c=>!c.removed&&Math.abs(c.x+16-p.x-p.w/2)<65&&Math.abs(c.y+28-p.y-p.h)<50)||null;}
let t13OpenChestId=null;
function t13OpenNearby(){const s=state;if(!s||mode!=='playing'||s.phase==='battle'||s.t11Transition)return false;const c=t13ClosestChest(s);if(!c)return false;
 c.opened=true;t13OpenChestId=c.id;mode='inventory';clearInput();t13ChestPanel.hidden=false;t13UpdateChestPanel();audioSync();t13Event('chest-open',{id:c.id,empty:c.empty});return true;
}
function t13TakeChest(){const s=state,c=s?.t13World?.chests.find(c=>c.id===t13OpenChestId);if(!c||mode!=='inventory'||c.empty)return;
 for(const it of c.items){if(it.kind==='band')s.t13Accessories.regen=true;else if(it.kind==='boots')s.t13Accessories.boots=true;
  else if(it.kind==='heart'){s.maxHp=Math.min(400,s.maxHp+20);s.hp=Math.min(s.maxHp,s.hp+20);}
  else if(['terraBlade','starfury'].includes(it.kind)){if(!s.t13Owned.includes(it.kind))s.t13Owned.push(it.kind);s.t13Weapon=it.kind;s.t13WeaponOverride=!!s.kit;s.tool=0;s.minions=[];s.prismCharge=0;s.whipAge=99;}
  else if(it.kind==='wood')s.wood+=it.count;else s.t13Inventory[it.kind]=(s.t13Inventory[it.kind]||0)+it.count;}
 t13Event('chest-loot',{id:c.id,items:c.items.map(i=>({...i}))});c.items=[];c.empty=true;r05Persist();terraSound('pickup');t13UpdateChestPanel();t13UI(true);
}
function t13CloseChest(){if(mode==='inventory')mode='playing';t13OpenChestId=null;t13ChestPanel.hidden=true;clearInput();canvas.focus({preventScroll:true});audioSync();}
function t13Recall(){const s=state;if(!s?.r05Arena||mode!=='playing'||s.t11Transition)return;if(s.phase==='battle'){note('战斗中不能使用返程魔镜。');return;}if(s.t13Recalling)return;s.t13Recalling=true;s.t13Recall=90;s.p.attack=0;s.t13Arrows=[];t13Event('recall-start');}
function t13UtilityStep(s,v){
 if(s.t13Accessories.regen&&s.hp<s.maxHp){if(++s.t13Regen>=60){s.hp++;s.t13Regen=0;}}else s.t13Regen=0;
 if(s.t13Recalling){s.p.vx=0;if(s.ticks%4===0)t10Burst(s,s.p.x+s.p.w/2,s.p.y+s.p.h*.5,'gel',3);if(--s.t13Recall<=0){s.mounted=false;s.t10PendingMount=null;r07SetMountHeight(s,false);Object.assign(s.p,{x:154,y:454,vx:0,vy:0,grounded:true,support:'tile:9:0',invuln:90});s.cam=0;s.camY=-96;s.t13Recalling=false;s.tool=0;clearInput();t13Event('recall-complete');}}
 if(s.r05Arena){const near=t13ClosestChest(s);s.t13ChestNearby=near?.id||null;const pressed=false;s.t13UpWasDown=v.y<-.5;
  if(pressed&&near)t13OpenNearby();
  const fire=[...(s.campfires||[]),...(s.t13World?.fires||[])].some(f=>Math.abs(s.p.x+s.p.w/2-f.x)<320&&Math.abs(s.p.y+s.p.h/2-f.y)<220);
  s.campfireBuff=fire;s.r07Regen=0;if(fire&&s.hp<s.maxHp&&s.p.invuln===0){s.t13CozyTicks=(s.t13CozyTicks||0)+1;if(s.t13CozyTicks>=120){s.hp++;s.t13CozyTicks=0;}}else s.t13CozyTicks=0;
 }
}
// Single orchestration point; inner legacy code must not interpret tool use as mining/exit.
const t13MainStepBase=r04MainStep,t13ArenaStepBase=r05ArenaStep;
function t13AfterStep(s,v,use){s.t13LastInput={x:v.x,y:v.y,jump:v.jump};if(state!==s||mode!=='playing'||s.t11Transition)return;if(s.r05Arena)for(const tree of s.trees||[])if(tree.shake)tree.shake--;t13ToolStep(s,v,use);t13ArrowStep(s);t13DropStep(s);t13UtilityStep(s,v);if(s.r05Arena&&r05Builder)r05Builder.wood=s.wood;}
r04MainStep=function(v){const s=state;if(!s)return t13MainStepBase(v);if(mode==='playing'&&!s.t11Transition&&v.toolEdge)r06DigitTool((s.tool+1)%6);
 const use=!!(v.action||t13Pointer.down);t13MainStepBase({...v,toolEdge:false,action:s.tool===0?v.action:false});t13AfterStep(s,v,use);};
r05ArenaStep=function(v){const s=state;if(!s||mode!=='playing')return;if(!s.t11Transition&&v.toolEdge)r06DigitTool((s.tool+1)%6);
 const use=!!(v.action||t13Pointer.down);t13ArenaStepBase({...v,toolEdge:false,auxEdge:false,action:s.tool===0?v.action:false});t13AfterStep(s,v,use);};

// ---------- Native furniture silhouettes + reconstructed animated pixel flame ----------
function t13Flame(g,x,y,tick,wide=false,phase=0){
 const frame=Math.floor(tick/5+phase)%6,wind=[-1,0,1,1,0,-1][frame],height=[8,11,10,13,9,11][frame];
 g.save();g.globalCompositeOperation='source-over';
 const count=wide?3:1;for(let i=0;i<count;i++){const xx=Math.round(x+(i-(count-1)/2)*7),yy=Math.round(y+(i%2)*2);
 g.fillStyle='#b64a21';g.fillRect(xx-3,yy-7,6,7);g.fillRect(xx-2+wind,yy-height,4,height-4);
 g.fillStyle='#efa53d';g.fillRect(xx-2,yy-7,4,7);g.fillRect(xx+wind,yy-height+3,2,6);
 g.fillStyle='#fff0a7';g.fillRect(xx-1,yy-5,2,5);}
 if(tick%40<24){g.globalAlpha=1-(tick%40)/28;g.fillStyle='#efbf5a';g.fillRect(Math.round(x+Math.sin(tick*.12+phase)*5),Math.round(y-13-tick%40*.7),1,2);}g.restore();
}
r07Furniture=function(kind,x,y,tick,phase=0){const fire=kind==='campfire',im=r06Images[fire?'campfirePlaced':'torchPlaced'];if(!im)return;
 if(fire){ctx.drawImage(im,0,18,48,14,Math.round(x-24),Math.round(y-14),48,14);t13Flame(ctx,x,y-9,tick,true,phase);}
 else{ctx.drawImage(im,0,9,20,11,Math.round(x-10),Math.round(y-11),20,11);t13Flame(ctx,x,y-11,tick,false,phase);}
};
const t13TileCache=new Map();
function t13TileTexture(kind,variant=0){const key=kind+':'+variant;if(t13TileCache.has(key))return t13TileCache.get(key);const cv=document.createElement('canvas');cv.width=cv.height=16;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 const earth=r06Images.t12Dirt;if(earth)g.drawImage(earth,18+variant%3*18,18,16,16,0,0,16,16);else{g.fillStyle='#755039';g.fillRect(0,0,16,16);}
 if(kind>=2){const d=g.getImageData(0,0,16,16);for(let i=0;i<d.data.length;i+=4){const lum=d.data[i]*.45+d.data[i+1]*.4+d.data[i+2]*.15;d.data[i]=lum*.84;d.data[i+1]=lum*.89;d.data[i+2]=lum*.99;d.data[i+3]=255;}g.putImageData(d,0,0);
  g.fillStyle='#343b48';g.fillRect((variant*3)%9,4,9,1);g.fillRect((variant*7)%10,11,7,1);}
 if(kind>=3&&kind<=5){const cols={3:['#784832','#c9874c','#efb277'],4:['#66534b','#a89383','#d6c6b2'],5:['#78602a','#d3ae46','#f4d978']}[kind];
 for(let i=0;i<5;i++){const x=2+Math.floor(t13Hash(i,variant,kind)*11),y=2+Math.floor(t13Hash(i+5,variant,kind)*11);g.fillStyle=cols[0];g.fillRect(x-1,y,5,4);g.fillStyle=cols[1];g.fillRect(x,y,3,3);g.fillStyle=cols[2];g.fillRect(x,y,2,1);}}
 t13TileCache.set(key,cv);return cv;
}
function t13DrawWorld(s){const w=s.t13World,c=s.cam,yc=s.camY||0,x0=Math.max(0,Math.floor(c/16)),x1=Math.min(w.cols-1,Math.ceil((c+R06_VIEW.w)/16)),y0=Math.max(0,Math.floor((yc-T13.top)/16)),y1=Math.min(w.rows-1,Math.ceil((yc+R06_VIEW.h-T13.top)/16));
 ctx.fillStyle='#1b1d27';ctx.fillRect(-c,T13.top,w.cols*16,w.rows*16);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const val=t13At(w,x,y),xx=Math.round(x*16-c),yy=T13.top+y*16,v=Math.floor(t13Hash(x,y)*3);
  if(val){ctx.drawImage(t13TileTexture(val,v),xx,yy);if(!t13At(w,x,y-1)){ctx.fillStyle=y===0?'#4e7937':'#92908a';ctx.fillRect(xx,yy,16,2);if(y===0){ctx.fillStyle='#739b4b';ctx.fillRect(xx+(x%3)*4,yy-3,2,3);ctx.fillRect(xx+8,yy-2,3,2);}}
   if(!t13At(w,x-1,y)){ctx.fillStyle='#a1a09733';ctx.fillRect(xx,yy,1,16);}if(!t13At(w,x+1,y)){ctx.fillStyle='#10192399';ctx.fillRect(xx+15,yy,1,16);}
   const crack=w.cracks[x+','+y];if(crack){ctx.strokeStyle='#20242a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xx+3,yy+2);ctx.lineTo(xx+8,yy+7);ctx.lineTo(xx+5,yy+14);if(crack>60){ctx.moveTo(xx+8,yy+7);ctx.lineTo(xx+13,yy+5);ctx.lineTo(xx+15,yy+11);}ctx.stroke();}
  }else{ctx.fillStyle=['#292a33','#242731','#2a2d35'][v];ctx.fillRect(xx,yy,16,16);ctx.fillStyle='#42414a';if(t13Hash(x,y,61)>.72)ctx.fillRect(xx+3,yy+5,6,1);
   if(y>0&&t13At(w,x,y-1)>0&&t13Hash(x,y)>.78){ctx.fillStyle='#6c6758';ctx.fillRect(xx+7,yy,3,6);ctx.fillRect(xx+8,yy+6,1,4);}}
 }
 for(const room of w.chests){if(room.x<c-140||room.x>c+R06_VIEW.w+140||room.y<yc-100||room.y>yc+R06_VIEW.h+80)continue;
  // Reconstructed little mining shelters, behind the interactive native chest.
  for(let yy=T13.top+Math.floor((room.y-46-T13.top)/16)*16;yy<room.y+28;yy+=16)for(let xx=Math.floor((room.x-46)/16)*16;xx<room.x+78;xx+=16){if(t13Cell(w,xx+8,yy+8))continue;ctx.fillStyle='#594536';ctx.fillRect(xx-c,yy,15,15);ctx.fillStyle='#846243';ctx.fillRect(xx-c,yy,15,1);}
  const im=r06Images.chestItem;if(im&&!room.removed){if(!room.opened)ctx.drawImage(im,Math.round(room.x-c),room.y);else{ctx.drawImage(im,0,10,32,18,room.x-c,room.y+10,32,18);ctx.drawImage(im,0,0,32,10,room.x-c,room.y-3,32,10);}}
 }
}
let t13LightCache={key:'',canvas:null,x:0,y:0,w:0,h:0};
function t13LightSources(s){const p=s.p,all=[];for(const t of [...s.lamps,...s.t13World.torches])all.push({x:t.x,y:t.y-15,r:1.06,g:.83,b:.51});for(const t of [...s.campfires,...s.t13World.fires])all.push({x:t.x,y:t.y-18,r:1.20,g:.82,b:.43});
 const body={x:p.x+p.w/2,y:p.y+p.h/2};all.push({...body,r:s.tool===4?1.2:.36,g:s.tool===4?.91:.39,b:s.tool===4?.59:.48});if(s.t13Recalling)all.push({...body,r:.4,g:1,b:1.2});
 for(const a of s.t13Arrows.filter((_,i)=>i%4===0))all.push({x:a.x,y:a.y,r:.45,g:.6,b:.9});return all;
}
function t13ApplyLighting(s){const w=s.t13World,camX=Math.floor(s.cam/16)-12,camY=Math.floor((s.camY||0)/16)-12,nx=Math.ceil(R06_VIEW.w/16)+25,ny=Math.ceil(R06_VIEW.h/16)+25;
 const key=[camX,camY,w.revision,Math.floor(s.ticks/5),s.tool,Math.floor(s.p.x/16),Math.floor(s.p.y/16)].join(':');
 if(key!==t13LightCache.key){const count=nx*ny,r=new Float32Array(count),g=new Float32Array(count),b=new Float32Array(count),solid=new Uint8Array(count),queue=[];
  for(let yy=0;yy<ny;yy++)for(let xx=0;xx<nx;xx++){const k=yy*nx+xx,wx=(camX+xx)*16+8,wy=(camY+yy)*16+8,depth=wy-T13.top;
   solid[k]=t13Cell(w,wx,wy)>0?1:0;const amb=depth<0?.70:depth<48?.07:.035;r[k]=amb;g[k]=amb;b[k]=amb*(depth>0?1.18:1);if(depth<0)queue.push(k);}
  for(const a of t13LightSources(s)){const xx=Math.floor(a.x/16)-camX,yy=Math.floor(a.y/16)-camY;if(xx>=0&&xx<nx&&yy>=0&&yy<ny){const k=yy*nx+xx;r[k]=Math.max(r[k],a.r);g[k]=Math.max(g[k],a.g);b[k]=Math.max(b[k],a.b);queue.push(k);}}
  let i=0;while(i<queue.length&&i<300000){const k=queue[i++],x=k%nx,y=Math.floor(k/nx),neighbors=[...(x>0?[k-1]:[]),...(x<nx-1?[k+1]:[]),...(y>0?[k-nx]:[]),...(y<ny-1?[k+nx]:[])];
   for(const n of neighbors){const att=(solid[n]||solid[k])?.63:.89,nr=r[k]*att,ng=g[k]*att,nb=b[k]*att;if(nr>r[n]+.014||ng>g[n]+.014||nb>b[n]+.014){r[n]=Math.max(r[n],nr);g[n]=Math.max(g[n],ng);b[n]=Math.max(b[n],nb);queue.push(n);}}}
  const cv=t13LightCache.canvas||document.createElement('canvas');cv.width=nx;cv.height=ny;const gx=cv.getContext('2d'),img=gx.createImageData(nx,ny);for(let k=0;k<count;k++){img.data[k*4]=Math.min(255,255*r[k]);img.data[k*4+1]=Math.min(255,255*g[k]);img.data[k*4+2]=Math.min(255,255*b[k]);img.data[k*4+3]=255;}gx.putImageData(img,0,0);t13LightCache={key,canvas:cv,x:camX*16,y:camY*16,w:nx*16,h:ny*16,visits:i};
 }
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.imageSmoothingEnabled=true;ctx.drawImage(t13LightCache.canvas,t13LightCache.x-s.cam,t13LightCache.y-(s.camY||0),t13LightCache.w,t13LightCache.h);ctx.restore();
}
const t13ProjectilesBase=r06DrawProjectiles;
r06DrawProjectiles=function(s,c){t13ProjectilesBase(s,c);const sc=t10Scale(s);ctx.save();
 for(const a of s.t13Arrows||[]){for(let i=0;i<a.trail.length;i++){const tr=a.trail[i];ctx.globalAlpha=i/a.trail.length*.45;ctx.fillStyle=a.kind==='holy-star'?'#fbe9a7':'#bcd7ee';ctx.fillRect(tr.x-c-sc,tr.y-sc,2*sc,2*sc);}ctx.globalAlpha=1;ctx.save();ctx.translate(a.x-c,a.y);ctx.rotate(Math.atan2(a.vy,a.vx));
  if(a.kind==='holy-star'){const im=r06Images.star;if(im){ctx.rotate(a.age*.1);ctx.drawImage(im,-8*sc,-8*sc,16*sc,16*sc);}}
  else{ctx.fillStyle='#c5a363';ctx.fillRect(-10*sc,-sc,19*sc,2*sc);ctx.fillStyle='#e8f6ff';ctx.beginPath();ctx.moveTo(12*sc,0);ctx.lineTo(5*sc,-3*sc);ctx.lineTo(5*sc,3*sc);ctx.closePath();ctx.fill();ctx.fillStyle='#78afe2';ctx.fillRect(-10*sc,-3*sc,4*sc,2*sc);ctx.fillRect(-10*sc,sc,4*sc,2*sc);}ctx.restore();}
 for(const d of s.t13Drops||[]){const yy=Math.round(d.y),xx=Math.round(d.x-c);if(d.kind==='wood'){const im=photos.wood;if(im)ctx.drawImage(im,xx,yy,14,8);}else if(d.kind==='acorn'){ctx.fillStyle='#ac793f';ctx.fillRect(xx+3,yy+3,5,6);ctx.fillStyle='#66482b';ctx.fillRect(xx+2,yy+1,7,3);}else if(d.kind==='chest'){r06Icon(ctx,'chestItem',xx+5,yy+5,14);}else{const val={dirt:1,stone:2,copper:3,iron:4,gold:5}[d.kind]||1;ctx.drawImage(t13TileTexture(val),xx,yy,10,10);}}
 ctx.restore();
};
function t13DrawCursor(s){if(s.tool<1||s.t11Transition)return;const t=t13ToolTarget(s,s.t13LastInput),base=s.r05Arena?T13.top:0,x=Math.floor(t.x/16)*16,y=base+Math.floor((t.y-base)/16)*16;
 ctx.save();ctx.lineWidth=1;ctx.strokeStyle=t13InReach(s,t)?'#ffe390':'#d98876';ctx.strokeRect(Math.round(x-s.cam)+.5,y+.5,15,15);ctx.restore();}
r06DrawArena=function(){const s=state,p=s.p,c=s.cam,yc=s.camY??-96;r05Viewport(true);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,R06_VIEW.w,R06_VIEW.h);t12Background(s);ctx.save();ctx.translate(0,-yc);
 for(const tree of s.trees||[])if(!tree.t13Gone&&tree.x-c>-120&&tree.x-c<R06_VIEW.w+120)t12DrawTree(ctx,{...tree,x:tree.x+(tree.shake?Math.sin(tree.shake)*1.2:0)},c);
 if(s.t13World)t13DrawWorld(s);else t12DrawGround(s,c);
 for(const q of s.level.surfaces.concat(s.built))if(q.oneWay&&q.type!=='rail'&&q.y>yc-10&&q.y<yc+R06_VIEW.h+10)r05DrawWood(q,c);
 for(const f of [...s.campfires,...(s.t13World?.fires||[])])if(f.x-c>-30&&f.x-c<R06_VIEW.w+30&&f.y>yc-40&&f.y<yc+R06_VIEW.h+40)r07Furniture('campfire',f.x-c,f.y,s.ticks,f.phase);
 for(const t of [...s.lamps,...(s.t13World?.torches||[])])if(t.x-c>-20&&t.x-c<R06_VIEW.w+20&&t.y>yc-40&&t.y<yc+R06_VIEW.h+40)r07Furniture('torch',t.x-c,t.y,s.ticks,t.phase);
 t12DrawChest(s,c);t11DrawPipe(s.pipe,c);
 for(const m of s.servants)r05DrawServant(m,c);r05DrawEye(s.eye,c);r07DrawLoot(s,c);r06DrawProjectiles(s,c);r06DrawMount(s,c);
 if(s.t11Transition||!(p.invuln&&Math.floor(s.ticks/4)%2))r06DrawBody(ctx,p.x+p.w/2-c,p.y+p.h,p.attack?p.attackFacing:p.facing,p.grounded&&Math.abs(p.vx)>.1?p.walk:0,!p.grounded,p.attack,s.tool,1,r06Armor(s),r06Weapon(s),1);
 if(s.t11Transition)t11DrawPipe(s.pipe,c);t13DrawCursor(s);
 for(const n of s.numbers){ctx.save();ctx.globalAlpha=Math.min(1,n.life/12);r05Text(n.text,n.x-c,n.y,16,n.color,'center');ctx.restore();}ctx.restore();
 if(s.t13World)t13ApplyLighting(s);r07HUD(s);

 if(s.t13Recalling)r05Text('魔镜返程…',R06_VIEW.w/2,R06_VIEW.h/2,20,'#b8efff','center');trioUI();
};
const t13MainDrawBase=r04MainRender;
r04MainRender=function(){t13MainDrawBase();if(state?.stage===0&&!state.r05Arena&&mode==='playing'){ctx.save();ctx.translate(0,-(state.r07CamY||0));t13DrawCursor(state);ctx.restore();}};

// ---------- Toolbar is BEFORE the canvas, including the fullscreen root ----------
const t13CSS=document.createElement('style');t13CSS.textContent=`
#t12Toolbar{display:none!important}
#t13Dock{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;background:#172633;border:1px solid #496071;padding:8px;margin:0 0 8px;width:100%;box-sizing:border-box;border-radius:9px;position:relative;z-index:9;color:#e4e8e4;font-family:inherit}
#t13Dock[hidden]{display:none!important}
#t13Dock .t13Slot{display:flex;align-items:center;justify-content:center;gap:5px;position:relative;min-width:0;padding:6px 3px;border:1px solid #627280;border-radius:5px;background:#25384a;color:#f0f1e8;cursor:pointer;min-height:59px;font-family:inherit}
#t13Dock .t13Slot[aria-pressed=true]{border-color:#eed29c;background:#4b4b42;box-shadow:inset 0 0 0 1px #dfbb71}
#t13Dock .t13Slot:disabled{opacity:.67;cursor:default}#t13Dock .t13Slot canvas{width:29px;height:29px;image-rendering:pixelated;flex:none}
#t13Dock .t13Slot b{font-size:11px;display:block;line-height:1.35;overflow-wrap:anywhere}#t13Dock .t13Slot small{font-size:9px;color:#c6d2dc;display:block;line-height:1.5}#t13Dock .t13Slot kbd{position:absolute;top:2px;right:4px;font-size:9px;color:#cab788}
#t13Dock .t13Info{grid-column:1/-1;font-size:11px;line-height:1.55;color:#cfddd5;display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center}
#t13Dock .t13Info button{font-size:10px;padding:3px 7px;min-height:24px;border:1px solid #647687;background:#283d4d;border-radius:4px;color:#f1e5c4;cursor:pointer}#t13Dock .t13Info span{flex:1;min-width:120px}
.screen-shell:fullscreen{background:#111b25;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100vw;max-width:none!important;height:100dvh;margin:0;padding:8px;box-sizing:border-box;overflow:auto}
.screen-shell:fullscreen #t13Dock{max-width:1080px;flex:none}.screen-shell:fullscreen #stage{max-width:calc(100vw - 20px)!important;max-height:calc(100dvh - 145px)!important;width:auto!important;height:calc(100dvh - 145px)!important;aspect-ratio:16/15!important;flex:0 1 auto}
.screen-shell:fullscreen #stage.r05-arena{aspect-ratio:16/9!important}.screen-shell:fullscreen #game{width:100%!important;height:100%!important;object-fit:contain}
.screen-shell:fullscreen #t10BuildLabel,.screen-shell:fullscreen .stage-tools{display:none}
#t13ChestPanel{position:fixed;inset:0;z-index:1000;background:#09111bc7;display:grid;place-items:center;padding:16px;color:#f1eadc;font-family:inherit}#t13ChestPanel[hidden]{display:none!important}
#t13ChestPanel .t13ChestBox{width:min(460px,100%);background:#203342;border:2px solid #a08251;padding:20px;border-radius:9px;box-shadow:0 15px 60px #0009}#t13ChestPanel h2{font-size:21px;margin:0 0 12px}#t13ChestItems{display:grid;gap:8px;margin:14px 0}#t13ChestItems div{background:#10222e;border:1px solid #465a64;padding:12px;font-size:14px}#t13ChestPanel button{margin:5px 10px 0 0;padding:10px 20px;background:#bfa16d;color:#111e27;border:0;border-radius:4px;font-weight:bold;cursor:pointer}#t13ChestPanel p{font-size:12px;line-height:1.6;color:#bccacc}
@media(max-width:680px){#t13Dock{grid-template-columns:repeat(3,minmax(0,1fr));padding:5px;gap:4px}#t13Dock .t13Slot{min-height:44px;padding:3px}#t13Dock .t13Slot canvas{width:25px;height:25px}.screen-shell:fullscreen #stage{max-height:calc(100dvh - 205px)!important;height:calc(100dvh - 205px)!important}}
`;document.head.append(t13CSS);
const t13Dock=document.createElement('div');t13Dock.id='t13Dock';t13Dock.setAttribute('role','group');t13Dock.setAttribute('aria-label','武器和工具切换');
t13Dock.innerHTML=Array.from({length:6},(_,i)=>`<button class="t13Slot" type="button" data-t13-tool="${i}" aria-pressed="${i===0}"><canvas width="40" height="40"></canvas><span><b></b><small></small></span><kbd>${i+1}</kbd></button>`).join('')+'<div class="t13Info"><span id="t13InfoText"></span><button id="t13Swap" type="button">Q 换武器</button><button id="t13Recall" type="button">B 魔镜回地面</button></div><div class="t13Info"><span id="t13OreText"></span></div>';
$('stage').before(t13Dock);
for(const b of t13Dock.querySelectorAll('.t13Slot'))b.onclick=()=>{if(mode!=='playing')return;clearInput();r05CancelPointer();t13Pointer.active=false;r06DigitTool(+b.dataset.t13Tool);canvas.focus({preventScroll:true});render();};
$('t13Swap').onclick=()=>{t13CycleWeapon();canvas.focus({preventScroll:true});};$('t13Recall').onclick=()=>{t13Recall();canvas.focus({preventScroll:true});};
const t13ChestPanel=document.createElement('div');t13ChestPanel.id='t13ChestPanel';t13ChestPanel.hidden=true;t13ChestPanel.setAttribute('role','dialog');t13ChestPanel.setAttribute('aria-modal','true');t13ChestPanel.innerHTML='<section class="t13ChestBox"><h2 id="t13ChestTitle"></h2><p>地下宝箱 · 开箱时游戏暂停</p><div id="t13ChestItems"></div><button type="button" id="t13ChestTake">全部取出</button><button type="button" id="t13ChestClose">关闭 · Esc</button><p id="t13ChestHint"></p></section>';$('stage').closest('.screen-shell').append(t13ChestPanel);
$('t13ChestTake').onclick=t13TakeChest;$('t13ChestClose').onclick=t13CloseChest;
function t13UpdateChestPanel(){const c=state?.t13World?.chests.find(c=>c.id===t13OpenChestId);if(!c)return;$('t13ChestTitle').textContent=c.name;$('t13ChestItems').replaceChildren();
 for(const i of c.items){const d=document.createElement('div');d.textContent=(T13_LOOT_NAMES[i.kind]||i.kind)+' ×'+i.count;$('t13ChestItems').append(d);}
 if(c.empty)$('t13ChestItems').textContent='箱子已空';$('t13ChestTake').disabled=c.empty;$('t13ChestHint').textContent='饰品自动装备；生命水晶提升生命上限。取得的武器可按 Q 切换。';
}
T10_SOUND_FILES.bow='bow.wav';t10SoundStatus.bow={state:'not-loaded',file:'bow.wav',embedded:false};
const t13PauseBase=togglePause;togglePause=function(){if(mode==='inventory'){t13CloseChest();return;}t13PauseBase();t13Pointer.down=false;};
$('fullButton').addEventListener('click',async e=>{if(!isTrio())return;e.stopImmediatePropagation();e.preventDefault();try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').closest('.screen-shell').requestFullscreen();}catch{note('当前浏览器未允许全屏。');}},true);
let t13UILast='',t13UIStamp=-1;
function t13UI(force=false){const s=state;t13Dock.hidden=!isTrio();t12Toolbar.hidden=true;if(!isTrio()){t13ChestPanel.hidden=true;return;}
 if(mode!=='inventory')t13ChestPanel.hidden=true;$('bestLabel').textContent='R14';t10Build.textContent='R14 · 近身挖掘 / 火把照明';document.querySelector('header .offline').textContent='TERRARIA · 1-3';
 r06SyncKitTools();const inv=s?.t13Inventory||{torch:60,arrows:0},selected=s?.tool||0,weapon=s?r06Weapon(s):'starfury',sig=[mode,selected,weapon,s?.wood,inv.torch,inv.arrows,s?.hp,s?.maxHp,s?.phase,r08ImageRevision].join('|');
 if(force||sig!==t13UILast){t13UILast=sig;const names=[weapon==='stormbow'?'风暴弓':tools[0],'木平台','铜斧','铜镐','火把','篝火'],keys=[weapon,'wood','axe','pickaxe','torchPlaced','campfireItem'];
 const hints=[weapon==='stormbow'?'神圣箭 '+inv.arrows:'J / 左键','木材 '+(s?.wood??160),'3伤害 · 4.5击退','挖矿 / 拆平台',inv.torch+' 支','10木材 / 个'];
 t13Dock.querySelectorAll('.t13Slot').forEach((b,i)=>{b.setAttribute('aria-pressed',String(selected===i));b.disabled=!s||mode!=='playing';b.querySelector('b').textContent=names[i];b.querySelector('small').textContent=hints[i];const g=b.querySelector('canvas').getContext('2d');g.clearRect(0,0,40,40);g.imageSmoothingEnabled=false;r06Icon(g,keys[i],20,20,34);});}
 if(force||s?.ticks!==t13UIStamp){t13UIStamp=s?.ticks;
 $('t13InfoText').textContent=s?'生命 '+s.hp+'/'+s.maxHp+' · '+(s.kit?r06Kit(s).armorName:'铂金套')+(s.cloudJump?' · 云朵瓶':'')+(s.campfireBuff?' · 篝火恢复':''):'1–6 / E 选择工具 · J 或鼠标左键使用';
 const depth=s?.r05Arena?Math.max(0,Math.floor((s.p.y+s.p.h-T13.top)/16)):0;
 $('t13OreText').textContent=s?.r05Arena?'深度 '+depth+' 格 · 铜 '+(inv.copper||0)+' / 铁 '+(inv.iron||0)+' / 金 '+(inv.gold||0)+' · L / ↑ / 右键开地下宝箱'+(s.t13Accessories?.regen?' · 再生手环':'')+(s.t13Accessories?.boots?' · 赫尔墨斯靴':''):'主线原平台保留 · 铜斧砍树并掉落木材 · 管道口 ↓ 进入隐藏关';
 $('t13Recall').hidden=!s?.r05Arena;$('t13Recall').disabled=mode!=='playing'||s?.phase==='battle';$('t13Swap').disabled=mode!=='playing';}
 $('r06Summon').hidden=true;t11ChestButton.hidden=true;
 if(!s)$('overlayText').textContent='泰拉瑞亚 1-3｜铂金套与星怒开局；隐藏宝箱给云朵瓶、风暴弓和眼球。战后铜镐挖矿、探索地下宝箱。';
 $('heroHelp').textContent='1–6 或点击游戏上方六格栏换工具，E 循环；J / 左键使用，Q 换已获武器。铜斧可伤敌、砍树，木材落地后拾取。地下 L / ↑ / 右键开箱，B 魔镜回地面。';
 if(s?.r05Arena)$('relayMessage').textContent=s.phase==='battle'?'克苏鲁之眼战斗中 · 风暴弓发射神圣箭雨；H 治疗。':s.phase==='cleared'?'战后探索：右侧草地用铜镐下挖；B 回到地面，原管道 ↓ 返回主线。':'入口宝箱自动打开，最后拾取右侧眼球开始战斗。';
}
const t13UIBase=r06UpdateUI;r06UpdateUI=function(){t13UIBase();t13UI();};
r04PauseHelp=function(){return '1–6 / E 选工具；J / 左键使用；Q 换武器。铜斧伤敌与砍树；铜镐挖矿。地下 L / ↑ / 右键开箱，B 魔镜回地面。空格跳跃；↓＋空格下穿；H 治疗；F 上下骑。';};
const t13Diagnostics={version:T13.version,config:T13,ready:Promise.all(r06AssetJobs),events:()=>t13Log,weapon:()=>r06Weapon(state),pose:()=>t10WorldPose(state),
 world:()=>state?.t13World?{cols:state.t13World.cols,rows:state.t13World.rows,top:T13.top,solid:wCount(state.t13World),mined:state.t13World.mined,chests:state.t13World.chests,torches:state.t13World.torches.length,fires:state.t13World.fires.length}:null,
 inventory:()=>({...state.t13Inventory,wood:state.wood,accessories:{...state.t13Accessories}}),
 cell:(x,y)=>t13At(state.t13World,x,y),drops:()=>state.t13Drops,arrows:()=>state.t13Arrows,open:t13OpenNearby,take:t13TakeChest,close:t13CloseChest,recall:t13Recall,
 light:()=>({key:t13LightCache.key,w:t13LightCache.w,h:t13LightCache.h,visits:t13LightCache.visits}),
 fixtures:{target(x,y){t13Pointer.active=true;t13Pointer.lastMove=performance.now();t13Pointer.x=x;t13Pointer.y=y;t13Pointer.sx=x-state.cam;t13Pointer.sy=y-(state.r05Arena?state.camY:state.r07CamY||0);},resetPointer(){t13Pointer.active=t13Pointer.down=false;},mine(x,y){return t13Mine(state,{x:x*16+8,y:T13.top+y*16+8});},chop(){return chopTree();},tool(n){r06DigitTool(n);},worldSave:()=>!!mainState?.t13SavedWorld}
};
Promise.all([readyPromise,...r06AssetJobs]).then(()=>{t13UI(true);if(mode==='menu'&&isTrio())portrait();});

/* R14 — close-range smart mining and usable torches. Installed once, in the
 * existing Terraria closure, after the user's SIX-slot R13 (12000 HP / 128 rows).
 * No level reset, new game implementation, network dependency or new artwork.
 */
const T14_VERSION='R14 · 近身挖矿 / 地下火把';
const t14Log=[];
function t14Event(type,data={}){t14Log.push({type,tick:state?.ticks||0,...data});if(t14Log.length>700)t14Log.splice(0,150);}
function t14Center(s){return {x:s.p.x+s.p.w/2,y:s.p.y+s.p.h/2};}
function t14WorldY(s){return s.r05Arena?T13.top:0;}
function t14Grid(s,x,y){const base=t14WorldY(s),c=Math.floor(x/16),r=Math.floor((y-base)/16);return {x:c*16+8,y:base+r*16+8,c,r};}
function t14Keyboard(v={}){
 return !t13Pointer.down&&(!!v.action||Math.abs(v.x||0)>.2||Math.abs(v.y||0)>.2||
 ['KeyJ','KeyX','ShiftLeft','ShiftRight','ArrowDown','ArrowUp','ArrowLeft','ArrowRight','KeyW','KeyS','KeyA','KeyD'].some(k=>held.has(k)));
}
// Resolve the actually displayed canvas content, including object-fit letterboxing.
function t14CanvasRect(){
 const r=canvas.getBoundingClientRect(),cs=getComputedStyle(canvas),n=v=>parseFloat(v)||0;
 const bx=n(cs.borderLeftWidth)+n(cs.paddingLeft),by=n(cs.borderTopWidth)+n(cs.paddingTop);
 const cw=r.width-bx-n(cs.borderRightWidth)-n(cs.paddingRight),ch=r.height-by-n(cs.borderBottomWidth)-n(cs.paddingBottom);
 let width=cw,height=ch,left=r.left+bx,top=r.top+by;
 if(cs.objectFit==='contain'||cs.objectFit==='scale-down'){
  let scale=Math.min(cw/canvas.width,ch/canvas.height);if(cs.objectFit==='scale-down')scale=Math.min(1,scale);
  width=canvas.width*scale;height=canvas.height*scale;left+=(cw-width)/2;top+=(ch-height)/2;
 }
 return {left,top,width,height};
}
const t14SamplePointerBase=t13SamplePointer;
canvas.removeEventListener('pointermove',t14SamplePointerBase,true);
t13SamplePointer=function(e){
 const r=t14CanvasRect(),s=state;if(!s||r.width<=0||r.height<=0)return;
 if(e.clientX<r.left||e.clientX>r.left+r.width||e.clientY<r.top||e.clientY>r.top+r.height){t13Pointer.active=false;return;}
 const width=s.r05Arena?R06_VIEW.w:W,height=s.r05Arena?R06_VIEW.h:H;
 t13Pointer.sx=(e.clientX-r.left)/r.width*width;t13Pointer.sy=(e.clientY-r.top)/r.height*height;
 t13Pointer.x=t13Pointer.sx+(s.cam||0);t13Pointer.y=t13Pointer.sy+(s.r05Arena?(s.camY??-96):s.r07CamY||0);
 t13Pointer.active=true;t13Pointer.lastMove=performance.now();
};
canvas.addEventListener('pointermove',t13SamplePointer,true);
// Explicit keys take control immediately. A stationary old mouse location never
// steals J+direction; pointer clicks still aim precisely at the displayed tile.
function t14RawTarget(s,v={}){
 const p=s.p,sc=t10Scale(s),keyboard=t14Keyboard(v);
 if(!keyboard&&t13Pointer.active&&(t13Pointer.down||t13Pointer.lastMove>performance.now()-1500)){
  r05SyncPointer();return {x:t13Pointer.x,y:t13Pointer.y,pointer:true};
 }
 const dy=Math.sign(Math.abs(v.y||0)>.3?v.y:0),dx=Math.sign(Math.abs(v.x||0)>.3?v.x:0);
 return {x:p.x+p.w/2+(dy&&!dx?0:(dx||p.facing)*(p.w/2+8)),
  y:dy>0?p.y+p.h+8:dy<0?p.y-8:p.y+p.h*.52,pointer:false,dx:dx||(!dy?p.facing:0),dy};
}
// Check multiple points INSIDE the actor's collision rectangle. Target-cell
// entry terminates a ray; the target's own solid pixels cannot block its use.
function t14Visible(s,t){
 if(!s.t13World)return true;
 const p=s.p,origin=t14Center(s),w=s.t13World,tx=Math.floor(t.x/16),ty=Math.floor((t.y-T13.top)/16);
 const origins=[origin,{x:origin.x,y:p.y+2},{x:origin.x,y:p.y+p.h-2},
  {x:p.x+2,y:origin.y},{x:p.x+p.w-2,y:origin.y}];
 return origins.some(a=>{const n=Math.max(1,Math.ceil(Math.hypot(t.x-a.x,t.y-a.y)/2));
  for(let i=0;i<=n;i++){const x=a.x+(t.x-a.x)*i/n,y=a.y+(t.y-a.y)*i/n,c=Math.floor(x/16),r=Math.floor((y-T13.top)/16);
   if(c===tx&&r===ty)return true;if(t13At(w,c,r)>0)return false;}
  return true;});
}
t13ClearRay=t14Visible;
function t14MineReason(s,t){
 if(!t13InReach(s,t))return '超出镐的距离';
 if(s.r05Arena&&s.phase==='battle')return '战斗中暂停挖掘';
 if(t.kind==='platform')return t14Visible(s,t)?'':'前方地块遮挡';
 const w=s.t13World;if(!w)return '主线原平台受保护';
 if(t.r<0||t.r>=w.rows||t.c<0||t.c>=w.cols)return '没有可挖地块';
 if(!t13At(w,t.c,t.r))return '空格';
 if(t13Protected(w,t.c,t.r))return '入口地基或边界受保护';
 if(t.r===0&&(s.trees||[]).some(a=>!a.t13Gone&&a.x>=t.c*16&&a.x<(t.c+1)*16))return '先用斧头砍树';
 if(w.chests.some(a=>!a.empty&&!a.removed&&Math.abs(a.y+a.h-(T13.top+t.r*16))<2&&t.c*16<a.x+a.w&&t.c*16+16>a.x))return '先取走宝箱物品';
 if(!t14Visible(s,t))return '前方地块遮挡';return '';
}
function t14MineCandidate(s,c,r){const t={...t14Grid(s,c*16+8,t14WorldY(s)+r*16+8),kind:'tile'};t.reason=t14MineReason(s,t);t.valid=!t.reason;return t;}
function t14PlatformCandidate(s,q){const t={x:q.x+q.w/2,y:q.y+Math.min(3,q.h/2),kind:'platform',platformId:q.id,c:Math.floor(q.x/16),r:Math.floor((q.y-t14WorldY(s))/16)};t.reason=t14MineReason(s,t);t.valid=!t.reason;return t;}
function t14ChooseMine(s,raw){
 const p=s.p,center=t14Center(s),w=s.t13World,grid=t14Grid(s,raw.x,raw.y),direct=t14MineCandidate(s,grid.c,grid.r);
 // Point at a block: do not silently mine something behind it, or elsewhere
 // when the clicked block is protected/out of reach.
 if(raw.pointer){
  if((w&&t13At(w,grid.c,grid.r)>0)||!t13InReach(s,grid))return {...direct,pointer:true,smart:false};
  const platform=(s.built||[]).find(q=>raw.x>=q.x&&raw.x<q.x+q.w&&Math.abs(raw.y-q.y)<10);
  if(platform)return {...t14PlatformCandidate(s,platform),pointer:true,smart:false};
 }
 const candidates=[],reach=88*t10Scale(s),base=t14WorldY(s);
 if(w){
  for(let r=Math.max(0,Math.floor((center.y-reach-base)/16));r<=Math.min(w.rows-1,Math.floor((center.y+reach-base)/16));r++)
   for(let c=Math.max(0,Math.floor((center.x-reach)/16));c<=Math.min(w.cols-1,Math.floor((center.x+reach)/16));c++){
    if(!t13At(w,c,r))continue;const t=t14MineCandidate(s,c,r);if(t.valid)candidates.push(t);
   }
 }
 for(const q of s.built||[]){const t=t14PlatformCandidate(s,q);if(t.valid)candidates.push(t);}
 let list=[];
 if(raw.pointer){
  // An empty cell at a block edge snaps locally, not all the way across a cave.
  list=candidates.filter(t=>Math.hypot(t.x-raw.x,t.y-raw.y)<=26)
   .map(t=>({...t,score:Math.hypot(t.x-raw.x,t.y-raw.y)}));
 }else{
  const dx=raw.dx||0,dy=raw.dy||0;
  for(const t of candidates){
   const x0=t.c*16,x1=x0+16,y0=t.kind==='platform'?t.y-3:base+t.r*16,y1=y0+(t.kind==='platform'?6:16);
   const gapX=Math.max(0,p.x-x1,x0-p.x-p.w),gapY=Math.max(0,p.y-y1,y0-p.y-p.h);
   const overlapX=x1>p.x+.2&&x0<p.x+p.w-.2,overlapY=y1>p.y+.2&&y0<p.y+p.h-.2;
   const vertical=dy&&(dy>0?y0>=p.y+p.h-1:y1<=p.y+1);
   const horizontal=dx&&(dx>0?x0>=p.x+p.w-1:x1<=p.x+1);
   if(dy&&!dx){if(!vertical)continue;t.score=gapY*8+(overlapX?0:600+gapX*5)+Math.abs(t.x-center.x)*.12;}
   else if(dx&&!dy){if(!horizontal)continue;t.score=gapX*8+(overlapY?0:600+gapY*5)+Math.abs(t.y-center.y)*.12;}
   else{if(!vertical&&!horizontal)continue;const along=(t.x-center.x)*dx+(t.y-center.y)*dy;if(along<=0)continue;t.score=Math.hypot(gapX,gapY)*8+Math.abs((t.x-center.x)*dy-(t.y-center.y)*dx);}
   list.push(t);
  }
 }
 list.sort((a,b)=>a.score-b.score||a.r-b.r||a.c-b.c);
 if(list.length)return {...list[0],pointer:raw.pointer,smart:true};
 return {...direct,pointer:raw.pointer,smart:!raw.pointer,valid:false,reason:direct.reason||'这个方向没有可挖地块'};
}
function t14TorchSpot(s,t){
 if(!t13InReach(s,t))return '超出放置距离';
 if(s.r05Arena&&s.phase==='battle')return '战斗期间不能建设';
 const box={x:t.c*16,y:t14WorldY(s)+t.r*16,w:16,h:16};
 if(t13PhysicalSurfaces(s,box).some(q=>q.solid&&near(q,box)))return '此格有实体方块';
 if(!t14Visible(s,t))return '墙体遮挡';
 // Underground walls are scenery, so wall torches can share the actor's cell.
 // Requiring an empty actor-sized box prevented use in narrow mineshafts.
 if(!s.r05Arena){const nearSupport={x:box.x-2,y:box.y-2,w:20,h:21};
  if(!solids().some(q=>near(q,nearSupport)))return '需要靠近地面或台面';}
 if(s.t13World&&(t.c<2||t.c>=s.t13World.cols-2||t.r>=s.t13World.rows-2))return '世界边界';
 return '';
}
function t14ChooseTorch(s,raw){
 const direct=t14Grid(s,raw.x,raw.y);direct.kind='torch';direct.reason=t14TorchSpot(s,direct);
 if(!direct.reason)return {...direct,pointer:raw.pointer,valid:true};
 if(!t13InReach(s,direct))return {...direct,pointer:raw.pointer,valid:false};
 const candidates=[];
 for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){
  const t={...t14Grid(s,direct.x+dc*16,direct.y+dr*16),kind:'torch'};
  if(!t14TorchSpot(s,t))candidates.push({...t,score:Math.hypot(t.x-raw.x,t.y-raw.y)});
 }
 candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
 return candidates.length?{...candidates[0],pointer:raw.pointer,smart:true,valid:true,reason:''}:{...direct,pointer:raw.pointer,valid:false};
}
const t14OriginalTarget=t13ToolTarget;
t13ToolTarget=function(s,v={}){
 const raw=t14RawTarget(s,v);
 if(s.tool===3)return t14ChooseMine(s,raw);
 if(s.tool===4)return t14ChooseTorch(s,raw);
 return raw;
};
const t14OriginalMine=t13Mine;
t13Mine=function(s,target){
 if(!target)return false;
 const t=target.kind?target:{...t14Grid(s,target.x,target.y),kind:'tile'};
 const reason=t14MineReason(s,t);
 if(reason){if(s.ticks%30===0)note(reason);t14Event('mine-rejected',{reason,c:t.c,r:t.r});return false;}
 if(t.kind==='platform'){
  const i=(s.built||[]).findIndex(q=>q.id===t.platformId);if(i<0)return false;
  const q=s.built.splice(i,1)[0];t13Drop(s,'wood',1,q.x,q.y);s.totalMined++;if(s.t13World){s.t13World.revision++;s.t13World.platforms=s.built;}
  if(s.p.support===q.id){s.p.grounded=false;s.p.support=null;}terraSound('break');t14Event('platform-recovered',{id:q.id});return true;
 }
 const mined=s.t13World?.mined||0,ok=t14OriginalMine(s,t);
 if(ok){t14Event('mine-strike',{c:t.c,r:t.r,smart:!!target.smart,pointer:!!target.pointer});if(s.t13World.mined>mined)t13LightCache.key='';}
 return ok;
};
const t14OriginalBeginTool=t13BeginTool;
t13BeginTool=function(s,v){
 if(s.tool===3||s.tool===4){const t=t13ToolTarget(s,v);s.t13Target=t;
  if(!t.valid){s.t13Use=8;if(t.reason&&s.ticks%30===0)note(t.reason);return;}}
 return t14OriginalBeginTool(s,v);
};
const t14OriginalPlace=t13Place;
t13Place=function(s,target,type){
 if(type!==4)return t14OriginalPlace(s,target,type);
 const t=target.kind==='torch'?target:t14ChooseTorch(s,{...target,pointer:true});
 const reason=t.valid===false?t.reason:t14TorchSpot(s,t);if(reason){note(reason);return false;}
 if((s.t13Inventory?.torch||0)<1){note('火把用完了，地下补给箱中可以补充。');return false;}
 const a=s.t13World?s.t13World.torches:(s.t14Torches||(s.t14Torches=[])),x=t.c*16+8,y=t14WorldY(s)+(t.r+1)*16;
 if(a.some(q=>Math.hypot(q.x-x,q.y-y)<15)){s.t14TorchMessage='此处已有火把';return false;}
 a.push({x,y,phase:s.ticks%8,wall:!!s.r05Arena,source:'player-r14'});s.t13Inventory.torch--;
 if(s.t13World)s.t13World.revision++;t13LightCache.key='';s.t14TorchMessage='火把已放置';
 terraSound('build',{volume:.6});t13Event('place',{type:4,x:x-8,y:y-16});t14Event('torch-placed',{x,y,stock:s.t13Inventory.torch,area:s.r05Arena?'mine':'main'});t13UI(true);return true;
};
// Pre-place actual fire/light objects on the floors of cave corridors. No white
// overlay or brightened screenshot: they are drawn by the same torch renderer.
function t14SeedLights(w){
 if(!w||w.t14Lights)return;const start=w.torches.length;
 function add(c,r){
  if(c<3||c>=w.cols-3||r<0||r>=w.rows-3||t13At(w,c,r)||t13At(w,c,r-1)||!t13At(w,c,r+1))return;
  const x=c*16+8,y=T13.top+(r+1)*16;
  if(w.torches.some(q=>Math.hypot(q.x-x,q.y-y)<112)||w.chests.some(q=>Math.abs(q.x+16-x)<38&&Math.abs(q.y+q.h-y)<34))return;
  w.torches.push({x,y,phase:(c+r)%8,wall:true,source:'r14-cave'});
 }
 for(let c=20;c<w.cols-4;c+=11)for(let r=6;r<w.rows-4;r++)add(c,r);
 for(let r=8;r<114;r+=8){for(const cx of [61+Math.sin(r*.067)*12,138+Math.sin(r*.055)*14]){
  const c=Math.round(cx);if(!t13At(w,c,r)&&!t13At(w,c,r-1)){
   const x=c*16+8,y=T13.top+(r+1)*16;if(!w.torches.some(q=>Math.hypot(q.x-x,q.y-y)<128))w.torches.push({x,y,phase:r%8,wall:true,source:'r14-shaft'});
  }
 }}
 // Mark both sides of the shallow pocket and the walk toward the mining region.
 for(let x=824;x<w.cols*16-64;x+=192){if(w.trees?.some(t=>Math.abs(t.x-x)<30))continue;
  if(!w.torches.some(q=>Math.hypot(q.x-x,q.y-T13.top)<112))w.torches.push({x,y:T13.top,phase:x%7,source:'r14-surface'});
 }
 w.t14Lights=true;w.t14AddedLights=w.torches.length-start;w.revision++;t14Event('cave-lit',{added:w.t14AddedLights,total:w.torches.length});
}
const t14GenerateBase=t13GenerateWorld;t13GenerateWorld=function(){const w=t14GenerateBase();t14SeedLights(w);return w;};
const t14RoomBase=t11PrepareRoom;t11PrepareRoom=function(s){t14RoomBase(s);t14SeedLights(s.t13World);t13LightCache.key='';};
const t14NewStateBase=newState;newState=function(){const s=t14NewStateBase();s.t14Torches=[];return s;};
const t14TerrainBase=drawTerraTerrain;
drawTerraTerrain=function(s){t14TerrainBase(s);for(const t of s.t14Torches||[]){if(t.x-s.cam< -25||t.x-s.cam>W+25)continue;
 ctx.save();ctx.translate(Math.round(t.x-s.cam),t.y);ctx.scale(.75,.75);r07Furniture('torch',0,0,s.ticks,t.phase);ctx.restore();}};
// The small held torch gets a visible animated flame, not just a brown stick.
const t14BodyBase=r06DrawBody;
r06DrawBody=function(g,x,foot,face,walk=0,air=false,attack=0,tool=0,opacity=1,armor='platinum',weapon='starfury',scale=.75){
 t14BodyBase(g,x,foot,face,walk,air,attack,tool,opacity,armor,weapon,scale);
 if(tool===4&&state&&(state.t13Inventory?.torch||0)>0){const pose=t10Pose(state,attack,tool);
  g.save();g.translate(Math.round(x),Math.round(t10BodyFoot(state,foot,scale)));g.scale(face*scale,scale);g.globalAlpha*=opacity;
  g.translate(pose.hand.x,pose.hand.y);g.rotate(pose.rotation);t13Flame(g,0,-8,state.ticks,false,1);g.restore();}
};
// Bright target reticle after underground lighting; hit test and reticle share
// exactly the same selected cell (including fullscreen camera conversion).
t13DrawCursor=function(s){
 if(s.tool<1||s.t11Transition||(s.r05Arena&&!s.t14CursorPostLight))return;
 const t=t13ToolTarget(s,s.t13LastInput||{}),base=t14WorldY(s),x=Math.floor(t.x/16)*16-s.cam,y=base+Math.floor((t.y-base)/16)*16;
 const ok=(t.valid!==false)&&t13InReach(s,t);ctx.save();ctx.strokeStyle=ok?'#ffe48c':'#ff8179';ctx.fillStyle=ok?'#ffe48c20':'#ff817918';ctx.lineWidth=1;
 ctx.fillRect(Math.round(x),y,16,16);ctx.strokeRect(Math.round(x)+.5,y+.5,15,15);
 ctx.fillStyle=ok?'#fff9d6':'#ffb3a1';for(const [dx,dy]of [[0,0],[13,0],[0,13],[13,13]])ctx.fillRect(Math.round(x)+dx,y+dy,3,3);
 if(s.tool===3&&s.t13World&&ok){const cracks=s.t13World.cracks[t.c+','+t.r]||0,material=t13At(s.t13World,t.c,t.r),req=material===1?90:material<=3?135:material===4?180:225;
  if(cracks){ctx.fillStyle='#0c1529';ctx.fillRect(Math.round(x),y+18,16,3);ctx.fillStyle='#ffe28d';ctx.fillRect(Math.round(x),y+18,16*Math.min(1,cracks/req),3);}}
 ctx.restore();s.t14Cursor={x:t.x,y:t.y,c:t.c,r:t.r,valid:ok,reason:t.reason||'',pointer:!!t.pointer,smart:!!t.smart};
};
const t14LightingBase=t13ApplyLighting;
t13ApplyLighting=function(s){t14LightingBase(s);s.t14CursorPostLight=true;ctx.save();ctx.translate(0,-(s.camY||0));t13DrawCursor(s);ctx.restore();s.t14CursorPostLight=false;};
// Cancel stale pointer use on pause and leaving the game, but not during a drag.
const t14ClearBase=clearInput;
clearInput=function(){t14ClearBase();t13Pointer.active=false;r05Pointer.active=false;};
window.addEventListener('pointercancel',()=>{t13Pointer.down=t13Pointer.active=false;r05Pointer.down=r05Pointer.pressed=false;},true);
canvas.addEventListener('pointerleave',()=>{if(!t13Pointer.down)t13Pointer.active=false;},true);
const t14AfterBase=t13AfterStep;
t13AfterStep=function(s,v,use){t14AfterBase(s,v,use);if(state===s)s.t13LastInput={x:v.x||0,y:v.y||0,jump:!!v.jump,action:!!v.action};};
const t14UIBase=r06UpdateUI;
r06UpdateUI=function(){t14UIBase();if(!isTrio())return;$('bestLabel').textContent='R14';t10Build.textContent=T14_VERSION;
 const badge=document.querySelector('header .offline');if(badge)badge.textContent='TERRARIA · 1-3';
 const torch=t13Dock.querySelector('[data-t13-tool="4"] small');if(torch)torch.textContent=(state?.t13Inventory?.torch??60)+' 支 · J 放置';
 $('heroHelp').textContent='R14：1–6 / E 换工具。4 铜镐：J 挖近身方块，方向键控制挖掘方向，左键精确选格。5 火把：J / 左键放置，窄井内可贴背景墙；地下通道已有照明。B 仍为魔镜返程。';
 if(state?.tool===3)$('actionLabel').textContent='铜镐 · 方向＋J 近身挖掘 / 左键选格';
 if(state?.tool===4)$('actionLabel').textContent='火把 · J / 左键放置 · 可贴地下背景墙';
};
r04PauseHelp=function(){return 'R14：1–6 / E 选工具。4 铜镐：方向＋J 挖最近地块；左键指定格子。5 火把：J / 左键放置。Q 换武器，L / ↑ / 右键开箱，B 魔镜回地面，空格跳跃，H 治疗，F 坐骑。';};
const t14Diagnostics={version:T14_VERSION,canvasRect:t14CanvasRect,events:()=>t14Log,target:(v={})=>t13ToolTarget(state,v),raw:(v={})=>t14RawTarget(state,v),cursor:()=>state.t14Cursor,
 torchCount:()=>({stock:state?.t13Inventory?.torch||0,world:state?.t13World?.torches.length||0,added:state?.t13World?.t14AddedLights||0,main:state?.t14Torches?.length||0}),
 torches:()=>state?.t13World?.torches||state?.t14Torches||[],light:t=>t14Visible(state,t),mineReason:t=>t14MineReason(state,t),
 fixtures:{world:()=>state.t13World,set:(c,r,n)=>t13Set(state.t13World,c,r,n),mine:t=>t13Mine(state,t),place:t=>t13Place(state,t,4),
 camera:(x,y)=>{state.cam=x;state.camY=y;},select:n=>r06DigitTool(n),torchPreview:t=>t14ChooseTorch(state,{...t,pointer:true})}
};


const T15_UI_IMAGES={"hudBoots": "@@E04:uri:a173@@", "hudRegen": "@@E04:uri:a174@@"};
