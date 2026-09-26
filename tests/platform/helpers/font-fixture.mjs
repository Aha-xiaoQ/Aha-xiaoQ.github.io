/** Synthetic cmap-only WOFF2 containers for parser/build tests; not browser fonts. */
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import{createHash}from'node:crypto';import{brotliCompressSync}from'node:zlib';
import {blob,sha}from'../../../scripts/platform/font-support.mjs';
const base128=n=>{const b=[n&127];while(n>>>=7)b.unshift((n&127)|128);return Buffer.from(b);};
export function syntheticFont(points){
 const cps=[...new Set(points)].sort((a,b)=>a-b),sub=Buffer.alloc(16+12*cps.length);sub.writeUInt16BE(12);sub.writeUInt32BE(sub.length,4);sub.writeUInt32BE(cps.length,12);
 cps.forEach((n,i)=>{sub.writeUInt32BE(n,16+i*12);sub.writeUInt32BE(n,20+i*12);sub.writeUInt32BE(i+1,24+i*12);});
 const head=Buffer.alloc(12);head.writeUInt16BE(1,2);head.writeUInt16BE(4,6);head.writeUInt32BE(12,8);const cmap=Buffer.concat([head,sub]),h=Buffer.alloc(48),d=Buffer.concat([Buffer.from([0]),base128(cmap.length)]),packed=brotliCompressSync(cmap);
 h.write('wOF2');h.writeUInt32BE(0x10000,4);h.writeUInt32BE(48+d.length+packed.length,8);h.writeUInt16BE(1,12);h.writeUInt32BE(28+cmap.length,16);h.writeUInt32BE(packed.length,20);return Buffer.concat([h,d,packed]);
}
export function fixture(t,{points=[0x7435,0x7436,0x9e48,0x9e55],extra=[],fontPoints=points}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'q-r49-font-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,b)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),b);};
 write('assets/fonts/LXGWWenKai-OFL.txt','SIL OPEN FONT LICENSE Version 1.1\nSynthetic fixture notice.');
 const chunks=new Map(),css={};let tree=[];
 for(const variant of ['regular','bold']){
  css[variant]='';for(const [index,cps,actual]of [[1,points,fontPoints],...(extra.length?[[2,extra,extra]]:[])]){
   const name=`lxgwwenkai-${variant}-subset-${index}.woff2`,bytes=syntheticFont(actual),s=blob(bytes);chunks.set(name,bytes);tree.push({path:name,mode:'100644',type:'blob',sha:s,size:bytes.length});
   css[variant]+=`@font-face {font-family:'LXGW WenKai';font-style:normal;font-weight:${variant==='regular'?400:700};font-display:swap;src:url('./files/${name}') format('woff2');unicode-range:${cps.map(n=>'U+'+n.toString(16)).join(',')};}\n`;
  }
 }
 tree.sort((a,b)=>Buffer.compare(Buffer.from(a.path),Buffer.from(b.path)));const bytes=Buffer.concat(tree.flatMap(e=>[Buffer.from(e.mode+' '+e.path+'\0'),Buffer.from(e.sha,'hex')]));const treeHash=createHash('sha1').update('tree '+bytes.length+'\0').update(bytes).digest('hex');
 const pin={version:'1.7.0',tree:treeHash,regular:blob(Buffer.from(css.regular)),bold:blob(Buffer.from(css.bold))};
 const provider={schemaVersion:1,version:pin.version,tree:{sha:treeHash,tree,truncated:false},css};
 const primary=[{file:'assets/fonts/LXGWWenKai-Regular-site.woff2',weight:'400',variant:'regular',coverage:new Set([65]),sha256:sha(Buffer.from('primary-regular'))},{file:'assets/fonts/LXGWWenKai-Medium-site.woff2',weight:'500 700',variant:'bold',coverage:new Set([65]),sha256:sha(Buffer.from('primary-medium'))}];
 const corpusFor=p=>({points:[65,...p],symbols:[],files:['content/experiments/example.json'],locations:new Map(p.map(n=>[n,['content/experiments/example.json']])),fingerprint:sha(Buffer.from([65,...p].join(',')))});
 const calls=[];const fetcher=async url=>{calls.push(url);const name=new URL(url).pathname.split('/').at(-1),bytes=chunks.get(name);return new Response(bytes||'not found',{status:bytes?200:404});};
 return{root,write,provider,pin,primary,corpus:corpusFor(points),corpusFor,chunks,fetcher,calls};
}
