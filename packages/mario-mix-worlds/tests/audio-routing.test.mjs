import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {audioFiles,themeFor} from '../atlas/editor-audio.mjs';
test('room music distinguishes castle, water, underground and star priority',()=>{
 for(const [setting,key] of [['Castle','castle'],['Underwater','underwater'],['Underworld','underworld'],['Overworld Night','overworld']]){
  assert.equal(themeFor(setting),key);
  assert.equal(themeFor(setting,false,100),'hurry_'+key);
  assert.equal(themeFor(setting,true),'star');
  assert.equal(themeFor(setting,true,99),'hurry_star');
 }
});
test('all exported audio mappings resolve to nonempty local recordings',async()=>{
 for(const file of new Set(Object.values(audioFiles))){const bytes=await readFile(new URL('../../../games/mario-mix/assets/classic-audio/'+file,import.meta.url));assert.ok(bytes.length>100,file);}
});
