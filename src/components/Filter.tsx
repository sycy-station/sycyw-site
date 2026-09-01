'use client';

import { useState, type ReactNode } from 'react';

type Category = { id: string; label: string };

type FilterProps = {
  categories: Category[];
  label: string;
  items: { id: string; categoryId: string; node: ReactNode }[];
};

/**
 * 需求 §11：无 JavaScript 时默认展示全部条目，因此所有条目始终留在 DOM 中，
 * 仅通过 hidden 控制可见性，不做条件卸载。
 */
export default function Filter({ categories, label, items }: FilterProps) {
  const [active, setActive] = useState('all');

  return (
    <>
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
    </>
  );
}