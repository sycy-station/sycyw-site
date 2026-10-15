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
    const mobilePreview = matchMedia("(max-width: 760px), (max-width: 1000px) and (max-height: 600px) and (pointer: coarse)");
    const imageArea = dialog.querySelector(".product-preview-image");
    const events = new AbortController();
    const animations = [];
    let previewAnimation;
    let previewIndex = 0;
    let opener;
    let scale = 1, panX = 0, panY = 0, baseWidth = 0, baseHeight = 0;
    let gesture, lastTap = 0;
    const pointers = new Map();
    let preloadTimer;
    const prepareImage = (panel) => {
      const source = panel?.querySelector(".product-image-button img");
      if (!source || navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || "")) return;
      const preload = new Image();
      preload.decoding = "async";
      preload.src = source.currentSrc || source.src;
    };
    ["pointerover", "focusin"].forEach(type => scene.addEventListener(type, event => {
      const tab = event.target.closest("[data-room-tab]");
      if (tab) prepareImage(panels[tabs.indexOf(tab)]);
    }, { signal: events.signal }));
    const paintZoom = () => {
      if (!mobilePreview.matches || !dialog.open) return;
      const maxX = Math.max(0, (baseWidth * scale - imageArea.clientWidth) / 2);
      const maxY = Math.max(0, (baseHeight * scale - imageArea.clientHeight) / 2);
      panX = Math.max(-maxX, Math.min(maxX, panX));
      panY = Math.max(-maxY, Math.min(maxY, panY));
      image.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
      dialog.querySelector("[data-product-zoom-reset]").textContent = `${Math.round(scale * 100)}%`;
      dialog.querySelector("[data-product-zoom-out]").disabled = scale <= 1;
      dialog.querySelector("[data-product-zoom-in]").disabled = scale >= 4;
    };
    const resetZoom = () => {
      scale = 1; panX = 0; panY = 0; pointers.clear(); gesture = null; lastTap = 0;
      ["width", "height", "transform"].forEach((property) => image.style.removeProperty(property));
      if (!mobilePreview.matches || !dialog.open) return;
      const ratio = (image.naturalWidth || image.width) / (image.naturalHeight || image.height);
      baseWidth = Math.min(imageArea.clientWidth, imageArea.clientHeight * ratio);
      baseHeight = baseWidth / ratio;
      image.style.width = `${baseWidth}px`; image.style.height = `${baseHeight}px`;
      paintZoom();
    };
    const setZoom = (value) => {
      if (!mobilePreview.matches) return;
      scale = Math.max(1, Math.min(4, value));
      paintZoom();
    };
    const beginGesture = () => {
      const points = [...pointers.values()];
      if (!points.length) { gesture = null; return; }
      const a = points[0], b = points[1] || a;
      gesture = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2,
        distance: points.length > 1 ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
        scale, panX, panY, moved: false };
    };
    imageArea.addEventListener("pointerdown", (event) => {
      if (!mobilePreview.matches || (event.pointerType === "mouse" && event.button !== 0)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      imageArea.setPointerCapture(event.pointerId); beginGesture();
    }, { signal: events.signal });
    imageArea.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId) || !gesture) return;
      event.preventDefault();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const points = [...pointers.values()], a = points[0], b = points[1] || a;
      const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      if (Math.hypot(x - gesture.x, y - gesture.y) > 6 || points.length > 1) gesture.moved = true;
      if (points.length > 1 && gesture.distance > 0) {
        scale = Math.max(1, Math.min(4, gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance));
        const rect = imageArea.getBoundingClientRect(), cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        panX = x - cx - (gesture.x - cx - gesture.panX) * scale / gesture.scale;
        panY = y - cy - (gesture.y - cy - gesture.panY) * scale / gesture.scale;
      } else { panX = gesture.panX + x - gesture.x; panY = gesture.panY + y - gesture.y; }
      paintZoom();
    }, { signal: events.signal });
    const endGesture = (event) => {
      if (!pointers.has(event.pointerId)) return;
      const tap = event.type === "pointerup" && pointers.size === 1 && !gesture?.moved;
      pointers.delete(event.pointerId);
      if (tap) {
        const now = performance.now();
        if (lastTap && now - lastTap < 300) { setZoom(scale > 1 ? 1 : 2.5); lastTap = 0; }
        else lastTap = now;
      } else lastTap = 0;
      beginGesture();
    };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => imageArea.addEventListener(type, endGesture, { signal: events.signal }));
    image.addEventListener("load", resetZoom, { signal: events.signal });
    const previewResize = new ResizeObserver(() => { if (dialog.open) resetZoom(); });
    previewResize.observe(imageArea);
    mobilePreview.addEventListener("change", resetZoom, { signal: events.signal });
    const clear = () => animations.splice(0).forEach((animation) => animation.cancel());
    const activate = (panel) => {
      if (!panels.includes(panel)) return;
      panel.querySelector(".product-image-button img").loading = "eager";
      clearTimeout(preloadTimer);
      preloadTimer = setTimeout(() => prepareImage(panels[(panels.indexOf(panel) + 1) % panels.length]), 1800);
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
      resetZoom();
      if (!reduced.matches) previewAnimation = image.animate([{opacity: .25}, {opacity: 1}], {duration: 380, easing: "ease-out"});
    };
    scene.addEventListener("click", (event) => {
      const button = event.target.closest("[data-product-open]");
      if (!button) return;
      opener = button;
      updatePreview(Number(button.dataset.productOpen));
      dialog.showModal();
      resetZoom();
    }, { signal: events.signal });
    dialog.addEventListener("click", (event) => {
      if (event.target.closest("[data-product-close]")) dialog.close();
      else if (event.target.closest("[data-product-previous]")) updatePreview(previewIndex - 1);
      else if (event.target.closest("[data-product-next]")) updatePreview(previewIndex + 1);
      else if (event.target.closest("[data-product-zoom-in]")) setZoom(scale + .5);
      else if (event.target.closest("[data-product-zoom-out]")) setZoom(scale - .5);
      else if (event.target.closest("[data-product-zoom-reset]")) { scale = 1; panX = 0; panY = 0; paintZoom(); }
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
    dialog.addEventListener("close", () => { previewAnimation?.cancel(); resetZoom(); if (opener?.isConnected) opener.focus({preventScroll: true}); }, { signal: events.signal });
    reduced.addEventListener("change", () => { if (reduced.matches) { clear(); previewAnimation?.cancel(); } }, { signal: events.signal });
    return {
      activate,
      destroy() { clearTimeout(preloadTimer); events.abort(); previewResize.disconnect(); clear(); previewAnimation?.cancel(); if (dialog.open) dialog.close(); }
    };
  };
})();
