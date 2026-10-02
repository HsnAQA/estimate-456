---
version: "1.0"
name: "Estimate 456"
description: "A clear bilingual course companion for software project estimation."
defaultTheme: "light"
supportedThemes:
  - "light"
  - "dark"
fonts:
  ui: "Alexandria, Segoe UI, Tahoma, Arial, sans-serif"
  data: "JetBrains Mono, Alexandria, Consolas, monospace"
radii:
  small: "4px"
  medium: "6px"
  large: "8px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
---

# Current web design (2026-10-02)

The web app (`web-app/`) is now Estimate 456. Its navigation follows the source lecture in two explicit parts: Part 1 for SLOC and Function Points, then Part 2 for planning, quality, COCOMO, and Delphi. The home page shows the logo and name, one sentence, and one question: Part 1 or Part 2. Only the chosen part's method cards appear, each with what it calculates, its main input, and one Open button. Course tables and result comparison are quiet text links below the cards. No tables or results appear on the home page. Where `stitch/design.md` and the list below disagree, the list below wins.

- Product identity: the short name is `Estimate 456`, Arabic `تقدير 456`. The project-owned logo is a rounded blue tile with a snow-white geometric E and one data point at the end of the middle bar (`assets/brand/estimate-456-mark.svg`, PNG sizes beside it). It reads at 16 px. No previous product name appears in the interface.
- Teaching rule: derived values cannot appear without context. Function Point rows show `count × weight = row total`. F1 through F14 are visible beside their questions, and the live equation shows every selected value that produces Sum Fi.
- Information architecture: Part 1 maps to Chapter 1. Part 2 maps to Chapter 4. Reference tables and result comparison are supporting tools, not competing top-level methods. COCOMO has three tabs: Basic, Intermediate, and Advanced.
- Progressive disclosure: Function Points shows one step at a time (Count, Adjust, Convert) with Next and Back buttons, while the result and worked solution stay beside it on wide screens and below it on narrow screens.
- Footer: logo, name, Made by Hassan Asiri, a GitHub link with the GitHub mark and the repository address, and one line about the lecture source.

- Light is the main theme and is snow white: page `--bg: #f4f6f9`, panels `--surface: #fcfcfd`, inputs `--field: #fdfdfe`. No surface uses pure white. Panels have a 1 px hairline shadow in light mode only.
- One interaction color: `--accent: #2b5cb8` light, `#82a9f0` dark, for buttons, links, focus, and selection. Green, amber, and red appear only for accepted, warning, and error states.
- Method identity colors (added at the user's request, 2026-09-28). They mark which method something belongs to and are never used for buttons or status. Each element sets `data-m` (or the page's `data-page`), which sets `--m`.

  | Token | Light | Dark | Method |
  |---|---|---|---|
  | `--c-sloc` | `#6247c4` | `#a996f2` | SLOC |
  | `--c-fp` | `#0b7280` | `#4cc3cc` | Function Points |
  | `--c-planning` | `#a24b0b` | `#f0a262` | FP planning, hours, productivity |
  | `--c-cocomo` | `#a8306f` | `#ec8cc2` | Basic and Intermediate COCOMO |
  | `--c-delphi` | `#4b7010` | `#a8d45f` | Delphi |
  | `--c-defects` | `#b8304f` | `#f58ea5` | Defect density |

  Used for: navigation icons, the page heading icon tile, worked-solution and stepper numbers, the 3 px top edge of result cards, summary chart bars, the dot before each method name in tables, and course table labels by group. Every method color is at least 4.5:1 on every surface and on its own 13% tint, in both themes.
