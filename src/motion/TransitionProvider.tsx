'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { prefersReducedMotion } from './gsap';
import { localOffsets, originPoint, tiltOf } from './stageGeometry';

type TransitionCtx = {
  /** legacy initLeave/travelFrom：首页轨道项点击 → .travel 飞行 + 信号 + 300ms 后跳转 */
  travelTo: (href: string, el: HTMLElement, meta?: { no?: string; slug?: string }) => void;
  /** legacy initLeaveBack：子页点 mark 返回首页 → leaving-back + 300ms 后跳转 */
  leaveBack: (slug: string) => void;
  /** legacy initLeaveSub/goSub：子页间切换 → bar-slide/--clip/leaving-sub + 200ms 后跳转 */
  leaveSub: (href: string, slug: string) => void;
};

const Ctx = createContext<TransitionCtx | null>(null);

export function useTransition() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTransition 必须在 TransitionProvider 内使用');
  return ctx;
}

/** sessionStorage 信号有效期，与 legacy 一致（2500ms） */
export const NAV_SIGNAL_AGE = 2500;

export type NavSignal = {
  from: 'stage' | 'sub' | 'sub-sub';
  slug: string;
  no?: string;
  ts: number;
};

/** legacy initLeave/travelFrom：离场前写入 sessionStorage 信号 */
export function writeNavSignal(signal: Omit<NavSignal, 'ts'>) {
  try {
    sessionStorage.setItem('ces-nav', JSON.stringify({ ...signal, ts: Date.now() }));
  } catch {
    /* 隐私模式下忽略 */
  }
}

/** 读取并消费信号（读即删），过期返回 null */
export function takeNavSignal(): NavSignal | null {
  try {
    const raw = sessionStorage.getItem('ces-nav');
    if (!raw) return null;
    sessionStorage.removeItem('ces-nav');
    const sig = JSON.parse(raw) as NavSignal;
    const age = Date.now() - (sig.ts ?? 0);
    if (age < 0 || age > NAV_SIGNAL_AGE) return null;
    return sig;
  } catch {
    return null;
  }
}

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const travelTo = useCallback(
    (href: string, el: HTMLElement, meta?: { no?: string; slug?: string }) => {
      const root = document.documentElement;
      const item = el.closest<HTMLElement>('.orbit-item') ?? el;
      const items = Array.from(document.querySelectorAll<HTMLElement>('.orbit-item'));
      const inner = item.querySelector<HTMLElement>('.orbit-inner');
      const slug = meta?.slug ?? href.replace(/^\/|\/$/g, '').split('/')[0];

      writeNavSignal({ from: 'stage', slug, no: meta?.no });

      // 清理上一次返场残留（legacy 为整页刷新天然无残留）
      root.classList.remove('nav-back', 'back-ready', 'back-play');
      root.removeAttribute('data-back-no');
      document.body.classList.remove('stage-back', 'deco-on');

      if (prefersReducedMotion() || !inner) {
        router.push(href);
        return;
      }

      // legacy travelFrom：clone orbit-inner → .travel 容器（起点/tilt CSS 变量）→ 双 rAF .go → 300ms 跳转
      const lines = Array.from(inner.children) as HTMLElement[];
      const shifts = localOffsets(item, inner, lines);
      const start = originPoint(inner);
      const tilt = tiltOf(item);
      const travelInner = inner.cloneNode(true) as HTMLElement;
      travelInner.className = 'travel-inner';
      travelInner.querySelectorAll<HTMLElement>(':scope > *').forEach((child, i) => {
        child.style.setProperty('--sx', `${shifts[i].toFixed(2)}px`);
      });
      const travel = document.createElement('div');
      travel.className = 'travel';
      travel.setAttribute('aria-hidden', 'true');
      travel.style.setProperty('--sx0', `${start.left.toFixed(2)}px`);
      travel.style.setProperty('--sy0', `${start.top.toFixed(2)}px`);
      travel.style.setProperty('--t0', `${tilt}deg`);
      travel.appendChild(travelInner);
      item.classList.add('is-travelling');
      document.body.appendChild(travel);
      document.body.classList.add('leaving');

      if (typeof window.__cesAimPlanet === 'function') {
        window.__cesAimPlanet(items.indexOf(item));
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => travel.classList.add('go'));
      });
      window.setTimeout(() => router.push(href), 300);
    },
    [router],
  );

  const leaveBack = useCallback(
    (slug: string) => {
      const root = document.documentElement;
      if (root.getAttribute('data-page') !== 'sub') return;
      const no = document.querySelector<HTMLElement>('.ib-item.is-current .ib-no')?.textContent ?? '';
      writeNavSignal({ from: 'sub', slug, no });

      // legacy 由 index.html head 内 nav-signal-home 脚本在首帧前挂 html.nav-back；
      // SPA 客户端导航不会重跑 head 脚本，故这里在跳转前直接挂上
      root.classList.add('nav-back');
      root.setAttribute('data-back-no', no);

      if (prefersReducedMotion()) {
        router.push('/');
        return;
      }

      // legacy initLeaveBack：leaving-back 相位 300ms 后跳转
      document.body.classList.add('leaving-back');
      window.setTimeout(() => router.push('/'), 300);
    },
    [router],
  );

  const leaveSub = useCallback(
    (href: string, slug: string) => {
      const root = document.documentElement;
      if (root.getAttribute('data-page') !== 'sub') return;
      if (slug === root.getAttribute('data-slug')) return;
      writeNavSignal({ from: 'sub-sub', slug });

      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }

      // legacy initLeaveSub/goSub：bar-slide + 目标 --clip 展开 + planet/dense 平移 + 强调频率 + leaving-sub 200ms。
      // planet/dense/is-target 的实际平移由 IndexBar 监听 ces:leave-sub 事件完成（组件内部状态在 Provider 不可达）。
      document.body.classList.add('bar-slide');
      requestAnimationFrame(() => {
        const marker = document.querySelector<HTMLElement>('.ib-marker');
        marker?.style.setProperty('--clip', '100%');
        window.dispatchEvent(new CustomEvent('ces:leave-sub', { detail: { slug } }));
        document.body.classList.add('leaving-sub');
      });
      window.setTimeout(() => router.push(href), 200);
    },
    [router],
  );

  const value = useMemo(() => ({ travelTo, leaveBack, leaveSub }), [travelTo, leaveBack, leaveSub]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}