import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { ProductRow } from '@/components/Section';
import Filter from '@/components/Filter';
import { getPage } from '@/data/pages';
import { PRODUCT_CATEGORIES, PRODUCTS } from '@/data/products';

const page = getPage('products');

export const metadata: Metadata = {
  title: page.title,
  description: page.seoDescription,
  alternates: { canonical: page.canonicalPath },
};

export default function ProductsPage() {
  return (
    <PageShell page={page}>
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