#!/usr/bin/env python
from pathlib import Path
from PIL import Image

PAPER = (244, 243, 239, 255)
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/logo.png"
ICONS = ROOT / "assets/icons"


def load_trimmed():
    im = Image.open(SRC).convert("RGBA")
    box = im.getbbox()
    return im.crop(box) if box else im


def square(logo, size, margin_ratio):
    canvas = Image.new("RGBA", (size, size), PAPER)
    inner = int(size * (1 - margin_ratio * 2))
    w, h = logo.size
    scale = inner / max(w, h)
    fit = logo.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    canvas.alpha_composite(fit, ((size - fit.width) // 2, (size - fit.height) // 2))
    return canvas


def main():
    logo = load_trimmed()
    ICONS.mkdir(parents=True, exist_ok=True)

    f16 = square(logo, 16, 0.06)
    f32 = square(logo, 32, 0.06)
    f16.save(ICONS / "favicon-16.png")
    f32.save(ICONS / "favicon-32.png")
    square(logo, 48, 0.06).save(
        ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )

    square(logo, 180, 0.16).save(ICONS / "apple-touch-icon.png")

    og = Image.new("RGBA", (1200, 630), PAPER)
    w, h = logo.size
    scale = 380 / max(w, h)
    fit = logo.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    og.alpha_composite(fit, ((1200 - fit.width) // 2, (630 - fit.height) // 2))
    og.convert("RGB").save(ROOT / "assets/og.png", optimize=True)

    print("已生成: favicon.ico / assets/icons/favicon-16.png / assets/icons/favicon-32.png / "
          "assets/icons/apple-touch-icon.png / assets/og.png")


if __name__ == "__main__":
    main()
