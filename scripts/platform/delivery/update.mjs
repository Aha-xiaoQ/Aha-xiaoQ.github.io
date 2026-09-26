#!/usr/bin/env node
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';import {randomUUID}from'node:crypto';
import {load,plan,apply,verify,assertScope,REPOSITORY,BRANCH,REMOTE}from'./lib/install.mjs';
import {run,assertSameHead,summarizeRuns,acquireRunLock,initializeGitConfig}from'./lib/process.mjs';
import {stageAndCheck} from './lib/git-stage.mjs';
const bundle=path.dirname(fileURLToPath(import.meta.url));const options=process.argv.slice(2);
if(options.length!==1||!['--push','--check-only'].includes(options[0])){console.error('请从 START.cmd 或 CHECK_ONLY.cmd 启动');process.exit(2);}
const push=options[0]==='--push',git=process.env.XIAOQ_GIT||'git',gh=process.env.XIAOQ_GH||'gh',npmCli=process.env.XIAOQ_NPM_CLI;
const home=path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'.local/share'),'PixelWorkshop-Platform');fs.mkdirSync(home,{recursive:true});
const lockPath=path.join(home,'running.lock');let lock,work,pushed=false,pushAttempted=false,logCount=0;
const report={package:'SITE-PLATFORM',updater:'platform-delivery-v1',repository:REPOSITORY,branch:BRANCH,startedAt:new Date().toISOString(),pushed:false,ci:'not-run',deployment:'unconfirmed',steps:[]};
const gitOptions=['-c','credential.helper=','-c','credential.https://github.com.helper=!gh auth git-credential','-c','protocol.ext.allow=never','-c','protocol.file.allow=never','-c','core.autocrlf=false'];
function say(s){console.log('\n'+s);}
function reportSave(){if(work){fs.writeFileSync(path.join(work,'result.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(home,'last-run.json'),JSON.stringify({...report,workspace:work},null,2)+'\n');}}
async function g(args,opts={}){return run(git,[...gitOptions,...args],{cwd:work?path.join(work,'repo'):bundle,...opts});}
async function api(endpoint) {
  const result = await run(gh,['api',endpoint,'--hostname','github.com'],{capture:true});
  return JSON.parse(result.stdout);
}
async function login() {
  const help=await run(gh,['auth','login','--help'],{capture:true,allowFailure:true});
  const args=['auth','login','--hostname','github.com','--git-protocol','https','--web'];
  if(help.stdout.includes('--clipboard'))args.push('--clipboard');
  await run(gh,args,{interactive:true});
}
async function userIdentity() {
  let status = await run(gh,['auth','status','--hostname','github.com'],{capture:true,allowFailure:true});
  if (status.code !== 0) {
    say('请在 GitHub 官方登录页完成授权。设备验证码会显示在当前窗口的 First copy your one-time code 一行；复制该码，在浏览器填写并授权，保持此窗口开启。');
    await login();
  }
  let user = await api('user');
  if (user.login.toLowerCase() !== 'aha-xiaoq') {
    const switched = await run(gh,['auth','switch','--hostname','github.com','--user','Aha-xiaoQ'],{capture:true,allowFailure:true});
    if (switched.code !== 0) {
      say('当前 CLI 账户不是 Aha-xiaoQ。请在下面的官方登录流程中选择仓库所有者账户。');
      await login();
    }
    user = await api('user');
  }
  if (user.login.toLowerCase() !== 'aha-xiaoq' || !Number.isSafeInteger(user.id)) throw Error('登录账户不匹配，未执行推送。需要 Aha-xiaoQ 账户。');
  return {login:user.login,id:user.id,name:user.name || user.login};
}
async function changedPaths() {
  const {stdout} = await g(['status','--porcelain=v1','-z','--untracked-files=all'],{capture:true});
  return stdout.split('\0').filter(Boolean).map(s=>{
    if (/[RCU]/.test(s.slice(0,2))) throw Error('出现重命名、复制或未合并文件，未推送。');
    return s.slice(3);
  });
}
async function validateStaging(manifest, label) {
  const paths = await changedPaths();
  say(label+'：Git 暂存与空白检查 ...');
  const log = path.join(work, `${String(++logCount).padStart(2,'0')}-git-diff-check.log`);
  const started = Date.now();
  const staged = await stageAndCheck(g, paths, manifest, {
    repositoryRoot: path.join(work, 'repo'),
    pathspecFile:path.join(work,'stage-paths.txt'), logFile:log
  });
  report.steps.push({command:'git diff --cached --check',phase:label,result:'passed',
    stagedFiles:staged.length,durationSeconds:Math.round((Date.now()-started)/1000)});
  report.stagedFiles=staged;reportSave();
  console.log('  Git 暂存与空白检查通过（'+staged.length+' 个文件）。');
}
async function validateRepository() {
  const cwd=path.join(work,'repo'),log=path.join(work,'platform-verify.log');
  say('运行统一检查：npm run platform:verify。构建、源码测试、发布产物和浏览器检查由仓库内的同一流程定义。');
  await run(process.execPath,[npmCli,'run','platform:verify'],{cwd,logFile:log,heartbeat:true});
  const result=JSON.parse(fs.readFileSync(path.join(cwd,'.local/platform/latest.json'),'utf8'));
  if(!result.ok||!result.protectedArtifactsUnchanged)throw Error('平台检查没有返回成功记录，禁止推送。');
  report.platform=result;report.steps.push({command:'npm run platform:verify',result:'passed',log});reportSave();
}
async function watchCI(commit) {
  say('提交已写入 GitHub。正在检查这次提交对应的自动检查和 Pages 部署，不会重新运行旧任务。');
  const deadline = Date.now() + 12*60*1000;
  let last = '', ciPassedAt = 0;
  while (Date.now() < deadline) {
    const response = await api(`repos/${REPOSITORY}/actions/runs?head_sha=${commit}&per_page=100`);
    const state = summarizeRuns(response.workflow_runs || [],commit);
    report.runs = state.rows;
    const text = state.rows.map(r=>`${r.name}: ${r.conclusion || r.status}`).join('\n');
    if (text !== last) { console.log(text || '等待 GitHub 登记本次工作流 ...'); last=text; }
    if (state.failed.length) {
      report.ci = state.ciPassed ? 'passed':'failed-or-incomplete';
      report.deployment = state.pages?.conclusion || 'unconfirmed';
      reportSave(); throw Error('提交已推送，但 GitHub 有工作流失败。已保留提交；请查看 Actions，不会自动回退或强推。');
    }
    if (state.ciPassed) {
      report.ci='passed'; if (!ciPassedAt) ciPassedAt=Date.now();
      if (state.pages?.status === 'completed' && state.pages.conclusion === 'success') {
        report.deployment='pages-workflow-success'; reportSave();
        say('GitHub 自动检查通过，Pages 部署工作流成功。页面访问与真实游戏体验仍需在浏览器确认。'); return;
      }
      if (!state.pages && Date.now()-ciPassedAt > 30000) {
        report.deployment='not-observed'; reportSave();
        say('GitHub 自动检查通过；未观察到 Pages 部署任务，未改动仓库的 Pages 设置。'); return;
      }
    }
    reportSave(); await new Promise(resolve=>setTimeout(resolve,5000));
  }
  report.ci = report.ci === 'passed' ? 'passed':'pending-or-unconfirmed';
  reportSave(); say('提交已推送。等待检查达到本次上限；未完成的 CI/部署状态请在 Actions 页面查看。');
}
try{
 if(!npmCli||!fs.statSync(npmCli).isFile())throw Error('找不到 npm-cli.js，请从 START.cmd 启动');
 if(Number(process.versions.node.split('.')[0])<22)throw Error('需要 Node.js 22 或以上');
 const manifest=load(bundle);report.package=manifest.edition;lock=acquireRunLock(home);
 work=path.join(home,'run-'+new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14)+'-'+randomUUID().slice(0,8));fs.mkdirSync(work);report.workspace=work;reportSave();
 say('目标：'+REPOSITORY+' / main\n更新网站平台、语言与内容；保留已登记的原始作品、游戏和素材。\n独立工作区：'+work);
 report.gitConfigFile=initializeGitConfig(work);reportSave();
 say('检查 Git 配置兼容性 ...');
 const gitVersion=(await run(git,['--version'],{cwd:work,capture:true})).stdout.trim();
 await run(git,['config','--global','--list','--show-origin'],{cwd:work,logFile:path.join(work,'git-config-check.log')});
 report.gitVersion=gitVersion;report.steps.push({command:'git config --global --list --show-origin',result:'passed'});reportSave();
 console.log('  Git 配置预检通过；使用本次工作区内的普通配置文件，不修改个人 Git 配置。');
 const user=push?await userIdentity():null;
 if(push){const meta=await api('repos/'+REPOSITORY);if(meta.full_name.toLowerCase()!==REPOSITORY.toLowerCase()||meta.default_branch!==BRANCH||meta.archived||!meta.permissions?.push)throw Error('仓库或写入权限不匹配');report.account=user.login;}
 say('拉取最新 main；不使用或覆盖你现有的本地工程 ...');
 await run(git,[...gitOptions,'clone','--depth=1','--single-branch','--branch',BRANCH,REMOTE,path.join(work,'repo')],{cwd:work,logFile:path.join(work,'clone.log'),heartbeat:true});
 if((await g(['remote','get-url','origin'],{capture:true})).stdout.trim()!==REMOTE)throw Error('远端地址不匹配');
 const startHead=(await g(['rev-parse','HEAD'],{capture:true})).stdout.trim();report.startHead=startHead;
 if((await changedPaths()).length)throw Error('刚克隆的工作区不干净');
 if(startHead!==manifest.baselineCommit)throw Error('远端 main 已变化。本包只适用 '+manifest.baselineCommit.slice(0,7)+'；实际为 '+startHead.slice(0,7)+'。没有应用补丁，请使用重新对齐后的更新包。');
 const root=path.join(work,'repo'),changes=plan(root,bundle,manifest);report.changed=changes.map(c=>c.path);
 if(!changes.length){report.status='already-applied';say('没有需要重复应用的更新。');}
 else{
  apply(root,changes);say('更新已应用到独立工作区。开始生成页面和检查 ...');
  // Shared gates: CHECK_ONLY must exercise the same staged diff as PUSH.
  await validateStaging(manifest,'构建前预检');
  await validateRepository();verify(root,manifest,bundle);
  await validateStaging(manifest,'构建后复检');
  if(!push){report.status='verified-not-pushed';say('源码、发布及 Git 暂存检查通过，预览模式未提交、未推送。');}
  else{
   assertSameHead(startHead,(await g(['ls-remote','origin','refs/heads/'+BRANCH],{capture:true})).stdout.trim().split(/\s+/)[0]);
   await g(['config','--local','user.name',user.name],{capture:true});await g(['config','--local','user.email',user.id+'+'+user.login+'@users.noreply.github.com'],{capture:true});
   await g(['commit','-m',manifest.message],{logFile:path.join(work,'commit.log')});
   report.commit=(await g(['rev-parse','HEAD'],{capture:true})).stdout.trim();reportSave();
   if((await changedPaths()).length)throw Error('提交后出现额外改动，未推送');
   assertSameHead(startHead,(await g(['ls-remote','origin','refs/heads/'+BRANCH],{capture:true})).stdout.trim().split(/\s+/)[0]);
   pushAttempted=true;report.pushAttempted=true;reportSave();say('检查通过，正在普通推送本次网站更新 ...');
   await g(['push','--porcelain','origin','HEAD:refs/heads/'+BRANCH],{logFile:path.join(work,'push.log')});
   pushed=true;report.pushed=true;report.status='pushed';report.commitUrl='https://github.com/'+REPOSITORY+'/commit/'+report.commit;reportSave();say('代码推送成功：'+report.commitUrl);
   await watchCI(report.commit);
   say('网站：https://aha-xiaoq.github.io/\n开发资料：https://aha-xiaoq.github.io/notes/');
  }
 }
 report.finishedAt=new Date().toISOString();reportSave();say('结果与日志：'+path.join(work,'result.json'));
}catch(e){report.status=pushed?'pushed-with-followup-needed':pushAttempted?'push-outcome-unconfirmed':'stopped';report.error=e.message;report.finishedAt=new Date().toISOString();reportSave();console.error('\n'+(pushed?'代码已推送，后续检查未全部完成。':pushAttempted?'推送结果待确认，请查看 GitHub。':'已停止，尚未进行远端推送。')+'\n'+e.message);if(work)console.error('日志：'+work);process.exitCode=1;}
finally{if(lock!==undefined){try{fs.closeSync(lock);fs.unlinkSync(lockPath);}catch{}}}
