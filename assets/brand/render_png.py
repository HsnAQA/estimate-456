"""Renders the PNG sizes of estimate-456-mark.svg with Pillow.

The drawing below mirrors the SVG exactly (64 unit grid). Run from this folder:
    python render_png.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SCALE = 16  # draw at 1024 px, then downsample for clean edges
TILE, MARK = "#2c56c9", "#f5f7fa"
STROKE = 6.5
# The mark is the "approximately equal" sign: an estimate is a careful approximation.
# Each wave is two cubic curves, the same points as the SVG path.
WAVES = (
    ((14, 26), (20, 18), (26, 18), (32, 26), (38, 34), (44, 34), (50, 26)),
    ((14, 42), (20, 34), (26, 34), (32, 42), (38, 50), (44, 50), (50, 42)),
)


def cubic(p0, p1, p2, p3, steps=80):
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        yield (
            u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1],
        )


def draw() -> Image.Image:
    s = SCALE
    image = Image.new("RGBA", (64 * s, 64 * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(image)
    d.rounded_rectangle((0, 0, 64 * s - 1, 64 * s - 1), radius=14 * s, fill=TILE)
    r = STROKE / 2 * s
    for p in WAVES:
        points = list(cubic(p[0], p[1], p[2], p[3])) + list(cubic(p[3], p[4], p[5], p[6]))
        for x, y in points:
            d.ellipse((x * s - r, y * s - r, x * s + r, y * s + r), fill=MARK)
    return image


if __name__ == "__main__":
    big = draw()
    for size in (32, 64, 128, 180, 512):
        big.resize((size, size), Image.LANCZOS).save(HERE / f"estimate-456-mark-{size}.png", optimize=True)
    # favicon.ico at the site root: Vercel and some browsers read only this file.
    big.resize((256, 256), Image.LANCZOS).save(HERE / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("PNG sizes written.")
