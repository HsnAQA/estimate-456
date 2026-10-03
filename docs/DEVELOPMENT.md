# Development

## Run

| What | Command (from the repository root) |
|---|---|
| open the app | `launch.bat` (opens `web-app/index.html` in your browser) |
| close a local server on port 8765 | `stop.bat` |
| check the launchers | `launch.bat --check` and `stop.bat --check` |

The web app can also be opened by double-clicking `web-app/index.html`.

## Test

```powershell
cd web-app
node --test "tests/*.test.js"
node tests/e2e/run-e2e.mjs
```

| Suite | Covers |
|---|---|
| `logic.test.js`, `cocomo.test.js` | every formula against the lecture values |
| `fixtures.test.js` | the shared cases in `shared/fixtures/calculations.json` |
| `i18n.test.js` | every key exists in English and Arabic |
| `icons.test.js` | inline icons match `assets/icons/` |
| `repo.test.js` | no U+2014, no retired product name, the ignore rules, no stray files |
| `e2e/run-e2e.mjs` | every page in a real browser: both languages, both themes, six widths, console errors, no horizontal scroll |

The browser suite finds Edge or Chrome on its own. Set `BROWSER_PATH` to use
another. Set `E2E_URL` to test a served copy, such as a preview deployment.

## Troubleshooting

| Problem | Fix |
|---|---|
| `git` says "dubious ownership" | run git as `git -c safe.directory=* ...`, or add the folder to `safe.directory` |
| The browser suite cannot find a browser | set `BROWSER_PATH` to `msedge.exe` or `chrome.exe` |
| Icons look out of date | `node web-app/tools/sync-icons.js` |
