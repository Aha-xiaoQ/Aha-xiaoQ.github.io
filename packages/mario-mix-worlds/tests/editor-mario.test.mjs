import {test} from 'node:test';import assert from 'node:assert/strict';
import {createPlatformMotor} from '../atlas/editor-mario-motor.mjs';
import {createPlatformStage} from '../atlas/editor-mario-stage.mjs';
const character={capabilities:['jump'],motion:{width:10,height:14,maxHealth:1}};
const floor={id:'floor',x:0,y:208,w:2000,h:32,collision:'solid'};
test('offscreen Bowser fires repeatedly and flames advance before boss movement activates',()=>{
 const s=fixture([],[{id:'boss',kind:'walker',type:'enemy-bowser',x:720,y:176,w:32,h:32}]);
 for(let i=0;i<61;i++)s.step();const first=s.view().enemies.find(e=>e.type==='bowserfire');assert.ok(first);assert.equal(first.w,24);assert.equal(first.h,8);
 for(let i=0;i<20;i++)s.step();assert.ok(s.view().enemies.find(e=>e.id===first.id).x<first.x);assert.equal(s.view().enemies.find(e=>e.id==='boss').x,720);
 for(let i=0;i<160;i++)s.step();assert.equal(s.view().enemies.filter(e=>e.type==='bowserfire').length,2);
});
test('3-3 editor flag triggers slide and completes without the campaign builder',async()=>{
 const fs=await import('node:fs/promises'),{fromTemplate}=await import('../atlas/editor-model.mjs'),{projectPack}=await import('../atlas/editor-runtime.mjs'),{createStageCatalog}=await import('../atlas/runtime/stage-catalog.mjs');
 const read=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));const d=fromTemplate(await read('../generated/levels/3-3/template.json')),r=d.rooms[0],flag=r.markers.find(m=>m.kind==='flagpole-finish');
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:flag.x-10,y:100,w:10,h:14});const pack=projectPack(d,r.roomId,await read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 let slide=false;for(let i=0;i<600&&!s.view().completed;i++){s.step({x:1});if(s.view().finish?.phase==='slide')slide=true;}assert.ok(slide);assert.equal(s.view().completed,true);assert.equal(s.view().lives,3);
});
for(const side of ['left','right'])test(`3-3 ${side} scale carries rider and moves the paired platform oppositely`,async()=>{
 const fs=await import('node:fs/promises'),{fromTemplate}=await import('../atlas/editor-model.mjs'),{projectPack}=await import('../atlas/editor-runtime.mjs'),{createStageCatalog}=await import('../atlas/runtime/stage-catalog.mjs'),{markerParts}=await import('../atlas/map-appearance.mjs');
 const read=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));
 const d=fromTemplate(await read('../generated/levels/3-3/template.json')),r=d.rooms[0],platform=r.map.geometry.find(g=>g.id==='r029-'+side);
 Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:platform.x+16,y:platform.y-14,w:10,h:14});
 const pack=projectPack(d,r.roomId,await read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,manualDeath:true,emit(){}});
 s.step();const before=s.view(),a=before.geometry.find(g=>g.id==='r029-left'),b=before.geometry.find(g=>g.id==='r029-right');
 for(let i=0;i<40;i++)s.step();const v=s.view(),left=v.geometry.find(g=>g.id===a.id),right=v.geometry.find(g=>g.id===b.id),support=v.geometry.find(g=>g.id===platform.id);
 assert.ok(side==='left'?left.y>a.y:right.y>b.y);assert.ok(Math.abs(left.y+right.y-a.y-b.y)<.001);assert.ok(Math.abs(v.p.y+v.p.h-support.y)<.001);assert.equal(v.p.support,platform.id);
 const ropes=markerParts({...r,playGeometry:v.geometry},r.markers.find(m=>m.id==='r029'));assert.equal(ropes[0].y+ropes[0].h,left.y);assert.equal(ropes[1].y+ropes[1].h,right.y);
 for(let i=0;i<160;i++)s.step();assert.equal(s.view().geometry.find(g=>g.id===a.id).scaleBroken,true);assert.equal(markerParts({...r,playGeometry:s.view().geometry},r.markers.find(m=>m.id==='r029')).length,0);
});
test('lava continue chooses nearby land instead of the castle ceiling or overhead blocks',()=>{
 const room={roomId:'main',setting:'Castle',map:{width:800,height:240,geometry:[{id:'ceiling',x:0,y:32,w:800,h:16,collision:'solid'},{...floor,w:80},{...floor,id:'right',x:480,w:320},{id:'overhead',x:320,y:96,w:64,h:16,collision:'solid'}],objects:[{id:'start',kind:'spawn',x:352,y:202,w:10,h:14}]},markers:[{kind:'lava-volume',x:80,y:208,source:{width:200}}]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],manualDeath:true,emit(){}});
 s.step();assert.equal(s.view().p.dying,true);assert.equal(s.continueFromCurrent(),true);assert.equal(s.view().p.y,194);assert.equal(s.view().p.x,482);
 for(let i=0;i<240;i++)s.step();assert.equal(s.view().p.dying,false);assert.equal(s.view().p.support,'right');
 for(let i=0;i<20;i++)s.step({x:1});assert.ok(s.view().p.x>482);
});
test('underwater stroke and mouth bubbles update independently of jumping',()=>{
 const room={roomId:'main',setting:'Underwater',map:{width:512,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:48,y:100,w:10,h:14}]},markers:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],emit(){}});
 s.step({jump:true});assert.equal(s.view().p.swimming,true);assert.equal(s.view().p.swimStroke,24);assert.ok(s.view().p.vy<0);
 for(let i=0;i<47;i++)s.step();const bubble=s.view().items.find(i=>i.kind==='bubble');assert.ok(bubble);const y=bubble.y;s.step();assert.ok(s.view().items.find(i=>i.kind==='bubble').y<y);assert.equal(s.view().p.swimStroke,0);
});
for(let world=1;world<=8;world++)test(`${world}-4 ending camera reveals the rescued character before completion`,async()=>{
 const fs=await import('node:fs/promises'),{fromTemplate}=await import('../atlas/editor-model.mjs'),{projectPack}=await import('../atlas/editor-runtime.mjs'),{createStageCatalog}=await import('../atlas/runtime/stage-catalog.mjs'),{markerParts}=await import('../atlas/map-appearance.mjs');
 const read=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));
 const d=fromTemplate(await read(`../generated/levels/${world}-4/template.json`)),r=d.rooms.find(r=>r.markers.some(m=>m.kind==='castle-finish')&&!r.roomId.includes('section'));
 const axe=r.markers.find(m=>m.kind==='bridge-axe-finish');Object.assign(r.map.objects.find(o=>o.kind==='spawn'),{x:axe.x,y:axe.y,w:10,h:14});
 const pack=projectPack(d,r.roomId,await read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true});
 const s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});let reunited=false;
 const princess=markerParts(r,r.markers.find(m=>m.kind==='castle-finish'))[0];assert.match(princess.name,world===8?/Peach/:/Toad/);
 for(let i=0;i<1000;i++){s.step();const v=s.view();if(v.finish?.phase==='reunion'){assert.ok(princess.x>=v.cam&&princess.x+princess.w<=v.cam+256);assert.equal(v.completed,false);reunited=true;break;}}
 assert.ok(reunited);
});
for(const lava of [true,false])test(`continue after ${lava?'lava':'pit'} death lands safely beyond immunity`,()=>{
 const room={roomId:'main',setting:'Castle',map:{width:512,height:240,geometry:[{...floor,w:96},{...floor,id:'right',x:224,w:288}],objects:[{id:'start',kind:'spawn',x:144,y:194,w:10,h:14}]},markers:lava?[{kind:'lava-volume',x:96,y:208,source:{width:64}}]:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],manualDeath:true,emit(){}});
 for(let i=0;i<150&&!s.view().p.dying;i++)s.step();
 assert.equal(s.view().p.dying,true);const lives=s.view().lives;
 assert.equal(s.continueFromCurrent(),true);assert.ok(s.view().p.x+s.view().p.w<=96||s.view().p.x>=224);
 for(let i=0;i<240;i++)s.step();
 assert.equal(s.view().p.dying,false);assert.equal(s.view().lives,lives);assert.equal(s.view().p.grounded,true);
});
function fixture(extra=[],enemies=[],start={x:32,y:194},markers=[],emit=()=>{}){const room={roomId:'main',setting:'Overworld',map:{width:2000,height:240,geometry:[floor,...extra],objects:[{id:'start',kind:'spawn',...start,w:10,h:14},...enemies]},markers,enemySkins:Object.fromEntries(enemies.map(e=>[e.id,e.type]))};const plan={character,stage:{entryRoom:'main',entrySpawn:'start',title:'test'},rooms:{main:room.map}};return createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:[room],emit});}
test('held Mario jump crosses a 64 px pipe; a tap is shorter',()=>{
 const motor=createPlatformMotor(),world={width:2000,solids:[floor]},heights=[];
 for(const held of [false,true]){let p=motor.create(character,{x:32,y:194});motor.step(p,{},character,world);let min=p.y;for(let i=0;i<90;i++){motor.step(p,{jumpPressed:i===0,jump:i===0||held},character,world);min=Math.min(min,p.y);}heights.push(194-min);}assert.ok(heights[1]>64);assert.ok(heights[0]<heights[1]-20);
 const s=fixture([{id:'pipe',x:128,y:144,w:32,h:64,collision:'solid',material:'pipe'}]);let jumping=false;for(let t=0;t<160;t++){const p=s.view().p;if(p.x>80)jumping=true;s.step({x:1,run:true,jump:jumping});}assert.ok(s.view().p.x>160);assert.equal(s.view().lives,3);
});
test('a reward block pays once and remains solid',()=>{const s=fixture([{id:'block',x:32,y:144,w:16,h:16,collision:'solid',material:'block'}]);s.step();for(let i=0;i<2;i++){for(let t=0;t<60;t++)s.step({jump:t<25});}assert.equal(s.view().coins,1);assert.equal(s.view().geometry.find(q=>q.id==='block').used,true);});
test('Lakitu creates eggs that hatch into spiny enemies',()=>{const s=fixture([],[{id:'lakitu',kind:'walker',type:'enemy-lakitu',x:200,y:40,w:24,h:24}]);for(let t=0;t<170;t++)s.step();assert.ok(s.view().enemies.some(e=>e.type==='spiny'));});
test('Hammer Bro throws ballistic hammers and jumps',()=>{const s=fixture([],[{id:'bro',kind:'walker',type:'enemy-hammerbro',x:220,y:184,w:16,h:24}]);let hammer=false,jump=false;for(let t=0;t<160;t++){s.step();hammer ||=s.view().enemies.some(e=>e.type==='hammer');jump ||=s.view().enemies.some(e=>e.id==='bro'&&e.vy<0);}assert.ok(hammer);assert.ok(jump);});
test('wide reward rectangles split into independent cells',()=>{const s=fixture([{id:'row',x:32,y:144,w:64,h:16,collision:'solid',material:'block'}]);s.step();for(let t=0;t<50;t++)s.step({jump:t<25});const cells=s.view().geometry.filter(q=>q.sourceId==='row');assert.equal(cells.length,4);assert.equal(cells.filter(q=>q.used).length,1);});
test('hidden life block is intangible until hit from below',()=>{const s=fixture([],[],{x:32,y:194},[{id:'secret',kind:'hidden-block',x:32,y:144,source:{contents:'life'}}]);assert.equal(s.view().geometry.find(q=>q.id==='secret').hidden,true);s.step();for(let t=0;t<12;t++)s.step({jump:true});assert.equal(s.view().geometry.find(q=>q.id==='secret').hidden,false);assert.equal(s.view().items[0].kind,'life');});
test('Bowser markers are not ordinary stompable walkers',()=>{const s=fixture([],[{id:'boss',kind:'walker',type:'marker-Bowser',x:220,y:176,w:32,h:32}]);let fire=false;for(let i=0;i<80;i++){s.step();fire ||=s.view().enemies.some(e=>e.type==='bowserfire');}assert.ok(fire);});

