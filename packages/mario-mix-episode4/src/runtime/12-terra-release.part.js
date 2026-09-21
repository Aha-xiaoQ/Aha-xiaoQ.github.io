/* R20: recovered R17 + single-owner input, contact interactions, readable boss
 * staging and the final native-brick castle. No main collision geometry changes.
 * The rail-aware pursuit/camera is an explicit crossover adaptation, not vanilla AI. */
const T20_BUILD='R20-unified-20260913';
const t20AssetJobs=[];
for(const [k,url] of Object.entries(T20_ASSETS))t20AssetJobs.push(new Promise(resolve=>{const im=new Image();im.onload=()=>{r06Images[k]=im;r08ImageRevision++;resolve(true);};im.onerror=()=>resolve(false);im.src=url;}));

// Mouse coordinates always use the visible canvas content rectangle, including
// its border/letterboxing and the current camera; idle pointer does not own a pad.
t17AimPoint=function(s,v={},tools=false){
 const p=s.p,sc=t10Scale(s),origin={x:p.x+p.w/2,y:p.y+p.h/2};
 if(t20Device==='keyboard'&&t17Input.source==='mouse'&&t17Input.lastMouse){
  t13SamplePointer({clientX:t17Input.lastMouse[0],clientY:t17Input.lastMouse[1]});
  if(t13Pointer.active)return{x:t13Pointer.x,y:t13Pointer.y,source:'mouse',pointer:true};
 }
 if(t20Device==='gamepad'&&!tools){
  const eye=s.r05Arena&&s.phase==='battle'&&s.eye&&!s.eye.dead?s.eye:null;
  const target=eye?{id:'boss',x:eye.x,y:eye.y,vx:eye.vx,vy:eye.vy}:r06Target(s,s.r05Arena?1600:W*1.25);
  if(target){
   // Aim assistance only sets the launch location. Arrows remain ordinary projectiles.
   const lead=r06Weapon(s)==='stormbow'&&s.r05Arena?35:0;
   const x=target.x+clamp((target.vx||0)*lead,-600,600),y=target.y+clamp((target.vy||0)*lead,-450,450);
   return{x,y,source:'gamepad-auto',pointer:false,targetId:target.id};
  }
 }
 let dx=v.x||t20LeftAim[0]||p.facing,dy=v.y||t20LeftAim[1]||0;
 if(t20Device==='keyboard'){dx=v.x||p.facing;dy=v.y||0;}
 const n=Math.hypot(dx,dy)||1;dx/=n;dy/=n;const reach=(tools?52:260)*sc;
 return{x:origin.x+dx*reach,y:origin.y+dy*reach,dx,dy,source:t20Device==='gamepad'?'gamepad-direction':'keyboard',pointer:false};
};

// Slight difficulty adjustment, applied once per fresh main-map state.
const t20NewBase=newState;
newState=function(){const s=t20NewBase();if(s.stage!==0||s.secret)return s;
 for(const e of s.foes){e.t20BaseHp=e.maxHp;e.hp=e.maxHp=Math.ceil(e.maxHp*1.2);}
 for(const [id,kind,index] of [['tree-14','slime',40],['tree-15','zombie',41],['tree-16','caveBat',42]]){
  const q=s.level.surfaces.find(q=>q.id===id);if(!q)continue;
  const e=t10MakeFoe(kind,q,q.x+Math.min(22,q.w-24),index,'blue');e.t20BaseHp=e.maxHp;e.hp=e.maxHp=Math.ceil(e.maxHp*1.2);e.t20Added=true;s.foes.push(e);
 }
 t20ArrangeTrees(s);s.t20Build=T20_BUILD;return s;
};
function t20ArrangeTrees(s){
 const ss=s.level.surfaces.filter(q=>q.type==='tree'||q.type==='floor'),taken=[];
 s.trees=(s.trees||[]).filter(t=>{
  const candidates=ss.filter(q=>t.x>=q.x+5&&t.x<q.x+q.w-5).sort((a,b)=>a.y-b.y);
  let q=candidates[0];if(!q)return false;
  const half=t.t16Biome==='desert'?16:27;
  const x=clamp(t.x,q.x+Math.min(half,q.w/2),q.x+q.w-Math.min(half,q.w/2));
  // No canopy crosses a higher cap, a pipe or a moving-platform corridor.
  if(s.level.surfaces.some(a=>a!==q&&a.y<q.y&&a.x<x+half&&a.x+a.w>x-half))return false;
  if(taken.some(a=>Math.abs(a.x-x)<48&&Math.abs(a.y-q.y)<60))return false;
  t.x=x;t.y=q.y;t.visualH=t.h=t.t16Biome==='desert'?Math.min(82,q.y-12):Math.min(112,q.y-12);
  t.visualH=t.h=Math.max(54,t.h);t.t20Surface=q.id;taken.push(t);return true;
 });
}

// Five accessories including the existing Cloud in a Bottle, then the bow;
// the summon item sits at the right, and is gated by all other supply pickups.
const t20PrepareBase=t11PrepareRoom;
t11PrepareRoom=function(s){t20PrepareBase(s);s.t13Accessories??={boots:false,regen:false};
 // Keep ground-tree crowns clear of overhead wooden platforms; native trunks
 // remain full width, and rail lines may pass behind the trunks as scenery.
 for(const t of s.trees||[]){const caps=s.level.surfaces.filter(q=>q.oneWay&&q.type!=='rail'&&q.y<t.y&&q.x<t.x+48&&q.x+q.w>t.x-48);
  if(caps.length){const headroom=t.y-Math.max(...caps.map(q=>q.y))-12;t.h=t.visualH=Math.min(t.visualH,Math.max(80,headroom));}
 }

 const defs=[['cloudBottle','云朵瓶',170,!!s.cloudJump],['hudBoots','赫尔墨斯靴',232,!!s.t13Accessories.boots],['hudRegen','再生手环',294,!!s.t13Accessories.regen],['sharkNecklace','鲨牙项链',356,!!s.t13Accessories.shark],['shackle','脚镣',418,!!s.t13Accessories.shackle],['stormbow','代达罗斯风暴弓',480,s.t13Owned.includes('stormbow')],['suspiciousEye','可疑眼球',564,s.phase==='cleared']];
 s.t12Supplies=defs.map(([kind,name,tx,done],index)=>({kind,name,tx,done,index,x:252,y:454,age:0,launched:false,grounded:false}));
 s.notice='';s.noticeTime=0;
};
t12SuppliesStep=function(s){if(s.t11Transition||s.phase==='cleared')return;s.t12RoomTicks++;if(!s.t11Chest?.opened)return;
 for(const d of s.t12Supplies||[]){if(d.done||!d.launched)continue;d.age++;const u=Math.min(1,d.age/24);d.x=252+(d.tx-252)*(u*u*(3-2*u));d.y=u<1?454-60*Math.sin(u*Math.PI):474;d.grounded=u===1;
  if(d.age<24||!near(s.p,{x:d.x-14,y:d.y-12,w:28,h:32}))continue;
  if(d.kind==='suspiciousEye'&&s.t12Supplies.some(q=>q.kind!=='suspiciousEye'&&!q.done))continue;
  d.done=true;terraSound('pickup');
  if(d.kind==='cloudBottle')r06CollectCloud(s);
  else if(d.kind==='hudBoots')s.t13Accessories.boots=true;
  else if(d.kind==='hudRegen')s.t13Accessories.regen=true;
  else if(d.kind==='sharkNecklace')s.t13Accessories.shark=true;
  else if(d.kind==='shackle')s.t13Accessories.shackle=true;
  else if(d.kind==='stormbow'){if(!s.t13Owned.includes('stormbow'))s.t13Owned.push('stormbow');s.t13Weapon='stormbow';s.t12Blade=true;s.t13Inventory.arrows+=400;s.tool=0;s.p.attack=s.p.cooldown=0;}
  else{ s.t12SummonGate=true;const ok=r05Summon();s.t12SummonGate=false;if(!ok){d.done=false;continue;} }
  if(d.kind!=='suspiciousEye')r06Chat(d.name,'#e2d7a7');t13Event('supply-pickup',{kind:d.kind,phase:s.phase});r05Persist();
 }
};
const t20DamageEyeBase=R05Eye.damageEye;
R05Eye.damageEye=function(e,raw){if(state?.eye===e&&state.t13Accessories?.shark&&raw>0){const d=e.phase===1?e.profile.phase1Defense:e.profile.phase2Defense;raw+=Math.min(5,Math.max(0,d))/2;}return t20DamageEyeBase(e,raw);};
const t20ModelBase=t15Model;
t15Model=function(s){const m=t20ModelBase(s);if(s.t13Accessories?.shark)m.gear.push({key:'sharkNecklace',name:'鲨牙项链 · 穿透 5 防御'});if(s.t13Accessories?.shackle)m.gear.push({key:'shackle',name:'脚镣 · 防御 +1'});return m;};

// Contact loot uses the existing item transaction, without pausing or a modal.
function t20TouchLoot(s){
 if(s.phase==='battle'||s.t11Transition)return;
 if(s.t11Chest&&!s.t11Chest.opened&&near(s.p,{x:s.t11Chest.x-7,y:s.t11Chest.y-6,w:46,h:42}))t12Open();
 for(const c of s.t13World?.chests||[]){if(c.removed||c.empty||!near(s.p,{x:c.x-6,y:c.y-6,w:44,h:40}))continue;
  c.opened=true;t13OpenChestId=c.id;mode='inventory';
  try{t13TakeChest();}finally{t13OpenChestId=null;t13ChestPanel.hidden=true;mode='playing';}
  r06Chat(c.name+' · 已收取','#dbcba6');t13Event('contact-chest',{id:c.id});
 }
}
function t20TouchCart(s){
 if(!s.r05Arena||s.t11Transition||s.t13Recalling)return;t16Init(s);const cart=s.t16Cart;if(cart.on)return;
 const p=s.p,q=t16RailPoint(cart.d),close=near(p,{x:q.x-22,y:q.y-22,w:44,h:30});
 if(s.t17CartMustLeave&&!close)s.t17CartMustLeave=false;
 if(close&&!s.t17CartMustLeave&&!(s.t16BoardLock>0)&&!s.mounted)t16Board('contact',66);
}

// Continuous arrival outside the current viewport (never teleported to the player).
const t20SummonBase=r05Summon;
r05Summon=function(){const ok=t20SummonBase();const s=state;if(ok&&s?.eye){const e=s.eye;e.x=s.cam+R06_VIEW.w+116;e.y=(s.camY??-96)+112;e.vx=-3;e.vy=.3;e.mode='arrival';e.age=0;e.trail=[];e.t20Entered=false;s.t20Arrival={x:e.x,y:e.y,cam:s.cam};}return ok;};
const t20EyeBase=r06EyeStep;
r06EyeStep=function(e,p){
 const s=state,rail=!!s?.t16Cart?.on;
 const pursue=(arrival=false)=>{
  const dir=Math.abs(p.vx)>.5?Math.sign(p.vx):s?.t16Cart?.dir||1;
  const tx=p.x+p.w/2+(arrival?210:-260)*dir,ty=p.y-180;
  const dx=tx-e.x,dy=ty-e.y;
  const vx=clamp((rail?p.vx:0)+dx*.052,-24,24),vy=clamp((rail?p.vy:0)+dy*.045,-17,17);
  e.vx=approach(e.vx,vx,arrival?.55:.7);e.vy=approach(e.vy,vy,.55);
  e.x+=e.vx;e.y+=e.vy;e.angle=Math.atan2(p.y+p.h/2-e.y,p.x+p.w/2-e.x);
  return Math.hypot(dx,dy);
 };
 if(e.mode==='arrival'||e.mode==='railApproach'){
  const arriving=e.mode==='arrival';e.tick++;e.age++;
  const d=pursue(arriving);e.trail.push({x:e.x,y:e.y,angle:e.angle});if(e.trail.length>14)e.trail.shift();
  if(e.age>45&&d<280){e.mode='hover';e.age=0;e.t20Entered=true;return[{type:'state',mode:'hover',phase:e.phase}];}return[];
 }
 // A charge has a visible starting position. Recover from off-screen by flying
 // back into position, not by teleporting or launching an unseen intercept.
 if(rail&&['hover','recover','fastWind'].includes(e.mode)&&
    (Math.abs(e.x-p.x)>920||Math.abs(e.y-p.y)>520)){
  e.mode='railApproach';e.age=0;return r06EyeStep(e,p);
 }
 const before={x:e.x,y:e.y,mode:e.mode,vx:e.vx,vy:e.vy};
 const events=t20EyeBase(e,p);
 if(rail&&((before.mode==='hover'&&e.mode==='hover')||(before.mode==='recover'&&e.mode==='recover'))){
  // Rail-speed adaptation affects only staging/recovery, never a launched charge.
  e.x=before.x;e.y=before.y;e.vx=before.vx;e.vy=before.vy;pursue();
 }
 if(rail&&events.some(q=>q.type==='fast-dash')){
  // Aim once at the launch position; no extra predictive intercept is added for
  // a minecart. The rapid dash retains its speed and never homes after launch.
  const speed=Math.hypot(e.vx,e.vy),dx=p.x+p.w/2-before.x,dy=p.y+p.h/2-before.y,d=Math.hypot(dx,dy)||1;
  e.vx=dx/d*speed;e.vy=dy/d*speed;e.x=before.x+e.vx;e.y=before.y+e.vy;e.angle=Math.atan2(dy,dx);
 }
 return events;
};
const t20CameraBase=t11Camera;
t11Camera=function(s){const e=s?.eye;
 if(!s?.r05Arena||s.phase!=='battle'||!e||e.dead||!e.t20Entered){if(s)s.t20Camera=null;return t20CameraBase(s);}
 const p=s.p,px=p.x+p.w/2,py=p.y+p.h/2,w=R06_VIEW.w,h=R06_VIEW.h;
 const cx=clamp((px+e.x)*.5-w/2,px-w+170,px-170),cy=clamp((py+e.y)*.5-h/2,py-h+110,py-160);
 // Keep an independent previous camera: legacy player-follow writes earlier in
 // the tick must not cancel this framing on every frame.
 const previous=s.t20Camera||{x:s.cam,y:s.camY??-96};
 s.cam=approach(previous.x,clamp(cx,0,R07_ARENA.width-w),Math.abs(p.vx)+14);
 s.camY=approach(previous.y,clamp(cy,-720,T13.top+T13.rows*T13.tile-h+120),Math.abs(p.vy)+12);
 s.t20Camera={x:s.cam,y:s.camY};
};
const t20StepBase=step;
step=function(v){const s=state;const out=t20StepBase(v);if(state===s&&s&&mode==='playing'&&!s.t11Transition){t20TouchLoot(s);t20TouchCart(s);}return out;};

