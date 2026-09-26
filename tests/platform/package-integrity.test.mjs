import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createIntegrity, validateIntegrity, validatePackagePath, verifyIntegrityEntries,
  verifyPackageDirectory, INTEGRITY_SCHEMA_VERSION} from '../../scripts/platform/package-integrity.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sha = b => createHash('sha256').update(b).digest('hex');
const json = o => Buffer.from(JSON.stringify(o, null, 2) + '\n');
function files() {
  return ['bootstrap.ps1', 'update.mjs', 'manifest.json', 'START.cmd', 'CHECK_ONLY.cmd']
    .map(p => [p, Buffer.from(p === 'manifest.json' ? '{"schemaVersion":2}' : 'fixture ' + p + '\r\n')]);
}
const seal = entries => [...entries, ['integrity.json', json(createIntegrity(entries))]];
const withIndex = (entries, mutate) => {
  const i = createIntegrity(entries); mutate(i); return [...entries, ['integrity.json', json(i)]];
};
function fixture(t, entries = seal(files())) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'q-integrity-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  for (const [p,b] of entries) { fs.mkdirSync(path.dirname(path.join(dir,p)),{recursive:true}); fs.writeFileSync(path.join(dir,p),b); }
  return dir;
}

test('R49 dictionary-only manifest reproduces missing-schema failure, not a Git failure', () => {
  const f = files(), old = {algorithm:'SHA-256',files:Object.fromEntries(f.map(([p,b]) => [p,sha(b)]))};
  assert.throws(() => validateIntegrity(old), /schemaVersion: 1/);
});
test('adding only schemaVersion to R49 dictionary is still invalid', () => {
  const old = {schemaVersion:1,files:Object.fromEntries(files().map(([p,b]) => [p,sha(b)]))};
  assert.throws(() => validateIntegrity(old), /nonempty array/);
});
test('canonical format is v1 with path and sha256 records, distinct from delta v2', () => {
  const f = files(), index = createIntegrity(f);
  assert.equal(index.schemaVersion, 1); assert.equal(INTEGRITY_SCHEMA_VERSION, 1);
  assert.ok(Array.isArray(index.files)); assert.deepEqual(index.files.map(x => Object.keys(x)),f.map(() => ['path','sha256']));
  assert.equal(JSON.parse(f.find(([p]) => p === 'manifest.json')[1]).schemaVersion,2);
  assert.equal(verifyIntegrityEntries(seal(f)).ok,true);
});
for (const version of [undefined, null, 0, 2, '1', true]) {
  test('unsupported transport version remains blocked: ' + String(version), () => {
    const i = createIntegrity(files()); i.schemaVersion=version;
    assert.throws(() => validateIntegrity(i), /schemaVersion/);
  });
}
for (const value of [undefined, null, {}, [], 'files']) {
  test('malformed/empty files list is rejected: ' + JSON.stringify(value), () => {
    assert.throws(() => validateIntegrity({schemaVersion:1,files:value}), /nonempty array/);
  });
}
test('missing path and missing hash remain hard errors', () => {
  for (const key of ['path','sha256']) {
    const i = createIntegrity(files()); delete i.files[0][key]; assert.throws(() => validateIntegrity(i));
  }
});
test('digest syntax is not coerced to string or silently accepted', () => {
  for (const v of ['',123,'ab'.repeat(31),'gg'.repeat(32)]) {
    const i=createIntegrity(files());i.files[0].sha256=v;assert.throws(()=>validateIntegrity(i),/SHA-256/);
  }
});
test('duplicate and case-colliding manifest paths are blocked', () => {
  for (const uppercase of [false,true]) {
    const i=createIntegrity(files()), row={...i.files[0]};if(uppercase)row.path=row.path.toUpperCase();
    i.files.push(row);assert.throws(()=>validateIntegrity(i),/case-colliding/);
  }
});
test('integrity manifest cannot list itself and startup records cannot be omitted', () => {
  const i=createIntegrity(files());i.files.push({path:'integrity.json',sha256:'a'.repeat(64)});
  assert.throws(()=>validateIntegrity(i),/self-referencing/);
  assert.throws(()=>createIntegrity(files().filter(([p])=>p!=='bootstrap.ps1')),/startup record/);
});
for (const bad of ['../escape', '/absolute','C:/file','a\\b','a/../b','a//b','a/CON.txt','file.','file ','a\0b']) {
  test('unsafe manifest path rejected: ' + JSON.stringify(bad), () => {
    assert.throws(()=>validatePackagePath(bad),/unsafe/);
  });
}
test('Unicode names, ordinary spaces and zero-length files remain supported', () => {
  const e=[...files(),['资料/播放 说明.txt',Buffer.alloc(0)]];assert.equal(verifyIntegrityEntries(seal(e)).files,e.length);
});
test('integrity generation is stable and does not mutate source entries', () => {
  const e=files(), before=e.map(([p,b])=>[p,Buffer.from(b)]);
  assert.deepEqual(createIntegrity(e),createIntegrity([...e].reverse()));assert.deepEqual(e,before);
});
test('transport hashes the actual CRLF/BOM bytes rather than LF normalized text', () => {
  const e=files(), i=createIntegrity(e);e.find(([p])=>p==='bootstrap.ps1')[1]=Buffer.from('\ufeffchanged\n');
  assert.throws(()=>verifyIntegrityEntries([...e,['integrity.json',json(i)]]),/SHA-256 mismatch/);
});
test('one-byte payload corruption is rejected before any Git/network work', () => {
  const e=seal([...files(),['payload/film.zip',Buffer.from([0,1,2,3])]]);
  e.find(([p])=>p==='payload/film.zip')[1][0]=255;
  assert.throws(()=>verifyIntegrityEntries(e),/SHA-256 mismatch/);
});
test('an unlisted file cannot ride along with an otherwise valid package', () => {
  assert.throws(()=>verifyIntegrityEntries([...seal(files()),['lib/extra.mjs',Buffer.from('extra')]]),/complete package/);
});
test('missing file and an equal-count substituted path are blocked', () => {
  const e=seal([...files(),['lib/extra.mjs',Buffer.from('extra')]]);
  assert.throws(()=>verifyIntegrityEntries(e.filter(([p])=>p!=='lib/extra.mjs')),/complete package/);
  e.find(([p])=>p==='lib/extra.mjs')[0]='lib/other.mjs';assert.throws(()=>verifyIntegrityEntries(e),/missing file/);
});
test('duplicate raw archive entries and text masquerading as bytes are rejected', () => {
  const e=files();assert.throws(()=>createIntegrity([...e,e[0]]),/duplicate/);
  assert.throws(()=>createIntegrity([...e,['new.txt','not a Buffer']]),/Buffer/);
});
test('old index must be removed explicitly before sealing again', () => {
  assert.throws(()=>createIntegrity(seal(files())),/remove old integrity/);
});
test('broken JSON and invalid UTF-8 are rejected', () => {
  for(const b of [Buffer.from('{broken'),Buffer.from([0xff,0xfe])])assert.throws(()=>verifyIntegrityEntries([...files(),['integrity.json',b]]),/UTF-8 JSON/);
});
test('real directory check is read-only and returns exact file count', t => {
  const e=seal(files()),d=fixture(t,e);const before=fs.readdirSync(d);
  assert.equal(verifyPackageDirectory(d).files,e.length-1);
  assert.deepEqual(fs.readdirSync(d),before);
  for(const[p,b]of e)assert.deepEqual(fs.readFileSync(path.join(d,p)),b);
});
test('real directory file deletion and unlisted files do not pass', t => {
  const d=fixture(t);fs.unlinkSync(path.join(d,'update.mjs'));assert.throws(()=>verifyPackageDirectory(d));
  fs.writeFileSync(path.join(d,'update.mjs'),'fixture update.mjs\r\n');fs.writeFileSync(path.join(d,'extra.txt'),'bad');assert.throws(()=>verifyPackageDirectory(d),/complete package/);
});
test('read-only CLI succeeds without npm, Git, browser or credentials', t => {
  const d=fixture(t),p=spawnSync(process.execPath,[path.join(root,'scripts/platform/package-integrity.mjs'),'--check',d],{encoding:'utf8',env:{...process.env,PATH:''}});
  assert.equal(p.status,0,p.stderr);assert.equal(JSON.parse(p.stdout).ok,true);
});
test('CLI rejects invalid options and returns a failure code for the actual R49 shape', t => {
  const f=files(),d=fixture(t,[...f,['integrity.json',json({algorithm:'SHA-256',files:Object.fromEntries(f.map(([p,b])=>[p,sha(b)]))})]]);
  const run=args=>spawnSync(process.execPath,[path.join(root,'scripts/platform/package-integrity.mjs'),...args],{encoding:'utf8'});
  assert.equal(run(['--check',d]).status,1);assert.match(run(['--check',d]).stderr,/schemaVersion/);
  assert.equal(run(['--push',d]).status,1);
});
test('actual PowerShell template expects this exact version and array fields', () => {
  const ps=fs.readFileSync(path.join(root,'scripts/platform/delivery/bootstrap.ps1'),'utf8');
  assert.match(ps,/\$index\.schemaVersion -ne 1/);assert.match(ps,/\$index\.files -isnot \[Array\]/);
  assert.match(ps,/foreach \(\$entry in \$index\.files\)/);assert.match(ps,/\$entry\.path/);assert.match(ps,/\$entry\.sha256/);
});
test('PackageCheck startup branch exits after validation and before tool installation/login/clone', () => {
  const ps=fs.readFileSync(path.join(root,'scripts/platform/delivery/bootstrap.ps1'),'utf8');
  const begin=ps.indexOf('\ntry {'),body=ps.slice(begin);
  assert.ok(begin>=0);assert.match(ps,/ValidateSet\('Push','Check','PackageCheck'\)/);
  const verify=body.indexOf('\n    Verify-Package\n'),branch=body.indexOf("if ($Mode -eq 'PackageCheck')"),tool=body.indexOf("$git = Ensure-Tool");
  assert.ok(verify>=0&&branch>verify&&tool>branch);assert.match(body.slice(branch,tool),/exit 0/);
});
test('each CMD entry preserves its intended mode and exit code', () => {
  for(const[name,mode]of [['START.cmd','Push'],['PUSH_UPDATE.cmd','Push'],['CHECK_ONLY.cmd','Check'],['CHECK_PACKAGE.cmd','PackageCheck']]) {
    const cmd=fs.readFileSync(path.join(root,'scripts/platform/delivery',name),'utf8');
    assert.ok(cmd.includes('-Mode '+mode));assert.ok(cmd.includes('set "result=%errorlevel%"'));assert.ok(cmd.includes('exit /b %result%'));
  }
});
test('normal packer uses the shared generator and checks transport format before ZIP serialization', () => {
  const src=fs.readFileSync(path.join(root,'scripts/platform/pack.mjs'),'utf8');
  assert.ok(src.includes('createIntegrity(entries)'));assert.ok(src.includes('verifyIntegrityEntries(entries)'));
  assert.ok(src.indexOf('verifyIntegrityEntries(planned.entries)')<src.indexOf("zip(planned.entries.map"));
});
