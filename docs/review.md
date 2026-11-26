# Code Review Findings

Two passes over the finished page, merged:

- **reviewer:** a read-only agent (`.claude/agents/reviewer.md`, tools Read / Grep / Glob) with fresh context, reviewing the code against `CLAUDE.md` and `PLAN.md`;
- **guidelines:** the `web-design-guidelines` skill (Vercel Web Interface Guidelines) on `index.html` and `css/`.

Each item: finding, source, recommendation, the user's decision and the outcome.

## Fix

### 1. Hard-coded colours outside tokens.css

**Finding:** Hard-coded colours outside tokens.css: light-gradient stops in lamps.css (150, 236–238, 265–267, 281–283, 381–382), sky colours hero.css:54,59, black-with-alpha in hero.css:316, tiles.css:96–97, shader.css:19. --c-light-amber and --c-light-ember are unused but their values are typed by hand at lamps.css:281–282.

**Source:** reviewer (high)

**Recommendation:** Fix. Move them to tokens; use color-mix() for the alpha variants. Should look identical; I'd confirm with before/after screenshots.

**Decision:** Fix as recommended.

**Outcome:** New tokens `--c-light-honey`, `--c-light-gold`, `--c-light-text-glow`, `--c-light-text-halo`, `--c-sky-rock`, `--c-sky-interior`; every literal is now a token, mixed with `transparent` (`--c-light-amber` / `--c-light-ember` are used now). Screenshots before/after (hero with all lamps lit on both slides, full page at 1920 and 375): at most 2/255 difference, from rounding.

### 2. Hard-coded durations

**Finding:** Hard-coded durations: hint delay 1.2s (lamps.css:316), pulse 1.6s (lamps.css:337).

**Source:** reviewer (high)

**Recommendation:** Fix with two tokens. Skip SMOOTH_MS = 160 in lamp-parallax.js: it sets how quickly the lamps catch up with the cursor, not a transition, so a comment is enough.

**Decision:** Fix as recommended.

**Outcome:** `--dur-hint-delay`, `--dur-hint-pulse` in tokens.css; a comment on `SMOOTH_MS`.

### 3. Missing focus-visible equivalents

**Finding:** Hover with no :focus-visible equivalent: hero arrow overlay (hero.css:199–203), footer link underline (footer.css:34–39).

**Source:** reviewer (high)

**Recommendation:** Fix. Two small rules, as the rest of the page already does.

**Decision:** Fix as recommended.

**Outcome:** Both rules added.

### 4. Easter-egg glow animation

**Finding:** Easter-egg glow fades with --dur-zoom (lamps.css:386), which is 0 ms under reduced motion, so an allowed fade snaps instead.

**Source:** reviewer

**Recommendation:** Fix: use --dur-fade.

**Decision:** Fix as recommended.

**Outcome:** Uses `--dur-fade`.

### 5. Hero sizes and preload imagesizes

**Finding:** Hero sizes and the preload imagesizes use 100vh and ignore the 560–1080 px height clamp (index.html:24, 249, 276). Example: 924 px requested vs a real ~995 px stage at 800 × 520.

**Source:** reviewer

**Recommendation:** Fix: calc(clamp(560px, 100svh, 1080px) * 1.7778), identical in all three so the preload is still reused.

**Decision:** Fix as recommended.

**Outcome:** Done in all three; PLAN.md §2 updated.

### 6. Focus after following a burger menu link

**Finding:** Following a link in the burger panel closes it but leaves focus on a now-hidden link (header.js:66–68).

**Source:** reviewer

**Recommendation:** Fix: close(true), so focus returns to the burger.

**Decision:** Fix as recommended.

**Outcome:** Done; test added (`header.spec.js`).

### 7. First-visit hint dot animation

**Finding:** The first-visit hint dot pulses forever (lamps.css:337), which may fall under WCAG 2.2.2 (motion over 5 s).

**Source:** reviewer

**Recommendation:** Fix: stop after 3 pulses, about 6 s including the delay.

**Decision:** Fix as recommended.

**Outcome:** 3 pulses, starting with the hint; test added (`lamps.spec.js`).

### 8. Test coverage gaps

**Finding:** Tests check less than PLAN §4 claims: inert only on main; timer restart only tested for "next"; lamps "in view" at 375 only checked horizontally; reduced motion never checks keyframe animations or the hint pulse.

**Source:** reviewer

