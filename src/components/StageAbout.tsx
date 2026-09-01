'use client';

import { useEffect, useRef } from 'react';
import { PAGES } from '@/data/pages';
import { prefersReducedMotion, TIMING } from '@/motion/gsap';
import { trackVisit, type VisitStat } from '@/motion/visit';

/**
 * legacy script.js 中的 aboutData（index.html #aboutData JSON），
 * rules: refreshMin=4 / dwellMin=3min / awayMin=7天 / night 1~5点
 */
const ABOUT_DATA = {
  lines: {
    pool: [
      '少即是多，但少很难',
      '克制本身就是一种表达',
      '每一处间距都被认真想过',
      '好的界面不需要解释自己',
    ],
    quips: {
      refresh: '这句会变，其他不会',
      allSeen: '六页都看过了，接下来是底部',
      dwell: '你已经在这里三分钟了',
      away: '隔了一周，这里还是这样',
      night: '这个时间还在看排版',
    },
  },
  rules: {
    refreshMin: 4,
    dwellMin: 180000,
    awayMin: 604800000,
    nightFrom: 1,
    nightTo: 5,
  },
} as const;

/** 与 legacy pickAbout 完全一致的文案挑选规则 */
function pickAbout(canon: string, stat: VisitStat, pageTotal: number): string {
  const { pool, quips } = ABOUT_DATA.lines;
  const r = ABOUT_DATA.rules;
  if (stat.homeLoads >= r.refreshMin && quips.refresh) return quips.refresh;
  if (stat.visits <= 1) return canon;
  if (pageTotal && stat.seen.length >= pageTotal && quips.allSeen) return quips.allSeen;
  if (stat.dwell >= r.dwellMin && quips.dwell) return quips.dwell;
  if (stat.away >= r.awayMin && quips.away) return quips.away;
  const h = new Date().getHours();
  if (h >= r.nightFrom && h <= r.nightTo && quips.night) return quips.night;
  return pool[(stat.visits - 2) % pool.length];
}

export default function StageAbout({ active }: { active: boolean }) {
  const hostRef = useRef<HTMLHeadingElement>(null);
  const nodeRef = useRef<Text | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const typeLayer = host.querySelector<HTMLElement>('.sa-type');
    const canon = host.getAttribute('data-canon') || '';
    if (!typeLayer || !canon) return;

    // legacy: max-height 590px 视口直接不开启打字层
    if (window.matchMedia('(max-height: 590px)').matches) return;

    // legacy initVisit：slug 取 html data-slug（首页为空串，不计入 seen）；
    // 返场（nav-back）不计入 homeLoads
    const isBack = document.documentElement.classList.contains('nav-back');
    const stat = trackVisit(document.documentElement.getAttribute('data-slug') ?? '', true, isBack);
    const pageTotal = PAGES.length;
    const text = pickAbout(canon, stat, pageTotal);
    typeLayer.setAttribute('data-full', text);

    // 与 legacy 一致：切到打字层后 sa-real 转为屏幕阅读器文本
    document.body.classList.add('has-typed-about');

    // 打字层骨架：<span class="sa-typed"><textNode + caret></span>
    typeLayer.textContent = '';
    const wrap = document.createElement('span');
    wrap.className = 'sa-typed';
    const node = document.createTextNode('');
    const caret = document.createElement('span');
    caret.className = 'sa-caret';
    caret.textContent = '_';
    wrap.appendChild(node);
    wrap.appendChild(caret);
    typeLayer.appendChild(wrap);
    nodeRef.current = node;

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const typeNow = () => {
      let i = 0;
      const step = () => {
        if (i > text.length) return;
        node.textContent = text.slice(0, i);
        i += 1;
        const prev = text.charAt(i - 2);
        // 逗号/顿号后额外停顿 260ms，与 legacy 相同
        const pause = prev === '，' || prev === '、' ? 260 : 0;
        timers.push(window.setTimeout(step, 110 + Math.random() * 50 - 25 + pause));
      };
      step();
    };

    if (prefersReducedMotion()) {
      node.textContent = text;
      return;
    }

    // legacy: 返场走 aboutTypeBack（820ms），首次开场走 aboutType（520ms）
    const backNo = document.documentElement.getAttribute('data-back-no');
    if (active) {
      later(typeNow, backNo !== null ? TIMING.aboutTypeBack : TIMING.aboutType);
    }

    return () => {
      timers.forEach(clearTimeout);
      document.body.classList.remove('has-typed-about');
    };
  }, [active]);

  return (
    <h1
      className="stage-about"
      ref={hostRef}
      data-canon="设计与工程之间没有边界"
    >
      <span className="sa-real">设计与工程之间没有边界</span>
      <span className="sa-type" aria-hidden="true" data-full="" />
    </h1>
  );
}