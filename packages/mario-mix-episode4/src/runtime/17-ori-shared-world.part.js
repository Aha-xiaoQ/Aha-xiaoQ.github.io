/* R29: SharedWorld is live. Every original brick/bridge keeps its canonical ID.
 * Supplemental maintenance ledges/vents are canonical attachments, visible folded
 * in act one and opened by the machine. No replacement tower, iframe or extra RAF.
 * The lantern keeper and environmental detailing are original project artwork.
 */
const O29_LOCAL={};
const O29_PLATFORMS=[
 // R31: keep only a few maintenance footholds. The main ascent should read as
 // the rotated original castle route rather than a freshly added staircase.
 [40,2432,54,0],[94,2296,28],[116,2096,24],
 [100,1944,46,1],[74,1760,32],[92,1664,38,2],
 [108,1480,30],[100,1296,42,3],[108,1136,24],
 [104,824,20],[112,560,36,4],[104,336,28],[126,128,30]
];
const O29_LAMPS=[[108,2394],[118,2280],[140,2150],[118,2028],[156,1868],[118,1788],[124,1695],[132,1560],[118,1432],[141,1308],[109,1180],[113,1064],[112,850],[110,656],[143,508],[124,390],[136,272],[134,154],[142,44]];
const O29_WINDS=[{id:'vent:bridge',x:56,y:2072,w:108,h:170},{id:'vent:entry',x:98,y:84,w:58,h:300}];
const O29_SEGMENTS=[
 {above:2256,name:'空房 · 维修通道',hint:'爷爷已经获救。顺着原砖与借力点穿过窄口。'},
 {above:1968,name:'断桥 · 吊机与上升气流',hint:'断桥没有恢复；优先借原桥头、火棒底座与气流上升。'},
 {above:1664,name:'隐藏砖区 · 反射开路',hint:'隐藏砖还是原来的隐藏砖；反射开路只是捷径，不是主路线。'},
 {above:1152,name:'台基区 · 连续跃迁',hint:'沿原台基往上，组合二段跳、冲刺与借力，不走人造台阶。'},
 {above:576,name:'火棒长廊 · 狭窄竖井',hint:'贴住左壁，攀墙键 + 上；借原墙面和火棒窗口通过。'},
 {above:-20,name:'入口台阶 · 月光出口',hint:'原来的入口就在上方。最后借风冲出城堡！'}
];
function o29Attach(id,kind,x,y,w,h,extra={}){
 // Inverse of the SAME clockwise transform (canonical 2560 x 240 world).
 return {id,kind,x:y,y:240-x-w,w:h,h:w,solid:false,...extra};
}
function o29Spec(){const s=structuredClone(O29_CANONICAL);
 for(let i=0;i<O29_PLATFORMS.length;i++){const [x,y,w,rest]=O29_PLATFORMS[i];s.entities.push(o29Attach('repair:'+i,'repair-ledge',x,y,w,5,{rest:rest??null}));}
 for(let i=0;i<O29_LAMPS.length;i++){const [x,y]=O29_LAMPS[i];s.entities.push(o29Attach('lamp:'+i,'repair-lamp',x-3,y-4,6,8,{seed:i}));}
 for(const v of O29_WINDS)s.entities.push(o29Attach(v.id,'air-vent',v.x,v.y,v.w,v.h));
 // A breakable shortcut, never the sole escape route. Right passage stays open.
 for(let i=0;i<4;i++)s.entities.push(o29Attach('shutter:'+i,'repair-shutter',80+i*16,1808,16,16,{solid:true}));
 return s;
}
let o29={world:null,horizontal:null,upright:null,sourceTiles:new Map(),section:-1,banner:0,
 guide:null,guideFreed:false,handoff:null,turnStart:null,windFrames:0,gateBreaks:0,tipAge:0,checkpoints:[]};
function o29Patch(id,patch,reason){if(!o29.world)return;const before=o29.world.state(id),delta={};for(const [k,v]of Object.entries(patch))if(before[k]!==v)delta[k]=v;
 if(Object.keys(delta).length)o29.world.apply({id,patch:delta,reason,tick:Math.max(0,Math.floor(c23?.ticks||0))});}
