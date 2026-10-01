/** Small UTF-8 store-only ZIP exporter; no dependencies or remote uploads. */
const enc=new TextEncoder();
const table=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let c=0xffffffff;for(const n of b)c=table[(c^n)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
export function zipFiles(files){
 const parts=[],central=[];let offset=0;
 for(const [name,text]of Object.entries(files)){
  if(name.includes('..')||name.startsWith('/')||name.includes('\\'))throw Error('无效的导出路径');
  const n=enc.encode(name),b=enc.encode(text),c=crc(b),h=new Uint8Array(30+n.length),v=new DataView(h.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,c,true);v.setUint32(18,b.length,true);v.setUint32(22,b.length,true);v.setUint16(26,n.length,true);h.set(n,30);parts.push(h,b);
  const d=new Uint8Array(46+n.length),dv=new DataView(d.buffer);dv.setUint32(0,0x02014b50,true);dv.setUint16(4,20,true);dv.setUint16(6,20,true);dv.setUint16(8,0x800,true);dv.setUint16(14,33,true);dv.setUint32(16,c,true);dv.setUint32(20,b.length,true);dv.setUint32(24,b.length,true);dv.setUint16(28,n.length,true);dv.setUint32(42,offset,true);d.set(n,46);central.push(d);offset+=h.length+b.length;
 }
 const size=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,central.length,true);ev.setUint16(10,central.length,true);ev.setUint32(12,size,true);ev.setUint32(16,offset,true);
 const result=new Uint8Array(offset+size+22);let p=0;for(const b of [...parts,...central,end]){result.set(b,p);p+=b.length;}return result;
}
