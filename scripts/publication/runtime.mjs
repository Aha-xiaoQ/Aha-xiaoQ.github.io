/** Production-only projection of legacy management loading. Never modifies source. */
export function publicRuntime(p,bytes){
 if(!['assets/journal/runtime.mjs','assets/journal/render.mjs'].includes(p))return bytes;
 let s=bytes.toString();if(s.startsWith('/* public-edition:R24 */'))return bytes;
 if(p==='assets/journal/runtime.mjs'){
  const start=s.indexOf('function loadScript(path){'),end=s.indexOf('const legacyByProject=new Map();');
  if(start<0||end<=start||!s.slice(start,end).includes('async function prepareLegacy'))throw Error('旧记录加载器结构变化，需要审阅发布适配。');
  s=s.slice(0,start)+"async function prepareLegacy(){throw Error('管理工具仅在源码工作区提供。');}\n"+s.slice(end);
 }
 if(p==='assets/journal/render.mjs'){
  const start=s.indexOf('function managePage('),end=s.indexOf('export function render(',start);
  if(start<0||end<=start)throw Error('管理模板结构变化，需要审阅发布适配。');
  s=s.slice(0,start)+"function managePage(){return '';}\n"+s.slice(end);
 }
 return Buffer.from('/* public-edition:R24 */\n'+s);
}
