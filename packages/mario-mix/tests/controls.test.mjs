import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveBillAim} from '../src/input/bill-aim.mjs';
import {billDescentIntent,isBillPassablePlatform} from '../src/input/bill-descent.mjs';
import {gitBlob} from '../scripts/core.mjs';
import {golden,probe,nextProbe,plain} from './helpers.mjs';
test('golden source is the actual repository blob, not a rewritten expectation',()=>assert.equal(gitBlob(golden),'a4247d3fd62066c875d6f7bf36a4a1bd7e89770d'));
test('aim: 324 combinations (pressed / released / omitted, facing, grounded) match original',()=>{
 const ref=probe(),out=nextProbe();let count=0;
 for(const left of [true,false,undefined])for(const right of [true,false,undefined])for(const up of [true,false,undefined])for(const down of [true,false,undefined])for(const facing of [-1,1])for(const grounded of [false,true]){
  const input=Object.freeze({left,right,up,down}),player=Object.freeze({facing,grounded});ref.configure({player});out.configure({player});
  const want=plain(ref.aim(input));assert.deepEqual(resolveBillAim(input,player),want);assert.deepEqual(plain(out.aim(input)),want);count++;
 }assert.equal(count,324);
});
test('down on ground crouches and still aims forward',()=>assert.deepEqual(resolveBillAim({down:true},{grounded:true,facing:-1}),{x:-1,y:0}));
test('up+down priority is preserved on ground, moving and airborne',()=>{
 assert.deepEqual(resolveBillAim({up:true,down:true},{grounded:true,facing:1}),{x:1,y:0});
 assert.deepEqual(resolveBillAim({up:true,down:true,right:true},{grounded:true,facing:1}),{x:1,y:1});
 assert.deepEqual(resolveBillAim({up:true,down:true},{grounded:false,facing:1}),{x:0,y:1});
});
test('left+right cancellation preserves facing when no vertical aim',()=>assert.deepEqual(resolveBillAim({left:true,right:true},{grounded:false,facing:-1}),{x:-1,y:0}));
test('descent intent is pure and does not mutate actions or player',()=>{
 const i=Object.freeze({down:true,jump:true}),p=Object.freeze({grounded:true});assert.deepEqual(billDescentIntent(i,false,p,'surface'),{held:true,attempt:true});
});
test('holding chord before landing consumes edge, release+press creates a new edge',()=>{
 for(const p of [probe(),nextProbe()]){p.configure({player:{grounded:false}});assert.equal(p.descend({down:true,jump:true}),false);p.configure({player:{grounded:true}});assert.equal(p.descend({down:true,jump:true}),false);p.descend({down:false,jump:true});assert.equal(p.descend({down:true,jump:true}),true);}
});
test('descent allows only eligible surface platform; state agrees with original',()=>{
 for(const config of [
  {},{support:[]},{support:[{type:'brick',y:7,hidden:true}]},{support:[{type:'ground',y:7}]},
  {support:[{type:'question',y:7}]},{support:[{type:'brick',y:13}]},
  {support:[{type:'brick',y:7},{type:'ground',y:7}]},{support:[{type:'brick',y:8}]},
  {room:'under'},{player:{grounded:false}},{player:{y:82.9}},{player:{y:83}},
 ]){const a=probe(),b=nextProbe();a.configure(config);b.configure(config);assert.equal(b.descend({down:true,jump:true}),a.descend({down:true,jump:true}));assert.deepEqual(plain(b.state()),plain(a.state()));}
});
test('platform rule matches reference boundaries including hidden questions',()=>{
 for(const y of [-1,0,7,12,13,14])for(const type of ['brick','question','ground','pipe'])for(const hidden of [false,true])assert.equal(isBillPassablePlatform({y,type,hidden}),!hidden&&y<13&&['brick','question'].includes(type));
});
test('successful descent keeps the original velocity, crouch and jump buffer',()=>{
 const p=nextProbe();assert.equal(p.descend({down:true,jump:true}),true);const s=p.state();assert.equal(s.player.vy,.7);assert.equal(s.player.crouch,false);assert.equal(s.player.grounded,false);assert.equal(s.jumpBuffer,0);assert.equal(s.row,7);
});
test('collision exception only applies to the Bill player and is cleared afterward',()=>{
 for(const config of [{}, {hero:'mario'}])for(const who of ['player','enemy'])for(const isPlayer of [true,false]){
  const a=probe(),b=nextProbe();a.descend({down:true,jump:true});b.descend({down:true,jump:true});a.configure(config);b.configure(config);assert.equal(b.move(0,1,who,isPlayer),a.move(0,1,who,isPlayer));assert.deepEqual(plain(b.state()),plain(a.state()));assert.equal(b.state().dropCollision,false);
 }
});
test('collision exception is cleared even when movement throws',()=>{
 for(const p of [probe(),nextProbe()]){p.descend({down:true,jump:true});p.configure({throwMove:true});assert.throws(()=>p.move(0,1),/synthetic movement fault/);assert.equal(p.state().dropCollision,false);}
});
test('row is cleared at original body-top threshold and reset clears held input',()=>{
 const a=probe(),b=nextProbe();for(const p of [a,b]){p.descend({down:true,jump:true});p.move(0,46);assert.equal(p.state().row,null);p.reset();assert.equal(p.state().held,false);}assert.deepEqual(plain(a.state()),plain(b.state()));
});
test('1,000 deterministic action steps preserve full exposed control state',()=>{
 let seed=913;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const a=probe(),b=nextProbe();
 for(let n=0;n<1000;n++){
  const i={left:rand()<.3,right:rand()<.3,up:rand()<.3,down:rand()<.5,jump:rand()<.4};const c={player:{grounded:rand()<.6,facing:rand()<.5?-1:1,y:82},room:rand()<.9?'surface':'under',support:rand()<.8?[{type:'brick',y:7}]:[]};
  a.configure(c);b.configure(c);a.aim(i);b.aim(i);assert.equal(a.descend(i),b.descend(i));const dy=rand();assert.equal(a.move(0,dy),b.move(0,dy));if(n%37===0){a.reset();b.reset();}assert.deepEqual(plain(a.state()),plain(b.state()));
 }
});
