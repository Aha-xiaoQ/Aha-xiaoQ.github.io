import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Script} from 'node:vm';
export const PACKAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = path.resolve(PACKAGE, '../..');
export const normalized = text => text.replace(/\r\n/g, '\n');
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function gitBlob(value) {
  const b=Buffer.from(value); return createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
}
export function inside(root, relative) {
  if (typeof relative!=='string'||!relative||relative.includes('\\')||relative.includes('\0')||path.isAbsolute(relative)||relative.split('/').some(x=>x==='..'||x==='.'||!x))
    throw new Error(`Unsafe relative path: ${relative}`);
  const full=path.resolve(root,relative);
  let current=path.resolve(root);
  // existsSync follows links and misses dangling links. lstat must be the guard.
  const checkLink = p => {
    let st;
    try { st=fs.lstatSync(p); } catch (e) { if(e.code==='ENOENT')return;throw e; }
    if(st.isSymbolicLink())throw new Error(`Symlink blocked: ${p}`);
  };
  checkLink(current);
  for(const part of relative.split('/')){current=path.join(current,part);checkLink(current);}
  return full;
}
export function read(root,rel){return fs.readFileSync(inside(root,rel),'utf8');}
export const loadBaseline = pkg => JSON.parse(read(pkg,'baseline.json'));
export function replacement(pkg=PACKAGE) {
  const sources=loadBaseline(pkg).sources;
  let pure='';
  for(const name of sources.filter(s=>s.endsWith('.mjs'))){
    const source=read(pkg,name);
    if(/^\s*import\b/m.test(source))throw new Error(`Unsupported import in standalone leaf: ${name}`);
    const stripped=source.replace(/^export function /gm,'function ');
    if(/^\s*export\b/m.test(stripped))throw new Error(`Unsupported export: ${name}`);
    pure+=stripped+'\n';
  }
  const bridge=read(pkg,'src/legacy/bill-controls.bridge.js');
  const code='const __mmR05 = (() => {\n'+pure+'return Object.freeze({resolveBillAim,billDescentIntent,isBillPassablePlatform});\n})();\n'+bridge;
  new Script(code,{filename:'r05-controls-compiled.js'});
  return code;
}
export function transformRuntime(source,pkg=PACKAGE) {
  const input=normalized(source), original=normalized(read(pkg,'tests/fixtures/bill-controls.original.txt'));
  const first=input.indexOf(original);
  if(first<0||input.indexOf(original,first+1)>=0)throw new Error('Expected exactly one known controls block. Do not replace newer source with old files.');
  if(input.includes('const __mmR05'))throw new Error('Already transformed runtime. Build from the original games/ source.');
  const next=replacement(pkg);
  const output=input.slice(0,first)+next+input.slice(first+original.length);
  new Script(output,{filename:'classic-mix.r05.js'});
  return {output,span:{start:first,originalLength:original.length,replacementLength:next.length},outsideHash:sha256(input.slice(0,first)+input.slice(first+original.length))};
}
export function buildCandidate(root=ROOT,pkg=PACKAGE) {
  const lock=loadBaseline(pkg),source=normalized(read(root,lock.runtime));
  const actual=gitBlob(source);
  if(actual!==lock.runtimeBlob)throw new Error(`Runtime baseline mismatch: ${actual}. Expected ${lock.runtimeBlob}. Run audit; keep your newer game and request a new adapter. No --force.`);
  const html=normalized(read(root,lock.entries[0].path));
  if(gitBlob(html)!==lock.entries[0].blob)throw new Error('Episode I HTML differs from the reviewed entry. No game files were changed.');
  if(!/<script\s+src="classic-mix\.js"\s*>\s*<\/script>/.test(html))throw new Error('Unknown script entry contract');
  const result=transformRuntime(source,pkg);
  const inputs=Object.fromEntries(lock.sources.map(n=>[n,sha256(read(pkg,n))]));
  const meta={schemaVersion:1,kind:'local-candidate',episode:'I',baselineCommit:lock.commit,runtimeBlob:actual,entryBlob:gitBlob(html),sha256:sha256(result.output),outsideHash:result.outsideHash,inputs,span:result.span,scope:'Bill aiming and descent intent only; not a full game refactor; not deployed'};
  const out=inside(pkg,'.local/build/classic-mix.js');fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out+'.tmp',result.output);fs.renameSync(out+'.tmp',out);
  fs.writeFileSync(inside(pkg,'.local/build/build.json'),JSON.stringify(meta,null,2)+'\n');
  return {meta,output:result.output};
}
export function inventory(root=ROOT,pkg=PACKAGE) {
  const lock=loadBaseline(pkg);
  const items=[...lock.entries,{id:'I-runtime',path:lock.runtime,blob:lock.runtimeBlob}, {id:'I-reference',path:lock.controls.path,blob:lock.controls.blob}];
  const rows=items.map(item=>{
    const f=inside(root,item.path);
    if(!fs.existsSync(f))return {...item,status:'missing',verified:false};
    const bytes=fs.readFileSync(f),text=normalized(bytes.toString('utf8')),hash=gitBlob(text);
    const scripts=[...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    return {...item,status:hash===item.blob?'matched':'different',verified:hash===item.blob,actualBlob:hash,bytes:bytes.length,sha256:sha256(bytes),scriptCount:scripts.length,
      externalScripts:scripts.filter(m=>/\bsrc\s*=/.test(m[1])).map(m=>m[1].match(/\bsrc\s*=\s*["']([^"']+)/)?.[1]||'unparsed'),
      inlineExecutableBytes:scripts.filter(m=>!/(?:src\s*=|application\/(?:json|ld\+json))/.test(m[1])).reduce((n,m)=>n+Buffer.byteLength(m[2]),0)};
  });
  return {schemaVersion:1,referenceCommit:lock.commit,localGitHead:'not-inferred',interpretation:'File comparison, not gameplay acceptance. HTML script counts are a lexical inventory, not an AST audit.',rows};
}
export function auditAssets(root=ROOT){
  const result=[];
  for(const directory of ['games/mario-mix/assets']){
    const base=inside(root,directory);if(!fs.existsSync(base))continue;
    function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
      const abs=path.join(dir,e.name);if(e.isSymbolicLink())throw new Error('Asset symlink blocked');
      if(e.isDirectory())walk(abs);else if(e.isFile()){const b=fs.readFileSync(abs);result.push({path:path.relative(root,abs).split(path.sep).join('/'),bytes:b.length,sha256:sha256(b),permission:'pending',evidence:null});}
    }}walk(base);
  }
  return {schemaVersion:1,scope:'Episode I files only; inline assets of II/III not cleared',assets:result};
}
