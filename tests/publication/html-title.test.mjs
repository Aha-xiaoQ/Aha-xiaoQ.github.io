import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {htmlTitleCount} from '../../scripts/publication/html-titles.mjs';
import {auditFiles} from '../../scripts/publication/audit.mjs';
const root=new URL('../../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root));
const origin='https://aha-xiaoq.github.io';
const page=(body='',head='<title>Document</title>')=>`<!doctype html><html lang="en"><head>${head}</head><body><main><h1>Document</h1>${body}</main></body></html>`;
const audit=(s,name='index.html',extra=[])=>auditFiles(new Map([[name,Buffer.from(s)],...extra]),{origin});
const has=(r,problem)=>r.errors.some(x=>x.problem===problem);
const cases=[
 ['one document title',page(),1],
 ['one document title plus one SVG title',page('<svg><title>Picture</title></svg>'),1],
 ['multiple graphics and group names',page('<svg><title>A</title><g><title>B</title></g><svg><title>C</title></svg></svg><svg><title>D</title></svg>'),1],
 ['mixed-case tags and quoted greater-than',page('<SVG data-note=">"><TiTle>Picture</TiTle></SVG>'),1],
 ['missing document title is not supplied by SVG',page('<svg><title>Picture</title></svg>',''),0],
 ['two real HTML titles',page('','<title>One</title><title>Two</title>'),2],
 ['an extra HTML title after SVG',page('<svg><title>Picture</title></svg><title>Extra</title>'),2],
 ['an HTML title inside SVG foreignObject is still HTML',page('<svg><foreignObject><div><title>Extra</title></div></foreignObject></svg>'),2],
 ['nested SVG inside foreignObject',page('<svg><foreignObject><div><svg><title>Inner picture</title></svg></div></foreignObject></svg>'),1],
 ['HTML integration inside SVG desc',page('<svg><desc><title>HTML in description</title></desc></svg>'),2],
 ['self-closing SVG does not hide subsequent HTML title',page('<svg/><title>Extra</title>'),2],
 ['self-closing SVG title does not close its parent',page('<svg><title/><g><title>Group</title></g></svg>'),1],
 ['comments contain no title nodes',page('<!-- <title>Comment</title><svg> -->'),1],
 ['script title text is not markup',page('<script>const text="<title>Not markup</title><svg>";</script>'),1],
 ['style content is not markup',page('<style>.x::after{content:"<title>Not markup</title><svg>"}</style>'),1],
 ['textarea uses RCDATA',page('<textarea><title>Text</title><svg></textarea>'),1],
 ['HTML title content uses RCDATA',page('','<title>Literal <title> text</title>'),1],
 ['quoted attribute values do not contain markup',page('<div data-text="<title>Text</title><svg>"></div>'),1],
 ['inactive template has a separate content tree',page('<template><title>Template</title><svg><title>Graphic</title></svg></template>'),1],
 ['noscript follows existing scripting-enabled audit scope',page('<noscript><title>No-script fallback</title></noscript>'),1],
 ['CDATA within SVG is not title markup',page('<svg><![CDATA[<title>Text</title>]]><title>Graphic</title></svg>'),1],
 ['MathML titles do not name an HTML document',page('<math><title>Math name</title></math>'),1],
 ['MathML HTML integration',page('<math><annotation-xml encoding="text/html"><title>Extra</title></annotation-xml></math>'),2],
 ['foreign breakout cannot hide a following title',page('<svg><g><p>HTML paragraph</p><title>Extra</title>'),2],
 ['HTML xmlns cannot disguise an HTML title',page('<title xmlns="http://www.w3.org/2000/svg">Extra</title>'),2]
];
for(const [label,s,count]of cases)test('namespace title scan: '+label,()=>assert.equal(htmlTitleCount(s),count));
test('non-string input is rejected',()=>assert.throws(()=>htmlTitleCount(null),TypeError));
test('real pelican file is unchanged and retains its SVG accessible title',()=>{
 const b=read('experiments/pelican-bicycle.html'),meta=JSON.parse(read('content/experiments/pelican-bicycle.json'));
 assert.equal(b.length,meta.artifact.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),meta.artifact.sha256);
 const s=b.toString();assert.equal((s.match(/<title(?:\s|>)/gi)||[]).length,2);
 assert.equal(htmlTitleCount(s),1);assert.match(s,/<title id="scene-title">/);assert.match(s,/aria-labelledby="scene-title scene-desc"/);
});
test('actual publication auditor accepts the unmodified pelican document',()=>{
 const r=audit(read('experiments/pelican-bicycle.html').toString(),'experiments/pelican-bicycle.html');
 assert.deepEqual(r.errors,[]);assert.equal(r.pages,1);assert.equal(r.approved,false);assert.equal(r.networkVerified,false);
});
test('SVG-only title cannot satisfy the document title gate',()=>assert.ok(has(audit(page('<svg><title>Picture</title></svg>','')),'non-unique-title')));
test('a real duplicate HTML title remains a publication blocker',()=>assert.ok(has(audit(page('<svg><title>Picture</title></svg>','<title>One</title><title>Two</title>')),'non-unique-title')));
test('foreignObject HTML title does not gain the SVG exception',()=>assert.ok(has(audit(page('<svg><foreignObject><title>Extra</title></foreignObject></svg>')),'non-unique-title')));
test('main and h1 cardinality remain enforced',()=>{
 for(const name of ['main','h1'])assert.ok(has(audit(page(`<${name}>Extra</${name}>`)),`non-unique-${name}`));
});
test('duplicate SVG ids remain blocked',()=>assert.ok(has(audit(page('<svg><title id="x">A</title><g id="x"></g></svg>')),'duplicate-id')));
test('anchors to SVG titles remain visible to link auditing',()=>assert.deepEqual(audit(page('<svg><title id="picture">Picture</title></svg><a href="#picture">Picture name</a>')).errors,[]));
test('broken SVG-title anchors remain blocked',()=>assert.ok(has(audit(page('<svg><title id="picture">Picture</title></svg><a href="#missing">Picture name</a>')),'missing-anchor')));
test('references inside a foreignObject are not erased',()=>{
 const r=audit(page('<svg><foreignObject><a href="/missing.html">Guide</a></foreignObject></svg>'));
 assert.ok(has(r,'missing-resource'));
});
test('pre-existing audit errors cannot be cleared by the title fix',()=>{
 const prior={file:'missing.html',problem:'missing-resource'};
 const r=auditFiles(new Map([['index.html',Buffer.from(page('<svg><title>Picture</title></svg>'))]]),{origin,errors:[prior]});
 assert.ok(r.errors.some(x=>x.file===prior.file&&x.problem===prior.problem));
});
test('ZIP and internal-file checks still run',()=>{
 const r=audit(page(), 'index.html',[['downloads/bad.zip',Buffer.from('not ZIP')],['config/secret.json',Buffer.from('{}')]]);
 assert.ok(has(r,'invalid-zip'));assert.ok(has(r,'internal-file-in-artifact'));
});
