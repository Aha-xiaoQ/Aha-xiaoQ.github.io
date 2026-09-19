import http from 'node:http';
import {createReadStream} from 'node:fs';
import {realpath,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.mp4':'video/mp4','.zip':'application/zip','.wasm':'application/wasm'};
function blockedPart(part){return part.startsWith('.')||['node_modules','coverage','test-results'].includes(part);}
export function createDevServer(root=ROOT) {
  const resolved=path.resolve(root);
  const realRoot=realpath(resolved);
  return http.createServer(async(req,res)=>{
    const send=(code,text)=>{res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:text);};
    try {
      if(!['GET','HEAD'].includes(req.method))return send(405,'Read-only development server.');
      const host=req.headers.host||'';
      if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))return send(403,'Only localhost Host headers are accepted.');
      const raw=req.url.split('?')[0];
      let pathname;try{pathname=decodeURIComponent(raw);}catch{return send(400,'Malformed URL.');}
      if(!pathname.startsWith('/')||pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(blockedPart))return send(403,'Path is not public.');
      let target=path.resolve(resolved,'.'+pathname);
      if(target!==resolved&&!target.startsWith(resolved+path.sep))return send(403,'Path is outside the project.');
      let info;try{info=await stat(target);}catch{return send(404,'Not found. This may be an update-only checkout; overlay it onto the existing repository for games and site assets.');}
      if(info.isDirectory()) {
        if(!pathname.endsWith('/')){res.writeHead(302,{Location:pathname+'/','Cache-Control':'no-store'});return res.end();}
        target=path.join(target,'index.html');
        try{info=await stat(target);}catch{return send(404,'Directory listing is disabled.');}
      }
      if(!info.isFile())return send(404,'Not found.');
      const real=await realpath(target),base=await realRoot;
      if(!real.startsWith(base+path.sep))return send(403,'Symlink leaves the project.');
      // Also block symlinks that point back into hidden/private directories.
      if(path.relative(base,real).split(path.sep).some(blockedPart))return send(403,'Private path.');
      res.writeHead(200,{'Content-Type':MIME[path.extname(target).toLowerCase()]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});
      if(req.method==='HEAD')return res.end();
      const stream=createReadStream(target);stream.on('error',()=>res.destroy());stream.pipe(res);
    } catch {if(!res.headersSent)send(500,'Unable to read requested file.');else res.destroy();}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);let port=4173;
  if(args.length){if(args.length!==2||args[0]!=='--port'||!/^\d+$/.test(args[1])){console.error('Usage: npm run dev -- --port 4173');process.exit(1);}port=Number(args[1]);}
  if(!Number.isInteger(port)||port<1024||port>65535){console.error('Port must be between 1024 and 65535.');process.exit(1);}
  const server=createDevServer();
  server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`端口 ${port} 已占用。可运行 npm run dev -- --port 4174。`:e.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>{
    console.log(`开发日志：http://127.0.0.1:${port}/notes/\n网站首页：http://127.0.0.1:${port}/\n仅本机只读服务；不会写入仓库或 GitHub。Ctrl+C 停止。`);
  });
}
