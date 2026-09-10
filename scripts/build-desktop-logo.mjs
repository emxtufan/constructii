import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const directory = new URL('../public/glb/', import.meta.url);
const clone = value => structuredClone(value);
const align4 = length => (length + 3) & ~3;

export function readGlb(name) {
  const bytes = readFileSync(new URL(name, directory));
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'Expected GLB');
  assert.equal(bytes.readUInt32LE(4), 2, 'Expected GLB version 2');
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const binaryHeader = 20 + jsonLength;
  assert.equal(bytes.readUInt32LE(binaryHeader + 4), 0x004e4942);
  assert.equal(json.buffers.length, 1);
  assert.ok(!json.buffers[0].uri, 'Only embedded buffers are supported');
  return { json, bin: bytes.subarray(binaryHeader + 8, binaryHeader + 8 + json.buffers[0].byteLength) };
}

export function encodeGlb(json, bin) {
  json.buffers = [{ byteLength: bin.length }];
  const source = Buffer.from(JSON.stringify(json));
  const jsonBytes = Buffer.alloc(align4(source.length), 0x20);
  source.copy(jsonBytes);
  const binaryBytes = Buffer.alloc(align4(bin.length));
  bin.copy(binaryBytes);
  const result = Buffer.alloc(12 + 8 + jsonBytes.length + 8 + binaryBytes.length);
  result.writeUInt32LE(0x46546c67, 0);
  result.writeUInt32LE(2, 4);
  result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(jsonBytes.length, 12);
  result.writeUInt32LE(0x4e4f534a, 16);
  jsonBytes.copy(result, 20);
  const offset = 20 + jsonBytes.length;
  result.writeUInt32LE(binaryBytes.length, offset);
  result.writeUInt32LE(0x004e4942, offset + 4);
  binaryBytes.copy(result, offset + 8);
  return result;
}

// Scope deliberately limited to this existing static, Draco-compressed logo.
// Fail if a future export introduces skins, morph targets, textures or buffers
// that would require a more general glTF dependency copier.
export function extractLogo(source) {
  const nodeIndex = source.json.nodes.findIndex(node => node.name === 'logo_G');
  assert.notEqual(nodeIndex, -1, 'The source must contain logo_G');
  const node = clone(source.json.nodes[nodeIndex]);
  assert.ok(!node.skin && !node.children && !node.extensions && !node.weights);
  const mesh = clone(source.json.meshes[node.mesh]);
  assert.equal(mesh.primitives.length, 1);
  const primitive = mesh.primitives[0];
  assert.ok(!primitive.targets);
  assert.deepEqual(Object.keys(primitive.extensions), ['KHR_draco_mesh_compression']);
  const draco = primitive.extensions.KHR_draco_mesh_compression;
  const view = source.json.bufferViews[draco.bufferView];
  assert.equal(view.buffer, 0);
  const bin = Buffer.from(source.bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength));
  assert.equal(bin.length, view.byteLength);
  const accessorIndices = [...new Set([...Object.values(primitive.attributes), primitive.indices])];
  const accessors = accessorIndices.map(index => {
    const accessor = clone(source.json.accessors[index]);
    assert.ok(accessor.bufferView === undefined && !accessor.sparse);
    return accessor;
  });
  primitive.attributes = Object.fromEntries(Object.entries(primitive.attributes).map(([name, index]) => [name, accessorIndices.indexOf(index)]));
  primitive.indices = accessorIndices.indexOf(primitive.indices);
  const material = clone(source.json.materials[primitive.material]);
  assert.ok(!JSON.stringify(material).includes('Texture'), 'Logo must have a self-contained material');
  primitive.material = 0;
  draco.bufferView = 0;
  node.mesh = 0;
  const parentIndex = source.json.nodes.findIndex(parent => parent.children?.includes(nodeIndex));
  const parent = clone(source.json.nodes[parentIndex]);
  assert.equal(parent.name, 'tiles');
  assert.ok(source.json.scenes[source.json.scene ?? 0].nodes.includes(parentIndex));
  parent.name = 'logo_G_placement';
  parent.children = [1];
  return {
    json: {
      asset: { version: '2.0', generator: 'constructii/scripts/build-desktop-logo.mjs' },
      scene: 0, scenes: [{ name: 'Green Tech G', nodes: [0] }],
      nodes: [parent, node], meshes: [mesh], materials: [material], accessors,
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: bin.length }],
      extensionsUsed: ['KHR_draco_mesh_compression'],
      extensionsRequired: ['KHR_draco_mesh_compression'],
    }, bin,
  };
}

