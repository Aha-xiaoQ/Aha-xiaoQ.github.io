import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {experimentVideoURL,validateExperiment,withExperimentDocuments} from '../../assets/platform/contracts.mjs';
import {loadExperiments} from '../../scripts/platform/experiments.mjs';
import {experimentDetail,experimentGallery} from '../../assets/journal/public-layout.mjs';
const root=new URL('../../',import.meta.url);
const publishedEntry=JSON.parse(fs.readFileSync(new URL('content/experiments/bad-apple.json',root)));
const entry={...publishedEntry,video:{provider:'bilibili',status:'pending'}};
test('Bilibili pending state has no invented watch URL or local playback',()=>{
 assert.equal(experimentVideoURL(entry.video),null);validateExperiment(entry);
 for(const video of [{provider:'local',href:'/experiments/releases/bad-apple/video.mp4'},{provider:'bilibili',bvid:''},{provider:'bilibili',status:'pending',bvid:'BV1vkaW6CE8W'},{provider:'bilibili',status:'pending',href:'#'}])assert.throws(()=>experimentVideoURL(video));
 assert.equal(experimentVideoURL({provider:'bilibili',bvid:'BV1vkaW6CE8W'}),'https://www.bilibili.com/video/BV1vkaW6CE8W/');
});
test('published video keeps standard poster, facts and file layout',()=>{
 const html=experimentDetail('bad-apple');assert.match(html,/q-video-poster/);assert.match(html,/观看视频/);assert.match(html,/https:\/\/www\.bilibili\.com\/video\/BV15pao6iEzF\//);assert.match(html,/<dt>观看平台<\/dt><dd>哔哩哔哩/);assert.match(html,/<dt>视频编号/);assert.match(html,/BV15pao6iEzF/);assert.doesNotMatch(html,/观看视频 · 待发布/);
 assert.doesNotMatch(html,/<video|<iframe|本页观看|下载完整成片|q-video-local/);assert.deepEqual(entry.resources.map(x=>x.role),['html','source']);assert.doesNotMatch(experimentGallery(),/href="null"|href="undefined"/);
 const doc=withExperimentDocuments({layout:'experiments',docs:[]},[entry]).docs[0];assert.equal(doc.action,undefined);
});
test('several pending Bilibili entries are distinct without fake unique URLs',()=>{
 const rows=['pending-one','pending-two'].map(id=>({...entry,id,resources:undefined}));
 const reader=p=>Buffer.from(JSON.stringify(p.endsWith('catalog.json')?{schemaVersion:1,entries:rows.map(x=>({id:x.id,file:'content/experiments/'+x.id+'.json'}))}:rows.find(x=>p.endsWith(x.id+'.json'))));
 assert.equal(loadExperiments('',{reader}).entries.length,2);
});


test('source credits link to confirmed footage and reject unsafe identities',()=>{
 validateExperiment(publishedEntry);
 const html=experimentDetail('bad-apple');
 for(const bv of ['BV1Wx411c7JT','BV1P78t68EMj','BV1ce411N7Kd'])assert.ok(html.includes('https://www.bilibili.com/video/'+bv+'/'));
 assert.doesNotMatch(html,/待核实署名|original\/THIRD_PARTY/);
 for(const sourceVideos of [[{label:'source',bvid:'javascript:alert(1)'}],[{label:'source',bvid:'BV1ce411N7Kd',href:'https://example.com'}],[],[publishedEntry.sourceVideos[0],publishedEntry.sourceVideos[0]]])assert.throws(()=>validateExperiment({...publishedEntry,sourceVideos}));
});
