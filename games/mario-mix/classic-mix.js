// GAME-DOWNLOAD-RIGHTS
/*
版权与使用说明 / Copyright and use
本游戏由在下_小Q（Aha_xiaoQ）整理与制作，为非官方同人作品，免费体验，仅供娱乐。
程序代码中引用或改编的上游部分，继续适用其原有许可证；请保留文件内原有版权及许可全文。
角色、图像、音乐、音效、名称及其他第三方素材的权利归各自权利人所有。
本站网站代码的 MIT 许可不覆盖整个游戏、第三方素材或下载包；未明确许可的部分不应推定可以复用。
免费、署名及本声明不代表已取得第三方授权，也不授予商标、素材再分发或商业使用权。
如需复用，请逐项核对原许可证及权利人的许可。本说明不限制原许可证或法律已允许的使用。
如相关权利人有异议，请联系 hfutqdm@163.com；我们将及时核查并移除相关内容或下架下载。
作品网站：https://aha-xiaoq.github.io/

Unofficial fan game assembled by Aha_xiaoQ, provided free for entertainment.
Upstream code retains its own licenses and copyright notices. Characters, images,
music, sound effects and names belong to their respective rights holders.
The website's MIT grant does not license the entire game, third-party assets or
this archive. Free access and attribution are not evidence of third-party permission.
No additional asset, trademark, redistribution or commercial rights are granted.
Existing license permissions and uses permitted by law are unaffected.
Rights contact: hfutqdm@163.com. Reported material will be reviewed and removed as appropriate.
*/

'use strict';
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
 const total=AUDIO_MANIFEST.length,count=bank.size;const button=$('exportAudio');if(button)button.disabled=count!==total;
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
 updateAudioPanel();if(!new URLSearchParams(location.search).has('test'))setTimeout(prepareAudio,0);
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

/* Classic sprite layer. Selected pixel encodings are sourced from:
 * umaim/Mario · Source/settings/sprites.js
 * Git blob 9566387f26f584b197859aa8e2f0b7e481d1cb79
 * See SOURCES_AND_LICENSES.txt. Code license does not transfer Nintendo rights.
 * Gameplay units and the deterministic 60 Hz simulation are not modified here.
 */
