import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
export const cacheTag=p=>createHash('sha256').update(fs.readFileSync(new URL(p,root))).digest('hex').slice(0,16);
export function assertRuntimeRevision(){
 const {revision}=JSON.parse(read('assets/journal/data/revision.json'));
 assert.ok(read('assets/journal/runtime.mjs').includes('render.mjs?v='+revision));
 assert.ok(read('assets/site-router.js').includes('journal/runtime.mjs?v='+revision));
}
export function assertNativeCaches(html){
 assert.ok(html.includes('site-router.js?v='+cacheTag('assets/site-router.js')),'Native router tag must match its content digest');
 assert.ok(html.includes('journal.css?v='+cacheTag('assets/journal/journal.css')),'Native journal stylesheet must match its content digest');
}
