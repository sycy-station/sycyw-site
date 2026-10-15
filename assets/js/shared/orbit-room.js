(() => {
  "use strict";
  const root = document.documentElement;
  const content = document.getElementById("roomContent");
  if (root.dataset.experience !== "orbit" || !content) return;

  const slugs = new Set(["products", "ecosystem", "team", "about", "join", "contact"]);
  const routeSelector = ".orbit-item, .ib-item, .overlay-list a, .mark, .room-return, [data-route]";
  const orbit = document.querySelector(".stage-orbit");
  const sectionNav = document.querySelector(".section-nav");
  const about = document.getElementById("stageAbout");
  const status = document.getElementById("roomStatus");
  const cursor = document.querySelector(".cursor");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cache = new Map();
  const pending = new Map();
  let sequence = 0;
  let controller = null;
  let settleTimer = 0;
  let scrollTimer = 0;
  let dialTimer = 0;
  let activeFlight = null;
  let aboutRoom = null;
  let teamRoom = null;
  let contactRoom = null;
  let ecosystemRoom = null;
  let joinRoom = null;
  let productsRoom = null;
  let lastRoom = root.dataset.slug || "";
  let edgeRoute = lastRoom;

  const announce = (message) => { if (status) status.textContent = message; };
  const routeFor = (href) => {
    if (!href || href.startsWith("#")) return null;
    let url;
    try { url = new URL(href, location.href); } catch (_) { return null; }
    if (url.origin !== location.origin) return null;
    const file = url.pathname.split("/").pop() || "index.html";
    const slug = file === "index.html" ? "" : file.replace(/\.html$/, "");
    if (file !== "index.html" && (!file.endsWith(".html") || !slugs.has(slug))) return null;
    const request = new URL(url);
    request.hash = "";
    if (request.pathname.endsWith("/")) request.pathname += "index.html";
    return { url, key: request.href, slug };
  };
  const navigationOrder = [...(sectionNav?.querySelectorAll(".ib-item") || [])]
    .map(link => routeFor(link.href)?.slug);
  const readDocument = (doc, route) => {
    const panel = doc.getElementById("roomContent");
    const page = doc.documentElement;
    if (!panel || page.dataset.experience !== "orbit" ||
        (page.dataset.slug || "") !== route.slug) throw new Error("Invalid room document");
    return {
      html: panel.innerHTML,
      title: doc.title,
      description: doc.querySelector('meta[name="description"]')?.content || ""
    };
  };
  const fetchRoom = async (route, signal) => {
    if (cache.has(route.key)) return cache.get(route.key);
    const response = await fetch(route.key, { signal, credentials: "same-origin" });
    if (!response.ok) throw new Error("Room request failed");
    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    const data = readDocument(doc, route);
    cache.set(route.key, data);
    return data;
  };
  const closeMenu = () => {
    const toggle = document.getElementById("menuToggle");
    if (toggle?.getAttribute("aria-expanded") === "true") toggle.click();
  };
  const focusElement = (element) => {
    if (!element) return;
    if (!element.matches("a, button, input, select, textarea, [tabindex]")) element.tabIndex = -1;
    element.focus({ preventScroll: true });
  };
  const syncShell = (slug) => {
    root.dataset.page = slug ? "room" : "stage";
    if (slug) root.dataset.slug = slug;
    else delete root.dataset.slug;
    content.inert = !slug;
    content.setAttribute("aria-hidden", String(!slug));
    if (orbit) {
      orbit.inert = !!slug;
      orbit.setAttribute("aria-hidden", String(!!slug));
    }
    if (sectionNav) {
      sectionNav.inert = !slug;
      sectionNav.setAttribute("aria-hidden", String(!slug));
    }
    if (about) {
      about.hidden = !!slug;
      about.inert = !!slug;
      about.setAttribute("aria-hidden", String(!!slug));
    }
    document.querySelectorAll(".orbit-item, .ib-item, .overlay-list a").forEach((link) => {
      const current = !!slug && routeFor(link.href)?.slug === slug;
      link.classList.toggle("is-current", current);
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (slug) {
      try {
        const record = JSON.parse(localStorage.getItem("ces-visit"));
        if (record && Array.isArray(record.seen) && !record.seen.includes(slug)) {
          record.seen.push(slug);
          localStorage.setItem("ces-visit", JSON.stringify(record));
        }
      } catch (_) { /* Visiting remains available without storage. */ }
    }
  };
  const initPanels = () => {
    aboutRoom?.destroy();
    teamRoom?.destroy();
    contactRoom?.destroy();
    ecosystemRoom?.destroy();
    joinRoom?.destroy();
    productsRoom?.destroy();
    aboutRoom = window.__cesInitAboutRoom?.(content) || null;
    teamRoom = window.__cesInitTeamRoom?.(content) || null;
    contactRoom = window.__cesInitContactRoom?.(content) || null;
    ecosystemRoom = window.__cesInitEcosystemRoom?.(content) || null;
    joinRoom = window.__cesInitJoinRoom?.(content) || null;
    productsRoom = window.__cesInitProductsRoom?.(content) || null;
    const tablist = content.querySelector(".room-tabs");
    const tabs = [...(tablist?.querySelectorAll("[data-room-tab]") || [])];
    if (!tabs.length) return;
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    if (panels.some((panel) => !panel || !content.contains(panel))) return;
    let active = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
    const select = (index, focus = false) => {
      active = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        panels[i].hidden = i !== active;
        panels[i].inert = i !== active;
      });
      const labelNode = tabs[active].cloneNode(true);
      labelNode.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
      const label = tabs[active].dataset.label || labelNode.textContent.trim();
      const chapter = content.querySelector(".room-chapter");
      if (chapter) chapter.textContent = `${String(active + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")} · ${label}`;
      const viewport = content.querySelector(".room-panels");
      if (viewport) viewport.scrollTop = 0;
      aboutRoom?.activate(panels[active]);
      teamRoom?.activate(panels[active]);
      ecosystemRoom?.activate(panels[active]);
      joinRoom?.activate(panels[active]);
      productsRoom?.activate(panels[active]);
      if (focus) tabs[active].focus();
    };
    tablist.setAttribute("role", "tablist");
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i));
      tab.addEventListener("keydown", (event) => {
        const vertical = tablist.getAttribute("aria-orientation") === "vertical";
        const arrows = vertical ? { ArrowDown: i + 1, ArrowUp: i - 1 } : { ArrowRight: i + 1, ArrowLeft: i - 1 };
        const next = { ...arrows, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
    content.querySelectorAll("[data-next-panel]").forEach((button) => {
      button.addEventListener("click", () => select(active + 1, true));
    });
    select(active);
  };
  const clearTitleFlight = () => {
    if (!activeFlight) return;
    const flight = activeFlight;
    activeFlight = null;
    flight.animations.forEach((animation) => animation.cancel());
    flight.element.remove();
    root.classList.remove("room-flying");
  };
  const captureTitleFlight = (slug) => {
    if (reduced.matches || !Element.prototype.animate) return null;
    const item = [...(orbit?.querySelectorAll(".orbit-item") || [])]
      .find((link) => routeFor(link.href)?.slug === slug);
    const lines = item?.querySelector(".orbit-inner")?.children;
    if (!lines || lines.length !== 3) return null;
    const tilt = parseFloat(getComputedStyle(item).getPropertyValue("--tilt")) || 0;
    const typography = ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight", "color"];
    return [...lines].map((line) => {
      // A zero-size probe records the actual rotated origin, including hover offsets.
      const position = line.style.position;
      line.style.position = "relative";
      const probe = document.createElement("i");
      probe.style.cssText = "position:absolute;left:0;top:0;width:0;height:0";
      line.appendChild(probe);
      const origin = probe.getBoundingClientRect();
      probe.remove();
      line.style.position = position;
      const style = getComputedStyle(line);
      return {
        text: line.textContent,
        className: line.className,
        x: origin.left,
        y: origin.top,
        tilt,
        typography: Object.fromEntries(typography.map((property) => [property, style[property]]))
      };
    });
  };
  const playTitleFlight = (lines) => {
    const targets = [content.querySelector("[data-room-no]"), content.querySelector("#roomTitle"),
      content.querySelector("[data-room-sub]")];
    if (targets.some((target) => !target)) return Promise.resolve();
    root.classList.add("room-flying");
    const element = document.createElement("div");
    element.className = "travel room-title-flight";
    element.setAttribute("aria-hidden", "true");
    document.body.appendChild(element);
    const flight = { element, animations: [] };
    activeFlight = flight;
    lines.forEach((line, index) => {
      const target = targets[index];
      const targetStyle = getComputedStyle(target);
      const destination = Object.fromEntries(Object.keys(line.typography)
        .map((property) => [property, targetStyle[property]]));
      const label = document.createElement("span");
      label.className = "flight-line " + line.className;
      label.textContent = line.text;
      Object.assign(label.style, destination);
      element.appendChild(label);
      // Match glyph positions, so inline metadata and the block heading land without a jump.
      const range = document.createRange();
      range.selectNodeContents(target);
      const targetText = range.getBoundingClientRect();
      range.selectNodeContents(label);
      const labelText = range.getBoundingClientRect();
      const x = targetText.left - labelText.left;
      const y = targetText.top - labelText.top;
      Object.assign(label.style, line.typography);
      flight.animations.push(label.animate([
        { ...line.typography, transform: `translate(${line.x}px, ${line.y}px) rotate(${line.tilt}deg)` },
        { ...destination, transform: `translate(${x}px, ${y}px) rotate(0deg)` }
      ], { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }));
    });
    return Promise.allSettled(flight.animations.map((animation) => animation.finished)).then(() => {
      if (activeFlight === flight) clearTitleFlight();
    });
  };
  const clearTransition = () => {
    clearTimeout(settleTimer);
    clearTimeout(scrollTimer);
    clearTimeout(dialTimer);
    clearTitleFlight();
    root.classList.remove("room-changing", "room-opening");
    document.body.classList.remove("bar-slide", "bar-hidden");
    sectionNav?.querySelectorAll(".is-target").forEach((link) => link.classList.remove("is-target"));
    content.setAttribute("aria-busy", "false");
  };
  const syncIndexBar = (revealCurrent = false, target = null, reveal = false) => {
    const current = target || sectionNav?.querySelector(".ib-item.is-current");
    const track = current?.closest(".ib-track");
    if (!track || root.dataset.page !== "room") return;
    const ensure = (name, tag) => {
      let element = track.querySelector("." + name);
      if (!element) {
        element = document.createElement(tag);
        element.className = name;
        element.setAttribute("aria-hidden", "true");
        track.appendChild(element);
      }
      return element;
    };
    const marker = ensure("ib-marker", "i");
    const planet = ensure("ib-planet", "span");
    if (!planet.firstElementChild) {
      const icon = orbit?.querySelector(".orbit-planet svg");
      if (icon) planet.appendChild(icon.cloneNode(true));
    }
    const box = current.getBoundingClientRect();
    const trackBox = track.getBoundingClientRect();
    const x = box.left - trackBox.left + track.scrollLeft;
    const previous = current.previousElementSibling;
    const previousRight = previous?.matches(".ib-item") ? previous.getBoundingClientRect().right - trackBox.left : 0;
    if (!target) {
      marker.style.setProperty("--mx", x + "px");
      marker.style.setProperty("--mw", box.width + "px");
    }
    if (target || reveal) {
      marker.style.setProperty("--clip", "100%");
    } else marker.style.setProperty("--clip", "0%");
    planet.style.setProperty("--px", Math.max(0, previousRight, x - 21) + "px");
    [marker, planet].forEach((element) => {
      element.classList.add("is-ready");
    });
    if (reveal) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (marker.isConnected && root.dataset.page === "room" &&
            current.classList.contains("is-current")) marker.style.setProperty("--clip", "0%");
      }));
    }
    const dense = track.querySelector(".ib-scale-dense");
    if (dense) {
      dense.style.setProperty("--dx", x + "px");
      dense.style.setProperty("--dw", box.width + "px");
    }
    const scroll = current.closest(".ib-scroll");
    if (revealCurrent && scroll) {
      const bounds = scroll.getBoundingClientRect();
      const delta = box.left < bounds.left + 24 ? box.left - bounds.left - 24 :
        box.right > bounds.right - 24 ? box.right - bounds.right + 24 : 0;
      if (delta) scroll.scrollLeft += delta;
    }
  };
  const moveIndexBar = (slug) => {
    const target = [...(sectionNav?.querySelectorAll(".ib-item") || [])]
      .find((link) => routeFor(link.href)?.slug === slug);
    if (!target || target.classList.contains("is-current")) return;
    document.body.classList.add("bar-slide");
    target.classList.add("is-target");
    syncIndexBar(true, target);
  };
  const alignPlanet = (slug) => {
    const items = [...document.querySelectorAll(".orbit-item")];
    const index = items.findIndex((item) => routeFor(item.href)?.slug === (slug || lastRoom));
    if (slug) syncIndexBar(true);
    else if (index >= 0 && typeof window.__cesReleasePlanet === "function") window.__cesReleasePlanet(index);
    return items[index];
  };
  const navigate = async (route, push = true) => {
    if (root.hasAttribute("data-home-locked")) return;
    const token = ++sequence;
    controller?.abort();
    controller = new AbortController();
    clearTransition();
    closeMenu();
    const previous = root.dataset.slug || "";
    if (edgeRoute !== route.slug) {
      const direction = navigationOrder.indexOf(route.slug) < navigationOrder.indexOf(edgeRoute) ? -1 : 1;
      window.__cesPulseEdgeScales?.(direction);
      edgeRoute = route.slug;
    }
    if (previous) lastRoom = previous;
    // Restore the selected marker before a new request can interrupt a dial movement.
    if (previous) syncIndexBar();
    if (previous && route.slug && !reduced.matches) moveIndexBar(route.slug);
    content.setAttribute("aria-busy", "true");
    announce("正在打开…");
    try {
      const data = cache.get(route.key) || await (pending.get(route.key) || fetchRoom(route, controller.signal));
      if (token !== sequence || root.hasAttribute("data-home-locked")) return;
      if (previous && route.slug && !reduced.matches) {
        root.classList.add("room-changing");
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      if (token !== sequence || root.hasAttribute("data-home-locked")) return;
      if (document.body.classList.contains("loading")) document.getElementById("splash")?.click();
      const flight = !previous && route.slug ? captureTitleFlight(route.slug) : null;
      if (!previous && route.slug) root.classList.add("room-opening");
      content.innerHTML = data.html;
      document.title = data.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = data.description;
      document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]')
        .forEach((meta) => { meta.content = data.title; });
      document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"]')
        .forEach((meta) => { meta.content = data.description; });
      syncShell(route.slug);
      document.body.classList.add("stage-in", "deco-on");
      initPanels();
      if (push && location.href !== route.url.href) history.pushState({ orbitRoom: route.slug }, "", route.url.href);
      const selected = alignPlanet(route.slug);
      if (route.slug) syncIndexBar(true, null, !reduced.matches);
      if (flight) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const arrival = flight ? playTitleFlight(flight) : Promise.resolve();
      requestAnimationFrame(() => {
        if (token !== sequence) return;
        root.classList.remove("room-changing");
      });
      arrival.then(() => {
        if (token === sequence) focusElement(route.slug ? content.querySelector("#roomTitle, h1") : selected || about);
      });
      dialTimer = setTimeout(() => {
        if (token !== sequence) return;
        document.body.classList.remove("bar-slide");
        sectionNav?.querySelectorAll(".is-target").forEach((link) => link.classList.remove("is-target"));
      }, reduced.matches ? 0 : 380);
      content.setAttribute("aria-busy", "false");
      announce(route.slug ? `已进入${content.querySelector("h1")?.textContent.trim() || data.title}` : "已返回首页");
      scrollTimer = setTimeout(() => {
        if (token !== sequence) return;
        if (!route.slug || (!["about", "team", "contact", "ecosystem"].includes(route.slug) && window.matchMedia("(max-width: 900px), (max-height: 700px)").matches)) {
          const occupied = Math.max(0, ...[sectionNav, document.querySelector(".site-header")]
            .filter(Boolean).map((element) => element.getBoundingClientRect().bottom));
          const top = route.slug ? content.getBoundingClientRect().top + window.scrollY - occupied - 16 : 0;
          window.scrollTo({ top: Math.max(0, top), behavior: reduced.matches ? "instant" : "smooth" });
        }
      }, reduced.matches ? 0 : flight ? 420 : 300);
      settleTimer = setTimeout(() => {
        if (token !== sequence) return;
        clearTransition();
        window.dispatchEvent(new Event("resize"));
        alignPlanet(route.slug);
      }, reduced.matches ? 0 : 900);
    } catch (error) {
      if (token !== sequence || error.name === "AbortError") return;
      clearTransition();
      location.assign(route.url.href);
    }
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.(routeSelector);
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || link.hasAttribute("download") ||
        (link.target && link.target !== "_self")) return;
    const route = routeFor(link.getAttribute("href"));
    if (!route) return;
    event.preventDefault();
    navigate(route);
  });
  const prefetch = (event) => {
    if (event.pointerType === "touch") return;
    const link = event.target.closest?.(routeSelector);
    const route = link && routeFor(link.getAttribute("href"));
    if (!route || cache.has(route.key) || pending.has(route.key)) return;
    const request = fetchRoom(route).finally(() => pending.delete(route.key));
    pending.set(route.key, request);
    request.catch(() => {});
  };
  document.addEventListener("pointerover", prefetch);
  document.addEventListener("focusin", prefetch);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.defaultPrevented || root.dataset.page !== "room" ||
        document.getElementById("overlayNav")?.classList.contains("open") ||
        document.querySelector("dialog[open]") ||
        event.target.closest?.("dialog, input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
    const route = routeFor("index.html");
    if (route) { event.preventDefault(); navigate(route); }
  }, true);
  content.addEventListener("click", async (event) => {
    const button = event.target.closest?.("[data-copy-email]");
    if (!button) return;
    const email = content.querySelector('.contact-email[href^="mailto:"]')?.getAttribute("href").slice(7);
    if (!email) return;
    const feedback = content.querySelector("[data-copy-status]");
    try {
      await navigator.clipboard.writeText(email);
      announce("邮箱已复制：" + email);
      if (feedback) feedback.textContent = "邮箱已复制，可以粘贴使用。";
      button.setAttribute("data-copied", "");
      const label = button.querySelector("[data-copy-label]");
      if (label) label.textContent = "已复制";
      if (button.isConnected && content.contains(button)) contactRoom?.showCopySuccess();
    } catch (_) {
      announce("请手动选择并复制邮箱：" + email);
      if (feedback) feedback.textContent = "复制未完成，请选择上方邮箱手动复制。";
    }
  });
  if (cursor) {
    document.addEventListener("mouseover", (event) => {
      if (event.target.closest?.("a, button, summary")) cursor.classList.add("hovering");
    });
    document.addEventListener("mouseout", (event) => {
      if (!event.relatedTarget?.closest?.("a, button, summary")) cursor.classList.remove("hovering");
    });
  }
  window.addEventListener("popstate", () => {
    if (root.hasAttribute("data-home-locked")) return;
    const route = routeFor(location.href);
    if (route) navigate(route, false);
  });
  window.addEventListener("ces:home-collapse", () => {
    ++sequence;
    controller?.abort();
    clearTransition();
  });
  window.addEventListener("resize", () => {
    clearTitleFlight();
    syncIndexBar();
  });
  // Layout changes can clamp mobile scroll; only user scrolling interrupts the flight.
  window.addEventListener("wheel", clearTitleFlight, { passive: true });
  window.addEventListener("touchmove", clearTitleFlight, { passive: true });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    edgeRoute = root.dataset.slug || "";
    ++sequence;
    controller?.abort();
    clearTransition();
    document.body.classList.remove("leaving", "leaving-back", "leaving-sub");
    window.dispatchEvent(new Event("resize"));
  });
  const initial = routeFor(location.href);
  if (initial) cache.set(initial.key, readDocument(document, initial));
  root.classList.add("room-enhanced");
  syncShell(root.dataset.slug || "");
  initPanels();
  if (root.dataset.slug) requestAnimationFrame(() => {
    if (sequence === 0) {
      alignPlanet(root.dataset.slug);
      syncIndexBar(true, null, !reduced.matches);
    }
  });
})();
