/* Source-faithful World 1-2 transcription, FullScreenMario maps.js @980c275.
 * Coordinates remain upstream units: 8 units = one 16-pixel block.
 * Data and semantic layer are shared by the side view and top-down adapters.
 * Game artwork/design rights remain with the original rights holders. */
const RELAY12_MAP = (()=>{
 const B=(x,y,nx=1,ny=1,content=null)=>({kind:'brick',x,y,nx,ny,content});
 const S=(x,y,h=8,w=8)=>({kind:'stone',x,y,nx:w/8,ny:h/8});
 const Q=(x,y,content='coin',nx=1)=>({kind:'question',x,y,nx,ny:1,content});
 const C=(x,y,nx=1,ny=1,dx=8,dy=16)=>({kind:'coin',x,y,nx,ny,dx,dy});
 const E=(kind,x,y,n=1,dx=12)=>({kind,x,y,n,dx});
 const main={id:'underground',name:'1-2 · 地下通道',width:3040,spawn:[48,160],
  floor:[[0,640],[664,272],[952,16],[984,96],[1144,64],[1264,256]],
  ceiling:[[48,664],[720,360],[1272,56],[1344,136]],
  blocks:[B(0,8,1,11),Q(80,32,'power'),Q(88,32,'coin',4),
   S(136,8),S(152,16,16),S(168,24,24),S(184,32,32),S(200,32,32),S(216,24,24),B(232,40,1,1,'multi'),S(248,24,24),S(264,16,16),
   B(312,32,1,3),B(320,32),B(328,32,1,3),B(336,48),B(344,48),B(352,32,1,3),B(360,32),B(368,32,1,2),B(368,48,1,1,'star'),
   B(416,32,2,5),B(432,16,2,3),B(432,72,2,2),B(464,32,4),B(464,72,5,2),B(496,32,2,7),B(528,72,4,2),B(536,32,1,5),B(544,32,2),B(552,40,1,1,'power'),
   B(576,32,2),B(576,40),B(576,48,2,3),B(584,40,1,1,'multi'),B(608,32,4),B(608,72,4,2),B(672,40,6,2),B(712,88,1,1,'life'),
   B(952,8,2,3),S(1040,8),S(1048,16,16),S(1056,24,24),S(1064,32,32),S(1072,32,32),B(1144,40,5),B(1184,40,1,1,'power'),
   B(1264,8,17,3),B(1344,32,7,7),B(1504,8,2,11)],
  coins:[C(321,39),C(330,60,4),C(361,39),C(465,39,4),C(545,39),C(674,64,6)],
  pipes:[{x:800,height:24,transport:'bonus',piranha:true},{x:848,height:32,piranha:true},{x:896,height:16,piranha:true}],
  sidePipe:{x:1312,y:40,verticalX:1328,height:64,top:88,transport:'exit'},
  lifts:[{x:1096,width:24,dir:1},{x:1224,width:24,dir:-1}],
  warp:{x:1400,destinations:[4,3,2]},
  nativeEnemies:[E('goomba',128,8),E('goomba',136,16),E('goomba',232,8),E('turtle',352,12,2),E('turtle',472,12),E('goomba',494,8),E('goomba',510,8),E('goomba',584,72),E('goomba',608,40,2),E('goomba',768,8,3),E('goomba',872,8),E('goomba',1056,32),E('goomba',1064,48),E('turtle',1152,12)],
  landmarks:[{x:80,label:'BLOCKS'},{x:312,label:'BRICKS'},{x:800,label:'PIPES'},{x:1096,label:'LIFTS'},{x:1312,label:'EXIT'},{x:1400,label:'WARP'}]
 };
 const bonus={id:'bonus',name:'1-2 · 管道补给室',width:272,spawn:[32,60],floor:[[0,136]],ceiling:[],
  blocks:[B(0,8,1,11),B(24,32,9),B(24,64,10,4),B(96,32,1,1,'multi'),B(104,24,2,9)],coins:[C(25,7,9),C(33,39,8)],pipes:[],lifts:[],nativeEnemies:[],landmarks:[],sidePipe:{x:104,y:16,verticalX:120,top:100,height:100,transport:'return'}};
 const exit={id:'exit',name:'1-2 · 地面出口',width:928,spawn:[12,150],floor:[[0,464]],ceiling:[],blocks:[S(16,8),S(24,16,16),S(32,24,24),S(40,32,32),S(48,40,40),S(56,48,48),S(64,56,56),S(72,64,64,16),S(152,8)],coins:[],pipes:[{x:0,height:16}],lifts:[],nativeEnemies:[],landmarks:[],flag:304,castle:390};
 const entrance={id:'entrance',name:'1-2 · 地下入口',width:384,spawn:[30,182],floor:[[0,192]],ceiling:[],blocks:[],coins:[],pipes:[{x:96,height:32}],lifts:[],nativeEnemies:[],landmarks:[],sidePipe:{x:80,y:16,verticalX:96,top:32,height:32,transport:'underground'}};
 return {version:'0.2.0',source:'umaim/Mario',commit:'980c275358704a49f868567aeec5bdfb347c4781',blob:'657d750ad65bb06c0e63a3d8958736f9236ec3c0',areas:{entrance,underground:main,bonus,exit},
  adaptation:{ninja:'Canonical solid positions; content/enemy substitution only. Climbing can reach the original ceiling route.',tank:'Same x/y brick silhouettes; floor becomes boundary, gaps become water with explicit bridge adapters; original lift shafts become traversable service decks. No gravity; tank footprint 12x12.'}};
})();
function relayBuildGeometry(def){
 const map=new Map(),pp=[],cc=[];
 const tile=(x,y,kind,content=null)=>put(map,Math.round(x/8),Math.round(13-y/8),kind,content);
 for(const [x,w] of def.floor)for(let xx=x;xx<x+w;xx+=8)for(let y=0;y>=-8;y-=8)tile(xx,y,'ground');
 for(const [x,w] of def.ceiling)for(let xx=x;xx<x+w;xx+=8)tile(xx,88,'brick');
 for(const b of def.blocks)for(let j=0;j<b.ny;j++)for(let i=0;i<b.nx;i++)tile(b.x+i*8,b.y+(b.kind==='stone'?-j:j)*8,b.kind,b.kind==='question'?(b.content||'coin'):(i===0&&j===0?b.content:null));
 for(const c of def.coins)for(let j=0;j<c.ny;j++)for(let i=0;i<c.nx;i++)cc.push({x:(c.x+i*c.dx)*2,y:208-(c.y+j*c.dy)*2,w:8,h:12});
 for(const p of def.pipes){for(let xx=p.x;xx<p.x+16;xx+=8)for(let yy=8;yy<=p.height;yy+=8)tile(xx,yy,'pipe');pp.push({x:p.x*2,y:208-p.height*2,w:32,h:p.height/8,...p,x:p.x*2});}
 if(def.sidePipe){const q=def.sidePipe;for(let yy=q.top-q.height+8;yy<=q.top;yy+=8)for(let xx=q.verticalX;xx<q.verticalX+16;xx+=8)tile(xx,yy,'pipe');for(let xx=q.x;xx<q.x+16;xx+=8)for(let yy=q.y-8;yy<=q.y;yy+=8)tile(xx,yy,'pipe');}
 if(def.warp)for(let i=0;i<3;i++){const x=def.warp.x+8+i*32;for(let xx=x;xx<x+16;xx+=8)for(let yy=8;yy<=16;yy+=8)tile(xx,yy,'pipe');}
 return {tiles:map,pipes:pp,coins:cc};
}

/* Rescue Relay 1-2 / additive implementation, 0.2 playable prototype.
 * Existing three heroes retain their original 1-1 engine and maps.
 * No live website files are written by this extension. */
let r12=null,r12Checkpoint=null,r12World={},r12RelayRequested=false,r12RelayActive=false,r12Journal=[];
const r12IsHero=()=>hero==='ryu'||hero==='tank';
const R12_WEAPONS={shuriken:{label:'手里剑',hud:'STAR',cost:3},windmill:{label:'风车手里剑',hud:'WIND',cost:5},flame:{label:'火炎忍术',hud:'FIRE',cost:5}};
const R12_SPRITES={};
const r12Ready=Promise.all(['ryu','tank-player','tank-enemy'].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{R12_SPRITES[id]=im;resolve();};im.onerror=()=>reject(new Error('1-2 asset failed: '+id));im.src=R12_EMBEDDED_IMAGES['relay12/assets/'+id+'.png'];})));
window.__mixReady=Promise.all([window.__mixReady,r12Ready]);
heroNames.tank='坦克大战';
heroHelp.ryu='1-2 原图 · 横版。方向移动；空格/K 跳跃；贴墙后 ↑↓ 攀爬，再跳蹬墙。J 挥刀，L 或 ↑+J 忍术，E 切换已获得的副武器。↓ 蹲下/进入管道。不能踩怪。';
heroHelp.tank='1-2 原图的俯视适配。方向四向移动，J / 空格开火；砖墙可击碎，钢墙需满级火力（三次星星升级）。星星升级、头盔护盾、时钟停敌、手雷清屏。保留管道奖励房与出口。';
function r12Event(type,data={}){const e={type,frame,hero,area:r12?.area,...data};r12Journal.push(e);if(r12Journal.length>4000)r12Journal.shift();}
function r12Message(msg,frames=120){if(r12){r12.message=msg;r12.messageTime=frames;}}
const r12LegacyInput=getInput;
getInput=function(){const input=r12LegacyInput();if(r12IsHero()){
 const raw=virtualInput;input.up=!!(raw?.up||keys.has('ArrowUp')||keys.has('KeyW')||[...touch.values()].includes('up'));
 input.cycle=!!(raw?.cycle||keys.has('KeyE')||[...touch.values()].includes('cycle'));
 input.special=!!(raw?.special||keys.has('KeyL')||[...touch.values()].includes('special'));
 input.jump=!!(raw?.jump||keys.has('Space')||keys.has('KeyK')||keys.has('KeyZ')||[...touch.values()].includes('jump'));
 try{const p=Array.from(navigator.getGamepads?.()||[]).find(Boolean);if(p){input.up||=p.axes[1]<-.4||p.buttons[12]?.pressed;input.special||=!!p.buttons[3]?.pressed;input.cycle||=!!p.buttons[4]?.pressed;input.jump||=!!p.buttons[0]?.pressed;}}catch{}
 }return input;};mapped.add('KeyE');
