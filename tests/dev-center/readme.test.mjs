import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertSourceReadme} from '../helpers/source-readme.mjs';
const root=new URL('../../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const project=JSON.parse(read('content/development/projects/mario-mix.json'));
for(const file of ['README.md','README.en.md']){
 test(file+' retains visible third source, fourth guide and fourth archive links',()=>{
  assertSourceReadme(read(file),project,file);
 });
 test(file+' has exactly one bounded video section and no duplicate second-level headings',()=>{
  const s=read(file),start='<!-- XIAOQ:VIDEOS:START -->',end='<!-- XIAOQ:VIDEOS:END -->';
  assert.equal(s.split(start).length-1,1,file);assert.equal(s.split(end).length-1,1,file);
  assert.ok(s.indexOf(start)<s.indexOf(end),file);
  const headings=[...s.matchAll(/^## (.+)$/gm)].map(m=>m[1]);
  assert.equal(new Set(headings).size,headings.length,file);
 });
}
test('Chinese and English source entry points are identical',()=>{
 assert.deepEqual(assertSourceReadme(read('README.md'),project,'README.md'),assertSourceReadme(read('README.en.md'),project,'README.en.md'));
});
