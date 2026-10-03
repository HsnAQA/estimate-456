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
| `fonts/Alexandria-Variable-arabic.woff2` | npm `@fontsource-variable/alexandria` 5.3.0, same family as the user's `Desktop\Random\Assets\Fonts\Arabic\Alexandria` | SIL OFL 1.1, `fonts/licenses/Alexandria-OFL.txt` | All Arabic text and headings |
| `fonts/FiraCode-Variable-latin.woff2` | npm `@fontsource-variable/fira-code` 5.3.0, same family as the user's `Desktop\Random\Assets\Fonts\English\Fira Code` | SIL OFL 1.1, `fonts/licenses/FiraCode-OFL.txt` (copied from the user's folder) | English text and numbers |
| `fonts/JosefinSans-VariableFont_wght.ttf` | Copied unmodified from the user's `Desktop\Random\Assets\Fonts\English\Josefin Sans` (Google Fonts) | SIL OFL 1.1 with Reserved Font Name, `fonts/licenses/JosefinSans-OFL.txt` | English page headings; not subset or converted, so the name stays valid |
| `web-app/vendor/anime/` | npm `animejs` 4.5.0 (UMD minified bundle) | MIT, `web-app/vendor/anime/LICENSE.md` | Entrance motion for sheets, cards, and worked-solution steps |
| `web-app/vendor/katex/` | npm `katex` 0.19.0 (minified JS, CSS, WOFF2 fonts) | MIT, `web-app/vendor/katex/LICENSE` | Typesets the formulas offline, no CDN |

Fonts in the user's assets folder that are not used: the Ministry of Culture fonts (Saudi, Al-Awwal, The Year of Handicrafts, The Year of the Camel), whose license forbids sharing the files, which a public repository does; Alnaseeb, Arabic Poetry, Masmak, and Watad (no license file); Chillax (Fontshare license does not allow giving the files away); Ramis Arabic trial and InkBrush demo (trial and demo licenses). The site used Saudi and The Year of Handicrafts until 2026-10-03; `assets/fonts/private/` stays in `.gitignore` so those files can never be committed by mistake.

The Capstone reference project was read only. Nothing from it is in this repository.
