/* R25 public-art integration. No new physics, input polling, iframe or game loop.
 * Public fan sprites != original Moon Studios animation. Every remote file is
 * pinned, validated, decoded before use, and optional for basic play. */
const O25_LOCAL={"ori":"@@E04:uri:a183@@"};
const O25_MOD='Ilemni/OriMod',O25_MOD_REV='2043b81139cca3515c4458686ad39dc3cda09d7f';
const O25_BG='Purevdorj-Batgerel/Canvas-Ori-and-the-blind-forest',O25_BG_REV='d2f642c16449cf2631e04ddc916c7f9899bb5af0';
function o25Descriptor(id,name,repo,rev,path,size,sha,mime='image/png'){
 const p=path.split('/').map(encodeURIComponent).join('/');
 return {id,key:id,name,repo,rev,path,size,sha,mime,url:'https://raw.githubusercontent.com/'+repo+'/'+rev+'/'+p,
 cdn:'https://cdn.jsdelivr.net/gh/'+repo+'@'+rev+'/'+p,api:'https://api.github.com/repos/'+repo+'/git/blobs/'+sha};
}
const O25_ASSETS=[
 o25Descriptor('ori','奥日完整同人动作图',O25_MOD,O25_MOD_REV,'Animations/PlayerAnim.png',20658,'ef597b20e938deabf54ad6f3bafd3432ec4b0658'),
 o25Descriptor('feather','羽毛动作图',O25_MOD,O25_MOD_REV,'Animations/GlideAnim.png',3700,'a8aae4fec333a6f2e9e07c1f83410ff3c5fd10b2'),
 o25Descriptor('arrow','借力方向动画',O25_MOD,O25_MOD_REV,'Animations/BashAnim.png',902,'5b6a105a77530e5bb03a448066e18344670b8401'),
 o25Descriptor('back','远景',O25_BG,O25_BG_REV,'public/bg_back_32.webp',310306,'f5d8eb6f938603dd03e3d97cb85aff846b3b165d','image/webp'),
 o25Descriptor('mid','中景',O25_BG,O25_BG_REV,'public/bg_mid_64.webp',74750,'63e5c029e523748cff13830efa576c4fbc54b3e3','image/webp'),
 o25Descriptor('fore','近景',O25_BG,O25_BG_REV,'public/bg_fore_32.webp',22850,'2fff099dbb40d14260ec7b76eed9ee7a456cdeb9','image/webp'),
 o25Descriptor('naru','纳鲁角色肖像','jordanbuchman/steamoji','1d23444ab22f0a83dcdd4a8b3dc1dca24da41803','games/Ori and the Blind Forest/images/naru.png',6646,'0a967f96c807d260ae41f568c517690a9f3cfa1e')
];
const O25_THEME={...o25Descriptor('ori_theme25','Ori — Main Theme (Definitive Edition)',O25_BG,O25_BG_REV,'public/ori_main_theme.mp3',4907623,'fc12dc1e2b60a58a4b00b618c611daa0261d476a','audio/mpeg'),music:true};
// Priority before the legacy audio queue. This theme is not called an escape cue.
for(let i=AUDIO_MANIFEST.length-1;i>=0;i--)if(['castle23','castleclear23'].includes(AUDIO_MANIFEST[i].key))AUDIO_MANIFEST.splice(i,1);
AUDIO_MANIFEST.unshift(O25_THEME);
const o25Images=new Map(),o25States=new Map(O25_ASSETS.map(a=>[a.id,'等待加载'])),o25Raw=new Map();
let o25Loading=null,o25AudioLoading=null,o25LastStatus='',o25Art='public',o25Initialized=false;
let o25FrameDraws=0,o25SpritePose='',o25RemoteGeneration=0;
try{o25Art=save.get('ori-art','public')==='classic'?'classic':'public';}catch{}
const o25Fallback=new Image();o25Fallback.src=O25_LOCAL.ori;
o25Fallback.onload=()=>{o24Portrait();if(c23Is()&&c23)c23Draw();};
// A bounded cache request must never prevent game startup in private browsing.
function o25Bound(p,ms=1400){return Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]);}
async function o25Fetch(url,isAPI=false){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000);
 try{const r=await fetch(url,{signal:ctrl.signal,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!r.ok)throw Error('HTTP '+r.status);
  if(isAPI){const j=await r.json();if(j.encoding!=='base64'||typeof j.content!=='string')throw Error('资源响应无效');return decode64(j.content);}
  return await r.arrayBuffer();
 }finally{clearTimeout(timer);}
}
async function o25Bytes(a){
 if(o25Raw.has(a.id))return o25Raw.get(a.id);
 const cached=await o25Bound(cacheRead(a.sha));if(cached){try{await verifyAudio(cached,a);o25Raw.set(a.id,cached);return cached;}catch{}}
 let last;
 for(const [u,api]of [[a.cdn,false],[a.url,false],[a.api,true]]){
  try{const bytes=await o25Fetch(u,api);await verifyAudio(bytes,a);o25Raw.set(a.id,bytes);cacheWrite(a.sha,bytes).catch(()=>{});return bytes;}catch(e){last=e;}
 }
 throw last||Error('资源未能读取');
}
async function o25Image(a,bytes){
 const u=URL.createObjectURL(new Blob([bytes],{type:a.mime})),image=new Image();
 try{
  await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('图像解码超时')),4000);image.onload=()=>{clearTimeout(t);resolve();};image.onerror=()=>{clearTimeout(t);reject(Error('图像解码失败'));};image.src=u;});
  if(image.naturalWidth<8||image.naturalHeight<8)throw Error('图像尺寸无效');
  if(a.id==='ori'&&(image.naturalWidth!==576||image.naturalHeight!==1020))throw Error('动作表尺寸无效');
  if(a.id==='feather'&&(image.naturalWidth<128||image.naturalHeight<1280))throw Error('羽毛动作表尺寸无效');
  if(a.id==='arrow'&&(image.naturalWidth!==152||image.naturalHeight!==60))throw Error('方向图尺寸无效');
  return image;
 }finally{URL.revokeObjectURL(u);}
}
const o25Panel=document.createElement('details');o25Panel.id='o25Resources';
o25Panel.innerHTML='<summary>画面与公开素材 <span id="o25Summary">内置动作可直接玩</span></summary><div class="o25-resource-inner"><label class="o25-look"><span>场景外观</span><select id="o25Art"><option value="public">精灵遗迹</option><option value="classic">经典灰砖</option></select></label><p>角色采用公开同人动作图。已内置基础帧；完整动作与背景层联网补齐。地图与操作不随外观改变。</p><div id="o25Progress" role="status"></div><button type="button" id="o25RetryAssets">重新加载公开素材</button><p class="o25-note">主题曲来源标注：Gareth Coker / Ori and the Blind Forest: Definitive Edition。此曲不是原逃脱战配乐。技能提示音与流体效果仍为重建。</p></div>';
$('c23Options').after(o25Panel);$('o25Art').value=o25Art;
$('o25Art').onchange=e=>{o25Art=e.target.value;save.set('ori-art',o25Art);canvas.focus({preventScroll:true});if(c23Is())c23Draw();};
$('o25RetryAssets').onclick=()=>{o25LoadPublic();o25LoadMusic();};
function o25ResourceUI(){
 o25Panel.hidden=!c23Is();if(!c23Is())return;
 const ready=O25_ASSETS.filter(a=>o25Images.has(a.id)).length;
 const audioState=bank.has(O25_THEME.key)?'主题曲已就绪':o25AudioLoading?'主题曲加载中':'主题曲未就绪';
 const label=(ready===O25_ASSETS.length?'公开图像已就绪':o25Loading?'图像 '+ready+'/'+O25_ASSETS.length+' 加载中':'内置基础动作 · 联网增强 '+ready+'/'+O25_ASSETS.length)+' · '+audioState;
 if(label===o25LastStatus)return;o25LastStatus=label;$('o25Summary').textContent=label;
 const frag=document.createDocumentFragment();for(const a of O25_ASSETS){const row=document.createElement('div');row.className='o25-resource-row';
  const name=document.createElement('span');name.textContent=a.name;const val=document.createElement('span');val.textContent=o25States.get(a.id);row.append(name,val);frag.append(row);}
 $('o25Progress').replaceChildren(frag);$('o25RetryAssets').disabled=!!o25Loading||!!o25AudioLoading;
}
async function o25LoadPublic(){
 if(o25Loading)return o25Loading;const generation=++o25RemoteGeneration;
 o25Loading=(async()=>{const work=O25_ASSETS.filter(a=>!o25Images.has(a.id));let index=0;
  async function worker(){while(index<work.length){const a=work[index++];o25States.set(a.id,'加载中');o25LastStatus='';o25ResourceUI();
   try{const bytes=await o25Bytes(a),im=await o25Image(a,bytes);if(generation!==o25RemoteGeneration)return;o25Images.set(a.id,im);o25States.set(a.id,'已就绪');if(a.id==='ori')o24Portrait();}
   catch(e){o25States.set(a.id,'未就绪 · 保留备用画面');}
   o25LastStatus='';o25ResourceUI();
  }}
  await Promise.all([worker(),worker(),worker()]);
 })().finally(()=>{o25Loading=null;o25LastStatus='';o25ResourceUI();});o25ResourceUI();return o25Loading;
}
async function o25LoadMusic(){
 if(bank.has(O25_THEME.key)||o25AudioLoading)return o25AudioLoading;
 o25AudioLoading=(async()=>{try{await installAudio(O25_THEME,await o25Bytes(O25_THEME));audioSync();}catch(e){audioLogEvent('error',O25_THEME.key,{error:e.message});}})().finally(()=>{o25AudioLoading=null;o25LastStatus='';o25ResourceUI();});o25ResourceUI();return o25AudioLoading;
}
const o25ObtainBase=obtainAudio;obtainAudio=async function(m){return m.key===O25_THEME.key?o25Bytes(O25_THEME):o25ObtainBase(m);};
const o25DesiredBase=desiredMusic;desiredMusic=function(){if(!c23Is())return o25DesiredBase();return mode==='playing'&&c23&&bank.has(O25_THEME.key)?O25_THEME.key:null;};
const o25SyncBase=audioSync;audioSync=function(){if(!c23Is())return o25SyncBase();if(!audio)return;if(!soundOn||mode==='paused'||document.hidden){stopMusic(true);return;}const key=desiredMusic();if(key)playMusic(key);else stopMusic(false);};
// The mechanical bridge remains a Mario cameo, but its victory song must not
// overlay the Ori theme. Character skill sounds are still labelled rebuilt.
const o25ShotBase=oneShot;oneShot=function(key,opt={}){if(c23Is()&&(key==='castleclear23'||key==='clear')){audioSync();return 0;}return o25ShotBase(key,opt);};
const o25StartBase=c23Start;c23Start=function(){o25StartBase();o25LoadPublic();o25LoadMusic();};
const o25ChromeBase=c23Chrome;c23Chrome=function(){o25ChromeBase();document.body.classList.toggle('o25-public',c23Is());o25Panel.hidden=!c23Is();if(c23Is()){o25ResourceUI();o24Portrait();}};
const o25UIBase=o24UI;o24UI=function(){o25UIBase();o25ResourceUI();};c23UI=o24UI;
// Sprite tracks follow OriMod/Animations/OriAnimationSources.cs. The embedded
// crop only includes rows 0..3; abbreviated loops are used until full decode.
function o25Frame(pose,phase,full){
 const t=Math.max(0,Math.floor(phase||0)),cycle=(n,step=4)=>Math.floor(t/step)%n;
 let col=0,row=full?1+cycle(8,9):1+cycle(3,9),rot=0;
 switch(pose){
  case 'run':col=2;row=full?cycle(11):[0,1,2,3,2,1][cycle(6)];break;
  case 'dash':col=full?2:2;row=full?11:2;rot=full?0:.10;break;
  case 'bash':col=full?2:6;row=full?13:2;break;
  case 'jump':col=3;row=2;break;
  case 'double':case 'ball':col=3;row=0;rot=t*.18;break;
  case 'fall':col=3;row=full?9+cycle(4):3;break;
  case 'glide':col=4;row=full?4+cycle(6,5):3;break;
  case 'climb':col=5;row=full?1+cycle(8):cycle(4);break;
  case 'wall':col=5;row=full?9+cycle(4,5):0;break;
  case 'stomp':col=3;row=0;rot=Math.PI;break;
  case 'land':col=full?1:0;row=full?9:0;break;
 }
 return{col,row,rot};
}
const o25OldOri=o24Ori;
o24Ori=function(g,x,feet,pose,phase,face,opacity=1,glow=true){
 const full=o25Images.get('ori'),im=full||o25Fallback;
 if(!im.complete||!im.naturalWidth)return; // Inline data decodes before interaction.
 const f=o25Frame(pose,phase,!!full);o25SpritePose=pose;o25FrameDraws++;
 g.save();g.globalAlpha=clamp(opacity,0,1);g.translate(x,feet);g.scale(face<0?-1:1,1);
 if(glow)o24Glow(g,0,-12,17,'#a7eaff',.20);
 // A stable 32,62 pivot preserves the source foot alignment through animation.
 g.imageSmoothingEnabled=false;g.translate(0,-12);g.rotate(f.rot);g.drawImage(im,f.col*64,f.row*68,64,68,-16,-19,32,34);g.rotate(-f.rot);g.translate(0,12);
 if(pose==='glide'){
  const feather=o25Images.get('feather');
  if(feather){const row=4+Math.floor(Math.max(0,phase)/5)%6;g.imageSmoothingEnabled=true;g.drawImage(feather,0,row*128,128,128,-26,-53,52,52);}
  else{g.lineWidth=.6;g.strokeStyle='#d6c6ef';g.fillStyle='#5c537d';g.beginPath();g.moveTo(-19,-29);g.bezierCurveTo(-13,-42,11,-41,20,-35);g.bezierCurveTo(4,-26,-8,-29,-19,-29);g.fill();g.stroke();g.beginPath();g.moveTo(-17,-30);g.lineTo(18,-35);g.stroke();for(let i=0;i<8;i++){g.strokeStyle='#a99cc8';g.beginPath();g.moveTo(-13+i*4,-30-i*.4);g.lineTo(-10+i*3,-36-i*.13);g.stroke();}}
 }
 g.restore();
};
function o25BashArrow(g,angle){const a=o25Images.get('arrow');g.save();g.rotate(angle);if(a){g.imageSmoothingEnabled=true;g.drawImage(a,0,(Math.floor(c23.ticks/6)%3)*20,152,20,4,-4,48,8);}else{o24Path(g,[['M',12,-.7],['L',31,-.7],['L',26,-4],['L',36,0],['L',26,4],['L',31,.7],['L',12,.7],['Z']],'#ffefb3');}g.restore();}
// Fixed-seed, hand-layered fallback rocks. These are browser-made texture
// substitutes, not assets claimed to have been extracted from either Ori game.
function o25Rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};}
function o25RockTexture(){
 const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d'),r=o25Rng(25025);
 const grad=g.createLinearGradient(0,0,100,192);grad.addColorStop(0,'#253b43');grad.addColorStop(.55,'#172c35');grad.addColorStop(1,'#10212c');g.fillStyle=grad;g.fillRect(0,0,192,192);
 for(let i=0;i<110;i++){const x=r()*220-15,y=r()*220-15,w=8+r()*39,h=6+r()*27;g.beginPath();g.moveTo(x,y);g.lineTo(x+w*.65,y-5);g.lineTo(x+w,y+h*.5);g.lineTo(x+w*.36,y+h);g.lineTo(x-4,y+h*.66);g.closePath();g.fillStyle=['#37505a42','#52657025','#07172350','#70908b1b','#74807a13'][i%5];g.fill();g.strokeStyle='#07172548';g.lineWidth=.8;g.stroke();}
 for(let i=0;i<2200;i++){const v=r();g.fillStyle=v<.5?'#8cafad10':'#020e191a';g.fillRect(r()*192,r()*192,.3+r()*1.5,.3+r()*1.5);}
 return c;
}
const o25Rock=o25RockTexture();let o25RockPattern=null;
function o25Terrain(){
 const g=ctx;if(!o25RockPattern)o25RockPattern=g.createPattern(o25Rock,'repeat');
 for(const t of tiles.values()){
  if(t.hidden||t.x*16<camera-16||t.x*16>camera+256)continue;
  const x=t.x*16-camera,y=t.y*16-(t.bump?Math.sin(t.bump/12*Math.PI)*4:0);
  if(o25Art==='classic'||t.type!=='stone'){sprite(t.castleBase?'c23_base':t.type==='stone'?'c23_stone':t.used?'block_used':'question'+Math.floor(frame/8)%3,x,y,false,false,t.type==='question'?'under':'normal');continue;}
  g.save();g.translate(-camera,0);g.fillStyle=o25RockPattern;g.fillRect(t.x*16,t.y*16,16,16);g.restore();
  const top=!at(t.x,t.y-1),bottom=!at(t.x,t.y+1),left=!at(t.x-1,t.y),right=!at(t.x+1,t.y);
  // Solid boundaries stay exactly on original Mario tile coordinates.
  if(top){g.fillStyle='#729b955c';g.fillRect(x,y,16,1.25);g.strokeStyle='#213e42';g.lineWidth=.8;g.beginPath();g.moveTo(x,y+3);g.lineTo(x+4,y+2);g.lineTo(x+10,y+3.6);g.lineTo(x+16,y+2);g.stroke();
   if(t.y>4){for(let n=0;n<5;n++){const h=1+((t.x*5+n*7)%4)*.45;g.fillStyle=n%2?'#6a8f768a':'#397269ad';g.fillRect(x+n*3.3,y-h,1.2,h);}if(t.x%7===2){g.strokeStyle='#365d66';g.beginPath();g.moveTo(x+6,y);g.quadraticCurveTo(x+5,y-5,x+10,y-5);g.stroke();o24Glow(g,x+10,y-5,4,'#a2eadd',.17);o24Ellipse(g,x+10,y-5,1.3,.65,'#a4d8c780');}}}
  if(bottom){g.fillStyle='#06131caa';g.fillRect(x,y+14,16,2);if(t.y<8&&t.x%4===1){g.strokeStyle='#294149';g.lineWidth=.7;g.beginPath();g.moveTo(x+6,y+15);g.quadraticCurveTo(x+8,y+20,x+5,y+24);g.stroke();}}
  if(left){g.fillStyle='#4d768767';g.fillRect(x,y,1,16);}if(right){g.fillStyle='#071622aa';g.fillRect(x+14.5,y,1.5,16);}
  if(t.castleBase){o24Glow(g,x+8,y+8,7,'#da986c',.08);g.strokeStyle='#506069';g.lineWidth=1;g.beginPath();g.arc(x+8,y+8,5.5,0,Math.PI*2);g.stroke();g.fillStyle='#151e29';g.beginPath();g.arc(x+8,y+8,3.4,0,Math.PI*2);g.fill();o24Ellipse(g,x+8,y+8,1.4,1.4,'#de9e70');}
 }
}
const o25BackdropBase=o24Backdrop;
function o25Layer(im,speed,alpha){
 const g=ctx,h=208,w=h*im.naturalWidth/im.naturalHeight,span=Math.max(256,w),off=((camera*speed)%span+span)%span;
 g.save();g.globalAlpha=alpha;g.imageSmoothingEnabled=true;
 // Alternating reflection avoids a hard repeated panorama seam.
 for(let i=-1;i<3;i++){const index=Math.floor(camera*speed/span)+i,x=i*span-off;g.save();g.translate(x+(index%2?span:0),32);if(index%2)g.scale(-1,1);g.drawImage(im,0,0,span,h);g.restore();}g.restore();
}
o24Backdrop=function(){
 o25BackdropBase();const g=ctx;
 if(o25Images.has('back')){
  o25Layer(o25Images.get('back'),.11,.72);if(o25Images.has('mid'))o25Layer(o25Images.get('mid'),.23,.58);
  const shade=g.createLinearGradient(0,32,0,240);shade.addColorStop(0,'#04111f4d');shade.addColorStop(.45,'#06213530');shade.addColorStop(1,'#051a24ad');g.fillStyle=shade;g.fillRect(0,32,256,208);
 }else{
  // Retained without network: richer depth, not a blank loading screen.
  const x0=177-(camera*.08)%256;o24Glow(g,x0,104,100,'#49798b',.18);
  for(let i=-1;i<4;i++){const x=i*104-camera*.14%104;g.fillStyle='#0c202ce8';g.beginPath();g.moveTo(x-15,240);g.bezierCurveTo(x+15,171,x-23,124,x-8,38);g.lineTo(x+8,32);g.bezierCurveTo(x+4,112,x+35,173,x+25,240);g.closePath();g.fill();g.strokeStyle='#25465470';g.lineWidth=1;g.beginPath();g.moveTo(x,200);g.bezierCurveTo(x+10,144,x-6,88,x,34);g.stroke();}
 }
 if(c23.chaseStarted&&!c23.practice){const influence=clamp(1-(player.x-c23.wave)/300,0,.42);const heat=g.createLinearGradient(0,0,220,0);heat.addColorStop(0,'rgba(181,77,40,'+influence+')');heat.addColorStop(1,'rgba(181,77,40,0)');g.fillStyle=heat;g.fillRect(0,32,256,208);}
};
function o25Foreground(){
 const im=o25Images.get('fore');if(!im)return;
 ctx.save();ctx.beginPath();ctx.rect(0,215,256,25);ctx.clip();o25Layer(im,.38,.48);ctx.restore();
}
// Curl-like streak texture computed at 192x192 once. Animated advection is
// exclusively visual; o24Front remains the sole chase collision boundary.
function o25LavaTexture(){const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d'),im=g.createImageData(192,192);
 for(let y=0;y<192;y++)for(let x=0;x<192;x++){const dx=x/192*6.283185307,dy=y/192*6.283185307;
  const a=Math.sin(dx*3+Math.sin(dy*2)*1.6),b=Math.sin(dy*4+Math.sin(dx*2)*1.4),v=Math.abs(Math.sin(a*3+b*1.5+Math.sin(dx*7+dy*2)*.25));
  const heat=Math.pow(1-v,2.4),i=(y*192+x)*4;im.data[i]=Math.floor(95+150*heat);im.data[i+1]=Math.floor(24+160*heat);im.data[i+2]=Math.floor(28+51*heat);im.data[i+3]=255;}
 g.putImageData(im,0,0);return c;}
