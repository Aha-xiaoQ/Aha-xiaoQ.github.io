/* R30 — release polish, checkpoint persistence and local atmosphere.
 * Continues R29's one canonical castle / one canvas / one fixed update loop.
 * Additional visual work is original procedural art. No new physics engine.
 */
const O30_SAVE_KEY='mariomix.ori.castle14.r30.checkpoint';
const O30_SCHEMA='mariomix.ori.checkpoint/1';
// Same ledge, safer revival spot: avoid starting underneath the right-hand ceiling lip.
O28_CHECKS[4].x=110;
const O30_STAT_KEYS=['bashed','airDashes','doubleJumps','wallJumps','spent','glides','flames'];
const O30_CP_NAMES={horizontal:['入口台阶','火棒长廊','暗砖前厅','库巴吊桥'],flood:['维修通道','断桥气流','隐藏砖区','台基竖井','月光出口']};
const o30={snapshot:null,storage:'unknown',notice:'',pending:false,restoring:false,flash:0,active:false,online:false,finished:false,hintKey:'',lastMode:'menu'};
function o30Number(v,min=0,max=1000000000){return typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;}
function o30Validate(input){
 const s=typeof input==='string'?JSON.parse(input):structuredClone(input);
 if(!s||s.schema!==O30_SCHEMA||s.chapter!==14||!['horizontal','flood'].includes(s.phase)||!Number.isInteger(s.cp)||s.cp<0||s.cp>=O30_CP_NAMES[s.phase].length)throw new Error('不是兼容的 1-4 检查点。');
 if(typeof s.practice!=='boolean'||typeof s.completed!=='boolean'||!s.stats||!o30Number(s.ticks)||!o30Number(s.runFrames)||!o30Number(s.retries,0,100000)||!o30Number(s.score)||!o30Number(s.coins)||!o30Number(s.time,0,36000)||!o30Number(s.windFrames)||!o30Number(s.gateBreaks,0,4))throw new Error('进度数据不完整。');
 for(const key of O30_STAT_KEYS)if(!o30Number(s.stats[key]))throw new Error('能力记录不完整。');
 if(!s.world||!Array.isArray(s.world.events)||s.world.events.length>20000)throw new Error('世界记录过大或损坏。');
 const world=new O29Core.SharedWorld(o29Spec());world.restore(s.world);
 if(s.phase==='flood'&&world.view(1).entities.filter(e=>e.kind==='bridge').some(e=>!e.state.destroyed))throw new Error('逃生进度与断桥状态不一致。');
 return {data:s,world};
}
function o30Write(){
 if(!o30.snapshot)return false;
 try{localStorage.setItem(O30_SAVE_KEY,JSON.stringify(o30.snapshot));o30.storage='saved';o30.notice='';return true;}
 catch(e){o30.storage='session';o30.notice='浏览器未允许本地保存；可导出进度文件。';return false;}
}
function o30Capture(){
 if(o30.restoring||!c23Is()||!o30.active||!o29.world||!['horizontal','flood'].includes(o28.phase))return;
 if(o28.phase==='horizontal')o29SyncHorizontal(true);
 const stats=Object.fromEntries(O30_STAT_KEYS.map(k=>[k,c23.ori[k]||0]));
 o30.snapshot={schema:O30_SCHEMA,chapter:14,phase:o28.phase,cp:o28.phase==='flood'?o28.cp:c23.cp,practice:!!c23.practice,completed:false,world:o29.world.snapshot(),ticks:c23.ticks,runFrames:c23.runFrames,retries:c23.retries,score,coins,time:timeLeft,stats,windFrames:o29.windFrames,gateBreaks:o29.gateBreaks,savedAt:new Date().toISOString()};
 o30.pending=false;o30.flash=150;o30Write();
}
function o30Flush(){
 if(!o30.snapshot||o30.restoring||!o30.active||!c23Is()||c23Menu)return;
 // Only update run counters on close/pause. The checkpoint's geometry stays atomic.
 o30.snapshot.runFrames=c23.runFrames;o30.snapshot.retries=c23.retries;
 o30.snapshot.savedAt=new Date().toISOString();o30Write();
}
try{const raw=localStorage.getItem(O30_SAVE_KEY);if(raw)o30.snapshot=o30Validate(raw).data;o30.storage='ready';}
catch(e){o30.storage='session';o30.notice='本地进度不可用；可开始新旅程或导入备份。';}
const o30HorizontalCheckpoint=c23SnapshotCheckpoint;
c23SnapshotCheckpoint=function(index){o30HorizontalCheckpoint(index);if(!o30.restoring)o30.pending=true;};
const o30VerticalCheckpoint=o29SaveCheckpoint;
o29SaveCheckpoint=function(){o30VerticalCheckpoint();if(!o30.restoring)o30.pending=true;};
const o30StartBase=c23Start;
c23Start=function(){
 if(!o30.restoring){o30.active=true;o30.finished=false;o30.pending=true;}
 o30StartBase();if(!o30.restoring)o30Capture();o30Chrome();
};
const o30ChooseBase=c23Choose;
c23Choose=function(n){o30Flush();o30.active=false;const r=o30ChooseBase(n);o30Chrome();return r;};
const o30StepBase=c23Step;
c23Step=function(v){
 const r=o30StepBase(v);
 if(o30.flash&&mode==='playing')o30.flash--;
 if(o30.pending&&!c23Menu&&mode==='playing'&&!c23.ending)o30Capture();
 if(mode==='win'&&c23Is()&&!o30.finished){o30.finished=true;if(o30.snapshot){o30.snapshot.completed=true;o30Flush();}o30Chrome();}
 return r;
};
function o30Resume(input=o30.snapshot){
 let checked;try{checked=o30Validate(input);}catch(e){o30.notice=e.message;toast('进度未载入：'+e.message);o30Chrome();return false;}
 const s=checked.data;o30.restoring=true;
 try{
  if(!c23Is())c23Choose(14);$('c23Practice').checked=s.practice;c23Start();
  if(s.phase==='horizontal'){
   const map=c23Map();for(const d of O29_CANONICAL.entities){if(!d.id.startsWith('tile:'))continue;const st=checked.world.state(d.id),k=tileKey(d.x/16,d.y/16),t=map.get(k);if(st.destroyed)map.delete(k);else if(t){t.used=st.used;t.hidden=!st.revealed;if(st.used)t.content=null;t.worldId=d.id;}}
   c23.saved={index:s.cp,power:0,score:s.score,coins:s.coins,map:[...map.values()],time:s.time};c23.retries=s.retries;c23.runFrames=s.runFrames;
   c23ResetScene(s.cp,true);o29.world=checked.world;o29Refresh();
  }else{
   o29.world=checked.world;o29Refresh();c23.bridgeRemoved=13;c23.ticks=s.ticks;o28.phase='flood';o28EnterFlood(s.cp,true);
  }
  c23.practice=s.practice;c23.ticks=s.ticks;c23.runFrames=s.runFrames;c23.retries=s.retries;
  score=s.score;coins=s.coins;timeLeft=s.time;Object.assign(c23.ori,s.stats);o29.windFrames=s.windFrames;o29.gateBreaks=s.gateBreaks;
  o30.snapshot=structuredClone(s);o30.snapshot.completed=false;o30.active=true;o30.finished=false;o30.pending=false;o30.flash=150;
  c23Clear();c23BlockJump=true;hideOverlay();o24Mouse.valid=false;canvas.focus({preventScroll:true});audioInit();audioSync();o28Event('checkpoint-resumed',{phase:s.phase,cp:s.cp});
 }catch(e){o30.notice='进度未能恢复，请重新开始。';toast(o30.notice);return false;}
 finally{o30.restoring=false;}
 o30Write();o30Chrome();c23Draw();return true;
}
function o30SaveLabel(){
 if(o30.notice)return o30.notice;if(!o30.snapshot)return o30.storage==='session'?'进度可在游戏中导出。':'抵达休息点时自动保存。';
 const s=o30.snapshot;return(s.completed?'旅程已完成 · ':o30.storage==='session'?'本次会话 · ':'已保存 · ')+(s.phase==='horizontal'?'熔城 / ':'洪水 / ')+O30_CP_NAMES[s.phase][s.cp];
}
const o30SavePanel=document.createElement('details');o30SavePanel.id='o30SavePanel';
o30SavePanel.innerHTML='<summary>进度与备份 <span id="o30SaveBadge">检查点</span></summary><p id="o30SaveDescription" role="status"></p><div class="o30-save-actions"><button type="button" id="o30Export">导出进度</button><button type="button" id="o30Import">导入进度</button></div><input id="o30ImportFile" type="file" accept=".json,application/json" hidden><p class="o30-fine">继续时从最近的休息点出发，恢复生命与能量。本地进度只属于当前浏览器；换设备请先导出。</p>';
$('c23Options').after(o30SavePanel);
$('o30Export').onclick=()=>{
 o30Flush();if(!o30.snapshot){toast('先开始冒险，再导出检查点。');return;}
 const blob=new Blob([JSON.stringify(o30.snapshot,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MarioMix_1-4_Ori_Checkpoint.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已导出最近的检查点。');
};
$('o30Import').onclick=()=>{if(mode==='playing'&&c23Is())togglePause();$('o30ImportFile').click();};
$('o30ImportFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>2000000)throw new Error('请选择小于 2 MB 的进度文件。');const v=o30Validate(await f.text());if(o30Resume(v.data))toast('已从备份的休息点继续。');}catch(err){toast('无法导入：'+err.message);}finally{e.target.value='';}};
const o30Continue=document.createElement('button');o30Continue.type='button';o30Continue.id='o30Continue';o30Continue.className='primary';o30Continue.hidden=true;o30Continue.textContent='继续旅程 →';$('mainAction').before(o30Continue);o30Continue.onclick=()=>o30Resume();
const o30Up=document.createElement('button');o30Up.type='button';o30Up.className='touchkey up';o30Up.dataset.action='up';o30Up.setAttribute('aria-label','向上 / 借力方向');o30Up.textContent='▲';document.querySelector('.pad').append(o30Up);
const o30EarlyBase=t17Early.handle;t17Early.handle=function(e){
 if(c23Is()&&e.type==='keydown'&&!e.repeat&&c23Menu&&e.target===o30Continue&&['Enter','Space'].includes(e.code)){o30Resume();return true;}
 const b=e.target?.closest?.('.touchkey[data-action]');
 if(c23Is()&&!c23Menu&&e.type==='pointerdown'&&b){o24Mouse.valid=false;if(b.dataset.action==='up'){touch.set(e.pointerId,'up');b.classList.add('pressed');c23Device='触摸';try{b.setPointerCapture(e.pointerId);}catch{}audioInit();return true;}}
 return o30EarlyBase(e);
};
const o30Hint=document.createElement('div');o30Hint.id='o30Hint';o30Hint.innerHTML='<span class="o30-hint-icon" aria-hidden="true">✦</span><span id="o30HintText"></span>';
document.querySelector('.screen-shell').after(o30Hint);
const o30SaveLine=document.createElement('p');o30SaveLine.id='o30SaveLine';document.querySelector('.status-card').append(o30SaveLine);
const o30Route=document.createElement('div');o30Route.id='o30Route';o30Route.setAttribute('aria-label','关卡旅程');o30Route.innerHTML='<span data-act="horizontal">01 熔城</span><i></i><span data-act="turn">02 翻转</span><i></i><span data-act="flood">03 洪水</span>';
document.querySelector('.status-card').before(o30Route);
// Original self-contained backdrop, prepainted once; no external art requirement.
function o30PaintBackdrop(vertical=false){
 const cv=document.createElement('canvas');cv.width=1536;cv.height=1536;const g=cv.getContext('2d');g.scale(3,3);
 const grd=g.createLinearGradient(0,0,480,512);grd.addColorStop(0,'#06121f');grd.addColorStop(.4,'#173849');grd.addColorStop(.72,'#102b39');grd.addColorStop(1,'#071722');g.fillStyle=grd;g.fillRect(0,0,512,512);
 for(let layer=0;layer<2;layer++)for(let i=-1;i<6;i++){
  g.globalAlpha=layer===0?.44:.62;
  const x=i*122+layer*47,y=layer*23,w=74+layer*7,arch=70+layer*13;g.fillStyle=['#234d5c','#153b49','#092431'][layer];g.strokeStyle=['#38606a','#2c555d','#22454b'][layer];g.lineWidth=.65;
  g.beginPath();g.moveTo(x-w/2,512);g.lineTo(x-w/2,arch+80+y);g.bezierCurveTo(x-w/2,arch+32+y,x-8,arch+8+y,x,arch+y);g.bezierCurveTo(x+8,arch+8+y,x+w/2,arch+32+y,x+w/2,arch+80+y);g.lineTo(x+w/2,512);g.lineTo(x+w/2+9,512);g.lineTo(x+w/2+9,arch+64+y);g.bezierCurveTo(x+w/2+9,arch+26+y,x+13,arch-14+y,x,arch-24+y);g.bezierCurveTo(x-13,arch-14+y,x-w/2-9,arch+26+y,x-w/2-9,arch+64+y);g.lineTo(x-w/2-9,512);g.closePath();g.fill();g.stroke();
  for(let j=0;j<8;j++){g.strokeStyle='#83bdc50a';g.beginPath();g.moveTo(x-w/2-8,180+j*39);g.lineTo(x-w/2,178+j*39);g.stroke();}
 }
 g.globalAlpha=1;
 for(let i=0;i<18;i++){const x=i*33.7-12;g.strokeStyle=i%2?'#0a2630':'#13343b';g.lineWidth=2+(i%4);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+30,55,x-24,85,x+13,183+(i%5)*17);g.stroke();g.strokeStyle='#42777455';g.lineWidth=.55;g.stroke();for(let j=0;j<4;j++){g.fillStyle='#2f625959';g.beginPath();g.ellipse(x+10+Math.sin(j+i)*13,40+j*31,4,1.7,j+i,0,Math.PI*2);g.fill();}}
 for(let i=0;i<9;i++){const x=21+i*62.1,y=160+(i*87)%300;const r=g.createRadialGradient(x,y,0,x,y,27);r.addColorStop(0,'#a3e8ce32');r.addColorStop(1,'#a3e8ce00');g.fillStyle=r;g.fillRect(x-27,y-27,54,54);g.strokeStyle='#65958a';g.lineWidth=.7;g.beginPath();g.moveTo(x,y+8);g.lineTo(x+2,y);g.stroke();g.fillStyle='#7ec6b0';g.beginPath();g.ellipse(x+2,y,2.7,1.1,0,Math.PI,Math.PI*2);g.fill();}
 for(let i=0;i<120;i++){const x=(i*133.713)%512,y=(i*93.217)%512;g.fillStyle=i%3?'#accfc908':'#99cccf12';g.fillRect(x,y,1+(i%4)*.3,.35);}
 if(vertical){for(let k=0;k<5;k++){const yy=30+k*110;g.strokeStyle='#8fb8aa24';g.lineWidth=1.2;g.beginPath();g.arc(130,yy,62,Math.PI,0);g.stroke();g.strokeStyle='#2d565554';g.lineWidth=3;g.beginPath();g.moveTo(42,yy+15);g.lineTo(218,yy+15);g.stroke();}}
 return cv;
}
const o30BackH=o30PaintBackdrop(false),o30BackV=o30PaintBackdrop(true);
function o30Backdrop(vertical=false){
 const g=ctx,t=c23?.ticks||0;g.save();g.imageSmoothingEnabled=true;
 if(vertical){const shift=((o28.camY*.31)%256+256)%256;g.drawImage(o30BackV,0,shift*3,768,720,0,0,256,240);}
 else{const shift=((camera*.13)%256+256)%256;g.drawImage(o30BackH,shift*3,32*3,768,624,0,32,256,208);}
 g.globalCompositeOperation='screen';
 for(let k=0;k<3;k++){const x=55+k*85-(vertical?0:(camera*.065)%85),light=g.createLinearGradient(x,35,x+66,240);light.addColorStop(0,'#aed9d41d');light.addColorStop(.7,'#99dcc20c');light.addColorStop(1,'#99dcc200');g.fillStyle=light;g.beginPath();g.moveTo(x,32);g.lineTo(x+8,32);g.lineTo(x+78,240);g.lineTo(x+21,240);g.closePath();g.fill();}
 g.globalCompositeOperation='source-over';for(let i=0;i<18;i++){const x=(i*73.731+t*.055)%256,y=38+((i*59.17-t*.055-(vertical?o28.camY*.18:0))%195+195)%195;g.fillStyle=i%4?'#bee9cf55':'#d7fdf599';g.beginPath();g.ellipse(x,y,.38,.55,0,0,Math.PI*2);g.fill();}
 const fog=g.createLinearGradient(0,182,0,240);fog.addColorStop(0,'#6bc3ca00');fog.addColorStop(1,'#4e8d9420');g.fillStyle=fog;g.fillRect(0,182,256,58);g.restore();
}
const o30OldBackdrop=o24Backdrop;o24Backdrop=function(){if(o25Art==='public'&&!o25Images.has('back'))return o30Backdrop(false);return o30OldBackdrop();};
o29Backdrop=function(){o30Backdrop(true);};
// Replace stacked historical HUD labels with one coherent status strip.
o24HUD=function(){
 const g=ctx,o=c23.ori;if(!o)return;g.save();g.fillStyle='#07151f';g.fillRect(0,0,256,32);g.fillStyle='#29434c';g.fillRect(0,31.5,256,.5);
 g.font='bold 9px Georgia,serif';g.fillStyle='#e6fff8';g.fillText('ORI',10,14);g.font='4.1px system-ui,sans-serif';g.fillStyle='#8bb4b9';g.fillText('SPIRIT LIGHT',10,24);
 for(let i=0;i<6;i++){const x=54+i*7.5;g.fillStyle=i<o.hp?'#a0edcb':'#284b4c';g.beginPath();g.moveTo(x,6);g.bezierCurveTo(x+4,7,x+3,13,x,15);g.bezierCurveTo(x-3,13,x-4,7,x,6);g.fill();}
 for(let i=0;i<4;i++){const x=108+i*7;g.fillStyle=i<o.energy?'#9bddff':'#29445b';g.beginPath();g.moveTo(x,7);g.lineTo(x+2.3,10.5);g.lineTo(x,14);g.lineTo(x-2.3,10.5);g.closePath();g.fill();}
 g.font='4.4px system-ui,sans-serif';for(const [x,n,ready]of [[50,'冲刺',o.dashReady||player.grounded],[77,'二段跳',o.jumps<2],[108,'借力',!!o.bash||o24NearTargets().length>0]]){g.fillStyle=ready?'#aad5ce':'#506d79';g.fillText(n,x,25);}
 const phase=o28.phase||'horizontal',progress=phase==='horizontal'?clamp((player.x-30)/2386,0,1)*.46:phase==='turn'?.48:phase==='flood'?.5+clamp(o28.highest/(O28_H-100),0,1)*.47:1;
 const tag=phase==='horizontal'?'01 / 熔城':phase==='turn'?'02 / 翻转':phase==='flood'?'03 / 洪水':'04 / 月夜';g.textAlign='right';g.font='5px system-ui,sans-serif';g.fillStyle='#deece4';g.fillText(tag,245,11);g.textAlign='left';g.fillStyle='#2e454e';g.fillRect(166,17,79,1.5);g.fillStyle='#c9d8b1';g.fillRect(166,17,79*progress,1.5);
 g.fillStyle='#8db2ba';g.font='4.1px system-ui,sans-serif';const danger=phase==='flood'&&!c23.practice?'洪水距离 '+Math.max(0,Math.ceil((o28.water-player.y-14)/16))+' 格':phase==='horizontal'&&c23.chaseStarted&&!c23.practice?'熔潮距离 '+Math.max(0,Math.ceil((player.x-c23.wave)/16))+' 格':'WORLD 1—4';g.fillText(danger,166,26);g.restore();
};
o28HUD=function(){};
function o30Key(action){const map={0:'A',1:'B',2:'X',3:'Y',4:'LB',5:'RB',6:'LT',7:'RT',12:'↑',13:'↓',14:'←',15:'→'};const b=o24Binds[action];return c23Device.includes('手柄')?(map[b.pad[0]]||'手柄键 '+b.pad[0]):o24KeyLabel(b.keys[0]);}
function o30Help(){
 if(!c23?.ori)return '借助精灵之光，进入城堡。';
 if(c23Menu)return '移动后连按两次跳跃；靠近金色光点，按住借力键再松开。';
 if(mode==='paused')return '暂停中 · 世界与声音已暂停，继续后保持当前位置。';
 if(mode==='win')return '熔城已在身后。马里奥的旅途，还没有结束。';
 if(mode==='dying')return '从最近的休息点重新出发 · '+(c23.cause||'继续尝试新的路线');
 if(o28.phase==='turn')return '机关正在启动 · 同一座城堡，即将换一个方向。';
 if(o28.phase==='outside')return '月光下的片刻宁静。';
 if(c23.ori.bash)return '选好方向后松开 '+o30Key('bash')+' · 奥日与弹体会向相反方向飞出。';
 if(o28.phase==='flood'){
  const n=Math.max(0,o29.section);if(n===1||n===5)return '按住 '+o30Key('glide')+' 展开羽毛，乘白色气流上升。';
  if(n===2)return '借力紫色弹体，反射击碎木栅；也能从右侧绕过。';
  if(n===4)return '贴左墙，按住 '+o30Key('climb')+' + ↑ 攀爬；等火棒经过后再走。';
  return '靠近金色光点，按住 '+o30Key('bash')+' 选择方向，松开借力；向上寻找落脚点。';
 }
 if(c23.ending)return '吊桥已经断开，去看看门后的房间。';
 if(o24NearTargets().length)return '按住 '+o30Key('bash')+' / 右键，选方向再松开 · 借力时世界暂停。';
 return o30Key('jump')+' 跳跃 / 二段跳　·　'+o30Key('dash')+' 冲刺　·　金色光点可借力';
}
function o30UI(){
 const on=c23Is();o30Hint.hidden=!on;o30SavePanel.hidden=!on;o30SaveLine.hidden=!on;o30Route.hidden=!on;o30Up.hidden=!on;o30Continue.hidden=!(on&&c23Menu&&o30.snapshot&&!o30.snapshot.completed);
 if(!on)return;
 c23Set('o30HintText',o30Help());c23Set('o30SaveLine',o30SaveLabel());c23Set('o30SaveDescription',o30SaveLabel());c23Set('o30SaveBadge',o30.storage==='session'?'可导出':'本地');$('o30Export').disabled=!o30.snapshot;
 for(const el of o30Route.querySelectorAll('[data-act]')){const current=el.dataset.act===o28.phase;el.classList.toggle('current',current);if(current)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');}
 if(c23Menu){c23Set('relayMessage','借助精灵之光，穿越城堡深处。');c23Set('stateLabel','准备出发');c23Set('heroStatus','6 格生命 · 4 格能量');}
 if(mode==='win')c23Set('relayMessage','两次逃生完成 · 借力 '+c23.ori.bashed+' 次 · 重试 '+c23.retries+' 次');
 c23Set('restartButton','从头开始');
 const screen=document.querySelector('.screen-top');screen.children[1].textContent='ONE CASTLE · TWO DIRECTIONS';
}
const o30UIBase=o24UI;o24UI=function(){o30UIBase();o30UI();};c23UI=o24UI;
const o30VerticalUI=o28UI;o28UI=function(){o30VerticalUI();o30UI();};
function o30Chrome(){
 const on=c23Is();document.body.classList.toggle('o30-final',on);o30UI();if(!on)return;
 C23_ROOMS[14].name='奥日 · 借光而行';C23_ROOMS[14].title='借光而行';C23_ROOMS[14].intro='踏入熔城，救出爷爷。城堡翻转后，尽量沿原地图的砖路、火棒台基与断桥遗迹向上逃离。';
 document.querySelector('[data-chapter="14"] span').textContent='奥日 · 借光而行';
 document.querySelector('.panel>.kicker').textContent='CHAPTER 04 / ORI × CASTLE';document.querySelector('.panel>h2').textContent='借光而行';
 const intro=document.querySelector('.panel>p.intro:first-of-type');if(intro)intro.textContent=C23_ROOMS[14].intro;
 c23Set('heroHelp','二段跳、冲刺、借力与羽毛。失误后从最近的休息点重新出发。');
 document.querySelector('header .brand small').textContent='在下_小Q / PIXEL WORKSHOP';document.querySelector('header .offline').textContent='1-4 · 单文件试玩';
 const tagline=document.querySelector('.tagline');if(tagline)tagline.innerHTML='<span>1-4 · 奥日城堡</span><span>原图上攀，借光脱困。</span>';
 if(c23Menu){c23Set('overlayLabel','MARIO MIX / CHAPTER 04');c23Set('overlayTitle','借光而行');c23Set('overlayText','一座城堡，两次逃生。\n金色的微光，会带你找到出路。');c23Set('mainAction',o30.snapshot&&!o30.snapshot.completed?'开始新旅程':'进入城堡 →');c23Set('overlayHint',o30.snapshot&&!o30.snapshot.completed?'开始新旅程会替换本地进度；可先导出备份。':'方向键移动 · 空格跳跃 · E 借力');}
 if(mode==='win'){c23Set('overlayLabel','WORLD 1-4 / JOURNEY COMPLETE');c23Set('overlayTitle','微光未熄，旅途未完。');c23Set('overlayText','熔城、机关与洪水都已留在身后。\n借力 '+c23.ori.bashed+' 次 · 重试 '+c23.retries+' 次\n马里奥：我的公主呢？看来还需要继续。。。');}
 const text=$('c23KeysText');if(text){text.innerHTML='<p><b>移动与跳跃</b>　方向键 / A D 移动；空格跳跃、二段跳或蹬墙；Shift 冲刺。</p><p><b>借力</b>　靠近金色光点或弹体，按住 E / 右键，用方向键或鼠标瞄准，再松开。瞄准期间世界暂停。</p><p><b>气流与竖井</b>　Q 展开羽毛，在气流中上升；贴墙按 W + ↑ 攀爬。J / 左键攻击，L 光之爆破，S 空中践踏。</p><p><b>标准手柄</b>　左摇杆移动；A 跳跃；RB 冲刺；Y 借力；RT 羽毛；LT 攀墙；X / B 攻击；LB 光之爆破。</p><p>P / Esc / Start 暂停；R 重试本段；C / Select 选关；F 全屏。自定义键位请查看“奥日按键设置”。</p>';}
 o30UI();
}
const o30ChromeBase=c23Chrome;c23Chrome=function(){o30ChromeBase();o30Chrome();};
// Optional public enhancement is opt-in. The two-act game uses embedded art/music.
const o30LoadPublicBase=o25LoadPublic;o25LoadPublic=async function(){if(!o30.online)return;return o30LoadPublicBase();};
o27Music.mode='offline';$('o27MusicMode').value='offline';o27CancelProbe();
const opt=document.createElement('label');opt.className='o30-online';opt.innerHTML='<input type="checkbox" id="o30Online"> 启用联网动作与背景增强';o25Panel.querySelector('.o25-resource-inner').prepend(opt);
$('o30Online').onchange=e=>{o30.online=e.target.checked;if(o30.online)o25LoadPublic();};
$('o25RetryAssets').onclick=()=>{o30.online=true;$('o30Online').checked=true;o25LoadPublic();};$('o25RetryAssets').textContent='加载可选增强';
o25Panel.querySelector('.o25-resource-inner>p').textContent='本关完整两段流程、基础角色动作、羽毛与原创配乐已内置。完整动作图集和额外背景可选择联网加载，失败不影响通关。';
const oldnote=o25Panel.querySelector('.o25-note');if(oldnote)oldnote.textContent='非官方同人作品。公开同人角色素材沿用原署名；新增遗迹光影为程序绘制，内置音乐为项目原创，不是奥日原声。';
const audionote=o27Panel.querySelector('.o25-note');if(audionote)audionote.textContent='内置《微光入城》《熔流将至》《归途的灯》随场景切换，均为项目原创。原声外链仅为可选参考，不保证可用。';
$('c23Options').querySelector('p').textContent='练习模式关闭身后熔潮与上涨洪水；地形和机关仍保留。切换后从头开始。';
for(const a of document.querySelectorAll('.footer a')){const h=a.getAttribute('href');if(h&&h.startsWith('../'))a.href='https://aha-xiaoq.github.io/';else if(h==='index.html')a.href='https://aha-xiaoq.github.io/games/mario-mix/';}
window.addEventListener('pagehide',o30Flush);window.addEventListener('blur',o30Flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)o30Flush();});
document.head.append(document.getElementById('ori30-style'));
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R30',chapter14:'Ori / canonical castle, two acts, persistent checkpoints'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test'))window.__ori30={...window.__ori29,build:'R30',saveKey:O30_SAVE_KEY,save:()=>structuredClone(o30.snapshot),persist:()=>o30Capture(),flush:o30Flush,resume:s=>o30Resume(s),validate:s=>{o30Validate(s);return true;},storage:()=>({mode:o30.storage,notice:o30.notice}),hint:o30Help,ui:o30Chrome,online:()=>o30.online};

