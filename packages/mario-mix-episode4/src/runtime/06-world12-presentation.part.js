/* 0.6 — character presentation/rules. Canonical 1-2 geometry is unchanged.
 * Tank pictures and 18 PCM recordings derive from the user's supplied pack.
 * Wall control follows the NES NG-II manual; spin/Boss are explicit crossover additions.
 */
const R06_VERSION='0.6.0';
let r06Palette=0,r06Music=false,r06Engine=null,r06EngineContext=null,r06Effects=[],r06Death=null,r06UID=90000;
const R06_AUDIO_MAP={r12_cannon:'shot',r12_blast:'enemydeath',r12_steel:'steel',ninja_pickup:'pickup',ninja_hit:'armorhit',ninja_gate:null,ninja_death:'death',tank_clear:'result',tank_flag:null,clear:'result',flag:null,death:'death',gameover:'gameover',pause:'pause',break:'brick',bump:'steel',appear:'appear',coin:'tally',powerup:'upgrade',oneup:'life'};
const r06Ready=Promise.all(['tank-colors06','tank-explosion06'].map(id=>new Promise((ok,fail)=>{const im=new Image();im.onload=()=>{R12_SPRITES[id]=im;ok();};im.onerror=()=>fail(Error('Missing 0.6 sprite '+id));im.src=R12_EMBEDDED_IMAGES['relay12/assets/'+id+'.png'];})));
window.__mixReady=Promise.all([window.__mixReady,r06Ready]);
function r06InstallAudio(){
 if(!audio||r06EngineContext===audio)return;
 for(const [key,a] of Object.entries(R06_AUDIO_PCM)){
  const bytes=Uint8Array.from(atob(a.pcm),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer);
  const buffer=audio.createBuffer(1,bytes.length/2,a.rate),samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=view.getInt16(i*2,true)/32768;
  bank.set(key,{buffer,gain:a.gain});r03SourceAudioKeys.add(key);
 }
 r06EngineContext=audio;r12Event('tank-pack-audio-ready',{count:Object.keys(R06_AUDIO_PCM).length});
}
const r06AudioInit=audioInit;
audioInit=function(resume=true){const out=r06AudioInit(resume);r06InstallAudio();return out;};
const r06OneShot=oneShot;
oneShot=function(key,options={}){
 if(hero==='tank'&&Object.prototype.hasOwnProperty.call(R06_AUDIO_MAP,key)){
  const k=R06_AUDIO_MAP[key];if(k===null)return 0;key='t06_'+k;
 }
 return r06OneShot(key,options);
};
function r06Sound(name,options={}){return oneShot('t06_'+name,options);}
function r06StopEngine(){if(!r06Engine)return;try{r06Engine.node.stop();r06Engine.node.disconnect();r06Engine.gain.disconnect();}catch{}r06Engine=null;}
function r06EngineSync(){
 const run=hero==='tank'&&r12&&mode==='playing'&&!r12.transition&&!r12.spawnFrames&&!r03Challenge?.tally08?.active&&soundOn&&!document.hidden&&audio?.state==='running'&&(Math.abs(player.vx)+Math.abs(player.vy)>.001);
 if(!run){r06StopEngine();return;}
 if(r06Engine)return;
 const item=bank.get('t06_engine');if(!item)return;
 const node=audio.createBufferSource(),gain=audio.createGain();node.buffer=item.buffer;node.loop=true;gain.gain.value=item.gain;node.connect(gain);gain.connect(effectsBus);node.start();r06Engine={node,gain};audioLogEvent('engine-start','t06_engine');
}
const r06AudioSync=audioSync;
audioSync=function(){
 r06AudioSync();r06EngineSync();
 if(hero==='tank'&&r12&&audio){
  if(!r06Music&&bgm)stopMusic(true);
  if(mode==='playing'&&!r12.transition&&soundOn&&!document.hidden&&!r12.r06IntroDone&&bank.has('t06_start')){
   r12.r06IntroDone=true;
   if(['entrance','defense'].includes(r12.area))r12.r06IntroUntil=r06Sound('start',{volume:.75});
  }
  if(bgm?.key==='tank_theme')setGain(bgm.gain,bank.get('tank_theme').gain*(audio.currentTime<(r12.r06IntroUntil||0)?.2:.55),.03);
 }
};
const r06Desired=desiredMusic;
desiredMusic=function(){if(hero==='tank'&&!r06Music)return null;return r06Desired();};
const r06Panel=updateAudioPanel;
updateAudioPanel=function(){r06Panel();if(hero==='tank'){
 if($('audioBadge'))$('audioBadge').textContent=soundOn?'PACK AUDIO 18':'MUTED';
 if($('audioStatus'))$('audioStatus').textContent='素材包声音：开场 / 履带 / 开炮 / 爆炸 / 拾取 / 结算。坦克不使用额外循环配乐。';
}};

// Source sheet: four palettes × four body families × four directions × two tracks.
function r06TankFrame(dir,rank,track){return rank*8+((dir+1)%4)*2+(Math.floor(track/5)%2);}
function r06EnemyPalette(e){
 if(e?.bonus&&!e.bonusSpent&&Math.floor(frame/6)%2===0)return 3;
 if(e?.tankKind!=='armor')return 2;
 if(e.hp>=4)return 1;
 if(e.hp===3)return Math.floor(frame/8)%2?1:2;
 if(e.hp===2)return Math.floor(frame/8)%2?0:2;
 return 2;
}
r12DrawTank=function(g,x,y,dir,enemy=false,t=0,armored=false,entity=null){
 const rank=enemy?({basic:0,fast:1,power:2,armor:3}[entity?.tankKind]??(armored?3:0)):clamp(r12?.tank?.power||0,0,3);
 const palette=enemy?r06EnemyPalette(entity||{tankKind:armored?'armor':'basic',hp:armored?4:1}):r06Palette;
 const im=R12_SPRITES['tank-colors06'];if(!im)return;
 const f=r06TankFrame(dir,rank,entity?.r06Track??t);
 g.save();g.imageSmoothingEnabled=false;g.drawImage(im,f*16,palette*16,16,16,Math.round(x-2),Math.round(y-2),16,16);
 if(!enemy){r05TankSprite='pack06-'+palette+'-'+rank;if(r12?.rankFlash>0){g.strokeStyle='#fff1a6';g.lineWidth=1;g.strokeRect(Math.round(x-3),Math.round(y-3),18,18);}}
 g.restore();
};
const r06DrawEnemy=r12DrawEnemy;
r12DrawEnemy=function(e){
 if(e.kind!=='tank')return r06DrawEnemy(e);if(e.dead)return;
 if(e.spawn>0){const x=Math.round(e.x-camera+6),y=Math.round(e.y+6),s=3+Math.floor(e.spawn/7)%5;rect(x-s,y-1,s*2+1,3,'#fff8cf');rect(x-1,y-s,3,s*2+1,'#fff8cf');return;}
 r12DrawTank(ctx,e.x-camera,e.y,e.dir,true,e.t,e.tankKind==='armor',e);
};
const r06TankMove=r12TankMove;
r12TankMove=function(b,dir,speed){const x=b.x,y=b.y,result=r06TankMove(b,dir,speed);if(result)b.r06Track=(b.r06Track||0)+Math.abs(b.x-x)+Math.abs(b.y-y);return result;};
function r06MarkEnemies(){if(hero!=='tank'||!ninja)return;for(const e of ninja.foes){if(e.kind!=='tank'||e.r06Marked)continue;e.r06Marked=true;if(r12.area==='underground'&&e.id===7)e.tankKind='power';e.bonus??=(e.id<700&&e.id%4===1);e.bonusSpent??=false;e.r06Track=0;}}
const r06Load=r12Load;
r12Load=function(...args){r06Effects=[];r06Death=null;r06StopEngine();r06Load(...args);r06MarkEnemies();};
function r06Explosion(x,y,big=true){r06Effects.push({x,y,age:0,life:big?30:14,big,area:r12?.area});}
function r06FxTick(){for(const e of r06Effects)e.age++;r06Effects=r06Effects.filter(e=>e.age<e.life&&e.area===r12?.area);}

