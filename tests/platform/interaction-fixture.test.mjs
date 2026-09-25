import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {INTERACTION_SOURCES,interactionFixture} from '../../scripts/platform/browser/interaction-fixture.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
function input(html){const prefix='<script>globalThis.INTERACTION_INPUT=',start=html.indexOf(prefix)+prefix.length,end=html.indexOf(';(function browserHarness',start);assert.ok(end>start);return JSON.parse(html.slice(start,end));}
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'q-interaction-input-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));for(const p of INTERACTION_SOURCES){fs.mkdirSync(path.dirname(dir+'/'+p),{recursive:true});fs.copyFileSync(root+p,dir+'/'+p);}return dir;}
test('interaction fixture embeds exactly the current router and search sources with byte hashes',()=>{
 const data=input(interactionFixture(root));assert.deepEqual(Object.keys(data.sources),INTERACTION_SOURCES);
 for(const p of INTERACTION_SOURCES){assert.equal(data.sources[p],fs.readFileSync(root+p,'utf8'));assert.equal(data.hashes[p],createHash('sha256').update(fs.readFileSync(root+p)).digest('hex'));}
});
test('interaction fixture is deterministic and does not write production sources',()=>{
 const before=INTERACTION_SOURCES.map(p=>fs.readFileSync(root+p));const first=interactionFixture(root);
 assert.equal(first,interactionFixture(root));assert.deepEqual(before,INTERACTION_SOURCES.map(p=>fs.readFileSync(root+p)));
});
test('an empty local workspace cannot masquerade as an interaction run',t=>{
 const dir=fixture(t);fs.unlinkSync(dir+'/'+INTERACTION_SOURCES[0]);assert.throws(()=>interactionFixture(dir),/Missing interaction source/);
});
test('source changes update the fixture fingerprint instead of reusing old test evidence',t=>{
 const dir=fixture(t),before=input(interactionFixture(dir));fs.appendFileSync(dir+'/'+INTERACTION_SOURCES[0],'\n// Reviewed new code\n');
 const after=input(interactionFixture(dir));assert.notEqual(after.hashes[INTERACTION_SOURCES[0]],before.hashes[INTERACTION_SOURCES[0]]);
 assert.equal(after.hashes[INTERACTION_SOURCES[1]],before.hashes[INTERACTION_SOURCES[1]]);
});
test('unexpected module imports require an explicit fixture update, not silent stubbing',t=>{
 const dir=fixture(t);fs.appendFileSync(dir+'/assets/experience/runtime.mjs',"\nimport {extra} from './extra.mjs';\n");
 assert.throws(()=>interactionFixture(dir),/Review interaction fixture module wiring/);
});
test('source text cannot close the fixture script element',t=>{
 const dir=fixture(t);fs.appendFileSync(dir+'/assets/site-router.js','\n// </script><script>throw Error("injected")</script>\n');
 const html=interactionFixture(dir);assert.equal((html.match(/<script>/g)||[]).length,1);assert.equal((html.match(/<\/script>/g)||[]).length,1);
 assert.ok(input(html).sources['assets/site-router.js'].includes('</script><script>'));
});
test('linked source ancestors are refused by the shared path boundary',t=>{
 const dir=fixture(t);fs.renameSync(dir+'/assets',dir+'/stored-assets');fs.symlinkSync(dir+'/stored-assets',dir+'/assets',process.platform==='win32'?'junction':'dir');
 assert.throws(()=>interactionFixture(dir),/符号链接|junction/);
});
test('the fixture owns its icon and states its controlled interaction scope',()=>{
 const html=interactionFixture(root);assert.match(input(html).icon,/^data:image\/vnd\.microsoft\.icon;base64,/);
 assert.match(html,/controlled history, renderers, CSS events and fetch/);
 assert.match(html,/approved:false/);assert.match(html,/scope:/);
});
test('interaction regression remains attached to the required component gate',()=>{
 const script=fs.readFileSync(root+'scripts/platform/browser-components.mjs','utf8');
 assert.match(script,/interactionFixture\(root\)/);assert.match(script,/SITE_INTERACTION_TESTS\.run\(\)/);assert.match(script,/assert\.equal\(result\.ok,true/);
 const config=JSON.parse(fs.readFileSync(root+'config/site-platform.json','utf8'));
 const step=config.pipelines.verify.find(s=>s.id==='browser-components');assert.ok(step);
 assert.ok(config.pipelines.verify.find(s=>s.id==='publication-build').after.includes('browser-components'));
});
