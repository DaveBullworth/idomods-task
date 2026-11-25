// Builds optimized assets from assets/raw/ (never modified) into
// assets/img/, assets/icons/ and assets/fonts/. Output is committed, so the
// site works without Node. Run: npm run assets
import { readdir, readFile, writeFile, mkdir, rm, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { optimize } from 'svgo';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.join(ROOT, 'assets/raw');
const OUT_IMG = path.join(ROOT, 'assets/img');
const OUT_ICONS = path.join(ROOT, 'assets/icons');
const OUT_FONTS = path.join(ROOT, 'assets/fonts');

// Full-width / large photos: srcset with w descriptors (CLAUDE.md, PLAN.md §3.1).
const WIDE_WIDTHS = [640, 960, 1440, 1920, 2880];
const WIDE = [
  'hero-rock.png',
  'hero-interior.png',
  'tile-thoro.png',
  'tile-configurator.png',
  'tile-catalog.png',
  'tile-smart.png',
];
const PHOTO_QUALITY = 80;

// Lamps and small images: 1x / 2x density. `display` is the CSS width at 1x;
// when omitted, the source is treated as 2x (display = source / 2).
const DENSITY = [
  { glob: 'lamp1.png' },
  { glob: 'lamp2.png' },
  { glob: 'lamp3.png' },
  { glob: 'footer/payments/*.png' }, // 86x48 source -> 43x24
  { glob: 'footer/awards/*.png' }, // ~192x86 source -> ~96x43
  { glob: 'footer/flags/*.png', display: 24 }, // 64x64 source -> 24 / 48
  { glob: 'footer/idomods.png' }, // 196x72 -> 98x36
  { glob: 'footer/idosell.png' }, // 132x72 -> 66x36
];
const SMALL_QUALITY = 90;

// Icons: renamed where the raw name is unclear.
const ICON_RENAME = { 'union.svg': 'logo.svg', 'ci2.svg': 'shield.svg' };
// Icons that keep their own colours (multi-colour / gradients).
const ICON_KEEP_COLOURS = new Set(['star.svg']);

const FONTS = {
  'font.woff2': 'red-hat-display-latin.woff2',
  'font-latin-ext.woff2': 'red-hat-display-latin-ext.woff2',
};

const report = [];
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

async function record(file) {
  const { size } = await stat(file);
  report.push({ file: rel(file), size });
}

async function expand(glob) {
  if (!glob.includes('*')) return [path.join(RAW, glob)];
  const dir = path.join(RAW, path.dirname(glob));
  const ext = path.extname(glob);
  return (await readdir(dir))
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => path.join(dir, f));
}

function outPath(src, suffix) {
  const r = path.relative(RAW, src);
  const base = path.basename(r, path.extname(r));
  return path.join(OUT_IMG, path.dirname(r), `${base}${suffix}.webp`);
}

async function buildWide(name) {
  const src = path.join(RAW, name);
  const { width: srcW } = await sharp(src).metadata();
  // Never upscale. If the source falls between two list widths, add the source
  // width itself as the top candidate so 2x desktop still gets full detail.
  const widths = WIDE_WIDTHS.filter((w) => w <= srcW);
  if (srcW < WIDE_WIDTHS.at(-1) && !widths.includes(srcW)) widths.push(srcW);
  for (const w of widths) {
    const out = outPath(src, `-${w}`);
    await mkdir(path.dirname(out), { recursive: true });
    await sharp(src).resize({ width: w }).webp({ quality: PHOTO_QUALITY, effort: 6 }).toFile(out);
    await record(out);
  }
}

async function buildDensity({ glob, display }) {
  for (const src of await expand(glob)) {
    const { width: srcW } = await sharp(src).metadata();
    const w1 = display ?? Math.round(srcW / 2);
    for (const [suffix, w] of [
      ['@1x', w1],
      ['@2x', Math.min(w1 * 2, srcW)],
    ]) {
      const out = outPath(src, suffix);
      await mkdir(path.dirname(out), { recursive: true });
      await sharp(src)
        .resize({ width: w })
        .webp({ quality: SMALL_QUALITY, alphaQuality: 100, effort: 6 })
        .toFile(out);
      await record(out);
    }
  }
}

// svgo plugin: monochrome icons get fill/stroke = currentColor so CSS `color`
// drives them (needed for the header hover). Colours inside <mask>, <clipPath>,
// <defs> and gradients are left alone, or the masks would break.
const NO_RECOLOUR = new Set([
  'mask',
  'clipPath',
  'defs',
  'linearGradient',
  'radialGradient',
  'pattern',
]);
const currentColorPlugin = {
  name: 'toCurrentColor',
  fn: () => {
    let depth = 0;
    return {
      element: {
        enter(node) {
          if (NO_RECOLOUR.has(node.name)) depth++;
          if (depth > 0) return;
          for (const attr of ['fill', 'stroke']) {
            const v = node.attributes[attr];
            if (v && v !== 'none' && !v.startsWith('url(')) node.attributes[attr] = 'currentColor';
          }
        },
        exit(node) {
          if (NO_RECOLOUR.has(node.name)) depth--;
        },
      },
    };
  },
};

async function buildIcons() {
  const dir = path.join(RAW, 'icons');
  await mkdir(OUT_ICONS, { recursive: true });
  for (const f of (await readdir(dir)).filter((x) => x.endsWith('.svg')).sort()) {
    const svg = await readFile(path.join(dir, f), 'utf8');
    const plugins = ICON_KEEP_COLOURS.has(f) ? [] : [currentColorPlugin];
    plugins.push({
      name: 'preset-default',
      params: { overrides: { cleanupIds: { minify: true } } },
    });
    const { data } = optimize(svg, { path: f, multipass: true, plugins });
    const out = path.join(OUT_ICONS, ICON_RENAME[f] ?? f);
    await writeFile(out, data + '\n');
    await record(out);
  }
}

async function buildFonts() {
  await mkdir(OUT_FONTS, { recursive: true });
  for (const [from, to] of Object.entries(FONTS)) {
    const out = path.join(OUT_FONTS, to);
    await copyFile(path.join(RAW, from), out);
    await record(out);
  }
}

const kb = (n) => (n / 1024).toFixed(1).padStart(8) + ' KB';

await Promise.all(
  [OUT_IMG, OUT_ICONS, OUT_FONTS].map((d) => rm(d, { recursive: true, force: true })),
);
for (const name of WIDE) await buildWide(name);
for (const group of DENSITY) await buildDensity(group);
await buildIcons();
await buildFonts();

let total = 0;
for (const { file, size } of report) {
  total += size;
  console.log(`${kb(size)}  ${file}`);
}
console.log(`${kb(total)}  TOTAL (${report.length} files)`);