function o29Refresh(){o29.horizontal=o29.world.view(0);o29.upright=o29.world.view(1);}
function o29ResetWorld(){o29={world:new O29Core.SharedWorld(o29Spec()),horizontal:null,upright:null,sourceTiles:new Map(),section:-1,banner:0,guide:null,guideFreed:false,handoff:null,turnStart:null,windFrames:0,gateBreaks:0,tipAge:0,checkpoints:[]};
 o29SyncHorizontal(true);
}
function o29SyncHorizontal(phases=false){if(!o29.world||o28.phase!=='horizontal')return;
 for(const d of O29_CANONICAL.entities){
  if(d.id.startsWith('tile:')){const t=tiles.get(tileKey(d.x/16,d.y/16));o29Patch(d.id,{destroyed:!t,used:!!t?.used,revealed:t?!t.hidden:d.state?.revealed!==false},'horizontal tile state');if(t){t.worldId=d.id;o29.sourceTiles.set(d.id,{...t});}}
  else if(d.id.startsWith('bridge:'))o29Patch(d.id,{destroyed:Number(d.id.split(':')[1])>=13-c23.bridgeRemoved},'axe bridge sequence');
  else if(phases&&d.id.startsWith('firebar:')){const i=Number(d.id.split(':')[1]);o29Patch(d.id,{phase:C23_BARS[i][2]*c23.ticks*.02181661565+[.1,1.4,2.3,.4,1.6,2.7,.5][i]},'live firebar phase');}
 }
 if(phases){o29Patch('lift:bowser',{phase:c23.ticks*.016},'live lifting phase');o29Refresh();}
}
const o29ResetSceneBase=c23ResetScene;c23ResetScene=function(cp=0,retry=false){o29ResetSceneBase(cp,retry);o29ResetWorld();};
const o29PreviewBase=c23Preview;c23Preview=function(){o29PreviewBase();if(c23?.ori)o29ResetWorld();};
const o29BumpBase=bumpTile;bumpTile=function(t){o29BumpBase(t);if(c23Is()&&o29.world&&t.worldId){o29Patch(t.worldId,{used:!!t.used,revealed:!t.hidden},'question block interaction');if(o28.phase==='horizontal')o29.sourceTiles.set(t.worldId,{...t});o29Refresh();}};
function o29Deploy(){for(const d of o29.world.definitions())if(d.id.startsWith('repair:')||d.id.startsWith('vent:')||d.id.startsWith('shutter:'))o29Patch(d.id,{gateOpen:true},'machine unfolds maintenance route');o29Refresh();}
O28_CHECKS.splice(0,O28_CHECKS.length,{x:36,feet:2432},{x:118,feet:1944},{x:108,feet:1664},{x:118,feet:1296},{x:126,feet:560});
function o29InstallUpright(){o29Refresh();const m=new Map();
 for(const e of o29.upright.entities){if(e.state.destroyed)continue;
  if(e.id.startsWith('tile:')||e.kind==='repair-shutter'){
   const src=o29.sourceTiles.get(e.id);const t=put(m,Math.round(e.x/16),Math.round(e.y/16),e.kind==='repair-shutter'?'stone':e.kind,e.state.used?null:src?.content??e.content??null);
   t.used=e.state.used;t.hidden=!e.state.revealed;t.worldId=e.id;t.shutter=e.kind==='repair-shutter';t.castleBase=!!src?.castleBase;
  }
 }
 tiles=m;surface={tiles,enemies:[],items:[],pipes:[],coins:[]};
 o28.platforms=o29.upright.entities.filter(e=>e.kind==='repair-ledge').map(e=>({id:e.id,x:e.x,y:e.y,w:e.w,h:e.h,dx:0,rest:e.rest,phase:Number(e.id.split(':')[1])*.7}));
 // The old horizontal lift now moves vertically, using its original clock.
 const lift=o29.upright.entities.find(e=>e.id==='lift:bowser');o28.platforms.push({id:'lift:bowser',x:lift.x,y:2192+Math.sin(c23.ticks*.016)*32,w:lift.w,h:lift.h,dx:0,dy:0,moving:true,rest:null});
 o28.lamps=o29.upright.entities.filter(e=>e.kind==='repair-lamp').map(e=>({id:e.id,x:e.x+e.w/2,y:e.y+e.h/2,seed:e.seed}));
 o28.shooters=[{id:291,x:179,y:1862,side:-1,age:87,hp:4,pulse:0},{id:292,x:158,y:1724,side:-1,age:25,hp:4,pulse:0},{id:293,x:177,y:1496,side:-1,age:67,hp:3,pulse:0}];
 o28.hazards=[];o28.projectiles=[];
}
o28BuildTower=o29InstallUpright;
const o29EnterBase=o28EnterFlood;o28EnterFlood=function(cp=0,retry=false){
 if(!o29.world)o29ResetWorld();const fromTurn=o28.phase==='turn'&&!retry;
 if(o28.phase==='horizontal')o29SyncHorizontal(true);o29Deploy();
 const entry=fromTurn?o29TurnFrame(480):null;o29EnterBase(Math.min(cp,O28_CHECKS.length-1),retry);
 o28.highest=O28_H-64-player.y-player.h;o29.section=-1;o29.banner=0;
 if(entry){player.x=entry.player.x;player.y=entry.player.y;player.grounded=false;o28.camY=entry.camY;}
 const gp=entry?O29Core.transformPoint({x:o29.turnStart.x+22,y:202},O29Core.rotationFrame(o29.world,Math.PI/2)):null;
 if(!retry||!o29.guide){o29.guide={x:gp?gp.x-4:player.x+18,y:gp?gp.y-7:player.y-5,w:8,h:13,vx:0,vy:0,grounded:false,phase:0,way:0,climb:false};}
 else{o29.guide.x=player.x+16;o29.guide.y=player.y-4;o29.guide.vx=o29.guide.vy=0;o29.guide.path=[];}
 o29.guideFreed=true;o29.handoff={x:player.x,y:player.y,camY:o28.camY,worldRevision:o29.world.revision,fromTurn};o29SaveCheckpoint();
 o28Event('shared-world-enter',{originalObjects:O29_CANONICAL.entities.length,worldObjects:o29.world.size,revision:o29.world.revision});
};
o28ConstrainPlayer=function(p){p.x=clamp(p.x,2,o28IsVertical()?231:2540);p.anim+=Math.abs(p.vx);if(p.y>(o28IsVertical()?O28_H+64:270))c23Fail('坠落');};
// Lift transport handles vertical motion without moving the player through solids.
const o29MoveBase=moveBody;moveBody=function(b,dx,dy,isPlayer=false){if(!o28IsVertical())return o29MoveBase(b,dx,dy,isPlayer);
 const lift=o28.platforms.find(p=>p.id==='lift:bowser');if(lift&&b.grounded&&Math.abs(b.y+b.h-(lift.y-(lift.dy||0)))<1.2&&b.x+b.w>lift.x&&b.x<lift.x+lift.w){const n={...b,y:b.y+(lift.dy||0)};if(!solids(n).length)b.y=n.y;}
 return o29MoveBase(b,dx,dy,isPlayer);
};
function o29WindFor(p){return O29_WINDS.find(v=>overlap(p,v));}
const o29PlayerBase=o24Player;o24Player=function(v){
 if(!o28IsVertical())return o29PlayerBase(v);
 const wind=o29WindFor(player);o29PlayerBase(v);
 if(wind&&v.glide&&!c23.ori.dash&&!c23.ori.bash&&mode==='playing'){
  const o=c23.ori;if(!o.gliding)o.glides++;o.gliding=true;o.pose='glide';o.stomp=0;o.boost=0;player.vy=approach(player.vy,-2.35,.55);player.grounded=false;o29.windFrames++;
 }
};
function o29Bars(){const f=O29Core.rotationFrame(o29.world,Math.PI/2);return C23_BARS.map((b,i)=>c23BarDots(b,i).map(p=>O29Core.transformPoint(p,f)));}
function o29BreakShutter(b){if(!b.reflected)return;const hit=[...tiles.values()].find(t=>t.shutter&&Math.hypot(t.x*16+8-b.x,t.y*16+8-b.y)<14);if(!hit)return;
 for(const t of [...tiles.values()])if(t.shutter){o29Patch(t.worldId,{destroyed:true},'reflected projectile opens shortcut');tiles.delete(tileKey(t.x,t.y));o24FX(t.x*16+8,t.y*16+8,'#e9c997',12,2.3);}b.age=999;o29.gateBreaks++;o29Refresh();addScore(800);o28Event('maintenance-shortcut-open');
}
// Shortest free-space route for the keeper's visible maintenance grapnel.
// Nodes use the real collision tiles (including persistent broken shutters), not
// an invisible straight-line teleport. All motion still goes through moveBody.
function o29KeeperPath(n){
 const W=30,H=320,free=new Uint8Array(W*H),key=(x,y)=>y*W+x;
 for(let y=0;y<H;y++)for(let x=3;x<24;x++)if(!solids({x:x*8,y:y*8,w:n.w,h:n.h}).length)free[key(x,y)]=1;
 let sx=Math.round(n.x/8),sy=clamp(Math.round(n.y/8),0,H-1),start=-1,dist=Infinity;
 for(let y=Math.max(0,sy-3);y<=Math.min(H-1,sy+3);y++)for(let x=Math.max(3,sx-3);x<=Math.min(23,sx+3);x++)if(free[key(x,y)]){const d=Math.hypot(x*8-n.x,y*8-n.y);if(d<dist){dist=d;start=key(x,y);}}
 if(start<0)return[];const goal=17,cost=new Float64Array(W*H).fill(Infinity),prev=new Int32Array(W*H).fill(-1),heap=[];
 const push=(id,f)=>{let i=heap.length;heap.push({id,f});while(i){let p=(i-1)>>1;if(heap[p].f<=f)break;heap[i]=heap[p];i=p;}heap[i]={id,f};};
 const pop=()=>{const root=heap[0],tail=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=tail.f)break;heap[i]=heap[j];i=j;}heap[i]=tail;}return root.id;};
 cost[start]=0;push(start,0);let end=-1,visits=0;
 while(heap.length&&visits++<20000){const a=pop(),x=a%W,y=(a/W)|0;if(a===goal){end=a;break;}
  for(const [dx,dy]of [[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1]]){const xx=x+dx,yy=y+dy;if(xx<3||xx>23||yy<0||yy>=H)continue;const b=key(xx,yy);if(!free[b]||dx&&dy&&(!free[key(xx,y)]||!free[key(x,yy)]))continue;
   const c=cost[a]+(dx&&dy?1.42:1)+(dy>0?.5:0);if(c>=cost[b])continue;cost[b]=c;prev[b]=a;push(b,c+yy+Math.abs(xx-17)*.5);
  }
 }
 if(end<0)return[];const path=[];for(let a=end;a>=0;a=prev[a]){path.push({x:(a%W)*8,y:((a/W)|0)*8});if(a===start)break;}return path.reverse();
}
function o29GuideTick(){const n=o29.guide;if(!n)return;n.phase++;
 if(!n.path||!n.path.length||n.stuck>18){n.path=o29KeeperPath(n);n.way=0;n.stuck=0;}
 if(!n.path.length)return;while(n.way<n.path.length-1&&Math.hypot(n.path[n.way].x-n.x,n.path[n.way].y-n.y)<1.2)n.way++;
 const lead=player.y-n.y,target=n.path[n.way],dx=target.x-n.x,dy=target.y-n.y,d=Math.hypot(dx,dy)||1;
 if(lead>84){n.vx=n.vy=0;n.climb=true;n.waiting=true;return;}n.waiting=false;
 const speed=Math.min(d,lead< -90?8:lead< -25?6:3.4);n.vx=dx/d*speed;n.vy=dy/d*speed;n.climb=dy<-.3;n.hook=n.path[Math.min(n.way+8,n.path.length-1)];
 const old={x:n.x,y:n.y},steps=Math.max(1,Math.ceil(speed/1.8));for(let i=0;i<steps;i++)moveBody(n,n.vx/steps,n.vy/steps,false);
 n.x=Math.round(n.x*1e8)/1e8;n.y=Math.round(n.y*1e8)/1e8;
 n.stuck=Math.hypot(n.x-old.x,n.y-old.y)<.1?n.stuck+1:0;n.face=n.vx<-.1?-1:n.vx>.1?1:(n.face||1);
}