// Native Grey Brick sheet, original 16x16 pieces. Door position is unchanged.
// Decorative architecture never inserts invisible physical collision surfaces.
const t20CastleBase=drawCastleAt;
drawCastleAt=function(x,large=false,won=false){
 const im=r06Images.castleBrick;if(!large||!im)return t20CastleBase(x,large,won);if(x>W+40||x+150<-40)return;
 ctx.save();ctx.imageSmoothingEnabled=false;
 const tile=(xx,yy,variant=0)=>ctx.drawImage(im,18+(variant%3)*18,18,16,16,Math.round(x+xx),yy,16,16);
 const block=(xx,yy,ww,hh)=>{ctx.save();ctx.beginPath();ctx.rect(Math.round(x+xx),yy,ww,hh);ctx.clip();for(let j=0;j<hh;j+=16)for(let i=0;i<ww;i+=16)tile(xx+i,yy+j,(i/16+j/16)%3);ctx.restore();};
 const rim=(xx,y,w)=>{for(let a=0;a<w;a+=24)block(xx+a,y,12,12);block(xx,y+12,w,5);};
 block(-24,152,168,56);block(-24,104,32,104);block(16,80,48,128);block(104,112,40,96);
 rim(-28,92,40);rim(12,68,56);rim(100,100,48);
 ctx.fillStyle='#18222b88';for(const [xx,yy,ww,hh] of [[2,108,6,100],[58,84,6,124],[136,116,8,92],[-24,165,168,3]])ctx.fillRect(x+xx,yy,ww,hh);
 // Recessed arrow-slit windows and a single entrance aligned with doorX.
 for(const [xx,yy] of [[-13,130],[31,101],[47,101],[115,137],[80,176]]){
  ctx.fillStyle='#232728';ctx.fillRect(x+xx-2,yy-2,9,20);ctx.fillStyle='#b5a486';ctx.fillRect(x+xx-2,yy+17,9,2);ctx.fillStyle='#171c22';ctx.fillRect(x+xx,yy,5,17);
 }
 ctx.fillStyle='#25292b';ctx.fillRect(x+25,170,30,38);ctx.fillRect(x+29,166,22,8);ctx.fillStyle='#11191d';ctx.fillRect(x+28,174,24,34);ctx.fillRect(x+31,170,18,8);
 // Use the existing original wood atlas for the lintel and courtyard trim.
 for(const xx of [8,64,80,96])sheet(ctx,'wood',[3,3,18,6],x+xx,150,16,5);
 sheet(ctx,'wood',[3,3,18,6],x+26,169,28,5);
 const torch=r06Images.torchPlaced||r06Images.torch;
 for(const xx of [18,60,98]){const y=184,glow=ctx.createRadialGradient(x+xx,y,1,x+xx,y,17);glow.addColorStop(0,'#f8b54655');glow.addColorStop(1,'#f8b54600');ctx.fillStyle=glow;ctx.fillRect(x+xx-17,y-17,34,34);if(torch)ctx.drawImage(torch,x+xx-5,y-6,10,10);}
 if(won)sprite('castle_flag',x+32,42);ctx.restore();
};

// Exterior layout only. In-game health/mana bars and collision space are untouched.
const t20Style=document.createElement('style');t20Style.textContent=`
body.t15-terra .app{max-width:1250px;margin:0 auto;padding:24px 24px 18px}
body.t15-terra header{margin:0 0 20px;padding:0 0 18px;border-bottom:1px solid #53697845}
body.t15-terra .layout{grid-template-columns:minmax(0,1fr) 286px;gap:22px;align-items:start}
body.t15-terra .panel{padding:22px 20px;background:#14232cf0;border:1px solid #49627288;border-radius:9px;box-shadow:none}
body.t15-terra .panel h2{font-size:23px;line-height:1.5;margin:9px 0 10px;letter-spacing:.01em}
body.t15-terra .panel>.intro{font-size:12px;line-height:1.9;margin:0 0 18px;color:#b9c9cc}
body.t15-terra .panel .kicker{font-size:10px;letter-spacing:.18em;color:#d8bd8d}
body.t15-terra .status-card{padding:14px;margin:16px 0;background:#0c192378;border:1px solid #425d6d88;border-radius:6px}
body.t15-terra .status-bottom{font-size:10px}
body.t15-terra #bestLabel{display:none!important}
body.t15-terra .status-card #relayMessage{margin:12px 0 0;padding:10px 0 0;border:0;border-top:1px solid #455e6755;background:transparent;min-height:0;font-size:12px;color:#e4dbc3;max-width:none}
body.t15-terra .status-card #heroStatus{margin:6px 0 0;font-size:11px;color:#a8bac3;line-height:1.6}
body.t15-terra .status-card #gamepadStatus{display:block!important;font-size:10px;line-height:1.6;margin:9px 0 0;color:#86a6a4}
body.t15-terra .panel .buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0}
body.t15-terra .panel .buttons button{min-height:38px;font-size:12px;padding:8px 6px}
body.t15-terra .panel #charactersButton{grid-column:1/-1;margin:0!important;background:#284353;color:#e5e9df}
body.t15-terra .tagline{margin:13px 3px 0;line-height:1.8;font-size:10px;color:#a0b2ba}
body.t15-terra #t15Help,body.t15-terra #t20Audio{margin:14px 0 0;padding:12px 0 0;border:0;border-top:1px solid #49637266;border-radius:0;background:none;font-size:11px}
body.t15-terra #t15Help summary,body.t15-terra #t20Audio summary{cursor:pointer;color:#d6ddce;font-weight:500;line-height:1.8}
body.t15-terra #t15Help table{font-size:10px}body.t15-terra #t15Help p{color:#aebfc5;line-height:1.9}
body.t15-terra #t20Audio .audio-panel{margin:12px 0 0;padding:0;border:0;background:none}
body.t15-terra #t20Audio .audio-head{display:none}body.t15-terra .source-note{margin-top:18px;color:#9cabb3;font-size:11px}
body.t15-terra .hero-picker small{line-height:1.6;letter-spacing:0;font-weight:400;background:transparent!important;border:none!important;padding:0!important}
body.t15-terra .overlay.choosing #overlayText{min-height:0;margin:12px auto 16px;color:#b9c9cf}
body.t15-terra .overlay.choosing .overlay-box{border-width:1px;border-radius:6px;padding:24px 16px!important;background:#0c1824ed}
body.t15-terra .overlay.choosing .hero-picker button{min-height:136px}
body.t15-terra .overlay-hint{opacity:.8;font-size:10px;letter-spacing:.04em}
@media(max-width:980px){body.t15-terra .app{padding:18px 16px}body.t15-terra .layout{grid-template-columns:minmax(0,1fr) 258px;gap:16px}body.t15-terra .panel{padding:18px 15px}body.t15-terra .panel h2{font-size:21px}}
@media(max-width:760px){body.t15-terra .app{padding:14px 12px}body.t15-terra .layout{grid-template-columns:1fr;gap:16px}body.t15-terra .panel{padding:20px}body.t15-terra .overlay.choosing .overlay-box{padding:12px 7px!important}body.t15-terra .overlay.choosing .hero-picker button{min-height:82px}body.t15-terra .hero-picker strong{font-size:10px}body.t15-terra .hero-picker small{font-size:8px}body.t15-terra .tagline{flex-wrap:wrap}}
`;document.head.append(t20Style);
const t20Status=document.querySelector('.status-card'),t20Buttons=document.querySelector('.panel .buttons');
for(const id of ['relayMessage','heroStatus','gamepadStatus'])if($(id))t20Status.append($(id));
t20Buttons.prepend($('charactersButton'));t20Buttons.after(t15Help);
const t20Audio=document.createElement('details');t20Audio.id='t20Audio';t20Audio.innerHTML='<summary>声音设置</summary>';const t20AudioPanel=document.querySelector('.audio-panel');t20AudioPanel.before(t20Audio);t20Audio.append(t20AudioPanel);t15Help.after(t20Audio);
t15Help.innerHTML=`<summary>操作指南 · 手柄 / 键鼠</summary><table><thead><tr><th>动作</th><th>手柄</th><th>键鼠</th></tr></thead><tbody><tr><td>移动</td><td>左摇杆 / 十字键</td><td>WASD / 方向键</td></tr><tr><td>瞄准</td><td>自动索敌；无目标随方向</td><td>鼠标</td></tr><tr><td>跳跃 / 跳车</td><td>A</td><td>空格 / K / Z</td></tr><tr><td>攻击 / 工具</td><td>B / X / RT</td><td>左键 / J</td></tr><tr><td>切换工具</td><td>LB / RB</td><td>1–6 / 滚轮 / [ ]</td></tr><tr><td>切换武器</td><td>按下右摇杆</td><td>Q</td></tr><tr><td>交互 / 管道</td><td>Y / 方向↓</td><td>E / L / 右键 / ↓</td></tr><tr><td>上下已得坐骑</td><td>LT</td><td>F</td></tr><tr><td>治疗</td><td>按下左摇杆</td><td>H</td></tr><tr><td>暂停</td><td>Start</td><td>P / Esc</td></tr></tbody></table><p>宝箱接触后打开并领取。矿车接触上车，跳跃下车；跳下后车辆停在原处，离开再碰到可以重新上车。左方向控制矿车运行方向，松开继续巡航，下方向刹车。</p><p>键鼠由鼠标瞄准，手柄自动选择敌人；按实际输入切换。右摇杆偏转不影响武器方向。镐与斧按左方向使用，鼠标可精确选块。子弹、箭无限，武器自带追踪行为保留。</p><p>补给箱先取云朵瓶、饰品与弓，最后拿最右边的可疑眼球。战斗中不能返程，胜利后从原管道返回。套装拾取后自动换装并骑 UFO；UFO 向下可穿过木平台。</p>`;
function t20CleanUI(){if(!isTrio())return;
 $('bestLabel').textContent='';document.querySelector('header .offline').textContent='TERRARIA · 1-3';t10Build.textContent='';
 const card=document.querySelector('[data-hero="sandboxTrio"] small');if(card)card.textContent='关卡 1-3';
 document.querySelector('.brand small').textContent='MARIO MIX / WORLD 1-3';
 const k=document.querySelector('.panel .kicker');if(k)k.textContent='WORLD 1-3';
 const h=document.querySelector('.panel h2');if(h)h.innerHTML='熟悉的路。<br>不同的冒险。';
 const intro=document.querySelector('.panel>.intro');if(intro&&intro.id!=='heroHelp')intro.textContent='穿过森林与树冠，沿着管道深入地下。准备装备，迎战克苏鲁之眼。';
 const tag=document.querySelector('.tagline span');if(tag)tag.textContent='森林之上，冒险继续。';
 if(mode==='menu'){$('overlayText').textContent='选择旅伴，开始下一段冒险。';$('overlayLabel').textContent='MARIO MIX / CHAPTER 03';}
 if($('r06Mount'))$('r06Mount').title='F / LT：上下已获得的坐骑；接触矿车也可上车。';
 if($('gamepadStatus'))$('gamepadStatus').textContent=t17Input.connected?(t20Device==='gamepad'?'手柄操作 · 自动索敌':'键鼠操作 · 鼠标瞄准'):'键鼠操作 · 可连接手柄';
 $('stateLabel').textContent=({menu:'选择角色',playing:'冒险中',flag:'抵达终点',paused:'已暂停',win:'关卡完成',respawn:'重新出发',gameover:'冒险结束',inventory:'查看宝箱'})[mode]||'冒险中';
 if(mode==='menu'){$('heroStatus').textContent='泰拉瑞亚 · 关卡 1-3';$('relayMessage').textContent='准备出发';}
 else if(state){$('relayMessage').textContent=state.r05Arena?(state.phase==='battle'?'克苏鲁之眼':state.phase==='cleared'?'战斗胜利 · 探索与返程':state.p.y>650?'地下探索':'战前准备'):'WORLD 1-3 · 泰拉瑞亚';}
}
const t20UIBase=r06UpdateUI;r06UpdateUI=function(){t20UIBase();t20CleanUI();};
const t20SyncBase=t15Sync;t15Sync=function(s){t20SyncBase(s);t20CleanUI();};
r04PauseHelp=function(){return '手柄：左方向移动，A 跳跃，B / X 攻击，LB / RB 切工具。键鼠：WASD 移动，鼠标瞄准，空格跳跃，左键攻击。详细操作在游戏外的操作指南中。';};
const t20RenderBase=render;render=function(){const result=t20RenderBase();t20CleanUI();return result;};
Promise.all([readyPromise,...r06AssetJobs,...t20AssetJobs]).then(()=>{if(isTrio()){render();t20CleanUI();}});
t20CleanUI();
const t20Diagnostics={build:T20_BUILD,ready:Promise.all(t20AssetJobs),device:()=>t20Device,aim:(v={},tool=false)=>t17AimPoint(state,v,tool),owner:t20Own,geometry:t14CanvasRect,castle:{tile:'Tiles_38.png',doorOffset:40},loot:()=>t20TouchLoot(state),cart:()=>t20TouchCart(state),eyeStep:(e,p)=>r06EyeStep(e,p),camera:()=>t11Camera(state),supply:()=>t12SuppliesStep(state)};