function r12NewNinja(previous){return {room:0,hp:previous?.hp??16,spirit:previous?.spirit??12,weapon:previous?.weapon||'shuriken',unlocked:previous?.unlocked||['shuriken'],wall:0,wallLock:0,wallFrom:0,jumpHeld:false,attackHeld:false,specialHeld:false,cycleHeld:false,attack:0,cool:0,attackId:0,hitIds:new Set(),hit:0,coyote:0,buffer:0,stageIntro:0,transition:0,gateOpen:true,arena:false,bossDefeated:true,foes:[],projectiles:[],drops:[],lanterns:[],fx:[],events:[],ticks:0,clearTick:0};}
function r12EnemyLayer(area){
 const foes=[];let uid=0;const def=RELAY12_MAP.areas[area];
 if(area==='underground'){
  if(hero==='ryu'){
   for(const source of def.nativeEnemies)for(let i=0;i<source.n;i++){
    const x=(source.x+i*source.dx)*2;
    const kind=source.x===128||source.x===494||source.x===872?'goomba':(source.x===472||source.x===1152)?'koopa':uid%4===2?'thrower':'walker';
    const h=kind==='goomba'?14:kind==='koopa'?22:26;
    const e=ninjaEnemy(kind,x,208-source.y*2,uid++);Object.assign(e,{h,y:208-source.y*2+(source.kind==='goomba'?16:24)-h,hp:kind==='goomba'?1:2,maxHp:2});foes.push(e);
   }
   for(const [x,y] of [[1335,80],[1995,74],[2350,73]])foes.push(ninjaEnemy('hawk',x,y,uid++));
  }else{
   for(const [x,y,kind] of [[320,180,'basic'],[580,98,'fast'],[785,176,'basic'],[1090,150,'armor'],[1380,162,'basic'],[1590,82,'fast'],[1770,132,'armor'],[2030,178,'basic'],[2330,104,'armor'],[2500,165,'fast'],[2790,168,'basic']]){
    foes.push({kind:'tank',tankKind:kind,id:uid++,x,y,w:12,h:12,dir:2,t:0,cool:80+(uid%3)*22,hp:kind==='armor'?3:1,maxHp:kind==='armor'?3:1,dead:false,flash:0,spawn:50,turn:0});
   }
   foes.push({kind:'koopa',id:uid++,x:2304,y:186,w:14,h:22,dir:-1,t:0,hp:1,maxHp:1,dead:false,flash:0});
   foes.push({kind:'goomba',id:uid++,x:1470,y:128,w:14,h:14,dir:1,t:0,hp:1,maxHp:1,dead:false,flash:0});
  }
 }
 return foes;
}
function r12SupplyLayer(area){
 if(area==='bonus')return hero==='ryu'?[{x:58,y:150,type:'windmill'},{x:172,y:150,type:'health'}]:[{x:60,y:150,type:'star'},{x:160,y:150,type:'helmet'}];
 if(area!=='underground')return [];
 return hero==='ryu'?[[138,160,'spirit'],[590,154,'health'],[760,145,'windmill'],[1510,145,'flame'],[2000,146,'health'],[2330,110,'spirit']].map(([x,y,type])=>({x,y,type})):
 [[120,170,'star'],[700,162,'timer'],[1320,174,'grenade'],[1870,102,'shovel'],[2230,178,'life'],[2505,170,'helmet']].map(([x,y,type])=>({x,y,type}));
}
function r12Load(area,preserve=false,spawn=null,keepGeometry=false){
 const old=r12,oldN=ninja,def=RELAY12_MAP.areas[area];if(!def)throw new Error('Unknown 1-2 area '+area);
 const cached=r12World[area];const geom=keepGeometry&&old?.area===area?{tiles,pipes,coins:looseCoins}:cached||relayBuildGeometry(def);
 tiles=geom.tiles;pipes=geom.pipes;looseCoins=geom.coins;room=area==='entrance'||area==='exit'?'surface':'under';
 enemies=[];items=[];shots=[];particles=[];floaters=[];mixShots=[];enemyShots=[];billBase=null;freeze=0;
 ninja=r12NewNinja(preserve&&hero==='ryu'?oldN:null);
 ninja.foes=r12EnemyLayer(area);ninja.drops=r12SupplyLayer(area).map((it,i)=>({...it,w:12,h:12,vy:0,id:i,anchored:hero==='tank'}));
 if(hero==='ryu'){
  ninja.lanterns=ninja.drops.filter(it=>it.type!=='health'||area==='bonus').map(it=>({...it,w:12,h:18,dead:false}));
  ninja.drops=ninja.drops.filter(it=>!ninja.lanterns.some(l=>l.id===it.id));
 }
 r12={area,def,ticks:0,camY:0,message:def.name,messageTime:160,transition:0,target:null,transitionSpawn:null,checkpointTier:old?.checkpointTier||0,
  tank:preserve&&old?.tank?old.tank:{power:0,shield:180,freeze:0,cool:0,dir:0,track:0},
  lifts:def.lifts.flatMap((l,k)=>[0,1,2].map(i=>({x:l.x*2,y:48+i*64,w:l.width*2,h:7,vy:l.dir*.65,id:k*3+i}))),
  discovered:old?.discovered||new Set(),handoff:old?.handoff||false,clearTick:0,shake:0,flash:0,water:[],bridges:[]};
 if(hero==='tank'&&area==='underground'){
  r12.water=[[1280,48],[1872,32],[1936,32],[2160,128],[2416,112]].map(([x,w])=>({x,y:160,w,h:48}));
  // Explicit adaptation: service deck across each original pit, at its original x-span.
  r12.bridges=r12.water.map((v,i)=>({x:v.x,y:i<3?160:176,w:v.w,h:16}));
 }
 if(hero==='tank')for(const e of ninja.foes){if(r12TankCollides(e)){const ox=e.x,oy=e.y;let placed=false;for(let radius=1;radius<=12&&!placed;radius++)for(const [dx,dy] of [[-radius*8,0],[radius*8,0],[0,-radius*8],[0,radius*8]]){const q={...e,x:ox+dx,y:oy+dy};if(!r12TankCollides(q)){e.x=q.x;e.y=q.y;placed=true;break;}}}}
 const pos=spawn||def.spawn;player=createPlayer(pos[0],pos[1]);Object.assign(player,{w:12,h:hero==='tank'?12:26,vx:0,vy:0,invuln:90,grounded:false,facing:1,power:0});
 if(hero==='tank'&&!spawn){player.y=area==='underground'?176:area==='exit'?160:176;}
 player.x=Math.max(16,player.x);r12Unstick(player,hero==='tank');camera=clamp(player.x-100,0,Math.max(0,def.width-W));mode='playing';
 jumpHeldPrev=false;runHeldPrev=false;keys.clear();touch.clear();hideOverlay();r12Event('area-enter');updateHeroUI();
 if(area!=='bonus')r12Checkpoint={hero,area,x:player.x,y:player.y};
}
function r12Unstick(p,tank=false){if(!solids(p).length)return;const origin={x:p.x,y:p.y};for(let r=1;r<15;r++)for(const [dx,dy] of [[0,-r*8],[-r*8,0],[r*8,0],[0,r*8]]){const b={x:origin.x+dx,y:origin.y+dy,w:p.w,h:p.h};if(b.y>=0&&b.y+b.h<=208&&!solids(b).length){p.x=b.x;p.y=b.y;return;}}}
function r12SaveGeometry(){if(r12)r12World[r12.area]={tiles,pipes,coins:looseCoins};}
function r12Travel(target,spawn=null){if(r12.transition||mode!=='playing')return;r12SaveGeometry();r12.transition=42;r12.target=target;r12.transitionSpawn=spawn;ninjaSound('gate');r12Event('pipe',{target});}
const r12PrevReset=resetLife;
resetLife=function(){if(!r12IsHero()){r12=null;return r12PrevReset();}resetGameAudio();ninjaMakeAudio();const cp=r12Checkpoint||{area:'entrance'};r12World={};r12Load(cp.area,false,cp.x!==undefined?[cp.x,cp.y]:null);timeLeft=Math.max(120,timeLeft||400);audioSync();};
const r12PrevStart=startGame;
startGame=function(){if(!r12IsHero()){r12=null;return r12PrevStart();}
 r12RelayActive=r12RelayRequested||(r12RelayActive&&['win','gameover'].includes(mode));if(r12RelayActive)hero='ryu';r12Journal=[];r12World={};r12Checkpoint=null;r12=null;ninja=null;audioInit();ninjaMakeAudio();score=0;coins=0;lives=3;timeLeft=400;timerTicks=0;maxProgress=0;resetGameAudio();r12Load('entrance');canvas.focus({preventScroll:true});r12Event('start',{relay:r12RelayActive});audioSync();};
function r12Give(type){
 if(hero==='ryu'){
  if(type==='health')ninja.hp=Math.min(16,ninja.hp+6);
  else if(type==='life')lives++;
  else if(type==='star'){player.star=360;ninja.spirit=Math.min(30,ninja.spirit+5);}
  else if(R12_WEAPONS[type]){if(!ninja.unlocked.includes(type))ninja.unlocked.push(type);ninja.weapon=type;ninja.spirit=Math.min(30,ninja.spirit+8);}
  else ninja.spirit=Math.min(30,ninja.spirit+6);
 }else{
  const t=r12.tank;if(type==='star'||type==='power')t.power=Math.min(3,t.power+1);
  else if(type==='helmet'||type==='health')t.shield=600;
  else if(type==='timer')t.freeze=360;
  else if(type==='life')lives++;
  else if(type==='grenade'){for(const e of ninja.foes)if(e.x>camera-20&&e.x<camera+W+20&&!e.dead)r12Kill(e);r12.shake=12;}
 }
 ninjaSound('pickup');r12Message(hero==='ryu'?(R12_WEAPONS[type]?.label||({health:'生命恢复',life:'增加生命',star:'短暂无敌',spirit:'忍术能量'}[type]||'补给')):({star:'火力升级',helmet:'护盾',timer:'敌军暂停',grenade:'清除视野内敌军',life:'增加生命'}[type]||'补给'));
 addScore(200);r12Event('pickup',{item:type});updateHeroUI();
}
ninjaBump=function(t){if(t.used||!t.content)return;const item=t.content;if(item==='multi'){t.count=(t.count||10)-1;getCoin(t.x*T,t.y*T,true);if(t.count>0){t.bump=10;return;}}
 t.used=true;t.content=null;t.bump=10;
 if(item==='coin')getCoin(t.x*T,t.y*T,true);else if(item!=='multi')r12Give(item==='power'?(hero==='tank'?'star':t.x<50?'shuriken':t.x<120?'windmill':'flame'):item);
};
function r12Break(t,by='sword'){
 if(t.content&&!t.used){ninjaBump(t);return false;}if(r12.area==='underground'&&t.x>=158&&t.x<175&&t.y>=10)return false;if(t.type!=='brick'&&!(hero==='tank'&&r12.tank.power>=3&&t.type==='stone'))return false;
 const hit=hero==='tank'?1:1;t.shotHp=(t.shotHp??(t.type==='stone'?3:1))-hit;if(t.shotHp>0)return false;
 tiles.delete(tileKey(t.x,t.y));ninjaDust(t.x*T+8,t.y*T+8,hero==='tank'?'#d6ab67':'#83c4f5',10);addScore(20);r12Event('brick-break',{x:t.x,y:t.y,by});return true;
}
ninjaSwing=function(){if(ninja.cool||ninja.hit)return;ninja.attack=14;ninja.cool=20;ninja.attackId++;ninja.hitIds.clear();ninjaSound('slash');r12Event('sword');};
ninjaThrow=function(){const n=ninja,w=R12_WEAPONS[n.weapon];if(n.cool||n.hit)return;if(n.spirit<w.cost){ninjaSound('empty');r12Message('忍术能量不足',60);return;}n.spirit-=w.cost;n.cool=24;
 n.projectiles.push({kind:n.weapon,friendly:true,x:player.x+6,y:player.y+player.h-15,w:n.weapon==='flame'?15:9,h:n.weapon==='flame'?15:9,vx:player.facing*(n.weapon==='flame'?2.6:3.8),vy:n.weapon==='flame'?-2.1:0,life:n.weapon==='windmill'?160:95,age:0,hit:new Set()});ninjaSound('throw');r12Event('weapon',{weapon:n.weapon,cost:w.cost});};
