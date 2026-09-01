'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PAGES } from '@/data/pages';
import { writeNavSignal } from '@/motion/TransitionProvider';
import { saveCursorPos } from '@/motion/cursorSignal';

/** 与 legacy script.js initBarPlanet 一致：7×7 像素行星，三色由 CSS 变量提供 */
const PLANET_SVG = (
  <svg viewBox="0 0 7 7" width="16" height="16" focusable="false" aria-hidden="true">
    <g fill="var(--planet-1)">
      <rect x="2" y="0" width="2" height="1" />
      <rect x="1" y="1" width="2" height="1" />
      <rect x="0" y="2" width="2" height="1" />
      <rect x="0" y="3" width="1" height="1" />
    </g>
    <g fill="var(--planet-2)">
      <rect x="4" y="0" width="1" height="1" />
      <rect x="3" y="1" width="2" height="1" />
      <rect x="2" y="2" width="3" height="1" />
      <rect x="1" y="3" width="3" height="1" />
      <rect x="1" y="4" width="2" height="1" />
      <rect x="2" y="5" width="1" height="1" />
    </g>
    <g fill="var(--planet-3)">
      <rect x="5" y="1" width="1" height="1" />
      <rect x="5" y="2" width="2" height="1" />
      <rect x="4" y="3" width="3" height="1" />
      <rect x="3" y="4" width="3" height="1" />
      <rect x="3" y="5" width="2" height="1" />
      <rect x="2" y="6" width="3" height="1" />
    </g>
  </svg>
);

const PLANET_SIZE = 16;
const PLANET_GAP = 5;

/** 取元素相对 .ib-track 的本地坐标（含 track 滚动偏移） */
function localBox(el: HTMLElement) {
  const track = el.closest('.ib-track') as HTMLElement;
  const tb = track.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  return { left: b.left - tb.left + track.scrollLeft, width: b.width };
}

