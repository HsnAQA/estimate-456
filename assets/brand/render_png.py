"""Renders the PNG sizes of estimate-456-mark.svg with Pillow.

The drawing below mirrors the SVG exactly (64 unit grid). Run from this folder:
    python render_png.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SCALE = 16  # draw at 1024 px, then downsample for clean edges
TILE, MARK = "#2c56c9", "#f5f7fa"
# Three rising bars: size grows into effort, the idea behind every calculator.
BARS = ((13, 36, 23, 50), (27, 26, 37, 50), (41, 14, 51, 50))


def draw() -> Image.Image:
    s = SCALE
    image = Image.new("RGBA", (64 * s, 64 * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(image)
    d.rounded_rectangle((0, 0, 64 * s - 1, 64 * s - 1), radius=12 * s, fill=TILE)
    for x1, y1, x2, y2 in BARS:
        d.rounded_rectangle((x1 * s, y1 * s, x2 * s - 1, y2 * s - 1), radius=2 * s, fill=MARK)
    return image


if __name__ == "__main__":
    big = draw()
    for size in (32, 64, 128, 180, 512):
        big.resize((size, size), Image.LANCZOS).save(HERE / f"estimate-456-mark-{size}.png", optimize=True)
    print("PNG sizes written.")
