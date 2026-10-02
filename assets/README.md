# Assets

| Folder | Contents |
|---|---|
| `brand/` | The Estimate 456 logo (SVG and PNG sizes) and the script that renders the PNGs |
| `fonts/` | Web app fonts and their licenses |
| `icons/` | Project-owned outline SVG icons, inlined into `web-app/index.html` by `web-app/tools/sync-icons.js` |

## Ledger

| Asset | Source | License | Notes |
|---|---|---|---|
| `brand/estimate-456-mark.svg` and PNGs | Drawn for this project | Project-owned | The approximately equal sign in snow `#f5f7fa` on a rounded cobalt tile `#2c56c9`; readable at 16 px on dark and light tabs |
| `icons/*.svg` | Drawn for this project | Project-owned | 24 px grid, 1.75 stroke |
| GitHub mark in the footer | `mark-github` from GitHub Octicons | MIT; GitHub logo used only to link to the repository | Inline SVG path in `web-app/index.html` |
| `fonts/Alexandria-Variable-arabic.woff2` | npm `@fontsource-variable/alexandria` 5.3.0, same family as the user's `Desktop\Random\Assets\Fontss\Alexandria` | SIL OFL 1.1, `fonts/licenses/Alexandria-OFL.txt` | Arabic fallback |
| `fonts/FiraCode-Variable-latin.woff2` | npm `@fontsource-variable/fira-code` 5.3.0, same family as the user's `Desktop\Random\Assets\Fontss\Fira_Code` | SIL OFL 1.1, `fonts/licenses/FiraCode-OFL.txt` (copied from the user's folder) | All English text |
| `web-app/vendor/anime/` | npm `animejs` 4.5.0 (UMD minified bundle) | MIT, `web-app/vendor/anime/LICENSE.md` | Entrance motion for sheets, cards, and worked-solution steps |
| `web-app/vendor/katex/` | npm `katex` 0.19.0 (minified JS, CSS, WOFF2 fonts) | MIT, `web-app/vendor/katex/LICENSE` | Typesets the formulas offline, no CDN |
| `fonts/private/TheYearofHandicrafts-Bold.otf`, `-Black.otf` | Ministry of Culture, from the user's `Desktop\Random\Assets\الخطوط_المستخدمة` | Ministry end-user license, same terms as the Saudi font | Ignored by git; Arabic headings on the published site |
| `fonts/private/Saudi-Regular.ttf`, `Saudi-Bold.ttf` | Ministry of Culture, https://engage.moc.gov.sa/e/fonts/saudi-font/ | Ministry end-user license. Section 2 allows websites; section 3 forbids copying, distributing, converting, or bundling the file | Ignored by git and served unconverted by the published site only |

Fonts in the user's assets folder that were not used: Chillax (Fontshare license does not allow giving the files away), Ramis Arabic trial and InkBrush demo (trial and demo licenses).

The Capstone reference project was read only. Nothing from it is in this repository.
