#!/usr/bin/env node
/** One local entry for the established builders, tests, and publication gates.
 * Never changes Git branches, pushes, deploys, installs packages, or approves a release. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath}from'node:url';import {spawn}from'node:child_process';import {createHash,randomUUID}from'node:crypto';
import {safe,readOptional,writeAtomic}from'../lib/safe-path.mjs';import {validateConfig,runSteps}from'./model.mjs';
import {sourceFingerprint} from './source-identity.mjs';
import {failureSummary,readFailureDetails} from './failure-summary.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function npmPath(env=process.env){
 const choices=[env.XIAOQ_NPM_CLI,env.npm_execpath,path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),path.join(path.dirname(process.execPath),'../lib/node_modules/npm/bin/npm-cli.js')].filter(Boolean);
 const found=choices.find(p=>{try{return fs.statSync(p).isFile();}catch{return false;}});
 if(!found)throw Error('Run through npm, or provide XIAOQ_NPM_CLI pointing to npm-cli.js');return found;
}
export function executeStep(root,step,{logFile,npmCli=npmPath()}={}){
 const args=step.file?[safe(root,step.file),...(step.args||[])]:[npmCli,...(step.script==='test'?['test']:['run',step.script]),...(step.args?.length?['--',...step.args]:[])];
 return new Promise((resolve,reject)=>{
  const started=Date.now(),child=spawn(process.execPath,args,{cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true,shell:false});
  const log=logFile?fs.createWriteStream(logFile,{flags:'wx'}):null;let failed=false;
  log?.on('error',error=>{failed=true;child.kill();reject(error);});
  const write=(chunk,stream)=>{stream.write(chunk);log?.write(chunk);};child.stdout.on('data',c=>write(c,process.stdout));child.stderr.on('data',c=>write(c,process.stderr));
  const timer=setTimeout(()=>{failed=true;child.kill();},15*60*1000);timer.unref?.();
  child.on('error',error=>{clearTimeout(timer);log?.end();reject(error);});
  child.on('close',(code,signal)=>{clearTimeout(timer);const result={code:Number.isInteger(code)?code:1,durationMs:Date.now()-started,...(logFile?{log:logFile}:{}),...(signal?{signal}:{}),...(failed?{error:'Step timed out'}:{})};if(log)log.end(()=>resolve(result));else resolve(result);});
 });
}
export async function runPipeline(root=ROOT,mode='verify',{execute=null,save=true,identity=sourceFingerprint}={}){
 if(!['build','verify','plan'].includes(mode))throw Error('Use build, verify, or plan');
 const config=validateConfig(JSON.parse(readOptional(root,'config/site-platform.json')));
 if(mode==='plan')return {schemaVersion:1,edition:config.edition,pipelines:config.pipelines,remoteOperations:false};
 const before=new Map(config.protectedArtifacts.map(p=>{const bytes=readOptional(root,p);if(!bytes)throw Error('Missing protected artifact: '+p);return[p,sha(bytes)];}));
 const id=new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8),rel='.local/platform/runs/'+id;
 if(save)fs.mkdirSync(safe(root,rel),{recursive:true});
 const report={schemaVersion:1,edition:config.edition,mode,startedAt:new Date().toISOString(),phases:[],protectedArtifactsUnchanged:false,pushed:false,deployed:false,approved:false};
 const record=()=>{if(save){writeAtomic(root,rel+'/report.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));writeAtomic(root,'.local/platform/latest.json',Buffer.from(JSON.stringify({...report,reportPath:rel+'/report.json'},null,2)+'\n'));}};
 let stepNumber=0;
 const runner=async step=>{
  console.log('\n['+step.id+'] '+(step.script?'npm run '+step.script:'node '+step.file));
  return execute?execute(step):executeStep(root,step,{logFile:save?safe(root,rel+'/'+String(++stepNumber).padStart(2,'0')+'-'+step.id+'.log'):null});
 };
 try{
  const built=await runSteps(config.pipelines.build,runner);report.phases.push({phase:'build',...built});record();
  if(built.ok&&mode==='verify'){const inputs=identity(root);report.inputFingerprint=inputs;const verified=await runSteps(config.pipelines.verify,runner);report.phases.push({phase:'verify',...verified});report.sourceFingerprint=identity(root);if(inputs.sha256!==report.sourceFingerprint.sha256)throw Error('Workspace sources changed during verification');record();}
  else if(mode==='verify')report.phases.push({phase:'verify',ok:false,status:'blocked-by-build'});
  for(const[p,h]of before)if(sha(readOptional(root,p)||Buffer.alloc(0))!==h)throw Error('Protected original changed: '+p);
  report.protectedArtifactsUnchanged=true;report.ok=report.phases.every(p=>p.ok);
 }catch(error){report.ok=false;report.error=error.message;}
 report.finishedAt=new Date().toISOString();record();return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3){console.error('Usage: npm run platform:build | platform:verify | platform:plan');process.exitCode=2;}
 else runPipeline(ROOT,process.argv[2]).then(report=>{console.log(JSON.stringify(report,null,2));if(report.ok===false){process.exitCode=1;console.error(failureSummary(report,readFailureDetails(ROOT,report)).join('\n'));}}).catch(error=>{console.error(error.message);process.exitCode=1;});
}