const T21_NATIVE={"boomstick":"@@E04:uri:a181@@","iceBlade":"@@E04:uri:a182@@"};

/* Unified placement and physical inventory transactions. Installed after R20.
   All gameplay time is the existing 60Hz update, not a second timer. */
const T21_LOG=[];
function t21Event(type,data={}){T21_LOG.push({type,tick:state?.ticks||0,...data});if(T21_LOG.length>1200)T21_LOG.shift();}
const T21_ITEMS={
 starfury:{name:'星怒',effect:'挥剑并从上方召来一颗落星',icon:'starfury',weapon:true},
 stormbow:{name:'代达罗斯风暴弓',effect:'从上方落箭；本关箭矢无限',icon:'stormbow',weapon:true},
 terraBlade:{name:'泰拉刃',effect:'近战挥砍并发出宽幅绿色剑气',icon:'terraBlade',weapon:true},
 iceBlade:{name:'冰雪刃',effect:'挥剑发射直行冰弹，不自动追踪',icon:'iceBlade',weapon:true},
 boomstick:{name:'三发猎枪',effect:'每次射出散弹；本关子弹无限',icon:'boomstick',weapon:true},
 zenith:{name:'天顶剑',effect:'多把剑沿旋转轨迹攻击目标区域',icon:'zenith',weapon:true},
 sdmg:{name:'太空海豚机枪',effect:'连射叶绿弹；子弹自身追踪',icon:'sdmg',weapon:true},
 lastPrism:{name:'终极棱镜',effect:'持续光束，消耗魔力',icon:'lastPrism',weapon:true},
 terraprisma:{name:'泰拉棱镜与万花筒',effect:'召唤剑自主攻击，鞭子标记目标',icon:'terraprisma',weapon:true},
 cloudBottle:{name:'云朵瓶',effect:'在空中再跳一次',icon:'cloudBottle',accessory:true},
 band:{name:'再生手环',effect:'持续恢复生命；同类不叠加',icon:'hudRegen',accessory:true,flag:'regen'},
 boots:{name:'赫尔墨斯靴',effect:'持续奔跑后加速',icon:'hudBoots',accessory:true,flag:'boots'},
 flurry:{name:'疾风雪靴',effect:'持续奔跑后加速，与赫尔墨斯靴不叠加',icon:'flurry',accessory:true,flag:'boots'},
 blizzard:{name:'暴雪瓶',effect:'增强空中二段跳，带雪花轨迹',icon:'blizzard',accessory:true,flag:'blizzard'},
 anklet:{name:'疾风脚镯',effect:'步行与奔跑速度提高 10%',icon:'anklet',accessory:true,flag:'anklet'},
 claws:{name:'猛爪手套',effect:'近战挥动速度提高 12%',icon:'claws',accessory:true,flag:'claws'},
 sharkNecklace:{name:'鲨牙项链',effect:'攻击最多忽略 5 点敌人防御',icon:'sharkNecklace',accessory:true,flag:'shark'},
 shackle:{name:'脚镣',effect:'防御增加 1',icon:'shackle',accessory:true,flag:'shackle'},
 mirror:{name:'魔镜',effect:'战后使用返程键回到隐藏场入口',icon:'mirror',accessory:true,flag:'mirror'},
 healing:{name:'治疗药水',effect:'治疗键恢复 100 生命；有冷却',icon:'healing'},
 manaPotion:{name:'魔力药水',effect:'补充魔力药水库存',icon:'manaPotion'},
 torch:{name:'火把',effect:'选择火把格放置，照亮洞穴',icon:'torchPlaced'},
 wood:{name:'木材',effect:'建造木平台与篝火',icon:'wood'},
 silverCoin:{name:'银币',effect:'收藏与计分',icon:'silverCoin'},
 heart:{name:'生命水晶',effect:'生命上限增加 20，最多 400',icon:'heart'},
 lucy:{name:'露西斧',effect:'强化砍伐与近战的斧头',icon:'lucy'},
 copperAxe:{name:'铜斧',effect:'基础砍伐工具，可重新装备',icon:'axe'}
};
let t21DropSerial=0;
function t21Ensure(s){if(!s)return;s.t21Notices??=[];s.t21OwnedAccessories??=[];s.t21ExtraShots??=[];s.t21Hostile??=[];s.t13Drops??=[];s.t13Owned??=['starfury'];s.t13Accessories??={};s.t13Inventory??={};}
function t21Toast(s,kind,count=1){const d=T21_ITEMS[kind];if(!d)return;t21Ensure(s);s.t21Notices.push({name:d.name+(count>1?' ×'+count:''),effect:d.effect,icon:d.icon,age:0});s.t21Notices=s.t21Notices.slice(-4);t21Event('pickup-description',{kind,name:d.name,effect:d.effect});}
function t21MouseTarget(s){if(t20Device!=='keyboard'||t17Input.source!=='mouse'||!t17Input.lastMouse)return null;t13SamplePointer({clientX:t17Input.lastMouse[0],clientY:t17Input.lastMouse[1]});return t13Pointer.active?{x:t13Pointer.x,y:t13Pointer.y,pointer:true}:null;}
const t21OldRaw=t14RawTarget;
t14RawTarget=function(s,v={}){
 const exact=t21MouseTarget(s);if(exact)return exact;
 const p=s.p,dx=Math.abs(v.x||0)>.25?Math.sign(v.x):p.facing,dy=Math.abs(v.y||0)>.55?Math.sign(v.y):0;
 if([1,4,5].includes(s.tool)){
  const base=s.r05Arena?T13.top:0,feet=p.y+p.h;
  // The nearest wholly free column in front of the feet, not a point from the torso.
  const col=Math.floor((p.x+p.w/2)/16)+dx;
  const support=solids().find(q=>q.id===p.support),footY=p.grounded&&support? support.y:feet;
  let row=Math.floor((footY-base+.8)/16);
  if(s.tool!==1)row--; // standing furniture rests ON the support; platforms extend its top.
  if(dy<0)row--;else if(dy>0&&s.tool===1)row++;
  return{x:col*16+8,y:base+row*16+8,c:col,r:row,dx,dy,pointer:false,footPlacement:true};
 }
 // Ignore stale mouse/stick target when the controller owns input.
 return{x:p.x+p.w/2+(dy&&!v.x?0:dx*(p.w/2+8)),y:dy>0?p.y+p.h+8:dy<0?p.y-8:p.y+p.h*.52,dx:dy&&!v.x?0:dx,dy,pointer:false};
};
t13ToolTarget=function(s,v={}){const raw=t14RawTarget(s,v);if(s.tool===3)return t14ChooseMine(s,raw);if(s.tool===4){if(raw.footPlacement){const t={...raw,kind:'torch'},reason=t14TorchSpot(s,t);return{...t,valid:!reason,reason};}return t14ChooseTorch(s,raw);}return raw;};
const t21OldPlace=t13Place;
t13Place=function(s,t,type){const ok=t21OldPlace(s,t,type);t21Event('placement',{type,ok:!!ok,target:{x:t.x,y:t.y},feet:s.p.y+s.p.h,device:t20Device});return ok;};

