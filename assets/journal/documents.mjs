import {EXPERIMENTS} from './data/experiments.mjs?v=dev-r44-279054bb1330294e';
import {withExperimentDocuments} from '../platform/contracts.mjs';
/** Metadata is cheap. Article bodies load only on the selected reading route. */
import {DOCUMENTS} from './data/documents-index.mjs?v=dev-r44-279054bb1330294e';
const entries=new Map(DOCUMENTS.map(d=>[d.projectId+'/'+d.id,{...d}]));
const pending=new Map();
// The existing native-page generator needs synchronous article access in Node.
// This branch never downloads documents-data.mjs in a browser.
if(typeof window==='undefined'){
 const {DOCUMENTS:full}=await import('./documents-data.mjs?v=docs-r26');
 for(const d of full){const entry=entries.get(d.projectId+'/'+d.id);if(entry)Object.assign(entry,d);}
}
export const documentURL=d=>`/notes/${d.projectId}/docs/${d.id}/`;
export const readingDocument=(projectId,id)=>entries.get(projectId+'/'+id);
const bySource=new Map([...entries.values()].map(d=>['/'+d.source,d]));
export async function loadReadingDocument(projectId,id){
 const key=projectId+'/'+id,entry=entries.get(key);
 if(!entry)throw Error('Article is not registered');
 if(typeof entry.markdown==='string')return entry;
 if(pending.has(key))return pending.get(key);
 const promise=(async()=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const url=new URL(entry.contentHref,import.meta.url);if(url.origin!==new URL(import.meta.url).origin)throw Error('Unexpected article origin');
   const response=await fetch(url,{cache:'force-cache',credentials:'omit',signal:controller.signal});if(!response.ok)throw Error('Article request failed: '+response.status);
   const text=await response.text();if(new TextEncoder().encode(text).length>250000)throw Error('Article is too large');
   const body=JSON.parse(text);if(body.projectId!==projectId||body.id!==id||body.source!==entry.source||typeof body.markdown!=='string')throw Error('Article identity mismatch');
   entry.markdown=body.markdown;return entry;
  }finally{clearTimeout(timer);}
 })();pending.set(key,promise);
 try{return await promise;}finally{pending.delete(key);}
}
export function readingLink(href,source=''){
 if(typeof href!=='string'||/[\\\u0000-\u0020]/.test(href)||href.startsWith('//'))return '';
 if(href.startsWith('#'))return href;
 if(/^[a-z][a-z\d+.-]*:/i.test(href))return /^https?:\/\//i.test(href)?href:'';
 let url;try{url=new URL(href,'https://reading.invalid/'+source);}catch{return '';}
 if(url.origin!=='https://reading.invalid')return '';
 const d=bySource.get(url.pathname);if(d)return documentURL(d)+url.search+url.hash;
 if(url.pathname.startsWith('/packages/')&&!/\.(?:html|zip|svg|png|webp|tmj)$/.test(url.pathname))return 'https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/main'+url.pathname+url.hash;
 return url.pathname+url.search+url.hash;
}
export function withDocuments(input){
 const p=JSON.parse(JSON.stringify(withExperimentDocuments(input,EXPERIMENTS)));
 function rewrite(x){if(!x||typeof x!=='object')return;for(const[k,v]of Object.entries(x)){if(typeof v==='string'&&(k==='href'||k==='instructionsHref')&&bySource.has(v.split(/[?#]/)[0]))x[k]=readingLink(v);else if(v&&typeof v==='object')rewrite(v);}}
 rewrite(p);
 for(const d of entries.values())if(d.projectId===p.id&&!p.docs.some(x=>x.id===d.id))p.docs.push({id:d.id,title:d.title,summary:d.historical?'历史版本的开发资料。':'说明与参考资料。',sections:[],readingDocument:true,parentDoc:d.parent,versioned:d.historical});
 const fonts=p.docs.find(d=>p.id==='pixel-workshop'&&d.id==='architecture');
 if(fonts){fonts.sources??=[];if(!fonts.sources.some(x=>x.href==='/notes/pixel-workshop/docs/font-licenses/'))fonts.sources.push({label:'网站字体与许可',href:'/notes/pixel-workshop/docs/font-licenses/'});}
 return p;
}
