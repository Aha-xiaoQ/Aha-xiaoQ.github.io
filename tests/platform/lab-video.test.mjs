import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateExperiment,withExperimentDocuments,experimentVideoURL} from '../../assets/platform/contracts.mjs';
import {loadExperiments} from '../../scripts/platform/experiments.mjs';
import {validateMessages} from '../../scripts/platform/content.mjs';
import {makeIndex,search} from '../../assets/experience/model.mjs';
import {experimentGallery,experimentDetail,documentDirectory,labSpotlight} from '../../assets/journal/public-layout.mjs';
import {EXPERIMENTS} from '../../assets/journal/data/experiments.mjs';
import {parseAttributes,decodeAttribute} from '../../scripts/lib/html-resources.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url));
const json=p=>JSON.parse(read(p));
const original=json('content/experiments/pelican-bicycle.json');
const videos=['pipa-pelican','mid-autumn-special'].map(id=>json('content/experiments/'+id+'.json'));
const declared=[['pipa-pelican','琵琶曲 | 鹈鹕骑车','BV1TvhU6aEci'],['mid-autumn-special','中秋特别节目','BV1rHh16CE3T']];
const entries=()=>loadExperiments(root).entries;
const project=()=>withExperimentDocuments(json('content/development/projects/lab.json'),entries());
const copy=x=>structuredClone(x);
function links(html){return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(m=>({...parseAttributes(m[1]),text:decodeAttribute(m[2].replace(/<[^>]*>/g,''))}));}
function translator(){
 const document={readyState:'loading',documentElement:{},addEventListener(){}};
 const context=vm.createContext({URL,document,location:{href:'https://aha-xiaoq.github.io/notes/lab/?lang=en'},SITE_EN:Object.freeze({})});
 vm.runInContext(read('assets/site-i18n.js').toString(),context);
 context.SITE_I18N.register(validateMessages(json('content/locales/en.json')));return context.SITE_I18N;
}
for(const [id,title,bvid] of declared)test('requested video has its own exact identity and native URL: '+id,()=>{
 const e=videos.find(row=>row.id===id);assert.equal(e.title,title);assert.equal(e.video.bvid,bvid);assert.equal(validateExperiment(e),e);
 assert.equal(experimentVideoURL(e.video),'https://www.bilibili.com/video/'+bvid+'/');
 assert.ok(EXPERIMENTS.some(row=>row.id===id),'Run npm run journal:build to refresh the catalog');
});
test('HTML schema and original prompt identity remain unchanged',()=>{
 assert.equal(validateExperiment(original),original);assert.equal(original.reasoningEffort,null);
 assert.equal(original.prompt,'生成一个鹈鹕骑自行车的SVG动画，用html实现，不用做任何测试');
 assert.equal(createHash('sha256').update(read('experiments/pelican-bicycle.html')).digest('hex'),original.artifact.sha256);
});
for(const value of ['',null,123,' BV1TvhU6aEci','BV1TvhU6aEci ','bv1TvhU6aEci','BV1TvhU6aEc','BV1TvhU6aEci/','BV1TvhU6aEci?x=1','javascript:alert(1)'])test('invalid BVID is rejected: '+String(value),()=>assert.throws(()=>experimentVideoURL({provider:'bilibili',bvid:value})));
for(const edit of [v=>v.provider='youtube',v=>v.href='https://evil.invalid/',v=>v.bvid+='\n',v=>v.provider='bilibili.evil.test'])test('video URL cannot be redirected by metadata: '+String(edit),()=>{const v=copy(videos[0].video);edit(v);assert.throws(()=>experimentVideoURL(v));});
for(const field of ['artifact','model','prompt','reasoningEffort','promptLanguage','features','controlsSummary'])test('hosted video cannot impersonate an HTML generation record: '+field,()=>{const e=copy(videos[0]);e[field]=null;assert.throws(()=>validateExperiment(e));});
test('missing video and unknown kind fail explicitly',()=>{
 for(const edit of [e=>delete e.video,e=>e.kind='audio',e=>e.createdAt='2026-02-30',e=>e.relatedExperimentId='../outside',e=>e.relatedExperimentId=e.id]){const e=copy(videos[0]);edit(e);assert.throws(()=>validateExperiment(e));}
 const html={...original,video:videos[0].video};assert.throws(()=>validateExperiment(html));
});
test('loading video metadata never requests a local video file or remote service',()=>{
 const requested=[];const fetch=globalThis.fetch;globalThis.fetch=()=>{throw Error('Unexpected network request');};
 try{const result=loadExperiments(root,{reader:p=>{requested.push(p);return read(p);}});assert.ok(result.entries.some(e=>e.kind==='video'));}
 finally{globalThis.fetch=fetch;}
 assert.ok(requested.includes('experiments/pelican-bicycle.html'));assert.deepEqual(requested.filter(p=>p.startsWith('experiments/')).sort(),json('content/experiments/catalog.json').entries.map(row=>json(row.file)).filter(e=>e.kind!=='video').map(e=>e.artifact.href.slice(1)).sort());
 assert.ok(requested.every(p=>!p.startsWith('https:')&&!/\.(?:mp4|mp3)$/.test(p)));
});
function readerWith(changes){return p=>changes.has(p)?Buffer.from(JSON.stringify(changes.get(p))):read(p);}
test('duplicate BVID is rejected even when entry IDs differ',()=>{
 const other={...videos[1],video:videos[0].video};
 assert.throws(()=>loadExperiments(root,{reader:readerWith(new Map([['content/experiments/'+other.id+'.json',other]]))}),/duplication/);
});
test('related entries cannot point to missing or private drafts',()=>{
 const broken={...videos[0],relatedExperimentId:'missing'};
 assert.throws(()=>loadExperiments(root,{reader:readerWith(new Map([['content/experiments/'+broken.id+'.json',broken]]))}),/Related experiment/);
 assert.throws(()=>loadExperiments(root,{reader:readerWith(new Map([['content/experiments/pelican-bicycle.json',{...original,visibility:'draft'}]]))}),/Related experiment/);
});
test('video and HTML projection is immutable, idempotent and keeps distinct actions',()=>{
 const p=json('content/development/projects/lab.json'),before=copy(p),all=entries();const a=withExperimentDocuments(p,all),b=withExperimentDocuments(a,all);
 assert.deepEqual(p,before);assert.deepEqual(a,b);assert.equal(a.docs.filter(d=>d.id==='pelican-bicycle').length,1);
 for(const e of videos){const doc=a.docs.find(d=>d.id===e.id);assert.equal(doc.kind,'lab-video');assert.equal(doc.action.label,'观看视频');assert.equal(doc.action.href,experimentVideoURL(e.video));}
 const unrelated={layout:'website',docs:[]};assert.strictEqual(withExperimentDocuments(unrelated,all),unrelated);
});
test('draft, archived and withdrawn video projections keep their intended visibility',()=>{
 const e=copy(videos[0]),p={layout:'experiments',docs:[]};
 const visible=withExperimentDocuments(p,[e]);assert.equal(visible.docs.length,1);
 assert.equal(withExperimentDocuments(visible,[{...e,visibility:'draft'}]).docs.length,0);
 assert.equal(withExperimentDocuments(visible,[]).docs.length,0);
 assert.equal(withExperimentDocuments(p,[{...e,visibility:'archived'}]).docs[0].archived,true);
});
test('video metadata update refreshes a prior derived guide rather than leaving stale links',()=>{
 const p={layout:'experiments',docs:[]},one=withExperimentDocuments(p,[videos[0]]),updated={...videos[0],title:'Updated video',video:videos[1].video};
 const two=withExperimentDocuments(one,[updated]);assert.equal(two.docs[0].title,'Updated video');assert.equal(two.docs[0].action.href,experimentVideoURL(videos[1].video));assert.notEqual(one.docs[0].title,'Updated video');
});
test('lab gallery has each video once, no automatic media or false one-prompt claim',()=>{
 const html=experimentGallery();assert.doesNotMatch(html,/<(?:iframe|video|audio)\b/);
 for(const e of videos){const marker='data-lab-video-card="'+e.id+'"';assert.equal(html.split(marker).length-1,1);const card=html.slice(html.indexOf(marker),html.indexOf('</article>',html.indexOf(marker)));assert.doesNotMatch(card,/ONE PROMPT|blockquote|data-lab-play|下载原始 HTML/);assert.equal(links(card).filter(a=>a.href===experimentVideoURL(e.video)).length,1);}
 assert.match(html,/\/notes\/lab\/docs\/pelican-bicycle\//);
});
for(const e of videos)test('video detail is semantic native navigation without iframe privileges: '+e.id,()=>{
 const html=experimentDetail(e.id),watch=links(html).filter(a=>a.href===experimentVideoURL(e.video));assert.equal(watch.length,1);assert.equal(watch[0].target,'_blank');assert.match(watch[0].rel,/noopener/);assert.match(watch[0].rel,/noreferrer/);assert.ok(watch[0]['aria-label']);
 assert.match(html,new RegExp(e.video.bvid));assert.doesNotMatch(html,/<(?:iframe|video|audio)\b|\bdata-experiment=|data-lab-play|data-copy-prompt|生成模型|推理强度/);
 assert.ok(links(html).some(a=>a.href==='/notes/lab/'));
 const downloads=links(html).filter(a=>Object.hasOwn(a,'download'));assert.deepEqual(downloads.map(a=>a.href).sort(),(e.resources||[]).filter(r=>r.role!=='html').map(r=>r.href).sort());
});
test('related original animation remains separate, unchanged and opt-in',()=>{
 const video=experimentDetail(videos[0].id);assert.ok(links(video).some(a=>a.href==='/notes/lab/docs/pelican-bicycle/'));
 const html=experimentDetail('pelican-bicycle');assert.match(html,/data-lab-play/);assert.match(html,/data-copy-prompt/);assert.doesNotMatch(html,/<iframe/);assert.ok(html.includes(original.prompt));assert.equal(experimentDetail('not-registered'),null);
});
test('one-prompt spotlight never labels a hosted video as the HTML experiment',()=>{const h=labSpotlight();assert.match(h,/pelican-bicycle/);assert.doesNotMatch(h,/BV1TvhU6aEci|BV1rHh16CE3T/);});
test('document directory uses video labels with one local detail link per video',()=>{
 const h=documentDirectory(project());for(const e of videos){const items=links(h).filter(a=>a.href==='/notes/lab/docs/'+e.id+'/');assert.equal(items.length,1);assert.match(items[0].text,/视频作品/);assert.doesNotMatch(items[0].text,/下载与运行|打开运行说明/);}
});
test('Chinese and English searches include the new registry-derived entries',()=>{
 const index=makeIndex({projects:[project()]}),api=translator();
 for(const [query,id] of [['琵琶','pipa-pelican'],['Pipa','pipa-pelican'],['中秋','mid-autumn-special'],['Mid-Autumn','mid-autumn-special']])assert.ok(search(index,{q:query,translate:s=>api.translate(s,'en')}).items.some(e=>e.href==='/notes/lab/docs/'+id+'/'),query);
 assert.equal(index.entries.filter(e=>e.href.includes('/docs/pipa-pelican/')).length,1);
});
test('experience build is connected to the same generated catalog and projection',()=>{
 const s=read('scripts/experience/build.mjs').toString();assert.match(s,/import \{EXPERIMENTS\} from '\.\.\/\.\.\/assets\/journal\/data\/experiments\.mjs'/);assert.match(s,/projects\.push\(withExperimentDocuments\(p,EXPERIMENTS\)\)/);
});
test('every new video detail text and accessible name translates and restores',()=>{
 const api=translator();for(const e of videos){const html=experimentDetail(e.id),texts=[...html.matchAll(/>([^<>]+)</g)].map(m=>decodeAttribute(m[1]).trim()).filter(Boolean);for(const a of links(html))if(a['aria-label'])texts.push(a['aria-label']);
 for(const text of texts){assert.doesNotMatch(api.translate(text,'en'),/[\u3400-\u9fff]/u,text);assert.equal(api.translate(text,'zh'),text);}}
});
test('video metadata and directory markup escape text, not executable HTML',()=>{
 const e={...videos[0],id:'escape-sample',title:'<img src=x onerror=alert(1)>',subtitle:'<script>alert(1)</script>'};delete e.resources;validateExperiment(e);
 const p=withExperimentDocuments({layout:'experiments',id:'lab',docs:[]},[e]),h=documentDirectory(p);assert.doesNotMatch(h,/<img|<script/);assert.match(h,/&lt;img/);
});

async function inspectComponentFixture(inspect){
 const {componentBrowser}=await import('../../scripts/platform/browser-components.mjs');
 const {serve}=await import('../../scripts/platform/browser/server.mjs');
 const http=await import('node:http');
 const get=(origin,pathname)=>new Promise((resolve,reject)=>{
  const req=http.get(new URL(pathname,origin),res=>{const chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});
  req.setTimeout(3000,()=>req.destroy(Error('Fixture HTTP timeout')));req.on('error',reject);
 });
 let inspected=false,failed;
 const stop='Intentional fixture inspection only; no browser launched';
 const report=await componentBrowser(root,{save:false,
  serverFactory:async dir=>{const server=await serve(dir);inspected=true;try{await inspect(dir,p=>get(server.origin,p));}catch(error){failed=error;}return server;},
  launcher:async()=>{throw Error(stop);}
 });
 assert.equal(inspected,true);assert.equal(report.ok,false);assert.equal(report.cases.length,0);
 assert.deepEqual(report.errors,[{name:'component-run',error:stop}]);if(failed)throw failed;
}
test('real component HTTP fixture includes the new transitive contract and exact video metadata',async()=>{
 await inspectComponentFixture(async(_dir,get)=>{
  const layout=await get('/assets/journal/public-layout.mjs');assert.equal(layout.status,200);
  assert.match(layout.body.toString(),/from ['"]\.\.\/platform\/contracts\.mjs['"]/);
  const dependency=await get('/assets/platform/contracts.mjs');assert.equal(dependency.status,200);
  assert.match(dependency.headers['content-type'],/javascript/);assert.deepEqual(dependency.body,read('assets/platform/contracts.mjs'));
  const catalog=await get('/assets/journal/data/experiments.mjs');assert.equal(catalog.status,200);
  for(const e of videos)assert.ok(catalog.body.toString().includes(e.video.bvid));
 });
});
test('missing transitive contract remains a real HTTP failure rather than a fabricated success',async()=>{
 await inspectComponentFixture(async(dir,get)=>{
  fs.unlinkSync(dir+'/assets/platform/contracts.mjs');
  assert.equal((await get('/assets/platform/contracts.mjs')).status,404);
  assert.equal((await get('/assets/journal/public-layout.mjs')).status,200);
 });
});