const CLASSIC_PALETTE = [[0,0,0,0],[255,255,255,255],[0,0,0,255],[188,188,188,255],[116,116,116,255],[252,216,168,255],[252,152,56,255],[252,116,180,255],[216,40,0,255],[200,76,12,255],[136,112,0,255],[124,7,0,255],[168,250,188,255],[128,208,16,255],[0,168,0,255],[24,60,92,255],[0,128,136,255],[32,56,236,255],[156,252,240,255],[60,188,252,255],[92,148,252,255],[0,130,0,255],[252,188,176,255]];
const CLASSIC_DATA = {"small_idle":[16,"p[0,6,8,10]0000x26,x09,x210,x06,33331131x07,33131113111x05,331331113111000033311113333x07,x18,x07,3332333x08,333323323330000x35,2222333300011132122123110001111x26,111000111x28,11x05,222202222x06,333300033330000x35,000x35,00"],"small_jump":[16,"p[0,6,8,10]x013,111x06,x26,0111x05,x29,11x05,33311311333000031311131133300003133111311130000331111x36,x06,x17,33000x35,2333233000x37,2333220311x36,x26,0311112232212212330113x210,3300333x29,330333x28,x05,330x25,x07,"],"small_run0":[16,"p[0,6,8,10]x05,x26,x09,x210,x06,33331131x07,33131113111x05,331331113111000033311113333x07,x18,x05,x35,2233x05,1113333222333x17,3332122233x15,0x28,0330000x210,33000x211,330033322200222233003333x013,3333x010,"],"small_run1":[16,"p[0,6,8,10]x020,x26,x09,x210,x06,33311311x07,31311131111x05,3133111311110000331111x35,x07,x18,x07,3323333x08,333322333x07,3332212211x06,3333x26,x06,2331112222x07,23112222x09,2223333x09,x38,0000"],"small_run2":[16,"p[0,6,8,10]x021,x26,x09,x210,x06,33331131x07,33131113111x05,331331113111000033311113333x07,x18,x07,x35,2311x06,11x36,11100001112x35,11x05,333x27,x06,33x28,x05,333x27,x06,330003333x012,x35,x05,"],"small_skid":[16,"p[0,6,8,10]x05,x26,x08,x28,33x07,131x37,0000x16,3113111001133113311311100033x16,3111x05,1123332222x05,3332231112220000x36,1113220000x36,112222x05,3333x26,x07,222233322x07,222x35,x09,2333223333x09,2x36,x010,x35,00"],"small_climb0":[16,"p[0,6,8,10]0000x26,x09,x210,x06,33311311x07,31311131111x05,3133111311110000331111x35,x07,x18,x07,3323333x09,222x35,x08,222x36,11100002222x35,111100x26,3333111100x211,33300x211,330000x29,x08,x26,x06,"],"small_climb1":[16,"p[0,6,8,10]x05,x26,x09,x210,x06,33311311x07,31311131111x05,3133111311110000331111x35,x07,x18,x08,22x35,111x05,22x36,1111000222x36,1111000x25,122x08,x28,00033000x210,3330000x29,333x05,x28,333x016,"],"dead":[15,"p[0,6,8,10]x05,x25,x07,11x27,1100111131311313x16,3313113133x15,33311113331100x35,113333x05,331333313x06,33x16,3x05,222211112220003332233332233003333223322333003333212212333003333x26,333000333x26,3300"],"big_idle":[16,"p[0,6,8,10]x06,x25,x09,x26,1x08,x26,11x08,x211,x05,333113111x06,311311331111000031133x18,00331133111311110033x15,x36,000333x15,x35,x05,33x18,x07,2x15,3x09,32333323x07,3323333233x05,3332333323330003333233332333300333223333223330333322333322x38,x28,x38,2122221233331111x28,x18,x28,11110111x28,1110011x210,11000x212,000x26,00x26,00x25,0000x25,00x25,0000x25,000333300003333000033330000333300x36,0000x312,0000x36,"],"big_jump":[16,"p[0,6,8,10]x012,111x012,11311x06,x25,113310000x27,x15,000x28,x35,000x211,33000333113111333300311311331111330031133x18,30031133111311113033x15,x37,0033331111333313000033x18,33x05,2222332333300x36,223233300x38,23323300x38,2232300033113333223320003111133222231000x15,32221222000x15,x28,0001011x29,003011x210,033000x29,33330003x28,x37,233x26,x37,222332222x37,x25,0022x37,x25,x08,3332222x09,33x014,3x015,"],"big_crouch":[16,"p[0,6,8,10]x07,x25,x09,x26,1x08,x26,11x08,x211,x05,333113111x06,311311331111000331113111311110033x15,x36,000223x15,x35,0033323x19,0033323331113323033332x38,23033332x37,22x36,21x35,22x37,x28,x39,x26,x38,1112222111333231111222211113221111x26,1111202113x06,311200033330000333300x36,0000x36,"],"big_run0":[16,"p[0,6,8,10]x06,x25,x09,x26,1x08,x26,11x08,x211,x05,333113111x06,311311331111000031133x18,00331133111311110033x15,x36,000333x15,x35,x05,33x18,x08,33311x010,222233200010000333322332011100x36,223231110x37,223321110x37,223323130x36,222332330x36,22212313003333x29,000x15,x28,000x15,x28,0031111x29,0330111x27,x35,00023x26,x35,003223x25,x38,22233222x39,2222000x310,2x011,333x013,333x014,333x011,"],"big_run1":[16,"p[0,6,8,10]x023,x25,x09,x26,1x08,x26,11x08,x211,x05,333113111x06,311311331111000031133x18,00331133111311110033x15,x36,000033x15,x35,x06,3x18,x06,3222111x08,3233323x09,32333323x07,332x35,22110000322x37,1111003222x36,1111000222x37,1110002222x36,111000x26,3332x06,x210,x06,x29,30003333x27,322003333x25,3322200333322223222200033332220022220003333x05,333300033x07,33330003x08,x36,x010,x36,x017,"],"big_run2":[16,"p[0,6,8,10]x022,x25,x09,x26,1x08,x26,11x08,x211,x05,333113111x06,311311331111000031133x18,00331133111311110033x15,x36,000033x15,x35,x05,33x18,x07,222211x09,32332233x07,323333223x07,3233332233x06,3233332223x06,32x35,113x06,3233331111x06,22333311112x05,22233311112200002222331112220000x26,332222x05,x25,33322x07,222x36,x07,22x36,x09,223333x010,3222333x09,3333033x08,x35,x011,x37,x011,x35,x05,"],"shell":[16,"p[0,1,6,14]x05,233332x09,33222233x07,3323333233x06,32x36,23x05,32x38,230000232x36,2320002333233332333200x35,2222x35,01113323333233x17,2x36,2111100011x36,11x07,11333311x09,x16,x011,1111x06,"],"star0":[14,"p[0,6,8]x06,11x012,11x011,1111x010,1111x09,x16,0000x119,2112x15,01111211211110001112112111x05,x18,x06,x18,x05,x110,0000x110,00001111001111000111x06,1110011x08,110"],"block_used":[16,"p[0,2,9]0x114,01x214,1121x210,1211x214,11x214,11x214,11x214,11x214,11x214,11x214,11x214,11x214,11x214,1121x210,1211x214,10x114,0"],"question0":[16,"p[0,2,6,9]0x314,03x214,1321x210,12132222x35,x25,132223311133222213222331223312221322233122331222132222112333122213x26,3311122213x26,331x25,13x27,11x25,13x26,33x26,13x26,331x25,1321x25,112221213x214,x117,"],"question1":[16,"p[0,2,9]0x214,0x215,1221x210,121x215,1x26,111x26,1x26,1222212221x26,1222212221x25,11222212221x29,1112221x29,1x25,1x28,11x25,1x215,1x29,1x25,1221x25,11222121x215,x117,"],"question2":[16,"p[0,2,9,11]0x214,02x314,1231x310,13123333x25,x35,123332211122333312333221332213331233322133221333123333113222133312x36,2211133312x36,221x35,12x37,11x35,12x36,22x36,12x36,221x35,1231x35,113331312x314,x117,"],"goomba":[16,"p[0,2,5,9]x06,3333x011,x36,x09,x38,x07,x310,x05,311x36,11300033321333312333003332x16,23330333321233212x38,22233222x320,03333x26,3333x05,x28,x06,11x28,x05,x15,x25,110000x16,222111x05,x15,001110000"],"goomba_flat":[16,"p[0,5,9,15]x06,2222x09,x210,000022333222233322022111133331111x218,000x110,x07,x18,x05,x35,0000x35,0"],"koopa0":[16,"p[0,1,6,14]x019,1x014,111x013,1112x011,231122x010,231122x010,231122x010,211122x09,2221222x09,23x25,x09,x26,00x35,0002220220323332300220022033232333022022133332311300202213332323130000221232333232000221132x35,2300002132323332320000212333232333x05,1x35,23333x05,113332323111000221112331110000x25,x15,22200x25,x06,2222"],"koopa1":[16,"p[0,1,6,14]00001x014,111x012,2111x012,23112x010,223112x010,223112x010,221112x09,2322122x09,x27,x09,22200220x35,00022000213233323x06,2213323233x05,22133332311300222213332323130002221232333232000021132x35,2300002132323332320000212333232333x05,1x35,23333x05,113332323111000021112331112x05,222x15,222x06,2220000222x07,2220022200"],"coin0":[10,"p[0,2,6,8]00222211000x26,11002233221102232212211223221221122322122112232212211223221221122322122112232212211223221221102211221100x26,1100022221100"],"coin1":[10,"p[0,2,8]00222211000x26,1100x26,110x25,12211x25,12211x25,12211x25,12211x25,12211x25,12211x25,12211x25,1221102211221100x26,1100022221100"],"coin2":[10,"p[0,2,9,11]00333311000x36,11003322331103323313311332331331133233133113323313311332331331133233133113323313311332331331103311331100x36,1100033331100"],"coin_pop0":[10,"p[0,1,7]000012x08,12x07,1112x06,1112x06,1112x06,1112x06,1112x06,1112x06,1112x06,1112x06,1112x06,1112x07,12x08,120000"],"coin_pop1":[10,"p[0,1,6,7]000022x07,2222x05,x26,000022132200022122322002212232200221223220022122322002212232200221223220002213220000x26,x05,2222x07,220000"],"coin_pop2":[10,"p[0,1,6,7]000023x08,23x07,2333x06,2333x06,2333x06,2333x06,1333x06,1333x06,2333x06,2333x06,2333x06,2333x07,23x08,230000"],"coin_pop3":[10,"p[0,1,6]x05,2x09,2x09,2x09,2x09,2x09,2x09,1x09,1x09,2x09,2x09,2x09,2x09,2x09,20000"],"mushroom":[16,"p[0,1,6,8]x06,2222x011,332222x09,33332222x07,x35,x25,x05,22333x27,000x29,3332200x28,x35,202233x25,x35,222333x25,x35,22233x27,333x219,02333x16,3332x05,x18,x08,12x16,x08,12x16,x09,121111x05,"],"flower":[16,"p[0,1,6,8,14]0000x18,x06,x112,000111x28,111011222x36,2221111222x36,222110111x28,111000x112,x06,x18,x011,44x07,444000044000044404440004400044400444400440044440004444044044440000444404404444x05,x410,x09,4444x06,"],"fireball0":[8,"p[0,1,6,8]0303330000303330300032330033322303322123032212330332233000333300"],"fireball1":[8,"p[0,1,6,8]x05,3000333000333233030322230033212x36,2122330332233000333300"],"fireball2":[8,"p[0,1,6,8]0033330003322330332122303212233032233300332300030333030000333030"],"fireball3":[8,"p[0,1,6,8]0033330003322330332212x36,2123300322230303323330003330003x05,"],"ground":[16,"p[2,5,9]2x18,02111121x28,01222201x28,01222201x28,01222201x28,01022201x28,02000021x28,0x15,01x28,01222201x28,01222201x28,012222000x26,01x25,01100222201x25,0121100001x26,0122211101x26,01x26,01x25,002x06,21x06,2"],"ground_under":[16,"p[2,16,18]1x28,01222212x18,02111102x18,02111102x18,02111102x18,02011102x18,01000012x18,0x25,02x18,02111102x18,02111102x18,021111000x16,02x15,02200111102x15,0212200002x16,0211122202x16,02x16,02x15,001x06,12x06,1"],"brick":[16,"p[2,5,9]x116,x27,0x27,0x27,0x27,x017,2220x27,0x27,0x27,0x27,0x27,02222x016,x27,0x27,0x27,0x27,0x27,0x27,x017,2220x27,0x27,0x27,0x27,0x27,02222x016,"],"brick_under":[16,"p[2,16]x17,0x17,0x17,0x17,0x17,0x17,x017,1110x17,0x17,0x17,0x17,0x17,01111x016,x17,0x17,0x17,0x17,0x17,0x17,x017,1110x17,0x17,0x17,0x17,0x17,01111x016,"],"debris":[8,"p[0,2,9]0021200002221200212121202212221222212221022212220021212000022200"],"stone":[16,"p[2,5,9]2x114,012x112,00112x110,0001112x18,00001111x28,00001111x28,00001111x28,00001111x28,00001111x28,00001111x28,00001111x28,00001111x28,0000111x09,200011x011,2001x013,2x016,2"],"pipe_top":[32,"p[0,2,13,14]x133,x230,11x35,x26,x319,1122233x26,322x310,2323221122233x26,322x311,232221122233x26,322x310,2323221122233x26,322x311,232221122233x26,322x310,2323221122233x26,322x311,232221122233x26,322x310,2323221122233x26,322x311,232221122233x26,322x310,2323221122233x26,322x311,232221122233x26,322x310,232322x133,00x128,00"],"pipe_body":[32,"p[0,2,13,14]00122233x25,322x38,2322210000122233x25,322x39,232210000122233x25,322x38,2322210000122233x25,322x39,232210000122233x25,322x38,2322210000122233x25,322x39,232210000122233x25,322x38,2322210000122233x25,322x39,232210000122233x25,322x38,2322210000122233x25,322x39,232210000122233x25,322x38,2322210000122233x25,322x39,232210000122233x25,322x38,2322210000122233x25,322x39,232210000122233x25,322x38,2322210000122233x25,322x39,2322100"],"pipe_side":[39,"p[0,2,13,14]x115,x024,1x213,x122,0001x213,11x220,1001x213,11x220,1001x213,11x220,1001x313,11x221,101x313,11x321,101x213,11x321,101x213,11x221,101x213,11x221,101x213,11x222,11x213,11x222,11x313,11x222,11x213,11x322,11x213,11x222,11x213,11x222,11x213,11x322,11x313,11x322,11x313,11x322,11x313,11x322,11x313,11x322,11x313,11x322,11x313,11x321,101x313,11x321,101x313,11x321,101x313,11323232323232323232323101323232323232311232323232323232323232101232323232323211323232323232323232321001323232323232311x220,1001x213,11x220,1001x213,x122,000x115,x024,"],"bush1":[32,"p[0,2,13,14]x014,1111x027,122221x024,11x26,1x022,1x28,101x020,1x29,121x019,1x26,3x25,1x017,122233222322221x016,12223x210,1x013,111x216,1001x08,1x219,10121x06,1x221,1221x06,x225,1010011x226,1211x230,11x230,101x228,10"],"bush2":[48,"p[0,2,13,14]x014,1111x012,1111x027,122221x010,122221x024,11x26,1x07,11x26,1x022,1x28,10100001x28,101x020,1x29,1210001x29,121x019,1x26,3x25,1001x26,3x25,1x017,1222332223222210122233222322221x016,12223x210,112223x210,1x013,111x232,1001x08,1x235,10121x06,1x237,1221x06,x241,1010011x242,1211x246,11x246,101x244,10"],"bush3":[64,"p[0,2,13,14]x014,1111x012,1111x012,1111x027,122221x010,122221x010,122221x024,11x26,1x07,11x26,1x07,11x26,1x022,1x28,10100001x28,10100001x28,101x020,1x29,1210001x29,1210001x29,121x019,1x26,3x25,1001x26,3x25,1001x26,3x25,1x017,12223322232222101222332223222210122233222322221x016,12223x210,112223x210,112223x210,1x013,111x248,1001x08,1x251,10121x06,1x253,1221x06,x257,1010011x258,1211x262,11x262,101x260,10"],"cloud1":[32,"p[0,1,2,19]x014,2222x027,211112x024,22x16,2x022,2x18,202x020,2x19,212x019,2x16,3x15,2x017,211133111311112x016,21113x110,2x013,222x116,2002x08,2x119,20212x06,2x121,2112x06,x125,2020022x126,2122x130,22x130,202x128,20002113x111,3x111,2x05,2113113x16,3x113,2x05,2113333111333311113x18,200002x15,x36,1x35,x19,x06,2221111331111333x18,22x09,2x16,2x18,21122x012,221112022111122022x016,22200002222x010,"],"cloud2":[48,"p[0,1,2,19]x014,2222x012,2222x027,211112x010,211112x024,22x16,2x07,22x16,2x022,2x18,20200002x18,202x020,2x19,2120002x19,212x019,2x16,3x15,2002x16,3x15,2x017,2111331113111120211133111311112x016,21113x110,221113x110,2x013,222x132,2002x08,2x135,20212x06,2x137,2112x06,x141,2020022x142,2122x146,22x146,202x144,20002113x111,3x115,3x111,2x05,2113113x16,3x18,3x16,3x113,2x05,21133331113333111131333111333311113x18,200002x15,x36,1x35,1111x36,1x35,x19,x06,2221111331111333x17,331111333x18,22x09,2x16,2x18,2x16,2x18,21122x012,2211120221111220221112022111122022x016,22200002222x05,22200002222x010,"],"hill_large":[80,"p[0,2,14]x037,x16,x071,111x26,111x066,11x212,11x063,1x213,1221x061,1x213,111221x059,1x214,1112221x057,1x215,11122221x055,1x213,112111x25,1x053,1x214,11221x27,1x051,1x215,11x211,1x049,1x216,11x212,1x047,1x232,1x045,1x234,1x043,1x236,1x041,1x238,1x039,1x240,1x037,1x242,1x035,1x244,1x033,1x246,1x031,1x213,1x223,1x210,1x029,1x213,111x221,111x210,1x027,1x214,111x221,111x211,1x025,1x215,111x221,111x212,1x023,1x213,112111x218,112111x213,1x021,1x214,11221x219,11221x215,1x019,1x215,11x222,11x219,1x017,1x216,11x222,11x220,1x015,1x264,1x013,1x266,1x011,1x268,1x09,1x270,1x07,1x272,1x05,1x274,10001x276,101x278,1"],"hill_small":[48,"p[0,2,14]x021,x16,x039,111x26,111x034,11x212,11x031,1x213,1221x029,1x213,111221x027,1x214,1112221x025,1x215,11122221x023,1x213,112111x25,1x021,1x214,11221x27,1x019,1x215,11x211,1x017,1x216,11x212,1x015,1x232,1x013,1x234,1x011,1x236,1x09,1x238,1x07,1x240,1x05,1x242,10001x244,101x246,1"],"castle_brick":[16,"p[2,9]x17,0x17,0x17,0x17,0x17,0x17,x017,1110x17,0x17,0x17,0x17,0x17,01111x016,x17,0x17,0x17,0x17,0x17,0x17,x017,1110x17,0x17,0x17,0x17,0x17,01111x016,x17,0x17,0"],"castle_door":[16,"p[2,9]x17,0x17,0x17,0x17,0x17,0x17,x017,1110x17,0x17,0x17,0x17,0x17,01111x016,x15,x06,11110111x010,11011x012,1x017,1x014,11x014,1x0416,"],"castle_railing":[16,"p[0,2,5,9]2222x07,x25,3332x07,2x37,2x07,2x37,2x07,2x37,2x07,2x37,2x07,2x37,2x07,23333111x29,1111"],"castle_top":[24,"p[2,9]x17,0x17,0x17,0x17,0x17,0x17,0x17,0x17,0x17,x025,1110x17,0x17,0x17,0x17,0x17,0x17,0x17,0x17,01111x024,x17,x09,x17,0x17,x09,x17,0x17,x09,x17,x025,11101111x08,1110x17,01111x08,1110x17,01111x08,11101111x024,x17,x09,x17,0x17,x09,x17,0x17,x09,x17,x025,11101111x08,1110x17,01111x08,1110x17,01111x08,11101111x024,"],"flag_top":[8,"p[0,2,13,14]001111000123331012x35,112x35,11x36,11x36,10133331000111100"],"big_climb0":[16,"p[0,6,8,10]x023,x25,x09,x26,1x08,x26,11x08,x211,x05,333113111x06,311311331111000031133x18,00331133111311110033x15,x36,000033x15,331111x05,3113331111x05,322x35,11x05,322x36,1x06,32x36,x08,32x35,23x07,323333223x08,223322233x07,x28,3x07,x25,1222x06,x210,x06,x210,x06,x210,x06,x29,x07,x29,30330000x27,x35,x05,x26,x35,x07,22223333x011,x35,x013,33x015,3x018,"],"big_climb1":[16,"p[0,6,8,10]x023,x25,x09,x26,1x08,x26,11x08,x211,x05,333113111x06,311311331111000031133x18,00331133111311110033x15,x36,000033x15,x35,x06,3x18,x06,3222111x08,3233323x09,32333323x07,332x35,22110000322x37,1111003222x36,1111000222x37,1110002222x36,111000x26,3332x06,x210,x06,x29,3x06,x210,033000x29,33330000x28,33330000x28,3333x05,x27,3333x064,"],"big_skid":[16,"p[0,6,8,10]000x27,x09,11x27,33x06,1x27,333000x26,31133110022113113113111100013311311311110x16,3111213x16,3x15,22313111133331133223110333311113332x05,x15,x35,220003322233111332000333222x15,32000333233x15,3200x37,x15,0000x37,113122200x38,11222200x37,x27,00x36,x27,0000333x25,333x05,x25,x35,x06,x25,x38,0000222333311113x06,233x16,3x07,3112222x010,x27,003x07,222230033x07,22x37,x08,x37,x09,x36,x011,3333x012,3330000"],"flag":[16,"p[0,1,14]x116,0x18,x25,1100x16,22121221000x15,211211210000111121222121x05,11122212221x06,11x27,1x07,111222111x08,x18,x09,x17,x010,x16,x011,x15,x012,1111x013,111x014,11x015,1"],"castle_flag":[13,"p[0,1,6,8]02x011,222x011,2x012,3x111,03x15,3x15,03x15,3x15,0311x37,1103111x35,11103111133311110311133133111031113111311103x111,03x012,3x012,3x012,3x012,3x012,3x012,3x012,3x011,"]};
const spriteCache=new Map(),drawnAssets=new Set();
const variants={
  normal:{},fire:{6:6,8:5,10:8},life:{8:14},under:{5:18,9:16},
  star1:{6:2,8:5,10:9},star2:{6:1,8:6,10:8},star3:{6:1,8:6,10:14},
  starItem1:{6:9,8:2},starItem2:{6:8,8:5},starItem3:{6:6,8:14},
  flower1:{1:9,6:5,8:2},flower2:{1:6,6:10,8:8},flower3:{8:14}
};
function decodeClassic(code){
 const m=/^p\[([^\]]+)\]/.exec(code);if(!m)throw new Error('Invalid embedded sprite palette');
 const palette=m[1].split(',').map(Number),data=code.slice(m[0].length),out=[];
 for(let i=0;i<data.length;){
   if(data[i]==='x'){
     const comma=data.indexOf(',',i),index=Number(data[i+1]),count=Number(data.slice(i+2,comma));
     if(comma<0||!Number.isInteger(count)||count<0||count>100000)throw new Error('Invalid sprite run');
     for(let j=0;j<count;j++)out.push(palette[index]);i=comma+1;
   }else{const p=palette[Number(data[i++])];if(p===undefined)throw new Error('Invalid sprite pixel');out.push(p)}
 }return out;
}
const decoded=new Map();
for(const [name,[w,encoded]] of Object.entries(CLASSIC_DATA)){
 const pixels=decodeClassic(encoded);if(pixels.length%w)throw new Error('Embedded sprite dimensions: '+name);
 decoded.set(name,{w,h:pixels.length/w,pixels});
}
function classicSprite(name,variant='normal'){
 const key=name+':'+variant;if(spriteCache.has(key))return spriteCache.get(key);
 const data=decoded.get(name);if(!data)throw new Error('Missing classic sprite: '+name);
 const c=document.createElement('canvas');c.width=data.w;c.height=data.h;
 const context=c.getContext('2d'),im=context.createImageData(data.w,data.h),map=variants[variant]||{};
 for(let i=0;i<data.pixels.length;i++){const index=data.pixels[i],rgba=CLASSIC_PALETTE[map[index]??index];im.data.set(rgba,i*4)}
 context.putImageData(im,0,0);spriteCache.set(key,c);return c;
}
function sprite(name,x,y,flip=false,vertical=false,variant='normal'){
 const im=classicSprite(name,variant);drawnAssets.add(name);x=Math.round(x);y=Math.round(y);
 if(flip||vertical){ctx.save();ctx.translate(x+(flip?im.width:0),y+(vertical?im.height:0));ctx.scale(flip?-1:1,vertical?-1:1);ctx.drawImage(im,0,0);ctx.restore()}
 else ctx.drawImage(im,x,y);
}
// Warm-up prevents first-use animation stutter and detects bad sprite data at load.
for(const name of decoded.keys())classicSprite(name);
window.__classicInfo={ready:true,source:'umaim/Mario',sourceBlob:'9566387f26f584b197859aa8e2f0b7e481d1cb79',count:decoded.size,get drawn(){return [...drawnAssets]},resolution:[256,240]};

