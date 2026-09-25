import test from 'node:test';
import assert from 'node:assert/strict';
import {search,makeIndex,searchState,stateURL} from '../../assets/experience/model.mjs';
const entry=(id,title,summary='',tags=[])=>({id,title,summary,tags,type:'guide',href:'/notes/'+id+'/'});
const data=(...entries)=>({schemaVersion:1,entries});
const words={'鹈鹕骑行实验':'Pelican bicycle experiment','原始动画':'Original animation','地图工坊':'Map Workshop','鹈鹕资料':'Pelican guide','教程':'Tutorial'};
const translate=value=>words[value]||value;
test('translated title fragments rank before summary-only matches',()=>{
 const d=data(entry('a','Other','This mentions a bicycle'),entry('z','鹈鹕骑行实验','原始动画'));
 assert.deepEqual(search(d,{q:'bicycle',translate}).items.map(x=>x.id),['z','a']);
});
test('translated title prefixes receive the same priority as original title prefixes',()=>{
 const d=data(entry('a','Notes about map workflow'),entry('z','地图工坊'));
 assert.equal(search(d,{q:'map',translate}).items[0].id,'z');
});
test('translated exact title outranks a longer translated title',()=>{
 const d=data(entry('a','Map Workshop notes'),entry('z','地图工坊'));
 assert.equal(search(d,{q:'map workshop',translate}).items[0].id,'z');
});
test('translated tag matches outrank description-only matches',()=>{
 const d=data(entry('a','Other','tutorial'),entry('z','Reference','',['教程']));
 assert.equal(search(d,{q:'tutorial',translate}).items[0].id,'z');
});
test('source title ranking remains effective in Chinese',()=>{
 const d=data(entry('a','其他','鹈鹕'),entry('z','鹈鹕资料'));
 assert.equal(search(d,{q:'鹈鹕',translate}).items[0].id,'z');
});
test('translated and source text participate in the same AND query',()=>{
 const d=data(entry('one','鹈鹕骑行实验','原始动画'),entry('two','Other','animation'));
 assert.deepEqual(search(d,{q:'鹈鹕 animation',translate}).items.map(x=>x.id),['one']);
});
test('terms cannot be split across unrelated results',()=>{
 const d=data(entry('a','Pelican'),entry('b','Bicycle'));
 assert.equal(search(d,{q:'pelican bicycle'}).count,0);
});
for(const type of ['constructor','toString','__proto__','unknown'])test('inherited or unknown type behaves as all: '+type,()=>{
 const d=data(entry('a','One'),{...entry('b','Two'),type:'game'});
 assert.deepEqual(search(d,{type}),search(d));
});
test('a valid type still filters the results',()=>{
 const d=data(entry('a','One'),{...entry('b','Two'),type:'game'});
 assert.deepEqual(search(d,{type:'game'}).items.map(x=>x.id),['b']);
});
test('translation callbacks receive only the intended string, never a tag index',()=>{
 const seen=[];search(data(entry('a','One','Body',['one','two'])),{q:'one',translate(...args){seen.push(args);return args[0];}});
 assert.ok(seen.length>=4);assert.ok(seen.every(args=>args.length===1));
});
test('ranked search preserves frozen original records and returns their identities',()=>{
 const e=entry('z','鹈鹕骑行实验','原始动画',['教程']);Object.freeze(e.tags);Object.freeze(e);
 const d=Object.freeze({schemaVersion:1,entries:Object.freeze([e])});
 assert.equal(search(d,{q:'bicycle',translate}).items[0],e);
});
test('normalization still handles full-width mixed case and whitespace',()=>{
 assert.equal(search(data(entry('x','地图工坊')),{q:'  ＭＡＰ   workshop ',translate}).count,1);
});
test('pagination clamps to the actual result count',()=>{
 const d=data(...Array.from({length:5},(_,i)=>entry('i'+i,'Page '+i)));
 const result=search(d,{page:10000,size:2});assert.equal(result.page,3);assert.equal(result.items.length,1);
});
test('search URL updates preserve language, fragments, and unrelated parameters',()=>{
 const u=stateURL('https://aha-xiaoq.github.io/search/?lang=en&keep=1#top',{q:'Bird',type:'guide',page:2});
 assert.equal(u.searchParams.get('lang'),'en');assert.equal(u.searchParams.get('keep'),'1');assert.equal(u.hash,'#top');
 assert.deepEqual(searchState(u),{q:'Bird',type:'guide',page:2});
});
test('index generation still deduplicates canonical entries and excludes drafts',()=>{
 const result=makeIndex({projects:[{id:'draft',visibility:'draft',title:'Private'}, {id:'public',visibility:'public',title:'Public',summary:'Summary',docs:[]}],site:{items:[{id:'one',title:'Public',summary:'Summary',visibility:'public',primaryType:'project',detailUrl:'/notes/public/index.html'}]}});
 assert.equal(result.entries.length,1);assert.equal(result.entries[0].href,'/notes/public/');
});
