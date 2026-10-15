"""Generate responsive previews; keep original screenshots and portraits intact."""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = ("home", "rankings", "playlists", "favorites", "profile", "recent")


def save(source, destination, width=None, *, lossless=False, quality=92):
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGBA")
        if width and image.width > width:
            height = round(image.height * width / image.width)
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", lossless=lossless, quality=quality,
                   method=6, exact=True)
        if lossless:
            with Image.open(destination) as result:
                if result.convert("RGBA").tobytes() != image.tobytes():
                    raise RuntimeError(f"Lossless verification failed: {source.name}")
    print(f"{destination.relative_to(ROOT)}: {destination.stat().st_size} bytes")
    return image.width


for name in PRODUCTS:
    source = ROOT / "assets/products" / f"{name}.png"
    for width in (640, 960):
        save(source, source.with_name(f"{name}-{width}.webp"), width)

for name in ("linfeng", "minebbs", "tiank"):
    source = ROOT / "assets/reference" / f"{name}.png"
    # Brand marks stay pixel-identical, including their transparent edges.
    save(source, source.with_suffix(".webp"), lossless=True, quality=100)

portraits = {}
for source in sorted((ROOT / "assets/reference/team").iterdir()):
    if source.suffix.lower() not in (".png", ".jpg", ".jpeg"):
        continue
    variants = []
    for width in (240, 500):
        destination = source.with_name(f"{source.stem}-{width}.webp")
        actual_width = save(source, destination, width)
        variants.append({"src": destination.relative_to(ROOT).as_posix(), "width": actual_width})
    portraits[source.relative_to(ROOT).as_posix()] = variants

(ROOT / "src/content/team-image-variants.json").write_text(
    json.dumps(portraits, indent=2) + "\n", encoding="utf-8")
