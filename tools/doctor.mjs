/** Diagnose a full checkout, or explicitly inspect a delta-only package. */
import {stat,readFile} from 'node:fs/promises';
import path from 'node:path';
import {ROOT} from './build-collab.mjs';
const args=process.argv.slice(2);if(args.some(a=>a!=='--delta')){console.error('Usage: npm run doctor [-- --delta]');process.exit(1);}
const delta=args.includes('--delta');
const project=JSON.parse(await readFile(path.join(ROOT,'collab/project.json'),'utf8'));
const needed=['index.html','LICENSE','RIGHTS.md','assets/fonts/LXGWWenKai-Regular.woff2',...project.episodes.flatMap(e=>[e.path,e.detailPath])];
let missing=0;
for(const p of needed){const ok=await stat(path.join(ROOT,p)).then(s=>s.isFile()).catch(()=>false);if(!ok)missing++;console.log(`${ok?'OK':'MISSING'}  ${p}`);}
if(missing){console.log(`\n${missing} preserved original files are absent here. Overlay the delta onto your complete checkout.\nNo game, fonts, or missing assets will be fetched automatically.`);if(!delta)process.exitCode=1;}
else console.log('\nEntry files are present. Playthrough, audio, assets licensing and physical controllers still require manual verification.');
if(delta)console.log('DELTA MODE: missing originals are expected, not a successful full-site test.');
