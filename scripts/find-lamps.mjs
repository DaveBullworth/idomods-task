// One-off: find where lamp1-3.png sit inside hero-rock.png (PLAN.md §0.2).
// Brute-force masked image matching (mean absolute RGB difference over the
// pixels where the lamp is opaque), coarse-to-fine. Writes
// design/lamp-positions.json. Run: npm run find-lamps [-- --debug <dir>]
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.join(ROOT, 'assets/raw');
const HERO = 'hero-rock.png';
const LAMPS = ['lamp1.png', 'lamp2.png', 'lamp3.png'];
const OUT = path.join(ROOT, 'design/lamp-positions.json');
const BAD_SCORE = 10; // mean abs diff per channel (0-255) above this = flagged
const debugIdx = process.argv.indexOf('--debug');
const DEBUG_DIR = debugIdx > 0 ? path.resolve(process.argv[debugIdx + 1]) : null;

async function loadHero(factor) {
  const img = sharp(path.join(RAW, HERO)).removeAlpha();
  const { width, height } = await img.metadata();
  const w = Math.round(width / factor);
  const h = Math.round(height / factor);
  const { data } = await img
    .resize(w, h, { kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w, h, srcW: width, srcH: height };
}

// Lamp at a given scale and downscale factor: RGB + list of opaque pixel offsets.
async function loadLamp(file, scale, factor) {
  const img = sharp(path.join(RAW, file)).ensureAlpha();
  const { width, height } = await img.metadata();
  const w = Math.max(1, Math.round((width * scale) / factor));
  const h = Math.max(1, Math.round((height * scale) / factor));
  const { data } = await img
    .resize(w, h, { kernel: 'lanczos3', fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const idx = [];
  const rgb = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] > 127) {
        idx.push(y, x);
        rgb.push(data[i], data[i + 1], data[i + 2]);
      }
    }
  }
  return {
    w,
    h,
    idx: Int32Array.from(idx),
    rgb: Uint8Array.from(rgb),
    n: rgb.length / 3,
    srcW: width,
    srcH: height,
  };
}

// Masked mean abs diff at (ox, oy); stops early once it can't beat `best`.
function score(hero, lamp, ox, oy, best) {
  const limit = best * lamp.n * 3;
  let sum = 0;
  for (let k = 0, p = 0; k < lamp.n; k++, p += 3) {
    const y = lamp.idx[2 * k] + oy;
    const x = lamp.idx[2 * k + 1] + ox;
    const i = (y * hero.w + x) * 3;
    sum +=
      Math.abs(hero.data[i] - lamp.rgb[p]) +
      Math.abs(hero.data[i + 1] - lamp.rgb[p + 1]) +
      Math.abs(hero.data[i + 2] - lamp.rgb[p + 2]);
    if (sum > limit) return Infinity;
  }
  return sum / (lamp.n * 3);
}

async function search(file, hero, factor, scales, xr, yr) {
  let best = { s: Infinity };
  for (const scale of scales) {
    const lamp = await loadLamp(file, scale, factor);
    const x0 = Math.max(0, xr[0]);
    const x1 = Math.min(hero.w - lamp.w, xr[1]);
    const y0 = Math.max(0, yr[0]);
    const y1 = Math.min(hero.h - lamp.h, yr[1]);
    for (let oy = y0; oy <= y1; oy++) {
      for (let ox = x0; ox <= x1; ox++) {
        const s = score(hero, lamp, ox, oy, best.s);
        if (s < best.s) best = { s, x: ox, y: oy, scale, w: lamp.w, h: lamp.h };
      }
    }
  }
  return best;
}

const range = (a, b, step) => {
  const out = [];
  for (let v = a; v <= b + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
};

const t0 = Date.now();
const hero8 = await loadHero(8);
const hero2 = await loadHero(2);
const hero1 = await loadHero(1);
const results = [];

for (const file of LAMPS) {
  // 1. Coarse: 1/8 size, all positions, scales 0.90-1.10.
  const c = await search(file, hero8, 8, range(0.9, 1.1, 0.02), [0, Infinity], [0, Infinity]);
  // 2. Middle: 1/2 size, refine scale (step 0.005) around the coarse hit.
  const m = await search(
    file,
    hero2,
    2,
    range(c.scale - 0.02, c.scale + 0.02, 0.005),
    [c.x * 4 - 8, c.x * 4 + 8],
    [c.y * 4 - 8, c.y * 4 + 8],
  );
  // 3. Fine: full resolution, +-16 px around the middle hit, best scale.
  const f = await search(
    file,
    hero1,
    1,
    [m.scale],
    [m.x * 2 - 16, m.x * 2 + 16],
    [m.y * 2 - 16, m.y * 2 + 16],
  );

  const pct = (v, of) => Math.round((v / of) * 1e6) / 1e4;
  const r = {
    file: `assets/raw/${file}`,
    scale: f.scale,
    px: { x: f.x, y: f.y, w: f.w, h: f.h },
    percent: {
      left: pct(f.x, hero1.srcW),
      top: pct(f.y, hero1.srcH),
      width: pct(f.w, hero1.srcW),
      height: pct(f.h, hero1.srcH),
    },
    score: { coarse: +c.s.toFixed(2), middle: +m.s.toFixed(2), fine: +f.s.toFixed(2) },
    ok: f.s <= BAD_SCORE,
  };
  results.push(r);
  console.log(
    `${file}: x=${f.x} y=${f.y} w=${f.w} h=${f.h} scale=${f.scale} ` +
      `score coarse=${r.score.coarse} middle=${r.score.middle} fine=${r.score.fine}${r.ok ? '' : '  <-- FLAGGED'}`,
  );

  if (DEBUG_DIR) {
    // Difference crop: near-black where the lamp matches the photo.
    await mkdir(DEBUG_DIR, { recursive: true });
    const lampPng = await sharp(path.join(RAW, file))
      .resize(f.w, f.h, { fit: 'fill' })
      .png()
      .toBuffer();
    const crop = sharp(path.join(RAW, HERO)).extract({
      left: f.x,
      top: f.y,
      width: f.w,
      height: f.h,
    });
    await crop
      .clone()
      .composite([{ input: lampPng, blend: 'difference' }])
      .png()
      .toFile(path.join(DEBUG_DIR, `${path.basename(file, '.png')}-diff.png`));
  }
}

const json = {
  source: { file: `assets/raw/${HERO}`, width: hero1.srcW, height: hero1.srcH },
  method:
    'Masked mean absolute RGB difference (alpha > 0.5), 1/8 -> 1/2 -> full resolution. ' +
    'Score: 0 = identical, 255 = opposite. percent = share of the source image (= of the hero stage).',
  flagAbove: BAD_SCORE,
  lamps: results,
  manualTweaks: [],
};
await writeFile(OUT, JSON.stringify(json, null, 2) + '\n');
console.log(`Wrote ${path.relative(ROOT, OUT)} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
