import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {fixtureIcon, FIXTURE_ICON_LINK} from '../../scripts/platform/browser/fixture-icon.mjs';
import {serve} from '../../scripts/platform/browser/server.mjs';
import {resourceElements} from '../../scripts/lib/html-resources.mjs';
import {componentBrowser} from '../../scripts/platform/browser-components.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SETUP_ONLY = 'Intentional setup-only regression; no browser was launched';
function tmp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'q-component-icon-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  return dir;
}
async function get(server, name, method = 'GET', headers = {}) {
  const url = new URL(name, server.origin);
  return new Promise((resolve, reject) => {
    const request = http.request(url, {method, headers}, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({status:response.statusCode,
        headers:response.headers, body:Buffer.concat(chunks)}));
    });
    request.setTimeout(3000, () => request.destroy(Error('HTTP fixture timeout')));
    request.on('error', reject); request.end();
  });
}
async function fixtureSetup(inspect) {
  let called = false, temporaryRoot, inspectionError;
  const result = await componentBrowser(ROOT, {save:false,
    serverFactory:async dir => {
      called = true; temporaryRoot = dir;
      const server = await serve(dir);
      try { await inspect(dir, server); } catch (error) { inspectionError = error; }
      return server;
    },
    launcher:async () => { throw Error(SETUP_ONLY); }
  });
  assert.ok(called, JSON.stringify(result));
  assert.equal(result.ok, false); // Setup checks must not impersonate a browser pass.
  assert.deepEqual(result.errors, [{name:'component-run', error:SETUP_ONLY}]);
  assert.equal(fs.existsSync(temporaryRoot), false, 'Temporary site was not disposed');
  if (inspectionError) throw inspectionError;
}

test('fixture ICO is a complete 16x16 32-bit image, not an empty success body', () => {
  const icon = fixtureIcon(), offset = icon.readUInt32LE(18);
  assert.deepEqual([...icon.subarray(0, 6)], [0, 0, 1, 0, 1, 0]);
  assert.deepEqual([icon[6], icon[7], icon.readUInt16LE(12)], [16, 16, 32]);
  assert.equal(offset + icon.readUInt32LE(14), icon.length);
  assert.equal(icon.readUInt32LE(offset), 40);
  assert.equal(icon.readInt32LE(offset + 8), 32); // Color plus AND mask height.
  assert.equal(icon.readUInt32LE(offset + 20), 16 * 16 * 4);
  assert.equal(icon.length, 22 + 40 + 16 * 16 * 4 + 16 * 4);
  assert.equal(icon[65], 255); // A real opaque pixel.
});

test('fixture icon bytes are deterministic and independent across runs', () => {
  const first = fixtureIcon(), second = fixtureIcon();
  assert.notEqual(first, second); assert.deepEqual(first, second);
  first.fill(0); assert.deepEqual(second, fixtureIcon());
});

test('icon link is one actual local icon resource with matching size and MIME', () => {
  const elements = resourceElements('<head>' + FIXTURE_ICON_LINK + '</head>');
  assert.equal(elements.length, 1);
  assert.deepEqual({...elements[0].attributes}, {rel:'icon', type:'image/vnd.microsoft.icon',
    sizes:'16x16', href:'/favicon.ico'});
});

test('real loopback server serves exact ICO bytes for GET, HEAD and cache queries', async t => {
  const dir = tmp(t); fs.writeFileSync(path.join(dir, 'favicon.ico'), fixtureIcon());
  const server = await serve(dir); t.after(() => server.close());
  const a = await get(server, '/favicon.ico'), b = await get(server, '/favicon.ico?v=fresh');
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  assert.equal(a.headers['content-type'], 'image/vnd.microsoft.icon');
  assert.equal(a.headers['cache-control'], 'no-store');
  assert.deepEqual(a.body, fixtureIcon()); assert.deepEqual(b.body, a.body);
  const head = await get(server, '/favicon.ico', 'HEAD');
  assert.equal(head.status, 200); assert.equal(head.body.length, 0);
  assert.equal(head.headers['content-type'], a.headers['content-type']);
});

