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
 test(file+' omits the standalone video list and has no duplicate second-level headings',()=>{
  const s=read(file);assert.doesNotMatch(s,/XIAOQ:VIDEOS|^## (?:当前视频入口|Current videos)$/m);
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
