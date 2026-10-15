# 次元坞 / 森韵音乐介绍页

沿用现有全站导航、标题飞入和纸面视觉，以一体化框架展示 App。
左侧介绍、右侧完整界面、底部六个章节切换；手机使用上下布局。
桌面为截图分配约 73% 的内容列宽，导航六项一排；1100px 以下导航改为三列两行。
页面固定单屏，原始截图保留比例，可点击图片打开界面预览。
预览支持上一张、下一张、左右键与 Escape 关闭。

素材全部来自用户在 2026-10-15 最新提供的桌面端截图，严格按指定顺序：

| 章节 | 素材 | 原图尺寸 |
| --- | --- | --- |
| 首页 | assets/products/home.png | 1920 × 1032 |
| 排行榜 | assets/products/rankings.png | 1920 × 1032 |
| 歌单 | assets/products/playlists.png | 1920 × 1032 |
| 红心歌单 | assets/products/favorites.png | 1920 × 1032 |
| 用户 | assets/products/profile.png | 1920 × 1032 |
| 最近播放 | assets/products/recent.png | 1920 × 1032 |

源目录为 `C:/Users/dongy/Desktop/pic(1)`，通过 `python build/prepare-product-assets.py --source <素材目录>` 原样复制。
附件中的「下载管理」不在用户指定的六项顺序中，因此未加入章节。

`music-wordmark.png` 为最新首页截图内「森韵」原标识的透明裁剪。
主展示与预览都完整保留原图比例，不裁切图片中的侧栏或底部播放器。
章节及预览总数根据数据生成，支持六张图片循环浏览。
未增加未经提供的下载地址、发布状态、用户数或真实播放能力。
波形与轨道只作为页面装饰，并响应减少动态效果的系统设置。

内容源：`build/products-room.js`；布局：`products-room.css`；交互：`products-room.js`。
生成本页：`node build/build.js --only products`。
