// Injected inside the recovered game's closure. Original map and Mario routines remain the authority.
let hero='mario',mixShots=[],mixCharge=0,mixHeld=false,mixHp=3,mixSpread=false,mixCool=0,mixAim=0;
let mixTier=0,upgradeFrames=0,mixCrouch=false,mixDeathOrigin=null;
const heroNames={mario:'马里奥',bill:'比尔',megaman:'洛克人'};
const heroHelp={mario:'原版移动与跳跃；蘑菇长大，火焰花发射火球。',bill:'按住 X / J / 手柄 B 连射；方向组合八向瞄准（↑+左右斜上、↓+左右斜下）；地面单按 ↓ 趴射，空中 ↓ 向下射击；砖平台 ↓ + 跳跃向下穿过；补给随机切换 M 连射、S 散弹、F 火球、L 激光；普通怪需两枪；接触敌人或中弹一击死亡，不能踩头；有剩余生命时自动就近复活，恢复普通枪并闪烁无敌约2秒。',megaman:'按住 X / J / 手柄 B 蓄力，松开发射；武器能量依次升级强化炮、破防贯穿炮。'};
const mixImages={};
const mixReady=Promise.all(['bill','megaman','mega-health-large','mega-weapon-energy-large','weapon-energy-small','projectiles/contra-normal','projectiles/contra-machine','projectiles/contra-spread','projectiles/contra-spread-far','projectiles/contra-fire','projectiles/contra-laser','projectiles/contra-laser-up','projectiles/contra-laser-diag'].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4)if(d.data[i]===111&&d.data[i+1]===49&&d.data[i+2]===152)d.data[i+3]=0;g.putImageData(d,0,0);mixImages[id]=c;resolve();};im.onerror=reject;im.src='assets/'+id+'.png';})));
function mixCrop(id,r,x,y,scale=1,flip=false){const im=mixImages[id];if(!im)return;ctx.save();ctx.translate(Math.round(x)+(flip?r[2]*scale:0),Math.round(y));ctx.scale(flip?-scale:scale,scale);ctx.drawImage(im,...r,0,0,r[2],r[3]);ctx.restore();}
function mixReset(){mixDeathOrigin=null;resetBillState();mixCrouch=false;mixTier=0;upgradeFrames=0;mixShots=[];mixCharge=0;mixHeld=false;mixHp=3;mixSpread=false;mixCool=0;mixAim=0;}
const originalResetLife=resetLife;resetLife=function(){mixReset();originalResetLife();if(hero!=='mario'){const bottom=player.y+player.h;player.h=hero==='bill'?30:24;player.y=bottom-player.h;}updateHeroUI();};
const originalLoadRoom=loadRoom;loadRoom=function(r){resetBillControls();mixShots=[];mixCharge=0;mixHeld=false;originalLoadRoom(r);};
const originalAudioPanel=updateAudioPanel;updateAudioPanel=function(){originalAudioPanel();if(bank.size===AUDIO_MANIFEST.length)audioStatus('音乐与音效已就绪');};
const originalDesiredMusic=desiredMusic;desiredMusic=function(){if(hero==='mario')return originalDesiredMusic();return mode==='playing'?(hero==='bill'?'bill_theme':'mega_theme'):null;};
// Keep original scheduling (including deathUntil); select character-specific recordings.
const originalOneShot=oneShot;oneShot=function(key,options={}){if(hero!=='mario'&&key==='death')key=hero==='bill'?'bill_death':'mega_death';return originalOneShot(key,options);};
const originalSfx=sfx;sfx=function(name){if(hero==='mario')return originalSfx(name);if(name==='jump')return;if(name==='kick'&&hero==='bill'){oneShot('bill_hit');return;}if(name==='power'){oneShot(hero==='megaman'?'mega_energy':'bill_pickup');return;}if(name==='hurt'){oneShot(hero==='megaman'?'mega_hurt':'bill_death');return;}originalSfx(name);};
// Original Mario power-up choice is untouched. Convert only newly spawned character power items.
const originalBumpTile=bumpTile;bumpTile=function(t){const isPower=t.content==='power',count=items.length;originalBumpTile(t);if(hero!=='mario'&&isPower&&items.length>count){const it=items[items.length-1];it.type=hero==='bill'?('bill-'+nextBillDrop()):(mixTier===0?'weaponenergy':'weaponcore');it.vx=0;}};
function showUpgrade(label){upgradeFrames=90;const n=$('upgradeNotice');if(n){n.textContent=label;n.hidden=false;}}
const originalTransform=transform;transform=function(it){if(hero==='mario'){const prior=player.power;originalTransform(it);if(player.power>prior)showUpgrade(player.power===1?'SUPER MARIO · 超级马里奥':'FIRE MARIO · 火焰马里奥');return;}if(it.type==='life'||it.type==='star')return originalTransform(it);mixTier=Math.min(2,mixTier+1);if(hero==='bill'){billWeapon=it.type.startsWith('bill-')?it.type.slice(5):'M';mixSpread=billWeapon==='S';}if(hero==='megaman')mixHp=3;addScore(1000,it.x,it.y);player.invuln=Math.max(player.invuln,45);sfx('power');showUpgrade(heroNames[hero]+' · '+(hero==='bill'?BILL_WEAPON_NAMES[billWeapon]:['普通炮','强化炮','破防贯穿炮'][mixTier]));updateHeroUI();};
const originalDamage=damage;damage=function(){if(hero==='mario')return originalDamage();if(mode!=='playing'||player.invuln||player.star)return;if(hero==='megaman'&&--mixHp>0){player.invuln=120;freeze=12;sfx('hurt');updateHeroUI();return;}die();};
const originalShoot=shoot;shoot=function(){if(hero==='mario')return originalShoot();};
function billPose(){const n=player.grounded&&!mixCrouch&&Math.abs(player.vx)>.1?Math.floor(billMotion)%3:-1;return{n,bob:n===1?1:0,x:Math.round(player.x+player.w/2),foot:Math.round(player.y+player.h)};}
function billMuzzle(){const q=billPose();if(billBase)return{x:billBase.x-(billBase.crouch?1:0),y:billBase.y-(billBase.crouch?32:38)};if(!player.grounded){const length=Math.hypot(billAimX,billAimY)||1;return{x:q.x+billAimX/length*14,y:q.foot-14+billAimY/length*14};}if(billAimX&&billAimY)return{x:q.x+player.facing*(billAimY<0?10.5:12.5),y:q.foot+(billAimY<0?-35:-14)+q.bob+(billFireFrames>0?1:0)};if(mixCrouch)return{x:q.x+player.facing*17,y:q.foot-9};if(mixAim)return q.n<0?{x:q.x-player.facing*1.5,y:q.foot-45}:{x:q.x+player.facing*2.5,y:q.foot-44+(billFireFrames>0?1:0)+q.bob};return{x:q.x+player.facing*13,y:q.foot-20.5+(billFireFrames>0?1:0)+q.bob};}
function mixFire(charged=false){if(hero==='bill')return fireBillWeapon();if(mixCool||mode!=='playing')return;const face=player.facing;let dx=face,dy=0;if(hero==='bill'&&mixAim){dx=0;dy=-1;}const muzzle=hero==='bill'?billMuzzle():{x:player.x+player.w/2+dx*12,y:player.y+player.h-13+dy*12};const speed=hero==='bill'?4.8:4;const angles=hero==='bill'&&mixTier===2?[-.32,-.16,0,.16,.32]:[0];const size=hero==='bill'?[3,5,6][mixTier]:0;const width=hero==='bill'?size:charged?(mixTier?27:12):(mixTier?12:8),height=hero==='bill'?size:charged?(mixTier?20:8):(mixTier?8:6);for(const a of angles){const vx=(dx*Math.cos(a)-dy*Math.sin(a))*speed,vy=(dy*Math.cos(a)+dx*Math.sin(a))*speed;mixShots.push({x:muzzle.x-width/2,y:muzzle.y-height/2,w:width,h:height,vx,vy,life:90,charged,tier:mixTier,damage:charged?2+mixTier:mixTier?2:1,piercing:hero==='megaman'&&charged&&mixTier===2,hitIds:[]});}mixCool=hero==='bill'?12:14;oneShot(charged?(mixTier?'mega_charge_nes':'mega_charge_weak'):'mega_shot_nes');}
function mixHitEnemy(e,s){killEnemy(e,true,100);return true;}
const originalUpdatePlayer=updatePlayer;updatePlayer=function(input){if(hero==='mario')return originalUpdatePlayer(input);mixAim=!!input.up&&!input.down;if(billFireFrames)billFireFrames--;if(input.left!==input.right&&(input.left||input.right))player.facing=input.left?-1:1;if(mixCool)mixCool--;if(hero!=='bill'){if(input.run){mixCharge=Math.min(90,mixCharge+1);if(mixCharge===(mixTier?30:45))oneShot('mega_charge_start');}if(!input.run&&mixHeld){for(const v of [...voices])if(v.key==='mega_charge_start')stopVoice(v);mixFire(mixCharge>=(mixTier?30:45));mixCharge=0;}mixHeld=!!input.run;}if(hero==='bill'){beginBillDescent(input);const wants=!!input.down&&player.grounded&&!input.jump&&!input.left&&!input.right;const target=wants?17:30;const candidate={x:player.x,y:player.y+player.h-target,w:player.w,h:target};if(target<player.h||!solids(candidate).length){player.y=candidate.y;player.h=target;mixCrouch=wants;}player.crouch=mixCrouch;if(mixCrouch)player.vx=0;}const priorX=player.x;originalUpdatePlayer({...input,jump:hero==='bill'&&billDropRow!==null?false:input.jump,run:true});if(hero==='bill'){const distance=Math.abs(player.x-priorX);if(player.grounded){billAirTicks=0;if(distance>.04&&!mixCrouch)billMotion+=distance/20;else billMotion=0;}else billAirTicks++;billAimDown=!!input.down&&!player.grounded;mixAim=!!input.up&&!input.down;jumpHeldPrev=!!input.jump;updateBillAim(input);if(input.run)mixFire();}};
function mixHitWall(s){const hits=solids(s);if(!hits.length)return true;for(const t of hits){if(t.content&&!t.used){bumpTile(t);continue;}if(t.type==='brick'&&!t.content&&!t.used){t.shotHp=(t.shotHp??2)-s.damage;if(t.shotHp<=0){tiles.delete(tileKey(t.x,t.y));addScore(50);sfx('break');for(let i=0;i<4;i++)particles.push({kind:'debris',x:t.x*T+i%2*8,y:t.y*T+Math.floor(i/2)*8,w:7,h:7,vx:(i%2?1:-1)*1.5,vy:-3.5,life:55});}else{sfx('bump');particles.push({kind:'spark',x:s.x,y:s.y,vy:-.5,life:10});}}else{sfx('bump');particles.push({kind:'spark',x:s.x,y:s.y,vy:-.5,life:10});}}return false;}
const originalUpdateEntities=updateEntities;updateEntities=function(){originalUpdateEntities();if(hero==='mario')return;for(const s of mixShots){if(!advanceMixProjectile(s))continue;if(!mixHitWall(s))s.life=0;if(s.life>0)for(const e of enemies)if(!e.dead&&e.active&&overlap(s,e)){if(!s.hitIds.includes(e.uid)){s.hitIds.push(e.uid);const damaged=mixHitEnemy(e,s);if(!damaged||!s.piercing)s.life=0;}break;}}mixShots=mixShots.filter(s=>s.life>0&&s.x>camera-20&&s.x<camera+W+20&&s.y>32&&s.y<H);};
const originalDrawItem=drawItem;drawItem=function(it){if(it.type.startsWith('bill-')){const col={M:0,S:2,L:3,F:4}[it.type.slice(5)];mixCrop('bill',[1+col*29,210,28,28],it.x-camera-7,it.y+it.h-26,1);return;}if(it.type==='weaponenergy'||it.type==='weaponcore'){const im=it.type==='weaponenergy'?'weapon-energy-small':'mega-weapon-energy-large';mixCrop(im,[Math.floor(frame/9)%2*32,Math.floor(frame/18)%2*32,32,32],it.x-camera-10,it.y+it.h-32);return;}originalDrawItem(it);};
const originalDrawPlayer=drawPlayer;drawPlayer=function(){if(hero==='mario')return originalDrawPlayer();const p=player;if((mode==='flag'&&flagPhase>=2)||mode==='win')return;if(p.invuln&&Math.floor(frame/4)%2&&mode!=='dying')return;const x=p.x-camera+p.w/2,y=p.y+p.h,face=p.facing,run=Math.abs(p.vx)>.1,jump=!p.grounded&&mode!=='pipe'&&!(mode==='flag'&&flagPhase===0);ctx.save();ctx.translate(Math.round(x),Math.round(y));if(face<0)ctx.scale(-1,1);
 if(hero==='bill'){const scale=1;if(mode==='dying'){drawBillDeath(0,0);}else if(mode==='flag'&&flagPhase===0){mixCrop('bill',[59+Math.floor(flagTimer/8)%2*29,65,28,57],-14,-55);}else if(jump){const n=Math.floor(billAirTicks/5)%4;mixCrop('bill',[117+n%2*29,123+Math.floor(n/2)*29,28,28],-14,-28);}else if(mixCrouch){mixCrop('bill',[130,mixCool?43:13,34,17],-17,-17);}else if(billAimX&&billAimY){const q=billPose(),r=q.n<0?[291,123]:[[320,123],[291,152],[320,152]][q.n];mixCrop('bill',[...r,28,28],-14,-26);mixCrop('bill',[billFireFrames>0?204:175,billAimY<0?123:65,28,57],-11,(billAimY<0?-56:-53)+q.bob);}else if(mixAim){const q=billPose();if(q.n<0)mixCrop('bill',[59,7,28,57],-14,-55);else{const r=[[320,123],[291,152],[320,152]][q.n];mixCrop('bill',[...r,28,28],-14,-26);mixCrop('bill',[billFireFrames>0?262:233,123,28,57],-14,-57+q.bob);}}else if(jump&&!mixCool&&!mixAim){const n=Math.floor(billAirTicks/5)%4;mixCrop('bill',[117+n%2*29,123+Math.floor(n/2)*29,28,28],-14,-28,scale);}else{const n=billPose().n,r=n<0?[291,123]:[[320,123],[291,152],[320,152]][n];mixCrop('bill',[...r,28,28],-14,-26,scale);mixCrop('bill',mixAim?[233,65,57,28]:[117,billFireFrames>0?94:65,57,28],-28,(-38+(n===1?1:0)),scale);}}
 else if(mode==='dying'&&mixDeathOrigin){
  // Original Mega Man death uses concentric sprite particles, not Mario's body arc.
  const age=Math.max(0,deathTick-12),cells=[[37,115],[55,115],[37,133],[55,133]];
  const r=[...cells[Math.floor(deathTick/4)%4],17,17];
  const cx=(mixDeathOrigin.x-p.x)*face,cy=mixDeathOrigin.y-(p.y+p.h);
  for(const [count,speed] of [[4,.8],[8,1.6]])for(let i=0;i<count;i++){
   const angle=i*Math.PI*2/count;
   mixCrop('megaman',r,cx+Math.cos(angle)*age*speed-8,cy+Math.sin(angle)*age*speed-9);
  }
 }else if(mode==='flag'&&flagPhase===0){
  mixCrop('megaman',[225,47,16,29],-8,-29,1,Math.floor(flagTimer/8)%2===1);
 }else {const col=jump?181:run?73+36*(Math.floor(p.anim/12)%3):37,row=mixCool?79:jump||run?43:7;mixCrop('megaman',[col,row,35,35],-17,-33);if(mixCool)mixCrop('megaman',[290,156,13,6],3,-14);if(mixCharge>=(mixTier?30:45)){ctx.strokeStyle=frame%8<4?'#7bffff':'#ffffff';ctx.strokeRect(-12,-26,24,25);}}
 ctx.restore();};
