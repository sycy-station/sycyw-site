(() => {
  "use strict";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CURSOR_KEY = "ces-cursor";

  const saveCursorPos = (e) => {
    if (!e || !e.detail) return;
    try {
      sessionStorage.setItem(
        CURSOR_KEY,
        JSON.stringify({ x: e.clientX, y: e.clientY, ts: Date.now() })
      );
    } catch (err) {
    }
  };

  const readCursorPos = () => {
    let raw = null;
    try {
      raw = sessionStorage.getItem(CURSOR_KEY);
      sessionStorage.removeItem(CURSOR_KEY);
    } catch (err) {
      return null;
    }
    if (!raw) return null;
    let sig;
    try {
      sig = JSON.parse(raw);
    } catch (err) {
      return null;
    }

    const age = Date.now() - (sig.ts || 0);
    if (age < 0 || age > 2500) return null;
    if (typeof sig.x !== "number" || typeof sig.y !== "number") return null;

    if (sig.x < 0 || sig.y < 0 || sig.x > window.innerWidth || sig.y > window.innerHeight) {
      return null;
    }

    return sig;
  };
  const splash = document.getElementById("splash");
  const codeContainer = document.getElementById("splashCode");
  let splashDone = false;

  const TIMING = {
    nameDelay: 800,
    codeDelay: 950,
    charSpeed: 20,
    lineGap: 150,
    expandDelay: 320,
    holdExpanded: 1750,

    skipGrow: 340,

    aboutType: 520,

    aboutTypeBack: 820,

    handoffOverlap: 290,
    dissolve: 620
  };
  const SP_PHASES = ["sp-logo", "sp-name", "sp-code", "sp-expand", "sp-leave"];
  const setPhase = (name) => {
    if (name) splash.classList.add("phase-" + name);
    document.body.classList.remove(...SP_PHASES);
    document.body.classList.add("sp-" + name);
    if (name === "expand") document.body.classList.add("deco-on");
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

  const hasSplash =
    !!splash && !document.documentElement.classList.contains("nav-back");
  if (hasSplash) document.body.classList.add("loading");

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
  const hudStatus = document.getElementById("hudStatus");
  const hudSeq = document.getElementById("hudSeq");
  const hudPct = document.getElementById("hudPct");
  const hudBar = document.getElementById("hudBar");

  const setHud = (status, pct) => {
    if (hudStatus && status) {
      hudStatus.textContent = status;
      hudStatus.classList.remove("flick");
      void hudStatus.offsetWidth;
      hudStatus.classList.add("flick");
    }
    if (typeof pct === "number") {
      if (hudPct) hudPct.textContent = String(pct).padStart(3, "0");
      if (hudBar) hudBar.style.width = pct + "%";
    }
  };
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

  const expandLogo = () => {
    if (splashDone) return;
    setPhase("expand");
    lockSeq();
    setHud("READY", 100);
    later(leaveSplash, TIMING.holdExpanded);
  };
  let typeAboutNow = null;
  let finished = false;
  const finishSplash = () => {
    if (finished) return;
    finished = true;
    splash.style.display = "none";
    splash.setAttribute("aria-hidden", "true");
    document.body.classList.add("stage-in");
    document.body.classList.add("deco-on");
    initReveal();
    if (typeAboutNow) later(typeAboutNow, TIMING.aboutType);
  };

  const dissolve = () => {
    if (splashDone) return;
    splashDone = true;
    clearTimers();
    lockSeq();
    document.body.classList.remove("loading");

    if (prefersReducedMotion) {
      finishSplash();
      return;
    }

    splash.classList.add("leave");
    document.body.classList.remove(...SP_PHASES);
    document.body.classList.add("sp-leave");
    later(() => document.body.classList.add("stage-in"), TIMING.handoffOverlap);
    later(finishSplash, TIMING.dissolve);
  };
  let skipping = false;
  const leaveSplash = () => {
    if (splashDone) return;
    const cls = splash.classList;

    const needGrow =
      !prefersReducedMotion &&
      !skipping &&
      cls.contains("phase-logo") &&
      !cls.contains("phase-expand");

    if (!needGrow) {
      dissolve();
      return;
    }

    skipping = true;
    clearTimers();
    cls.add("skip");
    setPhase("expand");
    lockSeq();
    setHud("READY", 100);
    later(dissolve, TIMING.skipGrow);
  };

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

    setPhase("logo");
    setHud("SCAN", 18);
    startSeq();
    later(() => {
      setPhase("name");
      setHud("LINK", 46);
      later(() => {
        setPhase("code");
        setHud("SYNC", 72);
        typeLines(0);
      }, TIMING.codeDelay);
    }, TIMING.nameDelay);
  };
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
    setTimeout(go, 2500);
  };

  if (hasSplash) {
    window.addEventListener("load", startWhenLogoReady);
  }

  const cursor = document.querySelector(".cursor");
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (!isTouch && cursor) {
    let mouseX = null, mouseY = null, curX = 0, curY = 0;

    const place = () => {
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
    };

    const activate = () => {
      document.body.classList.add("has-custom-cursor");
      cursor.classList.add("is-live");
    };
    const carried = readCursorPos();
    if (carried) {
      mouseX = curX = carried.x;
      mouseY = curY = carried.y;
      place();
      activate();
    }

    window.addEventListener("mousemove", (e) => {
      if (mouseX === null) {
        curX = e.clientX;
        curY = e.clientY;
        place();
        activate();
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const followCursor = () => {
      if (mouseX !== null) {
        curX += (mouseX - curX) * 0.22;
        curY += (mouseY - curY) * 0.22;
        place();
      }
      requestAnimationFrame(followCursor);
    };
    requestAnimationFrame(followCursor);
    const hoverTargets = document.querySelectorAll("a, button, .index-item");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hovering"));
    });

    if (carried) {
      const under = document.elementFromPoint(carried.x, carried.y);
      if (under && under.closest("a, button, .index-item")) {
        cursor.classList.add("hovering");
      }
    }
  }

  const menuToggle = document.getElementById("menuToggle");
  const overlayNav = document.getElementById("overlayNav");
  const navLinks = Array.from(overlayNav.querySelectorAll("a"));

  const setMenu = (open) => {
    overlayNav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    overlayNav.setAttribute("aria-hidden", String(!open));

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

  document.addEventListener("keydown", (e) => {
    if (!overlayNav.classList.contains("open")) return;

    if (e.key === "Escape") {
      setMenu(false);
      menuToggle.focus();
      return;
    }

    if (e.key === "Tab") {
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
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "ces-theme";

  if (themeToggle) {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    const currentTheme = () => {
      const explicit = root.getAttribute("data-theme");
      if (explicit === "dark" || explicit === "light") return explicit;
      return systemDark.matches ? "dark" : "light";
    };

    const syncToggle = () => {
      const dark = currentTheme() === "dark";
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.setAttribute("aria-label", dark ? "切换浅色模式" : "切换深色模式");
    };
    document.body.classList.add("has-theme-toggle");
    syncToggle();
    let switchTimer = null;
    const setTheme = (name) => {
      root.classList.add("theme-switching");
      clearTimeout(switchTimer);
      switchTimer = setTimeout(() => root.classList.remove("theme-switching"), 450);
      root.setAttribute("data-theme", name);
      try {
        localStorage.setItem(THEME_KEY, name);
      } catch (e) {
      }
      syncToggle();
    };

    themeToggle.addEventListener("click", () => {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });

    systemDark.addEventListener("change", () => {
      if (!root.hasAttribute("data-theme")) syncToggle();
    });
  }

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
  const VISIT_KEY = "ces-visit";
  const SESSION_KEY = "ces-session";

  const readJSON = (store, key) => {
    try {
      const raw = store.getItem(key);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return o && typeof o === "object" ? o : null;
    } catch (e) {
      return null;
    }
  };
  const writeJSON = (store, key, val) => {
    try {
      store.setItem(key, JSON.stringify(val));
    } catch (e) {
    }
  };
  const blankVisit = () => ({ v: 1, visits: 0, dwell: 0, lastSeen: 0, seen: [] });

  const initVisit = () => {
    const rec = Object.assign(blankVisit(), readJSON(localStorage, VISIT_KEY) || {});
    if (rec.v !== 1 || !Array.isArray(rec.seen)) {
      const fresh = blankVisit();
      Object.assign(rec, fresh);
    }

    const ses = readJSON(sessionStorage, SESSION_KEY);
    const firstInSession = !ses;
    const prevSeen = rec.lastSeen;
    if (firstInSession) rec.visits += 1;
    const slug = document.documentElement.getAttribute("data-slug");
    if (slug && rec.seen.indexOf(slug) === -1) rec.seen.push(slug);
    rec.lastSeen = Date.now();
    writeJSON(localStorage, VISIT_KEY, rec);
    const isHome = document.documentElement.getAttribute("data-page") === "stage";
    const isBack = document.documentElement.classList.contains("nav-back");
    const nextSes = {
      homeLoads: (ses && ses.homeLoads) || 0,
      started: (ses && ses.started) || Date.now()
    };
    if (isHome && !isBack) nextSes.homeLoads += 1;
    writeJSON(sessionStorage, SESSION_KEY, nextSes);
    let markAt = document.visibilityState === "visible" ? Date.now() : 0;
    const flush = () => {
      if (!markAt) return;
      const delta = Date.now() - markAt;
      markAt = Date.now();
      if (delta <= 0) return;
      const cur = Object.assign(blankVisit(), readJSON(localStorage, VISIT_KEY) || {});
      cur.dwell = (cur.dwell || 0) + delta;
      writeJSON(localStorage, VISIT_KEY, cur);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        markAt = Date.now();
      } else {
        flush();
        markAt = 0;
      }
    });
    window.addEventListener("pagehide", flush);

    setInterval(() => {
      if (document.visibilityState === "visible") flush();
    }, 15000);

    return {
      visits: rec.visits,
      dwell: rec.dwell,
      seen: rec.seen,
      homeLoads: nextSes.homeLoads,

      away: prevSeen ? Date.now() - prevSeen : 0
    };
  };

  const initAboutType = (stat) => {
    const host = document.getElementById("stageAbout");
    if (!host || !stat) return;
    const typeLayer = host.querySelector(".sa-type");
    const canon = host.getAttribute("data-canon") || "";
    const data = readAboutData();
    if (!typeLayer || !canon || !data) return;
    if (window.matchMedia("(max-height: 590px)").matches) return;
    const text = pickAbout(canon, data, stat);
    typeLayer.setAttribute("data-full", text);
    document.body.classList.add("has-typed-about");

    const build = () => {
      typeLayer.textContent = "";
      const wrap = document.createElement("span");
      wrap.className = "sa-typed";
      const node = document.createTextNode("");
      const caret = document.createElement("span");
      caret.className = "sa-caret";
      caret.textContent = "_";
      wrap.appendChild(node);
      wrap.appendChild(caret);
      typeLayer.appendChild(wrap);
      return node;
    };
    const node = build();
    let started = false;
    let fallback = 0;
    if (document.documentElement.classList.contains("nav-back")) {
      fallback = setTimeout(() => {
        if (!started) {
          started = true;
          node.textContent = text;
        }
      }, 1400 + TIMING.aboutTypeBack + 200);
    }

    if (prefersReducedMotion) {
      started = true;
      clearTimeout(fallback);
      node.textContent = text;
      return;
    }

    typeAboutNow = () => {
      if (started) return;
      started = true;
      clearTimeout(fallback);
      let i = 0;
      const step = () => {
        if (i > text.length) return;
        node.textContent = text.slice(0, i);
        i += 1;
        const prev = text.charAt(i - 2);
        const pause = prev === "，" || prev === "、" ? 260 : 0;
        setTimeout(step, 110 + Math.random() * 50 - 25 + pause);
      };
      step();
    };
  };

  const readAboutData = () => {
    const el = document.getElementById("aboutData");
    if (!el) return null;
    try {
      const o = JSON.parse(el.textContent);
      return o && o.lines && Array.isArray(o.lines.pool) && o.rules ? o : null;
    } catch (e) {
      return null;
    }
  };

  const pickAbout = (canon, data, stat) => {
    const { pool, quips } = data.lines;
    const r = data.rules;
    if (stat.homeLoads >= r.refreshMin && quips.refresh) return quips.refresh;
    if (stat.visits <= 1) return canon;
    const total = document.querySelectorAll(".orbit-item").length;
    if (total && stat.seen.length >= total && quips.allSeen) return quips.allSeen;
    if (stat.dwell >= r.dwellMin && quips.dwell) return quips.dwell;
    if (stat.away >= r.awayMin && quips.away) return quips.away;
    const h = new Date().getHours();
    if (h >= r.nightFrom && h <= r.nightTo && quips.night) return quips.night;
    return pool[(stat.visits - 2) % pool.length];
  };

  const initPageEnter = () => {
    const root = document.documentElement;
    if (root.getAttribute("data-page") !== "sub") return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add("page-ready"));
    });
  };

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
    const track = document.querySelector(".ib-track");
    if (!track || !document.querySelector(".ib-item.is-current")) return;
    const holder = document.createElement("span");
    holder.className = "ib-planet";
    holder.setAttribute("aria-hidden", "true");
    holder.innerHTML = PLANET_SVG;
    track.appendChild(holder);
    barPlanet = holder;
  };
  let barMarker = null;
  let barPlanet = null;
  const PLANET_SIZE = 16;
  const PLANET_GAP = 5;

  const localBox = (el) => {
    const track = el.closest(".ib-track");
    const tb = track.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return { left: b.left - tb.left + track.scrollLeft, width: b.width };
  };

  const placePlanet = (item) => {
    if (!barPlanet || !item) return;
    {
      const box = localBox(item);
      const prev = item.previousElementSibling;
      const prevRight =
        prev && prev.classList.contains("ib-item")
          ? localBox(prev).left + localBox(prev).width
          : 0;
      const want = box.left - PLANET_SIZE - PLANET_GAP;
      const px = Math.max(prevRight, want);
      barPlanet.style.setProperty("--px", Math.max(0, px).toFixed(2) + "px");
    }
  };

  const placeMarker = (item) => {
    if (!barMarker || !item) return;
    const box = localBox(item);
    barMarker.style.setProperty("--mx", box.left.toFixed(2) + "px");
    barMarker.style.setProperty("--mw", box.width.toFixed(2) + "px");
  };
  let barDense = null;

  const initBarScale = () => {
    barDense = document.querySelector(".ib-scale-dense");
    const current = document.querySelector(".ib-item.is-current");
    if (!barDense || !current) return;
    placeDense(current);
  };

  const placeDense = (item) => {
    if (!barDense || !item) return;
    const box = localBox(item);
    barDense.style.setProperty("--dx", box.left.toFixed(2) + "px");
    barDense.style.setProperty("--dw", box.width.toFixed(2) + "px");
  };

  const emphasizeFreq = (item) => {
    document.querySelectorAll(".ib-item.is-target").forEach((el) => {
      el.classList.remove("is-target");
    });
    if (item) item.classList.add("is-target");
  };

  const placeBoth = (item) => {
    placeMarker(item);
    placePlanet(item);
    placeDense(item);
  };

  const initBarMarker = () => {
    const track = document.querySelector(".ib-track");
    const current = document.querySelector(".ib-item.is-current");
    if (!track || !current) return;
    barMarker = document.createElement("i");
    barMarker.className = "ib-marker";
    barMarker.setAttribute("aria-hidden", "true");
    track.appendChild(barMarker);
    placeBoth(current);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barMarker.classList.add("is-ready");
        if (barPlanet) barPlanet.classList.add("is-ready");
        barMarker.style.setProperty("--clip", "0%");
      });
    });
    let rt = 0;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => placeBoth(document.querySelector(".ib-item.is-current")), 120);
    });
  };

  const initBarScroll = () => {
    const bar = document.querySelector(".index-bar");
    if (!bar) return;
    const THRESHOLD = 8;
    const TOP_ZONE = 80;
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
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(apply);
        }
      },
      { passive: true }
    );
  };

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

  const tiltOf = (item) =>
    parseFloat(getComputedStyle(item).getPropertyValue("--tilt")) || 0;

  const localOffsets = (item, inner, lines) => {
    const had = item.style.getPropertyValue("--tilt");
    item.style.setProperty("--tilt", "0deg");
    void inner.getBoundingClientRect();
    const base = inner.getBoundingClientRect().left;
    const xs = lines.map((el) => el.getBoundingClientRect().left - base);
    if (had) item.style.setProperty("--tilt", had);
    else item.style.removeProperty("--tilt");
    void inner.getBoundingClientRect();
    return xs;
  };

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

  const initLeave = () => {
    const root = document.documentElement;
    if (root.getAttribute("data-page") !== "stage") return;
    const items = [...document.querySelectorAll(".orbit-item")];
    if (!items.length) return;
    let leaving = false;

    const go = (href) => {
      location.href = href;
    };

    const travelFrom = (item) => {
      const href = item.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (leaving) return;
      leaving = true;

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
      }

      if (prefersReducedMotion) {
        go(href);
        return;
      }

      const inner = item.querySelector(".orbit-inner");
      if (!inner) {
        go(href);
        return;
      }

      const lines = [...inner.children];
      const shifts = localOffsets(item, inner, lines);
      const start = originPoint(inner);
      const tilt = tiltOf(item);
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
      travel.style.setProperty("--t0", tilt + "deg");
      travel.appendChild(travelInner);
      item.classList.add("is-travelling");
      document.body.appendChild(travel);
      document.body.classList.add("leaving");

      if (typeof window.__cesAimPlanet === "function") {
        window.__cesAimPlanet(items.indexOf(item));
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => travel.classList.add("go"));
      });
      setTimeout(() => go(href), 300);
    };

    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!item.getAttribute("href")) return;
        e.preventDefault();
        saveCursorPos(e);
        travelFrom(item);
      });
    });

    document.querySelectorAll(".overlay-list a").forEach((a) => {
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const href = a.getAttribute("href");
        const item = items.find((it) => it.getAttribute("href") === href);
        if (!item) return;
        e.preventDefault();
        saveCursorPos(e);
        setMenu(false);
        setTimeout(() => travelFrom(item), 260);
      });
    });
  };

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
      saveCursorPos(e);

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
      }

      if (prefersReducedMotion) {
        location.href = href;
        return true;
      }

      if (targetItem && (barMarker || barPlanet)) {
        document.body.classList.add("bar-slide");

        requestAnimationFrame(() => {
          if (barMarker) barMarker.style.setProperty("--clip", "100%");
          placePlanet(targetItem);
          placeDense(targetItem);
          emphasizeFreq(targetItem);
        });
      }

      document.body.classList.add("leaving-sub");

      setTimeout(() => {
        location.href = href;
      }, 200);
      return true;
    };

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
        if (!otherSub(href)) return;
        e.preventDefault();
        saveCursorPos(e);
        goSub(href, findTarget(href));
      });
    };
    const items = [...document.querySelectorAll(".ib-item")];
    const itemFor = (href) => items.find((it) => it.getAttribute("href") === href) || null;
    items.forEach((it) => bind(it, itemFor));
    document.querySelectorAll(".overlay-list a").forEach((a) => bind(a, itemFor));
  };

  const initBackArrive = () => {
    const root = document.documentElement;
    if (!root.classList.contains("nav-back")) return;
    const no = root.getAttribute("data-back-no");
    const items = [...document.querySelectorAll(".orbit-item")];
    const item =
      items.find((el) => el.getAttribute("data-no") === no) || items[0];
    document.body.classList.add("deco-on");

    const finish = () => {
      document.body.classList.add("stage-back");
      if (typeAboutNow) setTimeout(typeAboutNow, TIMING.aboutTypeBack);
    };

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

    if (window.matchMedia("(max-width: 720px)").matches) {
      finish();
      return;
    }

    const lines = [...inner.children];

    requestAnimationFrame(() => {
      const seam = seamPoint();
      const tilt = tiltOf(item);
      const rad = (tilt * Math.PI) / 180;
      const shifts = localOffsets(item, inner, lines);
      inner.style.transform = `rotate(${-tilt}deg)`;
      lines.forEach((el, i) =>
        el.style.setProperty("--sx", (-shifts[i]).toFixed(2) + "px")
      );
      void inner.getBoundingClientRect();
      const flat = originPoint(inner);
      const sdx = seam.left - flat.left;
      const sdy = seam.top - flat.top;
      const ldx = sdx * Math.cos(rad) + sdy * Math.sin(rad);
      const ldy = -sdx * Math.sin(rad) + sdy * Math.cos(rad);

      inner.style.transform =
        `translate(${ldx.toFixed(2)}px, ${ldy.toFixed(2)}px) rotate(${-tilt}deg)`;
      void inner.getBoundingClientRect();
      root.classList.add("back-ready");

      requestAnimationFrame(() => {
        root.classList.add("back-play");
        inner.style.transform = "";
        lines.forEach((el) => el.style.setProperty("--sx", "0px"));
        finish();
      });
    });
    const glide = 380;
    setTimeout(() => {
      item.classList.remove("is-arriving");
      lines.forEach((el) => el.style.removeProperty("--sx"));

      if (typeof window.__cesReleasePlanet === "function") {
        window.__cesReleasePlanet(items.indexOf(item));
      }
    }, glide + 40);
  };

  const initPlanet = () => {
    const planet = document.querySelector(".orbit-planet");
    const ring = document.querySelector(".orbit-planet-ring");
    const orbit = document.querySelector(".stage-orbit");
    if (!planet || !ring || !orbit) return;
    const items = [...document.querySelectorAll(".orbit-item")];
    const PERIOD = 52000;
    const SNAP = 400;
    const narrow = window.matchMedia("(max-width: 720px)");
    let angle = 0;
    let mode = "free";
    let from = 0;
    let to = 0;
    let snapT = 0;
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

    const itemAngle = (el, i) => {
      const b = el.getBoundingClientRect();
      const x = i < 3 ? b.right : b.left;
      const y = (b.top + b.bottom) / 2;
      return (Math.atan2(x - cx, -(y - cy)) * 180) / Math.PI;
    };

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
      const dt = Math.min(now - last, 100);
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

      if (prefersReducedMotion) {
        mode = "hold";
        return;
      }
      mode = "free";
      kick();
    };

    window.__cesAimPlanet = (i) => {
      const el = items[i];
      if (el) aim(el, i);
    };

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
      el.addEventListener("focus", () => aim(el, i));
      el.addEventListener("blur", release);
    });

    window.addEventListener("resize", () => {
      measure();
      place();
    });
    measure();
    place();
    if (!prefersReducedMotion) kick();
  };
  initPlanet();
  initPageEnter();
  initBarPlanet();
  initBarMarker();
  initBarScale();
  initBarScroll();
  initLeaveBack();
  initLeaveSub();
  const visitStat = initVisit();
  initAboutType(visitStat);
  initLeave();
  initBackArrive();
  if (!hasSplash) initReveal();
})();
