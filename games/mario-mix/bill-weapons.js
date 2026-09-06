// Original Contra weapon families; geometry/frames are bound in R11_PROJECTILE_POSE_SOURCES.md.
let billWeapon='N',billDropBag=[],billMotion=0,billAirTicks=0,billFireFrames=0;
const BILL_WEAPON_NAMES={N:'普通弹',M:'M 连射枪',S:'S 散弹枪',F:'F 火球枪',L:'L 激光枪'};
function resetBillState(){resetBillControls();billWeapon='N';billDropBag=[];billMotion=0;billAirTicks=0;billFireFrames=0;}
function nextBillDrop(){if(!billDropBag.length)billDropBag=['M','S','F','L'].filter(w=>w!==billWeapon);const n=Math.floor(Math.random()*billDropBag.length);return billDropBag.splice(n,1)[0];}
function fireBillWeapon(){if(mixCool||mode!=='playing')return;billFireFrames=3;const muzzle=billMuzzle(),target=billBase?{x:128+(muzzle.x-128)*(24/70),y:128-(BILL_BASE_FLOOR-muzzle.y)*.5}:null,ax=target?target.x-muzzle.x:billAimX,ay=target?target.y-muzzle.y:billAimY,length=Math.hypot(ax,ay)||1,dx=ax/length,dy=ay/length,up=dy!==0,diagonal=!!ax&&!!ay;
 const family=billWeapon,speed={N:4.8,M:5.2,S:4.8,F:2.4,L:8}[family],angles=family==='S'?[-Math.PI/8,-Math.PI/16,0,Math.PI/16,Math.PI/8]:family==='L'?[0,0,0,0]:[0];
 angles.forEach((a,i)=>{const vx=(dx*Math.cos(a)-dy*Math.sin(a))*speed,vy=(dy*Math.cos(a)+dx*Math.sin(a))*speed;const size=family==='N'?3:family==='M'||family==='S'?5:8,w=family==='L'?(diagonal?8:up?6:16):size,h=family==='L'?(diagonal?13:up?16:6):size;
 mixShots.push({x:muzzle.x-w/2,y:muzzle.y-h/2,w,h,vx,vy,life:90,age:0,delay:family==='L'?i*3+1:0,family,baseForward:!!billBase,tier:mixTier,charged:false,damage:family==='N'?1:2,piercing:false,hitIds:[],cx:muzzle.x-dx*15,cy:muzzle.y-dy*15,angle:Math.atan2(dy,dx),rotation:dx<0?-Math.PI/8:Math.PI/8});});
 mixCool={N:12,M:7,S:17,F:24,L:28}[family];playBillWeaponSound(family);}
function advanceMixProjectile(s){if(s.delay>0){s.delay--;if(s.delay>0)return false;}s.life--;s.age=(s.age||0)+1;
 if(s.family==='F'&&!s.baseForward){s.cx+=s.vx;s.cy+=s.vy;s.angle+=s.rotation;s.x=s.cx+Math.cos(s.angle)*15-s.w/2;s.y=s.cy+Math.sin(s.angle)*15-s.h/2;}else{s.x+=s.vx;s.y+=s.vy;}
 if(s.family==='S'){const size=s.age<16?5:s.age<32?6:8;const cx=s.x+s.w/2,cy=s.y+s.h/2;s.w=s.h=size;s.x=cx-size/2;s.y=cy-size/2;}return true;}
function drawBillShot(s){const laser=s.family==='L',diagonal=laser&&s.vx!==0&&s.vy!==0,id=laser?(diagonal?'contra-laser-diag':s.vy?'contra-laser-up':'contra-laser'):s.family==='F'?'contra-fire':s.family==='S'?(s.age<16?'contra-machine':s.age<32?'contra-spread':'contra-spread-far'):s.family==='M'?'contra-machine':'contra-normal';
 if(laser){const flipX=s.vx<0,flipY=s.vy>0;ctx.save();ctx.translate(Math.round(s.x-camera)+(flipX?s.w:0),Math.round(s.y)+(flipY?s.h:0));ctx.scale(flipX?-1:1,flipY?-1:1);mixCrop('projectiles/'+id,[0,0,s.w,s.h],0,0);ctx.restore();}else mixCrop('projectiles/'+id,[0,0,s.w,s.h],s.x-camera,s.y,1,s.vx<0);}

// A weapon retriggers one shot channel instead of stacking long sample tails.
function playBillWeaponSound(family){
 const keys=['bill_shot','bill_machine','bill_spread','bill_flare','bill_laser'];
 if(audio){const now=audio.currentTime;for(const v of [...voices])if(keys.includes(v.key)){
  v.gain.gain.cancelScheduledValues(now);v.gain.gain.setValueAtTime(v.gain.gain.value,now);
  v.gain.gain.linearRampToValueAtTime(0,now+.003);v.node.stop(now+.003);voices.delete(v);
 }}
 const key={N:'bill_shot',M:'bill_machine',S:'bill_spread',F:'bill_flare',L:'bill_laser'}[family];
 oneShot(key);
}
