/* Ori / Blind Forest DE-inspired native chapter. The terrain, bridge and castle
 * map belong to the existing campaign. This is a browser reimplementation, NOT
 * extracted Moon Studios animation, shader code, audio or frame-perfect physics.
 * All gameplay additions are gated to chapter 14. No extra game loop or iframe. */
const O24_MAX_HP=6,O24_MAX_ENERGY=4,O24_RENDER_SCALE=3;
const O24_LANTERNS=[{id:0,x:223,y:137},{id:1,x:445,y:112},{id:2,x:538,y:114},{id:3,x:710,y:122},{id:4,x:949,y:124},{id:5,x:1130,y:122},{id:6,x:1330,y:113},{id:7,x:1516,y:116},{id:8,x:1748,y:151},{id:9,x:2058,y:119},{id:10,x:2180,y:72}];
const O24_NAMES={left:'向左',right:'向右',up:'向上 / 弹射方向',down:'向下 / 空中践踏',jump:'跳跃 / 二段跳 / 蹬墙',attack:'精灵之火 / 蓄力爆破',dash:'冲刺',bash:'Bash 借力弹射',glide:'羽毛滑翔',climb:'抓墙攀爬',light:'光之爆破（抛投）'};
const O24_DEFAULT={left:{keys:['ArrowLeft','KeyA'],pad:[14]},right:{keys:['ArrowRight','KeyD'],pad:[15]},up:{keys:['ArrowUp','KeyW'],pad:[12]},down:{keys:['ArrowDown','KeyS'],pad:[13]},jump:{keys:['Space','KeyK','KeyZ'],pad:[0]},attack:{keys:['KeyJ','KeyX'],pad:[2,1]},dash:{keys:['ShiftLeft','ShiftRight'],pad:[5]},bash:{keys:['KeyE'],pad:[3]},glide:{keys:['KeyQ'],pad:[7]},climb:{keys:['KeyW'],pad:[6]},light:{keys:['KeyL'],pad:[4]}};
let o24Binds=structuredClone(O24_DEFAULT),o24Listen=null,o24SettingPrev=[],o24Mouse={x:150,y:120,valid:false,attack:false,bash:false,lastX:null,lastY:null},o24MenuPulse=0;
try{const b=JSON.parse(save.get('ori-controls','null'));if(b&&Object.keys(O24_DEFAULT).every(a=>b[a]&&Array.isArray(b[a].keys)&&Array.isArray(b[a].pad)))o24Binds=b;}catch{}
heroNames.ori='奥日';heroHelp.ori='二段跳、蹬墙、冲刺、借力弹射与羽毛滑翔。和Sein一起穿过熔城，找到纳鲁。';
C23_ROOMS[14]={name:'奥日 · 熔城',tag:'04 / ORI × CASTLE',heroes:['ori'],title:'借一束光，穿过熔城。',intro:'精灵之光踏入熟悉的 1-4。借力火球、穿过火棒，让身后的熔潮止步于断桥；纳鲁在前方等你。'};
c23Campaign.chosen[14]='ori';
const o24Card=document.createElement('button');o24Card.type='button';o24Card.dataset.hero='ori';o24Card.setAttribute('aria-pressed','false');o24Card.innerHTML='<canvas class="o24-portrait" width="128" height="160" aria-hidden="true"></canvas><strong>奥日</strong><small>1-4 · 精灵逃脱</small>';
o24Card.onclick=()=>selectHero('ori');$('heroPicker').append(o24Card);
const o24Btn=document.createElement('button');o24Btn.type='button';o24Btn.id='o24BindingsButton';o24Btn.textContent='奥日按键设置';$('t21BindingButton').after(o24Btn);
const o24Box=document.createElement('dialog');o24Box.id='o24Bindings';o24Box.innerHTML='<header><h2>奥日 · 操作设置</h2><button id="o24BindDone">完成</button></header><p>仅用于 1-4，不会覆盖其他角色。点击按键后输入新键；Bash 按住瞄准、松开弹射。鼠标左键精灵之火，右键 Bash。</p><div class="o24-bind-scroll"><table><thead><tr><th>动作</th><th>键盘</th><th>手柄</th></tr></thead><tbody id="o24Rows"></tbody></table></div><p id="o24BindStatus" role="status">左摇杆移动 / Bash 方向；Start 暂停，Select 选关。</p><footer><button id="o24BindReset">恢复默认</button></footer>';
document.body.append(o24Box);
function o24KeyLabel(k){return({Space:'空格',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',ShiftLeft:'左 Shift',ShiftRight:'右 Shift'}[k]||k.replace(/^Key|^Digit/,''));}
function o24Labels(){const names={0:'A',1:'B',2:'X',3:'Y',4:'LB',5:'RB',6:'LT',7:'RT',12:'↑',13:'↓',14:'←',15:'→'};
 $('o24Rows').innerHTML=Object.entries(O24_NAMES).map(([a,n])=>'<tr><td>'+n+'</td>'+['keys','pad'].map(s=>'<td><button data-oa="'+a+'" data-os="'+s+'">'+o24Binds[a][s].map(k=>s==='keys'?o24KeyLabel(k):(names[k]||'按钮 '+k)).join(' / ')+'</button></td>').join('')+'</tr>').join('');
 for(const b of $('o24Rows').querySelectorAll('button'))b.onclick=()=>{o24Listen={action:b.dataset.oa,source:b.dataset.os};$('o24BindStatus').textContent='请按下“'+O24_NAMES[o24Listen.action]+'”的新'+(o24Listen.source==='keys'?'按键':'手柄按钮')+'；Esc 取消。';};}
function o24Bind(a,s,k){if(!O24_NAMES[a])return false;const reserved=s==='keys'?['KeyP','Escape','KeyR','KeyC','KeyF','Tab','Enter','MetaLeft','MetaRight','AltLeft','AltRight']: [8,9];if(reserved.includes(k)){$('o24BindStatus').textContent='此键保留给菜单或暂停，请换一个。';return false;}
 const conflict=Object.entries(o24Binds).find(([id,v])=>id!==a&&v[s].includes(k)&&!([a,id].every(v=>['up','climb'].includes(v))));if(conflict){$('o24BindStatus').textContent='已被“'+O24_NAMES[conflict[0]]+'”使用。';return false;}
 o24Binds[a][s]=[k];save.set('ori-controls',JSON.stringify(o24Binds));o24Listen=null;o24Labels();$('o24BindStatus').textContent='已保存此浏览器的 1-4 键位。';return true;}
let o24ResumeSettings=false;
o24Btn.onclick=()=>{o24ResumeSettings=mode==='playing';if(o24ResumeSettings)togglePause();o24Labels();o24Listen=null;o24SettingPrev=[];o24Box.showModal();c23Clear();};
function o24CloseSettings(){o24Listen=null;o24Box.close();c23Clear();if(o24ResumeSettings&&mode==='paused')togglePause();o24ResumeSettings=false;}
$('o24BindDone').onclick=o24CloseSettings;o24Box.addEventListener('cancel',e=>{e.preventDefault();o24CloseSettings();});$('o24BindReset').onclick=()=>{o24Binds=structuredClone(O24_DEFAULT);save.set('ori-controls',JSON.stringify(o24Binds));o24Listen=null;o24Labels();};
function o24New(){return{hp:O24_MAX_HP,energy:O24_MAX_ENERGY,jumps:0,dashReady:true,dash:0,dashCd:0,dashDir:1,wall:0,wallLock:0,coyote:4,buffer:0,prev:{},dashTrail:[],fx:[],bolts:[],orbs:[],pickups:[],bash:null,bashLock:false,boost:0,charge:0,attackAge:0,flameCd:0,lightCd:0,lightAim:null,lightHold:0,stomp:0,gliding:false,clinging:false,land:0,pose:'idle',hurt:0,warning:0,pulse:0,rescue:0,spent:0,bashed:0,airDashes:0,doubleJumps:0,wallJumps:0,flames:0,glides:0,linkAge:0,seen:new Set(),wind:0};}
const o24ResetBase=c23ResetScene;c23ResetScene=function(cp=0,retry=false){hero=c23Campaign.chosen[14]||'ori';o24ResetBase(cp,retry);c23.ori=o24New();player.power=0;player.h=14;player.w=9;player.y=C23_CPS[cp].feet-14;player.vx=0;player.vy=0;player.grounded=true;c23.bowser.hp=18;c23.bowser.maxHp=18;c23.saved.power=0;c23.saved.oriHealth=O24_MAX_HP;freeze=0;canvas.width=256*O24_RENDER_SCALE;canvas.height=240*O24_RENDER_SCALE;c23Clear();c23Chrome();o24Portrait();};
c23Start=function(){hero=c23Campaign.chosen[14]||'ori';c23ResetScene(0,false);};
const o24PreviewBase=c23Preview;c23Preview=function(){o24PreviewBase();if(!c23Is())return;hero=c23Campaign.chosen[14]||'ori';c23.ori=o24New();c23.ori.hp=O24_MAX_HP;c23.bowser.hp=18;c23.bowser.maxHp=18;player.w=9;canvas.width=768;canvas.height=720;o24Portrait();};
const o24ClearBase=c23Clear;c23Clear=function(){o24ClearBase();o24Mouse.attack=false;o24Mouse.bash=false;if(c23?.ori){c23.ori.bash=null;c23.ori.prev={};c23.ori.bashLock=true;c23.ori.charge=0;c23.ori.attackAge=0;c23.ori.lightAim=null;c23.ori.lightHold=0;c23.ori.dash=0;} };
const o24ChooseBase=c23Choose;c23Choose=function(n){if(o24Box.open)o24CloseSettings();if(n!==14){canvas.width=256;canvas.height=240;ctx.setTransform(1,0,0,1,0,0);o24Btn.hidden=true;}o24Mouse.valid=false;return o24ChooseBase(n);};
const o24ChromeBase=c23Chrome;c23Chrome=function(){o24ChromeBase();o24Btn.hidden=!c23Is();document.body.classList.toggle('o24-ori',c23Is());if(!c23Is())return;$('t21BindingButton').hidden=true;
 c23Set('heroHelp',heroHelp.ori);c23Set('heroStatus','奥日 · 精灵之光');c23Set('moveLabel','移动 / 借力弹射方向');c23Set('jumpLabel','跳跃 / 二段跳 / 蹬墙');c23Set('actionLabel','精灵之火');c23Set('downLabel','空中践踏');document.querySelector('.screen-top').children[1].textContent='ORI / EMBER ESCAPE';
 document.querySelector('[data-chapter="14"] span').textContent='奥日 · 熔城';
 $('c23KeysText').innerHTML='<p><b>键鼠</b>：A D / ← → 移动；空格 / K / Z 跳跃；空中再按二段跳，贴墙再按蹬墙。Shift 冲刺；J / 左键精灵之火，按住后松开为蓄力爆破。</p><p>E / 右键：靠近金色灯笼或火球，按住 Bash，用鼠标或方向键选方向，松开弹射。Q 羽毛滑翔；W 贴墙攀爬；空中 S 践踏；L 轻按抛出光之爆破；按住可调节抛物线，松开投出。</p><p><b>标准手柄</b>：左摇杆移动 / Bash 方向；A 跳跃；X / B 精灵之火；RB 冲刺；Y 按住 Bash；RT 滑翔；LT 抓墙；LB 按住瞄准、松开光之爆破；向下践踏。</p><p>冲刺不提供无敌，也不能穿墙。空中冲刺每次落地或 Bash 后恢复一次。Bash 瞄准时世界暂停；被弹开的火球朝反方向飞行。精灵之火不耗能，蓄力爆破与抛投各消耗一格。</p><p>P / Start 暂停；R 重试本段；C / Select 选关。四处精灵休息点恢复生命与能量。键位只影响 1-4，操作设置在外部。</p>';
 if(c23Menu){c23Set('overlayLabel','ORI × SUPER MARIO');c23Set('overlayTitle','光与熔城');c23Set('overlayText',C23_ROOMS[14].intro);c23Set('mainAction','开始 1-4 →');c23Set('overlayHint','A / ENTER 开始 · LB RB 选关');}
 const run=document.querySelector('.touchkey.run');if(run){run.textContent='精灵之火';run.dataset.action='run';}document.querySelector('.touchkey.jump').textContent='跳跃';o24Touch.hidden=false;
 c23Set('relayMessage',c23Menu?'纳鲁在熔城的另一端。灯笼与火球，都是你的借力点。':$('relayMessage').textContent);o24Portrait();};
const o24Touch=document.createElement('div');o24Touch.id='o24Touch';o24Touch.hidden=true;o24Touch.innerHTML=['dash:冲刺','bash:弹射','glide:滑翔','climb:攀爬','light:光弹'].map(a=>{const [k,l]=a.split(':');return'<button type="button" class="touchkey" data-action="'+k+'" aria-label="'+l+'">'+l+'</button>';}).join('');document.querySelector('.screen-shell').append(o24Touch);
function o24UI(){if(!c23Is()||!c23?.ori)return;const o=c23.ori,s=c23,percent=mode==='win'?100:Math.floor(clamp((player.x-30)/2386*100,0,100));
 c23Set('stateLabel',c23Menu?'准备出发':mode==='paused'?'已暂停':mode==='dying'?'精灵重生':mode==='win'?'纳鲁获救':s.ending?'断桥 · 重逢':o.bash?'借力弹射':s.practice?'路线练习':s.chaseStarted?'熔潮来袭':'城堡入口');
 c23Set('livesLabel','重试 '+s.retries);$('progressFill').style.width=percent+'%';c23Set('distanceLabel','WORLD 1-4 · '+percent+'%');c23Set('pauseButton',mode==='paused'?'继续':'暂停');c23Set('soundButton',soundOn?'声音：开':'声音：关');
 c23Set('heroStatus','奥日 · 生命 '+o.hp+'/'+O24_MAX_HP+' · 能量 '+o.energy+'/'+O24_MAX_ENERGY);c23Set('gamepadStatus',c23PadError?'手柄读取未开放；可用键盘或触摸。':c23Device+(c23PadPresent?' · 手柄已连接':''));
 c23Set('relayMessage',c23Menu?'纳鲁在熔城的另一端。灯笼与火球，都是你的借力点。':mode==='win'?'穿越熔城，与纳鲁重逢。':s.ending?'吊桥正在断开，前方的精灵之光已经亮起。':o.bash?'选择弹射方向，然后松开 Bash。':s.practice?'路线练习：熔潮关闭，机关与能力保留。':s.chaseStarted?'熔潮距离 '+Math.max(0,Math.ceil((player.x-s.wave)/16))+' 格 · '+['入口台阶','火棒长廊','暗砖前厅','库巴吊桥'][s.cp]:'向前出发，Sein与你同行。');
}
c23UI=o24UI;
// Small original synthesised cues share the campaign mixer. No unrelated game's
// jump / death recording is labelled as an original Ori recording.
function o24Sound(kind){if(!soundOn||!audio||!effectsBus)return;try{const spec={jump:[660,1100,.13],double:[850,1650,.2],dash:[260,950,.12],bash:[420,1750,.23],flame:[980,600,.12],light:[520,1250,.25],heal:[540,880,.4],hurt:[180,80,.2],death:[480,100,.65],link:[430,1300,.6]}[kind]||[600,1100,.18];const [a,b,t]=spec;
 const osc=audio.createOscillator(),gain=audio.createGain();osc.type=kind==='hurt'?'triangle':'sine';osc.frequency.setValueAtTime(a,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(b,audio.currentTime+t);gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.045,audio.currentTime+.008);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+t);osc.connect(gain);gain.connect(effectsBus);osc.start();osc.stop(audio.currentTime+t+.015);}catch{}}
function o24FX(x,y,color='#b9faff',count=10,speed=1.4){const o=c23.ori;for(let i=0;i<count;i++){const a=i*2.399963+frame*.31,q=.25+(i%5)/5;o.fx.push({x,y,vx:Math.cos(a)*speed*q,vy:Math.sin(a)*speed*q-.25,life:20+i%13,max:33,color,r:.35+(i%3)*.27});}if(o.fx.length>220)o.fx.splice(0,o.fx.length-220);}
function o24Energy(cost=1){const o=c23.ori;if(o.energy<cost){o.warning=55;return false;}o.energy-=cost;o.spent+=cost;return true;}
const o24BumpBase=bumpTile;bumpTile=function(t){if(!c23Is()||!c23?.ori)return o24BumpBase(t);if(t.type!=='question')return C23_CORE.bumpTile(t);if(t.used){o24Sound('bump');return;}t.hidden=false;t.bump=12;t.used=true;const energy=t.content==='power';t.content=null;c23.ori.pickups.push({x:t.x*16+4,y:t.y*16-8,vx:.3,vy:-2,w:8,h:8,type:energy?'cell':'light',life:0});o24FX(t.x*16+8,t.y*16,energy?'#69e8ff':'#ffe3a0');};
function o24Move(p,dx,dy){const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/2));let landed=false;for(let i=0;i<n;i++){const oldX=p.x;moveBody(p,dx/n,dy/n,true);landed ||= p.grounded;if(dx&&Math.abs(p.x-oldX)<Math.abs(dx/n)-.01)dx=0;if(p.vy===0&&dy)dy=0;}p.grounded ||= landed;}
function o24LineClear(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3));for(let i=1;i<n;i++){const q=i/n;if(solids({x:a.x+(b.x-a.x)*q-1,y:a.y+(b.y-a.y)*q-1,w:2,h:2}).length)return false;}return true;}
function o24NearTargets(){if(!c23?.ori)return[];const center={x:player.x+4.5,y:player.y+6};return[...O24_LANTERNS.map(n=>({...n,type:'lantern'})),...c23.fire.filter(f=>!f.reflected).map(f=>({x:f.x+12,y:f.y+4,type:'fire',ref:f})),...c23.ori.orbs.map(f=>({x:f.x,y:f.y,type:'orb',ref:f}))].map(n=>({...n,d:Math.hypot(n.x-center.x,n.y-center.y)})).filter(n=>n.d<42&&(c23.practice||n.x>c23.wave+6)&&o24LineClear(center,n)).sort((a,b)=>a.d-b.d);}
function o24Aim(v,target){let x=0,y=0;if(c23Device!=='手柄'&&o24Mouse.valid){x=o24Mouse.x+camera-target.x;y=o24Mouse.y-target.y;}else{x=v.ax??((v.right?1:0)-(v.left?1:0));y=v.ay??((v.down?1:0)-(v.up?1:0));}
 const d=Math.hypot(x,y);return d>.19?{x:x/d,y:y/d}:{x:player.facing*.82,y:-.57};}
