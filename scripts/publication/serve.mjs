#!/usr/bin/env node
/** Local preview of the selected artifact only. Never exposes the source repository. */
import http from 'node:http';import path from 'node:path';import {fileURLToPath}from'node:url';import{exactRead,safe}from'./paths.mjs';import{ROOT,OUTPUT,checkPublication}from'./build.mjs';
const types={'.mp4':'video/mp4','.m4a':'audio/mp4','.flac':'audio/flac','.wasm':'application/wasm','.bin':'application/octet-stream','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.zip':'application/zip','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
export function handler(root){return(req,res)=>{let status=200,bytes,file;try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 const raw=(req.url||'/').split(/[?#]/)[0];if(/%2e|%2f|%5c|\\|\.\./i.test(raw))throw Error('path');
 file=decodeURIComponent(raw).slice(1);if(!file||file.endsWith('/'))file+='index.html';bytes=exactRead(root,file);
 if(!bytes){status=404;file='404.html';bytes=exactRead(root,file)||Buffer.from('Not found');}
 const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
 if(status===200 && req.method==='GET' && req.headers.range){
  const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range),size=bytes.length;
  let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):size-1;
  if(match && !match[1] && match[2]){start=Math.max(0,size-Number(match[2]));end=size-1;}
  if(!match || (!match[1]&&!match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start<0 || start>=size || end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
  end=Math.min(end,size-1);status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;bytes=bytes.subarray(start,end+1);headers['Content-Length']=bytes.length;
 }
 res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});res.end('Invalid path');}};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
 if(process.argv.length>2)throw Error('不接受任意根目录或端口。');const report=await checkPublication();if(report.errors.length)throw Error('发布目录没有通过检查；先运行 release:prepare。');
 const server=http.createServer(handler(safe(ROOT,OUTPUT)));server.on('error',e=>{console.error(e.message);process.exitCode=1;});server.listen(4197,'127.0.0.1',()=>console.log('发布目录预览：http://127.0.0.1:4197/'));process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());
}catch(e){console.error(e.message);process.exitCode=1;}