test('recorded 1-1 inputs clear the complete course without losing a life',async()=>{
 const fs=await import('node:fs/promises'),{fromTemplate}=await import('../atlas/editor-model.mjs'),{projectPack}=await import('../atlas/editor-runtime.mjs'),{createStageCatalog}=await import('../atlas/runtime/stage-catalog.mjs');
 const read=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));
 const doc=fromTemplate(await read('../atlas/classic-1-1.json')),pack=projectPack(doc,'area-0',await read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true});
 const s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:doc.rooms,emit(){}});for(const segment of await read('./fixtures/mario-1-1-route.json'))for(let n=0;n<segment.frames;n++)s.step(segment.input);
 const v=s.view();assert.equal(v.completed,true);assert.equal(v.lives,3);assert.equal(v.p.y,194);assert.equal(v.finish.flagY,v.finish.floor-16);assert.ok(v.p.x>3264);
});
function formFixture(power,{enemy=true,brick=false,wall=false}={}){
 const base=createPlatformMotor(),motor={...base,create(c,s){return {...base.create(c,s),h:power?28:14,power,vy:enemy?2:0};}};
 const geometry=[floor,...(brick?[{id:'brick',material:'brick',collision:'solid',x:96,y:144,w:16,h:16}]:[]),...(wall?[{id:'wall',material:'stone',collision:'solid',x:112,y:140,w:16,h:68}]:[])],objects=[{id:'start',kind:'spawn',x:100,y:enemy?168:power?180:194,w:10,h:14},...(enemy?['a','b'].map((id,i)=>({id,kind:'walker',x:98+i*8,y:194,w:14,h:14})):[])],room={roomId:'main',map:{width:2000,height:240,geometry,objects},markers:[]};
 return createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit(){}});
}
test('large Mario stomps two adjacent Goombas without shrinking',()=>{const s=formFixture(1);s.step();assert.equal(s.view().p.power,1);assert.equal(s.view().enemies.length,0);assert.ok(s.view().p.vy<0);assert.equal(s.view().lives,3);});
test('large empty brick bursts into four fragments; fragments expire',()=>{const s=formFixture(1,{enemy:false,brick:true});s.step();for(let i=0;i<6;i++)s.step({jump:true});assert.equal(s.view().geometry.some(g=>g.id==='brick'),false);assert.equal(s.view().items.filter(i=>i.kind==='brick-debris').length,4);for(let i=0;i<50;i++)s.step();assert.equal(s.view().items.filter(i=>i.kind==='brick-debris').length,0);});
test('coin reward has a rising, expiring animation without double payment',()=>{const s=fixture([{id:'b',material:'block',collision:'solid',x:32,y:144,w:16,h:16}]);s.step();for(let i=0;i<12;i++)s.step({jump:true});const coin=s.view().items.find(i=>i.kind==='coin-pop');assert.ok(coin);assert.ok(coin.y<130);assert.equal(s.view().coins,1);for(let i=0;i<50;i++)s.step();assert.equal(s.view().items.some(i=>i.kind==='coin-pop'),false);assert.equal(s.view().coins,1);});
test('original run-button fires only in fire form and terrain stops the shot',()=>{const small=formFixture(0,{enemy:false});small.step({run:true});assert.equal(small.view().items.length,0);const fire=formFixture(2,{enemy:false});fire.step({run:true});const shot=fire.view().items.find(i=>i.kind==='fireball');assert.ok(shot.vx>0);for(let i=0;i<5;i++)fire.step({run:true});assert.equal(fire.view().items.filter(i=>i.kind==='fireball').length,1);const wall=formFixture(2,{enemy:false,wall:true});wall.step({attack:true});assert.equal(wall.view().items.some(i=>i.kind==='fireball'),false);assert.ok(wall.view().items.some(i=>i.kind==='fire-impact'));});