function o24BashStart(v){const o=c23.ori,target=o24NearTargets()[0];if(!target)return false;o.bash={...target,aim:o24Aim(v,target),age:0};o.bashLock=true;player.vx=0;player.vy=0;o.dash=0;o.stomp=0;o.boost=0;o.lightAim=null;o.lightHold=0;o24Sound('bash');c23Event('ori-bash-aim',{type:target.type,x:target.x});return true;}
function o24BashRelease(){const o=c23.ori,b=o.bash;if(!b)return;const a=b.aim;{const desired={x:b.x-4.5+a.x*10,y:b.y-7+a.y*10,w:9,h:14};if(!solids(desired).length){player.x=desired.x;player.y=desired.y;}}
 player.vx=a.x*6.9;player.vy=a.y*6.9;player.facing=a.x<0?-1:1;player.grounded=false;o.boost=12;o.jumps=1;o.dashReady=true;o.dashCd=0;o.bashed++;o.pose='bash';
 if(b.ref){const f=b.ref;f.vx=-a.x*5.6;f.vy=-a.y*5.6;f.reflected=true;f.ty=undefined;f.age=0;f.oriBashed=true;}
 o24FX(b.x,b.y,'#fff0b0',22,3.3);o24FX(player.x+4,player.y+7,'#a2f5ff',16,2);o.bash=null;c23Event('ori-bash-release',{x:player.x,dx:a.x,dy:a.y,target:b.type});o24Sound('bash');}