// 8-pixel monospaced HUD cells, drawn without loading a font file.
const HUD_GLYPHS={
 '0':[0x3c,0x66,0x6e,0x76,0x66,0x66,0x3c], '1':[0x18,0x38,0x18,0x18,0x18,0x18,0x7e],
 '2':[0x3c,0x66,0x06,0x0c,0x30,0x60,0x7e], '3':[0x3c,0x66,0x06,0x1c,0x06,0x66,0x3c],
 '4':[0x0c,0x1c,0x3c,0x6c,0x7e,0x0c,0x0c], '5':[0x7e,0x60,0x7c,0x06,0x06,0x66,0x3c],
 '6':[0x1c,0x30,0x60,0x7c,0x66,0x66,0x3c], '7':[0x7e,0x66,0x06,0x0c,0x18,0x18,0x18],
 '8':[0x3c,0x66,0x66,0x3c,0x66,0x66,0x3c], '9':[0x3c,0x66,0x66,0x3e,0x06,0x0c,0x38],
 'A':[0x18,0x3c,0x66,0x66,0x7e,0x66,0x66], 'B':[0x7c,0x66,0x66,0x7c,0x66,0x66,0x7c],
 'C':[0x3c,0x66,0x60,0x60,0x60,0x66,0x3c], 'D':[0x78,0x6c,0x66,0x66,0x66,0x6c,0x78],
 'E':[0x7e,0x60,0x60,0x7c,0x60,0x60,0x7e], 'F':[0x7e,0x60,0x60,0x7c,0x60,0x60,0x60],
 'G':[0x3c,0x66,0x60,0x6e,0x66,0x66,0x3e], 'H':[0x66,0x66,0x66,0x7e,0x66,0x66,0x66],
 'I':[0x7e,0x18,0x18,0x18,0x18,0x18,0x7e], 'J':[0x1e,0x0c,0x0c,0x0c,0x0c,0x6c,0x38],
 'K':[0x66,0x6c,0x78,0x70,0x78,0x6c,0x66], 'L':[0x60,0x60,0x60,0x60,0x60,0x60,0x7e],
 'M':[0x63,0x77,0x7f,0x6b,0x63,0x63,0x63], 'N':[0x66,0x76,0x7e,0x7e,0x6e,0x66,0x66],
 'O':[0x3c,0x66,0x66,0x66,0x66,0x66,0x3c], 'P':[0x7c,0x66,0x66,0x7c,0x60,0x60,0x60],
 'Q':[0x3c,0x66,0x66,0x66,0x6e,0x3c,0x0e], 'R':[0x7c,0x66,0x66,0x7c,0x78,0x6c,0x66],
 'S':[0x3c,0x66,0x60,0x3c,0x06,0x66,0x3c], 'T':[0x7e,0x18,0x18,0x18,0x18,0x18,0x18],
 'U':[0x66,0x66,0x66,0x66,0x66,0x66,0x3c], 'V':[0x66,0x66,0x66,0x66,0x66,0x3c,0x18],
 'W':[0x63,0x63,0x63,0x6b,0x7f,0x77,0x63], 'X':[0x66,0x66,0x3c,0x18,0x3c,0x66,0x66],
 'Y':[0x66,0x66,0x66,0x3c,0x18,0x18,0x18], 'Z':[0x7e,0x06,0x0c,0x18,0x30,0x60,0x7e],
 '-':[0,0,0,0x3c,0,0,0], '!':[0x18,0x18,0x18,0x18,0x18,0,0x18], ' ':[0,0,0,0,0,0,0],
 '×':[0,0,0x66,0x3c,0x18,0x3c,0x66]
};
function hud(str,x,y,color='#ffffff',center=false){str=String(str).toUpperCase();if(center)x-=str.length*4;ctx.fillStyle=color;
 for(const c of str){const glyph=HUD_GLYPHS[c]||HUD_GLYPHS[' '];for(let row=0;row<7;row++)for(let col=0;col<8;col++)if(glyph[row]&(128>>col))ctx.fillRect(Math.round(x+col),Math.round(y+row),1,1);x+=8}}
