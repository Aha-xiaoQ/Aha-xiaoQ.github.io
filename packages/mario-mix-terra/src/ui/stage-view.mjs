/** A legible geometric developer preview. No claimed official artwork/animation. */
export function drawStageView(ctx,view,{width=256,height=240}={}) {
  const s=view.scene;if(!s)return;const c=s.cam;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#101724';ctx.fillRect(0,0,width,height);
  ctx.strokeStyle='#203040';ctx.lineWidth=1;for(let x=-c%32;x<width;x+=32){ctx.beginPath();ctx.moveTo(x,32);ctx.lineTo(x,height);ctx.stroke();}
  for(const q of s.geometry){ctx.fillStyle=q.collision==='oneway'?'#537b75':'#515663';ctx.fillRect(Math.round(q.x-c),q.y,q.w,q.h);ctx.fillStyle='#bfcbb5';ctx.fillRect(Math.round(q.x-c),q.y,q.w,2);}
  for(const o of s.objects){const x=Math.round(o.x-c);if(o.kind==='coin'){ctx.fillStyle='#f2c43e';ctx.fillRect(x,o.y,o.w,o.h);}if(o.kind==='hazard'){ctx.fillStyle='#ed263d';ctx.fillRect(x,o.y,o.w,o.h);}if(['portal','exit','checkpoint'].includes(o.kind)){ctx.strokeStyle=o.kind==='exit'?'#f2c43e':o.kind==='checkpoint'?'#f7f5ed':'#59b1ce';ctx.lineWidth=2;ctx.strokeRect(x+1,o.y+1,o.w-2,o.h-2);ctx.font='7px monospace';ctx.fillStyle=ctx.strokeStyle;ctx.fillText(o.kind==='portal'?'IN':o.kind==='exit'?'END':'CP',x,o.y-4);}}
  for(const e of s.enemies){ctx.fillStyle='#ba6673';ctx.fillRect(e.x-c,e.y,e.w,e.h);ctx.fillStyle='#101724';ctx.fillRect(e.x-c+3,e.y+4,3,3);ctx.fillRect(e.x-c+e.w-6,e.y+4,3,3);}
  const p=s.p,a=s.character.appearance;ctx.globalAlpha=s.invulnerable&&Math.floor(s.tick/5)%2?.5:1;ctx.fillStyle=a.body;ctx.fillRect(Math.round(p.x-c),Math.round(p.y),p.w,p.h);ctx.fillStyle=a.accent;ctx.fillRect(Math.round(p.x-c)-2,Math.round(p.y)+4,p.w+4,4);ctx.fillStyle='#101724';ctx.fillRect(p.x-c+(p.facing>0?p.w-5:2),p.y+2,3,2);if(a.shape==='scout'){ctx.fillStyle=a.accent;ctx.fillRect(p.x-c-3,p.y+10,3,10);}if(s.attackAge){ctx.globalAlpha=.65;ctx.fillStyle=a.accent;ctx.fillRect(p.x-c+(p.facing>0?p.w:-26),p.y+5,26,5);}ctx.globalAlpha=1;
  ctx.fillStyle='#111116';ctx.fillRect(0,0,width,28);ctx.font='9px sans-serif';ctx.fillStyle='#f7f5ed';ctx.fillText('SDK LAB · '+s.roomId,8,11);ctx.fillText('HP '+s.health+'  LIFE '+s.lives+'  COIN '+s.coins,8,23);
  if(view.status==='paused'||view.status==='complete'){ctx.fillStyle='#111116de';ctx.fillRect(20,86,width-40,64);ctx.fillStyle='#f7f5ed';ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText(view.status==='paused'?'PAUSED':'TEST COMPLETE',width/2,112);ctx.font='9px sans-serif';ctx.fillText('P: pause/resume  R: restart  C: menu',width/2,134);}
  ctx.restore();
}