function o24Flame(){const o=c23.ori,b=c23.bowser;if(!b.alive||Math.hypot(b.x-player.x,b.y-player.y)>160)return;o.bolts.push({x:player.x+4-player.facing*7,y:player.y-4,vx:player.facing*2,vy:0,life:90,tail:[]});o.flames++;o24Sound('flame');}
function o24Blast(x,y,r,damage){o24FX(x,y,'#bcecff',32,3.7);c23.ori.pulse=16;const b=c23.bowser;if(b.alive&&Math.hypot(b.x+14-x,b.y+16-y)<r)o24BossDamage(damage);for(const f of c23.fire){if(Math.hypot(f.x-x,f.y-y)<r)f.destroy=true;}o24Sound('light');}
function o24BossDamage(n){const b=c23.bowser;if(!b.alive)return;b.hp-=n;c23.ori.hitBoss=10;if(b.hp<=0){b.alive=false;b.vy=-3;addScore(5000,b.x,b.y);o24FX(b.x+14,b.y+16,'#ffe0a0',25,3);c23Event('bowser-defeated',{method:'ori-spirit'});}}
function o24Throw(v,selected=null){const o=c23.ori;if(o.lightCd||!o24Energy())return;const origin={x:player.x+4+player.facing*8,y:player.y+4},a=selected||o24Aim(v,origin);let ax=a.x,ay=a.y;if(!selected&&(!o24Mouse.valid&&c23Device!=='手柄'||Math.abs(ay)<.15)){ax=player.facing*.8;ay=-.6;}o.orbs.push({x:origin.x,y:origin.y,vx:ax*2.6,vy:ay*3,age:0,life:160,reflected:false});o.lightCd=28;o24Sound('orbThrow');c23Event('ori-light-burst');}
function o24Player(v){const p=player,o=c23.ori,wasGround=p.grounded,dir=(v.right?1:0)-(v.left?1:0),jump=!!v.jump&&!o.prev.jump;
 if(p.invuln)p.invuln--;if(o.hurt)o.hurt--;if(o.land)o.land--;if(o.dashCd)o.dashCd--;if(o.lightCd)o.lightCd--;if(o.flameCd)o.flameCd--;if(o.wallLock)o.wallLock--;
 if(wasGround){o.coyote=5;o.jumps=0;o.dashReady=true;if(o.stomp){o24Blast(p.x+4,p.y+14,36,2,'stomp');o.stomp=0;o.land=8;}}else o.coyote=Math.max(0,o.coyote-1);
 o.wall=solids({x:p.x-.8,y:p.y+2,w:.8,h:p.h-3}).length?-1:solids({x:p.x+p.w,y:p.y+2,w:.8,h:p.h-3}).length?1:0;
 if(!v.bash)o.bashLock=false;if(v.bash&&!o.bashLock&&o24BashStart(v)){o.prev={...v};return;}
 if(jump)o.buffer=5;else if(o.buffer)o.buffer--;
 if(o.buffer&&o.wall&&!wasGround){p.vx=-o.wall*2.85;p.vy=-4.8;p.facing=-o.wall;o.wallLock=9;o.jumps=1;o.buffer=0;o.dash=0;o.stomp=0;o.wallJumps++;o24FX(p.x+4,p.y+9);o24Sound('jump');c23Event('ori-wall-jump');}
 else if(o.buffer&&(o.coyote||wasGround)){p.vy=-4.45;p.grounded=false;o.jumps=1;o.coyote=0;o.buffer=0;o.stomp=0;o.land=0;o24FX(p.x+4,p.y+14,'#b8f2ff',7,.9);o24Sound('jump');}
 else if(jump&&!wasGround&&o.jumps<2){p.vy=-4.1;o.jumps=2;o.dash=0;o.boost=0;o.stomp=0;o.doubleJumps++;o24FX(p.x+4,p.y+7,'#c8fcff',17,2.2);o24Sound('double');c23Event('ori-double-jump');}
 if(v.dash&&!o.prev.dash&&!o.dashCd&&(wasGround||o.dashReady)){o.dash=10;o.dashCd=24;o.dashDir=dir||p.facing;o.dashReady=false;o.stomp=0;o.boost=0;if(!wasGround)o.airDashes++;o24Sound('dash');o24FX(p.x+4,p.y+7,'#b4e9ff',10,1.3);c23Event('ori-dash',{air:!wasGround});}
 if(v.down&&!o.prev.down&&!wasGround&&!o.dash&&!o.boost){o.stomp=1;p.vx=0;p.vy=1;o24Sound('dash');}
 o.gliding=!!v.glide&&!p.grounded&&p.vy>0&&!o.dash&&!o.stomp&&!o.boost;o.clinging=!!o.wall&&!wasGround&&!!v.climb&&!o.dash&&!o.boost&&!o.wallLock;
 if(o.dash){p.vx=o.dashDir*6.25;p.vy=0;o.dash--;o.pose='dash';o.dashTrail.push({x:p.x,y:p.y,face:p.facing,life:13});}
 else if(o.boost){o.boost--;o.pose='bash';p.vy+=.08;if(dir)p.vx=approach(p.vx,dir*3.15,.075);o.dashTrail.push({x:p.x,y:p.y,face:p.facing,life:11});}
 else{if(!o.wallLock){if(dir)p.vx=approach(p.vx,dir*2.7,wasGround?.4:.23);else p.vx=approach(p.vx,0,wasGround?.43:.11);}if(dir&&!o.wallLock)p.facing=dir;
 if(o.stomp){p.vx=approach(p.vx,0,.5);p.vy=Math.min(7,p.vy+.75);o.pose='stomp';}
 else if(o.clinging){p.vy=v.up?-1.45:v.down?1.45:0;o.jumps=1;o.pose='wall';}
 else if(o.gliding){p.vy=Math.min(1.05,p.vy+.08);o.pose='glide';if(!o.prev.glide)o.glides++;}
 else {p.vy=Math.min(5,p.vy+(p.vy<0&&v.jump?.19:.42));if(o.wall&&dir===o.wall&&p.vy>1.2){p.vy=1.2;o.pose='wall';}else o.pose=wasGround?(Math.abs(p.vx)>.1?'run':'idle'):'jump';}}
 const priorY=p.y,velX=p.vx;const priorGround=p.grounded;o24Move(p,p.vx,p.vy);if(o.dash&&Math.abs(p.vx)<.1&&Math.abs(velX)>1){o.dash=0;o24FX(p.x+4,p.y+6,'#cdefff',6);}
 if(p.grounded&&!priorGround){o.land=5;o.jumps=0;o.dashReady=true;o.boost=0;if(o.stomp){o24Blast(p.x+4,p.y+14,36,2,'stomp');o.stomp=0;}o24FX(p.x+4,p.y+14,'#91cdcc',6,.6);}
 o28ConstrainPlayer(p);
 if(v.attack){o.attackAge++;if(o.attackAge===1||o.attackAge===9||o.attackAge===17)o24Flame();o.charge=Math.min(52,o.attackAge);}
 else{if(o.prev.attack&&o.charge>=34&&o24Energy())o24Blast(p.x+4,p.y+7,65,5,'chargeBlast');o.charge=0;o.attackAge=0;}
 if(v.light){o.lightHold++;const origin={x:p.x+4+p.facing*8,y:p.y+4};let a=o24Aim(v,origin);if(o.lightHold<8&&!o24Mouse.valid&&!(v.up||v.down))a={x:p.facing*.8,y:-.6};o.lightAim={x:origin.x,y:origin.y,ax:a.x,ay:a.y};}else if(o.prev.light){if(o.lightAim)o24Throw(v,{x:o.lightAim.ax,y:o.lightAim.ay});o.lightAim=null;o.lightHold=0;}o.prev={...v};
 if(o28IsVertical())o28Camera();else{const desired=clamp(p.x-104+(p.vx>0?8:0),0,2304);camera=clamp(approach(camera,desired,Math.max(2.7,Math.abs(p.vx)+.4)),0,2304);maxProgress=Math.max(maxProgress,p.x);}
}
c23Hurt=function(cause){const o=c23?.ori;if(!o||player.invuln||mode!=='playing'||c23.ending)return;o.hp--;o.hurt=16;player.invuln=70;o24FX(player.x+4,player.y+7,'#e4edff',12,1.8);o24Sound('hurt');c23Event('ori-hurt',{cause,hp:o.hp});if(o.hp<=0)c23Fail(cause);};
const o24FailBase=c23Fail;c23Fail=function(cause){if(c23?.ori){c23.ori.bash=null;c23.ori.dash=0;c23.ori.gliding=false;c23.ori.lightAim=null;}o24FailBase(cause);stopEffects();o24Sound('death');};
function o24Front(y){return c23.wave-4+Math.sin(y*.049+c23.ticks*.047)*3+Math.sin(y*.127-c23.ticks*.079)*1.2;}
c23Hazards=function(){const o=c23.ori;for(let j=0;j<C23_BARS.length;j++)for(const q of c23BarDots(C23_BARS[j],j))if(c23CircleHit(q.x,q.y,3.3))c23Hurt('旋转火棒');
 for(const pool of C23_LAVA)if(player.x+player.w>pool.x+1&&player.x<pool.x+pool.w-1&&player.y+player.h>pool.y+5)c23Fail('熔岩');
 for(const f of c23.fire){f.age++;if(f.reflected){f.x+=f.vx;f.y+=f.vy||0;const b=c23.bowser;if(b.alive&&overlap({x:f.x,y:f.y,w:24,h:8},b)){o24BossDamage(4);f.destroy=true;o24FX(f.x,f.y,'#ffe8ad',15,2);}}else{f.x+=f.vx;f.y=approach(f.y,f.ty,.38);if(overlap(player,{x:f.x+4,y:f.y+2,w:16,h:4}))c23Hurt('库巴火焰');}}
 c23.fire=c23.fire.filter(f=>!f.destroy&&f.age<440&&f.x>camera-70&&f.x<camera+400&&f.y>-40&&f.y<280);
};
c23ChaseTick=function(){const s=c23,o=s.ori;if(s.practice||s.ending)return;if(!s.chaseStarted&&((player.x>C23_CPS[s.cp].x+58)||s.ticks>240)){s.chaseStarted=true;s.wave=player.x-145;s.waveSpeed=1.6;s.chaseAge=0;c23Event('chase-start');}
 if(!s.chaseStarted)return;s.chaseAge++;const gap=player.x-s.wave,target=gap>135?7.05:gap>100?5.9:gap>65?3.35:1.8;s.waveSpeed=approach(s.waveSpeed,target,target>s.waveSpeed?.075:.16);s.wave+=s.waveSpeed;
 if(player.x+player.w-1<o24Front(player.y+player.h*.6))c23Fail('被熔潮追上');o.wind=clamp(1-gap/220,0,1);
 if(s.ticks%110===30){s.shake=$('c23Motion')?.checked?0:.45;o24FX(Math.min(player.x+120,2250),60,'#cf9b77',4,.5);}
};
function o24World(){const o=c23.ori;for(const t of tiles.values())if(t.bump>0)t.bump--;
 for(const b of o.bolts){b.life--;const target=c23.bowser;if(target.alive){const dx=target.x+14-b.x,dy=target.y+12-b.y,d=Math.hypot(dx,dy)||1;b.vx=approach(b.vx,dx/d*4.2,.6);b.vy=approach(b.vy,dy/d*4.2,.6);if(d<15){o24BossDamage(1);b.life=0;o24FX(b.x,b.y,'#adf5ff',7,1.1);}}b.tail.push({x:b.x,y:b.y});if(b.tail.length>7)b.tail.shift();b.x+=b.vx;b.y+=b.vy;if(solids({x:b.x-1,y:b.y-1,w:2,h:2}).length)b.life=0;}
 o.bolts=o.bolts.filter(b=>b.life>0);
 for(const b of o.orbs){b.age++;b.life--;b.x+=b.vx;b.y+=b.vy;b.vy+=.065;if(solids({x:b.x-2,y:b.y-2,w:4,h:4}).length){b.life=0;o24Blast(b.x,b.y,40,3);}if(b.life===0)o24FX(b.x,b.y,'#ffdda0',12,1.8);const boss=c23.bowser;if(boss.alive&&Math.hypot(boss.x+14-b.x,boss.y+16-b.y)<19){o24BossDamage(3);b.life=0;o24FX(b.x,b.y,'#ffdda0',16,2);}}
 o.orbs=o.orbs.filter(b=>b.life>0&&b.y<270&&b.x>camera-200);
 for(const p of o.pickups){p.life++;p.vy=Math.min(3,p.vy+.12);const box={...p};box.type='ori-pickup';moveBody(box,p.vx,p.vy);p.x=box.x;p.y=box.y;p.vy=box.vy;
 if(p.life>12&&overlap(player,p)){if(p.type==='cell'){o.hp=Math.min(O24_MAX_HP,o.hp+3);o.energy=O24_MAX_ENERGY;addScore(600,p.x,p.y);}else{score+=100;coins++;}p.remove=true;o24Sound('heal');o24FX(p.x,p.y,'#79efc0',20,2);c23Event('ori-pickup',{type:p.type});}}
 o.pickups=o.pickups.filter(p=>!p.remove&&p.y<280);
 for(const f of o.fx){f.x+=f.vx;f.y+=f.vy;f.vx*=.97;f.vy*=.97;f.life--;}o.fx=o.fx.filter(f=>f.life>0);for(const t of o.dashTrail)t.life--;o.dashTrail=o.dashTrail.filter(t=>t.life>0);if(o.pulse)o.pulse--;if(o.warning)o.warning--;if(o.hitBoss)o.hitBoss--;if(o.linkAge)o.linkAge--;updateParticles();}
