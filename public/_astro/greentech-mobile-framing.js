const baseCameraZoom = new WeakMap();

export const PHONE_SCENE_ZOOM = 1.12;

export function phoneSceneZoom({ width, height, isMobileOrTablet, progress = 0 } = {}) {
  // Use the short edge so a phone keeps its framing after orientation changes.
  // Tablets and desktop browsers retain the original camera projection.
  const isPhone = isMobileOrTablet && width > 0 && height > 0
    && Math.min(width, height) <= 600;
  if (!isPhone) return 1;

  // Hold the closer view through the centered worker shot. Restore the original
  // framing as that shot leaves, so the final GREENTECH wordmark still fits.
  const t = Math.max(0, Math.min(1, (progress - .815) / (.9 - .815)));
  const release = t * t * (3 - 2 * t);
  return 1 + (PHONE_SCENE_ZOOM - 1) * (1 - release);
}

export function applyMobileSceneFraming(camera, options) {
  if (!camera) return;
  if (!baseCameraZoom.has(camera)) {
    baseCameraZoom.set(camera, camera.zoom > 0 ? camera.zoom : 1);
  }
  // Always derive from the original zoom; resizing or revisiting a scene cannot
  // accumulate scaling. The camera position and worker target remain untouched.
  const zoom = baseCameraZoom.get(camera) * phoneSceneZoom(options);
  if (Math.abs(camera.zoom - zoom) < 1e-7) return;
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
}
