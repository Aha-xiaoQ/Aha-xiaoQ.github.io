import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {
 normalizeFontLicense, buildFontSupport, checkFontSupport, sha, blob,
 RECORD, PROVIDER, CSS, LICENSE_SOURCE, LICENSE_OUTPUT, LICENSE_FORMAT
} from '../../scripts/platform/font-support.mjs';
import {fixture} from './helpers/font-fixture.mjs';
import {stageAndCheck} from '../../scripts/platform/delivery/lib/git-stage.mjs';
import {verifyGeneratedFonts} from '../../scripts/platform/delivery/lib/install.mjs';

// Exact license text from the reviewed repository blob, NOT font data.
// JSON escapes preserve the original space without introducing a dirty test file.
const notice=JSON.parse(fs.readFileSync(new URL('./fixtures/wenkai-ofl-source.json',import.meta.url),'utf8'));
const original=Buffer.from(notice.text,'utf8');
const options=f=>({provider:f.provider,pin:f.pin,primary:f.primary,corpus:f.corpus,fetcher:f.fetcher});
const read=(f,p)=>fs.readFileSync(path.join(f.root,p));
function setup(t){const f=fixture(t);f.write(LICENSE_SOURCE,original);return f;}
function records(f){return JSON.parse(read(f,RECORD));}
function snapshot(root){const result={};function visit(rel=''){for(const d of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){if(d.name==='.git')continue;const p=rel?rel+'/'+d.name:d.name;if(d.isDirectory())visit(p);else result[p]=sha(fs.readFileSync(path.join(root,p)));}}visit();return result;}
function run(f,args,{allowFailure=false}={}){
 const r=spawnSync('git',args,{cwd:f.root,encoding:'utf8',env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:path.join(f.root,'.local/no-user-gitconfig')}});
 if(r.error)throw r.error;
 if(!allowFailure&&r.status!==0)throw Error('git '+args.join(' ')+' exited '+r.status+'\n'+r.stdout+r.stderr);
 return r;
}
function gitRepo(f){
 fs.mkdirSync(path.join(f.root,'.local'),{recursive:true});
 f.write('.gitignore','.local/\n');
 // Reproduce the recipient's LF checkout policy even when this test runs on Windows.
 f.write('.gitattributes','* text=auto eol=lf\n*.woff2 -text\n');
 run(f,['init','--quiet']);
 run(f,['add','.gitignore','.gitattributes',LICENSE_SOURCE]);
 run(f,['-c','user.name=Local regression','-c','user.email=regression@example.invalid','-c','commit.gpgSign=false','commit','--quiet','-m','Synthetic license-copy baseline']);
}
const manifest={files:[],protected:[],migrationPaths:[]};
function staging(f){return stageAndCheck(async(args)=>({stdout:run(f,args).stdout}),
 [...Object.keys(records(f).files),RECORD],manifest,
 {pathspecFile:path.join(f.root,'.local/paths.txt'),logFile:path.join(f.root,'.local/diff.log'),repositoryRoot:f.root});}
function legacyCopy(f){
 const r=records(f);f.write(LICENSE_OUTPUT,original);
 r.files[LICENSE_OUTPUT]={sha256:sha(original),bytes:original.length};delete r.license;
 f.write(RECORD,JSON.stringify(r,null,2)+'\n');
}

