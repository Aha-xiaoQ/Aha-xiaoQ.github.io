import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSound} from '../atlas/editor-audio.mjs';
test('restart retries blocked music and ignores an obsolete playback rejection',async()=>{
 const original=globalThis.Audio,created=[];
 globalThis.Audio=class{constructor(){this.paused=true;created.push(this);}pause(){this.paused=true;}play(){this.paused=false;return new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});}};
 try{
  const sound=createSound(),first=sound.background('underwater');created[0].reject(Error('blocked'));await first;assert.equal(sound.blocked,true);
  sound.stop();sound.unlock();const second=sound.background('underwater');created[1].resolve();await second;assert.equal(sound.snapshot().playing,true);
  sound.stop();const stale=sound.background('castle');sound.stop();sound.unlock();const current=sound.background('underwater');created[2].reject(Error('interrupted'));created[3].resolve();await Promise.all([stale,current]);assert.equal(sound.blocked,false);assert.equal(sound.snapshot().track,'underwater');
  sound.toggle();sound.unlock();await sound.background('underwater');assert.equal(sound.enabled,false);assert.equal(sound.snapshot().playing,false);
 }finally{globalThis.Audio=original;}
});
