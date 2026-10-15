(() => {
  "use strict";
  const root = document.documentElement;
  const button = document.querySelector("[data-logo-trigger]");
  const logo = button?.querySelector("[data-logo-motion]");
  if (root.dataset.experience !== "orbit" || !logo) return;

  const name = button.querySelector(".stage-logo-name");
  const shadow = button.querySelector(".stage-logo-shadow");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  const rest = "perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1, 1)";
  let hits = 0;
  let played = 0;
  let running = false;
  let generation = 0;
  let idleTimer = null;

  const reset = () => {
    clearTimeout(idleTimer);
    idleTimer = null;
    ++generation;
    animations.forEach(animation => animation.cancel());
    animations.clear();
    [logo, name, shadow].filter(Boolean).forEach(element => {
      element.style.removeProperty("transform");
      element.style.removeProperty("opacity");
    });
    hits = played = 0;
    running = false;
    button.dataset.logoHits = "0";
    button.dataset.logoPhase = "idle";
    button.classList.remove("is-logo-moving", "is-logo-flipping");
    button.removeAttribute("aria-disabled");
  };

  const animate = async (element, frames, duration) => {
    if (!element) return;
    const animation = element.animate(frames, { duration, fill: "both", easing: "linear" });
    animations.add(animation);
    if (document.hidden) animation.pause();
    try {
      await animation.finished;
      animation.commitStyles();
    } finally {
      animation.cancel();
      animations.delete(animation);
    }
  };

  const shake = (level) => {
    const amplitude = [0, 3, 8, 18][level];
    const angle = [0, 0.8, 2.1, 4.8][level];
    const steps = [0, 1, -0.9, 0.77, -0.62, 0.46, -0.3, 0.16, 0];
    return animate(logo, steps.map((strength, index) => ({
      offset: index / (steps.length - 1),
      transform: `perspective(1000px) translate3d(${strength * amplitude}px, ${-Math.abs(strength) * amplitude * 0.2}px, 0) rotateX(0deg) rotateY(${strength * angle * 0.65}deg) rotateZ(${strength * angle}deg) scale(1, 1)`,
      easing: "ease-in-out"
    })), [0, 300, 440, 620][level]);
  };

  const flipAndDrop = async () => {
    const box = logo.getBoundingClientRect();
    const stage = button.closest(".stage").getBoundingClientRect();
    const foot = document.querySelector(".stage-foot")?.getBoundingClientRect();
    // Keep the landing inside the visible stage, above the bottom status line.
    const floor = Math.min(stage.bottom - 24, window.innerHeight - 24,
      foot && foot.top > box.bottom ? foot.top - 20 : Infinity);
    const distance = Math.max(24, Math.min(box.height * 0.8, floor - box.bottom));
    const lift = Math.min(78, box.height * 0.2, Math.max(12, box.top - 84));
    const bounce = Math.min(42, distance * 0.24);
    const pose = (y, xRotation = 0, yRotation = 360, zRotation = 0, sx = 1, sy = sx) =>
      `perspective(1000px) translate3d(0, ${y}px, 0) rotateX(${xRotation}deg) rotateY(${yRotation}deg) rotateZ(${zRotation}deg) scale(${sx}, ${sy})`;
    const landing = pose(distance);
    const duration = 2100;
    button.classList.add("is-logo-flipping");
    await Promise.all([
      animate(logo, [
        { offset: 0, transform: rest, easing: "ease-in" },
        { offset: 0.09, transform: pose(9, -14, -18, -3, 0.96), easing: "cubic-bezier(.18,.8,.28,1)" },
        { offset: 0.24, transform: pose(-lift * 0.7, 18, 104, -7, 1.025), easing: "ease-out" },
        { offset: 0.38, transform: pose(-lift, 38, 236, -9), easing: "ease-in" },
        { offset: 0.50, transform: pose(-lift * 0.5, 24, 338, 4), easing: "ease-in" },
        { offset: 0.57, transform: pose(0, 10, 360, 6), easing: "cubic-bezier(.55,0,.9,.55)" },
        { offset: 0.76, transform: pose(distance, 12, 375, -7, 1.04, 0.94), easing: "cubic-bezier(.15,.7,.3,1)" },
        { offset: 0.84, transform: pose(distance - bounce, 5, 355, 3), easing: "ease-in" },
        { offset: 0.90, transform: pose(distance, 0, 360, -1.5, 1.015, 0.985), easing: "ease-out" },
        { offset: 0.95, transform: pose(distance - bounce * 0.13, 0, 360, 0.6), easing: "ease-in" },
        { offset: 1, transform: landing }
      ], duration),
      animate(name, [
        { offset: 0, opacity: 1 }, { offset: 0.25, opacity: 0.18 }, { offset: 1, opacity: 0.18 }
      ], duration),
      animate(shadow, [
        { offset: 0, opacity: 0, transform: `translateY(${distance}px) scaleX(.45)` },
        { offset: 0.57, opacity: 0.025, transform: `translateY(${distance}px) scaleX(.5)` },
        { offset: 0.76, opacity: 0.17, transform: `translateY(${distance}px) scaleX(1.15)` },
        { offset: 0.84, opacity: 0.07, transform: `translateY(${distance}px) scaleX(.8)` },
        { offset: 0.90, opacity: 0.14, transform: `translateY(${distance}px) scaleX(1)` },
        { offset: 1, opacity: 0.12, transform: `translateY(${distance}px) scaleX(1)` }
      ], duration)
    ]);
  };

  const returnAfterIdle = async () => {
    if (!hits || root.hasAttribute("data-home-locked")) return;
    const needsReturn = played === 4;
    // Recover from the current pose, including a flip still playing after rapid taps.
    const pose = getComputedStyle(logo);
    const current = { transform: pose.transform, opacity: pose.opacity };
    const nameOpacity = name ? getComputedStyle(name).opacity : "1";
    const shadowOpacity = shadow ? getComputedStyle(shadow).opacity : "0";
    reset();
    if (reduced.matches || !needsReturn) return;
    const token = generation;
    button.dataset.logoPhase = "returning";
    button.classList.add("is-logo-moving");
    try {
      await Promise.all([
        animate(logo, [
          { offset: 0, ...current },
          { offset: 0.28, transform: current.transform, opacity: 0, easing: "step-end" },
          { offset: 0.29, transform: rest, opacity: 0 },
          { offset: 0.42, transform: `${rest} scale(.96)`, opacity: 0, easing: "cubic-bezier(.22,1,.36,1)" },
          { offset: 1, transform: rest, opacity: 1 }
        ], 560),
        animate(name, [{ opacity: nameOpacity }, { opacity: 1, easing: "ease-out" }], 560),
        animate(shadow, [{ opacity: shadowOpacity }, { opacity: 0 }], 180)
      ]);
    } catch (_) { /* A new tap, navigation or the page collapse cancels recovery. */ }
    finally { if (token === generation) reset(); }
  };

  const run = async () => {
    const token = generation;
    running = true;
    button.classList.add("is-logo-moving");
    try {
      // Queue rapid taps so all three increasing shakes remain visible before the flip.
      while (played < hits && token === generation) {
        const level = ++played;
        button.dataset.logoPhase = level === 4 ? "flipping" : `shake-${level}`;
        if (reduced.matches) {
          await animate(logo, [{ opacity: 1 }, { opacity: level === 4 ? 0.45 : 1 - level * 0.12 }, { opacity: 1 }], level === 4 ? 240 : 120);
        } else if (level < 4) {
          await shake(level);
        } else {
          await flipAndDrop();
        }
      }
      if (token !== generation) return;
      running = false;
      button.dataset.logoPhase = played === 4 ? "landed" : "idle";
      if (played < 4) {
        button.classList.remove("is-logo-moving");
      }
    } catch (_) {
      if (token === generation) reset();
    }
  };

  button.addEventListener("click", () => {
    if (root.hasAttribute("data-home-locked") || root.dataset.page !== "stage" || document.body.classList.contains("loading")) return;
    if (typeof logo.animate !== "function") return;
    if (button.dataset.logoPhase === "returning") reset();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { void returnAfterIdle(); }, 3000);
    if (hits >= 4) return;
    button.dataset.logoHits = String(++hits);
    if (hits === 4) button.setAttribute("aria-disabled", "true");
    if (!running) void run();
  });

  new MutationObserver(() => {
    if (root.dataset.page !== "stage") reset();
  }).observe(root, { attributes: true, attributeFilter: ["data-page"] });
  document.addEventListener("visibilitychange", () => {
    animations.forEach(animation => document.hidden ? animation.pause() : animation.play());
  });
  window.addEventListener("resize", () => { if (hits || animations.size) reset(); });
  window.addEventListener("pagehide", reset);
  window.addEventListener("ces:home-collapse", reset);
  reduced.addEventListener("change", reset);
  reset();
})();
