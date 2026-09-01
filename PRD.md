# 森韵次元官网 Next.js 重构 · 产品需求文档

| 项 | 值 |
| --- | --- |
| 文档版本 | V1.0（待确认） |
| 编写日期 | 2026-09-01 |
| 项目目录 | `d:\Documents\GitHub\sycyw-site` |
| 上游需求 | `ces分页面需求文档.md`（**内容与验收第一优先级**） |
| 文案来源 | `syciyuan-官网文案.md`（扒取自 https://www.syciyuan.cn/ ） |
| 现状说明 | `README.md` |

> **优先级声明**（已与需求方确认）
>
> 1. **内容、字段、模块、验收标准**以 `ces分页面需求文档.md` 为准。第 12 章验收标准逐条映射该文档第 15 章。
> 2. **代码实现方式不受该文档约束**。该文档 §12 的技术要求是为旧构建器（`build/pages.js` + `build/build.js`）写的，本次重构改为 Next.js，一律采用社区标准与规范做法（App Router 目录约定、`metadata` API、`sitemap.ts` / `robots.ts`、CSS Modules、`useGSAP` + `gsap.context()` 等），不移植旧构建器的 partial 机制与文件命名约定。
> 3. **URL 形态按 Next.js 静态导出的实际产出**，不强行还原 `.html` 后缀。
> 4. **未确认的事实性数据直接使用占位值**并集中在 `data/` 内标注，不做「未确认即不渲染」的降级；页面结构一次做完整，后续替换数据即可。

---

## 1. 背景与现状

当前仓库是一个**零依赖、零框架**的多页静态站点：

- `build/pages.js` 是站点结构唯一数据源，`build/build.js`（200 行拼装器，两条语法 `{{> partial }}` 与 `{{ var }}`）把 7 个 HTML 生成到根目录，产物入库。
- 动效与交互全部手写在 `script.js`（1256 行），样式分五份：`style.css` / `stage.css` / `page.css` / `wide.css` / `theme.css`（共约 3200 行）。
- 跨文档导航靠 sessionStorage 的一次性信号 `ces-nav` 伪装成单页应用：三处写（首页→子页、子页→首页、子页→子页），两处读（`nav-signal.html` / `nav-signal-home.html` 的首帧前内联脚本）。
- 当前导航仍是「系统设计 / 交互研究 / 品牌语言 / 关于我们 / 动效编排 / 实验归档」，除 `about` 外五个子页正文均为 `CONTENT / PENDING` 占位。
- 页脚含 `hello@ces.studio` 与三个 `href="#"` 占位；`SITE_URL` 为空，canonical / og:url / og:image / sitemap 全部被跳过。

三个核心痛点：

1. **信息架构与真实业务不符** —— 需求文档要求改为 4 个正式栏目。
2. **正文缺失** —— 5 个页面是占位。
3. **动效实现难以维护** —— 跨文档转场靠 sessionStorage + 首帧内联脚本 + 手写几何测量（反旋转、量斜元素、行星吸附），任何改动都极易踩坑（见 `README.md` 设计约束 6 条）。

---

## 2. 重构目标

### 2.1 目标

| 编号 | 目标 | 说明 |
| --- | --- | --- |
| G1 | 迁移到 Next.js | App Router + TypeScript + 静态导出（`output: 'export'`），保持静态托管不变 |
| G2 | 引入 GSAP | 用 GSAP + ScrollTrigger + Flip 替换手写动效，消除 `ces-nav` 这类脆弱机制 |
| G3 | 落地 4 个分页面 | 关于我们 / 产品服务 / 团队介绍 / 加入我们，字段结构对齐需求文档第 6–9 章 |
| G4 | 视觉零漂移 | 黑白、刻度、频率、开屏、转场语言完整保留，不引入原官网粉色卡片风格 |
| G5 | 数据单一来源 | 栏目、产品、职位、团队、页脚集中为结构化 TS 数据，禁止多处重复维护 |
| G6 | 无障碍与降级不退化 | `prefers-reduced-motion`、键盘操作、无 JS 可读、响应式三档全部保留 |

### 2.2 非目标（本次范围之外）

- 不建设后台 CMS 或管理系统。
- 不实现真实消息发送、简历上传、用户账号系统。
- 不复制原官网视觉风格。
- 不擅自发布、不提交招聘信息、不修改线上官网。
- 不新增后端接口；表单类需求另立后端需求。

### 2.3 路由转场的取舍（重要变更）

Next.js 客户端路由让「跨文档」这个前提消失，因此下列现有约束**整体作废**：

- sessionStorage 信号 `ces-nav` 及其 2500ms 时效
- 首帧前内联的入场/返回信号脚本（主题防闪白脚本仍需保留，见 §4.4）
- 六个子页横条 HTML 逐字节相同的要求（改为同一个持久化组件实例）
- 光标位置跨文档传递 `ces-cursor`

替代方案：索引条与页头提升到 `layout.tsx`，跨路由天然存活；轨道项飞向标题位改用 GSAP Flip 在同一文档内完成。这是本次重构收益最大的一处简化，也是 §12.2 转场验收的判定基础。

---

## 3. 技术方案

### 3.1 技术栈

| 层 | 选型 | 版本策略 |
| --- | --- | --- |
| 框架 | Next.js App Router | 固定版本，不用 `^` |
| 语言 | TypeScript（`strict: true`） | — |
| 构建产物 | `output: 'export'` 静态导出到 `out/` | 无 Node 运行时依赖 |
| 样式 | CSS Modules + 一份全局变量层 | 由现有五份 CSS 迁移 |
| 动效 | `gsap`（含 ScrollTrigger、Flip、SplitText 视授权情况） | 固定版本 |
| 图片 | `next/image` 需 `unoptimized: true` 才能静态导出 | — |
| 包管理 | npm（仓库已有 Node 22 / npm 11 环境） | 提交 `package-lock.json` |

