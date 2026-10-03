# Changelog

## 2026-10-03: open fonts and deploys from GitHub

- Arabic text and headings use Alexandria, English headings use Josefin Sans,
  English text stays in Fira Code. The Ministry of Culture fonts are removed,
  because their license forbids sharing the files.
- Vercel deploys from this repository on every push to `main`. Its settings
  are in `vercel.json`.

## 2026-10-02: math, learn pages, motion, and a reorganized repository

- Formulas are typeset as math with KaTeX, vendored so the site works offline.
- New Course notes page (seven topics, each with its source) and Glossary page
  (31 terms with symbols and definitions).
- COCOMO now gives development time and staff on every level, from the COCOMO
  article read in class: Tdev = 2.5 x E^d, staff = E / Tdev.
- New palette: cool snow paper, ink navy, and a cobalt accent replace the
  beige and orange. New logo and tab icon: the approximately equal sign on a cobalt tile.
- A moving blueprint network on the home page and quiet entrance motion, with
  anime.js.
- The Streamlit version is removed; the web app is the only version.
- The web app is split into `css/`, `js/`, and `vendor/`. Documentation moved
  into `docs/`. Added contributing, security, issue and pull request
  templates, and a GitHub Actions test workflow.

## 2026-10-02: drafting notebook design

- New design built with Stitch: paper grid, ink navy, one orange accent,
  ledger-style results, numbered solution steps.
- Fira Code for English, the Ministry of Culture Saudi font for Arabic.
- One top bar, sun and moon theme button that matches the theme, a calm tab
  icon, and no highlight on click.

## 2026-10-02: two parts and complete COCOMO

- The app follows the lecture in two parts: Chapter 1 (SLOC, FP) and Chapter 4
  (planning, defects, COCOMO, Delphi).
- COCOMO Basic, Intermediate, and Advanced for all three modes.
- Function Points show F1 to F14, each row's own weight, Sum Fi, CT, VAF, and
  FP with live substitution.
- Public repository, footer with the GitHub link, new logo, and the name
  Estimate 456.
