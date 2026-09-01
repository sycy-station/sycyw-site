import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/data/site';
import { PAGES } from '@/data/pages';

export const dynamic = 'force-static';

/** 需求 §14：sitemap 只包含首页和 4 个正式分页面 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    ...PAGES.map((page) => ({
      url: `${SITE_URL}${page.canonicalPath}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}