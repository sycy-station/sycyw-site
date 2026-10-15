// One screen, four chapters. User-supplied screenshots are the content source.
const story = [
  { label: "缘起", text: "森韵次元的创始团队由一群热爱二次元文化和科技创新的年轻人组成。我们注意到，尽管二次元文化在年轻人中越来越受欢迎，但属于二次元的净土和平台却近乎于无。" },
  { label: "创立", text: "2024年，我们怀揣着将二次元文化与平台完美结合的梦想，创立了森韵次元。从最初的Mc服务器，到如今拥有超过13+开发团队的科技企业，我们始终坚持初心，致力于打造独特的二次元平台。" },
  { label: "探索", text: "七年来，我们参与了各个领域的圈子，包括Vup、术圈、ai音乐、UI设计、MC等复杂的圈子，这些经验与调研为我们带来了全新的体验和乐趣。未来，我们将继续探索更多可能性，创造更多令人惊喜的产品。" }
];
const values = [
  { title: "创新无界", sub: "INNOVATION", text: "我们鼓励突破常规思维，勇于尝试新的技术和创意，不断探索二次元文化与科技融合的可能性。" },
  { title: "用户至上", sub: "PEOPLE FIRST", text: "我们始终将用户需求放在首位，倾听用户声音，不断优化产品体验，为用户创造真正的价值。" },
  { title: "热爱与激情", sub: "PASSION", text: "我们热爱二次元文化和科技创新，这份热爱和激情驱动我们不断前行，创造更多精彩。" }
];
const milestones = [
  { date: "2018年", short: "2018", title: "“OurSky”成立", text: "森韵次元前身“Oursky”由创始人“冬月”一人创立，主营Mc服务器。", image: "origin", alt: "阳光穿过森林，林间小径向前延伸" },
  { date: "2022年", short: "2022", title: "结识成员", text: "结识了目前的常驻运维“Vxtls”，并开始积累资金。", image: "connection", alt: "日落时分的海岸与相接的海天" },
  { date: "2024年", short: "2024初", title: "想法初现", text: "在24年年初，有了制作一个二次元平台的想法，购买了项目搭载的物理服务器。", image: "idea", alt: "电路板上排列的芯片与电子元件" },
  { date: "2024年末", short: "2024末", title: "正式启动", text: "年末结识合伙人，一拍即合，创立森韵次元。成立公司。", image: "start", alt: "舒展开来的绿色蕨叶" },
  { date: "2025年", short: "2025", title: "全面发展", text: "将核心团队扩展至4人，开发团队扩展至13人，团队欣欣向荣。", image: "growth", alt: "晨光照亮云雾中的绿色山谷" },
  { date: "2025年末", short: "2025末", title: "开发PC/移动", text: "项目在初次调研完毕后，经过商讨，决定制作森韵次元坞的PC端和移动端，并且将中心迁移至术力口方向。", image: "idea", alt: "电路板上排列的芯片与电子元件" },
  { date: "2026年", short: "2026", title: "数据增入", text: "经过半年的研发，成功地开发出了AI全链路，实现歌曲授权—歌词增入—歌曲入库的全流程。并且开发出术曲识别、歌词识别、歌姬识别三大模型。", image: "growth", alt: "晨光照亮云雾中的绿色山谷" },
  { date: "2026年末", short: "2026末", title: "正式上线", text: "项目预计在12月正式全量上线，包含web、PC、移动端，敬请期待。", image: "horizon", alt: "星空下的连绵山峰" }
];
const no = (i) => String(i + 1).padStart(2, "0");
const year = (date, short = date) => {
  const suffix = /[初末]$/.exec(short)?.[0] || "年";
  return `<div class="about-year" aria-hidden="true"><span class="about-year-number" data-year="${date.slice(0, 4)}">${[...date.slice(0, 4)].map((digit) => `<span class="about-year-cell"><span class="about-year-digit">${digit}</span></span>`).join("")}</span><span class="about-year-suffix">${suffix}</span></div>`;
};
// A decorative orbit uses the same three-tone pixel planet as the home stage.
const valuesOrbit = `<div class="about-values-orbit" aria-hidden="true">
  <svg viewBox="0 0 400 400" width="400" height="400" focusable="false">
    <g class="about-values-orbit-guide" fill="none">
      <path d="M200 12v376M12 200h376"/>
      <circle cx="200" cy="200" r="164"/>
      <circle cx="200" cy="200" r="130"/>
      <ellipse cx="200" cy="200" rx="183" ry="70" transform="rotate(-32 200 200)"/>
      <ellipse cx="200" cy="200" rx="183" ry="70" transform="rotate(32 200 200)"/>
    </g>
    <g class="about-values-orbit-motion" fill="none">
      <circle class="about-values-orbit-dashes" cx="200" cy="200" r="147"/>
      <path class="about-values-orbit-arc" d="M200 53a147 147 0 0 1 127.31 73.5"/>
      <g class="about-values-orbit-nodes">
        <rect x="196" y="49" width="8" height="8"/>
        <rect x="68.69" y="269.5" width="8" height="8"/>
        <rect x="323.31" y="269.5" width="8" height="8"/>
      </g>
    </g>
    <g class="about-values-orbit-cross" fill="none"><path d="M194 12h12M194 388h12M12 194v12M388 194v12"/></g>
    <g transform="translate(172 172) scale(8)">
      <path fill="var(--planet-1)" d="M2 0h2v1H2zM1 1h2v1H1zM0 2h2v1H0zM0 3h1v1H0z"/>
      <path fill="var(--planet-2)" d="M4 0h1v1H4zM3 1h2v1H3zM2 2h3v1H2zM1 3h3v1H1zM1 4h2v1H1zM2 5h1v1H2z"/>
      <path fill="var(--planet-3)" d="M5 1h1v1H5zM5 2h2v1H5zM4 3h3v1H4zM3 4h3v1H3zM3 5h2v1H3zM2 6h3v1H2z"/>
    </g>
  </svg>
</div>`;
// A flat pixel form connects to a wireframe volume: two worlds, one bridge.
const missionBridge = `<div class="about-mission-bridge" aria-hidden="true">
  <svg viewBox="0 0 640 120" width="640" height="120" focusable="false">
    <g class="about-mission-guide" fill="none">
      <circle cx="116" cy="60" r="44"/><circle cx="524" cy="60" r="44"/>
      <path d="M116 6v10m0 88v10M62 60h10m88 0h10M524 6v10m0 88v10M470 60h10m88 0h10"/>
      <path d="M174 60h292M198 48h244M198 72h244"/>
      <path d="M232 56v8m44-8v8m88-8v8m44-8v8"/>
    </g>
    <g class="about-mission-pixels">
      <path d="M96 40h12v12H96zM112 40h12v12h-12zM96 56h12v12H96zM112 56h12v12h-12zM128 56h12v12h-12zM112 72h12v12h-12zM128 72h12v12h-12z"/>
      <path class="about-mission-pixel-accent" d="M128 40h12v12h-12zM96 72h12v12H96z"/>
    </g>
    <g class="about-mission-cube" fill="none">
      <path d="m524 34 24 13v26l-24 13-24-13V47zM500 47l24 13 24-13M524 60v26"/>
      <path class="about-mission-cube-back" d="m500 73 24-13 24 13M524 34v26"/>
    </g>
    <g class="about-mission-link" fill="none"><path d="M288 60h64"/><path d="m315 55 5-3 5 3v10l-5 3-5-3z"/></g>
    <rect class="about-mission-signal" x="181" y="57" width="6" height="6"/>
  </svg>
</div>`;
const tabs = (group, entries, label) => `<div class="about-subtabs" role="tablist" aria-label="${label}" data-about-switch>${entries.map((item, i) => `<button type="button" id="about-${group}-tab-${i}" role="tab" aria-controls="about-${group}-part-${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-about-tab="${i}"><span aria-hidden="true">${no(i)}</span>${item.label || item.title}</button>`).join("")}</div>`;
const ABOUT_CHAPTERS = [
  {
    label: "我们的故事",
    html: `<div class="about-scene about-story" data-about-group="story">
      <figure class="about-figure"><img src="assets/reference/about-story.jpg" alt="森林中面向红色夕阳的二次元少女" width="1280" height="853"><figcaption><span>始于热爱</span><span>2018 — PRESENT</span></figcaption></figure>
      <div class="about-story-body"><p class="about-kicker">01 / OUR STORY</p><h2 class="about-story-reveal"><span class="about-story-words">我们的故事</span></h2>
        ${tabs("story", story, "故事段落")}
        <div class="about-story-copy">${story.map((part, i) => `<div class="about-story-part" id="about-story-part-${i}" role="tabpanel" aria-labelledby="about-story-tab-${i}"><p class="about-story-reveal"><span class="about-story-words">${part.text}</span></p></div>`).join("")}</div>
        <div class="about-story-foot"><span>文化 · 创作 · 技术</span><span class="about-index">01 / 03</span></div>
      </div>
    </div>`
  },
  {
    label: "我们的价值观",
    html: `<div class="about-scene about-values" data-about-group="values">
      <header class="about-scene-head"><div><p class="about-kicker">02 / OUR VALUES</p><h2>我们的价值观</h2><p class="about-values-lead">指引我们前行的核心理念</p></div>${valuesOrbit}</header>
      ${tabs("values", values, "价值观")}
      <div class="about-values-grid">${values.map((value, i) => `<article class="about-value" id="about-values-part-${i}" role="tabpanel" aria-labelledby="about-values-tab-${i}"><div class="about-value-mark" aria-hidden="true">${no(i)}<i></i></div><span class="about-kicker">${value.sub}</span><h3>${value.title}</h3><p>${value.text}</p></article>`).join("")}</div>
    </div>`
  },
  {
    label: "我们的使命",
    html: `<div class="about-scene about-mission" data-about-group="mission"><header class="about-scene-head"><div><p class="about-kicker">03 / OUR MISSION</p><h2>我们的使命</h2></div><span class="about-kicker">二次元 × 现实世界</span></header>
      ${tabs("mission", [{ label: "使命宣言" }, { label: "数字足迹" }], "使命与数字")}
      <div class="about-mission-part" id="about-mission-part-0" role="tabpanel" aria-labelledby="about-mission-tab-0">${missionBridge}<p class="about-mission-copy">森韵次元致力于通过创新科技连接二次元与现实世界，为用户创造更加丰富、有趣、便捷的数字生活体验。我们希望让科技产品更有温度，让二次元文化更加普及，让每一位用户都能在我们的产品中找到惊喜与快乐。</p></div>
      <div class="about-mission-part" id="about-mission-part-1" role="tabpanel" aria-labelledby="about-mission-tab-1"><dl class="about-metrics">${[[6, "+", "年创新历程"], [10, "+", "专业团队成员"], [300, "+", "创新思维"], [10, "万+", "资金投入"]].map(([value, suffix, label]) => `<div class="about-metric"><dt>${label}</dt><dd><span data-about-count="${value}">${value}</span><span class="about-metric-unit">${suffix}</span></dd></div>`).join("")}</dl></div>
    </div>`
  },
  {
    label: "发展历程",
    html: `<div class="about-scene about-history" data-about-group="history"><div class="about-history-layout"><div class="about-history-frame"><header class="about-scene-head"><div><p class="about-kicker">04 / OUR JOURNEY</p><h2>发展历程</h2></div></header>
      <div class="about-milestones">${milestones.map((item, i) => `<article class="about-milestone" id="about-history-part-${i}" role="tabpanel" aria-labelledby="about-history-tab-${i}"${i ? " hidden" : ""}>${year(item.date, item.short)}<div class="about-milestone-copy"><p class="about-kicker">${item.date}</p><h3>${item.title}</h3><p>${item.text}</p></div><figure class="about-history-figure"><div class="about-history-image"><img src="assets/journey/${item.image}.jpg" alt="${item.alt}（示意配图）" width="960" height="600" decoding="async"></div><figcaption><span>示意配图</span><span>${no(i)} / ${String(milestones.length).padStart(2, "0")}</span></figcaption></figure></article>`).join("")}</div>
      </div><div class="about-history-rail" role="tablist" aria-label="${milestones.length}个发展节点" style="--history-count: ${milestones.length}" data-about-switch><span class="about-history-scale" aria-hidden="true"></span><div class="about-history-stops">${milestones.map((item, i) => `<button type="button" id="about-history-tab-${i}" role="tab" aria-controls="about-history-part-${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-about-tab="${i}"><span class="about-rail-step" aria-hidden="true">${no(i)}</span><span class="about-rail-dot" aria-hidden="true"></span><span class="about-rail-date">${item.short}</span><span class="about-rail-title">${item.title}</span></button>`).join("")}</div></div>
    </div></div>`
  }
];
module.exports = { ABOUT_CHAPTERS };
