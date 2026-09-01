import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { PageHero, ProductRow } from '@/components/Section';
import Filter from '@/components/Filter';
import { getPage } from '@/data/pages';
import { PRODUCT_CATEGORIES, PRODUCT_HERO, PRODUCTS } from '@/data/products';

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

      <Filter
        label="产品分类"
        categories={[...PRODUCT_CATEGORIES].sort((a, b) => a.order - b.order)}
        items={PRODUCTS.map((product, i) => ({
          id: product.id,
          categoryId: product.categoryId,
          node: (
            <ProductRow
              key={product.id}
              no={String(i + 1).padStart(2, '0')}
              category={product.categoryLabel}
              name={product.name}
              status={product.status ?? '—'}
              description={product.description}
              image={product.image}
              imageAlt={product.imageAlt}
              features={product.features.map((feature) => ({
                title: feature.title,
                description: feature.description,
              }))}
              actions={[product.primaryAction, product.secondaryAction]
                .filter((action): action is NonNullable<typeof action> => Boolean(action))
                .map((action) => ({ label: action.label, url: action.url }))}
            />
          ),
        }))}
      />
    </PageShell>
  );
}