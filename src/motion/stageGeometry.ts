'use client';

/**
 * legacy script.js L802-830 的几何辅助函数（travel 离场与 nav-back 返场共用）。
 * 全部操作真实 DOM，仅在客户端事件/效果中调用。
 */

/** legacy seamPoint：探测分页标题排版基准点（--title-left/--title-top，body 上定位） */
export function seamPoint(): { left: number; top: number } {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;left:var(--title-left);top:var(--title-top);' +
    'width:0;height:0;pointer-events:none;visibility:hidden';
  document.body.appendChild(probe);
  const r = probe.getBoundingClientRect();
  probe.remove();
  return { left: r.left, top: r.top };
}

/** legacy tiltOf：读取轨道项的 --tilt 自定义属性 */
export function tiltOf(item: HTMLElement): number {
  return parseFloat(getComputedStyle(item).getPropertyValue('--tilt')) || 0;
}

/** legacy localOffsets：临时归零 tilt 测出行偏移，测完恢复 */
export function localOffsets(item: HTMLElement, inner: HTMLElement, lines: HTMLElement[]): number[] {
  const had = item.style.getPropertyValue('--tilt');
  item.style.setProperty('--tilt', '0deg');
  void inner.getBoundingClientRect();
  const base = inner.getBoundingClientRect().left;
  const xs = lines.map((el) => el.getBoundingClientRect().left - base);
  if (had) item.style.setProperty('--tilt', had);
  else item.style.removeProperty('--tilt');
  void inner.getBoundingClientRect();
  return xs;
}

/** legacy originPoint：插入锚点标记取 inner 原点视口坐标 */
export function originPoint(inner: HTMLElement): { left: number; top: number } {
  const had = inner.style.position;
  inner.style.position = 'relative';
  const mark = document.createElement('i');
  mark.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0';
  inner.appendChild(mark);
  const r = mark.getBoundingClientRect();
  mark.remove();
  inner.style.position = had;
  return { left: r.left, top: r.top };
}