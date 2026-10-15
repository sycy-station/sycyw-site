const data = require("./team-data.json");
const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const number = (index) => String(index + 1).padStart(2, "0");

const portrait = (member, className = "team-portrait") => `<div class="${className}"><div class="team-portrait-image"><img src="${esc(member.image)}" alt="${esc(member.name)}的头像" width="500" height="500" decoding="async"></div><i class="team-portrait-orbit" aria-hidden="true"></i></div>`;

const leaderProfile = (member, index) => {
  const id = `team-leader-${index}`;
  const summary = member.bio.split("。")[0] + "。";
  return `<li class="team-cell" data-team-cell>
    <article class="team-profile team-profile--leader" aria-labelledby="${id}-name">
      <span class="team-profile-index" aria-hidden="true">${number(index)}</span>
      ${portrait(member)}
      <div class="team-profile-body"><h3 id="${id}-name">${esc(member.name)}</h3><p class="team-role">${esc(member.role)}</p>
        <p class="team-profile-summary">${esc(summary)}</p>
        <button class="team-details-button" type="button" data-team-details="${id}-dialog" aria-haspopup="dialog" aria-label="查看${esc(member.name)}的完整介绍">成员介绍 <span aria-hidden="true">↗</span></button>
      </div>
    </article>
    <dialog class="team-member-dialog" id="${id}-dialog" aria-labelledby="${id}-detail-name" aria-describedby="${id}-bio">
      <button class="team-dialog-close" type="button" data-team-close aria-label="关闭成员介绍" autofocus><span aria-hidden="true">×</span></button>
      <div class="team-dialog-layout">${portrait(member, "team-dialog-portrait")}
        <div class="team-dialog-copy"><p class="team-kicker">领导团队 / ${number(index)}</p><h2 id="${id}-detail-name">${esc(member.name)}</h2><p class="team-role">${esc(member.role)}</p><p class="team-full-bio" id="${id}-bio">${esc(member.bio)}</p></div>
      </div>
    </dialog>
    <noscript><p class="team-full-bio">${esc(member.bio)}</p></noscript>
  </li>`;
};

const coreProfile = (member, index) => `<li class="team-cell" data-team-cell>
  <article class="team-profile team-profile--core"><span class="team-profile-index" aria-hidden="true">${number(index)}</span>${portrait(member)}
    <div class="team-profile-body"><h3>${esc(member.name)}</h3><p class="team-role">${esc(member.role)}</p><i class="team-profile-rule" aria-hidden="true"></i></div>
  </article>
</li>`;

const pager = () => `<div class="team-pager" data-team-pager aria-label="成员名录翻页">
  <span class="team-page-range" data-team-range role="status" aria-live="polite"></span><i class="team-page-rule" aria-hidden="true"></i>
  <button type="button" data-team-prev aria-label="上一组成员"><span aria-hidden="true">←</span></button>
  <span class="team-page-count" data-team-page></span><button type="button" data-team-next aria-label="下一组成员"><span aria-hidden="true">→</span></button>
</div>`;

const scene = (kind, title, members, render) => `<div class="team-scene team-scene--${kind}" data-team-kind="${kind}">
  <div class="team-scene-heading"><h2>${esc(title)}</h2><span class="team-kicker">${String(members.length).padStart(2, "0")} 位成员</span></div>
  <div class="team-roster">${network}${kind === "core" ? '<div class="team-core-guides" aria-hidden="true"></div>' : ""}<ul class="team-list" aria-label="${kind === "leaders" ? "领导团队" : "核心成员"}名录">${members.map(render).join("\n")}</ul></div>${pager()}
</div>`;

const network = `<svg class="team-network" viewBox="0 0 1200 480" preserveAspectRatio="none" fill="none" aria-hidden="true"><g class="team-network-guides"><path d="M0 115H1200M0 365H1200"/><path d="M150 25V455M450 25V455M750 25V455M1050 25V455"/><ellipse cx="600" cy="240" rx="520" ry="200"/><path d="M60 385C290 485 835 45 1140 125"/></g><g class="team-network-marks"><path d="M0 100V130M1185 115H1200M0 365H15M1200 350V380"/><path d="M580 240H620M600 220V260"/><rect x="147" y="112" width="6" height="6"/><rect x="1047" y="362" width="6" height="6"/></g></svg>`;

const culture = [
  ["创新", "给新想法留出空间，愿意尝试不同的技术与方法。"],
  ["协作", "让设计、开发与运营一起解决问题，分享各自的经验。"],
  ["成长", "在实践中学习，也在彼此的反馈中继续进步。"]
];
const cultureArt = (index) => [
  '<path d="M36 80H124M80 36V124"/><path d="M49 49L111 111M111 49L49 111"/><circle cx="80" cy="80" r="45"/><rect x="75" y="75" width="10" height="10" class="team-art-fill"/>',
  '<circle cx="57" cy="80" r="35"/><circle cx="103" cy="80" r="35"/><path d="M28 80H132"/><rect x="75" y="75" width="10" height="10" class="team-art-fill"/>',
  '<path d="M36 121H124M48 109V86H71V64H94V41H117"/><path d="M37 121L117 41M103 41H117V55"/><rect x="43" y="104" width="10" height="10" class="team-art-fill"/>'
][index];

const TEAM_CHAPTERS = [
  { label: "领导团队", html: scene("leaders", "不同的专长，共同的方向。", data.leaders, leaderProfile) },
  { label: "核心成员", html: scene("core", "把想法，一起做出来。", data.core, coreProfile) },
  { label: "协作方式", html: `<div class="team-scene team-scene--culture" data-team-kind="culture"><div class="team-scene-heading"><h2>开放地想，一起向前。</h2><span class="team-kicker">我们的团队文化</span></div><div class="team-roster">${network}<ul class="team-list" aria-label="协作方式">${culture.map(([title, copy], i) => `<li class="team-cell" data-team-cell><article class="team-profile team-profile--culture"><span class="team-profile-index" aria-hidden="true">${number(i)}</span><svg class="team-culture-art" viewBox="0 0 160 160" fill="none" aria-hidden="true">${cultureArt(i)}</svg><div class="team-profile-body"><h3>${title}</h3><p>${copy}</p></div></article></li>`).join("\n")}</ul></div>${pager()}</div>` }
];

module.exports = { TEAM_CHAPTERS };
