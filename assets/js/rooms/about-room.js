(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 760px), (max-height: 760px)");
  const large = window.matchMedia("(min-width: 1101px) and (min-height: 761px)");

  window.__cesInitAboutRoom = (content) => {
    if (!content.querySelector(".about-scene")) return null;
    let animations = [];
    let countFrame = 0;
    let orbitAnimation = null;
    const shutters = new Set();
    const yearReels = new Set();
    const cleanup = [];
    const groups = [];
    const historyScene = content.querySelector(".about-history");
    const historyLayout = historyScene?.querySelector(".about-history-layout");
    const historyRail = historyLayout?.querySelector(".about-history-rail");
    const fitHistory = () => {
      if (!historyRail || !large.matches || !historyScene.clientWidth || !historyScene.clientHeight) return;
      // Keep the reference artwork proportional and center it above a bottom-anchored rail.
      const available = getComputedStyle(historyScene);
      const height = parseFloat(available.height);
      const gap = parseFloat(available.rowGap);
      const frameSpace = height - historyRail.offsetHeight - gap;
      const scale = Math.min(parseFloat(available.width) / 2200, frameSpace / 830);
      historyScene.style.setProperty("--history-scale", String(scale));
      historyScene.style.setProperty("--history-frame-top", `${Math.max(0, frameSpace - 830 * scale) / 2}px`);
    };
    if (historyLayout) {
      const historyResize = new ResizeObserver(fitHistory);
      historyResize.observe(historyScene);
      cleanup.push(() => historyResize.disconnect());
    }
    const listen = (element, event, handler) => {
      element.addEventListener(event, handler);
      cleanup.push(() => element.removeEventListener(event, handler));
    };
    const stop = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      orbitAnimation = null;
      shutters.forEach((shutter) => shutter.remove());
      shutters.clear();
      yearReels.forEach((reel) => reel.remove());
      yearReels.clear();
      cancelAnimationFrame(countFrame);
      content.querySelectorAll("[data-about-count]").forEach((number) => {
        number.textContent = number.dataset.aboutCount;
      });
    };
    const reveal = (elements, distance = 15) => {
      if (reduced.matches) return;
      elements.filter(Boolean).forEach((element, i) => {
        animations.push(element.animate([
          { opacity: 0, transform: `translateY(${distance}px)` },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 440, delay: i * 45, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }));
      });
    };
    const animateValuesOrbit = (scene) => {
      const orbit = scene.querySelector(".about-values-orbit-motion");
      if (!orbit || reduced.matches) return;
      orbitAnimation = orbit.animate([
        { transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }
      ], { duration: 48000, iterations: Infinity, easing: "linear" });
      if (document.hidden) orbitAnimation.pause();
      animations.push(orbitAnimation);
    };
    const revealValues = (scene, intro = true) => {
      if (reduced.matches) return;
      if (intro) {
        reveal([scene.querySelector(".about-scene-head")]);
        const orbit = scene.querySelector(".about-values-orbit");
        if (orbit) animations.push(orbit.animate([
          { opacity: 0, transform: "scale(0.94)" },
          { opacity: 1, transform: "scale(1)" }
        ], { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }));
      }
      [...scene.querySelectorAll(".about-value:not([hidden])")].forEach((value, i) => {
        const delay = intro ? 100 + i * 110 : 0;
        const timing = { duration: 640, delay, fill: "backwards", easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
        animations.push(value.animate([
          { opacity: 0, transform: "translateX(18px)" },
          { opacity: 1, transform: "translateX(0)" }
        ], timing));
        const line = value.querySelector(".about-value-mark i");
        if (line) animations.push(line.animate([
          { transform: "scaleX(0)" }, { transform: "scaleX(1)" }
        ], { ...timing, delay: delay + 160 }));
      });
      animateValuesOrbit(scene);
    };
    const revealMission = (scene, intro = true) => {
      if (reduced.matches) return;
      const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
      if (intro) reveal([scene.querySelector(".about-scene-head")], 10);
      const statement = scene.querySelector("#about-mission-part-0");
      if (!statement.hidden) {
        const bridge = statement.querySelector(".about-mission-bridge");
        animations.push(bridge.animate([
          { opacity: 0, clipPath: "inset(0 100% 0 0)" },
          { opacity: 1, clipPath: "inset(0 0 0 0)" }
        ], { duration: 1000, delay: intro ? 100 : 0, fill: "backwards", easing }));
        const signal = bridge.querySelector(".about-mission-signal");
        animations.push(signal.animate([
          { transform: "translateX(0)", opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.15 },
          { opacity: 1, offset: 0.8 },
          { transform: "translateX(272px)", opacity: 0, offset: 1 }
        ], { duration: 1400, delay: intro ? 300 : 150, fill: "both", easing: "ease-in-out" }));
        reveal([statement.querySelector(".about-mission-copy")], 10);
      }
      const footprints = scene.querySelector("#about-mission-part-1");
      if (!footprints.hidden) {
        reveal([footprints.querySelector(".about-metrics")], 8);
        [...footprints.querySelectorAll(".about-metric")].forEach((metric, i) => {
          animations.push(metric.animate([
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "translateY(0)" }
          ], { duration: 640, delay: (intro ? 180 : 60) + i * 100, fill: "backwards", easing }));
        });
      }
    };
    const wipeStory = (elements, delay = 90) => {
      if (reduced.matches) return;
      const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
      elements.filter((element) => element.getClientRects().length).forEach((element, i) => {
        const words = element.querySelector(".about-story-words");
        if (!words) return;
        const shutter = document.createElement("span");
        shutter.className = "about-story-shutter";
        shutter.setAttribute("aria-hidden", "true");
        const block = document.createElement("span");
        block.className = "about-story-block";
        shutter.append(block);
        element.append(shutter);
        shutters.add(shutter);
        // The block enters, briefly covers the words, then clears to the right.
        const timing = { duration: 860, delay: delay + i * 95, fill: "backwards" };
        const mask = block.animate([
          { transform: "translateX(-101%)", offset: 0, easing },
          { transform: "translateX(0)", offset: 0.36 },
          { transform: "translateX(0)", offset: 0.48, easing },
          { transform: "translateX(101%)", offset: 1 }
        ], timing);
        const text = words.animate([
          { clipPath: "inset(0 100% 0 0)", offset: 0 },
          { clipPath: "inset(0 100% 0 0)", offset: 0.48, easing },
          { clipPath: "inset(0 0% 0 0)", offset: 1 }
        ], timing);
        animations.push(mask, text);
        Promise.allSettled([mask.finished, text.finished]).then(() => {
          shutter.remove();
          shutters.delete(shutter);
        });
      });
    };
    const rollYear = (year, direction, previousYear) => {
      if (!year?.checkVisibility() || reduced.matches) return;
      const tone = getComputedStyle(year).color;
      const accent = getComputedStyle(content).getPropertyValue("--about-accent").trim();
      const shuffle = (items) => {
        for (let i = items.length - 1; i > 0; i--) {
          const next = Math.floor(Math.random() * (i + 1));
          [items[i], items[next]] = [items[next], items[i]];
        }
        return items;
      };
      const settleOrder = shuffle([0, 1, 2, 3]);
      [...year.querySelectorAll(".about-year-digit")].forEach((digit, i) => {
        const target = digit.textContent;
        const sequence = [previousYear?.[i] || target];
        // Each reel takes a different, non-numeric route before finding its year digit.
        shuffle([..."0123456789"]).forEach((value) => {
          if (value !== sequence.at(-1)) sequence.push(value);
        });
        if (sequence.at(-1) === target) sequence.push(String((Number(target) + 3 + i) % 10));
        sequence.push(target);
        const forward = (i % 2 === 0 ? 1 : -1) * direction > 0;
        const reel = document.createElement("span");
        reel.className = "about-year-reel";
        reel.setAttribute("aria-hidden", "true");
        (forward ? sequence : [...sequence].reverse()).forEach((value) => {
          const frame = document.createElement("span");
          frame.textContent = value;
          reel.append(frame);
        });
        digit.parentElement.append(reel);
        yearReels.add(reel);
        const travel = `translateY(-${(sequence.length - 1) * 1.05}em)`;
        const timing = { duration: 1800 + Math.random() * 260, delay: settleOrder[i] * 100, fill: "backwards" };
        const movement = reel.animate([
          { transform: forward ? "translateY(0)" : travel },
          { transform: forward ? travel : "translateY(0)" }
        ], { ...timing, easing: "cubic-bezier(0.32, 0.02, 0.22, 1)" });
        animations.push(movement, digit.animate([{ opacity: 0 }, { opacity: 0 }], timing), reel.animate([
          { color: tone, filter: "blur(0px)", offset: 0 },
          { color: accent, filter: "blur(1px)", offset: 0.2 },
          { color: accent, filter: "blur(0.3px)", offset: 0.74 },
          { color: tone, filter: "blur(0px)", offset: 1 }
        ], timing));
        const remove = () => { reel.remove(); yearReels.delete(reel); };
        movement.finished.then(remove, remove);
      });
      reveal([year.querySelector(".about-year-suffix")], 6);
    };
    const revealHistory = (milestone, direction = 1, previousYear = "") => {
      if (!milestone || reduced.matches) return;
      rollYear(milestone.querySelector(".about-year"), direction, previousYear);
      reveal([...milestone.querySelectorAll(".about-milestone-copy > *")], direction * 12);
      const image = milestone.querySelector(".about-history-image");
      const photo = image?.querySelector("img");
      const timing = { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
      if (image) animations.push(image.animate([
        { clipPath: direction > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
        { clipPath: "inset(0 0 0 0)" }
      ], timing));
      if (photo) animations.push(photo.animate([
        { transform: "scale(1.045)" }, { transform: "scale(1)" }
      ], timing));
      reveal([milestone.querySelector("figcaption")], 6);
    };
    const count = (panel, duration = 780) => {
      const numbers = [...panel.querySelectorAll("[data-about-count]")]
        .filter((number) => number.getClientRects().length);
      if (!numbers.length || reduced.matches) return;
      const start = performance.now();
      const frame = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        numbers.forEach((number) => {
          number.textContent = Math.round(Number(number.dataset.aboutCount) * eased);
        });
        if (progress < 1) countFrame = requestAnimationFrame(frame);
      };
      countFrame = requestAnimationFrame(frame);
    };
    const activate = (panel, animate = true) => {
      stop();
      if (!panel?.querySelector(".about-scene") || !animate) return;
      const scene = panel.querySelector(".about-scene");
      if (scene === historyScene) fitHistory();
      if (scene.matches(".about-story")) {
        reveal([scene.querySelector(".about-figure")], 18);
        wipeStory([...scene.querySelectorAll(".about-story-reveal")]);
        const image = scene.querySelector("img");
        if (image && !reduced.matches) animations.push(image.animate([
          { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }
        ], { duration: 680, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }));
      } else if (scene.matches(".about-values")) {
        revealValues(scene);
      } else if (scene.matches(".about-mission")) {
        revealMission(scene);
        count(panel, 1200);
      } else {
        reveal([scene.querySelector(".about-scene-head"), scene.querySelector(".about-history-rail")]);
        revealHistory(scene.querySelector(".about-milestone:not([hidden])"));
      }
    };
    content.querySelectorAll("[data-about-group]").forEach((scene) => {
      const tablist = scene.querySelector("[data-about-switch]");
      const buttons = [...tablist.querySelectorAll("[data-about-tab]")];
      const panels = buttons.map((button) => content.querySelector("#" + button.getAttribute("aria-controls")));
      let active = 0;
      const select = (index, focus = false, animate = true) => {
        const previous = active;
        active = (index + buttons.length) % buttons.length;
        const exclusive = compact.matches || scene.dataset.aboutGroup === "history";
        buttons.forEach((button, i) => {
          button.setAttribute("aria-selected", String(i === active));
          if (scene.dataset.aboutGroup === "history") button.dataset.state = i < active ? "past" : i === active ? "current" : "future";
          button.tabIndex = i === active ? 0 : -1;
          panels[i].hidden = exclusive && i !== active;
          panels[i].inert = exclusive && i !== active;
          panels[i].tabIndex = 0;
        });
        const indicator = scene.querySelector(".about-index");
        if (indicator) indicator.textContent = `${String(active + 1).padStart(2, "0")} / ${String(buttons.length).padStart(2, "0")}`;
        if (scene.dataset.aboutGroup === "history") {
          scene.style.setProperty("--history-progress", active / (buttons.length - 1));
        }
        if (focus) buttons[active].focus({ preventScroll: true });
        if (animate && previous !== active && !scene.closest(".room-panel").hidden) {
          stop();
          if (scene.dataset.aboutGroup === "story") wipeStory([...panels[active].querySelectorAll(".about-story-reveal")], 0);
          else if (scene.dataset.aboutGroup === "history") revealHistory(panels[active], previous < active ? 1 : -1, panels[previous].querySelector("[data-year]")?.dataset.year);
          else if (scene.dataset.aboutGroup === "values") revealValues(scene, false);
          else if (scene.dataset.aboutGroup === "mission") revealMission(scene, false);
          else reveal([panels[active]], previous < active ? 14 : -14);
          count(panels[active], scene.dataset.aboutGroup === "mission" ? 1200 : 780);
        }
      };
      buttons.forEach((button, i) => {
        listen(button, "click", () => select(i));
        listen(button, "keydown", (event) => {
          const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: buttons.length - 1 }[event.key];
          if (next === undefined) return;
          event.preventDefault();
          select(next, true);
        });
      });
      groups.push(() => select(active, false, false));
      select(0, false, false);
    });
    const adapt = () => {
      stop();
      fitHistory();
      groups.forEach((update) => update());
      const values = content.querySelector(".room-panel:not([hidden]) .about-values");
      if (values) animateValuesOrbit(values);
    };
    listen(compact, "change", adapt);
    listen(large, "change", adapt);
    listen(reduced, "change", adapt);
    listen(document, "visibilitychange", () => {
      if (!orbitAnimation) return;
      if (document.hidden) orbitAnimation.pause();
      else if (orbitAnimation.playState === "paused") orbitAnimation.play();
    });
    return {
      activate,
      destroy: () => { stop(); cleanup.forEach((remove) => remove()); }
    };
  };
})();
