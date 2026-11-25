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
- **Lamp overlays per slide.** Slide 1 shows only the lamps baked into the photo: the overlay lamp images stay at opacity 0 there, so the slide never depends on pixel-perfect alignment (rounding at different widths and pixel ratios made double edges). Only the glow shows on click. The overlay images fade in with slide 2 and fade out when going back to slide 1, in sync with the crossfade. They sit where the baked lamps are, so the switch looks continuous.
- **Dropdown menus are not designed** ("Lampy", "Kolory", "Pomieszczenia"). Plain links with an arrow icon, no dropdowns.
- **Links and search.** All links use `href="#"`. The search form is static and does not submit.
- **Spec conflict:** "animate only transform and opacity" vs. colour changes in the header and buttons. Backgrounds change through an overlay with opacity; text and icon colour use a `color` transition as a deliberate exception.
- **Anything else not specified:** the simplest behaviour consistent with the rest of the page.