const o25Lava=o25LavaTexture();
function o25LavaFill(x,y,w,h,t){const g=ctx;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.imageSmoothingEnabled=true;
 for(let yy=y-96-(t*.65%96);yy<y+h;yy+=96)for(let xx=x-96-(t*.31%96);xx<x+w;xx+=96)g.drawImage(o25Lava,xx,yy,96,96);g.globalCompositeOperation='screen';g.globalAlpha=.22;
 for(let yy=y-96+(t*.37%96);yy<y+h;yy+=96)for(let xx=x-96+(t*.19%96);xx<x+w;xx+=96)g.drawImage(o25Lava,xx,yy,96,96);g.restore();}
o24DrawPool=function(pool){const x=pool.x-camera,g=ctx,t=c23.ticks;if(x>280||x+pool.w<-24)return;
 g.save();g.beginPath();g.moveTo(x,240);for(let i=0;i<=pool.w;i+=2)g.lineTo(x+i,pool.y+3+Math.sin(i*.17+t*.07)*1.1);g.lineTo(x+pool.w,240);g.closePath();g.clip();o25LavaFill(x,pool.y,pool.w,242-pool.y,t);const grad=g.createLinearGradient(0,pool.y,0,pool.y+22);grad.addColorStop(0,'#fff7a4dd');grad.addColorStop(.28,'#ffb02b9a');grad.addColorStop(1,'#fa450800');g.fillStyle=grad;g.fillRect(x,pool.y,pool.w,30);g.restore();o24Glow(g,x+pool.w/2,pool.y+5,Math.min(58,pool.w*.7),'#ff9f47',.20);
};
o24DrawWave=function(){if(!c23.chaseStarted||c23.practice||c23.ending)return;const g=ctx,edge=c23.wave-camera,t=c23.ticks;if(edge<-60)return;
 const glow=g.createLinearGradient(edge-10,0,edge+52,0);glow.addColorStop(0,'#ed9e4166');glow.addColorStop(1,'#ff9f3100');g.fillStyle=glow;g.fillRect(0,32,Math.max(0,edge+52),208);
 const path=()=>{g.beginPath();g.moveTo(-120,28);g.lineTo(o24Front(28)-camera,28);for(let y=30;y<=244;y+=2)g.lineTo(o24Front(y)-camera,y);g.lineTo(-120,244);g.closePath();};
 g.save();path();g.clip();o25LavaFill(-100,28,Math.max(1,edge+104),216,t);
 const gr=g.createLinearGradient(edge-48,0,edge+3,0);gr.addColorStop(0,'#ed3e0a00');gr.addColorStop(.73,'#ff7c17aa');gr.addColorStop(1,'#fff7b9ed');g.fillStyle=gr;g.fillRect(-100,28,edge+108,216);
 for(let i=0;i<12;i++){const yy=42+((i*37+t*.43)%183),xx=edge-11-((i*21+t*.32)%70),ang=i+t*.009;g.save();g.translate(xx,yy);g.rotate(ang);g.fillStyle='#291e27';g.strokeStyle='#fc723994';g.lineWidth=.7;g.beginPath();g.moveTo(-2,-3);g.lineTo(3,-2);g.lineTo(4,1);g.lineTo(0,4);g.lineTo(-3,1);g.closePath();g.fill();g.stroke();g.restore();}g.restore();
 g.save();g.beginPath();for(let y=32;y<=240;y+=2){const x=o24Front(y)-camera;if(y===32)g.moveTo(x,y);else g.lineTo(x,y);}g.strokeStyle='#fff5c5';g.lineWidth=1;g.shadowColor='#ffa329';g.shadowBlur=12;g.stroke();g.restore();
 for(let i=0;i<22;i++){const age=(t+i*13)%67,yy=34+((i*43-age*.5)%205+205)%205,xx=o24Front(yy)-camera+age*.14;g.save();g.globalAlpha=(1-age/67)*.8;o24Ellipse(g,xx,yy,.28+i%3*.13,.6,'#ffdda1',i);g.restore();}
};
const o25LanternBase=o24DrawLantern;o24DrawLantern=function(n){const x=n.x-camera,y=n.y+Math.sin(c23.ticks*.045+n.id)*.55;if(x<-25||x>281)return;const g=ctx,near=o24NearTargets()[0],sel=near?.type==='lantern'&&near.id===n.id;
 g.save();g.strokeStyle='#365664';g.lineWidth=.8;g.beginPath();g.moveTo(x-4,y-31);g.bezierCurveTo(x+6,y-26,x-6,y-14,x,y-6);g.stroke();g.fillStyle='#284449';g.beginPath();g.ellipse(x+3,y-21,3,.8,-.4,0,Math.PI*2);g.fill();
 o24Glow(g,x,y,sel?16:12,'#ffd780',sel?.4:.22);const grad=g.createRadialGradient(x,y-1,.2,x,y,5);grad.addColorStop(0,'#fffbe3');grad.addColorStop(.36,'#fceba5');grad.addColorStop(1,'#b88942');g.fillStyle=grad;g.beginPath();g.moveTo(x,y-6);g.bezierCurveTo(x+5,y-4,x+5,y+1,x+1,y+5);g.bezierCurveTo(x-4,y+4,x-5,y-3,x,y-6);g.fill();g.strokeStyle='#ffdda07a';g.lineWidth=.4;g.beginPath();g.moveTo(x,y-5);g.quadraticCurveTo(x-2,y,x+1,y+4);g.stroke();if(sel&&!c23.ori.bash){g.strokeStyle='#fff4bd';g.lineWidth=.5;g.beginPath();g.arc(x,y,8,0,Math.PI*2);g.stroke();}g.restore();
};
// Naru's public Steam portrait is used as a portrait in the reunion alcove,
// not falsely presented as a newly obtained full-body original animation.
function o25NaruPortrait(){const im=o25Images.get('naru');if(!im||!c23.ending||player.x<2330)return;const g=ctx,x=2434-camera,y=151;g.save();o24Glow(g,x,y,17,'#c4e2c4',.18);g.fillStyle='#102b34e6';g.beginPath();g.arc(x,y,13,0,Math.PI*2);g.fill();g.beginPath();g.arc(x,y,11,0,Math.PI*2);g.clip();g.imageSmoothingEnabled=true;g.drawImage(im,x-12,y-12,24,24);g.restore();}
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R25',chapter14:'Ori / public fan-animation integration'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 window.__ori25={...window.__ori24,assets:()=>({loaded:[...o25Images.keys()],status:Object.fromEntries(o25States),fallbackReady:o25Fallback.complete&&o25Fallback.naturalWidth===576,draws:o25FrameDraws,pose:o25SpritePose,loading:!!o25Loading,music:bank.has(O25_THEME.key),activeMusic:bgm?.key||null,art:o25Art}),assetManifest:()=>structuredClone(O25_ASSETS),theme:()=>({...O25_THEME}),frame:o25Frame,load:o25LoadPublic,loadMusic:o25LoadMusic,decode:o25Image,validate:verifyAudio,drawOri:o24Ori,installToneFixture:()=>{const ac=audioInit(false);const b=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.sin(i/ac.sampleRate*440*Math.PI*2)*.005;bank.set(O25_THEME.key,{buffer:b,gain:1});audioSync();},audioState:()=>({active:bgm?.key||null,held:heldTrack?.key||null,count:voices.size,log:audioLog.slice(-12)}),sync:audioSync,playEffect:oneShot,installFixture:async(id,url)=>{const im=new Image();im.src=url;await im.decode();o25Images.set(id,im);o25LastStatus='';o25ResourceUI();return true;},removeFixture:id=>{o25Images.delete(id);},setArt:v=>{o25Art=v;},desired:desiredMusic};
}
setTimeout(()=>{o25Initialized=true;o25LoadPublic();},0);

