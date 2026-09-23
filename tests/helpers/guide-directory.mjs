/** Structural assertions for our generated guide markup, not a browser HTML parser.
 * A balanced element tree is required: a lazy regex ending at the first </div>
 * cannot inspect grouped directories, nested headings or related references.
 */
import assert from 'node:assert/strict';

const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const decode = text => String(text).replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, value => {
  const named = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"};
  if (own(named, value.toLowerCase())) return named[value.toLowerCase()];
  const hex = /^&#x/i.test(value), point = Number.parseInt(value.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
  return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : value;
});
const textOf = node => node.tag === '#text' ? decode(node.value) : node.children.map(textOf).join('');
const tidy = text => String(text).replace(/\s+/g, ' ').trim();
const hasClass = (node, name) => (node.attrs?.class || '').split(/\s+/).includes(name);
const descendants = node => node.children.flatMap(child => child.tag === '#text' ? [] : [child, ...descendants(child)]);
const within = (node, ancestor) => { for (let p = node.parent; p; p = p.parent) if (p === ancestor) return true; return false; };

function parseGeneratedMarkup(html) {
  assert.equal(typeof html, 'string', 'Guide output must be HTML text');
  const root = {tag:'#root', attrs:{}, children:[], parent:null}, stack = [root];
  const tokens = /<!--[\s\S]*?-->|<\/?[a-zA-Z][\w:-]*(?:\s+(?:"[^"]*"|'[^']*'|[^"'<>])*)?\s*\/?>/g;
  let end = 0;
  const appendText = value => { if (value) stack.at(-1).children.push({tag:'#text', value}); };
  for (const match of html.matchAll(tokens)) {
    appendText(html.slice(end, match.index));
    const raw = match[0]; end = match.index + raw.length;
    if (raw.startsWith('<!--')) continue;
    if (raw.startsWith('</')) {
      const tag = raw.match(/^<\/([\w:-]+)/)[1].toLowerCase();
      assert.ok(stack.length > 1, 'Unexpected closing element: ' + tag);
      assert.equal(stack.at(-1).tag, tag, 'Unbalanced generated guide markup');
      stack.pop(); continue;
    }
    const opening = raw.match(/^<([\w:-]+)\b([\s\S]*?)\/?>$/);
    assert.ok(opening, 'Unrecognized opening element');
    const tag = opening[1].toLowerCase(), attrs = Object.create(null);
    for (const attr of opening[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      const name = attr[1].toLowerCase();
      assert.ok(!own(attrs, name), 'Duplicate attribute: ' + name);
      attrs[name] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '');
    }
    if (tag === 'a') assert.ok(!stack.some(n => n.tag === 'a'), 'Nested links are not permitted');
    const parent = stack.at(-1), node = {tag, attrs, children:[], parent};
    parent.children.push(node);
    if (!VOID.has(tag) && !raw.endsWith('/>')) stack.push(node);
  }
  appendText(html.slice(end));
  assert.equal(stack.length, 1, 'Unclosed generated guide element');
  return root;
}

/** Check real destinations, not a hard-coded number or one particular nesting. */
export function assertGuideDirectory(html, project) {
  assert.ok(project && typeof project.id === 'string' && Array.isArray(project.docs), 'Project guide metadata is required');
  const tree = parseGeneratedMarkup(html), all = descendants(tree);
  const roots = all.filter(n => own(n.attrs, 'data-current-docs'));
  assert.equal(roots.length, 1, 'Exactly one current-guide directory is required');
  const directory = roots[0], nodes = descendants(directory);
  const expected = project.docs.filter(d => !d.archived && !d.readingDocument);
  const target = d => `/notes/${project.id}/docs/${d.id}/`;
  const cards = nodes.filter(n => n.tag === 'article' && hasClass(n, 'j-destination'));
  assert.equal(cards.length, expected.length, 'Every current guide needs one card');
  const byTarget = new Map(expected.map(d => [target(d), d]));
  assert.equal(byTarget.size, expected.length, 'Duplicate current guide IDs');
  const seen = new Set();
  for (const card of cards) {
    for (let p = card.parent; p && p !== directory; p = p.parent) {
      assert.ok(!own(p.attrs, 'data-history-docs'), 'Current cards must not be hidden in history');
      assert.notEqual(p.tag, 'details', 'Current cards must not be inside collapsed details');
    }
    const contents = descendants(card), anchors = contents.filter(n => n.tag === 'a');
    const primary = anchors.filter(n => hasClass(n, 'j-destination-link'));
    assert.equal(primary.length, 1, 'Each guide card needs exactly one primary anchor');
    const link = primary[0], href = link.attrs.href, doc = byTarget.get(href);
    assert.ok(doc, 'Primary link points at an unknown or wrong guide: ' + href);
    assert.ok(!seen.has(href), 'Duplicate primary guide destination: ' + href); seen.add(href);
    assert.ok(!own(link.attrs, 'hidden') && !own(link.attrs, 'download'), 'Guide reading links must be visible navigation');
    const title = descendants(link).filter(n => n.tag === 'h3');
    assert.equal(title.length, 1, 'Each primary link needs one visible guide title');
    assert.equal(tidy(textOf(title[0])), tidy(doc.title), 'Guide title and destination disagree');
    for (const label of descendants(link).filter(n => hasClass(n, 'j-destination-label'))) {
      assert.doesNotMatch(textOf(label), /[→↗↓]/u, 'Guide actions must not contain decorative arrows');
    }
    const related = project.docs.filter(d => d.readingDocument && d.parentDoc === doc.id && !d.versioned);
    const relatedAnchors = anchors.filter(n => n !== link);
    assert.deepEqual(relatedAnchors.map(n => n.attrs.href).sort(), related.map(target).sort(), 'Related references must remain complete and separate');
    for (const ref of relatedAnchors) {
      assert.ok(contents.some(n => n.tag === 'details' && hasClass(n, 'q-doc-related') && within(ref, n)), 'Secondary references must be in their own details section');
    }
  }
  assert.deepEqual([...seen].sort(), [...byTarget.keys()].sort(), 'A current guide destination is missing');
  // Includes related, standalone and archived documents. No document may quietly
  // disappear or acquire a duplicate title/button destination during regrouping.
  const links = nodes.filter(n => n.tag === 'a');
  assert.deepEqual(links.map(n => n.attrs.href).sort(), project.docs.map(target).sort(), 'Guide directory must retain every document exactly once');
  const history = project.docs.filter(d => d.archived || d.readingDocument && d.versioned);
  if (history.length) {
    const sections = nodes.filter(n => own(n.attrs, 'data-history-docs'));
    assert.equal(sections.length, 1, 'One history section is required');
    assert.equal(sections[0].tag, 'details', 'History must use native collapsible details');
    assert.ok(!own(sections[0].attrs, 'open'), 'History should be collapsed by default');
    assert.deepEqual(descendants(sections[0]).filter(n => n.tag === 'a').map(n => n.attrs.href).sort(), history.map(target).sort(), 'History destinations must remain complete');
  }
  return {currentGuides:cards.length, totalDocuments:links.length, historyDocuments:history.length};
}
