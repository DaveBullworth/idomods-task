// PLAN.md §4, criterion 1: hero slider timing and controls.
// page.clock drives requestAnimationFrame and performance.now, which the
// slider's clock uses (js/hero-slider.js). The clock is paused before the page
// loads, so no real time slips in while it loads: every millisecond the
// slider sees comes from runFor().
import { test, expect } from '@playwright/test';
import { openPage, activeSlide, fillScale } from './helpers.js';

const START = new Date('2026-01-01T12:00:00Z');

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: START });
  await page.clock.pauseAt(START);
  await openPage(page);
  // keep the cursor away from the controls (hover pauses autoplay)
  await page.mouse.move(960, 300);
});

test('changes slide at 3 s, with the progress bar full just before', async ({ page }) => {
  await page.clock.runFor(2900);
  expect(await activeSlide(page)).toBe(0);
  expect(await fillScale(page, 0)).toBeGreaterThan(0.95);

  await page.clock.runFor(200);
  expect(await activeSlide(page)).toBe(1);
  // the bar reset: the old segment is empty, the new one starts from 0
  expect(await fillScale(page, 0)).toBe(0);
  expect(await fillScale(page, 1)).toBeLessThan(0.05);

  await page.clock.runFor(3000);
  expect(await activeSlide(page)).toBe(0);
});

test('the crossfade is a 600 ms opacity transition', async ({ page }) => {
  await page.click('[data-slider-next]');
  const timing = await page.evaluate(async () => {
    const slide = document.querySelector('.hero__slide--active');
    const fade = slide.getAnimations().find((a) => a.transitionProperty === 'opacity');
    const endTime = fade.effect.getComputedTiming().endTime;
    await fade.finished;
    return { endTime, opacity: getComputedStyle(slide).opacity };
  });
  expect(timing.endTime).toBeLessThanOrEqual(600);
  expect(timing.opacity).toBe('1');
});

test('pauses while the mouse is over a control', async ({ page }) => {
  await page.hover('[data-slider-next]');
  await page.clock.runFor(6000);
  expect(await activeSlide(page)).toBe(0);

  await page.mouse.move(960, 300);
  await page.clock.runFor(3100);
  expect(await activeSlide(page)).toBe(1);
});

test('prev, next and the progress segments change the slide', async ({ page }) => {
  await page.click('[data-slider-next]');
  expect(await activeSlide(page)).toBe(1);
  await page.click('[data-slider-next]');
  expect(await activeSlide(page)).toBe(0);
  await page.click('[data-slider-prev]');
  expect(await activeSlide(page)).toBe(1);
  await page.locator('[data-slider-dot]').nth(0).click();
  expect(await activeSlide(page)).toBe(0);
  await expect(page.locator('[data-slider-dot]').nth(0)).toHaveAttribute('aria-current', 'true');
});

test('a manual change restarts the 3 s timer', async ({ page }) => {
  await page.clock.runFor(2000);
  await page.click('[data-slider-next]');
  await page.mouse.move(960, 300);
  await page.clock.runFor(2500);
  expect(await activeSlide(page)).toBe(1);
  await page.clock.runFor(600);
  expect(await activeSlide(page)).toBe(0);
});

test('the pause button stops and restarts autoplay', async ({ page }) => {
  const pause = page.locator('[data-slider-pause]');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(960, 300);
  await page.clock.runFor(6000);
  expect(await activeSlide(page)).toBe(0);

  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'false');
  await page.mouse.move(960, 300);
  await page.clock.runFor(3100);
  expect(await activeSlide(page)).toBe(1);
});