/* R26: visual/audio corrections only; public GlideAnim source is fully embedded.
   No map, movement, hitbox, checkpoint, or controller changes. */
const O26_LOCAL={"feather":"@@E04:uri:a184@@","rock":"@@E04:uri:a185@@","naru":"@@E04:uri:a186@@","naruHead":"@@E04:uri:a187@@"};
const o26Pictures=new Map();
// Install embedded source bytes before any optional background loader starts.
for(const [local,id] of [['feather','feather'],['naruHead','naru']])if(O26_LOCAL[local])o25Raw.set(id,decode64(O26_LOCAL[local].split(',')[1]));
const o26Ready=Promise.all(Object.entries(O26_LOCAL).map(async([id,url])=>{const im=new Image();im.src=url;await im.decode();o26Pictures.set(id,im);if(id==='feather'||id==='naruHead'){const key=id==='naruHead'?'naru':id;o25Images.set(key,im);o25States.set(key,id==='feather'?'已内置 · 完整 10 帧':'已内置 · 原肖像');}return id;})).then(()=>{o25LastStatus='';o25ResourceUI();if(c23Is())c23Draw();});
// Frame artwork occupies only x=42..92 / y=18..56 of each 128px cell.
// R25 treated the transparent cell as the visible feather and left it floating.
// Uniform 0.5 scale + shared hand pivot keeps its two tips on Ori's raised hands.
const O26_FEATHER={cell:128,scale:.5,left:-33,top:-50,handLeft:{x:-9,y:-22},handRight:{x:10,y:-22}};
const o26GlideClock=new WeakMap();
function o26GlideFrame(pose){
 if(pose!=='glide'||!c23?.ori)return 3;
 const t=c23.ticks||0,o=c23.ori;let a=o26GlideClock.get(o);
 // Draw calls from portraits or dash trails never reset the gameplay clock.
 if(!a||t<a.last||t-a.last>1){a={start:t,last:t};o26GlideClock.set(o,a);}a.last=t;
 const age=Math.max(0,t-a.start);
 return age<15?Math.min(2,Math.floor(age/5)):4+Math.floor((age-15)/5)%6;
}
// Keep the user-approved character. Only repair feather compositing and grip.
o24Ori=function(g,x,feet,pose,phase,face,opacity=1,glow=true){
 const full=o25Images.get('ori'),im=full||o25Fallback;if(!im.complete||!im.naturalWidth)return;
 const f=o25Frame(pose,phase,!!full),ff=o26GlideFrame(pose);o25SpritePose=pose;o25FrameDraws++;
 if(pose==='glide')f.row=full?ff:Math.min(ff,3);
 g.save();g.globalAlpha=clamp(opacity,0,1);g.translate(x,feet);g.scale(face<0?-1:1,1);
 if(glow)o24Glow(g,0,-12,17,'#a7eaff',.18);
 // The feather is behind the raised hands, not pasted in front of the face.
 const feather=o26Pictures.get('feather')||o25Images.get('feather');
 if(pose==='glide'&&feather){g.imageSmoothingEnabled=false;g.drawImage(feather,0,ff*128,128,128,O26_FEATHER.left,O26_FEATHER.top,64,64);}
 g.imageSmoothingEnabled=false;g.translate(0,-12);g.rotate(f.rot);g.drawImage(im,f.col*64,f.row*68,64,68,-16,-19,32,34);g.rotate(-f.rot);g.translate(0,12);
 g.restore();
};
// Clear separation of silhouette and collision geometry. Continuous long rock
// planes replace the old small polygon tessellation. This is a reconstruction,
// not an assertion that the source game's proprietary terrain was extracted.
let o26RockPattern=null,o26RockImage=null;
function o26Ridge(g,x,y,w,seed,warm=false){
 const rng=o25Rng(seed),col=warm?'#bda888':'#8cabb1';
 g.save();g.beginPath();g.rect(x,y,w,8);g.clip();
 const top=g.createLinearGradient(0,y,0,y+8);top.addColorStop(0,warm?'#69756f':'#5d7e85');top.addColorStop(.18,warm?'#334743':'#314f59');top.addColorStop(1,'#15263100');g.fillStyle=top;g.fillRect(x,y,w,8);
 g.beginPath();g.moveTo(x,y+.45);for(let u=0;u<=w;u+=2)g.lineTo(x+u,y+.35+rng()*.8);g.strokeStyle=col;g.globalAlpha=.58;g.lineWidth=.5;g.stroke();g.globalAlpha=1;
 for(let u=1;u<w;){let len=6+rng()*22,h=2+rng()*2;g.strokeStyle=rng()<.5?'#0b172dbb':'#7896a13d';g.lineWidth=.55;g.beginPath();g.moveTo(x+u,y+h);g.bezierCurveTo(x+u+len*.25,y+h-.8,x+u+len*.75,y+h+.7,x+u+len,y+h-.4);g.stroke();u+=len+rng()*7;}
 g.restore();
}
function o26Terrain(){
 const g=ctx,im=o26Pictures.get('rock');if(!im)return o26TerrainBase();
 if(o26RockImage!==im){o26RockImage=im;o26RockPattern=g.createPattern(im,'repeat');o26RockPattern.setTransform(new DOMMatrix().scale(.32));}
 const ridges=[];
 for(const t of tiles.values()){
  if(t.hidden||t.x*16<camera-32||t.x*16>camera+288)continue;
  const X=t.x*16,Y=t.y*16,x=X-camera,y=Y-(t.bump?Math.sin(t.bump/12*Math.PI)*4:0);
  if(o25Art==='classic'||t.type!=='stone'){sprite(t.castleBase?'c23_base':t.type==='stone'?'c23_stone':t.used?'block_used':'question'+Math.floor(frame/8)%3,x,y,false,false,t.type==='question'?'under':'normal');continue;}
  g.save();g.translate(-camera,0);g.fillStyle=o26RockPattern;g.imageSmoothingEnabled=true;g.fillRect(X,Y,16,16);g.restore();
  const top=!at(t.x,t.y-1),bottom=!at(t.x,t.y+1),left=!at(t.x-1,t.y),right=!at(t.x+1,t.y);
  const shade=g.createLinearGradient(0,y,0,y+16);shade.addColorStop(0,'#07142400');shade.addColorStop(1,'#040a164f');if(t.y<5){g.fillStyle='#060e1766';g.fillRect(x,y,16,16);}else if(bottom){g.fillStyle=shade;g.fillRect(x,y,16,16);}
  if(top)ridges.push({x:X,y:Y,tx:t.x,ty:t.y});
  // Edge bevel remains INSIDE the solid rectangle, so it never obscures a gap.
  if(left){const q=g.createLinearGradient(x,0,x+4,0);q.addColorStop(0,'#a5c6ca5a');q.addColorStop(.2,'#547b8055');q.addColorStop(1,'#15283900');g.fillStyle=q;g.fillRect(x,y,4,16);}
  if(right){const q=g.createLinearGradient(x+12,0,x+16,0);q.addColorStop(0,'#07122400');q.addColorStop(1,'#020916d9');g.fillStyle=q;g.fillRect(x+12,y,4,16);}
  if(bottom){const q=g.createLinearGradient(0,y+11,0,y+16);q.addColorStop(0,'#01081300');q.addColorStop(1,'#010813cc');g.fillStyle=q;g.fillRect(x,y+11,16,5);}
  if(t.castleBase){g.save();g.translate(x+8,y+8);g.strokeStyle='#697883';g.lineWidth=.6;g.beginPath();g.arc(0,0,4.8,0,Math.PI*2);g.stroke();g.fillStyle='#121925';g.beginPath();g.arc(0,0,3.2,0,Math.PI*2);g.fill();o24Glow(g,0,0,6,'#ec9a53',.15);o24Ellipse(g,0,0,1.5,1.5,'#dc9b60');g.restore();}
 }
 ridges.sort((a,b)=>a.y-b.y||a.x-b.x);for(let i=0;i<ridges.length;){let a=ridges[i],w=16,j=i+1;while(j<ridges.length&&ridges[j].y===a.y&&ridges[j].x===a.x+w){w+=16;j++;}o26Ridge(g,a.x-camera,a.y,w,a.tx*1307+a.ty*19,a.x>1700);i=j;}
 // Few long mineral veins, clipped to stone-only tiles. No random sharp grids.
 g.save();g.beginPath();for(const t of tiles.values())if(t.type==='stone'&&!t.hidden&&t.x*16>=camera-20&&t.x*16<camera+276)g.rect(t.x*16-camera,t.y*16,16,16);g.clip();
 for(let k=Math.floor(camera/90)-1;k<Math.floor(camera/90)+5;k++){
  const xx=k*90-camera,yy=95+(Math.sin(k*8)*.5+.5)*132;g.lineWidth=.65;g.strokeStyle='#92b7be27';g.beginPath();g.moveTo(xx,yy);g.bezierCurveTo(xx+20,yy-7,xx+41,yy+8,xx+64,yy+3);g.bezierCurveTo(xx+74,yy+1,xx+74,yy-6,xx+91,yy-7);g.stroke();
 }
 g.restore();
}
const o26TerrainBase=o25Terrain;o25Terrain=o26Terrain;
// No floating circular portrait and no pale belly: a full scene character.
// The public Naru portrait is embedded and attached to the reconstructed body;
// the body and arm movement are explicitly identified as a reconstruction.
o25NaruPortrait=function(){};
o24Naru=function(g,x,feet,age=0,front=false){
 const im=o26Pictures.get('naru');if(!im)return;const hug=age>18,t=clamp((age-18)/40,0,1),sway=Math.sin((frame+23)*.03)*.18;
 g.save();g.translate(x,feet);g.rotate(-.012*t);
 if(!front){o24Glow(g,-2,-24,37,'#9bc6d0',.10);g.imageSmoothingEnabled=true;g.drawImage(im,-27,-62+sway,52,65);const head=o26Pictures.get('naruHead');if(head)g.drawImage(head,-24,-65+sway,47,47);}
 else{
  g.lineCap='round';g.lineJoin='round';const arm=g.createLinearGradient(-23,-28,-9,-5);arm.addColorStop(0,'#354d63');arm.addColorStop(.55,'#293c51');arm.addColorStop(1,'#465a6d');
  g.strokeStyle=arm;g.lineWidth=7.3;g.beginPath();g.moveTo(-17,-27);g.bezierCurveTo(-26,-23,-26+4*t,-13,-16+3*t,-10);g.stroke();g.lineWidth=1;g.strokeStyle='#75909d55';g.beginPath();g.moveTo(-19,-25);g.bezierCurveTo(-24,-21,-24+4*t,-14,-17+4*t,-12);g.stroke();
  o24Ellipse(g,-16+3*t,-10,4.2,2.7,'#4c6473',-.10);
 }
 g.restore();
};
// Three music roles, not the menu theme with an increased playback rate.
// These public streaming references were identified separately from the theme.
// No complete licensed recording is redistributed inside the HTML.
const O26_TRACKS={
 chase:{name:'Gareth Coker · Racing the Lava',url:'https://music.163.com/song/media/outer/url?id=31010768.mp3',page:'https://garethcoker.bandcamp.com/track/racing-the-lava'},
 reunion:{name:'Gareth Coker · Naru, Embracing the Light',url:'https://music.163.com/song/media/outer/url?id=31010744.mp3',page:'https://garethcoker.bandcamp.com/track/naru-embracing-the-light-feat-rachel-mellis'}
};
const o26Stream=document.createElement('audio');o26Stream.id='o26SceneMusic';o26Stream.preload='none';o26Stream.loop=true;o26Stream.hidden=true;document.body.append(o26Stream);
const o26Music={role:null,generation:0,pending:false,failed:false,blocked:false,status:'待播放',override:{},changes:0};
const o26AudioSyncBase=audioSync,o26StopMusicBase=stopMusic,o26MixBase=mixAudio;
function o26Role(){if(!c23Is()||c23Menu||!c23)return null;if(!['playing','paused','win'].includes(mode))return null;if(c23.ending)return c23.ending>110?'reunion':null;return c23.chaseStarted&&!c23.practice?'chase':null;}
function o26NativePause(clear=false){o26Stream.pause();if(clear){o26Music.generation++;o26Music.pending=false;o26Music.role=null;o26Music.failed=false;o26Music.blocked=false;o26Music.status='待播放';o26Stream.removeAttribute('src');o26Stream.load();}}
function o26NativePlay(){
 if(!o26Music.role||o26Music.pending||o26Music.failed||o26Music.blocked||!o26Stream.paused||!soundOn||document.hidden||mode==='paused'||!c23Is())return;
 const gen=o26Music.generation;o26Music.pending=true;
 o26Stream.play().then(()=>{if(gen!==o26Music.generation)return;if(!c23Is()||!soundOn||document.hidden||mode==='paused'||o26Music.failed){o26Stream.pause();return;}o26Music.status='正在播放';}).catch(e=>{if(gen!==o26Music.generation)return;o26Music.blocked=e.name==='NotAllowedError';o26Music.failed=!o26Music.blocked;o26Music.status=o26Music.blocked?'点击游戏以开启音乐':'在线音源未就绪';}).finally(()=>{if(gen===o26Music.generation){o26Music.pending=false;o26Status();}});
}
function o26AudioSync(){
 const role=o26Role();
 if(!c23Is()){if(o26Music.role)o26NativePause(true);return o26AudioSyncBase();}
 if(!role){if(o26Music.role)o26NativePause(true);if(c23?.ending||mode==='dying'||mode==='win'){o26StopMusicBase(false);return;}return o26AudioSyncBase();}
 // Stop old menu audio without stopping the native scene stream itself.
 if(bgm||heldTrack)o26StopMusicBase(false);
 if(o26Music.role!==role){o26NativePause(true);o26Music.role=role;o26Music.status='加载 '+O26_TRACKS[role].name;o26Music.changes++;o26Stream.src=o26Music.override[role]||O26_TRACKS[role].url;o26Stream.load();o26Status();}
 o26Stream.volume=soundOn?clamp(musicVolume,0,1)*.78:0;
 if(!soundOn||document.hidden||mode==='paused'){o26Stream.pause();return;}o26NativePlay();
}
audioSync=o26AudioSync;
stopMusic=function(remember=false){o26NativePause(!remember);return o26StopMusicBase(remember);};
mixAudio=function(){o26MixBase();o26Stream.volume=soundOn?clamp(musicVolume,0,1)*.78:0;};
o26Stream.addEventListener('error',()=>{if(!o26Music.role)return;o26Music.generation++;o26Music.failed=true;o26Music.pending=false;o26Music.status='在线音源不可用 · 不用主题曲替代追逐曲';o26Status();});
o26Stream.addEventListener('canplay',()=>{if(o26Music.role){o26Music.failed=false;o26Music.status='音源已就绪';o26NativePlay();o26Status();}});
for(const name of ['keydown','pointerdown'])window.addEventListener(name,e=>{if(e.repeat)return;if(o26Music.blocked){o26Music.blocked=false;o26NativePlay();}},true);
const o26Panel=document.createElement('div');o26Panel.className='o26-notes';o26Panel.innerHTML='<p><b>本关声音</b><br>入口 / 练习：原有主题曲<br>熔潮追逐：Racing the Lava<br>重逢：Naru, Embracing the Light</p><p id="o26MusicStatus" role="status"></p><button type="button" id="o26MusicRetry">重试在线音乐</button><p class="o25-note">羽毛完整帧已内置。纳鲁脸部采用已内置的公开原肖像，身体与拥抱、地形仍为重建，并非原版全身动画。追逐与重逢曲使用在线音源，失败时不播放不匹配的替代曲。</p>';
o25Panel.querySelector('.o25-resource-inner').append(o26Panel);
o25Panel.querySelector('.o25-note').textContent='角色和羽毛采用公开同人动作图；完整羽毛已内置。远、中、近景保持不变。';
o25Panel.querySelector('.o25-resource-inner>p').textContent='保留原有背景与奥日角色。修复完整羽毛与手部位置；材质采用连续岩层，纳鲁的原肖像与身体合成，不再悬浮在头顶。';
$('o26MusicRetry').onclick=()=>{o26Music.failed=false;o26Music.blocked=false;o26Music.pending=false;if(o26Music.role){o26Stream.load();o26NativePlay();}else o25LoadMusic();};
function o26Status(){const e=$('o26MusicStatus');if(e)e.textContent=o26Music.role?O26_TRACKS[o26Music.role].name+' · '+o26Music.status:'追逐音乐待触发';}
const o26UIBase=o24UI;o24UI=function(){o26UIBase();o26Status();};c23UI=o24UI;
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R26',chapter14:'Ori / feather grip and scene material corrections'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 window.__ori26={...window.__ori25,ready:()=>o26Ready,feather:()=>({...O26_FEATHER,ready:o26Pictures.has('feather'),size:[o26Pictures.get('feather')?.naturalWidth,o26Pictures.get('feather')?.naturalHeight]}),drawOri:o24Ori,drawNaru:o24Naru,drawTerrain:o26Terrain,glideFrame:o26GlideFrame,role:o26Role,sync:o26AudioSync,musicState:()=>({role:o26Music.role,status:o26Music.status,paused:o26Stream.paused,src:o26Stream.currentSrc||o26Stream.src,volume:o26Stream.volume,rate:o26Stream.playbackRate,generation:o26Music.generation,changes:o26Music.changes,main:bgm?.key||null,failed:o26Music.failed}),tracks:()=>structuredClone(O26_TRACKS),setStreamFixture:(role,url)=>{o26Music.override[role]=url;o26NativePause(true);o26AudioSync();},artReady:()=>[...o26Pictures.keys()],setMusicVolume:v=>{musicVolume=v;mixAudio();},setSound:v=>setSoundEnabled(v),stopNative:()=>o26NativePause(true)};
}

