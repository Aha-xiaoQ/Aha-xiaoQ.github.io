import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateExperiment} from '../../assets/platform/contracts.mjs';
import {experimentGallery} from '../../assets/journal/public-layout.mjs';

const read=id=>JSON.parse(fs.readFileSync(new URL('../../content/experiments/'+id+'.json',import.meta.url)));
const html=read('pelican-bicycle'),video=read('pipa-pelican');
for(const [kind,example] of [['HTML',html],['video',video]]){
 test(kind+' optional cover keeps uncovered records valid',()=>{const row=structuredClone(example);delete row.cover;assert.equal(validateExperiment(row),row);});
 for(const extension of ['jpg','png','webp'])test(kind+' local cover accepts '+extension,()=>{const row=structuredClone(example);row.cover={src:'/assets/lab/local.'+extension,alt:'Original work frame'};assert.equal(validateExperiment(row),row);});
 for(const src of ['https://example.com/a.png','/assets/other/a.png','/assets/lab/../a.png','/assets/lab/%2e%2e/a.png','/assets/lab/a.png?x=1','/assets/lab/a.png#x','/assets/lab/a.svg','/assets/lab/a.PNG','assets/lab/a.png','/assets/lab/a b.png'])test(kind+' rejects unsafe/unregistered cover '+src,()=>{const row=structuredClone(example);row.cover={src,alt:'Frame'};assert.throws(()=>validateExperiment(row));});
 for(const cover of [null,{src:'/assets/lab/a.png',alt:''},{src:'/assets/lab/a.png',alt:'x'.repeat(301)},{src:'/assets/lab/a.png',alt:12},{src:'/assets/lab/a.png',alt:'Frame',href:'/outside'}])test(kind+' rejects invalid cover shape '+JSON.stringify(cover).slice(0,60),()=>{const row=structuredClone(example);row.cover=cover;assert.throws(()=>validateExperiment(row));});
}

// Supply source records to the renderer's in-memory projection.
const layoutURL=new URL('../../assets/journal/public-layout.mjs',import.meta.url);
const dataSpecifier=fs.readFileSync(layoutURL,'utf8').match(/import\s*\{EXPERIMENTS\}\s*from\s*'([^']+)'/)[1];
const {EXPERIMENTS}=await import(new URL(dataSpecifier,layoutURL));
function gallery(rows){const original=EXPERIMENTS.slice();try{EXPERIMENTS.splice(0,EXPERIMENTS.length,...rows);return experimentGallery();}finally{EXPERIMENTS.splice(0,EXPERIMENTS.length,...original);}}
test('all three original covers render with existing links and no embedded player',()=>{
 const rows=['pelican-bicycle','pipa-pelican','mid-autumn-special'].map(read),output=gallery(rows);
 const cards=output.match(/<article\b[^>]*>[\s\S]*?<\/article>/g);assert.equal(cards.length,3);
 for(const [index,row] of rows.entries()){
  validateExperiment(row);const card=cards[index];
  assert.ok(card.includes('class="q-lab-cover" href="/notes/lab/docs/'+row.id+'/"'));
  assert.ok(card.includes('src="'+row.cover.src+'"'));assert.ok(card.includes('alt="'+row.cover.alt.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"'));
  assert.doesNotMatch(card,/q-lab-visual/);
  if(row.kind==='video')assert.ok(card.includes('https://www.bilibili.com/video/'+row.video.bvid+'/'));
  else{assert.ok(card.includes('href="'+row.artifact.href+'"'));assert.ok(card.includes('查看实验'));}
 }
 assert.doesNotMatch(output,/<(?:iframe|video|audio)\b/);
});
test('HTML without a cover retains the original SVG placeholder and animation link',()=>{
 const row=structuredClone(html);delete row.cover;const output=gallery([row]);assert.match(output,/q-lab-visual/);assert.ok(output.includes('ONE PROMPT'));assert.ok(output.includes(row.artifact.href));assert.doesNotMatch(output,/q-lab-cover/);
});
test('cover alt text is escaped without introducing markup or attributes',()=>{
 const row=structuredClone(html);row.cover.alt='" onerror="alert(1) <script>&';validateExperiment(row);const output=gallery([row]);assert.ok(output.includes('alt="&quot; onerror=&quot;alert(1) &lt;script&gt;&amp;"'));assert.doesNotMatch(output,/<script>|\s onerror="/);
});
