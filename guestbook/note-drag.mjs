// Drag preview is local. Commit delegates to the existing cloud move and reload.
export function installNoteDrag({viewport,canStart,findNote,select,view,position,lock,commit,status,tap,preview}){
 let active=null;
 const finish=(save=false)=>{
  if(!active)return;const d=active;active=null;
  const destination={x:d.note.x,y:d.note.y};
  if(!save||!d.moved){d.note.x=d.x;d.note.y=d.y;position(d.note);}
  d.note.el.classList.remove('dragging','position-conflict');viewport.classList.remove('note-dragging');
  if(viewport.hasPointerCapture(d.pointer))viewport.releasePointerCapture(d.pointer);
  lock(false);
  if(save&&d.moved)commit(d.note,destination,{x:d.x,y:d.y});else if(d.moved)status('已取消移动，便签保留原位。');else if(save)tap?.(d.note);
 };
 viewport.addEventListener('pointerdown',e=>{
  if(e.button!==0||active||!canStart())return;
  const el=e.target.closest('.note'),note=el&&findNote(el);
  if(!note?.owned||note.placeholder||note.moveUncertain)return;
  // Long messages retain text scrolling. The paper edge/footer remains draggable.
  const content=e.target.closest('.content');if(content&&content.scrollHeight>content.clientHeight+1)return;
  e.preventDefault();e.stopImmediatePropagation();select(note);
  active={note,pointer:e.pointerId,sx:e.clientX,sy:e.clientY,x:note.x,y:note.y,scale:view().scale,moved:false};
  viewport.classList.add('note-dragging');lock(true);
 },true);
 viewport.addEventListener('pointermove',e=>{
  const d=active;if(!d||d.pointer!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();
  const dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(!d.moved&&Math.hypot(dx,dy)<5)return;
  if(!d.moved)viewport.setPointerCapture(e.pointerId);
  d.moved=true;d.note.el.classList.add('dragging');d.note.x=d.x+dx/d.scale;d.note.y=d.y+dy/d.scale;position(d.note);preview?.(d.note);
 },true);
 window.addEventListener('pointerup',e=>{if(active?.pointer===e.pointerId){finish(true);}},true);
 for(const event of ['pointercancel','lostpointercapture'])viewport.addEventListener(event,e=>{if(active?.pointer===e.pointerId)finish(false);},true);
 window.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(false);}},true);
 window.addEventListener('blur',()=>finish(false));
}
