import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {documentDirectory} from '../../assets/journal/public-layout.mjs';
import {assertGuideDirectory} from '../helpers/guide-directory.mjs';
const project = (id = 'sample') => ({id, docs:[
  {id:'start', title:'Start here', summary:'Run the project', action:{href:'/source.zip'}},
  {id:'architecture', title:'Structure', summary:'Read the design'},
  {id:'notes', title:'Project notes', summary:'Context'},
  {id:'reference', title:'Reference', readingDocument:true, parentDoc:'start'},
  {id:'appendix', title:'Appendix', readingDocument:true, parentDoc:'reference'},
  {id:'older', title:'Earlier guide', archived:true, summary:'Historical'},
  {id:'old-reference', title:'Earlier reference', readingDocument:true, versioned:true, parentDoc:'start'}
]});
const reject = (mutate, pattern) => {
  const p=project(); assert.throws(()=>assertGuideDirectory(mutate(documentDirectory(p)),p),pattern);
};
for (const id of ['mario-mix','pixel-workshop','lab']) test('real '+id+' directory retains each guide and destination exactly once',()=>{
  const p=JSON.parse(fs.readFileSync(new URL(`../../content/development/projects/${id}.json`,import.meta.url),'utf8'));
  const summary=assertGuideDirectory(documentDirectory(p),p);
  assert.equal(summary.currentGuides,p.docs.filter(d=>!d.archived&&!d.readingDocument).length);
});
test('reproduces the original 0 !== 5 truncation with a fixed five-guide fixture',()=>{
  const p={id:'five-guides',docs:Array.from({length:5},(_,i)=>({id:'source-'+i,title:'Guide '+i,summary:'Regression fixture'}))};
  const html=documentDirectory(p), fragment=html.match(/data-current-docs>([\s\S]*?)<\/div>/)[1];
  assert.equal(p.docs.filter(d=>!d.archived&&!d.readingDocument).length,5);
  assert.equal((fragment.match(/class="j-destination-link"/g)||[]).length,0);
  assert.equal(assertGuideDirectory(html,p).currentGuides,5);
});
test('handles nested groups, folded related references, standalone references and history',()=>{
  assert.deepEqual(assertGuideDirectory(documentDirectory(project()),project()),{currentGuides:3,totalDocuments:7,historyDocuments:2});
});
test('supports the earlier flat layout without reference documents',()=>{
  const p={id:'flat',docs:[{id:'start',title:'Start',summary:'Start'}]};
  const html='<div class="j-shortcuts" data-current-docs><article class="entry j-destination"><a class="j-destination-link" href="/notes/flat/docs/start/"><h3>Start</h3><span class="j-destination-label">Read guide</span></a></article></div>';
  assert.equal(assertGuideDirectory(html,p).currentGuides,1);
});
test('class matching uses tokens rather than exact attribute ordering',()=>{
  const p=project(), html=documentDirectory(p).replaceAll('class="j-destination-link"','data-other="yes" class="custom j-destination-link"');
  assert.equal(assertGuideDirectory(html,p).currentGuides,3);
});
test('empty directory is allowed only when the project truly has no documents',()=>{
  const p={id:'empty',docs:[]}; assert.equal(assertGuideDirectory(documentDirectory(p),p).currentGuides,0);
});
test('escaped Chinese titles and semantic process arrows remain readable',()=>{
  const p={id:'text',docs:[{id:'start',title:'输入 → 输出 <示例> & "引号"',summary:'中文正文'}]};
  assert.equal(assertGuideDirectory(documentDirectory(p),p).currentGuides,1);
});
test('missing card fails instead of accepting a zero count',()=>reject(s=>s.replace(/<article class="entry j-destination">[\s\S]*?<\/article>/,''),/Every current guide/));
test('missing primary class fails',()=>reject(s=>s.replace('class="j-destination-link"','class="not-a-guide"'),/exactly one primary anchor/));
test('duplicate primary link fails',()=>reject(s=>s.replace('</a>','</a><a class="j-destination-link" href="/notes/sample/docs/start/"><h3>Start here</h3></a>'),/exactly one primary anchor/));
test('wrong destination fails even when the card count is correct',()=>reject(s=>s.replace('href="/notes/sample/docs/start/"','href="/notes/other/docs/start/"'),/unknown or wrong guide/));
test('swapped title and target fail',()=>reject(s=>s.replace('<h3>Start here</h3>','<h3>Structure</h3>'),/title and destination disagree/));
test('missing related reference fails',()=>reject(s=>s.replace(/<li><a[^>]*href="\/notes\/sample\/docs\/reference\/"[^>]*>[\s\S]*?<\/a><\/li>/,''),/Related references/));
test('missing history link fails',()=>reject(s=>s.replace(/<li><a[^>]*href="\/notes\/sample\/docs\/older\/"[^>]*>[\s\S]*?<\/a><\/li>/,''),/every document exactly once/));
test('history cannot be made open by default',()=>reject(s=>s.replace('data-history-docs>','data-history-docs open>'),/collapsed by default/));
test('extra title or duplicate reference link fails',()=>reject(s=>s.replace('</article>','<a href="/notes/sample/docs/start/">Duplicate</a></article>'),/Related references/));
test('nested anchors fail rather than relying on browser repair',()=>reject(s=>s.replace('<h3>Start here</h3>','<h3><a href="/bad/">Start here</a></h3>'),/Nested links/));
test('truncated markup fails',()=>reject(s=>s.slice(0,-6),/Unclosed generated guide/));
test('missing directory marker fails',()=>reject(s=>s.replace('data-current-docs','data-unrelated'),/Exactly one current-guide/));
test('duplicated directory marker fails',()=>reject(s=>s+'<div data-current-docs></div>',/Exactly one current-guide/));
test('decorative action arrows fail without banning arrows inside document titles',()=>reject(s=>s.replace('打开运行说明</span>','打开运行说明 →</span>'),/decorative arrows/));

test('surrounding journal navigation links do not inflate document counts',()=>{
  const p=project(), html='<div class="journal"><nav><a href="/notes/">开发</a></nav>'+documentDirectory(p)+'<p>Footer</p></div>';
  assert.equal(assertGuideDirectory(html,p).totalDocuments,7);
});
test('CRLF, extra whitespace and single-quoted attributes preserve the same contract',()=>{
  const p=project(), html=documentDirectory(p).replaceAll('><','>\r\n<').replace(/"([^"<>]*)"/g,"'$1'");
  assert.equal(assertGuideDirectory(html,p).currentGuides,3);
});
