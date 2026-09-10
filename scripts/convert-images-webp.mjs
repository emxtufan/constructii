// Convert photographs without resizing. Needs sharp locally or SHARP_MODULE_PATH.
// Optional first argument: source directory, e.g. assets/originals/img.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp');
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = resolve(projectRoot, process.argv[2] || 'public/img');
const outputRoot = resolve(projectRoot, 'public/img');
const report = [];

async function convert(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const source = resolve(directory, entry.name);
    if (entry.isDirectory()) { await convert(source); continue; }
    if (!/\.(png|jpe?g|tiff?|avif)$/i.test(entry.name)) continue;
    const name = relative(sourceRoot, source);
    const output = resolve(outputRoot, name.slice(0, -extname(name).length) + '.webp');
    if (!output.startsWith(outputRoot + sep)) throw Error('Output outside public/img.');
    const input = await readFile(source);
    const before = await sharp(input).metadata();
    const buffer = await sharp(input).rotate().webp({ quality: 86, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer();
    const after = await sharp(buffer).metadata();
    const rotated = [5, 6, 7, 8].includes(before.orientation);
    if (after.width !== (rotated ? before.height : before.width) || after.height !== (rotated ? before.width : before.height)) {
      throw Error(`Image dimensions changed: ${name}`);
    }
    // WebP may omit an entirely opaque alpha channel without losing transparency.
    if (before.hasAlpha && !after.hasAlpha && !(await sharp(input).stats()).isOpaque) {
      throw Error(`Transparency lost: ${name}`);
    }
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, buffer);
    report.push({ source: name, output: relative(outputRoot, output), width: after.width, height: after.height, before: input.length, after: buffer.length });
  }
}

await convert(sourceRoot);
const before = report.reduce((sum, image) => sum + image.before, 0);
const after = report.reduce((sum, image) => sum + image.after, 0);
console.log(JSON.stringify({ images: report, totalBefore: before, totalAfter: after, reductionPercent: before ? Number(((1 - after / before) * 100).toFixed(2)) : 0 }, null, 2));
