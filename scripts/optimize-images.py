"""Create pixel-identical WebP copies of the site's PNG screenshots (Pillow)."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [ROOT / "assets/logo.png"] + [
    ROOT / "assets/products" / name
    for name in ("home.png", "rankings.png", "playlists.png", "favorites.png", "profile.png", "recent.png", "music-wordmark.png")
]

for source in SOURCES:
    destination = source.with_suffix(".webp")
    with Image.open(source) as image:
        pixels = image.convert("RGBA")
        pixels.save(destination, "WEBP", lossless=True, quality=100, method=6, exact=True)
        with Image.open(destination) as result:
            if result.convert("RGBA").tobytes() != pixels.tobytes():
                destination.unlink()
                raise RuntimeError(f"Pixel verification failed: {source.name}")
    print(f"{source.relative_to(ROOT)}: {source.stat().st_size} -> {destination.stat().st_size} bytes (pixel-identical)")
