/** Read-only artifact server, loopback only, isolated from private source files. */
import http from'node:http';import fs from'node:fs';import path from'node:path';
import {safe,readOptional}from'../../lib/safe-path.mjs';
const types={'.ico':'image/vnd.microsoft.icon','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.woff':'font/woff','.mp3':'audio/mpeg','.wav':'audio/wav','.zip':'application/zip'};
export function discover(root){const pages=[];function walk(rel=''){const dir=rel?safe(root,rel):root;for(const name of fs.readdirSync(dir).sort()){if(name.startsWith('.'))continue;const p=rel?rel+'/'+name:name,stat=fs.lstatSync(safe(root,p));if(stat.isSymbolicLink())throw Error('Linked artifact file');if(stat.isDirectory())walk(p);else if(p.endsWith('.html')&&/\bsrc=["'][^"']*assets\/site-i18n\.js(?:\?[^"']*)?["']/.test(readOptional(root,p).toString()))pages.push(p);}}walk();return pages;}
export async function serve(root){
 const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const expected='127.0.0.1:'+server.address().port;if(req.headers.host!==expected){res.writeHead(403);res.end();return;}
  try{
   const url=new URL(req.url,'http://'+expected);let rel=decodeURIComponent(url.pathname).slice(1);if(!rel||rel.endsWith('/'))rel+='index.html';
   if(rel.split('/').some(part=>part.startsWith('.'))||/[\\\x00-\x1f]/.test(rel))throw Error('Private path');
   const bytes=readOptional(root,rel);if(!bytes){res.writeHead(404);res.end('Not found');return;}
   res.writeHead(200,{'Content-Type':types[path.extname(rel)]||'application/octet-stream','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-src 'self' blob:"});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(403);res.end('Forbidden');}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 return {origin:'http://127.0.0.1:'+server.address().port,close:()=>new Promise(resolve=>{server.closeAllConnections?.();server.close(resolve);})};
}
