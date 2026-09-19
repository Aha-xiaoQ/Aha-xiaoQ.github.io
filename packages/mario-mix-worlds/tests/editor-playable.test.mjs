import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {blank,clone} from '../atlas/editor-model.mjs';
import {placeObject,batchObjects,connectPortal,connectionProblems,cleanupStarts} from '../atlas/editor-objects.mjs';
import {projectPack} from '../atlas/editor-runtime.mjs';
import {offlineFile} from '../atlas/editor-offline.mjs';
import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';
import {createPlatformStage} from '../atlas/runtime/platform-stage.mjs';
import {createPlatformMotor} from '../atlas/runtime/platform-motor.mjs';
const character=JSON.parse(await readFile(new URL('../atlas/runtime/character.json',import.meta.url)));
test('cleanup retains referenced legacy arrivals and explicit new arrivals',()=>{
 const d=blank(),r=d.rooms[0];r.map.objects.push({id:'legacy',kind:'spawn',x:100,y:32,w:12,h:24},{id:'duplicate',kind:'spawn',x:120,y:32,w:12,h:24});
 const p=placeObject(r,'portal',200,32);connectPortal(d,'main',p.id,'main','legacy');placeObject(r,'arrival',240,32);
 assert.equal(cleanupStarts(d),1);assert.equal(connectionProblems(d).length,0);assert.equal(r.map.objects.filter(o=>o.kind==='spawn').length,3);
});
function fixture(){const d=blank();const r=d.rooms[0];r.map.geometry=[{id:'floor',x:0,y:64,w:1280,h:16,collision:'solid'}];r.map.objects[0].y=40;return d;}
test('unique placement moves existing objects; batch spacing and limit',()=>{
 const d=fixture(),r=d.rooms[0];placeObject(r,'spawn',64,40);placeObject(r,'spawn',80,40);assert.equal(r.map.objects.length,1);assert.equal(r.map.objects[0].x,80);
 placeObject(r,'arrival',128,40);assert.equal(r.map.objects.length,2);
 placeObject(r,'exit',160,48);placeObject(r,'exit',192,48);assert.equal(r.map.objects.filter(o=>o.kind==='exit').length,1);
 batchObjects(r,'coin',{x:0,y:0,w:128,h:32},2);assert.equal(r.map.objects.filter(o=>o.kind==='coin').length,4);
 batchObjects(r,'coin',{x:0,y:0,w:128,h:32},2);assert.equal(r.map.objects.filter(o=>o.kind==='coin').length,4);
 assert.throws(()=>batchObjects(r,'exit',{x:0,y:0,w:128,h:32},2));assert.throws(()=>batchObjects(r,'walker',{x:0,y:0,w:32768,h:4096},1));
});
test('two explicit portal destinations remain distinct; dangling target blocks export',()=>{
 const d=fixture(),r=d.rooms[0],b=clone(r);b.roomId='bonus';d.rooms.push(b);
 const p=placeObject(r,'portal',32,40),q=placeObject(r,'portal',80,40),a=placeObject(b,'arrival',160,40),z=placeObject(b,'arrival',240,40);
 connectPortal(d,'main',p.id,'bonus',a.id);connectPortal(d,'main',q.id,'bonus',z.id);
 assert.equal(connectionProblems(d).length,0);const pack=projectPack(d,'main',character),catalog=createStageCatalog(pack);
 const stage=createPlatformStage({plan:catalog.plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),motor:createPlatformMotor(),emit(){}});
 for(let i=0;i<25;i++)stage.step({});stage.step({interact:true});assert.equal(stage.view().roomId,'bonus');assert.equal(stage.view().p.x,160);
 stage.dispose();b.map.objects=b.map.objects.filter(o=>o.id!==a.id);assert.throws(()=>projectPack(d,'main',character),/落地点/);
});
test('actual runtime collects a coin and restart restores it',()=>{
 const d=fixture();placeObject(d.rooms[0],'coin',32,40);const p=projectPack(d,'main',character),plan=createStageCatalog(p).plan(p.stages[0].id,p.characters[0].id,{allowDraft:true});
 const make=()=>createPlatformStage({plan,motor:createPlatformMotor(),emit(){}}),s=make();s.step({});assert.equal(s.view().coins,1);s.step({});assert.equal(s.view().coins,1);s.dispose();const n=make();assert.equal(n.view().coins,0);n.step({});assert.equal(n.view().coins,1);n.dispose();
});
test('offline HTML embeds all runtime imports and escapes user content',async()=>{
 const d=fixture();d.title='</script><script>alert(1)</script>';const p=projectPack(d,'main',character);
 const html=await offlineFile(p,d.rooms,path=>readFile(new URL('../atlas/'+path,import.meta.url),'utf8'),async()=>new Uint8Array());
 assert.ok(!html.includes(d.title));const map=JSON.parse(html.match(/type="importmap">(.*?)<\/script>/s)[1]);assert.equal(Object.keys(map.imports).length,16);assert.ok(Object.keys(map.imports).some(key=>key.endsWith("campaign-ui.mjs")));
 for(const url of Object.values(map.imports)){const source=decodeURIComponent(url.split(',').slice(1).join(','));for(const m of source.matchAll(/from\s+['"]([^'"]+)['"]/g))assert.ok(map.imports[m[1]],m[1]);}
});
