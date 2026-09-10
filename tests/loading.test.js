import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { loadingPercentage } from '../src/lib/site-loading.js';
import { readTrackedResponse, reportSceneLoading, waitForSceneReveal } from '../public/_astro/greentech-loading.js';

const completeTasks = {
  documentReady: true,
  fontsReady: true,
  imagesDone: 3,
  imagesTotal: 3,
  sceneProgress: 100,
  sceneReady: true,
  sceneEnabled: true,
};

const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function sceneEvents() {
  const listeners = new Map();
  return {
    on(name, callback) { listeners.set(name, callback); },
    off(name, callback) {
      assert.equal(listeners.get(name), callback, 'remove only the registered listener');
      listeners.delete(name);
    },
    emit(name) { listeners.get(name)?.(); },
    count() { return listeners.size; },
  };
}

function streamedResponse(headers = {}) {
  const chunks = [new Uint8Array([1, 2]), new Uint8Array([3, 4, 5])];
  return new Response(new ReadableStream({
    pull(controller) {
      if (chunks.length) controller.enqueue(chunks.shift());
      else controller.close();
    },
  }), { headers });
}

describe('loading progress', () => {
  it('reserves 100% for the document, fonts, images and rendered scene', () => {
    for (const pending of [
      { documentReady: false },
      { fontsReady: false },
      { imagesDone: 2 },
      { sceneReady: false },
    ]) {
      const progress = loadingPercentage({ ...completeTasks, ...pending });
      assert.ok(progress >= 0 && progress < 100, JSON.stringify(pending));
    }
    assert.equal(loadingPercentage(completeTasks), 100);
  });

  it('finishes without a scene on HTTP only when page resources are ready', () => {
    const tasks = { ...completeTasks, sceneEnabled: false, sceneReady: false, sceneProgress: 0 };
    assert.equal(loadingPercentage(tasks), 100);
    assert.ok(loadingPercentage({ ...tasks, imagesDone: 2 }) < 100);
    assert.ok(loadingPercentage({ ...tasks, fontsReady: false }) < 100);
    assert.ok(loadingPercentage({ ...tasks, documentReady: false }) < 100);
  });

  it('handles a page with no images without division by zero', () => {
    const tasks = { ...completeTasks, imagesDone: 0, imagesTotal: 0 };
    assert.equal(loadingPercentage(tasks), 100);
    assert.ok(Number.isFinite(loadingPercentage({ ...tasks, sceneReady: false })));
  });
});

describe('tracked scene downloads', () => {
  it('reports actual received bytes and reconstructs a response with Content-Length', async () => {
    const progress = [];
    const response = streamedResponse({ 'Content-Length': '5' });
    const buffer = await readTrackedResponse(response, (loaded, total) => progress.push({ loaded, total }));
    assert.deepEqual([...new Uint8Array(buffer)], [1, 2, 3, 4, 5]);
    assert.deepEqual(progress[0], { loaded: 2, total: 5 });
    assert.deepEqual(progress.at(-1), { loaded: 5, total: 5 });
    assert.ok(progress.every((entry, index) => !index || entry.loaded >= progress[index - 1].loaded));
    assert.equal(response.body.locked, false);
  });

  it('keeps an unknown byte total unknown until the stream actually completes', async () => {
    const progress = [];
    const buffer = await readTrackedResponse(streamedResponse(), (loaded, total) => progress.push({ loaded, total }));
    assert.equal(buffer.byteLength, 5);
    assert.deepEqual(progress[0], { loaded: 2, total: 0 });
    assert.deepEqual(progress.at(-1), { loaded: 5, total: 5 });
  });

  it('propagates an interrupted download instead of reporting completion', async () => {
    const response = new Response(new ReadableStream({
      start(controller) { controller.error(new Error('Connection interrupted')); },
    }));
    const progress = [];
    await assert.rejects(readTrackedResponse(response, (...bytes) => progress.push(bytes)), /Connection interrupted/);
    assert.equal(progress.length, 0);
    assert.equal(response.body.locked, false);
  });
});

describe('scene and page readiness', () => {
  let originalWindow;
  beforeEach(() => {
    originalWindow = globalThis.window;
    globalThis.window = new EventTarget();
  });
  afterEach(() => {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  });

  it('reveals only after both a rendered scene and decoded page resources', async () => {
    const page = deferred();
    window.__greenTechPageReady = page.promise;
    const events = sceneEvents();
    const notifications = [];
    window.addEventListener('greentech:scene-loading', event => notifications.push(event.detail));
    let revealed = 0;
    waitForSceneReveal(events, () => { revealed += 1; });
    events.emit('renderedReady');
    await flush();
    assert.equal(revealed, 0);
    assert.deepEqual(notifications.at(-1), { phase: 'ready', progress: 100 });
    page.resolve(true);
    await flush();
    assert.equal(revealed, 1);
    assert.equal(events.count(), 0);
    events.emit('renderedReady');
    assert.equal(revealed, 1);
  });

  for (const outcome of ['false', 'rejected']) {
    it(`keeps the intro closed when page readiness is ${outcome}`, async () => {
      const page = deferred();
      window.__greenTechPageReady = page.promise;
      const events = sceneEvents();
      let revealed = 0;
      let cancelled = 0;
      waitForSceneReveal(events, () => { revealed += 1; }, () => { cancelled += 1; });
      events.emit('renderedReady');
      if (outcome === 'false') page.resolve(false);
      else page.reject(new Error('Image decoding failed'));
      await flush();
      assert.equal(revealed, 0);
      assert.ok(cancelled > 0);
      assert.equal(events.count(), 0);
    });
  }

  it('does not run a late intro after the visitor continues without the scene', async () => {
    const page = deferred();
    window.__greenTechPageReady = page.promise;
    const events = sceneEvents();
    let revealed = 0;
    let cancelled = 0;
    waitForSceneReveal(events, () => { revealed += 1; }, () => { cancelled += 1; });
    events.emit('renderedReady');
    window.__greenTechLoadingCancelled = true;
    window.dispatchEvent(new Event('greentech:loading-continue'));
    page.resolve(true);
    await flush();
    assert.equal(revealed, 0);
    assert.equal(cancelled, 1, 'the continue event and late page result cancel only once');
    assert.equal(events.count(), 0);
  });

  it('honors a failure occurring after the page promise has already resolved', async () => {
    window.__greenTechPageReady = Promise.resolve(true);
    const events = sceneEvents();
    let revealed = 0;
    let cancelled = 0;
    waitForSceneReveal(events, () => { revealed += 1; }, () => { cancelled += 1; });
    // For example, the renderer times out after all images have finished.
    window.__greenTechLoadingFailed = true;
    events.emit('renderedReady');
    await flush();
    assert.equal(revealed, 0);
    assert.ok(cancelled > 0);
    assert.equal(events.count(), 0);
  });

  it('does not forward scene progress after cancellation', () => {
    const notifications = [];
    window.addEventListener('greentech:scene-loading', event => notifications.push(event.detail));
    window.__greenTechLoadingCancelled = true;
    reportSceneLoading({ phase: 'ready', progress: 100 });
    assert.equal(notifications.length, 0);
  });
});
