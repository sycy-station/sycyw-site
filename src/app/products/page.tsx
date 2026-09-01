import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import { PageHero, ProductBlock } from '@/components/Section';
import { getPage } from '@/data/pages';
import { PRODUCT_HERO, PRODUCTS } from '@/data/products';

const page = getPage('products');

export const metadata: Metadata = {
  title: page.title,
  description: page.seoDescription,
  alternates: { canonical: page.canonicalPath },
  openGraph: {
    title: `${page.title} — 森韵次元坞`,
    description: page.seoDescription,
    url: page.canonicalPath,
    images: [{ url: PRODUCT_HERO.heroImage, alt: PRODUCT_HERO.heroImageAlt }],
  },
};

export default function ProductsPage() {
  return (
    <PageShell page={page}>
      <PageHero
        description={PRODUCT_HERO.heroDescription}
        image={PRODUCT_HERO.heroImage}
        imageAlt={PRODUCT_HERO.heroImageAlt}
      />

      {/* 产品索引：锚点跳转到各产品分区 */}
      <nav className="pb-index" aria-label="产品索引">
        {PRODUCTS.map((product, i) => (
          <Link
            key={product.id}
            href={`#${product.id}`}
            className="pb-index-item reveal-item"
          >
            <span className="pbi-no">{String(i + 1).padStart(2, '0')}</span>
            <span className="pbi-name">{product.name}</span>
            <span className="pbi-cat">{product.categoryLabel}</span>
            {product.status && <span className="pbi-status">{product.status}</span>}
          </Link>
        ))}
      </nav>

      {PRODUCTS.map((product, i) => (
        <ProductBlock
          key={product.id}
          no={String(i + 1).padStart(2, '0')}
          id={product.id}
          category={product.categoryLabel}
          name={product.name}
          tagline={product.tagline}
          status={product.status}
          description={product.description}
          image={product.image}
          imageAlt={product.imageAlt}
          features={product.features}
          actions={[product.primaryAction, product.secondaryAction]
            .filter((action): action is NonNullable<typeof action> => Boolean(action))
            .map((action) => ({ label: action.label, url: action.url }))}
          specGroups={product.specGroups}
          specNote={product.specNote}
        />
      ))}
    </PageShell>
  );
}