function r12NinjaPlayer(input){const p=player,n=ninja,d=(input.right?1:0)-(input.left?1:0);
 if(p.invuln)p.invuln--;if(p.star)p.star--;if(n.cool)n.cool--;if(n.attack)n.attack--;if(n.wallLock)n.wallLock--;
 if(input.cycle&&!n.cycleHeld){n.weapon=n.unlocked[(n.unlocked.indexOf(n.weapon)+1)%n.unlocked.length];r12Message(R12_WEAPONS[n.weapon].label,70);}n.cycleHeld=!!input.cycle;
 if(input.jump&&!n.jumpHeld)n.buffer=7;else if(n.buffer)n.buffer--;n.jumpHeld=!!input.jump;if(p.grounded)n.coyote=6;else if(n.coyote)n.coyote--;
 const crouch=input.down&&p.grounded&&!d&&!input.jump&&!n.wall,target=crouch?16:26;
 if(target<p.h||!solids({x:p.x,y:p.y+p.h-target,w:p.w,h:target}).length){p.y+=p.h-target;p.h=target;}p.crouch=p.h===16;
 const previousBottom=p.y+p.h;
 if(n.hit){n.hit--;n.wall=0;p.vy=Math.min(4.2,p.vy+.26);ninjaMove(p.vx,p.vy);p.vx*=.94;}
 else{
  if(d)p.facing=d;const l=ninjaTouchWall(-1),r=ninjaTouchWall(1);let wall=!p.grounded?(r&&(d>0||n.wall===1)?1:l&&(d<0||n.wall===-1)?-1:0):0;
  if(n.wallLock&&wall===n.wallFrom)wall=0;if(n.wall&&d===-n.wall&&!input.jump&&!input.up)wall=0;
  if(wall&&!n.wall)r12Event('wall-grab',{side:wall});n.wall=wall;
  if(n.buffer&&(n.wall||n.coyote)){
   if(n.wall){const from=n.wall;p.vx=-from*2.65;p.vy=-4.9;p.facing=-from;n.wallFrom=from;n.wallLock=9;n.wall=0;ninjaSound('wall');r12Event('wall-jump');}
   else{p.vy=-5.2;ninjaSound('jump');}p.grounded=false;n.coyote=0;n.buffer=0;
  }
  if(n.wall){p.vx=0;p.vy=input.up?-1.1:input.down?1.4:0;ninjaMove(0,p.vy);if(input.up&&!ninjaTouchWall(n.wall)){const b={x:p.x+n.wall*5,y:p.y-3,w:p.w,h:p.h};if(!solids(b).length){p.x=b.x;p.y=b.y;p.vy=-1.2;}n.wall=0;}}
  else{if(!n.wallLock)p.vx=approach(p.vx,(p.crouch?0:d)*2.1,p.grounded?.38:.24);p.vy=Math.min(4.2,p.vy+(p.vy<0&&!input.jump?.44:.26));ninjaMove(p.vx,p.vy);}
  for(const l of r12.lifts)if(p.vy>=0&&p.x+p.w>l.x&&p.x<l.x+l.w&&previousBottom<=l.y-l.vy+2&&p.y+p.h>=l.y){p.y=l.y-p.h;p.vy=0;p.grounded=true;r12.discovered.add('lift');}
  if((input.special&&!n.specialHeld)||(input.up&&input.run&&!n.attackHeld))ninjaThrow();else if(input.run&&!n.attackHeld)ninjaSwing();
 }
 n.attackHeld=!!input.run;n.specialHeld=!!input.special;p.anim+=Math.abs(p.vx);p.x=clamp(p.x,16,r12.def.width-p.w-16);p.y=Math.max(-24,p.y);
 if(r03TryDescent(input))return;if(p.y>H+24){r12Event('pit');die();return;}
 for(const e of n.foes)if(!e.dead&&overlap(p,e)){if(p.star)r12Kill(e);else ninjaHurt(e);break;}
 r12CommonPlayer(input);
}
function r12CommonPlayer(input){const p=player,n=ninja;camera=clamp(p.x-105,0,Math.max(0,r12.def.width-W));r12.camY=hero==='ryu'?Math.min(0,p.y-53):0;
 maxProgress=r12.area==='exit'?FLAG_X:r12.area==='underground'?p.x/r12.def.width*FLAG_X:0;
 for(let i=looseCoins.length-1;i>=0;i--)if(overlap(p,looseCoins[i])){getCoin(looseCoins[i].x,looseCoins[i].y);looseCoins.splice(i,1);}
 for(let i=n.drops.length-1;i>=0;i--)if(!n.drops[i].emerge&&overlap(p,n.drops[i])){const it=n.drops[i];r12Give(it.type);n.drops.splice(i,1);}
 if(r12.area==='underground'){
  const cp=p.x>1980?2:p.x>1440?1:0;if(cp>r12.checkpointTier){r12.checkpointTier=cp;r12Checkpoint={hero,area:r12.area,x:cp===1?1458:1984,y:hero==='ryu'?180:140};r12Message('区域检查点已记录');r12Event('checkpoint',{tier:cp});}
  if(r12RelayActive&&hero==='ryu'&&!r12.handoff&&p.x>=1508&&p.y>130){r12.handoff=true;r12.transition=110;r12.target='handoff';r12Event('handoff-begin');stopMusic();return;}
  for(const pipe of pipes)if(pipe.transport==='bonus'&&input.down&&p.x+p.w/2>pipe.x+5&&p.x+p.w/2<pipe.x+27&&(hero==='tank'?Math.abs(p.y-(pipe.y-14))<28:Math.abs(p.y+p.h-pipe.y)<3)){r12Travel('bonus');return;}
  if(p.x>2800&&!r12.discovered.has('warp')){r12.discovered.add('warp');r12Message('WARP ZONE · 原型暂统一回到地面出口');r12Event('warp-discovered');}
 }
 const sp=r12.def.sidePipe;
 if(sp&&input.right&&p.x+p.w>=sp.x*2-2&&p.x<=sp.x*2+18&&Math.abs(p.y+p.h-(208-sp.y*2+32))<(hero==='tank'?44:18)){
  r12Travel(sp.transport==='return'?'underground':sp.transport,sp.transport==='return'?[1796,hero==='ryu'?150:146]:null);return;
 }
 if(r12.area==='underground'&&r12.def.warp&&input.down){for(let i=0;i<3;i++){const x=(r12.def.warp.x+8+i*32)*2;if(p.x+p.w/2>x+4&&p.x+p.w/2<x+28&&(hero==='ryu'?Math.abs(p.y+p.h-176)<3:Math.abs(p.y-162)<20)){r12Event('warp-preview-exit',{requestedWorld:r12.def.warp.destinations[i]});r12Travel('exit');return;}}}
 if(r12.area==='entrance'&&p.x>140){r12Travel('underground');return;}
 if(r12.area==='exit'&&p.x+p.w>=r12.def.flag){mode='flag';r12.clearTick=0;n.projectiles=[];stopMusic();oneShot('flag');r12Event('flag');}
}
const R12_DIR=[[1,0],[0,1],[-1,0],[0,-1]];
function r12TankCollides(b){if(b.y<48||b.y+b.h>208||b.x<16||b.x+b.w>r12.def.width-16)return true;
 if(solids(b).some(t=>t.type!=='ground'))return true;
 return r12.water.some(w=>overlap(b,w)&&!r12.bridges.some(q=>b.x+b.w>q.x&&b.x<q.x+q.w&&b.y>=q.y&&b.y+b.h<=q.y+q.h));
}
function r12TankMove(b,dir,speed){const [dx,dy]=R12_DIR[dir],q={...b,x:b.x+dx*speed,y:b.y+dy*speed};if(r12TankCollides(q))return false;b.x=q.x;b.y=q.y;return true;}
function r12TankShot(b,friendly=true){const t=r12.tank,[dx,dy]=R12_DIR[b.dir??t.dir],power=friendly?t.power:0;
 const own=ninja.projectiles.filter(s=>s.friendly===friendly&&(friendly||s.owner===b.id));if(own.length>=(friendly?(power>=2?2:1):1))return;
 ninja.projectiles.push({kind:'shell',friendly,x:b.x+b.w/2+dx*9-2,y:b.y+b.h/2+dy*9-2,w:4,h:4,vx:dx*(friendly?4+power*.65:2.4),vy:dy*(friendly?4+power*.65:2.4),life:110,owner:b.id,age:0,hit:new Set()});
 if(friendly){t.cool=power>=1?12:21;r12.shake=2;r12Event('cannon',{power});}r12Sound('cannon');
}
function r12TankHurt(source){if(mode!=='playing'||player.invuln||r12.tank.shield)return;player.invuln=90;r12Event('tank-destroyed');die();}
function r12TankPlayer(input){const p=player,t=r12.tank;if(p.invuln)p.invuln--;if(t.shield)t.shield--;if(t.freeze)t.freeze--;if(t.cool)t.cool--;let dir=input.left?2:input.right?0:input.up?3:input.down?1:null;
 p.vx=0;p.vy=0;if(dir!==null){t.dir=dir;p.dir=dir;if(r12TankMove(p,dir,1.4)){p.vx=R12_DIR[dir][0]*1.4;p.vy=R12_DIR[dir][1]*1.4;t.track++;}}
 if((input.run||input.jump)&&!t.cool)r12TankShot(p);p.facing=t.dir===2?-1:1;p.grounded=true;
 // Vehicle contact is handled as physical blocking by r12TankMove.
 r12CommonPlayer(input);
}
function r12Kill(e){if(e.dead)return;e.dead=true;ninjaDust(e.x+e.w/2,e.y+e.h/2,hero==='tank'?'#ffcb76':'#dbeafa',14);addScore(e.tankKind==='armor'?400:100);r12Event('enemy-defeated',{kind:e.tankKind||e.kind});if(hero==='tank')r12Sound('blast');}
function r12DamageEnemy(e,amount=1){if(e.dead)return;e.hp-=amount;e.flash=9;if(e.hp<=0)r12Kill(e);else ninjaSound('hit');}
function r12Body(e,dx,dy){e.x+=dx;let bumped=false;for(const t of solids(e)){if(dx>0)e.x=Math.min(e.x,t.x*T-e.w);if(dx<0)e.x=Math.max(e.x,(t.x+1)*T);bumped=true;}e.y+=dy;for(const t of solids(e)){if(dy>0){e.y=Math.min(e.y,t.y*T-e.h);e.vy=0;}else if(dy<0){e.y=Math.max(e.y,(t.y+1)*T);e.vy=0;}}return bumped;}
function r12NinjaEnemies(){const n=ninja,p=player;
 for(const e of n.foes){if(e.dead||e.x>camera+W+40||e.x+e.w<camera-40)continue;e.t++;if(e.flash)e.flash--;if(e.cool)e.cool--;
  if(e.kind==='hawk'){
   if(!e.phase){e.y=e.oy+Math.sin(e.t*.06)*4;if(Math.abs(p.x-e.x)<120&&e.t>35){e.phase=1;e.cool=32;r12Event('hawk-warning');}}
   else if(e.phase===1&&!e.cool){e.phase=2;const a=Math.atan2(p.y+10-e.y,p.x-e.x);e.vx=Math.cos(a)*1.5;e.vy=Math.sin(a)*1.5;e.cool=100;}
   else if(e.phase===2){e.x+=e.vx;e.y+=e.vy;if(!e.cool||solids(e).length||e.y>202){e.phase=3;e.cool=90;}}
   else if(e.phase===3){e.x=approach(e.x,e.ox,1.3);e.y=approach(e.y,e.oy,1.3);if(!e.cool){e.phase=0;e.t=0;}}continue;
  }
  if(e.kind==='thrower'){e.dir=p.x<e.x?-1:1;if(e.t%150===105&&Math.abs(p.x-e.x)>34)n.projectiles.push({kind:'knife',friendly:false,x:e.x+5,y:e.y+8,w:7,h:5,vx:e.dir*1.5,vy:0,life:180,age:0});}
  e.vy=Math.min(4,(e.vy||0)+.25);const dx=e.kind==='thrower'?0:e.dir*(e.kind==='goomba'?.42:.55);
  if(r12Body(e,dx,e.vy))e.dir*=-1;if(e.kind==='walker'&&e.t%120===0)e.dir=p.x<e.x?-1:1;if(e.y>270)e.dead=true;
 }
}
function r12TankEnemies(){if(r12.tank.freeze)return;const p=player;
 for(const e of ninja.foes){if(e.dead||e.x>camera+W+40||e.x<camera-40)continue;e.t++;if(e.flash)e.flash--;if(e.spawn){e.spawn--;continue;}
  if(e.kind==='goomba'||e.kind==='koopa'){const d=e.dir<0?2:0;if(!r12TankMove(e,d,.35))e.dir*=-1;continue;}
  if(e.cool)e.cool--;e.turn--;
  const alignedX=Math.abs(e.x-p.x)<7,alignedY=Math.abs(e.y-p.y)<7;
  if(e.turn<=0&&e.cool>25){e.dir=alignedX?(p.y<e.y?3:1):alignedY?(p.x<e.x?2:0):[0,3,2,1][(Math.floor(e.t/55)+e.id)%4];e.turn=55;}
  if(e.cool===25){if(alignedX)e.dir=p.y<e.y?3:1;else if(alignedY)e.dir=p.x<e.x?2:0;}
  if(e.cool>25&&!r12TankMove(e,e.dir,e.tankKind==='fast'?.82:.48)){e.dir=(e.dir+1+(e.id%2)*2)%4;e.turn=32;}
  if(!e.cool){r12TankShot(e,false);e.cool=e.tankKind==='armor'?90:125;}
 }
}
function r12Combat(){const n=ninja,p=player;
 if(hero==='ryu'&&n.attack>=3&&n.attack<=10){const box={x:p.facing>0?p.x+p.w-2:p.x-25,y:p.y+p.h-24,w:28,h:24};
  for(const e of n.foes)if(!e.dead&&overlap(box,e)&&!n.hitIds.has('e'+e.id)){n.hitIds.add('e'+e.id);r12DamageEnemy(e);}
  for(const l of n.lanterns)if(!l.dead&&overlap(box,l)){l.dead=true;n.drops.push({...l,w:12,h:12,vy:-2});ninjaDust(l.x,l.y);}
  for(const t of solids(box))if(!n.hitIds.has('t'+tileKey(t.x,t.y))){n.hitIds.add('t'+tileKey(t.x,t.y));r12Break(t);}
  for(const s of n.projectiles)if(!s.friendly&&overlap(box,s)){s.life=0;r12Event('parry');}
 }
 for(const s of n.projectiles){if(s.life<=0)continue;s.age=(s.age||0)+1;s.life--;if(s.kind==='windmill'&&s.age>30){const target=Math.atan2(p.y+p.h/2-s.y,p.x+p.w/2-s.x);s.vx=approach(s.vx,Math.cos(target)*3.8,.28);s.vy=approach(s.vy,Math.sin(target)*3.8,.28);if(overlap(s,p)){s.life=0;continue;}}
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy))/3));for(let step=0;step<steps&&s.life>0;step++){
   s.x+=s.vx/steps;s.y+=s.vy/steps;
   const hit=solids(s).find(t=>hero!=='tank'||t.type!=='ground');if(hit){if(hero==='tank'){r12.r03Impact=s;r12Break(hit,'cannon');}else if(s.friendly&&hit.content)ninjaBump(hit);if(s.kind!=='windmill'){s.life=0;ninjaDust(s.x,s.y);break;}}
   if(s.friendly){for(const e of n.foes)if(!e.dead&&!e.spawn&&overlap(s,e)&&!s.hit?.has(e.id)){s.hit?.add(e.id);r12DamageEnemy(e,s.kind==='flame'?2:1);if(s.kind!=='windmill'&&s.kind!=='flame')s.life=0;break;}
    for(const l of n.lanterns)if(!l.dead&&overlap(s,l)){l.dead=true;n.drops.push({...l,w:12,h:12,vy:-1.5});if(s.kind!=='windmill')s.life=0;}
   }else if(overlap(s,p)){if(hero==='tank')r12TankHurt(s);else ninjaHurt(s);s.life=0;}
  }
  if(s.y<(hero==='tank'?24:-48)||s.y>(hero==='tank'?240:260))s.life=0;
 }
 if(hero==='tank')for(const a of n.projectiles)if(a.friendly&&a.life>0)for(const b of n.projectiles)if(!b.friendly&&b.life>0&&overlap(a,b)){a.life=b.life=0;ninjaDust(a.x,a.y);r12Event('shell-cancel');}
 n.projectiles=n.projectiles.filter(s=>s.life>0&&s.x>camera-(hero==='tank'?8:160)&&s.x<camera+W+(hero==='tank'?8:160));
 if(hero==='ryu')for(const it of n.drops){it.vy=Math.min(3,(it.vy||0)+.15);it.y+=it.vy;for(const t of solids(it))if(it.vy>0){it.y=t.y*T-it.h;it.vy=0;}}
 for(const f of n.fx){f.x+=f.vx;f.y+=f.vy;f.vy+=.055;f.life--;}n.fx=n.fx.filter(f=>f.life>0);for(const t of tiles.values())if(t.bump)t.bump--;
 updateParticles();
}
const r12OldDie=die;
die=function(){if(!r12IsHero())return r12OldDie();if(mode!=='playing')return;mode='dying';deathTick=0;player.vy=-3.5;player.vx=0;ninja.attack=0;ninja.wall=0;lives--;stopMusic();stopEffects();if(hero==='tank')r12Sound('blast');else ninjaSound('death');r12Event('death',{lives});};
function r12Handoff(){const saved={score,coins,lives,tiles,pipes,looseCoins},oldArea=r12.area;r12Journal.push({type:'handoff',frame,from:'ryu',to:'tank',area:oldArea,score});
 hero='tank';r12Load(oldArea,false,[1520,170],true);score=saved.score;coins=saved.coins;lives=3;r12.handoff=true;r12.tank.power=2;r12.tank.shield=300;
 ninja.foes=ninja.foes.filter(e=>e.x>1590);r12Message('接下来，交给重火力。援军 Lv3 · 5 秒护盾',180);r12Checkpoint={hero:'tank',area:oldArea,x:1520,y:170};updateHeroUI();audioSync();
}
const r12OldFixed=fixedUpdate;
fixedUpdate=function(){if(!r12IsHero())return r12OldFixed();pollMixPad();if(!r12)return;
 if(['menu','paused','win','gameover'].includes(mode)){audioSync();return;}frame++;r12.ticks++;if(r12.messageTime)r12.messageTime--;if(r12.shake)r12.shake--;
 if(mode==='dying'){deathTick++;if(hero==='ryu'&&deathTick>15){player.y+=player.vy;player.vy+=.2;}if(deathTick>=90){if(lives>0)resetLife();else{mode='gameover';showOverlay('RELAY 1-2','整队，再出发','本次得分 '+score+' · 重新开始会从地下入口出发。','重新出发 →');}}audioSync();return;}
 if(mode==='flag'){r12.clearTick++;if(r12.clearTick===40)oneShot('clear');flagY=Math.min(180,48+r12.clearTick*2);if(hero==='ryu')player.y=approach(player.y,182,1.5);if(r12.clearTick>180){if(r12RelayActive&&hero==='ryu'&&r03Rewards.ninja){mode='playing';r12.transition=100;r12.target='handoff';return;}mode='win';showOverlay('RESCUE RELAY / CHAPTER 02','1-2 突破成功','这一次，墙面和砖群有了不同的解法。<br>公主仍在前方，下一棒等待新的援军。<br>得分 '+score+' · '+(r12RelayActive?'忍龙 → 坦克大战接力完成':heroNames[hero]+' 单角色完成'),'再玩一次 →');r12Event('win',{relay:r12RelayActive});}audioSync();return;}
 if(r12.transition){r12.transition--;if(r12.target==='handoff'){if(r12.transition===0)r12Handoff();}else if(r12.transition===21){const target=r12.target,spawn=r12.transitionSpawn;r12Load(target,true,spawn);r12.transition=20;r12.target=null;}audioSync();return;}
 r08UpdateLifts();
 if(hero==='ryu')r12NinjaPlayer(getInput());else r12TankPlayer(getInput());if(mode==='playing'&&!r12.transition){if(hero==='ryu')r12NinjaEnemies();else r12TankEnemies();r12Combat();if(++timerTicks>=60){timerTicks=0;if(--timeLeft<=0)die();}}
 audioSync();
};
function r12DrawRyu(g,x,y,face,pose,t=0){const im=R12_SPRITES.ryu;if(!im)return;let i=0;
 if(pose==='run')i=1+Math.floor(t/6)%3;else if(pose==='wall')i=4+Math.floor(t/9)%2;else if(pose==='air')i=6+Math.floor(t/6)%4;else if(pose==='crouch')i=24;else if(pose==='hurt')i=21;else if(pose==='slash')i=ninja?.attack>10?10:ninja?.attack>6?11:13;else if(pose==='crouchSlash')i=ninja?.attack>10?25:ninja?.attack>6?26:28;else if(pose==='throw')i=22;else if(pose==='win')i=20;
 const wide=[11,13,26,28].includes(i),cw=wide?52:26;g.save();g.translate(Math.round(x+6),Math.round(y));if(face<0)g.scale(-1,1);g.imageSmoothingEnabled=false;g.drawImage(im,(i%10)*26,Math.floor(i/10)*36,cw,36,-13,-34,cw,36);g.restore();}
