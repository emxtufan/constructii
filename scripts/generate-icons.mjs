// Derive every icon from the actual GreenTech logo, preserving its vector paths.
// Needs sharp locally or SHARP_MODULE_PATH pointing to an available sharp module.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp');
const publicDir = new URL('../public/', import.meta.url);
const source = await readFile(new URL('img/greentech-logo.svg', publicDir), 'utf8');
const background = '#e4e2de';
await mkdir(new URL('icons/', publicDir), { recursive: true });
await mkdir(new URL('share/', publicDir), { recursive: true });

// The logo's final group is the building symbol. Keep the original geometry and
// colors; the complete horizontal wordmark is used for the social preview.
const start = source.lastIndexOf('<g>');
const end = source.indexOf('</g>', start);
if (start < 0 || end < 0) throw new Error('GreenTech building symbol group is missing.');
const colors = Object.fromEntries([...source.matchAll(/\.([\w-]+)\s*\{\s*fill:\s*(#[0-9a-f]+);/gi)]
  .map(([, name, color]) => [name, color]));
const mark = source.slice(start + 3, end).replace(/class="([^"]+)"/g, (_, name) => {
  if (!colors[name]) throw new Error(`Unknown logo color: ${name}`);
  return `fill="${colors[name]}"${name !== 'cls-3' ? ' class="ink"' : ''}`;
});
if ((mark.match(/<(?:polygon|polyline)\b/g) || []).length !== 8) throw new Error('Unexpected GreenTech symbol geometry.');
const symbolGroup = `<g transform="translate(5 29.7018) scale(1.080043)">${mark}</g>`;
const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1000" height="1000">${symbolGroup}</svg>`;
const adaptiveSvg = lightSvg.replace('<g transform=', '<style>@media(prefers-color-scheme:dark){.ink{fill:#f5f3ef}}</style><g transform=');
await writeFile(new URL('favicon.svg', publicDir), adaptiveSvg);
const vector = Buffer.from(lightSvg);

async function icon(size, fraction = 1, opaque = false) {
  const markSize = Math.round(size * fraction);
  const mark = await sharp(vector, { density: 288 }).resize(markSize, markSize).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: opaque ? background : '#00000000' } })
    .composite([{ input: mark, gravity: 'centre' }]).png().toBuffer();
}

const outputs = [];
async function save(name, buffer) {
  await writeFile(new URL(name, publicDir), buffer);
  const metadata = await sharp(buffer).metadata();
  outputs.push({ file: name, width: metadata.width, height: metadata.height });
}

for (const size of [16, 32, 48, 96]) {
  await save(`icons/favicon-${size}x${size}.png`, await icon(size));
}
for (const size of [152, 167, 180]) {
  const name = size === 180 ? 'apple-touch-icon.png' : `apple-touch-icon-${size}x${size}.png`;
  await save(`icons/${name}`, await icon(size, .9, true));
}
for (const size of [192, 512]) {
  await save(`icons/web-app-manifest-${size}x${size}.png`, await icon(size, .94, true));
}
// The wide building mark fits inside the circular maskable safe area at 76%.
await save('icons/maskable-icon-512x512.png', await icon(512, .76, true));
await save('icons/mstile-150x150.png', await icon(150, .9, true));

// ICO directory with three PNG entries, preserving exact raster alpha channels.
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(size => icon(size)));
const icoHeader = Buffer.alloc(6 + icoSizes.length * 16);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(icoSizes.length, 4);
let offset = icoHeader.length;
icoImages.forEach((buffer, i) => {
  const entry = 6 + i * 16;
  icoHeader[entry] = icoSizes[i];
  icoHeader[entry + 1] = icoSizes[i];
  icoHeader.writeUInt16LE(1, entry + 4);
  icoHeader.writeUInt16LE(32, entry + 6);
  icoHeader.writeUInt32LE(buffer.length, entry + 8);
  icoHeader.writeUInt32LE(offset, entry + 12);
  offset += buffer.length;
});
await writeFile(new URL('favicon.ico', publicDir), Buffer.concat([icoHeader, ...icoImages]));
await copyFile(new URL('favicon.svg', publicDir), new URL('icons/favicon.svg', publicDir));
// Safari pinned tabs use the same building silhouette in a single color.
const pinnedSvg = lightSvg.replace(/fill="(?!none")[^"]+"/g, 'fill="#000000"');
await writeFile(new URL('icons/safari-pinned-tab.svg', publicDir), pinnedSvg);

// Social metadata needs a landscape image, not a tiny square browser icon.
const socialMark = await sharp(Buffer.from(source), { density: 288 }).resize({ width: 880 }).png().toBuffer();
await save('share/ogp.png', await sharp({ create: { width: 1200, height: 630, channels: 3, background } })
  .composite([{ input: socialMark, gravity: 'centre' }]).png().toBuffer());
console.log(JSON.stringify({ source: 'public/img/greentech-logo.svg', images: outputs, ico: icoSizes }, null, 2));
