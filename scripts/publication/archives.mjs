/** Deterministic ZIP integrity inspection; never extracts or executes contents. */
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
const table=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let n=0xffffffff;for(const byte of bytes)n=table[(n^byte)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
export function inspectZip(b,{maxFiles=20000,maxExpanded=512*1024*1024,maxMember=128*1024*1024}={}){
 const error=s=>{throw Error('ZIP '+s);};
 if(!Buffer.isBuffer(b))error('requires bytes');
 let end=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(b.readUInt32LE(i)===0x06054b50&&i+22+b.readUInt16LE(i+20)===b.length){end=i;break;}
 if(end<0)error('end record missing or trailing data');
 if(b.readUInt16LE(end+4)||b.readUInt16LE(end+6))error('multi-volume unsupported');
 const count=b.readUInt16LE(end+10),size=b.readUInt32LE(end+12),start=b.readUInt32LE(end+16);
 if(count>maxFiles||count===65535||size===0xffffffff||start===0xffffffff)error('limits/ZIP64 unsupported');
 if(b.readUInt16LE(end+8)!==count||start+size!==end)error('central directory boundary');
 let cursor=start,total=0;const names=new Set(),entries=[],hashes={};
 for(let i=0;i<count;i++){
  if(cursor+46>end||b.readUInt32LE(cursor)!==0x02014b50)error('central entry');
  const flags=b.readUInt16LE(cursor+8),method=b.readUInt16LE(cursor+10),crc=b.readUInt32LE(cursor+16),packed=b.readUInt32LE(cursor+20),length=b.readUInt32LE(cursor+24),nl=b.readUInt16LE(cursor+28),xl=b.readUInt16LE(cursor+30),cl=b.readUInt16LE(cursor+32),disk=b.readUInt16LE(cursor+34),attr=b.readUInt32LE(cursor+38),offset=b.readUInt32LE(cursor+42);
  if(cursor+46+nl+xl+cl>end)error('entry name boundary');
  const rawName=b.subarray(cursor+46,cursor+46+nl);const name=rawName.toString('utf8');
  if(!name||name.includes('\ufffd')||/[\\\x00-\x1f]/.test(name)||name.startsWith('/')||/^[a-z]:/i.test(name)||name.split('/').some(p=>p==='..'||p==='.')||names.has(name))error('unsafe or duplicate name');
  if(((attr>>>16)&0xf000)===0xa000)error('symbolic link entry');
  if(flags&1||disk||![0,8].includes(method))error('encrypted/unsupported entry');
  if(length>maxMember||(total+=length)>maxExpanded)error('expanded data limit');
  if(offset+30>start||b.readUInt32LE(offset)!==0x04034b50)error('local entry');
  if(b.readUInt16LE(offset+8)!==method||b.readUInt16LE(offset+6)!==flags)error('local entry mismatch');
  const localNL=b.readUInt16LE(offset+26),localXL=b.readUInt16LE(offset+28),dataStart=offset+30+localNL+localXL;
  if(!b.subarray(offset+30,offset+30+localNL).equals(rawName)||dataStart+packed>start)error('local name or data boundary');
  const input=b.subarray(dataStart,dataStart+packed),data=method===0?input:inflateRawSync(input,{maxOutputLength:Math.max(1,Math.min(maxMember,length+1))});
  if(data.length!==length||crc32(data)!==crc)error('size/CRC mismatch: '+name);
  hashes[name]=createHash('sha256').update(data).digest('hex');names.add(name);entries.push({name,bytes:length,compressedBytes:packed});cursor+=46+nl+xl+cl;
 }
 if(cursor!==end)error('central count mismatch');return{entries:entries.length,expandedBytes:total,names:[...names],hashes};
}
