'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { PageMeta } from '@/data/pages';
import { takeNavSignal } from '@/motion/TransitionProvider';
import { trackVisit } from '@/motion/visit';
import IndexBar from './IndexBar';
import SiteFooter from './SiteFooter';

type PageShellProps = {
  page: PageMeta;
  /** 附加到 .page-body 的变体类名（如 about 页的 about-body） */
  bodyClass?: string;
  children: ReactNode;
};

/**
 * 子页入场机制与 legacy nav-signal.html 对齐：
 * 1. html 立即挂 js-enter（CSS 将标题/索引/正文压至初态）；
 * 2. 读取 sessionStorage 中的 ces-nav 信号（由首页/子页离场前写入），
 *    from=stage 附加 nav-enter（.travel 飞行落位后快速序列），
 *    from=sub-sub 附加 nav-sub（子页间切换序列）；
 * 3. 双 rAF 后挂 page-ready 播放入场序列（legacy initPageEnter）。
 */
export default function PageShell({ page, bodyClass, children }: PageShellProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // legacy nav-signal：data-page / data-slug 标识 + js-enter / nav-* / page-ready
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-page', 'sub');
    root.setAttribute('data-slug', page.slug);
    root.classList.add('js-enter');

    const sig = takeNavSignal();
    if (sig && sig.slug === page.slug) {
      if (sig.from === 'stage') root.classList.add('nav-enter');
      else if (sig.from === 'sub-sub') root.classList.add('nav-sub');
    }

    // legacy initVisit：会话/访问统计（seen 累计决定 about 文案）
    trackVisit(page.slug, false);

    // legacy initPageEnter（script.js L648-655）：双 rAF 挂 page-ready
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => root.classList.add('page-ready'));
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      // SPA 残留清理：legacy 整页刷新天然不携带这些相位
      root.classList.remove('js-enter', 'nav-enter', 'nav-sub', 'page-ready');
      document.body.classList.remove('leaving', 'leaving-back', 'leaving-sub', 'bar-slide');
      document.querySelectorAll('.travel').forEach((el) => el.remove());
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    };
  }, [page.slug]);

  // 滚动恢复：legacy 子页使用 history.scrollRestoration = manual
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <IndexBar />
      <main className="page-main" id="top">
        <header className="page-title" id="pageTitle">
          <span className="pt-no">{page.no}</span>
          <h1 className="pt-name" ref={titleRef}>
            {page.title}
          </h1>
          <span className="pt-sub">{page.sub}</span>
        </header>

        <p className="page-desc reveal-line">{page.desc}</p>

        <section className={bodyClass ? `page-body ${bodyClass}` : 'page-body'}>
          {children}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}