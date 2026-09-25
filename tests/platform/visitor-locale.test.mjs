import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {planContent} from '../../scripts/platform/content.mjs';
import {parseAttributes,decodeAttribute} from '../../scripts/lib/html-resources.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(root+p,'utf8');
const catalog=JSON.parse(read('content/locales/en.json'));
const runtime=read('assets/site-i18n.js');
const han=/[\u3400-\u9fff]/u;
function translator(source=catalog){
 const doc={readyState:'loading',documentElement:{},addEventListener(){}};
 const legacy=Object.freeze({'旧词条':'Legacy entry'});
 const context=vm.createContext({URL,document:doc,location:{href:'https://aha-xiaoq.github.io/404.html?lang=en'},SITE_EN:legacy});
 const plan=planContent(root,{reader:p=>p==='content/locales/en.json'?Buffer.from(JSON.stringify(source)):Buffer.from(read(p))});
 vm.runInContext(plan.files.get('assets/i18n/messages.js').toString(),context);
 vm.runInContext(runtime,context);
 // No body is supplied: this exercises translation, not simulated DOM or network behavior.
 context.SITE_I18N.register(context.SITE_LOCALE_MESSAGES.en);
 return {api:context.SITE_I18N,context,legacy};
}
function journey(){
 const c=vm.createContext({URL});
 for(const file of ['assets/ui/site-actions.js','assets/launch/journey.js'])vm.runInContext(read(file),c,{filename:file});
 return c.SITE_JOURNEY;
}
// Controlled strings emitted by the actual pure markup generator, not an HTML audit parser.
function visitorStrings(html){
 const body=html.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,'');
 const text=[...body.matchAll(/>([^<>]+)</g)].map(m=>decodeAttribute(m[1]).trim()).filter(Boolean);
 for(const m of body.matchAll(/<[a-z][\w-]*\b([^>]*)>/gi)){
  const attrs=parseAttributes(m[1]);
  for(const key of ['placeholder','aria-label','title','alt'])if(attrs[key])text.push(attrs[key]);
 }
 return [...new Set(text)];
}
function untranslated(strings,api){return strings.filter(s=>han.test(api.translate(s,'en')));}
const cases=[
 ['404 recovery',()=>journey().notFound()],
 ['visitor help',()=>journey().helpPage()],
 ['game with download',()=>journey().gameStart({title:'Fixture',localUrl:'/games/fixture/play.html',downloadUrl:'/downloads/fixture.zip',videoUrl:'https://www.bilibili.com/video/BV1g9bx6PEwL/'})],
 ['game without download',()=>journey().gameStart({title:'Fixture',localUrl:'/games/fixture/play.html'})],
 ['pending video panel',()=>journey().gameStart({title:'Fixture',videoSlot:true,localUrl:'/games/fixture/play.html'})],
 ['available video panel',()=>journey().gameStart({title:'Fixture',videoSlot:true,videoUrl:'https://www.bilibili.com/video/BV1g9bx6PEwL/',localUrl:'/games/fixture/play.html'})]
];
for(const[name,generate]of cases)test('actual '+name+' UI has complete English text and input attributes',()=>{
 const html=generate(),strings=visitorStrings(html),{api}=translator();
 assert.ok(strings.length>5);assert.deepEqual(untranslated(strings,api),[],name);
 for(const s of strings)assert.equal(api.translate(s,'zh'),s);
});
test('actual recovery placeholder is the source message, not the different project-search fixture',()=>{
 const html=journey().notFound();assert.match(html,/placeholder="作品名称或关键词"/);
 const{api}=translator();assert.equal(api.translate('作品名称或关键词','en'),'Project name or keywords');
 assert.match(html,/method="get"/);assert.match(html,/name="q"/);assert.doesNotMatch(html,/data-i18n-skip|translate="no"/);
});
test('removing the recovery translation reproduces the final browser gate defect',()=>{
 const source={...catalog,messages:catalog.messages.filter(r=>r.source!=='作品名称或关键词')};
 const {api}=translator(source);assert.ok(untranslated(visitorStrings(journey().notFound()),api).includes('作品名称或关键词'));
});
test('keeping Chinese in the recovery translation still fails coverage',()=>{
 const source={...catalog,messages:catalog.messages.map(r=>r.source==='作品名称或关键词'?{...r,text:'作品名称或关键词'}:r)};
 assert.ok(untranslated(visitorStrings(journey().notFound()),translator(source).api).includes('作品名称或关键词'));
});
for(const [source,expected]of [
 ['共享记录更新于 2026-09-24 · 非 GitHub 实时看板','Shared records updated 2026-09-24 · Not a live GitHub board'],
 ['世界 01','World 01'],['世界 08','World 08'],['开发源码 0.4.3','Development source 0.4.3'],
 ['Fixture游戏预览','Fixture game preview'],['观看 Fixture 视频','Watch Fixture video'],
 ['Fixture：视频待发布','Fixture: video coming soon'],
 ['IN THE MAKING / 游戏','IN THE MAKING / GAMES'],['IN THE MAKING / 网站','IN THE MAKING / WEBSITE'],['IN THE MAKING / 实验','IN THE MAKING / EXPERIMENTS']
])test('bounded UI text '+source,()=>assert.equal(translator().api.translate(source,'en'),expected));
test('untranslated source prose is not rewritten into a partially English instruction',()=>{
 const{api}=translator();for(const s of ['打开 http://127.0.0.1:4196/atlas/index.html，选择世界、关卡。','查看 尚未提供译文的独立原文'])assert.equal(api.translate(s,'en'),s);
 assert.equal(api.translate('打开 Fixture','en'),'Open Fixture');assert.equal(api.translate('查看 Fixture','en'),'View Fixture');
});
test('translations preserve source release qualifiers and do not mutate frozen legacy messages',()=>{
 const {api,context,legacy}=translator();const s='这是 0.4.3 开发候选，和已发布试玩分别维护；完整设备与自然通关验收尚未完成。';
 assert.match(api.translate(s,'en'),/candidate/);assert.match(api.translate(s,'en'),/not complete/);
 assert.equal(api.translate(s,'zh'),s);assert.strictEqual(context.SITE_EN,legacy);assert.deepEqual(legacy,{'旧词条':'Legacy entry'});
});
test('whitespace and raw original prompt remain exactly recoverable',()=>{
 const{api}=translator();assert.equal(api.translate(' 作品名称或关键词\n','en'),' Project name or keywords\n');
 const prompt=JSON.parse(read('content/experiments/pelican-bicycle.json')).prompt;
 assert.equal(typeof prompt,'string');assert.ok(prompt.length>20);assert.equal(api.translate(prompt,'zh'),prompt);
});
