const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Copy describes only features visible in the six supplied screenshots.
// No release date, download, audio playback, or availability is implied.
const PRODUCT_VIEWS = [
  {
    label: "首页", en: "HOME", title: ["让热爱，", "有自己的", "回响。"],
    description: "从每日推荐到精选活动，在熟悉的歌单与新的旋律之间，找到今天想听的声音。",
    features: ["每日推荐", "精选活动", "音乐搜索"],
    image: "home.png", width: 1920, height: 1032,
    caption: "从首页出发，发现同频的声音", detail: "推荐 · 活动 · 发现",
    alt: "森韵音乐桌面端首页，包含歌单、精选活动、侧边导航和底部播放控制栏"
  },
  {
    label: "排行榜", en: "CHARTS", title: ["循着榜单，", "遇见下一首", "心动。"],
    description: "Bilibili 术曲、Niconico 术曲、新歌、原创与飙升榜，让不同的旋律在这里相遇。",
    features: ["术曲榜单", "新歌原创", "飙升排行"],
    image: "rankings.png", width: 1920, height: 1032,
    caption: "沿着榜单，探索更多音乐可能", detail: "术曲 · 原创 · 新歌",
    alt: "森韵音乐排行榜界面，展示Bilibili术曲榜、Niconico术曲榜、新歌榜、原创榜与飙升榜"
  },
  {
    label: "歌单", en: "PLAYLISTS", title: ["一种心情，", "一张刚好的", "歌单。"],
    description: "从「雨落耳畔」到「星河来信」，跟着主题歌单，在日常与想象之间自由漫游。",
    features: ["主题歌单", "每日推荐", "分类浏览"],
    image: "playlists.png", width: 1920, height: 1032,
    caption: "一张歌单，收纳一种热爱", detail: "主题 · 心情 · 漫游",
    alt: "森韵音乐歌单界面，展示雨落耳畔、月色独白、城市回声等十张主题歌单及分类导航"
  },
  {
    label: "红心歌单", en: "FAVORITES", title: ["每次心动，", "都值得好好", "收藏。"],
    description: "把喜欢的音乐留在红心歌单里。一次收藏，让想要重听的旋律，有了随时回来的地方。",
    features: ["红心收藏", "播放全部", "批量管理"],
    image: "favorites.png", width: 1920, height: 1032,
    caption: "喜欢的声音，留在自己的收藏里", detail: "喜欢 · 收藏 · 重听",
    alt: "森韵音乐红心歌单界面，包含我喜欢的音乐、歌曲列表、播放全部与批量操作入口"
  },
  {
    label: "用户", en: "PROFILE", title: ["以音乐，", "记录自己的", "模样。"],
    description: "在个人主页整理创建与收藏的歌单，也让每一份音乐偏好，成为属于自己的表达。",
    features: ["个人资料", "创建歌单", "收藏歌单"],
    image: "profile.png", width: 1920, height: 1032,
    caption: "把音乐偏好，写进个人主页", detail: "主页 · 创建 · 收藏",
    alt: "森韵音乐用户主页，展示头像、个人资料、关注粉丝以及创建和收藏的歌单"
  },
  {
    label: "最近播放", en: "RECENT", title: ["听过的歌，", "让回忆替你", "记得。"],
    description: "回到最近播放，找回刚刚听过的旋律。单曲、歌单与专辑分开查看，延续每一次聆听。",
    features: ["播放记录", "分类查看", "收藏全部"],
    image: "recent.png", width: 1920, height: 1032,
    caption: "沿着聆听足迹，回到熟悉的旋律", detail: "足迹 · 回顾 · 再听",
    alt: "森韵音乐最近播放界面，包含单曲、歌单、专辑分类以及播放全部、收藏全部和批量操作入口"
  }
];
const num = (i) => String(i + 1).padStart(2, "0");
const total = String(PRODUCT_VIEWS.length).padStart(2, "0");
const wave = `<div class="product-wave" aria-hidden="true">${[8,16,10,23,34,18,46,30,58,42,24,49,66,38,22,54,40,28,60,36,18,44,27,13,22,8].map((height, i) => `<i style="--wave-height:${height}%;--wave-delay:${i * -83}ms"></i>`).join("")}<b></b></div>`;