// A red carrier drops once on its FIRST damaging hit, not only when destroyed.
function r06RewardSpot(){
 const start={x:player.x,y:player.y,w:12,h:12},q=[start],seen=new Set(),valid=[];
 const lo=r12.area==='defense'?24:Math.max(16,camera+4),hi=r12.area==='defense'?220:Math.min(r12.def.width-28,camera+W-16);
 const top=r12.area==='defense'?24:48,bottom=r12.area==='defense'?220:196;
 for(let at=0;at<q.length&&at<1600;at++){
  const p=q[at],key=p.x.toFixed(2)+','+p.y.toFixed(2);if(seen.has(key))continue;seen.add(key);
  if(p.x<lo||p.x>hi||p.y<top||p.y>bottom||r12TankCollides(p))continue;
  if(Math.abs(p.x-player.x)+Math.abs(p.y-player.y)>48&&!ninja.foes.some(e=>!e.dead&&overlap(p,e)))valid.push(p);
  for(const [dx,dy] of R12_DIR)q.push({...p,x:p.x+dx*8,y:p.y+dy*8});
 }
 return valid.length?valid[(r06UID*13)%valid.length]:start;
}
function r06DropBonus(e){
 if(!e.bonus||e.bonusSpent)return;e.bonusSpent=true;e.bonus=false;
 const type=r07NextBonus();
 const p=r06RewardSpot();ninja.drops=ninja.drops.filter(d=>!d.fromCarrier);
 ninja.drops.push({...p,type,id:++r06UID,fromCarrier:true,anchored:true,emerge:16,targetY:p.y,ttl:900});
 r06Sound('appear');r12Message('奖励车命中 · '+({star:'星星',helmet:'护盾',timer:'时钟',grenade:'手雷',life:'生命',shovel:'铁铲'}[type])+'已出现',120);r12Event('carrier-drop',{id:e.id,item:type,x:p.x,y:p.y});
}
r12Kill=function(e,noScore=false){
 if(e.dead)return;e.dead=true;
 const points=hero==='tank'?({basic:100,fast:200,power:300,armor:400}[e.tankKind]||100):100;
 if(!noScore)addScore(points,e.x,e.y);
 r07DefeatPresentation(e);
 r12Event('enemy-defeated',{kind:e.tankKind||e.kind,points:noScore?0:points});
};
r12DamageEnemy=function(e,amount=1){
 if(e.dead||e.spawn)return;
 if(e.kind==='barbarian'){
  if(e.hitLock)return;e.hitLock=12;e.hp-=amount;e.flash=9;ninjaSound('hit');r12Event('boss-hit',{hp:e.hp});
  if(e.hp<=0){r12Kill(e);r03WinChallenge('ninja');}return;
 }
 if(hero==='tank')r06DropBonus(e);
 e.hp-=amount;e.flash=9;
 if(e.hp<=0)r12Kill(e);else if(hero==='tank')r06Sound('armorhit');else ninjaSound('hit');
};
const r06NinjaGive=r12Give;
r12Give=function(type){
 if(hero!=='tank')return r06NinjaGive(type);
 const t=r12.tank;let clip='pickup';
 if(type==='star'||type==='power'){t.power=Math.min(3,t.power+1);r12.rankFlash=32;clip='upgrade';r12Event('tank-form',{rank:t.power,sprite:'pack06-'+r06Palette+'-'+t.power});}
 else if(type==='helmet'||type==='health')t.shield=600;
 else if(type==='timer')t.freeze=360;
 else if(type==='life'){lives++;clip='life';}
 else if(type==='grenade'){for(const e of ninja.foes)if(!e.dead&&e.x>=camera-20&&e.x<camera+W+20)r12Kill(e,true);r12.shake=8;clip='grenade';}
 else if(type==='shovel'){
  t.shovel=900;
  if(r12.area==='defense'){
   const c=r03Challenge;
   for(let x=112;x<=136;x+=8)for(let y=208;y<=224;y+=8){if(x>112&&x<136&&y>208)continue;
    let b=c.blocks.find(b=>b.x===x&&b.y===y);if(!b){b={x,y,w:8,h:8,type:'brick',dead:false};c.blocks.push(b);}
    b.type='steel';b.dead=false;b.shovelGuard=true;
   }
  }else t.shield=Math.max(t.shield,240); // No base in the scrolling route: explicit escort adaptation.
 }
 addScore(500,player.x,player.y);r06Sound(clip);r12Message(({star:'火力升级 · 车体已变化',power:'火力升级',helmet:'护盾已开启',health:'护盾已开启',timer:'敌军暂停',grenade:'清除当前区域敌军',life:'生命 +1',shovel:r12.area==='defense'?'基地临时钢墙':'主路铁铲：短时护盾'})[type]||'补给',140);
 r12Event('pickup',{item:type,points:500});updateHeroUI();
};
// Bullet origin stays at the muzzle, quotas count LIVE player shells only.
r12TankShot=function(b,friendly=true){
 const t=r12.tank,dir=b.dir??t.dir,[dx,dy]=R12_DIR[dir],power=friendly?t.power:0;
 const own=ninja.projectiles.filter(s=>s.life>0&&s.kind==='shell'&&s.friendly===friendly&&(friendly||s.owner===b.id));
 if(own.length>=(friendly&&power>=2?2:1))return false;
 const speed=friendly?(power===0?3:4.8):(b.tankKind==='power'?4:2.4);
 ninja.projectiles.push({kind:'shell',friendly,x:b.x+b.w/2+dx*8-2,y:b.y+b.h/2+dy*8-2,w:4,h:4,vx:dx*speed,vy:dy*speed,life:140,owner:b.id,age:0,hit:new Set(),power});
 if(friendly){t.cool=power>=2?6:4;r12.shake=1;r12Event('cannon',{power});r06Sound('shot');}
 return true;
};

// NG-II-style wall controls: no sword while attached. Shoot OUT from the wall.
// Spin remains an NG-I-inspired bonus, intentionally not a claim of a pure NG-II port.
ninjaThrow=function(){
 const n=ninja,w=R12_WEAPONS[n.weapon];if(!w||n.cool||n.hit)return false;
 if(n.weapon==='spin'){
  if(player.grounded||n.wall){r12Message('旋风斩：离开墙面，跳起按攻击键。',70);return false;}
  if(n.spirit<5){ninjaSound('empty');return false;}
  n.spirit-=5;n.cool=28;n.spin=24;n.spinHit=new Set();ninjaSound('slash');r12Event('weapon',{weapon:'spin',cost:5});return true;
 }
 const dir=n.wall?(n.r06Aim||-n.wall):player.facing;
 const box={x:dir>0?player.x+player.w:player.x-10,y:player.y+player.h-17,w:n.weapon==='flame'?12:9,h:n.weapon==='flame'?12:9};
 if(n.wall&&solids(box).length){r12Message('面前是墙 · 朝外发射忍术，不扣能量。',60);return false;}
 if(n.spirit<w.cost){ninjaSound('empty');r12Message('忍术能量不足',60);return false;}
 n.spirit-=w.cost;n.cool=24;n.throwPose=10;n.throwDir=dir;
 n.projectiles.push({...box,kind:n.weapon,friendly:true,vx:dir*(n.weapon==='flame'?2.6:3.8),vy:n.weapon==='flame'?-2.1:0,life:n.weapon==='windmill'?160:95,age:0,hit:new Set()});
 ninjaSound('throw');r12Event('weapon',{weapon:n.weapon,cost:w.cost,wall:!!n.wall,dir});return true;
};
const r06GroundSwing=ninjaSwing;
ninjaSwing=function(){if(ninja.wall)return ninjaThrow();if(ninja.weapon==='spin'&&!player.grounded)return ninjaThrow();return r06GroundSwing();};
const r06RyuPlayer=r12NinjaPlayer;
r12NinjaPlayer=function(input){ninja.r06Aim=input.horizontal||0;if(ninja.throwPose>0)ninja.throwPose--;return r06RyuPlayer(input);};
const r06DrawRyu=r12DrawRyu;
r12DrawRyu=function(g,x,y,face,pose,t){if(hero==='ryu'&&ninja?.throwPose>0&&mode==='playing'&&!ninja.hit){pose='throw';face=ninja.throwDir;}r06DrawRyu(g,x,y,face,pose,t);};

