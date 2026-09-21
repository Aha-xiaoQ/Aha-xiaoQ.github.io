/* R15 — one in-game HUD. The canvas keeps its original 16:15 / 16:9 view.
 * No toolbar spacer, no duplicated full-width header/footer, and no combat changes.
 */
const T15_VERSION='R15 · 一体化 HUD';
const T15_BUILD='R15-integrated-hud-20260913';
const t15IconJobs=[];
for(const [k,url] of Object.entries(T15_UI_IMAGES)){
 t15IconJobs.push(new Promise(resolve=>{const im=new Image();im.onload=()=>{r06Images[k]=im;r08ImageRevision++;resolve(true);};im.onerror=()=>resolve(false);im.src=url;}));
}
const t15Style=document.createElement('style');t15Style.textContent=`
/* Retain the legacy elements for their internal handlers but remove their layout. */
body.t15-terra #t13Dock,body.t15-terra #t12Toolbar,body.t15-terra #t10Build,
body.t15-terra .screen-top,body.t15-terra .stage-tools,body.t15-terra #upgradeNotice{display:none!important}
body.t15-terra .screen-shell{width:100%!important;max-width:100%!important;margin:0 auto;padding:5px;border-radius:7px;overflow:visible}
body.t15-terra #stage{width:100%!important;height:auto!important;max-width:none!important;max-height:none!important;aspect-ratio:16/15!important;position:relative;overflow:hidden;background:#5c94fc}
body.t15-terra #stage.r05-arena{aspect-ratio:16/9!important}
body.t15-terra #stage #game{display:block;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain}
body.t15-terra #heroHelp,body.t15-terra #gamepadStatus,body.t15-terra .panel>.controls-title,
body.t15-terra .panel>.control-row,body.t15-terra .panel>.tip,body.t15-terra .panel>hr{display:none!important}
body.t15-terra #heroStatus{font-size:12px;line-height:1.75;margin:10px 0 16px;color:#b8cfca}
body.t15-terra .panel #charactersButton{width:100%;margin:0 0 12px}
body.t15-terra .panel #fullButton{font-size:12px}
body.t15-terra .panel{display:block!important}
body.t15-terra #r06SceneActions{margin-top:12px}
#t15Help{border:1px solid #344f5a;background:#13263277;border-radius:7px;margin:14px 0;padding:12px 14px;font-size:12px;line-height:1.85;color:#bfced1}
#t15Help[hidden]{display:none!important}#t15Help summary{cursor:pointer;color:#e5d4af;font-size:13px;font-weight:600}
#t15Help .t15Keys{display:grid;grid-template-columns:1fr auto;gap:9px 12px;margin-top:13px}#t15Help kbd{font-size:10px;min-width:17px;padding:2px 4px}
#t15Help p{margin:12px 0 0;color:#9fb2b8;font-size:11px;line-height:1.8}
#t15HudHits{position:absolute;left:0;top:0;z-index:5;pointer-events:none}
#t15HudHits[hidden]{display:none!important}
#t15HudHits button,#t15HudHits .t15HitInfo{position:absolute;margin:0;padding:0;background:transparent!important;border:0!important;border-radius:0;box-shadow:none!important;pointer-events:auto;min-width:0;min-height:0;touch-action:manipulation;color:transparent;font-size:0}
#t15HudHits button:focus-visible{outline:2px solid #fff0ab;outline-offset:0;background:#fff4aa18!important}
#t15HudHits button:hover{background:#fff9d915!important}
#t15HudHits .t15HitInfo{cursor:default}
.t15-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
/* Fullscreen uses all available height, not height minus an obsolete toolbar. */
body.t15-terra .screen-shell:fullscreen{display:flex;align-items:center;justify-content:center;width:100vw!important;height:100dvh!important;max-width:none!important;padding:0!important;margin:0!important;border:0!important;border-radius:0;overflow:hidden;background:#080f15}
body.t15-terra .screen-shell:fullscreen #stage{flex:none!important;width:min(100vw,106.666667dvh)!important;height:min(100dvh,93.75vw)!important;max-height:100dvh!important;max-width:100vw!important;margin:0!important;aspect-ratio:16/15!important}
body.t15-terra .screen-shell:fullscreen #stage.r05-arena{width:min(100vw,177.777778dvh)!important;height:min(100dvh,56.25vw)!important;aspect-ratio:16/9!important}
body.t15-terra .screen-shell:fullscreen #game{width:100%!important;height:100%!important;object-fit:contain}
body.t15-terra #stage:fullscreen{width:100vw!important;height:100dvh!important;display:grid;place-items:center;background:#080f15}
body.t15-terra #stage:fullscreen #game{object-fit:contain;width:100%!important;height:100%!important}
@media(max-width:850px){body.t15-terra.r05-arena .panel{display:block!important;margin-top:18px}}
@media(max-width:690px){body.t15-terra .screen-shell{padding:3px}#t15Help{margin:12px 0;padding:11px 12px}body.t15-terra #heroStatus{display:none}body.t15-terra .panel{margin-top:14px}}
@media(max-height:540px) and (orientation:landscape){body.t15-terra .layout{display:block}body.t15-terra .play-column{display:block}body.t15-terra .screen-shell{width:min(100%,calc((100dvh - 22px)*16/15))!important;margin:auto}body.t15-terra.r05-arena .screen-shell{width:min(100%,calc((100dvh - 22px)*16/9))!important}}
`;document.head.append(t15Style);
const t15Hits=document.createElement('div');t15Hits.id='t15HudHits';t15Hits.setAttribute('role','group');t15Hits.setAttribute('aria-label','道具、生命、魔力与饰品');t15Hits.hidden=true;$('stage').append(t15Hits);
const t15Slots=[];
function t15ClearPointer(){clearInput();r05CancelPointer();t13Pointer.active=t13Pointer.down=false;}
for(let i=0;i<6;i++){const b=document.createElement('button');b.type='button';b.dataset.t15Tool=String(i);b.setAttribute('aria-pressed',String(i===0));b.onpointerdown=e=>{e.stopPropagation();};b.onclick=e=>{e.preventDefault();e.stopPropagation();if(!state||mode!=='playing')return;t15ClearPointer();r06DigitTool(i);canvas.focus({preventScroll:true});render();};t15Hits.append(b);t15Slots.push(b);}
const t15HP=document.createElement('button');t15HP.type='button';t15HP.id='t15Health';t15HP.onclick=e=>{e.stopPropagation();if(mode!=='playing')return;t15ClearPointer();r06Heal();canvas.focus({preventScroll:true});render();};t15Hits.append(t15HP);
const t15MP=document.createElement('div');t15MP.className='t15HitInfo';t15MP.id='t15Mana';t15Hits.append(t15MP);
const t15Gear=document.createElement('div');t15Gear.className='t15HitInfo';t15Gear.id='t15Gear';t15Hits.append(t15Gear);
const t15Live=document.createElement('div');t15Live.className='t15-sr';t15Live.id='t15State';t15Live.setAttribute('aria-live','off');$('stage').append(t15Live);
const t15Help=document.createElement('details');t15Help.id='t15Help';t15Help.innerHTML=`<summary>操作指南</summary><div class="t15Keys">
<span>移动 / 跳跃</span><span><kbd>方向</kbd> <kbd>空格</kbd></span>
<span>六格工具 / 循环</span><span><kbd>1–6</kbd> <kbd>E</kbd></span>
<span>使用工具、武器</span><span><kbd>J</kbd> / 左键</span>
<span>铜镐向近处挖掘</span><span><kbd>4</kbd> 方向＋<kbd>J</kbd></span>
<span>手持火把 / 快速插火把</span><span><kbd>5</kbd> / <kbd>G</kbd></span>
<span>切换已有武器</span><span><kbd>Q</kbd></span>
<span>地下宝箱</span><span><kbd>L</kbd> / ↑ / 右键</span>
<span>治疗 / 上下坐骑</span><span><kbd>H</kbd> / <kbd>F</kbd></span>
<span>切坐骑 / 魔镜返程</span><span><kbd>V</kbd> / <kbd>B</kbd></span>
<span>下穿木平台 / 钻管道</span><span>↓＋空格 / ↓</span>
<span>暂停 / 重试 / 选人</span><span><kbd>P</kbd> <kbd>R</kbd> <kbd>C</kbd></span>
</div><p>左上角道具格可直接点击；鼠标悬停可查看名称和数量。点击生命区域可治疗。饰品按实际取得情况显示，未取得的不显示。</p><p>隐藏箱自动弹出供给，最后拾取右侧眼球开战。战斗中不能挖掘或返程；胜利后从原管道返回，或继续向地下探索。全屏保留原画面比例，按 Esc 可退出。</p>`;
const t15Buttons=document.querySelector('.panel .buttons');t15Buttons.before(t15Help);
const t15IconCache=new Map();
function t15Icon(g,key,x,y,size){
 if(key==='manaSymbol'){g.save();g.translate(x,y);g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=size*(i%2?.22:.5);const xx=Math.cos(a)*r,yy=Math.sin(a)*r;i?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.closePath();g.fillStyle='#8dc9ff';g.fill();g.strokeStyle='#c6eaff';g.lineWidth=.7;g.stroke();g.restore();return;}
 if(key.endsWith('Head')){const im=r06Images[key];if(!im)return;let cv=t15IconCache.get(key);if(!cv){try{const tmp=document.createElement('canvas');tmp.width=40;tmp.height=56;const t=tmp.getContext('2d');t.drawImage(im,0,0,40,56,0,0,40,56);const a=t.getImageData(0,0,40,56).data;let x0=40,y0=56,x1=0,y1=0;for(let yy=0;yy<56;yy++)for(let xx=0;xx<40;xx++)if(a[(yy*40+xx)*4+3]>20){x0=Math.min(x0,xx);y0=Math.min(y0,yy);x1=Math.max(x1,xx);y1=Math.max(y1,yy);}cv=document.createElement('canvas');cv.width=x1-x0+1;cv.height=y1-y0+1;if(cv.width<1||cv.height<1)return;cv.getContext('2d').drawImage(tmp,x0,y0,cv.width,cv.height,0,0,cv.width,cv.height);t15IconCache.set(key,cv);}catch{return;}}
  const sc=Math.min(size/cv.width,size/cv.height);g.drawImage(cv,Math.round(x-cv.width*sc/2),Math.round(y-cv.height*sc/2),cv.width*sc,cv.height*sc);return;
 }
 r06Icon(g,key,x,y,size);
}
function t15Model(s){
 const bag=s.t13Inventory||{},weapon=r06Weapon(s),kit=r06Kit(s),gear=[{key:r06Armor(s)+'Head',name:(kit?.armorName||'铂金套')+' · 防御 '+r06Defense(s)}];
 if(s.cloudJump)gear.push({key:'cloudBottle',name:'云朵瓶'});
 if(s.t13Accessories?.boots)gear.push({key:'hudBoots',name:'赫尔墨斯靴'});
 if(s.t13Accessories?.regen)gear.push({key:'hudRegen',name:'再生手环'});
 if(s.mountOwned)gear.push({key:s.mountType==='ufo'?'ufo':'slimySaddle',name:(s.mountType==='ufo'?'UFO':'史莱姆')+(s.mounted?' · 骑乘中':' · 可骑乘')});
 if(s.campfireBuff)gear.push({key:'campfireItem',name:'篝火恢复'});
 const names=[kit&&!s.t13WeaponOverride?kit.weaponName:({starfury:'星怒',stormbow:'代达罗斯风暴弓',terraBlade:'泰拉刃'}[weapon]||weapon),'木平台','铜斧','铜镐','火把','篝火'];
 const counts=[weapon==='stormbow'?bag.arrows:weapon==='sdmg'?s.ammo:null,s.wood,null,null,bag.torch,null];
 return{hp:s.hp,maxHp:s.maxHp,mana:s.mana,maxMana:s.maxMana,defense:r06Defense(s),wood:s.wood,torch:bag.torch||0,arrows:bag.arrows||0,ammo:s.ammo||0,potions:s.healPotions||0,healCooldown:s.healCooldown||0,tool:s.tool,weapon,names,counts,keys:[weapon,'wood','axe','pickaxe','torchPlaced','campfireItem'],gear,score:s.score||0,coins:s.coins||0,time:Math.max(0,Math.floor(s.time||0)),phase:s.phase,kit:s.kit,mounted:!!s.mounted};
}
function t15Layout(s){const wide=!!s.r05Arena,viewW=wide?R06_VIEW.w:W,viewH=wide?R06_VIEW.h:H,uiW=wide&&t14CanvasRect().width>=720?1024:512,unit=viewW/uiW;
 return {wide,viewW,viewH,uiW,unit,uiH:viewH/unit,height:61,slots:Array.from({length:6},(_,i)=>({x:12+i*36,y:24,w:32,h:32})),hp:{x:uiW-234,y:5,w:222,h:15},mp:{x:uiW-234,y:21,w:222,h:15},gear:{x:uiW-234,y:40,w:222,h:18}};
}
const T15_GLYPHS={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],'D':['110','101','101','101','110'],'E':['111','100','110','100','111'],'F':['111','100','110','100','100'],'K':['101','110','100','110','101'],'+':['000','010','111','010','000'],'-':['000','000','111','000','000'],'/':['001','001','010','100','100'],'×':['000','101','010','101','000'],'.':['000','000','000','000','010'],' ':['000','000','000','000','000']};
function t15Text(text,x,y,size=12,color='#f2f3e8',align='left'){
 const str=String(text).toUpperCase();ctx.save();
 if(state&&!state.r05Arena&&[...str].every(c=>T15_GLYPHS[c])){const px=2,advance=8,width=str.length*advance-2;let xx=Math.round((align==='right'?x-width:align==='center'?x-width/2:x)/2)*2,yy=Math.round(y/2)*2;ctx.fillStyle='#081e3266';for(let i=0;i<str.length;i++)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(T15_GLYPHS[str[i]][r][c]==='1')ctx.fillRect(xx+i*advance+c*px+2,yy+r*px+2,px,px);ctx.fillStyle=color;for(let i=0;i<str.length;i++)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(T15_GLYPHS[str[i]][r][c]==='1')ctx.fillRect(xx+i*advance+c*px,yy+r*px,px,px);}
 else{ctx.font=`bold ${size}px ui-monospace,Consolas,monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillStyle='#071a2cbb';ctx.fillText(str,Math.round(x)+1,Math.round(y)+1);ctx.fillStyle=color;ctx.fillText(str,Math.round(x),Math.round(y));}ctx.restore();
}
function t15Meter(q,ratio,color,light){ctx.fillStyle='#0a21347a';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.fillStyle='#52667499';ctx.fillRect(q.x,q.y,q.w,1);const n=Math.round(q.w*clamp(ratio,0,1));ctx.fillStyle=color;ctx.fillRect(q.x,q.y+1,n,q.h-1);ctx.fillStyle=light;ctx.fillRect(q.x,q.y+1,n,1);}
function t15DrawHUD(s){if(!isTrio()||!s||mode==='menu')return;
 const l=t15Layout(s),m=t15Model(s);ctx.save();ctx.scale(l.unit,l.unit);ctx.imageSmoothingEnabled=false;
 const ax=(s.p.x+s.p.w/2-(s.cam||0))/l.unit,ay=(s.p.y-(s.r05Arena?s.camY||0:s.r07CamY||0))/l.unit;
 // Fade only the panels which overlap the actor; there is no opaque full-width bar.
 const leftFade=ay<65&&ax<246?.42:1,rightFade=ay<65&&ax>l.uiW-244?.42:1;
 ctx.globalAlpha=leftFade;
 t15Text('1-3',12,5,12);t15Text(String(m.score).padStart(6,'0'),53,5,12);
 const ci=ready?classicSprite('coin0'):null;if(ci)ctx.drawImage(ci,136,6,8,12);else{ctx.fillStyle='#ffd780';ctx.fillRect(136,7,5,7);}
 t15Text('×'+String(m.coins).padStart(2,'0'),146,5,11);t15Text(String(m.time).padStart(3,'0'),223,5,12,'#f3e2b1','right');
 for(let i=0;i<6;i++){const q=l.slots[i],sel=i===m.tool;ctx.fillStyle=sel?'#27384dcc':'#1022389e';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.strokeStyle=sel?'#f3d996':'#afc6d180';ctx.lineWidth=2;ctx.strokeRect(q.x+1,q.y+1,q.w-2,q.h-2);if(sel){ctx.fillStyle='#f8de94';ctx.fillRect(q.x+3,q.y+q.h-3,q.w-6,1);}
  t15Icon(ctx,m.keys[i],q.x+q.w/2,q.y+q.h/2,23);t15Text(i+1,q.x+3,q.y+2,8,sel?'#ffe8ad':'#c0d1db');
  if(m.counts[i]!==null&&m.counts[i]!==undefined)t15Text(m.counts[i]>=1000?(Math.floor(m.counts[i]/1000)+'K'):m.counts[i],q.x+q.w-3,q.y+q.h-10,9,'#fff6d3','right');
 }
 ctx.globalAlpha=rightFade;const xx=l.uiW-230;
 t15Icon(ctx,'heart',xx+6,12,14);t15Meter({x:xx+20,y:9,w:111,h:6},m.hp/Math.max(1,m.maxHp),'#cd6370','#fac09e');t15Text(m.hp+'/'+m.maxHp,l.uiW-12,5,12,'#fff1e8','right');
 t15Icon(ctx,'manaSymbol',xx+6,28,12);t15Meter({x:xx+20,y:25,w:111,h:6},m.mana/Math.max(1,m.maxMana),'#719ce0','#c0deff');t15Text(m.mana+'/'+m.maxMana,l.uiW-12,21,12,'#d5e7ff','right');
 for(let i=0;i<m.gear.length;i++){const x=xx+7+i*23;ctx.fillStyle='#11213961';ctx.fillRect(x-9,40,18,18);t15Icon(ctx,m.gear[i].key,x,49,16);}
 t15Text('DEF '+m.defense,l.uiW-12,42,10,'#d0ddd5','right');ctx.globalAlpha=1;
 if(s.phase==='battle'&&s.eye&&!s.eye.dead){const e=s.eye,bw=l.wide?350:264,x=(l.uiW-bw)/2,y=l.uiH-31;ctx.fillStyle='#132035ad';ctx.fillRect(x,y,bw,23);ctx.strokeStyle='#b47c6470';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,bw-1,22);
  ctx.save();ctx.font='12px "Microsoft YaHei",sans-serif';ctx.textBaseline='top';ctx.fillStyle='#f1d4c3';ctx.fillText('克苏鲁之眼'+(e.phase===2?'  II':''),x+7,y+3);ctx.restore();t15Text(Math.max(0,Math.ceil(e.hp))+'/'+e.maxHp,x+bw-7,y+3,11,'#f4d6be','right');t15Meter({x:x+7,y:y+17,w:bw-14,h:4},e.hp/e.maxHp,e.phase===2?'#dc8a79':'#bd7171','#ffd4ab');
 }
 ctx.restore();s.t15Hud={hp:m.hp,maxHp:m.maxHp,mana:m.mana,maxMana:m.maxMana,gear:m.gear.map(x=>x.name),tool:m.tool,weapon:m.weapon,rows:2,view:[l.viewW,l.viewH]};
}
let t15HitSignature='',t15LabelSignature='';
function t15SetBox(el,q,scale){el.style.left=(q.x*scale)+'px';el.style.top=(q.y*scale)+'px';el.style.width=(q.w*scale)+'px';el.style.height=(q.h*scale)+'px';}
function t15Sync(s){const active=isTrio();document.body.classList.toggle('t15-terra',active);t15Help.hidden=!active;
 t15Hits.hidden=!active||!s||mode!=='playing';if(!active){t13Dock.hidden=true;t12Toolbar.hidden=true;const tip=document.querySelector('.panel .tip');if(tip)tip.hidden=false;return;}
 $('bestLabel').textContent='R15';document.querySelector('header .offline').textContent='TERRARIA · 1-3';t10Build.textContent=T15_VERSION;
 $('heroHelp').textContent='';$('fullButton').textContent='全屏';$('charactersButton').textContent='选择角色';
 const tip=document.querySelector('.panel .tip');if(tip)tip.hidden=true;
 if(!s||mode==='menu'){$('overlayText').textContent='铂金套与星怒开局。穿过主线管道，挑战克眼并探索地下矿区。';return;}
 const l=t15Layout(s),m=t15Model(s),r=t14CanvasRect(),st=$('stage').getBoundingClientRect(),scale=r.width/l.uiW;
 const geometry=[r.width,r.height,r.left-st.left,r.top-st.top,l.uiW,mode].join('|');
 if(geometry!==t15HitSignature){t15HitSignature=geometry;t15Hits.style.left=(r.left-st.left)+'px';t15Hits.style.top=(r.top-st.top)+'px';t15Hits.style.width=r.width+'px';t15Hits.style.height=r.height+'px';for(let i=0;i<6;i++)t15SetBox(t15Slots[i],l.slots[i],scale);t15SetBox(t15HP,l.hp,scale);t15SetBox(t15MP,l.mp,scale);t15SetBox(t15Gear,l.gear,scale);}
 const signature=[m.hp,m.maxHp,m.mana,m.maxMana,m.tool,m.weapon,m.wood,m.torch,m.ammo,m.arrows,m.potions,m.healCooldown>0,m.gear.map(x=>x.name).join('/')].join('|');
 if(signature!==t15LabelSignature){t15LabelSignature=signature;for(let i=0;i<6;i++){const text=m.names[i]+(m.counts[i]!==null&&m.counts[i]!==undefined?' · '+m.counts[i]:'');t15Slots[i].title=text;t15Slots[i].setAttribute('aria-label',text);t15Slots[i].setAttribute('aria-pressed',String(i===m.tool));}
  t15HP.title='生命 '+m.hp+'/'+m.maxHp+' · 治疗药水 '+m.potions;t15HP.setAttribute('aria-label',t15HP.title);t15HP.disabled=m.hp>=m.maxHp||m.potions<=0||m.healCooldown>0;
  t15MP.title='魔力 '+m.mana+'/'+m.maxMana;t15MP.setAttribute('aria-label',t15MP.title);t15Gear.title=m.gear.map(x=>x.name).join(' / ');t15Gear.setAttribute('aria-label',t15Gear.title);
  t15Live.textContent=['生命 '+m.hp+'/'+m.maxHp,'魔力 '+m.mana+'/'+m.maxMana,'当前工具 '+m.names[m.tool],'饰品 '+t15Gear.title].join('；');
 }
 $('heroStatus').textContent=(r06Kit(s)?.armorName||'铂金套')+' · '+m.names[0];
 if(s.r05Arena){$('relayMessage').textContent=s.phase==='battle'?'克苏鲁之眼':s.p.y>=T13.top+80?'地下探索':s.phase==='cleared'?'克眼已击败 · 奖励已解锁':'隐藏战场';}
 else $('relayMessage').textContent='WORLD 1-3 · 泰拉瑞亚';
}
// Restore the previously requested G shortcut without an additional screen toolbar.
function t15QuickTorch(){const s=state;if(!s||mode!=='playing'||s.t11Transition||s.ticks-(s.t15QuickTick??-999)<12)return false;s.t15QuickTick=s.ticks;
 const raw={x:s.p.x+s.p.w/2+s.p.facing*18,y:s.p.y+s.p.h-10,pointer:false,dx:s.p.facing,dy:0},target=t14ChooseTorch(s,raw);const ok=t13Place(s,target,4);if(ok)r05Persist();return ok;
}
window.addEventListener('keydown',e=>{if(!isTrio()||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;if(e.code==='KeyG'){e.preventDefault();if(!e.repeat)t15QuickTorch();}},true);
// The actual recovered R14 has 113 seed lights. Top up to the 143-light baseline
// previously delivered in this conversation without altering any terrain cells.
function t15KeepLights(w){if(!w||w.t15LightBaseline)return;for(let i=0;i<24000&&w.torches.length<143;i++){
 const c=3+Math.floor(t13Hash(i,47,15)*(w.cols-6)),r=7+Math.floor(t13Hash(i,91,15)*(w.rows-12));if(t13At(w,c,r)||t13At(w,c,r-1))continue;
 if(!t13At(w,c,r+1)&&!t13At(w,c-1,r)&&!t13At(w,c+1,r))continue;const x=c*16+8,y=T13.top+(r+1)*16;
 if(w.torches.some(t=>Math.hypot(t.x-x,t.y-y)<88)||w.chests.some(q=>Math.abs(q.x+16-x)<38&&Math.abs(q.y+q.h-y)<34))continue;w.torches.push({x,y,phase:i%8,wall:true,source:'r15-preserved-baseline'});
 }w.t15LightBaseline=true;w.revision++;}
const t15WorldBase=t13GenerateWorld;t13GenerateWorld=function(){const w=t15WorldBase();t15KeepLights(w);return w;};
const t15RoomBase=t11PrepareRoom;t11PrepareRoom=function(s){t15RoomBase(s);t15KeepLights(s.t13World);};
// The old full-width combat header/footer and help text are intentionally absent.
r07HUD=function(){};drawEquipment=function(){};drawTerraHiddenHUD=function(){};
const t15UIBase=r06UpdateUI;r06UpdateUI=function(){t15UIBase();t15Sync(state);};
const t15SelectBase=selectHero;selectHero=function(){const result=t15SelectBase.apply(this,arguments);t15Sync(state);return result;};
const t15RenderBase=render;
render=function(){const result=t15RenderBase();t15DrawHUD(state);t15Sync(state);return result;};
// Pause overlay stays short. The full instructions are outside the game canvas.
r04PauseHelp=function(){return '游戏已暂停';};
const t15PauseBase=togglePause;togglePause=function(){t15PauseBase();if(isTrio()&&mode==='paused'){$('overlayText').textContent='游戏已暂停';$('overlayHint').textContent='';}t15Sync(state);};
document.addEventListener('fullscreenchange',()=>{t15HitSignature='';if(isTrio())requestAnimationFrame(()=>render());});
window.addEventListener('resize',()=>{t15HitSignature='';});
const t15Diagnostics={version:T15_VERSION,build:T15_BUILD,ready:Promise.all(t15IconJobs),model:()=>state?t15Model(state):null,layout:()=>state?t15Layout(state):null,hud:()=>state?.t15Hud,quickTorch:t15QuickTorch,
 boxes:()=>({canvas:t14CanvasRect(),stage:(()=>{const r=$('stage').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};})(),slots:t15Slots.map(b=>{const r=b.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,pressed:b.getAttribute('aria-pressed')};})}),
 inspect:()=>({oldToolbarHidden:getComputedStyle(t13Dock).display==='none',helpOutside:!$('stage').contains(t15Help),visible:!t15Hits.hidden})};
Promise.all([readyPromise,...t15IconJobs]).then(()=>{t15Sync(state);if(isTrio())render();});

const T16_ASSET_DATA={"cart":"@@E04:uri:a175@@","rail":"@@E04:uri:a176@@"};
/* R16: ecological regions, unlimited ammunition and a closed minecart arena.
 * Original verified Mount_Minecart.png / Tiles_314.png. Circuit routing is custom.
 * The Mario platform collision geometry is preserved; only the arena lanes move.
 */
const T16_BUILD='R16-biomes-infinite-ammo-minecart-20260913';
const T16_BIOMES=[
 {id:'forest',name:'森林',sky:['#528fd2','#a1c4d7'],night:['#101a31','#2d5146'],soil:'#78614b',leaf:'#508544',mist:'#729f70'},
 {id:'desert',name:'沙漠',sky:['#aaadba','#e3c89b'],night:['#221e35','#847250'],soil:'#cca666',leaf:'#7d9252',mist:'#c4a473'},
 {id:'crimson',name:'猩红',sky:['#756875','#bb9691'],night:['#20142a','#60333e'],soil:'#9c5355',leaf:'#a6424c',mist:'#954a61'},
 {id:'jungle',name:'丛林',sky:['#488789','#add6b2'],night:['#0b2329','#205642'],soil:'#537746',leaf:'#248b48',mist:'#4c9971'},
 {id:'snow',name:'雪原',sky:['#87b5d3','#e0e8df'],night:['#182841','#567b98'],soil:'#c3d8db',leaf:'#abced2',mist:'#c3d7dc'}
];
const T16_RAIL={maxSpeed:13,acceleration:.04,brake:.20,boardingTicks:26,
 // Each side is two 45-degree slopes; no vertical rail and no upside-down car.
 points:[[384,400],[2688,400],[2928,160],[2688,-80],[384,-80],[144,160]],segments:[],length:0};
for(let i=0;i<T16_RAIL.points.length;i++){
 const a=T16_RAIL.points[i],b=T16_RAIL.points[(i+1)%T16_RAIL.points.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
 T16_RAIL.segments.push({a,b,len,start:T16_RAIL.length,dx:(b[0]-a[0])/len,dy:(b[1]-a[1])/len});T16_RAIL.length+=len;
}
const t16Ready=Promise.all(Object.entries(T16_ASSET_DATA).map(([key,url])=>new Promise(resolve=>{
 const im=new Image();im.onload=()=>{r06Images['t16'+key]=im;r08ImageRevision++;resolve(true)};im.onerror=()=>resolve(false);im.src=url;
})));
const t16SceneCache=new Map(),t16ImageIds=new WeakMap();let t16NextImage=0;
function t16BiomeAt(x,s=state){const width=s?.r05Arena?3072:2400;return T16_BIOMES[clamp(Math.floor(Math.max(0,x)/width*5),0,4)];}
function t16MixColor(a,b,t){const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16);let out='#';for(let k of [16,8,0])out+=Math.round(((x>>k)&255)*(1-t)+((y>>k)&255)*t).toString(16).padStart(2,'0');return out;}
function t16Tint(im,color,strength=.5){if(!im)return null;if(!t16ImageIds.has(im))t16ImageIds.set(im,++t16NextImage);const key=t16ImageIds.get(im)+':'+color+':'+strength;if(t16SceneCache.has(key))return t16SceneCache.get(key);
 const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=strength;g.fillStyle=color;g.fillRect(0,0,cv.width,cv.height);t16SceneCache.set(key,cv);return cv;}
function t16SetInfinite(s){if(!s)return;s.t16InfiniteAmmo=true;/* Keep JSON-safe numeric inventory values; firing never decrements them. */
 if(s.kit==='ranger'&&s.ammo<=0)s.ammo=1;if(s.t13Inventory&&s.t13Inventory.arrows<=0)s.t13Inventory.arrows=1;
}
const t16AttackBase=r06Attack;
r06Attack=function(v={}){const s=state;if(!s)return;t16SetInfinite(s);return t16AttackBase(v);};r05Attack=r06Attack;
const t16ModelBase=t15Model;
t15Model=function(s){const m=t16ModelBase(s);if(m.weapon==='stormbow'||m.weapon==='sdmg')m.counts[0]='∞';
 if(s.r05Arena&&s.t16CartOwned){m.gear=m.gear.filter(g=>!['ufo','slimySaddle','t16cart'].includes(g.key));m.gear.push({key:s.mounted&&s.mountType==='minecart'?'t16cart':s.mountType==='ufo'?'ufo':s.slimeOwned?'slimySaddle':'t16cart',name:s.mounted&&s.mountType==='minecart'?'矿车 · 巡航中':'矿车轨道可骑乘'});}return m;};
// The infinity symbol uses the normal UI font, not the narrow legacy 3px glyphs.
function t16RailPoint(distance){const d=((distance%T16_RAIL.length)+T16_RAIL.length)%T16_RAIL.length;const seg=T16_RAIL.segments.find(a=>d<a.start+a.len)||T16_RAIL.segments.at(-1),u=(d-seg.start)/seg.len;return{x:seg.a[0]+(seg.b[0]-seg.a[0])*u,y:seg.a[1]+(seg.b[1]-seg.a[1])*u,dx:seg.dx,dy:seg.dy,d,segment:T16_RAIL.segments.indexOf(seg)};}
function t16NearestRail(x,y){let best=null;for(const seg of T16_RAIL.segments){const t=clamp(((x-seg.a[0])*seg.dx+(y-seg.a[1])*seg.dy)/seg.len,0,1),px=seg.a[0]+seg.dx*t*seg.len,py=seg.a[1]+seg.dy*t*seg.len,dist=Math.hypot(x-px,y-py);if(!best||dist<best.dist)best={x:px,y:py,dist,d:seg.start+t*seg.len};}return best;}
function t16Init(s){if(!s)return;t16SetInfinite(s);s.t16Biome=t16BiomeAt(s.p.x,s).id;if(s.r05Arena){s.t16CartOwned=true;s.t16Cart=s.t16Cart||{on:false,d:16,speed:0,dir:1,laps:0,total:0,keys:0,board:0};}
 if(!s.t16Ecology){s.t16Ecology=true;
 if(!s.r05Arena)for(const q of s.level.surfaces.filter(q=>q.type==='tree'&&q.w>=64&&q.y>=90&&q.x>=260&&q.x<2110)){const x=q.x+Math.min(q.w-18,Math.max(18,q.w*.42));if(!(s.trees||[]).some(t=>Math.abs(t.x-x)<48)){const visualH=Math.max(30,Math.min(60,q.y-36));s.trees.push({id:'t16-plant-'+q.id,x,y:q.y,h:visualH,visualH,variant:'forest',hp:3,t13Cut:0,t13Gone:false,shake:0,fall:0,rewarded:false});}}
 for(const t of s.trees||[]){t.t16Biome=t16BiomeAt(t.x,s).id;t.variant=t.t16Biome==='snow'?'boreal':t.t16Biome==='jungle'?'forest2':'forest';}
  for(const e of s.foes||[])t16AdaptFoe(e,s);
 }
}
function t16AdaptFoe(e,s){if(!e||['goomba','koopa'].includes(e.kind))return;const b=t16BiomeAt(e.spawnX??e.x,s);e.t16Biome=b.id;
 if(e.kind==='slime')e.skin=b.id==='desert'?'sand':b.id==='crimson'?'crimson':b.id==='jungle'?'jungle':b.id==='snow'?'ice':'green';
 if(e.flying){e.t16Flight=b.id==='desert'?'swoop':b.id==='crimson'?'charge':b.id==='jungle'?'flutter':b.id==='snow'?'glide':'normal';}
}
const t16NewBase=newState;newState=function(){const s=t16NewBase();t16Init(s);return s;};
const t16RoomBase=t11PrepareRoom;
t11PrepareRoom=function(s){t16RoomBase(s);
 // The old cloud question tile is no longer drawn after the chest replacement.
 // Remove its stale solid collider rather than letting an invisible block stop UFOs.
 s.level.surfaces=s.level.surfaces.filter(q=>q.id!=='arena-cloud-question');
 s.t16Ecology=false;t16Init(s);
 s.t16Cart={on:false,d:16,speed:0,dir:1,laps:0,total:0,keys:0,board:0};
 // Boarding platform is the rail itself. No block is added to the mining grid.
 for(const [id,x,y,w] of [['t16-rail-lower',384,400,2304],['t16-rail-upper',384,-80,2304]])if(!s.level.surfaces.some(q=>q.id===id))s.level.surfaces.push({id,x,y,w,h:3,oneWay:true,permanent:true,type:'rail'});
};
function t16Board(reason='manual',range=112){const s=state;if(!s?.r05Arena||mode!=='playing'||s.t11Transition||s.t13Recalling)return false;t16Init(s);const p=s.p,q=t16NearestRail(p.x+p.w/2,p.y+p.h);if(q.dist>range)return false;
 const box={x:q.x-p.w/2,y:q.y-42,w:p.w,h:42};if(t13PhysicalSurfaces(s,box).some(a=>a.solid&&near(box,a)))return false;
 const oldFoot=p.y+p.h,oldX=p.x+p.w/2;r07SetMountHeight(s,false);s.t10PendingMount=null;s.mounted=true;s.mountType='minecart';s.mountOwned=true;
 const cart=s.t16Cart;Object.assign(cart,{on:true,d:q.d,speed:Math.max(2,Math.abs(p.vx)),dir:1,wantedDir:0,keys:0,board:T16_RAIL.boardingTicks,from:{x:oldX,y:oldFoot},reason});
 p.hurtLock=0;p.grounded=true;p.vy=0;p.support='t16-rail';p.buffer=0;p.drop=0;p.cloudAvailable=!!s.cloudJump;evt('t16-board',{reason,x:q.x,y:q.y});return true;
}
function t16Leave(jump=false){const s=state;if(!s?.t16Cart?.on)return false;const p=s.p,cart=s.t16Cart,pt=t16RailPoint(cart.d);cart.on=false;cart.board=0;s.mounted=false;s.mountType=s.ufoOwned?'ufo':s.slimeOwned?'slime':null;s.mountOwned=!!(s.ufoOwned||s.slimeOwned||s.t16CartOwned);
 p.h=42;p.x=pt.x-p.w/2;p.y=pt.y-p.h;p.vx=clamp(pt.dx*cart.speed*cart.dir,-7,7);p.vy=jump?-7.3:2;p.drop=18;p.dropRow=pt.y;p.grounded=false;p.support=null;p.buffer=p.coyote=0;p.jumpHeld=0;s.t16BoardLock=20;evt('t16-dismount',{jump});return true;
}
const t16MountBase=r06ToggleMount;
r06ToggleMount=function(){const s=state;if(s?.r05Arena){if(s.t16Cart?.on)return t16Leave();if(!s.mounted&&t16Board())return true;}return t16MountBase();};
$('r06Mount').onclick=()=>{r06ToggleMount();canvas.focus({preventScroll:true});render();};
const t16CycleBase=r07CycleMount;
r07CycleMount=function(){const s=state;if(!s?.r05Arena)return t16CycleBase();const opts=['minecart',...(s.slimeOwned?['slime']:[]),...(s.ufoOwned?['ufo']:[])],next=opts[(opts.indexOf(s.mountType)+1)%opts.length];if(s.t16Cart?.on)t16Leave();else if(s.mounted){s.mounted=false;r07SetMountHeight(s,false);}s.t10PendingMount=null;if(next==='minecart')return t16Board('cycle');s.mountType=next;return t10RequestMount(s,next,'cycle');};
const t16ApplyMountBase=t10ApplyMount;
t10ApplyMount=function(s){if(s?.t16Cart?.on&&s.t10PendingMount){s.t16Cart.on=false;s.t16Cart.board=0;}return t16ApplyMountBase(s);};
const t16SummonBase=r05Summon;
r05Summon=function(){const ok=t16SummonBase();if(ok&&state?.r05Arena){t16Init(state);t16Board('eye-pickup',140);}return ok;};
const t16PhysicsBase=r05Physics;
r05Physics=function(v){const s=state,p=s.p,cart=s.t16Cart;if(!cart?.on||!s.mounted||s.mountType!=='minecart'){if(cart)cart.on=false;return t16PhysicsBase(v);}
 if(v.jumpEdge){t16Leave(true);return t16PhysicsBase({...v,jumpEdge:false});}
 for(const k of ['invuln','hurtLock','cooldown','drop'])if(p[k]>0)p[k]--;
 const oldX=p.x,oldY=p.y,pt=t16RailPoint(cart.d);let x=pt.x,y=pt.y;
 if(cart.board>0){const u=1-(--cart.board)/T16_RAIL.boardingTicks,e=u*u*(3-2*u);x=cart.from.x+(pt.x-cart.from.x)*e;y=cart.from.y+(pt.y-cart.from.y)*e;}
 else{
  // Tap a direction to set travel; releasing the key keeps cruising. Down brakes.
  const k=Math.sign(v.x||0);if(k&&k!==cart.keys){const axis=Math.sign(pt.dx)||1;cart.wantedDir=k*axis;}
  cart.keys=k;const reversing=cart.wantedDir&&cart.wantedDir!==cart.dir;const tip=Math.min(Math.abs(cart.d-(2304+Math.hypot(240,240))),Math.abs(cart.d-(4608+3*Math.hypot(240,240))));const target=v.y>.5||reversing?0:tip<65?8.5:T16_RAIL.maxSpeed;cart.speed=approach(cart.speed,target,target<cart.speed?T16_RAIL.brake:T16_RAIL.acceleration);if(reversing&&cart.speed<.01){cart.dir=cart.wantedDir;cart.wantedDir=0;}
  // Original pressure/booster rail section beside the boarding point gets the cart moving.
  if(cart.d<160&&cart.speed<9&&!v.y&&!reversing)cart.speed=Math.min(9,cart.speed+.16);
  const delta=cart.speed*cart.dir,old=cart.d;cart.d=(cart.d+delta+T16_RAIL.length)%T16_RAIL.length;cart.total+=Math.abs(delta);cart.laps=Math.floor(cart.total/T16_RAIL.length);if(Math.abs(cart.d-old)>T16_RAIL.length/2)evt('t16-rail-lap',{laps:cart.laps});const next=t16RailPoint(cart.d);x=next.x;y=next.y;
 }
 p.x=x-p.w/2;p.y=y-p.h;p.vx=p.x-oldX;p.vy=p.y-oldY;p.grounded=true;p.support='t16-rail';p.cloudAvailable=!!s.cloudJump;p.walk+=Math.abs(p.vx)*.8;
 if(!p.attack&&!v.action&&Math.abs(p.vx)>.1)p.facing=Math.sign(p.vx);
 s.cam=approach(s.cam,clamp(x-R06_VIEW.w*.44,0,3072-R06_VIEW.w),Math.abs(p.vx)+5);r05SyncPointer();
};
const t16RecallBase=t13Recall;t13Recall=function(){if(state?.phase!=='battle'&&state?.t16Cart?.on)t16Leave();return t16RecallBase();};
const t16RetryBase=retry;retry=function(){if(state?.t16Cart)state.t16Cart.on=false;return t16RetryBase();};
const t16FootBase=t10BodyFoot;t10BodyFoot=function(s,foot,scale){if(s?.mounted&&s.mountType==='minecart')return foot-8*scale;return t16FootBase(s,foot,scale);};
function t16DrawCart(s,c,parked=false){const im=r06Images.t16cart;if(!im)return;const p=s.p,pt=t16RailPoint(s.t16Cart?.d??16),x=parked?pt.x:p.x+p.w/2,y=parked?pt.y:p.y+p.h;
 const moving=!parked&&s.t16Cart.speed>.3,frame=moving?Math.floor(s.t16Cart.total/9)%3:0;const dir=Math.sign(pt.dx*(s.t16Cart?.dir||1))||1,angle=Math.atan2(pt.dy,Math.abs(pt.dx))*Math.sign(pt.dx);
 ctx.save();ctx.translate(Math.round(x-c),Math.round(y));ctx.rotate(clamp(angle,-Math.PI/4,Math.PI/4));ctx.scale(dir,1);ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,frame*34,50,34,-25,-32,50,34);ctx.restore();
}
const t16MountDrawBase=r06DrawMount;r06DrawMount=function(s,c){if(s.mounted&&s.mountType==='minecart')return;return t16MountDrawBase(s,c);};
const t16BodyBase=r06DrawBody;
r06DrawBody=function(g,x,foot,face,walk=0,air=false,attack=0,tool=0,opacity=1,armor='platinum',weapon='starfury',scale=.75){const cart=state?.mounted&&state.mountType==='minecart';t16BodyBase(g,x,foot,face,cart?0:walk,cart?true:air,attack,tool,opacity,armor,weapon,scale);if(cart&&g===ctx)t16DrawCart(state,state.cam);};
function t16DrawRails(s){const im=r06Images.t16rail;if(!im)return;const c=s.cam,yc=s.camY||0;ctx.save();ctx.imageSmoothingEnabled=false;
 for(const seg of T16_RAIL.segments){const horizontal=Math.abs(seg.dy)<.1;const count=Math.round(Math.abs(seg.b[0]-seg.a[0])/16);for(let i=0;i<count;i++){
  const u=(i+.5)/count,x=seg.a[0]+(seg.b[0]-seg.a[0])*u,y=seg.a[1]+(seg.b[1]-seg.a[1])*u;if(x<c-24||x>c+R06_VIEW.w+24||y<yc-24||y>yc+R06_VIEW.h+24)continue;
  const rising=seg.dy/seg.dx<0;const sx=horizontal?18:rising?18:0,sy=horizontal?0:54;ctx.drawImage(im,sx,sy,16,16,Math.round(x-c-8),Math.round(y-8),16,16);
  if(horizontal&&y===400&&x>384&&x<544&&i%2===0)ctx.drawImage(im,36,126,16,16,Math.round(x-c-8),Math.round(y-8),16,16);
 }}
 // Native junction cels join opposite slopes at the endpoints.
 for(const [x,y]of [[144,160],[2928,160]])if(x>c-32&&x<c+R06_VIEW.w+32)ctx.drawImage(im,0,36,32,16,x-c-16,y-8,32,16);
 if(!s.t16Cart?.on)t16DrawCart(s,c,true);ctx.restore();
}
function t16Cactus(g,x,y,h,t=0){const q=Math.max(2,Math.round(h/28));g.save();g.translate(Math.round(x),Math.round(y));g.scale(q/2,q/2);g.fillStyle='#284f37';g.fillRect(-5,-h*2/q,10,h*2/q);g.fillStyle='#708e4e';g.fillRect(-3,-h*2/q+2,6,h*2/q-2);g.fillStyle='#a6ae64';g.fillRect(-3,-h*2/q+4,2,h*2/q-8);
 g.fillStyle='#3b6340';g.fillRect(3,-33,14,7);g.fillRect(12,-49,6,22);g.fillRect(-17,-21,14,7);g.fillRect(-18,-35,6,20);g.fillStyle='#b4b67b';for(let i=8;i<h*2/q;i+=9){g.fillRect(-6,-i,2,1);g.fillRect(4,-i-3,2,1);}g.restore();}
const t16TreeBase=t12DrawTree;
t12DrawTree=function(g,t,c=0,scale=1){const b=T16_BIOMES.find(a=>a.id===(t.t16Biome||t16BiomeAt(t.x).id))||T16_BIOMES[0];if(b.id==='forest'||b.id==='snow')return t16TreeBase(g,{...t,variant:b.id==='snow'?'boreal':t.variant},c,scale);
 if(t.hp<=0&&t.fall>=42)return t16TreeBase(g,t,c,scale);const h=t.visualH||70;if(b.id==='desert'){g.save();if(t.shake)g.translate(Math.sin(t.shake)*1.5,0);t16Cactus(g,t.x-c,t.y,h*scale);g.restore();return;}
 const original=r06Images['t12Tree_'+(b.id==='jungle'?'forest2':'forest')]||t12TreeImage(b.id==='jungle'?'forest2':'forest');const im=t16Tint(original,b.leaf,b.id==='crimson'?.58:.25),width=im.width/im.height*h*scale;
 g.save();g.translate(Math.round(t.x-c),Math.round(t.y));if(t.shake)g.rotate(Math.sin(t.shake)*.03);g.drawImage(im,-width/2,-h*scale,width,h*scale);
 if(b.id==='jungle'){g.strokeStyle='#316746';g.lineWidth=2*scale;for(let i=0;i<4;i++){const x=(i-1.5)*width*.18;g.beginPath();g.moveTo(x,-h*.70*scale);g.quadraticCurveTo(x+6,-h*.4*scale,x-2,-h*.12*scale);g.stroke();g.fillStyle='#54a35a';for(let j=0;j<4;j++)g.fillRect(x+(j%2?1:-4),-h*(.58-j*.12)*scale,5*scale,2*scale);}}
 else{g.fillStyle='#d77b73';for(let i=0;i<5;i++)g.fillRect((i-2)*width*.11,-h*(.55+(i%3)*.08)*scale,3*scale,2*scale);}g.restore();};
function t16DrawSky(s,arena=false){const w=arena?R06_VIEW.w:W,h=arena?R06_VIEW.h:H,b=t16BiomeAt(s.p.x+s.p.w/2,s),pal=arena?b.night:b.sky;ctx.save();const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,pal[0]);grad.addColorStop(1,pal[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 if(arena){for(let i=0;i<70;i++){ctx.fillStyle=i%4?'#aec2cf88':'#dce5cfcc';ctx.fillRect(Math.round(((i*179-s.cam*.03)%w+w)%w),18+(i*i*23)%Math.max(100,h*.55),1,1);}const moon=r06Images.t12Moon;if(moon)ctx.drawImage(moon,0,0,Math.min(moon.width,50),Math.min(moon.width,50),w*.78-s.cam*.012,70,46,46);}
 for(let layer=0;layer<3;layer++){const py=arena?Math.min(130,(s.camY+96)*.10):Math.min(24,(s.r07CamY||0)*.12),base=h*(.68+layer*.10)-py,step=arena?70:35,origin=Math.floor(s.cam*.07/step)-2;ctx.fillStyle=t16MixColor(pal[1],b.leaf,.22+layer*.12);ctx.beginPath();ctx.moveTo(0,h);for(let x=-20;x<w+30;x+=10){const v=x+s.cam*(.015+layer*.03);const yy=base+Math.sin(v*.016+layer)*h*.04+Math.sin(v*.036)*h*.024;ctx.lineTo(x,Math.round(yy));}ctx.lineTo(w,h);ctx.fill();
  if(b.id!=='desert'){ctx.save();ctx.globalAlpha=.18+layer*.10;for(let i=origin;i<origin+w/step+5;i++){const xx=i*step-s.cam*(.04+layer*.04),ht=(arena?100:34)*(1+t12Noise(i,layer)*.8);const im=t12TreeImage(b.id==='snow'?'boreal':b.id==='jungle'?'forest2':'forest');ctx.drawImage(t16Tint(im,b.leaf,.55),Math.round(xx),Math.round(base-ht),Math.round(ht*.6),Math.round(ht));}ctx.restore();}}
 ctx.restore();}
t12Background=function(s){t16DrawSky(s,true);};
// A native Mario cap stays 16 px high. Region palettes do not change collision widths.
function t16DrawMainTerrain(s){const c=s.cam,vis=s.level.surfaces.filter(q=>q.x<c+W+90&&q.x+q.w>c-90),bottom=Math.max(336,H+(s.r07CamY||0)+48);
 for(const q of vis)if(q.type==='tree'){const left=q.x+16,width=q.w-32,b=t16BiomeAt(q.x+q.w/2,s);if(width<=0)continue;const im=b.id==='forest'?tiles13.trunk:t16Tint(tiles13.trunk,b.soil,b.id==='snow'?.65:.40);for(let x=left;x<left+width;x+=8)for(let y=q.y+16;y<bottom;y+=8)ctx.drawImage(im,0,0,Math.min(8,left+width-x),8,Math.round(x-c),y,Math.min(8,left+width-x),8);}
 for(const t of s.trees||[])drawChopTree(t,c);
 for(const q of vis.slice().sort((a,b)=>a.y-b.y)){if(q.type==='tree'){for(let dx=0;dx<q.w;dx+=16){const width=Math.min(16,q.w-dx),b=t16BiomeAt(q.x+dx,s),src=tiles13[dx===0?'treeLeft':dx+16>=q.w?'treeRight':'treeMid'],im=b.id==='forest'?src:t16Tint(src,b.id==='crimson'?b.leaf:b.soil,b.id==='snow'?.74:.55);ctx.drawImage(im,0,0,width,16,Math.round(q.x+dx-c),q.y,width,16);}}
  else for(let x=q.x;x<q.x+q.w;x+=16)for(let y=q.y;y<q.y+q.h;y+=16){sprite(q.type==='floor'?'ground':'stone',x-c,y);const b=t16BiomeAt(x,s);if(b.id!=='forest'){ctx.save();ctx.globalAlpha=b.id==='snow'?.48:.28;ctx.fillStyle=b.soil;ctx.fillRect(x-c,y,16,16);ctx.restore();}}}
 for(const t of s.t14Torches||[])if(t.x-c> -25&&t.x-c<W+25){ctx.save();ctx.translate(t.x-c,t.y);ctx.scale(.75,.75);r07Furniture('torch',0,0,s.ticks,t.phase||0);ctx.restore();}
}
drawTerraTerrain=function(s){if(s.secret)return drawTerraArenaTerrain(s);t16DrawMainTerrain(s);};
const t16WorldDrawBase=t13DrawWorld;
t13DrawWorld=function(s){t16WorldDrawBase(s);const w=s.t13World,c=s.cam,yc=s.camY||0;
 ctx.save();for(let x=Math.max(0,Math.floor(c/16));x<Math.min(w.cols,Math.ceil((c+R06_VIEW.w)/16));x++){const b=t16BiomeAt(x*16,s);if(b.id==='forest')continue;for(let y=Math.max(0,Math.floor((yc-T13.top)/16));y<Math.min(w.rows,Math.ceil((yc+R06_VIEW.h-T13.top)/16));y++){const tile=t13At(w,x,y);if(!tile)continue;ctx.globalAlpha=tile>=3?.14:b.id==='snow'?.50:.34;ctx.fillStyle=b.soil;ctx.fillRect(x*16-c,T13.top+y*16,16,16);}}
 ctx.globalAlpha=1;ctx.restore();t16DrawRails(s);
};
// Recognisable biome motion and original sprite silhouettes; no additional Mario cameos.
const t16FoeDrawBase=t10DrawFoe;
t10DrawFoe=function(e,c){if(!e.t16Biome)return t16FoeDrawBase(e,c);let src,fw,fh,count,angle=0;const b=T16_BIOMES.find(a=>a.id===e.t16Biome);
 if(e.kind==='slime'){src=t10SlimeOriginal||photos.slime;fw=32;fh=26;count=2;}
 else if(e.kind==='caveBat'){src=r06Images.caveBat;fw=44;fh=40;count=4;}
 else if(e.kind==='demonEye'){src=r06Images.demonEye;fw=38;fh=24;count=2;}
 else if(e.kind==='zombie'){src=r06Images.zombie;fw=38;fh=48;count=3;}
 else return t16FoeDrawBase(e,c);if(!src||!b)return t16FoeDrawBase(e,c);
 const col=b.id==='desert'?'#d3a255':b.id==='crimson'?'#c55261':b.id==='snow'?'#c2e5ff':b.id==='jungle'?'#53b955':null;
 if(!col)return t16FoeDrawBase(e,c);const im=t16Tint(src,col,b.id==='snow'?.45:.47),f=e.kind==='slime'?(e.grounded?Math.floor(e.age/12)%2:1):Math.floor(e.age/(e.kind==='caveBat'?5:8))%count;
 ctx.save();ctx.translate(Math.round(e.x+e.w/2-c),Math.round(e.y+e.h));ctx.scale(e.dir<0?.75:-.75,.75);ctx.drawImage(im,0,f*fh,fw,fh,-fw/2,-fh+2,fw,fh);ctx.restore();return true;
};
const t16EnemiesBase=updateEnemies;
updateEnemies=function(ss){t16EnemiesBase(ss);const s=state;for(const e of s.foes||[]){if(e.dead||!e.active||!e.flying||e.knock>0)continue;const dx=s.p.x-e.x,dy=s.p.y-e.y;
 if(e.t16Flight==='swoop'&&e.age%170>120){e.vx=approach(e.vx,Math.sign(dx)*2.7,.06);e.vy=approach(e.vy,Math.sign(dy)*2.2,.04);}
 if(e.t16Flight==='charge'&&e.age%160===0){e.vx=Math.sign(dx)*3.2;e.vy=clamp(dy*.015,-2.4,2.4);e.knock=18;}
 if(e.t16Flight==='flutter')e.y+=Math.sin(e.age*.15)*.35;
 }};
function t16Weather(s){const b=t16BiomeAt(s.p.x,s),arena=!!s.r05Arena,w=arena?R06_VIEW.w:W,h=arena?R06_VIEW.h:H;if(!['snow','crimson','jungle','desert'].includes(b.id))return;ctx.save();ctx.globalAlpha=b.id==='snow'?.62:.25;ctx.fillStyle=b.id==='snow'?'#eaf7ff':b.id==='crimson'?'#e8a09a':b.id==='jungle'?'#b7d896':'#f6daa0';for(let i=0;i<(arena?25:12);i++){const speed=b.id==='desert'?1.1:.2,xx=((i*73+s.ticks*speed-s.cam*.12)%w+w)%w,yy=(i*39+s.ticks*(b.id==='snow'?.32:.11))%h;if(yy<34)continue;ctx.fillRect(Math.round(xx),Math.round(yy),b.id==='desert'?3:1,1);}ctx.restore();}
const t16SyncBase=t15Sync;
t15Sync=function(s){t16SyncBase(s);if(!isTrio())return;$('bestLabel').textContent='R16';document.querySelector('header .offline').textContent='TERRARIA · 1-3';t10Build.textContent='R16 · 五区生态 / 循环矿车';if(s){$('relayMessage').textContent=t16BiomeAt(s.p.x,s).name+(s.t16Cart?.on?' · 矿车巡航':s.phase==='battle'?' · 克苏鲁之眼':s.r05Arena?' · 隐藏矿区':' · WORLD 1-3');}}
const t16BaseStep=step;
step=function(v){const s=state;if(s)t16SetInfinite(s);const out=t16BaseStep(v);if(state===s&&s){if(s.t16Cart?.on&&(!s.mounted||s.mountType!=='minecart'||mode==='dying'))s.t16Cart.on=false;s.t16Biome=t16BiomeAt(s.p.x,s).id;}return out;};
// Small mount action in the existing outside panel; never a new game-screen strip.
const t16CartButton=document.createElement('button');t16CartButton.id='t16CartButton';t16CartButton.textContent='矿车 / F';t16CartButton.type='button';t16CartButton.style.cssText='font:inherit;font-size:12px;margin:8px 0;padding:7px 12px;border:1px solid #60778a;border-radius:5px;background:#223745;color:#eee3c2;cursor:pointer';t15Help.before(t16CartButton);t16CartButton.onclick=()=>{t15ClearPointer();r06ToggleMount();canvas.focus({preventScroll:true});render();};
const t16RenderBase=render;
render=function(){const out=t16RenderBase();if(isTrio()&&state&&mode!=='menu'){t16Weather(state);t15DrawHUD(state);}t16CartButton.hidden=!isTrio()||!state?.r05Arena||mode==='menu';if(state?.t16Cart?.on)t16CartButton.textContent='矿车下车 / F';else t16CartButton.textContent='矿车上车 / F';return out;};
t15Help.insertAdjacentHTML('beforeend','<p><b>R16：</b>箭矢、子弹无限（∞）；木材、火把、药水和魔力仍照常消耗。隐藏场四层木台整体上移一层；最右眼球拾取后自动登上轨道矿车。靠近轨道按 F 也可上车，松开方向键保持巡航，↓刹车，轻按左右改变行驶方向，空格跳车，F 下车。J / 左键边行驶边射击。获胜后按 F 下车，到地面拾取套装；接触奖励仍自动骑上 UFO。矿车不提供无敌。循环线路是本混合关卡的自定义连接，使用原版矿车及轨道图。</p>');
const t16Diagnostics={build:T16_BUILD,ready:t16Ready,biomes:T16_BIOMES,rail:T16_RAIL,point:t16RailPoint,nearest:t16NearestRail,board:t16Board,leave:t16Leave,
 inspect:()=>state?{biome:t16BiomeAt(state.p.x,state).id,infiniteAmmo:state.t16InfiniteAmmo,cart:state.t16Cart,rows:state.level.surfaces.filter(q=>q.id.startsWith('r07-lane')).map(q=>q.y),ammo:state.ammo,arrows:state.t13Inventory?.arrows}:null};

const T17_ASSET_DATA={"cactus": "@@E04:uri:a177@@"};
let t20Device='keyboard',t20LastLs=[0,0],t20LeftAim=[1,0];
function t20Own(device){if(device===t20Device)return;t20Device=device;pending={};prev={};
 if(device==='gamepad'){t17Input.mouseDown=false;t13Pointer.down=r05Pointer.down=r05Pointer.pressed=false;t17Input.source='gamepad';t17Input.explicit=false;}
 else if(t13Pointer.active&&t17Input.lastMouse){t17Input.source='mouse';t17Input.explicit=true;}else{t17Input.source='facing';t17Input.explicit=false;}
}
/* R17 — one shared input/aim path. No enemy query occurs in player aiming.
 * Standard Gamepad: LS move, RS aim, RT use, A/LT jump, X interact,
 * B mount, LB/RB tools, Y weapon, R3 mount type, L3 heal, Back mirror.
 * Existing projectile/minion homing is intentionally not removed.
 */
const T17_BUILD='R17-controller-mouse-20260913';
const t17Input={buttons:[],previous:[],blocked:new Set(),keyBlocked:new Set(),axes:[0,0,0,0],connected:false,index:null,id:null,source:'facing',explicit:false,dx:1,dy:0,radius:1,mouseDown:false,mouseBlocked:false,inactive:false,menuDir:0,menuRepeat:0,dialogIndex:0,mode:null,deadzone:.22,lastMouse:null,lastState:null};
const t17Keys=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','Space','KeyK','KeyZ','KeyJ','KeyX','ShiftLeft','ShiftRight','KeyL','KeyE','KeyC','KeyP','Escape','KeyR','Enter','KeyQ','KeyF','KeyV','KeyB','KeyH','KeyG','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','BracketLeft','BracketRight']);
function t17Stick(x,y,d=t17Input.deadzone){x=Number.isFinite(x)?clamp(x,-1,1):0;y=Number.isFinite(y)?clamp(y,-1,1):0;const len=Math.hypot(x,y);if(len<=d)return [0,0];const m=Math.min(1,(len-d)/(1-d));return [x/len*m,y/len*m];}
function t17Pressed(b){return !!b?.pressed||(Number(b?.value)||0)>.28;}
function t17MaskHeld(){for(let i=0;i<t17Input.buttons.length;i++)if(t17Input.buttons[i])t17Input.blocked.add(i);for(const k of held)t17Input.keyBlocked.add(k);t17Input.mouseBlocked=t17Input.mouseDown;t17Input.mouseDown=false;t13Pointer.down=false;r05Pointer.down=r05Pointer.pressed=false;pending={};}
function t17ResetActions(){t17MaskHeld();held.clear();keys.clear();touch.clear();pending={};prev={};r05CancelPointer();t13Pointer.down=false;}
function t17Action(i){return !!t17Input.buttons[i]&&!t17Input.blocked.has(i);}
function t17Edge(i){return t17Action(i)&&!t17Input.previous[i];}
function t17SetAim(dx,dy,source){const n=Math.hypot(dx,dy);if(n<.001)return;t17Input.dx=dx/n;t17Input.dy=dy/n;t17Input.radius=Math.min(1,n);t17Input.source=source;t17Input.explicit=true;}
function t17PrepareState(s){if(t17Input.lastState===s)return;t17Input.lastState=s;t17Input.explicit=false;t17Input.source='facing';t17Input.dx=s?.p?.facing||1;t17Input.dy=0;t17Input.radius=1;t17Input.mouseDown=false;r05Pointer.down=r05Pointer.pressed=t13Pointer.down=false;/* Transition handlers mask held actions; do not eat fresh first-frame movement. */}
function t17AimPoint(s,v={},tools=false){
 const p=s.p,sc=t10Scale(s),origin={x:p.x+p.w/2,y:p.y+p.h/2};
 // Direct test/virtual input and normal pad input use the same mathematical path.
 if(Math.hypot(v.aimX||0,v.aimY||0)>.2)t17SetAim(v.aimX,v.aimY,'stick');
 if(t17Input.source==='mouse'&&t17Input.explicit&&t13Pointer.active){r05SyncPointer();return {x:t13Pointer.x,y:t13Pointer.y,source:'mouse',pointer:true};}
 let dx=t17Input.dx,dy=t17Input.dy;
 if(!t17Input.explicit){dx=v.x||p.facing;dy=v.y||0;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;}
 const reach=tools?52*sc:260*sc;
 return {x:origin.x+dx*reach,y:origin.y+dy*reach,dx,dy,source:t17Input.explicit?t17Input.source:'facing',pointer:false};
}
r05Aim=function(v={}){const s=state,p=s.p,target=t17AimPoint(s,v),dx=target.x-p.x-p.w/2,dy=target.y-p.y-p.h/2;return {angle:Math.atan2(dy,Math.abs(dx)),facing:Math.abs(dx)>.001?Math.sign(dx):p.facing,source:target.source,target};};
t13Aim=function(s,v={}){const a=r05Aim(v);s.p.attackFacing=s.p.facing=a.facing;s.p.aim=a.angle;s.p.attackSource=a.source;return {x:a.target.x,y:a.target.y};};
// Smart mining selects the nearest reachable cell in the manually chosen direction;
// it never changes an attack target, and mouse clicks retain exact-cell selection.
const t17RawBase=t14RawTarget;
t14RawTarget=function(s,v={}){if(!t17Input.explicit&&!Math.hypot(v.aimX||0,v.aimY||0))return t17RawBase(s,v);const a=t17AimPoint(s,v,true);if(a.pointer)return a;const dx=Math.abs(a.dx)>.3?Math.sign(a.dx):0,dy=Math.abs(a.dy)>.3?Math.sign(a.dy):0;return {...a,dx,dy,pointer:s.tool!==3};};
// No unsolicited boarding when the summon item is collected.
r05Summon=function(){const ok=t16SummonBase();if(ok&&state?.r05Arena)t16Init(state);return ok;};
// A minecart is a persistent object on the rail, not an inventory teleport.
t16Board=function(reason='manual',range=112){
 const s=state;if(!s?.r05Arena||mode!=='playing'||s.t11Transition||s.t13Recalling)return false;t16Init(s);const cart=s.t16Cart,p=s.p;
 if(cart.on)return true;if((s.t16BoardLock||0)>0)return false;
 const q=t16RailPoint(cart.d),distance=Math.hypot(q.x-p.x-p.w/2,q.y-p.y-p.h);
 if(distance>range)return false;const box={x:q.x-p.w/2,y:q.y-42,w:p.w,h:42};if(t13PhysicalSurfaces(s,box).some(a=>a.solid&&near(box,a)))return false;
 const from={x:p.x+p.w/2,y:p.y+p.h};r07SetMountHeight(s,false);s.t10PendingMount=null;s.mounted=true;s.mountType='minecart';s.mountOwned=true;
 Object.assign(cart,{on:true,speed:Math.max(2,Math.min(5,Math.abs(p.vx))),dir:cart.dir||1,wantedDir:0,keys:0,board:distance>22?T16_RAIL.boardingTicks:0,from,reason});
 p.h=42;p.hurtLock=0;p.grounded=true;p.vy=0;p.support='t16-rail';p.buffer=0;p.drop=0;p.cloudAvailable=!!s.cloudJump;
 if(!cart.board){p.x=q.x-p.w/2;p.y=q.y-p.h;}evt('t17-board',{reason,d:cart.d});return true;
};
const t17LeaveBase=t16Leave;
t16Leave=function(jump=false){const ok=t17LeaveBase(jump);if(ok){state.t17CartMustLeave=true;state.t16Cart.speed=0;state.t16BoardLock=24;}return ok;};
r06ToggleMount=function(){const s=state;if(!s||mode!=='playing'||s.t11Transition)return false;if(s.t16Cart?.on)return t16Leave(false);if(s.mounted)return t16MountBase();if(s.r05Arena&&t16Board('button'))return true;
 if(s.ufoOwned||s.slimeOwned){if(!['ufo','slime'].includes(s.mountType))s.mountType=s.ufoOwned?'ufo':'slime';s.mountOwned=true;return t16MountBase();}note(s.r05Arena?'靠近停放的矿车，按坐骑键上车。':'尚未获得坐骑。');return false;};
r07CycleMount=function(){const s=state;if(!s||mode!=='playing')return;const opts=[...(s.slimeOwned?['slime']:[]),...(s.ufoOwned?['ufo']:[])];if(!opts.length){note('矿车在轨道上；靠近停放的矿车后按坐骑键。');return;}const next=opts[(opts.indexOf(s.mountType)+1)%opts.length];if(s.t16Cart?.on)t16Leave();else if(s.mounted){s.mounted=false;r07SetMountHeight(s,false);}s.mountType=next;t10RequestMount(s,next,'cycle');};
function t17Interact(){const s=state;if(!s||mode!=='playing'||s.t11Transition)return false;if(s.t11Chest&&!s.t11Chest.opened&&Math.hypot(s.t11Chest.x+16-s.p.x-s.p.w/2,s.t11Chest.y+28-s.p.y-s.p.h)<76){return t12Open();}if(t13ClosestChest(s)&&t13OpenNearby())return true;
 const p=s.p,q=s.pipe;if(q&&Math.abs(p.x+p.w/2-q.x-q.w/2)<50&&Math.abs(p.y+p.h-q.y)<60){if(s.r05Arena){if(s.phase==='battle'){note('击败克眼后才能从原管道返回。');return false;}return exitSecret();}return enterTerraSecret();}
 return false;
}
const t17ChestOpenBase=t13OpenNearby,t17ChestCloseBase=t13CloseChest;
t13OpenNearby=function(){const ok=t17ChestOpenBase();if(ok){state.t17ChestLatch=t13OpenChestId;t17ResetActions();t17Input.dialogIndex=0;t17UpdateChest();}return ok;};
t13CloseChest=function(){t17MaskHeld();t17ChestCloseBase();};
function t17TakeAll(){if(mode!=='inventory')return;t13TakeChest();t13CloseChest();}
function t17UpdateChest(){if(mode!=='inventory')return;$('t13ChestTake').textContent='全部取出 · X / Enter';$('t13ChestClose').textContent='关闭 · B / Esc';$('t13ChestHint').textContent='左摇杆/方向键选择，A 确认；X 一键取走并关闭。菜单中不会攻击或上下坐骑。';const a=[$('t13ChestTake'),$('t13ChestClose')].filter(b=>!b.disabled);t17Input.dialogIndex=clamp(t17Input.dialogIndex,0,a.length-1);a.forEach((b,i)=>b.classList.toggle('t17-selected',i===t17Input.dialogIndex));a[t17Input.dialogIndex]?.focus({preventScroll:true});}
$('t13ChestTake').onclick=t17TakeAll;$('t13ChestClose').onclick=t13CloseChest;
const t17ChestPanelBase=t13UpdateChestPanel;t13UpdateChestPanel=function(){t17ChestPanelBase();t17UpdateChest();};
function t17MenuNavigate(d){if(mode==='inventory'){const a=[$('t13ChestTake'),$('t13ChestClose')].filter(b=>!b.disabled);t17Input.dialogIndex=(t17Input.dialogIndex+d+a.length)%a.length;t17UpdateChest();}
 else if(mode==='menu'){const ids=Object.keys(heroNames);selectHero(ids[(ids.indexOf(hero)+d+ids.length)%ids.length]);}
 else{padDialogIndex=(padDialogIndex+d+2)%2;focusPadDialog();}}
function t17Confirm(){if(mode==='inventory'){const a=[$('t13ChestTake'),$('t13ChestClose')].filter(b=>!b.disabled);a[t17Input.dialogIndex]?.click();}
 else if(mode==='menu')handlePrimary();else if(['paused','respawn','win','gameover'].includes(mode))focusPadDialog()?.click();t17MaskHeld();}
function t17Perform(action){if(mode!=='playing'||!state?.p||state.t11Transition)return;
 if(action==='interact')t17Interact();else if(action==='mount')r06ToggleMount();else if(action==='weapon')t13CycleWeapon();else if(action==='mountCycle')r07CycleMount();else if(action==='heal')r06Heal();else if(action==='recall')t13Recall();
 else if(action==='toolPrev')r06DigitTool((state.tool+5)%6);else if(action==='toolNext')r06DigitTool((state.tool+1)%6);else if(action==='torch')t15QuickTorch();
}
const t17PollBase=pollMixPad;
pollMixPad=function(){if(!isTrio())return t17PollBase();
 t17Input.previous=t17Input.buttons.slice();let pads=[];try{pads=Array.from(navigator.getGamepads?.()||[]).filter(p=>p&&p.connected!==false);}catch{}
 let pad=pads.find(p=>p.index===t17Input.index);const active=pads.find(p=>p.index!==t17Input.index&&(p.buttons||[]).some(t17Pressed));if(active)pad=active;if(!pad)pad=pads[0]||null;
 const lost=t17Input.connected&&(!pad||pad.id!==t17Input.id||pad.index!==t17Input.index);if(lost){t17ResetActions();if(['playing','flag'].includes(mode))togglePause();}
 t17Input.connected=!!pad;t17Input.index=pad?.index??null;t17Input.id=pad?.id??null;padState=pad;
 t17Input.buttons=pad?Array.from(pad.buttons||[],t17Pressed):[];t17Input.axes=pad?Array.from(pad.axes||[]):[0,0,0,0];
 for(const i of t17Input.blocked)if(!t17Input.buttons[i])t17Input.blocked.delete(i);
 const label=$('gamepadStatus');if(label)label.textContent=pad?(pad.mapping==='standard'?'手柄已连接 · RT 攻击 · A/LT 跳跃 · X 交互 · B 坐骑':'手柄非标准映射：请使用手柄的 XInput / 标准模式'):'手柄：连接后按一下按钮 · 键鼠也可直接游玩';
 if(t17Input.inactive){t17MaskHeld();return;}
 if(t17Input.mode!==mode){t17Input.mode=mode;t17Input.menuDir=0;t17Input.menuRepeat=0;padDialogIndex=0;if(['paused','respawn','win','gameover'].includes(mode))focusPadDialog();}
 const ls=t17Stick(t17Input.axes[0],t17Input.axes[1]),rs=t17Stick(t17Input.axes[2],t17Input.axes[3]);
 const horizontal=(t17Action(15)?1:0)-(t17Action(14)?1:0),vertical=(t17Action(13)?1:0)-(t17Action(12)?1:0),d=Math.sign(horizontal||vertical||(Math.abs(ls[0])>.45?ls[0]:Math.abs(ls[1])>.45?ls[1]:0));
 if(['menu','inventory','paused','respawn','win','gameover'].includes(mode)){
  if(d){if(d!==t17Input.menuDir||++t17Input.menuRepeat>=22){t17MenuNavigate(d);t17Input.menuRepeat=d!==t17Input.menuDir?0:14;}}else t17Input.menuRepeat=0;t17Input.menuDir=d;
  if(mode==='inventory'){if(t17Edge(1)||t17Edge(9))t13CloseChest();else if(t17Edge(2))t17TakeAll();else if(t17Edge(0))t17Confirm();}
  else if(t17Edge(9)&&mode==='paused'){togglePause();t17MaskHeld();}
  else if(t17Edge(0)||t17Edge(9))t17Confirm();
  else if(t17Edge(1)&&mode==='paused'){showCharacters();t17MaskHeld();}
  return;
 }
 if(t17Edge(9)){togglePause();t17MaskHeld();return;}
 if(mode!=='playing')return;
 t17PrepareState(state);
 const activeLs=Math.hypot(...ls)>.01;
 const changedLs=activeLs&&Math.hypot(ls[0]-t20LastLs[0],ls[1]-t20LastLs[1])>.08;
 const pressed=t17Input.buttons.some((b,i)=>b&&!t17Input.previous[i]);
 if(changedLs||pressed)t20Own('gamepad');t20LastLs=ls.slice();
 if(t20Device==='gamepad'){const dx=horizontal||ls[0],dy=vertical||ls[1];if(Math.hypot(dx,dy)>.01)t20LeftAim=[dx,dy];}
 for(const [i,a]of [[3,'interact'],[6,'mount'],[4,'toolPrev'],[5,'toolNext'],[10,'heal'],[11,'weapon'],[8,'recall']])if(t17Edge(i)){t17Perform(a);if(mode!=='playing')break;}
};
readInput=function(){
 const ls=t17Stick(t17Input.axes[0],t17Input.axes[1]);const pad=t20Device==='gamepad';
 const k=c=>!pad&&held.has(c)&&!t17Input.keyBlocked.has(c),active=mode==='playing'&&!t17Input.inactive;
 let x=(k('KeyD')||k('ArrowRight')?1:0)-(k('KeyA')||k('ArrowLeft')?1:0),y=(k('KeyS')||k('ArrowDown')?1:0)-(k('KeyW')||k('ArrowUp')?1:0);
 if(pad){x=(t17Action(15)?1:0)-(t17Action(14)?1:0)||ls[0];y=(t17Action(13)?1:0)-(t17Action(12)?1:0)||ls[1];}
 const v={x,y,aimX:0,aimY:0,jump:k('Space')||k('KeyK')||k('KeyZ')||pad&&t17Action(0),action:k('KeyJ')||k('KeyX')||k('ShiftLeft')||k('ShiftRight')||pad&&(t17Action(1)||t17Action(2)||t17Action(7))||!pad&&t17Input.mouseDown,auxiliary:false,auxEdge:false,tool:false,toolEdge:false};
 for(const a of touch.values()){if(a==='left')v.x=-1;else if(a==='right')v.x=1;else if(a==='up')v.y=-1;else if(a==='down')v.y=1;else if(a==='jump')v.jump=true;else if(a==='run')v.action=true;else if(a==='special'&&!prev.auxiliary){t17Interact();v.auxiliary=true;}}
 v.action=active&&(v.action||!!pending.action);v.jump=active&&v.jump;v.jumpEdge=active&&(!!pending.jump||v.jump&&!prev.jump);if(!active)v.x=v.y=0;pending={};
 t13Pointer.down=active&&!pad&&t17Input.mouseDown&&!t17Input.mouseBlocked;r05Pointer.down=t13Pointer.down;r05Pointer.pressed=false;return v;
};
// Installed ahead of legacy listeners by build.py so a key has exactly one owner.
t17Early.handle=function(e){if(!isTrio())return false;if(['blur','focus'].includes(e.type)&&e.target!==window)return false;
 if(e.type==='blur'||e.type==='visibilitychange'&&document.hidden){t17Input.inactive=true;t17ResetActions();if(['playing','flag'].includes(mode))togglePause();return false;}
 if(e.type==='focus'||e.type==='visibilitychange'&&!document.hidden){t17Input.inactive=false;return false;}
 if(e.type==='keyup'){held.delete(e.code);keys.delete(e.code);t17Input.keyBlocked.delete(e.code);return t17Keys.has(e.code);}
 if(e.type==='keydown'){
  if(!t17Keys.has(e.code)||e.ctrlKey||e.metaKey||e.altKey||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return false;
  r06KeyboardAudio();if(t17Input.keyBlocked.has(e.code))return true;
  if(mode==='inventory'){if(e.repeat)return true;if(['Escape','KeyF','KeyB'].includes(e.code))t13CloseChest();else if(e.code==='Space')t17Confirm();else if(['Enter','KeyL','KeyE','KeyX'].includes(e.code))t17TakeAll();else if(['ArrowDown','ArrowRight','KeyD','KeyS'].includes(e.code))t17MenuNavigate(1);else if(['ArrowUp','ArrowLeft','KeyA','KeyW'].includes(e.code))t17MenuNavigate(-1);t17Input.keyBlocked.add(e.code);return true;}
  if(['menu','paused','respawn','win','gameover'].includes(mode)){if(e.repeat)return true;if(['Enter','Space','KeyK','KeyZ'].includes(e.code))t17Confirm();else if(['Escape','KeyP'].includes(e.code)&&mode==='paused')togglePause();else if(['ArrowDown','ArrowRight','KeyD','KeyS'].includes(e.code))t17MenuNavigate(1);else if(['ArrowUp','ArrowLeft','KeyA','KeyW'].includes(e.code))t17MenuNavigate(-1);else if(e.code==='KeyC')showCharacters();t17Input.keyBlocked.add(e.code);return true;}
  if(e.code==='KeyP'||e.code==='Escape'){if(!e.repeat){togglePause();t17MaskHeld();}return true;}
  if(mode!=='playing')return true;
  if(!e.repeat)t20Own('keyboard');
  const map={KeyL:'interact',KeyE:'interact',KeyF:'mount',KeyQ:'weapon',KeyV:'mountCycle',KeyH:'heal',KeyB:'recall',BracketRight:'toolNext',BracketLeft:'toolPrev',KeyG:'torch'};
  if(map[e.code]){if(!e.repeat)t17Perform(map[e.code]);return true;}
  if(e.code.startsWith('Digit')){if(!e.repeat)r06DigitTool(+e.code.slice(-1)-1);return true;}
  if(e.code==='KeyC'){if(!e.repeat)showCharacters();return true;}if(e.code==='KeyR'){if(!e.repeat){if(state?.secret)handleHiddenRestart();else retry();}return true;}
  held.add(e.code);if(!e.repeat){if(['Space','KeyK','KeyZ'].includes(e.code))pending.jump=true;if(['KeyJ','KeyX','ShiftLeft','ShiftRight'].includes(e.code))pending.action=true;}return true;
 }
 if(e.type==='pointerup'||e.type==='pointercancel'){t17Input.mouseDown=false;t17Input.mouseBlocked=false;t13Pointer.down=r05Pointer.down=r05Pointer.pressed=false;return false;}
 if(e.type==='pointermove'||e.type==='pointerdown'){
  if(e.target!==canvas)return false;if(mode!=='playing')return true;const point=[e.clientX,e.clientY];const moved=!t17Input.lastMouse||Math.hypot(point[0]-t17Input.lastMouse[0],point[1]-t17Input.lastMouse[1])>.5;
  if(moved||e.type==='pointerdown'){t20Own('keyboard');t17Input.lastMouse=point;t13SamplePointer(e);if(t13Pointer.active){t17Input.source='mouse';t17Input.explicit=true;}}
  if(e.type==='pointerdown'){canvas.focus({preventScroll:true});if(e.button===2)t17Interact();else if(e.button===0&&!t17Input.mouseBlocked){t17Input.mouseDown=true;t13Pointer.down=true;pending.action=true;try{canvas.setPointerCapture(e.pointerId);}catch{}}}
  return true;
 }
 if(e.type==='wheel'&&e.target===canvas){if(mode==='playing'&&Math.abs(e.deltaY)>0)t17Perform(e.deltaY>0?'toolNext':'toolPrev');return true;}
 return false;
};
const t17ClearBase=clearInput;clearInput=function(){t17MaskHeld();t17ClearBase();};
const t17StepBase=step;
step=function(v){const before=state;if(before)t17PrepareState(before);const out=t17StepBase(v);const s=state;if(s!==before){if(s)t17PrepareState(s);return out;}if(!s||mode!=='playing'||s.t11Transition)return out;
 if(s.t16BoardLock>0)s.t16BoardLock--;
 if(t17Input.explicit&&!s.p.attack&&!s.p.hurtLock){const a=r05Aim(v);s.p.facing=a.facing;s.p.aim=a.angle;}
 return out;
};
const t17SyncBase=t15Sync;t15Sync=function(s){t17SyncBase(s);if(!isTrio())return;$('bestLabel').textContent='R17';document.querySelector('header .offline').textContent='TERRARIA · 1-3';t10Build.textContent='R17 · 双摇杆 / 键鼠适配';
 const mountButton=$('r06Mount');if(mountButton){mountButton.textContent=s?.t16Cart?.on?'F · 下矿车':s?.mounted?'F · 下坐骑':s?.ufoOwned&&s.mountType==='ufo'?'F · 骑乘 UFO':s?.slimeOwned&&s.mountType==='slime'?'F · 骑乘史莱姆':'F · 上下坐骑';mountButton.title='手柄 B / 键盘 F：靠近停放的矿车上车，或上下已获得的坐骑。';}
};
const t17RenderBase=render;
render=function(){const out=t17RenderBase();if(!isTrio()||!state)return out;const s=state;
 if(mode==='inventory')t17UpdateChest();
 if(mode==='playing'&&s.tool===0&&t20Device==='keyboard'&&t17Input.source==='mouse'&&t17Input.explicit){const a=t17AimPoint(s),w=s.r05Arena?R06_VIEW.w:W,h=s.r05Arena?R06_VIEW.h:H,x=a.x-s.cam,y=a.y-(s.r05Arena?(s.camY??-96):s.r07CamY||0),sz=s.r05Arena?5:3;
  if(x>3&&x<w-3&&y>38&&y<h-3){ctx.save();ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.lineWidth=s.r05Arena?1.25:.75;ctx.strokeStyle='#171e29';ctx.beginPath();ctx.arc(x,y,sz+1,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#fff3cf';ctx.beginPath();ctx.moveTo(x-sz-2,y);ctx.lineTo(x-2,y);ctx.moveTo(x+2,y);ctx.lineTo(x+sz+2,y);ctx.moveTo(x,y-sz-2);ctx.lineTo(x,y-2);ctx.moveTo(x,y+2);ctx.lineTo(x,y+sz+2);ctx.stroke();ctx.restore();}}
 return out;};
const t17Style=document.createElement('style');t17Style.textContent='#t13ChestPanel button.t17-selected{outline:3px solid #fff0a6;outline-offset:3px}#t15Help table{width:100%;border-collapse:collapse;font-size:11px;line-height:1.65}#t15Help th,#t15Help td{text-align:left;padding:5px;border-bottom:1px solid #55637266}#t15Help th{color:#e8d9b6}';document.head.append(t17Style);
t15Help.innerHTML=`<summary>操作指南 · 手柄 / 键鼠</summary><table><thead><tr><th>动作</th><th>标准手柄</th><th>键盘 / 鼠标</th></tr></thead><tbody>
<tr><td>移动</td><td>左摇杆 / 十字键</td><td>WASD / 方向键</td></tr><tr><td>手动瞄准</td><td>右摇杆，松开保留方向</td><td>鼠标</td></tr><tr><td>攻击 / 使用工具</td><td>RT / R2</td><td>左键 / J</td></tr><tr><td>跳跃 / 跳下矿车</td><td>A / × 或 LT / L2</td><td>空格 / K / Z</td></tr>
<tr><td>交互 / 取走宝箱物品</td><td>X / □</td><td>E / L / 右键；箱内 Enter</td></tr><tr><td>上下坐骑 / 关闭宝箱</td><td>B / ○</td><td>F；箱内 Esc</td></tr><tr><td>切工具</td><td>LB/RB · L1/R1</td><td>1–6 / [ ] / 滚轮</td></tr><tr><td>切已有武器</td><td>Y / △</td><td>Q</td></tr><tr><td>切已获得的坐骑</td><td>按下右摇杆 R3</td><td>V</td></tr><tr><td>治疗</td><td>按下左摇杆 L3</td><td>H / 点生命图标</td></tr><tr><td>返程魔镜</td><td>Back / View</td><td>B</td></tr><tr><td>下穿木平台 / UFO下降</td><td>下＋跳跃 / 左摇杆向下</td><td>S＋空格 / S</td></tr><tr><td>暂停</td><td>Start / Options</td><td>P / Esc</td></tr></tbody></table>
<p>普通武器只按手动准星瞄准，不额外锁定怪物。叶绿弹和召唤物保留现有的自身追踪行为。弹药无限，魔力、木材与消耗品仍有数量限制。</p>
<p>矿车只在靠近停放位置后按 B / F 上车，不会接触自动登车；召唤 Boss 不会强制上车。空格 / A / LT 跳车，车辆留在下车位置；上下坐骑和切工具按住不会反复触发。矿车松开左摇杆继续巡航，下方向刹车，右摇杆只管瞄准。</p>
<p>所有宝箱只按 X / E / L / 鼠标右键打开，不再接触自动打开。地下箱内 X / Enter 一键取走并关闭，B / Esc 只关闭，A 确认所选按钮。地表补给箱按交互后弹出三件道具，最右眼球拾取后开战。箱内暂停战斗，退出时不会误攻击或误上车。战斗中不能返程；获胜后从原管道返回。</p>
<p>标准布局按 Xbox / PlayStation 名称对应显示。手柄非标准映射时请切为 XInput / 标准模式。本版未做实体手柄和 Windows 驱动实测。R17 修复输入、交互、矿车、UFO、原图植被并扩展矿区。武器按已核对的 1.4.5.8 资料重建；不是原引擎逐帧移植。</p>`;
$('r06Mount').onclick=()=>{r06ToggleMount();canvas.focus({preventScroll:true});render();};t16CartButton.onclick=()=>{r06ToggleMount();canvas.focus({preventScroll:true});render();};
const t17Diagnostics={build:T17_BUILD,inspect:()=>({mode,source:t17Input.source,explicit:t17Input.explicit,aim:[t17Input.dx,t17Input.dy],connected:t17Input.connected,axes:t17Input.axes,buttons:t17Input.buttons,blocked:[...t17Input.blocked],keyBlocked:[...t17Input.keyBlocked],cart:state?.t16Cart,chest:t13OpenChestId}),aim:(v={})=>r05Aim(v),input:()=>readInput(),interact:t17Interact,board:t16Board,leave:t16Leave,clear:t17ResetActions};

/* R17 content and physics. Terrain layout and elite tiers are crossover rules,
 * not a claim that Terraria's worldgen/AI has been transplanted verbatim. */
const T17_CONTENT={reference:'Terraria PC 1.4.5.8',biomes:['森林','沙漠','猩红','丛林','雪原','发光蘑菇','花岗岩','大理石','腐化','灰烬'],revision:17};
const t17Art={};
const t17ArtReady=Promise.all(Object.entries(T17_ASSET_DATA).map(([key,url])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{t17Art[key]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=url;})));
const t17PlantCache=new Map();
function t17PlantSprite(variant,height){
 const key=variant+':'+height+':'+r08ImageRevision;if(t17PlantCache.has(key))return t17PlantCache.get(key);
 const im=r06Images[variant==='boreal'?'t12TreeTop':'t12ForestTop'];if(!im)return t12TreeImage(variant);
 const cv=document.createElement('canvas');cv.width=96;cv.height=height;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 const frame=variant==='forest2'?2:variant==='boreal'?1:0,sx=82*frame;
 for(let y=72;y<height;y+=8)g.drawImage(im,sx+34,70,14,8,42,y,14,Math.min(8,height-y));
 g.drawImage(im,sx,0,80,80,8,0,80,80);t17PlantCache.set(key,cv);return cv;
}
function t17FixTrees(s){
 for(const [i,t]of(s.trees||[]).entries()){
  if(t.t17Sized)continue;t.t17Sized=true;
  const biome=t.t16Biome||t16BiomeAt(t.x,s).id;
  t.variant=biome==='snow'?'boreal':i%3===2?'forest2':'forest';
  t.visualH=s.r05Arena?(biome==='desert'?112+i%3*16:192+i%4*24):biome==='desert'?60+i%2*12:Math.max(64,Math.min(108,t.y-24));
  t.h=t.visualH;
 }
}
const t17TreeDrawOld=t12DrawTree;
t12DrawTree=function(g,t,c=0,scale=1){
 const biome=t.t16Biome||t16BiomeAt(t.x).id,h=t.visualH||96,x=t.x-c;
 if(t.hp<=0&&t.fall>=42)return t17TreeDrawOld(g,t,c,scale);
 g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x),Math.round(t.y));
 if(t.shake)g.rotate(Math.sin(t.shake*1.6)*.024);
 if(biome==='desert'&&t17Art.cactus){
  // Native 16x16 frame parts; no drawn rectangles pretending to be a cactus.
  const im=t17Art.cactus,unit=state?.r05Arena?16:8,n=Math.max(4,Math.round(h/unit));g.scale(scale,scale);
  const tile=(sx,sy,dx,dy)=>g.drawImage(im,sx*18,sy*18,16,16,dx,dy,unit,unit);
  for(let i=1;i<=n;i++)tile(0,i===n?0:1,-unit/2,-i*unit);
  for(const [dir,level]of [[1,Math.max(2,Math.floor(n*.52))],[-1,Math.max(2,Math.floor(n*.32))]]){
   const right=dir>0;tile(right?1:4,0,-unit/2,-level*unit);
   tile(right?2:3,2,(right?.5:-1.5)*unit,-level*unit);
   tile(right?2:3,1,(right?.5:-1.5)*unit,-(level+1)*unit);
   tile(right?2:3,0,(right?.5:-1.5)*unit,-(level+2)*unit);
  }
 }else{
  const tall=state?.r05Arena,im=t17PlantSprite(t.variant,tall?h:Math.round(h/.6)),r=tall?1:.6;
  g.drawImage(im,Math.round(-48*r*scale),Math.round(-h*scale),Math.round(96*r*scale),Math.round(h*scale));
 }
 g.restore();
};
const t17NewContentBase=newState;
newState=function(){const s=t17NewContentBase();t17FixTrees(s);return s;};
const T17_BIOMES=[
 {name:'森林',rgb:[.94,.86,.69],wall:'#292c29'},
 {name:'沙漠',rgb:[1.45,1.19,.67],wall:'#4b3826'},
 {name:'猩红',rgb:[1.15,.54,.57],wall:'#3c1b26'},
 {name:'丛林',rgb:[.63,1.03,.56],wall:'#183628'},
 {name:'雪原',rgb:[1.26,1.49,1.67],wall:'#233a52'},
 {name:'发光蘑菇',rgb:[.49,.81,1.29],wall:'#152441'},
 {name:'花岗岩',rgb:[.51,.64,.99],wall:'#171f34'},
 {name:'大理石',rgb:[1.51,1.48,1.33],wall:'#424249'},
 {name:'腐化',rgb:[.89,.58,1.16],wall:'#2d2040'},
 {name:'灰烬',rgb:[.75,.71,.70],wall:'#2e2125'}
];
function t17DeepBiome(x,y){const xx=x+3.7*Math.sin(y*.19)+2.3*Math.sin(y*.053),yy=y+2.4*Math.sin(x*.13);if(yy>104)return 9;if(yy>68){if(xx<57)return 6;if(xx>140)return 7;return 5;}if(yy>38&&xx<53)return 8;if(yy>38&&xx>117&&xx<147)return 5;return clamp(Math.floor(xx/192*5),0,4);}
const t17GenerateBase=t13GenerateWorld;
t13GenerateWorld=function(){
 const w=t17GenerateBase();w.t17=true;w.regions=new Uint8Array(w.cells.length);w.deepFoes=[];w.decor=[];
 const carve=(cx,cy,rx,ry)=>{for(let y=Math.max(7,Math.floor(cy-ry));y<=Math.min(w.rows-3,Math.ceil(cy+ry));y++)for(let x=Math.max(2,Math.floor(cx-rx));x<=Math.min(w.cols-3,Math.ceil(cx+rx));x++)if(!t13Protected(w,x,y)&&((x-cx)/rx)**2+((y-cy)/ry)**2<1)w.cells[y*w.cols+x]=0;};
 // Wider chambers alternate with navigable three-tile passages and ore pillars.
 for(let i=0;i<26;i++){const x=13+(i*31)%166,y=18+Math.floor(i/5)*20+(i%3)*3;carve(x,y,8+i%3*2,5+i%2*2);}
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++)w.regions[y*w.cols+x]=t17DeepBiome(x,y);
 // Fourteen added caches across the themed caverns have real loot, not labels.
 const specs=[[18,16],[78,23],[109,20],[167,26],[30,46],[84,44],[127,52],[174,60],[24,77],[76,82],[133,83],[170,90],[75,112],[120,118]];
 for(const [i,[cx,cy]]of specs.entries()){
  carve(cx,cy-3,8,6);for(let x=cx-7;x<=cx+7;x++)w.cells[cy*w.cols+x]=2;
  const biome=t17DeepBiome(cx,cy),items=[{kind:'torch',count:30},{kind:'wood',count:40}];
  items.unshift({kind:i%5===0?'terraBlade':i%5===1?'boots':i%5===2?'band':i%5===3?'heart':'starfury',count:1});
  if(i===8||i===12)items.unshift({kind:'stormbow',count:1});
  w.chests.push({id:'r17-cache-'+i,name:T17_BIOMES[biome].name+' · '+(cy>70?'深层宝箱':'遗迹宝箱'),x:cx*16-16,y:T13.top+cy*16-28,w:32,h:28,opened:false,empty:false,items});
  w.torches.push({x:(cx-5)*16+8,y:T13.top+cy*16-16,wall:true,phase:i%5});
 }
 // Protect floors of all old and new chests after room carving.
 for(const q of w.chests){const cy=Math.round((q.y+28-T13.top)/16),cx=Math.round((q.x+16)/16);for(let x=cx-2;x<=cx+2;x++)w.cells[cy*w.cols+x]=2;for(let y=cy-4;y<cy;y++)for(let x=cx-3;x<=cx+3;x++)w.cells[y*w.cols+x]=0;}
 // Fixtures only spawn in genuine empty cells with solid footing (for walkers).
 for(let cy=12;cy<122;cy+=5)for(let cx=10;cx<184;cx+=7){
  if(t13At(w,cx,cy)||t13At(w,cx,cy-1)||t13At(w,cx,cy-2)||!t13At(w,cx,cy+1))continue;
  if(w.chests.some(q=>Math.hypot(q.x-cx*16,q.y-(T13.top+cy*16))<100))continue;
  const i=w.deepFoes.length,elite=i%7===5,kind=i%4===0?'caveBat':i%4===1?'slime':i%4===2?'zombie':'demonEye',flying=kind==='caveBat'||kind==='demonEye',size=kind==='zombie'?[22,40]:kind==='slime'?[28,22]:[28,22],hp=(kind==='slime'?60:kind==='caveBat'?80:120)*(elite?3:1);
  w.deepFoes.push({id:'r17-deep-'+i,kind,x:cx*16,y:T13.top+(cy+1)*16-size[1],w:size[0],h:size[1],hp,maxHp:hp,elite,flying,age:i*5,active:false,vx:0,vy:0,dir:-1,grounded:!flying,dead:false,flash:0,knock:0,jumpWait:20,biome:t17DeepBiome(cx,cy),skin:'blue'});
 }
 // Only locally visible background decorations are drawn.
 for(let y=7;y<125;y++)for(let x=3;x<189;x++)if(!t13At(w,x,y)&&t13At(w,x,y+1)&&t13Hash(x,y,77)>.85)w.decor.push({x:x*16+8,y:T13.top+(y+1)*16,biome:t17DeepBiome(x,y),h:10+Math.floor(t13Hash(x,y,32)*16)});
 w.revision++;return w;
};
const t17RoomContentBase=t11PrepareRoom;
t11PrepareRoom=function(s){t17RoomContentBase(s);t17FixTrees(s);s.notice='靠近宝箱按 X / E；取齐道具后再拾取最右眼球。矿车按 B / F 上车。';s.noticeTime=240;};
Object.assign(T13_LOOT_NAMES,{stormbow:'代达罗斯风暴弓'});
const t17TakeContentBase=t13TakeChest;
t13TakeChest=function(){const s=state,c=s?.t13World?.chests.find(q=>q.id===t13OpenChestId);if(c&&mode==='inventory')for(const item of c.items)if(item.kind==='stormbow'){if(!s.t13Owned.includes('stormbow'))s.t13Owned.push('stormbow');s.t13Weapon='stormbow';s.t13WeaponOverride=!!s.kit;}return t17TakeContentBase();};
const t17TargetsBase=r06AllTargets;
r06AllTargets=function(s){const out=t17TargetsBase(s);for(const e of s.t13World?.deepFoes||[])if(!e.dead&&e.active)out.push({id:e.id,x:e.x+e.w/2,y:e.y+e.h/2,w:e.w,h:e.h,obj:e});return out;};
const t17DamageContentBase=r06DamageTarget;
r06DamageTarget=function(t,damage,kind){if(!t?.id?.startsWith('r17-deep-'))return t17DamageContentBase(t,damage,kind);const e=t.obj,s=state;if(e.dead)return;
 const dealt=Math.max(1,Math.round(damage)-(e.elite?6:2));e.hp-=dealt;e.flash=8;e.knock=kind==='copper-axe'?18:10;e.vx=(s.p.attackFacing||s.p.facing)*(kind==='copper-axe'?4.5:2.5)*(e.elite?.65:1);e.vy=-2;
 number(String(dealt),t.x,t.y-18,e.elite?'#ffd095':'#f4e3b2');t10Burst(s,t.x,t.y,e.kind==='slime'?'gel':'hit',5);
 if(e.hp<=0){e.dead=true;s.kills++;s.score+=e.elite?500:80;terraSound('npcDeath');if(e.elite){s.healPotions++;t13Drop(s,'torch',12,e.x,e.y);s.hp=Math.min(s.maxHp,s.hp+20);t13Event('elite-defeated',{id:e.id,reward:'healing-potion + torches'});}}
};
function t17DeepStep(s){
 const p=s.p,w=s.t13World;if(!w)return;
 for(const e of w.deepFoes){if(e.dead||Math.abs(e.x-p.x)>850||Math.abs(e.y-p.y)>580){e.active=false;continue;}e.active=true;e.age++;if(e.flash)e.flash--;
  const dx=p.x-e.x,dy=p.y-e.y,dir=dx<0?-1:1;
  if(e.knock>0){e.knock--;e.vx*=.9;}
  else if(e.flying){const d=Math.hypot(dx,dy)||1,sp=e.kind==='caveBat'?2.8:2.1;e.vx=approach(e.vx,dx/d*sp,.07);e.vy=approach(e.vy,dy/d*sp+Math.sin(e.age/18)*.25,.055);}
  else if(e.kind==='slime'){if(e.grounded&&--e.jumpWait<=0){e.vx=dir*(e.elite?2.8:1.8);e.vy=e.age%3===0?-6.2:-4.7;e.jumpWait=38;}}
  else{e.vx=dir*(e.elite?1.7:1.05);if(e.grounded&&dy< -25&&e.age%48===0)e.vy=-6;}
  e.dir=e.vx<0?-1:1;const bounds={x:e.x-16,y:e.y-16,w:e.w+32,h:e.h+40},ss=t13PhysicalSurfaces(s,bounds).filter(q=>q.solid);
  e.x+=e.vx;let hitWall=false;for(const q of ss)if(near(e,q)){if(e.vx>0)e.x=q.x-e.w;else if(e.vx<0)e.x=q.x+q.w;hitWall=true;}
  if(hitWall){if(!e.flying&&e.grounded)e.vy=-6;else if(e.flying)e.vy=dy<0?-2:2;e.vx=0;}
  const oldY=e.y,foot=e.y+e.h;e.vy=Math.min(7,e.vy+(e.flying?0:.28));e.y+=e.vy;e.grounded=false;
  for(const q of ss)if(e.x+e.w>q.x&&e.x<q.x+q.w){if(e.vy>=0&&foot<=q.y+1&&e.y+e.h>=q.y){e.y=q.y-e.h;e.vy=0;e.grounded=true;}else if(e.vy<0&&oldY>=q.y+q.h&&e.y<q.y+q.h){e.y=q.y+q.h;e.vy=0;}}
  if(near(p,e)&&p.invuln===0&&!s.t13Recalling){const phase=s.phase;s.phase='battle';r05Hurt(e.elite?40:22,e.x);if(s.phase==='battle')s.phase=phase;if(s.hp<=0){showOverlay('CAVERN / RETRY','在地下倒下了','已开宝箱与挖掘地形保留，返回地表准备场。','回准备场 →','ENTER / A 重试');break;}}
 }
}
const t17DeepTextureCache=new Map();
function t17DeepTexture(kind,bid,v){const key=kind+':'+bid+':'+v;if(t17DeepTextureCache.has(key))return t17DeepTextureCache.get(key);const src=t13TileTexture(kind,v),cv=document.createElement('canvas');cv.width=cv.height=16;const g=cv.getContext('2d');g.drawImage(src,0,0);const data=g.getImageData(0,0,16,16),rgb=T17_BIOMES[bid].rgb;
 for(let i=0;i<data.data.length;i+=4)for(let k=0;k<3;k++)data.data[i+k]=Math.min(255,data.data[i+k]*rgb[k]);g.putImageData(data,0,0);t17DeepTextureCache.set(key,cv);return cv;}
function t17DrawDeep(s){const w=s.t13World,c=s.cam,yc=s.camY||0,x0=Math.max(0,Math.floor(c/16)),x1=Math.min(w.cols-1,Math.ceil((c+R06_VIEW.w)/16)),y0=Math.max(0,Math.floor((yc-T13.top)/16)),y1=Math.min(w.rows-1,Math.ceil((yc+R06_VIEW.h-T13.top)/16));
 ctx.save();ctx.imageSmoothingEnabled=false;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const cell=t13At(w,x,y),bid=w.regions[y*w.cols+x],xx=x*16-c,yy=T13.top+y*16,v=Math.floor(t13Hash(x,y)*3);
  if(cell){ctx.drawImage(t17DeepTexture(cell,bid,v),xx,yy);if(!t13At(w,x,y-1)){ctx.fillStyle=bid===4?'#d8eef5':bid===3?'#57844c':bid===2?'#c55f6b':bid===5?'#669add':'#ada68b';ctx.fillRect(xx,yy,16,2);}if(w.cracks[x+','+y]){ctx.strokeStyle='#1b1722';ctx.beginPath();ctx.moveTo(xx+5,yy);ctx.lineTo(xx+9,yy+7);ctx.lineTo(xx+4,yy+16);ctx.stroke();}}
  else{ctx.fillStyle=T17_BIOMES[bid].wall;ctx.fillRect(xx,yy,16,16);ctx.fillStyle='#aaa5a414';ctx.fillRect(xx+(x%3)*3,yy+4,6,1);if(y>1&&t13At(w,x,y-1)&&t13Hash(x,y)>.64){ctx.fillStyle=bid===4?'#87bbc3':bid===3?'#4d7545':'#72727d';ctx.beginPath();ctx.moveTo(xx+4,yy);ctx.lineTo(xx+11,yy);ctx.lineTo(xx+8,yy+10+x%8);ctx.fill();}}
 }
 for(const d of w.decor){if(d.x<c-30||d.x>c+R06_VIEW.w+30||d.y<yc-40||d.y>yc+R06_VIEW.h+40)continue;if(d.biome===5){ctx.fillStyle='#508fda';ctx.fillRect(d.x-c-2,d.y-d.h,4,d.h);ctx.fillStyle='#7cafee';ctx.fillRect(d.x-c-8,d.y-d.h-3,16,4);ctx.fillStyle='#b7eaff';ctx.fillRect(d.x-c-3,d.y-d.h-3,3,2);}else if([4,6,7].includes(d.biome)){ctx.fillStyle=d.biome===4?'#87c6de':d.biome===6?'#757dc2':'#bcbab8';ctx.beginPath();ctx.moveTo(d.x-c-4,d.y);ctx.lineTo(d.x-c-2,d.y-d.h);ctx.lineTo(d.x-c+3,d.y-d.h+4);ctx.lineTo(d.x-c+6,d.y);ctx.fill();}}
 for(const q of w.chests){if(q.removed||q.x<c-60||q.x>c+R06_VIEW.w+60||q.y<yc-70||q.y>yc+R06_VIEW.h+50)continue;const im=r06Images.chestItem;if(im){if(q.opened){ctx.drawImage(im,0,10,32,18,q.x-c,q.y+10,32,18);ctx.drawImage(im,0,0,32,10,q.x-c,q.y-3,32,10);}else ctx.drawImage(im,q.x-c,q.y,32,28);}}
 for(const e of w.deepFoes){if(e.dead||!e.active)continue;let im,fw,fh,n;if(e.kind==='slime'){im=t10SlimeOriginal;fw=32;fh=26;n=2;}else if(e.kind==='zombie'){im=r06Images.zombie;fw=38;fh=48;n=3;}else if(e.kind==='caveBat'){im=r06Images.caveBat;fw=44;fh=40;n=4;}else{im=r06Images.demonEye;fw=38;fh=24;n=2;}
  if(im){ctx.save();ctx.translate(Math.round(e.x+e.w/2-c),Math.round(e.y+e.h));ctx.scale(e.dir<0?1:-1,1);if(e.flash%2)ctx.globalAlpha=.55;ctx.drawImage(im,0,Math.floor(e.age/(e.flying?6:10))%n*fh,fw,fh,-fw/2,-fh,fw,fh);ctx.restore();}
  if(e.elite){ctx.fillStyle='#d8b163';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('精英',e.x+e.w/2-c,e.y-14);ctx.fillStyle='#211b24';ctx.fillRect(e.x-c-5,e.y-9,e.w+10,3);ctx.fillStyle='#d88e54';ctx.fillRect(e.x-c-5,e.y-9,(e.w+10)*Math.max(0,e.hp/e.maxHp),3);}
 }
 ctx.restore();
}
const t17WorldDrawBase=t13DrawWorld;
t13DrawWorld=function(s){if(s.t13World?.t17){t17DrawDeep(s);t16DrawRails(s);}else t17WorldDrawBase(s);};
const t17LightsBase=t13LightSources;
t13LightSources=function(s){const out=t17LightsBase(s);for(const d of s.t13World?.decor||[])if(d.biome===5&&Math.abs(d.x-s.p.x)<800&&Math.abs(d.y-s.p.y)<550)out.push({x:d.x,y:d.y-d.h,r:.13,g:.34,b:.67});return out;};
const t17ContentStepBase=step;
step=function(v){const s=state;const out=t17ContentStepBase(v);if(s===state&&s&&mode==='playing'&&!s.t11Transition&&s.r05Arena){t17DeepStep(s);}return out;};
const t17ContentSyncBase=t15Sync;
t15Sync=function(s){t17ContentSyncBase(s);if(s?.r05Arena&&s.p.y>T13.top+60){const w=s.t13World,x=clamp(Math.floor(s.p.x/16),0,191),y=clamp(Math.floor((s.p.y-T13.top)/16),0,127);$('relayMessage').textContent=T17_BIOMES[t17DeepBiome(x,y)].name+' · 地下 '+Math.max(0,Math.floor((s.p.y-T13.top)/16))+' 格';}};
Object.assign(t17Diagnostics,{ready:t17ArtReady,world:()=>state?.t13World,damage:r06DamageTarget,content:T17_CONTENT,art:()=>Object.fromEntries(Object.entries(t17Art).map(([k,v])=>[k,[v.width,v.height]])),deep:()=>state?.t13World?{biomes:[...new Set(state.t13World.regions)],chests:state.t13World.chests.length,enemies:state.t13World.deepFoes.length,elites:state.t13World.deepFoes.filter(e=>e.elite).length}:null});

/* Reference-driven differences from legacy aiming. Original-source artwork is
 * kept for held items; the 1.4.4+ Terra Blade aura is a browser reconstruction. */
function t17HomingTarget(s,x,y,range=300,manhattan=false){let best=null,dist=range;for(const t of r06AllTargets(s)){if(t.obj.dead)continue;const dx=t.x-x,dy=t.y-y,d=manhattan?Math.abs(dx)+Math.abs(dy):Math.hypot(dx,dy);if(d<dist){best=t;dist=d;}}return best;}
// Summons keep autonomous targeting; player-held whips and guns do not.
r06Target=function(s,range=Infinity){const p=s.p;return t17HomingTarget(s,p.x+p.w/2,p.y+p.h/2,range);};
const t17AttackWeaponsBase=r06Attack;
r06Attack=function(v={}){
 const s=state,p=s?.p;if(!s||s.tool!==0||p.cooldown>0)return;
 if((!s.kit||s.t13WeaponOverride)&&s.t13Weapon==='terraBlade'){
  const a=r06Arm(s,v),sc=t10Scale(s),an=a.facing<0?Math.PI-a.angle:a.angle;p.attack=p.cooldown=p.t10SwingDuration=18;p.t10PreviousBlade=null;s.attackId++;
  const hand=t10WorldPose(s).hand;r06Shoot(s,{type:'terraBlade',x:hand.x+Math.cos(an)*18*sc,y:hand.y+Math.sin(an)*18*sc,vx:Math.cos(an)*12*sc,vy:Math.sin(an)*12*sc,damage:85,life:100,angle:an,pierce:3,t17Wave:true});terraSound('swing',{volume:.6});return;
 }
 return t17AttackWeaponsBase(v);
};r05Attack=r06Attack;
const t17ArcWeaponsBase=t10HitArc;
t10HitArc=function(s,targets){
 if(s.t13Weapon!=='terraBlade'||s.kit&&!s.t13WeaponOverride)return t17ArcWeaponsBase(s,targets);
 const p=s.p;if(p.attack<=0)return;const sc=t10Scale(s),u=1-p.attack/(p.t10SwingDuration||18);if(u<.1||u>.9)return;
 const aim=(p.attackFacing<0?Math.PI-p.aim:p.aim),cx=p.x+p.w/2,cy=p.y+p.h/2;
 for(const t of targets){if(t.obj.r06Melee===s.attackId)continue;const dx=t.x-cx,dy=t.y-cy,delta=Math.atan2(Math.sin(Math.atan2(dy,dx)-aim),Math.cos(Math.atan2(dy,dx)-aim));if(Math.hypot(dx,dy)<86*sc+t.w/2&&Math.abs(delta)<1.9){t.obj.r06Melee=s.attackId;r06DamageTarget(t,85,'terra-blade-melee');}}
};
function t17Crescent(x,y,a,r,alpha=.7){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){ctx.globalAlpha=alpha*(1-i*.22);ctx.fillStyle=['#43945b','#64d982','#d6ffdc'][i];const rr=r*(1-i*.17);ctx.beginPath();ctx.moveTo(-rr*.25,-rr);ctx.quadraticCurveTo(rr*.87,0,-rr*.25,rr);ctx.quadraticCurveTo(rr*.18,0,-rr*.25,-rr);ctx.fill();}ctx.restore();}
const t17WeaponDrawBase=r06DrawProjectiles;
r06DrawProjectiles=function(s,c){const waves=s.projectiles.filter(b=>b.t17Wave),all=s.projectiles;s.projectiles=all.filter(b=>!b.t17Wave);try{t17WeaponDrawBase(s,c);}finally{s.projectiles=all;}
 const sc=t10Scale(s);for(const b of waves){for(let i=0;i<b.trail.length;i+=3){const t=b.trail[i];t17Crescent(t.x-c,t.y,Math.atan2(b.vy,b.vx),31*sc,(i+1)/b.trail.length*.16);}t17Crescent(b.x-c,b.y,Math.atan2(b.vy,b.vx),35*sc,.64);}
 if(r06Weapon(s)==='terraBlade'&&s.p.attack>0){const p=s.p,u=1-p.attack/(p.t10SwingDuration||18),a=p.attackFacing<0?Math.PI-p.aim:p.aim,pose=t10WorldPose(s);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.sin(Math.PI*u)*.47;ctx.strokeStyle='#80eaa5';ctx.lineWidth=13*sc;ctx.beginPath();ctx.arc(p.x+p.w/2-c,p.y+p.h/2,65*sc,a-1.5+u*.7,a+.7+u*.7);ctx.stroke();ctx.restore();}
};
Object.assign(t17Diagnostics,{nativeTarget:(x,y,range)=>t17HomingTarget(state,x,y,range),weapons:{reference:'1.4.5.8',playerAutoAim:false,chlorophyteHoming:true,summonHoming:true,stormbowPrediction:false,terraBlade:'wide-aura / straight-wave browser reconstruction',lastPrism:'low-mana fade'}});

// One sweep, one hit per enemy: the polyline equals the rendered whip bend.
function t17WhipHit(s,targets){
 if(s.whipAge<3||s.whipAge>25)return;const sc=t10Scale(s),hand=t10WorldPose(s).hand,p=s.p,a=p.attackFacing<0?Math.PI-p.aim:p.aim,len=Math.sin(s.whipAge/28*Math.PI)*240*sc,points=[hand];
 for(let i=1;i<=14;i++){const u=i/14,bend=Math.sin(u*Math.PI)*Math.sin(s.whipAge/28*Math.PI*2)*25*sc;points.push({x:hand.x+Math.cos(a)*len*u-Math.sin(a)*bend,y:hand.y+Math.sin(a)*len*u+Math.cos(a)*bend});}
 for(const t of targets){if(t.obj.dead||t.obj.t17WhipId===s.whipId)continue;const box={x:t.x-t.w/2,y:t.y-t.h/2,w:t.w,h:t.h};for(let i=1;i<points.length;i++)if(segmentHits(points[i-1],points[i],box,4*sc)){t.obj.t17WhipId=s.whipId;t.obj.tagUntil=s.ticks+240;r06DamageTarget(t,180,'kaleidoscope');break;}}
}


const T20_ASSETS={"castleBrick": "@@E04:uri:a178@@", "sharkNecklace": "@@E04:uri:a179@@", "shackle": "@@E04:uri:a180@@"};