/* R27: referenced Horu/corrupted-water palette, distinct fluid hazards, and
   Mario epilogue. Texture/body/shader reconstruction, not extracted game art.
   Original offline score is explicitly labelled; it is NOT an Ori recording.
   One canvas, one fixed clock; no additional gameplay loop or iframe. */
const O27_LOCAL={"images":{"rock":"@@E04:uri:a188@@","lava":"@@E04:uri:a189@@","water":"@@E04:uri:a190@@","naruBody":"@@E04:uri:a191@@"},"music":{"ambient":"@@E04:uri:a192@@","chase":"@@E04:uri:a193@@","reunion":"@@E04:uri:a194@@"},"score":{"original_composition":true,"not_ori_soundtrack":true,"tracks":[{"role":"chase","bpm":148,"seconds":38.91891891891892,"notes":1004,"peak":0.5236110091209412,"rms":0.08292137831449509,"bytes":557462},{"role":"ambient","bpm":84,"seconds":22.857142857142858,"notes":160,"peak":0.47757837176322937,"rms":0.10521181672811508,"bytes":335703},{"role":"reunion","bpm":90,"seconds":21.333333333333332,"notes":168,"peak":0.47502002120018005,"rms":0.1105264201760292,"bytes":310333}]}};
const o27Images=new Map();
const o27Ready=Promise.all(Object.entries(O27_LOCAL.images).map(async([key,src])=>{
 const im=new Image(); im.src=src; await im.decode(); o27Images.set(key,im);
})).then(()=>{if(c23Is()&&c23)c23Draw();});
const O27_CITATIONS={
 hazards:'https://oriandtheblindforest.fandom.com/wiki/Dangers_(Ori_and_the_Blind_Forest)',
 album:'https://garethcoker.bandcamp.com/album/ori-and-the-blind-forest-original-soundtrack',
 gallery:'https://www.orithegame.com/blind-forest/',
 feather:'https://github.com/Ilemni/OriMod/blob/2043b81139cca3515c4458686ad39dc3cda09d7f/Animations/GlideAnim.png'
};
// Mario's original route is untouched. Only the first three existing liquid gaps
// become corrupted water; the bridge pool and rear chase remain lethal lava.
function o27Kind(pool){return pool.x<600?'corrupt':'lava';}
function o27Surface(pool,x,t=c23?.ticks||0){return pool.y+5+Math.sin(x*.155+t*.058)*.75+Math.sin(x*.33-t*.041)*.32;}
function o27PoolAt(p=player){return C23_LAVA.find(q=>p.x+p.w>q.x+1&&p.x<q.x+q.w-1&&p.y+p.h>o27Surface(q,clamp(p.x+p.w*.5,q.x,q.x+q.w))&&p.y<246)||null;}
const o27Water={interval:60,damage:1};
function o27WaterTick(){
 const o=c23.ori,q=o27PoolAt(),wet=!!q&&o27Kind(q)==='corrupt';
 if(wet&&!o.waterInside){o24FX(player.x+4,o27Surface(q,player.x+4),'#b584eb',13,1.3);c23Event('water-enter');}
 if(!wet&&o.waterInside){o24FX(player.x+4,Math.min(230,player.y+14),'#b584eb',9,.8);c23Event('water-exit');}
 o.waterInside=wet;
 if(!wet){o.waterTicks=0;return;}
 o.waterTicks=(o.waterTicks||0)+1;
 if(o.waterTicks>=o27Water.interval){o.waterTicks=0;o.hp=Math.max(0,o.hp-o27Water.damage);o.hurt=12;o24Sound('hurt');o24FX(player.x+4,player.y+8,'#b47cdd',8,.8);c23Event('corrupt-water-damage',{hp:o.hp});if(o.hp<=0)c23Fail('污染河水');}
}
const o27PlayerBase=o24Player;
o24Player=function(v){
 const q=o27PoolAt(),wet=q&&o27Kind(q)==='corrupt',o=c23.ori;
 // Drag/buoyancy lets the player get out with the unchanged jump key. It does
 // not pretend the unsafe river is a walkable platform or give air invincibility.
 if(wet&&!o.dash&&!o.boost){player.vx*=.84;player.vy=Math.max(-4.4,Math.min(.35,player.vy));if(player.y>o27Surface(q,player.x+4)-4&&player.vy>-.5)player.vy=-.36;
  if(v.jump&&!o.prev.jump){o.jumps=Math.min(o.jumps,1);o.stomp=0;} }
 o27PlayerBase(v);
 if(wet&&!o.dash&&!o.boost){player.y=Math.min(player.y,238);player.vy=Math.min(player.vy,.52);o.stomp=0;}
};
c23Hazards=function(){
 const o=c23.ori;
 for(let j=0;j<C23_BARS.length;j++)for(const q of c23BarDots(C23_BARS[j],j))if(c23CircleHit(q.x,q.y,3.3))c23Hurt('旋转火棒');
 const q=o27PoolAt();if(q&&o27Kind(q)==='lava'){c23Fail('熔岩');return;}
 o27WaterTick();if(mode!=='playing')return;
 for(const f of c23.fire){
  f.age++;
  if(f.reflected){f.x+=f.vx;f.y+=f.vy||0;const boss=c23.bowser;
   if(boss.alive&&overlap({x:f.x,y:f.y,w:24,h:8},boss)){o24BossDamage(4);f.destroy=true;o24FX(f.x,f.y,'#ffe8ad',15,2);}}
  else{f.x+=f.vx;f.y=approach(f.y,f.ty,.38);if(overlap(player,{x:f.x+4,y:f.y+2,w:16,h:4}))c23Hurt('库巴火焰');}
 }
 const b=c23.bowser;if(b.alive&&b.active&&overlap(player,{x:b.x+2,y:b.y+3,w:24,h:28}))c23Hurt('库巴');
 c23.fire=c23.fire.filter(f=>!f.destroy&&f.age<440&&f.x>camera-70&&f.x<camera+400&&f.y>-40&&f.y<280);
};

