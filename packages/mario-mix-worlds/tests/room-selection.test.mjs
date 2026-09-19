import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {displayRoom,roomLabel} from '../atlas/room-selection.mjs';
const index=JSON.parse(fs.readFileSync(new URL('../generated/atlas-index.json',import.meta.url)));
test('all maps choose main areas instead of pipe entrance scenes without changing data',()=>{
 const before=JSON.stringify(index);
 for(const l of index.levels){
  const expected=['1-2','2-2','4-2','7-2'].includes(l.id)?'area-1':'area-0';
  assert.equal(displayRoom(l.id,l.rooms),expected,l.id);
  assert.equal(displayRoom(l.id,l.rooms,'missing'),expected);
  // An explicit room link must still open that requested room.
  for(const r of l.rooms)assert.equal(displayRoom(l.id,l.rooms,r.id),r.id);
 }
 assert.equal(JSON.stringify(index),before);
});
test('editor documents and saved room choice use same display defaults',()=>{
 for(const level of ['1-2','2-2','4-2','7-2']){
  const t=JSON.parse(fs.readFileSync(new URL('../generated/levels/'+level+'/template.json',import.meta.url)));
  assert.equal(displayRoom(level,t.rooms),'area-1');
  assert.equal(displayRoom(level,t.rooms,'area-0'),'area-0');
  assert.match(roomLabel(level,t.rooms[1]),/主地图/);
  assert.match(roomLabel(level,t.rooms[0]),/入口转场/);
 }
});