/* R32: targeted Bash input/feedback patch; horizontal chase removed.
 * Same R31 world, collision geometry, chapter progression and saved-state schema.
 * Timing is a browser-playability tuning, not a claim of original-game frame parity.
 */
const O32_BASH=Object.freeze({holdFrames:150,radius:46,stickDeadzone:.18,mouseDeadzone:4});
const o32Input={source:'keys',bashSource:null,pad:null,padSignature:null,mouseX:null,mouseY:null,pointer:null,drag:null};
function o32Own(source){o32Input.source=source;if(c23?.ori?.bash)c23.ori.bash.source=source;}
function o32HorizontalCalm(){
 if(!c23Is()||!c23||o28.phase!=='horizontal')return;
 c23.chaseStarted=false;c23.chaseAge=0;c23.waveSpeed=0;c23.wave=-4096;
 if(c23.ori)c23.ori.wind=0;
}
const o32ChaseBase=c23ChaseTick;
c23ChaseTick=function(){if(c23Is()){o32HorizontalCalm();return;}return o32ChaseBase();};
const o32WaveBase=o24DrawWave;
o24DrawWave=function(){if(c23Is())return;return o32WaveBase();};
const o32ResetBase=c23ResetScene;
c23ResetScene=function(...args){const r=o32ResetBase(...args);o32HorizontalCalm();return r;};
const o32PreviewBase=c23Preview;
c23Preview=function(...args){const r=o32PreviewBase(...args);o32HorizontalCalm();return r;};
const o32ResumeBase=o30Resume;
o30Resume=function(...args){const ok=o32ResumeBase(...args);o32HorizontalCalm();return ok;};

