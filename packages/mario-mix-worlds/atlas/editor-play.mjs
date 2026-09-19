import {createStageCatalog} from './runtime/stage-catalog.mjs';
import {createPlatformStage} from './runtime/platform-stage.mjs';
import {createPlatformMotor} from './runtime/platform-motor.mjs';
/** Uses the existing platform driver, not a separate approximation of its physics. */
export function play(pack){
 const dialog=document.createElement('dialog'),title=document.createElement('h2'),info=document.createElement('p'),canvas=document.createElement('canvas'),close=document.createElement('button'),restart=document.createElement('button'),bar=document.createElement('div');
 title.textContent='地形试跑';info.textContent='方向键 / A、D 移动，空格跳跃，J 攻击。这里只运行地形与基础对象；参考奖励和复杂机关不执行。';
 canvas.width=900;canvas.height=420;canvas.style.width='100%';canvas.style.height='auto';canvas.tabIndex=0;canvas.setAttribute('aria-label','基础平台运行时试跑');
 close.textContent='返回编辑';restart.textContent='重新开始';bar.className='row';bar.append(restart,close);
 const touch={};for(const [key,label]of [['left','←'],['right','→'],['jump','跳跃'],['attack','攻击']]){const b=document.createElement('button');b.textContent=label;b.style.touchAction='none';b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);touch[key]=true;};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>{touch[key]=false;};bar.append(b);}
 dialog.style.width='1000px';dialog.style.maxWidth='95vw';dialog.append(title,info,canvas,bar);document.body.append(dialog);
 const catalog=createStageCatalog(pack),plan=catalog.plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true});let stage,keys=new Set(),last=0,acc=0,raf,paused=false;
 const reset=()=>{stage?.dispose();stage=createPlatformStage({plan,motor:createPlatformMotor(),emit:()=>{}});keys.clear();for(const k of Object.keys(touch))touch[k]=false;acc=0;};
 reset();restart.onclick=reset;close.onclick=()=>dialog.close();
 const keydown=e=>{if(['ArrowLeft','ArrowRight','ArrowDown','Space','KeyA','KeyD','KeyJ'].includes(e.code)){e.preventDefault();keys.add(e.code);}},keyup=e=>keys.delete(e.code);
 const blur=()=>{keys.clear();for(const k of Object.keys(touch))touch[k]=false;paused=true;stage.pause();},focus=()=>{paused=false;last=performance.now();stage.resume();};
 window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);window.addEventListener('focus',focus);
 function frame(now){
  if(!dialog.open)return;
  acc+=Math.min(100,last?now-last:0);last=now;
  while(acc>=1000/60){if(!paused)stage.step({x:(keys.has('ArrowRight')||keys.has('KeyD')||touch.right?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')||touch.left?1:0),jump:keys.has('Space')||touch.jump,down:keys.has('ArrowDown'),attack:keys.has('KeyJ')||touch.attack});acc-=1000/60;}
  const v=stage.view(),c=canvas.getContext('2d'),scale=2,camX=Math.max(0,Math.min(Math.max(0,v.width-450),v.p.x-160)),camY=Math.max(0,Math.min(Math.max(0,v.height-210),v.p.y-100));
  c.fillStyle='#142c40';c.fillRect(0,0,900,420);c.save();c.scale(scale,scale);c.translate(-camX,-camY);
  for(const g of v.geometry){c.fillStyle=g.collision==='oneway'?'#d4b971':'#ae8657';c.fillRect(g.x,g.y,g.w,g.h);}
  for(const o of [...v.objects,...v.enemies]){if(o.kind==='spawn')continue;c.fillStyle=({coin:'#ffd848',exit:'#68d989',hazard:'#ee4056',walker:'#ae523e'}[o.kind]||'#b68aef');c.fillRect(o.x,o.y,o.w,o.h);}
  c.fillStyle='#f7f3e7';c.fillRect(v.p.x,v.p.y,v.p.w,v.p.h);c.fillStyle='#ef3148';c.fillRect(v.p.x+(v.p.facing>0?v.p.w-4:0),v.p.y+4,4,4);c.restore();c.fillStyle='#fff';c.font='16px sans-serif';c.fillText('生命 '+v.health+' · 次数 '+v.lives+' · 金币 '+v.coins+(v.completed?' · 本次试跑结束':''),16,25);raf=requestAnimationFrame(frame);
 }
 dialog.onclose=()=>{cancelAnimationFrame(raf);stage.dispose();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);dialog.remove();};
 dialog.showModal();canvas.focus();raf=requestAnimationFrame(frame);
}
