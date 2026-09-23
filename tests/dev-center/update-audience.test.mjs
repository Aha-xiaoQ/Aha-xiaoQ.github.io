import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {updateRows,render} from '../../assets/journal/render.mjs';
import {validateProject} from '../../assets/journal/model.mjs';
import {publicProject} from '../../assets/release/public-content.mjs';
import {isPublicUpdate} from '../../assets/journal/update-audience.mjs';
const readProject=()=>JSON.parse(fs.readFileSync(new URL('../../content/development/projects/mario-mix.json',import.meta.url),'utf8'));
const record=(id,extra={})=>({id,date:'2099-01-01',revision:900,title:'Fixture '+id,summary:'Isolated regression fixture',status:'local-review',...extra});
const sample=(updates)=>({id:'sample',title:'Sample',visibility:'public',updates});
const has=(html,name)=>assert.ok(html.includes(name),'Missing '+name);
const absent=(html,name)=>assert.ok(!html.includes(name),'Unexpected '+name);

test('newer content updates remain sortable without changing the current game release',()=>{
 const p=readProject(),release=structuredClone(p.currentRelease);
 p.updates.push({id:'synthetic-content-check',kind:'content',date:'2099-01-01',revision:999,title:'Content update example',summary:'Synthetic fixture only',status:'local-review'});
 validateProject(p);
 assert.match(updateRows([p],{limit:1}),/Content update example/);
 assert.deepEqual(p.currentRelease,release);
});
test('default and explicit complete-record mode agree',()=>{
 const p=sample([record('review'),record('release',{status:'released'})]);
 assert.equal(updateRows([p]),updateRows([p],{audience:'all'}));has(updateRows([p]),'Fixture review');
});
test('unknown audiences fail instead of silently exposing complete records',()=>{
 for(const audience of ['publc','internal',null,true])assert.throws(()=>updateRows([],{audience}),/audience/);
});
test('ordinary local-review work stays out of visitor timelines',()=>absent(updateRows([sample([record('review')])],{audience:'public'}),'Fixture review'));
test('released updates remain public without a game release declaration',()=>has(updateRows([sample([record('release',{status:'released'})])],{audience:'public'}),'Fixture release'));
test('planned updates retain their planned label rather than claiming release',()=>{
 const h=updateRows([sample([record('plan',{status:'planned'})])],{audience:'public'});has(h,'Fixture plan');has(h,'计划');absent(h,'已发布');
});
test('an explicitly public progress record retains its original review status',()=>{
 const u=record('opt-in',{public:true}),p=sample([u]),before=structuredClone(p),h=updateRows([p],{audience:'public'});
 has(h,u.title);has(h,'待验收');assert.deepEqual(p,before);
});
test('current development candidate is visible and remains awaiting review',()=>{
 const p={...sample([record('candidate')]),currentRelease:{updateId:'candidate'}};
 const h=updateRows([p],{audience:'public'});has(h,'Fixture candidate');has(h,'待验收');absent(h,'已发布');
});
test('candidate visibility does not depend on how many projects are passed',()=>{
 const p={...sample([record('candidate')]),currentRelease:{updateId:'candidate'}};
 assert.equal(updateRows([p],{audience:'public'}),updateRows([p,{...sample([]),id:'other'}],{audience:'public'}));
});
for(const audience of ['maintenance','internal'])test('explicit '+audience+' designation wins over release and public flags',()=>{
 const p=sample([record('private',{status:'released',public:true,audience})]);
 absent(updateRows([p],{audience:'public'}),'Fixture private');has(updateRows([p]),'Fixture private');
});
test('explicit public false overrides the current candidate and released status',()=>{
 const p={...sample([record('private',{status:'released',public:false})]),currentRelease:{updateId:'private'}};
 absent(updateRows([p],{audience:'public'}),'Fixture private');
});
test('filtering happens before the one-row limit',()=>{
 const p=sample([record('hidden',{date:'2099-02-01'}),record('visible',{status:'released',date:'2099-01-01'})]);
 const h=updateRows([p],{audience:'public',limit:1});has(h,'Fixture visible');absent(h,'Fixture hidden');
});
test('complete-record ordering uses date before revision',()=>{
 const p=sample([record('earlier',{revision:999}),record('later',{date:'2099-02-01',revision:1})]);
 has(updateRows([p],{limit:1}),'Fixture later');
});
test('same-day revision ordering survives public filtering and input reversal',()=>{
 const a=record('first',{revision:1,status:'released'}),b=record('second',{revision:2,status:'released'}),p=sample([a,b]);
 const h=updateRows([p],{audience:'public'});assert.equal(h,updateRows([sample([b,a])],{audience:'public'}));
 assert.ok(h.indexOf(b.title)<h.indexOf(a.title));
});
test('explicit project filtering remains independent of audience',()=>{
 const a=sample([record('a',{status:'released'})]),b={...sample([record('b',{status:'released'})]),id:'other'};
 const h=updateRows([a,b],{projectId:'other',audience:'public'});has(h,'Fixture b');absent(h,'Fixture a');
});
test('draft projects are absent in both complete and public modes',()=>{
 const p={...sample([record('draft',{status:'released'})]),visibility:'draft'};
 for(const audience of ['all','public'])absent(updateRows([p],{audience}),'Fixture draft');
});
test('empty public results show the actual empty state, not a fake release',()=>{
 const h=updateRows([sample([record('hidden')])],{audience:'public'});has(h,'还没有公开的更新记录');absent(h,'<li>');
});
test('complete and public rendering do not reorder or edit caller data',()=>{
 const p=readProject();p.updates.push(record('future'));const before=structuredClone(p);
 updateRows([p]);updateRows([p],{audience:'public'});assert.deepEqual(p,before);
});
test('public update titles and summaries remain escaped',()=>{
 const h=updateRows([sample([record('escaped',{public:true,title:'<img onerror=x>',summary:'<script>bad()</script>'})])],{audience:'public'});
 absent(h,'<img');absent(h,'<script>');has(h,'&lt;img');has(h,'&lt;script&gt;');
});
for(const route of [{view:'index'},{view:'updates'},{projectId:'mario-mix',view:'overview'},{projectId:'mario-mix',view:'updates'}])test('visitor route explicitly filters internal progress: '+JSON.stringify(route),()=>{
 const p=readProject();p.updates.push(record('internal-latest',{date:'2099-02-01',title:'HiddenInternalProgress'}));
 const h=render(route,{projects:[p],catalog:{intro:'Fixture'},states:{},notes:[]});absent(h,'HiddenInternalProgress');
 has(updateRows([p],{limit:1}),'HiddenInternalProgress');
});
test('public projection and direct visitor timeline select the same update IDs',()=>{
 const p=readProject();p.updates.push(record('visible-plan',{status:'planned'}),record('hidden-progress'),record('public-progress',{public:true}),record('private-release',{status:'released',public:false}));
 const expected=p.updates.filter(u=>isPublicUpdate(u,p)).map(u=>u.id);
 const projected=publicProject(p);assert.deepEqual(projected.updates.map(u=>u.id),expected);
 for(const u of projected.updates)assert.equal(u.status,p.updates.find(x=>x.id===u.id).status);
});
test('source and public projection keep the current release metadata unchanged',()=>{
 const p=readProject(),before=structuredClone(p),next=publicProject(p);
 assert.deepEqual(p,before);assert.deepEqual(next.currentRelease,p.currentRelease);validateProject(next);
});
test('projection policy is stable when applied twice',()=>{
 const p=readProject();p.updates.push(record('planned',{status:'planned'}));
 const first=publicProject(p),second=publicProject(first);assert.deepEqual(second.updates,first.updates);
});
test('audience helper tolerates absent records but never makes them public',()=>{
 for(const value of [null,undefined,false,1,'released',{}])assert.equal(isPublicUpdate(value,{}),false);
});
