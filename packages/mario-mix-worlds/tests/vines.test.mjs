import fs from 'node:fs';import {test} from 'node:test';import assert from 'node:assert/strict';import {fromTemplate} from '../atlas/editor-model.mjs';import {projectPack} from '../atlas/editor-runtime.mjs';import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';import {createPlatformMotor} from '../atlas/editor-mario-motor.mjs';import {createPlatformStage} from '../atlas/editor-mario-stage.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
for(const level of ['2-1','3-1','4-2','5-2','6-2'])test(`${level} vine grows, climbs, reaches bonus and returns`,()=>{
 const d=fromTemplate(read(`../generated/levels/${level}/template.json`)),r=d.rooms.find(r=>r.markers.some(m=>m.kind==='vine-transition')),m=r.markers.find(m=>m.kind==='vine-transition'),g=r.map.geometry.find(g=>g.x===m.x&&g.y===m.y),portal=r.map.objects.find(o=>o.id===m.id+'-portal');
 const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),base=createPlatformMotor();let age=0,fall=false;
 const motor={...base,step(p,...args){if(fall){p.y=300;return [];}if(age++===0){p.x=m.x+2;p.y=m.y+16;p.headHit=g.id;return [];}p.headHit=null;p.x=m.x+2;p.y=m.y-14;return [];}};
 const s=createPlatformStage({plan,motor,visualRooms:d.rooms,emit(){}});s.step();assert.equal(s.view().vines.length,1);assert.ok(!s.view().items.some(i=>i.kind==='mushroom'));
 for(let i=0;i<160&&s.view().roomId===r.roomId;i++)s.step({up:true});assert.equal(s.view().roomId,portal.targetRoom);assert.equal(s.view().lives,3);
 const back=plan.rooms[portal.targetRoom].objects.find(o=>o.id==='sky-return');if(back){fall=true;s.step();assert.equal(s.view().roomId,back.targetRoom);assert.equal(s.view().lives,3);}
});