GSAP 插件说明：ScrollTrigger、Flip 属免费插件。SplitText 曾为会员插件，现已随 GSAP 3.13 免费开放；若安装后不可用，开屏逐字动画改用手动 `<span>` 拆分（数据里字符固定，拆分成本极低），不因此阻塞。

### 3.2 目录结构

```
sycyw-site/
├─ app/
│  ├─ layout.tsx            # html/body、字体、全局样式、持久化页头与索引条
│  ├─ page.tsx              # 首页（开屏 + 轨道）
│  ├─ about/page.tsx
│  ├─ products/page.tsx
│  ├─ team/page.tsx
│  ├─ join/page.tsx
│  ├─ not-found.tsx
│  ├─ sitemap.ts            # 替代 build.js 的 sitemap 生成
│  └─ robots.ts
├─ components/
│  ├─ layout/               # SiteHeader / OverlayNav / IndexBar / SiteFooter / ThemeToggle
│  ├─ home/                 # Splash / Stage / Orbit / OrbitPlanet / AboutTypewriter / WideDeco
│  ├─ page/                 # PageTitle / PageDesc / Hero / Section / Timeline / ValueCard
│  ├─ products/             # CategoryFilter / ProductCard / SpecTable
│  ├─ team/                 # LeaderCard / MemberGrid / CultureList / WorkspaceGallery
│  ├─ join/                 # JobFilter / JobCard / BenefitList / ProcessSteps / EmptyJobs
│  └─ ui/                   # Cursor / Clock / RevealItem / ExternalLink
├─ data/
│  ├─ site.ts               # SITE_URL、品牌、联系方式、社交、法务
│  ├─ pages.ts              # NAV：4 个栏目的元数据（唯一来源）
│  ├─ about.ts  products.ts  team.ts  join.ts
│  └─ types.ts              # 全部数据接口定义
├─ lib/
│  ├─ gsap.ts               # 插件注册（客户端单次）
│  ├─ motion.ts             # 时序常量、缓动、reduced-motion 判定
│  └─ hooks/                # useGsap / useReducedMotion / useTheme / useVisit
├─ styles/
│  ├─ globals.css           # 变量、reset、字体、reduced-motion 全局刹车
│  └─ *.module.css          # 组件级样式
├─ public/                  # assets/、favicon 全套、apple-touch-icon、og.png
├─ legacy/                  # 旧站归档（见 §3.3）
├─ next.config.ts  tsconfig.json  package.json  .eslintrc  .gitattributes
└─ PRD.md
```

### 3.3 旧文件归档

根目录原地重构。归档而非删除，动效复刻期间需要逐处对照原实现：

移入 `legacy/`：`build/`（含 `pages.js` / `build.js` / `icons.py` / `src` / `partials`）、7 个根 HTML、`script.js`、5 份 CSS、`ces.md`。

保留在原位：`assets/`（迁至 `public/assets/`）、favicon 全套与 `apple-touch-icon.png`（迁至 `public/`）、`robots.txt`（由 `app/robots.ts` 接管后删除）、`.gitattributes`、三份 md 文档、`README.md`。

`legacy/` 加 `.eslintignore` 与 `tsconfig` 排除，不参与构建与类型检查。**清理时机**：§12 全部验收项通过后，单独一次提交删除 `legacy/`。

### 3.4 静态导出与路径

`output: 'export'` 下每个路由生成 `out/about/index.html` 等目录式产物，与旧站 `about.html` 的扁平 URL **不一致**。处理方式：

- **已确认决策：URL 采用 Next.js 静态导出的实际形态** `https://www.syciyuan.cn/about/`，配 `trailingSlash: true`。需求文档 §14 的 `/<page>.html` 约定是为旧构建器写的，不适用。
- canonical、Open Graph `og:url`、sitemap 全部使用该形态，三者保持一致。
- 旧 URL 兼容按部署平台能力处理（Cloudflare Pages 用 `_redirects` 配 301；GitHub Pages 不支持则产出兼容跳转页）。旧站尚未上线正式域名（`SITE_URL` 为空、sitemap 从未生成），无历史收录，此项优先级低。

---

## 4. 全站公共规范

### 4.1 信息架构

`data/pages.ts` 的 `NAV` 数组是栏目唯一来源，首页轨道、覆盖层菜单、分页面索引条、sitemap、页脚快速链接全部由它派生。**禁止任何位置手写栏目名**。

| 编号 | 页面 | 路由 | 英文副标题 | 一句话描述 | freq |
| --- | --- | --- | --- | --- | --- |
| 01 | 关于我们 | `/about` | ABOUT US | 用创意和科技连接二次元与现实 | 88.1 |
| 02 | 产品服务 | `/products` | PRODUCTS & SERVICES | 融合二次元文化与科技创新的产品与合作项目 | 94.7 |
| 03 | 团队介绍 | `/team` | OUR TEAM | 由二次元爱好者与技术成员组成的团队 | 101.9 |
| 04 | 加入我们 | `/join` | JOIN US | 与热爱二次元文化和科技创新的人一起创造未来 | 104.6 |

`freq` 严格递增，是本站视觉系统字段，不是业务数据。旧栏目 `system-design` / `interaction` / `brand` / `motion` / `archive` 全部移除。

### 4.2 页面元数据类型

