/** Validate the exact inline map carried by a public HTML page. No execution. */
import {parse} from './vendor/acorn/acorn.mjs';
const attributes=source=>{const out={};for(const m of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))out[m[1].toLowerCase()]=m[2]??m[3]??m[4]??'';return out;};
const decode=value=>value.replace(/&#x([0-9a-f]+);|&#(\d+);/gi,(_,hex,dec)=>{const cp=parseInt(hex||dec,hex?16:10);return cp<=0x10ffff?String.fromCodePoint(cp):'\ufffd';});
export function safeMapTarget(value){
 if(typeof value!=='string'||!value.startsWith('/assets/')||/[\\\u0000-\u0020<>"'`]/.test(value))return false;
 const pathname=value.split(/[?#]/)[0];
 return /\.(?:js|mjs)$/.test(pathname)&&!/%(?:2e|2f|5c|00)/i.test(pathname)&&!pathname.split('/').some(p=>p==='.'||p==='..');
}
// Offline workshop exports carry their whole module graph in canonical data
// URLs. Validate that graph separately; ordinary site maps retain /assets rules.
function embeddedWorkshopMap(imports){
 const entries=Object.entries(imports),prefix='data:text/javascript;charset=utf-8,';
 if(!entries.length||entries.length>1000||entries.reduce((n,[,v])=>n+(typeof v==='string'?v.length:0),0)>40000000)throw Error('embedded size');
 for(const[key,value]of entries){
  if(!/^workshop\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.mjs$/.test(key)||typeof value!=='string'||!value.startsWith(prefix))throw Error('embedded target');
  const encoded=value.slice(prefix.length),code=decodeURIComponent(encoded);
  if(!code.trim()||encodeURIComponent(code)!==encoded)throw Error('embedded encoding');
  const ast=parse(code,{ecmaVersion:'latest',sourceType:'module'}),pending=[ast];
  while(pending.length){const node=pending.pop();
   if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration','ImportExpression'].includes(node.type)&&node.source){
    if(node.source.type!=='Literal'||typeof node.source.value!=='string'||!Object.hasOwn(imports,node.source.value))throw Error('unbound embedded import');
   }
   for(const v of Object.values(node))if(v&&typeof v==='object'){if(Array.isArray(v))pending.push(...v.filter(x=>x&&typeof x==='object'));else pending.push(v);}
  }
 }
}
export function importMapData(text){
 const clean=String(text).replace(/<!--[\s\S]*?-->/g,'');
 const maps=[...clean.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>decode(attributes(m[1]).type||'').toLowerCase()==='importmap');
 const refs=[],errors=[];if(maps.length>1)errors.push('duplicate-import-map');
 for(const m of maps){try{
  const data=JSON.parse(m[2]);if(!data||typeof data!=='object'||Array.isArray(data)||!data.imports||typeof data.imports!=='object'||Array.isArray(data.imports)||Object.keys(data).some(k=>k!=='imports')||Object.keys(data.imports).length>20000)throw Error('shape');
  if(Object.keys(data.imports).some(k=>k.startsWith('workshop/')))embeddedWorkshopMap(data.imports);
  else for(const[key,value]of Object.entries(data.imports)){if(!safeMapTarget(key)||!safeMapTarget(value))throw Error('target');refs.push({raw:value,tag:'js',key:'import-map'});}
 }catch{errors.push('invalid-import-map');}}
 return{refs,errors};
}
