#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  PAGES,
  SPLASH_SIDES,
  SPLASH_CAPTION,
  ABOUT_DESC,
  ABOUT_CANON,
  ABOUT_LINES,
  ABOUT_RULES,
  SITE_URL
} = require("./pages.js");
const { renderRoom } = require("./rooms.js");
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

const expand = (tpl, vars, depth = 0) => {
  if (depth > 10) throw new Error("partial 嵌套超过 10 层，可能存在循环引用");

  let out = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) =>
    expand(readPartial(name), vars, depth + 1)
  );

  out = out.replace(/^[ \t]*\{\{\s*([\w-]+)\s*\}\}[ \t]*\r?\n/gm, (m, key) =>
    key in vars && String(vars[key]) === "" ? "" : m
  );

  out = out.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (m, key) => {
    if (!(key in vars)) {
      console.warn(`  ! 未定义变量 {{ ${key} }}，原样保留`);
      return m;
    }
    return vars[key];
  });
  return out;
};
const BASE = (SITE_URL || "").replace(/\/+$/, "");
const absUrl = (file) => `${BASE}/${file === "index.html" ? "" : file}`;

const metaAbs = (file) =>
  BASE
    ? {
        canonical: `<link rel="canonical" href="${absUrl(file)}">`,
        ogUrl: `<meta property="og:url" content="${absUrl(file)}">`,

        ogImage: `<meta property="og:image" content="${BASE}/assets/og.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="森韵次元坞">`
      }
    : { canonical: "", ogUrl: "", ogImage: "" };

const orbitItems = (currentSlug = "") =>
  PAGES.map((p, i) => `        <a class="orbit-item pos-${i + 1}" href="${p.slug}.html" data-no="${p.no}"${p.slug === currentSlug ? ' aria-current="page"' : ""}>
          <span class="orbit-inner">
            <span class="orbit-no">${p.no}</span>
            <span class="orbit-title">${p.title}</span>
            <span class="orbit-sub">${p.sub.replace(/ /g, "&nbsp;")}</span>
          </span>
        </a>`).join("\n");

const overlayItems = () =>
  PAGES.map(
    (p) =>
      `      <li><a href="${p.slug}.html" data-index="${p.no}">${p.title}</a></li>`
  ).join("\n");

const indexBar = (currentSlug = "") => PAGES.map((p) => {
  const current = p.slug === currentSlug;
  return `        <a class="ib-item${current ? " is-current" : ""}" href="${p.slug}.html" data-route data-freq="${p.freq}"${current ? ' aria-current="page"' : ""}>
          <span class="ib-no">${p.no}</span><span class="ib-title">${p.title}</span>
          <span class="ib-freq" aria-hidden="true">${p.freq}</span>
        </a>`;
}).join("\n");

const onlyArg = process.argv.indexOf("--only");
const ONLY = onlyArg > -1 ? process.argv[onlyArg + 1] : null;

const build = () => {
  const written = [];
  if (ONLY && ONLY !== "index" && !PAGES.some((p) => p.slug === ONLY)) throw new Error(`未知页面: ${ONLY}`);

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
    overlayItems: overlayItems(),
    indexBar: indexBar(),
    sectionNavAttrs: ' inert aria-hidden="true"',
    orbitAttrs: "",
    aboutDesc: ABOUT_DESC,
    aboutCanon: ABOUT_CANON,

    aboutData: JSON.stringify({ lines: ABOUT_LINES, rules: ABOUT_RULES }),
    pageTitle: "森韵次元坞 — 文化、创作与技术",
    pageDesc: ABOUT_DESC,

    extraCss: '<link rel="stylesheet" href="orbit-room.css?v=20261015-title-alignment">\n<link rel="stylesheet" href="about-room.css?v=20261015-eight-milestones">\n<link rel="stylesheet" href="team-room.css?v=20261015-spacing&title=20261015-aligned">\n<link rel="stylesheet" href="contact-room.css?v=20261015-title-alignment">\n<link rel="stylesheet" href="ecosystem-room.css?v=20261015-title-alignment">\n<link rel="stylesheet" href="join-room.css?v=20261015-direction-emblems">\n<link rel="stylesheet" href="products-room.css?v=20261015-six-views2">',
    homeHeadingAttrs: "",
    roomAttrs: " inert",
    roomContent: "",

    wideCss: '<link rel="stylesheet" href="wide.css?v=20261015-edge-motion">',
    ...metaAbs("index.html")
  };
  const home = expand(fs.readFileSync(path.join(SRC, "index.html"), "utf8"), homeVars);
  if (!ONLY || ONLY === "index") {
    fs.writeFileSync(path.join(ROOT, "index.html"), home);
    written.push("index.html");
  }
  const subTpl = fs.readFileSync(path.join(SRC, "page.html"), "utf8");
  PAGES.forEach((p) => {
    if (ONLY && p.slug !== ONLY) return;

    const vars = {
      ...homeVars,
      slug: p.slug,
      orbitItems: orbitItems(p.slug),
      indexBar: indexBar(p.slug),
      sectionNavAttrs: "",
      orbitAttrs: ' inert aria-hidden="true"',
      pageTitle: `${p.title} — 森韵次元坞`,
      pageDesc: p.desc,
      homeHeadingAttrs: " hidden",
      roomAttrs: "",
      roomContent: renderRoom(p, PAGES),
      ...metaAbs(p.slug + ".html")
    };
    const out = expand(subTpl, vars);
    fs.writeFileSync(path.join(ROOT, p.slug + ".html"), out);
    written.push(p.slug + ".html");
  });

  if (!ONLY) {
    const legacy = { "system-design": "products", interaction: "ecosystem", brand: "team", motion: "join", archive: "contact" };
    Object.entries(legacy).forEach(([oldSlug, target]) => {
      const targetPage = PAGES.find((p) => p.slug === target);
      const redirect = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}.html"><title>${targetPage.title} — 森韵次元坞</title></head><body><p>此分区已更新，请前往<a href="${target}.html">${targetPage.title}</a>。</p></body></html>\n`;
      fs.writeFileSync(path.join(ROOT, oldSlug + ".html"), redirect);
      written.push(oldSlug + ".html");
    });
    const robots =
      "User-agent: *\nAllow: /\n" +
      (BASE ? `\nSitemap: ${BASE}/sitemap.xml\n` : "");
    fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);
    written.push("robots.txt");

    if (BASE) {
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
