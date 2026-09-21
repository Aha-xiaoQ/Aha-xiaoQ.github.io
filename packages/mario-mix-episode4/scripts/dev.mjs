/** Loopback-only preview. Does not expose the source tree, credentials or arbitrary files. */
import http from 'node:http';import path from 'node:path';import {fileURLToPath}from'node:url';
import {build,ROOT}from'./build.mjs';
export function createServer(root=ROOT){
 const result=build(root);
 return http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  let pathname;try{pathname=new URL(req.url,'http://127.0.0.1').pathname;}catch{res.writeHead(400);return res.end();}
  if(!['/','/play.html'].includes(pathname)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found');}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:result.bytes);
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--port'))throw Error('用法：npm run dev -- --port 4194');const port=args.length?Number(args[1]):4194;if(!Number.isInteger(port)||port<1024||port>65535)throw Error('端口必须为 1024–65535');const server=createServer();server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'端口被占用。使用 npm run dev -- --port 4195':e.message);process.exitCode=1;});server.listen(port,'127.0.0.1',()=>console.log(`第四期源码预览：http://127.0.0.1:${port}/play.html\nCtrl+C 停止；源码更改后重启服务。不会修改线上试玩。`));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