// Object selection still requires clear line of sight; no through-wall grabbing.
o24NearTargets=function(){
 if(!c23Is()||!c23?.ori)return[];
 const center={x:player.x+player.w*.5,y:player.y+6},vertical=o28IsVertical();
 const candidates=vertical?
 [...o28.lamps.map(n=>({...n,type:'lantern'})),...o28.projectiles.filter(b=>!b.reflected).map(b=>({x:b.x,y:b.y,type:'spirit-shot',ref:b}))]:
 [...O24_LANTERNS.map(n=>({...n,type:'lantern'})),...c23.fire.filter(b=>!b.reflected&&!b.destroy).map(b=>({x:b.x+12,y:b.y+4,type:'fire',ref:b}))];
 candidates.push(...c23.ori.orbs.filter(b=>b.life>0&&!b.reflected).map(b=>({x:b.x,y:b.y,type:'orb',ref:b})));
 return candidates.map(n=>({...n,d:Math.hypot(n.x-center.x,n.y-center.y)}))
 .filter(n=>n.d<=O32_BASH.radius&&(!vertical||n.y<o28.water+5)&&o24LineClear(center,n)).sort((a,b)=>a.d-b.d);
};
function o32Fallback(){const d=Math.hypot(.82,.57);return o28IsVertical()?{x:0,y:-1}:{x:player.facing*.82/d,y:-.57/d};}
function o32Unit(x,y,fallback,deadzone){const d=Math.hypot(x,y);return Number.isFinite(d)&&d>deadzone?{x:x/d,y:y/d}:{...fallback};}
const o32OtherAim=o24Aim;
o24Aim=function(v,target){
 const b=c23?.ori?.bash;
 // Light Burst keeps its previous independent aiming rules.
 if(!b||target!==b)return o32OtherAim(v,target);
 const previous=b.aim||o32Fallback();let x=0,y=0,dz=.01;
 if(v.__o32Native!==true&&(v.ax!==undefined||v.ay!==undefined)){
  return o32Unit(v.ax||0,v.ay||0,previous,O32_BASH.stickDeadzone);
 }
 if(b.source==='mouse'){
  if(!o24Mouse.valid)return {...previous};
  x=o24Mouse.x+b.viewX-b.x;y=o24Mouse.y+b.viewY-b.y;dz=O32_BASH.mouseDeadzone;
 }else if(b.source==='pad'){
  const p=v.__o32Pad||o32Input.pad;
  if(p){x=p.x;y=p.y;}else{x=v.ax??((v.right?1:0)-(v.left?1:0));y=v.ay??((v.down?1:0)-(v.up?1:0));}
  dz=O32_BASH.stickDeadzone;
 }else if(b.source==='touch-drag'&&o32Input.drag){
  x=o32Input.drag.dx;y=o32Input.drag.dy;dz=14;
 }else{
  if(v.__o32Native){
   const held=a=>o24Binds[a].keys.some(k=>keys.has(k))||[...touch.values()].includes(a);
   x=Number(held('right'))-Number(held('left'));y=Number(held('down'))-Number(held('up'));
  }else{x=Number(!!v.right)-Number(!!v.left);y=Number(!!v.down)-Number(!!v.up);}
 }
 return o32Unit(x,y,previous,dz);
};

