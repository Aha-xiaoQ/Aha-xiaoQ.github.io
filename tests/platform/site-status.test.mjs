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
