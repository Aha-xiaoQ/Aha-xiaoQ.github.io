/** Structural preview only: solids, one-way surfaces, routes and unimplemented objects. */
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mapSVG(room){
 const colors={Floor:'#7a5140',Brick:'#b8774e',Block:'#d6b564',Stone:'#777983',CastleBlock:'#ad775f',Pipe:'#46756a',PipeHorizontal:'#46756a',Tree:'#4e8677',Platform:'#ddd1ac',Bridge:'#8b6855'};
 const rect=q=>`<rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" fill="${colors[q.type]||'#777983'}" stroke="#151820" stroke-width=".8"/>`;
 const geom=room.geometry.map(rect).join('');
 const objects=room.objects.map(o=>o.kind==='spawn'?`<path d="M${o.x} ${o.y+o.h}v-20l12 5-12 5" fill="#f7f5ed" stroke="#f7f5ed"/>`:o.kind==='coin'?`<circle cx="${o.x+o.w/2}" cy="${o.y+o.h/2}" r="3" fill="#edc565"/>`:o.kind==='hazard'?`<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="#b6444c"/>`:`<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="none" stroke="${o.kind==='portal'?'#77cec1':'#f7f5ed'}" stroke-width="2" stroke-dasharray="4 3"/>`).join('');
 const markers=room.annotations.filter(o=>!['Coin','TreeTrunk','Castle'].includes(o.kind)).map(o=>`<g><title>${esc(o.kind+' · '+o.state)}</title><rect x="${o.x}" y="${o.y}" width="${Math.max(o.w,6)}" height="${Math.max(o.h,6)}" fill="none" stroke="#edba74" stroke-dasharray="2 3" stroke-width="1.5"/></g>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${room.width}" height="240" viewBox="0 0 ${room.width} 240" role="img" aria-labelledby="title desc"><title id="title">${esc(room.title)} · 结构预览</title><desc id="desc">实心区域为碰撞底图，虚线为待接入对象或房间连接。不是完成版游戏画面。</desc><defs><pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#ffffff" stroke-opacity=".06" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="#141920"/><rect width="100%" height="100%" fill="url(#grid)"/>${geom}${objects}${markers}</svg>\n`;
}
export function drawMap(ctx,room,state,{offset=0,width=512,markers=true}={}){
 const colors={Floor:'#7a5140',Brick:'#b8774e',Block:'#d6b564',Stone:'#777983',CastleBlock:'#ad775f',Pipe:'#46756a',PipeHorizontal:'#46756a',Tree:'#4e8677',Platform:'#ddd1ac',Bridge:'#8b6855'};
 ctx.fillStyle=room.theme==='castle'?'#17171e':'#141d24';ctx.fillRect(0,0,width,240);
 ctx.save();ctx.translate(-offset,0);ctx.strokeStyle='#ffffff0c';ctx.lineWidth=1;
 for(let x=Math.floor(offset/16)*16;x<offset+width;x+=16){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,240);ctx.stroke();}
 for(let y=0;y<240;y+=16){ctx.beginPath();ctx.moveTo(offset,y);ctx.lineTo(offset+width,y);ctx.stroke();}
 const types=new Map(room.geometry.map(o=>[o.id,o.type]));
 for(const q of state?.geometry||room.geometry){if(q.x>offset+width||q.x+q.w<offset)continue;ctx.fillStyle=colors[q.type||types.get(q.id)]||'#7b7984';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.strokeStyle='#151820';ctx.strokeRect(q.x+.5,q.y+.5,q.w-1,q.h-1);if((q.type||types.get(q.id))==='Brick'){ctx.strokeStyle='#15182077';for(let x=q.x+16;x<q.x+q.w;x+=16){ctx.beginPath();ctx.moveTo(x,q.y);ctx.lineTo(x,q.y+q.h);ctx.stroke();}}}
 for(const o of state?.objects||room.objects){if(o.kind==='spawn'&&state)continue;ctx.fillStyle={coin:'#e8c66d',hazard:'#af414b',spawn:'#f7f5ed'}[o.kind]||'#77c7ba';if(o.kind==='coin'){ctx.beginPath();ctx.ellipse(o.x+o.w/2,o.y+o.h/2,3,4,0,0,7);ctx.fill();}else if(['portal','exit'].includes(o.kind)){ctx.setLineDash([3,3]);ctx.strokeStyle=o.kind==='portal'?'#77c7ba':'#f7f5ed';ctx.strokeRect(o.x,o.y,o.w,o.h);ctx.setLineDash([]);}else ctx.fillRect(o.x,o.y,o.w,o.h);}
 if(markers)for(const o of room.annotations){if(['Coin','TreeTrunk','Castle'].includes(o.kind)||o.x>offset+width||o.x+o.w<offset)continue;ctx.strokeStyle='#edba74';ctx.setLineDash([2,3]);ctx.strokeRect(o.x,o.y,Math.max(o.w,6),Math.max(o.h,6));ctx.setLineDash([]);if(o.kind==='Firebar'){ctx.beginPath();ctx.arc(o.x+8,o.y+8,(o.parameters.fireballs||6)*8,0,7);ctx.strokeStyle='#edba7466';ctx.stroke();}}
 if(state?.p){const p=state.p;ctx.fillStyle=state.character.appearance.body;ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle=state.character.appearance.accent;ctx.fillRect(p.x,p.y+14,p.w,5);ctx.fillStyle='#17191e';ctx.fillRect(p.x+(p.facing>0?8:2),p.y+5,2,3);}
 ctx.restore();ctx.fillStyle='#f7f5ed';ctx.font='9px sans-serif';ctx.fillText(`x ${Math.floor(offset)} / ${room.width} · ${room.title}`,8,14);
}
