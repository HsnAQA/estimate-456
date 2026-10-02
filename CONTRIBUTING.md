# Contributing to Estimate 456

This guide takes you from a fresh Windows machine to a merged pull request.
Commands are for PowerShell, run from the repository root unless a step says
otherwise.

## 1. Find your way around

| You want to change | Look in |
|---|---|
| a calculation | `web-app/js/logic.js` |
| course tables and examples | `web-app/js/data.js` |
| English or Arabic text | `web-app/js/i18n.js` |
| course notes or glossary | `web-app/js/content.js` |
| a formula's typeset math | `web-app/js/math.js` |
| a page's markup | `web-app/index.html` |
| page behavior | `web-app/js/app.js` (pages) and `web-app/js/ui.js` (shared helpers) |
| styles and theme tokens | `web-app/css/styles.css` |
| icons | `assets/icons/`, then `node web-app/tools/sync-icons.js` |
| test cases | `shared/fixtures/calculations.json` |

Rules that keep the project correct:

- Every constant comes from the course material. Record its source in
  `docs/TRACEABILITY.md`. If the material does not give a value, make it an
  input and say so on screen.
- When you change a calculation in `logic.js`, add a case to
  `shared/fixtures/calculations.json`, computed from the lecture formula.
- Every new string needs English and Arabic text in `i18n.js`.
- Do not use the U+2014 dash. The repository test fails on it.

## 2. Set up once

```powershell
git clone https://github.com/HsnAQA/estimate-456.git
cd estimate-456
```

The app needs no install. Node.js 20 or newer runs the tests, and the browser
suite uses Edge or Chrome.

## 3. Make a change

```powershell
git checkout -b fix/short-description
# edit
cd web-app; node --test "tests/*.test.js"; node tests/e2e/run-e2e.mjs; cd ..
git add -A
git commit -m "Short summary in the imperative"
git push -u origin fix/short-description
```

Open a pull request. The template asks what changed, why, and how you tested
it, with English and Arabic screenshots for interface changes.

## 4. Publishing

Only the maintainer publishes. The steps are in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): build `site/`, deploy a preview,
test it, then promote it.