```ts
export interface NavPage {
  slug: 'about' | 'products' | 'team' | 'join';
  no: string;            // 两位编号
  title: string;         // 中文名称
  sub: string;           // 英文副标题
  desc: string;          // 摘要，兼作默认 SEO description
  year: string;          // 视觉字段，统一 '2024'
  freq: string;          // 刻度读数，单调递增
  seoTitle: string;      // 「页面名称 — 森韵次元坞」
  seoDescription: string;// 80–120 中文字符
  canonicalPath: string; // 页面正式路径
}
```

每页通过 App Router 的 `metadata` 导出 title / description / canonical / Open Graph，由 `NAV` 数据生成，不手写。

### 4.3 页头、导航、页脚

页头：品牌名「森韵次元坞」，Logo 点击回 `/`；导航项 4 个；当前项 `aria-current="page"`；桌面与移动菜单共用 `NAV`。

**品牌名已确认：全站统一使用「森韵次元坞」。** 开屏保留五字逐字动画，`og:site_name`、`metadata.title.template`、页头、页脚、SEO 标题后缀（`页面名称 — 森韵次元坞`）一律采用此名。需求文档 §5.2 的「森韵次元」不再采用。产品服务页中「森韵次元坞」作为自有开发项目条目出现，与站点品牌同名，属预期情况。

页脚五个模块，字段结构对齐需求文档 §5.3：

| 模块 | 字段 | 数据状态 |
| --- | --- | --- |
| 品牌信息 | logo、品牌名、品牌简介 | 文案取自原官网页脚简介 |
| 快速链接 | 首页 + 4 个栏目 | 由 `NAV` 派生 |
| 联系方式 | 电话、邮箱、办公地址 | 沿用旧站值，标注待确认 |
| 社交渠道 | 哔哩哔哩、微博、QQ（name / url / icon） | B 站与微博 URL 为占位，见 §4.4 |
| 法务信息 | 公司全称、版权年份、备案号、隐私政策、服务条款 | 备案号、政策页为占位 |

### 4.4 占位数据规范

未确认的事实性数据一律使用占位值，页面结构完整渲染。占位约定：

```ts
export const PENDING = '待确认' as const;   // 文本占位
export const PENDING_URL = '/pending';      // 站内占位路由，输出到 not-found
```

规则：

- **文本类**占位显示为 `待确认`，同时在数据文件内以 `// TODO(confirm): ...` 注释标注确认项。
- **链接类**占位指向站内 `/pending`（一个说明「该链接尚未确认」的静态页），**不使用 `href="#"`** —— 这既满足需求文档 §15.1 的「不存在 `href='#'`」硬性验收，也保证链接可点击且无 404。
- **图片类**占位使用本站黑白视觉体系下的 SVG 占位块（`public/assets/placeholder.svg`，带正确 `alt`），不引入外部图源。
- 所有占位项集中登记在 `data/pending.ts` 的清单里，与 §11 的 25 项对应，替换真实数据时按清单逐条核销。

### 4.5 主题与首帧防闪白

保留 `localStorage` key `ces-theme` 与 `data-theme` 属性机制。Next 静态导出下用 `next/script` 的 `beforeInteractive` 策略或 `layout.tsx` 内直接内联 `<script>` 注入同步读取逻辑，必须在样式表之后、首帧之前执行，否则深色偏好用户会看到一帧白底。

`ces-nav`、`ces-cursor` 两个 sessionStorage 机制删除；`ces-visit` / `ces-session` 访问画像（首页标语选句用）保留。

---

## 5. GSAP 动效方案

### 5.1 接入方式

- `lib/gsap.ts` 集中 `gsap.registerPlugin(ScrollTrigger, Flip)`，仅在客户端执行一次。
- 所有动效组件标 `'use client'`；服务端渲染阶段输出**最终可见态**的 DOM，动效由客户端接管后再设初始态，避免无 JS 时内容不可见。
- 统一使用 `useGSAP`（`@gsap/react`）或自建 `useGsap` 包装 `gsap.context()`，确保路由切换时自动 revert，杜绝动画泄漏。
- 时序常量集中在 `lib/motion.ts`，沿用现有数值：`travel 380ms` / `reveal 300ms` / `backGlide 380ms` / 开屏 `nameDelay 800` `codeDelay 950` `charSpeed 20` `expandDelay 320` `holdExpanded 1750` `dissolve 620`。

### 5.2 动效映射表