function drawBackground(){
 rect(0,0,W,H,room==='under'?'#000000':'#5c94fc');if(room==='under')return;
 // NES-style scenery scrolls with the playfield, not in modern parallax layers.
 const page=Math.floor(camera/768);
 for(let k=page-1;k<=page+1;k++){
  const b=k*768-camera;
  sprite('hill_large',b,173);sprite('hill_small',b+256,189);sprite('hill_large',b+512,173);
  sprite('bush3',b+184,192);sprite('bush1',b+376,192);sprite('bush2',b+664,192);
  sprite('cloud1',b+136,48);sprite('cloud1',b+312,64);sprite('cloud2',b+440,48);sprite('cloud2',b+568,64);
 }
}
function drawBlock(t){
 if(t.hidden||t.type==='pipe')return;const x=t.x*T-camera,y=t.y*T-(t.bump?Math.sin((12-t.bump)/12*Math.PI)*5:0);
 if(t.type==='ground')sprite(room==='under'?'ground_under':'ground',x,y);
 else if(t.type==='bluebrick')sprite('brick_under',x,y);
 else if(t.type==='brick'&&!t.used)sprite(room==='under'?'brick_under':'brick',x,y);
 else if(t.type==='stone')sprite('stone',x,y,false,false,room==='under'?'under':'normal');
 else if(t.used)sprite('block_used',x,y,false,false,room==='under'?'under':'normal');
 else {const n=[0,0,1,2,1,0][Math.floor(frame/8)%6];sprite('question'+n,x,y,false,false,room==='under'?'under':'normal')}
}
function drawPipe(p){
 const x=Math.round(p.x-camera),y=p.y;ctx.save();ctx.beginPath();ctx.rect(x,y,32,FLOOR-y);ctx.clip();
 for(let yy=y+16;yy<FLOOR;yy+=16)sprite('pipe_body',x,yy);sprite('pipe_top',x,y);ctx.restore();
}
function drawUnderPipe(){
 // The decorative pipe body sits behind the unchanged 13/14 tile exit solids.
 const x=13*T;ctx.save();ctx.beginPath();ctx.rect(x,3*T,32,FLOOR-3*T);ctx.clip();
 for(let y=3*T;y<11*T;y+=16)sprite('pipe_body',x+12,y);
 sprite('pipe_side',x,11*T);ctx.restore();
}
function drawCoin(x,y,phase=frame,popping=false){
 const name=popping?'coin_pop'+Math.floor(phase/4)%4:'coin'+[0,0,1,2,1,0][Math.floor(phase/8)%6];sprite(name,x-1,y-2);
}
function playerVariant(){
 if(player.star)return ['normal','star1','star2','star3'][Math.floor(frame/4)%4];return player.power===2?'fire':'normal';
}
function drawItem(it){
 let name='mushroom',variant='normal';if(it.type==='life')variant='life';
 if(it.type==='flower'){name='flower';variant=['normal','flower1','flower2','flower3'][Math.floor(frame/6)%4]}
 if(it.type==='star'){name='star0';variant=['normal','starItem1','starItem2','starItem3'][Math.floor(frame/4)%4]}
 const im=classicSprite(name,variant);sprite(name,it.x-camera+(14-im.width)/2,it.y+14-im.height,false,false,variant);
}
function drawPlayer(){
 const p=player;if(mode==='flag'&&flagPhase>=2)return;
 if(p.invuln&&Math.floor(frame/4)%2&&mode!=='dying')return;
 const prefix=p.power?'big_':'small_',run=Math.floor(p.anim/6)%3;
 let name=prefix+'idle';
 if(mode==='dying')name='dead';
 else if(mode==='flag'&&flagPhase===0)name=prefix+'climb'+Math.floor(frame/8)%2;
 else if(p.power&&p.crouch)name='big_crouch';
 else if(!p.grounded&&mode!=='pipe')name=prefix+'jump';
 else if(p.grounded&&Math.abs(p.vx)>.08){name=prefix+'run'+run;if(p.vx*p.facing<-.08)name=prefix+'skid'}
 const variant=playerVariant(),im=classicSprite(name,variant);
 sprite(name,p.x-camera+(p.w-im.width)/2,p.y+p.h-im.height,p.facing<0,false,variant);
}
function drawEnemy(e){
 if(!e.active||e.remove)return;let name,flip=false;
 if(e.type==='walker'){name=e.dead&&!e.flipped?'goomba_flat':'goomba';flip=!!(Math.floor(e.anim/8)%2)}
 else if(e.shell)name='shell';else{name='koopa'+Math.floor(e.anim/8)%2;flip=e.vx>0}
 const im=classicSprite(name);sprite(name,e.x-camera+(e.w-im.width)/2,e.y+e.h-im.height,flip,e.flipped);
}
function drawCastle(){
 const x=202*T-camera;if(x>W+2||x+80<0)return;
 // 80 px wide gatehouse, two 24 px window pieces, battlements and native door.
 for(let yy=FLOOR-40;yy<FLOOR;yy+=16)for(let xx=0;xx<80;xx+=16){ctx.save();ctx.beginPath();ctx.rect(x,FLOOR-40,80,40);ctx.clip();sprite('castle_brick',x+xx,yy);ctx.restore()}
 sprite('castle_top',x+16,FLOOR-72);sprite('castle_top',x+40,FLOOR-72);
 for(let xx=16;xx<64;xx+=16)sprite('castle_railing',x+xx,FLOOR-80);
 for(let xx=0;xx<80;xx+=16)sprite('castle_railing',x+xx,FLOOR-48);
 sprite('castle_door',x+32,FLOOR-40);
 if(mode==='flag'&&flagPhase>=2||mode==='win')sprite('castle_flag',x+33,FLOOR-100);
}
function drawFlag(){
 const x=FLAG_X-camera;if(x<-26||x>W+8)return;
 rect(x-1,40,2,152,'#80d010');sprite('flag_top',x-4,32);sprite('flag',x-16,flagY);
}
function drawHud(){
 hud('MARIO',24,16);hud(String(score).padStart(6,'0'),24,24);
 ctx.save();ctx.translate(91,24);ctx.scale(.5,.5);sprite('coin0',0,0);ctx.restore();
 hud('×'+String(coins).padStart(2,'0'),104,24);hud('WORLD',144,16);hud('1-1',152,24);
 hud('TIME',208,16);hud(String(Math.max(0,Math.ceil(timeLeft))).padStart(3,'0'),216,24);
}
function draw(){
 ctx.imageSmoothingEnabled=false;drawBackground();if(room==='surface'){drawCastle();drawFlag()}
 for(const it of items)if(it.emerge>0&&it.x>camera-20&&it.x<camera+W+20)drawItem(it);
 const minX=Math.floor(camera/T),maxX=minX+17;
 for(let x=minX;x<=maxX;x++)for(let y=0;y<15;y++){const t=tiles.get(tileKey(x,y));if(t)drawBlock(t)}
 for(const coin of looseCoins)drawCoin(coin.x-camera,coin.y);
 for(const e of enemies)if(e.x>camera-28&&e.x<camera+W+24)drawEnemy(e);
 for(const it of items)if(it.emerge<=0&&it.x>camera-20&&it.x<camera+W+20)drawItem(it);
 for(const shot of shots)sprite('fireball'+Math.floor(frame/3)%4,shot.x-camera-1,shot.y-1);
 drawPlayer();if(room==='surface'){for(const p of pipes)if(p.x>camera-40&&p.x<camera+W)drawPipe(p)}else drawUnderPipe();
 for(const p of particles){const x=p.x-camera;
  if(p.kind==='coin')drawCoin(x,p.y,frame,true);
  else if(p.kind==='debris')sprite('debris',x,p.y,Math.floor(frame/4)%2===1,Math.floor(frame/6)%2===1,room==='under'?'under':'normal');
  else rect(x,p.y,p.life>10?2:1,p.life>10?2:1,p.life%3?'#ffffff':'#fc9838');
 }
 for(const f of floaters)text(f.text,f.x-camera,f.y,'#ffffff',1,true);
 drawHud();updateUi();
}

function updateUi(force=false){if(!force&&frame-lastUi<12&&lastUi!==-1)return;lastUi=frame;const names={menu:'准备出发',playing:room==='under'?'地下奖励房':player?.star?'星光无敌':player?.power===2?'火焰形态':player?.power?'强壮形态':'正在冒险',paused:'已暂停',dying:'再试一次',respawn:'准备继续',pipe:'管道旅行中',flag:'成功抵达终点',win:'1-1 通关完成',gameover:'冒险结束'};$('stateLabel').textContent=names[mode]||'准备出发';$('livesLabel').textContent=lives<=5?Array(Math.max(0,lives)).fill('●').join(' '):'● × '+lives;const progress=mode==='win'?100:clamp((maxProgress-44)/(FLAG_X-44)*100,0,100);$('progressFill').style.width=progress+'%';$('distanceLabel').textContent=room==='under'?'BONUS ROOM':Math.floor(progress)+'% · WORLD 1-1';$('bestLabel').textContent='BEST '+String(best).padStart(6,'0');$('pauseButton').textContent=mode==='paused'?'继续 P':'暂停 P';$('soundButton').textContent=soundOn?'声音：开':'声音：关';}
function handlePrimary(){if(mode==='paused')togglePause();else if(mode==='respawn'){audioInit();keys.clear();resetLife();canvas.focus({preventScroll:true})}else startGame();}
$('mainAction').addEventListener('click',handlePrimary);$('pauseButton').addEventListener('click',()=>togglePause());$('restartButton').addEventListener('click',()=>{startGame();toast('已重新开始 1-1')});$('soundButton').addEventListener('click',()=>setSoundEnabled(!soundOn));
async function fullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen()}else{const target=matchMedia('(pointer:coarse)').matches?document.documentElement:$('stage');if(target.requestFullscreen)await target.requestFullscreen();else toast('此浏览器不支持全屏；可横屏游玩。')}}catch{toast('未能进入全屏；游戏仍可正常游玩。')}}
$('fullButton').addEventListener('click',fullscreen);
const mapped=new Set(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space','KeyA','KeyD','KeyS','KeyW','KeyK','KeyZ','KeyJ','KeyX','ShiftLeft','ShiftRight','Enter','KeyP','KeyR','KeyF','Escape']);
window.addEventListener('keydown',e=>{if(!mapped.has(e.code))return;e.preventDefault();if(e.repeat)return;if(e.code==='KeyP'||e.code==='Escape'){togglePause();return}if(e.code==='KeyR'){startGame();return}if(e.code==='KeyF'){fullscreen();return}if(e.code==='Enter'||e.code==='Space'&&['menu','win','gameover','respawn','paused'].includes(mode)){if(['menu','win','gameover','respawn','paused'].includes(mode))handlePrimary();else if(e.code==='Enter')togglePause();return}keys.add(e.code);audioInit();},{passive:false});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(mapped.has(e.code))e.preventDefault()},{passive:false});
function releaseAll(){keys.clear();touch.clear();document.querySelectorAll('.touchkey').forEach(b=>b.classList.remove('pressed'));if(mode==='playing')togglePause()}
window.addEventListener('blur',()=>{if(!manual)releaseAll()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&!manual)releaseAll()});
for(const b of document.querySelectorAll('[data-action]')){b.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();b.setPointerCapture(e.pointerId);touch.set(e.pointerId,b.dataset.action);b.classList.add('pressed')},{passive:false});const release=e=>{e.preventDefault();touch.delete(e.pointerId);b.classList.remove('pressed')};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',e=>{touch.delete(e.pointerId);b.classList.remove('pressed')});b.addEventListener('contextmenu',e=>e.preventDefault())}
canvas.addEventListener('pointerdown',()=>{audioInit();canvas.focus({preventScroll:true})});
window.addEventListener('error',e=>{let box=document.createElement('div');box.className='fatal';box.textContent='游戏遇到错误（不是黑屏）：\n'+(e.message||'未知错误')+'\n\n请使用 Chrome 或 Edge 打开 HTML 文件，并保留此错误信息。';document.body.appendChild(box);mode='error'});

// Audio observers wrap existing lifecycle functions; the simulation is unchanged.
const simulationStep=fixedUpdate;fixedUpdate=function(){simulationStep();audioSync();};
const simulationReset=resetLife;resetLife=function(){resetGameAudio();simulationReset();mixAudio();audioSync();};
const simulationPause=togglePause;togglePause=function(){const was=mode;simulationPause();if(mode==='paused'&&was!==mode){stopEffects();stopMusic(true);oneShot('pause',{ui:true});}mixAudio();audioSync();};
wireAudioUI();
if(new URLSearchParams(location.search).has('test'))window.__audioTest={
 prepare:prepareAudio,install:installAudio,manifest:AUDIO_MANIFEST,raw:rawAudio,bank,log:audioLog,sync:audioSync,init:audioInit,fx:sfx,mute:setSoundEnabled,
 status(){return {ready:bank.size,raw:rawAudio.size,total:AUDIO_MANIFEST.length,failed:audioFailed,context:audio?.state,bgm:bgm?.key||null,held:heldTrack?.key||null,offset:heldTrack?.offset??0,desired:desiredMusic(),voices:[...voices].map(v=>v.key),musicVolume,effectsVolume,soundOn,clearPlayed,gameoverPlayed,hurryPlayed,holdUntil,deathUntil,flagUntil};},
 level(){if(!analyser)return 0;const x=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(x);return Math.sqrt(x.reduce((a,b)=>a+b*b,0)/x.length);},
 setState(values){if(values.star!==undefined)player.star=values.star;if(values.time!==undefined)timeLeft=values.time;if(values.mode!==undefined)mode=values.mode;if(values.flagPhase!==undefined)flagPhase=values.flagPhase;audioSync();},
 injectFixture(buffer){const ac=audioInit(false);for(const m of AUDIO_MANIFEST)bank.set(m.key,{buffer,gain:.7});audioSync();},
};

// Bill's platform descent is a temporary player-only collision exception.
let billAimX=1,billAimY=0;
let billAimDown=false,billDropRow=null,billDropCollision=false,billDownJumpHeld=false;
function resetBillControls(){billAimX=1;billAimY=0;billAimDown=false;billDropRow=null;billDropCollision=false;billDownJumpHeld=false;}
function billPassablePlatform(t){return !t.hidden&&t.y<13&&(t.type==='brick'||t.type==='question');}
const billSolidQuery=solids;solids=function(box,hidden=false){const hits=billSolidQuery(box,hidden);return billDropCollision&&billDropRow!==null?hits.filter(t=>t.y!==billDropRow||!billPassablePlatform(t)):hits;};
const billMoveBody=moveBody;moveBody=function(body,dx,dy,isPlayer=false){if(hero!=='bill'||!isPlayer||body!==player||billDropRow===null)return billMoveBody(body,dx,dy,isPlayer);billDropCollision=true;try{billMoveBody(body,dx,dy,isPlayer);}finally{billDropCollision=false;}if(body.y>=(billDropRow+1)*T)billDropRow=null;};
function beginBillDescent(input){const held=!!input.down&&!!input.jump,edge=held&&!billDownJumpHeld;billDownJumpHeld=held;if(!edge||!player.grounded||room!=='surface')return false;const foot=player.y+player.h,support=billSolidQuery({x:player.x,y:foot,w:player.w,h:1});if(!support.length||!support.every(t=>billPassablePlatform(t)&&Math.abs(t.y*T-foot)<1))return false;billDropRow=support[0].y;player.grounded=false;player.vy=.7;player.crouch=false;jumpBuffer=0;return true;}

