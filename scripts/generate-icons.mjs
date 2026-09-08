/**
 * Renders PNG app icons from the finalized flame path.
 *   npm run icons:generate
 * Outputs:
 *   public/icons/icon-192.png            (transparent, padded)
 *   public/icons/icon-512.png            (transparent, padded)
 *   public/icons/icon-maskable-512.png   (opaque cream bg, safe-zone flame)
 *   src/app/apple-icon.png               (opaque cream bg, padded)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const FLAME =
  'M25 0 C 11 21, 0 36, 3 56 C 5 68, 16 76, 25 76 C 34 76, 45 68, 47 56 C 49 46, 42 38, 39 41 C 39 50, 32 55, 28 50 C 23 43, 28 34, 19 23 C 14 32, 10 37, 10 42 C 5 37, 10 23, 25 0 Z';
const CREAM = '#f7f6f4';
const ORANGE = '#e8734a';

/** @param {{size:number, pad:number, bg?:string}} opts */
function svg({ size, pad, bg }) {
  // Flame artboard is 49x76; fit it into a (size - 2*pad) box, centered.
  const boxW = size - pad * 2;
  const boxH = size - pad * 2;
  const scale = Math.min(boxW / 49, boxH / 76);
  const w = 49 * scale;
  const h = 76 * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bg ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${bg}"/>` : ''}
    <g transform="translate(${x} ${y}) scale(${scale})">
      <path d="${FLAME}" fill="${ORANGE}"/>
    </g>
  </svg>`;
}

async function render(outPath, config) {
  await sharp(Buffer.from(svg(config))).png().toFile(outPath);
  console.log('wrote', outPath.replace(root + '/', ''));
}

await mkdir(join(root, 'public/icons'), { recursive: true });

await render(join(root, 'public/icons/icon-192.png'), { size: 192, pad: 20 });
await render(join(root, 'public/icons/icon-512.png'), { size: 512, pad: 54 });
await render(join(root, 'public/icons/icon-maskable-512.png'), {
  size: 512,
  pad: 110, // ~20% safe zone on each side
  bg: CREAM,
});
await render(join(root, 'src/app/apple-icon.png'), {
  size: 180,
  pad: 24,
  bg: CREAM,
});

// --- OpenGraph share image (1200x630) ---
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8734a"/>
      <stop offset="100%" stop-color="#d9522e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(558 120) scale(1.75)"><path d="${FLAME}" fill="#ffffff"/></g>
  <text x="600" y="410" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="92" font-weight="700" fill="#ffffff">betterdays</text>
  <text x="600" y="475" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#ffffff" opacity="0.92">Small steps. Better days.</text>
</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile(join(root, 'public/og.png'));
console.log('wrote public/og.png');

console.log('done');
