import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {blank,fromTemplate,parseProject,clone,paint,bucket,lineCells,History,resize,moveSelection,deleteSelection,problems} from '../atlas/editor-model.mjs';
import {developerPack,filesForPack} from '../atlas/editor-runtime.mjs';
import {zipFiles} from '../atlas/editor-zip.mjs';
import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';
import {createPlatformStage} from '../atlas/runtime/platform-stage.mjs';
import {createPlatformMotor} from '../atlas/runtime/platform-motor.mjs';
import {crc32} from '../scripts/lib/zip.mjs';
function inspectZip(b){const names=[];let p=0;while(b.readUInt32LE(p)===0x04034b50){const size=b.readUInt32LE(p+18),nl=b.readUInt16LE(p+26),xl=b.readUInt16LE(p+28),start=p+30+nl+xl;names.push(b.subarray(p+30,p+30+nl).toString());assert.equal(crc32(b.subarray(start,start+size)),b.readUInt32LE(p+14));p=start+size;}assert.equal(b.readUInt32LE(p),0x02014b50);return{names};}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const character=read('atlas/runtime/character.json');
test('all 32 maps and every room preserve source and unknown data on project roundtrip',()=>{
 let rooms=0;for(let world=1;world<=8;world++)for(let stage=1;stage<=4;stage++){
  const t=read('generated/levels/'+world+'-'+stage+'/template.json'),before=JSON.stringify(t),d=fromTemplate(t);rooms+=d.rooms.length;
  d.rooms[0].customFuture={preserved:true};const back=parseProject(JSON.stringify(d));
  assert.deepEqual(back,d);assert.equal(JSON.stringify(t),before);assert.deepEqual(d.reference,t);
 }assert.equal(rooms,96);
});
test('painting subtracts rectangles without collateral geometry loss; outside paint is no-op',()=>{
 const r=blank().rooms[0];r.map.geometry=[{id:'floor',x:0,y:208,w:160,h:32,collision:'solid'}];
 paint(r,{x:32,y:208,w:16,h:16},'ground',{erase:true});
 assert.equal(r.map.geometry.reduce((a,g)=>a+g.w*g.h,0),160*32-256);
 const before=clone(r);paint(r,{x:-16,y:0,w:16,h:16},'ground');assert.deepEqual(r,before);
});
test('fast strokes interpolate all cells, atomic edits undo and redo exactly',()=>{
 const h=new History(blank()),before=clone(h.doc);
 h.change(()=>{for(const c of lineCells({x:0,y:10},{x:20,y:10}))paint(h.doc.rooms[0],{x:c.x*16,y:c.y*16,w:16,h:16},'ground');});
 assert.equal(h.doc.rooms[0].map.geometry.length,21);const after=clone(h.doc);
 h.undo();assert.deepEqual(h.doc,before);h.redo();assert.deepEqual(h.doc,after);
 assert.throws(()=>h.change(()=>{h.doc.rooms[0].map.width=-1;}));assert.deepEqual(h.doc,after);
});
test('fill respects a wall; resizing cannot silently crop',()=>{
 const r=blank('test',256,128).rooms[0];r.map.objects=[];
 paint(r,{x:64,y:0,w:16,h:128},'stone');bucket(r,0,0,'ground');
 assert.equal(r.map.geometry.filter(q=>q.material==='ground').reduce((n,q)=>n+q.w*q.h,0),64*128);
 assert.throws(()=>resize(r,128,128));const d=blank().rooms[0];d.map.objects.push({id:'far',kind:'coin',x:1000,y:20,w:16,h:16});assert.throws(()=>resize(d,256,128),/超出/);assert.equal(d.map.width,1280);
});
test('reward block associations move and delete, original source remains intact',()=>{
 const t=read('generated/levels/1-1/template.json'),d=fromTemplate(t),r=d.rooms[0],ids=new Set(['r003']);
 assert.throws(()=>paint(r,{x:336,y:144,w:16,h:16},'ground'),/奖励/);
 moveSelection(r,'geometry',ids,16,0);assert.equal(r.markers.find(m=>m.id==='r003-contents').x,352);
 deleteSelection(r,'geometry',ids);assert.ok(!r.markers.some(m=>m.id==='r003-contents'));assert.deepEqual(d.reference,t);
});
test('invalid input fails; startup duplicates and huge geometry are rejected',()=>{
 assert.throws(()=>parseProject('{"format":"xiaoq-map-project","__proto__":{}}'));
 const d=blank();d.rooms[0].map.objects.push(clone(d.rooms[0].map.objects[0]));assert.throws(()=>parseProject(JSON.stringify(d)),/重复/);
});
test('export pack validates against real catalog, ZIP CRC passes, actual motor lands on painted floor',()=>{
 const r=blank().rooms[0];paint(r,{x:0,y:208,w:1280,h:32},'ground');
 const pack=developerPack(r,character),catalog=createStageCatalog(pack),plan=catalog.plan('workshop-stage',character.id,{allowDraft:true});
 const stage=createPlatformStage({plan,motor:createPlatformMotor(),emit:()=>{}});
 for(let i=0;i<180;i++)stage.step({});const view=stage.view();assert.equal(view.p.y+view.p.h,208);assert.equal(view.lives,3);
 const zip=inspectZip(Buffer.from(zipFiles(filesForPack(pack))));assert.ok(zip.names.includes('maps/workshop-map/map.json'));assert.ok(zip.names.includes('stages/workshop-stage/stage.json'));stage.dispose();
});
test('spawn collisions and unsupported water refuse runtime export',()=>{
 const r=blank().rooms[0];paint(r,{x:32,y:32,w:16,h:32},'ground');assert.ok(problems(r).length);assert.throws(()=>developerPack(r,character),/重叠/);
 r.map.geometry=[];r.underwater=true;assert.throws(()=>developerPack(r,character),/游泳/);
});
test('bundled runtime files are byte-identical to host source',()=>{
 for(const [file,source]of [['stage-catalog.mjs','src/content/stage-catalog.mjs'],['platform-stage.mjs','src/simulation/platform-stage.mjs'],['platform-motor.mjs','src/simulation/platform-motor.mjs'],['character.json','content/extensions/characters/lab-runner/character.json']]){
  assert.deepEqual(fs.readFileSync(path.join(root,'atlas/runtime',file)),fs.readFileSync(path.join(fs.existsSync(path.join(root,'runtime/mario-mix-terra'))?path.join(root,'runtime/mario-mix-terra'):path.join(root,'../mario-mix-terra'),source)));
 }
});
