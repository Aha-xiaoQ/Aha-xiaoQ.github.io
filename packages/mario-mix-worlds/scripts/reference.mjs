import {readOptional} from './lib/safe-path.mjs';
export function loadReference(root){
 const first=JSON.parse(readOptional(root,'reference/first-world.json'));
 const maps=[...first.maps];
 for(let w=2;w<=8;w++){
  const ref=JSON.parse(readOptional(root,`reference/worlds/world-${w}.json`));
  if(ref.schemaVersion!==1||ref.source.commit!=='980c275358704a49f868567aeec5bdfb347c4781'||ref.maps.length!==4||ref.maps.some((m,i)=>m.name!==`${w}-${i+1}`))throw Error('Invalid reference world '+w);
  maps.push(...ref.maps);
 }
 if(maps.length!==32||new Set(maps.map(m=>m.name)).size!==32)throw Error('Missing or duplicate reference maps');
 return {...first,source:{...first.source,range:'Worlds 1–8 gameplay layout transcription',method:'Manual transcription of gameplay placement records, area locations and section definitions. Pure background scenery omitted; not a byte-identical source export or original-game certification.'},maps};
}
