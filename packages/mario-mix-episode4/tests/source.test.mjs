import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import vm from 'node:vm';
import {compile,build,manifest,ROOT,sha}from'../scripts/build.mjs';import{check}from'../scripts/check.mjs';import{pack,sourceEntries}from'../scripts/pack.mjs';import{createServer}from'../scripts/dev.mjs';
const fixture=()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'e04-test-'));for(const [p,b]of sourceEntries()){const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,b);}return root;};
function mutate(action,verify){const root=fixture();try{action(root);verify(root);}finally{fs.rmSync(root,{recursive:true,force:true});}}
const editManifest=(r,f)=>{const p=path.join(r,'manifest.json'),m=JSON.parse(fs.readFileSync(p));f(m);fs.writeFileSync(p,JSON.stringify(m));};
const original=compile();
test('R43 source rebuild matches the released HTML byte length and SHA256',()=>{assert.equal(original.bytes.length,17558386);assert.equal(original.sha256,'01b43a24e102acae3401e625f37d66b327535c1e9e49403c2b76226f531007e2');});
test('all 26 compile-time fragments and 260 assets are used',()=>{assert.equal(original.manifest.parts.length,26);assert.equal(original.sourceFiles,38);assert.equal(original.assets,260);});
test('the compiled scripts and JSON validate',()=>{const c=check(ROOT,{baseline:true});assert.equal(c.scriptTags,2);assert.equal(c.jsonTags,3);assert.equal(c.baselineMatch,true);});
test('R43 keeps the 48 second named Ginso soundtrack',()=>{const s=original.bytes.toString(),m=JSON.parse(s.match(/<script id="ginso41-audio" type="application\/json">([\s\S]*?)<\/script>/)[1]);assert.equal(m.duration,48);assert.equal(m.title,'Restoring the Light, Facing the Dark');assert.ok(s.includes('R43-climax-loop'));});
test('the original rights notice and both native routes remain',()=>{const s=original.bytes.toString();assert.ok(s.includes('素材来源与权利说明'));assert.ok(s.includes('S34_MAP'));assert.ok(s.includes('O36_FLOOD'));assert.ok(s.includes('M41_SOURCE_HTML'));assert.ok(!s.includes('@@E04:'));});
test('compilation is deterministic and does not mutate the manifest',()=>{const before=fs.readFileSync(path.join(ROOT,'manifest.json'));assert.deepEqual(compile().bytes,original.bytes);assert.deepEqual(fs.readFileSync(path.join(ROOT,'manifest.json')),before);});
test('missing source stops the build',()=>mutate(r=>fs.unlinkSync(path.join(r,original.manifest.parts[0])),r=>assert.throws(()=>compile(r),/缺少/)));
test('corrupted assets stop the build',()=>mutate(r=>fs.appendFileSync(path.join(r,Object.values(original.manifest.assets)[0].path),'bad'),r=>assert.throws(()=>compile(r),/素材校验失败/)));
test('source traversal is rejected',()=>mutate(r=>editManifest(r,m=>m.sources.push('src/../../secret.js')),r=>assert.throws(()=>compile(r))));
test('unregistered includes are rejected',()=>mutate(r=>fs.appendFileSync(path.join(r,original.manifest.parts[0]),'@@E04:file:src/unknown.js@@'),r=>assert.throws(()=>compile(r),/未登记/)));
test('include cycles are rejected',()=>mutate(r=>fs.appendFileSync(path.join(r,original.manifest.parts[0]),'@@E04:file:'+original.manifest.parts[0]+'@@'),r=>assert.throws(()=>compile(r),/循环/)));
test('unknown asset IDs are rejected',()=>mutate(r=>fs.appendFileSync(path.join(r,original.manifest.parts[0]),'@@E04:uri:a99999@@'),r=>assert.throws(()=>compile(r),/未登记/)));
test('dangling source symlinks are rejected',()=>mutate(r=>{const p=path.join(r,original.manifest.parts[0]);fs.unlinkSync(p);fs.symlinkSync(path.join(r,'nonexistent'),p);},r=>assert.throws(()=>compile(r))));
test('source edits build candidates but never impersonate the fixed baseline',()=>mutate(r=>fs.appendFileSync(path.join(r,original.manifest.parts[0]),'\n/* candidate change */\n'),r=>{assert.notEqual(compile(r).sha256,original.sha256);assert.throws(()=>check(r,{baseline:true}),/基线不一致/);}));
test('syntax errors in a fragment are caught after concatenation',()=>mutate(r=>fs.appendFileSync(path.join(r,original.manifest.parts[0]),'\n const = ;\n'),r=>assert.throws(()=>check(r),SyntaxError)));
test('build writes only the local dist output',()=>mutate(()=>{},r=>{const b=build(r);assert.deepEqual(fs.readFileSync(path.join(r,'dist/play.html')),b.bytes);assert.ok(!fs.existsSync(path.join(r,'games')));}));
test('source inventory excludes dist and never bundles font files',()=>{const paths=sourceEntries().map(([p])=>p);assert.ok(paths.includes('START_HERE.md'));assert.ok(paths.includes('tests/source.test.mjs'));assert.ok(!paths.some(p=>/^(?:dist|\.local)\//.test(p)||/\.(?:woff2?|ttf|otf)$/.test(p)));});
test('source package is deterministic with a matching checksum',()=>{const a=pack(),b=pack();assert.deepEqual(a.bytes,b.bytes);assert.equal(sha(a.bytes),a.metadata.sha256);assert.equal(a.bytes.length,a.metadata.bytes);});
test('font files are rejected by the packager',()=>mutate(r=>fs.writeFileSync(path.join(r,'secret.ttf'),'not a font'),r=>assert.throws(()=>pack(r),/源码包/)));
test('preview is loopback-only by caller and serves no arbitrary paths',async()=>{const root=fixture(),server=createServer(root);try{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;const page=await fetch(base+'/play.html');assert.equal(page.status,200);assert.equal(page.headers.get('cache-control'),'no-store');assert.equal(sha(Buffer.from(await page.arrayBuffer())),original.sha256);assert.equal((await fetch(base+'/manifest.json')).status,404);assert.equal((await fetch(base+'/play.html',{method:'POST'})).status,405);}finally{await new Promise(resolve=>server.close(resolve));fs.rmSync(root,{recursive:true,force:true});}});

test('source text survives the repository LF checkout policy without changing archive identity',()=>{for(const[p,b]of sourceEntries()){if(/\.(?:md|mjs|js|json|css|html|cmd)$/.test(p))assert.ok(!b.includes(Buffer.from('\r\n')),'noncanonical CRLF in '+p);}});

test('source text has no extra blank lines at EOF (WIN-FIX2 regression)',()=>{
 for(const[p,b]of sourceEntries()){
  if(/\.(?:md|mjs|js|json|css|html|cmd|txt)$/.test(p))
   assert.ok(!/(?:\r?\n)[ \t]*(?:\r?\n)[ \t]*$/.test(b.toString('utf8')),'extra EOF blank line in '+p);
 }
});

test('fragment boundary newlines live at include sites without changing R43 output',()=>{
 const runtime=fs.readFileSync(path.join(ROOT,'src/runtime/main.template.js'),'utf8');
 const shell=fs.readFileSync(path.join(ROOT,'src/app/shell.template.html'),'utf8');
 assert.ok(runtime.includes('@@E04:file:src/runtime/07-world12-renderer.part.js@@\n\n'));
 assert.ok(shell.includes('@@E04:file:src/styles/00-base.css@@\n'));
 assert.equal(compile().sha256,original.manifest.baseline.sha256);
});
