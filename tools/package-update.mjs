/** Text-only, explicit-allowlist ZIP builder. Never fetches, commits or pushes. */
import {readFile,writeFile,realpath,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {isUtf8} from 'node:buffer';
import {sha256,validPath} from './apply-update.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const enc=s=>Buffer.from(s,'utf8');
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(buf){let c=0xffffffff;for(const b of buf)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
/** Store-only ZIP, UTF-8 names, deterministic 1980-01-01 metadata; no ZIP64. */
export function makeZip(entries){
  const locals=[],centrals=[];let offset=0;
  for(const [name,value]of entries){
    const data=Buffer.isBuffer(value)?value:enc(value),nameBytes=enc(name);
    if(data.length>20*1024*1024||nameBytes.length>500)throw Error('ZIP entry too large.');
    const crc=crc32(data),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(nameBytes.length,26);
    locals.push(h,nameBytes,data);
    const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(nameBytes.length,28);c.writeUInt32LE(offset,42);centrals.push(c,nameBytes);offset+=h.length+nameBytes.length+data.length;
  }
  const cd=Buffer.concat(centrals),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,cd,end]);
}
export async function readAllowlist(root=ROOT){
  const lines=(await readFile(path.join(root,'collab/delivery-files.txt'),'utf8')).split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
  if(!lines.length||new Set(lines).size!==lines.length||lines.some(p=>!validPath(p)))throw Error('Invalid or duplicate delivery allowlist entries.');
  return lines;
}
async function readText(root,p){
  if(!validPath(p))throw Error('Unsafe delivery path: '+p);
  let current=root;for(const part of p.split('/')){current=path.join(current,part);if((await lstat(current)).isSymbolicLink())throw Error('Do not package symlinks: '+p);}
  const b=await readFile(current);if(!isUtf8(b)||b.includes(0)||b.length>2*1024*1024)throw Error('Delivery supports UTF-8 text files up to 2 MB only: '+p);
  return b;
}
export async function assembleUpdate(root,{baseCommit,oldFiles,paths,release,repository},outFile){
  root=await realpath(root);const out=path.resolve(outFile);
  // Resolve the destination directory too, so an output symlink cannot hide inside the repo.
  const outParent=await realpath(path.dirname(out));
  if(outParent===root||outParent.startsWith(root+path.sep))throw Error('Write the delivery ZIP outside the source repository.');
  if(!/\.zip$/i.test(out)||!/^[a-f0-9]{40}$/.test(baseCommit)||!/^collab-[\w.-]+$/.test(release)||!/^\w[\w.-]*\/[\w.-]+$/.test(repository))throw Error('Invalid package metadata.');
  if(!Array.isArray(paths)||!paths.length||paths.length>1000||new Set(paths).size!==paths.length)throw Error('Invalid delivery paths.');
  const files=[],payload=[];
  for(const p of paths){
    if(!Object.hasOwn(oldFiles,p))throw Error('Baseline not established: '+p);
    const bytes=await readText(root,p),before=oldFiles[p];
    if(before!==null&&!Buffer.isBuffer(before))throw Error('Baseline must be Buffer or null: '+p);
    if(before!==null&&sha256(before)===sha256(bytes))continue;
    files.push({path:p,beforeSha256:before===null?null:sha256(before),afterSha256:sha256(bytes)});payload.push(['repo/'+p,bytes]);
  }
  if(!files.length)throw Error('No changed allowlisted files.');
  const manifest={schemaVersion:1,release,repository,baseCommit,description:'Text-only local overlay. Missing assets are preserved in the target. No remote operations.',files};
  const readme=`混合马里奥协作更新包 ${release}\n\n这是增量包，不是整站备份或游戏离线包。必须应用到你自己的完整仓库副本；不包含字体、游戏素材或下载包。\n源代码参考基线：${baseCommit}\n改动文件：${files.length} 个。\n\n1. 解压到现有仓库之外的文件夹，安装 Node.js 22 或更高版本。\n2. 在本更新包目录打开终端。先检查（路径改成你的仓库位置）：\n   node apply-update.mjs --target "D:\\Projects\\Aha-xiaoQ.github.io" --check\n3. 无冲突后应用：\n   node apply-update.mjs --target "D:\\Projects\\Aha-xiaoQ.github.io" --apply\n4. 进入原仓库目录，运行 npm run check 和 npm test，再 npm run doctor。\n5. 运行 npm run dev，浏览器打开 http://127.0.0.1:4173/dev/ 。\n6. 审阅 diff；通过 GitHub Desktop 或自己的 Git 命令手动提交、推送。\n\n冲突时工具停止，不会强制覆盖。请保留新文件，做逐项合并；不要删除你的 .git 或整站文件夹。\n应用前的原文自动保存在目标仓库 .update-backups/ 下；回退只操作本包文件，拒绝覆盖后续新改动。\n回退先检查：node apply-update.mjs --target "你的仓库路径" --restore "备份目录绝对路径" --check\n确认后把 --check 改为 --apply。\n\n续接入口：AGENTS.md、docs/collab/HANDOFF.md、collab/project.json、docs/collab/VALIDATION.md。\n查看具体安装、发布和回退方式：repo/docs/collab/RELEASE_WORKFLOW.md。\n在线开发中心只是展示与本地草稿工具，不是 GitHub 后台。导出后仍需校验、提交和推送。\n本轮不修改线上权限，不创建远端 Issue，不自动发布。查看完整未验证项：VALIDATION.md。\n`;
  const manifestText=JSON.stringify(manifest,null,2)+'\n';
  const entries=[['START_HERE.txt',readme],['manifest.json',manifestText],['apply-update.mjs',await readText(root,'tools/apply-update.mjs')],...payload];
  const zip=makeZip(entries);await writeFile(out,zip,{flag:'wx'});
  return {manifest,bytes:zip.length,sha256:sha256(zip),out};
}
function git(root,args){const r=spawnSync('git',['-C',root,...args],{encoding:null,maxBuffer:16*1024*1024});if(r.error)throw r.error;if(r.status!==0)throw Error('Git read failed: '+args.join(' ')+'\n'+r.stderr.toString('utf8'));return r.stdout;}
export async function packFromGit(root,baseCommit,out){
  if(!/^[a-f0-9]{40}$/.test(baseCommit))throw Error('Use an explicit 40-character baseline commit, not a moving branch name.');
  git(root,['cat-file','-e',baseCommit+'^{commit}']);
  const paths=await readAllowlist(root),oldFiles={};
  const tree=git(root,['ls-tree','-r','--name-only','-z',baseCommit]).toString('utf8').split('\0'),existing=new Set(tree);
  for(const p of paths)oldFiles[p]=existing.has(p)?git(root,['show',baseCommit+':'+p]):null;
  const project=JSON.parse(await readFile(path.join(root,'collab/project.json'),'utf8'));
  return assembleUpdate(root,{baseCommit,oldFiles,paths,release:project.release,repository:project.repository},out);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=='--base'||args[2]!=='--out'){console.error('Usage: npm run collab:pack -- --base FULL_COMMIT_SHA --out ../update.zip');process.exitCode=1;}
  else packFromGit(ROOT,args[1],args[3]).then(r=>console.log(`Created ${r.out}\nFiles: ${r.manifest.files.length}\nSHA-256: ${r.sha256}\nNo commit or push was performed.`)).catch(e=>{console.error(e.message);process.exitCode=1;});
}