o24BashStart=function(v){
 const o=c23.ori,target=o24NearTargets()[0];if(!target)return false;
 let source=o32Input.bashSource||o32Input.source;
 if(v.__o32Native!==true)source=(v.ax!==undefined||v.ay!==undefined)?'pad':o24Mouse.valid?'mouse':'keys';
 const b={...target,age:0,aim:o32Fallback(),source,viewX:o28IsVertical()?0:camera,viewY:o28IsVertical()?o28.camY:0,
  entry:{vx:player.vx,vy:player.vy},r32:true};
 o.bash=b;b.aim=o24Aim(v,b);o.bashLock=true;player.vx=0;player.vy=0;
 o.dash=0;o.stomp=0;o.boost=0;o.lightAim=null;o.lightHold=0;o.pose='bash';
 o24Sound('bash');c23Event('ori-bash-aim',{type:target.type,x:target.x,source:b.source});return true;
};
function o32CancelBash(reason='cancel'){
 const o=c23?.ori,b=o?.bash;if(!b)return false;
 if(b.entry){player.vx=b.entry.vx;player.vy=b.entry.vy;}
 o.bash=null;o.bashLock=true;o.boost=0;o.pose=player.grounded?'idle':'jump';
 c23Event('ori-bash-cancel',{reason});return true;
}
const o32ClearBase=c23Clear;
c23Clear=function(){
 // Focus loss, pause and settings cancel instead of firing accidentally.
 const entry=c23?.ori?.bash?.entry;const r=o32ClearBase();
 if(entry&&c23?.ori){player.vx=entry.vx;player.vy=entry.vy;}
 o32Input.bashSource=null;o32Input.pointer=null;o32Input.drag=null;return r;
};
function o32BashTick(v){
 const o=c23.ori,b=o.bash;if(!b)return;
 if(v.bash&&v.jump&&!o.prev.jump){o32CancelBash('jump');o.prev={...v};return;}
 b.aim=o24Aim(v,b);b.age++;
 // No wind-up delay. A quick release launches on the next simulation tick.
 if(!v.bash||b.age>=O32_BASH.holdFrames){o24BashRelease();o32Input.bashSource=null;}
 o.prev={...v};
}
const o32StepBase=c23Step;
c23Step=function(v){
 if(c23Is())o32HorizontalCalm();
 if(c23Is()&&c23?.ori?.bash&&mode==='playing'&&!c23Menu&&!o24Box.open&&['horizontal','flood'].includes(o28.phase)){
  o32BashTick(v);return;
 }
 return o32StepBase(v);
};

