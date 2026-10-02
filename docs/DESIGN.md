---
version: "1.0"
name: "Estimate 456"
description: "A clear bilingual course companion for software project estimation."
defaultTheme: "light"
supportedThemes:
  - "light"
  - "dark"
fonts:
  ui: "Fira Code, Saudi, Alexandria, monospace"
  data: "Fira Code"
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

# Current web design (2026-10-02, drafting notebook)

Concept generated in Google Stitch (project "Estimate 456 - CPIT 456 estimation"), then adapted to the app. Only real lecture content is shown; none of the labels Stitch invented were used. Where older notes below disagree, this section wins.

- Feel: an engineering drafting notebook. Paper page with a faint 24 px grid, sheets with 1 px rules, sharp corners (0 radius), no shadows except a flat 4 px offset on hovered cards.
- Colors. Light (default): paper `#f7f6f2`, sheets `#fdfcf9`, ink navy text and primary buttons `#14213d`, signal orange `#b83c15` for labels, step numbers, the active link, and linked values. Dark: page `#0f141d`, sheets `#141b26`, text `#e9edf4`, orange `#ff7d55`.
- Type: Fira Code for all English text and numbers. Arabic: the Saudi font for text and The Year of Handicrafts for page headings (both Ministry of Culture, on the published site only), Alexandria as fallback.
- Layout: one top bar with the logo, Part 1 and Part 2 links (the part labels in orange), and buttons for search, theme (moon in light, sun in dark), and language. Page title with a ruled line under it. Inputs sheet beside the result.
- Inputs: label above, value on the left, unit in a tinted slot on the right.
- Result: a double ruled frame, the answer in a tinted box, then a ledger with dotted leaders and striped rows.
- Worked solution: each step is an index card: STEP n, the title, the lecture value, the formula in a tinted box, then the substituted values.
- Choices and tabs: contiguous bordered segments; the chosen one is filled with ink.
- Home: an orange section tag, a large headline, two part panels joined in one frame with big 01 and 02 numerals, then the chosen part's method cards.
- No tap highlight, no focus frame on the page area, no flash on changed results.
- Motion: the home heading sits on a live blueprint particle network (own canvas code inspired by particles.js, in the page colors, reacting to the pointer). Pages, cards, and worked-solution steps enter with short staggered motion from anime.js. Results never animate their numbers. All motion stops under prefers-reduced-motion and the network pauses when the tab is hidden. Three.js was considered and left out: it is heavy and a 3D scene does not help a calculator.
- Formulas: typeset with KaTeX (vendored) in a tinted box; powers in the substituted values are superscripts. The same symbolic TeX serves both languages and the Glossary defines the symbols.
- Learn pages: Course notes (table of contents beside sections, each with its source and a link to its calculator) and Glossary (filterable cards with the term, its formula, a definition, and where it is used). The top bar lists them after Part 2.

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