function t21Drop(s,kind,count,x,y,extra={}){t21Ensure(s);const size=s.r05Arena?16:12;const d={id:'drop-'+(++t21DropSerial),kind,count:Math.max(1,count||1),x,y,w:size,h:size,vx:0,vy:-2.8,age:0,grounded:false,pickDelay:28,t21:true,...extra};s.t13Drops.push(d);if(s.t13World)s.t13World.drops=s.t13Drops;return d;}
function t21SpillOld(s,kind){if(!kind||!T21_ITEMS[kind]?.weapon)return;const p=s.p;const d=t21Drop(s,kind,1,p.x+p.w/2-6,p.y+p.h-17,{vx:-p.facing*1.3,vy:-2.8,pickDelay:60,mustLeave:true,oldWeapon:true,lockX:p.x+p.w/2,lockY:p.y+p.h});t21Event('old-weapon-dropped',{kind,id:d.id});return d;}
function t21EquipWeapon(s,kind,spill=true){t21Ensure(s);const old=r06Weapon(s);if(old===kind)return false;
 if(spill)t21SpillOld(s,old);
 s.t13Owned=s.t13Owned.filter(k=>k!==old);if(!s.t13Owned.includes(kind))s.t13Owned.push(kind);
 s.t13Weapon=kind;s.t13WeaponOverride=!!s.kit;s.tool=0;s.p.attack=s.p.cooldown=0;s.minions=[];s.prismCharge=0;s.whipAge=99;
 r06SyncKitTools();t21Event('weapon-exchange',{old,new:kind});return true;
}
function t21Collect(s,kind,count){const item=T21_ITEMS[kind];if(!item){t13Collect(s,kind,count);return;}
 t21Ensure(s);if(item.weapon){if(r06Weapon(s)===kind)return false;t21EquipWeapon(s,kind);}
 else if(item.accessory){if(kind==='cloudBottle')r06CollectCloud(s);else{s.t13Accessories[item.flag]=true;if(kind==='blizzard'){s.cloudJump=true;s.p.cloudAvailable=true;}}if(!s.t21OwnedAccessories.includes(kind))s.t21OwnedAccessories.push(kind);}
 else if(kind==='healing')s.healPotions=(s.healPotions||0)+count;
 else if(kind==='manaPotion')s.manaPotions=(s.manaPotions||0)+count;
 else if(kind==='heart'){s.maxHp=Math.min(400,s.maxHp+20*count);s.hp=Math.min(s.maxHp,s.hp+20*count);}
 else if(kind==='lucy'||kind==='copperAxe'){const was=s.t21Axe||'copperAxe';if(was===kind)return false;t21Drop(s,was,1,s.p.x,s.p.y,{pickDelay:60,mustLeave:true});s.t21Axe=kind;}
 else if(kind==='silverCoin'){s.score+=count*10;s.t13Inventory.silverCoin=(s.t13Inventory.silverCoin||0)+count;}
 else if(kind==='wood')s.wood+=count;
 else s.t13Inventory[kind]=(s.t13Inventory[kind]||0)+count;
 terraSound('pickup',{volume:.5});t21Toast(s,kind,count);r05Persist();return true;
}
// Physical drops are durable until picked up. Exchanged equipment requires leaving
// its contact area before it may be collected again, avoiding involuntary ping-pong.
t13DropStep=function(s){t21Ensure(s);const p=s.p;
 for(const d of [...s.t13Drops]){d.age=(d.age||0)+1;d.w??=10;d.h??=10;
  const close={x:d.x-18,y:d.y-18,w:d.w+36,h:d.h+36};if(d.mustLeave&&(Number.isFinite(d.lockX)?Math.hypot(p.x+p.w/2-d.lockX,p.y+p.h-d.lockY)>48*t10Scale(s):!near(p,close)))d.mustLeave=false;
  const can=d.age>(d.pickDelay??18)&&!d.mustLeave;
  const dx=p.x+p.w/2-d.x-d.w/2,dy=p.y+p.h*.6-d.y-d.h/2,dist=Math.hypot(dx,dy);
  const previous={x:d.x,y:d.y,w:d.w,h:d.h};
  if(can&&dist<34*t10Scale(s)&&t14Visible(s,{x:d.x+d.w/2,y:d.y+d.h/2})){d.vx=approach(d.vx,dx/(dist||1)*3.5,.45);d.vy=approach(d.vy,dy/(dist||1)*3.5,.45);}
  else{d.vx*=.94;d.vy=Math.min(6,(d.vy||0)+.22);}
  d.x+=d.vx;d.y+=d.vy;
  const bounds={x:Math.min(previous.x,d.x)-1,y:Math.min(previous.y,d.y)-1,w:d.w+Math.abs(d.vx)+2,h:d.h+Math.abs(d.vy)+2};
  for(const q of t13PhysicalSurfaces(s,bounds)){
   if(d.x+d.w>q.x&&d.x<q.x+q.w&&previous.y+d.h<=q.y+.5&&d.y+d.h>=q.y&&d.vy>=0){d.y=q.y-d.h;d.vy=0;d.vx*=.65;d.grounded=true;}
   else if(q.solid&&near(d,q)&&previous.y<q.y+q.h&&previous.y+d.h>q.y){d.x=previous.x;d.vx=0;}
  }
  if(can&&near(p,d)){if(T21_ITEMS[d.kind]){if(t21Collect(s,d.kind,d.count)!==false)d.done=true;else{d.mustLeave=true;d.lockX=p.x+p.w/2;d.lockY=p.y+p.h;d.pickDelay=d.age+35;}}else{d.done=true;t13Collect(s,d.kind,d.count);}}
  if(d.y>(s.r05Arena?T13.top+T13.rows*16+32:280)){
   if(T21_ITEMS[d.kind]?.weapon||T21_ITEMS[d.kind]?.accessory){const safe=s.r05Arena?{x:156,y:440}:{x:p.x,y:Math.min(140,p.y-20)};Object.assign(d,safe,{vx:0,vy:0,mustLeave:false,pickDelay:d.age+30});}else d.done=true;
  }
 }
 s.t13Drops=s.t13Drops.filter(d=>!d.done);if(s.t13World)s.t13World.drops=s.t13Drops;
};
// Spawn once, then the empty opened chest remains visibly empty. Contents are not
// silently deposited in inventory, even when entering on top of a closed chest.
function t21Open(s,c){if(!c||c.removed||c.t21Spilled||c.empty||s.t11Transition)return false;
 const items=c.items?.length?c.items:[{kind:'healing',count:2},{kind:'torch',count:20}];c.opened=true;c.empty=true;c.t21Spilled=true;c.items=[];
 const n=items.length;items.forEach((it,i)=>{const spread=(i-(n-1)/2)*.9;t21Drop(s,it.kind,it.count,c.x+8+Math.sign(spread)*6,c.y-4,{vx:spread,vy:-3.4-i%2*.6,pickDelay:42,chestId:c.id});});
 terraSound('door');t21Event('chest-spilled',{id:c.id,items:items.map(x=>({...x}))});r05Persist();return true;
}
t20TouchLoot=function(s){if(s.t11Transition)return;if(s.t11Chest&&!s.t11Chest.opened&&near(s.p,{x:s.t11Chest.x-5,y:s.t11Chest.y-5,w:42,h:40}))t12Open();for(const c of s.t13World?.chests||[])if(near(s.p,{x:c.x-4,y:c.y-4,w:40,h:36}))t21Open(s,c);};
t13OpenNearby=function(){return !!state&&mode==='playing'&&t21Open(state,t13ClosestChest(state));};
t13TakeChest=function(){const c=state?.t13World?.chests.find(x=>x.id===t13OpenChestId);return t21Open(state,c);};
// The starter bow also uses the same exchange path, so the initial Starfury is not lost.
const t21SupplyBase=t12SuppliesStep;
t12SuppliesStep=function(s){const was=r06Weapon(s),before=s.t12Supplies?.find(x=>x.kind==='stormbow')?.done;t21SupplyBase(s);if(!before&&s.t12Supplies?.find(x=>x.kind==='stormbow')?.done&&r06Weapon(s)!==was){t21SpillOld(s,was);s.t13Owned=s.t13Owned.filter(x=>x!==was);t21Toast(s,'stormbow');r05Persist();}};
const t21KitBase=r07EquipDrop;
r07EquipDrop=function(s,d){const was=r06Weapon(s),oldKit=s.kit;const ok=t21KitBase(s,d);if(ok){if(!oldKit||s.t13WeaponOverride)t21SpillOld(s,was);const current=r06Weapon(s);s.t13Owned=s.t13Owned.filter(x=>x!==was);if(!s.t13Owned.includes(current))s.t13Owned.push(current);t21Event('kit-exchange',{old:oldKit,new:s.kit});}return ok;};
const t21CopyBase=r06CopyLoadout;r06CopyLoadout=function(a,b){t21CopyBase(a,b);for(const k of ['t21OwnedAccessories','t21Axe'])if(a[k]!==undefined)b[k]=structuredClone(a[k]);};
const t21GenBase=t13GenerateWorld;
t13GenerateWorld=function(){const w=t21GenBase();const pools=[['cloudBottle','boots','band','mirror'],['boots','shackle','sharkNecklace'],['band','cloudBottle','mirror'],['anklet','claws','boomstick'],['iceBlade','flurry','blizzard'],['band','boots','cloudBottle'],['mirror','band','boots'],['cloudBottle','band','boots'],['band','cloudBottle','mirror'],['boomstick','band','mirror']];
 w.chests.forEach((c,i)=>{const bid=t17DeepBiome(Math.floor(c.x/16),Math.floor((c.y-T13.top)/16));c.t21Biome=bid;c.items=[{kind:pools[bid][i%pools[bid].length],count:1},{kind:'healing',count:2+i%3},{kind:i%3===0?'manaPotion':'torch',count:i%3===0?2:20+i%4*5},{kind:i%2?'silverCoin':'wood',count:i%2?12+i:25}];c.empty=false;c.opened=false;c.t21Spilled=false;});return w;};
const t21DropDrawBase=r06DrawProjectiles;
r06DrawProjectiles=function(s,c){const all=s.t13Drops;s.t13Drops=all.filter(d=>!d.t21);try{t21DropDrawBase(s,c);}finally{s.t13Drops=all;}
 for(const d of all){if(!d.t21)continue;const item=T21_ITEMS[d.kind];if(!item)continue;const im=r06Images[item.icon]||photos[item.icon];if(!im){ctx.save();ctx.fillStyle='#172b3de8';ctx.fillRect(d.x-c-5,d.y-3,26,18);ctx.strokeStyle='#ad9b70';ctx.strokeRect(d.x-c-5,d.y-3,26,18);ctx.fillStyle='#eee2bc';ctx.font='6px sans-serif';ctx.textAlign='center';ctx.fillText(item.name,d.x-c+8,d.y+8,25);ctx.restore();continue;}const size=s.r05Arena?22:14,ratio=Math.min(size/im.width,size/im.height);ctx.save();ctx.globalAlpha=d.mustLeave?.62:1;ctx.imageSmoothingEnabled=false;ctx.drawImage(im,d.x+d.w/2-im.width*ratio/2-c,d.y+d.h-im.height*ratio,im.width*ratio,im.height*ratio);ctx.restore();}
};
const t21HudBase=t15Model;t15Model=function(s){const m=t21HudBase(s);for(const k of ['anklet','claws','blizzard'])if(s.t13Accessories?.[k])m.gear.push({key:T21_ITEMS[k].icon,name:T21_ITEMS[k].name+' · '+T21_ITEMS[k].effect});if(T21_ITEMS[r06Weapon(s)])m.names[0]=T21_ITEMS[r06Weapon(s)].name;return m;};
const t21ToolsBase=r06SyncKitTools;r06SyncKitTools=function(){t21ToolsBase();if(state){const d=T21_ITEMS[r06Weapon(state)];if(d)tools[0]=d.name;if(state.t21Axe==='lucy')tools[2]='露西斧';}};
function t21DrawNotices(s){if(!s.t21Notices?.length)return;const n=s.t21Notices[0],w=s.r05Arena?R06_VIEW.w:W,h=s.r05Arena?R06_VIEW.h:H,sc=s.r05Arena?1:0.64;ctx.save();ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);const width=Math.min(w-16,360*sc),xx=8,yy=h-48*sc-10;ctx.globalAlpha=Math.min(1,n.age/8,(210-n.age)/20);ctx.fillStyle='#0b1420dd';ctx.fillRect(xx,yy,width,43*sc);ctx.fillStyle='#ead59b';ctx.font=`bold ${13*sc}px sans-serif`;ctx.fillText(n.name,xx+9*sc,yy+16*sc);ctx.fillStyle='#d0dce5';ctx.font=`${10*sc}px sans-serif`;ctx.fillText(n.effect,xx+9*sc,yy+32*sc,width-18*sc);ctx.restore();}
const t21StepInventory=step;step=function(v){const s=state;t21Ensure(s);if(s?.t21Notices?.length){s.t21Notices[0].age++;if(s.t21Notices[0].age>210)s.t21Notices.shift();}const r=t21StepInventory(v);return r;};
const t21RenderInventory=render;render=function(){const r=t21RenderInventory();if(isTrio()&&state&&mode==='playing')t21DrawNotices(state);return r;};

// Backtracking with a weapon lets the player recover gear behind the camera.
const t21BacktrackBase=r04MainStep;r04MainStep=function(v){const s=state;if(s&&!s.r05Arena&&mode==='playing'&&v.x<-.1&&s.p.x-s.cam<75)s.cam=Math.max(0,s.p.x-108);return t21BacktrackBase(v);};

