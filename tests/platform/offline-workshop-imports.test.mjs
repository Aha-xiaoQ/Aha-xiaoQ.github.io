import test from 'node:test';import assert from 'node:assert/strict';
import {importMapData} from '../../scripts/platform/import-map-audit.mjs';
const moduleURL=source=>'data:text/javascript;charset=utf-8,'+encodeURIComponent(source);
const html=imports=>'<script type="importmap">'+JSON.stringify({imports})+'</script>';
test('standalone workshop modules form an inline, syntax-checked import closure',()=>{
 const map={'workshop/main.mjs':moduleURL("import {x} from 'workshop/runtime/data.mjs'; export const y=x;"),'workshop/runtime/data.mjs':moduleURL('export const x=1;')};
 assert.deepEqual(importMapData(html(map)),{refs:[],errors:[]});
});
for(const [name,imports]of Object.entries({
 remote:{'workshop/main.mjs':'https://example.org/main.mjs'},
 javascript:{'workshop/main.mjs':'javascript:alert(1)'},
 unbound:{'workshop/main.mjs':moduleURL("import 'workshop/missing.mjs';")},
 dynamic:{'workshop/main.mjs':moduleURL('export const load=x=>import(x);')},
 malformed:{'workshop/main.mjs':moduleURL('export const = ;')},
 traversal:{'workshop/../main.mjs':moduleURL('export const x=1;')},
 mixed:{'/assets/site.mjs':'/assets/site.mjs','workshop/main.mjs':moduleURL('export const x=1;')},
 encoding:{'workshop/main.mjs':'data:text/javascript;charset=utf-8,%ZZ'}
}))test('offline map rejects '+name,()=>assert.ok(importMapData(html(imports)).errors.includes('invalid-import-map')));
