import {
  a9 as uv,
  a1 as smoothstep,
  o as float,
  J as mix,
} from './vendor.BgqcyBjU.js';

// AO_Bake_Floor still contains the removed arrow in the lower-left of its
// atlas. Neutralize only that isolated footprint; keep the surrounding AO,
// floor lighting, current geometry reflection and animated dots intact.
// Called only for a scene containing the replacement logo_G mesh.
export function clearLegacyArrowAO(ambientOcclusion, texture) {
  const coordinates = uv(texture.channel ?? 0);
  const footprint = smoothstep(0.10, 0.12, coordinates.x)
    .mul(float(1).sub(smoothstep(0.24, 0.26, coordinates.x)))
    .mul(smoothstep(0.87, 0.89, coordinates.y))
    .mul(float(1).sub(smoothstep(0.96, 0.98, coordinates.y)));

  return mix(ambientOcclusion, float(1), footprint);
}
