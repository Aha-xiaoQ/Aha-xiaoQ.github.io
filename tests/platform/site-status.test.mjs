import test from 'node:test';
import assert from 'node:assert/strict';
import {assertSiteStatus,checkSiteStatus} from '../../scripts/platform/site-status.mjs';
import {publicSiteData} from '../../assets/release/public-content.mjs';
const e={id:'video-a',visibility:'public',kind:'video',title:'Video A',subtitle:'A video',createdAt:'2026-09-29'};
function fixture(){return {site:{profile:{now:{label:'最近作品',sourceId:e.id,href:'/notes/lab/docs/video-a/',entryLabel:'实验室',title:e.title,summary:e.subtitle,updatedAt:e.createdAt,items:[]}},items:[{id:'old-game',primaryType:'game',visibility:'public',localUrl:'/game',title:'Old game',updatedAt:'2026-09-20'}]},entries:[structuredClone(e)],lab:{updatedAt:e.createdAt,updates:[{id:e.id,date:e.createdAt,status:'released'}],links:[{href:'/notes/lab/docs/video-a/'}]}};}
const check=f=>assertSiteStatus(f.site,f.entries,f.lab);
test('current authored home and lab update agree',()=>assert.equal(checkSiteStatus().bound,true));
test('explicit video survives publication without mutating source',()=>{const f=fixture(),before=structuredClone(f.site);assert.equal(publicSiteData(f.site,f.entries).profile.now.title,e.title);assert.deepEqual(f.site,before);assert.equal(check(f).bound,true);});
for(const field of ['title','summary','updatedAt'])test('stale homepage '+field+' blocks handoff',()=>{const f=fixture();f.site.profile.now[field]='old';assert.throws(()=>check(f),/differs/);});
test('missing update and stale lab date/link cannot pass',()=>{for(const edit of [f=>f.lab.updates=[],f=>f.lab.updatedAt='2026-09-20',f=>f.lab.links=[],f=>f.lab.updates[0].public=false]){const f=fixture();edit(f);assert.throws(()=>check(f),/lab update|lab date/);}});
test('private or missing work cannot be promoted by homepage',()=>{for(const visibility of ['draft','archived']){const f=fixture();f.entries[0].visibility=visibility;assert.throws(()=>check(f),/unavailable/);assert.throws(()=>publicSiteData(f.site,f.entries),/unavailable/);}});
test('newer public work exposes forgotten home status',()=>{const f=fixture();f.entries.push({...e,id:'video-b',createdAt:'2026-09-30'});assert.throws(()=>check(f),/newer/);});
test('legacy game-only home keeps fallback',()=>{const f=fixture();delete f.site.profile.now.sourceId;assert.equal(publicSiteData(f.site).profile.now.title,'Old game');});

test('focus link follows the selected work and stale project link fails',()=>{const f=fixture();assert.equal(publicSiteData(f.site,f.entries).profile.now.href,'/notes/lab/docs/video-a/');f.site.profile.now.href='/projects/';assert.throws(()=>check(f),/focus link/);});

function featuredGame(){const f=fixture(),game=f.site.items[0];game.summary='An older selected game';f.site.profile.now={label:'重点作品',sourceId:game.id,title:game.title,summary:game.summary,updatedAt:game.updatedAt,href:game.localUrl,entryLabel:game.title,items:[]};return f;}
test('fixed game pick survives a newer public video and publication preserves its label',()=>{
 const f=featuredGame(),before=structuredClone(f.site),projected=publicSiteData(f.site,f.entries).profile.now;
 assert.equal(check(f).id,'old-game');
 assert.equal(projected.label,'重点作品');assert.equal(projected.sourceId,'old-game');assert.equal(projected.updatedAt,'2026-09-20');
 assert.deepEqual(f.site,before);
});
test('latest-work mode still rejects the same older selected game',()=>{const f=featuredGame();f.site.profile.now.label='最近作品';assert.throws(()=>check(f),/newer/);});
test('fixed pick cannot hide a newer video missing its own public lab update',()=>{
 for(const edit of [f=>f.lab.updates=[],f=>f.lab.updates[0].id='other-video',f=>f.lab.updates[0].public=false,f=>f.lab.updates[0].date='2026-09-28',f=>f.lab.updates[0].status='draft',f=>f.lab.updates[0].audience='internal']){
  const f=featuredGame();edit(f);assert.throws(()=>check(f),/public lab update: video-a/);
 }
});
test('fixed pick cannot hide a newer video missing its lab link or project date',()=>{
 for(const edit of [f=>f.lab.links=[],f=>f.lab.updatedAt='2026-09-28']){const f=featuredGame();edit(f);assert.throws(()=>check(f),/lab date\/link: video-a/);}
});
test('same-day non-featured experiment also requires its own update',()=>{
 const f=fixture();f.site.profile.now.label='重点作品';f.entries.push({...e,id:'video-b'});f.lab.links.push({href:'/notes/lab/docs/video-b/'});
 assert.throws(()=>check(f),/public lab update: video-b/);
 f.lab.updates.push({id:'video-b',date:e.createdAt,status:'planned'});assert.equal(check(f).bound,true);
});
test('older collections retain merged-update compatibility but still need public detail links',()=>{
 const f=fixture();f.site.profile.now.label='重点作品';f.entries.push({...e,id:'historical-video',createdAt:'2026-09-20'});f.lab.links.push({href:'/notes/lab/docs/historical-video/'});
 assert.equal(check(f).bound,true);f.lab.links.pop();assert.throws(()=>check(f),/lab date\/link: historical-video/);
});
test('fixed pick still rejects private or missing work and stale metadata',()=>{
 for(const edit of [f=>f.site.items[0].visibility='draft',f=>f.site.items[0].lifecycleStatus='archived',f=>f.site.profile.now.sourceId='missing']){const f=featuredGame();edit(f);assert.throws(()=>check(f),/unavailable/);assert.throws(()=>publicSiteData(f.site,f.entries),/unavailable/);}
 for(const field of ['title','summary','updatedAt']){const f=featuredGame();f.site.profile.now[field]='stale';assert.throws(()=>check(f),/differs/);}
});
test('only the explicit fixed-pick label relaxes recency',()=>{const f=featuredGame();f.site.profile.now.label='自选栏目';assert.throws(()=>check(f),/differs/);});