function r12DrawTank(g,x,y,dir,enemy=false,t=0,armored=false){const im=R12_SPRITES[enemy?'tank-enemy':'tank-player'];if(!im)return;g.save();g.translate(Math.round(x+6),Math.round(y+6));g.rotate(dir*Math.PI/2);g.drawImage(im,-8,-8,17,16);if(Math.floor(t/5)%2){g.fillStyle=enemy?'#7e9bab':'#d5ac44';g.fillRect(-6,-7,2,1);g.fillRect(3,6,2,1);}if(armored){g.fillStyle='#e2937d';g.fillRect(-2,-2,3,3);}g.restore();}
function r12DrawEnemy(e){if(e.dead)return;if(e.flash&&frame%2)return;const x=e.x-camera,y=e.y;
 if(e.kind==='tank'){if(e.spawn){text('+',x+6,y+2,'#e3d6a0');return;}r12DrawTank(ctx,x,y,e.dir,true,e.t,e.tankKind==='armor');if(e.cool<25){rect(x+4,y-5,4,2,'#ff896b');}return;}
 if(e.kind==='goomba'||e.kind==='koopa'){sprite(e.kind==='goomba'?'goomba':'koopa'+Math.floor(e.t/9)%2,x,y,e.dir>0,false,room==='under'?'under':'normal');return;}
 if(e.kind==='hawk')return ninjaDrawEnemy(e);
 // Ninja enemy silhouettes retain the alpha's original adaptation; source-accurate enemy sheets remain a later art pass.
 ninjaDrawEnemy(e);
}
function r12DrawDrop(d){const x=Math.round(d.x-camera),y=Math.round(d.y);rect(x-1,y-1,14,14,'#091721');rect(x,y,12,12,hero==='tank'?'#c3c5a5':'#467584');rect(x+1,y+1,10,10,'#152633');
 if(d.type==='health'||d.type==='helmet'){rect(x+5,y+2,2,8,'#d4f1a6');rect(x+2,y+5,8,2,'#d4f1a6');}
 else if(d.type==='star'){sprite('star0',x-2,y-3);}
 else if(d.type==='timer'){rect(x+3,y+3,6,6,'#c6e8ef');rect(x+5,y+3,1,4,'#12222a');rect(x+5,y+6,3,1,'#12222a');}
 else if(d.type==='flame'||d.type==='grenade'){polygon([[x+3,y+10],[x+2,y+6],[x+6,y+2],[x+6,y+6],[x+9,y+5],[x+8,y+10]],'#ffad65');}
 else{rect(x+5,y+2,2,8,'#a9e8e8');rect(x+2,y+5,8,2,'#a9e8e8');rect(x+4,y+4,4,4,d.type==='windmill'?'#ffc373':'#e8f6d8');}}
