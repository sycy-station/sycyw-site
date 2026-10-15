"""Keep the supplied App screenshots intact and extract their existing wordmark."""
from pathlib import Path
import argparse
import shutil
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path("C:/Users/dongy/Desktop/pic(1)")
DEST = ROOT / "assets/products"
SOURCES = {
    "home.png": "首页.png",
    "rankings.png": "排行榜.png",
    "playlists.png": "歌单.png",
    "favorites.png": "红心歌单.png",
    "profile.png": "用户.png",
    "recent.png": "最近播放.png",
}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE, help="Directory of the six supplied screenshots")
    source_dir = parser.parse_args().source
    # Validate every source before replacing any project assets.
    for source in SOURCES.values():
        with Image.open(source_dir / source) as supplied:
            if supplied.size != (1920, 1032):
                raise ValueError(f"Unexpected screenshot dimensions: {source}: {supplied.size}")
    DEST.mkdir(parents=True, exist_ok=True)
    for filename, source in SOURCES.items():
        shutil.copyfile(source_dir / source, DEST / filename)
    mark = Image.open(DEST / "home.png").convert("RGB").crop((25, 20, 119, 58))
    transparent = Image.new("RGBA", mark.size, (0, 0, 0, 0))
    transparent.putalpha(ImageOps.invert(ImageOps.grayscale(mark)))
    transparent.save(DEST / "music-wordmark.png")
    print("Prepared six original screenshots and their existing music wordmark.")
