(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.__cesInitContactRoom = (content) => {
    const scene = content.querySelector("[data-contact-scene]");
    if (!scene) return null;
    const art = scene.querySelector(".contact-art");
    let copyTimer;
    const animations = [];
    const add = (element, frames, options) => {
      if (!element || !element.animate || reduced.matches) return;
      const animation = element.animate(frames, options);
      animations.push(animation);
      return animation;
    };
    const easing = "cubic-bezier(.22,1,.36,1)";
    const reveal = () => {
      animations.splice(0).forEach((animation) => animation.cancel());
      if (reduced.matches) return;
      scene.querySelectorAll("[data-contact-line]").forEach((line, index) => {
        add(line, [
          { clipPath: "inset(0 100% 0 0)", transform: "translateX(-10px)" },
          { clipPath: "inset(0 0% 0 0)", transform: "translateX(0)" }
        ], { duration: 1050, delay: 150 + index * 140, easing, fill: "backwards" });
      });
      scene.querySelectorAll("[data-contact-reveal]").forEach((element, index) => {
        add(element, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 720, delay: 120 + index * 55, easing, fill: "backwards" });
      });
      add(scene.querySelector(".contact-art"), [{ opacity: 0 }, { opacity: 1 }], { duration: 1100, delay: 250, fill: "backwards" });
      add(scene.querySelector(".contact-art-draw"), [{ strokeDasharray: "1", strokeDashoffset: "1" }, { strokeDasharray: "1", strokeDashoffset: "0" }],
        { duration: 1600, delay: 400, easing, fill: "backwards" });
      add(scene.querySelector(".contact-art-packet"), [{ offsetDistance: "0%", opacity: 0 }, { offsetDistance: "8%", opacity: 1, offset: .12 }, { offsetDistance: "92%", opacity: 1, offset: .88 }, { offsetDistance: "100%", opacity: 0 }],
        { duration: 5200, delay: 1700, iterations: Infinity, easing: "linear" });
      scene.querySelectorAll(".contact-art-satellite circle").forEach((circle, index) => {
        circle.style.transformBox = "fill-box";
        circle.style.transformOrigin = "center";
        add(circle, [{ transform: "scale(.75)", opacity: .2 }, { transform: "scale(1.35)", opacity: .65 }, { transform: "scale(.75)", opacity: .2 }],
          { duration: 3600, delay: index * 1800, iterations: Infinity, easing: "ease-in-out" });
      });
      visibility();
    };
    const visibility = () => animations.forEach((animation) => {
      if (document.hidden) animation.pause(); else if (animation.playState === "paused") animation.play();
    });
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", reveal);
    reveal();
    return {
      showCopySuccess() {
        if (!art) return;
        clearTimeout(copyTimer);
        art.setAttribute("data-copy-success", "");
        copyTimer = setTimeout(() => art.removeAttribute("data-copy-success"), 3000);
      },
      destroy() {
        clearTimeout(copyTimer);
        art?.removeAttribute("data-copy-success");
        animations.forEach((animation) => animation.cancel());
        document.removeEventListener("visibilitychange", visibility);
        reduced.removeEventListener("change", reveal);
      }
    };
  };
})();
