/** Executes actual UI handlers against a minimal DOM fixture.
 * This checks transactions, not browser rendering or pointer capture behavior. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
test('UI transactions: canceled autosave, pointer ownership, locking and undo',async()=>{
 const nodes=new Map(),listeners={};
 const context=new Proxy({},{get:(_,key)=>key==='createImageData'?(w,h)=>({data:new Uint8ClampedArray(w*h*4)}):()=>{}});
 class Element{
  constructor(id=''){this.id=id;this.value='';this.children=[];this.checked=false;this.clientWidth=800;this.clientHeight=480;this.style={};}
  replaceChildren(...a){this.children=a;}append(...a){this.children.push(...a);}setAttribute(){}
  getContext(){return context;}getBoundingClientRect(){return {left:0,top:0};}setPointerCapture(){}focus(){}
  click(){this.onclick?.();}closest(){return null;}showModal(){}close(){}
 }
 const get=id=>{if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);};
 get('layer').value='geometry';get('zoom').value='2';get('view').value='effect';get('grid').checked=true;
 const storage=new Map();
 globalThis.document={getElementById:get,createElement:()=>new Element(),querySelectorAll:()=>[],addEventListener:(k,f)=>{listeners[k]=f;}};
 globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 globalThis.window={addEventListener(){}};globalThis.devicePixelRatio=1;globalThis.ResizeObserver=class{observe(){}};
 await import('../atlas/editor.mjs');
 const c=get('canvas'),evt=(x,y,id=1)=>({clientX:x,clientY:y,pointerId:id,button:0,preventDefault(){}});
 const data=()=>{get('save').onclick();return JSON.parse([...storage.values()][0]);};
 // One completed stroke schedules autosave.
 c.onpointerdown(evt(0,320));c.onpointerup(evt(0,320));
 assert.equal(data().rooms[0].map.geometry.length,1);
 c.onpointerdown(evt(64,320));c.onpointerup(evt(64,320));
 // Begin a new stroke within that timer. Saving must serialize the committed state.
 c.onpointerdown(evt(128,320));await new Promise(r=>setTimeout(r,500));
 const savedDuringStroke=JSON.parse([...storage.values()][0]);assert.equal(savedDuringStroke.rooms[0].map.geometry.length,2);
 listeners.keydown({target:new Element(),key:'Escape'});assert.equal(data().rooms[0].map.geometry.length,2);
 // Ignore another finger; its up must not finish the owned gesture.
 c.onpointerdown(evt(192,320,1));c.onpointerdown(evt(256,320,2));c.onpointerup(evt(256,320,2));
 c.onpointermove(evt(224,320,1));c.onpointerup(evt(224,320,1));
 assert.equal(data().rooms[0].map.geometry.length,4);
 get('undo').onclick();assert.equal(data().rooms[0].map.geometry.length,2);
 get('redo').onclick();assert.equal(data().rooms[0].map.geometry.length,4);
 get('locked').checked=true;get('locked').onchange();c.onpointerdown(evt(320,320));c.onpointerup(evt(320,320));
 assert.equal(data().rooms[0].map.geometry.length,4);
 await new Promise(r=>setTimeout(r,500));
});
