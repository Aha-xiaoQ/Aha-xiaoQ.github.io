import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {createStageSession} from '../src/runtime/stage-session.mjs';
import {createStageCatalog} from '../src/content/stage-catalog.mjs';
import {loadExtensionPack,ROOT} from '../scripts/stages.mjs';
import {createLifetime} from '../src/runtime/lifetime.mjs';
const data=()=>loadExtensionPack().pack,cat=()=>createStageCatalog(data());
const life=()=>createLifetime({scheduleInterval:setInterval,cancelInterval:clearInterval});
function host(factory,onEvent=()=>{}){return createStageSession({catalog:cat(),drivers:{'platform-v1':factory},makeLifetime:life,onEvent});}
const basic=()=>({step(){},view(){return{};},dispose(){}});
test('A driver cannot forge its lifecycle event type or generation via payload',()=>{
 let emit;const ev=[],s=host(c=>(emit=c.emit,basic()),e=>ev.push(e));s.start('lab-platforms','lab-runner');const g=s.view().generation;emit('sound',{type:'exit',generation:-1,event:'jump'});assert.equal(ev.at(-1).type,'sound');assert.equal(ev.at(-1).generation,g);
});
test('Old driver events during disposal and after restart cannot reach a new session',()=>{
 const emissions=[],ev=[];const s=host(({emit})=>{emissions.push(emit);return{...basic(),dispose(){emit('sound',{event:'hurt'});}};},e=>ev.push(e));
 s.start('lab-platforms','lab-runner');s.restart();emissions[0]('complete');assert.equal(ev.filter(e=>e.type==='sound'||e.type==='complete').length,0);s.stop();s.stop();assert.equal(ev.filter(e=>e.type==='exit').length,1);
});
test('Mutable render snapshots cannot mutate the driver state',()=>{
 const state={p:{x:3}};const s=host(()=>({...basic(),view:()=>state}));s.start('lab-platforms','lab-runner');s.view().scene.p.x=99;assert.equal(state.p.x,3);
});
test('pause and resume faults dispose all registered resources',()=>{
 for(const method of ['pause','resume']){let n=0;const s=host(({lifetime})=>{lifetime.defer(()=>n++);return{...basic(),[method](){throw Error('fault '+method);}};});s.start('lab-platforms','lab-runner');if(method==='resume')s.pause();assert.throws(()=>s[method](),/fault/);assert.equal(s.active(),false);assert.equal(n,1);}
});
test('view and notification failures retire resources instead of leaving half active scene',()=>{
 let n=0;const s=host(({lifetime})=>{lifetime.defer(()=>n++);return basic();},()=>{throw Error('observer');});assert.throws(()=>s.start('lab-platforms','lab-runner'),/observer/);assert.equal(s.active(),false);assert.equal(n,1);
 const v=host(()=>({...basic(),view(){throw Error('snapshot');}}));assert.throws(()=>v.start('lab-platforms','lab-runner'),/snapshot/);assert.equal(v.active(),false);
});
test('Starting events are ordered after enter; complete is emitted once',()=>{
 const ev=[];const s=host(({emit})=>{emit('room',{roomId:'main'});return{...basic(),step(){emit('complete');emit('complete');}};},e=>ev.push(e.type));s.start('lab-platforms','lab-runner');s.step();assert.deepEqual(ev,['enter','room','complete']);
});
test('Unknown driver event is rejected and driver fault cleans up',()=>{
 const s=host(({emit})=>({...basic(),step(){emit('grant-admin');}}));s.start('lab-platforms','lab-runner');assert.throws(()=>s.step(),/Unsupported/);assert.equal(s.active(),false);
});
test('Malformed driver and reentrant transition cannot leave resources',()=>{
 let s=host(()=>({}));assert.throws(()=>s.start('lab-platforms','lab-runner'),/missing/);assert.equal(s.active(),false);
 s=host(()=>basic(),()=>s.stop());assert.throws(()=>s.start('lab-platforms','lab-runner'),/Reentrant/);assert.equal(s.active(),false);
});
test('Custom legacy stage/actor/overlay cannot pretend to work with the closed third episode',()=>{
 for(const change of [d=>{d.stages.find(s=>s.driver==='legacy-terra-v1').id='my-castle';},d=>{d.stages.find(s=>s.driver==='legacy-terra-v1').overlays={'legacy-terra':{rooms:{main:{geometry:[]}}}};}]){const d=data();change(d);assert.throws(()=>createStageCatalog(d),/sealed legacy/);}
});
test('Unknown audio event key fails before building a misleading silent stage',t=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'terra-m04-audio-'));t.after(()=>fs.rmSync(d,{recursive:true,force:true}));fs.cpSync(ROOT+'/content',d+'/content',{recursive:true});
 const f=d+'/content/extensions/audio/legacy-default/audio.json',a=JSON.parse(fs.readFileSync(f));a.events.jump='not-a-real-audio-key';fs.writeFileSync(f,JSON.stringify(a));assert.throws(()=>loadExtensionPack(d),/Unknown game audio key/);
});
test('Legacy reference display geometry is sealed so edits never appear falsely accepted',t=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'terra-m04-seal-'));t.after(()=>fs.rmSync(d,{recursive:true,force:true}));fs.cpSync(ROOT+'/content',d+'/content',{recursive:true});
 const f=d+'/content/extensions/maps/base-1-3/map.json',a=JSON.parse(fs.readFileSync(f));a.title='changed';fs.writeFileSync(f,JSON.stringify(a));assert.throws(()=>loadExtensionPack(d),/Sealed legacy/);
});
