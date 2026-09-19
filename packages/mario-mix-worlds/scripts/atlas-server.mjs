import http from 'node:http';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {ROOT,build} from './build.mjs';import {readOptional} from './lib/safe-path.mjs';
export function createAtlasServer(root=ROOT){return http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'');if(!p)p='atlas/index.html';
 if(!/^(?:atlas\/|generated\/|docs\/|START_HERE\.md$|NOTICE\.md$)/.test(p))throw Error('Path not public');
 const b=readOptional(root,p);if(!b){res.writeHead(404);res.end('Not found');return;}
 const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.tmj':'application/json','.svg':'image/svg+xml','.zip':'application/zip','.md':'text/plain; charset=utf-8'};
 res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream','Content-Length':b.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:b);
 }catch{res.writeHead(400);res.end('Invalid path');}
 });}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){build(ROOT);const s=createAtlasServer();s.on('error',e=>{console.error(e.message);process.exitCode=1;});s.listen(4196,'127.0.0.1',()=>console.log('地图册：http://127.0.0.1:4196/atlas/index.html\nCtrl+C 停止。'));}