| 编号 | 动效 | 现实现 | GSAP 方案 |
| --- | --- | --- | --- |
| M1 | 开屏阶段机（logo→name→code→expand→leave） | `script.js` 手写 setTimeout 链 + `phase-*` 类 | 单条 `gsap.timeline()`，`.addLabel()` 标阶段；跳过 = `timeline.progress(x)` 或 `tweenTo('leave')` |
| M2 | 开屏 HUD 进度与随机序列号 | `setHud()` / `startSeq()` | timeline 内 `onUpdate` 驱动数值补间 |
| M3 | 品牌逐字浮现 | CSS 逐字 delay | SplitText 或手动 span + `stagger` |
| M4 | 开屏溶解交接舞台 | `.leave` 类 + `handoffOverlap 290ms` | timeline 尾段与舞台入场 timeline 用同一时间轴重叠 |
| M5 | 轨道弧线布局 | `stage.css` 手写 `pos-1..pos-6` 坐标 | **改为按项数计算**：CSS 变量 `--orbit-r` + 逐项 `--angle`，4 项时无需手写坐标（解决需求文档 §4.2 的手工坐标问题） |
| M6 | 轨道项飞向子页标题位 | 克隆 DOM + 反旋转 + 局部坐标换算 + sessionStorage 信号 | **GSAP Flip**：路由切换前 `Flip.getState()`，切换后 `Flip.from()`。Flip 自动处理旋转与父级变换，删除全部手写几何测量 |
| M7 | 返回首页时标题落回轨道 | `initBackArrive()` 三次 rAF + 屏幕空间→局部坐标旋转 | 同 M6 反向，Flip 一次调用 |
| M8 | 子页互跳时索引条留守 | 逐字节相同的 HTML + `nav-sub` 分支 | 索引条在 `layout.tsx` 内，天然持久；游标位移用 Flip |
| M9 | 行星公转与吸附 | 独立 rAF 状态机（free/snap/hold） | `gsap.to()` 沿 `motionPath` 或角度补间；吸附 = 覆盖同一 tween 的目标角 |
| M10 | 索引条游标「抹入」 | `clip-path: inset()` + CSS 过渡 | `gsap.fromTo()` 补 `clipPath`；跨路由用 Flip 平移 |
| M11 | 滚动揭示 | IntersectionObserver + `is-visible` | **ScrollTrigger**，`once: true`，`stagger` 分组 |
| M12 | 时间轴竖线生长 | `is-visible` 触发 `scaleY` | ScrollTrigger `scrub` 让竖线随滚动生长 |
| M13 | 首页标语打字机 | `initAboutType()` 手写逐字 | `gsap.to({}, { onUpdate })` 或 TextPlugin，保留标点停顿 260ms 与 ±25ms 抖动 |
| M14 | 自定义光标跟随 | 常驻 rAF，lerp 0.22 | `gsap.quickTo()`（GSAP 官方推荐的高频跟随写法，性能优于手写 rAF） |
| M15 | 主题切换过渡 | `theme-switching` 类 450ms 窗口 | 保留 CSS 实现，不引入 GSAP |
| M16 | 覆盖层菜单展开 | `clip-path: circle()` CSS 过渡 | 保留 CSS，或 GSAP 补 `clipPath` + 列表项 `stagger` |
| M17 | 产品/职位筛选切换 | 无（新增） | Flip 做卡片重排，`prefers-reduced-motion` 下直接切换 |
| M18 | 宽屏装饰层分阶段透明度 | CSS 媒体查询 + `deco-on` | 保留 CSS |

### 5.3 reduced-motion 统一降级

`lib/motion.ts` 暴露 `useReducedMotion()`。降级采用**双保险**：

1. **GSAP 侧**：所有 timeline 用 `gsap.matchMedia()` 的 `(prefers-reduced-motion: reduce)` 分支注册"直接落终态"的版本，不再逐处写 `if`。
2. **CSS 侧**：保留 `globals.css` 里的全局刹车（所有 `animation` / `transition` 压到 `0.001s`，`.reveal-*` 直接可见），兜住任何漏改的地方。

降级后必须满足：无持续动画、开屏直接跳过、揭示元素全部可见、行星静止、导航与筛选功能完整可用。

### 5.4 无 JS 降级

服务端渲染输出终态 DOM 是本次的关键改善：旧站靠 `noscript` 片段逐条打开隐藏态，新架构下**默认即可见**，客户端 JS 才设置动画初始态。因此无 JS 场景下正文、产品列表、职位列表天然完整可读，无需 `noscript` 补丁。

筛选交互的无 JS 降级：`CategoryFilter` / `JobFilter` 未 hydrate 时，全部条目均渲染，筛选按钮不生效但内容完整（对应需求文档 §7.2.B「无 JavaScript 时默认展示全部产品」）。

---

## 6. 首页

保留开屏 + 轨道两段结构，改动如下：

| 项 | 变更 |
| --- | --- |
| 轨道项数 | 6 → 4，弧线坐标改为按项数计算（M5），不再手写 `pos-*` |
| 开屏左右侧栏 | `SPLASH_SIDES` 改为 `products` 与 `team` |
| 状态栏文案 | `06 MODULES` → `04 MODULES` |
| 标语打字机 | 保留机制，文案池改为森韵次元坞口径 |
| 品牌名 | 保持「森韵次元坞」五字，开屏逐字动画不变 |
| 覆盖层菜单 | 4 项，由 `NAV` 派生 |

首页轨道项顺序、菜单顺序、分页面索引条顺序必须完全一致（同一份 `NAV`，天然满足）。

---

## 7. 关于我们页 `/about`

字段结构对齐需求文档 §6。数据文件 `data/about.ts`。

| 模块 | 字段 | 内容来源与状态 |
| --- | --- | --- |
| A. Hero | `heroTitle` `heroDescription` `heroImage` `heroImageAlt` | 标题「用创意和科技连接二次元与现实」；描述取原官网（成立于 2024 年）。**注意原官网自身矛盾**：关于我们说 2024 年成立，发展历程说前身 2018 年成立，故事段又说「七年来」。需确认口径 |
| B. 我们的故事 | `sectionTitle` 固定「我们的故事」、`storyImage?`、`storyParagraphs[]`（≥2 段） | 原官网 3 段可用，但「七年来」与「超过 13＋开发团队」需确认 |
| C. 我们的价值观 | `icon` `title` `description` `order` × 3 | 创新无界 / 用户至上 / 热爱与激情，文案可用 |
| D. 我们的使命 | `title` `description` `statement?` | 原官网文案可用 |
| E. 发展历程 | `year` `title` `description` `status?` `order` | 6 个节点，**2025 年末「预计 5 月开放内测、25 年末正式上线」已过期，必须按当前进度更新或删除预测** |

图片资源：原官网插图未获授权，`heroImage` / `storyImage` 使用 §4.4 的 SVG 占位块，`alt` 按内容语义填写，后续替换真实图片即可。

成立时间口径（§11 第 3 项）三处矛盾，**统一按 2024 年成立**（需求文档与原官网关于我们页一致），发展历程中 2018 年节点表述为「前身项目起步」，故事段的「七年来」改为不含具体年限的表述，避免自相矛盾。

