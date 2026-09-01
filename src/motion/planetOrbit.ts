'use client';

/**
 * legacy script.js initPlanet（L1118-1243）逐行移植：
 * 行星沿轨道匀速公转（PERIOD=52000ms），hover/focus 时 400ms easeOut cubic
 * 吸附到目标轨道项；travelTo 时通过 __cesAimPlanet 预吸附，
 * 返场后通过 __cesReleasePlanet 对齐后恢复公转。
 */

const PERIOD = 52000;
const SNAP = 400;

/** 全局挂载点，与 legacy window.__cesAimPlanet / __cesReleasePlanet 对齐 */
declare global {
  interface Window {
    __cesAimPlanet?: (i: number) => void;
    __cesReleasePlanet?: (i: number) => void;
  }
}

export function initPlanetOrbit(): () => void {
  const planet = document.querySelector<HTMLElement>('.orbit-planet');
  const ring = document.querySelector<HTMLElement>('.orbit-planet-ring');
  const orbit = document.querySelector<HTMLElement>('.stage-orbit');
  if (!planet || !ring || !orbit) return () => {};

  const items = Array.from(document.querySelectorAll<HTMLElement>('.orbit-item'));
  const narrow = window.matchMedia('(max-width: 720px)');
  let angle = 0;
  let mode: 'free' | 'snap' | 'hold' = 'free';
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

  const itemAngle = (el: HTMLElement, i: number) => {
    const b = el.getBoundingClientRect();
    const x = i < 3 ? b.right : b.left;
    const y = (b.top + b.bottom) / 2;
    return (Math.atan2(x - cx, -(y - cy)) * 180) / Math.PI;
  };

  const shortest = (a: number, b: number) => {
    const d = ((((b - a) % 360) + 540) % 360) - 180;
    return a + d;
  };

  const place = () => {
    const rad = (angle * Math.PI) / 180;
    const x = Math.sin(rad) * r;
    const y = -Math.cos(rad) * r;
    planet.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
  };

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const frame = (now: number) => {
    const dt = Math.min(now - last, 100);
    last = now;
    if (mode === 'free') {
      angle = (angle + (dt / PERIOD) * 360) % 360;
    } else if (mode === 'snap') {
      snapT += dt;
      const t = Math.min(snapT / SNAP, 1);
      angle = from + (to - from) * easeOut(t);
      if (t >= 1) {
        angle = ((to % 360) + 360) % 360;
        mode = 'hold';
      }
    }
    place();
    raf = mode === 'hold' ? 0 : requestAnimationFrame(frame);
  };

  const kick = () => {
    if (raf || narrow.matches) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const aim = (el: HTMLElement, i: number) => {
    if (narrow.matches) return;
    measure();
    if (!r) return;
    from = angle;
    to = shortest(angle, itemAngle(el, i));
    snapT = 0;
    mode = 'snap';
    kick();
  };

  const release = () => {
    if (narrow.matches) return;
    if (prefersReduced()) {
      mode = 'hold';
      return;
    }
    mode = 'free';
    kick();
  };

  window.__cesAimPlanet = (i: number) => {
    const el = items[i];
    if (el) aim(el, i);
  };

  window.__cesReleasePlanet = (i: number) => {
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
    el.addEventListener('mouseenter', () => aim(el, i));
    el.addEventListener('mouseleave', release);
    el.addEventListener('focus', () => aim(el, i));
    el.addEventListener('blur', release);
  });

  const onResize = () => {
    measure();
    place();
  };
  window.addEventListener('resize', onResize);
  measure();
  place();
  if (!prefersReduced()) kick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    delete window.__cesAimPlanet;
    delete window.__cesReleasePlanet;
  };
}

function prefersReduced(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}