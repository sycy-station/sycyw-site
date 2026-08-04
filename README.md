# 森韵次元坞 · SYCYW

极简黑白的多页静态站点。零依赖、零框架、没有工具链——只有一个 200 行的拼装器，
把七个页面从同一份数据生成出来。

- 首页：开屏动画溶解进分区页，六项绕 logo 成弧线排布
- 六个分区页：系统设计 / 交互研究 / 品牌语言 / 前端工程 / 动效编排 / 实验归档
- 跨文档导航带完整转场编排，看起来像单页应用（实际是七个独立 HTML）

## 快速开始

```bash
node build/build.js
```

生成根目录的七个 HTML。本地预览需要 HTTP 服务，`file://` 下 sessionStorage
与相对路径都不可靠：

```bash
python -m http.server 8000
```

构建器无 npm 依赖，Node 14+ 即可。

## 目录

| 路径 | 说明 |
| --- | --- |
| `build/pages.js` | **站点结构的唯一来源**，改站点先改这里 |
| `build/build.js` | 拼装器。两条语法：`{{> partial }}` 与 `{{ var }}` |
| `build/src/` | 页面模板：`index.html` 首页，`page.html` 六个子页共用 |
| `build/partials/` | 复用片段：head / header / footer / 首帧内联脚本 / noscript |
| `build/icons.py` | 从 logo 派生图标与分享图，一次性工具，不参与 node build |
| 根目录 `*.html` | **构建产物，不要直接改**，下次 build 会覆盖 |
| `*.css` `script.js` | 手写源文件，不经过构建 |

样式按职责切成五份：

- `style.css` — 基础、开屏、导航、通用
- `stage.css` — 首页分区区块
- `page.css` — 子页模板与刻度尺
- `wide.css` — 大屏装饰层，仅首页加载，可整份删除
- `theme.css` — 深色调色板，可整份删除

## 常见改动

### 加一页 / 改一页的文案

改 `build/pages.js` 的 `PAGES` 数组，跑一次 `node build/build.js`。

数组顺序即首页轨道的 `pos-1..pos-6` 与顶部横条从左到右的顺序。每条的字段：

```js
{
  slug: "system-design",   // 输出文件名，放平在根目录
  no: "01",                // 两位编号，轨道与横条都显示
  title: "系统设计",        // 中文主标题
  sub: "SYSTEM DESIGN",    // 英文副标题
  desc: "结构化的界面逻辑与组件体系",  // 一句话描述
  year: "2024",
  freq: "88.1"             // 子页刻度尺读数，必须单调递增
}
```

两个约束：

- **`freq` 必须随数组顺序单调递增。** 刻度尺是一个量程，数字乱了「调到某一档」
  这件事就说不通。
- **六项之外还要改 CSS。** `pos-1..pos-6` 的弧线坐标是 `stage.css` 里手写的
  六组值，不是算出来的。改成五项或七项要一并调整那部分。

### 改 logo

替换 `assets/logo.png`（纯黑 + 透明通道），然后：

```bash
python build/icons.py   # 需要 Pillow
```

重新派生 favicon 全套、apple-touch-icon、og 图。三者都垫了 `#f4f3ef` 纸色底：
logo 若保留透明，深色浏览器 UI 上黑标贴黑底等于没有图标，iOS 更是不支持透明。

### 上线前：填域名

`build/pages.js` 的 `SITE_URL` 现在是空的。留空时构建会**跳过**四样必须用绝对
地址的东西：`<link rel="canonical">`、`og:url`、`og:image`、整个 `sitemap.xml`。

这是有意的——错的绝对地址会把爬虫和分享卡片指到别人家去，比缺这几条严重得多。
定好域名后填进去重跑一次，四者自动补齐。

同时要换掉 `build/partials/footer.html` 里的占位联系方式（`hello@ces.studio`
和三个 `href="#"`）。

## 约定

**产物入库。** 根目录的七个 HTML 提交进 git，所以静态托管（GitHub Pages /
Cloudflare Pages）可以直接指仓库根目录，不需要 CI。代价是改完模板必须记得跑
build 再提交。

**行尾一律 LF。** 见 `.gitattributes` 里的说明。跨文档接缝的验证要逐字节比对
六个子页的横条 HTML，CRLF 会让 diff 满屏都是假改动。新克隆后如果发现行尾不对，
跑一次 `git add --renormalize .`。

**只用 `--only` 做单页验证。** `node build/build.js --only system-design` 只生成
一页，同时跳过 robots 与 sitemap（否则会写出残缺的 sitemap）。

## 设计约束

这几条不是偏好，是踩过的坑，改动时容易重新踩进去：

**转场靠 sessionStorage 里的一次性信号。** 键名 `ces-nav`，写在 `script.js` 的三处
退场处理器，读在 `build/partials/nav-signal*.html` 的内联脚本里。必须在首帧之前
消费——晚一帧就会先画冷启动布局再跳变，读成闪烁。信号带 `ts`，超过 2500ms 视为
过期（标签页搁置、或退场播了但跳转被取消）。

**首帧前的内联脚本不能挪走。** 主题防闪白、入场信号、返回信号三段都内联在 head
里且放在样式表之后。改成外链或延后执行，深色偏好的用户会先看到一帧白底。

**六个子页的横条 HTML 逐字节相同**，只有 `.is-current` 换位置。子页之间跳转时
它是跨接缝存活的家具，不参与入场动画。刻度尺读数也因此在构建期静态输出，不由
JS 生成——原先 JS 建好再淡入，每次跨文档导航都重播一次，读成闪烁。

**轨道环的 dash 归一化很脆。** `<svg>` 故意不设 `viewBox`（用户单位 = CSS 像素，
`stroke-width:1` 就是真 1px），也**不能**加 `vector-effect="non-scaling-stroke"`
——实测它会破坏 `pathLength="1"` 的 dash 归一化，环会画成三段孤弧。

**量斜元素不能用 getBoundingClientRect。** 轨道六项带 ±7° 倾斜，`getBoundingClientRect()`
返回的是外接矩形而非文字所在矩形。直接用会让左列三项横向偏 80~220px、上下四项
纵向偏 10~27px。`script.js` 里有三个专门的量法函数处理这件事。

**降级路径都要留。** `noscript` 片段逐条打开依赖 JS 的隐藏态；所有初始隐藏态挂在
`.js-enter` / `html.nav-*` 这类由脚本添加的类下，脚本没跑就等于内容默认可见；
入场还有 1400ms 的 setTimeout 兜底，防止 `script.js` 加载失败时页面永久留白。

## 现状

六个子页的正文是占位块（`CONTENT / PENDING`）。壳子——导航、转场、标题块、刻度尺
——已经完成，内容待补。

`pages.js` 里 `archive` 那条存了 `manifesto` 两段文字，模板还没消费这个字段。