function o29SaveCheckpoint(){if(!o29.world)return;const cp=o28.cp;
 o29.checkpoints[cp]={schema:'mariomix-r29-checkpoint/1',cp,world:o29.world.snapshot(),stats:{windFrames:o29.windFrames,gateBreaks:o29.gateBreaks},ticks:c23.ticks};
 // Checkpoints are in-run only: no misleading promise of a complete browser save.
}
function o29WorldTick(){const o=c23.ori;const moving=o28.platforms.find(p=>p.id==='lift:bowser');if(moving){const y=2192+Math.sin(c23.ticks*.016)*32;moving.dy=y-moving.y;moving.y=y;}
 for(const e of o28.shooters){if(e.hp<=0||Math.abs(e.y-player.y)>230)continue;e.age++;e.pulse=Math.max(0,e.pulse-1);
  if(e.age%155===130){e.pulse=25;o28Event('enemy-windup',{id:e.id});}
  if(e.age%155===0){const dx=player.x+4-e.x,dy=player.y+7-e.y,d=Math.hypot(dx,dy)||1;o28.projectiles.push({x:e.x,y:e.y,vx:dx/d*.98,vy:dy/d*.98,age:0,reflected:false,owner:e.id});o28Event('flood-projectile',{id:e.id});}}
 for(const b of o28.projectiles){b.x+=b.vx;b.y+=b.vy;b.age++;if(b.reflected){o29BreakShutter(b);for(const e of o28.shooters)if(e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<12){e.hp-=4;b.age=999;o24FX(e.x,e.y,'#fbd896',14,2);o28Event('projectile-reflected-hit',{id:e.id});}}
 else if(Math.hypot(player.x+4.5-b.x,player.y+7-b.y)<7)c23Hurt('暗蚀弹');if(solids({x:b.x-1,y:b.y-1,w:2,h:2}).length)b.age=999;}
 o28.projectiles=o28.projectiles.filter(b=>b.age<280&&b.y<o28.water+20&&b.x>0&&b.x<240);
 for(const b of o.bolts){b.life--;const e=o28.shooters.find(e=>e.id===b.target&&e.hp>0);if(e){const dx=e.x-b.x,dy=e.y-b.y,d=Math.hypot(dx,dy)||1;b.vx=approach(b.vx,dx/d*4,.5);b.vy=approach(b.vy,dy/d*4,.5);if(d<10){e.hp--;b.life=0;o24Sound('impact');o24FX(e.x,e.y,'#92efff',8,2);}}b.tail.push({x:b.x,y:b.y});if(b.tail.length>6)b.tail.shift();b.x+=b.vx;b.y+=b.vy;}o.bolts=o.bolts.filter(b=>b.life>0);
 for(const b of o.orbs){b.x+=b.vx;b.y+=b.vy;b.vy+=.065;b.life--;if(solids({x:b.x-2,y:b.y-2,w:4,h:4}).length)b.life=0;if(b.life<=0)o24Blast(b.x,b.y,40,3);}o.orbs=o.orbs.filter(b=>b.life>0&&b.y<o28.water+40);
 for(const bar of o29Bars())for(const p of bar)if(c23CircleHit(p.x,p.y,2.6))c23Hurt('翻转后的火棒');
 for(const t of tiles.values())if(t.bump>0)t.bump--;
 // The same pickups work in the upright map rather than vanishing after a bump.
 for(const p of o.pickups){p.life++;p.vy=Math.min(3,p.vy+.12);moveBody(p,p.vx,p.vy,false);if(p.life>10&&overlap(player,p)){if(p.type==='cell'){o.hp=Math.min(6,o.hp+3);o.energy=4;}else{coins++;addScore(100);}p.remove=true;o24Sound('heal');}}o.pickups=o.pickups.filter(p=>!p.remove&&p.y<o28.water+40);
 for(const f of o.fx){f.x+=f.vx;f.y+=f.vy;f.vx*=.97;f.vy*=.97;f.life--;}o.fx=o.fx.filter(f=>f.life>0);for(const t of o.dashTrail)t.life--;o.dashTrail=o.dashTrail.filter(t=>t.life>0);for(const k of ['pulse','warning','linkAge'])if(o[k])o[k]--;
 for(let i=o28.cp+1;i<O28_CHECKS.length;i++)if(player.y+14<O28_CHECKS[i].feet-8){o28.cp=i;o.hp=6;o.energy=4;o.linkAge=80;o29SaveCheckpoint();o24Sound('link');o28Event('flood-checkpoint',{cp:i});break;}
 o36FloodTick();
 if(!c23.practice){const contact=player.y+14>o28WaterLine(player.x+4)+4;o28.breath=contact?o28.breath+1:0;if(o28.breath>14||player.y+3>o28WaterLine(player.x+4))c23Fail('被洪水卷走');}
 o29GuideTick();const seg=O29_SEGMENTS.findIndex(s=>player.y>=s.above);if(seg!==o29.section&&seg>=0){o29.section=seg;o29.banner=150;o28Event('route-section',{index:seg,name:O29_SEGMENTS[seg].name});}if(o29.banner)o29.banner--;
 if(player.y<18&&player.x>=127&&player.x<154&&mode==='playing'){
  o28.phase='outside';o28.age=0;o28.marioX=270;o28.camY=0;camera=0;c23.ending=1;player.x=46;player.y=118;player.vx=1.2;player.vy=0;o.pose='glide';c23Clear();o28Event('escaped-tower',{exit:'landmark:entry'});audioSync();
 }
}
o28World=o29WorldTick;
// Capture canonical state once, then animate and collide from that exact world.
const o29EndingBase=c23EndingTick;c23EndingTick=function(){const prev=o28.phase;o29EndingBase();if(o28.phase==='horizontal')o29SyncHorizontal(false);
 if(player.x>=2416&&!o29.guideFreed){o29.guideFreed=true;o28Event('keeper-freed',{name:'爷爷',identity:'Calabash grandfather PNG / public-project source / adapted motion'});}
 if(prev==='horizontal'&&o28.phase==='turn'){
  // Sync after restoring phase momentarily; no world reset during the transition.
  o28.phase='horizontal';o29SyncHorizontal(true);o28.phase='turn';o29.turnStart={x:player.x,y:player.y,camera,ticks:c23.ticks};
 }
};
const o29StepBase=c23Step;c23Step=function(v){if(c23Is()&&o28.phase==='turn'){
 if(mode!=='playing'||c23Menu||o24Box.open)return;frame++;c23.ticks++;c23.runFrames++;o28.age++;
 if(o28.age===84){o29Deploy();o28Event('machine-lever');o24Sound('mechanism');}if(o28.age===160)o28Event('castle-rotation-start');if(o28.age===360)o28Event('castle-upright');if(o28.age>=480)o28EnterFlood(0,false);audioSync();return;
 }return o29StepBase(v);};
