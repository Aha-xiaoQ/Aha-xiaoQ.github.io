/* Native 1-4 campaign integration. Shares the existing canvas, clock, Mario
   physics, original pixel decoder, audio mixer and validated control bindings.
   Reference geometry is kept separate from the new chase choreography. */
variants.castle={2:4,5:1,9:3};
const C23_ART={"c23_stone":[16,"p[1,2,3,4]0031x06,31000022310x25,310x25,310x25,310x25,310x25,310x25,310x25,310x25,310x25,3102223331x37,13333x116,x06,31x06,310x25,310x25,310x25,310x25,310x25,310x25,310x25,310x25,310x25,310x25,31x37,1x37,x117,"],"c23_base":[16,"p[0,4,9]0x114,01x214,1121x210,1211x214,11x214,11x214,11x214,11x214,11x214,11x214,11x214,11x214,11x214,1121x210,1211x214,10x114,0"],"c23_axe0":[16,"p[0,2,4,6,9]003x010,3000323300420033130032333322333313032x35,42x35,1332x35,42x35,1332x35,42x35,1332x35,42x35,1332x35,42x35,130323333423333130002330042000313000300002200003x09,42x014,22x014,42x014,22x014,42x07,"],"c23_axe1":[16,"p[0,2,4,9]003x010,3000323300320033130032333322333313032x36,2x35,1332x36,2x35,1332x36,2x35,1332x36,2x35,1332x36,2x35,13032x35,23333130002330032000313000300002200003x09,32x014,22x014,32x014,22x014,32x07,"],"c23_axe2":[16,"p[0,2,4,9,11]004x010,4000424400320044140042444422444414042x45,32x45,1442x45,32x45,1442x45,32x45,1442x45,32x45,1442x45,32x45,140424444324444140002440032000414000400002200004x09,32x014,22x014,32x014,22x014,32x07,"],"c23_bridge":[16,"p[1,2,4,8]10001000100010001000100010001000122212223222322232223222322232223222322232223222322232221222122213331333133313331333133313331333"],"c23_chain":[16,"p[0,1,3]x014,1x013,1x014,22x011,12x013,22x011,12x012,102x012,22x011,12x012,102x012,22x011,12x013,22x011,12x012,102x012,22x013,"],"c23_platform":[8,"p[0,1,6,9]x18,x38,220000222x05,322x05,32223333x210,x38,"],"c23_bowser0":[32,"p[0,1,6,14]x012,111x025,331112x025,3331122x023,113333223x019,200311x37,x018,2023311x38,x017,2221113332x35,x017,222213332223333x017,122233221323333113331x012,1022223332333311331123x010,10113133123333113111223111x09,10003223331113312233112x013,12233111x39,2231x011,2233111x313,1x09,122233111x36,111x35,x010,220033x16,33112333111x015,33222113322333112x011,222001022211x37,22x010,2210222012231x39,1x09,220022220033133311133321x08,210x26,1331133112333x010,200x25,333311333223311x010,10x25,333311x37,111x011,12220x35,1333311322x017,x35,1133323323x018,x35,111x36,x019,x35,11113333x019,2x36,x17,x017,1122332222x15,x016,111x210,11x021,1122112222x021,1112111x25,0"],"c23_bowser1":[32,"p[0,1,6,14]x012,111x025,331112x025,3331122x023,113333223x019,200311x37,x018,2023311x38,x017,2221113332x35,x017,222213332223333x017,122233221323333113331x012,1022223332333311331123x010,10113133123333113111223111x09,10003223331113312233112x013,12233111x39,2231x011,2233111x313,1x09,122233111x36,111x35,x010,220033x16,33112333111x015,33222113322333112x011,222001022211x37,22x010,2210222012231x39,1x09,220022220033133311133321x08,210x26,1331133112333x010,200x25,333311333223311x010,10x25,333311x37,111x011,12220x35,1333311322x017,x35,1133323323x018,x35,11x37,x019,x35,11113333x020,x36,x17,x019,22332222x15,x018,2222112211211x018,112211121112222x016,111x27,x06,"],"c23_bowserFire":[24,"p[0,1,6,8]x010,x36,003x010,x316,x06,x35,22332222332222x315,x25,111133x05,3333x213,13000x313,2223333x05,x39,0x36,x09,3300333033003x06,"],"c23_toad":[16,"p[0,1,2,6,8]x038,1111x010,x18,x06,144411114441000114441441444110011441444414411044111144441111x45,1114444111x46,1111441111x46,x110,x45,1133233233114401143323323341100300x38,00303330333223330x37,443333443333003x410,300004444333344440000444x36,4440000444x36,444x05,x110,x05,x112,000444x18,444041444x16,4441x47,1111x412,1111x46,"],"c23_lava":[8,"p[0,1,8]x028,1x06,121000012210011222100x26,1121x26,1212222122122112"]};
for(const [id,[w,data]] of Object.entries(C23_ART)){
 const pixels=decodeClassic(data);if(pixels.length%w)throw Error('Castle sprite dimensions: '+id);
 decoded.set(id,{w,h:pixels.length/w,pixels});classicSprite(id);
}
const C23_AUDIO_SOURCE='https://raw.githubusercontent.com/umaim/Mario/980c275358704a49f868567aeec5bdfb347c4781/Source/Sounds/Themes/mp3/';
for(const m of [{key:'castle23',name:'Castle',filename:'Castle.mp3',size:641593,sha:'cfe9504b41e5654b9c038db59c6baeae9284d8bc',music:true},{key:'castleclear23',name:'Castle Complete',filename:'Castle Complete.mp3',size:74967,sha:'7f0ffa05a869e8455f09bfc428ed44c7c8424562',music:false}])AUDIO_MANIFEST.push({...m,mime:'audio/mpeg',url:C23_AUDIO_SOURCE+encodeURIComponent(m.filename),api:'https://api.github.com/repos/umaim/Mario/git/blobs/'+m.sha});
const C23_ROOMS={
 11:{name:'经典启程',tag:'01 / CLASSIC CROSSOVER',heroes:['mario','bill','megaman'],title:'同一关卡，三种玩法。',intro:'蘑菇、枪械与洛克炮。沿着熟悉的 1-1，开启救援旅程。'},
 12:{name:'地下援军',tag:'02 / UNDERGROUND REINFORCEMENTS',heroes:['ryu','tank'],title:'潜入地下，各显身手。',intro:'隼龙攀墙，坦克破砖。保留之前的地下主线与隐藏挑战。'},
 13:{name:'泰拉瑞亚',tag:'03 / TERRARIA CROSSOVER',heroes:['sandboxTrio'],title:'泰拉瑞亚，闯进 1-3。',intro:'穿越森林与雪原，搭建平台、探索矿洞，再迎战克苏鲁之眼。'},
 14:{name:'熔城逃脱',tag:'04 / CASTLE ESCAPE',heroes:['mario'],title:'穿过火棒长廊。赶在熔潮之前。',intro:'灰砖、熔岩与旋转火棒。用马里奥的助跑和长短跳穿过 1-4，在熔潮前触斧断桥。'}
};
const C23_RECTS=[ // x, height above floor, width, height, in original FSM map units.
 [0,88,40,24],[0,48,24,64],[24,40,8,56],[32,32,8,48],
 [40,88,152,24],[40,24,64,40],[120,24,88,40],
 [184,64,8,8],[184,56,8,8],[192,88,1088,8],
 [232,24,24,40],[280,32,296,8],[280,24,552,24],
 [280,0,744,16],[296,80,280,24],[296,56,8,8],
 [392,56,8,8],[480,56,8,8],[536,56,8,8],
 [608,32,8,8],[640,80,8,8],[640,72,8,8],[672,32,8,8],
 [704,80,8,8],[704,72,8,8],[736,32,8,8],[776,80,56,16],
 [928,24,32,24],[984,24,40,24],[984,80,40,16],
 [1024,88,256,8],[1128,32,24,48],[1128,0,152,16],[1136,80,16,24]
];
const C23_BASES=[[184,56],[240,24],[296,56],[392,56],[480,56],[536,56],[608,32],[640,72],[672,32],[704,72],[736,32]];
const C23_BARS=[[240,24,1],[392,56,1],[480,56,1],[536,56,1],[608,32,1],[672,32,1],[704,72,-1]];
const C23_LAVA=[{x:208,y:192,w:32},{x:416,y:208,w:48},{x:512,y:208,w:48},{x:2048,y:208,w:208}];
const C23_CPS=[{x:30,feet:112,phase:0},{x:580,feet:144,phase:1},{x:1680,feet:208,phase:2},{x:1990,feet:160,phase:3}];
let c23=null,c23Menu=true,c23ReadyMenu=false,c23SelectionLock=false,c23PadPrev=[],c23PadPresent=false,c23BlockJump=false,c23PendingJump=false,c23Device='键盘',c23PadError=false,c23NoticeFrames=0;
const c23Legacy={start:startGame,primary:handlePrimary,pause:togglePause,chars:showCharacters,select:selectHero,fixed:fixedUpdate,draw,ui:updateUi,heroUI:updateHeroUI,die,move:moveBody,desired:desiredMusic,sync:audioSync,early:t17Early.handle,poll:pollMixPad};
c23Campaign={stage:14,chosen:{11:'mario',12:'ryu',13:'sandboxTrio',14:'mario'},completed:new Set()};
try{c23Campaign.completed=new Set(JSON.parse(save.get('chapters','[]')));}catch{}
const c23Ev=[];
function c23Event(type,data={}){c23Ev.push({type,frame,...data});if(c23Ev.length>1600)c23Ev.shift();}
function c23Is(){return c23Campaign.stage===14;}
function c23Map(){const map=new Map();for(const [x,y,w,h] of C23_RECTS){for(let yy=(208-y*2)/16;yy<Math.min(15,(208-y*2+h*2)/16);yy++)for(let xx=x/8;xx<(x+w)/8;xx++)put(map,xx,yy,'stone');}
 for(const [x,y]of C23_BASES)put(map,x/8,(208-y*2)/16,'stone').castleBase=true;
 put(map,30,6,'question','power');
 for(const [x,y]of [[848,32],[872,32],[896,32],[856,64],[880,64],[904,64]])put(map,x/8,(208-y*2)/16,'question','coin').hidden=true;
 return map;
}
function c23Clear(){keys.clear();touch.clear();c23PendingJump=false;jumpBuffer=0;jumpHeldPrev=false;runHeldPrev=false;r04Clear();document.querySelectorAll('.touchkey').forEach(b=>b.classList.remove('pressed'));}
function c23SnapshotCheckpoint(index){c23.cp=index;c23.saved={index,power:player.power,score,coins,map:[...tiles.values()].map(t=>({...t,bump:0})),time:timeLeft};c23Event('checkpoint',{index,x:player.x});}
function c23ResetScene(cp=0,retry=false){
 const prev=c23,practice=!!$('c23Practice')?.checked;
 if(!retry){score=0;coins=0;lives=3;timeLeft=300;maxProgress=0;}
 c23={ticks:retry?(cp===0?0:cp===1?240:cp===2?650:850):0,runFrames:retry?prev.runFrames:0,retries:retry?prev.retries:0,cp,practice:retry?prev.practice:practice,saved:retry?prev.saved:null,wave:C23_CPS[cp].x-260,waveSpeed:0,chaseStarted:false,chaseAge:0,ending:0,bridgeRemoved:0,fire:[],dust:[],shake:0,deathFrames:0,cause:'',bowser:{x:2186,y:126,w:28,h:32,vx:-.5,vy:0,hp:5,alive:true,active:false,age:0,face:-1,fireTime:0,grounded:false},lift:{x:2216,y:96,w:32,h:8,dx:0},seen:new Set(),banner:0};
 tiles=retry&&c23.saved?new Map(c23.saved.map.map(t=>[tileKey(t.x,t.y),{...t}])):c23Map();
 if(retry&&c23.saved){score=c23.saved.score;coins=c23.saved.coins;timeLeft=c23.saved.time;}
 room='surface';enemies=[];items=[];shots=[];particles=[];floaters=[];looseCoins=[];pipes=[];enemyShots=[];mixShots=[];r12=null;ninja=null;billBase=null;
 surface={tiles,enemies,items,pipes,coins:looseCoins};underground=null;
 const spawn=C23_CPS[cp];player=createPlayer(spawn.x,spawn.feet-14);if(retry&&c23.saved?.power)setSize(c23.saved.power);player.grounded=true;player.invuln=retry?75:0;
 camera=clamp(player.x-110,0,2304);frame=c23.ticks;timerTicks=0;freeze=0;deathTick=0;checkpoint=0;flagPhase=0;pipeTransition=null;
 c23Clear();const activePad=c23SafePad();c23PadPresent=!!activePad;c23PadPrev=activePad?Array.from(activePad.buttons||[],b=>b.pressed||b.value>.5):[];if(!activePad)c23Device='键盘';mode='playing';c23Menu=false;c23ReadyMenu=false;c23BlockJump=true;
 if(!retry)c23SnapshotCheckpoint(0);
 resetGameAudio();hideOverlay();$('heroPicker').hidden=true;$('overlay').classList.remove('choosing','r04-choose');$('overlayCharacters').hidden=false;$('c23Next').hidden=true;$('upgradeNotice').hidden=true;
 canvas.width=256;canvas.height=240;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
 audioInit();prepareAudio().catch(()=>{});canvas.focus({preventScroll:true});c23Event(retry?'retry':'start',{cp,practice:c23.practice});c23UI();audioSync();
}
function c23Start(){hero='mario';c23ResetScene(0,false);}
function c23Retry(){if(!c23)return c23Start();c23ResetScene(c23.cp,true);}
function c23Fail(cause){if(mode!=='playing'||c23.ending)return;c23.cause=cause;c23.retries++;c23.deathFrames=0;mode='dying';player.vx=0;player.vy=-5.1;stopMusic(false);stopEffects();oneShot('death');c23Event('death',{cause,x:player.x,cp:c23.cp});c23UI();}
die=function(){if(c23Is())return c23Fail('坠入熔岩');return c23Legacy.die();};
moveBody=function(b,dx,dy,isPlayer=false){if(!c23Is()||!c23)return c23Legacy.move(b,dx,dy,isPlayer);const oy=b.y,foot=oy+b.h;
 C23_CORE.moveBody(b,dx,dy,isPlayer);if(dy>=0){const bridge={x:2048,y:160,w:208-c23.bridgeRemoved*16,h:8};
 for(const platform of [bridge,c23.lift])if(platform.w>0&&b.x+b.w>platform.x+.01&&b.x<platform.x+platform.w-.01&&foot<=platform.y+.75&&b.y+b.h>=platform.y){b.y=platform.y-b.h;b.vy=0;b.grounded=true;if(isPlayer&&platform===c23.lift){const n={...b,x:b.x+platform.dx};if(!solids(n).length)b.x=n.x;}}
 }
};
function c23BarDots(bar,index){const [x,y,dir]=bar,cx=x*2+8,cy=208-y*2+8;
 // Six original-size fireballs; pivot plus five 8-pixel segments.
 const angle=dir*(c23.ticks*.02181661565)+[.1,1.4,2.3,.4,1.6,2.7,.5][index];
 return Array.from({length:6},(_,i)=>({x:cx+Math.cos(angle)*i*8,y:cy+Math.sin(angle)*i*8}));
}
function c23CircleHit(x,y,r){const p=player,nx=clamp(x,p.x+1,p.x+p.w-1),ny=clamp(y,p.y+1,p.y+p.h-1);return(x-nx)**2+(y-ny)**2<r*r;}
function c23Hurt(cause){if(player.invuln||player.star||mode!=='playing')return;if(player.power){setSize(0);player.invuln=120;freeze=20;oneShot('hurt');c23Event('hurt',{cause});}else c23Fail(cause);}
function c23BossTick(){const b=c23.bowser;if(!b.alive){b.y+=b.vy;b.vy+=.18;return;}if(!b.active&&player.x>1810)b.active=true;if(!b.active)return;b.age++;b.fireTime=Math.max(0,b.fireTime-1);b.face=player.x>b.x?1:-1;
 if(b.age%135===95&&b.grounded)b.vy=-3.35;
 b.vx=(Math.floor(b.age/100)%2?1:-1)*.48;b.vy=Math.min(4.25,b.vy+.19);moveBody(b,b.vx,b.vy);b.x=clamp(b.x,2104,2235);
 if(b.age%108===45){b.fireTime=23;const targetY=clamp(player.y+player.h*.6,100,158);c23.fire.push({x:b.x-20,y:b.y+9,w:24,h:8,vx:b.face*1.65,ty:targetY,age:0});oneShot('fire',{volume:.6});}
 if(overlap(player,{x:b.x+2,y:b.y+2,w:b.w-4,h:b.h-3}))c23Hurt('库巴');
 for(let i=shots.length-1;i>=0;i--)if(overlap(shots[i],b)){shots.splice(i,1);b.hp--;oneShot('kick');c23Event('bowser-hit',{hp:b.hp});if(b.hp<=0){b.alive=false;b.vy=-3;addScore(5000,b.x,b.y);c23Event('bowser-defeated',{method:'fireballs'});}}
}
function c23Hazards(){for(let j=0;j<C23_BARS.length;j++)for(const q of c23BarDots(C23_BARS[j],j))if(c23CircleHit(q.x,q.y,3.3))c23Hurt('旋转火棒');
 for(const pool of C23_LAVA)if(player.x+player.w>pool.x+1&&player.x<pool.x+pool.w-1&&player.y+player.h>pool.y+5)c23Fail('熔岩');
 for(const f of c23.fire){f.age++;f.x+=f.vx;f.y=approach(f.y,f.ty,.38);if(overlap(player,{x:f.x+4,y:f.y+2,w:16,h:4}))c23Hurt('库巴火焰');}
 c23.fire=c23.fire.filter(f=>f.age<440&&f.x>camera-40&&f.x<camera+320);
}
function c23ChaseTick(){if(c23.practice||c23.ending)return;const s=c23;
 if(!s.chaseStarted&&((player.x>C23_CPS[s.cp].x+52)||s.ticks>200)){s.chaseStarted=true;s.wave=player.x-168;s.waveSpeed=2.35;s.banner=95;c23Event('chase-start');}
 if(!s.chaseStarted)return;s.chaseAge++;
 const gap=player.x-s.wave;let target=gap>160?2.5:gap>95?1.65:1.12;
 // Once armed, no teleports or speed above Mario's run cap. Cornering is earned breathing room.
 s.waveSpeed=approach(s.waveSpeed,target,.045);s.wave+=s.waveSpeed;
 if(s.wave>player.x+player.w-1)c23Fail('被熔潮追上');
 if(s.ticks%9===0){const y=58+(s.ticks*31)%161;s.dust.push({x:s.wave-3,y,vx:-.6,vy:-.2,life:35,s:2});}
 if(s.ticks%170===30){s.shake=1;s.dust.push({x:Math.min(player.x+100,2250),y:52,vx:-.25,vy:.2,life:70,s:4});}
}
function c23Axe(){if(c23.ending)return;c23.ending=1;c23.fire=[];shots=[];player.vx=player.vy=0;player.invuln=0;freeze=0;c23.shake=1.7;stopMusic(false);stopEffects();oneShot('break',{volume:.8});c23Event('axe',{x:player.x});}
function c23EndingTick(){const s=c23;s.ending++;
 if(s.ending<85&&s.ending%6===0){s.bridgeRemoved=Math.min(13,s.bridgeRemoved+1);const x=2256-s.bridgeRemoved*16;s.dust.push({x,y:163,vx:0,vy:.5,life:60,s:7});oneShot('break',{volume:.24});}
 if(s.ending>34){const b=s.bowser;b.y+=b.vy;b.vy+=.24;}
 if(s.ending===96){oneShot(bank.has('castleclear23')?'castleclear23':'clear');c23Event('bridge-cleared');}
 if(s.ending>112){player.facing=1;player.vy=Math.min(4.25,player.vy+.4375);moveBody(player,player.x<2416?1.3:0,player.vy,true);player.anim+=1.3;camera=clamp(Math.max(camera,player.x-120),0,2304);}
 if(s.ending>240&&player.x>=2416){const n=Math.min(5,timeLeft);timeLeft-=n;score+=n*50;if(n&&frame%8===0)oneShot('coin',{duration:.027,volume:.17});}
 if(player.x>=2416&&timeLeft<=0&&s.ending>310){mode='win';c23Campaign.completed.add(14);save.set('chapters',JSON.stringify([...c23Campaign.completed]));
 showOverlay('WORLD 1-4 COMPLETE','逃脱成功','吊桥已经断开，蘑菇人获救。<br>公主还在另一座城堡。','再挑战一次 →','A / ENTER 重玩 · C / SELECT 选关');$('overlayCharacters').hidden=false;$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');c23Event('win',{score,retries:s.retries,frames:s.runFrames});c23UpdateTabs();}
}
function c23Step(v){if(!c23||c23Menu||c23Bindings?.isOpen())return;if(mode==='paused'||mode==='win'||mode==='respawn')return;
 if(mode==='dying'){c23.deathFrames++;frame++;if(c23.deathFrames>22){player.y+=player.vy;player.vy+=.22;}if(c23.deathFrames===45){showOverlay('TRY AGAIN','再来一次',c23.cause+'。<br>从最近的安全路段重新出发。','立即重试 →','A / 空格 重试 · R 从本段重试');$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');}
 if(c23.deathFrames>=102)c23Retry();return;}
 if(mode!=='playing')return;
 if(freeze>0){freeze--;return;}
 frame++;c23.ticks++;c23.runFrames++;c23.shake*=.85;if(c23.banner)c23.banner--;
 const oldLift=c23.lift.x;c23.lift.x=2192+Math.sin(c23.ticks*.016)*32;c23.lift.dx=c23.lift.x-oldLift;
 if(c23.ending){c23EndingTick();c23Particles();audioSync();return;}
 const lastPower=player.power;C23_CORE.updatePlayer(v);camera=clamp(camera,0,2304);
 if(mode!=='playing')return;
 C23_CORE.updateEntities();updateParticles();
 if(player.power>lastPower)c23Event('power-up',{power:player.power});
 c23BossTick();c23Hazards();if(mode!=='playing')return;c23ChaseTick();if(mode!=='playing')return;
 if(player.x+player.w>2256&&player.x<2278&&player.y<160&&player.y+player.h>112){c23Axe();return;}
 for(let i=c23.cp+1;i<C23_CPS.length;i++){const cp=C23_CPS[i];if(player.x>=cp.x&&player.x<cp.x+24&&player.grounded){c23SnapshotCheckpoint(i);break;}}
 timerTicks++;if(timerTicks>=24){timerTicks=0;timeLeft=Math.max(0,timeLeft-1);if(!timeLeft)c23Fail('时间用尽');}
 c23Particles();audioSync();
}
function c23Particles(){for(const p of c23.dust){p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life--;}c23.dust=c23.dust.filter(p=>p.life>0);}
function c23DrawLava(pool){const x=pool.x-camera;ctx.save();ctx.beginPath();ctx.rect(x,pool.y,pool.w,240-pool.y);ctx.clip();rect(x,pool.y+8,pool.w,240-pool.y,'#d82800');for(let xx=pool.x-8;xx<pool.x+pool.w+8;xx+=8)sprite('c23_lava',xx-camera+(Math.floor(c23.ticks/8)%8),pool.y);ctx.restore();}
function c23Draw(){if(!c23)return;if(canvas.width!==256||canvas.height!==240){canvas.width=256;canvas.height=240;}
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;rect(0,0,256,240,'#000');ctx.save();ctx.beginPath();ctx.rect(0,32,256,208);ctx.clip();
 const shake=$('c23Motion')?.checked?0:(c23.shake>.3?(frame%2?.5:-.5):0);ctx.translate(0,shake);
 for(const it of items)if(it.emerge>0)C23_CORE.drawItem(it);
 for(const t of tiles.values()){if(t.hidden||t.x*16<camera-16||t.x*16>camera+256)continue;const y=t.y*16-(t.bump?Math.sin(t.bump/12*Math.PI)*4:0);
 const name=t.castleBase?'c23_base':t.type==='stone'?'c23_stone':t.used?'block_used':'question'+Math.floor(frame/8)%3;
 sprite(name,t.x*16-camera,y,false,false,t.type==='question'?'under':'normal');}
 for(const pool of C23_LAVA)c23DrawLava(pool);
 for(let i=0;i<13-c23.bridgeRemoved;i++)sprite('c23_bridge',2048+i*16-camera,160);
 for(let i=0;i<4;i++)sprite('c23_platform',c23.lift.x+i*8-camera,96);
 if(!c23.ending){sprite('c23_chain',2241-camera,144);sprite('c23_axe'+Math.floor(frame/8)%3,2256-camera,128);}
 sprite('c23_toad',2436-camera,182);
 const b=c23.bowser;if(b.y<260){if(b.alive)sprite('c23_bowser'+(Math.floor(b.age/12)%2),b.x-camera-2,b.y,b.face>0);else sprite('goomba',b.x-camera+6,b.y,false,true);}
 for(let i=0;i<C23_BARS.length;i++)for(const q of c23BarDots(C23_BARS[i],i))sprite('fireball'+Math.floor((frame+i)/4)%4,q.x-camera-4,q.y-4);
 for(const f of c23.fire)sprite('c23_bowserFire',f.x-camera,f.y,f.vx>0);
 for(const shot of shots)sprite('fireball'+Math.floor(frame/3)%4,shot.x-camera-1,shot.y-1);
 for(const it of items)if(it.emerge<=0)C23_CORE.drawItem(it);
 C23_CORE.drawPlayer();
 for(const p of particles){if(p.kind==='coin')drawCoin(p.x-camera,p.y);else if(p.kind==='debris')sprite('debris',p.x-camera,p.y,false,false,'castle');else rect(p.x-camera,p.y,2,2,'#fc9838');}
 for(const f of floaters)text(f.text,f.x-camera,f.y,'#fff',1,true);
 if(!c23.practice&&c23.chaseStarted&&!c23.ending){const edge=c23.wave-camera;
  if(edge>-40){rect(0,32,Math.max(0,edge-9),208,'#8c1700');rect(edge-12,32,14,208,'#d82800');
   for(let yy=35;yy<241;yy+=8){const wobble=Math.sin(yy*.13+frame*.11)*3;sprite('fireball'+Math.floor((frame+yy)/3)%4,edge-4+wobble,yy);}
   for(let n=0;n<9;n++){const yy=56+(n*43+frame*2)%172;rect(edge-8-(n*17+frame)%27,yy,2,3,'#fc9838');}
  }
 }
 for(const p of c23.dust){if(p.s>3)sprite('debris',p.x-camera,p.y,false,frame%8>3,'castle');else rect(p.x-camera,p.y,p.s,p.s,'#fc9838');}
 ctx.restore();
 hud('MARIO',24,16);hud(String(score).padStart(6,'0'),24,24);ctx.save();ctx.translate(91,24);ctx.scale(.5,.5);sprite('coin0',0,0);ctx.restore();hud('×'+String(coins).padStart(2,'0'),104,24);hud('WORLD',144,16);hud('1-4',152,24);hud('TIME',208,16);hud(String(Math.ceil(timeLeft)).padStart(3,'0'),216,24);
 if(c23.ending>200&&player.x>2360){hud('THANK YOU MARIO!',188,77,'#fff',true);if(c23.ending>260){hud('BUT OUR PRINCESS',184,101,'#fff',true);hud('IS IN ANOTHER',184,117,'#fff',true);hud('CASTLE!',184,133,'#fff',true);}}
 c23UI();
}
// One front end for all four chapters; existing character cards and buttons stay live.
const c23Tabs=document.createElement('nav');c23Tabs.id='c23Chapters';c23Tabs.setAttribute('aria-label','冒险关卡');c23Tabs.setAttribute('role','tablist');
for(const [num,r] of Object.entries(C23_ROOMS)){const b=document.createElement('button');b.type='button';b.dataset.chapter=num;b.setAttribute('role','tab');b.innerHTML='<b>1-'+(Number(num)-10)+'</b><span>'+r.name+'</span>';b.onclick=()=>c23Choose(Number(num));c23Tabs.append(b);}
document.querySelector('.screen-shell').before(c23Tabs);
const c23Help=document.createElement('details');c23Help.id='c23Help';c23Help.innerHTML='<summary>操作指南 · 键盘 / 手柄</summary><div id="c23KeysText"></div>';$('t15Help').before(c23Help);
const c23Options=document.createElement('details');c23Options.id='c23Options';c23Options.innerHTML='<summary>关卡选项</summary><label><input type="checkbox" id="c23Practice">路线练习：关闭身后熔潮</label><p>切换后从头开始。地形、火棒和库巴不变。追逐模式有四个分段重试点。</p><label><input type="checkbox" id="c23Motion">减少画面震动</label>';
c23Help.after(c23Options);$('c23Practice').onchange=()=>{if(c23Is()){if(c23Menu)c23Preview();else c23Start();}};
const c23Next=document.createElement('button');c23Next.id='c23Next';c23Next.hidden=true;$('mainAction').after(c23Next);c23Next.onclick=()=>{const next=Math.min(14,c23Campaign.stage+1);c23Choose(next);startGame();};
document.body.classList.add('c23-campaign');
function c23Set(id,content){const e=$(id);if(e&&e.textContent!==content)e.textContent=content;}
function c23UpdateTabs(){for(const b of c23Tabs.children){const n=Number(b.dataset.chapter);b.setAttribute('aria-selected',String(n===c23Campaign.stage));b.querySelector('b').textContent='1-'+(n-10)+(c23Campaign.completed.has(n)?'  ✓':'');}}
function c23Filter(){const allowed=C23_ROOMS[c23Campaign.stage].heroes;for(const b of document.querySelectorAll('#heroPicker [data-hero]')){const allowedHere=allowed.includes(b.dataset.hero);b.classList.toggle('c23-filtered',!allowedHere);b.tabIndex=allowedHere?0:-1;const small=b.querySelector('small');if(b.dataset.hero==='mario'&&small)small.textContent=c23Is()?'1-4 · 城堡逃脱':'1-1 · 蘑菇与火焰花';}
 // Old hidden entry widgets must not reappear when an asynchronous media job ends.
 for(const id of ['r06SceneActions','r06Rewards','t10Previous','r06Options','r04StageChooser','r05EntryChooser','relayStart'])if($(id))$(id).hidden=true;
}
function c23Chrome(){const n=c23Campaign.stage,r=C23_ROOMS[n];document.body.classList.toggle('c23-castle',n===14);document.body.classList.toggle('c23-not-terra',n!==13);document.body.classList.remove('t10-terra-menu');
 document.querySelector('header .brand small').textContent='MARIO MIX / WORLD 1';document.querySelector('header .offline').textContent='经典旅程 · 四段冒险';
 const screen=document.querySelector('.screen-top');screen.children[0].textContent=r.tag;screen.children[1].textContent=n===14?'MARIO / ESCAPE':'WORLD 1-'+(n-10);
 if(n!==13){document.querySelector('.panel>.kicker').textContent='ONE JOURNEY. FOUR CHAPTERS.';document.querySelector('.panel>h2').textContent=r.title;const intro=document.querySelector('.panel>p.intro:first-of-type');if(intro)intro.textContent=r.intro;}
 $('charactersButton').textContent='选择关卡 / 角色';$('stageCharacters').textContent='选关 C / Select';
 if(n!==13){$('t21BindingButton').hidden=n!==14;if($('t15HudHits'))$('t15HudHits').hidden=true;}
 else $('t21BindingButton').hidden=false;
 c23Help.hidden=n===13;c23Filter();c23UpdateTabs();
 if(c23Menu){$('overlayLabel').textContent='WORLD 1 — CHAPTER '+(n-10);$('overlayTitle').textContent=n===14?'熔城逃脱':r.name;$('overlayText').textContent=r.intro;$('mainAction').textContent='开始 1-'+(n-10)+' →';$('overlayHint').textContent='← → / LB RB 选关 · ↑ ↓ 选角色 · A / ENTER 开始';$('overlay').classList.add('choosing');$('heroPicker').hidden=false;$('overlayCharacters').hidden=true;c23Next.hidden=true;}
 if(n===14){c23Set('heroHelp','助跑、转身惯性和长短跳沿用原来马里奥；没有二段跳、冲刺或自动奔跑。');c23Set('moveLabel','左右移动');c23Set('jumpLabel','短按低跳 / 按住高跳');c23Set('actionLabel','助跑 / 火焰花发射');c23Set('downLabel','大马里奥下蹲');$('ninjaTouch').hidden=true;const run=document.querySelector('.touchkey.run');run.hidden=false;run.textContent='加速 / 火球';document.querySelector('.touchkey.jump').textContent='跳跃';
 $('c23KeysText').innerHTML='<p>方向键 / A D：移动。空格 / K / Z：跳跃。Shift / J / X：助跑与火球。↓ / S：大马里奥下蹲。</p><p>手柄左摇杆 / 十字键移动；A 跳跃，B / X / RT 助跑。Start 暂停，Select 选关。右摇杆和鼠标移动不会干扰方向。</p><p>P / Esc 暂停；R 从本段重试；C 选关；F 全屏。按键设置与 1-3 共用跳跃、行动和暂停的配置。</p><p>低顶先松开跳跃，火棒前留出刹车距离。身后的熔潮持续推进，不会传送到你身边；抵达吊桥尽头触碰斧头。</p>';
 }else if(n!==13){$('c23KeysText').innerHTML='<p>'+heroHelp[hero]+'</p><p>P / Start 暂停；C / Select 选择关卡。键位沿用原先关卡。</p>';}
 const tags=document.querySelector('.tagline');if(tags)tags.innerHTML='<span>'+r.name+' · WORLD 1-'+(n-10)+'</span><span>CLASSIC CROSSOVER</span>';
}
function c23Preview(){if(!c23Is())return;const saveMode=mode;c23={ticks:0,runFrames:0,retries:0,cp:0,wave:-240,practice:!!$('c23Practice').checked,chaseStarted:false,ending:0,bridgeRemoved:0,bowser:{x:2186,y:128,alive:true,age:0},lift:{x:2216,y:96,w:32,h:8,dx:0},fire:[],dust:[],shake:0};tiles=c23Map();room='surface';pipes=[];enemies=[];items=[];shots=[];particles=[];floaters=[];looseCoins=[];player=createPlayer(30,98);player.grounded=true;camera=0;score=coins=frame=0;timeLeft=300;mode=saveMode;}
function c23Choose(n){if(!C23_ROOMS[n]||c23SelectionLock)return;c23SelectionLock=true;try{if(c23Bindings?.isOpen())c23Bindings.close();c23Clear();resetGameAudio();c23Campaign.stage=n;c23Menu=true;mode='menu';c23Legacy.chars();mode='menu';c23Legacy.select(c23Campaign.chosen[n]);hero=c23Campaign.chosen[n];c23Next.hidden=true;
 if(n===14)c23Preview();else if(n===11){surface=buildLevel();underground=buildUnder();loadRoom('surface');player=createPlayer();}else if(n===12){r12=null;}
 c23ReadyMenu=true;showOverlay('',C23_ROOMS[n].name,C23_ROOMS[n].intro,'开始冒险 →');c23Chrome();c23Event('chapter',{stage:n,hero});draw();
 }finally{c23SelectionLock=false;}}
showCharacters=function(){if(c23SelectionLock)return c23Legacy.chars();return c23Choose(c23Campaign.stage);};
selectHero=function(id){if(c23SelectionLock)return c23Legacy.select(id);if(mode!=='menu')return;const found=c23Is()&&id==='mario'?14:Object.entries(C23_ROOMS).find(([n,r])=>Number(n)!==14&&r.heroes.includes(id))?.[0];
 if(found&&Number(found)!==c23Campaign.stage){c23Campaign.chosen[found]=id;return c23Choose(Number(found));}
 c23Campaign.chosen[c23Campaign.stage]=id;c23Legacy.select(id);c23Chrome();
};
startGame=function(){c23Menu=false;c23Clear();c23Next.hidden=true;if(c23Is())return c23Start();if(c23Campaign.stage===13)c23Bindings?.consumePad(c23SafePad());const out=c23Legacy.start();c23Chrome();c23Event('legacy-start',{stage:c23Campaign.stage,hero});return out;};
handlePrimary=function(){if(c23Is()){if(c23Bindings?.isOpen())return;if(mode==='paused')return togglePause();if(mode==='dying'||mode==='respawn')return c23Retry();return c23Start();}if(mode==='menu')return startGame();return c23Legacy.primary();};
togglePause=function(){if(!c23Is())return c23Legacy.pause();if(!c23||c23Menu)return;
 if(mode==='paused'){mode=c23.pausedFrom||'playing';hideOverlay();c23Clear();c23BlockJump=true;canvas.focus({preventScroll:true});audioInit();}
 else if(mode==='playing'||mode==='dying'){c23.pausedFrom=mode;mode='paused';c23Clear();stopEffects();stopMusic(true);oneShot('pause',{ui:true});showOverlay('WORLD 1-4','已暂停','继续后回到刚才的位置。<br>熔潮、火棒和库巴也一同暂停。','继续冒险 →','START / P / A 继续 · C / SELECT 选关');$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');$('overlayCharacters').hidden=false;}
 c23Event('pause',{mode});c23UI();audioSync();
};
desiredMusic=function(){if(c23Is())return mode==='playing'&&!c23?.ending?(bank.has('castle23')?'castle23':null):null;return c23Legacy.desired();};
audioSync=function(){if(!c23Is())return c23Legacy.sync();if(!audio)return;if(mode==='paused'||document.hidden||!soundOn){stopMusic(true);return;}const key=desiredMusic();if(key)playMusic(key);else stopMusic(false);};
updateUi=function(...args){if(c23Is())return c23UI();const out=c23Legacy.ui(...args);return out;};
updateHeroUI=function(...args){if(c23Is())return c23UI();return c23Legacy.heroUI(...args);};
function c23UI(){if(!c23Is()||!c23)return;const s=c23,percent=mode==='win'?100:Math.floor(clamp((player.x-30)/2386*100,0,100));
 c23Set('stateLabel',c23Menu?'准备出发':mode==='paused'?'已暂停':mode==='dying'?'本段重试':mode==='win'?'1-4 完成':s.ending?'触斧 · 断桥':s.practice?'路线练习':s.chaseStarted?'熔潮来袭':'城堡入口');
 c23Set('livesLabel','重试 '+s.retries);$('progressFill').style.width=percent+'%';c23Set('distanceLabel','WORLD 1-4 · '+percent+'%');c23Set('pauseButton',mode==='paused'?'继续':'暂停');c23Set('soundButton',soundOn?'声音：开':'声音：关');
 c23Set('heroStatus','马里奥 · '+(player.power===2?'火焰':player.power?'超级':'小马里奥')+' · '+(s.runFrames/60).toFixed(1)+' 秒');
 c23Set('gamepadStatus',c23PadError?'此环境未开放手柄读取；键盘与触摸仍可用。':c23Device+(c23PadPresent?' · 手柄已连接':''));
 c23Set('relayMessage',c23Menu?'原路不变，熔潮在身后逼近。':mode==='win'?'蘑菇人获救。下一段冒险继续。':s.ending?'斧头已触发，吊桥正在断开。':s.practice?'已关闭身后熔潮；原地形与障碍保留。':s.chaseStarted?'熔潮距离 '+Math.max(0,Math.ceil((player.x-s.wave)/16))+' 格 · '+['入口台阶','火棒长廊','暗砖前厅','库巴吊桥'][s.cp]:'向前进入城堡，熔潮即将追来。');
}
function c23SafePad(){try{const p=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected!==false)||null;c23PadError=false;return p;}catch{c23PadError=true;return null;}}
function c23Config(){try{return c23Bindings?.config()||{};}catch{return{};}}
function c23Input(){const pad=c23SafePad(),buttons=pad?.buttons.map(b=>b?.pressed||b?.value>.5)||[],axes=pad?.axes||[],conf=c23Config(),bind=conf.actions||{},dz=clamp(conf.deadzone||.28,.16,.4);
 if(c23PadPresent&&!pad&&c23Device==='手柄'&&mode==='playing'&&!c23Menu)togglePause();c23PadPresent=!!pad;
 const b=(i)=>!!buttons[i],edge=i=>b(i)&&!c23PadPrev[i],act=(a,defaults)=> (bind[a]?.pad||defaults).some(b);
 const pressed=(a,defaults)=> (bind[a]?.keys||defaults).some(k=>keys.has(k));
 const input={left:axes[0]<-dz||act('left',[14])||pressed('left',['ArrowLeft','KeyA']),right:axes[0]>dz||act('right',[15])||pressed('right',['ArrowRight','KeyD']),down:axes[1]>dz||act('down',[13])||pressed('down',['ArrowDown','KeyS']),jump:act('jump',[0])||pressed('jump',['Space','KeyK','KeyZ']),run:act('attack',[1,2,7])||pressed('attack',['ShiftLeft','ShiftRight','KeyJ','KeyX'])};
 for(const a of touch.values())if(a in input)input[a]=true;
 const rawJump=!!input.jump;if(c23BlockJump){input.jump=false;if(!rawJump)c23BlockJump=false;}else input.jump ||= c23PendingJump;c23PendingJump=false;
 if(pad&&(Math.abs(axes[0]||0)>dz||buttons.some((v,i)=>v&&!c23PadPrev[i])))c23Device='手柄';
 if(!virtualInput){if(c23Menu){const dir=(axes[0]>.55||b(15)?1:0)-(axes[0]<-.55||b(14)?1:0),vert=(axes[1]>.55||b(13)?1:0)-(axes[1]<-.55||b(12)?1:0);
   if(edge(4)||dir&&dir!==c23Input.dir)c23Choose(11+(c23Campaign.stage-11+(edge(4)?-1:dir)+4)%4);else if(edge(5))c23Choose(11+(c23Campaign.stage-10)%4);
   if(vert&&vert!==c23Input.vert){const hs=C23_ROOMS[c23Campaign.stage].heroes;selectHero(hs[(hs.indexOf(hero)+vert+hs.length)%hs.length]);}
   if(edge(0)||edge(9)){padStartPrevious=b(9);padConfirmPrevious=b(0);padMenuPrevious=b(8);padActionConsumed=b(0);if(c23Campaign.stage===13)c23Bindings?.consumePad(pad);handlePrimary();}c23Input.dir=dir;c23Input.vert=vert;
  }else if(c23Is()){
   if(edge(8))showCharacters();else if((bind.pause?.pad||[9]).some(i=>edge(i)))togglePause();else if(edge(0)&&['paused','respawn','win'].includes(mode)||edge(0)&&mode==='dying'&&c23.deathFrames>30)handlePrimary();
  }}
 c23PadPrev=buttons;return virtualInput?{left:false,right:false,down:false,jump:false,run:false,...virtualInput}:input;
}
const c23DefaultCodes=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyS','KeyW','Space','KeyK','KeyZ','KeyJ','KeyX','ShiftLeft','ShiftRight'];
t17Early.handle=function(e){if(c23Bindings?.isOpen())return c23Legacy.early?.(e)||false;
 if(!c23Is()&&!c23Menu)return c23Legacy.early?.(e)||false;
 if(['blur','focus'].includes(e.type)&&e.target!==window)return false;
 if(e.type==='blur'||e.type==='visibilitychange'&&document.hidden){c23Clear();if(mode==='playing')togglePause();return false;}
 if(c23Is()&&e.type.startsWith('pointer')){
  const button=e.target?.closest?.('.touchkey[data-action]');
  if(e.type==='pointerdown'&&button){const action=button.dataset.action;if(!['left','right','down','jump','run'].includes(action))return false;
   if(c23Menu)handlePrimary();touch.set(e.pointerId,action);button.classList.add('pressed');c23Device='触摸';audioInit();try{button.setPointerCapture(e.pointerId);}catch{}
   if(action==='jump')c23PendingJump=true;return true;}
  if((e.type==='pointerup'||e.type==='pointercancel')&&touch.has(e.pointerId)){touch.delete(e.pointerId);document.querySelectorAll('.touchkey').forEach(b=>b.classList.toggle('pressed',[...touch.values()].includes(b.dataset.action)));return true;}
 }
 if(e.type!=='keydown'&&e.type!=='keyup')return false;
 if(e.ctrlKey||e.metaKey||e.altKey||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return false;
 const cfg=c23Config().actions||{},mapped=Object.entries(cfg).filter(([a])=>['left','right','down','jump','attack','pause'].includes(a)).some(([,b])=>b.keys.includes(e.code));
 const allowed=mapped||c23DefaultCodes.includes(e.code)||['Enter','Escape','KeyP','KeyR','KeyC','KeyF','Digit1','Digit2','Digit3','Digit4'].includes(e.code);
 if(!allowed)return false;
 if(e.type==='keyup'){keys.delete(e.code);return true;}
 c23Device='键盘';audioInit();
 if(c23Menu){if(e.repeat)return true;let n=c23Campaign.stage;if(/^Digit[1-4]$/.test(e.code))c23Choose(10+Number(e.code.at(-1)));
  else if(['ArrowLeft','KeyA','ArrowRight','KeyD'].includes(e.code))c23Choose(11+(n-11+(['ArrowLeft','KeyA'].includes(e.code)?3:1))%4);
  else if(['ArrowUp','KeyW','ArrowDown','KeyS'].includes(e.code)){const hs=C23_ROOMS[n].heroes,dir=['ArrowUp','KeyW'].includes(e.code)?-1:1;selectHero(hs[(hs.indexOf(hero)+dir+hs.length)%hs.length]);}
  else if(['Enter','Space','KeyK','KeyZ'].includes(e.code)){handlePrimary();keys.add(e.code);c23BlockJump=true;}
  else if(e.code==='KeyF')fullscreen();return true;
 }
 if(!e.repeat){if(e.code==='KeyC'){showCharacters();return true;}if(e.code==='KeyF'){fullscreen();return true;}if((cfg.pause?.keys||['KeyP','Escape']).includes(e.code)){togglePause();return true;}if(e.code==='KeyR'){c23Retry();return true;}
 if(['Enter','Space','KeyK','KeyZ'].includes(e.code)&&['paused','respawn','win'].includes(mode)||['Enter','Space'].includes(e.code)&&mode==='dying'&&c23.deathFrames>30){handlePrimary();keys.add(e.code);c23BlockJump=true;return true;}
 if((cfg.jump?.keys||['Space','KeyK','KeyZ']).includes(e.code)&&!keys.has(e.code))c23PendingJump=true;
 }
 keys.add(e.code);return true;
};
$('restartButton').addEventListener('click',e=>{if(c23Is()){e.stopImmediatePropagation();c23Start();}},true);
fixedUpdate=function(){if(c23Bindings?.isOpen()&&c23Is()){c23Legacy.poll();return;}if(c23Menu){c23Input();return;}if(c23Is()){c23Step(c23Input());return;}return c23Legacy.fixed();};
draw=function(){if(c23Is())c23Draw();else c23Legacy.draw();if(c23Menu)c23Chrome();
 if(mode==='win'&&!c23Menu&&!c23Is()){if(!c23Campaign.completed.has(c23Campaign.stage)){c23Campaign.completed.add(c23Campaign.stage);save.set('chapters',JSON.stringify([...c23Campaign.completed]));c23UpdateTabs();}c23Next.hidden=false;c23Next.textContent='继续 1-'+(c23Campaign.stage-9)+' →';}else if(mode!=='win')c23Next.hidden=true;
};
// Safe read-only metadata in release; state mutation and fixed-frame testing are opt-in.
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R23'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 window.__castle23={choose:c23Choose,start:c23Start,retry:c23Retry,read:c23Input,update:c23Step,draw:c23Draw,map:()=>[...tiles.values()],rects:C23_RECTS,bars:C23_BARS,
 mode:()=>mode,snapshot:()=>({mode,hero,stage:c23Campaign.stage,menu:c23Menu,frame,score,coins,timeLeft,camera,freeze,player:{...player},castle:structuredClone(c23),key:[...keys]}),
 advance:(n=1)=>{for(let i=0;i<n;i++)fixedUpdate();draw();},
 save:()=>({c:structuredClone(c23),mode,frame,score,coins,timeLeft,camera,freeze,player:{...player},tiles:[...tiles.values()].map(t=>({...t})),items:structuredClone(items),shots:structuredClone(shots),particles:structuredClone(particles),floaters:structuredClone(floaters),jumpHeldPrev,runHeldPrev,jumpBuffer,timerTicks}),
 restore:o=>{c23=structuredClone(o.c);mode=o.mode;frame=o.frame;score=o.score;coins=o.coins;timeLeft=o.timeLeft;camera=o.camera;freeze=o.freeze;player={...o.player};tiles=new Map(o.tiles.map(t=>[tileKey(t.x,t.y),{...t}]));items=structuredClone(o.items);shots=structuredClone(o.shots);particles=structuredClone(o.particles);floaters=structuredClone(o.floaters);jumpHeldPrev=o.jumpHeldPrev;runHeldPrev=o.runHeldPrev;jumpBuffer=o.jumpBuffer;timerTicks=o.timerTicks;},
 fixture:(p={})=>{Object.assign(player,p);camera=clamp(player.x-110,0,2304);},events:()=>c23Ev,
 stateRef:()=>c23,bindings:()=>c23Bindings?.config(),pause:togglePause};
}