- Thin borders, 6 to 8 px radii, and no decorative shadow. Only elements that float above the page (the mobile drawer, the search results, and the skip link) use `--shadow-pop`.
- Colors (2026-10-02, round 3): one green. Light: page `#f5f7f6`, panels `#fcfdfc`, text `#16201b`, accent `#0b6b4f`. Dark: page `#0e1311`, panels `#141a17`, accent `#5ec39a`. Primary buttons, selected choices, the active link, and linked values use the accent. The logo tile uses the same green.
- One top bar: logo and name, Part 1 and Part 2 links, then search (opens on demand), theme, and language. No second bar and no sidebar on desktop; under 1025 px the links move to a drawer. Course tables and Compare results are links on the home page and in the footer; Reset is in the footer.
- Arabic uses the Saudi font from the Ministry of Culture on the published site (files kept out of git, see assets/README.md), falling back to Alexandria.
- Worksheet style (2026-10-02, after the user said the earlier look felt generated): flat sheets with 1 px rules and 4 px corners, no shadows, no colored card edges, no pill chips, no icon tiles. Primary actions use the ink color (the text color), links and linked values use the blue accent. Chosen segments are filled with ink.
- 16 px body text in Alexandria (one family for English and Arabic). JetBrains Mono for numbers, formulas, units, results, and uppercase section labels (English only). Main result 46 px (28 px on phones). Both fonts are self-hosted under the SIL OFL.
- Layout: a 60 px top bar (logo and name, search, theme, language, reset) and a 50 px method bar below it grouped as Home, Part 1, Part 2, and reference links. On screens up to 1024 px the method bar becomes a drawer. Calculator pages put inputs beside the result; the result shows one large number and fact tiles, and the worked solution is a numbered rail with value chips.
- Bilingual: English and Arabic. Arabic sets `dir="rtl"` and the stylesheet uses logical properties (`margin-inline-start`, `inset-inline-start`, `border-inline-end`), so one set of rules serves both directions. Formula lines and results stay left to right inside Arabic text.
- Contrast measured on 2026-09-28 after the snow update: every light text, status, and method token is at least 4.5:1 on every light surface, and every dark token is at least 5:1 on every dark surface.

The rules in the rest of this file still apply: light default, complete dark theme, semantic tokens only, visible focus, WCAG AA contrast, no gradients or glows, no remote fonts, and no invented course values.

The Streamlit app keeps its native theme based on the tokens below and is English only.

# Product intent

Estimate 456 is a study and calculation tool, not a marketing site and not a generic dashboard. It should help a student move from source tables to valid estimates with minimal friction, clear formulas, stable inputs, and readable results.

The interface should feel quiet, exact, and trustworthy. GitHub Primer, Linear, and Vercel Geist are useful references for density, hierarchy, borders, and interaction restraint. The read-only Capstone project is useful for token organization, font licensing, and theme persistence, but CPIT 456 must retain its own identity.

# Non-negotiable visual direction

- Light theme is the default.
- Dark theme is an equal-quality optional mode.
- Neutral grey backgrounds with snow or dark-neutral working surfaces. The web app uses no pure white surface.
- One blue interaction color.
- Semantic green, amber, and red only for real success, warning, and error states.
- One-pixel borders define most surfaces.
- Shadows are absent by default. A temporary overlay may use one subtle shadow.
- Corner radii stay between 4 and 8 pixels. Pills are reserved for true compact filters or status.
- Tables are compact, aligned, and optimized for scanning.
- Interface copy is direct and uses sentence case, in English and, in the web app, Arabic.
- No gradients, glows, glass blur, decorative noise, oversized hero copy, emoji icons, or ornamental badges.

# Theme tokens

Components must consume semantic tokens. Raw colors belong only in the token declaration.

## Light theme

| Token | Value | Purpose |
|---|---:|---|
| `--bg-page` | `#F6F8FA` | Main page canvas |
| `--bg-surface` | `#FFFFFF` | Cards, tables, inputs |
| `--bg-subtle` | `#EAEEF2` | Secondary controls and selected neutral rows |
| `--bg-inset` | `#F0F3F6` | Recessed formula and code regions |
| `--text-primary` | `#1F2328` | Main content |
| `--text-secondary` | `#59636E` | Supporting copy |
| `--text-placeholder` | `#6E7781` | Placeholder text |
| `--border-default` | `#D0D7DE` | Standard borders |
| `--border-strong` | `#AFB8C1` | Hover and table boundaries |
| `--accent` | `#0969DA` | Primary interaction |
| `--accent-hover` | `#0550AE` | Hover and active interaction |
| `--accent-soft` | `#DDF4FF` | Selected row or quiet focus background |
| `--focus-ring` | `#0969DA` | Keyboard focus |
| `--success` | `#1A7F37` | Verified success only |
| `--warning` | `#9A6700` | Caution only |
| `--danger` | `#CF222E` | Validation and destructive actions |

