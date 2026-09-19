/** Generated geometric map preview. No external assets, arbitrary markup or embedded fonts. */
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mapSVG(room){
 const m=room.map,W=m.width,H=m.height;
 const rect=(q,fill,stroke='none')=>`<rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" fill="${fill}" stroke="${stroke}"/>`;
 const grid=Array.from({length:Math.ceil(W/256)},(_,i)=>`<path d="M${i*256} 0v${H}" stroke="#777" stroke-opacity=".22"/><text x="${i*256+4}" y="14" fill="#9a9394" font-size="10">${i*16}</text>`).join('');
 const liquids=room.markers.filter(o=>['water-volume','lava-volume'].includes(o.kind)).map(o=>`<rect x="${o.x}" y="${Math.max(0,o.y-4)}" width="${2*(o.source.width||8)}" height="${Math.max(0,H-o.y+4)}" fill="${o.kind==='lava-volume'?'#9b3f36':'#215c75'}" opacity=".75"/>`).join('');
 const shapes=m.geometry.map(q=>rect(q,q.motion?'#dbad55':q.collision==='oneway'?'#769d94':'#e8e0cb','#393840')).join('');
 const objects=m.objects.map(o=>o.kind==='coin'?`<circle cx="${o.x+5}" cy="${o.y+7}" r="4" fill="#f5cc62"/>`:o.kind==='spawn'?rect(o,'#64ccba'):o.kind==='hazard'?rect(o,'#d95743'):o.kind==='portal'?rect(o,'#a18aff'):o.kind==='exit'?rect(o,'#82c46a'):'').join('');
 const markers=room.markers.filter(o=>!o.kind.startsWith('decorative')&&o.x<=W&&o.y>=20).map(o=>`<g><title>${esc(o.kind)}</title><circle cx="${o.x+6}" cy="${Math.min(H-8,o.y)}" r="5" fill="none" stroke="#ef8290" stroke-width="2"/></g>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title"><title id="title">${esc(m.title)}：基础地形预览，粉色圆点表示待实现机制</title><rect width="${W}" height="${H}" fill="${room.underwater?'#112c39':'#16161c'}"/>${grid}${liquids}${shapes}${objects}${markers}</svg>\n`;
}