function updateBillAim(input){const horizontal=(input.right?1:0)-(input.left?1:0);billAimY=input.down&&(!player.grounded||horizontal)?1:input.up&&!input.down?-1:0;billAimX=billAimY?horizontal:player.facing;}

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

// Injected inside the recovered game's closure. Original map and Mario routines remain the authority.
let hero='mario',mixShots=[],mixCharge=0,mixHeld=false,mixHp=3,mixSpread=false,mixCool=0,mixAim=0;
let mixTier=0,upgradeFrames=0,mixCrouch=false,mixDeathOrigin=null;
const heroNames={mario:'马里奥',bill:'比尔',megaman:'洛克人'};
const heroHelp={mario:'原版移动与跳跃；蘑菇长大，火焰花发射火球。',bill:'按住 X / J / 手柄 B 连射；方向组合八向瞄准（↑+左右斜上、↓+左右斜下）；地面单按 ↓ 趴射，空中 ↓ 向下射击；砖平台 ↓ + 跳跃向下穿过；补给随机切换 M 连射、S 散弹、F 火球、L 激光；普通怪需两枪；接触敌人或中弹一击死亡，不能踩头；有剩余生命时自动就近复活，恢复普通枪并闪烁无敌约2秒。',megaman:'按住 X / J / 手柄 B 蓄力，松开发射；武器能量依次升级强化炮、破防贯穿炮。'};
const mixImages={};
const mixReady=Promise.all(['bill','megaman','mega-health-large','mega-weapon-energy-large','weapon-energy-small','projectiles/contra-normal','projectiles/contra-machine','projectiles/contra-spread','projectiles/contra-spread-far','projectiles/contra-fire','projectiles/contra-laser','projectiles/contra-laser-up','projectiles/contra-laser-diag'].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4)if(d.data[i]===111&&d.data[i+1]===49&&d.data[i+2]===152)d.data[i+3]=0;g.putImageData(d,0,0);mixImages[id]=c;resolve();};im.onerror=reject;im.src='assets/'+id+'.png';})));
function mixCrop(id,r,x,y,scale=1,flip=false){const im=mixImages[id];if(!im)return;ctx.save();ctx.translate(Math.round(x)+(flip?r[2]*scale:0),Math.round(y));ctx.scale(flip?-scale:scale,scale);ctx.drawImage(im,...r,0,0,r[2],r[3]);ctx.restore();}
function mixReset(){mixDeathOrigin=null;resetBillState();mixCrouch=false;mixTier=0;upgradeFrames=0;mixShots=[];mixCharge=0;mixHeld=false;mixHp=3;mixSpread=false;mixCool=0;mixAim=0;}
const originalResetLife=resetLife;resetLife=function(){mixReset();originalResetLife();if(hero!=='mario'){const bottom=player.y+player.h;player.h=hero==='bill'?30:24;player.y=bottom-player.h;}updateHeroUI();};
const originalLoadRoom=loadRoom;loadRoom=function(r){resetBillControls();mixShots=[];mixCharge=0;mixHeld=false;originalLoadRoom(r);};
const originalAudioPanel=updateAudioPanel;updateAudioPanel=function(){originalAudioPanel();if(bank.size===AUDIO_MANIFEST.length)audioStatus('音乐与音效已就绪');};
const originalDesiredMusic=desiredMusic;desiredMusic=function(){if(hero==='mario')return originalDesiredMusic();return mode==='playing'?(hero==='bill'?'bill_theme':'mega_theme'):null;};
// Keep original scheduling (including deathUntil); select character-specific recordings.
const originalOneShot=oneShot;oneShot=function(key,options={}){if(hero!=='mario'&&key==='death')key=hero==='bill'?'bill_death':'mega_death';return originalOneShot(key,options);};
const originalSfx=sfx;sfx=function(name){if(hero==='mario')return originalSfx(name);if(name==='jump')return;if(name==='kick'&&hero==='bill'){oneShot('bill_hit');return;}if(name==='power'){oneShot(hero==='megaman'?'mega_energy':'bill_pickup');return;}if(name==='hurt'){oneShot(hero==='megaman'?'mega_hurt':'bill_death');return;}originalSfx(name);};
// Original Mario power-up choice is untouched. Convert only newly spawned character power items.
const originalBumpTile=bumpTile;bumpTile=function(t){const isPower=t.content==='power',count=items.length;originalBumpTile(t);if(hero!=='mario'&&isPower&&items.length>count){const it=items[items.length-1];it.type=hero==='bill'?('bill-'+nextBillDrop()):(mixTier===0?'weaponenergy':'weaponcore');it.vx=0;}};
function showUpgrade(label){upgradeFrames=90;const n=$('upgradeNotice');if(n){n.textContent=label;n.hidden=false;}}
const originalTransform=transform;transform=function(it){if(hero==='mario'){const prior=player.power;originalTransform(it);if(player.power>prior)showUpgrade(player.power===1?'SUPER MARIO · 超级马里奥':'FIRE MARIO · 火焰马里奥');return;}if(it.type==='life'||it.type==='star')return originalTransform(it);mixTier=Math.min(2,mixTier+1);if(hero==='bill'){billWeapon=it.type.startsWith('bill-')?it.type.slice(5):'M';mixSpread=billWeapon==='S';}if(hero==='megaman')mixHp=3;addScore(1000,it.x,it.y);player.invuln=Math.max(player.invuln,45);sfx('power');showUpgrade(heroNames[hero]+' · '+(hero==='bill'?BILL_WEAPON_NAMES[billWeapon]:['普通炮','强化炮','破防贯穿炮'][mixTier]));updateHeroUI();};
const originalDamage=damage;damage=function(){if(hero==='mario')return originalDamage();if(mode!=='playing'||player.invuln||player.star)return;if(hero==='megaman'&&--mixHp>0){player.invuln=120;freeze=12;sfx('hurt');updateHeroUI();return;}die();};
const originalShoot=shoot;shoot=function(){if(hero==='mario')return originalShoot();};
function billPose(){const n=player.grounded&&!mixCrouch&&Math.abs(player.vx)>.1?Math.floor(billMotion)%3:-1;return{n,bob:n===1?1:0,x:Math.round(player.x+player.w/2),foot:Math.round(player.y+player.h)};}
function billMuzzle(){const q=billPose();if(billBase)return{x:billBase.x-(billBase.crouch?1:0),y:billBase.y-(billBase.crouch?32:38)};if(!player.grounded){const length=Math.hypot(billAimX,billAimY)||1;return{x:q.x+billAimX/length*14,y:q.foot-14+billAimY/length*14};}if(billAimX&&billAimY)return{x:q.x+player.facing*(billAimY<0?10.5:12.5),y:q.foot+(billAimY<0?-35:-14)+q.bob+(billFireFrames>0?1:0)};if(mixCrouch)return{x:q.x+player.facing*17,y:q.foot-9};if(mixAim)return q.n<0?{x:q.x-player.facing*1.5,y:q.foot-45}:{x:q.x+player.facing*2.5,y:q.foot-44+(billFireFrames>0?1:0)+q.bob};return{x:q.x+player.facing*13,y:q.foot-20.5+(billFireFrames>0?1:0)+q.bob};}
function mixFire(charged=false){if(hero==='bill')return fireBillWeapon();if(mixCool||mode!=='playing')return;const face=player.facing;let dx=face,dy=0;if(hero==='bill'&&mixAim){dx=0;dy=-1;}const muzzle=hero==='bill'?billMuzzle():{x:player.x+player.w/2+dx*12,y:player.y+player.h-13+dy*12};const speed=hero==='bill'?4.8:4;const angles=hero==='bill'&&mixTier===2?[-.32,-.16,0,.16,.32]:[0];const size=hero==='bill'?[3,5,6][mixTier]:0;const width=hero==='bill'?size:charged?(mixTier?27:12):(mixTier?12:8),height=hero==='bill'?size:charged?(mixTier?20:8):(mixTier?8:6);for(const a of angles){const vx=(dx*Math.cos(a)-dy*Math.sin(a))*speed,vy=(dy*Math.cos(a)+dx*Math.sin(a))*speed;mixShots.push({x:muzzle.x-width/2,y:muzzle.y-height/2,w:width,h:height,vx,vy,life:90,charged,tier:mixTier,damage:charged?2+mixTier:mixTier?2:1,piercing:hero==='megaman'&&charged&&mixTier===2,hitIds:[]});}mixCool=hero==='bill'?12:14;oneShot(charged?(mixTier?'mega_charge_nes':'mega_charge_weak'):'mega_shot_nes');}
function mixHitEnemy(e,s){killEnemy(e,true,100);return true;}
const originalUpdatePlayer=updatePlayer;updatePlayer=function(input){if(hero==='mario')return originalUpdatePlayer(input);mixAim=!!input.up&&!input.down;if(billFireFrames)billFireFrames--;if(input.left!==input.right&&(input.left||input.right))player.facing=input.left?-1:1;if(mixCool)mixCool--;if(hero!=='bill'){if(input.run){mixCharge=Math.min(90,mixCharge+1);if(mixCharge===(mixTier?30:45))oneShot('mega_charge_start');}if(!input.run&&mixHeld){for(const v of [...voices])if(v.key==='mega_charge_start')stopVoice(v);mixFire(mixCharge>=(mixTier?30:45));mixCharge=0;}mixHeld=!!input.run;}if(hero==='bill'){beginBillDescent(input);const wants=!!input.down&&player.grounded&&!input.jump&&!input.left&&!input.right;const target=wants?17:30;const candidate={x:player.x,y:player.y+player.h-target,w:player.w,h:target};if(target<player.h||!solids(candidate).length){player.y=candidate.y;player.h=target;mixCrouch=wants;}player.crouch=mixCrouch;if(mixCrouch)player.vx=0;}const priorX=player.x;originalUpdatePlayer({...input,jump:hero==='bill'&&billDropRow!==null?false:input.jump,run:true});if(hero==='bill'){const distance=Math.abs(player.x-priorX);if(player.grounded){billAirTicks=0;if(distance>.04&&!mixCrouch)billMotion+=distance/20;else billMotion=0;}else billAirTicks++;billAimDown=!!input.down&&!player.grounded;mixAim=!!input.up&&!input.down;jumpHeldPrev=!!input.jump;updateBillAim(input);if(input.run)mixFire();}};
function mixHitWall(s){const hits=solids(s);if(!hits.length)return true;for(const t of hits){if(t.content&&!t.used){bumpTile(t);continue;}if(t.type==='brick'&&!t.content&&!t.used){t.shotHp=(t.shotHp??2)-s.damage;if(t.shotHp<=0){tiles.delete(tileKey(t.x,t.y));addScore(50);sfx('break');for(let i=0;i<4;i++)particles.push({kind:'debris',x:t.x*T+i%2*8,y:t.y*T+Math.floor(i/2)*8,w:7,h:7,vx:(i%2?1:-1)*1.5,vy:-3.5,life:55});}else{sfx('bump');particles.push({kind:'spark',x:s.x,y:s.y,vy:-.5,life:10});}}else{sfx('bump');particles.push({kind:'spark',x:s.x,y:s.y,vy:-.5,life:10});}}return false;}
const originalUpdateEntities=updateEntities;updateEntities=function(){originalUpdateEntities();if(hero==='mario')return;for(const s of mixShots){if(!advanceMixProjectile(s))continue;if(!mixHitWall(s))s.life=0;if(s.life>0)for(const e of enemies)if(!e.dead&&e.active&&overlap(s,e)){if(!s.hitIds.includes(e.uid)){s.hitIds.push(e.uid);const damaged=mixHitEnemy(e,s);if(!damaged||!s.piercing)s.life=0;}break;}}mixShots=mixShots.filter(s=>s.life>0&&s.x>camera-20&&s.x<camera+W+20&&s.y>32&&s.y<H);};
const originalDrawItem=drawItem;drawItem=function(it){if(it.type.startsWith('bill-')){const col={M:0,S:2,L:3,F:4}[it.type.slice(5)];mixCrop('bill',[1+col*29,210,28,28],it.x-camera-7,it.y+it.h-26,1);return;}if(it.type==='weaponenergy'||it.type==='weaponcore'){const im=it.type==='weaponenergy'?'weapon-energy-small':'mega-weapon-energy-large';mixCrop(im,[Math.floor(frame/9)%2*32,Math.floor(frame/18)%2*32,32,32],it.x-camera-10,it.y+it.h-32);return;}originalDrawItem(it);};
const originalDrawPlayer=drawPlayer;drawPlayer=function(){if(hero==='mario')return originalDrawPlayer();const p=player;if((mode==='flag'&&flagPhase>=2)||mode==='win')return;if(p.invuln&&Math.floor(frame/4)%2&&mode!=='dying')return;const x=p.x-camera+p.w/2,y=p.y+p.h,face=p.facing,run=Math.abs(p.vx)>.1,jump=!p.grounded&&mode!=='pipe'&&!(mode==='flag'&&flagPhase===0);ctx.save();ctx.translate(Math.round(x),Math.round(y));if(face<0)ctx.scale(-1,1);
 if(hero==='bill'){const scale=1;if(mode==='dying'){drawBillDeath(0,0);}else if(mode==='flag'&&flagPhase===0){mixCrop('bill',[59+Math.floor(flagTimer/8)%2*29,65,28,57],-14,-55);}else if(jump){const n=Math.floor(billAirTicks/5)%4;mixCrop('bill',[117+n%2*29,123+Math.floor(n/2)*29,28,28],-14,-28);}else if(mixCrouch){mixCrop('bill',[130,mixCool?43:13,34,17],-17,-17);}else if(billAimX&&billAimY){const q=billPose(),r=q.n<0?[291,123]:[[320,123],[291,152],[320,152]][q.n];mixCrop('bill',[...r,28,28],-14,-26);mixCrop('bill',[billFireFrames>0?204:175,billAimY<0?123:65,28,57],-11,(billAimY<0?-56:-53)+q.bob);}else if(mixAim){const q=billPose();if(q.n<0)mixCrop('bill',[59,7,28,57],-14,-55);else{const r=[[320,123],[291,152],[320,152]][q.n];mixCrop('bill',[...r,28,28],-14,-26);mixCrop('bill',[billFireFrames>0?262:233,123,28,57],-14,-57+q.bob);}}else if(jump&&!mixCool&&!mixAim){const n=Math.floor(billAirTicks/5)%4;mixCrop('bill',[117+n%2*29,123+Math.floor(n/2)*29,28,28],-14,-28,scale);}else{const n=billPose().n,r=n<0?[291,123]:[[320,123],[291,152],[320,152]][n];mixCrop('bill',[...r,28,28],-14,-26,scale);mixCrop('bill',mixAim?[233,65,57,28]:[117,billFireFrames>0?94:65,57,28],-28,(-38+(n===1?1:0)),scale);}}
 else if(mode==='dying'&&mixDeathOrigin){
  // Original Mega Man death uses concentric sprite particles, not Mario's body arc.
  const age=Math.max(0,deathTick-12),cells=[[37,115],[55,115],[37,133],[55,133]];
  const r=[...cells[Math.floor(deathTick/4)%4],17,17];
  const cx=(mixDeathOrigin.x-p.x)*face,cy=mixDeathOrigin.y-(p.y+p.h);
  for(const [count,speed] of [[4,.8],[8,1.6]])for(let i=0;i<count;i++){
   const angle=i*Math.PI*2/count;
   mixCrop('megaman',r,cx+Math.cos(angle)*age*speed-8,cy+Math.sin(angle)*age*speed-9);
  }
 }else if(mode==='flag'&&flagPhase===0){
  mixCrop('megaman',[225,47,16,29],-8,-29,1,Math.floor(flagTimer/8)%2===1);
 }else {const col=jump?181:run?73+36*(Math.floor(p.anim/12)%3):37,row=mixCool?79:jump||run?43:7;mixCrop('megaman',[col,row,35,35],-17,-33);if(mixCool)mixCrop('megaman',[290,156,13,6],3,-14);if(mixCharge>=(mixTier?30:45)){ctx.strokeStyle=frame%8<4?'#7bffff':'#ffffff';ctx.strokeRect(-12,-26,24,25);}}
 ctx.restore();};
