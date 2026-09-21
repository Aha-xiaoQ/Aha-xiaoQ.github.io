/** Explicit extra source downloads; never copy loose source directories into Pages. */
import {checkSourceArchive} from './identity.mjs';
import {sha} from './paths.mjs';
export function includeSourceArchives({root,get,files,errors,registrations=[]}){
 if(!Array.isArray(registrations))throw Error('Invalid source archive registrations');
 const seen=new Set();let verified=0;
 for(const r of registrations){
  if(!/^packages\/[a-z0-9-]+$/.test(r.source)||!/^downloads\/source\/[A-Za-z0-9_-]+\.zip$/.test(r.archive)||r.metadata!==r.archive.replace(/\.zip$/,'.json')||!/^([A-Za-z0-9_-]+)\/$/.test(r.prefix)||seen.has(r.source)||seen.has(r.archive))throw Error('Invalid or duplicate source archive registration');
  seen.add(r.source);seen.add(r.archive);
  const archive=get(r.archive),metaBytes=get(r.metadata);if(!archive||!metaBytes){errors.push({file:r.archive,problem:'missing-registered-source-download'});continue;}
  const meta=JSON.parse(metaBytes),pkg=JSON.parse(get(r.source+'/package.json'));
  if(sha(archive)!==meta.sha256||archive.length!==meta.bytes||pkg.version!==meta.version){errors.push({file:r.archive,problem:'registered-source-identity-mismatch'});continue;}
  const identity=checkSourceArchive({root,get,archive,prefix:r.prefix,source:r.source});errors.push(...identity.errors);verified+=identity.verified;
  files.set(r.archive,archive);files.set(r.metadata,metaBytes);
 }
 return verified;
}
