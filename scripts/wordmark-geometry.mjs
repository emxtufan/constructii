/**
 * Extrudes the existing GREENTECH vector artwork; no replacement font is used.
 * Source: public/img/greentech-logo.svg, first outer <g> only. The second group
 * is the building pictogram and is deliberately excluded. Cubic curves are
 * tessellated adaptively, with error controlled in original SVG coordinates.
 *
 * Usage: const geometry = await buildGreentechWordmarkGeometry();
 * XY is centered, SVG Y is inverted, width is 1, Z runs from 0 to `depth`.
 * Front faces point +Z, backs -Z, and side normals point out of each contour.
 * Individual original SVG shapes remain separate, including their overlaps.
 * This is a bounded parser for this asset, not a general-purpose SVG importer.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_SOURCE = new URL('../public/img/greentech-logo.svg', import.meta.url);
const EXPECTED_SHAPES = [
  'path', 'path', 'polygon', 'polygon', 'polygon', 'rect', 'polygon',
  'polygon', 'path', 'rect', 'rect', 'rect', 'rect', 'path', 'path',
  'rect', 'path', 'path', 'rect', 'path', 'path',
];
const NUMBER = /[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/y;
const EPS = 1e-11;

function numbers(text) {
  const values = [];
  let at = 0;
  while (at < text.length) {
    if (/[\s,]/.test(text[at])) { at += 1; continue; }
    NUMBER.lastIndex = at;
    const match = NUMBER.exec(text);
    assert(match, `Invalid SVG number at ${text.slice(at, at + 30)}`);
    values.push(Number(match[0]));
    assert(Number.isFinite(values.at(-1)), 'Nonfinite SVG number');
    at = NUMBER.lastIndex;
  }
  return values;
}

function attributes(text) {
  const result = {};
  const remainder = text.replace(/([\w:-]+)\s*=\s*"([^"]*)"/g, (_, name, value) => {
    assert(!(name in result), `Duplicate SVG attribute ${name}`);
    result[name] = value;
    return '';
  });
  assert(!remainder.replace(/[\s/]/g, ''), `Unsupported SVG attributes: ${remainder}`);
  return result;
}

function originalWordmark(svg) {
  assert(/<svg\b[^>]*viewBox="0 0 281\.73 37\.59"/.test(svg), 'Unexpected logo SVG viewBox');
  const groupTags = [...svg.matchAll(/<\/?g\b[^>]*>/g)];
  let depth = 0;
  let firstStart;
  let firstEnd;
  let outerCount = 0;
  for (const tag of groupTags) {
    if (tag[0].startsWith('</')) {
      assert(depth > 0, 'Unbalanced SVG groups');
      depth -= 1;
      if (depth === 0 && firstEnd === undefined) firstEnd = tag.index + tag[0].length;
    } else {
      if (depth === 0) {
        outerCount += 1;
        if (firstStart === undefined) firstStart = tag.index;
      }
      depth += 1;
    }
  }
  assert.equal(depth, 0, 'Unbalanced SVG groups');
  assert.equal(outerCount, 2, 'Expected wordmark and pictogram outer groups');
  assert(firstStart !== undefined && firstEnd !== undefined, 'Missing wordmark group');
  const group = svg.slice(firstStart, firstEnd);
  const shapes = [];
  for (const match of group.matchAll(/<([^>]+)>/g)) {
    if (match[1] === 'g' || match[1] === '/g') continue;
    const element = /^(path|polygon|rect)\b(.*)$/.exec(match[1]);
    assert(element, `Unsupported wordmark element: <${match[1]}>`);
    assert(match[1].endsWith('/'), 'Expected self-closing artwork shapes');
    const [, type, rawAttributes] = element;
    const attrs = attributes(rawAttributes);
    assert.equal(attrs.class, 'cls-1', 'Unexpected wordmark shape class');
    const allowed = new Set(['class', 'transform', ...(type === 'path' ? ['d'] : type === 'polygon' ? ['points'] : ['x', 'y', 'width', 'height'])]);
    for (const key of Object.keys(attrs)) assert(allowed.has(key), `Unsupported ${type} attribute ${key}`);
    shapes.push({ type, attrs });
  }
  assert.deepEqual(shapes.map(shape => shape.type), EXPECTED_SHAPES, 'Original 21 wordmark shapes changed');
  assert.equal(shapes.filter(shape => shape.attrs.transform).length, 3, 'Expected three original rectangle transforms');
  return { group, shapes };
}

const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

function distanceToSegment(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSquared)) : 0;
  return Math.hypot(point[0] - start[0] - t * dx, point[1] - start[1] - t * dy);
}

function flattenCubic(p0, p1, p2, p3, tolerance, output, depth = 0) {
  if (Math.max(distanceToSegment(p1, p0, p3), distanceToSegment(p2, p0, p3)) <= tolerance) {
    output.push(p3);
    return;
  }
  assert(depth < 20, 'Cubic curve subdivision exceeded safe limit');
  const a = midpoint(p0, p1), b = midpoint(p1, p2), c = midpoint(p2, p3);
  const d = midpoint(a, b), e = midpoint(b, c), f = midpoint(d, e);
  flattenCubic(p0, a, d, f, tolerance, output, depth + 1);
  flattenCubic(f, e, c, p3, tolerance, output, depth + 1);
}

function pathContour(path, tolerance) {
  assert(path, 'Missing SVG path data');
  const tokens = [];
  let at = 0;
  while (at < path.length) {
    if (/[\s,]/.test(path[at])) { at += 1; continue; }
    if (/[a-zA-Z]/.test(path[at])) {
      assert(/[MmLlHhVvCcSsZz]/.test(path[at]), `Unsupported SVG path command ${path[at]}`);
      tokens.push(path[at++]);
    } else {
      NUMBER.lastIndex = at;
      const match = NUMBER.exec(path);
      assert(match, `Invalid path data at ${path.slice(at, at + 30)}`);
      tokens.push(Number(match[0]));
      at = NUMBER.lastIndex;
    }
  }
  const output = [];
  let current = [0, 0], start, lastControl, previous = '', command;
  let index = 0;
  const take = count => {
    const values = tokens.slice(index, index + count);
    assert(values.length === count && values.every(value => typeof value === 'number' && Number.isFinite(value)), `Missing coordinates for ${command}`);
    index += count;
    return values;
  };
  let closed = false;
  while (index < tokens.length) {
    if (typeof tokens[index] === 'string') command = tokens[index++];
    assert(command && !closed, 'Unexpected data after closed contour');
    const op = command.toUpperCase();
    const relative = command !== op;
    const point = (x, y) => [x + (relative ? current[0] : 0), y + (relative ? current[1] : 0)];
    if (op === 'Z') {
      assert(start, 'Closing empty SVG contour');
      closed = true;
      current = start;
      command = undefined;
    } else if (op === 'M' || op === 'L') {
      const [x, y] = take(2);
      current = point(x, y);
      if (op === 'M') {
        assert(!start, 'Multiple contours/holes are not supported by this original artwork importer');
        start = current;
        command = relative ? 'l' : 'L';
      }
      output.push(current);
    } else if (op === 'H') {
      const [x] = take(1);
      current = [x + (relative ? current[0] : 0), current[1]];
      output.push(current);
    } else if (op === 'V') {
      const [y] = take(1);
      current = [current[0], y + (relative ? current[1] : 0)];
      output.push(current);
    } else if (op === 'C' || op === 'S') {
      const coordinates = take(op === 'C' ? 6 : 4);
      const p1 = op === 'C' ? point(coordinates[0], coordinates[1]) : /[CS]/.test(previous) ? [2 * current[0] - lastControl[0], 2 * current[1] - lastControl[1]] : current;
      const p2 = point(coordinates.at(-4), coordinates.at(-3));
      const p3 = point(coordinates.at(-2), coordinates.at(-1));
      flattenCubic(current, p1, p2, p3, tolerance, output);
      lastControl = p2;
      current = p3;
    }
    previous = op;
    if (!/[CS]/.test(op)) lastControl = undefined;
  }
  assert(closed, 'Original SVG paths must be explicitly closed');
  return output;
}

function transformPoints(points, transform) {
  if (!transform) return points;
  const operations = [];
  const remainder = transform.replace(/(translate|rotate)\s*\(([^)]*)\)/g, (_, name, args) => {
    const values = numbers(args);
    assert(name === 'translate' ? values.length === 2 : values.length === 1, `Unsupported ${name} transform arguments`);
    operations.push({ name, values });
    return '';
  });
  assert(!remainder.trim() && operations.length, `Unsupported SVG transform ${transform}`);
  // SVG transform lists multiply matrices in source order: apply the last first.
  return points.map(point => operations.reduceRight(([x, y], { name, values }) => {
    if (name === 'translate') return [x + values[0], y + values[1]];
    const radians = values[0] * Math.PI / 180;
    return [x * Math.cos(radians) - y * Math.sin(radians), x * Math.sin(radians) + y * Math.cos(radians)];
  }, point));
}

function shapeContour({ type, attrs }, tolerance) {
  let points;
  if (type === 'path') points = pathContour(attrs.d, tolerance);
  else if (type === 'polygon') {
    const values = numbers(attrs.points ?? '');
    assert(values.length >= 6 && values.length % 2 === 0, 'Invalid polygon points');
    points = Array.from({ length: values.length / 2 }, (_, i) => values.slice(2 * i, 2 * i + 2));
  } else {
    const values = ['x', 'y', 'width', 'height'].map(name => {
      const parsed = numbers(attrs[name] ?? '');
      assert.equal(parsed.length, 1, `Missing/invalid rectangle ${name}`);
      return parsed[0];
    });
    const [x, y, width, height] = values;
    assert(width > 0 && height > 0, 'Invalid rectangle dimensions');
    points = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
  }
  return transformPoints(points, attrs.transform);
}

function area(points) {
  return points.reduce((sum, point, i) => {
    const next = points[(i + 1) % points.length];
    return sum + point[0] * next[1] - next[0] * point[1];
  }, 0) / 2;
}

function cleanContour(points) {
  const clean = points.filter((point, index) => {
    const previous = points[(index + points.length - 1) % points.length];
    return Math.hypot(point[0] - previous[0], point[1] - previous[1]) > EPS;
  });
  let changed = true;
  while (changed && clean.length > 3) {
    changed = false;
    for (let i = 0; i < clean.length; i += 1) {
      const previous = clean[(i + clean.length - 1) % clean.length];
      const next = clean[(i + 1) % clean.length];
      // Also remove zero-area backtracking at rounded SVG closure seams.
      if (Math.abs(cross(previous, clean[i], next)) < EPS) {
        clean.splice(i, 1);
        changed = true;
        break;
      }
    }
  }
  assert(clean.length >= 3 && Math.abs(area(clean)) > EPS, 'Degenerate SVG contour');
  if (area(clean) < 0) clean.reverse();
  return clean;
}

// Rounded coordinates in the original C create a tiny crossing at its closing
// seam. Split intersecting edges into their actual filled lobes, preserving the
// source outline instead of snapping either endpoint or inventing a new letter.
function simpleContours(points, splits = 0) {
  assert(splits < 8, 'Unexpectedly complex self-intersection in original logo');
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i], b = points[(i + 1) % points.length];
    for (let j = i + 2; j < points.length; j += 1) {
      if (i === 0 && j === points.length - 1) continue;
      const c = points[j], d = points[(j + 1) % points.length];
      const rx = b[0] - a[0], ry = b[1] - a[1];
      const sx = d[0] - c[0], sy = d[1] - c[1];
      const denominator = rx * sy - ry * sx;
      if (Math.abs(denominator) < 1e-16) continue;
      const qx = c[0] - a[0], qy = c[1] - a[1];
      const t = (qx * sy - qy * sx) / denominator;
      const u = (qx * ry - qy * rx) / denominator;
      if (t <= EPS || t >= 1 - EPS || u <= EPS || u >= 1 - EPS) continue;
      const intersection = [a[0] + t * rx, a[1] + t * ry];
      const first = cleanContour([intersection, ...points.slice(i + 1, j + 1)]);
      const second = cleanContour([intersection, ...points.slice(j + 1), ...points.slice(0, i + 1)]);
      return [...simpleContours(first, splits + 1), ...simpleContours(second, splits + 1)];
    }
  }
  return [points];
}

function triangulate(points) {
  const remaining = points.map((_, index) => index);
  const triangles = [];
  const inside = (p, a, b, c) => cross(a, b, p) >= -EPS && cross(b, c, p) >= -EPS && cross(c, a, p) >= -EPS;
  while (remaining.length > 3) {
    let clipped = false;
    for (let i = 0; i < remaining.length; i += 1) {
      const a = remaining[(i + remaining.length - 1) % remaining.length];
      const b = remaining[i];
      const c = remaining[(i + 1) % remaining.length];
      if (cross(points[a], points[b], points[c]) <= EPS) continue;
      if (remaining.some(index => index !== a && index !== b && index !== c && inside(points[index], points[a], points[b], points[c]))) continue;
      triangles.push([a, b, c]);
      remaining.splice(i, 1);
      clipped = true;
      break;
    }
    assert(clipped, 'Cannot triangulate SVG contour; asset may contain holes or self-intersections');
  }
  triangles.push([...remaining]);
  assert.equal(triangles.length, points.length - 2, 'Unexpected polygon triangle count');
  const polygonArea = area(points);
  const triangleArea = triangles.reduce((sum, [a, b, c]) => {
    const doubleArea = cross(points[a], points[b], points[c]);
    assert(doubleArea > EPS, `Degenerate or reversed cap triangle: ${JSON.stringify({ doubleArea, points: [points[a], points[b], points[c]] })}`);
    return sum + doubleArea / 2;
  }, 0);
  assert(Math.abs(polygonArea - triangleArea) < Math.max(1e-12, polygonArea * 1e-9), 'Triangulation area differs from source contour');
  return { triangles, polygonArea, triangleArea };
}

/** Build indexed glTF-ready arrays from the original GREENTECH vector wordmark. */
export async function buildGreentechWordmarkGeometry({ source = DEFAULT_SOURCE, depth = 0.015, curveTolerance = 0.005 } = {}) {
  assert(Number.isFinite(depth) && depth > 0 && depth <= 1, 'Depth must be in (0, 1] relative to normalized width');
  assert(Number.isFinite(curveTolerance) && curveTolerance >= 0.0001 && curveTolerance <= 0.05, 'Curve tolerance must be between 0.0001 and 0.05 SVG units');
  const svg = await readFile(source, 'utf8');
  const { group, shapes } = originalWordmark(svg);
  const sourceContours = shapes.map(shape => shapeContour(shape, curveTolerance));
  const all = sourceContours.flat();
  const sourceMin = [Math.min(...all.map(p => p[0])), Math.min(...all.map(p => p[1]))];
  const sourceMax = [Math.max(...all.map(p => p[0])), Math.max(...all.map(p => p[1]))];
  assert(sourceMin[0] > 86 && sourceMin[0] < 89 && Math.abs(sourceMax[0] - 281.73) < 1e-9, `Wordmark bounds do not match original letter artwork: ${JSON.stringify({ sourceMin, sourceMax })}`);
  assert(sourceMin[1] > 13 && sourceMin[1] < 15 && sourceMax[1] > 32 && sourceMax[1] < 34, 'Unexpected wordmark vertical bounds');
  const width = sourceMax[0] - sourceMin[0];
  const center = midpoint(sourceMin, sourceMax);
  const contours = sourceContours.flatMap((contour, shapeIndex) => {
    const normalized = cleanContour(contour.map(([x, y]) => [(x - center[0]) / width, (center[1] - y) / width]));
    return simpleContours(normalized).map(points => ({ points, shapeIndex }));
  });
  const positions = [], normals = [], indices = [];
  const shapeChecks = [];
  let capArea = 0;
  const vertex = (x, y, z, nx, ny, nz) => {
    const index = positions.length / 3;
    positions.push(x, y, z);
    normals.push(nx, ny, nz);
    return index;
  };
  contours.forEach(({ points, shapeIndex }, contourIndex) => {
    const { triangles, polygonArea, triangleArea } = triangulate(points);
    shapeChecks.push({ shapeIndex, contourIndex, type: shapes[shapeIndex].type, vertices: points.length, capTriangles: triangles.length, polygonArea, triangleArea });
    capArea += polygonArea;
    const front = points.map(([x, y]) => vertex(x, y, depth, 0, 0, 1));
    const back = points.map(([x, y]) => vertex(x, y, 0, 0, 0, -1));
    for (const [a, b, c] of triangles) indices.push(front[a], front[b], front[c], back[c], back[b], back[a]);
    points.forEach(([x, y], i) => {
      const [nextX, nextY] = points[(i + 1) % points.length];
      const dx = nextX - x, dy = nextY - y;
      const length = Math.hypot(dx, dy);
      assert(length > EPS, 'Degenerate side edge');
      const nx = dy / length, ny = -dx / length;
      const a = vertex(x, y, 0, nx, ny, 0);
      const b = vertex(nextX, nextY, 0, nx, ny, 0);
      const c = vertex(nextX, nextY, depth, nx, ny, 0);
      const d = vertex(x, y, depth, nx, ny, 0);
      indices.push(a, b, c, a, c, d);
    });
  });
  const output = { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices) };
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (let i = 0; i < output.positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const coordinate = output.positions[i + axis];
      assert(Number.isFinite(coordinate), 'Nonfinite output coordinate');
      bounds.min[axis] = Math.min(bounds.min[axis], coordinate);
      bounds.max[axis] = Math.max(bounds.max[axis], coordinate);
    }
    assert(Math.abs(Math.hypot(...output.normals.subarray(i, i + 3)) - 1) < 1e-6, 'Non-unit vertex normal');
  }
  let signedVolume = 0;
  for (let i = 0; i < output.indices.length; i += 3) {
    const [a, b, c] = [...output.indices.subarray(i, i + 3)].map(index => {
      assert(index < output.positions.length / 3, 'Out-of-range triangle index');
      return [...output.positions.subarray(3 * index, 3 * index + 3)];
    });
    const ab = b.map((value, axis) => value - a[axis]);
    const ac = c.map((value, axis) => value - a[axis]);
    const normal = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    assert(Math.hypot(...normal) > 1e-14, 'Degenerate triangle after Float32 conversion');
    const expected = output.normals.subarray(3 * output.indices[i], 3 * output.indices[i] + 3);
    assert(normal.reduce((sum, value, axis) => sum + value * expected[axis], 0) > 0, 'Triangle winding disagrees with outward normals');
    signedVolume += (a[0] * (b[1] * c[2] - b[2] * c[1]) + a[1] * (b[2] * c[0] - b[0] * c[2]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
  }
  const expectedVolume = capArea * depth;
  assert(Math.abs(signedVolume - expectedVolume) <= expectedVolume * 1e-5, 'Extruded mesh volume differs from source contour areas');
  assert(Math.abs(bounds.max[0] - bounds.min[0] - 1) < 1e-7, 'Wordmark width is not normalized');
  return {
    ...output,
    bounds,
    provenance: {
      source: source instanceof URL ? source.href : String(source),
      selection: 'First outer SVG group: 21 original GREENTECH letter shapes; building pictogram excluded',
      sourceSha256: createHash('sha256').update(svg).digest('hex'),
      wordmarkGroupSha256: createHash('sha256').update(group).digest('hex'),
      sourceBounds: { min: sourceMin, max: sourceMax },
      curveToleranceSvgUnits: curveTolerance,
      depthRelativeToWidth: depth,
    },
    validation: {
      shapeCount: shapes.length,
      contourCount: contours.length,
      vertexCount: positions.length / 3,
      triangleCount: indices.length / 3,
      capArea,
      expectedVolume,
      signedVolume,
      checks: ['All cap triangle areas match source contour areas', 'All Float32 triangles nondegenerate', 'All triangle windings agree with outward unit normals', 'Closed extrusion signed volume matches cap area times depth', 'Width normalized to 1; original vector proportions preserved'],
      shapes: shapeChecks,
    },
  };
}

export default buildGreentechWordmarkGeometry;

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const geometry = await buildGreentechWordmarkGeometry();
  console.log(JSON.stringify({ bounds: geometry.bounds, provenance: geometry.provenance, validation: geometry.validation }, null, 2));
}