test('emerging life mushroom rises from within the block, then has a 14px terrain body',()=>{
 const events=[],s=fixture([{id:'wall',material:'pipe',x:80,y:112,w:32,h:96,collision:'solid'}],[],{x:32,y:194},[{id:'secret',kind:'hidden-block',x:32,y:144,source:{contents:'life'}}],(t,d)=>events.push(d.event));
 s.step();let first;for(let i=0;i<15;i++){s.step({jump:true});first=s.view().items[0];if(first)break;}assert.ok(first.emerge>0);assert.ok(first.y>first.blockTop);assert.equal(first.w,14);assert.equal(first.h,14);assert.equal(s.view().lives,3);assert.ok(events.includes('appear'));
 let reversed=false;for(let i=0;i<110;i++){s.step();const m=s.view().items.find(i=>i.kind==='life');if(m?.vx<0){reversed=true;assert.ok(m.x+m.w<=80);break;}}assert.ok(reversed);for(let i=0;i<160&&s.view().lives===3;i++)s.step();assert.equal(s.view().lives,4);assert.equal(events.filter(e=>e==='life').length,1);assert.ok(!events.includes('powerup'));
});
test('buried piranha has no player contact; emergence is held near its pipe',()=>{
 const s=fixture([{id:'pipe',material:'pipe',x:96,y:176,w:32,h:32,collision:'solid'}],[{id:'plant',kind:'walker',type:'enemy-piranha',x:104,y:152,w:16,h:24}],{x:105,y:162});
 for(let i=0;i<240;i++)s.step();const e=s.view().enemies[0];assert.equal(e.clipTop,176);assert.equal(e.y,176);assert.equal(s.view().lives,3);
 const far=fixture([{id:'pipe',material:'pipe',x:96,y:176,w:32,h:32,collision:'solid'}],[{id:'plant',kind:'walker',type:'enemy-piranha',x:104,y:152,w:16,h:24}]);for(let i=0;i<100;i++)far.step();assert.equal(far.view().enemies[0].y,152);
});

test('unrevealed secret blocks do not support or reverse moving mushrooms',()=>{
 const s=fixture([{id:'reward',material:'block',x:32,y:144,w:16,h:16,collision:'solid'}],[],{x:32,y:194},[{id:'reward-content',kind:'block-contents',x:32,y:144,source:{contents:'power'}},{id:'hidden',kind:'hidden-block',x:64,y:176,source:{contents:'life'}}]);
 s.step();for(let i=0;i<12;i++)s.step({jump:true});let crossed=false;for(let i=0;i<100;i++){s.step();const m=s.view().items.find(i=>i.kind==='mushroom');if(m&&m.x>=64&&m.x<80&&m.y+m.h>176){assert.ok(m.vx>0);crossed=true;}}assert.ok(crossed);assert.equal(s.view().geometry.find(g=>g.id==='hidden').hidden,true);
});

