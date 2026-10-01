import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../../assets/site-transition-r65.js', import.meta.url), 'utf8');
function fixture({reduce=false, io=true, compact=false, hidden=false}={}) {
  const listeners = new Map(), queries = new Map(), observers = [], calls = [];
  const bind = (key, fn) => { const fns=listeners.get(key)||[];fns.push(fn);listeners.set(key,fns); };
  class Element {
    constructor(kind,top=120){this.kind=kind;this.top=top;this.isConnected=true;}
    matches(){return this.kind==='h1';}
    getBoundingClientRect(){return {top:this.top,bottom:this.top+180,width:600,height:180};}
    contains(target){return target===this;}
    animate(frames,options){
      let cancel;
      const result={effect:{target:this},cancelled:false,frames,options,finished:new Promise((_,reject)=>{cancel=reject;}),cancel(){this.cancelled=true;cancel(new Error('cancelled'));}};
      calls.push(result);return result;
    }
  }
  const title=new Element('h1'),card=new Element('card',1100);
  const app={querySelectorAll:selector=>selector.includes('.identity__visual')?[title]:[card]};
  const doc={hidden,readyState:'complete',documentElement:{classList:{add(){}}},getElementById:()=>app,addEventListener:bind};
  const context={document:doc,location:{pathname:'/',hash:''},scrollY:0,innerHeight:900,Element,Date,Set,WeakSet,
    requestAnimationFrame:fn=>fn(),addEventListener:bind,
    matchMedia:q=>{if(!queries.has(q))queries.set(q,{matches:q.includes('reduce')?reduce:compact,addEventListener:(_,fn)=>bind(q,fn)});return queries.get(q);}};
  context.window=context;
  if(io)context.IntersectionObserver=class {
    constructor(fn){this.fn=fn;this.targets=new Set();observers.push(this);}
    observe(e){this.targets.add(e);}unobserve(e){this.targets.delete(e);}disconnect(){this.targets.clear();}
  };
  vm.runInNewContext(source,context);
  return {context,doc,title,card,calls,queries,observers,emit:(name,event={})=>listeners.get(name)?.forEach(fn=>fn(event))};
}
test('first paint stays ready with reduced motion and no animations',()=>{
 const f=fixture({reduce:true});assert.ok(f.context.__qTransitionStatus.readyAt);assert.equal(f.calls.length,0);assert.equal(f.observers.length,0);
});
test('artwork angles remain owned by CSS and animation has no forwards fill',()=>{
 const f=fixture();assert.equal(f.calls.length,1);assert.equal(f.calls[0].effect.target,f.title);
 assert.ok(f.calls[0].frames.every(frame=>!('transform' in frame)&&!('rotate' in frame)));
 assert.equal(f.calls[0].options.fill,'backwards');assert.ok(f.calls[0].options.duration<650);
});
test('repeated hydration of the same elements does not replay their entry',()=>{
 const f=fixture();f.context.SITE_MOTION.mount();assert.equal(f.calls.length,1);
});
test('scroll reveal occurs once and releases its observer target',()=>{
 const f=fixture(),o=f.observers.at(-1);assert.ok(o.targets.has(f.card));
 const entry={target:f.card,isIntersecting:true,boundingClientRect:{top:650}};
 o.fn([entry]);o.fn([entry]);assert.equal(f.calls.length,2);assert.ok(!o.targets.has(f.card));
});
test('live reduced-motion preference immediately cancels active effects',()=>{
 const f=fixture();f.queries.get('(prefers-reduced-motion: reduce)').matches=true;
 f.emit('(prefers-reduced-motion: reduce)');assert.ok(f.calls.every(a=>a.cancelled));assert.ok(f.observers.every(o=>o.targets.size===0));
});
test('focused content stops moving without cancelling unrelated content',()=>{
 const f=fixture();f.emit('focusin',{target:f.title});assert.ok(f.calls[0].cancelled);
});
test('hidden documents release effects and do not replay on resume',()=>{
 const f=fixture();f.doc.hidden=true;f.emit('visibilitychange');assert.ok(f.calls[0].cancelled);
 f.doc.hidden=false;f.emit('visibilitychange');assert.equal(f.calls.length,1);
});
test('missing observer remains a visible-content progressive enhancement',()=>{
 const f=fixture({io:false});assert.ok(f.context.__qTransitionStatus.readyAt);assert.equal(f.calls.length,1);assert.doesNotThrow(()=>f.context.SITE_MOTION.mount());
});
test('history restoration suppresses new entry animations',()=>{
 const f=fixture();f.context.location.pathname='/notes/';f.context.SITE_MOTION.mount({entry:false});assert.equal(f.calls.length,1);assert.ok(f.calls[0].cancelled);
});
test('headings fade in place, with no scaling or overshoot',()=>{
 const f=fixture();assert.ok(f.calls[0].frames.every(frame=>!('translate' in frame)&&!('scale' in frame)));
 assert.equal(f.calls[0].options.delay,0);assert.equal(f.calls[0].options.duration,240);
});
test('cards settle only a few pixels and mobile travels less',()=>{
 const desktop=fixture(),mobile=fixture({compact:true});
 for(const f of [desktop,mobile])f.observers.at(-1).fn([{target:f.card,isIntersecting:true,boundingClientRect:{top:650}}]);
 assert.equal(desktop.calls[1].frames[0].translate,'0 6px');assert.equal(mobile.calls[1].frames[0].translate,'0 4px');
 assert.ok(desktop.calls[1].frames.every(frame=>!('scale' in frame)));
});
