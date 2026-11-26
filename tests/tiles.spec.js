// PLAN.md §4, criterion 3: tile hover. The zoom uses the individual `scale`
// property (css/tiles.css), so that's what is read here.
import { test, expect } from '@playwright/test';
import { openPage, styleOf } from './helpers.js';

test('hover zooms the image to 1.1 and fades in the button overlay', async ({ page }) => {
  await openPage(page);
  const tiles = page.locator('.tile');
  await expect(tiles).toHaveCount(4);

  for (let i = 0; i < 4; i++) {
    const tile = tiles.nth(i);
    const img = tile.locator('.tile__img');
    const button = tile.locator('.button');
    await tile.scrollIntoViewIfNeeded();
    expect(['none', '1']).toContain(await styleOf(img, 'scale'));
    expect(await styleOf(button, 'opacity', '::before')).toBe('0');

    await tile.hover();
    await page.waitForTimeout(550); // --dur-tile 500 ms + a frame
    expect(await styleOf(img, 'scale')).toBe('1.1');
    expect(await styleOf(button, 'opacity', '::before')).toBe('1');

    await page.mouse.move(0, 0);
    await page.waitForTimeout(550);
    expect(await styleOf(img, 'scale')).not.toBe('1.1');
  }
});

test('the button overlay is the grey #4A4A4A', async ({ page }) => {
  await openPage(page);
  const button = page.locator('.tile .button').first();
  expect(await styleOf(button, 'backgroundColor', '::before')).toBe('rgb(74, 74, 74)');
});
