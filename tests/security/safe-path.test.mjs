import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {safe,readOptional,writeAtomic,validateRelative} from '../../scripts/lib/safe-path.mjs';
import {safe as collectionSafe} from '../../scripts/workshop/build.mjs';
import {safe as journalSafe} from '../../scripts/journal/build.mjs';

function temp(t){const r=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'safe-r08-'));t.after(()=>fs.rmSync(r,{recursive:true,force:true}));return r;}
function dirLink(target,link){fs.symlinkSync(target,link,process.platform==='win32'?'junction':'dir');}
function fileLink(t,target,link){try{fs.symlinkSync(target,link,'file');return true;}catch(e){if(process.platform==='win32'&&e.code==='EPERM'){t.skip('Windows 未授权创建文件符号链接；目录 junction 回归仍是必跑测试');return false;}throw e;}}
async function allReject(root,rel){assert.throws(()=>safe(root,rel),/符号链接/);assert.throws(()=>collectionSafe(root,rel),/符号链接/);await assert.rejects(()=>journalSafe(root,rel),/符号链接/);}

test('SEC-01 missing ordinary output is allowed, not mistaken for a link',t=>{const r=temp(t);assert.equal(safe(r,'fresh/output.html'),path.join(r,'fresh','output.html'));assert.equal(readOptional(r,'fresh/output.html'),null);});
test('SEC-02 rejects traversal and POSIX/Windows absolute forms on every host',()=>{for(const p of ['../x','a/../x','a//x','/tmp/x','C:/tmp/x','C:\\tmp\\x','\\\\server\\share','a\\b','.git/config','x/.ENV.token'])assert.throws(()=>validateRelative(p),undefined,p);});
test('SEC-03 Windows device aliases and trailing-dot/space names are rejected',()=>{for(const p of ['CON','nul.txt','aux.json','COM1.css','lpt9.log','x/file.','x/file ','a:b'])assert.throws(()=>validateRelative(p),undefined,p);});
test('SEC-04 root with ordinary spaces and Unicode is valid',t=>{const r=temp(t),p=path.join(r,'我的 website');fs.mkdirSync(p);writeAtomic(p,'docs/a.md','ok');assert.equal(readOptional(p,'docs/a.md').toString(),'ok');});
test('SEC-05 live directory symlink or Windows junction is rejected by both builders',async t=>{const r=temp(t),target=path.join(r,'target');fs.mkdirSync(target);dirLink(target,path.join(r,'link'));await allReject(r,'link/new.txt');});
test('SEC-06 dangling directory link is rejected even though existsSync returns false',async t=>{const r=temp(t),target=path.join(r,'target'),link=path.join(r,'link');fs.mkdirSync(target);dirLink(target,link);fs.rmdirSync(target);assert.equal(fs.existsSync(link),false);assert.equal(fs.lstatSync(link).isSymbolicLink(),true);await allReject(r,'link/output.html');});
test('SEC-07 dangling directory link at output leaf is rejected',async t=>{const r=temp(t),target=path.join(r,'target');fs.mkdirSync(target);dirLink(target,path.join(r,'leaf'));fs.rmdirSync(target);await allReject(r,'leaf');});
test('SEC-08 symlink workspace root is rejected',async t=>{const r=temp(t),target=path.join(r,'target');fs.mkdirSync(target);dirLink(target,path.join(r,'workspace'));await allReject(path.join(r,'workspace'),'output.html');});
test('SEC-09 dangling workspace root is rejected',async t=>{const r=temp(t),target=path.join(r,'target');fs.mkdirSync(target);dirLink(target,path.join(r,'workspace'));fs.rmdirSync(target);await allReject(path.join(r,'workspace'),'output.html');});
test('SEC-10 linked ancestor above the root cannot hide traversal',async t=>{const r=temp(t),target=path.join(r,'target');fs.mkdirSync(path.join(target,'site'),{recursive:true});dirLink(target,path.join(r,'alias'));await allReject(path.join(r,'alias','site'),'index.html');});
test('SEC-11 existing non-directory parent fails closed',t=>{const r=temp(t);fs.writeFileSync(path.join(r,'file'),'x');assert.throws(()=>safe(r,'file/child.html'),/不是目录/);});
test('SEC-12 missing workspace root is not an output authorization',t=>{const r=temp(t);assert.throws(()=>safe(path.join(r,'missing'),'index.html'),/不存在/);});
test('SEC-13 live file symlink cannot be read or replaced',t=>{const r=temp(t),target=path.join(r,'target.txt');fs.writeFileSync(target,'KEEP');if(!fileLink(t,target,path.join(r,'link.txt')))return;assert.throws(()=>readOptional(r,'link.txt'),/符号链接/);assert.throws(()=>writeAtomic(r,'link.txt','BAD'),/符号链接/);assert.equal(fs.readFileSync(target,'utf8'),'KEEP');});
test('SEC-14 dangling file link cannot be mistaken for a new output',t=>{const r=temp(t),target=path.join(r,'missing.txt');if(!fileLink(t,target,path.join(r,'link.txt')))return;assert.equal(fs.existsSync(path.join(r,'link.txt')),false);assert.throws(()=>safe(r,'link.txt'),/符号链接/);assert.throws(()=>writeAtomic(r,'link.txt','BAD'),/符号链接/);assert.equal(fs.existsSync(target),false);});
test('SEC-15 non-file read is an error, not a missing-file result',t=>{const r=temp(t);fs.mkdirSync(path.join(r,'folder'));assert.throws(()=>readOptional(r,'folder'),/不是普通文件/);});
test('SEC-16 atomic output creates ordinary directories and no temp leftovers',t=>{const r=temp(t);writeAtomic(r,'new/entry.json','first');writeAtomic(r,'new/entry.json','second');assert.equal(readOptional(r,'new/entry.json').toString(),'second');assert.deepEqual(fs.readdirSync(path.join(r,'new')),['entry.json']);});
test('SEC-17 atomic output refuses a dangling ancestor and creates no target',t=>{const r=temp(t),target=path.join(r,'target');fs.mkdirSync(target);dirLink(target,path.join(r,'out'));fs.rmdirSync(target);assert.throws(()=>writeAtomic(r,'out/index.html','BAD'),/符号链接/);assert.equal(fs.existsSync(target),false);});
test('SEC-18 safe source contains no existsSync authorization',()=>{const source=fs.readFileSync(new URL('../../scripts/lib/safe-path.mjs',import.meta.url),'utf8');assert.ok(!source.includes('existsSync('));assert.ok(source.includes('fs.lstatSync(file)'));assert.ok(source.includes("error.code === 'ENOENT'"));});
