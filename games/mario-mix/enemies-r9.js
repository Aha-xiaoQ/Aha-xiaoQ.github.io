// Enemy content varies by character; original Mario and terrain builders remain unchanged.
let enemyShots=[];
const enemyImages={},enemyIds=['contra-nes-soldier-3b','contra-nes-soldier-3c','contra-nes-soldier-3d','contra-nes-soldier-3e','contra-nes-soldier-3f','contra-nes-soldier-40','met-popup','met-laydown','contra-43','turret-left-0','turret-left-1','turret-left-2','turret-closed-0','turret-opening-0','turret-opening-1','popoheli-fly','screwie-down','screwie-rise','screwie-shoot','screwie-drop','contra-93','contra-94','contra-95','contra-96','contra-a6','contra-a8','contra-a9','pipi-with-egg','pipi-empty','pipi-egg','contra-7c','contra-7d','contra-7e','shield-attacker-attack','shield-attacker-turn'];
const enemyReady=Promise.all(enemyIds.map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{enemyImages[id]=im;resolve();};im.onerror=()=>reject(new Error('Enemy asset: '+id));im.src='assets/enemies/'+id+'.png';})));
function enemyCrop(id,r,x,y,flip=false){const im=enemyImages[id];if(!im)return;ctx.save();ctx.translate(Math.round(x)+(flip?r[2]:0),Math.round(y));ctx.scale(flip?-1:1,1);ctx.drawImage(im,...r,0,0,r[2],r[3]);ctx.restore();}
const terrainBuild=buildLevel;
buildLevel=function(){const level=terrainBuild();if(hero==='mario')return level;
 const original=level.enemies;level.enemies=[21,41,63,79,99,106,116,120,130,160,174].map(tx=>({...original[0],x:tx*T+1,y:tx===79?7*T:12*T}));
 const bill=['mario-goomba','contra-soldier','contra-turret','contra-grenadier','contra-sniper','contra-soldier','mario-goomba','mario-koopa','contra-turret','contra-ufo','contra-sniper'],mega=['mario-goomba','met','screwie','met','popoheli','mario-goomba','pipi','mario-koopa','screwie','met','shield-attacker'];
 level.enemies.forEach((e,i)=>{const bottom=e.y+e.h,kind=(hero==='bill'?bill:mega)[i];Object.assign(e,{uid:i,veteran:e.x>=90*T,franchise:kind,type:kind==='mario-koopa'?'turtle':'walker',h:kind==='shield-attacker'?18:kind==='contra-ufo'?16:kind==='contra-grenadier'?24:kind==='pipi'?28:kind.startsWith('contra')?28:kind==='mario-koopa'?22:kind==='mario-goomba'?14:kind==='popoheli'?18:16,w:kind==='shield-attacker'?26:kind==='contra-ufo'?22:kind==='pipi'?28:kind==='contra-turret'?24:14,phase:i*19%144,shotTick:0,alwaysOpen:hero==='bill'&&kind==='contra-turret'&&i===bill.indexOf('contra-turret'),metOpen:hero==='bill'&&kind==='contra-turret'&&i===bill.indexOf('contra-turret'),hp:kind==='contra-turret'?(i===bill.indexOf('contra-turret')?3:6):kind==='screwie'?4:2,flash:0,baseY:bottom-65});e.maxHp=e.hp;e.homeX=e.x;e.heading=-1;e.shieldTurn=0;e.y=(kind==='popoheli'||kind==='pipi'||kind==='contra-ufo'||kind==='shield-attacker')?e.baseY:bottom-e.h;e.vx=kind.startsWith('mario-')?-.5:kind==='contra-soldier'?-.65:kind==='contra-grenadier'?-.35:kind==='pipi'?-.55:kind==='popoheli'?-.7:0;});return level;};
