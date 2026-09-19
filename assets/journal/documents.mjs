import {DOCUMENTS} from './documents-data.mjs?v=docs-r26';
export const documentURL=d=>`/notes/${d.projectId}/docs/${d.id}/`;
export const readingDocument=(projectId,id)=>DOCUMENTS.find(d=>d.projectId===projectId&&d.id===id);
const bySource=new Map(DOCUMENTS.map(d=>['/'+d.source,d]));
/** Resolve relative document links against their source, never the new page URL. */
export function readingLink(href,source=''){
 if(typeof href!=='string'||/[\\\u0000-\u0020]/.test(href)||href.startsWith('//'))return '';
 if(href.startsWith('#'))return href;
 if(/^[a-z][a-z\d+.-]*:/i.test(href))return /^https?:\/\//i.test(href)?href:'';
 let url;try{url=new URL(href,'https://reading.invalid/'+source);}catch{return '';}
 if(url.origin!=='https://reading.invalid')return '';
 const d=bySource.get(url.pathname);
 if(d)return documentURL(d)+url.search+url.hash;
 // Unregistered source files remain explicit external code references. Reading
 // pages never expose arbitrary local files or turn a path into a file loader.
 if(url.pathname.startsWith('/packages/')&&!/\.(?:html|zip|svg|png|webp|tmj)$/.test(url.pathname))return 'https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/main'+url.pathname+url.hash;
 return url.pathname+url.search+url.hash;
}
export function withDocuments(input){
 const p=JSON.parse(JSON.stringify(input));
 // Source JSON stays compatible with package generators. Resolve reading links
 // in this shared projection used by static pages and client navigation alike.
 function rewrite(x){if(!x||typeof x!=='object')return;for(const [k,v]of Object.entries(x)){if(typeof v==='string'&&(k==='href'||k==='instructionsHref')&&bySource.has(v.split(/[?#]/)[0]))x[k]=readingLink(v);else if(v&&typeof v==='object')rewrite(v);}}
 rewrite(p);
 for(const d of DOCUMENTS.filter(d=>d.projectId===p.id)){
  if(p.docs.some(x=>x.id===d.id))continue;
  p.docs.push({id:d.id,title:d.title,summary:d.historical?'历史版本的开发资料。':'完整说明与使用步骤。',sections:[],readingDocument:true,parentDoc:d.parent,versioned:d.historical});
 }
 const fonts=p.docs.find(d=>p.id==='pixel-workshop'&&d.id==='architecture');
 if(fonts){fonts.sources??=[];if(!fonts.sources.some(x=>x.href==='/notes/pixel-workshop/docs/font-licenses/'))fonts.sources.push({label:'网站字体与许可',href:'/notes/pixel-workshop/docs/font-licenses/'});}
 return p;
}