function o29Ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function o29TurnFrame(t=o28.age){const p=o29.turnStart||{x:2416,y:194,camera:2304},f=O29Core.rotationFrame(o29.world,Math.PI/2),center=O29Core.transformPoint({x:p.x+4.5,y:p.y+7},f),vp={x:center.x-4.5,y:center.y-7};
 const camY=clamp(vp.y-143,0,O28_H-232);let angle=0,scale=1,cx=p.camera+128,cy=136;
 if(t>=100&&t<160){const q=o29Ease((t-100)/60);scale=Math.exp(Math.log(.078)*q);cx+=(1280-cx)*q;cy+=(120-cy)*q;}
 else if(t>=160&&t<360){angle=o29Ease((t-160)/200)*Math.PI/2;scale=.078;const fr=O29Core.rotationFrame(o29.world,angle);cx=fr.width/2;cy=fr.height/2;}
 else if(t>=360){angle=Math.PI/2;const q=o29Ease((t-360)/120);scale=Math.exp(Math.log(.078)*(1-q));cx=120+(128-120)*q;cy=1280+(camY+136-1280)*q;}
 return {angle,scale,cx,cy,camY,player:vp};
}
// ----- Rendering: one transformed world, distinct authored atmosphere -----
function o29Keeper(g,x,feet,t=0,face=1,walking=false,climbing=false){
 g.save();g.translate(x,feet);g.scale(face,1);const swing=walking?Math.sin(t*.30)*2.1:Math.sin(t*.04)*.2;
 // R31: original vector elder homage (no ripped external sprite assets).
 o24Glow(g,9,-11,16,'#ffd989',.18);
 o24Limb(g,[[-2,-6],[-3-swing*.7,-2],[-3-swing*.9,0]],'#4c3a2b',2.7);
 o24Limb(g,[[2,-6],[2+swing*.7,-2],[2+swing*.9,0]],'#5d4433',2.7);
 o24Path(g,[['M',-6,-17],['Q',-9,-8,-6,-3],['Q',0,-1,7,-4],['Q',9,-10,5,-17],['Z']],'#5d8b49','#cfd98e',.45);
 g.fillStyle='#6c4b2d';g.fillRect(-1,-14,2,11);
 o24Limb(g,[[-4,-13],[-8,-10+(climbing?-5:0)],[-10,-8+(climbing?-5:0)]],'#d7c4a4',1.8);
 o24Limb(g,[[4,-13],[8,-11],[10,-9]],'#d7c4a4',1.8);
 g.strokeStyle='#c8a16a';g.lineWidth=1.1;g.beginPath();g.moveTo(9,-19);g.lineTo(11,0);g.stroke();g.beginPath();g.arc(9,-20,2.3,Math.PI*.2,Math.PI*1.2);g.stroke();
 o24Ellipse(g,0,-21,5.2,5.7,'#e7d0ae');
 o24Path(g,[['M',-6,-23],['Q',-4,-31,2,-28],['Q',8,-25,6,-18],['Q',0,-18,-6,-23]],'#f0f2ec');
 o24Path(g,[['M',-5,-18],['Q',0,-12,5,-18],['Q',4,-7,0,-3],['Q',-4,-7,-5,-18]],'#f4f3ec');
 o24Ellipse(g,-1.8,-21,.55,.75,'#2f3130');o24Ellipse(g,2.1,-21,.55,.75,'#2f3130');
 o24Path(g,[['M',-1,-19],['Q',0,-18,1,-19],['Q',0,-17,-1,-19]],'#b56c4e');
 g.fillStyle='#8dc16b';g.beginPath();g.ellipse(6,-10,1.8,2.2,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(6,-13,1.3,1.4,0,0,Math.PI*2);g.fill();
 g.restore();
}
function o29Stone(g,e){const x=e.x,y=e.y,im=o27Images.get('rock');
 if(o25Art==='classic'){g.drawImage(classicSprite('c23_stone'),x,y,e.w,e.h);return;}
 g.fillStyle='#36464b';g.fillRect(x,y,e.w,e.h);if(im?.naturalWidth){g.save();g.globalAlpha=.77;g.imageSmoothingEnabled=true;g.drawImage(im,(Math.floor(x/16)*37)%160,(Math.floor(y/16)*31)%160,45,45,x,y,e.w,e.h);g.restore();}
 g.fillStyle='#a1b6a525';g.fillRect(x,y,e.w,.7);g.fillStyle='#08182780';g.fillRect(x,y+e.h-1,e.w,1);g.strokeStyle='#91a89b23';g.lineWidth=.38;g.strokeRect(x+.25,y+.25,e.w-.5,e.h-.5);
}
function o29Plate(g,e){const x=e.x,y=e.y;g.fillStyle='#725637';g.fillRect(x,y,e.w,e.h);g.fillStyle='#c0b887';g.fillRect(x,y,e.w,1.1);g.fillStyle='#172f39';g.fillRect(x+2,y+3,3,e.h-3);g.fillRect(x+e.w-5,y+3,3,e.h-3);g.strokeStyle='#e0ba69';g.lineWidth=.6;g.beginPath();g.moveTo(x+2,y+1);g.lineTo(x+e.w-2,y+1);g.stroke();}
function o29DrawCanonical(g,angle=0,onlyVisible=false){const entities=o29.horizontal?.entities||[];const upright=Math.abs(angle-Math.PI/2)<.001;
 for(const e of entities){if(e.state.destroyed||!e.state.revealed||!e.id.startsWith('tile:'))continue;
  if(onlyVisible&&upright&&(e.x<o28.camY-25||e.x>o28.camY+250))continue;
  if(e.kind==='stone')o29Stone(g,e);else g.drawImage(classicSprite(e.state.used?'block_used':'question'+Math.floor(c23.ticks/9)%3),e.x,e.y,e.w,e.h);
 }
 for(const e of entities){if(e.state.destroyed)continue;
  if(onlyVisible&&upright&&(e.x<o28.camY-50||e.x>o28.camY+260))continue;
  if(e.kind==='bridge'){g.fillStyle='#8d6943';g.fillRect(e.x,e.y,e.w,e.h);g.fillStyle='#e1b67a';g.fillRect(e.x,e.y,e.w,1);}
  if(e.kind==='repair-shutter'){g.fillStyle='#7b543c';g.fillRect(e.x,e.y,e.w,e.h);g.strokeStyle='#e0b57c';g.lineWidth=.7;g.strokeRect(e.x+.5,e.y+.5,e.w-1,e.h-1);g.beginPath();g.moveTo(e.x+2,e.y+2);g.lineTo(e.x+e.w-2,e.y+e.h-2);g.stroke();}
 }
 // Firebars are not reset or replaced on turning. Their pivots rotate with the map.
 for(let i=0;i<C23_BARS.length;i++)for(const d of c23BarDots(C23_BARS[i],i)){
  if(onlyVisible&&upright&&(d.x<o28.camY-12||d.x>o28.camY+252))continue;
  o24Glow(g,d.x,d.y,7,'#f8a556',.19);g.drawImage(classicSprite('fireball'+Math.floor(c23.ticks/8)%2),d.x-4,d.y-4,8,8);
 }
 // The actual lift, turned into a short vertical moving handhold.
 const lx=2192+Math.sin(c23.ticks*.016)*32;g.fillStyle='#426b70';g.fillRect(lx,96,32,8);g.fillStyle='#b5d4b5';g.fillRect(lx,96,32,1.5);
}
function o29DrawUprightDetails(g){
 if(o28.camY<1880&&o28.camY>1570&&!o29.world.state('shutter:0').destroyed){g.save();g.strokeStyle='#c7eec286';g.lineWidth=1;g.beginPath();g.moveTo(160,1830);g.lineTo(165,1823);g.lineTo(170,1830);g.moveTo(165,1823);g.lineTo(165,1844);g.stroke();g.restore();}

 for(const p of o28.platforms){if(p.id==='lift:bowser'||p.y<o28.camY-30||p.y>o28.camY+250)continue;o29Plate(g,p);if(p.rest!==null&&p.rest!==undefined){o24Glow(g,p.x+p.w*.5,p.y-6,16,'#9df6d6',.18);o24Path(g,[['M',p.x+p.w*.5,p.y-3],['Q',p.x+p.w*.5-4,p.y-10,p.x+p.w*.5,p.y-16],['Q',p.x+p.w*.5+5,p.y-10,p.x+p.w*.5,p.y-3]],'#b5fae4');}}
 const target=o24NearTargets()[0];for(const n of o28.lamps){if(n.y<o28.camY+20||n.y>o28.camY+250)continue;const sel=target?.id===n.id;
  o24Glow(g,n.x,n.y,sel?15:10,'#f8d18c',sel?.35:.2);g.strokeStyle='#97895b';g.lineWidth=.5;g.beginPath();g.moveTo(n.x,n.y-4);g.lineTo(n.x-5,n.y-16);g.stroke();o24Ellipse(g,n.x,n.y,3,4.1,'#d9bd79');o24Ellipse(g,n.x,n.y-.6,1.4,2.5,'#fff5c4');
  if(sel){g.strokeStyle='#fff1ba';g.lineWidth=.55;g.beginPath();g.arc(n.x,n.y,6.8,0,Math.PI*2);g.stroke();}}
 for(const v of O29_WINDS){if(v.y>o28.camY+240||v.y+v.h<o28.camY+32)continue;g.save();g.beginPath();g.rect(v.x,v.y,v.w,v.h);g.clip();
  for(let k=0;k<15;k++){const x=v.x+5+(k*23)%(v.w-10),y=v.y+((k*29-c23.ticks*1.35)%v.h+v.h)%v.h;g.strokeStyle=k%3?'#9de7de50':'#dbfff980';g.lineWidth=.45;g.beginPath();g.moveTo(x,y+8);g.quadraticCurveTo(x+4,y+2,x,y-7);g.stroke();}g.restore();}
 if(o28.camY<200){o24Glow(g,143,8,30,'#d4eeff',.45);g.fillStyle='#d9efff';g.fillRect(130,-6,26,8);}
}
const o29SceneBase=o24Scene;o24Scene=function(){o29SceneBase();if(!c23Is()||!o29.world||o28.phase!=='horizontal')return;const g=ctx;
 // R38: phase-two wind/shutter/brace hint outlines are not rendered in the horizontal castle.
 if(2462-camera>-24&&2462-camera<280)o29Keeper(g,2462-camera,208,c23.ticks,-1,false);
 if(c23.ending&&player.x>=2410)o28Say('爷爷','孩子，你终于来了！公主早被转走了。',o28.age,12,64,232);
};
function o29Backdrop(){const g=ctx,cy=o28.camY;const bg=g.createLinearGradient(0,32,256,240);bg.addColorStop(0,'#101f35');bg.addColorStop(.5,'#244658');bg.addColorStop(1,'#0b1b2b');g.fillStyle=bg;g.fillRect(0,32,256,208);
 for(let i=0;i<6;i++){const x=28+i*39;g.fillStyle='#0b223351';g.fillRect(x,32,12+i%3*3,208);g.strokeStyle='#789a941b';g.lineWidth=1;g.beginPath();g.moveTo(x,240);g.lineTo(x,32);g.stroke();}
 for(let k=Math.floor(cy*.7/150)-1;k<Math.floor((cy*.7+240)/150)+1;k++){const y=k*150-cy*.7;g.strokeStyle='#749a9730';g.lineWidth=1.5;g.beginPath();g.arc(120,y+60,65,Math.PI,0);g.stroke();g.fillStyle='#76969c0c';g.fillRect(72,y,96,96);}
 for(let i=0;i<30;i++){const x=(i*83.73)%236+10,y=32+((i*37.41-cy*.4+c23.ticks*.06)%205+205)%205;o24Ellipse(g,x,y,.4,.65,'#c5f6e839');}
}
o28DrawTower=function(){const g=ctx,cy=o28.camY;o29Backdrop();g.save();g.translate(0,-cy);g.save();const f=O29Core.rotationFrame(o29.world,Math.PI/2);g.transform(f.c,f.s,-f.s,f.c,f.tx,f.ty);o29DrawCanonical(g,Math.PI/2,true);g.restore();o29DrawUprightDetails(g);
 for(const e of o28.shooters){if(e.hp<=0||e.y<cy+16||e.y>cy+254)continue;o24Glow(g,e.x,e.y,13,e.pulse?'#e6a1df':'#9b75b9',.20);o24Path(g,[['M',e.x-8,e.y+6],['Q',e.x-10,e.y-10,e.x+1,e.y-9],['Q',e.x+10,e.y-10,e.x+8,e.y+6],['Z']],'#594769','#ac83b4',.4);o24Ellipse(g,e.x-3,e.y-3,3.2,2.7,e.pulse?'#fff0d5':'#d598d5');g.fillStyle='#261f3c';g.fillRect(e.x-6,e.y+5,12,2);}
 for(const b of o28.projectiles){o24Glow(g,b.x,b.y,8,b.reflected?'#fff0a5':'#ca9ade',.32);o24Ellipse(g,b.x,b.y,2.7,2.7,b.reflected?'#fff6cb':'#e6b9eb');}
 for(const b of c23.ori.bolts){g.strokeStyle='#b0f2fe88';g.lineWidth=1;g.beginPath();b.tail.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();o24Ellipse(g,b.x,b.y,1.5,1.5,'#e1fcff');}
 for(const b of c23.ori.orbs){o24Glow(g,b.x,b.y,8,'#ffd995',.32);o24Ellipse(g,b.x,b.y,2.2,2.2,'#fff0bc');}
 for(const p of c23.ori.pickups){o24Glow(g,p.x+4,p.y+4,8,'#b5f6d8',.2);o24Ellipse(g,p.x+4,p.y+4,2.5,3.5,p.type==='cell'?'#9cecf4':'#fff1b1');}
 const n=o29.guide;if(n&&n.y>cy+18&&n.y<cy+252){if(n.hook){g.save();g.strokeStyle='#d5c89b88';g.lineWidth=.45;g.beginPath();g.moveTo(n.x+5,n.y+2);g.lineTo(n.hook.x+4,n.hook.y-1);g.stroke();g.restore();}o29Keeper(g,n.x+4,n.y+13,n.phase,n.face||1,Math.abs(n.vx)>.15,n.climb);}
 const o=c23.ori;for(let i=0;i<o.dashTrail.length;i+=4){const t=o.dashTrail[i];o24Ori(g,t.x+4.5,t.y+14,'dash',player.anim,t.face,t.life/130,false);}
 for(const f of o.fx){g.save();g.globalAlpha=clamp(f.life/30,0,1);o24Ellipse(g,f.x,f.y,f.r,f.r,f.color);g.restore();}
 if(!(player.invuln&&Math.floor(c23.ticks/4)%2)){const pose=o.gliding?'glide':o.clinging?(o.prev.up?'climb':'wall'):o.pose;o24Ori(g,player.x+4.5,player.y+14,pose,player.anim+c23.ticks,player.facing);}
 if(hero!=='sonic'){o24Glow(g,player.x-7,player.y-5,8,'#c2f4ff',.25);o24Ellipse(g,player.x-7,player.y-5,1.3,1.5,'#e5feff');}
 // R32 shared Bash overlay is drawn once after the scene.
 g.restore();o28DrawWater();
 if(o29.banner>0){const s=O29_SEGMENTS[o29.section];g.save();g.globalAlpha=Math.min(1,o29.banner/20);g.fillStyle='#061725df';g.fillRect(37,38,178,18);g.fillStyle='#d8eee1';g.textAlign='center';g.font='7px system-ui,sans-serif';g.fillText(s.name,126,50);g.restore();}
};
o28DrawTurn=function(){const g=ctx,t=o28.age;o29Backdrop();const q=o29TurnFrame(t),f=O29Core.rotationFrame(o29.world,q.angle);
 if(t<100){o24Backdrop();o25Terrain();o25Foreground();o24Ori(g,player.x-camera+4.5,player.y+14,'idle',c23.ticks,1);o29Keeper(g,2462+(o29.turnStart.x+22-2462)*o29Ease(t/100)-camera,208,c23.ticks,-1,t>8);s35DrawMachineEntry(g,t);o28Say('小库巴',t<55?'居然放出了爷爷？':'那就连城堡一起，翻过去吧！',t<55?t:t-55,14,61,230);return;}
 g.save();g.translate(128,136);g.scale(q.scale,q.scale);g.translate(-q.cx,-q.cy);g.transform(f.c,f.s,-f.s,f.c,f.tx,f.ty);o29DrawCanonical(g,q.angle,false);s35DrawMachineInWorld(g,t);
 // Source-fixed rail attachments rotate continuously with their brick neighbors.
 for(const e of o29.horizontal.entities)if(e.kind==='repair-ledge'){g.fillStyle='#b99a66';g.fillRect(e.x,e.y,e.w,e.h);}else if(e.kind==='repair-lamp'){o24Glow(g,e.x+e.w/2,e.y+e.h/2,12,'#fce7a4',.25);g.fillStyle='#f6d296';g.fillRect(e.x,e.y,e.w,e.h);}
 const p=o29.turnStart;g.save();g.translate(p.x+4.5,p.y+7);g.rotate(-q.angle);o24Ori(g,0,7,'idle',c23.ticks,1);g.restore();
 const keeper={x:p.x+22,y:202};g.save();g.translate(keeper.x,keeper.y);g.rotate(-q.angle);o29Keeper(g,0,6,c23.ticks,-1);g.restore();g.restore();
 if(t>155&&t<275)o28Say('爷爷','别恋战！顺着原来的砖路，往上逃！',t-155,14,39,228);
 if(t>=355&&t<420){g.save();g.globalAlpha=1-o29Ease((t-390)/30);g.textAlign='center';g.fillStyle='#d6f2e4';g.font='7px system-ui,sans-serif';g.fillText('同一座城堡 · 入口已在上方',128,46);g.restore();}
};
function o29MoonForest(){const g=ctx,t=o28.age;const bg=g.createLinearGradient(0,32,0,240);bg.addColorStop(0,'#11162f');bg.addColorStop(.43,'#28395b');bg.addColorStop(.76,'#456676');bg.addColorStop(1,'#152d38');g.fillStyle=bg;g.fillRect(0,32,256,208);
 for(let i=0;i<58;i++){const x=(i*73.91)%256,y=36+(i*31.73)%120;g.globalAlpha=.24+(Math.sin(i*7+t*.014)+1)*.16;o24Ellipse(g,x,y,i%9===0?.6:.3,i%9===0?.6:.3,'#c5e4f3');}g.globalAlpha=1;
 o24Glow(g,178,79,57,'#aecedf',.16);o24Glow(g,178,79,35,'#d1eaf1',.22);const moon=g.createRadialGradient(170,70,2,178,79,24);moon.addColorStop(0,'#f3f1d5');moon.addColorStop(.75,'#d6e2d4');moon.addColorStop(1,'#a9cad1');g.fillStyle=moon;g.beginPath();g.arc(178,79,23,0,Math.PI*2);g.fill();
 g.save();g.beginPath();g.arc(178,79,22.5,0,Math.PI*2);g.clip();for(let k=0;k<15;k++){const x=159+(k*13.71)%41,y=59+(k*17.51)%39;o24Ellipse(g,x,y,1.4+k%3,1+k%4*.6,'#7f9caa15');}g.restore();
 for(let layer=0;layer<3;layer++){const base=152+layer*18;g.fillStyle=['#243e5577','#1b364ccc','#132d3ce8'][layer];g.beginPath();g.moveTo(0,240);for(let x=0;x<=260;x+=3)g.lineTo(x,base+Math.sin(x*.023+layer)*13+Math.cos(x*.049+layer*7)*7);g.lineTo(256,240);g.fill();
  for(let k=0;k<14;k++){const x=(k*53+layer*29)%268,h=25+(k*19)%45,y=base+9;g.fillRect(x-1,y-h,2,h);for(let n=0;n<5;n++){const top=y-h+n*h*.15,w=4+n*2;g.beginPath();g.moveTo(x,top-5);g.lineTo(x-w,top+13);g.lineTo(x+w,top+13);g.fill();}}}
 // Thin fog ribbons and a visible wet reflection, not an opaque full-screen wash.
 for(let k=0;k<5;k++){const y=153+k*11;const mist=g.createLinearGradient(0,y-7,0,y+7);mist.addColorStop(0,'#8fb9c100');mist.addColorStop(.5,'#b8d6d017');mist.addColorStop(1,'#8fb9c100');g.fillStyle=mist;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(74,y-8+Math.sin(t*.004+k)*3,173,y+8,256,y-2);g.lineTo(256,y+10);g.lineTo(0,y+10);g.fill();}
 // The exit is a broken castle lintel; the waterfall drops below its former entry.
 g.fillStyle='#142832';g.fillRect(0,111,28,126);g.fillStyle='#5b7474';g.fillRect(6,114,15,5);g.fillRect(18,110,7,45);g.fillStyle='#243d49';g.fillRect(11,120,11,52);
 g.strokeStyle='#7dd8df8a';g.lineWidth=2.5;g.beginPath();g.moveTo(17,147);g.bezierCurveTo(10,178,17,211,28,228);g.stroke();
 g.fillStyle='#112b33';g.beginPath();g.moveTo(22,206);g.quadraticCurveTo(125,198,256,204);g.lineTo(256,240);g.lineTo(16,240);g.closePath();g.fill();g.strokeStyle='#97bca48c';g.lineWidth=1.2;g.beginPath();g.moveTo(25,205);g.quadraticCurveTo(141,199,256,204);g.stroke();
 for(let k=0;k<50;k++){const x=25+(k*17.41)%230,y=204+Math.sin(x*.027)*1.7;g.strokeStyle=['#486c57','#698771','#3f7262'][k%3];g.lineWidth=.65;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+3,y-3,x-1,y-5-k%4);g.stroke();}
 // Framing branches, sparse leaves and lantern-coloured fireflies.
 g.strokeStyle='#0a202d';g.lineWidth=14;g.beginPath();g.moveTo(-9,105);g.bezierCurveTo(8,53,58,46,109,31);g.stroke();g.lineWidth=6;g.beginPath();g.moveTo(29,58);g.quadraticCurveTo(69,80,111,58);g.stroke();
 for(let k=0;k<17;k++){const x=9+k*6.1,y=53+Math.sin(k*.37)*15;o24Ellipse(g,x,y,5.4,2.4,'#153839',k*.3);}for(let k=0;k<20;k++){const x=(k*67.1+t*.10)%256,y=125+(k*23.7)%74+Math.sin(t*.018+k)*4;o24Glow(g,x,y,2.4,'#e9edaf',.14);o24Ellipse(g,x,y,.38,.48,'#e7f3bf8f');}
}
o28DrawOutside=function(){const g=ctx,t=o28.age;o29MoonForest();o24Ori(g,player.x+4.5,player.y+14,c23.ori.pose,t*2,1);if(hero!=='sonic'){o24Glow(g,player.x-9,player.y-7,9,'#abebf5',.24);o24Ellipse(g,player.x-9,player.y-7,1.5,1.5,'#e8ffff');}
 if(t>65){const name=t<156?'small_run'+Math.floor(t/6)%3:'small_idle';sprite(name,o28.marioX-7,190,true);}if(t>45)o29Keeper(g,213,204,t,-1,t<90);
 if(t>=172&&t<292)o28Say('奥日','城堡里没有公主。我找遍了。',t-172,14,121,228);else if(t>=294)o28Say('马里奥',O27_DIALOGUE,t-294,12,121,232);
};
const o29DrawBase=c23Draw;c23Draw=function(){o29DrawBase();};
const o29UIBase=o24UI;o24UI=function(){o29UIBase();if(!c23Is()||!o29.world)return;
 if(o28.phase==='flood'&&!c23Menu&&mode==='playing'){const s=O29_SEGMENTS[o29.section]||O29_SEGMENTS[0];c23Set('relayMessage',s.hint+' · 休息点 '+(o28.cp+1)+' / '+O28_CHECKS.length);c23Set('stateLabel',s.name);}
};c23UI=o24UI;
const o29ChromeBase=c23Chrome;c23Chrome=function(){o29ChromeBase();if(!c23Is())return;
 C23_ROOMS[14].intro='深入横向熔城，救出爷爷；小库巴将同一座城堡翻转。断桥、隐藏砖与火棒都还在原处——现在，尽量沿原地图的砖路向上逃。';
 document.querySelector('.screen-top').children[1].textContent='ORI / ONE CASTLE · TWO DIRECTIONS';document.querySelector('[data-chapter="14"] span').textContent='奥日 · 熔城翻转 R29';
 if(c23Menu){c23Set('overlayTitle','同一座城堡，两次逃生。');c23Set('overlayText',C23_ROOMS[14].intro);c23Set('relayMessage','R31 · 同图翻转 / 原图上攀 / 爷爷引路 / 月夜相遇');}
 const keysText=$('c23KeysText');if(keysText&&!keysText.querySelector('.o29-note')){const e=document.createElement('p');e.className='o29-note';e.textContent='R29 气流：按住 Q / RT 羽毛上升。竖井：贴左墙，W / LT 攀墙 + 上。亮木栅可用反射弹体打破；右侧留有绕行口。翻转后原入口就是出口。';keysText.append(e);}
};
const o29PanelBase=o28UI;o28UI=function(){o29PanelBase();if(c23Is()&&o28.phase==='flood'&&!c23Menu&&mode==='playing'){const s=O29_SEGMENTS[o29.section]||O29_SEGMENTS[0];c23Set('stateLabel',s.name);c23Set('relayMessage',s.hint+' · 休息点 '+(o28.cp+1)+' / '+O28_CHECKS.length);}};
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R29',chapter14:'Ori / one canonical castle, two directions'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 window.__ori29={...window.__ori28,world:()=>o29.world.snapshot(),geometry:q=>o29.world.view(q),canonical:()=>O29_CANONICAL,guide:()=>structuredClone(o29.guide),handoff:()=>structuredClone(o29.handoff),turnFrame:t=>o29TurnFrame(t),section:()=>o29.section,
 sync:()=>o29SyncHorizontal(true),gateBreaks:()=>o29.gateBreaks,windFrames:()=>o29.windFrames,turnRef:()=>o29,storyRef:()=>o28,tiles:()=>[...tiles.values()],sharedState:id=>o29.world.state(id),setShared:(id,patch)=>{o29Patch(id,patch,'test fixture');o29Refresh();},worldTick:o29WorldTick,render:()=>c23Draw(),barDots:()=>o29Bars(),solidCheck:p=>solids(p).map(t=>t.worldId),checkpointStates:()=>structuredClone(o29.checkpoints),build:'R29'};
}