const originalDraw=draw;draw=function(){originalDraw();for(const s of mixShots){if(s.delay>0)continue;if(hero==='bill'){drawBillShot(s);continue;}const r=s.charged&&s.tier>0?[109+36*(Math.floor((90-s.life)/4)%3),115,35,35]:[73+18*(Math.floor((90-s.life)/5)%2),s.charged||s.tier?133:115,17,17];const cx=s.x+s.w/2-camera,cy=s.y+s.h/2;if(s.piercing){for(let i=2;i>0;i--){ctx.save();ctx.globalAlpha=.18/i;mixCrop('megaman',r,cx-r[2]/2-Math.sign(s.vx)*i*7,cy-r[3]/2,1,s.vx<0);ctx.restore();}}mixCrop('megaman',r,cx-r[2]/2,cy-r[3]/2,1,s.vx<0);}if(hero!=='mario'){ctx.fillStyle='#5c94fc';ctx.fillRect(22,14,56,9);hud(hero==='bill'?'BILL':'MEGAMAN',24,16);}updateHeroUI();};
const originalGetInput=getInput;getInput=function(){const input=originalGetInput();if(padActionConsumed&&!virtualInput&&!['Space','KeyK','KeyZ','ArrowUp','KeyW'].some(k=>keys.has(k))&&![...touch.values()].includes('jump'))input.jump=false;if(hero!=='mario'){input.up=virtualInput?!!virtualInput.up:keys.has('ArrowUp')||keys.has('KeyW')||!!padState?.buttons[12]?.pressed||(padState?.axes[1]??0)<-.4;if(!virtualInput&&(keys.has('ArrowUp')||keys.has('KeyW')))input.jump=keys.has('Space')||keys.has('KeyK')||keys.has('KeyZ')||[...touch.values()].includes('jump')||(!padActionConsumed&&!!padState?.buttons[0]?.pressed);}return input;};
let padState=null,padMenuPrevious=false,padSelectPrevious=0,padStartPrevious=false,padConfirmPrevious=false,padActionConsumed=false,padDialogIndex=0,padDialogMode='';
function focusPadDialog(){const buttons=[$('mainAction'),$('overlayCharacters')].filter(b=>!b.hidden);padDialogIndex=Math.min(padDialogIndex,buttons.length-1);buttons.forEach((b,i)=>b.classList.toggle('pad-selected',i===padDialogIndex));buttons[padDialogIndex]?.focus({preventScroll:true});return buttons[padDialogIndex];}
const padShowOverlay=showOverlay;showOverlay=function(...args){padDialogIndex=0;padDialogMode='';for(const id of ['mainAction','overlayCharacters'])$(id).classList.remove('pad-selected');padShowOverlay(...args);};
function pollMixPad(){
 if(virtualInput)return;
 try{padState=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected!==false)||null;}catch{padState=null;}
 const label=$('gamepadStatus');if(label)label.textContent=padState?'手柄已连接 · 方向选择 · A / Start 确认 · Select 重选':'手柄：连接后按一下按钮 · A 跳跃 · B / X 行动';
 if(!padState){padActionConsumed=false;padMenuPrevious=false;padStartPrevious=false;padConfirmPrevious=false;padSelectPrevious=0;return;}
 const start=!!padState.buttons[9]?.pressed,confirm=!!padState.buttons[0]?.pressed,menu=!!padState.buttons[8]?.pressed;
 if(!confirm)padActionConsumed=false;
 const horizontal=(padState.buttons[15]?.pressed||padState.axes[0]>.5?1:0)-(padState.buttons[14]?.pressed||padState.axes[0]<-.5?1:0),vertical=(padState.buttons[13]?.pressed||padState.axes[1]>.5?1:0)-(padState.buttons[12]?.pressed||padState.axes[1]<-.5?1:0),dir=horizontal||vertical;
 const dialog=['respawn','win','gameover','paused'].includes(mode);
 if(dialog){
  if(padDialogMode!==mode){padDialogMode=mode;padDialogIndex=0;focusPadDialog();$('overlayHint').textContent='↑ ↓ 选择 · A / START 确认 · SELECT 重选';}
  if(dir&&dir!==padSelectPrevious){padDialogIndex=(padDialogIndex+(dir>0?1:-1)+2)%2;focusPadDialog();}
  if((start&&!padStartPrevious)||(confirm&&!padConfirmPrevious)){if(confirm&&!padConfirmPrevious)padActionConsumed=true;audioInit();focusPadDialog()?.click();}
 }else{
  padDialogMode='';
  if(mode==='menu'&&dir&&dir!==padSelectPrevious){const ids=Object.keys(heroNames);selectHero(ids[(ids.indexOf(hero)+dir+3)%3]);document.querySelector('[data-hero="'+hero+'"]')?.focus();}
  if(start&&!padStartPrevious){audioInit();if(mode==='menu'){if(confirm)padActionConsumed=true;handlePrimary();}else togglePause();}
  else if(mode==='menu'&&confirm&&!padConfirmPrevious){padActionConsumed=true;audioInit();handlePrimary();}
 }
 if(menu&&!padMenuPrevious)showCharacters();
 padStartPrevious=start;padConfirmPrevious=confirm;padMenuPrevious=menu;padSelectPrevious=dir;
}
const originalFixedUpdate=fixedUpdate;fixedUpdate=function(){pollMixPad();if(hero==='bill'&&mode==='dying'&&deathTick>=89&&lives>0){reviveBillNearby();return;}originalFixedUpdate();if(upgradeFrames&&mode==='playing')upgradeFrames--;if($('upgradeNotice'))$('upgradeNotice').hidden=upgradeFrames===0;};
function updateHeroUI(){$('stage').style.setProperty('--scene-background',room==='under'&&hero==='bill'?'#183858':room==='under'?'#000000':'#5c94fc');const n=$('heroStatus');if(n)n.textContent=hero==='mario'?'马里奥 · '+(player?.power===2?'火焰':player?.power?'超级':'小马里奥'):hero==='bill'?'比尔 · '+BILL_WEAPON_NAMES[billWeapon]+(mixCrouch?' · 趴射':''):'洛克人 · '+['Lv.0 普通炮','Lv.1 强化炮','Lv.2 破防贯穿炮'][mixTier]+' · HP '+Math.max(0,mixHp)+'/3'+(mixCharge>=(mixTier?30:45)?' · 蓄力完成':'');}
function selectHero(id){if(!heroNames[id]||mode!=='menu')return;hero=id;for(const b of document.querySelectorAll('[data-hero]'))b.setAttribute('aria-pressed',String(b.dataset.hero===hero));$('actionLabel').textContent={mario:'加速 / 火球',bill:'按住连射',megaman:'按住蓄力 / 松开发射'}[id];$('downLabel').textContent=hero==='mario'?'下蹲 / 进入管道':hero==='bill'?'趴下 / 进入管道':'进入管道';$('heroHelp').textContent=heroHelp[id];$('overlayText').textContent=heroHelp[id];updateHeroUI();}
function showCharacters(){mode='menu';keys.clear();touch.clear();mixReset();resetGameAudio();showOverlay('CHOOSE YOUR HERO','WORLD<br>1 — 1',heroHelp[hero],'开始冒险 →','方向选择角色 · START / ENTER 开始');$('heroPicker').hidden=false;$('overlay').classList.add('choosing');$('overlayCharacters').hidden=true;updateHeroUI();requestAnimationFrame(()=>document.querySelector('[data-hero="'+hero+'"]')?.focus({preventScroll:true}));}
const originalStart=startGame;startGame=function(){$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');$('overlayCharacters').hidden=false;originalStart();};
$('charactersButton').addEventListener('click',()=>showCharacters());$('stageCharacters').addEventListener('click',()=>showCharacters());$('overlayCharacters').addEventListener('click',()=>showCharacters());window.addEventListener('keydown',e=>{if(e.code==='KeyC'){e.preventDefault();showCharacters();}else if(mode==='menu'&&['ArrowLeft','ArrowRight'].includes(e.code)){const ids=Object.keys(heroNames);selectHero(ids[(ids.indexOf(hero)+(e.code==='ArrowRight'?1:2))%3]);}});document.querySelectorAll('[data-hero]').forEach(b=>b.addEventListener('click',()=>selectHero(b.dataset.hero)));selectHero('mario');$('overlay').classList.add('choosing');
window.__mixReady=mixReady;
if(new URLSearchParams(location.search).has('test'))window.__mixTest={select(id){showCharacters();selectHero(id);startGame();draw();},state(){return{hero,weapon:billWeapon,crouch:mixCrouch,aimDown:billAimDown,aimX:billAimX,aimY:billAimY,dropRow:billDropRow,tier:mixTier,hp:mixHp,spread:mixSpread,charge:mixCharge,cool:mixCool,shots:mixShots.map(s=>({...s})),desired:desiredMusic()};},menu:showCharacters,ready:mixReady};

function drawPortraits(){for(const c of document.querySelectorAll('[data-portrait]')){const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,64,80);const id=c.dataset.portrait;if(id==='mario'){const im=classicSprite('small_idle');g.drawImage(im,Math.round(32-im.width),Math.round(65-im.height*2),im.width*2,im.height*2);}else if(id==='megaman'){g.drawImage(mixImages.megaman,37,7,35,35,-3,0,70,70);}else{g.drawImage(mixImages.bill,291,123,28,28,4,22,56,56);g.drawImage(mixImages.bill,117,65,57,28,-24,-2,114,56);}}}
mixReady.then(drawPortraits);
function integerFullscreen(){const scale=Math.min(innerWidth/256,innerHeight/240);$('stage').style.setProperty('--pixel-width',256*scale+'px');$('stage').style.setProperty('--pixel-height',240*scale+'px');}
addEventListener('resize',integerFullscreen);document.addEventListener('fullscreenchange',integerFullscreen);integerFullscreen();