function r12DrawPipes(){
 for(const p of pipes){if(p.x<camera-34||p.x>camera+W)continue;if(hero==='tank'){rect(p.x-camera,p.y,32,p.height*2,'#304d38');rect(p.x-camera+2,p.y+2,28,p.height*2-4,'#4b7d4d');rect(p.x-camera+5,p.y+5,22,22,'#182d28');rect(p.x-camera+6,p.y+6,4,19,'#88bd62');}else drawPipe(p);}
 const q=r12.def.sidePipe;if(q){const x=q.x*2-camera,y=208-q.y*2;sprite('pipe_side',x,y);for(let yy=208-q.top*2;yy<208-(q.top-q.height)*2;yy+=16)sprite('pipe_body',q.verticalX*2-camera,yy);}
 if(r12.def.warp){for(let i=0;i<3;i++){const x=(r12.def.warp.x+8+i*32)*2-camera;rect(x,176,32,32,'#356037');sprite('pipe_top',x,176);sprite('pipe_body',x,192);text(String(r12.def.warp.destinations[i]),x+16,161,'#cbe3d6',1,true);}text('WARP ZONE',2864-camera,134,'#d5e5d8',1,true);}
}
function r12DrawMap(){const surface=r12.area==='exit'||r12.area==='entrance';
 rect(0,0,W,H,surface?'#568ab5':hero==='tank'?'#141b23':'#070c15');
 if(surface){for(let i=0;i<5;i++){sprite('cloud1',i*110-camera*.3,55+(i%2)*24);sprite('hill_small',i*150-camera*.6,189);}}
 else if(hero==='tank'){for(let y=48;y<208;y+=16)for(let x=Math.floor(camera/16)*16;x<camera+W;x+=16){rect(x-camera,y,15,15,((x/16+y/16)%2)?'#18222a':'#1c272e');rect(x-camera+5,y+7,1,1,'#2c363d');}}
 else{for(let x=Math.floor(camera/128)*128;x<camera+W;x+=128){rect(x-camera,48,3,160,'#0e1c2b');for(let y=52;y<200;y+=32)rect(x-camera+8,y,34,1,'#102235');}}
 if(hero==='tank'){for(const w of r12.water){rect(w.x-camera,w.y,w.w,w.h,'#1e5074');for(let x=w.x;x<w.x+w.w;x+=12)for(let y=w.y+4;y<w.y+w.h;y+=10)rect(x-camera+(frame%28<14?1:4),y,6,1,'#608a9b');}for(const b of r12.bridges){rect(b.x-camera,b.y,b.w,b.h,'#817657');for(let x=b.x;x<b.x+b.w;x+=8){rect(x-camera,b.y+1,6,b.h-2,'#b0a379');}}}
 for(const tile of tiles.values())if(tile.x*16>camera-17&&tile.x*16<camera+W){
  if(hero!=='tank'){drawBlock(tile);continue;}if(tile.type==='pipe')continue;const x=tile.x*16-camera,y=tile.y*16;
  if(tile.type==='ground'){rect(x,y,16,16,'#393e42');rect(x+1,y+1,14,1,'#646766');continue;}
  if(tile.type==='stone'){rect(x,y,16,16,'#5b6268');rect(x+1,y+1,13,13,'#bec5c3');rect(x+3,y+3,9,9,'#868d8e');rect(x+11,y+11,3,3,'#484f5a');}
  else if(tile.type==='question'||tile.used){drawBlock(tile);}
  else{rect(x,y,16,16,'#38272a');for(let j=0;j<2;j++)for(let i=-1;i<3;i++){const bx=x+i*8+(j?4:0);ctx.save();ctx.beginPath();ctx.rect(x,y,16,16);ctx.clip();rect(bx+1,y+j*8+1,7,6,'#b07755');rect(bx+2,y+j*8+2,5,1,'#ddb282');ctx.restore();}}
 }
 r12DrawPipes();for(const c of looseCoins)if(c.x>camera-10&&c.x<camera+W)drawCoin(c.x-camera,c.y);
 if(hero==='ryu')for(const l of r12.lifts){rect(l.x-camera,l.y,l.w,7,'#aa966d');rect(l.x-camera,l.y,l.w,2,'#f0d8ac');for(let x=l.x+3;x<l.x+l.w;x+=8)rect(x-camera,l.y+3,1,3,'#3e5260');}
 if(r12.area==='exit'){
  const x=r12.def.flag-camera;rect(x-1,40,2,152,'#e4e5bb');sprite('flag_top',x-4,32);sprite('flag',x-16,mode==='flag'||mode==='win'?flagY:48);
  const savedCamera=camera;camera=202*T-(r12.def.castle-savedCamera);drawCastle();camera=savedCamera;
 }
 if(r12.area==='underground'&&r12RelayActive&&!r12.handoff){const x=1510-camera;rect(x,164,2,44,'#98c7b2');text('RELAY',x+2,153,'#dfc78c',.7,true);}
}
function r12DrawHud(){rect(0,0,W,31,'#09121c');text('1-2',8,6,'#ead7ac');text(hero==='tank'?'BATTLE':'RYU',55,6,hero==='tank'?'#efc570':'#91cedb');text('L'+lives,211,6,'#d8e4d5');
 if(hero==='ryu'){for(let i=0;i<16;i++)rect(8+i*4,18,3,5,i<ninja.hp?'#b9d6a1':'#2b3b48');text(R12_WEAPONS[ninja.weapon].hud+' '+String(ninja.spirit).padStart(2,'0'),83,18,'#91ccd3',.8);}
 else{text('PWR '+(r12.tank.power+1),8,18,'#efc570',.8);text(r12.tank.shield?'SHIELD':r12.tank.freeze?'TIME STOP':'ARMOR READY',82,18,'#9fd1ba',.65);}
 text(String(timeLeft).padStart(3,'0'),225,18,'#e0dbca',.8);
 rect(0,232,W,8,'#09121c');const progress=r12.area==='exit'?1:r12.area==='underground'?player.x/3040:0;rect(8,235,240,2,'#293c46');rect(8,235,240*progress,2,hero==='tank'?'#d4a65b':'#80bfcc');
 if(r12.area==='underground')for(const land of r12.def.landmarks)rect(8+land.x*2/3040*240,233,1,5,'#779386');
}
function r12Draw(){if(!r12){rect(0,0,W,H,'#09121c');return;}ctx.imageSmoothingEnabled=false;rect(0,0,W,H,'#070c15');ctx.save();ctx.beginPath();ctx.rect(0,r12?.area==='defense'?24:31,W,r12?.area==='defense'?208:201);ctx.clip();ctx.translate(r12.shake?((frame%2)*2-1):0,-r12.camY);r12DrawMap();
 for(const l of ninja.lanterns)if(!l.dead){const x=l.x-camera;rect(x+5,l.y-7,1,7,'#8797a0');rect(x,l.y,12,3,'#9a6243');rect(x+1,l.y+3,10,11,'#e9ba74');rect(x+4,l.y+4,4,8,'#fff0b2');rect(x,l.y+14,12,2,'#92684a');}
 for(const d of ninja.drops){r12DrawDrop(d);if(d.emerge>0){const b=at(d.blockX,d.blockY);if(b)drawBlock(b);}}for(const e of ninja.foes)if(e.x>camera-40&&e.x<camera+W+40)r12DrawEnemy(e);
 for(const s of ninja.projectiles){const x=s.x-camera,y=s.y;if(s.kind==='shell'){rect(x,y,4,4,s.friendly?'#ffeeae':'#ff9b7b');rect(x-s.vx*.8,y-s.vy*.8,2,2,'#ad8f67');}else if(s.kind==='flame'){for(let i=0;i<3;i++){rect(x-i*s.vx*2,y-i*s.vy*2,8,8,['#fff1ad','#fda055','#d96349'][i]);}}else{ctx.save();ctx.translate(x+4,y+4);ctx.rotate(frame*.4);const size=s.kind==='windmill'?8:5;rect(-size,-1,size*2,2,s.friendly?'#c4eef4':'#e5af93');rect(-1,-size,2,size*2,s.friendly?'#c4eef4':'#e5af93');ctx.restore();}}
 if(mode!=='dying'||hero==='ryu'){
  if(hero==='tank'){r12DrawTank(ctx,player.x-camera,player.y,r12.tank.dir,false,r12.tank.track);r10DrawShield(ctx,player.x-camera,player.y);}
  else if(!player.invuln||frame%8<4||mode==='dying')r12DrawRyu(ctx,player.x-camera,player.y+player.h,player.facing,mode==='dying'||ninja.hit?'hurt':mode==='flag'?(r12.clearTick>64?'run':'wall'):mode==='win'?'win':ninja.attack?(player.crouch?'crouchSlash':'slash'):ninja.wall?'wall':player.crouch?'crouch':!player.grounded?'air':Math.abs(player.vx)>.1?'run':'idle',player.grounded?player.anim*2:frame);
 }
 r05DrawParticles();r07DrawForegroundPipes();for(const f of ninja.fx)rect(f.x-camera,f.y,2,2,f.color);for(const f of floaters)text(f.text,f.x-camera,f.y,'#f1d6a5',.7,true);ctx.restore();r12DrawHud();
 if(r12.target==='handoff'){rect(9,76,238,88,'#0e1c2def');text('RECON COMPLETE',128,91,'#a8d9d5',1,true);text('HEAVY SUPPORT INBOUND',128,111,'#edcb8a',.8,true);r12DrawRyu(ctx,52,155,1,'idle',frame);r12DrawTank(ctx,174,135,2,false,frame);}
 else if(r12.transition){ctx.save();ctx.globalAlpha=Math.min(.95,(21-Math.abs(r12.transition-21))/21);rect(0,31,W,201,'#070d16');ctx.restore();}
 updateUi();updateHeroUI();$('stateLabel').textContent=mode==='playing'?r12.def.name:mode==='paused'?'已暂停':mode==='dying'?'从检查点重新整队':mode==='flag'?'抵达出口':mode==='win'?'1-2 突破成功':'准备出发';$('distanceLabel').textContent=r12RelayActive?'救援接力 · '+(hero==='ryu'?'第一棒 / 忍龙':'第二棒 / 坦克大战'):'1-2 · '+(hero==='ryu'?'横版原图':'俯视适配');
 if($('audioStatus'))$('audioStatus').textContent='本期配乐与音效为程序合成；下方音量可调。旧角色音频另行保留。';if($('relayMessage'))$('relayMessage').textContent=r12.messageTime?r12.message:hero==='ryu'?'↑↓ 攀墙 · 空格跳跃 · J 挥刀 · L 忍术 · E 换武器':'方向移动 · J / 空格开炮 · 星星升级 · 砖墙可破坏';
}
const r12OldDraw=draw;draw=function(){return r12IsHero()?r12Draw():r12OldDraw();};
const r12OldUI=updateHeroUI;updateHeroUI=function(){if(!r12IsHero())return r12OldUI();$('stage').style.setProperty('--scene-background','#09121c');$('heroStatus').textContent=r12?hero==='ryu'?'隼龙 · HP '+ninja.hp+'/16 · '+R12_WEAPONS[ninja.weapon].label:'坦克大战 · 火力 '+(r12.tank.power+1)+' · '+(r12.tank.shield?'护盾生效':'谨慎推进'):heroHelp[hero];};
// 0.8: unwanted tank melodic loop removed. Pack start/result cues are managed separately.
NINJA_TUNES.tank_clear={step:.14,notes:[48,55,60,0,60,64,67,0,72,67,64,60,72,0,0,0]};NINJA_TUNES.tank_flag={step:.08,notes:[48,55,60,67,72,0]};
function r12Sound(name){if(!audio||!soundOn)return;const key='r12_'+name;if(!bank.has(key)){
 const duration=name==='blast'?.3:.09,buf=audio.createBuffer(1,Math.ceil(duration*audio.sampleRate),audio.sampleRate),arr=buf.getChannelData(0);let seed=1927;
 for(let i=0;i<arr.length;i++){seed=(seed*1664525+1013904223)>>>0;const t=i/audio.sampleRate,env=Math.pow(1-i/arr.length,2);arr[i]=((seed/4294967296*2-1)*.16+Math.sin(t*Math.PI*2*(name==='blast'?64:120))*.08)*env;}bank.set(key,{buffer:buf,gain:.65});}oneShot(key);}
const r12OldDesired=desiredMusic;desiredMusic=function(){return r12IsHero()?(mode==='playing'?(hero==='tank'?'tank_theme':'ryu_theme'):null):r12OldDesired();};
const r12OldSync=audioSync;audioSync=function(){if(!r12IsHero())return r12OldSync();if(!audio)return;if(mode==='paused'||document.hidden||!soundOn){stopMusic(true);return;}if(mode==='playing'&&r12?.target!=='handoff')playMusic(hero==='tank'?'tank_theme':'ryu_theme');else stopMusic(false);};
const r12OldOneShot=oneShot;oneShot=function(key,options={}){if(hero==='tank'&&(key==='clear'||key==='flag'))key='tank_'+key;return r12OldOneShot(key,options);};
const r12OldSelect=selectHero;selectHero=function(id){r12OldSelect(id);if(r12IsHero()){$('actionLabel').textContent=hero==='tank'?'开炮 / J / 空格':'挥刀 / J · 忍术 / L';$('downLabel').textContent=hero==='tank'?'四向移动 / 俯视':'攀墙 / ↑↓ · 切武器 / E';}if($('ninjaTouch'))$('ninjaTouch').hidden=!r12IsHero();for(const action of ['special','cycle']){const button=document.querySelector('#ninjaTouch [data-action="'+action+'"]');if(button)button.hidden=hero!=='ryu';}const fireTouch=document.querySelector('.touchkey.run'),jumpTouch=document.querySelector('.touchkey.jump');if(fireTouch){fireTouch.hidden=hero==='tank';fireTouch.textContent=hero==='ryu'?'挥刀':'加速/发射';}if(jumpTouch)jumpTouch.textContent=hero==='tank'?'开炮':'跳跃';if($('moveLabel'))$('moveLabel').textContent=hero==='tank'?'四向移动':'左右移动';if($('jumpLabel'))$('jumpLabel').textContent=hero==='tank'?'开炮 / 按住连射':'跳跃 / 按住高跳';};
const r12OldCharacters=showCharacters;showCharacters=function(){r12OldCharacters();r12=null;r12RelayActive=false;$('overlayLabel').textContent='RESCUE RELAY / CHAPTER 02';$('overlayTitle').innerHTML='地下援军 · 1-2';$('overlayText').textContent=heroHelp[hero];if($('relayStart'))$('relayStart').hidden=false;};
const tankCard=document.createElement('button');tankCard.className='secondary';tankCard.dataset.hero='tank';tankCard.setAttribute('aria-pressed','false');tankCard.innerHTML='<canvas width="64" height="80" aria-hidden="true"></canvas><strong>坦克大战</strong><small>1-2 · 俯视破阵</small>';$('heroPicker').appendChild(tankCard);tankCard.addEventListener('click',()=>selectHero('tank'));
const ryuCard=document.querySelector('[data-hero="ryu"]');ryuCard.querySelector('small').textContent='1-2 · 横版潜入';
const relayStart=document.createElement('button');relayStart.id='relayStart';relayStart.className='secondary';relayStart.textContent='双角色接力：忍龙 → 坦克';relayStart.addEventListener('click',()=>{r12RelayRequested=true;mode='menu';selectHero('ryu');startGame();r12RelayRequested=false;});$('mainAction').after(relayStart);
for(const id of ['mario','bill','megaman']){const b=document.querySelector('[data-hero="'+id+'"]');b.querySelector('small').textContent='保留原版 1-1';}
r12Ready.then(()=>{for(const [id,button] of [['ryu',ryuCard],['tank',tankCard]]){const g=button.querySelector('canvas').getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,64,80);g.save();g.scale(2,2);if(id==='ryu')r12DrawRyu(g,10,36,1,'idle');else r12DrawTank(g,10,16,3,false);g.restore();}}).catch(e=>{console.error(e);$('overlayText').textContent='素材加载失败，请检查下载是否完整。';});
if($('ninjaTouch')){const cycle=document.createElement('button');cycle.className='touchkey';cycle.dataset.action='cycle';cycle.textContent='切换';// Touchbar listener in the base source ran earlier, wire this late addition explicitly.
 cycle.addEventListener('pointerdown',e=>{e.preventDefault();touch.set(e.pointerId,'cycle');cycle.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])cycle.addEventListener(ev,e=>touch.delete(e.pointerId));$('ninjaTouch').appendChild(cycle);}
const r12OldHide=hideOverlay;hideOverlay=function(){r12OldHide();if($('relayStart'))$('relayStart').hidden=true;};
showCharacters();selectHero('ryu');
if((new URLSearchParams(location.search).has('test')||document.documentElement.dataset.test==='1'))window.__relayTest={
 map:RELAY12_MAP,tiles:()=>[...tiles.values()].map(t=>({...t})),geometry(area='underground'){const q=relayBuildGeometry(RELAY12_MAP.areas[area]);return [...q.tiles.values()].map(t=>({...t}));},
 state(){return r12?{hero,area:r12.area,mode,relay:r12RelayActive,p:{...player},tank:{...r12.tank},hp:ninja.hp,spirit:ninja.spirit,weapon:ninja.weapon,unlocked:[...ninja.unlocked],wall:ninja.wall,attack:ninja.attack,transition:r12.transition,target:r12.target,checkpoint:{...r12Checkpoint},lifts:r12.lifts.map(e=>({...e})),water:r12.water,bridges:r12.bridges,foes:ninja.foes.map(e=>({...e})),shots:ninja.projectiles.map(s=>({...s,hit:[...(s.hit||[])]})),drops:ninja.drops.map(e=>({...e})),lives,score,time:timeLeft,events:r12Journal.slice(),solidCount:tiles.size}:null;},
 start(id='ryu',relay=false){r12RelayRequested=relay;mode='menu';selectHero(id);startGame();r12RelayRequested=false;draw();},
 load(area='underground',x,y){r12Load(area,false,x===undefined?null:[x,y]);draw();},place(x,y){Object.assign(player,{x,y,vx:0,vy:0,invuln:0,grounded:false});ninja.wall=0;ninja.hit=0;mode='playing';hideOverlay();draw();},
 give:r12Give,step(n=1,input={}){virtualInput={...input};for(let i=0;i<n;i++)fixedUpdate();virtualInput=null;draw();return this.state();},
 damage(){hero==='tank'?r12TankHurt({x:player.x-20}):ninjaHurt({x:player.x-20,w:10});},die,
 clearFoes(){ninja.foes=[];},setFoes(es){ninja.foes=es;},tankSet(v){Object.assign(r12.tank,v);},setNinja(v){Object.assign(ninja,v);},
 blocked(x,y){return r12TankCollides({x,y,w:12,h:12});},tile(x,y){return at(x,y);},bump(x,y){ninjaBump(at(x,y));},
 travel:r12Travel,events:()=>r12Journal,draw:r12Draw,mutateTile(x,y,type){return put(tiles,x,y,type);},
 setShots(ss){ninja.projectiles=ss.map(s=>({...s,hit:new Set(s.hit||[])}));},audioState(){return {context:audio?.state,desired:desiredMusic(),bgm:bgm?.key,voices:[...voices].map(v=>v.key),log:audioLog.slice(),buffers:[...bank].map(([key,v])=>({key,duration:v.buffer?.duration}))};},clearShots(){ninja.projectiles=[];},snapshot:()=>({mode,hero,area:r12?.area,score,coins,lives}),captureStream(){audioInit();const dest=audio.createMediaStreamDestination();master.connect(dest);const stream=canvas.captureStream(30);for(const track of dest.stream.getAudioTracks())stream.addTrack(track);return stream;},assets:()=>Object.keys(R12_SPRITES)
};

