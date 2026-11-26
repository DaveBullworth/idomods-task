// PLAN.md §4, criterion 9: no console errors or failed requests on load,
// over http and when index.html is opened directly (file://).
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

const FILE_URL = pathToFileURL(fileURLToPath(new URL('../index.html', import.meta.url))).href;

/** Load the page, scroll through it (lazy images load), collect problems. */
async function loadAndCollect(page, url) {
  const problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()} (${m.location().url})`);
  });
  page.on('requestfailed', (r) => problems.push(`failed: ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`);
  });

  await page.goto(url, { waitUntil: 'load' });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(100);
  }
  await page.waitForLoadState('networkidle');
  return problems;
}

test('over http', async ({ page }) => {
  expect(await loadAndCollect(page, 'index.html')).toEqual([]);
});

test('over file://', async ({ page }) => {
  expect(await loadAndCollect(page, FILE_URL)).toEqual([]);
});
