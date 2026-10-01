# Estimate 456

Estimate 456 is a bilingual software project estimation companion for CPIT 456. It follows the lecture in two parts and keeps every result auditable by showing the formula, the substituted values, and the source table.

## Course structure

### Part 1, Chapter 1

- SLOC effort, duration, cost, and cost per line
- Function Point count from five independently weighted measurement parameters
- F1 to F14 influence factors, Sum Fi, VAF, FP, and LOC conversion

### Part 2, Chapter 4

- Function Point planning by hours or productivity
- Defect density comparison
- Basic and Intermediate COCOMO
- Delphi variance and acceptance

All eleven course tables are included. The app does not invent COCOMO duration equations or Intermediate COCOMO multipliers that are absent from the lecture.

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

- Live site: https://estimate-456.vercel.app
- Repository: https://github.com/HsnAQA/estimate-456