test('beetle uses a dedicated shell; stomping a resting shell launches it',async()=>{
 const {enemySprite}=await import('../atlas/map-appearance.mjs'),{sourcePixels}=await import('../atlas/source-art.mjs');assert.match(enemySprite('beetleshell'),/BeetleShell/);assert.notDeepEqual(sourcePixels(enemySprite('beetleshell')).pixels,sourcePixels(enemySprite('shell')).pixels);
 const s=fixture([],[{id:'b',kind:'walker',type:'enemy-beetle',x:100,y:192,w:16,h:16}],{x:100,y:170});let stopped=false,launched=false;for(let i=0;i<150;i++){s.step();const e=s.view().enemies[0];if(e?.shell&&e.vx===0)stopped=true;if(e?.shell&&Math.abs(e.vx)>1){launched=true;break;}}assert.ok(stopped);assert.ok(launched);assert.equal(s.view().lives,3);
});
test('Bowser contact from above hurts Mario instead of flattening Bowser',()=>{const s=fixture([],[{id:'b',kind:'walker',type:'enemy-bowser',x:100,y:176,w:32,h:32}],{x:100,y:155});for(let i=0;i<12;i++)s.step();assert.equal(s.view().lives,2);assert.ok(s.view().enemies.some(e=>e.id==='b'));});

test('walk/run accelerate, coast, brake and crouch without standing into a ceiling',()=>{
 const m=createPlatformMotor(),w={width:2000,solids:[floor]},p=m.create(character,{x:32,y:194});m.step(p,{},character,w);m.step(p,{x:1},character,w);assert.equal(p.vx,.037109375);for(let i=0;i<60;i++)m.step(p,{x:1,run:true},character,w);assert.equal(p.vx,2.5);m.step(p,{},character,w);assert.equal(p.vx,2.44921875);m.step(p,{x:-1},character,w);assert.ok(p.vx>0&&p.facing===-1);assert.ok(p.anim>0);
 p.power=1;p.h=28;p.y=180;const feet=p.y+p.h;m.step(p,{down:true},character,w);assert.equal(p.h,16);assert.equal(p.y+p.h,feet);assert.equal(p.crouch,true);w.solids.push({x:p.x-20,y:176,w:80,h:16,collision:'solid'});m.step(p,{},character,w);assert.equal(p.h,16);w.solids.pop();m.step(p,{},character,w);assert.equal(p.h,28);assert.equal(p.crouch,false);
});
test('death freezes contacts then arcs before a single respawn',()=>{
 const events=[],s=fixture([],[{id:'a',kind:'walker',type:'enemy-goomba',x:32,y:194,w:16,h:14}],{x:32,y:194},[],(t,d)=>events.push(d.event));s.step();const y=s.view().p.y;assert.equal(s.view().p.dying,true);assert.equal(s.view().lives,2);for(let i=0;i<20;i++)s.step({jump:true,x:1});assert.equal(s.view().p.y,y);for(let i=0;i<10;i++)s.step();assert.ok(s.view().p.y<y);for(let i=0;i<74;i++)s.step();assert.ok(!s.view().p.dying);assert.equal(s.view().lives,2);assert.equal(events.filter(x=>x==='death').length,1);
});
test('stomped Goombas flatten temporarily and expire',()=>{const s=formFixture(1);s.step();assert.equal(s.view().items.filter(x=>x.kind==='enemy-death'&&x.flat).length,2);for(let i=0;i<30;i++)s.step();assert.equal(s.view().items.filter(x=>x.kind==='enemy-death').length,0);});
test('bridge fish detectors start and stop spawning; fish rise from below and fall',()=>{
 const s=fixture([],[],{x:32,y:194},[{kind:'spawn-zone-CheepsStart',x:48},{kind:'spawn-zone-CheepsStop',x:320}]);for(let i=0;i<40;i++)s.step();assert.equal(s.view().enemies.length,0);let flying=false,falling=false;for(let i=0;i<260;i++){s.step({x:i<70?1:0,run:true});flying ||=s.view().enemies.some(e=>e.flying&&e.y<190);falling ||=s.view().enemies.some(e=>e.flying&&e.vy>0);}assert.ok(flying);assert.ok(falling);
 const stop=fixture([],[],{x:330,y:194},[{kind:'spawn-zone-CheepsStart',x:48},{kind:'spawn-zone-CheepsStop',x:320}]);for(let i=0;i<100;i++)stop.step();assert.equal(stop.view().enemies.length,0);
});
test('moving platform source pixels are decoded as an 8 by 8 tile',async()=>{const {sourcePixels}=await import('../atlas/source-art.mjs');const p=sourcePixels('src|Solid|Platform||');assert.equal(p.w,8);assert.equal(p.h,8);});

test('hitting a brick underneath a moving mushroom launches it, then it lands again',()=>{
 const s=fixture([{id:'bricks',x:48,y:144,w:176,h:16,collision:'solid',material:'brick'}],[],{x:32,y:194},[{id:'reward',kind:'hidden-block',x:32,y:144,source:{contents:'Mushroom'}}]);for(let i=0;i<2;i++)s.step();for(let i=0;i<15;i++)s.step({jump:true});for(let i=0;i<40;i++)s.step();for(let i=0;i<40;i++)s.step({x:1});assert.equal(s.view().items[0].vy,0);for(let i=0;i<15;i++)s.step({jump:true});assert.ok(s.view().items[0].vy<0);assert.ok(s.view().items[0].y<125);for(let i=0;i<40;i++)s.step();assert.equal(s.view().items[0].y,130);assert.equal(s.view().items[0].vy,0);
});


test('a fireball kills a Goomba with a noncolliding upward-flipped death effect',()=>{
 const base=createPlatformMotor(),motor={...base,create(c,o){return {...base.create(c,o),power:2,h:28,y:180};}},room={roomId:'main',setting:'Overworld',map:{width:2000,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:32,y:180,w:10,h:14},{id:'goomba',kind:'walker',x:70,y:194,w:16,h:14}]},markers:[],enemySkins:{goomba:'enemy-goomba'}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit(){}});s.step({attack:true});let death;for(let i=0;i<20;i++){s.step();death=s.view().items.find(x=>x.kind==='enemy-death');if(death)break;}assert.ok(death);assert.equal(death.flat,false);assert.ok(death.vy<0);assert.equal(s.view().enemies.length,0);assert.equal(s.view().p.power,2);
});

