#!/usr/bin/env node
/** Artifact consistency, not deployment authorization. Manual checks stay independent. */
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
import{ROOT,build}from'./build.mjs';import{readOptional,writeAtomic}from'./lib/safe-path.mjs';
import{checkArchitecture,buildModuleDocs}from'./architecture.mjs';import{validateReview}from'./release-check.mjs';
export function publicationCheck(root=ROOT){
 const read=p=>{const b=readOptional(root,p);if(!b)throw Error('Missing publication file: '+p);return JSON.parse(b);};
 const release=read('release.json'),pkg=read('package.json'),config=read('build.config.json');
 if(release.schemaVersion!==1||release.id!==config.version||release.version!==pkg.version||release.channel!=='release-candidate')throw Error('Release metadata mismatch');
 if(!/^M[0-9]{2}$/.test(release.edition)||release.sourceArchive!==`MarioMix_Terraria_${release.edition}${release.documentationRevision?'_R'+release.documentationRevision:''}_Source.zip`)throw Error('Source archive identity mismatch');
 for(const doc of ['START_HERE.md','CONTRIBUTING.md',`docs/HANDOFF_${release.edition}.md`,'docs/ARCHITECTURE.md',`docs/TEST_REPORT_${release.edition}.md`,'docs/KNOWN_LIMITS.md','upstream/NOTICE.txt'])if(!readOptional(root,doc))throw Error('Missing publication document: '+doc);
 const result=build(root,{check:true});if(release.baselineSha256!==result.baselineSha256||!result.referenceMatchesUpload)throw Error('Upload reference does not match');
 checkArchitecture(root);buildModuleDocs(root,{check:true});
 if(!readOptional(root,`dist/MarioMix_Terraria_${release.edition}.html`))throw Error('Candidate filename mismatch');
 let manualApproval=false,manualReason='';try{validateReview(read('docs/RELEASE_REVIEW.json'),result.standaloneSha256,root);manualApproval=true;}catch(e){manualReason=e.message;}
 return {release:release.id,version:release.version,channel:release.channel,automatedArtifactCheck:'pass',candidateSha256:result.standaloneSha256,sourceHash:result.sourceHash,manualApproval,manualReason,deploy:false,notice:'本检查不验证人工证据真实性，也不会提交或发布。'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{const r=publicationCheck();writeAtomic(ROOT,'.local/publication-check.json',Buffer.from(JSON.stringify(r,null,2)+'\n'));console.log(JSON.stringify(r,null,2));}catch(e){console.error(e.message);process.exitCode=1;}
