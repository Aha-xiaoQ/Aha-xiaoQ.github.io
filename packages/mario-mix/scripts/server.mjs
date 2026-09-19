import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {ROOT,PACKAGE,inside,read,buildCandidate} from './core.mjs';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
export function createDevServer({root=ROOT,pkg=PACKAGE,original=false}={}) {
  // Every startup validates the baseline. No stale candidate is silently reused.
  const candidate=buildCandidate(root,pkg);
  const server=http.createServer((req,res)=>{
    const send=(status,body='',type='text/plain; charset=utf-8')=>{
      res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Length':Buffer.byteLength(body)});
      res.end(req.method==='HEAD'?undefined:body);
    };
    const expected=`127.0.0.1:${server.address().port}`;
    if(req.headers.host!==expected || (req.headers.origin && req.headers.origin!==`http://${expected}`) || req.headers['sec-fetch-site']==='cross-site')return send(403,'Local access only');
    if(!['GET','HEAD'].includes(req.method))return send(405,'Read-only development server');
    let decoded;
    try{decoded=decodeURIComponent((req.url||'/').split('?')[0]);}catch{return send(400,'Invalid URL');}
    if(decoded==='/' ){res.writeHead(302,{Location:'/games/mario-mix/play.html?test=1','Cache-Control':'no-store'});return res.end();}
    if(decoded==='/__r05/build.json')return send(200,JSON.stringify({...candidate.meta,mode:original?'original-reference':'candidate'},null,2),types['.json']);
    if(decoded.endsWith('/'))return send(404,'No directory listing');
    const rel=decoded.slice(1);
    if(!decoded.startsWith('/')||decoded.startsWith('//')||rel.split('/').some(s=>s.startsWith('.'))||rel.includes('\\'))return send(403,'Path blocked');
    // Nothing from the repository root, .git, sources or private notes is served.
    if(!(rel.startsWith('games/mario-mix/')||rel.startsWith('assets/fonts/')||rel==='assets/FONT_LICENSES.md'))return send(404,'Not exposed by the game development server');
    if(rel.startsWith('assets/fonts/')&&!/\.(woff2|txt)$/i.test(rel))return send(403,'Font route blocked');
    try{
      const file=inside(root,rel);
      if(!fs.existsSync(file)||!fs.statSync(file).isFile())return send(404,'Missing local asset: '+rel);
      let bytes;
      if(rel==='games/mario-mix/classic-mix.js'&&!original)bytes=Buffer.from(candidate.output);
      else if(rel==='games/mario-mix/play.html'){
        // Development only. The production entry on disk is never edited.
        // Remove site analytics, preserve the existing game CSP, UI and all input bindings.
        let html=read(root,rel).replace(/<script\b[^>]*\bsrc=["']\/assets\/site-analytics\.js[^"']*["'][^>]*>\s*<\/script>/g,'');
        html=html.replace(/<title>[^<]*<\/title>/,'<title>本地开发 · 混合马里奥 · '+(original?'原始对照':'R05 候选')+'</title>');
        bytes=Buffer.from(html);
      }else bytes=fs.readFileSync(file);
      send(200,bytes,types[path.extname(file).toLowerCase()]||'application/octet-stream');
    }catch(error){send(error.code==='ENOENT'?404:403,'File unavailable');}
  });
  return server;
}
