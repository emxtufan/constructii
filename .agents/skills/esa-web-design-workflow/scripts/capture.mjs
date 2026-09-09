#!/usr/bin/env node
/** Capture evidence from an already-running, controlled web preview. No installs. */
import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const TIMEOUT = 15_000;
const FONT_TIMEOUT = 5_000;
const NOFOLLOW = constants.O_NOFOLLOW || 0;
const HELP = `Usage:
  node capture.mjs --project /absolute/project --run RUN_ID \\
    --base-url http://127.0.0.1:PORT [--allow-remote]

Requires qa/plan.json and qa/runs/RUN_ID/source.json from workflow.py.
Creates only NEW qa/runs/RUN_ID/captures/ and captures.json; evidence is
never overwritten. Use a new run ID to repeat a capture.

Uses installed playwright (or playwright-core) from project/package.json
resolution or CODEX_PRIMARY_RUNTIME_NODE_MODULES. Does not install packages,
download browsers, start servers, or run a network test suite.

Only localhost, 127.0.0.1, and [::1] base URLs are accepted by default.
--allow-remote explicitly permits another base host. Routes and navigations
must stay on the base origin. Static assets may load from other origins.

SAFETY: Use only a controlled preview with mocked integrations and no real
submissions. Non-GET/HEAD HTTP requests are blocked, but GET requests and
click/press actions can still have side effects. Do not target production.

Plan: {"cases":[{"id":"home-mobile","route":"/","width":390,
  "height":844,"reduced_motion":true,"ready_selector":"main",
  "actions":[{"type":"click","selector":"button.menu"},
    {"type":"press","selector":"body","key":"Escape"},
    {"type":"scroll","selector":"#details"}],
  "sections":[{"id":"hero","selector":"#hero"}]}]}

IDs: lowercase letters/digits/hyphens, starting with a letter/digit, max 64.
Case IDs and section IDs within each case must be unique. Section ID 'page'
is reserved. Width: integer 240..7680; height: integer 200..4320.
Defaults: reduced_motion=true, ready_selector='body', actions=[], sections=[].
Only click, press (with key), and scroll-to-selector actions are supported.
Each action/section selector must match exactly one visible element.
Full-page and section screenshots disable animations. Readiness, fonts,
scroll-reveal discovery, and screenshots all have bounded waits.

CAPTURED means screenshots were taken, NOT that a visual audit passed.
Console errors, failed/HTTP-error requests, broken images, and horizontal
overflow are observations, not a comprehensive error or accessibility audit.
Exit: 0 for all CAPTURED; 1 for any ERROR or setup/validation failure.
`;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function errorText(error) {
  return String(error?.message || error).slice(0, 8_000);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireText(value, label, max = 1_000) {
  check(typeof value === 'string' && value.trim().length > 0 && value.length <= max,
    `${label} must be a nonempty string of at most ${max} characters.`);
  return value;
}

function requireId(value, label) {
  check(typeof value === 'string' && ID.test(value),
    `${label} must match [a-z0-9][a-z0-9-]* and be at most 64 characters.`);
  return value;
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--help' || flag === '-h') return { help: true };
    check(['--project', '--run', '--base-url', '--allow-remote'].includes(flag),
      `Unknown argument: ${flag}. Use --help.`);
    check(!(flag in options), `Duplicate argument: ${flag}.`);
    if (flag === '--allow-remote') options[flag] = true;
    else {
      check(i + 1 < argv.length && !argv[i + 1].startsWith('--'), `Missing value for ${flag}.`);
      options[flag] = argv[++i];
    }
  }
  for (const flag of ['--project', '--run', '--base-url']) {
    check(options[flag], `Missing ${flag}. Use --help.`);
  }
  check(path.isAbsolute(options['--project']), '--project must be an absolute directory path.');
  requireId(options['--run'], 'Run ID');
  const base = new URL(options['--base-url']);
  check(['http:', 'https:'].includes(base.protocol), '--base-url must use HTTP or HTTPS.');
  check(!base.username && !base.password, '--base-url must not contain credentials.');
  check(!base.search && !base.hash, '--base-url must not contain a query or fragment.');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname.toLowerCase());
  check(local || options['--allow-remote'], 'Remote base URL refused. Use --allow-remote only for a controlled preview.');
  return {
    project: path.resolve(options['--project']), run: options['--run'], base,
    remote: !local,
  };
}

