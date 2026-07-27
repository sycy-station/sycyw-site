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
const { PAGES, SPLASH_SIDES, SPLASH_CAPTION, ABOUT_DESC } = require("./pages.js");

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

// 子页顶部横条：当前页标记 aria-current，星球落在当前项编号前
const indexBar = (currentSlug) =>
  PAGES.map((p) => {
    const cur = p.slug === currentSlug;
    return `      <a class="ib-item${cur ? " is-current" : ""}" href="${p.slug}.html"${cur ? ' aria-current="page"' : ""}>
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
    extraCss: ""
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
      extraCss: '<link rel="stylesheet" href="page.css">'
    };
    const out = expand(subTpl, vars);
    fs.writeFileSync(path.join(ROOT, p.slug + ".html"), out);
    written.push(p.slug + ".html");
  });

  console.log("已生成:");
  written.forEach((f) => {
    const size = fs.statSync(path.join(ROOT, f)).size;
    console.log(`  ${f}  ${size} 字节`);
  });
};

try {
  build();
} catch (e) {
  console.error("构建失败:", e.message);
  process.exit(1);
}
