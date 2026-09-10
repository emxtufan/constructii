// A small bridge between the original scene lifecycle and the React loading UI.
// Progress comes from resource bytes; completion still waits for a rendered frame.
export function sceneLoadingCancelled() {
  return typeof window !== 'undefined' && window.__greenTechLoadingCancelled === true;
}

export function reportSceneLoading(detail) {
  if (typeof window === 'undefined' || sceneLoadingCancelled()) return;
  window.dispatchEvent(new CustomEvent('greentech:scene-loading', { detail }));
}

export async function readTrackedResponse(response, onProgress) {
  const total = Number(response.headers.get('Content-Length')) || 0;
  if (!response.body?.getReader) {
    const buffer = await response.arrayBuffer();
    onProgress(buffer.byteLength, buffer.byteLength);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress(loaded, total);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  onProgress(loaded, loaded);
  return bytes.buffer;
}

export function waitForSceneReveal(events, onReveal, onCancel = () => {}) {
  let cancelled = sceneLoadingCancelled();
  let cancelHandled = false;
  let listening = false;
  const stopListening = () => {
    if (!listening) return;
    listening = false;
    events.off('renderedReady', ready);
  };
  const cleanup = () => {
    stopListening();
    window.removeEventListener('greentech:loading-continue', cancel);
  };
  const cancel = () => {
    if (cancelHandled) return;
    cancelHandled = true;
    cancelled = true;
    cleanup();
    onCancel();
  };
  const ready = () => {
    stopListening();
    reportSceneLoading({ phase: 'ready', progress: 100 });
    Promise.resolve(window.__greenTechPageReady).then(pageReady => {
      if (cancelled || sceneLoadingCancelled() || window.__greenTechLoadingFailed || pageReady === false) {
        cancel();
        return;
      }
      cleanup();
      onReveal();
    }, cancel);
  };

  if (cancelled) {
    onCancel();
    return cleanup;
  }
  events.on('renderedReady', ready);
  listening = true;
  window.addEventListener('greentech:loading-continue', cancel);
  return cancel;
}