const originalDraw=draw;draw=function(){originalDraw();for(const s of mixShots){if(s.delay>0)continue;if(hero==='bill'){drawBillShot(s);continue;}const r=s.charged&&s.tier>0?[109+36*(Math.floor((90-s.life)/4)%3),115,35,35]:[73+18*(Math.floor((90-s.life)/5)%2),s.charged||s.tier?133:115,17,17];const cx=s.x+s.w/2-camera,cy=s.y+s.h/2;if(s.piercing){for(let i=2;i>0;i--){ctx.save();ctx.globalAlpha=.18/i;mixCrop('megaman',r,cx-r[2]/2-Math.sign(s.vx)*i*7,cy-r[3]/2,1,s.vx<0);ctx.restore();}}mixCrop('megaman',r,cx-r[2]/2,cy-r[3]/2,1,s.vx<0);}if(hero!=='mario'){ctx.fillStyle='#5c94fc';ctx.fillRect(22,14,56,9);hud(hero==='bill'?'BILL':'MEGAMAN',24,16);}updateHeroUI();};
const originalGetInput=getInput;getInput=function(){const input=originalGetInput();if(padActionConsumed&&!virtualInput&&!['Space','KeyK','KeyZ','ArrowUp','KeyW'].some(k=>keys.has(k))&&![...touch.values()].includes('jump'))input.jump=false;if(hero!=='mario'){input.up=virtualInput?!!virtualInput.up:keys.has('ArrowUp')||keys.has('KeyW')||!!padState?.buttons[12]?.pressed||(padState?.axes[1]??0)<-.4;if(!virtualInput&&(keys.has('ArrowUp')||keys.has('KeyW')))input.jump=keys.has('Space')||keys.has('KeyK')||keys.has('KeyZ')||[...touch.values()].includes('jump')||(!padActionConsumed&&!!padState?.buttons[0]?.pressed);}return input;};
let padState=null,padMenuPrevious=false,padSelectPrevious=0,padStartPrevious=false,padConfirmPrevious=false,padActionConsumed=false,padDialogIndex=0,padDialogMode='';
function focusPadDialog(){const buttons=[$('mainAction'),$('overlayCharacters')].filter(b=>!b.hidden);padDialogIndex=Math.min(padDialogIndex,buttons.length-1);buttons.forEach((b,i)=>b.classList.toggle('pad-selected',i===padDialogIndex));buttons[padDialogIndex]?.focus({preventScroll:true});return buttons[padDialogIndex];}
const padShowOverlay=showOverlay;showOverlay=function(...args){padDialogIndex=0;padDialogMode='';for(const id of ['mainAction','overlayCharacters'])$(id).classList.remove('pad-selected');padShowOverlay(...args);};
function pollMixPad(){
 if(virtualInput)return;
 try{padState=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected!==false)||null;}catch{padState=null;}
 const label=$('gamepadStatus');if(label)label.textContent=padState?'手柄已连接 · 方向选择 · A / Start 确认 · Select 重选':'手柄：连接后按一下按钮 · A 跳跃 · B / X 行动';
 if(!padState){padActionConsumed=false;padMenuPrevious=false;padStartPrevious=false;padConfirmPrevious=false;padSelectPrevious=0;return;}
 const start=!!padState.buttons[9]?.pressed,confirm=!!padState.buttons[0]?.pressed,menu=!!padState.buttons[8]?.pressed;
 if(!confirm)padActionConsumed=false;
 const horizontal=(padState.buttons[15]?.pressed||padState.axes[0]>.5?1:0)-(padState.buttons[14]?.pressed||padState.axes[0]<-.5?1:0),vertical=(padState.buttons[13]?.pressed||padState.axes[1]>.5?1:0)-(padState.buttons[12]?.pressed||padState.axes[1]<-.5?1:0),dir=horizontal||vertical;
 const dialog=['respawn','win','gameover','paused'].includes(mode);
 if(dialog){
  if(padDialogMode!==mode){padDialogMode=mode;padDialogIndex=0;focusPadDialog();$('overlayHint').textContent='↑ ↓ 选择 · A / START 确认 · SELECT 重选';}
  if(dir&&dir!==padSelectPrevious){padDialogIndex=(padDialogIndex+(dir>0?1:-1)+2)%2;focusPadDialog();}
  if((start&&!padStartPrevious)||(confirm&&!padConfirmPrevious)){if(confirm&&!padConfirmPrevious)padActionConsumed=true;audioInit();focusPadDialog()?.click();}
 }else{
  padDialogMode='';
  if(mode==='menu'&&dir&&dir!==padSelectPrevious){const ids=Object.keys(heroNames);selectHero(ids[(ids.indexOf(hero)+dir+3)%3]);document.querySelector('[data-hero="'+hero+'"]')?.focus();}
  if(start&&!padStartPrevious){audioInit();if(mode==='menu'){if(confirm)padActionConsumed=true;handlePrimary();}else togglePause();}
  else if(mode==='menu'&&confirm&&!padConfirmPrevious){padActionConsumed=true;audioInit();handlePrimary();}
 }
 if(menu&&!padMenuPrevious)showCharacters();
 padStartPrevious=start;padConfirmPrevious=confirm;padMenuPrevious=menu;padSelectPrevious=dir;
}
const originalFixedUpdate=fixedUpdate;fixedUpdate=function(){pollMixPad();if(hero==='bill'&&mode==='dying'&&deathTick>=89&&lives>0){reviveBillNearby();return;}originalFixedUpdate();if(upgradeFrames&&mode==='playing')upgradeFrames--;if($('upgradeNotice'))$('upgradeNotice').hidden=upgradeFrames===0;};
function updateHeroUI(){$('stage').style.setProperty('--scene-background',room==='under'&&hero==='bill'?'#183858':room==='under'?'#000000':'#5c94fc');const n=$('heroStatus');if(n)n.textContent=hero==='mario'?'马里奥 · '+(player?.power===2?'火焰':player?.power?'超级':'小马里奥'):hero==='bill'?'比尔 · '+BILL_WEAPON_NAMES[billWeapon]+(mixCrouch?' · 趴射':''):'洛克人 · '+['Lv.0 普通炮','Lv.1 强化炮','Lv.2 破防贯穿炮'][mixTier]+' · HP '+Math.max(0,mixHp)+'/3'+(mixCharge>=(mixTier?30:45)?' · 蓄力完成':'');}
function selectHero(id){if(!heroNames[id]||mode!=='menu')return;hero=id;for(const b of document.querySelectorAll('[data-hero]'))b.setAttribute('aria-pressed',String(b.dataset.hero===hero));$('actionLabel').textContent={mario:'加速 / 火球',bill:'按住连射',megaman:'按住蓄力 / 松开发射'}[id];$('downLabel').textContent=hero==='mario'?'下蹲 / 进入管道':hero==='bill'?'趴下 / 进入管道':'进入管道';$('heroHelp').textContent=heroHelp[id];$('overlayText').textContent=heroHelp[id];updateHeroUI();}
function showCharacters(){mode='menu';keys.clear();touch.clear();mixReset();resetGameAudio();showOverlay('CHOOSE YOUR HERO','WORLD<br>1 — 1',heroHelp[hero],'开始冒险 →','方向选择角色 · START / ENTER 开始');$('heroPicker').hidden=false;$('overlay').classList.add('choosing');$('overlayCharacters').hidden=true;updateHeroUI();requestAnimationFrame(()=>document.querySelector('[data-hero="'+hero+'"]')?.focus({preventScroll:true}));}
const originalStart=startGame;startGame=function(){$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');$('overlayCharacters').hidden=false;originalStart();};
$('charactersButton').addEventListener('click',()=>showCharacters());$('stageCharacters').addEventListener('click',()=>showCharacters());$('overlayCharacters').addEventListener('click',()=>showCharacters());window.addEventListener('keydown',e=>{if(e.code==='KeyC'){e.preventDefault();showCharacters();}else if(mode==='menu'&&['ArrowLeft','ArrowRight'].includes(e.code)){const ids=Object.keys(heroNames);selectHero(ids[(ids.indexOf(hero)+(e.code==='ArrowRight'?1:2))%3]);}});document.querySelectorAll('[data-hero]').forEach(b=>b.addEventListener('click',()=>selectHero(b.dataset.hero)));selectHero('mario');$('overlay').classList.add('choosing');
window.__mixReady=mixReady;
if(new URLSearchParams(location.search).has('test'))window.__mixTest={select(id){showCharacters();selectHero(id);startGame();draw();},state(){return{hero,weapon:billWeapon,crouch:mixCrouch,aimDown:billAimDown,aimX:billAimX,aimY:billAimY,dropRow:billDropRow,tier:mixTier,hp:mixHp,spread:mixSpread,charge:mixCharge,cool:mixCool,shots:mixShots.map(s=>({...s})),desired:desiredMusic()};},menu:showCharacters,ready:mixReady};

function drawPortraits(){for(const c of document.querySelectorAll('[data-portrait]')){const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,64,80);const id=c.dataset.portrait;if(id==='mario'){const im=classicSprite('small_idle');g.drawImage(im,Math.round(32-im.width),Math.round(65-im.height*2),im.width*2,im.height*2);}else if(id==='megaman'){g.drawImage(mixImages.megaman,37,7,35,35,-3,0,70,70);}else{g.drawImage(mixImages.bill,291,123,28,28,4,22,56,56);g.drawImage(mixImages.bill,117,65,57,28,-24,-2,114,56);}}}
mixReady.then(drawPortraits);
function integerFullscreen(){const scale=Math.min(innerWidth/256,innerHeight/240);$('stage').style.setProperty('--pixel-width',256*scale+'px');$('stage').style.setProperty('--pixel-height',240*scale+'px');}
addEventListener('resize',integerFullscreen);document.addEventListener('fullscreenchange',integerFullscreen);integerFullscreen();

