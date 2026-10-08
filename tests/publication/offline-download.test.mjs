import test from 'node:test';
import assert from 'node:assert/strict';
import {publicHTML} from '../../scripts/publication/build.mjs';
test('downloadable offline games preserve frozen bytes without website dependencies',()=>{
 const source='<html><head><title>Offline</title></head><body><script type="module">console.log(1)</script></body></html>';
 for(const p of ['games/five-regions/play.html','downloads/games/Five_Regions_1.10.36.html']) assert.equal(publicHTML(source,p,'https://aha-xiaoq.github.io',{},'test'),source);
 assert.match(publicHTML(source,'games/five-regions/index.html','https://aha-xiaoq.github.io',{},'test'),/data-public-release/);
});
