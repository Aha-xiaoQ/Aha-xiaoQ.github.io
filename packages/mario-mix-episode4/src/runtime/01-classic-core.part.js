/* CLASSIC LOCAL 1-1. Browser implementation derived from the prior local build.
 * Selected FullScreenMario pixel data is included with upstream MIT notice.
 * Game/character artwork rights remain with their respective rights holders.
 * This is not a ROM emulator.
 */
(()=>{
const $=id=>document.getElementById(id), canvas=$('game'), ctx=canvas.getContext('2d',{alpha:false});
if(!ctx)throw new Error('浏览器无法创建 Canvas 2D。请用 Chrome 或 Edge 打开此文件。');
ctx.imageSmoothingEnabled=false;
const T=16,W=256,H=240,FLOOR=208,LEVEL_WIDTH=212*T,FLAG_X=198*T+8;
const C={sky:'#74bfd0',skyLight:'#a7dce0',cloud:'#f4f5d9',cloudShade:'#c5e2d8',far:'#589e99',hill:'#397e76',hillLight:'#60a087',bush:'#306b58',leaf:'#5a9570',earth:'#866147',earthLight:'#ba8861',earthDark:'#5b4539',brick:'#c8794c',brickLight:'#efb875',brickDark:'#884b37',gold:'#efbd5c',goldDark:'#ad773d',ink:'#263e45',pipe:'#2e8075',pipeDark:'#20534f',pipeLight:'#71b397',cream:'#fff0c5',night:'#172d42'};
const font={
'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],'G':['01111','10000','10000','10111','10001','10001','01110'],'H':['10001','10001','10001','11111','10001','10001','10001'],'I':['111','010','010','010','010','010','111'],'J':['00111','00010','00010','00010','10010','10010','01100'],'K':['10001','10010','10100','11000','10100','10010','10001'],'L':['10000','10000','10000','10000','10000','10000','11111'],'M':['10001','11011','10101','10101','10001','10001','10001'],'N':['10001','11001','11001','10101','10011','10011','10001'],'O':['01110','10001','10001','10001','10001','10001','01110'],'P':['11110','10001','10001','11110','10000','10000','10000'],'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],'S':['01111','10000','10000','01110','00001','00001','11110'],'T':['11111','00100','00100','00100','00100','00100','00100'],'U':['10001','10001','10001','10001','10001','10001','01110'],'V':['10001','10001','10001','10001','10001','01010','00100'],'W':['10001','10001','10001','10101','10101','11011','10001'],'X':['10001','10001','01010','00100','01010','10001','10001'],'Y':['10001','10001','01010','00100','00100','00100','00100'],'Z':['11111','00001','00010','00100','01000','10000','11111'],
'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],'?':['01110','10001','00001','00010','00100','00000','00100'],'!':['1','1','1','1','1','0','1'],'-':['00000','00000','00000','11111','00000','00000','00000'],'.':['0','0','0','0','0','1','1'],':':['0','1','1','0','1','1','0'],'/':['00001','00001','00010','00100','01000','10000','10000'],'+':['00000','00100','00100','11111','00100','00100','00000'],' ':['000','000','000','000','000','000','000']};
function text(str,x,y,color=C.cream,scale=1,center=false){str=String(str).toUpperCase();let wid=0;for(const ch of str)wid+=((font[ch]||font['?'])[0].length+1)*scale;if(center)x-=Math.floor(wid/2);ctx.fillStyle=color;for(const ch of str){const glyph=font[ch]||font['?'];glyph.forEach((row,r)=>{for(let c=0;c<row.length;c++)if(row[c]==='1')ctx.fillRect(Math.round(x+c*scale),Math.round(y+r*scale),scale,scale)});x+=(glyph[0].length+1)*scale;}}
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function polygon(points,col){ctx.fillStyle=col;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}function approach(n,target,step){return n<target?Math.min(n+step,target):Math.max(n-step,target)}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function hash(x,y=0){let n=(x*374761393+y*668265263)|0;n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967295;}
const save={get(k,d){try{return localStorage.getItem('mario.mix.classic.'+k)||d}catch{return d}},set(k,v){try{localStorage.setItem('mario.mix.classic.'+k,String(v))}catch{}}};
/* CLASSIC AUDIO 2.0 — source recordings, not oscillator approximations.
 * Music/SFX sources: umaim/Mario at pinned commit, plus reruns/mario stomp.
 * Upstream code licensing is not a grant of Nintendo's music/image rights.
 * Downloader: read-only GETs; never sends gameplay, personal files or account data.
 */
const AUDIO_MANIFEST = JSON.parse(document.getElementById('audio-manifest').textContent);
const INLINE_AUDIO = JSON.parse(document.getElementById('audio-inline').textContent || '{}');
const ORIGINAL_PAGE = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
let audio=null,master=null,soundOn=save.get('sound','1')==='1',melodyStep=0,musicClock=0;
let musicVolume=Number(save.get('musicVolume','.48')),effectsVolume=Number(save.get('effectsVolume','.72'));
let musicBus=null,effectsBus=null,uiBus=null,analyser=null;
const bank=new Map(),rawAudio=new Map(),voices=new Set(),audioLog=[];
let bgm=null,heldTrack=null,loadingAudio=null,audioBusy=false,audioFailed=[],audioDBPromise=null;
let audioPrevMode='menu',audioPrevRoom='surface',clearPlayed=false,gameoverPlayed=false,hurryPlayed=false,holdUntil=0,deathUntil=0,flagUntil=0;
let lastTally=-1,mutedNotice=false;
function audioLogEvent(type,key,extra={}){audioLog.push({type,key,frame,at:audio?audio.currentTime:0,...extra});if(audioLog.length>600)audioLog.shift();}
function setGain(g,value,time=.012){if(!g||!audio)return;g.gain.cancelScheduledValues(audio.currentTime);g.gain.setTargetAtTime(value,audio.currentTime,time);}
function mixAudio(){setGain(master,soundOn?.78:0);setGain(musicBus,clamp(musicVolume,0,1));setGain(effectsBus,mode==='paused'?0:clamp(effectsVolume,0,1));setGain(uiBus,clamp(effectsVolume,0,1));}
function audioInit(resume=true){
 try{
  if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('浏览器不支持 Web Audio');
   audio=new AC({latencyHint:'interactive'});master=audio.createGain();master.gain.value=soundOn?.78:0;
   musicBus=audio.createGain();effectsBus=audio.createGain();uiBus=audio.createGain();
   musicBus.connect(master);effectsBus.connect(master);uiBus.connect(master);
   const limiter=audio.createDynamicsCompressor();limiter.threshold.value=-4;limiter.knee.value=0;limiter.ratio.value=20;limiter.attack.value=.003;limiter.release.value=.1;
   analyser=audio.createAnalyser();analyser.fftSize=1024;master.connect(limiter);limiter.connect(analyser);analyser.connect(audio.destination);mixAudio();
  }
  if(resume&&audio.state==='suspended')audio.resume().then(audioSync).catch(()=>{});
 }catch(e){audioStatus('声音初始化失败；游戏仍可静音运行。');return null;}
 return audio;
}
function decode64(s){const str=atob(s.replace(/\s/g,'')),a=new Uint8Array(str.length);for(let i=0;i<str.length;i++)a[i]=str.charCodeAt(i);return a.buffer;}
function encode64(a){let s='';const b=new Uint8Array(a);for(let i=0;i<b.length;i+=16384)s+=String.fromCharCode(...b.subarray(i,i+16384));return btoa(s);}
async function verifyAudio(a,m){
 if(a.byteLength!==m.size)throw new Error(m.name+'：文件大小不符');
 if(globalThis.crypto?.subtle){const header=new TextEncoder().encode('blob '+a.byteLength+'\0'),payload=new Uint8Array(header.length+a.byteLength);payload.set(header);payload.set(new Uint8Array(a),header.length);
  const digest=await crypto.subtle.digest('SHA-1',payload),hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hex!==m.sha)throw new Error(m.name+'：源文件校验失败');}
 return a;
}
function openAudioDB(){if(audioDBPromise)return audioDBPromise;audioDBPromise=new Promise(resolve=>{
 try{const r=indexedDB.open('mario-classic-source-audio-v2',1);r.onupgradeneeded=()=>r.result.createObjectStore('blobs');r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);r.onblocked=()=>resolve(null);}catch{resolve(null);}
 });return audioDBPromise;}
