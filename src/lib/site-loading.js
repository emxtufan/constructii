const subscribers = new Set();
let state = { progress: 0, phase: 'loading', label: 'Se încarcă website-ul', slow: false };
let activeController;

export const getLoadingState = () => state;
export const subscribeLoading = callback => { subscribers.add(callback); return () => subscribers.delete(callback); };
function publish(next) {
  state = { ...state, ...next };
  subscribers.forEach(callback => callback());
}

// Loading work, not elapsed time. Scene bytes dominate the weighting; 100 is
// reserved for decoded page assets and a successfully rendered scene.
export function loadingPercentage({ documentReady, fontsReady, imagesDone, imagesTotal, sceneProgress, sceneReady, sceneEnabled }) {
  const images = imagesTotal ? imagesDone / imagesTotal : 1;
  const raw = sceneEnabled
    ? Number(documentReady) * 10 + Number(fontsReady) * 5 + images * 25 + Math.min(100, Math.max(0, sceneProgress)) * .55 + Number(sceneReady) * 5
    : Number(documentReady) * 20 + Number(fontsReady) * 10 + images * 70;
  const complete = documentReady && fontsReady && imagesDone === imagesTotal && (!sceneEnabled || sceneReady);
  return complete ? 100 : Math.min(99, Math.floor(raw));
}

function staticPage() {
  document.documentElement.classList.add('gt-scene-fallback');
  document.body.style.overflow = '';
  document.querySelector('header')?.classList.add('show');
  document.querySelector('.hero')?.classList.add('show');
  window.__greenTechLenis?.start();
}

export function continueWithoutScene() { activeController?.continue(); }
export function sceneLoadingError() { activeController?.fail('Scena nu a putut fi încărcată. Poți reîncerca sau continua pe site.'); }

