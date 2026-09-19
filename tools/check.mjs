/** Validate collaboration scope only; never claim a full-game regression pass. */
import {readFile} from 'node:fs/promises';
import {localLink} from './local-link.mjs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {isUtf8} from 'node:buffer';
import {ROOT,build} from './build-collab.mjs';
import {readAllowlist} from './package-update.mjs';
const files=await readAllowlist(ROOT);const errors=[];
for(const f of files){
  try{
    const b=await readFile(path.join(ROOT,f));if(!isUtf8(b)||b.includes(0))throw Error('not UTF-8 text');
    if(/\.(m?js)$/.test(f)){const r=spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
    if(f.endsWith('.json'))JSON.parse(b.toString('utf8'));
  }catch(e){errors.push(f+': '+e.message);}
}
try{await build(true);}catch(e){errors.push(e.message);}
const expectedLinks=new Set(['LICENSE','RIGHTS.md','assets/FONT_LICENSES.md','assets/fonts/LXGWWenKai-Regular.woff2','games/mario-mix/play.html','games/mario-mix/index.html','games/mario-mix-2/play.html','games/mario-mix-2/index.html','games/mario-mix-3/play.html','games/mario-mix-3/index.html','games/index.html','notes/index.html','index.html']);
let checkedLinks=0,preservedLinks=0;
for(const f of files.filter(f=>f.endsWith('.md')||f.startsWith('dev/')&&f.endsWith('.html'))){
  const text=await readFile(path.join(ROOT,f),'utf8');
  const links=f.endsWith('.html')?[...text.matchAll(/(?:href|src)="([^"\s]+)"/g)].map(m=>m[1]):[...text.matchAll(/\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)].map(m=>m[1]);
  for(const raw of links){
    let result;
    try{result=await localLink(ROOT,f,raw);}catch(e){errors.push(f+': '+e.message+' '+raw);continue;}
    if(!result)continue;
    const p=result.path,exists=result.exists;
    if(!exists&&expectedLinks.has(p)){preservedLinks++;continue;}
    if(!exists)errors.push(f+': missing local link '+raw+' -> '+p);else checkedLinks++;
  }
}
const workflow=await readFile(path.join(ROOT,'.github/workflows/collab-checks.yml'),'utf8');
const executable=workflow.split('\n').filter(line=>!line.trim().startsWith('#')).join('\n');
if(/pull_request_target|secrets\.|self-hosted/.test(executable))errors.push('Unsafe collaboration workflow trigger or credentials.');
for(const m of executable.matchAll(/uses:\s*(\S+)/g))if(!/@[a-f0-9]{40}$/.test(m[1]))errors.push('Action not pinned to full SHA: '+m[1]);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Collaboration checks passed: ${files.length} allowlisted text files, syntax/JSON/generated-state consistency, ${checkedLinks} local links.\n${preservedLinks} links point to preserved original files outside this delta. This is not a complete-game test.`);