// Bill-only bonus-room hooks; surface movement, poses and audio routes remain above.
const crossBaseLoadRoom=loadRoom;loadRoom=function(r){crossBaseLoadRoom(r);if(hero==='bill'&&r==='under')enterBillBase();else billBase=null;};
const crossBaseReset=mixReset;mixReset=function(){billBase=null;crossBaseReset();};
const crossBaseUpdatePlayer=updatePlayer;updatePlayer=function(input){if(billBase){updateBillBase(input);return;}crossBaseUpdatePlayer(input);};
const crossBaseDraw=draw;draw=function(){if(billBase){drawBillBase();return;}crossBaseDraw();};

// Scripted finish movement bypasses updatePlayer; advance its locomotion phase too.
const crossAdvanceFlag=advanceFlag;advanceFlag=function(){const priorX=player.x;crossAdvanceFlag();if(hero==='bill'&&mode==='flag'&&flagPhase===1){const distance=Math.abs(player.x-priorX);if(player.grounded){billAirTicks=0;if(distance>.01)billMotion+=distance/20;else billMotion=0;}else billAirTicks++;}};
if(window.__mixTest)window.__mixTest.placeNative=function(x,y){player.x=x;player.y=y;player.vx=0;player.vy=0;player.grounded=false;camera=clamp(x-100,0,LEVEL_WIDTH-W);draw();};

