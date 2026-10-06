import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertSourceReadme,requiredSourceLinks} from '../helpers/source-readme.mjs';
const root=new URL('../../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const project=JSON.parse(read('content/development/projects/mario-mix.json'));
for(const file of ['README.md','README.en.md']){
 test(file+' retains visible stable source and tool catalogs',()=>{
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

test('versioned source guides and archive remain available through project documentation',()=>{
 const links=requiredSourceLinks(project);assert.equal(links.length,3);
 for(const {href} of links){
  const pathname=new URL(href).pathname;
  assert.ok(fs.existsSync(new URL('.'+pathname+(pathname.endsWith('/')?'index.html':''),root)),href);
 }
});