现有 `body-about.html` 的正文（「两个人和一份不肯将就的清单」「2021 成立」等）是为旧「极简实验室」设定写的虚构内容，与森韵次元坞事实不符，**本次全部替换**。侧栏 VITALS 的 2021 / 06 / 40+ / 上海 同样替换。

---

## 8. 产品服务页 `/products`

字段结构对齐需求文档 §7。数据文件 `data/products.ts`。

| 模块 | 字段 |
| --- | --- |
| A. Hero | `heroTitle` `heroDescription` `heroImage` `heroImageAlt` |
| B. 产品分类 | `id` `label` `order`；全部产品 / 托管支持 / 开发项目 / 友链推送 / 初创论坛 |
| C. 产品详情 | `id` `categoryId` `categoryLabel` `name` `description` `image` `imageAlt` `features[]`（3 项，含 `title` `description` `icon?`）`primaryAction`（`label` `url` `external`）`secondaryAction?` `status?` |
| D. 产品规格 | 可选。`specGroupTitle` `specGroupDescription` `specRows[]`（`name` `value` `note?`） |
| E. 案例/推荐位 | `title` `description` `image` `imageAlt` `url` `status`。**无真实案例时整段不渲染** |

### 8.1 产品数据与域名冲突

原官网同一产品在首页与产品页给出不同域名，本次按下表取唯一值：

| 分类 | 名称 | 首页 URL | 产品页 URL | 本次采用 |
| --- | --- | --- | --- | --- |
| 托管支持 | 林枫云 | `https://www.dkdun.cn` | `https://www.lfyvps.com` | 取产品页 `lfyvps.com`，标注待确认 |
| 开发项目 | 森韵次元坞 | `https://senyun.space` | `https://www.senyunwu.com` | 取产品页 `www.senyunwu.com`，标注待确认 |
| 友链推送 | MineBBS | `https://www.minebbs.com` | `https://www.minebbs.com` | `www.minebbs.com`（两处一致） |
| 初创论坛 | 天空府邸论坛 | `https://cn-cdn1.skymansion.net` | `https://www.sky-palace.cn` | 取产品页 `www.sky-palace.cn`，标注待确认 |

取值规则：冲突时统一采用产品服务页的 URL（该页信息更完整、更接近正式对外口径），并在 `data/products.ts` 内以 `// TODO(confirm)` 标注另一候选值，便于一处替换。

### 8.2 必须剔除的内容

- 「广告位？9.9/月」及三条「此处广告位可出售…状态：未购入」——旧站商业占位，与产品信息无关，不迁移。
- `secondaryAction` 中的「预约体验」「免费试用」「开始创作」「预约演示」——原官网均为 `href="#"` 假链接。本次统一改为「了解详情」并指向该产品的正式 URL；无第二动作需求的产品不设 `secondaryAction`。
- 产品规格（林枫云三组参数）属第三方商品参数，保留展示并在 `specRows.note` 标注「参数以服务商页面为准」。

### 8.3 筛选交互

- 分类按钮为可聚焦 `<button>`，同步 `aria-pressed`。
- 键盘可操作：Tab 进入、Enter/Space 触发；选中态视觉明确（不只靠颜色）。
- 切换用 Flip 重排（M17）；reduced-motion 下直接切换。
- 分类项只来自现有产品数据，不出现空分类。
- 刷新后默认回到「全部产品」（不做 URL 状态持久化，符合需求文档 §15.2「刷新后默认状态合理」）。

---

## 9. 团队介绍页 `/team`

字段结构对齐需求文档 §8。数据文件 `data/team.ts`。

| 模块 | 字段 | 状态 |
| --- | --- | --- |
| A. Hero | `heroTitle` `heroDescription` `heroImage` `heroImageAlt` | 文案可用 |
| B. 领导团队 | `name` `role` `avatar` `avatarAlt` `bio` `skills[]?` `socialLinks[]?` `order` | **履历需确认**，见下 |
| C. 核心团队 | `name` `role` `avatar` `avatarAlt` `order` | 8 人名单可用；无公开简介**不编造履历** |
| D. 团队文化 | `icon` `title` `description` `order` × 3 | 创新无界 / 协作共赢 / 持续成长，文案可用 |
| E. 工作环境 | `images[]`（`src` `alt` `caption?`） | 原官网自述「以下均为网图，我们公司还没发展到有实体工作室的程度」。改用 SVG 占位块 + `caption` 说明，不使用网图 |
| F. 加入团队 CTA | `title` `description` `buttonLabel` `buttonUrl` → `/join` | 可用 |

### 9.1 领导团队数据问题

原官网团队介绍页四人简介中**均出现「梦幻科技」**，这不是森韵次元的公司名（正确全称为「唐山森韵次元科技有限公司」），属需求文档 §10 明确列出的必改项。

同时首页与团队页对同一人的描述互相冲突：

| 姓名 | 首页 | 团队页 | 冲突点 |
| --- | --- | --- | --- |
| 冬月 | 创始人 & CEO，10 年科技创业经验 | 创始人 & CEO，6 年管理经验，2018 年创立「梦幻科技」 | 年限、公司名 |
| 苏以北 | 合伙人 & 线下总监，AI 与 AR 技术专家 | 同上，但职责写成「技术研发和产品创新」 | 职责口径 |
| vxtls / PTYPJ | 首页「vxtls 常驻运维，外国留学生」 | 团队页「PTYPJ 常驻运维，资深插画师和 UI 设计师」 | **同一职位两个不同人名与不同专业背景** |
| 永恒之蓝 | 全栈统筹 | 全栈统筹，配图名却是「王小明」 | 配图占位名 |

