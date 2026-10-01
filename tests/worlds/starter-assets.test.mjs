import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {pack} from '../../packages/mario-mix-worlds/scripts/pack.mjs';
const repository=new URL('../../',import.meta.url);
const kit=new URL('packages/mario-mix-worlds/',repository);
test('Starter copies preserve the website originals byte for byte',async()=>{
 const manifest=JSON.parse(await readFile(new URL('reference/STARTER_ASSETS.json',kit)));
 for(const [path,record]of Object.entries(manifest.files)){
  assert.deepEqual(await readFile(new URL(path,kit)),await readFile(new URL(record.source,repository)),path);
 }
});
test('W02 cannot package M07 while declaring the pinned M06 identity',async()=>{
 await assert.rejects(pack(fileURLToPath(kit),{
  gameRoot:fileURLToPath(new URL('packages/mario-mix-terra/',repository)),write:false
 }),/pinned M06/);
});
