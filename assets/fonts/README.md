# Font files

IBM Plex Sans and IBM Plex Sans Arabic are bundled in three weights each. One license, `licenses/IBM-Plex-OFL.txt`, covers both, because IBM releases the whole Plex family under the same SIL Open Font License.

| File | Weight | Used for |
|---|---:|---|
| `IBMPlexSans-Regular.woff2` | 400 | Body text and table cells |
| `IBMPlexSans-Medium.woff2` | 500 | Navigation labels and numeric emphasis |
| `IBMPlexSans-SemiBold.woff2` | 600 | Headings, labels, and buttons |
| `IBMPlexSansArabic-Regular.woff2` | 400 | Arabic body text (web app) |
| `IBMPlexSansArabic-Medium.woff2` | 500 | Arabic navigation and numeric emphasis (web app) |
| `IBMPlexSansArabic-SemiBold.woff2` | 600 | Arabic headings, labels, and buttons (web app) |

Both applications keep a system fallback stack, so they still work if these files are removed:
`"IBM Plex Sans", "Segoe UI Variable", "Segoe UI", Arial, sans-serif`.

- Web app: `@font-face` rules at the top of `web-app/styles.css` with `font-display: swap`. The stack lists IBM Plex Sans first and IBM Plex Sans Arabic second. IBM Plex Sans has no Arabic glyphs, so Arabic letters fall through to IBM Plex Sans Arabic while Latin letters and digits keep IBM Plex Sans in both languages.
- Streamlit app: `[[theme.fontFaces]]` in `streamlit-app/.streamlit/config.toml`, served from `streamlit-app/static/fonts/`.

No weight is preloaded. Each Latin file is about 65 KB and each Arabic file about 75 KB, and `font-display: swap` shows fallback text while it loads.

Do not copy restricted or demo-only fonts. Record every new font in `../README.md`.