**处理原则**：四人全部按领导团队完整字段渲染，取值规则如下。

- 公司名：所有 `bio` 中的「梦幻科技」替换为「森韵次元坞」（§11 第 2 项，需求文档 §10 明确要求）。
- 年限、履历细节：冲突项一律去掉具体数字（如「10 年经验」「6 年管理经验」改为不含年限的能力描述），避免两处矛盾又不引入虚假数据。
- 常驻运维：采用团队介绍页的 `PTYPJ`（该页字段更完整），首页统一为同一人名。
- 「王小明」配图名替换为对应成员姓名。
- 头像：全部使用 §4.4 的 SVG 占位块。

---

## 10. 加入我们页 `/join`

字段结构对齐需求文档 §9。数据文件 `data/join.ts`。

| 模块 | 字段 | 状态 |
| --- | --- | --- |
| A. Hero | `heroTitle` `heroDescription` `heroImage` `heroImageAlt` | 文案可用 |
| B. 我们的文化 | `icon` `title` `description` `order` × 6 | 创新无界 / 用户至上 / 热爱与激情 / 团队协作 / 持续成长 / 工作与生活平衡，文案可用 |
| C. 员工福利 | `icon` `title` `description` `order` × 5 | 弹性工作制 / 健康保障 / 学习发展 / 团队活动 / 股权激励，沿用原官网文案 |
| D. 职位筛选 | `id` `label` `order` | 只来自现有职位数据 |
| E. 职位卡 | `id` `categoryId` `categoryLabel` `title` `location` `description` `requirements[]` `applyLabel` `applyUrl` `status` | 三条职位数据迁移，`status` 标 `待确认` |
| F. 招聘流程 | `step` `title` `description` `order` × 5 | 简历投递 / 初步面试 / 技术或专业面试 / 终面 / Offer 发放 |
| G. 页面 CTA | `title` `description` `primaryAction` `secondaryAction?` | `primaryAction` 指向邮箱投递 |

### 10.1 职位数据处理

UI/UX 设计师、内容营销专员、产品运营经理三条按占位数据迁移，`status` 字段标记 `待确认`，`applyUrl` 指向邮箱投递链接（`mailto:`）而非 `#`。`JobFilter` 的分类由这三条派生，筛选交互可完整验收。

同时实现 `EmptyJobs` 空状态组件（当 `jobs` 为空数组时渲染「暂无开放职位」+ 邮箱投递入口），业务方清空数据后不会出现空白区块。

招聘流程去掉「冬月会在 3 个工作日内完成简历筛选」「冬月会主动添加你的联系方式」这类写死负责人与时限的表述，改为流程本身的中性描述，避免个人信息与承诺时限失效。

---

## 11. 待确认事实清单

**规则（已确认）：未确认项使用 §4.4 的占位值，页面结构完整渲染，不做隐藏降级。** 清单同步维护在 `data/pending.ts`，替换真实数据时逐条核销。

| # | 项 | 本次取值 | 状态 |
| --- | --- | --- | --- |
| 1 | 站点品牌名 | 森韵次元坞 | **已确认** |
| 2 | 公司全称 | 唐山森韵次元科技有限公司 | 沿用；团队页「梦幻科技」已替换 |
| 3 | 成立时间 | 2024 年成立，2018 年为前身项目起步 | 已统一口径，待确认 |
| 4 | 电话 | 166-9059-9967 | 旧站值，需确认仍有效 |
| 5 | 邮箱 | 3896148508@qq.com | 同上 |
| 6 | 办公地址 | 河北曹妃甸金岛大厦 B 座 3613 室 | 同上 |
| 7 | 哔哩哔哩 URL | 占位 ID，`isPlaceholder: true` | 待确认 |
| 8 | 微博 URL | 占位 ID，`isPlaceholder: true` | 待确认 |
| 9 | QQ 链接 | `wpa.qq.com/...uin=3896148508` | 需确认 |
| 10 | 备案号 | 占位文案 `备案号待补充` | 上线前必须替换（中国大陆站点强制） |
| 11 | 隐私政策 / 服务条款 | 建 `/privacy`、`/terms` 两页，正文为占位说明 | 待补充正文，链接不留空 |
| 12 | 林枫云正式 URL | `www.lfyvps.com` | 待确认 |
| 13 | 森韵次元坞正式 URL | `www.senyunwu.com` | 待确认 |
| 14 | 天空府邸论坛正式 URL | `www.sky-palace.cn` | 待确认 |
| 15 | MineBBS 合作关系 | 保留展示 | 待确认 |
| 16 | 团队人数 | 核心 4 人 / 开发 13 人；概览统一 `13+` | 已统一口径，待确认 |
| 17 | 常驻运维姓名 | PTYPJ | 已统一，待确认 |
| 18 | 领导团队履历 | 「梦幻科技」→「森韵次元坞」，去掉具体年限 | 待确认 |
| 19 | 项目上线时间 | 改为不含预测日期的中性状态描述 | 待确认真实进度 |
| 20 | 员工福利 | 5 项沿用原官网文案 | 待确认 |
| 21 | 开放职位 | 3 条占位，`status: 待确认` | 待替换真实职位 |
| 22 | 产品规格参数 | 保留，附「以服务商页面为准」 | 待确认 |
| 23 | 图片资源 | 全部使用 SVG 占位块 | 待提供授权图片 |
| 24 | 正式域名 | `https://www.syciyuan.cn` | 待确认 |
| 25 | 托管平台 | Cloudflare Pages（`_redirects` 已就绪） | 待确认 |

---

## 12. 验收标准

