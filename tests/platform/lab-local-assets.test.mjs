import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateExperiment,validateExperimentResources} from '../../assets/platform/contracts.mjs';
import {verifyLabAssets} from '../../scripts/platform/lab-assets.mjs';
import {inspectZip} from '../../scripts/publication/archives.mjs';
import {experimentDetail,experimentGallery} from '../../assets/journal/public-layout.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(root+p),get=p=>JSON.parse(read(p));
const entries=['pipa-pelican','mid-autumn-special'].map(id=>get('content/experiments/'+id+'.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const e of entries){
 test(e.id+': final local files have valid ownership, extensions and SHA-256',()=>{assert.equal(validateExperiment(e),e);assert.equal(verifyLabAssets(root,[e]).files,3);});
 test(e.id+': every final resource has one real action in its native detail',()=>{const h=experimentDetail(e.id);for(const r of e.resources){assert.equal(h.split('href="'+r.href+'"').length-1,1);assert.ok(h.includes(r.label));}assert.equal(h.split('/video/'+e.video.bvid+'/').length-1,1);});
 test(e.id+': source ZIP passes the real archive reader, and contains no fonts',()=>{const r=e.resources.find(x=>x.role==='source');const result=inspectZip(read(r.href.slice(1)));assert.ok(result.entries>10);assert.ok(result.names.some(x=>/README\.md$/.test(x)));assert.ok(result.names.every(x=>! /\.(?:woff2?|ttf|ttc|otf)$/i.test(x)));});
 test(e.id+': HTML parses and cannot require a missing second soundtrack',()=>{const r=e.resources.find(x=>x.role==='html'),h=read(r.href.slice(1)).toString();for(const m of h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);assert.ok(h.includes('<html'));});
}
for(const [name,edit] of [
 ['wrong role',r=>r.role='audio'],['external address',r=>r.href='https://example.org/film.mp4'],
 ['wrong entry owner',r=>r.href='/experiments/releases/other/final.mp4'],['path traversal',r=>r.href='/experiments/releases/pipa-pelican/../final.mp4'],
 ['encoded path',r=>r.href='/experiments/releases/pipa-pelican/%66inal.mp4'],['wrong extension',r=>r.href='/experiments/releases/pipa-pelican/font.woff2'],
 ['zero size',r=>r.bytes=0],['oversized file',r=>r.bytes=100*1024*1024],['invalid hash',r=>r.sha256='broken'],['extra redirect',r=>r.redirect='https://evil.invalid/']
])test('release resource rejects '+name,()=>{const e=structuredClone(entries[0]);edit(e.resources[1]);assert.throws(()=>validateExperimentResources(e));});
test('duplicate file roles fail instead of silently replacing the source',()=>{const e=structuredClone(entries[0]);e.resources[2]=structuredClone(e.resources[1]);assert.throws(()=>validateExperiment(e));});
test('existing HTML generation records cannot masquerade as mixed-media releases',()=>{const e=get('content/experiments/pelican-bicycle.json');e.resources=entries[0].resources;assert.throws(()=>validateExperiment(e));});
test('an absent final file fails the mandatory source gate',()=>assert.throws(()=>verifyLabAssets(root,entries,{reader:()=>null}),/differs/));
test('tampered media fails even when its path still exists',()=>assert.throws(()=>verifyLabAssets(root,entries,{reader:p=>{const b=Buffer.from(read(p));b[0]^=1;return b;}}),/differs/));
test('read-only validation does not write input manifests',()=>{const before=JSON.stringify(entries);verifyLabAssets(root,entries);assert.equal(JSON.stringify(entries),before);});
test('gallery still makes no automatic video, iframe or audio request',()=>assert.doesNotMatch(experimentGallery(),/<(?:video|audio|iframe)\b/));
test('mid-autumn HTML uses one final MP4 track with explicit opt-in and burned-in captions',()=>{const h=read('experiments/releases/mid-autumn-special/index.html').toString();assert.match(h,/<video[^>]*controls[^>]*playsinline[^>]*preload="none"/);assert.equal((h.match(/<source\b/g)||[]).length,1);assert.match(h,/src="final\.mp4"/);assert.doesNotMatch(h,/<audio\b|\bautoplay\b|月下归途/);assert.match(h,/xiaoq-site-language/);assert.match(h,/pagehide/);});
test('mid-autumn archive and site player use the same exact HTML template',()=>{const z=inspectZip(read(entries.find(e=>e.id==='mid-autumn-special').resources.find(r=>r.role==='source').href.slice(1)));assert.equal(z.hashes['MidAutumn_Final_Source/player.template.html'],sha(read('experiments/releases/mid-autumn-special/index.html')));assert.ok(z.names.includes('MidAutumn_Final_Source/assets/cai-yun-zhui-yue.mp3'));assert.ok(z.names.includes('MidAutumn_Final_Source/drawing/film.py'));assert.ok(z.names.includes('MidAutumn_Final_Source/publication/captions.zh.srt'));});
test('source checks call the release verifier and never disable other gates',()=>{const s=read('scripts/platform/check.mjs').toString();assert.match(s,/verifyLabAssets\(root,experiments.entries\)/);assert.match(s,/checkReadmeLinks\(root\)/);assert.match(s,/content\(root,\{check:true\}\)/);});
