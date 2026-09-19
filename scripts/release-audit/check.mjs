#!/usr/bin/env node
/** Local artifact gate, not a natural-playthrough, external-source or production audit. */
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {readOptional} from '../lib/safe-path.mjs';import {check as contentCheck} from '../public-content/check.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function checkRelease(root=ROOT,{reader=p=>readOptional(root,p)}={}){
 const content=contentCheck(root),read=p=>{const b=reader(p);if(!b)throw Error('Missing release artifact: '+p);return b;};
 const project=JSON.parse(read('content/development/projects/mario-mix.json')),release=project.currentRelease;
 const current=project.docs.filter(d=>!d.archived);if(current.length!==3)throw Error('Expected three current guide entries');
 const pages=['notes/index.html','notes/mario-mix/index.html','notes/mario-mix/tasks/index.html',...current.map(d=>`notes/mario-mix/docs/${d.id}/index.html`)];
 for(const p of pages){const html=read(p).toString();for(const tag of ['h1','main'])if((html.match(new RegExp('<'+tag+'(?:\\s|>)','g'))||[]).length!==1)throw Error('Expected one '+tag+': '+p);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw Error('Duplicate DOM id: '+p);
  if(!html.includes('data-nav-key="notes"'))throw Error('Missing Dev navigation: '+p);
 }
 const source=read(`notes/mario-mix/docs/${release.documentId}/index.html`).toString();
 if(!source.includes(release.sourceHref)||!source.includes(' download')||!source.includes('data-copy-code'))throw Error('Source page lacks actual download or copy action');
 const guides=read('notes/mario-mix/docs/index.html').toString();if(!guides.includes('data-history-docs')||/<details[^>]*data-history-docs[^>]*\bopen/.test(guides))throw Error('History must remain collapsed');
 if(project.updates.find(u=>u.id===release.updateId)?.status!=='local-review')throw Error('Local candidate is not marked for review');
 const review=JSON.parse(read('packages/mario-mix-terra/docs/RELEASE_REVIEW.json'));
 return {result:'pass',version:release.version,checkedPages:pages.length,currentGuides:current.length,content,manualReview:'not-evaluated',approvalSupplied:Boolean(review.candidateSha256),deployed:false,scope:'Generated local pages, public data and archive identity only. Windows, devices, natural playthrough, network and deployment require separate evidence.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(JSON.stringify(checkRelease(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
