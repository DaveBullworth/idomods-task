// PLAN.md §4, criterion 10: prefers-reduced-motion. No autoplay, a still
// shader, and no transform transitions (opacity fades are allowed).
import { test, expect } from '@playwright/test';
import { openPage, activeSlide, styleOf } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

/** Running transitions/animations that move or scale something. */
const movingAnimations = (page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => /^(transform|scale|translate|rotate)$/.test(a.transitionProperty || ''))
      .map((a) => `${a.effect.target.className}: ${a.transitionProperty}`),
  );

test('no autoplay, and the pause button is hidden', async ({ page }) => {
  await page.clock.install();
  await openPage(page);
  await page.mouse.move(960, 300);
  await page.clock.runFor(10000);
  expect(await activeSlide(page)).toBe(0);
  await expect(page.locator('[data-slider-pause]')).toBeHidden();
});

test('a manual slide change fades without the scale-in', async ({ page }) => {
  await openPage(page);
  await page.click('[data-slider-next]');
  expect(await movingAnimations(page)).toEqual([]);
  const scales = await page
    .locator('.hero__img')
    .evaluateAll((imgs) => imgs.map((img) => getComputedStyle(img).scale));
  for (const s of scales) expect(['none', '1']).toContain(s);
});

test('tile hover does not zoom', async ({ page }) => {
  await openPage(page);
  const tile = page.locator('.tile').first();
  await tile.scrollIntoViewIfNeeded();
  await tile.hover();
  expect(await movingAnimations(page)).toEqual([]);
  await page.waitForTimeout(550);
  expect(['none', '1']).toContain(await styleOf(tile.locator('.tile__img'), 'scale'));
});

test.describe('burger menu', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('opens without sliding', async ({ page }) => {
    await openPage(page);
    const menu = page.locator('[data-menu]');
    const isIdentity = () =>
      menu.evaluate(
        (el) =>
          new DOMMatrixReadOnly(
            getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform,
          ).isIdentity,
      );
    expect(await isIdentity()).toBe(true);
    await page.locator('[data-menu-toggle]').click();
    expect(await movingAnimations(page)).toEqual([]);
    expect(await isIdentity()).toBe(true);
  });
});

test('no lamp flicker and no pulsing hint dot', async ({ page }) => {
  await openPage(page, { showHint: true });
  const keyframeAnimations = () =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => ['lamp-flicker', 'hint-pulse'].includes(a.animationName))
        .map((a) => a.animationName),
    );
  await expect(page.locator('[data-lamp-hint]')).toBeVisible();
  expect(await keyframeAnimations()).toEqual([]);
  await page.locator('.lamp--1').click();
  expect(await keyframeAnimations()).toEqual([]);
});

test('the shader shows a still frame', async ({ page }) => {
  await openPage(page);
  const canvas = page.locator('[data-shader-canvas]');
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const first = await canvas.screenshot({ animations: 'allow' });
  await page.waitForTimeout(1000);
  const second = await canvas.screenshot({ animations: 'allow' });
  expect(first.equals(second)).toBe(true);
});
