const CONTACT_SCENE = `
  <!-- One shared frame: invitation above, contact channels and legal identity below. -->
  <section class="contact-scene" aria-label="联系与合作" data-contact-scene>
    <span class="contact-frame-corner contact-frame-corner--start" aria-hidden="true"></span>
    <span class="contact-frame-corner contact-frame-corner--end" aria-hidden="true"></span>
    <div class="contact-hero">
      <div class="contact-invitation">
        <p class="contact-kicker" data-contact-reveal>产品交流 · 技术协作 · 合作意向</p>
        <h2 class="contact-title"><span data-contact-line>新的连接，</span><span data-contact-line>从一句你好开始。</span></h2>
        <p class="contact-intro" data-contact-reveal>介绍一下你自己、正在做的事，以及希望与森韵一起探索的方向。想法不必完整，我们愿意从交流开始。</p>
        <div class="contact-email-row" data-contact-reveal>
          <a class="contact-email" href="mailto:3896148508@qq.com"><span>3896148508@qq.com</span><span class="contact-email-arrow" aria-hidden="true">↗</span></a>
          <button class="contact-copy" type="button" data-copy-email><span data-copy-label>复制邮箱</span><span aria-hidden="true">＋</span></button>
        </div>
        <p class="contact-copy-status" role="status" aria-live="polite" data-copy-status></p>
      </div>
      <div class="contact-art" aria-hidden="true">
        <span class="contact-art-caption">SYCIYUAN / CONTACT</span>
        <svg viewBox="0 0 460 340" fill="none">
          <g class="contact-art-network">
          <g class="contact-art-guides"><path d="M20 170H440M230 16V324"/><circle cx="230" cy="170" r="134"/><path d="M53 48h18m-9-9v18M389 292h18m-9-9v18"/></g>
          <g class="contact-art-ticks"><path d="M96 32v14m-7-7h14M365 32v14m-7-7h14M96 294v14m-7-7h14M365 294v14m-7-7h14"/></g>
          <g class="contact-art-orbits">
            <ellipse cx="230" cy="170" rx="186" ry="65" transform="rotate(-32 230 170)"/>
            <ellipse cx="230" cy="170" rx="186" ry="65" transform="rotate(32 230 170)"/>
            <ellipse cx="230" cy="170" rx="65" ry="149"/>
          </g>
          <path class="contact-art-draw" pathLength="1" d="M68 268C108 207 353 104 392 72"/>
          <g class="contact-art-center"><rect x="218" y="158" width="24" height="24"/><path d="M230 143v12m0 30v12M203 170h12m30 0h12"/></g>
          <g class="contact-art-satellite"><rect x="64" y="264" width="8" height="8"/><circle cx="68" cy="268" r="16"/></g>
          <g class="contact-art-satellite contact-art-satellite--second"><rect x="388" y="68" width="8" height="8"/><circle cx="392" cy="72" r="16"/></g>
          <rect class="contact-art-packet" x="-3" y="-3" width="6" height="6"/>
          </g>
          <g class="contact-art-success">
            <circle cx="230" cy="170" r="112"/>
            <path class="contact-art-check" pathLength="1" d="M168 172L211 215L296 120"/>
          </g>
        </svg>
        <span class="contact-art-caption contact-art-caption--bottom"><i></i>让想法在这里相遇</span>
      </div>
    </div>
    <div class="contact-information">
      <section class="contact-channels" aria-labelledby="contactChannelsTitle">
        <div class="contact-section-head" data-contact-reveal><span class="contact-kicker">保持联系</span><h3 id="contactChannelsTitle">找到我们。</h3><span class="contact-section-mark" aria-hidden="true">↗</span></div>
        <dl class="contact-channel-list">
          <div data-contact-reveal><dt>电话</dt><dd><a href="tel:+8616690599967">+86 166-9059-9967 <span aria-hidden="true">↗</span></a></dd></div>
          <div data-contact-reveal><dt>QQ</dt><dd><a href="https://wpa.qq.com/msgrd?v=3&amp;uin=3896148508&amp;site=qq&amp;menu=yes" target="_blank" rel="noopener noreferrer">3896148508 <span aria-hidden="true">↗</span></a></dd></div>
          <div class="contact-address" data-contact-reveal><dt>联系地址</dt><dd><span>中国（河北）自由贸易试验区</span><span>曹妃甸片区金岛大厦 B 座 3613 室</span></dd></div>
        </dl>
      </section>
      <section class="contact-identity" aria-labelledby="contactIdentityTitle">
        <div class="contact-section-head" data-contact-reveal><span class="contact-kicker">森韵次元 · 主体信息</span><h3 id="contactIdentityTitle">让每一次连接，都有来处。</h3><span class="contact-section-mark" aria-hidden="true">＋</span></div>
        <dl class="contact-identity-list">
          <div data-contact-reveal><dt>公司主体</dt><dd>唐山森韵次元科技有限公司</dd></div>
          <div data-contact-reveal><dt>网站备案</dt><dd><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">冀ICP备2025102790号-5 <span aria-hidden="true">↗</span></a></dd></div>
          <div data-contact-reveal><dt>官网</dt><dd><a href="https://www.syciyuan.cn/" target="_blank" rel="noopener noreferrer">www.syciyuan.cn <span aria-hidden="true">↗</span></a></dd></div>
        </dl>
      </section>
    </div>
  </section>`;

module.exports = { CONTACT_SCENE };