/* 0.3.0 — source-shaped terrain, physical tank contact, descending secret route.
 * This module is intentionally separate from the canonical 1-2 map data.
 */
let r03Rewards={ninja:false,tank:false},r03Challenge=null,r03Terrain=[],r03OriginalAudioStatus='not-started';
const R03_ASSET_IDS=['water-a','water-b','wall-brick','wall-steel','grass','base-eagle','player-tank','enemy-basic','enemy-armor','ng-bat','ng-thug','barbarian-walk','item-shuriken','item-windmill','item-flame','item-spirit','item-health','power-star'];
const r03Ready=Promise.all(R03_ASSET_IDS.map(id=>new Promise((ok,fail)=>{const im=new Image();im.onload=()=>{R12_SPRITES[id]=im;ok();};im.onerror=()=>fail(Error('Missing asset '+id));im.src=R12_EMBEDDED_IMAGES['relay12/assets/'+id+'.png'];})));
window.__mixReady=Promise.all([window.__mixReady,r03Ready]);
R12_WEAPONS.spin={label:'跳跃旋风斩',hud:'SPIN',cost:5};
const r03Shape=(id,name,width,blocks,spawn=[24,176])=>({id,name,width,blocks,spawn,floor:[[0,width/2]],ceiling:[],coins:[],pipes:[],lifts:[],nativeEnemies:[],landmarks:[]});
RELAY12_MAP.areas.alley=r03Shape('alley','忍龙支线 · 街巷潜入',512,[{kind:'stone',x:0,y:88,nx:1,ny:11},{kind:'brick',x:96,y:8,nx:3,ny:2},{kind:'brick',x:168,y:8,nx:2,ny:3}]);
RELAY12_MAP.areas.bar=r03Shape('bar','忍龙支线 · JAY’S BAR',256,[{kind:'stone',x:0,y:96,nx:1,ny:12},{kind:'stone',x:120,y:96,nx:1,ny:12}]);
RELAY12_MAP.areas.defense=r03Shape('defense','坦克支线 · 第一关基地保卫',256,[]);
const r03IsSecret=()=>!!r12&&['alley','bar','defense'].includes(r12.area);
const r03OldStart=startGame;
startGame=function(){if(r03Challenge?.failed&&r12IsHero()){r03StartChallenge(r03Challenge.kind);return;}r03Rewards={ninja:false,tank:false};r03Challenge=null;r03Terrain=[];return r03OldStart();};
const r03OldSelect=selectHero;selectHero=function(id){r03Challenge=null;return r03OldSelect(id);};
heroHelp.ryu='1-2 横版原图。J 挥刀，空格/K 跳跃，L 忍术，E 切换。第一道悬崖的绳索边，贴墙按 ↓ 下行进入街巷与首关 Boss；普通坠落仍会死亡。';
heroHelp.tank='1-2 俯视原图适配。方向移动，J/空格开炮。河流挡车但不挡弹；草丛遮挡，冰面滑行。碰车不掉命。第一根标记管道进入守护基地挑战。';
const r03OldLoad=r12Load;
r12Load=function(area,preserve=false,spawn=null,keepGeometry=false){
 r03OldLoad(area,preserve,spawn,keepGeometry);r12.r03descent=0;r12.r03Grip=0;r03Terrain=[];
 if(hero==='tank'){
  r12.water=[];r12.bridges=[]; // Remove the previous invented pit-wide water and long service decks.
  // The original ceiling and ground bands become water; internal silhouettes stay in place.
  r12.water=[{x:0,y:24,w:r12.def.width,h:24},{x:0,y:208,w:r12.def.width,h:40}];
  if(area==='underground')r03Terrain=[{x:336,y:64,w:64,h:32,kind:'grass'},{x:1392,y:144,w:64,h:32,kind:'grass'},{x:704,y:176,w:80,h:32,kind:'ice'},{x:2256,y:112,w:96,h:32,kind:'ice'}];
  for(const e of ninja.foes)if(e.tankKind==='armor')e.hp=e.maxHp=4;
  r12Unstick(player,true);
 }else if(area==='underground'){
  // Only extend the two faces beneath the existing FIRST 1-2 gap. No above-ground tile is moved.
  for(let y=15;y<=21;y++)for(const x of [79,83]){put(tiles,x,y,'stone');at(x,y).routeExtension=true;}
 }
 if(area==='alley'){
  ninja.foes=[ninjaEnemy('walker',180,180,501),ninjaEnemy('thrower',304,180,502),ninjaEnemy('hawk',382,102,503)];
  ninja.lanterns=[{x:62,y:154,w:12,h:18,id:551,type:'spirit',dead:false},{x:234,y:130,w:12,h:18,id:552,type:'health',dead:false}];
  r12Message('支线 1 / 2 · 穿过街巷，进入右侧酒吧。',240);r03Challenge={kind:'ninja',failed:false};
 }else if(area==='bar'){
  ninja.foes=[{...ninjaEnemy('barbarian',182,166,601),w:26,h:42,hp:8,maxHp:8,phase:'walk',clock:0,swings:0,hitLock:0}];
  ninja.hp=Math.min(16,ninja.hp+4);r03Challenge={kind:'ninja',failed:false};
  r12Message('支线 2 / 2 · 躲开连斩，借墙换边，再反击。',240);
 }else if(area==='defense')r03InitDefense();
 r12.discovered.add('v0.3');r03CheckSpawn();
};
function r03CheckSpawn(){if(hero!=='tank'||r12?.area==='defense')return;for(const e of ninja.foes){if(e.dead)continue;if(r12TankCollides(e)){r12Unstick(e,true);if(r12TankCollides(e))e.dead=true;}}}
r12Unstick=function(p,tank=false){const blocked=b=>tank?r12TankCollides(b):solids(b).length;if(!blocked(p))return;const o={x:p.x,y:p.y};for(let r=1;r<=32;r++)for(const [dx,dy] of [[0,-r*4],[-r*4,0],[r*4,0],[0,r*4]]){const b={x:o.x+dx,y:o.y+dy,w:p.w,h:p.h};if(b.x>=16&&b.y>=24&&b.y+b.h<=208&&!blocked(b)){p.x=b.x;p.y=b.y;return;}}};
// Normal tanks block one another, including shielded tanks. There is no contact damage.
r12TankMove=function(b,dir,speed){const [dx,dy]=R12_DIR[dir],q={...b,x:b.x+dx*speed,y:b.y+dy*speed};
 if(r12TankCollides(q))return false;
 const bodies=ninja.foes.filter(e=>e!==b&&!e.dead&&!e.spawn);if(b!==player)bodies.push(player);
 if(bodies.some(e=>overlap(q,e)&&!overlap(b,e)))return false;
 if(bodies.some(e=>overlap(q,e)&&overlap(b,e)&&Math.abs(q.x-e.x)+Math.abs(q.y-e.y)<Math.abs(b.x-e.x)+Math.abs(b.y-e.y)))return false;
 b.x=q.x;b.y=q.y;return true;
};
function r03TileParts(t){const mask=t.parts??15,x=t.x*T,y=t.y*T;return [0,1,2,3].filter(i=>mask&(1<<i)).map(i=>({x:x+(i%2)*8,y:y+Math.floor(i/2)*8,w:8,h:8}));}
const r03OldSolids=solids;
solids=function(b){const found=r03OldSolids(b);return hero==='tank'?found.filter(t=>t.type==='ground'||(t.y>2&&r03TileParts(t).some(q=>overlap(q,b)))):found;};
r12TankCollides=function(b){if(r12?.area==='defense')return b.x<24||b.y<24||b.x+b.w>232||b.y+b.h>232||(r03Challenge?.blocks||[]).some(t=>!t.dead&&overlap(b,t))||(r03Challenge?.base?overlap(b,r03Challenge.base):false);
 if(!r12||b.y<48||b.y+b.h>208||b.x<16||b.x+b.w>r12.def.width-16)return true;
 return solids(b).some(t=>t.type!=='ground');
};
r12TankPlayer=function(input){const p=player,t=r12.tank;for(const k of ['shield','freeze','cool'])if(t[k]>0)t[k]--;if(p.invuln)p.invuln--;
 const dir=input.left?2:input.right?0:input.up?3:input.down?1:null;const onIce=r03Terrain.some(s=>s.kind==='ice'&&overlap(p,s));p.vx=p.vy=0;
 if(dir!==null){t.dir=dir;p.dir=dir;t.glide=onIce?20:0;t.glideDir=dir;if(r12TankMove(p,dir,1.4)){p.vx=R12_DIR[dir][0]*1.4;p.vy=R12_DIR[dir][1]*1.4;t.track++;}}
 else if(onIce&&t.glide>0){t.glide--;if(r12TankMove(p,t.glideDir,1.4*t.glide/20))t.track++;else t.glide=0;}else t.glide=0;
 if((input.run||input.jump)&&!t.cool)r12TankShot(p);p.grounded=true;p.facing=t.dir===2?-1:1;
 r12CommonPlayer(input);
};
const r03OldBreak=r12Break;
r12Break=function(t,by='sword'){if(hero==='tank'&&by==='cannon'&&r12?.area!=='defense'){
 if(t.type==='ground'||t.type==='pipe')return false;
 if(t.content&&!t.used){if(r12.r03Impact?.friendly!==false)ninjaBump(t);return false;}
 if(t.used||t.type==='question')return false;
 if(t.type==='stone'&&(r12.r03Impact?.friendly===false||(r12.r03Impact?.power??r12.tank.power)<3)){r12Sound('steel');return false;}
 if(!['brick','stone'].includes(t.type))return false;
 const s=r12.r03Impact;let remove=15;
 if(((r12.r03Impact?.power??r12.tank.power)<3||s?.friendly===false)&&s){const parts=r03TileParts(t);const right=s.vx<0,down=s.vy<0;
 if(s.vx){const col=right?Math.max(...parts.map(p=>p.x)):Math.min(...parts.map(p=>p.x));remove=col===t.x*T?5:10;}
 else{const row=down?Math.max(...parts.map(p=>p.y)):Math.min(...parts.map(p=>p.y));remove=row===t.y*T?3:12;}}
 t.parts=(t.parts??15)&~remove;if(!t.parts)tiles.delete(tileKey(t.x,t.y));ninjaDust(t.x*T+8,t.y*T+8,'#d29a60',5);r12Event('terrain-hit',{x:t.x,y:t.y,remaining:t.parts,by});return true;
 }return r03OldBreak(t,by);};
