// One shared frame: the three relationships stay visible while their details change in place.
const PARTNERS = [
  {
    name: "林枫云", category: "托管支持", english: "CLOUD & HOSTING", image: "linfeng.png",
    title: "让每一次连接，<br>稳定抵达。",
    copy: "提供业务云、游戏云与服务器托管服务。以独立 IP、高频计算与优质线路为服务特点，为不同项目提供云端资源和托管选择。",
    features: [
      ["独立 IP", "独立 IP 与独享带宽，关注连接的稳定与安全。"],
      ["高频计算", "面向游戏与业务运行需求，提供不同的计算资源。"],
      ["服务器托管", "多地机房托管选择，配合运维与售后支持。"]
    ],
    tags: "业务云 / 游戏云 / 服务器托管", href: "https://www.dkdun.cn", link: "访问林枫云"
  },
  {
    name: "MineBBS", category: "社区友链", english: "COMMUNITY & CREATION", image: "minebbs.png",
    title: "从一个方块，<br>连接更多同好。",
    copy: "专注于 Minecraft 的中文社区，汇聚插件、地图、皮肤和材质包等游戏资源。玩家可以分享游戏心得、交流创作经验、参与社区活动，也能寻找开服资源与志同道合的伙伴。",
    features: [
      ["资源分享", "探索插件、地图、皮肤与材质包，发现新的玩法。"],
      ["创作交流", "分享作品与游戏心得，在交流中遇见新的伙伴。"],
      ["开服支持", "围绕开服资源、插件和经验，为服主提供交流空间。"]
    ],
    tags: "Minecraft / 资源 / 创作交流", href: "https://www.minebbs.com", link: "探索 MineBBS"
  },
  {
    name: "天空府邸", category: "早期社区项目", english: "ORIGIN & EXPLORATION", image: "tiank.png",
    title: "最初的相聚，<br>也是故事的起点。",
    copy: "森韵次元团队成立前开创的小型 Minecraft 论坛。从游戏中的相聚，到围绕共同兴趣的交流，这段社区实践也是森韵的来处。论坛提供自由话题、个人资料定制，以及货币与荣誉体系。",
    features: [
      ["兴趣相聚", "从 Minecraft 出发，围绕共同的热爱展开交流。"],
      ["自由话题", "小型论坛的轻量空间，让话题与发现自由发生。"],
      ["个人定制", "个人资料定制，结合论坛的货币与荣誉体系。"]
    ],
    tags: "Minecraft / 自由话题 / 论坛实践", href: "https://www.syciyuan.cn/products.html", link: "阅读项目介绍"
  }
];

const ECOSYSTEM_SCENE = `
  <section class="eco-scene" aria-label="生态伙伴介绍" data-eco-scene data-active="0">
    <i class="eco-frame-corner eco-frame-corner--start" aria-hidden="true"></i>
    <i class="eco-frame-corner eco-frame-corner--end" aria-hidden="true"></i>
    <aside class="eco-index">
      <div class="eco-index-heading">
        <p class="eco-kicker">同行 · 连接 · 共创</p>
        <h2><span>连接，让</span><span>热爱生长。</span></h2>
      </div>
      <div class="room-tabs eco-tabs" role="tablist" aria-label="生态伙伴" aria-orientation="vertical">
        ${PARTNERS.map((p, i) => `<button type="button" class="eco-tab" data-room-tab="ecosystem-${i}" data-label="${p.name}" id="tab-ecosystem-${i}" role="tab" aria-controls="panel-ecosystem-${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}"><span class="eco-tab-number" aria-hidden="true">0${i + 1}</span><span class="eco-tab-name">${p.name}<small>${p.category}</small></span><i class="eco-tab-arrow" aria-hidden="true">↗</i></button>`).join("\n")}
      </div>
      <div class="eco-network" aria-hidden="true">
        <svg viewBox="0 0 300 170" fill="none">
          <g class="eco-network-guides"><path d="M20 135H280M42 18V156M254 18V156"/><circle cx="68" cy="85" r="44"/><circle cx="68" cy="85" r="60"/></g>
          <g class="eco-network-ring"><path d="M68 25V32M128 85H121M68 145V138M8 85H15"/></g>
          <g class="eco-network-paths"><path d="M68 85C151 85 153 29 247 29"/><path d="M68 85H247"/><path d="M68 85C151 85 153 141 247 141"/></g>
          <g class="eco-network-route" data-eco-route="0"><path d="M68 85C151 85 153 29 247 29"/><rect x="242" y="24" width="10" height="10"/></g>
          <g class="eco-network-route" data-eco-route="1"><path d="M68 85H247"/><rect x="242" y="80" width="10" height="10"/></g>
          <g class="eco-network-route" data-eco-route="2"><path d="M68 85C151 85 153 141 247 141"/><rect x="242" y="136" width="10" height="10"/></g>
          <rect class="eco-network-packet" x="-2" y="-2" width="4" height="4"/>
          <g class="eco-network-hub"><rect x="60" y="77" width="16" height="16"/><path d="M52 69H60M52 69V77M84 101H76M84 101V93"/></g>
        </svg>
        <p>SYCYW <i></i> CONNECTED BY PASSION</p>
      </div>
    </aside>
    <div class="room-panels eco-panels">
      ${PARTNERS.map((p, i) => `<section class="room-panel eco-panel" id="panel-ecosystem-${i}" role="tabpanel" aria-labelledby="tab-ecosystem-${i}" tabindex="0"${i ? " hidden" : ""}>
        <div class="eco-detail">
          <div class="eco-detail-top">
            <figure class="eco-brand" data-eco-reveal><div class="eco-image-wrap"><img src="assets/reference/${p.image}" alt="${p.name}品牌图形" width="560" height="250"></div><figcaption><span>${p.name}</span><span aria-hidden="true">0${i + 1} / 03</span></figcaption></figure>
            <div class="eco-introduction"><p class="eco-kicker" data-eco-reveal>${p.category} <span aria-hidden="true">/ ${p.english}</span></p><h2 class="eco-title"><span data-eco-line>${p.title.replace("<br>", "</span><span data-eco-line>")}</span></h2><p class="eco-copy" data-eco-reveal>${p.copy}</p></div>
          </div>
          <div class="eco-features">${p.features.map(([title, copy], n) => `<div class="eco-feature" data-eco-reveal><span class="eco-feature-no" aria-hidden="true">0${n + 1}</span><h3>${title}</h3><p>${copy}</p></div>`).join("")}</div>
          <div class="eco-detail-foot" data-eco-reveal><p>${p.tags}</p><a class="eco-link" href="${p.href}" target="_blank" rel="noopener noreferrer">${p.link}<span aria-hidden="true">↗</span></a></div>
        </div>
      </section>`).join("\n")}
    </div>
  </section>`;

module.exports = { ECOSYSTEM_SCENE };
