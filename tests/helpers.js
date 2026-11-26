// Shared helpers for the spec files.

/** Load the page. The first-visit lamp hint is marked as seen unless asked. */
export async function openPage(page, { showHint = false } = {}) {
  if (!showHint) {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('sollux:lamp-hint-seen', '1');
      } catch {
        // storage blocked: the hint just shows
      }
    });
  }
  await page.goto('index.html');
}

/** A computed style value, optionally of a pseudo-element. */
export function styleOf(locator, property, pseudo = null) {
  return locator.evaluate(
    (el, [prop, pseudoEl]) => getComputedStyle(el, pseudoEl)[prop],
    [property, pseudo],
  );
}

/** Bounding box in CSS px (rounded to 0.01). */
export async function box(locator) {
  const b = await locator.boundingBox();
  const r = (n) => Math.round(n * 100) / 100;
  return { x: r(b.x), y: r(b.y), width: r(b.width), height: r(b.height) };
}

/** Index of the active hero slide. */
export function activeSlide(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-slide]')].findIndex((s) =>
      s.classList.contains('hero__slide--active'),
    ),
  );
}

/** The x scale of a progress segment's fill (1 = full). */
export function fillScale(page, index) {
  return page.evaluate((i) => {
    const fill = document.querySelectorAll('[data-slider-dot]')[i].firstElementChild;
    const transform = getComputedStyle(fill).transform;
    return transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a;
  }, index);
}
