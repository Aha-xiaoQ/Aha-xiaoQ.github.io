/** File-delta installer for an isolated, verified Git checkout. */
import fs from'node:fs';import{createHash}from'node:crypto';
import{safe,readOptional,writeAtomic,validateRelative,entryStat}from'./safe-path.mjs';
import{sourcePaths,transform}from'./source-edits.mjs';
export const REPOSITORY='Aha-xiaoQ/Aha-xiaoQ.github.io',BRANCH='main',REMOTE='https://github.com/'+REPOSITORY+'.git';
export const sha=b=>createHash('sha256').update(b).digest('hex');
const checksum=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const sourceIdentity=s=>checksum(s)||typeof s==='string'&&/^git:[a-f0-9]{40}$/.test(s);
export function matchesBefore(identity,bytes){if(identity===null)return bytes===null;if(!bytes)return false;if(identity.startsWith('git:'))return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')===identity.slice(4);return sha(bytes)===identity;}
export function read(root,p){const abs=safe(root,p);if((entryStat(abs)?.nlink||0)>1)throw Error('Hard-linked file rejected: '+p);return readOptional(root,p);}
export function permitted(p){
 validateRelative(p);
 if(/\.(?:woff2?|ttf|otf|exe|dll|pem|key|pfx|p12|log|bak)$/i.test(p)||/(?:^|\/)(?:\.git|\.github|\.local|fonts|node_modules)(?:\/|$)/i.test(p)||/^(?:packages|downloads)\//.test(p)||/\/play\.html$/.test(p)||/(?:^|\/)(?:credentials|secrets?|tokens?|\.env)(?:[./]|$)/i.test(p))throw Error('Outside website update scope: '+p);
}
export function load(bundle){
 const m=JSON.parse(read(bundle,'manifest.json'));
 if(m.schemaVersion!==2||m.repository!==REPOSITORY||m.branch!==BRANCH||!/^SITE-PLATFORM-[A-Z0-9.-]+$/.test(m.edition)||!/^[a-f0-9]{40}$/.test(m.baselineCommit)||!Array.isArray(m.files)||!m.files.length||m.files.length>10000||!Array.isArray(m.migrationPaths)||JSON.stringify(m.migrationPaths)!==JSON.stringify(sourcePaths))throw Error('Invalid update manifest');
 if(typeof m.message!=='string'||!m.message.trim()||m.message.length>180||/[\r\n\0]/.test(m.message))throw Error('Invalid commit message');
 const seen=new Set();
 for(const f of m.files){permitted(f.path);const key=f.path.toLowerCase();if(seen.has(key))throw Error('Duplicate or case-colliding file');seen.add(key);if(f.before!==null&&!sourceIdentity(f.before))throw Error('Missing source identity: '+f.path);if(!['write','delete'].includes(f.operation||'write'))throw Error('Invalid operation');if(f.operation==='delete'){if(!sourceIdentity(f.before)||f.sha256!==null||read(bundle,'payload/'+f.path))throw Error('Invalid deletion identity');}else{if(!checksum(f.sha256))throw Error('Invalid payload hash');const b=read(bundle,'payload/'+f.path);if(!b||sha(b)!==f.sha256)throw Error('Damaged update payload: '+f.path);}}
 for(const p of sourcePaths){permitted(p);if(seen.has(p.toLowerCase()))throw Error('Duplicate migration target');seen.add(p.toLowerCase());}
 if(!Array.isArray(m.protected)||m.protected.length<1)throw Error('Missing original artifact protection');
 const artifacts=new Set();for(const g of m.protected){validateRelative(g.path);if(artifacts.has(g.path)||!checksum(g.sha256)||seen.has(g.path.toLowerCase()))throw Error('Invalid original artifact identity');artifacts.add(g.path);}
 return m;
}
export function plan(root,bundle,m){
 for(const g of m.protected){const b=read(root,g.path);if(!b||sha(b)!==g.sha256)throw Error('Original artifact differs: '+g.path);}
 const changes=[];
 for(const f of m.files){const old=read(root,f.path),next=f.operation==='delete'?null:read(bundle,'payload/'+f.path);if(next?old?.equals(next):old===null)continue;if(!matchesBefore(f.before,old))throw Error('File conflicts with package baseline: '+f.path);changes.push({path:f.path,old,next});}
 for(const p of sourcePaths){const old=read(root,p);if(!old)throw Error('Missing migration source: '+p);const next=Buffer.from(transform(p,old.toString('utf8')));if(!old.equals(next))changes.push({path:p,old,next});}
 return changes;
}
export function apply(root,changes){
 for(const c of changes){const b=read(root,c.path);if((b?sha(b):null)!==(c.old?sha(c.old):null))throw Error('File changed after preflight: '+c.path);}
 const done=[];try{for(const c of changes){if(c.next)writeAtomic(root,c.path,c.next);else fs.unlinkSync(safe(root,c.path));done.push(c);}}
 catch(error){for(const c of done.reverse()){const now=read(root,c.path);if(c.next?now?.equals(c.next):now===null){if(c.old)writeAtomic(root,c.path,c.old);else fs.unlinkSync(safe(root,c.path));}}throw error;}
 return done.length;
}
// dev-center owns dev-r44 content revisions in the router as well as journal modules.
// Normalize only that generator-owned token; arbitrary code or URL changes still fail.
function normalized(p,b){if(!/\.(?:mjs|js|json|css|md|txt|html|svg|ps1|cmd)$/.test(p))return b.toString('hex');let s=b.toString('utf8').replace(/\r\n?/g,'\n');if(p==='assets/site-router.js'||/^assets\/journal\/(?:runtime|render|documents|public-layout|experiment|update-audience)\.mjs$/.test(p))s=s.replace(/dev-r44(?:-[0-9a-f]{16})?/g,'dev-r44');return s;}
export function verify(root,m,bundle){
 for(const f of m.files){const now=read(root,f.path),expected=f.operation==='delete'?null:read(bundle,'payload/'+f.path);if(expected?(!now||normalized(f.path,now)!==normalized(f.path,expected)):now!==null)throw Error('Build changed an authored payload: '+f.path);}
 for(const g of m.protected){const b=read(root,g.path);if(!b||sha(b)!==g.sha256)throw Error('Original artifact changed: '+g.path);}
 verifyGeneratedFonts(root);
}
const generatedFontPath=p=>/^assets\/platform\/font-support\/[a-f0-9]{64}\.woff2$/.test(p);
const fontTextPaths=new Set(['assets/platform/font-support.css','assets/platform/font-support/OFL.txt','docs/platform/font-provider.json']);
/** Generated fonts never enter payloads. Staging requires actual local bytes and a matching build record. */
export function verifyGeneratedFonts(root){
 const b=read(root,'docs/platform/generated-fonts.json');if(!b)return new Set();
 const record=JSON.parse(b);if(record.schemaVersion!==1||record.family!=='LXGW WenKai Local'||!Array.isArray(record.faces)||!record.files||Array.isArray(record.files))throw Error('Invalid generated font record');
 const verified=new Set();
 for(const [p,id]of Object.entries(record.files)){
  if(!generatedFontPath(p)&&!fontTextPaths.has(p))throw Error('Invalid generated font path: '+p);
  const data=read(root,p);if(!data||!checksum(id?.sha256)||data.length!==id.bytes||sha(data)!==id.sha256)throw Error('Generated font identity mismatch: '+p);
  if(generatedFontPath(p)&&(p!=='assets/platform/font-support/'+sha(data)+'.woff2'||data.subarray(0,4).toString()!=='wOF2'))throw Error('Invalid generated WOFF2: '+p);
  verified.add(p);
 }
 for(const face of record.faces)if(!generatedFontPath(face.file)||!verified.has(face.file)||record.files[face.file].sha256!==face.sha256)throw Error('Unverified generated font face');
 for(const p of fontTextPaths)if(!verified.has(p))throw Error('Incomplete generated typography closure: '+p);
 return verified;
}
const generated=new Set(['assets/platform/font-support.css','assets/platform/font-support/OFL.txt','docs/platform/font-provider.json','docs/platform/generated-fonts.json','assets/journal/journal.css','assets/platform/import-map.json','assets/i18n/messages.js','assets/platform/config.js','content/search-index.json','content/presentation.js',
'docs/platform/generated-files.json','docs/development/generated-pages.json','docs/experience-r18/generated-files.json','docs/design-r07/generated-pages.json','docs/launch-r19/generated-files.json','docs/studio-r25/generated-files.json','docs/showcase-r25/generated-files.json','docs/content-r15/generated-tasks.json','docs/chapters-r20/generated-files.json',
'index.html','404.html','about/index.html','projects/index.html','games/index.html','tools/index.html','method/index.html','search/index.html','play-guide/index.html','projects/q-mimi/index.html','sitemap.xml','robots.txt','content/development/projects/mario-mix.json',
'assets/site-router.js','assets/journal/runtime.mjs','assets/journal/render.mjs','assets/journal/documents.mjs','assets/journal/public-layout.mjs','assets/journal/experiment.mjs','assets/journal/update-audience.mjs','assets/release/public-content.mjs']);
export function assertScope(paths,m,root=null){
 const approved=new Set([...m.files.map(f=>f.path),...sourcePaths,...generated]);
 let fontFiles=null;
 for(const p of paths){if(generatedFontPath(p)){if(!root)throw Error('Generated fonts require a verified repository root');fontFiles??=verifyGeneratedFonts(root);if(!fontFiles.has(p))throw Error('Unregistered generated font: '+p);}else permitted(p);if(m.protected.some(x=>x.path===p))throw Error('Original artwork/game cannot be staged');if(!approved.has(p)&&!fontFiles?.has(p)&&!/^assets\/journal\/data\/[a-z0-9/-]+\.(?:mjs|json)$/.test(p)&&!/^notes\/(?:[a-z0-9-]+\/)*index\.html$/.test(p)&&!/^games\/[a-z0-9-]+\/index\.html$/.test(p))throw Error('Unexpected generated change: '+p);}
}