test('damage freezes a foot-anchored shrink, then grants temporary immunity',()=>{
 const base=createPlatformMotor(),motor={...base,create(c,o){return {...base.create(c,o),power:1,h:28,y:180};}},room={roomId:'main',map:{width:2000,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:32,y:194,w:10,h:14},{id:'hazard',kind:'hazard',x:32,y:180,w:16,h:28}]},markers:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit(){}});s.step();const v=s.view();assert.equal(v.p.power,0);assert.equal(v.p.y+v.p.h,208);assert.equal(v.p.shrink,24);for(let i=0;i<24;i++)s.step({x:1});assert.equal(s.view().p.x,v.p.x);assert.equal(s.view().lives,3);assert.equal(s.view().p.shrink,0);s.step();assert.equal(s.view().lives,3);
});
test('full-speed dash crosses only a one-tile floor gap',()=>{
 for(const gap of [16,32])for(const run of [true,false]){const m=createPlatformMotor(),p=m.create(character,{x:16,y:194}),solids=[{id:'a',x:0,y:208,w:160,h:32,collision:'solid'},{id:'b',x:160+gap,y:208,w:500,h:32,collision:'solid'}];for(let i=0;i<150;i++)m.step(p,{x:1,run},character,{width:800,solids});if(gap===16&&run){assert.ok(p.x>200);assert.equal(p.y,194);}else assert.ok(p.y>240);}
});
test('1-1 pipe round trip animates descent, secret-room drop and surface emergence',async()=>{
 const fs=await import('node:fs/promises'),{fromTemplate}=await import('../atlas/editor-model.mjs'),{projectPack}=await import('../atlas/editor-runtime.mjs'),{createStageCatalog}=await import('../atlas/runtime/stage-catalog.mjs');const read=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));
 const d=fromTemplate(await read('../atlas/classic-1-1.json'));Object.assign(d.rooms[0].map.objects.find(o=>o.id==='start'),{x:923,y:130});const pack=projectPack(d,'area-0',await read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});for(let i=0;i<26;i++)s.step();s.step({interact:true});assert.equal(s.view().transition.phase,'enter');for(let i=0;i<56;i++)s.step();assert.equal(s.view().roomId,'area-1');assert.equal(s.view().p.y,32);assert.ok(!s.view().geometry.some(g=>g.y===32&&g.x<64&&g.x+g.w>32));let emerged=false;for(let i=0;i<220;i++){s.step({x:1});emerged ||=s.view().transition?.phase==='exit';if(emerged&&!s.view().transition)break;}assert.ok(emerged);assert.equal(s.view().roomId,'area-0');assert.equal(s.view().lives,3);assert.equal(s.view().p.y,162);
});


test('smart Koopas patrol narrow and joined tree/shroom tops without frame-by-frame edge flips',()=>{
 for(const material of ['tree','shroom'])for(const width of [16,64]){const room={roomId:'main',map:{width:512,height:240,geometry:[floor,...Array.from({length:width/16},(_,i)=>({id:'top'+i,x:128+i*16,y:96,w:16,h:16,material,collision:'solid'}))],objects:[{id:'start',kind:'spawn',x:32,y:194,w:10,h:14},{id:'turtle',kind:'walker',x:128,y:72,w:16,h:24}]},markers:[{id:'turtle',kind:'enemy-koopa',source:{smart:true}}],enemySkins:{turtle:'enemy-koopa'}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],emit(){}});let previous=-.5,lastTurn=-100,turns=0,min=Infinity,max=-Infinity;
 for(let i=0;i<300;i++){s.step();const e=s.view().enemies[0];assert.equal(e.y,72);if(e.vx!==previous){assert.ok(i-lastTurn>8,'rapid edge oscillation');lastTurn=i;turns++;}previous=e.vx;min=Math.min(min,e.x);max=Math.max(max,e.x);}
 assert.ok(turns>1);assert.ok(max-min>=7);}
});


test('mushroom growth freezes movement and preserves the bottom anchor',()=>{const s=fixture([],[],{x:32,y:194},[{id:'reward',kind:'hidden-block',x:32,y:144,source:{contents:'Mushroom'}}]);s.step();for(let t=0;t<15;t++)s.step({jump:true});for(let t=0;t<45;t++)s.step();let grown;for(let t=0;t<140;t++){s.step({x:1});if(s.view().p.growth){grown=s.view().p;break;}}assert.ok(grown);assert.equal(grown.power,1);assert.equal(grown.h,28);assert.equal(grown.growth,24);for(let t=0;t<24;t++)s.step({x:1});const end=s.view().p;assert.equal(end.x,grown.x);assert.equal(end.y+end.h,grown.y+grown.h);assert.equal(end.growth,0);});

test('camera only advances and the left viewport boundary blocks backtracking',()=>{const s=fixture();for(let i=0;i<100;i++)s.step({x:1,run:true});const forward=s.view();assert.ok(forward.cam>0);for(let i=0;i<100;i++){s.step({x:-1,run:true});assert.ok(s.view().cam>=forward.cam);}assert.equal(s.view().p.x,s.view().cam);assert.equal(s.view().p.vx,0);});

test('elevator generators create two cycling platforms each, carry riders and release on wrap',()=>{
 for(const direction of [1,-1]){const y=direction>0?112:96;const s=fixture([],[],{x:110,y:y-14},[{id:'lift',kind:'platform-generator',x:100,y:208,source:{width:24,direction}}]);
 const initial=s.view().geometry.filter(g=>g.liftSpeed);assert.equal(initial.length,2);assert.equal(initial[0].w,48);assert.equal(initial[0].y-initial[1].y,96);
 for(let i=0;i<8;i++)s.step();const v=s.view(),lift=v.geometry.find(g=>g.id==='lift-lift-1');assert.ok(Math.abs(lift.y-(y+8*direction*.84))<.001);assert.equal(v.p.support,lift.id);assert.ok(Math.abs(v.p.y+v.p.h-lift.y)<.001);
 for(let i=0;i<320;i++)s.step();assert.ok(s.view().geometry.filter(g=>g.liftSpeed).every(g=>g.y>=-8&&g.y<=240));
 }
});