export function startSiteLoading({ sceneEnabled, extraImages = [] }) {
  if (activeController) return activeController;
  const tasks = { documentReady: false, fontsReady: false, imagesDone: 0, imagesTotal: 0, sceneProgress: 0, sceneReady: false, sceneEnabled };
  const loader = document.getElementById('loader');
  const abort = new AbortController();
  const background = [...document.querySelectorAll('header, main, footer')].map(element => ({ element, inert: element.inert }));
  background.forEach(({ element }) => { element.inert = true; });
  let finished = false;
  let failed = false;
  let lastProgress = 0;
  let resolvePage;
  const pageReady = new Promise(resolve => { resolvePage = resolve; });
  window.__greenTechPageReady = pageReady;
  window.__greenTechLoadingCancelled = false;
  window.__greenTechLoadingFailed = false;

  function refresh() {
    if (finished || failed) return;
    lastProgress = Math.max(lastProgress, loadingPercentage(tasks));
    if (lastProgress === 100) { clearTimeout(slowTimer); clearTimeout(timeoutTimer); }
    const label = lastProgress === 100 ? 'Pregătit'
      : tasks.sceneEnabled && tasks.sceneProgress >= 100 && !tasks.sceneReady ? 'Pregătim scena'
      : tasks.imagesDone < tasks.imagesTotal ? (sceneEnabled ? 'Se încarcă imaginile și scena' : 'Se încarcă imaginile')
      : !tasks.fontsReady ? 'Se încarcă fonturile'
      : tasks.sceneEnabled ? 'Se încarcă scena 3D' : 'Pregătim pagina';
    publish({ progress: lastProgress, label, phase: lastProgress === 100 ? 'ready' : 'loading' });
  }
  function fail(message) {
    if (finished) return;
    failed = true;
    window.__greenTechLoadingFailed = true;
    publish({ phase: 'error', label: message, slow: true });
  }
  function unlock() {
    if (finished) return;
    finished = true;
    clearTimeout(slowTimer);
    clearTimeout(timeoutTimer);
    observer.disconnect();
    abort.abort();
    window.removeEventListener('greentech:scene-loading', onScene);
    background.forEach(({ element, inert }) => { element.inert = inert; });
    publish({ phase: 'dismissed' });
    window.dispatchEvent(new CustomEvent('greentech:loading-finished'));
  }
  function closeStaticLoader() {
    staticPage();
    loader?.classList.add('hide');
    setTimeout(() => {
      if (loader) loader.style.display = 'none';
      unlock();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
  }
  function onScene(event) {
    if (finished || window.__greenTechLoadingCancelled) return;
    const detail = event.detail || {};
    if (detail.phase === 'error') { fail('La încărcarea scenei a apărut o problemă. Poți reîncerca sau continua pe site.'); return; }
    if (detail.phase === 'assets' || detail.phase === 'preparing') tasks.sceneProgress = Math.max(tasks.sceneProgress, Number(detail.progress) || 0);
    if (detail.phase === 'ready') { tasks.sceneProgress = 100; tasks.sceneReady = true; }
    refresh();
  }
  const observer = new MutationObserver(() => {
    if (!loader?.isConnected || loader.style.display === 'none') unlock();
  });
  if (loader) observer.observe(loader, { attributes: true, attributeFilter: ['style'] });
  window.addEventListener('greentech:scene-loading', onScene);
  const slowTimer = setTimeout(() => { if (!finished) publish({ slow: true }); }, 15000);
  const timeoutTimer = setTimeout(() => fail('Încărcarea durează mai mult decât ne așteptam. Poți reîncerca sau continua pe site.'), 60000);
  activeController = {
    fail,
    continue() {
      if (finished) return;
      window.__greenTechLoadingCancelled = true;
      resolvePage(false);
      window.dispatchEvent(new CustomEvent('greentech:loading-continue'));
      closeStaticLoader();
    },
  };

  const domImages = [...document.images];
  domImages.forEach(img => { img.loading = 'eager'; });
  const urls = new Set(domImages.map(img => img.currentSrc || img.src).filter(Boolean));
  extraImages.filter(Boolean).forEach(url => urls.add(new URL(url, location.href).href));
  tasks.imagesTotal = urls.size;
  function preloadImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      let settled = false;
      const done = success => {
        if (settled) return;
        settled = true;
        image.onload = image.onerror = null;
        abort.signal.removeEventListener('abort', cancelled);
        if (!finished && !window.__greenTechLoadingCancelled) {
          if (success) tasks.imagesDone += 1;
          else fail('O imagine nu a putut fi încărcată. Poți reîncerca sau continua pe site.');
          refresh();
        }
        resolve(success);
      };
      const cancelled = () => done(false);
      abort.signal.addEventListener('abort', cancelled, { once: true });
      image.onload = () => {
        if (image.decode) image.decode().then(() => done(true), () => done(false));
        else done(image.naturalWidth > 0);
      };
      image.onerror = () => done(false);
      image.src = url;
    });
  }
  const imagesReady = Promise.all([...urls].map(preloadImage));
  const documentReady = new Promise(resolve => {
    const cancelled = () => resolve(false);
    const done = () => {
      abort.signal.removeEventListener('abort', cancelled);
      if (finished) { resolve(false); return; }
      tasks.documentReady = true;
      refresh();
      resolve(true);
    };
    if (document.readyState === 'complete') done();
    else {
      abort.signal.addEventListener('abort', cancelled, { once: true });
      window.addEventListener('load', done, { once: true, signal: abort.signal });
    }
  });
  const fontsReady = (document.fonts?.ready || Promise.resolve()).then(() => {
    if (document.fonts && [...document.fonts].some(font => font.status === 'error')) {
      fail('Un font nu a putut fi încărcat. Poți continua cu fonturile disponibile.');
      return false;
    }
    tasks.fontsReady = true;
    refresh();
    return true;
  }, () => { fail('Fonturile nu au putut fi încărcate. Poți continua pe site.'); return false; });
  refresh();
  Promise.all([imagesReady, documentReady, fontsReady]).then(([images, , fonts]) => {
    const ready = images.every(Boolean) && fonts && !failed && !window.__greenTechLoadingCancelled;
    resolvePage(ready);
    if (!ready || finished) return;
    refresh();
    if (!sceneEnabled) requestAnimationFrame(closeStaticLoader);
  });
  return activeController;
}
