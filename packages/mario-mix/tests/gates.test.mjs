import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildCandidate,read} from '../scripts/core.mjs';
import {renderWorkItems,buildWorkItems} from '../scripts/work-items.mjs';
import {sandbox} from './helpers.mjs';
function run(pkg){return spawnSync(process.execPath,['scripts/cli.mjs','release-check'],{cwd:pkg,encoding:'utf8'});}
test('release gate is blocked by default',t=>{const s=sandbox(t),r=run(s.pkg);assert.equal(r.status,1);assert.match(r.stderr,/NOT READY TO RELEASE/);});
test('recorded review can pass only for the exact candidate, without changing production',t=>{
 const s=sandbox(t),c=buildCandidate(s.root,s.pkg),file=path.join(s.pkg,'docs/RELEASE_REVIEW.json'),j=JSON.parse(fs.readFileSync(file));j.candidateSha256=c.meta.sha256;for(const key of Object.keys(j.checks))j.checks[key]={status:'passed',reviewer:'TEST FIXTURE',evidence:'SYNTHETIC TEST RECORD — not real game acceptance'};fs.writeFileSync(file,JSON.stringify(j));const r=run(s.pkg);assert.equal(r.status,0,r.stderr);assert.equal(read(s.root,'games/mario-mix/classic-mix.js'),s.runtime);fs.appendFileSync(path.join(s.pkg,'src/input/bill-aim.mjs'),'\n// newer candidate\n');assert.equal(run(s.pkg).status,1);
});
test('completed engineering tasks require evidence',()=>{const row={id:'MM-DEV-001',title:'T',priority:'P0',paths:'x',acceptance:'y',boundary:'z',status:'done',owner:null,evidence:null};assert.throws(()=>renderWorkItems({schemaVersion:1,tasks:[row]}),/evidence/);});
test('task Markdown derives from one source and stale text is rejected',t=>{const s=sandbox(t);buildWorkItems(s.pkg,{check:true});fs.appendFileSync(path.join(s.pkg,'docs/WORK_ITEMS.md'),'stale');assert.throws(()=>buildWorkItems(s.pkg,{check:true}),/stale/);buildWorkItems(s.pkg);buildWorkItems(s.pkg,{check:true});});