/* Configurable actions; state-machine keys remain canonical internally. */
const T21_ACTIONS={
 left:{name:'向左',code:'KeyA',keys:['KeyA','ArrowLeft'],pad:[14]},right:{name:'向右',code:'KeyD',keys:['KeyD','ArrowRight'],pad:[15]},
 up:{name:'向上',code:'KeyW',keys:['KeyW','ArrowUp'],pad:[12]},down:{name:'向下 / 下穿',code:'KeyS',keys:['KeyS','ArrowDown'],pad:[13]},
 jump:{name:'跳跃 / 跳车',code:'Space',keys:['Space','KeyK','KeyZ'],pad:[0]},attack:{name:'攻击 / 使用',code:'KeyJ',keys:['KeyJ','KeyX','ShiftLeft','ShiftRight'],pad:[1,2,7]},
 toolPrev:{name:'上一个工具',code:'BracketLeft',keys:['BracketLeft'],pad:[4]},toolNext:{name:'下一个工具',code:'BracketRight',keys:['BracketRight'],pad:[5]},
 weapon:{name:'切换已有武器',code:'KeyQ',keys:['KeyQ'],pad:[3]},mount:{name:'上下坐骑',code:'KeyF',keys:['KeyF'],pad:[11]},
 interact:{name:'交互 / 管道',code:'KeyE',keys:['KeyE','KeyL'],pad:[6]},heal:{name:'治疗',code:'KeyH',keys:['KeyH'],pad:[10]},
 recall:{name:'魔镜返程',code:'KeyB',keys:['KeyB'],pad:[8]},pause:{name:'暂停',code:'KeyP',keys:['KeyP','Escape'],pad:[9]},
 torch:{name:'快速放火把',code:'KeyG',keys:['KeyG'],pad:[]},mountCycle:{name:'切换坐骑种类',code:'KeyV',keys:['KeyV'],pad:[]}
};
const T21_PAD_CANON={0:'jump',1:'attack',2:'attack',7:'attack',3:'interact',4:'toolPrev',5:'toolNext',6:'mount',8:'recall',9:'pause',10:'heal',11:'weapon',12:'up',13:'down',14:'left',15:'right'};
const T21_PAD_NAMES=['A / ×','B / ○','X / □','Y / △','LB / L1','RB / R1','LT / L2','RT / R2','Back / View','Start / Options','L3','R3','↑','↓','←','→'];
const t21DefaultBinds=()=>Object.fromEntries(Object.entries(T21_ACTIONS).map(([k,v])=>[k,{keys:[...v.keys],pad:[...v.pad]}]));
let t21Binds=t21DefaultBinds(),t21Capture=null,t21CapturePrev=[],t21RemapWasPlaying=false,t21Storage='未保存';
const t21KeyHeld=new Map();
function t21LoadBinds(data){if(!data||data.version!==1||!data.actions)throw Error('不是有效的按键配置');const next=t21DefaultBinds();
 for(const [k,v]of Object.entries(data.actions)){if(!Object.hasOwn(T21_ACTIONS,k))continue;if(!Array.isArray(v.keys)||!Array.isArray(v.pad)||v.keys.some(x=>!/^([A-Za-z][A-Za-z0-9]*|Space)$/.test(x))||v.pad.some(x=>!Number.isInteger(x)||x<0||x>31))throw Error('按键数据无效');next[k]={keys:[...new Set(v.keys)].slice(0,6),pad:[...new Set(v.pad)].slice(0,4)};}
 for(const source of ['keys','pad']){const seen=new Set();for(const [k,v]of Object.entries(next))for(const x of v[source]){if(seen.has(x))throw Error('同一按键绑定了多个动作');seen.add(x);}}
 if(!next.jump.keys.length||!next.attack.keys.length||!next.jump.pad.length||!next.attack.pad.length)throw Error('跳跃和攻击不能留空');t21Binds=next;
 if(Number.isFinite(data.deadzone))t17Input.deadzone=clamp(data.deadzone,.12,.4);return true;
}
try{const raw=localStorage.getItem('marioMix.controls.v1');if(raw)t21LoadBinds(JSON.parse(raw));t21Storage='本机自动保存';}catch{}
function t21Config(){return{version:1,actions:structuredClone(t21Binds),deadzone:t17Input.deadzone};}
function t21SaveBinds(){try{localStorage.setItem('marioMix.controls.v1',JSON.stringify(t21Config()));t21Storage='已保存到本机';}catch{t21Storage='浏览器禁止本地存储；可导出配置保存';}t21BindingStatus.textContent=t21Storage;}
function t21Bind(action,source,value){if(!Object.hasOwn(T21_ACTIONS,action)||!['keys','pad'].includes(source)||source==='pad'&&(!Number.isInteger(value)||value<0||value>31)||source==='keys'&&(!/^[A-Za-z][A-Za-z0-9]*$/.test(value)||['Tab','AltLeft','AltRight','ControlLeft','ControlRight','MetaLeft','MetaRight'].includes(value)))return false;const conflict=Object.entries(t21Binds).find(([k,v])=>k!==action&&v[source].includes(value));if(conflict){t21BindingStatus.textContent='已被“'+T21_ACTIONS[conflict[0]].name+'”使用，请先更改该动作。';return false;}t21Binds[action][source]=[value];t21SaveBinds();t21RefreshBindings();return true;}
function t21PhysicalIndices(i){const action=T21_PAD_CANON[i];return mode==='playing'&&action?t21Binds[action].pad:[i];}
t17Action=function(i){return t21PhysicalIndices(i).some(j=>!!t17Input.buttons[j]&&!t17Input.blocked.has(j));};
t17Edge=function(i){return t21PhysicalIndices(i).some(j=>!!t17Input.buttons[j]&&!t17Input.previous[j]&&!t17Input.blocked.has(j));};
function t21KeyLabel(k){return ({Space:'空格',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',BracketLeft:'[',BracketRight:']',Escape:'Esc',ShiftLeft:'左 Shift',ShiftRight:'右 Shift'}[k]||k.replace(/^Key|^Digit/,''));}
const t21BindingBox=document.createElement('dialog');t21BindingBox.id='t21Bindings';t21BindingBox.innerHTML='<header><h2>按键设置</h2><button type="button" id="t21BindClose">完成</button></header><p>点击动作旁的按钮，再按新的键。左摇杆移动和手柄自动索敌保持不变。菜单中的 A 确认、B 返回保持固定。</p><div class="t21BindScroll"><table><thead><tr><th>动作</th><th>键盘</th><th>手柄</th></tr></thead><tbody id="t21BindRows"></tbody></table></div><p id="t21BindingStatus" role="status"></p><footer><button type="button" id="t21BindReset">恢复默认</button><button type="button" id="t21BindExport">导出配置</button><button type="button" id="t21BindImport">导入配置</button><input type="file" accept="application/json,.json" id="t21BindFile" hidden></footer>';
document.body.append(t21BindingBox);const t21BindingStatus=$('t21BindingStatus');
const t21BindingButton=document.createElement('button');t21BindingButton.type='button';t21BindingButton.id='t21BindingButton';t21BindingButton.textContent='按键设置';t15Help.before(t21BindingButton);
function t21RefreshBindings(){const tbody=$('t21BindRows');tbody.replaceChildren();for(const [k,a]of Object.entries(T21_ACTIONS)){const row=document.createElement('tr'),name=document.createElement('td');name.textContent=a.name;row.append(name);for(const source of ['keys','pad']){const cell=document.createElement('td'),b=document.createElement('button');b.type='button';b.dataset.binding=k;b.dataset.source=source;b.textContent=t21Binds[k][source].map(v=>source==='keys'?t21KeyLabel(v):T21_PAD_NAMES[v]||'按钮 '+v).join(' / ')||'未绑定';b.onclick=()=>{t21Capture={action:k,source};t21CapturePrev=[];try{t21CapturePrev=Array.from(navigator.getGamepads?.()||[]).find(x=>x)?.buttons.map(t17Pressed)||[];}catch{}t21BindingStatus.textContent='请按下“'+a.name+'”的新'+(source==='keys'?'键盘键':'手柄按钮')+'，Esc 取消。';};cell.append(b);row.append(cell);}tbody.append(row);}}
function t21OpenBindings(){t21RemapWasPlaying=mode==='playing';if(t21RemapWasPlaying)togglePause();t17ResetActions();t21KeyHeld.clear();t21Capture=null;t21RefreshBindings();t21BindingStatus.textContent=t21Storage;t21BindingBox.showModal();}
function t21CloseBindings(){t21Capture=null;t21BindingBox.close();t17ResetActions();t21KeyHeld.clear();if(t21RemapWasPlaying&&mode==='paused')togglePause();t21RemapWasPlaying=false;canvas.focus({preventScroll:true});}
t21BindingButton.onclick=t21OpenBindings;$('t21BindClose').onclick=t21CloseBindings;t21BindingBox.addEventListener('cancel',e=>{e.preventDefault();if(t21Capture){t21Capture=null;t21BindingStatus.textContent='已取消';}else t21CloseBindings();});
$('t21BindReset').onclick=()=>{t21Binds=t21DefaultBinds();t21SaveBinds();t21RefreshBindings();};
$('t21BindExport').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(t21Config(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='MarioMix_按键配置.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
$('t21BindImport').onclick=()=>$('t21BindFile').click();$('t21BindFile').onchange=async e=>{try{const file=e.target.files[0];if(file.size>50000)throw Error('配置文件过大');t21LoadBinds(JSON.parse(await file.text()));t21SaveBinds();t21RefreshBindings();}catch(err){t21BindingStatus.textContent=err.message;}e.target.value='';};
const t21EarlyBase=t17Early.handle;
t17Early.handle=function(e){if(!isTrio()&&!(c23Campaign?.stage===14&&t21BindingBox.open))return t21EarlyBase(e);
 if(t21BindingBox.open){if(e.type==='keydown'&&t21Capture){if(e.code==='Escape'){t21Capture=null;t21BindingStatus.textContent='已取消';return true;}if(t21Capture.source==='keys'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const c=t21Capture;t21Capture=null;t21Bind(c.action,'keys',e.code);}return true;}if(['keydown','keyup'].includes(e.type)){if(e.code==='Tab')return false;if(e.type==='keydown'&&!e.repeat){if(e.code==='Escape')t21CloseBindings();else if(['Enter','Space'].includes(e.code))document.activeElement?.closest?.('#t21Bindings button')?.click();}return true;}return ['blur','focus','visibilitychange'].includes(e.type)?t21EarlyBase(e):false;}
 if(e.type==='keydown'||e.type==='keyup'){
  if(mode==='paused'&&e.type==='keydown'&&!e.repeat&&t21Binds.pause.keys.includes(e.code)){togglePause();t17ResetActions();return true;}if(!['playing','flag'].includes(mode)&&!t21KeyHeld.has(e.code))return t21EarlyBase(e);
  const action=Object.keys(t21Binds).find(k=>t21Binds[k].keys.includes(e.code)),mapped=t21KeyHeld.get(e.code)||(action&&T21_ACTIONS[action].code);
  if(mapped){if(e.type==='keydown')t21KeyHeld.set(e.code,mapped);else t21KeyHeld.delete(e.code);const proxy={type:e.type,code:mapped,key:e.key,target:e.target,repeat:e.repeat,ctrlKey:e.ctrlKey,metaKey:e.metaKey,altKey:e.altKey};return t21EarlyBase(proxy);}
  if(t17Keys.has(e.code)&&!/^Digit[1-6]$|^Key[CR]$|^Enter$/.test(e.code))return true;
 }
 return t21EarlyBase(e);
};
const t21PollBase=pollMixPad;pollMixPad=function(){if((!isTrio()&&c23Campaign?.stage!==14)||!t21BindingBox.open)return t21PollBase();let buttons=[];try{buttons=Array.from(navigator.getGamepads?.()||[]).find(p=>p)?.buttons.map(t17Pressed)||[];}catch{}
 if(t21Capture?.source==='pad'){const idx=buttons.findIndex((v,i)=>v&&!t21CapturePrev[i]);if(idx>=0){const c=t21Capture;t21Capture=null;t21Bind(c.action,'pad',idx);}}
 t21CapturePrev=buttons;};
const t21BindingsCSS=document.createElement('style');t21BindingsCSS.textContent=`#t21BindingButton{font:inherit;font-size:12px;border:1px solid #697b88;background:#203544;color:#e7dcbd;border-radius:5px;padding:9px 14px;cursor:pointer;margin-top:12px}#t21Bindings{width:min(640px,94vw);max-height:90vh;padding:22px;border:1px solid #698293;border-radius:10px;background:#162a38;color:#e9e5d6;font:13px/1.6 sans-serif}#t21Bindings::backdrop{background:#030a12bb}#t21Bindings header{display:flex;align-items:center;justify-content:space-between}#t21Bindings h2{margin:0;font-size:21px}#t21Bindings p{font-size:12px;color:#b8c9d2}#t21Bindings table{border-collapse:collapse;width:100%}#t21Bindings td,#t21Bindings th{padding:7px;text-align:left;border-bottom:1px solid #56728355}#t21Bindings td:first-child{width:32%}#t21Bindings button{font:inherit;cursor:pointer;padding:6px 10px;border:1px solid #657f8d;background:#2c4555;color:#f6e1b3;border-radius:4px}#t21Bindings td button{width:100%;font-size:12px;min-height:34px}#t21Bindings footer{display:flex;flex-wrap:wrap;gap:8px}#t21Bindings .t21BindScroll{max-height:54vh;overflow:auto}#t21BindingStatus{min-height:22px;color:#f0d29c}`;document.head.append(t21BindingsCSS);

const t21GuideRows=[['jump','跳跃 / 跳车'],['attack','攻击 / 工具'],['toolPrev','上一个工具'],['toolNext','下一个工具'],['weapon','切换已有武器'],['mount','上下坐骑'],['interact','管道 / 交互'],['heal','治疗'],['recall','魔镜返程'],['pause','暂停']];
function t21RefreshGuide(){t15Help.innerHTML='<summary>操作指南 · 手柄 / 键鼠</summary><p>移动：左摇杆 / 十字键，或 WASD / 方向键。键鼠用鼠标手动瞄准，手柄自动索敌；右摇杆偏转不影响瞄准。按实际输入自动切换。</p><table><thead><tr><th>动作</th><th>手柄</th><th>键盘</th></tr></thead><tbody>'+t21GuideRows.map(([k,n])=>'<tr><td>'+n+'</td><td>'+t21Binds[k].pad.map(x=>T21_PAD_NAMES[x]||('按钮 '+x)).join(' / ')+'</td><td>'+t21Binds[k].keys.map(t21KeyLabel).join(' / ')+'</td></tr>').join('')+'</tbody></table><p>1–6、滚轮或肩键切工具。手柄平台默认沿脚下台面向前接一格；火把与篝火落在脚前地面。上 / 下方向调整高度，鼠标可精确选格。</p><p>宝箱碰到后弹出实物，走过去拾取并显示名称、效果。换下的武器留在地面，先走开再接触即可换回；不再直接删除旧武器。</p><p>矿车接触上车，跳跃下车；原车保留，走开后可重新接触上车。套装接触换装并自动骑 UFO，向下可穿木台。箭矢与子弹无限，魔力、木材和药水仍消耗。</p><p>最右侧眼球在战前物资拿齐后召唤克眼，击败后可从原管道返回。终点大台阶下方的雪地可遇到独眼巨鹿；主线不强制击败它。</p>';}
const t21RefreshBindingsOriginal=t21RefreshBindings;t21RefreshBindings=function(){t21RefreshBindingsOriginal();t21RefreshGuide();};t21RefreshGuide();

/* Release gameplay extension. Native Terraria sheets have pinned source URLs.
   A missing optional NPC sheet never spawns an invisible enemy. */
const T21_REMOTE={NPC61:'NPC_61.png',NPC181:'NPC_181.png',NPC42:'NPC_42.png',NPC150:'NPC_150.png',NPC173:'NPC_173.png',NPC668:'NPC_668.png',iceBlade:'Item_724.png',boomstick:'Item_964.png',flurry:'Item_1579.png',blizzard:'Item_987.png',anklet:'Item_212.png',claws:'Item_211.png',mirror:'Item_50.png',healing:'Item_188.png',manaPotion:'Item_189.png',silverCoin:'Item_72.png'};
const t21Art={},t21ArtState={},t21Frames={};
function t21ImageLoad(key,src,timeout=14000){return new Promise(resolve=>{const im=new Image();im.crossOrigin='anonymous';let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);if(ok){if(!src.startsWith('data:')){try{const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;cv.getContext('2d').drawImage(im,0,0);localStorage.setItem('marioMix.native.'+key,cv.toDataURL('image/png'));}catch{}}t21Art[key]=im;if(!key.startsWith('NPC'))r06Images[key]=im;r08ImageRevision++;t21ArtState[key]='ready';}resolve(ok);};im.onload=()=>finish(im.naturalWidth>0);im.onerror=()=>finish(false);const timer=setTimeout(()=>finish(false),timeout);im.src=src;});}
const t21EmbeddedReady=Promise.all(Object.entries(T21_NATIVE).map(([k,src])=>t21ImageLoad(k,src,3000)));
const t21ArtReady=t21EmbeddedReady.then(async()=>{
 const jobs=Object.entries(T21_REMOTE).map(async([k,file])=>{if(t21Art[k])return true;t21ArtState[k]='loading';try{const saved=localStorage.getItem('marioMix.native.'+k);if(saved?.startsWith('data:image/png;base64,')&&await t21ImageLoad(k,saved,2500))return true;}catch{}const base='sullerandras/terraria-hd-textures',rev='93960b7c8226c57a10dc2474d73d4b604b401c40';for(const src of [`https://cdn.jsdelivr.net/gh/${base}@${rev}/source-pngs/${file}`,`https://raw.githubusercontent.com/${base}/${rev}/source-pngs/${file}`])if(await t21ImageLoad(k,src))return true;t21ArtState[k]='unavailable';return false;});
 return Promise.all(jobs);
});
// Use original pixels, not recolored generic slimes, for additional biome monsters.
// Atlas frames are specified for the small NPCs; Deerclops bounds are found from
// transparent margins, avoiding hard-coded guessed multi-column frame heights.
function t21DeerFrames(){if(t21Frames.deer)return t21Frames.deer;const im=t21Art.NPC668;if(!im)return null;
 const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);
 try{const data=g.getImageData(0,0,cv.width,cv.height).data,out=[],cw=im.width/5;
  for(let col=0;col<5;col++){let start=-1,last=-1;for(let y=0;y<im.height;y++){let any=false;for(let x=col*cw;x<(col+1)*cw;x++)if(data[(y*im.width+x)*4+3]>0){any=true;break;}
    if(any){if(start<0)start=y;last=y;}if(start>=0&&(!any&&y-last>10||y===im.height-1)){if(last-start>70){let min=cw,max=0;for(let yy=start;yy<=last;yy++)for(let x=0;x<cw;x++)if(data[(yy*im.width+col*cw+x)*4+3]>0){min=Math.min(min,x);max=Math.max(max,x);}out.push({x:col*cw+min,y:start,w:max-min+1,h:last-start+1,col});}start=-1;}}
  }
  if(out.length)t21Frames.deer=out;return out;
 }catch{return null;}}
Object.assign(T10_ITEMS,{iceBlade:{grip:[5,35],tip:[30,3],scale:1,style:'swing'},boomstick:{grip:[10,13],tip:[38,8],scale:1,style:'gun'}});
// Complete the two new weapon paths. These projectiles NEVER share the homing-
// Chlorophyte bullet handler. The mouse remains manual, pad lock sets launch only.
function t21Shot(s,kind,x,y,vx,vy,damage,life=100){t21Ensure(s);const a={kind,x,y,vx,vy,damage,life,age:0,hit:[],w:3,h:3};s.t21ExtraShots.push(a);return a;}
const t21AttackBase=r06Attack;
r06Attack=function(v={}){const s=state,p=s?.p;if(!s||s.tool!==0||p.cooldown>0)return;const weapon=r06Weapon(s);
 if(['iceBlade','boomstick'].includes(weapon)){const aim=r06Arm(s,v),sc=t10Scale(s),angle=aim.facing<0?Math.PI-aim.angle:aim.angle,duration=weapon==='iceBlade'?20:40;p.attack=p.cooldown=p.t10SwingDuration=duration;p.t10PreviousBlade=null;s.attackId++;
  const hand=t10WorldPose(s).hand;
  if(weapon==='iceBlade'){if(!(s.t21IceCooldown>0)){t21Shot(s,'icebolt',hand.x,hand.y,Math.cos(angle)*9*sc,Math.sin(angle)*9*sc,17,100);s.t21IceCooldown=60;}terraSound('swing',{volume:.55});}
  else{for(let i=0;i<4;i++){const a=angle+(i-1.5)*.055;t21Shot(s,'pellet',hand.x+Math.cos(a)*20*sc,hand.y+Math.sin(a)*20*sc,Math.cos(a)*12*sc,Math.sin(a)*12*sc,14,75);}terraSound('shoot',{volume:.55});}
  t21Event('new-weapon-attack',{weapon,source:aim.source});return;
 }
 const before=s.attackId,ret=t21AttackBase(v);if(s.t13Accessories.claws&&s.attackId!==before&&['starfury','terraBlade','zenith'].includes(weapon)){p.cooldown=Math.max(1,Math.round(p.cooldown/1.12));p.attack=Math.max(1,Math.round(p.attack/1.12));p.t10SwingDuration=p.attack;}
 return ret;
};r05Attack=r06Attack;
const t21ArcBase=t10HitArc;
t10HitArc=function(s,targets){const weapon=r06Weapon(s);if(weapon==='boomstick')return;if(weapon!=='iceBlade')return t21ArcBase(s,targets);const p=s.p;if(p.attack<2||p.attack>p.t10SwingDuration-2)return;const pose=t10WorldPose(s);
 for(const t of targets){if(t.obj.t21Arc===s.attackId)continue;const box={x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h};if(segmentHits(pose.hand,pose.end,box,4*t10Scale(s))){t.obj.t21Arc=s.attackId;r06DamageTarget(t,17,'ice-blade-melee');}}
};
// Recovered class weapons retain their archetype without silently changing armor.
const T21_CLASS_WEAPON={zenith:'melee',sdmg:'ranger',lastPrism:'mage',terraprisma:'summoner',kaleidoscope:'summoner'};
T21_ITEMS.kaleidoscope={name:'万花筒',effect:'鞭子标记目标；召唤剑自主攻击',icon:'kaleidoscope',weapon:true};
const t21CombatBase=r06TickCombat;
r06TickCombat=function(v){const s=state,weapon=r06Weapon(s),type=T21_CLASS_WEAPON[weapon];if(!type)return t21CombatBase(v);const kit=s.kit,override=s.t13WeaponOverride;s.kit=type;s.t13WeaponOverride=false;if(type==='summoner'&&!s.minions?.length)r06CreateMinions(s);try{return t21CombatBase(v);}finally{s.kit=kit;s.t13WeaponOverride=override;}};

function t21NpcDamage(s,amount,x){const p=s.p;if(mode!=='playing'||p.invuln||s.t13Recalling)return;const damage=Math.max(1,Math.round(amount)-Math.floor(r06Defense(s)*.5));s.hp=Math.max(0,s.hp-damage);p.invuln=90;p.hurtLock=12;p.vx=(p.x+p.w/2<x?-1:1)*3;p.vy=-3.3;p.grounded=false;p.support=null;p.attack=0;number('-'+damage,p.x,p.y,'#ffc3b6');terraSound('hurt');t21Event('npc-hurt',{damage,hp:s.hp});if(!s.hp){if(s.r05Arena){s.phase='defeated';mode='respawn';clearInput();showOverlay('地下探索','再试一次','已打开的宝箱与地形保留。','回准备场 →','ENTER / A');}else fail('damage');}}
const T21_NPCS={
 vulture:{name:'秃鹫',art:'NPC61',fw:78,fh:60,n:6,w:34,h:28,hp:60,damage:14,defense:4,style:'vulture'},
 faceMonster:{name:'脸怪',art:'NPC181',fw:34,fh:48,n:22,w:24,h:40,hp:88,damage:25,defense:10,style:'walker'},
 hornet:{name:'黄蜂',art:'NPC42',fw:44,fh:40,n:4,w:24,h:24,hp:56,damage:18,defense:6,style:'hornet'},
 iceBat:{name:'冰雪蝙蝠',art:'NPC150',fw:38,fh:32,n:4,w:24,h:18,hp:72,damage:18,defense:6,style:'bat'},
 crimera:{name:'猩红喀迈拉',art:'NPC173',fw:48,fh:40,n:4,w:30,h:24,hp:80,damage:22,defense:8,style:'chase'}
};
function t21ConvertFoe(e,key,s){const def=T21_NPCS[key],art=t21Art[def?.art];if(!def||!art||e.t21Species)return false;const feet=e.y+e.h,sc=s.r05Arena?1:.75;e.t21Original={kind:e.kind,w:e.w,h:e.h};e.t21Species=key;e.kind=key;e.w=def.w*sc;e.h=def.h*sc;e.y=feet-e.h;if(['vulture','walker'].includes(def.style)){const home=s.level.surfaces.find(q=>q.id===e.home);if(home)e.y=home.y-e.h;}e.hp=e.maxHp=Math.round(def.hp*(e.elite?1.75:1));e.t21Scale=sc;e.flying=['vulture','hornet','bat','chase'].includes(def.style);e.t21Mood=def.style==='vulture'?'perched':'awake';e.age=0;e.vx=0;e.vy=0;e.dead=false;return true;}
function t21Populate(s){if(!s||s.stage!==0)return;for(const [i,e]of(s.foes||[]).entries()){
 if(!e.t21HpRaised&&!e.t21Species){e.t21HpRaised=true;e.hp=e.maxHp=Math.ceil(e.maxHp*1.1);}const b=e.t16Biome||t16BiomeAt(e.x,s).id,key=b==='desert'?'vulture':b==='crimson'?(i%2?'crimera':'faceMonster'):b==='jungle'?'hornet':b==='snow'?'iceBat':null;
 if(key&&!['goomba','koopa'].includes(e.kind)&&!e.dead&&!e.active)t21ConvertFoe(e,key,s);
 }
 for(const [i,e]of(s.t13World?.deepFoes||[]).entries()){if(e.dead||e.active||e.t21Species)continue;const key=e.biome===2?(i%2?'crimera':'faceMonster'):e.biome===3?'hornet':e.biome===4?'iceBat':null;if(key)t21ConvertFoe(e,key,s);}
}
function t21NpcMove(s,e,surfaces){const def=T21_NPCS[e.t21Species],p=s.p,sc=e.t21Scale||1,view=s.r05Arena?900:320;if(e.dead)return;if(Math.abs(e.x-p.x)>view||Math.abs(e.y-p.y)>(s.r05Arena?570:240)){e.active=false;return;}e.active=true;e.age++;if(e.flash)e.flash--;const dx=p.x+p.w/2-e.x-e.w/2,dy=p.y+p.h*.5-e.y-e.h/2,dir=Math.sign(dx)||e.dir||1;
 if(e.knock>0){e.knock--;e.vx*=.9;}else if(e.t21Mood==='perched'){e.vx=0;e.vy=0;if(Math.hypot(dx,dy)<180*sc||e.hp<e.maxHp){e.t21Mood='awake';e.vy=-2.2*sc;}}
 else if(def.style==='walker'){e.dir=dir;e.vx=dir*1.35*sc;if(e.grounded&&dy< -18&&e.age%45===0)e.vy=-5.6*sc;}
 else{const distance=Math.hypot(dx,dy)||1,range=def.style==='hornet'?130*sc:0,tx=dx-dir*range,ty=dy+(def.style==='hornet'?-35*sc:0),d=Math.hypot(tx,ty)||1,sp=(def.style==='bat'?2.6:def.style==='chase'?2.4:2.15)*sc;e.vx=approach(e.vx,tx/d*sp,.07*sc);e.vy=approach(e.vy,ty/d*sp,.055*sc);e.dir=e.vx<0?-1:1;
  if(def.style==='hornet'&&distance<260*sc&&e.age%145===0&&t14Visible(s,{x:e.x+e.w/2,y:e.y+e.h/2})){s.t21Hostile.push({kind:'stinger',x:e.x+e.w/2,y:e.y+e.h/2,vx:dx/distance*4*sc,vy:dy/distance*4*sc,life:100,age:0,damage:18});}}
 const old={x:e.x,y:e.y,w:e.w,h:e.h};if(def.style==='walker')e.vy=Math.min(7*sc,e.vy+.28*sc);e.x+=e.vx;e.y+=e.vy;e.grounded=false;
 for(const q of surfaces){if(q.solid&&near(e,q)&&old.y<q.y+q.h&&old.y+old.h>q.y&&Math.abs(e.vx)>0){e.x=old.x;e.vx=0;if(def.style==='walker')e.vy=-4.9*sc;else e.vy=dy<0?-2*sc:2*sc;}
 if(e.x+e.w>q.x&&e.x<q.x+q.w&&old.y+e.h<=q.y+.6&&e.y+e.h>=q.y&&e.vy>=0){e.y=q.y-e.h;e.vy=0;e.grounded=true;}}
 if(e.y>(s.r05Arena?T13.top+T13.rows*16:300)){e.dead=true;return;}
 if(near(p,e))t21NpcDamage(s,def.damage,e.x+e.w/2);
}
const t21EnemiesBase=updateEnemies;
updateEnemies=function(ss){const s=state,all=s.foes,custom=all.filter(e=>e.t21Species);s.foes=all.filter(e=>!e.t21Species);try{t21EnemiesBase(ss);}finally{s.foes=all;}for(const e of custom)t21NpcMove(s,e,ss);};
const t21DeepBase=t17DeepStep;
t17DeepStep=function(s){const all=s.t13World?.deepFoes;if(!all)return;const custom=all.filter(e=>e.t21Species);s.t13World.deepFoes=all.filter(e=>!e.t21Species);try{t21DeepBase(s);}finally{s.t13World.deepFoes=all;}for(const e of custom){const box={x:e.x-24,y:e.y-24,w:e.w+48,h:e.h+64};t21NpcMove(s,e,t13PhysicalSurfaces(s,box));}};
function t21DrawNpc(e,c){const def=T21_NPCS[e.t21Species],im=t21Art[def?.art];if(!im||e.dead)return false;const sc=e.t21Scale||1,frames=t21NativeFrames(im,def.art,def.n),frame=e.t21Mood==='perched'?frames[0]:frames[Math.floor(e.age/(def.style==='walker'?7:6))%frames.length],fh=frame.h,fw=im.width,f=0;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(e.x+e.w/2-c),Math.round(e.y+e.h));ctx.scale(e.dir<0?sc:-sc,sc);if(e.flash%2)ctx.globalAlpha=.5;ctx.drawImage(im,0,frame.y,fw,fh,-fw/2,-fh+2,fw,fh);ctx.restore();return true;}
const t21FoeDrawBase=t10DrawFoe;t10DrawFoe=function(e,c){return e.t21Species?t21DrawNpc(e,c):t21FoeDrawBase(e,c);};
const t21DrawDeepBase=t17DrawDeep;t17DrawDeep=function(s){const all=s.t13World.deepFoes;s.t13World.deepFoes=all.filter(e=>!e.t21Species);try{t21DrawDeepBase(s);}finally{s.t13World.deepFoes=all;}for(const e of all)if(e.t21Species&&e.active)t21DrawNpc(e,s.cam);};

// Deerclops occupies the lower snow clearing BEFORE the final staircase. It does
// not replace/resize the original stairs or seal the flag/castle route.
function t21MakeDeer(s){const art=t21Art.NPC668,frames=t21DeerFrames();if(s.t21Deer||!art||!frames?.length||s.r05Arena)return;
 s.t21Deer={id:'t21-deerclops',kind:'deerclops',x:2132,y:122,w:62,h:86,hp:7000,maxHp:7000,defense:10,active:false,dead:false,vx:0,vy:0,dir:-1,age:0,mode:'dormant',cycle:0,flash:0,shots:[],frame:0};}
function t21DeerMode(e,m){e.mode=m;e.age=0;t21Event('deer-state',{mode:m});}
function t21IceWave(s,e,both=false){for(const direction of both?[-1,1]:[e.dir])for(let i=0;i<(both?9:7);i++){const x=e.x+e.w/2+direction*(35+i*13),ground=Math.min(208,...s.level.surfaces.filter(q=>q.solid&&x>=q.x&&x<q.x+q.w&&q.y>=80).map(q=>q.y));s.t21Hostile.push({kind:'ice-spike',x,y:ground,w:11,h:25+i,age:-i*5,life:72,damage:26});}}
function t21Hands(s,e){for(let i=0;i<5;i++){const angle=i*Math.PI*2/5,px=s.p.x+s.p.w/2,py=s.p.y+s.p.h/2;s.t21Hostile.push({kind:'shadow-hand',x:px+Math.cos(angle)*70,y:py+Math.sin(angle)*52,tx:px+s.p.vx*14,ty:py+s.p.vy*8,age:0,life:130,damage:28,vx:0,vy:0});}}
function t21DeerStep(s){const e=s.t21Deer;if(!e||e.dead||s.r05Arena)return;const p=s.p,dx=p.x+p.w/2-e.x-e.w/2,dy=p.y+p.h/2-e.y-e.h/2,d=Math.hypot(dx,dy);
 if(e.mode==='dormant'){if(p.x>2050&&p.x<2230&&p.y+p.h>145){e.active=true;t21DeerMode(e,'awaken');terraSound('roar',{volume:.65});}return;}
 if(d>470){e.active=false;s.t21Hostile=s.t21Hostile.filter(a=>!['ice-spike','debris','shadow-hand'].includes(a.kind));t21DeerMode(e,'dormant');return;}e.active=true;e.invulnerable=d>360;e.age++;if(e.flash)e.flash--;e.dir=Math.sign(dx)||e.dir;
 if(e.mode==='awaken'){if(e.age>90)t21DeerMode(e,'walk');}
 else if(e.mode==='walk'){e.x=clamp(e.x+e.dir*.58,2078,2144);if(p.y+p.h<e.y+20&&e.age>85)t21DeerMode(e,'hands');else if(Math.abs(dx)<95&&e.age>70)t21DeerMode(e,'slam');else if(e.age>150)t21DeerMode(e,'throw');}
 else if(e.mode==='slam'){if(e.age===38){t21IceWave(s,e,e.cycle%4===3);e.cycle++;terraSound('break',{volume:.65});}if(e.age>86)t21DeerMode(e,'walk');}
 else if(e.mode==='throw'){if(e.age===45)for(let i=0;i<5;i++){const vx=e.dir*(1.7+i*.45);s.t21Hostile.push({kind:'debris',x:e.x+e.w/2,y:e.y+20,vx,vy:-4.8-i*.22,age:0,life:190,damage:28});}if(e.age>108)t21DeerMode(e,'walk');}
 else if(e.mode==='hands'){if(e.age===42)t21Hands(s,e);if(e.age>118)t21DeerMode(e,'walk');}
 if(e.mode!=='awaken'&&near(p,e))t21NpcDamage(s,30,e.x+e.w/2);
}
const t21AllTargetsBase=r06AllTargets;r06AllTargets=function(s){const a=t21AllTargetsBase(s),e=s.t21Deer;if(!s.r05Arena&&e?.active&&!e.dead&&e.mode!=='awaken')a.push({id:e.id,x:e.x+e.w/2,y:e.y+e.h/2,w:e.w,h:e.h,obj:e});return a;};
const t21DamageBase=r06DamageTarget;
r06DamageTarget=function(t,damage,kind){const e=t?.obj,s=state;if(!e?.t21Species&&e?.kind!=='deerclops')return t21DamageBase(t,damage,kind);if(e.dead||e.invulnerable||e.mode==='awaken')return;const defense=e.kind==='deerclops'?10:T21_NPCS[e.t21Species].defense,armor=Math.max(0,defense-(s.t13Accessories.shark?5:0)),actual=Math.max(1,Math.round(damage-armor*.5));e.hp-=actual;e.flash=8;
 if(e.kind!=='deerclops'){e.knock=kind==='copper-axe'?18:11;e.vx=(s.p.attackFacing||s.p.facing)*(kind==='copper-axe'?4.5:2.5)*(e.elite?.55:1);e.vy=-2;e.t21Mood='awake';}
 number(String(actual),t.x,t.y-12,'#f2debb');if(e.hp<=0){e.dead=true;s.kills++;s.score+=e.kind==='deerclops'?5000:100;terraSound('npcDeath');if(e.kind==='deerclops'){s.t21Hostile=[];t21Drop(s,'healing',5,e.x+15,190);t21Drop(s,'silverCoin',100,e.x+42,186);t21Event('deer-defeated');}else if(e.elite)t21Drop(s,'healing',1,e.x,e.y);}};
function t21ExtraStep(s){if(s.t21IceCooldown>0)s.t21IceCooldown--;const targets=r06AllTargets(s),sc=t10Scale(s);
 for(const a of s.t21ExtraShots){a.age++;a.life--;const from={x:a.x,y:a.y};a.x+=a.vx;a.y+=a.vy;const box={x:Math.min(from.x,a.x)-2,y:Math.min(from.y,a.y)-2,w:Math.abs(a.vx)+4,h:Math.abs(a.vy)+4};if(t13PhysicalSurfaces(s,box).some(q=>q.solid&&segmentHits(from,a,q,1))){a.life=0;continue;}
  for(const t of targets){if(a.hit.includes(t.id))continue;if(segmentHits(from,a,{x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h},2*sc)){a.hit.push(t.id);r06DamageTarget(t,a.damage,a.kind);a.life=0;break;}}}
 s.t21ExtraShots=s.t21ExtraShots.filter(a=>a.life>0);
 for(const a of s.t21Hostile){a.age++;a.life--;if(a.kind==='ice-spike'){if(a.age>8&&a.age<42&&near(s.p,{x:a.x-a.w/2,y:a.y-a.h,w:a.w,h:a.h}))t21NpcDamage(s,a.damage,a.x);continue;}
 if(a.kind==='shadow-hand'){if(a.age===35){const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy)||1;a.vx=dx/d*3.3;a.vy=dy/d*3.3;}if(a.age<35)continue;}
 if(a.kind==='debris')a.vy+=.16;const from={x:a.x,y:a.y};a.x+=a.vx||0;a.y+=a.vy||0;if(a.kind!=='shadow-hand'&&t13PhysicalSurfaces(s,{x:a.x-3,y:a.y-3,w:6,h:6}).some(q=>q.solid&&segmentHits(from,a,q,1))){a.life=0;continue;}if(near(s.p,{x:a.x-4,y:a.y-4,w:8,h:8})){t21NpcDamage(s,a.damage,a.x);a.life=0;}}
 s.t21Hostile=s.t21Hostile.filter(a=>a.life>0);
}
function t21DrawDeer(s,c){const e=s.t21Deer,frames=t21DeerFrames(),im=t21Art.NPC668;if(!e||e.dead||!frames?.length||!im)return;const preferred=frames.filter(f=>f.col===(e.mode==='slam'?1:e.mode==='throw'?2:e.mode==='hands'?4:0)),pool=preferred.length?preferred:frames,f=pool[Math.floor(e.age/9)%pool.length],scale=Math.min(104/f.h,96/f.w);ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(e.x+e.w/2-c),208);ctx.scale(e.dir<0?1:-1,1);if(e.flash%2)ctx.globalAlpha=.6;ctx.drawImage(im,f.x,f.y,f.w,f.h,-f.w*scale/2,-f.h*scale,f.w*scale,f.h*scale);ctx.restore();if(e.active){ctx.fillStyle='#111d29';ctx.fillRect(e.x-10-c,e.y-19,82,11);ctx.fillStyle='#af515c';ctx.fillRect(e.x-9-c,e.y-9,80*Math.max(0,e.hp/e.maxHp),2);ctx.fillStyle='#e8e0dc';ctx.font='7px sans-serif';ctx.textAlign='center';ctx.fillText('独眼巨鹿',e.x+31-c,e.y-12);}}
const t21ProjectileRenderBase=r06DrawProjectiles;r06DrawProjectiles=function(s,c){t21ProjectileRenderBase(s,c);if(!s.r05Arena)t21DrawDeer(s,c);const sc=t10Scale(s);ctx.save();
 for(const a of s.t21ExtraShots){ctx.strokeStyle=a.kind==='icebolt'?'#a4e5f7':'#e8d8a0';ctx.lineWidth=a.kind==='icebolt'?3*sc:1*sc;ctx.beginPath();ctx.moveTo(a.x-c-a.vx*.65,a.y-a.vy*.65);ctx.lineTo(a.x-c,a.y);ctx.stroke();}
 for(const a of s.t21Hostile){if(a.age<0)continue;if(a.kind==='ice-spike'){const h=a.h*Math.min(1,a.age/8,Math.max(0,(65-a.age)/20));ctx.fillStyle='#87bed3';ctx.beginPath();ctx.moveTo(a.x-c-a.w/2,a.y);ctx.lineTo(a.x-c+2,a.y-h);ctx.lineTo(a.x-c+a.w/2,a.y);ctx.fill();ctx.strokeStyle='#d9f6fa';ctx.beginPath();ctx.moveTo(a.x-c+2,a.y-h);ctx.lineTo(a.x-c,a.y-3);ctx.stroke();}
 else if(a.kind==='debris'){const tile=t13TileTexture(2,0);ctx.drawImage(tile,a.x-c-4,a.y-4,8,8);}
 else if(a.kind==='shadow-hand'){ctx.globalAlpha=a.age<35?.2+a.age/60:.85;ctx.fillStyle='#423048';ctx.fillRect(a.x-c-5,a.y-3,9,7);for(let i=0;i<4;i++)ctx.fillRect(a.x-c-5+i*3,a.y-9+(i%2)*2,2,8);ctx.globalAlpha=1;}
 else{ctx.fillStyle='#b8c06f';ctx.fillRect(a.x-c-3,a.y-1,6,2);}}
 ctx.restore();};