// Death anchors stay at the hit location; original Mario physics remain untouched.
const crossDie=die;die=function(){
 if(mode==='playing'&&hero!=='mario')mixDeathOrigin={x:player.x,y:player.y+player.h-15,foot:player.y+player.h,grounded:player.grounded};
 crossDie();
};
function drawBillDeath(x,y){
 const settled=mixDeathOrigin?.grounded&&deathTick>48&&player.y+player.h>=mixDeathOrigin.foot;
 if(settled)mixCrop('bill',[185,19,34,11],x-17,y+mixDeathOrigin.foot-(player.y+player.h)-11);
 else {const r=Math.floor(deathTick/7)%2?[250,44,23,15]:[251,13,23,18];mixCrop('bill',r,x-11,y-r[3]);}
}
const crossBeginPipe=beginPipe;beginPipe=function(){
 const entered=crossBeginPipe();
 if(entered&&hero==='bill'){
  const foot=player.y+player.h;player.h=30;player.y=foot-30;
  mixCrouch=false;player.crouch=false;mixAim=false;billAimX=player.facing;billAimY=0;
  pipeTransition.startY=player.y;
 }
 return entered;
};

// Bill loses a life on one hit and revives locally without rebuilding the room.
function billSafeRespawn(){
 const origin=mixDeathOrigin||{x:player.x,foot:FLOOR};
 const candidates=[];
 for(const t of tiles.values()){
  const q={x:t.x*T+3,y:t.y*T-30,w:10,h:30};
  if(q.y<40||q.y+q.h>FLOOR||solids(q).length||!solids({x:q.x,y:q.y+30,w:10,h:1}).length)continue;
  const nearScreen=q.x>=camera&&q.x+10<=camera+W;
  const clear=!enemies.some(e=>!e.dead&&overlap({x:q.x-20,y:q.y-8,w:50,h:46},e));
  candidates.push({...q,cost:Math.abs(q.x-origin.x)+Math.abs(q.y+30-Math.min(FLOOR,origin.foot))*.5+(nearScreen?0:400)+(clear?0:800)});
 }
 candidates.sort((a,b)=>a.cost-b.cost);
 return candidates[0]||{x:44,y:FLOOR-30};
}
function reviveBillNearby(){
 const spot=billBase?null:billSafeRespawn(),facing=player.facing;
 resetBillState();mixTier=0;mixSpread=false;mixCrouch=false;mixShots=[];shots=[];enemyShots=[];mixCool=0;mixCharge=0;mixHeld=false;mixAim=false;upgradeFrames=0;freeze=0;deathTick=0;
 if(billBase){Object.assign(billBase,{stun:0,crouch:false,upHeld:false,moving:false,walkDistance:0,walkFrame:0,hostile:[]});billBase.x=clamp(billBase.x,58,198);syncBillBasePlayer();}
 else{player=createPlayer(spot.x,spot.y);player.h=30;player.grounded=true;camera=clamp(camera,0,LEVEL_WIDTH-W);}
 player.facing=facing;player.invuln=120;player.star=0;player.vx=0;player.vy=0;
 mixDeathOrigin=null;if(timeLeft===0){timeLeft=400;timerTicks=0;}
 mode='playing';hideOverlay();resetGameAudio();audioSync();updateUi(true);updateHeroUI();
}
