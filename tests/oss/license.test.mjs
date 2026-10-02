// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Aha_xiaoQ and the respective contributors
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {check,validateManifest,MANIFEST,ROOT} from '../../scripts/oss/check.mjs';
const source=JSON.parse(fs.readFileSync(new URL('../../'+MANIFEST,import.meta.url),'utf8'));
const copy=()=>structuredClone(source);
test('exact-file manifest and actual source/notice identities pass local consistency checks',()=>{
 const r=check(ROOT);assert.equal(r.inventoryFiles,2964);assert.ok(r.counts['original-MIT']>100);assert.ok(r.counts.unknown>1000);assert.equal(r.legalClearance,false);assert.equal(r.remotePublication,false);
});
test('inventory uses explicit unique paths, scoped grants and registered evidence',()=>assert.deepEqual(validateManifest(source),[]));
test('unknown entries cannot acquire an MIT label',()=>{
 const m=copy(),r=m.files.find(x=>x.classification==='unknown');r.license='MIT';assert.match(validateManifest(m).join('\n'),/Unknown rights/);
});
test('directory glob or traversal cannot expand licensing scope',()=>{
 for(const p of ['assets/*','../unknown.js','/absolute.js']){const m=copy();m.files[0].path=p;assert.ok(validateManifest(m).length);}
});
test('copied fonts, fixtures, map assets, manufacturer manual and archives stay excluded',()=>{
 for(const p of ['packages/mario-mix-worlds/atlas/chill-font.mjs','packages/mario-mix-worlds/tests/fixtures/classic-mix.js','tools/quina-optics/references/Thorlabs_EDU-SPEBCT1_Manual.pdf','projects/q-mimi/q-mimi.zip']){
  const m=copy(),r=m.files.find(x=>x.path===p);r.classification='original-MIT';r.license='MIT';assert.match(validateManifest(m).join('\n'),/exception lost/);
 }
});
test('unregistered evidence and duplicate paths fail closed',()=>{
 const m=copy();m.files[0].evidence=['invented'];m.files[1].path=m.files[0].path;assert.match(validateManifest(m).join('\n'),/Missing scope\/evidence/);assert.match(validateManifest(m).join('\n'),/Duplicate/);
});
test('native editor, original art and standalone experiment scopes cannot disappear',()=>{
 const m=copy(),r=m.files.find(x=>x.path==='experiments/pelican-bicycle.html');r.classification='unknown';r.license='NOASSERTION';assert.match(validateManifest(m).join('\n'),/Missing audited original/);
});
test('reviewed revisions cannot relabel unknown/upstream files or replace baseline identities',()=>{
 for(const classification of ['unknown','third-party-original-license','existing-project-license']){
  const m=copy(),row=m.files.find(r=>r.classification===classification);
  m.reviewedRevisions=[{path:row.path,baselineGitBlob:row.gitBlob,baselineSha256:row.sha256,gitBlob:'a'.repeat(40),sha256:'b'.repeat(64),reviewDate:'2026-10-02',evidence:'bilingual-maintenance'}];
  assert.match(validateManifest(m).join('\n'),/Invalid original-component revision/);
 }
 const m=copy();assert.ok(m.reviewedRevisions.length);
 m.reviewedRevisions[0].baselineGitBlob='f'.repeat(40);
 assert.match(validateManifest(m).join('\n'),/Invalid original-component revision/);
});
test('reviewed revisions keep unique exact identities and registered review evidence',()=>{
 for(const mutate of [m=>m.reviewedRevisions.push({...m.reviewedRevisions[0]}),m=>m.reviewedRevisions[0].sha256='broken',m=>delete m.evidence['bilingual-maintenance']]){
  const m=copy();mutate(m);assert.ok(validateManifest(m).length);
 }
});
