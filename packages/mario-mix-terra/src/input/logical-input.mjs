/** Canonical legacy logical input; newer device ownership remains in compat. */
export function createLogicalInput(){
  const deadzone=(n,t=.28)=>Math.abs(n)<=t?0:Math.sign(n)*Math.min(1,(Math.abs(n)-t)/(1-t));
  function read(keys=new Set(),pad=null){
    const k=(...names)=>names.some(n=>keys.has(n));
    const b=i=>!!(pad&&pad.buttons&&pad.buttons[i]&&pad.buttons[i].pressed);
    const ax=i=>pad&&pad.axes?Number(pad.axes[i])||0:0;
    return {
      x:Math.max(-1,Math.min(1,deadzone(ax(0))+(k('ArrowRight','KeyD')||b(15)?1:0)-(k('ArrowLeft','KeyA')||b(14)?1:0))),
      y:Math.max(-1,Math.min(1,deadzone(ax(1))+(k('ArrowDown','KeyS')||b(13)?1:0)-(k('ArrowUp','KeyW')||b(12)?1:0))),
      jump:k('Space','KeyK','KeyZ')||b(0),
      action:k('KeyJ','KeyX','ShiftLeft','ShiftRight')||b(1)||b(2),
      auxiliary:k('KeyL')||b(3),tool:k('KeyE')||b(4),
      pause:k('KeyP','Escape')||b(9),menu:k('KeyC')||b(8)
    };
  }
  function edge(current,previous,key){return !!current[key]&&!previous[key];}
  const api=Object.freeze({read,edge,deadzone});

return api;
}
