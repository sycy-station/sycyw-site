"""Refresh reference copy. Build uses the saved JSON and never needs the network."""
import argparse
import json
from datetime import date
from pathlib import Path
from urllib.request import urlopen

from bs4 import BeautifulSoup

SOURCE = "https://www.syciyuan.cn/join.html"
parser = argparse.ArgumentParser()
parser.add_argument("--html", type=Path, help="Read an already downloaded reference page")
args = parser.parse_args()
soup = BeautifulSoup(args.html.read_text(encoding="utf-8") if args.html else urlopen(SOURCE).read(), "html.parser")


def text(node, selector=None):
    element = node.select_one(selector) if selector else node
    return element.get_text(" ", strip=True)


data = {
    "source": SOURCE,
    "retrieved": date.today().isoformat(),
    "hero": {"title": text(soup, ".join-hero-title"), "description": text(soup, ".join-hero-description")},
    "culture": {
        "intro": text(soup, ".culture-section .section-title p"),
        "items": [{"title": text(item, ".culture-title"), "description": text(item, ".culture-description")} for item in soup.select(".culture-card")],
    },
    "benefits": {
        "intro": text(soup, ".benefits-content > p"),
        "items": [{"title": text(item, "h4"), "description": text(item, "p")} for item in soup.select(".benefit-item")],
    },
    "recruitment": {
        "intro": text(soup, ".job-section .section-title p"),
        "isExample": "不为真实信息" in text(soup, ".job-section .section-title p"),
        "jobs": [{
            "id": item["data-category"], "category": text(item, ".job-tag"),
            "title": text(item, ".job-title"), "location": text(item, ".job-location"),
            "description": text(item, ".job-description"),
            "requirements": [text(requirement, "p") for requirement in item.select(".job-requirement")],
        } for item in soup.select(".job-card")],
    },
    "process": {
        "intro": text(soup, ".process-section .section-title p"),
        "items": [{"title": text(item, ".process-title"), "description": text(item, ".process-description")} for item in soup.select(".process-step")],
    },
    "cta": {"title": text(soup, ".cta-title"), "description": text(soup, ".cta-description")},
    "email": "3896148508@qq.com",
}
assert len(data["culture"]["items"]) == 6
assert len(data["benefits"]["items"]) == 5
assert len(data["recruitment"]["jobs"]) == 3
assert len(data["process"]["items"]) == 5
target = Path(__file__).resolve().parent.parent / "src/content/join-data.json"
target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Saved {target.name}: 6 culture values, 5 benefits, 3 jobs, 5 process steps")
