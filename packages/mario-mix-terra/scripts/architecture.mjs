#!/usr/bin/env node
/** Build contracts + lightweight static boundaries, not a JavaScript security sandbox. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {safe,readOptional,writeAtomic} from './lib/safe-path.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
const read=(root,p)=>{const b=readOptional(root,p);if(!b)throw Error('Missing contract file: '+p);return b.toString().replace(/\r\n/g,'\n');};
const json=(root,p)=>JSON.parse(read(root,p));
const sha=s=>createHash('sha256').update(s).digest('hex');
const wrappers=/\b(?:fixedUpdate|draw|togglePause|step|loadRoom|pollMixPad|t17Early\.handle)\s*=\s*function\b/g;
export function checkArchitecture(root=ROOT){
 const registry=json(root,'architecture/modules.json'),build=json(root,'build.config.json');
 if(registry.schemaVersion!==1||!Array.isArray(registry.modules))throw Error('Unknown architecture schema');
 const ids=new Map(),paths=new Set();
 for(const m of registry.modules){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.id)||ids.has(m.id)||paths.has(m.path))throw Error('Duplicate/invalid module contract: '+m.id);
  ids.set(m.id,m);paths.add(m.path);
  if(!['simulation','input','runtime','ui','content'].includes(m.layer)||!m.path.startsWith('src/'+m.layer+'/'))throw Error('Layer/path mismatch: '+m.id);
  const source=read(root,m.path),registered=build.modules.find(x=>x.path===m.path);
  if(!registered||JSON.stringify(registered.exports)!==JSON.stringify(m.exports))throw Error('Build exports differ from contract: '+m.id);
  if(!m.tests?.length)throw Error('Module has no tests: '+m.id);
  for(const t of m.tests){if(!t.startsWith('tests/')||!t.endsWith('.test.mjs'))throw Error('Invalid test path');read(root,t);}
  if(!m.reviewerRole||m.status!=='connected'||!Array.isArray(m.dependsOn))throw Error('Incomplete module contract: '+m.id);
  const hook=build.hooks.find(h=>h.id===m.entryHook);if(!hook)throw Error('Missing entry hook: '+m.id);
  const bridge=hook.bridge?read(root,hook.bridge):hook.replacement;
  if(!m.exports.some(name=>bridge.includes('__terraModules.'+name)))throw Error('Module is not wired at declared hook: '+m.id);
  // Remove comments first. Heuristic rejects browser/global IO tokens in inner modules.
  // Deliberately do not use this check as a sandbox or claim it resolves dynamic JS.
  const code=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  if(m.layer!=='ui'&&/\b(?:window|document|globalThis|localStorage|sessionStorage|navigator|fetch)\b/.test(code))throw Error('Forbidden host dependency: '+m.id);
  if(/\b(?:eval|Function)\s*\(/.test(code))throw Error('Dynamic evaluation not allowed in a module: '+m.id);
 }
 if(paths.size!==build.modules.length)throw Error('Unregistered build module');
 function scan(rel){for(const e of fs.readdirSync(safe(root,rel),{withFileTypes:true})){const p=rel+'/'+e.name;safe(root,p);if(e.isSymbolicLink())throw Error('Source symlink');if(e.isDirectory())scan(p);else if(p.endsWith('.mjs')&&!paths.has(p))throw Error('Unregistered source module: '+p);}}
 scan('src');
 const visiting=new Set(),done=new Set();function visit(id){if(visiting.has(id))throw Error('Module dependency cycle: '+id);if(done.has(id))return;const m=ids.get(id);if(!m)throw Error('Unknown dependency: '+id);visiting.add(id);for(const dep of m.dependsOn){if(m.layer!=='ui'&&ids.get(dep)?.layer==='ui')throw Error('Inner module depends on UI: '+id);visit(dep);}visiting.delete(id);done.add(id);}
 for(const id of ids.keys())visit(id);
 if(build.fragments.length>registry.compatibility.fragments)throw Error('Compatibility area grew; an ADR and review are required');
 const compat=build.fragments.map(f=>read(root,f.path)).join('')+registry.compatibility.bridgePaths.map(p=>read(root,p)).join('');
 const count=[...compat.matchAll(wrappers)].length;
 if(count>registry.compatibility.maxWrapperAssignments)throw Error('Legacy wrapper budget exceeded');
 for(const [p,h] of Object.entries(registry.goldenHashes))if(sha(read(root,p))!==h)throw Error('Golden reference edited: '+p);
 return {modules:paths.size,bridgeFiles:registry.compatibility.bridgePaths.length,compatibilityFragments:build.fragments.length,trackedWrapperAssignments:count,checks:'contracts, declared graph, test paths, runtime wiring, golden hashes, wrapper budget; not a security sandbox'};
}
export function moduleDocument(root=ROOT){const r=json(root,'architecture/modules.json');return '# 模块登记（自动生成）\n\n来源：architecture/modules.json。表中 owner 是审阅职责，不表示已有贡献者认领。注入依赖需结合测试核验；这是登记依赖图，不是动态 JavaScript 的完整分析。\n\n| 模块 | 源码 | 层 | 注入依赖 | 测试 |\n|---|---|---|---|---|\n'+r.modules.map(m=>`| ${m.title} | \`${m.path}\` | ${m.layer} | ${m.dependsOn.join(', ')||'无模块级依赖'} | ${m.tests.join(', ')} |`).join('\n')+'\n\n33 个 compat 文件仍保留共享闭包；bindings、stages、weapon-exchange、chest-spill、hud-paint、adventure-shell 是六个宿主适配器，不算独立业务模块。M06 platform-v1 仍是接入原型，不是旧泰拉物理的迁移；legacy-terra-v1 仍限制为原第三期组合。\n';}
export function buildModuleDocs(root=ROOT,{check=false}={}){
 const p='docs/generated/MODULES.md',manifest='docs/generated/manifest.json',bytes=Buffer.from(moduleDocument(root)),old=readOptional(root,p),previous=JSON.parse(readOptional(root,manifest)||'{"files":{}}');
 if(old&&sha(old.toString().replace(/\r\n/g,'\n'))!==previous.files[p])throw Error('Generated module doc was edited; preserve manual changes');
 if(check&&(!old||old.toString().replace(/\r\n/g,'\n')!==bytes.toString()))throw Error('Module docs are stale: npm run docs:build');
 if(!check){writeAtomic(root,p,bytes);writeAtomic(root,manifest,Buffer.from(JSON.stringify({files:{[p]:sha(bytes)}},null,2)+'\n'));}
 return {changed:!old||old.toString().replace(/\r\n/g,'\n')!==bytes.toString()};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(JSON.stringify(checkArchitecture(),null,2));if(process.argv.includes('--docs'))console.log(buildModuleDocs());else if(process.argv.includes('--check-docs'))console.log(buildModuleDocs(ROOT,{check:true}));}catch(e){console.error(e.message);process.exitCode=1;}
}
