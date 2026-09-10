// Construction clothing for the featured worker, using the original vertex
// buffers. The supplied GLB and animated geometry stay intact.
export const GREENTECH_WORKER_PALETTE = {
  helmet: '#E3AA22',
  vest: '#D86C24',
  fabric: '#263B40',
  boots: '#242B2C',
  skin: '#B97F58',
  reflective: '#D8D7C6',
};

export function workerClothingNode(part, { attribute, color, float, abs, max, mix, smoothstep }) {
  const palette = Object.fromEntries(
    Object.entries(GREENTECH_WORKER_PALETTE).map(([name, hex]) => [name, color(hex)]),
  );
  if (part === 'hat_helmet' || part === 'hat_cap') return palette.helmet;
  if (part === 'shoes_worker' || part === 'shoes_business') return palette.boots;

  // Raw POSITION stays in bind pose; positionLocal is already deformed by
  // skinning at this point. Using the raw attribute keeps clothes on the body.
  const position = attribute('position', 'vec3');
  const height = position.y;
  const side = abs(position.z);
  const below = (edge, value) => float(1).sub(smoothstep(edge - .004, edge + .004, value));
  const above = (edge, value) => float(1).sub(below(edge, value));
  const band = (low, high, value) => above(low, value).mul(below(high, value));
  const skin = max(above(1.18, height), below(.82, height).mul(above(.335, side)));
  const vest = band(.87, 1.18, height).mul(below(.18, side));
  const stripe = max(band(.94, .972, height), band(.085, .11, side).mul(above(.99, height)));
  const clothing = mix(palette.vest, palette.reflective, stripe);
  return mix(mix(palette.fabric, palette.skin, skin), clothing, vest);
}
