/** Parse JavaScript without executing it or following module imports. */
import vm from'node:vm';import{spawnSync}from'node:child_process';import{sha}from'./paths.mjs';
const checked=new Map();
export function checkSyntax(files){const errors=[];let count=0;
 for(const [p,b]of files){if(!/\.(?:mjs|js)$/.test(p))continue;count++;const s=b.toString(),module=p.endsWith('.mjs')||/(?:^|\n)\s*(?:export|import)\s+(?!\()/m.test(s),key=(module?'m:':'c:')+sha(b);let failure=checked.get(key);
  if(!checked.has(key)){failure=null;try{if(module){const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:s,encoding:'utf8',timeout:10000,maxBuffer:256*1024});if(r.error||r.status!==0)throw Error(r.error?.message||r.stderr.split('\n').filter(l=>/SyntaxError/.test(l)).join(' ')||'module syntax check failed');}else new vm.Script(s,{filename:p});}catch(e){failure=e.message;}checked.set(key,failure);}
  if(failure)errors.push({file:p,problem:'javascript-syntax',detail:failure});
 }return{files:count,errors};
}
