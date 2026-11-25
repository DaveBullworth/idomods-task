# SOLLUX landing page: working rules

Recruitment task: a static landing page for SOLLUX, built from a Figma design. The build plan and acceptance criteria are in `PLAN.md`.

## Stack
- Plain HTML, CSS and JS. No build step, no framework. `index.html` sits at the repo root.
- The page must work when `index.html` is opened directly (file://). JS uses classic `<script defer>` files, **not ES modules**.
- **Relative paths only** (`./assets/...`, `css/...`), never a leading `/`, because the site will be served from a GitHub Pages subfolder.
- Tooling is Node only. `package.json` holds devDependencies only: Playwright, @axe-core/playwright, Prettier, Stylelint, html-validate, sharp, svgo. The site never depends on `node_modules`.
- **Ask the user before adding any dependency** not listed here, dev or runtime.

## Sources of truth (highest first)
1. `design/NOTES.md`: the decisions there resolve conflicts and gaps in the spec.
2. `design/specs/comments.png`: the client's motion and interaction spec (in Polish).
3. Saved Figma responses in `design/figma/`.
4. Frame PNGs in `design/frames/`.

## Figma MCP (free plan, very limited)
- Before any Figma call, read `design/figma/LOG.md`. Never fetch something that's already saved.
- Use only the planned calls. Save every raw response to `design/figma/NN-<name>.<ext>` and add a row to the log in the same commit.
- `get_design_context` returns React + Tailwind. Use it for values (sizes, colours, type, spacing) and structure only; never copy its code in.

## Code conventions
- **BEM** class names: `block__element--modifier`. JS hooks use `data-*` attributes, not classes.
- Design tokens are CSS custom properties in `css/tokens.css`. Don't hard-code colours or durations elsewhere.
- Polish copy comes from Figma text nodes (`design/figma/`). Copy read only from a PNG is marked *to verify* in PLAN.md until it's checked against Figma or by the user. Every link is `href="#"`. The search form doesn't submit.
- Semantic HTML, visible focus styles, real `<button>`s for controls, `alt` text on content images (`alt=""` on decorative ones).

## Motion
- Hover: 200–250 ms. Larger moves: 500–800 ms.
- One easing everywhere: `cubic-bezier(0.4, 0, 0.2, 1)`. Scale-ups use ease-out.
- Animate only `transform` and `opacity`. The one exception (from NOTES.md) is the `color` transition on header text and icons. Background colour changes are done by fading an overlay's opacity.
- Hover effects go inside `@media (hover: hover)`, so touch devices don't get stuck hover states. Keyboard users get the same states through `:focus-visible` / `:focus-within`.
- `prefers-reduced-motion: reduce`: turn off transforms (scale, movement), slider autoplay and the shader animation. Short opacity fades are allowed.

## Assets
- `assets/raw/` is the untouched source. Never edit or delete files there.
- Optimized output is built by a Node script (`npm run assets`) into `assets/img/`, `assets/icons/` and `assets/fonts/`, and committed so the site works without Node:
  - images: sharp, **WebP only** (no AVIF, no PNG fallback).
    - Full-width / large photos (hero slides, tiles): widths **640, 960, 1440, 1920, 2880** (never above the source), used through `srcset` with `w` descriptors + `sizes`.
    - Lamps and small images (logos, flags, badges): **1x / 2x** density;
  - icons: svgo.
- Font: Red Hat Display, variable (wght 300–900). There are two files, `font.woff2` (latin) and `font-latin-ext.woff2` (Polish letters), with two `@font-face` rules using Google's `unicode-range` values. The page uses weights 500 and 700.

## Workflow
- Work directly on `master`, one small commit per section. No feature branches. Don't push unless asked.
- **Section done-check** (Playwright MCP screenshots):
  1. **1920 px:** compare with the matching frame PNG in `design/frames/`.
  2. **1280 and 1440 px** (the most common laptop widths, e.g. a 1920 screen at 150 % scaling is ~1280 CSS px): no frame either, so check that nothing overlaps (text vs. arrows, header row), nothing is cut off and icons stay consistent.
  3. **375 and 768 px:** there are no mobile frames, so check against the mobile decisions in `design/NOTES.md`: no horizontal overflow, nothing cut off, lamps in view.
  4. List the differences first, then fix them, then commit.
- Tests: never update snapshots or loosen thresholds without asking the user.
