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
    const overlaps =
      b.x < text.x + text.width &&
      text.x < b.x + b.width &&
      b.y < text.y + text.height &&
      text.y < b.y + b.height;
    expect(overlaps, `lamp ${n} overlaps the hero text`).toBe(false);
  }
});