const enemyReset=resetLife;resetLife=function(){enemyShots=[];enemyReset();};
const enemyMixReset=mixReset;mixReset=function(){enemyShots=[];enemyMixReset();};
const enemyRoom=loadRoom;loadRoom=function(r){enemyShots=[];enemyRoom(r);};
const enemyFlag=beginFlag;beginFlag=function(){resetBillControls();enemyShots=[];mixShots=[];mixCharge=0;mixHeld=false;mixCool=0;mixAim=0;mixCrouch=false;enemyFlag();if(hero!=='mario')player.x=FLAG_X-player.w/2;};
const enemyDie=die;die=function(){resetBillControls();enemyShots=[];mixShots=[];mixCharge=0;mixHeld=false;mixCool=0;enemyDie();};
const baseEnemyKill=killEnemy;
function shielded(e,s){if(e.franchise==='shield-attacker'){if(e.shieldTurn)return false;const incoming=s?Math.sign(s.vx):Math.sign(e.x+e.w/2-player.x-player.w/2);return incoming===-(e.heading||-1);}return (e.franchise==='met'||e.franchise==='screwie'||e.franchise==='contra-turret')&&!e.metOpen;}
function deflect(e){for(let i=0;i<3;i++)particles.push({kind:'spark',x:e.x+e.w/2,y:e.y+e.h/2,vx:(i-1)*1.2,vy:-1+i*.4,life:12});if(!e.blockFlash){sfx('bump');e.blockFlash=12;}}
killEnemy=function(e,...args){if(hero==='mario'||!e.franchise)return baseEnemyKill(e,...args);if(player.star)return baseEnemyKill(e,...args);if(shielded(e)){deflect(e);return;}if(hero==='megaman'&&args[0]===false){e.hp=0;return baseEnemyKill(e,...args);}e.hp--;e.flash=8;if(e.hp<=0)baseEnemyKill(e,...args);};
mixHitEnemy=function(e,s){if(e.dead)return false;const armorBreak=hero==='megaman'&&s.charged&&s.tier===2;if(shielded(e,s)){if(!armorBreak){deflect(e);return false;}floaters.push({text:'BREAK',x:e.x,y:e.y-5,life:35});sfx('break');}e.hp-=s.damage;e.flash=8;if(e.hp<=0)baseEnemyKill(e,true,e.maxHp>=4?300:100);return true;};
const oldEnemyDraw=drawEnemy;
drawEnemy=function(e){if(hero==='mario'||!e.franchise)return oldEnemyDraw(e);if(!e.active||e.remove)return;if(e.franchise.startsWith('mario-')){ctx.save();if(e.flash&&e.flash%2)ctx.globalAlpha=.35;oldEnemyDraw(e);ctx.restore();return;}
 const x=e.x-camera,y=e.y+e.h;ctx.save();if(e.flash&&e.flash%2)ctx.globalAlpha=.35;if(e.dead){ctx.globalAlpha=Math.min(1,e.dead/12);if(e.flipped){ctx.translate(x+e.w/2,y-7);ctx.scale(1,-1);ctx.translate(-x-e.w/2,-y+7);}}
 if(e.franchise==='contra-soldier'){const attack=e.shotTick%126>=70&&e.shotTick%126<96;const id='contra-nes-soldier-'+(attack?'40':['3b','3c','3d','3f','3c','3e'][Math.floor(e.anim/8)%6]);const im=enemyImages[id];if(im)enemyCrop(id,[0,0,im.width,im.height],x+(e.w-im.width)/2,y-im.height,attack?player.x>e.x:e.vx>0);}
 else if(e.franchise==='contra-grenadier'){const q=e.shotTick%150,throwing=q>=66&&q<108,id=throwing?'contra-96':'contra-'+['93','94','95'][Math.floor(e.anim/9)%3],im=enemyImages[id];if(im)enemyCrop(id,[0,0,im.width,im.height],x+(e.w-im.width)/2,y-im.height,!throwing&&e.vx<0);}
 else if(e.franchise==='contra-ufo'){const id='contra-'+['7c','7d','7e'][Math.floor(e.anim/4)%3],im=enemyImages[id];if(im)enemyCrop(id,[0,0,im.width,im.height],x+(e.w-im.width)/2,y-im.height);}
 else if(e.franchise==='shield-attacker'){const turning=e.shieldTurn>0,id=turning?'shield-attacker-turn':'shield-attacker-attack',col=turning?Math.min(4,Math.floor((30-e.shieldTurn)/6)):Math.floor(e.anim/6)%2;enemyCrop(id,[col*32,0,32,32],x+(e.w-32)/2,y-25,e.heading<0);}
 else if(e.franchise==='pipi')enemyCrop(e.eggDropped?'pipi-empty':'pipi-with-egg',[0,Math.floor(e.anim/8)%2*48,48,48],x+(e.w-48)/2,e.y,e.vx>0);
 else if(e.franchise==='contra-sniper'){const id='contra-43',im=enemyImages[id];if(im)enemyCrop(id,[0,0,im.width,im.height],x+(e.w-im.width)/2,y-im.height,player.x>e.x);}
 else if(e.franchise==='contra-turret'){const q=e.shotTick%120,id=e.alwaysOpen?'turret-left-'+Math.floor(e.anim/8)%3:q<35||q>=108?'turret-closed-0':q<45?'turret-opening-'+(q<40?0:1):'turret-left-'+Math.floor(e.anim/8)%3;enemyCrop(id,[0,0,32,32],x+(e.w-32)/2,y-32,player.x>e.x);}
 else if(e.franchise==='popoheli')enemyCrop('popoheli-fly',[Math.floor(e.anim/6)%2*32,0,32,32],x-9,y-32,e.vx>0);
 else if(e.franchise==='screwie'){const q=e.phase;let id='screwie-down',row=0;if(q>=40&&q<58){id='screwie-rise';row=Math.floor((q-40)/6);}else if(q>=58&&q<100){id='screwie-shoot';row=Math.floor((q-58)/6)%3;}else if(q>=100&&q<118){id='screwie-drop';row=Math.floor((q-100)/6);}enemyCrop(id,[0,row*32,32,32],x-9,y-32);}
 else enemyCrop(e.metOpen?'met-popup':'met-laydown',[0,0,32,32],x-9,y-32,player.x<e.x);
 if(e.flash&&!e.dead){ctx.fillStyle='#10213a';ctx.fillRect(x,e.y-5,e.w,2);ctx.fillStyle='#ffca58';ctx.fillRect(x,e.y-5,Math.max(0,e.hp/e.maxHp)*e.w,2);}ctx.restore();};
