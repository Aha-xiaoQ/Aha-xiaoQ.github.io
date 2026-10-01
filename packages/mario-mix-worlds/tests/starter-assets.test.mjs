import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {audioFiles} from '../atlas/editor-audio.mjs';
import {createAtlasServer} from '../scripts/atlas-server.mjs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
test('standalone media and classic fixture retain their recorded source identities',async()=>{
 const manifest=JSON.parse(await readFile(new URL('reference/STARTER_ASSETS.json',root)));
 for(const [path,record] of Object.entries(manifest.files)){
  const bytes=await readFile(new URL(path,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256,path);
 }
 for(const file of new Set(Object.values(audioFiles))){
  const url=new URL('atlas/assets/classic-audio/'+file,root);
  assert.ok(url.href.startsWith(new URL('atlas/assets/',root).href));
  assert.ok(manifest.files[decodeURI(url.href.slice(root.href.length))],file);
 }
});
test('standalone server serves the bundled audio and allows its embedded font',async()=>{
 const server=createAtlasServer(fileURLToPath(root));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const origin='http://127.0.0.1:'+server.address().port;
  const page=await fetch(origin+'/atlas/editor.html');
  assert.match(page.headers.get('content-security-policy'),/font-src 'self' data:/);
  for(const [file,type]of [['jump_small.mp3','audio/mpeg'],['stomp.wav','audio/wav'],['../character-audio/contra-jungle-nes.ogg','audio/ogg']]){
   const response=await fetch(origin+'/atlas/assets/classic-audio/'+file);
   assert.equal(response.status,200,file);assert.equal(response.headers.get('content-type'),type);
   assert.ok((await response.arrayBuffer()).byteLength>100);
  }
  assert.equal((await fetch(origin+'/atlas/editor.html',{method:'POST'})).status,405);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
