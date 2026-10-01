import {loadPixelFont} from './chill-font.mjs';
import {play} from './editor-play.mjs';
export function mountStartingLives(host){
 const label=document.createElement('label'),select=document.createElement('select');label.style.cssText='display:block;margin:20px 0';label.append('初始生命数 ',select);select.id='starting-lives';select.setAttribute('aria-label','初始生命数');
 for(let n=1;n<=30;n++)select.add(new Option(n+' 条'+(n===3?'（默认）':''),String(n)));select.value='3';host.append(label);
 return ()=>{const n=Number(select.value);return Number.isFinite(n)&&n>=1?Math.min(30,Math.floor(n)):3;};
}
export function mountCampaign(levels,media){
 const host=document.querySelector('.launch-copy'),status=document.getElementById('status');host.replaceChildren();
 const title=document.createElement('h1');title.textContent='小Q · '+(levels[0]?.rooms.some(r=>r.playHero==='bill')?'魂斗罗':'马里奥')+'连续闯关';host.append(title);
 const note=document.createElement('p');note.textContent='32 关连续闯关测试版 · 自由选关 · 离线游玩。部分机关与原版仍有差异。';host.append(note);
 const world=document.createElement('select'),level=document.createElement('select');world.setAttribute('aria-label','选择世界');level.setAttribute('aria-label','选择关卡');
 for(let w=1;w<=8;w++)world.add(new Option('世界 '+w,String(w)));
 const refill=()=>{level.replaceChildren();for(const item of levels.filter(l=>l.id.startsWith(world.value+'-')))level.add(new Option(item.id,item.id));};world.onchange=refill;refill();
 const controls=document.createElement('div');controls.className='actions';controls.append(world,level);host.append(controls);
 const start=document.createElement('button'),selected=document.createElement('button');start.className='primary';start.textContent='从 1-1 开始';selected.textContent='从所选关开始';controls.append(start,selected);host.append(status);
 const developerLabel=document.createElement('label'),developerMode=document.createElement('input');developerMode.type='checkbox';developerMode.id='developer-mode';developerLabel.style.cssText='display:block;margin-top:20px';developerLabel.append(developerMode,' 开发者试玩（原地复活）');host.insertBefore(developerLabel,status);
 const startingLives=mountStartingLives(host);
 installCreditsStyle();
 let busy=false;

 async function run(index,carry=null,session=null){if(busy)return;busy=true;start.disabled=selected.disabled=true;status.hidden=true;let curtain;
 try{carry??={lives:startingLives()};const entry=levels[index];if(!entry){showCredits(session);return;}curtain=document.createElement('section');curtain.className='campaign-card level-intro';const heading=document.createElement('h2');heading.textContent='WORLD '+entry.id;const lives=document.createElement('p');lives.textContent=(entry.rooms.some(r=>r.playHero==='bill')?'BILL × ':'MARIO × ')+(carry?.lives??3);curtain.append(heading,lives);(session?.screen||document.body).append(curtain);await new Promise(r=>setTimeout(r,1200));curtain.remove();
 const playOptions={developerMode:developerMode.checked,initialState:carry,onWarp:(target,next,current)=>run(levels.findIndex(l=>l.id===target),next,current),onComplete:(next,current)=>run(index+1,next,current)};if(session)await session.load(entry.pack,entry.rooms,playOptions);else await play(entry.pack,entry.rooms,media,playOptions);
 const dialog=document.querySelector('dialog[open]');if(dialog){const back=[...dialog.querySelectorAll('button')].find(b=>b.textContent==='返回编辑');if(back)back.textContent='返回选关';}
 }catch(error){status.hidden=false;status.textContent='无法启动：'+error.message;}finally{curtain?.remove();busy=false;start.disabled=selected.disabled=false;}}
 start.onclick=()=>run(0);selected.onclick=()=>run(levels.findIndex(l=>l.id===level.value));
}

