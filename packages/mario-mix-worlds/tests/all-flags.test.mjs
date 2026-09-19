import {markerParts} from '../atlas/map-appearance.mjs';
import fs from 'node:fs';
import {fromTemplate} from '../atlas/editor-model.mjs';
import {projectPack} from '../atlas/editor-runtime.mjs';
import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';
import {createPlatformMotor} from '../atlas/editor-mario-motor.mjs';
import {createPlatformStage} from '../atlas/editor-mario-stage.mjs';
import {test} from 'node:test';import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
for(let w=1;w<=8;w++)for(let l=1;l<=3;l++)test(`${w}-${l} flag finishes`,()=>{
 const d=fromTemplate(read(`../generated/levels/${w}-${l}/template.json`)),r=d.rooms.find(r=>r.markers.some(m=>m.kind==='flagpole-finish')),flag=r.markers.find(m=>m.kind==='flagpole-finish');
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:flag.x-10,y:100,w:10,h:14});const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true});const s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});let slide=false;const rest=markerParts(r,flag).find(p=>p.name.includes('|Flag|')).y;
 for(let i=0;i<900&&!s.view().completed;i++){s.step({x:1});if(s.view().finish?.phase==='slide'&&!slide){assert.equal(s.view().finish.flagY,rest);const drawn=markerParts({...r,finish:s.view().finish},flag).find(p=>p.name.includes('|Flag|'));assert.equal(drawn.y,rest);slide=true;}}assert.ok(slide);assert.equal(s.view().completed,true,JSON.stringify(s.view().finish));
});

test('an unrelated exit does not suppress the visible flag trigger',()=>{
 const d=fromTemplate(read('../generated/levels/3-1/template.json')),r=d.rooms[0],flag=r.markers.find(m=>m.kind==='flagpole-finish');
 r.map.objects.push({id:'other-exit',kind:'exit',x:20,y:40,w:16,h:168});
 const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json'));
 assert.ok(pack.maps[0].objects.some(o=>o.kind==='exit'&&o.x===flag.x));
});
