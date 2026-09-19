/** Publication, template geometry and playable adaptation are separate states. */
export function validateCatalog(c){
 if(c?.schemaVersion!==1||c.projectId!=='mario-mix'||!Number.isSafeInteger(c.revision)||c.revision<1||!/^\d{4}-\d{2}-\d{2}$/.test(c.updatedAt)||!Array.isArray(c.levels)||c.levels.length>64)throw Error('Invalid level catalog');
 const ids=new Set();for(const l of c.levels){
  if(!/^[1-8]-[1-4]$/.test(l.id)||ids.has(l.id)||l.id!==`${l.world}-${l.stage}`)throw Error('Duplicate/invalid level');ids.add(l.id);
  if(!['released','active','planned'].includes(l.status)||!Array.isArray(l.characters)||l.characters.some(x=>typeof x!=='string'||!x.trim()||x.length>48)||typeof l.summary!=='string'||l.summary.length>160)throw Error('Invalid public description');
  for(const key of ['playHref','introHref'])if(l[key]!==null&&!(typeof l[key]==='string'&&/^\/games\/[a-z0-9-]+\/(?:play\.html)?$/.test(l[key])))throw Error('Unsafe game link');
  if(l.status==='released'&&!l.playHref)throw Error('Released stage requires a playable link');
  if(l.status!=='released'&&l.playHref)throw Error('Unreleased stage cannot present a playable link');
  if(!l.template||!['reference-draft','planned'].includes(l.template.status)||!['pending','verified'].includes(l.template.originalReview)||!Array.isArray(l.missing)||!l.missing.every(x=>typeof x==='string'&&x.length<120))throw Error('Invalid readiness');
  if(l.template.originalReview==='verified'&&(!l.template.reviewedBy||!l.template.evidence))throw Error('Verified map requires reviewer and evidence');
  if(l.template.status==='planned'&&l.template.path!==null)throw Error('Planned template cannot expose a download');
  if(l.template.status==='reference-draft'&&l.template.path!==`generated/levels/${l.id}/template.json`)throw Error('Invalid template path');
  if(l.issueUrl!==null){try{const u=new URL(l.issueUrl);if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password)throw Error();}catch{throw Error('Invalid issue URL');}}
  if(typeof l.owner!=='string'||l.owner.length>100)throw Error('Invalid owner');
 }return c;
}
export function publicProjection(c){validateCatalog(c);return {schemaVersion:1,revision:c.revision,updatedAt:c.updatedAt,levels:c.levels.map(l=>({id:l.id,title:l.title,characters:[...l.characters],status:l.status,summary:l.summary,playHref:l.playHref,introHref:l.introHref,templateStatus:l.template.status,missing:[...l.missing],owner:l.owner,issueUrl:l.issueUrl}))};}
