/** Build-time asset identity. Import maps make historical ESM cache literals resolve
 * to one current URL per file, without rewriting or duplicating source modules. */
import path from 'node:path';
import {createHash} from 'node:crypto';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex').slice(0,16);
const suffix=/\.(?:mjs|js)$/i;
const fakeOrigin='https://assets.invalid';
export function importMap(files) {
  const imports=Object.create(null);
  const modules=new Map([...files].filter(([p,b])=>p.startsWith('assets/')&&suffix.test(p)&&Buffer.isBuffer(b)));
  const add=(from,raw)=>{
    if(typeof raw!=='string'||!raw||/[\s\\<>]/.test(raw)||/^(?:https?:|data:|node:|blob:|\/\/)/.test(raw))return;
    if(!raw.startsWith('.')&&!raw.startsWith('/'))return;
    let u;try{u=new URL(raw,fakeOrigin+'/'+from);}catch{return;}
    const rel=u.pathname.slice(1),bytes=modules.get(rel);if(!bytes)return;
    const key=u.pathname+u.search+u.hash;
    u.searchParams.set('v',hash(bytes));imports[key]=u.pathname+u.search+u.hash;
  };
  for(const[p]of modules)add(p,'/'+p);
  // Only existing same-site code can be mapped. Apparent paths inside documentation
  // cannot create fetches, authorize files, or add executable content to a release.
  for(const[p,b]of files){
    if(!/\.(?:mjs|js|html)$/.test(p))continue;
    const source=b.toString('utf8');
    for(const m of source.matchAll(/['"]((?:\.{1,2}\/|\/)[^'"\s<>]+\.(?:mjs|js)(?:\?[^'"\s<>]*)?(?:#[^'"\s<>]*)?)['"]/g))add(p,m[1]);
    // Router-owned URL constructors resolve relative to the router file URL.
    if(p==='assets/site-router.js')for(const m of source.matchAll(/new URL\(["']([^"']+\.(?:mjs|js)(?:\?[^"']*)?)["'],\s*routerURL\)/g))add(p,'./'+m[1]);
    if(p.endsWith('.html'))for(const m of source.matchAll(/\b(?:src|href)=["']([^"']+\.(?:mjs|js)(?:\?[^"']*)?)["']/g))add(p,m[1].startsWith('.')||m[1].startsWith('/')?m[1]:'./'+m[1]);
  }
  if(Object.keys(imports).length>20000)throw Error('Import map exceeds site budget');
  return {imports:Object.fromEntries(Object.entries(imports).sort(([a],[b])=>a.localeCompare(b,'en')))};
}
export function assetPath(url) {
  if(typeof url!=='string'||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url))return null;
  const clean=url.replace(/^(?:\.\.\/)+/,'').replace(/^\//,'').split(/[?#]/)[0];
  return /^(?:assets|content)\/[a-zA-Z0-9_/.-]+\.(?:js|mjs|css)$/.test(clean)&&!clean.split('/').some(p=>p==='.'||p==='..')?clean:null;
}
export function versionResources(html,reader) {
  return html.replace(/(\b(?:src|href)=["'])([^"']+)(["'])/g,(all,a,url,z)=>{
    const rel=assetPath(url);if(!rel)return all;
    // Existing route/ESM versions remain owned by their established generators.
    if(!['assets/site-i18n.js','assets/site-i18n-data.js','assets/i18n/messages.js','assets/platform/config.js','assets/platform/typography.css'].includes(rel))return all;
    const bytes=reader(rel);if(!bytes)throw Error('Missing shared platform asset: '+rel);
    const parsed=new URL(url,'https://assets.invalid/');parsed.searchParams.set('v',hash(bytes));
    return a+url.split(/[?#]/)[0]+parsed.search+parsed.hash+z;
  });
}
export function mapMarkup(map) {
  return '<script type="importmap" data-platform-importmap>'+JSON.stringify(map).replace(/</g,'\\u003c')+'</script>';
}
