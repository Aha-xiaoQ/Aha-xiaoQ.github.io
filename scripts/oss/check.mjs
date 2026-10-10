// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Aha_xiaoQ and the respective contributors
// Consistency verification only: no network, publication or legal-clearance claims.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readOptional,validateRelative} from '../lib/safe-path.mjs';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export const MANIFEST='docs/oss/FILE_MANIFEST.json';
export const BASE='4bc75da9e038a45886a119b1d8c16402990702c9';
const classes=new Set(['original-MIT','third-party-original-license','existing-project-license','unknown']);
const sha=b=>createHash('sha256').update(b).digest('hex');
const gitBlob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function validateManifest(m){
 const errors=[];
 if(!m||m.schemaVersion!==1||m.baselineCommit!==BASE||m.repository!=='Aha-xiaoQ/Aha-xiaoQ.github.io')return ['Invalid or unexpected manifest baseline/schema/repository'];
 if(!m.evidence||typeof m.evidence!=='object'||!Array.isArray(m.files)||!Array.isArray(m.newFiles))return ['Missing evidence or explicit file lists'];
 const seen=new Set();
 for(const row of [...m.files,...m.newFiles]){
  if(!row||typeof row.path!=='string'){errors.push('Missing explicit path');continue;}
  try{validateRelative(row.path);}catch{errors.push('Unsafe path: '+row.path);}
  if(/[?*\[\]]/.test(row.path))errors.push('A license scope cannot be a directory glob: '+row.path);
  if(seen.has(row.path))errors.push('Duplicate scope: '+row.path);seen.add(row.path);
  if(!classes.has(row.classification))errors.push('Unknown classification: '+row.path);
  if(!row.scope||!Array.isArray(row.evidence)||!row.evidence.length||row.evidence.some(e=>!m.evidence[e]))errors.push('Missing scope/evidence: '+row.path);
  if(row.classification==='original-MIT'&&row.license!=='MIT')errors.push('Original grant must explicitly say MIT: '+row.path);
  if(row.classification==='unknown'&&row.license!=='NOASSERTION')errors.push('Unknown rights cannot create a license: '+row.path);
  if(m.files.includes(row)&&!/^[a-f0-9]{40}$/.test(row.gitBlob||''))errors.push('Missing baseline Git blob: '+row.path);
 }
 if(m.files.length!==2964)errors.push('Baseline inventory must contain exactly 2964 files');
 const by=new Map(m.files.map(r=>[r.path,r]));
 const revised=new Set();
 if(m.reviewedRevisions!==undefined&&!Array.isArray(m.reviewedRevisions))errors.push('Invalid reviewed revisions');
 for(const r of Array.isArray(m.reviewedRevisions)?m.reviewedRevisions:[]){
  const baseline=by.get(r.path);
  if(!baseline||baseline.classification!=='original-MIT'||!baseline.sha256||revised.has(r.path)||r.baselineGitBlob!==baseline.gitBlob||r.baselineSha256!==baseline.sha256||!/^[a-f0-9]{40}$/.test(r.gitBlob||'')||!/^[a-f0-9]{64}$/.test(r.sha256||'')||!['bilingual-maintenance','analytics-maintenance','analytics-ui-withdrawal','security-documentation','oscilloscope-preview','five-regions-publication','midnight-kitchen-publication'].includes(r.evidence)||r.reviewDate!==({'bilingual-maintenance':'2026-10-02','analytics-maintenance':'2026-10-02','analytics-ui-withdrawal':'2026-10-03','security-documentation':'2026-10-04','oscilloscope-preview':'2026-10-06','five-regions-publication':'2026-10-08','midnight-kitchen-publication':'2026-10-10'}[r.evidence])||!m.evidence[r.evidence])errors.push('Invalid original-component revision: '+r.path);
  revised.add(r.path);
 }
 for(const r of Array.isArray(m.reviewedRevisions)?m.reviewedRevisions:[])if(!m.evidence[r.evidence])errors.push('Missing original revision evidence');
 const requiredOriginal=['assets/illustrations/controller.svg','assets/illustrations/web-studio.svg','assets/illustrations/workflow.svg','assets/illustrations/experiment.svg','scripts/lib/safe-path.mjs','tests/security/safe-path.test.mjs','assets/workshop-cards.js','assets/workshop-media.js','assets/workshop-media-runtime.js','experiments/pelican-bicycle.html','packages/mario-mix-worlds/atlas/editor-zip.mjs','packages/mario-mix-worlds/atlas/editor-gamepad.mjs','packages/mario-mix-worlds/atlas/editor-model.mjs','packages/mario-mix-worlds/atlas/editor.css','packages/mario-mix-worlds/scripts/editor-launch.mjs','packages/mario-mix-worlds/tests/gamepad.test.mjs','tools/quina-optics/index.html','tools/quina-optics/assembly.html','tools/quina-optics/optics/interactive.html'];
 for(const p of requiredOriginal)if(by.get(p)?.classification!=='original-MIT')errors.push('Missing audited original scope: '+p);
 const exceptions=['packages/mario-mix-worlds/atlas/editor-mario-stage.mjs','packages/mario-mix-worlds/atlas/editor-mario-motor.mjs','packages/mario-mix-worlds/atlas/editor-bill.mjs','scripts/platform/vendor/acorn/acorn.mjs','scripts/platform/vendor/acorn/LICENSE','assets/fonts/LXGWWenKai-OFL.txt','tests/platform/fixtures/wenkai-ofl-source.json','packages/mario-mix-worlds/atlas/chill-font.mjs','packages/mario-mix-worlds/atlas/source-sprite-data.mjs','packages/mario-mix-worlds/atlas/classic-art.mjs','packages/mario-mix-worlds/tests/fixtures/classic-mix.js','packages/mario-mix-worlds/atlas/classic-1-1.json','tools/quina-optics/references/Thorlabs_EDU-SPEBCT1_Manual.pdf','tools/quina-optics/precision-assembly.glb','tools/quina-optics/precision-assembly-bom.json','tools/quina-optics/assets/preview.png','tools/quina-optics/Quina_Interactive_v009.zip','projects/q-mimi/spritesheet.webp','projects/q-mimi/q-mimi.zip'];
 for(const p of exceptions)if(!by.has(p)||by.get(p).classification==='original-MIT')errors.push('Third-party/unknown exception lost: '+p);
 if(!by.get('packages/mario-mix-worlds/atlas/editor-art.mjs')?.excludedComponents?.some(x=>x.includes('HUD_GLYPHS')))errors.push('Unverified HUD glyph table must stay outside original rendering grant');
 for(const row of m.files)if(/\.(?:woff2?|ttf|otf|zip|mp[34]|wav|ogg|pdf|glb)$/i.test(row.path)&&row.classification==='original-MIT')errors.push('Binary/archive needs separate audit, not this grant: '+row.path);
 return errors;
}
export function check(root=ROOT,{git=true,bytes=true}={}){
 const get=p=>{const b=readOptional(root,p);if(b===null)throw Error('Required audit source is missing: '+p);return b;};
 const manifest=JSON.parse(get(MANIFEST));const errors=validateManifest(manifest);
 if(errors.length)throw Error(errors.join('\n'));
 const counts={};for(const row of manifest.files||[])counts[row.classification]=(counts[row.classification]||0)+1;
 let gitInventory='not-requested';
 if(git){
  const r=spawnSync('git',['ls-tree','-r','-z',BASE],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
  if(r.status===0){
   const actual=new Map(r.stdout.split('\0').filter(Boolean).map(x=>{const[meta,p]=x.split('\t');return[p,meta.split(' ')[2]];}));
   for(const row of manifest.files)if(actual.get(row.path)!==row.gitBlob)errors.push('Baseline identity mismatch: '+row.path);
   if(actual.size!==manifest.files.length)errors.push('Baseline inventory path count mismatch');gitInventory='verified';
  }else{gitInventory='baseline-object-unavailable';}
 }
 let byteChecks=0;
 if(bytes){
  const revisions=new Map((manifest.reviewedRevisions||[]).map(r=>[r.path,r]));
  for(const row of manifest.files){
   if(!row.sha256)continue;
   const identity=revisions.get(row.path)||row;
   const b=get(row.path);if(sha(b)!==identity.sha256||gitBlob(b)!==identity.gitBlob)errors.push('Audited source bytes changed; review scope before updating identity: '+row.path);byteChecks++;
  }
  for(const row of manifest.files){
   if(['third-party-original-license','existing-project-license'].includes(row.classification)&&row.path!=='scripts/platform/vendor/acorn/NOTICE.json'){if(gitBlob(get(row.path))!==row.gitBlob)errors.push('Retained third-party file was changed: '+row.path);}
  }
  for(const row of manifest.newFiles){const b=get(row.path);if(row.sha256&&sha(b)!==row.sha256)errors.push('New upstream attribution identity mismatch: '+row.path);}
  const notice=JSON.parse(get('scripts/platform/vendor/acorn/NOTICE.json'));
  for(const[p,h]of Object.entries(notice.files))if(sha(get('scripts/platform/vendor/acorn/'+p))!==h)errors.push('Acorn original file hash mismatch: '+p);
  if(!get('scripts/platform/vendor/acorn/LICENSE').toString().includes('Copyright (C) 2012-2022 by various contributors'))errors.push('Acorn copyright was replaced');
  if(gitBlob(get('scripts/platform/vendor/acorn/AUTHORS'))!=='dc64dabef022eea06a9824f87b34feaa7634dede')errors.push('Acorn AUTHORS is not the pinned upstream file');
  const ex=JSON.parse(get('content/experiments/pelican-bicycle.json')),pelican=get('experiments/pelican-bicycle.html');
  if(ex.prompt!=='生成一个鹈鹕骑自行车的SVG动画，用html实现，不用做任何测试'||ex.model!=='GPT-6 Astra Pro'||ex.createdAt!=='2026-09-24'||ex.reasoningEffort!==null)errors.push('Historical pelican metadata was silently rewritten');
  if(pelican.length!==40441||sha(pelican)!=='ff9bd59b4ab3dbd7ac0af37bc2661c707a73b6111d941325e5db4d64cd40907c'||ex.artifact.sha256!==sha(pelican))errors.push('Pelican original artifact identity changed');
  if(/<(?:script|image|use)\b[^>]*(?:src|href)\s*=\s*["'](?:https?:|\/\/|data:)/i.test(pelican.toString()))errors.push('Unexpected external/embedded resource in original pelican artifact');
  for(const p of ['controller','web-studio','workflow','experiment']){
   const s=get('assets/illustrations/'+p+'.svg').toString();
   if(/<script\b|<image\b|<foreignObject\b|@import|url\s*\(|(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i.test(s))errors.push('Original geometric SVG has an unexpected dependency: '+p);
  }
  const rights=get('RIGHTS.md').toString(),license=get('LICENSE').toString(),method=get('docs/oss/REPRODUCIBILITY.md').toString();
  if(!license.includes('not a blanket license')||!license.includes('docs/oss/FILE_MANIFEST.json')||!rights.includes('NOASSERTION'))errors.push('Root license/rights scope is inconsistent');
  if(license.includes('only to the original website code')||license.includes('game/tool internals and downloads are'))errors.push('Obsolete license exclusion contradicts the audited original scope');
  if(!method.includes('不是标准化性能基准')||!method.includes('未记录')||!method.includes('null'))errors.push('Method limitations or unknown settings omitted');
 }
 if(errors.length)throw Error(errors.join('\n'));
 return {baseline:BASE,inventoryFiles:manifest.files.length,counts,byteChecks,gitInventory,legalClearance:false,remotePublication:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.slice(2).length)throw Error('No CLI options are supported');console.log(JSON.stringify(check(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
