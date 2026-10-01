import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateExperiment} from '../../assets/platform/contracts.mjs';
import {experimentDetail,experimentGallery} from '../../assets/journal/public-layout.mjs';
const entry=JSON.parse(fs.readFileSync(new URL('../../content/experiments/world-execute-me.json',import.meta.url)));
test('video cover cannot load remote or escaping paths',()=>{
 for(const src of ['https://example.com/cover.jpg','/assets/lab/../secret.jpg','/assets/lab/%2e%2e/x.jpg','/assets/lab/test.svg','/assets/lab/x.jpg?x=1']) assert.throws(()=>validateExperiment({...entry,cover:{...entry.cover,src}}));
 assert.equal(validateExperiment(entry),entry);
});
test('approved cover has intrinsic ratio and BV action precedes artwork',()=>{
 const html=experimentDetail(entry.id);
 assert.ok(html.indexOf(entry.video.bvid)<html.indexOf(entry.cover.src));
 assert.match(html,/width="1920" height="1080"/);
 assert.ok(experimentGallery().includes(entry.cover.src));
 assert.ok(!html.includes('<h2>'+entry.title+'</h2>')); // Title remains owned by the page shell, independently of resource sections.
});