test('walking enemies separate once and turn away rather than overlap or jitter',()=>{const s=fixture([], [{id:'a',kind:'walker',type:'enemy-goomba',x:180,y:192,w:16,h:16},{id:'b',kind:'walker',type:'enemy-koopa',x:190,y:184,w:16,h:24}]);s.step();let [a,b]=s.view().enemies;assert.ok(a.x+a.w<=b.x);assert.ok(a.vx<0&&b.vx>0);for(let i=0;i<20;i++)s.step();[a,b]=s.view().enemies;assert.ok(a.vx<0&&b.vx>0);assert.ok(a.x+a.w<b.x);});

test('each 100 coins awards one life and carries remainder; each coin scores 200',()=>{const sounds=[],coins=Array.from({length:205},(_,i)=>({id:'c'+i,kind:'coin',x:32,y:194,w:10,h:14})),s=fixture([],coins,{x:32,y:194},[],(t,d)=>{if(t==='sound')sounds.push(d.event);});s.step();assert.equal(s.view().lives,5);assert.equal(s.view().coins,5);assert.equal(s.view().score,41000);assert.equal(sounds.filter(x=>x==='life').length,2);s.step();assert.equal(s.view().lives,5);});

test('held run crosses a one-tile gap from rest at either edge, walking and wider pits still fall',()=>{
 for(const dir of [-1,1])for(const gap of [16,32])for(const run of [true,false]){
  const m=createPlatformMotor(),p=m.create(character,{x:dir>0?159:160+gap-9,y:194}),solids=[{id:'a',x:0,y:208,w:160,h:32,collision:'solid'},{id:'b',x:160+gap,y:208,w:500,h:32,collision:'solid'}];p.grounded=true;
  for(let i=0;i<70;i++)m.step(p,{x:dir,run},character,{width:800,solids});
  if(gap===16&&run){assert.equal(p.y,194);assert.ok(dir>0?p.x>160+gap:p.x+p.w<160);}else assert.ok(p.y>240);
 }
});

test('8-4 returning through a used pipe retracts its active plant before emergence',async()=>{
 const fs=await import('node:fs/promises'),{fromTemplate}=await import('../atlas/editor-model.mjs'),{projectPack}=await import('../atlas/editor-runtime.mjs'),{createStageCatalog}=await import('../atlas/runtime/stage-catalog.mjs');
 const read=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));
 const d=fromTemplate(await read('../generated/levels/8-4/template.json')),r=d.rooms.find(r=>r.roomId==='area-0');
 Object.assign(r.map.objects.find(o=>o.id==='inspection-start'),{x:600,y:162,w:10,h:14});
 const pack=projectPack(d,'area-0',await read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,emit(){}});
 for(let i=0;i<105;i++)s.step();assert.ok(s.view().enemies.find(e=>e.id==='r005-plant').y<176);
 s.step({interact:true});assert.equal(s.view().transition?.phase,'enter');for(let i=0;i<56;i++)s.step();assert.equal(s.view().transition?.phase,'exit');
 assert.equal(s.view().enemies.find(e=>e.id==='r005-plant').y,176);
 for(let i=0;i<300;i++)s.step();assert.equal(s.view().lives,3);assert.equal(s.view().enemies.find(e=>e.id==='r005-plant').y,176);
});

test('8-4 plants retract while returning from the terminal decorative pipe',async()=>{
 const fs=await import('node:fs/promises'),{fromTemplate}=await import('../atlas/editor-model.mjs'),{projectPack}=await import('../atlas/editor-runtime.mjs'),{createStageCatalog}=await import('../atlas/runtime/stage-catalog.mjs');
 const read=async p=>JSON.parse(await fs.readFile(new URL(p,import.meta.url),'utf8'));
 const d=fromTemplate(await read('../generated/levels/8-4/template.json')),r=d.rooms.find(r=>r.roomId==='area-0');
 // Explicit terminal return suppresses the destination plant during emergence.
 Object.assign(r.map.objects.find(o=>o.id==='inspection-start'),{x:1355,y:98,w:10,h:14});
 const pack=projectPack(d,'area-0',await read('../atlas/runtime/character.json')),plan=createStageCatalog(pack).plan(pack.stages[0].id,pack.characters[0].id,{allowDraft:true}),s=createPlatformStage({plan,motor:createPlatformMotor(),visualRooms:d.rooms,manualDeath:true,emit(){}});
 for(let i=0;i<150;i++)s.step({down:true});
 const v=s.view(),plant=v.enemies.find(e=>e.id==='r005-plant');
 assert.equal(v.p.dying,undefined);assert.equal(v.lives,3);assert.ok(v.p.x<400);assert.ok(!plant||plant.y>=plant.clipTop,'destination plant stays hidden or omitted');
});


test('held pipe input waits for grounded alignment instead of requiring another press',()=>{
 const portal={id:'portal',kind:'portal',x:96,y:156,w:32,h:24,targetRoom:'main',targetSpawn:'start'},pipe={id:'pipe',material:'pipe',x:96,y:176,w:32,h:32,collision:'solid'};
 const s=fixture([pipe],[portal],{x:105,y:100});let entered=false;
 for(let i=0;i<100;i++){s.step({interact:true});const v=s.view();if(v.transition){assert.equal(v.transition.phase,'enter');assert.equal(v.p.y,162);entered=true;break;}}
 assert.ok(entered);
});

test('vertical pipe accepts a grounded edge-overlap without side entry',()=>{
 const portal={id:'portal',kind:'portal',x:96,y:156,w:32,h:24,targetRoom:'main',targetSpawn:'start'},pipe={id:'pipe',material:'pipe',x:96,y:176,w:32,h:32,collision:'solid'};
 const s=fixture([pipe],[portal],{x:120,y:162});for(let i=0;i<26;i++)s.step();s.step({down:true});assert.equal(s.view().transition?.phase,'enter');
});

test('game over can continue from the recorded death position for testing',()=>{
 const room={roomId:'main',setting:'Overworld',map:{width:512,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:64,y:194,w:10,h:14},{id:'hazard',kind:'hazard',x:64,y:194,w:10,h:14}]},markers:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],emit(){}});
 for(let i=0;i<540&&!s.view().completed;i++)s.step();
 assert.equal(s.view().completed,true);assert.equal(s.view().lives,0);
 const deathX=s.view().p.x;assert.equal(s.continueFromCurrent(),true);
 assert.equal(s.view().completed,false);assert.equal(s.view().lives,1);assert.equal(s.view().p.x,deathX);assert.equal(s.view().p.dying,false);
});

