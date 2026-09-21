/* R36 — a continuous, more urgent Ori flood; no map or ability changes.
 * Only active simulation ticks advance the pursuit. R32 Bash stops the entire
 * world before this code is called. Pausing/settings/focus loss also stop it.
 * Speed is distance-dependent, not a minimum-gap cheat: waiting IS fatal.
 */
const O36_FLOOD=Object.freeze({
 entryGap:112, retryGap:128, entryGrace:60, retryGrace:84,
 acceleration:.12, deceleration:.36,
 curve:Object.freeze([[0,.65],[40,.75],[80,1.55],[128,3],[200,5.2],[280,6.2]].map(p=>Object.freeze(p)))
});
function o36IsFlood(){return c23Is()&&!s33Is()&&o28.phase==='flood';}
function o36FloodSpeed(gap){
 const curve=O36_FLOOD.curve;
 if(!Number.isFinite(gap))return curve[0][1];
 if(gap<=curve[0][0])return curve[0][1];
 for(let i=1;i<curve.length;i++){
  const [x,y]=curve[i],[px,py]=curve[i-1];
  if(gap<=x)return py+(y-py)*(gap-px)/(x-px);
 }
 return curve[curve.length-1][1];
}
function o36InitFlood(retry=false){
 if(!o36IsFlood())return;
 o28.pursuit36={age:0,grace:retry?O36_FLOOD.retryGrace:O36_FLOOD.entryGrace,retry:!!retry};
 o28.water=player.y+player.h+(retry?O36_FLOOD.retryGap:O36_FLOOD.entryGap);
 o28.speed=.75;o28.waterAge=0;o28.waterStarted=false;o28.breath=0;
}
const o36EnterBase=o28EnterFlood;
o28EnterFlood=function(cp=0,retry=false){const r=o36EnterBase(cp,retry);o36InitFlood(retry);return r;};
function o36FloodTick(){
 if(!o36IsFlood()||mode!=='playing'||c23Menu||o24Box.open||c23.ori.bash||c23.practice)return;
 const q=o28.pursuit36||(o28.pursuit36={age:0,grace:O36_FLOOD.entryGrace,retry:false});
 q.age++;
 if(!o28.waterStarted){
  if(q.age<q.grace)return;
  o28.waterStarted=true;o28Event('flood-rising');
 }
 o28.waterAge++;
 const gap=o28.water-player.y-player.h,target=o36FloodSpeed(gap);
 o28.speed=approach(o28.speed,target,target>o28.speed?O36_FLOOD.acceleration:O36_FLOOD.deceleration);
 o28.water-=o28.speed;
}
// The distance strip reflects the true water surface. No new flashing overlay,
// camera shake, speed-up of player controls, or full-screen warning is added.
const o36HUDBase=o24HUD;
o24HUD=function(){
 o36HUDBase();if(!o36IsFlood())return;
 const g=ctx,gap=o28.water-player.y-player.h;
 let text='练习 · 洪水关闭',color='#8db2ba';
 if(!c23.practice){
  if(c23.ori.bash){text='瞄准中 · 水位暂停';color='#dce9b7';}
  else if(!o28.waterStarted){
   const q=o28.pursuit36;const seconds=Math.max(0,((q?.grace||60)-(q?.age||0))/60);
   text='洪水将至 '+seconds.toFixed(1)+' 秒';color='#f0d6a0';
  }else{
   text=(gap<64?'向上逃！ ':gap<112?'洪水逼近 ':'洪水距离 ')+Math.max(0,Math.ceil(gap/16))+' 格';
   color=gap<64?'#ffc099':gap<112?'#f0d6a0':'#8db2ba';
  }
 }
 g.save();g.fillStyle='#07151f';g.fillRect(163,20,90,10);
 g.font='4.1px system-ui,sans-serif';g.textAlign='left';g.fillStyle=color;g.fillText(text,166,26);g.restore();
};
const o36HelpBase=o30Help;
o30Help=function(){
 const base=o36HelpBase();
 if(!o36IsFlood()||mode!=='playing'||c23Menu||c23.ori.bash||c23.practice)return base;
 if(!o28.waterStarted)return '水闸即将开启 · '+base;
 return (o28.water-player.y-player.h<64?'洪水贴近，别停留 · ':'')+base;
};
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R36',chapter14:'Ori urgent flood / Sonic classic castle + continuous rolling attack'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 window.__castle36={...window.__castle35,build:'R36',floodConfig:O36_FLOOD,
  floodSpeed:o36FloodSpeed,
  flood:()=>({phase:o28.phase,water:o28.water,speed:o28.speed,waterAge:o28.waterAge,started:o28.waterStarted,pursuit:structuredClone(o28.pursuit36||null),gap:o28.water-player.y-player.h}),
  floodTick:o36FloodTick};
}

/* R37: visual fallback / reference-faithful grandfather / three-hit Sonic boss.
 * No collision geometry, movement constants, world rotation, flood speed,
 * checkpoint placement or story clock changes. Commercial soundtrack recordings
 * are not bundled: the identified original cue uses a platform stream and a local-file music slot.
 */
