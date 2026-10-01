/** Content composition v0.1. Plain data only: no filesystem, DOM or game globals.
 * A base map is never edited by a character overlay. Unsupported mechanics fail.
 * A valid manifest is not proof of natural playability or IP authorization.
 */
export function createStageCatalog(input) {
  const copy = x => JSON.parse(JSON.stringify(x));
  const freeze = x => { if(x && typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);} return x; };
  const error = (p,m) => {throw new Error(`${p}: ${m}`);};
  const object = (x,p,keys) => {
    if(!x || typeof x!=='object' || Array.isArray(x)) error(p,'expected object');
    for(const k of Object.keys(x)) if(!keys.includes(k)) error(p,`unknown field ${k}`);
  };
  const id = (x,p) => {if(typeof x!=='string'||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x)||x.length>72) error(p,'invalid ID');};
  const str = (x,p,max=300) => {if(typeof x!=='string'||!x.trim()||x.length>max)error(p,'invalid text');};
  const num = (x,p,min,max) => {if(!Number.isFinite(x)||x<min||x>max)error(p,`number must be ${min}..${max}`);};
  const arr=(x,p)=>{if(!Array.isArray(x)||x.length>20000)error(p,'expected bounded array');};
  const rect=(x,p)=>{for(const k of ['x','y'])num(x[k],p+'.'+k,0,100000);for(const k of ['w','h'])num(x[k],p+'.'+k,1,100000);};
  const caps=['jump','double-jump','attack','platform-drop'];
  function capabilities(xs,p){arr(xs,p);if(new Set(xs).size!==xs.length)error(p,'duplicate capability');for(const x of xs)if(!caps.includes(x))error(p,'unsupported capability '+x);}
  object(input,'pack',['schemaVersion','maps','stages','characters','audio']);
  if(input.schemaVersion!==1)error('pack','unsupported schema');
  const data=copy(input),by={};
  for(const key of ['maps','stages','characters','audio']){
    arr(data[key],key);by[key]=new Map();
    for(const e of data[key]){id(e.id,key);if(by[key].has(e.id))error(key,'duplicate ID '+e.id);by[key].set(e.id,e);}
  }
  for(const a of data.audio){object(a,'audio.'+a.id,['id','music','events','note']);str(a.note,'audio.note');object(a.events,'audio.events',['jump','attack','pickup','hurt','death','checkpoint','complete','portal']);for(const v of [a.music,...Object.values(a.events)])if(v!==null&&(typeof v!=='string'||! /^[a-zA-Z0-9_-]+$/.test(v)))error(a.id,'invalid audio key');}
  for(const c of data.characters){
    const p='character.'+c.id;object(c,p,['id','title','driver','capabilities','motion','appearance','audio','note']);str(c.title,p);str(c.note,p);capabilities(c.capabilities,p);
    if(!['platform-v1','legacy-terra-v1'].includes(c.driver))error(p,'unsupported driver');
    if(c.audio!==null&&!by.audio.has(c.audio))error(p,'unknown audio profile');
    if(c.driver==='platform-v1'){
      object(c.motion,p+'.motion',['speed','acceleration','gravity','jumpSpeed','maxFall','width','height','maxHealth']);
      for(const [k,lo,hi]of [['speed',.2,5],['acceleration',.01,1],['gravity',.05,1],['jumpSpeed',1,10],['maxFall',1,10],['width',6,24],['height',8,40],['maxHealth',1,20]])num(c.motion[k],p+'.'+k,lo,hi);
      if(!Number.isInteger(c.motion.maxHealth))error(p,'health must be integer');
      object(c.appearance,p+'.appearance',['body','accent','shape']);
      for(const k of ['body','accent'])if(!/^#[\da-f]{6}$/i.test(c.appearance[k]))error(p,'color must be #RRGGBB');
      if(!['runner','scout'].includes(c.appearance.shape))error(p,'unsupported shape');
    }else if(c.motion!==null||c.appearance!==null)error(p,'legacy driver cannot pretend to support configured motion/art');
  }
  for(const m of data.maps){
    const p='map.'+m.id;object(m,p,['id','title','width','height','tileSize','provenance','geometry','objects']);str(m.title,p);num(m.width,p,256,32768);num(m.height,p,120,4096);if(m.tileSize!==16)error(p,'v0.1 tile size must be 16');
    object(m.provenance,p+'.provenance',['kind','source','review','note']);str(m.provenance.source,p);str(m.provenance.note,p,800);
    if(!['original','transcribed'].includes(m.provenance.kind)||!['pending','verified'].includes(m.provenance.review))error(p,'invalid provenance status');
    arr(m.geometry,p);arr(m.objects,p);const ids=new Set();
    for(const g of m.geometry){object(g,p,['id','x','y','w','h','collision','motion']);id(g.id,p);rect(g,p);if(!['solid','oneway'].includes(g.collision))error(p,'unknown collision type');if(g.motion){object(g.motion,p,['axis','min','max','speed']);if(!['x','y'].includes(g.motion.axis))error(p,'invalid motion axis');num(g.motion.min,p,0,32768);num(g.motion.max,p,g.motion.min+1,32768);num(g.motion.speed,p,.01,2);if(g[g.motion.axis]<g.motion.min||g[g.motion.axis]>g.motion.max)error(p,'mover outside range');const extent=g.motion.axis==='x'?g.w:g.h,limit=g.motion.axis==='x'?m.width:m.height;if(g.motion.max+extent>limit)error(p,'moving range outside map');}}
    for(const o of m.objects){object(o,p,['id','kind','x','y','w','h','targetRoom','targetSpawn']);id(o.id,p);rect(o,p);if(!['spawn','checkpoint','portal','exit','coin','hazard','walker'].includes(o.kind))error(p,'unknown object kind '+o.kind);if(o.kind==='portal'){id(o.targetRoom,p);id(o.targetSpawn,p);}else if(o.kind==='checkpoint'){id(o.targetSpawn,p);if(o.targetRoom!==undefined)error(p,'checkpoint is local');}else if(o.targetRoom!==undefined||o.targetSpawn!==undefined)error(p,'target only belongs to portal/checkpoint');}
    for(const x of [...m.geometry,...m.objects]){if(ids.has(x.id))error(p,'duplicate object/geometry ID');ids.add(x.id);if(x.x+x.w>m.width||x.y+x.h>m.height)error(p,'geometry/object outside map');}
    if(!m.objects.some(o=>o.kind==='spawn'))error(p,'missing spawn');
  }
  for(const s of data.stages){
    const p='stage.'+s.id;object(s,p,['id','title','driver','status','entryRoom','entrySpawn','rooms','characters','requiredCapabilities','overlays','audio','note']);str(s.title,p);str(s.note,p,800);
    if(!['platform-v1','legacy-terra-v1'].includes(s.driver)||!['draft','sample','candidate'].includes(s.status))error(p,'unsupported driver/status');
    object(s.rooms,p+'.rooms',Object.keys(s.rooms||{}));id(s.entryRoom,p);id(s.entrySpawn,p);arr(s.characters,p);capabilities(s.requiredCapabilities,p);object(s.overlays,p+'.overlays',Object.keys(s.overlays||{}));
    if(!s.characters.length||new Set(s.characters).size!==s.characters.length)error(p,'empty/duplicate characters');
    if(!by.audio.has(s.audio))error(p,'unknown audio profile');
    for(const [rid,mid]of Object.entries(s.rooms)){id(rid,p);id(mid,p);if(!by.maps.has(mid))error(p,'unknown map '+mid);}
    if(!s.rooms[s.entryRoom])error(p,'entry room missing');
    const getMap=r=>by.maps.get(s.rooms[r]);
    const spawn=(r,n)=>getMap(r)?.objects.find(o=>o.id===n&&o.kind==='spawn');
    if(!spawn(s.entryRoom,s.entrySpawn))error(p,'entry spawn missing');
    for(const c of s.characters){const ch=by.characters.get(c);if(!ch)error(p,'unknown character '+c);if(ch.driver!==s.driver)error(p,'character driver mismatch '+c);if(s.requiredCapabilities.some(k=>!ch.capabilities.includes(k)))error(p,'character capability mismatch '+c);}
    for(const m of Object.values(s.rooms).map(id=>by.maps.get(id)))for(const o of m.objects)if(o.kind==='portal'&&!spawn(o.targetRoom,o.targetSpawn))error(p,'portal destination invalid '+o.id);else if(o.kind==='checkpoint'&&!m.objects.some(q=>q.kind==='spawn'&&q.id===o.targetSpawn))error(p,'checkpoint spawn missing');
    // All configured rooms must be reachable through a portal graph.
    const seen=new Set();function visit(r){if(seen.has(r))return;seen.add(r);for(const o of getMap(r).objects)if(o.kind==='portal')visit(o.targetRoom);}visit(s.entryRoom);
    if(seen.size!==Object.keys(s.rooms).length)error(p,'unreachable room');
    for(const [c,overlay]of Object.entries(s.overlays)){
      if(!s.characters.includes(c))error(p,'overlay character not allowed');object(overlay,p,['rooms']);
      object(overlay.rooms,p,Object.keys(overlay.rooms||{}));
      for(const [r,extra]of Object.entries(overlay.rooms)){
        if(!s.rooms[r])error(p,'overlay room missing');object(extra,p,['geometry']);arr(extra.geometry,p);
        const baseIds=new Set([...getMap(r).geometry,...getMap(r).objects].map(x=>x.id));
        for(const g of extra.geometry){object(g,p,['id','x','y','w','h','collision']);id(g.id,p);rect(g,p);if(baseIds.has(g.id))error(p,'overlay may only add unique geometry');baseIds.add(g.id);if(!['solid','oneway'].includes(g.collision)||g.x+g.w>getMap(r).width||g.y+g.h>getMap(r).height)error(p,'invalid overlay geometry');}
      }
    }
  }
  // The legacy bridge enters a fixed uploaded scene; it cannot consume map edits.
  // Reject misleading registrations instead of silently launching the wrong level.
  for (const s of data.stages.filter(s=>s.driver==='legacy-terra-v1')) {
    if(s.id!=='terra-1-3'||s.entryRoom!=='main'||s.entrySpawn!=='start'||
       JSON.stringify(s.rooms)!==JSON.stringify({main:'base-1-3'})||
       JSON.stringify(s.characters)!==JSON.stringify(['legacy-terra'])||
       Object.keys(s.overlays).length||s.requiredCapabilities.length||s.audio!=='legacy-default')
      error(s.id,'sealed legacy driver cannot accept a custom stage/map/overlay');
  }
  for (const c of data.characters.filter(c=>c.driver==='legacy-terra-v1'))
    if(c.id!=='legacy-terra'||c.capabilities.length||c.audio!==null)
      error(c.id,'sealed legacy driver cannot accept a custom actor/audio');
  freeze(data);
  function plan(stageId,characterId,{allowDraft=false}={}){
    const stage=by.stages.get(stageId),character=by.characters.get(characterId);
    if(!stage||!character)error('plan','unknown stage or character');
    if(stage.status==='draft'&&!allowDraft)error('plan','draft requires explicit developer opt-in');
    if(!stage.characters.includes(characterId))error('plan','unsupported stage/character pair');
    const rooms={};for(const [roomId,mapId]of Object.entries(stage.rooms)){
      const base=by.maps.get(mapId),overlay=stage.overlays[characterId]?.rooms?.[roomId];
      rooms[roomId]={...copy(base),baseGeometry:copy(base.geometry),geometry:[...copy(base.geometry),...copy(overlay?.geometry||[])]};
    }
    return freeze({stage:copy(stage),character:copy(character),rooms,audio:copy(by.audio.get(character.audio||stage.audio))});
  }
  return Object.freeze({list:()=>copy(data.stages),characters:()=>copy(data.characters),plan,source:()=>copy(data)});
}
