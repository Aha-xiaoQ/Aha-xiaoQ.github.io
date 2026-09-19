#!/usr/bin/env node
/** Builds the inspected upload, not a downloaded or inferred game revision. */
import {loadExtensionPack} from './stages.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {safe,readOptional,writeAtomic} from './lib/safe-path.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const hash=b=>createHash('sha256').update(b).digest('hex');
const utf=b=>b.toString('utf8').replace(/\r\n/g,'\n');
function text(root,rel){const b=readOptional(root,rel);if(!b)throw Error('Missing source: '+rel);return utf(b);}
function json(root,rel){return JSON.parse(text(root,rel));}
function replaceOnce(s,marker,value){if(s.split(marker).length!==2)throw Error('Expected exactly one marker: '+marker);return s.replace(marker,()=>value);}
export function inspect(root=ROOT){
 const extension=loadExtensionPack(root);
 const config=json(root,'build.config.json'),baseline=json(root,'baseline.json'),resources=json(root,'content/resources.json');
 if(config.schemaVersion!==1||resources.schemaVersion!==1)throw Error('Unsupported source schema');
 const sourceNames=new Set(),exportNames=new Set();
 for(const part of [...config.fragments,...config.modules]){
  if(sourceNames.has(part.path))throw Error('Duplicate source path');sourceNames.add(part.path);safe(root,part.path);
 }
 let runtime=config.fragments.map(f=>text(root,f.path)).join('');
 let reference=runtime;
 for(const hook of config.hooks){
  const marker='/*@terra-module:'+hook.id+'*/';
  runtime=replaceOnce(runtime,marker,hook.bridge?text(root,hook.bridge):hook.replacement);
  if(hook.bridge)sourceNames.add(hook.bridge);
  reference=replaceOnce(reference,marker,text(root,hook.golden));
 }
 if(/\/\*@terra-module:/.test(runtime))throw Error('Unresolved module bridge');
 let bundled='';let imports='';
 for(const [i,m]of config.modules.entries()){
  const src=text(root,m.path);
  if(/^\s*import\s/m.test(src)||/\bexport\s+(?:default|\{)/.test(src))throw Error('Migration bundler only accepts explicit import-free named functions: '+m.path);
  const actual=[...src.matchAll(/^export function ([A-Za-z_$][\w$]*)\(/gm)].map(m=>m[1]);
  if(JSON.stringify(actual)!==JSON.stringify(m.exports))throw Error('Module export contract changed: '+m.path);
  for(const name of actual){if(exportNames.has(name))throw Error('Duplicate module export: '+name);exportNames.add(name);}
  const body=src.replace(/^export (?=function )/gm,'');new vm.Script(body,{filename:m.path});
  bundled+='\n// '+m.path+'\n'+body;
  imports+=`import {${m.exports.join(',')}} from './modules/${m.path.slice(4)}';\n`;
 }
 const api='{'+[...exportNames].join(',')+'}';
 bundled='const __terraModules=(()=>{'+bundled+'\nreturn '+api+';})();\n';
 imports+='const __terraModules='+api+';\n';
 const assets={},audio={};
 const files=new Set();
 for(const [id,r]of Object.entries(resources.embedded)){
  if(!/^media-\d+$/.test(id)||/font/i.test(r.mime))throw Error('Invalid or prohibited media');
  const data=readOptional(root,r.path);if(!data||hash(data)!==r.sha256)throw Error('Resource integrity error: '+r.path);
  files.add(r.path);assets[id]=r.prefix+data.toString('base64');
  const token='__TERRA_ASSET_'+id+'__';
  if(!reference.includes(token))throw Error('Orphan embedded resource: '+id);
  reference=reference.split(token).join(assets[id]);
  const quoted=new RegExp('(["\'])'+token+'\\1','g');
  runtime=runtime.replace(quoted,()=>`__terraAssets[${JSON.stringify(id)}]`);
  if(runtime.includes(token))throw Error('Unrecognized resource literal: '+id);
 }
 let inline=text(root,'src/resources/audio-inline.template.json');
 for(const key of resources.audioOrder){
  if(!/^[A-Za-z0-9_-]+$/.test(key))throw Error('Invalid audio ID');
  const r=resources.audio[key],data=readOptional(root,r.path);if(!data||hash(data)!==r.sha256)throw Error('Audio integrity error: '+r.path);
  files.add(r.path);audio[key]=data.toString('base64');inline=replaceOnce(inline,'__TERRA_AUDIO_'+key+'__',audio[key]);
 }
 if(/__TERRA_(?:ASSET|AUDIO)_/.test(reference+runtime+inline))throw Error('Unresolved media marker');
 new vm.Script(reference,{filename:'reference-runtime.js'});
 new vm.Script(bundled+'const __terraAssets={};\n'+runtime,{filename:'candidate-runtime.js'});
 const template=text(root,'src/app/index.template.html'),css=text(root,'src/ui/console.css'),manifest=text(root,'content/audio-manifest.json').replace(/\n$/,''),pickups=text(root,'src/resources/pickups.js');
 function html(main,inlineData=inline,style=css,pageTemplate=template){let s=pageTemplate;for(const [key,value]of Object.entries({'@@TERRA_STYLE@@':style,'@@TERRA_SCRIPT_0@@':manifest,'@@TERRA_SCRIPT_1@@':inlineData,'@@TERRA_SCRIPT_2@@':pickups,'@@TERRA_SCRIPT_3@@':main}))s=replaceOnce(s,key,value);return s;}
 const referenceLF=html(reference),referenceBytes=Buffer.from(baseline.newline==='CRLF'?referenceLF.replace(/\n/g,'\r\n'):referenceLF);
 const roundtrip=hash(referenceBytes)===baseline.indexSha256;
 // A working-source edit may legitimately change the current output; do not pretend
 // it is still the pristine reference. Keep a stable baseline test via verify:baseline.
 const extensionCode='const __terraExtensionPack='+JSON.stringify(extension.pack).replaceAll('<','\\u003c')+';\n';
 const singleMain=extensionCode+bundled+'const __terraAssets='+JSON.stringify(assets)+';\n'+runtime;
 const enhance=s=>s.replace('maximum-scale=1,','').replace('aria-label="1-1 平台跳跃游戏：方向键移动，空格跳跃，Shift 加速"','aria-label="泰拉瑞亚 1-3 游戏画面；操作方式见下方操作指南"').replace('data-mix-build="release-1.0"','data-mix-build="terra-m06"').replace('https://aha-xiaoq.github.io/games/mario-mix/index.html','https://aha-xiaoq.github.io/games/mario-mix-3/index.html');
 const candidateCss=css+'\n'+text(root,config.presentationStyles);
 const candidateTemplate=text(root,config.candidateTemplate);
 const release=json(root,'release.json');
 const standalone=enhance(html(singleMain,inline,candidateCss,candidateTemplate));
 let web=enhance(html('', '{}',candidateCss,candidateTemplate));
 web=web.replace('<style>@@TERRA_STYLE@@</style>',''); // template already substituted, style replaced next
 const styleStart=web.indexOf('<style>'),styleEnd=web.indexOf('</style>',styleStart);
 web=web.slice(0,styleStart)+'<link rel="stylesheet" href="console.css">'+web.slice(styleEnd+8);
 web=web.replace("style-src 'unsafe-inline'","style-src 'self' 'unsafe-inline'");
 web=web.replace(/<script><\/script>/,'<script src="resources.js"></script><script type="module" src="runtime.mjs"></script>');
 if(!web.includes('src="runtime.mjs"'))throw Error('Failed to attach module entry');
 const output=new Map([
  ['dist/play.html',Buffer.from(web)],['dist/console.css',Buffer.from(candidateCss)],
  ['dist/resources.js',Buffer.from('globalThis.__TERRA_ASSET_BANK='+JSON.stringify(assets)+';\ndocument.getElementById("audio-inline").textContent='+JSON.stringify(inline)+';\n')],
  ['dist/runtime.mjs',Buffer.from(extensionCode+imports+'const __terraAssets=globalThis.__TERRA_ASSET_BANK;\nif(!__terraAssets)throw Error("Embedded media bank was not loaded");\n'+runtime)],
  ['dist/MarioMix_Terraria_M07.html',Buffer.from(standalone)],
  ['dist/reference.html',referenceBytes]
 ]);
 for(const m of config.modules)output.set('dist/modules/'+m.path.slice(4),Buffer.from(text(root,m.path)));
 output.set('dist/NOTICE.txt',readOptional(root,'upstream/NOTICE.txt'));
 const tracked=[...sourceNames,'build.config.json','baseline.json','content/resources.json','content/audio-manifest.json','src/resources/audio-inline.template.json','src/resources/pickups.js','src/ui/console.css','src/app/index.template.html',config.presentationStyles,config.candidateTemplate,'release.json',...extension.files];
 const sourceHash=hash(Buffer.from(tracked.sort().map(p=>p+':'+hash(readOptional(root,p))).join('\n')));
 const report={version:config.version,baselineSha256:baseline.indexSha256,referenceSha256:hash(referenceBytes),referenceMatchesUpload:roundtrip,sourceHash,standaloneSha256:hash(Buffer.from(standalone)),independentModules:config.modules.length,compatibilityFragments:config.fragments.length,embeddedMedia:Object.keys(assets).length,audioEntries:Object.keys(audio).length,scope:'M07 player interface: candidate template, high-resolution HUD, contextual guide, confirmation and presentation copy; simulation unchanged',remoteMedia:'Original optional network dependencies retained'};
 output.set('dist/build-report.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));
 return {output,report};
}
export function build(root=ROOT,{check=false,verifyBaseline=false}={}){
 const {output,report}=inspect(root);
 if(verifyBaseline&&!report.referenceMatchesUpload)throw Error('Upload baseline round-trip differs; working source may have changed. Do not relabel a candidate as the original.');
 const prev=JSON.parse(readOptional(root,'dist/build-manifest.json')?.toString()||'{"files":{}}');
 const manifest={version:1,files:Object.fromEntries([...output].map(([p,b])=>[p,hash(b)]))};
 output.set('dist/build-manifest.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n'));
 const changes=[],removals=[];
 for(const [rel,expected] of Object.entries(prev.files)){
  if(output.has(rel))continue;
  if(!rel.startsWith('dist/')||rel==='dist/build-manifest.json')throw Error('Invalid previous output path: '+rel);
  const before=readOptional(root,rel);if(!before)continue;
  if(hash(before)!==expected)throw Error('Obsolete generated output was edited; preserve it: '+rel);
  removals.push({rel,before});
 }

 for(const [rel,b]of output){
  const before=readOptional(root,rel);
  if(rel!=='dist/build-manifest.json'&&before&&(!prev.files[rel]||hash(before)!==prev.files[rel]))throw Error('Generated output was edited; preserve it before rebuilding: '+rel);
  if(!before||!before.equals(b))changes.push({rel,b,before});
 }
 if(check&&(changes.length||removals.length))throw Error('Build outputs are stale. Run npm run build.');
 if(!check){
  for(const c of [...changes,...removals]){const now=readOptional(root,c.rel);if((now===null)!==(c.before===null)||(now&&!now.equals(c.before)))throw Error('Concurrent output change: '+c.rel);}
  for(const c of changes)writeAtomic(root,c.rel,c.b);
  for(const c of removals)fs.unlinkSync(safe(root,c.rel));
 }
 return {...report,changed:changes.length,removed:removals.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(JSON.stringify(build(ROOT,{check:process.argv.includes('--check'),verifyBaseline:process.argv.includes('--baseline')}),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
