(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.__cesInitEcosystemRoom = (content) => {
    const scene = content.querySelector("[data-eco-scene]");
    if (!scene) return null;
    const tablist = scene.querySelector('.eco-tabs');
    const compact = window.matchMedia('(max-width: 900px)');
    const syncOrientation = () => tablist?.setAttribute('aria-orientation', compact.matches ? 'horizontal' : 'vertical');
    syncOrientation();
    compact.addEventListener('change', syncOrientation);
    let currentPanel;
    const animations = [];
    const easing = "cubic-bezier(.22,1,.36,1)";
    const clear = () => animations.splice(0).forEach((animation) => animation.cancel());
    const add = (element, frames, options) => {
      if (!element?.animate || reduced.matches) return;
      const animation = element.animate(frames, options);
      animations.push(animation);
    };
    const visibility = () => animations.forEach((animation) => {
      if (document.hidden) animation.pause();
      else if (animation.playState === "paused") animation.play();
    });
    const activate = (panel) => {
      if (!scene.contains(panel)) return;
      clear();
      currentPanel = panel;
      const index = [...scene.querySelectorAll(".eco-panel")].indexOf(panel);
      scene.dataset.active = String(index);
      if (reduced.matches) return;
      panel.querySelectorAll("[data-eco-line]").forEach((line, i) => {
        add(line, [
          { clipPath: "inset(0 100% 0 0)", transform: "translateX(-8px)" },
          { clipPath: "inset(0 0% 0 0)", transform: "translateX(0)" }
        ], { duration: 1000, delay: 100 + i * 130, easing, fill: "backwards" });
      });
      panel.querySelectorAll("[data-eco-reveal]").forEach((element, i) => {
        add(element, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 760, delay: 60 + i * 75, easing, fill: "backwards" });
      });
      add(panel.querySelector(".eco-brand img"), [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }],
        { duration: 1050, delay: 60, easing, fill: "backwards" });
      add(scene.querySelector(`[data-eco-route="${index}"] path`), [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }],
        { duration: 950, easing, fill: "backwards" });
      add(scene.querySelector(".eco-network-packet"), [
        { offsetDistance: "0%", opacity: 0 }, { offsetDistance: "8%", opacity: 1, offset: .1 },
        { offsetDistance: "92%", opacity: 1, offset: .85 }, { offsetDistance: "100%", opacity: 0 }
      ], { duration: 4200, delay: 650, iterations: Infinity, easing: "linear" });
      add(scene.querySelector(".eco-network-ring"), [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        { duration: 50000, iterations: Infinity, easing: "linear" });
      visibility();
    };
    const motionChange = () => currentPanel && activate(currentPanel);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", motionChange);
    return {
      activate,
      destroy() {
        clear();
        compact.removeEventListener('change', syncOrientation);
        document.removeEventListener("visibilitychange", visibility);
        reduced.removeEventListener("change", motionChange);
      }
    };
  };
})();
