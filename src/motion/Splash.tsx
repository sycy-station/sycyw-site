'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './gsap';

/**
 * legacy 首页开场的完整还原。
 *
 * 结构与 legacy index.html #splash 完全同构：
 *   splash-bg → wide 网格 → splash-grid → splash-frame → 双 splash-rule
 *   → hud 四角 → splash-content（双 side + logo+reticle + 双 panel + meta + statusbar）
 *
 * 时序与 legacy script.js runSplash 一致，全部交给 CSS 相位 class 驱动：
 *   phase-logo → phase-name → phase-code → phase-expand → leave
 * React 只负责按 TIMING 切换 class；所有视觉过渡（字符延迟、panel 条、
 * statusbar 分段等）均由 style.css 中已迁移的 #splash.phase-* 规则承担。
 */

/** legacy TIMING 常量表（ms） */
const T = {
  nameDelay: 800,
  codeDelay: 950,
  charSpeed: 20,
  lineGap: 150,
  expandDelay: 320,
  holdExpanded: 1750,
  skipGrow: 340,
  handoffOverlap: 290,
  dissolve: 620,
  logoReadyMaxWait: 2500,
} as const;

const SP_PHASES = ['sp-logo', 'sp-name', 'sp-code', 'sp-expand', 'sp-leave'] as const;

/** legacy codeLines：打字代码 4 行 */
const CODE_LINES = [
  "studio.init({ mode: 'minimal' });",
  "palette(['#0a0a0a', '#f4f3ef']);",
  'render(document.body);',
  '// less, but better.',
];

/** 与 legacy 完全一致的相位切换：#splash.phase-* + body.sp-*（expand 附加 deco-on） */
function setPhase(splash: HTMLElement, name: string) {
  if (name) splash.classList.add(`phase-${name}`);
  document.body.classList.remove(...SP_PHASES);
  document.body.classList.add(`sp-${name}`);
  if (name === 'expand') document.body.classList.add('deco-on');
}

/** 双 panel 的内容数据（legacy 静态文案） */
const PANELS = [
  {
    side: 'left',
    rail: { seq: 'SEQ-0417' },
    label: 'SPEC\u00a0/\u00a001',
    bars: [78, 54, 91, 36, 67],
    read: [
      { k: 'CELL', v: '0417' },
      { k: 'FLUX', v: '2.31' },
      { k: 'TEMP', v: '036' },
    ],
    foot: 'GRID\u00a0LOCK\u00a0·\u00a0OK',
  },
  {
    side: 'right',
    rail: { seq: 'REV-2.31' },
    label: 'SPEC\u00a0/\u00a002',
    bars: [62, 88, 44, 73, 29],
    read: [
      { k: 'NODE', v: '08' },
      { k: 'GAIN', v: '1.04' },
      { k: 'DRIFT', v: '000' },
    ],
    foot: 'CELL\u00a0ARRAY\u00a0·\u00a0OK',
  },
] as const;

/** statusbar 六列数据 */
const SB_COLS = [
  { k: 'CELL', v: '0417' },
  { k: 'FLUX', v: '2.31' },
  { k: 'NODE', v: '08' },
  { k: 'GAIN', v: '1.04' },
  { k: 'TEMP', v: '036' },
  { k: 'DRIFT', v: '000' },
] as const;

