// Only the featured worker changes size; the surrounding city keeps its scale.
export const GREENTECH_HERO_WORKER = {
  type: 'worker_helmet',
  animation: 'cheer',
  position: [24, 1.1, 25.3],
  rotationY: 0,
  scale: 4,
  appearance: 'construction',
  timeOffset: 2.354,
};

export const GREENTECH_UNDERLINE = {
  // The grid is centered at X24 and is 25.1 units wide.
  gridExit: 36.55,
  taperLength: 3,
  radiusScale: .28,
  glowScale: .6,
};

function smoothstep(start, end, value) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function focusWorkerStage(progress, target, lookAt) {
  // The original camera finishes its overhead turn at .785. Hold its target
  // on the worker through .815, then blend back before the final logo frame.
  const weight = smoothstep(.68, .74, progress) * (1 - smoothstep(.815, .9, progress));
  if (weight > 0) {
    const [x, y, z] = GREENTECH_HERO_WORKER.position;
    target.x += (x - target.x) * weight;
    target.y += (y - target.y) * weight;
    // Frame the visible figure, not its feet. A fixed anchor avoids tracking
    // the cheering animation, which would introduce camera jitter.
    target.z += (z - .75 - target.z) * weight;
    lookAt.copy(target);
  }
  return weight;
}
