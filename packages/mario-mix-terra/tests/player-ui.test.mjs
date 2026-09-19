import test from 'node:test';
import assert from 'node:assert/strict';
import {playerCopy,wrapUiText,formatUiValue} from '../src/ui/player-copy.mjs';
import {buildQuickGuide} from '../src/ui/quick-guide.mjs';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
for(const [hero,chapter]of Object.entries({mario:'1-1',bill:'1-1',megaman:'1-1',ryu:'1-2',tank:'1-2',sandboxTrio:'1-3'}))test('Correct chapter and start copy: '+hero,()=>{const m=playerCopy({hero,mode:'menu'});assert.equal(m.selected.chapter,chapter);assert.equal(m.overlay.action,'开始 '+chapter);assert(!/用户|GPT|R0|M06|原作复刻|→/.test(JSON.stringify(m)));});
for(const mode of ['paused','respawn','gameover','win'])test('Actionable screen copy: '+mode,()=>{const c=playerCopy({hero:'sandboxTrio',mode});assert(c.overlay.title&&c.overlay.action&&c.overlay.body);assert(!c.overlay.body.includes('1-1'));});
test('Objectives distinguish fight and exploration',()=>{assert(playerCopy({hero:'sandboxTrio',inArena:true,phase:'battle'}).objective.includes('攻击'));assert(playerCopy({hero:'sandboxTrio',inArena:true,phase:'cleared'}).objective.includes('返回'));});
test('Unknown avatar is not labelled as a published level',()=>assert.equal(playerCopy({hero:'foo'}).selected.chapter,'实验'));
test('Display numbers do not change input data',()=>{assert.equal(formatUiValue(-1),'0');assert.equal(formatUiValue(25.9),'25');assert.equal(formatUiValue(NaN),'—');});
test('Measured text wraps without compressed glyphs',()=>{assert.deepEqual(wrapUiText('abcd',20,s=>s.length*5),['abcd']);assert.deepEqual(wrapUiText('abcdefg',10,s=>s.length*5,2),['ab','c…']);assert.deepEqual(wrapUiText('a',0,s=>s.length),[]);});
test('Tank help does not teach platform jumping or Terraria inventory',()=>{const t=buildQuickGuide({hero:'tank',keyLabel:x=>x,padLabel:x=>x});assert(t.some(r=>r.text.includes('不能跳跃')));assert(!JSON.stringify(t).includes('快捷栏'));});
test('Ninja gets wall instructions, not generic Terraria guide',()=>{const t=buildQuickGuide({hero:'ryu',keyLabel:x=>x,padLabel:x=>x});assert(t.some(r=>r.title==='攀墙'));});
test('Candidate template and historical reference are distinct',()=>{const c=JSON.parse(read('build.config.json'));assert.equal(c.candidateTemplate,'src/app/player.template.html');assert(read('src/app/index.template.html').includes('1-1'));assert(!read(c.candidateTemplate).includes('WORLD<br>1 — 1'));});
test('Player UI uses native dialogs and bounded history without HTML injection',()=>{const s=read('src/ui/player-interface.mjs');assert(s.includes("node('dialog'"));assert(s.includes('slice(0,8)'));assert(!s.includes('innerHTML'));assert(!/(?:new MutationObserver|setInterval\s*\(|requestAnimationFrame\s*\()/.test(s));});
test('HUD uses a separate display surface without resizing game canvas',()=>{const s=read('src/ui/hud-surface.mjs');assert(s.includes('pixelRatio'));assert(!/game\.(?:width|height)\s*=/.test(s));assert(s.includes("aria-hidden"));assert(s.includes('layer.remove()'));});
test('Pickup is DOM text and maintains original age owner',()=>{const c=JSON.parse(read('build.config.json')),h=c.hooks.find(x=>x.id==='notice-paint');assert(h.replacement.includes('pickup'));assert(!/age\s*=/.test(h.replacement));});
test('Bindings show interaction as well as tools and mount',()=>assert(!read('src/ui/bindings-view.mjs').includes("key === 'interact'")));
test('No new fonts, tracking, or external requests in player interface',()=>{for(const f of ['player-interface','player-copy','hud-surface'])assert(!/https?:|fetch\s*\(|@font-face/.test(read('src/ui/'+f+'.mjs')));});

test('Missing texture fallback is a symbol, not compressed five-pixel names',()=>{const c=JSON.parse(read('build.config.json')),h=c.hooks.find(x=>x.id==='missing-pickup-paint');assert(h&&h.replacement.includes('paintMissingPickup'));assert(!h.replacement.includes('fillText'));});
test('Compact HUD invokes original tool buttons and retains desktop mapping',()=>{const s=read('src/ui/hud-surface.mjs');assert(s.includes('selectTool(Number(b.dataset.tool))'));assert(read('src/bridges/adventure-shell.bridge.js').includes('t15Slots[i]?.click()'));assert(s.includes('m07CompactHud'));assert(s.includes('600'));assert(s.includes('fullscreenElement'));});

test('Normal animation frame uses a closure-safe UI refresh port',()=>{const c=JSON.parse(read('build.config.json')),h=c.hooks.find(x=>x.id==='clock');assert(h.replacement.includes('terraAfterDraw?.()'));assert(!h.replacement.includes('terraPlayerInterface'));assert(read('src/bridges/adventure-shell.bridge.js').includes('terraAfterDraw='));});
