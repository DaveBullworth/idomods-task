# Figma MCP call log

File: `pEdVK9upunNouPDObQQXe4`. Free plan: budget of 6 calls. Check this log before any call and never repeat a fetch.

| # | Tool | Node | Date | Saved to | Notes |
|---|------|------|------|----------|-------|
| - | create_session | - | 2026-11-25 | - | Session `1fd6a90f-d55f-4b41-b7e2-475a9df404b0`. Unknown whether it counts toward the budget. |
| 1 | get_metadata | 1:505 Landingp page | 2026-11-25 | `01-metadata-full.xml` | Full structure of VP's, tiles and footer. **HERO 1:506 came back with no children** and `screen` 1:707 is a single rounded-rectangle, so header, hero and lamp structure must come from call #3. |
| 2 | get_variable_defs | 1:505 | 2026-11-25 | `02-variables.json` | Empty `{}`: the file defines no variables. Colours, type and spacing must be read from design context (#3–#5). |

## Remaining plan
| # | Tool | Node | Purpose |
|---|------|------|---------|
| 3 | get_design_context | 1:506 HERO Baner | Header + hero: nav, search, lamp positions, slider controls, rating badge |
| 4 | get_design_context | 1:593 VP's | Benefits row + tiles: type, colours, radii, button styles |
| 5 | get_design_context | 1:708 Footer | Footer type and colours |
| 6 | spare | - | e.g. 1:707 screen, if the shader colours are unclear from the PNG |