**判定规则**：每条给出可执行的验证方式与通过条件。标 `[需求-15.x]` 的条目直接对应 `ces分页面需求文档.md` 第 15 章，为**最高优先级**，任一条不通过即整体不通过。标 `[技术]` 的为本次重构新增的技术性验收。

### 12.1 内容验收

| # | 验收项 | 验证方式 | 通过条件 |
| --- | --- | --- | --- |
| A1 | 4 个分页面全部生成并可从首页进入 `[需求-15.1]` | 构建后检查 `out/` 目录；首页点击轨道四项 | `out/{about,products,team,join}/index.html` 均存在，四项均可跳达 |
| A2 | 页面模块与字段完整 `[需求-15.1]` | 逐页对照需求文档 §6–§9 的模块表 | 每个模块都有对应组件与数据；可选模块无数据时整段不渲染而非留空壳 |
| A3 | 无占位内容 `[需求-15.1]` | 全仓库检索 `CONTENT / PENDING`、`这一页的内容待补`、`href="#"`、`未购入`、`hello@ces.studio`、`1234567890` | `app/` `components/` `data/` `out/` 内 0 命中（`legacy/` 除外） |
| A4 | 旧栏目彻底移除 `[需求-15.1]` | 检索「系统设计」「交互研究」「品牌语言」「动效编排」「实验归档」及五个旧 slug | 构建产物与源码 0 命中 |
| A5 | 事实性内容已确认 `[需求-15.1]` | 对照 §11 的 25 项清单 | 每项标记为「已确认」或「未确认→未渲染」，无「未确认但已渲染」 |
| A6 | 无虚构内容残留 `[技术]` | 检查 about 页 | 旧「2021 成立 / 两个人一间租来的房间 / 40+ 交付」等虚构内容 0 残留 |
| A7 | 无「梦幻科技」等错误公司名 `[需求-15.1]` | 检索「梦幻科技」「王小明」 | 0 命中 |
| A8 | 无过期时间承诺 `[需求-15.1]` | 检查发展历程与产品状态 | 无「预计 5 月」「25 年末正式上线」等已过期预测 |

### 12.2 功能验收

| # | 验收项 | 验证方式 | 通过条件 |
| --- | --- | --- | --- |
| B1 | 导航顺序一致 `[需求-15.2]` | 对比首页轨道、覆盖层菜单、索引条、页脚快速链接 | 四处顺序与编号完全一致；代码层面均由 `NAV` 派生，无手写 |
| B2 | 产品筛选正常 `[需求-15.2]` | 点击 5 个分类；刷新页面 | 仅展示对应分类；刷新后回到「全部产品」；无空分类 |
| B3 | 职位筛选正常 `[需求-15.2]` | 无职位时检查空状态；填入测试职位后检查筛选 | 空状态显示「暂无开放职位」且无空筛选按钮；有职位时筛选生效 |
| B4 | 键盘可操作 `[需求-11]` | 仅用键盘完成：进入筛选、切换分类、打开菜单、切换主题、遍历全部链接 | 全部可达；焦点可见；`aria-pressed` / `aria-expanded` / `aria-current` 状态同步 |
| B5 | 外链规范 `[需求-11]` | 检查所有站外链接 | 均带 `target="_blank"` 与 `rel="noopener noreferrer"` |
| B6 | 内链无 404 `[需求-15.2]` | 遍历站内全部链接 | 0 个 404；无 `href="#"` |
| B7 | 外链可访问 `[需求-15.2]` | 逐个访问已确认的外部 URL | 均可访问；未确认的 URL 不应出现在产物中 |
| B8 | 主题双向可读 `[需求-15.2]` | 深浅主题下逐页浏览；反复切换 | 文本均可读；切换无明显闪白；刷新后主题保持 |
| B9 | 首帧无闪白 `[需求-15.2]` | 深色偏好下硬刷新每个页面 | 首帧即深色，无白底闪现（内联主题脚本生效） |
| B10 | 路由转场连续 `[需求-15.2]` | 首页→各分页面、分页面互跳、返回首页 | 无首帧跳变；索引条跨路由不重播入场；轨道项飞入/落回连贯 |
| B11 | 无 JS 可读 `[需求-15.2]` | 浏览器禁用 JS，逐页浏览 | 正文、产品列表、职位列表、团队名单完整可见；导航链接可点击 |
| B12 | 索引条窄屏可滚动 `[需求-11]` | 375px 下打开每个分页面 | 可横向滚动；当前项自动处于可见区域 |

### 12.3 视觉与设备验收

| # | 验收项 | 验证方式 | 通过条件 |
| --- | --- | --- | --- |
| C1 | 三档视口无破版 `[需求-15.3]` | 375 / 768 / 1440px 下逐页检查 | 无文本截断、模块重叠、异常横向溢出（索引条除外） |
| C2 | 长文本不破版 `[需求-15.3]` | 人为加长产品名、职位标题、成员简介、规格值 | 卡片、时间轴、规格表、成员列表均正常换行 |
| C3 | reduced-motion 达标 `[需求-15.3]` | 系统开启减弱动效后逐页浏览 | 无持续动画；开屏直接跳过；揭示元素全部可见；行星静止；导航与筛选完全可用 |
| C4 | 视觉零漂移 `[技术]` | 与 `legacy/` 旧产物并排对比首页开屏、轨道、索引条、刻度尺、页头页脚 | 字号、字距、间距、色值、缓动一致；无原官网粉色卡片风格 |
| C5 | 唯一 h1 与标题递进 `[需求-13]` | 每页检查标题层级 | 每页仅一个 `h1`；模块用 `h2`；卡片标题用 `h3`；无跳级 |
| C6 | 图片 alt 规范 `[需求-13]` | 检查全部 `<img>` / `next/image` | 内容图有准确 `alt`；装饰图 `alt=""` |
| C7 | 对比度达标 `[需求-13]` | 深浅主题下用工具检查正文、次要文字、按钮 | 达到 WCAG AA（正文 4.5:1，大字 3:1） |

