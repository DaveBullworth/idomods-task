// PLAN.md §4, criteria 2 and 4: header hover and the burger menu.
import { test, expect } from '@playwright/test';
import { openPage, styleOf } from './helpers.js';

const INK = 'rgb(30, 30, 30)'; // --c-ink
const WHITE = 'rgb(255, 255, 255)';

test.describe('hover (desktop)', () => {
  test('turns solid after 250 ms and reverts on leave', async ({ page }) => {
    await openPage(page);
    const header = page.locator('[data-header]');
    expect(await styleOf(header, 'color')).toBe(WHITE);
    expect(await styleOf(header, 'opacity', '::before')).toBe('0');

    await page.hover('.header__logo');
    await page.waitForTimeout(300); // --dur-hover 250 ms + a frame
    expect(await styleOf(header, 'color')).toBe(INK);
    expect(await styleOf(header, 'opacity', '::before')).toBe('1');

    await page.mouse.move(960, 600);
    await page.waitForTimeout(300);
    expect(await styleOf(header, 'color')).toBe(WHITE);
    expect(await styleOf(header, 'opacity', '::before')).toBe('0');
  });
});

test.describe('burger menu (< 1280 px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test.beforeEach(async ({ page }) => {
    await openPage(page);
  });

  test('opens and closes, with aria-expanded', async ({ page }) => {
    const burger = page.locator('[data-menu-toggle]');
    const menu = page.locator('[data-menu]');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();

    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    // everything outside the header: skip link, main and footer
    for (const outside of ['.skip-link', 'main', 'footer']) {
      await expect(page.locator(outside)).toHaveJSProperty('inert', true);
    }

    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    for (const outside of ['.skip-link', 'main', 'footer']) {
      await expect(page.locator(outside)).toHaveJSProperty('inert', false);
    }
  });

  test('following a link closes it and focus returns to the burger', async ({ page }) => {
    const burger = page.locator('[data-menu-toggle]');
    await burger.click();
    await page.locator('.header__link').first().click();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(burger).toBeFocused();
  });

  test('Esc closes it and focus returns to the burger', async ({ page }) => {
    const burger = page.locator('[data-menu-toggle]');
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(burger).toBeFocused();
  });

  test('focus is trapped in the header while open', async ({ page }) => {
    await page.locator('[data-menu-toggle]').click();
    const inHeader = () =>
      page.evaluate(() => document.querySelector('[data-header]').contains(document.activeElement));

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      expect(await inHeader()).toBe(true);
    }
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await inHeader()).toBe(true);
    }
  });
});
