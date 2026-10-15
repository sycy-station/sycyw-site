(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ease = "cubic-bezier(.22,1,.36,1)";

  window.__cesInitTeamRoom = (content) => {
    const scenes = [...content.querySelectorAll("[data-team-kind]")];
    if (!scenes.length) return null;
    const cleanup = [];
    const groups = new Map(scenes.map((scene) => [scene, {
      cells: [...scene.querySelectorAll("[data-team-cell]")],
      roster: scene.querySelector(".team-roster"), page: 0, size: 0, signature: ""
    }]));
    let activeScene = null;
    let animations = [];
    const listen = (element, event, handler) => {
      element.addEventListener(event, handler);
      cleanup.push(() => element.removeEventListener(event, handler));
    };
    const stop = () => { animations.forEach((animation) => animation.cancel()); animations = []; };
    const rosterSize = (roster) => `${roster.clientWidth}:${roster.clientHeight}`;
    const loadPortraits = (container) => {
      container.querySelectorAll('img[data-src], img[srcset]').forEach((image) => {
        image.sizes = `${Math.ceil(image.parentElement.getBoundingClientRect().width)}px`;
        if (!image.dataset.src) return;
        // Set candidates before src so the browser downloads only the chosen density.
        image.srcset = image.dataset.srcset;
        image.src = image.dataset.src;
        delete image.dataset.src;
        delete image.dataset.srcset;
      });
    };

    const dimensions = (scene) => {
      const { roster } = groups.get(scene);
      const width = roster.clientWidth;
      const height = roster.clientHeight;
      if (scene.dataset.teamKind === "leaders") {
        if (width >= 980 && height >= 280) return { columns: 4, rows: 1, layout: "portrait" };
        if (width >= 620) return { columns: 2, rows: height >= 350 ? 2 : 1, layout: "inline" };
        return { columns: 1, rows: 1, layout: height >= 335 ? "portrait" : "inline" };
      }
      if (scene.dataset.teamKind === "core") {
        // Use CSS viewport pixels: monitor inches cannot be measured reliably.
        if (window.innerWidth >= 2200) {
          return { columns: 4, rows: height >= 600 ? 2 : 1, layout: "portrait", variant: "large" };
        }
        if (window.innerWidth >= 1280) {
          return { columns: 4, rows: height >= 275 ? 2 : 1, layout: "inline", variant: "medium" };
        }
        const columns = width >= 620 ? 2 : 1;
        const rows = Math.max(1, Math.min(4, Math.floor((height - 32) / 76)));
        return { columns, rows, layout: "inline", variant: "small" };
      }
      return { columns: width >= 650 ? 3 : 1, rows: 1, layout: "portrait" };
    };
    const render = (scene, nextPage) => {
      const group = groups.get(scene);
      const { columns, rows, layout, variant } = dimensions(scene);
      const size = columns * rows;
      const pages = Math.ceil(group.cells.length / size);
      const first = group.page * (group.size || size);
      group.page = nextPage === undefined ? Math.min(pages - 1, Math.floor(first / size)) : (nextPage + pages) % pages;
      group.size = size;
      scene.style.setProperty("--team-columns", String(columns));
      scene.style.setProperty("--team-rows", String(rows));
      scene.dataset.layout = layout;
      scene.dataset.columns = String(columns);
      scene.dataset.rows = String(rows);
      scene.dataset.density = group.roster.clientHeight < 400 ? "compact" : "normal";
      if (variant) {
        scene.dataset.variant = variant;
        // Each row includes equal frame clearance, the portrait's outer rings and its caption.
        const portraitSize = Math.max(84, Math.min(280, group.roster.clientHeight / rows - 204));
        scene.style.setProperty("--team-core-portrait", `${Math.round(portraitSize)}px`);
      }
      const start = group.page * size;
      group.cells.forEach((cell, index) => {
        cell.hidden = index < start || index >= start + size;
        if (!cell.hidden) loadPortraits(cell.querySelector('.team-profile'));
      });
      const pager = scene.querySelector("[data-team-pager]");
      pager.dataset.pages = String(pages);
      pager.inert = pages === 1;
      pager.setAttribute("aria-hidden", String(pages === 1));
      scene.querySelector("[data-team-range]").textContent = `${start + 1}—${Math.min(group.cells.length, start + size)} / ${group.cells.length}`;
      scene.querySelector("[data-team-page]").textContent = `${String(group.page + 1).padStart(2, "0")} / ${String(pages).padStart(2, "0")}`;
      scene.querySelectorAll("[data-team-prev], [data-team-next]").forEach((button) => { button.disabled = pages === 1; });
      group.signature = `${rosterSize(group.roster)}:${size}:${layout}`;
    };
    const reveal = (scene) => {
      stop();
      if (reduced.matches || !Element.prototype.animate) return;
      const cells = groups.get(scene).cells.filter((cell) => !cell.hidden);
      cells.forEach((cell, i) => {
        const profile = cell.querySelector(".team-profile");
        animations.push(profile.animate([
          { opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }
        ], { duration: 650, delay: i * 65, easing: ease, fill: "backwards" }));
        const image = cell.querySelector(".team-portrait-image");
        if (image) animations.push(image.animate([
          { clipPath: "inset(0 100% 0 0)", opacity: .4 }, { clipPath: "inset(0)", opacity: 1 }
        ], { duration: 800, delay: 90 + i * 65, easing: ease, fill: "backwards" }));
      });
      const network = scene.querySelector(".team-network");
      if (network) animations.push(network.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1100, easing: ease }));
    };
    scenes.forEach((scene) => {
      ["prev", "next"].forEach((direction) => listen(scene.querySelector(`[data-team-${direction}]`), "click", () => {
        const group = groups.get(scene);
        render(scene, group.page + (direction === "prev" ? -1 : 1));
        reveal(scene);
      }));
      scene.querySelectorAll("[data-team-details]").forEach((button) => listen(button, "click", () => {
        const dialog = content.querySelector(`#${button.dataset.teamDetails}`);
        if (!dialog || dialog.open) return;
        dialog.showModal();
        loadPortraits(dialog);
        if (!reduced.matches) dialog.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 300, easing: ease });
      }));
      scene.querySelectorAll("[data-team-close]").forEach((button) => listen(button, "click", () => button.closest("dialog").close()));
      scene.querySelectorAll("dialog").forEach((dialog) => {
        // The room shell also uses Escape to return home. A detail panel closes first.
        listen(dialog, "keydown", (event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          dialog.close();
        });
        listen(dialog, "click", (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
        });
      });
    });
    const observer = new ResizeObserver(() => {
      if (!activeScene) return;
      const group = groups.get(activeScene);
      if (group.signature.startsWith(`${rosterSize(group.roster)}:`)) return;
      render(activeScene);
    });
    scenes.forEach((scene) => observer.observe(groups.get(scene).roster));
    cleanup.push(() => observer.disconnect());
    listen(reduced, "change", () => { if (reduced.matches) stop(); });
    return {
      activate(panel) {
        const scene = panel?.querySelector("[data-team-kind]");
        if (!scene) return;
        activeScene = scene;
        render(scene);
        reveal(scene);
      },
      destroy() {
        stop(); cleanup.forEach((remove) => remove());
        groups.forEach((_, scene) => scene.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close()));
      }
    };
  };
})();
