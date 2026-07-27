(() => {
  "use strict";

  // 系统级「减弱动效」偏好：命中后跳过开屏、取消渐显，直接给出静态页面
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 开屏动画控制 ---------------- */
  /* 时间线：logo 入场 → 小字名称 → 代码逐行 → logo 放大并展开左右标题 → 整幕退场 */
  const splash = document.getElementById("splash");
  const codeContainer = document.getElementById("splashCode");
  let splashDone = false;

  // 开屏节奏集中在这里，改一处即可整体调快调慢（单位 ms）
  const TIMING = {
    nameDelay: 800,    // logo 稳定 → 出小字名称
    codeDelay: 950,    // 名称/下划线/caption 走完 → 显代码并开始打字
    charSpeed: 20,     // 每字符间隔
    lineGap: 150,      // 换行停顿
    expandDelay: 320,  // 打完最后一行 → logo 放大
    holdExpanded: 1750,   // 放大定格 → 开始退场（需覆盖状态块 1.4s 的进场编排）
    // 溶解开始 → stage 入场。侧标题形变到 0.38s 收尾，这里排在它尾段，
    // 让 pos-2/pos-5 在形变将尽时接手，两者在低透明度区交叉而不是各自硬切。
    handoffOverlap: 290,
    dissolve: 620         // 溶解开始 → 撤掉 splash 空壳
  };

  // 统一收口所有定时器，跳过开屏时一次性清空，避免残留回调继续推进阶段
  // 阶段同时打在 splash 和 body 上。跨接缝存活的装饰层（蜂巢、四角括号）
  // 已移到 .stage 内，不再是 #splash 的后代，只能靠 body.sp-* 驱动。
  const SP_PHASES = ["sp-logo", "sp-name", "sp-code", "sp-expand", "sp-leave"];
  const setPhase = (name) => {
    if (name) splash.classList.add("phase-" + name);
    document.body.classList.remove(...SP_PHASES);
    document.body.classList.add("sp-" + name);
  };

  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };

  // 多页改造后 script.js 同时服务首页与子页面。子页面没有 #splash，
  // 开屏那一整套（含滚动锁定）必须整体跳过，否则子页面会被锁死无法滚动。
  // html.nav-back（从子页面返回）时首页也要跳过：开屏已被 display:none，
  // 但时间线仍会加 body.loading 锁住滚动、并对隐藏元素推进阶段。
  const hasSplash =
    !!splash && !document.documentElement.classList.contains("nav-back");

  if (hasSplash) document.body.classList.add("loading");

  // 开屏未结束前，屏蔽滚轮、触摸与方向键/空格滚动
  const blockScroll = (e) => {
    if (document.body.classList.contains("loading")) {
      e.preventDefault();
    }
  };
  const blockKeyScroll = (e) => {
    const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (document.body.classList.contains("loading") && keys.includes(e.key)) {
      e.preventDefault();
    }
  };
  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", blockKeyScroll, { passive: false });

  // 保持四行，逐行缩短以压缩打字时长
  const codeLines = [
    "studio.init({ mode: 'minimal' });",
    "palette(['#0a0a0a', '#f4f3ef']);",
    "render(document.body);",
    "// less, but better."
  ];

  const typeLines = (lineIndex = 0) => {
    if (splashDone) return;

    if (lineIndex >= codeLines.length) {
      later(expandLogo, TIMING.expandDelay);
      return;
    }

    const lineEl = document.createElement("span");
    lineEl.className = "code-line active";
    codeContainer.appendChild(lineEl);

    const textNode = document.createTextNode("");
    const cursorEl = document.createElement("span");
    cursorEl.className = "code-cursor";
    cursorEl.textContent = "_";
    lineEl.appendChild(textNode);
    lineEl.appendChild(cursorEl);

    const text = codeLines[lineIndex];
    let charIndex = 0;

    const typeChar = () => {
      if (splashDone) return;
      if (charIndex <= text.length) {
        textNode.textContent = text.slice(0, charIndex);
        charIndex += 1;
        later(typeChar, TIMING.charSpeed);
      } else {
        lineEl.classList.remove("active");
        later(() => typeLines(lineIndex + 1), TIMING.lineGap);
      }
    };
    typeChar();
  };

  /* ---------------- 四角读数（HUD） ---------------- */
  const hudStatus = document.getElementById("hudStatus");
  const hudSeq = document.getElementById("hudSeq");
  const hudPct = document.getElementById("hudPct");
  const hudBar = document.getElementById("hudBar");

  // 状态与进度绑定在阶段上，读数才不会与画面脱节
  const setHud = (status, pct) => {
    if (hudStatus && status) {
      hudStatus.textContent = status;
      // 重放闪烁：先摘类、强制回流、再挂上
      hudStatus.classList.remove("flick");
      void hudStatus.offsetWidth;
      hudStatus.classList.add("flick");
    }
    if (typeof pct === "number") {
      if (hudPct) hudPct.textContent = String(pct).padStart(3, "0");
      if (hudBar) hudBar.style.width = pct + "%";
    }
  };

  // SEQ 每帧跳字，READY 后锁定，制造「运算中 / 已就绪」的对比
  let seqTimer = null;
  const startSeq = () => {
    if (prefersReducedMotion || !hudSeq) return;
    seqTimer = setInterval(() => {
      const v = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
      hudSeq.textContent = "0x" + v;
    }, 90);
  };
  const lockSeq = () => {
    clearInterval(seqTimer);
    seqTimer = null;
    if (hudSeq) hudSeq.textContent = "0xFFFF";
  };

  // 阶段三：名称与代码淡出，logo 放大，左右标题从中心滑出
  const expandLogo = () => {
    if (splashDone) return;
    setPhase("expand");
    lockSeq();
    setHud("READY", 100);
    later(leaveSplash, TIMING.holdExpanded);
  };

  // 开屏收尾统一走这里：无论是播完、被跳过还是减弱动效，都只执行一次
  let finished = false;
  const finishSplash = () => {
    if (finished) return;
    finished = true;
    // 此时 .splash-bg 已透明、装饰层已在 stage 内继续显示，
    // 隐藏 splash 只是撤掉一个已经看不见的空壳。
    splash.style.display = "none";
    splash.setAttribute("aria-hidden", "true");
    // stage-in 可能已在溶解中途加上，这里兜住减弱动效与跳过开屏两条路径
    document.body.classList.add("stage-in");
    initReveal();
  };

  const leaveSplash = () => {
    if (splashDone) return;
    splashDone = true;
    clearTimers();
    lockSeq();

    document.body.classList.remove("loading");

    if (prefersReducedMotion) {
      finishSplash();
      return;
    }

    // 分层溶解退场。不再位移整幕，所以开屏 logo 不会飞走、
    // 也就不会露出「底下还有一个一样的 logo」这个破绽。
    splash.classList.add("leave");
    document.body.classList.remove(...SP_PHASES);
    document.body.classList.add("sp-leave");

    // stage 入场提前压进溶解过程：侧标题还在淡出时，
    // pos-2 / pos-5 已经在同一位置淡入，读起来是「文字被换掉」而非「换了一屏」。
    later(() => document.body.classList.add("stage-in"), TIMING.handoffOverlap);

    // 溶解没有 transform，transitionend 不会在 splash 自身触发，直接用定时器
    later(finishSplash, TIMING.dissolve);
  };

  // 允许随时跳过开屏：点击任意处、Esc 或 Enter
  if (hasSplash) {
    splash.addEventListener("click", leaveSplash);
    window.addEventListener("keydown", (e) => {
      if (!splashDone && (e.key === "Escape" || e.key === "Enter")) {
        leaveSplash();
      }
    });
  }

  const runSplash = () => {
    if (prefersReducedMotion) {
      leaveSplash();
      return;
    }
    // logo 入场
    setPhase("logo");
    setHud("SCAN", 18);
    startSeq();
    later(() => {
      // 小字名称：五个字错峰入场
      setPhase("name");
      setHud("LINK", 46);
      later(() => {
        setPhase("code");
        setHud("SYNC", 72);
        typeLines(0);
      }, TIMING.codeDelay);
    }, TIMING.nameDelay);
  };

  // logo 是首屏唯一图片资源，等它就绪再起时间线，避免第一帧空白
  const logoEl = document.querySelector(".splash-logo");
  const startWhenLogoReady = () => {
    if (!logoEl || logoEl.complete) {
      runSplash();
      return;
    }
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      runSplash();
    };
    logoEl.addEventListener("load", go, { once: true });
    logoEl.addEventListener("error", go, { once: true });
    // logo 加载异常时不无限等待
    setTimeout(go, 2500);
  };

  // 子页面的 initReveal 在文件末尾统一调用：initReveal 是 const 声明，
  // 在此处调用会撞上暂时性死区。
  if (hasSplash) {
    window.addEventListener("load", startWhenLogoReady);
  }

  /* ---------------- 自定义光标 ---------------- */
  const cursor = document.querySelector(".cursor");
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (!isTouch && cursor) {
    // 只有 JS 真正接管光标后才隐藏系统光标，脚本失效时仍有原生光标可用
    document.body.classList.add("has-custom-cursor");

    let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const followCursor = () => {
      curX += (mouseX - curX) * 0.22;
      curY += (mouseY - curY) * 0.22;
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      requestAnimationFrame(followCursor);
    };
    requestAnimationFrame(followCursor);

    const hoverTargets = document.querySelectorAll("a, button, .index-item");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hovering"));
    });
  }

  /* ---------------- 全屏菜单开关 ---------------- */
  const menuToggle = document.getElementById("menuToggle");
  const overlayNav = document.getElementById("overlayNav");
  const navLinks = Array.from(overlayNav.querySelectorAll("a"));

  const setMenu = (open) => {
    overlayNav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    overlayNav.setAttribute("aria-hidden", String(!open));

    // 菜单关闭时把内部链接移出 Tab 序，避免焦点跑进不可见的覆盖层
    navLinks.forEach((link) => {
      if (open) {
        link.removeAttribute("tabindex");
      } else {
        link.setAttribute("tabindex", "-1");
      }
    });

    if (open) {
      navLinks[0]?.focus();
    }
  };

  setMenu(false);

  menuToggle.addEventListener("click", () => {
    setMenu(!overlayNav.classList.contains("open"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenu(false);
      menuToggle.focus();
    });
  });

  // 菜单展开期间：Esc 关闭并归还焦点，Tab 在菜单内循环
  document.addEventListener("keydown", (e) => {
    if (!overlayNav.classList.contains("open")) return;

    if (e.key === "Escape") {
      setMenu(false);
      menuToggle.focus();
      return;
    }

    if (e.key === "Tab") {
      // header 在覆盖层之上，主题开关展开时仍可见，所以要留在焦点循环里
      const focusables = [...navLinks, themeToggle, menuToggle].filter(Boolean);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------------- 深色模式 ---------------- */
  /* 首帧前的取值已由 index.html 的内联脚本写进 data-theme，这里只负责切换。
     无 data-theme 时页面跟随系统偏好（theme.css 的 @media），
     一旦点过开关就写死 localStorage，之后不再跟随系统。 */
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "ces-theme";

  if (themeToggle) {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    // 当前生效的主题：显式选择优先，否则看系统
    const currentTheme = () => {
      const explicit = root.getAttribute("data-theme");
      if (explicit === "dark" || explicit === "light") return explicit;
      return systemDark.matches ? "dark" : "light";
    };

    // 按钮状态跟着实际生效的主题走，不只跟着 data-theme
    const syncToggle = () => {
      const dark = currentTheme() === "dark";
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.setAttribute("aria-label", dark ? "切换浅色模式" : "切换深色模式");
    };

    // JS 就绪后按钮才可见，避免脚本失效时留一个点不动的按钮
    document.body.classList.add("has-theme-toggle");
    syncToggle();

    let switchTimer = null;
    const setTheme = (name) => {
      // 大面积色块的过渡只在切换期间挂上，平时不干扰开屏那套编排
      root.classList.add("theme-switching");
      clearTimeout(switchTimer);
      switchTimer = setTimeout(() => root.classList.remove("theme-switching"), 450);

      root.setAttribute("data-theme", name);
      try {
        localStorage.setItem(THEME_KEY, name);
      } catch (e) {
        // 隐私模式下写入可能失败，本次会话内仍然生效
      }
      syncToggle();
    };

    themeToggle.addEventListener("click", () => {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });

    // 未做过显式选择时，系统偏好变化要跟上（比如日落自动切换）
    systemDark.addEventListener("change", () => {
      if (!root.hasAttribute("data-theme")) syncToggle();
    });
  }

  /* ---------------- 实时时钟（固定上海时区，与页面标注一致） ---------------- */
  // 两处用到：覆盖菜单页脚，以及分区页底部信息带。用类选择器收集，
  // 谁存在就更新谁（子页面没有底部带，首页两者都有）。
  const clockEls = document.querySelectorAll(".clock");
  const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const updateClock = () => {
    const t = timeFormatter.format(new Date());
    clockEls.forEach((el) => {
      el.textContent = t;
    });
  };
  if (clockEls.length) {
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ---------------- 滚动揭示动画 ---------------- */
  // 推迟到开屏彻底结束后才监听，避免首屏元素在黑幕背后就被揭示，退场后失去渐显效果
  const initReveal = () => {
    const revealEls = document.querySelectorAll(".reveal-line, .reveal-item");

    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  };

  /* ================================================================
     子页面入场
     ----------------------------------------------------------------
     初始隐藏态由 page.css 的 .js-enter 承担（nav-signal 内联脚本在首帧前
     加上），这里只负责在首帧之后放行。用 rAF 而非立即加类：
     同一帧内加上初始态与目标态，浏览器不会插值，过渡会被跳过。
     ================================================================ */
  const initPageEnter = () => {
    const root = document.documentElement;
    if (root.getAttribute("data-page") !== "sub") return;

    // 双 rAF：第一帧让 .js-enter 的初始态生效，第二帧再触发过渡
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add("page-ready"));
    });
  };

  /* ---------------- 横条上的当前页星球标记 ---------------- */
  /* 星球在首页是公转的，在子页面锁在当前项编号前，成为「你在哪」的标记。
     复用首页那个 7x7 像素盘的几何，不新做图形。 */
  const PLANET_SVG =
    '<svg viewBox="0 0 7 7" width="16" height="16" focusable="false" aria-hidden="true">' +
    '<g fill="var(--planet-1)">' +
    '<rect x="2" y="0" width="2" height="1"/><rect x="1" y="1" width="2" height="1"/>' +
    '<rect x="0" y="2" width="2" height="1"/><rect x="0" y="3" width="1" height="1"/></g>' +
    '<g fill="var(--planet-2)">' +
    '<rect x="4" y="0" width="1" height="1"/><rect x="3" y="1" width="2" height="1"/>' +
    '<rect x="2" y="2" width="3" height="1"/><rect x="1" y="3" width="3" height="1"/>' +
    '<rect x="1" y="4" width="2" height="1"/><rect x="2" y="5" width="1" height="1"/></g>' +
    '<g fill="var(--planet-3)">' +
    '<rect x="5" y="1" width="1" height="1"/><rect x="5" y="2" width="2" height="1"/>' +
    '<rect x="4" y="3" width="3" height="1"/><rect x="3" y="4" width="3" height="1"/>' +
    '<rect x="3" y="5" width="2" height="1"/><rect x="2" y="6" width="3" height="1"/></g>' +
    "</svg>";

  const initBarPlanet = () => {
    const current = document.querySelector(".ib-item.is-current");
    if (!current) return;
    const holder = document.createElement("span");
    holder.className = "ib-planet";
    holder.setAttribute("aria-hidden", "true");
    holder.innerHTML = PLANET_SVG;
    current.insertBefore(holder, current.firstChild);
  };

  /* ---------------- 横条上的当前项下划线 ---------------- */
  /* 原先是 .is-current::after，伪元素长在各自的项上，跨页时只能「这边消失、
     那边出现」。改成横条里唯一一条实体线，位置由这里量出来写进 --mx / --mw，
     于是子页之间切换时它能从旧项滑到新项。

     为什么坐标可以不跨文档传递：六页的横条 HTML 逐字节相同，
     所以旧页算得出新项的位置、新页也算得出旧项的位置。
     与 --title-* 共享接缝坐标是同一个手法。 */
  let barMarker = null;

  // 把标记摆到某一项下方。offsetLeft 是相对 .ib-track 内容盒的，
  // 不受横向滚动影响——用 getBoundingClientRect 反而要再减去滚动量。
  const placeMarker = (item) => {
    if (!barMarker || !item) return;
    barMarker.style.setProperty("--mx", item.offsetLeft + "px");
    barMarker.style.setProperty("--mw", item.offsetWidth + "px");
  };

  const initBarMarker = () => {
    const track = document.querySelector(".ib-track");
    const current = document.querySelector(".ib-item.is-current");
    if (!track || !current) return;

    barMarker = document.createElement("i");
    barMarker.className = "ib-marker";
    barMarker.setAttribute("aria-hidden", "true");
    track.appendChild(barMarker);

    // 星球是 initBarPlanet 插进当前项的，会让该项变宽 16px。
    // 必须等它插完再量，否则线短一截。两者的调用顺序在 init 里保证。
    placeMarker(current);

    // 双 rAF 后才显形：首帧还没量到坐标，先亮着会在 left:0 闪一下
    requestAnimationFrame(() => {
      requestAnimationFrame(() => barMarker.classList.add("is-ready"));
    });

    // 视口变化后重量。此刻没有 body.bar-slide，所以是瞬时归位、不带过渡。
    let rt = 0;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => placeMarker(document.querySelector(".ib-item.is-current")), 120);
    });
  };

  /* ---------------- 横条随滚动隐去 ---------------- */
  /* 向下滚隐去、向上滚回来。阈值与顶部豁免区避免抖动：
     刚好在临界点附近的微小滚动不该让横条反复进出。 */
  const initBarScroll = () => {
    const bar = document.querySelector(".index-bar");
    if (!bar) return;

    const THRESHOLD = 8;   // 单次判定所需的最小位移，滤掉抖动
    const TOP_ZONE = 80;   // 顶部这段内始终显示，避免刚滚一点就隐去

    let last = window.scrollY;
    let ticking = false;

    const apply = () => {
      const y = window.scrollY;
      const dy = y - last;

      if (y <= TOP_ZONE) {
        document.body.classList.remove("bar-hidden");
        last = y;
      } else if (Math.abs(dy) > THRESHOLD) {
        document.body.classList.toggle("bar-hidden", dy > 0);
        last = y;
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        // 合并到一帧，scroll 事件本身可能每像素触发一次
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(apply);
        }
      },
      { passive: true }
    );
  };

  /* ================================================================
     接缝几何：正反两向共用的三个量法
     ----------------------------------------------------------------
     轨道六项是斜的（--tilt 取 ±7deg），子页标题块是平的。倾斜写在
     .orbit-item 的 transform 上，与定位 translate 共用同一个属性。

     这里三个函数存在的唯一理由：getBoundingClientRect() 对旋转元素返回的是
     外接矩形，不是文字所在的矩形。斜 7° 时外接框向外胀，量出来的左缘、宽度
     全都偏——实测左列三项因此横向偏 80~220px，上下四项纵向偏 10~27px。
     中间两项（--tilt: 0deg）恰好准，所以只测那两项时看不出问题。
     ================================================================ */

  // 接缝坐标：即插即弃的探针，让浏览器去解析 --title-left / --title-top 的 calc()。
  // 不硬编码，保证与子页标题块、与两个方向的动画端点始终是同一个数。
  const seamPoint = () => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;left:var(--title-left);top:var(--title-top);" +
      "width:0;height:0;pointer-events:none;visibility:hidden";
    document.body.appendChild(probe);
    const r = probe.getBoundingClientRect();
    probe.remove();
    return { left: r.left, top: r.top };
  };

  // 某一项的倾斜角，度。CSS 里声明为 --tilt，读出来形如 "-7deg"。
  const tiltOf = (item) =>
    parseFloat(getComputedStyle(item).getPropertyValue("--tilt")) || 0;

  // 每行相对 .orbit-inner 左缘的局部横向偏移。
  // 临时把 --tilt 覆盖成 0 再量：变量可以单独覆盖，而 transform 整体不能只改 rotate。
  // 此刻没有旋转，rect 就是纯布局值；配合 stage.css 的 justify-items，量到的是文字盒。
  const localOffsets = (item, inner, lines) => {
    const had = item.style.getPropertyValue("--tilt");
    item.style.setProperty("--tilt", "0deg");
    void inner.getBoundingClientRect();   // 强制回流，让覆盖生效

    const base = inner.getBoundingClientRect().left;
    const xs = lines.map((el) => el.getBoundingClientRect().left - base);

    if (had) item.style.setProperty("--tilt", had);
    else item.style.removeProperty("--tilt");
    void inner.getBoundingClientRect();   // 还原后再回流，避免后续量到中间态

    return xs;
  };

  // .orbit-inner 局部原点 (0,0) 在视口中的真实位置。
  // 塞一个 0×0 的绝对定位子元素来量：它跟着所有祖先 transform 走，
  // 是一个点而不是一个框，所以旋转不会让它「胀」。这是唯一不受倾斜干扰的量法。
  const originPoint = (inner) => {
    const had = inner.style.position;
    inner.style.position = "relative";

    const mark = document.createElement("i");
    mark.style.cssText = "position:absolute;left:0;top:0;width:0;height:0";
    inner.appendChild(mark);
    const r = mark.getBoundingClientRect();
    mark.remove();

    inner.style.position = had;
    return { left: r.left, top: r.top };
  };

  /* ================================================================
     首页退场：点击轨道某一项 → 旅行 → 跳转
     ----------------------------------------------------------------
     只让被点那一项的三行块跨接缝旅行，其余各自淡出。旅行块是克隆件，
     必须挂到 body 下：.stage 有 overflow:hidden 且 .stage-orbit 带
     transform（成为 fixed 的包含块），留在原处会被裁掉。
     ================================================================ */
  const initLeave = () => {
    const root = document.documentElement;
    if (root.getAttribute("data-page") !== "stage") return;

    const items = [...document.querySelectorAll(".orbit-item")];
    if (!items.length) return;

    let leaving = false;

    const go = (href) => {
      location.href = href;
    };

    // 抽成命名函数：覆盖菜单里的六个链接也要走同一套旅行，
    // 否则从菜单进子页是硬跳、从轨道进是形变，同一目的地两种手感。
    const travelFrom = (item) => {
      const href = item.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;

      if (leaving) return;
      leaving = true;

      // 写入页间信号，供新页 <head> 的内联脚本在首帧前读取
      try {
        sessionStorage.setItem(
          "ces-nav",
          JSON.stringify({
            from: "stage",
            slug: href.replace(/\.html$/, ""),
            no: item.getAttribute("data-no") || "",
            ts: Date.now()
          })
        );
      } catch (err) {
        // 存不进去也要能跳转，只是新页走冷启动入场
      }

      // 减弱动效：不做旅行，直接走
      if (prefersReducedMotion) {
        go(href);
        return;
      }

      const inner = item.querySelector(".orbit-inner");
      if (!inner) {
        go(href);
        return;
      }

      // 三个量都必须在加 .leaving 之前做：加类之后原位块被 visibility:hidden，
      // rect 仍有效，但淡出中的兄弟元素可能已影响布局。
      const lines = [...inner.children];

      // 每行的局部横向偏移。左列三项是右对齐的，这个值就是它相对左缘推开多远；
      // 右列三项本就左对齐，为 0。旅行块起飞时按这个值摆好、飞行中过渡到 0，
      // 读成「逐行左收」，落地正好是子页那个左对齐的标题块。
      const shifts = localOffsets(item, inner, lines);

      // 起点：局部原点的屏幕位置，配 .travel 的 transform-origin: 0 0。
      // 不用 inner.getBoundingClientRect()——斜项量到的是胀开的外接框。
      const start = originPoint(inner);
      const tilt = tiltOf(item);

      // 两层结构：外层管整块位移与倾斜，内层管每行的横向收拢。
      // 起点写成 --sx0/--sy0 而不是 left/top —— 行内 left/top 会赢过
      // .travel.go 的类规则，终点就永远不生效。
      const travelInner = inner.cloneNode(true);
      travelInner.className = "travel-inner";
      [...travelInner.children].forEach((el, i) => {
        el.style.setProperty("--sx", shifts[i].toFixed(2) + "px");
      });

      const travel = document.createElement("div");
      travel.className = "travel";
      travel.setAttribute("aria-hidden", "true");
      travel.style.setProperty("--sx0", start.left.toFixed(2) + "px");
      travel.style.setProperty("--sy0", start.top.toFixed(2) + "px");
      // 带上该项的倾斜起飞，.go 那一帧连同位移一起收平
      travel.style.setProperty("--t0", tilt + "deg");
      travel.appendChild(travelInner);

      item.classList.add("is-travelling");
      document.body.appendChild(travel);
      document.body.classList.add("leaving");

      // 星球先吸附到该项方向，再随退场淡出。aimAt 由 initPlanet 挂在 window 上。
      if (typeof window.__cesAimPlanet === "function") {
        window.__cesAimPlanet(items.indexOf(item));
      }

      // 下一帧再加 .go：同帧设起点与终点不会插值
      requestAnimationFrame(() => {
        requestAnimationFrame(() => travel.classList.add("go"));
      });

      // 不等动画结束就发起跳转。新页可绘制前浏览器仍显示旧页，
      // 剩余约 120ms 的动画在请求期间照常播；若新页来得慢，
      // 动画播完停在最后一帧——而那一帧正是约定的接缝状态。
      setTimeout(() => go(href), 300);
    };

    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        // 修饰键与中键必须放行，否则「新标签页打开」会被退场动画劫持
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!item.getAttribute("href")) return;
        e.preventDefault();
        travelFrom(item);
      });
    });

    // 覆盖菜单：转交给对应的轨道项，让它按同一套形变退场。
    // 必须先收起菜单——覆盖层在旅行块之上，不收起就看不到飞行。
    document.querySelectorAll(".overlay-list a").forEach((a) => {
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const href = a.getAttribute("href");
        const item = items.find((it) => it.getAttribute("href") === href);
        if (!item) return;          // 菜单里出现了轨道上没有的目标，交给默认行为
        e.preventDefault();
        setMenu(false);
        // 等覆盖层的退场过渡（0.4s）走掉大半再起飞，否则前半段被挡住
        setTimeout(() => travelFrom(item), 260);
      });
    });
  };

  /* ================================================================
     子页面退场：点击 header 标记 → 回首页
     ----------------------------------------------------------------
     标题块不飞：它就是接缝，原地留着。其余（横条、正文、footer）淡出。
     飞行发生在首页文档里（见 initBackArrive），因为轨道坐标只有那边知道。
     ================================================================ */
  const initLeaveBack = () => {
    const root = document.documentElement;
    if (root.getAttribute("data-page") !== "sub") return;

    const mark = document.querySelector(".site-header .mark");
    if (!mark) return;

    let leaving = false;

    mark.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const href = mark.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;

      e.preventDefault();
      if (leaving) return;
      leaving = true;

      try {
        sessionStorage.setItem(
          "ces-nav",
          JSON.stringify({
            from: "sub",
            slug: root.getAttribute("data-slug") || "",
            no: (document.querySelector(".ib-item.is-current .ib-no") || {}).textContent || "",
            ts: Date.now()
          })
        );
      } catch (err) {
        // 存不进去也要能跳转，只是首页会正常播开屏
      }

      if (prefersReducedMotion) {
        location.href = href;
        return;
      }

      document.body.classList.add("leaving-back");
      setTimeout(() => {
        location.href = href;
      }, 300);
    });
  };

  /* ================================================================
     子页面之间的退场：点横条某一项，或覆盖菜单里的另一个子页
     ----------------------------------------------------------------
     改动前这条路径上一个处理器都没有——.ib-item 与 .overlay-list a 都是
     裸 href，点下去浏览器硬跳。后果是三层叠加：
       1) 没有任何退场，硬切
       2) 落地页找不到 ces-nav 信号，于是走 :not(.nav-enter) 那条冷启动入场
          （0.06/0.18/0.28/0.34s 延迟配 0.6s 过渡，合计约 940ms）
       3) 横条跟着整条淡出再淡入，尽管六页的横条 HTML 逐字节相同
     实测落地第 0ms 是一整屏空白（上半屏墨迹占比 0.0016，
     而首页→子页同一时刻是 0.0715，因为旅行块还停在画面上）。

     这里只做三件事：横条不动、标记滑向新项、标题与正文快速淡出。
     ================================================================ */
  const initLeaveSub = () => {
    const root = document.documentElement;
    if (root.getAttribute("data-page") !== "sub") return;

    const here = root.getAttribute("data-slug") || "";
    let leaving = false;

    const goSub = (href, targetItem) => {
      if (leaving) return true;
      leaving = true;

      try {
        sessionStorage.setItem(
          "ces-nav",
          JSON.stringify({
            from: "sub-sub",
            slug: href.replace(/\.html$/, ""),
            ts: Date.now()
          })
        );
      } catch (err) {
        // 存不进去也要能跳转，只是落地页走冷启动入场
      }

      if (prefersReducedMotion) {
        location.href = href;
        return true;
      }

      // 标记滑向新项。加 .bar-slide 才有过渡——平时（如 resize 重量）是瞬时归位。
      if (targetItem && barMarker) {
        document.body.classList.add("bar-slide");
        // 下一帧再改坐标：同帧设起点终点不会插值
        requestAnimationFrame(() => placeMarker(targetItem));
      }

      document.body.classList.add("leaving-sub");

      // 200ms 后发起跳转。标记的滑移是 --travel(380ms)，跳不完也无妨：
      // 新页首帧会把标记直接摆在落点，而那正是滑移的终点。
      setTimeout(() => {
        location.href = href;
      }, 200);
      return true;
    };

    // 判定：这个 href 是否指向另一个子页（不是当前页、不是首页、不是锚点）
    const otherSub = (href) =>
      href &&
      href.charAt(0) !== "#" &&
      /^[\w-]+\.html$/.test(href) &&
      href !== "index.html" &&
      href.replace(/\.html$/, "") !== here;

    const bind = (el, findTarget) => {
      el.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const href = el.getAttribute("href");
        if (!otherSub(href)) return;   // 当前页自身或首页，交给别的处理器/默认行为
        e.preventDefault();
        goSub(href, findTarget(href));
      });
    };

    const items = [...document.querySelectorAll(".ib-item")];
    const itemFor = (href) => items.find((it) => it.getAttribute("href") === href) || null;

    items.forEach((it) => bind(it, itemFor));

    // 覆盖菜单里的六个链接走同一套。否则「从横条点」与「从菜单点」
    // 会是两种手感——同一个目的地不该因入口不同而表现不同。
    document.querySelectorAll(".overlay-list a").forEach((a) => bind(a, itemFor));
  };

  /* ================================================================
     首页到达：从子页面返回
     ----------------------------------------------------------------
     FLIP。到达项在轨道上的静止位置是 Last，接缝坐标是 First，
     两者之差作为初始 transform 顶上去，下一帧摘掉即滑回。

     比正向多一层：轨道项是斜的，子页标题块是平的，所以首帧不只要平移到
     接缝，还要把内容在屏幕上「拍平」。做法是给 .orbit-inner 一个反向旋转
     （-tilt），抵消 .orbit-item 上的 +tilt。

     但这样一来 .orbit-inner 的局部坐标系被旋转了，需要的屏幕位移不能直接
     当成 translate 写进去——会被旋转再转一次。必须经旋转矩阵换算成局部位移，
     见下面 ldx / ldy。
     ================================================================ */
  const initBackArrive = () => {
    const root = document.documentElement;
    if (!root.classList.contains("nav-back")) return;

    const no = root.getAttribute("data-back-no");
    const items = [...document.querySelectorAll(".orbit-item")];
    const item =
      items.find((el) => el.getAttribute("data-no") === no) || items[0];

    const finish = () => document.body.classList.add("stage-back");

    if (!item || prefersReducedMotion) {
      finish();
      return;
    }

    const inner = item.querySelector(".orbit-inner");
    if (!inner) {
      finish();
      return;
    }

    item.classList.add("is-arriving");

    // 窄屏六项是堆叠的，不在圆上，飞回轨道没有意义（CSS 那边也已退化）
    if (window.matchMedia("(max-width: 720px)").matches) {
      finish();
      return;
    }

    const lines = [...inner.children];

    // 测量与 invert 都放进 rAF：解析期布局尚未稳定，那时量到的位置会偏。
    // 到达项此刻是透明的，所以多等一帧不会被看见。
    requestAnimationFrame(() => {
      const seam = seamPoint();
      const tilt = tiltOf(item);
      const rad = (tilt * Math.PI) / 180;

      // 每行的局部横向偏移，与正向退场取自同一个函数。
      // 左列三项右对齐时这个值 > 0，右列为 0。
      const shifts = localOffsets(item, inner, lines);

      // Invert 第一步：先把内容在屏幕上拍平、每行拉回左缘。
      // 两者一起做，因为接下来量的原点位置必须是「已经拍平之后」的那个原点。
      inner.style.transform = `rotate(${-tilt}deg)`;
      lines.forEach((el, i) =>
        el.style.setProperty("--sx", (-shifts[i]).toFixed(2) + "px")
      );
      void inner.getBoundingClientRect();

      // Invert 第二步：量拍平后局部原点在屏幕上的位置，算出到接缝还差多少。
      const flat = originPoint(inner);
      const sdx = seam.left - flat.left;
      const sdy = seam.top - flat.top;

      // 屏幕位移 → item 局部位移。inner 的父级 .orbit-item 被 +tilt 旋转过，
      // 写进 inner 的 translate 会在那个旋转过的坐标系里生效，
      // 所以要先反向旋转一次。少了这步，斜项会沿着斜方向跑偏。
      const ldx = sdx * Math.cos(rad) + sdy * Math.sin(rad);
      const ldy = -sdx * Math.sin(rad) + sdy * Math.cos(rad);

      // 位移与反向旋转合成一条 transform。过渡此刻是关着的
      // （html.nav-back 那条 transition:none），所以是瞬间就位。否则
      // .orbit-inner 常驻的 transition:transform 会把这一步也变成动画，
      // 观感成了 轨道→接缝→轨道 来回跑一趟。
      inner.style.transform =
        `translate(${ldx.toFixed(2)}px, ${ldy.toFixed(2)}px) rotate(${-tilt}deg)`;

      // 强制回流，让 invert 作为过渡起点被采样，然后才揭示
      void inner.getBoundingClientRect();
      root.classList.add("back-ready");

      // Play：下一帧打开过渡，同帧摘掉行内 transform、--sx 归零。
      // 终点是纯 CSS 的轨道态，不需要再算任何补偿量。
      requestAnimationFrame(() => {
        root.classList.add("back-play");
        inner.style.transform = "";
        lines.forEach((el) => el.style.setProperty("--sx", "0px"));
        finish();
      });
    });

    // 落地后摘掉 .is-arriving 并清掉 --sx。此刻 --sx 已是 0，
    // 清掉与留着的渲染结果相同，所以看不到跳变。
    const glide = 380;
    setTimeout(() => {
      item.classList.remove("is-arriving");
      lines.forEach((el) => el.style.removeProperty("--sx"));
      // 星球从该项角度解锁，继续公转
      if (typeof window.__cesReleasePlanet === "function") {
        window.__cesReleasePlanet(items.indexOf(item));
      }
    }, glide + 40);
  };

  /* ================================================================
     像素星球：绕 logo 顺时针公转，指向/聚焦某项时按最近路径停到该方向，
     松开后从当前位置继续公转。
     用 rAF 自己积角度而不是 CSS animation：snap 需要读当前角度，
     纯 CSS 得反解 transform matrix 才能拿到，很脏。
     ================================================================ */
  const initPlanet = () => {
    const planet = document.querySelector(".orbit-planet");
    const ring = document.querySelector(".orbit-planet-ring");
    const orbit = document.querySelector(".stage-orbit");
    if (!planet || !ring || !orbit) return;

    const items = [...document.querySelectorAll(".orbit-item")];
    const PERIOD = 52000;   // 一圈毫秒数，慢到不盯着看不觉得在动
    const SNAP = 400;       // 吸附到位时长
    // 窄屏下六项已收成两列、不在圆上，环与星球都 display:none，不必跑循环
    const narrow = window.matchMedia("(max-width: 720px)");

    let angle = 0;          // 当前极角，度，0=12 点，顺时针为正
    let mode = "free";      // free | snap | hold
    let from = 0;           // snap 起点
    let to = 0;             // snap 终点
    let snapT = 0;          // snap 已用时
    let cx = 0;
    let cy = 0;
    let r = 0;
    let raf = 0;
    let last = 0;

    const measure = () => {
      const rr = ring.getBoundingClientRect();
      r = rr.width / 2;
      cx = (rr.left + rr.right) / 2;
      cy = (rr.top + rr.bottom) / 2;
    };

    // 项的方向角：用贴向 logo 的那条内缘中点，而不是整块的几何中心，
    // 否则左右两列的角度会被块宽拉偏。
    const itemAngle = (el, i) => {
      const b = el.getBoundingClientRect();
      const x = i < 3 ? b.right : b.left;
      const y = (b.top + b.bottom) / 2;
      return (Math.atan2(x - cx, -(y - cy)) * 180) / Math.PI;
    };

    // 最近路径：把差值折进 -180..180，避免从 pos-1 指到 pos-6 绕大半圈
    const shortest = (a, b) => {
      let d = ((((b - a) % 360) + 540) % 360) - 180;
      return a + d;
    };

    const place = () => {
      const rad = (angle * Math.PI) / 180;
      const x = Math.sin(rad) * r;
      const y = -Math.cos(rad) * r;
      planet.style.transform =
        "translate(-50%, -50%) translate(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px)";
    };

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const frame = (now) => {
      const dt = Math.min(now - last, 100); // 切回标签页时别一次跳一大段
      last = now;
      if (mode === "free") {
        angle = (angle + (dt / PERIOD) * 360) % 360;
      } else if (mode === "snap") {
        snapT += dt;
        const t = Math.min(snapT / SNAP, 1);
        angle = from + (to - from) * easeOut(t);
        if (t >= 1) {
          angle = ((to % 360) + 360) % 360;
          mode = "hold";
        }
      }
      place();
      // hold 时不必再排帧
      raf = mode === "hold" ? 0 : requestAnimationFrame(frame);
    };

    const kick = () => {
      if (raf || narrow.matches) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const aim = (el, i) => {
      if (narrow.matches) return;
      measure();
      if (!r) return;
      from = angle;
      to = shortest(angle, itemAngle(el, i));
      snapT = 0;
      mode = "snap";
      kick();
    };

    const release = () => {
      if (narrow.matches) return;
      // reduced-motion 下不恢复常驻公转，星球留在最后指向的位置
      if (prefersReducedMotion) {
        mode = "hold";
        return;
      }
      mode = "free";
      kick();
    };

    // 供退场逻辑调用：点击某项时星球先吸附到该方向，再随退场淡出。
    // 挂在 window 上而不是重构成模块，是为了不动现有闭包结构。
    window.__cesAimPlanet = (i) => {
      const el = items[i];
      if (el) aim(el, i);
    };

    // 供「从子页面返回」调用：星球先出现在该项角度，再解锁继续公转，
    // 读成「它一直停在你刚去过的那一站，现在重新启动」。
    window.__cesReleasePlanet = (i) => {
      const el = items[i];
      if (!el || narrow.matches) return;
      measure();
      if (r) {
        angle = ((itemAngle(el, i) % 360) + 360) % 360;
        place();
      }
      release();
    };

    items.forEach((el, i) => {
      el.addEventListener("mouseenter", () => aim(el, i));
      el.addEventListener("mouseleave", release);
      // 六项是 <a>，键盘用户也要拿到这个反馈
      el.addEventListener("focus", () => aim(el, i));
      el.addEventListener("blur", release);
    });

    window.addEventListener("resize", () => {
      measure();
      place();
    });

    measure();
    place();
    // reduced-motion 下不起常驻循环，只在 snap 时按需跑
    if (!prefersReducedMotion) kick();
  };

  initPlanet();

  // 子页面：入场放行 + 横条星球标记 + 当前项下划线 + 横条随滚动隐去
  //         + 回首页的退场 + 子页之间的退场。
  // 各函数内部自行判断 data-page，首页调用它们是空操作。
  initPageEnter();
  // initBarPlanet 必须在 initBarMarker 之前：星球插进当前项会让它变宽 16px，
  // 先量下划线宽度就会短一截。
  initBarPlanet();
  initBarMarker();
  initBarScroll();
  initLeaveBack();
  initLeaveSub();

  // 首页：轨道项的退场旅行 + 从子页面返回时的到达编排。
  // 两者都依赖 initPlanet 已挂好的 __cesAimPlanet / __cesReleasePlanet。
  initLeave();
  initBackArrive();

  // 子页面没有开屏，滚动揭示由这里起（首页是在 finishSplash 里起的）
  if (!hasSplash) initReveal();
})();
