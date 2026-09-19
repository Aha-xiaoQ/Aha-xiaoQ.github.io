/** Compares a distributed source archive to the actual workspace, without repacking. */
import fs from'node:fs';import path from'node:path';import{inspectZip}from'./archives.mjs';import{safe,sha}from'./paths.mjs';
export function checkSourceArchive({root,get,archive,prefix,source,skip=[],runtimeHash}){
 const errors=[],info=inspectZip(archive),seen=new Set();let verified=0;
 const omitted=p=>skip.some(s=>p===s||s.endsWith('/')&&p.startsWith(s));
 for(const [name,h]of Object.entries(info.hashes)){
  if(!name.startsWith(prefix)){errors.push({file:source,problem:'source-archive-prefix'});continue;}
  const rel=name.slice(prefix.length);if(!rel||rel.endsWith('/')||omitted(rel))continue;
  const local=source+'/'+rel,b=get(local);seen.add(rel);
  if(!b||sha(b)!==h)errors.push({file:local,problem:'source-download-does-not-match-workspace'});else verified++;
 }
 function scan(rel=''){
  const dir=rel?safe(root,source+'/'+rel):safe(root,source);
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   if(['.git','node_modules','dist','.local','SOURCE_SHA256SUMS.txt'].includes(entry.name))continue;
   const next=rel?rel+'/'+entry.name:entry.name;if(omitted(next)||omitted(next+'/'))continue;
   safe(root,source+'/'+next);if(entry.isDirectory())scan(next);else if(entry.isFile()&&!seen.has(next))errors.push({file:source+'/'+next,problem:'workspace-source-missing-from-download'});
  }
 }
 scan();
 if(runtimeHash){const runtime=prefix+'runtime/mario-mix-terra/';const entries=Object.entries(info.hashes).filter(([p])=>p.startsWith(runtime)&&!p.endsWith('/')).map(([p,h])=>[p.slice(runtime.length),h]).sort(([a],[b])=>a.localeCompare(b,'en'));
  const actual=sha(Buffer.from(entries.map(([p,h])=>p+' '+h).join('\n')));if(actual!==runtimeHash)errors.push({file:source,problem:'bundled-map-runtime-identity-mismatch'});
 }
 return{verified,errors};
}
