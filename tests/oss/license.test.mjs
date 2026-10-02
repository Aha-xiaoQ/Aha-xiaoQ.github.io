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