test('a root without the fixture still returns 404; the server never invents icons', async t => {
  const dir = tmp(t), server = await serve(dir); t.after(() => server.close());
  assert.equal((await get(server, '/favicon.ico')).status, 404);
  assert.equal((await get(server, '/favicon.ico', 'HEAD')).status, 404);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test('unrelated missing resources remain 404 instead of a blanket successful fallback', async t => {
  const dir = tmp(t); fs.writeFileSync(path.join(dir, 'favicon.ico'), fixtureIcon());
  const server = await serve(dir); t.after(() => server.close());
  for (const name of ['/missing.js', '/assets/missing.css', '/data/missing.json',
    '/icons/missing.ico', '/favicon.ico/missing.js']) {
    assert.notEqual((await get(server, name)).status, 200, name);
  }
  assert.equal((await get(server, '/icons/missing.ico')).status, 404);
});

test('serving icons does not weaken write, Host, private-path or link boundaries', async t => {
  const dir = tmp(t); fs.writeFileSync(path.join(dir, 'favicon.ico'), fixtureIcon());
  const server = await serve(dir); t.after(() => server.close());
  assert.equal((await get(server, '/favicon.ico', 'POST')).status, 405);
  assert.equal((await get(server, '/favicon.ico', 'GET', {Host:'foreign.invalid'})).status, 403);
  assert.equal((await get(server, '/.git/config')).status, 403);
  fs.mkdirSync(path.join(dir, 'linked-target'));
  fs.symlinkSync(path.join(dir, 'linked-target'), path.join(dir, 'linked'),
    process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal((await get(server, '/linked/favicon.ico')).status, 403);
  assert.deepEqual(fs.readFileSync(path.join(dir, 'favicon.ico')), fixtureIcon());
});

test('all three actual component fixture documents declare the same existing icon', async () => {
  await fixtureSetup(async (dir, server) => {
    for (const file of ['index.html', 'identity.html', 'experiments/fixture.html']) {
      const response = await get(server, '/' + file); assert.equal(response.status, 200, file);
      const icons = resourceElements(response.body.toString()).filter(element =>
        element.tag === 'link' && (element.attributes.rel || '').split(/\s+/).includes('icon'));
      assert.equal(icons.length, 1, file);
      assert.equal(icons[0].attributes.href, '/favicon.ico', file);
    }
    assert.deepEqual(fs.readFileSync(path.join(dir, 'favicon.ico')), fixtureIcon());
    assert.deepEqual((await get(server, '/favicon.ico')).body, fixtureIcon());
  });
});

test('actual generated component resources exist, with the original ESM alias test intact', async () => {
  await fixtureSetup(async (_dir, server) => {
    for (const file of ['index.html', 'identity.html', 'experiments/fixture.html']) {
      const html = (await get(server, '/' + file)).body.toString();
      for (const element of resourceElements(html)) {
        const url = element.attributes.src || element.attributes.href;
        if (!url || url.startsWith('data:')) continue;
        const response = await get(server, new URL(url, server.origin + '/' + file));
        assert.equal(response.status, 200, file + ' -> ' + url);
        assert.ok(response.body.length > 0, url);
      }
    }
    const entry = (await get(server, '/assets/identity-entry.mjs')).body.toString();
    assert.match(entry, /identity-leaf\.mjs\?v=old'/);
    assert.match(entry, /identity-leaf\.mjs\?v=older'/);
  });
});

test('removing the real fixture icon reproduces its missing-resource HTTP 404', async () => {
  await fixtureSetup(async (dir, server) => {
    fs.unlinkSync(path.join(dir, 'favicon.ico'));
    assert.equal((await get(server, '/favicon.ico')).status, 404);
    assert.equal((await get(server, '/identity.html')).status, 200);
  });
});

test('component resource collector still reports favicon and other local 404 failures', async () => {
  for (const suffix of ['/favicon.ico', '/missing.js', '/assets/missing.css']) {
    let origin, resourceEvent;
    const result = await componentBrowser(ROOT, {save:false,
      serverFactory:async dir => { const server = await serve(dir); origin = server.origin; return server; },
      launcher:async () => ({sessionId:'event-fixture', browser:'Event-only test, not Chromium',
        cdp:{on(name, fn) { if (name === 'Network.responseReceived') resourceEvent = fn; },
          async send(name) {
            if (name === 'Page.navigate') {
              resourceEvent({response:{url:origin + suffix, status:404}}, 'event-fixture');
              throw Error(SETUP_ONLY);
            }
            return {result:{value:true}};
          }}, async close() {}
      })
    });
    assert.equal(result.ok, false);
    const failure = result.errors.find(error => error.name === 'missing-component-resource');
    assert.ok(failure, suffix); assert.equal(JSON.parse(failure.error).url, origin + suffix);
    assert.equal(JSON.parse(failure.error).status, 404);
  }
});