// Use a radial deadzone for aiming. Movement keeps the existing acceleration.
const o32ReadBase=c23Input;
c23Input=function(){
 const v=o32ReadBase();if(!c23Is()||c23Menu||o24Box.open||virtualInput)return v;
 const p=c23SafePad();let vec={x:0,y:0};
 if(p){
  let x=Number(p.axes?.[0])||0,y=Number(p.axes?.[1])||0;
  const down=a=>o24Binds[a].pad.some(i=>p.buttons?.[i]?.pressed||p.buttons?.[i]?.value>.5);
  const dx=Number(down('right'))-Number(down('left')),dy=Number(down('down'))-Number(down('up'));
  if(dx||dy){x=dx;y=dy;}
  vec={x,y};const sig={x,y,bash:down('bash')},prev=o32Input.padSignature;
  const moved=Math.hypot(x,y)>O32_BASH.stickDeadzone&&(!prev||Math.hypot(x-prev.x,y-prev.y)>.035);
  if(moved||(sig.bash&&!prev?.bash)){
   o32Own('pad');if(sig.bash&&!prev?.bash)o32Input.bashSource='pad';
   c23Device='手柄';
  }
  o32Input.padSignature=sig;
 }else{o32Input.padSignature=null;}
 o32Input.pad=vec;v.__o32Pad=vec;v.__o32Native=true;return v;
};
function o32CanvasRect(){
 const r=canvas.getBoundingClientRect(),ratio=256/240,w=Math.min(r.width,r.height*ratio),h=w/ratio;
 return {left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h};
}
function o32Point(e){const r=o32CanvasRect();if(!r.width||!r.height)return;
 o24Mouse.x=(e.clientX-r.left)*256/r.width;o24Mouse.y=(e.clientY-r.top)*240/r.height;
 // With capture held, aiming outside the canvas still works.
 o24Mouse.valid=(!!o24Mouse.bash||o24Mouse.x>=0&&o24Mouse.x<=256&&o24Mouse.y>=0&&o24Mouse.y<=240);
}
const o32EventBase=t17Early.handle;
t17Early.handle=function(e){
 if(!c23Is()||c23Menu||o24Box.open)return o32EventBase(e);
 const button=e.target?.closest?.('.touchkey[data-action]');
 const text=e.target?.closest?.('input,textarea,select,[contenteditable="true"]');
 if(e.type==='keydown'&&!e.repeat&&!text&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
  if(['left','right','up','down'].some(a=>o24Binds[a].keys.includes(e.code)))o32Own('keys');
  if(o24Binds.bash.keys.includes(e.code)){
   const directional=['left','right','up','down'].some(a=>o24Binds[a].keys.some(k=>keys.has(k)));
   o32Input.bashSource=!directional&&o24Mouse.valid&&o32Input.source==='mouse'?'mouse':'keys';
  }
 }
 if(button&&e.type==='pointerdown'){
  o32Own('touch');
  if(button.dataset.action==='bash'){
   o32Input.bashSource='touch';o32Input.drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};
  }
 }
 if(e.type==='pointermove'&&o32Input.drag?.id===e.pointerId&&touch.get(e.pointerId)==='bash'){
  const d=o32Input.drag;d.dx=e.clientX-d.x;d.dy=e.clientY-d.y;
  if(Math.hypot(d.dx,d.dy)>14)o32Own('touch-drag');return true;
 }
 if(e.type==='pointercancel'&&(o32Input.pointer===e.pointerId||o32Input.drag?.id===e.pointerId))o32CancelBash('pointer-cancel');
 const mouseEvent=e.pointerType!=='touch'&&e.type.startsWith('pointer')&&(e.target===canvas||o24Mouse.bash||o32Input.pointer===e.pointerId);
 if(mouseEvent&&e.type==='pointermove'){
  const moved=o32Input.mouseX===null||Math.hypot(e.clientX-o32Input.mouseX,e.clientY-o32Input.mouseY)>2;
  if(moved){o32Own('mouse');o32Input.mouseX=e.clientX;o32Input.mouseY=e.clientY;}
 }
 if(mouseEvent&&e.type==='pointerdown'&&e.button===2){
  o32Own('mouse');o32Input.bashSource='mouse';o32Input.pointer=e.pointerId;
  try{canvas.setPointerCapture(e.pointerId);}catch{}
 }
 const result=o32EventBase(e);
 if(mouseEvent&&(e.type==='pointermove'||e.type==='pointerdown'))o32Point(e);
 if(mouseEvent&&e.type==='pointerup'&&e.button===2)o32Input.pointer=null;
 return result;
};
canvas.addEventListener('lostpointercapture',e=>{
 if(o32Input.pointer===e.pointerId&&o24Mouse.bash){o32CancelBash('capture-lost');o24Mouse.bash=false;o32Input.pointer=null;}
});