const t21NewBase=newState;newState=function(){const s=t21NewBase();t21Ensure(s);t21Populate(s);t21MakeDeer(s);return s;};
const t21ExtraStepBase=step;step=function(v){const s=state;t21Ensure(s);if(s&&mode==='playing'){if(s.ticks%120===0){t21Populate(s);t21MakeDeer(s);}if(v.jumpEdge&&!s.p.grounded&&s.p.cloudAvailable&&s.t13Accessories.blizzard)s.t21BlizzardJump=true;}
 const ret=t21ExtraStepBase(v);if(state===s&&s&&mode==='playing'&&!s.t11Transition){if(s.t21BlizzardJump){if(!s.p.cloudAvailable&&s.p.vy<0){s.p.vy*=1.24;s.r06FX.push({type:'cloud',x:s.p.x+s.p.w/2,y:s.p.y+s.p.h,age:0});}s.t21BlizzardJump=false;}t21ExtraStep(s);t21DeerStep(s);}return ret;};
c23Bindings={config:t21Config,open:t21OpenBindings,close:t21CloseBindings,isOpen:()=>t21BindingBox.open,consumePad:p=>{t17Input.buttons=p?Array.from(p.buttons||[],t17Pressed):[];t17Input.previous=t17Input.buttons.slice();t17Input.axes=p?Array.from(p.axes||[]):[0,0,0,0];t17Input.connected=!!p;t17Input.index=p?.index??null;t17Input.id=p?.id??null;t17Input.inactive=false;t17MaskHeld();if(p)t20Own('gamepad');}};
const t21Diagnostics={ready:t21ArtReady,embeddedReady:t21EmbeddedReady,events:()=>T21_LOG,config:t21Config,bind:t21Bind,settings:t21OpenBindings,closeSettings:t21CloseBindings,raw:v=>t14RawTarget(state,v),target:v=>t13ToolTarget(state,v),place:(t,n)=>t13Place(state,t,n),open:i=>t21Open(state,state.t13World.chests[i]),drop:(kind,x,y,extra={})=>t21Drop(state,kind,1,x,y,extra),collect:(k,n=1)=>t21Collect(state,k,n),drops:()=>state?.t13Drops,items:T21_ITEMS,art:()=>Object.fromEntries(Object.entries(t21Art).map(([k,v])=>[k,[v.width,v.height]])),artState:()=>t21ArtState,deer:()=>state?.t21Deer,frames:t21DeerFrames,populate:()=>{t21Populate(state);t21MakeDeer(state);},damage:r06DamageTarget,extraStep:()=>t21ExtraStep(state)};

