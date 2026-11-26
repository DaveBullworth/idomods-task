## Links on frames in Figma

- **Full page** - `Landingp page` - https://www.figma.com/design/pEdVK9upunNouPDObQQXe4/IdoMods-rekrutacja-frontend-AI--Copy-?node-id=1-505&t=UFXQ3M10Es05dVPK-4
- **Hero** - `HERO Baner` - https://www.figma.com/design/pEdVK9upunNouPDObQQXe4/IdoMods-rekrutacja-frontend-AI--Copy-?node-id=1-506&t=yE9OL6n9cNBm7JU0-4
- **VP** - `VP's` - https://www.figma.com/design/pEdVK9upunNouPDObQQXe4/IdoMods-rekrutacja-frontend-AI--Copy-?node-id=1-593&t=UFXQ3M10Es05dVPK-4
- **Screen** - `screen` - https://www.figma.com/design/pEdVK9upunNouPDObQQXe4/IdoMods-rekrutacja-frontend-AI--Copy-?node-id=1-707&t=UFXQ3M10Es05dVPK-4
- **Footer** - `Footer` - https://www.figma.com/design/pEdVK9upunNouPDObQQXe4/IdoMods-rekrutacja-frontend-AI--Copy-?node-id=1-708&t=UFXQ3M10Es05dVPK-4

- **Comments** - `Komentarze do projektu` - https://www.figma.com/design/pEdVK9upunNouPDObQQXe4/IdoMods-rekrutacja-frontend-AI--Copy-?node-id=16-91&t=UFXQ3M10Es05dVPK-4

## Basics

- Frame width: 1920 px
- Frame hieghts:
  - `Landingp page` - 4048 px
  - `HERO Baner` - 1080 px
  - `VP's` - 1424 px
  - `screen` - 835 px
  - `Footer` - 709 px
- Font: `Red Hat Display` (file: `\assets\raw\font.woff2`), weights: Medium, Bold

## Gaps in the design and my decisions

- **No mobile layout.** Burger menu below 1280 px (changed from 1024: the full header row doesn't fit below ~1300 px), tiles in one column, benefits in two columns, footer columns stacked.
- **Lamps on the second slide.** Lamps are shown on both, first and second slide.
- **Lamps are baked into the hero background.** Lamps stay in place; the interaction is only the light turning on.
- **Lamp light (comments spec 03).** Clicking a lamp turns it on like a real one: a short flicker, then a steady warm glow from the diffuser, a soft cone in the direction the lamp faces and faint light on the rock where it lands. The room dims slightly with each lamp (6 / 11 / 15 %, tunable); with no lamp on the hero is exactly as designed. A first-visit hint "Kliknij lampę" explains the interaction. With all three lamps on, "w nowym świetle" in the headline glows warm.
- **Lamp overlays per slide.** Slide 1 shows only the lamps baked into the photo: the overlay lamp images stay at opacity 0 there, so the slide never depends on pixel-perfect alignment (rounding at different widths and pixel ratios made double edges). Only the glow shows on click. The overlay images fade in with slide 2 and fade out when going back to slide 1, in sync with the crossfade. They sit where the baked lamps are, so the switch looks continuous.
- **Dropdown menus are not designed** ("Lampy", "Kolory", "Pomieszczenia"). Plain links with an arrow icon, no dropdowns.
- **Links and search.** All links use `href="#"`. The search form is static and does not submit.
- **Spec conflict:** "animate only transform and opacity" vs. colour changes in the header and buttons. Backgrounds change through an overlay with opacity; text and icon colour use a `color` transition as a deliberate exception.
- **Typos in the design.** The SOLLUX SMART tile button reads "Pobierz aplikacje na telefon" in Figma (node 1:706); the page uses the correct "Pobierz aplikację na telefon". The fifth footer column heading reads "Wpsółpraca" (node 1:823); the page uses "Współpraca".
- **Tile text contrast.** White text on THORO's photo (about 1.4:1 at worst) and on Konfigurator's blue `#72a3f3` (2.55:1) is under WCAG minimums. The design colours stay; a dark gradient (`#101011`) sits behind the text block only, fading in above the eyebrow. Strength is the measured minimum plus 2 points: THORO 52 %, Konfigurator 32 %. Measured on the lightest background pixel behind each text box, at widths 320-1920: eyebrow 4.89:1 (THORO) and 4.67:1 (Konfigurator), target 4.5:1; title 4.74:1 and 3.29:1, target 3:1.
- **Tiles below 1024 px.** One column. Konfigurator, Katalog and SOLLUX SMART stack the image above the text (on the tile's own flat colour), because overlaid text would cross the device mockups at these widths. THORO keeps the overlay.
- **Anything else not specified:** the simplest behaviour consistent with the rest of the page.
