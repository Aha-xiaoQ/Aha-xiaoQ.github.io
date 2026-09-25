/** Deterministic UTF-8 ZIP. The writer validates names and never reads files itself. */
import{deflateRawSync}from'node:zlib';
import{validateRelative}from'../lib/safe-path.mjs';
const localFile=p=>{try{validateRelative(p);return true;}catch{return false;}};
const table=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(b){let n=0xffffffff;for(const x of b)n=table[(n^x)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
export function zip(entries){
 if(!Array.isArray(entries)||entries.length>20000)throw Error('Invalid archive entries');const seen=new Set(),parts=[],central=[];let offset=0,total=0;
 for(const [name,bytes]of [...entries].sort(([a],[b])=>a<b?-1:a>b?1:0)){
  if(!localFile(name)||seen.has(name.toLowerCase())||!Buffer.isBuffer(bytes)||(total+=bytes.length)>256*1024*1024)throw Error('Unsafe, duplicate, or oversized archive entry');seen.add(name.toLowerCase());
  const n=Buffer.from(name),packed=deflateRawSync(bytes,{level:9}),crc=crc32(bytes);if(n.length>65535)throw Error('Archive name too long');
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(0x21,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(packed.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(n.length,26);
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(0x314,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(0x21,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(packed.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE((0o100644<<16)>>>0,38);c.writeUInt32LE(offset,42);
  parts.push(local,n,packed);central.push(c,n);offset+=local.length+n.length+packed.length;
 }
 const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...parts,cd,end]);
}