const t21AssetStatus=document.createElement('p');t21AssetStatus.id='t21AssetStatus';t21AssetStatus.style.cssText='font-size:11px;line-height:1.65;color:#b7c3cb;margin:10px 0';t15Help.after(t21AssetStatus);
function t21UpdateAssetStatus(){const pending=Object.keys(T21_REMOTE).filter(k=>t21ArtState[k]!=='ready');t21AssetStatus.textContent=pending.length?(pending.some(k=>t21ArtState[k]!=='unavailable')?'正在载入新增原版素材；不影响现有关卡。':'部分新增原版素材未载入，请联网后重新打开。缺失贴图的敌人不会隐形出现。'):'';}
t21UpdateAssetStatus();t21ArtReady.then(t21UpdateAssetStatus);
const t21CleanBase=t20CleanUI;t20CleanUI=function(){t21CleanBase();if(!isTrio())return;if(mode==='win'){if($('overlayTitle'))$('overlayTitle').textContent='关卡完成';$('overlayText').textContent='穿越五种生态，抵达城堡。感谢冒险！';}if(state&&/暂不接力|三段接力|尚未完成|R\d{2}/.test(state.notice||'')){state.notice='';state.noticeTime=0;}if($('r06Mount'))$('r06Mount').title='坐骑键：上下已获得坐骑；接触矿车也可上车。';};

