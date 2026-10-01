// A jumps, B runs/fires; standard API indexes describe positions, not letters.
export function createGamepadInput(read=()=>navigator.getGamepads?.()||[],layout=()=>'auto'){
 let previous={};
 return ()=>{let pads;try{pads=Array.from(read());}catch{pads=[];}
 const pad=pads.find(p=>p?.connected&&p.mapping==='standard')||pads.find(p=>p?.connected);
 if(!pad){previous={};return {x:0,connected:false};}
 const button=n=>!!pad.buttons[n]?.pressed,axis=n=>Math.abs(pad.axes[n]||0)>.25?Math.sign(pad.axes[n]):0;
 const rightA=layout()==='right'||(layout()==='auto'&&/Nintendo|Switch|Joy-Con|Pro Controller/i.test(pad.id||''));
 const state={connected:true,id:pad.id,standard:pad.mapping==='standard',x:button(14)||button(15)?Number(button(15))-Number(button(14)):axis(0),down:button(13)||axis(1)>0,interact:button(12)||button(13)||axis(1)!==0,jump:button(rightA?1:0),run:button(rightA?0:1)||button(2)||button(3),pause:button(9),mute:button(8)};
 state.pausePressed=state.pause&&!previous.pause;state.mutePressed=state.mute&&!previous.mute;previous=state;return state;
 };
}