## Dark theme

| Token | Value | Purpose |
|---|---:|---|
| `--bg-page` | `#0D1117` | Main page canvas |
| `--bg-surface` | `#161B22` | Cards, tables, inputs |
| `--bg-subtle` | `#21262D` | Secondary controls and selected neutral rows |
| `--bg-inset` | `#010409` | Recessed formula and code regions |
| `--text-primary` | `#E6EDF3` | Main content |
| `--text-secondary` | `#B1BAC4` | Supporting copy |
| `--text-placeholder` | `#8C959F` | Placeholder text |
| `--border-default` | `#30363D` | Standard borders |
| `--border-strong` | `#484F58` | Hover and table boundaries |
| `--accent` | `#58A6FF` | Primary interaction |
| `--accent-hover` | `#79C0FF` | Hover and active interaction |
| `--accent-soft` | `#1F3A5F` | Selected row or quiet focus background |
| `--focus-ring` | `#58A6FF` | Keyboard focus |
| `--success` | `#3FB950` | Verified success only |
| `--warning` | `#D29922` | Caution only |
| `--danger` | `#F85149` | Validation and destructive actions |

# Typography

Use IBM Plex Sans if its WOFF2 files and SIL Open Font License are copied into this project. Otherwise use the system fallback stack. Do not depend on a third-party font CDN.

| Role | Size | Weight | Line height |
|---|---:|---:|---:|
| Page title | `28px` | `650` | `1.2` |
| Section title | `20px` | `600` | `1.3` |
| Card title | `16px` | `600` | `1.35` |
| Body | `15px` | `400` | `1.55` |
| Label | `13px` | `600` | `1.35` |
| Caption | `13px` | `400` | `1.45` |
| Table body | `13px` to `14px` | `400` | `1.35` |
| Numeric data | `13px` to `14px` | `500` | `1.35` |

Use tabular figures for numeric cells, monetary values, percentages, LOC, FP, effort, and duration. Avoid all-uppercase sentences. Short table or section identifiers such as `Table 7` may use uppercase only if the text remains readable.

# Layout

- Desktop sidebar target width: 224 to 240 pixels.
- Main content maximum width: 1200 pixels.
- Main content gutters: 32 pixels desktop, 24 pixels tablet, 16 pixels mobile.
- Major section gap: 24 to 32 pixels.
- Card padding: 16 pixels.
- Table cell padding: 8 pixels vertical and 10 to 12 pixels horizontal.
- Avoid nested page scrolling.
- At 375 pixels, navigation becomes an explicit drawer or compact menu and the page must not overflow horizontally.
- Wide tables may scroll inside a bounded table region with the first column kept readable when practical.

# Navigation

The navigation exists to show course structure, not product marketing.

- Keep destinations stable between pages.
- Highlight the active destination with blue text, a subtle blue background, and a left or logical-start indicator.
- Use a visible text label for every destination.
- Preserve URL hash navigation in the web app.
- Preserve Streamlit page state when moving between related calculators.
- The theme control belongs in the application chrome, not inside a calculator card.

# Components

## Buttons

- Primary: blue fill, white text, 6px radius, 40 to 44px minimum height.
- Secondary: surface background, default border, primary text.
- Quiet: no filled background until hover, used for low-priority actions.
- Danger: reserved for destructive actions and never used for ordinary validation.
- Hover and pressed states change color or border without moving layout.
- Focus uses a visible 2px ring with a small offset.
- Disabled controls remain readable and non-interactive.

## Inputs