function t21NativeFrames(im,key,fallback){if(t21Frames[key])return t21Frames[key];try{const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);const rgba=g.getImageData(0,0,im.width,im.height).data;let start=-1,last=-1;const runs=[];for(let y=0;y<im.height;y++){let ink=false;for(let x=0;x<im.width;x++)if(rgba[(y*im.width+x)*4+3]){ink=true;break;}if(ink){if(start<0)start=y;last=y;}if(start>=0&&(!ink&&y-last>=2||y===im.height-1)){if(last-start>8)runs.push({y:start,h:last-start+1});start=-1;}}if(runs.length>1)return t21Frames[key]=runs;}catch{}return t21Frames[key]=Array.from({length:fallback},(_,i)=>({y:i*im.height/fallback,h:im.height/fallback}));}

 fixedUpdate=function(){if(!isTrio())return old.update.apply(this,arguments);pollMixPad();if(!isTrio())return;const v=readInput();if(mode==='menu'&&v.toolEdge)chooseStage(1-r05EntryChoice);step(v);prev=v;audioSync();};
 draw=function(){if(!isTrio()){setRenderScale(1);return old.draw.apply(this,arguments);}return render();};
 if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
  const snapshot=()=>state?JSON.parse(JSON.stringify({mode,hero,ready,...state})):null;
  window.__trioTest={t21:t21Diagnostics,t20:t20Diagnostics,t17:t17Diagnostics,t16:t16Diagnostics,t15:t15Diagnostics,t14:t14Diagnostics,t13:t13Diagnostics,t12:t12Diagnostics,t11:t11Diagnostics,t10:t10Diagnostics,r08Peek(){return {mode,...state};},r08Tick(n=1){for(let i=0;i<n;i++)fixedUpdate();},r08Report(){return {version:R08_VERSION,cacheHits:r08CacheHits,cacheWrites:r08CacheWrites,cacheError:r08CacheError,uiWrites:r08UIWrites,glowTextures:r08GlowCache.size,fireFrames:r08FireFrames.size,pointer:{...r05Pointer},roars:r08LiveRoars.size,music:Object.fromEntries(Object.entries(r06Music).map(([k,t])=>[k,{src:t.audio.src,state:t.state,local:!!t.local,cached:!!t.cached,restorePending:t.restorePending,volume:t.audio.volume}]))}},r08CacheEverything,r08RestoreMusic,r08CacheAudio,r08LoadImage:r07LoadImage,r08ReadCache,r08WriteCache,r08WaitMusic:async()=>{while(Object.values(r06Music).some(t=>t.restorePending))await new Promise(r=>setTimeout(r,10));},r08Point(v){Object.assign(r05Pointer,v);},r08Combat(v={}){r06TickCombat(v);},r08RenderBench(n=60){const t=performance.now();for(let i=0;i<n;i++)render();return performance.now()-t;},r07Report(){return{version:R07_VERSION,arena:R07_ARENA,slime:R07_SLIME,assets:r06AssetStatus,music:Object.fromEntries(Object.entries(r06Music).map(([k,t])=>[k,{state:t.state,paused:t.audio.paused,src:t.audio.src,sources:t.urls,failures:t.failures,local:!!t.local}]))}},r07CycleMount,r07EquipDrop(index){return r07EquipDrop(state,state.r07Loot[index]);},r06Report(){return{version:R06_VERSION,assets:r06AssetStatus,music:Object.fromEntries(Object.entries(r06Music).map(([k,v])=>[k,{state:v.state,paused:v.audio.paused,src:v.audio.src}])),rewardOpen:r06RewardsOpen,view:R06_VIEW}},r06ChooseKit,r06OpenRewards,r06Heal,r06ToggleMount,r06NaturalArrival,r06Target(){const t=r06Target(state);return t?{id:t.id,x:t.x,y:t.y}:null},r06AssetReady:Promise.all(r06AssetJobs),r05Summon,r05StartArena(){chooseStage(1);startGame();render();return snapshot();},r05Construction(){return r05Builder?.save();},r05BuildAt(x,y){if(!r05Builder)return null;const r=r05Builder.place(x,y,state.p);state.built=[...r05Builder.platforms.values()];state.wood=r05Builder.wood;return r;},r05SetEye(v){if(state.eye)Object.assign(state.eye,v);},r05HitEye(d){r05HitEye(d,'explicit-test-fixture');},r05Retry(){enterTerraSecret(true);render();return snapshot();},r05Report(){return{view:[canvas.width,canvas.height],entry:r05EntryChoice,construction:r05Builder?.save(),assets:{eye:[photos.eyeOriginal?.width,photos.eyeOriginal?.height],servant:[photos.servantOriginal?.width,photos.servantOriginal?.height]},phase:state?.phase}},advance(n=1,v={}){for(let i=0;i<n;i++){const inp={x:0,y:0,jump:false,action:false,auxiliary:false,tool:false,...v};inp.jumpEdge=inp.jump&&!prev.jump;inp.auxEdge=inp.auxiliary&&!prev.auxiliary;inp.toolEdge=inp.tool&&!prev.tool;step(inp);prev=inp;}},chooseStage,enterHidden(){return state.stage===0?enterTerraSecret():enterSpatialSecret();},exitHidden:exitSecret,resources(){return R04_RESOURCE_STATUS;},ready:readyPromise,start(){showCharacters();selectHero(id);startGame();render();return snapshot();},state:snapshot,attackGeometry(){return {tip:bladePoint(state.p.attack),previous:bladePoint(Math.min(SWING,state.p.attack+1))};},step(n=1,v={}){for(let i=0;i<n;i++){const inp={x:0,y:0,jump:false,action:false,auxiliary:false,tool:false,...v};inp.jumpEdge=inp.jump&&!prev.jump;inp.auxEdge=inp.auxiliary&&!prev.auxiliary;inp.toolEdge=inp.tool&&!prev.tool;step(inp);prev=inp;}render();return snapshot();},native(n=1){for(let i=0;i<n;i++)fixedUpdate();render();return snapshot();},place(x,y){Object.assign(state.p,{x,y,vx:0,vy:0,grounded:false,support:null,invuln:0,hurtLock:0});prev={};},fixture(v){Object.assign(state,v);},player(v){Object.assign(state.p,v);},target(x,y){state.target={x,y};},canBuild,build:placePlatform,mine:minePlatform,menu:showCharacters,primary:handlePrimary,pause:togglePause,damage(){hurt({x:state.p.x+30,w:16});},surfaces(){return JSON.parse(JSON.stringify(solids()));},decode(){return {ready,error:loadError,images:Object.keys(photos),tiles:Object.keys(tiles13),audio:extraAudioReady,audioFailures:[...audioFailures]};},audioReady:async()=>{audioInit();await prepareAudio();await loadExtraAudio();audioSync();},audio(){return {track:bgm?.key||null,bankKeys:[...bank.keys()].filter(k=>k.startsWith('trio13_')),soundOn};},snapshot:render,metadata(){return SandboxTrioLevel13.compile();},spriteInfo(){return [...decoded].map(([name,d])=>({name,w:d.w,h:d.h}));},finish(){startFlag();},sound(k){terraSound(k);},renderTerrain(){const old=state.p.x;state.p.x=-5000;render();state.p.x=old;}};
 }
 window.__sandboxTrioBuild=Object.freeze({version:'R21-physical-loot-biomes-20260913',singleExtension:true,defaultHero:'sandboxTrio',persistentMediaCache:true,playable:true,relay:false,spatialStages:false,originalEyeAtlas:true,embeddedStarter:true,mediaNeedsInternet:true,ai:'Expert behaviour reconstruction, not frame-exact',rewardRules:'Custom crossover contact-equipment exchange; not vanilla Eye drops'});
})();

/* END SANDBOX TRIO R04 */