test('continue action is available during the death animation without resetting remaining lives',()=>{
 const room={roomId:'main',setting:'Overworld',map:{width:512,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:64,y:194,w:10,h:14},{id:'hazard',kind:'hazard',x:64,y:194,w:10,h:14}]},markers:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],emit(){}});s.step();
 const deathX=s.view().p.x;assert.equal(s.view().p.dying,true);assert.equal(s.view().lives,2);assert.equal(s.continueFromCurrent(),true);assert.equal(s.view().p.dying,false);assert.equal(s.view().lives,2);assert.equal(s.view().p.x,deathX);
});

test('manual editor death waits at the death position instead of auto-respawning',()=>{
 const room={roomId:'main',setting:'Overworld',map:{width:512,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:64,y:194,w:10,h:14},{id:'hazard',kind:'hazard',x:64,y:194,w:10,h:14}]},markers:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],manualDeath:true,emit(){}});s.step();const deathX=s.view().p.x;
 for(let i=0;i<180;i++)s.step();assert.equal(s.view().lives,2);assert.equal(s.view().p.dying,true);assert.equal(s.view().p.x,deathX);assert.equal(s.continueFromCurrent(),true);
});

test('airborne shell contacts award repeated lives with sound, landing resets chain',()=>{
 const real=createPlatformMotor(),sounds=[];let land=false;
 const motor={...real,step(p){p.x=64;p.y=179;p.vy=1;p.grounded=land;return [];}};
 const enemy={id:'shell',kind:'walker',x:64,y:192,w:16,h:16};
 const room={roomId:'main',setting:'Overworld',map:{width:512,height:240,geometry:[{...floor,w:512},{id:'left',x:48,y:192,w:16,h:16,collision:'solid'},{id:'right',x:80,y:192,w:16,h:16,collision:'solid'}],objects:[{id:'start',kind:'spawn',x:64,y:178,w:10,h:14},enemy]},markers:[],enemySkins:{shell:'koopa'}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit:(type,data)=>{if(type==='sound')sounds.push(data.event);}});
 for(let i=0;i<200&&s.view().lives<5;i++)s.step();
 assert.equal(s.view().lives,5);assert.equal(sounds.filter(x=>x==='life').length,2);assert.ok(s.view().items.some(x=>x.text==='1UP'));
 land=true;s.step();land=false;const count=sounds.filter(x=>x==='life').length;for(let i=0;i<15;i++)s.step();assert.equal(sounds.filter(x=>x==='life').length,count);
});


for(const approach of [70,110,165,179])test(`plant approach at tick ${approach} finishes its active cycle without premature retreat`,()=>{
 const real=createPlatformMotor();let near=false;
 const motor={...real,step(p){p.x=near?105:32;p.y=50;p.vy=0;p.grounded=false;return [];}};
 const room={roomId:'main',setting:'Overworld',map:{width:512,height:240,geometry:[{...floor,w:512},{id:'pipe',material:'pipe',x:96,y:176,w:32,h:32,collision:'solid'}],objects:[{id:'start',kind:'spawn',x:32,y:50,w:10,h:14},{id:'plant',kind:'walker',x:104,y:152,w:16,h:24}]},markers:[],enemySkins:{plant:'piranha'}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit(){}});
 for(let i=0;i<approach;i++)s.step();near=true;let y=s.view().enemies[0].y;
 for(let i=0;i<190;i++){s.step();const next=s.view().enemies[0].y;assert.ok(Math.abs(next-y)<=.800001);
 const tick=approach+i+1;if(tick<90)assert.ok(next<=y+1e-8,'keep emerging despite proximity');if(tick>=90&&tick<=150)assert.equal(next,152,'complete exposed wait');y=next;}assert.equal(y,176);
 near=false;for(let i=0;i<190;i++){s.step();const next=s.view().enemies[0].y;assert.ok(Math.abs(next-y)<=.800001);y=next;}
});

for(const stop of [false,true])test(`Lakitu delayed respawn ${stop?'is cancelled at stop marker':'returns once and throws again'}`,()=>{
 const real=createPlatformMotor();let first=true,advance=false;
 const motor={...real,step(p){p.x=advance?250:100;p.y=first?27:5;p.vy=first?1:0;p.grounded=false;first=false;return [];}};
 const room={roomId:'main',setting:'Overworld',map:{width:1000,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:100,y:26,w:10,h:14},{id:'cloud',kind:'walker',x:100,y:40,w:16,h:24}]},markers:[{kind:'spawn-zone-LakituStop',x:240,y:208}],enemySkins:{cloud:'lakitu'}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit(){}});
 s.step();assert.equal(s.view().enemies.length,0);
 advance=stop;for(let i=0;i<959;i++)s.step();assert.equal(s.view().enemies.filter(e=>e.type==='lakitu').length,0);
 s.step();assert.equal(s.view().enemies.filter(e=>e.type==='lakitu').length,stop?0:1);
 for(let i=0;i<170;i++)s.step();assert.equal(s.view().enemies.filter(e=>e.type==='lakitu').length,stop?0:1);
 if(!stop)assert.ok(s.view().enemies.some(e=>/spiny/.test(e.type)));
});

for(const [startX,direction] of [[32,-1],[200,1],[100,0]])test(`cannon fires toward player ${direction}, suppresses adjacent shots`,()=>{
 const sounds=[];const s=fixture([{id:'gun',material:'cannon',x:104,y:144,w:16,h:64,collision:'solid'}],[],{x:startX,y:194},[],(t,d)=>{if(t==='sound')sounds.push(d.event);});
 for(let i=0;i<65;i++)s.step();const shots=s.view().enemies.filter(e=>e.type==='bulletbill');
 assert.equal(sounds.filter(e=>e==='cannon').length,direction?1:0);if(!direction)assert.equal(shots.length,0);else{assert.equal(shots.length,1);assert.equal(Math.sign(shots[0].vx),direction);assert.equal(shots[0].y,144);const x=shots[0].x;s.step();assert.equal(s.view().enemies.find(e=>e.id===shots[0].id).x,x+direction*2);}
});

