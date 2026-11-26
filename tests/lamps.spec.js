// PLAN.md §4, criterion 5 and the lamp light: toggling, alignment with the
// stage, the room dim, the first-visit hint and the headline easter egg.
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { openPage, styleOf, box } from './helpers.js';

const POSITIONS = JSON.parse(
  readFileSync(new URL('../design/lamp-positions.json', import.meta.url), 'utf8'),
).lamps.map((l) => l.percent);

// Lamp box vs. its reference position in the stage, in CSS px (proposed;
// sub-pixel rounding only, PLAN.md §4).
const ALIGN_TOLERANCE = 1;

const DIM = { 1: 0.06, 2: 0.11, 3: 0.15 }; // --lamp-dim-1/2/3 in tokens.css

const lamp = (page, n) => page.locator(`.lamp--${n}`);
const glow = (page, n) => page.locator(`.light--${n} .light__glow`);

test.describe('switching a lamp', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
    await page.locator('[data-slider-pause]').click();
  });

  for (const slide of [1, 2]) {
    test(`toggles aria-pressed and the glow on slide ${slide}`, async ({ page }) => {
      if (slide === 2) await page.locator('[data-slider-dot]').nth(1).click();

      for (const n of [1, 2, 3]) {
        await expect(lamp(page, n)).toHaveAttribute('aria-pressed', 'false');
        expect(await styleOf(glow(page, n), 'opacity')).toBe('0');

        await lamp(page, n).click();
        await expect(lamp(page, n)).toHaveAttribute('aria-pressed', 'true');
        await expect.poll(() => styleOf(glow(page, n), 'opacity')).toBe('1');

        await lamp(page, n).click();
        await expect(lamp(page, n)).toHaveAttribute('aria-pressed', 'false');
        await expect.poll(() => styleOf(glow(page, n), 'opacity')).toBe('0');
      }
    });
  }

  test('works with the keyboard (Enter and Space)', async ({ page }) => {
    await lamp(page, 1).focus();
    await page.keyboard.press('Enter');
    await expect(lamp(page, 1)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(lamp(page, 1)).toHaveAttribute('aria-pressed', 'false');
  });

  test('the room dims a little more with each lamp, and not at all with none', async ({ page }) => {
    const dim = page.locator('.hero__dim');
    expect(await styleOf(dim, 'opacity')).toBe('0');
    for (const n of [1, 2, 3]) {
      await lamp(page, n).click();
      await expect.poll(async () => Number(await styleOf(dim, 'opacity'))).toBeCloseTo(DIM[n], 3);
    }
    for (const n of [1, 2, 3]) await lamp(page, n).click();
    await expect.poll(() => styleOf(dim, 'opacity')).toBe('0');
    // the blended light layer is hidden again once nothing is lit
    await page.mouse.move(960, 1000);
    await expect
      .poll(() => styleOf(page.locator('.hero__stage--light'), 'visibility'))
      .toBe('hidden');
  });

  test('all three on: "w nowym świetle" glows (easter egg)', async ({ page }) => {
    const words = page.locator('.hero__glow');
    const glowOpacity = () => styleOf(words, 'opacity', '::after');

    await lamp(page, 1).click();
    await lamp(page, 2).click();
    await page.waitForTimeout(900);
    expect(await glowOpacity()).toBe('0');

    await lamp(page, 3).click();
    await expect.poll(glowOpacity).toBe('1');
    // the heading is still read once
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      /^Kolor i forma\s*w nowym świetle$/,
    );

    await lamp(page, 2).click();
    await expect.poll(glowOpacity).toBe('0');
  });
});

test('the switch-on flicker has a single dip, then stays steady', async ({ page }) => {
  await openPage(page);
  // opacity steps of the keyframes: up, one dip, back up to steady
  const steps = await page.evaluate(() => {
    const rule = [...document.styleSheets]
      .flatMap((s) => [...s.cssRules])
      .find((r) => r instanceof CSSKeyframesRule && r.name === 'lamp-flicker');
    return [...rule.cssRules].flatMap((k) =>
      k.keyText.split(',').map(() => Number(k.style.opacity)),
    );
  });
  const dips = steps.filter(
    (v, i) => i > 0 && i < steps.length - 1 && v < steps[i - 1] && v < steps[i + 1],
  );
  expect(dips).toHaveLength(1);
  expect(steps.at(-1)).toBe(1);
});