export default function IndexBar() {
  const pathname = usePathname();
  const router = useRouter();
  const markerRef = useRef<HTMLElement>(null);
  const planetRef = useRef<HTMLSpanElement>(null);
  const denseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = document.querySelector('.ib-track') as HTMLElement | null;
    const current = track?.querySelector<HTMLElement>('.ib-item.is-current') ?? null;
    if (!track || !current) return;

    const marker = markerRef.current;
    const planet = planetRef.current;
    const dense = denseRef.current;

    const placePlanet = (item: HTMLElement) => {
      if (!planet) return;
      const box = localBox(item);
      const prev = item.previousElementSibling as HTMLElement | null;
      const prevRight =
        prev && prev.classList.contains('ib-item') ? localBox(prev).left + localBox(prev).width : 0;
      const want = box.left - PLANET_SIZE - PLANET_GAP;
      const px = Math.max(prevRight, want);
      planet.style.setProperty('--px', Math.max(0, px).toFixed(2) + 'px');
    };

    const placeMarker = (item: HTMLElement) => {
      if (!marker) return;
      const box = localBox(item);
      marker.style.setProperty('--mx', box.left.toFixed(2) + 'px');
      marker.style.setProperty('--mw', box.width.toFixed(2) + 'px');
    };

    const placeDense = (item: HTMLElement) => {
      if (!dense) return;
      const box = localBox(item);
      dense.style.setProperty('--dx', box.left.toFixed(2) + 'px');
      dense.style.setProperty('--dw', box.width.toFixed(2) + 'px');
    };

    const placeBoth = (item: HTMLElement) => {
      placeMarker(item);
      placePlanet(item);
      placeDense(item);
    };

    placeBoth(current);

    // 双 rAF 后就绪：marker 播放 clip 展开动画，planet 淡入
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        marker?.classList.add('is-ready');
        planet?.classList.add('is-ready');
        marker?.style.setProperty('--clip', '0%');
      });
    });

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(
        () => placeBoth(track.querySelector<HTMLElement>('.ib-item.is-current') ?? current),
        120,
      );
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      window.removeEventListener('resize', onResize);
    };
  }, [pathname]);

  // legacy initBarScroll：向下滚动超过 80px 隐藏 index-bar，向上滚回顶部恢复
  useEffect(() => {
    const THRESHOLD = 8;
    const TOP_ZONE = 80;
    let last = window.scrollY;
    let ticking = false;

    const apply = () => {
      const y = window.scrollY;
      const dy = y - last;
      if (y <= TOP_ZONE) {
        document.body.classList.remove('bar-hidden');
        last = y;
      } else if (Math.abs(dy) > THRESHOLD) {
        document.body.classList.toggle('bar-hidden', dy > 0);
        last = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('bar-hidden');
    };
  }, []);

  // legacy initLeaveSub：点击其他子页时写 sub-sub 信号并强调目标频率（is-target）
  const goSub = (slug: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const root = document.documentElement;
    if (root.getAttribute('data-page') !== 'sub') return;
    if (slug === root.getAttribute('data-slug')) return;
    saveCursorPos(e);
    e.preventDefault();
    runGoSub(e.currentTarget.getAttribute('href') ?? '/', slug, e.currentTarget);
  };

  // legacy goSub 主体：信号 + bar-slide + 目标 --clip 展开 + planet/dense 平移 + is-target + leaving-sub + 200ms
  const runGoSub = (href: string, slug: string, targetItem: HTMLElement | null) => {
    const root = document.documentElement;
    if (root.getAttribute('data-page') !== 'sub') return;
    if (slug === root.getAttribute('data-slug')) return;
    writeNavSignal({ from: 'sub-sub', slug });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(href);
      return;
    }

    if (targetItem) {
      document.body.classList.add('bar-slide');
      requestAnimationFrame(() => {
        markerRef.current?.style.setProperty('--clip', '100%');
        const planet = planetRef.current;
        const dense = denseRef.current;
        if (planet) {
          const box = localBox(targetItem);
          planet.style.setProperty('--px', Math.max(0, box.left - PLANET_SIZE - PLANET_GAP).toFixed(2) + 'px');
        }
        if (dense) {
          const box = localBox(targetItem);
          dense.style.setProperty('--dx', box.left.toFixed(2) + 'px');
          dense.style.setProperty('--dw', box.width.toFixed(2) + 'px');
        }
        document.querySelectorAll('.ib-item.is-target').forEach((el) => el.classList.remove('is-target'));
        targetItem.classList.add('is-target');
        document.body.classList.add('leaving-sub');
      });
    } else {
      document.body.classList.add('leaving-sub');
    }

    window.setTimeout(() => router.push(href), 200);
  };

  // overlay 菜单点击其他子页时由 SiteChrome 派发，IndexBar 内部状态在此完成位移动画
  useEffect(() => {
    const onLeaveSub = (e: Event) => {
      const detail = (e as CustomEvent<{ slug: string }>).detail;
      if (!detail) return;
      const item = document.querySelector<HTMLElement>(
        `.ib-item[data-slug="${detail.slug}"]`,
      );
      runGoSub(`/${detail.slug}`, detail.slug, item);
    };
    window.addEventListener('ces:leave-sub', onLeaveSub);
    return () => window.removeEventListener('ces:leave-sub', onLeaveSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className="index-bar" aria-label="分区索引">
      <div className="ib-scroll">
        <div className="ib-track">
          {PAGES.map((page) => {
            const active = pathname === page.canonicalPath || pathname === page.canonicalPath.replace(/\/$/, '');
            return active ? (
              <span
                key={page.slug}
                className="ib-item is-current"
                data-slug={page.slug}
                aria-current="page"
              >
                <span className="ib-no">{page.no}</span>
                <span className="ib-title">{page.title}</span>
                <span className="ib-freq" aria-hidden="true">
                  {page.freq}
                </span>
              </span>
            ) : (
              <Link
                key={page.slug}
                href={page.canonicalPath}
                className="ib-item"
                data-slug={page.slug}
                onClick={goSub(page.slug)}
              >
                <span className="ib-no">{page.no}</span>
                <span className="ib-title">{page.title}</span>
                <span className="ib-freq" aria-hidden="true">
                  {page.freq}
                </span>
              </Link>
            );
          })}
          <div className="ib-scale" aria-hidden="true">
            <div className="ib-scale-dense" ref={denseRef} />
          </div>
          <i className="ib-marker" ref={markerRef} aria-hidden="true" />
          <span className="ib-planet" ref={planetRef} aria-hidden="true">
            {PLANET_SVG}
          </span>
        </div>
      </div>
    </nav>
  );
}