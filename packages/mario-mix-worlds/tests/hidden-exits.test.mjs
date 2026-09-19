import fs from 'node:fs';import {test} from 'node:test';import assert from 'node:assert/strict';import {fromTemplate} from '../atlas/editor-model.mjs';import {projectPack} from '../atlas/editor-runtime.mjs';import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';import {createPlatformMotor} from '../atlas/editor-mario-motor.mjs';import {createPlatformStage} from '../atlas/editor-mario-stage.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
for(let w=1;w<=8;w++)for(let n=1;n<=4;n++){
 const level=`${w}-${n}`,t=read(`../generated/levels/${level}/template.json`);
 for(const rr of t.rooms.filter(r=>!r.origin||r.origin.part==='base'))for(const pipe of (rr.semantics||[]).filter(s=>(s.kind||s.type)==='PipeHorizontal'))for(const power of [0,1,2])test(`${level} ${rr.roomId} ${pipe.id} side exit power ${power}`,()=>{
 const d=fromTemplate(t),r=d.rooms.find(r=>r.roomId===rr.roomId),g=r.map.geometry.find(g=>g.id===pipe.id);const portal=r.map.objects.find(o=>o.kind==='portal'&&Math.abs(o.x-g.x)<32);assert.ok(portal,'missing return connection');
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:g.x-10,y:g.y+g.h-14,w:10,h:14});const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true});const s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,initialState:{power},emit(){}});
 let entered=false;for(let i=0;i<180;i++){s.step({x:1});entered||=s.view().transition?.phase==='enter';if(entered&&s.view().roomId===portal.targetRoom&&!s.view().transition)break;}assert.ok(entered,'could not enter pipe');assert.equal(s.view().roomId,portal.targetRoom);assert.equal(s.view().lives,3);assert.equal(s.view().transition,null,'exit animation must finish');const before=s.view().p.x;for(let k=0;k<8;k++)s.step({x:1});assert.ok(s.view().p.x>before,'can move after exit');
 });
}

for(const level of ['2-1','3-1','5-2','6-2'])for(const power of [0,1,2])test(`${level} sky fall returns with real gravity power ${power}`,()=>{
 const d=fromTemplate(read(`../generated/levels/${level}/template.json`)),r=d.rooms.find(r=>/^Sky/.test(r.setting)),back=r.map.objects.find(o=>o.id==='sky-return');assert.ok(back);
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:66,y:210,w:10,h:14});
 const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,initialState:{power},emit(){}});
 for(let i=0;i<150&&s.view().roomId===r.roomId;i++)s.step({});assert.equal(s.view().roomId,back.targetRoom);assert.equal(s.view().lives,3);
 for(let i=0;i<100&&!s.view().p.grounded;i++)s.step({});assert.ok(s.view().p.grounded,'return lands on a surface');assert.equal(s.view().lives,3);const x=s.view().p.x;for(let i=0;i<8;i++)s.step({x:1});assert.ok(s.view().p.x>x,'can move after sky return');
});
for(const level of ['1-2','4-2']){
 const doc=fromTemplate(read(`../generated/levels/${level}/template.json`));
 for(const room of doc.rooms.filter(r=>!r.origin||r.origin.part==='base'))for(const m of room.markers.filter(m=>['world-transport','source-transport-not-simulated'].includes(m.kind)&&/^[1-8]-1$/.test(m.source?.transport?.map||'')))test(`${level} ${room.roomId} warp ${m.source.transport.map}`,()=>{
 const d=fromTemplate(read(`../generated/levels/${level}/template.json`)),r=d.rooms.find(r=>r.roomId===room.roomId);Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:m.x+10,y:m.y-14,w:10,h:14});
 const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 for(let i=0;i<140&&!s.view().warpTarget;i++)s.step({down:true});assert.equal(s.view().warpTarget,m.source.transport.map);assert.equal(s.view().lives,3);
 });
}

for(const roomId of ['area-0','area-1','area-2','area-4'])for(const power of [0,1,2]){
 const template=fromTemplate(read('../generated/levels/8-4/template.json')),rr=template.rooms.find(r=>r.roomId===roomId);
 for(const portal of rr.map.objects.filter(o=>o.kind==='portal'))test(`8-4 ${roomId} ${portal.id} vertical transport form ${power}`,()=>{
  const d=fromTemplate(read('../generated/levels/8-4/template.json')),r=d.rooms.find(r=>r.roomId===roomId),g=r.map.geometry.find(g=>g.x===portal.x&&g.y>=portal.y&&g.y<=portal.y+24);
  assert.ok(g);Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:g.x+10,y:g.y-14,w:10,h:14});
  const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),stage=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,initialState:{power},emit(){}});
  let entered=false,exited=false;
  for(let i=0;i<200;i++){stage.step({down:!entered});const v=stage.view();entered||=v.transition?.phase==='enter';if(entered&&v.roomId===portal.targetRoom&&!v.transition){exited=true;break;}}
  assert.ok(entered);assert.ok(exited);assert.equal(stage.view().lives,3);const x=stage.view().p.x;for(let i=0;i<8;i++)stage.step({x:1});assert.ok(stage.view().p.x>x);
 });
}
