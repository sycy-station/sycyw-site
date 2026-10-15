const esc = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const mail = (subject, label = "聊聊你的想法") =>
  `<a class="room-link" href="mailto:3896148508@qq.com?subject=${encodeURIComponent(subject)}">${esc(label)} <span aria-hidden="true">↗</span></a>`;

const row = (title, copy) =>
  `<li class="room-row"><strong>${esc(title)}</strong><span>${esc(copy)}</span></li>`;

const { ABOUT_CHAPTERS } = require("./about-room.js");
const { TEAM_CHAPTERS } = require("./team-room.js");
const { CONTACT_SCENE } = require("./contact-room.js");
const { ECOSYSTEM_SCENE } = require("./ecosystem-room.js");
const { JOIN_SCENE } = require("./join-room.js");
const { PRODUCTS_SCENE } = require("./products-room.js");
const panels = {
  products: [{ label: "首页", html: PRODUCTS_SCENE }],
  ecosystem: [{ label: "生态伙伴", html: ECOSYSTEM_SCENE }],
  team: TEAM_CHAPTERS,
  join: [{ label: "岗位申请", html: JOIN_SCENE }],
  contact: [{ label: "联系合作", html: CONTACT_SCENE }]
};

function renderRoom(p, pages) {
  const chapters = p.slug === "about" ? ABOUT_CHAPTERS : panels[p.slug];
  if (!chapters) throw new Error(`未定义内容分区: ${p.slug}`);
  const pageIndex = pages.findIndex((page) => page.slug === p.slug);
  if (pageIndex < 0) throw new Error(`分区不在导航中: ${p.slug}`);
  const next = pages[(pageIndex + 1) % pages.length];
  const heading = `<div class="room-topline"><span><span data-room-no>${esc(p.no)}</span> / <span data-room-sub>${esc(p.sub)}</span></span><span>${esc(p.freq)} MHz</span></div>
    <header class="room-heading"><h1 id="roomTitle" tabindex="-1">${esc(p.title)}</h1><p>${esc(p.desc)}</p></header>`;
  if (p.slug === "contact") return `${heading}${CONTACT_SCENE}`;
  if (p.slug === "ecosystem") return `${heading}${ECOSYSTEM_SCENE}`;
  if (p.slug === "join") return `${heading}${JOIN_SCENE}`;
  if (p.slug === "products") return `${heading}${PRODUCTS_SCENE}`;
  const tabs = chapters.map((chapter, index) => {
    const key = `${p.slug}-${index}`;
    return `<button type="button" data-room-tab="${key}" id="tab-${key}" role="tab" aria-controls="panel-${key}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}"><span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span> ${esc(chapter.label)}</button>`;
  }).join("\n");
  const content = chapters.map((chapter, index) => {
    const key = `${p.slug}-${index}`;
    return `<section class="room-panel" id="panel-${key}" role="tabpanel" aria-labelledby="tab-${key}" tabindex="0"${index ? " hidden" : ""}>${chapter.html}</section>`;
  }).join("\n");
  const footer = ["about", "team"].includes(p.slug) ? "" : `<footer class="room-footer"><span class="room-chapter">01 / ${String(chapters.length).padStart(2, "0")} · ${esc(chapters[0].label)}</span><button type="button" data-next-panel>下一章 <span aria-hidden="true">→</span></button><a class="room-next" data-route href="${esc(next.slug)}.html">下一站 · ${esc(next.title)} <span aria-hidden="true">↗</span></a></footer>`;

  return `${heading}
    <div class="room-tabs" role="tablist" aria-label="${esc(p.title)}章节">${tabs}</div>
    <div class="room-panels">${content}</div>${footer}`;
}

module.exports = { renderRoom };
