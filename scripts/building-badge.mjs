import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

let decoderModulePromise;

/**
 * Reuse the existing mobile city, whose triangles match the desktop city except
 * for the removed front/sides of the obsolete building badge. Its AO atlas has
 * the supplied G footprint. Cameras, other meshes and node transforms stay put.
 */
export function copyBuildingScene(desktop, mobile) {
  const json = structuredClone(desktop.json);
  let bin = Buffer.from(desktop.bin);
  const source = mobile.json;
  const targetNode = json.nodes.find(node => node.name === 'scene');
  const sourceNode = source.nodes.find(node => node.name === 'scene');
  assert.ok(targetNode && sourceNode, 'Expected both original static scene nodes');
  const mesh = structuredClone(source.meshes[sourceNode.mesh]);
  assert.equal(mesh.primitives.length, 1);
  const primitive = mesh.primitives[0];
  const compression = primitive.extensions.KHR_draco_mesh_compression;
  assert.ok(compression && !primitive.targets, 'Expected the existing static Draco city');
  const viewMap = new Map();
  function copyView(index) {
    if (viewMap.has(index)) return viewMap.get(index);
    const original = source.bufferViews[index];
    assert.equal(original.buffer, 0);
    const start = original.byteOffset ?? 0;
    const bytes = mobile.bin.subarray(start, start + original.byteLength);
    const offset = (bin.length + 3) & ~3;
    bin = Buffer.concat([bin, Buffer.alloc(offset - bin.length), bytes]);
    const target = json.bufferViews.length;
    json.bufferViews.push({ ...structuredClone(original), buffer: 0, byteOffset: offset });
    viewMap.set(index, target);
    return target;
  }
  compression.bufferView = copyView(compression.bufferView);
  const accessorMap = new Map();
  function copyAccessor(index) {
    if (accessorMap.has(index)) return accessorMap.get(index);
    const accessor = structuredClone(source.accessors[index]);
    assert.ok(accessor.bufferView === undefined && !accessor.sparse);
    const target = json.accessors.length;
    json.accessors.push(accessor);
    accessorMap.set(index, target);
    return target;
  }
  primitive.attributes = Object.fromEntries(Object.entries(primitive.attributes).map(([name, index]) => [name, copyAccessor(index)]));
  primitive.indices = copyAccessor(primitive.indices);
  const material = structuredClone(source.materials[primitive.material]);
  const map = material.pbrMetallicRoughness.baseColorTexture;
  assert.ok(map && !material.normalTexture && !material.occlusionTexture && !material.emissiveTexture);
  const texture = structuredClone(source.textures[map.index]);
  assert.ok(texture.source !== undefined && !texture.extensions);
  const image = structuredClone(source.images[texture.source]);
  assert.ok(image.bufferView !== undefined && !image.uri);
  image.bufferView = copyView(image.bufferView);
  texture.source = (json.images ??= []).length;
  json.images.push(image);
  if (texture.sampler !== undefined) {
    const sampler = structuredClone(source.samplers[texture.sampler]);
    texture.sampler = (json.samplers ??= []).length;
    json.samplers.push(sampler);
  }
  map.index = (json.textures ??= []).length;
  json.textures.push(texture);
  primitive.material = json.materials.length;
  json.materials.push(material);
  targetNode.mesh = json.meshes.length;
  json.meshes.push(mesh);
  json.buffers[0].byteLength = bin.length;
  assert.ok(bin.subarray(0, desktop.bin.length).equals(desktop.bin));
  return { json, bin };
}

function decoderModule() {
  if (!decoderModulePromise) {
    const root = new URL('../public/draco/', import.meta.url);
    const factory = new Function('require', '__dirname', `${readFileSync(new URL('draco_wasm_wrapper.js', root), 'utf8')}\nreturn DracoDecoderModule;`)(createRequire(import.meta.url), fileURLToPath(root));
    decoderModulePromise = factory({ wasmBinary: readFileSync(new URL('draco_decoder.wasm', root)) });
  }
  return decoderModulePromise;
}

export async function decodePrimitive(asset, primitive) {
  const module = await decoderModule();
  const extension = primitive.extensions?.KHR_draco_mesh_compression;
  assert.ok(extension, 'Expected the original Draco-compressed primitive');
  const view = asset.json.bufferViews[extension.bufferView];
  const bytes = asset.bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  const decoder = new module.Decoder();
  const buffer = new module.DecoderBuffer();
  const mesh = new module.Mesh();
  const arrays = [];
  try {
    buffer.Init(new Int8Array(bytes), bytes.length);
    const status = decoder.DecodeBufferToMesh(buffer, mesh);
    assert.ok(status.ok(), status.error_msg());
    const attributes = {};
    for (const [name, id] of Object.entries(extension.attributes)) {
      const attribute = decoder.GetAttributeByUniqueId(mesh, id);
      const values = new module.DracoFloat32Array();
      arrays.push(values);
      assert.ok(decoder.GetAttributeFloatForAllPoints(mesh, attribute, values));
      attributes[name] = { array: Float32Array.from({ length: values.size() }, (_, index) => values.GetValue(index)), itemSize: attribute.num_components() };
    }
    const face = new module.DracoInt32Array();
    arrays.push(face);
    const indices = new Uint32Array(mesh.num_faces() * 3);
    for (let index = 0; index < mesh.num_faces(); index++) {
      decoder.GetFaceFromMesh(mesh, index, face);
      for (let corner = 0; corner < 3; corner++) indices[index * 3 + corner] = face.GetValue(corner);
    }
    return { attributes, indices, vertexCount: mesh.num_points() };
  } finally {
    arrays.forEach(array => module.destroy(array));
    module.destroy(mesh);
    module.destroy(buffer);
    module.destroy(decoder);
  }
}
