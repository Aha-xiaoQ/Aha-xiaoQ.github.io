/* R33 · Native Sonic adapter. Authored for MarioMix; no extra engine/RAF.
 * Sprite sheet: ModGen, distributed by coderman64/motobug-engine.
 * Sonic and related IP remain SEGA's. This adapter is not a Genesis emulator.
 * Momentum/rolling/spin dash are Sonic-inspired; wall-running and light homing
 * are explicitly castle-crossover abilities, not claimed as Sonic 2 mechanics.
 */
const S33_ASSETS={"sprite":"@@E04:uri:a196@@","music":{"ambient":"@@E04:uri:a197@@","flood":"@@E04:uri:a198@@","ending":"@@E04:uri:a199@@"},"sfx":{"charge":"@@E04:uri:a200@@","checkpoint":"@@E04:uri:a201@@","dash":"@@E04:uri:a202@@","death":"@@E04:uri:a203@@","hit":"@@E04:uri:a204@@","homing":"@@E04:uri:a205@@","jump":"@@E04:uri:a206@@","release":"@@E04:uri:a207@@","ring":"@@E04:uri:a208@@","ringsLost":"@@E04:uri:a209@@","spring":"@@E04:uri:a210@@"}};
const S33_PHYS=Object.freeze({acc:.105,airAcc:.085,brake:.40,friction:.075,top:3.9,jump:4.9,gravity:.19,maxFall:5.8,dash:7.0,homing:7.4,wallSpeed:3.55});
const S33_KEYS={left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD'],up:['ArrowUp','KeyW'],down:['ArrowDown','KeyS'],jump:['Space','KeyK','KeyZ'],attack:['KeyJ','KeyX'],bash:['KeyE'],dash:['ShiftLeft','ShiftRight']};
const S33_NAMES={left:'向左',right:'向右',up:'向上 / 贴墙快跑',down:'下蹲 / 滚动',jump:'跳跃 / 空中追踪',attack:'蓄力冲刺（按住再松开）',bash:'追踪攻击',dash:'空中冲刺'};
const S33_PADS={left:[14],right:[15],up:[12],down:[13],jump:[0],attack:[2,1],bash:[3],dash:[5]};
let s33Binds=Object.fromEntries(Object.keys(S33_KEYS).map(k=>[k,{keys:[...S33_KEYS[k]],pad:[...S33_PADS[k]]}]));
try{const v=JSON.parse(save.get('sonic33-controls','null'));if(v&&Object.keys(S33_KEYS).every(k=>Array.isArray(v[k]?.keys)&&Array.isArray(v[k]?.pad)))s33Binds=v;}catch{}
let s33Mouse={attack:false,bash:false},s33Listen=null,s33SettingPrev=[],s33SettingsResume=false,s33Switching=false;
const s33Is=()=>c23Is()&&hero==='sonic';
const s33Wanted=()=>c23Campaign.chosen[14]==='sonic'?'sonic':'ori';
const s33Image=new Image();s33Image.src=S33_ASSETS.sprite;const s33Ready=s33Image.decode();
const S33_FRAMES={idle:[0,0,40,40,1],jog:[0,40,40,40,8],run:[0,80,40,40,4],jump:[0,316,31,31,8],skid:[40,203,40,40,1],death:[80,203,40,40,1],crouch:[40,243,40,40,1],charge:[0,284,32,32,5],push:[0,164,34,39,4],hurt:[0,203,40,40,1],spring:[0,120,43,43,5]};
function s33New(old=null){return{rings:old?.rings??0,charge:0,rolling:false,spin:false,dash:0,dashReady:true,homing:null,homingCd:0,lastTarget:null,targetCool:0,wall:0,wallLock:0,wallRun:false,coyote:5,jumpBuffer:0,prev:{},pose:'idle',anim:0,hurt:0,loose:[],collected:old?.collected||[],ringObjects:[],trail:[],attacks:old?.attacks||0,spinDashes:old?.spinDashes||0,wallFrames:old?.wallFrames||0,maxSpeed:old?.maxSpeed||0,airDashes:old?.airDashes||0,checkpoint:-1,phase:'horizontal',deathSound:false};}
function s33Ring(x,y,id){return{x,y,id,r:3,age:0};}
function s33MakeRings(){if(!s33Is()||!c23?.sonic)return;const s=c23.sonic,out=[];
 if(o28.phase==='horizontal'){
  // Non-solid collectibles only: the brick map and all platforms stay unchanged.
  for(let x=58;x<2010;x+=34){
   const floor=[...tiles.values()].filter(t=>!t.hidden&&x>=t.x*16&&x<t.x*16+16&&t.y*16>=104&&t.y*16<=208&&!solids({x:x-3,y:t.y*16-16,w:6,h:15}).length).sort((a,b)=>a.y-b.y)[0];
   if(floor)out.push(s33Ring(x,floor.y*16-10,'h:'+x));
  }
  for(const x of [2316,2350,2384])out.push(s33Ring(x,196,'h:'+x));
 }else if(o28.phase==='flood'){
  for(const [i,n]of o28.lamps.entries())for(let j=0;j<3;j++){const r=s33Ring(n.x+(j-1)*10,n.y+18,'v:'+i+':'+j);if(!solids({x:r.x-3,y:r.y-3,w:6,h:6}).length)out.push(r);}
 }
 s.ringObjects=out;s.phase=o28.phase;
}
function s33Reset(retry=false,old=null){if(!s33Is())return;c23.sonic=s33New(retry?old:null);player.w=9;player.h=14;c23.ori.bash=null;c23.ori.charge=0;c23.ori.gliding=false;c23.ori.clinging=false;s33MakeRings();}
const s33ResetBase=c23ResetScene;c23ResetScene=function(cp=0,retry=false){const old=c23?.sonic,r=s33ResetBase(cp,retry);if(s33Is()){s33Reset(retry,old);if(retry)c23.sonic.rings=Math.max(5,c23.sonic.rings);s33Chrome();}return r;};
const s33PreviewBase=c23Preview;c23Preview=function(){const r=s33PreviewBase();if(s33Is())s33Reset();return r;};
const s33FloodBase=o28EnterFlood;o28EnterFlood=function(cp=0,retry=false){const was=s33Is(),old=c23?.sonic,r=s33FloodBase(cp,retry);if(was){hero='sonic';c23.sonic=s33New(old);if(retry)c23.sonic.rings=Math.max(5,c23.sonic.rings);s33MakeRings();s33Chrome();}return r;};
const s33ClearBase=c23Clear;c23Clear=function(){s33ClearBase();s33Mouse.attack=s33Mouse.bash=false;if(c23?.sonic){Object.assign(c23.sonic,{charge:0,homing:null,dash:0,prev:{},jumpBuffer:0});}};
function s33Targets(v={}){if(!s33Is()||!c23?.sonic)return[];const p={x:player.x+4.5,y:player.y+7},s=c23.sonic,vertical=o28.phase==='flood';
 const base=(vertical?o28.lamps:O24_LANTERNS).map(n=>({...n,type:'light',key:'light:'+n.id}));
 if(vertical){base.push(...o28.shooters.filter(n=>n.hp>0).map(n=>({...n,type:'enemy',ref:n,key:'enemy:'+n.id})));base.push(...o28.projectiles.filter(n=>!n.reflected&&n.age<260).map((n,i)=>({...n,type:'projectile',ref:n,key:'shot:'+n.owner+':'+i})));}
 else{base.push(...c23.fire.filter(n=>!n.reflected).map((n,i)=>({x:n.x+12,y:n.y+4,type:'projectile',ref:n,key:'fire:'+i})));const b=c23.bowser;if(b.alive&&b.active)base.push({x:b.x+14,y:b.y+8,type:'boss',ref:b,key:'boss'});}
 const dx=(v.right?1:0)-(v.left?1:0),dy=(v.down?1:0)-(v.up?1:0),dd=Math.hypot(dx,dy);
 return base.map(n=>({...n,d:Math.hypot(n.x-p.x,n.y-p.y)})).filter(n=>n.d<113&&n.d>1&&(!dd||((n.x-p.x)*dx+(n.y-p.y)*dy)/(n.d*dd)>-.12)&&(!s.targetCool||n.key!==s.lastTarget)&&(!vertical||n.y<o28.water+3)&&o24LineClear(p,n))
 .map(n=>({...n,rank:n.d+(dd? (1-((n.x-p.x)*dx+(n.y-p.y)*dy)/(n.d*dd))*50:vertical?Math.max(0,n.y-p.y)*1.7:Math.max(0,(p.x-n.x)*player.facing)*1.2)})).sort((a,b)=>a.rank-b.rank);
}
function s33Homing(v){const s=c23.sonic;if(s.homingCd||s.homing||player.grounded)return false;const target=s33Targets(v)[0];if(!target)return false;s.homing={...target,age:0};s.spin=true;s.rolling=false;s.charge=0;s.homingCd=10;s.attacks++;s33Sound('homing');c23Event('sonic-homing',{target:target.key});return true;}
function s33HitTarget(t){const s=c23.sonic;s.lastTarget=t.key;s.targetCool=36;s.homing=null;s.homingCd=6;s.dashReady=true;s.spin=true;player.vy=-5.65;player.vx*=.28;player.grounded=false;
 if(t.type==='enemy'){t.ref.hp-=4;s33Sound('hit');addScore(200);}else if(t.type==='boss'){o24BossDamage(4);s33Sound('hit');}else if(t.type==='projectile'){t.ref.reflected=true;t.ref.vy=4.2;t.ref.vx=-1.5*player.facing;t.ref.age=0;s33Sound('hit');}else s33Sound('spring');o24FX(player.x+4,player.y+7,'#9bdeff',16,1.9);c23Event('sonic-bounce',{target:t.key});}
function s33Player(v){const p=player,s=c23.sonic,o=c23.ori;if(!s)return;const ground=p.grounded,dir=(v.right?1:0)-(v.left?1:0),jump=!!v.jump&&!s.prev.jump;
 for(const k of ['homingCd','targetCool','wallLock','hurt'])if(s[k]>0)s[k]--;if(p.invuln)p.invuln--;if(o.hurt)o.hurt--;
 if(ground){s.coyote=6;s.dashReady=true;if(!s.charge&&!s.rolling)s.spin=false;}else s.coyote=Math.max(0,s.coyote-1);
 s.jumpBuffer=jump?6:Math.max(0,s.jumpBuffer-1);s.wall=solids({...p,x:p.x-1.5}).length?-1:solids({...p,x:p.x+1.5}).length?1:0;s.wallRun=false;
 if(dir&&!s.wallLock)p.facing=dir;
 // A fresh button press is required for every homing attack; no global time-stop.
 if((v.bash&&!s.prev.bash||jump&&!ground&&!s.coyote&&!s.wall)&&!s.hurt)s33Homing(v);
 if(s.homing){let t=s.homing;if(t.ref){t.x=t.ref.x+(t.type==='boss'?14:0);t.y=t.ref.y+(t.type==='boss'?8:0);}const dx=t.x-(p.x+4.5),dy=t.y-(p.y+7),d=Math.hypot(dx,dy)||1;
  if(d<10){s33HitTarget(t);}else{p.vx=dx/d*S33_PHYS.homing;p.vy=dy/d*S33_PHYS.homing;const ox=p.x,oy=p.y;o24Move(p,p.vx,p.vy);t.age++;if(Math.hypot(p.x-ox,p.y-oy)<1||t.age>30){s.homing=null;s.homingCd=12;p.vy=Math.min(-1.7,p.vy);}else if(Math.hypot(t.x-p.x-4.5,t.y-p.y-7)<10)s33HitTarget(t);}
  s.pose='jump';s.anim+=.8;s.trail.push({x:p.x,y:p.y,life:9});s.prev={...v};o.prev={...v};o.pose='jump';o28ConstrainPlayer(p);return;
 }
 // Down + jump charges the classic spin dash. J / X is an accessible hold variant.
 const charging=ground&&!s.hurt&&(v.attack||v.down&&(s.charge>0||jump));
 if(charging){if(!s.charge)s33Sound('charge');s.charge=Math.min(1,s.charge+(v.attack?.025:jump?.24:0));p.vx=approach(p.vx,0,.6);s.pose='charge';s.spin=true;if(jump)s.jumpBuffer=0;}
 else if(s.charge>0){p.vx=p.facing*(4.4+s.charge*3.8);s.charge=0;s.rolling=true;s.spin=true;s.spinDashes++;s33Sound('release');s.pose='jump';}
 else if(!s.hurt){
  if(ground&&v.down&&Math.abs(p.vx)>.6){s.rolling=true;s.spin=true;}
  if(s.rolling){s.spin=true;p.vx=approach(p.vx,0,dir&&Math.sign(p.vx)!==dir?.24:.032);if(ground&&Math.abs(p.vx)<.4&&!v.down){s.rolling=false;s.spin=false;}}
  else if(dir&&!s.wallLock){const accel=ground?(Math.sign(p.vx)&&Math.sign(p.vx)!==dir?S33_PHYS.brake:S33_PHYS.acc):S33_PHYS.airAcc;if(Math.abs(p.vx)<S33_PHYS.top||Math.sign(p.vx)!==dir)p.vx=approach(p.vx,dir*S33_PHYS.top,accel);else p.vx=approach(p.vx,dir*S33_PHYS.top,.024);}
  else if(ground&&!s.wallLock)p.vx=approach(p.vx,0,S33_PHYS.friction);
  if(s.jumpBuffer&&(s.coyote||s.wall&&!s.wallLock)){
   if(!s.coyote&&s.wall){p.vx=-s.wall*3.4;p.facing=-s.wall;s.wallLock=10;p.vy=-5.1;s.wall=0;c23Event('sonic-wall-kick');}
   else p.vy=-S33_PHYS.jump;
   p.grounded=false;s.coyote=0;s.jumpBuffer=0;s.spin=true;s.rolling=false;s.dashReady=true;s33Sound('jump');
  }
  if(v.dash&&!s.prev.dash&&!p.grounded&&s.dashReady){s.dash=10;s.dashReady=false;s.spin=true;s.airDashes++;p.vx=p.facing*S33_PHYS.dash;p.vy=0;s33Sound('dash');}
 }
 if(s.dash){s.dash--;p.vy=0;s.pose='jump';}
 else if(!p.grounded&&s.wall&&dir===s.wall&&v.up&&!s.wallLock&&!s.hurt){
  // Castle adaptation: run along an existing wall; no new wall or platform.
  p.vy=-S33_PHYS.wallSpeed;p.vx=dir*.7;s.wallRun=true;s.spin=false;s.wallFrames++;s.dashReady=true;s.pose='run';
 }else{
  if(!v.jump&&s.prev.jump&&p.vy<-2.3&&s.spin&&!s.wallLock)p.vy=-2.3;
  p.vy=Math.min(S33_PHYS.maxFall,p.vy+S33_PHYS.gravity);
  if(!ground&&s.wall&&dir===s.wall&&p.vy>1.25&&!s.spin)p.vy=1.25;
  s.pose=s.hurt?'hurt':s.charge?'charge':s.rolling||!p.grounded&&s.spin?'jump':!p.grounded?'spring':dir&&Math.sign(p.vx)!==dir&&Math.abs(p.vx)>1?'skid':Math.abs(p.vx)>2.8?'run':Math.abs(p.vx)>.14?'jog':v.down?'crouch':'idle';
 }
 // Exit a convex wall lip by a small swept step, not a teleport through solids.
 if(s.wallRun&&!solids({...p,x:p.x+dir*1.5,y:p.y-5}).length){p.vx=dir*2.0;}
 o24Move(p,p.vx,p.vy);o28ConstrainPlayer(p);
 if(p.grounded&&s.spin&&!s.rolling&&!s.charge)s.spin=false;
 s.maxSpeed=Math.max(s.maxSpeed,Math.abs(p.vx));s.anim+=Math.max(.10,Math.abs(p.vx)*.09+(s.wallRun?.32:0));p.anim+=Math.abs(p.vx);o.pose=s.pose;o.prev={...v};s.prev={...v};
 if((s.dash||s.spin&&Math.abs(p.vx)>5)&&frame%2===0)s.trail.push({x:p.x,y:p.y,life:9});
 // Contact spin attacks are real enemy damage, not visual effects.
 if(o28.phase==='horizontal'){const b=c23.bowser;if(b.alive&&b.active&&s.spin&&!s.hurt&&(!s.bossHit||s.bossHit<frame-25)&&overlap(p,b)){s.bossHit=frame;o24BossDamage(3);p.vy=-4.6;p.grounded=false;s33Sound('hit');}}
 else for(const e of o28.shooters)if(e.hp>0&&s.spin&&Math.hypot(p.x+4-e.x,p.y+7-e.y)<13){e.hp-=4;p.vy=-4.6;p.grounded=false;s33Sound('hit');}
}
const s33PlayerBase=o24Player;o24Player=function(v){if(!s33Is())return s33PlayerBase(v);s33Player(v);if(o28IsVertical())o28Camera();};
const s33HurtBase=c23Hurt;c23Hurt=function(cause){if(!s33Is())return s33HurtBase(cause);const s=c23.sonic;if(!s||player.invuln||mode!=='playing'||c23.ending)return;
 if(cause==='库巴'&&s.spin&&!s.hurt)return;
 if(s.rings>0){const n=Math.min(24,s.rings);for(let i=0;i<n;i++){const a=-Math.PI*.95+i/Math.max(1,n-1)*Math.PI*.9,sp=2.5+(i%2)*1.0;s.loose.push({x:player.x+4.5,y:player.y+6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,age:0,life:420});}s.rings=0;s.hurt=28;s.charge=0;s.homing=null;s.dash=0;s.spin=false;player.invuln=120;player.vx=-player.facing*2;player.vy=-3.6;player.grounded=false;s33Sound('ringsLost');c23Event('sonic-rings-lost',{cause,count:n});}
 else c23Fail(cause);
};
const s33FailBase=c23Fail;c23Fail=function(cause){if(s33Is()&&c23?.sonic){c23.sonic.rings=0;c23.sonic.pose='death';c23.sonic.homing=null;c23.sonic.charge=0;}return s33FailBase(cause);};
const s33WaterBase=o27WaterTick;o27WaterTick=function(){if(!s33Is())return s33WaterBase();const q=o27PoolAt(),o=c23.ori;const wet=q&&o27Kind(q)==='corrupt';o.waterInside=!!wet;o.waterTicks=wet?(o.waterTicks||0)+1:0;if(o.waterTicks>=60){o.waterTicks=0;c23Hurt('污染河水');}};
function s33RingTick(){const s=c23.sonic;if(!s||!['horizontal','flood'].includes(o28.phase)||c23.ending)return;
 if(s.phase!==o28.phase)s33MakeRings();if(o28.phase==='horizontal'){for(let i=c23.cp+1;i<C23_CPS.length;i++)if(player.x>=C23_CPS[i].x){c23SnapshotCheckpoint(i);c23.ori.linkAge=70;c23.ori.hp=6;c23.ori.energy=4;}}const px=player.x+4.5,py=player.y+7;
 for(const r of s.ringObjects)if(!s.collected.includes(r.id)&&Math.hypot(r.x-px,r.y-py)<11){s.collected.push(r.id);s.rings=Math.min(999,s.rings+1);score+=10;s33Sound('ring');}
 for(const r of s.loose){r.age++;r.life--;r.vy+=.12;const body={x:r.x-2,y:r.y-2,w:4,h:4,vx:r.vx,vy:r.vy};moveBody(body,r.vx,r.vy,false);r.x=body.x+2;r.y=body.y+2;if(body.grounded)r.vy=-Math.abs(r.vy)*.7;if(r.age>30&&Math.hypot(r.x-px,r.y-py)<11){s.rings=Math.min(999,s.rings+1);r.life=0;s33Sound('ring');}}
 s.loose=s.loose.filter(r=>r.life>0&&r.x>=0&&r.x<2560&&r.y<(o28.phase==='flood'?o28.water:270));s.trail=s.trail.filter(t=>--t.life>0);
 const cp=(o28.phase==='flood'?10+o28.cp:c23.cp);if(cp!==s.checkpoint){if(s.checkpoint>=0){s.rings=Math.max(5,s.rings);s33Sound('checkpoint');}s.checkpoint=cp;}
}
const s33StepBase=c23Step;c23Step=function(v){const was=s33Is(),tick=c23?.ticks;if(was&&s33Box.open)return;const r=s33StepBase(v);if(was&&s33Is()&&mode==='playing'&&c23.ticks!==tick)s33RingTick();if(was)s33UI();return r;};
// --- independent input and bindings ---
const s33Box=document.createElement('dialog');s33Box.id='s33Bindings';s33Box.innerHTML='<header><h2>索尼克 · 按键设置</h2><button id="s33BindDone" type="button">完成</button></header><p>只修改索尼克，奥日及其他关卡不受影响。</p><div class="s33-bind-scroll"><table><thead><tr><th>动作</th><th>键盘</th><th>手柄</th></tr></thead><tbody id="s33Rows"></tbody></table></div><p id="s33BindStatus" role="status">方向与跳跃可以重绑；P / Esc 暂停，R 重试，C 选关。</p><button type="button" id="s33ResetBinds">恢复默认</button>';document.body.append(s33Box);
const s33BindButton=document.createElement('button');s33BindButton.id='s33BindingsButton';s33BindButton.type='button';s33BindButton.textContent='索尼克按键设置';o24Btn.after(s33BindButton);
function s33BindLabel(k,pad=false){return pad?({0:'A',1:'B',2:'X',3:'Y',5:'RB',12:'↑',13:'↓',14:'←',15:'→'}[k]||'按钮 '+k):o24KeyLabel(k);}
function s33BindingRows(){const tb=$('s33Rows');tb.innerHTML=Object.entries(S33_NAMES).map(([a,n])=>'<tr><td>'+n+'</td>'+['keys','pad'].map(src=>'<td><button type="button" data-s33-action="'+a+'" data-s33-source="'+src+'">'+s33Binds[a][src].map(k=>s33BindLabel(k,src==='pad')).join(' / ')+'</button></td>').join('')+'</tr>').join('');for(const b of tb.querySelectorAll('button'))b.onclick=()=>{s33Listen={action:b.dataset.s33Action,source:b.dataset.s33Source};c23Set('s33BindStatus','请按下 '+S33_NAMES[s33Listen.action]+' 的新按键；Esc 取消。');};}
function s33Bind(k){if(!s33Listen)return;const {action,source}=s33Listen;if((source==='keys'?['Escape','Enter','Tab','KeyP','KeyR','KeyC','KeyF','MetaLeft','MetaRight','AltLeft','AltRight']:[8,9]).includes(k)){c23Set('s33BindStatus','此键保留给系统或菜单，请换一个。');return;}if(Object.entries(s33Binds).some(([a,b])=>a!==action&&b[source].includes(k))){c23Set('s33BindStatus','此键已被其他动作使用。');return;}s33Binds[action][source]=[k];s33Listen=null;save.set('sonic33-controls',JSON.stringify(s33Binds));s33BindingRows();c23Set('s33BindStatus','索尼克键位已更新。');}
function s33CloseSettings(){s33Listen=null;s33Box.close();c23Clear();if(s33SettingsResume&&mode==='paused')togglePause();s33SettingsResume=false;}
s33BindButton.onclick=()=>{s33SettingsResume=mode==='playing';if(s33SettingsResume)togglePause();s33BindingRows();s33Listen=null;s33Box.showModal();c23Clear();};$('s33BindDone').onclick=s33CloseSettings;s33Box.addEventListener('cancel',e=>{e.preventDefault();s33CloseSettings();});$('s33ResetBinds').onclick=()=>{s33Binds=Object.fromEntries(Object.keys(S33_KEYS).map(k=>[k,{keys:[...S33_KEYS[k]],pad:[...S33_PADS[k]]}]));save.set('sonic33-controls',JSON.stringify(s33Binds));s33BindingRows();};
const s33InputBase=c23Input;c23Input=function(){if(!s33Is()||c23Menu)return s33InputBase();const pad=c23SafePad(),bs=pad?Array.from(pad.buttons,b=>!!(b?.pressed||b?.value>.5)):[],axes=pad?.axes||[];
 if(s33Box.open){if(s33Listen?.source==='pad'){const i=bs.findIndex((v,i)=>v&&!s33SettingPrev[i]);if(i>=0)s33Bind(i);}s33SettingPrev=bs;return{};}
 if(c23PadPresent&&!pad&&c23Device==='手柄'&&mode==='playing')togglePause();c23PadPresent=!!pad;
 const edge=i=>bs[i]&&!c23PadPrev[i];if(bs.some((v,i)=>v&&!c23PadPrev[i])||Math.abs(axes[0]||0)>.24||Math.abs(axes[1]||0)>.24)c23Device='手柄';
 if(!virtualInput){if(edge(8))showCharacters();else if(edge(9))togglePause();else if(edge(0)&&(['paused','respawn','win'].includes(mode)||mode==='dying'&&c23.deathFrames>25))handlePrimary();}
 let v={};for(const [a,b]of Object.entries(s33Binds))v[a]=b.keys.some(k=>keys.has(k))||b.pad.some(i=>bs[i]);v.left ||=axes[0]<-.24;v.right ||=axes[0]>.24;v.up ||=axes[1]<-.24;v.down ||=axes[1]>.24;v.attack ||=s33Mouse.attack;v.bash ||=s33Mouse.bash;for(const a of touch.values())v[a==='run'?'attack':a]=true;
 if(c23BlockJump){const raw=v.jump;v.jump=false;if(!raw)c23BlockJump=false;}c23PadPrev=bs;if(virtualInput)v={left:false,right:false,up:false,down:false,jump:false,attack:false,bash:false,dash:false,...virtualInput};return v;
};
const s33EarlyBase=t17Early.handle;t17Early.handle=function(e){if(!s33Is())return s33EarlyBase(e);if(s33Box.open){if(e.type==='keydown'&&!e.repeat){if(e.code==='Escape'){if(s33Listen){s33Listen=null;c23Set('s33BindStatus','已取消。');}else s33CloseSettings();}else if(s33Listen?.source==='keys')s33Bind(e.code);return true;}return e.type==='keyup';}
 if(c23Menu)return s33EarlyBase(e);
 if(e.type==='blur'&&e.target===window||e.type==='visibilitychange'&&document.hidden){s33Mouse.attack=s33Mouse.bash=false;return s33EarlyBase(e);}
 if(['keydown','keyup'].includes(e.type)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"]')){const actions=Object.entries(s33Binds).filter(([,b])=>b.keys.includes(e.code)).map(([a])=>a);if(actions.length){if(e.type==='keyup')keys.delete(e.code);else{if(actions.includes('jump')&&(['paused','win','respawn'].includes(mode)||mode==='dying'&&c23.deathFrames>30)){if(!e.repeat){handlePrimary();c23BlockJump=true;}}else{keys.add(e.code);c23Device='键盘';audioInit();}}return true;}}
 if(e.type.startsWith('pointer')){const b=e.target?.closest?.('.touchkey[data-action]');if(e.type==='pointerdown'&&b){touch.set(e.pointerId,b.dataset.action);b.classList.add('pressed');c23Device='触摸';try{b.setPointerCapture(e.pointerId);}catch{}audioInit();return true;}if(['pointerup','pointercancel'].includes(e.type)){if(e.type==='pointercancel'&&c23?.sonic){c23.sonic.charge=0;c23.sonic.homing=null;c23.sonic.dash=0;}touch.delete(e.pointerId);s33Mouse.attack=s33Mouse.bash=false;for(const b of document.querySelectorAll('.touchkey'))b.classList.toggle('pressed',[...touch.values()].includes(b.dataset.action));return true;}
  if(e.target===canvas&&e.type==='pointerdown'){if(e.button===0)s33Mouse.attack=true;if(e.button===2)s33Mouse.bash=true;canvas.focus({preventScroll:true});try{canvas.setPointerCapture(e.pointerId);}catch{}audioInit();return true;}
  if(e.target===canvas&&e.type==='pointermove')return true;
 }
 return s33EarlyBase(e);
};
// --- sprite drawing; every action is an actual ModGen sheet rectangle ---
function s33Sprite(g,x,feet,pose='idle',phase=0,face=1,alpha=1){if(!s33Image.complete||!s33Image.naturalWidth)return;let key=pose;if(['bash','dash','roll'].includes(key))key='jump';if(key==='glide')key='spring';if(key==='wall')key='push';if(key==='land')key='crouch';if(!S33_FRAMES[key])key='idle';const a=S33_FRAMES[key],idx=Math.floor(phase)%a[4],scale=key==='jump'||key==='charge'?.64:.61;
 g.save();g.globalAlpha*=alpha;g.translate(x,feet);g.scale(face,1);if(s33Is()&&c23?.sonic?.wallRun&&pose==='run'){g.translate(c23.sonic.wall*2,-7);g.rotate(-Math.PI/2);g.translate(0,7);}g.imageSmoothingEnabled=false;g.drawImage(s33Image,a[0]+idx*a[2],a[1],a[2],a[3],-a[2]*scale/2,-a[3]*scale,a[2]*scale,a[3]*scale);g.restore();}
const s33OriDrawBase=o24Ori;o24Ori=function(g,x,feet,pose='idle',phase=0,face=1,alpha=1,glow=true){if(!s33Is())return s33OriDrawBase(g,x,feet,pose,phase,face,alpha,glow);const s=c23?.sonic;const cinematic=o28.phase==='turn'||o28.phase==='outside'||c23.ending;return s33Sprite(g,x,feet,mode==='dying'?'death':cinematic?pose:s?.pose||pose,cinematic?c23.ticks*.14:s?.anim||phase,face,alpha);};
const s33PortraitBase=o24Portrait;o24Portrait=function(){const h=hero;try{hero='ori';s33PortraitBase();}finally{hero=h;}};
function s33DrawRing(g,x,y,age=0,alpha=1){const sx=.45+.55*Math.abs(Math.cos(age*.095));g.save();g.globalAlpha*=alpha;g.lineWidth=1.6;g.strokeStyle='#8f5514';g.beginPath();g.ellipse(x,y,3*sx,4,0,0,Math.PI*2);g.stroke();g.lineWidth=1;g.strokeStyle='#ffe782';g.beginPath();g.ellipse(x-.3,y-.3,3*sx,4,0,0,Math.PI*2);g.stroke();g.restore();}
const s33DrawBase=c23Draw;c23Draw=function(){s33DrawBase();if(!s33Is()||!c23?.sonic)return;const s=c23.sonic;if(['horizontal','flood'].includes(o28.phase)&&!c23.ending){const g=ctx;g.save();g.setTransform(3,0,0,3,0,0);g.beginPath();g.rect(0,32,256,208);g.clip();g.translate(-camera,-(o28.phase==='flood'?o28.camY:0));for(const r of s.ringObjects)if(!s.collected.includes(r.id)&&Math.abs(r.x-player.x)<280&&Math.abs(r.y-player.y)<300)s33DrawRing(g,r.x,r.y,c23.ticks);
 for(const r of s.loose)if(r.life>60||frame%8<4)s33DrawRing(g,r.x,r.y,c23.ticks);for(const t of s.trail)s33Sprite(g,t.x+4.5,t.y+14,'jump',s.anim,player.facing,t.life*.012);
 const target=s33Targets(s.prev)[0];if(target&&!player.grounded&&!s.homing&&mode==='playing'){g.translate(target.x,target.y);g.rotate(c23.ticks*.035);g.strokeStyle='#fff0a5';g.lineWidth=.7;for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(5,-6);g.lineTo(8,-6);g.lineTo(8,-3);g.stroke();}g.restore();}else g.restore();}
};
const s33HudBase=o24HUD;o24HUD=function(){if(!s33Is())return s33HudBase();const g=ctx,s=c23?.sonic;if(!s)return;g.save();g.fillStyle='#091529';g.fillRect(0,0,256,32);g.fillStyle='#284d70';g.fillRect(0,31,256,1);g.font='900 8px system-ui,sans-serif';g.fillStyle='#dbeeff';g.fillText('SONIC',9,13);g.font='4px system-ui,sans-serif';g.fillStyle='#87b5e6';g.fillText('CASTLE VELOCITY',9,24);s33DrawRing(g,66,11,c23.ticks);g.font='bold 10px monospace';g.fillStyle=s.rings?'#ffe797':c23.ticks%40<22?'#ffae98':'#ffe797';g.fillText(String(s.rings).padStart(3,'0'),74,15);
 g.font='4.3px system-ui';g.fillStyle=s.dashReady?'#bddcff':'#597495';g.fillText('冲刺',65,26);g.fillStyle=s33Targets(s.prev).length?'#f8dda0':'#597495';g.fillText('追踪',85,26);
 g.fillStyle='#34516a';g.fillRect(108,8,36,4);g.fillStyle=s.charge?'#ffdb78':'#63a5f4';g.fillRect(108,8,36*(s.charge||Math.min(1,Math.abs(player.vx)/8)),4);g.font='4.3px system-ui';g.fillStyle='#bdd3e9';g.fillText(s.charge?'蓄力 '+Math.round(s.charge*100)+'%':s.wallRun?'贴墙快跑':s.rolling?'滚动中':'SPEED',108,24);
 const phase=o28.phase,progress=phase==='horizontal'?clamp((player.x-30)/2386,0,1)*.46:phase==='turn'?.48:phase==='flood'?.5+clamp(o28.highest/(O28_H-100),0,1)*.47:1;g.textAlign='right';g.fillText(phase==='horizontal'?'01 / 熔城':phase==='turn'?'02 / 翻转':phase==='flood'?'03 / 洪水':'04 / 月夜',245,10);g.fillStyle='#344962';g.fillRect(166,16,79,1.5);g.fillStyle='#7fbfff';g.fillRect(166,16,79*progress,1.5);g.fillStyle='#acc8e3';g.fillText(phase==='flood'?'洪水 '+Math.max(0,Math.ceil((o28.water-player.y-14)/16))+' 格':'WORLD 1—4',245,26);g.restore();};
const s33EventBase=o28Event;o28Event=function(name,data){if(s33Is()&&data?.who==='奥日')data={...data,who:'索尼克'};return s33EventBase(name,data);};
const s33SayBase=o28Say;o28Say=function(who,...args){return s33SayBase(s33Is()&&who==='奥日'?'索尼克':who,...args);};
// --- character-aware checkpoint store; old Ori /1 saves remain compatible ---
const S33_SAVE_KEY='mariomix.sonic.castle14.r33.checkpoint';let s33Cache={ori:o30.snapshot,sonic:null};try{const v=localStorage.getItem(S33_SAVE_KEY);if(v)s33Cache.sonic=JSON.parse(v);}catch{}
const s33ValidateBase=o30Validate;o30Validate=function(input){const q=typeof input==='string'?JSON.parse(input):structuredClone(input);if(q.character&& !['ori','sonic'].includes(q.character))throw new Error('未知角色的进度。');if(q.character==='sonic'){if(!q.sonic||!Number.isInteger(q.sonic.rings)||q.sonic.rings<0||q.sonic.rings>999||!Array.isArray(q.sonic.collected)||q.sonic.collected.length>3000||q.sonic.collected.some(v=>typeof v!=='string'||v.length>70))throw new Error('索尼克金环记录损坏。');for(const k of ['attacks','spinDashes','wallFrames','maxSpeed','airDashes'])if(!o30Number(q.sonic[k],0,10000000))throw new Error('索尼克能力记录损坏。');}return s33ValidateBase(q);};
if(s33Cache.sonic){try{o30Validate(s33Cache.sonic);}catch{s33Cache.sonic=null;}}
let s33Capturing=false;const s33CaptureBase=o30Capture;o30Capture=function(){s33Capturing=true;try{return s33CaptureBase();}finally{s33Capturing=false;}};
const s33WriteBase=o30Write;o30Write=function(){if(!o30.snapshot)return false;const character=s33Wanted();o30.snapshot.character=character;if(character==='sonic'&&c23?.sonic&&(s33Capturing||!o30.snapshot.sonic)){const s=c23.sonic;o30.snapshot.sonic={rings:Math.max(5,s.rings),collected:[...s.collected],attacks:s.attacks,spinDashes:s.spinDashes,wallFrames:s.wallFrames,maxSpeed:s.maxSpeed,airDashes:s.airDashes};}s33Cache[character]=structuredClone(o30.snapshot);if(character==='ori')return s33WriteBase();try{localStorage.setItem(S33_SAVE_KEY,JSON.stringify(o30.snapshot));o30.storage='saved';o30.notice='';return true;}catch{o30.storage='session';o30.notice='浏览器未允许本地保存；可导出索尼克进度。';return false;}};
const s33ResumeBase=o30Resume;o30Resume=function(input=o30.snapshot){let s;try{s=o30Validate(input).data;}catch(e){toast('进度未载入：'+e.message);return false;}const character=s.character||'ori';o30Flush();o30.active=false;c23Campaign.chosen[14]=character;hero=character;const r=s33ResumeBase(s);if(r&&character==='sonic'&&c23.sonic){Object.assign(c23.sonic,structuredClone(s.sonic));c23.sonic.rings=Math.max(5,c23.sonic.rings);s33MakeRings();o30.snapshot=structuredClone(s);o30Write();}s33Chrome();c23Draw();return r;};
const s33SaveLabelBase=o30SaveLabel;o30SaveLabel=function(){return(s33Wanted()==='sonic'?'索尼克 · ':'奥日 · ')+s33SaveLabelBase();};
$('o30Export').onclick=()=>{o30Flush();if(!o30.snapshot){toast('先开始旅程，再导出检查点。');return;}const blob=new Blob([JSON.stringify(o30.snapshot,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MarioMix_1-4_'+s33Wanted()+'_Checkpoint.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已导出当前角色的检查点。');};
// --- menu and persistent scene chrome ---
heroNames.sonic='索尼克';heroHelp.sonic='加速与惯性、旋转跳跃、蓄力冲刺、金环保护。追踪既有光点，沿原墙上攀。';C23_ROOMS[14].heroes=['ori','sonic'];
const s33Card=document.createElement('button');s33Card.type='button';s33Card.dataset.hero='sonic';s33Card.setAttribute('aria-pressed','false');s33Card.innerHTML='<canvas class="s33-portrait" width="128" height="160" aria-hidden="true"></canvas><strong>索尼克</strong><small>速度 / 金环 / 追踪</small>';s33Card.onclick=()=>selectHero('sonic');o24Card.after(s33Card);
function s33Portrait(){const g=s33Card.querySelector('canvas').getContext('2d');g.clearRect(0,0,128,160);g.save();g.translate(64,133);g.scale(4,4);s33Sprite(g,0,0,'idle',0,1);g.restore();}
s33Ready.then(()=>{s33Portrait();if(s33Is())c23Draw();}).catch(()=>{s33Card.querySelector('small').textContent='图像加载失败，请重新打开文件';});
function s33SwitchStore(){const character=s33Wanted();o30.snapshot=s33Cache[character]?structuredClone(s33Cache[character]):null;o30.notice='';o30.pending=false;}
const s33ChooseBase=c23Choose;c23Choose=function(n){o30Flush();o30.active=false;const r=s33ChooseBase(n);if(n===14){s33SwitchStore();hero=s33Wanted();if(!c23?.sonic&&s33Is())s33Reset();}s33Chrome();return r;};
const s33SelectBase=selectHero;selectHero=function(id){if(c23Is()&&['ori','sonic'].includes(id)&&mode==='menu'){o30Flush();o30.active=false;c23Campaign.chosen[14]=id;s33SwitchStore();hero=id;c23Preview();c23Chrome();c23Draw();return;}const r=s33SelectBase(id);s33Chrome();return r;};
const s33StartBase=c23Start;c23Start=function(){const r=s33StartBase();s33Chrome();return r;};
function s33Key(action){const b=s33Binds[action];return c23Device.includes('手柄')?s33BindLabel(b.pad[0],true):o24KeyLabel(b.keys[0]);}
const s33HelpBase=o30Help;o30Help=function(){if(!s33Is())return s33HelpBase();if(c23Menu)return '同一座城堡，不同的速度。金环能抵挡一次受击；岩浆与洪水仍然致命。';if(mode==='paused')return '已暂停 · 按继续回到原位；蓄力与追踪不会误释放。';if(mode==='win')return '两次逃生完成。下一位公主，仍在下一座城堡。';if(mode==='dying')return '从最近的休息点重试 · '+c23.cause;if(o28.phase==='turn')return '机关正在翻转原来的城堡 · 入口现在在上方。';if(o28.phase==='outside')return '逃出城堡，喘口气。';if(c23.ending)return '吊桥正在断开 · 前往空房。';if(c23.sonic?.charge)return '松开 '+s33Key('attack')+' / 方向下键，释放蓄力冲刺。';if(o28.phase==='flood')return '贴原墙按住方向 + '+s33Key('up')+' 快跑 · '+s33Key('jump')+' 蹬墙 · '+s33Key('bash')+' 追踪上方光点';if(s33Targets().length&&!player.grounded)return s33Key('bash')+' / 再按跳跃：追踪框内目标，命中反弹；世界不会暂停。';return s33Key('jump')+' 旋转跳跃 · 按住 '+s33Key('attack')+' 再松开蓄力冲刺 · 下键滚动';};
function s33UI(){const on=s33Is();s33BindButton.hidden=!on;s33Resources.hidden=!on;document.body.classList.toggle('s33-sonic',on);if(!c23Is())return;for(const b of document.querySelectorAll('#heroPicker [data-hero]'))b.setAttribute('aria-pressed',String(b.dataset.hero===hero));document.querySelector('[data-chapter="14"] span').textContent='奥日 / 索尼克';if(!on)return;const s=c23?.sonic;if(!s)return;document.querySelector('.screen-top').children[0].textContent='04 / SONIC × CASTLE';document.querySelector('.screen-top').children[1].textContent='CASTLE VELOCITY';
 c23Set('heroStatus','索尼克 · 金环 '+s.rings+' · '+(c23.runFrames/60).toFixed(1)+' 秒');c23Set('heroHelp',heroHelp.sonic);c23Set('stateLabel',c23Menu?'准备出发':mode==='paused'?'已暂停':mode==='dying'?'本段重试':mode==='win'?'逃生完成':c23.ending?'触斧断桥':s.homing?'追踪攻击':s.charge?'蓄力冲刺':s.wallRun?'贴墙快跑':o28.phase==='flood'?'洪水逃生':o28.phase==='turn'?'机关翻转':'城堡疾行');c23Set('relayMessage',c23Menu?'选择角色后开始；两名角色分别保存进度。':mode==='win'?'索尼克完成两次逃生 · 追踪 '+s.attacks+' 次':o28.phase==='flood'?'沿原墙向上，留意上升洪水。':'积累速度，也为转弯留出刹车距离。');c23Set('o30HintText',o30Help());c23Set('gamepadStatus',c23Device+(c23PadPresent?' · 手柄已连接':''));c23Set('pauseButton',mode==='paused'?'继续':'暂停');c23Set('soundButton',soundOn?'声音：开':'声音：关');
 if(mode==='dying'&&c23.deathFrames>=40){c23Set('overlayLabel','SONIC / TRY AGAIN');c23Set('overlayText',c23.cause+'。从最近的休息点重新出发。');}
 const active=c23Menu&&o30.snapshot&&!o30.snapshot.completed;o30Continue.hidden=!active;o30Continue.textContent='继续索尼克旅程 →';
 c23Set('s33AudioStatus',s33Music.status);c23Set('o30SaveLine',o30SaveLabel());c23Set('o30SaveDescription',o30SaveLabel());
}
function s33Chrome(){document.head.append(document.getElementById('sonic33-style'));const on=s33Is();s33UI();if(!c23Is())return;o24Btn.hidden=on;o25Panel.hidden=on;document.body.classList.toggle('o24-ori',!on);o24Card.querySelector('small').textContent='精灵 / 借力 / 羽毛';const note=o30SavePanel.querySelector('.o30-fine');if(note)note.textContent=on?'继续时从最近的休息点出发，金环恢复到至少 5 个。本地进度只属于当前浏览器；换设备请先导出。':'继续时从最近的休息点出发，恢复生命与能量。本地进度只属于当前浏览器；换设备请先导出。';
 if(!on){o30Continue.textContent='继续奥日旅程 →';for(const b of o24Touch.querySelectorAll('button')){b.hidden=false;b.textContent=({dash:'冲刺',bash:'弹射',glide:'滑翔',climb:'攀爬',light:'光弹'})[b.dataset.action];}return;}
 C23_ROOMS[14].name='奥日 / 索尼克 · 城堡';document.querySelector('.panel>.kicker').textContent='CHAPTER 04 / SONIC × CASTLE';document.querySelector('.panel>h2').textContent='疾速脱困';const intro=document.querySelector('.panel>p.intro:first-of-type');if(intro)intro.textContent='金环护身，旋转出击。跑过熟悉的城堡，再顺着原墙向上逃离。';document.querySelector('.screen-top').children[1].textContent='SONIC / CASTLE VELOCITY';document.querySelector('.tagline').innerHTML='<span>1-4 · 索尼克</span><span>同一座城堡，另一种速度。</span>';
 c23Set('moveLabel','加速 / 惯性刹车');c23Set('jumpLabel','旋转跳跃 / 空中追踪');c23Set('actionLabel','按住蓄力 / 松开冲刺');c23Set('downLabel','下蹲 / 滚动');
 $('c23KeysText').innerHTML='<p><b>移动</b>　A D / 方向键加速；反向刹车。空格旋转跳跃，松开缩短跳高。下键进入滚动。</p><p><b>蓄力冲刺</b>　地面按住 J / 左键，再松开；也可按住下键连续点跳跃，松开下键发射。空中 Shift 冲刺，每次落地或追踪命中恢复。</p><p><b>追踪攻击</b>　空中按 E / 右键，或再按一次跳跃，冲向锁定框内的光点、弹体或敌人；命中后向上反弹。方向键帮助选目标，不暂停世界。</p><p><b>城堡适配</b>　贴住原墙，按墙的方向 + 上键快跑；跳跃蹬墙。不增加跑道、弹簧或平台，也没有奥日羽毛。</p><p><b>金环</b>　有环受击会散落，可捡回；无环受击重试。固定岩浆和洪水直接致命。休息点恢复至少 5 环。</p><p><b>标准手柄</b>　左摇杆移动；A 跳跃 / 空中追踪，X / B 蓄力，Y 追踪，RB 空中冲刺。Start 暂停，Select 选关。</p><p>P / Esc 暂停；R 本段重试；C 选关；F 全屏。索尼克有独立的键位和检查点，不覆盖奥日。</p>';
 const run=document.querySelector('.touchkey.run');run.textContent='蓄力';document.querySelector('.touchkey.jump').textContent='跳跃';for(const b of o24Touch.querySelectorAll('button')){b.hidden=['glide','climb','light'].includes(b.dataset.action);b.textContent=b.dataset.action==='bash'?'追踪':b.dataset.action==='dash'?'冲刺':b.textContent;}
 if(c23Menu){c23Set('overlayLabel','MARIO MIX / CHAPTER 04');c23Set('overlayTitle','疾速脱困');c23Set('overlayText','选择索尼克，跑出另一条逃生节奏。\n同一座城堡，奥日依然在这里。');c23Set('mainAction',o30.snapshot?'开始索尼克新旅程':'以索尼克出发 →');c23Set('overlayHint','↑ ↓ 选角色 · Enter / A 开始 · 索尼克与奥日分别存档');}
 if(mode==='win'){c23Set('overlayLabel','SONIC / JOURNEY COMPLETE');c23Set('overlayTitle','速度，找到出口。');c23Set('overlayText','两次逃生完成 · 金环 '+c23.sonic.rings+'\n追踪 '+c23.sonic.attacks+' 次 · 重试 '+c23.retries+' 次\n马里奥：我的公主呢？看来还需要继续。。。');}
 if(mode==='dying'){c23Set('overlayLabel','SONIC / TRY AGAIN');c23Set('overlayText',c23.cause+'。从最近的休息点重新出发。');}
}
const s33ChromeBase=c23Chrome;c23Chrome=function(){s33ChromeBase();s33Chrome();};const s33O30ChromeBase=o30Chrome;o30Chrome=function(){s33O30ChromeBase();s33Chrome();};
const s33UIBase=o30UI;o30UI=function(){s33UIBase();s33UI();};
// --- local audio bank and one media stream, fully integrated with master controls ---
const s33Audio=document.createElement('audio');s33Audio.id='s33SceneMusic';s33Audio.preload='auto';s33Audio.loop=true;s33Audio.hidden=true;document.body.append(s33Audio);
const s33Music={role:null,pending:false,generation:0,source:'offline',preference:'offline',failed:false,status:'原创离线配乐 · 开始后播放'};
const S33_REMOTE='https://raw.githubusercontent.com/coderman64/motobug-engine/429c7c9d15f06ad7a864b62d93c628978cbbbfb2/res/music/';
const S33_REMOTE_TRACKS={ambient:'Between.mp3',flood:'ChoiceChooser.mp3',ending:'EndJingle.mp3'};
const s33Resources=document.createElement('details');s33Resources.id='s33Resources';s33Resources.innerHTML='<summary>索尼克 · 素材与声音</summary><div><p>角色动作：ModGen 图集，经 Motobug Engine 公开仓库取得；Sonic 及相关角色权利归 SEGA。</p><label>配乐 <select id="s33MusicSource"><option value="offline">原创芯片配乐 · 离线</option><option value="online">Coderman64 同人配乐 · 联网</option></select></label><p id="s33AudioStatus" role="status"></p><button id="s33MusicRetry" type="button">重试声音</button><p>内置音乐为本项目原创，音效为参考重制，不是 SEGA 原声录音。联网曲目为 Coderman64 原创，作者允许署名使用；加载失败回退离线曲目。</p><p>蓄力、金环、追踪和贴墙快跑为本关适配；未宣称复刻某一款索尼克的全部实机数值。</p><p><a href="https://github.com/coderman64/motobug-engine" target="_blank" rel="noopener">图集与同人配乐来源</a></p></div>';o25Panel.after(s33Resources);
function s33MusicStop(clear=false){s33Audio.pause();if(clear){s33Music.generation++;s33Music.role=null;s33Music.pending=false;s33Audio.removeAttribute('src');s33Audio.load();}}
function s33MusicPlay(){if(!s33Is()||c23Menu||!soundOn||mode==='paused'||document.hidden||!s33Music.role||s33Music.pending||!s33Audio.paused)return;const gen=s33Music.generation;s33Music.pending=true;s33Audio.play().then(()=>{if(gen!==s33Music.generation)return;if(!s33Is()||mode==='paused'||!soundOn||document.hidden)s33Audio.pause();s33Music.status=s33Music.source==='online'?'Coderman64 同人配乐':'项目原创芯片配乐';}).catch(()=>{if(gen===s33Music.generation)s33Music.status='点击游戏或“重试声音”开启配乐';}).finally(()=>{if(gen===s33Music.generation)s33Music.pending=false;});}
function s33MusicUse(role,source){s33Audio.pause();s33Music.generation++;s33Music.pending=false;s33Music.role=role;s33Music.source=source;s33Music.status=source==='online'?'正在加载 Coderman64 同人曲目':'正在加载原创离线曲目';s33Audio.src=source==='online'?S33_REMOTE+S33_REMOTE_TRACKS[role]:S33_ASSETS.music[role];s33Audio.load();s33MusicPlay();}
let s33OnlineTimer=null;s33Audio.addEventListener('error',()=>{if(s33Is()&&s33Music.role&&s33Music.source==='online'){s33Music.failed=true;s33MusicUse(s33Music.role,'offline');s33Music.status='联网曲目不可用 · 原创离线配乐';}});s33Audio.addEventListener('canplay',()=>{clearTimeout(s33OnlineTimer);s33MusicPlay();});
const s33AudioBase=audioSync;audioSync=function(){if(!s33Is()){if(s33Music.role)s33MusicStop(true);return s33AudioBase();}if(o27Music.role)o27Stop(true);if(o26Music.role)o26NativePause(true);if(bgm||heldTrack)o26StopMusicBase(false);
 const role=!c23Menu&&c23&&['playing','paused','win'].includes(mode)?(o28.phase==='outside'||mode==='win'?'ending':o28.phase==='flood'||o28.phase==='turn'?'flood':'ambient'):null;
 if(!role){if(s33Music.role)s33MusicStop(true);return;}
 if(role!==s33Music.role){s33MusicUse(role,s33Music.preference==='online'&&!s33Music.failed?'online':'offline');if(s33Music.source==='online'){clearTimeout(s33OnlineTimer);const gen=s33Music.generation;s33OnlineTimer=setTimeout(()=>{if(gen===s33Music.generation&&s33Audio.readyState<3&&s33Is()){s33Music.failed=true;s33MusicUse(role,'offline');}},5000);}}
 s33Audio.volume=soundOn?Math.max(0,Math.min(1,musicVolume))*.85:0;if(!soundOn||mode==='paused'||document.hidden)s33Audio.pause();else s33MusicPlay();};
const s33StopBase=stopMusic;stopMusic=function(remember=false){s33MusicStop(!remember);return s33StopBase(remember);};const s33MixBase=mixAudio;mixAudio=function(){s33MixBase();s33Audio.volume=soundOn?clamp(musicVolume,0,1)*.85:0;};
$('s33MusicSource').onchange=e=>{s33Music.preference=e.target.value;s33Music.failed=false;s33MusicStop(true);audioSync();};$('s33MusicRetry').onclick=()=>{s33Music.failed=false;s33MusicStop(true);audioInit();audioSync();};
let s33SfxReady=null;function s33LoadSfx(){if(s33SfxReady)return s33SfxReady;const ac=audioInit(false);if(!ac)return Promise.resolve();s33SfxReady=Promise.all(Object.entries(S33_ASSETS.sfx).map(async([k,data])=>{const bytes=Uint8Array.from(atob(data.split(',')[1]),c=>c.charCodeAt(0));const b=await ac.decodeAudioData(bytes.buffer);bank.set('s33_'+k,{buffer:b,gain:.65});}));return s33SfxReady;}
const s33SoundTimes={};function s33Sound(kind){if(!soundOn||!audio||mode==='paused')return;if(kind==='ring'&&(s33SoundTimes.ring??-100)>frame-3)return;s33SoundTimes[kind]=frame;if(!bank.has('s33_'+kind)){s33LoadSfx();return;}oneShot('s33_'+kind,{volume:.7});}
const s33OriSoundBase=o24Sound;o24Sound=function(k){if(!s33Is())return s33OriSoundBase(k);s33Sound(({jump:'jump',double:'spring',dash:'dash',bash:'homing',link:'checkpoint',heal:'ring',hurt:'ringsLost',death:'death',light:'hit',flame:'hit'})[k]||'hit');};
for(const ev of ['pointerdown','keydown'])window.addEventListener(ev,e=>{if(s33Is()&&!e.repeat){s33LoadSfx();s33MusicPlay();}},true);
window.addEventListener('pagehide',()=>s33Audio.pause());document.addEventListener('visibilitychange',()=>{if(document.hidden)s33Audio.pause();});
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R33',chapter14:'Ori + Sonic / same R32 canonical world'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test'))window.__sonic33={...window.__ori32,build:'R33',mini:()=>({x:player.x,y:player.y,vx:player.vx,vy:player.vy,grounded:player.grounded,phase:o28.phase,mode,frame,ticks:c23.ticks,cp:c23.cp,vcp:o28.cp,rings:c23.sonic?.rings,retries:c23.retries,ending:c23.ending,water:o28.water}),sonic:()=>c23.sonic,hero:()=>hero,choose:id=>selectHero(id),start:()=>c23Start(),ready:()=>s33Ready,controls:()=>structuredClone(s33Binds),targets:v=>s33Targets(v),physics:S33_PHYS,read:()=>c23Input(),update:v=>c23Step(v),render:()=>c23Draw(),audioReady:s33LoadSfx,audioInfo:()=>Object.keys(S33_ASSETS.sfx).map(k=>({name:k,loaded:!!bank.get('s33_'+k)?.buffer,duration:bank.get('s33_'+k)?.buffer?.duration||0})),sound:k=>s33Sound(k),music:()=>({role:s33Music.role,source:s33Music.source,paused:s33Audio.paused,volume:s33Audio.volume,time:s33Audio.currentTime,src:s33Audio.currentSrc}),save:()=>structuredClone(o30.snapshot),validate:v=>o30Validate(v),resume:v=>o30Resume(v),persist:()=>o30Capture(),cache:()=>structuredClone(s33Cache),hurt:cause=>c23Hurt(cause),fail:cause=>c23Fail(cause),audioSync:()=>audioSync(),pose:p=>{c23.sonic.pose=p;},key:()=>s33Is()};
