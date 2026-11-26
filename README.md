# SOLLUX landing page

A static landing page for SOLLUX, built from a Figma design as a recruitment task. Plain HTML, CSS and JavaScript, no framework and no build step.

## Running it

- Open `index.html` directly in a browser (works over `file://`), or serve the folder with any static server.
- All paths are relative, so the site also works from a GitHub Pages subfolder.

Node is only needed for development tooling (`npm install` first):

| Command | What it does |
|---|---|
| `npm run assets` | Rebuilds optimised images, icons and fonts from `assets/raw/` |
| `npm run lint` | Stylelint, html-validate and a Prettier check |
| `npm run format` | Formats the code with Prettier |
| `npm test` | Playwright tests (added once the page is complete) |

## Deviations from the design

The full list of decisions is in [`design/NOTES.md`](design/NOTES.md). The ones a reviewer would notice:

- **Copy fix:** the SOLLUX SMART tile button says "Pobierz aplikację na telefon". The design has the typo "aplikacje".
- **Contrast:** THORO and Konfigurator tiles have a subtle dark gradient behind their white text, so the text meets WCAG contrast (4.5:1 for the eyebrow, 3:1 for the title). The design colours are unchanged.
- **Hero lamps:** the lamps are part of the hero photo. On slide 1 only the photo's lamps show; the separate lamp images fade in with slide 2 and out again on the way back.
- **Mobile:** there are no mobile designs. The header switches to a burger menu below 1280 px, the tiles go to one column below 1024 px, and the benefits use two columns on phones.
- **Hero slider:** autoplay pauses while the arrows or progress bar are hovered or keyboard focus is inside the hero, and there's a pause/play button next to the progress bar (WCAG 2.2.2).
