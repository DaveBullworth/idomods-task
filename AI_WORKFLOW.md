# AI workflow

How I built this landing page with AI: what I used and why, how the work was organised, and where the AI got things wrong.

## Tools

| Tool | What I used it for |
| --- | --- |
| Claude Code (Claude Opus 5.5) | All coding work. Full transcript in `ai-logs/`. |
| Figma plugin for Claude Code (MCP server + Figma skills, incl. Implement Design) | Reading layout values and copy from the design |
| Playwright MCP | Screenshots and checks in a real browser after every section |
| web-design-guidelines (skills.sh, `vercel-labs/agent-skills`) | Accessibility and UX audit in the review step |
| playwright-best-practices (skills.sh, `currents-dev/playwright-best-practices-skill`) | Writing the test suite |
| Subagent `reviewer` (`.claude/agents/reviewer.md`) | Independent read-only code review with fresh context |
| Figma AI, "Edit with prompt" | Removing the lamps from the hero background photo |

Skill versions are pinned in `skills-lock.json`.

## Deliberately not used

- **frontend-design skill:** it pushes towards an original visual style, and here the job was to match an existing design.
- **webapp-testing skill:** it writes tests in Python, and the project is JS-only.
- **React + Tailwind from Figma:** `get_design_context` returns that by default. I used it only as a source of values. The page is plain HTML, CSS and JS, because the brief asks for the simplest possible stack.

## How the work was organised

1. **Manual prep in Figma.** I exported the frames and assets and wrote `design/NOTES.md` with the gaps in the design and my decisions.
2. **Planning.** Claude drafted `CLAUDE.md` (working rules) and `PLAN.md` (build plan and acceptance criteria). I reviewed and corrected both before any code was written.
3. **Figma MCP budget.** The free plan allows only a handful of calls a month, so I budgeted 6. Every call was planned up front, every response saved to `design/figma/` and logged in `design/figma/LOG.md`. 5 calls were used.
4. **Section by section**, each with a done-check: screenshots at 375, 768, 1280×633 (DPR 1.5), 1440 and 1920, a comparison with the frame, a list of differences, fixes, then a commit.
5. **Tests.** 51 Playwright tests cover the acceptance criteria in `PLAN.md` §4.
6. **Independent review** by the subagent plus the guidelines skill. Every finding and my decision on it is in `docs/review.md`.

## Where the AI was wrong, and how it was caught

1. Claude suggested moving the lamps with the cursor without opening `hero-rock.png`. I pointed out that the lamps were baked into the background photo.
2. The font file covered Latin characters only, without Polish letters. Claude confirmed it with `fontTools` and downloaded the `latin-ext` subset.
3. `get_metadata` did not return the hero's child layers. I checked the structure in Figma myself, so a Figma call was not wasted on the wrong node.
4. Lamp positions were found by an image-matching script instead of being adjusted by eye.
5. The header did not fit at 1024–1300 px. The burger menu breakpoint was moved to 1280 px.
6. Testing on my laptop showed an arrow overlapping the heading and an icon that was too small. Laptop widths were added to the done-check.
7. Doubled lamps: my guess that display scaling caused it was wrong. Claude measured and found a bug in the stage height. Slide 1 was also changed so it no longer depends on pixel-exact alignment.
8. Claude hand-shortened the SVG path of the cart icon, caught its own mistake and replaced it with the exact SVGO output.
9. The lamps still showed twice during slide transitions, because they were part of the photo. I removed them from the background with Figma AI. Now the lamps are separate layers and only the background changes.
10. The reviewer suspected that the lamp buttons overlap. A test confirmed it: all 244 sample points on the visible part of lamp 1 triggered lamp 2. Each lamp now reacts only to clicks on its visible shape.
11. With the parallax on, the blurred light layers were repainted on every frame, which halved the frame rate. Claude caught it while measuring frame times and fixed it.
12. The light layer changed the anti-aliasing of the nearby text: 8,160 pixels differed from the design. The pixel comparison caught it.
13. Two slider tests were flaky because of how the fake clock was started. The fix changed when the tests read the state, not what they check.
14. A shell command stripped the backtick-quoted parts from `PLAN.md`. Claude noticed and restored them with the editor.

## What I did by hand

- The Figma exports, `NOTES.md` and every design decision: mobile layout, lamps on both slides, burger below 1280 px, contrast handling, copy fixes.
- Checks on my own laptop at 150 % display scaling. They found issues the automated checks missed (items 6, 7 and 9).
- A decision on every review finding: fix, skip or document.
- Small edits to `NOTES.md` and `PLAN.md`.

## Logs

- `ai-logs/session.md`: readable export of the Claude Code session.
- `ai-logs/raw/`: raw JSONL transcripts, including the subagent run, with every tool, skill and MCP call.
- The only change to the logs: my Windows username in file paths was replaced with `user`.
