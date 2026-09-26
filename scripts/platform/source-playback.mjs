/** Verify downloadable source archives are independently playable, not just valid ZIPs. */
import {createHash} from 'node:crypto';
import {readOptional,validateRelative} from '../lib/safe-path.mjs';
import {inspectZip} from '../publication/archives.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function checkSourcePlayback(root,{reader=p=>readOptional(root,p),configuration=null}={}){
 const config=configuration||JSON.parse(reader('config/lab-source-playback.json')||'null');
 if(config?.schemaVersion!==1||!Array.isArray(config.archives)||!config.archives.length)throw Error('Missing source-playback contract');
 const checked=[];
 for(const a of config.archives){
  validateRelative(a.path);validateRelative(a.root);validateRelative(a.entry);
  if(!/^experiments\/releases\/[a-z0-9-]+\/[a-z0-9.-]+\.zip$/.test(a.path)||a.root.includes('/')||!a.members?.[a.entry])throw Error('Invalid playable archive contract');
  const b=reader(a.path);if(!b)throw Error('Missing source archive: '+a.path);
  const z=inspectZip(b),seen=new Set();
  for(const name of z.names){const key=name.toLowerCase();if(seen.has(key)||/\.(?:ttf|ttc|otf|woff2?)$/i.test(name))throw Error('Unsafe or case-colliding downloadable source member');seen.add(key);}
  for(const [member,sitePath]of Object.entries(a.members)){
   validateRelative(member);validateRelative(sitePath);const data=reader(sitePath);
   if(!data||z.hashes[a.root+'/'+member]!==hash(data))throw Error('Playback companion absent or different in '+a.path+': '+member);
  }
  for(const member of a.required||[]){validateRelative(member);if(!z.hashes[a.root+'/'+member])throw Error('Required source member absent: '+member);}
  const html=reader(a.members[a.entry]).toString();
  // The exact HTML bytes above are in the ZIP. Ensure every local media/style
  // reference resolves relative to that entry inside the same extracted package.
  for(const m of html.matchAll(/\b(?:src|poster)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)){
   const raw=m[1]??m[2];if(/^data:/.test(raw))continue;
   if(!raw||/^(?:\/|[a-z][a-z0-9+.-]*:)/i.test(raw)||/[?#\\]/.test(raw))throw Error('Source player depends on an external or absolute resource: '+raw);
   validateRelative(raw);const base=a.entry.includes('/')?a.entry.slice(0,a.entry.lastIndexOf('/')+1):'';
   if(!z.hashes[a.root+'/'+base+raw])throw Error('Source player has a broken relative resource: '+raw);
  }
  if(z.hashes[a.root+'/player.template.html']!==z.hashes[a.root+'/'+a.entry])throw Error('Playback entry and rebuild template differ');
  checked.push({archive:a.path,entry:a.root+'/'+a.entry,files:z.entries,companionIdentities:'matched'});
 }
 return checked;
}
