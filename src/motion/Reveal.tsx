'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, useGSAP, prefersReducedMotion, TIMING } from './gsap';

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
  y?: number;
  /** 子元素选择器，命中则逐个揭示；缺省则整体揭示 */
  items?: string;
};

export default function Reveal({
  children,
  as: Tag = 'div',
  className,
  stagger = 0.08,
  y = 24,
  items,
}: RevealProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const targets = items ? Array.from(root.querySelectorAll(items)) : [root];
      if (!targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: 'transform' });
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: TIMING.reveal * 2,
          stagger,
          clearProps: 'transform',
          scrollTrigger: {
            trigger: root,
            start: 'top 85%',
            once: true,
          },
        },
      );
    },
    { scope, dependencies: [items, stagger, y] },
  );

  return (
    <Tag ref={scope} className={className}>
      {children}
    </Tag>
  );
}
