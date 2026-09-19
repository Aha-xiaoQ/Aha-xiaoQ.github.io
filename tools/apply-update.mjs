/** Safe local overlay application. No Git commands, network access or remote writes. */
import {readFile,writeFile,mkdir,lstat,unlink,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomBytes} from 'node:crypto';
import {isUtf8} from 'node:buffer';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function validPath(p) {
  return typeof p==='string'&&p.length>0&&p.length<240&&!p.startsWith('/')&&!p.includes('\\')&&
    !/[\x00-\x1f:*?"<>|]/.test(p)&&p.split('/').every(s=>s&&s!=='.'&&s!=='..'&&s!=='.git'&&s!=='.env'&&!s.startsWith('.env.')&&s!=='node_modules'&&!s.startsWith('.update-')&&!/[. ]$/.test(s)&&!/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(s))&&
    !/\.(woff2?|ttf|otf|eot|ttc|zip|7z|rar|exe|dll)$/i.test(p);
}
async function safeFile(root,relative) {
  if(!validPath(relative))throw Error('Unsafe file path: '+relative);
  let cur=path.resolve(root);
  const parts=relative.split('/');
  for(let i=0;i<parts.length;i++){
    cur=path.join(cur,parts[i]);
    const s=await lstat(cur).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
    if(s?.isSymbolicLink())throw Error('Refusing symlink: '+relative);
    if(s&&i<parts.length-1&&!s.isDirectory())throw Error('Parent is not a directory: '+relative);
    if(s&&i===parts.length-1&&!s.isFile())throw Error('Target is not a regular file: '+relative);
  }
  return cur;
}
async function bytesOrNull(file){try{return await readFile(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
function matches(bytes,expected) {
  if(bytes===null)return expected===null;
  if(!expected)return false;
  // Windows checkout line endings alone are not a content conflict.
  return sha256(bytes)===expected||(isUtf8(bytes)&&sha256(Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n')))===expected);
}
function assertHash(h,nullable=false){if(!(nullable&&h===null)&&!/^[a-f0-9]{64}$/.test(h||''))throw Error('Invalid SHA-256.');}
function assertManifest(m) {
  if(m.schemaVersion!==1||!/^collab-[a-zA-Z0-9._-]+$/.test(m.release||'')||!/^\w[\w.-]*\/[\w.-]+$/.test(m.repository||'')||!/^[a-f0-9]{40}$/.test(m.baseCommit||'')||!Array.isArray(m.files)||!m.files.length||m.files.length>1000)throw Error('Invalid update manifest.');
  const seen=new Set();
  for(const f of m.files){if(!validPath(f.path)||seen.has(f.path))throw Error('Unsafe or duplicate file: '+f.path);seen.add(f.path);assertHash(f.beforeSha256,true);assertHash(f.afterSha256);}
}
export async function inspectUpdate(packageRoot,targetRoot) {
  const source=await realpath(packageRoot),target=await realpath(targetRoot);
  if(source===target||target.startsWith(source+path.sep))throw Error('Target must be your existing repository, not the update package.');
  const payloadStat=await lstat(path.join(source,'repo'));
  if(payloadStat.isSymbolicLink()||!payloadStat.isDirectory())throw Error('Payload root must be a real directory.');
  const m=JSON.parse(await readFile(path.join(source,'manifest.json'),'utf8'));assertManifest(m);
  const changes=[],skipped=[],conflicts=[];
  for(const f of m.files){
    const incoming=await bytesOrNull(await safeFile(path.join(source,'repo'),f.path));
    if(incoming===null||sha256(incoming)!==f.afterSha256)throw Error('Package file missing or corrupted: '+f.path);
    if(!isUtf8(incoming)||incoming.includes(0))throw Error('Only UTF-8 text is allowed in this update: '+f.path);
    const dst=await safeFile(target,f.path),existing=await bytesOrNull(dst);
    if(matches(existing,f.afterSha256)){skipped.push(f.path);continue;}
    if(!matches(existing,f.beforeSha256)){conflicts.push(f.path);continue;}
    changes.push({...f,dst,incoming,existing});
  }
  return {manifest:m,target,changes,skipped,conflicts};
}
export async function applyUpdate(packageRoot,targetRoot,{apply=false}={}) {
  const plan=await inspectUpdate(packageRoot,targetRoot);
  if(plan.conflicts.length)throw Error('CONFLICT: no files were written. Preserve your newer changes and merge manually:\n'+plan.conflicts.join('\n'));
  if(!apply||!plan.changes.length)return {...plan,applied:false,backup:null};
  const backupRoot=path.join(plan.target,'.update-backups');
  const st=await lstat(backupRoot).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
  if(st?.isSymbolicLink()||st&&!st.isDirectory())throw Error('Backup directory is not safe.');
  const backup=path.join(backupRoot,plan.manifest.release+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomBytes(3).toString('hex'));
  await mkdir(backup,{recursive:true});
  const records=[];
  for(const c of plan.changes){
    if(c.existing!==null){const dest=path.join(backup,'before',c.path);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,c.existing,{flag:'wx'});}
    records.push({path:c.path,beforeSha256:c.existing===null?null:sha256(c.existing),afterSha256:c.afterSha256});
  }
  await writeFile(path.join(backup,'applied.json'),JSON.stringify({schemaVersion:1,release:plan.manifest.release,files:records},null,2)+'\n');
  const written=[];
  try {
    for(const c of plan.changes){
      const dst=await safeFile(plan.target,c.path),now=await bytesOrNull(dst);
      if(!matches(now,c.beforeSha256))throw Error('File changed during apply: '+c.path);
      await mkdir(path.dirname(dst),{recursive:true});
      // Record before writing so an interrupted write is included in best-effort rollback.
      written.push(c);await writeFile(dst,c.incoming);
      if(sha256(await readFile(dst))!==c.afterSha256)throw Error('Post-write verification failed: '+c.path);
    }
  }catch(e){
    const failures=[];
    for(const c of written.reverse()){try{if(c.existing===null)await unlink(c.dst).catch(x=>{if(x.code!=='ENOENT')throw x;});else await writeFile(c.dst,c.existing);}catch{failures.push(c.path);}}
    throw Error(e.message+'\nRollback '+(failures.length?'needs manual recovery: '+failures.join(', '):'completed')+'\nBackup: '+backup);
  }
  return {...plan,applied:true,backup};
}
export async function restoreUpdate(backupDir,targetRoot,{apply=false}={}) {
  const backup=await realpath(backupDir),target=await realpath(targetRoot);
  const record=JSON.parse(await readFile(path.join(backup,'applied.json'),'utf8'));
  if(record.schemaVersion!==1||!Array.isArray(record.files))throw Error('Invalid backup record.');
  const changes=[],conflicts=[],seen=new Set();
  for(const f of record.files){
    if(!validPath(f.path)||seen.has(f.path))throw Error('Unsafe backup file.');seen.add(f.path);assertHash(f.beforeSha256,true);assertHash(f.afterSha256);
    const dst=await safeFile(target,f.path),now=await bytesOrNull(dst);
    let before=null;
    if(f.beforeSha256!==null){before=await readFile(await safeFile(path.join(backup,'before'),f.path));if(sha256(before)!==f.beforeSha256)throw Error('Backup corrupted: '+f.path);}
    if(matches(now,f.beforeSha256))continue;
    if(!matches(now,f.afterSha256)){conflicts.push(f.path);continue;}
    changes.push({path:f.path,dst,before,afterSha256:f.afterSha256});
  }
  if(conflicts.length)throw Error('RESTORE CONFLICT: no files were written. New edits must be preserved:\n'+conflicts.join('\n'));
  if(apply)for(const c of changes){
    await safeFile(target,c.path);
    if(!matches(await bytesOrNull(c.dst),c.afterSha256))throw Error('File changed during restore: '+c.path);
    if(c.before===null)await unlink(c.dst);else await writeFile(c.dst,c.before);
  }
  return {changes,applied:apply};
}
async function cli(){
  const args=process.argv.slice(2),opts={};
  for(let i=0;i<args.length;i++){
    if(args[i]==='--apply'||args[i]==='--check')opts[args[i].slice(2)]=true;
    else if(['--target','--package','--restore'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--'))opts[args[i].slice(2)]=args[++i];
    else throw Error('Usage: node apply-update.mjs --target PATH [--check|--apply] [--package PATH] [--restore BACKUP_DIR]');
  }
  if(!opts.target||opts.apply&&opts.check)throw Error('Provide --target and only one of --check / --apply. Default is check-only.');
  const dir=path.dirname(fileURLToPath(import.meta.url));
  const result=opts.restore?await restoreUpdate(opts.restore,opts.target,{apply:!!opts.apply}):await applyUpdate(opts.package||dir,opts.target,{apply:!!opts.apply});
  console.log(result.applied?'APPLIED locally. Nothing was committed or pushed.':'CHECK ONLY. No files were changed.');
  console.log('Files: '+result.changes.length);for(const c of result.changes)console.log('  '+c.path);
  if(result.skipped?.length)console.log('Already current: '+result.skipped.length);
  if(result.backup)console.log('Backup: '+result.backup);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))cli().catch(e=>{console.error(e.message);process.exitCode=1;});