export function assembleDesktop(desktop, logo) {
  const json = clone(desktop.json);
  const arrowIndex = json.nodes.findIndex(node => node.name === 'arrow');
  assert.notEqual(arrowIndex, -1, 'Desktop source must contain arrow');
  const parentIndex = json.nodes.findIndex(node => node.children?.includes(arrowIndex));
  const desktopParent = json.nodes[parentIndex];
  assert.equal(desktopParent.name, 'tiles');
  assert.ok(json.scenes[json.scene ?? 0].nodes.includes(parentIndex));
  for (const [key, fallback] of [['translation', [0, 0, 0]], ['rotation', [0, 0, 0, 1]], ['scale', [1, 1, 1]]]) {
    const original = desktopParent[key] ?? fallback;
    const replacement = logo.json.nodes[0][key] ?? fallback;
    assert.ok(original.every((value, index) => Math.abs(value - replacement[index]) < 0.000002), `Placement parents differ: ${key}`);
  }
  for (const animation of json.animations ?? []) {
    assert.ok(animation.channels.every(channel => channel.target.node !== arrowIndex), 'Cannot replace an animated logo node');
  }
  const accessorOffset = json.accessors.length;
  const materialIndex = json.materials.length;
  const bufferViewIndex = json.bufferViews.length;
  const logoMesh = clone(logo.json.meshes[0]);
  for (const primitive of logoMesh.primitives) {
    primitive.attributes = Object.fromEntries(Object.entries(primitive.attributes).map(([key, index]) => [key, index + accessorOffset]));
    primitive.indices += accessorOffset;
    primitive.material = materialIndex;
    primitive.extensions.KHR_draco_mesh_compression.bufferView = bufferViewIndex;
  }
  const binaryOffset = align4(desktop.bin.length);
  const bin = Buffer.alloc(binaryOffset + logo.bin.length);
  desktop.bin.copy(bin);
  logo.bin.copy(bin, binaryOffset);
  json.bufferViews.push({ buffer: 0, byteOffset: binaryOffset, byteLength: logo.bin.length });
  json.accessors.push(...clone(logo.json.accessors));
  json.materials.push(...clone(logo.json.materials));
  // Replace in place: every camera/animation target index stays unchanged.
  json.nodes[arrowIndex] = { ...clone(logo.json.nodes[1]), mesh: json.meshes.length };
  json.meshes.push(logoMesh);
  for (const key of ['extensionsUsed', 'extensionsRequired']) {
    json[key] = [...new Set([...(json[key] ?? []), ...logo.json[key]])];
  }
  json.asset.generator = 'constructii/scripts/build-desktop-logo.mjs';
  json.asset.extras = { ...json.asset.extras, logoSource: 'nuclear_staffing_noHumans_mobile.glb#logo_G' };

  // Check preservation, not just whether a GLB can be serialized.
  desktop.json.nodes.forEach((node, index) => {
    if (index !== arrowIndex) assert.deepEqual(json.nodes[index], node);
  });
  for (const key of ['scenes', 'animations', 'cameras', 'images', 'textures', 'samplers']) assert.deepEqual(json[key], desktop.json[key]);
  for (const key of ['meshes', 'accessors', 'materials', 'bufferViews']) assert.deepEqual(json[key].slice(0, desktop.json[key].length), desktop.json[key]);
  assert.ok(bin.subarray(0, desktop.bin.length).equals(desktop.bin));
  assert.ok(!json.nodes.some(node => node.name === 'arrow'));
  return { json, bin };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const mobile = readGlb('nuclear_staffing_noHumans_mobile.glb');
const desktop = readGlb('nuclear_staffing_noHumans.glb');
const logo = extractLogo(mobile);
const replacement = assembleDesktop(desktop, logo);
for (const [name, asset] of [['greentech-logo-g.glb', logo], ['nuclear_staffing_noHumans_desktop_g.glb', replacement]]) {
  const encoded = encodeGlb(asset.json, asset.bin);
  const target = new URL(name, directory);
  writeFileSync(target, encoded);
  const roundtrip = readGlb(name);
  assert.deepEqual(roundtrip.json, asset.json);
  assert.ok(roundtrip.bin.equals(asset.bin));
  console.log(`${fileURLToPath(target)} — ${encoded.length} bytes`);
}
console.log('Original desktop scene/camera/animation data preserved; only arrow node replaced by the original G.');
}
