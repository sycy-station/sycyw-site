(() => {
  "use strict";
  window.__cesInitProductsRoom = (content) => {
    const scene = content.querySelector("[data-product-scene]");
    if (!scene) return null;
    const panels = [...scene.querySelectorAll("[data-product-view]")];
    const tabs = [...scene.querySelectorAll("[data-room-tab]")];
    const dialog = content.querySelector(".product-preview");
    const image = dialog.querySelector("[data-product-preview-image]");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const events = new AbortController();
    const animations = [];
    let previewAnimation;
    let previewIndex = 0;
    let opener;
    const clear = () => animations.splice(0).forEach((animation) => animation.cancel());
    const activate = (panel) => {
      if (!panels.includes(panel)) return;
      clear();
      // Pause decorative movement in hidden chapters as well as off-page rooms.
      panels.forEach((item) => item.querySelectorAll(".product-wave i, .product-wave b, .product-orbit i").forEach((el) => {
        el.style.animationPlayState = item === panel ? "running" : "paused";
      }));
      if (reduced.matches) return;
      panel.querySelectorAll("[data-product-reveal]").forEach((el, i) => {
        animations.push(el.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], {
          duration: 680, delay: Math.min(i * 65, 260), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards"
        }));
      });
      animations.push(panel.querySelector("[data-product-image]").animate([
        // Clipping the button also clips the image's shadow until the animation ends.
        { opacity: 0, transform: "translateX(18px) scale(.98)" },
        { opacity: 1, transform: "none" }
      ], { duration: 880, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
    };
    const updatePreview = (index) => {
      previewIndex = (index + panels.length) % panels.length;
      const panel = panels[previewIndex];
      const source = panel.querySelector(".product-image-button img");
      image.src = source.getAttribute("src");
      image.alt = source.alt;
      image.width = source.width;
      image.height = source.height;
      dialog.querySelector("#productPreviewTitle").textContent = tabs[previewIndex].dataset.label;
      dialog.querySelector("[data-product-preview-caption]").textContent = panel.querySelector("figcaption > div").textContent;
      dialog.querySelector("[data-product-preview-count]").textContent = `${String(previewIndex + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
      previewAnimation?.cancel();
      if (!reduced.matches) previewAnimation = image.animate([{opacity: .25}, {opacity: 1}], {duration: 380, easing: "ease-out"});
    };
    scene.addEventListener("click", (event) => {
      const button = event.target.closest("[data-product-open]");
      if (!button) return;
      opener = button;
      updatePreview(Number(button.dataset.productOpen));
      dialog.showModal();
    }, { signal: events.signal });
    dialog.addEventListener("click", (event) => {
      if (event.target.closest("[data-product-close]")) dialog.close();
      else if (event.target.closest("[data-product-previous]")) updatePreview(previewIndex - 1);
      else if (event.target.closest("[data-product-next]")) updatePreview(previewIndex + 1);
      else if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      }
    }, { signal: events.signal });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      updatePreview(previewIndex + (event.key === "ArrowRight" ? 1 : -1));
    }, { signal: events.signal });
    dialog.addEventListener("close", () => { previewAnimation?.cancel(); if (opener?.isConnected) opener.focus({preventScroll: true}); }, { signal: events.signal });
    reduced.addEventListener("change", () => { if (reduced.matches) { clear(); previewAnimation?.cancel(); } }, { signal: events.signal });
    return {
      activate,
      destroy() { events.abort(); clear(); previewAnimation?.cancel(); if (dialog.open) dialog.close(); }
    };
  };
})();