test('developer auto continue revives at death position after animation, including last life',()=>{
 const room={roomId:'main',map:{width:512,height:240,geometry:[{...floor,w:512}],objects:[{id:'start',kind:'spawn',x:128,y:194,w:10,h:14},{id:'danger',kind:'hazard',x:128,y:194,w:10,h:14}]},markers:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],autoContinue:true,initialState:{lives:1},emit(){}});
 s.step();assert.equal(s.view().p.dying,true);for(let i=0;i<103;i++)s.step();assert.equal(s.view().p.dying,true);s.step();assert.equal(s.view().p.dying,false);assert.equal(s.view().p.x,128);assert.equal(s.view().lives,1);assert.equal(s.view().completed,false);assert.ok(s.view().invulnerable>0);
});

test('holding right while landing on a narrow spring still completes compression and launches',()=>{
 const s=fixture([{id:'spring',material:'spring',x:96,y:179,w:16,h:29,collision:'solid'}],[],{x:98,y:163});let compressed=false,launched=false;
 for(let i=0;i<24;i++){s.step({x:1,run:true,jump:true});const v=s.view();compressed||=!!v.p.springId;launched||=v.p.vy<-8;}
 assert.ok(compressed);assert.ok(launched);
});

test('running landing does not walk off spring during compression',()=>{
 const motor=createPlatformMotor(),room={roomId:'main',map:{width:512,height:240,geometry:[floor,{id:'spring',material:'spring',x:96,y:179,w:16,h:29,collision:'solid'}],objects:[{id:'start',kind:'spawn',x:94,y:163,w:10,h:14}]},markers:[]};const fast={...motor,create(c,o){return {...motor.create(c,o),vx:2.5,airCap:2.5};}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:fast,visualRooms:[room],emit(){}});let launched=false;
 for(let i=0;i<24;i++){s.step({x:1,run:true,jump:true});launched||=s.view().p.vy<-8;}assert.ok(launched);
});

test('stationary Koopa shell warns then recovers walking with feet fixed',()=>{
 const real=createPlatformMotor();let first=true;
 const motor={...real,step(p){p.x=first?100:32;p.y=first?171:40;p.vy=first?1:0;p.grounded=false;first=false;return [];}};
 const room={roomId:'main',map:{width:512,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:100,y:170,w:10,h:14},{id:'turtle',kind:'walker',x:100,y:184,w:16,h:24}]},markers:[],enemySkins:{turtle:'koopa'}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit(){}});
 s.step();assert.equal(s.view().enemies[0].shell,true);for(let i=0;i<480;i++)s.step();assert.equal(s.view().enemies[0].frame,'peeking');for(let i=0;i<120;i++)s.step();const e=s.view().enemies[0];assert.equal(e.shell,false);assert.equal(e.h,24);assert.equal(e.y+e.h,208);assert.ok(Math.abs(e.vx)>0);
});

for(const material of ['tree','shroom','platform'])test(`pit auto continue chooses nearby ${material} platform instead of distant start`,()=>{
 const room={roomId:'main',map:{width:1200,height:240,geometry:[{id:'start-land',x:0,y:208,w:80,h:32,collision:'solid'},{id:'near',material,x:700,y:144,w:96,h:16,collision:material==='platform'?'oneway':'solid'}],objects:[{id:'start',kind:'spawn',x:810,y:260,w:10,h:14}]},markers:[]};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:createPlatformMotor(),visualRooms:[room],autoContinue:true,emit(){}});
 for(let i=0;i<130;i++)s.step();const v=s.view();assert.equal(v.p.dying,false);assert.ok(v.p.x>=700&&v.p.x+v.p.w<=796);assert.equal(v.p.y+v.p.h,144);assert.equal(v.lives,2);
});

for(const power of [0,1,2])test(`flower pickup from power ${power} respects NES progression`,()=>{
 const room={roomId:'main',setting:'Overworld',map:{width:2000,height:240,geometry:[floor],objects:[{id:'start',kind:'spawn',x:32,y:194,w:10,h:14}]},markers:[{id:'reward',kind:'hidden-block',x:32,y:144,source:{contents:'Mushroom'}}]};
 let age=0;const base=createPlatformMotor(),events=[];
 const motor={...base,step(p){age++;p.headHit=null;p.vx=p.vy=0;if(age===1){p.power=1;p.h=28;p.headHit='reward';}if(age===40){p.power=power;p.h=power?28:14;p.x=33;p.y=130;}return [];}};
 const s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor,visualRooms:[room],emit:(type,data)=>events.push([type,data])});
 for(let i=0;i<39;i++)s.step();assert.equal(s.view().items.find(i=>i.kind==='flower')?.kind,'flower');s.step();
 const p=s.view().p;assert.equal(p.power,power===0?1:2);assert.equal(p.h,28);assert.equal(p.y+p.h,power===0?144:158);assert.equal(p.growth,power===0?24:0);assert.equal(p.fireGrowth,power===1?24:0);if(power===1){const before=s.view();for(let i=0;i<24;i++)s.step({x:1,jump:true,attack:true});const after=s.view();assert.equal(after.p.x,before.p.x);assert.equal(after.p.y,before.p.y);assert.equal(after.timeLeft,before.timeLeft);assert.equal(after.p.fireGrowth,0);assert.equal(after.p.power,2);assert.ok(!after.items.some(i=>i.kind==='fireball'));}assert.equal(events.filter(([t,d])=>t==='sound'&&d.event==='powerup').length,1);
});

for(const material of ['brick','block'])test(`${material} coin reward repeat and exhaustion`,()=>{
 const reward={id:'reward',x:32,y:144,w:16,h:16,collision:'solid',material};
 const room={roomId:'main',setting:'Overworld',map:{width:2000,height:240,geometry:[floor,reward],objects:[{id:'start',kind:'spawn',x:32,y:194,w:10,h:14}]},markers:[{id:'contents',kind:'block-contents',x:32,y:144,source:{contents:'Coin'}}]};
 let age=0;const base=createPlatformMotor(),s=createPlatformStage({plan:{character,stage:{entryRoom:'main',entrySpawn:'start'},rooms:{main:room.map}},motor:{...base,step(p){p.headHit=age++%20===0?'reward':null;return [];}},visualRooms:[room],emit(){}});
 for(let i=0;i<201;i++)s.step();assert.equal(s.view().coins,material==='brick'?10:1);assert.equal(s.view().geometry.find(g=>g.id==='reward').used,true);
});
