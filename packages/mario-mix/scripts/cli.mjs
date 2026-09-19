import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {PACKAGE,ROOT,inside,read,loadBaseline,gitBlob,sha256,replacement,buildCandidate,inventory,auditAssets} from './core.mjs';
import {createDevServer} from './server.mjs';
import {buildWorkItems} from './work-items.mjs';
const [command,...args]=process.argv.slice(2);
function checks(){
  buildWorkItems(PACKAGE,{check:true});
  const lock=loadBaseline(PACKAGE);
  const original=read(PACKAGE,'tests/fixtures/bill-controls.original.txt');
  if(gitBlob(original)!==lock.controls.blob)throw new Error('The copied reference fragment does not match its GitHub blob. Do not edit the golden reference to make tests pass.');
  replacement();
  const files=[];
  function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='.local'||e.name==='node_modules')continue;const f=path.join(dir,e.name);if(e.isDirectory())scan(f);else if(/\.(?:mjs|js)$/.test(e.name))files.push(f);}}
  scan(PACKAGE);
  for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr);}
  for(const f of ['README.md','CONTRIBUTING.md','docs/HANDOFF_R05.md','docs/ACCEPTANCE.md','docs/LICENSING.md','docs/WORK_ITEMS.json','docs/RELEASE_REVIEW.json'])read(PACKAGE,f);
  console.log(`Checked ${files.length} JavaScript files, source contract, documentation and golden blob. Full game not executed.`);
}
function localJSON(name,value){const f=inside(PACKAGE,'.local/'+name);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(value,null,2)+'\n');console.log('Written packages/mario-mix/.local/'+name);}
function releaseCheck(){
  const candidate=buildCandidate();
  const r=JSON.parse(read(PACKAGE,'docs/RELEASE_REVIEW.json'));
  const errors=[];
  if(r.candidateSha256!==candidate.meta.sha256)errors.push('Review is not tied to this candidate SHA-256');
  for(const key of ['fullGameRegression','keyboard','gamepad','audio','assetsPermission','maintainerApproval'])if(r.checks?.[key]?.status!=='passed'||!r.checks[key].evidence?.trim()||!r.checks[key].reviewer?.trim())errors.push(key+' needs named review and evidence');
  if(errors.length)throw new Error('NOT READY TO RELEASE:\n'+errors.join('\n'));
  console.log('Recorded manual gates are complete for this exact candidate. This command does not publish and cannot independently verify human evidence.');
}
try{
  if(command==='check'){if(args.length)throw new Error('Unknown check arguments');checks();}
  else if(command==='audit'){
    if(args.length)throw new Error('Unknown audit arguments');
    const result=inventory();localJSON('baseline-report.json',result);localJSON('asset-inventory.pending.json',auditAssets());
    for(const row of result.rows)console.log(row.id.padEnd(12),row.status,row.path);
    if(result.rows.some(x=>!x.verified))process.exitCode=2;
  }else if(command==='build'){
    if(args.length)throw new Error('Unknown build arguments');
    const result=buildCandidate();console.log('Built LOCAL candidate:',result.meta.sha256,'\nOutput: packages/mario-mix/.local/build/\nProduction games/ files unchanged.');
  }else if(command==='dev'){
    const original=args.includes('--original'),portArg=args.indexOf('--port');
    const allowed=args.filter((v,i)=>v!=='--original'&&v!=='--port'&&(portArg<0||i!==portArg+1));
    if(allowed.length)throw new Error('Usage: dev [--original] [--port 4180]');
    const port=portArg>=0?Number(args[portArg+1]):original?4181:4180;
    if(!Number.isInteger(port)||port<1024||port>65535||port===4173)throw new Error('Use a dedicated port 1024–65535, not website port 4173');
    const server=createDevServer({original});
    server.on('error',e=>{console.error('Server error:',e.message);process.exitCode=1;});
    server.listen(port,'127.0.0.1',()=>console.log(`Local ${original?'ORIGINAL':'CANDIDATE'}: http://127.0.0.1:${port}/games/mario-mix/play.html\nManual hooks: append ?test=1. No auto-reload: after source edits restart this command. Ctrl+C stops.`));
    process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());
  }else if(command==='release-check'){if(args.length)throw new Error('Unknown release arguments');releaseCheck();}
  else throw new Error('Commands: check | audit | build | dev [--original] [--port N] | release-check');
}catch(error){console.error(error.message);process.exitCode=1;}
