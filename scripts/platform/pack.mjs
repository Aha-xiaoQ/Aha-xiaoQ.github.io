#!/usr/bin/env node
/** Package a tested workspace delta. No commit, push, or permission changes. */
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import {safe,readOptional}from'../lib/safe-path.mjs';import{git,sourceFiles,sourceFingerprint}from'./source-identity.mjs';
import{createIntegrity,verifyIntegrityEntries}from'./package-integrity.mjs';
import{validateConfig}from'./model.mjs';import{permitted}from'./delivery/lib/install.mjs';import{zip}from'./zip.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));const sha=b=>createHash('sha256').update(b).digest('hex');const json=o=>Buffer.from(JSON.stringify(o,null,2)+'\n');
export function generatedPaths(root,config){
 const paths=new Set(['assets/i18n/messages.js','assets/platform/config.js','assets/platform/import-map.json','assets/journal/journal.css']);
 for(const item of config.generated){const b=readOptional(root,item.record);if(!b)continue;paths.add(item.record);const record=JSON.parse(b);for(const p of Object.keys(record.files||{}))paths.add(p);}
 return paths;
}
export function payloadPath(p,generated){return !generated.has(p)&&!p.startsWith('assets/journal/data/');}
export function verifySavedReport(root){
 const r=JSON.parse(readOptional(root,'.local/platform/latest.json'));
 if(r?.ok!==true||r.mode!=='verify'||!r.protectedArtifactsUnchanged||!r.phases?.some(p=>p.phase==='verify'&&p.ok)||!r.sourceFingerprint?.sha256)throw Error('Run npm run platform:verify before packaging');
 if(sourceFingerprint(root).sha256!==r.sourceFingerprint.sha256)throw Error('Workspace changed after verification; run platform:verify again');return r;
}
function templateFiles(root){const out=[];function walk(rel){const f=safe(root,rel),st=fs.lstatSync(f);if(st.isSymbolicLink())throw Error('Linked delivery template');if(st.isDirectory()){for(const name of fs.readdirSync(f).sort())walk(rel+'/'+name);}else if(st.isFile()){let bytes=readOptional(root,rel);if(/\.(?:cmd|ps1)$/i.test(rel))bytes=Buffer.from(bytes.toString('utf8').replace(/\r?\n/g,'\r\n'));out.push([rel.slice('scripts/platform/delivery/'.length),bytes]);}else throw Error('Invalid delivery template');}walk('scripts/platform/delivery');return out;}
export function planPackage(root,{base,message='chore(site): update website content and platform'}={}){
 if(typeof base!=='string'||!/^[a-f0-9]{7,40}$/.test(base))throw Error('Use an explicit base commit SHA');
 const commit=git(root,['rev-parse','--verify',base+'^{commit}']).trim();if(!/^[a-f0-9]{40}$/.test(commit))throw Error('Invalid base commit');
 const config=validateConfig(JSON.parse(readOptional(root,'config/site-platform.json'))),review=verifySavedReport(root);
 const changed=git(root,['diff','--no-renames','--name-only','-z',commit,'--']).split('\0').filter(Boolean);
 const tracked=new Set(git(root,['ls-tree','-r','--name-only','-z',commit]).split('\0').filter(Boolean));
 for(const p of sourceFiles(root))if(!tracked.has(p)&&!changed.includes(p))changed.push(p);
 const generated=generatedPaths(root,config),files=[],payload=[];
 for(const p of changed.sort()){
  if(!payloadPath(p,generated))continue;permitted(p);
  if(config.protectedArtifacts.includes(p))throw Error('Original artifact edits require their dedicated release workflow');
  const before=tracked.has(p)?git(root,['show',commit+':'+p],{binary:true}):null,next=readOptional(root,p);
  if(next&&before?.equals(next)||!before&&!next)continue;
  files.push({path:p,operation:next?'write':'delete',before:before?sha(before):null,sha256:next?sha(next):null});if(next)payload.push(['payload/'+p,next]);
 }
 if(!files.length)throw Error('No authored website changes to package');
 const protectedFiles=config.protectedArtifacts.map(p=>{const current=readOptional(root,p);if(!current)throw Error('Missing original artifact');if(tracked.has(p)){const before=git(root,['show',commit+':'+p],{binary:true});if(!before.equals(current))throw Error('Original artifact changed since base: '+p);}return{path:p,sha256:sha(current)};});
 const manifest={schemaVersion:2,edition:'SITE-PLATFORM-'+config.edition,repository:config.site.repository,branch:config.site.branch,baselineCommit:commit,message,files,migrationPaths:[],protected:protectedFiles,sourceVerification:{sha256:review.sourceFingerprint.sha256,finishedAt:review.finishedAt,remoteDeploymentApproved:false}};
 const entries=[...templateFiles(root),['manifest.json',json(manifest)],...payload,['README.md',Buffer.from('# Website update package\n\nExtract into a new directory. Run START.cmd to verify and push, or CHECK_ONLY.cmd to verify without a commit. Existing GitHub CLI login is reused. The updater uses a separate checkout, refuses file/remote conflicts, preserves original artifacts, and never force-pushes.\n\nThis package applies to '+commit+'. A successful local check is not a remote deployment approval.\n')]];
 const integrity=createIntegrity(entries);entries.push(['integrity.json',json(integrity)]);
 verifyIntegrityEntries(entries);
 return{entries,manifest};
}
export function writePackage(root,options){
 const output=path.resolve(options.output||'');if(!options.output||path.extname(output).toLowerCase()!=='.zip')throw Error('Supply --out <path.zip> outside the repository');
 const repo=fs.realpathSync(root),parent=fs.realpathSync(path.dirname(output)),within=path.relative(repo,parent);if(!within||!within.startsWith('..'+path.sep)&&within!=='..'&&!path.isAbsolute(within))throw Error('Package output must be outside the repository');
 if(fs.existsSync(output))throw Error('Output already exists; use a new filename');
 const planned=planPackage(root,options);
 verifyIntegrityEntries(planned.entries);
 const bytes=zip(planned.entries.map(([p,b])=>['XiaoQ_Site_Update/'+p,b]));
 // Recheck exactly the inputs whose successful verification authorized this package.
 verifySavedReport(root);fs.writeFileSync(output,bytes,{flag:'wx'});return{output,bytes:bytes.length,sha256:sha(bytes),files:planned.manifest.files.length,baseline:planned.manifest.baselineCommit,pushed:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
 const options={},names={'--base':'base','--out':'output','--message':'message'},args=process.argv.slice(2);for(let i=0;i<args.length;i++){const key=names[args[i]];if(!key||options[key]!==undefined||!args[i+1])throw Error('Usage: npm run platform:pack -- --base <commit-sha> --out ../update.zip');options[key]=args[++i];}console.log(writePackage(ROOT,options));
}catch(error){console.error(error.message);process.exitCode=1;}