test('captured production license has the exact reviewed blob and reported line-22 space',()=>{
 assert.equal(blob(original),notice.blob);assert.equal(sha(original),notice.sha256);
 assert.equal(notice.blob,'bb1634cb03ee7202d5c66bf2754705493bd73e1e');
 assert.equal(notice.text.split('\n')[21],'fonts, including any derivative works, can be bundled, embedded, ');
});
test('production copy removes exactly one byte and preserves all license text',()=>{
 const output=normalizeFontLicense(original);
 assert.equal(output.length,original.length-1);
 assert.equal(output.toString(),notice.text.replace('bundled, embedded, \n','bundled, embedded,\n'));
 assert.deepEqual(original,Buffer.from(notice.text));
});
for(const [name,ending]of [['LF','\n'],['CRLF','\r\n'],['CR','\r']])test('normalization is repeatable for '+name,()=>{
 const text='SIL OPEN FONT LICENSE'+ending+'  Keep  inner\tspacing. \t'+ending+ending+'Last line\t '+ending+ending;
 const output=normalizeFontLicense(Buffer.from(text));
 assert.equal(output.toString(),'SIL OPEN FONT LICENSE\n  Keep  inner\tspacing.\n\nLast line\n');
 assert.deepEqual(normalizeFontLicense(output),output);
});
test('Unicode wording, non-ASCII spaces, BOM and indentation are not stripped',()=>{
 const text='\ufeffSIL OPEN FONT LICENSE\n\t  霞鹜文楷\u00a0，\u3000\n';
 assert.equal(normalizeFontLicense(Buffer.from(text)).toString(),text);
});
test('missing EOF newline is added without removing text',()=>{
 assert.equal(normalizeFontLicense(Buffer.from('SIL OPEN FONT LICENSE')).toString(),'SIL OPEN FONT LICENSE\n');
});
for(const [name,bytes] of [['missing',null],['nonbuffer','SIL OPEN FONT LICENSE'],['no notice',Buffer.from('wrong')],['invalid UTF8',Buffer.concat([original,Buffer.from([0xc3,0x28])])],['NUL',Buffer.concat([original,Buffer.from([0])])]])test('invalid license fails closed: '+name,()=>assert.throws(()=>normalizeFontLicense(bytes),/OFL|UTF-8/));