// Bill-only bonus-room hooks; surface movement, poses and audio routes remain above.
const crossBaseLoadRoom=loadRoom;loadRoom=function(r){crossBaseLoadRoom(r);if(hero==='bill'&&r==='under')enterBillBase();else billBase=null;};
const crossBaseReset=mixReset;mixReset=function(){billBase=null;crossBaseReset();};
const crossBaseUpdatePlayer=updatePlayer;updatePlayer=function(input){if(billBase){updateBillBase(input);return;}crossBaseUpdatePlayer(input);};
const crossBaseDraw=draw;draw=function(){if(billBase){drawBillBase();return;}crossBaseDraw();};

// Scripted finish movement bypasses updatePlayer; advance its locomotion phase too.
const crossAdvanceFlag=advanceFlag;advanceFlag=function(){const priorX=player.x;crossAdvanceFlag();if(hero==='bill'&&mode==='flag'&&flagPhase===1){const distance=Math.abs(player.x-priorX);if(player.grounded){billAirTicks=0;if(distance>.01)billMotion+=distance/20;else billMotion=0;}else billAirTicks++;}};
if(window.__mixTest)window.__mixTest.placeNative=function(x,y){player.x=x;player.y=y;player.vx=0;player.vy=0;player.grounded=false;camera=clamp(x-100,0,LEVEL_WIDTH-W);draw();};

// Death anchors stay at the hit location; original Mario physics remain untouched.
const crossDie=die;die=function(){
 if(mode==='playing'&&hero!=='mario')mixDeathOrigin={x:player.x,y:player.y+player.h-15,foot:player.y+player.h,grounded:player.grounded};
 crossDie();
};
function drawBillDeath(x,y){
 const settled=mixDeathOrigin?.grounded&&deathTick>48&&player.y+player.h>=mixDeathOrigin.foot;
 if(settled)mixCrop('bill',[185,19,34,11],x-17,y+mixDeathOrigin.foot-(player.y+player.h)-11);
 else {const r=Math.floor(deathTick/7)%2?[250,44,23,15]:[251,13,23,18];mixCrop('bill',r,x-11,y-r[3]);}
}
const crossBeginPipe=beginPipe;beginPipe=function(){
 const entered=crossBeginPipe();
 if(entered&&hero==='bill'){
  const foot=player.y+player.h;player.h=30;player.y=foot-30;
  mixCrouch=false;player.crouch=false;mixAim=false;billAimX=player.facing;billAimY=0;
  pipeTransition.startY=player.y;
 }
 return entered;
};

// Bill loses a life on one hit and revives locally without rebuilding the room.
function billSafeRespawn(){
 const origin=mixDeathOrigin||{x:player.x,foot:FLOOR};
 const candidates=[];
 for(const t of tiles.values()){
  const q={x:t.x*T+3,y:t.y*T-30,w:10,h:30};
  if(q.y<40||q.y+q.h>FLOOR||solids(q).length||!solids({x:q.x,y:q.y+30,w:10,h:1}).length)continue;
  const nearScreen=q.x>=camera&&q.x+10<=camera+W;
  const clear=!enemies.some(e=>!e.dead&&overlap({x:q.x-20,y:q.y-8,w:50,h:46},e));
  candidates.push({...q,cost:Math.abs(q.x-origin.x)+Math.abs(q.y+30-Math.min(FLOOR,origin.foot))*.5+(nearScreen?0:400)+(clear?0:800)});
 }
 candidates.sort((a,b)=>a.cost-b.cost);
 return candidates[0]||{x:44,y:FLOOR-30};
}
function reviveBillNearby(){
 const spot=billBase?null:billSafeRespawn(),facing=player.facing;
 resetBillState();mixTier=0;mixSpread=false;mixCrouch=false;mixShots=[];shots=[];enemyShots=[];mixCool=0;mixCharge=0;mixHeld=false;mixAim=false;upgradeFrames=0;freeze=0;deathTick=0;
 if(billBase){Object.assign(billBase,{stun:0,crouch:false,upHeld:false,moving:false,walkDistance:0,walkFrame:0,hostile:[]});billBase.x=clamp(billBase.x,58,198);syncBillBasePlayer();}
 else{player=createPlayer(spot.x,spot.y);player.h=30;player.grounded=true;camera=clamp(camera,0,LEVEL_WIDTH-W);}
 player.facing=facing;player.invuln=120;player.star=0;player.vx=0;player.vy=0;
 mixDeathOrigin=null;if(timeLeft===0){timeLeft=400;timerTicks=0;}
 mode='playing';hideOverlay();resetGameAudio();audioSync();updateUi(true);updateHeroUI();
}

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