// Single world-space diffuse layer eliminates individual 16px tile seams.
// Broad irregular strata + clipped rim light, with the ledge exactly at collision.
let o27RockPattern=null,o27MoltenPattern=null,o27WaterPattern=null;
const o27TerrainBase=o25Terrain;
o25Terrain=function(){
 if(o25Art==='classic'||!o27Images.has('rock'))return o27TerrainBase();
 const g=ctx,visible=[...tiles.values()].filter(t=>!t.hidden&&t.x*16>=camera-32&&t.x*16<camera+288),stones=visible.filter(t=>t.type==='stone');
 if(!o27RockPattern){o27RockPattern=g.createPattern(o27Images.get('rock'),'repeat');o27RockPattern.setTransform(new DOMMatrix().scale(.33));}
 g.save();g.beginPath();for(const t of stones)g.rect(t.x*16-camera,t.y*16,16,16);g.clip();
 g.save();g.translate(-camera,0);g.fillStyle=o27RockPattern;g.imageSmoothingEnabled=true;g.fillRect(camera-32,32,320,218);g.restore();
 const cool=g.createLinearGradient(0,32,0,240);cool.addColorStop(0,'#080b17aa');cool.addColorStop(.52,'#131c2000');cool.addColorStop(1,'#060712aa');g.fillStyle=cool;g.fillRect(0,32,256,208);
 const wave=c23.wave-camera; if(c23.chaseStarted&&!c23.ending){const hot=g.createLinearGradient(Math.max(-120,wave-20),0,Math.max(1,wave+150),0);hot.addColorStop(0,'#fc722b70');hot.addColorStop(.4,'#ce572520');hot.addColorStop(1,'#d4510b00');g.fillStyle=hot;g.fillRect(0,32,256,208);}
 for(let k=Math.floor(camera/105)-1;k<Math.ceil((camera+280)/105);k++){
  const x=k*105-camera,y=94+(Math.sin(k*18)*.5+.5)*105;
  g.lineWidth=1.0;g.strokeStyle='#030710b0';g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+15,y-5,x+35,y-7,x+48,y-4);g.bezierCurveTo(x+69,y+1,x+77,y-5,x+99,y-10);g.stroke();
  g.lineWidth=.32;g.strokeStyle='#b0a09224';g.translate(0,1);g.stroke();g.translate(0,-1);
 }
 g.restore();
 const tops=[];
 for(const t of stones){const X=t.x*16,Y=t.y*16,x=X-camera,top=!at(t.x,t.y-1),bottom=!at(t.x,t.y+1),left=!at(t.x-1,t.y),right=!at(t.x+1,t.y);
  if(top)tops.push({x:X,y:Y});
  if(bottom){const a=g.createLinearGradient(0,Y+11,0,Y+16);a.addColorStop(0,'#00000000');a.addColorStop(1,'#040810bb');g.fillStyle=a;g.fillRect(x,Y+11,16,5);}
  if(left){const a=g.createLinearGradient(x,0,x+4,0);a.addColorStop(0,'#a6998188');a.addColorStop(1,'#64544100');g.fillStyle=a;g.fillRect(x,Y,4,16);}
  if(right){g.fillStyle='#03071466';g.fillRect(x+14,Y,2,16);}
  if(t.castleBase){o24Glow(g,x+8,Y+8,5,'#ec8d40',.15);g.strokeStyle='#9e8775';g.lineWidth=.55;g.beginPath();g.arc(x+8,Y+8,4.2,0,Math.PI*2);g.stroke();o24Ellipse(g,x+8,Y+8,1.2,1.2,'#eeb970');}
 }
 tops.sort((a,b)=>a.y-b.y||a.x-b.x);
 for(let i=0;i<tops.length;){const a=tops[i];let w=16,j=i+1;while(j<tops.length&&tops[j].y===a.y&&tops[j].x===a.x+w){w+=16;j++;}
  const x=a.x-camera,y=a.y;g.save();g.beginPath();g.rect(x,y,w,5);g.clip();const sh=g.createLinearGradient(0,y,0,y+5);sh.addColorStop(0,'#bcc2a0a6');sh.addColorStop(.26,'#786f5177');sh.addColorStop(1,'#332c2800');g.fillStyle=sh;g.fillRect(x,y,w,5);g.strokeStyle='#dddcc578';g.lineWidth=.45;g.beginPath();g.moveTo(x,y+.5);for(let u=1;u<=w;u+=1.5)g.lineTo(x+u,y+.5+Math.sin((a.x+u)*.71)*.35);g.stroke();g.restore();i=j;
 }
 for(const t of visible)if(t.type!=='stone'){const x=t.x*16-camera,y=t.y*16-(t.bump?Math.sin(t.bump/12*Math.PI)*4:0);sprite(t.used?'block_used':'question'+Math.floor(frame/8)%3,x,y,false,false,'under');}
};
function o27FluidFill(x,y,w,h,t,kind,vertical=false){
 const g=ctx,im=o27Images.get(kind==='corrupt'?'water':'lava');if(!im){g.fillStyle=kind==='corrupt'?'#4b2069':'#d64518';g.fillRect(x,y,w,h);return;}
 const sz=kind==='corrupt'?96:110,speed=kind==='corrupt'?.11:.47;
 g.save();g.imageSmoothingEnabled=true;g.globalAlpha=.93;
 const dx=vertical?(t*speed)%sz:-(t*speed)%sz,dy=vertical?(t*.27)%sz:0;
 for(let xx=Math.floor((x-dx)/sz)*sz+dx;xx<x+w;xx+=sz)for(let yy=Math.floor((y-dy)/sz)*sz+dy;yy<y+h;yy+=sz)g.drawImage(im,xx,yy,sz,sz);
 g.globalCompositeOperation='screen';g.globalAlpha=kind==='corrupt'?.09:.19;
 for(let xx=x-sz;xx<x+w+sz;xx+=sz)g.drawImage(im,xx+((t*.21)%sz),y-((t*.1)%32),sz,h+34);
 g.restore();
}
o24DrawPool=function(pool){
 const x=pool.x-camera,g=ctx,t=c23.ticks,kind=o27Kind(pool);if(x>280||x+pool.w<-24)return;
 g.save();g.beginPath();g.moveTo(x,244);g.lineTo(x,o27Surface(pool,pool.x));for(let u=0;u<=pool.w;u+=1.5)g.lineTo(x+u,o27Surface(pool,pool.x+u));g.lineTo(x+pool.w,244);g.closePath();g.clip();
 o27FluidFill(x,pool.y,pool.w,244-pool.y,t,kind);
 const q=g.createLinearGradient(0,pool.y,0,244);q.addColorStop(0,kind==='corrupt'?'#ca91ff9e':'#ffe39ea0');q.addColorStop(.26,kind==='corrupt'?'#7438b94a':'#f2580c33');q.addColorStop(1,kind==='corrupt'?'#10081fde':'#3d0a12aa');g.fillStyle=q;g.fillRect(x,pool.y,pool.w,244-pool.y);
 for(let i=0;i<Math.ceil(pool.w/7);i++){const xx=pool.x+((i*29+t*.13)%pool.w),y=pool.y+8+((i*37-t*.065)%23+23)%23;g.strokeStyle=kind==='corrupt'?'#daa4ed34':'#ffbf713d';g.lineWidth=.5;g.beginPath();g.ellipse(xx-camera,y,1.1,.45,0,0,Math.PI*2);g.stroke();}
 g.restore();
 g.save();g.beginPath();for(let u=0;u<=pool.w;u++){const y=o27Surface(pool,pool.x+u);u?g.lineTo(x+u,y):g.moveTo(x,y);}g.strokeStyle=kind==='corrupt'?'#d6a3fccc':'#fff0addd';g.lineWidth=.75;g.shadowColor=kind==='corrupt'?'#9b46dd':'#ff9228';g.shadowBlur=kind==='corrupt'?4:8;g.stroke();g.restore();
 // Thin local vapour, never an opaque cloud across a landing platform.
 for(let i=0;i<Math.ceil(pool.w/24);i++){const xx=x+12+i*24,y=pool.y-1-Math.sin(t*.023+i)*1.5;o24Glow(g,xx,y,9,kind==='corrupt'?'#8d43c5':'#f57724',kind==='corrupt'?.06:.10);}
};
// The bright boundary is the exact shared collision surface. Heat haze is only
// drawn on the hot side; standing ledges in front of it remain sharply visible.
o24DrawWave=function(){
 const s=c23,g=ctx,t=s.ticks;if(!s.chaseStarted||s.practice||s.ending)return;const edge=s.wave-camera;if(edge<-100)return;
 const path=()=>{g.beginPath();g.moveTo(-128,32);g.lineTo(o24Front(32)-camera,32);for(let y=32;y<=242;y+=1.5)g.lineTo(o24Front(y)-camera,y);g.lineTo(-128,242);g.closePath();};
 g.save();path();g.clip();o27FluidFill(-128,32,Math.max(1,edge+142),212,t,'lava',true);
 const hot=g.createLinearGradient(edge-42,0,edge+3,0);hot.addColorStop(0,'#75232900');hot.addColorStop(.48,'#ff541338');hot.addColorStop(.85,'#ffb849ba');hot.addColorStop(1,'#fff3b7ec');g.fillStyle=hot;g.fillRect(-128,32,edge+146,212);
 for(let i=0;i<16;i++){const y=35+((i*43+t*.43)%204),x=edge-8-((i*37+t*.3)%96),r=1.1+i%4*.7;g.save();g.translate(x,y);g.rotate(i+t*.013);g.fillStyle='#231219e5';g.strokeStyle='#ff7b3555';g.lineWidth=.4;g.beginPath();g.moveTo(-r,-r*.7);g.lineTo(r*.8,-r);g.lineTo(r,r*.5);g.lineTo(-r*.5,r);g.closePath();g.fill();g.stroke();g.restore();}g.restore();
 g.save();g.beginPath();for(let y=32;y<=242;y++){let x=o24Front(y)-camera;y===32?g.moveTo(x,y):g.lineTo(x,y);}g.lineWidth=.9;g.strokeStyle='#fff3bc';g.shadowColor='#ff922b';g.shadowBlur=10;g.stroke();g.restore();
 for(let i=0;i<28;i++){const a=(t+i*17)%82,yy=36+((i*33-a*.73)%197+197)%197,xx=o24Front(yy)-camera+Math.sin(i*4)*a*.12;g.save();g.globalAlpha=(1-a/83)*.85;o24Ellipse(g,xx,yy,.22+(i%4)*.09,.5+(i%3)*.2,'#ffce70',-.5);g.restore();}
};
// Naru: lower head-to-body ratio, heavier haunches, single visible face. The
// source portrait is retained. This is still an explicitly reconstructed body.
const o27NaruBase=o24Naru;
o24Naru=function(g,x,feet,age=0,front=false){
 const body=o27Images.get('naruBody'),head=o26Pictures.get('naruHead');if(!body||!head)return o27NaruBase(g,x,feet,age,front);
 const k=clamp((age-16)/55,0,1),breath=Math.sin((c23?.ticks||0)*.04)*.17;g.save();g.translate(x,feet);
 if(!front){o24Ellipse(g,-1,.2,23,2,'#03081599');g.imageSmoothingEnabled=true;g.drawImage(body,-29,-66+breath,56,70);g.drawImage(head,-23,-69+breath,42,42);}
 else{g.lineCap='round';const a=g.createLinearGradient(-27,-29,-11,-7);a.addColorStop(0,'#293648');a.addColorStop(.6,'#182638');a.addColorStop(1,'#405366');g.strokeStyle=a;g.lineWidth=7.7;g.beginPath();g.moveTo(-19,-30);g.bezierCurveTo(-29,-26,-30+5*k,-13,-18+5*k,-10);g.stroke();o24Ellipse(g,-18+5*k,-10,4,2.6,'#40566b',-.2);}
 g.restore();
};
// Keep the verified feather anchor. Reveal the purple shaft with rim light only
// within the feather's alpha; no fabricated second feather or detached handle.


