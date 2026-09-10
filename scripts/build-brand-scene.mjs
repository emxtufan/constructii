import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { readGlb, encodeGlb, extractLogo, assembleDesktop } from './build-desktop-logo.mjs';
import { copyBuildingScene } from './building-badge.mjs';
import { buildGreentechWordmarkGeometry } from './wordmark-geometry.mjs';

const directory = new URL('../public/glb/', import.meta.url);
const clone = value => structuredClone(value);
const align4 = length => (length + 3) & ~3;

function appendAccessor(asset, array, type, componentType, withBounds = false) {
  const components = { SCALAR: 1, VEC3: 3 }[type];
  assert.equal(array.length % components, 0);
  const offset = align4(asset.bin.length);
  const bin = Buffer.alloc(offset + array.byteLength);
  asset.bin.copy(bin);
  Buffer.from(array.buffer, array.byteOffset, array.byteLength).copy(bin, offset);
  asset.bin = bin;
  const bufferView = asset.json.bufferViews.length;
  asset.json.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: array.byteLength });
  const accessor = { bufferView, componentType, count: array.length / components, type };
  if (withBounds) {
    accessor.min = Array(components).fill(Infinity);
    accessor.max = Array(components).fill(-Infinity);
    for (let i = 0; i < array.length; i++) {
      const axis = i % components;
      accessor.min[axis] = Math.min(accessor.min[axis], array[i]);
      accessor.max[axis] = Math.max(accessor.max[axis], array[i]);
    }
  }
  asset.json.accessors.push(accessor);
  return asset.json.accessors.length - 1;
}

function brandScene(asset, wordmark) {
  const json = asset.json;
  const logoIndex = json.nodes.findIndex(node => node.name === 'logo_G');
  assert.notEqual(logoIndex, -1);
  const gMeshIndex = json.nodes[logoIndex].mesh;
  const gMaterialIndex = json.meshes[gMeshIndex].primitives[0].material;
  const tiles = json.nodes.find(node => node.name === 'tiles');
  assert.ok(tiles.children.includes(logoIndex));

  const position = appendAccessor(asset, wordmark.positions, 'VEC3', 5126, true);
  const normal = appendAccessor(asset, wordmark.normals, 'VEC3', 5126);
  const compact = wordmark.positions.length / 3 < 65536;
  const indices = appendAccessor(asset, compact ? Uint16Array.from(wordmark.indices) : wordmark.indices, 'SCALAR', compact ? 5123 : 5125);
  const mesh = json.meshes.length;
  json.meshes.push({ name: 'GREENTECH_wordmark', primitives: [{ attributes: { POSITION: position, NORMAL: normal }, indices, material: gMaterialIndex, mode: 4 }] });

  // SVG lettering faces upward on the floor, centered on the original logo stage.
  // Keeping the replaced node index preserves every original animation target.
  json.nodes[logoIndex] = {
    name: 'logo_GREENTECH', mesh,
    translation: [3500, -200, -55], rotation: [1, 0, 0, 0], scale: [1600, 1600, 1600],
    extras: { brandWordmark: true, source: 'public/img/greentech-logo.svg' },
  };

  // Exact original G geometry, turned upright by the existing tiles parent.
  // The geometry's original world-space center is (59, .5, 25).
  const badgeScale = 17.9;
  tiles.children.push(json.nodes.length);
  json.nodes.push({
    name: 'logo_G', mesh: gMeshIndex,
    translation: [-7999.438 - 59 * badgeScale, -2069.5 - .5 * badgeScale, -260.318 - 25 * badgeScale],
    scale: [badgeScale, badgeScale, badgeScale],
    extras: { brandBuildingBadge: true, source: 'nuclear_staffing_noHumans_mobile.glb#logo_G' },
  });
  json.asset.generator = 'constructii/scripts/build-brand-scene.mjs';
  json.asset.extras = { ...json.asset.extras, wordmarkSource: 'public/img/greentech-logo.svg', facadeSource: 'nuclear_staffing_noHumans_mobile.glb#scene' };
  return asset;
}

const mobile = readGlb('nuclear_staffing_noHumans_mobile.glb');
const desktop = readGlb('nuclear_staffing_noHumans.glb');
const logo = extractLogo(mobile);
const wordmark = await buildGreentechWordmarkGeometry({ depth: .015 });
const preparedDesktop = copyBuildingScene(assembleDesktop(desktop, logo), mobile);
const preparedMobile = { json: clone(mobile.json), bin: Buffer.from(mobile.bin) };
const generatedSizes = new Map();

for (const [name, asset, original, replaced] of [
  ['nuclear_staffing_desktop_greentech.glb', preparedDesktop, desktop, [1, 4, 5]],
  ['nuclear_staffing_mobile_greentech.glb', preparedMobile, mobile, [3, 5]],
]) {
  brandScene(asset, wordmark);
  original.json.nodes.forEach((node, index) => {
    if (!replaced.includes(index)) assert.deepEqual(asset.json.nodes[index], node);
  });
  for (const key of ['animations', 'cameras', 'scenes']) assert.deepEqual(asset.json[key], original.json[key]);
  assert.ok(asset.bin.subarray(0, original.bin.length).equals(original.bin));
  const bytes = encodeGlb(asset.json, asset.bin);
  writeFileSync(new URL(name, directory), bytes);
  generatedSizes.set(name, bytes.length);
  const result = readGlb(name);
  assert.deepEqual(result.json, asset.json);
  assert.ok(result.bin.equals(asset.bin));
  console.log(`${name}: ${bytes.length} bytes`);
}
// Keep the prefetch manifest accurate whenever the generated GLB size changes.
const loaderPath = new URL('../public/_astro/CommonScripts.astro_astro_type_script_index_0_lang.CZTi642d.js', import.meta.url);
let loader = readFileSync(loaderPath, 'utf8');
for (const [name, size] of generatedSizes) {
  assert.equal(loader.split(name).length, 3, `Expected both runtime URLs for ${name}`);
  const kind = name.includes('_desktop_') ? 'desktop' : 'mobile';
  const pattern = new RegExp(`(name:"nuclear_staffing_${kind}",url:[^,]+,fileSize:)\\d+`);
  assert.ok(pattern.test(loader));
  loader = loader.replace(pattern, (_, prefix) => prefix + size);
}
writeFileSync(loaderPath, loader);
console.log(JSON.stringify({ source: wordmark.provenance.sourceSha256, triangles: wordmark.validation.triangleCount, checks: wordmark.validation.checks }));
