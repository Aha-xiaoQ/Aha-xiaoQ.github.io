import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('published gameplay uses the existing cover link and keeps the offline HTML download',()=>{
  const c=vm.createContext({URL});
  for(const p of ['assets/ui/site-actions.js','assets/launch/journey.js'])vm.runInContext(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'),c);
  const game={title:'Sample',slug:'sample',localUrl:'games/sample/play.html',localVideoUrl:'games/sample/run.mp4',cover:'games/sample/cover.png',downloadUrl:'downloads/sample.html',downloadLabel:'下载 HTML',downloadInstructions:'用浏览器打开 HTML。',videoSlot:true,videoUrl:'https://www.bilibili.com/video/BV1cHH965ECn/',videoLabel:'B站观看'};
  const html=c.SITE_JOURNEY.gameStart(game);
  assert.doesNotMatch(html,/<video|<iframe|<source/);
  assert.match(html,/<a[^>]+href="https:\/\/www\.bilibili\.com\/video\/BV1cHH965ECn\/"[^>]+>/);
  assert.match(html,/<img[^>]+src="\/games\/sample\/cover.png"/);
  assert.doesNotMatch(html, /<a[^>]+href="[^"\n]*\.mp4|下载实况 MP4/);
  assert.match(html,/下载 HTML/);assert.match(html,/用浏览器打开 HTML。/);
  assert.match(html,/B站观看/);assert.doesNotMatch(html,/B站视频待补链接|下载后解压/);
  const legacy=c.SITE_JOURNEY.gameStart({title:'Zip game',localUrl:'games/zip/play.html',downloadUrl:'downloads/zip.zip'});
  assert.match(legacy,/下载后解压/);assert.doesNotMatch(legacy,/<video/);
  const pending=c.SITE_ACTIONS.videoPanel({...game,videoUrl:'',videoPendingLabel:'<script>bad</script>'});
  assert.match(pending,/&lt;script&gt;/);assert.doesNotMatch(pending,/<script>/);
});