const S37_BOSS=Object.freeze({hits:3,cooldown:36});
const s37DamageBase=o24BossDamage;
o24BossDamage=function(amount){
 if(!s33Is())return s37DamageBase(amount);
 const b=c23?.bowser;
 if(!b?.alive||c23.ending||mode!=='playing')return false;
 if(Number.isFinite(b.hitTick37)&&c23.ticks-b.hitTick37<S37_BOSS.cooldown)return false;
 b.hitTick37=c23.ticks;b.hits37=(b.hits37||0)+1;
 b.hp=Math.max(0,S37_BOSS.hits-b.hits37);b.maxHp=S37_BOSS.hits;c23.ori.hitBoss=10;
 o24FX(b.x+14,b.y+12,'#fff0ae',12,1.8);
 c23Event('sonic-bowser-hit',{hits:b.hits37,remaining:b.hp});
 if(b.hp===0){b.alive=false;b.vy=-3;addScore(5000,b.x,b.y);o24FX(b.x+14,b.y+16,'#ffe0a0',25,3);c23Event('bowser-defeated',{method:'sonic-three-hits',hits:b.hits37});}
 return true;
};
// Small three-pip indicator is draw-only. It stays attached to the boss/camera.
const s37SceneBase=s34Draw;
s34Draw=function(){s37SceneBase();if(!s33Is()||!c23?.bowser?.alive||!c23.bowser.active||c23.ending)return;
 const b=c23.bowser,g=ctx,x=Math.round(b.x-camera+3),y=Math.round(b.y-6);
 g.save();for(let i=0;i<3;i++){g.fillStyle=i<b.hp?'#f8d878':'#554638';g.fillRect(x+i*8,y,5,2);}g.restore();
};

// The photographed rock/CG surfaces were not Ori game art. In the absence of a
// verified complete Ori environment set, use the explicitly requested classic
// Mario fallback, rather than presenting a mixed environment as official art.
o25Art='classic';
const s37ArtSelect=$('o25Art');if(s37ArtSelect){s37ArtSelect.innerHTML='<option value="classic">马里奥经典地块 · 黑底城堡</option>';s37ArtSelect.value='classic';s37ArtSelect.onchange=()=>{o25Art='classic';c23Draw();};}
o24Backdrop=function(){ctx.save();ctx.fillStyle='#000000';ctx.fillRect(0,32,256,208);ctx.restore();};
o25Foreground=function(){};
o25Terrain=function(){
 for(const t of tiles.values()){
  if(t.hidden||t.x*16<camera-16||t.x*16>camera+256)continue;
  const x=t.x*16-camera,y=t.y*16-(t.bump?Math.sin(t.bump/12*Math.PI)*4:0);
  sprite(t.castleBase?'c23_base':t.type==='stone'?'c23_stone':t.used?'block_used':'question'+Math.floor(frame/8)%3,x,y,false,false,t.type==='question'?'under':'normal');
 }
};
o29Stone=function(g,e){g.drawImage(classicSprite('c23_stone'),e.x,e.y,e.w,e.h);};
o29Plate=function(g,e){
 const im=classicSprite('c23_platform');g.save();g.imageSmoothingEnabled=false;
 for(let x=e.x;x<e.x+e.w;x+=8){const w=Math.min(8,e.x+e.w-x);g.drawImage(im,0,0,w,5,x,e.y,w,e.h);}g.restore();
};
o29Backdrop=function(){ctx.save();ctx.fillStyle='#000000';ctx.fillRect(0,32,256,208);ctx.restore();};
// Keep fixed hazard behavior unchanged. Their visual boundaries retain the old
// contact line; the purple pools are still poisonous water, not instant lava.
o24DrawPool=function(pool){
 if(o27Kind(pool)==='lava'){c23DrawLava(pool);return;}
 const g=ctx,x=pool.x-camera,t=c23.ticks;
 g.save();g.beginPath();g.rect(x,pool.y,pool.w,240-pool.y);g.clip();g.fillStyle='#3b155c';g.fillRect(x,pool.y+4,pool.w,240-pool.y);
 for(let yy=pool.y+5;yy<240;yy+=7){g.fillStyle=yy===pool.y+5?'#b978d4':'#703899';for(let xx=x-8;xx<x+pool.w+8;xx+=8)g.fillRect(xx+(Math.floor(t/7)+yy)%8,yy,5,1);}
 g.restore();
};

