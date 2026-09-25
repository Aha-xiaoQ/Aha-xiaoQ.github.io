import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {verify,sha} from '../../scripts/platform/delivery/lib/install.mjs';
function setup(t,file='assets/site-router.js'){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'q-generated-revision-')),root=dir+'/repo',bundle=dir+'/bundle';
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 function put(base,p,bytes){fs.mkdirSync(path.dirname(base+'/'+p),{recursive:true});fs.writeFileSync(base+'/'+p,bytes);}
 const before="const version = 'dev-r44-0123456789abcdef';\nconst ready = true;\n";
 put(root,file,before);put(bundle,'payload/'+file,before);put(root,'original.html','Original fixture, not a production game');
 const manifest={files:[{path:file,operation:'write'}],protected:[{path:'original.html',sha256:sha(fs.readFileSync(root+'/original.html'))}]};
 return {root,bundle,manifest,before,put:s=>put(root,file,s),check:()=>verify(root,manifest,bundle)};
}
test('router accepts its actual builder-owned dev-r44 revision refresh',t=>{
 const f=setup(t);f.put(f.before.replace('0123456789abcdef','fedcba9876543210'));assert.doesNotThrow(f.check);
});
test('existing journal revision refresh remains supported',t=>{
 const f=setup(t,'assets/journal/runtime.mjs');f.put(f.before.replace('0123456789abcdef','fedcba9876543210'));assert.doesNotThrow(f.check);
});
test('the initial unversioned generator token can be filled',t=>{
 const f=setup(t);f.put(f.before.replace('-0123456789abcdef',''));assert.doesNotThrow(f.check);
});
test('a valid cache refresh cannot hide an unrelated router behavior change',t=>{
 const f=setup(t);f.put(f.before.replace('0123456789abcdef','fedcba9876543210').replace('true','false'));assert.throws(f.check,/Build changed an authored payload/);
});
test('extra code appended after a revision refresh still fails',t=>{
 const f=setup(t);f.put(f.before.replace('0123456789abcdef','fedcba9876543210')+'evil();\n');assert.throws(f.check,/Build changed/);
});
test('unowned revision-like text in another module is not normalized away',t=>{
 const f=setup(t,'assets/experience/runtime.mjs');f.put(f.before.replace('0123456789abcdef','fedcba9876543210'));assert.throws(f.check,/Build changed/);
});
test('invalid or oversize version suffix is still an authored difference',t=>{
 const f=setup(t);for(const value of ['not-a-hash','123456789abcdef00','0123456789ABCDEFX']){f.put(f.before.replace('0123456789abcdef',value));assert.throws(f.check,/Build changed/);}
});
test('Windows text line endings do not become a spurious code change',t=>{
 const f=setup(t);f.put(f.before.replace('0123456789abcdef','fedcba9876543210').replace(/\n/g,'\r\n'));assert.doesNotThrow(f.check);
});
test('original artifact identity remains checked independently of revision changes',t=>{
 const f=setup(t);f.put(f.before.replace('0123456789abcdef','fedcba9876543210'));fs.writeFileSync(f.root+'/original.html','Changed');assert.throws(f.check,/Original artifact changed/);
});
test('removing an authored router is still rejected',t=>{
 const f=setup(t);fs.unlinkSync(f.root+'/assets/site-router.js');assert.throws(f.check,/Build changed/);
});
