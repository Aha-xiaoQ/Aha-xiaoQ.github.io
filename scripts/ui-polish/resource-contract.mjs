/** Actual script/link declarations own load order; import-map entries are data.
 * This is the site's blocking classic-helper contract, not a general scheduler.
 */
import {resourceElements} from '../lib/html-resources.mjs';
const MIME=new Set(['application/ecmascript','application/javascript','application/x-ecmascript','application/x-javascript','text/ecmascript','text/javascript','text/javascript1.0','text/javascript1.1','text/javascript1.2','text/javascript1.3','text/javascript1.4','text/javascript1.5','text/jscript','text/livescript','text/x-ecmascript','text/x-javascript']);
export function scriptKind(attrs){
 const type=Object.hasOwn(attrs,'type')?attrs.type.trim().toLowerCase():attrs.language?'text/'+attrs.language.trim().toLowerCase():'';
 if(type==='module')return 'module';
 if(type===''||MIME.has(type))return 'classic';
 return 'data';
}
export function interactionResources(html,{page='index.html',origin='https://aha-xiaoq.github.io'}={}){
 const elements=resourceElements(html),documentURL=new URL(page,origin+'/');let base=documentURL;
 const baseElement=elements.find(e=>e.tag==='base'&&Object.hasOwn(e.attributes,'href'));
 if(baseElement){try{base=new URL(baseElement.attributes.href,documentURL);}catch{ /* invalid base falls back to the document URL */ }}
 const localPath=value=>{try{const u=new URL(value,base);return u.origin===documentURL.origin&&!u.username&&!u.password?u.pathname:null;}catch{return null;}};
 const scripts=elements.filter(e=>e.tag==='script'&&Object.hasOwn(e.attributes,'src')).map(e=>({...e,path:localPath(e.attributes.src),kind:scriptKind(e.attributes)}));
 const helpers=scripts.filter(e=>e.path==='/assets/ui/site-actions.js'&&e.kind!=='data');
 const styles=elements.filter(e=>e.tag==='link'&&Object.hasOwn(e.attributes,'data-site-actions-css'));
 const consumers=scripts.filter(e=>e.kind!=='data'&&['/assets/promo.js','/assets/site-shell.js'].includes(e.path));
 const issues=[];
 if(styles.length!==1||!styles[0].attributes.rel?.toLowerCase().split(/\s+/).includes('stylesheet')||localPath(styles[0].attributes.href)!=='/assets/ui/site-actions.css'||Object.hasOwn(styles[0].attributes,'disabled'))issues.push('interaction stylesheet must occur once');
 if(helpers.length!==1)issues.push('interaction helper must occur once');
 if(helpers.length===1){
  const helper=helpers[0],a=helper.attributes;
  if(helper.kind!=='classic'||['async','defer','nomodule'].some(k=>Object.hasOwn(a,k)))issues.push('interaction helper must be a blocking classic script');
  if(consumers.some(e=>e.offset<helper.offset))issues.push('helper must precede site renderers');
 }else if(!helpers.length)issues.push('helper must precede site renderers');
 return {issues,scripts,helpers,styles,consumers};
}
