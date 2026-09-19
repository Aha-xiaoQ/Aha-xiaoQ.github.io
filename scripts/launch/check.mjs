#!/usr/bin/env node
/** Local checks are not usability certification or permission to publish. */
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {build,ROOT,RECORD} from './build.mjs';import {readOptional,safe} from '../lib/safe-path.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function localReference(page,raw){
  if(!raw||/^(?:mailto:|tel:|data:|javascript:)/i.test(raw))return null;
  try{const u=new URL(raw,'https://local.test/'+page);if(u.origin!=='https://local.test')return null;const pathname=decodeURIComponent(u.pathname);if(pathname.includes('\\')||pathname.includes('\0'))throw Error('Invalid path');return {path:pathname.replace(/^\//,'')+(pathname.endsWith('/')?'index.html':''),fragment:decodeURIComponent(u.hash.slice(1))};}catch{return {error:'invalid-reference',value:raw};}
}
function recordedPages(root){
 const paths=new Set(['index.html']);
 for(const record of ['docs/development/generated-pages.json','docs/design-r07/generated-pages.json','docs/experience-r18/generated-files.json',RECORD]){
  const b=readOptional(root,record);if(!b)throw Error('缺少生成清单：'+record);
  for(const p of Object.keys(JSON.parse(b).files||{}))if(p.endsWith('.html'))paths.add(p);
 }return [...paths].sort();
}
export function audit(root=ROOT){
 const errors=[],warnings=[],pages=recordedPages(root),inventory={};
 for(const page of pages){
  const b=readOptional(root,page);if(!b){errors.push({page,problem:'missing-page'});continue;}
  const html=b.toString();inventory[page]=hash(b);
  for(const [name,re] of [['main',/<main\b/g],['h1',/<h1\b/g]])if((html.match(re)||[]).length!==1)errors.push({page,problem:'non-unique-'+name});
  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);if(new Set(ids).size!==ids.length)errors.push({page,problem:'duplicate-id'});
  for(const m of html.matchAll(/<(?:a|img|script|link)\b[^>]*\b(?:href|src)=["']([^"']+)["'][^>]*>/g)){
   const ref=localReference(page,m[1]);if(!ref)continue;if(ref.error){errors.push({page,...ref});continue;}
   let target;try{target=readOptional(root,ref.path);}catch(e){errors.push({page,target:ref.path,problem:'unsafe-or-unreadable-reference'});continue;}
   if(!target){errors.push({page,target:ref.path,problem:'missing-local-reference'});continue;}
   inventory[ref.path]=hash(target);
   if(ref.fragment&&ref.path.endsWith('.html')){const targetIds=[...target.toString().matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);if(!targetIds.includes(ref.fragment))errors.push({page,target:ref.path+'#'+ref.fragment,problem:'missing-anchor'});}
   if(/\.(png|jpe?g|webp)(?:[?#]|$)/i.test(m[1])&&target.length>600*1024)warnings.push({page,target:ref.path,bytes:target.length,problem:'large-image-review'});
  }
 }
 const digest=hash(Buffer.from(JSON.stringify(Object.entries(inventory).sort(([a],[b])=>a.localeCompare(b)))));
 return {schemaVersion:1,scope:'local-generated-pages-and-direct-local-references',pages:pages.length,checkedFiles:Object.keys(inventory).length,fingerprint:digest,errors,warnings,networkChecked:false,releaseApproved:false};
}
export const REQUIRED=['desktop-browser','mobile-touch','keyboard-and-reader','slow-network-recovery','natural-game-run','download-and-version','rights-and-content'];
function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;}
export function review(auditResult,evidence){
 const errors=[...auditResult.errors.map(e=>'local: '+e.problem+' '+e.page)];
 if(evidence?.schemaVersion!==1||evidence.fingerprint!==auditResult.fingerprint)errors.push('验收记录没有绑定当前文件指纹');
 for(const id of REQUIRED){const c=evidence?.checks?.[id];if(c?.status!=='passed'||typeof c.by!=='string'||!c.by.trim()||!validDate(c.date)||typeof c.evidence!=='string'||!c.evidence.trim())errors.push('待人工验收：'+id);}
 return {ready:errors.length===0,errors,warning:'脚本只能检查记录是否齐全，不核验人工证据真伪，也不执行发布。'};
}
export async function check(root=ROOT){
 const generated=await build(root,{check:true});
 const helper=readOptional(root,'assets/launch/journey.js').toString();
 if(!helper.includes("action('开始试玩', play, true)"))throw Error('缺少明确的首要试玩操作');
 const fallback=readOptional(root,'404.html').toString();if(!fallback.includes('noindex, follow')||!fallback.includes('data-recovery-page'))throw Error('404恢复页不完整');
 return {generated,releaseApproved:false,scope:'local-generated-structure-only'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2);if(args[0]==='--audit'||args[0]==='--gate'){
  const r=audit(ROOT);console.log(JSON.stringify(r,null,2));
  if(args[0]==='--gate'){const i=args.indexOf('--evidence');const evidence=i>=0?JSON.parse(fs.readFileSync(path.resolve(args[i+1]),'utf8')):null;const gate=review(r,evidence);console.log(JSON.stringify(gate,null,2));if(!gate.ready)process.exitCode=1;}
  else if(r.errors.length)process.exitCode=1;
 }else console.log(JSON.stringify(await check(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
