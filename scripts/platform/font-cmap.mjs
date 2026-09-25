/** Read Unicode cmap coverage, not font outlines. Supports single-font SFNT/WOFF/WOFF2.
 * WOFF2 directory/UIntBase128: https://www.w3.org/TR/WOFF2/
 * cmap: https://learn.microsoft.com/en-us/typography/opentype/spec/cmap
 * No font is modified, copied to a release, or downloaded by this reader.
 */
import {brotliDecompressSync,inflateSync} from 'node:zlib';
const MAX_BYTES=64*1024*1024;
const TAGS=['cmap','head','hhea','hmtx','maxp','name','OS/2','post','cvt ','fpgm','glyf','loca','prep','CFF ','VORG','EBDT','EBLC','gasp','hdmx','kern','LTSH','PCLT','VDMX','vhea','vmtx','BASE','GDEF','GPOS','GSUB','EBSC','JSTF','MATH','CBDT','CBLC','COLR','CPAL','SVG ','sbix','acnt','avar','bdat','bloc','bsln','cvar','fdsc','feat','fmtx','fvar','gvar','hsty','just','lcar','mort','morx','opbd','prop','trak','Zapf','Silf','Glat','Gloc','Feat','Sill'];
function range(buffer,offset,length,label='font') {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset<0 || length<0 || offset+length>buffer.length) throw Error('Invalid '+label+' boundary');
  return buffer.subarray(offset,offset+length);
}
export function readBase128(bytes,state) {
  let value=0;
  for (let i=0;i<5;i++) {
    const byte=range(bytes,state.offset++,1)[0];
    if (!i && byte===0x80) throw Error('Noncanonical UIntBase128');
    value=value*128+(byte&127);
    if (value>0xffffffff) throw Error('UIntBase128 overflow');
    if (!(byte&128)) return value;
  }
  throw Error('Unterminated UIntBase128');
}
export function fontCmap(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length<12 || bytes.length>MAX_BYTES) throw Error('Invalid font size');
  const magic=bytes.toString('ascii',0,4);
  if (magic==='wOF2') {
    range(bytes,0,48);
    if (bytes.readUInt32BE(8)!==bytes.length || bytes.readUInt16BE(14)!==0) throw Error('Invalid WOFF2 header');
    if (bytes.toString('ascii',4,8)==='ttcf') throw Error('Font collections are not supported by the coverage reader');
    const count=bytes.readUInt16BE(12),packed=bytes.readUInt32BE(20),state={offset:48};
    if (!count || count>200 || packed>MAX_BYTES) throw Error('Invalid WOFF2 directory');
    const tables=new Map();let expanded=0;
    for (let i=0;i<count;i++) {
      const flags=range(bytes,state.offset++,1)[0],index=flags&63,version=flags>>>6;
      const tag=index===63?range(bytes,state.offset,4).toString('ascii'):TAGS[index];
      if (index===63) state.offset+=4;
      if (!tag || tables.has(tag)) throw Error('Duplicate font table');
      const length=readBase128(bytes,state);
      const transformed=(tag==='glyf'||tag==='loca')?version!==3:version!==0;
      const transformedLength=transformed?readBase128(bytes,state):length;
      if (tag==='cmap' && transformed) throw Error('Unsupported transformed cmap');
      if (tag==='loca' && transformed && transformedLength!==0) throw Error('Invalid transformed loca');
      tables.set(tag,{offset:expanded,length:transformedLength});expanded+=transformedLength;
      if (expanded>MAX_BYTES) throw Error('Expanded font exceeds limit');
    }
    const compressed=range(bytes,state.offset,packed,'compressed font');
    const decoded=brotliDecompressSync(compressed,{maxOutputLength:MAX_BYTES});
    if (decoded.length!==expanded) throw Error('WOFF2 expanded length mismatch');
    const table=tables.get('cmap');if (!table) throw Error('Font lacks cmap');
    return range(decoded,table.offset,table.length,'cmap');
  }
  if (magic==='wOFF') {
    range(bytes,0,44);if (bytes.readUInt32BE(8)!==bytes.length) throw Error('Invalid WOFF length');
    const count=bytes.readUInt16BE(12);if (!count||count>200) throw Error('Invalid WOFF table count');
    range(bytes,44,count*20);
    for(let i=0;i<count;i++){
      const p=44+i*20;if(bytes.toString('ascii',p,p+4)!=='cmap')continue;
      const offset=bytes.readUInt32BE(p+4),packed=bytes.readUInt32BE(p+8),size=bytes.readUInt32BE(p+12);
      if(size>MAX_BYTES||packed>size)throw Error('Invalid WOFF cmap size');
      const data=range(bytes,offset,packed);const cmap=packed===size?data:inflateSync(data,{maxOutputLength:MAX_BYTES});
      if(cmap.length!==size)throw Error('WOFF cmap length mismatch');return cmap;
    }
    throw Error('Font lacks cmap');
  }
  if (bytes.readUInt32BE(0)!==0x00010000 && magic!=='OTTO' && magic!=='true') throw Error('Unsupported font signature');
  const count=bytes.readUInt16BE(4);if(!count||count>200)throw Error('Invalid SFNT table count');range(bytes,12,count*16);
  for(let i=0;i<count;i++){const p=12+i*16;if(bytes.toString('ascii',p,p+4)==='cmap')return range(bytes,bytes.readUInt32BE(p+8),bytes.readUInt32BE(p+12),'cmap');}
  throw Error('Font lacks cmap');
}
export function cmapCodepoints(cmap) {
  range(cmap,0,4);if(cmap.readUInt16BE(0)!==0)throw Error('Invalid cmap version');
  const count=cmap.readUInt16BE(2);if(!count||count>100)throw Error('Invalid cmap table count');range(cmap,4,count*8);
  const points=new Set(),visited=new Set();let supported=0;
  const add=cp=>{if(cp<=0x10ffff && !(cp>=0xd800&&cp<=0xdfff))points.add(cp);};
  for(let i=0;i<count;i++){
    const p=4+i*8,platform=cmap.readUInt16BE(p),encoding=cmap.readUInt16BE(p+2),offset=cmap.readUInt32BE(p+4);
    if(!(platform===0||platform===3&&(encoding===1||encoding===10))||visited.has(offset))continue;
    visited.add(offset);range(cmap,offset,4);const format=cmap.readUInt16BE(offset);
    if(format===14)continue;
    const length=[10,12,13].includes(format)?(range(cmap,offset,8),cmap.readUInt32BE(offset+4)):cmap.readUInt16BE(offset+2);
    const b=range(cmap,offset,length,'cmap subtable');
    if(format===4){
      range(b,0,16);const segCount=b.readUInt16BE(6)/2;if(!Number.isInteger(segCount)||!segCount||segCount>32767)throw Error('Invalid cmap segments');
      range(b,14,8*segCount+2);const end=14,start=16+2*segCount,delta=16+4*segCount,ro=16+6*segCount;let previous=-1;
      for(let s=0;s<segCount;s++){
        const first=b.readUInt16BE(start+s*2),last=b.readUInt16BE(end+s*2),d=b.readInt16BE(delta+s*2),r=b.readUInt16BE(ro+s*2);
        if(first>last||first<=previous||r%2)throw Error('Invalid cmap segment range');previous=last;
        for(let cp=first;cp<=last;cp++){
          if(cp===0xffff)continue;
          let glyph;
          if(r===0)glyph=(cp+d)&65535;
          else {const pos=ro+s*2+r+(cp-first)*2;range(b,pos,2);glyph=b.readUInt16BE(pos);if(glyph)glyph=(glyph+d)&65535;}
          if(glyph)add(cp);
        }
      }
    }else if(format===12||format===13){
      range(b,0,16);const groups=b.readUInt32BE(12);if(groups>0x110000)throw Error('Excessive cmap groups');range(b,16,groups*12);let previous=-1;
      for(let g=0;g<groups;g++){
        const p=16+g*12,first=b.readUInt32BE(p),last=b.readUInt32BE(p+4),glyph=b.readUInt32BE(p+8);
        if(first>last||first<=previous||last>0x10ffff||glyph+(format===12?last-first:0)>0xffffffff)throw Error('Invalid cmap group');previous=last;
        for(let cp=first;cp<=last;cp++)if(format===13?glyph:glyph+cp-first)add(cp);
      }
    }else if(format===6){
      range(b,0,10);const first=b.readUInt16BE(6),n=b.readUInt16BE(8);range(b,10,n*2);if(first+n>65536)throw Error('Invalid cmap6 range');
      for(let j=0;j<n;j++)if(b.readUInt16BE(10+j*2))add(first+j);
    }else if(format===10){
      range(b,0,20);const first=b.readUInt32BE(12),n=b.readUInt32BE(16);if(first+n>0x110000)throw Error('Invalid cmap10 range');range(b,20,n*2);
      for(let j=0;j<n;j++)if(b.readUInt16BE(20+j*2))add(first+j);
    }else if(format===0){range(b,0,262);for(let j=0;j<256;j++)if(b[6+j])add(j);}
    else throw Error('Unsupported Unicode cmap format: '+format);
    supported++;
  }
  if(!supported)throw Error('No supported Unicode cmap');return points;
}
export const fontCodepoints=bytes=>cmapCodepoints(fontCmap(bytes));
export function missingCodepoints(text, coverage) {
  return [...new Set([...text].filter(c=>!/[\s\p{Cf}\p{Cc}]/u.test(c)).map(c=>c.codePointAt(0)))].filter(cp=>!coverage.has(cp)).sort((a,b)=>a-b);
}