// Refuse symlinks in the managed QA tree, including symlinks that currently
// point inside it. Exclusive, no-follow writes also protect evidence filenames.
async function assertManagedPath(project, target, expected = null) {
  const relative = path.relative(project, target);
  check(relative && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative),
    `Path is outside the project: ${target}`);
  const parts = relative.split(path.sep);
  let cursor = project;
  for (let i = 0; i < parts.length; i += 1) {
    cursor = path.join(cursor, parts[i]);
    const stat = await fs.lstat(cursor);
    check(!stat.isSymbolicLink(), `Symlink refused in QA path: ${cursor}`);
    if (i < parts.length - 1 || expected === 'directory') {
      check(stat.isDirectory(), `Expected a directory: ${cursor}`);
    } else if (expected === 'file') check(stat.isFile(), `Expected a regular file: ${cursor}`);
  }
}

async function readManagedFile(project, filename) {
  await assertManagedPath(project, filename, 'file');
  const handle = await fs.open(filename, constants.O_RDONLY | NOFOLLOW);
  try {
    check((await handle.stat()).isFile(), `Expected a regular file: ${filename}`);
    return await handle.readFile();
  } finally {
    await handle.close();
  }
}

async function mustNotExist(filename) {
  try {
    await fs.lstat(filename);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  throw new Error(`Evidence already exists; refusing to overwrite: ${filename}. Create a new run.`);
}

function validatePlan(raw, base) {
  check(isObject(raw) && Array.isArray(raw.cases) && raw.cases.length > 0 && raw.cases.length <= 128,
    'qa/plan.json must contain a cases array with 1..128 entries.');
  const seen = new Set();
  return raw.cases.map((entry, index) => {
    const label = `cases[${index}]`;
    check(isObject(entry), `${label} must be an object.`);
    const id = requireId(entry.id, `${label}.id`);
    check(!seen.has(id), `Duplicate case ID: ${id}`);
    seen.add(id);
    const route = requireText(entry.route, `${label}.route`, 4_096);
    const url = new URL(route, base);
    check(url.origin === base.origin && !url.username && !url.password,
      `${label}.route must remain on the base origin and must not contain credentials.`);
    check(Number.isInteger(entry.width) && entry.width >= 240 && entry.width <= 7_680,
      `${label}.width must be an integer from 240 to 7680.`);
    check(Number.isInteger(entry.height) && entry.height >= 200 && entry.height <= 4_320,
      `${label}.height must be an integer from 200 to 4320.`);
    const reducedMotion = entry.reduced_motion === undefined ? true : entry.reduced_motion;
    check(typeof reducedMotion === 'boolean', `${label}.reduced_motion must be a boolean.`);
    const readySelector = requireText(entry.ready_selector === undefined ? 'body' : entry.ready_selector, `${label}.ready_selector`);
    const actions = entry.actions === undefined ? [] : entry.actions;
    check(Array.isArray(actions) && actions.length <= 64, `${label}.actions must be an array with at most 64 entries.`);
    for (const [i, action] of actions.entries()) {
      const actionLabel = `${label}.actions[${i}]`;
      check(isObject(action), `${actionLabel} must be an object.`);
      check(['click', 'press', 'scroll'].includes(action.type), `${actionLabel}: unsupported action type.`);
      requireText(action.selector, `${actionLabel}.selector`);
      const allowed = new Set(['type', 'selector', ...(action.type === 'press' ? ['key'] : [])]);
      check(Object.keys(action).every((key) => allowed.has(key)), `${actionLabel}: unknown action property.`);
      if (action.type === 'press') requireText(action.key, `${actionLabel}.key`, 100);
    }
    const sections = entry.sections === undefined ? [] : entry.sections;
    check(Array.isArray(sections) && sections.length <= 64, `${label}.sections must be an array with at most 64 entries.`);
    const sectionIds = new Set(['page']);
    for (const [i, section] of sections.entries()) {
      check(isObject(section), `${label}.sections[${i}] must be an object.`);
      requireId(section.id, `${label}.sections[${i}].id`);
      check(!sectionIds.has(section.id), `${label}: duplicate/reserved section ID '${section.id}'.`);
      sectionIds.add(section.id);
      requireText(section.selector, `${label}.sections[${i}].selector`);
    }
    return { id, route, url: url.href, width: entry.width, height: entry.height,
      reduced_motion: reducedMotion, ready_selector: readySelector, actions, sections };
  });
}

function loadPlaywright(project) {
  const resolvers = [createRequire(path.join(project, 'package.json'))];
  const runtimeModules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  if (runtimeModules && path.isAbsolute(runtimeModules)) {
    resolvers.push(createRequire(path.join(runtimeModules, '.capture-loader.cjs')));
  }
  const failures = [];
  for (const resolver of resolvers) {
    for (const name of ['playwright', 'playwright-core']) {
      try {
        const library = resolver(name);
        if (library.chromium?.launch) return library;
        failures.push(`${name}: missing chromium.launch`);
      } catch (error) {
        failures.push(`${name}: ${error.code || errorText(error)}`);
      }
    }
  }
  throw new Error(`No usable installed Playwright found. Configure the project's dependencies or ` +
    `CODEX_PRIMARY_RUNTIME_NODE_MODULES; this helper does not install anything. ${failures.join('; ')}`);
}

function resultFor(entry) {
  return {
    id: entry.id, route: entry.route, width: entry.width, height: entry.height,
    reduced_motion: entry.reduced_motion, status: 'ERROR', screenshots: [],
    observations: { horizontal_overflow: false, console_errors: [], failed_requests: [], broken_images: [] },
    error: null,
  };
}

function observe(array, value) {
  // Bound noisy previews without implying this is an exhaustive log collector.
  if (array.length < 200) array.push(value);
}

async function waitForFonts(page) {
  const ready = await page.evaluate(async (timeout) => {
    if (!document.fonts) return true;
    let timer;
    try {
      return await Promise.race([
        document.fonts.ready.then(() => true),
        new Promise((resolve) => { timer = setTimeout(() => resolve(false), timeout); }),
      ]);
    } finally { clearTimeout(timer); }
  }, FONT_TIMEOUT);
  check(ready, `Fonts did not become ready within ${FONT_TIMEOUT} ms.`);
}

async function revealPage(page) {
  // Sequential viewport-sized steps trigger typical IntersectionObserver and
  // lazy-image reveals. A hard iteration cap catches infinite-scroll previews.
  for (let i = 0; i < 64; i += 1) {
    const state = await page.evaluate(() => {
      const root = document.scrollingElement || document.documentElement;
      const bottom = root.scrollHeight - innerHeight;
      const next = Math.min(bottom, scrollY + Math.max(200, Math.floor(innerHeight * 0.8)));
      const atBottom = scrollY >= bottom - 2;
      if (!atBottom) window.scrollTo({ top: next, behavior: 'instant' });
      return { atBottom };
    });
    await page.waitForTimeout(80);
    if (state.atBottom) {
      // Give a bottom sentinel one more opportunity to append lazy content.
      const settled = await page.evaluate(() =>
        scrollY >= (document.scrollingElement || document.documentElement).scrollHeight - innerHeight - 2);
      if (settled) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(100);
        return;
      }
    }
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  throw new Error('Reveal scrolling exceeded 64 bounded steps. Use a shorter controlled route; infinite scrolling is unsupported.');
}

async function uniqueVisible(page, selector, label) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: TIMEOUT });
  check(await locator.count() === 1, `${label} selector must match exactly one element: ${selector}`);
  return locator;
}

