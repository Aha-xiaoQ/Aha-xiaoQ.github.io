import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {safe as safePath} from './safe-path.mjs';
export function assertSameHead(expected, actual) {
  if (!/^[0-9a-f]{40}$/.test(expected) || actual !== expected) throw Error('远端 main 已有新提交。本次不推送；请重新运行，重新校验后再推送。');
}
/** A successful local check never stands in for a successful remote push. */
export function summarizeRuns(runs, sha) {
  const latest = new Map();
  for (const r of runs) {
    if (r.head_sha !== sha) continue;
    if (!latest.has(r.name) || r.id > latest.get(r.name).id) latest.set(r.name, r);
  }
  const required = ['Collaboration checks', 'Website platform regression'];
  const ci = required.map(n => latest.get(n));
  const failed = [...latest.values()].filter(r => r.status === 'completed' && !['success', 'skipped', 'neutral'].includes(r.conclusion));
  return {
    failed,
    ciPassed: ci.every(r => r?.status === 'completed' && r.conclusion === 'success'),
    pages: latest.get('pages build and deployment') || null,
    rows: [...latest.values()].map(r => ({name:r.name, status:r.status, conclusion:r.conclusion, url:r.html_url}))
  };
}
let gitConfigFile;
/**
 * Git needs a regular config file, not a Windows null-device path.
 * Keep it in this run's workspace so gh may write helper settings without
 * touching the user's ~/.gitconfig or the integrity-checked package.
 */
export function initializeGitConfig(directory) {
  if (gitConfigFile) throw Error('本进程的独立 Git 配置已初始化。');
  const filename = safePath(directory, 'isolated.gitconfig');
  const fd = fs.openSync(filename, 'wx', 0o600);
  try { fs.writeFileSync(fd, '# Temporary Git configuration for this updater run only.\n', 'utf8'); }
  finally { fs.closeSync(fd); }
  gitConfigFile = filename;
  return filename;
}
function isolatedConfig() {
  if (!gitConfigFile) {
    // Standalone helper tests also get isolation; no writes to the bundle/home.
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'xiaoq-e04-git-'));
    initializeGitConfig(directory);
    process.once('exit', () => {
      try { fs.rmSync(directory, {recursive:true, force:true}); } catch { /* best effort */ }
    });
  }
  // Do not silently fall back to real user configuration if this file vanishes.
  const filename = safePath(path.dirname(gitConfigFile), path.basename(gitConfigFile));
  const stat = fs.lstatSync(filename);
  if (!stat.isFile() || stat.nlink !== 1) throw Error('独立 Git 配置不是安全的普通文件。');
  return filename;
}
export function childEnvironment(extra = {}) {
  const e = {...process.env, ...extra};
  // Case-insensitive removal matters on Windows. Do not reintroduce Git
  // overrides or access tokens via the caller's extra environment either.
  for (const k of Object.keys(e)) if (/^(?:GIT_.*|GH_TOKEN|GITHUB_TOKEN|GH_ENTERPRISE_TOKEN|GITHUB_ENTERPRISE_TOKEN|GH_HOST|GH_PAGER)$/i.test(k)) delete e[k];
  return {...e, GIT_CONFIG_GLOBAL:isolatedConfig(), GIT_CONFIG_NOSYSTEM:'1', GIT_TERMINAL_PROMPT:'0', GH_HOST:'github.com', GH_PAGER:'cat'};
}
export async function run(command, args = [], options = {}) {
  const {cwd, logFile, capture = false, interactive = false, allowFailure = false, heartbeat = false, timeoutMs = 0, env = {}} = options;
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd, env:childEnvironment(env), shell:false, windowsHide:!interactive, stdio:interactive?'inherit':['ignore','pipe','pipe']});
    let out = '', err = '', finished = false;
    const stream = logFile ? fs.createWriteStream(logFile, {flags:'a'}) : null;
    const collect = (s, isErr) => {
      const text = s.toString('utf8');
      if (isErr) err = (err + text).slice(-4*1024*1024); else out = (out + text).slice(-32*1024*1024);
      if (stream) stream.write(s);
      if (!capture && !stream) (isErr ? process.stderr : process.stdout).write(s);
    };
    if (!interactive) {
      // Preserve Chinese/Unicode text even when a UTF-8 code point spans two pipe chunks.
      child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
      child.stdout.on('data', s => collect(s,false)); child.stderr.on('data',s => collect(s,true));
    }
    const pulse = heartbeat ? setInterval(()=>console.log('  校验仍在运行，详细输出已写入本次日志。'),20000) : null;
    const timer = timeoutMs ? setTimeout(()=>{child.kill();},timeoutMs) : null;
    const finish = (error, code) => {
      if (finished) return; finished=true;
      if (pulse) clearInterval(pulse); if (timer) clearTimeout(timer); if (stream) stream.end();
      if (error) return reject(error);
      if (code !== 0 && !allowFailure) return reject(Error(`${path.basename(command)} 执行失败（${code ?? '终止'}）。${logFile?'\n日志：'+logFile:''}\n${(err || out).split('\n').slice(-20).join('\n')}`));
      resolve({code, stdout:out, stderr:err});
    };
    child.on('error',e=>finish(e,null)); child.on('close',code=>finish(null,code));
  });
}

/** Reclaim only a well-formed lock whose owner is definitely no longer running. */
export function acquireRunLock(home){
 const name=safePath(home,'running.lock');
 try{const fd=fs.openSync(name,'wx');fs.writeFileSync(fd,JSON.stringify({pid:process.pid,time:new Date().toISOString()}));return fd;}
 catch(e){if(e.code!=='EEXIST')throw e;}
 const old=fs.readFileSync(safePath(home,'running.lock')),state=JSON.parse(old);
 if(!Number.isInteger(state.pid)||state.pid<=0)throw Error('运行锁内容异常，请保留文件并联系维护者。');
 let dead=false;try{process.kill(state.pid,0);}catch(e){if(e.code==='ESRCH')dead=true;}
 if(!dead)throw Object.assign(Error('另一个更新进程仍在运行，请等待该窗口完成。'),{code:'EEXIST'});
 if(!fs.readFileSync(safePath(home,'running.lock')).equals(old))throw Error('运行锁在检查期间改变，停止。');
 fs.unlinkSync(name);
 const fd=fs.openSync(name,'wx');fs.writeFileSync(fd,JSON.stringify({pid:process.pid,time:new Date().toISOString()}));return fd;
}