const r03OldThrow=ninjaThrow;
ninjaThrow=function(){if(ninja.weapon!=='spin')return r03OldThrow();if(ninja.cool||ninja.hit)return;if(player.grounded){r12Message('跳跃旋风斩：先跳起来，再按忍术。');return;}if(ninja.spirit<5){ninjaSound('empty');return;}ninja.spirit-=5;ninja.cool=28;ninja.spin=24;ninja.spinHit=new Set();ninjaSound('slash');r12Event('weapon',{weapon:'spin',cost:5});};
function r03TryDescent(input){if(hero!=='ryu'||r12.area!=='underground')return false;
 const p=player,near=p.x>=1278&&p.x+p.w<=1330;
 if(near&&ninja.wall&&input.down&&p.y+p.h>207){r12.r03descent++;r12.r03Grip=8;}else if(r12.r03Grip)r12.r03Grip--;
 if(near&&input.down&&r12.r03Grip&&r12.r03descent>=8&&p.y+p.h>254){r12Event('cliff-descent',{x:p.x,y:p.y});r12Travel('alley');return true;}return false;
}
const r03OldCommon=r12CommonPlayer;
r12CommonPlayer=function(input){
 if(r12.area==='alley'){
  if(player.x>463){r12Travel('bar');return;}
 }else if(r12.area==='bar'){
  if(r03Challenge?.won&&player.x>212&&input.down){r12Travel('exit');return;}
 }else if(r12.area==='defense')return;
 r03OldCommon(input);
 if(hero==='ryu'&&r12.area==='underground'&&player.x>=1250&&player.x<1350&&player.y>174)r12.camY=clamp(player.y-174,0,105);
};
const r03OldTravel=r12Travel;
r12Travel=function(target,spawn=null){if(target==='bonus'&&hero==='tank'){target='defense';spawn=null;}r03OldTravel(target,spawn);};
function r03StartChallenge(kind){r03Challenge=null;mode='playing';r12Load(kind==='tank'?'defense':'bar',true);player.invuln=120;hideOverlay();}
const r03OldDamageEnemy=r12DamageEnemy;
r12DamageEnemy=function(e,amount=1){if(e.kind==='barbarian'){if(e.hitLock||e.dead)return;e.hitLock=12;e.hp-=amount;e.flash=9;r12Event('boss-hit',{hp:e.hp});ninjaSound('hit');if(e.hp<=0){r12Kill(e);r03WinChallenge('ninja');}return;}r03OldDamageEnemy(e,amount);};
function r03WinChallenge(kind){if(r03Challenge?.won)return;r03Challenge.won=true;r03Challenge.wonAt=frame;
 if(!r03Rewards[kind]){r03Rewards[kind]=true;if(kind==='ninja'){ninja.unlocked.push('spin');ninja.weapon='spin';ninja.spirit=Math.min(30,ninja.spirit+10);ninja.hp=Math.min(16,ninja.hp+4);}else{r12.tank.power=3;r12.tank.shield=600;}r12Event('secret-reward',{kind,reward:kind==='ninja'?'jump-and-slash':'max-power-shield'});}
 ninja.projectiles=[];stopMusic();oneShot(hero==='ryu'?'ryu_clear':'tank_clear');r12Message(kind==='ninja'?'获得跳跃旋风斩！右侧管道按 ↓ 回到旗杆。':'基地守护成功！获得满级火力与护盾。右上出口按 ↑ 返回。',600);
}
const r03OldEnemies=r12NinjaEnemies;
r12NinjaEnemies=function(){if(r12.area!=='bar')return r03OldEnemies();const e=ninja.foes[0];if(!e||e.dead)return;
 e.t++;e.clock++;if(e.hitLock)e.hitLock--;if(e.flash)e.flash--;
 if(e.phase==='walk'){e.dir=player.x<e.x?-1:1;r12Body(e,e.dir*.55,0);if(e.clock>=65){e.phase='windup';e.clock=0;e.swings=0;}}
 else if(e.phase==='windup'&&e.clock>=24){e.phase='slash';e.clock=0;ninjaSound('slash');}
 else if(e.phase==='slash'){
  if(e.clock>=4&&e.clock<=13){const box={x:e.dir>0?e.x+14:e.x-19,y:e.y+8,w:30,h:27};if(overlap(box,player))ninjaHurt(e);}
  if(e.clock>=20){e.swings++;e.clock=0;e.phase=e.swings<2?'windup':'recover';}
 }else if(e.phase==='recover'&&e.clock>=45){e.phase='walk';e.clock=0;}
};
// Exact first-stage obstacle positions transcribed from newagebegins/BattleCity Stages.js.
const R03_STAGE1_RUNS=[
 [64,48,2,9],[128,48,2,9],[192,48,2,7],[256,48,2,7],[320,48,2,9],[384,48,2,9],
 [224,112,2,2,'steel'],[32,224,2,1],[32,240,2,1,'steel'],[96,224,4,2],[320,224,4,2],[416,224,2,1],[416,240,2,1,'steel'],
 [192,192,2,2],[256,192,2,2], [64,288,2,7],[128,288,2,7],[320,288,2,7],[384,288,2,7],
 [192,256,2,6],[256,256,2,6],[224,272,2,2],
 [208,384,1,3],[224,384,2,1],[256,384,1,3]
];
function r03InitDefense(){
 const blocks=[];const seen=new Set();for(const [x,y,nx,ny,type='brick'] of R03_STAGE1_RUNS)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const key=(x+i*16)+','+(y+j*16);if(seen.has(key))continue;seen.add(key);blocks.push({x:24+(x+i*16-32)/2,y:24+(y+j*16-16)/2,w:8,h:8,type,dead:false});}
 r03Challenge={kind:'tank',blocks,base:{x:120,y:216,w:16,h:16},failed:false,won:false,spawned:0,total:4,kills:0,clock:0,spawnClock:0};
 tiles=new Map();pipes=[];looseCoins=[];r12.water=[];r12.bridges=[];r03Terrain=[];ninja.foes=[];ninja.projectiles=[];ninja.lanterns=[];
 // Fixed, reachable supplies for the short four-enemy defense. These are
 // independent of the main-route carrier cycle; its first star is unchanged.
 ninja.drops=[
  {x:90,y:196,w:12,h:12,type:'shovel',id:100101,anchored:true,fixedSupply10:true},
  {x:154,y:196,w:12,h:12,type:'grenade',id:100102,anchored:true,fixedSupply10:true},
  {x:58,y:172,w:12,h:12,type:'timer',id:100103,anchored:true,fixedSupply10:true},
  {x:186,y:172,w:12,h:12,type:'helmet',id:100104,anchored:true,fixedSupply10:true}
 ];
 Object.assign(player,{x:90,y:216,w:12,h:12,invuln:120,dir:3});r12.tank.dir=3;r12.tank.power=Math.max(1,r12.tank.power);r12.tank.shield=180;
 r12Message('原第一关布局 · 击破 4 辆敌车，保护底部鹰徽。炮弹也会误伤基地。',300);
}
function r03DefenseTick(input){const c=r03Challenge,t=r12.tank;c.clock++;frame++;r12.ticks++;if(r12.messageTime)r12.messageTime--;
 if(c.won){if(input.up&&player.x>204&&player.y<55&&frame-c.wonAt>60)r12Travel('exit');r12TankPlayer(input);return;}
 if(c.failed)return;
 if(c.spawned<c.total&&ninja.foes.filter(e=>!e.dead).length<2&&c.spawnClock--<=0){const x=[24,124,220][c.spawned%3];if(!ninja.foes.some(e=>!e.dead&&Math.abs(e.x-x)<18&&e.y<46)){
 ninja.foes.push({kind:'tank',tankKind:'basic',id:700+c.spawned,x,y:24,w:12,h:12,dir:1,t:0,cool:100,hp:1,maxHp:1,dead:false,spawn:50,turn:0});c.spawned++;c.spawnClock=150;}}
 r12TankPlayer(input);
 for(const d of ninja.drops)if(!d.gone&&overlap(player,d)){r12Give(d.type);d.gone=true;}ninja.drops=ninja.drops.filter(d=>!d.gone);
 if(!t.freeze)for(const e of ninja.foes){if(e.dead)continue;if(e.spawn){e.spawn--;continue;}e.t++;if(e.cool)e.cool--;if(e.flash)e.flash--;
 if(e.t%70===1)e.dir=e.y>190?(e.x<114?0:e.x>138?2:1):e.t%210<140?1:((e.id%2)?0:2);
 if(!r12TankMove(e,e.dir,.55)&&e.t%40===0)e.dir=(e.dir+1)%4;
 if(!e.cool){r12TankShot(e,false);e.cool=100;}}
 for(const s of ninja.projectiles){if(s.life<=0)continue;s.life--;const steps=Math.ceil(Math.max(Math.abs(s.vx),Math.abs(s.vy))/2);for(let k=0;k<steps&&s.life>0;k++){
 s.x+=s.vx/steps;s.y+=s.vy/steps;
 const wall=c.blocks.find(w=>!w.dead&&overlap(s,w));if(wall){if(wall.type==='brick'||(s.friendly&&t.power===3))wall.dead=true;s.life=0;ninjaDust(s.x,s.y);break;}
 if(overlap(s,c.base)){s.life=0;c.failed=true;mode='gameover';stopMusic();r12Message('基地被击毁。按重试重新挑战。',9999);showOverlay('BASE LOST','基地失守','炮弹击中了鹰徽。坦克车体接触不造成伤害。','重试基地挑战 →');r12Event('base-destroyed',{friendly:s.friendly});break;}
 if(s.friendly){for(const e of ninja.foes)if(!e.dead&&!e.spawn&&overlap(s,e)){r12DamageEnemy(e);s.life=0;break;}}
 else if(overlap(s,player)){r12TankHurt(s);s.life=0;}
 if(s.x<24||s.x>232||s.y<24||s.y>232)s.life=0;
 }}
 for(const a of ninja.projectiles)if(a.friendly&&a.life>0)for(const b of ninja.projectiles)if(!b.friendly&&b.life>0&&overlap(a,b))a.life=b.life=0;
 ninja.projectiles=ninja.projectiles.filter(s=>s.life>0);c.kills=ninja.foes.filter(e=>e.dead).length;
 for(const f of ninja.fx){f.x+=f.vx;f.y+=f.vy;f.life--;}ninja.fx=ninja.fx.filter(f=>f.life>0);
 if(c.spawned===c.total&&c.kills===c.total&&!c.failed)r03WinChallenge('tank');
}
// Hidden deaths retry the current scene, not an unrelated 1-2 checkpoint.
const r03OldReset=resetLife;
resetLife=function(){if(r12?.area==='defense'&&!r03Challenge?.failed){mode='playing';Object.assign(player,{x:90,y:216,w:12,h:12,vx:0,vy:0,invuln:180,dir:3});Object.assign(r12.tank,{dir:3,power:0,shield:180,cool:0,glide:0});r12Event('defense-respawn',{remaining:r03Challenge.total-r03Challenge.kills});hideOverlay();audioSync();return;}if(r03IsSecret()){const area=r12.area,power=r12.tank.power;resetGameAudio();r12Load(area,false);if(hero==='tank')r12.tank.power=Math.max(1,power);player.invuln=120;audioSync();return;}r03OldReset();};
const r03OldFixed=fixedUpdate;
fixedUpdate=function(){if(!r12IsHero()||!r12)return r03OldFixed();if(r12.area==='defense'&&mode==='playing'&&!r12.transition){r03DefenseTick(getInput());audioSync();return;}
 r03OldFixed();if(!r12||!ninja||mode!=='playing'||r12.transition)return;
 if(ninja.spin>0){ninja.spin--;const box={x:player.x-16,y:player.y-9,w:44,h:44};for(const e of ninja.foes)if(!e.dead&&overlap(box,e)&&!ninja.spinHit.has(e.id)){ninja.spinHit.add(e.id);r12DamageEnemy(e,2);}}
};
const r03OldHandoff=r12Handoff;
r12Handoff=function(){if(r12.area!=='exit')return r03OldHandoff();hero='tank';r12Load('underground',false,[1520,176]);r12.handoff=true;r12.tank.power=2;r12.tank.shield=300;lives=3;r12Event('handoff',{from:'ryu',to:'tank',branch:true});r12Message('忍龙已抵达地面。坦克接手地下后段，打通援军路线。',240);};
const r03OldDrawTank=r12DrawTank;
r12DrawTank=function(g,x,y,dir,enemy=false,t=0,armored=false){const im=R12_SPRITES[enemy?(armored?'enemy-armor':'enemy-basic'):'player-tank'];if(!im)return r03OldDrawTank(g,x,y,dir,enemy,t,armored);g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x+6),Math.round(y+6));g.rotate((dir+1)*Math.PI/2);g.drawImage(im,-8,-8,16,16);if(Math.floor(t/6)%2){g.fillStyle=enemy?'#7da6a0':'#ab8d31';g.fillRect(-7,-4,2,2);g.fillRect(5,2,2,2);}g.restore();};
const r03OldDrawEnemy=r12DrawEnemy;
r12DrawEnemy=function(e){if(e.dead||e.flash&&frame%2)return;
 if(e.kind==='barbarian'){const im=R12_SPRITES['barbarian-walk'];if(im){ctx.save();ctx.translate(Math.round(e.x-camera+13),Math.round(e.y+e.h));if(e.dir<0)ctx.scale(-1,1);ctx.drawImage(im,-32,-64,64,64);if(e.phase==='windup'){rect(16,-59,3,3,'#ffe19a');}if(e.phase==='slash'&&e.clock<14){rect(8,-28,29,3,'#f4e9d8');rect(31,-31,5,6,'#f8efdf');}ctx.restore();}return;}
 const id=e.kind==='walker'||e.kind==='thrower'?'ng-thug':e.kind==='hawk'?'ng-bat':null,im=id&&R12_SPRITES[id];
 if(!im)return r03OldDrawEnemy(e);const cw=e.kind==='hawk'?16:25,ch=e.kind==='hawk'?16:40,idx=Math.floor(e.t/9)%(e.kind==='hawk'?2:3);
 ctx.save();ctx.translate(Math.round(e.x-camera+e.w/2),Math.round(e.y+e.h));if(e.dir<0)ctx.scale(-1,1);ctx.drawImage(im,idx*cw,0,cw,ch,-cw/2,-ch,cw,ch);ctx.restore();
};
const r03OldDrawDrop=r12DrawDrop;
r12DrawDrop=function(d){const id=hero==='ryu'?({'shuriken':'item-shuriken',windmill:'item-windmill',flame:'item-flame',spirit:'item-spirit',health:'item-health'}[d.type]):d.type==='star'?'power-star':null;const im=R12_SPRITES[id];if(!im)return r03OldDrawDrop(d);ctx.drawImage(im,Math.round(d.x-camera-2),Math.round(d.y-2),16,16);};
function r03TileImage(id,x,y,w=16,h=16){const im=R12_SPRITES[id];if(im)ctx.drawImage(im,Math.round(x),Math.round(y),w,h);}
const r03OldDrawMap=r12DrawMap;
r12DrawMap=function(){
 if(r12.area==='defense'){
  rect(0,0,W,H,'#525252');rect(24,24,208,208,'#000');for(const t of r03Challenge.blocks)if(!t.dead)r03TileImage(t.type==='steel'?'wall-steel':'wall-brick',t.x,t.y,8,8);
  r03TileImage('base-eagle',120,216,16,16);return;
 }
 if(['alley','bar'].includes(r12.area)){
  rect(0,0,W,H,'#080820');const bar=r12.area==='bar';
  for(let x=Math.floor(camera/64)*64;x<camera+W;x+=64){rect(x-camera,bar?56:88,62,120,bar?'#311f42':'#192443');for(let y=bar?62:100;y<180;y+=24){rect(x-camera+6,y,18,16,'#4f4966');rect(x-camera+9,y+2,4,11,'#a2aec1');rect(x-camera+37,y,18,16,'#4f4966');}}
  if(bar){rect(16,144,224,6,'#9b724a');rect(16,150,224,38,'#463046');for(let x=20;x<232;x+=20){rect(x,154,13,26,'#704655');rect(x,144,12,3,'#e1bb78');}text('JAY\'S BAR',128,63,'#f4c46b',1.2,true);}
  else{for(let x=128;x<512;x+=192){rect(x-camera,96,42,22,'#954b66');text('JAY',x-camera+21,103,'#f7d6ba',.75,true);}rect(470-camera,145,24,63,'#66416e');text('BAR',482-camera,134,'#eed6aa',.7,true);}
  for(const t of tiles.values())if(t.x*T>camera-16&&t.x*T<camera+W)drawBlock(t);
  if(bar&&r03Challenge?.won){sprite('pipe_top',208,176);sprite('pipe_body',208,192);}return;
 }
 if(hero!=='tank'){r03OldDrawMap();if(r12.area==='underground'){
  const x=1280-camera;

 }return;}
 const surface=r12.area==='entrance'||r12.area==='exit';rect(0,0,W,H,'#05090d');
 // Open air in the SAME 1-2 drawing is the tank's traversable plane, not a new arena.
 for(let x=Math.floor(camera/16)*16;x<camera+W;x+=16)for(const y of [32,208,224])r03TileImage(frame%40<20?'water-a':'water-b',x-camera,y);
 for(const s of r03Terrain)if(s.kind==='ice'){for(let x=s.x;x<s.x+s.w;x+=16)for(let y=s.y;y<s.y+s.h;y+=16){if(at(x/16,y/16))continue;rect(x-camera,y,16,16,'#b8d8e3');rect(x-camera+2,y+2,9,1,'#f1fbff');rect(x-camera+6,y+9,8,1,'#e5f2ff');}}
 for(const t of tiles.values()){if(t.x*T<camera-16||t.x*T>camera+W||t.type==='ground'||t.y<=2)continue;
  if(t.type==='pipe'){drawBlock(t);continue;}if(t.used||t.type==='question'){drawBlock(t);continue;}
  const im=R12_SPRITES[t.type==='stone'?'wall-steel':'wall-brick'];if(im)for(const p of r03TileParts(t)){const sx=p.x-t.x*T,sy=p.y-t.y*T;ctx.drawImage(im,sx,sy,8,8,p.x-camera,p.y,8,8);}
 }
 r12DrawPipes();for(const c of looseCoins)if(c.x>camera-10&&c.x<camera+W)drawCoin(c.x-camera,c.y);
 if(r12.area==='exit'){const x=r12.def.flag-camera;rect(x-1,48,2,144,'#e2dfb3');sprite('flag_top',x-4,40);sprite('flag',x-16,mode==='flag'||mode==='win'?flagY:56);const save=camera;camera=202*T-(r12.def.castle-save);drawCastle();camera=save;}
};
const r03OldDrawHud=r12DrawHud;
r12DrawHud=function(){if(r12.area==='defense'){rect(0,0,256,24,'#191919');text('STAGE 01',8,7,'#eee',.9);text('LEFT '+(r03Challenge.total-r03Challenge.kills),135,7,'#f4cf65',.8);return;}
 r03OldDrawHud();if(r12.area==='bar'&&!r03Challenge.won){text('BOSS',169,18,'#f7b7ad',.65);const b=ninja.foes[0];for(let i=0;i<8;i++)rect(199+i*3,18,2,5,i<(b?.hp||0)?'#dc7777':'#382e3a');}};
