'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { PAGES } from '@/data/pages';
import { BRAND } from '@/data/site';
import { gsap, useGSAP, prefersReducedMotion } from '@/motion/gsap';
import { trackDwell } from '@/motion/visit';
import { useTransition } from '@/motion/TransitionProvider';
import { initPlanetOrbit } from '@/motion/planetOrbit';
import { saveCursorPos } from '@/motion/cursorSignal';
import { localOffsets, originPoint, seamPoint, tiltOf } from '@/motion/stageGeometry';
import OrbitPlanet from './OrbitPlanet';
import StageAbout from './StageAbout';
import StageDeco from './StageDeco';
import Clock from './Clock';

/** 环形扫描时长与起始延迟，与 stage.css 的 --sweep / --sweep-start 对齐 */
const SWEEP = 1.1;
const SWEEP_START = 0.1;
/** legacy initBackArrive 的 glide=380ms：返场滑入时长，与 stage.css 的 --back-glide 对齐 */
const BACK_GLIDE = 380;

export default function Stage({ ready }: { ready: boolean }) {
  const scope = useRef<HTMLElement>(null);
  const { travelTo } = useTransition();

  // legacy initVisit 的可见停留时长统计（localStorage dwell 累加）
  useEffect(() => trackDwell(), []);

  // legacy initPlanet：行星公转 + hover 吸附（travelTo 离场经 __cesAimPlanet 预吸附）
  useEffect(() => initPlanetOrbit(), []);

  // legacy initBackArrive（script.js L1045-1116）1:1 移植：
  // 几何飞回全部走 stage.css 的 nav-back 相位链，GSAP 不参与返场
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('nav-back')) return;

    // SPA 残留清理：legacy 整页刷新天然不携带子页离场相位
    document.body.classList.remove('leaving-back', 'leaving-sub', 'bar-slide', 'leaving');

    const no = root.getAttribute('data-back-no');
    const items = Array.from(document.querySelectorAll<HTMLElement>('.orbit-item'));
    const item = items.find((el) => el.getAttribute('data-no') === no) || items[0];
    document.body.classList.add('deco-on');

    const finish = () => {
      document.body.classList.add('stage-back');
      // typeAboutNow 由 StageAbout 依 data-back-no 以 820ms 延迟承接
    };

    if (!item || prefersReducedMotion()) {
      finish();
      return;
    }

    const inner = item.querySelector<HTMLElement>('.orbit-inner');
    if (!inner) {
      finish();
      return;
    }

    item.classList.add('is-arriving');

    if (window.matchMedia('(max-width: 720px)').matches) {
      finish();
      return;
    }

    const lines = Array.from(inner.children) as HTMLElement[];
    let raf1 = 0;
    let raf2 = 0;

    // glide+40ms 后摘除 is-arriving，行星对齐后恢复公转
    const glideTimer = window.setTimeout(() => {
      item.classList.remove('is-arriving');
      lines.forEach((el) => el.style.removeProperty('--sx'));
      if (typeof window.__cesReleasePlanet === 'function') {
        window.__cesReleasePlanet(items.indexOf(item));
      }
    }, BACK_GLIDE + 40);

    raf1 = requestAnimationFrame(() => {
      const seam = seamPoint();
      const tilt = tiltOf(item);
      const rad = (tilt * Math.PI) / 180;
      const shifts = localOffsets(item, inner, lines);

      // 反 tilt 归零 + 行内 --sx 抵消偏移，令标题行贴合分割线起点
      inner.style.transform = `rotate(${-tilt}deg)`;
      lines.forEach((el, i) => el.style.setProperty('--sx', `${(-shifts[i]).toFixed(2)}px`));
      void inner.getBoundingClientRect();

      // 原点平移到分割线接缝（含 rotate 换算），落点即 legacy seam
      const flat = originPoint(inner);
      const sdx = seam.left - flat.left;
      const sdy = seam.top - flat.top;
      const ldx = sdx * Math.cos(rad) + sdy * Math.sin(rad);
      const ldy = -sdx * Math.sin(rad) + sdy * Math.cos(rad);

      inner.style.transform = `translate(${ldx.toFixed(2)}px, ${ldy.toFixed(2)}px) rotate(${-tilt}deg)`;
      void inner.getBoundingClientRect();
      root.classList.add('back-ready');

      raf2 = requestAnimationFrame(() => {
        root.classList.add('back-play');
        inner.style.transform = '';
        lines.forEach((el) => el.style.setProperty('--sx', '0px'));
        finish();
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(glideTimer);
      item.classList.remove('is-arriving');
      inner.style.transform = '';
      document.body.classList.remove('stage-back', 'deco-on');
      root.classList.remove('nav-back', 'back-ready', 'back-play');
      root.removeAttribute('data-back-no');
    };
  }, []);

  useGSAP(
    () => {
      if (!ready) return;
      // 返场（html.nav-back）由 CSS 相位链 + 上方 runBackArrive 接管，GSAP 不参与
      if (document.documentElement.classList.contains('nav-back')) return;

      const ring = '.orbit-ring';
      const path = '.orbit-ring-path';
      const ticks = '.orbit-ticks';
      const planetRing = '.orbit-planet-ring';
      const planet = '.orbit-planet';
      const inners = gsap.utils.toArray<HTMLElement>('.orbit-inner');
      const logoName = '.stage-logo-name';
      const about = '.stage-about';
      const foot = '.stage-foot';
      const lines = '.sf-line';

      if (prefersReducedMotion()) {
        gsap.set(ring, { opacity: 0.15 });
        gsap.set(path, { strokeDashoffset: 0 });
        gsap.set(ticks, { opacity: 0.3 });
        gsap.set(planetRing, { opacity: 0.1 });
        gsap.set([planet, logoName, about, foot], { opacity: 1 });
        gsap.set(inners, { opacity: 1, y: 0 });
        gsap.set(lines, { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(ring, { opacity: 0.15, duration: 1 }, 0)
        .to(path, { strokeDashoffset: 0, duration: SWEEP, ease: 'none' }, SWEEP_START)
        .to(planetRing, { opacity: 0.1, duration: 1 }, SWEEP_START + SWEEP * 0.9)
        .to(ticks, { opacity: 0.3, duration: 1 }, SWEEP_START + SWEEP)
        .to(planet, { opacity: 1, duration: 1 }, SWEEP_START + SWEEP + 0.1)
        .to(
          inners,
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.23 },
          SWEEP_START + SWEEP * 0.35,
        )
        .to(logoName, { opacity: 1, duration: 0.8 }, SWEEP_START + SWEEP * 0.55)
        .to(about, { opacity: 1, duration: 0.8 }, 0.7)
        .to(foot, { opacity: 1, duration: 0.8 }, SWEEP_START + SWEEP * 0.85)
        .to(lines, { scaleX: 1, duration: 0.9 }, SWEEP_START + SWEEP * 0.9);
    },
    { scope, dependencies: [ready] },
  );

  return (
    <section className="stage" ref={scope} id="stage">
      <StageDeco />

      <div className="stage-orbit">
        <svg className="orbit-ring" focusable="false" aria-hidden="true">
          <circle className="orbit-ring-path" pathLength={1} />
        </svg>
        <span className="orbit-ticks" aria-hidden="true" />

        <span className="orbit-planet-ring" aria-hidden="true" />
        <OrbitPlanet />

        <div className="stage-logo-wrap">
          {/* 尺寸与 legacy 一致，由 CSS 控制显示宽度，故不用 next/image 的布局接管 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="stage-logo"
            src="/assets/logo.png"
            alt={BRAND.name}
            width={1000}
            height={1000}
          />
          <span className="stage-logo-name">{BRAND.name}</span>
        </div>

        {PAGES.map((page) => (
          <Link
            key={page.slug}
            className={`orbit-item pos-${page.pos}`}
            href={page.canonicalPath}
            data-no={page.no}
            data-slug={page.slug}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              const title = e.currentTarget.querySelector<HTMLElement>('.orbit-title');
              if (!title) return;
              e.preventDefault();
              saveCursorPos(e);
              travelTo(page.canonicalPath, title, { no: page.no, slug: page.slug });
            }}
          >
            <span className="orbit-inner">
              <span className="orbit-no">{page.no}</span>
              <span className="orbit-title">{page.title}</span>
              <span className="orbit-sub">{page.sub}</span>
            </span>
          </Link>
        ))}
      </div>

      <StageAbout active={ready} />

      <div className="stage-foot" aria-hidden="true">
        <i className="sf-line" />
        <span className="sf-text">
          <span className="sf-seg">SYCYW</span>
          <span className="sf-dot">·</span>
          <Clock className="sf-seg sf-clock clock" />
          <span className="sf-dot">·</span>
          <span className="sf-seg">31.23N&nbsp;121.47E</span>
        </span>
        <i className="sf-line" />
      </div>
    </section>
  );
}