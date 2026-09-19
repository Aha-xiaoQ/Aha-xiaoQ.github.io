import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildCandidate,transformRuntime,sha256,inventory,auditAssets,inside,read} from '../scripts/core.mjs';
import {sandbox,golden,head,tail} from './helpers.mjs';
test('source transform changes only the reviewed control block',()=>{
 const r=transformRuntime(head+golden+tail);assert.equal(r.output.slice(0,r.span.start),head);assert.equal(r.output.slice(r.span.start+r.span.replacementLength),tail);assert.equal(r.outsideHash,sha256(head+tail));
});
test('unknown/duplicate/already migrated block is rejected',()=>{
 assert.throws(()=>transformRuntime(head+tail),/exactly one/);assert.throws(()=>transformRuntime(head+golden+golden+tail),/exactly one/);assert.throws(()=>transformRuntime('const __mmR05=1;'+head+golden+tail),/Already transformed/);
});
test('candidate build is reproducible and does not change original game bytes',t=>{
 const s=sandbox(t),a=buildCandidate(s.root,s.pkg),b=buildCandidate(s.root,s.pkg);assert.equal(a.output,b.output);assert.deepEqual(a.meta,b.meta);assert.equal(read(s.root,'games/mario-mix/classic-mix.js'),s.runtime);assert.equal(read(s.root,'games/mario-mix/play.html'),s.html);
});
test('editing a leaf changes the served candidate (source is genuinely wired in)',t=>{
 const s=sandbox(t),a=buildCandidate(s.root,s.pkg);fs.appendFileSync(path.join(s.pkg,'src/input/bill-aim.mjs'),'\n// change-tracking test\n');const b=buildCandidate(s.root,s.pkg);assert.notEqual(a.meta.sha256,b.meta.sha256);assert.equal(a.meta.outsideHash,b.meta.outsideHash);
});
test('changing reviewed runtime stops build without overwriting a newer game',t=>{
 const s=sandbox(t);fs.appendFileSync(path.join(s.root,'games/mario-mix/classic-mix.js'),'// newer game');assert.throws(()=>buildCandidate(s.root,s.pkg),/baseline mismatch/);assert.ok(read(s.root,'games/mario-mix/classic-mix.js').endsWith('// newer game'));assert.equal(fs.existsSync(path.join(s.pkg,'.local/build/classic-mix.js')),false);
});
test('entry changes are detected independently of runtime',t=>{
 const s=sandbox(t);fs.appendFileSync(path.join(s.root,'games/mario-mix/play.html'),'new UI');assert.throws(()=>buildCandidate(s.root,s.pkg),/HTML differs/);
});
test('CRLF checkout normalization preserves baseline verification',t=>{
 const s=sandbox(t);fs.writeFileSync(path.join(s.root,'games/mario-mix/classic-mix.js'),s.runtime.replaceAll('\n','\r\n'));const result=buildCandidate(s.root,s.pkg);assert.ok(result.output.includes('resolveBillAim'));
});
test('inventory says missing/different, never assumes newest or accepted',t=>{
 const s=sandbox(t),r=inventory(s.root,s.pkg);assert.equal(r.rows[0].status,'matched');assert.equal(r.rows[1].status,'missing');fs.appendFileSync(path.join(s.root,'games/mario-mix/play.html'),'newer');assert.equal(inventory(s.root,s.pkg).rows[0].status,'different');assert.equal(r.localGitHead,'not-inferred');
});
test('asset inventory defaults to pending, no inferred permission',t=>{const s=sandbox(t),a=auditAssets(s.root);assert.equal(a.assets.length,1);assert.equal(a.assets[0].permission,'pending');assert.equal(a.assets[0].evidence,null);});
test('unsafe paths and symlinks are not followed',t=>{
 const s=sandbox(t);for(const name of ['../x','/tmp/x','x/../y','a\\b','a\0b'])assert.throws(()=>inside(s.root,name),/Unsafe/);
 fs.symlinkSync(s.dir,path.join(s.root,'linked'),'dir');assert.throws(()=>inside(s.root,'linked/secret'),/Symlink/);
});
