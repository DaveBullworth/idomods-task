# Build plan: SOLLUX landing page

The rules are in `CLAUDE.md`. Values marked **TBD #N** come from Figma call N (see `design/figma/LOG.md`) and aren't guessed until then.

## 0. Layout facts already known (Figma call #1, 1920 px frame)

- Page 1920 × 4048. Sections:
  - hero 1080
  - VP's 1424
  - shader "screen" 835
  - footer 709
- Content column: **1600 px wide at x = 160**, so 160 px side gutters at 1920.
- VP's: content starts 86 px from the top of the section.
  - Benefits row: 5 items, each 294.4 wide with 32 px gaps; 136 high with 16 px padding; 32 px icon; text block 72 px from the top; titles 23 px tall, subtitles 17 px tall, 8 px between them.
  - Tile grid starts **286** px from the top of the section (86 + 136 benefits + 64 gap; was noted as 200, corrected after call #4). Tile rows are 518 px high, with a 16 px gap between and within rows.
  - Row 1: THORO 648 + Konfigurator 936.
  - Row 2: Katalog 936 + SOLLUX SMART 648.
  - Tile text block: 48 px padding; eyebrow 23 px, 12 px gap, title 35 px per line; 24 px to the button.
  - Button: 51 px high with 24 px horizontal padding.
- Footer:
  - Top row: 96 px from the top; logo block 198 wide; link columns start at x = 541 inside the 1600 column; column headings 14 px with 38 px to the first link; links on a 28 px step.
  - Bottom row: three 512 px columns with a 32 px gap (payments 5×2 at 57×36 cells with 8 px gaps, awards 3×2, 8 flags of 32 px on a 40 px step).
  - Caption: VAT line + divider + IdoMods (98×36) / IdoSell (66×36) logos, then a contact line.
- The hero (1:506) came back as a `<frame>` with **no children**, and the shader section (1:707) is a single `<rounded-rectangle>` (image-only). Header, hero text, slider controls and rating badge: see §0.3 (call #3). Lamp positions: §0.2.
- The file has **no Figma variables** (call #2 returned `{}`).

## 0.1 Confirm the node for call #3 (before spending it)

- The user's link to the "HERO Baner" layer (`node-id=1-506`) matches `1:506` in `01-metadata-full.xml`. So the ID is right; the problem is that `get_metadata` didn't return the hero's children, although Figma shows Container › Content › Title / Button / Circle button.
- Evidence the children exist: IDs `1:507`–`1:592` (86 IDs) are missing from the metadata, between the hero `1:506` and VP's `1:593`.
- **Confirmed by the user in Figma:** `1:506` contains **Navbar**, **Container** (eyebrow, title, button), two **Circle buttons** (arrows), **Progress bar** and **Trustmate badge** (the rating badge). The header is a sibling of Container.
- **Decision:** spend call #3 on **`1:506` itself**. Calling it on Container would lose the navbar, arrows, progress bar and badge.
- **Lamps are not in `1:506`.** The lamp layers (lampa1–3) sit on the canvas next to the page; on the page the lamps are baked into the background image. Call #3 won't give lamp positions; see §0.2.

## 0.2 Lamp positions: found by image matching, not by Figma

- One-off script `scripts/find-lamps.mjs`, using sharp. It runs after the tooling step (§3.1) has installed sharp.
- What it does:
  1. Load `hero-rock.png` (3840×2160) and each `lamp{1,2,3}.png`, with the lamp's alpha channel as a mask.
  2. **Coarse search:** downscale everything by 8 (the hero becomes 480×270). Brute-force every x/y offset and compute the masked mean absolute RGB difference, counting only pixels where lamp alpha > 0.5. Also try lamp scales 0.9–1.1 in 0.02 steps, in case the PNGs aren't exactly at background scale. Keep the best scale and position per lamp.
  3. **Refine** at full resolution in a ±16 px window around the coarse hit, at the best scale.
  4. Print and write `design/lamp-positions.json`: for each lamp, x/y/w/h in source px **and** in % of 3840×2160 (left, top, width), plus the match score. A high score means a bad match; it gets flagged, not silently used.
- Check by eye:
  - Place the lamps in the stage from the JSON.
  - Take Playwright screenshots at 1920 and 375 with the overlays at full opacity, plus a difference view (`mix-blend-mode: difference` on the lamp layer, debug only). Aligned lamps come out almost black.
  - Hand-tune if needed and record any tweak in the JSON.
- The script and the JSON are committed; the script is not part of `npm run assets`.
- Colours and type scale: hero and header known from #3 (§0.3); VP's and footer **TBD #4–#5**. From the comments spec: tile button hover `#4A4A4A`, header hover background `#FFFFFF`.

## 0.3 Header + hero facts (Figma call #3, `03-design-context-hero.tsx`)

**Colours seen so far**
| Token | Value | Used for |
|---|---|---|
| `--c-yellow` | `#F2BF25` | hero CTA background, active progress segment |
| `--c-ink` | `#1E1E1E` | text on yellow buttons |
| `--c-black` | `#101011` | base of the translucent controls (arrows at 20 %, badge at 40 %) |
| `--c-line` | `#E7E7E7` | search border; progress track at 50 % opacity |
| `--c-white` | `#FFFFFF` | all hero/header text and icons |

**Type** (Red Hat Display, confirmed Medium 500 + Bold 700 only)
| Role | Weight | Size / line-height |
|---|---|---|
| Hero eyebrow | 500 | 16 / 1.2 |
| Hero H1 | 700 | 56 / 1.0, two explicit lines |
| Button (hero CTA) | 700 | 16 / 1.2 |
| Nav link, search placeholder | 700 | 14 / 1.2 |
| "Stwórz swoją lampę" | 700 | 13 / 1.1 |
| Badge rating "4.8" | 700 | 21 / 1.1 |
| Badge label | 500 | 13 / 1.1 |

**Navbar (1:533):**
- Absolutely positioned at the top, with no background in the default state.
- 16 px padding; content max-width 1600, centred. Three groups with 64 px gaps:
  1. **Logo + links:** logo box 150 × 48 (`union.svg` is 150 × 22, so it's centred vertically), then 64 px to the links. Links have 32 px gaps; the three with a dropdown arrow have a 16 px `angle-down` with a 4 px gap.
  2. **Search pill:** takes the remaining width (`flex: 1`); 1 px `#E7E7E7` border; radius 100; padding 16 / 24; placeholder with 16 px gap to a 20 px search icon. Height is about 51.
  3. **Icons:** 8 px gaps. "Konfigurator" pill: padding 11 / 16, 9 px gap, 20 px cube. User and cart are 48 px circles with 24 px icons.
- Navbar height is about 83 px (16 + 51 + 16).

**Hero content (Container 1:507):**
- Max-width 1600 with 16 px side padding on the hero and 64 px vertical padding.
- **Vertically centred** in the 1080 frame, left-aligned.
- Gaps: eyebrow → H1 16 px; title block → CTA 32 px.
- CTA: padding 16 / 24, radius 100.

**Arrows (1:514, 1:517):**
- 48 px circles, background `rgba(16,16,17,0.2)`, 24 px white arrow icons.
- 72 px from the left/right edges, vertically centred (the left one is `top: 516` = 540 − 24).
- While the arrows show (≥ 1024 px), the hero text column is `min(100% − 2 × (72 + 48 + 24), 1600)`, so the text starts at least 24 px clear of the arrow. At 1920 the 1600 column wins (text at 160, 40 px clear, as in Figma); at 1024–1919 the text starts at 144.

**Progress bar (1:520):**
- 2 segments of 64 × 2 px with a 4 px gap, centred, 32 px from the bottom.
- Active segment `#F2BF25`, track `rgba(231,231,231,0.5)`.
- The active segment's yellow fill is the `scaleX` element.

**Trustmate badge (1:524):**
- 32 px from the bottom, 72 px from the right. Background `rgba(16,16,17,0.4)`, radius 100, padding 12 / 24, 12 px gap.
- "4.8" + 20 px star (2 px gap): `star.svg` already has its own orange gradient, so no recolouring.

**Not in Figma:** slide 2 (the frame has one background image), lamp positions (§0.2), any hover/open state of the header.

## 1. File layout

```
index.html
favicon.svg
css/  tokens.css base.css header.css hero.css benefits.css tiles.css shader.css footer.css
js/   header.js menu.js hero-slider.js lamps.js lamp-parallax.js shader.js      (classic <script defer>)
assets/raw/  (source, untouched)
assets/img/  assets/icons/  assets/fonts/  (built by npm run assets, committed)
scripts/build-assets.mjs
tests/       (Playwright, written after the page is built)
```

- Each JS file is an IIFE that runs only if its section is present. There are no globals except a small `window.SOLLUX` namespace if two files need to talk to each other (the slider tells lamps.js which slide is active).
- Add `.gitattributes` with `* text=auto eol=lf`, because git warns about CRLF conversion on this Windows checkout.

## 2. `<head>`

- `<html lang="pl">`, charset, viewport, `<title>`, meta description.
- `<meta name="robots" content="noindex">`, since the page is a copy of a real shop.
- `<link rel="preload" as="image" type="image/webp" imagesrcset="hero-rock-640.webp 640w, ...-960w, ...-1440w, ...-1920w, ...-2880w" imagesizes="(max-aspect-ratio: 16/9) calc(100svh * 16 / 9), 100vw" fetchpriority="high">` for the first hero slide.
  - `imagesizes` must match the stage width, because the stage covers the hero. It must also be identical to the slide `<img sizes>` so the preload gets reused.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` for `assets/fonts/font.woff2` (latin). latin-ext loads on demand through `unicode-range`.
- CSS in `<link>` tags in section order; JS with `defer` at the end of `<head>`.
- `favicon.svg`: the "S" from `union.svg`.
- `loading="lazy"` + `decoding="async"` on every image below the fold: tiles, benefit icons, footer logos, flags, badges. Hero images load eagerly; slide 1 gets `fetchpriority="high"`.

## 3. Sections, in commit order

### 3.1 Tooling + tokens + base

- `package.json` devDependencies, Prettier/Stylelint/html-validate configs, `scripts/build-assets.mjs`:
  - sharp, full-width / large photos (both hero slides, all four tiles): WebP at **640, 960, 1440, 1920, 2880 w**. Skip widths larger than the source (the tiles are 1296 or 1872 px wide, so they stop there). Use `srcset` with `w` descriptors plus `sizes`, so phones with DPR 3 don't download the 3840 file.
    - Tile `sizes` (16 px gutter, so the content column is `min(100vw - 32px, 1600px)`; a desktop row is that column minus the 16 px gap, split 648 : 936 of 1584):
      - narrow tiles (THORO, SMART, 648 at 1920): `(min-width: 1024px) calc((min(100vw - 32px, 1600px) - 16px) * 0.4091), <one-column value>`;
      - wide tiles (Konfigurator, Katalog, 936 at 1920): `(min-width: 1024px) calc((min(100vw - 32px, 1600px) - 16px) * 0.5909), <one-column value>`;
      - below 1024 the value is the rendered (cover-cropped) image width, see §3.6: THORO `max(100vw - 32px, clamp(440px, 60vw, 520px) * 1.251)`; SMART `calc(100vw - 32px)`; wide tiles `(min-width: 640px) calc((100vw - 32px) * 1.017), calc((100vw - 32px) * 1.355)`.
      - desktop, final (3-column grid, see §3.6): narrow `max((min(100vw - 32px, 1600px) - 32px) * 0.4133, 450px)`, wide `max((min(100vw - 32px, 1600px) - 32px) * 0.5867 + 16px, 650px)`; the 450/650 floors are the cover width at the 360 px minimum row height. Verified: every tile picks a file at least as large as its rendered size × DPR (capped by the 1296/1872 sources).
      - (Was `min(100vw, 1920px) - 320px`, written for the old 160 px gutter.)
  - sharp, lamps and small images (payment/award logos, flags, IdoMods/IdoSell badges): WebP at **1x and 2x** density;
  - svgo for icons;
  - copy fonts.
- `tokens.css`:
  - colours;
  - motion: `--dur-hover: 250ms`, `--dur-button: 200ms`, `--dur-fade: 600ms`, `--dur-zoom: 800ms`, `--dur-tile: 500ms`, `--ease: cubic-bezier(0.4,0,0.2,1)`, `--ease-out`;
  - layout: `--container: 1600px`, `--gutter: clamp(16px, 8.33vw, 160px)`.
- `base.css`: `@font-face` ×2, reset, `.container`, `.visually-hidden`, focus ring, button base, and a `prefers-reduced-motion` block that removes transform transitions and animations but keeps short opacity fades.

### 3.2 Header (`.header`)

- Absolutely positioned over the hero, transparent, white text and icons.
- Items: logo, nav (Lampy ▾, Kolory ▾, Pomieszczenia ▾, Nowości, Bestsellery, Promocje), search pill, "Stwórz swoją lampę" link with the cube icon, user icon, cart icon. Per NOTES, the arrows are decoration only and there are no dropdowns.
- Hover: `.header::before` (white) fades `opacity 0 → 1`. Text, icons and logo transition `color` white → black; SVGs use `currentColor`. All 250 ms ease-in-out, and the same timing on leave. **(built)**
- Hover only applies with `(hover: hover)`. The same solid state also applies on keyboard focus (`.header:has(:focus-visible)`, not `:focus-within`, so a mouse click on a link doesn't leave the header stuck white) and while the burger panel is open (`.header--open`).
- Below **1280 px** (moved from 1024 by user decision; the full row doesn't fit below ~1300): logo + cart + burger. Nav, search, configurator and account go into the burger panel. **(built)**
  - One set of markup: `.header__menu` (`#header-menu`) wraps nav, search and `.header__menu-actions` (configurator, account). From 1280 it's a flex part of the row (a negative end margin keeps the 8 px gap before the cart); below 1280 it's the panel. Nothing is duplicated.
  - The panel is full-screen white under the bar, slides in from the right with `transform` (500 ms, `--dur-move`) plus an opacity fade; under reduced motion it's the fade only. The burger morphs into an X in step. `visibility` flips after the slide-out so the closed panel is out of the tab order.
  - Burger: `aria-expanded` / `aria-controls="header-menu"`, constant label "Menu". Opening focuses the first link; Tab cycles through the bar and the panel; everything outside the header is `inert`; Esc closes and returns focus to the burger; following a link closes; widening past 1280 closes. Scroll lock: `html:has(.header--open) { overflow: hidden }`.
  - In the panel the account icon shows its label "Moje konto" (on desktop the label is visually hidden and is the link's accessible name), and both panel icons are 24 px so the labels line up.
- Sizes and spacing: §0.3. The header row uses 16 px side padding with a max width of 1600 (as in Figma), not a wider page gutter. Group gaps `clamp(16px, 3.33vw, 64px)`, link gaps `clamp(12px, 1.67vw, 32px)`; the search pill takes the remaining width. From 1280 to 1439 the configurator is icon-only (label kept for screen readers). Measured search width: 270 px at 1280–1439, 374 px at 1920.

### 3.3 Hero stage (`.hero`, `.hero__stage`)

- `.hero` uses `--hero-h: clamp(560px, 100svh, 1080px)`, with `height: var(--hero-h)`, `overflow: hidden` and `position: relative`. `svh`, not `vh`, so the hero doesn't jump when the mobile browser bar shows or hides.
- `.hero__stage` has `aspect-ratio: 1920 / 1080` and covers the hero like `object-fit: cover`:
  - `width: max(100%, var(--hero-h) * 16 / 9)`; the height comes **only** from `aspect-ratio`. Never derive it as `calc(var(--stage-w) * 9 / 16)`: inside `height` the `100%` resolves against the hero's height, which squashed the photo on viewports wider than 16:9 (bug found at 1280 × 633, fixed);
  - centred with `left: 50%; transform: translateX(calc(-50% + var(--stage-x, 0%)))`.
- Inside the stage, all absolutely positioned in % of the stage:
  - `.hero__slide` ×2 (`hero-rock-clean`, `hero-interior`), stacked. Neither photo has lamps in it: slide 1 uses `hero-rock-clean.png`, the rock photo with the lamps removed (user-made in Figma, see NOTES.md);
  - `.hero__stage--lamps` above both slides, containing three `<button class="lamp lamp--N" aria-pressed>` elements, each holding its lamp image. The light lives in separate layers (below).
- **Lamp positions:** left/top/width in % of the stage, taken from `design/lamp-positions.json` (§0.2). They aren't from Figma; the lamps aren't in the hero frame. For reference, the PNGs at 2× are 744×838, 940×856, 846×786, which is 372×419, 470×428, 423×393 at 1920, if the match confirms scale 1.0.
- **Both slides:** the lamp images are always visible and never fade or zoom; only the backgrounds crossfade and zoom underneath them. (Earlier the lamps were baked into the rock photo and the overlays were handed off by opacity, which showed the lamps twice during transitions: a dip mid-crossfade on 1 → 2, and the baked lamps zooming into the overlays on 2 → 1.)
- **Lamp light on click (built, option B with a light dim; user-approved; `css/lamps.css`, `js/lamps.js`):**
  - Layers, bottom to top: slides → lamps → `.hero__dim` → `.hero__stage--light` (screen blend) → text. Per lamp, `.light--N` holds a hover/focus glow (`.light__peek`) and the light group (`.light__glow`: diffuser disc, halo, cone, pool on the rock). Geometry is in % of the 1920:1080 stage, read from the lamp PNGs, so it scales at every width.
  - Switching on: a 450 ms opacity flicker, then steady; off: a 300 ms fade. Reduced motion: a plain 600 ms fade both ways, no flicker.
  - Room dim deepens per lamp: `--lamp-dim-1/2/3` = 0.06 / 0.11 / 0.15 in `tokens.css` (tunable). With no lamp on the dim is 0 and the light layer is `visibility: hidden` (a blended layer switches nearby text to greyscale anti-aliasing), so the hero is pixel-identical to before (verified: 0 differing pixels, also after switching a lamp on and off).
  - Slide 2: diffuser glow and cones work the same; the pools fade out with the crossfade (there's no rock), keyed on the active slide in CSS.
  - Discoverability: pointer cursor; faint diffuser glow on hover and keyboard focus; first-visit pill "Kliknij lampę" next to lamp 2 (under it in the portrait layout), hidden after the first click and remembered in `localStorage` (try/catch). The pill is `aria-hidden`; the buttons already say "Włącz lampę 1–3".
  - Easter egg: all three on → "w nowym świetle" glows warm (a copy of the words fades in on top; its generated text is hidden from assistive tech with `content: attr(data-text) / ""`).
  - Motion rules: only opacity animates (the light groups, the peek, the dim, the headline glow); the blurred / clipped shapes are static and the blend sits on a layer that never animates.
- **Lamp parallax (built; `js/lamp-parallax.js`, user-specified):**
  - With a mouse, each lamp is offset towards the cursor: the cursor's position in the hero mapped to −1…1 per axis (clamped to the unit circle) × `--lamp-parallax` (12 px at a 1920 px stage, scaled with the stage width) × the lamp's `data-depth` (lamp 3, the nearest: 1; lamp 2: 0.8; lamp 1: 0.55).
  - The script writes `--parallax` on each lamp button and its `.light--N` group, applied as `translate` (transform only), so the peek, glow and cone move with the lamp. `--parallax-pool` pulls the pool back so it moves `--lamp-parallax-pool` (0.3) of its lamp's offset.
  - Smoothing: an exponential follow (time constant 160 ms) in a requestAnimationFrame loop that runs only while something still moves; scrolling re-evaluates, since the hero moves under a still cursor. Leaving the hero (or the window) eases the lamps back to rest; at rest the inline properties are removed, so the hero is pixel-identical to the static layout (verified: 0 differing bytes after moving and leaving).
  - Only with `(hover: hover) and (pointer: fine)` and pointer type `mouse`; off under reduced motion.
  - Performance: moving the blurred light shapes repainted them every frame (with all lamps on at 1920, every other frame was dropped). While moving, `.hero--parallax` sets `will-change: translate` on the lamps, light groups and pools; after that, frame times are the same as without parallax (6.9 ms, the display rate). The class goes at rest, and so do the extra layers.
  - Slide changes don't touch the offsets: checked frame by frame at 1280 × 633, DPR 1.5 with the cursor parked in the hero.
- Lamps are `<button aria-pressed>` with a Polish `aria-label` ("Włącz lampę 1").
- **Portrait screens (`max-aspect-ratio: 5/4`), "contained mode":** shifting a covering stage can't work, because at 375 × 812 the covering stage is 1443 px wide and the lamp group alone is 848 px. Instead:
  - the stage is sized so the lamp group (58.75 % of the stage) fits the viewport minus the gutters, and anchored to the bottom, centred on the lamp group;
  - above it, the slide's sky colour (sampled from the photo's top edge: rock `#9c6744`, unchanged in the clean photo, interior `#c5afa3`) fills the hero, and the stage image fades in over its top 25 %;
  - slide 2 adds a 45 % dark scrim behind the text, since white on `#c5afa3` is only about 2.1:1;
  - the text sits at the top under the header; its bottom padding reserves the stage height, so the hero grows instead of overlapping on short screens.
  - Measured at 375 × 812: text block y 104–365, lamps y 509–735, all within x 16–359.
- Hero text: eyebrow "Bestsellery SOLLUX", H1 "Kolor i forma" / "w nowym świetle" (two lines, line break kept at desktop), yellow pill CTA "Sprawdź bestsellery". _(verified against #3, nodes 1:510, 1:511, 1:513)_
- Text block is vertically centred and left-aligned on the 1600 column (§0.3). In contained mode it sits at the top and the lamps below it (see above). Below 1024 the Trustmate badge joins the text flow under the CTA, because at the bottom it would collide with the progress bar.
- Rating badge bottom right: "4.8" + star icon + "Uwielbiany przez klientów". _(verified against #3, nodes 1:526, 1:532)_
- Header copy: Lampy, Kolory, Pomieszczenia, Nowości, Bestsellery, Promocje; search placeholder "Czego szukasz?"; "Stwórz swoją lampę". _(verified against #3)_
- Prev/next round arrow buttons at the sides: sizes and colours in §0.3. Below 1024 px they're hidden (user-approved, §5); swipe and the progress segments (64 × 44 px tap areas) take over.

### 3.4 Slider (`hero-slider.js`)

**(built: `js/hero-slider.js`, JS hooks are `data-slider*` / `data-slide`)**
- Autoplay: a new slide every 3 s (`--slide-interval`, read from CSS).
- Crossfade: opacity, 600 ms ease-in-out.
- Incoming image: `scale 1.05 → 1` over 800 ms ease-out. The outgoing image keeps scale 1 until its fade-out has finished, then waits at 1.05 out of sight. Zoom origin is the image centre.
- **Lamps:** not part of the slides, so the slider doesn't touch them. Checked frame by frame in both directions at 1280 × 633, DPR 1.5: the lamp pixels are identical in every frame.
- Progress bar: one segment per slide at the bottom centre. The active one fills yellow with `transform: scaleX(0 → 1)`, linear over 3 s, and resets on slide change. It is driven from the same rAF clock as the slide change, so the bar and the switch can't drift. Clicking a segment goes to that slide.
- Prev/next buttons; keyboard ←/→ while focus is inside the hero; touch swipe (≥ 50 px, horizontal; the hero has `touch-action: pan-y`). Manual changes restart the 3 s timer.
- **Pause** (changed from "hover on the hero"): while the mouse is over a control (arrows, progress), while **keyboard** focus is inside the hero (`:focus-visible`, so a mouse click doesn't stop autoplay), while the tab is hidden, and while the hero is off-screen (IntersectionObserver). Pausing on hover over the whole hero would stop autoplay for most desktop visitors, because the hero fills the first screen and the cursor usually rests on it. (User-approved.)
- **Pause/play toggle** (WCAG 2.2.2, user-approved): a 44 × 44 button just right of the segments, styled like the bar (white 16 px icon, no background), positioned outside the centred group so the segments stay centred. Constant `aria-label` "Wstrzymaj automatyczne przewijanie" with `aria-pressed` (true = paused; the icon switches pause ↔ play). Once used, the toggle overrides the hover/focus pauses, so "play" works even while keyboard focus is still on it. It renders `hidden` and is shown by JS; under reduced motion it stays hidden, because there's no autoplay to pause.
- Timing uses `requestAnimationFrame` + `performance.now`, which `page.clock` controls (verified: slide changes at exactly 3.0 s; the bar is at 0.49 at 1.5 s).
- `aria-roledescription="karuzela"`, slides labelled "1 z 2" with `aria-hidden` on the inactive one, `aria-live="off"`, `aria-current` on the active segment.
- Reduced motion: no autoplay and no scale-in; manual slide changes still crossfade (opacity). The progress bar **stays visible** as a static indicator (active segment full), because below 1024 px its segments are the only slide controls besides swipe.

### 3.5 Benefits (`.benefits`) **(built; values from Figma #4)**

- Section wrapper `.vps`: 86 px vertical padding (48 on phones), 16 px gutter, 1600 max, 64 px between benefits and tiles. Height 1424 at 1920, as in the frame.
- 5 items, each padding 16, icon 32 px (inline SVG, `#101011`), 24 px to the copy; title Bold 21/1.1 `#101011` (fluid 18-21 px, `--fs-lead`), subtitle Medium 14/1.2 `#1e1e1e`, 8 px apart. Icons: enter, bookmark-full, truck, shield (ci2), trophy. Copy verified against #4 (nodes 1:600-1:630).
- 5 columns at desktop (gap 32), 3 + 2 from 640 px, **2 columns** on phones (per NOTES).

### 3.6 Tiles (`.tiles`)

**(built; values from Figma #4)**
- Desktop (≥ 1024): one 3-column grid `648fr 272fr 648fr` (16 px gaps) gives both mirrored rows, 648 | 936 and 936 | 648, exactly at 1600. Row height from the column width, `max(360px, (min(100vw - 32px, 1600px) - 32px) * 0.3304)` (518 at 1600), so the images keep their ratio. Pixel diff against `vp.png` in the tile area: mean 2.3/255 (WebP).
- Below 1024: **one column** (also on tablets: the 32 px titles don't fit a ~300 px half tile). THORO keeps the overlay (photo, height `clamp(440px, 60vw, 520px)`); configurator, catalog and SMART **stack**: image block on top (4:3, 16:9 from 640 px), text below on the same flat colour, because overlaid text would run across the device mockups at these widths.
- `.tile`: radius 24, `overflow: hidden`; `.tile__img` is an `<img>` with `object-fit: cover`, `loading="lazy"`. Text: padding 48 (fluid down to 24), eyebrow Bold 21/1.1, title Bold 32/1.1 (fluid 24-32, `h2`), 12 px apart, 24 px to the button; button = `.button--dark` (black, padding 16/24, pill). Text colour: white on THORO and Konfigurator, `#101011` on Katalog and SMART. Backgrounds: `#72a3f3`, `#fdf8eb`, `#e8e4df` (tokens). The Konfigurator title keeps Figma's line break at desktop only.
- Tile images: the raw PNGs have the 24 px radius baked in as transparency; the build script fills those corners with the colour just inside them and the CSS radius does the rounding (cover crops at a different scale per width, so a baked radius wouldn't match).
- Hover on the tile:
  - image `scale(1 → 1.1)`, 500 ms ease-out;
  - button: a grey `#4A4A4A` overlay fades in (opacity, 200 ms ease-in-out) instead of animating background-color.
- The whole tile is clickable: the `<a class="tile__link">` wraps the pill (`<span class="button button--dark">`) and its `::after` covers the tile, so there's a single focus target. Keyboard focus on the link gets the same zoom + overlay as hover.

### 3.7 Shader section (`.shader`) **(built: `css/shader.css`, `js/shader.js`)**

- Layout measured from `screen.png` (1:707 is image-only, so no Figma values): section 835 at 1920 (`clamp(480px, 43.5vw, 835px)`), content centred (3 px below the middle, as in the frame). Heading Bold 52/1.1, letter-spacing -1 %, `#f0f0f3`, max-width 13.5em so it breaks like the design; yellow CTA Bold 18/24, padding 16/26 (131 x 56), 36 px below the heading; subline Medium 17/1.2 `#e7e7e7`, max-width 15em, 20 px below. Measured against the frame at 1920: every text line and the button within 1 px vertically, widths within 4 px. The frame's content is centred at x 952 (8 px left of the middle, probably a scrollbar in the capture); the page centres it properly.
- WebGL1 fragment shader on one full-screen triangle:
  - soft diagonal light bands (upper-left to lower-right) rising from the bottom, colour ramp `#101011` -> `#2a2418` -> `#5f4e1d` -> `#8f7121` -> `#f2bf25` sampled from the frame; 2-octave value noise for a slow domain warp; 1/255 dither against banding. Brightness per quarter of the section (mean R,G,B) vs the frame: 19/17, 47/42, 77/75, 112/122.
  - **Seamless 25 s loop:** every time input is periodic in phase = 2π·t/25 s (noise drifts along a circle, bands move by one wavelength), t kept modulo 25 s in JS. Verified with `page.clock`: frame at 25.05 s vs 0.05 s differs by 0.22/255 mean (dither only); the change across the seam (0.49 mean) is the same as any other 0.1 s step (0.40).
- Rendering cost:
  - DPR capped at 1.5, **and rendered at half that resolution** (CSS scales the canvas up): the picture is only soft gradients and the text is HTML, so half-res is visually identical (max 2/255 difference on the same frame) for about a quarter of the GPU work. Measured on the dev laptop's Intel UHD: 1.4 ms per frame at DPR 1, 2.5-4.3 ms at the 1.5 cap (full res: 4.2 and 8.6-10.7 ms).
  - **Capped at 60 fps** (user decision; the motion is slow, so more only costs GPU and battery): time advances every frame, drawing happens on an exact 1/60 s schedule with 1 ms tolerance. Measured 60.3 draws/s on a 144 Hz display; a jittery 60 Hz display draws every frame.
  - `requestAnimationFrame` only while the section intersects the viewport and the tab is visible (verified: 144 draws/s in view, 0 scrolled away); debounced ResizeObserver; low-power context.
- Fallbacks (verified): no WebGL / no JS -> the section's own CSS gradient (the canvas only fades in, `.shader--ready`, after the first WebGL frame); context lost -> back to the gradient, resumes on restore; reduced motion -> one static WebGL frame, no animation.
- Copy: heading "Twoje wnętrze zasługuje na wyjątkowe światło", CTA "Kup teraz", subline "Od 119 zł na oficjalnej stronie producenta SOLLUX". _(to verify by the user by eye: 1:707 is image-only)_ The frame has a double space in "wyjątkowe  światło"; the page uses a single space.

### 3.8 Footer (`.footer`) **(built: `css/footer.css`; values and copy from Figma #5)**

- Top band (padding 96 / 64): logo (136 px glyph in a 160 x 44 box) centred over 4 social links (48 px circles, 24 px icons, 2 px apart); 5 link columns. Headings Bold 13/1.1 (`h2`), links Medium 13/1.1, all `#1e1e1e`; 24 px heading → links, 28 px link rhythm. Links have 6 px vertical padding (a 26 px tap target instead of 14) with the list gap reduced to match, so the layout is unchanged.
- Bottom band: `#e7e7e7` top rule; three equal columns (512 at 1600, grid) with `#e7e7e7` dividers, padding 32. Payments 5 x 2 cells of 57 x 36 (43 x 24 logos), awards at their Figma sizes with 3 px gaps, 8 flags (24 px in 32 px circles, links with Polish country names as labels).
- Caption: VAT line, a rule filling the row, IdoMods (98 x 36) + IdoSell (66 x 36); contact line Medium 12/1.1 with 24 px gaps (phone and e-mail are links, `href="#"`).
- Layout below the design width: from 1280 one row as in Figma (column gap `clamp(40px, 5vw, 96px)`, 96 at 1920); below 1280 the logo block sits above the link grid (5 columns from 1024, 3 from 640, 2 on phones); below 1024 the three bottom groups stack with horizontal rules and the caption wraps (its long rule is hidden).
- Measured at 1920 vs `footer.png`: column x within 3 px, bottom groups and flags exact, height 712 vs 709 (the 13 px / 1.1 line boxes add up slightly taller than Figma's rounded ones). No overflow, nothing cut off 320-2560.
- Copy verified against #5. "Wpsółpraca" in Figma is a typo; the page uses "Współpraca" (NOTES.md).

### 3.9 Polish pass

- Favicon; html-validate, Stylelint and Prettier clean.
- Check the 320–1920 range by hand; Lighthouse sanity check.

## 4. Acceptance criteria (Playwright tests, written after the page is built)

1. **Slider timing** (`page.clock`): the slide changes at 3 s; the crossfade finishes by 600 ms; the progress bar is `scaleX(1)` at 3 s and resets after the change; it pauses on hover; prev/next and segment clicks work.
2. **Header hover:** after 250 ms the computed `color` is black and the overlay opacity is 1; both revert on leave.
3. **Tile hover:** after the transition the image transform is `scale(1.1)` and the button overlay opacity is 1.
4. **Burger menu** (< 1280 px): opens and closes, `aria-expanded` toggles, Esc closes, focus is trapped and returns to the burger.
5. **Lamps:**
   - a click toggles `aria-pressed` and the glow opacity on both slides;
   - lamp boxes stay aligned with their reference positions in the stage (tolerance in px, agreed once measured) at 375 / 768 / 1440 / 1920;
   - at 375 the lamps are inside the viewport and don't overlap the hero text box.
6. **Shader:**
   - the canvas has a WebGL context and draws non-blank pixels;
   - with WebGL disabled (via `HTMLCanvasElement.prototype.getContext` override in `addInitScript`) the `.shader--static` fallback is shown and there are no errors.
7. **Accessibility:** axe finds no violations on the full page (desktop and mobile).
8. **No horizontal scroll** at widths from 320 to 1920 (stepped): `scrollWidth <= clientWidth`.
9. **No console errors or failed requests** on load, also when opened over `file://`.
10. **Reduced motion** (`emulateMedia`): no autoplay, the shader doesn't animate (static fallback), no transform transitions (tile zoom, slide scale-in, menu slide). Opacity fades are allowed.
11. **Touch:** with `hasTouch` and no hover capability, tapping a tile or the header leaves no stuck hover state.
12. **Lighthouse (mobile)** on the deployed GitHub Pages URL: **≥ 90** in Performance, Accessibility, Best Practices and SEO.
    - `noindex` is intentional; if SEO flags it, note it and keep the meta tag. Don't remove it to pass.
    - Run by hand or with Lighthouse CLI (needs approval as a new dependency) after deploy.

## 5. Open items

- ~~TBD #3~~ done (§0.3). All hero and header copy matched Figma.
- ~~**Hero arrows below 1024 px**~~ **Resolved (user-approved):** hidden below 1024 px; swipe + progress segments (64 × 44 px tap areas) + the pause/play toggle (44 × 44).
- ~~**Tile copy typo**~~ **Resolved (user):** "Pobierz aplikację na telefon" (Figma has "aplikacje"). In NOTES.md and README.
- ~~**Tile text contrast**~~ **Resolved (user):** design colours kept; dark gradient behind the text on THORO (52 %) and Konfigurator (32 %), measured ≥ 4.5:1 eyebrow / ≥ 3:1 title at 320-1920. Details in NOTES.md, CSS in `tiles.css` (`.tile--scrim`).
- ~~**Lamp glow on click**~~ **Built (option B with a light dim, user-approved; §3.3).** Waiting for the user's live check on the laptop; the dim strengths are tunable in `tokens.css`. Acceptance criterion 5 covers it.
- ~~**Lamp positions**~~ done (§0.2, `design/lamp-positions.json`), checked by eye and by difference view.
- **User check:** shader section copy (image-only); the user checks it by eye against Figma. Single space in "wyjątkowe światło" confirmed.
- ~~**TBD #4**~~ done (§3.5, §3.6). ~~**TBD #5**~~ done (§3.8).
- ~~**Footer heading typo**~~ "Współpraca" instead of Figma's "Wpsółpraca" (same rule as the tile typo; NOTES.md, README).
- Spare **#6**: unused so far; keep it for anything the lamp glow or the polish pass needs from Figma.
