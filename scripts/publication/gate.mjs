#!/usr/bin/env node
/** An explicit, artifact-bound human review, never an automatically approved file. */
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
import{ROOT,checkPublication}from'./build.mjs';import{exactRead,safe,json}from'./paths.mjs';
export const REVIEW='.local/release-r24/acceptance.json';
export const REQUIRED=['desktop-and-mobile','keyboard-and-navigation','real-network-and-resources','public-copy-and-versions','downloads','released-games','rights-and-credits'];
export function reviewTemplate(report){return{schemaVersion:1,edition:'R24',artifactFingerprint:report.fingerprint,sourceFingerprint:report.sourceFingerprint,status:'pending',reviewer:'',reviewedAt:'',warningsReviewed:false,checks:Object.fromEntries(REQUIRED.map(k=>[k,{result:'pending',evidence:''}]))};}
export function evaluateGate(report,review){const errors=[];
 if(report.errors.length)errors.push('发布目录存在阻断问题。');
 if(!review||review.schemaVersion!==1||review.edition!=='R24')return [...errors,'没有当前发布审阅记录。'];
 if(review.artifactFingerprint!==report.fingerprint||review.sourceFingerprint!==report.sourceFingerprint)errors.push('审阅记录不属于此版本的源码与产物。');
 if(review.status!=='approved'||typeof review.reviewer!=='string'||!review.reviewer.trim())errors.push('需要审阅人明确批准。');
 if(!/^\d{4}-\d\d-\d\d(?:T.*)?$/.test(review.reviewedAt||'')||!Number.isFinite(Date.parse(review.reviewedAt)))errors.push('需要有效的审阅日期。');
 if(report.warnings.length&&!review.warningsReviewed)errors.push('还有未审阅的提醒。');
 for(const key of REQUIRED){const check=review.checks?.[key];if(check?.result!=='passed'||typeof check.evidence!=='string'||check.evidence.trim().length<8||/^(?:pending|todo|待填写|待验收|测试占位)/i.test(check.evidence))errors.push('缺少验收依据：'+key);}
 return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
 const args=process.argv.slice(2);if(args.length>1||(args[0]&&!['--init','--ci-record'].includes(args[0])))throw Error('用法：node scripts/publication/gate.mjs [--init | --ci-record]');
 const report=await checkPublication(ROOT);
 if(args[0]==='--init'){if(report.errors.length)throw Error('先完成 release:prepare 和 release:check；不为缺失产物生成审批。');if(exactRead(ROOT,REVIEW))throw Error('已存在审阅记录，未覆盖。');const file=safe(ROOT,REVIEW);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,json(reviewTemplate(report)),{flag:'wx'});console.log('已建立待填写记录：'+REVIEW);}
 else{const bytes=exactRead(ROOT,args[0]==='--ci-record'?'.github/publication-approval.json':REVIEW),errors=evaluateGate(report,bytes?JSON.parse(bytes):null);if(errors.length)throw Error(errors.join('\n'));console.log('审阅记录与当前产物一致。未执行上传或部署。');}
}catch(e){console.error(e.message);process.exitCode=1;}
