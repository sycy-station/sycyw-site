#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
从 assets/logo.png 派生站点图标与分享图（一次性工具，不参与 node build）
------------------------------------------------------------
用法：  python build/icons.py
产物：  favicon.ico / favicon-16.png / favicon-32.png
        apple-touch-icon.png / assets/og.png

为什么要垫底色：logo 是纯黑 + 透明通道。favicon 若保留透明，深色浏览器
UI 下黑标就贴在黑底上，等于没有图标；iOS 的 apple-touch-icon 更是直接
不支持透明，会自己填黑。所以统一垫 --paper（#f4f3ef），与站点浅色底一致。

改动 logo 后重跑本脚本即可，无需手工导出。
"""

from PIL import Image

PAPER = (244, 243, 239, 255)   # 与 style.css 的 --paper 同值
SRC = "assets/logo.png"


def load_trimmed():
    """裁掉 logo 四周的全透明边，让图标里的视觉重量填满画布。"""
    im = Image.open(SRC).convert("RGBA")
    box = im.getbbox()
    return im.crop(box) if box else im


def square(logo, size, margin_ratio):
    """把 logo 等比缩放居中放到 size×size 的纸色方块上。

    margin_ratio 是四周留白占边长的比例：favicon 极小，留白要少才看得清；
    apple-touch-icon 在桌面上是圆角大图标，留白多一点更像 App。
    """
    canvas = Image.new("RGBA", (size, size), PAPER)
    inner = int(size * (1 - margin_ratio * 2))
    w, h = logo.size
    scale = inner / max(w, h)
    fit = logo.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    canvas.alpha_composite(fit, ((size - fit.width) // 2, (size - fit.height) // 2))
    return canvas


def main():
    logo = load_trimmed()

    # favicon：16/32 单独导出（有些场景直接引 PNG），再合成多尺寸 ico
    f16 = square(logo, 16, 0.06)
    f32 = square(logo, 32, 0.06)
    f16.save("favicon-16.png")
    f32.save("favicon-32.png")
    square(logo, 48, 0.06).save(
        "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )

    # iOS 主屏图标：固定 180，留白大一些
    square(logo, 180, 0.16).save("apple-touch-icon.png")

    # 分享图 1200×630（OG 推荐比例）。不写文字：标题与描述由 og:title /
    # og:description 提供，图里再叠一遍在小卡片上只会挤成一团。
    og = Image.new("RGBA", (1200, 630), PAPER)
    w, h = logo.size
    scale = 380 / max(w, h)
    fit = logo.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    og.alpha_composite(fit, ((1200 - fit.width) // 2, (630 - fit.height) // 2))
    og.convert("RGB").save("assets/og.png", optimize=True)

    print("已生成: favicon.ico / favicon-16.png / favicon-32.png / "
          "apple-touch-icon.png / assets/og.png")


if __name__ == "__main__":
    main()
