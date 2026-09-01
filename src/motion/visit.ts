'use client';

const VISIT_KEY = 'sycyw.visit';
const SESSION_KEY = 'sycyw.session';

type VisitRecord = {
  v: 1;
  visits: number;
  dwell: number;
  lastSeen: number;
  seen: string[];
};

export type VisitStat = {
  visits: number;
  dwell: number;
  seen: string[];
  homeLoads: number;
  away: number;
};

function blankVisit(): VisitRecord {
  return { v: 1, visits: 0, dwell: 0, lastSeen: 0, seen: [] };
}

function readJSON<T>(store: Storage, key: string): T | null {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(store: Storage, key: string, value: unknown) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* 隐私模式下写入失败不影响渲染 */
  }
}

/**
 * 记录一次访问并返回用于文案挑选的统计量。
 * 与 legacy initVisit 等价：会话内首次进入才累加 visits，
 * 首页加载单独计数（返场 nav-back 不计入 homeLoads），
 * seen 仅累计子页 slug（首页 data-slug 为空）。
 */
export function trackVisit(slug: string, isHome: boolean, isBack = false): VisitStat {
  const stored = readJSON<Partial<VisitRecord>>(localStorage, VISIT_KEY);
  const rec: VisitRecord = { ...blankVisit(), ...stored };
  if (rec.v !== 1 || !Array.isArray(rec.seen)) Object.assign(rec, blankVisit());

  const ses = readJSON<{ homeLoads: number; started: number }>(sessionStorage, SESSION_KEY);
  const prevSeen = rec.lastSeen;
  if (!ses) rec.visits += 1;
  if (slug && !rec.seen.includes(slug)) rec.seen.push(slug);
  rec.lastSeen = Date.now();
  writeJSON(localStorage, VISIT_KEY, rec);

  const nextSes = {
    homeLoads: ses?.homeLoads ?? 0,
    started: ses?.started ?? Date.now(),
  };
  // legacy L525：if (isHome && !isBack) nextSes.homeLoads += 1
  if (isHome && !isBack) nextSes.homeLoads += 1;
  writeJSON(sessionStorage, SESSION_KEY, nextSes);

  return {
    visits: rec.visits,
    dwell: rec.dwell,
    seen: rec.seen,
    homeLoads: nextSes.homeLoads,
    away: prevSeen ? Date.now() - prevSeen : 0,
  };
}

/** 累计可见停留时长，返回解绑函数 */
export function trackDwell(): () => void {
  let markAt = document.visibilityState === 'visible' ? Date.now() : 0;

  const flush = () => {
    if (!markAt) return;
    const delta = Date.now() - markAt;
    markAt = Date.now();
    if (delta <= 0) return;
    const cur: VisitRecord = {
      ...blankVisit(),
      ...readJSON<Partial<VisitRecord>>(localStorage, VISIT_KEY),
    };
    cur.dwell += delta;
    writeJSON(localStorage, VISIT_KEY, cur);
  };

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      markAt = Date.now();
    } else {
      flush();
      markAt = 0;
    }
  };

  const timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') flush();
  }, 15000);

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', flush);

  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', flush);
    flush();
  };
}
