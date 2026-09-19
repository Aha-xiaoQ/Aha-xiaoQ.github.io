import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import os from'node:os';import path from'node:path';import{fileURLToPath}from'node:url';import http from'node:http';
import{auditFiles,resolveRef,htmlReferences,cssReferences,jsReferences,jsonRefs,scriptRegistry}from'../../scripts/publication/audit.mjs';
import{crc32,inspectZip}from'../../scripts/publication/archives.mjs';
import{exactRead,sha,json,parseDataJS,privatePath}from'../../scripts/publication/paths.mjs';
import{publicProject,publicState,publicSiteData,publicCatalog}from'../../assets/release/public-content.mjs';
import{publicRuntime}from'../../scripts/publication/runtime.mjs';
import{planPublication,commitPublication,OUTPUT}from'../../scripts/publication/build.mjs';
import{REQUIRED,reviewTemplate,evaluateGate}from'../../scripts/publication/gate.mjs';
import{handler}from'../../scripts/publication/serve.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),origin='https://aha-xiaoq.github.io';
const page='<html lang="zh-CN"><head><title>作品</title></head><body><main id="main"><h1>作品</h1><p>体验游戏与查看源码。</p></main></body></html>';
const files=(obj={})=>new Map(Object.entries({'index.html':page,...obj}).map(([p,b])=>[p,Buffer.isBuffer(b)?b:Buffer.from(b)]));
const audit=(obj={})=>auditFiles(files(obj),{origin});
const temp=t=>{const p=fs.mkdtempSync(path.join(os.tmpdir(),'r24-test-'));t.after(()=>fs.rmSync(p,{recursive:true,force:true}));return p;};
const write=(r,p,s)=>{fs.mkdirSync(path.dirname(path.join(r,p)),{recursive:true});fs.writeFileSync(path.join(r,p),s);};
function zip(name='source.txt',text='hello'){
 const n=Buffer.from(name),d=Buffer.from(text),local=Buffer.alloc(30),central=Buffer.alloc(46),end=Buffer.alloc(22),crc=crc32(d);
 local.writeUInt32LE(0x04034b50);local.writeUInt32LE(crc,14);local.writeUInt32LE(d.length,18);local.writeUInt32LE(d.length,22);local.writeUInt16LE(n.length,26);
 central.writeUInt32LE(0x02014b50);central.writeUInt32LE(crc,16);central.writeUInt32LE(d.length,20);central.writeUInt32LE(d.length,24);central.writeUInt16LE(n.length,28);
 end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length+n.length,12);end.writeUInt32LE(local.length+n.length+d.length,16);
 return Buffer.concat([local,n,d,central,n,end]);
}
test('release checker accepts a complete, minimal synthetic page',()=>assert.equal(audit().errors.length,0));
test('resolves a relative page, query and anchor',()=>assert.deepEqual(resolveRef('notes/a/index.html','../b/?q=ok#main',origin).path,'notes/b/index.html'));
test('allows encoded slash in a GitHub Issue query',()=>assert.ok(resolveRef('index.html','https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/issues/new?body=src%2Ffile',origin).external));
for(const u of ['javascript:alert(1)','/assets/%2e%2e/a','/assets/%2Fsecret','/a\\b','https://example.invalid/','http://127.0.0.1:4193/'])test('rejects unsafe/placeholder link '+u,()=>assert.ok(resolveRef('index.html',u,origin).error));
test('ignores data URI',()=>assert.equal(resolveRef('index.html','data:image/png;base64,eA==',origin),null));
test('recognizes srcset and poster dependencies',()=>assert.equal(htmlReferences('<video poster="a.jpg"><source srcset="a.webp 1x, b.webp 2x"></video>').length,3));
test('recognizes CSS imports and background resources',()=>assert.equal(cssReferences('@import "a.css";a{background:url(../b.webp)}').length,2));
test('recognizes static/dynamic module imports',()=>assert.equal(jsReferences('import x from "./a.mjs"; import("./b.mjs"); new URL("./c.json",import.meta.url)').length,3));
test('recognizes camelCase registry URLs',()=>assert.equal(jsonRefs({detailUrl:'games/a/',localUrl:'games/a/play.html',cover:'assets/a.png'}).length,3));
test('does not execute data scripts',()=>assert.throws(()=>parseDataJS('globalThis.SITE_DATA=JSON.parse(fetch("x"));')));
test('recognizes pure asset registry',()=>assert.equal(scriptRegistry('globalThis.SITE_ASSETS={"logo":{"src":"assets/logo.svg"}};').length,1));
test('missing resource blocks artifact',()=>assert.ok(audit({'index.html':page.replace('</main>','<img src="missing.png" alt="封面"></main>')}).errors.some(x=>x.problem==='missing-resource')));
test('missing anchor blocks artifact',()=>assert.ok(audit({'index.html':page.replace('</main>','<a href="#unknown">详情</a></main>')}).errors.some(x=>x.problem==='missing-anchor')));
test('duplicate IDs block artifact',()=>assert.ok(audit({'index.html':page.replace('</main>','<p id="main">重复</p></main>')}).errors.some(x=>x.problem==='duplicate-id')));
test('image needs alternative text',()=>assert.ok(audit({'index.html':page.replace('</main>','<img src="data:image/png;base64,x"></main>')}).errors.some(x=>x.problem==='image-missing-alt')));
test('empty public link is rejected',()=>assert.ok(audit({'index.html':page.replace('</main>','<a href="#main"></a></main>')}).errors.some(x=>x.problem==='unnamed-link')));
test('internal handoff tone is rejected',()=>assert.ok(audit({'index.html':page.replace('体验游戏','按你的要求完成本轮')}).errors.some(x=>x.problem==='internal-public-copy')));
test('intentional command examples do not count as public copy',()=>assert.equal(audit({'index.html':page.replace('</main>','<pre><code># 本轮测试命令</code></pre></main>')}).errors.length,0));
for(const p of ['tests/smoke.html','notes/mario-mix/manage/index.html','scripts/x.mjs','collab/source.json','assets/site-dev-route.js','docs/HANDOFF_R23.md'])test('excludes engineering path '+p,()=>assert.equal(privatePath(p),true));
test('preserves ordinary project and public asset paths',()=>assert.equal(privatePath('projects/q-mimi/index.html'),false));
test('LFS pointer cannot pass as media',()=>assert.ok(audit({'assets/a.png':'version https://git-lfs.github.com/spec/v1\noid sha256:abc'}).errors.some(x=>x.problem==='git-lfs-pointer')));
test('broken PNG signature is rejected',()=>assert.ok(audit({'assets/a.png':'bad'}).errors.some(x=>x.problem==='invalid-png')));
test('ZIP actual contents and CRC are verified',()=>assert.equal(inspectZip(zip()).entries,1));
test('ZIP corruption is rejected',()=>{const b=zip();b[40]^=1;assert.throws(()=>inspectZip(b));});
test('ZIP traversal path is rejected',()=>assert.throws(()=>inspectZip(zip('../outside'))));
test('ZIP expansion limits are enforced',()=>assert.throws(()=>inspectZip(zip(),{maxMember:1})));
test('release audit also verifies ZIP contents',()=>{const b=zip();b[40]^=1;assert.ok(audit({'downloads/a.zip':b}).errors.some(x=>x.problem==='invalid-zip-contents'));});
test('case mismatch is rejected even on case-insensitive target',t=>{const r=temp(t);write(r,'assets/A.svg','svg');assert.throws(()=>exactRead(r,'assets/a.svg'),/大小写/);});
for(const dangling of [false,true])test('rejects '+(dangling?'dangling':'normal')+' symlink',t=>{const r=temp(t);if(!dangling)write(r,'original','x');fs.symlinkSync(path.join(r,'original'),path.join(r,'link'));assert.throws(()=>exactRead(r,'link'),/链接/);});
test('rejects hardlink source',t=>{const r=temp(t);write(r,'a','x');fs.linkSync(path.join(r,'a'),path.join(r,'b'));assert.throws(()=>exactRead(r,'b'),/硬链接/);});
test('public runtime projection preserves binary bytes',()=>{const b=Buffer.from([255,128,2,4]);assert.equal(publicRuntime('assets/a.png',b),b);});
test('public loader removes unused legacy imports, remains idempotent',()=>{const b=fs.readFileSync(path.join(root,'assets/journal/runtime.mjs')),o=publicRuntime('assets/journal/runtime.mjs',b);assert.ok(!o.includes(Buffer.from('site-development.mjs')));assert.ok(publicRuntime('assets/journal/runtime.mjs',o).equals(o));assert.ok(b.includes(Buffer.from('site-development.mjs')));});
test('public task projection does not modify authors source or fabricate completed status',()=>{const s={tasks:[{id:'hidden',audience:'maintenance',status:'planned',dependsOn:[]},{id:'visible',status:'ready',dependsOn:['hidden'],notes:'internal',origin:{path:'secret'}}]};const old=JSON.stringify(s),out=publicState(s);assert.equal(JSON.stringify(s),old);assert.equal(out.tasks[0].status,'blocked');assert.ok(!('origin'in out.tasks[0]));assert.deepEqual(out.tasks[0].dependsOn,[]);});
test('old 1-4 task now acknowledges W02 without declaring completion',()=>{const s=publicState({tasks:[{id:'M03-MAP14',status:'planned',dependsOn:[]}]});assert.match(s.tasks[0].summary,/W02 已提供/);assert.equal(s.tasks[0].status,'planned');});
test('public homepage derives newest playable item, not source candidate',()=>{const d={profile:{now:{title:'old'}},items:[{id:'a',primaryType:'game',visibility:'public',localUrl:'games/a/play.html',title:'new',updatedAt:'2026-09-13'},{id:'b',primaryType:'project',visibility:'public',title:'candidate',updatedAt:'2026-09-19'}]};assert.equal(publicSiteData(d).profile.now.title,'new');assert.equal(d.profile.now.title,'old');});
test('public catalog has no management alias',()=>{const c=publicCatalog({projects:[{id:'x'}],aliases:[{projectId:'x',view:'manage'},{projectId:'x',view:'docs'}]},new Set(['x']));assert.equal(c.aliases.length,1);});
test('public review starts pending',()=>assert.equal(reviewTemplate({fingerprint:'a',sourceFingerprint:'b'}).status,'pending'));
test('gate rejects unapproved evidence',()=>assert.ok(evaluateGate({errors:[],warnings:[],fingerprint:'a',sourceFingerprint:'b'},reviewTemplate({fingerprint:'a',sourceFingerprint:'b'})).length));
function approval(){return{...reviewTemplate({fingerprint:'a',sourceFingerprint:'b'}),status:'approved',reviewer:'Synthetic test reviewer',reviewedAt:'2026-09-19',checks:Object.fromEntries(REQUIRED.map(k=>[k,{result:'passed',evidence:'Synthetic unit-test evidence only.'}]))};}
test('explicit synthetic approval fixture passes only exact clean hashes',()=>assert.equal(evaluateGate({errors:[],warnings:[],fingerprint:'a',sourceFingerprint:'b'},approval()).length,0));
test('gate rejects stale source fingerprint',()=>assert.ok(evaluateGate({errors:[],warnings:[],fingerprint:'a',sourceFingerprint:'changed'},approval()).length));
test('gate rejects missing resource despite approval',()=>assert.ok(evaluateGate({errors:[{}],warnings:[],fingerprint:'a',sourceFingerprint:'b'},approval()).length));
test('gate requires review of warnings',()=>assert.ok(evaluateGate({errors:[],warnings:[{}],fingerprint:'a',sourceFingerprint:'b'},approval()).length));
function commitPlan(r){const f=files(),report=auditFiles(f,{origin});report.sourceFingerprint='test';return{root:r,files:f,report,observed:new Map(),directories:new Map()};}
test('writes only separate artifact and second identical prepare is unchanged',t=>{const r=temp(t);write(r,'engineering.txt','keep');const p=commitPlan(r);commitPublication(p);const before=fs.statSync(path.join(r,OUTPUT,'index.html')).mtimeMs;assert.equal(commitPublication(p).unchanged,true);assert.equal(fs.statSync(path.join(r,OUTPUT,'index.html')).mtimeMs,before);assert.equal(fs.readFileSync(path.join(r,'engineering.txt'),'utf8'),'keep');});
test('no output on audit errors',t=>{const r=temp(t),p=commitPlan(r);p.report.errors.push({problem:'missing'});assert.throws(()=>commitPublication(p));assert.equal(fs.existsSync(path.join(r,'.local')),false);});
test('late source edits stop commit',t=>{const r=temp(t),p=commitPlan(r);write(r,'source.json','old');p.observed.set('source.json',Buffer.from('old'));write(r,'source.json','new');assert.throws(()=>commitPublication(p),/变化/);assert.equal(fs.existsSync(path.join(r,'.local')),false);});
test('manual artifact edit prevents overwrite',t=>{const r=temp(t),p=commitPlan(r);commitPublication(p);write(r,OUTPUT+'/index.html','edited');assert.throws(()=>commitPublication(p),/手工修改/);});
test('untracked artifact files prevent overwrite',t=>{const r=temp(t),p=commitPlan(r);commitPublication(p);write(r,OUTPUT+'/personal.txt','keep');assert.throws(()=>commitPublication(p),/额外文件/);});
test('local release server serves real HTTP bytes and correct custom 404',async t=>{const r=temp(t);write(r,'index.html',page);write(r,'404.html',page.replace('作品','页面不存在'));const server=http.createServer(handler(r));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>server.close());const base='http://127.0.0.1:'+server.address().port;const ok=await fetch(base+'/');assert.equal(ok.status,200);assert.equal(await ok.text(),page);const head=await fetch(base+'/',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');assert.equal(Number(head.headers.get('content-length')),Buffer.byteLength(page));const missing=await fetch(base+'/scripts/private.mjs');assert.equal(missing.status,404);const post=await fetch(base+'/',{method:'POST'});assert.equal(post.status,405);});
// This uses the actual project's available source and explicitly permits an incomplete
// outer website. It never turns missing media into a passing launch result.
test('real projected project pages separate current source, templates and play',async()=>{const p=await planPublication(root),html=p.files.get('notes/mario-mix/docs/terra-source/index.html').toString();assert.match(html,/0\.4\.3/);assert.ok(!html.includes('j-maintainer'));assert.ok(![...p.files.keys()].some(x=>/\/manage\//.test(x)));assert.equal(p.report.version.stableGamesReplaced,false);assert.equal(JSON.parse(p.files.get('content/development/projects/mario-mix.json')).chapterPlan.levels.length,32);});

test('mixed-content image is rejected',()=>assert.ok(audit({'index.html':page.replace('</main>','<img src="http://cdn.valid-site.net/a.png" alt="封面"></main>')}).errors.some(x=>x.problem==='mixed-content-resource')));
test('JavaScript parser never executes side effects',async()=>{const{checkSyntax}=await import('../../scripts/publication/syntax.mjs');const result=checkSyntax(new Map([['assets/syntax-probe.js',Buffer.from('throw Error("do not execute")')]]));assert.equal(result.errors.length,0);});
test('JavaScript syntax errors are blocking',async()=>{const{checkSyntax}=await import('../../scripts/publication/syntax.mjs');assert.equal(checkSyntax(new Map([['assets/bad.mjs',Buffer.from('export const = 1')]])).errors.length,1);});

test('source archive matches workspace byte identities',async t=>{const{checkSourceArchive}=await import('../../scripts/publication/identity.mjs');const r=temp(t);write(r,'source/source.txt','hello');const result=checkSourceArchive({root:r,get:p=>exactRead(r,p),archive:zip('Project/source.txt'),prefix:'Project/',source:'source'});assert.equal(result.verified,1);assert.deepEqual(result.errors,[]);});
test('changed source cannot reuse old downloadable archive',async t=>{const{checkSourceArchive}=await import('../../scripts/publication/identity.mjs');const r=temp(t);write(r,'source/source.txt','edited');const result=checkSourceArchive({root:r,get:p=>exactRead(r,p),archive:zip('Project/source.txt'),prefix:'Project/',source:'source'});assert.ok(result.errors.some(x=>x.problem==='source-download-does-not-match-workspace'));});
test('unpublished new source files are reported',async t=>{const{checkSourceArchive}=await import('../../scripts/publication/identity.mjs');const r=temp(t);write(r,'source/source.txt','hello');write(r,'source/new.txt','new');const result=checkSourceArchive({root:r,get:p=>exactRead(r,p),archive:zip('Project/source.txt'),prefix:'Project/',source:'source'});assert.ok(result.errors.some(x=>x.problem==='workspace-source-missing-from-download'));});
test('HTML, data scripts and lazy module cache keys match one artifact',async()=>{const p=await planPublication(root);assert.match(p.report.cacheToken,/^release-r24-[a-f0-9]{12}$/);const html=p.files.get('notes/index.html').toString(),runtime=p.files.get('assets/journal/runtime.mjs').toString();assert.ok(html.includes('content/site-data.js?v='+p.report.cacheToken));assert.ok(runtime.includes('./model.mjs?v='+p.report.cacheToken));assert.ok(p.report.sourceFilesVerified>=1000);});

test('version-control placeholders are not publication assets',()=>{for(const p of ['assets/.gitkeep','assets/.DS_Store','assets/example.test.mjs'])assert.ok(privatePath(p));});
test('double-encoded traversal is rejected',()=>assert.ok(resolveRef('index.html','/assets/%252e%252e/file',origin).error));
