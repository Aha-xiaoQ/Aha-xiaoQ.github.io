/** Resolve logical events centrally. No Audio objects, global sounds or new assets. */
export function createStageAudioPolicy({hasKey=()=>true,playEffect,stopAll}) {
  let profile=null,paused=false;
  return Object.freeze({enter(next){stopAll();profile=next;paused=false;},pause(){paused=true;stopAll();},resume(){paused=false;},finish(){if(profile)profile={...profile,music:null};},exit(){stopAll();profile=null;paused=false;},music(){const key=profile?.music;return !paused&&key&&hasKey(key)?key:null;},effect(name){const key=profile?.events[name];if(!paused&&key&&hasKey(key))playEffect(key);}});
}
