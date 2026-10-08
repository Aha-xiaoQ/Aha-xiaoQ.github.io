import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('public Map Workshop 2.0 guide separates its download, previous online version and example',()=>{
 const c=vm.createContext({URL});for(const p of ['content/site-data.js','assets/ui/site-actions.js','assets/launch/journey.js'])vm.runInContext(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'),c);
 const item=c.SITE_DATA.tools.find(x=>x.id==='mario-map-workshop');assert.equal(item.detailUrl,'/tools/mario-map-workshop-2-0/');assert.equal(item.title,'马里奥地图工坊');const html=c.SITE_JOURNEY.toolGuide(item);
 assert.match(html,/2\.0/);assert.match(html,/旧版在线体验/);assert.match(html,/href="\/packages\/mario-mix-worlds\/atlas\/editor.html"/);assert.match(html,/href="\/games\/five-regions\/"/);assert.doesNotMatch(html,/1\.10\.34|W02|1958|内部测试|下载实况 MP4/);
 const safe=c.SITE_JOURNEY.toolGuide({...item,guide:{...item.guide,intro:'<script>unsafe</script>'}});assert.doesNotMatch(safe,/<script>/);
});