test('the hint dot pulses 3 times, then stops', async ({ page }) => {
  await openPage(page, { showHint: true });
  const iterations = await page.evaluate(
    () =>
      document
        .getAnimations()
        .find((a) => a.animationName === 'hint-pulse')
        .effect.getComputedTiming().iterations,
  );
  expect(iterations).toBe(3);
});

test('the first-visit hint goes after the first click and stays gone', async ({ page }) => {
  await openPage(page, { showHint: true });
  const hint = page.locator('[data-lamp-hint]');
  await expect(hint).toBeVisible();
  await lamp(page, 2).click();
  await expect(hint).toBeHidden();

  await page.reload();
  await expect(page.locator('[data-lamp-hint]')).toBeHidden();
});

for (const [width, height] of [
  [375, 812],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
]) {
  test(`lamps line up with their stage positions at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openPage(page);
    const stage = await box(page.locator('.hero__stage--lamps'));

    for (const [i, ref] of POSITIONS.entries()) {
      const b = await box(lamp(page, i + 1));
      expect(Math.abs(b.x - (stage.x + (ref.left / 100) * stage.width))).toBeLessThanOrEqual(
        ALIGN_TOLERANCE,
      );
      expect(Math.abs(b.y - (stage.y + (ref.top / 100) * stage.height))).toBeLessThanOrEqual(
        ALIGN_TOLERANCE,
      );
      expect(Math.abs(b.width - (ref.width / 100) * stage.width)).toBeLessThanOrEqual(
        ALIGN_TOLERANCE,
      );
    }
  });
}

test('at 375 the lamps are in view and clear of the hero text', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openPage(page);
  const text = await box(page.locator('.hero__inner'));
  for (const n of [1, 2, 3]) {
    const b = await box(lamp(page, n));
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(375);
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.y + b.height).toBeLessThanOrEqual(812);
    const overlaps =
      b.x < text.x + text.width &&
      text.x < b.x + b.width &&
      b.y < text.y + text.height &&
      text.y < b.y + b.height;
    expect(overlaps, `lamp ${n} overlaps the hero text`).toBe(false);
  }
});

// Review item 13: the lamp buttons are full image rectangles, and lamps 2 and
// 3 (later in the DOM, so on top) overlap lamp 1's box. Where lamp 1 is
// visible and the lamp on top is transparent, a click must still reach lamp 1.
for (const [width, height] of [
  [1920, 1080],
  [375, 812],
]) {
  test(`lamp 1's visible pixels next to lamps 2 and 3 click lamp 1 at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await openPage(page);
    await page
      .locator('.lamp__img')
      .evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())));

    const result = await page.evaluate(() => {
      // alpha of a lamp image at a viewport point (0 outside its box)
      const lamps = [1, 2, 3].map((n) => {
        const img = document.querySelector(`.lamp--${n} .lamp__img`);
        const r = img.getBoundingClientRect();
        const c = document.createElement('canvas');
        c.width = Math.round(r.width);
        c.height = Math.round(r.height);
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const { data } = ctx.getImageData(0, 0, c.width, c.height);
        return {
          r,
          alpha(x, y) {
            const i = Math.floor(x - r.x);
            const j = Math.floor(y - r.y);
            if (i < 0 || j < 0 || i >= c.width || j >= c.height) return 0;
            return data[(j * c.width + i) * 4 + 3];
          },
        };
      });
      const [one, ...above] = lamps;
      const VISIBLE = 128;
      const step = Math.max(2, Math.round(one.r.width / 120));
      let sampled = 0;
      const wrong = [];
      for (let y = one.r.top + 1; y < one.r.bottom - 1; y += step) {
        for (let x = one.r.left + 1; x < one.r.right - 1; x += step) {
          if (one.alpha(x, y) < VISIBLE) continue;
          // only where another lamp's box overlaps but its pixel is clear
          const covering = above.filter(
            (l) => x >= l.r.left && x < l.r.right && y >= l.r.top && y < l.r.bottom,
          );
          if (!covering.length || covering.some((l) => l.alpha(x, y) > 0)) continue;
          sampled++;
          const hit = document.elementFromPoint(x, y)?.closest('[data-lamp]');
          if (!hit?.classList.contains('lamp--1')) {
            wrong.push(`${Math.round(x)},${Math.round(y)} -> ${hit ? hit.className : 'no lamp'}`);
          }
        }
      }
      return { sampled, wrong: wrong.slice(0, 10), wrongCount: wrong.length };
    });

    expect(result.sampled, 'no sample points in the overlaps').toBeGreaterThan(0);
    expect(result.wrong, `${result.wrongCount} of ${result.sampled} points`).toEqual([]);
  });
}