**Recommendation:** Fix: add the assertions. No threshold or snapshot changes.

**Decision:** Fix as recommended.

**Outcome:** Inert checked on the skip link, main and footer; the timer restart tested for next, prev and segment; a vertical check at 375; reduced motion checks that no lamp flicker or hint pulse runs. No thresholds or snapshots changed.

### 9. Outdated PLAN.md

**Finding:** PLAN.md out of date: js/menu.js (it's header.js), the old --gutter clamp, the old stage centring, imagesizes missing the portrait-mode entry.

**Source:** reviewer

**Recommendation:** Fix the docs. The code is right in each case.

**Decision:** Fix as recommended.

**Outcome:** All four updated.

### 10. Dead code

**Finding:** Dead code: the unused light tokens, .hero__pause[hidden] and .hero__hint[hidden] (the base [hidden] rule already covers them), the unused data-render-scale override in shader.js:147.

**Source:** reviewer

**Recommendation:** Fix: remove all three.

**Decision:** Fix as recommended.

**Outcome:** The two `[hidden]` rules and `data-render-scale` removed; the two light tokens are now used (item 1).

---

## Measure first, then decide

### 11. Text contrast on photos

**Finding:** On landscape screens slide 2 has no scrim. PLAN gives white on `#c5afa3` as about 2.1:1, and the scrim only existed on portrait screens. Header links, eyebrow, H1 and badge sit straight on the interior photo. axe can't catch text on photos.

**Source:** reviewer (uncertain)

**Recommendation:** Measure at 1280 and 1920 the way the tile scrims were measured. If it's under 4.5:1, add a text-side scrim like `.tile--scrim`.

**Decision:** Measure every text element on slide 2 at 1280×633 and 1920 (header links, eyebrow, H1, CTA, badge). Large text needs 3:1, small text 4.5:1. Add a scrim only where it's needed, and report the ratios before and after.

**Outcome:** Two dark bands inside slide 2, under the lamps (so they crossfade with the photo and the lamps never dim):
- 59 % behind the header, fading out by 160 px;
- 46 % behind the text column, fading out to its right.

Strength is the measured minimum + 2 points, as for the tiles. Also checked at 800×520, 1024×768 and 1440×900. The CTA and the badge have their own backgrounds and needed nothing.

Method: the text is hidden and the area behind each element's text (its line boxes, not the element box) is screenshotted with the lamps hidden. The figure is the worst pixel. Targets: small text 4.5:1, large text (≥ 24 px, or ≥ 18.66 px bold) 3:1, icons and logo 3:1.

| Element | Target | 1280×633 before | after | 1920×1080 before | after |
|---|---|---|---|---|---|
| Logo | 3 | 4.14 | 14.63 | 2.81 | 13.38 |
| Nav links | 4.5 | 2.33 | 10.26 | 2.09 | 7.70 |
| Search placeholder | 4.5 | 1.01 | 4.93 | 2.07 | 7.58 |
| "Stwórz swoją lampę" | 4.5 | 2.17 | 7.81 | 2.05 | 7.50 |
| Account icon | 3 | 2.11 | 7.70 | 2.02 | 7.49 |
| Cart icon | 3 | 2.18 | 7.83 | 2.03 | 7.46 |
| Eyebrow | 4.5 | 1.81 | 4.98 | 4.50 | 9.19 |
| H1 | 3 | 1.69 | 4.71 | 1.59 | 4.51 |
| CTA (ink on yellow) | 4.5 | 9.73 | 9.73 | 9.73 | 9.73 |
| Badge "4.8" | 3 | 13.23 | 13.23 | 6.80 | 6.80 |
| Badge label | 4.5 | 13.02 | 13.02 | 6.97 | 6.97 |

**Still open (not part of item 11):** where text crosses a lamp, the lamp is light, and this happens on both slides:
- "świetle" over lamp 3: 1.59 at 1280×633, 1.50 at 1920. This is the Figma layout.
- At 1280×633, lamp 1's top sits behind the nav links "Bestsellery" / "Promocje": 1.54. Viewports wider than 16:9 push the stage up, past the header.

A slide scrim can't fix either case without dimming the lamps. Followed up below ("Follow-up: open contrast items").

### 12. Lamp switch-on flicker

**Finding:** The lamp switch-on flicker has about 3 opacity peaks in 450 ms. That's over 3 flashes per second; whether it breaks WCAG 2.3.1 depends on how large and bright the glow is.

**Source:** reviewer (uncertain)

**Recommendation:** Measure the lit area at 1920. If it's near the limit, cut the flicker to one dip. That changes the look you approved, so it's your call.

**Decision:** No need to measure. Cut the flicker to one dip (up, one dip, then steady). It still reads as a real lamp and stays clear of the flash limit. Update NOTES.md.

**Outcome:** Keyframes 0 → 0.9 → 0.35 → 1, still 450 ms. NOTES.md and PLAN.md updated. A test checks the keyframes have exactly one dip and end at 1.

### 13. Lamp button hit areas

**Finding:** Lamp buttons are full image rectangles: lamps 2 and 3 overlap lamp 1's box.

**Source:** reviewer (uncertain)

**Recommendation:** Check by clicking lamp 1's visible edges. Only if a click goes to the wrong lamp, trim the hit areas with clip-path.

**Decision:** Check it in a test: sample points on lamp 1's visible pixels near the overlaps with elementFromPoint. Trim the hit areas only if a point lands on the wrong lamp.

**Outcome:** The test sampled points where lamp 1 is visible and the lamp box on top is transparent. Every one landed on the wrong lamp: 244 of 244 at 1920 and 43 of 43 at 375, all on lamp 2 (the transparent top-left of its box).

Trimmed as follows:
- each lamp image takes the pointer events, clipped to the convex hull of its visible pixels (computed from the PNGs, rounded outward, so nothing visible changes: the hero with all lamps lit differs by at most 1/255);
- the button has `pointer-events: none`, so its focus ring stays unclipped.

The test now passes at both widths.

---

## Skip / defer

### 14. Missing favicon

**Finding:** No favicon; on GitHub Pages /favicon.ico returns 404.

**Source:** reviewer

**Recommendation:** Defer to the planned §3.9 polish pass, before the deploy.

**Decision:** Defer as recommended.

### 15. Parallax mouse movement

**Finding:** Parallax wakes up on every mouse move anywhere on the page (lamp-parallax.js:113–121).

**Source:** reviewer

**Recommendation:** Skip. It settles in one frame, and frame time was measured as unchanged.

**Decision:** Skip as recommended.

### 16. Font preload

**Finding:** No &lt;link rel="preload" as="font"&gt;.

**Source:** guidelines

**Recommendation:** Skip. You decided this: it breaks file://, and Lighthouse will check the font timing.

**Decision:** Skip as recommended.

### 17. Lamp button labels

**Finding:** Lamp label "Włącz lampę N" stays the same while aria-pressed toggles.

**Source:** guidelines

**Recommendation:** Skip. A fixed label with aria-pressed is the standard toggle-button pattern (like a "Mute" button); the reviewer also rated it fine.

**Decision:** Skip as recommended.

### 18. Typography in the copy

**Finding:** Typography in the copy: placeholder "Czego szukasz?" doesn't end with "…"; footer hours use hyphens ("Pn - Pt 7:00 - 15:00") instead of en dashes; the rating is "4.8", where Polish writes "4,8".

**Source:** guidelines

**Recommendation:** Skip. All three are Figma copy, which CLAUDE.md says to keep verbatim. The en dashes are the one I'd happily change if you want.

**Decision:** Change the hyphens in the footer hours to en dashes. Keep "4.8" and the placeholder as in Figma.

**Outcome:** "Pn–Pt 7:00–15:00"; at 375 the line now fits on one row. Recorded in NOTES.md and README as a copy change.

### 19. Missing hover states

**Finding:** No hover state on the progress segments, pause button, social icons, flags, footer logo, or individual header links.

**Source:** guidelines

**Recommendation:** Skip. None are in the design. The header's whole-bar hover is the specified effect, and everything still has a focus ring.

**Decision:** Skip as recommended.

### 20. Heading text wrapping

**Finding:** No text-wrap: balance on headings.

**Source:** guidelines

**Recommendation:** Skip. It would change the line breaks that match the 1920 frame.

**Decision:** Skip as recommended.

### 21. Missing mobile browser enhancements

**Finding:** No &lt;meta name="theme-color"&gt;, touch-action: manipulation or -webkit-tap-highlight-color.

**Source:** guidelines

**Recommendation:** Skip. Mobile browsers no longer add a tap delay on pages with a width=device-width viewport. The tap highlight is the only touch feedback, since hover is off there. theme-color is optional for a page with a dark hero under a transparent header.

**Decision:** Skip as recommended.

### 22. Brand name translation

**Finding:** No translate="no" on brand names.

**Source:** guidelines

**Recommendation:** Skip. The page is Polish and the brand names are unlikely to get garbled.

**Decision:** Skip as recommended.

---

## Follow-up: open contrast items

**Decision:** Fix them with one consistent technique that doesn't dim the lamps. A subtle text-shadow on the white text over the hero (transparent header links and search placeholder, eyebrow, H1), removed when the header turns white. For slide 1's eyebrow, also a light scrim on the text side under the lamps, measured minimum + 2 points. Measure before and after.

**Outcome:**
- **Shadow:** `--text-shadow-hero` (tokens.css) is a tight 2 px halo at 70 % black plus a soft 12 px one at 35 %. It applies to the eyebrow, the H1 and, from 1280, the header links, configurator and search text. The header's solid states (hover, focus, open panel) set it to none.
- **Slide 1 scrim:** a 30 % band behind the text column. The eyebrow needs 28 % at worst (1440 × 900; 18–27 % at 800 × 520, 1024 × 768, 1280 × 633 and 1920), plus 2 points.

**Method:** a text-shadow only darkens the pixels next to the letters, so these figures are measured on a round ring 2 px around the glyphs: WCAG treats a halo or outline as the text's background. The page is screenshotted as is and again with the text colour transparent (shadows kept); where the two differ are the glyphs. The figure is the worst ring pixel. The lamps are visible, unlike the item 11 table, because these are the lamp overlaps.

| Item | Target | Before | After (2 px ring) | After (1 px ring) |
|---|---|---|---|---|
| "świetle" over lamp 3, slide 1, 1280×633 | 3 | 1.73 | 2.02 | 2.48 |
| "świetle" over lamp 3, slide 1, 1920 | 3 | 1.53 | 2.06 | 2.49 |
| "świetle" over lamp 3, slide 2, 1280×633 | 3 | 1.75 | 2.07 | 2.48 |
| "świetle" over lamp 3, slide 2, 1920 | 3 | 1.59 | 2.07 | 2.49 |
| Nav over lamp 1, slide 1, 1280×633 | 4.5 | 1.58 | 1.80 | 2.45 |
| Nav over lamp 1, slide 2, 1280×633 | 4.5 | 1.63 | 1.84 | 2.46 |
| Slide 1 eyebrow, 1280×633 | 4.5 | 2.85 | **5.16** | 5.28 |
| Slide 1 eyebrow, 1920 | 4.5 | 2.78 | **5.04** | 5.19 |

**Result:**
- The slide 1 eyebrow is fixed.
- The two lamp overlaps improve, but a subtle shadow can't reach 3:1 / 4.5:1 there. Stronger recipes were tried:
  - a heavy stacked halo (2 + 4 + 4 + 12 px) gets "świetle" to 2.53 (3.21 within 1 px) and the nav to 2.43 (3.37), and starts to read as an outline;
  - the nav over lamp 1 needs about 47 % black right at the letter edges.

  Side-by-side crops (none / subtle / heavy) and final screenshots at 1920 and 1280×633 were shown to the user. The subtle version is kept, as decided ("subtle", "as close to Figma as possible").
- **Remaining options (user's call):** a stronger halo for the H1 only; or, for the nav, keeping lamp 1 below the header on viewports wider than 16:9 (a stage-position change, not a dimming one).
- **Also found while measuring (slide 1, as designed):** the search placeholder at 1280×633 is 3.74 and the configurator label at 1920 is 4.31, both on the bright sky. The badge label is 3.60 on its 40 % dark pill. These are not in the decision above, so they are left open.

---

## Decisions (verbatim)

Fix 1–10 as recommended.

- **11**: measure every text element on slide 2 at 1280×633 and 1920 (header links, eyebrow, H1, CTA, badge). Large text needs 3:1, small text 4.5:1. Add a scrim only where it's needed, and report the ratios before and after.
- **12**: no need to measure. Cut the flicker to one dip (up, one dip, then steady). It still reads as a real lamp and stays clear of the flash limit. Update NOTES.md.
- **13**: check it in a test: sample points on lamp 1's visible pixels near the overlaps with elementFromPoint. Trim the hit areas only if a point lands on the wrong lamp.
- **14–22**: skip or defer as recommended, except 18: change the hyphens in the footer hours to en dashes. Keep "4.8" and the placeholder as in Figma.
