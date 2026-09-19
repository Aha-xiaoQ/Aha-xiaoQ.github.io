import fs from 'node:fs';import {test} from 'node:test';import assert from 'node:assert/strict';
import {fromTemplate} from '../atlas/editor-model.mjs';import {projectPack} from '../atlas/editor-runtime.mjs';import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';import {createPlatformMotor} from '../atlas/editor-mario-motor.mjs';import {createPlatformStage} from '../atlas/editor-mario-stage.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url)));
for(const level of ['2-1','5-2','6-3','7-1','8-2']){
 const original=read(`../generated/levels/${level}/template.json`),d0=fromTemplate(original);
 for(const marker of d0.rooms[0].markers.filter(m=>m.kind==='springboard'))test(`${level} ${marker.id} compresses, launches and resets`,()=>{
 const d=fromTemplate(original),r=d.rooms[0];Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:marker.x+3,y:marker.y-16,w:10,h:14});
 const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 let compressed=false,launched=false,min=999,landed=false,headHit=false;
 for(let i=0;i<180;i++){const v=s.view();s.step({jump:true,x:level==='2-1'&&(v.p.y+v.p.h<48||launched&&v.p.x>marker.x+18)?1:0});const n=s.view(),g=n.geometry.find(g=>g.x===marker.x&&g.material==='spring');headHit||=!!n.p.headHit;compressed||=g.h<29;launched||=n.p.vy<-8;min=Math.min(min,n.p.y);if(level==='2-1'&&n.p.grounded&&n.p.y+n.p.h===48){landed=true;break;}}
 assert.ok(compressed);assert.ok(launched);assert.ok(min<marker.y-100||headHit,'rises high or hits actual overhead geometry');if(level==='2-1')assert.ok(landed,'spring reaches the 131px higher wall');
 });
}


for(const held of [false,true])test(`5-2 approach from ground, spring ${held?'high':'normal'} bounce`,()=>{
 const d=fromTemplate(read('../generated/levels/5-2/template.json')),r=d.rooms[0];Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:374,y:194,w:10,h:14});r.map.objects=r.map.objects.filter(o=>o.kind!=='walker');r.markers=r.markers.filter(m=>!m.kind.startsWith('enemy-'));
 const pack=projectPack(d,r.roomId,read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 let spring=false,launched=false,min=999,landed=false;
 for(let i=0;i<200;i++){const v=s.view();const x=spring?(launched?1:0):(v.p.x<396?1:0);s.step({x,jump:spring?held:i<24});const n=s.view();spring||=!!n.p.springId;if(n.p.vy<-5.5&&spring)launched=true;if(launched)min=Math.min(min,n.p.y);if(launched&&n.p.grounded&&n.p.x>=464){landed=true;break;}}
 assert.ok(spring,'normal jump lands on spring');assert.ok(launched);if(held)assert.ok(landed,'reaches platforms across gap');if(held)assert.ok(min<66);
});