const o24EndingBase=c23EndingTick;c23EndingTick=function(){const s=c23,o=s.ori;o24EndingBase();if(s.ending===96)o24Sound('link');if(player.x>=2410){o.rescue++;o.pose='idle';}else if(s.ending>112)o.pose='run';
 if(mode==='win'){c23Set('overlayLabel','ORI × MARIO / WORLD 1-4');c23Set('overlayTitle','光，找到了归处');$('overlayText').innerHTML='纳鲁就在这里。<br>熔城留在身后，冒险还将继续。';c23Set('overlayHint','A / ENTER 再次出发 · C / SELECT 选关');}}
c23Step=function(v){if(!c23||c23Menu||o24Box.open||mode==='paused'||mode==='win'||mode==='respawn')return;const o=c23.ori;if(!o)return;
 if(mode==='dying'){c23.deathFrames++;frame++;if(c23.deathFrames>14){player.y+=player.vy;player.vy+=.19;}for(const f of o.fx)f.life--;if(c23.deathFrames===40){showOverlay('SOUL LINK','再试一次',c23.cause+'。<br>从最近的精灵休息点重新出发。','立即重试 →','A / 空格 重试 · R 本段重试');$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');}if(c23.deathFrames>=85)c23Retry();return;}
 if(mode!=='playing')return;
 if(o.bash){const b=o.bash;b.age++;b.aim=o24Aim(v,b);if(!v.bash||b.age>=120)o24BashRelease();o.prev={...v};return;}
 frame++;c23.ticks++;c23.runFrames++;c23.shake*=.84;const lastLift=c23.lift.x;c23.lift.x=2192+Math.sin(c23.ticks*.016)*32;c23.lift.dx=c23.lift.x-lastLift;
 if(c23.ending){c23EndingTick();o24World();c23Particles();audioSync();return;}
 o24Player(v);if(o.bash||mode!=='playing')return;o24World();c23BossTick();c23Hazards();if(mode!=='playing')return;c23ChaseTick();if(mode!=='playing')return;
 if(player.x+player.w>2256&&player.x<2278&&player.y<160&&player.y+player.h>112){c23Axe();o24Sound('link');return;}
 for(let i=c23.cp+1;i<C23_CPS.length;i++){const cp=C23_CPS[i];if(player.x>=cp.x&&player.x<cp.x+34&&player.grounded){c23SnapshotCheckpoint(i);o.hp=O24_MAX_HP;o.energy=O24_MAX_ENERGY;o.linkAge=85;o24FX(player.x+4,player.y+14,'#8ce9e0',26,2);o24Sound('link');break;}}
 timerTicks++;if(timerTicks>=30){timerTicks=0;timeLeft=Math.max(0,timeLeft-1);if(!timeLeft)c23Fail('时间用尽');}c23Particles();audioSync();};
const o24InputBase=c23Input;c23Input=function(){if(!c23Is()||c23Menu)return o24InputBase();const pad=c23SafePad(),bs=pad?Array.from(pad.buttons,b=>!!(b?.pressed||b?.value>.5)):[],axes=pad?.axes||[];
 if(o24Box.open){if(o24Listen?.source==='pad'){const i=bs.findIndex((v,i)=>v&&!o24SettingPrev[i]);if(i>=0)o24Bind(o24Listen.action,'pad',i);}o24SettingPrev=bs;return{};}
 if(c23PadPresent&&!pad&&c23Device==='手柄'&&mode==='playing')togglePause();c23PadPresent=!!pad;
 const edge=i=>bs[i]&&!c23PadPrev[i];if(bs.some((v,i)=>v&&!c23PadPrev[i])||Math.abs(axes[0]||0)>.24||Math.abs(axes[1]||0)>.24)c23Device='手柄';
 if(!virtualInput){if(edge(8))showCharacters();else if(edge(9))togglePause();else if(edge(0)&&(['paused','respawn','win'].includes(mode)||mode==='dying'&&c23.deathFrames>25))handlePrimary();}
 let v={};for(const [a,b]of Object.entries(o24Binds))v[a]=b.keys.some(k=>keys.has(k))||b.pad.some(i=>bs[i]);const dz=.24;
 v.left ||=axes[0]<-dz;v.right ||=axes[0]>dz;v.up ||=axes[1]<-dz;v.down ||=axes[1]>dz;
 if(c23Device==='手柄'){v.ax=Math.abs(axes[0]||0)>dz?axes[0]:(v.right?1:0)-(v.left?1:0);v.ay=Math.abs(axes[1]||0)>dz?axes[1]:(v.down?1:0)-(v.up?1:0);}
 v.attack ||=o24Mouse.attack;v.bash ||=o24Mouse.bash;for(const a of touch.values())v[a==='run'?'attack':a]=true;
 const raw=!!v.jump;if(c23BlockJump){v.jump=false;if(!raw)c23BlockJump=false;}else v.jump ||=c23PendingJump;c23PendingJump=false;c23PadPrev=bs;
 if(virtualInput)v={left:false,right:false,up:false,down:false,jump:false,attack:false,dash:false,bash:false,glide:false,climb:false,light:false,...virtualInput};return v;};
const o24EarlyBase=t17Early.handle;t17Early.handle=function(e){if(!c23Is())return o24EarlyBase(e);if(o24Box.open){if(e.type==='keydown'&&!e.repeat){if(e.code==='Escape'){if(o24Listen){o24Listen=null;$('o24BindStatus').textContent='已取消重新绑定。';}else o24CloseSettings();return true;}if(o24Listen?.source==='keys'){o24Bind(o24Listen.action,'keys',e.code);return true;}}return e.type==='keyup';}
 if(e.type==='blur'&&e.target===window||e.type==='visibilitychange'&&document.hidden){o24Mouse.attack=false;o24Mouse.bash=false;}
 const touchButton=e.target?.closest?.('.touchkey[data-action]');if(touchButton&&e.type==='pointerdown'&&c23Is()&&!c23Menu){const a=touchButton.dataset.action;if(['dash','bash','glide','climb','light'].includes(a)){touch.set(e.pointerId,a);touchButton.classList.add('pressed');c23Device='触摸';try{touchButton.setPointerCapture(e.pointerId);}catch{}audioInit();return true;}}
 if((e.type==='pointerup'||e.type==='pointercancel')&&touch.has(e.pointerId)){touch.delete(e.pointerId);document.querySelectorAll('.touchkey').forEach(b=>b.classList.toggle('pressed',[...touch.values()].includes(b.dataset.action)));return true;}
 if(e.type.startsWith('pointer')&&(e.target===canvas||o24Mouse.attack||o24Mouse.bash)&&!c23Menu){const r=canvas.getBoundingClientRect();if(r.width>0){const x=(e.clientX-r.left)/r.width*256,y=(e.clientY-r.top)/r.height*240;
 if(e.type==='pointermove'&&(o24Mouse.lastX===null||Math.abs(e.clientX-o24Mouse.lastX)+Math.abs(e.clientY-o24Mouse.lastY)>1)){o24Mouse.x=x;o24Mouse.y=y;o24Mouse.valid=x>=0&&x<=256&&y>=0&&y<=240;c23Device='键鼠';}o24Mouse.lastX=e.clientX;o24Mouse.lastY=e.clientY;
 if(e.type==='pointerdown'){o24Mouse.x=x;o24Mouse.y=y;o24Mouse.valid=true;c23Device='键鼠';if(e.button===0)o24Mouse.attack=true;if(e.button===2)o24Mouse.bash=true;canvas.focus({preventScroll:true});audioInit();return true;}}
 if(e.type==='pointerup'||e.type==='pointercancel'){if(e.button===0||e.type==='pointercancel')o24Mouse.attack=false;if(e.button===2||e.type==='pointercancel')o24Mouse.bash=false;return true;}if(e.type==='pointermove')return true;}
 if(!c23Menu&&['keydown','keyup'].includes(e.type)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"]')){const a=Object.entries(o24Binds).filter(([,b])=>b.keys.includes(e.code)).map(([a])=>a);if(a.length){if((['paused','win','respawn'].includes(mode)||mode==='dying'&&c23.deathFrames>30)&&e.type==='keydown'&&a.includes('jump')){if(!e.repeat){handlePrimary();c23BlockJump=true;}return true;}if(e.type==='keydown'){keys.add(e.code);c23Device='键盘';if(a.some(a=>['up','down','left','right'].includes(a)))o24Mouse.valid=false;audioInit();}else keys.delete(e.code);return true;}}
 return o24EarlyBase(e);};
canvas.addEventListener('contextmenu',e=>{if(c23Is())e.preventDefault();});
// The existing campaign mixer continues to own music. Ori-specific effects above
// are locally synthesized; no remote asset is required to control this chapter.
// Resolution-independent character rig and layered light. Decorative shapes never
// change the collision grid. Rendering is 3x supersampled over 256x240 map units.
function o24Ellipse(g,x,y,rx,ry,c,rot=0){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,Math.PI*2);g.fill();}
function o24Glow(g,x,y,r,color,alpha=.3){g.save();g.globalAlpha*=alpha;const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,color);a.addColorStop(.22,color);a.addColorStop(1,'transparent');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
function o24Path(g,commands,color,stroke=null,width=1){g.beginPath();for(const c of commands){const [k,...v]=c;if(k==='M')g.moveTo(...v);else if(k==='L')g.lineTo(...v);else if(k==='C')g.bezierCurveTo(...v);else if(k==='Q')g.quadraticCurveTo(...v);else if(k==='Z')g.closePath();}if(color){g.fillStyle=color;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke();}}
function o24Limb(g,points,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(points[0][0],points[0][1]);for(const p of points.slice(1))g.lineTo(p[0],p[1]);g.stroke();}
function o24Ori(g,x,feet,pose='idle',phase=0,face=1,opacity=1,glow=true){g.save();g.globalAlpha*=opacity;if(glow)o24Glow(g,x,feet-11,24,'#58c4e1',.18);g.translate(x,feet);g.scale(face,1);
 const running=pose==='run',flying=['dash','bash'].includes(pose),air=['jump','bash','glide'].includes(pose),crouch=pose==='land',wall=pose==='wall',breath=Math.sin(phase*.047)*.35;
 const lean=pose==='stomp'?-.22:flying?.72:running?.16:wall?-.25:0;g.translate(0,crouch?1.1:running?Math.sin(phase*.36)*.55:breath);if(crouch)g.scale(1.1,.89);if(lean){g.translate(0,-8);g.rotate(lean);g.translate(0,8);}
 const skin=g.createLinearGradient(-5,-25,5,1);skin.addColorStop(0,'#fbffff');skin.addColorStop(.48,'#e0f9ff');skin.addColorStop(1,'#83c9e0');
 const swing=running?Math.sin(phase*.39):air?.5:0;
 // Flexible tail, far limbs, then the body and foreground limbs.
 o24Path(g,[['M',-2,-7],['C',-6,-5,-8.5,-3.5,-11,-5+Math.sin(phase*.08)],['Q',-12,-6,-12,-7]],null,'#9ad9ee',1.3);
 const backFoot=running?[-swing*5,.1+Math.max(0,swing)*-2.3]:flying?[-6,-2]:air?[-3,-4]:[-3.4,0];
 const frontFoot=running?[swing*5,Math.min(0,-swing)*2.1]:flying?[-1,-3]:air?[3,-3]:[2.1,.1];
 o24Limb(g,[[-1.5,-7],[-3,-3.2],backFoot],'#8fc8df',2);o24Ellipse(g,backFoot[0]+.9,backFoot[1],2.3,.85,'#a2dcea');
 if(wall)o24Limb(g,[[1,-11],[3,-13],[5,-17]],'#91c9df',1.3);else o24Limb(g,[[-.5,-11],[-3.5,-8.2],[-4.2+swing*2,-5.4]],'#89c6de',1.4);
 o24Path(g,[['M',-.3,-15],['C',-3.2,-14.4,-4.6,-10,-3.2,-6.6],['Q',-.3,-4,2.9,-7.4],['C',4,-9.7,2.4,-14.1,-.3,-15],['Z']],skin);
 o24Ellipse(g,.6,-10.3,2.2,3.9,'#e8fcff',-.23);
 o24Limb(g,[[1,-6.8],[2.1,-3.3],frontFoot],'#e2f7fa',2);o24Ellipse(g,frontFoot[0]+1.1,frontFoot[1],2.5,.9,'#eaffff',-.08);
 // Two long, tapered ears and short antler tips: not a reskinned Mario sprite.
 const earBack=running||flying?-3:Math.sin(phase*.027)*.35;
 o24Path(g,[['M',-2.5,-16.5],['C',-5.7,-19,-5.5+earBack,-24,-8+earBack,-26.2],['C',-3.6,-25.1,-1.5,-22.5,-.4,-18.2],['Z']],skin);
 o24Path(g,[['M',.3,-17.7],['C',.6,-21,2.5+earBack,-25.4,6.2+earBack,-27.3],['C',5.5+earBack,-23.5,4.7,-19.1,2.6,-17.1],['Z']],skin);
 o24Limb(g,[[-1.5,-18.5],[-2,-22],[-.9,-23.3]],'#d7f5fa',1.05);
 o24Limb(g,[[1.1,-19.2],[2.4,-21.5],[3.2,-22]],'#dbfaff',.9);
 o24Ellipse(g,.1,-15.3,4.45,4.0,skin,.08);o24Ellipse(g,2.5,-14.5,3.15,2.35,'#e7fcff',.12);
 o24Ellipse(g,-.55,-16.1,.67,1.2,'#183444',-.15);o24Ellipse(g,2.35,-16.1,.9,1.65,'#102a3c',-.13);o24Ellipse(g,2.6,-16.55,.23,.42,'#d2faff');
 o24Ellipse(g,4.8,-14.9,.54,.38,'#57a6c5');o24Path(g,[['M',2,-13.1],['Q',3,-12.65,3.8,-13.2]],null,'#80bdd0',.35);
 let hand=wall?[4.7,-13.2]:flying?[5.8,-15]:pose==='bash'?[5.5,-17]:pose==='glide'?[2.7,-22]:running?[3.2-swing*3,-7.6]:[3.5,-5.9];
 o24Limb(g,[[1.5,-11.4],[3,-9.8],hand],'#d4f5fc',1.55);o24Ellipse(g,hand[0],hand[1],1.1,1.35,'#ebffff',.25);
 if(pose==='glide'){
  o24Path(g,[['M',-12,-25],['C',-6,-32,8,-33,16,-29],['C',10,-23,0,-22,-12,-25],['Z']],'#8b85be','#e2d2e9',.45);
  o24Limb(g,[[-10,-25],[2,-27],[15,-29]],'#ddd2f1',.6);for(let i=0;i<7;i++)o24Limb(g,[[-8+i*3,-25.6-i*.27],[-4+i*2.9,-29.5]],'#565380',.6);
 }
 g.restore();}
function o24Naru(g,x,feet,age=0,front=false){g.save();g.translate(x,feet);const hug=age>16,t=clamp((age-16)/36,0,1),sway=Math.sin((frame+23)*.035)*.3;
 if(front){if(hug){o24Limb(g,[[-8,-24],[-14,-18],[-12,-11]],'#434f5e',6);o24Ellipse(g,-12,-11,4.3,3,'#60666a',-.2);}g.restore();return;}
 o24Glow(g,0,-20,39,'#6dcfc4',.12);
 o24Ellipse(g,-9,-2,10,3.5,'#171f2c');o24Ellipse(g,7,-2,10,3.5,'#171f2c');
 const fur=g.createLinearGradient(-20,-32,20,0);fur.addColorStop(0,'#697078');fur.addColorStop(.2,'#384555');fur.addColorStop(.6,'#263340');fur.addColorStop(1,'#111f2c');
 o24Path(g,[['M',0,-38+sway],['C',-12,-38,-22,-28,-22,-17],['C',-23,-7,-13,0,0,0],['C',15,1,21,-9,20,-21],['C',19,-32,12,-39,0,-38+sway],['Z']],fur);
 o24Limb(g,[[12,-26],[18,-17],[13,-7]],'#273441',7);o24Ellipse(g,12,-7,5,3.4,'#525b65');
 o24Ellipse(g,-1,-24+sway,12.5,10.9,'#c4c2b2',-.12);o24Ellipse(g,-5,-25,8,8,'#e1ded0',.1);o24Ellipse(g,5,-25,7,8,'#d3d3c4');
 o24Ellipse(g,-8,-25+sway,1.22,1.12,'#28333a');o24Ellipse(g,3,-25+sway,1.2,1.12,'#26343c');
 o24Path(g,[['M',-7,-20],['Q',-2,-17,3,-20]],null,'#767d79',.7);o24Ellipse(g,-2,-12,11,7.9,'#a5ada9',.08);
 if(!hug){o24Limb(g,[[-12,-25],[-20,-17],[-18,-10]],'#455362',6);o24Ellipse(g,-18,-10,4,3.3,'#687378');}
 else {o24Limb(g,[[-10,-25],[-19,-21],[-20+8*t,-16]],'#51616c',6);o24Ellipse(g,-20+8*t,-16,4,3,'#79868a');}
 g.restore();}
function o24Portrait(){const c=o24Card.querySelector('canvas');if(!c)return;const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.save();g.translate(0,0);o24Glow(g,64,88,67,'#4dd4f2',.25);g.scale(3.35,3.35);o24Ori(g,19,42,'idle',0,1,1,false);o24Glow(g,9,16,6,'#8de2ff',.8);o24Ellipse(g,9,16,1,1,'#fff');g.restore();}
function o24Backdrop(){const g=ctx,tm=c23.ticks;const bg=g.createLinearGradient(0,32,0,240);bg.addColorStop(0,'#07101c');bg.addColorStop(.54,'#112930');bg.addColorStop(1,'#132c31');g.fillStyle=bg;g.fillRect(0,32,256,208);
 // Distant stone vaults and hanging roots use parallax; silhouettes stay behind
 // the original foreground tile layer and can never conceal the landing edge.
 for(let layer=0;layer<3;layer++){const spacing=85+layer*23,offset=(camera*(.12+layer*.08))%spacing;g.strokeStyle=['#1a3037','#11242d','#091b25'][layer];g.lineWidth=10-layer*2;
 for(let i=-1;i<5;i++){const x=i*spacing-offset;g.beginPath();g.moveTo(x,226);g.bezierCurveTo(x-17,164,x-22,83,x+spacing*.5,69+layer*14);g.bezierCurveTo(x+spacing+22,88,x+spacing+18,158,x+spacing,226);g.stroke();}}
 for(let i=0;i<18;i++){const x=((i*43.871-camera*.42+tm*.03)%298+298)%298-21,y=61+(i*31.397)%154+Math.sin(tm*.018+i)*4;o24Glow(g,x,y,2.4,'#65d9ca',.13);o24Ellipse(g,x,y,.35,.6,'#569f9b');}
 const roots=[23,80,189,255];for(let i=0;i<roots.length;i++){const x=roots[i]-camera*.19%70;o24Path(g,[['M',x,32],['C',x-9,45,x+11,54,x-2,75],['M',x-2,55],['Q',x+17,64,x+12,85]],null,'#091820',1.7);}
 const n=2438-camera;if(n>-80&&n<336){o24Glow(g,n,147,93,'#337f7a',.45);o24Glow(g,n-8,186,36,'#a6e2c4',.25);g.strokeStyle='#50797a';g.lineWidth=1.2;g.beginPath();g.moveTo(n-43,208);g.quadraticCurveTo(n-63,120,n,81);g.quadraticCurveTo(n+51,126,n+34,208);g.stroke();}
}
function o24DrawPool(pool){const g=ctx,x=pool.x-camera,tm=c23.ticks;g.save();g.beginPath();g.rect(x,pool.y-2,pool.w,244-pool.y);g.clip();const grad=g.createLinearGradient(0,pool.y,0,240);grad.addColorStop(0,'#fff8b5');grad.addColorStop(.1,'#ffb64d');grad.addColorStop(.32,'#fa5120');grad.addColorStop(1,'#6b1421');g.fillStyle=grad;g.beginPath();g.moveTo(x,240);g.lineTo(x,pool.y+3);for(let i=0;i<=pool.w;i+=3)g.lineTo(x+i,pool.y+3+Math.sin(i*.17+tm*.09)*1.2);g.lineTo(x+pool.w,240);g.closePath();g.fill();
 for(let j=0;j<5;j++){const yy=pool.y+10+j*6;g.strokeStyle=j%2?'#e34629':'#ffa146';g.lineWidth=1.2;g.beginPath();g.moveTo(x,yy);for(let i=0;i<=pool.w;i+=8)g.lineTo(x+i,yy+Math.sin(i*.09-tm*.06+j)*2);g.stroke();}g.restore();o24Glow(g,x+pool.w/2,pool.y+9,pool.w*.7+15,'#ff762c',.17);
}
function o24DrawWave(){if(!c23.chaseStarted||c23.practice||c23.ending)return;const g=ctx,edge=c23.wave-camera,t=c23.ticks;if(edge<-65)return;
 const light=g.createLinearGradient(edge-20,0,edge+66,0);light.addColorStop(0,'#ff952d70');light.addColorStop(1,'#ff952d00');g.fillStyle=light;g.fillRect(0,32,Math.max(0,edge+66),208);
 const colors=[['#3e152b','#ab241f'],['#942028','#ed4820'],['#ff6a22','#ffca53']];
 function shape(offset){g.beginPath();g.moveTo(-180,26);g.lineTo(o24Front(26)-camera+offset,26);for(let y=26;y<=247;y+=3)g.lineTo(o24Front(y)-camera+offset,y);g.lineTo(-180,247);g.closePath();}
 for(let i=0;i<3;i++){shape([-19,-8,0][i]);const gr=g.createLinearGradient(Math.min(edge-140,-1),0,edge,0);gr.addColorStop(0,colors[i][0]);gr.addColorStop(1,colors[i][1]);g.fillStyle=gr;g.fill();}
 // The hot edge and collidable surface share o24Front(y), not a hidden rectangle.
 g.beginPath();for(let y=32;y<=240;y+=2){const x=o24Front(y)-camera;if(y===32)g.moveTo(x,y);else g.lineTo(x,y);}g.strokeStyle='#fff4b8';g.lineWidth=1.3;g.shadowColor='#ffb84e';g.shadowBlur=14;g.stroke();g.shadowBlur=0;
 for(let i=0;i<11;i++){const yy=42+((i*39+t*.66)%190),xx=edge-9-((i*31+t*.34)%72);g.strokeStyle=i%2?'#a83025aa':'#f79a3699';g.lineWidth=2.3;g.beginPath();g.ellipse(xx,yy,6+i%3*3,3.2+i%4,Math.sin(i+t*.01),0,Math.PI*1.6);g.stroke();}
 for(let i=0;i<17;i++){const age=(t+i*19)%89,xx=edge-7+age*.35*Math.sin(i*.8),yy=40+((i*37-age*.67)%193+193)%193;g.globalAlpha=1-age/95;o24Ellipse(g,xx,yy,.55+(i%3)*.17,1.2,'#ffde8c',.5);g.globalAlpha=1;}
 for(let i=0;i<4;i++)o24Glow(g,edge-9,55+i*55+Math.sin(t*.05+i)*12,19,'#ff6d2c',.24);
}
function o24DrawLantern(n){const x=n.x-camera,y=n.y+Math.sin(c23.ticks*.045+n.id)*.55;if(x<-30||x>286)return;const near=o24NearTargets()[0],sel=near?.type==='lantern'&&near.id===n.id;ctx.strokeStyle='#4d7a7870';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(x,Math.max(48,y-23));ctx.quadraticCurveTo(x+4,y-12,x,y-4);ctx.stroke();o24Glow(ctx,x,y,13,sel?'#fff0a0':'#e5bd69',sel?.4:.23);o24Path(ctx,[['M',x,y-4],['Q',x+4,y-2,x+3,y+2],['L',x,y+5],['L',x-3,y+2],['Q',x-4,y-2,x,y-4],['Z']],'#e9c887','#705b36',.45);o24Ellipse(ctx,x,y,.9,2,'#ffffd9');if(sel&&!c23.ori.bash){ctx.strokeStyle='#fdeaaa';ctx.lineWidth=.55;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke();}}
function o24Scene(){const g=ctx,s=c23,o=s.ori;
 o24Backdrop();o25Terrain();o25Foreground();
 for(const pool of C23_LAVA)o24DrawPool(pool);
 for(let i=0;i<13-s.bridgeRemoved;i++)sprite('c23_bridge',2048+i*16-camera,160);
 for(let i=0;i<4;i++)sprite('c23_platform',s.lift.x+i*8-camera,96);
 if(!s.ending){sprite('c23_chain',2241-camera,144);o24Glow(g,2264-camera,136,15,'#ffc76a',.25);sprite('c23_axe'+Math.floor(frame/8)%3,2256-camera,128);}
 for(const n of O24_LANTERNS)o24DrawLantern(n);
 for(let i=0;i<C23_CPS.length;i++){const cp=C23_CPS[i],x=cp.x-camera+4,y=cp.feet;if(x<-30||x>286)continue;o24Glow(g,x,y-4,17,'#6de4cc',.24);o24Ellipse(g,x,y-1,7,1,'#619b9c');o24Path(g,[['M',x,y-3],['Q',x-6,y-7,x,y-14],['Q',x+5,y-7,x,y-3]],'#aaf8e599');}
 const b=s.bowser;if(b.y<260){o24Glow(g,b.x-camera+14,b.y+16,22,'#ee7531',.16);if(b.alive)sprite('c23_bowser'+Math.floor(b.age/12)%2,b.x-camera-2,b.y,b.face>0);else sprite('goomba',b.x-camera+6,b.y,false,true);if(b.active&&b.alive){g.fillStyle='#2c162d';g.fillRect(b.x-camera-1,b.y-6,28,2);g.fillStyle='#e8926d';g.fillRect(b.x-camera-1,b.y-6,28*clamp(b.hp/18,0,1),2);}}
 for(let i=0;i<C23_BARS.length;i++)for(const q of c23BarDots(C23_BARS[i],i)){if(q.x<camera-12||q.x>camera+268)continue;o24Glow(g,q.x-camera,q.y,6,'#ff913d',.16);sprite('fireball'+Math.floor((frame+i)/4)%4,q.x-camera-4,q.y-4);}
 for(const f of s.fire){o24Glow(g,f.x-camera+12,f.y+4,13,f.reflected?'#fffac7':'#ff882a',.4);sprite('c23_bowserFire',f.x-camera,f.y,f.vx>0);}
 for(const p of o.pickups){const x=p.x-camera+4,y=p.y+4;const col=p.type==='cell'?'#81ffdc':'#ffe6a4';o24Glow(g,x,y,10,col,.37);o24Path(g,[['M',x,y-4],['L',x+3,y],['L',x,y+4],['L',x-3,y],['Z']],col);}
 for(const b of o.bolts){for(let i=0;i<b.tail.length;i++)o24Ellipse(g,b.tail[i].x-camera,b.tail[i].y,.6+i*.13,.6+i*.13,'#9cecff'+Math.floor(50+i*22).toString(16).padStart(2,'0'));o24Glow(g,b.x-camera,b.y,6,'#9ae9ff',.5);o24Ellipse(g,b.x-camera,b.y,1.2,1.2,'#e7ffff');}
 for(const b of o.orbs){o24Glow(g,b.x-camera,b.y,9,'#ffe397',.45);o24Ellipse(g,b.x-camera,b.y,2.4,2.1,'#ffd06b');o24Ellipse(g,b.x-camera-.5,b.y-.4,1.2,1.2,'#fffce0');}
 if(o.lightAim){const a=o.lightAim;let x=a.x,y=a.y,vx=a.ax*2.6,vy=a.ay*3;for(let i=0;i<35;i++){x+=vx;y+=vy;vy+=.065;if(solids({x:x-1,y:y-1,w:2,h:2}).length)break;if(i%3===0)o24Ellipse(g,x-camera,y,.62,.62,o.energy?'#ffe7a9b0':'#aa7c6a99');}o24Glow(g,a.x-camera,a.y,8,'#ffde9b',.24);}
 const nx=2445-camera;if(nx>-50&&nx<306)o24Naru(g,nx,208,o.rescue);
 for(let i=0;i<o.dashTrail.length;i+=3){const t=o.dashTrail[i];o24Ori(g,t.x-camera+4.5,t.y+14,'dash',player.anim,t.face,t.life/110,false);}
 let px=player.x-camera+4.5,py=player.y+14;if(o.rescue>40){px=2445-camera-12;py=203;}
 if(mode==='dying'){const a=clamp(1-c23.deathFrames/48,0,1);o24Ori(g,px,py,'jump',player.anim,player.facing,a);o24Glow(g,px,py-10,35,'#9be7ff',a*.45);}
 else if(!player.invuln||Math.floor(frame/4)%2){o24Ori(g,px,py,o.bash?'bash':o.land?'land':o.pose,player.anim,player.facing);}
 // Sein's own motion and light are separate from Ori's body.
 const sx=px-player.facing*12,sy=py-20+Math.sin(s.ticks*.071)*2;if(hero!=='sonic'){for(let i=4;i>0;i--)o24Glow(g,sx-player.facing*i*1.7,sy+Math.sin(s.ticks*.071-i*.3),2.1,'#90dcff',.1);o24Glow(g,sx,sy,11,'#82d3ff',.45);o24Ellipse(g,sx,sy,1.6,1.7,'#dffbff');}
 if(nx>-50&&nx<306)o24Naru(g,nx,208,o.rescue,true);
 if(o.charge>17){const r=4+(o.charge-17)*.2;g.strokeStyle=o.energy>0?'#b7dfff':'#687890';g.lineWidth=.6;g.beginPath();g.arc(sx,sy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(o.charge/34,0,1));g.stroke();o24Glow(g,sx,sy,19,'#b7cfff',.14);}
 if(o.pulse){const radius=(16-o.pulse)*4+4;g.strokeStyle='#c3fbff'+Math.floor(o.pulse/16*150).toString(16).padStart(2,'0');g.lineWidth=1.8;g.beginPath();g.arc(px,py-7,radius,0,Math.PI*2);g.stroke();}
 for(const p of o.fx){g.save();g.globalAlpha=p.life/p.max;o24Ellipse(g,p.x-camera,p.y,p.r,p.r,p.color);g.restore();}
 for(const f of floaters)text(f.text,f.x-camera,f.y,'#d5fbf0',1,true);
 o24DrawWave();for(const p of s.dust){g.save();g.globalAlpha=clamp(p.life/25,0,1);if(p.s>3)sprite('debris',p.x-camera,p.y,false,frame%8>3,'castle');else o24Ellipse(g,p.x-camera,p.y,.6,1.1,'#e2ae77');g.restore();}
 // R32 shared Bash overlay is drawn once after the scene.
 o25NaruPortrait();if(o.rescue>15){const a=Math.min(1,o.rescue/90);o24Glow(g,nx-9,193,49,'#d5f7dc',a*.17);}
}
function o24HUD(){const g=ctx,o=c23.ori;const top=g.createLinearGradient(0,0,0,34);top.addColorStop(0,'#07121ff5');top.addColorStop(.86,'#07121fec');top.addColorStop(1,'#07121f00');g.fillStyle=top;g.fillRect(0,0,256,34);g.font='bold 9px Georgia,serif';g.letterSpacing='1px';g.fillStyle='#eafcff';g.fillText('ORI',12,17);g.letterSpacing='0px';
 for(let i=0;i<O24_MAX_HP;i++){const x=53+i*8,y=13,fill=i<o.hp?'#9beac7':'#2c484b';o24Path(g,[['M',x,y-3.7],['C',x+3.8,y-3,x+3,y+2,x,y+4],['C',x-3,y+2,x-3.8,y-3,x,y-3.7],['Z']],fill);if(i<o.hp)o24Glow(g,x,y,5,'#73e9c6',.12);}
 for(let i=0;i<O24_MAX_ENERGY;i++){const x=111+i*7,y=13;const fill=i<o.energy?'#93d8ff':o.warning&&frame%10<5?'#dc9472':'#2e4359';o24Path(g,[['M',x,y-3.4],['L',x+2.4,y],['L',x,y+3.4],['L',x-2.4,y],['Z']],fill);}
 g.font='6px Arial,sans-serif';g.fillStyle='#afccc9';g.fillText('WORLD 1-4',192,12);g.fillStyle='#34434b';g.fillRect(166,18,78,1.3);g.fillStyle='#a7e2d5';g.fillRect(166,18,78*clamp((player.x-30)/2386,0,1),1.3);
 g.font='5px Arial,sans-serif';g.fillStyle=o.dashReady||player.grounded?'#b8ecee':'#648295';g.fillText('DASH',49,26);g.fillStyle=o.jumps<2?'#bbf2e7':'#648295';g.fillText('JUMP',80,26);g.fillStyle=o.bash?'#ffe8a7':'#a1c4c7';g.fillText('BASH',111,26);
 if(false){g.font='italic 10px Georgia,serif';g.textAlign='center';g.fillStyle='#e7f6e9';g.fillText('Together again.',185,122);g.textAlign='left';}
}
c23Draw=function(){if(!c23)return;if(!c23.ori)c23.ori=o24New();if(canvas.width!==768||canvas.height!==720){canvas.width=768;canvas.height=720;}ctx.setTransform(3,0,0,3,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,256,240);ctx.save();ctx.beginPath();ctx.rect(0,32,256,208);ctx.clip();const shake=$('c23Motion')?.checked?0:c23.shake>.25?(frame%2?.3:-.3):0;ctx.translate(0,shake);o24Scene();ctx.restore();o24HUD();o24UI();};
// Apply the final native entrypoints to opt-in diagnostics, not to the release API.
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R24',chapter14:'Ori / Blind Forest DE-inspired'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 const h=window.__castle23;Object.assign(h,{choose:n=>c23Choose(n),start:()=>c23Start(),retry:()=>c23Retry(),read:()=>c23Input(),update:v=>c23Step(v),draw:()=>c23Draw()});
 window.__ori24={...h,ori:()=>structuredClone(c23.ori),lanterns:O24_LANTERNS,targets:o24NearTargets,front:o24Front,bind:o24Bind,controls:()=>structuredClone(o24Binds),setMouse:(x,y)=>{o24Mouse={...o24Mouse,x,y,valid:true};c23Device='键鼠';},mouse:()=>({...o24Mouse}),sound:o24Sound,
 stateRef:()=>c23, fixture:(p={})=>{Object.assign(player,p);camera=clamp(player.x-104,0,2304);},capture:()=>h.save(),restore:d=>{h.restore(d);},simulate:(n,v)=>{for(let i=0;i<n;i++)c23Step(v);return h.snapshot();},renderPortrait:()=>o24Portrait()};
}