// Epilogue is an actual ending state, NOT an overlay covering an active player.
// Pause/retry/chapter switch remain owned by the normal input dispatcher.
const O27_DIALOGUE='我的公主呢？看来还需要继续。。。';
function o27Epilogue(){const e=c23.epilogue||{age:0};return {...e,text:O27_DIALOGUE};}
function o27Finish(){
 if(mode==='win')return;mode='win';c23Campaign.completed.add(14);save.set('chapters',JSON.stringify([...c23Campaign.completed]));
 showOverlay('ORI × MARIO / WORLD 1-4','旅途，还在继续','奥日与纳鲁重逢。<br>马里奥：我的公主呢？看来还需要继续。。。','再挑战一次 →','A / ENTER 重玩 · C / SELECT 选关');
 $('overlayCharacters').hidden=false;$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');c23Event('win',{score,retries:c23.retries,frames:c23.runFrames,epilogue:true});c23UpdateTabs();
}
c23EndingTick=function(){
 const s=c23,o=s.ori;s.ending++;
 if(s.ending<85&&s.ending%6===0){s.bridgeRemoved=Math.min(13,s.bridgeRemoved+1);s.dust.push({x:2256-s.bridgeRemoved*16,y:163,vx:0,vy:.5,life:60,s:7});oneShot('break',{volume:.24});}
 if(s.ending>34){s.bowser.y+=s.bowser.vy;s.bowser.vy+=.24;}
 if(s.ending===96){o24Sound('link');c23Event('bridge-cleared');}
 if(s.ending>112){player.facing=1;player.vy=Math.min(4.25,player.vy+.4375);moveBody(player,player.x<2416?1.3:0,player.vy,true);player.anim+=1.3;camera=clamp(Math.max(camera,player.x-120),0,2304);}
 if(player.x>=2410){o.rescue++;o.pose='idle';}else if(s.ending>112)o.pose='run';
 if(s.ending>240&&player.x>=2416){const n=Math.min(5,timeLeft);timeLeft-=n;score+=n*50;}
 if(player.x>=2416&&o.rescue>=90){
  if(!s.epilogue){s.epilogue={age:0,x:2310,face:1,phase:'walk',chars:0};c23Event('mario-epilogue-start');}
  const e=s.epilogue;e.age++;
  if(e.age<=82){e.x=Math.min(2370,2310+e.age*.73);e.phase='walk';}
  else if(e.age<132){e.phase='look';e.face=Math.floor((e.age-82)/17)%2?-1:1;}
  else {e.face=1;e.phase='talk';e.chars=Math.min(O27_DIALOGUE.length,Math.floor((e.age-132)/4)+1);if(e.age===132)c23Event('mario-dialogue',{text:O27_DIALOGUE});}
  if(e.age>=348){e.phase='done';c23Event('mario-epilogue-end');o27Finish();}
 }
};
function o27DrawEpilogue(){
 const e=c23.epilogue;if(!e)return;const g=ctx,name=e.phase==='walk'?'small_run'+Math.floor(e.age/6)%3:'small_idle',im=classicSprite(name);
 sprite(name,e.x-camera-im.width/2,208-im.height,e.face<0,false,'normal');
 if(e.phase==='look'){g.save();g.font='bold 7px sans-serif';g.textAlign='center';g.fillStyle='#ffdc95';g.fillText('?',e.x-camera,185);g.restore();}
 if(e.phase==='talk'||e.phase==='done'){
  const x=16,y=82,w=207,h=37;g.save();g.fillStyle='#081321ed';g.strokeStyle='#aabaaba6';g.lineWidth=.6;g.beginPath();g.roundRect(x,y,w,h,3);g.fill();g.stroke();
  g.fillStyle='#eadab4';g.font='6px system-ui, "Microsoft YaHei", sans-serif';g.fillText('马里奥',x+8,y+10);g.fillStyle='#fff5d8';g.font='8.1px system-ui, "Microsoft YaHei", sans-serif';g.fillText(O27_DIALOGUE.slice(0,e.chars),x+8,y+25);
  g.fillStyle='#081321';g.beginPath();g.moveTo(e.x-camera-2,y+h);g.lineTo(e.x-camera+6,y+h);g.lineTo(e.x-camera+1,y+h+5);g.fill();g.restore();
 }
}
const o27SceneBase=o24Scene;o24Scene=function(){o27SceneBase();o27DrawEpilogue();};

