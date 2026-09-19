import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createItemDefinitions} from '../src/content/items.mjs';
import {createLootRules} from '../src/simulation/loot-rules.mjs';
const txt=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const plain=x=>JSON.parse(JSON.stringify(x));
const defs=createItemDefinitions(),rules=createLootRules({getItem:k=>defs[k]});
function harness(current){
 const events=[],drops=[];let synced=0,persisted=0;
 const c={T21_ITEMS:createItemDefinitions(),terraLoot:rules,
  t21Ensure(s){s.t13Owned??=['starfury'];},r06Weapon:s=>s.t13Weapon||'starfury',
  t21SpillOld(s,kind){events.push(['spill',kind]);},
  r06SyncKitTools(){synced++;},r05Persist(){persisted++;},
  t21Event:(...v)=>events.push(plain(v)),terraSound:s=>events.push(['sound',s]),
  t21Drop:(s,...v)=>drops.push(plain(v))};
 vm.createContext(c);
 for(const id of ['weapon-exchange','chest-spill'])vm.runInContext(txt(current?'../src/bridges/'+id+'.bridge.js':'golden/'+id+'.txt'),c);
 return {c,events,drops,counts:()=>({synced,persisted})};
}
test('Item metadata equals the exact uploaded table and fresh instances are independent',()=>{
 const old=vm.runInNewContext(txt('golden/item-definitions.txt')+';T21_ITEMS');
 assert.deepEqual(plain(defs),plain(old));const next=createItemDefinitions();next.starfury.name='changed';assert.notEqual(next.starfury.name,defs.starfury.name);
});
test('Weapon rules never mutate their input and permit late registered weapon definitions',()=>{
 const owned=['starfury','stormbow'],input={current:'starfury',next:'stormbow',owned,kit:'ranger'};
 const old=plain(input);const p=rules.weapon(input);p.owned.push('test');assert.deepEqual(input,old);
 const d=createItemDefinitions(),r=createLootRules({getItem:k=>d[k]});d.extra={weapon:true};assert.equal(r.weapon({current:'starfury',next:'extra'}).weapon,'extra');
});
test('Equipping the same weapon is a no-op and unsupported weapons fail early',()=>{
 assert.deepEqual(rules.weapon({current:'starfury',next:'starfury'}),{changed:false});assert.throws(()=>rules.weapon({current:'starfury',next:'missing'}),/Unknown weapon/);
});
test('All base weapon pairs preserve old inventory, reset state and effect order',()=>{
 const weapons=Object.keys(defs).filter(k=>defs[k].weapon);
 for(const old of weapons)for(const next of weapons)for(const spill of [true,false])for(const kit of [null,'ranger']){
   const a=harness(true),b=harness(false);
   const state={t13Weapon:old,t13Owned:[old,'starfury','stormbow'],kit,p:{attack:5,cooldown:6},minions:[{id:1}],tool:3,prismCharge:3,whipAge:5};
   const sa=plain(state),sb=plain(state);
   assert.equal(a.c.t21EquipWeapon(sa,next,spill),b.c.t21EquipWeapon(sb,next,spill));
   assert.deepEqual(plain(sa),plain(sb));assert.deepEqual(a.events,b.events);assert.deepEqual(a.counts(),b.counts());
 }
});
test('Chest scatter, claim flags, fallback loot and side effects match baseline',()=>{
 for(let n=0;n<8;n++)for(const transitioning of [true,false])for(const empty of [true,false]){
  const a=harness(true),b=harness(false),base={id:'chest-1',x:30,y:40,empty,items:Array.from({length:n},(_,i)=>({kind:i%2?'wood':'healing',count:i+1}))};
  const x=plain(base),y=plain(base),state={t11Transition:transitioning};
  assert.equal(a.c.t21Open(state,x),b.c.t21Open(state,y));assert.deepEqual(plain(x),plain(y));assert.deepEqual(a.drops,b.drops);assert.deepEqual(a.events,b.events);assert.deepEqual(a.counts(),b.counts());
 }
});
test('Chest claims once, and a no-op produces no drops or sound/persistence',()=>{
 const a=harness(true),chest={id:'a',x:1,y:2,items:[{kind:'wood',count:3}]};
 assert.equal(a.c.t21Open({},chest),true);const before=plain([a.events,a.drops,a.counts()]);assert.equal(a.c.t21Open({},chest),false);assert.deepEqual(plain([a.events,a.drops,a.counts()]),before);
});
test('Chest plans do not clear source inventory before bridge commits and do not alias items',()=>{
 const c={id:'a',x:0,y:0,items:[{kind:'wood',count:2}]},before=plain(c),p=rules.chest({chest:c});p.items[0].count=8;assert.deepEqual(c,before);assert.equal(p.drops[0].count,2);
});
test('Unavailable and removed chests never produce a plan',()=>{
 for(const c of [null,{removed:true},{t21Spilled:true},{empty:true}])assert.deepEqual(rules.chest({chest:c}),{changed:false});
});
test('Notice text preserves unknown pickup fallback, quantity and no-item behavior',()=>{
 assert.equal(rules.notice(null),null);assert.equal(rules.notice('wood',2).name,defs.wood.name+' ×2');assert.equal(rules.notice('unknown').name,'补给');assert.equal(rules.notice('heart').age,0);
});
