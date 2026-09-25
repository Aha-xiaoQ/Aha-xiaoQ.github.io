/** Fingerprint tracked and nonignored workspace inputs, without reading Git credentials. */
import {spawnSync}from'node:child_process';import{createHash}from'node:crypto';
import{readOptional}from'../lib/safe-path.mjs';
export function git(root,args,{binary=false}={}){
 const result=spawnSync(process.env.XIAOQ_GIT||'git',args,{cwd:root,encoding:binary?undefined:'utf8',shell:false,windowsHide:true,maxBuffer:256*1024*1024,timeout:30000});
 if(result.error||result.status!==0)throw Error(result.error?.message||String(result.stderr)||'Git read failed');return result.stdout;
}
export function sourceFiles(root){
 const rows=git(root,['ls-files','--cached','--others','--exclude-standard','-z']).split('\0').filter(Boolean);
 const files=[...new Set(rows)].filter(p=>!p.startsWith('.local/')).sort();if(!files.length)throw Error('No Git workspace inputs');return files;
}
export function sourceFingerprint(root){
 const hash=createHash('sha256');let bytes=0;const files=sourceFiles(root);
 for(const p of files){const b=readOptional(root,p);hash.update(p+'\0');if(b){bytes+=b.length;hash.update(createHash('sha256').update(b).digest('hex'));}else hash.update('deleted');hash.update('\0');}
 return{sha256:hash.digest('hex'),files:files.length,bytes};
}
