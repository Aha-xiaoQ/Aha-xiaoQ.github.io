/* R34 — Separate Sonic's classic SMB 1-4 route from Ori's two-act route.
 * Reuses the preserved c23Map/rectangles/sprites, Sonic controls and asset bank.
 * No new solid geometry; no Ori lanterns, repair ledges, rotating castle or flood.
 * Horizontal camera is updated after EVERY Sonic movement branch, including
 * homing/dash/knockback; rendering is side-effect free for camera position.
 */
const S34_MAP='smb-1-4-classic/1';
const S34_SAVE_KEY='mariomix.sonic.castle14.r34.classic.checkpoint';
const S34_CP_NAMES=['城堡入口','火棒长廊','隐藏砖区','库巴桥前'];
let s34ValidationCharacter=null;
const s34SpecBase=o29Spec;
o29Spec=function(){return (s34ValidationCharacter==='sonic'||s34ValidationCharacter===null&&s33Is())?structuredClone(O29_CANONICAL):s34SpecBase();};
const s34ValidateBase=o30Validate;
o30Validate=function(input){
 const q=typeof input==='string'?JSON.parse(input):structuredClone(input);
 if(q?.character==='sonic'&&(q.map!==S34_MAP||q.phase!=='horizontal'))throw new Error('这份索尼克进度属于旧版旋转城堡路线，请在原版 1-4 重新开始。');
 const old=s34ValidationCharacter;s34ValidationCharacter=q?.character||'ori';
 try{return s34ValidateBase(q);}finally{s34ValidationCharacter=old;}
};
const s34WriteBase=o30Write;
o30Write=function(){
 if(s33Wanted()!=='sonic')return s34WriteBase();
 if(!o30.snapshot)return false;
 const q=o30.snapshot;q.character='sonic';q.map=S34_MAP;
 if(c23?.sonic&&(s33Capturing||!q.sonic)){const s=c23.sonic;q.sonic={rings:Math.max(5,s.rings),collected:[...s.collected],attacks:s.attacks,spinDashes:s.spinDashes,wallFrames:s.wallFrames,maxSpeed:s.maxSpeed,airDashes:s.airDashes};}
 s33Cache.sonic=structuredClone(q);
 try{localStorage.setItem(S34_SAVE_KEY,JSON.stringify(q));o30.storage='saved';o30.notice='';return true;}
 catch{o30.storage='session';o30.notice='浏览器未允许本地保存；可导出索尼克原版城堡进度。';return false;}
};
// R33 Sonic saves remain untouched under their old key, never silently migrated.
s33Cache.sonic=null;
try{const raw=localStorage.getItem(S34_SAVE_KEY);if(raw)s33Cache.sonic=o30Validate(raw).data;}catch{}
function s34Camera(snap=false){
 if(!s33Is()||!c23)return;
 const s=c23.classic||(c23.classic={look:0});
 if(snap){s.look=0;camera=clamp(player.x-112,0,2304);}
 else{
  const targetLook=Math.abs(player.vx)>.18?clamp(player.vx*6,-34,34):0;
  s.look=approach(s.look,targetLook,.75);
  const desired=clamp(player.x+player.w*.5-128+s.look,0,2304);
  camera=approach(camera,desired,Math.max(3,Math.abs(player.vx)+1));
  // The safety frame catches sudden high-speed launches without screen loss.
  camera=clamp(camera,Math.max(0,player.x-192),Math.max(0,player.x-44));
  camera=clamp(camera,0,2304);
 }
 o28.camY=0;maxProgress=Math.max(maxProgress,player.x);
}
function s34Prepare(){
 if(!s33Is()||!c23)return;
 o28.phase='horizontal';o28.camY=0;o28.age=0;o28.waterStarted=false;
 o28.platforms=[];o28.lamps=[];o28.shooters=[];o28.projectiles=[];o28.hazards=[];
 c23.classic={look:0};c23.chaseStarted=false;c23.wave=-4096;c23.waveSpeed=0;
 c23.bowser.hp=3;c23.bowser.maxHp=3;c23.bowser.hits37=0;c23.bowser.hitTick37=-Infinity;c23.ori.waterInside=false;c23.ori.waterTicks=0;
 s34Camera(true);
}
const s34ResetBase=c23ResetScene;c23ResetScene=function(cp=0,retry=false){const r=s34ResetBase(cp,retry);s34Prepare();return r;};
const s34PreviewBase=c23Preview;c23Preview=function(){const r=s34PreviewBase();s34Prepare();return r;};
const s34ResumeBase=o30Resume;o30Resume=function(input=o30.snapshot){const ok=s34ResumeBase(input);if(ok&&s33Is()){s34Camera(true);s34Chrome();c23Draw();}return ok;};
const s34RetryBase=c23Retry;c23Retry=function(){if(s33Is())return c23ResetScene(c23.cp,true);return s34RetryBase();};
const s34FloodBase=o28EnterFlood;o28EnterFlood=function(cp=0,retry=false){if(s33Is())return false;return s34FloodBase(cp,retry);};
const s34TargetsBase=s33Targets;s33Targets=function(v={}){return s34TargetsBase(v).filter(t=>t.type!=='light');};
const s34BumpBase=bumpTile;bumpTile=function(t){
 if(!s33Is())return s34BumpBase(t);
 if(t.type!=='question')return C23_CORE.bumpTile(t);
 if(t.used){oneShot('bump');return;}
 const rings=t.content==='power'?10:1;t.hidden=false;t.used=true;t.bump=12;t.content=null;
 c23.sonic.rings=Math.min(999,c23.sonic.rings+rings);coins+=rings;score+=rings*100;
 s33Sound('ring');c23Event('sonic-classic-block',{x:t.x,y:t.y,rings});
 if(t.worldId){o29Patch(t.worldId,{used:true,revealed:true},'classic Sonic block');o29.sourceTiles.set(t.worldId,{...t});o29Refresh();}
};
function s34Hazards(){
 for(let j=0;j<C23_BARS.length;j++)for(const p of c23BarDots(C23_BARS[j],j))if(c23CircleHit(p.x,p.y,3.3))c23Hurt('旋转火棒');
 // Restore all FOUR original lava pits: no corrupted-water substitutions.
 for(const pool of C23_LAVA)if(player.x+player.w>pool.x+1&&player.x<pool.x+pool.w-1&&player.y+player.h>pool.y+5)c23Fail('熔岩');
 for(const f of c23.fire){f.age++;f.x+=f.vx;
  if(f.reflected){f.y+=f.vy||0;if(c23.bowser.alive&&overlap({x:f.x,y:f.y,w:24,h:8},c23.bowser)){o24BossDamage(4);f.destroy=true;s33Sound('hit');}}
  else{f.y=approach(f.y,f.ty,.38);if(overlap(player,{x:f.x+4,y:f.y+2,w:16,h:4}))c23Hurt('库巴火焰');}
 }
 c23.fire=c23.fire.filter(f=>!f.destroy&&f.age<440&&f.x>camera-70&&f.x<camera+400&&f.y>-40&&f.y<280);
}
const s34HazardsBase=c23Hazards;c23Hazards=function(){if(s33Is())return s34Hazards();return s34HazardsBase();};
const s34EndingBase=c23EndingTick;c23EndingTick=function(){
 if(!s33Is())return s34EndingBase();
 // Preserved pre-Ori ending: original axe, 13 bridge sections, Toad room, win.
 o24EndingBase();s34Camera();
 c23.sonic.pose=c23.ending>112&&player.x<2416?'jog':'idle';
 c23.sonic.anim+=.18;
 if(c23.ending===96)c23Event('classic-bridge-cleared');
 if(mode==='win')s34Chrome();
};
function s34PostStep(){
 if(o30.flash&&mode==='playing')o30.flash--;
 if(o30.pending&&mode==='playing'&&!c23Menu&&!c23.ending)o30Capture();
 if(mode==='win'&&!o30.finished){o30.finished=true;if(o30.snapshot){o30.snapshot.completed=true;o30Flush();}s34Chrome();}
 s33UI();audioSync();
}
const s34StepBase=c23Step;c23Step=function(v){
 if(!s33Is())return s34StepBase(v);
 if(!c23||c23Menu||s33Box.open||['paused','win','respawn'].includes(mode))return;
 if(mode==='dying'){
  c23.deathFrames++;frame++;
  if(c23.deathFrames>14){player.y+=player.vy;player.vy+=.19;}
  if(c23.deathFrames===40){showOverlay('SONIC / TRY AGAIN','再试一次',c23.cause+'。从最近的城堡检查点重新出发。','立即重试 →','A / 空格 重试 · R 本段重试');$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');}
  if(c23.deathFrames>=85)c23Retry();s33UI();return;
 }
 if(mode!=='playing')return;
 frame++;c23.ticks++;c23.runFrames++;c23.shake*=.84;
 const old=c23.lift.x;c23.lift.x=2192+Math.sin(c23.ticks*.016)*32;c23.lift.dx=c23.lift.x-old;
 if(c23.ending){c23EndingTick();o24World();c23Particles();o29SyncHorizontal(true);s34PostStep();return;}
 s33Player(v);s34Camera();
 if(mode!=='playing'){s34PostStep();return;}
 o24World();c23BossTick();s34Hazards();
 if(mode!=='playing'){s34PostStep();return;}
 if(player.x+player.w>2256&&player.x<2278&&player.y<160&&player.y+player.h>112){c23Axe();s33Sound('checkpoint');s34PostStep();return;}
 s33RingTick();
 timerTicks++;if(timerTicks>=30){timerTicks=0;timeLeft=Math.max(0,timeLeft-1);if(!timeLeft)c23Fail('时间用尽');}
 c23Particles();s34PostStep();
};
// Classic pixel-art renderer, independent of Ori's backdrop/shaders/scene hooks.
function s34Lava(pool){const x=pool.x-camera;ctx.save();ctx.beginPath();ctx.rect(x,pool.y,pool.w,240-pool.y);ctx.clip();rect(x,pool.y+8,pool.w,240-pool.y,'#d82800');for(let xx=pool.x-8;xx<pool.x+pool.w+8;xx+=8)sprite('c23_lava',xx-camera+(Math.floor(c23.ticks/8)%8),pool.y);ctx.restore();}
function s34HUD(){
 const g=ctx,s=c23.sonic;g.save();rect(0,0,256,32,'#000');
 hud('SONIC',16,9);hud(String(score).padStart(6,'0'),16,21);
 s33DrawRing(g,89,22,c23.ticks);hud(String(s.rings).padStart(3,'0'),99,21);
 hud('WORLD',145,9);hud('1-4',153,21);hud('TIME',210,9);hud(String(Math.ceil(timeLeft)).padStart(3,'0'),216,21);
 g.restore();
}
function s34Draw(){
 if(!c23?.sonic)return;
 if(canvas.width!==768||canvas.height!==720){canvas.width=768;canvas.height=720;}
 const g=ctx;g.setTransform(3,0,0,3,0,0);g.imageSmoothingEnabled=false;rect(0,0,256,240,'#000');g.save();g.beginPath();g.rect(0,32,256,208);g.clip();b40SonicBackdrop();
 for(const t of tiles.values()){
  if(t.hidden||t.x*16<camera-16||t.x*16>camera+256)continue;
  const y=t.y*16-(t.bump?Math.sin(t.bump/12*Math.PI)*4:0),name=t.castleBase?'c23_base':t.type==='stone'?'c23_stone':t.used?'block_used':'question'+Math.floor(frame/8)%3;
  sprite(name,t.x*16-camera,y,false,false,t.type==='question'?'under':'normal');
 }
 for(const q of C23_LAVA)s34Lava(q);
 for(let i=0;i<13-c23.bridgeRemoved;i++)sprite('c23_bridge',2048+i*16-camera,160);
 for(let i=0;i<4;i++)sprite('c23_platform',c23.lift.x+i*8-camera,96);
 if(!c23.ending){sprite('c23_chain',2241-camera,144);sprite('c23_axe'+Math.floor(frame/8)%3,2256-camera,128);}
 s35DrawAmy(g,2448-camera,208);
 const b=c23.bowser;if(b.y<260){if(b.alive)sprite('c23_bowser'+Math.floor(b.age/12)%2,b.x-camera-2,b.y,b.face>0);else sprite('goomba',b.x-camera+6,b.y,false,true);}
 for(let i=0;i<C23_BARS.length;i++)for(const q of c23BarDots(C23_BARS[i],i))sprite('fireball'+Math.floor((frame+i)/4)%4,q.x-camera-4,q.y-4);
 for(const f of c23.fire)sprite('c23_bowserFire',f.x-camera,f.y,f.vx>0);
 const s=c23.sonic;
 if(!c23.ending){
  for(const r of s.ringObjects)if(!s.collected.includes(r.id)&&r.x>camera-8&&r.x<camera+264)s33DrawRing(g,r.x-camera,r.y,c23.ticks);
  for(const r of s.loose)if(r.life>60||frame%8<4)s33DrawRing(g,r.x-camera,r.y,c23.ticks);
  for(const t of s.trail)s33Sprite(g,t.x+4.5-camera,t.y+14,'jump',s.anim,player.facing,t.life*.012);
 }
 if(!player.invuln||mode==='dying'||c23.ending||Math.floor(frame/4)%2===0)s33Sprite(g,player.x+4.5-camera,player.y+14,mode==='dying'?'death':s.pose,s.anim,player.facing);
 const target=s33Targets(s.prev)[0];if(target&&!player.grounded&&!s.homing&&mode==='playing'&&!c23.ending){g.save();g.translate(target.x-camera,target.y);g.rotate(c23.ticks*.035);g.strokeStyle='#fff0a5';g.lineWidth=.7;for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(5,-6);g.lineTo(8,-6);g.lineTo(8,-3);g.stroke();}g.restore();}
 s35DrawRewards(g);
 for(const p of c23.dust){if(p.s>3)sprite('debris',p.x-camera,p.y,false,frame%8>3,'castle');else rect(p.x-camera,p.y,p.s,p.s,'#fc9838');}
 for(const f of floaters)text(f.text,f.x-camera,f.y,'#fff',1,true);
 if(c23.ending>200&&player.x>2360)s35DrawEndingMessage(g);
 g.restore();s34HUD();s33UI();
}
const s34DrawBase=c23Draw;c23Draw=function(){if(s33Is())return s34Draw();return s34DrawBase();};
// UI and state must describe the selected route, not the previous character.
const s34RouteHTML=o30Route.innerHTML;let s34RouteOwner='ori';
heroHelp.sonic='原版马里奥 1-4 城堡：加速、滚动、蓄力冲刺和金环保护。越过火棒，触斧断桥。';
const s34HelpBase=o30Help;o30Help=function(){
 if(!s33Is())return s34HelpBase();
 if(c23Menu)return '原版 1-4 城堡 · 火棒、库巴桥和艾咪房间。此路线不旋转，也没有洪水。';
 if(mode==='paused')return '已暂停 · 继续后从原位出发。';
 if(mode==='win')return '原版城堡已通关 · 公主还在另一座城堡。';
 if(mode==='dying')return '从最近的城堡检查点重试 · '+c23.cause;
 if(c23.ending)return c23.bridgeRemoved<13?'吊桥正在断开。':'沿原出口走进艾咪的房间。';
 if(c23.sonic?.charge)return '松开 '+s33Key('attack')+' / 下键，释放蓄力冲刺。';
 if(s33Targets().length&&!player.grounded)return s33Key('bash')+' / 再按跳跃：追踪库巴或火球。';
 return s33Key('jump')+' 跳跃 · '+s33Key('attack')+' 蓄力冲刺 · 反向刹车 · 金环不能抵挡岩浆';
};
const s34SaveLabelBase=o30SaveLabel;o30SaveLabel=function(){
 if(s33Wanted()!=='sonic')return s34SaveLabelBase();
 if(o30.notice)return o30.notice;
 const q=o30.snapshot;if(!q)return '索尼克 · 原版城堡 · 抵达检查点时自动保存。';
 return '索尼克 · '+(q.completed?'已通关 · ':o30.storage==='session'?'会话进度 · ':'已保存 · ')+S34_CP_NAMES[q.cp];
};
function s34UI(){
 const on=s33Is();document.body.classList.toggle('s34-classic',on);
 if(!c23Is())return;
 if((on?'sonic':'ori')!==s34RouteOwner){o30Route.innerHTML=on?'<span data-act="horizontal">01 城堡</span><i></i><span data-act="bridge">02 断桥</span><i></i><span data-act="rescue">03 营救</span>':s34RouteHTML;s34RouteOwner=on?'sonic':'ori';}
 o24Card.querySelector('small').textContent='奥日专线 / 借力 / 羽毛';s33Card.querySelector('small').textContent='原版城堡 / 速度 / 金环';
 if(!on||!c23?.sonic)return;
 const stage=mode==='win'||player.x>=2360?'rescue':c23.ending?'bridge':'horizontal';
 for(const el of o30Route.querySelectorAll('[data-act]')){const active=el.dataset.act===stage;el.classList.toggle('current',active);if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');}
 c23Set('o30HintText',o30Help());c23Set('o30SaveLine',o30SaveLabel());c23Set('o30SaveDescription',o30SaveLabel());
 c23Set('relayMessage',c23Menu?'索尼克：原版 1-4 · 奥日：专用双场景':mode==='win'?'原版 1-4 通关 · 金环 '+c23.sonic.rings:c23.ending?'触斧断桥，前往原版出口。':'留意火棒与熔岩；高速移动时也要预留刹车距离。');
 c23Set('stateLabel',c23Menu?'准备出发':mode==='win'?'城堡通关':mode==='paused'?'已暂停':mode==='dying'?'本段重试':c23.ending?'营救艾咪':c23.sonic.homing?'追踪攻击':c23.sonic.charge?'蓄力冲刺':'原版城堡');
 const progress=mode==='win'?100:clamp((player.x-30)/2386,0,1)*100; $('progressFill').style.width=progress+'%';c23Set('distanceLabel','WORLD 1-4 · '+Math.floor(progress)+'%');c23Set('livesLabel','重试 '+c23.retries);c23Set('bestLabel','SCORE '+String(score).padStart(6,'0'));
 const top=document.querySelector('.screen-top');top.children[0].textContent='04 / SONIC × MARIO';top.children[1].textContent='CLASSIC WORLD 1-4';
}
function s34Chrome(){
 s34UI();if(!s33Is())return;
 document.querySelector('.panel>.kicker').textContent='CHAPTER 04 / CLASSIC CASTLE';document.querySelector('.panel>h2').textContent='疾速闯城';
 const intro=document.querySelector('.panel>p.intro:first-of-type');if(intro)intro.textContent='索尼克挑战原版马里奥 1-4。灰砖长廊、火棒、库巴桥；触斧断桥后，救出艾咪。';
 document.querySelector('.tagline').innerHTML='<span>1-4 · 索尼克 / 原版城堡</span><span>CLASSIC CASTLE · SONIC SPEED</span>';
 $('c23KeysText').innerHTML='<p><b>移动</b>　A D / 方向键加速；反向刹车。空格旋转跳跃，松开缩短跳高；下键滚动。</p><p><b>冲刺</b>　地面按住 J / 左键，松开释放；也可按下键连续点跳跃蓄力。空中 Shift 冲刺。</p><p><b>追踪</b>　空中 E / 右键，或再按一次跳跃，追踪库巴或火球；方向键帮助选择目标。没有奥日借力光点。</p><p><b>金环</b>　有环受击会散落，可捡回；无环受击重试。所有固定岩浆池均致命。问号砖给予金环，检查点恢复至少 5 环。</p><p><b>路线</b>　原版 1-4 横向城堡 → 触斧断桥 → 艾咪房间 → 通关。无城堡旋转、上升洪水或奥日专用平台。</p><p><b>标准手柄</b>　左摇杆移动；A 跳跃 / 空中追踪；X / B 蓄力；Y 追踪；RB 空中冲刺。Start 暂停，Select 选关。</p><p>P / Esc 暂停；R 本段重试；C 选关；F 全屏。按键与存档不覆盖奥日。</p>';
 const text=o30SavePanel.querySelector('.o30-fine');if(text)text.textContent='原版城堡单独保存。继续时从最近的检查点出发，至少恢复 5 环；旧旋转路线的索尼克进度不混用。';
 if(c23Menu){c23Set('overlayTitle','疾速闯城');c23Set('overlayText','索尼克挑战原版马里奥 1-4。\n奥日保留独立的旋转城堡路线。');c23Set('mainAction',o30.snapshot?'开始索尼克新旅程':'以索尼克出发 →');}
 if(mode==='win'){c23Set('overlayLabel','SONIC / WORLD 1-4 COMPLETE');c23Set('overlayTitle','城堡突破！');c23Set('overlayText','吊桥已断开，艾咪获救。\n公主还在另一座城堡。\n金环 '+c23.sonic.rings+' · 重试 '+c23.retries+' 次');c23Set('mainAction','再挑战一次 →');}
}
const s34UIBase=s33UI;s33UI=function(){s34UIBase();s34UI();};
const s34ChromeBase=s33Chrome;s33Chrome=function(){s34ChromeBase();s34Chrome();};
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R34',chapter14:'Ori: two-act route; Sonic: original SMB 1-4 castle'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test'))window.__sonic34={...window.__sonic33,build:'R34',camera:()=>({x:camera,y:o28.camY,screenX:player.x-camera,look:c23.classic?.look}),canonical:()=>structuredClone(O29_CANONICAL),map:()=>[...tiles.values()].map(t=>({...t})),classicMap:()=>[...c23Map().values()],world:()=>o29.world.snapshot(),definitions:()=>o29.world.definitions(),pools:()=>C23_LAVA.map(p=>({...p,kind:'lava'})),cameraUpdate:s34Camera,advance:n=>{for(let i=0;i<n;i++)fixedUpdate();draw();},hazards:()=>c23Hazards(),bump:(x,y)=>{const t=tiles.get(tileKey(x,y));if(t)bumpTile(t);},saveKey:S34_SAVE_KEY};