- Visible label above every input.
- Minimum height 42px, preferably 44px on touch layouts.
- Default border remains visible in both themes.
- Helper text explains units or constraints.
- Validation appears below the affected field and states how to recover.
- Do not use placeholder text as the only label.

## Cards and formula regions

- Use cards only to group a meaningful task, formula, or result.
- Prefer borders and surface contrast over shadow.
- Formula regions use the inset background and monospace only for the formula itself.
- Avoid a card inside another card unless the inner element is a distinct interactive group.

## Tables

- Column headers use the subtle background and semibold text.
- Sticky headers are allowed for long tables.
- Numeric values align right. Labels align to the reading direction.
- Row hover is subtle and cannot be the only indication of selection.
- Selected rows include text or control state in addition to color.
- Compact density is preferred, but body text must not drop below 13px.
- Essential source values are never hidden on mobile. Use a bounded horizontal table scroller when needed.
- Each table keeps its course number and source title visible.

## Results

- Show the main result first, then supporting values and formula details.
- Always display units.
- Distinguish exact calculation results from lecture-rounded examples.
- Do not use decorative KPI tiles when a compact description table is clearer.

## Tabs

- Use tabs only for peer views such as Tables 4 to 6 or Chapter 4 methods.
- Active tab uses blue text and a blue underline or restrained filled state.
- Tabs must expose correct semantic roles and keyboard behavior.
- Switching tabs must not reset valid inputs.

# Theme behavior

## Web application

Use `data-theme="light"` or `data-theme="dark"` on `<html>`. Default to light when there is no valid saved preference. Store only the explicit value under `cpit456-theme`. Apply the stored theme before primary content paints. Set `color-scheme` to the active value.

The control must include an accessible label that describes the action or current state. Theme switching must not reload the page or clear any calculator state.

## Streamlit application

Use native Streamlit theme variants in `.streamlit/config.toml`. Define complete light, dark, light sidebar, and dark sidebar sections. Keep light as the base. Use `st.context.theme.type` for custom Chapter 4 HTML, theme-sensitive images, or charts only when native theming cannot handle the difference.

# Motion

- Default interaction transition: 120 to 180 milliseconds.
- Animate opacity, color, border color, or transform only when the change communicates state.
- Do not animate table layout, width, height, or calculation output positions.
- Respect `prefers-reduced-motion` and disable nonessential transitions.
- No decorative entrance animation is required.

# Icons and visual assets

- Streamlit uses Material Symbols.
- The web app uses a small local SVG set with one stroke style.
- Do not use emoji as functional icons.
- Decorative illustration is optional and should not compete with data tables.
- Do not copy Capstone logos or product-specific artwork.
- Any copied font must include its license and a record in `assets/README.md`.

# Chapter 4 completion

Tables 8 through 11 should become functional as the project is completed. Preserve the locked blur until each replacement is implemented and tested in both applications. Do not invent missing Intermediate COCOMO multipliers. If the course reference does not supply a value, use a validated user-entered multiplier and explain it.

When complete, Chapter 4 should use the same surface, table, input, validation, and theme tokens as the rest of the product. It must not look like a separate experimental dashboard.

# Accessibility and verification

- WCAG AA contrast in both themes.
- Visible keyboard focus on every interactive control.
- Logical heading hierarchy.
- Proper labels, table headers, landmarks, tab semantics, and live error messaging.
- Color never communicates meaning alone.
- Minimum 44 by 44 pixel touch targets where practical.
- Verify at 375, 768, 1024, and 1440 pixels.
- Verify light, dark, keyboard-only, and reduced-motion behavior.
- Verify browser console output and Streamlit AppTest results.

# Anti-patterns

- generic AI dashboard styling
- dark-only interface
- gradients or neon accents
- large rounded cards everywhere
- excessive badges or chips
- oversized blank space around small calculators
- low-contrast gray text
- colorful tables without semantic need
- hardcoded colors inside components
- remote font dependencies
- hidden mobile data
- decorative motion
- removing course table numbers or source titles

