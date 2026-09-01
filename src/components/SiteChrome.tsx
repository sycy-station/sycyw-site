'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { PAGES } from '@/data/pages';
import { BRAND } from '@/data/site';
import { useTransition } from '@/motion/TransitionProvider';
import { saveCursorPos } from '@/motion/cursorSignal';
import Cursor from './Cursor';
import Clock from './Clock';

const THEME_KEY = 'ces-theme';

/** 主题状态订阅器：localStorage 值 + 跨标签 storage 事件 */
const themeListeners = new Set<() => void>();
function notifyThemeChange() {
  themeListeners.forEach((listener) => listener());
}

/** 订阅系统深浅色变化 */
function useSystemDark(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    () => false,
  );
}

/** 读取用户显式选择的主题（legacy localStorage ces-theme） */
function useStoredTheme(): 'light' | 'dark' | null {
  return useSyncExternalStore(
    (onChange) => {
      themeListeners.add(onChange);
      window.addEventListener('storage', onChange);
      return () => {
        themeListeners.delete(onChange);
        window.removeEventListener('storage', onChange);
      };
    },
    () => {
      try {
        const saved = localStorage.getItem(THEME_KEY);
        return saved === 'dark' || saved === 'light' ? saved : null;
      } catch {
        return null;
      }
    },
    () => null,
  );
}

export default function SiteChrome() {
  const [open, setOpen] = useState(false);
  const systemDark = useSystemDark();
  const storedTheme = useStoredTheme();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const { travelTo, leaveBack } = useTransition();

  // legacy initLeave/travelFrom 的 overlay 入口：首页点 overlay 项 → 对应轨道项飞行
  const travelFromOverlay = (slug: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    const root = document.documentElement;
    if (root.getAttribute('data-page') !== 'stage') return;
    const item = document.querySelector<HTMLElement>(`.orbit-item[data-slug="${slug}"]`);
    if (!item) return;
    saveCursorPos(e);
    setOpen(false);
    toggleRef.current?.focus();
    // legacy：菜单收起后 260ms 再起飞
    window.setTimeout(() => {
      const title = item.querySelector<HTMLElement>('.orbit-title') ?? item;
      travelTo(item.getAttribute('href') ?? '/', title, {
        no: item.getAttribute('data-no') ?? undefined,
        slug,
      });
    }, 260);
  };

  // legacy initLeaveSub 的 overlay 入口：子页点其他子页 → goSub
  const goSubFromOverlay = (slug: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    saveCursorPos(e);
    setOpen(false);
    toggleRef.current?.focus();
    window.dispatchEvent(new CustomEvent('ces:leave-sub', { detail: { slug } }));
  };

  useEffect(() => {
    // 挂载时应用已保存的主题（仅 DOM 副作用，状态由 useStoredTheme 提供）
    if (storedTheme) document.documentElement.setAttribute('data-theme', storedTheme);
    document.body.classList.add('has-theme-toggle');
  }, [storedTheme]);

  const dark = storedTheme !== null ? storedTheme === 'dark' : systemDark;

  useEffect(() => {
    if (!open) return;
    const nav = navRef.current;
    const first = nav?.querySelector<HTMLAnchorElement>('a');
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !nav) return;
      const focusables = [
        ...nav.querySelectorAll<HTMLElement>('a'),
        ...document.querySelectorAll<HTMLElement>('.header-actions button'),
      ];
      if (!focusables.length) return;
      const edge = e.shiftKey ? focusables[0] : focusables[focusables.length - 1];
      if (document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? focusables[focusables.length - 1] : focusables[0]).focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const switchTheme = () => {
    const root = document.documentElement;
    const next = dark ? 'light' : 'dark';
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 450);
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* 隐私模式下忽略 */
    }
    notifyThemeChange();
  };

  // legacy initLeaveBack：子页点 mark 返回首页（写 sub 信号 + leaving-back + 300ms 后跳转）
  // 首页据此跳过 splash 播返场；slug 取 html data-slug（legacy root.getAttribute("data-slug")）
  const onMarkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const root = document.documentElement;
    if (root.getAttribute('data-page') !== 'sub') return;
    e.preventDefault();
    saveCursorPos(e);
    leaveBack(root.getAttribute('data-slug') ?? 'home');
  };

  // legacy：overlay 在首页走 travelFrom（260ms 后起飞）、在子页走 goSub，两者互斥
  const onNavClick = (slug: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const root = document.documentElement;
    if (root.getAttribute('data-page') === 'stage') {
      travelFromOverlay(slug, e);
      return;
    }
    const here = root.getAttribute('data-slug');
    if (slug === here) {
      // 点当前页：仅收起菜单
      setOpen(false);
      toggleRef.current?.focus();
      return;
    }
    goSubFromOverlay(slug, e);
  };

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <Cursor />

      <header className="site-header">
        <Link className="mark" href="/" onClick={onMarkClick}>
          <span>{BRAND.name}</span>
          <span className="mark-dot">·</span>
        </Link>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={switchTheme}
            aria-label={dark ? '切换浅色模式' : '切换深色模式'}
            aria-pressed={dark}
          >
            <i aria-hidden="true" />
          </button>
          <button
            className="menu-toggle"
            ref={toggleRef}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
          >
            <span />
          </button>
        </div>
      </header>

      <nav
        className={`overlay-nav${open ? ' open' : ''}`}
        ref={navRef}
        aria-hidden={!open}
        aria-label="主导航"
      >
        <ol className="overlay-list">
          {PAGES.map((page) => (
            <li key={page.slug}>
              <Link
                href={page.canonicalPath}
                data-index={page.no}
                tabIndex={open ? undefined : -1}
                onClick={onNavClick(page.slug)}
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ol>
        <div className="overlay-foot">
          <Clock />
          <span>Shanghai, CN</span>
        </div>
      </nav>
    </>
  );
}
