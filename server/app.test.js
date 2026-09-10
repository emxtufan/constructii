import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createApp } from './app.js';

const validQuote = {
  projectType: 'Locuință individuală',
  location: 'București',
  surface: '150',
  stage: 'Planificare',
  services: ['Structură', 'Instalații'],
  budget: 'De stabilit',
  name: 'Solicitant Test',
  email: 'solicitant@example.com',
  phone: '+40 700 000 000',
  message: 'Detalii de test.\nFără trimitere reală.',
  summary: 'Rezumatul proiectului verificat în formular.',
  website: '',
};

async function startFixture(t, overrides = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'greentech-server-test-'));
  const distDir = path.join(root, 'dist');
  await mkdir(path.join(distDir, 'assets'), { recursive: true });
  await Promise.all([
    writeFile(path.join(distDir, 'index.html'), '<!doctype html><title>Fixture Green Tech</title>'),
    writeFile(path.join(distDir, 'assets', 'main-test.js'), 'console.log("fixture");'),
    writeFile(path.join(distDir, 'assets', 'main-test.css'), 'body { color: green; }'),
    writeFile(path.join(distDir, 'scene.glb'), Buffer.from('0123456789abcdef')),
    writeFile(path.join(distDir, 'decoder.wasm'), Buffer.from([0, 97, 115, 109])),
    // Dummy sentinels only; tests never open the project's real environment file.
    writeFile(path.join(distDir, '.env'), 'PRIVATE_FIXTURE_SENTINEL'),
    writeFile(path.join(root, 'server.js'), 'PRIVATE_SERVER_SENTINEL'),
  ]);
  const sent = [];
  const app = createApp({
    distDir,
    mailer: { async sendQuote(quote) { sent.push(quote); } },
    rateLimit: 100,
    globalLimit: 100,
    ...overrides,
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    const closed = new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    server.closeAllConnections();
    await closed;
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('greentech-server-test-'));
    await rm(root, { recursive: true, force: true });
  });
  const post = (body = validQuote, headers = {}) => fetch(`${url}/api/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { url, sent, post };
}

test('serves the built homepage, deep routes, script and 3D assets with range support', async t => {
  const { url } = await startFixture(t);
  for (const route of ['/', '/pagina-proiect']) {
    const response = await fetch(`${url}${route}`, { headers: { Accept: 'text/html' } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(response.headers.get('cache-control'), 'no-cache');
    assert.match(await response.text(), /Fixture Green Tech/);
  }
  const script = await fetch(`${url}/assets/main-test.js`);
  assert.equal(script.status, 200);
  assert.match(script.headers.get('content-type'), /javascript/);
  assert.match(script.headers.get('cache-control'), /immutable/);
  assert.equal(script.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(script.headers.get('x-powered-by'), null);
  const style = await fetch(`${url}/assets/main-test.css`);
  assert.match(style.headers.get('content-type'), /text\/css/);
  const wasm = await fetch(`${url}/decoder.wasm`);
  assert.match(wasm.headers.get('content-type'), /application\/wasm/);
  const model = await fetch(`${url}/scene.glb`, { headers: { Range: 'bytes=3-7' } });
  assert.equal(model.status, 206);
  assert.match(model.headers.get('content-type'), /model\/gltf-binary|application\/octet-stream/);
  assert.equal(model.headers.get('content-range'), 'bytes 3-7/16');
  assert.equal(await model.text(), '34567');
});

test('unknown assets and API paths do not return a successful SPA or expose private files', async t => {
  const { url } = await startFixture(t);
  for (const route of ['/assets/missing.js', '/missing.glb', '/.env', '/server.js', '/%2eenv', '/%2e%2e/server.js']) {
    const response = await fetch(`${url}${route}`);
    assert.ok([403, 404].includes(response.status), `${route}: ${response.status}`);
    const body = await response.text();
    assert.doesNotMatch(body, /PRIVATE_.*_SENTINEL|Fixture Green Tech/);
  }
  const missingApi = await fetch(`${url}/api/missing`);
  assert.equal(missingApi.status, 404);
  assert.equal((await missingApi.json()).ok, false);
  const health = await fetch(`${url}/api/health`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await health.json(), { ok: true, service: 'greentech-web', emailConfigured: true });
});

test('a valid quote is delivered exactly once and only normalized validated fields reach the mailer', async t => {
  const { url, post, sent } = await startFixture(t);
  const response = await post({ ...validQuote, name: '  Solicitant Test  ', services: ['Structură', 'Structură', 'Instalații'] }, { Origin: url });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0], validQuote);
});

test('malformed, missing, oversized and injected fields never trigger mail delivery', async t => {
  const { post, sent } = await startFixture(t);
  const invalidBodies = [
    '{invalid json',
    null,
    [],
    {},
    { ...validQuote, email: '' },
    { ...validQuote, email: 'invalid-address' },
    { ...validQuote, email: 'sender@example.com\r\nBcc: extra@example.com' },
    { ...validQuote, name: 'Solicitant\nBcc: extra@example.com' },
    { ...validQuote, email: `${'a'.repeat(250)}@example.com` },
    { ...validQuote, message: 'x'.repeat(4001) },
    { ...validQuote, surface: '-5' },
    { ...validQuote, services: 'Structură' },
    { ...validQuote, services: ['Structură\r\nBcc: extra@example.com'] },
    { ...validQuote, website: 'https://spam.example.com' },
    ...['to', 'from', 'cc', 'bcc', 'replyTo', 'attachments', 'smtp'].map(key => ({ ...validQuote, [key]: 'override@example.com' })),
  ];
  for (const body of invalidBodies) {
    const response = await post(body);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).ok, false);
  }
  const tooLarge = await post({ ...validQuote, message: 'x'.repeat(70000) });
  assert.equal(tooLarge.status, 413);
  assert.equal((await tooLarge.json()).ok, false);
  const wrongType = await post('name=test', { 'Content-Type': 'application/x-www-form-urlencoded' });
  assert.equal(wrongType.status, 415);
  assert.equal(sent.length, 0);
});

test('rejects cross-site requests while permitting an explicitly configured public origin', async t => {
  const { post, sent } = await startFixture(t, { publicOrigin: 'https://greentech.example.com' });
  for (const headers of [{ Origin: 'https://malicious.example.com' }, { 'Sec-Fetch-Site': 'cross-site' }, { Origin: 'null' }]) {
    const response = await post(validQuote, headers);
    assert.equal(response.status, 403);
    assert.equal((await response.json()).ok, false);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  assert.equal(sent.length, 0);
  assert.equal((await post(validQuote, { Origin: 'https://greentech.example.com' })).status, 200);
  assert.equal(sent.length, 1);
});

test('enforces the per-client request limit and does not trust a spoofed forwarded address', async t => {
  const { post, sent } = await startFixture(t, { rateLimit: 2 });
  assert.equal((await post()).status, 200);
  assert.equal((await post()).status, 200);
  const limited = await post(validQuote, { 'X-Forwarded-For': '192.0.2.100' });
  assert.equal(limited.status, 429);
  assert.equal((await limited.json()).ok, false);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
  assert.equal(sent.length, 2);
});

test('enforces the global request limit separately from the per-client limit', async t => {
  const { post, sent } = await startFixture(t, { rateLimit: 100, globalLimit: 1 });
  assert.equal((await post()).status, 200);
  assert.equal((await post()).status, 429);
  assert.equal(sent.length, 1);
});

test('waits for mailer confirmation before returning success', async t => {
  let confirmDelivery;
  let markStarted;
  const started = new Promise(resolve => { markStarted = resolve; });
  const delivery = new Promise(resolve => { confirmDelivery = resolve; });
  const { post } = await startFixture(t, { mailer: { sendQuote() { markStarted(); return delivery; } } });
  let responseReturned = false;
  const pendingResponse = post().then(response => { responseReturned = true; return response; });
  await started;
  assert.equal(responseReturned, false);
  confirmDelivery();
  const response = await pendingResponse;
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
});

test('bounds concurrent mail deliveries without dispatching excess requests', async t => {
  const pending = [];
  let markTwoStarted;
  const twoStarted = new Promise(resolve => { markTwoStarted = resolve; });
  const { post } = await startFixture(t, {
    mailer: { sendQuote() {
      return new Promise(resolve => {
        pending.push(resolve);
        if (pending.length === 2) markTwoStarted();
      });
    } },
  });
  const first = post();
  const second = post();
  await twoStarted;
  const busy = await post();
  assert.equal(busy.status, 503);
  assert.equal((await busy.json()).ok, false);
  assert.equal(pending.length, 2);
  pending.forEach(resolve => resolve());
  assert.equal((await first).status, 200);
  assert.equal((await second).status, 200);
});

test('upstream failure returns a safe 502 with no false success or leaked SMTP response', async t => {
  const errors = [];
  t.mock.method(console, 'error', (...parts) => { errors.push(parts.join(' ')); });
  const { post } = await startFixture(t, {
    mailer: { async sendQuote() { throw Object.assign(new Error('SMTP private password=FAKE_SECRET_SENTINEL'), { code: 'EAUTH', response: 'FAKE_SECRET_SENTINEL' }); } },
  });
  const response = await post();
  assert.equal(response.status, 502);
  const body = await response.text();
  assert.equal(JSON.parse(body).ok, false);
  assert.doesNotMatch(body, /FAKE_SECRET_SENTINEL|password|stack|EAUTH/);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /EAUTH/);
  assert.doesNotMatch(errors[0], /FAKE_SECRET_SENTINEL|password/);
});
