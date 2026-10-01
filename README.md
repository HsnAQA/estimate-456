# Estimate 456

Estimate 456 is a bilingual software project estimation companion for CPIT 456. It follows the lecture in two parts and keeps every result auditable by showing the formula, the substituted values, and the source table.

## Course structure

### Part 1, Chapter 1

- SLOC effort, duration, and cost, both ways shown in the lecture (effort first, or cost per LOC first)
- Function Point count from five independently weighted measurement parameters
- F1 to F14 influence factors, Sum Fi, VAF, FP, and LOC conversion

### Part 2, Chapter 4

- Function Point planning by hours or productivity
- Defect density comparison
- COCOMO at all three levels named in the lecture, each for organic, semi-detached, and embedded projects:
  - Basic: Ei = C x KLOC^K with the Table 8 constants
  - Intermediate: E = EAF x Ei with 15 cost drivers
  - Advanced: phase effort = Ei x share x phase EAF, summed over the phases you enter
- Delphi variance and acceptance

All eleven course tables are included. The lecture does not print the COCOMO duration equations, an Intermediate multiplier matrix, or Advanced phase values, so the app does not invent them: duration is explained as not calculable, and the missing values are clear user inputs. [`docs/TRACEABILITY.md`](docs/TRACEABILITY.md) maps every formula and constant to its lecture page, its exact and lecture-rounded result, where it appears in both apps, and the test that covers it.

## Repository layout

| Path | Contents |
|---|---|
| `web-app/` | HTML, CSS, and JavaScript app, its unit and browser tests, and the packaging script |
| `streamlit-app/` | Python and Streamlit app and its tests |
| `shared/fixtures/` | Calculation cases both implementations must pass |
| `assets/` | Logo, licensed IBM Plex fonts, and icons, with a license ledger in `assets/README.md` |
| `docs/` | Formula traceability |
| `design.md` | Visual rules: tokens, type, layout, and accessibility |
| `launch.bat`, `stop.bat` | Windows launchers |

Course PDFs, lecture documents, backups, local environments, and secrets are not part of the repository.

## Applications

- `web-app/`: the complete responsive application. It runs from plain HTML, CSS, and JavaScript, supports English and Arabic, and uses a snow-white light theme by default.
- `streamlit-app/`: an English Streamlit implementation using the same data, formulas, validation, and examples.
- `shared/fixtures/`: calculation cases used to verify parity between JavaScript and Python.

## Run locally

Run `launch.bat` and select an application, or launch one directly:

```powershell
web-app\launch.bat
streamlit-app\launch.bat
```

The web version has no runtime dependencies or build step. The Streamlit launcher creates its environment outside the project when needed.

## Verify

Web unit and browser checks:

```powershell
cd web-app
node --test "tests/*.test.js"
node tests/e2e/run-e2e.mjs
$env:E2E_URL = "https://estimate-456.vercel.app/"; node tests/e2e/run-e2e.mjs
```

Python and cross-implementation checks:

```powershell
cd streamlit-app
& "..\.venv-cpit456\Scripts\python.exe" -m unittest discover -s tests -v
```

Launcher checks:

```powershell
launch.bat --check
stop.bat --check
```

## Package and deploy the web app

`web-app/` is the source. `site/` is generated output and must not be edited directly.

```powershell
cd web-app
node tools/build-site.js
cd ..\site
npx vercel@latest deploy --prod
```

The package contains only the browser files, the product logo, six licensed font files, and their IBM Plex license. Course PDFs, transfer archives, temporary files, and local environments are excluded from the public repository and deployment.

## Data and privacy

All calculations run locally in the browser. Inputs are saved only in browser storage. No account, analytics service, API, or server database is used.

## Author

Made by Hassan Asiri.

Live site: https://estimate-456.vercel.app
