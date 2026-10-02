"""Renders the PNG sizes of estimate-456-mark.svg with Pillow.

The drawing below mirrors the SVG exactly (64 unit grid). Run from this folder:
    python render_png.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SCALE = 16  # draw at 1024 px, then downsample for clean edges
TILE, MARK, POINT = "#0b6b4f", "#f7f9fc", "#8fd3b5"


def draw() -> Image.Image:
    s = SCALE
    image = Image.new("RGBA", (64 * s, 64 * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(image)
    d.rounded_rectangle((0, 0, 64 * s - 1, 64 * s - 1), radius=14 * s, fill=TILE)
    half = 3 * s  # stroke width 6 with round caps

    def stroke(x1: float, y1: float, x2: float, y2: float) -> None:
        d.rounded_rectangle((x1 * s - half, y1 * s - half, x2 * s + half, y2 * s + half), radius=half, fill=MARK)

    stroke(21, 17, 43, 17)
    stroke(21, 32, 36, 32)
    stroke(21, 47, 43, 47)
    stroke(21, 17, 21, 47)
    d.rounded_rectangle((41 * s, 29 * s, 47 * s, 35 * s), radius=int(1.5 * s), fill=POINT)
    return image


if __name__ == "__main__":
    big = draw()
    for size in (32, 64, 128, 180, 512):
        big.resize((size, size), Image.LANCZOS).save(HERE / f"estimate-456-mark-{size}.png", optimize=True)
    print("PNG sizes written.")
