import test from 'node:test';
import assert from 'node:assert/strict';
import {auditFiles,htmlReferences,resolveRef} from '../../scripts/publication/audit.mjs';

const origin='https://aha-xiaoq.github.io';
const image=origin+'/projects/q-mimi/spritesheet.webp';
const make=(changes={})=>'codex://pets/install?'+new URLSearchParams({name:'Q咪',description:'Q Mimi',imageUrl:image,spriteVersionNumber:'2',...changes});
const page=body=>`<html lang="zh-CN"><head><title>Pet</title></head><body><main id="main"><h1>Pet</h1>${body}</main></body></html>`;
const audit=(body,asset=true)=>auditFiles(new Map([
 ['index.html',Buffer.from(page(body))],
 ...(asset?[['projects/q-mimi/spritesheet.webp',Buffer.from('RIFF0000WEBP')]]:[]),
]),{origin});

test('reviewed install anchor passes and nested image enters publication closure',()=>{
 const html=`<a href="${make().replaceAll('&','&amp;')}">Install</a>`;
 assert.deepEqual(audit(html).errors,[]);
 const nested=htmlReferences(html).find(r=>r.key==='pet-install-image');
 assert.equal(nested.raw,image);
 assert.equal(resolveRef('index.html',nested.raw,origin).path,'projects/q-mimi/spritesheet.webp');
 assert.ok(audit(html,false).errors.some(e=>e.problem==='missing-resource'&&e.target==='projects/q-mimi/spritesheet.webp'));
});

for(const raw of [
 make({name:''}),make({name:'   '}),make({spriteVersionNumber:'1'}),make({spriteVersionNumber:'3'}),make({spriteVersionNumber:''}),
 make()+'&name=Other',make()+'&imageUrl='+encodeURIComponent(image),make()+'&execute=true',
 make().replace('pets/install','pets/other'),make().replace('codex://','codex-dev://'),
 make().replace('pets/install','user@pets/install'),make().replace('pets/install','pets:443/install'),
 make()+'#fragment',make()+'&description=duplicate',make({name:'bad\nname'}),make({name:'bad'})+'%ZZ',
])test('rejects malformed or expanded install action: '+raw,()=>assert.ok(resolveRef('index.html',raw,origin).error));

for(const url of [
 'http://aha-xiaoq.github.io/projects/q-mimi/spritesheet.webp',
 'https://localhost/pet.webp','https://127.0.0.1/pet.webp','https://[::1]/pet.webp',
 'https://10.0.0.1/pet.webp','https://example.invalid/pet.webp','file:///pet.webp',
 'https://aha-xiaoq.github.io@evil.test/projects/q-mimi/spritesheet.webp',
 'https://aha-xiaoq.github.io.evil.test/projects/q-mimi/spritesheet.webp',
 image+'?redirect=elsewhere',image+'#fragment',image.replace('/q-mimi/','/q-mimi/../q-mimi/'),
])test('rejects unreviewed or unsafe nested image: '+url,()=>assert.ok(resolveRef('index.html',make({imageUrl:url}),origin).error));

for(const tag of ['script','img','iframe','object','link'])test('install URI is not a resource protocol: '+tag,()=>{
 const key=tag==='object'?'data':tag==='link'?'href':'src';
 const html=`<${tag} ${key}=" ${make()}" alt="Pet"></${tag}>`;
 assert.ok(audit(html).errors.some(e=>e.problem==='unsafe-scheme'));
});

test('unrelated executable protocols remain rejected',()=>{
 for(const raw of ['javascript:alert(1)','powershell:run','codex://threads/new'])assert.ok(resolveRef('index.html',raw,origin).error);
});

test('noscript fallback anchors remain available to fallback links',()=>{
 assert.deepEqual(audit('<noscript><p id="fallback">Fallback</p><a href="#fallback">Jump</a></noscript>').errors,[]);
});
test('missing fallback anchor and duplicate active IDs still fail',()=>{
 assert.ok(audit('<noscript><a href="#absent">Jump</a></noscript>').errors.some(e=>e.problem==='missing-anchor'));
 assert.ok(audit('<p id="main">Duplicate</p>').errors.some(e=>e.problem==='duplicate-id'));
});
