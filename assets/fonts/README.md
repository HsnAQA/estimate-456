# Web app fonts

| File | Used for | License |
|---|---|---|
| `FiraCode-Variable-latin.woff2` | All English text, numbers, and formulas | SIL OFL 1.1 |
| `Alexandria-Variable-arabic.woff2` | Arabic fallback when the Ministry fonts are not available | SIL OFL 1.1 |
| `private/Saudi-*.ttf` (not in git) | Arabic body text on the published site | Ministry of Culture license |
| `private/TheYearofHandicrafts-*.otf` (not in git) | Arabic page headings on the published site | Ministry of Culture license |

The Ministry of Culture license allows use on websites but forbids copying, distributing, converting, or bundling the files, so `private/` is ignored by git and its files are served unconverted by the published site only. `web-app/tools/build-site.js` copies `private/` into `site/` when it exists on the build machine.
