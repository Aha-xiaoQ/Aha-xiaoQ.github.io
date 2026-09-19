// Same recordings used by the existing 1-1. No synthesized replacements.
export const audioFiles={cannon:'bowser_fire.mp3',pause:'pause.mp3',castle:'castle.mp3',underwater:'underwater.mp3',hurry_castle:'hurry_castle.mp3',hurry_underwater:'hurry_underwater.mp3',hurry_overworld:'hurry_overworld.mp3',hurry_underworld:'hurry_underworld.mp3',hurry_star:'hurry_star.mp3',hurry:'hurry.mp3',flag:'flag.mp3',world_clear:'world_clear.mp3',bowser_fall:'bowser_fall.mp3',bowser_fire:'bowser_fire.mp3',jump_super:'jump_super.mp3',gameover:'gameover.mp3',life:'oneup.mp3',fire:'fire.mp3',bump:'bump.mp3',break:'break.mp3',appear:'appear.mp3',powerup:'powerup.mp3',kick:'kick.mp3',star:'star.mp3',overworld:'overworld.mp3',underworld:'underworld.mp3',jump:'jump_small.mp3',pickup:'coin.mp3',death:'death.mp3',hurt:'hurt.mp3',portal:'pipe.mp3',complete:'clear.mp3',stomp:'stomp.wav'};
export function themeFor(setting='',star=false,timeLeft=400){
 const theme=(star||/\bSky\b/i.test(setting))?'star':/Underwater/i.test(setting)?'underwater':/Underworld/i.test(setting)?'underworld':/Castle/i.test(setting)?'castle':'overworld';
 return timeLeft<=100?'hurry_'+theme:theme;
}
export function createSound(media={}){
 let music=null,track='',enabled=true,blocked=false;const effects=new Set(),events=[];const log=key=>{events.push(key);if(events.length>30)events.shift();};
 const url=key=>media[key]||'/games/mario-mix/assets/classic-audio/'+audioFiles[key];
 function stop(){if(music){music.pause();music=null;}track='';for(const a of effects)a.pause();effects.clear();}
 async function background(key){if(!enabled||blocked||track===key)return;music?.pause();const a=new Audio(url(key));music=a;track=key;a.loop=true;a.volume=.35;try{await a.play();log(key);}catch{if(music===a){blocked=true;track='';}}}
 function effect(key){if(!enabled||!audioFiles[key])return;const a=new Audio(url(key));a.volume=.65;effects.add(a);a.onended=()=>effects.delete(a);a.play().then(()=>log(key)).catch(()=>effects.delete(a));}
 return {snapshot(){return {enabled,blocked,track,playing:!!music&&!music.paused,events:[...events]};},background,effect,stop,unlock(){blocked=false;},stopMusic(){music?.pause();music=null;track='';},get blocked(){return blocked;},toggle(){if(blocked){blocked=false;enabled=true;track='';return true;}enabled=!enabled;if(!enabled)stop();return enabled;},get enabled(){return enabled;}};
}
