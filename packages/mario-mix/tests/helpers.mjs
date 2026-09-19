import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {PACKAGE,read,gitBlob,replacement} from '../scripts/core.mjs';
export const golden=read(PACKAGE,'tests/fixtures/bill-controls.original.txt');
export const head=`// SYNTHETIC host for the real controls excerpt; NOT the original full game.\n(()=>{\nlet hero='bill', room='surface', T=16, jumpBuffer=9;\nconst player={x:20,y:82,w:14,h:30,grounded:true,facing:1,vy:0,crouch:true};\nlet support=[{type:'brick',y:7,hidden:false}],moveHits=[],throwMove=false;\nfunction solids(box,hidden=false){return support.slice();}\nfunction moveBody(body,dx,dy,isPlayer=false){moveHits=solids(body);if(throwMove)throw new Error('synthetic movement fault');body.x+=dx;body.y+=dy;return 123;}\n`;
export const tail=`\nglobalThis.__controlProbe={\nconfigure(c){if(c.player)Object.assign(player,c.player);if(c.support)support=c.support;if(c.hero)hero=c.hero;if(c.room)room=c.room;if('throwMove'in c)throwMove=c.throwMove;},\naim(input){updateBillAim(input);return {x:billAimX,y:billAimY};},\ndescend:beginBillDescent,\nmove(dx,dy,target='player',isPlayer=true){return moveBody(target==='player'?player:{...player},dx,dy,isPlayer);},\nreset:resetBillControls,\nstate(){return {hero,room,jumpBuffer,player:{...player},row:billDropRow,held:billDownJumpHeld,dropCollision:billDropCollision,hits:moveHits.map(t=>({...t})),aimX:billAimX,aimY:billAimY};}\n};})();\n`;
export function probe(block=golden){const context=vm.createContext({});new vm.Script(head+block+tail).runInContext(context,{timeout:1000});return context.__controlProbe;}
export function nextProbe(){return probe(replacement());}
export const plain = x => JSON.parse(JSON.stringify(x));
export function sandbox(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mm-r05-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const root=path.join(dir,'repo'),pkg=path.join(root,'packages/mario-mix');
 fs.mkdirSync(pkg,{recursive:true});fs.cpSync(PACKAGE,pkg,{recursive:true,filter:p=>!p.split(path.sep).some(s=>s==='.local'||s==='node_modules')});
 const game=path.join(root,'games/mario-mix');fs.mkdirSync(game,{recursive:true});
 const runtime=head+golden+tail;
 const html='<!doctype html><meta charset="utf-8"><title>synthetic fixture</title><script src="classic-mix.js"></script><script defer src="/assets/site-analytics.js?v=fixture"></script>';
 fs.writeFileSync(path.join(game,'classic-mix.js'),runtime);fs.writeFileSync(path.join(game,'play.html'),html);fs.writeFileSync(path.join(game,'bill-controls.js'),golden);
 const lock=JSON.parse(fs.readFileSync(path.join(pkg,'baseline.json'),'utf8'));
 // TEST ONLY: allow the explicitly labeled synthetic host, never a production bypass.
 lock.runtimeBlob=gitBlob(runtime);lock.entries[0].blob=gitBlob(html);lock.scope='SYNTHETIC TEST FIXTURE ONLY';
 fs.writeFileSync(path.join(pkg,'baseline.json'),JSON.stringify(lock,null,2));
 fs.mkdirSync(path.join(game,'assets'),{recursive:true});fs.writeFileSync(path.join(game,'assets/test.txt'),'synthetic asset');
 return {root,pkg,runtime,html,dir};
}