async function cacheRead(sha){const db=await openAudioDB();if(!db)return null;return new Promise(resolve=>{try{const r=db.transaction('blobs').objectStore('blobs').get(sha);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null);}catch{resolve(null);}});}
async function cacheWrite(sha,a){const db=await openAudioDB();if(!db)return;try{db.transaction('blobs','readwrite').objectStore('blobs').put(a,sha);}catch{}}
async function fetchAudioUrl(url,isAPI){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),16000);try{const r=await fetch(url,{signal:ctrl.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw new Error('HTTP '+r.status);if(isAPI){const j=await r.json();if(j.encoding!=='base64'||!j.content)throw new Error('音频返回格式错误');return decode64(j.content);}return await r.arrayBuffer();}finally{clearTimeout(timer);}}
async function obtainAudio(m){
 if(rawAudio.has(m.key))return rawAudio.get(m.key);
 if(INLINE_AUDIO[m.key])return verifyAudio(decode64(INLINE_AUDIO[m.key]),m);
 if(m.local)return verifyAudio(await fetchAudioUrl(m.local,false),m);
 const cached=await cacheRead(m.sha);if(cached){try{return await verifyAudio(cached,m);}catch{}}
 let lastError;
 for(const [url,isAPI] of [[m.url,false],[m.api,true]]){try{const a=await verifyAudio(await fetchAudioUrl(url,isAPI),m);cacheWrite(m.sha,a);return a;}catch(e){lastError=e;}}
 throw new Error(m.name+'：'+(lastError?.message||'下载失败'));
}
async function installAudio(m,a){
 await verifyAudio(a,m);const ac=audioInit(false);if(!ac)throw new Error('无法解码音频');
 const buffer=await ac.decodeAudioData(a.slice(0));let peak=0;
 for(let ch=0;ch<buffer.numberOfChannels;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));}
 if(peak<1e-6)throw new Error(m.name+'：空音轨');
 // Normalization is a gain adjustment only: no lossy transcoding or pitch change.
 const gain=Math.min(2,.72/Math.max(.05,peak));
 rawAudio.set(m.key,a);bank.set(m.key,{buffer,gain});audioLogEvent('loaded',m.key,{duration:buffer.duration});
}
function audioStatus(message){const n=$('audioStatus');if(n)n.textContent=message;}
function updateAudioPanel(){
 const total=AUDIO_MANIFEST.length,count=AUDIO_MANIFEST.filter(m=>bank.has(m.key)).length;const button=$('exportAudio');if(button)button.disabled=count!==total;
 if(audioBusy)audioStatus('正在加载音频 '+count+' / '+total+'…');
 else if(count===total)audioStatus(Object.keys(INLINE_AUDIO).length===total?'完整音频已内嵌 · 可断网试玩':'音频已就绪');
 else if(audioFailed.length)audioStatus('有 '+audioFailed.length+' 项音频未就绪。请刷新页面重试；游戏仍可静音游玩。');
 else audioStatus('共提供 '+total+' 项音乐与音效，开始后启用。');
 const b=$('prepareAudio');if(b){b.disabled=audioBusy;b.textContent=audioBusy?'加载中…':count===total?'重新检查音频':'加载 / 重试音频';}
 const indicator=$('audioBadge');if(indicator)indicator.textContent=count===total?'AUDIO READY':'AUDIO '+count+'/'+total;
}
async function prepareAudio(){
 if(loadingAudio)return loadingAudio;
 audioBusy=true;audioFailed=[];updateAudioPanel();
 loadingAudio=(async()=>{const todo=AUDIO_MANIFEST.filter(m=>!bank.has(m.key));let i=0;
  async function worker(){while(i<todo.length){const m=todo[i++];try{await installAudio(m,await obtainAudio(m));}catch(e){audioFailed.push({key:m.key,error:e.message});audioLogEvent('error',m.key,{error:e.message});}updateAudioPanel();}}
  await Promise.all([worker(),worker(),worker()]);audioBusy=false;loadingAudio=null;updateAudioPanel();audioSync();return {loaded:bank.size,failed:audioFailed.slice()};})();
 return loadingAudio;
}
function stopVoice(v){if(!v)return;try{v.node.stop();}catch{}try{v.node.disconnect();v.gain.disconnect();}catch{}voices.delete(v);}
function stopEffects(){for(const v of [...voices])stopVoice(v);}
function oneShot(key,options={}){
 if(!soundOn||!audio||!bank.has(key))return 0;
 if(mode==='paused'&&!options.ui)return 0;
 const item=bank.get(key),rate=options.rate||1,offset=options.offset||0,duration=Math.min(item.buffer.duration-offset,options.duration||item.buffer.duration);
 if(duration<=0)return 0;
 if(voices.size>=12)stopVoice(voices.values().next().value);
 const node=audio.createBufferSource(),gain=audio.createGain();node.buffer=item.buffer;node.playbackRate.value=rate;gain.gain.value=item.gain*(options.volume??1);
 node.connect(gain);gain.connect(options.ui?uiBus:effectsBus);
 const v={node,gain,key};voices.add(v);const at=audio.currentTime+(options.delay||0);node.start(at,offset,duration);
 node.onended=()=>{voices.delete(v);node.disconnect();gain.disconnect();};audioLogEvent('effect',key,{delay:options.delay||0});return at+duration/rate;
}
function stopMusic(remember=false){
 if(!bgm)return;
 if(remember)heldTrack={key:bgm.key,offset:(bgm.offset+Math.max(0,audio.currentTime-bgm.started))%bgm.duration};else heldTrack=null;
 try{bgm.node.stop();bgm.node.disconnect();bgm.gain.disconnect();}catch{}audioLogEvent('music-stop',bgm.key);bgm=null;
}
function playMusic(key){
 if(bgm?.key===key||!bank.has(key)||!audio||!soundOn)return;
 const offset=heldTrack?.key===key?heldTrack.offset:0;stopMusic(false);heldTrack=null;
 const item=bank.get(key),node=audio.createBufferSource(),gain=audio.createGain();node.buffer=item.buffer;node.loop=true;gain.gain.value=item.gain;
 node.connect(gain);gain.connect(musicBus);node.start(0,offset%item.buffer.duration);bgm={key,node,gain,offset,started:audio.currentTime,duration:item.buffer.duration};audioLogEvent('music-start',key,{offset});
}
function desiredMusic(){if(mode!=='playing')return null;const base=player?.star?'star':room==='under'?'underworld':'overworld';return (timeLeft<100?'hurry_':'')+base;}
function audioSync(){
 if(!audio)return;
 if(mode==='paused'||document.hidden){stopMusic(true);return;}
 if(!soundOn){stopMusic(true);return;}
 if(mode==='gameover'&&!gameoverPlayed&&bank.has('gameover')){gameoverPlayed=true;oneShot('gameover',{delay:Math.max(0,deathUntil-audio.currentTime)});}
 if(mode==='flag'&&flagPhase>=1&&!clearPlayed&&bank.has('clear')){clearPlayed=true;oneShot('clear',{delay:Math.max(0,flagUntil-audio.currentTime)});}
 if(mode==='playing'&&timeLeft<100&&!hurryPlayed&&bank.has('hurry')){hurryPlayed=true;stopMusic(false);holdUntil=oneShot('hurry');}
 const key=desiredMusic();
 if(!key||audio.currentTime<holdUntil){stopMusic(false);}
 else playMusic(key);
 audioPrevMode=mode;audioPrevRoom=room;
}
function resetGameAudio(){stopMusic(false);stopEffects();heldTrack=null;clearPlayed=false;gameoverPlayed=false;hurryPlayed=false;holdUntil=0;deathUntil=0;flagUntil=0;lastTally=-1;audioPrevMode='menu';}
function sfx(name){
 const mapping={jump:player?.power?'jump_super':'jump_small',coin:'coin',bump:'bump',break:'break',stomp:'stomp',kick:'kick',fire:'fire',power:'powerup',appear:'appear',life:'oneup',hurt:'hurt',pipe:'pipe',firework:'firework'};
 if(name==='star'){stopMusic(false);return;}
 if(name==='die'){stopMusic(false);stopEffects();deathUntil=oneShot('death');return;}
 if(name==='win'){stopMusic(false);stopEffects();flagUntil=oneShot('flag');return;}
 if(name==='tally'){if(frame-lastTally<6)return;lastTally=frame;oneShot('coin',{duration:.027,volume:.34});return;}
 const key=mapping[name];if(key)oneShot(key);
}
function music(){audioSync();}
function setSoundEnabled(on){soundOn=!!on;save.set('sound',soundOn?'1':'0');audioInit();if(!soundOn){stopEffects();stopMusic(true);}mixAudio();audioSync();updateUi(true);}
function downloadText(filename,text,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function wireAudioUI(){
 $('prepareAudio').addEventListener('click',()=>{audioInit();prepareAudio();});
 for(const [id,which] of [['musicVolume','music'],['effectsVolume','effects']]){const el=$(id);el.value=Math.round((which==='music'?musicVolume:effectsVolume)*100);$(id+'Value').textContent=el.value+'%';el.addEventListener('input',()=>{const v=Number(el.value)/100;if(which==='music')musicVolume=v;else effectsVolume=v;save.set(id,v);$(id+'Value').textContent=el.value+'%';mixAudio();});}
 document.addEventListener('visibilitychange',()=>{if(!audio)return;if(document.hidden){stopMusic(true);audio.suspend().catch(()=>{});}else if(mode!=='paused'){audio.resume().then(audioSync).catch(()=>{});}});
 updateAudioPanel();if(!(new URLSearchParams(location.search).has('test')||document.documentElement.dataset.test==='1'))setTimeout(prepareAudio,0);
}

let tiles=new Map(),surface=null,underground=null,enemies=[],items=[],shots=[],particles=[],floaters=[],looseCoins=[],pipes=[],camera=0,room='surface',mode='menu',frame=0,score=0,coins=0,lives=3,timeLeft=400,timerTicks=0,checkpoint=0,freeze=0,deathTick=0,pipeTransition=null,flagPhase=0,flagTimer=0,flagY=48,flagBonus=0,flagTime=0,fireworks=0,best=Number(save.get('best','0'))||0,player=null;
let jumpHeldPrev=false,runHeldPrev=false,jumpBuffer=0,virtualInput=null,manual=false,lastUi=-1,maxProgress=0;
const keys=new Set(),touch=new Map();let padPreviousPause=false;
function getInput(){if(virtualInput)return {...virtualInput};const t={left:false,right:false,down:false,jump:false,run:false};for(const a of touch.values())t[a]=true;t.left ||=keys.has('ArrowLeft')||keys.has('KeyA');t.right ||=keys.has('ArrowRight')||keys.has('KeyD');t.down ||=keys.has('ArrowDown')||keys.has('KeyS');t.jump ||=keys.has('Space')||keys.has('KeyK')||keys.has('KeyZ')||keys.has('ArrowUp')||keys.has('KeyW');t.run ||=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyJ')||keys.has('KeyX');try{const pads=navigator.getGamepads?.();const p=pads&&Array.from(pads).find(Boolean);if(p){t.left ||=p.axes[0]<-.3||p.buttons[14]?.pressed;t.right ||=p.axes[0]>.3||p.buttons[15]?.pressed;t.down ||=p.axes[1]>.4||p.buttons[13]?.pressed;t.jump ||=p.buttons[0]?.pressed;t.run ||=p.buttons[1]?.pressed||p.buttons[2]?.pressed;const pause=!!p.buttons[9]?.pressed;padPreviousPause=pause;}}catch{}return t;}
function tileKey(x,y){return x+','+y}function put(map,x,y,type,content=null){const tile={x,y,type,content,bump:0,used:false,count:content==='multi'?10:1};map.set(tileKey(x,y),tile);return tile}
function at(tx,ty,hidden=false){const t=tiles.get(tileKey(tx,ty));return t&&(!t.hidden||hidden)?t:null}
function solids(box,hidden=false){const out=[];for(let y=Math.floor(box.y/T);y<=Math.floor((box.y+box.h-.001)/T);y++)for(let x=Math.floor(box.x/T);x<=Math.floor((box.x+box.w-.001)/T);x++){const t=at(x,y,hidden);if(t)out.push(t)}return out;}
function setSize(power){const bottom=player.y+player.h;player.power=power;player.h=power?28:14;player.y=bottom-player.h;player.crouch=false;}
function createPlayer(x=44,y=194){return{x,y,w:10,h:14,vx:0,vy:0,grounded:false,facing:1,power:0,crouch:false,invuln:0,star:0,combo:0,anim:0,fireCd:0,jumpG:.125,fallG:.4375,airCap:1.5};}
function buildLevel(){
const m=new Map();const gaps=[[69,71],[86,89],[153,155]];
for(let x=0;x<212;x++)if(!gaps.some(([a,b])=>x>=a&&x<b))for(let y=13;y<15;y++)put(m,x,y,'ground');
const b=(x,y,type='brick',content=null)=>put(m,x,y,type,content);
b(16,9,'question','coin');b(20,9);b(21,9,'question','power');b(22,9);b(23,9,'question','coin');b(24,9);b(22,5,'question','coin');
b(64,8,'question','life').hidden=true;
b(77,9);b(78,9,'question','power');b(79,9);for(let x=80;x<=87;x++)b(x,5);for(let x=91;x<=93;x++)b(x,5);b(94,5,'question','coin');b(94,9,'brick','multi');b(100,9);b(101,9,'brick','star');[106,109,112].forEach(x=>b(x,9,'question','coin'));b(109,5,'question','power');b(118,9);[121,122,123].forEach(x=>b(x,5));b(128,5);b(129,5,'question','coin');b(130,5,'question','coin');b(131,5);b(129,9);b(130,9);[168,169,171].forEach(x=>b(x,9));b(170,9,'question','coin');
for(let i=0;i<4;i++){for(let j=0;j<=i;j++)b(134+i,12-j,'stone');for(let j=0;j<4-i;j++)b(140+i,12-j,'stone')}
for(let i=0;i<5;i++)for(let j=0;j<Math.min(i+1,4);j++)b(148+i,12-j,'stone');
for(let i=0;i<4;i++)for(let j=0;j<4-i;j++)b(155+i,12-j,'stone');
for(let i=0;i<9;i++)for(let j=0;j<Math.min(i+1,8);j++)b(181+i,12-j,'stone');
b(198,12,'stone');
const ps=[{x:28,h:2},{x:38,h:3},{x:46,h:4},{x:57,h:4,entrance:true},{x:163,h:2,exit:true},{x:179,h:2}];
for(const p of ps){p.y=(13-p.h)*T;p.w=32;for(let x=p.x;x<p.x+2;x++)for(let y=13-p.h;y<13;y++)b(x,y,'pipe');p.x*=T;}
const es=[];const enemy=(x,y,type='walker')=>es.push({x:x*T+1,y:y*T+(type==='turtle'?-6:0),w:14,h:type==='turtle'?22:14,vx:-.5,vy:0,type,active:false,dead:0,flipped:false,shell:false,shellTimer:0,combo:0,safe:0,anim:0});
[21,41,53,55,95,97,124,125,127,129,174,175].forEach(x=>enemy(x,12));enemy(79,7);enemy(82,4);enemy(106,12,'turtle');
return{tiles:m,pipes:ps,enemies:es,items:[],coins:[]};}
function buildUnder(){const m=new Map(),cs=[];for(let x=0;x<16;x++)for(let y=13;y<15;y++)put(m,x,y,'ground');for(let y=2;y<13;y++){put(m,0,y,'bluebrick');put(m,15,y,'bluebrick')}for(let x=0;x<16;x++)put(m,x,2,'bluebrick');for(let x=4;x<11;x++)put(m,x,12,'bluebrick');for(let x=4;x<11;x++){cs.push({x:x*T+4,y:7*T+2,w:8,h:12});cs.push({x:x*T+4,y:9*T+2,w:8,h:12});if(x>4&&x<10)cs.push({x:x*T+4,y:5*T+2,w:8,h:12})}for(let y=3;y<11;y++){put(m,13,y,'pipe');put(m,14,y,'pipe')}return{tiles:m,pipes:[],enemies:[],items:[],coins:cs};}
function loadRoom(r){room=r;let q=r==='surface'?surface:underground;tiles=q.tiles;pipes=q.pipes;enemies=q.enemies;items=q.items;looseCoins=q.coins;shots=[];particles=[];floaters=[];camera=0;}
function resetLife(){surface=buildLevel();underground=buildUnder();loadRoom('surface');player=createPlayer(checkpoint?80*T:44);camera=checkpoint?Math.max(0,player.x-32):0;frame=0;timeLeft=400;timerTicks=0;freeze=0;deathTick=0;flagPhase=0;flagY=48;pipeTransition=null;maxProgress=Math.max(maxProgress,player.x);jumpHeldPrev=false;runHeldPrev=false;jumpBuffer=0;mode='playing';hideOverlay();updateUi(true);}
function startGame(){audioInit();keys.clear();touch.clear();document.querySelectorAll('.touchkey').forEach(b=>b.classList.remove('pressed'));score=0;coins=0;lives=3;checkpoint=0;maxProgress=0;melodyStep=0;musicClock=0;resetLife();canvas.focus({preventScroll:true});}
function showOverlay(label,title,body,button,hint='ENTER / SPACE'){const o=$('overlay');o.classList.remove('hidden');$('overlayLabel').textContent=label;$('overlayTitle').innerHTML=title;$('overlayText').innerHTML=body;$('mainAction').textContent=button;$('overlayHint').textContent=hint;}
function hideOverlay(){$('overlay').classList.add('hidden')}
function togglePause(){if(mode==='playing'){mode='paused';keys.clear();touch.clear();showOverlay('TAKE A BREATHER','PAUSED.','冒险暂时停在这里。<br>准备好了就继续出发。','继续冒险 →','P / ESC / ENTER TO RESUME')}else if(mode==='paused'){mode='playing';hideOverlay();canvas.focus({preventScroll:true});audioInit()}updateUi(true)}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2500)}
function addScore(n,x,y){score+=n;if(x!==undefined)floaters.push({text:String(n),x,y,life:48});if(score>best){best=score;save.set('best',best)}}
function getCoin(x,y,pop=false){coins++;addScore(200);sfx('coin');if(pop)particles.push({kind:'coin',x:x+4,y:y-12,vx:0,vy:-2.8,life:34});else for(let i=0;i<5;i++)particles.push({kind:'spark',x:x+4,y:y+6,vx:(i-2)*.4,vy:-1.5+Math.abs(i-2)*.25,life:20});if(coins>=100){coins-=100;lives++;sfx('life');floaters.push({text:'1UP',x,y,life:70})}}
function bumpTile(t){if(t.type==='ground'||t.type==='stone'||t.type==='pipe'||t.type==='bluebrick')return;if(t.bump>0)return;t.hidden=false;if(t.used){sfx('bump');return}t.bump=12;
for(const e of enemies){if(!e.dead&&e.active&&e.x+e.w>t.x*T&&e.x<(t.x+1)*T&&Math.abs(e.y+e.h-t.y*T)<5)killEnemy(e,true,100)}
for(const it of items)if(it.emerge<=0&&it.x+it.w>t.x*T&&it.x<(t.x+1)*T&&Math.abs(it.y+it.h-t.y*T)<5){it.vy=-3;it.vx=(player.x<it.x?1:-1)*.8}
if(t.content){if(t.content==='coin'||t.content==='multi'){getCoin(t.x*T,t.y*T,true);t.count--;if(!t.count){t.used=true;t.content=null}}else{let type=t.content==='power'?(player.power?'flower':'mushroom'):t.content;items.push({type,x:t.x*T+1,y:t.y*T+1,targetY:t.y*T-14,w:14,h:14,vx:type==='flower'?0:.75,vy:0,emerge:32,active:true});t.used=true;t.content=null;sfx('appear')}return}
if(t.type==='brick'&&player.power){tiles.delete(tileKey(t.x,t.y));addScore(50);sfx('break');for(let i=0;i<4;i++)particles.push({kind:'debris',x:t.x*T+(i%2)*8,y:t.y*T+Math.floor(i/2)*8,w:7,h:7,vx:(i%2?1:-1)*(1.1+Math.floor(i/2)*.5),vy:-3.5-Math.floor(i/2)*.8,life:70})}else sfx('bump');}
function moveBody(b,dx,dy,isPlayer=false){b.grounded=false;b.x+=dx;let hits=solids(b);if(hits.length){if(dx>0)b.x=Math.min(...hits.map(t=>t.x*T-b.w));else if(dx<0)b.x=Math.max(...hits.map(t=>(t.x+1)*T));b.vx=isPlayer?0:-b.vx;if(!isPlayer&&b.type==='shot'){b.dead=true;return}}
b.y+=dy;hits=solids(b,isPlayer&&dy<0);if(hits.length){if(dy>0){b.y=Math.min(...hits.map(t=>t.y*T-b.h));b.grounded=true;b.vy=0}else if(dy<0){const bottom=Math.max(...hits.map(t=>(t.y+1)*T));b.y=bottom;b.vy=.5;if(isPlayer){const relevant=hits.filter(t=>(t.y+1)*T===bottom).sort((a,c)=>Math.abs((a.x+.5)*T-(b.x+b.w/2))-Math.abs((c.x+.5)*T-(b.x+b.w/2)));if(relevant[0])bumpTile(relevant[0])}}}
}
function killEnemy(e,flip=false,points=100){if(e.dead)return;e.dead=flip?90:24;e.flipped=flip;e.vy=-3.1;e.vx=flip?(player.x<e.x?1.2:-1.2):0;addScore(points,e.x,e.y-8);sfx(flip?'kick':'stomp')}
function damage(){if(mode!=='playing'||player.invuln||player.star)return;if(player.power){setSize(0);player.invuln=120;freeze=22;sfx('hurt')}else die()}
function die(){if(mode!=='playing')return;mode='dying';deathTick=0;player.vx=0;player.vy=-5.1;lives--;sfx('die');updateUi(true)}
function shoot(){if(player.power!==2||player.fireCd>0||shots.filter(s=>!s.dead).length>=2)return;shots.push({type:'shot',x:player.x+(player.facing>0?player.w:-4),y:player.y+10,w:5,h:5,vx:player.facing*3.4,vy:1.2,dead:false,life:160});player.fireCd=12;sfx('fire')}
function transform(it){if(it.type==='life'){lives++;floaters.push({text:'1UP',x:it.x,y:it.y,life:70});sfx('life');return}if(it.type==='star'){player.star=600;addScore(1000,it.x,it.y);sfx('star');return}const next=it.type==='flower'?(player.power?2:1):Math.max(1,player.power);setSize(next);freeze=22;player.invuln=Math.max(player.invuln,30);addScore(1000,it.x,it.y);sfx('power')}
function beginPipe(){const p=pipes.find(p=>p.entrance&&Math.abs(player.y+player.h-p.y)<1&&player.x+player.w/2>p.x+9&&player.x+player.w/2<p.x+23);if(!p)return false;mode='pipe';pipeTransition={kind:'down',t:0,startY:player.y,pipe:p};player.vx=0;player.vy=0;player.x=p.x+16-player.w/2;sfx('pipe');return true;}
function advancePipe(){let q=pipeTransition;q.t++;if(q.kind==='down'){player.y=q.startY+q.t*.8;if(q.t>=56){loadRoom('under');player.x=2*T;player.y=3*T;player.vx=0;player.vy=0;player.grounded=false;mode='playing';pipeTransition=null;updateUi(true)}}else if(q.kind==='right'){player.x+=.7;if(q.t>=40){loadRoom('surface');const p=pipes.find(p=>p.exit);camera=p.x-56;player.x=p.x+16-player.w/2;player.y=p.y+2;player.vx=0;player.vy=0;pipeTransition={kind:'up',t:0,startY:player.y,target:p.y-player.h};sfx('pipe')}}else if(q.kind==='up'){player.y=Math.max(q.target,player.y-.7);if(player.y<=q.target){mode='playing';pipeTransition=null;player.grounded=true;player.invuln=45;updateUi(true)}}}
function beginFlag(){mode='flag';flagPhase=0;flagTimer=0;flagTime=timeLeft;flagBonus=player.y<62?5000:player.y<100?2000:player.y<140?800:player.y<176?400:100;addScore(flagBonus,FLAG_X-18,player.y);player.x=FLAG_X-player.w;player.vx=0;player.vy=0;player.facing=1;sfx('win');updateUi(true)}
function advanceFlag(){flagTimer++;if(flagPhase===0){player.y=Math.min(FLOOR-16-player.h,player.y+1.5);flagY=Math.min(177,flagY+1.8);if(player.y>=FLOOR-16-player.h&&flagY>=177){flagPhase=1;flagTimer=0;player.x=FLAG_X+4;player.vy=-1.8}}else if(flagPhase===1){player.vx=1;player.vy=Math.min(4.25,player.vy+.28);moveBody(player,player.vx,player.vy);player.anim+=1;if(player.x>=204*T+8){flagPhase=2;flagTimer=0}}else if(flagPhase===2){if(timeLeft>0){const n=Math.min(4,timeLeft);timeLeft-=n;addScore(n*50);if(frame%8===0)sfx('tally')}else{fireworks=[1,3,6].includes(flagTime%10)?flagTime%10:0;flagPhase=3;flagTimer=0}}else if(flagPhase===3){if(flagTimer%26===1&&fireworks>0){const i=fireworks--;addScore(500);for(let j=0;j<24;j++){let a=j*Math.PI/12;particles.push({kind:'spark',x:FLAG_X+42+(i%3)*15,y:48+(i%3)*15,vx:Math.cos(a)*1.8,vy:Math.sin(a)*1.8,life:32})}sfx('firework')}if(flagTimer>Math.max(80,(flagTime%10)*28)){mode='win';save.set('best',Math.max(best,score));showOverlay('WORLD 1-1 COMPLETE','NICELY<br>DONE.','终点到了，冒险没有结束。<br>得分 '+String(score).padStart(6,'0')+' · 金币 '+coins+' · 剩余生命 '+lives,'再跑一次 →','ENTER / SPACE TO REPLAY');updateUi(true)}}}
function updatePlayer(input){const p=player,wasGround=p.grounded,prevBottom=p.y+p.h;const direction=(input.right?1:0)-(input.left?1:0);if(p.invuln)p.invuln--;if(p.star)p.star--;if(p.fireCd)p.fireCd--;
if(input.jump&&!jumpHeldPrev)jumpBuffer=3;else if(jumpBuffer>0)jumpBuffer--;
if(input.run&&!runHeldPrev)shoot();
if(p.power){let crouch=!!input.down&&wasGround;const target=crouch?16:28;if(target!==p.h){const candidate={x:p.x,y:p.y+p.h-target,w:p.w,h:target};if(target<p.h||!solids(candidate).length){p.y=candidate.y;p.h=target;p.crouch=crouch}}}
if(wasGround&&input.down&&room==='surface'&&beginPipe()){jumpHeldPrev=!!input.jump;runHeldPrev=!!input.run;return}
const max=wasGround?(input.run?2.5:1.5):p.airCap,accel=(input.run||(!wasGround&&p.airCap>1.5))?.0556640625:.037109375;
if(direction&&!p.crouch){if(Math.sign(p.vx)&&Math.sign(p.vx)!==direction)p.vx=approach(p.vx,direction*max,.1015625);else p.vx=approach(p.vx,direction*max,accel);p.facing=direction;}else if(wasGround)p.vx=approach(p.vx,0,.05078125);
if(jumpBuffer>0&&wasGround){let speed=Math.abs(p.vx);p.vy=speed>2.25?-5.1666667:-4.1333333;p.jumpG=speed>2.25?.15625:speed>1?.1171875:.125;p.fallG=speed>2.25?.5625:speed>1?.375:.4375;p.airCap=speed>1.5?2.5:1.5;p.grounded=false;jumpBuffer=0;sfx('jump')}
p.vy=Math.min(4.25,p.vy+((p.vy<0&&input.jump)?p.jumpG:p.fallG));moveBody(p,p.vx,p.vy,true);
if(p.x<camera+2){p.x=camera+2;p.vx=Math.max(0,p.vx)}
if(p.grounded){p.combo=0;p.airCap=input.run?2.5:1.5}p.anim+=Math.abs(p.vx);jumpHeldPrev=!!input.jump;runHeldPrev=!!input.run;
if(p.y>H+40){die();return}if(room==='surface'){camera=clamp(Math.max(camera,p.x-120),0,LEVEL_WIDTH-W);maxProgress=Math.max(maxProgress,p.x);if(p.x>80*T)checkpoint=1;if(p.x+p.w>=FLAG_X-2&&p.x<FLAG_X+12&&p.y+p.h>42&&p.y<FLOOR-8){beginFlag();return}}
else{camera=0;p.x=Math.min(p.x,15*T-p.w);if(input.right&&p.x+p.w>=13*T-2&&p.y+p.h>11*T&&p.y>=10*T){mode='pipe';pipeTransition={kind:'right',t:0};p.vx=0;p.vy=0;sfx('pipe');return}}
for(let i=looseCoins.length-1;i>=0;i--)if(overlap(p,looseCoins[i])){const c=looseCoins[i];getCoin(c.x,c.y);looseCoins.splice(i,1)}
for(const e of enemies){if(e.dead||!e.active||!overlap(p,e))continue;if(p.star){killEnemy(e,true,100);continue}if(e.safe)continue;const stomp=hero!=='bill'&&p.vy>=0&&prevBottom<=e.y+7;if(stomp){p.y=e.y-p.h;p.vy=-4.1333333;p.jumpG=.125;p.fallG=.4375;p.grounded=false;p.combo++;if(e.type==='turtle'){if(!e.shell){e.y+=e.h-14;e.h=14;e.shell=true;e.shellTimer=480;e.vx=0;addScore(100,e.x,e.y);sfx('stomp')}else if(Math.abs(e.vx)>1){e.vx=0;e.shellTimer=480;sfx('stomp')}else{e.vx=p.x<e.x?3.2:-3.2;e.safe=12;e.combo=0;sfx('kick')}}else killEnemy(e,false,[100,200,400,800,1000,2000,4000,8000][Math.min(p.combo-1,7)]);}else if(e.type==='turtle'&&e.shell&&Math.abs(e.vx)<1){e.vx=p.x<e.x?3.2:-3.2;e.safe=14;e.combo=0;addScore(400,e.x,e.y);sfx('kick')}else damage();if(mode!=='playing')break;}
}
function updateEntities(){for(const t of tiles.values())if(t.bump>0)t.bump--;
for(const e of enemies){if(!e.active){if(e.x<camera+W+8)e.active=true;else continue}if(e.safe)e.safe--;e.anim++;if(e.dead){e.dead--;if(e.flipped){e.vy+=.18;e.y+=e.vy;e.x+=e.vx}if(e.dead===0)e.remove=true;continue}if(e.x<camera-48||e.y>H+40){e.remove=true;continue}e.vy=Math.min(4.25,e.vy+.25);moveBody(e,e.vx,e.vy);if(e.shell&&Math.abs(e.vx)<1&&--e.shellTimer<=0){e.shell=false;e.h=22;e.y-=8;e.vx=-.5}
if(e.shell&&Math.abs(e.vx)>1)for(const other of enemies){if(other===e||other.dead||!other.active)continue;if(overlap(e,other)){e.combo++;killEnemy(other,true,[500,800,1000,2000,4000,8000][Math.min(e.combo-1,5)])}}
}
for(let i=enemies.length-1;i>=0;i--)if(enemies[i].remove)enemies.splice(i,1);
for(let i=items.length-1;i>=0;i--){const it=items[i];if(it.emerge>0){it.emerge--;it.y=Math.max(it.targetY,it.y-.5);continue}if(it.x>camera+W+32)continue;if(it.type!=='flower'){it.vy=Math.min(4.25,it.vy+.22);moveBody(it,it.vx,it.vy);if(it.type==='star'&&it.grounded)it.vy=-3.9}if(it.y>H+40||it.x<camera-32){items.splice(i,1);continue}if(mode==='playing'&&overlap(player,it)){transform(it);items.splice(i,1)}}
for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life--;s.vy=Math.min(4,s.vy+.3);moveBody(s,s.vx,s.vy);if(s.grounded)s.vy=-2.4;for(const e of enemies)if(!e.dead&&e.active&&overlap(s,e)){killEnemy(e,true,100);s.dead=true;break}if(s.life<=0||s.x<camera-8||s.x>camera+W+8||s.y>H||s.dead){for(let j=0;j<4;j++)particles.push({kind:'spark',x:s.x,y:s.y,vx:(j%2?1:-1)*.6,vy:Math.floor(j/2)?-.6:.6,life:12});shots.splice(i,1)}}
}
function updateParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life--;p.x+=p.vx||0;p.y+=p.vy||0;p.vy+=(p.kind==='spark'?.035:.18);if(p.life<=0)particles.splice(i,1)}for(let i=floaters.length-1;i>=0;i--){floaters[i].life--;floaters[i].y-=.35;if(floaters[i].life<=0)floaters.splice(i,1)}}
function fixedUpdate(){frame++;if(mode==='menu'||mode==='paused'||mode==='gameover'||mode==='win')return;if(mode==='dying'){deathTick++;if(deathTick>24){player.y+=player.vy;player.vy+=.22}if(deathTick===105){if(lives>0){showOverlay('KEEP GOING','ONE MORE<br>TRY.','还剩 '+lives+' 次机会。<br>'+ (checkpoint?'从中途检查点重新出发。':'慢一点，跳跃的时机很重要。'),'继续冒险 →','ENTER / SPACE TO CONTINUE');mode='respawn'}else{mode='gameover';showOverlay('THAT WAS A GOOD RUN','GAME<br>OVER.','本次得分 '+String(score).padStart(6,'0')+'<br>重新出发，下一次会更熟练。','重新开始 →','ENTER / SPACE TO REPLAY')}updateUi(true)}return}if(mode==='respawn')return;if(mode==='pipe'){advancePipe();return}if(mode==='flag'){advanceFlag();updateParticles();return}if(freeze>0){freeze--;return}const input=getInput();updatePlayer(input);if(mode!=='playing')return;updateEntities();updateParticles();timerTicks++;if(timerTicks>=24){timerTicks=0;timeLeft=Math.max(0,timeLeft-1);if(timeLeft===0)die()}music();}

const C23_CORE={updatePlayer,moveBody,updateEntities,drawPlayer,drawItem,drawCoin,bumpTile};
let c23Campaign=null,c23Bindings=null;
