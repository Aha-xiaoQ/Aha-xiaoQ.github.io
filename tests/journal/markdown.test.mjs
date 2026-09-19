import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMarkdown as render} from '../../assets/journal/markdown.mjs';

test('headings use Unicode slugs and collision-safe duplicate IDs',()=>{
 const h=render('# Hello, World!\n# Hello, World!\n# hello-world-1\n# 中文 标题');
 for(const id of ['hello-world','hello-world-1','hello-world-1-1','中文-标题'])assert.ok(h.includes(`id="${id}"`));
 assert.match(render('Heading\n==='),/<h1/);
 assert.match(render('# C#'),/>C#<\/h1>/);
});
test('HTML and inline code are escaped, formatting stays within text',()=>{
 const h=render('<script>alert(1)</script> **bold** *em* `x < y`');
 assert.ok(!h.includes('<script>'));assert.match(h,/&lt;script&gt;/);assert.match(h,/<strong>bold<\/strong>/);assert.match(h,/<em>em<\/em>/);assert.match(h,/<code>x &lt; y<\/code>/);
});
test('nested lists, quotes, rules and tables render structure',()=>{
 const h=render('3. first\n   - nested\n     - deep\n4. second\n\n> quote\n>\n> **more**\n\n---\n\n| A | B |\n| --- | --- |\n| `a|b` | a\\|b |');
 assert.match(h,/<ol start="3">/);assert.equal((h.match(/<ul>/g)||[]).length,2);assert.match(h,/<blockquote>/);assert.match(h,/<hr>/);assert.match(h,/<table>/);assert.match(h,/<td><code>a\|b<\/code><\/td>/);assert.match(h,/<td>a\|b<\/td>/);
});
test('fenced code preserves blank lines, spaces and copy contract without HTML execution',()=>{
 const h=render('```html\n  <img onerror="bad">\n\nlast\n```');
 assert.match(h,/data-code-example/);assert.match(h,/data-copy-code/);assert.match(h,/data-copy-status/);assert.match(h,/<code>  &lt;img onerror=&quot;bad&quot;&gt;\n\nlast<\/code>/);
});
test('unsafe URLs are never links, including resolver output',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,bad','//evil.test','/\\evil','/%2f%2fevil','/%2e%2e/private','relative.md'])assert.ok(!render(`[label](${url})`).includes('<a '),url);
 assert.ok(!render('[x](ok.md)',{resolveLink:()=> 'javascript:evil'}).includes('<a '));
 assert.ok(!render('[x](javascript:evil)',{resolveLink:()=> '/safe/'}).includes('<a '));
 assert.ok(!render('[x](ok.md)',{resolveLink:()=>{throw Error('bad')}}).includes('<a '));
});
test('safe links and curated relative resolution preserve labels and anchors',()=>{
 const h=render('[**Guide**](guide.md#part) [web](https://example.test/a_(b)) [part](#part)',{resolveLink:x=>x.startsWith('guide.md')?'/notes/project/docs/guide/#part':x});
 assert.match(h,/href="\/notes\/project\/docs\/guide\/#part"><strong>Guide/);assert.match(h,/href="https:\/\/example.test\/a_\(b\)"/);assert.match(h,/href="#part"/);
});
test('page heading options preserve anchors, cap levels and ignore fenced headings',()=>{
 const source='\n# Title\n## Section\n###### Deep\n# Title';
 const h=render(source,{headingOffset:1,omitFirstHeading:true});
 assert.ok(h.startsWith('<span id="title"></span>'));
 assert.match(h,/<h3 id="section"/);assert.match(h,/<h6 id="deep"/);assert.match(h,/<h2 id="title-1"/);
 assert.match(render('Title\n===\n\n## Section',{omitFirstHeading:true}),/^<span id="title"><\/span>/);
 assert.match(render('```\n# code\n```\n# Actual',{omitFirstHeading:true}),/<h1 id="actual"/);
 assert.match(render('Intro\n\n# Actual',{omitFirstHeading:true}),/<h1 id="actual"/);
 assert.match(render('| A |\n| --- |\n| B |'),/^<div class="j-table-scroll"><table>/);
 assert.match(render('# Title'),/^<h1 id="title"/);
});
