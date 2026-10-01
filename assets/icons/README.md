# Web icon set

Small, brand-neutral outline icons drawn for CPIT 456. All use a 24 by 24 view box, `stroke="currentColor"`, a 1.75 stroke width, and round caps and joins, so they follow the active theme and method color.

| File | Used for |
|---|---|
| `home.svg` | Home navigation |
| `code.svg` | SLOC method |
| `sigma.svg` | Function Points method |
| `calendar.svg` | FP planning method |
| `tree.svg` | COCOMO method |
| `users.svg` | Delphi method |
| `bug.svg` | Defect density |
| `trend.svg` | Project summary |
| `book.svg` | Course table library |
| `search.svg` | Search fields |
| `sun.svg`, `moon.svg` | Light and dark theme controls |
| `menu.svg`, `close.svg` | Open and close the navigation drawer |
| `edit.svg` | Editable project name |
| `flask.svg` | Load lecture example buttons |
| `plus.svg` | Add project and Add task |
| `trash.svg` | Remove a table row |
| `reset.svg` | Reset examples |
| `info.svg` | Notes |
| `warning.svg` | Invalid input and warning banners |
| `check.svg` | Accepted status and success banners |
| `x-circle.svg` | Not accepted status |
| `arrow-right.svg` | Links to another page |
| `chevron-down.svg` | Reserved for collapsible panels |

## Keeping the web app in sync

The web app is opened directly from disk, where browsers block external SVG sprite references, so `web-app/index.html` holds an inline sprite built from these files. After adding or changing an icon, run from `web-app`:

```powershell
node tools/sync-icons.js
```

`web-app/tests/icons.test.js` fails when the sprite and these files differ, or when the page uses an icon that is not in the sprite.

Streamlit uses its built-in Material Symbols and does not use these files. Do not use emoji, copied product logos, or Capstone branding.
