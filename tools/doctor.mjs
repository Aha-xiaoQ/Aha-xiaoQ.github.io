/** Diagnose a full checkout, or explicitly inspect a delta-only package. */
import {stat,readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {ROOT} from './build-collab.mjs';
const args=process.argv.slice(2);if(args.some(a=>a!=='--delta')){console.error('Usage: npm run doctor [-- --delta]');process.exit(1);}
const delta=args.includes('--delta');
const project=JSON.parse(await readFile(path.join(ROOT,'collab/project.json'),'utf8'));
const registry={};vm.runInNewContext(await readFile(path.join(ROOT,'content/site-data.js'),'utf8'),registry,{timeout:1000});
const episode4=registry.SITE_DATA?.items?.find(x=>x.id==='game-mario-mix-4');
if(!episode4||episode4.localUrl!=='games/mario-mix-4/play.html')throw Error('第四期试玩登记缺失或不符');
const needed=['games/mario-mix-4/play.html','games/mario-mix-4/index.html','index.html','LICENSE','RIGHTS.md','assets/fonts/LXGWWenKai-Regular.woff2',...project.episodes.flatMap(e=>[e.path,e.detailPath])];
let missing=0;
for(const p of needed){const ok=await stat(path.join(ROOT,p)).then(s=>s.isFile()).catch(()=>false);if(!ok)missing++;console.log(`${ok?'OK':'MISSING'}  ${p}`);}
if(missing){console.log(`\n${missing} preserved original files are absent here. Overlay the delta onto your complete checkout.\nNo game, fonts, or missing assets will be fetched automatically.`);if(!delta)process.exitCode=1;}
else console.log('\nEntry files are present. Playthrough, audio, assets licensing and physical controllers still require manual verification.');
if(delta)console.log('DELTA MODE: missing originals are expected, not a successful full-site test.');
