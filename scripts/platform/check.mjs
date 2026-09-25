#!/usr/bin/env node
/** Pure source/generated consistency and declared content ownership checks. */
import path from 'node:path';import {fileURLToPath}from'node:url';
import {readOptional}from'../lib/safe-path.mjs';import {validateConfig}from'./model.mjs';
import {build as content}from'./content.mjs';import {build as imports}from'./imports.mjs';
import {loadExperiments}from'./experiments.mjs';import {validateDocumentation}from'../../assets/platform/contracts.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export function check(root=ROOT){
 const get=p=>{const b=readOptional(root,p);if(!b)throw Error('Missing registered source: '+p);return b;};
 const config=validateConfig(JSON.parse(get('config/site-platform.json')));
 const a=content(root,{check:true}),b=imports(root,{check:true}),experiments=loadExperiments(root);
 const catalog=JSON.parse(get('content/development/catalog.json'));
 for(const row of catalog.projects)validateDocumentation(JSON.parse(get(row.file)));
 const pkg=JSON.parse(get('package.json'));
 for(const phase of Object.values(config.pipelines))for(const step of phase){if(step.script&&!pkg.scripts[step.script])throw Error('Missing pipeline script: '+step.script);if(step.file)get(step.file);}
 for(const p of config.protectedArtifacts)get(p);
 return {messages:a.messages,moduleAliases:b.aliases,experiments:experiments.entries.length,projectRecords:catalog.projects.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{if(process.argv.length>2)throw Error('Unsupported option');console.log(check());}catch(e){console.error(e.message);process.exitCode=1;}