test('actual font builder preserves source and records raw and formatted identities separately',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));const r=records(f),out=read(f,LICENSE_OUTPUT);
 assert.deepEqual(read(f,LICENSE_SOURCE),original);assert.deepEqual(out,normalizeFontLicense(original));
 assert.deepEqual(r.license,{source:LICENSE_SOURCE,sourceSha256:sha(original),sourceBytes:original.length,output:LICENSE_OUTPUT,sha256:sha(out),bytes:out.length,format:LICENSE_FORMAT});
 assert.deepEqual(r.files[LICENSE_OUTPUT],{sha256:sha(out),bytes:out.length});
 assert.equal(checkFontSupport(f.root,options(f)).ok,true);
 assert.equal(verifyGeneratedFonts(f.root).has(LICENSE_OUTPUT),true);
});
test('real generated file collection stages and passes normal Git whitespace checking',async t=>{
 const f=setup(t);gitRepo(f);await buildFontSupport(f.root,options(f));const paths=await staging(f);
 assert.ok(paths.includes(LICENSE_OUTPUT));assert.equal(run(f,['diff','--cached','--check']).status,0);
 assert.equal(run(f,['diff','--',LICENSE_SOURCE]).stdout,'');
});
test('real Git reproduces old line-22 failure, then accepts a build-owned upgrade',async t=>{
 const f=setup(t);gitRepo(f);await buildFontSupport(f.root,options(f));legacyCopy(f);
 run(f,['add',LICENSE_OUTPUT,RECORD]);const old=run(f,['diff','--cached','--check'],{allowFailure:true});
 assert.equal(old.status,2);assert.match(old.stdout+old.stderr,/font-support\/OFL\.txt:22: trailing whitespace/);
 const before=records(f);const r=await buildFontSupport(f.root,{...options(f),fetcher:()=>{throw Error('No network permitted during upgrade');}});
 assert.equal(r.downloaded,0);assert.equal(r.changed,2);
 assert.deepEqual(before.faces,records(f).faces);assert.deepEqual(read(f,LICENSE_SOURCE),original);
 await staging(f);assert.equal(checkFontSupport(f.root,options(f)).ok,true);
});
test('repeat build and read-only check preserve every byte without network access',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));const before=snapshot(f.root);
 const r=await buildFontSupport(f.root,{...options(f),fetcher:()=>{throw Error('offline');}});
 assert.equal(r.changed,0);assert.equal(r.downloaded,0);
 assert.equal(checkFontSupport(f.root,options(f)).ok,true);assert.deepEqual(snapshot(f.root),before);
});
test('old hash-consistent unformatted record fails read-only check without any repair writes',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));legacyCopy(f);const before=snapshot(f.root);
 const r=checkFontSupport(f.root,options(f));assert.equal(r.ok,false);
 assert.ok(r.errors.some(e=>e.problem==='stale-font-license'));
 assert.ok(r.errors.some(e=>e.problem==='stale-font-license-provenance'));
 assert.deepEqual(snapshot(f.root),before);
});
test('hand-edited generated license prevents overwrite and preserves other outputs',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));f.write(LICENSE_OUTPUT,'Do not overwrite.\n');const before=snapshot(f.root);
 await assert.rejects(buildFontSupport(f.root,options(f)),/Generated font file changed/);
 assert.throws(()=>checkFontSupport(f.root,options(f)),/Generated font file changed/);assert.deepEqual(snapshot(f.root),before);
});
test('a removed owned license remains an error rather than implicit overwrite permission',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));fs.unlinkSync(path.join(f.root,LICENSE_OUTPUT));
 const before=snapshot(f.root);await assert.rejects(buildFontSupport(f.root,options(f)),/Generated font file changed/);assert.deepEqual(snapshot(f.root),before);
});
test('source changes invalidate provenance even when its formatted output is identical',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));f.write(LICENSE_SOURCE,normalizeFontLicense(original));
 const report=checkFontSupport(f.root,options(f));assert.equal(report.ok,false);assert.ok(report.errors.some(e=>e.problem==='stale-font-license-provenance'));
 const r=await buildFontSupport(f.root,options(f));assert.equal(r.changed,1);assert.equal(checkFontSupport(f.root,options(f)).ok,true);
});
test('hash-consistent license wording changes cannot impersonate the source notice',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));const bytes=Buffer.from(read(f,LICENSE_OUTPUT).toString().replace('not sold by themselves','sold by themselves'));
 f.write(LICENSE_OUTPUT,bytes);const r=records(f);r.files[LICENSE_OUTPUT]={sha256:sha(bytes),bytes:bytes.length};r.license.sha256=sha(bytes);r.license.bytes=bytes.length;f.write(RECORD,JSON.stringify(r));
 assert.equal(checkFontSupport(f.root,options(f)).ok,false);
});
test('invalid source notice does not leave half-written generated files',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));f.write(LICENSE_SOURCE,'No notice\n');const before=snapshot(f.root);
 await assert.rejects(buildFontSupport(f.root,options(f)),/OFL/);assert.deepEqual(snapshot(f.root),before);
});
test('a colliding unregistered license is not silently replaced',async t=>{
 const f=setup(t);f.write(LICENSE_OUTPUT,'Existing file\n');const before=snapshot(f.root);
 await assert.rejects(buildFontSupport(f.root,options(f)),/collision/);assert.deepEqual(snapshot(f.root),before);
});
test('actual staging still rejects unrelated trailing whitespace and conflict markers',async t=>{
 const f=setup(t);gitRepo(f);await buildFontSupport(f.root,options(f));await staging(f);
 for(const bytes of ['line with trailing space \n','<<<<<<< ours\ntext\n=======\nother\n>>>>>>> theirs\n']){
  f.write('content/test-copy.txt',bytes);
  run(f,['add','content/test-copy.txt']);const r=run(f,['diff','--cached','--check'],{allowFailure:true});
  assert.equal(r.status,2);assert.match(r.stdout+r.stderr,/trailing whitespace|conflict marker/);
 }
});
test('font binaries, pinned provider and CSS stay byte identical when only license formatting upgrades',async t=>{
 const f=setup(t);await buildFontSupport(f.root,options(f));const before=snapshot(f.root);legacyCopy(f);
 await buildFontSupport(f.root,options(f));const after=snapshot(f.root);
 for(const p of [PROVIDER,CSS,...records(f).faces.map(r=>r.file)])assert.equal(after[p],before[p],p);
});
