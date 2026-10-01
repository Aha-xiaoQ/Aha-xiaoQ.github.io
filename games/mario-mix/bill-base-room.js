// Bill's Base 1 bonus room. Other characters retain the recovered underground room.
let billBase=null;
const BILL_BASE_FLOOR=208; // Original room's last blue-floor row 191 + offset 16 + exclusive edge 1.
const billBaseImages={};
const billBaseReady=Promise.all(['contra-base-room3','contra-base-room3-core','contra-base-floor-tile','contra-electric-fence','contra-bill-electric','contra-bill-crouch','contra-wall-turret-closed','contra-wall-turret-opening-1','contra-wall-turret-opening-2','contra-wall-turret-open'].map(id=>new Promise((resolve,reject)=>{
 const im=new Image();im.onload=()=>{billBaseImages[id]=im;resolve();};im.onerror=()=>reject(new Error('Base room asset: '+id));im.src='assets/contra-base/'+id+'.png';
}))).then(()=>{
 const clean=document.createElement('canvas');clean.width=256;clean.height=224;const g=clean.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(billBaseImages['contra-base-room3'],0,0);
 // Remove only the baked electric pixels; preserve the original fence posts and walls.
 for(const y of [136,152])for(let x=56;x<200;x+=32){const w=Math.min(32,200-x);g.drawImage(billBaseImages['contra-base-floor-tile'],0,0,w,8,x,y,w,8);}
 billBaseImages.cleanRoom=clean;
 const panel=document.createElement('canvas');panel.width=64;panel.height=48;const pg=panel.getContext('2d');pg.drawImage(clean,96,64,64,48,0,0,64,48);pg.fillStyle='#000';pg.fillRect(24,32,16,16);pg.fillRect(3,27,10,10);pg.fillRect(51,27,10,10);billBaseImages.openDoorPanel=panel;
});
function syncBillBasePlayer(){if(!billBase||!player)return;player.x=billBase.x-player.w/2;player.h=billBase.crouch?16:30;player.y=billBase.y-player.h;player.vx=0;player.vy=0;player.grounded=true;player.crouch=!!billBase.crouch;camera=0;}
function enterBillBase(){billBase={x:128,y:BILL_BASE_FLOOR,tick:0,walkDistance:0,walkFrame:0,moving:false,crouch:false,coreHitFlash:0,coreFeedback:0,coreHp:8,doorTicks:0,cleared:false,stun:0,upHeld:false,shocks:0,guards:[{x:96,y:104,w:16,h:16,hp:4,phase:0},{x:144,y:104,w:16,h:16,hp:4,phase:0}],hostile:[],reward:null,rewardClaimed:false,coinReward:null,coinsClaimed:false};mixShots=[];enemyShots=[];mixCool=0;mixCharge=0;mixHeld=false;mixCrouch=false;mixAim=true;freeze=0;syncBillBasePlayer();}
function updateBillBase(input){
 const b=billBase;if(!b)return;const priorX=b.x,priorY=b.y;b.moving=false;b.walkFrame=0;b.tick++;if(b.cleared)b.doorTicks=Math.min(32,b.doorTicks+1);if(b.coreHitFlash)b.coreHitFlash--;if(b.coreFeedback)b.coreFeedback--;if(player.invuln)player.invuln--;if(player.star)player.star--;if(mixCool)mixCool--;if(billFireFrames)billFireFrames--;
 b.crouch=!!input.down&&!b.stun;const up=!!input.up&&!b.crouch,wasUp=b.upHeld;b.upHeld=up;mixAim=true;billAimDown=false;mixCrouch=b.crouch;
 if(b.stun){b.stun--;syncBillBasePlayer();return;}
 if(up&&!wasUp&&!b.cleared){b.stun=48;b.shocks++;oneShot('bill_electric');syncBillBasePlayer();return;}
 if(!b.crouch)b.x=clamp(b.x+((input.right?1:0)-(input.left?1:0))*1.5,58,198);
 if(up&&b.cleared){b.x=approach(b.x,128,1.5);b.y=Math.max(126,b.y-1.5);if(b.y<=126){leaveBillBase();return;}}

 const distance=Math.hypot(b.x-priorX,b.y-priorY);b.moving=distance>.01;if(b.moving){b.walkDistance+=distance;b.walkFrame=Math.floor(b.walkDistance/12)%2;}else b.walkDistance=0;
 syncBillBasePlayer();if(input.run)fireBillWeapon();
}
const BASE_GUARD_FIRST_SHOT=120,BASE_GUARD_INTERVAL=120,BASE_GUARD_STAGGER=60,BASE_GUARD_WARNING=30;
function baseGuardFirstShot(g){return BASE_GUARD_FIRST_SHOT+billBase.guards.indexOf(g)*BASE_GUARD_STAGGER;}
function baseGuardWarning(g){const first=baseGuardFirstShot(g);return g.phase>=first-BASE_GUARD_WARNING&&(g.phase-(first-BASE_GUARD_WARNING))%BASE_GUARD_INTERVAL<BASE_GUARD_WARNING;}
function baseGuardsAlive(){return billBase.guards.filter(g=>g.hp>0);}
function updateBillBaseProjectiles(){
 const b=billBase;if(!b||mode!=='playing')return;const core={x:120,y:112,w:16,h:16};
 for(const g of b.guards){if(g.hp<=0){g.destroyTicks=(g.destroyTicks||0)+1;continue;}g.phase++;const phase=g.phase;g.open=phase>=24;
  // Single aimed shots, visible open barrel before firing, with a generous entry grace.
  const first=baseGuardFirstShot(g);
  if(phase>=first&&(phase-first)%BASE_GUARD_INTERVAL===0&&b.hostile.length<2){const dx=b.x-(g.x+8),dy=b.y-10-(g.y+16),d=Math.hypot(dx,dy)||1;b.hostile.push({x:g.x+6.5,y:g.y+14.5,w:3,h:3,vx:dx/d*.6,vy:dy/d*.6,life:240});}
 }
 for(const shot of mixShots){if(!advanceMixProjectile(shot))continue;

  const guard=b.guards.find(g=>g.hp>0&&overlap(shot,g));
  if(guard){shot.life=0;if(guard.open){guard.hp=Math.max(0,guard.hp-shot.damage);oneShot('bill_hit');if(!guard.hp){guard.destroyTicks=0;addScore(200,guard.x,guard.y);sfx('break');}}else sfx('bump');continue;}
  if(!b.cleared&&overlap(shot,core)){shot.life=0;if(baseGuardsAlive().length){sfx('bump');if(!b.coreFeedback){showUpgrade('核心受保护 · 先打掉两侧墙炮');b.coreFeedback=90;}continue;}
   b.coreHitFlash=8;b.coreHp=Math.max(0,b.coreHp-shot.damage);oneShot('bill_hit');if(!b.coreHp){b.cleared=true;b.stun=0;b.hostile=[];addScore(1000,128,112);sfx('break');b.reward={type:'bill-'+nextBillDrop(),x:121,y:130,w:14,h:14,age:0,vy:-3,targetX:58,grounded:false};b.coinReward={type:'base-coins',x:121,y:130,w:14,h:14,age:0,vy:-3,targetX:184,grounded:false};showUpgrade('基地攻破 · 左侧武器 / 右侧金币 · 可自行选择');}
  }
 }
 mixShots=mixShots.filter(shot=>shot.life>0&&shot.x+shot.w>32&&shot.x<224&&shot.y+shot.h>32&&shot.y<240);
 for(const shot of b.hostile){shot.x+=shot.vx;shot.y+=shot.vy;shot.life--;if(!b.crouch&&overlap(shot,player)){damage();shot.life=0;}}
 b.hostile=b.hostile.filter(shot=>shot.life>0&&shot.y<BILL_BASE_FLOOR&&mode==='playing');
 for(const [key,claimed] of [['reward','rewardClaimed'],['coinReward','coinsClaimed']]){const it=b[key];if(!it||b[claimed])continue;it.age++;
  if(!it.grounded){it.x=approach(it.x,it.targetX,2);it.vy+=.18;it.y+=it.vy;if(it.y+it.h>=BILL_BASE_FLOOR){it.y=BILL_BASE_FLOOR-it.h;it.grounded=true;it.vy=0;}}
  // Rewards finish their outward arc before becoming collectible; the clear position stays safe.
  if(it.grounded&&overlap(it,player)&&mode==='playing'){b[claimed]=true;if(key==='reward'){transform(it);showUpgrade('获得 '+BILL_WEAPON_NAMES[billWeapon]);}else{for(let n=0;n<10;n++)getCoin(it.x,it.y);showUpgrade('获得 10 金币');}upgradeFrames=180;}
 }

}
function leaveBillBase(){
 if(!billBase?.cleared||billBase.doorTicks<32)return;loadRoom('surface');const exit=pipes.find(p=>p.exit);
 camera=exit.x-56;player.x=exit.x+16-player.w/2;player.h=30;player.y=exit.y+2;player.vx=0;player.vy=0;player.grounded=false;
 mixAim=false;mixCrouch=false;pipeTransition={kind:'up',t:0,startY:player.y,target:exit.y-player.h};mode='pipe';sfx('pipe');
}
function drawBillBase(){
 const b=billBase;if(!b)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
 if(billBaseImages.cleanRoom)ctx.drawImage(billBaseImages.cleanRoom,0,16);
 if(!b.cleared&&billBaseImages['contra-electric-fence']){const sx=Math.floor(b.tick/4)%4*8;for(const y of [152,168])for(let x=56;x<200;x+=8)ctx.drawImage(billBaseImages['contra-electric-fence'],sx,0,8,8,x,y,8,8);}
 if(b.cleared){const lift=Math.round(b.doorTicks/32*48);ctx.save();ctx.beginPath();ctx.rect(96,80,64,48);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(96,80,64,48);if(lift<48&&billBaseImages.openDoorPanel)ctx.drawImage(billBaseImages.openDoorPanel,96,80-lift);ctx.restore();}
 if(!b.cleared){const locked=baseGuardsAlive().length>0;ctx.strokeStyle=b.coreHitFlash?'#ffed69':locked?'#888':'#fff';ctx.strokeRect(118.5,110.5,19,19);text(locked?'LOCK':'CORE',128,99,locked?'#aaa':'#fff',1,true);}
 // Native front-facing background tiles at their positions in the original third base room.
 for(const g of b.guards){if(b.cleared)continue;if(g.hp<=0){const im=billBaseImages['contra-wall-turret-open'];if(im)ctx.drawImage(im,g.x,g.y);ctx.fillStyle='#000';ctx.fillRect(g.x+3,g.y+3,10,10);if((g.destroyTicks||0)<24){const n=Math.floor((g.destroyTicks||0)/6)%2;mixCrop('bill',[1,65+n*29,28,28],g.x-6,g.y-6);}continue;}const phase=g.phase,id=g.open?'contra-wall-turret-open':phase>=20&&phase<24?'contra-wall-turret-opening-2':phase>=16&&phase<20?'contra-wall-turret-opening-1':'contra-wall-turret-closed';const im=billBaseImages[id];if(im)ctx.drawImage(im,g.x,g.y);if(g.open&&baseGuardWarning(g))text('!',g.x+6,g.y-8,'#fff');}
 if(b.reward&&!b.rewardClaimed)drawItem(b.reward);
 if(b.coinReward&&!b.coinsClaimed){drawCoin(b.coinReward.x,b.coinReward.y);text('10',b.coinReward.x+7,b.coinReward.y-10,'#fff',1,true);}
 for(const shot of b.hostile)mixCrop('projectiles/contra-normal',[0,0,3,3],shot.x,shot.y);
 if(mode==='dying'){drawBillDeath(player.x+player.w/2,player.y+player.h);}
 else if(mode!=='respawn'&&mode!=='gameover'){if(b.stun&&billBaseImages['contra-bill-electric']){ctx.save();ctx.globalAlpha=b.stun%6<3?1:.55;ctx.drawImage(billBaseImages['contra-bill-electric'],Math.round(b.x)-12,Math.round(b.y)-45);ctx.restore();}
 else if(b.crouch&&billBaseImages['contra-bill-crouch'])ctx.drawImage(billBaseImages['contra-bill-crouch'],Math.round(b.x)-12,Math.round(b.y)-32);
 else mixCrop('bill',[59+b.walkFrame*29,65,28,57],b.x-14,b.y-55);}
 for(const s of mixShots)if(!s.delay)drawBillShot(s);
 for(const f of floaters)text(f.text,f.x,f.y,'#ffffff',1,true);
 drawHud();ctx.fillStyle='#000';ctx.fillRect(22,8,65,13);ctx.fillRect(142,8,52,22);hud('BILL',24,16);hud('BASE',144,16);hud(b.cleared?'OPEN':baseGuardsAlive().length?'GUNS '+baseGuardsAlive().length:'CORE '+b.coreHp,144,24);
 ctx.fillStyle='#000';ctx.fillRect(0,211,W,12);ctx.fillStyle='#ffffff';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText(mode==='dying'?'TRY AGAIN':b.stun?'ELECTRIC SHOCK':b.cleared?'GUN < / COINS > / UP: EXIT':baseGuardsAlive().length?(b.crouch?'DUCKING / X: FIRE':'GUNS FIRST / DOWN: DUCK'):'X: CORE / DOWN: DUCK',128,221);ctx.textAlign='left';
 ctx.restore();updateUi();updateHeroUI();if($('heroStatus'))$('heroStatus').textContent='比尔 · 基地奖励房 · '+(b.stun?'触电眩晕 '+b.stun+' 帧':b.cleared?('左侧武器'+(b.rewardClaimed?'已取':'可选')+' · 右侧10金币'+(b.coinsClaimed?'已取':'可选')+' · ↑ 可直接离开'):baseGuardsAlive().length?(b.crouch?'趴下躲弹 · 仍可射击':'左右移动瞄准墙炮 · ↓ 趴下躲弹 · ↑ 触电'):'核心 '+b.coreHp+'/8 · 左右对准白框 · 按 X 射击，站射/趴射均可');
}
// The recovered pipe transition assigns the underground entry coordinates after loadRoom.
const billBaseAdvancePipe=advancePipe;advancePipe=function(){billBaseAdvancePipe();if(billBase&&mode==='playing')syncBillBasePlayer();};
window.__mixReady=Promise.all([window.__mixReady,billBaseReady]);
if(window.__mixTest){const stateBeforeBase=window.__mixTest.state;window.__mixTest.baseState=()=>billBase?JSON.parse(JSON.stringify(billBase)):null;window.__mixTest.state=()=>({...stateBeforeBase(),base:window.__mixTest.baseState()});window.__mixTest.ready=window.__mixReady;}
