// R41: dedicated Ginso music slot. No substituted composition, guessed stream,
// iframe, or external-player handoff. Audio bytes must be supplied by the user.
const M37_TITLE='Restoring the Light, Facing the Dark';
const M37_OFFICIAL='https://garethcoker.bandcamp.com/track/restoring-the-light-facing-the-dark';
const M41_REFERENCE='https://www.bilibili.com/video/BV1js411S7z3/?p=1';
const m37={url:null,name:null,bytes:null,type:null,loading:false,dbStatus:'session',importVersion:0,duration:0,origin:'none'};
let m41WriteQueue=Promise.resolve(),m41RestoreError='';
const m37Panel=document.createElement('section');m37Panel.className='o27-audio';m37Panel.id='ginso37';
m37Panel.innerHTML='<h3>银之树 · 洪水逃亡配乐</h3><p>Gareth Coker — <i>'+M37_TITLE+'</i></p><p class="o25-note">已内置《Restoring the Light, Facing the Dark》00:30–01:18 高潮片段。进入上升段立即播放，48 秒循环；暂停和重试随游戏同步。</p><div class="m37-buttons" hidden><button type="button" id="m37Import">载入原曲音频</button><button type="button" id="m41Export" disabled>导出含音轨的单文件版</button><button type="button" id="m37Clear">移除本地音轨</button></div><input type="file" id="m37File" accept="audio/*,.mp3,.ogg,.wav,.m4a,.flac,.aac" hidden><p id="m37Status" role="status"></p><p class="o25-note">音轨取自你上传的 MP3，已裁剪并处理循环接缝；不含完整长音轨，无需联网或导入。</p><p><a href="'+M37_OFFICIAL+'" target="_blank" rel="noopener noreferrer">官方曲目页 ↗</a> · <a href="'+M41_REFERENCE+'" target="_blank" rel="noopener noreferrer">原先提供的 B 站参考 ↗</a></p>';
o27Panel.after(m37Panel);
const m37Db=()=>new Promise((resolve,reject)=>{if(!window.indexedDB){reject(Error('storage unavailable'));return;}const r=indexedDB.open('mariomix-user-audio',1);r.onupgradeneeded=()=>r.result.createObjectStore('tracks');r.onerror=()=>reject(r.error);r.onsuccess=()=>resolve(r.result);});
function m37Save(value,version=m37.importVersion){
 const write=async()=>{let db;try{db=await m37Db();if(version!==m37.importVersion)return false;await new Promise((resolve,reject)=>{const tx=db.transaction('tracks','readwrite');if(value)tx.objectStore('tracks').put(value,'ginso');else tx.objectStore('tracks').delete('ginso');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});if(version===m37.importVersion)m37.dbStatus='saved';return true;}catch{if(version===m37.importVersion)m37.dbStatus='session';return false;}finally{db?.close();}};
 m41WriteQueue=m41WriteQueue.then(write,write);return m41WriteQueue;
}
function m37Status(text){const el=$('m37Status');if(el)el.textContent=text;}
function m41SlotStatus(){
 $('m41Export').disabled=!m37.bytes||m37.loading;
 if(m37.loading){m37Status('正在检查音频；现有音轨保持不变。');return;}
 if(!m37.url){m37Status(m41RestoreError||'未载入原曲 · 上升段保留音效，不播放替代曲。');}
 else{const min=Math.floor(m37.duration/60),sec=Math.floor(m37.duration%60).toString().padStart(2,'0');m37Status('已载入：'+m37.name+' · '+min+':'+sec+' · '+(m37.origin==='embedded'?'已内置 · 48 秒循环':m37.dbStatus==='saved'?'此浏览器已保存':'本次打开有效')+'。循环片段已内置，无需另行导入。');}
 $('m41Export').disabled=!m37.bytes||m37.loading;
}
async function m37LoadFile(file,persist=true,origin='import'){
 if(!file||!file.size||file.size>100*1024*1024)throw Error('请选择有效音频，单个文件不超过 100 MB。');
 const version=++m37.importVersion;m37.loading=true;m41SlotStatus();
 try{
  const bytes=await file.arrayBuffer();
  // Read the media container without decoding the entire looping video track to PCM.
  // This also works before a user gesture and without an AudioContext.
  const probeUrl=URL.createObjectURL(new Blob([bytes],{type:file.type||'audio/mp4'}));
  const decoded=await new Promise((resolve,reject)=>{
   const probe=document.createElement('audio');probe.preload='auto';
   let done=false;const finish=(error)=>{if(done)return;done=true;clearTimeout(timer);
    const duration=probe.duration;probe.oncanplay=probe.onerror=null;probe.pause();
    probe.removeAttribute('src');probe.load();URL.revokeObjectURL(probeUrl);
    if(error)reject(error);else if(!Number.isFinite(duration)||duration<1)reject(Error('音频过短或无法识别时长。'));
    else resolve({duration});};
   const timer=setTimeout(()=>finish(Error('音频载入超时。')),20000);
   probe.oncanplay=()=>finish();probe.onerror=()=>finish(Error('浏览器无法播放此音频。'));
   probe.src=probeUrl;probe.load();
  });
  if(version!==m37.importVersion)return false;
  const previous=m37.url,next=URL.createObjectURL(new Blob([bytes],{type:file.type||'audio/mpeg'}));
  m37.url=next;m37.name=file.name||M37_TITLE;m37.bytes=bytes;m37.type=file.type||'audio/mpeg';m37.duration=decoded.duration;m37.origin=origin;m41RestoreError='';
  if(origin==='embedded')m37.dbStatus='embedded';
  // Switch only at the next native audio sync, never alter a world/phase state.
  if(!s33Is()&&o27Music.role==='flood'){o27Stop(true);audioSync();}
  if(previous)URL.revokeObjectURL(previous);
  if(persist)await m37Save({bytes,name:m37.name,type:m37.type},version);
  return true;
 }catch(err){if(version===m37.importVersion)throw Error('未载入：'+(err.message||'浏览器无法解码此文件')+'。原有音轨未替换。');return false;}
 finally{if(version===m37.importVersion){m37.loading=false;m41SlotStatus();o27MusicUI();}}
}
const m37UseBase=o27Use,m41PlayBase=o27Play,m41CanPlayBase=o27CanPlay;
o27CanPlay=function(){return m41CanPlayBase()&&(o27Music.role!=='flood'||(!s33Is()&&mode==='playing'&&!!m37.url&&o27Music.source==='local-ginso'));};
o27Use=function(role,source){
 if(role!=='flood'||s33Is())return m37UseBase(role,source);
 o27CancelProbe();o27Audio.pause();o27Music.generation++;o27Music.pending=false;o27Music.blocked=false;o27Music.role='flood';o27Music.changes++;
 o27Audio.loop=true;o27Audio.playbackRate=1;o27Audio.defaultPlaybackRate=1;
 o27Audio.volume=soundOn?clamp(musicVolume,0,1)*.86:0;
 if(m37.url){o27Music.source='local-ginso';o27Music.status='高潮循环 · 准备播放';o27Audio.src=m37.url;o27Audio.load();o27Play();}
 else{o27Music.source='ginso-missing';o27Music.status='缺少原曲 · 不播放替代 BGM';o27Audio.removeAttribute('src');o27Audio.load();}
 o27MusicUI();
};
o27Play=function(){
 if(o27Music.role!=='flood')return m41PlayBase();
 if(!o27CanPlay()||o27Music.pending||o27Music.blocked||!o27Audio.paused)return;
 const gen=o27Music.generation;o27Music.pending=true;
 o27Audio.play().then(()=>{if(gen!==o27Music.generation)return;if(!o27CanPlay()){o27Audio.pause();return;}o27Music.status='高潮循环 · 正在播放';}).catch(err=>{
  if(gen!==o27Music.generation)return;
  if(err.name==='AbortError')return;
  o27Music.blocked=true;
  o27Music.status=err.name==='NotAllowedError'?'点击游戏开启声音':'音轨播放失败，请重新载入；不会切换为其他曲目';
 }).finally(()=>{if(gen===o27Music.generation)o27Music.pending=false;o27MusicUI();});
};
o27Audio.addEventListener('error',()=>{if(o27Music.role==='flood'&&o27Music.source==='local-ginso'){o27Music.blocked=true;o27Music.status='音轨播放失败，请重新载入；不会切换为其他曲目';o27MusicUI();}});
// R40 only probed the unverified flood URL. Remove that probe rather than
// retrying a failed redirect, or labelling a short generated loop as the OST.
o27TryOnline=function(){};o27CancelProbe();o27Music.online.delete('flood');o27Music.failed.delete('flood');
const m41RoleBase=o27Role;o27Role=function(){const r=m41RoleBase();return r&&!s33Is()&&o28.phase==='flood'?'flood':r;};
$('o27MusicMode').value='offline';o27Music.mode='offline';$('o27MusicMode').closest('label').hidden=true;
const m37UIBase=o27MusicUI;
o27MusicUI=function(){
 m37UIBase();m37Panel.hidden=!c23Is()||s33Is();
 if(o27Music.role==='flood'&&!s33Is()){
  const playback=!soundOn?'声音已关闭':mode==='paused'?'随游戏暂停':document.hidden?'页面后台 · 已暂停':o27Music.status;
  const e=$('o27MusicStatus');if(e)e.textContent=(m37.url?'已指定音轨：'+m37.name:'待载入：'+M37_TITLE)+'\n'+playback;
  const summary=$('o25Summary');if(summary)summary.textContent=m37.url?'上升段 · 48 秒高潮循环':'洪水原曲待载入 · 无替代配乐';
 }
 const quick=$('m41QuickStatus');if(quick){quick.hidden=!c23Is()||s33Is();quick.textContent=m37.url?'上升段音乐 · '+m37.name:'上升段音轨正在准备';}
};
$('m37Import').onclick=()=>{$('m37File').value='';$('m37File').click();};
$('m37File').onchange=async e=>{if(!e.target.files[0])return;try{await m37LoadFile(e.target.files[0]);}catch(err){m37Status(err.message);}};
async function m41Clear(){
 ++m37.importVersion;const old=m37.url;m37.url=m37.bytes=m37.name=m37.type=null;m37.duration=0;m37.origin='none';m37.loading=false;m41RestoreError='';
 if(!s33Is()&&o27Music.role==='flood'){o27Stop(true);audioSync();}
 if(old)URL.revokeObjectURL(old);m41SlotStatus();o27MusicUI();await m37Save(null);
}
$('m37Clear').onclick=m41Clear;
function m41ExportHTML(){
 if(!m37.bytes||m37.loading)throw Error('请先载入原曲音频。');
 const bytes=new Uint8Array(m37.bytes),chunks=[];
 for(let i=0;i<bytes.length;i+=32768)chunks.push(String.fromCharCode(...bytes.subarray(i,i+32768)));
 const payload=JSON.stringify({version:1,title:M37_TITLE,artist:'Gareth Coker',name:m37.name,mime:m37.type,duration:m37.duration,userSupplied:true,data:btoa(chunks.join(''))}).replace(/</g,'\\u003c');
 const start='<script id="ginso41-audio" type="application/json">',end='<'+'/script>';
 const a=M41_SOURCE_HTML.indexOf(start),b=M41_SOURCE_HTML.indexOf(end,a+start.length);
 if(a<0||b<0)throw Error('无法定位音轨容器，未导出文件。');
 // Export the pristine launch document, not a running/paused DOM snapshot.
 return M41_SOURCE_HTML.slice(0,a+start.length)+payload+M41_SOURCE_HTML.slice(b);
}
$('m41Export').onclick=()=>{try{const url=URL.createObjectURL(new Blob([m41ExportHTML()],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='MarioMix_1-4_Ori_Sonic_R43_ClimaxLoop.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);m37Status('已生成包含你所载音轨的单文件 HTML。重新打开该文件即可在游戏内离线播放。');}catch(err){m37Status('导出未完成：'+err.message);}};
$('o27MusicRetry').onclick=()=>{o27Music.failed.clear();o27Music.blocked=false;o27Stop(true);audioInit(true);audioSync();};
async function m41Restore(){
 const readVersion=m37.importVersion;let db;
 try{
  const embedded=JSON.parse($('ginso41-audio').textContent||'null');
  if(embedded?.data&&embedded.userSupplied===true){
   const bytes=decode64(embedded.data);await m37LoadFile(new File([bytes],embedded.name||M37_TITLE,{type:embedded.mime||'audio/mpeg'}),false,'embedded');return;
  }
  db=await m37Db();const stored=await new Promise((resolve,reject)=>{const r=db.transaction('tracks').objectStore('tracks').get('ginso');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  if(stored?.bytes&&readVersion===m37.importVersion&&!m37.url&&!m37.loading){m37.dbStatus='saved';await m37LoadFile(new File([stored.bytes],stored.name,{type:stored.type}),false,'saved');}
 }catch(err){if($('ginso41-audio').textContent.trim()!=='null')m41RestoreError='内嵌音轨未解码，请重新载入原曲：'+err.message;}
 finally{db?.close();m41SlotStatus();o27MusicUI();}
}
m41SlotStatus();const m41Ready=m41Restore();

function s37Copy(){
 if(!c23Is())return;
 const p=o25Panel.querySelector('.o25-resource-inner>p');if(p)p.textContent='经典城堡外观 · 马里奥原版地块与黑底背景。角色动作、羽毛与结尾贴图沿用已注明来源的素材。';
 const note=o25Panel.querySelector('.o25-note');if(note)note.textContent='爷爷使用公开项目收录的葫芦兄弟透明贴图，移动为本关适配，不是官方完整动作图集；洪水为银之树视觉参考重建。';
 const note2=o27Panel.querySelector('.o25-note');if(note2)note2.textContent='洪水段使用指定音轨；未载入原曲时不播放替代 BGM。';
 if(s33Is()){
  const k=$('c23KeysText');if(k&&!k.querySelector('[data-boss37]')){const e=document.createElement('p');e.dataset.boss37='1';e.innerHTML='<b>库巴</b>　旋转碰撞或追踪攻击累计命中 3 次击败；同次接触不重复扣血。也可照常触斧断桥。';k.append(e);}
 }
 m37Panel.hidden=s33Is();
}
const s37ChromeBase=c23Chrome;c23Chrome=function(){const r=s37ChromeBase();s37Copy();return r;};
const s37SonicChromeBase=s34Chrome;s34Chrome=function(){const r=s37SonicChromeBase();s37Copy();return r;};
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R37',chapter14:'Ori classic-art fallback / Ginso water study / Sonic three-hit boss'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test'))window.__castle37={
 ...window.__castle36,build:'R37',bossConfig:S37_BOSS,bossDamage:o24BossDamage,
 grandfather:(t=0,walking=false,climbing=false)=>({frame:g37Pose(t,walking,climbing),count:G37.count,source:'public-project-png',sourceFrames:1,feet:0}),
 drawGrandfather:o29Keeper,atlas:()=>G37.atlas.toDataURL('image/png'),
 art37:()=>({terrain:o25Art,background:'classic-black',water:'Ginso-reference-reconstruction'}),
 localMusic:()=>({loaded:!!m37.url,name:m37.name,type:m37.type,bytes:m37.bytes?.byteLength||0,status:m37.dbStatus}),
 importMusic:async(data,name='test.wav',type='audio/wav')=>m37LoadFile(new File([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],name,{type}),false)
};
