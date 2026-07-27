#!/usr/bin/env node
/* ============================================================
   最小拼装器
   ------------------------------------------------------------
   没有依赖、没有配置。两条语法：

     {{> partial-name }}        插入 build/partials/<name>.html
     {{ varName }}              替换为变量值（不转义，模板自负）

   partial 内部可以再用这两条，递归展开（限深 10 层防环）。

   用法：  node build/build.js
   输出：  根目录的 index.html 与六个子页面

   为什么不用模板引擎：整站七页、两条语法就够，加依赖不划算。
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { PAGES, SPLASH_SIDES, SPLASH_CAPTION, ABOUT_DESC, SITE_URL } = require("./pages.js");

const ROOT = path.join(__dirname, "..");
const PARTIALS = path.join(__dirname, "partials");
const SRC = path.join(__dirname, "src");

const readPartial = (name) => {
  const f = path.join(PARTIALS, name + ".html");
  if (!fs.existsSync(f)) {
    throw new Error(`partial 不存在: ${name} (${f})`);
  }
  return fs.readFileSync(f, "utf8");
};

// 先展开 partial，再替换变量：这样 partial 里的 {{ var }} 也能拿到值
const expand = (tpl, vars, depth = 0) => {
  if (depth > 10) throw new Error("partial 嵌套超过 10 层，可能存在循环引用");

  let out = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) =>
    expand(readPartial(name), vars, depth + 1)
  );

  // 独占一行且取值为空的变量，连同那一行的换行一起去掉。
  // 否则 SITE_URL 未配时 head 里会留下三处孤立空行，产物是给人读的。
  // 必须先于下面的通用替换：这里靠「行首 + 仅有该变量 + 行尾」判断独占。
  out = out.replace(/^[ \t]*\{\{\s*([\w-]+)\s*\}\}[ \t]*\r?\n/gm, (m, key) =>
    key in vars && String(vars[key]) === "" ? "" : m
  );

  out = out.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (m, key) => {
    if (!(key in vars)) {
      // 留原样比静默填空好：生成物里能一眼看到漏了哪个变量
      console.warn(`  ! 未定义变量 {{ ${key} }}，原样保留`);
      return m;
    }
    return vars[key];
  });

  return out;
};

/* ---- 元信息：需要绝对地址的那几条 ---- */

// SITE_URL 留空时这三个变量取空串，head partial 里对应的行就消失。
// 不输出比输出占位域名安全：错的 canonical 会把索引权重让给别人。
const BASE = (SITE_URL || "").replace(/\/+$/, "");
const absUrl = (file) => `${BASE}/${file === "index.html" ? "" : file}`;

const metaAbs = (file) =>
  BASE
    ? {
        canonical: `<link rel="canonical" href="${absUrl(file)}">`,
        ogUrl: `<meta property="og:url" content="${absUrl(file)}">`,
        // 分享图全站共用一张（1200×630，由 build/icons.py 生成）。
        // 六页各配一张的收益不足以抵消维护成本。
        ogImage: `<meta property="og:image" content="${BASE}/assets/og.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="森韵次元坞">`
      }
    : { canonical: "", ogUrl: "", ogImage: "" };

/* ---- 片段生成器：轨道六项与顶部横条都从 PAGES 派生 ---- */

// 首页轨道：pos-1..pos-6 的类名与顺序由数组下标决定
const orbitItems = () =>
  PAGES.map((p, i) => `        <a class="orbit-item pos-${i + 1}" href="${p.slug}.html" data-no="${p.no}">
          <span class="orbit-inner">
            <span class="orbit-no">${p.no}</span>
            <span class="orbit-title">${p.title}</span>
            <span class="orbit-sub">${p.sub.replace(/ /g, "&nbsp;")}</span>
          </span>
        </a>`).join("\n");

// 子页顶部横条：当前页标记 aria-current，星球落在当前项编号前。
// data-freq 是刻度尺（调频盘）上该项的读数，由 script.js 读出来生成标签。
// 写在 DOM 上而不是在 script.js 里再抄一份数组：站点结构的唯一来源是 pages.js，
// 抄一份就意味着加页面时要改两处。
const indexBar = (currentSlug) =>
  PAGES.map((p) => {
    const cur = p.slug === currentSlug;
    return `      <a class="ib-item${cur ? " is-current" : ""}" href="${p.slug}.html"${cur ? ' aria-current="page"' : ""} data-freq="${p.freq}">
        <span class="ib-no">${p.no}</span>
        <span class="ib-title">${p.title}</span>
      </a>`;
  }).join("\n");

/* ---- 构建 ---- */

