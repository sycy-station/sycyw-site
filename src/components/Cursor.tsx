'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/motion/gsap';
import { readCursorPos } from '@/motion/cursorSignal';

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const setX = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3' });
    const setY = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3' });
    let live = false;

    // legacy readCursorPos：上一页点击处跨页落位（2500ms 有效，读即删）
    const saved = readCursorPos();
    if (saved) {
      live = true;
      gsap.set(el, { x: saved.x, y: saved.y });
      document.body.classList.add('has-custom-cursor');
      el.classList.add('is-live');
    }

    const onMove = (e: MouseEvent) => {
      if (!live) {
        live = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        document.body.classList.add('has-custom-cursor');
        el.classList.add('is-live');
      }
      setX(e.clientX);
      setY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      el.classList.toggle('hovering', !!target?.closest('a, button'));
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  return <div className="cursor" ref={ref} aria-hidden="true" />;
}