// One arrow and one countdown in both orientations. It never changes gameplay.
function o32DrawBash(){
 const b=c23?.ori?.bash;if(!c23Is()||!b||mode!=='playing')return;
 const g=ctx,x=b.x-b.viewX,y=b.y-b.viewY,a=Math.atan2(b.aim.y,b.aim.x),remaining=clamp(1-b.age/O32_BASH.holdFrames,0,1);
 g.save();g.setTransform(3,0,0,3,0,0);g.beginPath();g.rect(0,32,256,208);g.clip();
 g.fillStyle='#04121c24';g.fillRect(0,32,256,208);o24Glow(g,x,y,24,'#fff1b8',.22);
 g.lineWidth=.8;g.strokeStyle='#fff4ce';g.beginPath();g.arc(x,y,8.6,0,Math.PI*2);g.stroke();
 g.lineWidth=1.5;g.strokeStyle=remaining<.25?'#ffc486':'#e9e8bb';g.beginPath();g.arc(x,y,12.5,-Math.PI/2,-Math.PI/2+remaining*Math.PI*2);g.stroke();
 g.save();g.translate(x,y);g.rotate(a);g.shadowColor='#f9dfa2';g.shadowBlur=4;
 o24Path(g,[['M',15,-1.15],['L',31,-1.15],['L',28,-4.6],['L',41,0],['L',28,4.6],['L',31,1.15],['L',15,1.15],['Z']],'#fff3c7','#493921',.45);
 g.shadowBlur=0;
 if(b.ref){g.strokeStyle='#b9e3f2bb';g.lineWidth=.8;g.setLineDash([1.8,1.8]);g.beginPath();g.moveTo(-15,0);g.lineTo(-32,0);g.stroke();g.setLineDash([]);g.beginPath();g.moveTo(-27,-3);g.lineTo(-33,0);g.lineTo(-27,3);g.stroke();}
 g.restore();g.restore();
}
const o32DrawBase=c23Draw;c23Draw=function(){o32HorizontalCalm();o32DrawBase();o32DrawBash();};
const o32HelpBase=o30Help;
o30Help=function(){
 if(c23?.ori?.bash&&mode==='playing'){
  const source=c23.ori.bash.source,aim=source==='pad'?'左摇杆选方向':source.startsWith('touch')?'拖动弹射键或按方向键':'鼠标 / 方向键选方向';
  return aim+' · 松开借力弹射 · '+o30Key('jump')+' 取消 · '+Math.max(0,(O32_BASH.holdFrames-c23.ori.bash.age)/60).toFixed(1)+' 秒';
 }
 if(c23Is()&&!c23Menu&&mode==='playing'&&o28.phase==='horizontal'&&!c23.ending&&c23.ticks<240)return '开场没有追赶岩浆 · '+o30Key('jump')+' 跳跃 / 二段跳 · 靠近金色光点，按住借力选方向';
 return o32HelpBase();
};
const o32ChromeBase=c23Chrome;
c23Chrome=function(){
 o32ChromeBase();if(!c23Is())return;
 const help=$('c23KeysText');
 if(help&&!help.querySelector('.o32-bash-note')){
  const p=document.createElement('p');p.className='o32-bash-note';p.textContent='借力瞄准最多 2.5 秒。鼠标或左摇杆可任意选角度，键盘方向键为八方向；松开方向键或摇杆回中会保留箭头。松开借力键弹射，跳跃键取消。触摸可拖动弹射键瞄准。第一场无追赶岩浆，固定岩浆池和第二场洪水仍有危险。';help.append(p);
 }
 const p=$('c23Options')?.querySelector('p');if(p)p.textContent='练习模式关闭第二场上涨洪水；第一场没有追赶岩浆，固定岩浆池、地形与机关保留。切换后从头开始。';
};
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R32',chapter14:'Ori / R31 world + stable Bash aim, no horizontal chase'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 window.__ori32={...window.__ori30,build:'R32',targets:()=>o24NearTargets(),read:()=>c23Input(),update:v=>c23Step(v),render:()=>c23Draw(),
 config:O32_BASH,aimState:()=>{const b=c23?.ori?.bash;return b?{age:b.age,aim:{...b.aim},source:b.source,viewX:b.viewX,viewY:b.viewY}:null;},
 cancel:o32CancelBash,input:()=>structuredClone(o32Input),canvasRect:o32CanvasRect};
}
