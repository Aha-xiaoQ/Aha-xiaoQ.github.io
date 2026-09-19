/** One owned scene. Factories are reviewed local code, not a plug-in sandbox.
 * Invalid content/unknown drivers fail before retiring the active scene. Creation
 * failures retire the new resources; no partially-created scene remains active.
 * Driver events cannot forge generation/type, and late/dispose events are inert.
 */
export function createStageSession({catalog,drivers,makeLifetime,onEvent=()=>{}}) {
  let scene=null,scope=null,plan=null,status='idle',generation=0,lastError=null;
  let transitioning=false;
  const requireScene=s=>{for(const key of ['step','view','dispose'])
    if(typeof s?.[key]!=='function')throw Error('Scene driver missing '+key);};
  function emit(type,payload={}){onEvent({...payload,type,generation});}
  function clear(){
    const oldScene=scene,oldScope=scope;
    // Invalidate before invoking dispose: it may synchronously emit stale events.
    scene=null;scope=null;plan=null;status='idle';generation++;
    const errors=[];
    try{if(typeof oldScene?.dispose==='function')oldScene.dispose();}catch(e){errors.push(e);}
    try{oldScope?.dispose();}catch(e){errors.push(e);}
    if(errors.length)throw new AggregateError(errors,'Stage cleanup failed');
  }
  function fail(error){
    lastError=error.message;
    try{clear();}catch(cleanup){throw new AggregateError([error,cleanup],'Scene failure and cleanup');}
    throw error;
  }
  function view(){
    let state=null;
    try{state=scene?JSON.parse(JSON.stringify(scene.view())):null;}
    catch(error){return fail(error);}
    return {status,generation,stageId:plan?.stage.id||null,
      characterId:plan?.character.id||null,lastError,scene:state};
  }
  function start(stage,character,options={}){
    if(transitioning)throw Error('Reentrant scene transition');
    const next=catalog.plan(stage,character,options),driver=drivers[next.stage.driver];
    if(typeof driver!=='function')throw Error('Driver unavailable: '+next.stage.driver);
    transitioning=true;
    try{
      clear();const ticket=generation,queued=[];let preparing=true;
      scope=makeLifetime();
      const send=(type,payload={})=>{
        if(ticket!==generation)return;
        if(!['sound','room','complete'].includes(type))throw Error('Unsupported driver event: '+type);
        if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Driver event payload must be an object');
        if(preparing){queued.push([type,{...payload}]);return;}
        if(type==='complete'){
          if(status!=='running')return;
          status='complete';
        }else if(status!=='running')return;
        emit(type,payload);
      };
      try{
        scene=driver({plan:next,lifetime:scope,emit:send});requireScene(scene);
        plan=next;status='running';lastError=null;preparing=false;
        emit('enter',{stage,character});for(const [type,payload]of queued)send(type,payload);
        return view();
      }catch(error){return fail(error);}
    }finally{transitioning=false;}
  }
  function step(input={}){
    if(status==='running')try{scene.step(input);}catch(error){return fail(error);}
    return view();
  }
  function pause(){
    if(status!=='running')return false;
    status='paused';
    try{scene.pause?.();emit('pause');}catch(error){return fail(error);}
    return true;
  }
  function resume(){
    if(status!=='paused')return false;
    status='running';
    try{scene.resume?.();emit('resume');}catch(error){return fail(error);}
    return true;
  }
  function stop(){
    if(transitioning)throw Error('Reentrant scene transition');
    if(!scene&&!scope)return;
    transitioning=true;
    try{clear();emit('exit');}finally{transitioning=false;}
  }
  function restart(){if(!plan)throw Error('No stage to restart');return start(plan.stage.id,plan.character.id,{allowDraft:true});}
  return Object.freeze({start,step,pause,resume,stop,restart,view,active:()=>scene!==null});
}
