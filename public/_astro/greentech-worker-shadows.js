import {
  u as uniform, v as vec4, ai as vec2, o as float,
  a1 as smoothstep, a3 as clamp, J as mix,
  y as positionWorld, B as normalWorld,
} from './vendor.BgqcyBjU.js';

const leftSole = uniform(vec4(0, 0, 0, 0));
const rightSole = uniform(vec4(0, 0, 0, 0));
const softness = uniform(vec4(.3, 0, .3, 0));
const PLATFORM_Y = 1;

// Called only by the blocks material. Replace the two baked, original-size
// footprints on the central platform, preserving bevels and neighboring tiles.
export function workerPlatformAO(ambientOcclusion, cleanPlatformAO = float(.94)) {
  const point = positionWorld.xz;
  const top = smoothstep(.85, .98, normalWorld.y)
    .mul(float(1).sub(smoothstep(.02, .06, positionWorld.y.sub(PLATFORM_Y).abs())));
  const oldFootprints = float(1).sub(smoothstep(.5, .72, point.sub(vec2(24, 25)).length())).mul(top);
  const clean = mix(ambientOcclusion, cleanPlatformAO, oldFootprints);

  const contact = (sole, radius, strength) => {
    const segment = sole.zw.sub(sole.xy);
    const relative = point.sub(sole.xy);
    const along = clamp(relative.dot(segment).div(segment.dot(segment).max(.0001)), 0, 1);
    const distance = relative.sub(segment.mul(along)).length();
    return float(1).sub(smoothstep(radius.mul(.18), radius, distance)).mul(strength);
  };
  const shade = contact(leftSole, softness.x, softness.y)
    .max(contact(rightSole, softness.z, softness.w)).mul(top);
  return clean.mul(float(1).sub(shade));
}

// Precompute sole projections from the same baked matrices used by the GPU.
// The existing worker RAF only interpolates two compact tracks; no extra RAF,
// draw calls, vertex attributes, shadow map or GLB changes are required.
export class WorkerContactShadows {
  constructor(bake, geometry, placement, fromHalfFloat) {
    const clip = bake.animationMap[placement.animation];
    const position = geometry?.getAttribute('position');
    if (!clip || !position) return;
    this.placement = placement;
    this.frames = clip.frameCount;
    this.fps = bake.fps;

    const indices = geometry.getAttribute('skinIndex');
    const weights = geometry.getAttribute('skinWeight');
    const readComponents = (attribute, i) => [attribute.getX(i), attribute.getY(i), attribute.getZ(i), attribute.getW(i)];
    const soles = [[], []];
    for (let i = 0; i < position.count; i++) {
      if (position.getY(i) > .025) continue;
      const vertex = {
        position: [position.getX(i), position.getY(i), position.getZ(i)],
        indices: readComponents(indices, i), weights: readComponents(weights, i),
      };
      soles[vertex.position[2] < 0 ? 0 : 1].push(vertex);
    }
    const data = bake.boneTexture.image.data;
    const decode = data instanceof Uint16Array ? fromHalfFloat : value => value;
    const skin = (vertex, frame) => {
      const output = [0, 0, 0];
      const [x, y, z] = vertex.position;
      for (let influence = 0; influence < 4; influence++) {
        const weight = vertex.weights[influence];
        if (weight === 0) continue;
        const offset = ((clip.rowStart + frame) * bake.boneCount + vertex.indices[influence]) * 16;
        for (let axis = 0; axis < 3; axis++) {
          output[axis] += weight * (decode(data[offset + axis]) * x
            + decode(data[offset + axis + 4]) * y + decode(data[offset + axis + 8]) * z
            + decode(data[offset + axis + 12]));
        }
      }
      return output;
    };
    const average = points => points.reduce((sum, point) => sum.map((value, axis) => value + point[axis] / points.length), [0, 0, 0]);
    this.tracks = soles.map(vertices => {
      if (!vertices.length) return null;
      const minX = Math.min(...vertices.map(vertex => vertex.position[0]));
      const maxX = Math.max(...vertices.map(vertex => vertex.position[0]));
      const rangeX = maxX - minX;
      const heel = vertices.filter(vertex => vertex.position[0] < minX + rangeX * .3);
      const toe = vertices.filter(vertex => vertex.position[0] > maxX - rangeX * .3);
      const width = (Math.max(...vertices.map(vertex => vertex.position[2]))
        - Math.min(...vertices.map(vertex => vertex.position[2]))) * .5;
      const track = new Float32Array(this.frames * 6);
      for (let frame = 0; frame < this.frames; frame++) {
        track.set(average((heel.length ? heel : vertices).map(vertex => skin(vertex, frame))), frame * 6);
        track.set(average((toe.length ? toe : vertices).map(vertex => skin(vertex, frame))), frame * 6 + 3);
      }
      return { track, width };
    });
    this.update(0);
  }

  update(time) {
    if (!this.tracks) return;
    const { position, scale = 1, rotationY = 0, timeOffset = 0 } = this.placement;
    // Positive modulo matches TSL mod(), including the initial time offset.
    const frame = ((time - timeOffset) * this.fps % this.frames + this.frames) % this.frames;
    const current = Math.floor(frame), next = (current + 1) % this.frames, blend = frame - current;
    const cos = Math.cos(rotationY), sin = Math.sin(rotationY);
    this.tracks.forEach((foot, index) => {
      if (!foot) return;
      const point = offset => {
        const sample = axis => {
          const a = foot.track[current * 6 + offset + axis];
          return a + (foot.track[next * 6 + offset + axis] - a) * blend;
        };
        const x = sample(0) * scale, y = sample(1) * scale, z = sample(2) * scale;
        return [position[0] + cos * x + sin * z, position[1] + y, position[2] - sin * x + cos * z];
      };
      const heel = point(0), toe = point(3);
      const height = Math.max(0, (heel[1] + toe[1]) * .5 - PLATFORM_Y);
      const radius = foot.width * scale + .06 + height * .2;
      const strength = .48 / (1 + height * 1.8);
      (index === 0 ? leftSole : rightSole).value.set(heel[0], heel[2], toe[0], toe[2]);
      if (index === 0) {
        softness.value.x = radius;
        softness.value.y = strength;
      } else {
        softness.value.z = radius;
        softness.value.w = strength;
      }
    });
  }
}
