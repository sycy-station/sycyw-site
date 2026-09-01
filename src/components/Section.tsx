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
/**
 * 卡片网格沿用 .ab-creed 视觉（编号 + 标题 + 说明）。
 * 列数经 --cols 变量传给 CSS，窄屏媒体查询可正常降级为单列。
 */
export function CardGrid({ items, columns = 3 }: { items: CardItem[]; columns?: 2 | 3 | 4 }) {
  return (
    <ol
      className="ab-creed"
      role="list"
      style={{ '--cols': columns } as React.CSSProperties}
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

type PageHeroProps = {
  description: string;
  image: string;
  imageAlt: string;
};

/**
 * 子页首屏：摘要 + 主视觉图（需求 §6.2A/§7.2A/§8.2A/§9.2A）。
 * hero 标题与 PageShell 的 .page-desc 文案一致，故不再重复渲染，
 * 页面保持唯一 h1（.pt-name）。
 */
export function PageHero({ description, image, imageAlt }: PageHeroProps) {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  return (
    <section className="page-hero" ref={scope}>
      <p className="ph-desc reveal-item">{description}</p>
      {/* 尺寸由 CSS 控制，避免 next/image 布局接管黑白编辑式排版 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ph-image reveal-item" src={image} alt={imageAlt} loading="eager" />
    </section>
  );
}

type ProductRowProps = {
  no: string;
  category: string;
  name: string;
  status: string;
  description: string;
  image: string;
  imageAlt: string;
  features: { title: string; description: string }[];
  actions: { label: string; url: string | null }[];
};

/** 产品行：左栏品牌区（编号/分类/名称/状态徽标/产品图）+ 右栏描述与特性列表 */
export function ProductRow({
  no,
  category,
  name,
  status,
  description,
  image,
  imageAlt,
  features,
  actions,
}: ProductRowProps) {
  return (
    <article className="prd-row reveal-item">
      <div className="prd-brand">
        <div className="prd-meta">
          <span className="prd-no">{no}</span>
          <span className="prd-cat">{category}</span>
        </div>
        <h3 className="prd-name">{name}</h3>
        <span className="prd-status">{status}</span>
        {/* 尺寸由 CSS 控制，维持黑白编辑式排版 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="prd-image" src={image} alt={imageAlt} loading="lazy" />
      </div>
      <div className="prd-detail">
        <p className="prd-desc">{description}</p>
        {features.length > 0 && (
          <ul className="prd-feats" role="list">
            {features.map((feature, i) => (
              <li key={feature.title}>
                <span className="prdf-no">{String(i + 1).padStart(2, '0')}</span>
                <div className="prdf-body">
                  <h4 className="prdf-title">{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Actions items={actions} />
      </div>
    </article>
  );
}

type StatusItem = { key: string; no: string; title: string; text: string };

/** 状态行：编号 + 标题 + 说明的紧凑单列列表（构成/福利等轻量条目） */
export function StatusRow({ items }: { items: StatusItem[] }) {
  return (
    <ul className="st-row" role="list">
      {items.map((item) => (
        <li key={item.key} className="reveal-item">
          <span className="st-no">{item.no}</span>
          <div className="st-body">
            <h3 className="st-title">{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

type StepItem = { key: string; step: string; title: string; text: string };

/** 横向步骤条：编号 + 标题 + 说明，多列网格自适应 */
export function Steps({ items }: { items: StepItem[] }) {
  return (
    <ol className="steps" role="list">
      {items.map((item) => (
        <li key={item.key} className="reveal-item">
          <span className="steps-no">{item.step}</span>
          <div className="steps-body">
            <h3 className="steps-title">{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
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