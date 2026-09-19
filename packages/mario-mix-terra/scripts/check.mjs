import {checkArchitecture,buildModuleDocs} from './architecture.mjs';
import {loadTasks} from './collaboration.mjs';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath}from'node:url';import {spawnSync}from'node:child_process';
import {inspect,ROOT}from'./build.mjs';
checkArchitecture(ROOT);buildModuleDocs(ROOT,{check:true});loadTasks(ROOT);
const report=inspect(ROOT).report;
const folders=['src','scripts','tests'];let count=0;
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,ent.name);if(ent.isSymbolicLink())throw Error('Source links prohibited: '+f);if(ent.isDirectory())walk(f);else if(f.endsWith('.mjs')){const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);count++;}}}
for(const d of folders)walk(path.join(ROOT,d));
console.log(JSON.stringify({syntaxFiles:count,...report},null,2));
