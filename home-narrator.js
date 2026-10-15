(() => {
  "use strict";
  const root = document.documentElement;
  const host = document.getElementById("stageAbout");
  const button = host?.querySelector("[data-narrator-trigger]");
  const dialogue = button?.querySelector("[data-narrator-dialogue]");
  if (root.dataset.experience !== "orbit" || !dialogue) return;

  const lines = [
    "干嘛？点错了吗？",
    "不是，你点我也没用啊 我又不是什么游戏旁白",
    ".........你这是干嘛，玩彩蛋玩疯了啊",
    "啧，我说过了 我！不！是！游！戏！旁！白！",
    "你进入这个页面的目的是啥啊，为了点我？",
    "最后一次警告 你再点后面会有很不好的消息发生",
    "行 这是你自找的"
  ];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  const idleDelay = 3000;
  const farewell = "哦 看来是点错了，那我大人不计小人过";
  let hits = 0;
  let played = 0;
  let generation = 0;
  let running = false;
  let sealed = false;
  let falling = [];
  let idleTimer = null;
  let restoreTimer = null;

  const clearTimers = () => {
    clearTimeout(idleTimer);
    clearTimeout(restoreTimer);
    idleTimer = restoreTimer = null;
  };

  const play = async (element, frames, timing, id) => {
    if (!element.animate) return;
    const animation = element.animate(frames, { fill: "both", ...timing });
    animation.id = id;
    animations.add(animation);
    if (document.hidden) animation.pause();
    try { await animation.finished; }
    catch (_) { /* Navigation and preference changes can interrupt a shake. */ }
    finally {
      if (id.startsWith("narrator-fall-")) {
        element.classList.add("is-home-fallen");
        element.classList.remove("is-home-falling");
      }
      animation.cancel();
      animations.delete(animation);
    }
  };

  const shake = (level) => {
    const strong = level >= 6;
    if (reduced.matches) return play(button, [
      { opacity: 1 }, { opacity: strong ? .65 : .85 }, { opacity: 1 }
    ], { duration: strong ? 180 : 120 }, `narrator-reply-${level}`);
    const amplitude = strong ? 11 : 2.5;
    const angle = strong ? .8 : .12;
    const steps = [0, 1, -.9, .8, -.7, .55, -.4, .23, -.1, 0];
    return play(button, steps.map((strength, index) => ({
      offset: index / (steps.length - 1),
      transform: `translate(${strength * amplitude}px, ${Math.abs(strength) * amplitude * .12}px) rotate(${strength * angle}deg)`,
      easing: "ease-in-out"
    })), { duration: strong ? 640 : 320 }, `narrator-reply-${level}`);
  };

  const settle = () => {
    falling.forEach(element => {
      element.classList.add("is-home-fallen");
      element.classList.remove("is-home-falling");
    });
    animations.forEach(animation => animation.cancel());
    root.classList.add("home-collapse-settled");
    button.dataset.narratorPhase = "fallen";
  };

  const seal = () => {
    sealed = true;
    clearTimers();
    // Block interaction immediately, even while rapid taps finish their queued replies.
    button.setAttribute("aria-disabled", "true");
    root.setAttribute("data-home-locked", "");
    window.dispatchEvent(new Event("ces:home-collapse"));
    document.querySelectorAll(".site-header, .section-nav, .overlay-nav, .stage-orbit, #stageAbout, .room-content")
      .forEach(element => { element.inert = true; });
    document.activeElement?.blur?.();
  };

  const collapse = async () => {
    root.setAttribute("data-home-collapsed", "");
    button.dataset.narratorPhase = "collapsing";
    const selectors = [
      ".stage .orbit-item", ".stage .stage-logo-wrap", ".site-header button", ".site-header .mark",
      ".stage .orbit-ring", ".stage .orbit-ticks", ".stage .orbit-planet-ring", ".stage .orbit-planet",
      ".stage .wide-edge", ".stage .wide-scale", ".stage .splash-frame", ".stage .stage-foot", "#stageAbout"
    ];
    // Snapshot every transform before animating, preserving the existing orbit layout.
    const pieces = [...document.querySelectorAll(selectors.join(","))].map(element => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { element, box, base: style.transform === "none" ? "" : style.transform,
        opacity: Number(style.opacity), visible: style.display !== "none" && style.visibility !== "hidden" };
    }).filter(({ box, opacity, visible }) => visible && opacity > .01 && box.width && box.height);
    falling = pieces.map(({ element }) => element);
    if (reduced.matches || !Element.prototype.animate) { settle(); return; }

    await Promise.all([shake(7), ...pieces.map(({ element, box, base, opacity }, index) => {
      element.classList.add("is-home-falling");
      const side = box.left + box.width / 2 < innerWidth / 2 ? -1 : 1;
      const drift = side * Math.min(100, innerWidth * .065) * (.5 + (index % 4) * .14);
      const angle = side * (12 + (index % 5) * 8);
      const distance = Math.max(innerHeight + box.height, innerHeight - box.top + box.height + 120);
      // Individual transforms also work on mobile orbit links whose layout sets transform:none!important.
      const pose = (x, y, rotation) => base
        ? { transform: `translate3d(${x}px, ${y}px, 0) ${base} rotate(${rotation}deg)` }
        : { translate: `${x}px ${y}px`, rotate: `${rotation}deg` };
      const delay = element === host ? 1050 : element.matches(".stage-logo-wrap") ? 420 : 100 + (index % 7) * 85;
      return play(element, [
        { offset: 0, ...pose(0, 0, 0), opacity, easing: "ease-out" },
        { offset: .12, ...pose(-drift * .08, -7, -angle * .12), opacity, easing: "cubic-bezier(.55,0,.88,.45)" },
        { offset: .8, ...pose(drift * .68, distance * .6, angle * .7), opacity, easing: "ease-in" },
        { offset: 1, ...pose(drift, distance, angle), opacity: 0 }
      ], { duration: element === host ? 900 : 1250 + (index % 4) * 110, delay }, `narrator-fall-${index}`);
    })]);
    settle();
  };

  const run = async () => {
    const token = generation;
    running = true;
    while (played < hits && token === generation) {
      const level = ++played;
      dialogue.textContent = lines[level - 1];
      button.classList.add("is-narrating");
      button.classList.toggle("is-warning", level >= 6);
      button.dataset.narratorPhase = `reply-${level}`;
      if (level === 7) await collapse();
      else await shake(level);
    }
    if (token !== generation) return;
    running = false;
    if (!sealed) button.dataset.narratorPhase = "idle";
  };

  const reset = () => {
    if (sealed) return;
    clearTimers();
    ++generation;
    animations.forEach(animation => animation.cancel());
    hits = played = 0;
    running = false;
    dialogue.textContent = "";
    button.classList.remove("is-narrating", "is-warning");
    button.removeAttribute("aria-disabled");
    button.dataset.narratorHits = "0";
    button.dataset.narratorPhase = "idle";
  };

  const forgive = () => {
    if (sealed || !hits) return;
    reset();
    dialogue.textContent = farewell;
    button.classList.add("is-narrating");
    button.dataset.narratorPhase = "forgiving";
    if (!reduced.matches) void play(dialogue, [{ opacity: 0 }, { opacity: 1 }],
      { duration: 180, easing: "ease-out" }, "narrator-forgive");
    restoreTimer = setTimeout(() => {
      reset();
      if (!reduced.matches) void play(button, [{ opacity: 0 }, { opacity: 1 }],
        { duration: 320, easing: "ease-out" }, "narrator-restore");
    }, 2400);
  };

  button.addEventListener("click", () => {
    if (sealed || root.dataset.page !== "stage" || document.body.classList.contains("loading")) return;
    // A tap during the farewell or original-text fade starts a fresh conversation.
    if (!hits) reset();
    clearTimers();
    button.dataset.narratorHits = String(++hits);
    if (hits === lines.length) seal();
    else idleTimer = setTimeout(forgive, idleDelay);
    if (!running) void run();
  });

  // Inert covers pointer and keyboard use; this also stops delegated or synthetic clicks.
  document.addEventListener("click", event => {
    if (!sealed) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  document.addEventListener("keydown", event => {
    if (!sealed || !["Enter", " ", "Escape", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  new MutationObserver(() => {
    if (root.dataset.page !== "stage") reset();
  }).observe(root, { attributes: true, attributeFilter: ["data-page"] });
  document.addEventListener("visibilitychange", () => {
    animations.forEach(animation => document.hidden ? animation.pause() : animation.play());
  });
  window.addEventListener("resize", () => { if (sealed && falling.length) settle(); });
  window.addEventListener("pagehide", () => {
    if (sealed) animations.forEach(animation => animation.pause());
    else reset();
  });
  window.addEventListener("pageshow", () => {
    if (sealed) animations.forEach(animation => animation.play());
  });
  reduced.addEventListener("change", () => {
    if (sealed && falling.length) settle();
    else animations.forEach(animation => animation.cancel());
  });
  reset();
})();