async function saveScreenshot(project, caseDirectory, result, section, bytes) {
  await assertManagedPath(project, caseDirectory, 'directory');
  const filename = path.join(caseDirectory, `${section}.png`);
  const handle = await fs.open(filename, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | NOFOLLOW, 0o600);
  try { await handle.writeFile(bytes); } finally { await handle.close(); }
  result.screenshots.push({
    path: path.relative(project, filename).split(path.sep).join('/'),
    sha256: createHash('sha256').update(bytes).digest('hex'), section,
  });
}

async function captureCase(browser, project, capturesDirectory, entry, base) {
  const result = resultFor(entry);
  let context;
  let safetyFailure = null;
  try {
    await assertManagedPath(project, capturesDirectory, 'directory');
    const caseDirectory = path.join(capturesDirectory, entry.id);
    await fs.mkdir(caseDirectory, { mode: 0o700 });
    context = await browser.newContext({
      viewport: { width: entry.width, height: entry.height },
      reducedMotion: entry.reduced_motion ? 'reduce' : 'no-preference',
      serviceWorkers: 'block', acceptDownloads: false,
    });
    context.setDefaultTimeout(TIMEOUT);
    context.setDefaultNavigationTimeout(TIMEOUT);
    await context.route('**/*', async (route) => {
      const request = route.request();
      let reason = null;
      if (/^https?:/.test(request.url()) && !['GET', 'HEAD'].includes(request.method())) {
        reason = `Blocked ${request.method()} request. Use mocked integrations; real submissions are unsupported.`;
      } else if (request.isNavigationRequest() && new URL(request.url()).origin !== base.origin) {
        reason = `Blocked navigation outside the base origin: ${request.url()}`;
      }
      if (reason) {
        safetyFailure ||= reason;
        observe(result.observations.failed_requests, { url: request.url(), method: request.method(), error: reason });
        await route.abort('blockedbyclient');
      } else await route.continue();
    });
    const page = await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error') observe(result.observations.console_errors, {
        type: 'console', message: message.text(), location: message.location(),
      });
    });
    page.on('pageerror', (error) => observe(result.observations.console_errors, { type: 'pageerror', message: errorText(error) }));
    page.on('requestfailed', (request) => observe(result.observations.failed_requests, {
      url: request.url(), method: request.method(), error: request.failure()?.errorText || 'Request failed',
    }));
    page.on('response', (response) => {
      if (response.status() >= 400) observe(result.observations.failed_requests, {
        url: response.url(), method: response.request().method(), status: response.status(),
        error: `HTTP ${response.status()}`,
      });
    });
    page.on('popup', (popup) => {
      safetyFailure ||= 'An action opened a popup. Popup capture is unsupported; use a same-page controlled preview.';
      popup.close().catch(() => {});
    });
    page.on('dialog', (dialog) => {
      safetyFailure ||= `Unexpected ${dialog.type()} dialog; dismissed without accepting.`;
      dialog.dismiss().catch(() => {});
    });
    await page.goto(entry.url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    await uniqueVisible(page, entry.ready_selector, 'Readiness');
    await waitForFonts(page);
    await revealPage(page);
    await waitForFonts(page);
    for (const [index, action] of entry.actions.entries()) {
      check(!safetyFailure, safetyFailure);
      const locator = await uniqueVisible(page, action.selector, `Action ${index + 1}`);
      if (action.type === 'click') await locator.click();
      else if (action.type === 'press') await locator.press(action.key);
      else await locator.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      check(new URL(page.url()).origin === base.origin, 'An action left the base origin.');
      check(!safetyFailure, safetyFailure);
    }
    await waitForFonts(page);
    check(!safetyFailure, safetyFailure);
    const dimensions = await page.evaluate(() => ({
      width: Math.max(document.documentElement.scrollWidth, innerWidth),
      height: Math.max((document.scrollingElement || document.documentElement).scrollHeight, innerHeight),
    }));
    check(dimensions.height <= 100_000 && dimensions.width * dimensions.height <= 60_000_000,
      'Full-page capture exceeds the bounded size limit (100000 px height / 60 megapixels). Use a shorter route.');
    await saveScreenshot(project, caseDirectory, result, 'page',
      await page.screenshot({ fullPage: true, animations: 'disabled', timeout: TIMEOUT }));
    for (const section of entry.sections) {
      const locator = await uniqueVisible(page, section.selector, `Section '${section.id}'`);
      await saveScreenshot(project, caseDirectory, result, section.id,
        await locator.screenshot({ animations: 'disabled', timeout: TIMEOUT }));
    }
    const domObservations = await page.evaluate(() => ({
      horizontal_overflow: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0)
        > document.documentElement.clientWidth + 1,
      broken_images: Array.from(document.images)
        .filter((img) => Boolean(img.currentSrc || img.getAttribute('src')) && img.naturalWidth === 0)
        .slice(0, 200)
        .map((img) => ({ url: img.currentSrc || img.src, complete: img.complete })),
    }));
    Object.assign(result.observations, domObservations);
    check(!safetyFailure, safetyFailure);
    result.status = 'CAPTURED';
  } catch (error) {
    result.error = safetyFailure || errorText(error);
  } finally {
    if (context) {
      try { await context.close(); }
      catch (error) { result.status = 'ERROR'; result.error ||= `Browser context close failed: ${errorText(error)}`; }
    }
  }
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) { console.log(HELP); return; }
  const project = await fs.realpath(options.project);
  check((await fs.stat(project)).isDirectory(), '--project must identify a directory.');
  const runDirectory = path.join(project, 'qa', 'runs', options.run);
  const sourceFile = path.join(runDirectory, 'source.json');
  const capturesDirectory = path.join(runDirectory, 'captures');
  const manifestFile = path.join(runDirectory, 'captures.json');
  const planBytes = await readManagedFile(project, path.join(project, 'qa', 'plan.json'));
  let plan;
  try { plan = validatePlan(JSON.parse(planBytes.toString('utf8')), options.base); }
  catch (error) { throw new Error(`Invalid qa/plan.json: ${errorText(error)}`); }
  const sourceBefore = await readManagedFile(project, sourceFile);
  try { check(isObject(JSON.parse(sourceBefore.toString('utf8'))), 'Expected an object.'); }
  catch (error) { throw new Error(`Invalid source.json: ${errorText(error)}`); }
  await mustNotExist(capturesDirectory);
  await mustNotExist(manifestFile);
  console.warn('Safety: capture only a controlled preview with mocked integrations and no real submissions. GET requests can have side effects.');
  if (options.remote) console.warn(`WARNING: --allow-remote permits capture of ${options.base.origin}. Confirm this is a controlled preview, not production.`);
  await assertManagedPath(project, runDirectory, 'directory');
  await fs.mkdir(capturesDirectory, { mode: 0o700 });
  await assertManagedPath(project, runDirectory, 'directory');
  const manifestHandle = await fs.open(manifestFile,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | NOFOLLOW, 0o600);
  const manifest = { schema_version: 1, run: options.run, cases: [] };
  let browser;
  try {
    try {
      const playwright = loadPlaywright(project);
      browser = await playwright.chromium.launch({ headless: true });
      for (const entry of plan) {
        const result = await captureCase(browser, project, capturesDirectory, entry, options.base);
        manifest.cases.push(result);
        console.log(`${result.id}: ${result.status} (${result.screenshots.length} screenshots)${result.error ? ` — ${result.error}` : ''}`);
      }
    } catch (error) {
      const reason = `Capture setup failed: ${errorText(error)}. No packages or browsers were installed.`;
      for (const entry of plan.slice(manifest.cases.length)) {
        manifest.cases.push({ ...resultFor(entry), error: reason });
      }
    } finally {
      if (browser) {
        try { await browser.close(); }
        catch (error) {
          for (const result of manifest.cases) {
            result.status = 'ERROR';
            result.error ||= `Browser close failed: ${errorText(error)}`;
          }
        }
      }
    }
    try {
      const sourceAfter = await readManagedFile(project, sourceFile);
      check(sourceBefore.equals(sourceAfter), 'source.json changed during capture; evidence does not attest to a stable source snapshot.');
    } catch (error) {
      for (const result of manifest.cases) {
        result.status = 'ERROR';
        result.error = [result.error, `Source integrity check failed: ${errorText(error)}`].filter(Boolean).join(' ');
      }
    }
    await assertManagedPath(project, runDirectory, 'directory');
    await manifestHandle.writeFile(`${JSON.stringify(manifest, null, 2)}\n`);
    await manifestHandle.sync();
  } finally {
    await manifestHandle.close();
  }
  const errors = manifest.cases.filter((entry) => entry.status === 'ERROR');
  console.log(`${manifest.cases.length - errors.length}/${manifest.cases.length} cases CAPTURED. ${path.relative(project, manifestFile).split(path.sep).join('/')}`);
  console.log('Screenshots are evidence only; visual review is still required. Observation logs are bounded to 200 entries per category.');
  if (errors.length) {
    for (const result of errors) console.error(`${result.id}: ${result.error}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`capture: ${errorText(error)}`);
  process.exitCode = 1;
});