function installCreditsStyle(){
 loadPixelFont();
 if(document.getElementById('workshop-credits-style'))return;
 const style=document.createElement('style');style.id='workshop-credits-style';
 style.textContent=`
 .campaign-card{font-family:ChillBitmap16,sans-serif;position:fixed;inset:0;background:#101015;color:#fff;z-index:10000;display:grid;place-content:center;text-align:center;padding:24px;box-sizing:border-box}
 .campaign-card h2{font-size:36px}
 .campaign-card.level-intro{--intro-font:32px;gap:var(--intro-font)}
 .campaign-card.level-intro>h2,.campaign-card.level-intro>p{display:block!important;position:static!important;font-family:ChillBitmap16,sans-serif!important;font-size:var(--intro-font)!important;font-weight:400!important;line-height:1.5!important;margin:0!important;width:auto!important;max-width:none!important}
 @media(min-width:640px) and (min-height:640px){.campaign-card.level-intro{--intro-font:48px}}
 @media(min-width:960px) and (min-height:960px){.campaign-card.level-intro{--intro-font:64px}}
 @media(min-width:1280px) and (min-height:1280px){.campaign-card.level-intro{--intro-font:80px}}
 @media(max-width:360px),(max-height:360px){.campaign-card.level-intro{--intro-font:24px;gap:16px}}
 .campaign-card.credits-card{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:16px;padding:clamp(16px,4vh,40px);font-family:ChillBitmap16,sans-serif;background:radial-gradient(ellipse at 50% 10%,#28243c,#101015 65%);overflow:auto}
 .credits-card .credits-window{width:min(100%,800px);flex:1;min-height:0;overflow:hidden;mask-image:linear-gradient(transparent,#000 8%,#000 92%,transparent)}
 .credits-card .credits-roll{animation:workshop-credits-roll 32s linear both;padding:32px 12px 50px}
 .credits-card .credits-roll h2{font-size:clamp(32px,6vh,64px)!important;margin:20px 0!important;line-height:1.2!important}
 .credits-card .credits-roll h3{font-size:clamp(24px,4vh,36px)!important;margin:24px 0 14px!important}
 .credits-card .credits-roll p{display:block!important;font-size:clamp(18px,2.8vh,26px)!important;line-height:1.8!important;margin:16px 0!important}
 .credits-card .credit-group{padding:32px 0;border-bottom:1px solid #ffffff20}
 .credits-card .credit-label{color:#b8b4ca}
 .credits-card .credits-avatar{display:block;width:clamp(104px,20vh,192px);height:clamp(104px,20vh,192px);object-fit:contain;image-rendering:pixelated;margin:12px auto}
 .credits-card .credits-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;flex:none}
 .credits-card .credits-actions button,.credits-card .credits-actions a{font:600 16px/1.4 system-ui!important;padding:12px 20px!important;min-height:46px;border:1px solid #777;border-radius:6px;background:#252333;color:#fff;text-decoration:none;cursor:pointer}
 .credits-card .credits-actions a{background:#ef2046;border-color:#ef2046}
 .credits-card .credits-roll.is-static{animation:none;transform:none}
 .credits-card .credits-window.is-static{overflow:auto;mask-image:none}
 @keyframes workshop-credits-roll{from{transform:translateY(0)}to{transform:translateY(calc(-100% + 240px))}}
 @media(prefers-reduced-motion:reduce){.credits-card .credits-roll{animation:none}.credits-card .credits-window{overflow:auto;mask-image:none}}
 `;document.head.append(style);
}
export function showCredits(session,{backLabel='返回选关',replay=null,title=''}={}){
 installCreditsStyle();
 const pane=document.createElement('section');pane.className='campaign-card credits-card';pane.setAttribute('aria-label','通关制作信息');
 pane.innerHTML='<div class="credits-window"><div class="credits-roll"><h2>恭喜通关！</h2><p>感谢你完成这段冒险</p><section class="credit-group"><img class="credits-avatar" alt="在下_小Q像素头像"><h3>在下_小Q</h3><p>一张地图，一段自己的冒险。</p></section><section class="credit-group"><p class="credit-label">项目策划 · 制作与测试</p><h3>在下_小Q</h3><p class="credit-label">AI 编程协作</p><h3>GPT-6 Astra</h3><p>Pixel Workshop · 地图工坊</p></section><section class="credit-group"><p class="credit-label">第三方复刻参考与素材来源</p><h3>umaim/Mario</h3><p class="credit-label">原作角色、美术与音乐</p><h3>Nintendo</h3><p class="credit-label">中文像素字体</p><h3>寒蝉点阵体 · ChillBitmap</h3><p>Warren2060 / 寒蝉字型</p><p>非官方复刻项目</p></section><section class="credit-group credits-follow"><h2>下一段冒险，再见！</h2><p>欢迎关注在下_小Q<br>发现更多游戏，也来制作自己的地图。</p><p>aha-xiaoq.github.io</p></section></div></div>';
 pane.querySelector('img').src=session?.media?.brandAvatar||'/assets/identity/xiaoq-avatar-p63a.svg';
 if(title){const label=document.createElement('p');label.textContent=title;pane.querySelector('.credits-roll').prepend(label);}
 const actions=document.createElement('div');actions.className='credits-actions';
 const follow=document.createElement('a');follow.textContent='关注小Q · 访问网站';follow.href='https://aha-xiaoq.github.io/';follow.target='_blank';follow.rel='noopener';actions.append(follow);
 const skip=document.createElement('button');skip.textContent='查看完整名单';skip.onclick=()=>{pane.querySelector('.credits-roll').classList.add('is-static');pane.querySelector('.credits-window').classList.add('is-static');skip.hidden=true;};actions.append(skip);
 if(replay){const again=document.createElement('button');again.textContent='再玩一次';again.onclick=()=>{pane.remove();replay();};actions.append(again);}
 const back=document.createElement('button');back.textContent=backLabel;back.onclick=()=>{pane.remove();session?.close();};actions.append(back);pane.append(actions);
 (session?.screen||document.body).append(pane);back.focus();
}
