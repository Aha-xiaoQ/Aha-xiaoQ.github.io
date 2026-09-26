/** Verify local lab release files before publication. Does not fetch or execute media. */
import {createHash} from 'node:crypto';
import {readOptional} from '../lib/safe-path.mjs';
import {validateExperimentResources} from '../../assets/platform/contracts.mjs';
export function verifyLabAssets(root,entries,{reader=p=>readOptional(root,p)}={}) {
 let files=0,bytes=0;
 for(const entry of entries){
  validateExperimentResources(entry);
  for(const resource of entry.resources||[]){
   const file=resource.href.slice(1),data=reader(file);
   if(!data || data.length!==resource.bytes || createHash('sha256').update(data).digest('hex')!==resource.sha256)throw Error('Lab release file differs: '+file);
   if(resource.role==='video' && data.subarray(4,8).toString()!=='ftyp')throw Error('Invalid MP4 release: '+file);
   if(resource.role==='source' && data.subarray(0,4).toString('hex')!=='504b0304')throw Error('Invalid source ZIP: '+file);
   if(resource.role==='html' && !/<html\b/i.test(data.toString()))throw Error('Invalid HTML release: '+file);
   files++;bytes+=data.length;
  }
 }
 return {files,bytes};
}

/** Inspect authored visitor copy with the existing publication policy.
 * Original prompts, code and file bytes are not rewritten or treated as editorial
 * prose. The full rendered-publication audit remains a separate required gate.
 */
export function verifyLabPublicCopy(entries,pattern) {
 if(!Array.isArray(entries)||!(pattern instanceof RegExp))throw Error('Invalid lab copy policy');
 // Never mutate a shared RegExp's lastIndex or depend on a stateful flag.
 const policy=new RegExp(pattern.source,pattern.flags.replace(/[gy]/g,''));
 const fields=['title','subtitle','medium','format','spotlight','previewDescription',
  'kicker','controlsSummary','provenance','verification'];
 let records=0,checkedFields=0;
 for(const entry of entries){
  if(!entry||typeof entry.id!=='string')throw Error('Invalid lab copy entry');
  if(entry.visibility==='draft')continue;
  records++;
  const check=(field,value)=>{
   if(value===undefined)return;
   if(typeof value!=='string')throw Error('Invalid lab text: '+entry.id+' / '+field);
   checkedFields++;
   const match=value.match(policy);
   if(match)throw Error('content/experiments/'+entry.id+'.json ['+field+']: internal-public-copy ('+match[0]+')');
  };
  for(const field of fields)check(field,entry[field]);
  for(const [i,item]of(entry.features||[]).entries()){check('features['+i+'].title',item.title);check('features['+i+'].description',item.description);}
  for(const [i,item]of(entry.resources||[]).entries())check('resources['+i+'].label',item.label);
 }
 return {records,checkedFields};
}
