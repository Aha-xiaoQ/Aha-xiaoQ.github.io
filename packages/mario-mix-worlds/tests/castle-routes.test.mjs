import fs from 'node:fs';import {test} from 'node:test';import assert from 'node:assert/strict';import {fromTemplate} from '../atlas/editor-model.mjs';import {projectPack} from '../atlas/editor-runtime.mjs';import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';import {createPlatformMotor} from '../atlas/editor-mario-motor.mjs';import {createPlatformStage} from '../atlas/editor-mario-stage.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
for(const kind of ['conditional-sectionfail','conditional-sectionpass'])test(`4-4 ${kind} selects retry or onward route`,()=>{
 const d=fromTemplate(read('../generated/levels/4-4/template.json')),r=d.rooms[0],m=r.markers.find(m=>m.kind===kind&&m.x===2112);
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:m.x+4,y:m.y+4,w:10,h:14});const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 s.step({x:1});const v=s.view();assert.ok(v.p.x>2112,'route sensors must not teleport the player');assert.equal(v.p.dying,undefined);
});

for(const level of ['2-2','7-2'])test(`${level} underwater side exit enters overworld pipe`,()=>{
 const d=fromTemplate(read(`../generated/levels/${level}/template.json`)),r=d.rooms.find(r=>r.roomId==='area-1');
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:3030,y:124,w:10,h:14});const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 let entered=false,emerged=false;for(let i=0;i<170;i++){s.step({x:1});const v=s.view();entered||=v.transition?.phase==='enter';emerged||=v.roomId==='area-2'&&v.transition?.phase==='exit';}assert.ok(entered);assert.ok(emerged);assert.equal(s.view().roomId,'area-2');assert.equal(s.view().lives,3);
});

test('7-4 wrong corridor does not teleport until maze exit',()=>{
 const d=fromTemplate(read('../generated/levels/7-4/template.json')),r=d.rooms[0];
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:612,y:60,w:10,h:14});const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 s.step({x:1});assert.ok(s.view().p.x>=612,'must not jump back at the fail sensor');
});
for(const x of [1664,3136])test(`7-4 maze decision at ${x} retries safely`,()=>{
 const d=fromTemplate(read('../generated/levels/7-4/template.json')),r=d.rooms[0];
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:x+1,y:100,w:10,h:14});const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 s.step({});const v=s.view();assert.equal(v.p.x,x===1664?516:1668);assert.equal(v.lives,3);assert.ok(!v.p.dying);
 const before=v.p.x;for(let i=0;i<20;i++)s.step({x:1});assert.ok(s.view().p.x>before,'can move after retry');
});

test('7-4 correct ordered route passes both maze decisions',()=>{
 const d=fromTemplate(read('../generated/levels/7-4/template.json')),r=d.rooms[0],pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true});
 const points=[[612,170],[932,120],[1252,60],[1665,100],[1940,60],[2772,60],[3137,100]];let target;
 const base=createPlatformMotor(),motor={...base,step(p){Object.assign(p,{x:target[0],y:target[1],vx:0,vy:0});return [];}};
 const s=createPlatformStage({plan,motor,visualRooms:d.rooms,emit(){}});
 for(target of points){s.step({});assert.equal(s.view().p.x,target[0]);}assert.equal(s.view().lives,3);
});

for(const target of ['4-1','3-1','2-1'])test(`1-2 warp pipe enters ${target}`,()=>{
 const d=fromTemplate(read('../generated/levels/1-2/template.json')),r=d.rooms.find(r=>r.roomId==='area-1'),m=r.markers.find(m=>m.kind==='world-transport'&&m.source.transport.map===target);
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:m.x+10,y:m.y-14,w:10,h:14});const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 let entering=false;for(let i=0;i<100;i++){s.step({down:true});entering||=s.view().transition?.phase==='enter';}assert.ok(entering);assert.equal(s.view().warpTarget,target);assert.equal(s.view().lives,3);
});

for(const y of [52,116])test(`4-4 wrong route at ${y} waits for corridor end and preserves motion`,()=>{
 const d=fromTemplate(read('../generated/levels/4-4/template.json')),r=d.rooms[0],pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true});
 let x=2116;const base=createPlatformMotor(),motor={...base,step(p){Object.assign(p,{x,y,vx:2,vy:0});return [];}};
 const s=createPlatformStage({plan,motor,visualRooms:d.rooms,emit(){}});
 s.step({});assert.equal(s.view().p.x,2116);
 x=2240;s.step({});assert.equal(s.view().p.x,2240);
 x=y===52?2293:2277;s.step({});assert.equal(s.view().p.x,1396);assert.equal(s.view().p.y,y);assert.equal(s.view().p.vx,2);assert.equal(s.view().lives,3);
});

for(const run of [false,true])test(`4-4 original upper corridor traversable with real motor run=${run}`,()=>{
 const d=fromTemplate(read('../generated/levels/4-4/template.json')),r=d.rooms[0];
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:920,y:82,w:10,h:14});
 const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 let prior=920,passed=false;
 for(let i=0;i<170;i++){s.step({x:1,run});const v=s.view();assert.ok(v.p.x>=prior,'no route reset');assert.equal(v.p.y+v.p.h,96,'continuous upper floor');prior=v.p.x;if(v.p.x>1120){passed=true;break;}}
 assert.ok(passed);assert.equal(s.view().lives,3);
});
