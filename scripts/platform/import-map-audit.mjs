/** Validate the exact inline map carried by a public HTML page. No execution. */
const attributes=source=>{const out={};for(const m of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))out[m[1].toLowerCase()]=m[2]??m[3]??m[4]??'';return out;};
const decode=value=>value.replace(/&#x([0-9a-f]+);|&#(\d+);/gi,(_,hex,dec)=>{const cp=parseInt(hex||dec,hex?16:10);return cp<=0x10ffff?String.fromCodePoint(cp):'\ufffd';});
export function safeMapTarget(value){
 if(typeof value!=='string'||!value.startsWith('/assets/')||/[\\\u0000-\u0020<>"'`]/.test(value))return false;
 const pathname=value.split(/[?#]/)[0];
 return /\.(?:js|mjs)$/.test(pathname)&&!/%(?:2e|2f|5c|00)/i.test(pathname)&&!pathname.split('/').some(p=>p==='.'||p==='..');
}
export function importMapData(text){
 const clean=String(text).replace(/<!--[\s\S]*?-->/g,'');
 const maps=[...clean.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>decode(attributes(m[1]).type||'').toLowerCase()==='importmap');
 const refs=[],errors=[];if(maps.length>1)errors.push('duplicate-import-map');
 for(const m of maps){try{
  const data=JSON.parse(m[2]);if(!data||typeof data!=='object'||Array.isArray(data)||!data.imports||typeof data.imports!=='object'||Array.isArray(data.imports)||Object.keys(data).some(k=>k!=='imports')||Object.keys(data.imports).length>20000)throw Error('shape');
  for(const[key,value]of Object.entries(data.imports)){if(!safeMapTarget(key)||!safeMapTarget(value))throw Error('target');refs.push({raw:value,tag:'js',key:'import-map'});}
 }catch{errors.push('invalid-import-map');}}
 return{refs,errors};
}
