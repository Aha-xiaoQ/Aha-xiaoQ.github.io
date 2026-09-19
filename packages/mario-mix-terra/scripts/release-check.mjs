#!/usr/bin/env node
/** Verifies review structure and candidate identity. Does NOT validate human evidence,
 * grant licensing rights, commit, upload, or deploy anything. Not a PR CI requirement.
 */
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {inspect,ROOT} from './build.mjs';import {readOptional} from './lib/safe-path.mjs';
export const REQUIRED=['build','browser-http','real-input','gameplay','audio','resource-rights','maintainer'];
export function validateReview(review,candidateSha,root=ROOT){
 if(review.schemaVersion!==1||!Array.isArray(review.checks))throw Error('Invalid release review');
 if(review.candidateSha256!==candidateSha)throw Error('Review does not match this exact candidate SHA');
 const ids=new Set();for(const c of review.checks){if(ids.has(c.id))throw Error('Duplicate release check');ids.add(c.id);}
 for(const id of REQUIRED){const c=review.checks.find(x=>x.id===id);if(!c||c.status!=='pass'||!c.reviewer?.trim()||!c.evidence)throw Error('Release check pending: '+id);
  if(!c.evidence.startsWith('docs/evidence/')||!readOptional(root,c.evidence))throw Error('Missing review evidence: '+id);
 }
 return {candidateSha256:candidateSha,checks:REQUIRED.length,result:'record-complete',deployment:false,warning:'Reviewer evidence is not independently authenticated by this script.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const review=JSON.parse(readOptional(ROOT,'docs/RELEASE_REVIEW.json'));console.log(JSON.stringify(validateReview(review,inspect(ROOT).report.standaloneSha256),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
