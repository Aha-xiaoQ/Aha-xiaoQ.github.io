/** Reproducible self-contained starter. Ships no new official art, music or font files. */
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
import{ROOT,build,plan,json}from'./build.mjs';import{sourceFiles,locateGame}from'./preview.mjs';import{zip}from'./lib/zip.mjs';import{writeAtomic}from'./lib/safe-path.mjs';
export async function pack(root=ROOT,{gameRoot,write=true}={}){
 build(root);const game=locateGame(root,gameRoot),entries=sourceFiles(root).filter(([p])=>!p.startsWith('runtime/')&&p!=='STARTER_METADATA.json');
 const runtime=sourceFiles(game);const sha=b=>createHash('sha256').update(b).digest('hex');
 const identity={schemaVersion:1,worldKitVersion:'0.2.0',gameVersion:'0.4.2',maps:plan(root).worlds.map(w=>w.level),gameSourceFiles:runtime.length,gameSourceHash:sha(Buffer.from(runtime.map(([p,b])=>p+' '+sha(b)).join('\n'))),scope:'32 reference map drafts, sections and underwater metadata. Not 32 playable levels. Original M06 unchanged.'};
 entries.push(['STARTER_METADATA.json',json(identity)],...runtime.map(([p,b])=>['runtime/mario-mix-terra/'+p,b]));
 entries.sort(([a],[b])=>a.localeCompare(b,'en'));const prefix='MarioMix_Worlds_W02/',bytes=zip(entries.map(([p,b])=>[prefix+p,b]));
 const metadata={...identity,file:'MarioMix_Worlds_W02_Starter.zip',bytes:bytes.length,sha256:sha(bytes),entries:entries.length};
 if(write){writeAtomic(root,'.local/'+metadata.file,bytes);writeAtomic(root,'.local/starter-metadata.json',json(metadata));}
 return{bytes,metadata};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{const i=process.argv.indexOf('--game');console.log((await pack(ROOT,{gameRoot:i>=0?process.argv[i+1]:undefined})).metadata);}catch(e){console.error(e.message);process.exitCode=1;}
