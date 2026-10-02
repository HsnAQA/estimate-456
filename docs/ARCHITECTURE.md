# Architecture

Estimate 456 is two apps that compute the same lecture formulas: a static web
app (the published one) and a Streamlit app. Shared fixtures keep them equal.

## Web app

`web-app/index.html` holds every page as a `<section class="page">`. The URL
hash picks the page (`#home`, `#sloc`, `#cocomo`, `#notes`, ...), so the app
works from disk with no server and no build step.

Scripts load in this order, each adding one global object:

| File | Global | Role |
|---|---|---|
| `js/theme.js` | none | applies the saved theme before first paint |
| `vendor/katex/katex.min.js` | `katex` | typesets TeX (MIT, vendored) |
| `js/math.js` | `MATH` | TeX for each formula, keyed by its translation key |
| `js/content.js` | `CONTENT` | course notes sections and glossary terms, in both languages |
| `js/logic.js` | `LOGIC` | pure calculations: no DOM, also loaded by Node tests |
| `js/data.js` | `DATA` | the eleven course tables and the lecture examples |
| `js/i18n.js` | `I18N` | English and Arabic strings |
| `js/ui.js` | `UI` | shared rendering: worked-solution steps, tables, number format |
| `js/app.js` | none | binds each page's inputs to `LOGIC` and renders the result |
| `vendor/anime/anime.umd.min.js` | `anime` | motion (MIT, vendored) |
| `js/motion.js` | none | home network canvas and entrance motion; respects reduced motion |

Data flows one way: an input changes, `app.js` reads every input on that page,
calls one `LOGIC` function, and redraws the result and its worked solution.
Inputs are saved in `localStorage` (format v2) and restored on load.

`css/styles.css` holds all styles. Colors, spacing, and fonts are CSS
variables on `:root`, with a dark set under `[data-theme="dark"]`. The visual
rules are in [DESIGN.md](DESIGN.md).

## Streamlit app

`streamlit-app/streamlit_app.py` builds the navigation. Each page lives in
`app_pages/`. `calculations.py` mirrors `logic.js` with dataclass results, and
`ui_data.py` mirrors the tables in `data.js`.

## Keeping both apps equal

`shared/fixtures/calculations.json` lists input and output cases. The Node
suite (`fixtures.test.js`) runs them through `logic.js`; the Python suite
(`test_fixtures.py`, `test_data_parity.py`) runs them through
`calculations.py` and compares the tables in `data.js` with `ui_data.py`.

## Published site

`web-app/tools/build-site.js` copies `index.html`, `css/`, `js/`, `vendor/`,
the logo, the licensed fonts, and their licenses into `site/`, then writes
`vercel.json` with security headers. The Ministry of Culture Arabic fonts are
copied only when present on the publishing machine, since their license allows
website use but not sharing the files. See [DEPLOYMENT.md](DEPLOYMENT.md).