// Bill's Base 1 bonus room. Other characters retain the recovered underground room.
let billBase=null;
const BILL_BASE_FLOOR=208; // Original room's last blue-floor row 191 + offset 16 + exclusive edge 1.
const billBaseImages={};
const billBaseReady=Promise.all(['contra-base-room3','contra-base-room3-core','contra-base-floor-tile','contra-electric-fence','contra-bill-electric','contra-bill-crouch','contra-wall-turret-closed','contra-wall-turret-opening-1','contra-wall-turret-opening-2','contra-wall-turret-open'].map(id=>new Promise((resolve,reject)=>{
 const im=new Image();im.onload=()=>{billBaseImages[id]=im;resolve();};im.onerror=()=>reject(new Error('Base room asset: '+id));im.src='assets/contra-base/'+id+'.png';
}))).then(()=>{
 const clean=document.createElement('canvas');clean.width=256;clean.height=224;const g=clean.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(billBaseImages['contra-base-room3'],0,0);
 // Remove only the baked electric pixels; preserve the original fence posts and walls.
 for(const y of [136,152])for(let x=56;x<200;x+=32){const w=Math.min(32,200-x);g.drawImage(billBaseImages['contra-base-floor-tile'],0,0,w,8,x,y,w,8);}
 billBaseImages.cleanRoom=clean;
 const panel=document.createElement('canvas');panel.width=64;panel.height=48;const pg=panel.getContext('2d');pg.drawImage(clean,96,64,64,48,0,0,64,48);pg.fillStyle='#000';pg.fillRect(24,32,16,16);pg.fillRect(3,27,10,10);pg.fillRect(51,27,10,10);billBaseImages.openDoorPanel=panel;
});
function syncBillBasePlayer(){if(!billBase||!player)return;player.x=billBase.x-player.w/2;player.h=billBase.crouch?16:30;player.y=billBase.y-player.h;player.vx=0;player.vy=0;player.grounded=true;player.crouch=!!billBase.crouch;camera=0;}
function enterBillBase(){billBase={x:128,y:BILL_BASE_FLOOR,tick:0,walkDistance:0,walkFrame:0,moving:false,crouch:false,coreHitFlash:0,coreFeedback:0,coreHp:8,doorTicks:0,cleared:false,stun:0,upHeld:false,shocks:0,guards:[{x:96,y:104,w:16,h:16,hp:4,phase:0},{x:144,y:104,w:16,h:16,hp:4,phase:0}],hostile:[],reward:null,rewardClaimed:false,coinReward:null,coinsClaimed:false};mixShots=[];enemyShots=[];mixCool=0;mixCharge=0;mixHeld=false;mixCrouch=false;mixAim=true;freeze=0;syncBillBasePlayer();}
function updateBillBase(input){
 const b=billBase;if(!b)return;const priorX=b.x,priorY=b.y;b.moving=false;b.walkFrame=0;b.tick++;if(b.cleared)b.doorTicks=Math.min(32,b.doorTicks+1);if(b.coreHitFlash)b.coreHitFlash--;if(b.coreFeedback)b.coreFeedback--;if(player.invuln)player.invuln--;if(player.star)player.star--;if(mixCool)mixCool--;if(billFireFrames)billFireFrames--;
 b.crouch=!!input.down&&!b.stun;const up=!!input.up&&!b.crouch,wasUp=b.upHeld;b.upHeld=up;mixAim=true;billAimDown=false;mixCrouch=b.crouch;
 if(b.stun){b.stun--;syncBillBasePlayer();return;}
 if(up&&!wasUp&&!b.cleared){b.stun=48;b.shocks++;oneShot('bill_electric');syncBillBasePlayer();return;}
 if(!b.crouch)b.x=clamp(b.x+((input.right?1:0)-(input.left?1:0))*1.5,58,198);
 if(up&&b.cleared){b.x=approach(b.x,128,1.5);b.y=Math.max(126,b.y-1.5);if(b.y<=126){leaveBillBase();return;}}

 const distance=Math.hypot(b.x-priorX,b.y-priorY);b.moving=distance>.01;if(b.moving){b.walkDistance+=distance;b.walkFrame=Math.floor(b.walkDistance/12)%2;}else b.walkDistance=0;
 syncBillBasePlayer();if(input.run)fireBillWeapon();
}
const BASE_GUARD_FIRST_SHOT=120,BASE_GUARD_INTERVAL=120,BASE_GUARD_STAGGER=60,BASE_GUARD_WARNING=30;
function baseGuardFirstShot(g){return BASE_GUARD_FIRST_SHOT+billBase.guards.indexOf(g)*BASE_GUARD_STAGGER;}
function baseGuardWarning(g){const first=baseGuardFirstShot(g);return g.phase>=first-BASE_GUARD_WARNING&&(g.phase-(first-BASE_GUARD_WARNING))%BASE_GUARD_INTERVAL<BASE_GUARD_WARNING;}
function baseGuardsAlive(){return billBase.guards.filter(g=>g.hp>0);}
function updateBillBaseProjectiles(){
 const b=billBase;if(!b||mode!=='playing')return;const core={x:120,y:112,w:16,h:16};
 for(const g of b.guards){if(g.hp<=0){g.destroyTicks=(g.destroyTicks||0)+1;continue;}g.phase++;const phase=g.phase;g.open=phase>=24;
  // Single aimed shots, visible open barrel before firing, with a generous entry grace.
  const first=baseGuardFirstShot(g);
  if(phase>=first&&(phase-first)%BASE_GUARD_INTERVAL===0&&b.hostile.length<2){const dx=b.x-(g.x+8),dy=b.y-10-(g.y+16),d=Math.hypot(dx,dy)||1;b.hostile.push({x:g.x+6.5,y:g.y+14.5,w:3,h:3,vx:dx/d*.6,vy:dy/d*.6,life:240});}
 }
 for(const shot of mixShots){if(!advanceMixProjectile(shot))continue;

  const guard=b.guards.find(g=>g.hp>0&&overlap(shot,g));
  if(guard){shot.life=0;if(guard.open){guard.hp=Math.max(0,guard.hp-shot.damage);oneShot('bill_hit');if(!guard.hp){guard.destroyTicks=0;addScore(200,guard.x,guard.y);sfx('break');}}else sfx('bump');continue;}
  if(!b.cleared&&overlap(shot,core)){shot.life=0;if(baseGuardsAlive().length){sfx('bump');if(!b.coreFeedback){showUpgrade('核心受保护 · 先打掉两侧墙炮');b.coreFeedback=90;}continue;}
   b.coreHitFlash=8;b.coreHp=Math.max(0,b.coreHp-shot.damage);oneShot('bill_hit');if(!b.coreHp){b.cleared=true;b.stun=0;b.hostile=[];addScore(1000,128,112);sfx('break');b.reward={type:'bill-'+nextBillDrop(),x:121,y:130,w:14,h:14,age:0,vy:-3,targetX:58,grounded:false};b.coinReward={type:'base-coins',x:121,y:130,w:14,h:14,age:0,vy:-3,targetX:184,grounded:false};showUpgrade('基地攻破 · 左侧武器 / 右侧金币 · 可自行选择');}
  }
 }
 mixShots=mixShots.filter(shot=>shot.life>0&&shot.x+shot.w>32&&shot.x<224&&shot.y+shot.h>32&&shot.y<240);
 for(const shot of b.hostile){shot.x+=shot.vx;shot.y+=shot.vy;shot.life--;if(!b.crouch&&overlap(shot,player)){damage();shot.life=0;}}
 b.hostile=b.hostile.filter(shot=>shot.life>0&&shot.y<BILL_BASE_FLOOR&&mode==='playing');
 for(const [key,claimed] of [['reward','rewardClaimed'],['coinReward','coinsClaimed']]){const it=b[key];if(!it||b[claimed])continue;it.age++;
  if(!it.grounded){it.x=approach(it.x,it.targetX,2);it.vy+=.18;it.y+=it.vy;if(it.y+it.h>=BILL_BASE_FLOOR){it.y=BILL_BASE_FLOOR-it.h;it.grounded=true;it.vy=0;}}
  // Rewards finish their outward arc before becoming collectible; the clear position stays safe.
  if(it.grounded&&overlap(it,player)&&mode==='playing'){b[claimed]=true;if(key==='reward'){transform(it);showUpgrade('获得 '+BILL_WEAPON_NAMES[billWeapon]);}else{for(let n=0;n<10;n++)getCoin(it.x,it.y);showUpgrade('获得 10 金币');}upgradeFrames=180;}
 }

}
function leaveBillBase(){
 if(!billBase?.cleared||billBase.doorTicks<32)return;loadRoom('surface');const exit=pipes.find(p=>p.exit);
 camera=exit.x-56;player.x=exit.x+16-player.w/2;player.h=30;player.y=exit.y+2;player.vx=0;player.vy=0;player.grounded=false;
 mixAim=false;mixCrouch=false;pipeTransition={kind:'up',t:0,startY:player.y,target:exit.y-player.h};mode='pipe';sfx('pipe');
}
function drawBillBase(){
 const b=billBase;if(!b)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
 if(billBaseImages.cleanRoom)ctx.drawImage(billBaseImages.cleanRoom,0,16);
 if(!b.cleared&&billBaseImages['contra-electric-fence']){const sx=Math.floor(b.tick/4)%4*8;for(const y of [152,168])for(let x=56;x<200;x+=8)ctx.drawImage(billBaseImages['contra-electric-fence'],sx,0,8,8,x,y,8,8);}
 if(b.cleared){const lift=Math.round(b.doorTicks/32*48);ctx.save();ctx.beginPath();ctx.rect(96,80,64,48);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(96,80,64,48);if(lift<48&&billBaseImages.openDoorPanel)ctx.drawImage(billBaseImages.openDoorPanel,96,80-lift);ctx.restore();}
 if(!b.cleared){const locked=baseGuardsAlive().length>0;ctx.strokeStyle=b.coreHitFlash?'#ffed69':locked?'#888':'#fff';ctx.strokeRect(118.5,110.5,19,19);text(locked?'LOCK':'CORE',128,99,locked?'#aaa':'#fff',1,true);}
 // Native front-facing background tiles at their positions in the original third base room.
 for(const g of b.guards){if(b.cleared)continue;if(g.hp<=0){const im=billBaseImages['contra-wall-turret-open'];if(im)ctx.drawImage(im,g.x,g.y);ctx.fillStyle='#000';ctx.fillRect(g.x+3,g.y+3,10,10);if((g.destroyTicks||0)<24){const n=Math.floor((g.destroyTicks||0)/6)%2;mixCrop('bill',[1,65+n*29,28,28],g.x-6,g.y-6);}continue;}const phase=g.phase,id=g.open?'contra-wall-turret-open':phase>=20&&phase<24?'contra-wall-turret-opening-2':phase>=16&&phase<20?'contra-wall-turret-opening-1':'contra-wall-turret-closed';const im=billBaseImages[id];if(im)ctx.drawImage(im,g.x,g.y);if(g.open&&baseGuardWarning(g))text('!',g.x+6,g.y-8,'#fff');}
 if(b.reward&&!b.rewardClaimed)drawItem(b.reward);
 if(b.coinReward&&!b.coinsClaimed){drawCoin(b.coinReward.x,b.coinReward.y);text('10',b.coinReward.x+7,b.coinReward.y-10,'#fff',1,true);}
 for(const shot of b.hostile)mixCrop('projectiles/contra-normal',[0,0,3,3],shot.x,shot.y);
 if(mode==='dying'){drawBillDeath(player.x+player.w/2,player.y+player.h);}
 else if(mode!=='respawn'&&mode!=='gameover'){if(b.stun&&billBaseImages['contra-bill-electric']){ctx.save();ctx.globalAlpha=b.stun%6<3?1:.55;ctx.drawImage(billBaseImages['contra-bill-electric'],Math.round(b.x)-12,Math.round(b.y)-45);ctx.restore();}
 else if(b.crouch&&billBaseImages['contra-bill-crouch'])ctx.drawImage(billBaseImages['contra-bill-crouch'],Math.round(b.x)-12,Math.round(b.y)-32);
 else mixCrop('bill',[59+b.walkFrame*29,65,28,57],b.x-14,b.y-55);}
 for(const s of mixShots)if(!s.delay)drawBillShot(s);
 for(const f of floaters)text(f.text,f.x,f.y,'#ffffff',1,true);
 drawHud();ctx.fillStyle='#000';ctx.fillRect(22,8,65,13);ctx.fillRect(142,8,52,22);hud('BILL',24,16);hud('BASE',144,16);hud(b.cleared?'OPEN':baseGuardsAlive().length?'GUNS '+baseGuardsAlive().length:'CORE '+b.coreHp,144,24);
 ctx.fillStyle='#000';ctx.fillRect(0,211,W,12);ctx.fillStyle='#ffffff';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText(mode==='dying'?'TRY AGAIN':b.stun?'ELECTRIC SHOCK':b.cleared?'GUN < / COINS > / UP: EXIT':baseGuardsAlive().length?(b.crouch?'DUCKING / X: FIRE':'GUNS FIRST / DOWN: DUCK'):'X: CORE / DOWN: DUCK',128,221);ctx.textAlign='left';
 ctx.restore();updateUi();updateHeroUI();if($('heroStatus'))$('heroStatus').textContent='比尔 · 基地奖励房 · '+(b.stun?'触电眩晕 '+b.stun+' 帧':b.cleared?('左侧武器'+(b.rewardClaimed?'已取':'可选')+' · 右侧10金币'+(b.coinsClaimed?'已取':'可选')+' · ↑ 可直接离开'):baseGuardsAlive().length?(b.crouch?'趴下躲弹 · 仍可射击':'左右移动瞄准墙炮 · ↓ 趴下躲弹 · ↑ 触电'):'核心 '+b.coreHp+'/8 · 左右对准白框 · 按 X 射击，站射/趴射均可');
}
// The recovered pipe transition assigns the underground entry coordinates after loadRoom.
const billBaseAdvancePipe=advancePipe;advancePipe=function(){billBaseAdvancePipe();if(billBase&&mode==='playing')syncBillBasePlayer();};
window.__mixReady=Promise.all([window.__mixReady,billBaseReady]);
if(window.__mixTest){const stateBeforeBase=window.__mixTest.state;window.__mixTest.baseState=()=>billBase?JSON.parse(JSON.stringify(billBase)):null;window.__mixTest.state=()=>({...stateBeforeBase(),base:window.__mixTest.baseState()});window.__mixTest.ready=window.__mixReady;}

surface=buildLevel();underground=buildUnder();loadRoom('surface');player=createPlayer();updateUi(true);
let last=0,accumulator=0;function loop(now){if(!last)last=now;const elapsed=Math.min((now-last)/1000,.1);last=now;if(!manual){accumulator+=elapsed;let n=0;while(accumulator>=1/60&&n<6){fixedUpdate();accumulator-=1/60;n++}draw()}requestAnimationFrame(loop)}requestAnimationFrame(loop);
// Deterministic test hook, enabled only by explicitly adding ?test=1.
if(new URLSearchParams(location.search).has('test')){manual=true;window.__test={
 start(){startGame();draw()},step(n,input={}){virtualInput={left:false,right:false,down:false,jump:false,run:false,...input};for(let i=0;i<n;i++)fixedUpdate();virtualInput=null;draw();return this.state()},
 nativeStep(n){virtualInput=null;for(let i=0;i<n;i++)fixedUpdate();draw();return this.state()},
 state(){return{mode,room,frame,score,coins,lives,timeLeft,camera,checkpoint,freeze,player:{...player},enemies:enemies.map(e=>({...e})),items:items.map(e=>({...e})),shots:shots.map(e=>({...e})),looseCoins:looseCoins.map(e=>({...e})),flagPhase,flagBonus,pipes:pipes.map(p=>({...p})),tiles:[...tiles.values()].filter(t=>t.type!=='ground'&&t.type!=='pipe').map(t=>({...t}))}},
 place(x,y,power=0){setSize(power);player.x=x;player.y=y;player.vx=0;player.vy=0;player.grounded=false;camera=room==='surface'?clamp(x-110,0,LEVEL_WIDTH-W):0;mode='playing';freeze=0;hideOverlay();draw()},
 power(n){setSize(n);draw()},bump(x,y){let t=tiles.get(tileKey(x,y));if(t)bumpTile(t);draw()},clearEnemies(){enemies.length=0},
 spawn(type,x,y){const e={x,y,w:14,h:type==='turtle'?22:14,vx:-.5,vy:0,type,active:true,dead:0,flipped:false,shell:false,shellTimer:0,combo:0,safe:0,anim:0};enemies.push(e);return e},
 damage(){damage()},die(){die()},resume(){handlePrimary()},pause(){togglePause()},setTime(t){timeLeft=t},
 enterUnder(){loadRoom('under');player.x=32;player.y=48;mode='playing';hideOverlay();draw()},draw,
 settings:{tileSize:T,width:W,height:H,worldWidth:LEVEL_WIDTH},
 physics:{walkSpeed:1.5,runSpeed:2.5,walkAccel:.037109375,runAccel:.0556640625,groundDecel:.05078125},
 };draw();}
})();
