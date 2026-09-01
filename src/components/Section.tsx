'use client';

import { useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useGSAP, prefersReducedMotion } from '@/motion/gsap';

/**
 * 与 legacy page.css 的 .ab-block 体系对齐：
 * .ab-block > .ab-head(.ab-kicker/.ab-title) + .ab-prose / .ab-creed / .ab-timeline。
 * .reveal-line/.reveal-item 的 is-visible 由 IntersectionObserver 驱动
 * （legacy initReveal 机制），统一在 BlockList 挂载时注册。
 */

/** legacy initReveal：进入视口 20% 时挂 is-visible，一次性 */
export function useReveal(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const els = scope.current?.querySelectorAll<HTMLElement>(
        '.reveal-line:not(.is-visible), .reveal-item:not(.is-visible)',
      );
      if (!els?.length) return;

      if (prefersReducedMotion()) {
        els.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -40px 0px' },
      );
      els.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    },
    { scope, dependencies: [] },
  );
}

type BlockProps = {
  /** 英文小标（如 OUR STORY），渲染在 .ab-kicker */
  kicker: string;
  title: string;
  children: ReactNode;
};

export function Block({ kicker, title, children }: BlockProps) {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  return (
    <section className="ab-block" ref={scope}>
      <header className="ab-head">
        <span className="ab-kicker">{kicker}</span>
        <h2 className="ab-title">{title}</h2>
      </header>
      {children}
    </section>
  );
}

export function Prose({ paragraphs, lead }: { paragraphs: string[]; lead?: string }) {
  return (
    <div className="ab-prose">
      {lead && <p className="ab-lead reveal-item">{lead}</p>}
      {paragraphs.map((text, i) => (
        <p key={i} className="reveal-item">
          {text}
        </p>
      ))}
    </div>
  );
}

type CreedItem = { no: string; title: string; text: string };

/** legacy .ab-creed：三列准则（编号 + 标题 + 说明） */
export function Creed({ items }: { items: CreedItem[] }) {
  return (
    <ol className="ab-creed" role="list">
      {items.map((item) => (
        <li key={item.no} className="reveal-item">
          <span className="abc-no">{item.no}</span>
          <div className="abc-body">
            <h3 className="abc-title">{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

type TimelineNode = {
  year: string;
  title: string;
  text: string;
  isNow?: boolean;
};

/** legacy .ab-timeline：年份在左轨的节点时间线 */
export function Timeline({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <ol className="ab-timeline" role="list">
      {nodes.map((node) => (
        <li key={`${node.year}-${node.title}`} className={`ab-node reveal-item${node.isNow ? ' is-now' : ''}`}>
          <span className="abn-year">{node.year}</span>
          <div className="abn-body">
            <h3 className="abn-title">{node.title}</h3>
            <p>{node.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

type CardItem = {
  key: string;
  no?: string;
  title: string;
  text: string;
  extra?: ReactNode;
};
/** 卡片网格沿用 .ab-creed 视觉（编号 + 标题 + 说明），非固定三列 */
export function CardGrid({ items, columns = 3 }: { items: CardItem[]; columns?: 2 | 3 | 4 }) {
  return (
    <ol
      className="ab-creed"
      role="list"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <li key={item.key} className="reveal-item">
          {item.no && <span className="abc-no">{item.no}</span>}
          <div className="abc-body">
            <h3 className="abc-title">{item.title}</h3>
            <p>{item.text}</p>
          </div>
          {item.extra}
        </li>
      ))}
    </ol>
  );
}

export function Empty({ title, note }: { title?: string; note: string }) {
  return (
    <div className="ab-empty reveal-item">
      {title && <p className="ab-empty-title">{title}</p>}
      <p>{note}</p>
    </div>
  );
}

export function Actions({ items }: { items: { label: string; url: string | null }[] }) {
  const usable = items.filter((item) => Boolean(item.url)) as { label: string; url: string }[];
  if (!usable.length) return null;

  return (
    <div className="abc-actions reveal-item">
      {usable.map((item) => {
        const external = /^https?:\/\//.test(item.url);
        return external ? (
          <a
            key={item.label}
            href={item.url}
            className="abc-action"
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.label}
          </a>
        ) : (
          <Link key={item.label} href={item.url} className="abc-action">
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}