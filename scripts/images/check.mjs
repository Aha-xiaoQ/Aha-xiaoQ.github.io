import fs from 'node:fs';import path from 'node:path';import {createHash}from'node:crypto';import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'content/image-previews.json')));
if(manifest.schemaVersion!==1||!Array.isArray(manifest.files)||!manifest.files.length)throw Error('Invalid image preview manifest');
for(const f of manifest.files){
 for(const p of [f.source,f.output])if(!p||/\\|(?:^|\/)\.\.(?:\/|$)|^\//.test(p)||!fs.lstatSync(path.join(root,p)).isFile())throw Error('Invalid preview path');
 const source=fs.readFileSync(path.join(root,f.source)),out=fs.readFileSync(path.join(root,f.output));
 if(hash(source)!==f.sourceSha256||source.length!==f.sourceBytes)throw Error('Original changed: review and rebuild '+f.source);
 if(hash(out)!==f.sha256||out.length!==f.bytes||out.toString('ascii',0,4)!=='RIFF'||out.toString('ascii',8,12)!=='WEBP')throw Error('Preview changed or invalid: '+f.output);
}
console.log(JSON.stringify({ok:true,previews:manifest.files.length,originals:'source hashes verified'}));
