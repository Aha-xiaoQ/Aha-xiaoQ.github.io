/** Concise diagnostics for the current failed run. Never alters a gate or its exit code. */
import {readOptional} from '../lib/safe-path.mjs';
const text=value=>String(value??'').replace(/[\x00-\x1f\x7f]/g,' ').slice(0,260);
export function failedSteps(report){
 return (report?.phases||[]).flatMap(p=>Array.isArray(p.results)?p.results:[]).filter(s=>s.status==='failed');
}
export function readFailureDetails(root,report){
 const details={},failed=new Set(failedSteps(report).map(s=>s.id));
 const start=Date.parse(report?.startedAt),end=Date.parse(report?.finishedAt);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)return details;
 for(const[id,file]of [['browser-artifact','.local/platform/browser-report.json'],['browser-components','.local/platform/browser-components.json']]){
  if(!failed.has(id))continue;
  try{
   const bytes=readOptional(root,file);if(!bytes||bytes.length>8*1024*1024)continue;
   const candidate=JSON.parse(bytes),finished=Date.parse(candidate.finishedAt);
   if(!Number.isFinite(finished)||finished<start||finished>end||candidate.ok!==false||!Array.isArray(candidate.errors))continue;
   // A report from a previous attempt is not evidence for this run.
   if(candidate.startedAt&&(Date.parse(candidate.startedAt)<start||!Number.isFinite(Date.parse(candidate.startedAt))))continue;
   details[id]=candidate;
  }catch{/* The failing step's own log remains the fallback. */}
 }
 return details;
}
export function failureSummary(report,details={}){
 if(report?.ok!==false)return [];
 const lines=['','=== 校验失败摘要 ==='];
 if(report.error)lines.push('流程错误：'+text(report.error));
 const failed=failedSteps(report);
 if(failed.length)lines.push('失败步骤：'+failed.map(s=>text(s.id)).join(', '));
 const diagnostics=[];
 for(const step of failed){
  const errors=details[step.id]?.errors;
  if(Array.isArray(errors))for(const e of errors){
   const place=[e.page,e.language,e.width?`${e.width}px`:null].filter(Boolean).map(text).join(' / ');
   const issue=text(e.problem||e.name||'browser failure');
   const detail=e.detail||e.error|| (Array.isArray(e.samples)?e.samples.map(text).join('；'):'');
   diagnostics.push((place?place+': ':'')+issue+(detail?' — '+text(detail):''));
  }
 }
 lines.push(...diagnostics.slice(0,6));
 if(diagnostics.length>6)lines.push(`另有 ${diagnostics.length-6} 项诊断，见各步骤日志。`);
 for(const step of failed.slice(0,3)){
  if(step.error)lines.push(text(step.id)+'：'+text(step.error));
  if(step.log)lines.push('日志：'+text(step.log));
 }
 const blocked=(report.phases||[]).flatMap(p=>p.results||[]).filter(s=>s.status==='blocked').length;
 if(blocked)lines.push(`后续 ${blocked} 项检查因依赖失败未运行。`);
 lines.push('未通过的检查未被跳过；本次验证没有执行提交或推送。');
 return lines;
}
