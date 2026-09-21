/* R43: user-supplied 48 s climax edit, native looping audio; gameplay unchanged. */
const m41Quick=document.createElement('button');m41Quick.type='button';m41Quick.id='m41QuickStatus';m41Quick.className='secondary';m41Quick.style.cssText='width:100%;margin-top:10px;text-align:left;line-height:1.7;font-size:10px';
$('soundButton').closest('.buttons').after(m41Quick);
m41Quick.onclick=()=>{$('o25Resources').open=true;$('o25Resources').hidden=false;m37Panel.scrollIntoView({block:'center',behavior:'smooth'});};
const m41EnterBase=o28EnterFlood;
o28EnterFlood=function(cp=0,retry=false){
 if(!s33Is())o27Stop(true); // every new attempt starts the chosen recording at 0.
 return m41EnterBase(cp,retry);
};
const m41ChromeBase=c23Chrome;
c23Chrome=function(){const r=m41ChromeBase();if(c23Is()&&!s33Is()){
 const note=o27Panel.querySelector('.o25-note');if(note)note.textContent='常规场景配乐保持原样。洪水上升段使用内置高潮循环，直接起播，不经过前奏或安静段。';
}o27MusicUI();return r;};
const m41SonicChromeBase=s34Chrome;s34Chrome=function(){const r=m41SonicChromeBase();o27MusicUI();return r;};
window.__nativeCampaign=Object.freeze({...window.__nativeCampaign,build:'R43',chapter14:'R40 gameplay retained / embedded 00:30-01:18 Ginso climax loop'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test'))window.__release41={
 ...window.__release40,ready:()=>Promise.all([window.__release40.ready(),m41Ready]),
 music:()=>({role:o27Music.role,source:o27Music.source,status:o27Music.status,paused:o27Audio.paused,time:o27Audio.currentTime,ready:o27Audio.readyState,pending:o27Music.pending,blocked:o27Music.blocked,volume:o27Audio.volume,rate:o27Audio.playbackRate,duration:o27Audio.duration,changes:o27Music.changes,selectedName:m37.name,origin:m37.origin,embedded:!!JSON.parse($('ginso41-audio').textContent||'null'),hasFallback:!!O27_LOCAL.music.flood,probePlaying:!o27Probe.paused}),
 sync:()=>audioSync(),retry:()=>c23Retry(),enterFlood:cp=>o28EnterFlood(cp||0,false),exportHTML:m41ExportHTML,clearMusic:m41Clear,
 importMusic:async(data,name='QA fixture.wav',type='audio/wav')=>m37LoadFile(new File([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],name,{type}),false),
 sceneFixture:v=>{if(v.phase!==undefined)o28.phase=v.phase;if(v.mode!==undefined)mode=v.mode;if(v.ending!==undefined)c23.ending=v.ending;audioSync();},
};

if(window.__release41)window.__release43=window.__release41;
c23Choose(14);

let last=0,accumulator=0;function loop(now){if(!last)last=now;const elapsed=Math.min((now-last)/1000,.1);last=now;if(!manual){accumulator+=elapsed;let n=0;while(accumulator>=1/60&&n<6){fixedUpdate();accumulator-=1/60;n++}draw()}requestAnimationFrame(loop)}requestAnimationFrame(loop);
// Deterministic test hook, enabled only by explicitly adding ?test=1.
if((new URLSearchParams(location.search).has('test')||document.documentElement.dataset.test==='1')){manual=true;window.__test={
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
