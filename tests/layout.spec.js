// PLAN.md §4, criterion 8: no horizontal scroll from 320 to 1920 px.
import { test, expect } from '@playwright/test';
import { openPage } from './helpers.js';

const WIDTHS = [320, 360, 375, 414, 480, 640, 768, 1024, 1280, 1366, 1440, 1600, 1920];

test('no horizontal overflow at any width', async ({ page }) => {
  await openPage(page);
  const failures = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (scrollWidth > clientWidth) failures.push(`${width}: ${scrollWidth} > ${clientWidth}`);
  }
  expect(failures).toEqual([]);
});