无障碍完整合规需要辅助技术实测与专业评审，本表只覆盖可自动化或可目视判定的部分。

### 12.4 构建与工程验收

| # | 验收项 | 验证方式 | 通过条件 |
| --- | --- | --- | --- |
| D1 | 构建无报错 `[需求-15.4]` | `npm run build` | 退出码 0，无 error，无新增 warning |
| D2 | 类型检查通过 `[技术]` | `tsc --noEmit` | 0 error（`strict: true` 下） |
| D3 | Lint 通过 `[技术]` | `npm run lint` | 0 error |
| D4 | 产物完整 `[需求-15.4]` | 检查 `out/` | 首页 + 4 个分页面 + 404 + `sitemap.xml` + `robots.txt`，无旧页面残留 |
| D5 | sitemap / robots / canonical / OG 正确 `[需求-15.4]` | 检查产物内容 | sitemap 仅含首页与 4 个分页面；canonical 与实际可访问 URL 一致（见 §3.4 决策）；每页 `og:title` / `og:description` / `og:url` / `og:image` 齐备 |
| D6 | 每页 title 与 description 唯一 `[需求-14]` | 提取 5 个页面的 meta | 无重复；description 在 80–120 中文字符区间 |
| D7 | 旧 URL 兼容 `[需求-14]` | 访问 `/about.html` 等旧路径 | 301 到新路径，或存在兼容跳转页（依 §11 第 25 项托管平台确认后落地） |
| D8 | 依赖版本固定 `[技术]` | 检查 `package.json` | 无 `^` / `~` 范围；`package-lock.json` 已提交 |
| D9 | git diff 干净 `[需求-15.4]` | `git status` / `git diff` | 无无关文件；无行尾噪音（LF 一致）；无对用户现有改动的回退 |
| D10 | 动画无泄漏 `[技术]` | 反复跨路由跳转 20 次后检查 | GSAP 实例被 `context.revert()` 清理；ScrollTrigger 无堆积；内存与帧率稳定 |
| D11 | legacy 不参与构建 `[技术]` | 构建与类型检查 | `legacy/` 被排除；产物中无 legacy 内容 |

### 12.5 验收方式说明

- A3 / A4 / A7 类检索型验收可脚本化，建议加一个 `npm run check:content` 脚本固化，避免回归。
- B10 / C3 / C4 需人工目视，验收时逐页录屏或截图留证。
- C1 / C2 建议用三档视口的截图对比。
- 全部通过后才执行 `legacy/` 删除（§3.3）。

---

## 13. 实施优先级

| 阶段 | 内容 | 依赖 |
| --- | --- | --- |
| **P0 工程与数据** | Next.js 工程初始化、GSAP 接入、CSS 迁移为 Modules、`data/` 全部类型与 `NAV` 落地、`legacy/` 归档、layout 与持久化页头索引条 | — |
| **P1 首页** | 开屏 timeline（M1–M4）、4 项轨道按角度计算（M5）、行星（M9）、标语打字机（M13）、光标（M14） | P0 |
| **P2 分页面** | 4 个页面正文组件与样式、筛选交互（M17）、滚动揭示与时间轴（M11/M12）、Flip 路由转场（M6–M8/M10） | P0、P1 |
| **P3 全站收口** | 页脚、SEO metadata、sitemap / robots、404、三档响应式适配 | P2 |
| **P4 质量验证** | §12 全部验收项、`check:content` 脚本、reduced-motion 与无 JS 检查、旧 URL 301、删除 `legacy/` | P3 |

事实确认（§11）与 P0 并行推进，是 P2 能否完成内容验收的前置条件。

---

## 14. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 开屏与轨道的精细视觉在重写中漂移 | 违反 G4 与 C4 | `legacy/` 保留原实现并排对比；CSS 变量与数值原样搬运，不"顺手优化" |
| GSAP Flip 处理旋转元素的表现与手写反旋转不完全一致 | B10 转场验收 | 轨道项倾斜角仅 ±7°，Flip 原生支持 rotation 插值；若有偏差，退回为「先摊平再 Flip」两段式 |
| 静态导出的 URL 形态变更影响已收录页面 | SEO 掉量 | §3.4 的 301 方案；`trailingSlash` 与 canonical 保持一致 |
| 事实确认迟迟不到位 | 内容验收 A5 阻塞 | 「未确认不渲染」是硬规则，页面结构先完成，数据后填即可生效，不阻塞工程进度 |
| 图片资源缺失 | Hero 与工作环境模块空缺 | 纯排版方案作为默认形态，图片是增强项而非必要项 |
| GSAP 商用授权 | 合规 | 标准 GSAP 与 ScrollTrigger / Flip 为免费（含商用）；如需 SplitText 且版本不支持，改手动拆分 |

---

## 15. 确认事项

请就以下三点给出结论，之后即可进入 P0：

1. **品牌名口径**（§4.3、§11 第 1 项）：站点品牌用「森韵次元」还是保留「森韵次元坞」？这决定开屏五字/四字的视觉与全站文案。
2. **canonical URL 形态**（§3.4）：接受 `/about/` 的目录式 URL，还是要求保留 `/about.html`（需额外配置或改用非静态导出）？
3. **事实确认的推进方式**（§11）：25 项清单是由你逐条给值，还是先按「未确认不渲染」实现、后续再填数据？

