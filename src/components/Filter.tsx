'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useReveal } from './Section';

type Category = { id: string; label: string };

type FilterProps = {
  categories: Category[];
  label: string;
  items: { id: string; categoryId: string; node: ReactNode }[];
};

/**
 * 需求 §11：无 JavaScript 时默认展示全部条目，因此所有条目始终留在 DOM 中，
 * 仅通过 hidden 控制可见性，不做条件卸载。
 * 内部自带 useReveal：条目可能不被任何 Block/页面包裹（如产品页直出），
 * .reveal-item 的 is-visible 需要在此注册，否则永远停留在透明初态。
 */
export default function Filter({ categories, label, items }: FilterProps) {
  const [active, setActive] = useState('all');
  const scope = useRef<HTMLDivElement>(null);
  useReveal(scope);

  return (
    <div ref={scope}>
      <div className="filter-bar" role="group" aria-label={label}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="filter-chip"
            aria-pressed={active === category.id}
            onClick={() => setActive(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {items.map((item) => (
        <div key={item.id} className="filter-item" hidden={active !== 'all' && active !== item.categoryId}>
          {item.node}
        </div>
      ))}
    </div>
  );
}