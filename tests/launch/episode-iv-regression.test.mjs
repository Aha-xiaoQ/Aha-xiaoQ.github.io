import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {validateRegistry,planCollections} from '../../scripts/workshop/build.mjs';
import {planLaunch,build} from '../../scripts/launch/build.mjs';
import {projectSnapshot} from '../../scripts/worlds/sync.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function data(){const c={};vm.runInNewContext(read('content/site-data.js'),c);return JSON.parse(JSON.stringify(c.SITE_DATA));}
const detail='games/mario-mix-4/index.html';
test('episode IV has exactly one top-level registry item and a matching proof',()=>{
 const d=data();validateRegistry(d);
 assert.equal(d.items.filter(i=>i.id==='game-mario-mix-4').length,1);
 assert.ok(!d.profile.now.items.some(i=>i.id==='game-mario-mix-4'));
 assert.equal(d.evidence.find(e=>e.id==='evidence-mario-mix-4').sourceItemId,'game-mario-mix-4');
});
test('repeating the misplaced-item error is rejected at build input',()=>{
 const d=data(),i=d.items.findIndex(x=>x.id==='game-mario-mix-4');d.profile.now.items.push(d.items.splice(i,1)[0]);
 assert.throws(()=>validateRegistry(d),/顶层 items/);
});
test('orphan proof, missing proof, duplicate proof and duplicate content fail closed',()=>{
 for(const mutate of [d=>d.evidence[0].sourceItemId='missing',d=>d.items[0].evidenceIds=['missing'],d=>d.evidence.push(d.evidence[0]),d=>d.items.push(d.items[0])]){
  const d=data();mutate(d);assert.throws(()=>validateRegistry(d));
 }
});
test('game shelf is exactly reproduced by the shared collection template',async()=>{
 const p=await planCollections(root),h=p.pages.get('games/index.html').toString();
 assert.equal(h,read('games/index.html'));assert.equal((h.match(/data-content-id="game-mario-mix-4"/g)||[]).length,1);
 const count=data().items.filter(i=>i.primaryType==='game'&&i.visibility==='public'&&i.lifecycleStatus!=='archived').length;
 assert.ok(h.includes('显示全部 '+count+' 款游戏'));
});
test('episode IV is in search and the dynamic rights/support registry',()=>{
 const index=JSON.parse(read('content/search-index.json'));
 assert.equal(index.entries.filter(e=>e.href==='/games/mario-mix-4/').length,1);
 const c={};vm.runInNewContext(read('content/game-support.js'),c);
 assert.match(c.SITE_GAME_SUPPORT['mario-mix-4'],/相关权利归各自权利人所有/);
});
test('episode IV keeps shared wiring and derives video state from its own registry',async()=>{
 const p=await planLaunch(root),h=p.files.get(detail).toString();assert.equal(h,read(detail));
 for(const marker of ['data-journey-support','data-journey-core','data-journey-module','data-experience-module'])assert.equal((h.match(new RegExp(marker,'g'))||[]).length,1);
 const item=data().items.find(x=>x.id==='game-mario-mix-4');
 assert.ok(h.includes('data-video-slot="game-mario-mix-4"'));
 assert.ok(h.includes('data-video-state="'+(item.videoUrl?'available':'pending')+'"'));
 if(item.videoUrl)assert.ok(h.includes('href="'+item.videoUrl+'"'));else assert.match(h,/视频待发布/);
 assert.doesNotMatch(h,/<iframe[^>]*src=["'](?:about:blank)?["']/);
 assert.match(h,/mario-mix-4\/play.html/);assert.match(h,/downloads\/games\/mario-mix-4.zip/);
});
test('formatted support wrappers do not silently discard copyright',async()=>{
 const original=read(detail),formatted=original.replace('<section class="section" data-game-support><div class="shell article">','<section class="section" data-game-support>\n  <div class="shell article">').replace('</div></section></main>','</div>\n</section>\n</main>');
 const p=await planLaunch(root,{reader:p=>Buffer.from(p===detail?formatted:read(p))});
 assert.match(p.files.get(detail).toString(),/相关权利归各自权利人所有/);
});
test('unrecognised support structure is rejected, not deleted',async()=>{
 const invalid=read(detail).replace('class="shell article"','class="custom-rights"');
 await assert.rejects(()=>planLaunch(root,{reader:p=>Buffer.from(p===detail?invalid:read(p))}),/作品说明边界/);
});
test('all launch generated files are stable after a normal build',async()=>{
 assert.equal((await build(root,{check:true})).changed,0);
});
test('map sync preserves the existing public documentation route',()=>{
 assert.equal(projectSnapshot({revision:1,updatedAt:'2026-09-21',levels:[]},[]).instructionsHref,'/notes/mario-mix/docs/worlds-start/');
});