function spawnEnemyShot(e,angles=[0],speed=1.85){if(e.x<camera+24||e.x>camera+W-24||mode!=='playing'||enemyShots.length+angles.length>4)return;
 if(e.veteran)speed*=1.15;
 const dx=player.x+player.w/2-(e.x+e.w/2),dy=player.y+player.h/2-(e.y+e.h/2);let aim=Math.atan2(dy,dx);
 if(e.franchise==='contra-soldier'||e.franchise==='contra-sniper')aim=dx<0?Math.PI:0;
 const muzzleY=e.franchise==='contra-soldier'?e.y+e.h-25.5:e.franchise==='contra-sniper'?e.y+e.h-27.5:e.y+e.h/2;
 for(const a of angles)enemyShots.push({x:e.x+e.w/2+Math.cos(aim+a)*12-2,y:muzzleY-2,w:4,h:4,vx:Math.cos(aim+a)*speed,vy:Math.sin(aim+a)*speed,life:180});}
// A single arcing grenade or dropped egg shares the existing four-projectile budget.
function spawnSpecialEnemyShot(e,kind){if(e.x<camera+24||e.x>camera+W-24||mode!=='playing'||enemyShots.length>=4)return false;
 const facing=player.x+player.w/2<e.x+e.w/2?-1:1;
 if(kind==='grenade')enemyShots.push({kind,owner:e.uid,x:e.x+e.w/2+facing*7-3,y:e.y+2,w:6,h:6,vx:facing*1.1,vy:-2.1,gravity:.045,life:180,age:0});
 else enemyShots.push({kind,owner:e.uid,x:e.x+e.w/2-8,y:e.y+30,w:16,h:12,vx:0,vy:.4,gravity:.055,life:150,age:0});
 return true;
}
const oldEnemyUpdate=updateEntities;
updateEntities=function(){if(hero!=='mario')for(const e of enemies){if(!e.franchise||!e.active||e.dead)continue;e.shotTick++;e.phase=(e.phase+1)%144;if(e.flash)e.flash--;if(e.blockFlash)e.blockFlash--;
 switch(e.franchise){
 case 'mario-goomba':case 'mario-koopa':break;
 case 'met':e.metOpen=e.phase>=70&&e.phase<115;e.vx=0;if(e.phase===84||(e.veteran&&e.phase===104))spawnEnemyShot(e,[0],1.2);break;
 case 'screwie':e.metOpen=e.phase>=45&&e.phase<110;e.vx=0;if(e.phase===70)spawnEnemyShot(e,[-.18,.18],1.1);break;
 case 'contra-ufo':{e.vy=-.25;const q=e.shotTick;if(q<=36){e.vx=0;e.y=e.baseY+Math.sin(q/8)*2;}else if(q<=70)e.vx=-.45;else if(q<=94){e.vx=0;e.vy=.55;}else if(!e.vx)e.vx=.75;break;}
 case 'shield-attacker':e.vy=-.25;e.y=e.baseY;if(e.shieldTurn){e.vx=0;if(--e.shieldTurn===0)e.heading=-e.heading;}else if(Math.abs(e.x-e.homeX)>=40&&Math.sign(e.x-e.homeX)===e.heading){e.shieldTurn=30;e.vx=0;}else e.vx=e.heading*.65;break;
 case 'pipi':e.vy=-.25;e.y=e.baseY+Math.sin(e.shotTick/25)*3;if(!e.eggDropped&&Math.abs(player.x+player.w/2-(e.x+e.w/2))<46&&e.shotTick>24)e.eggDropped=spawnSpecialEnemyShot(e,'egg');break;
 case 'contra-grenadier':{const q=e.shotTick%150,aiming=q>=66&&q<108;if(aiming){if(e.vx)e.patrolVx=e.vx;e.vx=0;}else if(!e.vx)e.vx=e.patrolVx??-.35;if(q===88)spawnSpecialEnemyShot(e,'grenade');break;}
 case 'popoheli':e.vy=-.25;e.y=e.baseY+Math.sin(e.shotTick/22)*12;if(e.shotTick%110===75)spawnEnemyShot(e,[0],1.25);break;
 case 'contra-turret':e.vx=0;e.metOpen=!!e.alwaysOpen||(e.shotTick%120>=45&&e.shotTick%120<108);if(e.shotTick%120===65||(e.veteran&&e.shotTick%120===87))spawnEnemyShot(e,[0],1.25);break;
 case 'contra-sniper':e.vx=0;if(e.shotTick%116===84||(e.veteran&&e.shotTick%116===104))spawnEnemyShot(e,[0],1.45);break;
 default:{const aiming=e.shotTick%126>=70&&e.shotTick%126<96;if(aiming){if(e.vx)e.patrolVx=e.vx;e.vx=0;}else if(!e.vx)e.vx=e.patrolVx??-.65;if(e.shotTick%126===86)spawnEnemyShot(e,[0],1.35);}
 }}oldEnemyUpdate();if(hero==='mario')return;
 for(const e of enemies)if(e.franchise==='shield-attacker'&&e.active&&!e.dead&&!e.shieldTurn&&e.vx&&Math.sign(e.vx)!==e.heading){e.shieldTurn=30;e.vx=0;}
 for(const s of enemyShots){if(s.gravity){s.age++;s.vy=Math.min(2.8,s.vy+s.gravity);}s.x+=s.vx;s.y+=s.vy;s.life--;if(solids(s).length)s.life=0;if(s.life>0&&overlap(s,player)){damage();s.life=0;}}
 enemyShots=enemyShots.filter(s=>s.life>0&&s.x>camera-24&&s.x<camera+W+24&&s.y>34&&s.y<H&&mode==='playing');};
