#!/usr/bin/env node
/** Check authored status and the real public projection without changing either. */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readOptional} from '../lib/safe-path.mjs';
import {parseDataJS} from '../publication/paths.mjs';
import {loadExperiments} from './experiments.mjs';
import {publicSiteData} from '../../assets/release/public-content.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function assertSiteStatus(site,experiments,lab){
 const now=site.profile?.now;
 if(!now?.sourceId)return {bound:false}; // Legacy authored game-home fallback.
 const experiment=experiments.find(e=>e.id===now.sourceId&&e.visibility==='public');
 const work=experiment||[...(site.items||[]),...(site.tools||[])].find(e=>e.id===now.sourceId&&e.visibility==='public'&&e.lifecycleStatus!=='archived');
 if(!work)throw Error('Homepage references unavailable work: '+now.sourceId);
 const date=work.updatedAt||work.createdAt;
 if(now.label!=='最近作品'||now.title!==work.title||now.summary!==(work.subtitle||work.summary)||now.updatedAt!==date)throw Error('Homepage status differs from work: '+work.id);
 const publicWorks=[...experiments,...(site.items||[]),...(site.tools||[])].filter(e=>e.visibility==='public'&&e.lifecycleStatus!=='archived');
 if(publicWorks.some(e=>(e.updatedAt||e.createdAt||'')>date))throw Error('A newer public work is missing from the homepage status');
 if(experiment){
  const update=lab.updates.find(u=>u.id===work.id);
  if(!update||update.public===false||['maintenance','internal'].includes(update.audience)||update.date<date||!['released','planned'].includes(update.status))throw Error('Missing or stale public lab update: '+work.id);
  if(lab.updatedAt<date||!lab.links.some(x=>x.href==='/notes/lab/docs/'+work.id+'/'))throw Error('Missing or stale lab date/link: '+work.id);
 }
 const projected=publicSiteData(site,experiments).profile.now;
 if(now.href!==projected.href||now.entryLabel!==projected.entryLabel)throw Error('Homepage focus link differs from selected work');
 if(projected.sourceId!==now.sourceId||projected.title!==now.title||projected.updatedAt!==now.updatedAt)throw Error('Publication projection changed homepage work');
 return {bound:true,id:work.id,date};
}
export function checkSiteStatus(root=ROOT){
 const get=p=>{const b=readOptional(root,p);if(!b)throw Error('Missing status source: '+p);return b;};
 return assertSiteStatus(parseDataJS(get('content/site-data.js').toString()),loadExperiments(root).entries,JSON.parse(get('content/development/projects/lab.json')));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(checkSiteStatus());}catch(e){console.error(e.message);process.exitCode=1;}
