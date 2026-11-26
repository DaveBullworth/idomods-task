// Lamp parallax (PLAN.md §3.3): lamps drift with the cursor, the nearest most,
// and return to rest; off on touch devices and under reduced motion.
// The viewport is taller than the hero (max 1080 px), so the cursor can leave
// the hero downwards without leaving the page.
import { test, expect } from '@playwright/test';
import { openPage, box } from './helpers.js';

const MAX_PX = 12; // --lamp-parallax at a 1920 px stage
const DEPTH = { 1: 0.55, 2: 0.8, 3: 1 }; // data-depth
const POOL = 0.3; // --lamp-parallax-pool

test.use({ viewport: { width: 1920, height: 1200 } });

async function positions(page) {
  const of = async (selector) => {
    const list = [];
    for (const n of [1, 2, 3]) list.push(await box(page.locator(selector(n))));
    return list;
  };
  return {
    lamps: await of((n) => `.lamp--${n}`),
    peeks: await of((n) => `.light--${n} .light__peek`),
    pools: await of((n) => `.light--${n} .light__pool`),
  };
}

const inlineParallax = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-lamp], [data-light]')].some((el) =>
      (el.getAttribute('style') || '').includes('--parallax'),
    ),
  );

test('lamps follow the cursor by depth, and the light with them', async ({ page }) => {
  await openPage(page);
  const rest = await positions(page);

  // left edge, vertical middle of the 1080 px hero: direction (-1, 0)
  await page.mouse.move(960, 540);
  await page.mouse.move(0, 540, { steps: 10 });
  await page.waitForTimeout(1500); // the follow settles in well under a second
  const moved = await positions(page);

  for (const n of [1, 2, 3]) {
    const i = n - 1;
    const dx = moved.lamps[i].x - rest.lamps[i].x;
    expect(dx).toBeCloseTo(-MAX_PX * DEPTH[n], 1);
    expect(moved.lamps[i].y - rest.lamps[i].y).toBeCloseTo(0, 1);
    // the diffuser glow moves with its lamp, the pool on the rock less
    expect(moved.peeks[i].x - rest.peeks[i].x).toBeCloseTo(dx, 1);
    expect(moved.pools[i].x - rest.pools[i].x).toBeCloseTo(dx * POOL, 1);
  }
});

test('lamps ease back to rest when the cursor leaves the hero', async ({ page }) => {
  await openPage(page);
  const rest = await positions(page);

  await page.mouse.move(1900, 100, { steps: 10 });
  await page.waitForTimeout(1500);
  expect(await inlineParallax(page)).toBe(true);

  await page.mouse.move(960, 1150, { steps: 10 }); // below the hero
  await page.waitForTimeout(100);
  const midway = await box(page.locator('.lamp--3'));
  expect(midway.x).not.toBeCloseTo(rest.lamps[2].x, 1); // eases, no jump

  await page.waitForTimeout(1500);
  expect(await positions(page)).toEqual(rest);
  expect(await inlineParallax(page)).toBe(false);
  await expect(page.locator('.hero')).not.toHaveClass(/hero--parallax/);
});

test.describe('off on touch devices', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

  test('no movement from pointer events', async ({ page }) => {
    await openPage(page);
    const rest = await positions(page);
    await page.mouse.move(20, 600, { steps: 5 });
    await page.mouse.move(350, 700, { steps: 5 });
    await page.tap('.lamp--2');
    await page.waitForTimeout(600);
    expect((await positions(page)).lamps).toEqual(rest.lamps);
    expect(await inlineParallax(page)).toBe(false);
  });
});

test('off under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openPage(page);
  const rest = await positions(page);
  await page.mouse.move(960, 540);
  await page.mouse.move(0, 540, { steps: 10 });
  await page.waitForTimeout(600);
  expect(await positions(page)).toEqual(rest);
  expect(await inlineParallax(page)).toBe(false);
});
