import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {blank} from '../atlas/editor-model.mjs';
import {projectPack} from '../atlas/editor-runtime.mjs';
import {createPlatformStage} from '../atlas/editor-mario-stage.mjs';
import {createPlatformMotor} from '../atlas/runtime/platform-motor.mjs';
import {createStageCatalog} from '../atlas/runtime/stage-catalog.mjs';
import {audioFiles} from '../atlas/editor-audio.mjs';
test('classic pixel data and palette match existing 1-1 verbatim',async()=>{
 const old=await readFile(new URL('../../../games/mario-mix/classic-mix.js',import.meta.url),'utf8'),current=await readFile(new URL('../atlas/classic-art.mjs',import.meta.url),'utf8');
 for(const name of ['CLASSIC_PALETTE','CLASSIC_DATA']){const re=new RegExp('const '+name+' = ([^\\n]+)');assert.equal(current.match(re)[1],old.match(re)[1]);}
 for(const name of Object.values(audioFiles))assert.ok((await stat(new URL('../../../games/mario-mix/assets/classic-audio/'+name,import.meta.url))).size>100);
});
test('Mario preview has single jump, native small footprint and downward stomp',async()=>{
 const d=blank(),r=d.rooms[0];r.map.objects[0].y=0;r.map.geometry=[{id:'floor',x:0,y:64,w:1280,h:16,collision:'solid'}];r.map.objects.push({id:'enemy',kind:'walker',x:38,y:48,w:16,h:16});
 const c=JSON.parse(await readFile(new URL('../atlas/runtime/character.json',import.meta.url))),p=projectPack(d,'main',c),events=[];
 assert.deepEqual(p.characters[0].capabilities,['jump']);assert.equal(p.characters[0].motion.height,14);
 const s=createPlatformStage({plan:createStageCatalog(p).plan(p.stages[0].id,p.characters[0].id,{allowDraft:true}),motor:createPlatformMotor(),emit:(type,data)=>events.push([type,data])});
 for(let i=0;i<40;i++)s.step({});assert.ok(events.some(([t,d])=>t==='sound'&&d.event==='stomp'));assert.equal(s.view().enemies.length,0);s.dispose();
});

test('atlas uses semantic tiles and native enemy source coordinates',async()=>{
 const {mapSVG}=await import('../src/map-svg.mjs');const {terrainParts,markerParts}=await import('../atlas/map-appearance.mjs');
 const r=JSON.parse(await readFile(new URL('../generated/levels/1-1/template.json',import.meta.url))).rooms[0],svg=mapSVG(r);
 assert.ok(svg.includes('s-small_idle-normal'));assert.ok(svg.includes('src_Solid_Pipe_Overworld_top'));
 for(const kind of ['enemy-goomba','enemy-koopa']){const q=r.markers.find(q=>q.kind===kind),p=markerParts(r,q)[0];assert.equal(p.x,q.x);assert.equal(p.y,q.y);assert.equal(p.y+p.h,208);}
 const tree=JSON.parse(await readFile(new URL('../generated/levels/1-3/template.json',import.meta.url))).rooms[0];
 for(const q of tree.map.geometry.filter(q=>tree.semantics.some(s=>s.id===q.id&&s.type==='TreeTop')))assert.ok(terrainParts(tree,q).every(p=>p.name.includes('|TreeTop|')));
});
