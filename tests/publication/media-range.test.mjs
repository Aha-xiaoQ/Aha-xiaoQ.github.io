import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {handler} from '../../scripts/publication/serve.mjs';
test('preview serves seekable media and rejects unsatisfiable ranges',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'badapple-media-'));
 fs.writeFileSync(path.join(root,'film.mp4'),Buffer.from('0123456789'));
 const server=http.createServer(handler(root));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=`http://127.0.0.1:${server.address().port}/film.mp4`;
 try{
  const head=await fetch(url,{method:'HEAD'});assert.equal(head.headers.get('content-type'),'video/mp4');assert.equal(head.headers.get('content-length'),'10');
  for(const [range,body]of [['bytes=2-5','2345'],['bytes=7-','789'],['bytes=-3','789'],['bytes=8-99','89']]){
   const result=await fetch(url,{headers:{Range:range}});assert.equal(result.status,206);assert.equal(await result.text(),body);
  }
  for(const range of ['bytes=20-30','bytes=5-2','bytes=-','bytes=0-1,3-4'])assert.equal((await fetch(url,{headers:{Range:range}})).status,416);
 }finally{await new Promise(r=>server.close(r));fs.rmSync(root,{recursive:true,force:true});}
});
