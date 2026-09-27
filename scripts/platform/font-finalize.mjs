/** Finalize font URLs through the existing page builders, never by editing their
 * generated output behind their ownership records. Usually this is a no-op. */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readOptional} from '../lib/safe-path.mjs';
import {buildFontSupport,collectCorpus,CSS} from './font-support.mjs';
import {hash} from './assets.mjs';
import {resourceElements} from '../lib/html-resources.mjs';
import {executeStep} from './cli.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function fontEntryState(root=ROOT,{pages=null}={}){
 const css=readOptional(root,CSS);if(!css)throw Error('Generated font stylesheet is missing');
 const expected='/'+CSS+'?v='+hash(css),selected=pages||collectCorpus(root).files.filter(p=>p.endsWith('.html'));
 const stale=[];let entries=0;
 for(const file of selected){
  const bytes=readOptional(root,file);if(!bytes)throw Error('Missing font entry: '+file);
  const html=bytes.toString('utf8');if(!html.includes('data-platform-typography'))continue;
  entries++;
  const links=resourceElements(html).filter(e=>e.tag==='link'&&Object.hasOwn(e.attributes,'data-platform-font-support'));
  if(links.length!==1||links[0].attributes.rel!=='stylesheet'||links[0].attributes.href!==expected||Object.hasOwn(links[0].attributes,'disabled')||('media' in links[0].attributes&&!['','all','screen'].includes(links[0].attributes.media.trim().toLowerCase())))stale.push(file);
 }
 return {expected,entries,stale};
}
export async function finalizeFonts(root=ROOT,{build=()=>buildFontSupport(root),inspect=()=>fontEntryState(root),execute=step=>executeStep(root,step)}={}){
 const first=await build();let state=inspect();
 if(!state.entries)throw Error('No actual website font entries were inspected');
 if(!state.stale.length)return {fontChanges:first.changed,rebuilt:false,entries:state.entries,stale:[]};
 for(const script of ['journal:build','site:build']){
  const result=await execute({id:'font-finalize-'+script.split(':')[0],script});
  if(result?.code!==0)throw Error('Font URL finalization failed in '+script);
 }
 const second=await build();state=inspect();
 if(!state.entries||second.changed||state.stale.length)throw Error('Font/page generation did not converge: '+state.stale.join(', '));
 return {fontChanges:first.changed,rebuilt:true,entries:state.entries,stale:[]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==2){console.error('Usage: node scripts/platform/font-finalize.mjs');process.exitCode=2;}
 else finalizeFonts().then(r=>console.log(r)).catch(e=>{console.error(e.message);process.exitCode=1;});
}