// Separate fatal presentation. Tanks explode in-place; never do Mario's hop.
const r06LegacyDie=die;
die=function(){
 if(!r12IsHero())return r06LegacyDie();if(mode!=='playing')return;
 mode='dying';deathTick=0;lives--;player.vx=player.vy=0;ninja.attack=0;ninja.wall=0;ninja.spin=0;ninja.command=null;ninja.throwPose=0;
 r04ClearCommands();r06StopEngine();stopMusic();stopEffects();r06Death={hero,x:player.x,y:player.y,frame};
 if(hero==='tank'){r06Explosion(player.x+6,player.y+6);r06Sound('death');}else ninjaSound('death');
 r12Event('death',{lives,presentation:hero==='tank'?'tank-explosion':'ninja-fall'});
};
const r06ResetLife=resetLife;
resetLife=function(){r06Death=null;r06Effects=[];r06ResetLife();};
const r06Clear=r05ClearSession;
r05ClearSession=function(){r06StopEngine();r06Effects=[];r06Death=null;r06Clear();};
const r06Fixed=fixedUpdate;
fixedUpdate=function(){
 if(!r12IsHero()||!r12)return r06Fixed();
 if(mode==='dying'&&r06Death){
  frame++;r12.ticks++;deathTick++;r06FxTick();
  if(hero==='ryu'&&deathTick>14){player.vy=Math.min(3.5,player.vy+.2);player.y+=player.vy;}
  if(deathTick>=80){if(lives>0)resetLife();else{mode='gameover';showOverlay('RESCUE RELAY / 1-2','重新整队','生命耗尽。重开或选人都会清理旧状态。','重新出发 →');if(hero==='tank')r06Sound('gameover');}}
  audioSync();return;
 }
 const f=frame;r06Fixed();if(!r12||!ninja||f===frame)return;r06FxTick();r06MarkEnemies();
 if(mode==='playing'&&!r12.transition){
  for(const d of ninja.drops)if(d.fromCarrier&&d.ttl>0)d.ttl--;ninja.drops=ninja.drops.filter(d=>!d.fromCarrier||d.ttl>0);
  if(r12.tank.shovel>0&&!--r12.tank.shovel&&r12.area==='defense')for(const b of r03Challenge.blocks)if(b.shovelGuard){b.type='brick';b.dead=false;b.shovelGuard=false;}
 }
};
const r06DropDraw=r12DrawDrop;
r12DrawDrop=function(d){if(d.fromCarrier&&d.ttl<180&&Math.floor(frame/8)%2)return;r06DropDraw(d);};
const r06Draw=r12Draw;
r12Draw=function(){r06Draw();if(!r12)return;
 const im=R12_SPRITES['tank-explosion06'];if(im)for(const e of r06Effects){
  const seq=[0,1,2,3,2,1],i=seq[Math.min(5,Math.floor(e.age*6/e.life))],sz=e.big?40:20;
  ctx.drawImage(im,i*64,0,64,64,Math.round(e.x-camera-sz/2),Math.round(e.y-r12.camY-sz/2),sz,sz);
 }
 if(hero==='tank')updateAudioPanel();
};
// Menu options change appearance/audio ONLY, never firepower or lives.
function r06Portrait(){const button=document.querySelector('[data-hero="tank"]'),g=button?.querySelector('canvas').getContext('2d');if(!g)return;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,64,80);g.save();g.scale(2,2);r12DrawTank(g,10,18,3,false,0);g.restore();}
const r06Options=document.createElement('div');r06Options.id='tankOptions06';r06Options.innerHTML='<span>车体配色</span> <button type="button" data-tank-palette="0" aria-pressed="true">金色</button> <button type="button" data-tank-palette="1" aria-pressed="false">绿色</button>';
$('heroPicker').after(r06Options);
r06Options.querySelectorAll('[data-tank-palette]').forEach(b=>b.addEventListener('click',()=>{r06Palette=Number(b.dataset.tankPalette);r06Options.querySelectorAll('[data-tank-palette]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));r06Portrait();}));
// 0.8: tank continuous-music option removed, not merely unchecked.
const r06Style=document.createElement('style');r06Style.textContent='#tankOptions06{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:6px;font:12px system-ui;margin:8px 0;color:#dfdbca}#tankOptions06[hidden]{display:none}#tankOptions06 button{background:#243a46;border:1px solid #718f95;color:#f1e8c6;padding:4px 10px;cursor:pointer}#tankOptions06 button[aria-pressed=true]{border-color:#f3ce6c;background:#465147}#tankOptions06 label{font-size:11px}';r06Style.textContent+=`
.overlay.choosing .overlay-box{box-sizing:border-box;max-height:100%;overflow-y:auto;scrollbar-width:thin}
@media(max-width:690px),(max-height:540px){
.overlay.choosing{padding:8px!important}
.overlay.choosing h2{font-size:16px!important;margin:3px 0!important}
.overlay.choosing .eyebrow,.overlay.choosing #overlayText,.overlay.choosing .overlay-hint{display:none!important}
.overlay.choosing .hero-picker{margin:5px 0!important;gap:4px!important}
.overlay.choosing .hero-picker button{min-height:56px!important;padding:4px 2px!important}
.overlay.choosing .hero-picker canvas{width:24px!important;height:30px!important}
.overlay.choosing .hero-picker strong{font-size:9px!important;white-space:nowrap}
.overlay.choosing .hero-picker small{display:none}
#tankOptions06{gap:4px;margin:5px 0;font-size:10px}
#tankOptions06 button{padding:2px 8px;font-size:10px;min-height:24px}
#tankOptions06 label{font-size:9px}
.overlay.choosing #mainAction{font-size:11px!important;padding:5px 10px!important}
.overlay.choosing #relayStart{font-size:9px!important;padding:5px 8px!important;margin:5px auto 0!important}
}
`;document.head.appendChild(r06Style);
const r06Select=selectHero;selectHero=function(id){r06Select(id);r06Options.hidden=hero!=='tank'||mode!=='menu';r06Portrait();};
const r06Hide=hideOverlay;hideOverlay=function(){r06Hide();r06Options.hidden=true;};
heroHelp.tank='v0.9 · 素材包彩色车体与真实音效。方向键/WASD 四向移动，J/空格开炮。红色闪烁车：命中一次出奖励；绿色装甲车：四发击破。金/绿玩家配色可选，星星升级同步更换车体。';
heroHelp.ryu='v0.9 · 横版 1-2。空格跳跃，J 攻击。挂墙 ↑↓，反向+跳跃蹬出；挂墙 J/L 向外投忍术，不挥刀。取得旋风斩后空中 J 发动。L 忍术、E 切换为混合版快捷键。';
r06Ready.then(()=>{r06Portrait();selectHero(hero);});
if(window.__relayTest){
 __relayTest.give=t=>r12Give(t);__relayTest.die=()=>die();__relayTest.damage=()=>hero==='tank'?r12TankHurt({x:player.x-20}):ninjaHurt({x:player.x-20,w:10});
 __relayTest.r06=()=>({version:R06_VERSION,palette:r06Palette,music:r06Music,engine:!!r06Engine,effects:r06Effects.map(e=>({...e})),audioLoaded:Object.keys(R06_AUDIO_PCM).filter(k=>bank.has(k)),death:r06Death});
}

/* 0.7 — integration fixes, not a redesigned main map.
 * Explicit transition, pipe, projectile, reward and menu presentation policies.
 * Novel crossover choices are documented separately from original-game rules.
 */
const R07_VERSION='0.7.0';
const R07_ITEM_INDEX={star:0,power:0,helmet:1,health:1,grenade:2,shovel:3,life:4,timer:5};
const R07_DROP_CYCLE=['star','helmet','timer','grenade','life','shovel','helmet','timer'];
let r07BonusIndex=0,r07Transit=null,r07DefeatFx=[],r07MixReport={},r07Normalised=new WeakSet();
const r07Ready=Promise.all(['tank-items07','ng-explosion07'].map(id=>new Promise((resolve,reject)=>{
 const im=new Image();im.onload=()=>{R12_SPRITES[id]=im;resolve();};im.onerror=()=>reject(Error('Missing 0.7 image '+id));im.src=R12_EMBEDDED_IMAGES['relay12/assets/'+id+'.png'];
})));
window.__mixReady=Promise.all([window.__mixReady,r07Ready]);
heroNames.tank='坦克大战';
RELAY12_MAP.areas.exit.flag=312; // Centre the pole on its 16px supporting block.
RELAY12_MAP.areas.bar.name='JAY’S BAR';
RELAY12_MAP.areas.defense.name='坦克大战 · 基地保卫';
function r07NextBonus(){return R07_DROP_CYCLE[(r07BonusIndex++)%R07_DROP_CYCLE.length];}

// Six actual supply sprites from the user-provided sheet. A helmet is not a cross.
const r07OldDrop=r12DrawDrop;
r12DrawDrop=function(d){
 if(hero!=='tank')return r07OldDrop(d);
 if(d.fromCarrier&&d.ttl<180&&Math.floor(frame/8)%2)return;
 const i=R07_ITEM_INDEX[d.type],im=R12_SPRITES['tank-items07'];
 if(i===undefined||!im)return r07OldDrop(d);
 ctx.drawImage(im,i*16,0,16,16,Math.round(d.x-camera-2),Math.round(d.y-2),16,16);
};

// A 16x16 arena brick consists of four 8px collision cells. Ordinary shells
// remove a complete 16x8 face strip (two cells), not a lone 8x8 corner.
// Maximum-level shells remove the remaining 16x16 block, including steel.
function r07DefenseImpact(wall,s){
 const c=r03Challenge;if(!c||wall.type==='pipe')return;
 const strong=s.friendly&&(s.power??0)>=3;
 if(wall.type==='steel'&&!strong){r06Sound('steel');r12Event('defense-steel-block');return;}
 const bx=24+Math.floor((wall.x-24)/16)*16,by=24+Math.floor((wall.y-24)/16)*16;
 let removed=0;
 for(const b of c.blocks){
  if(b.dead||b.type==='pipe'||(b.type==='steel'&&!strong))continue;
  if(b.x<bx||b.x>=bx+16||b.y<by||b.y>=by+16)continue;
  if(!strong&&(s.vx?b.x!==wall.x:b.y!==wall.y))continue;
  b.dead=true;removed++;
  particles.push({kind:'debris',x:b.x+2,y:b.y+2,vx:(removed%2?1:-1)*.9,vy:-1.6,life:24,under:false});
 }
 if(removed){r06Sound('brick');r12Event('defense-brick-hit',{removed,block:[bx,by],strong});}
}

// The rising half of the visible sword arc can reach immediately overhead.
// This is not a full-body/360 degree attack; crouching keeps a low cut.
function r07SwordBoxes(){
 const p=player,n=ninja;
 const forward={x:p.facing>0?p.x+p.w-2:p.x-25,y:p.y+p.h-24,w:28,h:24};
 if(p.crouch||n.attack<8)return [forward];
 return [forward,{x:p.facing>0?p.x+2:p.x-5,y:p.y-9,w:p.w+5,h:18}];
}
const r07Break=r12Break;
r12Break=function(t,by='sword'){
 if(!t)return false;
 if(hero==='ryu'&&['stone','steel','ground','pipe'].includes(t.type))return false;
 return r07Break(t,by);
};

// Enemy death feedback follows the enemy family, not the currently selected hero.
function r07DefeatPresentation(e){
 if(e.kind==='tank'){r06Explosion(e.x+e.w/2,e.y+e.h/2);r06Sound('enemydeath');return;}
 if(e.kind==='goomba'||e.kind==='koopa'){
  r07DefeatFx.push({kind:'mario',sprite:e.kind==='goomba'?'goomba':'koopa0',x:e.x+e.w/2,y:e.y+e.h/2,vx:player.x<e.x?.7:-.7,vy:-2.6,age:0,life:50,area:r12.area,under:room==='under'});
  sfx('kick');return;
 }
 const total=e.kind==='barbarian'?4:1;
 for(let i=0;i<total;i++)r07DefeatFx.push({kind:'ninja',x:e.x+e.w/2+(i%2?8:-4),y:e.y+e.h/2+(i>1?7:-5),age:-i*5,life:18,area:r12.area});
 if(bank.has('ng07_enemy'))oneShot('ng07_enemy');else ninjaSound('hit');
}
function r07TickDefeat(){
 for(const f of r07DefeatFx){f.age++;if(f.kind==='mario'){f.x+=f.vx;f.y+=f.vy;f.vy+=.2;}}
 r07DefeatFx=r07DefeatFx.filter(f=>f.age<f.life&&f.area===r12?.area);
}

// Original Mario sprites in both views. In particular, vertical body rendering
// never repaints the rim. A side entrance is the same familiar elbow, not a box.
function r07VerticalPipe(p){
 const bottom=p.bottom??208,x=Math.round(p.x-camera),top=Math.round(p.y);
 ctx.save();ctx.beginPath();ctx.rect(x,top,32,Math.max(0,bottom-top));ctx.clip();
 for(let y=top+16;y<bottom;y+=16)sprite('pipe_body',x,y);
 sprite('pipe_top',x,top);ctx.restore();
}
function r07SidePipe(q){
 const x=q.x*2-camera,y=208-q.y*2,vx=q.verticalX*2-camera,top=208-q.top*2,bottom=208-(q.top-q.height)*2;
 ctx.save();ctx.beginPath();ctx.rect(vx,top,32,bottom-top);ctx.clip();
 for(let yy=top;yy<bottom;yy+=16)sprite('pipe_body',vx,yy);
 ctx.restore();sprite('pipe_side',x,y);
 // The above-ground entry has a capped, thicker upper rim.
 const cap=pipes.find(p=>Math.abs(p.x-q.verticalX*2)<.1&&Math.abs(p.y-top)<.1);
 if(cap)sprite('pipe_top',vx,top);
}
r12DrawPipes=function(){
 for(const p of pipes)if(p.x>=camera-34&&p.x<=camera+W)r07VerticalPipe(p);
 if(r12.def.sidePipe)r07SidePipe(r12.def.sidePipe);
 if(r12.def.warp)for(let i=0;i<3;i++){
  const p={x:(r12.def.warp.x+8+i*32)*2,y:176,bottom:208};r07VerticalPipe(p);
  text(String(r12.def.warp.destinations[i]),p.x-camera+16,161,'#cbe3d6',1,true);
 }
};
function r07DrawForegroundPipes(){
 if(!r12)return;
 if(r12.spawnFrames>0&&r12.area==='exit'||r07Transit?.kind==='pipe'&&r12.transition>21)r12DrawPipes();
 if(r12.area==='defense'&&r03Challenge?.exitPipe&&r07Transit?.kind==='pipe')r07VerticalPipe(r03Challenge.exitPipe);
}

// Down the existing wall -> direct, short room cut. No floor portal or pipe.
r03TryDescent=function(input){
 if(hero!=='ryu'||r12?.area!=='underground')return false;
 const p=player,n=ninja,inside=p.x>=1280-.1&&p.x+p.w<=1328+.1;
 if(inside&&n.wall&&input.down&&p.y+p.h>208){
  if(!n.descentActive)r12Event('cliff-descent-arm');n.descentActive=true;
 }
 if(n.descentActive&&p.y+p.h<=208)n.descentActive=false;
 if(n.descentActive&&inside&&input.down&&n.wall&&p.y+p.h>=302){
  r12Event('cliff-descent',{x:p.x,y:p.y});r12Travel('bar',null,'region');return true;
 }
 return false;
};

// Voluntary pipe travel and a room boundary are deliberately separate actions.
r12Travel=function(target,spawn=null,kind='pipe'){
 if(!r12||r12.transition||mode!=='playing')return false;
 if(target==='alley'){target='bar';kind='region';}
 if(target==='bonus'&&hero==='tank'){target='defense';spawn=null;}
 r12SaveGeometry();const p=player;
 const side=r12.def.sidePipe;
 const horizontal=side&&Math.abs(p.x+p.w-side.x*2)<7;
 r07Transit={kind,from:r12.area,target,x:p.x,y:p.y,dx:kind==='pipe'&&horizontal?1:0,dy:kind==='pipe'&&!horizontal?1:0};
 r12.transition=42;r12.target=target;r12.transitionSpawn=spawn;r04ClearCommands();
 if(kind==='pipe')oneShot('pipe'); // Mario's pipe recording for every character.
 r12Event(kind==='pipe'?'pipe':'region-transition',{target});return true;
};
function r07DefenseExit(input){
 const c=r03Challenge,p=player,q=c?.exitPipe;
 if(!q||!c.won||r12.pipeCooldown>0||frame-c.wonAt<36)return;
 if(input.down&&p.x+p.w/2>q.x+4&&p.x+p.w/2<q.x+28&&Math.abs(p.y+p.h-q.y)<=6)r12Travel('exit');
}
const r07Win=r03WinChallenge;
r03WinChallenge=function(kind){
 if(r03Challenge?.won)return;
 r07Win(kind);
 if(kind==='ninja'){
  pipes=[{x:208,y:176,bottom:208}];
  r12Message('旋风斩已获得',150);
 }else{
  const c=r03Challenge;c.exitPipe={x:192,y:192,bottom:232};
  // After the fight, reveal the pipe in the lower-right wall and clear only
  // its approach. The original combat arena is unchanged while fighting.
  for(const b of c.blocks)if(b.x>=184&&b.y>=168)b.dead=true;
  for(let x=192;x<224;x+=8)for(let y=192;y<232;y+=8)c.blocks.push({x,y,w:8,h:8,type:'pipe',dead:false});
  pipes=[c.exitPipe];r12.pipeCooldown=36;
  r12Message('基地守护成功 · 满级火力与护盾',160);
 }
};
const r07Load=r12Load;
r12Load=function(area,preserve=false,spawn=null,keepGeometry=false){
 const tr=r07Transit,previous=r12?.area;
 if(area==='alley')area='bar';
 r07Load(area,preserve,spawn,keepGeometry);r07DefeatFx=[];
 if(area==='bar'){
  // Never retain a pipe from a previous successful challenge.
  r12.def.pipes=[];pipes=[];r12.message='';r12.messageTime=0;
  r12.spawnFrames=18;
 }
 if(area==='defense'){r03Challenge.total=4;r12.message='';r12.messageTime=0;}
 if(area==='underground'){
  r12.message='';r12.messageTime=0;
  if(hero==='ryu')for(const [k,t] of tiles)if(t.routeExtension&&t.y>19)tiles.delete(k);
 }
 if(area==='exit'&&previous){
  const top=176,to=top-player.h;Object.assign(player,{x:17,y:top,vx:0,vy:0,invuln:90});
  r12.spawnFrames=26;r12.spawnFromY=top;r12.spawnToY=to;r12.pipeCooldown=55;
 }
 // Subsequent main-map areas do not change the selected character's soundtrack.
 r12.r07Entry=tr?.kind||'start';r07Transit=null;
};

// Preserve the canonical map. Only remove pre-discovery explanatory labels and
// the obsolete alley/shaft pipe. The lift locations and directions are retained.
const r07Map=r12DrawMap;
r12DrawMap=function(){
 r07Map();
 if(r12.area==='defense'&&r03Challenge?.won)r07VerticalPipe(r03Challenge.exitPipe);
 if(hero==='tank'&&r12.area==='underground')for(const l of r12.lifts){
  rect(l.x-camera,l.y,l.w,7,'#aa966d');rect(l.x-camera,l.y,l.w,2,'#f0d8ac');
  for(let x=l.x+3;x<l.x+l.w;x+=8)rect(x-camera,l.y+3,1,3,'#3e5260');
 }
};

// UI ownership is explicit: gameplay and results never keep .choosing.
function r07MenuState(){
 const menu=mode==='menu',o=$('overlay');o.classList.toggle('choosing',menu);
 $('heroPicker').hidden=!menu;$('overlayCharacters').hidden=menu;
 if($('relayStart'))$('relayStart').hidden=!menu;
 if($('tankOptions06'))$('tankOptions06').hidden=!menu||hero!=='tank';
 if(!menu)for(const b of document.querySelectorAll('[data-hero]'))b.blur();
}
const r07Overlay=showOverlay;
showOverlay=function(...args){r07Overlay(...args);r07MenuState();};
const r07Start=startGame;
startGame=function(){r07BonusIndex=0;r07DefeatFx=[];r07Transit=null;const out=r07Start();r07MenuState();return out;};
const r07Clear=r05ClearSession;
r05ClearSession=function(){r07DefeatFx=[];r07Transit=null;r07BonusIndex=0;r07Clear();};

// Measured gain staging, no replacement of BGM by the pipe effect.
function r07NormaliseAudio(){
 if(!audio)return;
 for(const [key,v] of bank){if(!v.buffer||r07Normalised.has(v.buffer))continue;
  const music=!!NINJA_TUNES[key]||key.endsWith('_theme');
  if(!music&&!key.startsWith('t06_')&&!key.startsWith('ninja_')&&!key.startsWith('ng07_')&&key!=='pipe')continue;
  let peak=0,sum=0,n=0;const d=v.buffer.getChannelData(0);
  for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);peak=Math.max(peak,a);if(a>.003){sum+=a*a;n++;}}
  const rms=Math.sqrt(sum/Math.max(1,n)),target=key==='t06_engine'?.055:music?.12:.18;
  const gain=Math.min(8,.68/Math.max(.001,peak),target/Math.max(.001,rms));
  v.gain=gain;r07Normalised.add(v.buffer);r07MixReport[key]={peak,rms,gain,target};
 }
}
const r07AudioInit=audioInit;
audioInit=function(...args){const a=r07AudioInit(...args);r07NormaliseAudio();return a;};
const r07Prepare=prepareAudio;
prepareAudio=async function(){const r=await r07Prepare();r07NormaliseAudio();return r;};
const r07Shot=oneShot;
oneShot=function(key,options={}){r07NormaliseAudio();return r07Shot(key,options);};
const r07Sound=ninjaSound;
ninjaSound=function(name){
 const key={slash:'ng07_sword',hurt:'ng07_hurt',hit:'ng07_enemy',throw:'ng07_throw',jump:'ng07_jump',pickup:'ng07_pickup'}[name];
 if(key&&bank.has(key)){oneShot(key);return;}return r07Sound(name);
};
const r07AudioSync=audioSync;
audioSync=function(){r07NormaliseAudio();r07AudioSync();
 if(r12IsHero()&&bgm){const duck=hero==='tank'&&audio.currentTime<(r12.r06IntroUntil||0)?.3:1;setGain(bgm.gain,(bank.get(bgm.key)?.gain??.5)*duck,.04);}
};

const r07Fixed=fixedUpdate;
fixedUpdate=function(){
 const before=frame;
 if(r12IsHero()&&r12?.transition>21&&r07Transit?.kind==='pipe'){
  const k=42-r12.transition;player.x=r07Transit.x+r07Transit.dx*k*1.15;player.y=r07Transit.y+r07Transit.dy*k*1.15;
 }
 r07Fixed();if(frame!==before)r07TickDefeat();
};
const r07Draw=r12Draw;
r12Draw=function(){
 r07Draw();if(!r12)return;
 ctx.save();ctx.beginPath();ctx.rect(0,r12.area==='defense'?24:31,256,r12.area==='defense'?208:197);ctx.clip();
 for(const f of r07DefeatFx){
  if(f.age<0)continue;const x=f.x-camera,y=f.y-r12.camY;
  if(f.kind==='mario'){const im=classicSprite(f.sprite,f.under?'under':'normal');sprite(f.sprite,x-im.width/2,y-im.height/2,false,true,f.under?'under':'normal');}
  else{const im=R12_SPRITES['ng-explosion07'];if(im)ctx.drawImage(im,Math.min(2,Math.floor(f.age/6))*48,0,48,48,Math.round(x-16),Math.round(y-16),32,32);}
 }
 ctx.restore();
};
heroHelp.tank='坦克大战 · 方向键/WASD 四向移动，J/空格开炮。零/一星一颗在场炮弹，二/三星两颗；三星能破钢。红色闪烁车受击掉道具，绿装甲车四发击破。';
heroHelp.ryu='隼龙 · 方向移动，空格跳跃，J 攻击，L 忍术，E 切换。贴墙 ↑↓，跳跃蹬出。刀可击中前方及紧邻头顶的普通砖，不能砍碎石砖。';
const tankTitle=document.querySelector('[data-hero="tank"] strong');if(tankTitle)tankTitle.textContent='坦克大战';
if($('tankMusic06'))$('tankMusic06').checked=r06Music;
selectHero(hero);r07MenuState();
if(window.__relayTest){
 __relayTest.travel=(...a)=>r12Travel(...a);
 __relayTest.r07=()=>({version:R07_VERSION,bonusIndex:r07BonusIndex,transit:r07Transit,defeat:r07DefeatFx.map(f=>({...f})),mix:r07MixReport,pipeCount:pipes.length,secretTotal:r03Challenge?.total});
}

/* 0.8 — moving colliders, shared FX clock, safe reward exit and exclusive cues.
 * No canonical-map edits. Tank victory uses the existing user-supplied result clip.
 * Tally is a presentation of score already earned, NOT a second score award.
 */
const R08_VERSION='0.8.0';
let r08IgnoredLift=null,r08Cue=null,r08CueSerial=0,r08AudioPrevMode='menu';
const R08_EXIT={x:192,y:192,bottom:232};

function r08LiftBoxes(){return hero==='tank'&&r12?.area==='underground'?(r12.lifts||[]).filter(l=>l!==r08IgnoredLift):[];}
const r08OldTankCollision=r12TankCollides;
r12TankCollides=function(b){return r08OldTankCollision(b)||r08LiftBoxes().some(l=>overlap(b,l));};
function r08UpdateLifts(){
 if(!r12)return;
 if(hero!=='tank'){
  for(const l of r12.lifts){const old=l.y,stood=player.grounded&&player.x+player.w>l.x&&player.x<l.x+l.w&&Math.abs(player.y+player.h-old)<2;
   l.y+=l.vy;const wrapped=l.y>236||l.y<28;if(l.y>236)l.y=28;if(l.y<28)l.y=236;
   if(stood&&!wrapped){const b={...player,y:player.y+l.vy};if(!solids(b).length)player.y=b.y;}
  }return;
 }
 // Three platforms in one generator keep their spacing, including when blocked.
 // A moving face pushes a vehicle only through collision-checked space. If pinned,
 // the whole generator waits for one tick instead of crushing or overlapping it.
 const bodies=[player,...ninja.foes.filter(e=>!e.dead&&!e.spawn)];
 const groups=[...new Set(r12.lifts.map(l=>Math.floor(l.id/3)))];
 for(const group of groups){
  const lifts=r12.lifts.filter(l=>Math.floor(l.id/3)===group);
  const saved=lifts.map(l=>({l,y:l.y}));const positions=bodies.map(b=>({b,x:b.x,y:b.y,track:b.r06Track}));let ok=true;
  for(const l of lifts){l.y+=l.vy;if(l.y>236)l.y=28;if(l.y<28)l.y=236;}
  for(const {l,y} of saved){if(Math.abs(l.y-y)>2)continue;
   for(const b of bodies){if(!overlap(b,l))continue;
    const delta=l.vy>0?l.y+l.h-b.y+.001:b.y+b.h-l.y+.001;
    r08IgnoredLift=l;
    try{r12TankMove(b,l.vy>0?1:3,Math.max(0,delta));}finally{r08IgnoredLift=null;}
    if(overlap(b,l)){ok=false;break;}
   }if(!ok)break;
  }
  if(!ok){for(const s of saved)s.l.y=s.y;for(const s of positions){s.b.x=s.x;s.b.y=s.y;s.b.r06Track=s.track;}}
 }
}

// One music-cue slot: intro and result cannot overlap. It is not in the SFX voice
// pool (12 shooting sounds must never evict a 7.755-second victory recording).
function r08DetachCue(remember=false){
 const c=r08Cue;if(!c)return;
 if(c.node){if(remember&&audio)c.offset=Math.min(c.duration,c.offset+Math.max(0,audio.currentTime-c.started));
  const node=c.node;c.node=null;node.onended=null;try{node.stop();node.disconnect();c.gain.disconnect();}catch{}c.gain=null;
  audioLogEvent(remember?'cue-pause':'cue-stop',c.key,{role:c.role,offset:c.offset});
 }
 if(!remember)r08Cue=null;
}
function r08CueSync(){
 const c=r08Cue;if(!c||!audio)return;
 const playable=soundOn&&!document.hidden&&mode!=='paused'&&audio.state==='running';
 if(!playable){r08DetachCue(true);return;}
 if(c.done||c.node)return;
 if(c.offset>=c.duration-.003){c.done=true;return;}
 const item=bank.get(c.key);if(!item)return;
 const node=audio.createBufferSource(),gain=audio.createGain();node.buffer=item.buffer;node.loop=false;
 gain.gain.value=item.gain*(c.role==='intro'?.8:1);node.connect(gain);gain.connect(musicBus);
 c.node=node;c.gain=gain;c.started=audio.currentTime;
 node.onended=()=>{if(r08Cue===c&&c.node===node){c.node=null;c.done=true;c.offset=c.duration;c.gain=null;audioLogEvent('cue-ended',c.key,{role:c.role});}try{node.disconnect();gain.disconnect();}catch{}};
 node.start(0,c.offset);audioLogEvent('cue-start',c.key,{role:c.role,offset:c.offset,id:c.id});
}
function r08StartCue(key,role){
 if(!audio||!bank.has(key))return 0;
 if(r08Cue?.key===key&&r08Cue.role===role)return audio.currentTime+Math.max(0,r08Cue.duration-r08Cue.offset);
 r08DetachCue(false);stopMusic(false);heldTrack=null;r06StopEngine();
 // A victory cancels pending entrance/death/combat voices, but not future tally ticks.
 if(role!=='intro')stopEffects();
 r07NormaliseAudio();r08Cue={key,role,offset:0,duration:bank.get(key).buffer.duration,node:null,gain:null,started:0,done:false,id:++r08CueSerial};
 r08CueSync();return audio.currentTime+r08Cue.duration;
}
const r08OldOneShot=oneShot;
oneShot=function(key,options={}){
 if(hero==='tank'){
  if(['flag','tank_flag'].includes(key))return 0; // Never map a flag to the entrance cue.
  if(['clear','tank_clear','t06_result'].includes(key)){
   const role=mode==='flag'||mode==='win'?'flag-result':'defense-result';
   const owner=role==='flag-result'?r12:r03Challenge;
   if(owner?.r08ResultRequested)return 0;
   if(owner)owner.r08ResultRequested=true;
   return r08StartCue(role==='flag-result'?'t06_result':'t09_stage_done',role);
  }
  if(['t06_start','r03_tank_start'].includes(key)){
   if(mode!=='playing'||r03Challenge?.won||r08Cue?.role.includes('result'))return 0;
   return r08StartCue('t06_start','intro');
  }
 }
 return r08OldOneShot(key,options);
};
const r08OldDesired=desiredMusic;
desiredMusic=function(){return hero==='tank'?null:r08OldDesired();};
audioSync=function(){
 if(!audio)return;
 mixAudio();r07NormaliseAudio();
 if(!r12IsHero()){r08DetachCue(false);r06StopEngine();return r12OldSync();}
 if(hero==='tank'){
  r06Music=false;stopMusic(false);heldTrack=null;
  if(mode!==r08AudioPrevMode){
   if(mode==='flag'){if(!(r08AudioPrevMode==='paused'&&r08Cue?.role==='flag-result'))r08DetachCue(false);r06StopEngine();stopEffects();}
   else if(['menu','dying','gameover'].includes(mode))r08DetachCue(false);
   r08AudioPrevMode=mode;
  }
  if(r12?.r08IntroPending&&mode==='playing'&&!r12.transition&&!r12.spawnFrames&&bank.has('t06_start')){
   r12.r08IntroPending=false;r08StartCue('t06_start','intro');
  }
  r08CueSync();r06EngineSync();return;
 }
 r08DetachCue(false);r06StopEngine();
 if(mode==='paused'||document.hidden||!soundOn){stopMusic(true);return;}
 ninjaMakeAudio();const key=desiredMusic();if(key)playMusic(key);else{stopMusic(false);heldTrack=null;}
};
const r08OldResetAudio=resetGameAudio;
resetGameAudio=function(){r08DetachCue(false);r06StopEngine();r08AudioPrevMode='menu';return r08OldResetAudio();};
const r08OldClear=r05ClearSession;
r05ClearSession=function(){r08DetachCue(false);r06StopEngine();r08AudioPrevMode='menu';r08OldClear();};
const r08OldLoad=r12Load;
r12Load=function(...args){
 const target=args[0],previous=r12?.area;
 if(['entrance','defense'].includes(target)||hero!=='tank')r08DetachCue(false);
 r08OldLoad(...args);
 if(hero==='tank'){
  r12.r08IntroPending=['entrance','defense'].includes(target);
  if(target==='defense')r03Challenge.tally08=null;
 }
 r08AudioPrevMode=mode;
};
const r08OldPanel=updateAudioPanel;
updateAudioPanel=function(){r08OldPanel();if(hero==='tank'){
 if($('audioBadge'))$('audioBadge').textContent=!soundOn?'MUTED':r08Cue?.node?'PACK MUSIC':'PACK FX';
 if($('audioStatus'))$('audioStatus').textContent='坦克：开场短曲 / 履带 / 地下计数与完成提示 / 最终奖励曲。无额外循环曲。';
}};
// Resume only on user interaction, and resync completed/suspended cues explicitly.
document.addEventListener('visibilitychange',()=>audioSync());
for(const kind of ['pointerdown','keydown'])document.addEventListener(kind,()=>{
 if(audio&&audio.state==='suspended'&&soundOn)audio.resume().then(audioSync).catch(()=>{});
},true);

// Keep the kill ledger even when grenade kills do not earn direct kill points.
const r08OldKill=r12Kill;
r12Kill=function(e,noScore=false){
 const count=hero==='tank'&&r12?.area==='defense'&&!e.dead&&e.kind==='tank';
 if(count){const c=r03Challenge;c.ledger08??={};const type=e.tankKind||'basic';const row=c.ledger08[type]??={count:0,points:0};row.count++;row.points+=noScore?0:({basic:100,fast:200,power:300,armor:400}[type]||100);}
 return r08OldKill(e,noScore);
};
const r08OldWin=r03WinChallenge;
r03WinChallenge=function(kind){
 if(kind!=='tank')return r08OldWin(kind);
 const c=r03Challenge;if(!c||c.won)return;
 c.won=true;c.wonAt=frame;r12.r08IntroPending=false;
 if(!r03Rewards.tank){r03Rewards.tank=true;r12.tank.power=3;r12.tank.shield=600;r12Event('secret-reward',{kind:'tank',reward:'max-power-shield'});}
 ninja.projectiles=[];player.vx=player.vy=0;r04ClearCommands();
 const types=['basic','fast','power','armor'];
 const rows=types.map(type=>({type,count:c.ledger08?.[type]?.count??ninja.foes.filter(e=>e.dead&&e.tankKind===type).length,points:c.ledger08?.[type]?.points??0,shown:0,shownPoints:0}));
 c.tally08={active:true,clock:0,duration:330,rows,total:0,points:0,totalFlash:0,releaseSeen:false,lastTick:-1,scoreAtWin:score};
 c.exitPipe=null;pipes=[];r12.message='';r12.messageTime=0;r06StopEngine();stopEffects();r08DetachCue(false);r06Sound('tally',{volume:.7});
 r12Event('defense-tally-start',{kills:rows.reduce((a,b)=>a+b.count,0),earned:rows.reduce((a,b)=>a+b.points,0)});
};
function r08OpenDefenseExit(){
 const c=r03Challenge;if(!c||c.exitPipe)return;
 // Clear only the pre-existing exit approach. Install the obstacle AFTER finding
 // a free vehicle position; never leave a vehicle embedded in newly-created tiles.
 for(const b of c.blocks)if(b.x>=184&&b.y>=168)b.dead=true;
 const q={...R08_EXIT},foot={x:q.x,y:q.y,w:32,h:q.bottom-q.y};
 if(overlap(player,foot)){
  const before={x:player.x,y:player.y};player.x=clamp(player.x,q.x+4,q.x+20);player.y=q.y-player.h-1;
  r12Event('defense-exit-clearance',{from:before,to:{x:player.x,y:player.y}});
 }
 c.exitPipe=q;
 for(let x=q.x;x<q.x+32;x+=8)for(let y=q.y;y<q.bottom;y+=8)c.blocks.push({x,y,w:8,h:8,type:'pipe',dead:false});
 pipes=[q];r12.pipeCooldown=20;r04ClearCommands();player.vx=player.vy=0;r12.tank.cool=8;
 r12Message('基地守护成功 · 满级火力与护盾',120);r12Event('defense-exit-open');
}
function r08TallyTick(input){
 const c=r03Challenge,t=c.tally08;t.clock++;frame++;r12.ticks++;
 if(r12.shake>0)r12.shake--;updateParticles();
 for(const f of ninja.fx){f.x+=f.vx;f.y+=f.vy;f.life--;}ninja.fx=ninja.fx.filter(f=>f.life>0);
 player.vx=player.vy=0;
 if(!input.run&&!input.jump)t.releaseSeen=true;
 // Fresh press can finish the display early; a held final shot cannot dismiss it.
 const skip=t.clock>60&&t.releaseSeen&&(input.runPressed||input.jumpPressed);
 const countTicks=16,rowTicks=54,begin=30;
 for(let i=0;i<4;i++){
  const r=t.rows[i],elapsed=t.clock-begin-i*rowTicks;
  const shown=skip?r.count:clamp(Math.floor(elapsed/countTicks),0,r.count);
  if(shown!==r.shown){r.shown=shown;r.shownPoints=r.count?Math.round(r.points*shown/r.count):0;r.flash=10;r06Sound('tally',{volume:.5});}
  if(r.flash>0)r.flash--;
 }
 if(t.clock>=begin+4*rowTicks||skip){
  if(!t.totalShown){t.totalShown=true;t.totalFlash=18;oneShot('tank_clear');}
  t.total=t.rows.reduce((n,r)=>n+r.count,0);t.points=t.rows.reduce((n,r)=>n+r.points,0);
 }
 if(t.totalFlash>0)t.totalFlash--;
 if(t.clock>=t.duration||skip){
  t.active=false;for(const r of t.rows){r.shown=r.count;r.shownPoints=r.points;}r08OpenDefenseExit();
  r12Event('defense-tally-end',{skipped:skip,scoreUnchanged:score===t.scoreAtWin});
 }
}
const r08OldDefenseTick=r03DefenseTick;
r03DefenseTick=function(input){if(r03Challenge?.tally08?.active){r08TallyTick(input);return;}return r08OldDefenseTick(input);};
// The tank can't keep firing into its new exit while the score display is active.
const r08OldTankShot=r12TankShot;
r12TankShot=function(...args){if(r03Challenge?.tally08?.active)return false;return r08OldTankShot(...args);};
// Map overlay draws must guard the intentionally delayed exit.
const r08OldVertical=r07VerticalPipe;
r07VerticalPipe=function(q){if(q)return r08OldVertical(q);};
function r08DrawTally(){
 const t=r03Challenge?.tally08;if(r12?.area!=='defense'||!t?.active)return;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);
 rect(36,31,188,188,'#000');rect(38,33,184,1,'#8d8061');rect(38,217,184,1,'#8d8061');
 text('STAGE 01 CLEAR',128,43,'#f6d589',.9,true);text('I-PLAYER',53,64,'#f27b68',.8);
 text(String(t.scoreAtWin).padStart(6,'0'),164,64,'#f5e7a3',.8,false); // right-aligned below
 // Align numeric columns with the built-in pixel-font widths, no external fonts.
 const labels=['BASIC','FAST','POWER','ARMOR'];
 for(let i=0;i<4;i++){
  const r=t.rows[i],y=88+i*24,visible=t.clock>=30+i*54;
  const e={tankKind:r.type,hp:1,bonus:false,r06Track:0};r12DrawTank(ctx,51,y+1,3,true,0,r.type==='armor',e);
  const col=r.flash>0?(r.flash>5?'#fff8d5':'#f4c862'):'#e8e8dc';
  text(labels[i],74,y+1,'#9d9e98',.62);
  if(visible){text(String(r.shown).padStart(2,'0'),120,y+1,col,.85);text(String(r.shownPoints).padStart(4,'0'),151,y+1,col,.85);}
 }
 rect(50,187,156,1,'#b7ac8b');text('TOTAL',52,198,'#ede7d4',.8);
 if(t.totalShown){text(String(t.total).padStart(2,'0'),120,198,t.totalFlash>9?'#fff8d5':'#f3cd6d',.85);text(String(t.points).padStart(4,'0'),151,198,'#f3cd6d',.85);}
 ctx.restore();
}
const r08OldDraw=r12Draw;
r12Draw=function(){r08OldDraw();r08DrawTally();};
if(window.__relayTest){
 __relayTest.r08=()=>({version:R08_VERSION,cue:r08Cue?{key:r08Cue.key,role:r08Cue.role,active:!!r08Cue.node,offset:r08Cue.offset,duration:r08Cue.duration,done:r08Cue.done}:null,tally:r03Challenge?.tally08?JSON.parse(JSON.stringify(r03Challenge.tally08)):null,exit:r03Challenge?.exitPipe||null,liveParticles:particles.length,liveFloaters:floaters.length,music:desiredMusic(),engine:!!r06Engine});
}

/* 0.9: surface entrance, native scenery, positional tank ending and distinct tally sound.
 * Keep canonical level-data.js intact. The exterior is Mario scenery, the
 * underground tank level retains water and lifts. No continuous tank melody.
 */
const R09_VERSION='0.9.0';
function r09FinishPhase(f,phase){f.phase=phase;f.phaseAge=0;r12Event('tank-finish-phase',{phase,x:player.x,y:player.y});}
function r09FinishMove(f,x,y,speed,dir){
 const ox=player.x,oy=player.y,nx=approach(ox,x,speed),ny=approach(oy,y,speed);
 if(r12TankCollides({...player,x:nx,y:ny})){
  f.blocked=(f.blocked||0)+1;if(f.blocked===1)r12Event('tank-finish-blocked',{phase:f.phase,x:nx,y:ny});return false;
 }
 f.blocked=0;player.x=nx;player.y=ny;player.vx=nx-ox;player.vy=ny-oy;r12.tank.dir=dir;
 const n=Math.abs(player.vx)+Math.abs(player.vy);r12.tank.track+=n;player.anim+=n;
 return player.x===x&&player.y===y;
}
function r09FinishTank(){
 frame++;r12.ticks++;r12.clearTick++;const k=r12.clearTick;let f=r12.finish09;
 if(!f){
  f=r12.finish09={phase:'align',phaseAge:0,age:0,laneX:r12.def.flag+10,groundY:FLOOR-player.h-2,doorX:r12.def.castle+36,goalX:r12.def.castle+42,hidden:false,entered:false};
  r12.flagBonus=Math.max(100,Math.round((208-player.y)/32)*500);addScore(r12.flagBonus,player.x,player.y);
  player.vx=player.vy=0;player.invuln=0;r12.tank.shield=0;ninja.projectiles=[];r04ClearCommands();r12.r08IntroPending=false;
  audioSync();oneShot('clear');r09FinishPhase(f,'align');
 }
 f.age++;f.phaseAge++;player.vx=player.vy=0;flagY=approach(flagY,176,2.1);
 if(f.phase==='align'){if(r09FinishMove(f,f.laneX,player.y,1.5,player.x<=f.laneX?0:2))r09FinishPhase(f,'descend');}
 else if(f.phase==='descend'){if(r09FinishMove(f,f.laneX,f.groundY,1.65,1))r09FinishPhase(f,'turn');}
 else if(f.phase==='turn'){r12.tank.dir=0;if(f.phaseAge>=8)r09FinishPhase(f,'drive');}
 else if(f.phase==='drive'){if(r09FinishMove(f,f.goalX,f.groundY,1.45,0)){f.entered=true;f.hidden=true;flagPhase=2;r09FinishPhase(f,'inside');}}
 if(k>=70&&timeLeft>0){const n=Math.min(5,timeLeft);timeLeft-=n;score+=n*50;if(k%8===0)sfx('coin');}
 camera=clamp(player.x-110,0,Math.max(0,r12.def.width-W));updateParticles();
 if(f.entered&&f.phaseAge>=24&&timeLeft===0){mode='win';showOverlay('RESCUE RELAY / CHAPTER 02','1-2 突破成功','得分 '+score+' · 救援仍在继续。<br>“选人”会清空本次战场，开始全新的流程。','再玩一次 →');r12Event('win',{relay:r12RelayActive,castleEntered:true});}
 audioSync();
}
// Gatehouse drawing reuses the original Mario castle sprite builder.
function r09Castle(worldX){
 const x=worldX-camera;if(x>W+2||x+80<0)return;
 // Same 80x80 small-castle assembly as the map source, including filled
 // middle battlements. Crop the existing 17-row plain-brick sprite to 16.
 const brick=classicSprite('castle_brick');
 for(const dx of [0,16,48,64]){
  for(const dy of [40,24])ctx.drawImage(brick,0,0,16,16,Math.round(x+dx),FLOOR-dy,16,16);
  ctx.drawImage(brick,0,0,16,8,Math.round(x+dx),FLOOR-8,16,8);
 }
 sprite('castle_railing',x,FLOOR-48);sprite('castle_railing',x+64,FLOOR-48);
 for(const dx of [16,32,48])sprite('castle_railing_filled10',x+dx,FLOOR-48);
 for(const dx of [16,32,48])sprite('castle_railing',x+dx,FLOOR-80);
 sprite('castle_top',x+16,FLOOR-72);sprite('castle_top',x+40,FLOOR-72);
 sprite('castle_door',x+32,FLOOR-40);
 if((mode==='flag'&&flagPhase>=2)||mode==='win')sprite('castle_flag',x+33,FLOOR-100);
}
function r09DrawSurfaceMap(){
 rect(0,0,W,H,'#568ab5');
 for(let i=0;i<5;i++){sprite('cloud1',i*110-camera*.3,55+(i%2)*24);sprite('hill_small',i*150-camera*.6,189);}
 for(const t of tiles.values())if(t.x*T>camera-17&&t.x*T<camera+W)drawBlock(t);
 if(r12.area==='entrance')r09Castle(0);
 r12DrawPipes();for(const c of looseCoins)if(c.x>camera-10&&c.x<camera+W)drawCoin(c.x-camera,c.y);
 if(r12.area==='exit'){
  const x=r12.def.flag-camera;rect(x-1,40,2,152,'#e4e5bb');sprite('flag_top',x-4,32);sprite('flag',x-16,mode==='flag'||mode==='win'?flagY:48);r09Castle(r12.def.castle);
 }
}
const r09OldMap=r12DrawMap;
r12DrawMap=function(){if(r12&&['entrance','exit'].includes(r12.area))return r09DrawSurfaceMap();return r09OldMap();};
const r09OldLoad=r12Load;
r12Load=function(area,preserve=false,spawn=null,keepGeometry=false){
 r09OldLoad(area,preserve,spawn,keepGeometry);
 if(area==='entrance'&&!spawn&&r12IsHero()){
  // Place new arrivals outside the 80px gatehouse instead of inside its wall.
  Object.assign(player,{x:86,y:FLOOR-player.h-(hero==='tank'?2:0),vx:0,vy:0});
  camera=0;r12.camY=0;r12Checkpoint={hero,area,x:player.x,y:player.y};
 }
};
const r09OldTankDraw=r12DrawTank;
r12DrawTank=function(g,x,y,dir,enemy=false,t=0,armored=false,entity=null){
 const f=r12?.finish09;
 if(!enemy&&g===ctx&&r12?.area==='exit'&&f&&['flag','win'].includes(mode)){
  if(f.hidden)return;
  if(f.phase==='drive'){g.save();g.beginPath();g.rect(-10000,-10000,10000+f.doorX-camera,20000);g.clip();r09OldTankDraw(g,x,y,dir,enemy,t,armored,entity);g.restore();return;}
 }
 return r09OldTankDraw(g,x,y,dir,enemy,t,armored,entity);
};
const r09OldPanel=updateAudioPanel;
updateAudioPanel=function(){r09OldPanel();if(hero==='tank'&&$('audioStatus'))$('audioStatus').textContent='坦克：开场短曲 / 履带音效 / 地下计数与完成提示 / 最终奖励曲。无连续战斗配乐；音乐和音效可分别调节。';};
if(window.__relayTest)__relayTest.r09=()=>({...__relayTest.r08(),version:R09_VERSION,finish:r12?.finish09?{...r12.finish09}:null,surface:['entrance','exit'].includes(r12?.area)});