// AUDIO: each role has a real embedded ORIGINAL composition. Optional original-
// soundtrack references can be tried without starving the offline soundtrack.
// Only one audio element is ever playing; the probe is muted and NEVER played.
o26NativePause(true);o26Stream.remove();
for(let i=AUDIO_MANIFEST.length-1;i>=0;i--)if(AUDIO_MANIFEST[i].key===O25_THEME.key)AUDIO_MANIFEST.splice(i,1);
const O27_TRACKS={
 ambient:{name:'Ori — Main Theme（在线参考）',url:O25_THEME.cdn,seconds:null},
 chase:{name:'Gareth Coker — Fleeing Kuro（在线参考）',url:'https://music.163.com/song/media/outer/url?id=31010774.mp3',seconds:228},
 reunion:{name:'Gareth Coker — Naru, Embracing the Light（在线参考）',url:'https://music.163.com/song/media/outer/url?id=31010744.mp3',seconds:84}
};
const O27_SCORE_NAMES={ambient:'微光入城',chase:'熔流将至',reunion:'归途的灯'};
const o27Audio=document.createElement('audio'),o27Probe=document.createElement('audio');
o27Audio.id='o27SceneMusic';o27Audio.loop=true;o27Audio.preload='auto';o27Audio.hidden=true;
o27Probe.id='o27MusicProbe';o27Probe.preload='auto';o27Probe.muted=true;o27Probe.hidden=true;document.body.append(o27Audio,o27Probe);
const o27Music={role:null,source:'none',status:'等待开始',generation:0,probeGeneration:0,probeTimer:null,pending:false,blocked:false,changes:0,online:new Map(),failed:new Set(),overrides:{},mode:'auto'};
try{o27Music.mode=save.get('ori-music-source','auto')==='offline'?'offline':'auto';}catch{}
function o27Role(){if(!c23Is()||!c23||c23Menu||!['playing','paused','win'].includes(mode))return null;if(c23.ending)return c23.ending>112?'reunion':null;return c23.chaseStarted&&!c23.practice?'chase':'ambient';}
function o27CanPlay(){return c23Is()&&!c23Menu&&soundOn&&!document.hidden&&mode!=='paused'&&!!o27Music.role;}
function o27CancelProbe(){o27Music.probeGeneration++;clearTimeout(o27Music.probeTimer);o27Probe.oncanplay=o27Probe.onerror=null;o27Probe.removeAttribute('src');o27Probe.load();}
function o27Stop(clear=false){o27Audio.pause();if(clear){o27Music.generation++;o27Music.role=null;o27Music.pending=false;o27Music.blocked=false;o27Music.source='none';o27Audio.removeAttribute('src');o27Audio.load();o27CancelProbe();}}
function o27Play(){
 if(!o27CanPlay()||o27Music.pending||o27Music.blocked||!o27Audio.paused)return;
 const gen=o27Music.generation;o27Music.pending=true;
 o27Audio.play().then(()=>{if(gen!==o27Music.generation)return;if(!o27CanPlay()){o27Audio.pause();return;}o27Music.status=o27Music.source==='online'?'在线曲目正在播放':'原创离线配乐正在播放';}).catch(e=>{if(gen!==o27Music.generation)return;if(e.name==='NotAllowedError'){o27Music.blocked=true;o27Music.status='点击游戏开启声音';}else if(o27Music.source==='online'){o27Music.failed.add(o27Music.role);o27Use(o27Music.role,'offline');}else{o27Music.status='配乐暂未启动，请点击“重试声音”';}}).finally(()=>{if(gen===o27Music.generation)o27Music.pending=false;o27MusicUI();});
}
function o27Use(role,source){
 if(!role||!O27_TRACKS[role])return;
 o27Audio.pause();o27Music.generation++;o27Music.pending=false;o27Music.blocked=false;o27Music.role=role;o27Music.source=source;o27Music.status=source==='online'?'在线原曲正在加载':'原创离线配乐正在加载';o27Music.changes++;
 o27Audio.src=source==='online'?(o27Music.overrides[role]||O27_TRACKS[role].url):O27_LOCAL.music[role];o27Audio.volume=soundOn?clamp(musicVolume,0,1)*.86:0;o27Audio.load();o27Play();o27MusicUI();
}
function o27TryOnline(role){
 if(o27Music.mode!=='auto'||o27Music.failed.has(role))return;
 if(o27Music.online.has(role)){if(o27Music.role===role&&o27Music.source!=='online')o27Use(role,'online');return;}
 o27CancelProbe();const gen=o27Music.probeGeneration;o27Music.status='原创备用播放中 · 正在检查原曲外链';
 const fail=()=>{if(gen!==o27Music.probeGeneration)return;o27Music.failed.add(role);o27CancelProbe();o27Music.status='原曲外链未就绪 · 使用原创离线配乐';o27MusicUI();};
 o27Probe.oncanplay=()=>{if(gen!==o27Music.probeGeneration)return;const len=o27Probe.duration,expect=O27_TRACKS[role].seconds;
  if(!o27Music.overrides[role]&&expect&&(!Number.isFinite(len)||Math.abs(len-expect)>5)){fail();return;}
  const url=o27Music.overrides[role]||O27_TRACKS[role].url;o27Music.online.set(role,url);o27CancelProbe();
  if(o27Music.role===role&&o27Role()===role&&c23Is()&&o27Music.mode==='auto')o27Use(role,'online');
 };
 o27Probe.onerror=fail;o27Music.probeTimer=setTimeout(fail,5000);o27Probe.src=o27Music.overrides[role]||O27_TRACKS[role].url;o27Probe.load();o27MusicUI();
}
function o27Sync(){
 if(!c23Is()){if(o27Music.role)o27Stop(true);return o26AudioSyncBase();}
 if(bgm||heldTrack)o26StopMusicBase(false);
 const role=o27Role();if(!role){if(o27Music.role)o27Stop(true);return;}
 if(o27Music.role!==role){o27Use(role,o27Music.mode==='auto'&&o27Music.online.has(role)?'online':'offline');o27TryOnline(role);}
 o27Audio.volume=soundOn?clamp(musicVolume,0,1)*.86:0;
 if(!o27CanPlay()){o27Audio.pause();return;}o27Play();
}
// Disable the old theme queue for this chapter; it otherwise downloads a theme
// while the dedicated chase/reunion player is active.
o25LoadMusic=async function(){o27Sync();};
audioSync=o27Sync;
stopMusic=function(remember=false){o27Stop(!remember);return o26StopMusicBase(remember);};
mixAudio=function(){o26MixBase();o27Audio.volume=soundOn?clamp(musicVolume,0,1)*.86:0;};
o27Audio.addEventListener('error',()=>{if(o27Music.role&&o27Music.source==='online'){o27Music.failed.add(o27Music.role);o27Use(o27Music.role,'offline');}});
for(const event of ['pointerdown','keydown'])window.addEventListener(event,e=>{if(!e.repeat&&o27Music.blocked){o27Music.blocked=false;o27Play();}},true);
const o27Panel=document.createElement('section');o27Panel.className='o27-audio';
o27Panel.innerHTML='<label class="o25-look"><span>场景配乐</span><select id="o27MusicMode"><option value="auto">原曲外链优先 / 原创离线备用</option><option value="offline">原创离线配乐</option></select></label><p id="o27MusicStatus" role="status"></p><button id="o27MusicRetry" type="button">重试声音</button><p class="o25-note">追逐参考：Fleeing Kuro；重逢参考：Naru, Embracing the Light。原曲外链可能不可用。内置三首配乐为本项目原创，不是奥日录音。岩层、熔流、污染水及纳鲁身体为对照重建；角色和羽毛为公开同人素材。</p><p><a href="'+O27_CITATIONS.album+'" target="_blank" rel="noopener">原声曲目来源</a> · <a href="'+O27_CITATIONS.hazards+'" target="_blank" rel="noopener">水与熔岩参考</a></p>';
o26Panel.replaceWith(o27Panel);$('o27MusicMode').value=o27Music.mode;
$('o27MusicMode').onchange=e=>{o27Music.mode=e.target.value;save.set('ori-music-source',o27Music.mode);o27Stop(true);o27Sync();canvas.focus({preventScroll:true});};
$('o27MusicRetry').onclick=()=>{o27Music.failed.clear();o27Music.blocked=false;o27Stop(true);o27Sync();};
function o27MusicUI(){const e=$('o27MusicStatus');if(!e)return;const r=o27Music.role;e.textContent=r?((o27Music.source==='online'?O27_TRACKS[r].name:'《'+O27_SCORE_NAMES[r]+'》· 本项目原创')+'\n'+o27Music.status):'配乐随入口、追逐与重逢切换。';const summary=$('o25Summary');if(summary)summary.textContent='完整羽毛已内置 · '+(r?(o27Music.source==='online'?'原曲外链':'原创离线配乐'):'配乐随场景切换');}
const o27ResourceUIBase=o25ResourceUI;o25ResourceUI=function(){o27ResourceUIBase();o27MusicUI();};
const o27UIBase=o24UI;o24UI=function(){o27UIBase();o27MusicUI();if(c23Is()&&c23?.epilogue&&mode!=='win'){c23Set('stateLabel','通关彩蛋');c23Set('relayMessage','马里奥也赶到了。');}};c23UI=o24UI;
o25Panel.querySelector('.o25-resource-inner>p').textContent='保留四关与原路线；岩壁改用连续纹理。紫色污染水持续伤害，桥下熔岩与后方熔潮仍致命。';
const o27Note=o25Panel.querySelector('.o25-note');if(o27Note)o27Note.textContent='现有公开同人角色、完整羽毛与纳鲁头像保留；背景层联网增强。新增环境与离线配乐为重建/原创，不冒充官方素材。';
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R27',chapter14:'Ori / fluids, scene music and Mario epilogue'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test')){
 window.__ori27={...window.__ori26,ready:()=>Promise.all([o26Ready,o27Ready]),draw:()=>c23Draw(),drawTerrain:()=>o25Terrain(),drawNaru:o24Naru,pools:()=>C23_LAVA.map(p=>({...p,kind:o27Kind(p)})),surface:o27Surface,water:()=>({inside:!!c23.ori.waterInside,ticks:c23.ori.waterTicks||0,...o27Water}),hazards:()=>c23Hazards(),epilogue:o27Epilogue,sync:o27Sync,
  musicState:()=>({role:o27Music.role,source:o27Music.source,status:o27Music.status,generation:o27Music.generation,paused:o27Audio.paused,pending:o27Music.pending,blocked:o27Music.blocked,time:o27Audio.currentTime,duration:o27Audio.duration,volume:o27Audio.volume,rate:o27Audio.playbackRate,ready:o27Audio.readyState,changes:o27Music.changes,main:bgm?.key||null,online:[...o27Music.online.keys()],failed:[...o27Music.failed],probePlaying:!o27Probe.paused}),
  setMusicMode:m=>{o27Music.mode=m;o27Stop(true);o27Sync();},setOnlineFixture:(r,u)=>{o27Music.overrides[r]=u;o27Music.failed.delete(r);o27Stop(true);o27Sync();},art:()=>[...o27Images.keys()],ending:()=>c23EndingTick(),tracks:()=>structuredClone(O27_TRACKS),originalScore:()=>O27_LOCAL.score,stopScene:()=>o27Stop(true)
 };
}