// 只生成指定 slug（壳子验证阶段用）：node build/build.js --only system-design
const onlyArg = process.argv.indexOf("--only");
const ONLY = onlyArg > -1 ? process.argv[onlyArg + 1] : null;

const build = () => {
  const written = [];

  // 首页
  // 开屏侧标题必须与它形变成的那一项字字相同，所以从 PAGES 取，不手写
  const side = (slug) => {
    const p = PAGES.find((x) => x.slug === slug);
    if (!p) throw new Error(`SPLASH_SIDES 里的 slug 不存在: ${slug}`);
    return p;
  };
  const sideL = side(SPLASH_SIDES[0]);
  const sideR = side(SPLASH_SIDES[1]);

  const homeVars = {
    orbitItems: orbitItems(),
    sideLeftNo: sideL.no,
    sideLeftTitle: sideL.title,
    sideLeftSub: sideL.sub.replace(/ /g, "&nbsp;"),
    sideRightNo: sideR.no,
    sideRightTitle: sideR.title,
    sideRightSub: sideR.sub.replace(/ /g, "&nbsp;"),
    splashCaption: SPLASH_CAPTION.replace(/ /g, "&nbsp;"),
    aboutDesc: ABOUT_DESC,
    pageTitle: "森韵次元坞 — 极简系统实验室",
    pageDesc: "森韵次元坞，一个专注于极简系统与界面的实验室。",
    // 首页不需要子页模板样式
    extraCss: "",
    // 大屏装饰层只有首页用（子页 data-wide="off"，wide.css 里每条规则
    // 都挂在 html[data-wide="on"] 下，一条都不会命中），所以只有这里加载
    wideCss: '<!-- 大屏装饰层，仅首页需要，可整行删除 -->\n<link rel="stylesheet" href="wide.css">',
    ...metaAbs("index.html")
  };
  const home = expand(fs.readFileSync(path.join(SRC, "index.html"), "utf8"), homeVars);
  fs.writeFileSync(path.join(ROOT, "index.html"), home);
  written.push("index.html");

  // 六个子页共用一个模板
  const subTpl = fs.readFileSync(path.join(SRC, "page.html"), "utf8");
  PAGES.forEach((p) => {
    if (ONLY && p.slug !== ONLY) return;
    const vars = {
      slug: p.slug,
      no: p.no,
      title: p.title,
      sub: p.sub,
      subNbsp: p.sub.replace(/ /g, "&nbsp;"),
      desc: p.desc,
      year: p.year,
      indexBar: indexBar(p.slug),
      pageTitle: `${p.title} — 森韵次元坞`,
      pageDesc: p.desc,
      extraCss: '<link rel="stylesheet" href="page.css">',
      // 子页不加载 wide.css：省一个请求，且没有任何规则会命中
      wideCss: "",
      ...metaAbs(p.slug + ".html")
    };
    const out = expand(subTpl, vars);
    fs.writeFileSync(path.join(ROOT, p.slug + ".html"), out);
    written.push(p.slug + ".html");
  });

  // robots.txt 与 sitemap.xml
  // --only 是壳子验证用的单页构建，这时跳过：生成的 sitemap 会是残缺的。
  if (!ONLY) {
    // robots 不依赖域名，任何时候都写。Sitemap 那行要绝对地址，没配就省掉。
    const robots =
      "User-agent: *\nAllow: /\n" +
      (BASE ? `\nSitemap: ${BASE}/sitemap.xml\n` : "");
    fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);
    written.push("robots.txt");

    if (BASE) {
      // <loc> 必须是绝对地址，所以没配 SITE_URL 时整个文件都不写。
      // lastmod 取构建当天：这站没有 CMS，构建时间就是内容最后变动时间。
      const today = new Date().toISOString().slice(0, 10);
      const urls = ["index.html", ...PAGES.map((p) => p.slug + ".html")]
        .map(
          (f) =>
            `  <url>\n    <loc>${absUrl(f)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
        )
        .join("\n");
      fs.writeFileSync(
        path.join(ROOT, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      );
      written.push("sitemap.xml");
    }
  }

  console.log("已生成:");
  written.forEach((f) => {
    const size = fs.statSync(path.join(ROOT, f)).size;
    console.log(`  ${f}  ${size} 字节`);
  });

  if (!BASE) {
    console.log(
      "\n提示: pages.js 的 SITE_URL 为空，已跳过 canonical / og:url / og:image / sitemap.xml。\n" +
        "      定好域名后填进去重跑一次即可补齐。"
    );
  }
};

try {
  build();
} catch (e) {
  console.error("构建失败:", e.message);
  process.exit(1);
}