const PRODUCTS_SCENE = `<div class="product-scene" data-product-scene>
  <i class="product-corner product-corner--start" aria-hidden="true"></i><i class="product-corner product-corner--end" aria-hidden="true"></i>
  <div class="room-panels product-views">${PRODUCT_VIEWS.map((view, i) => `<section class="room-panel product-view" id="panel-products-${i}" role="tabpanel" aria-labelledby="tab-products-${i}" tabindex="0" data-product-view="${i}"${i ? " hidden" : ""}>
    <div class="product-copy">
      <div class="product-identity" data-product-reveal><img src="assets/products/music-wordmark.png" width="94" height="38" alt="森韵"><span>音乐，让热爱相遇</span></div>
      <h2 data-product-reveal>${view.title.map((line, j) => `<span${j === 2 ? ' class="product-title-last"' : ""}>${esc(line)}</span>`).join("")}</h2>
      <p class="product-description" data-product-reveal>${esc(view.description)}</p>
      <ul class="product-features" data-product-reveal>${view.features.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      <div class="product-copy-foot" data-product-reveal>${wave}<button type="button" class="product-open" data-product-open="${i}">放大界面 <span aria-hidden="true">↗</span></button></div>
    </div>
    <figure class="product-showcase">
      <div class="product-image-area">
        <div class="product-orbit" aria-hidden="true"><i></i><b></b></div>
        <button type="button" class="product-image-button" data-product-open="${i}" aria-label="放大查看${esc(view.label)}界面" data-product-image>
          <img src="assets/products/${view.image}" width="${view.width}" height="${view.height}" alt="${esc(view.alt)}" decoding="async" loading="${i ? "lazy" : "eager"}"${i ? "" : ' fetchpriority="high"'}>
        </button>
        <span class="product-image-note" aria-hidden="true">森韵音乐 / ${esc(view.en)}</span>
      </div>
      <figcaption data-product-reveal><div><i aria-hidden="true"></i><span>${esc(view.caption)}</span></div><span>${num(i)} <em>/ ${total}</em></span></figcaption>
    </figure>
  </section>`).join("\n")}</div>
  <div class="room-tabs product-tabs" role="tablist" aria-label="森韵音乐功能">${PRODUCT_VIEWS.map((view, i) => `<button type="button" class="product-tab" data-room-tab="products-${i}" data-label="${view.label}" id="tab-products-${i}" role="tab" aria-controls="panel-products-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="product-tab-number" aria-hidden="true">${num(i)}</span><span class="product-tab-copy"><strong>${view.label}</strong><small>${view.detail}</small></span><span class="product-tab-arrow" aria-hidden="true">↗</span></button>`).join("\n")}</div>
</div>
<dialog class="product-preview" aria-labelledby="productPreviewTitle">
  <header class="product-preview-head"><div><p>森韵音乐 / 界面预览</p><h2 id="productPreviewTitle">${esc(PRODUCT_VIEWS[0].label)}</h2></div><button type="button" data-product-close aria-label="关闭界面预览">×</button></header>
  <div class="product-preview-zoom" role="group" aria-label="图片缩放"><button type="button" data-product-zoom-out aria-label="缩小图片">−</button><button type="button" data-product-zoom-reset aria-label="重置图片缩放">100%</button><button type="button" data-product-zoom-in aria-label="放大图片">＋</button><span>双指缩放 · 拖动查看</span></div>
  <div class="product-preview-image"><img data-product-preview-image alt=""></div>
  <footer class="product-preview-foot"><p data-product-preview-caption></p><div><button type="button" data-product-previous aria-label="上一张界面">←</button><span data-product-preview-count>01 / ${total}</span><button type="button" data-product-next aria-label="下一张界面">→</button></div></footer>
</dialog>`;

module.exports = { PRODUCTS_SCENE, PRODUCT_VIEWS };