export default function Splash({ onDone }: { onDone: () => void }) {
  const scope = useRef<HTMLDivElement>(null);
  // 供 HUD/打字层等命令式定位的句柄
  const hudStatusRef = useRef<HTMLSpanElement>(null);
  const hudSeqRef = useRef<HTMLSpanElement>(null);
  const hudPctRef = useRef<HTMLSpanElement>(null);
  const hudBarRef = useRef<HTMLElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  // onDone 存入 ref，避免父组件 setReady 触发重渲染导致时序 effect 重跑
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const splash = scope.current;
    if (!splash) return;

    // legacy hasSplash（script.js L85）：nav-back 返场时 splash 整体不参与，
    // CSS `html.nav-back .splash { display:none }` 直接隐藏，这里立即交接 Stage
    const isNavBack = document.documentElement.classList.contains('nav-back');
    if (isNavBack) {
      document.body.classList.remove('loading');
      doneRef.current();
      return;
    }

    let finished = false;
    let splashDone = false;
    let skipping = false;
    const timers = new Set<number>();
    let seqTimer: number | null = null;

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
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

    // ---- HUD ----
    const setHud = (status: string, pct: number) => {
      if (hudStatusRef.current && status) {
        const el = hudStatusRef.current;
        el.textContent = status;
        el.classList.remove('flick');
        void el.offsetWidth;
        el.classList.add('flick');
      }
      if (typeof pct === 'number') {
        if (hudPctRef.current) hudPctRef.current.textContent = String(pct).padStart(3, '0');
        if (hudBarRef.current) hudBarRef.current.style.width = `${pct}%`;
      }
    };
    const startSeq = () => {
      if (prefersReducedMotion() || !hudSeqRef.current) return;
      seqTimer = window.setInterval(() => {
        const v = Math.floor(Math.random() * 0xffff)
          .toString(16)
          .toUpperCase()
          .padStart(4, '0');
        if (hudSeqRef.current) hudSeqRef.current.textContent = `0x${v}`;
      }, 90);
    };
    const lockSeq = () => {
      if (seqTimer !== null) {
        window.clearInterval(seqTimer);
        seqTimer = null;
      }
      if (hudSeqRef.current) hudSeqRef.current.textContent = '0xFFFF';
    };

    // ---- 打字代码 ----
    const codeContainer = codeRef.current;
    const typeLines = (lineIndex = 0) => {
      if (splashDone || !codeContainer) return;

      if (lineIndex >= CODE_LINES.length) {
        later(expandLogo, T.expandDelay);
        return;
      }

      const lineEl = document.createElement('span');
      lineEl.className = 'code-line active';
      codeContainer.appendChild(lineEl);
      const textNode = document.createTextNode('');
      const cursorEl = document.createElement('span');
      cursorEl.className = 'code-cursor';
      cursorEl.textContent = '_';
      lineEl.appendChild(textNode);
      lineEl.appendChild(cursorEl);
      const text = CODE_LINES[lineIndex];
      let charIndex = 0;

      const typeChar = () => {
        if (splashDone) return;
        if (charIndex <= text.length) {
          textNode.textContent = text.slice(0, charIndex);
          charIndex += 1;
          later(typeChar, T.charSpeed);
        } else {
          lineEl.classList.remove('active');
          later(() => typeLines(lineIndex + 1), T.lineGap);
        }
      };
      typeChar();
    };

    // ---- 相位推进 / 收尾 ----
    const expandLogo = () => {
      if (splashDone) return;
      setPhase(splash, 'expand');
      lockSeq();
      setHud('READY', 100);
      later(leaveSplash, T.holdExpanded);
    };

    const finishSplash = () => {
      if (finished) return;
      finished = true;
      splash.style.display = 'none';
      document.body.classList.add('stage-in');
      document.body.classList.add('deco-on');
      doneRef.current();
    };

    const dissolve = () => {
      if (splashDone) return;
      splashDone = true;
      clearTimers();
      lockSeq();
      document.body.classList.remove('loading');

      if (prefersReducedMotion()) {
        finishSplash();
        return;
      }

      splash.classList.add('leave');
      document.body.classList.remove(...SP_PHASES);
      document.body.classList.add('sp-leave');
      later(() => document.body.classList.add('stage-in'), T.handoffOverlap);
      later(finishSplash, T.dissolve);
    };

    const leaveSplash = () => {
      if (splashDone) return;
      const cls = splash.classList;

      // 从 logo 相位跳过：需要先快速生长到展开态
      const needGrow =
        !prefersReducedMotion() && !skipping && cls.contains('phase-logo') && !cls.contains('phase-expand');

      if (!needGrow) {
        dissolve();
        return;
      }

      skipping = true;
      clearTimers();
      cls.add('skip');
      setPhase(splash, 'expand');
      lockSeq();
      setHud('READY', 100);
      later(dissolve, T.skipGrow);
    };

    const runSplash = () => {
      if (prefersReducedMotion()) {
        leaveSplash();
        return;
      }

      setPhase(splash, 'logo');
      setHud('SCAN', 18);
      startSeq();
      later(() => {
        setPhase(splash, 'name');
        setHud('LINK', 46);
        later(() => {
          setPhase(splash, 'code');
          setHud('SYNC', 72);
          typeLines(0);
        }, T.codeDelay);
      }, T.nameDelay);
    };

    // logo 加载完成即开始（最多等 2.5s）
    const logoEl = logoRef.current;
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
      logoEl.addEventListener('load', go, { once: true });
      logoEl.addEventListener('error', go, { once: true });
      window.setTimeout(go, T.logoReadyMaxWait);
    };
    startWhenLogoReady();

    // ---- 滚动封锁 ----
    document.body.classList.add('loading');
    const blockScroll = (e: Event) => {
      if (document.body.classList.contains('loading')) e.preventDefault();
    };
    const blockKeyScroll = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (document.body.classList.contains('loading') && keys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener('wheel', blockScroll, { passive: false });
    window.addEventListener('touchmove', blockScroll, { passive: false });
    window.addEventListener('keydown', blockKeyScroll);

    // ---- 跳过 ----
    const onKeySkip = (e: KeyboardEvent) => {
      if (!splashDone && (e.key === 'Escape' || e.key === 'Enter')) leaveSplash();
    };
    splash.addEventListener('click', leaveSplash);
    window.addEventListener('keydown', onKeySkip);

    // ---- 清理 ----
    return () => {
      if (seqTimer !== null) window.clearInterval(seqTimer);
      clearTimers();
      splash.removeEventListener('click', leaveSplash);
      window.removeEventListener('keydown', onKeySkip);
      window.removeEventListener('wheel', blockScroll);
      window.removeEventListener('touchmove', blockScroll);
      window.removeEventListener('keydown', blockKeyScroll);
      document.body.classList.remove('loading', 'stage-in', 'deco-on', ...SP_PHASES);
    };
  }, []);

  return (
    <div className="splash" id="splash" ref={scope} aria-hidden="true">
      <div className="splash-bg" />

      <div className="wide" aria-hidden="true">
        <div className="wide-guides" />
        <div className="wide-hlines" />
        <div className="wide-scale">
          <span>X:0000</span>
          <span>X:0320</span>
          <span>X:0640</span>
          <span>X:0960</span>
          <span>X:1280</span>
          <span>X:1600</span>
          <span>X:1920</span>
          <span>X:2240</span>
          <span>X:2560</span>
          <span>X:2880</span>
          <span>X:3200</span>
          <span>X:3520</span>
        </div>

        <div className="wide-edge wide-edge-l">
          <span className="we-rail">
            <i />
          </span>
          <span className="we-marks">
            <span>0100</span>
            <span>0200</span>
            <span>0300</span>
            <span>0400</span>
            <span>0500</span>
            <span>0600</span>
            <span>0700</span>
            <span>0800</span>
          </span>
          <span className="we-vtext">SYCYW&nbsp;·&nbsp;INTERFACE&nbsp;LAB&nbsp;·&nbsp;GRID&nbsp;0417</span>
        </div>

        <div className="wide-edge wide-edge-r">
          <span className="we-rail">
            <i />
          </span>
          <span className="we-marks">
            <span>0800</span>
            <span>0700</span>
            <span>0600</span>
            <span>0500</span>
            <span>0400</span>
            <span>0300</span>
            <span>0200</span>
            <span>0100</span>
          </span>
          <span className="we-vtext">CELL&nbsp;ARRAY&nbsp;·&nbsp;REV&nbsp;2.31&nbsp;·&nbsp;LOCK&nbsp;OK</span>
        </div>
      </div>

      <div className="splash-grid" aria-hidden="true" />

      <div className="splash-frame" aria-hidden="true">
        <span className="fr fr-tl" />
        <span className="fr fr-tr" />
        <span className="fr fr-bl" />
        <span className="fr fr-br" />
      </div>

      <div className="splash-rule splash-rule-t" aria-hidden="true" />
      <div className="splash-rule splash-rule-b" aria-hidden="true" />

      <div className="hud" aria-hidden="true">
        <div className="hud-tl">
          <span className="hud-k">STATUS</span>
          <span className="hud-v" ref={hudStatusRef}>
            INIT
          </span>
        </div>
        <div className="hud-tr">
          <span className="hud-k">SEQ</span>
          <span className="hud-v" ref={hudSeqRef}>
            0x0000
          </span>
        </div>
        <div className="hud-bl">
          <span className="hud-k">NODE</span>
          <span className="hud-v">
            SYCYW<span className="hud-coord">&nbsp;/&nbsp;31.23N&nbsp;121.47E</span>
          </span>
        </div>
        <div className="hud-br">
          <span className="hud-v" ref={hudPctRef}>
            000
          </span>
          <span className="hud-bar">
            <i ref={hudBarRef} />
          </span>
        </div>
      </div>

      <div className="splash-content">
        <div className="splash-stage">
          <div className="splash-side splash-side-left">
            <span className="side-no">02</span>
            <span className="side-title">交互研究</span>
            <span className="side-sub">INTERACTION</span>
          </div>

          <div className="splash-logo-wrap">
            <span className="reticle" aria-hidden="true">
              <i className="rt rt-tl" />
              <i className="rt rt-tr" />
              <i className="rt rt-bl" />
              <i className="rt rt-br" />
              <i className="rt-tick rt-tick-t" />
              <i className="rt-tick rt-tick-b" />
              <i className="rt-tick rt-tick-l" />
              <i className="rt-tick rt-tick-r" />
            </span>
            {/* 尺寸与 legacy 一致，由 CSS 控制显示宽度，故不用 next/image 的布局接管 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="splash-logo"
              src="/assets/logo.png"
              alt=""
              width={1000}
              height={1000}
              decoding="async"
              ref={logoRef}
            />
          </div>

          <div className="splash-side splash-side-right">
            <span className="side-no">05</span>
            <span className="side-title">动效编排</span>
            <span className="side-sub">MOTION</span>
          </div>

          {PANELS.map((panel) => (
            <div className={`panel panel-${panel.side}`} aria-hidden="true" key={panel.side}>
              <span className="panel-rail">
                <i />
                <span className="panel-seq">{panel.rail.seq}</span>
              </span>
              <div className="panel-body">
                <span className="panel-label">{panel.label}</span>
                <span className="panel-bars">
                  {panel.bars.map((w) => (
                    <i key={w} style={{ '--w': `${w}%` } as React.CSSProperties} />
                  ))}
                </span>
                <span className="panel-hex">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="panel-read">
                  {panel.read.map((r) => (
                    <span key={r.k}>
                      <b>{r.k}</b>
                      <em>{r.v}</em>
                    </span>
                  ))}
                </span>
                <span className="panel-foot">{panel.foot}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="splash-meta">
          <div className="splash-name">
            <span className="splash-letter">森</span>
            <span className="splash-letter">韵</span>
            <span className="splash-letter">次</span>
            <span className="splash-letter">元</span>
            <span className="splash-letter">坞</span>
          </div>
          <div className="splash-line" />

          <div className="splash-caption">
            <span className="cap-br">[</span>
            <span>MINIMAL&nbsp;SYSTEM&nbsp;/&nbsp;INTERFACE&nbsp;LAB</span>
            <span className="cap-br">]</span>
          </div>
          <div className="splash-code" ref={codeRef} />
        </div>

        <div className="statusbar" aria-hidden="true">
          <div className="sb-main">
            <i className="sb-line" />
            <span className="sb-text">
              <span className="sb-seg">SYSTEM&nbsp;READY</span>
              <span className="sb-dot">·</span>
              <span className="sb-seg">06&nbsp;MODULES</span>
              <span className="sb-dot">·</span>
              <span className="sb-seg">GRID&nbsp;LOCK&nbsp;OK</span>
            </span>
            <i className="sb-line" />
          </div>

          <div className="sb-cols">
            {SB_COLS.map((c) => (
              <span className="sb-col" key={c.k}>
                <b>{c.k}</b>
                <em>{c.v}</em>
              </span>
            ))}
          </div>

          <div className="sb-ticks">
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}