const drawWithEnemy=draw;draw=function(){drawWithEnemy();for(const s of enemyShots){if(s.kind==='grenade'){const id=['contra-a6','contra-a8','contra-a9'][Math.floor(s.age/8)%3],im=enemyImages[id];if(im)enemyCrop(id,[0,0,im.width,im.height],s.x-camera+(s.w-im.width)/2,s.y+(s.h-im.height)/2);continue;}if(s.kind==='egg'){enemyCrop('pipi-egg',[0,0,32,32],s.x-camera-8,s.y-10);continue;}ctx.fillStyle='#fff5df';ctx.fillRect(Math.round(s.x-camera),Math.round(s.y),4,4);ctx.fillStyle='#df3020';ctx.fillRect(Math.round(s.x-camera)+1,Math.round(s.y)+1,2,2);}};
window.__mixReady=Promise.all([window.__mixReady,enemyReady]);
if(window.__mixTest){window.__mixTest.enemyState=()=>({shots:enemyShots.map(s=>({...s})),enemies:enemies.filter(e=>e.franchise).map(e=>({...e}))});window.__mixTest.ready=window.__mixReady;}

// The base room owns projectile/core interaction and does not run underground physics.
const baseRoomEntities=updateEntities;updateEntities=function(){if(billBase){updateBillBaseProjectiles();return;}baseRoomEntities();};