const r03OldDraw=r12Draw;
r12Draw=function(){r03OldDraw();if(!r12)return;
 if(hero==='tank'&&r12.area!=='defense'){ctx.save();ctx.beginPath();ctx.rect(0,48,256,160);ctx.clip();for(const s of r03Terrain)if(s.kind==='grass')for(let x=s.x;x<s.x+s.w;x+=16)for(let y=s.y;y<s.y+s.h;y+=16)if(!at(x/16,y/16))r03TileImage('grass',x-camera,y);ctx.restore();}
 if(hero==='ryu'&&ninja.spin>0){ctx.save();ctx.strokeStyle='#d7e6fc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x-camera+6,player.y+13-r12.camY,20,frame*.5,frame*.5+4.9);ctx.stroke();ctx.restore();}
 if($('audioStatus'))$('audioStatus').textContent=r03OriginalAudioStatus==='ready'?'已加载对应游戏项目音轨；效果音和音乐音量可分别调节。':r03OriginalAudioStatus==='loading'?'正在载入源项目音轨；缺失项明确使用回退。':r03OriginalAudioStatus==='partial'?'已加载部分源项目录音；其余仍为合成音效 / 忍者配乐。':'本地含坦克开炮录音；其他缺失项为合成回退。';
};
// Narrow test/debug interface: not exposed on the ordinary page.
if(window.__relayTest){const oldState=__relayTest.state.bind(__relayTest);__relayTest.state=function(){const s=oldState();return s?{...s,rewards:{...r03Rewards},terrain:r03Terrain.map(t=>({...t})),challenge:r03Challenge?{...r03Challenge,blocks:r03Challenge.blocks?.map(b=>({...b}))}:null}:s;};
 __relayTest.secret=kind=>r03StartChallenge(kind);__relayTest.terrain=()=>r03Terrain;__relayTest.contactMove=(dir,speed)=>r12TankMove(player,dir,speed);__relayTest.hitBoss=()=>r12DamageEnemy(ninja.foes[0]);__relayTest.impact=(x,y,vx,vy)=>{r12.r03Impact={vx,vy};return r12Break(at(x,y),'cannon');};__relayTest.sourceStage1=()=>R03_STAGE1_RUNS;}

/* Corresponding-project recordings; optional online loading and local cache support.
 * Public repository availability does not itself establish independent asset licensing.
 * No music is silently described as an original recording when a fallback is active.
 */
const R03_AUDIO_ROOT='https://raw.githubusercontent.com/';
const R03_SOURCE_AUDIO={
 ninja_slash:{repo:'SangMinhTruong/Ninja-Gaiden-NES',ref:'0b5875d9e14c25f35a6460f29b289e1bce3d0daf',path:'NinjaGaiden/Resources/Sound/Effect/Sword.wav'},
 ninja_throw:{repo:'SangMinhTruong/Ninja-Gaiden-NES',ref:'0b5875d9e14c25f35a6460f29b289e1bce3d0daf',path:'NinjaGaiden/Resources/Sound/Effect/Shuriken.wav'},
 ninja_hurt:{repo:'SangMinhTruong/Ninja-Gaiden-NES',ref:'0b5875d9e14c25f35a6460f29b289e1bce3d0daf',path:'NinjaGaiden/Resources/Sound/Effect/NinjaHurt.wav'},
 ninja_hit:{repo:'SangMinhTruong/Ninja-Gaiden-NES',ref:'0b5875d9e14c25f35a6460f29b289e1bce3d0daf',path:'NinjaGaiden/Resources/Sound/Effect/EnemyHurt.wav'},
 ninja_pickup:{repo:'SangMinhTruong/Ninja-Gaiden-NES',ref:'0b5875d9e14c25f35a6460f29b289e1bce3d0daf',path:'NinjaGaiden/Resources/Sound/Effect/ItemCollecting.wav'},
 r12_cannon:{repo:'newagebegins/BattleCity',ref:'a1b1741782dcf23fc814e9a7abc5f383900b2cda',path:'sound/bullet_shot.ogg'},
 r12_blast:{repo:'newagebegins/BattleCity',ref:'a1b1741782dcf23fc814e9a7abc5f383900b2cda',path:'sound/explosion_1.ogg'},
 r12_steel:{repo:'newagebegins/BattleCity',ref:'a1b1741782dcf23fc814e9a7abc5f383900b2cda',path:'sound/bullet_hit_2.ogg'},
 r03_tank_start:{repo:'newagebegins/BattleCity',ref:'a1b1741782dcf23fc814e9a7abc5f383900b2cda',path:'sound/stage_start.ogg'},
 ryu_theme:{repo:'SangMinhTruong/Ninja-Gaiden-NES',ref:'0b5875d9e14c25f35a6460f29b289e1bce3d0daf',path:'NinjaGaiden/Resources/Sound/Stage/3-1 - Pursuit.wav',gain:.52},
 r03_boss_theme:{repo:'SangMinhTruong/Ninja-Gaiden-NES',ref:'0b5875d9e14c25f35a6460f29b289e1bce3d0daf',path:'NinjaGaiden/Resources/Sound/Stage/3-3 Boss Battle.wav',gain:.5}
};
let r03AudioLoading=null,r03SourceAudioKeys=new Set();
async function r03LoadSourceAudio(){if(r03AudioLoading||!audio)return r03AudioLoading;r03OriginalAudioStatus='loading';
 r03AudioLoading=(async()=>{const results=await Promise.allSettled(Object.entries(R03_SOURCE_AUDIO).map(async([key,d])=>{
 const ac=audio,url=R03_AUDIO_ROOT+d.repo+'/'+d.ref+'/'+d.path.split('/').map(encodeURIComponent).join('/');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
 try{const inline=typeof R03_EMBEDDED_AUDIO!=='undefined'&&R03_EMBEDDED_AUDIO[key];let bytes;
 if(inline)bytes=Uint8Array.from(atob(inline),c=>c.charCodeAt(0)).buffer;else{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);bytes=await response.arrayBuffer();}
 const buffer=await ac.decodeAudioData(bytes);if(!buffer.length)throw Error('Empty recording');bank.set(key,{buffer,gain:d.gain??.6});r03SourceAudioKeys.add(key);
 if(bgm?.key===key){stopMusic();audioSync();}return key;
 }finally{clearTimeout(timer);}}));
 r03OriginalAudioStatus=results.every(r=>r.status==='fulfilled')?'ready':r03SourceAudioKeys.size?'partial':'failed';
 r12Event('source-audio-loaded',{loaded:[...r03SourceAudioKeys],failed:results.filter(r=>r.status==='rejected').length});return results;
 })();return r03AudioLoading;
}
const r03AudioInit=audioInit;audioInit=function(){const r=r03AudioInit();if(r12IsHero())r03LoadSourceAudio();return r;};
const r03AudioSync=audioSync;audioSync=function(){if(!r12IsHero()||!audio)return r03AudioSync();
 if(mode==='paused'||document.hidden||!soundOn||mode!=='playing'||r12?.target==='handoff'||(r03IsSecret()&&r03Challenge?.won)){stopMusic();return;}
 if(hero==='tank'){ // Battle City's playfield should not acquire an invented melodic loop.
  stopMusic();if(r12&&r03SourceAudioKeys.has('r03_tank_start')&&!r12.r03StartPlayed){r12.r03StartPlayed=true;oneShot('r03_tank_start');}return;}
 if(r12?.area==='bar'&&r03SourceAudioKeys.has('r03_boss_theme')){playMusic('r03_boss_theme');return;}return r03AudioSync();
};
const r03Desired=desiredMusic;desiredMusic=function(){if(hero==='tank'&&r12)return null;return r03Desired();};
if(window.__relayTest){__relayTest.sourceAudio=()=>({status:r03OriginalAudioStatus,loaded:[...r03SourceAudioKeys],manifest:R03_SOURCE_AUDIO});}
