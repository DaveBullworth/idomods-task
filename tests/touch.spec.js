// PLAN.md §4, criterion 11: on a touch device (no hover capability), tapping
// a tile or the header leaves no stuck hover state.
import { test, expect } from '@playwright/test';
import { openPage, styleOf } from './helpers.js';

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

test('the device reports no hover capability', async ({ page }) => {
  await openPage(page);
  expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
});

test('tapping a tile leaves no zoom or button overlay', async ({ page }) => {
  await openPage(page);
  for (let i = 0; i < 4; i++) {
    const tile = page.locator('.tile').nth(i);
    await tile.scrollIntoViewIfNeeded();
    await tile.locator('.tile__link').tap();
    await page.waitForTimeout(600); // longer than the zoom and overlay transitions
    expect(['none', '1']).toContain(await styleOf(tile.locator('.tile__img'), 'scale'));
    expect(await styleOf(tile.locator('.button'), 'opacity', '::before')).toBe('0');
  }
});

test('tapping the header leaves it transparent', async ({ page }) => {
  await openPage(page);
  const header = page.locator('[data-header]');
  await page.locator('.header__logo').tap();
  await page.waitForTimeout(400);
  expect(await styleOf(header, 'opacity', '::before')).toBe('0');
  expect(await styleOf(header, 'color')).toBe('rgb(255, 255, 255)');
});
