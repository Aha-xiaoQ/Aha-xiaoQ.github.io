#!/usr/bin/env node
/** Loopback-only read-only server. Does not expose source or the workspace root. */
import http from 'node:http';import path from 'node:path';import {fileURLToPath}from'node:url';
import {build,ROOT}from'./build.mjs';import{readOptional}from'./lib/safe-path.mjs';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8'};
export function createServer(root=ROOT,{reference=false}={}){
 return http.createServer((req,res)=>{
  const deny=(code,msg)=>{res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(msg);};
  const host=req.headers.host||'';if(!/^(?:127\.0\.0\.1|localhost):\d+$/.test(host))return deny(403,'Local Host required');
  if(req.headers.origin&&req.headers.origin!==`http://${host}`)return deny(403,'Cross-origin request rejected');
  if(!['GET','HEAD'].includes(req.method))return deny(405,'Read only');
  try{
   const u=new URL(req.url,'http://'+host);let rel=decodeURIComponent(u.pathname).slice(1);
   if(!rel)rel=reference?'reference.html':'play.html';
   if(rel.startsWith('.')||rel.includes('\\')||rel.includes('\0')||rel.includes('%')||rel.split('/').some(x=>x==='..'||x==='.'||!x))return deny(400,'Invalid path');
   const type=MIME[path.extname(rel)];if(!type)return deny(404,'Not found');
   const b=readOptional(root,'dist/'+rel);if(!b)return deny(404,'Not found');
   res.writeHead(200,{'Content-Type':type,'Content-Length':b.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(req.method==='HEAD'?undefined:b);
  }catch{deny(400,'Invalid or unavailable path');}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const reference=process.argv.includes('--reference');build(ROOT,{verifyBaseline:reference});
  const n=process.argv.indexOf('--port'),port=n>=0?Number(process.argv[n+1]):reference?4194:4193;
  if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Port must be 1024–65535');
  const server=createServer(ROOT,{reference});server.on('error',e=>{console.error(e.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`${reference?'Original reference':'Modular candidate'}: http://127.0.0.1:${port}/\nEdit src/, restart this command, then refresh. Ctrl+C stops.`));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
