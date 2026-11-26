// PLAN.md §4, criterion 7: axe finds no violations (desktop and mobile).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPage } from './helpers.js';

for (const [name, viewport] of [
  ['desktop', { width: 1920, height: 1080 }],
  ['mobile', { width: 375, height: 812 }],
]) {
  test(`no axe violations on ${name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openPage(page);
    // let the hero settle (crossfade / zoom) so contrast is measured at rest
    await page.locator('[data-slider-pause]').click();
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page }).analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(' ')),
    }));
    expect(summary).toEqual([]);
  });
}
