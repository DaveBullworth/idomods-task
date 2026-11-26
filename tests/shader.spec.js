// PLAN.md §4, criterion 6: the WebGL shader draws, animates, and falls back to
// the static CSS gradient without WebGL.
import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openPage, styleOf } from './helpers.js';

/** Screenshot of the canvas alone: section background and text hidden. */
async function canvasShot(page) {
  await page.addStyleTag({
    content: '.shader { background: #000 !important; } .shader__content { visibility: hidden; }',
  });
  return page.locator('[data-shader-canvas]').screenshot({ animations: 'allow' });
}

async function stats(png) {
  const { channels } = await sharp(png).stats();
  return {
    mean: (channels[0].mean + channels[1].mean + channels[2].mean) / 3,
    stdev: (channels[0].stdev + channels[1].stdev + channels[2].stdev) / 3,
  };
}

test('the canvas has a WebGL context and draws non-blank, moving pixels', async ({ page }) => {
  await openPage(page);
  const section = page.locator('[data-shader]');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveClass(/shader--ready/);

  const hasContext = await page
    .locator('[data-shader-canvas]')
    .evaluate((c) => c.getContext('webgl') !== null);
  expect(hasContext).toBe(true);

  const first = await canvasShot(page);
  const s = await stats(first);
  expect(s.mean).toBeGreaterThan(10); // not black
  expect(s.stdev).toBeGreaterThan(5); // not a flat colour

  await page.waitForTimeout(1000);
  const second = await page.locator('[data-shader-canvas]').screenshot({ animations: 'allow' });
  expect(first.equals(second)).toBe(false); // animating
});

test('without WebGL the static gradient shows, with no errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (/webgl/.test(type)) return null;
      return original.call(this, type, ...rest);
    };
  });
  await openPage(page);
  const section = page.locator('[data-shader]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await expect(section).not.toHaveClass(/shader--ready/);
  expect(await styleOf(page.locator('[data-shader-canvas]'), 'opacity')).toBe('0');
  expect(await styleOf(section, 'backgroundImage')).toMatch(/gradient/);
  expect(errors).toEqual([]);
});
