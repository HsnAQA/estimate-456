# Brand assets

Original Estimate 456 marks only. Do not copy the Capstone logo or any third-party product identity.

| File | Description | Used by |
|---|---|---|
| `estimate-456-mark.svg` | Product logo: a rounded blue tile (`#2b5cb8`) with a snow-white geometric E and one light data point at the end of the middle bar | Web app sidebar, home page, footer, and browser icon. Streamlit browser icon. Packaged Vercel site |
| `estimate-456-mark-32.png` | 32 px PNG of the same mark | Browser tab fallback icon |
| `estimate-456-mark-64.png`, `-128.png`, `-512.png` | Larger PNG sizes of the same mark | Documentation and sharing |
| `estimate-456-mark-180.png` | 180 px PNG | `apple-touch-icon` |
| `render_png.py` | Pillow script that draws the PNG sizes from the same 64 unit geometry as the SVG | Run `python render_png.py` after changing the mark |

The mark was drawn for this project on 2026-10-02. It is project-owned and contains no third-party artwork. It stays legible at 16, 32, 64, and 128 px because it uses one solid tile and three thick strokes.
