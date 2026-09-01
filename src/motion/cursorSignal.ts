'use client';

/**
 * legacy script.js L4-42：跨页光标位置传递。
 * 离场前 saveCursorPos 写入 sessionStorage（ces-cursor，2500ms 有效），
 * 新页面 Cursor 组件挂载时 readCursorPos 取回并直接落位。
 */

const CURSOR_KEY = 'ces-cursor';

const CURSOR_AGE = 2500;

export type CursorSignal = { x: number; y: number };

/** legacy saveCursorPos：仅响应真实点击（detail>0），键盘触发不记录 */
export function saveCursorPos(e: Pick<MouseEvent, 'clientX' | 'clientY' | 'detail'>) {
  if (!e || !e.detail) return;
  try {
    sessionStorage.setItem(CURSOR_KEY, JSON.stringify({ x: e.clientX, y: e.clientY, ts: Date.now() }));
  } catch {
    /* 隐私模式下忽略 */
  }
}

/** legacy readCursorPos：读即删，过期/越界返回 null */
export function readCursorPos(): CursorSignal | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(CURSOR_KEY);
    sessionStorage.removeItem(CURSOR_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let sig: { x?: unknown; y?: unknown; ts?: number };
  try {
    sig = JSON.parse(raw);
  } catch {
    return null;
  }

  const age = Date.now() - (sig.ts ?? 0);
  if (age < 0 || age > CURSOR_AGE) return null;
  if (typeof sig.x !== 'number' || typeof sig.y !== 'number') return null;

  // 边界检查：目标页视口内才复用
  if (sig.x < 0 || sig.y < 0 || sig.x > window.innerWidth || sig.y > window.innerHeight) {
    return null;
  }

  return { x: sig.x, y: sig.y };
}