import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Block, Prose, CardGrid, Actions } from '@/components/Section';
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
        items={PRODUCTS.map((product) => ({
          id: product.id,
          categoryId: product.categoryId,
          node: (
            <Block
              key={product.id}
              kicker={product.categoryLabel}
              title={product.name}
            >
              <Prose paragraphs={[product.description]} />
              {product.features.length > 0 && (
                <CardGrid
                  items={product.features.map((feature, fi) => ({
                    key: `${product.id}-${fi}`,
                    no: String(fi + 1).padStart(2, '0'),
                    title: feature.title,
                    text: feature.description,
                  }))}
                />
              )}
              <Actions
                items={[product.primaryAction, product.secondaryAction]
                  .filter((action): action is NonNullable<typeof action> => Boolean(action))
                  .map((action) => ({ label: action.label, url: action.url }))}
              />
            </Block>
          ),
        }))}
      />
    </PageShell>
  );
}