// Ginso-inspired water rendering: continuous pale crest, turquoise depth,
// upward flow and foam. Procedural reference reconstruction, NOT an extracted
// Moon Studios water texture. o28WaterLine remains the sole collision boundary.
o28DrawWater=function(){
 const g=ctx,y=o28.water-o28.camY,t=o28.waterAge;
 if(y>253)return;
 const top=x=>o28WaterLine(x)-o28.camY;
 g.save();g.beginPath();g.moveTo(16,248);for(let x=16;x<=240;x+=2)g.lineTo(x,top(x));g.lineTo(240,248);g.closePath();g.clip();
 const depth=g.createLinearGradient(0,y-2,0,Math.max(y+110,244));
 depth.addColorStop(0,'#d4fffc');depth.addColorStop(.04,'#9df5f1');depth.addColorStop(.12,'#37d6e9');depth.addColorStop(.42,'#149dcb');depth.addColorStop(1,'#073d75');
 g.fillStyle=depth;g.fillRect(16,y-9,224,Math.max(264,264-y));
 g.globalCompositeOperation='screen';
 for(let k=0;k<24;k++){
  const x=18+(k*67.1)%221,yy=y+8+((k*29.71-t*(1.2+k%3*.17))%150+150)%150;
  g.strokeStyle=k%3?'#99f8ff30':'#ddffff64';g.lineWidth=.6+(k%3)*.25;
  g.beginPath();g.moveTo(x,yy+15);g.bezierCurveTo(x-5,yy+7,x+8,yy+4,x+3,yy-9);g.stroke();
 }
 for(let k=0;k<13;k++){
  const yy=y+6+k*9;g.strokeStyle=k<3?'#e5fff95b':'#b4f9fb24';g.lineWidth=k<3?1:.65;
  g.beginPath();for(let x=16;x<=240;x+=3){const h=yy+Math.sin(x*.063-t*.057+k*1.1)*2.2+Math.cos(x*.11+t*.041+k)*.7;x===16?g.moveTo(x,h):g.lineTo(x,h);}g.stroke();
 }
 g.restore();
 g.save();g.beginPath();for(let x=16;x<=240;x+=1)x===16?g.moveTo(x,top(x)):g.lineTo(x,top(x));
 g.strokeStyle='#edffff';g.shadowColor='#77eef3';g.shadowBlur=7;g.lineWidth=1.65;g.stroke();g.shadowBlur=0;
 for(let k=0;k<42;k++){
  const life=((t+k*17)%47)/47,x=18+(k*47.3+t*(k%2?-.17:.21)+2200)%221;
  const yy=top(x)-Math.sin(life*Math.PI)*(2+k%5*1.65);
  g.globalAlpha=(1-life)*.78;g.fillStyle=k%4?'#ddffff':'#ffffff';g.beginPath();g.ellipse(x,yy,.32+(k%3)*.19,.5+(k%4)*.20,life-.5,0,Math.PI*2);g.fill();
 }
 g.restore();
};

/* R38 grandfather: an actual transparent PNG from the public CalabashBrothers
 * project. One source pose, NOT a production animation sheet. The 14 cached
 * cells below are small cutout motion adaptations; the face/costume pixels are
 * neither repainted nor replaced by a generated stand-in. */
const G38={size:136,height:180,count:14,sourceFrames:1,anchorX:68,feet:174,
 source:'public-project-png',blob:'61556f59d0eed2046e7cdada05af7724716d2807',
 image:new Image(),atlas:document.createElement('canvas'),loaded:false,error:null};
G38.atlas.width=G38.size*G38.count;G38.atlas.height=G38.height;
G38.image.src="@@E04:uri:a212@@";
function g38Pose(t=0,walking=false,climbing=false){
 t=Math.max(0,Math.floor(Number.isFinite(t)?t:0));
 if(climbing)return 10+Math.floor(t/10)%4;
 if(walking)return 2+Math.floor(t/8)%6;
 if(o28.phase==='turn'&&o28.age>150&&o28.age<275)return 8+Math.floor(t/18)%2;
 return Math.floor(t/70)%2;
}
function g38BuildFrames(){
 const g=G38.atlas.getContext('2d');g.clearRect(0,0,G38.atlas.width,G38.atlas.height);
 g.imageSmoothingEnabled=false;
 for(let i=0;i<G38.count;i++){
  const moving=i>=2&&i<8,climb=i>=10;
  const swing=moving?Math.sin((i-2)*Math.PI/3)*2.4:climb?Math.sin((i-10)*Math.PI/2)*1.8:i===1?.65:i===9?1.2:0;
  // Source rows shift gently, fading to zero at the feet. The source's face and
  // hand silhouette remain intact; this is subtle cutout motion, not new art.
  for(let y=0;y<170;y++){
   const amount=y<100?1:(170-y)/70;
   const dx=Math.round(swing*amount);
   g.drawImage(G38.image,0,y,112,1,i*G38.size+12+dx,4+y,112,1);
  }
 }
 G38.loaded=true;
}
const g38Ready=G38.image.decode().then(()=>{
 if(G38.image.naturalWidth!==112||G38.image.naturalHeight!==170)throw Error('Unexpected grandfather image dimensions');
 g38BuildFrames();return true;
}).catch(e=>{G38.error=String(e);console.error('Grandfather image did not decode',e);return false;});
o29Keeper=function(g,x,feet,t=0,face=1,walking=false,climbing=false){
 if(!G38.loaded)return;
 const cell=g38Pose(t,walking,climbing),scale=.20;
 g.save();g.translate(x,feet);g.scale(face<0?-1:1,1);
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(G38.atlas,cell*G38.size,0,G38.size,G38.height,
  -G38.anchorX*scale,-G38.feet*scale,G38.size*scale,G38.height*scale);
 g.restore();
};
// Compatibility for the historical optional QA adapter; no old redraw is kept.
const G37=G38;const g37Pose=g38Pose;
